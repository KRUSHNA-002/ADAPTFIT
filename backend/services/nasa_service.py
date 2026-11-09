"""
ADAPTFIT – NASA POWER API service.

NASA POWER provides gridded (~0.5° × 0.5°) model-derived meteorological
and solar data at any point on Earth for 1981–near-present.
No API key required. License: NASA Open Data (CC-BY).
"""
from __future__ import annotations
import json
import logging
import hashlib
from datetime import datetime, timezone

import requests

logger = logging.getLogger(__name__)

NASA_POWER_BASE = "https://power.larc.nasa.gov/api"
REQUEST_TIMEOUT = 20

# Parameters we request from NASA POWER
POWER_PARAMS = "T2M,T2M_MAX,T2M_MIN,PRECTOTCORR,RH2M,WS10M"


def _cache_key(lat: float, lng: float, start: str, end: str, params: str) -> str:
    raw = f"nasa:{lat:.4f}:{lng:.4f}:{start}:{end}:{params}"
    return hashlib.md5(raw.encode()).hexdigest()


def fetch_nasa_power_annual(
    lat: float,
    lng: float,
    start_year: int,
    end_year: int,
    db=None,
    ttl_hours: int = 168,
) -> dict:
    """
    Fetch annual average climate data from NASA POWER for a lat/lng point.

    Returns a dict with years as keys and climate variable averages as values.
    Data is model-derived reanalysis (MERRA-2 / GEOS-5); spatial resolution ~0.5°.
    """
    start = f"{start_year}0101"
    end = f"{end_year}1231"
    cache_key = _cache_key(lat, lng, start, end, POWER_PARAMS)

    # Check DB cache
    if db is not None:
        from models import ClimateCache
        cached = ClimateCache.query.filter_by(cache_key=cache_key).first()
        if cached and cached.is_valid():
            logger.info("Cache hit for NASA POWER key=%s", cache_key)
            return json.loads(cached.response_json)

    url = f"{NASA_POWER_BASE}/temporal/daily/point"
    params = {
        "parameters": POWER_PARAMS,
        "community": "AG",
        "longitude": lng,
        "latitude": lat,
        "start": start,
        "end": end,
        "format": "JSON",
    }

    try:
        resp = requests.get(url, params=params, timeout=REQUEST_TIMEOUT)
        resp.raise_for_status()
        raw = resp.json()
    except requests.Timeout:
        return {"error": "NASA POWER request timed out. Try again later.", "source": "nasa_power"}
    except requests.ConnectionError:
        return {"error": "Cannot reach NASA POWER API. Check your internet connection.", "source": "nasa_power"}
    except requests.HTTPError as e:
        return {"error": f"NASA POWER HTTP error: {e.response.status_code}", "source": "nasa_power"}
    except Exception as e:  # noqa: BLE001
        return {"error": f"Unexpected error: {str(e)}", "source": "nasa_power"}

    # Parse the NASA POWER daily response into yearly summaries
    try:
        props = raw.get("properties", {}).get("parameter", {})
        result = _aggregate_to_yearly(props, start_year, end_year)
    except Exception as e:  # noqa: BLE001
        return {"error": f"Failed to parse NASA POWER response: {str(e)}", "source": "nasa_power"}

    result["source"] = {
        "name": "NASA POWER",
        "url": "https://power.larc.nasa.gov/",
        "description": (
            "POWER (Prediction Of Worldwide Energy Resources) provides gridded "
            "meteorological data (~0.5°×0.5° resolution) derived from NASA satellite "
            "observations and MERRA-2/GEOS-5 reanalysis. Data represents a spatial "
            "average over the grid cell, not a point measurement."
        ),
        "license": "NASA Open Data (CC Attribution)",
        "parameters_requested": POWER_PARAMS,
        "lat": lat,
        "lng": lng,
        "start_year": start_year,
        "end_year": end_year,
        "fetched_at": datetime.now(timezone.utc).isoformat(),
    }

    # Store in DB cache
    if db is not None:
        _save_to_cache(db, cache_key, lat, lng, "nasa_power", result, ttl_hours)

    return result


