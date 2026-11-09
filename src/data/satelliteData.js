export const SATELLITE_ORBIT_CHANNELS = [
  {
    id: 'sentinel-ndvi',
    satellite: 'Sentinel-2C Multispectral',
    band: 'B8 / NIR & Red (NDVI)',
    focus: 'Canopy Density & Drought Stress',
    resolution: '10m Spatial Grid',
    frequency: '5-Day Global Revisit',
    activeAnomalyCount: 3,
    status: 'Nominal Telemetry',
    color: '#10b981'
  },
  {
    id: 'landsat-tir',
    satellite: 'Landsat-9 TIRS-2',
    band: 'Thermal Infrared (10.8µm)',
    focus: 'Urban Heat Islands & Façade Radiance',
    resolution: '30m Thermal Calibration',
    frequency: '8-Day Orbit Phase',
    activeAnomalyCount: 5,
    status: 'Nominal Telemetry',
    color: '#38bdf8'
  },
  {
    id: 'smap-soil',
    satellite: 'NASA SMAP Radiometer',
    band: 'L-Band Microwave (1.4 GHz)',
    focus: 'Top 5cm Soil Volumetric Moisture',
    resolution: '3km Interpolated Grid',
    frequency: '3-Day Refresh Cycle',
    activeAnomalyCount: 2,
    status: 'Active Scanning',
    color: '#059669'
  },
  {
    id: 'cryosat-interferometer',
    satellite: 'ESA CryoSat-2 SIRAL',
    band: 'Ku-Band Radar Altimetry',
    focus: 'Glacial Outburst Lake Elevation Creep',
    resolution: 'Centimeter-Grade Vertical',
    frequency: 'Continuous Orbital Track',
    activeAnomalyCount: 1,
    status: 'High Vigilance',
    color: '#0284c7'
  }
];

export const TELEMETRY_STREAMS = [
  {
    station: 'Indo-Gangetic Aquifer Monitoring Grid',
    coords: '28.61° N, 77.20° E',
    metric: 'Aquifer Infiltration Rate',
    value: '+412 L/sec',
    status: 'Enhanced Recovery',
    trend: 'rising'
  },
  {
    station: 'Sundarbans Delta Mangrove Swell Sensor Alpha',
    coords: '21.94° N, 89.18° E',
    metric: 'Surge Energy Attenuation',
    value: '67.8%',
    status: 'Buffer Active',
    trend: 'stable'
  },
  {
    station: 'Alpine Khumbu Glacial Siphon Station 4',
    coords: '27.98° N, 86.92° E',
    metric: 'Hydrostatic Pressure',
    value: '1.24 MPa',
    status: 'Controlled Spill',
    trend: 'falling'
  },
  {
    station: 'Mediterranean Coastal Marram Dune Transect',
    coords: '43.52° N, 3.88° E',
    metric: 'Crest Accretion Rate',
    value: '+0.11 m/mo',
    status: 'Vegetative Trapping',
    trend: 'rising'
  }
];

