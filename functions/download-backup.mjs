/**
 * Bersaglio — descarga el backup más reciente de prod (Storage → archivo local).
 * Uso (desde functions/):  node download-backup.mjs [fecha YYYY-MM-DD]
 * Sin fecha → baja el más reciente de backups/firestore/. Solo LEE de prod (cero riesgo).
 */
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { initializeApp } = require('firebase-admin/app');
const { getStorage } = require('firebase-admin/storage');

initializeApp({ projectId: 'bersaglio-jewelry', storageBucket: 'bersaglio-jewelry.firebasestorage.app' });

const PREFIX = 'backups/firestore/';
const fecha = process.argv[2] || null;

let bucket = getStorage().bucket();
let files;
try {
    [files] = await bucket.getFiles({ prefix: PREFIX });
} catch (e) {
    // bucket por defecto puede ser .appspot.com en proyectos antiguos
    bucket = getStorage().bucket('bersaglio-jewelry.appspot.com');
    [files] = await bucket.getFiles({ prefix: PREFIX });
}

if (!files.length) {
    console.error(`No hay backups en ${bucket.name}/${PREFIX} — ¿ya corrió backupDiario?`);
    process.exit(1);
}

const candidatos = fecha ? files.filter((f) => f.name.includes(fecha)) : files;
if (!candidatos.length) { console.error(`No hay backup para ${fecha}`); process.exit(1); }
const ultimo = candidatos.sort((a, b) => a.name.localeCompare(b.name)).at(-1);

const destino = ultimo.name.split('/').at(-1);
await ultimo.download({ destination: destino });
const [meta] = await ultimo.getMetadata();
console.log(`✅ ${bucket.name}/${ultimo.name} → ${destino} (${Math.round(meta.size / 1024)} KB, ${meta.metadata?.totalDocs || '?'} docs)`);
console.log(`Siguiente: node restore-backup.mjs ${destino} --target bersaglio-gemelo`);
