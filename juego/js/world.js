// Módulo de Carreteras 2D de San Borja, Veredas, Edificios y Físicas del Entorno (Lima Caos Racer 3D)

import { 
    roadTexture, 
    crossroadTexture, 
    wallTexture, 
    cerroTexture, 
    facadeTextures 
} from './textures.js?v=11';

export const roadWidth = 14;
export const lanes = [-4, 0, 4];

export let roadSegments = [];
export let obstacleObjects = [];
export let coinObjects = [];
export let cerrosFijos = [];

// --- DATA STRUCT DE LAS CALLES DE SAN BORJA ---
export const ROADS = [
    { name: "Av. Aviación", type: "vertical", x: -60, startZ: -200, endZ: 200, width: 18 },
    { name: "Av. Canadá", type: "horizontal", z: -150, startX: -200, endX: 200, width: 18 },
    { name: "C. del Comercio", type: "horizontal", z: 150, startX: -200, endX: 200, width: 18 },
    { name: "Av. San Luis", type: "vertical", x: 150, startZ: -200, endZ: 200, width: 18 },
    { name: "Jr. de la Historia", type: "vertical", x: 20, startZ: -150, endZ: 150, width: 12 },
    { name: "Cerro Blanco", type: "vertical", x: -35, startZ: -150, endZ: 0, width: 10 },
    { name: "C. Cerro Sechín", type: "horizontal", z: -80, startX: -60, endX: 20, width: 10 },
    { name: "C. Cerro Paloma", type: "vertical", x: -10, startZ: -80, endZ: 0, width: 10 },
    { name: "Cerro Centinela", type: "horizontal", z: 0, startX: -60, endX: 20, width: 10 },
    { name: "Cerro Colorido", type: "horizontal", z: 80, startX: -60, endX: 20, width: 10 },
    { name: "Naturaleza", type: "horizontal", z: -90, startX: 20, endX: 150, width: 10 },
    { name: "Cultura", type: "horizontal", z: 10, startX: 20, endX: 150, width: 10 }
];

export function resetWorld(scene) {
    roadSegments.forEach(s => scene.remove(s.group));
    obstacleObjects.forEach(o => scene.remove(o));
    coinObjects.forEach(c => scene.remove(c));
    cerrosFijos.forEach(cf => scene.remove(cf));

    roadSegments = [];
    obstacleObjects = [];
    coinObjects = [];
    cerrosFijos = [];

    // Generar la ciudad estática completa de San Borja
    generateCity(scene);
}

// Lógica de colisión con calles
export function isPositionOnRoad(x, z, margin = 0) {
    for (const r of ROADS) {
        const halfW = (r.width / 2) - margin;
        if (r.type === "vertical") {
            const withinX = Math.abs(x - r.x) <= halfW;
            const withinZ = z >= (r.startZ - halfW) && z <= (r.endZ + halfW);
            if (withinX && withinZ) return true;
        } else {
            const withinZ = Math.abs(z - r.z) <= halfW;
            const withinX = x >= (r.startX - halfW) && x <= (r.endX + halfW);
            if (withinX && withinZ) return true;
        }
    }
    return false;
}

export function createFixedCerro(scene, x, z, size) {
    const cerroGroup = new THREE.Group();
    const cerroMat = new THREE.MeshLambertMaterial({ map: cerroTexture });
    
    const c1 = new THREE.Mesh(new THREE.ConeGeometry(size, size * 0.5, 9), cerroMat);
    c1.position.set(0, size * 0.25, 0);
    c1.rotation.y = Math.random() * Math.PI;
    cerroGroup.add(c1);

    const c2 = new THREE.Mesh(new THREE.ConeGeometry(size * 0.8, size * 0.4, 7), cerroMat);
    c2.position.set(size * 0.5, size * 0.2, size * 0.2);
    c2.rotation.y = Math.random() * Math.PI;
    cerroGroup.add(c2);

    const c3 = new THREE.Mesh(new THREE.ConeGeometry(size * 0.9, size * 0.6, 8), cerroMat);
    c3.position.set(-size * 0.4, size * 0.3, -size * 0.1);
    c3.rotation.y = Math.random() * Math.PI;
    cerroGroup.add(c3);

    cerroGroup.position.set(x, 0, z);
    scene.add(cerroGroup);
    cerrosFijos.push(cerroGroup);
}

