import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { db, links, clients } from '../db';
import { eq, and, asc, sql } from 'drizzle-orm';
import { requireClient, type AuthVariables } from '../middleware/auth';
import {
  linkIdParamSchema,
  createLinkSchema,
  updateLinkSchema,
  reorderLinksSchema,
} from '../schemas';

export const linkRoutes = new Hono<{ Variables: AuthVariables }>()
  .use('*', requireClient)

  // Get all links for the current client
  .get('/', async (c) => {
    const client = c.get('client');
    const allLinks = await db.query.links.findMany({
      where: eq(links.client_id, client!.id),
      orderBy: [asc(links.sort_order)],
    });
    return c.json(allLinks);
  })

  // Get single link
  .get('/:id', zValidator('param', linkIdParamSchema), async (c) => {
    const { id } = c.req.valid('param');
    const client = c.get('client');

    const link = await db.query.links.findFirst({
      where: and(eq(links.id, id), eq(links.client_id, client!.id)),
    });

    if (!link) {
      return c.json({ error: 'Link not found' }, 404);
    }

    return c.json(link);
  })

  // Create new link
  .post('/', zValidator('json', createLinkSchema), async (c) => {
    const body = c.req.valid('json');
    const client = c.get('client');

    // Use transaction to atomically get max sort_order and insert
    const newLink = await db.transaction(async (tx) => {
      // Get max sort_order atomically
      const result = await tx
        .select({ maxOrder: sql<number>`COALESCE(MAX(${links.sort_order}), -1)` })
        .from(links)
        .where(eq(links.client_id, client!.id));

      const maxOrder = result[0]?.maxOrder ?? -1;

      // Create link
      const [created] = await tx
        .insert(links)
        .values({
          client_id: client!.id,
          title: body.title,
          url: body.url,
          description: body.description,
          icon: body.icon,
          thumbnail_url: body.thumbnail_url,
          social_preset: body.social_preset,
          custom_bg_color: body.custom_bg_color,
          custom_text_color: body.custom_text_color,
          sort_order: maxOrder + 1,
        })
        .returning();

      return created;
    });

    // Mark client as having draft changes
    await db
      .update(clients)
      .set({ has_draft_changes: true, updated_at: new Date().toISOString() })
      .where(eq(clients.id, client!.id));

    return c.json(newLink);
  })

  // Update link
  .put('/:id', zValidator('param', linkIdParamSchema), zValidator('json', updateLinkSchema), async (c) => {
    const { id } = c.req.valid('param');
    const body = c.req.valid('json');
    const client = c.get('client');

    // Verify ownership
    const link = await db.query.links.findFirst({
      where: and(eq(links.id, id), eq(links.client_id, client!.id)),
    });

    if (!link) {
      return c.json({ error: 'Link not found' }, 404);
    }

    // Update link
    const [updated] = await db
      .update(links)
      .set({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .where(eq(links.id, id))
      .returning();

    // Mark client as having draft changes
    await db
      .update(clients)
      .set({ has_draft_changes: true, updated_at: new Date().toISOString() })
      .where(eq(clients.id, client!.id));

    return c.json(updated);
  })

  // Delete link
  .delete('/:id', zValidator('param', linkIdParamSchema), async (c) => {
    const { id } = c.req.valid('param');
    const client = c.get('client');

    // Verify ownership
    const link = await db.query.links.findFirst({
      where: and(eq(links.id, id), eq(links.client_id, client!.id)),
    });

    if (!link) {
      return c.json({ error: 'Link not found' }, 404);
    }

    await db.delete(links).where(eq(links.id, id));

    // Mark client as having draft changes
    await db
      .update(clients)
      .set({ has_draft_changes: true, updated_at: new Date().toISOString() })
      .where(eq(clients.id, client!.id));

    return c.json({ success: true });
  })

  // Reorder links
  .put('/reorder', zValidator('json', reorderLinksSchema), async (c) => {
    const { order } = c.req.valid('json');
    const client = c.get('client');

    // Update all links in a transaction
    await db.transaction(async (tx) => {
      for (const item of order) {
        await tx
          .update(links)
          .set({ sort_order: item.sort_order, updated_at: new Date().toISOString() })
          .where(and(eq(links.id, item.id), eq(links.client_id, client!.id)));
      }
    });

    // Mark client as having draft changes
    await db
      .update(clients)
      .set({ has_draft_changes: true, updated_at: new Date().toISOString() })
      .where(eq(clients.id, client!.id));

    return c.json({ success: true });
  })

  // Toggle link active status
  .post('/:id/toggle', zValidator('param', linkIdParamSchema), async (c) => {
    const { id } = c.req.valid('param');
    const client = c.get('client');

    const link = await db.query.links.findFirst({
      where: and(eq(links.id, id), eq(links.client_id, client!.id)),
    });

    if (!link) {
      return c.json({ error: 'Link not found' }, 404);
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
      .where(eq(clients.id, client!.id));

    return c.json(updated);
  });