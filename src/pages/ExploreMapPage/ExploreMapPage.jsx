import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import {
  MapPin,
  Compass,
  ArrowRightLeft,
  Layers,
  Maximize2,
  Navigation,
  Search,
  X,
  AlertTriangle,
  Sparkles,
  Info,
  Crosshair,
  ExternalLink,
  Loader2,
  Calculator,
  Clock,
  Database,
  CheckCircle2,
  ArrowRight,
  Globe,
  Check,
} from 'lucide-react';
import Breadcrumbs from '../../components/Breadcrumbs/Breadcrumbs';
import { useAdaptations } from '../../context/AdaptationsContext';
import { locationApi } from '../../api/locationApi';
import {
  createAdaptfitLocation,
  parseNominatimResult,
  computeGeodesicDistance,
  computeInitialBearing,
} from '../../utils/locationTypes';
import './ExploreMapPage.css';

// ─── OpenStreetMap & Compatible Free Tile Layers ──────────────────────────────
const TILE_LAYERS = [
  {
    id: 'streets',
    label: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
    maxZoom: 19,
  },
  {
    id: 'satellite',
    label: 'Satellite (Esri)',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP',
    maxZoom: 18,
  },
  {
    id: 'topo',
    label: 'Terrain Topo',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> | Style &copy; <a href="https://opentopomap.org" target="_blank" rel="noreferrer">OpenTopoMap</a>',
    maxZoom: 17,
  },
  {
    id: 'dark',
    label: 'Dark Gray Canvas',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
    maxZoom: 16,
  },
];

// Click-mode options
const CLICK_MODES = [
  { id: 'A', label: 'Set Ref A', color: '#10b981' },
  { id: 'B', label: 'Set Target B', color: '#38bdf8' },
];

// Verified benchmark locations with real coordinates
const VERIFIED_BENCHMARKS = [
  { name: 'Pune, Maharashtra', country: 'India', lat: 18.5204, lng: 73.8567, region: 'Maharashtra' },
  { name: 'Mumbai Coastal Delta', country: 'India', lat: 18.9220, lng: 72.8347, region: 'Maharashtra' },
  { name: 'Rotterdam Rhine Delta', country: 'Netherlands', lat: 51.9244, lng: 4.4777, region: 'South Holland' },
  { name: 'Bengaluru Highland Basin', country: 'India', lat: 12.9716, lng: 77.5946, region: 'Karnataka' },
  { name: 'London Thames Basin', country: 'United Kingdom', lat: 51.5074, lng: -0.1278, region: 'Greater London' },
  { name: 'Tokyo Bay Delta', country: 'Japan', lat: 35.6762, lng: 139.6503, region: 'Kanto' },
  { name: 'New York Coastal Plain', country: 'United States', lat: 40.7128, lng: -74.0060, region: 'New York' },
  { name: 'Valencia Turia Basin', country: 'Spain', lat: 39.4699, lng: -0.3763, region: 'Valencia' },
  { name: 'Nairobi Highland', country: 'Kenya', lat: -1.2921, lng: 36.8219, region: 'Nairobi' },
];

// Leaflet custom SVG marker icons
function createLeafletPinIcon(color, label) {
  return L.divIcon({
    className: 'adaptfit-leaflet-pin',
    html: `
      <div style="filter: drop-shadow(0 4px 8px rgba(0,0,0,0.6));">
        <svg xmlns="http://www.w3.org/2000/svg" width="38" height="50" viewBox="0 0 38 50">
          <path d="M19 0C8.507 0 0 8.507 0 19c0 14.25 19 31 19 31S38 33.25 38 19C38 8.507 29.493 0 19 0z" fill="${color}" stroke="#ffffff" stroke-width="1.5"/>
          <circle cx="19" cy="18" r="8.5" fill="#ffffff" opacity="0.95"/>
          <text x="19" y="22" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="900" fill="${color}">${label}</text>
        </svg>
      </div>
    `,
    iconSize: [38, 50],
    iconAnchor: [19, 50],
    popupAnchor: [0, -48],
  });
}

const iconA = createLeafletPinIcon('#10b981', 'A');
const iconB = createLeafletPinIcon('#38bdf8', 'B');

// Leaflet Map Click Handler Subcomponent
function MapClickHandler({ clickMode, onMapClick }) {
  useMapEvents({
    click: (e) => {
      if (clickMode) {
        onMapClick(e.latlng, clickMode);
      }
    },
  });
  return null;
}

