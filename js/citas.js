// ============================================
// SISTEMA DE CITAS ONLINE - ALTORRA CARS
// Agenda visitas presenciales para ver vehiculos
// Con calendario de disponibilidad real desde Firestore
// ============================================

class AppointmentSystem {
    constructor() {
        this.availableSlots = [];
        this.availConfig = null;
        this.blockedDates = [];
        this.blockedHours = {}; // { 'YYYY-MM-DD': ['09:00', '09:30'] }
        this.availDays = [1, 2, 3, 4, 5]; // default Mon-Fri
        this.startHour = 8;
        this.endHour = 18;
        this.interval = 30;
        this.currentMonth = new Date().getMonth();
        this.currentYear = new Date().getFullYear();
        this.selectedDate = null;
        this.init();
    }

    init() {
        this.loadAvailabilityConfig();
        this.attachEventListeners();
    }

    // ===== LOAD AVAILABILITY FROM FIRESTORE (REAL-TIME) =====
    async loadAvailabilityConfig() {
        try {
            if (window.firebaseReady) await window.firebaseReady;
            if (!window.db) return;
            var self = this;
            // Real-time listener: config updates instantly when admin changes availability
            window.db.collection('config').doc('availability').onSnapshot(function(doc) {
                if (doc.exists) {
                    var data = doc.data();
                    self.startHour = data.startHour || 8;
                    self.endHour = data.endHour || 18;
                    self.interval = data.interval || 30;
                    self.availDays = data.days || [1, 2, 3, 4, 5];
                    self.blockedDates = data.blockedDates || [];
                    self.blockedHours = data.blockedHours || {};
                }
                self.availableSlots = self.generateTimeSlots();
                // Refresh calendar if modal is open
                var calEl = document.querySelector('#appointmentCalendar');
                if (calEl) {
                    calEl.innerHTML = self.buildCalendarHTML(self.currentYear, self.currentMonth);
                }
            }, function(err) {
                console.warn('[Citas] Availability listener error:', err);
            });
        } catch (e) {
            console.warn('[Citas] Could not load availability:', e);
            this.availableSlots = this.generateTimeSlots();
        }
    }

    // ===== GENERAR HORARIOS DISPONIBLES =====
    generateTimeSlots() {
        var slots = [];
        for (var hour = this.startHour; hour < this.endHour; hour++) {
            slots.push(hour.toString().padStart(2, '0') + ':00');
            if (this.interval === 30 && hour < this.endHour - 1) {
                slots.push(hour.toString().padStart(2, '0') + ':30');
            }
        }
        return slots;
    }

    // ===== CHECK IF DATE IS AVAILABLE =====
    isDateAvailable(date) {
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        if (date <= today) return false;
        var dayOfWeek = date.getDay();
        if (this.availDays.indexOf(dayOfWeek) === -1) return false;
        var dateStr = date.toISOString().split('T')[0];
        if (this.blockedDates.indexOf(dateStr) !== -1) return false;
        return true;
    }

    // ===== GET AVAILABLE DATES FOR A MONTH =====
    getAvailableDatesForMonth(year, month) {
        var dates = [];
        var daysInMonth = new Date(year, month + 1, 0).getDate();
        for (var day = 1; day <= daysInMonth; day++) {
            var date = new Date(year, month, day);
            if (this.isDateAvailable(date)) {
                dates.push(date);
            }
        }
        return dates;
    }

    formatDate(date) {
        return date.toLocaleDateString('es-CO', { weekday: 'short', month: 'short', day: 'numeric' });
    }

    formatDateISO(date) {
        return date.toISOString().split('T')[0];
    }

