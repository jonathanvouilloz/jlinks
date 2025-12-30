# jLinks Development Plan

## Overview

jLinks is a customizable link page solution (Linktree-style) offered as a bonus to Jon Labs clients. Each client has a public page (`links.jonlabs.ch/[slug]`) with a simple admin interface to manage their links.

### Tech Stack

| Component | Technology |
|-----------|------------|
| API Backend | Elysia (Bun) + SQLite + Drizzle ORM |
| Authentication | Custom (session-based with cookies) |
| Admin Frontend | SvelteKit (Svelte 5) |
| Public Pages | Astro (static) |
| Icons | Lucide |
| Fonts | Google Fonts |
| Hosting | Vercel (admin + web) + VPS (API) |

---

## Progress Summary

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 1 | ✅ Complete | Setup & Foundations |
| Phase 2 | ✅ Complete | API Core |
| Phase 3 | ✅ Complete | Design System & Styleguide |
| Phase 4 | ✅ Complete | Admin - Auth & Layout |
| Phase 5 | ✅ Complete | Admin - Links Management |
| Phase 6 | ✅ Complete | Admin - Settings & Customization |
| Phase 7 | ✅ Complete | Publishing System |
| Phase 8 | ✅ Complete | Astro Public Pages |
| Phase 9 | ✅ Complete | Bonus Features (QR Code & vCard) |
| Phase 10 | ✅ Complete | Super-admin |
| Phase 11 | ✅ Complete | Polish & Deployment |

---

## Project Architecture

```
jlinks/
├── apps/
│   ├── api/                    # Elysia backend ✅
│   │   ├── src/
│   │   │   ├── index.ts        # Entry point
│   │   │   ├── db/
│   │   │   │   ├── schema.ts   # Drizzle schema
│   │   │   │   ├── index.ts    # DB connection
│   │   │   │   ├── migrate.ts  # Migration script
│   │   │   │   └── seed.ts     # Seed data
│   │   │   ├── routes/
│   │   │   │   ├── auth.ts
│   │   │   │   ├── clients.ts
│   │   │   │   ├── links.ts
│   │   │   │   ├── publish.ts
│   │   │   │   ├── qrcode.ts
│   │   │   │   └── vcard.ts
│   │   │   ├── lib/
│   │   │   │   └── rebuild.ts
│   │   │   └── middleware/
│   │   │       └── auth.ts
│   │   ├── drizzle/            # Migrations
│   │   └── ecosystem.config.cjs # PM2 configuration ✅
│   │
│   ├── admin/                  # SvelteKit admin ✅
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   │   ├── +layout.svelte      # Main layout with sidebar
│   │   │   │   ├── +page.svelte        # Dashboard with links + preview
│   │   │   │   ├── login/+page.svelte  # Login page
│   │   │   │   ├── settings/+page.svelte # Settings page
│   │   │   │   ├── styleguide/+page.svelte
│   │   │   │   └── admin/clients/+page.svelte # Super-admin
│   │   │   ├── lib/
│   │   │   │   ├── api.ts              # API client
│   │   │   │   ├── stores/             # Svelte 5 stores
│   │   │   │   │   ├── auth.svelte.ts
│   │   │   │   │   ├── client.svelte.ts
│   │   │   │   │   ├── links.svelte.ts
│   │   │   │   │   └── toast.svelte.ts
│   │   │   │   └── components/
│   │   │   │       ├── ui/             # Button, Input, Card, etc.
│   │   │   │       ├── layout/         # Sidebar, Header, ToastContainer
│   │   │   │       ├── dashboard/      # LinkCard, LinkForm, LinksList, Preview
│   │   │   │       └── settings/       # ColorPicker, FontSelector, LayoutSelector
│   │   │   └── styles/
│   │   │       ├── variables.css
│   │   │       └── global.css
│   │   └── vercel.json         # Vercel configuration ✅
│   │
│   └── web/                    # Astro public pages ✅
│       ├── src/
│       │   ├── pages/
│       │   │   ├── index.astro         # Landing page
│       │   │   ├── [slug].astro        # Dynamic client pages
│       │   │   └── 404.astro           # 404 error page ✅
│       │   ├── layouts/
│       │   │   ├── BaseLayout.astro    # Base layout (+ OG/Twitter meta)
│       │   │   ├── ListLayout.astro    # List layout
│       │   │   ├── CardsLayout.astro   # Cards layout (2-col grid)
│       │   │   └── GridLayout.astro    # Grid layout (3-col)
│       │   └── components/
│       │       ├── Icon.astro          # Lucide icons wrapper
│       │       ├── LinkButton.astro    # Link button with icon
│       │       ├── ProfileHeader.astro # Profile header
│       │       ├── VCardButton.astro   # vCard download
│       │       └── Footer.astro        # Footer with branding
│       └── vercel.json         # Vercel configuration ✅
│
├── deploy/                     # Deployment configs ✅
│   └── nginx/
│       └── jlinks-api.conf     # Nginx reverse proxy config
│
├── packages/
│   └── shared/                 # Shared types & utilities ✅
│       └── src/
│           ├── types.ts
│           ├── plans.ts
│           ├── social-presets.ts
│           └── vcard.ts
│
└── docs/
    ├── plan.md
    ├── style.md
    ├── good_practices.md
    └── DEPLOYMENT.md           # Complete deployment guide ✅
```

