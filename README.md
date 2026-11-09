# ADAPTFIT

> **Right Adaptation. Right Place.**  
> A professional, data-driven climate adaptation compatibility decision-support platform.

---

## 🌍 Overview

**ADAPTFIT** determines whether a nature-based climate adaptation strategy that functions successfully in **Reference Location A** is environmentally suitable for transfer to **Target Location B**, evaluates biophysical deltas, identifies critical blockers, and generates actionable, transparent engineering recommendations.

Unlike tools that rely on fabricated estimates or black-box predictions, ADAPTFIT is powered by **real-world meteorological reanalysis data from NASA POWER**, **ISRO Bhuvan** and **NASA GIBS** geospatial satellite layers, an explainable **Adaptation Compatibility Engine**, a **Python Flask backend**, and an **SQLite** database.

---

## 🏛️ Platform Architecture

```
                    ┌──────────────────────────────────────────┐
                    │      React + Vite Frontend (Port 5173)   │
                    │   7 Specialized SaaS Multi-Page Modules   │
                    └─────────────────────┬────────────────────┘
                                          │ REST API (JSON)
                                          ▼
                    ┌──────────────────────────────────────────┐
                    │         Flask Backend (Port 5001)        │
                    │   CORS Enabled • SQLAlchemy ORM • SQLite  │
                    └───┬─────────────┬─────────────┬──────────┘
                        │             │             │
        ┌───────────────┴────┐ ┌──────┴──────┐ ┌────┴────────────────┐
        │  NASA POWER API    │ │  SQLite DB  │ │ Geospatial Registry │
        │  MERRA-2 Reanalysis│ │ Cache & CRUD│ │ ISRO Bhuvan, GIBS,  │
        │  (Free, No Key)    │ │ adaptfit.db │ │ Copernicus DEM      │
        └────────────────────┘ └─────────────┘ └─────────────────────┘
```

---

## 🚀 7 Dedicated Modules

1. **Home (`/`)**: Climate-tech landing page with scenic nature background, core platform metrics, and module launchers.
2. **Adaptations (`/adaptations`)**: Interactive catalog of 10 nature-based adaptation options with technical specifications, environmental criteria, and direct assessment triggers.
3. **Explore Map (`/explore-map`)**: Interactive worldwide location explorer powered by Leaflet and OpenStreetMap (100% free, zero billing/keys required), featuring 4 tile styles (OSM Standard, Esri World Imagery Satellite, OpenTopoMap, Carto Voyager), dual-marker pins (Emerald Ref A & Sky Blue Target B), OpenStreetMap Nominatim forward/reverse geocoding, 9 verified global presets, geodesic distance, initial bearing compass, and SQLite database persistence.
4. **Climate Memory (`/climate-memory`)**: Five-decade historical climate analysis powered by NASA POWER with Recharts visualizations, temperature/rainfall trends, 20-year monthly climatology, and sensitivity stress-testing scenarios.
5. **Satellite Intelligence (`/satellite-intelligence`)**: Multi-agency Earth observation registry (ISRO Bhuvan, NASA GIBS, Copernicus) detailing spatial resolution, sensor bands, update cadence, and documented limitations.
6. **Assessments (`/assessments`)**: Decision-support compatibility engine computing biophysical suitability scores (SUITABLE, CONDITIONAL, UNSUITABLE, INSUFFICIENT DATA), factor breakdowns, critical blockers, recommendations, and CSV report export.
7. **About (`/about`)**: Architecture doctrine, passive thermodynamic principles, living asset frameworks, and engineering standards.

---

## 🌿 10 Vetted Adaptation Options

| # | Adaptation | Category | Primary Focus |
|---|------------|----------|---------------|
| 1 | **Rain Garden** | Urban Hydrology | Runoff bio-retention & groundwater recharge |
| 2 | **Permeable Pavement** | Sustainable Drainage | Subterranean gravel storage & sheet-flow elimination |
| 3 | **Green Roof** | Urban Green Infrastructure | Rooftop thermal insulation & storm delay |
| 4 | **Urban Tree Planting** | Urban Heat Mitigation | Street canyon shading & rainfall interception |
| 5 | **Wetland Restoration** | Flood Management | Macro flood storage & blue carbon accumulation |
| 6 | **Bioswales** | Sustainable Drainage | Velocity dissipation & suspended sediment filtration |
| 7 | **Detention / Retention Ponds** | Flood Management | 100-year peak hydrograph attenuation |
| 8 | **Cool Roofs** | Urban Heat Mitigation | High-albedo solar reflectance (-28°C surface drop) |
| 9 | **Urban Green Corridors** | Urban Green Infrastructure | Microclimate ventilation & ecological connectivity |
| 10 | **Floodplain Restoration** | Floodplain Restoration | River room & downstream flood crest lowering |

---

## ⚡ Quick Start (Local Development)

### Prerequisites
- **Node.js** v18+ and **npm**
- **Python** 3.10+ and **pip**

