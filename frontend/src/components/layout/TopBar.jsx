import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const TopBar = () => {
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('es-PE', {
        timeZone: 'America/Lima',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      }));
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="top-bar-gov">
      <div className="top-bar-container">
        <div className="top-bar-left">
          <Clock size={12} />
          <span>Hora local en Lima: </span><strong>{time || 'Cargando...'}</strong>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
