import React, { useContext, useEffect } from 'react';
import { TramitesContext } from '../../contexts/TramitesContext';
import { FileText, ClipboardX } from 'lucide-react';
import { formatDate, formatCertainty } from '../../utils/formatters';
import LoadingSpinner from '../common/LoadingSpinner';

const MisTramitesTable = () => {
  const { tramites, loading, fetchTramites } = useContext(TramitesContext);

  useEffect(() => {
    fetchTramites();
  }, [fetchTramites]);

  return (
    <div className="card-glass" style={{ height: '100%' }}>
      <div className="card-header">
        <h3 className="card-title">
          <FileText size={18} /> Historial de Trámites Registrados
        </h3>
      </div>
      
      <div className="card-body">
        {loading && <LoadingSpinner />}
        
        {!loading && tramites.length === 0 ? (
          <div className="empty-state" style={{ display: 'block' }}>
            <ClipboardX size={44} style={{ opacity: 0.4, marginBottom: '0.75rem' }} />
            <p>No se encontraron trámites registrados</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table-tramites">
              <thead>
                <tr>
                  <th>N° Trámite</th>
                  <th>Asunto / Detalle</th>
                  <th>Fecha Ingreso</th>
                  <th>Prioridad IA</th>
                  <th>Certeza</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {tramites.map((t) => {
                  const prioridadClass = t.prioridad?.toLowerCase() || 'baja';
                  return (
                    <tr key={t.id} className="row-animated">
                      <td className="cell-dni">#{String(t.id).padStart(5, '0')}</td>
                      <td className="cell-asunto">
                        <div className="asunto-title" title={t.asunto}>{t.asunto}</div>
                        <div className="asunto-desc" title={t.descripcion}>{t.descripcion}</div>
                      </td>
                      <td>{formatDate(t.fecha_creacion)}</td>
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
                      <td>
                        <span className="cell-action-tag" style={{ textTransform: 'capitalize' }}>
                          {t.estado.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MisTramitesTable;
