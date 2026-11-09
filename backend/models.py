"""
ADAPTFIT – SQLAlchemy ORM models.
"""
from datetime import datetime, timezone
from database import db


def utcnow():
    return datetime.now(timezone.utc)


class SavedLocation(db.Model):
    """A geocoded location saved by the user."""
    __tablename__ = "saved_locations"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    formatted_address = db.Column(db.Text)
    lat = db.Column(db.Float, nullable=False)
    lng = db.Column(db.Float, nullable=False)
    place_id = db.Column(db.String(255))
    country = db.Column(db.String(100))
    admin_area = db.Column(db.String(100))
    role = db.Column(db.String(20), default="reference")  # 'reference' | 'target'
    created_at = db.Column(db.DateTime, default=utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "formatted_address": self.formatted_address,
            "lat": self.lat,
            "lng": self.lng,
            "place_id": self.place_id,
            "country": self.country,
            "admin_area": self.admin_area,
            "role": self.role,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class LocationComparison(db.Model):
    """Pair of reference + target locations for comparison."""
    __tablename__ = "location_comparisons"

    id = db.Column(db.Integer, primary_key=True)
    location_a_id = db.Column(db.Integer, db.ForeignKey("saved_locations.id"), nullable=False)
    location_b_id = db.Column(db.Integer, db.ForeignKey("saved_locations.id"), nullable=False)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=utcnow)

    location_a = db.relationship("SavedLocation", foreign_keys=[location_a_id])
    location_b = db.relationship("SavedLocation", foreign_keys=[location_b_id])

    def to_dict(self):
        return {
            "id": self.id,
            "location_a": self.location_a.to_dict() if self.location_a else None,
            "location_b": self.location_b.to_dict() if self.location_b else None,
            "notes": self.notes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class ClimateCache(db.Model):
    """
    Cached responses from external climate APIs.
    Avoids hitting rate limits on repeated identical requests.
    """
    __tablename__ = "climate_cache"

    id = db.Column(db.Integer, primary_key=True)
    cache_key = db.Column(db.String(512), unique=True, nullable=False, index=True)
    data_type = db.Column(db.String(50))   # 'nasa_power' | 'open_meteo_hist' | etc.
    lat = db.Column(db.Float)
    lng = db.Column(db.Float)
    params_json = db.Column(db.Text)        # serialized request params
    response_json = db.Column(db.Text)      # full API response
    source_api = db.Column(db.String(100))
    fetched_at = db.Column(db.DateTime, default=utcnow)
    ttl_hours = db.Column(db.Integer, default=168)

    def is_valid(self):
        from datetime import timedelta
        if not self.fetched_at:
            return False
        age = datetime.now(timezone.utc) - self.fetched_at.replace(tzinfo=timezone.utc)
        return age < timedelta(hours=self.ttl_hours)


class AdaptationAssignment(db.Model):
    """Links an adaptation ID to a saved location."""
    __tablename__ = "adaptation_assignments"

    id = db.Column(db.Integer, primary_key=True)
    location_id = db.Column(db.Integer, db.ForeignKey("saved_locations.id"), nullable=False)
    adaptation_id = db.Column(db.String(100), nullable=False)
    assigned_at = db.Column(db.DateTime, default=utcnow)

    location = db.relationship("SavedLocation")

    def to_dict(self):
        return {
            "id": self.id,
            "location_id": self.location_id,
            "adaptation_id": self.adaptation_id,
            "assigned_at": self.assigned_at.isoformat() if self.assigned_at else None,
        }


class Assessment(db.Model):
    """
    Full compatibility assessment result for a pair of locations
    and a specific adaptation.
    """
    __tablename__ = "assessments"

    id = db.Column(db.Integer, primary_key=True)
    # Location pair (denormalized for portability)
    name_a = db.Column(db.String(255))
    lat_a = db.Column(db.Float)
    lng_a = db.Column(db.Float)
    name_b = db.Column(db.String(255))
    lat_b = db.Column(db.Float)
    lng_b = db.Column(db.Float)
    adaptation_id = db.Column(db.String(100))
    # Computed results (stored as JSON text)
    result_json = db.Column(db.Text)        # full engine result
    overall_status = db.Column(db.String(30))   # SUITABLE / CONDITIONAL / UNSUITABLE / INSUFFICIENT_DATA
    compatibility_score = db.Column(db.Float)   # 0–100 or null
    created_at = db.Column(db.DateTime, default=utcnow)

    def to_dict(self):
        import json
        return {
            "id": self.id,
            "location_a": {"name": self.name_a, "lat": self.lat_a, "lng": self.lng_a},
            "location_b": {"name": self.name_b, "lat": self.lat_b, "lng": self.lng_b},
            "adaptation_id": self.adaptation_id,
            "result": json.loads(self.result_json) if self.result_json else None,
            "overall_status": self.overall_status,
            "compatibility_score": self.compatibility_score,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

