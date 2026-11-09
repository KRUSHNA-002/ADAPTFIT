"""
ADAPTFIT – Adaptation Compatibility Engine.

Computes whether a given climate adaptation that works in Location A
could also work in Location B, using documented environmental requirements.

Evaluates 10 core climate adaptation strategies:
1. Rain Garden (rain-garden)
2. Permeable Pavement (permeable-pavement)
3. Green Roof (green-roof)
4. Urban Tree Planting (urban-tree-planting)
5. Wetland Restoration (wetland-restoration)
6. Bioswales (bioswales)
7. Detention / Retention Ponds (detention-retention-ponds)
8. Cool Roofs (cool-roofs)
9. Urban Green Corridors (urban-green-corridors)
10. Floodplain Restoration (floodplain-restoration)
"""
from __future__ import annotations
import math
import logging
from typing import Optional

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Adaptation requirements library (Documented scientific criteria)
# ---------------------------------------------------------------------------
ADAPTATION_REQUIREMENTS = {
    "rain-garden": {
        "name": "Rain Garden",
        "category": "Urban Hydrology",
        "description": "Depressed bio-retention beds engineered to capture, filter, and infiltrate rooftop and street runoff.",
        "climate_requirements": {
            "min_annual_precip_mm": 400,
            "max_annual_precip_mm": 2500,
            "min_avg_temp_c": -15,
            "max_avg_temp_c": 45,
        },
        "critical_blockers": [
            {"condition": "annual_precip_mm < 250", "reason": "Arid climate (<250 mm/yr) with insufficient storm runoff without permanent supplemental irrigation."},
            {"condition": "avg_temp_c < -15", "reason": "Severe permafrost conditions inhibit bioretention infiltration and plant root vitality."},
        ],
        "factor_weights": {
            "temperature_similarity": 0.25,
            "rainfall_similarity": 0.40,
            "latitude_zone_match": 0.20,
            "rainfall_adequacy": 0.15,
        },
    },
    "permeable-pavement": {
        "name": "Permeable Pavement",
        "category": "Sustainable Drainage",
        "description": "Load-bearing porous surfacing allowing water to infiltrate directly into subterranean gravel reservoirs.",
        "climate_requirements": {
            "min_annual_precip_mm": 300,
            "max_annual_precip_mm": 3000,
            "min_avg_temp_c": -20,
            "max_avg_temp_c": 48,
        },
        "critical_blockers": [
            {"condition": "abs_min_temp_c < -25", "reason": "Severe deep-ground freeze-thaw cycles cause sub-base frost heave without specialized engineering."},
        ],
        "factor_weights": {
            "temperature_similarity": 0.30,
            "rainfall_similarity": 0.35,
            "latitude_zone_match": 0.20,
            "rainfall_adequacy": 0.15,
        },
    },
    "green-roof": {
        "name": "Green Roof",
        "category": "Urban Green Infrastructure",
        "description": "Engineered rooftop vegetation systems providing storm retention, insulation, and ambient cooling.",
        "climate_requirements": {
            "min_annual_precip_mm": 350,
            "max_annual_precip_mm": 2800,
            "min_avg_temp_c": -20,
            "max_avg_temp_c": 45,
        },
        "critical_blockers": [
            {"condition": "annual_precip_mm < 200", "reason": "Hyper-arid conditions require continuous potable water irrigation, negating net sustainability."},
            {"condition": "abs_max_temp_c > 48 and annual_precip_mm < 400", "reason": "Extreme rooftop heat desiccation exceeds plant survival limits."},
        ],
        "factor_weights": {
            "temperature_similarity": 0.35,
            "rainfall_similarity": 0.30,
            "latitude_zone_match": 0.20,
            "rainfall_adequacy": 0.15,
        },
    },
    "urban-tree-planting": {
        "name": "Urban Tree Planting",
        "category": "Urban Heat Mitigation",
        "description": "Strategic high-canopy indigenous tree networks mitigating urban heat islands and intercepting rain.",
        "climate_requirements": {
            "min_annual_precip_mm": 300,
            "max_annual_precip_mm": 3500,
            "min_avg_temp_c": -25,
            "max_avg_temp_c": 46,
        },
        "critical_blockers": [
            {"condition": "annual_precip_mm < 150", "reason": "Annual precipitation insufficient for canopy tree survival without permanent deep irrigation."},
        ],
        "factor_weights": {
            "temperature_similarity": 0.35,
            "rainfall_similarity": 0.30,
            "latitude_zone_match": 0.20,
            "rainfall_adequacy": 0.15,
        },
    },
    "wetland-restoration": {
        "name": "Wetland Restoration",
        "category": "Flood Management",
        "description": "Rehabilitation of natural marshland and riparian wetlands for regional flood storage and water purification.",
        "climate_requirements": {
            "min_annual_precip_mm": 600,
            "max_annual_precip_mm": 4000,
            "min_avg_temp_c": -10,
            "max_avg_temp_c": 42,
        },
        "critical_blockers": [
            {"condition": "annual_precip_mm < 350", "reason": "Chronic hydrological deficit leads to complete wetland desiccation and peat oxidation."},
        ],
        "factor_weights": {
            "temperature_similarity": 0.25,
            "rainfall_similarity": 0.45,
            "latitude_zone_match": 0.15,
            "rainfall_adequacy": 0.15,
        },
    },
    "bioswales": {
        "name": "Bioswales",
        "category": "Sustainable Drainage",
        "description": "Gently sloped vegetated channels engineered to slow runoff velocity, trap silt, and enhance percolation.",
        "climate_requirements": {
            "min_annual_precip_mm": 350,
            "max_annual_precip_mm": 3200,
            "min_avg_temp_c": -15,
            "max_avg_temp_c": 45,
        },
        "critical_blockers": [
            {"condition": "annual_precip_mm < 200", "reason": "Inadequate runoff volume to maintain bio-filter turf and swale vegetation."},
        ],
        "factor_weights": {
            "temperature_similarity": 0.25,
            "rainfall_similarity": 0.40,
            "latitude_zone_match": 0.20,
            "rainfall_adequacy": 0.15,
        },
    },
    "detention-retention-ponds": {
        "name": "Detention / Retention Ponds",
        "category": "Flood Management",
        "description": "Engineered open basins for holding major cloudburst volumes and controlling downstream release rates.",
        "climate_requirements": {
            "min_annual_precip_mm": 400,
            "max_annual_precip_mm": 4500,
            "min_avg_temp_c": -30,
            "max_avg_temp_c": 50,
        },
        "critical_blockers": [
            {"condition": "annual_precip_mm < 150", "reason": "Insufficient watershed runoff to maintain retention volume or justify detention structures."},
        ],
        "factor_weights": {
            "temperature_similarity": 0.20,
            "rainfall_similarity": 0.45,
            "latitude_zone_match": 0.15,
            "rainfall_adequacy": 0.20,
        },
    },
    "cool-roofs": {
        "name": "Cool Roofs",
        "category": "Urban Heat Mitigation",
        "description": "High-solar-reflectance coatings and membranes reflecting radiant energy back into space.",
        "climate_requirements": {
            "min_annual_precip_mm": 0,
            "max_annual_precip_mm": 5000,
            "min_avg_temp_c": 10,
            "max_avg_temp_c": 52,
        },
        "critical_blockers": [
            {"condition": "avg_temp_c < 5", "reason": "Predominantly cold heating-dominated climate; high reflectance creates a winter heating energy penalty."},
        ],
        "factor_weights": {
            "temperature_similarity": 0.50,
            "rainfall_similarity": 0.10,
            "latitude_zone_match": 0.25,
            "rainfall_adequacy": 0.15,
        },
    },
    "urban-green-corridors": {
        "name": "Urban Green Corridors",
        "category": "Urban Green Infrastructure",
        "description": "Continuous linear belts of native flora connecting parks, riverbanks, and residential districts.",
        "climate_requirements": {
            "min_annual_precip_mm": 350,
            "max_annual_precip_mm": 3500,
            "min_avg_temp_c": -20,
            "max_avg_temp_c": 45,
        },
        "critical_blockers": [
            {"condition": "annual_precip_mm < 180", "reason": "Hyper-arid conditions prevent contiguous vegetative corridor establishment without unfeasible irrigation."},
        ],
        "factor_weights": {
            "temperature_similarity": 0.35,
            "rainfall_similarity": 0.30,
            "latitude_zone_match": 0.20,
            "rainfall_adequacy": 0.15,
        },
    },
    "floodplain-restoration": {
        "name": "Floodplain Restoration",
        "category": "Floodplain Restoration",
        "description": "Reconnecting rivers to natural alluvial floodplains to dissipate high-volume surge crests safely.",
        "climate_requirements": {
            "min_annual_precip_mm": 500,
            "max_annual_precip_mm": 5000,
            "min_avg_temp_c": -20,
            "max_avg_temp_c": 46,
        },
        "critical_blockers": [
            {"condition": "annual_precip_mm < 250", "reason": "Ephemeral arid wash where permanent floodplain reconnection has minimal flood mitigation benefit."},
        ],
        "factor_weights": {
            "temperature_similarity": 0.20,
            "rainfall_similarity": 0.45,
            "latitude_zone_match": 0.15,
            "rainfall_adequacy": 0.20,
        },
    },
}

