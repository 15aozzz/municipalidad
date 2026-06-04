const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuración del Pool de conexiones
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'municipalidad_la_victoria',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Comprobar la conexión al iniciar el servidor
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conexión exitosa a la base de datos MySQL en XAMPP.');
    connection.release();
  } catch (error) {
    console.error('❌ Error al conectar a la base de datos MySQL:');
    console.error(`Asegúrate de que XAMPP esté iniciado y que la base de datos "${process.env.DB_NAME || 'municipalidad_la_victoria'}" exista.`);
    console.error(error.message);
  }
};

testConnection();

module.exports = pool;
