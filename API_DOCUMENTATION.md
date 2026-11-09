# ADAPTFIT — Backend REST API Documentation

> **Base URL:** `http://localhost:5001` (Development)  
> **API Version:** `v3.0.0`  
> **Protocol:** HTTP/1.1  
> **Response Format:** `application/json` (UTF-8) or `text/csv` (Exports)

---

## 1. System Health & Diagnostics

### `GET /api/health`
Verifies backend operational status, active version, and configured open data providers.

- **Parameters:** None
- **Response Headers:** `Content-Type: application/json`
- **Response Code:** `200 OK`

```json
{
  "status": "ok",
  "version": "3.0.0",
  "project": "ADAPTFIT",
  "platform": "ADAPTFIT Climate Compatibility Decision Support System",
  "data_sources": [
    "NASA POWER (free, no key required)",
    "Open-Meteo (free, no key required)"
  ]
}
```

---

## 2. Climate Intelligence Endpoints

### `GET /api/climate/historical`
Retrieves annual historical climate summaries aggregated from NASA POWER MERRA-2 reanalysis.

- **Query Parameters:**
  - `lat` (float, required): Latitude between -90 and 90.
  - `lng` (float, required): Longitude between -180 and 180.
  - `start_year` (int, optional): Start year (min 1981, default 2005).
  - `end_year` (int, optional): End year (max 2023, default 2023).

- **Sample Request:**
  ```bash
  curl -X GET "http://localhost:5001/api/climate/historical?lat=18.5204&lng=73.8567&start_year=2015&end_year=2020"
  ```

- **Response `200 OK`:**
  ```json
  {
    "latitude": 18.5204,
    "longitude": 73.8567,
    "start_year": 2015,
    "end_year": 2020,
    "source": "NASA POWER API (MERRA-2)",
    "yearly": {
      "2015": {
        "avg_temp_c": 26.8,
        "max_temp_c": 38.2,
        "min_temp_c": 12.4,
        "annual_precip_mm": 745.2,
        "avg_rh_pct": 58.4,
        "avg_wind_ms": 2.8
      }
    },
    "averages": {
      "avg_temp_c": 26.5,
      "annual_precip_mm": 812.0
    }
  }
  ```

---

### `GET /api/climate/climatology`
Returns 20-year (2001–2020) monthly baseline climatological averages from NASA POWER.

- **Query Parameters:**
  - `lat` (float, required): Latitude between -90 and 90.
  - `lng` (float, required): Longitude between -180 and 180.

- **Response `200 OK`:**
  ```json
  {
    "latitude": 18.5204,
    "longitude": 73.8567,
    "period": "2001-2020 climatology",
    "monthly": {
      "JAN": {"avg_temp_c": 21.2, "precip_mm_month": 1.5, "avg_rh_pct": 45.0},
      "JUL": {"avg_temp_c": 25.4, "precip_mm_month": 240.8, "avg_rh_pct": 82.5}
    }
  }
  ```

---

### `GET /api/climate/compare`
Calculates side-by-side meteorological differences between Reference Location A and Target Location B.

- **Query Parameters:**
  - `lat_a`, `lng_a` (float, required): Reference coordinates.
  - `lat_b`, `lng_b` (float, required): Target coordinates.
  - `start_year`, `end_year` (int, optional): Climatological span.

- **Response `200 OK`:**
  ```json
  {
    "comparison": {
      "avg_temp_a": 26.5,
      "avg_temp_b": 28.1,
      "avg_temp_delta_c": 1.6,
      "avg_rain_a_mm": 812.0,
      "avg_rain_b_mm": 2150.0,
      "avg_rain_delta_mm": 1338.0
    },
    "location_a": { /* NASA yearly object */ },
    "location_b": { /* NASA yearly object */ }
  }
  ```

---

## 3. Location Management Endpoints

### `GET /api/locations`
Lists all user-saved benchmark and target locations from SQLite.

- **Response `200 OK`:**
  ```json
  [
    {
      "id": 1,
      "name": "Pune City Hall",
      "formatted_address": "Pune, Maharashtra, India",
      "lat": 18.5204,
      "lng": 73.8567,
      "role": "reference",
      "created_at": "2026-11-09T05:30:00"
    }
  ]
  ```

---

### `POST /api/locations`
Persists a new location record.

- **Request Body (`application/json`):**
  ```json
  {
    "name": "London Thames Barrier",
    "lat": 51.4977,
    "lng": 0.0369,
    "formatted_address": "London, United Kingdom",
    "country": "United Kingdom",
    "role": "reference"
  }
  ```
- **Response Code:** `201 Created`

---

## 4. Adaptation Compatibility & Evaluation Engine

### `POST /api/compatibility/score`
Calculates biophysical transferability without saving to database.

