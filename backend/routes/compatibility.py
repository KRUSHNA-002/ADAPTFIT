"""
ADAPTFIT – Compatibility ranking route.
"""
from flask import Blueprint, jsonify, request
from database import db
from services.nasa_service import fetch_nasa_power_annual
from services.adaptation_engine import compute_compatibility, rank_all_adaptations

compatibility_bp = Blueprint("compatibility", __name__)


@compatibility_bp.route("/api/compatibility/score", methods=["POST"])
def score():
    """
    POST /api/compatibility/score
    Body: {lat_a, lng_a, name_a, lat_b, lng_b, name_b, adaptation_id (optional)}

    Returns compatibility scores. If adaptation_id is provided, returns
    a detailed single assessment. Otherwise ranks all 10 adaptations.
    """
    data = request.get_json(silent=True) or {}
    try:
        lat_a = float(data["lat_a"]); lng_a = float(data["lng_a"])
        lat_b = float(data["lat_b"]); lng_b = float(data["lng_b"])
    except (KeyError, TypeError, ValueError):
        return jsonify({"error": "Provide numeric lat_a, lng_a, lat_b, lng_b."}), 400

    adaptation_id = data.get("adaptation_id")
    start_year = int(data.get("start_year", 2010))
    end_year = int(data.get("end_year", 2023))

    climate_a = fetch_nasa_power_annual(lat_a, lng_a, start_year, end_year, db=db)
    climate_b = fetch_nasa_power_annual(lat_b, lng_b, start_year, end_year, db=db)

    if adaptation_id:
        result = compute_compatibility(
            adaptation_id,
            climate_a if "error" not in climate_a else {},
            lat_a, lng_a,
            climate_b if "error" not in climate_b else {},
            lat_b, lng_b,
        )
        return jsonify(result)
    else:
        ranked = rank_all_adaptations(
            climate_a if "error" not in climate_a else {},
            lat_a, lng_a,
            climate_b if "error" not in climate_b else {},
            lat_b, lng_b,
        )
        return jsonify({"ranked": ranked})

