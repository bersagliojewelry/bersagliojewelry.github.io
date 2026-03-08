// Database Management System for ALTORRA CARS

class VehicleDatabase {
    constructor() {
        this.vehicles = [];
        this.brands = [];
        this.loaded = false;
        this._cacheKey = 'altorra-db-cache';
        this._cacheMaxAge = 15 * 60 * 1000; // 15 minutes (generous for slow networks)
        // Fase 23: Real-time listeners
        this._listeners = { vehicles: null, brands: null, banners: null };
        this._changeCallbacks = [];
        this._realtimeActive = false;
        this._initialLoadDone = false;
    }

    // ========== LOCAL CACHE (instant load while Firebase loads) ==========

    _saveToCache() {
        try {
            var payload = {
                ts: Date.now(),
                vehicles: this.vehicles,
                brands: this.brands
            };
            localStorage.setItem(this._cacheKey, JSON.stringify(payload));
        } catch (e) {
            // localStorage full or unavailable - ignore silently
        }
    }

    _loadFromCache() {
        try {
            var raw = localStorage.getItem(this._cacheKey);
            if (!raw) return false;
            var data = JSON.parse(raw);
            if (Date.now() - data.ts > this._cacheMaxAge) return false;
            this.vehicles = data.vehicles || [];
            this.brands = data.brands || [];
            return true;
        } catch (e) {
            return false;
        }
    }

    // ========== MAIN LOAD ==========

    async load(forceRefresh = false) {
        if (this.loaded && !forceRefresh) return;

        // STEP 1: Show cached data instantly (if available)
        var hadCache = false;
        if (!forceRefresh) {
            hadCache = this._loadFromCache();
            if (hadCache) {
                this.normalizeVehicles();
                this.loaded = true;
                console.log('[DB] Cache loaded (' + this.vehicles.length + ' vehicles) — refreshing from Firestore...');
            }
        }

        // STEP 2: Load from Firestore (with generous timeout for slow networks + 3 retries)
        if (window.firebaseReady) {
            var firebaseOk = await this._awaitFirebaseWithTimeout(15000);
            if (firebaseOk && window.db) {
                var delays = [0, 2000, 4000]; // retry backoff
                for (var attempt = 0; attempt < 3; attempt++) {
                    if (attempt > 0) {
                        await new Promise(function(r) { setTimeout(r, delays[attempt]); });
                    }
                    try {
                        await this.loadFromFirestore();
                        this.normalizeVehicles();
                        this.loaded = true;
                        this._saveToCache();
                        // Marcar caché como fresco para que cache-manager sepa que los datos están vigentes
                        if (window.AltorraCache) window.AltorraCache.markFresh().catch(function(){});
                        console.log('[DB] Firestore loaded: ' + this.vehicles.length + ' vehicles, ' + this.brands.length + ' brands');
                        return;
                    } catch (e) {
                        console.warn('[DB] Firestore attempt ' + (attempt + 1) + '/3 failed:', e.message);
                    }
                }
            } else {
                console.warn('[DB] Firebase SDK not ready after 15s timeout');
            }
        }

        // STEP 3: If no cache was loaded, Firestore is unavailable — empty state
        if (!hadCache) {
            console.warn('[DB] Firestore unavailable and no cache. Empty inventory.');
            this.vehicles = [];
            this.brands = [];
            this.loaded = true;
        }
    }

    async _awaitFirebaseWithTimeout(ms) {
        return Promise.race([
            window.firebaseReady.then(function() { return true; }),
            new Promise(function(resolve) {
                setTimeout(function() { resolve(false); }, ms);
            })
        ]);
    }

