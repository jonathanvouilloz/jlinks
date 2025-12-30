# jLinks - Guide de Déploiement

Ce guide détaille le déploiement complet de jLinks :
- **API** sur VPS (Bun + PM2 + Nginx)
- **Admin** sur Vercel (SvelteKit)
- **Web** sur Vercel (Astro)

---

## Table des matières

1. [Architecture](#architecture)
2. [Prérequis](#prérequis)
3. [Déploiement VPS (API)](#déploiement-vps-api)
4. [Déploiement Vercel](#déploiement-vercel)
5. [Configuration DNS](#configuration-dns)
6. [Variables d'environnement](#variables-denvironnement)
7. [Maintenance](#maintenance)
8. [Troubleshooting](#troubleshooting)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         VERCEL                                   │
├─────────────────────────────────────────────────────────────────┤
│  admin.links.jonlabs.ch  →  SvelteKit Admin                     │
│  links.jonlabs.ch/[slug] →  Astro Static Pages                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      VPS (ton serveur)                           │
├─────────────────────────────────────────────────────────────────┤
│  Nginx (reverse proxy)  →  api.links.jonlabs.ch                 │
│  PM2 (process manager)  →  Elysia API (port 3000)               │
│  SQLite Database        →  /data/jlinks/jlinks.db               │
└─────────────────────────────────────────────────────────────────┘
```

---

## Prérequis

### VPS
- **OS** : Ubuntu 22.04 LTS ou Debian 12 (recommandé)
- **RAM** : 512 MB minimum (1 GB recommandé)
- **Stockage** : 5 GB minimum
- **Accès** : SSH avec sudo

### Domaines
- `api.links.jonlabs.ch` → IP du VPS
- `admin.links.jonlabs.ch` → Vercel (automatique)
- `links.jonlabs.ch` → Vercel (automatique)

### Comptes
- Compte [Vercel](https://vercel.com)
- Accès au repo GitHub

---

## Déploiement VPS (API)

### Étape 1 : Installation des dépendances

Connecte-toi à ton VPS en SSH :

```bash
ssh user@ton-vps-ip
```

Installe les dépendances système :

```bash
# Mise à jour du système
sudo apt update && sudo apt upgrade -y

# Installer les outils de base
sudo apt install -y curl git unzip
```

#### 1.1 Installer Bun

```bash
curl -fsSL https://bun.sh/install | bash

# Recharger le shell
source ~/.bashrc

# Vérifier l'installation
bun --version
```

#### 1.2 Installer Node.js (pour PM2)

```bash
# Installer Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Vérifier
node --version
npm --version
```

#### 1.3 Installer PM2

```bash
sudo npm install -g pm2

# Vérifier
pm2 --version
```

#### 1.4 Installer Nginx

```bash
sudo apt install -y nginx

# Vérifier que Nginx tourne
sudo systemctl status nginx
```

#### 1.5 Installer Certbot (SSL)

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### Étape 2 : Créer la structure des dossiers

```bash
# Dossier pour le code
sudo mkdir -p /opt/jlinks
sudo chown $USER:$USER /opt/jlinks

# Dossier pour les données (base SQLite + uploads)
sudo mkdir -p /data/jlinks
sudo chown $USER:$USER /data/jlinks

# Dossier pour les logs PM2
sudo mkdir -p /var/log/jlinks
sudo chown $USER:$USER /var/log/jlinks
```

### Étape 3 : Cloner et configurer le projet

```bash
# Cloner le repo
cd /opt/jlinks
git clone https://github.com/ton-username/jlinks.git .

# Installer les dépendances
bun install
```

### Étape 4 : Configurer les variables d'environnement

```bash
# Copier le template
cp apps/api/.env.example apps/api/.env

# Éditer le fichier
nano apps/api/.env
```

Contenu du fichier `.env` :

```bash
# Server
PORT=3000
NODE_ENV=production

# Database
DATABASE_URL=file:/data/jlinks/jlinks.db

# Auth - Générer un secret aléatoire (min 32 caractères)
BETTER_AUTH_SECRET=GENERER_UN_SECRET_ALEATOIRE_ICI

# CORS - Domaines autorisés
ALLOWED_ORIGINS=https://admin.links.jonlabs.ch,https://links.jonlabs.ch

# Vercel Deploy Hook (à récupérer dans Vercel)
VERCEL_DEPLOY_HOOK=https://api.vercel.com/v1/integrations/deploy/prj_xxx/yyy

# Site URL (pour les QR codes et vCards)
SITE_URL=https://links.jonlabs.ch
```

**Générer un secret aléatoire :**

```bash
openssl rand -base64 32
```

### Étape 5 : Initialiser la base de données

```bash
cd /opt/jlinks

# Appliquer les migrations
bun run db:migrate

# (Optionnel) Ajouter des données de test
bun run db:seed
```

### Étape 6 : Configurer PM2

```bash
cd /opt/jlinks/apps/api

# Démarrer l'API avec PM2
pm2 start ecosystem.config.cjs

# Vérifier que ça tourne
pm2 status
pm2 logs jlinks-api

# Configurer le démarrage automatique
pm2 startup
pm2 save
```

### Étape 7 : Configurer Nginx

```bash
# Copier la config Nginx
sudo cp /opt/jlinks/deploy/nginx/jlinks-api.conf /etc/nginx/sites-available/

# Activer le site
sudo ln -s /etc/nginx/sites-available/jlinks-api.conf /etc/nginx/sites-enabled/

# Tester la config
sudo nginx -t

# Recharger Nginx
sudo systemctl reload nginx
```

### Étape 8 : Configurer SSL avec Certbot

```bash
# Obtenir un certificat SSL
sudo certbot --nginx -d api.links.jonlabs.ch

# Suivre les instructions interactives
# Choisir de rediriger HTTP vers HTTPS (recommandé)
```

### Étape 9 : Tester l'API

```bash
# Test local
curl http://localhost:3000/health

# Test externe (après configuration DNS)
curl https://api.links.jonlabs.ch/health
```

---

## Déploiement Vercel

### Étape 1 : Créer le projet Admin

1. Va sur [vercel.com/new](https://vercel.com/new)
2. Importe ton repo GitHub
3. Configure le projet :
   - **Root Directory** : `apps/admin`
   - **Framework Preset** : SvelteKit
   - **Build Command** : `bun run build`
   - **Install Command** : `bun install`

4. Ajoute les variables d'environnement :
   - `PUBLIC_API_URL` = `https://api.links.jonlabs.ch`

5. Deploy !

### Étape 2 : Créer le projet Web

1. Crée un nouveau projet Vercel
2. Importe le même repo GitHub
3. Configure le projet :
   - **Root Directory** : `apps/web`
   - **Framework Preset** : Astro
   - **Build Command** : `bun run build`
   - **Install Command** : `bun install`

4. Ajoute les variables d'environnement :
   - `API_URL` = `https://api.links.jonlabs.ch`
   - `SITE_URL` = `https://links.jonlabs.ch`

5. Deploy !

### Étape 3 : Configurer le Deploy Hook

Pour que le bouton "Publier" dans l'admin fonctionne :

1. Va dans les settings du projet **Web** sur Vercel
2. Section "Git" → "Deploy Hooks"
3. Crée un hook nommé `jlinks-publish`
4. Copie l'URL générée
5. Ajoute cette URL dans le `.env` de l'API sur ton VPS :
   ```bash
   VERCEL_DEPLOY_HOOK=https://api.vercel.com/v1/integrations/deploy/prj_xxx/yyy
   ```
6. Redémarre l'API :
   ```bash
   pm2 restart jlinks-api
   ```

### Étape 4 : Configurer les domaines

Dans chaque projet Vercel :

1. Settings → Domains
2. Ajoute le domaine correspondant :
   - Admin : `admin.links.jonlabs.ch`
   - Web : `links.jonlabs.ch`
3. Configure les DNS comme indiqué par Vercel

---

## Configuration DNS

Ajoute ces enregistrements DNS chez ton registrar :

| Type | Nom | Valeur | TTL |
|------|-----|--------|-----|
| A | api.links | IP_DE_TON_VPS | 3600 |
| CNAME | admin.links | cname.vercel-dns.com | 3600 |
| CNAME | links | cname.vercel-dns.com | 3600 |

---

## Variables d'environnement

### API (VPS)

| Variable | Description | Exemple |
|----------|-------------|---------|
| `PORT` | Port du serveur | `3000` |
| `NODE_ENV` | Environnement | `production` |
| `DATABASE_URL` | Chemin SQLite | `file:/data/jlinks/jlinks.db` |
| `BETTER_AUTH_SECRET` | Secret auth (32+ chars) | `abc123...` |
| `ALLOWED_ORIGINS` | Domaines CORS | `https://admin.links.jonlabs.ch` |
| `VERCEL_DEPLOY_HOOK` | URL du webhook | `https://api.vercel.com/...` |
| `SITE_URL` | URL du site public | `https://links.jonlabs.ch` |

### Admin (Vercel)

| Variable | Description | Exemple |
|----------|-------------|---------|
| `PUBLIC_API_URL` | URL de l'API | `https://api.links.jonlabs.ch` |

### Web (Vercel)

| Variable | Description | Exemple |
|----------|-------------|---------|
| `API_URL` | URL de l'API | `https://api.links.jonlabs.ch` |
| `SITE_URL` | URL canonique | `https://links.jonlabs.ch` |

---

## Maintenance

### Mise à jour du code

```bash
cd /opt/jlinks

# Récupérer les dernières modifications
git pull origin main

# Installer les nouvelles dépendances
bun install

# Appliquer les migrations si nécessaire
bun run db:migrate

# Redémarrer l'API
pm2 restart jlinks-api
```

### Backup de la base de données

```bash
# Créer un backup
cp /data/jlinks/jlinks.db /data/jlinks/backup/jlinks-$(date +%Y%m%d).db

# Script automatique (ajouter au crontab)
# 0 2 * * * cp /data/jlinks/jlinks.db /data/jlinks/backup/jlinks-$(date +\%Y\%m\%d).db
```

### Logs

```bash
# Logs PM2 de l'API
pm2 logs jlinks-api

# Logs Nginx
sudo tail -f /var/log/nginx/jlinks-api-access.log
sudo tail -f /var/log/nginx/jlinks-api-error.log

# Logs système
journalctl -u nginx -f
```

### Commandes PM2 utiles

```bash
pm2 status              # État des processus
pm2 logs jlinks-api     # Voir les logs
pm2 restart jlinks-api  # Redémarrer
pm2 stop jlinks-api     # Arrêter
pm2 monit               # Monitoring en temps réel
```

### Renouvellement SSL

Certbot renouvelle automatiquement les certificats. Pour forcer :

```bash
sudo certbot renew --dry-run  # Test
sudo certbot renew            # Renouvellement
```

---

## Troubleshooting

### L'API ne répond pas

```bash
# Vérifier que PM2 tourne
pm2 status

# Vérifier les logs
pm2 logs jlinks-api --lines 50

# Redémarrer
pm2 restart jlinks-api
```

### Erreur 502 Bad Gateway

```bash
# Vérifier que l'API écoute sur le port 3000
curl http://localhost:3000/health

# Vérifier la config Nginx
sudo nginx -t

# Recharger Nginx
sudo systemctl reload nginx
```

### Erreur 403 CORS

Vérifie que `ALLOWED_ORIGINS` dans `.env` contient bien les domaines corrects :

```bash
ALLOWED_ORIGINS=https://admin.links.jonlabs.ch,https://links.jonlabs.ch
```

Puis redémarre l'API :

```bash
pm2 restart jlinks-api
```

### Certificat SSL expiré

```bash
# Renouveler le certificat
sudo certbot renew

# Si ça ne marche pas, réinstaller
sudo certbot --nginx -d api.links.jonlabs.ch
```

### Base de données corrompue

```bash
# Arrêter l'API
pm2 stop jlinks-api

# Vérifier l'intégrité
sqlite3 /data/jlinks/jlinks.db "PRAGMA integrity_check;"

# Si corrompu, restaurer un backup
cp /data/jlinks/backup/jlinks-YYYYMMDD.db /data/jlinks/jlinks.db

# Redémarrer
pm2 start jlinks-api
```

### Les pages publiques ne se mettent pas à jour

1. Vérifie que le `VERCEL_DEPLOY_HOOK` est correct
2. Teste manuellement le hook :
   ```bash
   curl -X POST "https://api.vercel.com/v1/integrations/deploy/prj_xxx/yyy"
   ```
3. Vérifie les logs Vercel pour voir si le build a réussi

---

## Checklist de déploiement

### VPS
- [ ] Bun installé
- [ ] Node.js + PM2 installés
- [ ] Nginx installé et configuré
- [ ] Certificat SSL obtenu
- [ ] Code cloné dans `/opt/jlinks`
- [ ] `.env` configuré
- [ ] Base de données initialisée
- [ ] PM2 démarré et sauvegardé
- [ ] Test `curl https://api.links.jonlabs.ch/health` OK

### Vercel
- [ ] Projet Admin créé et déployé
- [ ] Projet Web créé et déployé
- [ ] Variables d'environnement configurées
- [ ] Domaines configurés
- [ ] Deploy Hook créé et ajouté au VPS

### DNS
- [ ] `api.links.jonlabs.ch` → IP VPS
- [ ] `admin.links.jonlabs.ch` → Vercel
- [ ] `links.jonlabs.ch` → Vercel

### Tests finaux
- [ ] Login admin fonctionne
- [ ] CRUD liens fonctionne
- [ ] Bouton "Publier" fonctionne
- [ ] Pages publiques s'affichent
- [ ] QR code téléchargeable
- [ ] vCard téléchargeable
