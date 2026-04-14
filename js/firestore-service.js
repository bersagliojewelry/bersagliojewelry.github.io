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
    addDoc,
    updateDoc,
    deleteDoc,
    setDoc,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    serverTimestamp,
    runTransaction,
    Timestamp
} from 'firebase/firestore';

// ─── Collection References ───────────────────────────────────────────────────

const COLLECTIONS = {
    pieces:        'pieces',
    collections:   'collections',
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
 * Subscribe to real-time pieces updates
 * @param {Function} callback - receives array of pieces on each change
 * @returns {Function} unsubscribe function
 */
export function onPiecesChange(callback) {
    return onSnapshot(
        collection(firestoreDb, COLLECTIONS.pieces),
        snap => {
            const pieces = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            callback(pieces);
        },
        err => console.warn('[Firestore] pieces listener error:', err)
    );
}

/**
 * Create a new piece (admin) inside a Firestore transaction.
 * - FAILS with code 'id-collision' if a document with the same ID exists.
 * - Stamps _version=1, createdBy and createdAt server-side.
 * - Best-effort writes an audit log entry and bumps the cache signal.
 */
export async function createPiece(pieceId, data) {
    const ref = doc(firestoreDb, COLLECTIONS.pieces, pieceId);

    await withRetry(() => runTransaction(firestoreDb, async tx => {
        const snap = await tx.get(ref);
        if (snap.exists()) {
            const err = new Error(`Piece id "${pieceId}" already exists`);
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

    writeAuditLog(COLLECTIONS.pieces, pieceId, {
        action:  'create',
        version: 1,
        snapshot: data,
    });
    signalCacheInvalidation();
}

/**
 * Update an existing piece (admin) inside a Firestore transaction with
 * optimistic locking.
 *
 * @param {string} pieceId
 * @param {object} data
 * @param {object} [opts]
 * @param {number} [opts.expectedVersion]  If provided, the transaction
 *        aborts with code 'version-conflict' when the stored _version is
 *        different — meaning another admin saved the same piece in the
 *        meantime. Pass null/undefined to skip the check (e.g. for
 *        partial image-only patches).
 *
 * Uses setDoc({merge:true}) so untouched fields stay intact, increments
 * _version atomically, and writes an audit log entry with the diff.
 */
export async function updatePiece(pieceId, data, opts = {}) {
    const ref = doc(firestoreDb, COLLECTIONS.pieces, pieceId);
    const expectedVersion = opts.expectedVersion ?? null;

    let beforeData = null;
    let nextVersion = 1;

    await withRetry(() => runTransaction(firestoreDb, async tx => {
        const snap = await tx.get(ref);
        if (!snap.exists()) {
            const err = new Error(`Piece id "${pieceId}" does not exist`);
            err.code  = 'not-found';
            throw err;
        }
        beforeData = snap.data();
        const currentVersion = beforeData._version || 1;
        if (expectedVersion != null && expectedVersion !== currentVersion) {
            const err = new Error(`Version conflict on piece "${pieceId}" (expected ${expectedVersion}, got ${currentVersion}). Otra persona modificó la pieza antes que tú.`);
            err.code = 'version-conflict';
            err.currentVersion  = currentVersion;
            err.lastEditor      = beforeData.updatedBy || null;
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

    writeAuditLog(COLLECTIONS.pieces, pieceId, {
        action:  'update',
        version: nextVersion,
        changes: diffShallow(beforeData, { ...beforeData, ...data }),
    });
    signalCacheInvalidation();
    return { version: nextVersion };
}

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
 * Delete a piece (admin) — writes an audit log entry first so we keep a
 * record even after the document disappears.
 */
export async function deletePiece(pieceId) {
    let snapshot = null;
    try {
        const snap = await getDoc(doc(firestoreDb, COLLECTIONS.pieces, pieceId));
        if (snap.exists()) snapshot = snap.data();
    } catch { /* best-effort */ }

    await withRetry(() => deleteDoc(doc(firestoreDb, COLLECTIONS.pieces, pieceId)));

    writeAuditLog(COLLECTIONS.pieces, pieceId, {
        action:  'delete',
        version: snapshot?._version || null,
        snapshot,
    });
    signalCacheInvalidation();
}

// ─── Collections ─────────────────────────────────────────────────────────────

/**
 * Get all collections from Firestore
 */
export async function fetchCollections() {
    const snap = await getDocs(collection(firestoreDb, COLLECTIONS.collections));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Subscribe to real-time collections updates
 */
export function onCollectionsChange(callback) {
    return onSnapshot(
        collection(firestoreDb, COLLECTIONS.collections),
        snap => {
            const cols = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            callback(cols);
        },
        err => console.warn('[Firestore] collections listener error:', err)
    );
}

/**
 * Create a new collection (admin) — transactional, with audit log and
 * cache invalidation. See createPiece for the full pattern.
 */
export async function createCollection(colId, data) {
    const ref = doc(firestoreDb, COLLECTIONS.collections, colId);

    await withRetry(() => runTransaction(firestoreDb, async tx => {
        const snap = await tx.get(ref);
        if (snap.exists()) {
            const err = new Error(`Collection id "${colId}" already exists`);
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

    writeAuditLog(COLLECTIONS.collections, colId, {
        action:  'create',
        version: 1,
        snapshot: data,
    });
    signalCacheInvalidation();
}

/**
 * Update an existing collection (admin) with optimistic locking.
 * @param {object} [opts] - {expectedVersion} same semantics as updatePiece.
 */
export async function updateCollection(colId, data, opts = {}) {
    const ref = doc(firestoreDb, COLLECTIONS.collections, colId);
    const expectedVersion = opts.expectedVersion ?? null;

    let beforeData  = null;
    let nextVersion = 1;

    await withRetry(() => runTransaction(firestoreDb, async tx => {
        const snap = await tx.get(ref);
        if (!snap.exists()) {
            const err = new Error(`Collection id "${colId}" does not exist`);
            err.code  = 'not-found';
            throw err;
        }
        beforeData = snap.data();
        const currentVersion = beforeData._version || 1;
        if (expectedVersion != null && expectedVersion !== currentVersion) {
            const err = new Error(`Version conflict on collection "${colId}" (expected ${expectedVersion}, got ${currentVersion}). Otra persona modificó la colección antes que tú.`);
            err.code = 'version-conflict';
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

    writeAuditLog(COLLECTIONS.collections, colId, {
        action:  'update',
        version: nextVersion,
        changes: diffShallow(beforeData, { ...beforeData, ...data }),
    });
    signalCacheInvalidation();
    return { version: nextVersion };
}

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
 * Delete a collection (admin) — captures a snapshot for the audit log
 * before deletion and signals cache invalidation afterwards.
 */
export async function deleteCollection(colId) {
    let snapshot = null;
    try {
        const snap = await getDoc(doc(firestoreDb, COLLECTIONS.collections, colId));
        if (snap.exists()) snapshot = snap.data();
    } catch { /* best-effort */ }

    await withRetry(() => deleteDoc(doc(firestoreDb, COLLECTIONS.collections, colId)));

    writeAuditLog(COLLECTIONS.collections, colId, {
        action:  'delete',
        version: snapshot?._version || null,
        snapshot,
    });
    signalCacheInvalidation();
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
    const q = query(
        collection(firestoreDb, COLLECTIONS.reviews),
        where('pieceSlug', '==', pieceSlug),
        where('approved', '==', true),
        orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, snap => {
        callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
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
        source:    source || 'website',
        status:    'new',
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
    const q = query(
        collection(firestoreDb, COLLECTIONS.inquiries),
        orderBy('createdAt', 'desc')
    );
    return onSnapshot(q,
        snap => {
            const inquiries = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            callback(inquiries);
        },
        err => console.warn('[Firestore] inquiries listener error:', err)
    );
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
