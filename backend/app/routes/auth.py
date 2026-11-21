from flask import Blueprint, jsonify

from app.schemas.user_schema import LoginSchema, RegisterSchema, UserSchema
from app.services import auth_service
from app.utils.decorators import get_current_user, login_required
from app.utils.validators import parse_body

bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@bp.post("/register")
def register():
    data = parse_body(RegisterSchema())
    user = auth_service.register_user(data)
    return jsonify({"user": UserSchema().dump(user), "token": auth_service.issue_token(user)}), 201


@bp.post("/login")
def login():
    data = parse_body(LoginSchema())
    user = auth_service.authenticate(data["email"], data["password"])
    return jsonify({"user": UserSchema().dump(user), "token": auth_service.issue_token(user)})


@bp.get("/me")
@login_required
def me():
    return jsonify({"user": UserSchema().dump(get_current_user())})