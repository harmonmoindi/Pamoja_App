# Contributing

## Branches

- `main`: stable, always runnable. Nobody pushes directly.
- `develop`: integration branch. All feature work merges here through pull requests.
- Feature branches: created from `develop`, named `type/area-short-description`.

Examples: `feature/donor-pledge-page`, `feature/backend-opportunity-model`, `fix/mpesa-callback`, `docs/api-endpoints`.

## Workflow

```bash
git checkout develop
git pull origin develop
git checkout -b feature/donor-pledge-page
# work, then:
git add <files>
git commit -m "feat(donor): add pledge form"
git push -u origin feature/donor-pledge-page
```

Open a pull request into `develop`. At least one teammate reviews it before merging.

## Commit messages

`type(scope): short summary`, where type is one of `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`.

## Rules

- Pull `develop` before starting new work and before opening a PR.
- Keep PRs small and focused on one thing.
- Never commit `.env` files, secrets or API keys.
- Work in your own area's files where possible to avoid merge conflicts.
- Run the app and tests locally before opening a PR.
