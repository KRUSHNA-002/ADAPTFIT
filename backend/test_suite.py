"""
ADAPTFIT Comprehensive Backend Verification & Integration Test Suite.
Tests database, adaptation engine, route blueprints, caching, and CSV export.
"""
import sys
import os
import json

# Add backend directory to sys.path
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app import create_app
from database import db
from models import SavedLocation, LocationComparison, ClimateCache, Assessment
from services.adaptation_engine import (
    ADAPTATION_REQUIREMENTS,
    compute_compatibility,
    rank_all_adaptations,
)

app = create_app()

def test_engine_all_adaptations():
    print("[1/5] Testing Adaptation Engine definitions and logic...")
    assert len(ADAPTATION_REQUIREMENTS) == 10, f"Expected 10 adaptations, got {len(ADAPTATION_REQUIREMENTS)}"
    print(f"  ✓ Found all 10 registered adaptations: {list(ADAPTATION_REQUIREMENTS.keys())}")

    # Mock climate data for testing
    climate_a = {
        "yearly": {
            "2020": {"avg_temp_c": 27.5, "annual_precip_mm": 1100.0, "avg_rh_pct": 75.0, "avg_wind_ms": 3.2},
            "2021": {"avg_temp_c": 28.0, "annual_precip_mm": 1250.0, "avg_rh_pct": 76.0, "avg_wind_ms": 3.4},
        },
        "averages": {"avg_temp_c": 27.8, "annual_precip_mm": 1175.0, "avg_rh_pct": 75.5, "avg_wind_ms": 3.3},
    }
    climate_b = {
        "yearly": {
            "2020": {"avg_temp_c": 26.0, "annual_precip_mm": 950.0, "avg_rh_pct": 70.0, "avg_wind_ms": 3.0},
            "2021": {"avg_temp_c": 26.5, "annual_precip_mm": 1020.0, "avg_rh_pct": 72.0, "avg_wind_ms": 3.1},
        },
        "averages": {"avg_temp_c": 26.2, "annual_precip_mm": 985.0, "avg_rh_pct": 71.0, "avg_wind_ms": 3.05},
    }

    # Test rain_garden compatibility
    rg_res = compute_compatibility("rain-garden", climate_a, 18.52, 73.85, climate_b, 19.07, 72.87)
    assert rg_res["adaptation_id"] == "rain-garden"
    assert "score" in rg_res
    assert rg_res["score"] > 70
    assert rg_res["status"] in ["SUITABLE", "CONDITIONAL"]
    assert len(rg_res["factors"]) > 0
    print(f"  ✓ Rain Garden score: {rg_res['score']}% ({rg_res['status']})")

    # Test critical blocker logic (e.g. extreme aridity for rain garden)
    arid_climate = {
        "yearly": {"2020": {"avg_temp_c": 35.0, "annual_precip_mm": 80.0, "avg_rh_pct": 20.0, "avg_wind_ms": 4.0}},
        "averages": {"avg_temp_c": 35.0, "annual_precip_mm": 80.0, "avg_rh_pct": 20.0, "avg_wind_ms": 4.0},
    }
    blocked_res = compute_compatibility("rain-garden", climate_a, 18.52, 73.85, arid_climate, 25.0, 55.0)
    assert blocked_res["score"] == 0, f"Expected score 0 for blocked condition, got {blocked_res['score']}"
    assert blocked_res["status"] == "UNSUITABLE"
    assert len(blocked_res["blockers"]) > 0
    print(f"  ✓ Blocker detected as expected: {blocked_res['blockers'][0]}")

    # Test ranking all 10 adaptations
    ranked = rank_all_adaptations(climate_a, 18.52, 73.85, climate_b, 19.07, 72.87)
    assert len(ranked) == 10, f"Expected 10 ranked adaptations, got {len(ranked)}"
    print(f"  ✓ Successfully ranked all 10 adaptations. Top: {ranked[0]['name']} ({ranked[0]['score']}%)")

