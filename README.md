# jLinks

A customizable link page solution (Linktree-style) built with modern web technologies.

## Tech Stack

| Component | Technology |
|-----------|------------|
| **Runtime** | [Bun](https://bun.sh/) |
| **API** | Elysia + SQLite (bun:sqlite) + Drizzle ORM |
| **Admin** | SvelteKit 5 |
| **Public Pages** | Astro (static) |
| **Icons** | Lucide |
| **Fonts** | Google Fonts (Inter) |

## Project Structure

```
jlinks/
├── apps/
│   ├── api/              # Elysia backend API (port 3000)
│   ├── admin/            # SvelteKit admin dashboard (port 5173)
│   └── web/              # Astro public pages (port 4321)
├── packages/
│   └── shared/           # Shared types & utilities
├── docs/
│   ├── plan.md           # Development plan
│   ├── style.md          # Style guide
│   └── good_practices.md # Coding standards
└── README.md
```

---

## Prerequisites

### 1. Install Bun

```bash
curl -fsSL https://bun.sh/install | bash
```

### 2. Add Bun to PATH

Add to your `~/.bashrc` or `~/.zshrc`:

```bash
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"
```

Then reload:

```bash
source ~/.bashrc  # or source ~/.zshrc
```

Verify installation:

```bash
bun --version
```

---

## Installation

### 1. Clone & Install Dependencies

```bash
cd /path/to/jlinks
bun install
```

### 2. Setup Database

```bash
# Generate migrations from schema
bun run db:generate

# Apply migrations (creates SQLite database)
bun run db:migrate

# Seed with demo data
bun run db:seed
```

### 3. Configure Environment (Optional)

Copy example env files:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/admin/.env.example apps/admin/.env
cp apps/web/.env.example apps/web/.env
```

Default values work for local development.

---

## Development

### Start All Services

Open 3 terminals and run:

```bash
# Terminal 1 - API
bun run dev:api
# → http://localhost:3000

# Terminal 2 - Admin
bun run dev:admin
# → http://localhost:5173

# Terminal 3 - Public Pages
bun run dev:web
# → http://localhost:4321
```

### Quick Links

| URL | Description |
|-----|-------------|
| http://localhost:3000/health | API health check |
| http://localhost:5173 | Admin dashboard |
| http://localhost:5173/styleguide | Component library |
| http://localhost:4321 | Public homepage |
| http://localhost:4321/demo | Demo client page |

---

## Demo Credentials

After seeding the database:

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@jonlabs.ch | admin123 |
| Demo Client | demo@example.com | demo123 |

---

## Available Scripts

From project root:

| Script | Description |
|--------|-------------|
| `bun run dev:api` | Start API server |
| `bun run dev:admin` | Start admin dev server |
| `bun run dev:web` | Start public pages dev server |
| `bun run build:admin` | Build admin for production |
| `bun run build:web` | Build public pages |
| `bun run db:generate` | Generate migrations |
| `bun run db:migrate` | Run migrations |
| `bun run db:seed` | Seed demo data |
| `bun run db:studio` | Open Drizzle Studio |
| `bun run clean` | Remove all node_modules |

---

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/sign-in` | Login with email/password |
| POST | `/auth/sign-out` | Logout |
| GET | `/auth/session` | Get current session |
| POST | `/auth/change-password` | Change password |

### Clients

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/clients` | List all clients (super-admin) |
| POST | `/clients` | Create client (super-admin) |
| GET | `/clients/me` | Get own client data |
| PUT | `/clients/me` | Update profile |
| PUT | `/clients/me/settings` | Update settings |
| PUT | `/clients/me/branding` | Update logo/images |
| PUT | `/clients/me/vcard` | Update vCard settings |

### Links

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/links` | List all links |
| POST | `/links` | Create link |
| PUT | `/links/:id` | Update link |
| DELETE | `/links/:id` | Delete link |
| PUT | `/links/reorder` | Reorder links |
| POST | `/links/:id/toggle` | Toggle active state |

### Publishing

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/publish` | Trigger Astro rebuild |
| GET | `/publish/status` | Get publish status |

### Public (for Astro)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/public/clients` | List published clients |
| GET | `/public/clients/:slug` | Get client with links |

### Features

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/qrcode/:format` | Generate QR (png/svg) |
| GET | `/vcard/:slug` | Download vCard |

---

## Documentation

| Document | Description |
|----------|-------------|
| [docs/plan.md](./docs/plan.md) | Development roadmap |
| [docs/style.md](./docs/style.md) | Design system & tokens |
| [docs/good_practices.md](./docs/good_practices.md) | Coding standards |

---

## Styleguide

Visit **http://localhost:5173/styleguide** to see:

- Color palette
- Typography scale
- Spacing system
- UI Components (Button, Input, Card, Badge, Toggle, Modal, Toast)
- Icons

---

## Database

SQLite database stored at `apps/api/data/jlinks.db`

### Tables

- `clients` - Client profiles and settings
- `links` - Links for each client
- `users` - User accounts
- `sessions` - Auth sessions
- `link_clicks` - Analytics (future)
- `page_views` - Analytics (future)

### Drizzle Studio

```bash
bun run db:studio
```

Opens a visual database browser.

---

## Deployment

### API (VPS)

```bash
cd apps/api
bun run build
bun run dist/index.js
```

### Admin & Web (Vercel)

Both SvelteKit and Astro apps are configured for Vercel:

1. Connect repo to Vercel
2. Set root directory to `apps/admin` or `apps/web`
3. Configure environment variables
4. Deploy

---

## Troubleshooting

### "bun: command not found"

Add Bun to PATH (see Prerequisites section).

### Database errors

```bash
# Reset database
rm -rf apps/api/data/jlinks.db
bun run db:migrate
bun run db:seed
```

### Port already in use

```bash
# Find process using port 3000
lsof -i :3000
# Kill it
kill -9 <PID>
```

---

## License

Private - Jon Labs
