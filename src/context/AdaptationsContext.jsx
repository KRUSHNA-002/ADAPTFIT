import React, { createContext, useContext, useState, useMemo } from 'react';
import { CLIMATE_ADAPTATIONS } from '../data/adaptationsData';

const AdaptationsContext = createContext(null);

export function AdaptationsProvider({ children }) {
  // Pre-selected default strategies
  const [selectedIds, setSelectedIds] = useState([
    'rain-garden',
    'cool-roofs',
    'bioswales'
  ]);

  // Persistent map locations (survive navigation between pages)
  const [mapLocationA, setMapLocationA] = useState(null);
  const [mapLocationB, setMapLocationB] = useState(null);

  const [timeOfDay, setTimeOfDay] = useState('day');

  // Modal inspection state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPortfolioModalOpen, setIsPortfolioModalOpen] = useState(false);
  const [selectedAdaptationForModal, setSelectedAdaptationForModal] = useState(null);

  const selectedAdaptationsList = useMemo(() => {
    return CLIMATE_ADAPTATIONS.filter((item) => selectedIds.includes(item.id));
  }, [selectedIds]);

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedIds(CLIMATE_ADAPTATIONS.map((a) => a.id));
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  const openDetails = (adaptation) => {
    setSelectedAdaptationForModal(adaptation);
    setIsPortfolioModalOpen(false);
    setIsModalOpen(true);
  };

  const ALIASES = {
    'sponge-corridors': 'bioswales',
    'high-albedo-cool-roofs': 'cool-roofs',
    'mangrove-bioshields': 'wetland-restoration',
    'agroforestry-canopy': 'urban-tree-planting',
    'floating-solar-shields': 'detention-retention-ponds',
    'aquifer-recharge-wells': 'rain-garden',
    'vertical-urban-forests': 'green-roof',
    'dune-vegetation-fences': 'floodplain-restoration',
    'fire-resilient-buffers': 'urban-green-corridors',
    'alpine-glof-spillways': 'detention-retention-ponds',
  };

  const openAdaptationById = (id) => {
    if (!id) return;
    const norm = String(id).trim().toLowerCase().replace(/_/g, '-').replace(/\s+/g, '-');
    const targetId = ALIASES[norm] || norm;
    const found = CLIMATE_ADAPTATIONS.find((a) => a.id === id || a.id === norm || a.id === targetId);
    if (found) {
      openDetails(found);
    }
  };

  const openPortfolio = () => {
    setIsPortfolioModalOpen(true);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsPortfolioModalOpen(false);
  };

  const value = {
    adaptations: CLIMATE_ADAPTATIONS,
    selectedIds,
    selectedAdaptationsList,
    toggleSelect,
    selectAll,
    clearSelection,
    openDetails,
    openAdaptationById,
    openPortfolio,
    closeModal,
    isModalOpen,
    isPortfolioModalOpen,
    selectedAdaptationForModal,
    timeOfDay,
    setTimeOfDay,
    // Persistent map locations (survive route changes)
    mapLocationA,
    setMapLocationA,
    mapLocationB,
    setMapLocationB,
  };

  return (
    <AdaptationsContext.Provider value={value}>
      {children}
    </AdaptationsContext.Provider>
  );
}

export function useAdaptations() {
  const context = useContext(AdaptationsContext);
  if (!context) {
    throw new Error('useAdaptations must be used within an AdaptationsProvider');
  }
  return context;
}

