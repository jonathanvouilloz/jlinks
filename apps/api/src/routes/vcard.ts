import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { db, clients } from '../db';
import { eq, and } from 'drizzle-orm';
import { generateVCard } from '@noko/shared';
import { slugParamSchema } from '../schemas';

const SITE_URL = process.env.SITE_URL || 'https://links.jonlabs.ch';

export const vcardRoutes = new Hono()
  // Get vCard for a client (public endpoint)
  .get('/:slug', zValidator('param', slugParamSchema), async (c) => {
    const { slug } = c.req.valid('param');

    const client = await db.query.clients.findFirst({
      where: and(
        eq(clients.slug, slug),
        eq(clients.is_published, true),
        eq(clients.vcard_enabled, true)
      ),
    });

    if (!client) {
      return c.json({ error: 'Not found' }, 404);
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
  });
