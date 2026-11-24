import os
from datetime import timedelta
from typing import Optional

from dotenv import load_dotenv

load_dotenv()

DEV_SECRET = "dev-only-secret-key-change-me-before-deploy"
DEV_JWT_SECRET = "dev-only-jwt-secret-key-change-me-before-deploy"


def _database_url() -> str:
    url = os.getenv(
        "DATABASE_URL",
        "postgresql://pamoja_user:your_password@localhost:5432/pamoja_db",
    )

    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)

    if url.startswith("postgresql://"):
        url = url.replace(
            "postgresql://",
            "postgresql+psycopg2://",
            1,
        )

    return url


class Config:
    PRODUCTION = False
    SECRET_KEY = os.getenv("SECRET_KEY", DEV_SECRET)
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", DEV_JWT_SECRET)
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=int(os.getenv("JWT_EXPIRES_HOURS", "8")))
    SQLALCHEMY_DATABASE_URI = _database_url()
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    CORS_ORIGINS = [o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")]


class DevelopmentConfig(Config):
    DEBUG = True


class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=5)


class ProductionConfig(Config):
    """Used on Render (APP_ENV=production)."""

    PRODUCTION = True
    DEBUG = False
    # Neon puts idle databases to sleep: check a connection is alive before using it, and refresh them regularly.
    SQLALCHEMY_ENGINE_OPTIONS = {"pool_pre_ping": True, "pool_recycle": 300}


configs = {"development": DevelopmentConfig, "testing": TestingConfig, "production": ProductionConfig}


def get_config(name: Optional[str] = None):
    name = name or os.getenv("APP_ENV", "development")
    return configs.get(name, DevelopmentConfig)
