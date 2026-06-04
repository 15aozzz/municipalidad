import React, { useContext } from 'react';
import { Bot, LogOut, User } from 'lucide-react';
import { AuthContext } from '../../contexts/AuthContext';
import ThemeToggle from '../ui/ThemeToggle';

const SubNavbar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="sub-navbar-gov">
      <div className="sub-navbar-container">
        <div className="nav-links">
          <span className="nav-link active" style={{ cursor: 'default' }}><Bot size={14} /> Trámites IA</span>
        </div>
        
        <div className="nav-actions">
          <ThemeToggle />
          
          {user && (
            <>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '0.5rem' }}>
                <User size={14} /> {user.nombres} ({user.rol})
              </span>
              <button 
                onClick={logout}
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  color: '#fff',
                  padding: '0.35rem 0.65rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  marginLeft: '0.5rem'
                }}
              >
                <LogOut size={12} /> Salir
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default SubNavbar;
