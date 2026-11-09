import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AdaptationsProvider } from './context/AdaptationsContext';
import Layout from './components/Layout/Layout';

// 7 Dedicated Functional Pages
import HomePage from './pages/HomePage/HomePage';
import AdaptationsPage from './pages/AdaptationsPage/AdaptationsPage';
import ExploreMapPage from './pages/ExploreMapPage/ExploreMapPage';
import ClimateMemoryPage from './pages/ClimateMemoryPage/ClimateMemoryPage';
import SatelliteIntelPage from './pages/SatelliteIntelPage/SatelliteIntelPage';
import AssessmentsPage from './pages/AssessmentsPage/AssessmentsPage';
import AboutPage from './pages/AboutPage/AboutPage';

import './App.css';

// Automatically scroll to summit on route transition
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <AdaptationsProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="adaptations" element={<AdaptationsPage />} />
            <Route path="explore-map" element={<ExploreMapPage />} />
            <Route path="climate-memory" element={<ClimateMemoryPage />} />
            <Route path="satellite-intelligence" element={<SatelliteIntelPage />} />
            <Route path="assessments" element={<AssessmentsPage />} />
            <Route path="about" element={<AboutPage />} />
            {/* Fallback to Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AdaptationsProvider>
  );
}
