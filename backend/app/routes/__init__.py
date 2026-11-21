"""Registers every blueprint automatically.

Nobody needs to edit this file. In your route file create a blueprint named `bp`:

    bp = Blueprint("pledges", __name__, url_prefix="/api/pledges")

and it is registered when the app starts. Files without a `bp` are skipped.
"""
import importlib
import pkgutil


def register_blueprints(app):
    for info in pkgutil.iter_modules(__path__):
        module = importlib.import_module(f"{__name__}.{info.name}")
        blueprint = getattr(module, "bp", None)
        if blueprint is not None:
            app.register_blueprint(blueprint)
