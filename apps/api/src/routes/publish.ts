import { Elysia } from 'elysia';
import { db, clients } from '../db';
import { eq } from 'drizzle-orm';
import { requireClient } from '../middleware/auth';

export const publishRoutes = new Elysia({ prefix: '/publish' })
  .use(requireClient)

  // Trigger Astro rebuild
  .post('/', async ({ client, error }) => {
    const VERCEL_DEPLOY_HOOK = process.env.VERCEL_DEPLOY_HOOK;

    if (!VERCEL_DEPLOY_HOOK) {
      console.warn('VERCEL_DEPLOY_HOOK not configured, skipping rebuild');
      // For development, just mark as published
      await db
        .update(clients)
        .set({
          has_draft_changes: false,
          is_published: true,
          published_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .where(eq(clients.id, client!.id));

      return {
        status: 'done',
        message: 'Changes saved (development mode - no rebuild triggered)',
      };
    }

    try {
      // Trigger Vercel rebuild
      const response = await fetch(VERCEL_DEPLOY_HOOK, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`Vercel deploy failed: ${response.statusText}`);
      }

      // Update client status
      await db
        .update(clients)
        .set({
          has_draft_changes: false,
          is_published: true,
          published_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .where(eq(clients.id, client!.id));

      return {
        status: 'building',
        message: 'Publication en cours... (~30-60 secondes)',
      };
    } catch (e) {
      console.error('Publish error:', e);
      return error(500, 'Publication failed');
    }
  })

  // Get publish status
  .get('/status', async ({ client }) => {
    const currentClient = await db.query.clients.findFirst({
      where: eq(clients.id, client!.id),
    });

    return {
      hasDraftChanges: currentClient?.has_draft_changes ?? false,
      isPublished: currentClient?.is_published ?? false,
      lastPublishedAt: currentClient?.published_at ?? null,
    };
  });
