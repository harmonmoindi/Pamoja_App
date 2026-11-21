from tests.conftest import bearer


def test_register_donor_returns_user_and_token(register):
    res = register()
    assert res.status_code == 201
    body = res.get_json()
    assert body["user"]["email"] == "test@example.org"
    assert body["user"]["role"] == "donor"
    assert body["user"]["status"] == "active"
    assert "joinedOn" in body["user"]  # camelCase keys
    assert "password" not in body["user"]
    assert body["token"]


def test_register_duplicate_email_conflict(register):
    register()
    res = register()
    assert res.status_code == 409
    assert res.get_json()["error"]["code"] == "email_taken"


def test_register_validation_errors(register):
    res = register(password="short", email="not-an-email")
    assert res.status_code == 400
    error = res.get_json()["error"]
    assert error["code"] == "validation_error"
    assert "password" in error["details"]
    assert "email" in error["details"]


def test_admin_role_cannot_self_register(register):
    res = register(role="admin")
    assert res.status_code == 400


def test_agency_registration_is_pending_and_creates_organization(register):
    res = register(role="agency", email="agency@example.org", organizationName="Helping Hands")
    assert res.status_code == 201
    assert res.get_json()["user"]["status"] == "pending"

    from app.extensions import db
    from app.models.organization import Organization

    org = db.session.query(Organization).one()
    assert org.name == "Helping Hands"
    assert org.verification_status == "pending"


def test_login_success_and_wrong_password(register, login):
    register()
    ok = login("test@example.org")
    assert ok.status_code == 200
    assert ok.get_json()["token"]

    bad = login("test@example.org", "WrongPassword1")
    assert bad.status_code == 401
    assert bad.get_json()["error"]["code"] == "invalid_credentials"


def test_me_requires_token(client, register, login):
    assert client.get("/api/auth/me").status_code == 401

    register()
    token = login("test@example.org").get_json()["token"]
    res = client.get("/api/auth/me", headers=bearer(token))
    assert res.status_code == 200
    assert res.get_json()["user"]["email"] == "test@example.org"


def test_suspended_user_cannot_log_in(make_user, login):
    make_user(role="donor", email="blocked@example.org", status="suspended")
    res = login("blocked@example.org")
    assert res.status_code == 403
    assert res.get_json()["error"]["code"] == "account_suspended"
