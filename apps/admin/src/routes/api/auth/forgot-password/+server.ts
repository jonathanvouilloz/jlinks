import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db, users, verifications } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { forgotPasswordSchema } from '$lib/schemas';
import { sendPasswordResetEmail } from '$lib/server/email';

// Rate limiting
const attempts = new Map<string, { count: number; resetAt: number }>();

export const POST: RequestHandler = async (event) => {
  const ip = event.getClientAddress();
  const current = attempts.get(ip);
  if (current && current.count >= 3 && Date.now() < current.resetAt) {
     return json({ error: 'Too many attempts' }, { status: 429 });
  }

  const body = await event.request.json();
  const result = forgotPasswordSchema.safeParse(body);

  if (!result.success) {
    return json({ error: 'Invalid email' }, { status: 400 });
  }

  const { email } = result.data;

  const user = await db.query.users.findFirst({
    where: eq(users.email, email.toLowerCase()),
  });

  if (user) {
    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await db.delete(verifications).where(eq(verifications.identifier, email.toLowerCase()));

    await db.insert(verifications).values({
      id: crypto.randomUUID(),
      identifier: email.toLowerCase(),
      value: token,
      expires_at: expiresAt.toISOString(),
    });

    // Don't await email to avoid blocking
    sendPasswordResetEmail(email.toLowerCase(), token).catch(console.error);
  }
  
  // Update rate limit
  const nextReset = Date.now() + 60 * 60 * 1000;
  if (!current || Date.now() > current.resetAt) {
      attempts.set(ip, { count: 1, resetAt: nextReset });
  } else {
      attempts.set(ip, { count: current.count + 1, resetAt: current.resetAt });
  }

  return json({ success: true });
};
