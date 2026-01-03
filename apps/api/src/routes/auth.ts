import { Elysia, t } from 'elysia';
import { db, users, sessions, clients, verifications } from '../db';
import { eq, and, gt } from 'drizzle-orm';
import { hashPassword, verifyPassword as verifyPwd } from '../lib/auth';
import { sendPasswordResetEmail } from '../lib/email';

// Request body types (explicit for Vercel TypeScript compatibility)
interface SignInBody { email: string; password: string }
interface ChangePasswordBody { currentPassword: string; newPassword: string }
interface ForgotPasswordBody { email: string }
interface ResetPasswordBody { token: string; newPassword: string }
interface DeleteAccountBody { password: string }

// Simple in-memory rate limiter
type RateLimitEntry = { count: number; resetAt: number };
const rateLimitStore = new Map<string, RateLimitEntry>();

function checkRateLimit(
  key: string,
  max: number,
  durationMs: number
): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  // Clean up expired entries periodically
  if (rateLimitStore.size > 10000) {
    for (const [k, v] of rateLimitStore) {
      if (v.resetAt < now) rateLimitStore.delete(k);
    }
  }

  if (!entry || entry.resetAt < now) {
    // New window
    rateLimitStore.set(key, { count: 1, resetAt: now + durationMs });
    return { allowed: true };
  }

  if (entry.count >= max) {
    return { allowed: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }

  entry.count++;
  return { allowed: true };
}

// Helper to get client IP (handles proxies)
function getClientIP(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}

