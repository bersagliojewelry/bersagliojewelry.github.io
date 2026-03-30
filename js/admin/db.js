/**
 * Bersaglio Jewelry — Admin Database (Firestore-first)
 *
 * Firestore is the single source of truth.
 * localStorage serves only as offline cache.
 * Real-time onSnapshot listeners keep all tabs/devices in sync.
 */

import {
    fetchPieces, savePiece as fsSavePiece, deletePiece as fsDeletePiece,
    onPiecesChange,
    fetchCollections, saveCollection as fsSaveCollection,
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

    async savePiece(data) {
        const piece = { ...data };

        if (!piece.id) {
            piece.id        = `p${Date.now()}`;
            piece.slug      = piece.slug || AdminDatabase.slugify(piece.name);
            piece.createdAt = new Date().toISOString();
        }
        piece.updatedAt = new Date().toISOString();

        await fsSavePiece(piece.id, piece);
        return piece;
    }

    async deletePiece(id) {
        await fsDeletePiece(id);
    }

    // ─── Colecciones ───────────────────────────────────────────────────────────

    getAllCollections() {
        return this._collections;
    }

    async saveCollection(data) {
        const col = { ...data, updatedAt: new Date().toISOString() };

        if (!col.id) {
            col.id   = AdminDatabase.slugify(col.name);
            col.slug = col.id;
        }

        await fsSaveCollection(col.id, col);
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
