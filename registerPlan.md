# Plan d'implémentation - Page /register

## Résumé

Créer une page d'inscription `/register` avec un formulaire en 2 étapes (stepper progressif) :
- **Étape 1** : Informations de base (email, mot de passe, slug)
- **Étape 2** (optionnelle) : Ajout de liens sociaux (jusqu'à 5 liens)

Le design reprend exactement celui de la page de login (split-screen avec hero à gauche et formulaire à droite).

---

## Fichiers à créer

| Fichier | Description |
|---------|-------------|
| `apps/admin/src/routes/register/+page.svelte` | Page d'inscription avec stepper |
| `apps/admin/src/routes/api/auth/register/+server.ts` | API endpoint pour l'inscription publique |

## Fichiers à modifier

| Fichier | Modification |
|---------|-------------|
| `apps/admin/src/lib/api.ts` | Ajouter méthode `auth.register()` |
| `apps/admin/src/lib/schemas.ts` | Ajouter schéma de validation `registerSchema` |

---

## Détails d'implémentation

### 1. API Endpoint - `/api/auth/register`

**Fichier** : `apps/admin/src/routes/api/auth/register/+server.ts`

```typescript
// POST /api/auth/register
interface RegisterInput {
  email: string;
  password: string;
  slug: string;
  socialLinks?: Array<{
    url: string;
    title: string;
    socialPreset: SocialPresetKey;
  }>;
}
```

**Logique** :
1. Valider les données avec Zod
2. Vérifier unicité de l'email (insensible à la casse)
3. Vérifier unicité du slug
4. Dans une transaction :
   - Créer le client (avec slug, name = slug par défaut)
   - Créer l'utilisateur (avec hash scrypt du mot de passe)
   - Créer les liens sociaux si fournis (avec sort_order)
5. Créer une session et retourner le cookie
6. Retourner `{ user, client }`

**Rate limiting** : 5 tentatives par IP / 15 minutes

---

### 2. Page Register - Stepper

**Fichier** : `apps/admin/src/routes/register/+page.svelte`

#### Structure du stepper

```
┌─────────────────────────────────────────────────┐
│  Étape 1                    Étape 2             │
│  ● ─────────────────────── ○                    │
│  Informations              Liens sociaux        │
└─────────────────────────────────────────────────┘
```

#### État Svelte 5

```typescript
let step = $state(1);
let email = $state('');
let password = $state('');
let slug = $state('');
let socialLinks = $state<SocialLinkInput[]>([]);
let loading = $state(false);
let errors = $state<Record<string, string>>({});
```

#### Étape 1 - Informations de base

Champs :
- Email (type="email", required)
- Mot de passe (type="password", required, min 8 caractères)
- Slug (type="text", required, pattern `^[a-z0-9-]+$`, min 3 caractères)

Boutons :
- "Continuer" → passe à l'étape 2
- Lien "Déjà un compte ? Se connecter" → `/login`

#### Étape 2 - Liens sociaux (optionnel)

Interface :
- Grille de boutons pour les réseaux populaires (Instagram, YouTube, LinkedIn, X, TikTok, GitHub, Facebook, WhatsApp)
- Chaque bouton ajoute un champ input pour l'URL
- Maximum 5 liens
- Bouton "+" pour ajouter un lien personnalisé
- Auto-détection du preset depuis l'URL avec `detectSocialPreset()`

Boutons :
- "Passer cette étape" → soumet sans liens
- "Créer mon compte" → soumet avec liens
- "Retour" → revient à l'étape 1

---

### 3. Composants UI

Réutiliser les composants existants :
- `Button` (de `$lib/components/ui`)
- `Input` (de `$lib/components/ui`)

Nouveau composant inline (dans le même fichier) :
- `SocialLinkInput` - Input avec icône du réseau social et bouton supprimer

---

### 4. Design - Reprendre le layout login

Le design suit exactement la page login :
- Split-screen avec hero à gauche (fond sombre avec éléments décoratifs)
- Panneau blanc à droite avec le formulaire
- Même header avec logo et lien vers login (au lieu de signup)
- Même footer

Différences :
- Titre : "Inscription" au lieu de "Connexion"
- Sous-titre : "Créez votre page Noko"
- Hero tagline : "Créez votre page de liens en quelques secondes"
- Indicateur de stepper au-dessus du formulaire

---

### 5. Validation

**Schéma Zod** (`apps/admin/src/lib/schemas.ts`) :

```typescript
export const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Minimum 8 caractères'),
  slug: z.string()
    .min(3, 'Minimum 3 caractères')
    .max(50, 'Maximum 50 caractères')
    .regex(/^[a-z0-9-]+$/, 'Uniquement lettres minuscules, chiffres et tirets'),
  socialLinks: z.array(z.object({
    url: z.string().url('URL invalide'),
    title: z.string().min(1, 'Titre requis'),
    socialPreset: z.enum([
      'instagram', 'youtube', 'linkedin', 'x',
      'tiktok', 'facebook', 'github', 'email', 'whatsapp', 'theme'
    ]).optional(),
  })).max(5).optional(),
});
```

---

### 6. API Client

**Ajouter dans `apps/admin/src/lib/api.ts`** :

```typescript
async register(data: RegisterInput): Promise<{ user: User; client: Client }> {
  return fetchApi('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
```

---

### 7. Flux utilisateur

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   /login    │     │  /register  │     │      /      │
│             │ ──▶ │  Étape 1    │     │  Dashboard  │
│  Inscription│     │             │     │             │
└─────────────┘     └──────┬──────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  /register  │
                    │  Étape 2    │ ──▶ Création compte ──▶ Dashboard
                    │  (optionnel)│
                    └─────────────┘
```

---

## Ordre d'implémentation

1. **Schéma de validation** - `apps/admin/src/lib/schemas.ts`
2. **API endpoint** - `apps/admin/src/routes/api/auth/register/+server.ts`
3. **API client** - `apps/admin/src/lib/api.ts`
4. **Page register** - `apps/admin/src/routes/register/+page.svelte`

---

## Points d'attention

- **Slug** : Afficher un aperçu de l'URL finale (`nokolink.com/[slug]`)
- **Validation en temps réel** : Vérifier la disponibilité du slug via debounce
- **UX** : Auto-focus sur le premier champ à chaque étape
- **Accessibilité** : Labels, aria-labels, navigation clavier
- **Mobile** : Le hero disparaît comme sur la page login

---

## Textes (FR)

- Titre étape 1 : "Inscription"
- Sous-titre étape 1 : "Créez votre page Noko"
- Placeholder email : "votre@email.com"
- Placeholder mot de passe : "Mot de passe (min. 8 caractères)"
- Placeholder slug : "votre-nom"
- Label slug : "Votre URL : nokolink.com/"
- Bouton continuer : "Continuer"
- Lien login : "Déjà un compte ? Se connecter"

- Titre étape 2 : "Ajoutez vos liens"
- Sous-titre étape 2 : "Commencez avec vos réseaux sociaux"
- Bouton passer : "Passer cette étape"
- Bouton créer : "Créer mon compte"
- Bouton retour : "Retour"

- Hero eyebrow : "La plateforme de liens personnalisée"
- Hero tagline : "Créez votre page de liens en quelques secondes"
