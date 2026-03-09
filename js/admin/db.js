/**
 * Bersaglio Jewelry — Admin Database
 *
 * HOY  → lee/escribe en localStorage (modo desarrollo local)
 * MAÑANA → reemplazar _get/_set con llamadas Firestore:
 *   savePiece    →  setDoc(doc(fs, 'pieces', id), data)
 *   deletePiece  →  deleteDoc(doc(fs, 'pieces', id))
 *   getInquiries →  getDocs(collection(fs, 'inquiries'))
 *   etc.
 *
 * Al conectar Firestore, catalog.js.load() se actualiza en paralelo
 * y el resto de la app no cambia.
 */

import db from '../data/catalog.js';

const KEYS = {
    pieces:      'bersaglio_admin_pieces',
    collections: 'bersaglio_admin_collections',
    inquiries:   'bersaglio_admin_inquiries',
};

class AdminDatabase {

    // ─── Init ──────────────────────────────────────────────────────────────────

    /**
     * Inicializa la base de datos del admin.
     * Si localStorage está vacío, siembra los datos del catálogo estático.
     */
    async init() {
        await db.load();

        if (!this._get(KEYS.pieces)) {
            this._set(KEYS.pieces, db.getAll());
        }
        if (!this._get(KEYS.collections)) {
            this._set(KEYS.collections, db.getCollections());
        }
        if (!this._get(KEYS.inquiries)) {
            this._seedInquiries();
        }
        return this;
    }

    // ─── Piezas ────────────────────────────────────────────────────────────────

    getAllPieces() {
        return this._get(KEYS.pieces) || [];
    }

    getPieceBySlug(slug) {
        return this.getAllPieces().find(p => p.slug === slug || p.id === slug) ?? null;
    }

    /**
     * Crea o actualiza una pieza.
     * Crea → genera id y slug automáticamente.
     * Actualiza → reemplaza el registro existente.
     */
    savePiece(data) {
        const pieces = this.getAllPieces();
        let piece = { ...data };

        if (!piece.id) {
            // Nueva pieza
            piece.id        = `p${Date.now()}`;
            piece.slug      = piece.slug || AdminDatabase.slugify(piece.name);
            piece.createdAt = new Date().toISOString();
        }
        piece.updatedAt = new Date().toISOString();

        const idx = pieces.findIndex(p => p.id === piece.id);
        if (idx >= 0) {
            pieces[idx] = piece;
        } else {
            pieces.push(piece);
        }

        this._set(KEYS.pieces, pieces);
        return piece;
    }

    deletePiece(id) {
        this._set(KEYS.pieces, this.getAllPieces().filter(p => p.id !== id));
    }

    // ─── Colecciones ───────────────────────────────────────────────────────────

    getAllCollections() {
        return this._get(KEYS.collections) || [];
    }

    saveCollection(data) {
        const collections = this.getAllCollections();
        const col = { ...data, updatedAt: new Date().toISOString() };

        if (!col.id) {
            col.id   = AdminDatabase.slugify(col.name);
            col.slug = col.id;
        }

        const idx = collections.findIndex(c => c.id === col.id);
        if (idx >= 0) {
            collections[idx] = col;
        } else {
            collections.push(col);
        }

        this._set(KEYS.collections, collections);
        return col;
    }

    deleteCollection(id) {
        this._set(KEYS.collections, this.getAllCollections().filter(c => c.id !== id));
    }

    // ─── Consultas ─────────────────────────────────────────────────────────────

    getInquiries() {
        return this._get(KEYS.inquiries) || [];
    }

    /** Llamado por contacto.js al enviar el formulario */
    addInquiry(data) {
        const inquiries = this.getInquiries();
        const inq = {
            ...data,
            id:        `inq_${Date.now()}`,
            createdAt: new Date().toISOString(),
            read:      false,
        };
        inquiries.unshift(inq);
        this._set(KEYS.inquiries, inquiries);
        return inq;
    }

