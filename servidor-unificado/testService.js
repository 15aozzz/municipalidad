const ClasificacionService = require('./services/clasificacionService');

async function test() {
  try {
    const result = await ClasificacionService.clasificar('pared dañada', 'hay una pared cerca de mi casa que esta a punto de caerse');
    console.log('Result:', result);
  } catch (e) {
    console.error('Error:', e);
  }
}

test();
