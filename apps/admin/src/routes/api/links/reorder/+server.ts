import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db, links, clients } from '$lib/server/db';
import { eq, and } from 'drizzle-orm';
import { getSession, requireClient } from '$lib/server/auth/session';
import { reorderLinksSchema } from '$lib/schemas';

export const PUT: RequestHandler = async (event) => {
  const sessionData = await getSession(event);
  const authError = requireClient(sessionData);
  if (authError) return authError;

  const client = sessionData.client!;
  const body = await event.request.json();
  const result = reorderLinksSchema.safeParse(body);

  if (!result.success) {
    return json({ error: 'Invalid input', details: result.error.flatten() }, { status: 400 });
  }

  const { order } = result.data;

  try {
      await db.transaction(async (tx) => {
        for (const item of order) {
            await tx
            .update(links)
            .set({ sort_order: item.sort_order, updated_at: new Date().toISOString() })
            .where(and(eq(links.id, item.id), eq(links.client_id, client.id)));
        }
    });

    // Mark client as having draft changes
    await db
        .update(clients)
        .set({ has_draft_changes: true, updated_at: new Date().toISOString() })
        .where(eq(clients.id, client.id));

    return json({ success: true });
  } catch (e) {
      console.error(e);
      return json({ error: 'Failed to reorder links' }, { status: 500 });
  }
};
