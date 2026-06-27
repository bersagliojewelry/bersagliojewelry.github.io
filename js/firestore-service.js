/**
 * Bersaglio Jewelry — Firestore Service Layer
 *
 * Provides real-time sync for:
 *   - Pieces (products)
 *   - Collections (categories)
 *   - Reviews (customer ratings)
 *   - Subscriptions (email newsletter)
 *   - Inquiries (contact form leads)
 *
 * Falls back to static catalog.js data when Firestore is unavailable.
 */

import { firestoreDb } from './firebase-config.js';
import {
    collection,
    doc,
    getDocs,
    getDoc,
    getDocFromCache,
    getDocFromServer,
    addDoc,
    updateDoc,
    deleteDoc,
    setDoc,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp,
    runTransaction,
    Timestamp
} from 'firebase/firestore';
import { subscribeWithRetry } from './core/live-query.js';

// ─── Collection References ───────────────────────────────────────────────────

const COLLECTIONS = {
    pieces:        'pieces',
    collections:   'collections',
    journal:       'journal',
    siteContent:   'siteContent',
    reviews:       'reviews',
    subscriptions: 'subscriptions',
    inquiries:     'inquiries',
    config:        'config',
    system:        'system',
};

// ─── Hardening helpers ───────────────────────────────────────────────────────

/**
 * Auth context for audit logging. Set by the admin layer via setAuthContext.
 * We don't import auth.js here to keep this service Firestore-only.
 */
let _authContext = { uid: null, email: null, displayName: null };
export function setAuthContext(ctx) {
    _authContext = { ...(_authContext || {}), ...(ctx || {}) };
}

/**
 * Run an async operation with exponential backoff retry on transient
 * Firestore errors (unavailable / deadline-exceeded / aborted).
 * Permanent errors (not-found, permission-denied, version-conflict,
 * id-collision) are re-thrown immediately.
 */
const TRANSIENT = new Set(['unavailable', 'deadline-exceeded', 'aborted', 'cancelled', 'internal', 'resource-exhausted']);
export async function withRetry(fn, { attempts = 4, baseMs = 250 } = {}) {
    let lastErr;
    for (let i = 0; i < attempts; i++) {
        try {
            return await fn();
        } catch (err) {
            lastErr = err;
            const code = err?.code || '';
            const transient = TRANSIENT.has(code) || /network|offline|fetch/i.test(err?.message || '');
            if (!transient || i === attempts - 1) throw err;
            const wait = baseMs * Math.pow(2, i) + Math.floor(Math.random() * 100);
            await new Promise(r => setTimeout(r, wait));
        }
    }
    throw lastErr;
}

/**
 * Append an audit log entry under <collection>/<docId>/auditLog.
 * Best-effort: failures are logged but never block the main operation,
 * so a permission glitch on the audit subcollection cannot break a save.
 */
async function writeAuditLog(parentCollection, docId, entry) {
    try {
        const logRef = collection(firestoreDb, parentCollection, docId, 'auditLog');
        await addDoc(logRef, {
            ...entry,
            actorUid:         _authContext.uid || null,
            actorEmail:       _authContext.email || null,
            actorDisplayName: _authContext.displayName || null,
            timestamp:        serverTimestamp(),
        });
    } catch (err) {
        console.warn('[Firestore] auditLog write failed:', err?.message || err);
    }
}

/**
 * Bump the system/meta document timestamp so caches on public pages can
 * detect that data has changed and bust their localStorage. Best-effort.
 */
async function signalCacheInvalidation() {
    try {
        const ref = doc(firestoreDb, COLLECTIONS.system, 'meta');
        await setDoc(
            ref,
            { lastDataUpdate: serverTimestamp() },
            { merge: true }
        );
    } catch (err) {
        // Ignore — public pages have realtime listeners anyway.
        console.warn('[Firestore] cache invalidation signal failed:', err?.message || err);
    }
}

/**
 * Diff two plain objects, returning an array of {field, before, after}
 * entries for fields whose JSON serialization differs. Used to keep audit
 * log entries small and meaningful.
 */
function diffShallow(before, after) {
    const out = [];
    const keys = new Set([...Object.keys(before || {}), ...Object.keys(after || {})]);
    keys.forEach(k => {
        if (k === '_version' || k === 'updatedAt' || k === 'createdAt') return;
        const b = JSON.stringify(before?.[k] ?? null);
        const a = JSON.stringify(after?.[k] ?? null);
        if (b !== a) out.push({ field: k, before: before?.[k] ?? null, after: after?.[k] ?? null });
    });
    return out;
}

