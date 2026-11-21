from flask import request
from marshmallow import ValidationError

from app.errors import ApiError


def validate_password(value: str) -> None:
    if len(value) < 8:
        raise ValidationError("Password must be at least 8 characters long")


def parse_body(schema):
    """Reads the JSON body and validates it with a schema.

    Returns the cleaned data (python names, snake_case). Invalid input raises a
    validation error, which the app turns into a 400 response automatically.
    """
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        raise ApiError(400, "invalid_json", "Request body must be a JSON object")
    return schema.load(data)
