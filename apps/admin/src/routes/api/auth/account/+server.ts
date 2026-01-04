import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db, users, sessions, clients } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { verifyPassword } from '$lib/server/auth/password';
import { getSession } from '$lib/server/auth/session';
import { deleteAccountSchema } from '$lib/schemas';

export const DELETE: RequestHandler = async (event) => {
  const sessionData = await getSession(event);
  if (!sessionData.user) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await event.request.json();
  const result = deleteAccountSchema.safeParse(body);

  if (!result.success) {
    return json({ error: 'Invalid input' }, { status: 400 });
  }

  const { password } = result.data;
  
  const dbUser = await db.query.users.findFirst({
    where: eq(users.id, sessionData.user.id)
  });

  if (!dbUser) {
    return json({ error: 'User not found' }, { status: 404 });
  }

  const valid = await verifyPassword(
    password,
    dbUser.password_hash || '',
    dbUser.password_needs_upgrade || false
  );

  if (!valid) {
    return json({ error: 'Invalid password' }, { status: 401 });
  }

  await db.delete(sessions).where(eq(sessions.user_id, dbUser.id));
  await db.delete(users).where(eq(users.id, dbUser.id));
  if (dbUser.client_id) {
    await db.delete(clients).where(eq(clients.id, dbUser.client_id));
  }

  event.cookies.delete('session', { path: '/' });

  return json({ success: true });
};
