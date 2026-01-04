import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getSession } from '$lib/server/auth/session';

export const GET: RequestHandler = async (event) => {
  const sessionData = await getSession(event);

  return json({
    user: sessionData.user,
    client: sessionData.client,
  });
};
