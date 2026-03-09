/**
 * Bersaglio Jewelry — Data Layer
 *
 * HOY  → carga datos locales estáticos (_local)
 * MAÑANA → load() hace await fetchFromFirestore(); el resto del código no cambia.
 *
 * Interfaz pública:
 *   await db.load()                   — inicializa la capa de datos
 *   db.getBrand()                     — info de marca
 *   db.getContact()                   — datos de contacto / redes
 *   db.getCollections(onlyFeatured?)  — colecciones
 *   db.getServices()                  — servicios
 *   db.getAll()                       — todas las piezas
 *   db.getFeatured(limit?)            — piezas con featured:true
 *   db.getByCollection(slug)          — piezas de una colección
 *   db.getBySlug(slug)                — pieza individual por slug o id
 *   db.onChange(callback)             — suscribirse a cambios → devuelve unsubscribe()
 *   db.startRealtime()                — placeholder para onSnapshot() de Firestore
 */

// ─── Datos estáticos locales ──────────────────────────────────────────────────

const _local = {

    brand: {
        name:        "Bersaglio Jewelry",
        tagline:     "Alta Joyería con Alma",
        description: "Creamos piezas únicas que trascienden el tiempo. Cada joya Bersaglio es una obra de arte que celebra la belleza de las gemas más extraordinarias del mundo.",
        founded:     "2024",
        origin:      "Colombia",
        philosophy:  "Precisión artesanal, gemas excepcionales y diseño atemporal convergen en cada pieza Bersaglio. Nuestra pasión es transformar las piedras más nobles de la tierra en joyas que cuentan historias."
    },

    collections: [
        {
            id:          "esmeraldas-colombianas",
            slug:        "esmeraldas-colombianas",
            name:        "Esmeraldas Colombianas",
            subtitle:    "El verde más puro del mundo",
            description: "Esmeraldas de origen colombiano, seleccionadas por su color, claridad y fuego interior. Cada piedra es certificada y engastada con maestría artesanal.",
            featured:    true,
            pieces:      12
        },
        {
            id:          "diamantes-eternos",
            slug:        "diamantes-eternos",
            name:        "Diamantes Eternos",
            subtitle:    "Brillo que desafía el tiempo",
            description: "Diamantes de corte excepcional montados en oro de 18k y platino. Piezas diseñadas para momentos que merecen ser inmortales.",
            featured:    true,
            pieces:      8
        },
        {
            id:          "oro-escultorico",
            slug:        "oro-escultorico",
            name:        "Oro Escultórico",
            subtitle:    "El arte de moldear lo precioso",
            description: "Piezas en oro de 18k y 24k donde el metal se convierte en escultura. Diseños audaces que redefinen la joyería contemporánea.",
            featured:    true,
            pieces:      10
        },
        {
            id:          "novias",
            slug:        "novias",
            name:        "Colección Novias",
            subtitle:    "Para el día más importante",
            description: "Anillos de compromiso y alianzas que sellan promesas eternas. Diamantes y esmeraldas en diseños que simbolizan amor sin fin.",
            featured:    false,
            pieces:      6
        }
    ],

    pieces: [
        {
            id:          "p001",
            slug:        "anillo-muzo-imperial",
            name:        "Anillo Muzo Imperial",
            collection:  "esmeraldas-colombianas",
            description: "Esmeralda colombiana de 3.2 quilates en talla esmeralda, engastada en oro amarillo de 18k con halo de diamantes.",
            price:       null,
            priceLabel:  "Consultar precio",
            specs: {
                stone:       "Esmeralda colombiana",
                carat:       "3.2 ct",
                metal:       "Oro amarillo 18k",
                accent:      "Diamantes 0.8 ct total",
                certificate: "GIA"
            },
            badge:    "Pieza Única",
            featured: true
        },
        {
            id:          "p002",
            slug:        "collar-eterno-brillante",
            name:        "Collar Eterno Brillante",
            collection:  "diamantes-eternos",
            description: "Collar rivière con 42 diamantes de corte brillante, montados en platino 950. Brillo total: 12.6 quilates.",
            price:       null,
            priceLabel:  "Consultar precio",
            specs: {
                stone:       "Diamantes naturales",
                carat:       "12.6 ct total",
                metal:       "Platino 950",
                cut:         "Brillante redondo",
                certificate: "GIA"
            },
            badge:    "Alta Joyería",
            featured: true
        },
        {
            id:          "p003",
            slug:        "brazalete-serpentina-oro",
            name:        "Brazalete Serpentina Oro",
            collection:  "oro-escultorico",
            description: "Brazalete articulado en oro rosa de 18k con textura orgánica. Diseño escultórico que abraza la muñeca con fluidez.",
            price:       null,
            priceLabel:  "Consultar precio",
            specs: {
                metal:  "Oro rosa 18k",
                weight: "48g",
                style:  "Articulado escultórico",
                finish: "Satinado y pulido"
            },
            badge:    "Edición Limitada",
            featured: true
        },
        {
            id:          "p004",
            slug:        "pendientes-gota-esmeralda",
            name:        "Pendientes Gota Esmeralda",
            collection:  "esmeraldas-colombianas",
            description: "Par de pendientes con esmeraldas en talla gota de 2.1 ct cada una, suspendidas en cadena de oro blanco con diamantes.",
            price:       null,
            priceLabel:  "Consultar precio",
            specs: {
                stone:       "Esmeraldas colombianas",
                carat:       "4.2 ct total",
                metal:       "Oro blanco 18k",
                accent:      "Diamantes 1.2 ct",
                certificate: "GIA"
            },
            badge:    "Pieza Única",
            featured: true
        },
        {
            id:          "p005",
            slug:        "anillo-solitario-promesa",
            name:        "Anillo Solitario Promesa",
            collection:  "novias",
            description: "Diamante de talla brillante de 1.5 quilates, color D, claridad VVS1, montado en platino con banda de micro-pavé.",
            price:       null,
            priceLabel:  "Consultar precio",
            specs: {
                stone:       "Diamante natural",
                carat:       "1.5 ct",
                color:       "D",
                clarity:     "VVS1",
                metal:       "Platino 950",
                certificate: "GIA"
            },
            badge:    "Compromiso",
            featured: true
        },
        {
            id:          "p006",
            slug:        "collar-cascada-de-oro",
            name:        "Collar Cascada de Oro",
            collection:  "oro-escultorico",
            description: "Collar statement en oro amarillo de 18k con eslabones esculpidos a mano. Una pieza de arte portátil que define presencia.",
            price:       null,
            priceLabel:  "Consultar precio",
            specs: {
                metal:  "Oro amarillo 18k",
                weight: "62g",
                length: "42cm ajustable",
                finish: "Pulido espejo"
            },
            badge:    "Edición Limitada",
            featured: true
        }
    ],

    services: [
        {
            id:          "asesoria",
            icon:        "gem",
            title:       "Asesoría Personalizada",
            description: "Nuestros gemólogos certificados te guían para encontrar la pieza perfecta según tu ocasión, estilo y presupuesto."
        },
        {
            id:          "diseno-custom",
            icon:        "pencil",
            title:       "Diseño a Medida",
            description: "Creamos piezas exclusivas desde cero. Tú eliges la gema, el metal y el diseño. Nosotros lo hacemos realidad."
        },
        {
            id:          "certificacion",
            icon:        "certificate",
            title:       "Certificación GIA",
            description: "Todas nuestras piedras preciosas incluyen certificación del Gemological Institute of America, garantía de autenticidad y calidad."
        },
        {
            id:          "envio",
            icon:        "shield",
            title:       "Envío Seguro y Asegurado",
            description: "Entrega puerta a puerta con seguro completo. Empaque premium que protege y honra cada pieza."
        }
    ],

    contact: {
        whatsapp:  "+573000000000",
        email:     "info@bersagliojewelry.com",
        instagram: "@bersagliojewelry",
        location:  "Colombia"
    }
};

