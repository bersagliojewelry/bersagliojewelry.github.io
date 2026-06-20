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

import { onPiecesChange, onCollectionsChange, onJournalChange, onCollectionChange, getSiteContent as fetchSiteContent } from '../firestore-service.js';
import { piecesOfCollection, collectionOfPiece } from './collection-match.js';

class PublicData {
    constructor() {
        this._pieces = [];
        this._collections = [];
        this._journal = [];          // CMS: entradas del journal (live Firestore)
        this._films = [];            // CMS: videos del home (live Firestore, lazy)
        this._social = [];           // CMS: posts de redes del home (live Firestore, lazy)
        this._siteContent = {};      // CMS: textos de página (singletons, getDoc cacheado)
        this._listeners = new Set();
        this._loaded = false;
        this._loadPromise = null;
        this._unsubPieces = null;
        this._unsubCols = null;
        this._unsubJournal = null;
        this._unsubFilms = null;
        this._unsubSocial = null;
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

                // Journal: NO va aquí. B4 (comité): suscribirlo en load() lo activaba
                // en CADA página pública (catálogo/pieza/carrito…) que no lo usa →
                // listener inútil que quema lecturas de Spark. Ahora es lazy/opt-in:
                // solo home/journal/entrada llaman data.loadJournal() (abajo).

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

    /**
     * Suscribe el listener de journal — LAZY/opt-in (B4): solo lo llaman las páginas
     * que muestran journal (home/journal/entrada), no toda página pública. Idempotente.
     * NO gatea el first-paint: el contenido baked pinta ya y se actualiza al llegar
     * las entradas publicadas.
     */
    loadJournal() {
        if (this._unsubJournal) return;
        this._unsubJournal = onJournalChange(entries => {
            this._journal = entries;
            this._notify();
        });
    }

    /**
     * Videos del home (colección `films/`) — LAZY/opt-in (solo home). Idempotente.
     * Sin entradas → la sección se oculta (regla cero-ficción; `feedback_no_demo_en_index`).
     */
    loadFilms() {
        if (this._unsubFilms) return;
        this._unsubFilms = onCollectionChange('films', list => {
            this._films = list;
            this._notify();
        });
    }

    /** Posts de redes del home (colección `socialPosts/`) — LAZY/opt-in (solo home). Idempotente. */
    loadSocial() {
        if (this._unsubSocial) return;
        this._unsubSocial = onCollectionChange('socialPosts', list => {
            this._social = list;
            this._notify();
        });
    }

    /**
     * Carga el contenido de una página (singleton) — getDoc ONE-SHOT (NO listener:
     * decisión de costo §2.B). Notifica una vez al resolver → las secciones que ya
     * pintaron con DEFAULTS se re-renderizan con el override. Idempotente por página.
     */
    async loadSiteContent(page) {
        try {
            const doc = await fetchSiteContent(page);
            this._siteContent[page] = doc || {};
            this._notify();
            return this._siteContent[page];
        } catch (err) {
            console.warn('[data] siteContent load failed:', err);
            return {};
        }
    }

    /** Doc de contenido de una página (raw, sin merge); null si no cargado. */
    getSiteContent(page) { return this._siteContent[page] || null; }

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
        return piecesOfCollection(this._pieces, this._collections, slug);
    }

    getBySlug(slug) {
        return this._pieces.find(p => p.slug === slug || p.id === slug) || null;
    }

    /** Colección (doc) a la que pertenece una pieza — tolerante a slug O id. */
    collectionOf(piece) {
        return collectionOfPiece(piece, this._collections);
    }

    countByCollection(slug) {
        return this.getByCollection(slug).length;
    }

    /** Entradas del journal PUBLICADAS (los borradores no salen al público). */
    getJournal() { return this._journal.filter(e => e.published === true); }
    getEntryBySlug(slug) {
        return this.getJournal().find(e => e.slug === slug || e.id === slug) || null;
    }

    /** Videos PUBLICADOS del home (los borradores/incompletos no salen). */
    getFilms() { return this._films.filter(v => v.published === true); }
    /** Posts de redes PUBLICADOS del home. */
    getSocial() { return this._social.filter(p => p.published === true); }

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
