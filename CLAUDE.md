# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Noko is a customizable link page solution (Linktree-style) by Jon Labs. Each user gets a public page at `nokolink.com/[slug]` with an admin interface to manage their links.

## Tech Stack

- **API Backend**: Elysia (Bun) + SQLite + Drizzle ORM
- **Admin Frontend**: SvelteKit (Svelte 5)
- **Public Pages**: Astro (static generation)
- **Shared**: TypeScript types and utilities
- **Icons**: Lucide (lucide-svelte, lucide-astro)
- **Hosting**: Vercel (admin + web) + VPS (API)

## Commands

### Development

```bash
# Install dependencies (from root)
bun install

# Run individual apps
bun run dev:api      # API on localhost:3000
bun run dev:admin    # Admin on localhost:5173
bun run dev:web      # Public pages on localhost:4321
```

### Database (from root)

```bash
bun run db:generate  # Generate Drizzle migrations
bun run db:migrate   # Apply migrations
bun run db:seed      # Seed test data
bun run db:studio    # Open Drizzle Studio GUI
```

### Build

```bash
bun run build:admin  # Build SvelteKit admin
bun run build:web    # Build Astro public pages
```

### Type Checking (admin)

```bash
cd apps/admin && bun run check
```

## Architecture

```
noko/
├── apps/
│   ├── api/           # Elysia backend (Bun)
│   │   ├── src/
│   │   │   ├── db/         # Drizzle schema, migrations, connection
│   │   │   ├── routes/     # API routes (auth, clients, links, publish, qrcode, vcard)
│   │   │   ├── lib/        # Auth config, rebuild logic
│   │   │   └── middleware/ # Auth, CORS
│   │   └── drizzle/        # Migration files
│   │
│   ├── admin/         # SvelteKit admin UI
│   │   └── src/
│   │       ├── routes/     # Pages (dashboard, login, settings, admin)
│   │       ├── lib/
│   │       │   ├── components/ui/  # Reusable UI components
│   │       │   ├── stores/         # Svelte stores
│   │       │   └── api.ts          # API client
│   │       └── styles/
│   │           └── variables.css   # Design tokens
│   │
│   └── web/           # Astro public pages (static)
│       └── src/
│           ├── pages/[slug].astro
│           ├── layouts/    # ListLayout, CardsLayout, GridLayout
│           └── components/
│
└── packages/
    └── shared/        # Shared code (@noko/shared)
        └── src/
            ├── types.ts
            ├── plans.ts
            ├── social-presets.ts
            └── vcard.ts
```

## Key Patterns

### Importing Shared Code

```typescript
import type { Client, Link } from '@noko/shared/types';
import { PLANS } from '@noko/shared/plans';
import { SOCIAL_PRESETS } from '@noko/shared/social-presets';
import { generateVCard } from '@noko/shared/vcard';
```

### Importing UI Components (admin)

```svelte
<script>
  import { Button, Input, Card } from '$lib/components/ui';
</script>
```

### API Routes Structure (Elysia)

Routes use Elysia's plugin pattern with prefix:
```typescript
export const clientRoutes = new Elysia({ prefix: '/clients' })
  .use(authMiddleware)
  .get('/', handler)
  .post('/', handler, { body: t.Object({...}) });
```

### Database Queries (Drizzle)

```typescript
// Query with relations
const client = await db.query.clients.findFirst({
  where: eq(clients.slug, slug),
  with: { links: true }
});

// Updates
await db.update(clients).set({ name }).where(eq(clients.id, id));
```

## Design System

Design tokens are centralized in `apps/admin/src/styles/variables.css`:
- Colors: `--color-primary` (#FF6B5B Coral), `--color-text`, `--color-bg`, etc.
- Spacing: `--space-xs` through `--space-2xl` (4px increments)
- Typography: Inter font, sizes via `--text-*` tokens
- Border radius: `--radius-sm` through `--radius-full`

## API Endpoints

- Auth: `POST /auth/sign-in/email`, `POST /auth/sign-out`, `GET /auth/session`
- Clients: `GET /clients/me`, `PUT /clients/me`, `PUT /clients/me/settings`
- Links: `GET /links`, `POST /links`, `PUT /links/:id`, `DELETE /links/:id`, `PUT /links/reorder`
- Publishing: `POST /publish`, `GET /publish/status`
- Public: `GET /public/clients`, `GET /public/clients/:slug`
- Features: `GET /qrcode/:format`, `GET /vcard/:slug`

## Naming Conventions

- Files: kebab-case (`api-client.ts`)
- Svelte components: PascalCase (`LinkCard.svelte`)
- Variables/functions: camelCase
- Constants: UPPER_SNAKE_CASE
- CSS variables: `--prefix-name`

## Publish Flow

1. Client clicks "Publish" in admin
2. API calls Vercel Deploy Hook
3. Vercel rebuilds Astro project (~30-60 sec)
4. New static pages go live
