import React from 'react';
import HeroBanner from '../ui/HeroBanner';
import TramiteForm from './TramiteForm';
import MisTramitesTable from './MisTramitesTable';

const CitizenDashboard = () => {
  return (
    <>
      <HeroBanner />
      <div className="dashboard-layout">
        <TramiteForm />
        <MisTramitesTable />
      </div>
    </>
  );
};

export default CitizenDashboard;
