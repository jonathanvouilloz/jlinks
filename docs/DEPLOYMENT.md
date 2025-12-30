# jLinks - Guide de Déploiement Complet

Ce guide contient **TOUTES** les étapes pour déployer jLinks en production.

---

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Ordre des opérations](#2-ordre-des-opérations)
3. [Prérequis et comptes nécessaires](#3-prérequis-et-comptes-nécessaires)
4. [Configuration DNS](#4-configuration-dns)
5. [Déploiement VPS (API)](#5-déploiement-vps-api)
6. [Déploiement Vercel (Admin + Web)](#6-déploiement-vercel-admin--web)
7. [Configuration finale et liaison](#7-configuration-finale-et-liaison)
8. [Création du premier utilisateur](#8-création-du-premier-utilisateur)
9. [Tests de validation](#9-tests-de-validation)
10. [Sécurité et hardening](#10-sécurité-et-hardening)
11. [Maintenance et opérations](#11-maintenance-et-opérations)
12. [Backup et restauration](#12-backup-et-restauration)
13. [Monitoring](#13-monitoring)
14. [Troubleshooting](#14-troubleshooting)
15. [Checklist finale](#15-checklist-finale)

---

## 1. Vue d'ensemble

### Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              INTERNET                                    │
└─────────────────────────────────────────────────────────────────────────┘
                    │                    │                    │
                    ▼                    ▼                    ▼
        ┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐
        │ links.jonlabs.ch  │ │admin.links.jonlabs│ │api.links.jonlabs  │
        │    (Vercel)       │ │     (Vercel)      │ │     (VPS)         │
        │                   │ │                   │ │                   │
        │  Pages publiques  │ │  Interface admin  │ │  API Backend      │
        │  Astro (static)   │ │  SvelteKit        │ │  Elysia + SQLite  │
        └───────────────────┘ └───────────────────┘ └───────────────────┘
                                       │                    │
                                       │    HTTPS API       │
                                       └────────────────────┘
```

### Domaines à configurer

| Domaine | Hébergement | Usage |
|---------|-------------|-------|
| `links.jonlabs.ch` | Vercel | Pages publiques des clients |
| `admin.links.jonlabs.ch` | Vercel | Interface d'administration |
| `api.links.jonlabs.ch` | VPS | API Backend |

### Flux de données

1. **Visiteur** → `links.jonlabs.ch/slug` → Page statique (Vercel)
2. **Admin** → `admin.links.jonlabs.ch` → SvelteKit → API
3. **Publication** → Admin clique "Publier" → API → Webhook Vercel → Rebuild pages

---

## 2. Ordre des opérations

**IMPORTANT** : Suivre cet ordre pour éviter les problèmes de dépendances.

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ÉTAPE 1: PRÉPARATION                                                   │
│  □ Créer compte Vercel (si pas déjà fait)                               │
│  □ Avoir accès au VPS avec SSH                                          │
│  □ Avoir accès au gestionnaire DNS (registrar)                          │
│  □ Repo GitHub pushé (déjà fait ✓)                                      │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  ÉTAPE 2: DNS (faire en premier car propagation = 5-30 min)             │
│  □ Ajouter enregistrement A pour api.links.jonlabs.ch                   │
│  □ Ajouter enregistrement CNAME pour admin.links.jonlabs.ch             │
│  □ Ajouter enregistrement CNAME pour links.jonlabs.ch                   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  ÉTAPE 3: VPS (pendant que DNS propage)                                 │
│  □ Installer dépendances (Bun, Node, PM2, Nginx)                        │
│  □ Cloner le repo                                                       │
│  □ Configurer .env (sans VERCEL_DEPLOY_HOOK pour l'instant)             │
│  □ Initialiser la base de données                                       │
│  □ Démarrer l'API avec PM2                                              │
│  □ Configurer Nginx                                                     │
│  □ Obtenir certificat SSL                                               │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  ÉTAPE 4: VERCEL                                                        │
│  □ Créer projet Admin (apps/admin)                                      │
│  □ Configurer variables d'environnement Admin                           │
│  □ Ajouter domaine admin.links.jonlabs.ch                               │
│  □ Créer projet Web (apps/web)                                          │
│  □ Configurer variables d'environnement Web                             │
│  □ Ajouter domaine links.jonlabs.ch                                     │
│  □ Créer Deploy Hook pour Web                                           │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  ÉTAPE 5: LIAISON                                                       │
│  □ Ajouter VERCEL_DEPLOY_HOOK dans .env du VPS                          │
│  □ Redémarrer l'API                                                     │
│  □ Créer le premier utilisateur admin                                   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  ÉTAPE 6: TESTS                                                         │
│  □ Tester login admin                                                   │
│  □ Tester création de liens                                             │
│  □ Tester publication                                                   │
│  □ Tester page publique                                                 │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Prérequis et comptes nécessaires

### 3.1 Compte Vercel

1. Va sur [vercel.com](https://vercel.com)
2. Clique "Sign Up"
3. **Recommandé** : Connecte-toi avec GitHub (plus simple pour importer les repos)
4. Plan gratuit (Hobby) suffisant pour commencer

**Limites du plan gratuit Vercel :**
- 100 GB de bande passante/mois
- Builds illimités
- 1 deploy par commit
- Domaines personnalisés illimités

### 3.2 VPS

**Spécifications minimales :**
- **OS** : Ubuntu 22.04 LTS ou Debian 12
- **RAM** : 512 MB (1 GB recommandé)
- **CPU** : 1 vCPU
- **Stockage** : 10 GB SSD
- **Bande passante** : 1 TB/mois

**Fournisseurs recommandés :**
- Infomaniak (Suisse)
- Hetzner (Allemagne)
- DigitalOcean
- OVH

**Accès requis :**
- SSH avec clé ou mot de passe
- Utilisateur avec droits sudo

### 3.3 Accès DNS

Tu dois pouvoir modifier les enregistrements DNS de `jonlabs.ch`.

**Où trouver ça :**
- Si domaine chez Infomaniak → Manager Infomaniak → Domaines → DNS
- Si domaine chez OVH → Espace client → Domaines → Zone DNS
- Si Cloudflare → Dashboard → DNS

### 3.4 Informations à collecter avant de commencer

Remplis ce tableau avant de commencer :

| Information | Valeur |
|-------------|--------|
| IP du VPS | `___.___.___.___ ` |
| User SSH du VPS | `________________` |
| Domaine principal | `jonlabs.ch` |
| Email pour SSL | `________________` |
| URL repo GitHub | `https://github.com/jonathanvouilloz/jlinks` |

---

## 4. Configuration DNS

### 4.1 Enregistrements à créer

**IMPORTANT** : Fais cette étape EN PREMIER car la propagation DNS peut prendre 5-30 minutes.

Connecte-toi à ton gestionnaire DNS et ajoute ces enregistrements :

#### Enregistrement 1 : API (VPS)

| Champ | Valeur |
|-------|--------|
| Type | `A` |
| Nom/Host | `api.links` |
| Valeur/Target | `[IP_DE_TON_VPS]` |
| TTL | `3600` (ou "1 hour") |

#### Enregistrement 2 : Admin (Vercel)

| Champ | Valeur |
|-------|--------|
| Type | `CNAME` |
| Nom/Host | `admin.links` |
| Valeur/Target | `cname.vercel-dns.com` |
| TTL | `3600` |

#### Enregistrement 3 : Web (Vercel)

| Champ | Valeur |
|-------|--------|
| Type | `CNAME` |
| Nom/Host | `links` |
| Valeur/Target | `cname.vercel-dns.com` |
| TTL | `3600` |

### 4.2 Exemple selon les fournisseurs

#### Infomaniak

1. Va sur [manager.infomaniak.com](https://manager.infomaniak.com)
2. Menu "Web & Domaine" → Sélectionne `jonlabs.ch`
3. Clique "Zone DNS"
4. Clique "+ Ajouter une entrée"
5. Remplis les champs selon le tableau ci-dessus
6. Sauvegarde

#### Cloudflare

1. Va sur [dash.cloudflare.com](https://dash.cloudflare.com)
2. Sélectionne le domaine `jonlabs.ch`
3. Clique "DNS" dans le menu
4. Clique "+ Add record"
5. **IMPORTANT** : Désactive le proxy (nuage orange → gris) pour `api.links`
6. Pour les CNAME Vercel, le proxy peut rester actif

#### OVH

1. Va sur [ovh.com/manager](https://www.ovh.com/manager)
2. Domaines → `jonlabs.ch` → Zone DNS
3. Clique "Ajouter une entrée"
4. Sélectionne le type (A ou CNAME)
5. Remplis les champs

### 4.3 Vérifier la propagation DNS

Après avoir ajouté les enregistrements, vérifie qu'ils se propagent :

```bash
# Depuis ton ordinateur local
nslookup api.links.jonlabs.ch
nslookup admin.links.jonlabs.ch
nslookup links.jonlabs.ch

# Ou avec dig
dig api.links.jonlabs.ch +short
dig admin.links.jonlabs.ch +short
dig links.jonlabs.ch +short
```

**Résultats attendus :**
- `api.links.jonlabs.ch` → IP de ton VPS
- `admin.links.jonlabs.ch` → `cname.vercel-dns.com` (ou IP Vercel)
- `links.jonlabs.ch` → `cname.vercel-dns.com` (ou IP Vercel)

**Outil en ligne** : [dnschecker.org](https://dnschecker.org) pour vérifier la propagation mondiale.

---

## 5. Déploiement VPS (API)

### 5.1 Connexion SSH

```bash
# Connexion au VPS
ssh ton-user@IP_DU_VPS

# Ou avec clé SSH
ssh -i ~/.ssh/ta_cle ton-user@IP_DU_VPS
```

### 5.2 Mise à jour du système

```bash
# Mise à jour des paquets
sudo apt update && sudo apt upgrade -y

# Installer les outils de base
sudo apt install -y curl git unzip wget gnupg2 ca-certificates lsb-release
```

### 5.3 Configuration du firewall (UFW)

```bash
# Installer UFW si pas présent
sudo apt install -y ufw

# Règles de base
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Autoriser SSH (IMPORTANT : ne pas oublier sinon tu perds l'accès !)
sudo ufw allow ssh
# Ou si SSH sur un port custom : sudo ufw allow 22222/tcp

# Autoriser HTTP et HTTPS
sudo ufw allow http
sudo ufw allow https

# Activer le firewall
sudo ufw enable

# Vérifier le status
sudo ufw status
```

**Résultat attendu :**
```
Status: active

To                         Action      From
--                         ------      ----
22/tcp                     ALLOW       Anywhere
80/tcp                     ALLOW       Anywhere
443/tcp                    ALLOW       Anywhere
```

### 5.4 Installer Bun

```bash
# Installer Bun
curl -fsSL https://bun.sh/install | bash

# Recharger le shell pour avoir bun dans le PATH
source ~/.bashrc

# Vérifier l'installation
bun --version
```

**Résultat attendu** : `1.x.x` (version actuelle de Bun)

### 5.5 Installer Node.js et PM2

```bash
# Ajouter le repo NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Installer Node.js
sudo apt install -y nodejs

# Vérifier
node --version   # v20.x.x
npm --version    # 10.x.x

# Installer PM2 globalement
sudo npm install -g pm2

# Vérifier
pm2 --version    # 5.x.x
```

### 5.6 Installer Nginx

```bash
# Installer Nginx
sudo apt install -y nginx

# Démarrer et activer au boot
sudo systemctl start nginx
sudo systemctl enable nginx

# Vérifier
sudo systemctl status nginx
```

**Test** : Ouvre `http://IP_DU_VPS` dans un navigateur → Tu dois voir la page "Welcome to nginx!"

### 5.7 Installer Certbot

```bash
# Installer Certbot avec le plugin Nginx
sudo apt install -y certbot python3-certbot-nginx
```

### 5.8 Créer la structure des dossiers

```bash
# Dossier pour le code source
sudo mkdir -p /opt/jlinks
sudo chown $USER:$USER /opt/jlinks

# Dossier pour les données (base de données SQLite)
sudo mkdir -p /data/jlinks/backup
sudo chown -R $USER:$USER /data/jlinks

# Dossier pour les logs
sudo mkdir -p /var/log/jlinks
sudo chown $USER:$USER /var/log/jlinks
```

### 5.9 Cloner le repository

```bash
# Aller dans le dossier
cd /opt/jlinks

# Cloner le repo
git clone https://github.com/jonathanvouilloz/jlinks.git .

# Vérifier
ls -la
```

**Tu dois voir** : `apps/`, `packages/`, `docs/`, `package.json`, etc.

### 5.10 Installer les dépendances

```bash
# Dans /opt/jlinks
bun install
```

### 5.11 Configurer les variables d'environnement

```bash
# Copier le template
cp apps/api/.env.example apps/api/.env

# Générer un secret aléatoire
openssl rand -base64 32
# Copie le résultat !

# Éditer le fichier
nano apps/api/.env
```

**Contenu de `/opt/jlinks/apps/api/.env` :**

```bash
# ===========================================
# jLinks API - Configuration Production
# ===========================================

# Server
PORT=3000
NODE_ENV=production

# Database (SQLite)
DATABASE_URL=file:/data/jlinks/jlinks.db

# Authentication
# IMPORTANT: Remplace par le secret généré avec openssl rand -base64 32
BETTER_AUTH_SECRET=COLLE_TON_SECRET_ICI

# CORS - Domaines autorisés à appeler l'API
ALLOWED_ORIGINS=https://admin.links.jonlabs.ch,https://links.jonlabs.ch

# Vercel Deploy Hook
# LAISSE VIDE POUR L'INSTANT - On le remplira après avoir créé le projet Vercel
VERCEL_DEPLOY_HOOK=

# URL publique du site (pour QR codes et vCards)
SITE_URL=https://links.jonlabs.ch
```

**CTRL+O** pour sauvegarder, **CTRL+X** pour quitter nano.

### 5.12 Initialiser la base de données

```bash
cd /opt/jlinks

# Appliquer les migrations (crée les tables)
bun run db:migrate

# Vérifier que la base existe
ls -la /data/jlinks/
# Tu dois voir jlinks.db
```

### 5.13 Démarrer l'API avec PM2

```bash
# Aller dans le dossier API
cd /opt/jlinks/apps/api

# Démarrer avec PM2
pm2 start ecosystem.config.cjs

# Vérifier le status
pm2 status

# Voir les logs
pm2 logs jlinks-api
```

**Résultat attendu de `pm2 status` :**
```
┌─────┬──────────────┬─────────────┬─────────┬─────────┬──────────┐
│ id  │ name         │ namespace   │ version │ mode    │ pid      │
├─────┼──────────────┼─────────────┼─────────┼─────────┼──────────┤
│ 0   │ jlinks-api   │ default     │ N/A     │ fork    │ 12345    │
└─────┴──────────────┴─────────────┴─────────┴─────────┴──────────┘
```

**Test local :**
```bash
curl http://localhost:3000/health
# Doit retourner : {"status":"ok"} ou similaire
```

### 5.14 Configurer le démarrage automatique

```bash
# Générer le script de démarrage
pm2 startup

# PM2 va afficher une commande à copier/coller, par exemple :
# sudo env PATH=$PATH:/home/user/.bun/bin pm2 startup systemd -u user --hp /home/user

# Exécute la commande affichée !

# Sauvegarder l'état actuel
pm2 save
```

### 5.15 Configurer Nginx

```bash
# Copier la config fournie
sudo cp /opt/jlinks/deploy/nginx/jlinks-api.conf /etc/nginx/sites-available/

# Créer le lien symbolique pour activer le site
sudo ln -s /etc/nginx/sites-available/jlinks-api.conf /etc/nginx/sites-enabled/

# Supprimer la config par défaut (optionnel)
sudo rm /etc/nginx/sites-enabled/default

# Tester la configuration
sudo nginx -t
```

**Résultat attendu :**
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

```bash
# Recharger Nginx
sudo systemctl reload nginx
```

### 5.16 Obtenir le certificat SSL

**IMPORTANT** : Le DNS doit être propagé avant cette étape !

```bash
# Vérifier que le DNS est propagé
dig api.links.jonlabs.ch +short
# Doit afficher l'IP de ton VPS

# Obtenir le certificat
sudo certbot --nginx -d api.links.jonlabs.ch
```

**Questions de Certbot :**
1. Email : Entre ton email (pour les alertes d'expiration)
2. Terms of Service : `Y`
3. Share email with EFF : `N` (optionnel)
4. Redirect HTTP to HTTPS : `2` (recommandé)

### 5.17 Tester l'API

```bash
# Test HTTPS
curl https://api.links.jonlabs.ch/health

# Doit retourner quelque chose comme :
# {"status":"ok"}
```

**Depuis ton navigateur** : Ouvre `https://api.links.jonlabs.ch/health`

---

## 6. Déploiement Vercel (Admin + Web)

### 6.1 Connexion à Vercel

1. Va sur [vercel.com](https://vercel.com)
2. Connecte-toi (avec GitHub de préférence)

### 6.2 Créer le projet ADMIN

#### Étape 1 : Import du repo

1. Clique **"Add New..."** → **"Project"**
2. Dans "Import Git Repository", cherche `jlinks`
3. Clique **"Import"** à côté de `jonathanvouilloz/jlinks`

#### Étape 2 : Configuration du projet

| Champ | Valeur |
|-------|--------|
| **Project Name** | `jlinks-admin` |
| **Framework Preset** | `SvelteKit` (détecté auto) |
| **Root Directory** | Clique "Edit" → Entre `apps/admin` |
| **Build Command** | `bun run build` |
| **Output Directory** | Laisser vide (auto) |
| **Install Command** | `bun install` |

#### Étape 3 : Variables d'environnement

Clique **"Environment Variables"** et ajoute :

| Name | Value |
|------|-------|
| `PUBLIC_API_URL` | `https://api.links.jonlabs.ch` |

#### Étape 4 : Deploy

Clique **"Deploy"** et attends que le build termine.

#### Étape 5 : Configurer le domaine

1. Une fois déployé, va dans **"Settings"** → **"Domains"**
2. Clique **"Add"**
3. Entre : `admin.links.jonlabs.ch`
4. Clique **"Add"**

Vercel va vérifier le DNS. Si tu as bien configuré le CNAME, ça devrait être vert.

### 6.3 Créer le projet WEB

#### Étape 1 : Nouveau projet

1. Retourne sur le dashboard Vercel
2. Clique **"Add New..."** → **"Project"**
3. Importe le même repo `jonathanvouilloz/jlinks`

#### Étape 2 : Configuration

| Champ | Valeur |
|-------|--------|
| **Project Name** | `jlinks-web` |
| **Framework Preset** | `Astro` (détecté auto) |
| **Root Directory** | Clique "Edit" → Entre `apps/web` |
| **Build Command** | `bun run build` |
| **Output Directory** | `dist` |
| **Install Command** | `bun install` |

#### Étape 3 : Variables d'environnement

| Name | Value |
|------|-------|
| `API_URL` | `https://api.links.jonlabs.ch` |
| `SITE_URL` | `https://links.jonlabs.ch` |

#### Étape 4 : Deploy

Clique **"Deploy"**.

**Note** : Le premier build va logger une erreur "Error fetching clients" car il n'y a pas encore de clients dans la base. C'est normal, les pages statiques seront générées quand tu publieras des clients.

#### Étape 5 : Configurer le domaine

1. Va dans **"Settings"** → **"Domains"**
2. Ajoute : `links.jonlabs.ch`

### 6.4 Créer le Deploy Hook

Le Deploy Hook permet à l'API de déclencher un rebuild quand quelqu'un clique "Publier".

1. Dans le projet **`jlinks-web`**, va dans **"Settings"**
2. Menu **"Git"** (dans la sidebar)
3. Scroll jusqu'à **"Deploy Hooks"**
4. Clique **"Create Hook"**
5. Nom : `jlinks-publish`
6. Branch : `main`
7. Clique **"Create Hook"**
8. **COPIE L'URL** qui apparaît (elle ressemble à `https://api.vercel.com/v1/integrations/deploy/prj_xxx/yyy`)

---

## 7. Configuration finale et liaison

### 7.1 Ajouter le Deploy Hook au VPS

Retourne sur ton VPS :

```bash
# Éditer le fichier .env
nano /opt/jlinks/apps/api/.env
```

Trouve la ligne `VERCEL_DEPLOY_HOOK=` et ajoute l'URL :

```bash
VERCEL_DEPLOY_HOOK=https://api.vercel.com/v1/integrations/deploy/prj_xxx/yyy
```

Sauvegarde et ferme.

### 7.2 Redémarrer l'API

```bash
pm2 restart jlinks-api

# Vérifier
pm2 logs jlinks-api --lines 20
```

### 7.3 Tester le Deploy Hook

```bash
# Depuis le VPS
curl -X POST "https://api.vercel.com/v1/integrations/deploy/prj_xxx/yyy"
```

Va sur Vercel → `jlinks-web` → "Deployments" → Tu devrais voir un nouveau deployment en cours.

---

## 8. Création du premier utilisateur

### 8.1 Utiliser le seed (données de test)

```bash
cd /opt/jlinks

# Exécuter le seed
bun run db:seed
```

Cela crée :
- **Super Admin** : `admin@jonlabs.ch` / `admin123`
- **Client démo** : `demo@example.com` / `demo123`

### 8.2 Ou créer manuellement via SQLite

```bash
# Ouvrir la base de données
sqlite3 /data/jlinks/jlinks.db
```

```sql
-- Créer un client
INSERT INTO clients (id, slug, name, primary_color, secondary_color, plan)
VALUES ('client-1', 'mon-premier-client', 'Mon Premier Client', '#00D9A3', '#FFFFFF', 'pro');

-- Créer un utilisateur super admin
-- Le mot de passe doit être hashé avec bcrypt, utilise le seed à la place
-- Ou utilise l'API pour créer les utilisateurs

.exit
```

**Recommandation** : Utilise le seed pour créer les premiers utilisateurs, puis change les mots de passe via l'interface admin.

---

## 9. Tests de validation

### 9.1 Test de l'API

```bash
# Health check
curl https://api.links.jonlabs.ch/health

# Test auth (doit retourner 401)
curl https://api.links.jonlabs.ch/auth/session
```

### 9.2 Test de l'Admin

1. Ouvre `https://admin.links.jonlabs.ch`
2. Tu dois voir la page de login
3. Connecte-toi avec `admin@jonlabs.ch` / `admin123`
4. Tu dois voir le dashboard

### 9.3 Test du CRUD

1. Dans l'admin, crée un nouveau lien
2. Active/désactive un lien
3. Modifie un lien
4. Supprime un lien

### 9.4 Test de la publication

1. Clique sur "Publier"
2. Va sur Vercel → vérifie qu'un deployment se lance
3. Attends ~30-60 secondes
4. Va sur `https://links.jonlabs.ch/demo`
5. Tu dois voir la page publique

### 9.5 Test des features

```bash
# QR Code
curl -o qrcode.png "https://api.links.jonlabs.ch/qrcode/png" \
  -H "Cookie: session=..." # Nécessite une session

# vCard (public)
curl -o contact.vcf "https://api.links.jonlabs.ch/vcard/demo"
```

---

## 10. Sécurité et hardening

### 10.1 Changer les mots de passe par défaut

Immédiatement après le déploiement :

1. Connecte-toi à l'admin avec `admin@jonlabs.ch`
2. Va dans Paramètres → Change le mot de passe
3. Utilise un mot de passe fort (16+ caractères, mix de caractères)

### 10.2 Configurer Fail2ban

Fail2ban protège contre les attaques brute force.

```bash
# Installer fail2ban
sudo apt install -y fail2ban

# Créer la config locale
sudo nano /etc/fail2ban/jail.local
```

```ini
[DEFAULT]
bantime = 1h
findtime = 10m
maxretry = 5

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3

[nginx-http-auth]
enabled = true

[nginx-limit-req]
enabled = true
```

```bash
# Redémarrer fail2ban
sudo systemctl restart fail2ban

# Vérifier le status
sudo fail2ban-client status
```

### 10.3 Désactiver le login root SSH

```bash
sudo nano /etc/ssh/sshd_config
```

Trouve et modifie :
```
PermitRootLogin no
```

```bash
sudo systemctl restart sshd
```

### 10.4 Mises à jour automatiques de sécurité

```bash
sudo apt install -y unattended-upgrades

sudo dpkg-reconfigure -plow unattended-upgrades
# Sélectionne "Yes"
```

---

## 11. Maintenance et opérations

### 11.1 Mettre à jour le code

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

**Pour Vercel** : Les déploiements se font automatiquement à chaque push sur `main`.

### 11.2 Voir les logs

```bash
# Logs API en temps réel
pm2 logs jlinks-api

# Logs API (fichiers)
tail -f /var/log/jlinks/out.log
tail -f /var/log/jlinks/error.log

# Logs Nginx
sudo tail -f /var/log/nginx/jlinks-api-access.log
sudo tail -f /var/log/nginx/jlinks-api-error.log
```

### 11.3 Redémarrer les services

```bash
# API
pm2 restart jlinks-api

# Nginx
sudo systemctl restart nginx

# Tout redémarrer
pm2 restart all && sudo systemctl restart nginx
```

### 11.4 Renouveler le certificat SSL

Le certificat se renouvelle automatiquement. Pour forcer :

```bash
# Test de renouvellement
sudo certbot renew --dry-run

# Renouvellement effectif
sudo certbot renew
```

---

## 12. Backup et restauration

### 12.1 Créer un backup manuel

```bash
# Backup de la base de données
cp /data/jlinks/jlinks.db /data/jlinks/backup/jlinks-$(date +%Y%m%d-%H%M%S).db

# Vérifier
ls -la /data/jlinks/backup/
```

### 12.2 Backup automatique (cron)

```bash
# Éditer le crontab
crontab -e
```

Ajoute cette ligne pour un backup quotidien à 3h du matin :

```
0 3 * * * cp /data/jlinks/jlinks.db /data/jlinks/backup/jlinks-$(date +\%Y\%m\%d).db
```

### 12.3 Restaurer un backup

```bash
# Arrêter l'API
pm2 stop jlinks-api

# Restaurer
cp /data/jlinks/backup/jlinks-20241230.db /data/jlinks/jlinks.db

# Redémarrer
pm2 start jlinks-api
```

### 12.4 Backup complet (incluant le code)

```bash
# Créer une archive complète
tar -czvf /data/jlinks/backup/jlinks-full-$(date +%Y%m%d).tar.gz \
  /opt/jlinks \
  /data/jlinks/jlinks.db \
  /etc/nginx/sites-available/jlinks-api.conf
```

---

## 13. Monitoring

### 13.1 Monitoring PM2

```bash
# Dashboard en temps réel
pm2 monit

# Status
pm2 status

# Métriques
pm2 show jlinks-api
```

### 13.2 Monitoring système

```bash
# Utilisation CPU/RAM
htop

# Espace disque
df -h

# Mémoire
free -h
```

### 13.3 Monitoring Vercel

1. Va sur [vercel.com](https://vercel.com)
2. Sélectionne un projet
3. Onglet **"Analytics"** (disponible sur le plan Pro, limité sur Hobby)
4. Onglet **"Logs"** pour voir les logs de build

### 13.4 Alertes simples

Ajoute à ton crontab pour recevoir une alerte si l'API ne répond plus :

```bash
# Checker l'API toutes les 5 minutes
*/5 * * * * curl -sf https://api.links.jonlabs.ch/health > /dev/null || echo "jLinks API down!" | mail -s "ALERT: jLinks" ton@email.com
```

**Note** : Nécessite d'avoir configuré un MTA (postfix, sendmail) pour envoyer des emails.

---

## 14. Troubleshooting

### 14.1 L'API ne démarre pas

```bash
# Voir les logs d'erreur
pm2 logs jlinks-api --err --lines 50

# Causes courantes :
# - Port 3000 déjà utilisé
# - Variables d'environnement manquantes
# - Erreur de syntaxe dans .env

# Vérifier le port
sudo lsof -i :3000

# Tuer le processus si nécessaire
sudo kill -9 [PID]
```

### 14.2 Erreur 502 Bad Gateway

```bash
# L'API ne répond pas
curl http://localhost:3000/health

# Si ça ne répond pas :
pm2 restart jlinks-api
pm2 logs jlinks-api

# Si ça répond mais 502 persiste :
sudo nginx -t
sudo systemctl reload nginx
```

### 14.3 Erreur CORS

```bash
# Vérifier les origines autorisées
cat /opt/jlinks/apps/api/.env | grep ALLOWED_ORIGINS

# Doit contenir les deux domaines Vercel
# ALLOWED_ORIGINS=https://admin.links.jonlabs.ch,https://links.jonlabs.ch

# Après modification :
pm2 restart jlinks-api
```

### 14.4 Certificat SSL expiré

```bash
# Vérifier l'expiration
sudo certbot certificates

# Renouveler
sudo certbot renew

# Si ça ne marche pas, recréer
sudo certbot --nginx -d api.links.jonlabs.ch --force-renewal
```

### 14.5 Base de données corrompue

```bash
# Vérifier l'intégrité
sqlite3 /data/jlinks/jlinks.db "PRAGMA integrity_check;"

# Si "ok" : pas de corruption
# Sinon : restaurer un backup

pm2 stop jlinks-api
cp /data/jlinks/backup/jlinks-DERNIER.db /data/jlinks/jlinks.db
pm2 start jlinks-api
```

### 14.6 Le bouton Publier ne fonctionne pas

```bash
# Tester le webhook manuellement
curl -X POST "URL_DU_DEPLOY_HOOK"

# Vérifier que l'URL est correcte dans .env
cat /opt/jlinks/apps/api/.env | grep VERCEL_DEPLOY_HOOK

# Vérifier les logs
pm2 logs jlinks-api --lines 20
```

### 14.7 Les pages publiques ne se mettent pas à jour

1. Vérifie que le deployment Vercel a réussi
2. Va sur Vercel → `jlinks-web` → "Deployments"
3. Clique sur le dernier deployment → "Building" ou "Ready"
4. Si "Error" : regarde les logs de build

---

## 15. Checklist finale

### Avant de lancer

#### DNS
- [ ] Enregistrement A créé pour `api.links.jonlabs.ch` → IP VPS
- [ ] Enregistrement CNAME créé pour `admin.links.jonlabs.ch` → `cname.vercel-dns.com`
- [ ] Enregistrement CNAME créé pour `links.jonlabs.ch` → `cname.vercel-dns.com`
- [ ] Propagation DNS vérifiée (`dig` ou dnschecker.org)

#### VPS
- [ ] UFW configuré (SSH, HTTP, HTTPS)
- [ ] Bun installé et fonctionnel
- [ ] Node.js et PM2 installés
- [ ] Nginx installé et actif
- [ ] Certbot installé
- [ ] Dossiers créés (`/opt/jlinks`, `/data/jlinks`, `/var/log/jlinks`)
- [ ] Repo cloné dans `/opt/jlinks`
- [ ] Dépendances installées (`bun install`)
- [ ] `.env` configuré avec toutes les variables
- [ ] Base de données initialisée (`bun run db:migrate`)
- [ ] API démarrée avec PM2
- [ ] PM2 configuré pour démarrer au boot
- [ ] Nginx configuré avec le site jlinks-api
- [ ] Certificat SSL obtenu
- [ ] Test `curl https://api.links.jonlabs.ch/health` OK

#### Vercel
- [ ] Projet `jlinks-admin` créé
- [ ] Root directory configuré : `apps/admin`
- [ ] Variable `PUBLIC_API_URL` configurée
- [ ] Domaine `admin.links.jonlabs.ch` ajouté et vérifié
- [ ] Projet `jlinks-web` créé
- [ ] Root directory configuré : `apps/web`
- [ ] Variables `API_URL` et `SITE_URL` configurées
- [ ] Domaine `links.jonlabs.ch` ajouté et vérifié
- [ ] Deploy Hook créé et URL copiée

#### Liaison
- [ ] `VERCEL_DEPLOY_HOOK` ajouté au `.env` du VPS
- [ ] API redémarrée après ajout du hook
- [ ] Données de test créées (`bun run db:seed`)
- [ ] Mot de passe admin changé

#### Tests
- [ ] Login admin fonctionne
- [ ] Création de liens fonctionne
- [ ] Publication déclenche un rebuild
- [ ] Pages publiques s'affichent correctement
- [ ] QR code téléchargeable
- [ ] vCard téléchargeable

#### Sécurité
- [ ] Mot de passe admin changé (pas `admin123` !)
- [ ] Fail2ban installé et configuré
- [ ] Login root SSH désactivé

---

## Récapitulatif des URLs

| Service | URL |
|---------|-----|
| API (health) | https://api.links.jonlabs.ch/health |
| Admin | https://admin.links.jonlabs.ch |
| Pages publiques | https://links.jonlabs.ch/[slug] |
| Dashboard Vercel | https://vercel.com/dashboard |

---

## Support

En cas de problème :
1. Consulte les logs (`pm2 logs`, logs Nginx, logs Vercel)
2. Vérifie cette documentation
3. Consulte le repo GitHub : https://github.com/jonathanvouilloz/jlinks

---

*Document généré le 30 décembre 2024*
