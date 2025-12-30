import { Elysia, t } from 'elysia';
import { db, clients } from '../db';
import { eq, and } from 'drizzle-orm';
import { generateVCard } from '@jlinks/shared';

const SITE_URL = process.env.SITE_URL || 'https://links.jonlabs.ch';

export const vcardRoutes = new Elysia({ prefix: '/vcard' })
  // Get vCard for a client (public endpoint)
  .get(
    '/:slug',
    async ({ params, error }) => {
      const client = await db.query.clients.findFirst({
        where: and(
          eq(clients.slug, params.slug),
          eq(clients.is_published, true),
          eq(clients.vcard_enabled, true)
        ),
      });

      if (!client) {
        return error(404, 'Not found');
      }

      const vcard = generateVCard({
        name: client.vcard_name || client.name,
        email: client.vcard_email || undefined,
        phone: client.vcard_phone || undefined,
        company: client.vcard_company || undefined,
        website: client.vcard_website || `${SITE_URL}/${client.slug}`,
      });

      return new Response(vcard, {
        headers: {
          'Content-Type': 'text/vcard; charset=utf-8',
          'Content-Disposition': `attachment; filename="${client.slug}.vcf"`,
          'Cache-Control': 'public, max-age=3600',
        },
      });
    },
    {
      params: t.Object({
        slug: t.String(),
      }),
    }
  );