# Alias mapping for backward compatibility
ALIASES = {
    "sponge-corridors": "bioswales",
    "high-albedo-cool-roofs": "cool-roofs",
    "mangrove-bioshields": "wetland-restoration",
    "agroforestry-canopy": "urban-tree-planting",
    "floating-solar-shields": "detention-retention-ponds",
    "aquifer-recharge-wells": "rain-garden",
    "vertical-urban-forests": "green-roof",
    "dune-vegetation-fences": "floodplain-restoration",
    "fire-resilient-buffers": "urban-green-corridors",
    "alpine-glof-spillways": "detention-retention-ponds",
}


def _resolve_adaptation_id(aid: str) -> str:
    if not aid or not isinstance(aid, str):
        return ""
    # Normalize: strip, lowercase, replace underscores and spaces with hyphens
    normalized = aid.strip().lower().replace("_", "-").replace(" ", "-")
    if normalized in ADAPTATION_REQUIREMENTS:
        return normalized
    if normalized in ALIASES:
        return ALIASES[normalized]
    if aid in ADAPTATION_REQUIREMENTS:
        return aid
    return ALIASES.get(aid, normalized)


def _latitude_zone(lat: float) -> str:
    abs_lat = abs(lat)
    if abs_lat <= 23.5:
        return "tropical"
    elif abs_lat <= 35:
        return "subtropical"
    elif abs_lat <= 55:
        return "temperate"
    else:
        return "polar"