- **Request Body:**
  ```json
  {
    "lat_a": 18.5204,
    "lng_a": 73.8567,
    "name_a": "Pune",
    "lat_b": 19.0760,
    "lng_b": 72.8777,
    "name_b": "Mumbai",
    "adaptation_id": "rain-garden"
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "adaptation_id": "rain-garden",
    "adaptation_name": "Rain Garden",
    "category": "Urban Hydrology",
    "score": 88.5,
    "status": "SUITABLE",
    "factors": [
      {
        "name": "Temperature Similarity",
        "weight": 0.25,
        "score": 92.0,
        "explanation": "Temperature regimes are well matched (delta: 1.2°C)."
      },
      {
        "name": "Precipitation Similarity",
        "weight": 0.35,
        "score": 85.0,
        "explanation": "Precipitation levels within acceptable bio-retention thresholds."
      }
    ],
    "blockers": [],
    "recommendations": [
      {
        "type": "modification",
        "text": "Target receives 1300 mm/yr wetter precipitation. Recommended engineering adjustment: scale up detention and underdrain capacity by at least 25%."
      }
    ]
  }
  ```

---

### `POST /api/assessments/calculate`
Performs end-to-end evaluation with live NASA POWER fetching, runs the compatibility engine, persists the complete result in the SQLite `assessments` table, and returns the assessment with its unique ID.

- **Request Body:**
  ```json
  {
    "name_a": "Pune",
    "lat_a": 18.5204,
    "lng_a": 73.8567,
    "name_b": "Mumbai",
    "lat_b": 19.0760,
    "lng_b": 72.8777,
    "adaptation_id": "rain-garden"
  }
  ```

- **Response `200 OK`:**
  ```json
  {
    "assessment_id": 4,
    "status": "SUITABLE",
    "score": 88.5,
    "location_a": { "name": "Pune", "lat": 18.5204, "lng": 73.8567 },
    "location_b": { "name": "Mumbai", "lat": 19.0760, "lng": 72.8777 },
    "adaptation_id": "rain-garden",
    "compatibility": { /* Full compatibility payload */ },
    "ranked_adaptations": null,
    "data_quality": {
      "source": "NASA POWER MERRA-2 reanalysis",
      "note": "Data is model-derived at ~0.5° grid resolution. Not site-level measurement."
    }
  }
  ```

---

### `GET /api/assessments`
Retrieves paginated historical assessments.

- **Query Parameters:**
  - `page` (int, default: 1)
  - `per_page` (int, default: 20)

- **Response `200 OK`:**
  ```json
  {
    "total": 4,
    "page": 1,
    "per_page": 20,
    "items": [
      {
        "id": 4,
        "name_a": "Pune",
        "name_b": "Mumbai",
        "adaptation_id": "rain-garden",
        "overall_status": "SUITABLE",
        "compatibility_score": 88.5,
        "created_at": "2026-11-09T06:17:24"
      }
    ]
  }
  ```

---

### `GET /api/assessments/:id/export/csv`
Generates a downloadable CSV audit report containing factor weights, scores, and engineering recommendations.

- **Response Headers:**
  - `Content-Type: text/csv`
  - `Content-Disposition: attachment; filename=adaptfit_assessment_{id}.csv`

- **Sample CSV Output:**
  ```csv
  ADAPTFIT Assessment Export
  Location A,Pune,18.5204, 73.8567
  Location B,Mumbai,19.076, 72.8777
  Adaptation,rain-garden
  Overall Status,SUITABLE
  Compatibility Score,88.5

  Factor,Weight,Score,Explanation
  Temperature Similarity,0.25,92.0,Temperature regimes are well matched.
  Precipitation Similarity,0.35,85.0,Precipitation within bio-retention limits.
  Climate Zone Match,0.20,95.0,Both locations are tropical wet-and-dry.
  Rainfall Adequacy (Target),0.20,82.0,Precipitation satisfies minimum recharge requirement.
  ```

---

## 5. Satellite Registry Endpoints

### `GET /api/satellite/layers`
Returns all active Earth observation layers from NASA GIBS, ISRO Bhuvan, and ESA Copernicus.

- **Response `200 OK`:**
  ```json
  {
    "layers": [
      {
        "id": "nasa_gibs_modis_true_color",
        "name": "MODIS True Color (Terra)",
        "agency": "NASA",
        "source": "NASA GIBS (Global Imagery Browse Services)",
        "type": "WMS",
        "url": "https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi",
        "layer_name": "MODIS_Terra_CorrectedReflectance_TrueColor",
        "resolution": "250m per pixel",
        "update_frequency": "Daily",
        "license": "NASA Open Data"
      }
    ],
    "data_note": "These are real public WMS/data services from official government sources."
  }
  ```

---

## 6. Standard Error Responses

When an error occurs, the API returns a structured JSON payload:

```json
{
  "error": "Human-readable failure message",
  "details": {
    "field": "Optional specific validation breakdown"
  }
}
```

| HTTP Code | Condition |
|-----------|-----------|
| `400 Bad Request` | Missing required coordinates, coordinates out of geodetic bounds, invalid year range. |
| `404 Not Found` | Assessment or Saved Location ID does not exist in SQLite database. |
| `503 Service Unavailable` | NASA POWER reanalysis server unreachable and no cached record exists. |
| `500 Internal Error` | Unexpected backend runtime fault. Logged to server output. |

