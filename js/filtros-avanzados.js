// ============================================
// FILTROS AVANZADOS CON SLIDERS - ALTORRA CARS
// Range sliders duales para precio, año, kilometraje
// ============================================

class AdvancedFilters {
    constructor() {
        this.filters = {
            precioMin: 20000000,
            precioMax: 300000000,
            yearMin: 2015,
            yearMax: new Date().getFullYear() + 1,
            kmMin: 0,
            kmMax: 200000
        };
        this.currentValues = { ...this.filters };
        this.init();
    }

    init() {
        this.injectSliders();
        this.attachEventListeners();
    }

    // ===== INYECTAR SLIDERS EN FORMULARIO =====
    injectSliders() {
        // Buscar el formulario de búsqueda avanzada
        const form = document.getElementById('advancedSearchForm');
        if (!form) return;

        // Buscar o crear contenedor para sliders
        let slidersContainer = document.getElementById('advanced-sliders');
        if (!slidersContainer) {
            slidersContainer = document.createElement('div');
            slidersContainer.id = 'advanced-sliders';
            slidersContainer.className = 'advanced-sliders-container';

            // Insertar DESPUÉS del grid de filtros, antes de search-actions
            const searchActions = form.querySelector('.search-actions');
            if (searchActions) {
                form.insertBefore(slidersContainer, searchActions);
            } else {
                form.appendChild(slidersContainer);
            }
        }

        slidersContainer.innerHTML = `
            <div class="slider-section slider-section-horizontal">
                <h4 class="slider-section-title">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="4" y1="21" x2="4" y2="14"/>
                        <line x1="4" y1="10" x2="4" y2="3"/>
                        <line x1="12" y1="21" x2="12" y2="12"/>
                        <line x1="12" y1="8" x2="12" y2="3"/>
                        <line x1="20" y1="21" x2="20" y2="16"/>
                        <line x1="20" y1="12" x2="20" y2="3"/>
                        <line x1="1" y1="14" x2="7" y2="14"/>
                        <line x1="9" y1="8" x2="15" y2="8"/>
                        <line x1="17" y1="16" x2="23" y2="16"/>
                    </svg>
                    Filtros por Rango
                </h4>

                <div class="sliders-horizontal-grid">
                    <!-- Slider de Precio -->
                    <div class="range-slider-group">
                        <div class="range-slider-header">
                            <label>Precio</label>
                            <span class="range-values" id="precio-values">
                                <span id="precio-min-display">$20M</span>
                                <span class="range-separator">-</span>
                                <span id="precio-max-display">$300M</span>
                            </span>
                        </div>
                        <div class="dual-range-slider" id="precio-slider">
                            <div class="range-track">
                                <div class="range-fill" id="precio-fill"></div>
                            </div>
                            <input type="range" class="range-input range-min" id="precio-min"
                                   min="20000000" max="300000000" step="5000000" value="20000000">
                            <input type="range" class="range-input range-max" id="precio-max"
                                   min="20000000" max="300000000" step="5000000" value="300000000">
                        </div>
                        <div class="range-labels">
                            <span>$20M</span>
                            <span>$300M</span>
                        </div>
                    </div>

                    <!-- Slider de Año -->
                    <div class="range-slider-group">
                        <div class="range-slider-header">
                            <label>Año</label>
                            <span class="range-values" id="year-values">
                                <span id="year-min-display">2015</span>
                                <span class="range-separator">-</span>
                                <span id="year-max-display">${this.filters.yearMax}</span>
                            </span>
                        </div>
                        <div class="dual-range-slider" id="year-slider">
                            <div class="range-track">
                                <div class="range-fill" id="year-fill"></div>
                            </div>
                            <input type="range" class="range-input range-min" id="year-min"
                                   min="2015" max="${this.filters.yearMax}" step="1" value="2015">
                            <input type="range" class="range-input range-max" id="year-max"
                                   min="2015" max="${this.filters.yearMax}" step="1" value="${this.filters.yearMax}">
                        </div>
                        <div class="range-labels">
                            <span>2015</span>
                            <span>${this.filters.yearMax}</span>
                        </div>
                    </div>

                    <!-- Slider de Kilometraje -->
                    <div class="range-slider-group">
                        <div class="range-slider-header">
                            <label>Kilometraje</label>
                            <span class="range-values" id="km-values">
                                <span id="km-min-display">0 km</span>
                                <span class="range-separator">-</span>
                                <span id="km-max-display">200.000 km</span>
                            </span>
                        </div>
                        <div class="dual-range-slider" id="km-slider">
                            <div class="range-track">
                                <div class="range-fill" id="km-fill"></div>
                            </div>
                            <input type="range" class="range-input range-min" id="km-min"
                                   min="0" max="200000" step="5000" value="0">
                            <input type="range" class="range-input range-max" id="km-max"
                                   min="0" max="200000" step="5000" value="200000">
                        </div>
                        <div class="range-labels">
                            <span>0 km</span>
                            <span>200.000 km</span>
                        </div>
                    </div>
                </div>

                <button type="button" class="btn-reset-sliders" id="resetSliders">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                        <path d="M3 3v5h5"/>
                    </svg>
                    Reiniciar rangos
                </button>
            </div>
        `;

        this.updateAllSliders();
    }