### Step 1: Start the Flask Backend
In your first terminal window:
```bash
# In the project root (adaptfit_new)
cd backend
pip3 install -r requirements.txt
python3 app.py
```
- Backend runs on `http://127.0.0.1:5001`.
- Health check available at `http://127.0.0.1:5001/api/health`.
- SQLite database (`instance/adaptfit.db`) initializes automatically with all required schemas (`saved_locations`, `assessments`, `climate_cache`).

### Step 2: Start the React Frontend
In a second terminal window:
```bash
# In the project root (adaptfit_new)
npm install
npm run dev
```
- Frontend starts at `http://localhost:3000` (or `http://localhost:3001`).
- The Vite development server automatically proxies all `/api/*` requests directly to `http://127.0.0.1:5001`.
- Zero manual proxy or backend URL configuration is required for local development.

---

## 🔑 Environment Configuration

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

| Variable | Description | Default | Required? |
|----------|-------------|---------|-----------|
| `VITE_API_URL` | Backend REST endpoint | `/api` (local proxy) or `http://127.0.0.1:5001` | Optional (defaults to auto-proxy) |
| `SECRET_KEY` | Flask session secret | `dev-key-adaptfit-change-in-prod` | Recommended in production |
| `DATABASE_URL` | PostgreSQL or SQLite URI | `sqlite:///adaptfit.db` | Optional |

> **Zero Paid API Keys Required:**
> - Geospatial mapping runs on **Leaflet + OpenStreetMap** (100% free, zero billing/keys).
> - Climate data is powered by **NASA POWER MERRA-2 API** (free, no API key under NASA Open Data policy) with an **Open-Meteo** fallback.
> - Geocoding runs on **OpenStreetMap Nominatim** (free, open-access).

---

## 🧪 Testing & Verification

Run the full end-to-end verification suite:

```bash
# 1. Run all 5 Flask Backend integration test suites
python3 backend/test_suite.py

# 2. Run frontend production build verification
npm run build
```

The backend test suite executes:
1. **Engine Logic:** All 10 registered adaptations, constraint triggers, blocker alerts, and comparative rankings.
2. **Flask Routes:** `/api/health`, `/api/satellite/layers`, `/api/locations`, `/api/assessments/calculate`, and `/api/assessments/{id}/export/csv`.
3. **Compatibility API:** Real coordinate assessment scoring and recommendations.
4. **Database Persistence:** SQLite schema verification, CRUD operations, and cache longevity.
5. **Contract Alignment:** Strict frontend-to-backend adaptation identifier mapping.

---

## 🌐 Production Deployment (Render)

ADAPTFIT is pre-configured for automated one-click deployment on **Render**:

1. **Blueprint Deployment (`render.yaml`):**
   - Push this repository to GitHub.
   - On the [Render Dashboard](https://dashboard.render.com), click **New +** → **Blueprint**.
   - Select your repository. Render automatically reads `render.yaml` and provisions:
     - `adaptfit-api`: Python Web Service running `gunicorn backend.wsgi:app`.
     - `adaptfit-web`: Static Site building with `npm run build` from `dist/` with SPA routing rewrite (`/* -> /index.html 200`).

2. **Manual Web Service + Static Site:**
   - See detailed step-by-step instructions in [RENDER_DEPLOYMENT.md](file:///Users/k_k/adaptfit_new/RENDER_DEPLOYMENT.md).

---

## 🛰️ Real Data Sources & Documented Limitations

| Data Layer | Source Agency | Access Status | Limitations & Notes |
|---|---|---|---|
| **Meteorological Reanalysis** | NASA POWER MERRA-2 | ✅ Active (Free, No Key) | ~0.5° spatial grid resolution; aggregated over 20-year monthly baselines. |
| **Backup Meteorological Data** | Open-Meteo API | ✅ Active (Free, No Key) | Global numerical weather prediction fallback. |
| **Worldwide Geospatial Tiles** | OpenStreetMap, Esri, Carto, OpenTopoMap | ✅ Active (Free, No Key) | Standard web-mercator raster tiles. |
| **Forward & Reverse Geocoding** | OpenStreetMap Nominatim | ✅ Active (Free, No Key) | Respect 1 request/sec rate limit; cached locally. |
| **Satellite Intelligence Registry** | ISRO Bhuvan, NASA GIBS, Copernicus | ℹ️ Catalog Available | Educational & technical telemetry metadata. Programmatic access to raw ISRO Bhuvan GeoTIFF/WMS tiles requires official organizational credentials. |

---

## ⚖️ Scientific Disclaimer

ADAPTFIT is an engineering screening and decision-support tool. Compatibility scores represent macro-scale biophysical suitability calculated from grid-averaged reanalysis (~0.5° resolution). On-site geotechnical infiltration testing, groundwater depth verification, and local stormwater utility surveys are strictly required prior to capital deployment.

