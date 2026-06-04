import React, { useContext } from 'react';
import { NotificationContext } from '../../contexts/NotificationContext';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

const ToastNotification = () => {
  const { toasts, removeToast } = useContext(NotificationContext);

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => {
        const isError = toast.type === 'error' || toast.type === 'danger';
        const isSuccess = toast.type === 'success';
        
        let Icon = Info;
        let iconClass = '';
        if (isError) {
          Icon = AlertCircle;
          iconClass = 'toast-icon'; // Animación de pulso rojo del css
        } else if (isSuccess) {
          Icon = CheckCircle;
        }

        return (
          <div 
            key={toast.id} 
            className="toast-alert" 
            style={{ 
              borderLeftColor: isError ? 'var(--color-danger)' : (isSuccess ? 'var(--color-success)' : 'var(--primary-color)'),
              boxShadow: isError ? 'var(--shadow-lg), 0 0 25px rgba(239, 68, 68, 0.12)' : 'var(--shadow-lg)'
            }}
          >
            <div className={iconClass} style={{ 
              backgroundColor: isError ? 'var(--color-danger-bg)' : (isSuccess ? 'var(--color-success-bg)' : 'var(--bg-tertiary)'),
              color: isError ? 'var(--color-danger)' : (isSuccess ? 'var(--color-success)' : 'var(--primary-color)')
            }}>
              <Icon size={18} />
            </div>
            
            <div className="toast-content">
              <div className="toast-header">
                <span className="toast-title">{toast.title}</span>
                <span className="toast-time">Ahora</span>
              </div>
              <div className="toast-message">{toast.message}</div>
            </div>
            
            <button className="toast-close" onClick={() => removeToast(toast.id)}>
              <X size={14} />
            </button>
            
            {toast.duration > 0 && (
              <div className="toast-progress">
                <div 
                  className="toast-progress-bar" 
                  style={{ 
                    animationDuration: `${toast.duration}ms`,
                    backgroundColor: isError ? 'var(--color-danger)' : (isSuccess ? 'var(--color-success)' : 'var(--primary-color)')
                  }} 
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ToastNotification;