// ─── Motor genérico de documentos tipados (CMS · BLOQUEANTE #2 del comité) ──────
//
// pieces y collections tenían create/update/delete/onChange IDÉNTICOS salvo el
// nombre de colección. Factorizados aquí: una sola implementación del "envelope"
// (transacción + guarda de id-collision + _version + serverTimestamp + audit log +
// señal de cache) que TODO contenido público del CMS (journal/films/socialPosts…)
// reutiliza con ~1 línea de wrapper. Cero page-builder genérico: cada recurso es un
// doc tipado, este motor solo abstrae la mecánica de escritura segura compartida.
//
// Las firmas históricas (createPiece/onPiecesChange/…) se conservan como wrappers
// para no romper a sus consumidores (js/admin/db.js, js/core/data.js) — §3.2.

/**
 * Crea un doc tipado dentro de una transacción.
 * - FALLA con code 'id-collision' si ya existe un doc con ese id.
 * - Sella _version=1, createdBy/updatedBy y createdAt/updatedAt server-side.
 * - Best-effort: escribe entrada de auditoría y bumpea la señal de cache.
 */
export async function createTypedDoc(collName, docId, data) {
    const ref = doc(firestoreDb, collName, docId);

    await withRetry(() => runTransaction(firestoreDb, async tx => {
        const snap = await tx.get(ref);
        if (snap.exists()) {
            const err = new Error(`Doc "${docId}" already exists in ${collName}`);
            err.code  = 'id-collision';
            throw err;
        }
        tx.set(ref, {
            ...data,
            _version:  1,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            createdBy: _authContext.uid || null,
            updatedBy: _authContext.uid || null,
        });
    }));

    writeAuditLog(collName, docId, { action: 'create', version: 1, snapshot: data });
    signalCacheInvalidation();
}

/**
 * Actualiza un doc tipado dentro de una transacción con bloqueo optimista.
 * @param {object} [opts]
 * @param {number} [opts.expectedVersion] Si se pasa, la transacción aborta con
 *        code 'version-conflict' cuando el _version almacenado difiere (otra
 *        persona escribió el mismo doc). null/undefined = saltar el chequeo
 *        (p.ej. patches parciales de imágenes). Usa merge:true.
 * @returns {{version:number}}
 */
export async function updateTypedDoc(collName, docId, data, opts = {}) {
    const ref = doc(firestoreDb, collName, docId);
    const expectedVersion = opts.expectedVersion ?? null;

    let beforeData  = null;
    let nextVersion = 1;

    await withRetry(() => runTransaction(firestoreDb, async tx => {
        const snap = await tx.get(ref);
        if (!snap.exists()) {
            const err = new Error(`Doc "${docId}" does not exist in ${collName}`);
            err.code  = 'not-found';
            throw err;
        }
        beforeData = snap.data();
        const currentVersion = beforeData._version || 1;
        if (expectedVersion != null && expectedVersion !== currentVersion) {
            const err = new Error(`Version conflict on ${collName}/"${docId}" (expected ${expectedVersion}, got ${currentVersion}). Otra persona lo modificó antes que tú.`);
            err.code           = 'version-conflict';
            err.currentVersion = currentVersion;
            err.lastEditor     = beforeData.updatedBy || null;
            throw err;
        }
        nextVersion = currentVersion + 1;
        tx.set(ref, {
            ...data,
            _version:  nextVersion,
            updatedAt: serverTimestamp(),
            updatedBy: _authContext.uid || null,
        }, { merge: true });
    }));

    writeAuditLog(collName, docId, {
        action:  'update',
        version: nextVersion,
        changes: diffShallow(beforeData, { ...beforeData, ...data }),
    });
    signalCacheInvalidation();
    return { version: nextVersion };
}

/**
 * Elimina un doc tipado — captura un snapshot para el audit log ANTES de borrar
 * (así queda registro aun cuando el documento desaparece) y señala la cache.
 */
export async function deleteTypedDoc(collName, docId) {
    let snapshot = null;
    try {
        const snap = await getDoc(doc(firestoreDb, collName, docId));
        if (snap.exists()) snapshot = snap.data();
    } catch { /* best-effort */ }

    await withRetry(() => deleteDoc(doc(firestoreDb, collName, docId)));

    writeAuditLog(collName, docId, {
        action:  'delete',
        version: snapshot?._version || null,
        snapshot,
    });
    signalCacheInvalidation();
}