    // ===== BUILD CALENDAR HTML =====
    buildCalendarHTML(year, month) {
        var monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        var dayHeaders = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
        var firstDay = new Date(year, month, 1).getDay();
        var daysInMonth = new Date(year, month + 1, 0).getDate();
        var today = new Date();
        today.setHours(0, 0, 0, 0);

        var html = '<div class="appointment-calendar-nav">';
        html += '<button type="button" class="cal-nav-btn" data-action="prev">&larr;</button>';
        html += '<span class="cal-month-label">' + monthNames[month] + ' ' + year + '</span>';
        html += '<button type="button" class="cal-nav-btn" data-action="next">&rarr;</button>';
        html += '</div>';

        html += '<div class="appointment-calendar-grid">';
        dayHeaders.forEach(function(d) {
            html += '<div class="cal-header">' + d + '</div>';
        });

        for (var i = 0; i < firstDay; i++) {
            html += '<div class="cal-empty"></div>';
        }

        for (var day = 1; day <= daysInMonth; day++) {
            var date = new Date(year, month, day);
            var dateStr = this.formatDateISO(date);
            var available = this.isDateAvailable(date);
            var isPast = date <= today;
            var isSelected = this.selectedDate === dateStr;

            var cls = 'cal-day';
            if (isPast) cls += ' cal-past';
            else if (!available) cls += ' cal-unavailable';
            else cls += ' cal-available';
            if (isSelected) cls += ' cal-selected';

            html += '<div class="' + cls + '" data-date="' + dateStr + '"' +
                (available && !isPast ? ' role="button" tabindex="0"' : '') + '>' + day + '</div>';
        }
        html += '</div>';

        return html;
    }

    // ===== CREAR MODAL =====
    createModal(vehicleInfo = {}) {
        var existing = document.getElementById('appointment-modal');
        if (existing) existing.remove();

        var self = this;
        var modal = document.createElement('div');
        modal.id = 'appointment-modal';
        modal.className = 'appointment-modal-overlay';

        modal.innerHTML = '\
            <div class="appointment-modal">\
                <div class="appointment-modal-header">\
                    <h2 class="appointment-modal-title">\
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">\
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>\
                            <line x1="16" y1="2" x2="16" y2="6"/>\
                            <line x1="8" y1="2" x2="8" y2="6"/>\
                            <line x1="3" y1="10" x2="21" y2="10"/>\
                        </svg>\
                        Agendar Visita Presencial\
                    </h2>\
                    <p class="appointment-modal-subtitle">Selecciona un dia disponible en el calendario</p>\
                    <button type="button" class="appointment-modal-close" aria-label="Cerrar">&times;</button>\
                </div>\
                <div class="appointment-modal-body">' +
                    (vehicleInfo.marca ? '\
                        <div class="appointment-vehicle-info">\
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">\
                                <path d="M7 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"/>\
                                <path d="M17 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"/>\
                                <path d="M5 17h-2v-6l2-5h9l4 5h1a2 2 0 0 1 2 2v4h-2"/>\
                                <path d="M9 17h6"/>\
                            </svg>\
                            <span>' + vehicleInfo.marca + ' ' + vehicleInfo.modelo + ' ' + (vehicleInfo.year || '') + '</span>\
                        </div>' : '') + '\
                    <form id="appointmentForm" class="appointment-form">\
                        <div class="form-section">\
                            <label class="form-section-label">Tus datos</label>\
                            <div class="appointment-form-group">\
                                <label class="form-label required">Nombre completo</label>\
                                <input type="text" name="nombre" class="form-input" required placeholder="Ej: Juan Perez">\
                            </div>\
                            <div class="appointment-form-row">\
                                <div class="appointment-form-group">\
                                    <label class="form-label required">WhatsApp</label>\
                                    <input type="tel" name="telefono" class="form-input" required placeholder="3001234567">\
                                    <span class="form-hint">Se requiere WhatsApp para ser contactado y confirmar la cita</span>\
                                </div>\
                                <div class="appointment-form-group">\
                                    <label class="form-label">Email</label>\
                                    <input type="email" name="email" class="form-input" placeholder="correo@ejemplo.com">\
                                </div>\
                            </div>\
                        </div>\
                        <div class="form-section">\
                            <label class="form-section-label">Selecciona la fecha</label>\
                            <div id="appointmentCalendar">' + this.buildCalendarHTML(this.currentYear, this.currentMonth) + '</div>\
                            <input type="hidden" name="fecha" id="selectedDateInput" required>\
                            <div id="selectedDateLabel" class="selected-date-label" style="display:none;"></div>\
                        </div>\
                        <div class="form-section" id="timeSlotSection" style="display:none;">\
                            <label class="form-section-label">Selecciona la hora</label>\
                            <div class="time-selector" id="timeSlotsContainer"></div>\
                        </div>\
                        <div class="form-section">\
                            <label class="form-section-label">Comentarios (opcional)</label>\
                            <textarea name="comentarios" class="form-textarea" rows="2" placeholder="Alguna solicitud especial?"></textarea>\
                        </div>\
                        <div class="appointment-notice">\
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">\
                                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>\
                            </svg>\
                            <span>Tu cita quedara en estado <strong>pendiente</strong> hasta ser confirmada por nuestro equipo. Te contactaremos por WhatsApp para confirmar.</span>\
                        </div>\
                        <button type="submit" class="btn-submit-appointment">\
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">\
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>\
                                <line x1="16" y1="2" x2="16" y2="6"/>\
                                <line x1="8" y1="2" x2="8" y2="6"/>\
                                <line x1="3" y1="10" x2="21" y2="10"/>\
                                <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>\
                            </svg>\
                            Enviar Solicitud de Cita\
                        </button>\
                    </form>\
                </div>\
            </div>';

        document.body.appendChild(modal);
        this.attachModalEvents(modal, vehicleInfo);

        requestAnimationFrame(function() {
            modal.classList.add('active');
        });
    }

