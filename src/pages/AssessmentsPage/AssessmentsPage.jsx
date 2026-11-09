import React, { useState, useCallback, useEffect } from 'react';
import {
  FileCheck2, Sparkles, Download, AlertTriangle,
  MapPin, ArrowRight, CheckCircle, XCircle, AlertCircle,
  ChevronDown, ChevronUp, Loader2, Info, Database, ExternalLink,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import Breadcrumbs from '../../components/Breadcrumbs/Breadcrumbs';
import { useAdaptations } from '../../context/AdaptationsContext';
import { assessmentApi } from '../../api/assessmentApi';
import { createAdaptfitLocation } from '../../utils/locationTypes';
import './AssessmentsPage.css';

// Status display helpers
const STATUS_CONFIG = {
  SUITABLE: { color: '#10b981', icon: <CheckCircle size={18} />, label: 'Suitable' },
  CONDITIONAL: { color: '#f59e0b', icon: <AlertCircle size={18} />, label: 'Conditional' },
  UNSUITABLE: { color: '#ef4444', icon: <XCircle size={18} />, label: 'Unsuitable' },
  INSUFFICIENT_DATA: { color: '#94a3b8', icon: <Info size={18} />, label: 'Insufficient Data' },
  COMPUTED: { color: '#38bdf8', icon: <CheckCircle size={18} />, label: 'Computed' },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.INSUFFICIENT_DATA;
  return (
    <span className="status-badge" style={{ color: cfg.color, borderColor: `${cfg.color}40` }}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

function ScoreGauge({ score }) {
  if (score == null) return <div className="gauge-na">N/A</div>;
  const pct = Math.round(score);
  const color = pct >= 75 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444';
  const circum = 2 * Math.PI * 42;
  const dash = (pct / 100) * circum;
  return (
    <div className="score-gauge">
      <svg width="110" height="110" viewBox="0 0 110 110">
        <circle cx="55" cy="55" r="42" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
        <circle
          cx="55" cy="55" r="42"
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={`${dash} ${circum - dash}`}
          strokeDashoffset={circum / 4}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.6s ease' }}
        />
        <text x="55" y="52" textAnchor="middle" fill="#fff" fontSize="20" fontWeight="800" fontFamily="Outfit, sans-serif">{pct}</text>
        <text x="55" y="68" textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="Plus Jakarta Sans, sans-serif">/ 100</text>
      </svg>
    </div>
  );
}

function FactorRow({ factor }) {
  const pct = factor.score;
  const color = pct >= 75 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <div className="factor-row">
      <div className="factor-top">
        <span className="factor-name">{factor.name}</span>
        <span className="factor-weight">Weight: {Math.round(factor.weight * 100)}%</span>
        <span className="factor-score" style={{ color }}>{factor.score?.toFixed(0)}/100</span>
      </div>
      <div className="factor-bar-bg">
        <div className="factor-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <p className="factor-expl">{factor.explanation}</p>
    </div>
  );
}

export default function AssessmentsPage() {
  const {
    adaptations,
    mapLocationA,
    mapLocationB,
    setMapLocationA,
    setMapLocationB,
    openAdaptationById
  } = useAdaptations();
  const location = useLocation();

  const normalizeId = (id) => {
    if (!id) return '';
    return String(id).trim().toLowerCase().replace(/_/g, '-');
  };

  const [selectedAdaptationId, setSelectedAdaptationId] = useState(
    normalizeId(location.state?.selectedAdaptationId)
  );
  const [startYear, setStartYear] = useState(2010);

  useEffect(() => {
    if (location.state?.selectedAdaptationId) {
      setSelectedAdaptationId(normalizeId(location.state.selectedAdaptationId));
    }
  }, [location.state]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showFactors, setShowFactors] = useState(true);
  const [showRanked, setShowRanked] = useState(true);

  const hasLocations = mapLocationA && mapLocationB;
  const backendError = error.includes('Cannot connect') || error.includes('backend');

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

  const handleRunAssessment = useCallback(async () => {
    if (!hasLocations) return;
    setLoading(true); setError(''); setResult(null);
    try {
      const payload = {
        lat_a: mapLocationA.coordinates.lat,
        lng_a: mapLocationA.coordinates.lng,
        name_a: mapLocationA.name,
        lat_b: mapLocationB.coordinates.lat,
        lng_b: mapLocationB.coordinates.lng,
        name_b: mapLocationB.name,
        adaptation_id: selectedAdaptationId || undefined,
        start_year: startYear,
        end_year: 2023,
      };
      const data = await assessmentApi.calculate(payload);
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [hasLocations, mapLocationA, mapLocationB, selectedAdaptationId, startYear]);

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const data = await assessmentApi.list();
      setHistory(data.items || []);
    } catch (e) {
      /* silently fail if backend not running */
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  // Auto-load history once
  React.useEffect(() => { loadHistory(); }, [loadHistory]);

  const compat = result?.compatibility;
  const rankedList = result?.ranked_adaptations || [];

  return (
    <div className="page-wrapper assessments-page">
      <Breadcrumbs />

      {/* Header */}
      <section className="page-header-section">
        <div className="container">
          <div className="page-header-badge">
            <FileCheck2 size={15} />
            <span>Adaptation Compatibility Engine</span>
          </div>
          <h1 className="page-title">
            Climate <span className="title-sky">Assessments</span>
          </h1>
          <p className="page-subtitle">
            Compare two locations using real NASA POWER climate data. The compatibility engine
            evaluates whether an adaptation proven in Location A could work in Location B.
          </p>
        </div>
      </section>

      <div className="container assessments-body">

        {/* No locations */}
        {!hasLocations && (
          <div className="no-location-card">
            <MapPin size={36} />
            <h3>Select two locations first</h3>
            <p>Go to Explore Map and select Reference Location A and Target Location B to run a compatibility assessment.</p>
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

        {hasLocations && (
          <>
            {/* Assessment Setup Card */}
            <div className="assessment-setup-card">
              <div className="card-head">
                <div className="badge-nature">
                  <Sparkles size={14} />
                  <span>Compatibility Engine</span>
                </div>
                <h2 className="card-title">New Compatibility Assessment</h2>
              </div>

              {/* Location pair display */}
              <div className="location-pair-display">
                <div className="loc-display-card loc-a">
                  <span className="loc-role-tag tag-a">Reference A</span>
                  <div className="loc-display-name">{mapLocationA.name}</div>
                  <div className="loc-display-coords">
                    {mapLocationA.coordinates.lat.toFixed(4)}°, {mapLocationA.coordinates.lng.toFixed(4)}°
                  </div>
                </div>
                <div className="loc-arrow">➔</div>
                <div className="loc-display-card loc-b">
                  <span className="loc-role-tag tag-b">Target B</span>
                  <div className="loc-display-name">{mapLocationB.name}</div>
                  <div className="loc-display-coords">
                    {mapLocationB.coordinates.lat.toFixed(4)}°, {mapLocationB.coordinates.lng.toFixed(4)}°
                  </div>
                </div>
              </div>

              {/* Options */}
              <div className="assessment-options-row">
                <div className="input-group">
                  <label className="input-label">Adaptation (optional — leave blank to rank all 10):</label>
                  <select
                    className="calc-select"
                    value={selectedAdaptationId}
                    onChange={(e) => setSelectedAdaptationId(e.target.value)}
                  >
                    <option value="">Rank all 10 adaptations</option>
                    {adaptations.map((a) => (
                      <option key={a.id} value={a.id}>{a.title}</option>
                    ))}
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Historical period start:</label>
                  <select className="calc-select" value={startYear} onChange={(e) => setStartYear(Number(e.target.value))}>
                    {[2000, 2005, 2010, 2015].map((y) => <option key={y} value={y}>{y}–2023</option>)}
                  </select>
                </div>
              </div>

              <div className="data-source-note">
                <Database size={13} />
                <span>Climate data: NASA POWER MERRA-2 reanalysis · Free, no key required · ~0.5° grid resolution</span>
              </div>

              <button
                type="button"
                className="btn-primary run-btn"
                onClick={handleRunAssessment}
                disabled={loading}
              >
                {loading
                  ? <><Loader2 size={16} className="spin-icon" /> Fetching NASA POWER data…</>
                  : <><Sparkles size={16} /> Run Compatibility Assessment</>}
              </button>
            </div>

            {/* Backend error */}
            {backendError && (
              <div className="backend-error-card">
                <AlertTriangle size={20} />
                <div>
                  <strong>Flask Backend Required</strong>
                  <p>Start the backend to fetch real NASA POWER data and run the engine:</p>
                  <code>cd backend && python app.py</code>
                </div>
              </div>
            )}

            {error && !backendError && (
              <div className="api-error-banner">
                <AlertTriangle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Results */}
            {result && !loading && (
              <div className="assessment-results-section">

                {/* Top result (single adaptation) */}
                {compat && !Array.isArray(compat) && (
                  <div className="result-hero-card">
                    <div className="result-hero-left">
                      <ScoreGauge score={compat.score} />
                      <div>
                        <div className="result-adaptation-name">{compat.adaptation_name}</div>
                        <StatusBadge status={compat.status} />
                        <div className="result-loc-line">
                          <span className="dot-a" /> {result.location_a?.name}
                          <span className="result-arrow">→</span>
                          <span className="dot-b" /> {result.location_b?.name}
                        </div>
                      </div>
                    </div>

                    <div className="result-hero-right">
                      {/* Data quality */}
                      <div className="data-quality-row">
                        <span className={`dq-badge ${result.data_quality?.location_a_data === 'real' ? 'dq-real' : 'dq-unavail'}`}>
                          A: {result.data_quality?.location_a_data}
                        </span>
                        <span className={`dq-badge ${result.data_quality?.location_b_data === 'real' ? 'dq-real' : 'dq-unavail'}`}>
                          B: {result.data_quality?.location_b_data}
                        </span>
                        <span className="dq-source">{result.data_quality?.source}</span>
                      </div>

                      {/* Blockers */}
                      {compat.blockers?.length > 0 && (
                        <div className="blockers-box">
                          <strong>Critical blockers:</strong>
                          {compat.blockers.map((b, i) => (
                            <div key={i} className="blocker-item"><XCircle size={13} /> {b}</div>
                          ))}
                        </div>
                      )}

                      {/* Export */}
                      {result.assessment_id && (
                        <a
                          href={assessmentApi.csvExportUrl(result.assessment_id)}
                          className="export-btn"
                          download
                        >
                          <Download size={14} /> Export CSV
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Factor breakdown */}
                {compat?.factors?.length > 0 && (
                  <div className="result-section-card">
                    <button
                      type="button"
                      className="section-toggle"
                      onClick={() => setShowFactors(!showFactors)}
                    >
                      <span>Factor Breakdown</span>
                      {showFactors ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    {showFactors && (
                      <div className="factors-list">
                        {compat.factors.map((f) => <FactorRow key={f.name} factor={f} />)}
                      </div>
                    )}
                  </div>
                )}

                {/* Recommendations */}
                {compat?.recommendations?.length > 0 && (
                  <div className="result-section-card">
                    <h3 className="section-heading">Recommendations</h3>
                    <div className="recommendations-list">
                      {compat.recommendations.map((r, i) => (
                        <div key={i} className={`rec-item rec-${r.type}`}>
                          <span className={`rec-type-badge badge-${r.type}`}>{r.type}</span>
                          <p>{r.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ranked all adaptations */}
                {rankedList.length > 0 && (
                  <div className="result-section-card">
                    <button
                      type="button"
                      className="section-toggle"
                      onClick={() => setShowRanked(!showRanked)}
                    >
                      <span>All 10 Adaptations Ranked</span>
                      {showRanked ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    {showRanked && (
                      <div className="ranked-list">
                        {rankedList.map((r, i) => {
                          const cfg = STATUS_CONFIG[r.status] || STATUS_CONFIG.INSUFFICIENT_DATA;
                          return (
                            <div key={r.adaptation_id} className="ranked-row">
                              <span className="rank-num">#{i + 1}</span>
                              <div className="rank-info">
                                <span className="rank-name">{r.name}</span>
                                {r.top_recommendation && (
                                  <span className="rank-rec">{r.top_recommendation}</span>
                                )}
                              </div>
                              <div className="rank-right">
                                <span className="rank-score" style={{ color: cfg.color }}>
                                  {r.score != null ? `${r.score.toFixed(0)}/100` : '—'}
                                </span>
                                <StatusBadge status={r.status} />
                                <button
                                  type="button"
                                  className="inspect-link-btn"
                                  onClick={() => openAdaptationById(r.adaptation_id)}
                                  title="View adaptation details"
                                >
                                  <ExternalLink size={13} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Methodology */}
                <div className="methodology-note">
                  <Info size={15} />
                  <p>
                    <strong>Methodology:</strong> Compatibility score is a weighted composite of four factors:
                    temperature similarity, precipitation similarity, climate zone match, and rainfall adequacy.
                    Critical blockers override all factors. Data from NASA POWER MERRA-2 reanalysis (~0.5° grid).
                    This is a decision-support screening tool, not a certified risk assessment.
                    Site-level field verification is always required before implementation.
                  </p>
                </div>
              </div>
            )}

            {/* Assessment History */}
            <div className="history-section">
              <div className="history-header">
                <h3 className="section-heading">Assessment History</h3>
                <button type="button" className="refresh-btn" onClick={loadHistory} disabled={historyLoading}>
                  <Loader2 size={14} className={historyLoading ? 'spin-icon' : ''} />
                </button>
              </div>
              {history.length === 0 && !historyLoading && (
                <p className="history-empty">No previous assessments. Run your first assessment above.</p>
              )}
              {history.map((a) => (
                <div key={a.id} className="history-row">
                  <div className="history-loc">
                    <span className="dot-a" />{a.location_a?.name || a.name_a || 'Location A'}
                    <span className="history-arrow">→</span>
                    <span className="dot-b" />{a.location_b?.name || a.name_b || 'Location B'}
                  </div>
                  <span className="history-adaptation">{a.adaptation_id}</span>
                  <StatusBadge status={a.overall_status} />
                  <span className="history-score">
                    {a.compatibility_score != null ? `${a.compatibility_score.toFixed(0)}/100` : '—'}
                  </span>
                  <span className="history-date">{new Date(a.created_at).toLocaleDateString()}</span>
                  <a href={assessmentApi.csvExportUrl(a.id)} className="history-export" download>
                    <Download size={13} />
                  </a>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
