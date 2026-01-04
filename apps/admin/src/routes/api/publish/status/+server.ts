import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db, clients } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { getSession, requireClient } from '$lib/server/auth/session';

export const GET: RequestHandler = async (event) => {
  const sessionData = await getSession(event);
  const authError = requireClient(sessionData);
  if (authError) return authError;

  const client = sessionData.client!;

  const currentClient = await db.query.clients.findFirst({
    where: eq(clients.id, client.id),
  });

  return json({
    hasDraftChanges: currentClient?.has_draft_changes ?? false,
    isPublished: currentClient?.is_published ?? false,
    lastPublishedAt: currentClient?.published_at ?? null,
  });
};
