import { useContext } from 'react';
import { TramitesContext } from '../contexts/TramitesContext';

export const useTramites = () => {
  const context = useContext(TramitesContext);
  if (context === undefined) {
    throw new Error('useTramites debe ser usado dentro de un TramitesProvider');
  }
  return context;
};
