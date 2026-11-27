# Pamoja Humanitarian Coordination Platform

**Pamoja** (Swahili for "together") is a web platform that connects people in need, donors, humanitarian agencies and administrators, so that aid can be coordinated openly from the first request to a confirmed delivery.

Its guiding rule is **accountability: a pledge is a commitment, never a delivery.** Only a beneficiary's confirmed receipt counts as delivered assistance.

> This is a university group project. All organizations, people, requests and figures in the seeded data are fictional demonstration data.

## Live demo

| | |
|---|---|
| Website | https://pamoja-web.onrender.com |
| API | https://pamoja-app.onrender.com (health check: `/api/health`) |

**The first load can take about a minute.** The site is on a free hosting plan that sleeps when idle.

On the sign-in page, use **Try Demo** to sign in instantly as any role, or type the details yourself. All demo accounts share the password `Pamoja#2026`.

| Role | Email | What you can do |
|---|---|---|
| Donor | `amina.hassan@example.org` | Browse needs, pledge resources, donate, track donations |
| Beneficiary | `grace.wanjiku@example.org` | Request assistance, track a request, confirm receipt |
| Agency | `daniel.mutua@example.org` | Assess requests, match resources, manage inventory and deliveries |
| Administrator | `admin@example.org` | Verify agencies, manage users, oversee requests, review duplicates, read the audit log |

You can also register a new test account (donor, beneficiary or agency). New agencies start as *pending* until an administrator verifies them.

## Contents

