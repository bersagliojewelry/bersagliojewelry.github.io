// ============================================
// SIMULADOR DE CRÉDITO VEHICULAR - ALTORRA CARS
// Sistema profesional de simulación financiera
// Versión 2.0
// ============================================

class CreditSimulator {
    constructor() {
        // Configuración de WhatsApp
        this.whatsappNumber = '573235016747';

        // Configuración de entidades financieras
        // Las tasas se ajustan según el perfil del cliente (antigüedad e ingresos)
        this.entities = {
            SUFI: {
                name: 'SUFI',
                color: '#0066cc',
                baseRate: 1.38,          // Tasa base NMV
                insurance: 0.025,         // Seguro de vida mensual sobre saldo
                maxTerm: 84,
                minDownPayment: 20,
                minAmount: 15000000,
                supportsExtra: true,
                supportsLeasing: true,
                extraPerYear: 2
            },
            OCCIAUTO: {
                name: 'Occiauto',
                color: '#e31937',
                baseRate: 1.44,
                insurance: 0.028,
                maxTerm: 72,
                minDownPayment: 25,
                minAmount: 20000000,
                supportsExtra: true,
                supportsLeasing: true,
                extraPerYear: 2
            },
            FINANDINA: {
                name: 'Banco Finandina',
                color: '#00a651',
                baseRate: 1.39,
                insurance: 0.022,
                maxTerm: 72,
                minDownPayment: 20,
                minAmount: 15000000,
                supportsExtra: true,
                supportsLeasing: true,
                extraPerYear: 2
            },
            FINANZAUTO: {
                name: 'Finanzauto',
                color: '#ff6600',
                baseRate: 1.79,
                insurance: 0.030,
                maxTerm: 72,
                minDownPayment: 30,
                minAmount: 25000000,
                supportsExtra: true,
                supportsLeasing: false,
                extraPerYear: 1
            },
            MOBILIZE: {
                name: 'Mobilize Financial',
                color: '#1a1a6e',
                baseRate: 1.82,
                insurance: 0.026,
                maxTerm: 48,
                minDownPayment: 30,
                minAmount: 30000000,
                supportsExtra: false,
                supportsLeasing: false,
                extraPerYear: 0
            }
        };

        // Ajustes de tasa según perfil
        this.rateAdjustments = {
            // Por antigüedad laboral
            tenure: {
                'menos-6': 0.25,
                '6-12': 0.15,
                '1-2': 0.08,
                '2-5': 0,
                'mas-5': -0.05
            },
            // Por nivel de ingresos
            income: {
                '1-2': 0.20,
                '2-4': 0.10,
                '4-7': 0.05,
                '7-10': 0,
                '10-15': -0.05,
                'mas-15': -0.10
            }
        };

        // Plazos disponibles
        this.availableTerms = [12, 24, 36, 48, 60, 72, 84];

        // Estado actual
        this.currentStep = 'terms';
        this.simulationType = null;
        this.userData = {};

        // Inicializar
        this.init();
    }

    init() {
        this.bindEvents();
        this.generateYearOptions();
        this.generateTermButtons();
        this.setDefaultValues();
    }

