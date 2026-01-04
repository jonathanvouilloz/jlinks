import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import QRCode from 'qrcode';
import { requireClient, type AuthVariables } from '../middleware/auth';
import { qrcodeParamSchema, qrcodeQuerySchema } from '../schemas';

const SITE_URL = process.env.PUBLIC_SITE_URL;

export const qrcodeRoutes = new Hono<{ Variables: AuthVariables }>()
  .use('*', requireClient)

  // Generate QR code
  .get('/:format', zValidator('param', qrcodeParamSchema), zValidator('query', qrcodeQuerySchema), async (c) => {
    const { format } = c.req.valid('param');
    const query = c.req.valid('query');
    const client = c.get('client');

    if (format !== 'png' && format !== 'svg') {
      return c.json({ error: 'Format must be png or svg' }, 400);
    }

    // Build URL with tracking parameter
    const url = `${SITE_URL}/${client!.slug}?src=qr`;

    // Validate and constrain size parameter (prevent DoS)
    const MIN_SIZE = 64;
    const MAX_SIZE = 2048;
    let width = 1024;
    if (query.size) {
      const parsed = parseInt(query.size, 10);
      if (isNaN(parsed) || parsed < MIN_SIZE || parsed > MAX_SIZE) {
        return c.json({ error: `Size must be between ${MIN_SIZE} and ${MAX_SIZE}` }, 400);
      }
      width = parsed;
    }

    // QR code options with client's primary color
    const options: QRCode.QRCodeToBufferOptions | QRCode.QRCodeToStringOptions = {
      color: {
        dark: client!.primary_color || '#000000',
        light: '#FFFFFF',
      },
      width,
      margin: 2,
    };

    if (format === 'png') {
      const buffer = await QRCode.toBuffer(url, {
        ...options,
        type: 'png',
      } as QRCode.QRCodeToBufferOptions);

      return new Response(new Uint8Array(buffer), {
        headers: {
          'Content-Type': 'image/png',
          'Content-Disposition': `attachment; filename="${client!.slug}-qrcode.png"`,
          'Cache-Control': 'private, max-age=3600',
        },
      });
    }

    if (format === 'svg') {
      const svg = await QRCode.toString(url, {
        ...options,
        type: 'svg',
      } as QRCode.QRCodeToStringOptions);

      return new Response(svg, {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Content-Disposition': `attachment; filename="${client!.slug}-qrcode.svg"`,
          'Cache-Control': 'private, max-age=3600',
        },
      });
    }
  })

  // Preview QR code (inline, not download)
  .get('/preview', async (c) => {
    const client = c.get('client');
    const url = `${SITE_URL}/${client!.slug}?src=qr`;

    const svg = await QRCode.toString(url, {
      color: {
        dark: client!.primary_color || '#000000',
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
  });
