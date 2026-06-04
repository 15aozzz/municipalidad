import React, { createContext, useState, useCallback, useContext } from 'react';
import * as tramiteService from '../services/tramiteService';
import { AuthContext } from './AuthContext';

export const TramitesContext = createContext();

export const TramitesProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [tramites, setTramites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTramites = useCallback(async (filters = {}) => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await tramiteService.getTramites(filters);
      if (data.success) {
        setTramites(data.data || []);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Error de conexión al cargar trámites');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const addTramite = async (tramiteData) => {
    try {
      const data = await tramiteService.createTramite(tramiteData);
      if (data.success) {
        setTramites((prev) => [data.data, ...prev]);
        return { success: true, data: data.data };
      }
      return { success: false, message: data.message };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Error al conectar con la IA de clasificación'
      };
    }
  };

  const editTramite = async (id, updateData) => {
    try {
      const data = await tramiteService.updateTramite(id, updateData);
      if (data.success) {
        setTramites((prev) =>
          prev.map((t) => (t.id === id ? { ...t, ...data.data } : t))
        );
        return { success: true, data: data.data };
      }
      return { success: false, message: data.message };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Error al actualizar el trámite'
      };
    }
  };

  return (
    <TramitesContext.Provider
      value={{ tramites, loading, error, fetchTramites, addTramite, editTramite }}
    >
      {children}
    </TramitesContext.Provider>
  );
};