def _score_temperature_similarity(avg_a: Optional[float], avg_b: Optional[float]) -> tuple[float, str]:
    if avg_a is None or avg_b is None:
        return 50.0, "Insufficient temperature data; assuming moderate similarity baseline."
    delta = abs(avg_a - avg_b)
    score = max(0.0, 100.0 - (delta / 25.0) * 100.0)
    if delta < 2:
        expl = f"Temperatures are closely aligned (ΔT = {delta:.1f}°C). Excellent thermal compatibility."
    elif delta < 8:
        expl = f"Moderate temperature difference (ΔT = {delta:.1f}°C). Strategy transferable with standard local species/material adjustments."
    elif delta < 15:
        expl = f"Significant temperature difference (ΔT = {delta:.1f}°C). Thermal stress analysis required."
    else:
        expl = f"Large temperature divergence (ΔT = {delta:.1f}°C). Extensive thermal re-engineering required."
    return round(score, 1), expl


def _score_rainfall_similarity(rain_a: Optional[float], rain_b: Optional[float]) -> tuple[float, str]:
    if rain_a is None or rain_b is None:
        return 50.0, "Insufficient precipitation data; assuming moderate similarity baseline."
    if rain_a == 0 and rain_b == 0:
        return 100.0, "Both locations share an extremely arid precipitation profile."
    max_rain = max(rain_a, rain_b)
    ratio = min(rain_a, rain_b) / max_rain if max_rain > 0 else 1.0
    score = ratio * 100.0
    delta = abs(rain_a - rain_b)
    if delta < 100:
        expl = f"Precipitation patterns are nearly identical (Δ = {delta:.0f} mm/yr). Hydraulic profile directly compatible."
    elif delta < 400:
        expl = f"Moderate precipitation variation (Δ = {delta:.0f} mm/yr). Sizing and detention capacities should be locally calibrated."
    elif delta < 1000:
        expl = f"Substantial rainfall delta (Δ = {delta:.0f} mm/yr). Storage volumes must be re-dimensioned for target hydrological regime."
    else:
        expl = f"Severe rainfall divergence (Δ = {delta:.0f} mm/yr). High risk of under-sizing or over-saturation without major modifications."
    return round(score, 1), expl


