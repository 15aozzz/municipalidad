import React, { useState } from 'react';
import { Search } from 'lucide-react';

const SearchAndFilter = ({ onFilterChange }) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
    onFilterChange({ prioridad: filter, search: searchTerm });
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onFilterChange({ prioridad: activeFilter, search: value });
  };

  return (
    <div className="tray-controls">
      <div className="search-box">
        <Search size={15} />
        <input 
          type="text" 
          placeholder="Buscar DNI o asunto..." 
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>
      <div className="filter-tabs">
        <button 
          className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => handleFilterClick('all')}
        >
          Todos
        </button>
        <button 
          className={`filter-btn ${activeFilter === 'Alta' ? 'active' : ''}`}
          onClick={() => handleFilterClick('Alta')}
        >
          Alta
        </button>
        <button 
          className={`filter-btn ${activeFilter === 'Media' ? 'active' : ''}`}
          onClick={() => handleFilterClick('Media')}
        >
          Media
        </button>
        <button 
          className={`filter-btn ${activeFilter === 'Baja' ? 'active' : ''}`}
          onClick={() => handleFilterClick('Baja')}
        >
          Baja
        </button>
      </div>
    </div>
  );
};

export default SearchAndFilter;
