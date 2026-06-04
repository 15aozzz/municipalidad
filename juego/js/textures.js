// Módulo de Texturas Procedimentales de Lima Caos Racer 3D

export let roadTexture;
export let crossroadTexture;
export let wallTexture;
export let cerroTexture;
export let facadeTextures = [];

export function initGlobalTextures() {
    // 1. Textura de Pista (Carretera)
    const roadCanvas = document.createElement('canvas');
    roadCanvas.width = 64;
    roadCanvas.height = 64;
    const roadCtx = roadCanvas.getContext('2d');
    roadCtx.fillStyle = '#2d2d30';
    roadCtx.fillRect(0, 0, 64, 64);
    roadCtx.fillStyle = '#1e1e21';
    for (let i = 0; i < 40; i++) {
        roadCtx.fillRect(Math.random() * 64, Math.random() * 64, 2, 2);
    }
    roadTexture = new THREE.CanvasTexture(roadCanvas);
    roadTexture.magFilter = THREE.NearestFilter;
    roadTexture.minFilter = THREE.NearestFilter;
    roadTexture.wrapS = THREE.RepeatWrapping;
    roadTexture.wrapT = THREE.RepeatWrapping;

    // 2. Textura de Intersección (Cruce de Calles)
    const crossCanvas = document.createElement('canvas');
    crossCanvas.width = 128;
    crossCanvas.height = 128;
    const crossCtx = crossCanvas.getContext('2d');
    crossCtx.fillStyle = '#2d2d30';
    crossCtx.fillRect(0, 0, 128, 128);
    crossCtx.fillStyle = '#1e1e21';
    for (let i = 0; i < 80; i++) {
        crossCtx.fillRect(Math.random() * 128, Math.random() * 128, 2, 2);
    }
    crossCtx.fillStyle = '#ffffff';
    for (let x = 10; x < 118; x += 20) {
        crossCtx.fillRect(x, 20, 10, 88);
    }
    
    crossroadTexture = new THREE.CanvasTexture(crossCanvas);
    crossroadTexture.magFilter = THREE.NearestFilter;
    crossroadTexture.minFilter = THREE.NearestFilter;

    // 3. Textura de Pared (Ladrillo / Cemento)
    const wallCanvas = document.createElement('canvas');
    wallCanvas.width = 64;
    wallCanvas.height = 128;
    const wallCtx = wallCanvas.getContext('2d');
    wallCtx.fillStyle = '#ea580c';
    wallCtx.fillRect(0, 0, 64, 128);
    wallCtx.fillStyle = '#b45309';
    for (let y = 0; y < 128; y += 12) {
        wallCtx.fillRect(0, y, 64, 2);
        const offset = (y % 24 === 0) ? 0 : 16;
        for (let x = offset; x < 64; x += 32) {
            wallCtx.fillRect(x, y, 2, 12);
        }
    }
    
    wallTexture = new THREE.CanvasTexture(wallCanvas);
    wallTexture.magFilter = THREE.NearestFilter;
    wallTexture.minFilter = THREE.NearestFilter;
    wallTexture.wrapS = THREE.RepeatWrapping;
    wallTexture.wrapT = THREE.RepeatWrapping;
    wallTexture.repeat.set(6, 1);

    // 4. Textura del Cerro Habitado
    cerroTexture = generateCerroTexture();

    // 5. Paleta de colores e inicialización de fachadas de casas limeñas
    const palette = [
        '#ea580c', // Ladrillo crudo
        '#d4a373', // Ocre / Arena
        '#faedcd', // Crema
        '#e3d5ca', // Cemento claro
        '#d5bdaf', // Adobe / Tierra
        '#b7b7a4', // Gris verdoso
        '#a5a58d', // Gris pálido
        '#ddbea9', // Salmón apagado
        '#cb997e', // Ladrillo claro
        '#94a3b8', // Gris concreto
        '#7fa8bd', // Azul grisáceo
        '#b89265', // Marrón adobe
        '#e5c158', // Amarillo ocre pálido
        '#f3f4f6', // Blanco tiza
        '#ea580c'  // Ladrillo crudo duplicado
    ];
    facadeTextures = [];
    for (let i = 0; i < 15; i++) {
        facadeTextures.push(generateDynamicFacade(palette[i], i % 5));
    }
}

