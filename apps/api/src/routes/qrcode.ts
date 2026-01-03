import { Elysia, t } from 'elysia';
import QRCode from 'qrcode';
import { requireClient } from '../middleware/auth';

const SITE_URL = process.env.SITE_URL || 'https://links.jonlabs.ch';

export const qrcodeRoutes = new Elysia({ prefix: '/qrcode' })
  .use(requireClient)

  // Generate QR code
  .get(
    '/:format',
    async ({ params, client, query, error }) => {
      const format = params.format;

      if (format !== 'png' && format !== 'svg') {
        return error(400, 'Format must be png or svg');
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
          return error(400, `Size must be between ${MIN_SIZE} and ${MAX_SIZE}`);
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

        return new Response(buffer, {
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
    },
    {
      params: t.Object({
        format: t.String(),
      }),
      query: t.Object({
        size: t.Optional(t.String()),
        preview: t.Optional(t.String()),
      }),
    }
  )

  // Preview QR code (inline, not download)
  .get('/preview', async ({ client }) => {
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