    async loadFromFirestore() {
        // PARALLEL queries with 20s timeout (generous for slow networks)
        var queryTimeout = new Promise(function(_, reject) {
            setTimeout(function() { reject(new Error('Firestore query timeout (20s)')); }, 20000);
        });
        var results = await Promise.race([
            Promise.all([
                window.db.collection('vehiculos').get(),
                window.db.collection('marcas').get()
            ]),
            queryTimeout
        ]);

        var vehiclesSnap = results[0];
        var brandsSnap = results[1];

        this.vehicles = vehiclesSnap.docs.map(function(doc) {
            var data = doc.data();
            // Strip internal/classified fields — dealer info is admin-only
            delete data.concesionario;
            delete data.consignaParticular;
            return data;
        });
        this.brands = brandsSnap.empty ? [] : brandsSnap.docs.map(function(doc) { return doc.data(); });

        // Normalizar rutas de logos de marcas (corrige "multimedia/Logo/" → "multimedia/Logos/")
        this.brands = this.brands.map(b => {
            if (b.logo && b.logo.indexOf('multimedia/Logo/') === 0) {
                return { ...b, logo: b.logo.replace('multimedia/Logo/', 'multimedia/Logos/') };
            }
            return b;
        });

        return true;
    }

    // ========== FASE 23: REAL-TIME LISTENERS ==========

    /**
     * Register a callback to be called when data changes in real-time.
     * @param {Function} callback - fn(changeType) where changeType is 'vehicles', 'brands', or 'banners'
     */
    onChange(callback) {
        if (typeof callback === 'function') {
            this._changeCallbacks.push(callback);
        }
    }

    /** Notify all registered callbacks */
    _notifyChange(changeType) {
        this._changeCallbacks.forEach(function(cb) {
            try { cb(changeType); } catch (e) { console.warn('[DB] onChange callback error:', e); }
        });
    }

    /**
     * Start real-time listeners for vehicles and brands.
     * Called once after initial load to keep data synced with Firestore.
     */
    startRealtime() {
        if (this._realtimeActive || !window.db) return;
        this._realtimeActive = true;
        this._initialLoadDone = true;
        var self = this;

        // Vehicle listener
        this._listeners.vehicles = window.db.collection('vehiculos')
            .onSnapshot(function(snapshot) {
                // Skip the first snapshot (already have data from .get())
                if (!self._initialLoadDone) return;
                // Debounce: ignore if this is initial
                var isFirstSnapshot = !self._listeners._vehiclesReceived;
                self._listeners._vehiclesReceived = true;
                if (isFirstSnapshot) return;

                var newVehicles = snapshot.docs.map(function(doc) {
                    var data = doc.data();
                    delete data.concesionario;
                    delete data.consignaParticular;
                    return data;
                });

                // Only update + notify if data actually changed
                if (JSON.stringify(newVehicles.map(function(v) { return v.id + ':' + (v._version || 0) + ':' + v.estado; }).sort())
                    !== JSON.stringify(self.vehicles.map(function(v) { return v.id + ':' + (v._version || 0) + ':' + v.estado; }).sort())) {
                    self.vehicles = newVehicles;
                    self.normalizeVehicles();
                    self._saveToCache();
                    console.log('[DB] Real-time update: ' + self.vehicles.length + ' vehicles');
                    self._notifyChange('vehicles');
                }
            }, function(err) {
                console.warn('[DB] Vehicle listener error:', err.message);
            });

        // Brands listener
        this._listeners.brands = window.db.collection('marcas')
            .onSnapshot(function(snapshot) {
                var isFirstSnapshot = !self._listeners._brandsReceived;
                self._listeners._brandsReceived = true;
                if (isFirstSnapshot) return;

                var newBrands = snapshot.docs.map(function(doc) { return doc.data(); });
                newBrands = newBrands.map(function(b) {
                    if (b.logo && b.logo.indexOf('multimedia/Logo/') === 0) {
                        return Object.assign({}, b, { logo: b.logo.replace('multimedia/Logo/', 'multimedia/Logos/') });
                    }
                    return b;
                });

                if (newBrands.length !== self.brands.length ||
                    JSON.stringify(newBrands.map(function(b) { return b.id; }).sort())
                    !== JSON.stringify(self.brands.map(function(b) { return b.id; }).sort())) {
                    self.brands = newBrands;
                    self._saveToCache();
                    console.log('[DB] Real-time update: ' + self.brands.length + ' brands');
                    self._notifyChange('brands');
                }
            }, function(err) {
                console.warn('[DB] Brands listener error:', err.message);
            });

        // Banners listener
        this._listeners.banners = window.db.collection('banners')
            .where('active', '==', true)
            .where('position', '==', 'promocional')
            .orderBy('order', 'asc')
            .limit(3)
            .onSnapshot(function(snapshot) {
                var isFirstSnapshot = !self._listeners._bannersReceived;
                self._listeners._bannersReceived = true;
                if (isFirstSnapshot) return;

                self._latestBanners = snapshot.docs.map(function(doc) { return doc.data(); });
                console.log('[DB] Real-time update: ' + self._latestBanners.length + ' banners');
                self._notifyChange('banners');
            }, function(err) {
                console.warn('[DB] Banners listener error:', err.message);
            });

        console.log('[DB] Real-time listeners started');
    }

