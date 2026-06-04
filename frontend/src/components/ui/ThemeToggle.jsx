import React, { useContext } from 'react';
import { ThemeContext } from '../../contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <button 
      className="theme-toggle" 
      onClick={toggleTheme}
      title="Cambiar Tema Visual"
      aria-label="Cambiar Tema Visual"
    >
      {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
    </button>
  );
};

export default ThemeToggle;
