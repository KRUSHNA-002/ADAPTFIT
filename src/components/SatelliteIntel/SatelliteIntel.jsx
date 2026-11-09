import React, { useState } from 'react';
import {
  Radio,
  Satellite,
  Wifi,
  Activity,
  Maximize2,
  RefreshCw,
  Gauge,
  CheckCircle2
} from 'lucide-react';
import { SATELLITE_ORBIT_CHANNELS, TELEMETRY_STREAMS } from '../../data/satelliteData';
import './SatelliteIntel.css';

export default function SatelliteIntel() {
  const [selectedChannel, setSelectedChannel] = useState(SATELLITE_ORBIT_CHANNELS[0]);
  const [isScanning, setIsScanning] = useState(false);

  const handleTriggerSweep = () => {
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 1400);
  };

  return (
    <section className="satellite-intel-section" id="satellite-intel">
      <div className="container">
        {/* Head */}
        <div className="section-head text-center">
          <div className="badge-sky">
            <Radio size={14} />
            <span>Earth Observation Radar</span>
          </div>
          <h2 className="section-title">
            Satellite Intelligence & <span className="title-sky">Bio-Sensors</span>
          </h2>
          <p className="section-sub">
            Real-time orbital tracking of canopy NDVI health, thermal infrared urban heat islands, and high-altitude glacial lake hydrostatics.
          </p>
        </div>

        {/* Orbit Constellation Console */}
        <div className="satellite-console">
          {/* Channel Selector Sidebar */}
          <div className="console-channels">
            <div className="channels-header">
              <Satellite size={16} className="sat-icon" />
              <span>Orbital Sensor Array</span>
            </div>

            <div className="channels-list">
              {SATELLITE_ORBIT_CHANNELS.map((ch) => {
                const isActive = selectedChannel.id === ch.id;
                return (
                  <button
                    key={ch.id}
                    className={`channel-btn ${isActive ? 'active' : ''}`}
                    onClick={() => setSelectedChannel(ch)}
                  >
                    <div className="channel-top">
                      <span className="channel-sat-name">{ch.satellite}</span>
                      <span className="channel-status-dot"></span>
                    </div>
                    <span className="channel-focus">{ch.focus}</span>
                    <span className="channel-band">{ch.band}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Sensor Scanner Screen */}
          <div className="console-display">
            <div className="display-top-bar">
              <div className="display-channel-info">
                <span className="sensor-tag">ACTIVE TELEMETRY:</span>
                <span className="sensor-name">{selectedChannel.satellite}</span>
              </div>
              <div className="display-actions">
                <button
                  type="button"
                  className={`sweep-btn ${isScanning ? 'spinning' : ''}`}
                  onClick={handleTriggerSweep}
                  title="Refresh orbital sweep"
                >
                  <RefreshCw size={14} />
                  <span>Calibrate Sweep</span>
                </button>
              </div>
            </div>

            {/* Radar Simulation Screen */}
            <div className="radar-screen">
              <div className={`radar-sweep-beam ${isScanning ? 'active' : ''}`}></div>
              <div className="radar-concentric circle-1"></div>
              <div className="radar-concentric circle-2"></div>
              <div className="radar-concentric circle-3"></div>
              <div className="radar-crosshair-x"></div>
              <div className="radar-crosshair-y"></div>

              {/* Simulated Biome Anomaly Targets */}
              <div className="radar-blip blip-1" title="Urban Sponge Sector 7">
                <span className="blip-ping"></span>
                <span className="blip-core"></span>
              </div>
              <div className="radar-blip blip-2" title="Alpine Moraine Sensor">
                <span className="blip-ping"></span>
                <span className="blip-core"></span>
              </div>
              <div className="radar-blip blip-3" title="Coastal Reef Buffer Beta">
                <span className="blip-ping"></span>
                <span className="blip-core"></span>
              </div>

              {/* Overlay Sensor HUD */}
              <div className="radar-hud-bottom">
                <div className="hud-metric">
                  <span className="hud-label">Spectral Band:</span>
                  <span className="hud-value">{selectedChannel.band}</span>
                </div>
                <div className="hud-metric">
                  <span className="hud-label">Ground Resolution:</span>
                  <span className="hud-value">{selectedChannel.resolution}</span>
                </div>
                <div className="hud-metric">
                  <span className="hud-label">Constellation Revisit:</span>
                  <span className="hud-value">{selectedChannel.frequency}</span>
                </div>
              </div>
            </div>

            {/* Telemetry Stream Ticker */}
            <div className="telemetry-feed">
              <div className="feed-header">
                <Activity size={14} className="activity-icon" />
                <span>Live Ground Hydro-Stations:</span>
              </div>
              <div className="feed-grid">
                {TELEMETRY_STREAMS.map((stream, idx) => (
                  <div key={idx} className="feed-item">
                    <div className="feed-station-info">
                      <span className="feed-station">{stream.station}</span>
                      <span className="feed-coords">{stream.coords}</span>
                    </div>
                    <div className="feed-reading">
                      <span className="reading-val">{stream.value}</span>
                      <span className="reading-status">{stream.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

