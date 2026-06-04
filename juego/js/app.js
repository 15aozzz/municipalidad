// Módulo Principal del Juego - Lima Caos Racer 3D (Core Engine & Loop)

import { initAudio, playSound } from './audio.js?v=11';
import { initGlobalTextures } from './textures.js?v=11';
import { createPlayerVehicle, VEHICLE_SPECS } from './vehicles.js?v=11';
import { 
    resetWorld, 
    updateInfiniteRoad, 
    isPositionOnRoad, 
    obstacleObjects, 
    coinObjects, 
    cleanObstacle, 
    cleanCoin, 
    roadWidth, 
    lanes,
    roadSegments
} from './world.js?v=11';
import { 
    motoEvent, 
    resetMotoEvent, 
    startMotoEvent, 
    updateMotoEvent 
} from './motoEvent.js?v=11';

// --- VARIABLES DEL MOTOR 3D ---
let scene, camera, renderer, clock;
let playerVehicle;

// --- ESTADO GENERAL DEL JUEGO ---
let selectedType = 'combi'; 
let gameActive = false;
let speed = 0;
let maxSpeed = 0.8;
let acceleration = 0.012;
let steeringSpeed = 0.20; 
let deceleration = 0.006;
let distanceTraveled = 0;
let solesCollected = 0;
let playerHealth = 100;
let shakeIntensity = 0;
let retroScale = 1.8; 
let playerLaneOffset = 0;

// TIMERS DE CINEMÁTICA
let ct1, ct2, ct3, ct4, ct5, ct6, ct7;

// INPUTS (TECLADO / TÁCTIL)
const keys = { left: false, right: false, forward: false, backward: false };

// --- SENSADO DE INPUTS ---
window.addEventListener('keydown', (e) => {
    initAudio(); 
    if (!gameActive) return;
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = true;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = true;
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') keys.forward = true;
    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') keys.backward = true;
    if (e.key === ' ' || e.key === 'h' || e.key === 'H') playSound('horn');
});

window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = false;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = false;
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') keys.forward = false;
    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') keys.backward = false;
});

// --- CONTROLES MÓVILES (TACTILES) ---
export function setupTouchControls() {
    const bindTouch = (btnId, keyName) => {
        const btn = document.getElementById(btnId);
        if (!btn) return;
        const start = (e) => { 
            e.preventDefault(); 
            initAudio(); 
            keys[keyName] = true; 
        };
        const end = (e) => { 
            e.preventDefault(); 
            keys[keyName] = false; 
        };
        btn.addEventListener('touchstart', start); 
        btn.addEventListener('touchend', end);
        btn.addEventListener('mousedown', start); 
        btn.addEventListener('mouseup', end);
    };
    bindTouch('btn-left', 'left'); 
    bindTouch('btn-right', 'right'); 
    bindTouch('btn-gas', 'forward'); 
    bindTouch('btn-brake', 'backward');

    const hornBtn = document.getElementById('btn-horn');
    if (hornBtn) {
        hornBtn.addEventListener('click', () => { 
            initAudio(); 
            playSound('horn'); 
        });
    }
}

// --- CINEMÁTICA DE INTRODUCCIÓN ---
export function playCinematic() {
    const chalo = document.getElementById('character-chalo');
    const friend = document.getElementById('character-friend');
    const bubbleChalo = document.getElementById('bubble-chalo');
    const bubbleFriend = document.getElementById('bubble-friend');
    const textChalo = document.getElementById('text-chalo');
    const textFriend = document.getElementById('text-friend');
    const chaloSprite = document.getElementById('chalo-sprite');

    if (!chalo || !friend) return;

    // Resetear posiciones y estados
    chalo.style.left = '20%';
    chalo.style.bottom = '12%';
    chalo.style.display = 'flex';
    chalo.style.opacity = '1';
    friend.style.right = '-60%';
    friend.style.left = '';
    friend.style.transition = 'all 1500ms cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    if (bubbleChalo) bubbleChalo.style.opacity = 0;
    if (bubbleFriend) bubbleFriend.style.opacity = 0;

    // 1. Chalo habla estando de pie
    ct1 = setTimeout(() => {
        if (textChalo) textChalo.innerText = "Pucha, ya acabé SENATI y nada de chamba pe...";
        if (bubbleChalo) bubbleChalo.style.opacity = 1;
    }, 1000);

    // 2. Desaparece el diálogo y viene la mototaxi a toda velocidad desde la derecha
    ct2 = setTimeout(() => {
        if (bubbleChalo) bubbleChalo.style.opacity = 0;
        friend.style.right = '28%'; // Se estaciona al costado de Chalo
    }, 6500);

    // 3. La mototaxi frena (skid) y el amigo habla
    ct3 = setTimeout(() => {
        const taxiVisual = friend.querySelector('.relative');
        if (taxiVisual) {
            taxiVisual.classList.add('animate-skid');
            playSound('crash'); // Sonido de freno o toque
        }
        if (textFriend) textFriend.innerText = "¡Habla causa! Súbete, toca trabajar en el rubro destinado para todo senatino... ¡LAS PISTAS!";
        if (bubbleFriend) bubbleFriend.style.opacity = 1;
    }, 8200);

    // 4. El amigo deja de hablar y Chalo camina hacia la mototaxi
    ct4 = setTimeout(() => {
        if (bubbleFriend) bubbleFriend.style.opacity = 0;
        if (chaloSprite) chaloSprite.classList.add('walking');
        chalo.style.transition = 'all 1500ms linear';
        chalo.style.left = '52%'; // Se acerca a la puerta de la moto (que al estar orientada a la izquierda queda del lado derecho del sprite)
    }, 15500);

    // 5. Chalo entra a la mototaxi (desaparece)
    ct5 = setTimeout(() => {
        if (chaloSprite) chaloSprite.classList.remove('walking');
        chalo.style.display = 'none';
        playSound('coin'); // Feedback de subida
    }, 17200);

    // 6. La mototaxi acelera rápido hacia la izquierda saliendo de pantalla
    ct6 = setTimeout(() => {
        friend.style.transition = 'all 1500ms cubic-bezier(0.6, -0.28, 0.735, 0.045)';
        friend.style.right = '130%'; // Sale por la izquierda
    }, 18200);

    // 7. Terminar cinemática
    ct7 = setTimeout(() => {
        endCinematic();
    }, 20000);
}