def _score_latitude_zone(lat_a: float, lat_b: float) -> tuple[float, str]:
    zone_a = _latitude_zone(lat_a)
    zone_b = _latitude_zone(lat_b)
    if zone_a == zone_b:
        return 100.0, f"Both locations are situated in the {zone_a} climate zone. High biological and solar compatibility."
    adjacent = {
        ("tropical", "subtropical"), ("subtropical", "tropical"),
        ("subtropical", "temperate"), ("temperate", "subtropical"),
        ("temperate", "polar"), ("polar", "temperate"),
    }
    if (zone_a, zone_b) in adjacent:
        return 65.0, f"Adjacent climate zones ({zone_a} → {zone_b}). Conditional compatibility; review seasonal sunlight and frost risk."
    return 30.0, f"Distant climate zones ({zone_a} → {zone_b}). Substantial macro-climatic divergence."


def _score_rainfall_adequacy(rain_b: Optional[float], req: dict) -> tuple[float, str]:
    if rain_b is None:
        return 50.0, "Precipitation observation unavailable for target location."
    min_req = req.get("min_annual_precip_mm", 0)
    max_req = req.get("max_annual_precip_mm", 9999)
    if min_req <= rain_b <= max_req:
        return 100.0, f"Target annual precipitation ({rain_b:.0f} mm) is well within the optimal operating range ({min_req}–{max_req} mm)."
    elif rain_b < min_req:
        deficit = min_req - rain_b
        score = max(0.0, 100.0 - (deficit / min_req) * 100.0)
        return round(score, 1), f"Target precipitation ({rain_b:.0f} mm) is below the recommended minimum ({min_req} mm). Deficit of {deficit:.0f} mm/yr requires supplemental irrigation."
    else:
        excess = rain_b - max_req
        score = max(0.0, 100.0 - (excess / max_req) * 50.0)
        return round(score, 1), f"Target precipitation ({rain_b:.0f} mm) exceeds the maximum typical design limit ({max_req} mm). Requires high-capacity overflow bypass."


def _check_critical_blockers(climate_b: dict, blockers: list) -> list[str]:
    triggered = []
    avg_temp = climate_b.get("avg_temp_c")
    annual_precip = climate_b.get("annual_precip_mm")
    abs_max_temp = climate_b.get("abs_max_temp_c")
    abs_min_temp = climate_b.get("abs_min_temp_c")

    for blocker in blockers:
        cond = blocker["condition"]
        try:
            local_vars = {
                "avg_temp_c": avg_temp if avg_temp is not None else 20,
                "annual_precip_mm": annual_precip if annual_precip is not None else 800,
                "abs_max_temp_c": abs_max_temp if abs_max_temp is not None else (avg_temp + 10 if avg_temp else 32),
                "abs_min_temp_c": abs_min_temp if abs_min_temp is not None else (avg_temp - 15 if avg_temp else 5),
            }
            if eval(cond, {"__builtins__": {}}, local_vars):  # noqa: S307
                triggered.append(blocker["reason"])
        except Exception:  # noqa: BLE001
            pass
    return triggered


