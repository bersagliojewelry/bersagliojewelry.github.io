// ============================================
// SIMULADOR DE CRÉDITO - INTERFAZ DE USUARIO
// ALTORRA CARS - Versión 2.0
// ============================================

(function() {
    'use strict';

    // Dependencias globales (cargadas en HTML antes de este script)
    const { simularFinanciacion } = window.SimuladorEngine;
    const { formatCOP, formatPercent, parseCurrency } = window.SimuladorFinance;

    // Configuración
    const WHATSAPP_NUMBER = '573235016747';
    const PLAZOS_DISPONIBLES = [12, 24, 36, 48, 60, 72, 84];
    const RIESGOS_DISPONIBLES = ['G1', 'G2', 'G3', 'G4', 'G5', 'G6'];

    // Estado de la aplicación
    let currentStep = 'terms';
    let simulationType = null;
    let userData = {};
    let lastSimulationResult = null;

    // ===== INICIALIZACIÓN =====
    function init() {
        generateYearOptions();
        generateTermButtons();
        generateRiskButtons();
        generateOffsetOptions();
        setDefaultValues();
        bindEvents();
    }

    // ===== GENERADORES DE UI =====
    function generateYearOptions() {
        const select = document.getElementById('vehicle-year');
        if (!select) return;

        const currentYear = new Date().getFullYear();
        select.innerHTML = '<option value="">Seleccionar...</option>';

        for (let year = currentYear + 1; year >= 2013; year--) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            if (year === currentYear) option.selected = true;
            select.appendChild(option);
        }
    }

    function generateTermButtons() {
        const container = document.getElementById('term-buttons');
        if (!container) return;

        container.innerHTML = PLAZOS_DISPONIBLES.map((term, i) => `
            <button type="button" class="term-btn ${i === 2 ? 'active' : ''}" data-months="${term}">
                ${term} <small>meses</small>
            </button>
        `).join('');
    }

    function generateRiskButtons() {
        const container = document.getElementById('risk-buttons');
        if (!container) return;

        container.innerHTML = RIESGOS_DISPONIBLES.map((risk, i) => `
            <button type="button" class="risk-btn ${i === 0 ? 'active' : ''}" data-risk="${risk}">
                ${risk}
            </button>
        `).join('');
    }

    function generateOffsetOptions() {
        const select = document.getElementById('offset-meses');
        if (!select) return;

        const today = new Date();
        const baseDay = 15;

        select.innerHTML = '';

        for (let i = 0; i <= 6; i++) {
            const date = new Date(today.getFullYear(), today.getMonth() + i, baseDay);
            const monthName = date.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });

            const option = document.createElement('option');
            option.value = i;
            option.textContent = `15 de ${monthName}`;
            if (i === 5) option.selected = true; // Default offset 5
            select.appendChild(option);
        }
    }

    function setDefaultValues() {
        const vehiclePrice = document.getElementById('vehicle-price');
        const priceSlider = document.getElementById('price-slider');

        if (vehiclePrice) vehiclePrice.value = formatNumber(65000000);
        if (priceSlider) priceSlider.value = 65000000;

        updateDownPaymentFromPercent();

        // Valor cuota extra por defecto
        const extraPayment = document.getElementById('extra-payment');
        if (extraPayment) extraPayment.value = formatNumber(500000);
    }

    // ===== EVENTOS =====
    function bindEvents() {
        // Checkbox de términos
        const acceptTerms = document.getElementById('accept-terms');
        const btnContinueTerms = document.getElementById('btn-continue-terms');

        if (acceptTerms && btnContinueTerms) {
            acceptTerms.addEventListener('change', (e) => {
                btnContinueTerms.disabled = !e.target.checked;
            });
            btnContinueTerms.addEventListener('click', () => goToStep('personal'));
        }

        // Formulario personal
        const personalForm = document.getElementById('personal-form');
        if (personalForm) {
            personalForm.addEventListener('submit', (e) => {
                e.preventDefault();
                if (validatePersonalForm()) {
                    savePersonalData();
                    goToStep('type');
                }
            });
        }

        // Botones de navegación
        document.getElementById('btn-back-terms')?.addEventListener('click', () => goToStep('terms'));
        document.getElementById('btn-back-personal')?.addEventListener('click', () => goToStep('personal'));
        document.getElementById('btn-back-type')?.addEventListener('click', () => goToStep('type'));

        // Ocupación "otro"
        const ocupacionSelect = document.getElementById('ocupacion');
        if (ocupacionSelect) {
            ocupacionSelect.addEventListener('change', (e) => {
                const otraGroup = document.getElementById('otra-ocupacion-group');
                const otraInput = document.getElementById('otra-ocupacion');
                if (e.target.value === 'otro') {
                    otraGroup.style.display = 'block';
                    otraInput.required = true;
                } else {
                    otraGroup.style.display = 'none';
                    otraInput.required = false;
                }
            });
        }

        // Selección tipo de simulación
        document.querySelectorAll('.simulation-type-card').forEach(card => {
            card.addEventListener('click', () => {
                simulationType = card.dataset.type;
                goToStep('simulator');
                setupSimulator();
            });
        });

        // Sliders e inputs del simulador
        bindSimulatorEvents();

        // WhatsApp y nueva simulación
        document.getElementById('btn-whatsapp')?.addEventListener('click', sendWhatsApp);
        document.getElementById('btn-new-simulation')?.addEventListener('click', () => goToStep('type'));

        // Políticas
        document.querySelectorAll('.link-policy').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                showPolicy(link.dataset.policy);
            });
        });

        document.getElementById('policy-modal-close')?.addEventListener('click', () => {
            document.getElementById('policy-modal').classList.remove('active');
        });
    }

    function bindSimulatorEvents() {
        // Precio del vehículo
        const vehiclePrice = document.getElementById('vehicle-price');
        const priceSlider = document.getElementById('price-slider');

        if (vehiclePrice) {
            vehiclePrice.addEventListener('input', (e) => {
                const value = parseCurrency(e.target.value);
                if (priceSlider && value >= 20000000 && value <= 300000000) {
                    priceSlider.value = value;
                }
                updateDownPaymentFromPercent();
                calculate();
            });
            vehiclePrice.addEventListener('blur', (e) => {
                e.target.value = formatNumber(parseCurrency(e.target.value));
            });
        }

        if (priceSlider) {
            priceSlider.addEventListener('input', (e) => {
                if (vehiclePrice) {
                    vehiclePrice.value = formatNumber(parseInt(e.target.value));
                }
                updateDownPaymentFromPercent();
                calculate();
            });
        }

        // Cuota inicial
        const downPayment = document.getElementById('down-payment');
        const downPaymentSlider = document.getElementById('down-payment-slider');

        if (downPayment) {
            downPayment.addEventListener('input', (e) => {
                const value = parseCurrency(e.target.value);
                const price = parseCurrency(document.getElementById('vehicle-price')?.value || 0);
                if (price > 0 && downPaymentSlider) {
                    const percent = Math.round((value / price) * 100);
                    if (percent >= 0 && percent <= 70) {
                        downPaymentSlider.value = percent;
                        document.getElementById('down-payment-percent').textContent = percent;
                    }
                }
                calculate();
            });
            downPayment.addEventListener('blur', (e) => {
                e.target.value = formatNumber(parseCurrency(e.target.value));
            });
        }

        if (downPaymentSlider) {
            downPaymentSlider.addEventListener('input', (e) => {
                document.getElementById('down-payment-percent').textContent = e.target.value;
                updateDownPaymentFromPercent();
                calculate();
            });
        }

        // Cuota extra
        const extraPayment = document.getElementById('extra-payment');
        if (extraPayment) {
            extraPayment.addEventListener('input', calculate);
            extraPayment.addEventListener('blur', (e) => {
                e.target.value = formatNumber(parseCurrency(e.target.value));
            });
        }

        // Offset meses
        document.getElementById('offset-meses')?.addEventListener('change', calculate);

        // Opción leasing
        document.getElementById('leasing-option')?.addEventListener('change', calculate);

        // Año modelo
        document.getElementById('vehicle-year')?.addEventListener('change', calculate);

        // Botones de plazo
        document.addEventListener('click', (e) => {
            const termBtn = e.target.closest('.term-btn');
            if (termBtn) {
                document.querySelectorAll('.term-btn').forEach(btn => btn.classList.remove('active'));
                termBtn.classList.add('active');
                calculate();
            }
        });

        // Botones de riesgo
        document.addEventListener('click', (e) => {
            const riskBtn = e.target.closest('.risk-btn');
            if (riskBtn) {
                document.querySelectorAll('.risk-btn').forEach(btn => btn.classList.remove('active'));
                riskBtn.classList.add('active');
                calculate();
            }
        });

        // Botones de plan
        document.addEventListener('click', (e) => {
            const planBtn = e.target.closest('.plan-btn');
            if (planBtn) {
                document.querySelectorAll('.plan-btn').forEach(btn => btn.classList.remove('active'));
                planBtn.classList.add('active');

                const plan = planBtn.dataset.plan;
                document.getElementById('leasing-option-group')?.classList.toggle('hidden', plan !== 'leasing');
                document.getElementById('extra-payment-group')?.classList.toggle('hidden', plan !== 'extra');
                document.getElementById('offset-group')?.classList.toggle('hidden', plan !== 'extra');

                calculate();
            }
        });
    }

    // ===== NAVEGACIÓN =====
    function goToStep(step) {
        document.querySelectorAll('.simulator-step').forEach(el => el.classList.add('hidden'));
        const stepElement = document.getElementById(`step-${step}`);
        if (stepElement) {
            stepElement.classList.remove('hidden');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        currentStep = step;
    }

    // ===== VALIDACIÓN =====
    function validatePersonalForm() {
        const form = document.getElementById('personal-form');
        if (!form) return false;
        if (!form.checkValidity()) {
            form.reportValidity();
            return false;
        }
        const celular = document.getElementById('celular').value;
        if (!/^\d{10}$/.test(celular)) {
            alert('Por favor ingresa un número de celular válido (10 dígitos)');
            return false;
        }
        return true;
    }

    function savePersonalData() {
        userData = {
            nombres: document.getElementById('nombres')?.value,
            apellidos: document.getElementById('apellidos')?.value,
            tipoDocumento: document.getElementById('tipo-documento')?.value,
            documento: document.getElementById('documento')?.value,
            fechaNacimiento: document.getElementById('fecha-nacimiento')?.value,
            ciudad: document.getElementById('ciudad')?.value,
            celular: document.getElementById('celular')?.value,
            email: document.getElementById('email')?.value,
            pep: document.querySelector('input[name="pep"]:checked')?.value,
            ocupacion: document.getElementById('ocupacion')?.value,
            otraOcupacion: document.getElementById('otra-ocupacion')?.value,
            antiguedad: document.getElementById('antiguedad')?.value,
            ingresos: document.getElementById('ingresos')?.value
        };
    }

    // ===== SETUP SIMULADOR =====
    function setupSimulator() {
        const isAdvanced = simulationType === 'advanced';

        document.getElementById('simulator-title').textContent =
            isAdvanced ? 'Simulación Avanzada' : 'Simulación Básica';
        document.getElementById('simulator-subtitle').textContent =
            isAdvanced ? 'Compara opciones con nuestras entidades aliadas' : 'Calcula tu cuota mensual estimada';

        document.querySelectorAll('.advanced-only').forEach(el => {
            el.classList.toggle('visible', isAdvanced);
        });

        document.getElementById('results-basic')?.classList.toggle('hidden', isAdvanced);
        document.getElementById('results-advanced')?.classList.toggle('hidden', !isAdvanced);

        calculate();
    }

    function updateDownPaymentFromPercent() {
        const price = parseCurrency(document.getElementById('vehicle-price')?.value || 0);
        const percent = parseInt(document.getElementById('down-payment-slider')?.value || 30);
        const downPayment = Math.round(price * (percent / 100));

        const downPaymentInput = document.getElementById('down-payment');
        if (downPaymentInput) {
            downPaymentInput.value = formatNumber(downPayment);
        }
    }

    // ===== CÁLCULO =====
    function calculate() {
        const yearModelo = parseInt(document.getElementById('vehicle-year')?.value) || new Date().getFullYear();
        const precioVenta = parseCurrency(document.getElementById('vehicle-price')?.value || 0);
        const cuotaInicial = parseCurrency(document.getElementById('down-payment')?.value || 0);
        const plazoMeses = parseInt(document.querySelector('.term-btn.active')?.dataset.months) || 36;
        const riesgo = document.querySelector('.risk-btn.active')?.dataset.risk || 'G1';
        const valorCuotaExtra = parseCurrency(document.getElementById('extra-payment')?.value || 500000);
        const offsetMeses = parseInt(document.getElementById('offset-meses')?.value) || 5;
        const opcionCompraLeasing = parseFloat(document.getElementById('leasing-option')?.value) || 0.01;

        const valorFinanciar = precioVenta - cuotaInicial;
        const porcentajeInicial = precioVenta > 0 ? cuotaInicial / precioVenta : 0;

        // Actualizar resumen
        document.getElementById('summary-financed').textContent = formatCOP(valorFinanciar);
        document.getElementById('summary-percent').textContent = Math.round((1 - porcentajeInicial) * 100) + '%';

        if (valorFinanciar <= 0 || plazoMeses <= 0) {
            return;
        }

        const inputs = {
            yearModelo,
            precioVenta,
            cuotaInicial,
            plazoMeses,
            riesgo,
            valorCuotaExtra,
            offsetMeses,
            opcionCompraLeasing
        };

        lastSimulationResult = simularFinanciacion(inputs);

        if (simulationType === 'basic') {
            renderBasicResults(lastSimulationResult, valorFinanciar, plazoMeses);
        } else {
            renderAdvancedResults(lastSimulationResult);
        }
    }

    function renderBasicResults(result, valorFinanciar, plazoMeses) {
        // Para básica, usamos promedio de SUFI y Finandina como referencia
        let cuota = 0;
        let count = 0;

        if (typeof result.tradicional.SUFI === 'object') {
            cuota += result.tradicional.SUFI.cuota;
            count++;
        }
        if (typeof result.tradicional.FINANDINA === 'object') {
            cuota += result.tradicional.FINANDINA.cuota;
            count++;
        }

        if (count > 0) {
            cuota = Math.round(cuota / count);
        }

        const total = cuota * plazoMeses;
        const interest = total - valorFinanciar;

        document.getElementById('basic-monthly').textContent = formatCOP(cuota);
        document.getElementById('basic-amount').textContent = formatCOP(valorFinanciar);
        document.getElementById('basic-total').textContent = formatCOP(total);
        document.getElementById('basic-interest').textContent = formatCOP(interest);
    }

    function renderAdvancedResults(result) {
        const planBtn = document.querySelector('.plan-btn.active');
        const planType = planBtn?.dataset.plan || 'traditional';

        let data;
        let planNote = '';

        switch (planType) {
            case 'extra':
                data = result.cuotasExtra;
                planNote = 'Plan con cuotas adicionales al año. Reduce la cuota mensual (no el plazo). El total incluye las cuotas extra.';
                break;
            case 'leasing':
                data = result.leasing;
                planNote = 'Leasing con opción de compra al finalizar el plazo. El total incluye el valor residual.';
                break;
            default:
                data = result.tradicional;
                planNote = 'Plan tradicional con cuota fija mensual. Incluye seguro de vida sobre el saldo.';
        }

        const grid = document.getElementById('entities-grid');
        if (!grid) return;

        const entities = ['SUFI', 'OCCIDENTE', 'FINANDINA', 'FINANZAUTO', 'MOBILIZE'];
        const entityNames = {
            SUFI: 'SUFI',
            OCCIDENTE: 'Occiauto',
            FINANDINA: 'Banco Finandina',
            FINANZAUTO: 'Finanzauto',
            MOBILIZE: 'Mobilize'
        };
        const entityColors = {
            SUFI: '#0066cc',
            OCCIDENTE: '#e31937',
            FINANDINA: '#00a651',
            FINANZAUTO: '#ff6600',
            MOBILIZE: '#1a1a6e'
        };

        // Encontrar mejor opción
        let bestEntity = null;
        let bestCuota = Infinity;
        entities.forEach(entity => {
            const val = data[entity];
            if (typeof val === 'object' && val.cuota < bestCuota) {
                bestCuota = val.cuota;
                bestEntity = entity;
            }
        });

        grid.innerHTML = entities.map(entity => {
            const val = data[entity];
            const isBest = entity === bestEntity;
            const isString = typeof val === 'string';

            if (isString) {
                return `
                    <div class="entity-card unavailable">
                        <div class="entity-name">
                            <span class="entity-dot" style="background: ${entityColors[entity]}"></span>
                            <span>${entityNames[entity]}</span>
                        </div>
                        <div class="entity-unavailable">${val}</div>
                    </div>
                `;
            }

            return `
                <div class="entity-card ${isBest ? 'best' : ''}">
                    <div class="entity-name">
                        <span class="entity-dot" style="background: ${entityColors[entity]}"></span>
                        <span>${entityNames[entity]}</span>
                    </div>
                    <div class="entity-rate">
                        Tasa: ${formatPercent(val.tasa)}
                    </div>
                    <div class="entity-monthly">
                        <span class="monthly-value">${formatCOP(val.cuota)}</span>
                        <span class="monthly-label">/ mes</span>
                        ${isBest ? '<span class="best-badge">✓ Mejor opción</span>' : ''}
                    </div>
                    <div class="entity-total">
                        Total: ${formatCOP(val.total)}
                    </div>
                </div>
            `;
        }).join('');

        // Nota del plan
        const noteEl = document.getElementById('plan-note');
        if (noteEl) {
            noteEl.querySelector('span').textContent = planNote;
        }
    }

    // ===== WHATSAPP =====
    function sendWhatsApp() {
        const precio = parseCurrency(document.getElementById('vehicle-price')?.value || 0);
        const cuotaInicial = parseCurrency(document.getElementById('down-payment')?.value || 0);
        const plazo = document.querySelector('.term-btn.active')?.dataset.months || 36;
        const riesgo = document.querySelector('.risk-btn.active')?.dataset.risk || 'G1';
        const vehicleName = document.getElementById('vehicle-name')?.value || '';
        const vehicleYear = document.getElementById('vehicle-year')?.value || '';

        let message = `*SOLICITUD DE FINANCIAMIENTO VEHICULAR*\n\n`;

        message += `*DATOS DEL SOLICITANTE*\n`;
        message += `- Nombre: ${userData.nombres} ${userData.apellidos}\n`;
        message += `- ${userData.tipoDocumento}: ${userData.documento}\n`;
        message += `- Ciudad: ${userData.ciudad}\n`;
        message += `- Celular: ${userData.celular}\n`;
        message += `- Email: ${userData.email}\n\n`;

        message += `*DATOS DEL VEHICULO*\n`;
        if (vehicleName) message += `- Vehiculo: ${vehicleName} ${vehicleYear}\n`;
        message += `- Precio: ${formatCOP(precio)}\n`;
        message += `- Cuota inicial: ${formatCOP(cuotaInicial)}\n`;
        message += `- A financiar: ${formatCOP(precio - cuotaInicial)}\n`;
        message += `- Plazo: ${plazo} meses\n`;
        message += `- Riesgo: ${riesgo}\n\n`;

        message += `*TIPO*: ${simulationType === 'advanced' ? 'Simulacion Avanzada' : 'Simulacion Basica'}`;

        const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    }

    // ===== POLÍTICAS =====
    function showPolicy(type) {
        const modal = document.getElementById('policy-modal');
        const title = document.getElementById('policy-modal-title');
        const body = document.getElementById('policy-modal-body');
        if (!modal || !title || !body) return;

        const policies = {
            privacy: {
                title: 'Política de Tratamiento de Datos Personales',
                content: `<h3>1. Responsable</h3><p>ALTORRA COMPANY S.A.S. es responsable del tratamiento de sus datos.</p><h3>2. Finalidades</h3><p>Simulaciones de crédito, gestión de solicitudes, contacto comercial.</p><h3>3. Derechos</h3><p>Conocer, actualizar, rectificar y suprimir sus datos.</p>`
            },
            cookies: {
                title: 'Política de Cookies',
                content: `<h3>¿Qué son?</h3><p>Pequeños archivos almacenados en su dispositivo.</p><h3>Tipos</h3><p>Técnicas, preferencias y analíticas.</p>`
            }
        };

        const policy = policies[type];
        if (policy) {
            title.textContent = policy.title;
            body.innerHTML = policy.content;
            modal.classList.add('active');
        }
    }

    // ===== UTILIDADES =====
    function formatNumber(num) {
        return new Intl.NumberFormat('es-CO').format(num);
    }

    // Exponer API global
    window.SimuladorUI = { init, calculate, goToStep };

    // Inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
