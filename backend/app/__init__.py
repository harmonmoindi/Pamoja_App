from typing import Optional

from flask import Flask, jsonify

from app.config import get_config
from app.errors import register_error_handlers
from app.extensions import cors, db, jwt, ma, migrate


def create_app(config_name: Optional[str] = None) -> Flask:
    app = Flask(__name__)
    app.config.from_object(get_config(config_name))

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    ma.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}})

    # Importing the models package loads every model file, so migrations see all tables.
    from app import models  # noqa: F401
    from app.routes import register_blueprints

    register_error_handlers(app)
    register_blueprints(app)

    @app.get("/api/health")
    def health():
        return jsonify({"status": "ok"})

    return app
