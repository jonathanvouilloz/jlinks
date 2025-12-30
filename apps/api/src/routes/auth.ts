import { Elysia, t } from 'elysia';
import { db, users, sessions, clients } from '../db';
import { eq } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth';

// Simple password hashing (in production, use bcrypt or argon2)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Buffer.from(hash).toString('hex');
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const inputHash = await hashPassword(password);
  return inputHash === hash;
}

function generateSessionId(): string {
  return crypto.randomUUID();
}

function getSessionExpiry(): string {
  const date = new Date();
  date.setDate(date.getDate() + 30); // 30 days
  return date.toISOString();
}

export const authRoutes = new Elysia({ prefix: '/auth' })
  .use(authMiddleware)

  // Sign in with email/password
  .post(
    '/sign-in',
    async ({ body, cookie, error }) => {
      const { email, password } = body;

      // Find user
      const user = await db.query.users.findFirst({
        where: eq(users.email, email.toLowerCase()),
        with: {
          client: true,
        },
      });

      if (!user) {
        return error(401, 'Invalid email or password');
      }

      // Verify password
      const isValid = await verifyPassword(password, user.password_hash);
      if (!isValid) {
        return error(401, 'Invalid email or password');
      }

      // Create session
      const sessionId = generateSessionId();
      const expiresAt = getSessionExpiry();

      await db.insert(sessions).values({
        id: sessionId,
        user_id: user.id,
        expires_at: expiresAt,
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
          id: user.id,
          email: user.email,
          role: user.role,
          client_id: user.client_id,
        },
        client: user.client,
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
  .post('/sign-out', async ({ cookie, session }) => {
    if (session) {
      // Delete session from database
      await db.delete(sessions).where(eq(sessions.id, session.id));
    }

    // Clear cookie
    cookie.session.remove();

    return { success: true };
  })

  // Get current session
  .get('/session', async ({ user, client }) => {
    if (!user) {
      return { user: null, client: null };
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        client_id: user.client_id,
      },
      client,
    };
  })

  // Change password (authenticated)
  .post(
    '/change-password',
    async ({ body, user, error }) => {
      if (!user) {
        return error(401, 'Unauthorized');
      }

      const { currentPassword, newPassword } = body;

      // Get user with password hash
      const dbUser = await db.query.users.findFirst({
        where: eq(users.id, user.id),
      });

      if (!dbUser) {
        return error(404, 'User not found');
      }

      // Verify current password
      const isValid = await verifyPassword(currentPassword, dbUser.password_hash);
      if (!isValid) {
        return error(401, 'Current password is incorrect');
      }

      // Update password
      const newHash = await hashPassword(newPassword);
      await db
        .update(users)
        .set({ password_hash: newHash })
        .where(eq(users.id, user.id));

      return { success: true };
    },
    {
      body: t.Object({
        currentPassword: t.String({ minLength: 1 }),
        newPassword: t.String({ minLength: 8 }),
      }),
    }
  );

// Export password hashing for use in seed/admin
export { hashPassword };