1. [What Pamoja does](#what-pamoja-does)
2. [Technology](#technology)
3. [Repository layout](#repository-layout)
4. [Run it on your computer](#run-it-on-your-computer)
5. [Tests and checks](#tests-and-checks)
6. [API overview](#api-overview)
7. [Database and migrations](#database-and-migrations)
8. [Deployment](#deployment)
9. [Team and workflow](#team-and-workflow)
10. [Known limitations](#known-limitations)

## What Pamoja does

Every need moves through seven stages: **Need identified, Assessed, Published, Pledged, Allocated, Delivered, Confirmed.**

### Public pages (no sign-in)
- **Home**, **About**
- **Explore needs:** search and filter published opportunities by category, location and urgency
- **Opportunity detail:** the assistance journey, resource requirements and commitment progress
- **Needs map:** a generalized county-level map. Exact beneficiary locations are never shown
- **Our impact:** live statistics, counting only confirmed receipts as delivered
- **Situation centre:** humanitarian situation reports

### Donor portal
Discover needs, pledge resources, donate by M-Pesa (demonstration flow), view donation and pledge history, notifications and preferences.

### Beneficiary portal
Request assistance through a privacy-conscious form, track a request through the seven stages, confirm receipt of a delivery, and read notifications.

### Agency portal
Review and assess requests, match available resources, manage inventory, tasks and deliveries, and run collection centres and appointments.

### Administrator portal
- **Agency verification:** a review checklist, private notes, approve or request more information
- **Users:** search, filter, approve, suspend and reactivate accounts
- **Request oversight:** every request across all agencies, with stage and priority
- **Duplicate review:** flags similar requests for a human decision (similarity alone never implies fraud)
- **Audit activity:** a recorded timeline of important actions
- **Dashboard:** headline numbers and a trust and safety summary

## Technology

| Layer | Tools |
|---|---|
| Front-end | React 19, TypeScript, Vite, React Router 7, Tailwind CSS 4, lucide-react |
| Back-end | Python, Flask, SQLAlchemy, Flask-Migrate (Alembic), Marshmallow, Flask-JWT-Extended, Flask-CORS, gunicorn |
| Database | PostgreSQL (Neon in production) |
| Payments and data | M-Pesa Daraja (demonstration flow), ReliefWeb reports |
| Hosting | Render (API and static site), Neon (database) |
| Testing | pytest (back-end), TypeScript compiler (front-end) |

## Repository layout

```
Pamoja_App/
├── backend/
│   ├── app/
│   │   ├── models/      database tables (SQLAlchemy)
│   │   ├── schemas/     request and response shapes (Marshmallow, camelCase JSON)
│   │   ├── routes/      API endpoints (one blueprint per file)
│   │   ├── services/    business logic (auth, audit, notifications, duplicates, M-Pesa, ...)
│   │   ├── seeds/       demo data (seed_*.py)
│   │   └── utils/       role checks, pagination, validators
│   ├── migrations/      database migrations (Alembic)
│   ├── scripts/         reset_db.py (rebuild your local database)
│   ├── tests/           pytest tests
│   ├── run.py           development entry point
│   └── wsgi.py          production entry point
├── frontend/
│   └── src/
│       ├── pages/       one file per page: public, auth, donor, beneficiary, agency, admin
│       ├── components/  shared UI, layouts and portal components
│       ├── routes/      route files (one per portal) and the role-based guard
│       ├── context/     AuthContext (sign-in state)
│       ├── services/    API calls, one file per area
│       ├── hooks/       useAsync and other hooks
│       └── types/       TypeScript types matching the API
└── docs/                CONTRIBUTING, HOW_TO_ADD_A_FEATURE, DEPLOYMENT
```

## Run it on your computer

### Prerequisites

- Git
- Node.js 20.19 or newer (LTS) and npm
- Python 3 (3.12 recommended) and [pipenv](https://pipenv.pypa.io)
- PostgreSQL 14 or newer

### 1. Clone

```bash
git clone https://github.com/harmonmoindi/Pamoja_App.git
cd Pamoja_App
```

### 2. Create your own local database

Every developer keeps their own local database. On Ubuntu or WSL:

```bash
sudo service postgresql start
sudo -u postgres psql
```

Inside `psql`:

```sql
CREATE USER pamoja_user WITH PASSWORD 'choose_a_password';
CREATE DATABASE pamoja_db OWNER pamoja_user;
\q
```

On Windows or macOS, use the PostgreSQL installer and the same SQL.

> **If `CREATE DATABASE` freezes on WSL 1:** use the existing `postgres` database instead. In `psql` run
> `GRANT ALL PRIVILEGES ON DATABASE postgres TO pamoja_user; GRANT ALL ON SCHEMA public TO pamoja_user;`
> and use `.../postgres` as the database name in `DATABASE_URL`.

### 3. Back-end

```bash
cd backend
cp .env.example .env          # then edit DATABASE_URL, SECRET_KEY and JWT_SECRET_KEY
pipenv install --dev
pipenv shell
flask db upgrade              # creates all tables
python seed.py                # loads the demo data
flask run                     # http://localhost:5000
```

Check it works: open http://localhost:5000/api/health, which should show `{"status":"ok"}`.

Your `backend/.env` needs your own database login, for example:

```
DATABASE_URL=postgresql://pamoja_user:choose_a_password@localhost:5432/pamoja_db
```

Never commit `.env`. The main settings are:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `SECRET_KEY`, `JWT_SECRET_KEY` | Signing keys (use long random values) |
| `CORS_ORIGINS` | Front-end addresses the API accepts, default `http://localhost:5173` |
| `SEED_PASSWORD` | Password given to every demo account, default `Pamoja#2026` |
| `APP_ENV` | `development` (default) or `production` |

### 4. Front-end (in a second terminal)

```bash
cd frontend
cp .env.example .env
npm install
npm run dev                   # http://localhost:5173
```

`frontend/.env` points the site at the API (`VITE_API_URL=http://localhost:5000/api`).

Sign in at http://localhost:5173/signin with a demo account from the table above.

### Reset your local database

If your local database gets out of step with the migrations, from `backend/` with the virtualenv active:

```bash
python scripts/reset_db.py
```

It asks for confirmation, refuses to run against anything that is not on your own computer, then rebuilds the tables and the demo data.

## Tests and checks

```bash
# Back-end (from backend/, virtualenv active). Uses an in-memory database, so your data is never touched.
pytest

# Front-end (from frontend/)
npx tsc --noEmit     # no output means the types are correct
npm run build        # the same command the live site uses
```

Both must pass before a pull request is opened.

## API overview

Everything is under `/api`. JSON keys are camelCase, errors share one format (`{"error": {"code", "message", "details"}}`), lists are paginated (`?page=1&perPage=20` returns `{items, page, perPage, total}`), and protected routes need `Authorization: Bearer <token>`.

| Area | Examples |
|---|---|
| Auth | `POST /auth/register`, `POST /auth/login`, `GET /auth/me` |
| Public | `GET /opportunities`, `GET /centres`, `GET /impact/summary`, `GET /health` |
| Donor | pledges, donations (M-Pesa), appointments |
| Beneficiary | requests, request tracking, receipts, notifications |
| Agency | assessments, matching, inventory, tasks, deliveries, centres |
| Admin | `/users`, `/admin/agencies`, `/admin/requests`, `/admin/duplicates`, `/admin/audit`, `/admin/overview` |

Roles are `donor`, `beneficiary`, `agency` and `admin`, and each route checks the role. The complete list is in `backend/app/routes/`.

## Database and migrations

The schema lives in `backend/migrations/`, so every environment gets identical tables.

- After pulling new code, run `flask db upgrade`.
- A model change and its migration are committed together: `flask db migrate -m "describe the change"`.
- Merge the latest `main` before creating a migration, and create one migration per pull request.
- Never edit a migration that is already in `main`.

## Deployment

The live site runs on **Render** (API and website) with a **Neon** PostgreSQL database. Every merge into `main` redeploys both services, and the API runs `flask db upgrade` on start. The full step-by-step guide is in [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

## Team and workflow

| Area | Owner |
|---|---|
| Shared foundation, authentication, Administrator portal, landing page, deployment | _Harmon Moindi_ |
| Donor portal | _name_ |
| Beneficiary portal | _name_ |
| Agency portal | _name_ |

- One protected `main` branch, with a feature branch per person and pull requests reviewed by a teammate.
- Before every pull request: merge `main`, run `pytest` and `npx tsc --noEmit`.
- See [`docs/CONTRIBUTING.md`](docs/CONTRIBUTING.md) and [`docs/HOW_TO_ADD_A_FEATURE.md`](docs/HOW_TO_ADD_A_FEATURE.md).

## Known limitations

- **Demonstration data only.** Do not enter real personal information.
- **Demo sign-in is public.** The "Try Demo" buttons exist so reviewers can explore every role. They should be removed before any real public deployment.
- **Free hosting.** The API sleeps when idle, so the first request after a break can take about a minute.
- **Password reset is not available**, because the project has no email service.
- **The needs map is schematic.** It shows generalized county areas, not real map tiles.
- **Payments are a demonstration flow.** No real money moves.
- **Fallback data.** The public Explore pages show sample records if the live API has none to return, and say so on screen.