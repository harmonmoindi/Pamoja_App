import os
from datetime import timedelta
from typing import Optional

from dotenv import load_dotenv

load_dotenv()


def _database_url() -> str:
    url = os.getenv("DATABASE_URL", "postgresql://pamoja_user:your_password@localhost:5432/pamoja_db")
    if url.startswith("postgres://"):  # some hosts still use the old prefix
        url = url.replace("postgres://", "postgresql://", 1)
    return url


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-only-secret-key-change-me-before-deploy")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-only-jwt-secret-key-change-me-before-deploy")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=int(os.getenv("JWT_EXPIRES_HOURS", "8")))
    SQLALCHEMY_DATABASE_URI = _database_url()
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    CORS_ORIGINS = [o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")]


class DevelopmentConfig(Config):
    DEBUG = True


class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite://"  # in-memory database, tests never touch your real one
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=5)


configs = {"development": DevelopmentConfig, "testing": TestingConfig}


def get_config(name: Optional[str] = None):
    name = name or os.getenv("APP_ENV", "development")
    return configs.get(name, DevelopmentConfig)
