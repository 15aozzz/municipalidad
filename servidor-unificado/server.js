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
const path = require('path');

// Montar Rutas del API
app.use('/api/auth', authRoutes);
app.use('/api/tramites', tramiteRoutes);

// Servir archivos estáticos del Frontend React compilado
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Cualquier petición GET que no coincida con las rutas de la API es redirigida al frontend (React Router)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// Manejador para Rutas no Encontradas del API (404)
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
  console.log(`🚀 Servidor Unificado corriendo en: http://localhost:${PORT}`);
  console.log(`📂 Entorno activo: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🖥️ Sirviendo Frontend desde: ../frontend/dist`);
  console.log(`=======================================================`);
});

