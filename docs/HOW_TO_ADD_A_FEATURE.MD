# How to add a feature, start to finish

This is the recipe every owner follows. The example is a **pledge** (Donor dev), but the same seven steps apply to
requests, deliveries, assessments, appointments and everything else. Look at the admin files
(`routes/admin.py`, `schemas/admin_schema.py`, `tests/test_admin_agencies.py`, `services/adminService.ts`,
`pages/admin/Users.tsx`) as real, working examples.

## 1. The model: `backend/app/models/pledge.py`

```python
from app.extensions import db
from app.models.mixins import TimestampMixin

PLEDGE_STATUSES = ("pending", "fulfilled", "cancelled")


class Pledge(TimestampMixin, db.Model):
    __tablename__ = "pledges"

    id = db.Column(db.Integer, primary_key=True)
    reference = db.Column(db.String(30), unique=True)        # PAM-PLG-1001, set after the first flush
    donor_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    opportunity_id = db.Column(db.Integer, db.ForeignKey("opportunities.id"), nullable=False, index=True)
    quantity = db.Column(db.Integer, nullable=False)
    description = db.Column(db.String(255))
    status = db.Column(db.String(20), nullable=False, default="pending")

    donor = db.relationship("User")
    opportunity = db.relationship("Opportunity")
```

- Always use `TimestampMixin` (gives `created_at` and `updated_at`).
- Foreign keys use the **table name**: `"users.id"`, `"opportunities.id"`.
- Never edit `user.py` or `organization.py`. If you need a new link to a user, add a foreign key in your own model.
- Do not create a migration for the first version of your models (Harmon creates one after everyone merges).

## 2. The schemas: `backend/app/schemas/pledge_schema.py`

```python
from marshmallow import fields, validate

from app.schemas import CamelSchema


class PledgeSchema(CamelSchema):
    """What the API returns. Python names are snake_case; the JSON comes out camelCase."""
    id = fields.Int()
    reference = fields.Str()
    quantity = fields.Int()
    description = fields.Str(allow_none=True)
    status = fields.Str()
    opportunity_id = fields.Int()
    created_at = fields.DateTime()


class PledgeCreateSchema(CamelSchema):
    """What the client may send."""
    opportunity_id = fields.Int(required=True)
    quantity = fields.Int(required=True, validate=validate.Range(min=1))
    description = fields.Str(load_default=None, allow_none=True)
```

## 3. The routes: `backend/app/routes/pledges.py`

```python
from flask import Blueprint, jsonify
from sqlalchemy import select

from app.errors import ApiError
from app.extensions import db
from app.models.opportunity import Opportunity
from app.models.pledge import Pledge
from app.schemas.pledge_schema import PledgeCreateSchema, PledgeSchema
from app.services import audit_service
from app.utils.decorators import get_current_user, role_required
from app.utils.pagination import paginate
from app.utils.reference_ids import make_reference
from app.utils.validators import parse_body

bp = Blueprint("pledges", __name__, url_prefix="/api/pledges")   # a variable named bp is registered automatically


@bp.post("")
@role_required("donor")
def create_pledge():
    donor = get_current_user()
    data = parse_body(PledgeCreateSchema())                       # validates, raises a 400 on bad input

    opportunity = db.session.get(Opportunity, data["opportunity_id"])
    if opportunity is None:
        raise ApiError(404, "not_found", "Opportunity not found")  # always raise ApiError for errors

    pledge = Pledge(donor_id=donor.id, opportunity_id=opportunity.id,
                    quantity=data["quantity"], description=data["description"])
    db.session.add(pledge)
    db.session.flush()                                            # gives the pledge an id without committing
    pledge.reference = make_reference("PLG", pledge.id)
    audit_service.log_event("pledge", "New donor pledge", f"{pledge.quantity} x {opportunity.title}",
                            actor=donor, entity_type="pledge", entity_id=pledge.id, commit=False)
    db.session.commit()
    return jsonify({"pledge": PledgeSchema().dump(pledge)}), 201


@bp.get("/mine")
@role_required("donor")
def my_pledges():
    stmt = select(Pledge).where(Pledge.donor_id == get_current_user().id).order_by(Pledge.created_at.desc())
    return jsonify(paginate(stmt, PledgeSchema()))                # { items, page, perPage, total }
```

