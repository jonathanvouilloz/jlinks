import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { setCookie, deleteCookie, getCookie } from 'hono/cookie';
import { db, users, sessions, clients, verifications } from '../db';
import { eq, and, gt } from 'drizzle-orm';
import { hashPassword, verifyPassword as verifyPwd } from '../lib/auth';
import { sendPasswordResetEmail } from '../lib/email';
import {
  signInSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  deleteAccountSchema,
} from '../schemas';
import type { AuthVariables } from '../middleware/auth';

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
function getClientIP(c: any): string {
  return c.req.header('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}

export const authRoutes = new Hono<{ Variables: AuthVariables }>()

  // Sign in with email/password - Rate limited: 5 req / 15 min
  .post('/sign-in', zValidator('json', signInSchema), async (c) => {
    // Rate limit check
    const ip = getClientIP(c);
    const rateCheck = checkRateLimit(`sign-in:${ip}`, 5, 15 * 60 * 1000);
    if (!rateCheck.allowed) {
      c.header('Retry-After', String(rateCheck.retryAfter));
      return c.json({ error: `Trop de tentatives. Réessayez dans ${rateCheck.retryAfter} secondes.` }, 429);
    }

    const { email, password } = c.req.valid('json');

    // Find user
    const dbUser = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase()),
      with: { client: true },
    });

    if (!dbUser) {
      return c.json({ error: 'Invalid email or password' }, 401);
    }

    // Verify password (supports both legacy SHA-256 and new scrypt)
    const isValid = await verifyPwd(
      password,
      dbUser.password_hash || '',
      dbUser.password_needs_upgrade || false
    );

    if (!isValid) {
      return c.json({ error: 'Invalid email or password' }, 401);
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
      user_agent: c.req.header('user-agent') || 'unknown',
    } as any);

    // Set session cookie
    setCookie(c, 'session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    return c.json({
      user: {
        id: dbUser.id,
        email: dbUser.email,
        role: dbUser.role,
        client_id: dbUser.client_id,
      },
      client: dbUser.client,
    });
  })

  // Sign out
  .post('/sign-out', async (c) => {
    const sessionId = getCookie(c, 'session');

    if (sessionId) {
      // Delete session from database
      await db.delete(sessions).where(eq(sessions.id, sessionId));
    }

    // Clear cookie
    deleteCookie(c, 'session');

    return c.json({ success: true });
  })

  // Get current session
  .get('/session', async (c) => {
    const sessionId = getCookie(c, 'session');

    if (!sessionId) {
      return c.json({ user: null, client: null });
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
      return c.json({ user: null, client: null });
    }

    return c.json({
      user: {
        id: session.user.id,
        email: session.user.email,
        role: session.user.role,
        client_id: session.user.client_id,
      },
      client: session.user.client,
    });
  })

  // Change password
  .post('/change-password', zValidator('json', changePasswordSchema), async (c) => {
    const sessionId = getCookie(c, 'session');

    if (!sessionId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Find session and user
    const session = await db.query.sessions.findFirst({
      where: eq(sessions.id, sessionId),
      with: { user: true },
    });

    if (!session || new Date(session.expires_at) < new Date()) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { currentPassword, newPassword } = c.req.valid('json');
    const dbUser = session.user;

    // Verify current password
    const isValid = await verifyPwd(
      currentPassword,
      dbUser.password_hash || '',
      dbUser.password_needs_upgrade || false
    );

    if (!isValid) {
      return c.json({ error: 'Current password is incorrect' }, 401);
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

    return c.json({ success: true });
  })

  // Forgot password - Rate limited: 3 req / hour
  .post('/forgot-password', zValidator('json', forgotPasswordSchema), async (c) => {
    // Rate limit check
    const ip = getClientIP(c);
    const rateCheck = checkRateLimit(`forgot:${ip}`, 3, 60 * 60 * 1000);
    if (!rateCheck.allowed) {
      c.header('Retry-After', String(rateCheck.retryAfter));
      return c.json({ error: `Trop de demandes. Réessayez dans ${Math.ceil(rateCheck.retryAfter! / 60)} minutes.` }, 429);
    }

    const { email } = c.req.valid('json');

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
    return c.json({ success: true });
  })

  // Reset password - Rate limited: 5 req / hour
  .post('/reset-password', zValidator('json', resetPasswordSchema), async (c) => {
    // Rate limit check
    const ip = getClientIP(c);
    const rateCheck = checkRateLimit(`reset:${ip}`, 5, 60 * 60 * 1000);
    if (!rateCheck.allowed) {
      c.header('Retry-After', String(rateCheck.retryAfter));
      return c.json({ error: `Trop de tentatives. Réessayez dans ${Math.ceil(rateCheck.retryAfter! / 60)} minutes.` }, 429);
    }

    const { token, newPassword } = c.req.valid('json');

    // Find valid verification token
    const now = new Date().toISOString();
    const verification = await db.query.verifications.findFirst({
      where: and(
        eq(verifications.value, token),
        gt(verifications.expires_at, now)
      ),
    });

    if (!verification) {
      return c.json({ error: 'Invalid or expired reset token' }, 400);
    }

    // Find user by email
    const user = await db.query.users.findFirst({
      where: eq(users.email, verification.identifier),
    });

    if (!user) {
      return c.json({ error: 'User not found' }, 400);
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

    return c.json({ success: true });
  })

  // Delete account - Rate limited: 3 req / hour
  .delete('/account', zValidator('json', deleteAccountSchema), async (c) => {
    // Rate limit check
    const ip = getClientIP(c);
    const rateCheck = checkRateLimit(`delete:${ip}`, 3, 60 * 60 * 1000);
    if (!rateCheck.allowed) {
      c.header('Retry-After', String(rateCheck.retryAfter));
      return c.json({ error: `Trop de tentatives. Réessayez dans ${Math.ceil(rateCheck.retryAfter! / 60)} minutes.` }, 429);
    }

    const sessionId = getCookie(c, 'session');

    if (!sessionId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Find session and user
    const session = await db.query.sessions.findFirst({
      where: eq(sessions.id, sessionId),
      with: { user: true },
    });

    if (!session || new Date(session.expires_at) < new Date()) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { password } = c.req.valid('json');
    const dbUser = session.user;

    // Verify password
    const isValid = await verifyPwd(
      password,
      dbUser.password_hash || '',
      dbUser.password_needs_upgrade || false
    );

    if (!isValid) {
      return c.json({ error: 'Invalid password' }, 401);
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
    deleteCookie(c, 'session');

    return c.json({ success: true });
  });

// Re-export hashPassword for use in seed/admin
export { hashPassword };
