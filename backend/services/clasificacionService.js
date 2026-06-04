const axios = require('axios');
require('dotenv').config();

class ClasificacionService {
  /**
   * Llama al modelo de Machine Learning en Google Colab para clasificar el trámite.
   * @param {string} asunto - Asunto del trámite
   * @param {string} descripcion - Descripción detallada del trámite
   * @returns {Promise<object>} { prioridad, certeza, accion_sugerida }
   * @throws {Error} Si el servicio no responde o falla.
   */
  static async clasificar(asunto, descripcion) {
    const colabUrl = process.env.COLAB_URL;

    if (!colabUrl || colabUrl.includes('xxxx.ngrok.io')) {
      console.warn('⚠️ Advertencia: COLAB_URL no está configurada correctamente en el archivo .env.');
    }

    const textoCompleto = `Asunto: ${asunto}\nDescripción: ${descripcion}`;

    try {
      console.log(`🧠 Enviando texto a clasificar a Google Colab (${colabUrl})...`);
      
      // Realizar petición POST con un timeout estricto de 5 segundos
      const response = await axios.post(colabUrl, {
        texto: textoCompleto,
        asunto: asunto,
        descripcion: descripcion
      }, {
        headers: { 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        timeout: 5000 
      });

      if (!response.data || typeof response.data !== 'object') {
        throw new Error('Respuesta de Colab vacía o no es un JSON válido (posible advertencia de ngrok).');
      }

      console.log('✅ Clasificación recibida con éxito desde Colab:', response.data);

      // Mapear de forma inteligente múltiples nombres posibles de campos para máxima compatibilidad
      let prioridad = response.data.prioridad || response.data.prioridad_asignada || response.data.priority || 'Media';
      let certeza = response.data.confianza || response.data.porcentaje_confiabilidad || response.data.certeza || response.data.confidence || 0.00;
      let accion_sugerida = response.data.accion_sugerida || response.data.accion || response.data.action || '';

      if (typeof certeza === 'string') {
        certeza = certeza.replace(',', '.').replace('%', '');
      }

      // Normalizar la prioridad para que empiece con mayúscula (Alta, Media, Baja) como está en el ENUM de la BD
      prioridad = prioridad.charAt(0).toUpperCase() + prioridad.slice(1).toLowerCase();
      if (!['Alta', 'Media', 'Baja'].includes(prioridad)) {
        prioridad = 'Media';
      }

      // Convertir certeza de formato decimal (ej: 0.95) a porcentaje (ej: 95.00) si es menor o igual a 1
      certeza = parseFloat(certeza);
      if (isNaN(certeza)) {
        certeza = 0.00;
      } else if (certeza > 0 && certeza <= 1.0) {
        certeza = (certeza * 100).toFixed(2);
      } else {
        certeza = certeza.toFixed(2);
      }

      return {
        prioridad,
        certeza: parseFloat(certeza),
        accion_sugerida: accion_sugerida.substring(0, 255) // Validar tamaño máximo VARCHAR(255)
      };

    } catch (error) {
      console.error('❌ Error al llamar al servicio de clasificación de Google Colab:', error.message);
      // Arrojar el error para que sea capturado en el controlador del Trámite e impida guardar en BD
      throw new Error('Servicio de clasificación por IA no disponible temporalmente.');
    }
  }
}

module.exports = ClasificacionService;
