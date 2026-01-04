import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db, users } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { verifyPassword, hashPassword } from '$lib/server/auth/password';
import { getSession } from '$lib/server/auth/session';
import { changePasswordSchema } from '$lib/schemas';

export const POST: RequestHandler = async (event) => {
  const sessionData = await getSession(event);

  if (!sessionData.user) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await event.request.json();
  const result = changePasswordSchema.safeParse(body);

  if (!result.success) {
    return json({ error: 'Invalid input', details: result.error.flatten() }, { status: 400 });
  }

  const { currentPassword, newPassword } = result.data;
  
  const dbUser = await db.query.users.findFirst({
    where: eq(users.id, sessionData.user.id)
  });

  if (!dbUser) {
    return json({ error: 'User not found' }, { status: 404 });
  }

  const valid = await verifyPassword(
    currentPassword,
    dbUser.password_hash || '',
    dbUser.password_needs_upgrade || false
  );

  if (!valid) {
    return json({ error: 'Current password is incorrect' }, { status: 401 });
  }

  const newHash = await hashPassword(newPassword);

  await db
    .update(users)
    .set({
      password_hash: newHash,
      password_needs_upgrade: false,
      updated_at: new Date().toISOString(),
    })
    .where(eq(users.id, dbUser.id));

  return json({ success: true });
};
