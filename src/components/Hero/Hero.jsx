import React from 'react';
import { ArrowDownRight, Compass, Sparkles, ShieldCheck, TreePine } from 'lucide-react';
import './Hero.css';

export default function Hero({ onExploreAdaptations, onExploreMap }) {
  return (
    <section className="hero-section" id="home">
      <div className="container hero-container">
        {/* Top Floating Nature Pill */}
        <div className="hero-badge-wrap">
          <div className="hero-badge">
            <span className="badge-glow-dot"></span>
            <TreePine size={14} className="badge-icon" />
            <span className="badge-text">Planetary Engineering • Phase 1 Active</span>
          </div>
        </div>

        {/* Main Headline */}
        <h1 className="hero-title">
          Adaptive Architecture <br />
          <span className="hero-title-gradient">For A Changing Earth</span>
        </h1>

        {/* Subtitle / Value Proposition */}
        <p className="hero-description">
          ADAPTFIT orchestrates high-leverage nature-based engineering and biophilic defense systems.
          Explore 10 vetted climate adaptations designed to buffer extreme flood deluges, damp coastal storm surges, cool scorched urban basins, and stabilize alpine glaciers.
        </p>

        {/* CTA Button Group */}
        <div className="hero-actions">
          <button className="btn-primary" onClick={onExploreAdaptations}>
            <span>Explore 10 Adaptations</span>
            <ArrowDownRight size={18} />
          </button>

          <button className="btn-secondary" onClick={onExploreMap}>
            <Compass size={18} />
            <span>Planetary Biome Map</span>
          </button>
        </div>

        {/* Hero Impact Stats Floating Strip */}
        <div className="hero-stats-strip">
          <div className="hero-stat-card">
            <div className="stat-number">10</div>
            <div className="stat-label">Validated Adaptations</div>
            <div className="stat-sub">Spanning 8 global biomes</div>
          </div>

          <div className="stat-divider" />

          <div className="hero-stat-card">
            <div className="stat-number">66%–82%</div>
            <div className="stat-label">Shock Kinetic Dissipation</div>
            <div className="stat-sub">Flood & wave surge dampening</div>
          </div>

          <div className="stat-divider" />

          <div className="hero-stat-card">
            <div className="stat-number">-6.5°C</div>
            <div className="stat-label">Microclimate Cooling</div>
            <div className="stat-sub">Passive radiative & canopy shade</div>
          </div>

          <div className="stat-divider" />

          <div className="hero-stat-card">
            <div className="stat-number">100%</div>
            <div className="stat-label">Nature-Based Physics</div>
            <div className="stat-sub">Zero reliance on grid power</div>
          </div>
        </div>

        {/* Subtle Scroll Hint */}
        <div className="hero-scroll-hint">
          <span className="scroll-hint-text">Scroll to immerse in forest & mountain biome</span>
          <div className="scroll-indicator-bar">
            <div className="scroll-dot"></div>
          </div>
        </div>
      </div>
    </section>
  );
}

