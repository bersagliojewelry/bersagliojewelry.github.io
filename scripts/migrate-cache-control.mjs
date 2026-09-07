#!/usr/bin/env node
/**
 * Bersaglio Jewelry — MIGRACIÓN: backfill de Cache-Control en Storage · §112 (F3 de §108.10).
 *
 * PROCESO DE MIGRACIÓN del lado SERVIDOR (Admin SDK): pone `Cache-Control` largo a las imágenes
 * YA cargadas en Storage SIN re-subirlas. Sin esto, Firebase las sirve `private, max-age=0` →
 * el navegador REVALIDA en cada visita → la imagen nunca sale instantánea de caché → el blur
 * (LQIP) se ve en TODAS las visitas, no solo la 1ª (bug reportado por Daniel 2026-06-23).
 *
 * Por qué es seguro cachear "para siempre": la downloadURL de Firebase se versiona por TOKEN
 * (cada (re)subida genera un token nuevo → URL nueva). Una foto actualizada = URL nueva = el
 * navegador la baja de nuevo (blur 1 vez), y las viejas quedan instantáneas. = lo que pidió Daniel.
 *
 * Idempotente (salta lo que ya tiene el cacheControl correcto), re-ejecutable, DRY-RUN por defecto.
 *
 * Uso:
 *   node scripts/migrate-cache-control.mjs            # DRY-RUN: solo reporta qué haría
 *   node scripts/migrate-cache-control.mjs --apply    # ESCRIBE el cacheControl en los objetos
 *
 * Auth: Admin SDK con ADC / SA key (GOOGLE_APPLICATION_CREDENTIALS) — la MISMA de migrate-lqip.
 */
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';

const APPLY        = process.argv.includes('--apply');
const PROJECT      = 'bersaglio-jewelry';
const BUCKET       = 'bersaglio-jewelry.firebasestorage.app';
const TARGET_CC    = 'public, max-age=31536000';   // espejo de _upload en js/storage-service.js
const BATCH        = 10;

initializeApp({ credential: applicationDefault(), storageBucket: BUCKET, projectId: PROJECT });
const bucket = getStorage().bucket();

(async () => {
    console.log(`Migración Cache-Control · ${APPLY ? 'APPLY (ESCRIBE)' : 'DRY-RUN (solo reporta)'} · ${BUCKET}`);
    console.log(`  objetivo: Cache-Control: "${TARGET_CC}"\n`);

    const [files] = await bucket.getFiles();
    // Solo imágenes (las que motivan el blur); ignora otros assets por seguridad.
    const imgs = files.filter(f => (f.metadata.contentType || '').startsWith('image/'));
    let total = imgs.length, yaOk = 0, aMigrar = 0, hechos = 0, fallos = 0;
    const pend = [];
    for (const f of imgs) {
        if (f.metadata.cacheControl === TARGET_CC) { yaOk++; continue; }
        aMigrar++;
        pend.push(f);
    }
    console.log(`  ${total} imágenes · ${yaOk} ya correctas · ${pend.length} a migrar`);

    for (let i = 0; i < pend.length; i += BATCH) {
        await Promise.all(pend.slice(i, i + BATCH).map(async (f) => {
            const was = f.metadata.cacheControl ?? '(sin)';
            if (APPLY) {
                try {
                    await f.setMetadata({ cacheControl: TARGET_CC });
                    hechos++;
                    console.log(`  ✅ ${f.name}  (${was} → ${TARGET_CC})`);
                } catch (e) { fallos++; console.warn(`  ⚠️  ${f.name}: ${e.message}`); }
            } else {
                console.log(`  [dry-run] ${f.name}  (${was} → ${TARGET_CC})`);
            }
        }));
    }

    console.log(`\n${APPLY ? '✓ Migración aplicada' : '✓ Dry-run completo'}: ${APPLY ? hechos : pend.length} ${APPLY ? 'escritos' : 'simulados'}, ${fallos} fallos.`);
    if (!APPLY && pend.length > 0) console.log('  → si se ve bien, corre:  node scripts/migrate-cache-control.mjs --apply');
    process.exit(0);
})().catch(e => {
    console.error('\n[FATAL]', e.message);
    if (/credential|auth|ADC|default/i.test(e.message)) {
        console.error('  → Falta autenticación. Define GOOGLE_APPLICATION_CREDENTIALS o corre gcloud auth application-default login');
    }
    process.exit(1);
});
