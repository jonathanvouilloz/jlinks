# Plan de Migration : API Hono → SvelteKit API Routes

## Objectif
Migrer l'API backend standalone (apps/api - Hono) vers des API routes intégrées dans SvelteKit (apps/admin) pour éliminer les problèmes CORS.

---

## Vue d'ensemble

### Architecture actuelle
```
apps/
├── api/          ← Backend Hono standalone (à supprimer)
├── admin/        ← Frontend SvelteKit
└── web/          ← Pages publiques Astro (SSG)
```

### Architecture cible
```
apps/
├── admin/        ← SvelteKit avec API routes intégrées
│   └── src/
│       ├── routes/
│       │   ├── api/          ← NOUVEAU: API routes
│       │   │   ├── auth/
│       │   │   ├── clients/
│       │   │   ├── links/
│       │   │   ├── publish/
│       │   │   ├── public/
│       │   │   ├── qrcode/
│       │   │   └── vcard/
│       │   └── (pages existantes)
│       └── lib/
│           └── server/       ← NOUVEAU: Code serveur
│               ├── db/
│               └── auth/
└── web/          ← Astro (appelle admin/api/public/*)
```

---

## Inventaire des endpoints à migrer (32 total)

### Auth (7 endpoints)
| Endpoint | Méthode | Fichier SvelteKit cible |
|----------|---------|-------------------------|
| `/auth/sign-in` | POST | `api/auth/sign-in/+server.ts` |
| `/auth/sign-out` | POST | `api/auth/sign-out/+server.ts` |
| `/auth/session` | GET | `api/auth/session/+server.ts` |
| `/auth/change-password` | POST | `api/auth/change-password/+server.ts` |
| `/auth/forgot-password` | POST | `api/auth/forgot-password/+server.ts` |
| `/auth/reset-password` | POST | `api/auth/reset-password/+server.ts` |
| `/auth/account` | DELETE | `api/auth/account/+server.ts` |

### Clients - Super Admin (5 endpoints)
| Endpoint | Méthode | Fichier SvelteKit cible |
|----------|---------|-------------------------|
| `/clients` | GET | `api/clients/+server.ts` |
| `/clients` | POST | `api/clients/+server.ts` |
| `/clients/:id` | GET | `api/clients/[id]/+server.ts` |
| `/clients/:id` | PUT | `api/clients/[id]/+server.ts` |
| `/clients/:id` | DELETE | `api/clients/[id]/+server.ts` |

### Clients - Own Data (5 endpoints)
| Endpoint | Méthode | Fichier SvelteKit cible |
|----------|---------|-------------------------|
| `/clients/me` | GET | `api/clients/me/+server.ts` |
| `/clients/me` | PUT | `api/clients/me/+server.ts` |
| `/clients/me/settings` | PUT | `api/clients/me/settings/+server.ts` |
| `/clients/me/vcard` | PUT | `api/clients/me/vcard/+server.ts` |
| `/clients/me/branding` | PUT | `api/clients/me/branding/+server.ts` |

### Links (7 endpoints)
| Endpoint | Méthode | Fichier SvelteKit cible |
|----------|---------|-------------------------|
| `/links` | GET | `api/links/+server.ts` |
| `/links` | POST | `api/links/+server.ts` |
| `/links/:id` | GET | `api/links/[id]/+server.ts` |
| `/links/:id` | PUT | `api/links/[id]/+server.ts` |
| `/links/:id` | DELETE | `api/links/[id]/+server.ts` |
| `/links/reorder` | PUT | `api/links/reorder/+server.ts` |
| `/links/:id/toggle` | POST | `api/links/[id]/toggle/+server.ts` |

### Publish (2 endpoints)
| Endpoint | Méthode | Fichier SvelteKit cible |
|----------|---------|-------------------------|
| `/publish` | POST | `api/publish/+server.ts` |
| `/publish/status` | GET | `api/publish/status/+server.ts` |

### Public (2 endpoints)
| Endpoint | Méthode | Fichier SvelteKit cible |
|----------|---------|-------------------------|
| `/public/clients` | GET | `api/public/clients/+server.ts` |
| `/public/clients/:slug` | GET | `api/public/clients/[slug]/+server.ts` |

