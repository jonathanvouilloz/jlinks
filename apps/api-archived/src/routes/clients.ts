import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { db, clients, users } from '../db';
import { eq } from 'drizzle-orm';
import { authMiddleware, requireAuth, requireSuperAdmin, requireClient, type AuthVariables } from '../middleware/auth';
import { hashPassword } from './auth';
import {
  clientIdParamSchema,
  createClientSchema,
  updateClientSchema,
  updateClientMeSchema,
  updateClientSettingsSchema,
  updateVcardSchema,
  updateBrandingSchema,
} from '../schemas';

export const clientRoutes = new Hono<{ Variables: AuthVariables }>()

  // ============================================
  // SUPER ADMIN ROUTES
  // ============================================

  // List all clients (super-admin only)
  .get('/', requireSuperAdmin, async (c) => {
    const allClients = await db.query.clients.findMany({
      orderBy: (clients, { desc }) => [desc(clients.created_at)],
    });
    return c.json(allClients);
  })

  // Get single client by ID (super-admin only)
  .get('/:id', requireSuperAdmin, zValidator('param', clientIdParamSchema), async (c) => {
    const { id } = c.req.valid('param');

    const client = await db.query.clients.findFirst({
      where: eq(clients.id, id),
      with: {
        links: {
          orderBy: (links, { asc }) => [asc(links.sort_order)],
        },
      },
    });

    if (!client) {
      return c.json({ error: 'Client not found' }, 404);
    }

    return c.json(client);
  })

  // Create new client (super-admin only)
  .post('/', requireSuperAdmin, zValidator('json', createClientSchema), async (c) => {
    const { slug, name, email, password } = c.req.valid('json');

    // Check if slug is already taken
    const existing = await db.query.clients.findFirst({
      where: eq(clients.slug, slug.toLowerCase()),
    });

    if (existing) {
      return c.json({ error: 'Slug is already taken' }, 400);
    }

    // Check if email is already used
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase()),
    });

    if (existingUser) {
      return c.json({ error: 'Email is already in use' }, 400);
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

    return c.json(result);
  })

  // Update client (super-admin only)
  .put('/:id', requireSuperAdmin, zValidator('param', clientIdParamSchema), zValidator('json', updateClientSchema), async (c) => {
    const { id } = c.req.valid('param');
    const body = c.req.valid('json');

    const client = await db.query.clients.findFirst({
      where: eq(clients.id, id),
    });

    if (!client) {
      return c.json({ error: 'Client not found' }, 404);
    }

    // If slug is being changed, check it's not taken
    if (body.slug && body.slug !== client.slug) {
      const existing = await db.query.clients.findFirst({
        where: eq(clients.slug, body.slug.toLowerCase()),
      });

      if (existing) {
        return c.json({ error: 'Slug is already taken' }, 400);
      }
    }

    const [updated] = await db
      .update(clients)
      .set({
        ...body,
        slug: body.slug?.toLowerCase(),
        updated_at: new Date().toISOString(),
      } as any)
      .where(eq(clients.id, id))
      .returning();

    return c.json(updated);
  })

  // Delete client (super-admin only)
  .delete('/:id', requireSuperAdmin, zValidator('param', clientIdParamSchema), async (c) => {
    const { id } = c.req.valid('param');

    const client = await db.query.clients.findFirst({
      where: eq(clients.id, id),
    });

    if (!client) {
      return c.json({ error: 'Client not found' }, 404);
    }

    await db.delete(clients).where(eq(clients.id, id));

    return c.json({ success: true });
  })

  // ============================================
  // CLIENT ROUTES (own data)
  // ============================================

  // Get own client data
  .get('/me', requireClient, async (c) => {
    const client = c.get('client');
    return c.json(client);
  })

  // Update own client data
  .put('/me', requireClient, zValidator('json', updateClientMeSchema), async (c) => {
    const client = c.get('client');
    const body = c.req.valid('json');

    const [updated] = await db
      .update(clients)
      .set({
        name: body.name,
        bio: body.bio,
        meta_title: body.meta_title,
        meta_description: body.meta_description,
        has_draft_changes: true,
        updated_at: new Date().toISOString(),
      } as any)
      .where(eq(clients.id, client!.id))
      .returning();

    return c.json(updated);
  })

  // Update settings (colors, fonts, layout)
  .put('/me/settings', requireClient, zValidator('json', updateClientSettingsSchema), async (c) => {
    const client = c.get('client');
    const body = c.req.valid('json');

    const [updated] = await db
      .update(clients)
      .set({
        ...body,
        has_draft_changes: true,
        updated_at: new Date().toISOString(),
      } as any)
      .where(eq(clients.id, client!.id))
      .returning();

    return c.json(updated);
  })

  // Update vCard settings
  .put('/me/vcard', requireClient, zValidator('json', updateVcardSchema), async (c) => {
    const client = c.get('client');
    const body = c.req.valid('json');

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
      } as any)
      .where(eq(clients.id, client!.id))
      .returning();

    return c.json(updated);
  })

  // Update branding (logo, profile image)
  .put('/me/branding', requireClient, zValidator('json', updateBrandingSchema), async (c) => {
    const client = c.get('client');
    const body = c.req.valid('json');

    const [updated] = await db
      .update(clients)
      .set({
        logo_url: body.logo_url,
        profile_image_url: body.profile_image_url,
        has_draft_changes: true,
        updated_at: new Date().toISOString(),
      } as any)
      .where(eq(clients.id, client!.id))
      .returning();

    return c.json(updated);
  });
