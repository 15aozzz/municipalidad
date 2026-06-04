const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'super_secreto_clave_municipalidad_la_victoria_2026_valida';

/**
 * Middleware para verificar la validez del token JWT.
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    
    // El token suele venir en formato 'Bearer <token>'
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Acceso no autorizado: Token de autenticación ausente.'
      });
    }

    // Verificar firma del token
    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
      if (err) {
        let errorMsg = 'Token de autenticación inválido o expirado.';
        if (err.name === 'TokenExpiredError') {
          errorMsg = 'Su sesión ha expirado. Inicie sesión nuevamente.';
        }
        return res.status(403).json({
          success: false,
          message: errorMsg
        });
      }

      // Buscar al usuario en la base de datos para confirmar que sigue activo
      const user = await Usuario.findById(decoded.id);

      if (!user) {
        return res.status(403).json({
          success: false,
          message: 'El usuario asociado a este token ya no está activo o no existe.'
        });
      }

      // Adjuntar el usuario al objeto request
      req.user = {
        id: user.id,
        dni: user.dni,
        nombres: user.nombres,
        apellidos: user.apellidos,
        email: user.email,
        rol: user.rol
      };

      next();
    });
  } catch (error) {
    console.error('❌ Error en el middleware de autenticación:', error);
    return res.status(500).json({
      success: false,
      message: 'Ocurrió un error interno al verificar las credenciales de acceso.'
    });
  }
};

/**
 * Middleware para exigir roles específicos.
 * @param {...string} roles - Roles permitidos para acceder (ej: 'staff', 'admin')
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No autenticado.'
      });
    }

    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({
        success: false,
        message: `Acceso denegado: Su rol de "${req.user.rol}" no tiene permisos para realizar esta acción.`
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  requireRole
};
