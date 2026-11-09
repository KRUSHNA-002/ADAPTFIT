"""
ADAPTFIT – Climate data API routes.
All data comes from NASA POWER (no key required, free, open license).
"""
import logging
from flask import Blueprint, jsonify, request, current_app
from database import db
from services.nasa_service import fetch_nasa_power_annual, fetch_nasa_power_climatology

logger = logging.getLogger(__name__)
climate_bp = Blueprint("climate", __name__)


def _validate_latlon(lat_str, lng_str):
    """Return (lat, lng, error_msg). error_msg is None on success."""
    try:
        lat = float(lat_str)
        lng = float(lng_str)
    except (TypeError, ValueError):
        return None, None, "lat and lng must be numeric."
    if not (-90 <= lat <= 90):
        return None, None, f"lat must be between -90 and 90, got {lat}."
    if not (-180 <= lng <= 180):
        return None, None, f"lng must be between -180 and 180, got {lng}."
    return lat, lng, None


@climate_bp.route("/api/climate/historical")
def historical():
    """
    GET /api/climate/historical?lat=18.9&lng=72.8&start_year=2000&end_year=2023

    Returns annual climate summaries from NASA POWER.
    Data: T2M, T2M_MAX, T2M_MIN, PRECTOTCORR, RH2M, WS10M aggregated yearly.
    """
    lat_s = request.args.get("lat")
    lng_s = request.args.get("lng")
    lat, lng, err = _validate_latlon(lat_s, lng_s)
    if err:
        return jsonify({"error": err}), 400

    try:
        start_year = int(request.args.get("start_year", 2005))
        end_year = int(request.args.get("end_year", 2023))
    except ValueError:
        return jsonify({"error": "start_year and end_year must be integers."}), 400

    if start_year < 1981:
        return jsonify({"error": "NASA POWER data starts from 1981."}), 400
    if end_year > 2023:
        end_year = 2023
    if start_year > end_year:
        return jsonify({"error": "start_year must be <= end_year."}), 400
    if end_year - start_year > 42:
        return jsonify({"error": "Maximum range is 42 years."}), 400

    result = fetch_nasa_power_annual(
        lat, lng, start_year, end_year,
        db=db,
        ttl_hours=current_app.config.get("HISTORICAL_CACHE_TTL_HOURS", 168),
    )
    if "error" in result:
        return jsonify(result), 503
    return jsonify(result)


@climate_bp.route("/api/climate/climatology")
def climatology():
    """
    GET /api/climate/climatology?lat=18.9&lng=72.8

    Returns 20-year (2001–2020) monthly climatological averages from NASA POWER.
    """
    lat_s = request.args.get("lat")
    lng_s = request.args.get("lng")
    lat, lng, err = _validate_latlon(lat_s, lng_s)
    if err:
        return jsonify({"error": err}), 400

    result = fetch_nasa_power_climatology(lat, lng, db=db)
    if "error" in result:
        return jsonify(result), 503
    return jsonify(result)


@climate_bp.route("/api/climate/compare")
def compare():
    """
    GET /api/climate/compare?lat_a=X&lng_a=Y&lat_b=A&lng_b=B&start_year=2010&end_year=2023

    Fetches historical climate data for both locations and returns a side-by-side comparison.
    """
    lat_a, lng_a, err = _validate_latlon(request.args.get("lat_a"), request.args.get("lng_a"))
    if err:
        return jsonify({"error": f"Location A: {err}"}), 400
    lat_b, lng_b, err = _validate_latlon(request.args.get("lat_b"), request.args.get("lng_b"))
    if err:
        return jsonify({"error": f"Location B: {err}"}), 400

    try:
        start_year = int(request.args.get("start_year", 2010))
        end_year = int(request.args.get("end_year", 2023))
    except ValueError:
        return jsonify({"error": "start_year and end_year must be integers."}), 400

    result_a = fetch_nasa_power_annual(lat_a, lng_a, start_year, end_year, db=db)
    result_b = fetch_nasa_power_annual(lat_b, lng_b, start_year, end_year, db=db)

    errors = {}
    if "error" in result_a:
        errors["location_a"] = result_a["error"]
    if "error" in result_b:
        errors["location_b"] = result_b["error"]
    if errors:
        return jsonify({"error": "One or both climate data requests failed.", "details": errors}), 503

    return jsonify({
        "location_a": result_a,
        "location_b": result_b,
        "comparison": _build_comparison_summary(result_a, result_b),
    })


def _build_comparison_summary(data_a: dict, data_b: dict) -> dict:
    """Compute basic climate deltas between two yearly datasets."""
    def mean_val(data, key):
        vals = [v.get(key) for v in data.get("yearly", {}).values() if v.get(key) is not None]
        return round(sum(vals) / len(vals), 2) if vals else None

    temp_a = mean_val(data_a, "avg_temp_c")
    temp_b = mean_val(data_b, "avg_temp_c")
    rain_a = mean_val(data_a, "annual_precip_mm")
    rain_b = mean_val(data_b, "annual_precip_mm")

    return {
        "avg_temp_delta_c": round(temp_b - temp_a, 2) if temp_a and temp_b else None,
        "avg_rain_delta_mm": round(rain_b - rain_a, 1) if rain_a and rain_b else None,
        "avg_temp_a": temp_a,
        "avg_temp_b": temp_b,
        "avg_rain_a_mm": rain_a,
        "avg_rain_b_mm": rain_b,
    }