---

## Development Phases

### Phase 1: Setup & Foundations ✅ COMPLETE
- [x] Initialize Bun workspaces monorepo
- [x] Setup Elysia API with base config
- [x] Setup SQLite + Drizzle ORM with complete schema
- [x] Configure session-based auth
- [x] Setup SvelteKit for admin
- [x] Setup Astro for public pages
- [x] Setup packages/shared

### Phase 2: API Core ✅ COMPLETE
- [x] CRUD routes for clients (super-admin)
- [x] CRUD routes for links (scoped by client)
- [x] Reorder links route
- [x] Client settings routes (profile, settings, branding, vcard)
- [x] Public routes for Astro
- [x] Auth + role check middleware
- [x] Seed data for testing (admin@jonlabs.ch / demo@example.com)

### Phase 3: Design System & Styleguide ✅ COMPLETE
- [x] Create centralized CSS variables file
- [x] Create reusable UI components (Button, Input, Card, Badge, Toggle, Modal, Toast)
- [x] Create Styleguide page with all components
- [x] Document design system

### Phase 4: Admin - Auth & Layout ✅ COMPLETE
- [x] Functional login page
- [x] Global layout (sidebar + header)
- [x] Svelte 5 stores for auth state
- [x] API client with credentials (cookies)
- [x] Route protection (redirect to /login if not authenticated)
- [x] Super-admin route protection

### Phase 5: Admin - Links Management ✅ COMPLETE
- [x] Links list with drag & drop (svelte-dnd-action)
- [x] Create/edit links modal
- [x] Social preset selector (10 presets)
- [x] Custom styling mode (color pickers)
- [x] Active/inactive toggle
- [x] Live preview component

### Phase 6: Admin - Settings & Customization ✅ COMPLETE
- [x] Settings page with sections
- [x] Logo + profile image (URL input for MVP)
- [x] Color pickers (primary, secondary)
- [x] Background selector (solid/gradient/image)
- [x] Google Fonts selector (15 fonts)
- [x] Layout selector (list/cards/grid)
- [x] SEO fields (meta title, description)

### Phase 7: Publishing System ✅ COMPLETE
- [x] "Unpublished changes" badge in header
- [x] Publish button
- [x] API trigger Vercel webhook
- [x] User feedback (toast notifications)

### Phase 8: Astro Public Pages ✅ COMPLETE
- [x] Basic structure exists
- [x] Dynamic [slug].astro route with API integration
- [x] ListLayout.astro (complete implementation)
- [x] CardsLayout.astro (2-column grid with thumbnails)
- [x] GridLayout.astro (3-column compact grid)
- [x] Icon.astro component (Lucide icons wrapper)
- [x] LinkButton component with icon support
- [x] ProfileHeader component
- [x] Dynamic Google Fonts loading
- [x] SEO meta tags
- [x] vCard download button
- [x] Responsive design (480px breakpoint)
- [x] "Created with jLinks" footer (conditional on plan)

### Phase 9: Bonus Features (QR Code & vCard) ✅ COMPLETE
- [x] QR code generation API (/qrcode/:format)
- [x] vCard generation API (/vcard/:slug)
- [x] Admin UI for QR code preview + download (PNG/SVG)
- [x] Admin UI for vCard settings (toggle + form)
- [x] Public page vCard button (VCardButton.astro)

### Phase 10: Super-admin ✅ COMPLETE
- [x] Clients list table
- [x] Create client modal (slug, name, email, password)
- [x] Edit client modal (slug, name, plan)
- [x] Delete client with confirmation
- [ ] Impersonate functionality (optional, future)
- [ ] Basic stats dashboard (optional, future)

