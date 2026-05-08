/**
 * Bersaglio Jewelry — Public data layer (read-only Firestore wrapper).
 *
 * Páginas públicas SOLO leen — admin escribe. Esta capa abstrae las
 * suscripciones onSnapshot en una API simple:
 *
 *   await data.load()                 → kick off listeners + resolve when first snapshot arrives
 *   data.getCollections()             → array of collection docs (admin-managed)
 *   data.getAll()                     → all pieces
 *   data.getFeatured(limit?)          → pieces where featured=true
 *   data.getByCollection(slug)        → pieces in given collection
 *   data.getBySlug(slug)              → single piece by slug or id (or null)
 *   data.getJournal()                 → array of journal entries
 *   data.getEntryBySlug(slug)         → single journal entry
 *   data.onChange(cb)                 → subscribe; returns unsubscribe
 *   data.isReady()                    → true after first load
 *
 * Internamente coalesce las notifications en un rAF: una avalancha de
 * snapshot updates triggers UN SOLO render cycle.
 */

import { onPiecesChange, onCollectionsChange } from '../firestore-service.js';

class PublicData {
    constructor() {
        this._pieces = [];
        this._collections = [];
        this._journal = [];          // futuro — fase 2 con admin-journal
        this._listeners = new Set();
        this._loaded = false;
        this._loadPromise = null;
        this._unsubPieces = null;
        this._unsubCols = null;
        this._notifyScheduled = false;
        this._initialPieces = false;
        this._initialCols = false;
    }

    /** Returns a promise that resolves once first snapshot of pieces+collections arrives. */
    async load() {
        if (this._loadPromise) return this._loadPromise;

        this._loadPromise = (async () => {
            try {
                let resolveFirst;
                const firstSnapshot = new Promise(r => { resolveFirst = r; });
                const maybeResolve = () => {
                    if (this._initialPieces && this._initialCols) resolveFirst();
                };

                this._unsubPieces = onPiecesChange(pieces => {
                    this._pieces = pieces;
                    this._initialPieces = true;
                    this._notify();
                    maybeResolve();
                });

                this._unsubCols = onCollectionsChange(cols => {
                    this._collections = cols;
                    this._initialCols = true;
                    this._notify();
                    maybeResolve();
                });

                // Safety: 4s timeout to unblock first paint even if Firestore is slow.
                await Promise.race([
                    firstSnapshot,
                    new Promise(r => setTimeout(r, 4000)),
                ]);

                this._loaded = true;
                if (typeof console !== 'undefined') {
                    console.info(`[data] live: ${this._pieces.length} piezas, ${this._collections.length} colecciones`);
                }
            } catch (err) {
                console.warn('[data] load failed:', err);
            }
            return this;
        })();

        return this._loadPromise;
    }

    isReady() { return this._loaded; }

    // ─── Getters ───────────────────────────────────────────────────────────

    getCollections(featuredOnly = false) {
        return featuredOnly
            ? this._collections.filter(c => c.featured)
            : [...this._collections];
    }

    getAll() { return [...this._pieces]; }

    getFeatured(limit = Infinity) {
        const list = this._pieces.filter(p => p.featured);
        return Number.isFinite(limit) ? list.slice(0, limit) : list;
    }

    getByCollection(slug) {
        return this._pieces.filter(p => p.collection === slug);
    }

    getBySlug(slug) {
        return this._pieces.find(p => p.slug === slug || p.id === slug) || null;
    }

    countByCollection(slug) {
        return this._pieces.filter(p => p.collection === slug).length;
    }

    getJournal() { return [...this._journal]; }
    getEntryBySlug(slug) {
        return this._journal.find(e => e.slug === slug) || null;
    }

    // ─── Realtime ──────────────────────────────────────────────────────────

    onChange(cb) {
        this._listeners.add(cb);
        return () => this._listeners.delete(cb);
    }

    /** Coalesce listener callbacks within an animation frame. */
    _notify() {
        if (this._notifyScheduled) return;
        this._notifyScheduled = true;
        const flush = () => {
            this._notifyScheduled = false;
            for (const cb of this._listeners) {
                try { cb(); } catch (e) { console.error('[data] listener error:', e); }
            }
        };
        if (typeof requestAnimationFrame === 'function') {
            requestAnimationFrame(flush);
        } else {
            setTimeout(flush, 0);
        }
    }
}

export const data = new PublicData();
export default data;
