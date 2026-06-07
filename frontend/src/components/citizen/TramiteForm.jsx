import React, { useState, useContext } from 'react';
import { CreditCard, Heading, Sparkles } from 'lucide-react';
import { TramitesContext } from '../../contexts/TramitesContext';
import { NotificationContext } from '../../contexts/NotificationContext';
import { AuthContext } from '../../contexts/AuthContext';
import { useFormValidation } from '../../hooks/useFormValidation';
import { validateTramiteForm } from '../../utils/validators';

const TramiteForm = () => {
  const { addTramite } = useContext(TramitesContext);
  const { showToast } = useContext(NotificationContext);
  const { user } = useContext(AuthContext);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isCitizen = user?.rol === 'ciudadano';

  const validateCustom = (formValues) => {
    const validationErrors = validateTramiteForm(formValues);
    if (isCitizen) {
      delete validationErrors.dni;
    }
    return validationErrors;
  };

  const { values, errors, handleChange, validate, resetForm } = useFormValidation(
    { dni: '', asunto: '', descripcion: '' },
    validateCustom
  );

  const ASUNTO_OPTIONS = [
    'Solicitud de Licencia de Funcionamiento',
    'Reporte de Incidencias en la Vía Pública',
    'Quejas y Denuncias de Limpieza Pública',
    'Trámites de Registro Civil',
    'Consultas y Gestión Tributaria',
    'Inspección Técnica de Seguridad (Defensa Civil)',
    'Reclamos, Sugerencias y Trámites Generales'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const result = await addTramite({
      ...values,
      dni: isCitizen ? (user?.dni || '') : values.dni
    });
    setIsSubmitting(false);

    if (result.success) {
      resetForm();
      const isAlta = result.data?.prioridad === 'Alta';
      if (isAlta) {
        showToast(
          '¡Atención Prioritaria!',
          'La IA ha detectado una urgencia Alta en su solicitud. Un equipo de respuesta rápida ha sido notificado.',
          'danger',
          8000
        );
      } else {
        showToast(
          'Trámite Registrado',
          'Su solicitud ha sido clasificada por la IA y derivada al departamento correspondiente.',
          'success'
        );
      }
    } else {
      showToast('Error', result.message, 'error');
    }
  };

  return (
    <div className="card-glass">
      {isSubmitting && (
        <div className="form-loading-bar" style={{ display: 'block' }}>
          <div className="form-loading-bar-inner"></div>
        </div>
      )}
      
      <div className="card-header">
        <h3 className="card-title">
          <Sparkles size={18} /> Mesa de Partes Virtual (Clasificación IA)
        </h3>
      </div>
      
      <div className="card-body">
        <form onSubmit={handleSubmit} noValidate>
          {/* DNI */}
          {!isCitizen && (
            <div className="form-group">
              <label htmlFor="dni">DNI del Solicitante</label>
              <div className="input-wrapper">
                <CreditCard size={15} />
                <input 
                  type="text" 
                  id="dni" 
                  name="dni" 
                  className={`form-control ${errors.dni ? 'is-invalid' : ''}`}
                  placeholder="Ingrese los 8 dígitos" 
                  maxLength="8"
                  value={values.dni}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              </div>
              {errors.dni && <small className="validation-feedback invalid">{errors.dni}</small>}
            </div>
          )}

          {/* Asunto */}
          <div className="form-group">
            <label htmlFor="asunto">Asunto del Trámite</label>
            <div className="input-wrapper">
              <Heading size={15} />
              <select 
                id="asunto" 
                name="asunto" 
                className={`form-control ${errors.asunto ? 'is-invalid' : ''}`}
                value={values.asunto}
                onChange={handleChange}
                disabled={isSubmitting}
                style={{ 
                  appearance: 'none', 
                  WebkitAppearance: 'none', 
                  paddingRight: '2.5rem',
                  cursor: 'pointer'
                }}
              >
                <option value="">-- Seleccione el asunto --</option>
                {ASUNTO_OPTIONS.map((opt) => (
                  <option key={opt} value={opt} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                    {opt}
                  </option>
                ))}
              </select>
              <span style={{
                position: 'absolute',
                right: '1rem',
                pointerEvents: 'none',
                border: 'solid transparent',
                borderWidth: '5px 5px 0 5px',
                borderTopColor: 'var(--text-muted)'
              }}></span>
            </div>
            {errors.asunto && <small className="validation-feedback invalid">{errors.asunto}</small>}
          </div>

          {/* Descripción */}
          <div className="form-group" style={{ position: 'relative' }}>
            <label htmlFor="descripcion">Descripción Detallada</label>
            <textarea 
              id="descripcion" 
              name="descripcion" 
              className={`form-control ${errors.descripcion ? 'is-invalid' : ''}`}
              placeholder="Describa el problema. Nuestro motor de IA analizará este texto para definir la urgencia..."
              maxLength="500"
              value={values.descripcion}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            <span className="char-counter">{values.descripcion.length} / 500</span>
            {errors.descripcion && <small className="validation-feedback invalid" style={{ marginTop: '0.65rem' }}>{errors.descripcion}</small>}
          </div>

          <button type="submit" className="btn-submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="spinner" style={{ display: 'inline-block' }}></span>
            ) : (
              <Sparkles size={16} />
            )}
            <span>{isSubmitting ? 'Procesando con IA...' : 'Enviar a la Inteligencia Artificial'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default TramiteForm;
