/**
   * Valida si un texto es un correo electrónico válido.
   * @param {string} email 
   * @returns {boolean}
   */
const isValidEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida si un DNI es válido (exactamente 8 caracteres numéricos en el DNI peruano).
 * @param {string} dni 
 * @returns {boolean}
 */
const isValidDni = (dni) => {
  if (!dni) return false;
  const dniRegex = /^\d{8}$/;
  return dniRegex.test(dni);
};

/**
 * Verifica si todos los campos requeridos en un objeto tienen valor y no son espacios en blanco.
 * @param {object} body - req.body
 * @param {Array<string>} requiredFields - Lista de campos requeridos
 * @returns {{isValid: boolean, missingField: string|null}}
 */
const checkRequiredFields = (body, requiredFields) => {
  for (const field of requiredFields) {
    if (body[field] === undefined || body[field] === null) {
      return { isValid: false, missingField: field };
    }
    if (typeof body[field] === 'string' && body[field].trim() === '') {
      return { isValid: false, missingField: field };
    }
  }
  return { isValid: true, missingField: null };
};

module.exports = {
  isValidEmail,
  isValidDni,
  checkRequiredFields
};
