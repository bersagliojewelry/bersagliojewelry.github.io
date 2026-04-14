/**
 * Bersaglio Jewelry — Admin Database (Firestore-first)
 *
 * Firestore is the single source of truth.
 * localStorage serves only as offline cache.
 * Real-time onSnapshot listeners keep all tabs/devices in sync.
 */

import {
    fetchPieces,
    createPiece as fsCreatePiece,
    updatePiece as fsUpdatePiece,
    deletePiece as fsDeletePiece,
    onPiecesChange,
    fetchCollections,
    createCollection as fsCreateCollection,
    updateCollection as fsUpdateCollection,
    onCollectionsChange,
    fetchInquiries, saveInquiry as fsSaveInquiry,
    deleteInquiry as fsDeleteInquiry, updateInquiry as fsUpdateInquiry,
    onInquiriesChange,
    deleteCollection as fsDeleteCollection,
} from '../firestore-service.js';

const CACHE = {
    pieces:      'bj_cache_pieces',
    collections: 'bj_cache_collections',
    inquiries:   'bj_cache_inquiries',
};

class AdminDatabase {

    constructor() {
        this._pieces      = [];
        this._collections = [];
        this._inquiries   = [];
        this._listeners   = { pieces: [], collections: [], inquiries: [], stats: [] };
        this._unsubs      = [];
        this._ready        = false;
    }

    // ─── Init ──────────────────────────────────────────────────────────────────

    async init() {
        // Load cache immediately for fast first paint
        this._pieces      = this._cacheGet(CACHE.pieces) || [];
        this._collections = this._cacheGet(CACHE.collections) || [];
        this._inquiries   = this._cacheGet(CACHE.inquiries) || [];

        // Fetch fresh data from Firestore
        try {
            const [pieces, collections, inquiries] = await Promise.all([
                fetchPieces(),
                fetchCollections(),
                fetchInquiries(),
            ]);
            this._pieces      = pieces;
            this._collections = collections;
            this._inquiries   = inquiries;
            this._cacheSet(CACHE.pieces, pieces);
            this._cacheSet(CACHE.collections, collections);
            this._cacheSet(CACHE.inquiries, inquiries);
        } catch (err) {
            console.warn('[AdminDB] Firestore fetch failed, using cache:', err);
        }

        // Start real-time listeners
        this._startListeners();
        this._ready = true;
        return this;
    }

    _startListeners() {
        this._unsubs.push(
            onPiecesChange(pieces => {
                this._pieces = pieces;
                this._cacheSet(CACHE.pieces, pieces);
                this._emit('pieces', pieces);
                this._emit('stats', this.getStats());
            }),
            onCollectionsChange(collections => {
                this._collections = collections;
                this._cacheSet(CACHE.collections, collections);
                this._emit('collections', collections);
                this._emit('stats', this.getStats());
            }),
            onInquiriesChange(inquiries => {
                this._inquiries = inquiries;
                this._cacheSet(CACHE.inquiries, inquiries);
                this._emit('inquiries', inquiries);
                this._emit('stats', this.getStats());
            }),
        );
    }

    destroy() {
        this._unsubs.forEach(fn => fn());
        this._unsubs = [];
    }

    // ─── Event system ──────────────────────────────────────────────────────────

    on(event, callback) {
        if (this._listeners[event]) {
            this._listeners[event].push(callback);
        }
        return () => {
            this._listeners[event] = this._listeners[event].filter(cb => cb !== callback);
        };
    }

    _emit(event, data) {
        (this._listeners[event] || []).forEach(cb => {
            try { cb(data); } catch (e) { console.error('[AdminDB] listener error:', e); }
        });
    }

    // ─── Piezas ────────────────────────────────────────────────────────────────

    getAllPieces() {
        return this._pieces;
    }

    getPieceBySlug(slug) {
        return this._pieces.find(p => p.slug === slug || p.id === slug) ?? null;
    }

