const Tramite = require('../models/Tramite');
const ClasificacionService = require('../services/clasificacionService');
const EmailService = require('../services/emailService');
const { checkRequiredFields, isValidDni } = require('../utils/validators');

// Helper para determinar DNI y Usuario del solicitante
const resolverSolicitante = async (req, dni) => {
  if (req.user.rol === 'ciudadano') {
    return { id: req.user.id, dni: req.user.dni };
  }
  if (dni && !isValidDni(dni)) throw new Error('DNI_INVALIDO');
  
  const Usuario = require('../models/Usuario');
  const solicitante = await Usuario.findByDni(dni || req.user.dni);
  return { 
    id: solicitante ? solicitante.id : null, 
    dni: dni || req.user.dni 
  };
};

const createTramite = async (req, res) => {
  const { asunto, descripcion, dni } = req.body;

  try {
    const val = checkRequiredFields(req.body, ['asunto', 'descripcion']);
    if (!val.isValid) return res.status(400).json({ success: false, message: `El campo "${val.missingField}" es obligatorio.` });

    // Resolver solicitante según rol
    let solicitante;
    try {
      solicitante = await resolverSolicitante(req, dni);
    } catch (err) {
      return res.status(400).json({ success: false, message: 'El DNI debe tener exactamente 8 caracteres numéricos.' });
    }

    // Clasificación con el modelo de IA en Google Colab
    let clasif;
    try {
      clasif = await ClasificacionService.clasificar(asunto, descripcion);
    } catch (colabError) {
      return res.status(503).json({
        success: false,
        message: 'El servicio de clasificación por IA no responde. Intente más tarde.'
      });
    }

    const id = await Tramite.create({
      usuario_id: solicitante.id,
      dni: solicitante.dni,
      asunto,
      descripcion,
      ...clasif
    });

    // Enviar correo de confirmación de forma asíncrona
    Tramite.findById(id)
      .then((newTramite) => {
        if (newTramite && newTramite.solicitante_email) {
          EmailService.sendTramiteReceived(
            newTramite.solicitante_email,
            newTramite.solicitante,
            newTramite.id,
            newTramite.asunto,
            newTramite.prioridad
          ).catch(err => console.error('Error al enviar correo de recepción:', err));
        }
      })
      .catch(err => console.error('Error al recuperar datos del trámite para el correo:', err));

    return res.status(201).json({
      success: true,
      message: 'Trámite registrado e indexado por IA de forma exitosa.',
      data: { id, dni: solicitante.dni, asunto, descripcion, ...clasif, estado: 'pendiente', fecha_creacion: new Date() }
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Error interno en el servidor.' });
  }
};

const getTramites = async (req, res) => {
  try {
    const tramites = await Tramite.findAll(req.query, req.user);
    return res.status(200).json({ success: true, count: tramites.length, data: tramites });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Error interno en el servidor.' });
  }
};

const updateTramite = async (req, res) => {
  const { id } = req.params;
  const { estado, asignado_a, observaciones } = req.body;

  if (estado === undefined && asignado_a === undefined) {
    return res.status(400).json({ success: false, message: 'Debe enviar "estado" o "asignado_a".' });
  }

  if (estado && !['pendiente', 'en_proceso', 'atendido', 'rechazado'].includes(estado)) {
    return res.status(400).json({ success: false, message: 'Estado inválido.' });
  }

  try {
    const updated = await Tramite.update(id, { estado, asignado_a });
    if (!updated) return res.status(404).json({ success: false, message: 'Trámite no encontrado o sin cambios.' });

    const tramite = await Tramite.findById(id);

    // Enviar notificación de correo electrónico al ciudadano
    if (tramite && tramite.solicitante_email) {
      EmailService.sendTramiteStatusUpdated(
        tramite.solicitante_email,
        tramite.solicitante,
        tramite.id,
        tramite.asunto,
        tramite.estado,
        observaciones || ''
      ).catch(err => console.error('Error al enviar correo de actualización de estado:', err));
    }

    return res.status(200).json({ success: true, message: 'Trámite actualizado.', data: tramite });
  } catch (error) {
    console.error(error);
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ success: false, message: 'El ID de personal asignado no existe.' });
    }
    return res.status(500).json({ success: false, message: 'Error interno en el servidor.' });
  }
};

const getPublicTramite = async (req, res) => {
  const { id, dni } = req.params;

  if (!id || !dni) {
    return res.status(400).json({ success: false, message: 'Debe proporcionar el ID del trámite y el DNI.' });
  }

  try {
    const tramite = await Tramite.findById(id);
    if (!tramite) {
      return res.status(404).json({ success: false, message: 'Trámite no encontrado.' });
    }

    // Validar que el DNI coincida
    if (tramite.dni !== dni) {
      return res.status(403).json({ success: false, message: 'El DNI no coincide con el solicitante del trámite.' });
    }

    // Retornar información segura y pública
    return res.status(200).json({
      success: true,
      data: {
        id: tramite.id,
        asunto: tramite.asunto,
        prioridad: tramite.prioridad,
        estado: tramite.estado,
        solicitante: tramite.solicitante,
        fecha_creacion: tramite.fecha_creacion,
        fecha_modificacion: tramite.fecha_modificacion,
        asignado_nombre: tramite.asignado_nombre || 'Sin asignar'
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Error interno en el servidor.' });
  }
};

module.exports = { createTramite, getTramites, updateTramite, getPublicTramite };


