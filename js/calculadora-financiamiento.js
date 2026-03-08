// ============================================
// CALCULADORA DE FINANCIAMIENTO - ALTORRA CARS
// Sistema avanzado de simulación de crédito vehicular
// ============================================

class FinancingCalculator {
    constructor() {
        // Configuración general
        this.whatsappNumber = '573235016747';
        this.termsStorageKey = 'altorra_financing_terms_accepted';
        this.termsExpiryDays = 7;

        // Configuración de entidades financieras
        this.entities = {
            SUFI: {
                name: 'SUFI',
                nmv: 1.35,
                insurance: 0.025,
                maxTerm: 84,
                minDownPayment: 20,
                color: '#0066cc'
            },
            OCCIDENTE: {
                name: 'Banco de Occidente',
                nmv: 1.42,
                insurance: 0.028,
                maxTerm: 72,
                minDownPayment: 30,
                color: '#e31937'
            },
            FINANDINA: {
                name: 'Finandina',
                nmv: 1.55,
                insurance: 0.022,
                maxTerm: 72,
                minDownPayment: 20,
                color: '#00a651'
            },
            FINANZAUTO: {
                name: 'Finanzauto',
                nmv: 1.65,
                insurance: 0.030,
                maxTerm: 60,
                minDownPayment: 30,
                color: '#ff6600'
            }
        };

        // Plazos disponibles
        this.availableTerms = [12, 24, 36, 48, 60, 72, 84];

        // Estado
        this.currentVehicle = null;
        this.currentMode = 'quick'; // 'quick' o 'advanced'

        this.init();
    }

    init() {
        this.createModal();
        this.attachEventListeners();
    }

    // ===== VERIFICACIÓN DE TÉRMINOS =====
    hasAcceptedTerms() {
        const stored = localStorage.getItem(this.termsStorageKey);
        if (!stored) return false;

        try {
            const { accepted, timestamp } = JSON.parse(stored);
            const expiryMs = this.termsExpiryDays * 24 * 60 * 60 * 1000;
            return accepted && (Date.now() - timestamp) < expiryMs;
        } catch {
            return false;
        }
    }

    acceptTerms() {
        localStorage.setItem(this.termsStorageKey, JSON.stringify({
            accepted: true,
            timestamp: Date.now()
        }));
    }