def _status_from_score(score: float, blockers: list[str]) -> str:
    if blockers:
        return "UNSUITABLE"
    if score >= 75:
        return "SUITABLE"
    elif score >= 50:
        return "CONDITIONAL"
    elif score >= 25:
        return "UNSUITABLE"
    else:
        return "INSUFFICIENT_DATA"


def compute_compatibility(
    adaptation_id: str,
    climate_a: dict,
    lat_a: float,
    lng_a: float,
    climate_b: dict,
    lat_b: float,
    lng_b: float,
) -> dict:
    resolved_id = _resolve_adaptation_id(adaptation_id)
    if resolved_id not in ADAPTATION_REQUIREMENTS:
        return {
            "error": f"Unknown adaptation ID: {adaptation_id}",
            "status": "INSUFFICIENT_DATA",
            "score": None,
        }

    req = ADAPTATION_REQUIREMENTS[resolved_id]

    avg_temp_a = _mean_of(climate_a, "avg_temp_c")
    avg_temp_b = _mean_of(climate_b, "avg_temp_c")
    rain_a = _mean_of(climate_a, "annual_precip_mm")
    rain_b = _mean_of(climate_b, "annual_precip_mm")
    abs_max_b = _mean_of(climate_b, "abs_max_temp_c")
    abs_min_b = _mean_of(climate_b, "abs_min_temp_c")

    climate_b_snap = {
        "avg_temp_c": avg_temp_b,
        "annual_precip_mm": rain_b,
        "abs_max_temp_c": abs_max_b,
        "abs_min_temp_c": abs_min_b,
    }

    blockers = _check_critical_blockers(climate_b_snap, req["critical_blockers"])

    weights = req["factor_weights"]
    t_score, t_expl = _score_temperature_similarity(avg_temp_a, avg_temp_b)
    r_score, r_expl = _score_rainfall_similarity(rain_a, rain_b)
    z_score, z_expl = _score_latitude_zone(lat_a, lat_b)
    a_score, a_expl = _score_rainfall_adequacy(rain_b, req["climate_requirements"])

    composite = (
        weights.get("temperature_similarity", 0.25) * t_score
        + weights.get("rainfall_similarity", 0.35) * r_score
        + weights.get("latitude_zone_match", 0.20) * z_score
        + weights.get("rainfall_adequacy", 0.20) * a_score
    )
    composite = round(composite, 1)

    if blockers:
        composite = 0.0

    status = _status_from_score(composite, blockers)
    recommendations = _build_recommendations(
        resolved_id, req, avg_temp_a, avg_temp_b, rain_a, rain_b,
        lat_a, lat_b, blockers
    )

    return {
        "adaptation_id": resolved_id,
        "input_id": adaptation_id,
        "resolved_id": resolved_id,
        "adaptation_name": req["name"],
        "category": req["category"],
        "score": composite,
        "status": status,
        "factors": [
            {
                "name": "Temperature Similarity",
                "weight": weights.get("temperature_similarity", 0.25),
                "score": t_score,
                "explanation": t_expl,
                "inputs": {"avg_temp_a": avg_temp_a, "avg_temp_b": avg_temp_b, "unit": "°C"},
            },
            {
                "name": "Precipitation Similarity",
                "weight": weights.get("rainfall_similarity", 0.35),
                "score": r_score,
                "explanation": r_expl,
                "inputs": {"annual_precip_a_mm": rain_a, "annual_precip_b_mm": rain_b},
            },
            {
                "name": "Climate Zone Match",
                "weight": weights.get("latitude_zone_match", 0.20),
                "score": z_score,
                "explanation": z_expl,
                "inputs": {"zone_a": _latitude_zone(lat_a), "zone_b": _latitude_zone(lat_b)},
            },
            {
                "name": "Rainfall Adequacy (Target)",
                "weight": weights.get("rainfall_adequacy", 0.20),
                "score": a_score,
                "explanation": a_expl,
                "inputs": {
                    "target_precip_mm": rain_b,
                    "required_min_mm": req["climate_requirements"]["min_annual_precip_mm"],
                    "required_max_mm": req["climate_requirements"]["max_annual_precip_mm"],
                },
            },
        ],
        "blockers": blockers,
        "recommendations": recommendations,
        "methodology": {
            "description": (
                "Score is a scientifically grounded, weighted composite of four factors: "
                "temperature similarity, precipitation similarity, climate zone match, and target rainfall adequacy. "
                "Critical environmental blockers override all factors and return UNSUITABLE. "
                "Score represents biophysical suitability for transfer, not probability of project success."
            ),
            "data_source": "NASA POWER MERRA-2/GEOS-5 Reanalysis (~0.5° grid)",
            "limitations": [
                "Score uses grid-averaged meteorological reanalysis, not parcel-level measurements.",
                "Subsurface geotechnical data (bedrock depth, hydraulic conductivity) must be verified on site.",
                "Local municipal drainage regulations and land tenure are not evaluated.",
                "Assessment is a decision-support screening tool, not a certified structural design."
            ],
            "weights": weights,
        },
    }


