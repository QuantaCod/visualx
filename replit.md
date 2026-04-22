# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## DataWave (artifacts/datawave + artifacts/api-server)

A public data-visualization site with admin-managed datasets and articles.

- **Public**: home (search/tag filter, datasets + articles grids), `/dataset/:slug` (chart + HTML long description), `/article/:slug` (HTML).
- **Likes**: no-login, browser-fingerprint-based (UUID stored in `localStorage` under `datawave_fp`). Server enforces uniqueness via Postgres unique index on `(target_type, target_id, fingerprint)` and rate-limits toggles to 1.5s per fingerprint+target in memory.
- **Admin auth**: bcrypt-hashed `ADMIN_PASSWORD` env secret, HMAC-signed httpOnly session cookie (`SESSION_SECRET`, defaults to dev fallback). Routes: `POST /api/admin/login`, `POST /api/admin/logout`, `GET /api/admin/me`. Admin pages live under `/admin`.
- **Admin dashboard**: lists/edits/deletes datasets and articles. Dataset editor accepts JSON or CSV upload (PapaParse) and renders a live chart preview. Both editors render Markdown/HTML preview via DOMPurify.
- **Charts**: Recharts (bar/line/pie). `ChartRenderer` infers x/y keys defensively.
- **SEO**: react-helmet-async wraps title + OpenGraph on every page.
- **Sanitization**: every `dangerouslySetInnerHTML` flows through `isomorphic-dompurify`.
- **DB**: Drizzle tables `datasets`, `articles`, `likes` in `lib/db/src/schema/index.ts`.
- **Required secrets**: `ADMIN_PASSWORD` (set), `SESSION_SECRET` (set in production for stable sessions).

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