function generateDynamicFacade(baseColor, type) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    if (type === 4) { // Ladrillo expuesto sin tarrajear (clásico del cerro)
        ctx.fillStyle = '#ea580c';
        ctx.fillRect(0, 0, 128, 256);
        ctx.fillStyle = '#b45309';
        for (let y = 0; y < 256; y += 12) {
            ctx.fillRect(0, y, 128, 2);
            const offset = (y % 24 === 0) ? 0 : 16;
            for (let x = offset; x < 128; x += 32) {
                ctx.fillRect(x, y, 2, 12);
            }
        }
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(0, 0, 16, 256);
        ctx.fillRect(112, 0, 16, 256);
        ctx.fillStyle = '#475569';
        ctx.fillRect(6, 0, 4, 256);
        ctx.fillRect(118, 0, 4, 256);
    } else {
        ctx.fillStyle = baseColor;
        ctx.fillRect(0, 0, 128, 256);
    }

    // Primer piso (Tiendas / Puertas)
    if (type === 1) { 
        ctx.fillStyle = '#7f1d1d';
        ctx.fillRect(12, 160, 104, 96);
        ctx.fillStyle = '#eab308';
        ctx.fillRect(16, 170, 96, 22);
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(20, 174, 88, 14);
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(32, 178, 6, 6);
        ctx.fillRect(44, 178, 6, 6);
        ctx.fillRect(56, 178, 4, 6);
        ctx.fillRect(66, 178, 6, 6);
        ctx.fillRect(78, 178, 6, 6);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(24, 200, 36, 56);
        ctx.fillRect(68, 200, 36, 56);
    } else if (type === 2) { 
        ctx.fillStyle = '#1e3a8a';
        ctx.fillRect(12, 160, 104, 96);
        ctx.fillStyle = '#facc15';
        ctx.fillRect(16, 168, 96, 22);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(36, 176, 56, 6);
        ctx.fillStyle = '#78350f';
        ctx.fillRect(24, 215, 80, 41);
        ctx.fillStyle = '#0f172a';
        for (let x = 28; x < 100; x += 10) {
            ctx.fillRect(x, 195, 2, 20); 
        }
    } else if (type === 3) { 
        ctx.fillStyle = '#b45309';
        ctx.fillRect(12, 160, 104, 96);
        ctx.fillStyle = '#facc15';
        ctx.fillRect(16, 168, 96, 22);
        ctx.fillStyle = '#f97316';
        ctx.fillRect(24, 195, 80, 45);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(40, 205, 48, 25);
        ctx.fillStyle = '#111827';
        for (let x = 28; x < 100; x += 12) {
            ctx.fillRect(x, 195, 2, 45);
        }
    } else { 
        ctx.fillStyle = '#065f46';
        ctx.fillRect(15, 170, 98, 86);
        ctx.fillStyle = '#047857';
        ctx.fillRect(22, 178, 24, 30);
        ctx.fillRect(22, 216, 24, 32);
        ctx.fillRect(82, 178, 24, 30);
        ctx.fillRect(82, 216, 24, 32);
    }

    // Ventanas superiores
    drawFacadeWindows(ctx, type, 95);
    drawFacadeWindows(ctx, type, 25);

    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    return texture;
}

function drawFacadeWindows(ctx, type, startY) {
    const frameCol = (type === 4) ? '#475569' : '#ffffff';
    ctx.fillStyle = frameCol;
    ctx.fillRect(20, startY, 32, 36);
    ctx.fillRect(76, startY, 32, 36);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(24, startY + 4, 24, 28);
    ctx.fillRect(80, startY + 4, 24, 28);
    ctx.fillStyle = frameCol;
    ctx.fillRect(35, startY, 2, 36);
    ctx.fillRect(91, startY, 2, 36);
}

function generateCerroTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = '#b89265';
    ctx.fillRect(0, 0, 512, 256);
    
    // Dibujar sombras básicas de terreno
    ctx.fillStyle = '#a68055';
    ctx.beginPath();
    ctx.moveTo(0, 100);
    ctx.lineTo(256, 256);
    ctx.lineTo(0, 256);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(512, 150);
    ctx.lineTo(256, 256);
    ctx.lineTo(512, 256);
    ctx.fill();

    // Dibujar casitas de colores apiladas en el cerro
    const colors = ['#06b6d4', '#facc15', '#db2777', '#84cc16', '#1d4ed8', '#ef4444', '#a855f7', '#ffffff', '#fbbf24'];
    for (let y = 30; y < 256; y += 8) {
        for (let x = 0; x < 512; x += 10) {
            if (Math.random() > 0.35) {
                ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
                ctx.fillRect(x, y, 8, 6);
                ctx.fillStyle = '#111827';
                ctx.fillRect(x + 2, y + 2, 2, 2);
                ctx.fillStyle = '#7c2d12';
                ctx.fillRect(x - 1, y - 1, 10, 2); 
            }
        }
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    return texture;
}
