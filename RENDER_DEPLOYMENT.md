# ADAPTFIT — Render Deployment Guide

This guide details how to deploy the ADAPTFIT Planetary Resilience Engine to [Render](https://render.com) for production.

---

## Architecture Overview

| Component | Render Service Type | Runtime | Build Command | Start Command / Publish Directory |
|---|---|---|---|---|
| **Backend API** | Web Service | Python | `pip install -r requirements.txt` | `gunicorn wsgi:app` |
| **Frontend Web** | Static Site | Node / Static | `npm install && npm run build` | `dist` |

---

## Option 1: One-Click Blueprint Deployment (Recommended)

ADAPTFIT includes a pre-configured [`render.yaml`](./render.yaml) file at the root of the repository.

1. Push your repository to **GitHub** or **GitLab**.
2. Log into the [Render Dashboard](https://dashboard.render.com).
3. Click **New +** → **Blueprint**.
4. Select your ADAPTFIT repository and click **Connect**.
5. Render will automatically detect `render.yaml` and provision both:
   - `adaptfit-api` (Flask Backend Web Service)
   - `adaptfit-web` (React Vite Static Site)
6. Click **Apply**. Render will automatically link the backend's URL to `VITE_API_URL` on the frontend.

---

## Option 2: Step-by-Step Manual Setup

### Step 1: Deploy the Flask Backend (`adaptfit-api`)

1. In Render Dashboard, click **New +** → **Web Service**.
2. Connect your repository.
3. Configure settings:
   - **Name:** `adaptfit-api`
   - **Region:** Any (e.g. Oregon, Frankfurt, Singapore)
   - **Root Directory:** `backend`
   - **Runtime:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn wsgi:app`
   - **Plan:** Free
4. **Environment Variables:**
   | Variable | Recommended Value | Description |
   |---|---|---|
   | `PYTHON_VERSION` | `3.11.9` | Recommended Python runtime |
   | `SECRET_KEY` | *(Generate a secure random string)* | Session & crypto integrity |
   | `CORS_ORIGINS` | `*` (or your static site URL) | Allows browser requests from the frontend |
   | `DATABASE_URL` | `sqlite:///adaptfit.db` *(or see Persistent Database below)* | Database connection URI |
   | `HISTORICAL_CACHE_TTL_HOURS` | `168` | Cache duration for NASA queries (7 days) |
   | `FORECAST_CACHE_TTL_HOURS` | `6` | Cache duration for weather forecast queries |
5. **Health Check Path:**
   - Under *Advanced*, set **Health Check Path** to `/api/health`.
6. Click **Create Web Service**.
7. Once deployed, copy your backend URL (e.g., `https://adaptfit-api.onrender.com`).

---

### Step 2: Database Persistence Options

By default, Render's Free web services have an ephemeral filesystem: restarting or redeploying the service resets the local SQLite database. To permanently preserve assessment histories and cached climate records, choose one of these two options:

#### Option A: Free Managed PostgreSQL (Zero Ephemeral Risk)
1. On the Render Dashboard, click **New +** → **PostgreSQL**.
2. Name: `adaptfit-db`, Plan: `Free`.
3. Under the `adaptfit-api` Web Service, add the environment variable:
   - `DATABASE_URL`: Paste the Internal Database URL from your database dashboard.
   *(SQLAlchemy automatically handles table initialization on the first boot).*

#### Option B: Render Persistent Disk (SQLite)
1. Under your `adaptfit-api` Web Service settings, scroll to **Disks** → **Add Disk**.
2. Name: `adaptfit-data`, Mount Path: `/var/data`, Size: `1 GB`.
3. In Environment Variables, set:
   - `DATABASE_URL`: `sqlite:////var/data/adaptfit.db`

---

### Step 3: Deploy the React Frontend (`adaptfit-web`)

1. In Render Dashboard, click **New +** → **Static Site**.
2. Connect the same repository.
3. Configure settings:
   - **Name:** `adaptfit-web`
   - **Branch:** `main` (or your branch)
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
4. **Environment Variables:**
   | Variable | Value | Description |
   |---|---|---|
   | `VITE_API_URL` | `https://adaptfit-api.onrender.com` | URL of your deployed backend service from Step 1 |
5. **Single-Page Application (SPA) Redirects:**
   - Under **Redirects / Rewrites**, verify:
     - **Type:** `Rewrite`
     - **Source:** `/*`
     - **Destination:** `/index.html`
   *(Note: ADAPTFIT also includes `public/_redirects` which automatically handles client-side routing).*
6. Click **Create Static Site**.

---

## Verification & Health Check

1. **Verify Backend Health:**
   ```bash
   curl -s https://adaptfit-api.onrender.com/api/health | jq .
   ```
   Expected response:
   ```json
   {
     "data_sources": [
       "NASA POWER (free, no key required)",
       "Open-Meteo (free, no key required)"
     ],
     "project": "ADAPTFIT",
     "status": "ok",
     "version": "3.0.0"
   }
   ```

2. **Verify Frontend Application:**
   - Open your frontend URL in the browser (e.g., `https://adaptfit-web.onrender.com`).
   - Navigate to **Worldwide Map Explorer** (`/explore-map`). Confirm OpenStreetMap and Leaflet pins load without errors.
   - Run a test **Climate Assessment** (`/assessments`) with benchmark locations (Pune → Mumbai).
   - Verify that NASA POWER data loads, factor breakdown renders, and CSV reports can be downloaded.

---

## Free Tier Notes

- On Render's Free tier, Web Services spin down after 15 minutes of inactivity. The first request after spindown may take ~30–50 seconds to boot up.
- NASA POWER API is free and requires zero credentials.
- Leaflet & OpenStreetMap tiles are served directly from open tile servers with zero billing dependencies.