    /**
     * Create or update a piece with optimistic locking.
     *
     * @param {object} data
     * @param {object} [opts]
     * @param {number} [opts.expectedVersion] — when updating, the _version
     *        the form was loaded with. Lets the transaction abort with
     *        'version-conflict' if another admin saved meanwhile.
     */
    async savePiece(data, opts = {}) {
        const piece = { ...data };
        const isNew = !piece.id;

        if (isNew) {
            piece.slug = piece.slug || AdminDatabase.slugify(piece.name || '');

            Object.keys(piece).forEach(k => {
                if (piece[k] === undefined) delete piece[k];
            });
            delete piece.createdAt;
            delete piece.updatedAt;
            delete piece._version;

            let attempt = 0;
            while (attempt < 5) {
                const candidateId = AdminDatabase.generatePieceId();
                piece.id = candidateId;
                try {
                    await fsCreatePiece(candidateId, piece);
                    return piece;
                } catch (err) {
                    if (err?.code === 'id-collision') {
                        attempt++;
                        await new Promise(r => setTimeout(r, 20));
                        continue;
                    }
                    throw err;
                }
            }
            throw new Error('No se pudo generar un ID único para la pieza');
        }

        Object.keys(piece).forEach(k => {
            if (piece[k] === undefined) delete piece[k];
        });
        delete piece.createdAt;
        delete piece.updatedAt;
        // _version is managed by the service layer.
        delete piece._version;

        const res = await fsUpdatePiece(piece.id, piece, { expectedVersion: opts.expectedVersion });
        if (res?.version) piece._version = res.version;
        return piece;
    }

    /**
     * Partial update of an existing piece (e.g. just its images). Uses
     * merge semantics and intentionally skips the optimistic-lock check
     * so concurrent image edits don't fail (only structural fields use
     * the version check).
     *
     * Returns the new _version so callers who are also holding an open
     * edit modal can advance their optimistic-lock baseline — otherwise
     * the subsequent Save would trigger a false 'version-conflict'
     * because the user's own patch already bumped the version.
     */
    async patchPiece(id, patch) {
        if (!id) throw new Error('patchPiece requires an id');
        const clean = { ...patch };
        Object.keys(clean).forEach(k => {
            if (clean[k] === undefined) delete clean[k];
        });
        delete clean.createdAt;
        delete clean.updatedAt;
        delete clean._version;
        const res = await fsUpdatePiece(id, clean);
        return res?.version ?? null;
    }

    async deletePiece(id) {
        await fsDeletePiece(id);
    }

    // ─── Colecciones ───────────────────────────────────────────────────────────

    getAllCollections() {
        return this._collections;
    }

    /**
     * Create or update a collection.
     * - Creation path uses createCollection which FAILS on id collision.
     *   If a collision is detected, the caller-supplied base id gets a numeric
     *   suffix (-2, -3 …) until a free slot is found.
     * - Update path uses updateCollection with merge:true so partial updates
     *   preserve untouched fields.
     *
     * @param {object} data
     * @param {object} [opts]
     * @param {number} [opts.expectedVersion] — optimistic lock on updates.
     */
    async saveCollection(data, opts = {}) {
        const col = { ...data };
        const isNew = !col.id;

        Object.keys(col).forEach(k => {
            if (col[k] === undefined) delete col[k];
        });
        delete col.createdAt;
        delete col.updatedAt;
        // _version is managed by the service layer.
        delete col._version;

        if (isNew) {
            const baseId = AdminDatabase.slugify(col.name || col.id || '');
            if (!baseId) throw new Error('El nombre de la colección es obligatorio');

            // Find a free id by appending a numeric suffix on collision.
            let candidateId = baseId;
            let suffix      = 1;
            while (suffix < 50) {
                col.id   = candidateId;
                col.slug = col.slug || candidateId;
                try {
                    await fsCreateCollection(candidateId, col);
                    return col;
                } catch (err) {
                    if (err?.code === 'id-collision') {
                        suffix++;
                        candidateId = `${baseId}-${suffix}`;
                        continue;
                    }
                    throw err;
                }
            }
            throw new Error('No se pudo generar un ID único para la colección');
        }

        const res = await fsUpdateCollection(col.id, col, { expectedVersion: opts.expectedVersion });
        if (res?.version) col._version = res.version;
        return col;
    }

