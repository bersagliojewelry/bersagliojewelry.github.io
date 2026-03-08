// ============================================
// DYNAMIC LISTS - ALTORRA CARS
// Centralized system for all configurable dropdowns
// Loads from Firestore config/listas, with fallbacks
// ============================================

(function() {
    'use strict';

    // Default values (used before Firestore loads or as fallback)
    var DEFAULTS = {
        tipos: [
            { value: 'nuevo', label: 'Nuevo' },
            { value: 'usado', label: 'Usado' }
        ],
        categorias: [
            { value: 'sedan', label: 'Sedan' },
            { value: 'suv', label: 'SUV' },
            { value: 'hatchback', label: 'Hatchback' },
            { value: 'pickup', label: 'Pickup' }
        ],
        transmisiones: [
            { value: 'automatica', label: 'Automatica' },
            { value: 'mecanica', label: 'Mecanica' }
        ],
        combustibles: [
            { value: 'gasolina', label: 'Gasolina' },
            { value: 'diesel', label: 'Diesel' },
            { value: 'electrico', label: 'Electrico' },
            { value: 'hibrido', label: 'Hibrido' }
        ],
        direcciones: [
            { value: 'Electrica', label: 'Electrica' },
            { value: 'Hidraulica', label: 'Hidraulica' },
            { value: 'Mecanica', label: 'Mecanica' },
            { value: 'Electrohidraulica', label: 'Electrohidraulica' }
        ],
        tracciones: [
            { value: 'Delantera', label: 'Delantera' },
            { value: 'Trasera', label: 'Trasera' },
            { value: '4x4', label: '4x4' },
            { value: 'AWD', label: 'AWD' }
        ],
        colores: [
            { value: 'Blanco', label: 'Blanco' },
            { value: 'Negro', label: 'Negro' },
            { value: 'Gris', label: 'Gris' },
            { value: 'Plata', label: 'Plata' },
            { value: 'Rojo', label: 'Rojo' },
            { value: 'Azul', label: 'Azul' },
            { value: 'Verde', label: 'Verde' },
            { value: 'Beige', label: 'Beige' }
        ],
        canalesVenta: [
            { value: 'presencial', label: 'Visita presencial' },
            { value: 'whatsapp', label: 'WhatsApp' },
            { value: 'redes', label: 'Redes sociales' },
            { value: 'referido', label: 'Referido' },
            { value: 'otro', label: 'Otro' }
        ],
        featSeguridad: [
            { value: 'Sistema de frenos ABS', label: 'ABS' },
            { value: 'Airbags frontales', label: 'Airbags frontales' },
            { value: 'Airbags laterales', label: 'Airbags laterales' },
            { value: 'Alarma', label: 'Alarma' },
            { value: 'Bloqueo central', label: 'Bloqueo central' },
            { value: 'Control de estabilidad', label: 'Control estabilidad' },
            { value: 'Control de traccion', label: 'Control traccion' },
            { value: 'Sensor de reversa', label: 'Sensor reversa' },
            { value: 'Camara de reversa', label: 'Camara reversa' },
            { value: 'Camara 360', label: 'Camara 360' }
        ],
        featConfort: [
            { value: 'Aire acondicionado', label: 'Aire acondicionado' },
            { value: 'Climatizador automatico', label: 'Climatizador auto' },
            { value: 'Asientos en cuero', label: 'Asientos en cuero' },
            { value: 'Asientos calefactados', label: 'Asientos calefactados' },
            { value: 'Asiento electrico', label: 'Asiento electrico' },
            { value: 'Volante multifuncional', label: 'Volante multifuncional' },
            { value: 'Tapizado en cuero', label: 'Tapizado en cuero' },
            { value: 'Techo panoramico', label: 'Techo panoramico' }
        ],
        featTecnologia: [
            { value: 'Pantalla tactil', label: 'Pantalla tactil' },
            { value: 'Bluetooth', label: 'Bluetooth' },
            { value: 'USB / Auxiliar', label: 'USB / Auxiliar' },
            { value: 'Android Auto', label: 'Android Auto' },
            { value: 'Apple CarPlay', label: 'Apple CarPlay' },
            { value: 'GPS / Navegacion', label: 'GPS / Navegacion' },
            { value: 'Radio AM/FM', label: 'Radio AM/FM' },
            { value: 'Computador de viaje', label: 'Computador de viaje' },
            { value: 'Keyless entry', label: 'Keyless entry' },
            { value: 'Boton de encendido', label: 'Boton de encendido' }
        ],
        featExterior: [
            { value: 'Luces LED', label: 'Luces LED' },
            { value: 'Luces DRL', label: 'Luces DRL' },
            { value: 'Rines de aluminio', label: 'Rines de aluminio' },
            { value: 'Barras de techo', label: 'Barras de techo' },
            { value: 'Exploradoras', label: 'Exploradoras' },
            { value: 'Espejos electricos', label: 'Espejos electricos' }
        ],
        featInterior: [
            { value: 'Vidrios electricos', label: 'Vidrios electricos' },
            { value: 'Cierre centralizado', label: 'Cierre centralizado' },
            { value: 'Tablero digital', label: 'Tablero digital' },
            { value: 'Guantera refrigerada', label: 'Guantera refrigerada' },
            { value: 'Apoyabrazos central', label: 'Apoyabrazos central' }
        ]
    };

    var _lists = null;
    var _loaded = false;
    var _loading = null;
    var _callbacks = [];

    function getLists() {
        return _lists || DEFAULTS;
    }

    function isLoaded() {
        return _loaded;
    }

    // Load lists from Firestore config/listas
    function loadLists() {
        if (_loading) return _loading;
        if (_loaded && _lists) return Promise.resolve(_lists);

        // Try cache first
        try {
            var cached = localStorage.getItem('altorra-listas-cache');
            if (cached) {
                var parsed = JSON.parse(cached);
                if (Date.now() - (parsed._ts || 0) < 5 * 60 * 1000) {
                    _lists = parsed;
                    _loaded = true;
                    notifyCallbacks();
                }
            }
        } catch (e) {}

        _loading = new Promise(function(resolve) {
            function tryLoad() {
                if (!window.db) {
                    // Wait for Firebase
                    if (window.firebaseReady) {
                        window.firebaseReady.then(function() {
                            fetchFromFirestore(resolve);
                        });
                    } else {
                        // No Firebase available - use defaults or cache
                        _lists = _lists || DEFAULTS;
                        _loaded = true;
                        notifyCallbacks();
                        resolve(_lists);
                    }
                } else {
                    fetchFromFirestore(resolve);
                }
            }

            tryLoad();
        });

        return _loading;
    }

    function fetchFromFirestore(resolve) {
        window.db.collection('config').doc('listas').get().then(function(doc) {
            if (doc.exists) {
                var data = doc.data();
                // Merge with defaults (keep defaults for any missing keys)
                _lists = {};
                Object.keys(DEFAULTS).forEach(function(key) {
                    _lists[key] = (data[key] && data[key].length > 0) ? data[key] : DEFAULTS[key];
                });
            } else {
                // No config exists yet - use defaults and save them
                _lists = JSON.parse(JSON.stringify(DEFAULTS));
                // Save defaults to Firestore for first-time setup
                window.db.collection('config').doc('listas').set(DEFAULTS).catch(function() {});
            }
            _loaded = true;
            // Cache locally
            try {
                var toCache = JSON.parse(JSON.stringify(_lists));
                toCache._ts = Date.now();
                localStorage.setItem('altorra-listas-cache', JSON.stringify(toCache));
            } catch (e) {}
            notifyCallbacks();
            resolve(_lists);
        }).catch(function(err) {
            console.warn('[DynamicLists] Error loading from Firestore:', err);
            _lists = _lists || DEFAULTS;
            _loaded = true;
            notifyCallbacks();
            resolve(_lists);
        });
    }

    function notifyCallbacks() {
        _callbacks.forEach(function(cb) { try { cb(_lists); } catch (e) {} });
    }

    // Register a callback for when lists are loaded
    function onListsLoaded(cb) {
        if (_loaded && _lists) {
            cb(_lists);
        } else {
            _callbacks.push(cb);
        }
    }

    // Populate a <select> element with list items
    function populateSelect(selectEl, listKey, options) {
        if (!selectEl) return;
        var opts = options || {};
        var placeholder = opts.placeholder !== undefined ? opts.placeholder : 'Todas';
        var currentVal = selectEl.value;

        var lists = getLists();
        var items = lists[listKey] || [];

        var html = '';
        if (placeholder !== false) {
            html = '<option value="">' + placeholder + '</option>';
        }
        items.forEach(function(item) {
            var val = typeof item === 'string' ? item : item.value;
            var label = typeof item === 'string' ? (item.charAt(0).toUpperCase() + item.slice(1)) : item.label;
            html += '<option value="' + val + '">' + label + '</option>';
        });
        selectEl.innerHTML = html;

        // Restore previous value if it exists
        if (currentVal) {
            selectEl.value = currentVal;
        }
    }

    // Populate brand select from vehicleDB or marcas array
    function populateBrandSelect(selectEl, options) {
        if (!selectEl) return;
        var opts = options || {};
        var placeholder = opts.placeholder || 'Todas';
        var currentVal = selectEl.value;

        var html = '<option value="">' + placeholder + '</option>';

        // Try vehicleDB first (has all brands from Firestore marcas collection)
        if (window.vehicleDB && window.vehicleDB.loaded) {
            var brands = window.vehicleDB.getAllBrands();
            brands.sort(function(a, b) { return (a.nombre || '').localeCompare(b.nombre || ''); });
            brands.forEach(function(b) {
                html += '<option value="' + b.id + '">' + b.nombre + '</option>';
            });
        }

        selectEl.innerHTML = html;
        if (currentVal) selectEl.value = currentVal;
    }

    // Populate ALL filter selects on a public page (catalog pages)
    function populatePageFilters() {
        var lists = getLists();

        // Marca
        var marcaSelects = document.querySelectorAll('#marcaSelect, select[name="marca"]');
        marcaSelects.forEach(function(el) {
            populateBrandSelect(el, { placeholder: 'Todas' });
        });

        // Tipo
        var tipoSelects = document.querySelectorAll('#tipoSelect, select[name="tipo"]');
        tipoSelects.forEach(function(el) {
            populateSelect(el, 'tipos', { placeholder: 'Todos' });
        });

        // Categoria
        var catSelects = document.querySelectorAll('#categoriaSelect, select[name="categoria"]');
        catSelects.forEach(function(el) {
            populateSelect(el, 'categorias', { placeholder: 'Todas' });
        });

        // Transmision
        var transSelects = document.querySelectorAll('#transmisionSelect, select[name="transmision"]');
        transSelects.forEach(function(el) {
            populateSelect(el, 'transmisiones', { placeholder: 'Todas' });
        });

        // Combustible
        var combSelects = document.querySelectorAll('#combustibleSelect, select[name="combustible"]');
        combSelects.forEach(function(el) {
            populateSelect(el, 'combustibles', { placeholder: 'Todos' });
        });
    }

    // Populate all selects in the admin vehicle form
    function populateAdminForm() {
        var lists = getLists();

        populateSelect(document.getElementById('vTipo'), 'tipos', { placeholder: 'Seleccionar...' });
        populateSelect(document.getElementById('vCategoria'), 'categorias', { placeholder: 'Seleccionar...' });
        populateSelect(document.getElementById('vTransmision'), 'transmisiones', { placeholder: 'Seleccionar...' });
        populateSelect(document.getElementById('vCombustible'), 'combustibles', { placeholder: 'Seleccionar...' });
        populateSelect(document.getElementById('vDireccion'), 'direcciones', { placeholder: false });
        populateSelect(document.getElementById('vTraccion'), 'tracciones', { placeholder: 'Seleccionar...' });

        // Concesionario select (populated separately from concesionarios collection)
        var concSelect = document.getElementById('vConcesionario');
        if (concSelect) {
            populateConcesionarioSelect(concSelect);
        }
    }

    // Populate concesionario select from Firestore
    function populateConcesionarioSelect(selectEl) {
        if (!selectEl || !window.db) return;
        var currentVal = selectEl.value;
        window.db.collection('concesionarios').get().then(function(snap) {
            var html = '<option value="">Propio (ALTORRA)</option>';
            snap.docs.forEach(function(doc) {
                var d = doc.data();
                html += '<option value="' + doc.id + '">' + (d.nombre || doc.id) + '</option>';
            });
            selectEl.innerHTML = html;
            if (currentVal) selectEl.value = currentVal;
        }).catch(function() {});
    }

    // Save lists to Firestore
    function saveLists(listsData) {
        if (!window.db) return Promise.reject(new Error('Firestore no disponible'));
        // Clean internal properties
        var toSave = {};
        Object.keys(listsData).forEach(function(key) {
            if (key.charAt(0) !== '_') toSave[key] = listsData[key];
        });
        return window.db.collection('config').doc('listas').set(toSave).then(function() {
            _lists = toSave;
            _loaded = true;
            try {
                var toCache = JSON.parse(JSON.stringify(toSave));
                toCache._ts = Date.now();
                localStorage.setItem('altorra-listas-cache', JSON.stringify(toCache));
            } catch (e) {}
            notifyCallbacks();
        });
    }

    // Export globally
    window.DynamicLists = {
        load: loadLists,
        getLists: getLists,
        isLoaded: isLoaded,
        onListsLoaded: onListsLoaded,
        populateSelect: populateSelect,
        populateBrandSelect: populateBrandSelect,
        populatePageFilters: populatePageFilters,
        populateAdminForm: populateAdminForm,
        populateConcesionarioSelect: populateConcesionarioSelect,
        saveLists: saveLists,
        DEFAULTS: DEFAULTS
    };

})();
