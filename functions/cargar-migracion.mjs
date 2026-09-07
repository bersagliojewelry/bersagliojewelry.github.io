/**
 * Cargador de la migración Fase A: clientes DIRECTOS de Kary (su hoja del Kardex es
 * por cliente y limpia). Por cada cliente crea su doc + un movimiento de APERTURA con
 * su saldo a la fecha de corte. La Cloud Function recalcula saldoActual = apertura.
 *
 * Lee tools/migracion-kary.json (lo genera tools/extraer-kardex.py; LOCAL, gitignored).
 * Idempotente: si ya hay clientes con la marca de migración, aborta (salvo --force).
 *
 *   Emulador (test): FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 CUTOFF=2026-06-12 node functions/cargar-migracion.mjs
 *   Prod (real):     (con credenciales) CUTOFF=<fecha que defina Kary> node functions/cargar-migracion.mjs
 */
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { readFileSync } from 'node:fs';

const CUTOFF = process.env.CUTOFF || '2026-06-12';   // placeholder; la define Kary
const FORCE = process.argv.includes('--force');
const MARKER = 'kardex-kary-2026';

initializeApp({ projectId: 'bersaglio-jewelry' });
const db = getFirestore();

const data = JSON.parse(readFileSync('tools/migracion-kary.json', 'utf8'));
console.log(`Fase A: ${data.length} clientes de Kary | fecha de corte: ${CUTOFF}`);

const existing = await db.collection('clientes').where('migracion', '==', MARKER).limit(1).get();
if (!existing.empty && !FORCE) {
    console.log(`Ya hay clientes con marca '${MARKER}'. Aborta (usa --force para repetir).`);
    process.exit(0);
}

const creados = [];
for (const c of data) {
    const saldo = Math.round((Number(c.saldo) || 0) * 100) / 100;
    const cliRef = await db.collection('clientes').add({
        nombre: (c.nombre || 'Sin nombre').trim(),
        origen: 'kary',
        activo: true,
        migracion: MARKER,
        createdAt: FieldValue.serverTimestamp(),
    });
    await cliRef.collection('movimientos').add({
        tipo: 'apertura',
        monto: saldo,
        descripcion: 'Saldo inicial (migración Kardex)',
        fecha: CUTOFF,
        registradoPor: 'migracion',
        registradoEn: FieldValue.serverTimestamp(),
        anulado: false,
    });
    creados.push({ id: cliRef.id, esperado: saldo });
}
console.log(`Creados ${creados.length} clientes + aperturas. Esperando a la Cloud Function (recálculo de saldos)…`);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let matched = 0;
for (let intento = 0; intento < 30; intento++) {
    await sleep(2500);
    matched = 0; let pending = 0; const mism = [];
    for (const c of creados) {
        const s = (await db.collection('clientes').doc(c.id).get()).data()?.saldoActual;
        if (typeof s !== 'number') { pending++; continue; }
        if (Math.round(s * 100) / 100 === c.esperado) matched++;
        else mism.push({ got: s, exp: c.esperado });
    }
    console.log(`  intento ${intento + 1}: ${matched}/${creados.length} cuadran · ${pending} pendientes · ${mism.length} desajustes`);
    if (pending === 0) {
        if (mism.length) console.log('  ⚠️ desajustes (muestra):', mism.slice(0, 5));
        break;
    }
}
console.log(matched === creados.length
    ? `✅ OK: los ${matched} saldos cuadran EXACTO con el Excel.`
    : `⚠️ Revisar: ${matched}/${creados.length} cuadran.`);
process.exit(0);
