export const isValidDni = (dni) => {
  return /^\d{8}$/.test(dni);
};

export const isValidAsunto = (asunto) => {
  return typeof asunto === 'string' && asunto.trim().length >= 5;
};

export const isValidDescripcion = (desc) => {
  return typeof desc === 'string' && desc.trim().length >= 15;
};

export const validateTramiteForm = (values) => {
  const { dni, asunto, descripcion } = values;
  const errors = {};
  if (!isValidDni(dni)) errors.dni = 'El DNI debe tener exactamente 8 dígitos numéricos.';
  if (!isValidAsunto(asunto)) errors.asunto = 'El asunto debe tener al menos 5 caracteres.';
  if (!isValidDescripcion(descripcion)) errors.descripcion = 'La descripción debe tener al menos 15 caracteres.';
  return errors;
};