### VCard (1 endpoint)
| Endpoint | Méthode | Fichier SvelteKit cible |
|----------|---------|-------------------------|
| `/vcard/:slug` | GET | `api/vcard/[slug]/+server.ts` |

### QRCode (2 endpoints)
| Endpoint | Méthode | Fichier SvelteKit cible |
|----------|---------|-------------------------|
| `/qrcode/:format` | GET | `api/qrcode/[format]/+server.ts` |
| `/qrcode/preview` | GET | `api/qrcode/preview/+server.ts` |

### Health (1 endpoint)
| Endpoint | Méthode | Fichier SvelteKit cible |
|----------|---------|-------------------------|
| `/health` | GET | `api/health/+server.ts` |

---

## Étapes de migration détaillées

### Phase 1 : Préparation de l'infrastructure

#### 1.1 Créer la structure de dossiers
```bash
# Dans apps/admin/src
mkdir -p lib/server/db
mkdir -p lib/server/auth
mkdir -p routes/api/auth
mkdir -p routes/api/clients/me
mkdir -p routes/api/clients/[id]
mkdir -p routes/api/links/[id]
mkdir -p routes/api/links/reorder
mkdir -p routes/api/publish
mkdir -p routes/api/public/clients/[slug]
mkdir -p routes/api/qrcode/[format]
mkdir -p routes/api/qrcode/preview
mkdir -p routes/api/vcard/[slug]
```

#### 1.2 Copier et adapter la connexion DB
**Source**: `apps/api/src/db/index.ts`
**Destination**: `apps/admin/src/lib/server/db/index.ts`

```typescript
// apps/admin/src/lib/server/db/index.ts
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';

const DATABASE_URL = import.meta.env.DATABASE_URL;
const TURSO_AUTH_TOKEN = import.meta.env.TURSO_AUTH_TOKEN;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

const client = createClient({
  url: DATABASE_URL,
  authToken: TURSO_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });
export * from './schema';
```

#### 1.3 Copier le schéma DB
**Source**: `apps/api/src/db/schema.ts`
**Destination**: `apps/admin/src/lib/server/db/schema.ts`

Copier intégralement le fichier (253 lignes).

#### 1.4 Copier les utilitaires d'auth
**Source**: `apps/api/src/lib/auth.ts`
**Destination**: `apps/admin/src/lib/server/auth/password.ts`

```typescript
// apps/admin/src/lib/server/auth/password.ts
import { hashPassword as scryptHash, verifyPassword as scryptVerify } from 'better-auth/crypto';

export async function verifySHA256(password: string, hash: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const inputHash = Buffer.from(hashBuffer).toString('hex');
  return inputHash === hash;
}

export async function hashPassword(password: string): Promise<string> {
  return scryptHash(password);
}

export async function verifyPassword(password: string, hash: string, needsUpgrade: boolean): Promise<boolean> {
  if (needsUpgrade) {
    return verifySHA256(password, hash);
  }
  try {
    return await scryptVerify({ password, hash });
  } catch {
    return false;
  }
}
```

#### 1.5 Créer le helper de session
**Nouveau fichier**: `apps/admin/src/lib/server/auth/session.ts`

