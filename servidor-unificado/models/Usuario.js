const db = require('../config/db');
const bcrypt = require('bcryptjs');

class Usuario {
  /**
   * Buscar un usuario por su correo electrónico.
   * @param {string} email 
   * @returns {Promise<object|null>}
   */
  static async findByEmail(email) {
    const [rows] = await db.execute('SELECT * FROM usuarios WHERE email = ? AND activo = TRUE', [email]);
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Buscar un usuario por su DNI.
   * @param {string} dni 
   * @returns {Promise<object|null>}
   */
  static async findByDni(dni) {
    const [rows] = await db.execute('SELECT * FROM usuarios WHERE dni = ? AND activo = TRUE', [dni]);
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Buscar un usuario por su ID único.
   * @param {number} id 
   * @returns {Promise<object|null>}
   */
  static async findById(id) {
    const [rows] = await db.execute(
      'SELECT id, dni, nombres, apellidos, email, rol, telefono, direccion, activo, fecha_registro FROM usuarios WHERE id = ? AND activo = TRUE',
      [id]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Listar todos los usuarios activos que tienen rol de 'staff'.
   * @returns {Promise<Array>}
   */
  static async findStaff() {
    const [rows] = await db.execute('SELECT id, nombres, apellidos, email, rol FROM usuarios WHERE rol = "staff" AND activo = TRUE');
    return rows;
  }

  /**
   * Registrar un nuevo usuario en la base de datos (con contraseña encriptada).
   * @param {object} userData
   * @param {string} userData.dni
   * @param {string} userData.nombres
   * @param {string} userData.apellidos
   * @param {string} userData.email
   * @param {string} userData.password
   * @param {string} [userData.rol] 'ciudadano' | 'staff'
   * @param {string} [userData.telefono]
   * @param {string} [userData.direccion]
   * @returns {Promise<number>} ID del usuario recién insertado.
   */
  static async create({ dni, nombres, apellidos, email, password, rol = 'ciudadano', telefono = null, direccion = null }) {
    // Generar hash de la contraseña usando bcryptjs antes de guardar
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const query = `
      INSERT INTO usuarios (dni, nombres, apellidos, email, password, rol, telefono, direccion) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [dni, nombres, apellidos, email, hashedPassword, rol, telefono, direccion];

    const [result] = await db.execute(query, params);
    return result.insertId;
  }
}

module.exports = Usuario;
