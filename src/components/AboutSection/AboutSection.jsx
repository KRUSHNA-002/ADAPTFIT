import React from 'react';
import {
  ShieldCheck,
  Cpu,
  Layers,
  HeartHandshake,
  CheckCircle2,
  TreePine,
  Waves,
  Sun
} from 'lucide-react';
import './AboutSection.css';

export default function AboutSection() {
  const pillars = [
    {
      icon: Waves,
      title: 'Thermodynamic & Hydro-Physics',
      description:
        'Harnessing gravity aquifers, wave kinetic friction, and passive radiative cooling into outer space. Zero dependence on fossil grid power.'
    },
    {
      icon: TreePine,
      title: 'Living & Self-Healing Assets',
      description:
        'Unlike concrete seawalls that crack and degrade, biological barriers like mangroves and dune roots trap sediment and grow stronger as sea levels rise.'
    },
    {
      icon: Cpu,
      title: 'Orbital Real-Time Calibration',
      description:
        'Continuous telemetry pairing multispectral satellite observations with micro-sensor telemetry to target adaptation interventions where risk is acute.'
    }
  ];

  return (
    <section className="about-section" id="about">
      <div className="container">
        {/* Head */}
        <div className="section-head text-center">
          <div className="badge-nature">
            <ShieldCheck size={14} />
            <span>Mission & Resilience Framework</span>
          </div>
          <h2 className="section-title">
            About <span className="title-sky">ADAPTFIT</span>
          </h2>
          <p className="section-sub">
            Bridging planetary biome ecology with modern nature-based civil engineering to build an immune system for the living biosphere.
          </p>
        </div>

        {/* Narrative Grid */}
        <div className="about-narrative-box">
          <div className="narrative-left">
            <h3 className="narrative-heading">
              Why Climate Adaptation Must Precede Carbon Targets Alone
            </h3>
            <p className="narrative-p">
              While greenhouse gas abatement remains vital, centuries of accumulated thermal inertia are already locked into ocean thermal expansion and atmospheric water vapor cycles. Extreme rainfall deluges, catastrophic wildfire firestorms, and alpine glacier outbursts are unfolding today.
            </p>
            <p className="narrative-p">
              <strong>ADAPTFIT (Adaptive Planetary Fitness)</strong> is engineered as a decision engine and strategy framework. By modeling 10 vetted nature-based adaptations, we empower urban planners, regional hydro-authorities, and conservation engineers to design physical buffers before crisis hits.
            </p>
          </div>

          <div className="narrative-stats-card">
            <h4 className="stats-card-title">Planetary Resilience Metrics</h4>
            <div className="stats-list">
              <div className="stats-list-item">
                <CheckCircle2 size={16} className="stat-icon" />
                <div>
                  <strong>10 Nature-Based Archetypes</strong>
                  <span>Spanning urban, coastal, alpine, agricultural & arid zones</span>
                </div>
              </div>
              <div className="stats-list-item">
                <CheckCircle2 size={16} className="stat-icon" />
                <div>
                  <strong>Phase 1 Ready Architecture</strong>
                  <span>Self-contained client engine with zero backend dependency</span>
                </div>
              </div>
              <div className="stats-list-item">
                <CheckCircle2 size={16} className="stat-icon" />
                <div>
                  <strong>Ecosystem Net-Positive</strong>
                  <span>Every adaptation creates biodiversity co-benefits</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Pillars Grid */}
        <div className="pillars-grid">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div key={idx} className="pillar-card">
                <div className="pillar-icon-box">
                  <Icon size={24} className="pillar-icon" />
                </div>
                <h4 className="pillar-title">{pillar.title}</h4>
                <p className="pillar-desc">{pillar.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