```typescript
import type { RequestEvent } from '@sveltejs/kit';
import { db, users, sessions, clients } from '../db';
import { eq, and, gt, or } from 'drizzle-orm';
import type { User, Client } from '@noko/shared/types';

export interface SessionData {
  user: User | null;
  client: Client | null;
  session: { id: string; expires_at: string } | null;
}

export async function getSession(event: RequestEvent): Promise<SessionData> {
  const sessionId = event.cookies.get('session');

  if (!sessionId) {
    return { user: null, client: null, session: null };
  }

  try {
    const now = new Date().toISOString();
    const session = await db.query.sessions.findFirst({
      where: and(
        or(eq(sessions.id, sessionId), eq(sessions.token, sessionId)),
        gt(sessions.expires_at, now)
      ),
      with: {
        user: {
          with: {
            client: true,
          },
        },
      },
    });

    if (!session || !session.user) {
      return { user: null, client: null, session: null };
    }

    return {
      user: session.user as unknown as User,
      client: session.user.client as unknown as Client | null,
      session: {
        id: session.id,
        expires_at: session.expires_at,
      },
    };
  } catch (error) {
    console.error('Session error:', error);
    return { user: null, client: null, session: null };
  }
}

export function requireAuth(sessionData: SessionData) {
  if (!sessionData.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  return null;
}

export function requireClient(sessionData: SessionData) {
  if (!sessionData.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  if (!sessionData.client) {
    return new Response(JSON.stringify({ error: 'Forbidden: No client' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  return null;
}

export function requireSuperAdmin(sessionData: SessionData) {
  if (!sessionData.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  if (sessionData.user.role !== 'super_admin') {
    return new Response(JSON.stringify({ error: 'Forbidden: Super admin required' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  return null;
}
```

---

### Phase 2 : Migration des routes API

#### 2.1 Exemple de route - GET /api/auth/session

**Source**: `apps/api/src/routes/auth.ts` (lignes 45-85)
**Destination**: `apps/admin/src/routes/api/auth/session/+server.ts`

```typescript
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getSession } from '$lib/server/auth/session';

export const GET: RequestHandler = async (event) => {
  const sessionData = await getSession(event);

  return json({
    user: sessionData.user,
    client: sessionData.client,
  });
};
```

#### 2.2 Exemple de route - POST /api/auth/sign-in

**Destination**: `apps/admin/src/routes/api/auth/sign-in/+server.ts`

```typescript
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db, users, sessions, clients } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { verifyPassword, hashPassword } from '$lib/server/auth/password';

// Rate limiting (in-memory pour MVP)
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

export const POST: RequestHandler = async (event) => {
  const ip = event.getClientAddress();

  // Rate limiting check
  const attempts = loginAttempts.get(ip);
  if (attempts && attempts.count >= 5 && Date.now() < attempts.resetAt) {
    const retryAfter = Math.ceil((attempts.resetAt - Date.now()) / 1000);
    return new Response(JSON.stringify({ error: 'Too many attempts' }), {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'X-Retry-After': retryAfter.toString()
      }
    });
  }

  const { email, password } = await event.request.json();

  if (!email || !password) {
    return json({ error: 'Email and password required' }, { status: 400 });
  }

  // Find user
  const user = await db.query.users.findFirst({
    where: eq(users.email, email.toLowerCase()),
    with: { client: true },
  });

  if (!user || !user.password_hash) {
    // Track failed attempt
    const current = loginAttempts.get(ip) || { count: 0, resetAt: Date.now() + 15 * 60 * 1000 };
    loginAttempts.set(ip, { count: current.count + 1, resetAt: current.resetAt });
    return json({ error: 'Invalid credentials' }, { status: 401 });
  }

  // Verify password
  const valid = await verifyPassword(password, user.password_hash, user.password_needs_upgrade ?? false);

  if (!valid) {
    const current = loginAttempts.get(ip) || { count: 0, resetAt: Date.now() + 15 * 60 * 1000 };
    loginAttempts.set(ip, { count: current.count + 1, resetAt: current.resetAt });
    return json({ error: 'Invalid credentials' }, { status: 401 });
  }

  // Upgrade password if needed
  if (user.password_needs_upgrade) {
    const newHash = await hashPassword(password);
    await db.update(users)
      .set({ password_hash: newHash, password_needs_upgrade: false })
      .where(eq(users.id, user.id));
  }

  // Create session
  const sessionId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days

  await db.insert(sessions).values({
    id: sessionId,
    user_id: user.id,
    expires_at: expiresAt,
    ip_address: ip,
    user_agent: event.request.headers.get('user-agent'),
  });

  // Set cookie
  event.cookies.set('session', sessionId, {
    path: '/',
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });

  // Clear rate limiting
  loginAttempts.delete(ip);

  return json({
    user: {
      id: user.id,
      email: user.email,
      client_id: user.client_id,
      role: user.role,
      created_at: user.created_at,
    },
    client: user.client,
  });
};
```

