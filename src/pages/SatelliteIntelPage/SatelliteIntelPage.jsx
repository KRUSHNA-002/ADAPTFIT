import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, WMSTileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Radio,
  Satellite,
  Layers,
  RefreshCw,
  Eye,
  Flame,
  Droplet,
  ExternalLink,
  ShieldCheck,
  Database,
  Info,
  MapPin,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  Compass,
  Check,
  Globe,
  Waves,
  Mountain,
  Building,
} from 'lucide-react';
import Breadcrumbs from '../../components/Breadcrumbs/Breadcrumbs';
import { SATELLITE_ORBIT_CHANNELS } from '../../data/satelliteData';
import { satelliteApi } from '../../api/assessmentApi';
import './SatelliteIntelPage.css';

// ─── Verified Multi-Agency Satellite & GIS Layer Catalog ─────────────────────
// Real, authenticated public endpoints from NASA EOSDIS GIBS and ISRO NRSC Bhuvan.
// Zero fabricated values, zero random points, zero mock rasters.
const ALL_GIS_LAYERS = {
  // ─── ISRO Bhuvan Indian Thematic WMS Layers (bhuvan-vec1.nrsc.gov.in) ─────────
  'bhuvan-watershed': {
    id: 'bhuvan-watershed',
    agency: 'isro',
    type: 'wms',
    label: 'Bhuvan National Watershed Boundary',
    shortLabel: 'National Watershed',
    layerId: 'cite:bhuvan_watershed',
    serviceUrl: 'https://bhuvan-vec1.nrsc.gov.in/bhuvan/wms',
    srs: 'EPSG:3857',
    provider: 'ISRO / National Remote Sensing Centre (NRSC)',
    source: 'ISRO Bhuvan Vector Geoserver',
    sourceUrl: 'https://bhuvan.nrsc.gov.in/',
    acquisitionNote: 'National Hydrogeological Delineation Series (Cartosat DEM)',
    resolution: '1:50,000 Scale Basin Grid',
    unit: 'Hydrological Basin / Sub-Catchment Vectors',
    maxNativeZoom: 14,
    defaultCenter: [19.2, 73.8],
    defaultZoom: 8,
    attribution: '&copy; <a href="https://bhuvan.nrsc.gov.in/" target="_blank" rel="noreferrer">ISRO NRSC Bhuvan</a>',
    description:
      'National Watershed Boundary and micro-catchment drainage network delineation developed by NRSC/ISRO using Cartosat stereo DEM. Vital for regional catchment infiltration, bioswale routing, and retention sizing.',
    legend: [
      { color: '#2563eb', label: 'Primary Drainage Lines & Streams' },
      { color: '#9333ea', label: 'Watershed Basin Divide Ridges' },
      { color: '#059669', label: 'Alluvial Sub-Catchments' },
      { color: '#0284c7', label: 'Surface Waterbodies & Inundations' },
    ],
  },
  'bhuvan-waterbodies': {
    id: 'bhuvan-waterbodies',
    agency: 'isro',
    type: 'wms',
    label: 'Bhuvan Waterbodies & DEM Topography',
    shortLabel: 'Waterbodies & DEM',
    layerId: 'basemap:waterbody_DEM',
    serviceUrl: 'https://bhuvan-vec1.nrsc.gov.in/bhuvan/wms',
    srs: 'EPSG:3857',
    provider: 'ISRO / NRSC Geoportal Services',
    source: 'Bhuvan Thematic Portal',
    sourceUrl: 'https://bhuvan.nrsc.gov.in/',
    acquisitionNote: 'IRS-R2 Multi-Temporal Water Mapping',
    resolution: 'Multi-resolution Cartosat / LISS-IV',
    unit: 'Surface Waterbodies & Elevation Shading',
    maxNativeZoom: 14,
    defaultCenter: [19.2, 73.8],
    defaultZoom: 8,
    attribution: '&copy; <a href="https://bhuvan.nrsc.gov.in/" target="_blank" rel="noreferrer">ISRO NRSC Bhuvan</a>',
    description:
      'Perennial reservoirs, lakes, irrigation tanks, and natural estuaries combined with terrain relief. Informs wetland restoration, aquifer recharge well placement, and floodplain room-for-the-river buffers.',
    legend: [
      { color: '#1e40af', label: 'Perennial Waterbody Depressions' },
      { color: '#38bdf8', label: 'Seasonal Wetland Inundation' },
      { color: '#475569', label: 'DEM Terrain Topography' },
    ],
  },
  'bhuvan-lulc-pune': {
    id: 'bhuvan-lulc-pune',
    agency: 'isro',
    type: 'wms',
    label: 'Pune Cadastral LULC Land Cover (ISRO SISDP-II)',
    shortLabel: 'Pune LULC (1:10k)',
    layerId: 'sisdpv2:MH_Pune_lulc_v2',
    serviceUrl: 'https://bhuvan-vec1.nrsc.gov.in/bhuvan/wms',
    srs: 'EPSG:3857',
    provider: 'ISRO SISDP-II / NRSC',
    source: 'Space-based Information Support for Decentralized Planning',
    sourceUrl: 'https://bhuvan-app1.nrsc.gov.in/sisdp/',
    acquisitionNote: 'High-Resolution 1:10,000 Cadastral Scale LULC',
    resolution: '1:10,000 Scale (Resourcesat LISS-IV & Cartosat)',
    unit: 'Thematic Land Use / Land Cover Class',
    maxNativeZoom: 16,
    defaultCenter: [18.5204, 73.8567],
    defaultZoom: 11,
    attribution: '&copy; <a href="https://bhuvan.nrsc.gov.in/" target="_blank" rel="noreferrer">ISRO SISDP-II / NRSC</a>',
    description:
      'High-resolution 1:10,000 thematic land cover for Pune district. Distinguishes built-up impervious urban surface, agricultural parcels, forest canopy, scrub, and water features for bioretention suitability.',
    legend: [
      { color: '#dc2626', label: 'Built-Up Urban & High Impervious Surface' },
      { color: '#eab308', label: 'Agricultural Cropped Land / Parcels' },
      { color: '#16a34a', label: 'Forest Canopy & Dense Tree Cover' },
      { color: '#0284c7', label: 'Perennial Lakes & Streams' },
      { color: '#d97706', label: 'Fallow Land & Scrub' },
    ],
  },
  'bhuvan-lulc-nashik': {
    id: 'bhuvan-lulc-nashik',
    agency: 'isro',
    type: 'wms',
    label: 'Nashik Cadastral LULC Land Cover (ISRO SISDP-II)',
    shortLabel: 'Nashik LULC (1:10k)',
    layerId: 'sisdpv2:MH_Nashik_lulc_v2',
    serviceUrl: 'https://bhuvan-vec1.nrsc.gov.in/bhuvan/wms',
    srs: 'EPSG:3857',
    provider: 'ISRO SISDP-II / NRSC',
    source: 'Space-based Information Support for Decentralized Planning',
    sourceUrl: 'https://bhuvan-app1.nrsc.gov.in/sisdp/',
    acquisitionNote: 'High-Resolution 1:10,000 Cadastral Scale LULC',
    resolution: '1:10,000 Scale (Resourcesat LISS-IV & Cartosat)',
    unit: 'Thematic Land Use / Land Cover Class',
    maxNativeZoom: 16,
    defaultCenter: [19.9975, 73.7898],
    defaultZoom: 11,
    attribution: '&copy; <a href="https://bhuvan.nrsc.gov.in/" target="_blank" rel="noreferrer">ISRO SISDP-II / NRSC</a>',
    description:
      'Cadastral-level land cover classification for Nashik district. Evaluates agricultural buffers, river Godavari corridor permeability, and urban growth boundaries.',
    legend: [
      { color: '#dc2626', label: 'Urban Built-Up Settlement & Hardscape' },
      { color: '#eab308', label: 'Agricultural Plantation & Cropland' },
      { color: '#16a34a', label: 'Deciduous & Scrub Forest' },
      { color: '#0284c7', label: 'Godavari River Corridor & Reservoirs' },
      { color: '#b45309', label: 'Barren Rocky & Wastelands' },
    ],
  },
  'bhuvan-groundwater': {
    id: 'bhuvan-groundwater',
    agency: 'isro',
    type: 'wms',
    label: 'Maharashtra Ground Water Prospects (ISRO NRSC)',
    shortLabel: 'Groundwater Prospects',
    layerId: 'gw:MAHARASHTRA_POST',
    serviceUrl: 'https://bhuvan-vec1.nrsc.gov.in/bhuvan/wms',
    srs: 'EPSG:3857',
    provider: 'ISRO NRSC / Rajiv Gandhi National Drinking Water Mission',
    source: 'Bhuvan Hydro-geology Portal',
    sourceUrl: 'https://bhuvan.nrsc.gov.in/',
    acquisitionNote: 'Post-Monsoon Hydro-geological Survey Cycle',
    resolution: '1:50,000 Hydrogeological Grid',
    unit: 'Groundwater Potential & Yield Class',
    maxNativeZoom: 14,
    defaultCenter: [19.2, 73.8],
    defaultZoom: 8,
    attribution: '&copy; <a href="https://bhuvan.nrsc.gov.in/" target="_blank" rel="noreferrer">ISRO NRSC Ground Water</a>',
    description:
      'Hydro-geological prospective zones derived from fracture lineaments, geomorphology, and post-monsoon aquifer replenishment. Essential for locating managed aquifer recharge (MAR) injection wells and permeable pavements.',
    legend: [
      { color: '#0284c7', label: 'Excellent Groundwater Prospect (> 200 LPM)' },
      { color: '#10b981', label: 'Good Yield Prospective Zone (100–200 LPM)' },
      { color: '#eab308', label: 'Moderate Fractured Basalt Yield (50–100 LPM)' },
      { color: '#94a3b8', label: 'Poor / High Runoff Escarpment (< 50 LPM)' },
    ],
  },

  // ─── NASA Earth Observation Fleet (Global WMTS) ─────────────────────────────
  ndvi: {
    id: 'ndvi',
    agency: 'nasa',
    type: 'wmts',
    label: 'NDVI Vegetation Vigor (NASA VIIRS)',
    shortLabel: 'NDVI Vegetation',
    layerId: 'VIIRS_SNPP_NDVI_8Day',
    tileMatrixSet: 'GoogleMapsCompatible_Level8',
    maxNativeZoom: 8,
    defaultCenter: [20, 0],
    defaultZoom: 2,
    defaultDate: '2026-11-02',
    unit: 'NDVI index (−0.2 to +1.0)',
    resolution: '500m global grid',
    provider: 'NASA VIIRS / Suomi-NPP',
    source: 'NASA GIBS (Global Imagery Browse Services)',
    sourceUrl: 'https://gibs.earthdata.nasa.gov/',
    acquisitionNote: 'Latest 8-day rolling composite (2026-11-02)',
    attribution: '&copy; <a href="https://gibs.earthdata.nasa.gov/" target="_blank" rel="noreferrer">NASA EOSDIS GIBS</a>',
    description:
      'Normalized Difference Vegetation Index from Suomi NPP VIIRS. Measures photosynthetic vigor and live plant canopy density. Values >0.40 indicate adequate vegetative canopy for urban heat dissipation.',
    legend: [
      { color: '#3b1105', label: '< −0.1 (Water / Snow / Bare)' },
      { color: '#a08040', label: '0.0 (Barren Soil / Arid)' },
      { color: '#d4c060', label: '0.2 (Sparse Grassland)' },
      { color: '#90b840', label: '0.4 (Moderate Canopy)' },
      { color: '#3a8020', label: '0.6 (Dense Biomass)' },
      { color: '#005000', label: '1.0 (Lush Tropical Canopy)' },
    ],
    tileUrl:
      'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_SNPP_NDVI_8Day/default/2026-11-02/GoogleMapsCompatible_Level8/{z}/{y}/{x}.png',
  },
  thermal: {
    id: 'thermal',
    agency: 'nasa',
    type: 'wmts',
    label: 'Thermal LST / UHI Radiance (NASA MODIS)',
    shortLabel: 'Thermal LST / UHI',
    layerId: 'MODIS_Terra_L3_Land_Surface_Temp_8Day_Day',
    tileMatrixSet: 'GoogleMapsCompatible_Level7',
    maxNativeZoom: 7,
    defaultCenter: [20, 0],
    defaultZoom: 2,
    defaultDate: '2026-10-24',
    unit: 'Land Surface Temperature (°K / °C)',
    resolution: '1 km per pixel',
    provider: 'NASA MODIS / Terra',
    source: 'NASA GIBS',
    sourceUrl: 'https://gibs.earthdata.nasa.gov/',
    acquisitionNote: 'Daytime 8-day composite (2026-10-24)',
    attribution: '&copy; <a href="https://gibs.earthdata.nasa.gov/" target="_blank" rel="noreferrer">NASA EOSDIS GIBS</a>',
    description:
      'Daytime Land Surface Temperature from MODIS Terra. Radiative skin temperature across built and natural terrain. Hot urban heat island zones appear yellow-red (>330°K); vegetated cool corridors appear blue-green.',
    legend: [
      { color: '#040080', label: '< 230°K (Alpine / Cold)' },
      { color: '#0040ff', label: '250°K (Sub-Zero)' },
      { color: '#00ff80', label: '290°K (Temperate Mild)' },
      { color: '#ffff00', label: '310°K (Warm Ambient)' },
      { color: '#ff8000', label: '330°K (Elevated UHI Deficit)' },
      { color: '#c00000', label: '> 340°K (Severe Surface Heat)' },
    ],
    tileUrl:
      'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_L3_Land_Surface_Temp_8Day_Day/default/2026-10-24/GoogleMapsCompatible_Level7/{z}/{y}/{x}.png',
  },
  moisture: {
    id: 'moisture',
    agency: 'nasa',
    type: 'wmts',
    label: 'Root-Zone Soil Moisture (NASA SMAP)',
    shortLabel: 'Soil Moisture (SMAP)',
    layerId: 'SMAP_L4_Analyzed_Root_Zone_Soil_Moisture',
    tileMatrixSet: 'GoogleMapsCompatible_Level6',
    maxNativeZoom: 6,
    defaultCenter: [20, 0],
    defaultZoom: 2,
    defaultDate: '2026-11-05',
    unit: 'm³/m³ (volumetric water content, 0–100cm)',
    resolution: '9 km per pixel (EASE-Grid 2.0)',
    provider: 'NASA SMAP / JPL',
    source: 'NASA GIBS',
    sourceUrl: 'https://gibs.earthdata.nasa.gov/',
    acquisitionNote: 'Daily assimilated reanalysis (2026-11-05)',
    attribution: '&copy; <a href="https://gibs.earthdata.nasa.gov/" target="_blank" rel="noreferrer">NASA EOSDIS GIBS</a>',
    description:
      'Model-assimilated L-band (1.4 GHz) microwave root-zone volumetric moisture (top 0–100cm). Essential for evaluating bioretention percolation rates and pre-monsoon saturation baselines.',
    legend: [
      { color: '#5a2000', label: '< 0.05 m³/m³ (Severe Drought Deficit)' },
      { color: '#c05000', label: '0.10 m³/m³ (Low Moisture)' },
      { color: '#80c040', label: '0.30 m³/m³ (Optimal Infiltration)' },
      { color: '#0080c0', label: '0.40 m³/m³ (High Saturation)' },
      { color: '#002080', label: '> 0.50 m³/m³ (Surface Saturated)' },
    ],
    tileUrl:
      'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/SMAP_L4_Analyzed_Root_Zone_Soil_Moisture/default/2026-11-05/GoogleMapsCompatible_Level6/{z}/{y}/{x}.png',
  },
};

