# Pamoja Humanitarian Coordination Platform

A platform connecting donors, beneficiaries, humanitarian agencies and admins to coordinate aid from need to delivery.

**Stack:** React (Vite, TypeScript) · Flask · PostgreSQL · JWT auth · M-Pesa Daraja · ReliefWeb

## Repository layout

```
frontend/   React app
backend/    Flask API
docs/       Contribution rules and notes
```

## Prerequisites

Git, Node.js 20.19+ (LTS), Python 3 (3.12 recommended), pipenv, and PostgreSQL 14+.

## Getting started

```bash
git clone <repo-url>
cd <repo-folder>
```

### Database (each developer creates their own local database)

```bash
sudo service postgresql start      # Ubuntu / WSL. On Windows or Mac, start the PostgreSQL service.
sudo -u postgres psql
```

Inside psql:

```sql
CREATE USER pamoja_user WITH PASSWORD 'choose_a_password';
CREATE DATABASE pamoja_db OWNER pamoja_user;
\q
```

### Back-end

```bash
cd backend
cp .env.example .env               # then edit DATABASE_URL, SECRET_KEY and JWT_SECRET_KEY
pipenv install --dev
pipenv shell
flask db upgrade                   # creates all tables
python seed.py                     # demo data
flask run                          # http://localhost:5000
```

Check it works: open http://localhost:5000/api/health

Run the tests: `pytest`

### Front-end (new terminal)

```bash
cd frontend
cp .env.example .env
npm install
npm run dev                        # http://localhost:5173
```

### Demo accounts

All seeded accounts use the password in `SEED_PASSWORD` (default `Pamoja#2026`).

| Role | Email |
|---|---|
| Donor | amina.hassan@example.org |
| Beneficiary | grace.wanjiku@example.org |
| Agency | daniel.mutua@example.org |
| Admin | admin@example.org |

After every `git pull`, run `flask db upgrade` in `backend/`.

## Contributing

Read [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) before your first branch.