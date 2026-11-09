import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Sparkles,
  SlidersHorizontal,
  BookmarkCheck
} from 'lucide-react';
import AdaptationCard from '../AdaptationCard/AdaptationCard';
import './AdaptationGrid.css';

export default function AdaptationGrid({
  adaptations,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onClearSelection,
  onOpenDetails,
  onOpenPortfolio
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');

  // Filter categories
  const filterCategories = [
    'All',
    'Urban Hydrology',
    'Coastal Defense',
    'Regenerative Agriculture',
    'Cryosphere Engineering',
    'Water-Energy Nexus',
    'Thermal Resilience',
    'Wildfire Defense',
    'Biophilic Architecture'
  ];

  // Filtered adaptations
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
    <section className="adaptation-grid-section" id="adaptations">
      <div className="container">
        {/* Section Heading */}
        <div className="section-head text-center">
          <div className="badge-nature">
            <Sparkles size={14} />
            <span>Selectable Adaptation Catalog</span>
          </div>
          <h2 className="section-title">
            10 Planetary Resilience <span className="title-sky">Adaptations</span>
          </h2>
          <p className="section-sub">
            Curate and compare 10 nature-based adaptation systems. Select individual strategies to build a personalized regional resilience portfolio.
          </p>
        </div>

        {/* Filter & Search Control Panel */}
        <div className="catalog-toolbar">
          {/* Search Box */}
          <div className="search-input-wrap">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Filter by keyword (e.g. sponge, reef, heat, alpine)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search text"
              >
                ✕
              </button>
            )}
          </div>

          {/* Biome Filter Pills */}
          <div className="filter-pills-row">
            <span className="filter-label">
              <SlidersHorizontal size={14} />
              <span>Domain:</span>
            </span>
            <div className="filter-scroll">
              {filterCategories.map((cat) => (
                <button
                  key={cat}
                  className={`filter-pill ${selectedFilter === cat ? 'active' : ''}`}
                  onClick={() => setSelectedFilter(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Selection Status Bar */}
        <div className="selection-status-bar">
          <div className="selection-info">
            <BookmarkCheck size={18} className="selection-icon" />
            <span className="selection-count">
              <strong>{selectedIds.length}</strong> of <strong>{adaptations.length}</strong> Adaptations Selected
            </span>
            {selectedIds.length > 0 && (
              <span className="portfolio-hint">Ready for deep scenario synthesis</span>
            )}
          </div>

          <div className="selection-btn-group">
            <button
              type="button"
              className="toolbar-action-btn"
              onClick={onSelectAll}
            >
              <CheckCircle size={15} />
              <span>Select All (10)</span>
            </button>
            {selectedIds.length > 0 && (
              <button
                type="button"
                className="toolbar-action-btn secondary"
                onClick={onClearSelection}
              >
                <XCircle size={15} />
                <span>Reset</span>
              </button>
            )}
            <button
              type="button"
              className="toolbar-cta-btn"
              onClick={onOpenPortfolio}
              disabled={selectedIds.length === 0}
            >
              <span>Inspect Portfolio ({selectedIds.length})</span>
            </button>
          </div>
        </div>

        {/* 10 Cards Responsive Grid */}
        <div className="cards-grid">
          {filteredList.map((item) => (
            <AdaptationCard
              key={item.id}
              adaptation={item}
              isSelected={selectedIds.includes(item.id)}
              onToggleSelect={onToggleSelect}
              onOpenDetails={onOpenDetails}
            />
          ))}
        </div>

        {/* Empty Search Feedback */}
        {filteredList.length === 0 && (
          <div className="empty-results">
            <p>No climate adaptation match found for "{searchQuery}".</p>
            <button
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
  );
}