// ─── BersaglioDatabase ────────────────────────────────────────────────────────

class BersaglioDatabase {

    constructor() {
        this._data      = null;
        this._listeners = [];
    }

    // ─── Carga ─────────────────────────────────────────────────────────────────

    /**
     * Inicializa la capa de datos.
     * HOY   → resuelve desde _local (síncrono, envuelto en Promise)
     * MAÑANA → reemplazar el cuerpo con:
     *
     *   const app = initializeApp(firebaseConfig);
     *   const fs  = getFirestore(app);
     *   const [piecesSnap, collectionsSnap] = await Promise.all([
     *       getDocs(collection(fs, 'pieces')),
     *       getDocs(collection(fs, 'collections')),
     *   ]);
     *   this._data = {
     *       brand:       _local.brand,        // brand / contact / services pueden
     *       contact:     _local.contact,       // venir de un doc 'config' en Firestore
     *       services:    _local.services,
     *       collections: collectionsSnap.docs.map(d => ({ id: d.id, ...d.data() })),
     *       pieces:      piecesSnap.docs.map(d => ({ id: d.id, ...d.data() })),
     *   };
     */
    async load() {
        this._data = _local;
        return this;
    }

    // ─── Getters ───────────────────────────────────────────────────────────────

    getBrand()    { return this._data.brand; }
    getContact()  { return this._data.contact; }
    getServices() { return this._data.services; }

