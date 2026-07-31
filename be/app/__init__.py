"""Flask application factory"""

from flask import Flask, jsonify

from app.config.env import get_config
from app.config.ext import cors, limiter
from app.config.utilities import (
    register_error_handlers,
    register_request_logger,
)


def create_app(config_class=None):
    app = Flask(__name__)

    if config_class is None:
        config_class = get_config()
    app.config.from_object(config_class)

    _init_extensions(app)
    _register_blueprints(app)

    register_error_handlers(app)
    register_request_logger(app)

    @app.route("/")
    def index():
        return jsonify({"success": True, "message": "BayesDR API is running!"}), 200

    @app.route("/health")
    def health():
        """Detailed health check with model status."""
        try:
            from app.services.model_loader import load_model

            model = load_model()

            return jsonify(
                {
                    "status": "healthy",
                    "model_loaded": model is not None,
                    "model_type": "PyTorch BayesianDRNet (DenseNet-121)",
                }
            )
        except Exception as e:
            return jsonify({"status": "unhealthy", "error": str(e)}), 500

    @app.route("/api")
    def api():
        return jsonify({"success": True, "message": "API is ready"}), 200

    return app


def _init_extensions(app):
    limiter.init_app(app)
    cors.init_app(
        app,
        resources={
            r"/api/*": {
                "origins": app.config.get("CORS_ORIGINS", ["*"]),
                "methods": ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
                "allow_headers": [
                    "Content-Type",
                    "Authorization",
                    "ngrok-skip-browser-warning",
                ],
                "supports_credentials": True,
            }
        },
    )


def _register_blueprints(app):
    from app.routes import register_routes

    register_routes(app)
