# Plan Complet : Page Mot de Passe Oublié

## Contexte

### État actuel

**Page de connexion** (`apps/admin/src/routes/login/+page.svelte`) :
- Design split-screen moderne
- Hero sombre à gauche (gradient #16162a → #1a1a2e → #252547)
- Form panel blanc à droite avec border-radius 64px
- Éléments décoratifs (glows, circle-rings)
- Font Plus Jakarta Sans avec letter-spacing -0.015em
- Composants AuthInput et AuthButton personnalisés

**Pages actuelles forgot/reset-password** :
- Design basique avec Card centrée sur fond gris
- Composants génériques (Input, Button, Card)
- Pas de cohérence avec la page de connexion

### Objectif

Refondre les pages `forgot-password` et `reset-password` pour qu'elles reprennent exactement le design de la page de connexion, puis vérifier que toute la fonctionnalité fonctionne.

---

## Partie 1 : Refonte Design - forgot-password

### Fichier : `apps/admin/src/routes/forgot-password/+page.svelte`

### Structure HTML à reproduire

```svelte
<div class="forgot-page">
  <!-- Dark Background Layer -->
  <div class="hero-background">
    <div class="decorative-elements">
      <div class="glow glow-1"></div>
      <div class="glow glow-2"></div>
      <div class="circle-ring circle-ring-1"></div>
      <div class="circle-ring circle-ring-2"></div>
      <div class="circle-ring circle-ring-3"></div>
    </div>
    <div class="hero-content">
      <p class="hero-eyebrow">Recuperation de compte</p>
      <h1 class="hero-tagline">
        Recuperez votre<br />
        <span class="highlight">acces en un clic</span>
      </h1>
    </div>
  </div>

  <!-- White Form Panel -->
  <div class="form-panel">
    <div class="form-panel-inner">
      <header class="form-header">
        <a href="/" class="logo">
          <img src="/logonono.webp" alt="Nokolink" class="logo-img" />
        </a>
        <a href="/login" class="login-link">
          <span>Retour a la connexion</span>
        </a>
      </header>

      <div class="form-content">
        <div class="form-content-inner">
          <!-- ÉTAT FORMULAIRE -->
          {#if !sent}
            <h2 class="form-title">Mot de passe oublie</h2>
            <p class="form-subtitle">Entrez votre email pour recevoir un lien de reinitialisation</p>
            <form>
              <!-- AuthInput pour email -->
              <!-- AuthButton pour soumettre -->
            </form>
          {:else}
            <!-- ÉTAT SUCCÈS -->
            <div class="success-state">
              <CheckCircle />
              <h2>Email envoye</h2>
              <p>Verifiez votre boite de reception...</p>
            </div>
          {/if}
        </div>
      </div>
    </div>
    <footer class="form-footer">
      <p>&copy; 2025 Noko. Tous droits reserves.</p>
    </footer>
  </div>
</div>
```

### Imports à modifier

```svelte
// AVANT
import { Button, Input, Card } from '$lib/components/ui';
import { ArrowLeft, CheckCircle } from 'lucide-svelte';

// APRÈS
import { AuthButton, AuthInput } from '$lib/components/ui';
import { Mail, CheckCircle, ArrowLeft } from 'lucide-svelte';
```

### CSS à copier depuis login (styles identiques)

```css
/* Base Layout */
.forgot-page {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  font-family: 'Plus Jakarta Sans', var(--font-family);
  letter-spacing: -0.015em;
}

/* Hero Background */
.hero-background {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #16162a 0%, #1a1a2e 50%, #252547 100%);
  display: flex;
  align-items: center;
  padding-left: 5%;
  padding-right: 55%;
}

/* Decorative Elements - identiques à login */
.decorative-elements { ... }
.glow { ... }
.glow-1 { ... }
.glow-2 { ... }
.circle-ring { ... }
.circle-ring-1, .circle-ring-2, .circle-ring-3 { ... }

/* Hero Content */
.hero-content { ... }
.hero-eyebrow { ... }
.hero-tagline { ... }
.hero-tagline .highlight { ... }

/* Form Panel */
.form-panel {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 52%;
  min-width: 480px;
  background: #ffffff;
  border-radius: 64px 0 0 64px;
  box-shadow:
    -28px 0 80px rgba(0, 0, 0, 0.2),
    -10px 0 30px rgba(0, 0, 0, 0.12);
  z-index: 10;
  display: flex;
  flex-direction: column;
}

/* Form Content */
.form-panel-inner { ... }
.form-header { ... }
.logo { ... }
.logo-img { ... }
.login-link { ... }
.form-content { ... }
.form-content-inner { ... }
.form-title { ... }
.form-subtitle { ... }

/* Error Message - style identique à login */
.error-message {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border: 1px solid #fecaca;
  border-radius: 12px;
  color: #b91c1c;
  font-size: 0.875rem;
  font-weight: 500;
}

/* Success State - nouveau */
.success-state {
  text-align: center;
}

.success-state :global(svg) {
  width: 64px;
  height: 64px;
  color: #22c55e;
  margin-bottom: 1.5rem;
}

.success-state h2 {
  font-size: 1.75rem;
  font-weight: 500;
  color: var(--color-text);
  margin: 0 0 0.75rem;
}

.success-state p {
  color: var(--color-text-secondary);
  margin: 0 0 1.5rem;
  line-height: 1.6;
}

.success-state .hint {
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

/* Footer */
.form-footer { ... }

/* Responsive - identique à login */
@media (max-width: 1024px) { ... }
@media (max-width: 768px) { ... }
```

### Svelte Head

```svelte
<svelte:head>
  <title>Mot de passe oublie | Noko</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
</svelte:head>
```

---

## Partie 2 : Refonte Design - reset-password

### Fichier : `apps/admin/src/routes/reset-password/+page.svelte`

### Structure identique à forgot-password mais avec :

**Hero content adapté :**
```svelte
<p class="hero-eyebrow">Nouveau mot de passe</p>
<h1 class="hero-tagline">
  Un nouveau<br />
  <span class="highlight">depart securise</span>
</h1>
```

**Header adapté :**
```svelte
<a href="/forgot-password" class="login-link">
  <span>Redemander un lien</span>
</a>
```

**Formulaire avec 2 champs mot de passe :**
```svelte
<form>
  <div class="input-group">
    <AuthInput
      type="password"
      bind:value={newPassword}
      placeholder="Nouveau mot de passe"
      showPasswordToggle
      disabled={loading}
    />
  </div>

  <div class="input-group">
    <AuthInput
      type="password"
      bind:value={confirmPassword}
      placeholder="Confirmer le mot de passe"
      showPasswordToggle
      disabled={loading}
    />
  </div>

  <!-- Validation hints -->
  {#if newPassword.length > 0 && newPassword.length < 8}
    <p class="hint-message">Minimum 8 caracteres requis</p>
  {/if}

  {#if confirmPassword.length > 0 && !passwordsMatch}
    <p class="hint-message error">Les mots de passe ne correspondent pas</p>
  {/if}

  <AuthButton type="submit" {loading} disabled={!canSubmit || loading}>
    <Lock size={18} />
    <span>Reinitialiser le mot de passe</span>
  </AuthButton>
</form>
```

**3 états à gérer :**

1. **Token invalide/absent** :
```svelte
{#if !token}
  <div class="error-state">
    <XCircle />
    <h2>Lien invalide</h2>
    <p>Ce lien de reinitialisation est invalide ou a expire.</p>
    <a href="/forgot-password" class="action-link">Demander un nouveau lien</a>
  </div>
{/if}
```

2. **Formulaire** : (quand token présent)

3. **Succès** :
```svelte
{:else if success}
  <div class="success-state">
    <CheckCircle />
    <h2>Mot de passe reinitialise</h2>
    <p>Votre mot de passe a ete modifie avec succes.</p>
    <p class="redirect-hint">Redirection vers la connexion...</p>
  </div>
{/if}
```

### CSS additionnel pour reset-password

```css
.hint-message {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  margin: 0;
}

.hint-message.error {
  color: #ef4444;
}

.error-state {
  text-align: center;
}

.error-state :global(svg) {
  width: 64px;
  height: 64px;
  color: #ef4444;
  margin-bottom: 1.5rem;
}

.action-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 500;
  margin-top: 1rem;
}

.action-link:hover {
  text-decoration: underline;
}

.redirect-hint {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  font-style: italic;
}
```

---

## Partie 3 : Vérification Fonctionnelle

### 3.1 Configuration Resend

**Fichier : `apps/admin/.env`**

Vérifier la présence de :
```env
RESEND_API_KEY=re_xxxxx
EMAIL_FROM=Noko <noreply@nokolink.com>
```

**Si non configuré :** Le système utilise un fallback qui affiche l'URL de reset dans la console du serveur (mode développement).

### 3.2 Vérification Email (apps/admin/src/lib/server/email.ts)

**Fonctionnement actuel :**
- Si `RESEND_API_KEY` absent : log l'URL dans la console
- Si présent : envoie un email HTML via Resend

**Template email :**
- Sujet : "Réinitialisation de votre mot de passe Noko"
- HTML avec bouton stylisé (couleur #FF6B5B)
- Lien : `{ADMIN_URL}/reset-password?token={token}`
- Expiration : 1 heure

### 3.3 Endpoints API

**POST `/api/auth/forgot-password`**
- Fichier : `apps/admin/src/routes/api/auth/forgot-password/+server.ts`
- Rate limit : 3 requêtes/heure/IP
- Crée un token UUID dans table `verifications`
- Expiration : 1 heure
- Retourne toujours `{ success: true }` (sécurité)

**POST `/api/auth/reset-password`**
- Fichier : `apps/admin/src/routes/api/auth/reset-password/+server.ts`
- Rate limit : 5 requêtes/heure/IP
- Valide le token
- Met à jour le password_hash (scrypt)
- Supprime toutes les sessions de l'utilisateur
- Supprime le token utilisé

### 3.4 Base de données

**Table `verifications`** (schema.ts lignes 158-167) :
```typescript
{
  id: text (primary key),
  identifier: text (email),
  value: text (token UUID),
  expires_at: text (ISO date),
  created_at: text,
  updated_at: text
}
```

### 3.5 Test manuel du flux

1. Lancer le serveur dev : `bun run dev:admin`
2. Aller sur `/forgot-password`
3. Entrer un email existant
4. Regarder la console du serveur pour l'URL (si pas de Resend)
5. Copier le token de l'URL
6. Aller sur `/reset-password?token=xxx`
7. Entrer un nouveau mot de passe (min 8 caractères)
8. Confirmer le mot de passe
9. Soumettre
10. Vérifier la redirection vers `/login`
11. Se connecter avec le nouveau mot de passe

---

## Ordre d'Exécution

| Étape | Action | Fichier |
|-------|--------|---------|
| 1 | Refonte design forgot-password | `apps/admin/src/routes/forgot-password/+page.svelte` |
| 2 | Refonte design reset-password | `apps/admin/src/routes/reset-password/+page.svelte` |
| 3 | Vérifier config Resend | `apps/admin/.env` |
| 4 | Test flux complet | Navigation manuelle |

---

## Fichiers impliqués

### À modifier (design)
- `apps/admin/src/routes/forgot-password/+page.svelte`
- `apps/admin/src/routes/reset-password/+page.svelte`

### À vérifier (fonctionnalité)
- `apps/admin/.env` (RESEND_API_KEY)
- `apps/admin/src/lib/server/email.ts`
- `apps/admin/src/routes/api/auth/forgot-password/+server.ts`
- `apps/admin/src/routes/api/auth/reset-password/+server.ts`

### Référence (ne pas modifier)
- `apps/admin/src/routes/login/+page.svelte` (template design)
- `apps/admin/src/lib/components/ui/AuthInput.svelte`
- `apps/admin/src/lib/components/ui/AuthButton.svelte`
- `apps/admin/src/lib/server/db/schema.ts` (table verifications)

---

## Composants UI utilisés

### AuthInput
```svelte
<AuthInput
  type="email|password"
  bind:value={value}
  placeholder="..."
  required
  disabled={loading}
  showPasswordToggle  // Pour type="password"
/>
```

### AuthButton
```svelte
<AuthButton type="submit" {loading} disabled={condition}>
  <Icon size={18} />
  <span>Texte du bouton</span>
</AuthButton>
```

---

## Notes importantes

1. **Font Google** : Ajouter le lien Plus Jakarta Sans dans `<svelte:head>`
2. **Responsive** : Copier les media queries de login pour cohérence
3. **Accents** : Éviter les accents dans le code (utiliser "oublie" pas "oublié")
4. **Fallback Resend** : En dev, l'URL s'affiche dans la console si pas de clé API
5. **Sécurité** : L'endpoint forgot-password retourne toujours succès (ne révèle pas si l'email existe)
