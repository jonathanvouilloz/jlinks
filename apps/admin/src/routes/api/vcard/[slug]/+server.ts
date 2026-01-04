import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db, clients } from '$lib/server/db';
import { eq, and } from 'drizzle-orm';
import { generateVCard } from '@noko/shared';
import { PUBLIC_SITE_URL } from '$env/static/public';

export const GET: RequestHandler = async (event) => {
  const { slug } = event.params;

  const client = await db.query.clients.findFirst({
    where: and(
      eq(clients.slug, slug),
      eq(clients.is_published, true),
      eq(clients.vcard_enabled, true)
    ),
  });

  if (!client) {
    return json({ error: 'Not found' }, { status: 404 });
  }

  const vcard = generateVCard({
    name: client.vcard_name || client.name,
    email: client.vcard_email || undefined,
    phone: client.vcard_phone || undefined,
    company: client.vcard_company || undefined,
    website: client.vcard_website || `${PUBLIC_SITE_URL}/${client.slug}`,
  });

  return new Response(vcard, {
    headers: {
      'Content-Type': 'text/vcard; charset=utf-8',
      'Content-Disposition': `attachment; filename="${client.slug}.vcf"`,
      'Cache-Control': 'public, max-age=3600',
    },
  });
};

