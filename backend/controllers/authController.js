const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Usuario = require('../models/Usuario');
const { isValidEmail, isValidDni, checkRequiredFields } = require('../utils/validators');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'super_secreto_clave_municipalidad_yau_2026_valida';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';

/**
 * Iniciar sesión de usuario (Login).
 */
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Validar campos requeridos
    const validation = checkRequiredFields(req.body, ['email', 'password']);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: `El campo "${validation.missingField}" es obligatorio.`
      });
    }

    // 2. Buscar al usuario por correo electrónico
    const user = await Usuario.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Las credenciales proporcionadas son incorrectas.'
      });
    }

    // 3. Autenticación híbrida (Bcrypt y Texto Plano de contingencia)
    let isPasswordValid = false;

    try {
      // Intentar comparar con hash bcrypt primero
      isPasswordValid = await bcrypt.compare(password, user.password);
    } catch (bcryptError) {
      console.warn('⚠️ Falló la validación bcrypt, recurriendo a comparación de texto plano:', bcryptError.message);
    }

    // Si bcrypt no coincide, validar si está en texto plano (para datos de prueba de script.sql)
    if (!isPasswordValid) {
      isPasswordValid = (password === user.password);
    }

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Las credenciales proporcionadas son incorrectas.'
      });
    }

    // 4. Firmar el Token JWT con el ID del usuario
    const token = jwt.sign(
      { id: user.id, rol: user.rol, dni: user.dni },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // 5. Responder de forma consistente
    return res.status(200).json({
      success: true,
      message: 'Inicio de sesión exitoso.',
      data: {
        token,
        usuario: {
          id: user.id,
          dni: user.dni,
          nombres: user.nombres,
          apellidos: user.apellidos,
          email: user.email,
          rol: user.rol
        }
      }
    });

  } catch (error) {
    console.error('❌ Error en el proceso de login:', error);
    return res.status(500).json({
      success: false,
      message: 'Ocurrió un error en el servidor al intentar iniciar sesión.'
    });
  }
};

/**
 * Registrar un nuevo Ciudadano (o Staff si es creado por Admin).
 */
const register = async (req, res) => {
  const { dni, nombres, apellidos, email, password, rol = 'ciudadano', telefono = null, direccion = null } = req.body;

  try {
    // 1. Validar campos obligatorios
    const requiredFields = ['dni', 'nombres', 'apellidos', 'email', 'password'];
    const validation = checkRequiredFields(req.body, requiredFields);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: `El campo "${validation.missingField}" es obligatorio.`
      });
    }

    // 2. Validar formatos
    if (!isValidDni(dni)) {
      return res.status(400).json({
        success: false,
        message: 'El DNI debe tener exactamente 8 caracteres numéricos.'
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'El correo electrónico no tiene un formato válido.'
      });
    }

    // Restringir la creación de cuentas "staff" o "admin" a usuarios anónimos
    if (rol !== 'ciudadano') {
      return res.status(403).json({
        success: false,
        message: 'No está autorizado para registrar cuentas de personal o administración directamente.'
      });
    }

    // 3. Verificar si el DNI o Email ya se encuentran registrados
    const existingDni = await Usuario.findByDni(dni);
    if (existingDni) {
      return res.status(400).json({
        success: false,
        message: 'El DNI ya se encuentra registrado en el sistema.'
      });
    }

    const existingEmail = await Usuario.findByEmail(email);
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'El correo electrónico ya se encuentra registrado en el sistema.'
      });
    }

    // 4. Crear el usuario en la BD (el modelo se encargará de encriptar el password con bcryptjs)
    const newUserId = await Usuario.create({
      dni,
      nombres,
      apellidos,
      email,
      password,
      rol,
      telefono,
      direccion
    });

    // 5. Responder
    return res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente.',
      data: {
        id: newUserId,
        dni,
        nombres,
        apellidos,
        email,
        rol
      }
    });

  } catch (error) {
    console.error('❌ Error en el registro de usuario:', error);
    return res.status(500).json({
      success: false,
      message: 'Ocurrió un error interno en el servidor al procesar el registro.'
    });
  }
};

/**
 * Listar todos los miembros del personal (staff).
 */
const getStaff = async (req, res) => {
  try {
    const staffMembers = await Usuario.findStaff();
    return res.status(200).json({
      success: true,
      message: 'Personal obtenido exitosamente.',
      data: staffMembers
    });
  } catch (error) {
    console.error('❌ Error al obtener el listado de staff:', error);
    return res.status(500).json({
      success: false,
      message: 'Ocurrió un error en el servidor al intentar recuperar el listado del personal.'
    });
  }
};

module.exports = {
  login,
  register,
  getStaff
};
