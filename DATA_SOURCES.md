# ADAPTFIT — Data Sources & Scientific Lineage Reference

> **Right Adaptation. Right Place.**  
> Comprehensive documentation of environmental datasets, Earth observation services, reanalysis grids, geocoders, licensing, and limitations used by the ADAPTFIT platform.

---

## 1. Executive Summary of Environmental Integrity

ADAPTFIT is built on the strict principle that **no climate data, geographical metrics, or satellite layers are ever fabricated**. Every calculation, chart, map marker, and suitability score draws directly from authoritative, publicly documented scientific repositories or geodetic services.

| Data Domain | Primary Provider | Integration Method | API Key Requirement | Spatial Resolution | Temporal Coverage |
|-------------|------------------|--------------------|---------------------|--------------------|-------------------|
| **Meteorological Reanalysis** | NASA POWER (MERRA-2 / GEOS-5.12.4) | REST JSON API (Direct & Cached) | Free / None required | 0.5° × 0.625° latitude/longitude | 1981–present (Monthly & Climatology) |
| **Geospatial Basemaps** | Google Maps JavaScript API | Dynamic Web SDK | Optional (`VITE_GOOGLE_MAPS_API_KEY`) | Global vector & satellite | Real-time |
| **Open Geocoding Fallback** | OpenStreetMap Nominatim | REST JSON API | Free / None required (OSM Fair Use) | Global point & address level | Dynamic OpenStreetMap database |
| **Optical Satellite Imagery** | NASA GIBS (MODIS Terra) | OGC Web Map Service (WMS) | Free / None required | 250m per pixel | Daily updates (2000–present) |
| **Vegetation Health (NDVI)** | NASA GIBS (MODIS NDVI) | OGC Web Map Service (WMS) | Free / None required | 250m per pixel | 8-day / 16-day composites |
| **National Land Use / Land Cover** | ISRO NRSC Bhuvan | OGC WMS (India EPSG:4326) | Free / Portal registration | 1:50,000 scale (~24m equivalent) | Periodic cycles |
| **Surface Waterbodies** | ISRO NRSC Bhuvan | OGC WMS (India EPSG:4326) | Free / Portal registration | Variable water-spread polygon | Multi-temporal satellite passes |
| **Digital Elevation Model (DEM)** | Copernicus GLO-30 (ESA) | Cloud-Optimized GeoTIFF (COG) | Free / Open Topography | 30m grid cell resolution | Static reference (2021 release) |

---

## 2. NASA POWER (Prediction of Worldwide Energy Resources)

