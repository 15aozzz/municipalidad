// Módulo de Especificaciones y Modelado de Vehículos del Jugador

export const VEHICLE_SPECS = {
    combi: {
        maxSpeed: 0.85,
        steeringSpeed: 0.22,
        acceleration: 0.012,
        deceleration: 0.006,
        name: 'LA COMBI'
    },
    chino: {
        maxSpeed: 1.1,
        steeringSpeed: 0.16,
        acceleration: 0.010,
        deceleration: 0.005,
        name: 'EL CHINO'
    },
    moto: {
        maxSpeed: 0.7,
        steeringSpeed: 0.30,
        acceleration: 0.015,
        deceleration: 0.008,
        name: 'EL MOTO'
    }
};

export function createPlayerVehicle(type, scene) {
    const playerVehicle = new THREE.Group();
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    // Pintar texturas específicas en Canvas para el modelo 3D retro
    if (type === 'combi') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 64, 28);
        ctx.fillStyle = '#1e3a8a';
        ctx.fillRect(0, 28, 64, 36);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(0, 25, 64, 5);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(8, 6, 12, 12);
        ctx.fillRect(26, 6, 12, 12);
        ctx.fillRect(44, 6, 12, 12);
    } else if (type === 'chino') {
        ctx.fillStyle = '#eab308';
        ctx.fillRect(0, 0, 64, 32);
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(0, 32, 64, 32);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(6, 8, 10, 14);
        ctx.fillRect(20, 8, 10, 14);
        ctx.fillRect(34, 8, 10, 14);
        ctx.fillRect(48, 8, 10, 14);
    } else if (type === 'moto') {
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(0, 0, 64, 64);
        ctx.fillStyle = '#facc15';
        ctx.fillRect(0, 0, 64, 20);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(12, 14, 40, 22);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.magFilter = THREE.NearestFilter;
    const bodyMat = new THREE.MeshLambertMaterial({ map: tex });
    const wheelMat = new THREE.MeshLambertMaterial({ color: 0x111111 });

    if (type === 'combi') {
        const body = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.8, 3.8), bodyMat);
        body.position.y = 1.0;
        playerVehicle.add(body);

        const wGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 8);
        wGeo.rotateZ(Math.PI / 2);
        const wPositions = [
            [0.8, 0.4, 1.2],
            [-0.8, 0.4, 1.2],
            [0.8, 0.4, -1.2],
            [-0.8, 0.4, -1.2]
        ];
        wPositions.forEach(p => {
            const w = new THREE.Mesh(wGeo, wheelMat);
            w.position.set(...p);
            playerVehicle.add(w);
        });
    } else if (type === 'chino') {
        const body = new THREE.Mesh(new THREE.BoxGeometry(1.8, 2.0, 5.5), bodyMat);
        body.position.y = 1.1;
        playerVehicle.add(body);

        const wGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.4, 8);
        wGeo.rotateZ(Math.PI / 2);
        const wPositions = [
            [0.9, 0.5, 1.8],
            [-0.9, 0.5, 1.8],
            [0.9, 0.5, -0.6],
            [-0.9, 0.5, -0.6],
            [0.9, 0.5, -2.0],
            [-0.9, 0.5, -2.0]
        ];
        wPositions.forEach(p => {
            const w = new THREE.Mesh(wGeo, wheelMat);
            w.position.set(...p);
            playerVehicle.add(w);
        });
    } else if (type === 'moto') {
        const cab = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.5, 2.4), bodyMat);
        cab.position.y = 0.95;
        playerVehicle.add(cab);

        const wGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.25, 8);
        wGeo.rotateZ(Math.PI / 2);
        const w1 = new THREE.Mesh(wGeo, wheelMat);
        w1.position.set(0, 0.35, 1.0);
        playerVehicle.add(w1);

        const w2 = new THREE.Mesh(wGeo, wheelMat);
        w2.position.set(0.65, 0.35, -0.7);
        playerVehicle.add(w2);

        const w3 = new THREE.Mesh(wGeo, wheelMat);
        w3.position.set(-0.65, 0.35, -0.7);
        playerVehicle.add(w3);
    }

    playerVehicle.position.set(0, 0, 0);
    scene.add(playerVehicle);
    return playerVehicle;
}
