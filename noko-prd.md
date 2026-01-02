# Noko — Product Requirements Document (PRD)

## 📋 Vue d'ensemble

**Nom du produit :** Noko
**Propriétaire :** Jon Labs (Jonathan Vouilloz)  
**Version :** 1.0 MVP  
**Date :** Décembre 2024

### Description

Noko est une solution de page de liens personnalisée (style Linktree) proposée en bonus aux clients de Jon Labs. Chaque client dispose d'une page publique (`nokolink.com/[slug]`) entièrement personnalisable, avec une interface d'administration simple pour gérer ses liens.

### Objectifs

1. **Valeur ajoutée client** — Offrir un bonus différenciant lors de la création de sites web
2. **Cohérence de marque** — Pages 100% personnalisables aux couleurs du client
3. **Simplicité** — Interface admin intuitive pour clients non-techniques
4. **Performance** — Pages statiques ultra-rapides
5. **Scalabilité** — Architecture permettant une évolution vers un produit standalone

### Non-objectifs (hors scope MVP)

- Domaines personnalisés (phase future)
- Analytics avancés (phase 2)
- Intégrations tierces (Zapier, etc.)
- App mobile
- Système de paiement (phase 2 — MVP = tout gratuit)

---

## 💰 Modèle Pricing

### Philosophie

Freemium simple : offre gratuite généreuse pour acquisition, plan Pro pour débloquer les extras. **Pour le MVP, tout est gratuit** — le système de paiement sera ajouté en phase 2.

### Plans

| | Free | Pro |
|---|---|---|
| **Prix** | CHF 0.- | CHF 5.-/mois ou Lifetime (prix TBD) |
| **Liens** | 6 max | Illimité |
| **Couleurs** | ✅ Personnalisation de base | ✅ Personnalisation complète |
| **Layouts** | 1 (List) | 3 (List, Cards, Grid) |
| **Logo/Photo profil** | ✅ | ✅ |
| **Fonts custom** | ❌ (Inter par défaut) | ✅ Google Fonts |
| **Arrière-plan** | Couleur solide | Couleur, dégradé, image |
| **Analytics** | ❌ | ✅ Vues + clics |
| **Badge "Noko"** | ✅ Affiché | ❌ Retiré |
| **Support** | Community | Prioritaire |

### Évolutions futures (post-MVP)

- Domaine personnalisé (Pro+)
- Export données
- Intégrations (Zapier, webhooks)
- Thèmes premium
- Multi-pages

---

## ✨ Features différenciantes

### QR Code brandé (MVP)

Chaque client a accès à un QR code personnalisé aux couleurs de sa page, téléchargeable depuis l'admin.

**Emplacement UI :** Section dédiée dans le dashboard ou Settings

**Fonctionnalités :**
- Génération auto à partir de l'URL publique (`nokolink.com/slug`)
- Couleurs basées sur `primary_color` du client
- Téléchargement PNG (pour print) et SVG (pour web/vectoriel)
- Preview en temps réel

**Implémentation technique :**

```typescript
// apps/api/src/routes/qrcode.ts
import { Elysia } from 'elysia';
import QRCode from 'qrcode'; // ou qrcode-svg pour plus de contrôle

export const qrcodeRoutes = new Elysia({ prefix: '/qrcode' })
  .get('/:format', async ({ params, user, error }) => {
    if (!user) return error(401, 'Unauthorized');
    
    const client = await getClientById(user.clientId);
    const url = `https://nokolink.com/${client.slug}`;
    
    const options = {
      color: {
        dark: client.primary_color || '#000000',
        light: '#FFFFFF',
      },
      width: 1024,
      margin: 2,
    };
    
    // Ajouter ?src=qr pour tracker les scans QR dans les analytics
    const trackableUrl = `${url}?src=qr`;
    
    if (params.format === 'png') {
      const buffer = await QRCode.toBuffer(trackableUrl, { ...options, type: 'png' });
      return new Response(buffer, {
        headers: { 
          'Content-Type': 'image/png',
          'Content-Disposition': `attachment; filename="${client.slug}-qrcode.png"`
        }
      });
    }
    
    if (params.format === 'svg') {
      const svg = await QRCode.toString(trackableUrl, { ...options, type: 'svg' });
      return new Response(svg, {
        headers: { 
          'Content-Type': 'image/svg+xml',
          'Content-Disposition': `attachment; filename="${client.slug}-qrcode.svg"`
        }
      });
    }
    
    return error(400, 'Format must be png or svg');
  });
```

**UI Admin (SvelteKit) :**

```svelte
<!-- components/QRCodeSection.svelte -->
<script>
  export let client;
  
  $: previewUrl = `${API_URL}/qrcode/svg?preview=true`;
</script>

<div class="card">
  <h3>QR Code</h3>
  <p class="text-secondary">Télécharge ton QR code pour tes cartes de visite, flyers, affiches...</p>
  
  <div class="qr-preview">
    <img src={previewUrl} alt="QR Code preview" />
  </div>
  
  <div class="download-buttons">
    <a href="{API_URL}/qrcode/png" download class="btn-secondary">
      <Download size={16} /> PNG (impression)
    </a>
    <a href="{API_URL}/qrcode/svg" download class="btn-secondary">
      <Download size={16} /> SVG (web)
    </a>
  </div>
</div>
```

---

### Bouton "Ajouter aux contacts" / vCard (MVP)

Option permettant aux visiteurs de sauvegarder les coordonnées du client directement dans leur téléphone.

**Activation :** Toggle ON/OFF dans Settings

**Données vCard configurables :**
- Nom complet
- Email
- Téléphone
- Site web (URL de la page Noko ou custom)
- Entreprise (optionnel)

**Dans la DB :**

```sql
-- Ajout à la table clients
ALTER TABLE clients ADD COLUMN vcard_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE clients ADD COLUMN vcard_name TEXT;
ALTER TABLE clients ADD COLUMN vcard_email TEXT;
ALTER TABLE clients ADD COLUMN vcard_phone TEXT;
ALTER TABLE clients ADD COLUMN vcard_company TEXT;
ALTER TABLE clients ADD COLUMN vcard_website TEXT;
```

**Génération vCard :**

```typescript
// packages/shared/src/vcard.ts

