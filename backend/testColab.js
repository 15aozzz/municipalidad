const axios = require('axios');
require('dotenv').config();

async function test() {
  const colabUrl = process.env.COLAB_URL || 'https://jeopardously-reconstructive-martina.ngrok-free.dev/clasificar';
  console.log('Test URL:', colabUrl);
  try {
    const response = await axios.post(colabUrl, {
      texto: "Asunto: pared dañada\nDescripción: hay una pared cerca de mi casa que esta a punto de caerse",
      asunto: "pared dañada",
      descripcion: "hay una pared cerca de mi casa que esta a punto de caerse"
    }, {
      headers: { 
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      timeout: 10000 
    });
    console.log('Status:', response.status);
    console.log('Headers:', response.headers);
    console.log('Data Type:', typeof response.data);
    console.log('Data:', response.data);
  } catch (err) {
    console.error('Error:', err.message);
    if (err.response) {
      console.log('Error Status:', err.response.status);
      console.log('Error Data:', err.response.data);
    }
  }
}

test();
