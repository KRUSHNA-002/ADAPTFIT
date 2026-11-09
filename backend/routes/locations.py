"""
ADAPTFIT – Location save/retrieve routes.
"""
from flask import Blueprint, jsonify, request
from database import db
from models import SavedLocation, LocationComparison

locations_bp = Blueprint("locations", __name__)


@locations_bp.route("/api/locations", methods=["GET"])
def list_locations():
    locs = SavedLocation.query.order_by(SavedLocation.created_at.desc()).all()
    return jsonify([l.to_dict() for l in locs])


@locations_bp.route("/api/locations", methods=["POST"])
def save_location():
    data = request.get_json(silent=True) or {}
    required = ["name", "lat", "lng"]
    for field in required:
        if field not in data:
            return jsonify({"error": f"Missing required field: {field}"}), 400
    try:
        lat = float(data["lat"])
        lng = float(data["lng"])
    except (TypeError, ValueError):
        return jsonify({"error": "lat and lng must be numeric."}), 400
    if not (-90 <= lat <= 90) or not (-180 <= lng <= 180):
        return jsonify({"error": "Invalid coordinates."}), 400

    loc = SavedLocation(
        name=str(data["name"])[:255],
        formatted_address=data.get("formatted_address", ""),
        lat=lat,
        lng=lng,
        place_id=data.get("place_id", ""),
        country=data.get("country", ""),
        admin_area=data.get("admin_area", ""),
        role=data.get("role", "reference"),
    )
    db.session.add(loc)
    db.session.commit()
    return jsonify(loc.to_dict()), 201


@locations_bp.route("/api/locations/<int:loc_id>", methods=["GET"])
def get_location(loc_id):
    loc = SavedLocation.query.get_or_404(loc_id)
    return jsonify(loc.to_dict())


@locations_bp.route("/api/locations/<int:loc_id>", methods=["DELETE"])
def delete_location(loc_id):
    loc = SavedLocation.query.get_or_404(loc_id)
    db.session.delete(loc)
    db.session.commit()
    return jsonify({"deleted": loc_id})


@locations_bp.route("/api/locations/compare", methods=["POST"])
def save_comparison():
    data = request.get_json(silent=True) or {}
    for field in ["location_a_id", "location_b_id"]:
        if field not in data:
            return jsonify({"error": f"Missing field: {field}"}), 400
    comp = LocationComparison(
        location_a_id=data["location_a_id"],
        location_b_id=data["location_b_id"],
        notes=data.get("notes", ""),
    )
    db.session.add(comp)
    db.session.commit()
    return jsonify(comp.to_dict()), 201


@locations_bp.route("/api/locations/comparisons", methods=["GET"])
def list_comparisons():
    comps = LocationComparison.query.order_by(LocationComparison.created_at.desc()).limit(50).all()
    return jsonify([c.to_dict() for c in comps])

