// Admin Panel — Dynamic Lists Management
(function() {
    'use strict';
    var AP = window.AP;
    var $ = AP.$;

    var LIST_LABELS = {
        tipos: { title: 'Tipos de Vehiculo', desc: 'Nuevo, Usado, etc.' },
        categorias: { title: 'Categorias', desc: 'Sedan, SUV, Pickup, etc.' },
        transmisiones: { title: 'Transmisiones', desc: 'Automatica, Mecanica, etc.' },
        combustibles: { title: 'Combustibles', desc: 'Gasolina, Diesel, Electrico, etc.' },
        direcciones: { title: 'Direcciones', desc: 'Electrica, Hidraulica, etc.' },
        tracciones: { title: 'Tracciones', desc: 'Delantera, 4x4, AWD, etc.' },
        colores: { title: 'Colores', desc: 'Blanco, Negro, Rojo, etc.' },
        canalesVenta: { title: 'Canales de Venta', desc: 'Presencial, WhatsApp, Redes, etc.' },
        featSeguridad: { title: 'Caracteristicas: Seguridad', desc: 'ABS, Airbags, Alarma, etc.' },
        featConfort: { title: 'Caracteristicas: Confort', desc: 'Aire acondicionado, Asientos cuero, etc.' },
        featTecnologia: { title: 'Caracteristicas: Tecnologia', desc: 'Pantalla tactil, Bluetooth, etc.' },
        featExterior: { title: 'Caracteristicas: Exterior', desc: 'Luces LED, Rines aluminio, etc.' },
        featInterior: { title: 'Caracteristicas: Interior', desc: 'Vidrios electricos, Tapizado, etc.' }
    };

    function renderListsSection() {
        var container = $('listsContainer');
        if (!container) return;

        var lists = window.DynamicLists ? window.DynamicLists.getLists() : {};
        var defaults = window.DynamicLists ? window.DynamicLists.DEFAULTS : {};

        container.innerHTML = '';
        Object.keys(LIST_LABELS).forEach(function(key) {
            var info = LIST_LABELS[key];
            var items = lists[key] || defaults[key] || [];
            var card = document.createElement('div');
            card.className = 'stat-card';
            card.style.padding = '1.25rem';

            var itemsHtml = items.map(function(item, idx) {
                var val = typeof item === 'string' ? item : item.value;
                var label = typeof item === 'string' ? item : item.label;
                return '<div class="list-item-row" style="display:flex;align-items:center;gap:0.5rem;padding:0.35rem 0;border-bottom:1px solid var(--admin-border);">' +
                    '<input type="text" class="form-input" value="' + AP.escapeHtml(val) + '" data-list="' + key + '" data-idx="' + idx + '" data-field="value" style="flex:1;padding:0.3rem 0.5rem;font-size:0.85rem;" placeholder="Valor">' +
                    '<input type="text" class="form-input" value="' + AP.escapeHtml(label) + '" data-list="' + key + '" data-idx="' + idx + '" data-field="label" style="flex:1;padding:0.3rem 0.5rem;font-size:0.85rem;" placeholder="Etiqueta">' +
                    '<button class="btn btn-danger btn-sm" style="padding:0.2rem 0.5rem;font-size:0.75rem;" onclick="adminPanel.removeListItem(\'' + key + '\',' + idx + ')">&times;</button>' +
                '</div>';
            }).join('');

            card.innerHTML =
                '<h4 style="margin:0 0 0.25rem;color:var(--admin-gold);font-size:0.95rem;">' + info.title + '</h4>' +
                '<p style="font-size:0.75rem;color:var(--admin-text-muted);margin:0 0 0.75rem;">' + info.desc + '</p>' +
                '<div id="list-items-' + key + '">' + itemsHtml + '</div>' +
                '<div style="display:flex;gap:0.5rem;margin-top:0.75rem;">' +
                    '<button class="btn btn-ghost btn-sm" onclick="adminPanel.addListItem(\'' + key + '\')" style="font-size:0.8rem;">+ Agregar</button>' +
                    '<button class="btn btn-primary btn-sm" onclick="adminPanel.saveList(\'' + key + '\')" style="font-size:0.8rem;">Guardar</button>' +
                '</div>';
            container.appendChild(card);
        });
    }

    function addListItem(listKey) {
        var container = $('list-items-' + listKey);
        if (!container) return;
        var items = container.querySelectorAll('.list-item-row');
        var idx = items.length;
        var row = document.createElement('div');
        row.className = 'list-item-row';
        row.style = 'display:flex;align-items:center;gap:0.5rem;padding:0.35rem 0;border-bottom:1px solid var(--admin-border);';
        row.innerHTML =
            '<input type="text" class="form-input" data-list="' + listKey + '" data-idx="' + idx + '" data-field="value" style="flex:1;padding:0.3rem 0.5rem;font-size:0.85rem;" placeholder="Valor (ej: hibrido)">' +
            '<input type="text" class="form-input" data-list="' + listKey + '" data-idx="' + idx + '" data-field="label" style="flex:1;padding:0.3rem 0.5rem;font-size:0.85rem;" placeholder="Etiqueta (ej: Hibrido)">' +
            '<button class="btn btn-danger btn-sm" style="padding:0.2rem 0.5rem;font-size:0.75rem;" onclick="this.parentElement.remove()">&times;</button>';
        container.appendChild(row);
        row.querySelector('input').focus();
    }

    function removeListItem(listKey, idx) {
        var container = $('list-items-' + listKey);
        if (!container) return;
        var rows = container.querySelectorAll('.list-item-row');
        if (rows[idx]) rows[idx].remove();
    }

    function saveList(listKey) {
        if (!AP.isSuperAdmin()) { AP.toast('Solo Super Admin puede modificar listas', 'error'); return; }
        var container = $('list-items-' + listKey);
        if (!container) return;

        var rows = container.querySelectorAll('.list-item-row');
        var items = [];
        rows.forEach(function(row) {
            var valInput = row.querySelector('input[data-field="value"]');
            var labelInput = row.querySelector('input[data-field="label"]');
            if (valInput && labelInput && valInput.value.trim()) {
                items.push({ value: valInput.value.trim(), label: labelInput.value.trim() || valInput.value.trim() });
            }
        });

        if (items.length === 0) { AP.toast('La lista no puede quedar vacia', 'error'); return; }

        var currentLists = window.DynamicLists ? JSON.parse(JSON.stringify(window.DynamicLists.getLists())) : {};
        currentLists[listKey] = items;

        window.DynamicLists.saveLists(currentLists).then(function() {
            AP.toast('Lista "' + (LIST_LABELS[listKey] ? LIST_LABELS[listKey].title : listKey) + '" guardada');
            AP.writeAuditLog('list_update', 'lista ' + listKey, items.length + ' opciones');
            if (window.DynamicLists) {
                window.DynamicLists.populateAdminForm();
            }
        }).catch(function(err) {
            AP.toast('Error: ' + err.message, 'error');
        });
    }

    // ========== EXPOSE ==========
    AP.renderListsSection = renderListsSection;
    AP.addListItem = addListItem;
    AP.removeListItem = removeListItem;
    AP.saveList = saveList;
})();
