// Módulo de Evento de Cobro de Cupos (Sicario en Mototaxi)

import { playSound } from './audio.js?v=11';
import { getRoadCurveX } from './world.js?v=11';

export let motoEvent = { 
    active: false, 
    state: 'hidden', 
    mesh: null, 
    hits: 0, 
    timer: 0, 
    laneOffset: 0, 
    zOffset: -40 
};

export function resetMotoEvent(scene) {
    if (motoEvent.mesh) {
        scene.remove(motoEvent.mesh);
    }
    motoEvent = { 
        active: false, 
        state: 'hidden', 
        mesh: null, 
        hits: 0, 
        timer: 0, 
        laneOffset: 0, 
        zOffset: -40 
    };
}

export function createMotoEnemy() {
    const mGroup = new THREE.Group();
    const mBody = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.7, 2.0), new THREE.MeshLambertMaterial({ color: 0x1a1a1a }));
    mBody.position.y = 0.5; 
    mGroup.add(mBody);
    
    const wGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.2, 8); 
    wGeo.rotateZ(Math.PI / 2);
    const wMat = new THREE.MeshLambertMaterial({ color: 0x0a0a0a });
    const wF = new THREE.Mesh(wGeo, wMat); 
    wF.position.set(0, 0.35, 0.9); 
    mGroup.add(wF);
    
    const wB = new THREE.Mesh(wGeo, wMat); 
    wB.position.set(0, 0.35, -0.8); 
    mGroup.add(wB);

    const riderBody = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.0, 0.8), new THREE.MeshLambertMaterial({ color: 0x222222 }));
    riderBody.position.set(0, 1.3, -0.2); 
    mGroup.add(riderBody);
    
    const helmet = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.7, 0.7), new THREE.MeshLambertMaterial({ color: 0x000000 }));
    helmet.position.set(0, 2.1, -0.2); 
    mGroup.add(helmet);

    mGroup.position.y = 0; 
    return mGroup;
}

export function startMotoEvent(scene, playerLaneOffset) {
    motoEvent.active = true; 
    motoEvent.state = 'chasing'; 
    motoEvent.hits = 0; 
    motoEvent.timer = 0; 
    motoEvent.zOffset = -30;
    
    // El sicario aparece por el carril contrario al que se encuentra el jugador
    motoEvent.laneOffset = (playerLaneOffset > 0) ? -4 : 4; 
    
    if (!motoEvent.mesh) {
        motoEvent.mesh = createMotoEnemy();
    }
    scene.add(motoEvent.mesh);
    
    const motoAlertEl = document.getElementById('moto-alert');
    const motoHitsEl = document.getElementById('moto-hits');
    if (motoAlertEl) motoAlertEl.classList.remove('hidden');
    if (motoHitsEl) motoHitsEl.innerText = '0';
}

export function updateMotoEvent(delta, scene, playerVehicle, playerLaneOffset, callbacks) {
    if (!motoEvent.active) return;
    
    const curveX = getRoadCurveX(playerVehicle.position.z + motoEvent.zOffset);
    
    if (motoEvent.state === 'chasing') {
        motoEvent.zOffset += 30 * delta; 
        if (motoEvent.zOffset >= 0) { 
            motoEvent.zOffset = 0; 
            motoEvent.state = 'alongside'; 
            motoEvent.timer = 0; 
        }
    } 
    else if (motoEvent.state === 'alongside') {
        motoEvent.timer += delta;
        
        // Si el jugador embiste/choca lateralmente con el sicario (se pone en su mismo carril)
        if (Math.abs(playerLaneOffset - motoEvent.laneOffset) < 2.0) {
            motoEvent.hits++; 
            const motoHitsEl = document.getElementById('moto-hits');
            if (motoHitsEl) motoHitsEl.innerText = motoEvent.hits;
            
            playSound('moto_hit'); 
            if (callbacks.onHit) callbacks.onHit();

            if (motoEvent.hits >= 3) {
                motoEvent.state = 'defeated'; 
                motoEvent.timer = 0;
                
                const motoAlertEl = document.getElementById('moto-alert');
                if (motoAlertEl) motoAlertEl.classList.add('hidden');
                
                if (callbacks.triggerAlert) callbacks.triggerAlert("¡SICARIO DERROTADO!");
            } else {
                motoEvent.state = 'recovering'; 
                motoEvent.zOffset = -15;
            }
        } 
        else if (motoEvent.timer > 2.0) { // Demoraste más de 2 segundos en cerrarlo y te plomean
            playSound('shot'); 
            const goTitle = document.getElementById('go-title');
            const goDesc = document.getElementById('go-desc');
            if (goTitle) goTitle.innerText = "¡ASESINADO POR CUPO!";
            if (goDesc) goDesc.innerText = "Demoraste en cerrarlo y te plomearon."; 
            if (callbacks.endGame) callbacks.endGame();
        }
    } 
    else if (motoEvent.state === 'recovering') {
        motoEvent.zOffset += 15 * delta;
        if (motoEvent.zOffset >= 0) { 
            motoEvent.zOffset = 0; 
            motoEvent.state = 'alongside'; 
            motoEvent.timer = 0; 
        }
    }
    else if (motoEvent.state === 'defeated') {
        motoEvent.zOffset -= 40 * delta; 
        if (motoEvent.mesh) {
            motoEvent.mesh.rotation.y += 10 * delta;
        }
        motoEvent.timer += delta;
        if (motoEvent.timer > 2.0) { 
            if (motoEvent.mesh) {
                scene.remove(motoEvent.mesh);
            }
            motoEvent.active = false; 
        }
    }

    if (motoEvent.active && motoEvent.mesh) {
        motoEvent.mesh.position.z = playerVehicle.position.z + motoEvent.zOffset;
        motoEvent.mesh.position.x = curveX + motoEvent.laneOffset;
        if (motoEvent.state !== 'defeated') {
            const cA = getRoadCurveX(motoEvent.mesh.position.z + 5); 
            motoEvent.mesh.rotation.y = Math.atan2(cA - curveX, 5);
        }
    }
}
