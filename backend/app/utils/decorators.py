from functools import wraps

from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request

from app.errors import ApiError
from app.extensions import db
from app.models.user import User


def get_current_user() -> User:
    """The logged-in user. Call this inside a route protected by @login_required or @role_required."""
    user = db.session.get(User, int(get_jwt_identity()))
    if user is None:
        raise ApiError(401, "unauthorized", "Account not found. Please log in again")
    if user.status == "suspended":
        raise ApiError(403, "account_suspended", "This account has been suspended")
    return user


def login_required(fn):
    """Any logged-in user."""

    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        get_current_user()
        return fn(*args, **kwargs)

    return wrapper


def role_required(*roles):
    """Only users with one of these roles.   @role_required("admin")   @role_required("agency", "admin")"""

    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            user = get_current_user()
            if roles and user.role not in roles:
                raise ApiError(403, "forbidden", "You do not have permission to do this")
            return fn(*args, **kwargs)

        return wrapper

    return decorator
