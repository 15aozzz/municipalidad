import React from 'react';

const MainHeader = () => {
  return (
    <header className="header-gov">
      <div className="header-container">
        <div className="brand">
          <img 
            src="/logo.png" 
            alt="Municipalidad de La Victoria" 
            style={{ height: '55px', width: 'auto', display: 'block' }}
          />
        </div>
        
        {/* Logo Oficial de Transparencia Estándar (PTE) */}
        <div className="pte-container">
          <svg viewBox="0 0 145 50" style={{ width: '125px', height: 'auto' }}>
            <circle cx="120" cy="22" r="11" stroke="#475569" strokeWidth="2.5" fill="none"/>
            <line x1="127" y1="29" x2="137" y2="39" stroke="#475569" strokeWidth="4" strokeLinecap="round"/>
            <text x="120" y="25" fontFamily="'Inter', sans-serif" fontWeight="800" fontSize="8" fill="#1351A5" textAnchor="middle">pte</text>
            <text x="5" y="18" fontFamily="'Plus Jakarta Sans', sans-serif" fontWeight="700" fontSize="10.5" fill="#788290" fontStyle="italic">Portal de</text>
            <text x="5" y="32" fontFamily="'Plus Jakarta Sans', sans-serif" fontWeight="800" fontSize="12.5" fill="#475569">Transparencia</text>
            <text x="5" y="41" fontFamily="'Inter', sans-serif" fontWeight="500" fontSize="7" fill="#94a3b8" letterSpacing="0.05em">estándar</text>
          </svg>
        </div>
      </div>
    </header>
  );
};

export default MainHeader;
