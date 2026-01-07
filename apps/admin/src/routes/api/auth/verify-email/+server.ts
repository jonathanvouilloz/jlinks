import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db, users, verifications, sessions } from '$lib/server/db';
import { eq, and, gt } from 'drizzle-orm';

export const GET: RequestHandler = async (event) => {
  const token = event.url.searchParams.get('token');

  if (!token) {
    return json({ error: 'Token manquant' }, { status: 400 });
  }

  const now = new Date().toISOString();

  // Find valid verification token
  const verification = await db.query.verifications.findFirst({
    where: and(
      eq(verifications.value, token),
      gt(verifications.expires_at, now)
    ),
  });

  if (!verification) {
    return json({ error: 'Lien invalide ou expiré' }, { status: 400 });
  }

  // Find user by email
  const user = await db.query.users.findFirst({
    where: eq(users.email, verification.identifier),
  });

  if (!user) {
    return json({ error: 'Utilisateur non trouvé' }, { status: 400 });
  }

  // Update user as verified
  await db
    .update(users)
    .set({
      emailVerified: true,
      updated_at: new Date().toISOString(),
    })
    .where(eq(users.id, user.id));

  // Delete verification token
  await db.delete(verifications).where(eq(verifications.id, verification.id));

  // Create session
  const sessionId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const ip = event.getClientAddress();

  await db.insert(sessions).values({
    id: sessionId,
    user_id: user.id,
    token: sessionId,
    expires_at: expiresAt,
    ip_address: ip,
    user_agent: event.request.headers.get('user-agent'),
  });

  // Set session cookie
  event.cookies.set('session', sessionId, {
    path: '/',
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60,
  });

  return json({ success: true, verified: true });
};