    // ===== EVENTOS DEL MODAL =====
    attachModalEvents(modal, vehicleInfo) {
        var self = this;
        var closeBtn = modal.querySelector('.appointment-modal-close');
        var form = modal.querySelector('#appointmentForm');
        var calContainer = modal.querySelector('#appointmentCalendar');

        closeBtn.addEventListener('click', function() { self.closeModal(modal); });
        modal.addEventListener('click', function(e) {
            if (e.target === modal) self.closeModal(modal);
        });

        var escHandler = function(e) {
            if (e.key === 'Escape') {
                self.closeModal(modal);
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);

        // Calendar navigation and date selection
        calContainer.addEventListener('click', function(e) {
            var navBtn = e.target.closest('.cal-nav-btn');
            if (navBtn) {
                var action = navBtn.dataset.action;
                if (action === 'prev') {
                    self.currentMonth--;
                    if (self.currentMonth < 0) { self.currentMonth = 11; self.currentYear--; }
                } else {
                    self.currentMonth++;
                    if (self.currentMonth > 11) { self.currentMonth = 0; self.currentYear++; }
                }
                calContainer.innerHTML = self.buildCalendarHTML(self.currentYear, self.currentMonth);
                return;
            }

            var dayEl = e.target.closest('.cal-available');
            if (dayEl) {
                self.selectedDate = dayEl.dataset.date;
                modal.querySelector('#selectedDateInput').value = self.selectedDate;

                // Update calendar to show selection
                calContainer.innerHTML = self.buildCalendarHTML(self.currentYear, self.currentMonth);

                // Show selected date label
                var dateObj = new Date(self.selectedDate + 'T12:00:00');
                var dateLabel = modal.querySelector('#selectedDateLabel');
                dateLabel.textContent = 'Fecha seleccionada: ' + dateObj.toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                dateLabel.style.display = 'block';

                // Show time slots
                self.showTimeSlots(modal);
            }
        });

        form.addEventListener('submit', function(e) {
            e.preventDefault();
            if (!self.selectedDate) {
                alert('Por favor selecciona una fecha disponible en el calendario.');
                return;
            }
            self.submitAppointment(form, vehicleInfo, modal);
        });
    }

    async loadBookedSlotsForDate(dateStr) {
        try {
            if (!window.db) return [];
            // Force fresh data from server (no client cache) to ensure real-time availability
            var doc = await window.db.collection('config').doc('bookedSlots').get({ source: 'server' });
            if (doc.exists) {
                var data = doc.data();
                return data[dateStr] || [];
            }
        } catch (e) {
            // Fallback to cached data if server is unreachable
            try {
                var doc = await window.db.collection('config').doc('bookedSlots').get();
                if (doc.exists) {
                    return doc.data()[dateStr] || [];
                }
            } catch (e2) {
                console.warn('[Citas] Could not load booked slots:', e2);
            }
        }
        return [];
    }

    async showTimeSlots(modal) {
        var container = modal.querySelector('#timeSlotsContainer');
        var section = modal.querySelector('#timeSlotSection');
        if (!container || !section) return;

        section.style.display = '';
        container.innerHTML = '<div class="time-loading">Verificando disponibilidad...</div>';

        var bookedSlots = await this.loadBookedSlotsForDate(this.selectedDate);
        var blockedForDay = this.blockedHours[this.selectedDate] || [];
        var freeSlots = this.availableSlots.filter(function(slot) {
            return bookedSlots.indexOf(slot) === -1 && blockedForDay.indexOf(slot) === -1;
        });

        if (freeSlots.length === 0) {
            container.innerHTML = '<div class="time-unavailable">No hay horarios disponibles para este día. Por favor selecciona otra fecha.</div>';
            return;
        }

        container.innerHTML = freeSlots.map(function(slot, index) {
            return '<label class="time-option">' +
                '<input type="radio" name="hora" value="' + slot + '"' + (index === 0 ? ' checked' : '') + '>' +
                '<span class="time-option-content">' + slot + '</span>' +
            '</label>';
        }).join('');
    }

    closeModal(modal) {
        modal.classList.remove('active');
        setTimeout(function() { modal.remove(); }, 300);
    }

    // ===== ENVIAR CITA =====
    submitAppointment(form, vehicleInfo, modal) {
        var formData = new FormData(form);

        var nombre = formData.get('nombre');
        var telefono = formData.get('telefono');
        var email = formData.get('email') || 'No proporcionado';
        var fecha = formData.get('fecha');
        var hora = formData.get('hora');
        var comentarios = formData.get('comentarios') || 'Ninguno';

        var self = this;
        var submitBtn = form.querySelector('.btn-submit-appointment');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Reservando...';
        }

        // Atomic booking: reserve the slot first, then save the appointment
        this.bookSlotAtomically(fecha, hora).then(function() {
            // Slot reserved successfully, now save the full appointment
            return self.saveAppointmentToFirestore({
                nombre: nombre,
                whatsapp: telefono,
                telefono: telefono,
                email: email,
                fecha: fecha,
                hora: hora,
                comentarios: comentarios,
                vehiculo: vehicleInfo.marca ? (vehicleInfo.marca + ' ' + vehicleInfo.modelo + ' ' + (vehicleInfo.year || '')) : '',
                vehiculoId: vehicleInfo.id || '',
                vehiculoPrecio: vehicleInfo.precio || 0,
                estado: 'pendiente',
                observaciones: '',
                createdAt: new Date().toISOString()
            });
        }).then(function() {
            self.showConfirmation(modal, nombre, fecha, hora);
        }).catch(function(err) {
            if (err && err.message === 'SLOT_TAKEN') {
                alert('Lo sentimos, este horario acaba de ser reservado por otra persona. Por favor selecciona otro horario.');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Enviar Solicitud de Cita';
                }
                // Refresh time slots to show updated availability
                self.showTimeSlots(modal);
            } else {
                // Firestore might be unavailable, still show confirmation
                self.showConfirmation(modal, nombre, fecha, hora);
            }
        });
    }

    // ===== ATOMIC SLOT BOOKING =====
    async bookSlotAtomically(fecha, hora) {
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

    // ===== SHOW CONFIRMATION MESSAGE =====
    showConfirmation(modal, nombre, fecha, hora) {
        var fechaObj = new Date(fecha + 'T12:00:00');
        var fechaFormateada = fechaObj.toLocaleDateString('es-CO', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        var modalContent = modal.querySelector('.appointment-modal');
        if (modalContent) {
            modalContent.innerHTML = '\
                <div class="appointment-modal-header">\
                    <h2 class="appointment-modal-title">\
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2">\
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>\
                            <polyline points="22 4 12 14.01 9 11.01"/>\
                        </svg>\
                        Solicitud Enviada\
                    </h2>\
                    <button type="button" class="appointment-modal-close" aria-label="Cerrar">&times;</button>\
                </div>\
                <div class="appointment-modal-body" style="text-align:center;padding:2rem 1.5rem;">\
                    <div style="width:64px;height:64px;background:#ecfdf5;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 1rem;">\
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5">\
                            <polyline points="20 6 9 17 4 12"/>\
                        </svg>\
                    </div>\
                    <h3 style="font-size:1.25rem;font-weight:700;color:#1f2937;margin-bottom:0.5rem;">Gracias, ' + nombre + '</h3>\
                    <p style="font-size:0.95rem;color:#4b5563;margin-bottom:1rem;">Tu solicitud de cita ha sido registrada correctamente.</p>\
                    <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:10px;padding:1rem;text-align:left;margin-bottom:1rem;">\
                        <div style="font-size:0.85rem;color:#0369a1;font-weight:600;margin-bottom:0.5rem;">Detalles de tu cita:</div>\
                        <div style="font-size:0.9rem;color:#1e40af;">Fecha: ' + fechaFormateada + '</div>\
                        <div style="font-size:0.9rem;color:#1e40af;">Hora: ' + hora + '</div>\
                    </div>\
                    <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:1rem;text-align:left;margin-bottom:1.5rem;">\
                        <div style="display:flex;align-items:flex-start;gap:0.5rem;">\
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2" style="flex-shrink:0;margin-top:2px;">\
                                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>\
                            </svg>\
                            <span style="font-size:0.85rem;color:#92400e;line-height:1.5;">\
                                <strong>Pendiente de confirmacion:</strong> Tu cita queda en estado pendiente hasta ser confirmada por nuestro equipo. \
                                Te contactaremos por <strong>WhatsApp</strong> para confirmar la cita oficialmente.\
                            </span>\
                        </div>\
                    </div>\
                    <button type="button" class="btn-submit-appointment" style="background:linear-gradient(135deg,#3b82f6 0%,#1d4ed8 100%);" onclick="this.closest(\'.appointment-modal-overlay\').classList.remove(\'active\');setTimeout(function(){var m=document.getElementById(\'appointment-modal\');if(m)m.remove();},300);">\
                        Entendido\
                    </button>\
                </div>';
        }

        // Re-attach close button
        var closeBtn = modal.querySelector('.appointment-modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                modal.classList.remove('active');
                setTimeout(function() { modal.remove(); }, 300);
            });
        }
    }

    // ===== GUARDAR CITA EN FIRESTORE =====
    saveAppointmentToFirestore(data) {
        try {
            if (window.db) {
                return window.db.collection('citas').add(data);
            }
        } catch (e) {
            console.warn('[Citas] Firestore no disponible');
        }
        return Promise.resolve();
    }

    // ===== EVENT LISTENERS GLOBALES =====
    attachEventListeners() {
        var self = this;
        document.addEventListener('click', function(e) {
            if (e.target.closest('#btn-agendar-cita')) {
                var vehicleInfo = self.getVehicleInfoFromPage();
                self.createModal(vehicleInfo);
            }

            if (e.target.closest('.btn-agendar-cita')) {
                var btn = e.target.closest('.btn-agendar-cita');
                var vehicleInfo = {
                    marca: btn.dataset.marca || '',
                    modelo: btn.dataset.modelo || '',
                    year: btn.dataset.year || '',
                    precio: parseInt(btn.dataset.precio) || 0,
                    id: btn.dataset.id || ''
                };
                self.createModal(vehicleInfo);
            }
        });
    }

    // ===== OBTENER INFO DEL VEHICULO DE LA PAGINA =====
    getVehicleInfoFromPage() {
        var info = {};

        var title = document.querySelector('.vehicle-title, h1');
        if (title) {
            var parts = title.textContent.trim().split(' ');
            if (parts.length >= 2) {
                info.marca = parts[0];
                info.modelo = parts.slice(1, -1).join(' ') || parts[1];
                var lastPart = parts[parts.length - 1];
                if (/^\d{4}$/.test(lastPart)) {
                    info.year = lastPart;
                }
            }
        }

        var priceEl = document.querySelector('.vehicle-price, .price');
        if (priceEl) {
            var priceText = priceEl.textContent.replace(/[^0-9]/g, '');
            info.precio = parseInt(priceText) || 0;
        }

        return info;
    }
}

// Inicializar
document.addEventListener('DOMContentLoaded', function() {
    window.appointmentSystem = new AppointmentSystem();
});
