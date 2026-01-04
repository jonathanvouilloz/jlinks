import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db, clients } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { getSession, requireClient } from '$lib/server/auth/session';
import { env } from '$env/dynamic/private';

export const POST: RequestHandler = async (event) => {
  const sessionData = await getSession(event);
  const authError = requireClient(sessionData);
  if (authError) return authError;

  const client = sessionData.client!;

  try {
    // Mark as published (no rebuild needed with SSR)
    await db
      .update(clients)
      .set({
        has_draft_changes: false,
        is_published: true,
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .where(eq(clients.id, client.id));

    // Invalidate cache immediately via ISR bypass token
    const ISR_BYPASS_TOKEN = env.ISR_BYPASS_TOKEN;
    const PUBLIC_SITE_URL = env.PUBLIC_SITE_URL;

    if (ISR_BYPASS_TOKEN && PUBLIC_SITE_URL) {
      try {
        await fetch(`${PUBLIC_SITE_URL}/${client.slug}`, {
          headers: {
            'x-prerender-revalidate': ISR_BYPASS_TOKEN,
          },
        });
      } catch (revalidateError) {
        // Log but don't fail - page will update on next natural cache expiration
        console.warn('ISR revalidation failed:', revalidateError);
      }
    }

    return json({
      status: 'done',
      message: 'Modifications publiées!',
    });
  } catch (e) {
    console.error('Publish error:', e);
    return json({ error: 'Publication failed' }, { status: 500 });
  }
};