export function endCinematic() {
    clearTimeout(ct1); 
    clearTimeout(ct2); 
    clearTimeout(ct3); 
    clearTimeout(ct4);
    clearTimeout(ct5);
    clearTimeout(ct6);
    clearTimeout(ct7);
    const chaloSprite = document.getElementById('chalo-sprite');
    if (chaloSprite) {
        chaloSprite.classList.remove('walking');
    }
    const cinematicDiv = document.getElementById('intro-cinematic');
    const startScreen = document.getElementById('start-screen');
    if (cinematicDiv && !cinematicDiv.classList.contains('hidden')) {
        cinematicDiv.style.opacity = 0;
        setTimeout(() => {
            cinematicDiv.classList.add('hidden');
            if (startScreen) startScreen.classList.remove('hidden');
        }, 1000);
    }
}

// --- CONFIGURACIÓN DE RESOLUCIÓN RETRO ---
export function setResolution(scale) {
    retroScale = scale;
    document.querySelectorAll('.res-option').forEach(btn => { 
        btn.classList.remove('border-yellow-400'); 
        btn.classList.add('border-transparent'); 
    });
    let btnId = 'res-mid';
    if (scale === 3.2) btnId = 'res-low'; 
    if (scale === 1.0) btnId = 'res-high';
    
    const targetBtn = document.getElementById(btnId);
    if (targetBtn) {
        targetBtn.classList.remove('border-transparent'); 
        targetBtn.classList.add('border-yellow-400');
    }
    
    const canvasContainer = document.getElementById('canvas-container');
    if (renderer && canvasContainer) {
        renderer.setSize(canvasContainer.clientWidth / retroScale, canvasContainer.clientHeight / retroScale, false);
    }
}

// --- SELECCIONAR VEHÍCULO ---
export function selectVehicle(type) {
    selectedType = type; 
    document.querySelectorAll('.vehicle-option').forEach(btn => { 
        btn.classList.remove('border-yellow-400'); 
        btn.classList.add('border-transparent'); 
    });
    const selectedBtn = document.getElementById('select-' + type);
    if (selectedBtn) {
        selectedBtn.classList.remove('border-transparent'); 
        selectedBtn.classList.add('border-yellow-400');
    }
}

// --- INICIALIZAR ESCENA THREE.JS ---
export function setupScene() {
    const container = document.getElementById('canvas-container'); 
    container.innerHTML = '';
    
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x90bce3); 
    scene.fog = new THREE.FogExp2(0x90bce3, 0.0035);
    
    camera = new THREE.PerspectiveCamera(65, container.clientWidth / container.clientHeight, 0.1, 1500);
    
    renderer = new THREE.WebGLRenderer({ antialias: false }); 
    renderer.setSize(container.clientWidth / retroScale, container.clientHeight / retroScale, false);
    const domElement = renderer.domElement; 
    domElement.id = 'game-canvas'; 
    container.appendChild(domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const dirLight = new THREE.DirectionalLight(0xfff8e7, 0.7); 
    dirLight.position.set(20, 40, 20); 
    scene.add(dirLight);

    clock = new THREE.Clock(); 
    
    initGlobalTextures();
    resetWorld(scene);
    resetMotoEvent(scene);

    window.addEventListener('resize', () => {
        const w = container.clientWidth; 
        const h = container.clientHeight;
        camera.aspect = w / h; 
        camera.updateProjectionMatrix(); 
        renderer.setSize(w / retroScale, h / retroScale, false);
    });
}