    // ===== CREACIÓN DEL MODAL =====
    createModal() {
        if (document.getElementById('financing-calculator-modal')) return;

        const modal = document.createElement('div');
        modal.id = 'financing-calculator-modal';
        modal.className = 'financing-modal-overlay';
        modal.innerHTML = `
            <div class="financing-modal" role="dialog" aria-modal="true">
                <!-- PANTALLA DE TÉRMINOS -->
                <div class="financing-screen financing-terms-screen" id="financing-terms-screen">
                    <button class="financing-modal-close" aria-label="Cerrar">&times;</button>

                    <div class="financing-terms-content">
                        <div class="financing-terms-icon">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                                <path d="M12 16v-4"/>
                                <path d="M12 8h.01"/>
                            </svg>
                        </div>

                        <h2 class="financing-terms-title">Aviso Legal Importante</h2>

                        <div class="financing-terms-text">
                            <p>Esta herramienta de simulación financiera es únicamente de <strong>carácter informativo y referencial</strong>.</p>

                            <p>Los valores mostrados (cuotas, tasas, plazos) son <strong>aproximados</strong> y pueden variar significativamente según:</p>

                            <ul>
                                <li>Tu perfil crediticio y capacidad de pago</li>
                                <li>Políticas vigentes de cada entidad financiera</li>
                                <li>Condiciones del mercado al momento de la solicitud</li>
                                <li>Documentación y verificación de ingresos</li>
                            </ul>

                            <p><strong>ALTORRA CARS no es una entidad financiera</strong> y no garantiza la aprobación de créditos ni las condiciones aquí simuladas.</p>

                            <p>Para conocer las condiciones reales y exactas, debes contactar directamente a las entidades financieras o solicitar asesoría con nuestro equipo.</p>
                        </div>

                        <label class="financing-terms-checkbox">
                            <input type="checkbox" id="financing-accept-terms">
                            <span class="checkbox-mark"></span>
                            <span class="checkbox-text">He leído y acepto que esta simulación es solo referencial</span>
                        </label>

                        <button class="btn-accept-terms" id="btn-accept-terms" disabled>
                            Continuar al simulador
                        </button>
                    </div>
                </div>

                <!-- PANTALLA PRINCIPAL DEL SIMULADOR -->
                <div class="financing-screen financing-main-screen" id="financing-main-screen" style="display: none;">
                    <button class="financing-modal-close" aria-label="Cerrar">&times;</button>

                    <!-- Header -->
                    <div class="financing-header">
                        <div class="financing-icon">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                                <line x1="1" y1="10" x2="23" y2="10"/>
                            </svg>
                        </div>
                        <h2 id="financing-title">Simulador de Crédito</h2>
                        <p class="financing-subtitle">Calcula tu cuota mensual estimada</p>
                    </div>

                    <!-- Tabs de modo -->
                    <div class="financing-mode-tabs">
                        <button class="mode-tab active" data-mode="quick">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                            </svg>
                            Simulación rápida
                        </button>
                        <button class="mode-tab" data-mode="advanced">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/>
                            </svg>
                            Simulación avanzada
                        </button>
                    </div>

                    <!-- Cuerpo del formulario -->
                    <div class="financing-body">
                        <!-- Info del vehículo (si aplica) -->
                        <div class="financing-vehicle-info" id="financing-vehicle-info" style="display: none;">
                            <img id="financing-vehicle-img" src="" alt="Vehículo">
                            <div class="financing-vehicle-details">
                                <h3 id="financing-vehicle-name"></h3>
                                <p id="financing-vehicle-price"></p>
                            </div>
                        </div>

                        <!-- Precio del vehículo -->
                        <div class="financing-field">
                            <label for="financing-price">Precio del vehículo</label>
                            <div class="financing-input-group">
                                <span class="financing-currency">$</span>
                                <input type="text" id="financing-price" inputmode="numeric" placeholder="65.000.000">
                            </div>
                            <div class="financing-slider-container">
                                <input type="range" id="financing-price-slider" min="20000000" max="300000000" step="1000000" value="65000000">
                                <div class="financing-slider-labels">
                                    <span>$20M</span>
                                    <span>$300M</span>
                                </div>
                            </div>
                        </div>

                        <!-- Cuota inicial -->
                        <div class="financing-field">
                            <label for="financing-down-payment">
                                Cuota inicial (<span id="down-payment-percent">30</span>%)
                            </label>
                            <div class="financing-input-group">
                                <span class="financing-currency">$</span>
                                <input type="text" id="financing-down-payment" inputmode="numeric" placeholder="19.500.000">
                            </div>
                            <div class="financing-slider-container">
                                <input type="range" id="financing-down-payment-slider" min="10" max="70" step="5" value="30">
                                <div class="financing-slider-labels">
                                    <span>10%</span>
                                    <span>70%</span>
                                </div>
                            </div>
                            <p class="financing-field-note" id="down-payment-warning" style="display: none;"></p>
                        </div>

                        <!-- Plazo -->
                        <div class="financing-field">
                            <label>Plazo de financiamiento</label>
                            <div class="financing-terms" id="financing-terms-buttons">
                                <!-- Se generan dinámicamente -->
                            </div>
                            <p class="financing-field-note" id="term-warning" style="display: none;"></p>
                        </div>

                        <!-- MODO AVANZADO: Tipo de plan -->
                        <div class="financing-field financing-advanced-only" id="plan-type-field" style="display: none;">
                            <label>Tipo de plan</label>
                            <div class="financing-plan-types">
                                <button class="plan-type-btn active" data-plan="traditional">
                                    <span class="plan-icon">📊</span>
                                    <span class="plan-name">Tradicional</span>
                                    <span class="plan-desc">Cuota fija mensual</span>
                                </button>
                                <button class="plan-type-btn" data-plan="extra">
                                    <span class="plan-icon">💰</span>
                                    <span class="plan-name">Cuotas extra</span>
                                    <span class="plan-desc">+2 cuotas/año</span>
                                </button>
                                <button class="plan-type-btn" data-plan="leasing">
                                    <span class="plan-icon">🔑</span>
                                    <span class="plan-name">Leasing</span>
                                    <span class="plan-desc">Opción de compra</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- RESULTADOS MODO RÁPIDO -->
                    <div class="financing-results financing-quick-results" id="quick-results">
                        <div class="financing-result-item">
                            <span class="result-label">Monto a financiar</span>
                            <span class="result-value" id="quick-amount">$0</span>
                        </div>
                        <div class="financing-result-item main-result">
                            <span class="result-label">Cuota mensual estimada</span>
                            <span class="result-value" id="quick-monthly">$0</span>
                        </div>
                        <div class="financing-result-item">
                            <span class="result-label">Tasa aplicada</span>
                            <span class="result-value" id="quick-rate">1.40% NMV</span>
                        </div>
                        <p class="quick-note">* Simulación referencial con tasa promedio del mercado (1.40% NMV)</p>
                    </div>

                    <!-- RESULTADOS MODO AVANZADO -->
                    <div class="financing-results financing-advanced-results" id="advanced-results" style="display: none;">
                        <h3 class="results-title">Comparativa de entidades</h3>
                        <div class="entities-table-container">
                            <table class="entities-table" id="entities-table">
                                <thead>
                                    <tr>
                                        <th>Entidad</th>
                                        <th>Tasa NMV</th>
                                        <th>Cuota mensual</th>
                                        <th>Total a pagar</th>
                                    </tr>
                                </thead>
                                <tbody id="entities-tbody">
                                    <!-- Se genera dinámicamente -->
                                </tbody>
                            </table>
                        </div>
                        <p class="advanced-note" id="advanced-note"></p>
                    </div>

                    <!-- Acciones -->
                    <div class="financing-actions">
                        <button type="button" class="btn-financing-whatsapp" id="btn-financing-whatsapp">
                            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                            </svg>
                            Solicitar asesoría
                        </button>
                        <button type="button" class="btn-financing-reset" id="btn-financing-reset">
                            Reiniciar
                        </button>
                    </div>

                    <p class="financing-disclaimer">
                        * Simulación con fines informativos. Las condiciones reales dependen de tu perfil crediticio y políticas de cada entidad financiera.
                    </p>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.renderTermButtons();
    }

    // ===== RENDER DE BOTONES DE PLAZO =====
    renderTermButtons(maxTerm = 84) {
        const container = document.getElementById('financing-terms-buttons');
        if (!container) return;

        container.innerHTML = this.availableTerms
            .filter(term => term <= maxTerm)
            .map((term, i) => `
                <button type="button" class="financing-term-btn ${i === 2 ? 'active' : ''}" data-months="${term}">
                    ${term} <small>meses</small>
                </button>
            `).join('');
    }

    // ===== EVENT LISTENERS =====
    attachEventListeners() {
        // Abrir calculadora desde botones [data-financing]
        document.addEventListener('click', (e) => {
            const trigger = e.target.closest('[data-financing]');
            if (trigger) {
                e.preventDefault();
                const vehicleId = trigger.dataset.financing;
                const price = trigger.dataset.price;
                this.open(vehicleId, price);
            }
        });

        // Cerrar modal
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('financing-modal-overlay') ||
                e.target.classList.contains('financing-modal-close')) {
                this.close();
            }
        });

        // ESC para cerrar
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.close();
        });

        // Checkbox de términos
        document.addEventListener('change', (e) => {
            if (e.target.id === 'financing-accept-terms') {
                const btn = document.getElementById('btn-accept-terms');
                if (btn) btn.disabled = !e.target.checked;
            }
        });

        // Botón aceptar términos
        document.addEventListener('click', (e) => {
            if (e.target.closest('#btn-accept-terms')) {
                const checkbox = document.getElementById('financing-accept-terms');
                if (checkbox && checkbox.checked) {
                    this.acceptTerms();
                    this.showMainScreen();
                }
            }
        });

        // Tabs de modo
        document.addEventListener('click', (e) => {
            const tab = e.target.closest('.mode-tab');
            if (tab) {
                document.querySelectorAll('.mode-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.currentMode = tab.dataset.mode;
                this.updateModeUI();
                this.calculate();
            }
        });

        // Sliders
        document.addEventListener('input', (e) => {
            if (e.target.id === 'financing-price-slider') {
                this.updatePriceFromSlider(e.target.value);
            }
            if (e.target.id === 'financing-down-payment-slider') {
                this.updateDownPaymentFromSlider(e.target.value);
            }
            if (e.target.id === 'financing-price') {
                this.updateSliderFromPrice(e.target.value);
            }
            if (e.target.id === 'financing-down-payment') {
                this.updateSliderFromDownPayment(e.target.value);
            }
        });

        // Botones de plazo
        document.addEventListener('click', (e) => {
            const termBtn = e.target.closest('.financing-term-btn');
            if (termBtn) {
                document.querySelectorAll('.financing-term-btn').forEach(btn =>
                    btn.classList.remove('active'));
                termBtn.classList.add('active');
                this.calculate();
            }
        });

        // Botones de tipo de plan
        document.addEventListener('click', (e) => {
            const planBtn = e.target.closest('.plan-type-btn');
            if (planBtn) {
                document.querySelectorAll('.plan-type-btn').forEach(btn =>
                    btn.classList.remove('active'));
                planBtn.classList.add('active');
                this.calculate();
            }
        });

        // WhatsApp
        document.addEventListener('click', (e) => {
            if (e.target.closest('#btn-financing-whatsapp')) {
                this.sendWhatsApp();
            }
        });

        // Reset
        document.addEventListener('click', (e) => {
            if (e.target.closest('#btn-financing-reset')) {
                this.reset();
            }
        });
    }

    // ===== UI MODES =====
    updateModeUI() {
        const quickResults = document.getElementById('quick-results');
        const advancedResults = document.getElementById('advanced-results');
        const planTypeField = document.getElementById('plan-type-field');
        const advancedElements = document.querySelectorAll('.financing-advanced-only');

        if (this.currentMode === 'quick') {
            if (quickResults) quickResults.style.display = 'block';
            if (advancedResults) advancedResults.style.display = 'none';
            if (planTypeField) planTypeField.style.display = 'none';
            advancedElements.forEach(el => el.style.display = 'none');
            this.renderTermButtons(84); // Todos los plazos
        } else {
            if (quickResults) quickResults.style.display = 'none';
            if (advancedResults) advancedResults.style.display = 'block';
            if (planTypeField) planTypeField.style.display = 'block';
            advancedElements.forEach(el => el.style.display = 'block');
            // El plazo máximo depende de la entidad con mayor plazo
            this.renderTermButtons(84);
        }
    }

    showTermsScreen() {
        const termsScreen = document.getElementById('financing-terms-screen');
        const mainScreen = document.getElementById('financing-main-screen');
        if (termsScreen) termsScreen.style.display = 'block';
        if (mainScreen) mainScreen.style.display = 'none';
    }

    showMainScreen() {
        const termsScreen = document.getElementById('financing-terms-screen');
        const mainScreen = document.getElementById('financing-main-screen');
        if (termsScreen) termsScreen.style.display = 'none';
        if (mainScreen) mainScreen.style.display = 'block';
        this.calculate();
    }

    // ===== MODAL CONTROL =====
    open(vehicleId = null, price = null) {
        const modal = document.getElementById('financing-calculator-modal');
        if (!modal) return;

        // Cargar datos del vehículo si hay
        if (vehicleId && typeof vehicleDB !== 'undefined') {
            this.loadVehicleData(vehicleId);
        } else if (price) {
            this.setPrice(parseFloat(price));
        }

        // Verificar si ya aceptó términos
        if (this.hasAcceptedTerms()) {
            this.showMainScreen();
        } else {
            this.showTermsScreen();
            // Reset checkbox
            const checkbox = document.getElementById('financing-accept-terms');
            const btn = document.getElementById('btn-accept-terms');
            if (checkbox) checkbox.checked = false;
            if (btn) btn.disabled = true;
        }

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        this.calculate();
    }

    close() {
        const modal = document.getElementById('financing-calculator-modal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    // ===== DATA =====
    async loadVehicleData(vehicleId) {
        await vehicleDB.load();
        const vehicle = vehicleDB.getVehicleById(vehicleId);

        if (vehicle) {
            const vehicleInfo = document.getElementById('financing-vehicle-info');
            const vehicleImg = document.getElementById('financing-vehicle-img');
            const vehicleName = document.getElementById('financing-vehicle-name');
            const vehiclePrice = document.getElementById('financing-vehicle-price');

            if (vehicleInfo) vehicleInfo.style.display = 'flex';
            if (vehicleImg) {
                vehicleImg.src = vehicle.imagen;
                vehicleImg.onerror = () => vehicleImg.src = 'multimedia/vehicles/placeholder-car.jpg';
            }
            if (vehicleName) {
                vehicleName.textContent = `${this.capitalize(vehicle.marca)} ${vehicle.modelo} ${vehicle.year}`;
            }
            if (vehiclePrice) {
                vehiclePrice.textContent = this.formatCurrency(vehicle.precioOferta || vehicle.precio);
            }

            this.setPrice(vehicle.precioOferta || vehicle.precio);
            this.currentVehicle = vehicle;
        }
    }

    setPrice(price) {
        const priceInput = document.getElementById('financing-price');
        const priceSlider = document.getElementById('financing-price-slider');

        if (priceInput) {
            priceInput.value = this.formatNumber(price);
        }
        if (priceSlider) {
            priceSlider.value = price;
        }

        this.updateDownPaymentFromSlider(30);
        this.calculate();
    }

    // ===== CALCULATIONS =====
    calculate() {
        const price = this.parseNumber(document.getElementById('financing-price')?.value || 0);
        const downPayment = this.parseNumber(document.getElementById('financing-down-payment')?.value || 0);
        const termBtn = document.querySelector('.financing-term-btn.active');
        const term = termBtn ? parseInt(termBtn.dataset.months) : 36;
        const planBtn = document.querySelector('.plan-type-btn.active');
        const planType = planBtn ? planBtn.dataset.plan : 'traditional';

        const financedAmount = price - downPayment;

        if (financedAmount <= 0 || term <= 0) {
            this.updateQuickResults(0, 0);
            this.updateAdvancedResults([]);
            return;
        }

        if (this.currentMode === 'quick') {
            this.calculateQuickMode(financedAmount, term);
        } else {
            this.calculateAdvancedMode(price, financedAmount, downPayment, term, planType);
        }
    }

    calculateQuickMode(amount, term) {
        // Tasa fija del 1.4% NMV
        const rate = 0.014;
        const monthly = this.calculatePMT(amount, rate, term);

        this.updateQuickResults(amount, monthly);
    }

    calculateAdvancedMode(price, amount, downPayment, term, planType) {
        const results = [];
        const downPaymentPercent = (downPayment / price) * 100;
        const warnings = [];

        for (const [key, entity] of Object.entries(this.entities)) {
            // Verificar restricciones
            const isTermValid = term <= entity.maxTerm;
            const isDownPaymentValid = downPaymentPercent >= entity.minDownPayment;

            if (!isTermValid || !isDownPaymentValid) {
                results.push({
                    entity: entity.name,
                    color: entity.color,
                    rate: entity.nmv,
                    monthly: null,
                    total: null,
                    available: false,
                    reason: !isTermValid
                        ? `Máx. ${entity.maxTerm} meses`
                        : `Mín. ${entity.minDownPayment}% inicial`
                });
                continue;
            }

            let monthly, total;
            const rate = entity.nmv / 100;
            const insuranceRate = entity.insurance / 100;
            const monthlyInsurance = amount * insuranceRate;

            switch (planType) {
                case 'extra':
                    // Plan con 2 cuotas extras al año (junio y diciembre)
                    // Ajustamos el cálculo para 14 pagos por año
                    const effectiveMonths = term * (14 / 12);
                    monthly = this.calculatePMT(amount, rate, effectiveMonths);
                    monthly += monthlyInsurance;
                    total = monthly * term + (monthly * Math.floor(term / 6)); // Cuotas extras
                    break;

                case 'leasing':
                    // Leasing con opción de compra (10% del valor al final)
                    const residualValue = amount * 0.10;
                    const leasingAmount = amount - residualValue;
                    monthly = this.calculatePMT(leasingAmount, rate, term);
                    monthly += monthlyInsurance;
                    total = (monthly * term) + residualValue;
                    break;

                default: // traditional
                    monthly = this.calculatePMT(amount, rate, term);
                    monthly += monthlyInsurance;
                    total = monthly * term;
                    break;
            }

            results.push({
                entity: entity.name,
                color: entity.color,
                rate: entity.nmv,
                monthly: monthly,
                total: total,
                available: true
            });
        }

        // Ordenar por cuota mensual (menores primero, no disponibles al final)
        results.sort((a, b) => {
            if (a.available && !b.available) return -1;
            if (!a.available && b.available) return 1;
            if (!a.available && !b.available) return 0;
            return a.monthly - b.monthly;
        });

        this.updateAdvancedResults(results, planType, term);
    }

    calculatePMT(principal, rate, term) {
        // Fórmula PMT: P * [r(1+r)^n] / [(1+r)^n - 1]
        if (rate === 0) return principal / term;
        const factor = Math.pow(1 + rate, term);
        return principal * (rate * factor) / (factor - 1);
    }

    // ===== UPDATE RESULTS =====
    updateQuickResults(amount, monthly) {
        const amountEl = document.getElementById('quick-amount');
        const monthlyEl = document.getElementById('quick-monthly');

        if (amountEl) amountEl.textContent = this.formatCurrency(amount);
        if (monthlyEl) monthlyEl.textContent = this.formatCurrency(monthly);
    }

    updateAdvancedResults(results, planType, term) {
        const tbody = document.getElementById('entities-tbody');
        const noteEl = document.getElementById('advanced-note');

        if (!tbody) return;

        tbody.innerHTML = results.map(r => {
            if (!r.available) {
                return `
                    <tr class="entity-row unavailable">
                        <td>
                            <span class="entity-dot" style="background: ${r.color}"></span>
                            ${r.entity}
                        </td>
                        <td>${r.rate}%</td>
                        <td colspan="2" class="unavailable-msg">${r.reason}</td>
                    </tr>
                `;
            }
            return `
                <tr class="entity-row">
                    <td>
                        <span class="entity-dot" style="background: ${r.color}"></span>
                        ${r.entity}
                    </td>
                    <td>${r.rate}%</td>
                    <td class="monthly-cell">${this.formatCurrency(r.monthly)}</td>
                    <td>${this.formatCurrency(r.total)}</td>
                </tr>
            `;
        }).join('');

        // Nota según el plan
        if (noteEl) {
            const planNotes = {
                traditional: 'Cuota fija mensual. Incluye seguro de vida deudor.',
                extra: 'Plan con 2 cuotas adicionales al año (junio y diciembre). Reduce el plazo efectivo.',
                leasing: 'Leasing con opción de compra del 10% al finalizar el plazo.'
            };
            noteEl.textContent = '* ' + (planNotes[planType] || planNotes.traditional);
        }
    }

    // ===== UI UPDATES =====
    updatePriceFromSlider(value) {
        const priceInput = document.getElementById('financing-price');
        if (priceInput) {
            priceInput.value = this.formatNumber(parseInt(value));
        }
        this.updateDownPaymentFromSlider(
            parseInt(document.getElementById('financing-down-payment-slider')?.value || 30)
        );
        this.calculate();
    }

    updateSliderFromPrice(value) {
        const price = this.parseNumber(value);
        const slider = document.getElementById('financing-price-slider');
        if (slider && price >= 20000000 && price <= 300000000) {
            slider.value = price;
        }
        this.updateDownPaymentFromSlider(
            parseInt(document.getElementById('financing-down-payment-slider')?.value || 30)
        );
        this.calculate();
    }

    updateDownPaymentFromSlider(percent) {
        const price = this.parseNumber(document.getElementById('financing-price')?.value || 0);
        const downPayment = Math.round(price * (percent / 100));
        const downPaymentInput = document.getElementById('financing-down-payment');
        const downPaymentSlider = document.getElementById('financing-down-payment-slider');
        const percentLabel = document.getElementById('down-payment-percent');
        const warningEl = document.getElementById('down-payment-warning');

        if (downPaymentInput) downPaymentInput.value = this.formatNumber(downPayment);
        if (downPaymentSlider) downPaymentSlider.value = percent;
        if (percentLabel) percentLabel.textContent = percent;

        // Mostrar advertencia si es menor al mínimo de algunas entidades
        if (warningEl && this.currentMode === 'advanced') {
            if (percent < 30) {
                warningEl.textContent = 'Algunas entidades requieren mínimo 30% de cuota inicial';
                warningEl.style.display = 'block';
            } else {
                warningEl.style.display = 'none';
            }
        }

        this.calculate();
    }

    updateSliderFromDownPayment(value) {
        const price = this.parseNumber(document.getElementById('financing-price')?.value || 0);
        const downPayment = this.parseNumber(value);

        if (price > 0) {
            let percent = Math.round((downPayment / price) * 100);
            percent = Math.max(10, Math.min(70, percent));

            const slider = document.getElementById('financing-down-payment-slider');
            const percentLabel = document.getElementById('down-payment-percent');

            if (slider) slider.value = percent;
            if (percentLabel) percentLabel.textContent = percent;
        }

        this.calculate();
    }

    reset() {
        document.getElementById('financing-price').value = this.formatNumber(65000000);
        document.getElementById('financing-price-slider').value = 65000000;
        document.getElementById('financing-down-payment-slider').value = 30;

        document.querySelectorAll('.financing-term-btn').forEach((btn, i) => {
            btn.classList.toggle('active', i === 2);
        });

        document.querySelectorAll('.plan-type-btn').forEach((btn, i) => {
            btn.classList.toggle('active', i === 0);
        });

        const vehicleInfo = document.getElementById('financing-vehicle-info');
        if (vehicleInfo) vehicleInfo.style.display = 'none';

        this.currentVehicle = null;
        this.updateDownPaymentFromSlider(30);
        this.calculate();
    }

    // ===== WHATSAPP =====
    sendWhatsApp() {
        const price = this.parseNumber(document.getElementById('financing-price')?.value || 0);
        const downPayment = this.parseNumber(document.getElementById('financing-down-payment')?.value || 0);
        const termBtn = document.querySelector('.financing-term-btn.active');
        const term = termBtn ? termBtn.dataset.months : 36;

        let vehicleInfo = '';
        if (this.currentVehicle) {
            vehicleInfo = `VEHICULO DE INTERES:
${this.capitalize(this.currentVehicle.marca)} ${this.currentVehicle.modelo} ${this.currentVehicle.year}

`;
        }

        let simulationInfo = '';
        if (this.currentMode === 'quick') {
            const monthlyEl = document.getElementById('quick-monthly');
            const monthly = monthlyEl ? monthlyEl.textContent : '';
            simulationInfo = `SIMULACION RAPIDA:
- Cuota mensual estimada: ${monthly}
- Tasa: 1.40% NMV (referencial)`;
        } else {
            const planBtn = document.querySelector('.plan-type-btn.active');
            const planType = planBtn ? planBtn.dataset.plan : 'traditional';
            const planNames = {
                traditional: 'Tradicional',
                extra: 'Cuotas extra',
                leasing: 'Leasing'
            };
            simulationInfo = `SIMULACION AVANZADA:
- Tipo de plan: ${planNames[planType]}
- (Ver comparativa de entidades en el simulador)`;
        }

        const message = `*SOLICITUD DE FINANCIAMIENTO*

${vehicleInfo}DATOS DE LA SIMULACION:
- Precio del vehiculo: ${this.formatCurrency(price)}
- Cuota inicial: ${this.formatCurrency(downPayment)} (${Math.round((downPayment/price)*100)}%)
- Plazo: ${term} meses

${simulationInfo}

Me gustaria recibir asesoria sobre opciones de financiamiento.`;

        const url = `https://wa.me/${this.whatsappNumber}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');

        if (typeof toast !== 'undefined') {
            toast.success('Te redirigimos a WhatsApp', 'Solicitud enviada');
        }

        this.close();
    }

    // ===== UTILITIES =====
    formatCurrency(amount) {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    formatNumber(num) {
        return new Intl.NumberFormat('es-CO').format(num);
    }

    parseNumber(str) {
        if (typeof str === 'number') return str;
        return parseInt(String(str).replace(/[^\d]/g, '')) || 0;
    }

    capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}

// Crear instancia global
const financingCalculator = new FinancingCalculator();

// Disponible globalmente
if (typeof window !== 'undefined') {
    window.financingCalculator = financingCalculator;
}
