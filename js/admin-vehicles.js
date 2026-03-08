// Admin Panel — Vehicle CRUD, Images, Drafts & Preview
(function() {
    'use strict';
    var AP = window.AP;
    var $ = AP.$;

    // ========== UNIQUE VEHICLE CODE ==========
    // Format: ALT-YYYYMM-XXXX (auto-generated, immutable, never reused)
    function generateUniqueCode() {
        var counterRef = window.db.collection('config').doc('counters');
        return window.db.runTransaction(function(transaction) {
            return transaction.get(counterRef).then(function(doc) {
                var data = doc.exists ? doc.data() : {};
                var nextSeq = (data.vehicleCodeSeq || 0) + 1;
                transaction.set(counterRef, { vehicleCodeSeq: nextSeq }, { merge: true });
                var now = new Date();
                var yyyy = now.getFullYear();
                var mm = String(now.getMonth() + 1).padStart(2, '0');
                var seq = String(nextSeq).padStart(4, '0');
                return 'ALT-' + yyyy + mm + '-' + seq;
            });
        });
    }

    // ========== BRAND SELECT ==========
    function populateBrandSelect() {
        var select = $('vMarca');
        var currentVal = select.value;
        select.innerHTML = '<option value="">Seleccionar...</option>';
        AP.brands.sort(function(a, b) { return a.nombre.localeCompare(b.nombre); });
        AP.brands.forEach(function(b) {
            var opt = document.createElement('option');
            opt.value = b.id;
            opt.textContent = b.nombre;
            select.appendChild(opt);
        });
        if (currentVal) select.value = currentVal;
    }

    // ========== VEHICLES TABLE ==========
    var _reorderMode = false;
    var _dragSrcRow = null;

    function renderVehiclesTable(filter) {
        var filtered = AP.vehicles;
        if (filter) {
            var q = filter.toLowerCase();
            filtered = AP.vehicles.filter(function(v) {
                return (v.marca + ' ' + v.modelo + ' ' + v.year + ' ' + (v.estado || '') + ' ' + (v.codigoUnico || '')).toLowerCase().indexOf(q) >= 0;
            });
        }
        // In reorder mode sort by prioridad desc, otherwise by id
        if (_reorderMode) {
            filtered.sort(function(a, b) {
                var pa = a.prioridad || 0, pb = b.prioridad || 0;
                if (pa !== pb) return pb - pa;
                return a.id - b.id;
            });
        } else {
            filtered.sort(function(a, b) { return a.id - b.id; });
        }

        var maxPrio = 1;
        filtered.forEach(function(v) { if ((v.prioridad || 0) > maxPrio) maxPrio = v.prioridad; });

        var html = '';
        var colCount = _reorderMode ? 10 : 8;
        filtered.forEach(function(v) {
            var estado = v.estado || 'disponible';
            var estadoInfo = AP.ESTADO_LABELS[estado] || AP.ESTADO_LABELS.disponible;
            var estadoBadge = '<span class="badge ' + estadoInfo.cls + '">' + estadoInfo.text + '</span>';
            var actions = '<button class="btn btn-ghost btn-sm" onclick="adminPanel.previewVehicle(' + v.id + ')" title="Vista previa">👁</button> ';
            var esVendido = estado === 'vendido';
            if (AP.canCreateOrEditInventory()) {
                actions += '<button class="btn btn-ghost btn-sm" onclick="adminPanel.toggleDestacado(' + v.id + ')" title="' + (v.destacado ? 'Quitar de destacados' : 'Marcar como destacado') + '" style="font-size:1rem;padding:2px 7px;">' + (v.destacado ? '⭐' : '☆') + '</button> ';
                if (esVendido && !AP.isSuperAdmin()) {
                    actions += '<button class="btn btn-ghost btn-sm" disabled title="Solo Super Admin puede editar vehiculos vendidos" style="opacity:0.4;cursor:not-allowed;">Editar</button> ';
                    actions += '<span style="font-size:0.65rem;color:var(--admin-danger,#ef4444);">Protegido</span> ';
                } else {
                    actions += '<button class="btn btn-ghost btn-sm" onclick="adminPanel.editVehicle(' + v.id + ')">Editar</button> ';
                }
                if (estado === 'disponible') {
                    actions += '<button class="btn btn-sm" style="color:var(--admin-info);border-color:var(--admin-info);" onclick="adminPanel.markAsSold(' + v.id + ')">Gestionar Operacion</button> ';
                }
            }
            if (AP.canDeleteInventory()) {
                actions += '<button class="btn btn-danger btn-sm" onclick="adminPanel.deleteVehicle(' + v.id + ')">Eliminar</button>';
            }
            var origen = 'Propio';
            if (v.concesionario && v.concesionario !== '' && v.concesionario !== '_particular') {
                var dealer = AP.dealers.find(function(x) { return x._docId === v.concesionario; });
                origen = dealer ? dealer.nombre : v.concesionario;
            } else if (v.concesionario === '_particular' && v.consignaParticular) {
                origen = 'Consigna: ' + v.consignaParticular;
            }

            var prio = v.prioridad || 0;
            var barPct = maxPrio > 0 ? Math.round((prio / maxPrio) * 100) : 0;
            var barColor = prio === 0 ? '#333' : prio >= 70 ? '#b89658' : prio >= 30 ? '#f59e0b' : '#6b7280';

            var dragCell = _reorderMode ? '<td class="col-drag" style="cursor:grab;text-align:center;color:var(--admin-text-muted);font-size:1.1rem;" title="Arrastra para reordenar">☰</td>' : '';
            var posCell = _reorderMode ? '<td class="col-pos" style="min-width:70px;">' +
                '<div style="display:flex;align-items:center;gap:6px;">' +
                    '<span style="font-weight:700;font-size:0.8rem;min-width:22px;color:' + (prio > 0 ? '#b89658' : 'var(--admin-text-muted)') + ';">' + prio + '</span>' +
                    '<div style="flex:1;height:6px;background:#1e1e1e;border-radius:3px;overflow:hidden;min-width:30px;">' +
                        '<div style="height:100%;width:' + barPct + '%;background:' + barColor + ';border-radius:3px;transition:width 0.3s;"></div>' +
                    '</div>' +
                '</div>' +
            '</td>' : '';

            html += '<tr data-vehicle-id="' + v.id + '"' + (_reorderMode ? ' draggable="true"' : '') + '>' +
                dragCell +
                '<td><code style="font-size:0.75rem;color:var(--admin-accent,#58a6ff);">' + AP.escapeHtml(v.codigoUnico || '—') + '</code></td>' +
                '<td><img class="vehicle-thumb" src="' + (v.imagen || 'multimedia/vehicles/placeholder-car.jpg') + '" alt="" onerror="this.src=\'multimedia/vehicles/placeholder-car.jpg\'"></td>' +
                '<td><strong>' + (v.marca || '').charAt(0).toUpperCase() + (v.marca || '').slice(1) + ' ' + (v.modelo || '') + '</strong><br><small style="color:#8b949e">' + v.year + ' &middot; ' + (v.categoria || '') + '</small></td>' +
                '<td><span class="badge badge-' + v.tipo + '">' + v.tipo + '</span></td>' +
                '<td>' + AP.formatPrice(v.precio) + (v.precioOferta ? '<br><small style="color: var(--admin-warning);">' + AP.formatPrice(v.precioOferta) + '</small>' : '') + '</td>' +
                '<td>' + estadoBadge + '</td>' +
                posCell +
                '<td><small style="color:var(--admin-text-secondary);">' + AP.escapeHtml(origen) + '</small></td>' +
                '<td>' + actions + '</td>' +
            '</tr>';
        });
        if (!html) html = '<tr><td colspan="' + colCount + '" style="text-align:center; padding:2rem; color:#8b949e;">No se encontraron vehiculos</td></tr>';
        $('vehiclesTableBody').innerHTML = html;

        if (_reorderMode) initTableDragDrop();
    }

    // ========== REORDER MODE TOGGLE ==========
    function toggleReorderMode() {
        if (!AP.canCreateOrEditInventory()) {
            AP.toast('No tienes permisos para reordenar vehiculos', 'error');
            return;
        }
        _reorderMode = !_reorderMode;
        var btn = $('toggleReorderMode');
        if (btn) {
            btn.classList.toggle('active', _reorderMode);
            btn.style.background = _reorderMode ? 'rgba(184,150,88,0.15)' : '';
            btn.style.borderColor = _reorderMode ? '#b89658' : '';
            btn.style.color = _reorderMode ? '#b89658' : '';
        }

        // Toggle column visibility
        document.querySelectorAll('.col-drag, .col-pos').forEach(function(el) {
            el.style.display = _reorderMode ? '' : 'none';
        });

        renderVehiclesTable($('vehicleSearch').value);

        if (_reorderMode) {
            AP.toast('Modo reordenar activo — arrastra filas para cambiar posicion', 'info');
        }
    }

    var toggleBtn = $('toggleReorderMode');
    if (toggleBtn) toggleBtn.addEventListener('click', toggleReorderMode);

    // ========== TABLE DRAG & DROP ==========
    function initTableDragDrop() {
        var tbody = $('vehiclesTableBody');
        if (!tbody) return;
        var rows = tbody.querySelectorAll('tr[draggable="true"]');

        rows.forEach(function(row) {
            row.addEventListener('dragstart', function(e) {
                _dragSrcRow = this;
                this.style.opacity = '0.4';
                this.style.background = 'rgba(184,150,88,0.1)';
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', this.getAttribute('data-vehicle-id'));
            });

            row.addEventListener('dragend', function() {
                this.style.opacity = '';
                this.style.background = '';
                tbody.querySelectorAll('tr').forEach(function(r) {
                    r.classList.remove('drag-over-top', 'drag-over-bottom');
                });
            });

            row.addEventListener('dragover', function(e) {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                if (this === _dragSrcRow) return;

                // Show indicator above or below
                var rect = this.getBoundingClientRect();
                var midY = rect.top + rect.height / 2;
                tbody.querySelectorAll('tr').forEach(function(r) {
                    r.classList.remove('drag-over-top', 'drag-over-bottom');
                });
                if (e.clientY < midY) {
                    this.classList.add('drag-over-top');
                } else {
                    this.classList.add('drag-over-bottom');
                }
            });

            row.addEventListener('dragleave', function() {
                this.classList.remove('drag-over-top', 'drag-over-bottom');
            });

            row.addEventListener('drop', function(e) {
                e.preventDefault();
                this.classList.remove('drag-over-top', 'drag-over-bottom');
                if (this === _dragSrcRow || !_dragSrcRow) return;

                var srcId = parseInt(_dragSrcRow.getAttribute('data-vehicle-id'));
                var targetId = parseInt(this.getAttribute('data-vehicle-id'));
                handlePrioritySwap(srcId, targetId);
                _dragSrcRow = null;
            });
        });
    }

    // ========== PRIORITY SWAP / COLLISION DETECTION ==========
    function handlePrioritySwap(srcId, targetId) {
        var srcVehicle = AP.vehicles.find(function(v) { return v.id === srcId; });
        var targetVehicle = AP.vehicles.find(function(v) { return v.id === targetId; });
        if (!srcVehicle || !targetVehicle) return;

        var srcPrio = srcVehicle.prioridad || 0;
        var targetPrio = targetVehicle.prioridad || 0;

        // Swap priorities
        var newSrcPrio = targetPrio;
        var newTargetPrio = srcPrio;

        // If both are 0, assign sequential values based on position
        if (srcPrio === 0 && targetPrio === 0) {
            newSrcPrio = 10;
            newTargetPrio = 5;
        }

        // Check for collisions with other vehicles
        var collision = AP.vehicles.find(function(v) {
            return v.id !== srcId && v.id !== targetId && (v.prioridad || 0) === newSrcPrio && newSrcPrio > 0;
        });

        if (collision) {
            // Offer resolution
            var confirm = window.confirm(
                'Colision de posicion detectada:\n\n' +
                '• ' + (srcVehicle.marca || '') + ' ' + (srcVehicle.modelo || '') + ' → posicion ' + newSrcPrio + '\n' +
                '• ' + (collision.marca || '') + ' ' + (collision.modelo || '') + ' ya tiene posicion ' + newSrcPrio + '\n\n' +
                '¿Desplazar automaticamente el vehiculo en conflicto?'
            );
            if (confirm) {
                // Shift conflicting vehicle down by 1
                var shiftedPrio = Math.max(0, newSrcPrio - 1);
                savePriorityToFirestore(collision.id, shiftedPrio);
            }
        }

        // Save both vehicles
        var srcName = (srcVehicle.marca || '') + ' ' + (srcVehicle.modelo || '');
        var targetName = (targetVehicle.marca || '') + ' ' + (targetVehicle.modelo || '');

        Promise.all([
            savePriorityToFirestore(srcId, newSrcPrio),
            savePriorityToFirestore(targetId, newTargetPrio)
        ]).then(function() {
            AP.toast('Posiciones intercambiadas: ' + srcName + ' ↔ ' + targetName, 'success');
            AP.writeAuditLog('reordenar', 'vehiculo', srcName + ' (pos ' + newSrcPrio + ') ↔ ' + targetName + ' (pos ' + newTargetPrio + ')');
        }).catch(function(err) {
            AP.toast('Error al guardar posiciones: ' + err.message, 'error');
        });
    }

    function savePriorityToFirestore(vehicleId, priority) {
        return window.db.collection('vehiculos').doc(String(vehicleId)).update({
            prioridad: priority,
            updatedAt: new Date().toISOString()
        });
    }

    $('vehicleSearch').addEventListener('input', function() { renderVehiclesTable(this.value); });

    // ========== VEHICLE MODAL ==========
    function openModal() {
        document.querySelectorAll('#vehicleForm .form-section-body').forEach(function(body) { body.classList.add('open'); });
        document.querySelectorAll('#vehicleForm .form-section-title').forEach(function(title) { title.classList.remove('collapsed'); });
        clearValidationErrors();
        $('vehicleModal').classList.add('active');
    }

    /* ── Contador unico de destacados (= banner) ── */
    function updateFeaturedCounter() {
        var counter = $('featuredCounter');
        if (!counter) return;
        var editId = $('vId').value ? parseInt($('vId').value) : null;
        var count = AP.vehicles.filter(function(v) { return v.destacado && v.id !== editId; }).length;
        counter.textContent = '(' + count + '/6)';
        counter.style.color = count >= 6 ? '#ef4444' : '#b89658';
    }

    /* ── Toggle 2-estados: Normal / Destacado ── */
    function syncDestaqueFromRadio(value) {
        var isDestacado = (value === 'destacado');
        var destEl = $('vDestacado');
        var fwEl   = $('vFeaturedWeek');
        if (destEl) destEl.checked = isDestacado;
        if (fwEl)   fwEl.checked   = isDestacado;

        /* Estilo visual del toggle */
        var lblN = $('desq-lbl-normal');
        var lblD = $('desq-lbl-destacado');
        if (lblN) {
            lblN.style.borderColor = isDestacado ? 'var(--admin-border,#30363d)' : 'var(--admin-accent,#58a6ff)';
            lblN.style.background  = isDestacado ? '' : 'rgba(88,166,255,0.05)';
        }
        if (lblD) {
            lblD.style.borderColor = isDestacado ? 'rgba(212,175,55,0.7)' : 'rgba(212,175,55,0.28)';
            lblD.style.background  = isDestacado ? 'rgba(212,175,55,0.08)' : 'rgba(212,175,55,0.03)';
        }

        /* Mostrar/ocultar sec-banner según estado destacado */
        var secBanner = $('sec-banner');
        var bannerTitle = document.querySelector('.form-section-title[data-toggle="sec-banner"]');
        if (secBanner) {
            if (isDestacado) {
                secBanner.classList.add('open');
                if (bannerTitle) bannerTitle.classList.remove('collapsed');
            } else {
                secBanner.classList.remove('open');
                if (bannerTitle) bannerTitle.classList.add('collapsed');
            }
        }

        updateFeaturedCounter();
    }

    /* Lee flags del vehiculo cargado y aplica el radio correspondiente */
    function setDestaqueRadio(destacado, featuredWeek) {
        /* Retrocompat: si cualquiera de los dos flags es true => destacado */
        var val   = (destacado || featuredWeek) ? 'destacado' : 'normal';
        var radio = document.querySelector('input[name="vDestaqueNivel"][value="' + val + '"]');
        if (radio) radio.checked = true;
        syncDestaqueFromRadio(val);
    }

    function formHasData() { return !!($('vMarca').value || $('vModelo').value || $('vPrecio').value); }

    function clearValidationErrors() {
        document.querySelectorAll('.field-error').forEach(function(el) { el.classList.remove('field-error'); });
        document.querySelectorAll('.field-error-msg').forEach(function(el) { el.remove(); });
        document.querySelectorAll('.form-section.has-errors').forEach(function(el) { el.classList.remove('has-errors'); });
    }

    function validateAndHighlightFields() {
        clearValidationErrors();
        var requiredFields = $('vehicleForm').querySelectorAll('[required]');
        var firstErrorSection = null;
        var hasErrors = false;
        requiredFields.forEach(function(field) {
            if (!field.value || field.value.trim() === '') {
                hasErrors = true;
                field.classList.add('field-error');
                var msg = document.createElement('span');
                msg.className = 'field-error-msg';
                msg.textContent = 'Este campo es requerido';
                field.parentNode.appendChild(msg);
                var section = field.closest('.form-section');
                if (section) {
                    section.classList.add('has-errors');
                    var body = section.querySelector('.form-section-body');
                    var title = section.querySelector('.form-section-title');
                    if (body && !body.classList.contains('open')) { body.classList.add('open'); if (title) title.classList.remove('collapsed'); }
                    if (!firstErrorSection) firstErrorSection = section;
                }
                field.addEventListener('input', function handler() {
                    this.classList.remove('field-error');
                    var errMsg = this.parentNode.querySelector('.field-error-msg');
                    if (errMsg) errMsg.remove();
                    var sec = this.closest('.form-section');
                    if (sec && !sec.querySelector('.field-error')) sec.classList.remove('has-errors');
                    this.removeEventListener('input', handler);
                }, { once: true });
            }
        });
        if (firstErrorSection) firstErrorSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return !hasErrors;
    }

    function closeModalFn(force) {
        if (!force && formHasData()) {
            var action = confirm('Tienes datos sin guardar. ¿Deseas guardar como borrador antes de cerrar?');
            if (action) { saveDraftToFirestore(true).then(function() { doCloseModal(); }); return; }
        }
        doCloseModal();
    }

    function doCloseModal() {
        clearValidationErrors();
        $('vehicleModal').classList.remove('active');
        $('vehicleForm').reset();
        $('vId').value = '';
        AP.uploadedImageUrls = [];
        $('uploadedImages').innerHTML = '';
        $('uploadProgress').style.display = 'none';
        $('uploadError').style.display = 'none';
        $('manualImageUrl').value = '';
        $('featuresPreview').innerHTML = '';
        document.querySelectorAll('.feat-checkboxes input[type="checkbox"]').forEach(function(cb) { cb.checked = false; });
        stopDraftAutoSave();
        _originalSnapshot = null;
        _lastSavedSnapshot = null;
    }

    // ========== DRAFTS ==========

    // Fase 18: Original snapshot for smart dirty checking
    var _originalSnapshot = null;

    function getFormSnapshot() {
        return {
            vId: $('vId').value, vMarca: $('vMarca').value, vModelo: $('vModelo').value,
            vYear: $('vYear').value, vTipo: $('vTipo').value, vCategoria: $('vCategoria').value,
            vPrecio: $('vPrecio').value, vPrecioOferta: $('vPrecioOferta').value, vKm: $('vKm').value,
            vTransmision: $('vTransmision').value, vCombustible: $('vCombustible').value,
            vMotor: $('vMotor').value, vPotencia: $('vPotencia').value, vCilindraje: $('vCilindraje').value,
            vTraccion: $('vTraccion').value, vDireccion: $('vDireccion').value, vColor: $('vColor').value,
            vPuertas: $('vPuertas').value, vPasajeros: $('vPasajeros').value, vUbicacion: $('vUbicacion').value,
            vPlaca: $('vPlaca').value, vFasecolda: $('vFasecolda').value, vDescripcion: $('vDescripcion').value,
            vEstado: $('vEstado').value, vDestacado: $('vDestacado').checked, vOferta: $('vOferta').checked,
            vRevision: $('vRevision').checked, vPeritaje: $('vPeritaje').checked,
            vPrioridad: $('vPrioridad').value, vCaracteristicas: $('vCaracteristicas').value,
            vFeaturedWeek: $('vFeaturedWeek') ? $('vFeaturedWeek').checked : false,
            vFeaturedOrder: $('vFeaturedOrder') ? $('vFeaturedOrder').value : '',
            vFeaturedCutoutPng: $('vFeaturedCutoutPng') ? $('vFeaturedCutoutPng').value : '',
            _images: AP.uploadedImageUrls.slice(), _savedAt: new Date().toISOString()
        };
    }

    // Fase 18: Compare two snapshots ignoring _savedAt
    function snapshotsAreDifferent(a, b) {
        if (!a || !b) return true;
        var keys = Object.keys(a).filter(function(k) { return k !== '_savedAt' && k !== '_userId' && k !== '_userEmail'; });
        for (var i = 0; i < keys.length; i++) {
            var k = keys[i];
            if (k === '_images') {
                var ai = (a._images || []).join(',');
                var bi = (b._images || []).join(',');
                if (ai !== bi) return true;
            } else if (String(a[k] || '') !== String(b[k] || '')) {
                return true;
            }
        }
        return false;
    }

    function captureOriginalSnapshot() {
        _originalSnapshot = getFormSnapshot();
    }

    function restoreFormSnapshot(snap) {
        var fields = ['vMarca','vModelo','vYear','vTipo','vCategoria','vPrecio','vPrecioOferta','vKm','vTransmision','vCombustible','vMotor','vPotencia','vCilindraje','vTraccion','vDireccion','vColor','vPuertas','vPasajeros','vUbicacion','vPlaca','vFasecolda','vDescripcion','vEstado','vPrioridad','vCaracteristicas'];
        fields.forEach(function(f) { if ($(f) && snap[f] !== undefined) $(f).value = snap[f]; });
        if (snap.vId) $('vId').value = snap.vId;
        $('vDestacado').checked = !!snap.vDestacado;
        $('vOferta').checked = !!snap.vOferta;
        $('vRevision').checked = snap.vRevision !== false;
        $('vPeritaje').checked = snap.vPeritaje !== false;
        if ($('vFeaturedWeek'))    $('vFeaturedWeek').checked = !!snap.vFeaturedWeek;
        if ($('vFeaturedOrder'))   $('vFeaturedOrder').value  = snap.vFeaturedOrder  || '';
        if ($('vFeaturedCutoutPng')) $('vFeaturedCutoutPng').value = snap.vFeaturedCutoutPng || '';
        renderCutoutPreview(snap.vFeaturedCutoutPng || '');
        if (snap._images && snap._images.length) { AP.uploadedImageUrls = snap._images.slice(); renderUploadedImages(); }
        setDestaqueRadio(!!snap.vDestacado, !!snap.vFeaturedWeek);
    }

    function getDraftDocRef() {
        if (!window.auth || !window.auth.currentUser || !window.db) return null;
        return window.db.collection('usuarios').doc(window.auth.currentUser.uid).collection('drafts').doc('vehicleDraft');
    }

    function snapshotHasAnyData(snap) {
        var checkFields = ['vMarca','vModelo','vYear','vTipo','vCategoria','vPrecio','vKm','vTransmision','vCombustible','vMotor','vColor','vDescripcion'];
        for (var i = 0; i < checkFields.length; i++) { if (snap[checkFields[i]]) return true; }
        if (snap._images && snap._images.length > 0) return true;
        return false;
    }

    function saveDraftToFirestore(showToast) {
        var ref = getDraftDocRef();
        if (!ref) { if (showToast) AP.toast('No se pudo acceder al almacenamiento de borradores', 'error'); return Promise.resolve(); }
        var snap = getFormSnapshot();
        if (!snapshotHasAnyData(snap)) { if (showToast) AP.toast('No hay datos para guardar como borrador', 'info'); return Promise.resolve(); }

        // Fase 18: Smart dirty check — skip save if nothing changed
        if (!showToast && _originalSnapshot && !snapshotsAreDifferent(snap, _lastSavedSnapshot || _originalSnapshot)) {
            return Promise.resolve();
        }

        snap._userId = window.auth.currentUser.uid;
        snap._userEmail = window.auth.currentUser.email;
        return ref.set(snap).then(function() {
            _lastSavedSnapshot = snap;
            if (showToast) AP.toast('Borrador guardado correctamente');
            showDraftIndicator();
            // Fase 18: Update shared drafts collection for visibility
            updateSharedDraft(snap);
        }).catch(function(err) {
            if (showToast) AP.toast('Error al guardar borrador: ' + (err.code === 'permission-denied' ? 'Sin permisos.' : err.message), 'error');
        });
    }

    // Fase 18: Track last saved snapshot to avoid redundant writes
    var _lastSavedSnapshot = null;

    function clearDraftFromFirestore() {
        var ref = getDraftDocRef();
        _lastSavedSnapshot = null;
        if (!ref) return Promise.resolve();
        clearSharedDraft();
        return ref.delete().catch(function() {});
    }

    // Fase 18: Shared drafts visible to all admins
    function getSharedDraftRef() {
        if (!window.auth || !window.auth.currentUser || !window.db) return null;
        return window.db.collection('drafts_activos').doc(window.auth.currentUser.uid);
    }

    function updateSharedDraft(snap) {
        var ref = getSharedDraftRef();
        if (!ref) return;
        ref.set({
            userId: window.auth.currentUser.uid,
            userEmail: window.auth.currentUser.email || '',
            marca: snap.vMarca || '',
            modelo: snap.vModelo || '',
            year: snap.vYear || '',
            vehicleId: snap.vId || '',
            lastSaved: new Date().toISOString()
        }).catch(function() { /* silent — rules may not allow */ });
    }

    function clearSharedDraft() {
        var ref = getSharedDraftRef();
        if (!ref) return;
        ref.delete().catch(function() {});
    }

    // Fase 18: Visual indicator when draft is saved
    function showDraftIndicator() {
        var el = $('draftSaveIndicator');
        if (!el) return;
        el.textContent = 'Borrador guardado';
        el.classList.add('visible');
        clearTimeout(el._timeout);
        el._timeout = setTimeout(function() { el.classList.remove('visible'); }, 2500);
    }

    function stopDraftAutoSave() { if (AP.draftInterval) { clearInterval(AP.draftInterval); AP.draftInterval = null; } }

    function startDraftAutoSave() {
        stopDraftAutoSave();
        AP.draftInterval = setInterval(function() { saveDraftToFirestore(false); }, 10000);
    }

    function checkForDraft() {
        var ref = getDraftDocRef();
        if (!ref) return Promise.resolve(false);
        return ref.get().then(function(doc) {
            if (!doc.exists) return false;
            var snap = doc.data();
            if (!snapshotHasAnyData(snap)) return false;
            var savedAt = snap._savedAt ? AP.formatTimeAgo(snap._savedAt) : '';
            var label = (snap.vMarca || '') + ' ' + (snap.vModelo || '') + ' ' + (snap.vYear || '');
            if (confirm('Tienes un borrador guardado: ' + label.trim() + ' (' + savedAt + '). ¿Deseas recuperarlo?')) {
                restoreFormSnapshot(snap);
                return true;
            } else { clearDraftFromFirestore(); return false; }
        }).catch(function() { return false; });
    }

    // ========== MODAL EVENT LISTENERS ==========
    $('btnAddVehicle').addEventListener('click', function() {
        if (!AP.canCreateOrEditInventory()) { AP.toast('No tienes permisos para crear vehiculos', 'error'); return; }
        $('modalTitle').textContent = 'Agregar Vehiculo';
        $('vId').value = '';
        $('vCodigoUnico').value = '';
        $('codigoUnicoDisplay').style.display = 'none';
        $('vehicleForm').reset();
        $('vUbicacion').value = 'Cartagena';
        $('vDireccion').value = 'Electrica';
        $('vEstado').value = 'disponible';
        $('vRevision').checked = true;
        $('vPeritaje').checked = true;
        AP.uploadedImageUrls = [];
        $('uploadedImages').innerHTML = '';
        $('uploadError').style.display = 'none';
        setDestaqueRadio(false, false);
        checkForDraft().then(function() { captureOriginalSnapshot(); startDraftAutoSave(); openModal(); });
    });

    $('closeModal').addEventListener('click', function() { closeModalFn(); });
    $('cancelModal').addEventListener('click', function() { closeModalFn(); });
    var saveDraftBtn = $('saveDraftBtn');
    if (saveDraftBtn) saveDraftBtn.addEventListener('click', function() { saveDraftToFirestore(true); });
    $('vehicleForm').addEventListener('submit', function(e) { e.preventDefault(); });
    $('vehicleForm').addEventListener('keydown', function(e) { if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') e.preventDefault(); });

    // ========== EDIT VEHICLE ==========
    function editVehicle(id) {
        if (!AP.canCreateOrEditInventory()) { AP.toast('No tienes permisos para editar vehiculos', 'error'); return; }
        var v = AP.vehicles.find(function(x) { return x.id === id; });
        if (!v) return;

        // Fase 22: Proteccion vehiculos vendidos
        if (v.estado === 'vendido' && !AP.isSuperAdmin()) {
            AP.toast('Este vehiculo esta vendido. Solo Super Admin puede editarlo.', 'error');
            return;
        }

        var codeDisplay = v.codigoUnico || '—';
        $('modalTitle').textContent = 'Editar Vehiculo ' + (v.codigoUnico || '#' + id);
        $('vId').value = v.id;
        $('vCodigoUnico').value = v.codigoUnico || '';
        if (v.codigoUnico) {
            $('codigoUnicoValue').textContent = v.codigoUnico;
            $('codigoUnicoDisplay').style.display = 'block';
        } else {
            $('codigoUnicoDisplay').style.display = 'none';
        }
        $('vMarca').value = v.marca || '';
        $('vModelo').value = v.modelo || '';
        $('vYear').value = v.year || '';
        $('vTipo').value = v.tipo || '';
        $('vCategoria').value = v.categoria || '';
        $('vPrecio').value = v.precio || '';
        $('vPrecioOferta').value = v.precioOferta || '';
        $('vKm').value = v.kilometraje || 0;
        $('vTransmision').value = v.transmision || '';
        $('vCombustible').value = v.combustible || '';
        $('vMotor').value = v.motor || '';
        $('vPotencia').value = v.potencia || '';
        $('vCilindraje').value = v.cilindraje || '';
        $('vTraccion').value = v.traccion || '';
        $('vDireccion').value = v.direccion || 'Electrica';
        $('vColor').value = v.color || '';
        $('vPuertas').value = v.puertas || 5;
        $('vPasajeros').value = v.pasajeros || 5;
        $('vUbicacion').value = v.ubicacion || 'Cartagena';
        $('vPlaca').value = v.placa || '';
        $('vFasecolda').value = v.codigoFasecolda || '';
        $('vDescripcion').value = v.descripcion || '';
        $('vEstado').value = v.estado || 'disponible';
        $('vDestacado').checked = !!v.destacado;
        $('vOferta').checked = !!(v.oferta || v.precioOferta);
        if ($('vFeaturedWeek'))    $('vFeaturedWeek').checked = !!v.featuredWeek;
        if ($('vFeaturedOrder'))   $('vFeaturedOrder').value  = v.featuredOrder  || '';
        if ($('vFeaturedCutoutPng')) $('vFeaturedCutoutPng').value = v.featuredCutoutPng || '';
        renderCutoutPreview(v.featuredCutoutPng || '');
        $('vRevision').checked = v.revisionTecnica !== false;
        $('vPeritaje').checked = v.peritaje !== false;
        $('vPrioridad').value = v.prioridad || 0;

        // Fase 22: Visual protection for sold vehicles
        var estadoSelect = $('vEstado');
        var soldWarning = document.getElementById('soldProtectionWarning');
        if (soldWarning) soldWarning.remove();
        estadoSelect.disabled = false;
        estadoSelect.style.opacity = '';
        if (v.estado === 'vendido') {
            if (AP.isSuperAdmin()) {
                // Super admin can edit but show warning
                var warn = document.createElement('div');
                warn.id = 'soldProtectionWarning';
                warn.style.cssText = 'background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:6px;padding:8px 12px;margin-top:8px;font-size:0.8rem;color:#ef4444;';
                warn.innerHTML = '<strong>VEHICULO VENDIDO</strong> — Estas editando un vehiculo vendido. Cambiar el estado revertira la venta.';
                estadoSelect.parentNode.appendChild(warn);
            } else {
                estadoSelect.disabled = true;
                estadoSelect.style.opacity = '0.5';
            }
        }

        loadFeaturesIntoForm(v.caracteristicas || []);

        if ($('vConcesionario')) {
            if (window.DynamicLists) {
                window.DynamicLists.populateConcesionarioSelect($('vConcesionario'));
                setTimeout(function() {
                    $('vConcesionario').value = v.concesionario || '';
                    toggleConsignaField();
                    if (v.consignaParticular && $('vConsignaParticular')) $('vConsignaParticular').value = v.consignaParticular;
                }, 300);
            } else {
                $('vConcesionario').value = v.concesionario || '';
            }
        }

        AP.uploadedImageUrls = (v.imagenes && v.imagenes.length) ? v.imagenes.slice() : (v.imagen ? [v.imagen] : []);
        renderUploadedImages();
        $('uploadError').style.display = 'none';
        setDestaqueRadio(!!v.destacado, !!v.featuredWeek);
        captureOriginalSnapshot();
        startDraftAutoSave();
        openModal();
    }

    // ========== FEATURES ==========
    function collectAllFeatures() {
        var features = [];
        document.querySelectorAll('.feat-checkboxes input[type="checkbox"]:checked').forEach(function(cb) {
            if (cb.value && features.indexOf(cb.value) === -1) features.push(cb.value);
        });
        var textarea = $('vCaracteristicas');
        if (textarea && textarea.value.trim()) {
            textarea.value.split('\n').forEach(function(line) {
                var trimmed = line.trim();
                if (trimmed && features.indexOf(trimmed) === -1) features.push(trimmed);
            });
        }
        return features;
    }

    function loadFeaturesIntoForm(caracteristicas) {
        if (!caracteristicas || !caracteristicas.length) return;
        document.querySelectorAll('.feat-checkboxes input[type="checkbox"]').forEach(function(cb) { cb.checked = false; });
        var uncategorized = [];
        caracteristicas.forEach(function(feat) {
            var found = false;
            document.querySelectorAll('.feat-checkboxes input[type="checkbox"]').forEach(function(cb) { if (cb.value === feat) { cb.checked = true; found = true; } });
            if (!found) uncategorized.push(feat);
        });
        if ($('vCaracteristicas')) $('vCaracteristicas').value = uncategorized.join('\n');
    }

    // ========== BUILD & SAVE ==========
    function buildVehicleData(id, codigoUnico) {
        var precioOferta = $('vPrecioOferta').value ? parseInt($('vPrecioOferta').value) : null;
        var userEmail = (window.auth && window.auth.currentUser) ? window.auth.currentUser.email : 'unknown';
        var vehicleData = {
            id: id, codigoUnico: codigoUnico || $('vCodigoUnico').value || '',
            marca: $('vMarca').value, modelo: $('vModelo').value.trim(),
            year: parseInt($('vYear').value), tipo: $('vTipo').value, categoria: $('vCategoria').value,
            precio: parseInt($('vPrecio').value), precioOferta: precioOferta, oferta: !!precioOferta,
            kilometraje: parseInt($('vKm').value) || 0, transmision: $('vTransmision').value,
            combustible: $('vCombustible').value, motor: $('vMotor').value || '',
            potencia: $('vPotencia').value || '', cilindraje: $('vCilindraje').value || '',
            traccion: $('vTraccion').value || '', direccion: $('vDireccion').value || 'Electrica',
            color: AP.toTitleCase($('vColor').value), puertas: parseInt($('vPuertas').value) || 5,
            pasajeros: parseInt($('vPasajeros').value) || 5, asientos: parseInt($('vPasajeros').value) || 5,
            ubicacion: $('vUbicacion').value || 'Cartagena', placa: $('vPlaca').value || 'Disponible al contactar',
            codigoFasecolda: $('vFasecolda').value || 'Consultar',
            revisionTecnica: $('vRevision').checked, peritaje: $('vPeritaje').checked,
            descripcion: $('vDescripcion').value || '', estado: $('vEstado').value || 'disponible',
            destacado: $('vDestacado').checked,
            prioridad: parseInt($('vPrioridad').value) || 0,
            featuredWeek: $('vFeaturedWeek') ? $('vFeaturedWeek').checked : false,
            featuredOrder: $('vFeaturedOrder') ? (parseInt($('vFeaturedOrder').value) || null) : null,
            featuredCutoutPng: $('vFeaturedCutoutPng') ? ($('vFeaturedCutoutPng').value.trim() || null) : null,
            imagen: AP.uploadedImageUrls[0] || 'multimedia/vehicles/placeholder-car.jpg',
            imagenes: AP.uploadedImageUrls.length ? AP.uploadedImageUrls.slice() : ['multimedia/vehicles/placeholder-car.jpg'],
            caracteristicas: collectAllFeatures(),
            concesionario: $('vConcesionario') ? $('vConcesionario').value : '',
            consignaParticular: ($('vConcesionario') && $('vConcesionario').value === '_particular' && $('vConsignaParticular')) ? $('vConsignaParticular').value.trim() : '',
            updatedAt: new Date().toISOString(), updatedBy: userEmail
        };
        if (vehicleData.imagen && vehicleData.imagenes.indexOf(vehicleData.imagen) === -1) vehicleData.imagenes.unshift(vehicleData.imagen);
        return vehicleData;
    }

    function saveNewVehicle(vehicleData, candidateId, maxRetries) {
        if (maxRetries <= 0) return Promise.reject({ code: 'id-exhausted', message: 'No se pudo generar un ID unico.' });
        vehicleData.id = candidateId;
        var docRef = window.db.collection('vehiculos').doc(String(candidateId));
        return window.db.runTransaction(function(transaction) {
            return transaction.get(docRef).then(function(doc) {
                if (doc.exists) throw { code: 'id-collision', takenId: candidateId };
                vehicleData._version = 1;
                transaction.set(docRef, vehicleData);
            });
        }).catch(function(err) {
            if (err.code === 'id-collision') return saveNewVehicle(vehicleData, err.takenId + 1, maxRetries - 1);
            throw err;
        });
    }

    function saveExistingVehicle(vehicleData, id, expectedVersion) {
        var docRef = window.db.collection('vehiculos').doc(String(id));
        return window.db.runTransaction(function(transaction) {
            return transaction.get(docRef).then(function(doc) {
                var currentVersion = doc.exists ? (doc.data()._version || 0) : 0;
                if (expectedVersion !== null && currentVersion !== expectedVersion) {
                    var lastEditor = doc.data().updatedBy || 'otro usuario';
                    throw { code: 'version-conflict', message: 'Este vehiculo fue modificado por ' + lastEditor + ' mientras lo editabas. Cierra el formulario y vuelve a abrirlo.' };
                }
                vehicleData._version = currentVersion + 1;
                transaction.set(docRef, vehicleData);
            });
        });
    }

    $('saveVehicle').addEventListener('click', function() {
        if (!AP.canCreateOrEditInventory()) { AP.toast('No tienes permisos', 'error'); return; }
        if (!validateAndHighlightFields()) { AP.toast('Completa los campos requeridos marcados en rojo', 'error'); return; }

        // Fase 22: Proteccion vehiculos vendidos en save
        var _editingId = $('vId').value ? parseInt($('vId').value) : null;
        if (_editingId) {
            var _originalVehicle = AP.vehicles.find(function(v) { return v.id === _editingId; });
            if (_originalVehicle && _originalVehicle.estado === 'vendido' && !AP.isSuperAdmin()) {
                AP.toast('No puedes modificar un vehiculo vendido. Contacta al Super Admin.', 'error');
                return;
            }
            // Solo super_admin puede revertir estado vendido
            if (_originalVehicle && _originalVehicle.estado === 'vendido' && $('vEstado').value !== 'vendido' && !AP.isSuperAdmin()) {
                AP.toast('Solo Super Admin puede cambiar el estado de un vehiculo vendido.', 'error');
                return;
            }
        }
        // Prevenir que editores asignen estado vendido directamente (debe usar Gestionar Operacion)
        if ($('vEstado').value === 'vendido') {
            var _wasVendido = _editingId && AP.vehicles.find(function(v) { return v.id === _editingId && v.estado === 'vendido'; });
            if (!_wasVendido && !AP.isSuperAdmin()) {
                AP.toast('Para marcar como vendido usa "Gestionar Operacion". No se puede cambiar manualmente.', 'error');
                return;
            }
        }

        // Limitar maximo 6 vehiculos destacados (= banner)
        if ($('vDestacado').checked) {
            var editId = $('vId').value ? parseInt($('vId').value) : null;
            var otherDestacados = AP.vehicles.filter(function(v) {
                return v.destacado && v.id !== editId;
            });
            if (otherDestacados.length >= 6) {
                AP.toast('Maximo 6 vehiculos destacados. Desmarca uno existente primero.', 'error');
                return;
            }

            // Detectar orden duplicado en banner
            var fwOrder = $('vFeaturedOrder') ? (parseInt($('vFeaturedOrder').value) || null) : null;
            if (fwOrder !== null) {
                var orderConflict = otherDestacados.find(function(v) { return v.featuredOrder === fwOrder; });
                if (orderConflict) {
                    var conflictName = ((orderConflict.marca || '') + ' ' + (orderConflict.modelo || '')).trim();
                    AP.toast(
                        'La posicion ' + fwOrder + ' ya esta asignada a "' + conflictName + '". ' +
                        'Elige otra posicion (1-6) o deja el campo vacio para orden automatico.',
                        'error'
                    );
                    if ($('vFeaturedOrder')) $('vFeaturedOrder').classList.add('field-error');
                    return;
                }
            }
        }

        var existingId = $('vId').value;
        var isEdit = !!existingId;
        var btn = $('saveVehicle');
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner"></span> Guardando...';

        var vehicleData, savePromise;
        if (isEdit) {
            var id = parseInt(existingId);
            var editingVehicle = AP.vehicles.find(function(v) { return v.id === id; });
            var expectedVersion = editingVehicle ? (editingVehicle._version || 0) : null;
            vehicleData = buildVehicleData(id);
            savePromise = saveExistingVehicle(vehicleData, id, expectedVersion);
        } else {
            // Generate unique code atomically, then save vehicle
            var candidateId = getNextId();
            savePromise = generateUniqueCode().then(function(code) {
                vehicleData = buildVehicleData(candidateId, code);
                return saveNewVehicle(vehicleData, candidateId, 10);
            });
        }

        savePromise.then(function() {
            var label = (vehicleData.marca || '') + ' ' + (vehicleData.modelo || '') + ' ' + (vehicleData.year || '');
            var codeLabel = vehicleData.codigoUnico ? ' [' + vehicleData.codigoUnico + ']' : '';
            AP.writeAuditLog(isEdit ? 'vehicle_update' : 'vehicle_create', 'vehiculo #' + vehicleData.id + codeLabel, label.trim());
            AP.toast(isEdit ? 'Vehiculo actualizado (v' + vehicleData._version + ')' : 'Vehiculo ' + vehicleData.codigoUnico + ' agregado');
            clearDraftFromFirestore();
            closeModalFn(true);
        }).catch(function(err) {
            if (err.code === 'version-conflict') AP.toast(err.message, 'error');
            else if (err.code === 'permission-denied') AP.toast('Sin permisos para esta accion.', 'error');
            else AP.toast('Error: ' + (err.message || err), 'error');
        }).finally(function() {
            btn.disabled = false;
            btn.textContent = 'Guardar Vehiculo';
        });
    });

    function getNextId() {
        if (AP.vehicles.length === 0) return 1;
        return Math.max.apply(null, AP.vehicles.map(function(v) { return v.id || 0; })) + 1;
    }

    // ========== DELETE VEHICLE ==========
    function deleteVehicleFn(id) {
        if (!AP.canDeleteInventory()) { AP.toast('Solo un Super Admin puede eliminar vehiculos', 'error'); return; }
        var v = AP.vehicles.find(function(x) { return x.id === id; });
        if (!v) return;
        AP.deleteTargetId = id;
        $('deleteVehicleName').textContent = (v.marca || '').charAt(0).toUpperCase() + (v.marca || '').slice(1) + ' ' + v.modelo + ' ' + v.year;
        $('deleteModal').classList.add('active');
    }

    $('closeDeleteModal').addEventListener('click', function() { $('deleteModal').classList.remove('active'); AP.deleteTargetId = null; });
    $('cancelDelete').addEventListener('click', function() { $('deleteModal').classList.remove('active'); AP.deleteTargetId = null; });
    $('confirmDelete').addEventListener('click', function() {
        if (!AP.deleteTargetId) return;
        if (!AP.canDeleteInventory()) { AP.toast('Sin permisos', 'error'); return; }
        var btn = $('confirmDelete');
        btn.disabled = true;
        btn.textContent = 'Eliminando...';
        var deletingId = AP.deleteTargetId;
        window.db.collection('vehiculos').doc(String(AP.deleteTargetId)).delete().then(function() {
            AP.writeAuditLog('vehicle_delete', 'vehiculo #' + deletingId, '');
            AP.toast('Vehiculo eliminado');
            $('deleteModal').classList.remove('active');
            AP.deleteTargetId = null;
            AP.loadData();
        }).catch(function(err) {
            if (err.code === 'permission-denied') AP.toast('Sin permisos para eliminar.', 'error');
            else AP.toast('Error: ' + err.message, 'error');
        }).finally(function() {
            btn.disabled = false;
            btn.textContent = 'Eliminar';
        });
    });

    // ========== IMAGE UPLOAD ==========
    var uploadArea = $('uploadArea');
    var fileInput = $('fileInput');
    uploadArea.addEventListener('click', function() { fileInput.click(); });
    uploadArea.addEventListener('dragover', function(e) { e.preventDefault(); this.classList.add('dragover'); });
    uploadArea.addEventListener('dragleave', function() { this.classList.remove('dragover'); });
    uploadArea.addEventListener('drop', function(e) { e.preventDefault(); this.classList.remove('dragover'); if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files); });
    fileInput.addEventListener('change', function() { if (this.files.length) { handleFiles(this.files); this.value = ''; } });

    function showUploadError(msg) { var el = $('uploadError'); el.textContent = msg; el.style.display = 'block'; }

    function handleFiles(files) {
        if (!window.storage) { showUploadError('Firebase Storage no esta disponible. Usa la opcion de URL manual.'); return; }
        var fileArray = Array.from(files);
        var invalidType = fileArray.filter(function(f) { return AP.UPLOAD_CONFIG.allowedTypes.indexOf(f.type) === -1; });
        if (invalidType.length) { showUploadError('Formatos permitidos: JPG, PNG, WebP.'); return; }
        var maxBytes = AP.UPLOAD_CONFIG.maxFileSizeMB * 1024 * 1024;
        var oversized = fileArray.filter(function(f) { return f.size > maxBytes * 5; });
        if (oversized.length) { showUploadError('Imagenes demasiado grandes (max 10MB).'); return; }
        $('uploadError').style.display = 'none';
        var total = fileArray.length, done = 0, errors = 0;
        $('uploadProgress').style.display = 'block';
        $('uploadStatus').textContent = 'Comprimiendo y subiendo 0 de ' + total + '...';
        $('progressFill').style.width = '0%';
        fileArray.forEach(function(file) {
            AP.compressImage(file).then(function(compressed) { return uploadFileToStorage(compressed); })
                .then(function(success) { done++; if (!success) errors++; updateUploadProgress(done, total, errors); })
                .catch(function() { done++; errors++; updateUploadProgress(done, total, errors); });
        });
    }

    function updateUploadProgress(done, total, errors) {
        var pct = Math.round((done / total) * 100);
        $('progressFill').style.width = pct + '%';
        $('uploadStatus').textContent = 'Subiendo ' + done + ' de ' + total + '...';
        if (done === total) {
            setTimeout(function() { $('uploadProgress').style.display = 'none'; }, 1000);
            if (errors === total) showUploadError('No se pudieron subir las imagenes.');
            else if (errors > 0) AP.toast((total - errors) + ' subida(s), ' + errors + ' error(es)', 'error');
            else AP.toast(total + ' imagen(es) subida(s)');
        }
    }

    function uploadFileToStorage(file) {
        return new Promise(function(resolve) {
            if (!window.storage) { resolve(false); return; }
            var timestamp = Date.now();
            var safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
            var path = AP.UPLOAD_CONFIG.storagePath + timestamp + '_' + safeName;
            try {
                var ref = window.storage.ref(path);
                ref.put(file).then(function(snapshot) { return snapshot.ref.getDownloadURL(); })
                    .then(function(url) { AP.uploadedImageUrls.push(url); renderUploadedImages(); resolve(true); })
                    .catch(function(err) { showUploadError('Error subiendo imagen: ' + (err.message || err.code)); resolve(false); });
            } catch (e) { resolve(false); }
        });
    }

    $('btnAddImageUrl').addEventListener('click', function() {
        var url = $('manualImageUrl').value.trim();
        if (!url) { AP.toast('Ingresa una URL', 'error'); return; }
        if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('multimedia/')) { AP.toast('URL no valida', 'error'); return; }
        AP.uploadedImageUrls.push(url);
        renderUploadedImages();
        $('manualImageUrl').value = '';
        AP.toast('Imagen agregada');
    });

    function renderUploadedImages() {
        var container = $('uploadedImages');
        var html = '';
        AP.uploadedImageUrls.forEach(function(url, i) {
            var isMain = (i === 0);
            html += '<div class="uploaded-img' + (isMain ? ' main-img' : '') + '" draggable="true" data-idx="' + i + '">' +
                '<div class="img-drag-handle" title="Arrastra para reordenar">☰</div>' +
                '<img src="' + url + '" alt="Foto ' + (i + 1) + '" onerror="this.style.opacity=\'0.3\'">' +
                (isMain ? '<span class="img-badge">PRINCIPAL</span>' : '<span class="img-badge img-badge-num">' + (i + 1) + '</span>') +
                '<button type="button" class="remove-img" onclick="adminPanel.removeImage(' + i + ')">&times;</button>' +
            '</div>';
        });
        container.innerHTML = html;
        $('vImagen').value = AP.uploadedImageUrls[0] || '';
        $('vImagenes').value = AP.uploadedImageUrls.join('\n');
        initImageDragDrop(container);
    }

    function removeImage(index) { AP.uploadedImageUrls.splice(index, 1); renderUploadedImages(); }

    function initImageDragDrop(container) {
        var items = container.querySelectorAll('.uploaded-img');
        items.forEach(function(item) {
            item.addEventListener('dragstart', function(e) { AP._dragSrcIdx = parseInt(this.getAttribute('data-idx')); this.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; });
            item.addEventListener('dragend', function() { this.classList.remove('dragging'); container.querySelectorAll('.uploaded-img').forEach(function(el) { el.classList.remove('drag-over'); }); });
            item.addEventListener('dragover', function(e) { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; this.classList.add('drag-over'); });
            item.addEventListener('dragleave', function() { this.classList.remove('drag-over'); });
            item.addEventListener('drop', function(e) {
                e.preventDefault(); this.classList.remove('drag-over');
                var targetIdx = parseInt(this.getAttribute('data-idx'));
                if (AP._dragSrcIdx !== null && AP._dragSrcIdx !== targetIdx) {
                    var moved = AP.uploadedImageUrls.splice(AP._dragSrcIdx, 1)[0];
                    AP.uploadedImageUrls.splice(targetIdx, 0, moved);
                    renderUploadedImages();
                    AP.toast('Imagen reordenada', 'info');
                }
                AP._dragSrcIdx = null;
            });
        });
    }

    // ========== CUTOUT PNG UPLOAD ==========
    var cutoutFileInput = $('cutoutFileInput');
    if (cutoutFileInput) {
        cutoutFileInput.addEventListener('change', function() {
            if (this.files.length) { handleCutoutFile(this.files[0]); this.value = ''; }
        });
    }
    var cutoutUploadArea = $('cutoutUploadArea');
    if (cutoutUploadArea) {
        cutoutUploadArea.addEventListener('dragover', function(e) { e.preventDefault(); this.style.background = 'rgba(212,175,55,0.08)'; });
        cutoutUploadArea.addEventListener('dragleave', function() { this.style.background = 'rgba(212,175,55,0.03)'; });
        cutoutUploadArea.addEventListener('drop', function(e) {
            e.preventDefault(); this.style.background = 'rgba(212,175,55,0.03)';
            var f = e.dataTransfer.files[0];
            if (f) handleCutoutFile(f);
        });
    }

    function showCutoutError(msg) { var el = $('cutoutUploadError'); if (el) { el.textContent = msg; el.style.display = 'block'; } }

    function handleCutoutFile(file) {
        if (!window.storage) { showCutoutError('Firebase Storage no disponible. Usa la URL manual.'); return; }
        if (file.type !== 'image/png') { showCutoutError('Solo se admiten archivos PNG (para transparencia).'); return; }
        var maxBytes = 10 * 1024 * 1024;
        if (file.size > maxBytes) { showCutoutError('El archivo es demasiado grande (max 10 MB).'); return; }
        var errEl = $('cutoutUploadError'); if (errEl) errEl.style.display = 'none';
        var prog = $('cutoutUploadProgress');
        if (prog) { prog.style.display = 'block'; $('cutoutProgressFill').style.width = '0%'; $('cutoutUploadStatus').textContent = 'Subiendo cutout...'; }
        uploadCutoutToStorage(file);
    }

    function uploadCutoutToStorage(file) {
        if (!window.storage) { showCutoutError('Firebase Storage no disponible.'); return; }
        var timestamp = Date.now();
        var safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        var path = 'cars/cutouts/' + timestamp + '_' + safeName;
        try {
            var ref = window.storage.ref(path);
            ref.put(file).then(function(snapshot) {
                $('cutoutProgressFill').style.width = '50%';
                return snapshot.ref.getDownloadURL();
            }).then(function(url) {
                $('cutoutProgressFill').style.width = '100%';
                $('cutoutUploadStatus').textContent = 'Subido correctamente';
                setTimeout(function() { var p = $('cutoutUploadProgress'); if (p) p.style.display = 'none'; }, 1200);
                var field = $('vFeaturedCutoutPng'); if (field) field.value = url;
                renderCutoutPreview(url);
                AP.toast('Cutout PNG subido');
            }).catch(function(err) {
                var p = $('cutoutUploadProgress'); if (p) p.style.display = 'none';
                showCutoutError('Error al subir: ' + (err.message || err.code));
            });
        } catch(e) { showCutoutError('Error inesperado al subir cutout.'); }
    }

    function renderCutoutPreview(url) {
        var area = $('cutoutPreviewArea');
        var img  = $('cutoutPreviewImg');
        if (!area || !img) return;
        if (url && url.trim()) {
            img.src = url.trim();
            area.style.display = 'flex';
        } else {
            img.src = '';
            area.style.display = 'none';
        }
    }

    function clearCutoutPng() {
        var field = $('vFeaturedCutoutPng'); if (field) field.value = '';
        renderCutoutPreview('');
        AP.toast('Imagen recortada eliminada', 'info');
    }

    // ========== CONCESIONARIO TOGGLE ==========
    function toggleConsignaField() {
        var concSelect = $('vConcesionario');
        var partGroup = $('consignaPartGroup');
        if (concSelect && partGroup) partGroup.style.display = concSelect.value === '_particular' ? '' : 'none';
    }
    var concSelectEl = $('vConcesionario');
    if (concSelectEl) concSelectEl.addEventListener('change', toggleConsignaField);

    /* Toggle destaque — radio change */
    document.querySelectorAll('input[name="vDestaqueNivel"]').forEach(function(radio) {
        radio.addEventListener('change', function() { syncDestaqueFromRadio(this.value); });
    });

    /* Validación en tiempo real: orden duplicado en banner */
    var featuredOrderEl = $('vFeaturedOrder');
    if (featuredOrderEl) {
        featuredOrderEl.addEventListener('input', function() {
            var orderVal = parseInt(this.value) || null;
            this.classList.remove('field-error');
            var errEl = this.parentElement.querySelector('.field-error-msg');
            if (errEl) errEl.remove();
            if (!orderVal) return;
            var editId = $('vId').value ? parseInt($('vId').value) : null;
            var conflict = AP.vehicles.find(function(v) {
                return v.destacado && v.id !== editId && v.featuredOrder === orderVal;
            });
            if (conflict) {
                this.classList.add('field-error');
                var msg = document.createElement('span');
                msg.className = 'field-error-msg';
                msg.textContent = 'Posición ' + orderVal + ' ya usada por "' + ((conflict.marca || '') + ' ' + (conflict.modelo || '')).trim() + '"';
                this.parentElement.appendChild(msg);
            }
        });
    }

    // ========== PREVIEW ==========
    function previewVehicle(id) {
        var v = AP.vehicles.find(function(x) { return x.id === id; });
        if (!v) return;
        var marca = (v.marca || '').charAt(0).toUpperCase() + (v.marca || '').slice(1);
        var imgs = (v.imagenes || [v.imagen]).filter(Boolean);
        var imgsHtml = imgs.map(function(url, i) {
            return '<img src="' + url + '" style="width:100%;max-height:200px;object-fit:cover;border-radius:6px;margin-bottom:0.5rem;" onerror="this.style.display=\'none\'" alt="Foto ' + (i + 1) + '">';
        }).join('');

        var origenPreview = 'Propio';
        if (v.concesionario && v.concesionario !== '' && v.concesionario !== '_particular') {
            var dealerMatch = AP.dealers.find(function(x) { return x._docId === v.concesionario; });
            origenPreview = dealerMatch ? dealerMatch.nombre : v.concesionario;
        } else if (v.concesionario === '_particular' && v.consignaParticular) {
            origenPreview = 'Consigna: ' + v.consignaParticular;
        }

        var specs = [
            { label: 'Codigo', val: v.codigoUnico || '—' },
            { label: 'Marca', val: marca }, { label: 'Modelo', val: v.modelo },
            { label: 'Año', val: v.year }, { label: 'Tipo', val: v.tipo },
            { label: 'Categoria', val: v.categoria },
            { label: 'Precio', val: AP.formatPrice(v.precio) },
            { label: 'Precio Oferta', val: v.precioOferta ? AP.formatPrice(v.precioOferta) : '-' },
            { label: 'Kilometraje', val: (v.kilometraje || 0).toLocaleString('es-CO') + ' km' },
            { label: 'Transmision', val: v.transmision }, { label: 'Combustible', val: v.combustible },
            { label: 'Motor', val: v.motor || '-' }, { label: 'Direccion', val: v.direccion || '-' },
            { label: 'Traccion', val: v.traccion || '-' }, { label: 'Color', val: v.color || '-' },
            { label: 'Puertas', val: v.puertas || 5 }, { label: 'Pasajeros', val: v.pasajeros || 5 },
            { label: 'Placa', val: v.placa || '-' }, { label: 'Ubicacion', val: v.ubicacion || '-' },
            { label: 'Origen / Concesionario', val: origenPreview },
            { label: 'Estado', val: (v.estado || 'disponible') },
            { label: 'Descripcion', val: v.descripcion ? v.descripcion.substring(0, 100) + (v.descripcion.length > 100 ? '...' : '') : '-' },
            { label: 'Version', val: v._version || '-' },
            { label: 'Ultima edicion', val: v.updatedAt ? AP.formatTimeAgo(v.updatedAt) + ' por ' + (v.updatedBy || '-') : '-' }
        ];

        var specsHtml = '<table style="width:100%;font-size:0.8rem;border-collapse:collapse;">' +
            specs.map(function(s) {
                return '<tr style="border-bottom:1px solid var(--admin-border,#30363d);"><td style="padding:0.35rem 0.5rem;color:var(--admin-text-muted);white-space:nowrap;">' + s.label + '</td><td style="padding:0.35rem 0.5rem;color:var(--admin-text-primary,#f0f6fc);font-weight:500;">' + (s.val || '-') + '</td></tr>';
            }).join('') + '</table>';

        var features = (v.caracteristicas || []);
        var featHtml = features.length > 0 ? '<div style="margin-top:0.75rem;"><strong style="font-size:0.8rem;">Caracteristicas:</strong><div style="display:flex;flex-wrap:wrap;gap:0.3rem;margin-top:0.35rem;">' +
            features.map(function(f) { return '<span style="background:var(--admin-surface,#161b22);border:1px solid var(--admin-border,#30363d);border-radius:4px;padding:0.15rem 0.5rem;font-size:0.7rem;">' + AP.escapeHtml(f) + '</span>'; }).join('') +
            '</div></div>' : '';

        var content = '<div style="max-height:70vh;overflow-y:auto;padding-right:0.5rem;">' +
            imgsHtml +
            '<h3 style="margin:0.5rem 0 0.75rem;color:var(--admin-text-primary,#f0f6fc);">' + marca + ' ' + (v.modelo || '') + ' ' + (v.year || '') + '</h3>' +
            specsHtml + featHtml +
            (v.descripcion ? '<div style="margin-top:0.75rem;font-size:0.8rem;color:var(--admin-text-secondary);">' + AP.escapeHtml(v.descripcion) + '</div>' : '') +
            '</div>';

        var overlay = document.createElement('div');
        overlay.className = 'modal-overlay active';
        overlay.style.zIndex = '999';
        overlay.innerHTML = '<div class="modal" style="max-width:550px;"><div class="modal-header"><h2>Vista Previa — #' + id + '</h2><button class="modal-close" id="closePreview">&times;</button></div><div class="modal-body">' + content + '</div><div class="modal-footer"><button class="btn btn-ghost" id="closePreviewBtn">Cerrar</button><a href="detalle-vehiculo.html?id=' + id + '" target="_blank" class="btn btn-primary btn-sm">Abrir pagina publica</a></div></div>';
        document.body.appendChild(overlay);
        overlay.querySelector('#closePreview').addEventListener('click', function() { document.body.removeChild(overlay); });
        overlay.querySelector('#closePreviewBtn').addEventListener('click', function() { document.body.removeChild(overlay); });
        overlay.addEventListener('click', function(e) { if (e.target === overlay) document.body.removeChild(overlay); });
    }

    // Fase 18: Open modal with a restored draft (called from admin-panel.js)
    function restoreAndOpenDraft(snap) {
        if (!AP.canCreateOrEditInventory()) { AP.toast('No tienes permisos para editar vehiculos', 'error'); return; }
        $('modalTitle').textContent = 'Continuar Borrador';
        $('vId').value = snap.vId || '';
        $('vCodigoUnico').value = '';
        $('codigoUnicoDisplay').style.display = 'none';
        $('vehicleForm').reset();
        restoreFormSnapshot(snap);
        captureOriginalSnapshot();
        startDraftAutoSave();
        openModal();
    }

    // ========== FASE 18: ACTIVE DRAFTS REAL-TIME LISTENER ==========
    var _unsubDrafts = null;

    function startDraftsListener() {
        if (!window.db) return;
        try {
            _unsubDrafts = window.db.collection('drafts_activos').onSnapshot(function(snap) {
                var drafts = [];
                snap.forEach(function(doc) { drafts.push(doc.data()); });
                _renderActiveDrafts(drafts);
            }, function() {
                // Permission denied or collection doesn't exist — silent fail
            });
        } catch (_) {}
    }

    function _renderActiveDrafts(drafts) {
        var panel = $('activeDraftsPanel');
        var list = $('activeDraftsList');
        if (!panel || !list) return;

        // Filter out stale drafts (older than 2 hours)
        var now = Date.now();
        var TWO_HOURS = 2 * 60 * 60 * 1000;
        drafts = drafts.filter(function(d) {
            if (!d.lastSaved) return false;
            return (now - new Date(d.lastSaved).getTime()) < TWO_HOURS;
        });

        if (drafts.length === 0) { panel.style.display = 'none'; return; }

        panel.style.display = 'block';
        var currentUid = window.auth && window.auth.currentUser ? window.auth.currentUser.uid : '';

        list.innerHTML = drafts.map(function(d) {
            var label = ((d.marca || '') + ' ' + (d.modelo || '') + ' ' + (d.year || '')).trim() || 'Sin titulo';
            var email = d.userEmail || 'Admin';
            var initials = email.substring(0, 2).toUpperCase();
            var ago = d.lastSaved ? AP.formatTimeAgo(d.lastSaved) : '';
            var isOwn = d.userId === currentUid;
            var editingLabel = d.vehicleId ? ('Editando #' + d.vehicleId) : 'Nuevo vehiculo';
            var btnHtml = isOwn
                ? '<span style="color:var(--admin-success);font-size:0.7rem;font-weight:500;">Tu borrador</span>'
                : '<button class="btn btn-ghost btn-sm" onclick="adminPanel.loadDraftFromUser(\'' + AP.escapeHtml(d.userId || '') + '\')">Continuar</button>';

            return '<div class="draft-item">'
                + '<div class="draft-item-info">'
                + '<div class="draft-item-avatar">' + initials + '</div>'
                + '<div class="draft-item-text">'
                + '<div class="draft-item-label">' + AP.escapeHtml(label) + ' <small style="color:var(--admin-text-muted);">(' + AP.escapeHtml(editingLabel) + ')</small></div>'
                + '<div class="draft-item-meta">' + AP.escapeHtml(email) + ' · ' + ago + '</div>'
                + '</div></div>'
                + '<div class="draft-item-actions">' + btnHtml + '</div>'
                + '</div>';
        }).join('');
    }

    function loadDraftFromUser(userId) {
        if (!window.db || !userId) return;
        window.db.collection('usuarios').doc(userId).collection('drafts').doc('vehicleDraft').get()
            .then(function(doc) {
                if (!doc.exists) { AP.toast('Borrador no encontrado — puede que ya se haya guardado.', 'info'); return; }
                var snap = doc.data();
                if (!snap || !snap.vMarca) { AP.toast('Borrador vacio', 'info'); return; }
                restoreAndOpenDraft(snap);
            })
            .catch(function() { AP.toast('No se pudo cargar el borrador de este usuario', 'error'); });
    }

    // ========== TOGGLE DESTACADO (estrella en tabla) ==========
    function toggleDestacadoFn(id) {
        if (!AP.canCreateOrEditInventory()) { AP.toast('Sin permisos.', 'error'); return; }
        var vehicle = AP.vehicles.find(function(v) { return v.id === id; });
        if (!vehicle) return;
        var newVal = !vehicle.destacado;
        if (newVal) {
            var count = AP.vehicles.filter(function(v) { return v.destacado; }).length;
            if (count >= 6) { AP.toast('Maximo 6 vehiculos destacados.', 'error'); return; }
        }
        var userEmail = (window.auth && window.auth.currentUser) ? window.auth.currentUser.email : 'unknown';
        window.db.collection('vehiculos').doc(String(id)).update({
            destacado: newVal,
            featuredWeek: newVal,
            updatedAt: new Date().toISOString(),
            updatedBy: userEmail
        }).then(function() {
            AP.toast(newVal ? 'Vehiculo destacado (aparece en banner)' : 'Vehiculo quitado de destacados', 'success');
            AP.writeAuditLog('vehicle_feature_toggle', 'vehiculo #' + id, newVal ? 'destacado' : 'sin destacar');
        }).catch(function(err) { AP.toast('Error: ' + (err.message || err), 'error'); });
    }

    // ========== EXPOSE ==========
    AP.renderVehiclesTable = renderVehiclesTable;
    AP.populateBrandSelect = populateBrandSelect;
    AP.editVehicle = editVehicle;
    AP.deleteVehicle = deleteVehicleFn;
    AP.removeImage = removeImage;
    AP.previewVehicle = previewVehicle;
    AP.restoreAndOpenDraft = restoreAndOpenDraft;
    AP.startDraftsListener = startDraftsListener;
    AP.loadDraftFromUser = loadDraftFromUser;
    AP.toggleDestacado = toggleDestacadoFn;
    AP.clearCutoutPng = clearCutoutPng;
    AP.renderCutoutPreview = renderCutoutPreview;
})();
