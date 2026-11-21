from flask_jwt_extended import create_access_token
from sqlalchemy import select

from app.errors import ApiError
from app.extensions import db
from app.models.mixins import utcnow
from app.models.organization import Organization
from app.models.user import User
from app.services import audit_service


def register_user(data: dict) -> User:
    email = data["email"].strip().lower()
    if db.session.scalar(select(User).where(User.email == email)):
        raise ApiError(409, "email_taken", "An account with this email already exists")

    role = data.get("role") or "donor"
    # Agencies must be verified by an admin before they are fully active.
    status = "pending" if role == "agency" else "active"

    user = User(name=data["name"].strip(), email=email, role=role, status=status, county=data.get("county"))
    user.set_password(data["password"])
    db.session.add(user)
    db.session.flush()  # gives the user an id without committing yet

    if role == "agency":
        org = Organization(name=data.get("organization_name") or user.name, owner_id=user.id)
        db.session.add(org)
        audit_service.log_event(
            "agency",
            "Agency application submitted",
            f"{org.name} applied for verification",
            actor=user,
            commit=False,
        )

    db.session.commit()
    return user


def authenticate(email: str, password: str) -> User:
    user = db.session.scalar(select(User).where(User.email == email.strip().lower()))
    if user is None or not user.check_password(password):
        raise ApiError(401, "invalid_credentials", "Incorrect email or password")
    if user.status == "suspended":
        raise ApiError(403, "account_suspended", "This account has been suspended")
    user.last_active_at = utcnow()
    db.session.commit()
    return user


def issue_token(user: User) -> str:
    return create_access_token(identity=str(user.id), additional_claims={"role": user.role})
