/**
 * Bersaglio — ENCENDER acuerdos de pago (R6, plan §81). Escribe los 3 flags de
 * acuerdos en `config/cartera` con TIPOS correctos y los RE-LEE para verificar.
 * IDEMPOTENTE y NO destructivo: `merge:true` (jamás pisa otros campos del doc).
 *
 * CENSO de seguridad: ANTES de encender confirma que NO existe ningún acuerdo
 * 'vigente' en prod. El corte mensual corre con Admin SDK y SALTA las reglas del
 * mutex; un acuerdo preexistente (consola/SDK/legacy) contaminaría la evidencia
 * DIAN inmutable. Si encuentra alguno, ABORTA y pide investigar (blocker comité R6).
 *
 * Encender a MANO (consola) es peligroso: `config/cartera` no valida tipos de estos
 * campos, y un `acuerdosActivos:'true'` (string) pasa la regla owner pero la fórmula
 * lo trata como ausente → "bandera que parece on pero está off". Este script tipa y verifica.
 *
 * USO (L-23, ADC):
 *   node functions/encender-acuerdos.mjs            → preflight (config actual + censo, NO escribe)
 *   node functions/encender-acuerdos.mjs --aplicar  → enciende (solo si el censo está limpio)
 */
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const APLICAR = process.argv.includes('--aplicar');

// Guardia anti-destino-equivocado (espejo de seed-config-cartera.mjs): vars de
// emulador en la shell redirigen el Admin SDK SIN avisar — abortar, no adivinar.
const emuVars = ['FIRESTORE_EMULATOR_HOST', 'FIREBASE_AUTH_EMULATOR_HOST']
    .filter((v) => process.env[v]);
if (emuVars.length) {
    console.error(`\n⛔ Hay variables de EMULADOR activas (${emuVars.join(', ')}). Este script opera sobre PRODUCCIÓN.\n   Abre una shell limpia y vuelve a intentar.\n`);
    process.exit(1);
}

// Tipos EXACTOS que la fórmula/corte/panel esperan (bool / int / int).
const FLAGS = { acuerdosActivos: true, horizonteAcuerdoDias: 730, acuerdoIncumplidoCuotas: 2 };

console.log(`\n→ Destino: PROYECTO REAL bersaglio-jewelry (ADC).`);
initializeApp({ credential: applicationDefault(), projectId: 'bersaglio-jewelry' });
const db = getFirestore();
const ref = db.collection('config').doc('cartera');

const snap = await ref.get();
if (!snap.exists) {
    console.error('\n⛔ config/cartera NO existe. Corre primero `node functions/seed-config-cartera.mjs --aplicar`.\n');
    process.exit(1);
}
const cur = snap.data();
console.log('\nℹ️ Flags de acuerdos en config/cartera AHORA:');
console.log(JSON.stringify({
    acuerdosActivos: cur.acuerdosActivos ?? '(ausente)',
    horizonteAcuerdoDias: cur.horizonteAcuerdoDias ?? '(ausente)',
    acuerdoIncumplidoCuotas: cur.acuerdoIncumplidoCuotas ?? '(ausente)',
}, null, 2));

// CENSO: ningún acuerdo 'vigente' debe existir antes de encender.
const acuerdosSnap = await db.collectionGroup('acuerdos').get();
const vigentes = acuerdosSnap.docs.filter((d) => (d.data() || {}).estado === 'vigente');
console.log(`\n🔎 Censo de acuerdos en prod: ${acuerdosSnap.size} doc(s) total · ${vigentes.length} 'vigente'.`);
if (vigentes.length) {
    console.error('\n⛔ Hay acuerdos VIGENTES en prod con la feature apagada — INVESTIGAR antes de encender (el corte los cristalizaría en la evidencia DIAN). Rutas:');
    for (const d of vigentes.slice(0, 10)) console.error(`   - ${d.ref.path}`);
    process.exit(1);
}

if (!APLICAR) {
    console.log('\n— PREFLIGHT (censo limpio). Con --aplicar se escribiría (merge, sin pisar otros campos):');
    console.log(JSON.stringify(FLAGS, null, 2));
    process.exit(0);
}

await ref.set(FLAGS, { merge: true });
const after = (await ref.get()).data();
const ok = after.acuerdosActivos === true
    && Number.isInteger(after.horizonteAcuerdoDias) && after.horizonteAcuerdoDias === 730
    && Number.isInteger(after.acuerdoIncumplidoCuotas) && after.acuerdoIncumplidoCuotas === 2;
console.log('\n✍️ Escrito (merge). Verificación de tipos:');
console.log(JSON.stringify({
    acuerdosActivos: after.acuerdosActivos,
    horizonteAcuerdoDias: after.horizonteAcuerdoDias,
    acuerdoIncumplidoCuotas: after.acuerdoIncumplidoCuotas,
}, null, 2));
console.log(ok ? '\n✅ Acuerdos ENCENDIDOS con tipos correctos.\n' : '\n⛔ Algo quedó mal tipado — revisar.\n');
process.exit(ok ? 0 : 1);
