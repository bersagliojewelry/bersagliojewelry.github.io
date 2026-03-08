// ============================================
// COMPARADOR DE VEHÍCULOS - ALTORRA CARS
// Permite comparar hasta 3 vehículos lado a lado
// ============================================

class VehicleComparator {
    constructor() {
        this.maxVehicles = 3;
        this.storageKey = 'altorra_comparador';
        this.vehicles = [];
        this.init();
    }

    init() {
        this.loadFromStorage();
        this.createFloatingWidget();
        this.attachEventListeners();
    }

    // ===== STORAGE =====
    loadFromStorage() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            this.vehicles = stored ? JSON.parse(stored) : [];
        } catch (e) {
            this.vehicles = [];
        }
    }

    saveToStorage() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.vehicles));
        } catch (e) {
            console.error('Error saving comparator:', e);
        }
    }

    // ===== VEHICLE MANAGEMENT =====
    add(vehicleId) {
        const id = String(vehicleId);

        if (this.vehicles.includes(id)) {
            if (typeof toast !== 'undefined') {
                toast.info('Este vehículo ya está en el comparador');
            }
            return false;
        }

        if (this.vehicles.length >= this.maxVehicles) {
            if (typeof toast !== 'undefined') {
                toast.warning(`Máximo ${this.maxVehicles} vehículos. Elimina uno para agregar otro.`);
            }
            return false;
        }

        this.vehicles.push(id);
        this.saveToStorage();
        this.updateWidget();
        this.updateButtons();

        if (typeof toast !== 'undefined') {
            toast.success('Vehículo agregado al comparador');
        }

        return true;
    }

    remove(vehicleId) {
        const id = String(vehicleId);
        const index = this.vehicles.indexOf(id);

        if (index > -1) {
            this.vehicles.splice(index, 1);
            this.saveToStorage();
            this.updateWidget();
            this.updateButtons();

            if (typeof toast !== 'undefined') {
                toast.info('Vehiculo quitado del comparador');
            }

            return true;
        }
        return false;
    }

    toggle(vehicleId) {
        const id = String(vehicleId);
        if (this.has(id)) {
            this.remove(id);
            return false;
        } else {
            return this.add(id);
        }
    }

    has(vehicleId) {
        return this.vehicles.includes(String(vehicleId));
    }

    clear() {
        this.vehicles = [];
        this.saveToStorage();
        this.updateWidget();
        this.updateButtons();
    }

    getCount() {
        return this.vehicles.length;
    }

    getIds() {
        return [...this.vehicles];
    }

    // ===== FLOATING WIDGET =====
    createFloatingWidget() {
        // Verificar si ya existe
        if (document.getElementById('comparador-widget')) return;

        const widget = document.createElement('div');
        widget.id = 'comparador-widget';
        widget.className = 'comparador-widget';
        widget.innerHTML = `
            <div class="comparador-widget-header">
                <div class="comparador-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="2" y="3" width="5" height="9" rx="1"/>
                        <rect x="9.5" y="3" width="5" height="9" rx="1"/>
                        <rect x="17" y="3" width="5" height="9" rx="1"/>
                        <path d="M4 15v6M12 15v6M20 15v6M2 18h4M10 18h4M18 18h4"/>
                    </svg>
                </div>
                <span class="comparador-title">Comparador</span>
                <span class="comparador-count" id="comparador-count">0</span>
            </div>
            <div class="comparador-widget-body" id="comparador-body">
                <div class="comparador-empty">
                    <p>Agrega vehículos para comparar</p>
                </div>
            </div>
            <div class="comparador-widget-footer">
                <button class="btn-comparar" id="btn-ir-comparar" disabled>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
                    </svg>
                    Comparar ahora
                </button>
                <button class="btn-limpiar" id="btn-limpiar-comparador">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3,6 5,6 21,6"/>
                        <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2v2"/>
                    </svg>
                    Limpiar
                </button>
            </div>
        `;

        document.body.appendChild(widget);
        this.updateWidget();
    }

    async updateWidget() {
        const countEl = document.getElementById('comparador-count');
        const bodyEl = document.getElementById('comparador-body');
        const btnComparar = document.getElementById('btn-ir-comparar');
        const widget = document.getElementById('comparador-widget');

        if (!countEl || !bodyEl) return;

        const count = this.getCount();
        countEl.textContent = count;

        // Mostrar/ocultar widget
        if (widget) {
            widget.classList.toggle('has-vehicles', count > 0);
        }

        // Habilitar/deshabilitar botón
        if (btnComparar) {
            btnComparar.disabled = count < 2;
        }

        if (count === 0) {
            bodyEl.innerHTML = `
                <div class="comparador-empty">
                    <p>Agrega vehículos para comparar</p>
                </div>
            `;
            return;
        }

        // Cargar datos de vehículos
        await vehicleDB.load();

        let html = '<div class="comparador-items">';
        for (const id of this.vehicles) {
            const v = vehicleDB.getVehicleById(id);
            if (v) {
                html += `
                    <div class="comparador-item" data-id="${v.id}">
                        <img src="${v.imagen}" alt="${v.marca} ${v.modelo}"
                             onerror="this.src='multimedia/vehicles/placeholder-car.jpg'">
                        <div class="comparador-item-info">
                            <span class="comparador-item-name">${this.capitalizar(v.marca)} ${v.modelo}</span>
                            <span class="comparador-item-year">${v.year}</span>
                        </div>
                        <button class="comparador-item-remove" data-remove="${v.id}" title="Quitar">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                                <line x1="18" y1="6" x2="6" y2="18"/>
                                <line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                        </button>
                    </div>
                `;
            }
        }
        html += '</div>';
        bodyEl.innerHTML = html;

        // Attach remove listeners
        bodyEl.querySelectorAll('.comparador-item-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.remove;
                this.remove(id);
            });
        });
    }

    updateButtons() {
        // Actualizar todos los botones de comparar en las tarjetas
        document.querySelectorAll('[data-compare]').forEach(btn => {
            const id = btn.dataset.compare;
            const isInComparator = this.has(id);
            btn.classList.toggle('active', isInComparator);
            btn.setAttribute('aria-pressed', isInComparator);

            const icon = btn.querySelector('.compare-icon');
            if (icon) {
                // Icono de 3 columnas para comparar (max 3 vehiculos), checkmark cuando agregado
                icon.innerHTML = isInComparator
                    ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>'
                    : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="5" height="9" rx="1"/><rect x="9.5" y="3" width="5" height="9" rx="1"/><rect x="17" y="3" width="5" height="9" rx="1"/><path d="M4 15v6M12 15v6M20 15v6M2 18h4M10 18h4M18 18h4"/></svg>';
            }

            const text = btn.querySelector('.compare-text');
            if (text) {
                text.textContent = isInComparator ? 'Agregado' : 'Comparar';
            }
        });

        // Actualizar boton especial de pagina detalle-vehiculo
        this.updateDetailPageButton();
    }

    updateDetailPageButton() {
        const btnComparar = document.getElementById('btnComparar');
        const btnCompararText = document.getElementById('btnCompararText');
        const btnCompararIcon = document.getElementById('btnCompararIcon');

        if (!btnComparar) return;

        // Obtener ID del vehiculo de la URL
        const params = new URLSearchParams(window.location.search);
        const vehicleId = params.get('id');

        if (!vehicleId) return;

        const isInComparator = this.has(vehicleId);
        btnComparar.classList.toggle('active', isInComparator);

        if (btnCompararText) {
            btnCompararText.textContent = isInComparator ? 'Agregado' : 'Comparar';
        }

        if (btnCompararIcon) {
            if (isInComparator) {
                btnCompararIcon.innerHTML = '<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>';
                btnCompararIcon.setAttribute('fill', 'currentColor');
                btnCompararIcon.removeAttribute('stroke');
            } else {
                // Icono de 3 columnas para comparar (max 3 vehiculos)
                btnCompararIcon.innerHTML = '<rect x="2" y="3" width="5" height="9" rx="1"/><rect x="9.5" y="3" width="5" height="9" rx="1"/><rect x="17" y="3" width="5" height="9" rx="1"/><path d="M4 15v6M12 15v6M20 15v6M2 18h4M10 18h4M18 18h4"/>';
                btnCompararIcon.setAttribute('fill', 'none');
                btnCompararIcon.setAttribute('stroke', 'currentColor');
            }
        }
    }

    attachEventListeners() {
        // Delegación de eventos para botones de comparar
        document.addEventListener('click', (e) => {
            const compareBtn = e.target.closest('[data-compare]');
            if (compareBtn) {
                e.preventDefault();
                e.stopPropagation();
                const id = compareBtn.dataset.compare;
                this.toggle(id);
            }
        });

        // Botón ir a comparar
        document.addEventListener('click', (e) => {
            if (e.target.closest('#btn-ir-comparar')) {
                if (this.getCount() >= 2) {
                    window.location.href = 'comparar.html';
                }
            }
        });

        // Botón limpiar
        document.addEventListener('click', (e) => {
            if (e.target.closest('#btn-limpiar-comparador')) {
                this.clear();
                if (typeof toast !== 'undefined') {
                    toast.info('Comparador limpiado');
                }
            }
        });

        // Toggle widget en mobile
        document.addEventListener('click', (e) => {
            const header = e.target.closest('.comparador-widget-header');
            if (header) {
                const widget = document.getElementById('comparador-widget');
                if (widget) {
                    widget.classList.toggle('expanded');
                }
            }
        });
    }

    capitalizar(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // ===== COMPARISON DATA =====
    async getComparisonData() {
        await vehicleDB.load();

        const vehicles = [];
        for (const id of this.vehicles) {
            const v = vehicleDB.getVehicleById(id);
            if (v) vehicles.push(v);
        }
        return vehicles;
    }
}

// Crear instancia global
const vehicleComparator = new VehicleComparator();

// Hacer disponible globalmente
if (typeof window !== 'undefined') {
    window.vehicleComparator = vehicleComparator;
}
