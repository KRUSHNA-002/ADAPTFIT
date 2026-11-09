import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Droplets,
  ShieldAlert,
  Trees,
  MountainSnow,
  SunMedium,
  ThermometerSnowflake,
  FlameKindling,
  Layers,
  Wind,
  Building2,
  Waves,
  CheckCircle2,
  Plus,
  ArrowUpRight,
  Sparkles,
  Calculator
} from 'lucide-react';
import './AdaptationCard.css';

// Dynamic icon mapping
const ICON_MAP = {
  Droplets,
  ShieldAlert,
  Trees,
  MountainSnow,
  SunMedium,
  ThermometerSnowflake,
  FlameKindling,
  Layers,
  Wind,
  Building2,
  Waves
};

export default function AdaptationCard({
  adaptation,
  isSelected,
  onToggleSelect,
  onOpenDetails
}) {
  const navigate = useNavigate();
  const IconComponent = ICON_MAP[adaptation.iconName] || Sparkles;

  const handleStartAssessment = (e) => {
    e.stopPropagation();
    navigate('/assessments', { state: { selectedAdaptationId: adaptation.id } });
  };

  return (
    <article
      className={`adaptation-card ${isSelected ? 'selected' : ''}`}
      style={{ '--card-accent': adaptation.accentColor }}
    >
      {/* Top Banner & Category */}
      <div className="card-header">
        <span className="card-category-badge">{adaptation.category}</span>
        
        {/* Select / Bookmark Trigger */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect(adaptation.id);
          }}
          className={`select-btn ${isSelected ? 'is-selected' : ''}`}
          aria-label={isSelected ? `Deselect ${adaptation.title}` : `Select ${adaptation.title}`}
          title={isSelected ? 'Remove from Selected' : 'Add to Selected Adaptations'}
        >
          {isSelected ? (
            <>
              <CheckCircle2 size={16} />
              <span>Selected</span>
            </>
          ) : (
            <>
              <Plus size={16} />
              <span>Select</span>
            </>
          )}
        </button>
      </div>

      {/* Primary Visual Icon + Prominent Metric Callout */}
      <div className="card-metric-block">
        <div className="card-icon-halo">
          <IconComponent size={28} className="card-icon" />
        </div>
        <div className="metric-text-group">
          <div className="metric-value-row">
            <span className="primary-metric">{adaptation.impactMetric}</span>
          </div>
          <span className="metric-label">{adaptation.impactLabel}</span>
        </div>
      </div>

      {/* Title & Concise Nature-Engineering Tagline */}
      <div className="card-body">
        <h3 className="card-title">{adaptation.title}</h3>
        <p className="card-tagline">{adaptation.tagline}</p>

        {/* Readiness & Biome Spec Tags */}
        <div className="card-spec-strip">
          <span className="spec-item readiness">{adaptation.readiness}</span>
          <span className="spec-item biome">{adaptation.biome}</span>
        </div>

        {/* Core Engineered Benefits */}
        <ul className="card-benefits-list">
          {adaptation.keyBenefits.slice(0, 3).map((benefit, index) => (
            <li key={index} className="benefit-item">
              <span className="benefit-bullet">✓</span>
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Card Footer Actions */}
      <div className="card-footer">
        <div className="footer-metric-sub">
          <span className="sub-stat-num">{adaptation.secondaryStat}</span>
          <span className="sub-stat-label">{adaptation.secondaryLabel}</span>
        </div>

        <div className="card-action-btns">
          <button
            type="button"
            className="start-assessment-mini-btn"
            onClick={handleStartAssessment}
            title={`Start Compatibility Assessment for ${adaptation.title}`}
          >
            <Calculator size={13} />
            <span>Assess</span>
          </button>

          <button
            type="button"
            className="inspect-btn"
            onClick={() => onOpenDetails(adaptation)}
            aria-label={`Inspect full specifications for ${adaptation.title}`}
          >
            <span>Deep Specs</span>
            <ArrowUpRight size={15} />
          </button>
        </div>
      </div>
    </article>
  );
}
