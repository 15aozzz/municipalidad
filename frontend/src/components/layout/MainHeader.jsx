import React from 'react';
import { Link } from 'react-router-dom';

const MainHeader = () => {
  return (
    <header className="header-gov">
      <div className="header-container">
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="brand" style={{ cursor: 'pointer' }}>
            <div className="brand-text">
              <h1 style={{ fontSize: '1.5rem', fontWeight: '800' }}>
                MUNICIPALIDAD PROVINCIAL DE <span style={{ fontSize: 'inherit', fontWeight: '900' }}>YAU</span>
              </h1>
              <p>Mesa de Partes Virtual con Inteligencia Artificial</p>
            </div>
          </div>
        </Link>
      </div>
    </header>
  );
};

export default MainHeader;
