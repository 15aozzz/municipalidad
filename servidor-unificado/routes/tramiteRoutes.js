const express = require('express');
const router = express.Router();
const tramiteController = require('../controllers/tramiteController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

// Todas las rutas de trámites requieren autenticación con JWT
router.use(authenticateToken);

// Crear trámite (Ciudadano o Personal municipal)
router.post('/', tramiteController.createTramite);

// Listar trámites con filtros (Filtro por DNI automático si es ciudadano)
router.get('/', tramiteController.getTramites);

// Actualizar estado o asignación de trámite (Exclusivo Staff o Administradores)
router.patch('/:id', requireRole('staff', 'admin'), tramiteController.updateTramite);

module.exports = router;
