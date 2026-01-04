import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db, clients, users } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { getSession, requireSuperAdmin } from '$lib/server/auth/session';
import { createClientSchema } from '$lib/schemas';
import { hashPassword } from '$lib/server/auth/password';

export const GET: RequestHandler = async (event) => {
  const sessionData = await getSession(event);
  const authError = requireSuperAdmin(sessionData);
  if (authError) return authError;

  const allClients = await db.query.clients.findMany({
    orderBy: (clients, { desc }) => [desc(clients.created_at)],
  });

  return json(allClients);
};

export const POST: RequestHandler = async (event) => {
  const sessionData = await getSession(event);
  const authError = requireSuperAdmin(sessionData);
  if (authError) return authError;

  const body = await event.request.json();
  const result = createClientSchema.safeParse(body);

  if (!result.success) {
    return json({ error: 'Invalid input', details: result.error.flatten() }, { status: 400 });
  }

  const { slug, name, email, password } = result.data;

  // Check if slug is already taken
  const existing = await db.query.clients.findFirst({
    where: eq(clients.slug, slug.toLowerCase()),
  });

  if (existing) {
    return json({ error: 'Slug is already taken' }, { status: 400 });
  }

  // Check if email is already used
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email.toLowerCase()),
  });

  if (existingUser) {
    return json({ error: 'Email is already in use' }, { status: 400 });
  }

  // Create client and user in transaction
  // Note: Drizzle with LibSQL doesn't support transaction return values well in all versions, 
  // so we'll do it sequentially or use the transaction object but handle return manually if needed.
  // Using sequential for simplicity with better error handling if needed, but transaction is safer.
  
  try {
    const res = await db.transaction(async (tx) => {
      // Create client
      const [newClient] = await tx
        .insert(clients)
        .values({
          slug: slug.toLowerCase(),
          name,
        })
        .returning();

      // Create user
      const passwordHash = await hashPassword(password);
      const [newUser] = await tx
        .insert(users)
        .values({
          id: crypto.randomUUID(),
          email: email.toLowerCase(),
          password_hash: passwordHash,
          client_id: newClient.id,
          role: 'client',
        } as any)
        .returning();

      return {
        client: newClient,
        user: {
          id: newUser.id,
          email: newUser.email,
        },
      };
    });
    return json(res);
  } catch (e) {
      console.error(e);
      return json({ error: 'Failed to create client' }, { status: 500 });
  }
};
