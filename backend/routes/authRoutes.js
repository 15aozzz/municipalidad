const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Ruta para iniciar sesión (Pública)
router.post('/login', authController.login);

// Ruta para registrar un ciudadano (Pública)
router.post('/register', authController.register);

// Ruta para obtener la lista de personal municipal (Protegida)
router.get('/staff', authenticateToken, authController.getStaff);

module.exports = router;
