import { Elysia, t } from 'elysia';
import { db, clients, users } from '../db';
import { eq } from 'drizzle-orm';
import { requireAuth, requireSuperAdmin, requireClient } from '../middleware/auth';
import { hashPassword } from './auth';

export const clientRoutes = new Elysia({ prefix: '/clients' })
  // ============================================
  // SUPER ADMIN ROUTES
  // ============================================

  // List all clients (super-admin only)
  .use(requireSuperAdmin)
  .get('/', async () => {
    return db.query.clients.findMany({
      orderBy: (clients, { desc }) => [desc(clients.created_at)],
    });
  })

  // Get single client by ID (super-admin only)
  .get(
    '/:id',
    async ({ params, error }) => {
      const client = await db.query.clients.findFirst({
        where: eq(clients.id, params.id),
        with: {
          links: {
            orderBy: (links, { asc }) => [asc(links.sort_order)],
          },
        },
      });

      if (!client) {
        return error(404, 'Client not found');
      }

      return client;
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    }
  )

  // Create new client (super-admin only)
  .post(
    '/',
    async ({ body, error }) => {
      const { slug, name, email, password } = body;

      // Check if slug is already taken
      const existing = await db.query.clients.findFirst({
        where: eq(clients.slug, slug.toLowerCase()),
      });

      if (existing) {
        return error(400, 'Slug is already taken');
      }

      // Check if email is already used
      const existingUser = await db.query.users.findFirst({
        where: eq(users.email, email.toLowerCase()),
      });

      if (existingUser) {
        return error(400, 'Email is already in use');
      }

      // Create client and user in transaction
      const result = await db.transaction(async (tx) => {
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
          })
          .returning();

        return {
          client: newClient,
          user: {
            id: newUser.id,
            email: newUser.email,
          },
        };
      });

      return result;
    },
    {
      body: t.Object({
        slug: t.String({ minLength: 3, maxLength: 50, pattern: '^[a-z0-9-]+$' }),
        name: t.String({ minLength: 1, maxLength: 100 }),
        email: t.String({ format: 'email' }),
        password: t.String({ minLength: 8 }),
      }),
    }
  )

  // Update client (super-admin only)
  .put(
    '/:id',
    async ({ params, body, error }) => {
      const client = await db.query.clients.findFirst({
        where: eq(clients.id, params.id),
      });

      if (!client) {
        return error(404, 'Client not found');
      }

      // If slug is being changed, check it's not taken
      if (body.slug && body.slug !== client.slug) {
        const existing = await db.query.clients.findFirst({
          where: eq(clients.slug, body.slug.toLowerCase()),
        });

        if (existing) {
          return error(400, 'Slug is already taken');
        }
      }

      const [updated] = await db
        .update(clients)
        .set({
          ...body,
          slug: body.slug?.toLowerCase(),
          updated_at: new Date().toISOString(),
        })
        .where(eq(clients.id, params.id))
        .returning();

      return updated;
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        slug: t.Optional(t.String({ minLength: 3, maxLength: 50, pattern: '^[a-z0-9-]+$' })),
        name: t.Optional(t.String({ minLength: 1, maxLength: 100 })),
        plan: t.Optional(t.Union([t.Literal('free'), t.Literal('pro')])),
      }),
    }
  )

  // Delete client (super-admin only)
  .delete(
    '/:id',
    async ({ params, error }) => {
      const client = await db.query.clients.findFirst({
        where: eq(clients.id, params.id),
      });

      if (!client) {
        return error(404, 'Client not found');
      }

      await db.delete(clients).where(eq(clients.id, params.id));

      return { success: true };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    }
  )

  // ============================================
  // CLIENT ROUTES (own data)
  // ============================================

  // Get own client data
  .group('/me', (app) =>
    app
      .use(requireClient)

      .get('/', async ({ client }) => {
        return client;
      })

      // Update own client data
      .put(
        '/',
        async ({ client, body }) => {
          const [updated] = await db
            .update(clients)
            .set({
              name: body.name,
              bio: body.bio,
              meta_title: body.meta_title,
              meta_description: body.meta_description,
              has_draft_changes: true,
              updated_at: new Date().toISOString(),
            })
            .where(eq(clients.id, client!.id))
            .returning();

          return updated;
        },
        {
          body: t.Object({
            name: t.Optional(t.String({ minLength: 1, maxLength: 100 })),
            bio: t.Optional(t.String({ maxLength: 500 })),
            meta_title: t.Optional(t.String({ maxLength: 60 })),
            meta_description: t.Optional(t.String({ maxLength: 160 })),
          }),
        }
      )

      // Update settings (colors, fonts, layout)
      .put(
        '/settings',
        async ({ client, body }) => {
          const [updated] = await db
            .update(clients)
            .set({
              ...body,
              has_draft_changes: true,
              updated_at: new Date().toISOString(),
            })
            .where(eq(clients.id, client!.id))
            .returning();

          return updated;
        },
        {
          body: t.Object({
            primary_color: t.Optional(t.String({ pattern: '^#[0-9a-fA-F]{6}$' })),
            secondary_color: t.Optional(t.String({ pattern: '^#[0-9a-fA-F]{6}$' })),
            background_type: t.Optional(
              t.Union([t.Literal('solid'), t.Literal('gradient'), t.Literal('image')])
            ),
            background_value: t.Optional(t.String()),
            font_title: t.Optional(t.String()),
            font_text: t.Optional(t.String()),
            layout_type: t.Optional(
              t.Union([t.Literal('list'), t.Literal('cards'), t.Literal('grid')])
            ),
          }),
        }
      )

      // Update vCard settings
      .put(
        '/vcard',
        async ({ client, body }) => {
          const [updated] = await db
            .update(clients)
            .set({
              vcard_enabled: body.vcard_enabled,
              vcard_name: body.vcard_name,
              vcard_email: body.vcard_email,
              vcard_phone: body.vcard_phone,
              vcard_company: body.vcard_company,
              vcard_website: body.vcard_website,
              has_draft_changes: true,
              updated_at: new Date().toISOString(),
            })
            .where(eq(clients.id, client!.id))
            .returning();

          return updated;
        },
        {
          body: t.Object({
            vcard_enabled: t.Optional(t.Boolean()),
            vcard_name: t.Optional(t.String()),
            vcard_email: t.Optional(t.String()),
            vcard_phone: t.Optional(t.String()),
            vcard_company: t.Optional(t.String()),
            vcard_website: t.Optional(t.String()),
          }),
        }
      )

      // Update branding (logo, profile image)
      .put(
        '/branding',
        async ({ client, body }) => {
          const [updated] = await db
            .update(clients)
            .set({
              logo_url: body.logo_url,
              profile_image_url: body.profile_image_url,
              has_draft_changes: true,
              updated_at: new Date().toISOString(),
            })
            .where(eq(clients.id, client!.id))
            .returning();

          return updated;
        },
        {
          body: t.Object({
            logo_url: t.Optional(t.String()),
            profile_image_url: t.Optional(t.String()),
          }),
        }
      )
  );