    /** Stop all real-time listeners (cleanup) */
    stopRealtime() {
        if (this._listeners.vehicles) { this._listeners.vehicles(); this._listeners.vehicles = null; }
        if (this._listeners.brands) { this._listeners.brands(); this._listeners.brands = null; }
        if (this._listeners.banners) { this._listeners.banners(); this._listeners.banners = null; }
        this._realtimeActive = false;
        console.log('[DB] Real-time listeners stopped');
    }

    /**
     * Normaliza texto a Title Case: primera letra de cada palabra en mayúscula, resto en minúscula.
     * Ejemplo: "GRIS OSCURO" → "Gris Oscuro", "azul metálico" → "Azul Metálico"
     */
    _toTitleCase(str) {
        if (!str) return '';
        return str.trim().toLowerCase().replace(/(?:^|\s)\S/g, c => c.toUpperCase());
    }

    /**
     * FASE 1 - NORMALIZACIÓN AUTOMÁTICA
     * Convierte "seminuevo" → "usado" y "camioneta" → "pickup"
     * Estandariza colores a Title Case, recorta espacios en modelos
     * Sin romper el inventario existente
     */
    normalizeVehicles() {
        this.vehicles = this.vehicles.map(v => {
            const normalized = { ...v };

            // Regla de negocio: "seminuevo" no existe, solo "nuevo" y "usado"
            if (normalized.tipo === 'seminuevo') {
                normalized.tipo = 'usado';
            }

            // Migración: "camioneta" → "pickup"
            if (normalized.categoria === 'camioneta') {
                normalized.categoria = 'pickup';
            }

            // Estandarizar color a Title Case (ej: "ROJO" → "Rojo", "GRIS OSCURO" → "Gris Oscuro")
            if (normalized.color) {
                normalized.color = this._toTitleCase(normalized.color);
            }

            // Recortar espacios sobrantes en modelo
            if (normalized.modelo) {
                normalized.modelo = normalized.modelo.trim();
            }

            // Normalizar estado: si no tiene, asignar 'disponible'
            if (!normalized.estado) {
                normalized.estado = 'disponible';
            }

            return normalized;
        });
    }

    /**
     * Normaliza queries de usuario para compatibilidad
     */
    normalizeQuery(value) {
        if (!value) return value;

        const normalized = value.toLowerCase().trim();

        // Mapeos de compatibilidad
        if (normalized === 'seminuevo' || normalized === 'semi-nuevo') {
            return 'usado';
        }
        if (normalized === 'camioneta' || normalized === 'camionetas') {
            return 'pickup';
        }

        return normalized;
    }
    
    // Get all vehicles
    getAllVehicles() {
        return this.vehicles;
    }
    
    // Get vehicle by ID
    getVehicleById(id) {
        return this.vehicles.find(v => v.id == id);
    }
    
