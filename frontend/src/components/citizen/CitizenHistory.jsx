import React from 'react';
import HeroBanner from '../ui/HeroBanner';
import MisTramitesTable from './MisTramitesTable';

const CitizenHistory = () => {
  return (
    <>
      <HeroBanner />
      <div className="history-layout" style={{ marginTop: '1.5rem' }}>
        <MisTramitesTable />
      </div>
    </>
  );
};

export default CitizenHistory;
