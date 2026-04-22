# Deploying DataWave to Vercel + Supabase

## 1. Create a Supabase project

1. Go to https://supabase.com → **New project** and pick a region close to your Vercel region.
2. Once it's ready, open **Project Settings → Database → Connection string** and copy the **URI** (the one with `postgres://...`). Use the **"Transaction" pooler** connection string (port `6543`) for serverless workloads on Vercel — it handles connection limits gracefully.
3. (Optional) Switch to the **Session** pooler (`5432`) for migrations only.

## 2. Push the schema to Supabase

From your local machine, with `DATABASE_URL` set to the Supabase connection string:

```bash
DATABASE_URL="postgres://..." pnpm --filter @workspace/db run push
```

This applies the Drizzle schema (datasets, articles, likes) to Supabase.

## 3. Push the code to GitHub

Create a new GitHub repo and push this project to it.

## 4. Import into Vercel

1. Go to https://vercel.com → **Add New Project** → import your GitHub repo.
2. **Framework preset**: leave as **Other** — `vercel.json` already configures the build.
3. Add the following environment variables (Production + Preview):

| Name             | Value                                                                  |
| ---------------- | ---------------------------------------------------------------------- |
| `DATABASE_URL`   | Supabase pooled connection string (port 6543, with `?sslmode=require`) |
| `ADMIN_PASSWORD` | Any strong password — required for the `/admin` login                  |
| `SESSION_SECRET` | A long random string (e.g. `openssl rand -hex 32`) — must be set in production |
| `NODE_ENV`       | `production`                                                           |

4. Click **Deploy**. Vercel will:
   - Run `pnpm install`
   - Run `node scripts/build-vercel.mjs` which bundles the Express API into `api/index.mjs` (a serverless function) and builds the React app into `dist/`.

## 5. Verify

- `https://your-app.vercel.app/` → public site
- `https://your-app.vercel.app/admin` → log in with `ADMIN_PASSWORD`
- `https://your-app.vercel.app/api/summary` → JSON stats

## Notes

- The `api/` folder is generated at build time — do not commit it.
- The like rate-limiter is in-memory and resets on cold starts. For stricter spam protection, move it to Postgres (e.g. a `like_attempts` table with timestamps).
- Cookies are set with `secure: true` in production, so authenticated admin sessions only work over HTTPS (which Vercel provides by default).