    // Filter vehicles
    filter(filters = {}) {
        let filtered = [...this.vehicles];

        // ✅ FASE 1: Normalizar queries entrantes para compatibilidad
        if (filters.tipo) {
            filters.tipo = this.normalizeQuery(filters.tipo);
        }
        if (filters.categoria) {
            filters.categoria = this.normalizeQuery(filters.categoria);
        }

        // Filter by estado (disponible, reservado, vendido, borrador)
        // By default, public pages only show 'disponible' vehicles
        if (filters.estado) {
            filtered = filtered.filter(v => v.estado === filters.estado);
        } else if (filters._includeAllEstados !== true) {
            filtered = filtered.filter(v => v.estado === 'disponible' || !v.estado);
        }

        // Filter by type (nuevo, usado) - seminuevo ya mapeado a usado
        if (filters.tipo) {
            filtered = filtered.filter(v => v.tipo === filters.tipo);
        }

        // Filter by category (suv, sedan, hatchback, pickup) - camioneta ya mapeado a pickup
        if (filters.categoria) {
            filtered = filtered.filter(v => v.categoria === filters.categoria);
        }
        
        // Filter by brand
        if (filters.marca) {
            filtered = filtered.filter(v => v.marca === filters.marca);
        }
        
        // Filter by transmission
        if (filters.transmision) {
            filtered = filtered.filter(v => v.transmision === filters.transmision);
        }

        // FASE 3: Filter by combustible
        if (filters.combustible) {
            filtered = filtered.filter(v => v.combustible === filters.combustible);
        }

        // Filter by price range
        if (filters.precioMin) {
            filtered = filtered.filter(v => v.precio >= parseInt(filters.precioMin));
        }
        if (filters.precioMax) {
            filtered = filtered.filter(v => v.precio <= parseInt(filters.precioMax));
        }

        // Filter by year range
        if (filters.yearMin) {
            filtered = filtered.filter(v => v.year >= parseInt(filters.yearMin));
        }
        if (filters.yearMax) {
            filtered = filtered.filter(v => v.year <= parseInt(filters.yearMax));
        }

        // FASE 3: Filter by kilometraje
        if (filters.kilometrajeMax) {
            filtered = filtered.filter(v => v.kilometraje <= parseInt(filters.kilometrajeMax));
        }

        // Filter by km range (from sliders)
        if (filters.kmMin) {
            filtered = filtered.filter(v => v.kilometraje >= parseInt(filters.kmMin));
        }
        if (filters.kmMax) {
            filtered = filtered.filter(v => v.kilometraje <= parseInt(filters.kmMax));
        }

        // FASE 3: Filter by destacado
        if (filters.destacado === 'true' || filters.destacado === true) {
            filtered = filtered.filter(v => v.destacado === true);
        }

        // FASE 3: Filter by oferta
        if (filters.oferta === 'true' || filters.oferta === true) {
            filtered = filtered.filter(v => v.oferta === true || v.precioOferta);
        }
        
        // Search by text (model, brand, description)
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter(v =>
                v.marca.toLowerCase().includes(searchLower) ||
                v.modelo.toLowerCase().includes(searchLower) ||
                (v.descripcion && v.descripcion.toLowerCase().includes(searchLower))
            );
        }
        
