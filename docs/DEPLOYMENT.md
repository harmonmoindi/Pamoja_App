# Deployment guide: Neon (database) and Render (API and website)

One person (Harmon) owns the Neon and Render accounts. Everyone else keeps working on their local database.
After the first setup, every merge into `main` redeploys automatically.

```
GitHub main  --->  Render API (Flask + gunicorn)  --->  Neon PostgreSQL
             --->  Render static site (React)  --calls-->  Render API
```

## 0. Before you start

- [ ] Phase 0, sign-in and admin work are merged into `main`.
- [ ] `npx tsc --noEmit` prints nothing in `frontend/` (the site build runs it, and a type error stops the build).
- [ ] Decide about the demo accounts (see section 7).
- [ ] Free accounts on https://neon.tech and https://render.com (sign in with GitHub).

## 1. Back-end files (once, then commit)

In `backend/`, with the virtualenv active:

```bash
pipenv install gunicorn
pipenv requirements > requirements.txt
```

Open `requirements.txt` and check it lists flask, gunicorn, psycopg2-binary and the other packages.
Replace `backend/app/config.py` and `backend/app/__init__.py` with the files from the deploy pack (adds production settings).
Run `pytest` (it must still pass), then commit `Pipfile`, `Pipfile.lock`, `requirements.txt` and the two files.

## 2. Neon database

1. neon.tech: **Create project**. Name `pamoja`, PostgreSQL 16, pick the region closest to your Render region (for example Frankfurt).
2. On the project dashboard click **Connect** and copy the connection string. It looks like
   `postgresql://user:password@ep-xxxx.eu-central-1.aws.neon.tech/neondb?sslmode=require`.
3. Keep it secret. Never commit it or paste it into the group chat.

## 3. Fill Neon from your own computer

From `backend/`, with the virtualenv active. The inline variable overrides your `.env` for that one command:

```bash
DATABASE_URL="PASTE_NEON_STRING" FLASK_APP=run.py flask db upgrade
DATABASE_URL="PASTE_NEON_STRING" SEED_PASSWORD="the-password-you-choose" python seed.py
```

Check in the Neon dashboard (**Tables**) that `users`, `organizations`, `notifications`, `audit_logs` (and any later tables) exist.

## 4. Render: the API

1. Render dashboard: **New**, **Web Service**, connect the GitHub repo.
2. Settings:

| Setting | Value |
|---|---|
| Name | `pamoja-api` |
| Region | the same region as Neon |
| Branch | `main` |
| Root Directory | `backend` |
| Runtime | Python 3 |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `flask db upgrade && gunicorn wsgi:app --workers 2 --timeout 120` |
| Instance type | Free |

3. **Environment variables:**

| Key | Value |
|---|---|
| `PYTHON_VERSION` | `3.12.3` |
| `APP_ENV` | `production` |
| `FLASK_APP` | `run.py` |
| `DATABASE_URL` | the Neon string |
| `SECRET_KEY` | a new random value (see below) |
| `JWT_SECRET_KEY` | another new random value |
| `CORS_ORIGINS` | the website address, once you have it (section 5). Use a placeholder for now |

Generate each secret with: `python3 -c "import secrets; print(secrets.token_hex(32))"`. Use different ones from your local `.env`.

4. **Create Web Service.** When the deploy finishes, open `https://pamoja-api.onrender.com/api/health`. It should show `{"status":"ok"}`.
   Then test a login with curl against the live address (same command as locally, with the live URL).

Because the start command runs `flask db upgrade`, every deploy brings the Neon database up to date with the migrations in `main`.

## 5. Render: the website

1. **New**, **Static Site**, same repo.

| Setting | Value |
|---|---|
| Name | `pamoja` |
| Branch | `main` |
| Root Directory | `frontend` |
| Build Command | `npm install && npm run build` |
| Publish Directory | `dist` |

2. **Environment variables:** `VITE_API_URL` = `https://pamoja-api.onrender.com/api` and `NODE_VERSION` = `22`.
   `VITE_API_URL` is baked into the build, so if you change it you must redeploy the site.
3. **Redirects/Rewrites** tab: add a rule, Source `/*`, Destination `/index.html`, Action **Rewrite**.
   Without it, refreshing any page except the home page shows "Not Found".
4. Deploy. Copy the site address (for example `https://pamoja.onrender.com`).

## 6. Connect the two

On the API service, set `CORS_ORIGINS` to the website address (no trailing slash, no path), save, and let it redeploy.
Then open the site, sign in, and click around the admin portal.

## 7. Demo accounts on a public site

The sign-in page has "Try Demo" buttons with a password written in the code. On a public site that password is visible to everyone,
and anyone can sign in as the admin. The data is fictional, so for a school demo this can be acceptable, and it is convenient for assessors.
Choose one:

- **Keep them (demo only):** seed Neon with `SEED_PASSWORD="Pamoja#2026"` so the buttons work. Accept that the site is open.
- **Remove them:** delete the "Demo Accounts" section from `pages/auth/SignIn.tsx`, seed with a private password, and share logins with assessors directly.

Either way, never put real personal data on the live site, and never set `VITE_BYPASS_AUTH` there.

## 8. After the first deploy

- Every merge to `main` redeploys both services (a few minutes).
- A merge that adds a migration is applied automatically on the next API deploy.
- Seed data is **not** automatic. After a batch of merges, run `python seed.py` against Neon from your computer (section 3). It only adds missing rows.
- Watch **Logs** on the Render service if something fails.

## 9. Before the presentation

- The free API sleeps after about 15 minutes idle; the first request takes 30 to 60 seconds. Open the site and sign in a few minutes before you present.
- Run through the whole flow once on the live site.
- Keep a local copy running as a backup.

## Troubleshooting

| Problem | Likely cause and fix |
|---|---|
| API deploy fails at start with a database error | The migration failed. Read the Render log. Usually two migration heads, or a model changed without a migration. |
| "Set SECRET_KEY and JWT_SECRET_KEY" error | The two environment variables are missing on the API service. |
| Browser console: CORS error | `CORS_ORIGINS` on the API does not match the website address exactly (check `https`, no trailing slash). |
| Site says "Cannot reach the server" | `VITE_API_URL` is wrong, or the site was not rebuilt after changing it. |
| Refreshing a page gives "Not Found" | The rewrite rule `/*` to `/index.html` is missing. |
| Site build fails | A type error. Run `npx tsc --noEmit` locally and fix it. |
| First request is very slow | Free tier cold start. Wait about a minute. |
| Login works locally but not live | Neon was never seeded: run section 3 again. |