// Reemplazo de la carretera dinámica infinita
export function updateInfiniteRoad(scene, playerZ) {
    // En conducción libre no regeneramos calles, solo actualizamos animaciones de carros
    // Si queremos tráfico en movimiento, lo manejamos aquí.
}

// Generación inicial del mapa de San Borja
function generateCity(scene) {
    // 1. Suelo base de cemento/veredas
    const baseGeo = new THREE.PlaneGeometry(600, 600);
    const baseMat = new THREE.MeshLambertMaterial({ color: 0x9ca3af }); // color cemento vereda
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.rotation.x = -Math.PI / 2;
    baseMesh.position.y = -0.05;
    scene.add(baseMesh);
    roadSegments.push({ group: baseMesh });

    // 2. Renderizar calles de asfalto
    ROADS.forEach((r, idx) => {
        let length;
        let posZ, posX;
        if (r.type === "vertical") {
            length = r.endZ - r.startZ;
            posZ = (r.startZ + r.endZ) / 2;
            posX = r.x;
        } else {
            length = r.endX - r.startX;
            posX = (r.startX + r.endX) / 2;
            posZ = r.z;
        }

        const roadGeo = r.type === "vertical" 
            ? new THREE.PlaneGeometry(r.width, length + 2)
            : new THREE.PlaneGeometry(length + 2, r.width);
        
        // Tiling de textura
        const roadTexClone = roadTexture.clone();
        roadTexClone.wrapS = THREE.RepeatWrapping;
        roadTexClone.wrapT = THREE.RepeatWrapping;
        if (r.type === "vertical") {
            // Repetir en proporción para mantener el grano del asfalto cuadrado y no estirarlo en líneas
            roadTexClone.repeat.set(r.width / 4, length / 4);
        } else {
            // Repetir en proporción a lo largo y ancho de las pistas horizontales
            roadTexClone.repeat.set(length / 4, r.width / 4);
        }
        roadTexClone.needsUpdate = true;

        const roadMat = new THREE.MeshLambertMaterial({ map: roadTexClone });
        const roadMesh = new THREE.Mesh(roadGeo, roadMat);
        roadMesh.rotation.x = -Math.PI / 2;
        
        // Evitar Z-fighting (parpadeo) alternando levemente la altura Y de las pistas
        const heightY = (r.type === "vertical") ? 0.010 : 0.011;
        roadMesh.position.set(posX, heightY, posZ);
        scene.add(roadMesh);
        roadSegments.push({ group: roadMesh });
    });

    // 3. Colocar casas en manzanas libres
    const step = 8;
    const heights = [8, 12, 16, 20];
    for (let x = -200; x <= 200; x += step) {
        for (let z = -200; z <= 200; z += step) {
            // No colocar edificios sobre las pistas y dejar espacio para la vereda
            if (!isPositionOnRoad(x, z, -5.5)) {
                const h = heights[Math.floor(Math.random() * heights.length)];
                const w = step;
                const d = step;

                const bGroup = new THREE.Group();
                bGroup.position.set(x, 0, z);

                // Caja base
                const boxGeo = new THREE.BoxGeometry(w, h, d);
                const boxMat = new THREE.MeshLambertMaterial({ map: wallTexture });
                const boxMesh = new THREE.Mesh(boxGeo, boxMat);
                boxMesh.position.y = h / 2;
                bGroup.add(boxMesh);

                // Fachadas retro en las 4 caras
                for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 2) {
                    const facadeGeo = new THREE.PlaneGeometry(w, h);
                    const facadeMat = new THREE.MeshLambertMaterial({ 
                        map: facadeTextures[Math.floor(Math.random() * facadeTextures.length)],
                        side: THREE.DoubleSide
                    });
                    const facadeMesh = new THREE.Mesh(facadeGeo, facadeMat);
                    facadeMesh.position.y = h / 2;
                    facadeMesh.rotation.y = angle;
                    
                    const offset = d / 2 + 0.01;
                    facadeMesh.position.x = Math.sin(angle) * offset;
                    facadeMesh.position.z = Math.cos(angle) * offset;
                    bGroup.add(facadeMesh);
                }

                scene.add(bGroup);
                roadSegments.push({ group: bGroup });
            }
        }
    }

    // 4. Cerros lejanos al fondo (Eliminados a petición)
}

