const nodemailer = require('nodemailer');
require('dotenv').config();

let transporter;

const getTransporter = async () => {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = parseInt(process.env.SMTP_PORT) || 587;

  if (host && user && pass) {
    // Usar credenciales reales configuradas
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });
    console.log('✉️ Servicio de correo configurado con credenciales SMTP personalizadas.');
  } else {
    // Modo de desarrollo: usar Ethereal Mail
    try {
      console.log('✉️ Creando cuenta de correo de prueba (Ethereal Mail)...');
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      console.log('✉️ Cuenta de correo de prueba creada con éxito.');
      console.log(`✉️ Usuario de prueba: ${testAccount.user}`);
    } catch (error) {
      console.warn('⚠️ No se pudo inicializar Ethereal Mail. Los correos se imprimirán en consola:', error.message);
      // Fallback a consola
      transporter = {
        sendMail: async (mailOptions) => {
          console.log('\n--- ✉️ SIMULACIÓN DE CORREO ENVIADO ---');
          console.log(`De: ${mailOptions.from}`);
          console.log(`Para: ${mailOptions.to}`);
          console.log(`Asunto: ${mailOptions.subject}`);
          console.log('Contenido (HTML):');
          console.log(mailOptions.html);
          console.log('---------------------------------------\n');
          return { messageId: 'simulated-id', testUrl: null };
        }
      };
    }
  }
  return transporter;
};

const sendEmail = async (to, subject, html) => {
  if (!to) {
    console.warn('⚠️ No se pudo enviar el correo: no se especificó la dirección del destinatario.');
    return;
  }
  try {
    const activeTransporter = await getTransporter();
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Mesa de Partes Virtual" <no-reply@municipalidad.gob.pe>',
      to,
      subject,
      html
    };

    const info = await activeTransporter.sendMail(mailOptions);
    console.log(`✉️ Correo enviado a ${to}. ID: ${info.messageId}`);
    
    // Si es Ethereal, mostrar el link para previsualizar el correo
    try {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log(`✉️ Previsualiza el correo enviado aquí: ${previewUrl}`);
      }
    } catch (e) {
      // Ignorar si getTestMessageUrl falla (por ejemplo con transportes simulados o SMTP real)
    }
    return info;
  } catch (error) {
    console.error('❌ Error al enviar correo:', error);
  }
};

const sendTramiteReceived = async (email, nombres, tramiteId, asunto, prioridad) => {
  const subject = `Trámite Recibido - Expediente N° ${String(tramiteId).padStart(5, '0')}`;
  const html = `
    <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
      <h2 style="color: #1351a5; border-bottom: 2px solid #1351a5; padding-bottom: 10px;">Municipalidad Provincial de Yau</h2>
      <p>Hola <strong>${nombres}</strong>,</p>
      <p>Confirmamos que hemos recibido tu solicitud de trámite de forma exitosa y ha sido registrada en nuestro sistema de Mesa de Partes Virtual.</p>
      
      <div style="background-color: #f7fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #2d3748;">Detalle del Expediente:</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 5px 0; color: #718096; width: 150px;"><strong>N° Expediente:</strong></td>
            <td style="padding: 5px 0;">#${String(tramiteId).padStart(5, '0')}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0; color: #718096;"><strong>Asunto:</strong></td>
            <td style="padding: 5px 0;">${asunto}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0; color: #718096;"><strong>Prioridad (IA):</strong></td>
            <td style="padding: 5px 0;"><strong>${prioridad}</strong></td>
          </tr>
          <tr>
            <td style="padding: 5px 0; color: #718096;"><strong>Estado Inicial:</strong></td>
            <td style="padding: 5px 0;"><span style="background-color: #feebc8; color: #c05621; padding: 3px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">Pendiente</span></td>
          </tr>
        </table>
      </div>
      
      <p>Puedes realizar el seguimiento de tu trámite en tiempo real desde la plataforma ingresando a tu sección de "Trámites" o mediante la "Consulta Rápida de Trámite" usando tu N° de Expediente y DNI.</p>
      
      <div style="margin-top: 30px; font-size: 12px; color: #a0aec0; text-align: center; border-top: 1px solid #edf2f7; padding-top: 15px;">
        Este es un correo automático, por favor no respondas a este mensaje.<br>
        &copy; 2026 Municipalidad Provincial de Yau. Todos los derechos reservados.
      </div>
    </div>
  `;
  return sendTramiteReceivedInternal(email, subject, html);
};

// Internal name avoiding conflict
const sendTramiteReceivedInternal = async (email, subject, html) => {
  return sendEmail(email, subject, html);
};

const sendTramiteStatusUpdated = async (email, nombres, tramiteId, asunto, nuevoEstado, observaciones) => {
  const subject = `Actualización de Estado - Expediente N° ${String(tramiteId).padStart(5, '0')}`;
  
  let estadoText = nuevoEstado.replace('_', ' ').toUpperCase();
  let estadoColor = '#718096';
  let estadoBg = '#edf2f7';
  
  if (nuevoEstado === 'pendiente') {
    estadoColor = '#c05621';
    estadoBg = '#feebc8';
  } else if (nuevoEstado === 'en_proceso') {
    estadoColor = '#2b6cb0';
    estadoBg = '#ebf8ff';
  } else if (nuevoEstado === 'atendido') {
    estadoColor = '#2f855a';
    estadoBg = '#f0fff4';
  } else if (nuevoEstado === 'rechazado') {
    estadoColor = '#c53030';
    estadoBg = '#fff5f5';
  }

  const html = `
    <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
      <h2 style="color: #1351a5; border-bottom: 2px solid #1351a5; padding-bottom: 10px;">Municipalidad Provincial de Yau</h2>
      <p>Hola <strong>${nombres}</strong>,</p>
      <p>Te informamos que tu trámite de expediente <strong>#${String(tramiteId).padStart(5, '0')}</strong> ha tenido una actualización.</p>
      
      <div style="background-color: #f7fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 5px 0; color: #718096; width: 150px;"><strong>N° Expediente:</strong></td>
            <td style="padding: 5px 0;">#${String(tramiteId).padStart(5, '0')}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0; color: #718096;"><strong>Asunto:</strong></td>
            <td style="padding: 5px 0;">${asunto}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0; color: #718096;"><strong>Nuevo Estado:</strong></td>
            <td style="padding: 5px 0;">
              <span style="background-color: ${estadoBg}; color: ${estadoColor}; padding: 3px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; text-transform: capitalize;">
                ${estadoText}
              </span>
            </td>
          </tr>
          ${observaciones ? `
          <tr>
            <td style="padding: 10px 0 5px 0; color: #718096; vertical-align: top;"><strong>Observaciones:</strong></td>
            <td style="padding: 10px 0 5px 0; background-color: #fff; padding: 8px; border: 1px dashed #cbd5e0; border-radius: 4px; font-style: italic;">
              ${observaciones}
            </td>
          </tr>
          ` : ''}
        </table>
      </div>
      
      <p>Puedes verificar los detalles en la plataforma.</p>
      
      <div style="margin-top: 30px; font-size: 12px; color: #a0aec0; text-align: center; border-top: 1px solid #edf2f7; padding-top: 15px;">
        Este es un correo automático, por favor no respondas a este mensaje.<br>
        &copy; 2026 Municipalidad Provincial de Yau. Todos los derechos reservados.
      </div>
    </div>
  `;
  return sendEmail(email, subject, html);
};

module.exports = {
  sendTramiteReceived,
  sendTramiteStatusUpdated
};
