/**
 * ALTORRA CARS — Smart Cache Manager v4.0
 * ==========================================
 * Sistema de invalidación inteligente con dos fuentes de señal:
 *
 *   🔧 ADMIN CHANGES  → system/meta.lastModified (Firestore)
 *      El admin panel actualiza este campo al guardar cualquier dato.
 *      Todos los tabs abiertos reciben el cambio en tiempo real (onSnapshot).
 *      Las cargas nuevas lo comparan contra IndexedDB para detectar stale cache.
 *
 *   🚀 GITHUB DEPLOYS → data/deploy-info.json (archivo estático)
 *      GitHub Actions regenera este archivo en cada deploy.
 *      Al cargar la página se fetchea (network-only) y se compara la versión.
 *      Si difiere, se limpian todos los caches y se fuerza reload.
 *
 * Capas de caché limpiadas al invalidar:
 *   L1 · Memoria       (Map en sesión)
 *   L2 · IndexedDB     (persistente entre sesiones)
 *   L3 · localStorage  (altorra-db-cache de database.js)
 *   (L4 Service Worker se limpia solo al detectar nueva versión del SW)
 *
 * API pública:
 *   window.AltorraCache.get(key)
 *   window.AltorraCache.set(key, value)
 *   window.AltorraCache.invalidate()
 *   window.AltorraCache.clearAndReload()
 *   window.AltorraCache.markFresh()
 */