// Spawner de elementos del mapa
function spawnStaticMapElements(scene) {
    ROADS.forEach(r => {
        if (r.type === "vertical") {
            const length = r.endZ - r.startZ;
            for (let z = r.startZ + 20; z < r.endZ - 20; z += 40) {
                // Coleccionables
                const offset = (Math.random() > 0.5 ? 1 : -1) * (r.width / 4);
                spawnCoinAt(scene, r.x + offset, z);

                // Autos o baches
                if (Math.random() > 0.4) {
                    if (Math.random() > 0.5) {
                        spawnObstacleAt(scene, r.x - offset, z + 15, 'traffic');
                    } else {
                        spawnObstacleAt(scene, r.x - offset, z + 10, 'pothole');
                    }
                }
            }
        } else {
            const length = r.endX - r.startX;
            for (let x = r.startX + 20; x < r.endX - 20; x += 40) {
                const offset = (Math.random() > 0.5 ? 1 : -1) * (r.width / 4);
                spawnCoinAt(scene, x, r.z + offset);

                if (Math.random() > 0.4) {
                    if (Math.random() > 0.5) {
                        spawnObstacleAt(scene, x + 15, r.z - offset, 'traffic');
                    } else {
                        spawnObstacleAt(scene, x + 10, r.z - offset, 'pothole');
                    }
                }
            }
        }
    });
}

function spawnCoinAt(scene, x, z) {
    const geo = new THREE.CylinderGeometry(0.5, 0.5, 0.1, 8);
    geo.rotateX(Math.PI / 2);
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#eab308';
    ctx.fillRect(0, 0, 32, 32);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(6, 6, 20, 20);
    const tex = new THREE.CanvasTexture(canvas);
    tex.magFilter = THREE.NearestFilter;

    const coin = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ map: tex }));
    coin.position.set(x, 0.8, z);
    coin.userData = { lane: 0 };
    scene.add(coin);
    coinObjects.push(coin);
}

function spawnObstacleAt(scene, x, z, type) {
    let obs;
    if (type === 'traffic') {
        const carColor = Math.random() > 0.5 ? 0xfacc15 : 0x16a34a;
        obs = new THREE.Group();
        const bodyMat = new THREE.MeshLambertMaterial({ color: carColor });
        
        const body = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.2, 3.5), bodyMat);
        body.position.y = 0.8;
        obs.add(body);

        const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.8, 1.8), bodyMat);
        cabin.position.set(0, 1.6, -0.2);
        obs.add(cabin);

        const win = new THREE.Mesh(new THREE.BoxGeometry(1.52, 0.6, 1.4), new THREE.MeshLambertMaterial({ color: 0x0f172a }));
        win.position.set(0, 1.6, -0.2);
        obs.add(win);
        
        const wGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 8);
        wGeo.rotateZ(Math.PI / 2);
        const wMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
        const wp = [
            [0.9, 0.4, 1.0],
            [-0.9, 0.4, 1.0],
            [0.9, 0.4, -1.0],
            [-0.9, 0.4, -1.0]
        ];
        wp.forEach(p => {
            const w = new THREE.Mesh(wGeo, wMat);
            w.position.set(...p);
            obs.add(w);
        });

        obs.userData = { type: 'traffic', speed: 0, passed: false };
        obs.position.set(x, 0, z);
    } else {
        obs = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.05, 2.4), new THREE.MeshLambertMaterial({ color: 0x0c0a09 }));
        obs.position.set(x, 0.02, z);
        obs.userData = { type: 'pothole' };
    }
    scene.add(obs);
    obstacleObjects.push(obs);
}

export function cleanObstacle(scene, obs) {
    scene.remove(obs);
    obstacleObjects = obstacleObjects.filter(o => o !== obs);
}

export function cleanCoin(scene, coin) {
    scene.remove(coin);
    coinObjects = coinObjects.filter(c => c !== coin);
}

// Función mock para compatibilidad con importadores (motoEvent.js)
export function getRoadCurveX(z) {
    return 0;
}