// --- INICIAR EL JUEGO ---
export function startGame() {
    initAudio();
    const startScreen = document.getElementById('start-screen');
    const hud = document.getElementById('hud');
    const motoAlert = document.getElementById('moto-alert');
    
    if (startScreen) startScreen.classList.add('hidden'); 
    if (hud) hud.classList.remove('hidden'); 
    if (motoAlert) motoAlert.classList.add('hidden');
    
    setupScene(); 
    playerVehicle = createPlayerVehicle(selectedType, scene);
    
    // Posicionar jugador en Jr. de la Historia (X = 20, Z = 0)
    playerVehicle.position.set(20, 0, 0);
    playerVehicle.rotation.y = 0;
    
    // Cargar especificaciones del vehículo seleccionado
    const specs = VEHICLE_SPECS[selectedType];
    maxSpeed = specs.maxSpeed;
    steeringSpeed = specs.steeringSpeed;
    acceleration = specs.acceleration;
    deceleration = specs.deceleration;

    speed = 0.2; 
    distanceTraveled = 0; 
    solesCollected = 0; 
    playerHealth = 100; 
    playerLaneOffset = 0;
    
    const hudSoles = document.getElementById('hud-soles');
    const hudDist = document.getElementById('hud-dist');
    const healthBar = document.getElementById('health-bar');
    
    if (hudSoles) hudSoles.innerText = solesCollected; 
    if (hudDist) hudDist.innerText = 0; 
    if (healthBar) healthBar.style.width = '100%';

    setupTouchControls(); 
    gameActive = true; 
    animate();
}

// --- ALERTAS DEL JUEGO (BANNER FLOTANTE) ---
export function triggerAlert(msg) {
    const ab = document.getElementById('game-alert'); 
    if (!ab) return;
    ab.innerText = msg; 
    ab.classList.remove('hidden'); 
    setTimeout(() => { ab.classList.add('hidden'); }, 1000);
}

// --- COLISIONES CON OBSTÁCULOS ---
export function handleCollision(obstacle) {
    playSound('crash'); 
    shakeIntensity = 0.45;
    
    if (obstacle.userData.type === 'pothole') { 
        triggerAlert('¡BACHAZO!'); 
        speed *= 0.3; 
    } else if (obstacle.userData.type === 'traffic') { 
        triggerAlert('¡CHOQUE!'); 
        playerHealth -= 20; 
        speed = -0.1; 
    } 
    
    const healthBar = document.getElementById('health-bar');
    if (healthBar) healthBar.style.width = playerHealth + '%';
    
    if (playerHealth <= 0) { 
        const goTitle = document.getElementById('go-title');
        const goDesc = document.getElementById('go-desc');
        if (goTitle) goTitle.innerText = "¡VEHÍCULO DESTRUIDO!"; 
        if (goDesc) goDesc.innerText = "Tu fierro no aguantó el ritmo de la pista."; 
        endGame(); 
    }
}

// --- PANTALLA DE JUEGO TERMINADO (GAME OVER) ---
export function endGame() {
    gameActive = false; 
    const hud = document.getElementById('hud');
    const gameOverScreen = document.getElementById('game-over-screen');
    const goDist = document.getElementById('go-dist');
    const goSoles = document.getElementById('go-soles');
    
    if (hud) hud.classList.add('hidden'); 
    if (gameOverScreen) gameOverScreen.classList.remove('hidden');
    if (goDist) goDist.innerText = Math.floor(distanceTraveled) + ' m'; 
    if (goSoles) goSoles.innerText = 'S/. ' + solesCollected;
}

// --- REINICIAR RUTA ---
export function restartGame() { 
    const gameOverScreen = document.getElementById('game-over-screen');
    if (gameOverScreen) gameOverScreen.classList.add('hidden'); 
    startGame(); 
}

// --- REGRESAR AL MENÚ ---
export function backToMenu() { 
    const gameOverScreen = document.getElementById('game-over-screen');
    const startScreen = document.getElementById('start-screen');
    if (gameOverScreen) gameOverScreen.classList.add('hidden'); 
    if (startScreen) startScreen.classList.remove('hidden'); 
}

