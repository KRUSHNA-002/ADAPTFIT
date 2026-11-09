import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  Activity,
  MapPin,
  Clock,
  Radio,
  FileCheck2,
  Info,
  Sparkles,
  TreePine,
  Layers,
  Compass,
  ArrowUpRight
} from 'lucide-react';
import ScenicBackground from '../../components/ScenicBackground/ScenicBackground';
import { useAdaptations } from '../../context/AdaptationsContext';
import './HomePage.css';

export default function HomePage() {
  const { timeOfDay } = useAdaptations();

  const platformModules = [
    {
      to: '/adaptations',
      title: '10 Climate Adaptations',
      category: 'Nature-Based Engineering',
      icon: Activity,
      description:
        'Explore 10 vetted selectable strategies: sponge corridors, living mangrove reefs, cool radiative roofs, glacial siphons and aquifer storage.',
      metric: '10 Vetted Blueprints',
      accent: '#10b981',
      badge: 'Core Catalog'
    },
    {
      to: '/explore-map',
      title: 'Worldwide Map Explorer',
      category: 'Geospatial Benchmarking',
      icon: MapPin,
      description:
        'Interactive worldwide map comparing Reference Location A with Target Location B for climate stress divergence and adaptation transferability.',
      metric: 'Dual-Location Benchmark',
      accent: '#38bdf8',
      badge: 'Interactive GIS'
    },
    {
      to: '/climate-memory',
      title: 'Climate Memory & Stress-Testing',
      category: 'Atmospheric Archive',
      icon: Clock,
      description:
        'Five-decade historical rainfall and temperature anomalies paired with predictive SSP stress-test scenario simulations.',
      metric: '1972–2035 Horizon',
      accent: '#059669',
      badge: 'Temporal Telemetry'
    },
    {
      to: '/satellite-intelligence',
      title: 'Satellite & GIS Intelligence',
      category: 'Earth Observation',
      icon: Radio,
      description:
        'Multi-agency orbital feeds combining ISRO/Bhuvan, NASA Landsat/SMAP, and Copernicus Sentinel radar & thermal layers.',
      metric: '3 Space Agencies',
      accent: '#0284c7',
      badge: 'Real-Time Feeds'
    },
    {
      to: '/assessments',
      title: 'Resilience Assessments',
      category: 'Decision Engine',
      icon: FileCheck2,
      description:
        'Compute regional compatibility scores, review verified assessment history, and generate printable executive adaptation reports.',
      metric: 'Audit & Compliance',
      accent: '#34d399',
      badge: 'Scorecard Engine'
    },
    {
      to: '/about',
      title: 'About ADAPTFIT',
      category: 'Resilience Framework',
      icon: Info,
      description:
        'The scientific doctrine, passive thermodynamic physics, and living asset principles powering the ADAPTFIT resilience engine.',
      metric: 'Zero Grid Power',
      accent: '#6ee7b7',
      badge: 'Architecture'
    }
  ];

  return (
    <div className="home-page-container">
      {/* Realistic Multi-Layer Sky, Clouds, Mountains & Forest Parallax Background */}
      <ScenicBackground timeOfDay={timeOfDay} />

      {/* Main Home Hero Section */}
      <section className="home-hero-wrap">
        <div className="container home-hero-content fade-in-up">
          {/* Nature Badge */}
          <div className="hero-pill-badge">
            <span className="badge-glow-dot"></span>
            <TreePine size={14} className="hero-badge-icon" />
            <span>Planetary Resilience SaaS Engine • Multi-Page Platform</span>
          </div>

          {/* Headline */}
          <h1 className="home-hero-title">
            Adaptive Architecture <br />
            <span className="hero-gradient-text">For A Changing Earth</span>
          </h1>

          {/* Subtitle */}
          <p className="home-hero-desc">
            ADAPTFIT bridges nature-based engineering and multi-sensor orbital intelligence.
            Select vetted climate adaptations, benchmark regional stress across world locations, stress-test climate scenarios, and generate audit-grade resilience assessments.
          </p>

          {/* Hero CTAs */}
          <div className="home-hero-actions">
            <Link to="/adaptations" className="btn-primary">
              <span>Explore 10 Adaptations</span>
              <ArrowRight size={18} />
            </Link>

            <Link to="/explore-map" className="btn-secondary">
              <Compass size={18} />
              <span>Worldwide Dual-Location Map</span>
            </Link>

            <Link to="/assessments" className="btn-tertiary">
              <FileCheck2 size={18} />
              <span>Launch Assessment</span>
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="home-hero-stats">
            <div className="stat-block">
              <span className="stat-value">10</span>
              <span className="stat-title">Field Adaptations</span>
              <span className="stat-caption">Nature-based blueprints</span>
            </div>
            <div className="stat-separator" />
            <div className="stat-block">
              <span className="stat-value">66%–82%</span>
              <span className="stat-title">Kinetic Dissipation</span>
              <span className="stat-caption">Flood & surge buffering</span>
            </div>
            <div className="stat-separator" />
            <div className="stat-block">
              <span className="stat-value">ISRO • NASA</span>
              <span className="stat-title">Satellite Feeds</span>
              <span className="stat-caption">+ Copernicus Sentinel</span>
            </div>
            <div className="stat-separator" />
            <div className="stat-block">
              <span className="stat-value">7 Modules</span>
              <span className="stat-title">SaaS Architecture</span>
              <span className="stat-caption">Multi-page platform</span>
            </div>
          </div>
        </div>
      </section>

      {/* Clickable Feature Cards Grid */}
      <section className="home-modules-section">
        <div className="container">
          <div className="section-head text-center">
            <div className="badge-nature">
              <Sparkles size={14} />
              <span>Dedicated Platform Modules</span>
            </div>
            <h2 className="section-title">
              Explore the <span className="title-sky">ADAPTFIT Engine</span>
            </h2>
            <p className="section-sub">
              Access specialized multi-page tools designed for city planners, environmental engineers, and regional adaptation authorities.
            </p>
          </div>

          <div className="modules-grid">
            {platformModules.map((mod) => {
              const Icon = mod.icon;
              return (
                <Link
                  key={mod.to}
                  to={mod.to}
                  className="module-card"
                  style={{ '--mod-accent': mod.accent }}
                >
                  <div className="module-card-top">
                    <span className="module-cat">{mod.category}</span>
                    <span className="module-badge-mini">{mod.badge}</span>
                  </div>

                  <div className="module-icon-wrap">
                    <Icon size={24} className="module-icon" />
                  </div>

                  <h3 className="module-title">{mod.title}</h3>
                  <p className="module-desc">{mod.description}</p>

                  <div className="module-card-footer">
                    <span className="module-metric-pill">{mod.metric}</span>
                    <span className="module-arrow-btn">
                      <span>Launch</span>
                      <ArrowUpRight size={15} />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

