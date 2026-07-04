#!/usr/bin/env node
/**
 * Bersaglio Jewelry — FIX de datos: piezas 0954/0994 trocadas (reporte de Daniel 2026-07-03).
 *
 * La carga masiva cruzó la IDENTIDAD (nombre+descripción+slug) entre dos piezas; foto/specs/
 * código/colección quedaron juntos y correctos pero en el doc del OTRO slug:
 *   - `pieces/topos-rubi-natural-0994` contiene la PULSERA real (21 rubíes · 7.344 gr · code 0954)
 *   - `pieces/pulsera-rubi-natural-0954` contiene los TOPOS reales (2 rubíes+20 diamantes · 2.722 gr · code 0994)
 * (Verificado: screenshot del dueño + descarga visual de ambas fotos + specs coherentes.)
 *
 * Fix: INTERCAMBIAR entre ambos docs los campos que viajan con la pieza física
 * (code, collection, specs, image, images, imageLqip) para que cada slug/URL quede con su
 * pieza coherente. Nombre/descripción NO se tocan (ya coinciden con el slug). Transacción
 * atómica + guard del estado cruzado esperado (aborta si alguien ya lo corrigió).
 *
 * Residuo aceptado (documentado en ADR): las fotos quedan en la CARPETA Storage del otro doc
 * (URLs absolutas con token → funcionan); se normaliza re-subiendo la foto desde el admin.
 *
 * Uso:
 *   node scripts/fix-piezas-trocadas-0954-0994.mjs            # DRY-RUN: reporta qué haría
 *   node scripts/fix-piezas-trocadas-0954-0994.mjs --apply    # ESCRIBE (transacción atómica)
 *
 * Auth: Admin SDK con ADC (patrón migrate-inventario-v3.mjs · L-35: guardia anti-emulador).
 */
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

if (process.env.FIRESTORE_EMULATOR_HOST) {
    console.error('⛔ FIRESTORE_EMULATOR_HOST activo — este fix es para PROD. Aborta (L-35).');
    process.exit(1);
}

const APPLY   = process.argv.includes('--apply');
const PROJECT = 'bersaglio-jewelry';
const DOC_A   = 'pieces/topos-rubi-natural-0994';    // hoy: contenido de la PULSERA → debe quedar TOPOS
const DOC_B   = 'pieces/pulsera-rubi-natural-0954';  // hoy: contenido de los TOPOS → debe quedar PULSERA
const SWAP    = ['code', 'collection', 'specs', 'image', 'images', 'imageLqip'];

initializeApp({ credential: applicationDefault(), projectId: PROJECT });
const db = getFirestore();

(async () => {
    console.log(`Fix piezas trocadas 0954/0994 · ${APPLY ? 'APPLY (ESCRIBE)' : 'DRY-RUN'} · ${PROJECT}\n`);

    const resumen = d => ({ code: d.code, collection: d.collection, weight: d.specs?.weight, stone: (d.specs?.stone || '').slice(0, 40), img: (d.image || '').match(/pieces%2F([^%]+)%2F/)?.[1] });

    await db.runTransaction(async (tx) => {
        const [snapA, snapB] = await Promise.all([tx.get(db.doc(DOC_A)), tx.get(db.doc(DOC_B))]);
        if (!snapA.exists || !snapB.exists) throw new Error('Falta uno de los docs — aborta.');
        const a = snapA.data(), b = snapB.data();

        // GUARD: solo opera sobre el estado CRUZADO exacto que se diagnosticó.
        if (a.code !== '0954' || b.code !== '0994' || a.collection !== 'pulseras' || b.collection !== 'aretes') {
            throw new Error(`Estado inesperado (¿ya corregido?): A={code:${a.code},col:${a.collection}} B={code:${b.code},col:${b.collection}}`);
        }

        console.log('ANTES  A (topos-…-0994):', JSON.stringify(resumen(a)));
        console.log('ANTES  B (pulsera-…-0954):', JSON.stringify(resumen(b)));

        const updA = {}, updB = {};
        for (const k of SWAP) { updA[k] = b[k]; updB[k] = a[k]; }   // cruce programático, sin transcribir
        updA._version = (a._version || 0) + 1;
        updB._version = (b._version || 0) + 1;
        updA.updatedAt = FieldValue.serverTimestamp();
        updB.updatedAt = FieldValue.serverTimestamp();

        console.log('DESPUÉS A (topos-…-0994):', JSON.stringify(resumen(updA)));
        console.log('DESPUÉS B (pulsera-…-0954):', JSON.stringify(resumen(updB)));

        if (!APPLY) { console.log('\nDRY-RUN: no se escribió nada. Corre con --apply.'); return; }
        tx.update(db.doc(DOC_A), updA);
        tx.update(db.doc(DOC_B), updB);
    });

    if (APPLY) {
        // Verificación post-escritura (lee de vuelta y valida coherencia slug↔code).
        const [va, vb] = await Promise.all([db.doc(DOC_A).get(), db.doc(DOC_B).get()]);
        const okA = va.data().code === '0994' && va.data().collection === 'aretes';
        const okB = vb.data().code === '0954' && vb.data().collection === 'pulseras';
        console.log(`\nVERIFICACIÓN: A ${okA ? '✅' : '❌'} code=${va.data().code} · B ${okB ? '✅' : '❌'} code=${vb.data().code}`);
        process.exit(okA && okB ? 0 : 1);
    }
})().catch(err => { console.error('💥', err.message); process.exit(1); });
