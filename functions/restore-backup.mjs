/**
 * Bersaglio — restauración de un backup JSON.gz al GEMELO o al emulador (PRE-1).
 *
 * Uso (desde functions/, donde vive firebase-admin):
 *   node restore-backup.mjs <archivo.json.gz> --target <projectId>
 *   node restore-backup.mjs <archivo.json.gz> --target demo-bersaglio --emulator 127.0.0.1:8080
 *
 * SEGURO POR DISEÑO: se NIEGA a escribir sobre el proyecto de producción
 * (bersaglio-jewelry) salvo `--force-prod` explícito — restaurar sobre prod
 * es la operación más peligrosa del runbook y exige decisión consciente.
 */
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, Timestamp, GeoPoint } = require('firebase-admin/firestore');
const { deserializeValue } = require('./backup-codec.js');

const PROD_PROJECT = 'bersaglio-jewelry';

const args = process.argv.slice(2);
const archivo = args[0];
const target = args.includes('--target') ? args[args.indexOf('--target') + 1] : null;
const emulator = args.includes('--emulator') ? args[args.indexOf('--emulator') + 1] : null;
const forceProd = args.includes('--force-prod');

if (!archivo || !target) {
    console.error('Uso: node restore-backup.mjs <backup.json.gz> --target <projectId> [--emulator host:puerto] [--force-prod]');
    process.exit(1);
}
if (target === PROD_PROJECT && !forceProd) {
    console.error(`⛔ Te niegas a restaurar sobre PRODUCCIÓN (${PROD_PROJECT}) sin --force-prod. ¿Seguro que no querías el gemelo?`);
    process.exit(1);
}
if (emulator) process.env.FIRESTORE_EMULATOR_HOST = emulator;

initializeApp({ projectId: target });
const db = getFirestore();

const revivers = {
    timestamp: (s, n) => new Timestamp(s, n),
    ref: (p) => db.doc(p),
    geo: (la, lo) => new GeoPoint(la, lo),
    bytes: (b64) => Buffer.from(b64, 'base64'),
};

const payload = JSON.parse(gunzipSync(readFileSync(archivo)).toString());
console.log(`Backup de ${payload.project} · exportado ${payload.exportedAt} · ${payload.totalDocs} docs`);
console.log(`Restaurando a "${target}"${emulator ? ` (emulador ${emulator})` : ''}…`);

let batch = db.batch();
let enBatch = 0;
let total = 0;
for (const d of payload.docs) {
    batch.set(db.doc(d.path), deserializeValue(d.data, revivers));
    enBatch++; total++;
    if (enBatch === 400) {                         // límite Firestore: 500 ops/batch
        await batch.commit();
        batch = db.batch();
        enBatch = 0;
        process.stdout.write(`  ${total}/${payload.totalDocs}\r`);
    }
}
if (enBatch > 0) await batch.commit();
console.log(`✅ Restaurados ${total}/${payload.totalDocs} documentos en "${target}".`);
console.log('Verifica: abre el panel/consola del target y confirma clientes + saldos en pantalla.');