        return filtered;
    }
    
    // Get featured vehicles (only disponible)
    getFeatured() {
        return this.vehicles.filter(v => v.destacado && (v.estado === 'disponible' || !v.estado));
    }

    /**
     * FASE 2 - SISTEMA DE RANKING ROBUSTO
     * Calcula un score de prioridad para cada vehículo
     * Criterios: destacado > oferta > nuevo > año reciente > bajo kilometraje
     */
    calculateRankingScore(vehicle) {
        let score = 0;

        // 0. Prioridad manual (máxima precedencia: prioridad * 100)
        if (vehicle.prioridad && vehicle.prioridad > 0) {
            score += vehicle.prioridad * 100;
        }

        // 1. Destacado tiene alta prioridad (+1000)
        if (vehicle.destacado) {
            score += 1000;
        }

        // 2. Ofertas tienen alta prioridad (+500)
        if (vehicle.oferta || vehicle.precioOferta) {
            score += 500;
        }

        // 3. Vehículos nuevos tienen prioridad sobre usados (+200)
        if (vehicle.tipo === 'nuevo') {
            score += 200;
        }

        // 4. Año más reciente suma puntos (máx +100)
        const yearScore = Math.max(0, Math.min(100, (vehicle.year - 2000) * 3));
        score += yearScore;

        // 5. Menor kilometraje suma puntos (máx +50)
        const kmScore = Math.max(0, 50 - (vehicle.kilometraje / 10000));
        score += kmScore;

        return score;
    }

    /**
     * FASE 2 - OBTENER VEHÍCULOS RANKEADOS
     * Retorna vehículos ordenados por score de ranking
     */
    getRankedVehicles(limit = null) {
        const available = this.vehicles.filter(v => v.estado === 'disponible' || !v.estado);
        const ranked = [...available].map(v => ({
            ...v,
            _rankingScore: this.calculateRankingScore(v)
        }));

        // Ordenar por score descendente
        ranked.sort((a, b) => b._rankingScore - a._rankingScore);

        // Remover el score temporal antes de retornar
        const clean = ranked.map(v => {
            const { _rankingScore, ...vehicle } = v;
            return vehicle;
        });

        return limit ? clean.slice(0, limit) : clean;
    }

    /**
     * FASE 2 - OBTENER TOP VEHÍCULOS
     * Retorna los N mejores vehículos según ranking
     */
    getTopVehicles(limit = 12) {
        return this.getRankedVehicles(limit);
    }
    
    // Get vehicles by brand
    getByBrand(brand) {
        return this.vehicles.filter(v => v.marca === brand);
    }
    
    // Get vehicles by category
    getByCategory(category) {
        return this.vehicles.filter(v => v.categoria === category);
    }
    
    // Get all brands
    getAllBrands() {
        return this.brands;
    }

    // Get brand info
    getBrandInfo(brandId) {
        return this.brands.find(b => b.id === brandId);
    }

    /**
     * FASE 3 - OBTENER VALORES ÚNICOS DEL INVENTARIO
     * Para generar filtros dinámicos
     */
    getUniqueBrands() {
        const brands = [...new Set(this.vehicles.map(v => v.marca))];
        return brands.sort();
    }

    getUniqueColors() {
        const colors = [...new Set(this.vehicles.map(v => v.color))];
        return colors.filter(c => c).sort();
    }

    getUniqueFuels() {
        const fuels = [...new Set(this.vehicles.map(v => v.combustible))];
        return fuels.filter(f => f).sort();
    }

    getYearRange() {
        const years = this.vehicles.map(v => v.year).filter(y => y);
        return {
            min: Math.min(...years),
            max: Math.max(...years)
        };
    }

    getPriceRange() {
        const prices = this.vehicles.map(v => v.precio).filter(p => p);
        return {
            min: Math.min(...prices),
            max: Math.max(...prices)
        };
    }
    
    // Sort vehicles
    sort(vehicles, sortBy = 'precio-asc') {
        const sorted = [...vehicles];
        
        switch (sortBy) {
            case 'precio-asc':
                return sorted.sort((a, b) => a.precio - b.precio);
            case 'precio-desc':
                return sorted.sort((a, b) => b.precio - a.precio);
            case 'year-desc':
                return sorted.sort((a, b) => b.year - a.year);
            case 'year-asc':
                return sorted.sort((a, b) => a.year - b.year);
            case 'km-asc':
                return sorted.sort((a, b) => a.kilometraje - b.kilometraje);
            case 'marca-asc':
                return sorted.sort((a, b) => a.marca.localeCompare(b.marca));
            default:
                return sorted;
        }
    }
}

// Create global database instance
const vehicleDB = new VehicleDatabase();

// Make it available globally in browser
if (typeof window !== 'undefined') {
    window.vehicleDB = vehicleDB;
}

// Export for use in other files (Node.js)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { VehicleDatabase, vehicleDB };
}
