import React, { useContext, useEffect, useState, useMemo } from 'react';
import KPICards from './KPICards';
import SearchAndFilter from './SearchAndFilter';
import TramitesTable from './TramitesTable';
import TramiteDetailModal from './TramiteDetailModal';
import { TramitesContext } from '../../contexts/TramitesContext';
import { LayoutDashboard } from 'lucide-react';

const StaffDashboard = () => {
  const { tramites, loading, fetchTramites } = useContext(TramitesContext);
  const [filters, setFilters] = useState({ prioridad: 'all', search: '' });
  const [selectedTramite, setSelectedTramite] = useState(null);

  useEffect(() => {
    fetchTramites();
    
    // Auto-refresh cada minuto para tener los últimos trámites
    const intervalId = setInterval(() => {
      fetchTramites();
    }, 60000);
    return () => clearInterval(intervalId);
  }, [fetchTramites]);

  const filteredTramites = useMemo(() => {
    return tramites.filter(t => {
      const matchPrioridad = filters.prioridad === 'all' || t.prioridad === filters.prioridad;
      const term = filters.search.toLowerCase();
      const matchSearch = 
        !term || 
        t.dni.includes(term) || 
        t.asunto.toLowerCase().includes(term) ||
        (t.solicitante && t.solicitante.toLowerCase().includes(term));
      
      return matchPrioridad && matchSearch;
    });
  }, [tramites, filters]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleEditTramite = (tramite) => {
    setSelectedTramite(tramite);
  };

  const handleCloseModal = () => {
    setSelectedTramite(null);
  };

  return (
    <>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
          <LayoutDashboard size={28} style={{ color: 'var(--primary-color)' }} /> 
          Panel de Control Staff / Administrador
        </h2>
        
        <KPICards tramites={tramites} />
      </div>

      <div className="card-glass">
        <div className="card-header" style={{ paddingBottom: 0, borderBottom: 'none' }}>
          <SearchAndFilter onFilterChange={handleFilterChange} />
        </div>
        <div className="card-body">
          <TramitesTable 
            tramites={filteredTramites} 
            loading={loading} 
            onEdit={handleEditTramite} 
          />
        </div>
      </div>

      {selectedTramite && (
        <TramiteDetailModal 
          tramite={selectedTramite} 
          onClose={handleCloseModal} 
        />
      )}
    </>
  );
};

export default StaffDashboard;
