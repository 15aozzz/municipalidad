import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Mail, Lock, LogIn } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor, ingrese ambos campos.');
      return;
    }

    setIsLoading(true);
    setError('');

    const result = await login(email, password);
    
    if (result.success) {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser && (storedUser.rol === 'staff' || storedUser.rol === 'admin')) {
        navigate('/staff');
      } else {
        navigate('/dashboard');
      }
    } else {
      setError(result.message);
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '4rem auto', width: '100%' }}>
      <div className="card-glass">
        <div className="card-header" style={{ justifyContent: 'center' }}>
          <h3 className="card-title">
            <LogIn size={20} /> Acceso al Sistema
          </h3>
        </div>
        <div className="card-body">
          <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Ingrese sus credenciales institucionales o ciudadanas para continuar.
          </p>

          {error && (
            <div className="validation-feedback invalid" style={{ marginBottom: '1rem', padding: '0.5rem', backgroundColor: 'var(--color-danger-bg)', borderRadius: '6px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Correo Electrónico</label>
              <div className="input-wrapper">
                <Mail size={15} />
                <input 
                  type="email" 
                  id="email" 
                  className="form-control" 
                  placeholder="usuario@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <div className="input-wrapper">
                <Lock size={15} />
                <input 
                  type="password" 
                  id="password" 
                  className="form-control" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <button type="submit" className="btn-submit" disabled={isLoading} style={{ marginTop: '2rem' }}>
              {isLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <LoadingSpinner size={16} color="#fff" /> Verificando...
                </div>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>¿No tienes una cuenta? </span>
            <Link to="/register" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 'bold' }}>
              Regístrate aquí
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
