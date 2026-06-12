/**
 * Bersaglio — CENSO read-only de movimientos en PROD (evidencia pre-deploy M3).
 *
 * Antes de desplegar el candado (whitelist hasOnly en CREATE + tabla de predicados
 * en anulación + cotas de fecha) se censa el universo REAL de documentos:
 *   1. TODAS las claves presentes (¿hay claves fuera de la whitelist? — informativo:
 *      la whitelist es SOLO de CREATE, pero el censo confirma la asunción),
 *   2. docs sin `anulado` (la regla usa resource.data.get('anulado', false)),
 *   3. formatos/valores de `fecha` (¿fechas futuras o absurdas YA en el libro?),
 *   4. montos no enteros / tipos fuera de la lista.
 * Consejo Externo M3 (Gemini, punto 4) + síntesis: evidencia, no suposición.
 *
 * USO (L-23, ADC): node functions/censo-movimientos-m3.mjs   (NO escribe nada)
 */
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const emuVars = ['FIRESTORE_EMULATOR_HOST', 'FIREBASE_AUTH_EMULATOR_HOST'].filter((v) => process.env[v]);
if (emuVars.length) { console.error(`⛔ Variables de emulador activas (${emuVars.join(', ')}) — este censo es de PROD.`); process.exit(1); }

initializeApp({ credential: applicationDefault(), projectId: 'bersaglio-jewelry' });
const db = getFirestore();

const WHITELIST_M3 = new Set(['tipo', 'monto', 'descripcion', 'fecha', 'registradoPor', 'registradoEn',
    'anulado', 'motivo', 'nota', 'solicitudId', 'correccionDe', 'vencimiento', 'medioPago',
    // claves de ANULACIÓN (las pone el update permitido, no el create):
    'anuladoPor', 'anuladoEn', 'motivoAnulacion', 'motivoCategoria', 'corregidoPor']);
const TIPOS = new Set(['factura', 'abono', 'apertura', 'ajuste']);
const ISO = /^\d{4}-\d{2}-\d{2}$/;
const hoy = new Date(); hoy.setDate(hoy.getDate() + 2);
const TECHO = hoy.toISOString().slice(0, 10);
const PISO = '2015-01-01';

const snap = await db.collectionGroup('movimientos').get();
const claves = new Map();           // clave → conteo
let total = 0, sinAnulado = 0, sinFecha = 0, fechaMala = 0, fechaFuera = 0, montoNoEntero = 0, tipoRaro = 0;
const ejemplosFuera = [];

for (const d of snap.docs) {
    total++;
    const m = d.data();
    for (const k of Object.keys(m)) claves.set(k, (claves.get(k) || 0) + 1);
    if (!('anulado' in m)) sinAnulado++;
    if (!('fecha' in m)) sinFecha++;
    else if (!ISO.test(String(m.fecha))) { fechaMala++; ejemplosFuera.push(`${d.ref.path} fecha="${m.fecha}"`); }
    else if (m.fecha < PISO || m.fecha > TECHO) { fechaFuera++; ejemplosFuera.push(`${d.ref.path} fecha=${m.fecha}`); }
    if (typeof m.monto !== 'number' || !Number.isInteger(m.monto)) montoNoEntero++;
    if (!TIPOS.has(m.tipo)) { tipoRaro++; ejemplosFuera.push(`${d.ref.path} tipo="${m.tipo}"`); }
}

console.log(`\n📊 CENSO de movimientos en PROD — ${total} documentos\n`);
console.log('Claves presentes (clave → docs):');
for (const [k, n] of [...claves.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${WHITELIST_M3.has(k) ? '✅' : '🔴 FUERA DE WHITELIST'} ${k}: ${n}`);
}
console.log(`\nSin campo 'anulado' (la regla usa .get('anulado', false)): ${sinAnulado}`);
console.log(`Sin 'fecha' (legacy, caen al fallback fechaCorte): ${sinFecha}`);
console.log(`Fecha con formato NO-ISO: ${fechaMala}`);
console.log(`Fecha fuera de cotas [${PISO} … ${TECHO}]: ${fechaFuera}`);
console.log(`Monto no entero: ${montoNoEntero}`);
console.log(`Tipo fuera de {factura,abono,apertura,ajuste}: ${tipoRaro}`);
if (ejemplosFuera.length) { console.log('\nEjemplos a revisar:'); ejemplosFuera.slice(0, 12).forEach((e) => console.log('  ·', e)); }
console.log('\n(Censo read-only: ninguna escritura.)\n');
