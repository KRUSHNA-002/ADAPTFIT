# ADAPTFIT — Platform Setup & Deployment Guide

> **Right Adaptation. Right Place.**  
> Complete setup manual for developers, GIS analysts, and municipal deployment teams.

---

## 1. System Requirements

### Hardware Requirements
- **Memory:** 4 GB RAM minimum (8 GB recommended for concurrent GIS and Vite dev server).
- **Disk Space:** 500 MB free space (including Node modules and SQLite database).
- **Network:** Outbound HTTPS connection to NASA POWER API (`https://power.larc.nasa.gov`) and OpenStreetMap Nominatim (`https://nominatim.openstreetmap.org`).

### Software Prerequisites
- **Node.js:** v18.0.0 or higher
- **npm:** v9.0.0 or higher
- **Python:** v3.10, v3.11, v3.12, v3.13, or v3.14
- **pip:** Package installer for Python

---

## 2. Quickstart Installation (5 Minutes)

### Step 1: Clone or Navigate to Project
```bash
cd /Users/k_k/adaptfit_new
```

### Step 2: Environment Configuration
Create the environment files from the provided templates:
```bash
# In the project root
cp .env.example .env

# In the backend directory
cp backend/.env.example backend/.env
```

Review `.env`:
```env
# Optional: Google Maps JavaScript API key
# If left blank, ADAPTFIT seamlessly falls back to OpenStreetMap Nominatim geocoding!
VITE_GOOGLE_MAPS_API_KEY=

# Backend REST API target URL
VITE_API_URL=http://localhost:5001
```

Review `backend/.env`:
```env
FLASK_ENV=development
PORT=5001
SECRET_KEY=adaptfit-dev-secret-key-change-in-prod
DATABASE_URL=sqlite:///adaptfit.db
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173
```

---

### Step 3: Backend Setup & Launch
Open a terminal dedicated to the Python backend:

```bash
cd backend

# Install dependencies (use --break-system-packages if using Python managed environments on macOS/Linux)
pip3 install -r requirements.txt --break-system-packages

# Start the Flask API server
python3 app.py
```

**Expected Terminal Output:**
```
 * Serving Flask app 'app'
 * Debug mode: on
 * Running on http://127.0.0.1:5001
```
The SQLite database file `backend/instance/adaptfit.db` is initialized automatically on first startup.

---

### Step 4: Frontend Setup & Launch
Open a second terminal dedicated to the Vite frontend:

```bash
# In the project root (/Users/k_k/adaptfit_new)
npm install

# Start the Vite development server
npm run dev
```

**Expected Terminal Output:**
```
  VITE v6.4.5  ready in 220 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

Open your browser to `http://localhost:5173`.

---

## 3. Running Automated Tests

### Backend Automated Test Suite
Run the built-in end-to-end integration and verification suite:
```bash
python3 backend/test_suite.py
```
This tests:
1. Adaptation engine requirements for all 10 strategies.
2. Blocker override logic (e.g. aridity thresholds for rain gardens).
3. Flask endpoints (`/api/health`, `/api/satellite/layers`, `/api/locations`, `/api/assessments/calculate`, `/api/assessments/export/csv`).
4. SQLite persistence and cache hit rates.
5. Contract alignment between frontend IDs and backend data models.

### Frontend Production Build Verification
Test the production Vite compilation:
```bash
npm run build
```
Build outputs are written to the `dist/` directory.

---

## 4. Production Deployment Guidelines

### Backend Production Deployment (Gunicorn / Systemd)
For production environments, run Flask behind a WSGI HTTP server such as `gunicorn`:

```bash
pip3 install gunicorn
cd backend
gunicorn --bind 0.0.0.0:5001 --workers 4 "app:create_app()"
```

### Frontend Production Hosting (Nginx / Vercel / Netlify)
1. Build the production assets:
   ```bash
   npm run build
   ```
2. Serve the generated `dist/` folder via Nginx or any static hosting service.
3. Configure URL rewriting so that all routes fallback to `index.html` (for React Router support):

**Nginx Configuration Snippet:**
```nginx
server {
    listen 80;
    server_name adaptfit.example.org;

    root /var/www/adaptfit/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:5001/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 5. Troubleshooting & FAQ

### Q1: Google Maps shows "Development Mode" or error
- **Cause:** `VITE_GOOGLE_MAPS_API_KEY` is empty or has restricted HTTP referrers.
- **Resolution:** ADAPTFIT features an **automatic fallback mechanism**. If Google Maps is unavailable, simply use the built-in location search (powered by OpenStreetMap Nominatim) or select from the pre-configured global benchmarks (Pune, Mumbai, Rotterdam, London, Tokyo, New York).

### Q2: NASA POWER API timeout or slow response
- **Cause:** NASA POWER servers process complex reanalysis grids on the fly.
- **Resolution:** ADAPTFIT caches all queries in SQLite (`climate_cache` table) for 7 days. Once a city is queried once, subsequent loads are instantaneous (<5ms).

### Q3: How do I backup or reset saved assessments?
- **Database Location:** `backend/instance/adaptfit.db`
- **Backup:** Copy `adaptfit.db` to a safe storage location.
- **Reset:** Stop the backend, delete `backend/instance/adaptfit.db`, and restart `python3 app.py`. Tables will be recreated automatically.