export function generateVCard(data: {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  website?: string;
}): string {
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${data.name}`,
  ];
  
  if (data.company) lines.push(`ORG:${data.company}`);
  if (data.email) lines.push(`EMAIL:${data.email}`);
  if (data.phone) lines.push(`TEL:${data.phone}`);
  if (data.website) lines.push(`URL:${data.website}`);
  
  lines.push('END:VCARD');
  
  return lines.join('\r\n');
}
```

**API Endpoint :**

```typescript
// apps/api/src/routes/vcard.ts
import { Elysia } from 'elysia';
import { generateVCard } from '@jlinks/shared';

export const vcardRoutes = new Elysia({ prefix: '/vcard' })
  .get('/:slug', async ({ params, error }) => {
    const client = await getClientBySlug(params.slug);
    
    if (!client || !client.vcard_enabled) {
      return error(404, 'Not found');
    }
    
    const vcard = generateVCard({
      name: client.vcard_name || client.name,
      email: client.vcard_email,
      phone: client.vcard_phone,
      company: client.vcard_company,
      website: client.vcard_website || `https://nokolink.com/${client.slug}`,
    });
    
    return new Response(vcard, {
      headers: {
        'Content-Type': 'text/vcard',
        'Content-Disposition': `attachment; filename="${client.slug}.vcf"`,
      },
    });
  });