    async deleteCollection(id) {
        await fsDeleteCollection(id);
    }

    // ─── Consultas ─────────────────────────────────────────────────────────────

    getInquiries() {
        return this._inquiries;
    }

    async addInquiry(data) {
        const inq = {
            ...data,
            createdAt: new Date().toISOString(),
            read:      false,
        };
        await fsSaveInquiry(inq);
        return inq;
    }

    async markRead(id, read = true) {
        await fsUpdateInquiry(id, { read });
    }

    async deleteInquiry(id) {
        await fsDeleteInquiry(id);
    }

    // ─── Stats ─────────────────────────────────────────────────────────────────

    getStats() {
        return {
            totalPieces:    this._pieces.length,
            featuredPieces: this._pieces.filter(p => p.featured).length,
            collections:    this._collections.filter(c => c.featured).length,
            unread:         this._inquiries.filter(i => !i.read).length,
        };
    }

    // ─── Export ────────────────────────────────────────────────────────────────

    exportInquiriesCSV() {
        const rows = this._inquiries.map(i => ({
            Fecha:    new Date(i.createdAt).toLocaleDateString('es-CO'),
            Nombre:   i.name || '',
            Email:    i.email || '',
            'Telefono': i.phone || '',
            Pieza:    i.piece || i.pieceSlug || '',
            Mensaje:  (i.message || '').replace(/\n/g, ' '),
            Estado:   i.read ? 'Leida' : 'Nueva',
        }));
        AdminDatabase.downloadCSV(rows, 'consultas-bersaglio.csv');
    }

    exportPiecesCSV() {
        const rows = this._pieces.map(p => ({
            ID:          p.id,
            Nombre:      p.name,
            Slug:        p.slug,
            'Coleccion': p.collection,
            Badge:       p.badge || '',
            Destacada:   p.featured ? 'Si' : 'No',
            PrecioLabel: p.priceLabel || '',
            Precio:      p.price || '',
            'Descripcion': (p.description || '').replace(/\n/g, ' '),
        }));
        AdminDatabase.downloadCSV(rows, 'piezas-bersaglio.csv');
    }

    // ─── Helpers ───────────────────────────────────────────────────────────────

    static slugify(str) {
        return String(str)
            .toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-');
    }

    /**
     * Generate a unique piece id. Combines Date.now() (ms timestamp) with a
     * random suffix so rapid successive creations never collide even within
     * the same millisecond.
     */
    static generatePieceId() {
        const rnd = Math.random().toString(36).slice(2, 8);
        return `p${Date.now()}${rnd}`;
    }

    static downloadCSV(rows, filename) {
        if (!rows.length) return;
        const headers = Object.keys(rows[0]);
        const lines   = rows.map(row =>
            headers.map(h => `"${String(row[h] ?? '').replace(/"/g, '""')}"`).join(',')
        );
        const csv  = [headers.join(','), ...lines].join('\n');
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const url  = URL.createObjectURL(blob);
        const a    = Object.assign(document.createElement('a'), { href: url, download: filename });
        a.click();
        URL.revokeObjectURL(url);
    }

    // ─── Cache (localStorage) ──────────────────────────────────────────────────

    _cacheGet(key) {
        try {
            const v = localStorage.getItem(key);
            return v ? JSON.parse(v) : null;
        } catch { return null; }
    }

    _cacheSet(key, val) {
        try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* quota */ }
    }
}

export const adminDb = new AdminDatabase();
export default adminDb;
