import { Elysia } from 'elysia';
import { db, users, sessions, clients } from '../db';
import { eq, and, gt } from 'drizzle-orm';
import type { User, Client } from '@jlinks/shared';

export interface AuthContext {
  user: User | null;
  client: Client | null;
  session: { id: string; expires_at: string } | null;
}

/**
 * Auth middleware - adds user context to requests
 * Extracts session from cookie and validates it
 */
export const authMiddleware = new Elysia({ name: 'auth' })
  .derive(async ({ cookie }): Promise<AuthContext> => {
    const sessionId = cookie.session?.value;

    if (!sessionId) {
      return { user: null, client: null, session: null };
    }

    try {
      // Get session and check if it's valid
      const session = await db.query.sessions.findFirst({
        where: and(
          eq(sessions.id, sessionId),
          gt(sessions.expires_at, new Date().toISOString())
        ),
        with: {
          user: {
            with: {
              client: true,
            },
          },
        },
      });

      if (!session || !session.user) {
        return { user: null, client: null, session: null };
      }

      return {
        user: session.user as unknown as User,
        client: session.user.client as unknown as Client | null,
        session: {
          id: session.id,
          expires_at: session.expires_at,
        },
      };
    } catch (error) {
      console.error('Auth middleware error:', error);
      return { user: null, client: null, session: null };
    }
  });

/**
 * Require authentication - returns 401 if not authenticated
 */
export const requireAuth = new Elysia({ name: 'require-auth' })
  .use(authMiddleware)
  .onBeforeHandle(({ user, error }) => {
    if (!user) {
      return error(401, 'Unauthorized');
    }
  });

/**
 * Require super admin role - returns 403 if not super admin
 */
export const requireSuperAdmin = new Elysia({ name: 'require-super-admin' })
  .use(requireAuth)
  .onBeforeHandle(({ user, error }) => {
    if (user?.role !== 'super_admin') {
      return error(403, 'Forbidden: Super admin access required');
    }
  });

/**
 * Require client access - returns 403 if user doesn't have a client
 */
export const requireClient = new Elysia({ name: 'require-client' })
  .use(requireAuth)
  .onBeforeHandle(({ client, error }) => {
    if (!client) {
      return error(403, 'Forbidden: No client associated with this user');
    }
  });
