// Admin Panel — Dealers, Vehicle Origin & Propios
(function() {
    'use strict';
    var AP = window.AP;
    var $ = AP.$;

    // ========== ORIGIN HELPERS ==========
    function getVehicleOriginName(v) {
        if (v.concesionario && v.concesionario !== '' && v.concesionario !== '_particular') {
            var d = AP.dealers.find(function(x) { return x._docId === v.concesionario; });
            return d ? d.nombre : v.concesionario;
        }
        if (v.concesionario === '_particular' && v.consignaParticular) {
            return v.consignaParticular;
        }
        return 'Propio (ALTORRA)';
    }

    function isVehiclePropio(v) {
        return !v.concesionario || v.concesionario === '';
    }

    // ========== LOAD DEALERS ==========
    function loadDealers() {
        if (AP.unsubDealers) AP.unsubDealers();
        AP.unsubDealers = window.db.collection('concesionarios').onSnapshot(function(snap) {
            AP.dealers = snap.docs.map(function(doc) { return Object.assign({ _docId: doc.id }, doc.data()); });
            renderDealersList();
            renderVehiclesByOrigin();
            renderPropiosTab();
            if (AP.renderSalesTracking) AP.renderSalesTracking();
        }, function(err) {
            console.warn('[Dealers] Error loading:', err);
        });
    }

    // ========== DEALERS LIST ==========
    function renderDealersList() {
        var container = $('dealersList');
        if (!container) return;

        if (AP.dealers.length === 0) {
            container.innerHTML = '<p style="text-align:center;color:var(--admin-text-muted);padding:1rem;">No hay aliados registrados. Agrega el primero.</p>';
            return;
        }

        var metricsByDealer = {};
        var soldVehicles = AP.vehicles.filter(function(v) { return v.estado === 'vendido'; });
        soldVehicles.forEach(function(v) {
            var did = v.concesionario || '';
            if (!did) return;
            if (!metricsByDealer[did]) metricsByDealer[did] = { vendidos: 0, ventasAltorra: 0, comisiones: 0 };
            metricsByDealer[did].vendidos++;
            if (v.canalVenta === 'altorra') {
                metricsByDealer[did].ventasAltorra++;
                metricsByDealer[did].comisiones += (v.comisionAltorra || v.utilidadAltorra || v.utilidadTotal || 0);
            }
        });

        var activeByDealer = {};
        AP.vehicles.filter(function(v) { return (v.estado === 'disponible' || !v.estado) && v.concesionario; }).forEach(function(v) {
            activeByDealer[v.concesionario] = (activeByDealer[v.concesionario] || 0) + 1;
        });

        container.innerHTML = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:1rem;">' +
            AP.dealers.map(function(d) {
                var m = metricsByDealer[d._docId] || { vendidos: 0, ventasAltorra: 0, comisiones: 0 };
                var active = activeByDealer[d._docId] || 0;
                return '<div style="background:var(--admin-surface);border:1px solid var(--admin-border);border-radius:12px;padding:1.25rem;">' +
                    '<div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:0.75rem;">' +
                        '<div><h4 style="margin:0;color:var(--admin-gold);">' + AP.escapeHtml(d.nombre || 'Sin nombre') + '</h4>' +
                        '<small style="color:var(--admin-text-muted);">' + AP.escapeHtml(d.ciudad || '') + (d.direccion ? ' - ' + AP.escapeHtml(d.direccion) : '') + '</small></div>' +
                        (AP.isSuperAdmin() ? '<button class="btn btn-sm btn-ghost" onclick="adminPanel.editDealer(\'' + d._docId + '\')" style="font-size:0.75rem;">Editar</button>' : '') +
                    '</div>' +
                    '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:0.5rem;text-align:center;">' +
                        '<div style="background:rgba(63,185,80,0.1);padding:0.5rem;border-radius:8px;"><div style="font-size:1.25rem;font-weight:800;color:var(--admin-success);">' + active + '</div><div style="font-size:0.7rem;color:var(--admin-text-muted);">Activos</div></div>' +
                        '<div style="background:rgba(212,175,55,0.1);padding:0.5rem;border-radius:8px;"><div style="font-size:1.25rem;font-weight:800;color:var(--admin-gold);">' + m.vendidos + '</div><div style="font-size:0.7rem;color:var(--admin-text-muted);">Vendidos</div></div>' +
                        '<div style="background:rgba(88,166,255,0.1);padding:0.5rem;border-radius:8px;"><div style="font-size:0.85rem;font-weight:800;color:var(--admin-info);">' + m.ventasAltorra + '</div><div style="font-size:0.7rem;color:var(--admin-text-muted);">Nuestras</div></div>' +
                        '<div style="background:rgba(63,185,80,0.1);padding:0.5rem;border-radius:8px;"><div style="font-size:0.85rem;font-weight:800;color:var(--admin-success);">$' + (m.comisiones > 0 ? (m.comisiones / 1000000).toFixed(1) + 'M' : '0') + '</div><div style="font-size:0.7rem;color:var(--admin-text-muted);">Comisiones</div></div>' +
                    '</div>' +
                    (d.telefono ? '<div style="margin-top:0.5rem;font-size:0.8rem;color:var(--admin-text-muted);">Tel: ' + d.telefono + '</div>' : '') +
                    (d.responsable ? '<div style="font-size:0.8rem;color:var(--admin-text-muted);">Responsable: ' + AP.escapeHtml(d.responsable) + '</div>' : '') +
                '</div>';
            }).join('') +
        '</div>';
    }

    // ========== DEALER MODAL ==========
    var btnAddDealer = $('btnAddDealer');
    if (btnAddDealer) {
        btnAddDealer.addEventListener('click', function() {
            if (!AP.RBAC.canManageDealers()) { AP.toast('Solo Super Admin puede gestionar concesionarios', 'error'); return; }
            $('dealerModalTitle').textContent = 'Agregar Aliado';
            $('dOriginalId').value = '';
            $('dealerForm').reset();
            $('dCiudad').value = 'Cartagena';
            $('dealerModal').classList.add('active');
        });
    }

    var closeDealerModalEl = $('closeDealerModal');
    if (closeDealerModalEl) closeDealerModalEl.addEventListener('click', function() { $('dealerModal').classList.remove('active'); });
    var cancelDealerModalEl = $('cancelDealerModal');
    if (cancelDealerModalEl) cancelDealerModalEl.addEventListener('click', function() { $('dealerModal').classList.remove('active'); });

    function editDealer(docId) {
        if (!AP.isSuperAdmin()) { AP.toast('Sin permisos', 'error'); return; }
        var d = AP.dealers.find(function(x) { return x._docId === docId; });
        if (!d) return;
        $('dealerModalTitle').textContent = 'Editar Aliado';
        $('dOriginalId').value = docId;
        $('dNombre').value = d.nombre || '';
        $('dDireccion').value = d.direccion || '';
        $('dTelefono').value = d.telefono || '';
        $('dCiudad').value = d.ciudad || 'Cartagena';
        $('dHorario').value = d.horario || '';
        $('dResponsable').value = d.responsable || '';
        $('dealerModal').classList.add('active');
    }

    var saveDealerBtn = $('saveDealer');
    if (saveDealerBtn) {
        saveDealerBtn.addEventListener('click', function() {
            if (!AP.isSuperAdmin()) { AP.toast('Sin permisos', 'error'); return; }
            var nombre = $('dNombre').value.trim();
            if (!nombre) { AP.toast('Nombre es requerido', 'error'); return; }

            var dealerData = {
                nombre: nombre,
                direccion: $('dDireccion').value.trim(),
                telefono: $('dTelefono').value.trim(),
                ciudad: $('dCiudad').value.trim() || 'Cartagena',
                horario: $('dHorario').value.trim(),
                responsable: $('dResponsable').value.trim(),
                updatedAt: new Date().toISOString(),
                updatedBy: window.auth.currentUser.email
            };

            var existingId = $('dOriginalId').value;
            var savePromise;
            if (existingId) {
                savePromise = window.db.collection('concesionarios').doc(existingId).update(dealerData);
            } else {
                var docId = nombre.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
                savePromise = window.db.collection('concesionarios').doc(docId).set(dealerData);
            }

            savePromise.then(function() {
                AP.toast(existingId ? 'Aliado actualizado' : 'Aliado creado');
                AP.writeAuditLog(existingId ? 'dealer_update' : 'dealer_create', 'aliado ' + nombre, '');
                $('dealerModal').classList.remove('active');
            }).catch(function(err) {
                if (err.code === 'permission-denied') {
                    AP.toast('Sin permisos. Verifica que las Firestore Rules esten desplegadas y tu rol sea super_admin.', 'error');
                } else {
                    AP.toast('Error: ' + err.message, 'error');
                }
            });
        });
    }

    // ========== VEHICLES BY ORIGIN (Aliados tab) ==========
    function renderVehiclesByOrigin() {
        var body = $('vehiclesByOriginBody');
        if (!body) return;

        var allyVehicles = AP.vehicles.filter(function(v) { return !isVehiclePropio(v); });
        var vehiclesWithOrigin = allyVehicles.map(function(v) {
            return { vehicle: v, origin: getVehicleOriginName(v) };
        });

        vehiclesWithOrigin.sort(function(a, b) { return a.origin.localeCompare(b.origin); });

        if (vehiclesWithOrigin.length === 0) {
            body.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--admin-text-muted);padding:2rem;">No hay vehiculos de aliados</td></tr>';
            return;
        }

        body.innerHTML = vehiclesWithOrigin.map(function(item) {
            var v = item.vehicle;
            var marca = v.marca ? (v.marca.charAt(0).toUpperCase() + v.marca.slice(1)) : '';
            var estadoInfo = AP.ESTADO_LABELS[v.estado || 'disponible'] || AP.ESTADO_LABELS.disponible;
            return '<tr>' +
                '<td><strong>' + marca + ' ' + (v.modelo || '') + ' ' + (v.year || '') + '</strong></td>' +
                '<td>' + AP.escapeHtml(item.origin) + '</td>' +
                '<td><span class="badge ' + estadoInfo.cls + '">' + estadoInfo.text + '</span></td>' +
                '<td>' + AP.formatPrice(v.precio) + '</td>' +
            '</tr>';
        }).join('');
    }

    // ========== VEHICULOS PROPIOS TAB ==========
    function renderPropiosTab() {
        var body = $('propiosTableBody');
        var summary = $('propiosSummary');
        if (!body) return;

        var propios = AP.vehicles.filter(function(v) { return isVehiclePropio(v); });
        var activos = propios.filter(function(v) { return v.estado === 'disponible' || !v.estado; });
        var vendidos = propios.filter(function(v) { return v.estado === 'vendido'; });
        var vendidosAltorra = vendidos.filter(function(v) { return v.canalVenta === 'altorra'; });
        var totalIngresos = vendidosAltorra.reduce(function(s, v) { return s + (v.precioVenta || v.precioCierre || 0); }, 0);
        var totalUtilidad = vendidosAltorra.reduce(function(s, v) { return s + (v.utilidadAltorra || v.utilidadTotal || 0); }, 0);

        if (summary) {
            summary.innerHTML =
                '<div class="stat-card" style="padding:0.75rem;text-align:center;"><div style="font-size:0.75rem;color:var(--admin-text-muted);">Activos</div><div style="font-size:1.5rem;font-weight:700;color:var(--admin-success,#3fb950);">' + activos.length + '</div></div>' +
                '<div class="stat-card" style="padding:0.75rem;text-align:center;"><div style="font-size:0.75rem;color:var(--admin-text-muted);">Vendidos</div><div style="font-size:1.5rem;font-weight:700;">' + vendidos.length + '</div></div>' +
                '<div class="stat-card" style="padding:0.75rem;text-align:center;"><div style="font-size:0.75rem;color:var(--admin-text-muted);">Ingresos</div><div style="font-size:1.1rem;font-weight:700;color:var(--admin-info,#58a6ff);">' + AP.formatPrice(totalIngresos) + '</div><div style="font-size:0.65rem;color:var(--admin-text-muted);">ventas propias</div></div>' +
                '<div class="stat-card" style="padding:0.75rem;text-align:center;"><div style="font-size:0.75rem;color:var(--admin-text-muted);">Utilidad</div><div style="font-size:1.1rem;font-weight:700;color:var(--admin-success,#3fb950);">' + AP.formatPrice(totalUtilidad) + '</div></div>';
        }

        if (propios.length === 0) {
            body.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--admin-text-muted);padding:2rem;">No hay vehiculos propios registrados.</td></tr>';
            return;
        }

        body.innerHTML = propios.map(function(v) {
            var marca = v.marca ? (v.marca.charAt(0).toUpperCase() + v.marca.slice(1)) : '';
            var estadoInfo = AP.ESTADO_LABELS[v.estado || 'disponible'] || AP.ESTADO_LABELS.disponible;
            var esVendido = v.estado === 'vendido';
            var esAltorra = v.canalVenta === 'altorra';
            var precioVenta = esVendido && esAltorra ? AP.formatPrice(v.precioVenta || v.precioCierre || 0) : (esVendido ? '<small style="color:var(--admin-text-muted);">Terceros</small>' : '-');
            var utilidad = esVendido && esAltorra ? AP.formatPrice(v.utilidadAltorra || v.utilidadTotal || 0) : '-';
            var utilColor = (v.utilidadAltorra || v.utilidadTotal) > 0 && esAltorra ? 'var(--admin-success,#3fb950)' : '';
            var canalInfo = esVendido ? (esAltorra ? '<span style="color:var(--admin-gold);font-size:0.75rem;">ALTORRA</span>' : '<span style="color:var(--admin-text-muted);font-size:0.75rem;">Otros</span>') : '-';
            return '<tr>' +
                '<td><code style="font-size:0.75rem;color:var(--admin-accent,#58a6ff);">' + AP.escapeHtml(v.codigoUnico || '—') + '</code></td>' +
                '<td><strong>' + marca + ' ' + (v.modelo || '') + '</strong><br><small>' + (v.year || '') + '</small></td>' +
                '<td><span class="badge ' + estadoInfo.cls + '">' + estadoInfo.text + '</span></td>' +
                '<td>' + canalInfo + '</td>' +
                '<td>' + AP.formatPrice(v.precio) + '</td>' +
                '<td>' + precioVenta + '</td>' +
                '<td style="font-weight:600;' + (utilColor ? 'color:' + utilColor + ';' : '') + '">' + utilidad + '</td>' +
            '</tr>';
        }).join('');
    }

    // ========== DEALERS TABS NAVIGATION ==========
    document.querySelectorAll('.dealers-tab').forEach(function(tab) {
        tab.addEventListener('click', function() {
            var target = this.dataset.dealersTab;
            document.querySelectorAll('.dealers-tab').forEach(function(t) { t.classList.remove('active'); });
            document.querySelectorAll('.dealers-tab-content').forEach(function(c) { c.style.display = 'none'; c.classList.remove('active'); });
            this.classList.add('active');
            var targetEl = $('dealersTab' + target.charAt(0).toUpperCase() + target.slice(1));
            if (targetEl) { targetEl.style.display = ''; targetEl.classList.add('active'); }
        });
    });

    // ========== EXPOSE ==========
    AP.loadDealers = loadDealers;
    AP.renderDealersList = renderDealersList;
    AP.editDealer = editDealer;
    AP.renderVehiclesByOrigin = renderVehiclesByOrigin;
    AP.renderPropiosTab = renderPropiosTab;
    AP.getVehicleOriginName = getVehicleOriginName;
    AP.isVehiclePropio = isVehiclePropio;
})();