### Phase 11: Polish & Deployment ✅ COMPLETE
- [x] UI error handling (toast notifications)
- [x] Loading states
- [x] Form validation
- [x] Fix accessibility issues (aria-labels, aria-current, scope attributes)
- [x] Add SEO meta tags (Open Graph, Twitter Cards, canonical URLs)
- [x] Create 404 error page
- [x] Deployment documentation (`docs/DEPLOYMENT.md`)
- [x] PM2 configuration (`apps/api/ecosystem.config.cjs`)
- [x] Nginx reverse proxy configuration (`deploy/nginx/jlinks-api.conf`)
- [x] Vercel configuration files (`apps/admin/vercel.json`, `apps/web/vercel.json`)
- [ ] Manual end-to-end testing
- [ ] First production deployment

---

## What's Left To Do

### Priority 1: Production Deployment
1. Configure DNS records for all domains
2. Setup Vercel projects (admin + web) following `docs/DEPLOYMENT.md`
3. Configure VPS following `docs/DEPLOYMENT.md`
4. First production deployment

### Priority 2: Testing
1. Manual end-to-end testing of all flows
2. Fix any bugs discovered

### Future Enhancements (Post-MVP)
- Impersonate functionality for super-admin
- Basic stats dashboard
- Analytics (page views, link clicks)
- Custom domains support
- Stripe integration for paid plans

---

## Database Schema

### Tables

**clients**
- id, slug, name
- logo_url, profile_image_url
- primary_color, secondary_color
- background_type, background_value
- font_title, font_text
- layout_type
- bio, meta_title, meta_description
- is_published, has_draft_changes
- vcard_enabled, vcard_* fields
- plan (free/pro)
- timestamps

**links**
- id, client_id
- title, url, description
- icon, thumbnail_url
- social_preset
- custom_bg_color, custom_text_color
- is_active, sort_order, is_draft
- timestamps

**users**
- id, email, password_hash
- client_id
- role (client/super_admin)
- timestamps

**sessions**
- id, user_id, token, expires_at

**link_clicks** & **page_views**
- Analytics tables (Future phase)

---

## API Endpoints

### Authentication
- `POST /auth/sign-in` - Login with email/password
- `POST /auth/sign-out` - Logout
- `GET /auth/session` - Get current session
- `POST /auth/change-password` - Change password

### Clients
- `GET /clients` (super-admin) - List all clients
- `GET /clients/:id` (super-admin) - Get client with links
- `POST /clients` (super-admin) - Create client + user
- `PUT /clients/:id` (super-admin) - Update client
- `DELETE /clients/:id` (super-admin) - Delete client
- `GET /clients/me` - Get own client data
- `PUT /clients/me` - Update profile
- `PUT /clients/me/settings` - Update appearance settings
- `PUT /clients/me/branding` - Update logo/profile image
- `PUT /clients/me/vcard` - Update vCard settings

### Links
- `GET /links` - List own links
- `GET /links/:id` - Get link
- `POST /links` - Create link
- `PUT /links/:id` - Update link
- `DELETE /links/:id` - Delete link
- `PUT /links/reorder` - Reorder links
- `POST /links/:id/toggle` - Toggle active state

### Publishing
- `POST /publish` - Trigger Vercel rebuild
- `GET /publish/status` - Get publish status

### Public (for Astro)
- `GET /public/clients` - List published clients
- `GET /public/clients/:slug` - Get client + active links

### Features
- `GET /qrcode/:format` - Generate QR code (png/svg)
- `GET /qrcode/preview` - QR code preview
- `GET /vcard/:slug` - Download vCard file

---

## Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@jonlabs.ch | admin123 |
| Demo Client | demo@example.com | demo123 |

---

## Hosting Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      VERCEL                              │
├─────────────────────────────────────────────────────────┤
│  admin.links.jonlabs.ch  →  SvelteKit Admin             │
│  links.jonlabs.ch/[slug] →  Astro Static Pages          │
└─────────────────────────────────────────────────────────┘
                           │
                           │ HTTPS
                           ▼
┌─────────────────────────────────────────────────────────┐
│                      VPS                                 │
├─────────────────────────────────────────────────────────┤
│  api.links.jonlabs.ch   →  Elysia API                   │
│  SQLite Database        →  /data/jlinks.db              │
│  Uploads                →  /data/jlinks/uploads/        │
└─────────────────────────────────────────────────────────┘
```

### Publish Flow
1. Client clicks "Publish" in admin
2. API receives POST /publish
3. API calls Vercel Deploy Hook
4. Vercel rebuilds Astro project
5. New static pages live (~30-60 sec)