### 2.1 Overview & Agency
- **Provider:** National Aeronautics and Space Administration (NASA) Langley Research Center.
- **Model Framework:** Modern-Era Retrospective analysis for Research and Applications, Version 2 (MERRA-2) assimilation model and Goddard Earth Observing System (GEOS-5.12.4) atmospheric data assimilation system.
- **Official Documentation:** [https://power.larc.nasa.gov/docs/](https://power.larc.nasa.gov/docs/)
- **API Endpoint:** `https://power.larc.nasa.gov/api/temporal/`

### 2.2 Parameters Queried in ADAPTFIT
| NASA POWER Code | Parameter Name | Units | Use in ADAPTFIT |
|-----------------|----------------|-------|-----------------|
| `T2M` | Temperature at 2 Meters | °C | Historical temperature trends, annual means, baseline similarity |
| `T2M_MAX` | Maximum Temperature at 2 Meters | °C | Heat stress thresholds, cool roof thermal delta, urban tree tolerance |
| `T2M_MIN` | Minimum Temperature at 2 Meters | °C | Frost tolerance, bioswale freezing depth, perennial survival |
| `PRECTOTCORR` | Precipitation Corrected | mm/day or mm/yr | Stormwater loading, rain garden adequacy, retention volume sizing |
| `RH2M` | Relative Humidity at 2 Meters | % | Evapotranspirative potential, urban heat island dampening |
| `WS10M` | Wind Speed at 10 Meters | m/s | Microclimate ventilation, green corridor convective cooling |

### 2.3 Licensing & Access
- **License:** Open data under NASA Data Rights Policy and Creative Commons Zero (CC0) / Public Domain.
- **Authentication:** Completely open. No authentication tokens, client secrets, or subscription fees required.
- **Fair Use Policy:** Requests are batched and cached in ADAPTFIT's SQLite database (`climate_cache` table) with configurable TTL (default 168 hours / 7 days) to minimize load on NASA servers.

### 2.4 Documented Scientific Limitations
1. **Grid Resolution (~50 km):** Data points represent the centroid of a 0.5° × 0.625° reanalysis cell. Local microclimates (e.g., coastal sea breezes, urban canyons, steep mountain leeward rain shadows) are smoothed.
2. **Reanalysis vs. In-Situ:** Values are assimilated atmospheric model outputs calibrated against weather balloons and satellites, not ground-level rain gauge measurements.
3. **Latency:** Reanalysis finalized data typically lags real-time by 1 to 2 months.

---

## 3. Earth Observation & Satellite Layers (GIS Registry)

### 3.1 NASA GIBS (Global Imagery Browse Services)
- **Host:** NASA Earth Science Data and Information System (ESDIS) Project.
- **Base Endpoint:** `https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi`
- **Layers Integrated:**
  - `MODIS_Terra_CorrectedReflectance_TrueColor`: Natural-color optical imagery (Bands 1, 4, 3) at 250m resolution.
  - `MODIS_Terra_NDVI_8Day`: Normalized Difference Vegetation Index tracking photosynthetic activity and urban canopy vigor.
- **Attribution:** NASA GIBS / NASA EOSDIS.

### 3.2 ISRO Bhuvan (National Remote Sensing Centre)
- **Host:** Indian Space Research Organisation (ISRO), Department of Space, Government of India.
- **Base Endpoint:** `https://bhuvan-vec1.nrsc.gov.in/bhuvan/wms`
- **Layers Integrated:**
  - `LULC50K`: National Land Use / Land Cover mapping at 1:50,000 scale classifying urban settlements, agricultural zones, wetlands, and wasteland.
  - `waterbodies`: Mapped surface waterbodies across all Indian basins.
- **Attribution:** NRSC, ISRO, Government of India Open Data License v1.0.
- **Note:** Bhuvan spatial coverage is restricted to the territorial boundary and EEZ of India. Direct WMS tile requests may require an authorized session or portal API key from `bhuvan.nrsc.gov.in`.

### 3.3 Copernicus Digital Elevation Model (ESA)
- **Host:** European Space Agency (ESA) & Airbus Defence and Space.
- **Dataset:** Copernicus DEM GLO-30 (Global 30m Digital Surface Model).
- **Access Protocol:** Cloud-Optimized GeoTIFF (COG) via OpenTopography and AWS Open Data Registry.
- **Application:** Slope analysis, watershed delineation, flood inundation modeling for detention ponds and floodplain restoration.
- **Attribution:** European Space Agency - ESA (2021), Copernicus DEM.

---

## 4. Geocoding & Worldwide Spatial Services

### 4.1 Google Places & Geocoding API
- **Implementation:** Integrated via `@googlemaps/js-api-loader` in `ExploreMapPage` and `useGoogleMaps` hook.
- **Functionality:** Autocomplete search input, reverse geocoding from map clicks, precise bounds fitting, and coordinate extraction.
- **API Key Security:** Controlled via `.env` (`VITE_GOOGLE_MAPS_API_KEY`).

### 4.2 OpenStreetMap Nominatim Fallback
- **Implementation:** Zero-configuration fallback activated automatically when no Google API key is configured or when quota is exceeded.
- **Endpoint:** `https://nominatim.openstreetmap.org/search`
- **Data Source:** OpenStreetMap contributors (ODbL License).
- **Compliance:** Includes dedicated `User-Agent: ADAPTFIT/3.0.0` header and client-side debouncing (400ms) conforming strictly to OSM Nominatim Usage Policy.

---

## 5. Data Privacy & Integrity Guarantees

1. **No Data Fabrication:** Under no circumstances does ADAPTFIT simulate or fabricate fake climate numbers. If NASA POWER is temporarily unreachable and no cached record exists, the system reports `503 Service Unavailable` with transparent diagnostics.
2. **Zero Client Secret Exposure:** All external API orchestration, database mutations, and secret configurations remain on the backend or in local environment variables.
3. **Local Database Sovereignty:** All assessments and user-saved benchmark coordinates are stored locally in the instance's SQLite database (`adaptfit.db`), ensuring privacy for municipal planning teams.

