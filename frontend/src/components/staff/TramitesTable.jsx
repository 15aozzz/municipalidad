import React from 'react';
import { formatDate, formatCertainty } from '../../utils/formatters';
import { ClipboardX, Edit } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';

const TramitesTable = ({ tramites, loading, onEdit }) => {
  return (
    <div className="table-responsive">
      {loading && <LoadingSpinner />}
      
      {!loading && tramites.length === 0 ? (
        <div className="empty-state" style={{ display: 'block' }}>
          <ClipboardX size={44} style={{ opacity: 0.4, marginBottom: '0.75rem' }} />
          <p>No se encontraron trámites registrados</p>
        </div>
      ) : (
        <table className="table-tramites">
          <thead>
            <tr>
              <th>DNI</th>
              <th>Asunto / Detalle</th>
              <th>Prioridad</th>
              <th>Certeza IA</th>
              <th>Acción Sugerida</th>
              <th>Estado / Asignado</th>
              <th>Gestión</th>
            </tr>
          </thead>
          <tbody>
            {tramites.map((t) => {
              const prioridadClass = t.prioridad?.toLowerCase() || 'baja';
              return (
                <tr key={t.id} className="row-animated">
                  <td className="cell-dni">{t.dni}</td>
                  <td className="cell-asunto">
                    <div className="asunto-title" title={t.asunto}>{t.asunto}</div>
                    <div className="asunto-desc" title={t.descripcion}>
                      Por: {t.solicitante} <br/>
                      {t.descripcion}
                    </div>
                  </td>
                  <td>
                    <span className={`badge-priority ${prioridadClass}`}>
                      {t.prioridad === 'Alta' && <div className="dot-pulse"></div>}
                      {t.prioridad}
                    </span>
                  </td>
                  <td className="cell-certainty">
                    <span className="certainty-num">{formatCertainty(t.certeza)}</span>
                    <div className="certainty-track">
                      <div 
                        className="certainty-bar" 
                        style={{ width: `${t.certeza || 0}%` }}
                      ></div>
                    </div>
                  </td>
                  <td className="cell-action">
                    <span className="cell-action-tag">{t.accion_sugerida || 'Pendiente IA'}</span>
                  </td>
                  <td>
                    <div style={{ textTransform: 'capitalize', fontWeight: 'bold' }}>
                      {t.estado.replace('_', ' ')}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {t.asignado_nombre || 'Sin asignar'}
                    </div>
                  </td>
                  <td>
                    <button 
                      className="filter-btn"
                      onClick={() => onEdit(t)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                    >
                      <Edit size={12} /> Gestionar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TramitesTable;
