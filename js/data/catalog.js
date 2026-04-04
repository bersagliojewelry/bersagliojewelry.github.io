/**
 * Bersaglio Jewelry — Data Layer (Firestore-only)
 *
 * Firestore is the single source of truth for pieces and collections.
 * The admin panel controls what appears on the website.
 * Brand, contact, and services remain static (not managed in admin yet).
 *
 * Public API:
 *   await db.load()                   — fetch data from Firestore
 *   db.getBrand()                     — brand info (static)
 *   db.getContact()                   — contact data (static)
 *   db.getCollections(onlyFeatured?)  — collections from Firestore
 *   db.getServices()                  — services (static)
 *   db.getAll()                       — all pieces from Firestore
 *   db.getFeatured(limit?)            — featured pieces
 *   db.getByCollection(slug)          — pieces by collection
 *   db.getBySlug(slug)                — single piece by slug or id
 *   db.onChange(callback)             — subscribe to real-time changes
 *   db.startRealtime()               — enable onSnapshot listeners
 */

// ─── Static data (not managed in admin) ─────────────────────────────────────

const _static = {

    brand: {
        name:        "Bersaglio Jewelry",
        tagline:     "Alta Joyería con Alma",
        description: "Somos una joyería nacida con una visión clara: acercar piezas únicas a quienes saben apreciar la elegancia y el valor de una joya auténtica. Más que vender joyas, nos apasiona asesorar.",
        founded:     "2024",
        origin:      "Colombia",
        philosophy:  "Antes que vender, nos dedicamos a asesorar. Queremos que cada cliente encuentre una pieza con la que realmente se identifique — una joya que refleje su estilo, su historia y su esencia."
    },

    services: [
        {
            id:          "diseno",
            icon:        "pencil",
            title:       "Diseño y Fabricación a Medida",
            description: "Somos fabricantes y diseñadores. Creamos la joya de tus sueños desde cero, seleccionando los mejores metales, esmeraldas y diamantes."
        },
        {
            id:          "asesoria",
            icon:        "gem",
            title:       "Asesoría Personalizada",
            description: "Nacimos visitando a nuestros clientes puerta a puerta. Hoy, esa cercanía es nuestro sello. Te guiamos para encontrar la pieza que refleje tu esencia."
        },
        {
            id:          "certificacion",
            icon:        "certificate",
            title:       "Certificación y Garantía",
            description: "Seguridad absoluta. Todas nuestras piezas están garantizadas y nuestra diamantería cuenta con certificación internacional."
        },
        {
            id:          "taller",
            icon:        "tools",
            title:       "Taller y Mantenimiento",
            description: "Protegemos tu inversión. Ofrecemos limpieza, mantenimiento y restauración para que tus joyas brillen como el primer día."
        }
    ],

    contact: {
        whatsapp:  "+573013752592",
        email:     "info@bersagliojewelry.co",
        instagram: "@bersaglio_jewelry",
        facebook:  "https://www.facebook.com/share/1J96BT58cr/",
        address:   "Calle 36 # 6-32, Calle San Agustín Chiquita, Centro Histórico, Cartagena de Indias",
        mapUrl:    "https://maps.app.goo.gl/9p5cjFQpqMjLeXti8",
        location:  "Cartagena de Indias, Colombia"
    }
};

// ─── BersaglioDatabase ──────────────────────────────────────────────────────

class BersaglioDatabase {

    constructor() {
        this._data = {
            ..._static,
            pieces:      [],
            collections: [],
        };
        this._listeners   = [];
        this._unsubPieces = null;
        this._unsubCols   = null;
        this._firestoreOk = false;
    }

    // ─── Load ───────────────────────────────────────────────────────────────

    /**
     * Fetch pieces and collections from Firestore.
     * Awaits the result so pages render with real data.
     */
    async load() {
        try {
            const { fetchPieces, fetchCollections } = await import('../firestore-service.js');

            const [pieces, collections] = await Promise.all([
                fetchPieces(),
                fetchCollections()
            ]);

            this._data.pieces      = pieces;
            this._data.collections = collections;
            this._firestoreOk      = true;

            console.info(`[DB] Firestore: ${pieces.length} piezas, ${collections.length} colecciones`);
        } catch (err) {
            console.warn('[DB] Firestore load failed:', err);
        }

        return this;
    }

    // ─── Getters ────────────────────────────────────────────────────────────

    getBrand()    { return this._data.brand; }
    getContact()  { return this._data.contact; }
    getServices() { return this._data.services; }

    isFirestoreConnected() { return this._firestoreOk; }

    getCollections(onlyFeatured = false) {
        return onlyFeatured
            ? this._data.collections.filter(c => c.featured)
            : this._data.collections;
    }

    getAll() { return this._data.pieces; }

    getFeatured(limit = Infinity) {
        const list = this._data.pieces.filter(p => p.featured);
        return Number.isFinite(limit) ? list.slice(0, limit) : list;
    }

    getByCollection(slug) {
        return this._data.pieces.filter(p => p.collection === slug);
    }

    getBySlug(slug) {
        return this._data.pieces.find(p => p.slug === slug || p.id === slug) ?? null;
    }

    // ─── Realtime ───────────────────────────────────────────────────────────

    onChange(callback) {
        this._listeners.push(callback);
        return () => {
            this._listeners = this._listeners.filter(cb => cb !== callback);
        };
    }

    async startRealtime() {
        try {
            const { onPiecesChange, onCollectionsChange } = await import('../firestore-service.js');

            this._unsubPieces = onPiecesChange(pieces => {
                this._data.pieces = pieces;
                this._firestoreOk = true;
                this._notify();
            });

            this._unsubCols = onCollectionsChange(cols => {
                this._data.collections = cols;
                this._notify();
            });

            return () => {
                this._unsubPieces?.();
                this._unsubCols?.();
            };
        } catch (err) {
            console.warn('[DB] Realtime not available:', err.message);
            return () => {};
        }
    }

    _notify() {
        this._listeners.forEach(cb => cb(this._data));
    }
}

export const db = new BersaglioDatabase();
export default db;
