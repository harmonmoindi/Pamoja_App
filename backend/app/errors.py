"""One error format for the whole API:

    { "error": { "code": "validation_error", "message": "...", "details": {} } }
"""
from flask import jsonify
from marshmallow import ValidationError
from werkzeug.exceptions import HTTPException

from app.extensions import db, jwt


class ApiError(Exception):
    """Raise this anywhere in a route or service to return a clean JSON error."""

    def __init__(self, status: int, code: str, message: str, details=None):
        super().__init__(message)
        self.status = status
        self.code = code
        self.message = message
        self.details = details or {}


def error_response(status: int, code: str, message: str, details=None):
    return jsonify({"error": {"code": code, "message": message, "details": details or {}}}), status


def register_error_handlers(app):
    @app.errorhandler(ApiError)
    def handle_api_error(err):
        return error_response(err.status, err.code, err.message, err.details)

    @app.errorhandler(ValidationError)
    def handle_validation_error(err):
        return error_response(400, "validation_error", "Validation failed", err.messages)

    @app.errorhandler(HTTPException)
    def handle_http_error(err):
        code = (err.name or "error").lower().replace(" ", "_")
        return error_response(err.code or 500, code, err.description or err.name)

    @app.errorhandler(Exception)
    def handle_unexpected_error(err):
        db.session.rollback()
        app.logger.exception(err)
        return error_response(500, "internal_error", "Something went wrong on the server")

    # Login problems raised by flask-jwt-extended
    @jwt.unauthorized_loader
    def missing_token(reason):
        return error_response(401, "unauthorized", "Please log in to continue")

    @jwt.invalid_token_loader
    def invalid_token(reason):
        return error_response(401, "invalid_token", "Your session is invalid. Please log in again")

    @jwt.expired_token_loader
    def expired_token(jwt_header, jwt_payload):
        return error_response(401, "token_expired", "Your session has expired. Please log in again")