def _mean_of(climate: dict, key: str) -> Optional[float]:
    yearly = climate.get("yearly", {})
    vals = [v.get(key) for v in yearly.values() if v.get(key) is not None]
    if not vals:
        return None
    return round(sum(vals) / len(vals), 2)


def _build_recommendations(
    adaptation_id, req, avg_temp_a, avg_temp_b, rain_a, rain_b,
    lat_a, lat_b, blockers
):
    recs = []
    zone_a = _latitude_zone(lat_a)
    zone_b = _latitude_zone(lat_b)

    if blockers:
        for b in blockers:
            recs.append({
                "type": "blocker",
                "text": f"Critical Blocker: {b}",
            })
        recs.append({
            "type": "critical",
            "text": "This adaptation cannot be transferred without addressing foundational climate constraints.",
        })
        return recs

    if avg_temp_a is not None and avg_temp_b is not None:
        delta_t = avg_temp_b - avg_temp_a
        if abs(delta_t) >= 4:
            direction = "warmer" if delta_t > 0 else "cooler"
            recs.append({
                "type": "modification",
                "text": f"Target location is {abs(delta_t):.1f}°C {direction} than reference. Select indigenous plant cultivars and materials rated for {direction} regimes.",
            })

    if rain_a is not None and rain_b is not None:
        delta_r = rain_b - rain_a
        if abs(delta_r) >= 250:
            direction = "wetter" if delta_r > 0 else "drier"
            action = "scale up detention and underdrain capacity by at least 25%" if delta_r > 0 else "integrate rainwater retention cisterns or drought-tolerant xeriscaping"
            recs.append({
                "type": "modification",
                "text": f"Target receives {abs(delta_r):.0f} mm/yr {direction} precipitation. Recommended engineering adjustment: {action}.",
            })

    if zone_a != zone_b:
        recs.append({
            "type": "caution",
            "text": f"Climate zone transition detected ({zone_a} → {zone_b}). Perform local botanical and seasonal insolation reviews before final specification.",
        })

    recs.append({
        "type": "field_verification",
        "text": "Mandatory field verification: Conduct site-level double-ring infiltrometer soil testing, identify seasonal high water table, and verify stormwater outfall elevation.",
    })

    return recs


def rank_all_adaptations(climate_a: dict, lat_a: float, lng_a: float,
                          climate_b: dict, lat_b: float, lng_b: float) -> list[dict]:
    results = []
    for adaptation_id in ADAPTATION_REQUIREMENTS:
        result = compute_compatibility(
            adaptation_id, climate_a, lat_a, lng_a, climate_b, lat_b, lng_b
        )
        results.append({
            "adaptation_id": adaptation_id,
            "name": result.get("adaptation_name", adaptation_id),
            "category": result.get("category", ""),
            "score": result.get("score", 0),
            "status": result.get("status", "INSUFFICIENT_DATA"),
            "top_recommendation": result.get("recommendations", [{}])[0].get("text", "") if result.get("recommendations") else "",
        })
    results.sort(key=lambda x: (x["score"] or 0), reverse=True)
    return results