    markRead(id, read = true) {
        const inquiries = this.getInquiries().map(i =>
            i.id === id ? { ...i, read } : i
        );
        this._set(KEYS.inquiries, inquiries);
    }

    deleteInquiry(id) {
        this._set(KEYS.inquiries, this.getInquiries().filter(i => i.id !== id));
    }

    // ─── Stats ────────────────────────────────────────────────────────────────

    getStats() {
        const pieces      = this.getAllPieces();
        const collections = this.getAllCollections();
        const inquiries   = this.getInquiries();
        return {
            totalPieces:    pieces.length,
            featuredPieces: pieces.filter(p => p.featured).length,
            collections:    collections.filter(c => c.featured).length,
            unread:         inquiries.filter(i => !i.read).length,
        };
    }

    // ─── Export ───────────────────────────────────────────────────────────────

    exportInquiriesCSV() {
        const rows = this.getInquiries().map(i => ({
            Fecha:   new Date(i.createdAt).toLocaleDateString('es-CO'),
            Nombre:  i.name || '',
            Email:   i.email || '',
            Teléfono: i.phone || '',
            Pieza:   i.piece || '',
            Mensaje: (i.message || '').replace(/\n/g, ' '),
            Estado:  i.read ? 'Leída' : 'Nueva',
        }));
        AdminDatabase.downloadCSV(rows, 'consultas-bersaglio.csv');
    }

    exportPiecesCSV() {
        const rows = this.getAllPieces().map(p => ({
            ID:          p.id,
            Nombre:      p.name,
            Slug:        p.slug,
            Colección:   p.collection,
            Badge:       p.badge || '',
            Destacada:   p.featured ? 'Sí' : 'No',
            PrecioLabel: p.priceLabel || '',
            Precio:      p.price || '',
            Descripción: (p.description || '').replace(/\n/g, ' '),
        }));
        AdminDatabase.downloadCSV(rows, 'piezas-bersaglio.csv');
    }

    // ─── Helpers estáticos ────────────────────────────────────────────────────

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

    // ─── Seed de demo ─────────────────────────────────────────────────────────

    _seedInquiries() {
        const now = Date.now();
        const samples = [
            {
                id: 'inq_demo_1',
                createdAt: new Date(now - 86400000 * 2).toISOString(),
                name: 'María García',
                email: 'maria@ejemplo.com',
                phone: '+573001234567',
                message: 'Me interesa el Anillo Muzo Imperial. ¿Está disponible para verlo en persona y saber su precio?',
                piece: 'anillo-muzo-imperial',
                read: false,
            },
            {
                id: 'inq_demo_2',
                createdAt: new Date(now - 86400000 * 5).toISOString(),
                name: 'Carlos Mendoza',
                email: 'carlos@ejemplo.com',
                phone: '+573007654321',
                message: 'Estoy buscando un anillo de compromiso con diamante. ¿Pueden hacer diseño personalizado? ¿Cuál es el proceso?',
                piece: null,
                read: true,
            },
            {
                id: 'inq_demo_3',
                createdAt: new Date(now - 86400000 * 8).toISOString(),
                name: 'Sofía Ramírez',
                email: 'sofia@ejemplo.com',
                phone: '+573009876543',
                message: 'Quisiera información sobre los pendientes de esmeralda y el collar. ¿Hacen envíos internacionales?',
                piece: 'pendientes-gota-esmeralda',
                read: false,
            },
        ];
        this._set(KEYS.inquiries, samples);
    }

    // ─── Storage ──────────────────────────────────────────────────────────────

    _get(key) {
        try {
            const v = localStorage.getItem(key);
            return v ? JSON.parse(v) : null;
        } catch { return null; }
    }

    _set(key, val) {
        localStorage.setItem(key, JSON.stringify(val));
    }
}

export const adminDb = new AdminDatabase();
export default adminDb;
