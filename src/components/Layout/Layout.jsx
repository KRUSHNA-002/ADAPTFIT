import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import AdaptationModal from '../AdaptationModal/AdaptationModal';
import { useAdaptations } from '../../context/AdaptationsContext';
import './Layout.css';

export default function Layout() {
  const {
    isModalOpen,
    isPortfolioModalOpen,
    selectedAdaptationForModal,
    selectedAdaptationsList,
    selectedIds,
    toggleSelect,
    openDetails,
    closeModal
  } = useAdaptations();

  const location = useLocation();

  return (
    <div className="platform-layout">
      {/* Sticky Fixed Premium Navbar */}
      <Navbar />

      {/* Dynamic Route Content with Key for Smooth Transition */}
      <main className="route-content-wrap key-wrap" key={location.pathname}>
        <Outlet />
      </main>

      {/* Environmental Global Footer */}
      <Footer />

      {/* Global Shared Adaptation & Portfolio Inspector Modal */}
      <AdaptationModal
        isOpen={isModalOpen}
        onClose={closeModal}
        adaptation={selectedAdaptationForModal}
        isPortfolioView={isPortfolioModalOpen}
        selectedAdaptations={selectedAdaptationsList}
        isSelected={
          selectedAdaptationForModal
            ? selectedIds.includes(selectedAdaptationForModal.id)
            : false
        }
        onToggleSelect={toggleSelect}
        onSelectAdaptation={(item) => {
          openDetails(item);
        }}
      />
    </div>
  );
}