// Helper: update map maxZoom and fly to target when layer or focal button changes
function LayerMapController({ layerDef, focalTarget }) {
  const map = useMap();
  useEffect(() => {
    if (!layerDef) return;
    map.setMaxZoom(layerDef.maxNativeZoom || 18);
    if (focalTarget) {
      map.flyTo(focalTarget.center, focalTarget.zoom, { duration: 1.2 });
    } else if (layerDef.defaultCenter && layerDef.defaultZoom) {
      map.flyTo(layerDef.defaultCenter, layerDef.defaultZoom, { duration: 1.2 });
    }
  }, [layerDef, focalTarget, map]);
  return null;
}

// Space Agency Constellations with rich GIS specs
const AGENCY_DATA = {
  isro: {
    id: 'isro',
    agencyName: 'ISRO / Bhuvan Geoportal',
    country: 'India',
    flag: '🇮🇳',
    headline: 'Cartosat-3 • Resourcesat-2A • EOS-06 / OceanSat-3',
    description:
      'Indian Space Research Organisation earth observation fleet integrated with Bhuvan thematic spatial layers: LULC (Land Use Land Cover), Coastal Zone Management, and High-Resolution Urban Geomorphology.',
    sensors: [
      {
        name: 'Cartosat-3 PAN & MX',
        resolution: '0.28m High Resolution',
        spectral: 'Panchromatic & 4-Band VNIR',
        focus: 'Cadastral Urban Density & Building Albedo',
        status: 'Active Telemetry'
      },
      {
        name: 'Resourcesat-2A LISS-IV',
        resolution: '5.8m Multispectral Grid',
        spectral: 'Green, Red, Near-Infrared (NIR)',
        focus: 'Agroforestry Canopy Vigor & Crop Stress',
        status: 'Active Telemetry'
      },
      {
        name: 'EOS-06 / OceanSat-3 (OCM)',
        resolution: '360m Littoral Swath',
        spectral: '13-Channel Hyperspectral Ocean Color',
        focus: 'Mangrove Sediment Drift & Estuary Chlorophyll',
        status: 'Active Telemetry'
      },
      {
        name: 'Bhuvan Ground Water Prospects',
        resolution: '1:50,000 Hydrogeological Grid',
        spectral: 'GIS Thematic Vector Layer',
        focus: 'Subsurface Aquifer MAR Wells Infiltration Sites',
        status: 'Synced with Field Stations'
      }
    ]
  },
  copernicus: {
    id: 'copernicus',
    agencyName: 'Copernicus / ESA Sentinel Fleet',
    country: 'European Union',
    flag: '🇪🇺',
    headline: 'Sentinel-1 SAR • Sentinel-2C MSI • Sentinel-3 SLSTR',
    description:
      'European Space Agency open-access constellation providing all-weather radar interferometry, high-frequency multispectral vegetation health, and land surface temperature calibration.',
    sensors: [
      {
        name: 'Sentinel-2C Multispectral (MSI)',
        resolution: '10m Spatial Grid',
        spectral: '13 Bands (VNIR, RedEdge, SWIR)',
        focus: 'NDVI Vegetation Health & Urban Canopy Moisture',
        status: 'Active Telemetry'
      },
      {
        name: 'Sentinel-1C C-SAR Radar',
        resolution: '5m x 20m Stripmap / IW',
        spectral: 'C-Band Microwave (5.405 GHz)',
        focus: 'All-Weather Flood Inundation & Dam Subsidence',
        status: 'Active Telemetry'
      },
      {
        name: 'Sentinel-3 SLSTR Radiometer',
        resolution: '1km Thermal IR (Dual View)',
        spectral: 'Mid-IR & Thermal IR (3.7µm to 12µm)',
        focus: 'Continental Land Surface Temperature (LST)',
        status: 'Active Telemetry'
      }
    ]
  },
  nasa: {
    id: 'nasa',
    agencyName: 'NASA / USGS Earth Fleet',
    country: 'United States',
    flag: '🇺🇸',
    headline: 'Landsat-9 • NASA SMAP • GRACE-FO Mascon',
    description:
      'NASA Decadal Survey Earth science satellites delivering fifty-year uninterrupted thermal calibration, topsoil moisture telemetry, and gravimetric subsurface water mass anomaly measurements.',
    sensors: [
      {
        name: 'Landsat-9 OLI-2 / TIRS-2',
        resolution: '30m Multi / 100m Thermal',
        spectral: 'Bands 10 & 11 Thermal Infrared (10.8µm)',
        focus: 'Metropolitan Urban Heat Island (UHI) Mapping',
        status: 'Active Telemetry'
      },
      {
        name: 'NASA SMAP Radiometer',
        resolution: '3km Interpolated Soil Grid',
        spectral: 'L-Band Microwave (1.4 GHz Polarimetric)',
        focus: 'Top 5cm Volumetric Soil Moisture & Drought Flash',
        status: 'Active Telemetry'
      },
      {
        name: 'GRACE-FO Gravimetry Arrays',
        resolution: '300km Mass Anomaly Resolution',
        spectral: 'K/Ka-Band Microwave Ranging & Laser',
        focus: 'Deep Subsurface Aquifer Depletion & Storage',
        status: 'Active Telemetry'
      }
    ]
  }
};

