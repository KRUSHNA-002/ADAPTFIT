import React, { useState, useEffect, useCallback } from 'react';
import {
  Clock, TrendingUp, CloudRain, Thermometer, AlertTriangle,
  Sparkles, RefreshCw, Database, Info, Loader2, MapPin,
  ArrowRight, BarChart3,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { Link } from 'react-router-dom';
import Breadcrumbs from '../../components/Breadcrumbs/Breadcrumbs';
import { useAdaptations } from '../../context/AdaptationsContext';
import { climateApi } from '../../api/climateApi';
import { createAdaptfitLocation } from '../../utils/locationTypes';
import './ClimateMemoryPage.css';

// ─── Shared Recharts styling ─────────────────────────────────────────────────
const CHART_STYLE = {
  background: 'transparent',
  fontFamily: 'var(--font-sans)',
  fontSize: 12,
};

const COLORS = {
  maxTemp: '#ef4444',
  meanTemp: '#f97316',
  minTemp: '#38bdf8',
  precip: '#38bdf8',
  humidity: '#a78bfa',
  grid: 'rgba(255,255,255,0.08)',
  tick: '#64748b',
};

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <div className="tooltip-label">{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="tooltip-row" style={{ color: p.color }}>
          <span>{p.name}:</span>
          <span className="tooltip-val">{p.value != null ? Number(p.value).toFixed(1) : '—'} {p.unit || ''}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Scenario stress-test definitions ─────────────────────────────────────────
const SCENARIOS = [
  {
    id: 'baseline',
    label: 'Baseline (Observed)',
    tempDelta: 0,
    rainFactor: 1.0,
    color: '#38bdf8',
    description: 'Historical observations unadjusted from NASA POWER reanalysis baseline.',
    impact: 'Operates within documented historical envelope.'
  },
  {
    id: 'hotter',
    label: '+2°C Hotter',
    tempDelta: 2.0,
    rainFactor: 1.0,
    color: '#ef4444',
    description: 'Simulates a +2.0°C mean temperature increase across all annual cycles.',
    impact: 'Accelerated evapotranspiration, increased building heat load, extended summer cooling demands.'
  },
  {
    id: 'drier',
    label: '−20% Rainfall',
    tempDelta: 0,
    rainFactor: 0.8,
    color: '#f59e0b',
    description: 'Simulates a 20% decline in cumulative precipitation.',
    impact: 'Prolonged dry spells, reduced stormwater runoff capture, higher irrigation needs for living biomass.'
  },
  {
    id: 'wetter',
    label: '+25% Rainfall',
    tempDelta: 0,
    rainFactor: 1.25,
    color: '#10b981',
    description: 'Simulates a 25% surge in cumulative rainfall volume.',
    impact: 'Higher peak surge volume, potential ponding surcharge, increased detention capacity requirement.'
  },
  {
    id: 'combined',
    label: 'Combined (+2°C & −20%)',
    tempDelta: 2.0,
    rainFactor: 0.8,
    color: '#a78bfa',
    description: 'Simulates concurrent heatwave intensity (+2.0°C) with prolonged drought (−20% rainfall).',
    impact: 'Compound ecological stress: soil moisture deficit, vegetation desiccation, reduced bioretention filtration.'
  },
];

function applyScenario(yearlyData, scenario) {
  if (!yearlyData) return [];
  return Object.values(yearlyData).map((yr) => ({
    year: yr.year,
    baseline_temp_c: yr.avg_temp_c != null ? +yr.avg_temp_c.toFixed(2) : null,
    avg_temp_c: yr.avg_temp_c != null ? +(yr.avg_temp_c + scenario.tempDelta).toFixed(2) : null,
    baseline_precip_mm: yr.annual_precip_mm != null ? +yr.annual_precip_mm.toFixed(1) : null,
    annual_precip_mm: yr.annual_precip_mm != null ? +(yr.annual_precip_mm * scenario.rainFactor).toFixed(1) : null,
  }));
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function ClimateMemoryPage() {
  const { mapLocationA, mapLocationB, setMapLocationA, setMapLocationB } = useAdaptations();

  const [activeLocation, setActiveLocation] = useState('A');
  const [startYear, setStartYear] = useState(2010);
  const [endYear] = useState(2023);
  const [historical, setHistorical] = useState(null);
  const [climatology, setClimatology] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeScenario, setActiveScenario] = useState('baseline');
  const [compareMode, setCompareMode] = useState(false);
  const [comparisonData, setComparisonData] = useState(null);

  const handleLoadBenchmarkPair = () => {
    const locA = createAdaptfitLocation({
      id: 'loc_a',
      role: 'reference',
      name: 'Pune, Maharashtra',
      formattedAddress: 'Pune, Maharashtra, India',
      lat: 18.5204,
      lng: 73.8567,
      addressComponents: { country: 'India', administrativeAreaLevel1: 'Maharashtra' }
    });
    const locB = createAdaptfitLocation({
      id: 'loc_b',
      role: 'target',
      name: 'Mumbai Coastal Delta',
      formattedAddress: 'Mumbai, Maharashtra, India',
      lat: 18.9220,
      lng: 72.8347,
      addressComponents: { country: 'India', administrativeAreaLevel1: 'Maharashtra' }
    });
    setMapLocationA(locA);
    setMapLocationB(locB);
  };

  const currentLocation = activeLocation === 'A' ? mapLocationA : mapLocationB;

  const fetchClimate = useCallback(async () => {
    if (!currentLocation) return;
    setLoading(true); setError(''); setHistorical(null); setClimatology(null);
    try {
      const [hist, clim] = await Promise.allSettled([
        climateApi.getHistorical(
          currentLocation.coordinates.lat,
          currentLocation.coordinates.lng,
          startYear, endYear
        ),
        climateApi.getClimatology(
          currentLocation.coordinates.lat,
          currentLocation.coordinates.lng
        ),
      ]);
      if (hist.status === 'fulfilled' && !hist.value.error) setHistorical(hist.value);
      else setError(hist.value?.error || hist.reason?.message || 'Failed to load historical data.');
      if (clim.status === 'fulfilled' && !clim.value.error) setClimatology(clim.value);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [currentLocation, startYear, endYear]);

  useEffect(() => { fetchClimate(); }, [fetchClimate]);

  const fetchComparison = useCallback(async () => {
    if (!mapLocationA || !mapLocationB) return;
    setLoading(true); setError('');
    try {
      const data = await climateApi.compare(
        mapLocationA.coordinates.lat, mapLocationA.coordinates.lng,
        mapLocationB.coordinates.lat, mapLocationB.coordinates.lng,
        startYear, endYear
      );
      setComparisonData(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [mapLocationA, mapLocationB, startYear, endYear]);

  useEffect(() => {
    if (compareMode && mapLocationA && mapLocationB) fetchComparison();
  }, [compareMode, fetchComparison]);

  // Build chart data arrays
  const yearlyArr = historical?.yearly ? Object.values(historical.yearly) : [];
  const activeScenarioObj = SCENARIOS.find((s) => s.id === activeScenario) || SCENARIOS[0];
  const scenarioData = applyScenario(historical?.yearly, activeScenarioObj);
  const monthlyArr = climatology?.monthly || [];

  // Compare chart data
  const compareArr = comparisonData
    ? Object.values(comparisonData.location_a?.yearly || {}).map((yr) => {
        const yrB = comparisonData.location_b?.yearly?.[String(yr.year)];
        return {
          year: yr.year,
          temp_a: yr.avg_temp_c,
          temp_b: yrB?.avg_temp_c,
          rain_a: yr.annual_precip_mm,
          rain_b: yrB?.annual_precip_mm,
        };
      })
    : [];

  const noLocation = !mapLocationA && !mapLocationB;
  const backendError = error.includes('Cannot connect') || error.includes('backend');

  return (
    <div className="page-wrapper climate-memory-page">
      <Breadcrumbs />

      {/* Header */}
      <section className="page-header-section">
        <div className="container">
          <div className="page-header-badge">
            <Clock size={15} />
            <span>Historical Climate Intelligence</span>
          </div>
          <h1 className="page-title">
            Climate <span className="title-sky">Memory</span>
          </h1>
          <p className="page-subtitle">
            Real historical climate data from NASA POWER (1981–2023) for your selected locations.
            Run sensitivity scenarios to understand how climate shifts affect adaptation suitability.
          </p>
          <div className="data-source-pill">
            <Database size={12} />
            <span>Source: NASA POWER MERRA-2/GEOS-5 Reanalysis · ~0.5° grid resolution · No API key required</span>
          </div>
        </div>
      </section>

      <div className="container climate-body">

        {/* No location */}
        {noLocation && (
          <div className="no-location-card">
            <MapPin size={36} />
            <h3>No locations selected</h3>
            <p>Select Reference Location A and Target Location B on the Explore Map to load real climate data.</p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.5rem' }}>
              <Link to="/explore-map" className="btn-primary">
                <span>Go to Explore Map</span>
                <ArrowRight size={16} />
              </Link>
              <button
                type="button"
                className="btn-primary"
                style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(56, 189, 248, 0.25))', border: '1px solid rgba(56, 189, 248, 0.4)' }}
                onClick={handleLoadBenchmarkPair}
              >
                <Sparkles size={16} />
                <span>Quick Load Benchmark: Pune → Mumbai</span>
              </button>
            </div>
          </div>
        )}

        {!noLocation && (
          <>
            {/* Location + Controls Bar */}
            <div className="climate-controls-bar">
              <div className="location-tabs">
                {mapLocationA && (
                  <button
                    type="button"
                    className={`loc-tab ${activeLocation === 'A' && !compareMode ? 'active-a' : ''}`}
                    onClick={() => { setActiveLocation('A'); setCompareMode(false); }}
                  >
                    <span className="dot-a" />
                    {mapLocationA.name}
                  </button>
                )}
                {mapLocationB && (
                  <button
                    type="button"
                    className={`loc-tab ${activeLocation === 'B' && !compareMode ? 'active-b' : ''}`}
                    onClick={() => { setActiveLocation('B'); setCompareMode(false); }}
                  >
                    <span className="dot-b" />
                    {mapLocationB.name}
                  </button>
                )}
                {mapLocationA && mapLocationB && (
                  <button
                    type="button"
                    className={`loc-tab ${compareMode ? 'active-compare' : ''}`}
                    onClick={() => setCompareMode(true)}
                  >
                    <BarChart3 size={14} /> A vs B
                  </button>
                )}
              </div>

              <div className="year-range-controls">
                <label className="ctrl-label">From:</label>
                <select
                  className="year-select"
                  value={startYear}
                  onChange={(e) => setStartYear(Number(e.target.value))}
                >
                  {[1990, 1995, 2000, 2005, 2010, 2015].map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                <span className="ctrl-label">to 2023</span>
                <button
                  type="button"
                  className="refresh-btn"
                  onClick={compareMode ? fetchComparison : fetchClimate}
                  disabled={loading}
                  title="Refresh data"
                >
                  <RefreshCw size={14} className={loading ? 'spin-icon' : ''} />
                </button>
              </div>
            </div>

            {/* Backend error */}
            {backendError && (
              <div className="backend-error-card">
                <AlertTriangle size={20} />
                <div>
                  <strong>Flask Backend Required</strong>
                  <p>Start the backend to load real NASA POWER climate data:</p>
                  <code>cd backend && python app.py</code>
                </div>
              </div>
            )}

            {/* Non-backend error */}
            {error && !backendError && (
              <div className="api-error-banner">
                <AlertTriangle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="climate-loading">
                <Loader2 size={28} className="spin-icon" />
                <span>Fetching real climate data from NASA POWER…</span>
              </div>
            )}

            {/* ── Single location charts ── */}
            {!compareMode && !loading && historical && (
              <>
                {/* Summary Stats */}
                <div className="climate-stats-row">
                  {[
                    { label: 'Avg Temperature', val: _avg(yearlyArr, 'avg_temp_c'), unit: '°C', icon: <Thermometer size={18} />, color: '#f97316' },
                    { label: 'Max Temperature', val: _avg(yearlyArr, 'avg_max_temp_c'), unit: '°C', icon: <TrendingUp size={18} />, color: '#ef4444' },
                    { label: 'Annual Rainfall', val: _avg(yearlyArr, 'annual_precip_mm'), unit: 'mm', icon: <CloudRain size={18} />, color: '#38bdf8' },
                    { label: 'Avg Humidity', val: _avg(yearlyArr, 'avg_humidity_pct'), unit: '%', icon: <Sparkles size={18} />, color: '#a78bfa' },
                  ].map((stat) => (
                    <div key={stat.label} className="stat-card" style={{ '--accent': stat.color }}>
                      <div className="stat-icon" style={{ color: stat.color }}>{stat.icon}</div>
                      <div className="stat-val">{stat.val != null ? stat.val.toFixed(1) : '—'}<span className="stat-unit">{stat.unit}</span></div>
                      <div className="stat-label">{stat.label}</div>
                      <div className="stat-period">Mean {startYear}–{endYear}</div>
                    </div>
                  ))}
                </div>

                {/* Temperature Trend Chart */}
                <div className="chart-card">
                  <div className="chart-header">
                    <h3 className="chart-title"><Thermometer size={16} /> Annual Temperature Trend</h3>
                    <span className="chart-source">NASA POWER T2M · {currentLocation.name}</span>
                  </div>
                  <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={yearlyArr} style={CHART_STYLE}>
                      <defs>
                        <linearGradient id="maxGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS.maxTemp} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={COLORS.maxTemp} stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="minGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS.minTemp} stopOpacity={0.2} />
                          <stop offset="95%" stopColor={COLORS.minTemp} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke={COLORS.grid} strokeDasharray="3 3" />
                      <XAxis dataKey="year" tick={{ fill: COLORS.tick, fontSize: 11 }} />
                      <YAxis tick={{ fill: COLORS.tick, fontSize: 11 }} unit="°C" />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
                      <Area type="monotone" dataKey="avg_max_temp_c" name="Max Temp" stroke={COLORS.maxTemp} fill="url(#maxGrad)" strokeWidth={2} unit="°C" dot={false} />
                      <Area type="monotone" dataKey="avg_temp_c" name="Mean Temp" stroke={COLORS.meanTemp} fill="none" strokeWidth={2} unit="°C" dot={false} />
                      <Area type="monotone" dataKey="avg_min_temp_c" name="Min Temp" stroke={COLORS.minTemp} fill="url(#minGrad)" strokeWidth={2} unit="°C" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Rainfall Chart */}
                <div className="chart-card">
                  <div className="chart-header">
                    <h3 className="chart-title"><CloudRain size={16} /> Annual Precipitation</h3>
                    <span className="chart-source">NASA POWER PRECTOTCORR · {currentLocation.name}</span>
                  </div>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={yearlyArr} style={CHART_STYLE}>
                      <CartesianGrid stroke={COLORS.grid} strokeDasharray="3 3" />
                      <XAxis dataKey="year" tick={{ fill: COLORS.tick, fontSize: 11 }} />
                      <YAxis tick={{ fill: COLORS.tick, fontSize: 11 }} unit=" mm" />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="annual_precip_mm" name="Annual Rainfall" fill={COLORS.precip} radius={[3, 3, 0, 0]} unit=" mm" />
                      {_avg(yearlyArr, 'annual_precip_mm') && (
                        <ReferenceLine
                          y={_avg(yearlyArr, 'annual_precip_mm')}
                          stroke="rgba(255,255,255,0.3)"
                          strokeDasharray="4 4"
                          label={{ value: 'Mean', fill: '#94a3b8', fontSize: 10 }}
                        />
                      )}
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Monthly Climatology */}
                {monthlyArr.length > 0 && (
                  <div className="chart-card">
                    <div className="chart-header">
                      <h3 className="chart-title"><BarChart3 size={16} /> Monthly Climatology (2001–2020 average)</h3>
                      <span className="chart-source">NASA POWER · {currentLocation.name}</span>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                      <LineChart data={monthlyArr} style={CHART_STYLE}>
                        <CartesianGrid stroke={COLORS.grid} strokeDasharray="3 3" />
                        <XAxis dataKey="month" tick={{ fill: COLORS.tick, fontSize: 11 }} />
                        <YAxis yAxisId="temp" orientation="left" tick={{ fill: COLORS.tick, fontSize: 11 }} unit="°C" />
                        <YAxis yAxisId="rain" orientation="right" tick={{ fill: COLORS.tick, fontSize: 11 }} unit=" mm" />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
                        <Line yAxisId="temp" type="monotone" dataKey="avg_temp_c" name="Mean Temp" stroke={COLORS.meanTemp} strokeWidth={2} dot={{ r: 3 }} unit="°C" />
                        <Line yAxisId="rain" type="monotone" dataKey="precip_mm" name="Precipitation" stroke={COLORS.precip} strokeWidth={2} dot={{ r: 3 }} unit=" mm" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* ── Scenario Stress-Test Engine ── */}
                <div className="scenario-section">
                  <div className="scenario-header">
                    <div className="badge-nature">
                      <Sparkles size={14} />
                      <span>Sensitivity Stress-Test Engine</span>
                    </div>
                    <h3 className="section-title">Climate Scenario Analysis</h3>
                    <p className="scenario-disclaimer">
                      <Info size={13} />
                      These are <strong>sensitivity stress-test scenarios</strong>, not official IPCC projections.
                      They illustrate how the target location's historical profile would shift under thermal and precipitation stresses.
                    </p>
                  </div>

                  {/* Scenario selection buttons */}
                  <div className="scenario-tabs">
                    {SCENARIOS.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        className={`scenario-btn ${activeScenario === s.id ? 'active' : ''}`}
                        style={activeScenario === s.id ? { borderColor: s.color, color: s.color, background: `${s.color}15` } : {}}
                        onClick={() => setActiveScenario(s.id)}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>

                  {/* Dynamic Scenario Impact Banner */}
                  <div
                    className="scenario-impact-banner"
                    style={{
                      borderLeftColor: activeScenarioObj.color,
                      background: `linear-gradient(135deg, ${activeScenarioObj.color}12, rgba(4, 21, 29, 0.95))`,
                    }}
                  >
                    <div className="scenario-impact-top">
                      <span className="impact-badge" style={{ color: activeScenarioObj.color, borderColor: `${activeScenarioObj.color}40` }}>
                        Simulation: {activeScenarioObj.label}
                      </span>
                      <span className="impact-description">{activeScenarioObj.description}</span>
                    </div>
                    <div className="scenario-metrics-row">
                      <div className="scenario-metric-box">
                        <span className="sm-label">Simulated Mean Temp:</span>
                        <span className="sm-value" style={{ color: activeScenarioObj.color }}>
                          {_avg(scenarioData, 'avg_temp_c')?.toFixed(1)}°C
                          {activeScenarioObj.tempDelta !== 0 && (
                            <span className="sm-delta"> (+{activeScenarioObj.tempDelta}°C vs Baseline)</span>
                          )}
                        </span>
                      </div>
                      <div className="scenario-metric-box">
                        <span className="sm-label">Simulated Annual Rain:</span>
                        <span className="sm-value" style={{ color: activeScenarioObj.color }}>
                          {_avg(scenarioData, 'annual_precip_mm')?.toFixed(0)} mm/yr
                          {activeScenarioObj.rainFactor !== 1.0 && (
                            <span className="sm-delta">
                              {' '}
                              ({activeScenarioObj.rainFactor > 1 ? '+' : ''}
                              {Math.round((activeScenarioObj.rainFactor - 1) * 100)}% volume)
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="scenario-metric-box full-width">
                        <span className="sm-label">Adaptation Engineering Impact:</span>
                        <span className="sm-impact-text">{activeScenarioObj.impact}</span>
                      </div>
                    </div>
                  </div>

                  {/* Charts showing scenario curves alongside baseline */}
                  <div className="scenario-charts-grid">
                    <div className="chart-card">
                      <div className="chart-header">
                        <h3 className="chart-title">Temperature: Scenario vs Baseline</h3>
                        <span className="chart-source">{activeScenarioObj.label}</span>
                      </div>
                      <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={scenarioData} style={CHART_STYLE}>
                          <CartesianGrid stroke={COLORS.grid} strokeDasharray="3 3" />
                          <XAxis dataKey="year" tick={{ fill: COLORS.tick, fontSize: 11 }} />
                          <YAxis tick={{ fill: COLORS.tick, fontSize: 11 }} unit="°C" />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 11 }} />
                          <Area
                            type="monotone"
                            dataKey="avg_temp_c"
                            name={`Simulated (${activeScenarioObj.label})`}
                            stroke={activeScenarioObj.color}
                            fill={`${activeScenarioObj.color}33`}
                            strokeWidth={2}
                            unit="°C"
                            dot={false}
                          />
                          <Line
                            type="monotone"
                            dataKey="baseline_temp_c"
                            name="Observed Baseline"
                            stroke="#f97316"
                            strokeDasharray="4 4"
                            strokeWidth={1.5}
                            unit="°C"
                            dot={false}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="chart-card">
                      <div className="chart-header">
                        <h3 className="chart-title">Rainfall: Scenario vs Baseline</h3>
                        <span className="chart-source">{activeScenarioObj.label}</span>
                      </div>
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={scenarioData} style={CHART_STYLE} barGap={4}>
                          <CartesianGrid stroke={COLORS.grid} strokeDasharray="3 3" />
                          <XAxis dataKey="year" tick={{ fill: COLORS.tick, fontSize: 11 }} />
                          <YAxis tick={{ fill: COLORS.tick, fontSize: 11 }} unit=" mm" />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 11 }} />
                          <Bar
                            dataKey="annual_precip_mm"
                            name={`Simulated (${activeScenarioObj.label})`}
                            fill={activeScenarioObj.color}
                            radius={[3, 3, 0, 0]}
                            unit=" mm"
                          />
                          <Bar
                            dataKey="baseline_precip_mm"
                            name="Observed Baseline"
                            fill="#64748b55"
                            radius={[3, 3, 0, 0]}
                            unit=" mm"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ── Compare Mode ── */}
            {compareMode && !loading && comparisonData && (
              <div className="compare-charts">
                <div className="compare-summary">
                  {comparisonData.comparison && (
                    <div className="compare-delta-row">
                      <div className="delta-item">
                        <span className="delta-label">Temperature Δ</span>
                        <span className={`delta-val ${comparisonData.comparison.avg_temp_delta_c > 0 ? 'hot' : 'cool'}`}>
                          {comparisonData.comparison.avg_temp_delta_c != null
                            ? `${comparisonData.comparison.avg_temp_delta_c > 0 ? '+' : ''}${comparisonData.comparison.avg_temp_delta_c.toFixed(1)}°C`
                            : '—'}
                        </span>
                        <span className="delta-sub">B relative to A</span>
                      </div>
                      <div className="delta-item">
                        <span className="delta-label">Rainfall Δ</span>
                        <span className={`delta-val ${comparisonData.comparison.avg_rain_delta_mm > 0 ? 'wet' : 'dry'}`}>
                          {comparisonData.comparison.avg_rain_delta_mm != null
                            ? `${comparisonData.comparison.avg_rain_delta_mm > 0 ? '+' : ''}${comparisonData.comparison.avg_rain_delta_mm.toFixed(0)} mm/yr`
                            : '—'}
                        </span>
                        <span className="delta-sub">B relative to A</span>
                      </div>
                      <div className="delta-item">
                        <span className="delta-label">Mean Temp A</span>
                        <span className="delta-val">{comparisonData.comparison.avg_temp_a?.toFixed(1)}°C</span>
                        <span className="delta-sub">{mapLocationA?.name}</span>
                      </div>
                      <div className="delta-item">
                        <span className="delta-label">Mean Temp B</span>
                        <span className="delta-val">{comparisonData.comparison.avg_temp_b?.toFixed(1)}°C</span>
                        <span className="delta-sub">{mapLocationB?.name}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="chart-card">
                  <div className="chart-header">
                    <h3 className="chart-title">Temperature Comparison A vs B</h3>
                    <span className="chart-source">NASA POWER · {startYear}–{endYear}</span>
                  </div>
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={compareArr} style={CHART_STYLE}>
                      <CartesianGrid stroke={COLORS.grid} strokeDasharray="3 3" />
                      <XAxis dataKey="year" tick={{ fill: COLORS.tick, fontSize: 11 }} />
                      <YAxis tick={{ fill: COLORS.tick, fontSize: 11 }} unit="°C" />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
                      <Line type="monotone" dataKey="temp_a" name={`${mapLocationA?.name} (A)`} stroke="#10b981" strokeWidth={2} dot={false} unit="°C" />
                      <Line type="monotone" dataKey="temp_b" name={`${mapLocationB?.name} (B)`} stroke="#38bdf8" strokeWidth={2} dot={false} unit="°C" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="chart-card">
                  <div className="chart-header">
                    <h3 className="chart-title">Rainfall Comparison A vs B</h3>
                    <span className="chart-source">NASA POWER · {startYear}–{endYear}</span>
                  </div>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={compareArr} style={CHART_STYLE} barGap={4}>
                      <CartesianGrid stroke={COLORS.grid} strokeDasharray="3 3" />
                      <XAxis dataKey="year" tick={{ fill: COLORS.tick, fontSize: 11 }} />
                      <YAxis tick={{ fill: COLORS.tick, fontSize: 11 }} unit=" mm" />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
                      <Bar dataKey="rain_a" name={`${mapLocationA?.name} (A)`} fill="#10b981" radius={[3, 3, 0, 0]} unit=" mm" />
                      <Bar dataKey="rain_b" name={`${mapLocationB?.name} (B)`} fill="#38bdf8" radius={[3, 3, 0, 0]} unit=" mm" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* NASA data methodology note */}
            {!loading && (historical || comparisonData) && (
              <div className="methodology-note">
                <Info size={15} />
                <p>
                  <strong>Data source:</strong> NASA POWER (Prediction Of Worldwide Energy Resources) —
                  MERRA-2/GEOS-5 model-derived reanalysis. Data represents a spatial average over a ~0.5° grid cell
                  (~55 km × 55 km at equator), not a site-level measurement. Precipitation values are
                  model-corrected estimates (PRECTOTCORR). Temperature values are 2m air temperature (T2M).
                  For site-level accuracy, local gauge data or higher-resolution datasets are recommended.
                  License: NASA Open Data (CC Attribution).
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function _avg(arr, key) {
  const vals = arr.map(r => r[key]).filter(v => v != null);
  if (!vals.length) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}
