import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp, TreePine, Shield, Sparkles } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer-wrap">
      <div className="container footer-container">
        {/* Top Footer Banner */}
        <div className="footer-top-banner">
          <div className="footer-brand">
            <Link to="/" className="footer-brand-title">
              ADAPT<span className="footer-highlight">FIT</span>
            </Link>
            <p className="footer-tagline">
              Right Adaptation. Right Place. • Climate Adaptation Compatibility Decision-Support Platform.
            </p>
          </div>

          <div className="footer-actions">
            <button className="back-to-top-btn" onClick={scrollToTop} aria-label="Back to top">
              <span>Return to Summit</span>
              <ArrowUp size={16} />
            </button>
          </div>
        </div>

        {/* Links Columns */}
        <div className="footer-grid">
          <div className="footer-col">
            <h5 className="footer-col-title">Platform Navigation</h5>
            <ul className="footer-links-list">
              <li>
                <Link to="/">Home Overview</Link>
              </li>
              <li>
                <Link to="/adaptations">10 Climate Adaptations</Link>
              </li>
              <li>
                <Link to="/explore-map">Explore Dual-Location Map</Link>
              </li>
              <li>
                <Link to="/climate-memory">Climate Memory & Scenarios</Link>
              </li>
              <li>
                <Link to="/satellite-intelligence">Satellite & GIS Intelligence</Link>
              </li>
              <li>
                <Link to="/assessments">Resilience Assessments</Link>
              </li>
              <li>
                <Link to="/about">About & Architecture</Link>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h5 className="footer-col-title">Adaptation Domains</h5>
            <ul className="footer-links-list static">
              <li>Urban Sponge Corridors</li>
              <li>Mangrove Bio-Shields</li>
              <li>Agroforestry Canopies</li>
              <li>Alpine Glacial Siphons</li>
              <li>Radiative Cool Roofs</li>
              <li>Managed Aquifer MAR</li>
            </ul>
          </div>

          <div className="footer-col">
            <h5 className="footer-col-title">Multi-Page SaaS Engine</h5>
            <p className="footer-compliance-text">
              Engineered with React Router as a modular, responsive planetary intelligence platform.
              All models compute client-side with zero external telemetry tracking.
            </p>
            <div className="compliance-badges">
              <span className="badge-nature">Multi-Page SaaS</span>
              <span className="badge-sky">Phase 1 Complete</span>
            </div>
          </div>
        </div>

        {/* Bottom Sub-Bar */}
        <div className="footer-bottom-bar">
          <div className="copyright-text">
            © {new Date().getFullYear()} ADAPTFIT Planetary Resilience Engine. Designed with Green, White & Sky-Blue Environmental Architecture.
          </div>
          <div className="footer-status-pill">
            <span className="status-indicator-dot"></span>
            <span>All Systems Nominal • 7 Modules Active</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
