// generate_dataset_municipal_yau_500.js
// This script generates a synthetic dataset with 500 rows for the municipal Yau dataset.
// Run with `node generate_dataset_municipal_yau_500.js` from the project root.
const fs = require('fs');
const path = require('path');

const outputFile = path.join(__dirname, '..', '..', 'dataset_municipal_yau_500.csv');

const areas = [
  'Licencias',
  'Rentas y Comercialización',
  'Seguridad',
  'Servicios',
  'Recursos',
  'Planificación',
  'Salud',
  'Educación',
  'Infraestructura',
  'Medio Ambiente'
];

const priorities = ['Alta', 'Media', 'Baja'];

function randomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateText(priority, area, index) {
  // Simple synthetic text incorporating priority, area and an index.
  const verbs = {
    Alta: ['urgente', 'inmediato', 'imperativo'],
    Media: ['próximo', 'necesario', 'recomendado'],
    Baja: ['informativo', 'consultivo', 'general']
  }[priority];
  const actions = {
    Licencias: ['solicitud', 'requerimiento', 'petición'],
    'Rentas y Comercialización': ['consulta', 'actualización', 'pago'],
    Seguridad: ['inspección', 'reporte', 'denuncia'],
    Servicios: ['solicitud', 'reparación', 'instalación'],
    Recursos: ['petición', 'solicitud', 'consulta'],
    Planificación: ['requerimiento', 'solicitud', 'consulta'],
    Salud: ['inspección', 'certificado', 'consulta'],
    Educación: ['autorización', 'aprobación', 'consulta'],
    Infraestructura: ['permiso', 'consulta', 'reporte'],
    'Medio Ambiente': ['evaluación', 'autoridad', 'consulta']
  }[area];
  return `${priority} ${verbs[Math.floor(Math.random()*verbs.length)]} ${actions} para trámite ${area} número ${index}`;
}

let rows = [];
rows.push('prioridad,area_destino,texto');
for (let i = 1; i <= 500; i++) {
  const prioridad = priorities[(i - 1) % priorities.length];
  const area = areas[(i - 1) % areas.length];
  const texto = generateText(prioridad, area, i);
  rows.push(`${prioridad},${area},"${texto}"`);
}

fs.writeFileSync(outputFile, rows.join('\n'), 'utf8');
console.log(`Dataset generated with 500 rows at ${outputFile}`);
