# Contributing

## Branches

- `main`: stable, always runnable. Nobody pushes directly; changes arrive through pull requests.
- Feature branches: created from `main`, one per person or feature, named `type/area-short-description`
  (for example `feature/donor-pledge-page`, `fix/mpesa-callback`, `docs/api-endpoints`).

## Daily workflow

```bash
git switch main
git pull origin main
git switch your-branch
git merge main            # bring the team's latest work into your branch
# ... work, then:
git add <files>
git commit -m "feat(donor): add pledge route"
git push                  # first time: git push -u origin your-branch
```

Open a pull request into `main` on GitHub. At least one teammate reviews it before merging.
Cross-review pairs: Donor dev with Beneficiary dev, Agency dev with Harmon.

## Before every pull request

1. Merge the latest `main` into your branch (`git fetch origin` then `git merge origin/main`) and fix any conflict.
2. Back-end: run `pytest` in `backend/`. It must show no failures.
3. Front-end: run `npx tsc --noEmit` in `frontend/`. **No output means success.** The production build fails if there are type errors.
4. Start the app and click through what you changed.

## Commit messages

`type(scope): short summary`, where type is `feat`, `fix`, `docs`, `style`, `refactor`, `test` or `chore`.

## Rules

- Only edit files you own. Ask the owner (or add an optional field and tell them) if you need a change in someone else's file.
- Never commit `.env` files, secrets or API keys.
- Keep pull requests small and merge at least once a day.
- Do not regenerate `Pipfile.lock` or `package-lock.json`; run `pipenv install --dev` and `npm install` instead.

## Database and migrations

Every developer has their own local database. The migration files in `backend/migrations/versions/` keep them identical.

- After every `git pull` or merge of `main`, run `flask db upgrade` in `backend/`.
- Before creating a migration, merge the latest `main` into your branch.
- One migration per pull request, with a clear message: `flask db migrate -m "add due date to pledges"`.
- Commit the model change and its migration file together.
- Never edit a migration that is already on `main`. Add a new one.
- If Alembic reports "multiple heads", tell Harmon. Do not try to fix it alone.
- If your local database gets messy, reset it (it is only development data):
  drop and recreate the database, then run `flask db upgrade` and `python seed.py`.

## Naming rules that keep the front-end and back-end in step

- API JSON keys are camelCase (`createdAt`). Database columns and Python names are snake_case (`created_at`).
- Status values are lowercase words in both the back-end and the TypeScript types (`"pending"`, `"fulfilled"`), and the same spelling everywhere.
- A TypeScript type in `frontend/src/types/` must match the schema's output field for field.
- Dates are ISO strings (`2026-11-22` or `2026-11-22T08:48:00`).
