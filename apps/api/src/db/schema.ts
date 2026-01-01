import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

// ============================================
// CLIENTS TABLE
// ============================================
export const clients = sqliteTable('clients', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  slug: text('slug').unique().notNull(),
  name: text('name').notNull(),

  // Branding
  logo_url: text('logo_url'),
  profile_image_url: text('profile_image_url'),

  // Colors
  primary_color: text('primary_color').default('#000000'),
  secondary_color: text('secondary_color').default('#ffffff'),
  background_type: text('background_type').default('solid'), // 'solid' | 'gradient' | 'image'
  background_value: text('background_value').default('#ffffff'),

  // Typography (Google Fonts)
  font_preset: text('font_preset'), // null = custom fonts
  font_title: text('font_title').default('Inter'),
  font_text: text('font_text').default('Inter'),

  // Layout
  layout_type: text('layout_type').default('list'), // 'list' | 'cards' | 'grid' | 'premium'

  // Meta
  bio: text('bio'),
  meta_title: text('meta_title'),
  meta_description: text('meta_description'),

  // Status
  is_published: integer('is_published', { mode: 'boolean' }).default(false),
  has_draft_changes: integer('has_draft_changes', { mode: 'boolean' }).default(false),

  // vCard
  vcard_enabled: integer('vcard_enabled', { mode: 'boolean' }).default(false),
  vcard_name: text('vcard_name'),
  vcard_email: text('vcard_email'),
  vcard_phone: text('vcard_phone'),
  vcard_company: text('vcard_company'),
  vcard_website: text('vcard_website'),

  // Plan
  plan: text('plan').default('pro'), // 'free' | 'pro' - default to pro for MVP
  plan_expires_at: text('plan_expires_at'),

  // Timestamps
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updated_at: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
  published_at: text('published_at'),
});

// ============================================
// LINKS TABLE
// ============================================
export const links = sqliteTable('links', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  client_id: text('client_id')
    .notNull()
    .references(() => clients.id, { onDelete: 'cascade' }),

  // Content
  title: text('title').notNull(),
  url: text('url').notNull(),
  description: text('description'),

  // Appearance
  icon: text('icon'),
  thumbnail_url: text('thumbnail_url'),

  // Social preset (NULL = custom styling)
  social_preset: text('social_preset'),

  // Custom styling (used if social_preset is NULL)
  custom_bg_color: text('custom_bg_color'),
  custom_text_color: text('custom_text_color'),

  // State
  is_active: integer('is_active', { mode: 'boolean' }).default(true),
  sort_order: integer('sort_order').default(0),
  is_draft: integer('is_draft', { mode: 'boolean' }).default(false),

  // Timestamps
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updated_at: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// ============================================
// USERS TABLE
// ============================================
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').unique().notNull(),
  password_hash: text('password_hash').notNull(),
  client_id: text('client_id').references(() => clients.id, { onDelete: 'set null' }),
  role: text('role').default('client'), // 'client' | 'super_admin'
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// ============================================
// SESSIONS TABLE (for Better Auth)
// ============================================
export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  user_id: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires_at: text('expires_at').notNull(),
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// ============================================
// ANALYTICS TABLES (Future)
// ============================================
export const link_clicks = sqliteTable('link_clicks', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  link_id: text('link_id')
    .notNull()
    .references(() => links.id, { onDelete: 'cascade' }),
  clicked_at: text('clicked_at').default(sql`CURRENT_TIMESTAMP`),
  referrer: text('referrer'),
  user_agent: text('user_agent'),
  country: text('country'),
  source: text('source'), // 'direct' | 'instagram' | 'qrcode' | etc.
});

export const page_views = sqliteTable('page_views', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  client_id: text('client_id')
    .notNull()
    .references(() => clients.id, { onDelete: 'cascade' }),
  viewed_at: text('viewed_at').default(sql`CURRENT_TIMESTAMP`),
  referrer: text('referrer'),
  user_agent: text('user_agent'),
  country: text('country'),
  source: text('source'),
});

// ============================================
// RELATIONS
// ============================================
export const clientsRelations = relations(clients, ({ many, one }) => ({
  links: many(links),
  users: many(users),
  page_views: many(page_views),
}));

export const linksRelations = relations(links, ({ one, many }) => ({
  client: one(clients, {
    fields: [links.client_id],
    references: [clients.id],
  }),
  clicks: many(link_clicks),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  client: one(clients, {
    fields: [users.client_id],
    references: [clients.id],
  }),
  sessions: many(sessions),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.user_id],
    references: [users.id],
  }),
}));

export const linkClicksRelations = relations(link_clicks, ({ one }) => ({
  link: one(links, {
    fields: [link_clicks.link_id],
    references: [links.id],
  }),
}));

export const pageViewsRelations = relations(page_views, ({ one }) => ({
  client: one(clients, {
    fields: [page_views.client_id],
    references: [clients.id],
  }),
}));
