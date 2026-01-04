import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db, users, verifications, sessions } from '$lib/server/db';
import { eq, and, gt } from 'drizzle-orm';
import { hashPassword } from '$lib/server/auth/password';
import { resetPasswordSchema } from '$lib/schemas';

export const POST: RequestHandler = async (event) => {
  const body = await event.request.json();
  const result = resetPasswordSchema.safeParse(body);

  if (!result.success) {
    return json({ error: 'Invalid input' }, { status: 400 });
  }

  const { token, newPassword } = result.data;
  const now = new Date().toISOString();

  const verification = await db.query.verifications.findFirst({
    where: and(
      eq(verifications.value, token),
      gt(verifications.expires_at, now)
    ),
  });

  if (!verification) {
    return json({ error: 'Invalid or expired reset token' }, { status: 400 });
  }

  const user = await db.query.users.findFirst({
    where: eq(users.email, verification.identifier),
  });

  if (!user) {
    return json({ error: 'User not found' }, { status: 400 });
  }

  const newHash = await hashPassword(newPassword);

  await db
    .update(users)
    .set({
      password_hash: newHash,
      password_needs_upgrade: false,
      updated_at: new Date().toISOString(),
    })
    .where(eq(users.id, user.id));

  await db.delete(verifications).where(eq(verifications.id, verification.id));
  await db.delete(sessions).where(eq(sessions.user_id, user.id));

  return json({ success: true });
};
