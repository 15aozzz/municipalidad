import React from 'react';

const KPICards = ({ tramites }) => {
  const total = tramites.length;
  const alta = tramites.filter(t => t.prioridad === 'Alta').length;
  const media = tramites.filter(t => t.prioridad === 'Media').length;
  const baja = tramites.filter(t => t.prioridad === 'Baja').length;

  return (
    <div className="kpi-container">
      <div className="kpi-card total">
        <div className="kpi-number">{total}</div>
        <div className="kpi-label">Ingresados</div>
      </div>
      <div className="kpi-card alta">
        <div className="kpi-number" style={{ color: 'var(--color-danger)' }}>{alta}</div>
        <div className="kpi-label">Prioridad Alta</div>
      </div>
      <div className="kpi-card media">
        <div className="kpi-number" style={{ color: 'var(--color-warning)' }}>{media}</div>
        <div className="kpi-label">Prioridad Media</div>
      </div>
      <div className="kpi-card baja">
        <div className="kpi-number" style={{ color: 'var(--color-success)' }}>{baja}</div>
        <div className="kpi-label">Prioridad Baja</div>
      </div>
    </div>
  );
};

export default KPICards;
