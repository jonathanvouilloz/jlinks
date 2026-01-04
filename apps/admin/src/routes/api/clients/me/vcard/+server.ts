import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db, clients } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { getSession, requireClient } from '$lib/server/auth/session';
import { updateVcardSchema } from '$lib/schemas';

export const PUT: RequestHandler = async (event) => {
  const sessionData = await getSession(event);
  const authError = requireClient(sessionData);
  if (authError) return authError;

  const body = await event.request.json();
  const result = updateVcardSchema.safeParse(body);

  if (!result.success) {
    return json({ error: 'Invalid input', details: result.error.flatten() }, { status: 400 });
  }

  const data = result.data;
  const client = sessionData.client!;

  const [updated] = await db
    .update(clients)
    .set({
      vcard_enabled: data.vcard_enabled,
      vcard_name: data.vcard_name,
      vcard_email: data.vcard_email,
      vcard_phone: data.vcard_phone,
      vcard_company: data.vcard_company,
      vcard_website: data.vcard_website,
      has_draft_changes: true,
      updated_at: new Date().toISOString(),
    } as any)
    .where(eq(clients.id, client.id))
    .returning();

  return json(updated);
};
