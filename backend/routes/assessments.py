"""
ADAPTFIT – Assessment routes.
Fetches real climate data from NASA POWER, runs the compatibility engine,
saves results to SQLite and returns structured JSON.
"""
import json
import logging
from flask import Blueprint, jsonify, request
from database import db
from models import Assessment
from services.nasa_service import fetch_nasa_power_annual
from services.adaptation_engine import compute_compatibility, rank_all_adaptations

logger = logging.getLogger(__name__)
assessments_bp = Blueprint("assessments", __name__)


def _validate_payload(data):
    required = ["lat_a", "lng_a", "lat_b", "lng_b"]
    for f in required:
        if f not in data:
            return None, f"Missing field: {f}"
    try:
        lat_a = float(data["lat_a"]); lng_a = float(data["lng_a"])
        lat_b = float(data["lat_b"]); lng_b = float(data["lng_b"])
    except (TypeError, ValueError):
        return None, "Coordinates must be numeric."
    for label, lat, lng in [("A", lat_a, lng_a), ("B", lat_b, lng_b)]:
        if not (-90 <= lat <= 90):
            return None, f"Location {label}: lat out of range."
        if not (-180 <= lng <= 180):
            return None, f"Location {label}: lng out of range."
    return (lat_a, lng_a, lat_b, lng_b), None


@assessments_bp.route("/api/assessments/calculate", methods=["POST"])
def calculate():
    """
    POST /api/assessments/calculate
    Body: {lat_a, lng_a, name_a, lat_b, lng_b, name_b, adaptation_id (optional)}

    Fetches real NASA POWER climate data for both locations,
    runs the compatibility engine and returns a full assessment.
    """
    data = request.get_json(silent=True) or {}
    coords, err = _validate_payload(data)
    if err:
        return jsonify({"error": err}), 400
    lat_a, lng_a, lat_b, lng_b = coords

    name_a = data.get("name_a", f"{lat_a:.4f}, {lng_a:.4f}")
    name_b = data.get("name_b", f"{lat_b:.4f}, {lng_b:.4f}")
    adaptation_id = data.get("adaptation_id")  # optional; if None, rank all

    # Fetch climate for both locations (2010–2023 default)
    start_year = int(data.get("start_year", 2010))
    end_year = int(data.get("end_year", 2023))

    climate_a = fetch_nasa_power_annual(lat_a, lng_a, start_year, end_year, db=db)
    climate_b = fetch_nasa_power_annual(lat_b, lng_b, start_year, end_year, db=db)

    climate_a_ok = "error" not in climate_a
    climate_b_ok = "error" not in climate_b

    if not climate_a_ok and not climate_b_ok:
        return jsonify({
            "error": "Could not fetch climate data for either location.",
            "details": {"location_a": climate_a.get("error"), "location_b": climate_b.get("error")},
        }), 503

    # Run engine
    if adaptation_id:
        engine_result = compute_compatibility(
            adaptation_id,
            climate_a if climate_a_ok else {},
            lat_a, lng_a,
            climate_b if climate_b_ok else {},
            lat_b, lng_b,
        )
        ranked = None
        status = engine_result.get("status", "INSUFFICIENT_DATA")
        score = engine_result.get("score")
    else:
        engine_result = rank_all_adaptations(
            climate_a if climate_a_ok else {},
            lat_a, lng_a,
            climate_b if climate_b_ok else {},
            lat_b, lng_b,
        )
        ranked = engine_result
        status = "COMPUTED"
        score = ranked[0]["score"] if ranked else None

    canonical_aid = engine_result.get("resolved_id", adaptation_id) if isinstance(engine_result, dict) else adaptation_id

    full_result = {
        "location_a": {"name": name_a, "lat": lat_a, "lng": lng_a, "climate": climate_a if climate_a_ok else {"error": climate_a.get("error")}},
        "location_b": {"name": name_b, "lat": lat_b, "lng": lng_b, "climate": climate_b if climate_b_ok else {"error": climate_b.get("error")}},
        "adaptation_id": canonical_aid,
        "input_adaptation_id": adaptation_id,
        "compatibility": engine_result,
        "ranked_adaptations": ranked,
        "status": status,
        "score": score,
        "data_quality": {
            "location_a_data": "real" if climate_a_ok else "unavailable",
            "location_b_data": "real" if climate_b_ok else "unavailable",
            "source": "NASA POWER MERRA-2 reanalysis",
            "note": "Data is model-derived at ~0.5° grid resolution. Not site-level measurement.",
        },
    }

    # Save to DB
    record = Assessment(
        name_a=name_a, lat_a=lat_a, lng_a=lng_a,
        name_b=name_b, lat_b=lat_b, lng_b=lng_b,
        adaptation_id=canonical_aid or "all",
        result_json=json.dumps(full_result),
        overall_status=status,
        compatibility_score=score,
    )
    db.session.add(record)
    db.session.commit()
    full_result["assessment_id"] = record.id

    return jsonify(full_result)


@assessments_bp.route("/api/assessments", methods=["GET"])
def list_assessments():
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 20))
    q = Assessment.query.order_by(Assessment.created_at.desc())
    total = q.count()
    items = q.offset((page - 1) * per_page).limit(per_page).all()
    return jsonify({
        "total": total, "page": page, "per_page": per_page,
        "items": [a.to_dict() for a in items],
    })


@assessments_bp.route("/api/assessments/<int:assessment_id>", methods=["GET"])
def get_assessment(assessment_id):
    a = Assessment.query.get_or_404(assessment_id)
    return jsonify(a.to_dict())


@assessments_bp.route("/api/assessments/<int:assessment_id>/export/csv", methods=["GET"])
def export_csv(assessment_id):
    """Return a simple CSV of the assessment factors."""
    import csv, io
    a = Assessment.query.get_or_404(assessment_id)
    result = json.loads(a.result_json) if a.result_json else {}
    compat = result.get("compatibility", {})
    factors = compat.get("factors", [])

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ADAPTFIT Assessment Export"])
    writer.writerow(["Location A", a.name_a, f"{a.lat_a}, {a.lng_a}"])
    writer.writerow(["Location B", a.name_b, f"{a.lat_b}, {a.lng_b}"])
    writer.writerow(["Adaptation", a.adaptation_id])
    writer.writerow(["Overall Status", a.overall_status])
    writer.writerow(["Compatibility Score", a.compatibility_score])
    writer.writerow([])
    writer.writerow(["Factor", "Weight", "Score", "Explanation"])
    for f in factors:
        writer.writerow([f.get("name"), f.get("weight"), f.get("score"), f.get("explanation")])

    from flask import Response
    return Response(
        output.getvalue(),
        mimetype="text/csv",
        headers={"Content-Disposition": f"attachment; filename=adaptfit_assessment_{assessment_id}.csv"},
    )

