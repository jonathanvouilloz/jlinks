import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db, links, clients } from '$lib/server/db';
import { eq, and } from 'drizzle-orm';
import { getSession, requireClient } from '$lib/server/auth/session';

export const POST: RequestHandler = async (event) => {
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

  const [updated] = await db
    .update(links)
    .set({
      is_active: !link.is_active,
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