export const authRoutes = new Elysia({ prefix: '/auth' })
  // Sign in with email/password - Rate limited: 5 req / 15 min
  .post(
    '/sign-in',
    async ({ body, request, cookie, set }) => {
      // Rate limit check
      const ip = getClientIP(request);
      const rateCheck = checkRateLimit(`sign-in:${ip}`, 5, 15 * 60 * 1000);
      if (!rateCheck.allowed) {
        set.status = 429;
        set.headers['Retry-After'] = String(rateCheck.retryAfter);
        return { error: `Trop de tentatives. Réessayez dans ${rateCheck.retryAfter} secondes.` };
      }

      const { email, password } = body as SignInBody;

      // Find user
      const dbUser = await db.query.users.findFirst({
        where: eq(users.email, email.toLowerCase()),
        with: { client: true },
      });

      if (!dbUser) {
        set.status = 401;
        return { error: 'Invalid email or password' };
      }

      // Verify password (supports both legacy SHA-256 and new scrypt)
      const isValid = await verifyPwd(
        password,
        dbUser.password_hash || '',
        dbUser.password_needs_upgrade || false
      );

      if (!isValid) {
        set.status = 401;
        return { error: 'Invalid email or password' };
      }

      // If password was SHA-256, upgrade to scrypt
      if (dbUser.password_needs_upgrade) {
        const newHash = await hashPassword(password);
        await db
          .update(users)
          .set({
            password_hash: newHash,
            password_needs_upgrade: false,
            updated_at: new Date().toISOString(),
          } as any)
          .where(eq(users.id, dbUser.id));
      }

      // Create session
      const sessionId = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      await db.insert(sessions).values({
        id: sessionId,
        user_id: dbUser.id,
        token: sessionId,
        expires_at: expiresAt.toISOString(),
        ip_address: ip,
        user_agent: request.headers.get('user-agent') || 'unknown',
      } as any);

      // Set session cookie
      cookie.session.set({
        value: sessionId,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/',
      });

      return {
        user: {
          id: dbUser.id,
          email: dbUser.email,
          role: dbUser.role,
          client_id: dbUser.client_id,
        },
        client: dbUser.client,
      };
    },
    {
      body: t.Object({
        email: t.String({ format: 'email' }),
        password: t.String({ minLength: 1 }),
      }),
    }
  )

  // Sign out
  .post('/sign-out', async ({ cookie }) => {
    const sessionId = cookie.session.value as string | undefined;

    if (sessionId) {
      // Delete session from database
      await db.delete(sessions).where(eq(sessions.id, sessionId));
    }

    // Clear cookie
    cookie.session.remove();

    return { success: true };
  })

  // Get current session
  .get('/session', async ({ cookie }) => {
    const sessionId = cookie.session.value as string | undefined;

    if (!sessionId) {
      return { user: null, client: null };
    }

    // Find session and user
    const session = await db.query.sessions.findFirst({
      where: eq(sessions.id, sessionId),
      with: {
        user: {
          with: { client: true },
        },
      },
    });

    if (!session || new Date(session.expires_at) < new Date()) {
      return { user: null, client: null };
    }

    return {
      user: {
        id: session.user.id,
        email: session.user.email,
        role: session.user.role,
        client_id: session.user.client_id,
      },
      client: session.user.client,
    };
  })

  // Change password
  .post(
    '/change-password',
    async ({ body, cookie, set }) => {
      const sessionId = cookie.session.value as string | undefined;

      if (!sessionId) {
        set.status = 401;
        return { error: 'Unauthorized' };
      }

      // Find session and user
      const session = await db.query.sessions.findFirst({
        where: eq(sessions.id, sessionId),
        with: { user: true },
      });

      if (!session || new Date(session.expires_at) < new Date()) {
        set.status = 401;
        return { error: 'Unauthorized' };
      }

      const { currentPassword, newPassword } = body as ChangePasswordBody;
      const dbUser = session.user;

      // Verify current password
      const isValid = await verifyPwd(
        currentPassword,
        dbUser.password_hash || '',
        dbUser.password_needs_upgrade || false
      );

      if (!isValid) {
        set.status = 401;
        return { error: 'Current password is incorrect' };
      }

      // Hash new password with scrypt
      const newHash = await hashPassword(newPassword);

      await db
        .update(users)
        .set({
          password_hash: newHash,
          password_needs_upgrade: false,
          updated_at: new Date().toISOString(),
        } as any)
        .where(eq(users.id, dbUser.id));

      return { success: true };
    },
    {
      body: t.Object({
        currentPassword: t.String({ minLength: 1 }),
        newPassword: t.String({ minLength: 8 }),
      }),
    }
  )

  // Forgot password - Rate limited: 3 req / hour
  .post(
    '/forgot-password',
    async ({ body, request, set }) => {
      // Rate limit check
      const ip = getClientIP(request);
      const rateCheck = checkRateLimit(`forgot:${ip}`, 3, 60 * 60 * 1000);
      if (!rateCheck.allowed) {
        set.status = 429;
        set.headers['Retry-After'] = String(rateCheck.retryAfter);
        return { error: `Trop de demandes. Réessayez dans ${Math.ceil(rateCheck.retryAfter! / 60)} minutes.` };
      }

      const { email } = body as ForgotPasswordBody;

      // Find user (don't reveal if email exists)
      const user = await db.query.users.findFirst({
        where: eq(users.email, email.toLowerCase()),
      });

      if (user) {
        // Generate reset token
        const token = crypto.randomUUID();
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry

        // Delete any existing reset tokens for this user
        await db
          .delete(verifications)
          .where(eq(verifications.identifier, email.toLowerCase()));

        // Store reset token
        await db.insert(verifications).values({
          id: crypto.randomUUID(),
          identifier: email.toLowerCase(),
          value: token,
          expires_at: expiresAt.toISOString(),
        } as any);

        // Send email (async, don't block response)
        sendPasswordResetEmail(email.toLowerCase(), token).catch((err) =>
          console.error('Failed to send reset email:', err)
        );
      }

      // Always return success (don't reveal if email exists)
      return { success: true };
    },
    {
      body: t.Object({
        email: t.String({ format: 'email' }),
      }),
    }
  )

  // Reset password - Rate limited: 5 req / hour
  .post(
    '/reset-password',
    async ({ body, request, set }) => {
      // Rate limit check
      const ip = getClientIP(request);
      const rateCheck = checkRateLimit(`reset:${ip}`, 5, 60 * 60 * 1000);
      if (!rateCheck.allowed) {
        set.status = 429;
        set.headers['Retry-After'] = String(rateCheck.retryAfter);
        return { error: `Trop de tentatives. Réessayez dans ${Math.ceil(rateCheck.retryAfter! / 60)} minutes.` };
      }

      const { token, newPassword } = body as ResetPasswordBody;

      // Find valid verification token
      const now = new Date().toISOString();
      const verification = await db.query.verifications.findFirst({
        where: and(
          eq(verifications.value, token),
          gt(verifications.expires_at, now)
        ),
      });

      if (!verification) {
        set.status = 400;
        return { error: 'Invalid or expired reset token' };
      }

      // Find user by email
      const user = await db.query.users.findFirst({
        where: eq(users.email, verification.identifier),
      });

      if (!user) {
        set.status = 400;
        return { error: 'User not found' };
      }

      // Update password
      const newHash = await hashPassword(newPassword);
      await db
        .update(users)
        .set({
          password_hash: newHash,
          password_needs_upgrade: false,
          updated_at: new Date().toISOString(),
        } as any)
        .where(eq(users.id, user.id));

      // Delete the used token
      await db.delete(verifications).where(eq(verifications.id, verification.id));

      // Invalidate all existing sessions for security
      await db.delete(sessions).where(eq(sessions.user_id, user.id));

      return { success: true };
    },
    {
      body: t.Object({
        token: t.String({ minLength: 1 }),
        newPassword: t.String({ minLength: 8 }),
      }),
    }
  )

  // Delete account - Rate limited: 3 req / hour
  .delete(
    '/account',
    async ({ body, request, cookie, set }) => {
      // Rate limit check
      const ip = getClientIP(request);
      const rateCheck = checkRateLimit(`delete:${ip}`, 3, 60 * 60 * 1000);
      if (!rateCheck.allowed) {
        set.status = 429;
        set.headers['Retry-After'] = String(rateCheck.retryAfter);
        return { error: `Trop de tentatives. Réessayez dans ${Math.ceil(rateCheck.retryAfter! / 60)} minutes.` };
      }

      const sessionId = cookie.session.value as string | undefined;

      if (!sessionId) {
        set.status = 401;
        return { error: 'Unauthorized' };
      }

      // Find session and user
      const session = await db.query.sessions.findFirst({
        where: eq(sessions.id, sessionId),
        with: { user: true },
      });

      if (!session || new Date(session.expires_at) < new Date()) {
        set.status = 401;
        return { error: 'Unauthorized' };
      }

      const { password } = body as DeleteAccountBody;
      const dbUser = session.user;

      // Verify password
      const isValid = await verifyPwd(
        password,
        dbUser.password_hash || '',
        dbUser.password_needs_upgrade || false
      );

      if (!isValid) {
        set.status = 401;
        return { error: 'Invalid password' };
      }

      // Delete in order: sessions -> user -> client (cascade deletes links)
      // Delete all user sessions
      await db.delete(sessions).where(eq(sessions.user_id, dbUser.id));

      // Delete user
      await db.delete(users).where(eq(users.id, dbUser.id));

      // Delete client if exists (this will cascade delete links)
      if (dbUser.client_id) {
        await db.delete(clients).where(eq(clients.id, dbUser.client_id));
      }

      // Clear cookie
      cookie.session.remove();

      return { success: true };
    },
    {
      body: t.Object({
        password: t.String({ minLength: 1 }),
      }),
    }
  );

// Re-export hashPassword for use in seed/admin
export { hashPassword };