#### 2.3 Liste complète des fichiers à créer

```
apps/admin/src/routes/api/
├── health/
│   └── +server.ts                    # GET
├── auth/
│   ├── sign-in/
│   │   └── +server.ts                # POST
│   ├── sign-out/
│   │   └── +server.ts                # POST
│   ├── session/
│   │   └── +server.ts                # GET
│   ├── change-password/
│   │   └── +server.ts                # POST
│   ├── forgot-password/
│   │   └── +server.ts                # POST
│   ├── reset-password/
│   │   └── +server.ts                # POST
│   └── account/
│       └── +server.ts                # DELETE
├── clients/
│   ├── +server.ts                    # GET (list), POST (create) - admin only
│   ├── [id]/
│   │   └── +server.ts                # GET, PUT, DELETE - admin only
│   └── me/
│       ├── +server.ts                # GET, PUT
│       ├── settings/
│       │   └── +server.ts            # PUT
│       ├── vcard/
│       │   └── +server.ts            # PUT
│       └── branding/
│           └── +server.ts            # PUT
├── links/
│   ├── +server.ts                    # GET (list), POST (create)
│   ├── [id]/
│   │   ├── +server.ts                # GET, PUT, DELETE
│   │   └── toggle/
│   │       └── +server.ts            # POST
│   └── reorder/
│       └── +server.ts                # PUT
├── publish/
│   ├── +server.ts                    # POST
│   └── status/
│       └── +server.ts                # GET
├── public/
│   └── clients/
│       ├── +server.ts                # GET (list all published)
│       └── [slug]/
│           └── +server.ts            # GET (single client)
├── qrcode/
│   ├── [format]/
│   │   └── +server.ts                # GET (png/svg)
│   └── preview/
│       └── +server.ts                # GET
└── vcard/
    └── [slug]/
        └── +server.ts                # GET
```

---

### Phase 3 : Mise à jour du client API (admin)

#### 3.1 Modifier apps/admin/src/lib/api.ts

**Changement principal** : Remplacer `PUBLIC_API_URL` par des chemins relatifs `/api`.

```typescript
// apps/admin/src/lib/api.ts
// Avant:
// const API_URL = import.meta.env.PUBLIC_API_URL || '/api';
// const response = await fetch(`${API_URL}/auth/session`, ...);

// Après:
const response = await fetch('/api/auth/session', ...);
```

Le fichier entier reste le même, seule la base URL change pour être relative.

#### 3.2 Supprimer les variables d'environnement inutiles

**Fichier**: `apps/admin/.env`
**Supprimer**: `PUBLIC_API_URL`

---

### Phase 4 : Mise à jour de l'app Web (Astro)

#### 4.1 Modifier la variable API_URL

**Fichier**: `apps/web/.env` et config Vercel
**Changement**: Pointer vers l'admin au lieu de l'API standalone

```bash
# Avant:
API_URL=https://api.nokolink.com

# Après:
API_URL=https://admin.nokolink.com/api
```

#### 4.2 Mettre à jour le composant VCard

**Fichier**: `apps/web/src/components/VCardButton.astro`

```astro
---
const { slug } = Astro.props;
const apiUrl = import.meta.env.API_URL || 'http://localhost:5173/api';
const vcardUrl = `${apiUrl}/vcard/${slug}`;
---
```

---

### Phase 5 : Configuration et dépendances

#### 5.1 Ajouter les dépendances à apps/admin/package.json

```json
{
  "dependencies": {
    "@libsql/client": "^0.15.15",
    "drizzle-orm": "^0.31.1",
    "better-auth": "^1.4.10",
    "qrcode": "^1.5.4",
    "resend": "^6.6.0"
  },
  "devDependencies": {
    "@types/qrcode": "^1.5.5"
  }
}
```

#### 5.2 Variables d'environnement pour apps/admin

**Fichier**: `apps/admin/.env`

