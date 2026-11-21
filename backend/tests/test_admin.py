from tests.conftest import bearer


def _token(login, email):
    return login(email).get_json()["token"]


def test_donor_cannot_list_users(client, make_user, login):
    make_user(role="donor", email="donor@example.org")
    res = client.get("/api/users", headers=bearer(_token(login, "donor@example.org")))
    assert res.status_code == 403
    assert res.get_json()["error"]["code"] == "forbidden"


def test_admin_lists_users_with_pagination_and_filters(client, make_user, login):
    make_user(role="admin", email="admin@example.org")
    make_user(role="donor", email="amina@example.org", name="Amina")
    make_user(role="beneficiary", email="grace@example.org", name="Grace")
    headers = bearer(_token(login, "admin@example.org"))

    res = client.get("/api/users", headers=headers)
    body = res.get_json()
    assert res.status_code == 200
    assert body["total"] == 3
    assert set(body) == {"items", "page", "perPage", "total"}

    donors = client.get("/api/users?role=donor", headers=headers).get_json()
    assert donors["total"] == 1
    assert donors["items"][0]["email"] == "amina@example.org"

    search = client.get("/api/users?q=grace", headers=headers).get_json()
    assert search["total"] == 1


def test_admin_suspends_and_reactivates_user(client, make_user, login):
    make_user(role="admin", email="admin@example.org")
    donor = make_user(role="donor", email="donor@example.org")
    headers = bearer(_token(login, "admin@example.org"))

    res = client.patch(f"/api/users/{donor.id}/status", json={"status": "suspended"}, headers=headers)
    assert res.status_code == 200
    assert res.get_json()["user"]["status"] == "suspended"

    res = client.patch(f"/api/users/{donor.id}/status", json={"status": "active"}, headers=headers)
    assert res.get_json()["user"]["status"] == "active"


def test_admin_accounts_cannot_be_changed(client, make_user, login):
    admin = make_user(role="admin", email="admin@example.org")
    headers = bearer(_token(login, "admin@example.org"))
    res = client.patch(f"/api/users/{admin.id}/status", json={"status": "suspended"}, headers=headers)
    assert res.status_code == 403


def test_status_change_is_written_to_audit_log(client, make_user, login, app):
    from app.extensions import db
    from app.models.audit_log import AuditLog

    make_user(role="admin", email="admin@example.org")
    donor = make_user(role="donor", email="donor@example.org")
    headers = bearer(_token(login, "admin@example.org"))
    client.patch(f"/api/users/{donor.id}/status", json={"status": "suspended"}, headers=headers)

    entry = db.session.query(AuditLog).one()
    assert entry.kind == "user"
    assert entry.title == "Account suspended"
