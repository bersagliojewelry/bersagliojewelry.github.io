// Admin Panel — Activity Feed & Audit Log
(function() {
    'use strict';
    var AP = window.AP;
    var $ = AP.$;

    function loadAuditLog() {
        if (AP.unsubAuditLog) AP.unsubAuditLog();
        AP.unsubAuditLog = window.db.collection('auditLog')
            .orderBy('timestamp', 'desc')
            .limit(200)
            .onSnapshot(function(snap) {
                AP.auditLogEntries = snap.docs.map(function(doc) {
                    var data = doc.data();
                    data._docId = doc.id;
                    return data;
                });
                renderActivityFeed();
            }, function(err) {
                console.warn('[AuditLog] Error loading:', err);
                renderActivityFeedFallback();
            });
    }

    function getActivityIcon(action) {
        var icons = {
            'login': '🔑', 'vehicle_create': '➕', 'vehicle_update': '✏️',
            'vehicle_delete': '🗑️', 'vehicle_sold': '💰', 'brand_create': '🏷️',
            'brand_update': '🏷️', 'brand_delete': '🗑️', 'dealer_create': '🏢',
            'dealer_update': '🏢', 'backup_export': '📦', 'backup_import': '📥',
            'list_update': '📋', 'appointment_confirmada': '📅', 'appointment_cancelada': '❌'
        };
        return icons[action] || '📝';
    }

    function getActivityText(item) {
        var actionTexts = {
            'login': 'inició sesión', 'vehicle_create': 'creó vehículo',
            'vehicle_update': 'actualizó vehículo', 'vehicle_delete': 'eliminó vehículo',
            'vehicle_sold': 'registró venta de', 'brand_create': 'creó marca',
            'brand_update': 'actualizó marca', 'brand_delete': 'eliminó marca',
            'dealer_create': 'creó concesionario', 'dealer_update': 'actualizó concesionario',
            'backup_export': 'exportó respaldo', 'backup_import': 'importó respaldo',
            'list_update': 'actualizó lista', 'appointment_confirmada': 'confirmó cita',
            'appointment_cancelada': 'canceló cita'
        };
        return actionTexts[item.action] || item.action || 'realizó acción';
    }

    function buildActivityItemHTML(item) {
        var who = item.user || item.updatedBy || 'Admin';
        if (who.indexOf('@') > 0) who = who.split('@')[0];
        var when = (item.timestamp || item.updatedAt) ? AP.formatTimeAgo(item.timestamp || item.updatedAt) : '';
        var icon = getActivityIcon(item.action || item._actType);
        var actionText = getActivityText(item);
        var target = item.target || item.details || '';
        var details = item.details || '';
        var docId = item._docId || '';

        var checkboxHtml = '';
        if (AP.activitySelectMode && docId) {
            var checked = AP.selectedActivityIds.indexOf(docId) >= 0 ? ' checked' : '';
            checkboxHtml = '<input type="checkbox" class="activity-checkbox" data-id="' + docId + '"' + checked + '> ';
        }

        return '<div class="activity-item' + (AP.activitySelectMode ? ' selectable' : '') + '" data-doc-id="' + docId + '">' +
            checkboxHtml +
            '<span class="activity-icon">' + icon + '</span>' +
            '<div class="activity-content">' +
                '<span class="activity-who">' + AP.escapeHtml(who) + '</span> ' +
                actionText + ' ' +
                (target ? '<span class="activity-vehicle">' + AP.escapeHtml(target) + '</span>' : '') +
                (details && details !== target ? ' <span class="activity-details">' + AP.escapeHtml(details) + '</span>' : '') +
                '<div class="activity-time">' + when + '</div>' +
            '</div>' +
        '</div>';
    }

    function renderActivityFeed() {
        var feed = $('activityFeed');
        if (!feed) return;

        var allItems = AP.auditLogEntries.slice();
        if (allItems.length === 0) {
            feed.innerHTML = '<div class="activity-empty">Sin actividad reciente</div>';
            updateActivityControls(0);
            return;
        }

        var showAll = AP.activityExpanded;
        var visible = showAll ? allItems : allItems.slice(0, AP.ACTIVITY_PAGE_SIZE);
        var html = visible.map(buildActivityItemHTML).join('');

        if (!showAll && allItems.length > AP.ACTIVITY_PAGE_SIZE) {
            html += '<button class="activity-show-more" id="btnActivityMore">Ver toda la actividad (' + allItems.length + ' registros)</button>';
        } else if (showAll && allItems.length > AP.ACTIVITY_PAGE_SIZE) {
            html += '<button class="activity-show-more" id="btnActivityLess">Mostrar menos</button>';
        }

        feed.innerHTML = html;
        updateActivityControls(allItems.length);

        if (AP.activitySelectMode) {
            feed.querySelectorAll('.activity-checkbox').forEach(function(cb) {
                cb.addEventListener('change', function() {
                    var id = this.getAttribute('data-id');
                    if (this.checked) {
                        if (AP.selectedActivityIds.indexOf(id) === -1) AP.selectedActivityIds.push(id);
                    } else {
                        AP.selectedActivityIds = AP.selectedActivityIds.filter(function(x) { return x !== id; });
                    }
                    updateDeleteSelectedBtn();
                });
            });
        }

        var btnMore = $('btnActivityMore');
        if (btnMore) btnMore.addEventListener('click', function() { AP.activityExpanded = true; feed.style.maxHeight = 'none'; renderActivityFeed(); });
        var btnLess = $('btnActivityLess');
        if (btnLess) btnLess.addEventListener('click', function() { AP.activityExpanded = false; feed.style.maxHeight = '420px'; renderActivityFeed(); feed.scrollTop = 0; });
    }

    function renderActivityFeedFallback() {
        var feed = $('activityFeed');
        if (!feed) return;
        var allItems = [];
        AP.vehicles.forEach(function(v) { if (v.updatedAt) allItems.push(v); });
        AP.brands.forEach(function(b) { if (b.updatedAt) allItems.push(Object.assign({ _actType: 'brand' }, b)); });
        allItems.sort(function(a, b) { return (b.updatedAt || '').localeCompare(a.updatedAt || ''); });
        if (allItems.length === 0) { feed.innerHTML = '<div class="activity-empty">Sin actividad reciente</div>'; return; }
        var visible = allItems.slice(0, AP.ACTIVITY_PAGE_SIZE);
        feed.innerHTML = visible.map(function(item) {
            var who = item.updatedBy || 'Admin';
            if (who.indexOf('@') > 0) who = who.split('@')[0];
            var when = item.updatedAt ? AP.formatTimeAgo(item.updatedAt) : '';
            var icon = item._actType === 'brand' ? '🏷️' : (item._version === 1 ? '➕' : '✏️');
            var name = item._actType === 'brand' ? (item.nombre || '') : ((item.marca ? AP.capitalize(item.marca) : '') + ' ' + (item.modelo || '') + ' ' + (item.year || '')).trim();
            return '<div class="activity-item"><span class="activity-icon">' + icon + '</span><div class="activity-content"><span class="activity-who">' + AP.escapeHtml(who) + '</span> actualizó <span class="activity-vehicle">' + AP.escapeHtml(name) + '</span><div class="activity-time">' + when + '</div></div></div>';
        }).join('');
    }

    function updateActivityControls(count) {
        var countEl = $('activityCount');
        if (countEl) countEl.textContent = count > 0 ? '(' + count + ')' : '';
    }

    function updateDeleteSelectedBtn() {
        var btn = $('btnDeleteSelectedActivity');
        if (btn) {
            btn.textContent = 'Eliminar seleccionados (' + AP.selectedActivityIds.length + ')';
            btn.disabled = AP.selectedActivityIds.length === 0;
        }
    }

    function toggleActivitySelectMode() {
        AP.activitySelectMode = !AP.activitySelectMode;
        AP.selectedActivityIds = [];
        var btn = $('btnSelectActivity');
        if (btn) btn.textContent = AP.activitySelectMode ? 'Cancelar' : 'Seleccionar';
        var actionsEl = $('activitySelectActions');
        if (actionsEl) actionsEl.style.display = AP.activitySelectMode ? 'flex' : 'none';
        renderActivityFeed();
    }

    function deleteSelectedActivity() {
        if (AP.selectedActivityIds.length === 0) return;
        if (!confirm('Eliminar ' + AP.selectedActivityIds.length + ' registros de actividad?')) return;
        var batch = window.db.batch();
        AP.selectedActivityIds.forEach(function(docId) {
            batch.delete(window.db.collection('auditLog').doc(docId));
        });
        batch.commit().then(function() {
            AP.toast(AP.selectedActivityIds.length + ' registros eliminados');
            AP.selectedActivityIds = [];
            AP.activitySelectMode = false;
            var btn = $('btnSelectActivity');
            if (btn) btn.textContent = 'Seleccionar';
            var actionsEl = $('activitySelectActions');
            if (actionsEl) actionsEl.style.display = 'none';
        }).catch(function(err) { AP.toast('Error al eliminar: ' + err.message, 'error'); });
    }

    function clearAllActivity() {
        if (!confirm('Eliminar TODA la actividad reciente? Esta accion no se puede deshacer.')) return;
        var batch = window.db.batch();
        var count = 0;
        AP.auditLogEntries.forEach(function(entry) {
            if (entry._docId) { batch.delete(window.db.collection('auditLog').doc(entry._docId)); count++; }
        });
        if (count === 0) { AP.toast('No hay actividad para limpiar', 'info'); return; }
        batch.commit().then(function() {
            AP.toast(count + ' registros de actividad eliminados');
            AP.activitySelectMode = false;
            AP.selectedActivityIds = [];
            var btn = $('btnSelectActivity');
            if (btn) btn.textContent = 'Seleccionar';
            var actionsEl = $('activitySelectActions');
            if (actionsEl) actionsEl.style.display = 'none';
        }).catch(function(err) { AP.toast('Error: ' + err.message, 'error'); });
    }

    // Expose
    AP.loadAuditLog = loadAuditLog;
    AP.renderActivityFeed = renderActivityFeed;
    AP.toggleActivitySelectMode = toggleActivitySelectMode;
    AP.toggleActivitySelect = toggleActivitySelectMode; // alias used in HTML onclick
    AP.deleteSelectedActivity = deleteSelectedActivity;
    AP.clearAllActivity = clearAllActivity;
})();