```bash
# Database (Turso)
DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-token

# Auth
BETTER_AUTH_SECRET=your-secret-min-32-chars

# Email (Resend)
RESEND_API_KEY=re_xxxxx
ADMIN_URL=https://admin.nokolink.com

# Publish
VERCEL_DEPLOY_HOOK=https://api.vercel.com/v1/integrations/deploy/...

# Public site
PUBLIC_SITE_URL=https://nokolink.com
```

#### 5.3 Configurer Vercel pour admin

**Fichier**: `apps/admin/vercel.json` (si nécessaire)

```json
{
  "regions": ["fra1"]
}
```

---

### Phase 6 : Nettoyage

#### 6.1 Archiver/supprimer apps/api

```bash
# Option 1: Supprimer
rm -rf apps/api

# Option 2: Archiver
mv apps/api apps/api-archived
```

#### 6.2 Mettre à jour les scripts root package.json

```json
{
  "scripts": {
    "dev:admin": "cd apps/admin && bun run dev",
    "dev:web": "cd apps/web && bun run dev",
    "build:admin": "cd apps/admin && bun run build",
    "build:web": "cd apps/web && bun run build",
    "db:generate": "cd apps/admin && drizzle-kit generate",
    "db:migrate": "cd apps/admin && drizzle-kit migrate",
    "db:studio": "cd apps/admin && drizzle-kit studio"
  }
}
```

#### 6.3 Mettre à jour le projet Vercel API

Supprimer le projet Vercel pour l'API standalone ou le rediriger vers l'admin.

---

## Checklist de validation

### Tests à effectuer après migration

- [ ] **Auth**: Login/logout fonctionne
- [ ] **Auth**: Session persist après refresh
- [ ] **Auth**: Change password fonctionne
- [ ] **Auth**: Forgot/reset password fonctionne
- [ ] **Clients**: GET /me retourne les données
- [ ] **Clients**: PUT /me met à jour le profil
- [ ] **Clients**: PUT /me/settings met à jour l'apparence
- [ ] **Links**: CRUD complet fonctionne
- [ ] **Links**: Reorder fonctionne
- [ ] **Links**: Toggle active fonctionne
- [ ] **Publish**: Trigger build Vercel
- [ ] **Publish**: Status retourne les bonnes valeurs
- [ ] **Public**: Liste des clients published
- [ ] **Public**: Détail client avec links
- [ ] **VCard**: Téléchargement fonctionne
- [ ] **QRCode**: Preview et download fonctionnent
- [ ] **Admin**: Liste/CRUD clients (super admin)
- [ ] **Web**: Build Astro fonctionne
- [ ] **Web**: Pages générées correctement

---

## Ordre d'exécution recommandé

1. **Phase 1.1-1.5** : Setup infrastructure (DB, auth helpers)
2. **Phase 2** : Migrer les routes une par une, en testant chaque groupe
   - Auth routes en premier (critique)
   - Clients routes
   - Links routes
   - Publish routes
   - Public routes (pour tester avec Astro)
   - QRCode/VCard en dernier
3. **Phase 3** : Mettre à jour le client API
4. **Phase 4** : Mettre à jour Astro
5. **Phase 5** : Config et dépendances
6. **Phase 6** : Nettoyage final

---

## Fichiers de référence (apps/api → copier la logique)

| Fichier source | Contenu |
|----------------|---------|
| `apps/api/src/routes/auth.ts` | 7 endpoints auth + rate limiting |
| `apps/api/src/routes/clients.ts` | 10 endpoints clients |
| `apps/api/src/routes/links.ts` | 7 endpoints links |
| `apps/api/src/routes/publish.ts` | 2 endpoints publish |
| `apps/api/src/routes/public.ts` | 2 endpoints public |
| `apps/api/src/routes/qrcode.ts` | 2 endpoints qrcode |
| `apps/api/src/routes/vcard.ts` | 1 endpoint vcard |
| `apps/api/src/middleware/auth.ts` | Session validation |
| `apps/api/src/lib/auth.ts` | Password hashing |
| `apps/api/src/lib/email.ts` | Email sending |
| `apps/api/src/db/schema.ts` | Database schema |
| `apps/api/src/db/index.ts` | DB connection |
