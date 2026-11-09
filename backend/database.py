"""
ADAPTFIT – SQLAlchemy database instance and initializer.
"""
import os
import logging
from flask_sqlalchemy import SQLAlchemy

logger = logging.getLogger(__name__)
db = SQLAlchemy()


def init_db(app):
    """Bind SQLAlchemy to the app and create all tables."""
    # Ensure parent directory exists for SQLite database files (e.g. Render Persistent Disk mounts)
    db_uri = app.config.get("SQLALCHEMY_DATABASE_URI", "")
    if db_uri.startswith("sqlite:///"):
        db_path = db_uri.replace("sqlite:///", "")
        db_dir = os.path.dirname(db_path)
        if db_dir and not os.path.exists(db_dir):
            try:
                os.makedirs(db_dir, exist_ok=True)
                logger.info("Created missing database directory: %s", db_dir)
            except Exception as e:
                logger.warning("Could not pre-create database directory %s: %s", db_dir, e)

    db.init_app(app)
    with app.app_context():
        from models import (  # noqa: F401 – import triggers table registration
            SavedLocation,
            LocationComparison,
            ClimateCache,
            AdaptationAssignment,
            Assessment,
        )
        db.create_all()
        logger.info("Database schema initialized successfully.")

