import { db, clients, users, links } from './index';
import { hashPassword } from '../routes/auth';

async function seed() {
  console.log('Seeding database...');

  // Create super admin
  const adminPassword = await hashPassword('admin123');
  const [superAdmin] = await db
    .insert(users)
    .values({
      id: crypto.randomUUID(),
      email: 'admin@jonlabs.ch',
      password_hash: adminPassword,
      role: 'super_admin',
      password_needs_upgrade: false, // New passwords use scrypt
    })
    .returning();

  console.log('Created super admin:', superAdmin.email);

  // Create demo client
  const [demoClient] = await db
    .insert(clients)
    .values({
      slug: 'demo',
      name: 'Demo Client',
      primary_color: '#00D9A3',
      secondary_color: '#FFFFFF',
      background_type: 'solid',
      background_value: '#FAFAFA',
      font_title: 'Inter',
      font_text: 'Inter',
      layout_type: 'list',
      bio: 'Welcome to my link page! Find all my important links here.',
      is_published: true,
      vcard_enabled: true,
      vcard_name: 'Demo Client',
      vcard_email: 'demo@example.com',
      plan: 'pro',
    })
    .returning();

  console.log('Created demo client:', demoClient.slug);

  // Create demo user
  const demoPassword = await hashPassword('demo123');
  const [demoUser] = await db
    .insert(users)
    .values({
      id: crypto.randomUUID(),
      email: 'demo@example.com',
      password_hash: demoPassword,
      client_id: demoClient.id,
      role: 'client',
      password_needs_upgrade: false, // New passwords use scrypt
    })
    .returning();

  console.log('Created demo user:', demoUser.email);

  // Create demo links
  const demoLinks = [
    {
      title: 'My Website',
      url: 'https://example.com',
      social_preset: 'website',
      sort_order: 0,
    },
    {
      title: 'Follow me on Instagram',
      url: 'https://instagram.com/demo',
      social_preset: 'instagram',
      sort_order: 1,
    },
    {
      title: 'Subscribe on YouTube',
      url: 'https://youtube.com/@demo',
      social_preset: 'youtube',
      sort_order: 2,
    },
    {
      title: 'Connect on LinkedIn',
      url: 'https://linkedin.com/in/demo',
      social_preset: 'linkedin',
      sort_order: 3,
    },
    {
      title: 'Send me an email',
      url: 'mailto:demo@example.com',
      social_preset: 'email',
      sort_order: 4,
    },
  ];

  for (const link of demoLinks) {
    await db.insert(links).values({
      client_id: demoClient.id,
      ...link,
    });
  }

  console.log('Created', demoLinks.length, 'demo links');

  console.log('\n--- Seed completed! ---\n');
  console.log('You can login with:');
  console.log('  Super Admin: admin@jonlabs.ch / admin123');
  console.log('  Demo Client: demo@example.com / demo123');
}

seed().catch(console.error);
