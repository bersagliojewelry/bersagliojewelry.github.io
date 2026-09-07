#!/usr/bin/env node
/**
 * Bersaglio Jewelry — MIGRACIÓN: Inventario v3 (TODO-40 · Fase 1 · Bloque 1).
 *
 * Backfilea las piezas YA cargadas al modelo multi-tipo v3 ANTES de activar la CF que decrementa
 * `cantidad` (si no, `increment(-1)` sobre una cantidad ausente → -1 → la pieza desaparece tras la 1ª
 * venta; el comité v2 lo marcó como EL entregable de F1, C1). Idempotente, re-ejecutable, DRY-RUN por defecto.
 *
 * Mapea (lógica PURA y testeada → js/admin/inventario-model.js · tests/inventario-migracion.test.mjs):
 *   stockType-2 + refabricable(bool) → stockType-3 {finito, finito_refabricable, encargo}
 *   cantidad   → finito*: vendida-legacy→0 · ya-int→respeta · ausente→1 | encargo→null
 *   visibilidad→ 'publica' a todo legacy (fail-closed: 'ausente' no debe existir en prod)
 *   `estado` NO se toca (el SSG legacy aún lee estado=='vendida'; lo migra el Bloque 5).
 *
 * GATE de despliegue (no actives la CF de decremento si esto reporta violaciones):
 *   0 piezas finito* con cantidad==null · 0 con (estado=='vendida' && cantidad>0).
 *
 * Uso:
 *   node scripts/migrate-inventario-v3.mjs            # DRY-RUN: reporta qué haría + verifica invariantes
 *   node scripts/migrate-inventario-v3.mjs --apply    # ESCRIBE los campos en Firestore
 *
 * Auth: Admin SDK con ADC (`gcloud auth application-default login` o GOOGLE_APPLICATION_CREDENTIALS).
 */
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { migrarPiezaV3, violacionesInvariantes } from '../js/admin/inventario-model.js';

const APPLY   = process.argv.includes('--apply');
const PROJECT = 'bersaglio-jewelry';

initializeApp({ credential: applicationDefault(), projectId: PROJECT });
const db = getFirestore();

(async () => {
    console.log(`Migración Inventario v3 · ${APPLY ? 'APPLY (ESCRIBE)' : 'DRY-RUN (solo reporta)'} · proyecto ${PROJECT}\n`);
    const snap = await db.collection('pieces').get();

    let total = 0, migradas = 0, yaOk = 0, fallos = 0;
    const violaciones = [];   // {id, problemas[]} tras aplicar (estado resultante)

    for (const doc of snap.docs) {
        total++;
        const data = doc.data();
        const { cambio, cambios, stockType, cantidad } = migrarPiezaV3(data);

        // Estado RESULTANTE = original + cambios (para verificar invariantes del comité).
        const resultante = { ...data, stockType, cantidad: stockType === 'encargo' ? null : cantidad };
        const problemas = violacionesInvariantes(resultante);
        if (problemas.length) violaciones.push({ id: doc.id, problemas });

        if (!cambio) { yaOk++; continue; }
        migradas++;
        const resumen = Object.entries(cambios).map(([k, v]) => `${k}=${v}`).join(', ');
        if (APPLY) {
            try {
                await doc.ref.set(cambios, { merge: true });
                console.log(`  ✅ ${doc.id} · ${resumen}`);
            } catch (e) { fallos++; console.warn(`  ⚠️  ${doc.id}: ${e.message}`); }
        } else {
            console.log(`  [dry-run] ${doc.id} · ${resumen}`);
        }
    }

    console.log(`\n${total} piezas · ${migradas} a migrar · ${yaOk} ya en v3 · ${fallos} fallos.`);

    // GATE de invariantes (post-estado-resultante).
    if (violaciones.length) {
        console.error(`\n🔴 GATE FALLA: ${violaciones.length} pieza(s) violan invariantes — NO actives la CF de decremento:`);
        violaciones.forEach(v => console.error(`   · ${v.id}: ${v.problemas.join(' · ')}`));
        process.exit(2);
    }
    console.log('✅ GATE OK: cero violaciones de invariantes (sin finito*-sin-cantidad, sin vendida-con-stock).');
    if (!APPLY && migradas > 0) console.log('\n  → si se ve bien, corre:  node scripts/migrate-inventario-v3.mjs --apply');
    process.exit(0);
})().catch(e => {
    console.error('\n[FATAL]', e.message);
    if (/credential|auth|ADC|default/i.test(e.message)) {
        console.error('  → Falta autenticación. Corre:  gcloud auth application-default login');
    }
    process.exit(1);
});
