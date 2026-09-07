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

import { onPiecesChange, onCollectionsChange, onJournalChange, onCollectionChange,
         getSiteContentFromCache as fetchSiteContentFromCache,
         getSiteContentFromServer as fetchSiteContentFromServer } from '../firestore-service.js';
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
        this._initialJournal = false;   // journal (lazy) — para readiness por sección
    }

    /**
     * Hidratación SÍNCRONA desde la semilla horneada por el SSG (`window.__BJ_CATALOG`, §fix-Antigravity
     * 2026-07-09) — espeja el patrón de `window.__BJ_SC` (§163). El 1er paint de la home pinta las
     * DESTACADAS reales (sin skeleton) ANTES de que llegue Firestore, evitando el real→skeleton→real.
     * Idempotente; solo siembra secciones aún vacías. Firestore refresca luego (mismo/ más dato).
     * Fallback seguro: sin semilla → comportamiento de skeleton normal.
     */
    hydrateFromBake() {
        if (this._initialPieces && this._initialCols) return;
        try {
            const seed = typeof window !== 'undefined' && window.__BJ_CATALOG;
            if (!seed || typeof seed !== 'object') return;
            if (!this._initialPieces && Array.isArray(seed.pieces) && seed.pieces.length) {
                this._pieces = seed.pieces;
                this._initialPieces = true;
            }
            if (!this._initialCols && Array.isArray(seed.collections) && seed.collections.length) {
                this._collections = seed.collections;
                this._initialCols = true;
            }
        } catch { /* sin semilla / entorno sin window → skeleton normal (fallback seguro) */ }
    }

    /** Returns a promise that resolves once first snapshot of pieces+collections arrives. */
    async load() {
        this.hydrateFromBake();   // §fix-Antigravity: 1er paint real desde la semilla horneada (anti-skeleton)
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
                // Si ganó el timeout (Firestore lento/caído, sin snapshot), notifica igual:
                // las secciones en estado "cargando" pasan a "listo-vacío" → colapsan en
                // silencio (red de seguridad anti-carga-eterna; comité v3 §1.1 vía el timeout
                // existente). Si ya hubo snapshot, este notify extra es inocuo (coalescido).
                this._notify();
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

    /**
     * ¿Llegó ya el primer snapshot? Sin argumento = global (compat). Por sección permite
     * que cada una revele independiente (colecciones a 0.5s, piezas a 4s) sin acoplarse.
     * Tras el timeout de load() (`_loaded`), TODAS se consideran listas → las vacías colapsan
     * (evita carga eterna si un listener nunca dispara). Comité v3 §1/§1.1.
     */
    isReady(section) {
        // Por sección: datos REALES llegados (NO el timeout de 4s de load() — consejo Gemini
        // 2026-06-21: fiarse del timeout colapsaba la sección antes de tiempo en redes lentas y
        // la re-expandía al llegar el dato tarde = el salto que queremos evitar). El anti-carga-
        // eterna lo cubre un watchdog en cada sección (categories.js/featured.js), no este flag.
        if (section === 'cats')     return this._initialCols;
        if (section === 'featured') return this._initialPieces;
        if (section === 'journal')  return this._initialJournal;
        return this._loaded;
    }

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
            this._initialJournal = true;   // 1er snapshot real de journal llegó
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
     * Carga el contenido de una página (singleton) con SWR cache-first (§110.2; patrón §108):
     * pinta desde la CACHÉ local al instante (revisitas → sin "vacío→foto") y revalida contra el
     * servidor; re-pinta SOLO si el doc cambió (diff-gate por `version`, que el writer bumpea en
     * cada guardado) → cero parpadeo sin cambios, update EN VIVO cuando los hay (I1: ante duda,
     * re-pinta). Costo idéntico al getDoc one-shot previo (§2.B): la lectura de caché es local;
     * 1 lectura de servidor; SIN listener permanente.
     *
     * Por qué importa para el LQIP: el blur (campo compañero) viaja con la URL en el MISMO doc;
     * al pintar desde caché el placeholder PRECEDE a la imagen → resuelve L-50 (en §106 el getDoc
     * era server-first en CADA visita → el blur era un 3er estado siempre; ahora solo en carga fría).
     *
     * @param {string}   page      home|nosotros|contacto|global
     * @param {Function} [onUpdate] se invoca en CADA actualización (caché y/o servidor-si-cambió).
     */
    async loadSiteContent(page, onUpdate) {
        const apply = (docData) => {
            this._siteContent[page] = docData || {};
            try { localStorage.setItem('bj-sc-' + page, JSON.stringify(docData || {})); } catch {}   // TODO-63: caché SÍNCRONO anti-flash del CMS
            if (typeof onUpdate === 'function') {
                try { onUpdate(); } catch (e) { console.warn('[data] siteContent onUpdate:', e); }
            }
        };
        let hadCache = false;
        let cachedVersion;
        try {
            const cached = await fetchSiteContentFromCache(page);   // instantáneo; lanza si no hay caché
            if (cached) { hadCache = true; cachedVersion = cached.version; apply(cached); }
        } catch { /* caché vacía/no disponible → seguimos a la red */ }
        try {
            const fresh = await fetchSiteContentFromServer(page);   // revalida (1 lectura)
            // diff-gate: re-pinta si NO había caché, o si la versión cambió, o ante CUALQUIER duda (I1).
            // D.3: un doc SIN `version` (legacy) dejaba `undefined !== undefined` = false → el dato fresco
            // nunca se aplicaba. Tratar `version` ausente como CAMBIADO (fuerza revalidación).
            const changed = !hadCache || !fresh?.version || fresh.version !== cachedVersion;
            if (changed) apply(fresh);
            this._notify();
            return this._siteContent[page];
        } catch (err) {
            // Offline/red caída: nos quedamos con lo de caché (ya pintado). Sin caché → defaults.
            // D.3: `hadCache` solo refleja el caché del SDK Firestore. Si getSiteContent ya hidrató este
            // page desde localStorage (`_siteContent[page]`), un apply({}) aquí PISARÍA ese contenido bueno
            // Y persistiría '{}' en localStorage → flash al default + caché anti-flash destruido. No degradar
            // si ya hay contenido hidratado.
            console.warn('[data] siteContent revalidate failed:', err);
            if (!hadCache && !this._siteContent[page]) apply({});
            this._notify();
            return this._siteContent[page] || {};
        }
    }

    /** Doc de contenido de una página (raw, sin merge); null si no cargado. */
    getSiteContent(page) {
        if (this._siteContent[page]) return this._siteContent[page];
        // TODO-63: hidrata SÍNCRONAMENTE del caché localStorage en el 1er paint (antes de que llegue
        // Firestore) → el hero (y toda sección CMS) pinta ya la imagen/textos reales, sin el flash de
        // la imagen por defecto del repo. Se refresca luego si el servidor trae algo más nuevo.
        try {
            const raw = localStorage.getItem('bj-sc-' + page);
            if (raw) return (this._siteContent[page] = JSON.parse(raw) || {});
        } catch {}
        // §163: semilla HORNEADA por el SSG en el HTML (window.__BJ_SC, build por-push + cron diario).
        // Cubre la 1ª visita de un dispositivo NUEVO (sin localStorage): el hero/CMS pinta ya el
        // contenido real — cero flash de defaults del repo. Firestore refresca luego (diff-gate).
        try {
            const baked = typeof window !== 'undefined' && window.__BJ_SC && window.__BJ_SC[page];
            if (baked) return (this._siteContent[page] = baked);
        } catch {}
        return null;
    }

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

    /** Pieza por CÓDIGO único (TODO-58 buscador por código): match exacto, tolera espacios y mayúsculas. */
    getByCode(code) {
        const c = String(code ?? '').trim().toLowerCase();
        if (!c) return null;
        return this._pieces.find(p => String(p.code ?? '').trim().toLowerCase() === c) || null;
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
