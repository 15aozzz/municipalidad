import React from 'react';

const LoadingSpinner = ({ size = 24, color = 'var(--primary-color)' }) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
      <div 
        style={{
          width: size,
          height: size,
          border: '3px solid rgba(0, 0, 0, 0.1)',
          borderTopColor: color,
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }}
      />
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default LoadingSpinner;
