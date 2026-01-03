import { Elysia, t } from 'elysia';
import { db, links, clients } from '../db';
import { eq, and, asc, sql } from 'drizzle-orm';
import { requireClient } from '../middleware/auth';

export const linkRoutes = new Elysia({ prefix: '/links' })
  .use(requireClient)

  // Get all links for the current client
  .get('/', async ({ client }) => {
    return db.query.links.findMany({
      where: eq(links.client_id, client!.id),
      orderBy: [asc(links.sort_order)],
    });
  })

  // Get single link
  .get(
    '/:id',
    async ({ params, client, error }) => {
      const link = await db.query.links.findFirst({
        where: and(eq(links.id, params.id), eq(links.client_id, client!.id)),
      });

      if (!link) {
        return error(404, 'Link not found');
      }

      return link;
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    }
  )

  // Create new link
  .post(
    '/',
    async ({ body, client }) => {
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

      return newLink;
    },
    {
      body: t.Object({
        title: t.String({ minLength: 1, maxLength: 100 }),
        url: t.String({ minLength: 1 }),
        description: t.Optional(t.String({ maxLength: 200 })),
        icon: t.Optional(t.String()),
        thumbnail_url: t.Optional(t.String()),
        social_preset: t.Optional(t.String()),
        custom_bg_color: t.Optional(t.String()),
        custom_text_color: t.Optional(t.String()),
      }),
    }
  )

  // Update link
  .put(
    '/:id',
    async ({ params, body, client, error }) => {
      // Verify ownership
      const link = await db.query.links.findFirst({
        where: and(eq(links.id, params.id), eq(links.client_id, client!.id)),
      });

      if (!link) {
        return error(404, 'Link not found');
      }

      // Update link
      const [updated] = await db
        .update(links)
        .set({
          ...body,
          updated_at: new Date().toISOString(),
        })
        .where(eq(links.id, params.id))
        .returning();

      // Mark client as having draft changes
      await db
        .update(clients)
        .set({ has_draft_changes: true, updated_at: new Date().toISOString() })
        .where(eq(clients.id, client!.id));

      return updated;
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        title: t.Optional(t.String({ minLength: 1, maxLength: 100 })),
        url: t.Optional(t.String({ minLength: 1 })),
        description: t.Optional(t.String({ maxLength: 200 })),
        icon: t.Optional(t.String()),
        thumbnail_url: t.Optional(t.String()),
        social_preset: t.Optional(t.String()),
        custom_bg_color: t.Optional(t.String()),
        custom_text_color: t.Optional(t.String()),
        is_active: t.Optional(t.Boolean()),
      }),
    }
  )

  // Delete link
  .delete(
    '/:id',
    async ({ params, client, error }) => {
      // Verify ownership
      const link = await db.query.links.findFirst({
        where: and(eq(links.id, params.id), eq(links.client_id, client!.id)),
      });

      if (!link) {
        return error(404, 'Link not found');
      }

      await db.delete(links).where(eq(links.id, params.id));

      // Mark client as having draft changes
      await db
        .update(clients)
        .set({ has_draft_changes: true, updated_at: new Date().toISOString() })
        .where(eq(clients.id, client!.id));

      return { success: true };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    }
  )

  // Reorder links
  .put(
    '/reorder',
    async ({ body, client }) => {
      const { order } = body;

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

      return { success: true };
    },
    {
      body: t.Object({
        order: t.Array(
          t.Object({
            id: t.String(),
            sort_order: t.Number(),
          })
        ),
      }),
    }
  )

  // Toggle link active status
  .post(
    '/:id/toggle',
    async ({ params, client, error }) => {
      const link = await db.query.links.findFirst({
        where: and(eq(links.id, params.id), eq(links.client_id, client!.id)),
      });

      if (!link) {
        return error(404, 'Link not found');
      }

      const [updated] = await db
        .update(links)
        .set({
          is_active: !link.is_active,
          updated_at: new Date().toISOString(),
        })
        .where(eq(links.id, params.id))
        .returning();

      // Mark client as having draft changes
      await db
        .update(clients)
        .set({ has_draft_changes: true, updated_at: new Date().toISOString() })
        .where(eq(clients.id, client!.id));

      return updated;
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    }
  );
