import pytest

from app import create_app
from app.extensions import db
from app.models.user import User


@pytest.fixture()
def app():
    app = create_app("testing")
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture()
def client(app):
    return app.test_client()


@pytest.fixture()
def register(client):
    """Registers a user through the API.  register(email="x@example.org", role="agency")"""

    def _register(**overrides):
        payload = {"name": "Test User", "email": "test@example.org", "password": "Password123", "role": "donor"}
        payload.update(overrides)
        return client.post("/api/auth/register", json=payload)

    return _register


@pytest.fixture()
def make_user(app):
    """Creates a user directly in the database (used for admins, who cannot self-register)."""

    def _make(role="admin", email="admin@example.org", status="active", name="Admin User"):
        user = User(name=name, email=email, role=role, status=status)
        user.set_password("Password123")
        db.session.add(user)
        db.session.commit()
        return user

    return _make


@pytest.fixture()
def login(client):
    def _login(email, password="Password123"):
        return client.post("/api/auth/login", json={"email": email, "password": password})

    return _login


def bearer(token):
    return {"Authorization": f"Bearer {token}"}
