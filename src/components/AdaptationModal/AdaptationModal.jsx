import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  CheckCircle2,
  Plus,
  ShieldCheck,
  TrendingUp,
  Cpu,
  Layers,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  FileSpreadsheet,
  Compass,
  Calculator,
  Info
} from 'lucide-react';
import './AdaptationModal.css';

export default function AdaptationModal({
  isOpen,
  onClose,
  adaptation,
  isPortfolioView = false,
  selectedAdaptations = [],
  isSelected = false,
  onToggleSelect,
  onSelectAdaptation
}) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleStartAssessment = (aid) => {
    onClose();
    navigate('/assessments', { state: { selectedAdaptationId: aid } });
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="modal-container fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Close Button */}
        <button
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close dialog"
        >
          <X size={20} />
        </button>

        {isPortfolioView ? (
          /* Portfolio Synthesis View */
          <div className="portfolio-modal-content">
            <div className="modal-header">
              <span className="badge-nature">Curated Strategy Portfolio</span>
              <h2 className="modal-title">
                {selectedAdaptations.length} Selected Climate Adaptations
              </h2>
              <p className="modal-lead">
                Synthesized resilience portfolio for multi-biome deployment.
              </p>
            </div>

            {selectedAdaptations.length === 0 ? (
              <div className="modal-empty-state">
                <p>No climate adaptations currently selected in your portfolio.</p>
                <p className="modal-empty-hint">
                  Browse the catalog and click <strong>"Select"</strong> on any card to add it to your plan.
                </p>
              </div>
            ) : (
              <>
                {/* Aggregate Metrics Bar */}
                <div className="portfolio-metric-banner">
                  <div className="agg-stat">
                    <span className="agg-num">{selectedAdaptations.length} / 10</span>
                    <span className="agg-label">Active Strategies</span>
                  </div>
                  <div className="agg-stat">
                    <span className="agg-num">High</span>
                    <span className="agg-label">Ecosystem Synergy</span>
                  </div>
                  <div className="agg-stat">
                    <span className="agg-num">100%</span>
                    <span className="agg-label">Nature-Based</span>
                  </div>
                </div>

                {/* Selected List */}
                <div className="portfolio-items-list">
                  {selectedAdaptations.map((item) => (
                    <div key={item.id} className="portfolio-item-row">
                      <div className="portfolio-item-left">
                        <span className="portfolio-item-cat">{item.category}</span>
                        <h4 className="portfolio-item-name">{item.title}</h4>
                        <span className="portfolio-item-metric">
                          {item.impactMetric} {item.impactLabel}
                        </span>
                      </div>
                      <div className="portfolio-item-actions">
                        <button
                          type="button"
                          className="inspect-mini-btn"
                          onClick={() => onSelectAdaptation(item)}
                        >
                          Details
                        </button>
                        <button
                          type="button"
                          className="remove-mini-btn"
                          onClick={() => onToggleSelect(item.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="modal-footer">
              <button className="btn-primary" onClick={onClose}>
                Done Reviewing
              </button>
            </div>
          </div>
        ) : (
          /* Single Adaptation Deep Spec View */
          adaptation && (
            <div className="detail-modal-content">
              {/* Header */}
              <div className="modal-header">
                <div className="modal-category-row">
                  <span className="badge-nature">{adaptation.category}</span>
                  <span className="badge-sky">{adaptation.readiness}</span>
                </div>
                <h2 className="modal-title">{adaptation.title}</h2>
                <p className="modal-lead">{adaptation.tagline}</p>
              </div>

              {/* Core Telemetry Strip */}
              <div className="modal-telemetry-grid">
                <div className="telemetry-box">
                  <span className="telemetry-label">Primary Kinetic Impact</span>
                  <span className="telemetry-value highlight-green">
                    {adaptation.impactMetric}
                  </span>
                  <span className="telemetry-sub">{adaptation.impactLabel}</span>
                </div>

                <div className="telemetry-box">
                  <span className="telemetry-label">Secondary Yield Metric</span>
                  <span className="telemetry-value highlight-sky">
                    {adaptation.secondaryStat}
                  </span>
                  <span className="telemetry-sub">{adaptation.secondaryLabel}</span>
                </div>

                <div className="telemetry-box">
                  <span className="telemetry-label">Deployment Horizon</span>
                  <span className="telemetry-value">{adaptation.timeline}</span>
                  <span className="telemetry-sub">{adaptation.costIndex}</span>
                </div>
              </div>

              {/* Deep Narrative Description */}
              <div className="modal-section">
                <h4 className="modal-section-title">
                  <Cpu size={16} /> Nature-Based Engineering Blueprint
                </h4>
                <p className="modal-body-text">{adaptation.fullDescription}</p>
              </div>

              {/* Purpose and Environmental Benefits */}
              {adaptation.purposeBenefits && (
                <div className="modal-section">
                  <h4 className="modal-section-title">
                    <ShieldCheck size={16} /> Purpose & Environmental Benefits
                  </h4>
                  <p className="modal-body-text">{adaptation.purposeBenefits}</p>
                </div>
              )}

              {/* Environmental Requirements */}
              {adaptation.environmentalRequirements && (
                <div className="modal-section">
                  <h4 className="modal-section-title">
                    <Compass size={16} /> Environmental Requirements
                  </h4>
                  <div className="modal-callout-box info-box">
                    <p>{adaptation.environmentalRequirements}</p>
                  </div>
                </div>
              )}

              {/* Climate Suitability Factors */}
              {adaptation.climateSuitability && (
                <div className="modal-section">
                  <h4 className="modal-section-title">
                    <TrendingUp size={16} /> Climate Suitability Factors
                  </h4>
                  <div className="modal-callout-box suitability-box">
                    <p>{adaptation.climateSuitability}</p>
                  </div>
                </div>
              )}

              {/* Critical Limitations */}
              {adaptation.criticalLimitations && (
                <div className="modal-section">
                  <h4 className="modal-section-title text-warning">
                    <AlertTriangle size={16} /> Critical Limitations & Blockers
                  </h4>
                  <div className="modal-callout-box warning-box">
                    <p>{adaptation.criticalLimitations}</p>
                  </div>
                </div>
              )}

              {/* Required Input Data */}
              {adaptation.requiredInputData && (
                <div className="modal-section">
                  <h4 className="modal-section-title">
                    <FileSpreadsheet size={16} /> Required Site & Climate Input Data
                  </h4>
                  <div className="modal-callout-box data-box">
                    <p>{adaptation.requiredInputData}</p>
                  </div>
                </div>
              )}

              {/* Multi-tier Co-Benefits */}
              {adaptation.coBenefits && (
                <div className="modal-section">
                  <h4 className="modal-section-title">
                    <Sparkles size={16} /> Biome Synergies & Co-Benefits
                  </h4>
                  <div className="modal-pills-flow">
                    {adaptation.coBenefits.map((cb, idx) => (
                      <span key={idx} className="cobenefit-pill">
                        ✦ {cb}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Implementation Criteria */}
              {adaptation.keyBenefits && (
                <div className="modal-section">
                  <h4 className="modal-section-title">
                    <Layers size={16} /> Technical Specifications
                  </h4>
                  <ul className="modal-specs-list">
                    {adaptation.keyBenefits.map((kb, idx) => (
                      <li key={idx}>
                        <span className="spec-check">✓</span>
                        <span>{kb}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Buttons */}
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-primary start-assessment-action-btn"
                  onClick={() => handleStartAssessment(adaptation.id)}
                >
                  <Calculator size={16} />
                  <span>Start Compatibility Assessment</span>
                  <ArrowRight size={16} />
                </button>

                <button
                  type="button"
                  className={`modal-toggle-select ${isSelected ? 'active' : ''}`}
                  onClick={() => onToggleSelect(adaptation.id)}
                >
                  {isSelected ? (
                    <>
                      <CheckCircle2 size={16} />
                      <span>In Portfolio</span>
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      <span>Select</span>
                    </>
                  )}
                </button>

                <button className="btn-secondary" onClick={onClose}>
                  Close
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
