// ============================================
// HISTORIAL DE VEHÍCULOS VISITADOS - ALTORRA CARS
// Guarda y muestra los últimos vehículos vistos
// ============================================

class VehicleHistory {
    constructor() {
        this.storageKey = 'altorra_historial';
        this.maxItems = 12;
        this.history = [];
        this.init();
    }

    init() {
        this.loadFromStorage();
        this.trackCurrentVehicle();
    }

    // ===== STORAGE =====
    loadFromStorage() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            this.history = stored ? JSON.parse(stored) : [];
        } catch (e) {
            this.history = [];
        }
    }

    saveToStorage() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.history));
        } catch (e) {
            console.error('Error saving history:', e);
        }
    }

    // ===== TRACKING =====
    trackCurrentVehicle() {
        // Solo rastrear en páginas de detalle
        if (!window.location.pathname.includes('detalle-vehiculo')) return;

        const params = new URLSearchParams(window.location.search);
        const vehicleId = params.get('id');

        if (vehicleId) {
            this.addToHistory(vehicleId);
        }
    }

    addToHistory(vehicleId) {
        const id = String(vehicleId);
        const timestamp = Date.now();

        // Remover si ya existe (para moverlo al inicio)
        this.history = this.history.filter(item => String(item.id) !== id);

        // Agregar al inicio
        this.history.unshift({
            id: id,
            timestamp: timestamp
        });

        // Limitar al máximo
        if (this.history.length > this.maxItems) {
            this.history = this.history.slice(0, this.maxItems);
        }

        this.saveToStorage();
    }

    getHistory() {
        return [...this.history];
    }

    getHistoryIds() {
        return this.history.map(item => item.id);
    }

    clearHistory() {
        this.history = [];
        this.saveToStorage();
    }

    removeFromHistory(vehicleId) {
        const id = String(vehicleId);
        this.history = this.history.filter(item => String(item.id) !== id);
        this.saveToStorage();
    }

    hasHistory() {
        return this.history.length > 0;
    }

    getCount() {
        return this.history.length;
    }

    // ===== RENDERING =====
    async renderHistorySection(containerId, options = {}) {
        const {
            title = 'Vistos recientemente',
            maxShow = 4,
            showClearButton = true
        } = options;

        const container = document.getElementById(containerId);
        if (!container) return;

        if (!this.hasHistory()) {
            container.style.display = 'none';
            return;
        }

        // Cargar datos de vehículos
        if (typeof vehicleDB === 'undefined') {
            console.warn('VehicleDB not available');
            return;
        }

        await vehicleDB.load();

        const historyIds = this.getHistoryIds().slice(0, maxShow);
        const vehicles = historyIds
            .map(id => vehicleDB.getVehicleById(id))
            .filter(v => v);

        if (vehicles.length === 0) {
            container.style.display = 'none';
            return;
        }

        container.style.display = 'block';
        container.innerHTML = `
            <div class="history-section">
                <div class="history-header">
                    <h3 class="history-title">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12,6 12,12 16,14"/>
                        </svg>
                        ${title}
                    </h3>
                    ${showClearButton ? `
                        <button class="history-clear-btn" id="clearHistoryBtn">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3,6 5,6 21,6"/>
                                <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2v2"/>
                            </svg>
                            Limpiar
                        </button>
                    ` : ''}
                </div>
                <div class="history-grid">
                    ${vehicles.map(v => this.renderHistoryCard(v)).join('')}
                </div>
            </div>
        `;

        // Event listener para limpiar
        const clearBtn = container.querySelector('#clearHistoryBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearHistory();
                container.style.display = 'none';
                if (typeof toast !== 'undefined') {
                    toast.info('Historial limpiado');
                }
            });
        }
    }

    renderHistoryCard(vehicle) {
        const price = vehicle.precioOferta || vehicle.precio;
        return `
            <a href="${getVehicleDetailUrl(vehicle)}" class="history-card">
                <div class="history-card-image">
                    <img src="${vehicle.imagen}" alt="${vehicle.marca} ${vehicle.modelo}"
                         loading="lazy"
                         onerror="this.src='multimedia/vehicles/placeholder-car.jpg'">
                </div>
                <div class="history-card-info">
                    <h4>${this.capitalize(vehicle.marca)} ${vehicle.modelo}</h4>
                    <span class="history-card-year">${vehicle.year}</span>
                    <span class="history-card-price">${this.formatCurrency(price)}</span>
                </div>
            </a>
        `;
    }

    // ===== WIDGET FLOTANTE =====
    createFloatingWidget() {
        if (!this.hasHistory()) return;
        if (document.getElementById('history-widget')) return;

        const widget = document.createElement('div');
        widget.id = 'history-widget';
        widget.className = 'history-widget';
        widget.innerHTML = `
            <button class="history-widget-toggle" id="historyWidgetToggle">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12,6 12,12 16,14"/>
                </svg>
                <span class="history-widget-count">${this.getCount()}</span>
            </button>
            <div class="history-widget-dropdown" id="historyWidgetDropdown">
                <div class="history-widget-header">
                    <span>Vistos recientemente</span>
                    <button class="history-widget-clear" id="historyWidgetClear">Limpiar</button>
                </div>
                <div class="history-widget-list" id="historyWidgetList">
                    <!-- Se llena dinámicamente -->
                </div>
            </div>
        `;

        document.body.appendChild(widget);
        this.attachWidgetListeners();
        this.updateWidget();
    }

    attachWidgetListeners() {
        const toggle = document.getElementById('historyWidgetToggle');
        const clear = document.getElementById('historyWidgetClear');
        const widget = document.getElementById('history-widget');

        if (toggle) {
            toggle.addEventListener('click', () => {
                widget.classList.toggle('open');
                if (widget.classList.contains('open')) {
                    this.updateWidget();
                }
            });
        }

        if (clear) {
            clear.addEventListener('click', () => {
                this.clearHistory();
                widget.classList.remove('open');
                widget.remove();
                if (typeof toast !== 'undefined') {
                    toast.info('Historial limpiado');
                }
            });
        }

        // Cerrar al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (widget && !widget.contains(e.target)) {
                widget.classList.remove('open');
            }
        });
    }

    async updateWidget() {
        const list = document.getElementById('historyWidgetList');
        const countEl = document.querySelector('.history-widget-count');

        if (countEl) {
            countEl.textContent = this.getCount();
        }

        if (!list) return;

        if (!this.hasHistory()) {
            list.innerHTML = '<p class="history-widget-empty">No hay vehículos en tu historial</p>';
            return;
        }

        await vehicleDB.load();

        const historyIds = this.getHistoryIds().slice(0, 5);
        const vehicles = historyIds
            .map(id => vehicleDB.getVehicleById(id))
            .filter(v => v);

        list.innerHTML = vehicles.map(v => `
            <a href="${getVehicleDetailUrl(v)}" class="history-widget-item">
                <img src="${v.imagen}" alt="${v.marca}"
                     onerror="this.src='multimedia/vehicles/placeholder-car.jpg'">
                <div class="history-widget-item-info">
                    <span class="history-widget-item-name">${this.capitalize(v.marca)} ${v.modelo}</span>
                    <span class="history-widget-item-price">${this.formatCurrency(v.precioOferta || v.precio)}</span>
                </div>
            </a>
        `).join('');
    }

    // ===== UTILITIES =====
    formatCurrency(amount) {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(amount);
    }

    capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}

// Crear instancia global
const vehicleHistory = new VehicleHistory();

// Disponible globalmente
if (typeof window !== 'undefined') {
    window.vehicleHistory = vehicleHistory;
}
