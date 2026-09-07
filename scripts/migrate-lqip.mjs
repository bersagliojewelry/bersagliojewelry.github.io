#!/usr/bin/env node
/**
 * Bersaglio Jewelry — MIGRACIÓN: backfill de LQIP (placeholder difuso) · §108 F3.
 *
 * PROCESO DE MIGRACIÓN del lado SERVIDOR (Admin SDK + sharp): genera el LQIP de las
 * imágenes YA cargadas en el CMS SIN re-subirlas (sin CORS, sin trabajo manual, escala).
 * Idempotente (salta lo ya migrado), re-ejecutable, DRY-RUN por defecto.
 *
 * Por qué existe (directiva de Daniel 2026-06-23): un cambio de plataforma NUNCA debe
 * exigir re-subir todo a mano. Cada corrección/implementación trae su migración. Este es
 * el patrón: `scripts/migrate-*.mjs`. Para una migración nueva, copia este archivo y cambia
 * TARGETS + la transformación.
 *
 * Uso:
 *   node scripts/migrate-lqip.mjs            # DRY-RUN: solo reporta qué haría
 *   node scripts/migrate-lqip.mjs --apply    # ESCRIBE los LQIP en Firestore
 *
 * Auth: Admin SDK con ADC (corre `gcloud auth application-default login`, o define
 *       GOOGLE_APPLICATION_CREDENTIALS). La MISMA credencial que usan los deploys.
 */
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import sharp from 'sharp';

const APPLY          = process.argv.includes('--apply');
const PROJECT        = 'bersaglio-jewelry';
const BUCKET         = 'bersaglio-jewelry.firebasestorage.app';
const LQIP_MAX_PX    = 40;     // espejo de js/image-optimizer.js makeLqip
const LQIP_MAX_CHARS = 6000;
const BATCH          = 10;     // imágenes en paralelo por lote

// Objetivos: (colección · cómo sacar la URL de la imagen principal · campo donde va el LQIP).
// Extender aquí (journal/films/socialPosts) cuando su render use LQIP — el patrón ya escala.
const TARGETS = [
    { coll: 'pieces',      imageOf: d => (d.images && d.images[0]) || d.image || '', lqipField: 'imageLqip'  },
    { coll: 'collections', imageOf: d => d.bannerUrl || d.img || '',                 lqipField: 'bannerLqip' },
];

initializeApp({
    credential:    applicationDefault(),
    storageBucket: BUCKET,
    projectId:     PROJECT,
});
const db     = getFirestore();
const bucket = getStorage().bucket();

/** Extrae el path de Storage de una downloadURL de Firebase (.../o/<ENCODED_PATH>?...). */
function storagePath(url) {
    if (!url || typeof url !== 'string') return null;
    if (!url.startsWith('http')) return url;
    try {
        const m = new URL(url).pathname.match(/\/o\/(.+)$/);
        return m ? decodeURIComponent(m[1]) : null;
    } catch { return null; }
}

/** Baja la imagen de Storage y genera el LQIP (data-URI webp) con sharp. '' si falla. */
async function makeLqipFromStorage(url) {
    const path = storagePath(url);
    if (!path) return '';
    try {
        const [buf] = await bucket.file(path).download();
        const out = await sharp(buf)
            .resize({ width: LQIP_MAX_PX, height: LQIP_MAX_PX, fit: 'inside', withoutEnlargement: true })
            .webp({ quality: 50 })
            .toBuffer();
        const uri = `data:image/webp;base64,${out.toString('base64')}`;
        return uri.length <= LQIP_MAX_CHARS ? uri : '';
    } catch (e) {
        console.warn(`  ⚠️  no se pudo procesar ${path}: ${e.message}`);
        return '';
    }
}

async function migrateTarget(t) {
    console.log(`\n=== ${t.coll} (campo ${t.lqipField}) ===`);
    const snap = await db.collection(t.coll).get();
    let total = 0, conImagen = 0, yaTiene = 0, generados = 0, fallos = 0;
    const pend = [];
    snap.forEach(doc => {
        total++;
        const url = t.imageOf(doc.data());
        if (!url) return;
        conImagen++;
        if (doc.data()[t.lqipField]) { yaTiene++; return; }   // idempotente: salta lo ya migrado
        pend.push({ id: doc.id, url });
    });
    console.log(`  ${total} docs · ${conImagen} con imagen · ${yaTiene} ya con LQIP · ${pend.length} a migrar`);

    for (let i = 0; i < pend.length; i += BATCH) {
        await Promise.all(pend.slice(i, i + BATCH).map(async ({ id, url }) => {
            const lqip = await makeLqipFromStorage(url);
            if (!lqip) { fallos++; return; }
            generados++;
            if (APPLY) {
                await db.collection(t.coll).doc(id).update({ [t.lqipField]: lqip });
                console.log(`  ✅ ${id} (${(lqip.length / 1024).toFixed(1)} KB)`);
            } else {
                console.log(`  [dry-run] ${id} → generaría LQIP (${(lqip.length / 1024).toFixed(1)} KB)`);
            }
        }));
    }
    console.log(`  → ${generados} LQIP ${APPLY ? 'ESCRITOS' : 'simulados'}, ${fallos} fallos.`);
    return { generados, fallos };
}

(async () => {
    console.log(`Migración LQIP · ${APPLY ? 'APPLY (ESCRIBE)' : 'DRY-RUN (solo reporta)'} · proyecto ${PROJECT}`);
    let g = 0, f = 0;
    for (const t of TARGETS) {
        try { const r = await migrateTarget(t); g += r.generados; f += r.fallos; }
        catch (e) { console.error(`[error] ${t.coll}: ${e.message}`); }
    }
    console.log(`\n${APPLY ? '✓ Migración aplicada' : '✓ Dry-run completo'}: ${g} LQIP, ${f} fallos.`);
    if (!APPLY && g > 0) console.log('  → si se ve bien, corre:  node scripts/migrate-lqip.mjs --apply');
    process.exit(0);
})().catch(e => {
    console.error('\n[FATAL]', e.message);
    if (/credential|auth|ADC|default/i.test(e.message)) {
        console.error('  → Falta autenticación. Corre:  gcloud auth application-default login');
    }
    process.exit(1);
});
