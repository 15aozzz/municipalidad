import React from 'react';
import HeroBanner from '../ui/HeroBanner';
import TramiteForm from './TramiteForm';

const CitizenDashboard = () => {
  return (
    <>
      <HeroBanner />
      <div style={{ maxWidth: '600px', margin: '1.5rem auto 0 auto', width: '100%' }}>
        <TramiteForm />
      </div>
    </>
  );
};

export default CitizenDashboard;
