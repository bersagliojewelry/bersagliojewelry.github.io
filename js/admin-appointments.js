// Admin Panel — Appointments, Calendar & Availability (Fase 19)
(function() {
    'use strict';
    var AP = window.AP;
    var $ = AP.$;

    // ========== LOAD APPOINTMENTS ==========
    function loadAppointments() {
        if (AP.unsubAppointments) AP.unsubAppointments();
        AP.unsubAppointments = window.db.collection('citas').orderBy('createdAt', 'desc').onSnapshot(function(snap) {
            AP.appointments = snap.docs.map(function(doc) { return Object.assign({ _docId: doc.id }, doc.data()); });
            renderAppointmentsTable();
            renderAdminCalendar(); // refresh calendar counts
            var pending = AP.appointments.filter(function(a) { return a.estado === 'pendiente'; }).length;
            var badge = $('navBadgeAppointments');
            if (badge) badge.textContent = pending > 0 ? pending : '';
        }, function(err) {
            console.warn('[Citas] Error loading appointments:', err);
        });
    }

    // ========== APPOINTMENT FILTER ==========
    var appointmentFilterEl = $('appointmentFilter');
    if (appointmentFilterEl) {
        appointmentFilterEl.addEventListener('change', function() {
            renderAppointmentsTable();
        });
    }

    // ========== APPOINTMENTS TABLE ==========
    function renderAppointmentsTable() {
        var body = $('appointmentsBody');
        if (!body) return;
        var filterEl = $('appointmentFilter');
        var filter = filterEl ? filterEl.value : 'all';
        var filtered = filter === 'all' ? AP.appointments : AP.appointments.filter(function(a) { return a.estado === filter; });

        if (filtered.length === 0) {
            body.innerHTML = '<tr><td colspan="9" style="text-align:center;color:var(--admin-text-muted);padding:2rem;">No hay citas ' + (filter === 'all' ? '' : filter + 's') + '</td></tr>';
            return;
        }

        body.innerHTML = filtered.map(function(a) {
            var estadoColors = {
                pendiente: 'admin-warning',
                confirmada: 'admin-success',
                reprogramada: 'admin-info',
                completada: 'admin-gold',
                cancelada: 'admin-danger'
            };
            var estadoClass = estadoColors[a.estado] || 'admin-warning';
            var estadoLabel = a.estado ? (a.estado.charAt(0).toUpperCase() + a.estado.slice(1)) : 'Pendiente';
            var whatsappNum = a.whatsapp || a.telefono || '';

            // Type/origin badge
            var tipoCita = a.tipoCita || '';
            var origen = a.origen || 'cliente';
            var tipoLabel = '';
            if (tipoCita) {
                tipoLabel = tipoCita.charAt(0).toUpperCase() + tipoCita.slice(1);
            } else {
                tipoLabel = origen === 'admin' ? 'Interna' : 'Visita';
            }
            var tipoColor = origen === 'admin' ? 'admin-info' : 'admin-text-muted';

            return '<tr>' +
                '<td><strong>' + AP.escapeHtml(a.nombre || '-') + '</strong></td>' +
                '<td>' +
                    '<div style="font-size:0.85rem;display:flex;align-items:center;gap:4px;">' +
                        (whatsappNum ? '<a href="https://wa.me/' + whatsappNum.replace(/[^0-9]/g, '') + '" target="_blank" style="color:var(--admin-success);text-decoration:none;" title="Abrir WhatsApp">' + AP.escapeHtml(whatsappNum) + ' </a>' : AP.escapeHtml(whatsappNum || '-')) +
                    '</div>' +
                    '<div style="font-size:0.75rem;color:var(--admin-text-muted);">' + AP.escapeHtml(a.email || '-') + '</div>' +
                '</td>' +
                '<td>' + AP.escapeHtml(a.vehiculo || 'General') + '</td>' +
                '<td><div>' + AP.escapeHtml(a.fecha || '-') + '</div><div style="font-weight:600;">' + AP.escapeHtml(a.hora || '-') + '</div></td>' +
                '<td><span style="color:var(--' + estadoClass + ');font-weight:600;font-size:0.85rem;">' + estadoLabel + '</span></td>' +
                '<td><span style="color:var(--' + tipoColor + ');font-size:0.8rem;">' + tipoLabel + '</span></td>' +
                '<td style="max-width:150px;font-size:0.8rem;color:var(--admin-text-muted);">' + AP.escapeHtml(a.observaciones || a.comentarios || '-') + '</td>' +
                '<td style="white-space:nowrap;">' +
                    (AP.RBAC.canManageAppointment() ? '<button class="btn btn-sm btn-ghost" onclick="adminPanel.manageAppointment(\'' + a._docId + '\')" title="Gestionar">Gestionar</button>' : '') +
                    (AP.RBAC.canDeleteAppointment() ? ' <button class="btn btn-sm btn-danger" onclick="adminPanel.deleteAppointment(\'' + a._docId + '\')" title="Eliminar">&times;</button>' : '') +
                '</td>' +
            '</tr>';
        }).join('');
    }

    // ========== DELETE APPOINTMENT ==========
    function deleteAppointment(docId) {
        if (!AP.RBAC.canDeleteAppointment()) { AP.toast('Solo Super Admin puede eliminar citas', 'error'); return; }
        if (!confirm('Eliminar esta cita? Esta accion no se puede deshacer.')) return;
        window.db.collection('citas').doc(docId).delete().then(function() {
            AP.toast('Cita eliminada');
            AP.writeAuditLog('appointment_delete', 'cita ' + docId, '');
        }).catch(function(err) {
            AP.toast('Error: ' + err.message, 'error');
        });
    }

    // ========== MANAGE APPOINTMENT MODAL ==========
    function manageAppointment(docId) {
        var a = AP.appointments.find(function(x) { return x._docId === docId; });
        if (!a) return;

        $('amDocId').value = docId;
        $('amEstado').value = a.estado || 'pendiente';
        $('amObservaciones').value = a.observaciones || '';

        $('amClientInfo').innerHTML =
            '<strong>' + AP.escapeHtml(a.nombre || '') + '</strong><br>' +
            'WhatsApp: <a href="https://wa.me/' + (a.whatsapp || a.telefono || '').replace(/[^0-9]/g, '') + '" target="_blank" style="color:var(--admin-success);">' + AP.escapeHtml(a.whatsapp || a.telefono || '-') + '</a><br>' +
            'Email: ' + AP.escapeHtml(a.email || '-') + '<br>' +
            'Vehiculo: ' + AP.escapeHtml(a.vehiculo || 'General') + '<br>' +
            'Fecha: ' + AP.escapeHtml(a.fecha || '-') + ' | Hora: ' + AP.escapeHtml(a.hora || '-') + '<br>' +
            (a.tipoCita ? 'Tipo: ' + AP.escapeHtml(a.tipoCita) + '<br>' : '') +
            (a.origen === 'admin' ? '<span style="color:var(--admin-info);">Cita interna (admin)</span><br>' : '') +
            'Comentarios: ' + AP.escapeHtml(a.comentarios || '-');

        toggleReprogramarGroup();
        $('appointmentModal').classList.add('active');
    }

    function toggleReprogramarGroup() {
        var group = $('amReprogramarGroup');
        var estado = $('amEstado').value;
        if (group) group.style.display = estado === 'reprogramada' ? '' : 'none';
    }

    var amEstadoEl = $('amEstado');
    if (amEstadoEl) amEstadoEl.addEventListener('change', toggleReprogramarGroup);

    var closeAppModal = $('closeAppointmentModal');
    if (closeAppModal) closeAppModal.addEventListener('click', function() { $('appointmentModal').classList.remove('active'); });
    var cancelAppModal = $('cancelAppointmentModal');
    if (cancelAppModal) cancelAppModal.addEventListener('click', function() { $('appointmentModal').classList.remove('active'); });

    var saveAppStatusBtn = $('saveAppointmentStatus');
    if (saveAppStatusBtn) {
        saveAppStatusBtn.addEventListener('click', function() {
            var docId = $('amDocId').value;
            if (!docId) return;
            if (!AP.isEditorOrAbove() && !AP.isSuperAdmin()) { AP.toast('Sin permisos', 'error'); return; }

            var updateData = {
                estado: $('amEstado').value,
                observaciones: $('amObservaciones').value.trim(),
                updatedAt: new Date().toISOString(),
                updatedBy: window.auth.currentUser.email
            };

            if ($('amEstado').value === 'reprogramada') {
                var nuevaFecha = $('amNuevaFecha').value;
                var nuevaHora = $('amNuevaHora').value;
                if (nuevaFecha) updateData.fecha = nuevaFecha;
                if (nuevaHora) updateData.hora = nuevaHora;
            }

            window.db.collection('citas').doc(docId).update(updateData).then(function() {
                AP.toast('Cita actualizada a: ' + updateData.estado);
                AP.writeAuditLog('appointment_' + updateData.estado, 'cita ' + docId, updateData.observaciones || '');
                var filterEl = $('appointmentFilter');
                if (filterEl) filterEl.value = updateData.estado;
                $('appointmentModal').classList.remove('active');
            }).catch(function(err) {
                if (err.code === 'permission-denied') {
                    AP.toast('Sin permisos para actualizar citas. Verifica tu rol y las Firestore Rules.', 'error');
                } else {
                    AP.toast('Error: ' + err.message, 'error');
                }
            });
        });
    }

    // ========== INTERNAL APPOINTMENT CREATION ==========
    var btnCreateIA = $('btnCreateInternalAppt');
    if (btnCreateIA) {
        btnCreateIA.addEventListener('click', function() {
            if (!AP.isEditorOrAbove() && !AP.isSuperAdmin()) { AP.toast('Sin permisos para crear citas', 'error'); return; }
            // Set default date to tomorrow
            var tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            var iaFecha = $('iaFecha');
            if (iaFecha) iaFecha.value = tomorrow.toISOString().split('T')[0];
            var iaHora = $('iaHora');
            if (iaHora) iaHora.value = '09:00';
            $('internalApptModal').classList.add('active');
        });
    }

    var closeIAModal = $('closeInternalApptModal');
    if (closeIAModal) closeIAModal.addEventListener('click', function() { $('internalApptModal').classList.remove('active'); });
    var cancelIAModal = $('cancelInternalApptModal');
    if (cancelIAModal) cancelIAModal.addEventListener('click', function() { $('internalApptModal').classList.remove('active'); });

    var saveIABtn = $('saveInternalAppt');
    if (saveIABtn) {
        saveIABtn.addEventListener('click', function() {
            var nombre = ($('iaNombre').value || '').trim();
            var whatsapp = ($('iaWhatsapp').value || '').trim();
            var fecha = ($('iaFecha').value || '').trim();
            var hora = ($('iaHora').value || '').trim();

            if (!nombre || !whatsapp || !fecha || !hora) {
                AP.toast('Completa los campos obligatorios', 'error');
                return;
            }

            var data = {
                nombre: nombre,
                whatsapp: whatsapp,
                telefono: whatsapp,
                email: ($('iaEmail').value || '').trim() || 'No proporcionado',
                vehiculo: ($('iaVehiculo').value || '').trim() || 'General',
                fecha: fecha,
                hora: hora,
                estado: $('iaEstado').value || 'confirmada',
                tipoCita: $('iaType').value || 'visita',
                origen: 'admin',
                observaciones: ($('iaObservaciones').value || '').trim(),
                comentarios: '',
                createdAt: new Date().toISOString(),
                createdBy: window.auth.currentUser.email
            };

            saveIABtn.disabled = true;
            saveIABtn.textContent = 'Creando...';

            // Book slot atomically then save
            bookSlotAtomically(fecha, hora).then(function() {
                return window.db.collection('citas').add(data);
            }).then(function() {
                AP.toast('Cita interna creada para ' + fecha + ' a las ' + hora);
                AP.writeAuditLog('appointment_create_internal', nombre + ' - ' + data.tipoCita, fecha + ' ' + hora);
                $('internalApptModal').classList.remove('active');
                $('internalApptForm').reset();
            }).catch(function(err) {
                if (err && err.message === 'SLOT_TAKEN') {
                    AP.toast('Ese horario ya esta reservado. Elige otro.', 'error');
                } else {
                    AP.toast('Error: ' + err.message, 'error');
                }
            }).finally(function() {
                saveIABtn.disabled = false;
                saveIABtn.textContent = 'Crear Cita';
            });
        });
    }

    // Atomic slot booking (same logic as public citas.js)
    function bookSlotAtomically(fecha, hora) {
        if (!window.db) return Promise.resolve();
        var bookedRef = window.db.collection('config').doc('bookedSlots');
        return window.db.runTransaction(function(transaction) {
            return transaction.get(bookedRef).then(function(doc) {
                var data = doc.exists ? doc.data() : {};
                var daySlots = data[fecha] || [];
                if (daySlots.indexOf(hora) !== -1) {
                    throw new Error('SLOT_TAKEN');
                }
                daySlots.push(hora);
                var update = {};
                update[fecha] = daySlots;
                if (doc.exists) {
                    transaction.update(bookedRef, update);
                } else {
                    transaction.set(bookedRef, update);
                }
            });
        });
    }

    // ========== ADMIN CALENDAR WITH APPOINTMENT COUNTS ==========
    function renderAdminCalendar() {
        var cal = $('adminCalendar');
        var label = $('calMonthLabel');
        if (!cal || !label) return;

        var monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        label.textContent = monthNames[AP.calendarMonth] + ' ' + AP.calendarYear;

        // Build appointment count map for current month
        var appointmentCounts = {};
        if (AP.appointments) {
            AP.appointments.forEach(function(a) {
                if (a.fecha && a.estado !== 'cancelada') {
                    appointmentCounts[a.fecha] = (appointmentCounts[a.fecha] || 0) + 1;
                }
            });
        }

        var dayHeaders = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
        var html = dayHeaders.map(function(d) { return '<div style="text-align:center;font-size:0.75rem;font-weight:600;color:var(--admin-text-muted);padding:4px;">' + d + '</div>'; }).join('');

        var firstDay = new Date(AP.calendarYear, AP.calendarMonth, 1).getDay();
        var daysInMonth = new Date(AP.calendarYear, AP.calendarMonth + 1, 0).getDate();
        var today = new Date();
        today.setHours(0,0,0,0);

        var availDays = [];
        document.querySelectorAll('#availDays input:checked').forEach(function(cb) { availDays.push(parseInt(cb.value)); });

        for (var i = 0; i < firstDay; i++) { html += '<div></div>'; }

        for (var day = 1; day <= daysInMonth; day++) {
            var date = new Date(AP.calendarYear, AP.calendarMonth, day);
            var dateStr = date.toISOString().split('T')[0];
            var isPast = date < today;
            var dayOfWeek = date.getDay();
            var isAvailDay = availDays.indexOf(dayOfWeek) !== -1;
            var isBlocked = AP.blockedDates[dateStr] === true;
            var hasBlockedHours = AP.blockedHours && AP.blockedHours[dateStr] && AP.blockedHours[dateStr].length > 0;
            var apptCount = appointmentCounts[dateStr] || 0;

            var bgColor, textColor, cursor, border;
            if (isPast) {
                bgColor = 'var(--admin-border)'; textColor = 'var(--admin-text-muted)'; cursor = 'default'; border = 'transparent';
            } else if (!isAvailDay) {
                bgColor = 'var(--admin-border)'; textColor = 'var(--admin-text-muted)'; cursor = 'default'; border = 'transparent';
            } else if (isBlocked) {
                bgColor = 'rgba(248,81,73,0.2)'; textColor = '#f85149'; cursor = 'pointer'; border = '#f85149';
            } else if (hasBlockedHours || apptCount > 0) {
                bgColor = 'rgba(217,153,34,0.15)'; textColor = '#d29922'; cursor = 'pointer'; border = '#d29922';
            } else {
                bgColor = 'rgba(63,185,80,0.15)'; textColor = '#3fb950'; cursor = 'pointer'; border = '#3fb950';
            }

            var clickable = !isPast && isAvailDay;
            var title = isPast ? 'Pasado' : !isAvailDay ? 'Dia no habilitado' : isBlocked ? 'Bloqueado - clic para gestionar' : 'Disponible - clic para gestionar';
            if (apptCount > 0 && !isPast) title += ' (' + apptCount + ' cita' + (apptCount > 1 ? 's' : '') + ')';

            // Build inner content: day number + optional appointment count badge
            var inner = '<div style="font-size:0.85rem;font-weight:600;">' + day + '</div>';
            if (apptCount > 0 && !isPast && isAvailDay) {
                inner += '<div style="font-size:0.6rem;margin-top:1px;opacity:0.85;">' + apptCount + ' cita' + (apptCount > 1 ? 's' : '') + '</div>';
            }

            html += '<div style="text-align:center;padding:6px 4px;border-radius:8px;' +
                'background:' + bgColor + ';color:' + textColor + ';cursor:' + cursor + ';border:1px solid ' + border + ';min-height:48px;display:flex;flex-direction:column;align-items:center;justify-content:center;"' +
                (clickable ? ' onclick="adminPanel.openDayManager(\'' + dateStr + '\')"' : '') +
                ' title="' + title + '">' +
                inner + '</div>';
        }

        cal.innerHTML = html;
    }

    // ========== DAY MANAGER (CLICK ON CALENDAR DAY) ==========
    function openDayManager(dateStr) {
        if (!AP.isSuperAdmin()) { AP.toast('Solo Super Admin puede gestionar bloqueos', 'error'); return; }

        var dateObj = new Date(dateStr + 'T12:00:00');
        var dateLabel = dateObj.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        var bhDateLabel = $('bhDateLabel');
        if (bhDateLabel) bhDateLabel.textContent = dateLabel;
        var bhTitle = $('bhModalTitle');
        if (bhTitle) bhTitle.textContent = 'Gestionar: ' + dateStr;

        // Generate time slot toggles
        var startHour = parseInt(($('availStartHour') || {}).value) || 8;
        var endHour = parseInt(($('availEndHour') || {}).value) || 18;
        var interval = parseInt(($('availInterval') || {}).value) || 30;

        var slots = [];
        for (var hour = startHour; hour < endHour; hour++) {
            slots.push(hour.toString().padStart(2, '0') + ':00');
            if (interval === 30) {
                slots.push(hour.toString().padStart(2, '0') + ':30');
            }
        }

        var blockedForDay = (AP.blockedHours && AP.blockedHours[dateStr]) || [];
        var isFullBlocked = AP.blockedDates[dateStr] === true;

        // Get booked slots for this day from appointments
        var bookedForDay = {};
        if (AP.appointments) {
            AP.appointments.forEach(function(a) {
                if (a.fecha === dateStr && a.estado !== 'cancelada') {
                    bookedForDay[a.hora] = a.nombre || 'Reservado';
                }
            });
        }

        var grid = $('bhSlotsGrid');
        if (grid) {
            grid.innerHTML = slots.map(function(slot) {
                var isBlockedSlot = isFullBlocked || blockedForDay.indexOf(slot) !== -1;
                var isBooked = bookedForDay[slot];
                var cls = 'bh-slot';
                if (isBooked) cls += ' bh-booked';
                else if (isBlockedSlot) cls += ' bh-blocked';
                return '<label class="' + cls + '" title="' + (isBooked ? 'Reservado: ' + AP.escapeHtml(isBooked) : '') + '">' +
                    '<input type="checkbox" value="' + slot + '"' + (isBlockedSlot ? ' checked' : '') + (isBooked ? ' disabled' : '') + '>' +
                    '<span class="bh-slot-label">' + slot + '</span>' +
                    (isBooked ? '<span class="bh-slot-badge">Reservado</span>' : '') +
                '</label>';
            }).join('');
        }

        // Store current dateStr for save
        $('blockedHoursModal').dataset.dateStr = dateStr;
        $('blockedHoursModal').classList.add('active');
    }

    // Block all / unblock all buttons
    var bhBlockAll = $('bhBlockAll');
    if (bhBlockAll) {
        bhBlockAll.addEventListener('click', function() {
            document.querySelectorAll('#bhSlotsGrid input[type="checkbox"]:not(:disabled)').forEach(function(cb) { cb.checked = true; });
        });
    }
    var bhUnblockAll = $('bhUnblockAll');
    if (bhUnblockAll) {
        bhUnblockAll.addEventListener('click', function() {
            document.querySelectorAll('#bhSlotsGrid input[type="checkbox"]:not(:disabled)').forEach(function(cb) { cb.checked = false; });
        });
    }

    // Close/cancel blocked hours modal
    var closeBH = $('closeBlockedHoursModal');
    if (closeBH) closeBH.addEventListener('click', function() { $('blockedHoursModal').classList.remove('active'); });
    var cancelBH = $('cancelBlockedHoursModal');
    if (cancelBH) cancelBH.addEventListener('click', function() { $('blockedHoursModal').classList.remove('active'); });

    // Save blocked hours
    var saveBH = $('saveBlockedHours');
    if (saveBH) {
        saveBH.addEventListener('click', function() {
            var dateStr = $('blockedHoursModal').dataset.dateStr;
            if (!dateStr) return;

            var checkedSlots = [];
            document.querySelectorAll('#bhSlotsGrid input[type="checkbox"]:checked').forEach(function(cb) {
                checkedSlots.push(cb.value);
            });

            var totalSlots = document.querySelectorAll('#bhSlotsGrid input[type="checkbox"]').length;
            var allBlocked = checkedSlots.length >= totalSlots && totalSlots > 0;

            // Initialize blockedHours if needed
            if (!AP.blockedHours) AP.blockedHours = {};

            if (allBlocked) {
                // All slots blocked = full day block
                AP.blockedDates[dateStr] = true;
                delete AP.blockedHours[dateStr];
            } else if (checkedSlots.length === 0) {
                // Nothing blocked
                delete AP.blockedDates[dateStr];
                delete AP.blockedHours[dateStr];
            } else {
                // Partial block — only specific hours
                delete AP.blockedDates[dateStr];
                AP.blockedHours[dateStr] = checkedSlots;
            }

            saveBlockedDatesAndHours();
            renderAdminCalendar();
            $('blockedHoursModal').classList.remove('active');
            AP.toast('Disponibilidad actualizada para ' + dateStr);
        });
    }

    // Legacy: still support toggleBlockDate for backward compat
    function toggleBlockDate(dateStr) {
        openDayManager(dateStr);
    }

    // ========== SAVE BLOCKED DATES + HOURS ==========
    function saveBlockedDatesAndHours() {
        var blockedList = Object.keys(AP.blockedDates).filter(function(k) { return AP.blockedDates[k]; });
        var blockedHoursObj = AP.blockedHours || {};

        // Clean empty entries
        Object.keys(blockedHoursObj).forEach(function(k) {
            if (!blockedHoursObj[k] || blockedHoursObj[k].length === 0) delete blockedHoursObj[k];
        });

        window.db.collection('config').doc('availability').update({
            blockedDates: blockedList,
            blockedHours: blockedHoursObj,
            updatedAt: new Date().toISOString()
        }).catch(function() {
            window.db.collection('config').doc('availability').set({
                blockedDates: blockedList,
                blockedHours: blockedHoursObj,
                updatedAt: new Date().toISOString()
            }, { merge: true }).catch(function() {});
        });
    }

    // Legacy save (used by availability config save button)
    function saveBlockedDates() {
        saveBlockedDatesAndHours();
    }

    function loadBlockedDates() {
        window.db.collection('config').doc('availability').get().then(function(doc) {
            if (doc.exists) {
                var data = doc.data();
                if (data.blockedDates) {
                    AP.blockedDates = {};
                    data.blockedDates.forEach(function(d) { AP.blockedDates[d] = true; });
                }
                if (data.blockedHours) {
                    AP.blockedHours = data.blockedHours;
                } else {
                    AP.blockedHours = {};
                }
                if (data.interval && $('availInterval')) {
                    $('availInterval').value = data.interval;
                }
            }
            renderAdminCalendar();
        }).catch(function() { renderAdminCalendar(); });
    }

    // Calendar navigation
    var calPrev = $('calPrevMonth');
    var calNext = $('calNextMonth');
    if (calPrev) calPrev.addEventListener('click', function() {
        AP.calendarMonth--;
        if (AP.calendarMonth < 0) { AP.calendarMonth = 11; AP.calendarYear--; }
        renderAdminCalendar();
    });
    if (calNext) calNext.addEventListener('click', function() {
        AP.calendarMonth++;
        if (AP.calendarMonth > 11) { AP.calendarMonth = 0; AP.calendarYear++; }
        renderAdminCalendar();
    });

    // ========== SAVE AVAILABILITY CONFIG ==========
    var btnSaveAvail = $('btnSaveAvailability');
    if (btnSaveAvail) {
        btnSaveAvail.addEventListener('click', function() {
            if (!AP.isSuperAdmin()) { AP.toast('Solo Super Admin puede cambiar disponibilidad', 'error'); return; }
            var startHour = parseInt($('availStartHour').value);
            var endHour = parseInt($('availEndHour').value);
            var interval = $('availInterval') ? parseInt($('availInterval').value) : 30;
            var days = [];
            document.querySelectorAll('#availDays input:checked').forEach(function(cb) { days.push(parseInt(cb.value)); });
            var blockedList = Object.keys(AP.blockedDates).filter(function(k) { return AP.blockedDates[k]; });
            var blockedHoursObj = AP.blockedHours || {};
            window.db.collection('config').doc('availability').set({
                startHour: startHour,
                endHour: endHour,
                days: days,
                interval: interval,
                blockedDates: blockedList,
                blockedHours: blockedHoursObj,
                updatedAt: new Date().toISOString()
            }).then(function() {
                AP.toast('Disponibilidad guardada');
                $('availabilityStatus').innerHTML = '<span style="color:var(--admin-success);">Guardado correctamente</span>';
                renderAdminCalendar();
            }).catch(function(err) {
                AP.toast('Error: ' + err.message, 'error');
            });
        });
    }

    // ========== LOAD AVAILABILITY CONFIG ==========
    function loadAvailabilityConfig() {
        window.db.collection('config').doc('availability').get().then(function(doc) {
            if (!doc.exists) return;
            var data = doc.data();
            if (data.startHour && $('availStartHour')) $('availStartHour').value = data.startHour;
            if (data.endHour && $('availEndHour')) $('availEndHour').value = data.endHour;
            if (data.interval && $('availInterval')) $('availInterval').value = data.interval;
            if (data.days) {
                document.querySelectorAll('#availDays input').forEach(function(cb) {
                    cb.checked = data.days.indexOf(parseInt(cb.value)) !== -1;
                });
            }
            if (data.blockedDates) {
                AP.blockedDates = {};
                data.blockedDates.forEach(function(d) { AP.blockedDates[d] = true; });
            }
            if (data.blockedHours) {
                AP.blockedHours = data.blockedHours;
            } else {
                AP.blockedHours = {};
            }
            renderAdminCalendar();
        }).catch(function() { renderAdminCalendar(); });
    }

    // ========== EXPOSE ==========
    AP.loadAppointments = loadAppointments;
    AP.renderAppointmentsTable = renderAppointmentsTable;
    AP.deleteAppointment = deleteAppointment;
    AP.manageAppointment = manageAppointment;
    AP.toggleBlockDate = toggleBlockDate;
    AP.openDayManager = openDayManager;
    AP.renderAdminCalendar = renderAdminCalendar;
    AP.loadBlockedDates = loadBlockedDates;
    AP.loadAvailabilityConfig = loadAvailabilityConfig;
})();
