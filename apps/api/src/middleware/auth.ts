import { Context, MiddlewareHandler } from 'hono';
import { getCookie } from 'hono/cookie';
import { db, users, sessions, clients } from '../db';
import { eq, and, gt, or } from 'drizzle-orm';
import type { User, Client } from '@noko/shared';

// Type for context variables
export type AuthVariables = {
  user: User | null;
  client: Client | null;
  session: { id: string; expires_at: string } | null;
};

/**
 * Auth middleware - adds user context to requests
 * Extracts session from cookie and validates it
 */
export const authMiddleware: MiddlewareHandler = async (c, next) => {
  // Try to get session from cookie
  let sessionId = getCookie(c, 'session');

  // Fallback: parse raw Cookie header if not found
  if (!sessionId) {
    const cookieHeader = c.req.header('cookie');
    if (cookieHeader) {
      const match = cookieHeader.match(/session=([^;]+)/);
      if (match) {
        sessionId = match[1];
      }
    }
  }

  if (!sessionId) {
    c.set('user', null);
    c.set('client', null);
    c.set('session', null);
    return next();
  }

  try {
    // Get session and check if it's valid
    const now = new Date().toISOString();

    const session = await db.query.sessions.findFirst({
      where: and(
        or(eq(sessions.id, sessionId), eq(sessions.token, sessionId)),
        gt(sessions.expires_at, now)
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
      c.set('user', null);
      c.set('client', null);
      c.set('session', null);
      return next();
    }

    c.set('user', session.user as unknown as User);
    c.set('client', session.user.client as unknown as Client | null);
    c.set('session', {
      id: session.id,
      expires_at: session.expires_at,
    });
  } catch (error) {
    console.error('Auth middleware error:', error);
    c.set('user', null);
    c.set('client', null);
    c.set('session', null);
  }

  return next();
};

/**
 * Require authentication - returns 401 if not authenticated
 */
export const requireAuth: MiddlewareHandler = async (c, next) => {
  const user = c.get('user');
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  return next();
};

/**
 * Require super admin role - returns 403 if not super admin
 */
export const requireSuperAdmin: MiddlewareHandler = async (c, next) => {
  const user = c.get('user');
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  if (user.role !== 'super_admin') {
    return c.json({ error: 'Forbidden: Super admin access required' }, 403);
  }
  return next();
};

/**
 * Require client access - returns 403 if user doesn't have a client
 */
export const requireClient: MiddlewareHandler = async (c, next) => {
  const user = c.get('user');
  const client = c.get('client');
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  if (!client) {
    return c.json({ error: 'Forbidden: No client associated with this user' }, 403);
  }
  return next();
};
