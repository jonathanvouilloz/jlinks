import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import QRCode from 'qrcode';
import { getSession, requireClient } from '$lib/server/auth/session';
import { PUBLIC_SITE_URL } from '$env/static/public';

export const GET: RequestHandler = async (event) => {
  const sessionData = await getSession(event);
  const authError = requireClient(sessionData);
  if (authError) return authError;

  const { format } = event.params;
  const size = event.url.searchParams.get('size');
  const client = sessionData.client!;

  if (format !== 'png' && format !== 'svg') {
    return json({ error: 'Format must be png or svg' }, { status: 400 });
  }

  // Build URL with tracking parameter
  const url = `${PUBLIC_SITE_URL}/${client.slug}?src=qr`;

  // Validate and constrain size parameter (prevent DoS)
  const MIN_SIZE = 64;
  const MAX_SIZE = 2048;
  let width = 1024;
  if (size) {
    const parsed = parseInt(size, 10);
    if (isNaN(parsed) || parsed < MIN_SIZE || parsed > MAX_SIZE) {
      return json({ error: `Size must be between ${MIN_SIZE} and ${MAX_SIZE}` }, { status: 400 });
    }
    width = parsed;
  }

  // QR code options with client's primary color
  const options = {
    color: {
      dark: client.primary_color || '#000000',
      light: '#FFFFFF',
    },
    width,
    margin: 2,
  };

  if (format === 'png') {
    const buffer = await QRCode.toBuffer(url, {
      ...options,
      type: 'png',
    });

    return new Response(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="${client.slug}-qrcode.png"`,
        'Cache-Control': 'private, max-age=3600',
      },
    });
  }

  if (format === 'svg') {
    const svg = await QRCode.toString(url, {
      ...options,
      type: 'svg',
    });

    return new Response(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Content-Disposition': `attachment; filename="${client.slug}-qrcode.svg"`,
        'Cache-Control': 'private, max-age=3600',
      },
    });
  }

  return json({ error: 'Unknown format' }, { status: 400 });
};
