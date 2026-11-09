import React, { useState, useMemo } from 'react';
import {
  Activity,
  Search,
  SlidersHorizontal,
  BookmarkCheck,
  CheckCircle,
  XCircle,
  Sparkles,
  Download
} from 'lucide-react';
import Breadcrumbs from '../../components/Breadcrumbs/Breadcrumbs';
import AdaptationCard from '../../components/AdaptationCard/AdaptationCard';
import { useAdaptations } from '../../context/AdaptationsContext';
import './AdaptationsPage.css';

export default function AdaptationsPage() {
  const {
    adaptations,
    selectedIds,
    toggleSelect,
    selectAll,
    clearSelection,
    openDetails,
    openPortfolio
  } = useAdaptations();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');

  const filterCategories = [
    'All',
    'Urban Hydrology',
    'Coastal Defense',
    'Regenerative Agriculture',
    'Cryosphere Engineering',
    'Water-Energy Nexus',
    'Thermal Resilience',
    'Wildfire Defense',
    'Subsurface Hydrology',
    'Littoral Stability',
    'Biophilic Architecture'
  ];

  const filteredList = useMemo(() => {
    return adaptations.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.biome.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedFilter === 'All' || item.category === selectedFilter;

      return matchesSearch && matchesCategory;
    });
  }, [adaptations, searchQuery, selectedFilter]);

  return (
    <div className="page-wrapper adaptations-page">
      <Breadcrumbs />

      {/* Page Header */}
      <section className="page-header-section">
        <div className="container">
          <div className="page-header-badge">
            <Activity size={15} />
            <span>Selectable Catalog • Phase 1 Core</span>
          </div>
          <h1 className="page-title">
            10 Planetary Climate <span className="title-sky">Adaptations</span>
          </h1>
          <p className="page-subtitle">
            Curate and inspect 10 field-ready, nature-based engineering solutions.
            Select adaptations to assemble a synchronized regional resilience portfolio with verified CapEx and kinetic mitigation profiles.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="adaptations-content-section">
        <div className="container">
          {/* Catalog Toolbar */}
          <div className="catalog-toolbar">
            {/* Search Box */}
            <div className="search-input-wrap">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search adaptations by keyword, biome, or benefit (e.g. sponge, reef, heat, aquifer)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="clear-search-btn"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="filter-pills-row">
              <span className="filter-label">
                <SlidersHorizontal size={14} />
                <span>Domain:</span>
              </span>
              <div className="filter-scroll">
                {filterCategories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`filter-pill ${selectedFilter === cat ? 'active' : ''}`}
                    onClick={() => setSelectedFilter(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Selection Status Banner */}
          <div className="selection-status-bar">
            <div className="selection-info">
              <BookmarkCheck size={18} className="selection-icon" />
              <span className="selection-count">
                <strong>{selectedIds.length}</strong> of <strong>{adaptations.length}</strong> Adaptations Selected
              </span>
              {selectedIds.length > 0 && (
                <span className="portfolio-hint">Portfolio Ready for Synthesis</span>
              )}
            </div>

            <div className="selection-btn-group">
              <button
                type="button"
                className="toolbar-action-btn"
                onClick={selectAll}
              >
                <CheckCircle size={15} />
                <span>Select All (10)</span>
              </button>
              {selectedIds.length > 0 && (
                <button
                  type="button"
                  className="toolbar-action-btn secondary"
                  onClick={clearSelection}
                >
                  <XCircle size={15} />
                  <span>Reset</span>
                </button>
              )}
              <button
                type="button"
                className="toolbar-cta-btn"
                onClick={openPortfolio}
                disabled={selectedIds.length === 0}
              >
                <span>Inspect Portfolio ({selectedIds.length})</span>
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="cards-grid">
            {filteredList.map((item) => (
              <AdaptationCard
                key={item.id}
                adaptation={item}
                isSelected={selectedIds.includes(item.id)}
                onToggleSelect={toggleSelect}
                onOpenDetails={openDetails}
              />
            ))}
          </div>

          {/* Empty Results Feedback */}
          {filteredList.length === 0 && (
            <div className="empty-results">
              <p>No climate adaptation matches found for "{searchQuery}".</p>
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedFilter('All');
                }}
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

