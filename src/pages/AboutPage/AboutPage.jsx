import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  TreePine,
  Waves,
  Cpu,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Layers,
  Globe2,
  HeartHandshake
} from 'lucide-react';
import Breadcrumbs from '../../components/Breadcrumbs/Breadcrumbs';
import './AboutPage.css';

export default function AboutPage() {
  const pillars = [
    {
      icon: Waves,
      title: 'Thermodynamics & Subsurface Hydro-Physics',
      description:
        'Harnessing gravity aquifers, wave kinetic friction, and passive radiative cooling into outer space. Operating 100% off natural physical gradients with zero reliance on fossil grid power.'
    },
    {
      icon: TreePine,
      title: 'Living & Self-Healing Assets',
      description:
        'Unlike concrete seawalls that crack and deteriorate over time, biological barriers like mangroves, sand dune binders, and deep-root agroforestry trap sediment and grow stronger as sea levels rise.'
    },
    {
      icon: Cpu,
      title: 'Orbital Closed-Loop Sensor Telemetry',
      description:
        'Continuous synchronization pairing ISRO, Copernicus, and NASA satellite observations with ground hydro-stations to deploy adaptation solutions exactly where biospheric stress is acute.'
    }
  ];

  const standards = [
    {
      title: 'Technology Readiness Level (TRL 8–9)',
      desc: 'All 10 cataloged adaptations are field-verified engineering systems with documented real-world case studies.'
    },
    {
      title: 'Client-Side Pure SaaS Architecture',
      desc: 'Phase 1 runs as an autonomous, ultra-fast client-side engine with zero external tracking scripts, cookies, or backend dependencies.'
    },
    {
      title: 'Net-Positive Ecosystem Accounting',
      desc: 'Every adaptation generates verified co-benefits: urban pollinator corridors, blue carbon burial, and local food sovereignty.'
    }
  ];

  return (
    <div className="page-wrapper about-page">
      <Breadcrumbs />

      {/* Header */}
      <section className="page-header-section">
        <div className="container">
          <div className="page-header-badge">
            <ShieldCheck size={15} />
            <span>Mission & Resilience Doctrine</span>
          </div>
          <h1 className="page-title">
            About <span className="title-sky">ADAPTFIT</span>
          </h1>
          <p className="page-subtitle">
            An autonomous planetary adaptation decision engine engineered to bridge ecological biophysics with modern civil infrastructure.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="container about-body">
        {/* Narrative Box */}
        <div className="about-main-narrative mb-4">
          <div className="narrative-col-left">
            <h2 className="narrative-heading">
              Why Planetary Adaptation Must Precede Carbon Abatement Alone
            </h2>
            <p className="narrative-text">
              While greenhouse gas abatement remains imperative, centuries of accumulated thermal inertia are already locked into global ocean heat content and atmospheric vapor loops. Torrential cloudburst deluges, catastrophic heat domes, and glacial lake bursts are occurring right now.
            </p>
            <p className="narrative-text">
              <strong>ADAPTFIT (Adaptive Planetary Fitness)</strong> is founded on the conviction that human habitability requires proactive, physics-based biophilic defense. By modeling 10 field-ready nature-based engineering solutions, we provide city architects, river basin commissions, and regional planners with verified blueprints to absorb shock before devastation strikes.
            </p>
          </div>

          <div className="narrative-col-right">
            <div className="narrative-stats-card">
              <h4 className="stats-card-title">Resilience Engine Benchmarks</h4>
              <div className="stats-items-list">
                <div className="stats-item">
                  <CheckCircle2 size={16} className="stat-icon" />
                  <div>
                    <strong>10 Field-Tested Archetypes</strong>
                    <span>Covering urban, coastal, alpine, agricultural and arid biomes</span>
                  </div>
                </div>
                <div className="stats-item">
                  <CheckCircle2 size={16} className="stat-icon" />
                  <div>
                    <strong>Dual-Location Benchmarking</strong>
                    <span>Cross-regional adaptation transferability analysis</span>
                  </div>
                </div>
                <div className="stats-item">
                  <CheckCircle2 size={16} className="stat-icon" />
                  <div>
                    <strong>Zero Grid Power Required</strong>
                    <span>100% Nature-integrated passive thermodynamics</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Pillars */}
        <div className="pillars-section-head text-center mb-3">
          <div className="badge-nature">
            <Sparkles size={14} />
            <span>Core Pillars</span>
          </div>
          <h3 className="section-title">The Three Pillars of ADAPTFIT</h3>
        </div>

        <div className="pillars-grid mb-4">
          {pillars.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div key={idx} className="pillar-card">
                <div className="pillar-icon-wrap">
                  <Icon size={24} className="pillar-icon" />
                </div>
                <h4 className="pillar-title">{p.title}</h4>
                <p className="pillar-desc">{p.description}</p>
              </div>
            );
          })}
        </div>

        {/* Engineering Standards */}
        <div className="standards-card mb-4">
          <h3 className="standards-card-title">Technical Specifications & Verification Standards</h3>
          <div className="standards-grid">
            {standards.map((s, idx) => (
              <div key={idx} className="standard-box">
                <span className="std-num">0{idx + 1}</span>
                <h4 className="std-title">{s.title}</h4>
                <p className="std-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Bar */}
        <div className="about-cta-bar">
          <div className="cta-left">
            <h3 className="cta-title">Ready to explore nature-based adaptation strategies?</h3>
            <p className="cta-desc">
              Browse the catalog of 10 field adaptations or run a dual-location geospatial benchmark.
            </p>
          </div>
          <div className="cta-right">
            <Link to="/adaptations" className="btn-primary">
              <span>View 10 Adaptations</span>
              <ArrowRight size={16} />
            </Link>
            <Link to="/explore-map" className="btn-secondary">
              <span>Launch Worldwide Map</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

