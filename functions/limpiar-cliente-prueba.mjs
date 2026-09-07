/**
 * Bersaglio — Verificación + LIMPIEZA de una clienta de PRUEBA (smoke M3 y futuros).
 *
 * Doble candado anti-error: exige --id explícito Y que el nombre del doc contenga
 * "PRUEBA" (jamás borra una clienta real). Con --verificar audita los movimientos
 * contra el contract M3 (campos sellados) antes de borrar.
 *
 * USO (L-23, ADC):
 *   node functions/limpiar-cliente-prueba.mjs --id=<docId> --verificar   (read-only)
 *   node functions/limpiar-cliente-prueba.mjs --id=<docId> --limpiar
 */
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const emuVars = ['FIRESTORE_EMULATOR_HOST', 'FIREBASE_AUTH_EMULATOR_HOST'].filter((v) => process.env[v]);
if (emuVars.length) { console.error(`⛔ Variables de emulador activas — este script es de PROD.`); process.exit(1); }

const idArg = process.argv.find((a) => a.startsWith('--id='));
const ID = idArg ? idArg.slice(5) : null;
const VERIFICAR = process.argv.includes('--verificar');
const LIMPIAR = process.argv.includes('--limpiar');
if (!ID || (!VERIFICAR && !LIMPIAR)) {
    console.error('Uso: --id=<docId> y --verificar o --limpiar'); process.exit(1);
}

initializeApp({ credential: applicationDefault(), projectId: 'bersaglio-jewelry' });
const db = getFirestore();
const ref = db.collection('clientes').doc(ID);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const snap = await ref.get();
if (!snap.exists) { console.log('ℹ️ El doc no existe.'); process.exit(0); }
const nombre = snap.data().nombre || '';
if (!nombre.toUpperCase().includes('PRUEBA')) {
    console.error(`⛔ CANDADO: "${nombre}" no contiene "PRUEBA" — este script solo borra clientas de ensayo.`);
    process.exit(1);
}

if (VERIFICAR) {
    const movs = (await ref.collection('movimientos').get()).docs.map((d) => ({ id: d.id, ...d.data() }));
    console.log(`\n📋 ${nombre} — saldoActual=${snap.data().saldoActual} · ${movs.length} movimientos:\n`);
    for (const m of movs) {
        const sellos = [
            m.registradoEn?.toDate ? 'registradoEn:server' : '⛔ registradoEn',
            /^\d{4}-\d{2}-\d{2}$/.test(m.fecha || '') ? `fecha:${m.fecha}` : '⛔ fecha',
            m.tipo === 'abono' ? (m.medioPago ? `medioPago:${m.medioPago}` : '⛔ SIN medioPago') : null,
            m.tipo === 'ajuste' ? (m.motivo && m.nota ? `motivo:${m.motivo}+nota` : '⛔ SIN motivo/nota') : null,
            m.anulado ? `ANULADO cat:${m.motivoCategoria || '⛔'} por:${m.anuladoPor ? 'uid' : '⛔'}` : 'vigente',
        ].filter(Boolean).join(' · ');
        console.log(`  ${m.tipo} $${(m.monto || 0).toLocaleString('es-CO')} → ${sellos}`);
    }
    process.exit(0);
}

await db.recursiveDelete(ref);
console.log('🧹 recursiveDelete ejecutado. Vigilando el fantasma del trigger (8s)…');
await sleep(8000);
for (let i = 0; i < 3; i++) {
    const ghost = await ref.get();
    if (!ghost.exists) break;
    console.log(`👻 Doc resucitado (intento ${i + 1}) — borrando de nuevo…`);
    await ref.delete();
    await sleep(4000);
}
const fin = await ref.get();
const movsFin = await ref.collection('movimientos').limit(1).get();
if (!fin.exists && movsFin.empty) console.log('✅ Limpieza VERIFICADA: cero rastro.\n');
else { console.error('⛔ Quedaron restos — re-correr --limpiar.'); process.exit(1); }
