import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db, links, clients } from '$lib/server/db';
import { eq, asc, sql } from 'drizzle-orm';
import { getSession, requireClient } from '$lib/server/auth/session';
import { createLinkSchema } from '$lib/schemas';

export const GET: RequestHandler = async (event) => {
  const sessionData = await getSession(event);
  const authError = requireClient(sessionData);
  if (authError) return authError;

  const client = sessionData.client!;

  const allLinks = await db.query.links.findMany({
    where: eq(links.client_id, client.id),
    orderBy: [asc(links.sort_order)],
  });

  return json(allLinks);
};

export const POST: RequestHandler = async (event) => {
  const sessionData = await getSession(event);
  const authError = requireClient(sessionData);
  if (authError) return authError;

  const client = sessionData.client!;
  const body = await event.request.json();
  const result = createLinkSchema.safeParse(body);

  if (!result.success) {
    return json({ error: 'Invalid input', details: result.error.flatten() }, { status: 400 });
  }

  const data = result.data;

  try {
    const newLink = await db.transaction(async (tx) => {
      // Get max sort_order atomically
      const result = await tx
        .select({ maxOrder: sql<number>`COALESCE(MAX(${links.sort_order}), -1)` })
        .from(links)
        .where(eq(links.client_id, client.id));

      const maxOrder = result[0]?.maxOrder ?? -1;

      // Create link
      const [created] = await tx
        .insert(links)
        .values({
          client_id: client.id,
          title: data.title,
          url: data.url,
          description: data.description,
          icon: data.icon,
          thumbnail_url: data.thumbnail_url,
          social_preset: data.social_preset,
          custom_bg_color: data.custom_bg_color,
          custom_text_color: data.custom_text_color,
          sort_order: maxOrder + 1,
        })
        .returning();

      return created;
    });

    // Mark client as having draft changes
    await db
      .update(clients)
      .set({ has_draft_changes: true, updated_at: new Date().toISOString() })
      .where(eq(clients.id, client.id));

    return json(newLink);
  } catch (e) {
      console.error(e);
      return json({ error: 'Failed to create link' }, { status: 500 });
  }
};
