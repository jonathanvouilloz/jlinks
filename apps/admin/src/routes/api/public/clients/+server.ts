import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db, clients } from '$lib/server/db';
import { eq } from 'drizzle-orm';

export const GET: RequestHandler = async (event) => {
  event.setHeaders({
    'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
  });

  const publishedClients = await db.query.clients.findMany({
    where: eq(clients.is_published, true),
    columns: {
      id: true,
      slug: true,
      name: true,
      updated_at: true,
    },
  });

  return json(publishedClients);
};
