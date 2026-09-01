# Cargent

Classeur de cartes pour agents et modèles d’IA. Next.js 16, Node 24, Supabase Auth / Postgres / Storage, déployable sur Vercel.

## Stack

- Next.js 16 App Router, React 19, TypeScript 5.9, Tailwind CSS 4
- Supabase (auth e-mail/mot de passe, PostgreSQL + RLS, Storage)
- pnpm 11, Node.js 24 LTS

## Prérequis

- Node.js 24 (`nvm use`)
- pnpm 11
- Un projet [Supabase](https://supabase.com)

## Installation locale

```bash
pnpm install
cp .env.example .env.local
```

Renseigne `.env.local` :

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
OPENAI_API_KEY=sk-...
```

N’ajoute jamais la clé `service_role` dans l’app. `OPENAI_API_KEY` reste côté serveur.

## Base de données

Dans le SQL Editor du dashboard Supabase, exécute les fichiers de `supabase/migrations/` dans l’ordre.

Ou, avec la CLI liée au projet :

```bash
pnpm dlx supabase login
pnpm dlx supabase link --project-ref <project-id>
pnpm dlx supabase db push
```

Régénère les types si le schéma change :

```bash
pnpm dlx supabase gen types typescript --project-id <project-id> > src/types/database.ts
```

## Auth e-mail

Dans Authentication > URL Configuration :

- Site URL : `http://localhost:3000` en local, l’URL Vercel en production
- Redirect URLs : `http://localhost:3000/auth/confirm**` et `https://ton-domaine/auth/confirm**`

Dans Authentication > Email Templates, pour Confirm signup et Reset password, utilise un lien hash SSR :

```
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type={{ .Type }}&next=/dashboard
```

Pour le reset, `next=/nouveau-mot-de-passe`.

## Scripts

```bash
pnpm dev
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Déploiement Vercel

1. Importer le dépôt GitHub.
2. Framework : Next.js (détecté).
3. Ajouter les variables d’environnement, dont `OPENAI_API_KEY` pour la génération d’illustrations.
4. Mettre `NEXT_PUBLIC_SITE_URL` sur l’URL de production.
5. Déployer.

Aucun `vercel.json` n’est requis.

## RLS à vérifier

- Anonyme : lecture des profils, collections publiques, cartes publiées, images publiques
- Anonyme : aucune écriture
- Utilisateur A : ne peut pas modifier les ressources de B
- Collection privée et carte brouillon : invisibles hors propriétaire
