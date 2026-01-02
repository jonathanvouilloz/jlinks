import { Elysia, t } from 'elysia';
import { db, users, sessions, clients, verifications } from '../db';
import { eq, and, gt } from 'drizzle-orm';
import { hashPassword, verifyPassword as verifyPwd } from '../lib/auth';
import { sendPasswordResetEmail } from '../lib/email';

export const authRoutes = new Elysia({ prefix: '/auth' })
  // Sign in with email/password
  .post(
    '/sign-in',
    async ({ body, request, cookie, error }) => {
      const { email, password } = body;

      // Find user
      const dbUser = await db.query.users.findFirst({
        where: eq(users.email, email.toLowerCase()),
        with: { client: true },
      });

      if (!dbUser) {
        return error(401, 'Invalid email or password');
      }

      // Verify password (supports both legacy SHA-256 and new scrypt)
      const isValid = await verifyPwd(
        password,
        dbUser.password_hash || '',
        dbUser.password_needs_upgrade || false
      );

      if (!isValid) {
        return error(401, 'Invalid email or password');
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
          })
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
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
      });

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
    const sessionId = cookie.session.value;

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
    const sessionId = cookie.session.value;

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
    async ({ body, cookie, error }) => {
      const sessionId = cookie.session.value;

      if (!sessionId) {
        return error(401, 'Unauthorized');
      }

      // Find session and user
      const session = await db.query.sessions.findFirst({
        where: eq(sessions.id, sessionId),
        with: { user: true },
      });

      if (!session || new Date(session.expires_at) < new Date()) {
        return error(401, 'Unauthorized');
      }

      const { currentPassword, newPassword } = body;
      const dbUser = session.user;

      // Verify current password
      const isValid = await verifyPwd(
        currentPassword,
        dbUser.password_hash || '',
        dbUser.password_needs_upgrade || false
      );

      if (!isValid) {
        return error(401, 'Current password is incorrect');
      }

      // Hash new password with scrypt
      const newHash = await hashPassword(newPassword);

      await db
        .update(users)
        .set({
          password_hash: newHash,
          password_needs_upgrade: false,
          updated_at: new Date().toISOString(),
        })
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

  // Forgot password - request reset email
  .post(
    '/forgot-password',
    async ({ body }) => {
      const { email } = body;

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
        });

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

  // Reset password with token
  .post(
    '/reset-password',
    async ({ body, error }) => {
      const { token, newPassword } = body;

      // Find valid verification token
      const now = new Date().toISOString();
      const verification = await db.query.verifications.findFirst({
        where: and(
          eq(verifications.value, token),
          gt(verifications.expires_at, now)
        ),
      });

      if (!verification) {
        return error(400, 'Invalid or expired reset token');
      }

      // Find user by email
      const user = await db.query.users.findFirst({
        where: eq(users.email, verification.identifier),
      });

      if (!user) {
        return error(400, 'User not found');
      }

      // Update password
      const newHash = await hashPassword(newPassword);
      await db
        .update(users)
        .set({
          password_hash: newHash,
          password_needs_upgrade: false,
          updated_at: new Date().toISOString(),
        })
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

  // Delete account
  .delete(
    '/account',
    async ({ body, cookie, error }) => {
      const sessionId = cookie.session.value;

      if (!sessionId) {
        return error(401, 'Unauthorized');
      }

      // Find session and user
      const session = await db.query.sessions.findFirst({
        where: eq(sessions.id, sessionId),
        with: { user: true },
      });

      if (!session || new Date(session.expires_at) < new Date()) {
        return error(401, 'Unauthorized');
      }

      const { password } = body;
      const dbUser = session.user;

      // Verify password
      const isValid = await verifyPwd(
        password,
        dbUser.password_hash || '',
        dbUser.password_needs_upgrade || false
      );

      if (!isValid) {
        return error(401, 'Invalid password');
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