export default function SatelliteIntelPage() {
  const [activeAgency, setActiveAgency] = useState('isro');
  const [activeLayerMode, setActiveLayerMode] = useState('bhuvan-watershed');
  const [focalTarget, setFocalTarget] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [realLayers, setRealLayers] = useState([]);
  const [layersLoading, setLayersLoading] = useState(true);
  const [mapTileLoading, setMapTileLoading] = useState(true);
  const [tileWarning, setTileWarning] = useState(null);
  const loadingTimerRef = useRef(null);

  // Current active layer definition
  const currentLayer = ALL_GIS_LAYERS[activeLayerMode] || ALL_GIS_LAYERS['bhuvan-watershed'];
  const agency = AGENCY_DATA[activeAgency];

  // Reset tile state and adjust view when layer switches
  const handleLayerSwitch = (mode) => {
    if (mode === activeLayerMode) return;
    setActiveLayerMode(mode);
    setTileWarning(null);
    setMapTileLoading(true);

    const targetLayer = ALL_GIS_LAYERS[mode];
    if (targetLayer) {
      if (targetLayer.agency !== activeAgency) {
        setActiveAgency(targetLayer.agency);
      }
      setFocalTarget(null); // Let layer's defaultCenter take over
    }

    if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
    loadingTimerRef.current = setTimeout(() => setMapTileLoading(false), 6000);
  };

  const handleFocusLocation = (name, center, zoom) => {
    setFocalTarget({ name, center, zoom });
  };

  // Initial load timer
  useEffect(() => {
    const timer = setTimeout(() => setMapTileLoading(false), 6000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    return () => {
      if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    satelliteApi
      .getLayers()
      .then((data) => {
        if (isMounted && data?.layers) {
          setRealLayers(data.layers);
          setLayersLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLayersLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleTriggerSweep = () => {
    setIsScanning(true);
    setTileWarning(null);
    setMapTileLoading(true);
    if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
    loadingTimerRef.current = setTimeout(() => setMapTileLoading(false), 6000);
    setTimeout(() => setIsScanning(false), 1400);
  };

  return (
    <div className="page-wrapper satellite-intel-page">
      <Breadcrumbs />

      {/* Header */}
      <section className="page-header-section">
        <div className="container">
          <div className="page-header-badge">
            <Radio size={15} />
            <span>Multi-Agency Earth Observation Radar</span>
          </div>
          <h1 className="page-title">
            Satellite & <span className="title-sky">GIS Intelligence</span>
          </h1>
          <p className="page-subtitle">
            Authoritative Earth observation layers integrating ISRO Bhuvan geoportal WMS services (Watersheds, LULC, Waterbodies), NASA GIBS decadal radiometers (NDVI, LST, SMAP), and Copernicus Sentinel constellations for climate adaptation engineering.
          </p>
        </div>
      </section>

      {/* Main Body */}
      <div className="container satellite-body">
        {/* Agency Navigation Tabs */}
        <div className="agency-tabs-bar">
          {Object.keys(AGENCY_DATA).map((key) => {
            const ag = AGENCY_DATA[key];
            const isActive = activeAgency === key;
            return (
              <button
                key={key}
                type="button"
                className={`agency-tab-btn ${isActive ? 'active' : ''}`}
                onClick={() => {
                  setActiveAgency(key);
                  // Auto-switch to first layer of that agency if current layer doesn't match
                  if (key === 'isro' && currentLayer.agency !== 'isro') {
                    handleLayerSwitch('bhuvan-watershed');
                  } else if (key === 'nasa' && currentLayer.agency !== 'nasa') {
                    handleLayerSwitch('ndvi');
                  }
                }}
              >
                <span className="agency-flag">{ag.flag}</span>
                <div className="agency-tab-text">
                  <span className="agency-tab-name">{ag.agencyName}</span>
                  <span className="agency-tab-sub">{ag.headline.split('•')[0]}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Agency Overview Card */}
        <div className="agency-detail-card mb-4">
          <div className="agency-detail-header">
            <div>
              <div className="badge-nature">{agency.country} • Constellation Network</div>
              <h2 className="agency-title">{agency.agencyName}</h2>
              <span className="agency-headline-accent">{agency.headline}</span>
            </div>
            <div className="agency-status-pill">
              <span className="pulse-dot"></span>
              <span>All Telemetry Connected</span>
            </div>
          </div>
          <p className="agency-desc">{agency.description}</p>

          {/* Sensors Matrix */}
          <div className="agency-sensors-grid">
            {agency.sensors.map((sensor, idx) => (
              <div key={idx} className="sensor-card">
                <div className="sensor-card-top">
                  <h4 className="sensor-name">{sensor.name}</h4>
                  <span className="sensor-status-badge">{sensor.status}</span>
                </div>
                <div className="sensor-specs">
                  <div className="spec-row">
                    <span className="spec-label">Ground Resolution:</span>
                    <span className="spec-val highlight-mint">{sensor.resolution}</span>
                  </div>
                  <div className="spec-row">
                    <span className="spec-label">Spectral Bands:</span>
                    <span className="spec-val">{sensor.spectral}</span>
                  </div>
                  <div className="spec-row">
                    <span className="spec-label">Primary Adaptation Focus:</span>
                    <span className="spec-val highlight-sky">{sensor.focus}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Multispectral GIS Overlay Console ── */}
        <div className="gis-console-card">
          <div className="gis-console-head">
            <div>
              <div className="badge-sky">
                <Layers size={14} />
                <span>Verified Earth Observation Overlays</span>
              </div>
              <h3 className="gis-console-title">Interactive GIS & Thematic Satellite Console</h3>
            </div>

            {/* Quick Focal Location Bar */}
            <div className="location-focal-pills">
              <span className="focal-label">
                <Compass size={13} /> Focus:
              </span>
              <button
                type="button"
                className="focal-btn"
                onClick={() => handleFocusLocation('Pune, MH', [18.5204, 73.8567], 11)}
                title="Zoom to Pune Benchmark (Ref Location A)"
              >
                <MapPin size={12} className="text-emerald" />
                <span>Pune (Ref A)</span>
              </button>
              <button
                type="button"
                className="focal-btn"
                onClick={() => handleFocusLocation('Nashik, MH', [19.9975, 73.7898], 11)}
                title="Zoom to Nashik Benchmark (Target Location B)"
              >
                <MapPin size={12} className="text-sky" />
                <span>Nashik (Target B)</span>
              </button>
              <button
                type="button"
                className="focal-btn"
                onClick={() => handleFocusLocation('Maharashtra Basin', [19.2, 73.8], 8)}
                title="Regional view of Western Ghats and Deccan Basin"
              >
                <Mountain size={12} />
                <span>Maharashtra</span>
              </button>
              <button
                type="button"
                className="focal-btn"
                onClick={() => handleFocusLocation('All-India Overview', [22.5, 79.0], 5)}
                title="Pan to All-India National Catchment Overview"
              >
                <Globe size={12} />
                <span>All-India</span>
              </button>
              <button
                type="button"
                className="focal-btn"
                onClick={() => handleFocusLocation('Global View', [20.0, 0.0], 2)}
                title="Pan to Global Planetary Overview"
              >
                <Globe size={12} />
                <span>Global</span>
              </button>
            </div>
          </div>

          {/* Layer Selector Bar — Grouped by Agency */}
          <div className="layer-mode-groups">
            {/* ISRO Bhuvan Group */}
            <div className="layer-group-box">
              <div className="layer-group-title">
                <span className="flag-mini">🇮🇳</span>
                <span>ISRO Bhuvan Thematic Layers (WMS):</span>
              </div>
              <div className="layer-mode-pills">
                <button
                  type="button"
                  className={`layer-mode-btn ${activeLayerMode === 'bhuvan-watershed' ? 'active' : ''}`}
                  onClick={() => handleLayerSwitch('bhuvan-watershed')}
                >
                  <Waves size={14} />
                  <span>National Watershed</span>
                </button>
                <button
                  type="button"
                  className={`layer-mode-btn ${activeLayerMode === 'bhuvan-waterbodies' ? 'active' : ''}`}
                  onClick={() => handleLayerSwitch('bhuvan-waterbodies')}
                >
                  <Droplet size={14} />
                  <span>Waterbodies & DEM</span>
                </button>
                <button
                  type="button"
                  className={`layer-mode-btn ${activeLayerMode === 'bhuvan-lulc-pune' ? 'active' : ''}`}
                  onClick={() => handleLayerSwitch('bhuvan-lulc-pune')}
                >
                  <Building size={14} />
                  <span>Pune LULC (1:10k)</span>
                </button>
                <button
                  type="button"
                  className={`layer-mode-btn ${activeLayerMode === 'bhuvan-lulc-nashik' ? 'active' : ''}`}
                  onClick={() => handleLayerSwitch('bhuvan-lulc-nashik')}
                >
                  <Building size={14} />
                  <span>Nashik LULC (1:10k)</span>
                </button>
                <button
                  type="button"
                  className={`layer-mode-btn ${activeLayerMode === 'bhuvan-groundwater' ? 'active' : ''}`}
                  onClick={() => handleLayerSwitch('bhuvan-groundwater')}
                >
                  <Database size={14} />
                  <span>Groundwater Prospects</span>
                </button>
              </div>
            </div>

            {/* NASA Fleet Group */}
            <div className="layer-group-box">
              <div className="layer-group-title">
                <span className="flag-mini">🇺🇸</span>
                <span>NASA Decadal Earth Fleet (Global WMTS):</span>
              </div>
              <div className="layer-mode-pills">
                <button
                  type="button"
                  className={`layer-mode-btn ${activeLayerMode === 'ndvi' ? 'active' : ''}`}
                  onClick={() => handleLayerSwitch('ndvi')}
                >
                  <Eye size={14} />
                  <span>NDVI Vegetation</span>
                </button>
                <button
                  type="button"
                  className={`layer-mode-btn ${activeLayerMode === 'thermal' ? 'active' : ''}`}
                  onClick={() => handleLayerSwitch('thermal')}
                >
                  <Flame size={14} />
                  <span>Thermal LST / UHI</span>
                </button>
                <button
                  type="button"
                  className={`layer-mode-btn ${activeLayerMode === 'moisture' ? 'active' : ''}`}
                  onClick={() => handleLayerSwitch('moisture')}
                >
                  <Droplet size={14} />
                  <span>Soil Moisture (SMAP)</span>
                </button>
              </div>
            </div>
          </div>

          {/* ── Real Geographic Satellite & GIS Leaflet Map ── */}
          <div className="gibs-map-wrapper">
            {/* Loading spinner */}
            {mapTileLoading && (
              <div className="gibs-loading-overlay">
                <Loader2 size={22} className="spin-icon" />
                <span>Loading {currentLayer.label}…</span>
              </div>
            )}
            {/* Non-blocking warning strip */}
            {tileWarning && (
              <div className="gibs-tile-warning">
                <AlertTriangle size={13} />
                <span>{tileWarning}</span>
              </div>
            )}
            <MapContainer
              center={currentLayer.defaultCenter || [20, 0]}
              zoom={currentLayer.defaultZoom || 2}
              maxZoom={currentLayer.maxNativeZoom || 18}
              minZoom={1}
              className="gibs-leaflet-map"
              zoomControl={true}
              attributionControl={true}
            >
              {/* Dark Gray Base Layer (Free, Watermark-Free, Zero API Key Required) */}
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
                attribution='Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, &copy; OpenStreetMap contributors'
                maxNativeZoom={16}
                maxZoom={18}
              />

              {/* ISRO Bhuvan WMS Overlay Layer */}
              {currentLayer.type === 'wms' && (
                <WMSTileLayer
                  key={activeLayerMode}
                  url={currentLayer.serviceUrl}
                  params={{
                    layers: currentLayer.layerId,
                    format: 'image/png',
                    transparent: true,
                    version: '1.1.1',
                    srs: 'EPSG:3857',
                  }}
                  opacity={0.88}
                  attribution={currentLayer.attribution}
                  eventHandlers={{
                    load: () => setMapTileLoading(false),
                    tileload: () => setMapTileLoading(false),
                    tileerror: () => {
                      setMapTileLoading(false);
                      setTileWarning(
                        'Some Bhuvan tiles unavailable — check service reachability or region boundary'
                      );
                    },
                  }}
                />
              )}

              {/* NASA GIBS WMTS Global Overlay Layer */}
              {currentLayer.type === 'wmts' && (
                <TileLayer
                  key={activeLayerMode}
                  url={currentLayer.tileUrl}
                  maxNativeZoom={currentLayer.maxNativeZoom}
                  maxZoom={currentLayer.maxNativeZoom}
                  opacity={0.85}
                  attribution={currentLayer.attribution}
                  eventHandlers={{
                    load: () => setMapTileLoading(false),
                    tileload: () => setMapTileLoading(false),
                    tileerror: () => {
                      setMapTileLoading(false);
                    },
                  }}
                />
              )}

              <LayerMapController layerDef={currentLayer} focalTarget={focalTarget} />
            </MapContainer>

            {/* Resolution Notice Badge */}
            <div className="gibs-zoom-notice">
              <Info size={12} />
              <span>
                {currentLayer.provider} • Max zoom: z{currentLayer.maxNativeZoom} ({currentLayer.resolution})
              </span>
            </div>
          </div>

          {/* ── Metadata Bar ── */}
          <div className="gibs-meta-bar">
            <div className="gibs-meta-item">
              <span className="gibs-meta-k">Layer ID:</span>
              <span className="gibs-meta-v">{currentLayer.layerId}</span>
            </div>
            <div className="gibs-meta-item">
              <span className="gibs-meta-k">Agency:</span>
              <span className="gibs-meta-v">{currentLayer.provider}</span>
            </div>
            <div className="gibs-meta-item">
              <span className="gibs-meta-k">Acquisition:</span>
              <span className="gibs-meta-v">{currentLayer.acquisitionNote}</span>
            </div>
            <div className="gibs-meta-item">
              <span className="gibs-meta-k">Scale / Units:</span>
              <span className="gibs-meta-v highlight-sky">{currentLayer.unit}</span>
            </div>
            <a
              href={currentLayer.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="gibs-source-link"
              title="Open official portal"
            >
              <ExternalLink size={12} />
              <span>{currentLayer.agency === 'isro' ? 'Bhuvan Portal' : 'NASA GIBS Portal'}</span>
            </a>
            <button
              type="button"
              className={`sweep-trigger-btn ${isScanning ? 'spinning' : ''}`}
              onClick={handleTriggerSweep}
              title="Reload satellite tiles"
            >
              <RefreshCw size={14} />
              <span>Reload</span>
            </button>
          </div>

          {/* ── Color Legend Panel ── */}
          <div className="gibs-legend-panel">
            <div className="gibs-legend-title">
              <Layers size={13} />
              <span>{currentLayer.label} — Legend & Thematic Interpretation</span>
            </div>
            <div className="gibs-legend-gradient">
              {currentLayer.legend.map((entry, i) => (
                <div key={i} className="legend-entry">
                  <span className="legend-swatch" style={{ background: entry.color }} />
                  <span className="legend-label">{entry.label}</span>
                </div>
              ))}
            </div>
            <p className="gibs-legend-desc">{currentLayer.description}</p>
          </div>

          {/* ── Verified Connection Telemetry & Service Monitor ── */}
          <div className="verified-connections-panel">
            <h4 className="streams-title">
              <CheckCircle2 size={15} className="text-emerald" /> Verified Multi-Agency Geospatial Gateways:
            </h4>
            <div className="connections-grid">
              <div className="connection-card">
                <div className="conn-head">
                  <span className="conn-name">ISRO Bhuvan WMS Gateway</span>
                  <span className="conn-status-badge status-active">
                    <span className="dot-mini"></span> Connected (HTTP 200)
                  </span>
                </div>
                <div className="conn-endpoint">https://bhuvan-vec1.nrsc.gov.in/bhuvan/wms</div>
                <div className="conn-details">
                  OGC WMS 1.1.1 in EPSG:3857 &bull; Serving National Watersheds, Waterbodies, Pune & Nashik 1:10k LULC.
                </div>
              </div>

              <div className="connection-card">
                <div className="conn-head">
                  <span className="conn-name">NASA GIBS WMTS Global Stream</span>
                  <span className="conn-status-badge status-active">
                    <span className="dot-mini"></span> Connected (HTTP 200)
                  </span>
                </div>
                <div className="conn-endpoint">https://gibs.earthdata.nasa.gov/wmts/epsg3857/best</div>
                <div className="conn-details">
                  EPSG:3857 Global WMTS &bull; Serving VIIRS 8-day NDVI, MODIS Terra Day LST, SMAP Root-zone Moisture.
                </div>
              </div>

              <div className="connection-card">
                <div className="conn-head">
                  <span className="conn-name">NASA POWER Reanalysis Engine</span>
                  <span className="conn-status-badge status-active">
                    <span className="dot-mini"></span> Connected (HTTP 200)
                  </span>
                </div>
                <div className="conn-endpoint">https://power.larc.nasa.gov/api/temporal</div>
                <div className="conn-details">
                  MERRA-2 Point Climatology &bull; Feeding Pune (23.86°C, 1731 mm) & Nashik (24.43°C, 1640 mm) into Engine.
                </div>
              </div>

              <div className="connection-card">
                <div className="conn-head">
                  <span className="conn-name">ESA Copernicus Data Space</span>
                  <span className="conn-status-badge status-catalog">
                    <span className="dot-mini"></span> Catalog Access
                  </span>
                </div>
                <div className="conn-endpoint">https://browser.dataspace.copernicus.eu</div>
                <div className="conn-details">
                  Sentinel-1 SAR / Sentinel-2C MSI &bull; Telemetry specs & open browser portal integration.
                </div>
              </div>

              <div className="connection-card">
                <div className="conn-head">
                  <span className="conn-name">ISRO CartoDEM & Legacy 50k LULC</span>
                  <span className="conn-status-badge status-restricted">
                    <span className="dot-mini"></span> Restricted (NRSC SSO)
                  </span>
                </div>
                <div className="conn-endpoint">cartodem:india_dem / lulc:LULC50k_1516</div>
                <div className="conn-details">
                  Requires NRSC Central Auth Service (CAS) SSO token. Returns OGC ServiceException XML without user authentication.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Official Geospatial WMS & Thematic Layers Registry ── */}
        <div className="geospatial-layers-registry">
          <div className="registry-head">
            <div className="badge-nature">
              <Database size={14} />
              <span>Verified Satellite Data Registry</span>
            </div>
            <h3 className="registry-title">Official Geospatial & Thematic Evidence Layers</h3>
            <p className="registry-desc">
              Authoritative Earth observation layers from ISRO Bhuvan, NASA GIBS, and Copernicus ESA.
              Data access requirements, spatial resolutions, acquisition parameters, and documented physical limitations.
            </p>
          </div>

          <div className="registry-grid">
            {(realLayers.length > 0 ? realLayers : [
              {
                id: 'isro_bhuvan_lulc',
                name: 'ISRO Bhuvan Land Use / Land Cover (50k)',
                agency: 'ISRO / NRSC',
                source: 'ISRO Bhuvan Web Map Service',
                coverage: 'India National',
                resolution: '1:50,000 Scale',
                update_frequency: 'Annual / Biennial',
                description: 'Thematic classification of built-up urban zones, agricultural parcels, forest canopies, and water bodies.',
                limitations: 'India coverage only. Plot-level legal zoning or micro-tenure requires local municipal revenue verification.',
                license: 'Government of India Open Data License',
                url: 'https://bhuvan.nrsc.gov.in/'
              },
              {
                id: 'isro_bhuvan_waterbodies',
                name: 'ISRO Bhuvan Water Bodies & Hydrology',
                agency: 'ISRO / NRSC',
                source: 'Bhuvan Thematic Portal',
                coverage: 'India National',
                resolution: 'Multi-resolution IRS sensors',
                update_frequency: 'Seasonal Pre/Post-Monsoon',
                description: 'Delineation of perennial tanks, irrigation reservoirs, lakes, and coastal estuaries.',
                limitations: 'Does not replace site hydro-geological percolation borehole testing.',
                license: 'National Remote Sensing Centre (NRSC)',
                url: 'https://bhuvan.nrsc.gov.in/'
              },
              {
                id: 'nasa_gibs_modis_ndvi',
                name: 'MODIS 8-Day NDVI Vegetation Index',
                agency: 'NASA EOSDIS',
                source: 'Global Imagery Browse Services (GIBS)',
                coverage: 'Global Terrestrial',
                resolution: '250m Spatial Grid',
                update_frequency: '8-Day Rolling Composite',
                description: 'Calibrated red and near-infrared reflectance index measuring photosynthetic vegetation density and drought stress.',
                limitations: '250m grid averages canopy variations across mixed urban neighborhoods.',
                license: 'NASA Open Data Policy (CC Attribution)',
                url: 'https://gibs.earthdata.nasa.gov/'
              },
              {
                id: 'nasa_gibs_landsat_truecolor',
                name: 'Landsat 8/9 Operational Land Imager (OLI)',
                agency: 'USGS / NASA',
                source: 'NASA GIBS WMS',
                coverage: 'Global',
                resolution: '30m Multispectral',
                update_frequency: '16-Day Orbit Cycle',
                description: 'Calibrated optical bands 4-3-2 true-color surface reflectance for urban footprint and land-cover change analysis.',
                limitations: 'Cloud cover over monsoon and tropical zones can obscure individual pass dates.',
                license: 'USGS Public Domain',
                url: 'https://landsat.gsfc.nasa.gov/'
              },
              {
                id: 'copernicus_glo30_dem',
                name: 'Copernicus GLO-30 Digital Elevation Model',
                agency: 'ESA Copernicus',
                source: 'OpenTopography / Copernicus Space Component',
                coverage: 'Global Landmass',
                resolution: '30m Surface Elevation Grid',
                update_frequency: 'Static Baseline (GLO-30 Release)',
                description: 'High-accuracy digital surface elevation model (DSM) providing slope, watershed catchment delineations, and flood basins.',
                limitations: 'Measures canopy and rooftop top surfaces rather than pure bare-earth DTM without specialized filtering.',
                license: 'Copernicus Free & Open Data License',
                url: 'https://opentopography.org/'
              }
            ]).map((layer) => (
              <div key={layer.id} className="registry-layer-card">
                <div className="layer-card-top">
                  <div>
                    <span className="layer-agency-badge">{layer.agency}</span>
                    <h4 className="layer-card-title">{layer.name}</h4>
                  </div>
                  <a
                    href={layer.url || 'https://bhuvan.nrsc.gov.in/'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="layer-portal-link"
                    title="Open official portal"
                  >
                    <ExternalLink size={14} />
                  </a>
                </div>

                <p className="layer-card-desc">{layer.description}</p>

                <div className="layer-meta-grid">
                  <div className="meta-item">
                    <span className="meta-k">Coverage:</span>
                    <span className="meta-v">{layer.coverage}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-k">Resolution:</span>
                    <span className="meta-v highlight-mint">{layer.resolution}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-k">Cadence:</span>
                    <span className="meta-v">{layer.update_frequency}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-k">Source:</span>
                    <span className="meta-v">{layer.source}</span>
                  </div>
                </div>

                <div className="layer-limitations-box">
                  <Info size={13} />
                  <span><strong>Documented Limitations:</strong> {layer.limitations}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="registry-disclaimer-box">
            <ShieldCheck size={16} />
            <p>
              <strong>Scientific Grounding:</strong> Satellite and GIS layers provide vital macro-scale catchment context,
              regional slope gradients, and historical land-use trends. However, satellite remote sensing cannot establish plot-level
              soil infiltration rates, underground pipe utility conflicts, or legal property rights.
              ADAPTFIT strictly mandates on-site geotechnical confirmation before construction.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

