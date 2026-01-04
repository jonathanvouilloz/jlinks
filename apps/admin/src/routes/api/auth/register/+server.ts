import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db, users, clients, sessions, links } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { hashPassword } from '$lib/server/auth/password';
import { registerSchema } from '$lib/schemas';

const registerAttempts = new Map<string, { count: number; resetAt: number }>();

export const POST: RequestHandler = async (event) => {
  const ip = event.getClientAddress();

  // Rate limiting
  const attempts = registerAttempts.get(ip);
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

  try {
    const body = await event.request.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return json({ error: 'Validation error', details: result.error.format() }, { status: 400 });
    }

    const { email, password, slug, socialLinks } = result.data;

    // Check email
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase())
    });

    if (existingUser) {
      return json({ error: 'Email already exists' }, { status: 400 });
    }

    // Check slug
    const existingClient = await db.query.clients.findFirst({
      where: eq(clients.slug, slug.toLowerCase())
    });

    if (existingClient) {
      return json({ error: 'Slug already taken' }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);

    // Transaction
    const { user, client } = await db.transaction(async (tx) => {
      // Create Client
      const [newClient] = await tx.insert(clients).values({
        slug: slug.toLowerCase(),
        name: slug, // Default name is slug
        plan: 'pro', // Default plan
        is_published: false,
        layout_type: 'list',
        button_style: 'rounded',
      }).returning();

      // Create User
      const [newUser] = await tx.insert(users).values({
        id: crypto.randomUUID(),
        email: email.toLowerCase(),
        password_hash: passwordHash,
        client_id: newClient.id,
        role: 'client',
      }).returning();

      // Create Links
      if (socialLinks && socialLinks.length > 0) {
        await tx.insert(links).values(
          socialLinks.map((link, index) => ({
            client_id: newClient.id,
            title: link.title,
            url: link.url,
            social_preset: link.socialPreset || 'theme',
            sort_order: index,
            is_active: true,
            is_draft: false,
          }))
        );
      }
      
      return { user: newUser, client: newClient };
    });

    // Create session
    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    await db.insert(sessions).values({
      id: sessionId,
      user_id: user.id,
      token: sessionId,
      expires_at: expiresAt,
      ip_address: ip,
      user_agent: event.request.headers.get('user-agent'),
    });

    event.cookies.set('session', sessionId, {
      path: '/',
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
    });

    // Clear rate limit
    registerAttempts.delete(ip);

    return json({ user, client });

  } catch (err) {
    console.error('Registration error:', err);
    // Track failed attempt
    const current = registerAttempts.get(ip) || { count: 0, resetAt: Date.now() + 15 * 60 * 1000 };
    registerAttempts.set(ip, { count: current.count + 1, resetAt: current.resetAt });
    
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};
