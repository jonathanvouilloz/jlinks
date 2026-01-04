import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db, clients } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { getSession, requireClient } from '$lib/server/auth/session';
import { updateClientMeSchema } from '$lib/schemas';

export const GET: RequestHandler = async (event) => {
  const sessionData = await getSession(event);
  const authError = requireClient(sessionData);
  if (authError) return authError;

  return json(sessionData.client);
};

export const PUT: RequestHandler = async (event) => {
  const sessionData = await getSession(event);
  const authError = requireClient(sessionData);
  if (authError) return authError;

  const body = await event.request.json();
  const result = updateClientMeSchema.safeParse(body);

  if (!result.success) {
    return json({ error: 'Invalid input', details: result.error.flatten() }, { status: 400 });
  }

  const data = result.data;
  const client = sessionData.client!;

  const [updated] = await db
    .update(clients)
    .set({
      name: data.name,
      bio: data.bio,
      meta_title: data.meta_title,
      meta_description: data.meta_description,
      has_draft_changes: true,
      updated_at: new Date().toISOString(),
    } as any)
    .where(eq(clients.id, client.id))
    .returning();

  return json(updated);
};