def test_flask_routes():
    print("\n[2/5] Testing Flask API Routes via Test Client...")
    client = app.test_client()

    # 1. Health check
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.get_json()
    assert data["status"] == "ok"
    assert "ADAPTFIT" in data["project"]
    print(f"  ✓ GET /api/health -> 200 OK ({data['project']} v{data['version']})")

    # 2. Satellite layers
    res = client.get("/api/satellite/layers")
    assert res.status_code == 200
    satellite_resp = res.get_json()
    assert "layers" in satellite_resp
    layers = satellite_resp["layers"]
    assert len(layers) >= 4
    print(f"  ✓ GET /api/satellite/layers -> 200 OK ({len(layers)} layers returned)")

    # 4. Location endpoints
    loc_payload = {
        "name": "Rotterdam Test Port",
        "lat": 51.9244,
        "lng": 4.4777,
        "formatted_address": "Rotterdam, Netherlands",
        "country": "Netherlands",
        "role": "reference"
    }
    res = client.post("/api/locations", json=loc_payload)
    assert res.status_code == 201
    loc_data = res.get_json()
    saved_id = loc_data["id"]
    print(f"  ✓ POST /api/locations -> 201 Created (ID: {saved_id})")

    res = client.get(f"/api/locations/{saved_id}")
    assert res.status_code == 200
    assert res.get_json()["name"] == "Rotterdam Test Port"
    print(f"  ✓ GET /api/locations/{saved_id} -> 200 OK")

    # 5. Assessments Calculation & Database Persistence
    assess_payload = {
        "name_a": "Pune (Benchmark)",
        "lat_a": 18.5204,
        "lng_a": 73.8567,
        "name_b": "Mumbai (Target)",
        "lat_b": 18.9220,
        "lng_b": 72.8347,
        "adaptation_id": "rain_garden"
    }
    res = client.post("/api/assessments/calculate", json=assess_payload)
    assert res.status_code in [200, 503]
    if res.status_code == 200:
        assess_data = res.get_json()
        assert "compatibility" in assess_data
        assert "score" in assess_data
        assessment_id = assess_data["assessment_id"]
        print(f"  ✓ POST /api/assessments/calculate -> 200 OK (Assessment ID: {assessment_id}, Score: {assess_data['score']}%)")

        # 6. Retrieve saved assessment
        res = client.get(f"/api/assessments/{assessment_id}")
        assert res.status_code == 200
        print(f"  ✓ GET /api/assessments/{assessment_id} -> 200 OK")

        # 7. CSV Export
        res = client.get(f"/api/assessments/{assessment_id}/export/csv")
        assert res.status_code == 200
        assert "text/csv" in res.content_type
        csv_text = res.get_data(as_text=True)
        assert "ADAPTFIT Assessment Export" in csv_text
        assert "Pune (Benchmark)" in csv_text
        print(f"  ✓ GET /api/assessments/{assessment_id}/export/csv -> 200 OK (Content length: {len(csv_text)} bytes)")
    else:
        print(f"  ⚠ Assessment route returned 503 (NASA network reached/cached, continuing)")

    # 8. List assessments
    res = client.get("/api/assessments?page=1&per_page=10")
    assert res.status_code == 200
    list_data = res.get_json()
    assert "items" in list_data
    print(f"  ✓ GET /api/assessments -> 200 OK ({list_data['total']} total records)")

def test_climate_routes():
    print("\n[3/5] Testing Climate & Compatibility Routes...")
    client = app.test_client()

    # Climate historical (cached or fast response)
    res = client.get("/api/climate/historical?lat=18.5204&lng=73.8567&start_year=2015&end_year=2020")
    assert res.status_code in [200, 503]
    if res.status_code == 200:
        cdata = res.get_json()
        assert "yearly" in cdata
        print(f"  ✓ GET /api/climate/historical -> 200 OK ({len(cdata['yearly'])} years)")

    # Climate climatology
    res = client.get("/api/climate/climatology?lat=18.5204&lng=73.8567")
    assert res.status_code in [200, 503]
    if res.status_code == 200:
        clim_data = res.get_json()
        assert "monthly" in clim_data
        print(f"  ✓ GET /api/climate/climatology -> 200 OK ({len(clim_data['monthly'])} monthly baselines)")

    # Climate compare
    res = client.get("/api/climate/compare?lat_a=18.52&lng_a=73.85&lat_b=19.07&lng_b=72.87&start_year=2015&end_year=2020")
    assert res.status_code in [200, 503]
    if res.status_code == 200:
        cmp_data = res.get_json()
        assert "comparison" in cmp_data
        print(f"  ✓ GET /api/climate/compare -> 200 OK (temp_delta: {cmp_data['comparison'].get('avg_temp_delta_c')}°C)")

    # Compatibility score endpoint
    compat_payload = {
        "lat_a": 18.52, "lng_a": 73.85, "name_a": "Pune",
        "lat_b": 19.07, "lng_b": 72.87, "name_b": "Mumbai",
        "adaptation_id": "rain-garden"
    }
    res = client.post("/api/compatibility/score", json=compat_payload)
    assert res.status_code in [200, 503]
    if res.status_code == 200:
        c_score = res.get_json()
        assert "score" in c_score
        print(f"  ✓ POST /api/compatibility/score -> 200 OK (Score: {c_score['score']}%)")

def test_database_persistence():
    print("\n[4/5] Testing Database Persistence & Queries...")
    with app.app_context():
        # Check tables
        saved_count = SavedLocation.query.count()
        assert saved_count > 0
        print(f"  ✓ SavedLocation table verified: {saved_count} records")

        assess_count = Assessment.query.count()
        assert assess_count > 0
        print(f"  ✓ Assessment table verified: {assess_count} records")

        cache_count = ClimateCache.query.count()
        print(f"  ✓ ClimateCache table verified: {cache_count} cached entries")

def test_frontend_contract():
    print("\n[5/5] Testing Frontend-Backend Contract Alignment...")
    with app.app_context():
        # Verify adaptation IDs match between backend and frontend
        expected_ids = [
            "rain-garden", "permeable-pavement", "green-roof",
            "urban-tree-planting", "wetland-restoration", "bioswales",
            "detention-retention-ponds", "cool-roofs", "urban-green-corridors",
            "floodplain-restoration"
        ]
        for aid in expected_ids:
            assert aid in ADAPTATION_REQUIREMENTS, f"Missing {aid} in ADAPTATION_REQUIREMENTS"
        print(f"  ✓ All 10 frontend adaptation keys strictly match backend requirements.")

if __name__ == "__main__":
    print("=" * 60)
    print("ADAPTFIT BACKEND VERIFICATION & INTEGRATION SUITE")
    print("=" * 60)
    with app.app_context():
        test_engine_all_adaptations()
        test_flask_routes()
        test_climate_routes()
        test_database_persistence()
        test_frontend_contract()
    print("=" * 60)
    print("ALL 5 TEST SUITES PASSED SUCCESSFULLY! ✓")
    print("=" * 60)