```

**UI Page publique (Astro) :**

```astro
<!-- Dans le layout, si vcard_enabled -->
{client.vcard_enabled && (
  <a 
    href={`${API_URL}/vcard/${client.slug}`}
    class="vcard-button"
    download
  >
    <UserPlus size={20} />
    Ajouter aux contacts
  </a>
)}
```

**Style du bouton :** Discret, en bas de page, avant le footer "Créé avec Noko". Style outlined/ghost pour ne pas concurrencer les liens principaux.

**UI Admin Settings :**

```svelte
<!-- Dans la page Settings -->
<div class="card">
  <div class="card-header">
    <h3>Carte de contact</h3>
    <Toggle bind:checked={vcardEnabled} />
  </div>
  
  {#if vcardEnabled}
    <div class="form-fields">
      <Input label="Nom complet" bind:value={vcardName} placeholder={client.name} />
      <Input label="Email" type="email" bind:value={vcardEmail} />
      <Input label="Téléphone" type="tel" bind:value={vcardPhone} />
      <Input label="Entreprise" bind:value={vcardCompany} />
      <Input label="Site web" bind:value={vcardWebsite} placeholder="https://..." />
    </div>
    <p class="hint">Les visiteurs pourront t'ajouter à leurs contacts en un tap.</p>
  {/if}
</div>
```

### Implémentation technique

```typescript
// packages/shared/src/plans.ts

export const PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    maxLinks: 6,
    features: {
      customColors: true,        // Couleurs de base uniquement
      customFonts: false,        // Inter forcé
      layouts: ['list'],         // Un seul layout
      backgroundTypes: ['solid'], // Couleur solide uniquement
      analytics: false,
      removeBranding: false,
    }
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    maxLinks: Infinity,
    features: {
      customColors: true,
      customFonts: true,
      layouts: ['list', 'cards', 'grid'],
      backgroundTypes: ['solid', 'gradient', 'image'],
      analytics: true,
      removeBranding: true,
    }
  }
} as const;
```

### Dans la DB

```sql
-- Ajout à la table clients
ALTER TABLE clients ADD COLUMN plan TEXT DEFAULT 'free'; -- 'free' | 'pro'
ALTER TABLE clients ADD COLUMN plan_expires_at TEXT;      -- NULL = lifetime ou free
```

### MVP Scope

Pour le lancement :
- **Tous les clients sont "Pro" par défaut** (pas de restrictions)
- L'UI affiche les limites mais ne les enforce pas
- Stripe/paiement = phase 2
- Focus sur la valeur produit d'abord

### UI des restrictions (Phase 2)

Quand le système de plans sera actif, voici comment afficher les limites :

```svelte
<!-- Exemple : limite de liens atteinte -->
{#if links.length >= plan.maxLinks && plan.id === 'free'}
  <div class="upgrade-prompt">
    <p>Tu as atteint la limite de {plan.maxLinks} liens.</p>
    <a href="/upgrade" class="btn-primary">Passer à Pro</a>
  </div>
{/if}

<!-- Exemple : feature Pro locked -->
{#if !plan.features.customFonts}
  <div class="feature-locked">
    <Lock size={16} />
    <span>Fonts personnalisées</span>
    <span class="badge-pro">Pro</span>
  </div>
{/if}
```

---

## 🏗️ Architecture technique

### Stack

| Composant | Technologie | Justification |
|-----------|-------------|---------------|
| API Backend | **Elysia** (Bun) | Performance, DX moderne, TypeScript natif |
| Base de données | **SQLite** + **Drizzle ORM** | Léger, portable, suffisant pour le volume |
| Authentification | **Better Auth** | Intégration Elysia, feature-complete |
| Admin Frontend | **SvelteKit** | Réactivité, DX, preview live fluide |
| Pages publiques | **Astro** (static) | Performance maximale, SEO optimal |
| Icônes | **Lucide** | Complet, cohérent, inclut réseaux sociaux |
| Polices | **Google Fonts** | Large choix, performance optimisée |
| Hébergement | **Hybride Vercel + VPS** | Voir détails ci-dessous |

### Architecture d'hébergement

```
┌─────────────────────────────────────────────────────────────────┐
│                         VERCEL (gratuit)                        │
│  CDN mondial, déploiement automatique via GitHub                │
├─────────────────────────────────────────────────────────────────┤
│  • Admin SvelteKit      → admin.nokolink.com               │
│  • Pages publiques Astro → nokolink.com/[slug]             │
│  • Rebuild auto via webhook depuis l'API                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      VPS JON LABS                               │
│  Serveur existant (n8n, etc.)                                   │
├─────────────────────────────────────────────────────────────────┤
│  • API Elysia           → api.nokolink.com                 │
│  • SQLite database      → /data/jlinks.db                      │
│  • Uploads (images)     → /data/jlinks/uploads/                │
│  • Process manager      → PM2 ou Docker                        │
└─────────────────────────────────────────────────────────────────┘
```

**Pourquoi ce split :**
- **Vercel** = CDN gratuit, rebuild Astro natif (webhook), zéro config SSL
- **VPS** = API stateful (SQLite), stockage persistant (uploads), tu contrôles

**Workflow de publication :**
```
Client clique "Publier"
        │
        ▼
API Elysia (VPS) reçoit POST /publish
        │
        ▼
API appelle Vercel Deploy Hook (webhook URL)
        │
        ▼
Vercel rebuild le projet Astro automatiquement
        │
        ▼
Nouvelles pages statiques en ligne (~30-60 sec)
```

### Architecture globale

```
┌─────────────────────────────────────────────────────────────────┐
│                         INTERNET                                 │
└─────────────────────────────────────────────────────────────────┘
                    │                           │
                    ▼                           ▼
┌──────────────────────────────┐  ┌──────────────────────────────┐
│   admin.nokolink.com     │  │    nokolink.com/[slug]   │
│        (SvelteKit)           │  │         (Astro static)       │
│                              │  │                              │
│  • Login/Auth                │  │  • Pages publiques           │
│  • Gestion liens             │  │  • Générées au build         │
│  • Preview live              │  │  • Servies par Nginx         │
│  • Settings                  │  │                              │
│  • Super-admin               │  │                              │
└──────────────────────────────┘  └──────────────────────────────┘
                    │                           ▲
                    ▼                           │
┌──────────────────────────────────────────────────────────────────┐
│                        API (Elysia)                              │
│                    api.nokolink.com                          │
├──────────────────────────────────────────────────────────────────┤
│  • Auth (Better Auth)                                            │
│  • CRUD Clients                                                  │
│  • CRUD Links                                                    │
│  • Settings                                                      │
│  • POST /publish → Trigger Astro rebuild                         │
└──────────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────────────────┐
│                      SQLite Database                             │
│                        jlinks.db                                 │
└──────────────────────────────────────────────────────────────────┘
```

### Structure des dossiers

```
jlinks/
├── apps/
│   ├── api/                    # Elysia backend
│   │   ├── src/
│   │   │   ├── index.ts        # Entry point
│   │   │   ├── db/
│   │   │   │   ├── schema.ts   # Drizzle schema
│   │   │   │   └── index.ts    # DB connection
│   │   │   ├── routes/
│   │   │   │   ├── auth.ts
│   │   │   │   ├── clients.ts
│   │   │   │   ├── links.ts
│   │   │   │   └── publish.ts
│   │   │   ├── lib/
│   │   │   │   ├── auth.ts     # Better Auth config
│   │   │   │   └── rebuild.ts  # Astro rebuild logic
│   │   │   └── types/
│   │   ├── drizzle/            # Migrations
│   │   └── package.json
│   │
│   ├── admin/                  # SvelteKit admin
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   │   ├── +layout.svelte
│   │   │   │   ├── +page.svelte          # Dashboard
│   │   │   │   ├── login/
│   │   │   │   ├── links/
│   │   │   │   ├── settings/
│   │   │   │   └── admin/                # Super-admin routes
│   │   │   ├── lib/
│   │   │   │   ├── api.ts                # API client
│   │   │   │   ├── stores/               # Svelte stores
│   │   │   │   └── components/
│   │   │   │       ├── LinkCard.svelte
│   │   │   │       ├── Preview.svelte
│   │   │   │       ├── ColorPicker.svelte
│   │   │   │       └── FontSelector.svelte
│   │   └── package.json
│   │
│   └── web/                    # Astro public pages
│       ├── src/
│       │   ├── pages/
│       │   │   └── [slug].astro
│       │   ├── layouts/
│       │   │   ├── ListLayout.astro
│       │   │   ├── CardsLayout.astro
│       │   │   └── GridLayout.astro
│       │   ├── components/
│       │   │   ├── LinkButton.astro
│       │   │   ├── ProfileHeader.astro
│       │   │   └── SocialIcon.astro
│       │   └── styles/
│       └── package.json
│
├── packages/
│   └── shared/                 # Types partagés
│       ├── src/
│       │   └── types.ts
│       └── package.json
│
├── scripts/
│   └── rebuild.sh              # Script de rebuild Astro
│
├── package.json                # Workspace root (Bun)
├── bun.lockb
└── README.md
```

---

## 🎨 Design System — Admin Interface

### Philosophie

Interface **minimaliste type Linear/Notion** — focus sur la fonction, pas sur le branding. L'admin doit être épuré, rapide, sans friction.

### Palette Admin

```css
:root {
  /* Couleurs principales */
  --admin-bg: #FAFAFA;              /* Fond général */
  --admin-surface: #FFFFFF;         /* Cartes, modals, inputs */
  --admin-border: #E5E5E5;          /* Bordures subtiles */
  --admin-border-hover: #D4D4D4;    /* Bordures hover */
  
  /* Accent (turquoise Jon Labs) */
  --admin-primary: #00D9A3;         /* Boutons primaires, accents */
  --admin-primary-hover: #00A87D;   /* Hover boutons */
  --admin-primary-light: #E6FBF5;   /* Background léger (selected, badges) */
  
  /* Texte */
  --admin-text: #0F172A;            /* Texte principal */
  --admin-text-secondary: #64748B;  /* Texte secondaire, labels */
  --admin-text-muted: #94A3B8;      /* Placeholder, hints */
  
  /* États */
  --admin-success: #10B981;         /* Succès, publié */
  --admin-warning: #F59E0B;         /* Warning, brouillon */
  --admin-error: #EF4444;           /* Erreur, suppression */
  
  /* Sidebar */
  --admin-sidebar-bg: #FFFFFF;
  --admin-sidebar-hover: #F5F5F5;
  --admin-sidebar-active: #E6FBF5;  /* Turquoise très léger */
}
```

### Typographie

| Élément | Font | Poids | Taille |
|---------|------|-------|--------|
| Titres pages | Inter | 600 | 24px |
| Titres sections | Inter | 600 | 18px |
| Labels | Inter | 500 | 14px |
| Body | Inter | 400 | 14px |
| Small/hints | Inter | 400 | 12px |

**Note :** Inter pour l'admin (standard UI), pas Space Grotesk (réservé au site public Jon Labs).

### Composants UI

#### Boutons

```css
/* Primaire */
.btn-primary {
  background: var(--admin-primary);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-weight: 500;
  transition: background 150ms;
}
.btn-primary:hover {
  background: var(--admin-primary-hover);
}

/* Secondaire */
.btn-secondary {
  background: transparent;
  color: var(--admin-text);
  border: 1px solid var(--admin-border);
  border-radius: 6px;
  padding: 8px 16px;
}
.btn-secondary:hover {
  background: var(--admin-surface);
  border-color: var(--admin-border-hover);
}

/* Ghost (icône seule) */
.btn-ghost {
  background: transparent;
  color: var(--admin-text-secondary);
  border: none;
  padding: 8px;
  border-radius: 6px;
}
.btn-ghost:hover {
  background: #F5F5F5;
  color: var(--admin-text);
}
```

#### Inputs

```css
.input {
  background: var(--admin-surface);
  border: 1px solid var(--admin-border);
  border-radius: 6px;
  padding: 10px 12px;
  font-size: 14px;
  color: var(--admin-text);
  transition: border-color 150ms, box-shadow 150ms;
}
.input:focus {
  outline: none;
  border-color: var(--admin-primary);
  box-shadow: 0 0 0 3px var(--admin-primary-light);
}
.input::placeholder {
  color: var(--admin-text-muted);
}
```

#### Cards

```css
.card {
  background: var(--admin-surface);
  border: 1px solid var(--admin-border);
  border-radius: 8px;
  padding: 16px;
}
.card-hover:hover {
  border-color: var(--admin-border-hover);
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}
```

#### Badges

```css
/* Badge publié */
.badge-published {
  background: #D1FAE5;
  color: #065F46;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

/* Badge brouillon */
.badge-draft {
  background: #FEF3C7;
  color: #92400E;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}
```

### Layout Admin

```
┌─────────────────────────────────────────────────────────────────┐
│ Sidebar (240px)          │  Main Content                       │
│ ─────────────────────    │  ─────────────────────────────────  │
│                          │                                      │
│ 🏠 Dashboard             │  Header                             │
│ 🔗 Mes liens       ←     │  ┌─────────────────────────────────┐│
│ ⚙️ Paramètres            │  │ Titre page        [Publier ▼]  ││
│ ────────────────         │  └─────────────────────────────────┘│
│ Super Admin (if role)    │                                      │
│ 👥 Clients               │  Content area                       │
│                          │  ┌──────────────┬──────────────────┐│
│                          │  │              │                  ││
│                          │  │  Liste/      │  Preview         ││
│                          │  │  Formulaire  │  (40%)           ││
│                          │  │  (60%)       │                  ││
│                          │  │              │                  ││
│                          │  └──────────────┴──────────────────┘│
│                          │                                      │
│ ────────────────         │                                      │
│ 👤 Mon compte            │                                      │
│    Déconnexion           │                                      │
└─────────────────────────────────────────────────────────────────┘
```

### Principes UX

1. **Minimal clicks** — Actions principales toujours visibles
2. **Feedback immédiat** — Toute action = réponse visuelle
3. **Undo friendly** — Pas de suppression sans confirmation
4. **Keyboard first** — Raccourcis pour power users (Cmd+S = save, etc.)
5. **Preview live** — Modifications visibles instantanément

### Iconographie

**Set :** Lucide Icons (cohérence avec les pages publiques)  
**Style :** Stroke 1.5px, taille 20px pour UI, 16px pour inline  
**Couleur :** `var(--admin-text-secondary)` par défaut, `var(--admin-text)` au hover

### Animations

```css
/* Transitions globales */
* {
  transition-property: color, background-color, border-color, box-shadow;
  transition-duration: 150ms;
  transition-timing-function: ease-out;
}

/* Toast notification */
@keyframes slideIn {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

/* Loading spinner */
@keyframes spin {
  to { transform: rotate(360deg); }
}
```

### Responsive

| Breakpoint | Comportement |
|------------|--------------|
| Desktop (>1024px) | Sidebar fixe + split view |
| Tablet (768-1024px) | Sidebar collapsible + preview en modal |
| Mobile (<768px) | Sidebar = menu burger, pas de split view |

---

## 💾 Schéma de base de données

### Tables

```sql
-- Clients (tenants)
CREATE TABLE clients (
  id TEXT PRIMARY KEY DEFAULT (uuid()),
  slug TEXT UNIQUE NOT NULL,              -- URL slug: "cafe-du-coin"
  name TEXT NOT NULL,                     -- "Café du Coin"
  
  -- Branding
  logo_url TEXT,
  profile_image_url TEXT,
  
  -- Colors
  primary_color TEXT DEFAULT '#000000',
  secondary_color TEXT DEFAULT '#ffffff',
  background_type TEXT DEFAULT 'solid',   -- 'solid' | 'gradient' | 'image'
  background_value TEXT DEFAULT '#ffffff', -- Color, gradient CSS, or image URL
  
  -- Typography (Google Fonts)
  font_title TEXT DEFAULT 'Inter',
  font_text TEXT DEFAULT 'Inter',
  
  -- Layout
  layout_type TEXT DEFAULT 'list',        -- 'list' | 'cards' | 'grid'
  
  -- Meta
  bio TEXT,
  meta_title TEXT,
  meta_description TEXT,
  
  -- Status
  is_published BOOLEAN DEFAULT FALSE,
  has_draft_changes BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  published_at TEXT
);

-- Links
CREATE TABLE links (
  id TEXT PRIMARY KEY DEFAULT (uuid()),
  client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  
  -- Content
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,                       -- Optional short description
  
  -- Appearance
  icon TEXT,                              -- Lucide icon name: "instagram"
  thumbnail_url TEXT,                     -- Optional thumbnail image
  
  -- Social preset (NULL = custom styling)
  social_preset TEXT,                     -- 'instagram' | 'youtube' | 'linkedin' | 'x' | 'tiktok' | 'facebook' | 'github' | 'email' | 'whatsapp' | NULL
  
  -- Custom styling (used if social_preset is NULL)
  custom_bg_color TEXT,
  custom_text_color TEXT,
  
  -- State
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  
  -- Draft system
  is_draft BOOLEAN DEFAULT FALSE,         -- TRUE = modification non publiée
  
  -- Timestamps
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Users (Better Auth gère la table principale, on étend)
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  client_id TEXT REFERENCES clients(id) ON DELETE SET NULL,
  role TEXT DEFAULT 'client',             -- 'client' | 'super_admin'
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Sessions, accounts, etc. → gérés par Better Auth

-- Link clicks (pour stats futures)
CREATE TABLE link_clicks (
  id TEXT PRIMARY KEY DEFAULT (uuid()),
  link_id TEXT NOT NULL REFERENCES links(id) ON DELETE CASCADE,
  clicked_at TEXT DEFAULT CURRENT_TIMESTAMP,
  -- Optionnel pour analytics enrichis
  referrer TEXT,
  user_agent TEXT,
  country TEXT
);

-- Page views (pour stats futures)
CREATE TABLE page_views (
  id TEXT PRIMARY KEY DEFAULT (uuid()),
  client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  viewed_at TEXT DEFAULT CURRENT_TIMESTAMP,
  referrer TEXT,
  user_agent TEXT,
  country TEXT
);
```

### Social Presets (constantes)

```typescript
// packages/shared/src/social-presets.ts

export const SOCIAL_PRESETS = {
  instagram: {
    icon: 'instagram',
    label: 'Instagram',
    bgColor: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
    textColor: '#ffffff',
  },
  youtube: {
    icon: 'youtube',
    label: 'YouTube',
    bgColor: '#FF0000',
    textColor: '#ffffff',
  },
  linkedin: {
    icon: 'linkedin',
    label: 'LinkedIn',
    bgColor: '#0A66C2',
    textColor: '#ffffff',
  },
  x: {
    icon: 'twitter', // Lucide utilise encore "twitter"
    label: 'X (Twitter)',
    bgColor: '#000000',
    textColor: '#ffffff',
  },
  tiktok: {
    icon: 'music', // Lucide n'a pas TikTok, fallback
    label: 'TikTok',
    bgColor: '#000000',
    textColor: '#ffffff',
  },
  facebook: {
    icon: 'facebook',
    label: 'Facebook',
    bgColor: '#1877F2',
    textColor: '#ffffff',
  },
  github: {
    icon: 'github',
    label: 'GitHub',
    bgColor: '#181717',
    textColor: '#ffffff',
  },
  email: {
    icon: 'mail',
    label: 'Email',
    bgColor: '#EA4335',
    textColor: '#ffffff',
  },
  whatsapp: {
    icon: 'message-circle',
    label: 'WhatsApp',
    bgColor: '#25D366',
    textColor: '#ffffff',
  },
  website: {
    icon: 'globe',
    label: 'Website',
    bgColor: '#6366F1',
    textColor: '#ffffff',
  },
} as const;
```

---

## 🔌 API Endpoints

### Base URL

```
https://api.nokolink.com
```

### Authentication (Better Auth)

```
POST   /auth/sign-in/email        # Login
POST   /auth/sign-out             # Logout
GET    /auth/session              # Get current session
```

### Clients

```
# Super-admin only
GET    /clients                   # List all clients
POST   /clients                   # Create client
GET    /clients/:id               # Get client details
PUT    /clients/:id               # Update client
DELETE /clients/:id               # Delete client

# Client access (own data only)
GET    /clients/me                # Get own client data
PUT    /clients/me                # Update own client data
PUT    /clients/me/settings       # Update settings (colors, fonts, layout)
```

### Links

```
# Client access (scoped to their client_id)
GET    /links                     # List all links (own)
POST   /links                     # Create link
GET    /links/:id                 # Get link
PUT    /links/:id                 # Update link
DELETE /links/:id                 # Delete link
PUT    /links/reorder             # Reorder links (array of {id, sort_order})
```

### Publishing

```
POST   /publish                   # Trigger Astro rebuild
GET    /publish/status            # Get publish status (building, done, error)
```

### Public API (pour Astro build)

```
GET    /public/clients            # List all published clients (for static generation)
GET    /public/clients/:slug      # Get client + links by slug (published only)
```

### Request/Response Examples

**POST /clients (Super-admin)**
```json
// Request
{
  "slug": "cafe-du-coin",
  "name": "Café du Coin",
  "email": "contact@cafecoin.ch"  // Crée aussi le user
}

// Response
{
  "client": {
    "id": "uuid",
    "slug": "cafe-du-coin",
    "name": "Café du Coin",
    ...
  },
  "user": {
    "id": "uuid",
    "email": "contact@cafecoin.ch",
    "temporaryPassword": "abc123"  // À transmettre au client
  }
}
```

**PUT /clients/me/settings**
```json
// Request
{
  "primary_color": "#E4405F",
  "secondary_color": "#FFFFFF",
  "background_type": "gradient",
  "background_value": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "font_title": "Playfair Display",
  "font_text": "Open Sans",
  "layout_type": "cards",
  "bio": "Le meilleur café de Genève ☕"
}
```

**POST /links**
```json
// Request - Social preset
{
  "title": "Suivez-nous sur Instagram",
  "url": "https://instagram.com/cafecoin",
  "social_preset": "instagram"
}

// Request - Custom styling
{
  "title": "Notre menu du jour",
  "url": "https://cafecoin.ch/menu",
  "icon": "utensils",
  "description": "Découvrez nos plats",
  "custom_bg_color": "#8B4513",
  "custom_text_color": "#FFFFFF"
}
```

**PUT /links/reorder**
```json
{
  "order": [
    { "id": "uuid-1", "sort_order": 0 },
    { "id": "uuid-2", "sort_order": 1 },
    { "id": "uuid-3", "sort_order": 2 }
  ]
}
```

---

## 👤 User Flows

### Flow 1 : Super-admin crée un nouveau client

```
1. Super-admin se connecte à admin.nokolink.com
2. Accède à la section "Gestion clients"
3. Clique "Nouveau client"
4. Remplit : nom, slug, email du client
5. Système crée le client + user avec mot de passe temporaire
6. Super-admin communique les credentials au client
```

### Flow 2 : Client se connecte et configure

```
1. Client reçoit ses credentials
2. Se connecte à admin.nokolink.com/login
3. Est redirigé vers son dashboard
4. Voit le preview vide de sa page
5. Clique "Ajouter un lien"
6. Configure ses liens (titre, URL, preset social ou custom)
7. Configure ses settings (couleurs, logo, layout)
8. Voit les modifications en live dans le preview
9. Clique "Publier" quand satisfait
```

### Flow 3 : Client modifie ses liens

```
1. Client se connecte
2. Voit sa page actuelle (publiée) dans le preview
3. Modifie un lien → Preview se met à jour (brouillon)
4. Badge "Modifications non publiées" apparaît
5. Continue ses modifications
6. Clique "Publier" → Rebuild triggered
7. Badge disparaît, page publique mise à jour
```

### Flow 4 : Visiteur accède à une page

```
1. Visiteur clique sur un lien (bio Instagram, QR code, etc.)
2. Arrive sur nokolink.com/cafe-du-coin
3. Voit la page personnalisée du client
4. Clique sur un lien → Redirigé + click comptabilisé
```

---

## 🎨 Interface Admin (SvelteKit)

### Pages

#### `/login`
- Formulaire email/password
- Redirection vers dashboard après login
- Gestion erreurs

#### `/` (Dashboard)
- **Layout split screen :**
  - Gauche (60%) : Gestion des liens
  - Droite (40%) : Preview live
- **Section liens :**
  - Liste drag & drop des liens
  - Bouton "Ajouter un lien"
  - Chaque lien : edit inline, toggle actif/inactif, delete
- **Header :**
  - Nom du client
  - Badge "Modifications non publiées" (si has_draft_changes)
  - Bouton "Publier" (primaire, vert)
  - Menu utilisateur (settings, logout)

#### `/links/new` & `/links/[id]` (Modal ou page)
- Champ titre
- Champ URL
- Sélecteur type :
  - "Réseau social" → Dropdown des presets
  - "Personnalisé" → Color pickers + icon selector
- Champ description (optionnel)
- Upload thumbnail (optionnel)
- Preview du bouton en temps réel

#### `/settings`
- **Profil**
  - Upload logo
  - Upload image de profil
  - Bio (textarea)
- **Apparence**
  - Color picker : couleur primaire
  - Color picker : couleur secondaire
  - Sélecteur fond : solide / dégradé / image
  - Font selector : titre (Google Fonts)
  - Font selector : texte (Google Fonts)
- **Layout**
  - 3 options visuelles : List / Cards / Grid
  - Clic = sélection, preview se met à jour
- **SEO**
  - Meta title
  - Meta description

#### `/admin` (Super-admin only)
- Liste de tous les clients
- Stats globales (nombre de clients, liens, clics)
- Bouton "Nouveau client"
- Pour chaque client : edit, impersonate, delete

### Composants clés

#### `<Preview />`
```svelte
<!-- Preview live de la page du client -->
<script>
  export let client;
  export let links;
</script>

<div class="preview-container">
  <iframe 
    srcdoc={generatePreviewHTML(client, links)}
    class="preview-frame"
  />
</div>
```

#### `<LinkCard />`
```svelte
<!-- Carte draggable d'un lien -->
<script>
  export let link;
  export let onEdit;
  export let onDelete;
  export let onToggle;
</script>

<div class="link-card" draggable>
  <span class="drag-handle">⋮⋮</span>
  <div class="link-info">
    <Icon name={link.icon} />
    <span>{link.title}</span>
  </div>
  <div class="link-actions">
    <Toggle checked={link.is_active} on:change={onToggle} />
    <Button icon="edit" on:click={onEdit} />
    <Button icon="trash" on:click={onDelete} />
  </div>
</div>
```

#### `<FontSelector />`
```svelte
<!-- Sélecteur Google Fonts avec preview -->
<script>
  export let value;
  export let label;
  
  const fonts = [
    'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat',
    'Playfair Display', 'Merriweather', 'Poppins', 'Raleway',
    'Source Sans Pro', 'Ubuntu', 'Nunito', 'Work Sans'
  ];
</script>

<label>{label}</label>
<select bind:value>
  {#each fonts as font}
    <option value={font} style="font-family: {font}">{font}</option>
  {/each}
</select>
<p style="font-family: {value}">Aperçu du texte</p>
```

---

## 🌐 Pages publiques (Astro)

### Route dynamique

```astro
---
// src/pages/[slug].astro
import ListLayout from '../layouts/ListLayout.astro';
import CardsLayout from '../layouts/CardsLayout.astro';
import GridLayout from '../layouts/GridLayout.astro';

export async function getStaticPaths() {
  const response = await fetch(`${import.meta.env.API_URL}/public/clients`);
  const clients = await response.json();
  
  return clients.map(client => ({
    params: { slug: client.slug },
    props: { client }
  }));
}

const { client } = Astro.props;
const linksResponse = await fetch(`${import.meta.env.API_URL}/public/clients/${client.slug}`);
const { links } = await linksResponse.json();

const Layout = {
  list: ListLayout,
  cards: CardsLayout,
  grid: GridLayout
}[client.layout_type];
---

<Layout client={client} links={links} />
```

### Layout : List

```astro
---
// src/layouts/ListLayout.astro
import ProfileHeader from '../components/ProfileHeader.astro';
import LinkButton from '../components/LinkButton.astro';
import BaseHead from '../components/BaseHead.astro';

const { client, links } = Astro.props;
---

<html>
<head>
  <BaseHead client={client} />
  <link href={`https://fonts.googleapis.com/css2?family=${client.font_title}&family=${client.font_text}&display=swap`} rel="stylesheet">
</head>
<body style={`
  background: ${client.background_value};
  font-family: ${client.font_text}, sans-serif;
`}>
  <main class="container">
    <ProfileHeader client={client} />
    
    <div class="links-list">
      {links.filter(l => l.is_active).map(link => (
        <LinkButton link={link} client={client} />
      ))}
    </div>
    
    <footer>
      <a href="https://jonlabs.ch">Créé avec Noko</a>
    </footer>
  </main>
</body>
</html>
```

### Layouts alternatifs

**Cards** : Liens en cartes avec thumbnail, description visible
**Grid** : Grille 2 colonnes, icônes plus grandes, style app mobile

---

## 🚀 Système de publication (Vercel Webhook)

### Configuration Vercel

1. Dans les settings du projet Astro sur Vercel, créer un **Deploy Hook**
2. URL générée : `https://api.vercel.com/v1/integrations/deploy/prj_xxxxx/yyyy`
3. Stocker cette URL dans les variables d'environnement de l'API

### API route pour trigger

```typescript
// apps/api/src/routes/publish.ts
import { Elysia } from 'elysia';
import { db } from '../db';
import { clients } from '../db/schema';
import { eq } from 'drizzle-orm';

export const publishRoutes = new Elysia({ prefix: '/publish' })
  .post('/', async ({ user, error }) => {
    // Verify user is authenticated
    if (!user) return error(401, 'Unauthorized');
    
    const VERCEL_DEPLOY_HOOK = process.env.VERCEL_DEPLOY_HOOK;
    
    if (!VERCEL_DEPLOY_HOOK) {
      return error(500, 'Deploy hook not configured');
    }
    
    try {
      // Trigger Vercel rebuild
      const response = await fetch(VERCEL_DEPLOY_HOOK, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Vercel deploy failed');
      }
      
      // Update client status
      await db.update(clients)
        .set({ 
          has_draft_changes: false,
          published_at: new Date().toISOString()
        })
        .where(eq(clients.id, user.clientId));
      
      return { 
        status: 'building',
        message: 'Publication en cours... (~30-60 secondes)'
      };
      
    } catch (e) {
      console.error('Publish error:', e);
      return error(500, 'Publication failed');
    }
  })
  
  .get('/status', async ({ user, error }) => {
    if (!user) return error(401, 'Unauthorized');
    
    const client = await db.query.clients.findFirst({
      where: eq(clients.id, user.clientId)
    });
    
    return {
      hasDraftChanges: client?.has_draft_changes ?? false,
      lastPublishedAt: client?.published_at ?? null
    };
  });
```

### Variables d'environnement

```bash
# apps/api/.env
VERCEL_DEPLOY_HOOK=https://api.vercel.com/v1/integrations/deploy/prj_xxxxx/yyyy
```

### Feedback UI

```svelte
<!-- Dans l'admin SvelteKit -->
<script>
  let publishing = false;
  let publishStatus = '';
  
  async function publish() {
    publishing = true;
    publishStatus = 'Publication en cours...';
    
    const res = await api.post('/publish');
    
    if (res.ok) {
      publishStatus = 'Publié ! Mise en ligne dans ~30 secondes';
      // Refresh status après 60 sec
      setTimeout(checkStatus, 60000);
    } else {
      publishStatus = 'Erreur lors de la publication';
    }
    
    publishing = false;
  }
</script>

<button 
  on:click={publish} 
  disabled={publishing || !hasDraftChanges}
  class="btn-primary"
>
  {#if publishing}
    <Spinner /> Publication...
  {:else}
    Publier les modifications
  {/if}
</button>
```

---

## 📋 Plan de développement

### Phase 1 : Setup & Fondations (Jour 1)

**Objectif :** Monorepo fonctionnel avec API basique

**Tâches :**
- [ ] Init monorepo Bun workspaces
- [ ] Setup apps/api avec Elysia
- [ ] Setup SQLite + Drizzle ORM
- [ ] Créer schema DB complet
- [ ] Générer et appliquer migrations
- [ ] Config Better Auth
- [ ] Routes auth basiques (sign-in, sign-out, session)
- [ ] Setup apps/admin avec SvelteKit
- [ ] Setup apps/web avec Astro
- [ ] Setup packages/shared (types)

**Critères de validation :**
- `bun run dev` lance les 3 apps
- Login/logout fonctionne
- DB créée avec toutes les tables

---

### Phase 2 : API Core (Jour 2)

**Objectif :** CRUD complet fonctionnel

**Tâches :**
- [ ] Routes CRUD clients (super-admin)
- [ ] Routes CRUD links (scoped par client)
- [ ] Route reorder links
- [ ] Routes settings client
- [ ] Routes publiques pour Astro
- [ ] Middleware auth + role check
- [ ] Gestion erreurs standardisée
- [ ] Seed data pour tests

**Critères de validation :**
- Toutes les routes testables via curl/Postman
- Auth protège correctement les routes
- Super-admin peut créer clients

---

### Phase 3 : Admin — Auth & Layout (Jour 3)

**Objectif :** Interface admin navigable avec auth

**Tâches :**
- [ ] Page login fonctionnelle
- [ ] Layout global (header, sidebar)
- [ ] Store Svelte pour auth state
- [ ] API client (fetch wrapper avec auth)
- [ ] Protection des routes (redirect si non auth)
- [ ] Dashboard layout split (liens + preview)
- [ ] Composant Preview (iframe avec HTML généré)

**Critères de validation :**
- Login redirige vers dashboard
- Logout fonctionne
- Preview affiche structure vide

---

### Phase 4 : Admin — Gestion des liens (Jour 4-5)

**Objectif :** CRUD liens complet avec drag & drop

**Tâches :**
- [ ] Liste des liens dans dashboard
- [ ] Composant LinkCard
- [ ] Drag & drop (svelte-dnd-action ou similaire)
- [ ] Modal/page création lien
- [ ] Sélecteur preset social avec aperçu couleurs
- [ ] Mode custom (color pickers, icon selector)
- [ ] Edit lien existant
- [ ] Toggle actif/inactif
- [ ] Suppression avec confirmation
- [ ] Sync avec preview live

**Critères de validation :**
- Création lien → apparaît dans liste + preview
- Drag & drop sauvegarde le nouvel ordre
- Toggle → preview se met à jour

---

### Phase 5 : Admin — Settings & Personnalisation (Jour 6)

**Objectif :** Personnalisation complète de la page

**Tâches :**
- [ ] Page settings avec tabs/sections
- [ ] Upload logo + image profil (local storage ou S3)
- [ ] Color pickers (primaire, secondaire)
- [ ] Sélecteur type de fond (solid/gradient/image)
- [ ] Font selector avec Google Fonts
- [ ] Sélecteur layout (3 options visuelles)
- [ ] Champs SEO (meta title, description)
- [ ] Bio textarea
- [ ] Tout reflété en live dans preview

**Critères de validation :**
- Changement couleur → preview update
- Changement layout → preview change de structure
- Font change → preview reflète

---

### Phase 6 : Système de publication (Jour 7)

**Objectif :** Brouillon → Publier fonctionnel

**Tâches :**
- [ ] Badge "Modifications non publiées"
- [ ] Bouton Publier dans header
- [ ] API /publish trigger Vercel webhook
- [ ] Feedback utilisateur (loading, succès, erreur)
- [ ] Mise à jour has_draft_changes
- [ ] Pages Astro générées correctement

**Critères de validation :**
- Modification → badge apparaît
- Publier → rebuild se lance via Vercel
- Page publique reflète les changements (~30-60 sec)

---

### Phase 7 : Pages publiques Astro (Jour 8)

**Objectif :** 3 layouts fonctionnels et beaux

**Tâches :**
- [ ] Route dynamique [slug].astro
- [ ] getStaticPaths depuis API
- [ ] Layout List complet et stylé
- [ ] Layout Cards complet et stylé
- [ ] Layout Grid complet et stylé
- [ ] Composant LinkButton avec styles sociaux
- [ ] Composant ProfileHeader
- [ ] Google Fonts dynamiques
- [ ] Meta tags SEO
- [ ] Bouton vCard "Ajouter aux contacts" (si activé)
- [ ] Footer "Créé avec Noko"
- [ ] Responsive design (mobile-first)

**Critères de validation :**
- `bun run build` génère toutes les pages
- Chaque layout est visuellement distinct
- Mobile parfait
- Bouton vCard télécharge le .vcf

---

### Phase 8 : Features bonus - QR Code & vCard (Jour 9)

**Objectif :** Features différenciantes fonctionnelles

**Tâches QR Code :**
- [ ] Route API /qrcode/:format (png, svg)
- [ ] Génération avec couleur primaire du client
- [ ] URL trackable avec ?src=qr
- [ ] Section QR Code dans admin (preview + download)

**Tâches vCard :**
- [ ] Champs vCard dans DB (migration)
- [ ] Route API /vcard/:slug
- [ ] Génération fichier .vcf
- [ ] Toggle ON/OFF dans Settings admin
- [ ] Formulaire config vCard (nom, email, tel, etc.)
- [ ] Bouton sur page publique

**Critères de validation :**
- QR code téléchargeable aux couleurs du client
- vCard télécharge un .vcf valide
- Contact s'ajoute correctement sur iPhone/Android

---

### Phase 9 : Super-admin (Jour 10)

**Objectif :** Gestion des clients par Jon

**Tâches :**
- [ ] Section admin (role check)
- [ ] Liste de tous les clients
- [ ] Formulaire création client
- [ ] Génération mot de passe temporaire
- [ ] Edit client
- [ ] Suppression client (avec confirmation)
- [ ] Bouton "impersonate" (se connecter comme le client)
- [ ] Stats basiques (nb clients, liens, clics totaux)

**Critères de validation :**
- Super-admin voit tous les clients
- Peut créer un nouveau client avec credentials
- Peut impersonate pour debug

---

### Phase 10 : Polish & Tests (Jour 11)

**Objectif :** Production-ready

**Tâches :**
- [ ] Gestion erreurs UI (toasts, messages)
- [ ] Loading states partout
- [ ] Validation formulaires
- [ ] Tests manuels complets
- [ ] Fix bugs trouvés
- [ ] Optimisation perfs
- [ ] Documentation déploiement
- [ ] Setup Vercel (2 projets : admin + web)
- [ ] Config VPS (API + Nginx + SSL)
- [ ] Premier déploiement complet

**Critères de validation :**
- Aucune erreur console
- UX fluide et intuitive
- Site live et fonctionnel

---

### Phase 11 (Future) : Analytics

**Objectif :** Stats de clics et vues avec provenance

**Tâches :**
- [ ] Tracking clics (redirect via API avec referrer)
- [ ] Tracking page views (avec referrer, user-agent)
- [ ] Détection source : Instagram, QR code, Direct, etc.
- [ ] Dashboard stats dans admin
- [ ] Graphiques période sélectionnable (7j, 30j, 90j)
- [ ] Breakdown par lien (quel lien performe le mieux)
- [ ] Breakdown par source (d'où viennent les visiteurs)
- [ ] Export CSV

**Logique de détection source :**

```typescript
// Heuristique pour détecter la provenance
function detectSource(referrer: string | null, url: string): string {
  // Check for QR code param first
  const urlParams = new URL(url).searchParams;
  if (urlParams.get('src') === 'qr') return 'qrcode';
  
  if (!referrer) return 'direct';
  
  const ref = referrer.toLowerCase();
  
  if (ref.includes('instagram.com')) return 'instagram';
  if (ref.includes('facebook.com') || ref.includes('fb.com')) return 'facebook';
  if (ref.includes('linkedin.com')) return 'linkedin';
  if (ref.includes('twitter.com') || ref.includes('t.co')) return 'x';
  if (ref.includes('tiktok.com')) return 'tiktok';
  if (ref.includes('google.')) return 'google';
  
  return 'other';
}
```

**Note :** Le QR code généré inclut automatiquement `?src=qr` pour distinguer les scans des visites directes.

---

## 🔐 Sécurité

### Authentification
- Better Auth gère sessions sécurisées
- Passwords hashés (bcrypt/argon2)
- CSRF protection
- Rate limiting sur login

### Autorisation
- Middleware vérifie role sur chaque route
- Client ne peut accéder qu'à ses propres données
- Super-admin a accès global

### Uploads
- Validation type MIME
- Limite taille fichier (5MB)
- Stockage sécurisé (hors webroot ou S3)

### API publique
- Rate limiting
- Cache headers appropriés
- Pas de données sensibles exposées

---

## 📝 Variables d'environnement

### API (VPS)

```bash
# apps/api/.env
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=file:/data/jlinks/jlinks.db

# Auth
BETTER_AUTH_SECRET=your-secret-key-min-32-chars
BETTER_AUTH_URL=https://api.nokolink.com

# CORS
ALLOWED_ORIGINS=https://admin.nokolink.com,https://nokolink.com

# Vercel Deploy Hook
VERCEL_DEPLOY_HOOK=https://api.vercel.com/v1/integrations/deploy/prj_xxxxx/yyyy

# Uploads
UPLOAD_DIR=/data/jlinks/uploads
UPLOAD_MAX_SIZE=5242880  # 5MB
```

### Admin SvelteKit (Vercel)

```bash
# apps/admin/.env
PUBLIC_API_URL=https://api.nokolink.com
PUBLIC_APP_URL=https://admin.nokolink.com
```

### Pages publiques Astro (Vercel)

```bash
# apps/web/.env
API_URL=https://api.nokolink.com
SITE_URL=https://nokolink.com
```

---

## 🖥️ Configuration VPS

Le VPS héberge uniquement l'API Elysia. Configuration minimale requise.

### Prérequis

- Bun installé (`curl -fsSL https://bun.sh/install | bash`)
- Nginx installé
- Certbot pour SSL

### Structure fichiers

```
/data/jlinks/
├── jlinks.db           # SQLite database
└── uploads/            # Images uploadées
    ├── logos/
    └── profiles/

/opt/jlinks/
└── api/                # Code API Elysia (clone du repo)
```

### PM2 Setup

```bash
# Installation
bun add -g pm2

# Démarrer l'API
cd /opt/jlinks/api
pm2 start bun --name "jlinks-api" -- run start

# Auto-restart au boot
pm2 startup
pm2 save
```

### Nginx Config

```nginx
# /etc/nginx/sites-available/jlinks-api

server {
    listen 80;
    server_name api.nokolink.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.nokolink.com;

    ssl_certificate /etc/letsencrypt/live/api.nokolink.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.nokolink.com/privkey.pem;

    # Uploads statiques
    location /uploads/ {
        alias /data/jlinks/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # API proxy
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### SSL avec Certbot

```bash
# Installer certbot
sudo apt install certbot python3-certbot-nginx

# Générer certificat
sudo certbot --nginx -d api.nokolink.com

# Auto-renouvellement (déjà configuré par certbot)
```

### Déploiement API (manuel ou CI)

```bash
#!/bin/bash
# scripts/deploy-api.sh

cd /opt/jlinks/api
git pull origin main
bun install
bun run db:migrate  # Si migrations Drizzle
pm2 restart jlinks-api
```

---

## 🎯 Critères de succès MVP

1. **Fonctionnel** : Un client peut gérer ses liens de A à Z
2. **Beau** : Les pages publiques sont esthétiques et pro
3. **Rapide** : Pages statiques < 100ms load time
4. **Fiable** : Pas de bugs bloquants
5. **Maintenable** : Code propre, structure claire

---

## 📚 Ressources

- [Elysia Documentation](https://elysiajs.com/)
- [Better Auth Documentation](https://better-auth.com/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [SvelteKit Documentation](https://kit.svelte.dev/)
- [Astro Documentation](https://astro.build/)
- [Lucide Icons](https://lucide.dev/)
- [Google Fonts](https://fonts.google.com/)
