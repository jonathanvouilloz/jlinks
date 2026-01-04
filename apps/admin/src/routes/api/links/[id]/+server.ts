import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db, links, clients } from '$lib/server/db';
import { eq, and } from 'drizzle-orm';
import { getSession, requireClient } from '$lib/server/auth/session';
import { updateLinkSchema } from '$lib/schemas';

export const GET: RequestHandler = async (event) => {
  const sessionData = await getSession(event);
  const authError = requireClient(sessionData);
  if (authError) return authError;

  const { id } = event.params;
  const client = sessionData.client!;

  const link = await db.query.links.findFirst({
    where: and(eq(links.id, id), eq(links.client_id, client.id)),
  });

  if (!link) {
    return json({ error: 'Link not found' }, { status: 404 });
  }

  return json(link);
};

export const PUT: RequestHandler = async (event) => {
  const sessionData = await getSession(event);
  const authError = requireClient(sessionData);
  if (authError) return authError;

  const { id } = event.params;
  const client = sessionData.client!;
  const body = await event.request.json();
  const result = updateLinkSchema.safeParse(body);

  if (!result.success) {
    return json({ error: 'Invalid input', details: result.error.flatten() }, { status: 400 });
  }

  const data = result.data;

  // Verify ownership
  const link = await db.query.links.findFirst({
    where: and(eq(links.id, id), eq(links.client_id, client.id)),
  });

  if (!link) {
    return json({ error: 'Link not found' }, { status: 404 });
  }

  const [updated] = await db
    .update(links)
    .set({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .where(eq(links.id, id))
    .returning();

  // Mark client as having draft changes
  await db
    .update(clients)
    .set({ has_draft_changes: true, updated_at: new Date().toISOString() })
    .where(eq(clients.id, client.id));

  return json(updated);
};

export const DELETE: RequestHandler = async (event) => {
  const sessionData = await getSession(event);
  const authError = requireClient(sessionData);
  if (authError) return authError;

  const { id } = event.params;
  const client = sessionData.client!;

  // Verify ownership
  const link = await db.query.links.findFirst({
    where: and(eq(links.id, id), eq(links.client_id, client.id)),
  });

  if (!link) {
    return json({ error: 'Link not found' }, { status: 404 });
  }

  await db.delete(links).where(eq(links.id, id));

  // Mark client as having draft changes
  await db
    .update(clients)
    .set({ has_draft_changes: true, updated_at: new Date().toISOString() })
    .where(eq(clients.id, client.id));

  return json({ success: true });
};
