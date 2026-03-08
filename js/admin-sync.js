// Admin Panel — Real-time Sync & Data Loading
(function() {
    'use strict';
    var AP = window.AP;
    var $ = AP.$;

    // Señaliza a las páginas públicas que los datos cambiaron.
    // Se llama después del primer snapshot (cambios reales, no carga inicial).
    function signalCacheInvalidation() {
        if (!window.db) return;
        window.db.doc('system/meta').set(
            { lastModified: Date.now() },
            { merge: true }
        ).catch(function() { /* sin permisos o sin red — silencioso */ });
    }

    function startRealtimeSync() {
        stopRealtimeSync();
        AP._vehiclesLoaded = false;
        AP._brandsLoaded = false;
        var _vehiclesInitialized = false;
        var _brandsInitialized   = false;

        if (AP._loadingTimeout) clearTimeout(AP._loadingTimeout);
        AP._loadingTimeout = setTimeout(function() {
            if (!AP._vehiclesLoaded || !AP._brandsLoaded) {
                if (AP._retryCount < AP.MAX_RETRIES) {
                    AP._retryCount++;
                    AP.toast('Reintentando cargar datos... (intento ' + AP._retryCount + '/' + AP.MAX_RETRIES + ')', 'warning');
                    startRealtimeSync();
                } else {
                    showLoadingError();
                }
            }
        }, 15000);

        AP.unsubVehicles = window.db.collection('vehiculos').onSnapshot(function(snap) {
            AP._vehiclesLoaded = true;
            AP.vehicles = snap.docs.map(function(d) { return d.data(); });
            // Primer snapshot = carga inicial; los siguientes = cambios reales del admin
            if (_vehiclesInitialized) signalCacheInvalidation();
            _vehiclesInitialized = true;
            if (AP.renderVehiclesTable) AP.renderVehiclesTable();
            if (AP.updateStats) AP.updateStats();
            if (AP.renderActivityFeed) AP.renderActivityFeed();
            if (AP.updateEstimator) AP.updateEstimator();
            if (AP.updateNavBadges) AP.updateNavBadges();
            if (AP.renderVehiclesByOrigin) AP.renderVehiclesByOrigin();
            if (AP.renderDealersList) AP.renderDealersList();
            checkLoadingComplete();
        }, function(err) {
            console.error('Vehicles snapshot error:', err);
            handleSnapshotError('vehiculos', err);
        });

        AP.unsubBrands = window.db.collection('marcas').onSnapshot(function(snap) {
            AP._brandsLoaded = true;
            AP.brands = snap.docs.map(function(d) { return d.data(); });
            if (_brandsInitialized) signalCacheInvalidation();
            _brandsInitialized = true;
            if (AP.renderBrandsTable) AP.renderBrandsTable();
            if (AP.populateBrandSelect) AP.populateBrandSelect();
            if (AP.updateStats) AP.updateStats();
            if (AP.renderActivityFeed) AP.renderActivityFeed();
            if (AP.updateNavBadges) AP.updateNavBadges();
            checkLoadingComplete();
        }, function(err) {
            console.error('Brands snapshot error:', err);
            handleSnapshotError('marcas', err);
        });

        if (AP.canManageUsers()) {
            loadUsers();
        }
    }

    function checkLoadingComplete() {
        if (AP._vehiclesLoaded && AP._brandsLoaded) {
            if (AP._loadingTimeout) { clearTimeout(AP._loadingTimeout); AP._loadingTimeout = null; }
            AP._retryCount = 0;
        }
    }

    function handleSnapshotError(collection, err) {
        if (err.code === 'permission-denied') {
            AP.toast('Sin permisos para acceder a ' + collection + '. Verifica tu rol.', 'error');
        }
    }

    function showLoadingError() {
        var vBody = $('vehiclesTableBody');
        if (vBody && AP.vehicles.length === 0) {
            vBody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:2rem;color:#f85149;">' +
                'Error al cargar vehiculos. <a href="#" onclick="adminPanel.retryLoad();return false;" style="color:#58a6ff;text-decoration:underline;">Reintentar</a>' +
                '</td></tr>';
        }
        AP.toast('No se pudieron cargar los datos. Verifica tu conexion a internet.', 'error');
    }

    function retryLoad() {
        AP._retryCount = 0;
        AP.toast('Recargando datos...', 'info');
        AP.loadData();
    }

    function stopRealtimeSync() {
        if (AP.unsubVehicles) { AP.unsubVehicles(); AP.unsubVehicles = null; }
        if (AP.unsubBrands) { AP.unsubBrands(); AP.unsubBrands = null; }
        if (AP.unsubAppointments) { AP.unsubAppointments(); AP.unsubAppointments = null; }
        if (AP.unsubDealers) { AP.unsubDealers(); AP.unsubDealers = null; }
        if (AP.unsubAuditLog) { AP.unsubAuditLog(); AP.unsubAuditLog = null; }
        if (AP.unsubBanners) { AP.unsubBanners(); AP.unsubBanners = null; }
        if (AP.unsubReviews) { AP.unsubReviews(); AP.unsubReviews = null; }
    }

    function loadData() {
        startRealtimeSync();
        try {
            if (AP.loadAppointments) AP.loadAppointments();
            if (AP.loadDealers) AP.loadDealers();
            if (AP.loadAvailabilityConfig) AP.loadAvailabilityConfig();
            if (AP.loadAuditLog) AP.loadAuditLog();
            if (AP.subscribeBanners) AP.subscribeBanners();
            if (AP.subscribeReviews) AP.subscribeReviews();
            if (AP.startDraftsListener) AP.startDraftsListener();
        } catch (e) {
            console.warn('[Phase5] Error loading:', e);
        }
        if (window.DynamicLists) {
            window.DynamicLists.load().then(function() {
                window.DynamicLists.populateAdminForm();
                if (AP.renderListsSection) AP.renderListsSection();
                if (AP.loadBlockedDates) AP.loadBlockedDates();
            });
        }
    }

    function loadUsers() {
        if (!AP.canManageUsers()) return;
        window.db.collection('usuarios').get().then(function(snap) {
            AP.users = snap.docs.map(function(d) {
                var data = d.data();
                data._docId = d.id;
                return data;
            });
            if (AP.renderUsersTable) AP.renderUsersTable();
        }).catch(function(err) {
            var msg = 'Error al cargar usuarios.';
            if (err.code === 'permission-denied') {
                msg = 'Sin permisos para ver usuarios. Verifica que las Firestore Rules esten desplegadas y tu rol sea super_admin.';
            } else {
                msg += ' ' + err.message;
            }
            $('usersTableBody').innerHTML = '<tr><td colspan="5" style="text-align:center;padding:2rem;color:var(--admin-text-muted);">' + msg + '</td></tr>';
        });
    }

    function updateStats() {
        $('statTotal').textContent = AP.vehicles.length;
        $('statNuevos').textContent = AP.vehicles.filter(function(v) { return v.tipo === 'nuevo'; }).length;
        $('statUsados').textContent = AP.vehicles.filter(function(v) { return v.tipo === 'usado'; }).length;
        $('statOfertas').textContent = AP.vehicles.filter(function(v) { return v.oferta || v.precioOferta; }).length;
        $('statDestacados').textContent = AP.vehicles.filter(function(v) { return v.destacado; }).length;
        $('statMarcas').textContent = AP.brands.length;
        $('statVendidos').textContent = AP.vehicles.filter(function(v) { return v.estado === 'vendido'; }).length;
        var citasEl = $('statCitas');
        if (citasEl) citasEl.textContent = AP.appointments.length > 0 ? AP.appointments.filter(function(a) { return a.estado === 'pendiente'; }).length : '-';
    }

    function updateNavBadges() {
        var vBadge = $('navBadgeVehicles');
        var bBadge = $('navBadgeBrands');
        if (vBadge) vBadge.textContent = AP.vehicles.length || '';
        if (bBadge) bBadge.textContent = AP.brands.length || '';
    }

    function updateEstimator() {
        var el = $('storageEstimator');
        if (!el) return;

        var totalImages = 0;
        AP.vehicles.forEach(function(v) {
            if (v.imagenes && v.imagenes.length) {
                v.imagenes.forEach(function(url) {
                    if (url && (url.indexOf('firebasestorage') >= 0 || url.indexOf('storage.googleapis') >= 0)) {
                        totalImages++;
                    }
                });
            }
        });

        var avgSizeKB = 150;
        var storageUsedMB = (totalImages * avgSizeKB) / 1024;
        var storageUsedGB = storageUsedMB / 1024;
        var storagePct = (storageUsedGB / AP.FREE_TIER.storageGB) * 100;

        var visitsInput = $('estVisitas');
        var monthlyVisits = visitsInput ? (parseInt(visitsInput.value) || 500) : 500;
        var avgImagesPerVisit = 8;
        var egressGB = (monthlyVisits * avgImagesPerVisit * avgSizeKB) / (1024 * 1024);
        var egressPct = (egressGB / AP.FREE_TIER.egressGB) * 100;

        var classAUsed = totalImages;
        var classAPct = (classAUsed / AP.FREE_TIER.classAOps) * 100;
        var classBUsed = monthlyVisits * avgImagesPerVisit;
        var classBPct = (classBUsed / AP.FREE_TIER.classBOps) * 100;
        var maxPct = Math.max(storagePct, egressPct, classAPct, classBPct);

        function renderEstBar(label, value, detail, pct) {
            var color = pct >= 90 ? 'var(--admin-danger)' : pct >= 70 ? 'var(--admin-warning)' : 'var(--admin-success)';
            var clampedPct = Math.min(pct, 100);
            return '<div class="est-item"><div style="display:flex;justify-content:space-between;font-size:0.75rem;margin-bottom:2px;"><span>' + label + '</span><span style="color:var(--admin-text-muted);">' + detail + '</span></div><div style="height:6px;background:var(--admin-border);border-radius:3px;overflow:hidden;"><div style="height:100%;width:' + clampedPct + '%;background:' + color + ';border-radius:3px;transition:width 0.3s;"></div></div></div>';
        }

        var html = '<div class="est-grid">' +
            renderEstBar('Almacenamiento', storageUsedMB.toFixed(1) + ' MB', storageUsedGB.toFixed(3) + ' / ' + AP.FREE_TIER.storageGB + ' GB', storagePct) +
            renderEstBar('Egreso mensual', egressGB.toFixed(2) + ' GB', egressGB.toFixed(2) + ' / ' + AP.FREE_TIER.egressGB + ' GB', egressPct) +
            renderEstBar('Op. Clase A (subidas)', classAUsed, classAUsed + ' / ' + AP.FREE_TIER.classAOps.toLocaleString(), classAPct) +
            renderEstBar('Op. Clase B (lecturas)', classBUsed.toLocaleString(), classBUsed.toLocaleString() + ' / ' + AP.FREE_TIER.classBOps.toLocaleString(), classBPct) +
        '</div>';

        if (maxPct >= 70) {
            html += '<div style="margin-top:0.75rem;padding:0.5rem 0.75rem;background:rgba(210,153,34,0.15);border:1px solid var(--admin-warning);border-radius:6px;font-size:0.8rem;color:var(--admin-warning);">Te estas acercando al limite gratuito. Considera reducir imagenes o visitas.</div>';
        } else {
            html += '<div style="margin-top:0.5rem;font-size:0.75rem;color:var(--admin-text-muted);">' + totalImages + ' imagenes en Storage | Compresion automatica activa (~150KB/img)</div>';
        }

        el.innerHTML = html;
    }

    // Estimator events
    var estVisitas = $('estVisitas');
    if (estVisitas) estVisitas.addEventListener('input', function() { updateEstimator(); });

    // Expose
    AP.loadData = loadData;
    AP.loadUsers = loadUsers;
    AP.stopRealtimeSync = stopRealtimeSync;
    AP.retryLoad = retryLoad;
    AP.updateStats = updateStats;
    AP.updateNavBadges = updateNavBadges;
    AP.updateEstimator = updateEstimator;
    AP.signalCacheInvalidation = signalCacheInvalidation;
})();