// --- BUCLE PRINCIPAL DE ANIMACIÓN (GAME LOOP) ---
function animate() {
    if (!gameActive) return; 
    requestAnimationFrame(animate); 
    
    const delta = clock.getDelta();

    // Aceleración y Frenado
    if (keys.forward) {
        speed = Math.min(speed + acceleration, maxSpeed); 
    } else if (keys.backward) {
        speed = Math.max(speed - deceleration * 2.2, -0.2); 
    } else {
        speed = speed > 0 ? Math.max(speed - deceleration, 0) : Math.min(speed + deceleration, 0);
    }

    // Rotación del jugador (Conducción Libre en 360°)
    if (keys.left) {
        playerVehicle.rotation.y += steeringSpeed * 5.5 * delta;
        playerVehicle.rotation.z = THREE.MathUtils.lerp(playerVehicle.rotation.z, 0.16, 0.2);
    } else if (keys.right) {
        playerVehicle.rotation.y -= steeringSpeed * 5.5 * delta;
        playerVehicle.rotation.z = THREE.MathUtils.lerp(playerVehicle.rotation.z, -0.16, 0.2);
    } else {
        playerVehicle.rotation.z = THREE.MathUtils.lerp(playerVehicle.rotation.z, 0, 0.25);
    }

    // Calcular desplazamiento vectorial según el ángulo del vehículo
    const dx = Math.sin(playerVehicle.rotation.y) * speed * 60 * delta;
    const dz = Math.cos(playerVehicle.rotation.y) * speed * 60 * delta;

    const nextX = playerVehicle.position.x + dx;
    const nextZ = playerVehicle.position.z + dz;

    // Deslizamiento lateral contra veredas/edificios (isPositionOnRoad)
    if (isPositionOnRoad(nextX, playerVehicle.position.z, 0.8)) {
        playerVehicle.position.x = nextX;
    } else {
        speed *= 0.75; // Fricción al chocar lateralmente
    }

    if (isPositionOnRoad(playerVehicle.position.x, nextZ, 0.8)) {
        playerVehicle.position.z = nextZ;
    } else {
        speed *= 0.75; // Fricción al chocar lateralmente
    }

    // Incrementar distancia recorrida
    distanceTraveled += Math.sqrt(dx * dx + dz * dz);
    const hudDist = document.getElementById('hud-dist');
    if (hudDist) hudDist.innerText = Math.floor(distanceTraveled);

    // Rotar monedas
    coinObjects.forEach(c => { 
        c.rotation.z += 2.5 * delta; 
    });

    // Colisión con obstáculos (Choques / Bachas)
    obstacleObjects.forEach(obs => { 
        if (Math.abs(obs.position.z - playerVehicle.position.z) < 1.8 && Math.abs(obs.position.x - playerVehicle.position.x) < 1.5) { 
            handleCollision(obs); 
            obs.position.y = -100;
            cleanObstacle(scene, obs);
        } 
    });

    // Recolectar Monedas de Soles
    coinObjects.forEach(coin => { 
        if (Math.abs(coin.position.z - playerVehicle.position.z) < 1.5 && Math.abs(coin.position.x - playerVehicle.position.x) < 1.2) { 
            solesCollected += 10; 
            const hudSoles = document.getElementById('hud-soles');
            if (hudSoles) hudSoles.innerText = solesCollected; 
            playSound('coin'); 
            coin.position.y = -100;
            cleanCoin(scene, coin);
        } 
    });

    // Cámara en 3ra Persona Dinámica (Más rápida y reactiva)
    const camDist = 9.0;
    const camHeight = 4.8;
    const camTargetX = playerVehicle.position.x - Math.sin(playerVehicle.rotation.y) * camDist;
    const camTargetZ = playerVehicle.position.z - Math.cos(playerVehicle.rotation.y) * camDist;
    const camTargetY = playerVehicle.position.y + camHeight;

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, camTargetX, 0.30);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, camTargetZ, 0.30);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, camTargetY, 0.20);

    // Camera Shake al chocar
    if (shakeIntensity > 0) { 
        camera.position.x += (Math.random() - 0.5) * shakeIntensity; 
        camera.position.y += (Math.random() - 0.5) * shakeIntensity; 
        shakeIntensity -= 0.02; 
    }

    const lookTargetX = playerVehicle.position.x + Math.sin(playerVehicle.rotation.y) * 10;
    const lookTargetZ = playerVehicle.position.z + Math.cos(playerVehicle.rotation.y) * 10;
    camera.lookAt(lookTargetX, 1.2, lookTargetZ);
    
    renderer.render(scene, camera);
}

// --- VINCULAR MÉTODOS AL GLOBAL WINDOW (Para compatibilidad con onclick HTML inline) ---
window.setResolution = setResolution;
window.selectVehicle = selectVehicle;
window.startGame = startGame;
window.restartGame = restartGame;
window.backToMenu = backToMenu;

// --- AUTOINICIALIZAR AL CARGAR ---
window.addEventListener('load', () => {
    const skipBtn = document.getElementById('skip-cinematic');
    if (skipBtn) {
        skipBtn.addEventListener('click', endCinematic);
    }
    
    selectVehicle('combi'); 
    setResolution(1.8); 
    playCinematic(); 
});
