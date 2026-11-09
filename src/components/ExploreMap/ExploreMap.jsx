import React, { useState } from 'react';
import {
  MapPin,
  Compass,
  AlertTriangle,
  Layers,
  ArrowRight,
  ShieldAlert,
  Droplets,
  Trees,
  MountainSnow
} from 'lucide-react';
import './ExploreMap.css';

const BIOME_ZONES = [
  {
    id: 'zone-deltas',
    name: 'Bay of Bengal & Mekong Deltas',
    coords: '21.5°N, 89.2°E',
    biome: 'Coastal Estuary',
    x: '68%',
    y: '48%',
    riskLevel: 'Severe Surge & Salinization',
    vulnerability: 'Cyclonic storm surges, coastal erosion, drinking aquifer salinization.',
    recommendedAdaptationId: 'mangrove-bioshields',
    recommendedTitle: 'Mangrove Bio-Shields & Living Reefs',
    impactScore: '66% Wave Energy Dissipation'
  },
  {
    id: 'zone-himalayas',
    name: 'Himalayan Glacial Cryosphere',
    coords: '28.1°N, 86.8°E',
    biome: 'High Alpine Permafrost',
    x: '65%',
    y: '42%',
    riskLevel: 'Extreme Glacial Outburst (GLOF)',
    vulnerability: 'Accelerated moraine dam failure, sudden outburst deluge, sediment torrents.',
    recommendedAdaptationId: 'alpine-glof-spillways',
    recommendedTitle: 'Alpine Glacial Siphon & Moraine Spillways',
    impactScore: '99.4% Valley Breach Reduction'
  },
  {
    id: 'zone-mediterranean',
    name: 'Iberian & Southern Mediterranean',
    coords: '38.5°N, 0.5°W',
    biome: 'Semi-Arid Scrub & WUI',
    x: '46%',
    y: '38%',
    riskLevel: 'Megafire & Thermal Strain',
    vulnerability: 'Extended 45°C heat domes, catastrophic crown wildfire propagation.',
    recommendedAdaptationId: 'fire-resilient-buffers',
    recommendedTitle: 'Fire-Resilient Agro-Ecological Buffers',
    impactScore: '74% Flame Front Velocity Drop'
  },
  {
    id: 'zone-pearl-river',
    name: 'Greater Bay Urban Delta',
    coords: '22.8°N, 113.6°E',
    biome: 'Hyper-Dense Megalopolis',
    x: '74%',
    y: '49%',
    riskLevel: 'Urban Flash Deluge & Heat Island',
    vulnerability: 'Impervious concrete runoff saturation, severe street canyon heat retention.',
    recommendedAdaptationId: 'sponge-corridors',
    recommendedTitle: 'Urban Sponge Corridors & Bioswales',
    impactScore: '78% Peak Flash Flood Abatement'
  },
  {
    id: 'zone-andes',
    name: 'Andean Inter-Valley Basin',
    coords: '12.0°S, 77.0°W',
    biome: 'Arid Rain Shadow Basin',
    x: '28%',
    y: '68%',
    riskLevel: 'Chronic Aquifer Depletion',
    vulnerability: 'Severe seasonal glacier runoff deficit, agricultural groundwater overdraft.',
    recommendedAdaptationId: 'aquifer-recharge-wells',
    recommendedTitle: 'Managed Subterranean Aquifer Storage (MAR)',
    impactScore: '1.8B L Clean Water Stored/Site'
  }
];

