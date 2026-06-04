const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

// Inicializar la aplicación Express
const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares Globales
app.use(cors()); // Habilitar CORS para conectar con el frontend en React
app.use(morgan('dev')); // Logger para registrar peticiones HTTP en consola durante desarrollo
app.use(express.json()); // Analizador de formato JSON para req.body
app.use(express.urlencoded({ extended: true }));

// Rutas de Verificación Inicial
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Sistema de Trámites Municipales - Municipalidad de La Victoria API activa 🏛️',
    version: '1.0.0',
    timestamp: new Date()
  });
});

// Importar Enrutadores
const authRoutes = require('./routes/authRoutes');
const tramiteRoutes = require('./routes/tramiteRoutes');

// Montar Rutas del API
app.use('/api/auth', authRoutes);
app.use('/api/tramites', tramiteRoutes);

// Manejador para Rutas no Encontradas (404)
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `La ruta solicitada [${req.method}] ${req.originalUrl} no existe en este servidor.`
  });
});

// Centralizador Global de Manejo de Errores (500)
app.use((err, req, res, next) => {
  console.error('❌ Error Crítico Capturado en el Servidor:', err);
  
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Ocurrió un error inesperado e interno en el servidor.',
    error: process.env.NODE_ENV === 'development' ? err.stack : {}
  });
});

// Levantar el Servidor Express
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Servidor corriendo en puerto: http://localhost:${PORT}`);
  console.log(`📂 Entorno activo: ${process.env.NODE_ENV || 'development'}`);
  console.log(`=======================================================`);
});