    // ===== EVENT LISTENERS =====
    attachEventListeners() {
        // Precio sliders
        document.addEventListener('input', (e) => {
            if (e.target.id === 'precio-min' || e.target.id === 'precio-max') {
                this.handleDualSlider('precio', 'precio-min', 'precio-max');
            }
            if (e.target.id === 'year-min' || e.target.id === 'year-max') {
                this.handleDualSlider('year', 'year-min', 'year-max');
            }
            if (e.target.id === 'km-min' || e.target.id === 'km-max') {
                this.handleDualSlider('km', 'km-min', 'km-max');
            }
        });

        // Reset button
        document.addEventListener('click', (e) => {
            if (e.target.closest('#resetSliders')) {
                this.resetSliders();
            }
        });

        // Integrar con búsqueda
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('range-input')) {
                this.triggerSearch();
            }
        });
    }

    handleDualSlider(prefix, minId, maxId) {
        const minInput = document.getElementById(minId);
        const maxInput = document.getElementById(maxId);

        if (!minInput || !maxInput) return;

        let minVal = parseInt(minInput.value);
        let maxVal = parseInt(maxInput.value);

        // Evitar que se crucen
        if (minVal > maxVal - this.getMinGap(prefix)) {
            if (event.target.id === minId) {
                minInput.value = maxVal - this.getMinGap(prefix);
                minVal = parseInt(minInput.value);
            } else {
                maxInput.value = minVal + this.getMinGap(prefix);
                maxVal = parseInt(maxInput.value);
            }
        }

        // Actualizar valores actuales
        this.currentValues[`${prefix}Min`] = minVal;
        this.currentValues[`${prefix}Max`] = maxVal;

        // Actualizar display
        this.updateSliderDisplay(prefix, minVal, maxVal);
        this.updateSliderFill(prefix, minInput, maxInput);
    }

    getMinGap(prefix) {
        switch (prefix) {
            case 'precio': return 10000000;
            case 'year': return 1;
            case 'km': return 10000;
            default: return 0;
        }
    }

    updateSliderDisplay(prefix, min, max) {
        const minDisplay = document.getElementById(`${prefix}-min-display`);
        const maxDisplay = document.getElementById(`${prefix}-max-display`);

        if (!minDisplay || !maxDisplay) return;

        switch (prefix) {
            case 'precio':
                minDisplay.textContent = this.formatPriceShort(min);
                maxDisplay.textContent = this.formatPriceShort(max);
                break;
            case 'year':
                minDisplay.textContent = min;
                maxDisplay.textContent = max;
                break;
            case 'km':
                minDisplay.textContent = this.formatKm(min);
                maxDisplay.textContent = this.formatKm(max);
                break;
        }
    }

    updateSliderFill(prefix, minInput, maxInput) {
        const fill = document.getElementById(`${prefix}-fill`);
        if (!fill) return;

        const min = parseInt(minInput.min);
        const max = parseInt(minInput.max);
        const minVal = parseInt(minInput.value);
        const maxVal = parseInt(maxInput.value);

        const percentMin = ((minVal - min) / (max - min)) * 100;
        const percentMax = ((maxVal - min) / (max - min)) * 100;

        fill.style.left = `${percentMin}%`;
        fill.style.width = `${percentMax - percentMin}%`;
    }

    updateAllSliders() {
        // Precio
        this.handleDualSlider('precio', 'precio-min', 'precio-max');
        // Año
        this.handleDualSlider('year', 'year-min', 'year-max');
        // Kilometraje
        this.handleDualSlider('km', 'km-min', 'km-max');
    }

    resetSliders() {
        // Reset precio
        const precioMin = document.getElementById('precio-min');
        const precioMax = document.getElementById('precio-max');
        if (precioMin) precioMin.value = this.filters.precioMin;
        if (precioMax) precioMax.value = this.filters.precioMax;

        // Reset año
        const yearMin = document.getElementById('year-min');
        const yearMax = document.getElementById('year-max');
        if (yearMin) yearMin.value = this.filters.yearMin;
        if (yearMax) yearMax.value = this.filters.yearMax;

        // Reset km
        const kmMin = document.getElementById('km-min');
        const kmMax = document.getElementById('km-max');
        if (kmMin) kmMin.value = this.filters.kmMin;
        if (kmMax) kmMax.value = this.filters.kmMax;

        this.currentValues = { ...this.filters };
        this.updateAllSliders();
        this.triggerSearch();

        if (typeof toast !== 'undefined') {
            toast.info('Rangos reiniciados');
        }
    }

    triggerSearch() {
        // Disparar evento personalizado para que la página de búsqueda lo capture
        const event = new CustomEvent('advancedFiltersChanged', {
            detail: this.getFilterValues()
        });
        document.dispatchEvent(event);

        // Si existe la función performSearch, llamarla
        if (typeof window.performSearch === 'function') {
            // Actualizar los filtros globales si existen
            if (typeof window.currentFilters !== 'undefined') {
                const values = this.getFilterValues();
                window.currentFilters.precioMin = values.precioMin;
                window.currentFilters.precioMax = values.precioMax;
                window.currentFilters.yearMin = values.yearMin;
                window.currentFilters.yearMax = values.yearMax;
                window.currentFilters.kmMin = values.kmMin;
                window.currentFilters.kmMax = values.kmMax;
            }
        }
    }

    getFilterValues() {
        return {
            precioMin: this.currentValues.precioMin,
            precioMax: this.currentValues.precioMax,
            yearMin: this.currentValues.yearMin,
            yearMax: this.currentValues.yearMax,
            kmMin: this.currentValues.kmMin,
            kmMax: this.currentValues.kmMax
        };
    }

    // ===== UTILITIES =====
    formatPriceShort(amount) {
        if (amount >= 1000000000) {
            return `$${(amount / 1000000000).toFixed(1)}B`;
        }
        if (amount >= 1000000) {
            return `$${(amount / 1000000).toFixed(0)}M`;
        }
        return `$${amount.toLocaleString('es-CO')}`;
    }

    formatKm(km) {
        if (km === 0) return '0 km';
        return `${km.toLocaleString('es-CO')} km`;
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Solo inicializar en páginas con formulario de búsqueda
    if (document.getElementById('advancedSearchForm')) {
        window.advancedFilters = new AdvancedFilters();
    }
});
