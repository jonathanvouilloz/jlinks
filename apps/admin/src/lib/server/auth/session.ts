import type { RequestEvent } from '@sveltejs/kit';
import { db, users, sessions, clients } from '../db';
import { eq, and, gt, or } from 'drizzle-orm';
import type { User, Client } from '@noko/shared/types';

export interface SessionData {
  user: User | null;
  client: Client | null;
  session: { id: string; expires_at: string } | null;
}

export async function getSession(event: RequestEvent): Promise<SessionData> {
  const sessionId = event.cookies.get('session');

  if (!sessionId) {
    return { user: null, client: null, session: null };
  }

  try {
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
    console.error('Session error:', error);
    return { user: null, client: null, session: null };
  }
}

export function requireAuth(sessionData: SessionData) {
  if (!sessionData.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  return null;
}

export function requireClient(sessionData: SessionData) {
  if (!sessionData.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  if (!sessionData.client) {
    return new Response(JSON.stringify({ error: 'Forbidden: No client' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  return null;
}

export function requireSuperAdmin(sessionData: SessionData) {
  if (!sessionData.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  if (sessionData.user.role !== 'super_admin') {
    return new Response(JSON.stringify({ error: 'Forbidden: Super admin required' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  return null;
}