(function () {
    'use strict';

    /* ─── Configuración ─────────────────────────────────────────── */
    const APP_VERSION       = '4.0.0-20260305';
    const DB_NAME           = 'altorra-cache';
    const DB_VERSION        = 2;
    const STORE_DATA        = 'app-data';
    const STORE_META        = 'cache-meta';
    const VERSION_KEY       = 'altorra_app_version';
    const DEPLOY_KEY        = 'altorra_deploy_version';
    const DB_CACHE_KEY      = 'altorra-db-cache';   // clave que usa database.js
    const META_DOC_PATH     = 'system/meta';
    const DEPLOY_INFO_PATH  = '/data/deploy-info.json';

    /* ─── L1: Memory cache ──────────────────────────────────────── */
    const memoryCache = new Map();

    /* ─── L2: IndexedDB ─────────────────────────────────────────── */
    let _db = null;

    function openDB() {
        if (_db) return Promise.resolve(_db);
        return new Promise((resolve, reject) => {
            const req = indexedDB.open(DB_NAME, DB_VERSION);
            req.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(STORE_DATA)) {
                    db.createObjectStore(STORE_DATA, { keyPath: 'key' });
                }
                if (!db.objectStoreNames.contains(STORE_META)) {
                    db.createObjectStore(STORE_META, { keyPath: 'key' });
                }
            };
            req.onsuccess  = (e) => { _db = e.target.result; resolve(_db); };
            req.onerror    = (e) => reject(e.target.error);
        });
    }

    async function idbGet(store, key) {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx  = db.transaction(store, 'readonly');
            const req = tx.objectStore(store).get(key);
            req.onsuccess = () => resolve(req.result ? req.result.value : undefined);
            req.onerror   = () => reject(req.error);
        });
    }

    async function idbSet(store, key, value) {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx  = db.transaction(store, 'readwrite');
            const req = tx.objectStore(store).put({ key, value });
            req.onsuccess = () => resolve();
            req.onerror   = () => reject(req.error);
        });
    }

    async function idbClear() {
        const db = await openDB();
        return new Promise((resolve) => {
            const tx = db.transaction([STORE_DATA, STORE_META], 'readwrite');
            tx.objectStore(STORE_DATA).clear();
            tx.objectStore(STORE_META).clear();
            tx.oncomplete = resolve;
        });
    }

    /* ─── Helpers ────────────────────────────────────────────────── */
    function parseTimestamp(ts) {
        if (!ts) return null;
        if (typeof ts.toMillis === 'function') return ts.toMillis();
        return Number(ts);
    }

    /* ─── Fuente 1: Firestore system/meta ───────────────────────── */
    async function fetchFirestoreLastModified() {
        try {
            const db = window.db;
            if (!db) return null;
            const snap = await db.doc(META_DOC_PATH).get();
            if (!snap.exists) return null;
            return parseTimestamp(snap.data().lastModified);
        } catch (_) {
            return null;
        }
    }

    /**
     * Suscripción en tiempo real a system/meta.
     * Cuando el admin guarda algo, este listener notifica a todos los tabs abiertos.
     * El primer snapshot solo establece la línea base; los siguientes son cambios reales.
     */
    function startMetaListener(db) {
        let firstSnapshot = true;

        db.doc(META_DOC_PATH).onSnapshot(function(snap) {
            if (!snap.exists) { firstSnapshot = false; return; }

            const remote = parseTimestamp(snap.data().lastModified);

            if (firstSnapshot) {
                firstSnapshot = false;
                // Solo guardar línea base, no invalidar
                if (remote) idbSet(STORE_META, 'lastModified', remote).catch(function(){});
                return;
            }

            // Cambio real mientras el tab estaba abierto → limpiar caché
            AltorraCache.invalidate().then(function() {
                console.info('[AltorraCache] Cambio del admin detectado en tiempo real → caché limpiada');
                // database.js tiene sus propios real-time listeners que ya actualizan la UI.
                // Solo necesitamos que el localStorage quede limpio para próximas cargas.
            }).catch(function(){});

        }, function() { /* sin red o sin permisos — silencioso */ });
    }

    /* ─── Fuente 2: deploy-info.json (GitHub deploys) ───────────── */
    async function fetchDeployVersion() {
        try {
            const resp = await fetch(DEPLOY_INFO_PATH + '?_=' + Date.now(), {
                cache: 'no-store',
                signal: AbortSignal.timeout ? AbortSignal.timeout(5000) : undefined
            });
            if (!resp.ok) return null;
            const info = await resp.json();
            return info.version || null;
        } catch (_) {
            return null;
        }
    }

    /* ─── API pública ────────────────────────────────────────────── */
    const AltorraCache = {

        async get(key) {
            if (memoryCache.has(key)) return memoryCache.get(key);
            const val = await idbGet(STORE_DATA, key);
            if (val !== undefined) memoryCache.set(key, val);
            return val;
        },

        async set(key, value) {
            memoryCache.set(key, value);
            await idbSet(STORE_DATA, key, value);
        },

        /**
         * Limpia L1 (memoria) + L2 (IndexedDB) + L3 (localStorage de database.js).
         * El Service Worker no se toca aquí — se actualiza por su propio ciclo de vida.
         */
        async invalidate() {
            memoryCache.clear();
            localStorage.removeItem(DB_CACHE_KEY); // caché de database.js
            await idbClear();
            console.info('[AltorraCache] Caché L1/L2/L3 limpiada');
        },

        /**
         * Comprueba Firestore al cargar la página.
         * Si lastModified difiere del almacenado → invalida para que database.js
         * recargue desde Firestore en la próxima llamada a load().
         * @returns {Promise<boolean>} true = vigente, false = invalidado
         */
        async validateWithFirestore() {
            try {
                const remoteMeta = await fetchFirestoreLastModified();
                if (remoteMeta === null) return true; // sin red → conservar

                const localMeta = await idbGet(STORE_META, 'lastModified');

                if (localMeta === remoteMeta) return true; // vigente ✓

                // Datos cambiaron desde el último acceso
                await this.invalidate();
                await idbSet(STORE_META, 'lastModified', remoteMeta);
                console.info('[AltorraCache] Cambio del admin detectado en carga → caché limpiada');
                return false;

            } catch (err) {
                console.warn('[AltorraCache] validateWithFirestore error:', err);
                return true;
            }
        },

        /**
         * Verifica si hay un nuevo deploy de GitHub comparando deploy-info.json.
         * @returns {Promise<boolean>} true = mismo deploy, false = deploy nuevo detectado
         */
        async validateDeployVersion() {
            const remoteVer = await fetchDeployVersion();
            if (!remoteVer) return true; // sin red o archivo no existe → conservar

            const localVer = localStorage.getItem(DEPLOY_KEY);
            if (!localVer) {
                // Primera vez, solo guardar
                localStorage.setItem(DEPLOY_KEY, remoteVer);
                return true;
            }

            if (localVer === remoteVer) return true; // mismo deploy ✓

            // Nuevo deploy detectado
            console.info('[AltorraCache] Nuevo deploy de GitHub:', remoteVer, '(antes:', localVer + ')');
            await this.invalidate();
            localStorage.setItem(DEPLOY_KEY, remoteVer);
            return false;
        },

        /**
         * Marca el caché como fresco tras una carga exitosa desde Firestore.
         * Llamar desde database.js después de loadFromFirestore().
         */
        async markFresh(timestamp) {
            const ts = timestamp != null ? timestamp : Date.now();
            await idbSet(STORE_META, 'lastModified', ts);
        },

        /** Limpia todo y recarga la página. */
        async clearAndReload() {
            console.info('[AltorraCache] Limpieza total solicitada');
            await this.invalidate();
            sessionStorage.clear();

            if ('caches' in window) {
                const names = await caches.keys();
                await Promise.all(names.map(n => caches.delete(n)));
            }
            if ('serviceWorker' in navigator) {
                const regs = await navigator.serviceWorker.getRegistrations();
                await Promise.all(regs.map(r => r.unregister()));
            }
            window.location.reload(true);
        }
    };

    /* ─── Service Worker Manager ─────────────────────────────────── */
    const SWManager = {

        register() {
            if (!('serviceWorker' in navigator)) return;
            navigator.serviceWorker.register('/service-worker.js')
                .then((reg) => {
                    // Revisar actualizaciones cada 5 minutos
                    setInterval(() => reg.update(), 5 * 60 * 1000);
                    reg.addEventListener('updatefound', () => {
                        const sw = reg.installing;
                        sw.addEventListener('statechange', () => {
                            if (sw.state === 'installed' && navigator.serviceWorker.controller) {
                                console.info('[SW] Nueva versión disponible');
                                this.notifyUpdate();
                            }
                        });
                    });
                })
                .catch(err => console.warn('[SW] Registro fallido:', err));
        },

        notifyUpdate() {
            if (typeof toast !== 'undefined' && toast.info) {
                toast.info(
                    'Hay una nueva versión disponible. La página se actualizará en breve.',
                    'Actualización disponible',
                    5000
                );
            }
            setTimeout(() => window.location.reload(true), 4000);
        },

        setupListeners() {
            if (!('serviceWorker' in navigator)) return;
            navigator.serviceWorker.addEventListener('message', (e) => {
                if (e.data?.type === 'SW_UPDATED') {
                    console.info('[SW] Actualizado a:', e.data.version);
                    this.notifyUpdate();
                }
                if (e.data?.type === 'CACHE_CLEARED') {
                    window.location.reload(true);
                }
            });
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                window.location.reload(true);
            });
        }
    };

    /* ─── Inicialización ─────────────────────────────────────────── */
    async function init() {
        // 1. Detectar deploy nuevo de APP_VERSION (hardcoded cambia en PR manuale)
        const storedVersion = localStorage.getItem(VERSION_KEY);
        if (storedVersion && storedVersion !== APP_VERSION) {
            console.info('[AltorraCache] Nueva versión de app:', APP_VERSION);
            await AltorraCache.invalidate();
        }
        localStorage.setItem(VERSION_KEY, APP_VERSION);

        // 2. Registrar Service Worker
        SWManager.register();
        SWManager.setupListeners();

        // 3. Checks asíncronos no bloqueantes (en idle o con delay)
        const runChecks = async () => {
            // 3a. Detectar deploy de GitHub (deploy-info.json)
            await AltorraCache.validateDeployVersion();

            // 3b. Detectar cambios del admin (Firestore system/meta)
            //     Solo si Firebase ya está listo; si no, esperar hasta 6s
            const waitForFirebase = () => new Promise(resolve => {
                if (window.db) { resolve(true); return; }
                const check = setInterval(() => {
                    if (window.db) { clearInterval(check); resolve(true); }
                }, 200);
                setTimeout(() => { clearInterval(check); resolve(false); }, 6000);
            });

            const firebaseReady = await waitForFirebase();
            if (firebaseReady) {
                // Validación en carga (para cuando el tab estaba cerrado mientras admin guardaba)
                await AltorraCache.validateWithFirestore();
                // Listener en tiempo real (para cuando el tab está abierto)
                startMetaListener(window.db);
            }
        };

        if (typeof requestIdleCallback !== 'undefined') {
            requestIdleCallback(runChecks, { timeout: 8000 });
        } else {
            setTimeout(runChecks, 1000);
        }
    }

    /* ─── Arranque ───────────────────────────────────────────────── */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    /* ─── Exponer API global ─────────────────────────────────────── */
    window.AltorraCache = AltorraCache;
    window.CacheManager = { clearAndReload: () => AltorraCache.clearAndReload() }; // alias legacy

})();
