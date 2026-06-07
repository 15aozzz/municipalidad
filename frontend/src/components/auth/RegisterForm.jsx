import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../../services/authService';
import { NotificationContext } from '../../contexts/NotificationContext';
import { Mail, Lock, User, Phone, MapPin, CreditCard, UserPlus } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import { isValidDni, isValidEmail } from '../../utils/validators';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    dni: '',
    nombres: '',
    apellidos: '',
    email: '',
    password: '',
    telefono: '',
    direccion: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const { showToast } = useContext(NotificationContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value
    }));
    if (errors[id]) {
      setErrors((prev) => ({
        ...prev,
        [id]: null
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.dni) {
      newErrors.dni = 'El DNI es obligatorio.';
    } else if (!isValidDni(formData.dni)) {
      newErrors.dni = 'El DNI debe tener exactamente 8 caracteres numéricos.';
    }

    if (!formData.nombres.trim()) {
      newErrors.nombres = 'El nombre es obligatorio.';
    }

    if (!formData.apellidos.trim()) {
      newErrors.apellidos = 'El apellido es obligatorio.';
    }

    if (!formData.email) {
      newErrors.email = 'El correo electrónico es obligatorio.';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'El formato del correo no es válido.';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es obligatoria.';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setApiError('');

    try {
      const result = await register({
        dni: formData.dni,
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        email: formData.email,
        password: formData.password,
        telefono: formData.telefono ? formData.telefono.trim() : null,
        direccion: formData.direccion ? formData.direccion.trim() : null,
        rol: 'ciudadano'
      });

      if (result.success) {
        showToast('Registro Exitoso', 'Tu cuenta ha sido creada. Ahora puedes iniciar sesión.', 'success');
        navigate('/login');
      } else {
        setApiError(result.message || 'Error al registrar el usuario.');
        setIsLoading(false);
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Ocurrió un error en el servidor.';
      setApiError(message);
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '2rem auto', width: '100%' }}>
      <div className="card-glass">
        <div className="card-header" style={{ justifyContent: 'center' }}>
          <h3 className="card-title">
            <UserPlus size={20} /> Registro de Ciudadano
          </h3>
        </div>
        <div className="card-body">
          <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Complete el formulario para crear su cuenta de ciudadano y acceder a la Mesa de Partes Virtual.
          </p>

          {apiError && (
            <div className="validation-feedback invalid" style={{ marginBottom: '1rem', padding: '0.5rem', backgroundColor: 'var(--color-danger-bg)', borderRadius: '6px', display: 'block' }}>
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* DNI */}
            <div className="form-group">
              <label htmlFor="dni">DNI *</label>
              <div className="input-wrapper">
                <CreditCard size={15} />
                <input
                  type="text"
                  id="dni"
                  className={`form-control ${errors.dni ? 'is-invalid' : ''}`}
                  placeholder="12345678"
                  maxLength="8"
                  value={formData.dni}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
              {errors.dni && <small className="validation-feedback invalid" style={{ display: 'block' }}>{errors.dni}</small>}
            </div>

            {/* Nombres y Apellidos */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label htmlFor="nombres">Nombres *</label>
                <div className="input-wrapper">
                  <User size={15} />
                  <input
                    type="text"
                    id="nombres"
                    className={`form-control ${errors.nombres ? 'is-invalid' : ''}`}
                    placeholder="Juan"
                    value={formData.nombres}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>
                {errors.nombres && <small className="validation-feedback invalid" style={{ display: 'block' }}>{errors.nombres}</small>}
              </div>

              <div className="form-group">
                <label htmlFor="apellidos">Apellidos *</label>
                <div className="input-wrapper">
                  <User size={15} />
                  <input
                    type="text"
                    id="apellidos"
                    className={`form-control ${errors.apellidos ? 'is-invalid' : ''}`}
                    placeholder="Pérez"
                    value={formData.apellidos}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>
                {errors.apellidos && <small className="validation-feedback invalid" style={{ display: 'block' }}>{errors.apellidos}</small>}
              </div>
            </div>

            {/* Email */}
            <div className="form-group">
              <label htmlFor="email">Correo Electrónico *</label>
              <div className="input-wrapper">
                <Mail size={15} />
                <input
                  type="email"
                  id="email"
                  className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                  placeholder="juan.perez@correo.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
              {errors.email && <small className="validation-feedback invalid" style={{ display: 'block' }}>{errors.email}</small>}
            </div>

            {/* Contraseña */}
            <div className="form-group">
              <label htmlFor="password">Contraseña *</label>
              <div className="input-wrapper">
                <Lock size={15} />
                <input
                  type="password"
                  id="password"
                  className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                  placeholder="Mínimo 6 caracteres"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
              {errors.password && <small className="validation-feedback invalid" style={{ display: 'block' }}>{errors.password}</small>}
            </div>

            {/* Teléfono y Dirección */}
            <div className="form-group">
              <label htmlFor="telefono">Teléfono (Opcional)</label>
              <div className="input-wrapper">
                <Phone size={15} />
                <input
                  type="text"
                  id="telefono"
                  className="form-control"
                  placeholder="987654321"
                  value={formData.telefono}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="direccion">Dirección (Opcional)</label>
              <div className="input-wrapper">
                <MapPin size={15} />
                <input
                  type="text"
                  id="direccion"
                  className="form-control"
                  placeholder="Av. Las Flores 123"
                  value={formData.direccion}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
            </div>

            <button type="submit" className="btn-submit" disabled={isLoading} style={{ marginTop: '1.5rem' }}>
              {isLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <LoadingSpinner size={16} color="#fff" /> Creando cuenta...
                </div>
              ) : (
                'Registrarse'
              )}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>¿Ya tienes una cuenta? </span>
            <Link to="/login" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 'bold' }}>
              Inicia sesión aquí
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
