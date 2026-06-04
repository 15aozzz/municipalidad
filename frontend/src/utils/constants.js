export const ROLES = {
  CIUDADANO: 'ciudadano',
  STAFF: 'staff',
  ADMIN: 'admin'
};

export const ESTADOS_TRAMITE = {
  PENDIENTE: 'pendiente',
  EN_PROCESO: 'en_proceso',
  ATENDIDO: 'atendido',
  RECHAZADO: 'rechazado'
};

export const PRIORIDADES = {
  ALTA: 'Alta',
  MEDIA: 'Media',
  BAJA: 'Baja'
};

export const ESTADOS_LABELS = {
  [ESTADOS_TRAMITE.PENDIENTE]: 'Pendiente',
  [ESTADOS_TRAMITE.EN_PROCESO]: 'En Proceso',
  [ESTADOS_TRAMITE.ATENDIDO]: 'Atendido',
  [ESTADOS_TRAMITE.RECHAZADO]: 'Rechazado'
};