// Leaflet Map Camera Controller Subcomponent
function MapCameraController({ centerTarget, boundsTarget, triggerKey }) {
  const map = useMap();

  useEffect(() => {
    if (boundsTarget && boundsTarget.length === 2) {
      map.fitBounds(boundsTarget, { padding: [60, 60], maxZoom: 13, animate: true });
    } else if (centerTarget) {
      map.setView(centerTarget, 10, { animate: true });
    }
  }, [map, centerTarget, boundsTarget, triggerKey]);

  return null;
}

export default function ExploreMapPage() {
  const navigate = useNavigate();
  const {
    adaptations,
    openAdaptationById,
    mapLocationA,
    setMapLocationA,
    mapLocationB,
    setMapLocationB,
  } = useAdaptations();

  // Selected tile layer (defaults to standard OpenStreetMap)
  const [activeLayerId, setActiveLayerId] = useState('streets');
  const activeTileLayer = useMemo(
    () => TILE_LAYERS.find((l) => l.id === activeLayerId) || TILE_LAYERS[0],
    [activeLayerId]
  );

  // Click-mode: null | 'A' | 'B'
  const [clickMode, setClickMode] = useState(null);

  // Geocoding and search state
  const [geocodeError, setGeocodeError] = useState('');
  const [geocodingRole, setGeocodingRole] = useState(null); // 'A' | 'B' | null

  // Search input text values
  const [searchTextA, setSearchTextA] = useState(mapLocationA?.name || '');
  const [searchTextB, setSearchTextB] = useState(mapLocationB?.name || '');

  // Camera animation triggers
  const [cameraCenter, setCameraCenter] = useState(null);
  const [cameraBounds, setCameraBounds] = useState(null);
  const [cameraTriggerKey, setCameraTriggerKey] = useState(0);

  // DB save feedback
  const [saveDbStatus, setSaveDbStatus] = useState(null); // null | 'saving' | 'saved' | 'error'
  const [saveDbMsg, setSaveDbMsg] = useState('');

  // Synchronize search text when context locations change externally
  useEffect(() => {
    if (mapLocationA?.name && !searchTextA) {
      setSearchTextA(mapLocationA.name);
    }
  }, [mapLocationA]);

  useEffect(() => {
    if (mapLocationB?.name && !searchTextB) {
      setSearchTextB(mapLocationB.name);
    }
  }, [mapLocationB]);

  // ─── Computed distance + bearing ────────────────────────────────────────────
  const distanceData = useMemo(() => {
    if (!mapLocationA || !mapLocationB) return null;
    return computeGeodesicDistance(mapLocationA.coordinates, mapLocationB.coordinates);
  }, [mapLocationA, mapLocationB]);

  const bearingData = useMemo(() => {
    if (!mapLocationA || !mapLocationB) return null;
    return computeInitialBearing(mapLocationA.coordinates, mapLocationB.coordinates);
  }, [mapLocationA, mapLocationB]);

  // ─── Apply location to state ───────────────────────────────────────────────
  const applyLocation = useCallback(
    (loc, role) => {
      if (role === 'A') {
        setMapLocationA(loc);
        setSearchTextA(loc.name);
      } else {
        setMapLocationB(loc);
        setSearchTextB(loc.name);
      }

      // Center map on newly selected location
      setCameraBounds(null);
      setCameraCenter([loc.coordinates.lat, loc.coordinates.lng]);
      setCameraTriggerKey((k) => k + 1);
    },
    [setMapLocationA, setMapLocationB]
  );

  // ─── OpenStreetMap Nominatim Forward Search ─────────────────────────────────
  const handleNominatimSearch = async (query, role) => {
    if (!query || !query.trim()) return;
    setGeocodingRole(role);
    setGeocodeError('');
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query.trim()
        )}&addressdetails=1&limit=1`,
        { headers: { Accept: 'application/json' } }
      );
      const data = await res.json();
      if (data && data.length > 0) {
        const loc = parseNominatimResult(data[0], role === 'A' ? 'reference' : 'target');
        if (loc) {
          applyLocation(loc, role);
        } else {
          setGeocodeError(`Could not parse coordinates for "${query}".`);
        }
      } else {
        setGeocodeError(`No open geocoding results found for "${query}". Please check the spelling.`);
      }
    } catch (err) {
      setGeocodeError('Geocoding search failed: ' + (err.message || 'Network error'));
    } finally {
      setGeocodingRole(null);
    }
  };

  // ─── Reverse Geocode on Map Click ───────────────────────────────────────────
  const handleMapClick = async (latlng, role) => {
    setClickMode(null);
    setGeocodingRole(role);
    setGeocodeError('');

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}&zoom=14&addressdetails=1`,
        { headers: { Accept: 'application/json' } }
      );
      const data = await res.json();
      if (data && !data.error) {
        const loc = parseNominatimResult(data, role === 'A' ? 'reference' : 'target');
        if (loc) {
          applyLocation(loc, role);
          return;
        }
      }
      // Fallback coordinate location if reverse geocoding has no address details (e.g. marine/water basin)
      const loc = createAdaptfitLocation({
        id: role === 'A' ? 'loc_a' : 'loc_b',
        role: role === 'A' ? 'reference' : 'target',
        name: `${latlng.lat.toFixed(4)}°, ${latlng.lng.toFixed(4)}°`,
        formattedAddress: `Coordinates: ${latlng.lat.toFixed(6)}°, ${latlng.lng.toFixed(6)}°`,
        lat: latlng.lat,
        lng: latlng.lng,
      });
      applyLocation(loc, role);
    } catch (err) {
      // In case of network glitch, preserve coordinates
      const loc = createAdaptfitLocation({
        id: role === 'A' ? 'loc_a' : 'loc_b',
        role: role === 'A' ? 'reference' : 'target',
        name: `${latlng.lat.toFixed(4)}°, ${latlng.lng.toFixed(4)}°`,
        formattedAddress: `Coordinates: ${latlng.lat.toFixed(6)}°, ${latlng.lng.toFixed(6)}°`,
        lat: latlng.lat,
        lng: latlng.lng,
      });
      applyLocation(loc, role);
    } finally {
      setGeocodingRole(null);
    }
  };

  // ─── Verified Benchmark Selection ────────────────────────────────────────────
  const handleSelectBenchmark = (item, role) => {
    const loc = createAdaptfitLocation({
      id: role === 'A' ? 'loc_a' : 'loc_b',
      role: role === 'A' ? 'reference' : 'target',
      name: item.name,
      formattedAddress: `${item.name}, ${item.country}`,
      lat: item.lat,
      lng: item.lng,
      addressComponents: { country: item.country, administrativeAreaLevel1: item.region },
    });
    applyLocation(loc, role);
  };

  // ─── Swap Locations ─────────────────────────────────────────────────────────
  const handleSwap = () => {
    const tempA = mapLocationA;
    const tempB = mapLocationB;
    setMapLocationA(tempB);
    setMapLocationB(tempA);
    setSearchTextA(tempB?.name || '');
    setSearchTextB(tempA?.name || '');
    if (tempB) {
      setCameraCenter([tempB.coordinates.lat, tempB.coordinates.lng]);
      setCameraTriggerKey((k) => k + 1);
    }
  };

  // ─── Clear Location ─────────────────────────────────────────────────────────
  const handleClear = (role) => {
    if (role === 'A') {
      setMapLocationA(null);
      setSearchTextA('');
    } else {
      setMapLocationB(null);
      setSearchTextB('');
    }
    setGeocodeError('');
  };

  // ─── Zoom Camera Controls ───────────────────────────────────────────────────
  const handleZoomBoth = () => {
    if (mapLocationA && mapLocationB) {
      setCameraCenter(null);
      setCameraBounds([
        [mapLocationA.coordinates.lat, mapLocationA.coordinates.lng],
        [mapLocationB.coordinates.lat, mapLocationB.coordinates.lng],
      ]);
      setCameraTriggerKey((k) => k + 1);
    } else if (mapLocationA) {
      handleZoomTo(mapLocationA);
    } else if (mapLocationB) {
      handleZoomTo(mapLocationB);
    }
  };

  const handleZoomTo = (location) => {
    if (!location) return;
    setCameraBounds(null);
    setCameraCenter([location.coordinates.lat, location.coordinates.lng]);
    setCameraTriggerKey((k) => k + 1);
  };

  const toggleClickMode = (mode) => {
    setClickMode((prev) => (prev === mode ? null : mode));
  };

  // ─── Save Location Pair to SQLite Database ──────────────────────────────────
  const handleSaveToDatabase = async () => {
    if (!mapLocationA || !mapLocationB) return;
    setSaveDbStatus('saving');
    setSaveDbMsg('');
    try {
      const [savedA, savedB] = await Promise.all([
        locationApi.save(mapLocationA),
        locationApi.save(mapLocationB),
      ]);
      if (savedA?.id && savedB?.id) {
        await locationApi.saveComparison(
          savedA.id,
          savedB.id,
          `Geodesic distance: ${distanceData?.km || 'N/A'} km`
        );
      }
      setSaveDbStatus('saved');
      setSaveDbMsg('Location pair saved to SQLite database successfully!');
      setTimeout(() => setSaveDbStatus(null), 4000);
    } catch (err) {
      setSaveDbStatus('error');
      setSaveDbMsg('Database save error: ' + (err.message || 'Server error'));
    }
  };

  // ─── Link Adaptation to Selected Location ────────────────────────────────────
  const linkAdaptation = (adaptationId, role) => {
    const updater = (prev) => {
      if (!prev) return null;
      const current = prev.assignedAdaptationIds || [];
      const updated = current.includes(adaptationId)
        ? current.filter((id) => id !== adaptationId)
        : [...current, adaptationId];
      return { ...prev, assignedAdaptationIds: updated };
    };
    if (role === 'A') setMapLocationA(updater);
    else setMapLocationB(updater);
  };

  // Initial center position (default to Pune/Mumbai regional view or global equator)
  const initialCenter = useMemo(() => {
    if (mapLocationA) return [mapLocationA.coordinates.lat, mapLocationA.coordinates.lng];
    if (mapLocationB) return [mapLocationB.coordinates.lat, mapLocationB.coordinates.lng];
    return [20.0, 15.0];
  }, []);

  const initialZoom = mapLocationA || mapLocationB ? 6 : 3;

  return (
    <div className="page-wrapper explore-map-page">
      <Breadcrumbs />

      {/* Page Header */}
      <section className="page-header-section">
        <div className="container">
          <div className="page-header-badge">
            <Compass size={15} />
            <span>Dual-Location Geospatial Intelligence</span>
          </div>
          <h1 className="page-title">
            Worldwide <span className="title-sky">Interactive Map</span>
          </h1>
          <p className="page-subtitle">
            Benchmark Reference Location A against Target Location B with high-precision Leaflet and OpenStreetMap.
            Compare geodesic distances, calculate bearings, and feed genuine coordinates directly into Climate Memory and Assessments.
          </p>
        </div>
      </section>

      {/* Map Body */}
      <section className="map-page-body">
        <div className="container">

          {/* ── Open Access / Zero-Billing Information Banner ── */}
          <div className="benchmark-picker-panel">
            <div className="panel-badge-row">
              <span className="badge-nature">
                <Globe size={13} /> OpenStreetMap & Leaflet Geospatial Engine
              </span>
              <span className="badge-sky">
                <Check size={12} /> 100% Free & Open Access &middot; Zero API Billing
              </span>
            </div>
            <h3 className="picker-title">Worldwide Location Benchmarking & Open Geocoding</h3>
            <p className="picker-desc">
              Explore climate adaptation transferability across any coordinates globally. Search any city, click directly on the interactive map, or click verified benchmark pairs below to load verified coordinates immediately.
            </p>

            <div className="benchmark-tags-row">
              <span className="benchmark-tag-label">Reference A Presets:</span>
              <div className="benchmark-chips">
                {VERIFIED_BENCHMARKS.map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    className="benchmark-chip chip-a"
                    onClick={() => handleSelectBenchmark(item, 'A')}
                    title={`Set ${item.name} as Reference Location A`}
                  >
                    + A: {item.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="benchmark-tags-row">
              <span className="benchmark-tag-label">Target B Presets:</span>
              <div className="benchmark-chips">
                {VERIFIED_BENCHMARKS.map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    className="benchmark-chip chip-b"
                    onClick={() => handleSelectBenchmark(item, 'B')}
                    title={`Set ${item.name} as Target Location B`}
                  >
                    + B: {item.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Full Location Interface ── */}
          <div className="map-full-ui">

            {/* Dual Location Search Bar */}
            <div className="dual-location-selector-bar">
              {/* Location A */}
              <div className="location-selector-card loc-a">
                <div className="selector-tag tag-a">
                  <span className="dot-a" />
                  <span>Reference Location A</span>
                  {geocodingRole === 'A' && <Loader2 size={12} className="spin-icon inline-spin" />}
                </div>
                <div className="search-input-row">
                  <Search size={16} className="search-icon" />
                  <input
                    type="text"
                    className="location-search-input"
                    placeholder="Search city, region or address…"
                    value={searchTextA}
                    onChange={(e) => setSearchTextA(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleNominatimSearch(searchTextA, 'A');
                    }}
                  />
                  <button
                    type="button"
                    className="search-submit-btn"
                    onClick={() => handleNominatimSearch(searchTextA, 'A')}
                    title="Search via OpenStreetMap Nominatim"
                  >
                    Go
                  </button>
                  {mapLocationA && (
                    <button
                      type="button"
                      className="clear-loc-btn"
                      onClick={() => handleClear('A')}
                      title="Clear Location A"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
                {mapLocationA && (
                  <div className="loc-info-mini">
                    <span className="loc-coords-mini">
                      {mapLocationA.coordinates.lat.toFixed(4)}°,{' '}
                      {mapLocationA.coordinates.lng.toFixed(4)}°
                    </span>
                    {mapLocationA.addressComponents?.country && (
                      <span className="loc-country-mini">{mapLocationA.addressComponents.country}</span>
                    )}
                    <button
                      type="button"
                      className="zoom-to-btn"
                      onClick={() => handleZoomTo(mapLocationA)}
                      title="Zoom map to Reference Location A"
                    >
                      <Navigation size={12} /> Zoom
                    </button>
                  </div>
                )}
              </div>

              {/* Swap Button */}
              <div className="swap-btn-container">
                <button
                  type="button"
                  className="swap-locations-btn"
                  onClick={handleSwap}
                  title="Swap Reference A and Target B locations"
                  aria-label="Swap Locations A and B"
                >
                  <ArrowRightLeft size={18} />
                </button>
              </div>

              {/* Location B */}
              <div className="location-selector-card loc-b">
                <div className="selector-tag tag-b">
                  <span className="dot-b" />
                  <span>Target Location B</span>
                  {geocodingRole === 'B' && <Loader2 size={12} className="spin-icon inline-spin" />}
                </div>
                <div className="search-input-row">
                  <Search size={16} className="search-icon" />
                  <input
                    type="text"
                    className="location-search-input"
                    placeholder="Search city, region or address…"
                    value={searchTextB}
                    onChange={(e) => setSearchTextB(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleNominatimSearch(searchTextB, 'B');
                    }}
                  />
                  <button
                    type="button"
                    className="search-submit-btn"
                    onClick={() => handleNominatimSearch(searchTextB, 'B')}
                    title="Search via OpenStreetMap Nominatim"
                  >
                    Go
                  </button>
                  {mapLocationB && (
                    <button
                      type="button"
                      className="clear-loc-btn"
                      onClick={() => handleClear('B')}
                      title="Clear Location B"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
                {mapLocationB && (
                  <div className="loc-info-mini">
                    <span className="loc-coords-mini">
                      {mapLocationB.coordinates.lat.toFixed(4)}°,{' '}
                      {mapLocationB.coordinates.lng.toFixed(4)}°
                    </span>
                    {mapLocationB.addressComponents?.country && (
                      <span className="loc-country-mini">{mapLocationB.addressComponents.country}</span>
                    )}
                    <button
                      type="button"
                      className="zoom-to-btn"
                      onClick={() => handleZoomTo(mapLocationB)}
                      title="Zoom map to Target Location B"
                    >
                      <Navigation size={12} /> Zoom
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Geocode Error Banner */}
            {geocodeError && (
              <div className="geocode-error-banner">
                <AlertTriangle size={16} />
                <span>{geocodeError}</span>
                <button
                  type="button"
                  className="dismiss-error-btn"
                  onClick={() => setGeocodeError('')}
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* ── Interactive Leaflet Map Container ── */}
            <div className="map-view-container">
              {/* Top Controls Bar */}
              <div className="map-controls-bar">
                <div className="map-style-toggles">
                  <span className="controls-label">Map Layer:</span>
                  {TILE_LAYERS.map((mt) => (
                    <button
                      key={mt.id}
                      type="button"
                      className={`layer-toggle-btn ${activeLayerId === mt.id ? 'active' : ''}`}
                      onClick={() => setActiveLayerId(mt.id)}
                    >
                      {mt.label}
                    </button>
                  ))}
                </div>

                <div className="map-click-mode-controls">
                  <span className="controls-label">Click Map To Set:</span>
                  {CLICK_MODES.map((cm) => (
                    <button
                      key={cm.id}
                      type="button"
                      className={`click-mode-btn mode-${cm.id.toLowerCase()} ${clickMode === cm.id ? 'active' : ''}`}
                      onClick={() => toggleClickMode(cm.id)}
                      title={`Click anywhere on the map to set ${cm.id === 'A' ? 'Reference A' : 'Target B'}`}
                    >
                      <Crosshair size={13} />
                      {cm.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    className={`layer-toggle-btn ${!mapLocationA && !mapLocationB ? 'disabled-btn' : ''}`}
                    onClick={handleZoomBoth}
                    disabled={!mapLocationA && !mapLocationB}
                    title="Fit both markers in view"
                  >
                    <Maximize2 size={13} /> Fit Both
                  </button>
                </div>
              </div>

              {/* Click mode active banner */}
              {clickMode && (
                <div className={`click-mode-banner banner-${clickMode.toLowerCase()}`}>
                  <Crosshair size={16} />
                  <span>
                    Click anywhere on the map to set{' '}
                    <strong>{clickMode === 'A' ? 'Reference Location A' : 'Target Location B'}</strong>
                  </span>
                  <button
                    type="button"
                    className="cancel-click-mode-btn"
                    onClick={() => setClickMode(null)}
                  >
                    <X size={14} /> Cancel
                  </button>
                </div>
              )}

              {/* Map Canvas Frame */}
              <div className="interactive-map-frame-wrap">
                <MapContainer
                  center={initialCenter}
                  zoom={initialZoom}
                  scrollWheelZoom={true}
                  className="leaflet-map-canvas"
                >
                  <TileLayer
                    url={activeTileLayer.url}
                    attribution={activeTileLayer.attribution}
                    maxZoom={activeTileLayer.maxZoom}
                  />

                  {/* Dynamic Click Handler */}
                  <MapClickHandler clickMode={clickMode} onMapClick={handleMapClick} />

                  {/* Camera Controller */}
                  <MapCameraController
                    centerTarget={cameraCenter}
                    boundsTarget={cameraBounds}
                    triggerKey={cameraTriggerKey}
                  />

                  {/* Location A Marker */}
                  {mapLocationA && (
                    <Marker
                      position={[mapLocationA.coordinates.lat, mapLocationA.coordinates.lng]}
                      icon={iconA}
                    >
                      <Popup className="adaptfit-map-popup">
                        <div className="popup-content">
                          <span className="popup-tag tag-a">Reference Location A</span>
                          <strong className="popup-name">{mapLocationA.name}</strong>
                          <span className="popup-coords">
                            {mapLocationA.coordinates.lat.toFixed(4)}°, {mapLocationA.coordinates.lng.toFixed(4)}°
                          </span>
                          {mapLocationA.addressComponents?.country && (
                            <span className="popup-country">{mapLocationA.addressComponents.country}</span>
                          )}
                        </div>
                      </Popup>
                    </Marker>
                  )}

                  {/* Location B Marker */}
                  {mapLocationB && (
                    <Marker
                      position={[mapLocationB.coordinates.lat, mapLocationB.coordinates.lng]}
                      icon={iconB}
                    >
                      <Popup className="adaptfit-map-popup">
                        <div className="popup-content">
                          <span className="popup-tag tag-b">Target Location B</span>
                          <strong className="popup-name">{mapLocationB.name}</strong>
                          <span className="popup-coords">
                            {mapLocationB.coordinates.lat.toFixed(4)}°, {mapLocationB.coordinates.lng.toFixed(4)}°
                          </span>
                          {mapLocationB.addressComponents?.country && (
                            <span className="popup-country">{mapLocationB.addressComponents.country}</span>
                          )}
                        </div>
                      </Popup>
                    </Marker>
                  )}
                </MapContainer>

                {/* HUD Overlay */}
                {(mapLocationA || mapLocationB) && (
                  <div className="map-hud-overlay">
                    <div className="hud-badge-row">
                      {mapLocationA && (
                        <div className="hud-badge a">
                          <span className="hud-dot a" />
                          <strong>Ref A:</strong> {mapLocationA.name}
                        </div>
                      )}
                      {mapLocationB && (
                        <div className="hud-badge b">
                          <span className="hud-dot b" />
                          <strong>Target B:</strong> {mapLocationB.name}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Blank map guide prompt */}
                {!mapLocationA && !mapLocationB && (
                  <div className="no-location-prompt">
                    <MapPin size={28} />
                    <p>Search for a location above or click "Set Ref A" / "Set Target B" to pin directly on the map</p>
                  </div>
                )}
              </div>
            </div>

            {/* ── Comparison Panel (shown when both locations set) ── */}
            {mapLocationA && mapLocationB && (
              <div className="benchmark-analysis-section">
                <div className="benchmark-head">
                  <div className="badge-nature">
                    <Sparkles size={14} />
                    <span>Geodesic & Benchmark Analysis</span>
                  </div>
                  <h3 className="benchmark-title">
                    Location Pair Spatial Comparison
                  </h3>
                  <p className="benchmark-sub">
                    Calculated geodesic metrics from geocoded coordinates. Proceed directly to climate assessment or analyze historical memory.
                  </p>
                </div>

                <div className="comparison-matrix-grid">
                  {/* Card A */}
                  <div className="matrix-location-col col-a">
                    <div className="matrix-col-header">
                      <span className="col-tag tag-a">Reference Location A</span>
                      <h4 className="col-name">{mapLocationA.name}</h4>
                      <span className="col-country">{mapLocationA.addressComponents?.country}</span>
                    </div>
                    <div className="matrix-data-list">
                      <div className="matrix-row">
                        <span className="row-label">Latitude:</span>
                        <span className="row-val mono">{mapLocationA.coordinates.lat.toFixed(6)}°</span>
                      </div>
                      <div className="matrix-row">
                        <span className="row-label">Longitude:</span>
                        <span className="row-val mono">{mapLocationA.coordinates.lng.toFixed(6)}°</span>
                      </div>
                      {mapLocationA.addressComponents?.administrativeAreaLevel1 && (
                        <div className="matrix-row">
                          <span className="row-label">Region:</span>
                          <span className="row-val">{mapLocationA.addressComponents.administrativeAreaLevel1}</span>
                        </div>
                      )}
                      {mapLocationA.formattedAddress && (
                        <div className="matrix-row">
                          <span className="row-label">Address:</span>
                          <span className="row-val small-val">{mapLocationA.formattedAddress}</span>
                        </div>
                      )}
                    </div>
                    {mapLocationA.assignedAdaptationIds?.length > 0 && (
                      <div className="assigned-adaptations-mini">
                        <span className="assigned-label">Linked Adaptations:</span>
                        <div className="assigned-chips">
                          {mapLocationA.assignedAdaptationIds.map((id) => {
                            const ad = adaptations.find((a) => a.id === id);
                            return ad ? (
                              <span key={id} className="assigned-chip chip-a">{ad.title}</span>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bridge */}
                  <div className="matrix-bridge-col">
                    {distanceData && (
                      <div className="transferability-meter">
                        <span className="meter-label">Geodesic Distance</span>
                        <span className="meter-val distance-val">{distanceData.km.toLocaleString()} km</span>
                        <span className="meter-sub">{distanceData.miles.toLocaleString()} mi &middot; {distanceData.nauticalMiles.toLocaleString()} nm</span>
                      </div>
                    )}
                    {bearingData && (
                      <div className="bearing-display">
                        <span className="bearing-label">Initial Bearing</span>
                        <span className="bearing-val">{bearingData.degrees}°</span>
                        <span className="bearing-cardinal">{bearingData.cardinal}</span>
                        <div className="compass-ring">
                          <div
                            className="compass-needle"
                            style={{ transform: `rotate(${bearingData.degrees}deg)` }}
                          />
                        </div>
                      </div>
                    )}
                    <div className="bridge-arrow">&#10140;</div>
                    <p className="bridge-text">
                      Computed via Haversine great-circle geodesic formula.
                    </p>
                  </div>

                  {/* Card B */}
                  <div className="matrix-location-col col-b">
                    <div className="matrix-col-header">
                      <span className="col-tag tag-b">Target Location B</span>
                      <h4 className="col-name">{mapLocationB.name}</h4>
                      <span className="col-country">{mapLocationB.addressComponents?.country}</span>
                    </div>
                    <div className="matrix-data-list">
                      <div className="matrix-row">
                        <span className="row-label">Latitude:</span>
                        <span className="row-val mono">{mapLocationB.coordinates.lat.toFixed(6)}°</span>
                      </div>
                      <div className="matrix-row">
                        <span className="row-label">Longitude:</span>
                        <span className="row-val mono">{mapLocationB.coordinates.lng.toFixed(6)}°</span>
                      </div>
                      {mapLocationB.addressComponents?.administrativeAreaLevel1 && (
                        <div className="matrix-row">
                          <span className="row-label">Region:</span>
                          <span className="row-val">{mapLocationB.addressComponents.administrativeAreaLevel1}</span>
                        </div>
                      )}
                      {mapLocationB.formattedAddress && (
                        <div className="matrix-row">
                          <span className="row-label">Address:</span>
                          <span className="row-val small-val">{mapLocationB.formattedAddress}</span>
                        </div>
                      )}
                    </div>
                    {mapLocationB.assignedAdaptationIds?.length > 0 && (
                      <div className="assigned-adaptations-mini">
                        <span className="assigned-label">Linked Adaptations:</span>
                        <div className="assigned-chips">
                          {mapLocationB.assignedAdaptationIds.map((id) => {
                            const ad = adaptations.find((a) => a.id === id);
                            return ad ? (
                              <span key={id} className="assigned-chip chip-b">{ad.title}</span>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* ── Prominent Assessment Action Bar ── */}
                <div className="location-navigation-action-bar">
                  <button
                    type="button"
                    className="btn-primary-action"
                    onClick={() => navigate('/assessments')}
                  >
                    <Calculator size={18} />
                    <span>Run Climate Compatibility Assessment</span>
                    <ArrowRight size={18} />
                  </button>

                  <button
                    type="button"
                    className="btn-secondary-action"
                    onClick={() => navigate('/climate-memory')}
                  >
                    <Clock size={16} />
                    <span>Analyze in Climate Memory</span>
                  </button>

                  <button
                    type="button"
                    className="btn-secondary-action"
                    onClick={handleSaveToDatabase}
                    disabled={saveDbStatus === 'saving'}
                  >
                    <Database size={16} />
                    <span>{saveDbStatus === 'saving' ? 'Saving to Database...' : 'Save Pair to Database'}</span>
                  </button>
                </div>

                {saveDbMsg && (
                  <div className={`db-save-toast ${saveDbStatus === 'error' ? 'err' : 'ok'}`}>
                    {saveDbStatus === 'error' ? <AlertTriangle size={15} /> : <CheckCircle2 size={15} />}
                    <span>{saveDbMsg}</span>
                  </div>
                )}
              </div>
            )}

            {/* Single location panel (only one set) */}
            {(mapLocationA || mapLocationB) && !(mapLocationA && mapLocationB) && (
              <div className="single-loc-hint">
                <Info size={16} />
                <span>
                  {mapLocationA
                    ? 'Reference Location A is set. Search or select Target Location B to enable comparison and assessment.'
                    : 'Target Location B is set. Search or select Reference Location A to enable comparison and assessment.'}
                </span>
              </div>
            )}

            {/* ── Adaptation Assignment Strip ── */}
            <div className="adaptation-assign-section">
              <div className="assign-section-head">
                <Layers size={16} />
                <span>Link Climate Adaptations to Your Selected Locations</span>
              </div>
              <div className="adaptation-assign-strip">
                {adaptations.map((ad) => {
                  const linkedA = mapLocationA?.assignedAdaptationIds?.includes(ad.id);
                  const linkedB = mapLocationB?.assignedAdaptationIds?.includes(ad.id);
                  return (
                    <div key={ad.id} className="assign-card">
                      <div className="assign-card-title">{ad.title}</div>
                      <div className="assign-card-category">{ad.category}</div>
                      <div className="assign-card-actions">
                        <button
                          type="button"
                          className={`assign-btn btn-a ${linkedA ? 'linked' : ''} ${!mapLocationA ? 'disabled-btn' : ''}`}
                          onClick={() => mapLocationA && linkAdaptation(ad.id, 'A')}
                          disabled={!mapLocationA}
                          title={mapLocationA ? `${linkedA ? 'Unlink from' : 'Link to'} Ref A` : 'Set Location A first'}
                        >
                          {linkedA ? '✓ A' : '+ A'}
                        </button>
                        <button
                          type="button"
                          className={`assign-btn btn-b ${linkedB ? 'linked' : ''} ${!mapLocationB ? 'disabled-btn' : ''}`}
                          onClick={() => mapLocationB && linkAdaptation(ad.id, 'B')}
                          disabled={!mapLocationB}
                          title={mapLocationB ? `${linkedB ? 'Unlink from' : 'Link to'} Target B` : 'Set Location B first'}
                        >
                          {linkedB ? '✓ B' : '+ B'}
                        </button>
                        <button
                          type="button"
                          className="assign-inspect-btn"
                          onClick={() => openAdaptationById(ad.id)}
                          title="Inspect adaptation blueprint"
                        >
                          <ExternalLink size={11} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
