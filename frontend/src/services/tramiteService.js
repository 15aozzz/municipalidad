import apiClient from './apiClient';

export const getTramites = async (filters = {}) => {
  const queryParams = new URLSearchParams();
  if (filters.estado && filters.estado !== 'all') queryParams.append('estado', filters.estado);
  if (filters.prioridad && filters.prioridad !== 'all') queryParams.append('prioridad', filters.prioridad);
  if (filters.search) queryParams.append('search', filters.search);

  const response = await apiClient.get(`/tramites?${queryParams.toString()}`);
  return response.data;
};

export const createTramite = async (tramiteData) => {
  const response = await apiClient.post('/tramites', tramiteData);
  return response.data;
};

export const updateTramite = async (id, updateData) => {
  const response = await apiClient.patch(`/tramites/${id}`, updateData);
  return response.data;
};