export default function ExploreMap({ onSelectAdaptationById }) {
  const [activeZone, setActiveZone] = useState(BIOME_ZONES[0]);

  return (
    <section className="explore-map-section" id="explore-map">
      <div className="container">
        {/* Head */}
        <div className="section-head text-center">
          <div className="badge-sky">
            <Compass size={14} />
            <span>Planetary Biome Telemetry</span>
          </div>
          <h2 className="section-title">
            Interactive Planetary <span className="title-sky">Vulnerability Map</span>
          </h2>
          <p className="section-sub">
            Simulate regional climate stress vectors across planetary hotspots. Inspect matched nature-based adaptations calibrated to local geology and hydrology.
          </p>
        </div>

        {/* Map Interactive Container */}
        <div className="map-interface-grid">
          {/* Visual Map Surface */}
          <div className="map-display-surface">
            {/* World Grid SVG Background */}
            <svg
              className="world-grid-svg"
              viewBox="0 0 1000 520"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(56, 189, 248, 0.08)" strokeWidth="1" />
                </pattern>
                <linearGradient id="continentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0b2e24" />
                  <stop offset="100%" stopColor="#072018" />
                </linearGradient>
              </defs>

              {/* Grid Background */}
              <rect width="1000" height="520" fill="url(#gridPattern)" />

              {/* Continents Silhouettes */}
              {/* North America */}
              <path
                d="M 120 80 Q 220 70 280 140 Q 250 200 210 240 L 230 270 L 190 280 L 170 230 L 120 200 Z"
                fill="url(#continentGrad)"
                stroke="rgba(16, 185, 129, 0.25)"
                strokeWidth="1.5"
              />
              {/* South America */}
              <path
                d="M 240 290 Q 320 310 310 390 Q 280 470 250 490 L 230 450 L 240 370 Z"
                fill="url(#continentGrad)"
                stroke="rgba(16, 185, 129, 0.25)"
                strokeWidth="1.5"
              />
              {/* Europe & Africa */}
              <path
                d="M 420 100 Q 520 90 530 150 L 480 190 L 430 160 Z"
                fill="url(#continentGrad)"
                stroke="rgba(16, 185, 129, 0.25)"
                strokeWidth="1.5"
              />
              <path
                d="M 440 200 Q 540 210 550 300 Q 520 400 470 430 Q 420 340 430 250 Z"
                fill="url(#continentGrad)"
                stroke="rgba(16, 185, 129, 0.25)"
                strokeWidth="1.5"
              />
              {/* Eurasia */}
              <path
                d="M 540 100 Q 750 70 860 140 Q 820 250 740 280 Q 640 230 580 200 Z"
                fill="url(#continentGrad)"
                stroke="rgba(16, 185, 129, 0.25)"
                strokeWidth="1.5"
              />
              {/* South Asia & Australia */}
              <path
                d="M 640 260 L 700 270 L 680 340 L 630 310 Z"
                fill="url(#continentGrad)"
                stroke="rgba(16, 185, 129, 0.25)"
                strokeWidth="1.5"
              />
              <path
                d="M 750 350 Q 860 340 850 430 Q 770 450 740 400 Z"
                fill="url(#continentGrad)"
                stroke="rgba(16, 185, 129, 0.25)"
                strokeWidth="1.5"
              />
            </svg>

            {/* Hotspot Radar Markers */}
            {BIOME_ZONES.map((zone) => {
              const isSelected = activeZone.id === zone.id;
              return (
                <button
                  key={zone.id}
                  className={`map-hotspot ${isSelected ? 'active' : ''}`}
                  style={{ left: zone.x, top: zone.y }}
                  onClick={() => setActiveZone(zone)}
                  aria-label={`Inspect ${zone.name}`}
                >
                  <span className="hotspot-pulse"></span>
                  <span className="hotspot-dot"></span>
                  <span className="hotspot-label">{zone.name}</span>
                </button>
              );
            })}

            {/* Map Legend Overlay */}
            <div className="map-legend">
              <span className="legend-title">Bioregion Scanner</span>
              <div className="legend-row">
                <span className="legend-dot green"></span>
                <span>Active Adaptation Field Site</span>
              </div>
              <div className="legend-row">
                <span className="legend-dot blue"></span>
                <span>Telemetry Hydro-Station</span>
              </div>
            </div>
          </div>

          {/* Active Hotspot Telemetry Card */}
          <div className="map-info-panel">
            <div className="info-panel-header">
              <div className="badge-nature">{activeZone.biome}</div>
              <span className="zone-coords">{activeZone.coords}</span>
            </div>

            <h3 className="zone-title">{activeZone.name}</h3>

            <div className="vulnerability-box">
              <div className="vuln-header">
                <AlertTriangle size={16} className="vuln-icon" />
                <span className="vuln-label">{activeZone.riskLevel}</span>
              </div>
              <p className="vuln-desc">{activeZone.vulnerability}</p>
            </div>

            <div className="matched-strategy-box">
              <span className="matched-label">Recommended Nature-Based Solution:</span>
              <h4 className="matched-title">{activeZone.recommendedTitle}</h4>
              <span className="matched-metric">{activeZone.impactScore}</span>

              <button
                type="button"
                className="deploy-inspect-btn"
                onClick={() => onSelectAdaptationById(activeZone.recommendedAdaptationId)}
              >
                <span>Inspect Adaptation Blueprint</span>
                <ArrowRight size={16} />
              </button>
            </div>

            {/* Quick Switch Zone Pills */}
            <div className="quick-zones-list">
              <span className="quick-zones-title">Cycle Focus Zones:</span>
              <div className="quick-pills">
                {BIOME_ZONES.map((z) => (
                  <button
                    key={z.id}
                    className={`quick-pill ${activeZone.id === z.id ? 'active' : ''}`}
                    onClick={() => setActiveZone(z)}
                  >
                    {z.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

