import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ChevronRight } from 'lucide-react';
import './Breadcrumbs.css';

const ROUTE_LABELS = {
  '/': 'Home',
  '/adaptations': 'Climate Adaptations',
  '/explore-map': 'Worldwide Map Explorer',
  '/climate-memory': 'Climate Memory & Stress-Testing',
  '/satellite-intelligence': 'Satellite & GIS Intelligence',
  '/assessments': 'Resilience Assessments',
  '/about': 'About ADAPTFIT'
};

export default function Breadcrumbs({ customCurrent }) {
  const location = useLocation();
  const currentPath = location.pathname;

  // Don't show breadcrumbs on homepage
  if (currentPath === '/') return null;

  const currentLabel = customCurrent || ROUTE_LABELS[currentPath] || 'Overview';

  return (
    <nav className="breadcrumbs-nav" aria-label="Breadcrumb navigation">
      <div className="container breadcrumbs-container">
        <Link to="/" className="breadcrumb-item home-link">
          <Home size={14} />
          <span>Home</span>
        </Link>
        <ChevronRight size={13} className="breadcrumb-separator" />
        <span className="breadcrumb-item current" aria-current="page">
          {currentLabel}
        </span>
      </div>
    </nav>
  );
}