    // ===== EVENT BINDING =====
    bindEvents() {
        // Checkbox de términos
        const acceptTerms = document.getElementById('accept-terms');
        const btnContinueTerms = document.getElementById('btn-continue-terms');

        if (acceptTerms && btnContinueTerms) {
            acceptTerms.addEventListener('change', (e) => {
                btnContinueTerms.disabled = !e.target.checked;
            });

            btnContinueTerms.addEventListener('click', () => {
                this.goToStep('personal');
            });
        }

        // Formulario personal
        const personalForm = document.getElementById('personal-form');
        if (personalForm) {
            personalForm.addEventListener('submit', (e) => {
                e.preventDefault();
                if (this.validatePersonalForm()) {
                    this.savePersonalData();
                    this.goToStep('type');
                }
            });
        }

        // Botón volver a términos
        document.getElementById('btn-back-terms')?.addEventListener('click', () => {
            this.goToStep('terms');
        });

        // Botón volver a datos personales
        document.getElementById('btn-back-personal')?.addEventListener('click', () => {
            this.goToStep('personal');
        });

        // Botón volver a tipo de simulación
        document.getElementById('btn-back-type')?.addEventListener('click', () => {
            this.goToStep('type');
        });

        // Selección de ocupación (mostrar campo "otro")
        const ocupacionSelect = document.getElementById('ocupacion');
        if (ocupacionSelect) {
            ocupacionSelect.addEventListener('change', (e) => {
                const otraOcupacionGroup = document.getElementById('otra-ocupacion-group');
                const otraOcupacionInput = document.getElementById('otra-ocupacion');

                if (e.target.value === 'otro') {
                    otraOcupacionGroup.style.display = 'block';
                    otraOcupacionInput.required = true;
                } else {
                    otraOcupacionGroup.style.display = 'none';
                    otraOcupacionInput.required = false;
                }
            });
        }

        // Selección de tipo de simulación
        document.querySelectorAll('.simulation-type-card').forEach(card => {
            card.addEventListener('click', () => {
                this.simulationType = card.dataset.type;
                this.goToStep('simulator');
                this.setupSimulator();
            });
        });

        // Sliders y inputs del simulador
        this.bindSimulatorEvents();

        // Enlaces de políticas
        document.querySelectorAll('.link-policy').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.showPolicy(link.dataset.policy);
            });
        });

        // Cerrar modal de política
        document.getElementById('policy-modal-close')?.addEventListener('click', () => {
            document.getElementById('policy-modal').classList.remove('active');
        });

        document.getElementById('policy-modal')?.addEventListener('click', (e) => {
            if (e.target.id === 'policy-modal') {
                document.getElementById('policy-modal').classList.remove('active');
            }
        });

        // WhatsApp
        document.getElementById('btn-whatsapp')?.addEventListener('click', () => {
            this.sendWhatsApp();
        });

        // Nueva simulación
        document.getElementById('btn-new-simulation')?.addEventListener('click', () => {
            this.goToStep('type');
        });
    }

    bindSimulatorEvents() {
        // Precio del vehículo
        const vehiclePrice = document.getElementById('vehicle-price');
        const priceSlider = document.getElementById('price-slider');

        if (vehiclePrice) {
            vehiclePrice.addEventListener('input', (e) => {
                const value = this.parseNumber(e.target.value);
                if (priceSlider && value >= 20000000 && value <= 300000000) {
                    priceSlider.value = value;
                }
                this.updateDownPaymentFromPercent();
                this.calculate();
            });

            vehiclePrice.addEventListener('blur', (e) => {
                e.target.value = this.formatNumber(this.parseNumber(e.target.value));
            });
        }

        if (priceSlider) {
            priceSlider.addEventListener('input', (e) => {
                if (vehiclePrice) {
                    vehiclePrice.value = this.formatNumber(parseInt(e.target.value));
                }
                this.updateDownPaymentFromPercent();
                this.calculate();
            });
        }

        // Cuota inicial
        const downPayment = document.getElementById('down-payment');
        const downPaymentSlider = document.getElementById('down-payment-slider');

        if (downPayment) {
            downPayment.addEventListener('input', (e) => {
                const value = this.parseNumber(e.target.value);
                const price = this.parseNumber(document.getElementById('vehicle-price')?.value || 0);

                if (price > 0 && downPaymentSlider) {
                    const percent = Math.round((value / price) * 100);
                    if (percent >= 10 && percent <= 70) {
                        downPaymentSlider.value = percent;
                        document.getElementById('down-payment-percent').textContent = percent;
                    }
                }
                this.calculate();
            });

            downPayment.addEventListener('blur', (e) => {
                e.target.value = this.formatNumber(this.parseNumber(e.target.value));
            });
        }

        if (downPaymentSlider) {
            downPaymentSlider.addEventListener('input', (e) => {
                const percent = parseInt(e.target.value);
                document.getElementById('down-payment-percent').textContent = percent;
                this.updateDownPaymentFromPercent();
                this.calculate();
            });
        }

        // Cuota extra
        const extraPayment = document.getElementById('extra-payment');
        if (extraPayment) {
            extraPayment.addEventListener('input', () => this.calculate());
            extraPayment.addEventListener('blur', (e) => {
                e.target.value = this.formatNumber(this.parseNumber(e.target.value));
            });
        }

        // Botones de plazo
        document.addEventListener('click', (e) => {
            const termBtn = e.target.closest('.term-btn');
            if (termBtn) {
                document.querySelectorAll('.term-btn').forEach(btn => btn.classList.remove('active'));
                termBtn.classList.add('active');
                this.calculate();
            }
        });

        // Botones de tipo de plan
        document.addEventListener('click', (e) => {
            const planBtn = e.target.closest('.plan-btn');
            if (planBtn) {
                document.querySelectorAll('.plan-btn').forEach(btn => btn.classList.remove('active'));
                planBtn.classList.add('active');

                // Mostrar/ocultar opciones según el plan
                const plan = planBtn.dataset.plan;
                const leasingGroup = document.getElementById('leasing-option-group');
                const extraGroup = document.getElementById('extra-payment-group');

                if (leasingGroup) {
                    leasingGroup.classList.toggle('hidden', plan !== 'leasing');
                }
                if (extraGroup) {
                    extraGroup.classList.toggle('hidden', plan !== 'extra');
                }

                this.calculate();
            }
        });

        // Opción de leasing
        document.getElementById('leasing-option')?.addEventListener('change', () => {
            this.calculate();
        });

        // Año del vehículo
        document.getElementById('vehicle-year')?.addEventListener('change', () => {
            this.calculate();
        });
    }

    // ===== NAVIGATION =====
    goToStep(step) {
        // Ocultar todos los pasos
        document.querySelectorAll('.simulator-step').forEach(el => {
            el.classList.add('hidden');
        });

        // Mostrar el paso actual
        const stepElement = document.getElementById(`step-${step}`);
        if (stepElement) {
            stepElement.classList.remove('hidden');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        this.currentStep = step;
    }

    // ===== SETUP =====
    generateYearOptions() {
        const select = document.getElementById('vehicle-year');
        if (!select) return;

        const currentYear = new Date().getFullYear();
        const startYear = currentYear - 15;

        select.innerHTML = '<option value="">Seleccionar...</option>';

        for (let year = currentYear + 1; year >= startYear; year--) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            if (year === currentYear) option.selected = true;
            select.appendChild(option);
        }
    }

    generateTermButtons() {
        const container = document.getElementById('term-buttons');
        if (!container) return;

        container.innerHTML = this.availableTerms.map((term, i) => `
            <button type="button" class="term-btn ${i === 2 ? 'active' : ''}" data-months="${term}">
                ${term} <small>meses</small>
            </button>
        `).join('');
    }

    setDefaultValues() {
        const vehiclePrice = document.getElementById('vehicle-price');
        const priceSlider = document.getElementById('price-slider');

        if (vehiclePrice) vehiclePrice.value = this.formatNumber(65000000);
        if (priceSlider) priceSlider.value = 65000000;

        this.updateDownPaymentFromPercent();
    }

    setupSimulator() {
        const isAdvanced = this.simulationType === 'advanced';

        // Actualizar título
        const title = document.getElementById('simulator-title');
        const subtitle = document.getElementById('simulator-subtitle');

        if (title) {
            title.textContent = isAdvanced ? 'Simulación Avanzada' : 'Simulación Básica';
        }
        if (subtitle) {
            subtitle.textContent = isAdvanced
                ? 'Compara opciones con nuestras entidades aliadas'
                : 'Calcula tu cuota mensual estimada';
        }

        // Mostrar/ocultar elementos avanzados
        document.querySelectorAll('.advanced-only').forEach(el => {
            el.classList.toggle('visible', isAdvanced);
        });

        // Mostrar resultados correspondientes
        document.getElementById('results-basic')?.classList.toggle('hidden', isAdvanced);
        document.getElementById('results-advanced')?.classList.toggle('hidden', !isAdvanced);

        this.calculate();
    }

    updateDownPaymentFromPercent() {
        const price = this.parseNumber(document.getElementById('vehicle-price')?.value || 0);
        const percent = parseInt(document.getElementById('down-payment-slider')?.value || 30);
        const downPayment = Math.round(price * (percent / 100));

        const downPaymentInput = document.getElementById('down-payment');
        if (downPaymentInput) {
            downPaymentInput.value = this.formatNumber(downPayment);
        }
    }

    // ===== VALIDATION =====
    validatePersonalForm() {
        const form = document.getElementById('personal-form');
        if (!form) return false;

        // Validación HTML5 básica
        if (!form.checkValidity()) {
            form.reportValidity();
            return false;
        }

        // Validaciones adicionales
        const celular = document.getElementById('celular').value;
        if (!/^\d{10}$/.test(celular)) {
            alert('Por favor ingresa un número de celular válido (10 dígitos)');
            return false;
        }

        return true;
    }

    savePersonalData() {
        this.userData = {
            nombres: document.getElementById('nombres').value,
            apellidos: document.getElementById('apellidos').value,
            tipoDocumento: document.getElementById('tipo-documento').value,
            documento: document.getElementById('documento').value,
            fechaNacimiento: document.getElementById('fecha-nacimiento').value,
            ciudad: document.getElementById('ciudad').value,
            celular: document.getElementById('celular').value,
            email: document.getElementById('email').value,
            pep: document.querySelector('input[name="pep"]:checked')?.value,
            ocupacion: document.getElementById('ocupacion').value,
            otraOcupacion: document.getElementById('otra-ocupacion')?.value,
            antiguedad: document.getElementById('antiguedad').value,
            ingresos: document.getElementById('ingresos').value
        };
    }

    // ===== CALCULATIONS =====
    calculate() {
        const price = this.parseNumber(document.getElementById('vehicle-price')?.value || 0);
        const downPayment = this.parseNumber(document.getElementById('down-payment')?.value || 0);
        const termBtn = document.querySelector('.term-btn.active');
        const term = termBtn ? parseInt(termBtn.dataset.months) : 36;

        const financedAmount = price - downPayment;
        const financedPercent = price > 0 ? Math.round((financedAmount / price) * 100) : 0;

        // Actualizar resumen
        document.getElementById('summary-financed').textContent = this.formatCurrency(financedAmount);
        document.getElementById('summary-percent').textContent = financedPercent + '%';

        if (financedAmount <= 0 || term <= 0) {
            return;
        }

        if (this.simulationType === 'basic') {
            this.calculateBasic(financedAmount, term);
        } else {
            this.calculateAdvanced(price, financedAmount, downPayment, term);
        }
    }

    calculateBasic(amount, term) {
        // Tasa fija referencial del mercado
        const rate = 0.0145; // 1.45% NMV
        const monthly = this.calculatePMT(amount, rate, term);
        const total = monthly * term;
        const interest = total - amount;

        // Actualizar UI
        document.getElementById('basic-monthly').textContent = this.formatCurrency(monthly);
        document.getElementById('basic-amount').textContent = this.formatCurrency(amount);
        document.getElementById('basic-total').textContent = this.formatCurrency(total);
        document.getElementById('basic-interest').textContent = this.formatCurrency(interest);
    }

    calculateAdvanced(price, amount, downPayment, term) {
        const planBtn = document.querySelector('.plan-btn.active');
        const planType = planBtn ? planBtn.dataset.plan : 'traditional';
        const downPaymentPercent = (downPayment / price) * 100;
        const vehicleYear = parseInt(document.getElementById('vehicle-year')?.value || new Date().getFullYear());
        const currentYear = new Date().getFullYear();
        const vehicleAge = currentYear - vehicleYear;

        // Obtener ajuste de tasa según perfil del usuario
        const rateAdjustment = this.getRateAdjustment();

        const results = [];

        for (const [key, entity] of Object.entries(this.entities)) {
            // Verificar restricciones
            const issues = [];

            if (term > entity.maxTerm) {
                issues.push(`Máx. ${entity.maxTerm} meses`);
            }
            if (downPaymentPercent < entity.minDownPayment) {
                issues.push(`Mín. ${entity.minDownPayment}% inicial`);
            }
            if (amount < entity.minAmount) {
                issues.push(`Mín. ${this.formatCurrency(entity.minAmount)}`);
            }
            if (planType === 'leasing' && !entity.supportsLeasing) {
                issues.push('No ofrece leasing');
            }
            if (planType === 'extra' && !entity.supportsExtra) {
                issues.push('No ofrece cuotas extra');
            }

            if (issues.length > 0) {
                results.push({
                    entity: entity.name,
                    color: entity.color,
                    rate: entity.baseRate + rateAdjustment,
                    monthly: null,
                    available: false,
                    reason: issues.join(' / ')
                });
                continue;
            }

            // Calcular tasa ajustada
            let adjustedRate = entity.baseRate + rateAdjustment;

            // Ajuste por antigüedad del vehículo
            if (vehicleAge > 5) adjustedRate += 0.10;
            else if (vehicleAge > 3) adjustedRate += 0.05;

            // Ajuste por porcentaje de financiamiento
            if (downPaymentPercent < 25) adjustedRate += 0.08;
            else if (downPaymentPercent < 30) adjustedRate += 0.04;

            const rate = adjustedRate / 100;
            const insuranceRate = entity.insurance / 100;

            let monthly, extraInfo = '';

            switch (planType) {
                case 'extra':
                    // Plan con cuotas extras al año
                    const extraPayment = this.parseNumber(document.getElementById('extra-payment')?.value || 1000000);
                    const numExtras = entity.extraPerYear;

                    // Las cuotas extras reducen el capital más rápido
                    // Calculamos como si el plazo efectivo fuera mayor
                    const effectivePayments = term + Math.floor(term / 12) * numExtras;
                    const baseMonthly = this.calculatePMT(amount, rate, effectivePayments);
                    monthly = baseMonthly + (amount * insuranceRate);
                    extraInfo = `+ ${numExtras} cuota(s) extra de ${this.formatCurrency(extraPayment)}/año`;
                    break;

                case 'leasing':
                    // Leasing con opción de compra
                    const leasingOption = parseInt(document.getElementById('leasing-option')?.value || 10) / 100;
                    const residualValue = price * leasingOption;
                    const leasingAmount = amount - residualValue;

                    monthly = this.calculatePMT(leasingAmount, rate, term);
                    monthly += (amount * insuranceRate);
                    extraInfo = `Opción de compra: ${this.formatCurrency(residualValue)}`;
                    break;

                default: // traditional
                    monthly = this.calculatePMT(amount, rate, term);
                    monthly += (amount * insuranceRate);
                    break;
            }

            results.push({
                entity: entity.name,
                color: entity.color,
                rate: adjustedRate,
                monthly: monthly,
                available: true,
                extraInfo: extraInfo
            });
        }

        // Ordenar por cuota mensual
        results.sort((a, b) => {
            if (a.available && !b.available) return -1;
            if (!a.available && b.available) return 1;
            if (!a.available && !b.available) return 0;
            return a.monthly - b.monthly;
        });

        // Marcar la mejor opción
        if (results.length > 0 && results[0].available) {
            results[0].isBest = true;
        }

        this.renderAdvancedResults(results, planType);
    }

    getRateAdjustment() {
        let adjustment = 0;

        const tenure = this.userData.antiguedad;
        const income = this.userData.ingresos;

        if (tenure && this.rateAdjustments.tenure[tenure]) {
            adjustment += this.rateAdjustments.tenure[tenure];
        }

        if (income && this.rateAdjustments.income[income]) {
            adjustment += this.rateAdjustments.income[income];
        }

        return adjustment;
    }

    calculatePMT(principal, rate, term) {
        // Fórmula PMT: P * [r(1+r)^n] / [(1+r)^n - 1]
        if (rate === 0) return principal / term;
        const factor = Math.pow(1 + rate, term);
        return principal * (rate * factor) / (factor - 1);
    }

    renderAdvancedResults(results, planType) {
        const grid = document.getElementById('entities-grid');
        if (!grid) return;

        grid.innerHTML = results.map(r => {
            if (!r.available) {
                return `
                    <div class="entity-card unavailable">
                        <div class="entity-name">
                            <span class="entity-dot" style="background: ${r.color}"></span>
                            <span>${r.entity}</span>
                        </div>
                        <div class="entity-unavailable">${r.reason}</div>
                    </div>
                `;
            }

            return `
                <div class="entity-card ${r.isBest ? 'best' : ''}">
                    <div class="entity-name">
                        <span class="entity-dot" style="background: ${r.color}"></span>
                        <span>${r.entity}</span>
                    </div>
                    <div class="entity-rate">
                        Tasa: ${r.rate.toFixed(2)}% NMV
                        ${r.extraInfo ? `<br><small>${r.extraInfo}</small>` : ''}
                    </div>
                    <div class="entity-monthly">
                        <span class="monthly-value">${this.formatCurrency(r.monthly)}</span>
                        <span class="monthly-label">/ mes</span>
                        ${r.isBest ? '<span class="best-badge">✓ Mejor opción</span>' : ''}
                    </div>
                </div>
            `;
        }).join('');

        // Actualizar nota del plan
        const planNote = document.getElementById('plan-note');
        if (planNote) {
            const notes = {
                traditional: 'Plan tradicional con cuota fija mensual. Incluye seguro de vida deudor sobre el saldo.',
                extra: 'Plan con cuotas adicionales que se abonan al capital, reduciendo el plazo efectivo del crédito.',
                leasing: 'Modalidad de arrendamiento financiero. Al finalizar el plazo, puede ejercer la opción de compra sobre el vehículo.'
            };
            planNote.querySelector('span').textContent = notes[planType] || notes.traditional;
        }
    }

    // ===== WHATSAPP =====
    sendWhatsApp() {
        const price = this.parseNumber(document.getElementById('vehicle-price')?.value || 0);
        const downPayment = this.parseNumber(document.getElementById('down-payment')?.value || 0);
        const termBtn = document.querySelector('.term-btn.active');
        const term = termBtn ? termBtn.dataset.months : 36;
        const vehicleName = document.getElementById('vehicle-name')?.value || 'No especificado';
        const vehicleYear = document.getElementById('vehicle-year')?.value || '';

        // Construir mensaje
        let message = `*SOLICITUD DE FINANCIAMIENTO VEHICULAR*\n\n`;

        // Datos personales
        message += `*DATOS DEL SOLICITANTE*\n`;
        message += `- Nombre: ${this.userData.nombres} ${this.userData.apellidos}\n`;
        message += `- ${this.userData.tipoDocumento}: ${this.userData.documento}\n`;
        message += `- Ciudad: ${this.userData.ciudad}\n`;
        message += `- Celular: ${this.userData.celular}\n`;
        message += `- Email: ${this.userData.email}\n`;
        message += `- Ocupacion: ${this.userData.ocupacion === 'otro' ? this.userData.otraOcupacion : this.userData.ocupacion}\n`;
        message += `- Antiguedad: ${this.getReadableOption('antiguedad', this.userData.antiguedad)}\n`;
        message += `- Ingresos: ${this.getReadableOption('ingresos', this.userData.ingresos)}\n\n`;

        // Datos del vehiculo
        message += `*DATOS DEL VEHICULO*\n`;
        if (vehicleName && vehicleName !== 'No especificado') {
            message += `- Vehiculo: ${vehicleName} ${vehicleYear}\n`;
        }
        message += `- Precio: ${this.formatCurrency(price)}\n`;
        message += `- Cuota inicial: ${this.formatCurrency(downPayment)} (${Math.round((downPayment/price)*100)}%)\n`;
        message += `- Valor a financiar: ${this.formatCurrency(price - downPayment)}\n`;
        message += `- Plazo: ${term} meses\n\n`;

        // Tipo de simulacion
        message += `*TIPO DE SIMULACION*\n`;
        message += `- ${this.simulationType === 'advanced' ? 'Simulacion Avanzada' : 'Simulacion Basica'}\n`;

        if (this.simulationType === 'basic') {
            const monthly = document.getElementById('basic-monthly')?.textContent || '';
            message += `- Cuota estimada: ${monthly}\n`;
        } else {
            const planBtn = document.querySelector('.plan-btn.active');
            const planType = planBtn ? planBtn.dataset.plan : 'traditional';
            const planNames = {
                traditional: 'Plan Tradicional',
                extra: 'Plan con Cuotas Extra',
                leasing: 'Leasing'
            };
            message += `- Plan seleccionado: ${planNames[planType]}\n`;
        }

        message += `\n`;
        message += `Solicito asesoria para obtener mi credito vehicular.`;

        // Abrir WhatsApp
        const url = `https://wa.me/${this.whatsappNumber}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    }

    getReadableOption(field, value) {
        const options = {
            antiguedad: {
                'menos-6': 'Menos de 6 meses',
                '6-12': '6 meses a 1 año',
                '1-2': '1 a 2 años',
                '2-5': '2 a 5 años',
                'mas-5': 'Más de 5 años'
            },
            ingresos: {
                '1-2': '$1M - $2M',
                '2-4': '$2M - $4M',
                '4-7': '$4M - $7M',
                '7-10': '$7M - $10M',
                '10-15': '$10M - $15M',
                'mas-15': 'Más de $15M'
            }
        };

        return options[field]?.[value] || value;
    }

    // ===== POLICIES =====
    showPolicy(type) {
        const modal = document.getElementById('policy-modal');
        const title = document.getElementById('policy-modal-title');
        const body = document.getElementById('policy-modal-body');

        if (!modal || !title || !body) return;

        const policies = {
            privacy: {
                title: 'Política de Tratamiento de Datos Personales',
                content: `
                    <h3>1. Responsable del Tratamiento</h3>
                    <p><strong>ALTORRA COMPANY S.A.S.</strong> con domicilio en Cartagena de Indias, Colombia, es responsable del tratamiento de sus datos personales.</p>

                    <h3>2. Finalidades del Tratamiento</h3>
                    <p>Sus datos personales serán tratados para:</p>
                    <ul>
                        <li>Realizar simulaciones de crédito vehicular</li>
                        <li>Gestionar solicitudes de financiamiento ante entidades aliadas</li>
                        <li>Contactarlo para ofrecer productos y servicios relacionados</li>
                        <li>Cumplir con obligaciones legales y contractuales</li>
                        <li>Enviar información comercial y promocional</li>
                    </ul>

                    <h3>3. Derechos del Titular</h3>
                    <p>Usted tiene derecho a conocer, actualizar, rectificar y suprimir sus datos personales, así como a revocar la autorización otorgada.</p>

                    <h3>4. Datos de Contacto</h3>
                    <p>Para ejercer sus derechos o consultas relacionadas con el tratamiento de datos, puede contactarnos en:</p>
                    <ul>
                        <li>Email: info@altorracars.com</li>
                        <li>WhatsApp: +57 323 501 6747</li>
                    </ul>
                `
            },
            cookies: {
                title: 'Política de Cookies',
                content: `
                    <h3>¿Qué son las cookies?</h3>
                    <p>Las cookies son pequeños archivos de texto que se almacenan en su dispositivo cuando visita nuestro sitio web.</p>

                    <h3>Tipos de cookies que utilizamos</h3>
                    <ul>
                        <li><strong>Cookies técnicas:</strong> Necesarias para el funcionamiento del sitio</li>
                        <li><strong>Cookies de preferencias:</strong> Permiten recordar sus preferencias de navegación</li>
                        <li><strong>Cookies analíticas:</strong> Nos ayudan a entender cómo interactúa con el sitio</li>
                    </ul>

                    <h3>Gestión de cookies</h3>
                    <p>Puede configurar su navegador para bloquear o eliminar cookies. Sin embargo, algunas funcionalidades del sitio podrían verse afectadas.</p>
                `
            }
        };

        const policy = policies[type];
        if (policy) {
            title.textContent = policy.title;
            body.innerHTML = policy.content;
            modal.classList.add('active');
        }
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
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.creditSimulator = new CreditSimulator();
});
