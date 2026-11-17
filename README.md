# Pamoja Humanitarian Coordination Platform

A platform connecting donors, beneficiaries, humanitarian agencies and admins to coordinate aid from need to delivery.

**Stack:** React (Vite) · Flask · PostgreSQL · JWT auth · M-Pesa Daraja · ReliefWeb

## Repository layout

```
frontend/   React app
backend/    Flask API
docs/       Architecture, API, database and contribution notes
```

## Prerequisites

Git, Node.js 20+ (LTS), Python 3.12, pipenv, and PostgreSQL 16 (via Docker or a local install).

## Getting started

```bash
git clone <repo-url>
cd <repo-folder>
```

**Database**
```bash
docker compose up -d        # starts PostgreSQL on port 5432
```

**Back-end**
```bash
cd backend
cp .env.example .env     # then edit the values
pipenv install --dev
pipenv shell
flask db upgrade
python seed.py
flask run                   # http://localhost:5000
```

**Front-end** (new terminal)
```bash
cd frontend
cp .env.example .env
npm install
npm run dev                 # http://localhost:5173
```

## Contributing

Read [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) before your first branch.
