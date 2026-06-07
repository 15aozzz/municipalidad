import React, { useState, useEffect, useContext } from 'react';
import { X, Check } from 'lucide-react';
import * as authService from '../../services/authService';
import { ESTADOS_TRAMITE, ESTADOS_LABELS } from '../../utils/constants';
import { TramitesContext } from '../../contexts/TramitesContext';
import { NotificationContext } from '../../contexts/NotificationContext';
import LoadingSpinner from '../common/LoadingSpinner';

const TramiteDetailModal = ({ tramite, onClose }) => {
  const [staffList, setStaffList] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [selectedEstado, setSelectedEstado] = useState(tramite.estado);
  const [selectedAsignado, setSelectedAsignado] = useState(tramite.asignado_a || '');
  const [observaciones, setObservaciones] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const { editTramite } = useContext(TramitesContext);
  const { showToast } = useContext(NotificationContext);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const result = await authService.getStaff();
        if (result.success) {
          setStaffList(result.data);
        }
      } catch (err) {
        console.error('No se pudo cargar el personal', err);
        // Fallback mockeado si falla
        setStaffList([
          { id: 2, nombres: 'Ana', apellidos: 'Quispe' },
          { id: 3, nombres: 'Roberto', apellidos: 'Chávez' }
        ]);
      } finally {
        setLoadingStaff(false);
      }
    };
    fetchStaff();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    const updateData = {};
    if (selectedEstado !== tramite.estado) updateData.estado = selectedEstado;
    if (selectedAsignado && selectedAsignado !== tramite.asignado_a) updateData.asignado_a = Number(selectedAsignado);
    if (observaciones.trim()) updateData.observaciones = observaciones.trim();

    if (Object.keys(updateData).length === 0) {
      onClose();
      return;
    }

    const result = await editTramite(tramite.id, updateData);
    setIsSaving(false);

    if (result.success) {
      showToast('Actualizado', 'El trámite se actualizó correctamente.', 'success');
      onClose();
    } else {
      showToast('Error', result.message, 'error');
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div className="card-glass" style={{ width: '90%', maxWidth: '500px', backgroundColor: 'var(--bg-secondary)' }}>
        <div className="card-header">
          <h3 className="card-title">Actualizar Trámite #{String(tramite.id).padStart(5, '0')}</h3>
          <button className="toast-close" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="card-body">
          
          <div className="form-group">
            <label>Estado del Trámite</label>
            <select 
              className="form-control" 
              value={selectedEstado} 
              onChange={(e) => setSelectedEstado(e.target.value)}
              disabled={isSaving}
            >
              {Object.values(ESTADOS_TRAMITE).map(est => (
                <option key={est} value={est}>{ESTADOS_LABELS[est]}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label>Asignar a Personal</label>
            {loadingStaff ? (
              <LoadingSpinner size={20} />
            ) : (
              <select 
                className="form-control" 
                value={selectedAsignado} 
                onChange={(e) => setSelectedAsignado(e.target.value)}
                disabled={isSaving}
              >
                <option value="">Sin Asignar</option>
                {staffList.map(staff => (
                  <option key={staff.id} value={staff.id}>
                    {staff.nombres} {staff.apellidos}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label>Observaciones / Comentario de derivación (Opcional)</label>
            <textarea 
              className="form-control" 
              style={{ minHeight: '80px', resize: 'vertical', fontFamily: 'inherit', padding: '0.5rem' }}
              value={observaciones} 
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Ej. Requisitos incompletos / Trámite derivado al área legal."
              disabled={isSaving}
            />
          </div>

          <button 
            className="btn-submit" 
            onClick={handleSave} 
            disabled={isSaving || (selectedEstado === tramite.estado && selectedAsignado == (tramite.asignado_a || '') && !observaciones.trim())}
            style={{ marginTop: '2rem' }}
          >
            {isSaving ? <LoadingSpinner size={16} color="#fff" /> : <Check size={16} />} 
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
};

export default TramiteDetailModal;
