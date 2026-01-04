import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db, users, sessions, clients } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { verifyPassword, hashPassword } from '$lib/server/auth/password';

// Rate limiting (in-memory pour MVP)
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

export const POST: RequestHandler = async (event) => {
  const ip = event.getClientAddress();

  // Rate limiting check
  const attempts = loginAttempts.get(ip);
  if (attempts && attempts.count >= 5 && Date.now() < attempts.resetAt) {
    const retryAfter = Math.ceil((attempts.resetAt - Date.now()) / 1000);
    return new Response(JSON.stringify({ error: 'Too many attempts' }), {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'X-Retry-After': retryAfter.toString()
      }
    });
  }

  const { email, password } = await event.request.json();

  if (!email || !password) {
    return json({ error: 'Email and password required' }, { status: 400 });
  }

  // Find user
  const user = await db.query.users.findFirst({
    where: eq(users.email, email.toLowerCase()),
    with: { client: true },
  });

  if (!user || !user.password_hash) {
    // Track failed attempt
    const current = loginAttempts.get(ip) || { count: 0, resetAt: Date.now() + 15 * 60 * 1000 };
    loginAttempts.set(ip, { count: current.count + 1, resetAt: current.resetAt });
    return json({ error: 'Invalid credentials' }, { status: 401 });
  }

  // Verify password
  const valid = await verifyPassword(password, user.password_hash, user.password_needs_upgrade ?? false);

  if (!valid) {
    const current = loginAttempts.get(ip) || { count: 0, resetAt: Date.now() + 15 * 60 * 1000 };
    loginAttempts.set(ip, { count: current.count + 1, resetAt: current.resetAt });
    return json({ error: 'Invalid credentials' }, { status: 401 });
  }

  // Upgrade password if needed
  if (user.password_needs_upgrade) {
    const newHash = await hashPassword(password);
    await db.update(users)
      .set({ password_hash: newHash, password_needs_upgrade: false })
      .where(eq(users.id, user.id));
  }

  // Create session
  const sessionId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days

  await db.insert(sessions).values({
    id: sessionId,
    user_id: user.id,
    token: sessionId,
    expires_at: expiresAt,
    ip_address: ip,
    user_agent: event.request.headers.get('user-agent'),
  });

  // Set cookie
  event.cookies.set('session', sessionId, {
    path: '/',
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });

  // Clear rate limiting
  loginAttempts.delete(ip);

  return json({
    user: {
      id: user.id,
      email: user.email,
      client_id: user.client_id,
      role: user.role,
      created_at: user.created_at,
    },
    client: user.client,
  });
};