Rules of thumb:
- Protect every route: `@role_required("donor")` (or `@login_required`). Check **ownership** too: a donor must only see their own pledges.
- Validate first, change data after. Raise `ApiError(status, "code", "message")` for any problem.
- Several changes that belong together (a pledge, its audit entry, a notification) go in **one** `db.session.commit()`. Pass `commit=False` to the helpers.
- Notify people with `notification_service.notify(user_id, title, body, kind="pledge", commit=False)`.
- Lists always use `paginate(...)`. Single items return `{"pledge": {...}}`.

## 4. The tests: `backend/tests/test_pledges.py`

```python
from tests.conftest import bearer


def test_donor_can_create_a_pledge(client, make_user, login, make_opportunity):    # make_opportunity: your own fixture
    make_user(role="donor", email="donor@example.org")
    token = login("donor@example.org").get_json()["token"]
    opportunity = make_opportunity()

    res = client.post("/api/pledges", json={"opportunityId": opportunity.id, "quantity": 5}, headers=bearer(token))
    assert res.status_code == 201
    assert res.get_json()["pledge"]["status"] == "pending"


def test_beneficiary_cannot_create_a_pledge(client, make_user, login):
    make_user(role="beneficiary", email="b@example.org")
    token = login("b@example.org").get_json()["token"]
    res = client.post("/api/pledges", json={"opportunityId": 1, "quantity": 5}, headers=bearer(token))
    assert res.status_code == 403
```

Write at least one success test and one failure test (wrong role, bad input, not found). Fixtures `client`, `make_user`,
`login`, `register` and `bearer` are in `tests/conftest.py`. Put your own fixtures in your own test file.

## 5. Sample data: `backend/app/seeds/seed_20_donor.py`

```python
from app.extensions import db


def run():
    # Safe to run twice: check before you insert.
    ...
```

`python seed.py` runs every `seed_*.py` in order. Use the same data the front-end mock files had, so screens look the same.

## 6. The front-end: type, service and page

`frontend/src/types/pledge.ts` must match the schema output exactly (camelCase, same status spelling):

```ts
export type PledgeStatus = "pending" | "fulfilled" | "cancelled";

export interface Pledge {
  id: number;
  reference: string;
  quantity: number;
  description: string | null;
  status: PledgeStatus;
  opportunityId: number;
  createdAt: string;
}
```

`frontend/src/services/pledgeService.ts`:

```ts
import { api, Page } from "@/lib/apiClient";
import { Pledge } from "@/types/pledge";

export const createPledge = (body: { opportunityId: number; quantity: number; description?: string }) =>
  api<{ pledge: Pledge }>("/pledges", { method: "POST", body });

export const myPledges = () => api<Page<Pledge>>("/pledges/mine");
```

In your page, replace the mock import with `useAsync` (see `pages/admin/Users.tsx`):

```tsx
const { data, loading, error, reload } = useAsync(() => myPledges(), []);
const pledges = data?.items ?? [];
// show <Loading /> while loading and !data, <ErrorNotice message={error} onRetry={reload} /> on error
```

Show server errors to the user with `errorMessage(err)` from `@/lib/errors`.

## 7. Definition of done

- [ ] Model, schema, routes, tests, seed file
- [ ] `pytest` passes and `npx tsc --noEmit` prints nothing
- [ ] The React page reads from the API through a `services/` file (not from mock data)
- [ ] Checked in the browser, signed in as the right demo account
- [ ] Pull request opened, reviewed by your partner, merged

## Common mistakes

- Pasting code into the wrong file: after pasting, run `grep -n "^class \|^def " <file>` to check what the file contains.
- Running Flask commands (`flask run`, `flask db ...`) from the repo root. They must run inside `backend/`.
- Status values that differ between back-end and front-end (`"Pending"` vs `"pending"`): `tsc` will catch it, so run it.
- Committing a model change without its migration, or two people creating migrations at the same time.
- Forgetting the role check on a route, or letting a user read another user's data.