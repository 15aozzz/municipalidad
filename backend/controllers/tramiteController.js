const Tramite = require('../models/Tramite');
const ClasificacionService = require('../services/clasificacionService');
const { checkRequiredFields, isValidDni } = require('../utils/validators');

/**
 * Registrar un nuevo trámite municipal (Ciudadanos y Staff).
 */
const createTramite = async (req, res) => {
  const { asunto, descripcion } = req.body;
  let { dni } = req.body;

  try {
    // 1. Validar campos requeridos
    const validation = checkRequiredFields(req.body, ['asunto', 'descripcion']);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: `El campo "${validation.missingField}" es obligatorio.`
      });
    }

    // 2. Definir DNI y UsuarioID de forma inteligente según el Rol
    let usuario_id = req.user.id;

    if (req.user.rol === 'ciudadano') {
      // Para ciudadanos, forzar su propio DNI del Token JWT
      dni = req.user.dni;
    } else {
      // Para Staff/Admin, pueden crear un trámite para un ciudadano proporcionando su DNI
      if (!dni) {
        dni = req.user.dni; // Si no lo envían, se usa el suyo por defecto
      }
      if (!isValidDni(dni)) {
        return res.status(400).json({
          success: false,
          message: 'El DNI del solicitante debe tener exactamente 8 caracteres numéricos.'
        });
      }
      // Buscar si el DNI enviado corresponde a algún usuario registrado en la BD para vincularlo
      const Usuario = require('../models/Usuario');
      const solicitante = await Usuario.findByDni(dni);
      if (solicitante) {
        usuario_id = solicitante.id;
      } else {
        usuario_id = null; // Trámite de ciudadano no registrado previamente
      }
    }

    // 3. Llamar al servicio de Google Colab para clasificar
    let clasificacion;
    try {
      clasificacion = await ClasificacionService.clasificar(asunto, descripcion);
    } catch (colabError) {
      // Cumpliendo instrucción del usuario: "si no responde se dice que intente luego y ya. simplemente no se guarda nada"
      console.error('❌ Abortando guardado del trámite debido a fallo en servicio de IA:', colabError.message);
      return res.status(503).json({
        success: false,
        message: 'El servicio de clasificación automática no responde en este momento. Por favor, intente nuevamente más tarde.'
      });
    }

    const { prioridad, certeza, accion_sugerida } = clasificacion;

    // 4. Guardar en la base de datos MySQL a través del pool
    const newTramiteId = await Tramite.create({
      usuario_id,
      dni,
      asunto,
      descripcion,
      prioridad,
      certeza,
      accion_sugerida
    });

    // 5. Devolver respuesta exitosa con los datos del trámite y su clasificación
      return res.status(201).json({
        success: true,
        message: 'Trámite registrado e indexado por IA de forma exitosa.',
        data: {
          id: newTramiteId,
          dni,
          asunto,
          descripcion,
          prioridad,
          certeza,
          accion_sugerida,
          estado: 'pendiente',
          fecha_creacion: new Date().toISOString()
        }
      });

  } catch (error) {
    console.error('❌ Error al crear el trámite:', error);
    return res.status(500).json({
      success: false,
      message: 'Ocurrió un error interno en el servidor al intentar registrar el trámite.'
    });
  }
};

/**
 * Listar trámites con filtros avanzados (Rol-based).
 */
const getTramites = async (req, res) => {
  const { estado, prioridad, search } = req.query;

  try {
    // El modelo maneja internamente las restricciones de rol (Ciudadano vs Staff)
    const tramites = await Tramite.findAll({ estado, prioridad, search }, req.user);

    return res.status(200).json({
      success: true,
      message: `Se recuperaron ${tramites.length} trámites exitosamente.`,
      data: tramites
    });

  } catch (error) {
    console.error('❌ Error al listar trámites:', error);
    return res.status(500).json({
      success: false,
      message: 'Ocurrió un error en el servidor al intentar recuperar la lista de trámites.'
    });
  }
};

/**
 * Actualizar estado y asignación de un trámite (Exclusivo Staff/Admin).
 */
const updateTramite = async (req, res) => {
  const { id } = req.params;
  const { estado, asignado_a } = req.body;

  try {
    // 1. Validar que al menos se envíe un campo a actualizar
    if (estado === undefined && asignado_a === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Debe proporcionar al menos un campo a actualizar ("estado" o "asignado_a").'
      });
    }

    // 2. Validar que el estado sea válido si se proporciona
    if (estado && !['pendiente', 'en_proceso', 'atendido', 'rechazado'].includes(estado)) {
      return res.status(400).json({
        success: false,
        message: 'El estado proporcionado no es válido. Debe ser "pendiente", "en_proceso", "atendido" o "rechazado".'
      });
    }

    // 3. Ejecutar la actualización en MySQL
    const isUpdated = await Tramite.update(id, { estado, asignado_a });

    if (!isUpdated) {
      return res.status(404).json({
        success: false,
        message: 'No se encontró el trámite especificado o no se realizaron cambios.'
      });
    }

    // 4. Obtener el trámite actualizado para devolver los detalles nuevos
    const tramiteActualizado = await Tramite.findById(id);

    return res.status(200).json({
      success: true,
      message: 'Trámite actualizado correctamente.',
      data: tramiteActualizado
    });

  } catch (error) {
    console.error('❌ Error al actualizar el trámite:', error);
    
    // Controlar errores de clave foránea si se asigna un ID de usuario inexistente
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({
        success: false,
        message: 'El ID de usuario especificado en "asignado_a" no existe en el sistema.'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Ocurrió un error en el servidor al intentar actualizar el trámite.'
    });
  }
};

module.exports = {
  createTramite,
  getTramites,
  updateTramite
};
