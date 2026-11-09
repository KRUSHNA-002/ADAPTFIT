import React, { useState } from 'react';
import { Clock, History, Calendar, TrendingUp, ShieldCheck, ChevronRight } from 'lucide-react';
import { CLIMATE_MEMORY_TIMELINE, RESILIENCE_INDICATORS } from '../../data/climateMemoryData';
import './ClimateMemory.css';

export default function ClimateMemory() {
  const [selectedMilestone, setSelectedMilestone] = useState(CLIMATE_MEMORY_TIMELINE[3]); // Present 2026

  return (
    <section className="climate-memory-section" id="climate-memory">
      <div className="container">
        {/* Head */}
        <div className="section-head text-center">
          <div className="badge-nature">
            <Clock size={14} />
            <span>Planetary Temporal Archive</span>
          </div>
          <h2 className="section-title">
            Climate Memory & <span className="title-sky">Resilience Trajectory</span>
          </h2>
          <p className="section-sub">
            Tracking biospheric thresholds and nature-based engineering breakthroughs across five decades of climate adaptation history.
          </p>
        </div>

        {/* Resilience Key Performance Indicators Strip */}
        <div className="indicators-row">
          {RESILIENCE_INDICATORS.map((ind, i) => (
            <div key={i} className="indicator-card">
              <span className="indicator-label">{ind.label}</span>
              <div className="indicator-metric-wrap">
                <span className="indicator-value">{ind.value}</span>
                <span className="indicator-delta">{ind.delta}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Interactive Timeline & Detail Split */}
        <div className="memory-layout">
          {/* Timeline Milestones Navigation */}
          <div className="timeline-nav">
            {CLIMATE_MEMORY_TIMELINE.map((item) => {
              const isActive = selectedMilestone.year === item.year;
              return (
                <button
                  key={item.year}
                  className={`timeline-step-btn ${isActive ? 'active' : ''}`}
                  onClick={() => setSelectedMilestone(item)}
                >
                  <div className="step-year-badge">{item.year}</div>
                  <div className="step-info">
                    <span className="step-era">{item.era}</span>
                    <span className="step-title">{item.title}</span>
                  </div>
                  <ChevronRight size={18} className="step-chevron" />
                </button>
              );
            })}
          </div>

          {/* Milestone Deep Telemetry Card */}
          <div className="milestone-detail-card">
            <div className="detail-status-pill">
              <span className="status-dot"></span>
              <span>{selectedMilestone.status} • {selectedMilestone.era}</span>
            </div>

            <h3 className="milestone-headline">
              <span className="year-accent">{selectedMilestone.year}</span> — {selectedMilestone.title}
            </h3>

            <p className="milestone-desc">{selectedMilestone.description}</p>

            {/* Historical Telemetry Triad */}
            <div className="milestone-telemetry-triad">
              <div className="triad-box">
                <span className="triad-label">Atmospheric CO₂</span>
                <span className="triad-val green">{selectedMilestone.metrics.co2}</span>
              </div>
              <div className="triad-box">
                <span className="triad-label">Global Temp Anomaly</span>
                <span className="triad-val sky">{selectedMilestone.metrics.globalTempDelta}</span>
              </div>
              <div className="triad-box">
                <span className="triad-label">Intact Forest Canopy</span>
                <span className="triad-val">{selectedMilestone.metrics.forestCover}</span>
              </div>
            </div>

            <div className="adaptation-lesson-box">
              <ShieldCheck size={18} className="lesson-icon" />
              <div className="lesson-content">
                <strong>Adaptation Lesson:</strong> Nature-based defenses like mangroves and sponge networks outperform hard concrete seawalls in long-term resilience, dynamic sediment accretion, and community co-benefits.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

