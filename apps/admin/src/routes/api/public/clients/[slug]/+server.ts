import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db, clients, links } from '$lib/server/db';
import { eq, and, asc } from 'drizzle-orm';

export const GET: RequestHandler = async (event) => {
  const { slug } = event.params;

  event.setHeaders({
    'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
  });

  const client = await db.query.clients.findFirst({
    where: and(
      eq(clients.slug, slug),
      eq(clients.is_published, true)
    ),
  });

  if (!client) {
    return json({ error: 'Client not found' }, { status: 404 });
  }

  // Get active links
  const clientLinks = await db.query.links.findMany({
    where: and(
      eq(links.client_id, client.id),
      eq(links.is_active, true)
    ),
    orderBy: [asc(links.sort_order)],
  });

  return json({
    client: {
      id: client.id,
      slug: client.slug,
      name: client.name,
      logo_url: client.logo_url,
      profile_image_url: client.profile_image_url,
      primary_color: client.primary_color,
      secondary_color: client.secondary_color,
      background_type: client.background_type,
      background_value: client.background_value,
      outer_background_color: client.outer_background_color,
      button_opacity: client.button_opacity,
      font_preset: client.font_preset,
      font_title: client.font_title,
      font_text: client.font_text,
      layout_type: client.layout_type,
      button_style: client.button_style,
      bio: client.bio,
      meta_title: client.meta_title,
      meta_description: client.meta_description,
      vcard_enabled: client.vcard_enabled,
      plan: client.plan,
    },
    links: clientLinks.map((link) => ({
      id: link.id,
      title: link.title,
      url: link.url,
      description: link.description,
      icon: link.icon,
      thumbnail_url: link.thumbnail_url,
      social_preset: link.social_preset,
      custom_bg_color: link.custom_bg_color,
      custom_text_color: link.custom_text_color,
    })),
  });
};
