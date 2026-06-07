const db = require('../config/db');

class Tramite {
  /**
   * Crear un nuevo trámite.
   * @param {object} data
   * @param {number|null} data.usuario_id - ID del usuario logueado (si está registrado)
   * @param {string} data.dni - DNI del solicitante
   * @param {string} data.asunto
   * @param {string} data.descripcion
   * @param {string} data.prioridad - 'Alta' | 'Media' | 'Baja' (devuelto por Colab)
   * @param {number} data.certeza - Confianza del modelo DECIMAL(5,2) (ej: 95.40)
   * @param {string} data.accion_sugerida - Acción recomendada (devuelto por Colab)
   * @returns {Promise<number>} ID del trámite creado.
   */
  static async create({ usuario_id, dni, asunto, descripcion, prioridad, certeza, accion_sugerida }) {
    const query = `
      INSERT INTO tramites (usuario_id, dni, asunto, descripcion, prioridad, certeza, accion_sugerida, estado)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pendiente')
    `;
    const params = [usuario_id || null, dni, asunto, descripcion, prioridad, certeza, accion_sugerida];
    const [result] = await db.execute(query, params);
    return result.insertId;
  }

  /**
   * Buscar un trámite específico por su ID con datos relacionados del solicitante y staff asignado.
   * @param {number} id 
   * @returns {Promise<object|null>}
   */
  static async findById(id) {
    const query = `
      SELECT 
        t.*,
        COALESCE(CONCAT(u.nombres, ' ', u.apellidos), 'No registrado') AS solicitante,
        u.email AS solicitante_email,
        CONCAT(staff.nombres, ' ', staff.apellidos) AS asignado_nombre
      FROM tramites t
      LEFT JOIN usuarios u ON t.usuario_id = u.id
      LEFT JOIN usuarios staff ON t.asignado_a = staff.id
      WHERE t.id = ?
    `;
    const [rows] = await db.execute(query, [id]);
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Listar trámites aplicando filtros de rol y query params.
   * @param {object} filtros
   * @param {string} [filtros.estado] - Filtro por estado ('pendiente', 'en_proceso', 'atendido', 'rechazado')
   * @param {string} [filtros.prioridad] - Filtro por prioridad ('Alta', 'Media', 'Baja')
   * @param {string} [filtros.search] - Texto para buscar por DNI o asunto
   * @param {object} usuario - Datos del usuario que realiza la consulta para control de acceso (req.user)
   * @param {string} usuario.rol - 'ciudadano' | 'staff' | 'admin'
   * @param {string} usuario.dni - DNI del usuario (para ciudadanos)
   * @returns {Promise<Array>} Lista de trámites.
   */
  static async findAll({ estado, prioridad, search }, usuario) {
    let sql = `
      SELECT 
        t.*,
        COALESCE(CONCAT(u.nombres, ' ', u.apellidos), 'No registrado') AS solicitante,
        COALESCE(CONCAT(staff.nombres, ' ', staff.apellidos), 'Sin asignar') AS asignado_nombre
      FROM tramites t
      LEFT JOIN usuarios u ON t.usuario_id = u.id
      LEFT JOIN usuarios staff ON t.asignado_a = staff.id
    `;
    
    const conditions = [];
    const params = [];

    // Control de Acceso: El ciudadano solo puede ver sus propios trámites basados en su DNI
    if (usuario.rol === 'ciudadano') {
      conditions.push('t.dni = ?');
      params.push(usuario.dni);
    }

    // Filtro opcional por estado
    if (estado) {
      conditions.push('t.estado = ?');
      params.push(estado);
    }

    // Filtro opcional por prioridad
    if (prioridad) {
      conditions.push('t.prioridad = ?');
      params.push(prioridad);
    }

    // Filtro opcional de búsqueda por DNI o Asunto
    if (search) {
      conditions.push('(t.dni LIKE ? OR t.asunto LIKE ?)');
      const searchWildcard = `%${search}%`;
      params.push(searchWildcard, searchWildcard);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    // Ordenar por fecha de creación descendente (los más nuevos primero)
    sql += ' ORDER BY t.fecha_creacion DESC';

    const [rows] = await db.execute(sql, params);
    return rows;
  }

  /**
   * Actualizar estado y asignación de un trámite (Exclusivo para staff/admin).
   * @param {number} id - ID del trámite
   * @param {object} updates
   * @param {string} [updates.estado] - 'pendiente' | 'en_proceso' | 'atendido' | 'rechazado'
   * @param {number|null} [updates.asignado_a] - ID del miembro del personal asignado
   * @returns {Promise<boolean>} Retorna true si se actualizó algún registro.
   */
  static async update(id, { estado, asignado_a }) {
    const updates = [];
    const params = [];

    if (estado !== undefined) {
      updates.push('estado = ?');
      params.push(estado);
    }

    if (asignado_a !== undefined) {
      updates.push('asignado_a = ?');
      params.push(asignado_a);
    }

    if (updates.length === 0) return false;

    params.push(id);
    const sql = `UPDATE tramites SET ${updates.join(', ')} WHERE id = ?`;

    const [result] = await db.execute(sql, params);
    return result.affectedRows > 0;
  }
}

module.exports = Tramite;