/**
 * Suscripción en tiempo real a una colección tipada.
 * @param {object} [opts]
 * @param {number} [opts.limit] Cota del listener (S3: escalabilidad). Sin límite
 *        = devuelve todo (colecciones chicas como `collections`).
 * @param {string} [opts.truncationLabel] Si se pasa Y el snapshot alcanza el
 *        límite, emite el evento `bj:truncado` (banner visible en el panel,
 *        spec §9.1 — el truncado NUNCA es mudo). Sin label = sin banner.
 * @returns {Function} unsubscribe
 */
export function onCollectionChange(collName, callback, { limit: lim, truncationLabel, constraints = [] } = {}) {
    const base = collection(firestoreDb, collName);
    const makeRef = () => {
        const parts = [...constraints];
        if (lim) parts.push(limit(lim));
        return parts.length ? query(base, ...parts) : base;
    };
    return subscribeWithRetry(makeRef, (snap) => {
        if (truncationLabel && lim && snap.size >= lim) {
            console.warn(`[Firestore] ${truncationLabel} truncado en ${lim} (S3).`);
            try { document.dispatchEvent(new CustomEvent('bj:truncado', { detail: { origen: truncationLabel, limite: lim } })); } catch { /* sin DOM */ }
        }
        callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, collName);
}

// ─── Pieces ──────────────────────────────────────────────────────────────────

/**
 * Get all pieces from Firestore
 */
export async function fetchPieces() {
    const snap = await getDocs(collection(firestoreDb, COLLECTIONS.pieces));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Get pieces by collection slug
 */
export async function fetchPiecesByCollection(collectionSlug) {
    const q = query(
        collection(firestoreDb, COLLECTIONS.pieces),
        where('collection', '==', collectionSlug)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Get a single piece by slug
 */
export async function fetchPieceBySlug(slug) {
    const q = query(
        collection(firestoreDb, COLLECTIONS.pieces),
        where('slug', '==', slug),
        limit(1)
    );
    const snap = await getDocs(q);
    return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
}

/**
 * Subscribe to real-time pieces updates.
 * S3: cota de 500 (con <500 piezas devuelve TODO; solo limita a escala).
 * TODO-40 v3 (D5): por defecto excluye las piezas `visibilidad:'privada'` — el público (anónimo)
 * NO las puede leer (regla read v3) y una query SIN filtro fallaría ENTERA si existe una privada.
 * El panel admin pasa `{ includePrivate:true }` (las gestiona; las lee vía isCatalogo en la regla).
 * @param {Function} callback - receives array of pieces on each change
 * @param {object} [opts] @param {boolean} [opts.includePrivate=false] admin = ve todas (incl. privadas)
 * @returns {Function} unsubscribe function
 */
export const onPiecesChange = (callback, { includePrivate = false } = {}) =>
    onCollectionChange(COLLECTIONS.pieces, callback, {
        limit: 500,
        constraints: includePrivate ? [] : [where('visibilidad', '!=', 'privada')],
    });

/**
 * Create a new piece (admin). Wrapper del motor genérico createTypedDoc:
 * transacción + guarda id-collision + _version + audit + señal de cache.
 */
export const createPiece = (pieceId, data) =>
    createTypedDoc(COLLECTIONS.pieces, pieceId, data);

/**
 * Update an existing piece (admin) con bloqueo optimista (opts.expectedVersion).
 * Wrapper del motor genérico updateTypedDoc (merge:true). @returns {{version}}.
 */
export const updatePiece = (pieceId, data, opts) =>
    updateTypedDoc(COLLECTIONS.pieces, pieceId, data, opts);

/**
 * Save or update a piece (admin). DEPRECATED: use createPiece / updatePiece.
 * Kept for backwards compatibility — now uses merge:true to avoid data loss.
 */
export async function savePiece(pieceId, data) {
    const ref = doc(firestoreDb, COLLECTIONS.pieces, pieceId);
    await setDoc(
        ref,
        { ...data, updatedAt: serverTimestamp() },
        { merge: true }
    );
}

/**
 * Delete a piece (admin) — wrapper del motor genérico deleteTypedDoc (snapshot
 * para el audit log antes de borrar + señal de cache).
 */
export const deletePiece = (pieceId) =>
    deleteTypedDoc(COLLECTIONS.pieces, pieceId);

// ─── Collections ─────────────────────────────────────────────────────────────

/**
 * Get all collections from Firestore
 */
export async function fetchCollections() {
    const snap = await getDocs(collection(firestoreDb, COLLECTIONS.collections));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Subscribe to real-time collections updates. Sin límite: `collections` es un
 * set chico (categorías) — devuelve todas.
 */
export const onCollectionsChange = (callback) =>
    onCollectionChange(COLLECTIONS.collections, callback);

/**
 * Create a new collection (admin) — wrapper del motor genérico createTypedDoc.
 */
export const createCollection = (colId, data) =>
    createTypedDoc(COLLECTIONS.collections, colId, data);

/**
 * Update an existing collection (admin) con bloqueo optimista
 * (opts.expectedVersion). Wrapper del motor genérico updateTypedDoc.
 */
export const updateCollection = (colId, data, opts) =>
    updateTypedDoc(COLLECTIONS.collections, colId, data, opts);

/**
 * Save or update a collection (admin). DEPRECATED: use
 * createCollection / updateCollection. Kept for backwards compatibility.
 */
export async function saveCollection(colId, data) {
    const ref = doc(firestoreDb, COLLECTIONS.collections, colId);
    await setDoc(
        ref,
        { ...data, updatedAt: serverTimestamp() },
        { merge: true }
    );
}

/**
 * Delete a collection (admin) — wrapper del motor genérico deleteTypedDoc.
 */
export const deleteCollection = (colId) =>
    deleteTypedDoc(COLLECTIONS.collections, colId);

// ─── Journal (CMS · entradas editoriales) ────────────────────────────────────
// El CRUD admin lo maneja el motor genérico createResourceAdmin directamente
// (createTypedDoc/updateTypedDoc/deleteTypedDoc con collection='journal'); aquí
// solo el READ en vivo para las páginas públicas (data.js). Cota 100 + banner.

/** Subscribe to real-time journal updates (público). @returns unsubscribe. */
export const onJournalChange = (callback) =>
    onCollectionChange(COLLECTIONS.journal, callback, { limit: 100, truncationLabel: 'Journal' });

// ─── SiteContent (CMS · textos de página, SINGLETONS) ────────────────────────
// Singletons de baja escritura (siteContent/{home,nosotros,contacto,global}) con
// sub-mapas por sección. Decisión de COSTO del gran plan §2.B: getDoc ONE-SHOT,
// NO onSnapshot (a 6+ páginas un listener permanente por página revienta Spark).

/** Lee el doc de contenido de una página (one-shot). null si no existe aún. */
export async function getSiteContent(page) {
    const snap = await getDoc(doc(firestoreDb, COLLECTIONS.siteContent, page));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/**
 * SWR (§110.2): lee el doc desde la CACHÉ local (instantáneo, sin red). LANZA si no está en
 * caché (FirebaseError 'unavailable') → el caller cae a la red. En páginas públicas la caché
 * es `persistentLocalCache` (§108 F1) → revisitas instantáneas; en admin/dev (memoria) = miss.
 */
export async function getSiteContentFromCache(page) {
    const snap = await getDocFromCache(doc(firestoreDb, COLLECTIONS.siteContent, page));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/** SWR (§110.2): revalida desde el SERVIDOR (1 lectura, igual costo que el getDoc previo §2.B). */
export async function getSiteContentFromServer(page) {
    const snap = await getDocFromServer(doc(firestoreDb, COLLECTIONS.siteContent, page));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/**
 * Upsert de un singleton de contenido (crea o fusiona). merge:true preserva los
 * sub-mapas no tocados; _version se incrementa atómicamente; audit log + señal de
 * cache como el motor genérico. Sin expectedVersion (editor único — Kary); el
 * bloqueo optimista se añade si entran varios editores.
 */
export async function saveSiteContent(page, data) {
    const ref = doc(firestoreDb, COLLECTIONS.siteContent, page);
    let nextVersion = 1;
    await withRetry(() => runTransaction(firestoreDb, async tx => {
        const snap = await tx.get(ref);
        nextVersion = (snap.exists() ? (snap.data()._version || 0) : 0) + 1;
        tx.set(ref, {
            ...data,
            _version:  nextVersion,
            updatedAt: serverTimestamp(),
            updatedBy: _authContext.uid || null,
            ...(snap.exists() ? {} : { createdAt: serverTimestamp(), createdBy: _authContext.uid || null }),
        }, { merge: true });
    }));
    writeAuditLog(COLLECTIONS.siteContent, page, { action: 'upsert', version: nextVersion, snapshot: data });
    signalCacheInvalidation();
    return { version: nextVersion };
}

// ─── Reviews ─────────────────────────────────────────────────────────────────

/**
 * Get reviews for a specific piece
 */
export async function fetchReviews(pieceSlug) {
    const q = query(
        collection(firestoreDb, COLLECTIONS.reviews),
        where('pieceSlug', '==', pieceSlug),
        where('approved', '==', true),
        orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Get all reviews (admin — includes unapproved)
 */
export async function fetchAllReviews() {
    const q = query(
        collection(firestoreDb, COLLECTIONS.reviews),
        orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Submit a new review
 */
export async function submitReview({ pieceSlug, pieceName, author, rating, comment, email }) {
    return addDoc(collection(firestoreDb, COLLECTIONS.reviews), {
        pieceSlug,
        pieceName,
        author,
        rating:    Number(rating),
        comment,
        email,
        approved:  false,     // requires admin approval
        createdAt: serverTimestamp()
    });
}

/**
 * Approve a review (admin)
 */
export async function approveReview(reviewId) {
    await updateDoc(doc(firestoreDb, COLLECTIONS.reviews, reviewId), {
        approved: true,
        approvedAt: serverTimestamp()
    });
}

/**
 * Delete a review (admin)
 */
export async function deleteReview(reviewId) {
    await deleteDoc(doc(firestoreDb, COLLECTIONS.reviews, reviewId));
}

/**
 * Subscribe to real-time reviews for a piece
 */
export function onReviewsChange(pieceSlug, callback) {
    const makeRef = () => query(
        collection(firestoreDb, COLLECTIONS.reviews),
        where('pieceSlug', '==', pieceSlug),
        where('approved', '==', true),
        orderBy('createdAt', 'desc')
    );
    return subscribeWithRetry(makeRef, snap => {
        callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, `reviews(${pieceSlug})`);
}

/**
 * Calculate aggregate rating for a piece
 */
export async function getAggregateRating(pieceSlug) {
    const reviews = await fetchReviews(pieceSlug);
    if (!reviews.length) return null;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return {
        ratingValue: (sum / reviews.length).toFixed(1),
        ratingCount: reviews.length,
        bestRating:  5
    };
}

// ─── Subscriptions (Email Newsletter) ────────────────────────────────────────

/**
 * Subscribe an email to the newsletter
 */
export async function addSubscription(email) {
    const q = query(
        collection(firestoreDb, COLLECTIONS.subscriptions),
        where('email', '==', email),
        limit(1)
    );
    const existing = await getDocs(q);
    if (!existing.empty) return { status: 'already_subscribed' };

    await addDoc(collection(firestoreDb, COLLECTIONS.subscriptions), {
        email,
        source:    'website_modal',
        createdAt: serverTimestamp(),
        active:    true
    });
    return { status: 'subscribed' };
}

// ─── Inquiries (Contact / WhatsApp leads) ────────────────────────────────────

/**
 * Save a contact inquiry
 */
export async function saveInquiry({ name, email, phone, message, pieceSlug, source }) {
    return addDoc(collection(firestoreDb, COLLECTIONS.inquiries), {
        name,
        email,
        phone,
        message,
        pieceSlug: pieceSlug || null,
        source:    source || 'web',
        status:    'nuevo',   // entra al pipeline de la Bandeja (F4, ADR §53)
        createdAt: serverTimestamp()
    });
}

/**
 * Get all inquiries (admin)
 */
export async function fetchInquiries() {
    const q = query(
        collection(firestoreDb, COLLECTIONS.inquiries),
        orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Subscribe to real-time inquiries updates
 */
export function onInquiriesChange(callback) {
    const makeRef = () => query(
        collection(firestoreDb, COLLECTIONS.inquiries),
        orderBy('createdAt', 'desc'),
        limit(500)   // S3: 500 leads más recientes (cota de escalabilidad del listener admin)
    );
    return subscribeWithRetry(makeRef, snap => {
        // Spec §9.1: el truncado NUNCA es mudo — banner visible en el panel
        // (js/admin/truncado.js escucha; en el sitio público no hay listener = no-op).
        if (snap.size >= 500) {
            console.warn('[Firestore] inquiries truncado en 500 (S3): la Bandeja muestra solo los 500 leads más recientes.');
            try { document.dispatchEvent(new CustomEvent('bj:truncado', { detail: { origen: 'Bandeja (leads)', limite: 500 } })); } catch { /* sin DOM */ }
        }
        callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, 'inquiries');
}

/**
 * Update an inquiry (partial update)
 */
export async function updateInquiry(inquiryId, data) {
    const ref = doc(firestoreDb, COLLECTIONS.inquiries, inquiryId);
    await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
}

/**
 * Delete an inquiry (admin)
 */
export async function deleteInquiry(inquiryId) {
    await deleteDoc(doc(firestoreDb, COLLECTIONS.inquiries, inquiryId));
}

// ─── Firestore Health Check ──────────────────────────────────────────────────

/**
 * Check if Firestore is reachable
 * @returns {boolean}
 */
export async function isFirestoreAvailable() {
    try {
        const ref = doc(firestoreDb, COLLECTIONS.config, 'status');
        await getDoc(ref);
        return true;
    } catch {
        return false;
    }
}
