"""
ADAPTFIT Flask Application Entry Point
"""
import os
import logging
from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from database import init_db


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Configure CORS for all API routes
    if Config.CORS_ORIGINS == "*":
        CORS(app, resources={r"/*": {"origins": "*"}})
    else:
        CORS(app, resources={r"/*": {"origins": Config.CORS_ORIGINS}})

    # Set up logging
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    )

    # Initialize database (creates tables if they don't exist)
    init_db(app)

    # Register route blueprints
    from routes.climate import climate_bp
    from routes.locations import locations_bp
    from routes.assessments import assessments_bp
    from routes.satellite import satellite_bp
    from routes.compatibility import compatibility_bp

    app.register_blueprint(climate_bp)
    app.register_blueprint(locations_bp)
    app.register_blueprint(assessments_bp)
    app.register_blueprint(satellite_bp)
    app.register_blueprint(compatibility_bp)

    # Root welcome & health ping
    @app.route("/")
    def root():
        return jsonify({
            "project": "ADAPTFIT",
            "tagline": "Right Adaptation. Right Place.",
            "status": "online",
            "version": "3.0.0",
            "health_endpoint": "/api/health",
        })

    # Detailed health check
    @app.route("/api/health")
    def health():
        return jsonify({
            "status": "ok",
            "version": "3.0.0",
            "project": "ADAPTFIT",
            "data_sources": [
                "NASA POWER (free, no key required)",
                "Open-Meteo (free, no key required)",
            ],
        })

    # Global error handlers
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Endpoint not found."}), 404

    @app.errorhandler(405)
    def method_not_allowed(e):
        return jsonify({"error": "Method not allowed."}), 405

    @app.errorhandler(500)
    def internal_error(e):
        return jsonify({"error": "Internal server error. Check backend logs."}), 500

    return app


# Export application instance for WSGI / Gunicorn
app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    app.run(host="0.0.0.0", port=port, debug=False)
