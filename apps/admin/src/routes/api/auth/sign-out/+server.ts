import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db, sessions } from '$lib/server/db';
import { eq } from 'drizzle-orm';

export const POST: RequestHandler = async (event) => {
  const sessionId = event.cookies.get('session');

  if (sessionId) {
    await db.delete(sessions).where(eq(sessions.id, sessionId));
  }

  event.cookies.delete('session', { path: '/' });

  return json({ success: true });
};
