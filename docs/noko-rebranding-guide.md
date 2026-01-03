# Noko — Rebranding Guide

## 🔄 Résumé du changement

| Avant | Après |
|-------|-------|
| **jLinks** | **Noko** |
| Produit Jon Labs | Marque indépendante |
| Turquoise tech | Coral friendly |
| Pas de mascotte | Mascotte créature |
| "Linktree, en plus simple" | Identité propre |

---

## 🏷️ Nom de marque

### Noko

- **Prononciation :** NO-ko (2 syllabes)
- **Test oral :** "Tu as un Noko ?" ✅
- **Domaine :** nokolink.com (ou .io/.app à vérifier)

### Origine du nom

- **Japonais :** 残こ (noko) = "ce qui reste" → tout ce qui compte reste ici
- **Inspiration visuelle :** Noko, un Pokémon champignon
- **Sonorité :** Court, fun, mémorable, facile FR/EN

### Taglines possibles

- "Tous tes liens. Un seul endroit."
- "Une page. Tout toi."
- "Ton hub. Tes liens."

---

## 🐙 Logo & Mascotte

### Description

Petite créature noire style silhouette avec :
- Tête ronde noire
- 2 yeux blancs ronds
- Corps chubby arrondi (seamless avec la tête)
- 1 antenne penchée sur le haut avec node
- 2 petits bras avec mini-branches (rappel des connexions)

### Fichier de référence

Le logo final est basé sur l'image validée avec :
- Silhouette full black
- Yeux blancs
- Antenne penchée
- Bras avec petites branches/nodes

### Utilisation

| Contexte | Format |
|----------|--------|
| Favicon | Tête seule (16x16, 32x32) |
| Logo complet | Mascotte + "Noko" à côté |
| App icon | Mascotte centrée |
| Watermark | Mascotte petite, opacité réduite |

### Déclinaisons

- **Noir sur blanc** — Usage principal
- **Blanc sur noir** — Dark mode
- **Coral sur blanc** — Accent (limité)

---

## 🎨 Palette de couleurs

### Couleurs principales

```css
:root {
  /* Coral — Couleur principale */
  --primary: #FF6B5B;           /* CTA, liens, accents */
  --primary-hover: #E85A4F;     /* États hover */
  --primary-light: #FFF0EE;     /* Backgrounds sections */
  --primary-muted: #FFB4AC;     /* Éléments secondaires */
  
  /* Neutres */
  --background: #FFFAF9;        /* Fond principal (blanc chaud) */
  --surface: #FFFFFF;           /* Cartes, modales */
  --text: #1A1A1A;              /* Texte principal */
  --text-secondary: #666666;    /* Texte secondaire */
  --text-muted: #999999;        /* Texte discret */
  --border: #F0E8E6;            /* Bordures */
  
  /* Accent secondaire (optionnel) */
  --accent: #2D5A45;            /* Vert forêt — contraste */
}
```

### Codes HEX rapides

| Nom | HEX | Usage |
|-----|-----|-------|
| Coral | `#FF6B5B` | CTA, boutons, liens |
| Coral hover | `#E85A4F` | États hover |
| Coral light | `#FFF0EE` | Backgrounds légers |
| Noir | `#1A1A1A` | Texte, logo |
| Blanc chaud | `#FFFAF9` | Background principal |
| Vert forêt | `#2D5A45` | Accent secondaire |

### Comparatif avant/après

| Élément | jLinks | Noko |
|---------|--------|------|
| Primary | `#00D9A3` Turquoise | `#FF6B5B` Coral |
| Background | `#FAFAFA` Gris froid | `#FFFAF9` Blanc chaud |
| Vibe | Tech, startup | Warm, friendly |

---

## 🔤 Typographie

### Recommandations

| Usage | Font | Fallback |
|-------|------|----------|
| Titres | **Manrope** | sans-serif |
| Body | **Inter** | sans-serif |

### Alternative

| Usage | Font | Fallback |
|-------|------|----------|
| Titres | **Space Grotesk** | sans-serif |
| Body | **DM Sans** | sans-serif |

### CSS

