/**
 * Bersaglio — Backfill ÚNICO de códigos públicos de pedido (§166, comité ×3).
 *
 * Asigna `codigo` (BJ-XXXX-XXXX) a los pedidos creados ANTES de la CF con código, escribiendo
 * EN LA MISMA transacción el campo del pedido Y su reserva en `codigosPedido/{codigo}` — sin el
 * doc índice, la garantía de no-repetición quedaría con huecos (falla P1 del comité).
 * IDEMPOTENTE: un pedido que ya tiene `codigo` se salta (re-correr jamás regenera un código ya
 * comunicado a un cliente).
 *
 * USO (L-23: autentica por ADC, no por `firebase login`):
 *   node functions/backfill-codigos.mjs            → PREFLIGHT (solo lectura: plan)
 *   node functions/backfill-codigos.mjs --aplicar  → escribe y verifica
 */
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { generarCodigoPedido } = require('./pedidos-core.js');

const APLICAR = process.argv.includes('--aplicar');

// Guardia anti-destino-equivocado (patrón backfill-claims §65): vars de emulador vivas en la
// shell harían que el Admin SDK escriba en el EMULADOR creyendo que es prod. Abortar.
const emuVars = ['FIRESTORE_EMULATOR_HOST', 'FIREBASE_AUTH_EMULATOR_HOST'].filter((v) => process.env[v]);
if (emuVars.length) {
    console.error(`\n⛔ Hay variables de EMULADOR activas (${emuVars.join(', ')}). Este script opera sobre PRODUCCIÓN.\n   Abre una shell limpia (sin esas vars) y vuelve a intentar.\n`);
    process.exit(1);
}

console.log(`\n→ Destino: PROYECTO REAL bersaglio-jewelry (ADC).`);
initializeApp({ credential: applicationDefault(), projectId: 'bersaglio-jewelry' });
const db = getFirestore();

const snap = await db.collection('pedidos').get();
const sinCodigo = snap.docs.filter((d) => !d.data().codigo);
console.log(`\n— Backfill de códigos (${APLICAR ? 'APLICAR' : 'preflight, solo lectura'}) — ${snap.size} pedido(s), ${sinCodigo.length} sin código\n`);

for (const doc of snap.docs) {
    const p = doc.data();
    if (p.codigo) { console.log(`  ✓ #${p.numero ?? '?'} (${doc.id.slice(0, 8)}…) ya tiene ${p.codigo} — intacto`); continue; }
    if (!APLICAR) { console.log(`  → #${p.numero ?? '?'} (${doc.id.slice(0, 8)}…) recibiría un código BJ-XXXX-XXXX`); continue; }

    // Transacción por pedido: reservar código único + escribirlo en el pedido, atómico.
    const codigo = await db.runTransaction(async (tx) => {
        const fresco = await tx.get(doc.ref);
        if (fresco.data().codigo) return fresco.data().codigo;        // carrera/re-corrida → intacto
        for (let i = 0; i < 5; i++) {
            const cand = generarCodigoPedido();
            const ref = db.doc(`codigosPedido/${cand}`);
            const existe = (await tx.get(ref)).exists;
            if (existe) continue;
            tx.update(doc.ref, { codigo: cand });
            tx.set(ref, { pedidoId: doc.id, at: FieldValue.serverTimestamp(), backfill: true });
            return cand;
        }
        throw new Error(`5 colisiones seguidas para ${doc.id} — improbable, revisar codigosPedido`);
    });
    console.log(`  ✔ #${p.numero ?? '?'} (${doc.id.slice(0, 8)}…) → ${codigo}`);
}

if (APLICAR) {
    // Verificación post-escritura: todo pedido con código Y todo código con su reserva.
    const post = await db.collection('pedidos').get();
    const huerfanos = [];
    for (const d of post.docs) {
        const c = d.data().codigo;
        if (!c) { huerfanos.push(`${d.id} SIN código`); continue; }
        const idx = await db.doc(`codigosPedido/${c}`).get();
        if (!idx.exists || idx.data().pedidoId !== d.id) huerfanos.push(`${d.id} código ${c} sin reserva coherente`);
    }
    console.log(huerfanos.length
        ? `\n⛔ VERIFICACIÓN FALLÓ:\n  ${huerfanos.join('\n  ')}\n`
        : `\n✅ Verificado: ${post.size}/${post.size} pedidos con código + reserva coherente en codigosPedido.\n`);
    process.exit(huerfanos.length ? 1 : 0);
}
console.log(`\n(preflight — nada escrito; corre con --aplicar para ejecutar)\n`);
