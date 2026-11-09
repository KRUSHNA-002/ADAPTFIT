import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  Shield,
  Activity,
  MapPin,
  Clock,
  Radio,
  FileCheck2,
  Info,
  Menu,
  X,
  Sun,
  Sunset,
  Moon,
  BookmarkCheck
} from 'lucide-react';
import { useAdaptations } from '../../context/AdaptationsContext';
import './Navbar.css';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const {
    selectedIds,
    openPortfolio,
    timeOfDay,
    setTimeOfDay
  } = useAdaptations();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  const navLinks = [
    { to: '/', label: 'Home', icon: Shield, end: true },
    { to: '/adaptations', label: 'Adaptations', icon: Activity },
    { to: '/explore-map', label: 'Explore Map', icon: MapPin },
    { to: '/climate-memory', label: 'Climate Memory', icon: Clock },
    { to: '/satellite-intelligence', label: 'Satellite Intelligence', icon: Radio },
    { to: '/assessments', label: 'Assessments', icon: FileCheck2 },
    { to: '/about', label: 'About', icon: Info }
  ];

  return (
    <header className={`navbar-header ${isScrolled ? 'scrolled' : ''}`}>
      {/* Top Atmospheric Ticker */}
      <div className="navbar-ticker">
        <div className="container ticker-container">
          <div className="ticker-item">
            <span className="ticker-pulse"></span>
            <strong>ADAPTFIT:</strong> Right Adaptation. Right Place. • Climate Compatibility Intelligence
          </div>
          <div className="ticker-right">
            <span className="ticker-badge">Live Decision Platform</span>
            <span className="ticker-coords">7 Core Intelligence Modules</span>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="container navbar-container">
        {/* Brand Logo */}
        <Link to="/" className="navbar-brand" aria-label="ADAPTFIT Home">
          <div className="brand-logo-shield">
            <svg viewBox="0 0 44 44" className="brand-svg">
              <defs>
                <linearGradient id="navShieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="50%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
              </defs>
              <polygon points="22,4 40,11 40,25 22,40 4,25 4,11" fill="url(#navShieldGrad)" />
              <path
                d="M 22 10 C 14 18 10 26 22 34 C 34 26 30 18 22 10 Z"
                fill="#ffffff"
                opacity="0.92"
              />
              <circle cx="22" cy="22" r="3.5" fill="#0284c7" />
            </svg>
          </div>
          <div className="brand-text">
            <span className="brand-title">
              ADAPT<span className="brand-highlight">FIT</span>
            </span>
            <span className="brand-subtitle">Right Adaptation. Right Place.</span>
          </div>
        </Link>

        {/* Desktop Navigation Links (Routes) */}
        <nav className="navbar-links" aria-label="Main Navigation">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                {({ isActive }) => (
                  <>
                    <Icon className="nav-icon" size={15} />
                    <span>{item.label}</span>
                    {isActive && <span className="active-dot" />}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Navbar Action Controls */}
        <div className="navbar-actions">
          {/* Atmosphere Lighting Toggle */}
          <div className="atmosphere-picker" title="Atmospheric Lighting">
            <button
              type="button"
              className={`atmo-btn ${timeOfDay === 'day' ? 'active' : ''}`}
              onClick={() => setTimeOfDay('day')}
              aria-label="Bright Day Light"
              title="Bright Alpine Daylight"
            >
              <Sun size={14} />
            </button>
            <button
              type="button"
              className={`atmo-btn ${timeOfDay === 'dawn' ? 'active' : ''}`}
              onClick={() => setTimeOfDay('dawn')}
              aria-label="Golden Dawn Light"
              title="Golden Alpine Dawn"
            >
              <Sunset size={14} />
            </button>
            <button
              type="button"
              className={`atmo-btn ${timeOfDay === 'twilight' ? 'active' : ''}`}
              onClick={() => setTimeOfDay('twilight')}
              aria-label="Forest Twilight Light"
              title="Forest Twilight"
            >
              <Moon size={14} />
            </button>
          </div>

          {/* Selected Adaptations Portfolio Counter */}
          <button
            type="button"
            className={`portfolio-pill ${selectedIds.length > 0 ? 'highlighted' : ''}`}
            onClick={openPortfolio}
            title="Inspect Selected Climate Adaptations Portfolio"
          >
            <BookmarkCheck size={15} />
            <span className="pill-text">Selected</span>
            <span className="pill-badge">{selectedIds.length}</span>
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            className="mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div className={`mobile-drawer ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-drawer-inner">
          <div className="mobile-drawer-header">
            <span className="mobile-drawer-title">Navigation Menu</span>
            <span className="badge-nature">Multi-Page SaaS</span>
          </div>
          <div className="mobile-nav-list">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>

          <div className="mobile-portfolio-box">
            <div className="mobile-portfolio-info">
              <span className="mobile-portfolio-label">Curated Portfolio</span>
              <span className="mobile-portfolio-count">{selectedIds.length} Selected</span>
            </div>
            <button
              type="button"
              className="mobile-portfolio-btn"
              onClick={() => {
                setMobileMenuOpen(false);
                openPortfolio();
              }}
            >
              Inspect Portfolio
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