```css
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap');

:root {
  --font-display: 'Manrope', sans-serif;
  --font-body: 'Inter', sans-serif;
}
```

---

## 🎭 Tonalité & Voix

### Personnalité de marque

| Trait | Description |
|-------|-------------|
| **Friendly** | Accessible, pas intimidant |
| **Fun** | Léger, pas corporate |
| **Simple** | Direct, pas de jargon |
| **Confiant** | Sûr de soi sans arrogance |

### Comment Noko parle

✅ **Faire**
- Tutoyer
- Phrases courtes
- Ton conversationnel
- Humour léger acceptable

❌ **Éviter**
- Vouvoiement (sauf contexte B2B formel)
- Jargon technique
- Superlatifs exagérés ("révolutionnaire", "incroyable")
- Ton corporate

### Exemples

| ❌ Avant | ✅ Après |
|---------|---------|
| "Créez votre page de liens professionnelle" | "Crée ta page en 2 minutes" |
| "Solution de gestion de liens" | "Tous tes liens. Un seul endroit." |
| "Optimisez votre présence digitale" | "Une page qui te ressemble" |

---

## 🔗 Relation avec Jon Labs

### Positionnement

Noko est un **produit indépendant** créé par Jon Labs.

- La marque Jon Labs apparaît discrètement (footer, FAQ)
- Noko a sa propre identité visuelle
- Les clients Jon Labs ont accès à Noko comme bonus

### Mentions

**Footer :**
```
Noko — Un projet Jon Labs 🇨🇭
```

**FAQ :**
```
"Pourquoi c'est gratuit ?"
Noko est un projet de Jon Labs, un studio web basé à Genève. 
On l'a créé pour nos clients, puis on s'est dit que ça pourrait 
servir à tout le monde.
```

---

## 📦 Assets à créer

### Priorité haute

- [ ] Logo mascotte en SVG (noir)
- [ ] Logo mascotte en SVG (blanc)
- [ ] Favicon (tête seule, 16x16, 32x32, 180x180)
- [ ] Open Graph image (1200x630)
- [ ] Logo + texte "Noko" horizontal

### Priorité moyenne

- [ ] Mascotte avec expressions (happy, thinking, etc.)
- [ ] Pattern/texture avec petits Nokos
- [ ] Illustrations pour features
- [ ] QR code template avec couleurs Noko

### Priorité basse

- [ ] Stickers/emojis Noko
- [ ] Animations mascotte (wave, blink)
- [ ] Merch designs

---

## 🌐 Domaines & URLs

### Structure

| URL | Usage |
|-----|-------|
| `nokolink.com` | Landing page |
| `app.nokolink.com` | Admin dashboard |
| `nokolink.com/[slug]` | Pages publiques utilisateurs |
| `api.nokolink.com` | API |

### Alternatives à sécuriser

- nokolink.io
- nokolink.app
- getnoko.com
- noko.link

---

## 📝 Checklist rebranding

### Documentation

- [x] Nom validé : Noko
- [x] Logo/mascotte défini
- [x] Palette couleurs définie
- [ ] Typographie confirmée
- [x] Tonalité définie

### Design

- [ ] Logo SVG créé
- [x] Favicon généré
- [x] OG image créée
- [ ] Landing page mise à jour
- [ ] Style guide complet

### Technique

- [ ] Domaine acheté
- [ ] Variables CSS mises à jour
- [x] Assets uploadés
- [x] Meta tags mis à jour

### Communication

- [ ] Annonce du nom (si pertinent)
- [ ] Mise à jour Jon Labs website
- [ ] Réseaux sociaux (si comptes créés)

---

## 📎 Fichiers liés

- `jlinks-prd.md` — PRD technique (à renommer noko-prd.md)
- `jlinks-landing-page.md` — Structure landing (à mettre à jour)
- `jlinks-landing-prompt.md` — Prompt dev (à mettre à jour)
- `jlinks-font-presets.md` — Presets fonts utilisateurs (inchangé)

---

## 🎯 Résumé en une phrase

> **Noko** est une alternative à Linktree, friendly et gratuite, avec une mascotte cute coral, créée par Jon Labs.
