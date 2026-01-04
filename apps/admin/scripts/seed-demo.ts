
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from '../src/lib/server/db/schema';
import { eq } from 'drizzle-orm';
import dotenv from 'dotenv';

// Load .env from apps/admin
dotenv.config();

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not defined in .env');
  process.exit(1);
}

const client = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const db = drizzle(client, { schema });

async function seed() {
  console.log('🌱 Seeding demo client...');

  // 1. Check if demo client exists
  const existingClient = await db.query.clients.findFirst({
    where: eq(schema.clients.slug, 'demo'),
  });

  if (existingClient) {
    console.log('⚠️ Demo client already exists. Updating publication status...');
    await db.update(schema.clients)
      .set({ is_published: true })
      .where(eq(schema.clients.slug, 'demo'));
    console.log('✅ Updated demo client to published.');
    process.exit(0);
  }

  // 2. Create demo client
  const clientId = crypto.randomUUID();
  const [newClient] = await db
    .insert(schema.clients)
    .values({
      id: clientId,
      slug: 'demo',
      name: 'Demo User',
      primary_color: '#000000',
      secondary_color: '#ffffff',
      background_type: 'solid',
      background_value: '#FAFAFA',
      font_title: 'Inter',
      font_text: 'Inter',
      layout_type: 'list',
      button_style: 'rounded',
      bio: 'Welcome to my Noko page! This is a demo profile.',
      is_published: true,
      plan: 'pro',
    })
    .returning();

  console.log('✅ Created demo client:', newClient.slug);

  // 3. Create links
  const linksData = [
    {
      title: 'My Website',
      url: 'https://example.com',
      social_preset: 'website',
      sort_order: 0,
    },
    {
      title: 'Twitter / X',
      url: 'https://twitter.com/demo',
      social_preset: 'twitter',
      sort_order: 1,
    },
    {
      title: 'Instagram',
      url: 'https://instagram.com/demo',
      social_preset: 'instagram',
      sort_order: 2,
    },
  ];

  for (const link of linksData) {
    await db.insert(schema.links).values({
      client_id: clientId,
      ...link,
      is_active: true,
    });
  }

  console.log('✅ Created demo links');
  console.log('✨ Seed completed! You can now visit /demo');
}

seed().catch((err) => {
  console.error('❌ Error seeding:', err);
  process.exit(1);
});