def _aggregate_to_yearly(props: dict, start_year: int, end_year: int) -> dict:
    """
    Aggregate NASA POWER daily data into per-year statistics.
    Missing values are coded as -999 by NASA; we exclude them.
    """
    from collections import defaultdict

    year_buckets: dict[int, dict[str, list]] = defaultdict(lambda: defaultdict(list))

    for param_name, daily_dict in props.items():
        for date_str, value in daily_dict.items():
            year = int(date_str[:4])
            if start_year <= year <= end_year and value != -999:
                year_buckets[year][param_name].append(value)

    yearly = {}
    for year in range(start_year, end_year + 1):
        bucket = year_buckets.get(year, {})
        entry = {"year": year}
        for param in ["T2M", "T2M_MAX", "T2M_MIN", "PRECTOTCORR", "RH2M", "WS10M"]:
            vals = bucket.get(param, [])
            if vals:
                if param == "PRECTOTCORR":
                    # Precipitation: sum daily values for annual total
                    entry["annual_precip_mm"] = round(sum(vals), 1)
                    entry["avg_daily_precip_mm"] = round(sum(vals) / len(vals), 3)
                elif param == "T2M":
                    entry["avg_temp_c"] = round(sum(vals) / len(vals), 2)
                elif param == "T2M_MAX":
                    entry["avg_max_temp_c"] = round(sum(vals) / len(vals), 2)
                    entry["abs_max_temp_c"] = round(max(vals), 1)
                elif param == "T2M_MIN":
                    entry["avg_min_temp_c"] = round(sum(vals) / len(vals), 2)
                    entry["abs_min_temp_c"] = round(min(vals), 1)
                elif param == "RH2M":
                    entry["avg_humidity_pct"] = round(sum(vals) / len(vals), 1)
                elif param == "WS10M":
                    entry["avg_wind_ms"] = round(sum(vals) / len(vals), 2)
            else:
                # NASA POWER may have gaps; flag them
                if param == "PRECTOTCORR":
                    entry["annual_precip_mm"] = None
                elif param == "T2M":
                    entry["avg_temp_c"] = None
        yearly[str(year)] = entry

    return {"yearly": yearly}


def fetch_nasa_power_climatology(lat: float, lng: float, db=None) -> dict:
    """
    Fetch 20-year monthly climatology from NASA POWER (2001–2020 average).
    Returns 12 monthly mean values for temperature and precipitation.
    """
    cache_key = _cache_key(lat, lng, "clim2001", "clim2020", "clim")
    if db is not None:
        from models import ClimateCache
        cached = ClimateCache.query.filter_by(cache_key=cache_key).first()
        if cached and cached.is_valid():
            try:
                cached_data = json.loads(cached.response_json)
                monthly = cached_data.get("monthly", [])
                if monthly and any(m.get("avg_temp_c") is not None for m in monthly):
                    return cached_data
            except Exception:
                pass

    url = f"{NASA_POWER_BASE}/temporal/climatology/point"
    params = {
        "parameters": "T2M,PRECTOTCORR,RH2M",
        "community": "AG",
        "longitude": lng,
        "latitude": lat,
        "format": "JSON",
        "climatology": "true",
    }

    try:
        resp = requests.get(url, params=params, timeout=REQUEST_TIMEOUT)
        resp.raise_for_status()
        raw = resp.json()
    except Exception as e:  # noqa: BLE001
        return {"error": str(e), "source": "nasa_power_climatology"}

    try:
        props = raw.get("properties", {}).get("parameter", {})
        months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        days_in_month = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
        monthly = []
        for i, (month, days) in enumerate(zip(months, days_in_month), 1):
            m_key = month.upper()  # NASA POWER uses 'JAN', 'FEB', etc.
            t_val = props.get("T2M", {}).get(m_key)
            if t_val is None:
                t_val = props.get("T2M", {}).get(str(i))

            daily_precip = props.get("PRECTOTCORR", {}).get(m_key)
            if daily_precip is None:
                daily_precip = props.get("PRECTOTCORR", {}).get(str(i))
            monthly_precip = round(daily_precip * days, 1) if daily_precip is not None and daily_precip != -999 else None

            rh_val = props.get("RH2M", {}).get(m_key)
            if rh_val is None:
                rh_val = props.get("RH2M", {}).get(str(i))

            monthly.append({
                "month": month,
                "avg_temp_c": round(t_val, 2) if t_val is not None and t_val != -999 else None,
                "precip_mm": monthly_precip,
                "precip_mm_day": round(daily_precip, 2) if daily_precip is not None and daily_precip != -999 else None,
                "humidity_pct": round(rh_val, 1) if rh_val is not None and rh_val != -999 else None,
            })

        result = {
            "monthly": monthly,
            "source": {
                "name": "NASA POWER Climatology (2001–2020)",
                "url": "https://power.larc.nasa.gov/",
                "lat": lat,
                "lng": lng,
                "fetched_at": datetime.now(timezone.utc).isoformat(),
            }
        }
    except Exception as e:  # noqa: BLE001
        return {"error": str(e), "source": "nasa_power_climatology"}

    if db is not None:
        _save_to_cache(db, cache_key, lat, lng, "nasa_power_clim", result, ttl_hours=720)

    return result


def _save_to_cache(db, key, lat, lng, data_type, data, ttl_hours):
    try:
        from models import ClimateCache
        existing = ClimateCache.query.filter_by(cache_key=key).first()
        if existing:
            existing.response_json = json.dumps(data)
            existing.fetched_at = datetime.now(timezone.utc)
        else:
            record = ClimateCache(
                cache_key=key,
                data_type=data_type,
                lat=lat,
                lng=lng,
                response_json=json.dumps(data),
                source_api="nasa_power",
                ttl_hours=ttl_hours,
            )
            db.session.add(record)
        db.session.commit()
    except Exception as e:  # noqa: BLE001
        logger.warning("Failed to cache response: %s", e)
        db.session.rollback()

