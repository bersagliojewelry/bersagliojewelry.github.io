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
    Timestamp
} from 'firebase/firestore';

// ─── Collection References ───────────────────────────────────────────────────

const COLLECTIONS = {
    pieces:        'pieces',
    collections:   'collections',
    reviews:       'reviews',
    subscriptions: 'subscriptions',
    inquiries:     'inquiries',
    config:        'config'
};

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
 * Save or update a piece (admin)
 */
export async function savePiece(pieceId, data) {
    const ref = doc(firestoreDb, COLLECTIONS.pieces, pieceId);
    await setDoc(ref, { ...data, updatedAt: serverTimestamp() }, { merge: true });
}

/**
 * Delete a piece (admin)
 */
export async function deletePiece(pieceId) {
    await deleteDoc(doc(firestoreDb, COLLECTIONS.pieces, pieceId));
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
 * Save or update a collection (admin)
 */
export async function saveCollection(colId, data) {
    const ref = doc(firestoreDb, COLLECTIONS.collections, colId);
    await setDoc(ref, { ...data, updatedAt: serverTimestamp() }, { merge: true });
}

/**
 * Delete a collection (admin)
 */
export async function deleteCollection(colId) {
    await deleteDoc(doc(firestoreDb, COLLECTIONS.collections, colId));
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