    /**
     * @param {boolean} [onlyFeatured=false]
     * @returns {Array}
     */
    getCollections(onlyFeatured = false) {
        return onlyFeatured
            ? this._data.collections.filter(c => c.featured)
            : this._data.collections;
    }

    /** Todas las piezas */
    getAll() { return this._data.pieces; }

    /**
     * Piezas con featured:true
     * @param {number} [limit=Infinity]
     */
    getFeatured(limit = Infinity) {
        const list = this._data.pieces.filter(p => p.featured);
        return Number.isFinite(limit) ? list.slice(0, limit) : list;
    }

    /**
     * Piezas de una colección (por slug de colección)
     * @param {string} slug
     */
    getByCollection(slug) {
        return this._data.pieces.filter(p => p.collection === slug);
    }

    /**
     * Pieza individual por slug de URL o id interno
     * @param {string} slug
     * @returns {Object|null}
     */
    getBySlug(slug) {
        return this._data.pieces.find(p => p.slug === slug || p.id === slug) ?? null;
    }

    // ─── Reactividad ───────────────────────────────────────────────────────────

    /**
     * Suscribirse a cambios en los datos.
     * @param {Function} callback  — recibe (data) al actualizarse
     * @returns {Function}         — función para cancelar la suscripción
     */
    onChange(callback) {
        this._listeners.push(callback);
        return () => {
            this._listeners = this._listeners.filter(cb => cb !== callback);
        };
    }

    /**
     * Activa la escucha en tiempo real (hoy es un placeholder).
     * MAÑANA → reemplazar con:
     *
     *   import { onSnapshot, collection } from 'firebase/firestore';
     *
     *   const unsub = onSnapshot(collection(firestoreDb, 'pieces'), snapshot => {
     *       this._data.pieces = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
     *       this._notify();
     *   });
     *   return unsub;  // llamar para detener la escucha
     */
    startRealtime() {
        console.info('[BersaglioDatabase] startRealtime() → modo local. Conecta Firestore para activar sincronización en tiempo real.');
    }

    // ─── Interno ───────────────────────────────────────────────────────────────

    _notify() {
        this._listeners.forEach(cb => cb(this._data));
    }
}

// Singleton compartido por toda la app
export const db = new BersaglioDatabase();
export default db;
