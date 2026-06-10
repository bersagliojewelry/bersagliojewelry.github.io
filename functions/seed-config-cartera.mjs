/**
 * Bersaglio — Seed ÚNICO de config/cartera (Fase M · M0, plan §69).
 *
 * Crea el doc de límites de la política de cartera v1 (APROBADA). IDEMPOTENTE Y
 * CONSERVADOR: si el doc YA existe, lo muestra y NO lo toca (los valores vivos
 * los gobierna Daniel vía la regla owner-only; este script jamás pisa).
 *
 * Las listas que las REGLAS validan en el camino diario (mediosPago,
 * resultadosGestion) van LITERALES en firestore.rules; aquí solo viven como
 * espejo para labels de UI (decisión C2 del comité).
 *
 * USO (L-23, ADC):
 *   node functions/seed-config-cartera.mjs            → preflight (muestra el plan)
 *   node functions/seed-config-cartera.mjs --aplicar  → crea el doc si NO existe
 */
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const APLICAR = process.argv.includes('--aplicar');

// Guardia anti-destino-equivocado (espejo de backfill-claims.mjs): vars de emulador
// en la shell redirigen el Admin SDK SIN avisar — abortar en vez de adivinar.
const emuVars = ['FIRESTORE_EMULATOR_HOST', 'FIREBASE_AUTH_EMULATOR_HOST']
    .filter((v) => process.env[v]);
if (emuVars.length) {
    console.error(`\n⛔ Hay variables de EMULADOR activas (${emuVars.join(', ')}). Este script opera sobre PRODUCCIÓN.\n   Abre una shell limpia y vuelve a intentar.\n`);
    process.exit(1);
}

const CARTERA = {
    // Tope del carril auto-aprobable de Kary (política A.2). PROVISIONAL: la
    // calibración M0 (2026-06-10) encontró CERO ajustes históricos (solo migración)
    // → se confirma con Daniel (pregunta 3) y se recalibra a 90 días de datos vivos.
    autoAprobacionMax: 50000,
    // Cadencia de revisión de Daniel en DÍAS (pregunta 2 — gate mecánico del
    // compromiso; null = aún sin responder, la UI de M4 no degrada hasta fijarlo).
    slaRevisionDias: null,
    // Motivos de AJUSTE (política A.4, lista cerrada).
    motivosAjuste: ['ERROR_REGISTRO', 'ABONO_NO_REGISTRADO', 'RECLASIFICACION',
                    'DEVOLUCION_PIEZA', 'DESCUENTO_AUTORIZADO', 'CASTIGO', 'OTRO'],
    // Neutros = los únicos auto-aprobables por Kary bajo el tope (política A.2).
    motivosNeutros: ['ERROR_REGISTRO', 'ABONO_NO_REGISTRADO', 'RECLASIFICACION'],
    // Motivos de ANULACIÓN (M3; CORRECCION/CORRECCION_FECHA enlazan el par).
    motivosAnulacion: ['ERROR_REGISTRO', 'DUPLICADO', 'CORRECCION', 'CORRECCION_FECHA',
                       'DEVOLUCION_PIEZA', 'OTRO'],
    // Plazo default del fiado en días (pregunta 1 a Kary: ¿30 o 90?). Hoy espeja
    // config/negocio.diasPlazo (30) para no cambiar la mora vigente.
    plazoDefault: 30,
    // Criterios de candidatura a castigo (política C + M7).
    criteriosCastigo: {
        moraDias: 360,
        sinAbonosDias: 180,
        gestionesMin: 3,
        gestionesMesesDistintos: 3,
        materialidadAbonoPct: 1,      // % del saldo: un abono menor NO resetea el reloj
        materialidadAbonoPiso: 10000, // piso absoluto en COP
    },
    // Espejos SOLO para labels de UI (las reglas llevan estas listas LITERALES).
    mediosPago: ['efectivo', 'transferencia', 'datafono', 'otro'],
    resultadosGestion: ['promesa_pago', 'sin_acuerdo', 'no_contesto', 'numero_invalido', 'otro'],
    creadoEn: FieldValue.serverTimestamp(),
    fuente: 'politica-cartera-v1 (aprobada 2026-06-09) · seed M0 plan §69',
};

console.log(`\n→ Destino: PROYECTO REAL bersaglio-jewelry (ADC).`);
initializeApp({ credential: applicationDefault(), projectId: 'bersaglio-jewelry' });
const ref = getFirestore().collection('config').doc('cartera');

const snap = await ref.get();
if (snap.exists) {
    console.log('\nℹ️ config/cartera YA existe — NO se toca (lo gobierna Daniel, owner-only). Valores vivos:');
    console.log(JSON.stringify(snap.data(), null, 2));
    process.exit(0);
}

if (!APLICAR) {
    console.log('\n— PREFLIGHT (no existe el doc; esto es lo que se crearía con --aplicar):');
    console.log(JSON.stringify({ ...CARTERA, creadoEn: '(serverTimestamp)' }, null, 2));
    process.exit(0);
}

await ref.set(CARTERA);
const creado = await ref.get();
console.log(`\n✍️ config/cartera CREADO y verificado (${Object.keys(creado.data()).length} campos).\n`);
