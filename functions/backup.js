/**
 * Bersaglio — backup diario de Firestore (F6 / PRE-1, plan §57 semana 1).
 *
 * Función programada (3:00 AM America/Bogota): vuelca TODA la base (incluidas
 * subcolecciones) a un JSON comprimido en el bucket por defecto del proyecto
 * (`backups/firestore/backup-YYYY-MM-DD.json.gz`) y borra copias > RETENTION_DIAS.
 *
 * Diseño zero-budget deliberado (§3.6): a esta escala (cientos de docs) un dump
 * JSON vía Admin SDK NO necesita IAM extra (el SA por defecto ya lee Firestore y
 * escribe Storage) y es restaurable/legible con `restore-backup.mjs` (gemelo).
 * El export gestionado oficial (gcloud/import API + PITR) queda como upgrade path
 * si la escala lo exige. Limitación conocida: documentos "fantasma" (borrados pero
 * con subcolecciones vivas) no se recorren — no existen en este modelo de datos.
 */
'use strict';

const { onSchedule } = require('firebase-functions/v2/scheduler');
const { getFirestore } = require('firebase-admin/firestore');
const { getStorage } = require('firebase-admin/storage');
const { gzipSync } = require('node:zlib');
const { serializeValue } = require('./backup-codec');

const RETENTION_DIAS = 30;
const PREFIX = 'backups/firestore/';

async function dumpFirestore(db) {
    const docs = [];
    async function dumpCollection(colRef) {
        const snap = await colRef.get();
        for (const doc of snap.docs) {
            docs.push({ path: doc.ref.path, data: serializeValue(doc.data()) });
            const subcols = await doc.ref.listCollections();
            for (const sub of subcols) await dumpCollection(sub);
        }
    }
    const cols = await db.listCollections();
    for (const col of cols) await dumpCollection(col);
    return docs;
}

exports.backupDiario = onSchedule({
    schedule: '0 3 * * *',
    timeZone: 'America/Bogota',
    region: 'us-central1',
    timeoutSeconds: 540,
    memory: '512MiB',
    retryCount: 2,
    maxInstances: 1,
}, async () => {
    const db = getFirestore();
    const bucket = getStorage().bucket();

    const docs = await dumpFirestore(db);
    if (docs.length === 0) {
        // Una base vacía jamás debe sobreescribir la rotación con un backup hueco.
        throw new Error('[backupDiario] dump vacío — se aborta para no rotar copias buenas');
    }

    const fecha = new Date().toISOString().slice(0, 10);
    const payload = {
        exportedAt: new Date().toISOString(),
        project: process.env.GCLOUD_PROJECT || 'bersaglio-jewelry',
        totalDocs: docs.length,
        docs,
    };
    const file = bucket.file(`${PREFIX}backup-${fecha}.json.gz`);
    await file.save(gzipSync(JSON.stringify(payload)), {
        contentType: 'application/gzip',
        resumable: false,
        metadata: { metadata: { totalDocs: String(docs.length) } },
    });

    // Retención: borrar copias con más de RETENTION_DIAS días.
    const [files] = await bucket.getFiles({ prefix: PREFIX });
    const limite = Date.now() - RETENTION_DIAS * 24 * 60 * 60 * 1000;
    const viejos = files.filter((f) => new Date(f.metadata.timeCreated).getTime() < limite);
    await Promise.all(viejos.map((f) => f.delete()));

    console.log(`[backupDiario] ${docs.length} docs → ${file.name} · ${viejos.length} copia(s) > ${RETENTION_DIAS}d borrada(s)`);
});

exports._dumpFirestore = dumpFirestore; // expuesto para test de integración futuro
