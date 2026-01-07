import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db, users, clients, links, verifications } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { hashPassword } from '$lib/server/auth/password';
import { registerServerSchema } from '$lib/schemas';
import { sendEmailVerificationEmail } from '$lib/server/email';

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
    const result = registerServerSchema.safeParse(body);

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

    // Create email verification token (24 hours expiry)
    const verificationToken = crypto.randomUUID();
    const tokenExpiresAt = new Date();
    tokenExpiresAt.setHours(tokenExpiresAt.getHours() + 24);

    // Delete any existing verification for this email
    await db.delete(verifications).where(eq(verifications.identifier, email.toLowerCase()));

    // Create new verification token
    await db.insert(verifications).values({
      id: crypto.randomUUID(),
      identifier: email.toLowerCase(),
      value: verificationToken,
      expires_at: tokenExpiresAt.toISOString(),
    });

    // Send verification email
    const emailSent = await sendEmailVerificationEmail(email.toLowerCase(), verificationToken);
    if (!emailSent) {
      console.error('Failed to send verification email to:', email);
    }

    // Clear rate limit
    registerAttempts.delete(ip);

    // Return success - no session created until email is verified
    return json({
      success: true,
      requiresVerification: true,
      message: 'Vérifiez votre email pour activer votre compte'
    });

  } catch (err) {
    console.error('Registration error:', err);
    // Track failed attempt
    const current = registerAttempts.get(ip) || { count: 0, resetAt: Date.now() + 15 * 60 * 1000 };
    registerAttempts.set(ip, { count: current.count + 1, resetAt: current.resetAt });
    
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};
