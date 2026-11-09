"""
ADAPTFIT Flask Backend – Configuration
Supports local development, SQLite, and cloud deployment (Render, PostgreSQL).
"""
import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "adaptfit-secret-resilience-key-2024")

    # Database URL configuration (Render uses postgres:// which SQLAlchemy requires as postgresql://)
    raw_db_url = os.getenv("DATABASE_URL", "sqlite:///adaptfit.db")
    if raw_db_url.startswith("postgres://"):
        raw_db_url = raw_db_url.replace("postgres://", "postgresql://", 1)
    SQLALCHEMY_DATABASE_URI = raw_db_url
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # CORS configuration: default to '*' for local development and multi-host deployment
    raw_cors = os.getenv("CORS_ORIGINS", "")
    if raw_cors and raw_cors.strip() != "*":
        CORS_ORIGINS = [orig.strip() for orig in raw_cors.split(",") if orig.strip()]
    else:
        CORS_ORIGINS = "*"

    # External API base URLs (no credentials required)
    NASA_POWER_BASE = os.getenv("NASA_POWER_BASE", "https://power.larc.nasa.gov/api")
    OPEN_METEO_HIST_BASE = os.getenv(
        "OPEN_METEO_HISTORICAL_BASE",
        "https://archive-api.open-meteo.com/v1/archive"
    )
    OPEN_METEO_FORECAST_BASE = os.getenv(
        "OPEN_METEO_FORECAST_BASE",
        "https://api.open-meteo.com/v1/forecast"
    )

    # Cache TTL (hours)
    HISTORICAL_CACHE_TTL_HOURS = int(os.getenv("HISTORICAL_CACHE_TTL_HOURS", "168"))
    FORECAST_CACHE_TTL_HOURS = int(os.getenv("FORECAST_CACHE_TTL_HOURS", "6"))

    REQUEST_TIMEOUT = 25  # seconds
