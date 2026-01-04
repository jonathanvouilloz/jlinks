import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db, clients } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { getSession, requireSuperAdmin } from '$lib/server/auth/session';
import { updateClientSchema } from '$lib/schemas';

export const GET: RequestHandler = async (event) => {
  const sessionData = await getSession(event);
  const authError = requireSuperAdmin(sessionData);
  if (authError) return authError;

  const { id } = event.params;

  const client = await db.query.clients.findFirst({
    where: eq(clients.id, id),
    with: {
      links: {
        orderBy: (links, { asc }) => [asc(links.sort_order)],
      },
    },
  });

  if (!client) {
    return json({ error: 'Client not found' }, { status: 404 });
  }

  return json(client);
};

export const PUT: RequestHandler = async (event) => {
  const sessionData = await getSession(event);
  const authError = requireSuperAdmin(sessionData);
  if (authError) return authError;

  const { id } = event.params;
  const body = await event.request.json();
  const result = updateClientSchema.safeParse(body);

  if (!result.success) {
    return json({ error: 'Invalid input', details: result.error.flatten() }, { status: 400 });
  }

  const data = result.data;
  const client = await db.query.clients.findFirst({
    where: eq(clients.id, id),
  });

  if (!client) {
    return json({ error: 'Client not found' }, { status: 404 });
  }

  if (data.slug && data.slug !== client.slug) {
    const existing = await db.query.clients.findFirst({
      where: eq(clients.slug, data.slug.toLowerCase()),
    });

    if (existing) {
      return json({ error: 'Slug is already taken' }, { status: 400 });
    }
  }

  const [updated] = await db
    .update(clients)
    .set({
      ...data,
      slug: data.slug?.toLowerCase(),
      updated_at: new Date().toISOString(),
    } as any)
    .where(eq(clients.id, id))
    .returning();

  return json(updated);
};

export const DELETE: RequestHandler = async (event) => {
  const sessionData = await getSession(event);
  const authError = requireSuperAdmin(sessionData);
  if (authError) return authError;

  const { id } = event.params;

  const client = await db.query.clients.findFirst({
    where: eq(clients.id, id),
  });

  if (!client) {
    return json({ error: 'Client not found' }, { status: 404 });
  }

  await db.delete(clients).where(eq(clients.id, id));

  return json({ success: true });
};
