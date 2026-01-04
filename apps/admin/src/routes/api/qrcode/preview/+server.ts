import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import QRCode from 'qrcode';
import { getSession, requireClient } from '$lib/server/auth/session';
import { PUBLIC_SITE_URL } from '$env/static/public';

export const GET: RequestHandler = async (event) => {
  const sessionData = await getSession(event);
  const authError = requireClient(sessionData);
  if (authError) return authError;

  const client = sessionData.client!;
  const url = `${PUBLIC_SITE_URL}/${client.slug}?src=qr`;

  const svg = await QRCode.toString(url, {
    color: {
      dark: client.primary_color || '#000000',
      light: '#FFFFFF',
    },
    width: 256,
    margin: 2,
    type: 'svg',
  });

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'private, max-age=60',
    },
  });
};
