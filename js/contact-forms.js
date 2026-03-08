// Contact Forms Manager - ALTORRA CARS
// Maneja formularios flotantes para "Vende tu Auto" (wizard 3 pasos) y "Financiación"

class ContactFormManager {
    constructor() {
        this.whatsappNumber = '573235016747';
        this.activeElement = null;
        this.vendeWizardStep = 1;
        this.init();
    }

    init() {
        this.attachEventListeners();
        this.initVendeWizard();
    }

    attachEventListeners() {
        // Abrir modal de "Vende tu Auto"
        document.addEventListener('click', (e) => {
            if (e.target.closest('[data-modal="vende-auto"]')) {
                e.preventDefault();
                this.openModal('vende-auto');
            }
        });

        // Abrir modal de "Financiación"
        document.addEventListener('click', (e) => {
            if (e.target.closest('[data-modal="financiacion"]')) {
                e.preventDefault();
                this.openModal('financiacion');
            }
        });

        // Cerrar modales
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay') ||
                e.target.closest('.modal-close')) {
                this.closeAllModals();
            }
        });

        // Cerrar con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });

        // Manejar envío de formularios
        document.addEventListener('submit', (e) => {
            if (e.target.matches('#vendeAutoForm')) {
                e.preventDefault();
                this.handleVendeAutoSubmit(e.target);
            }
            if (e.target.matches('#financiacionForm')) {
                e.preventDefault();
                this.handleFinanciacionSubmit(e.target);
            }
        });
    }

    // ── Wizard "Vende tu Auto" ─────────────────────────────────

    initVendeWizard() {
        document.addEventListener('click', (e) => {
            const nextBtn = e.target.closest('.wizard-btn-next');
            if (nextBtn) {
                const panel = parseInt(nextBtn.dataset.panel, 10);
                if (this.validateWizardPanel(panel)) this.goToWizardStep(panel + 1);
            }
            const backBtn = e.target.closest('.wizard-btn-back');
            if (backBtn) {
                const panel = parseInt(backBtn.dataset.panel, 10);
                this.goToWizardStep(panel - 1);
            }
        });

        // Validación en tiempo real al salir de cada campo
        document.addEventListener('blur', (e) => {
            const input = e.target;
            if (input.closest('#vendeAutoForm') && input.matches('.form-input, .form-textarea')) {
                this.validateField(input);
            }
            if (input.closest('#financiacionForm') && input.matches('.form-input, .form-select')) {
                this.validateFinanciacionField(input);
            }
        }, true);

        // Limpiar error al empezar a escribir
        document.addEventListener('input', (e) => {
            const input = e.target;
            if (input.closest('#vendeAutoForm') && input.matches('.form-input')) {
                if (input.classList.contains('input-error')) {
                    this.clearFieldError(input);
                }
            }
            if (input.closest('#financiacionForm') && input.matches('.form-input')) {
                if (input.classList.contains('input-error')) {
                    this.clearFieldError(input);
                }
            }
        });
    }

    goToWizardStep(step) {
        const modal = document.getElementById('vende-auto-modal');
        if (!modal) return;

        this.vendeWizardStep = step;

        // Panels
        modal.querySelectorAll('.wizard-panel').forEach(p => p.classList.remove('active'));
        const target = modal.querySelector(`.wizard-panel[data-panel="${step}"]`);
        if (target) {
            target.classList.add('active');
            const firstInput = target.querySelector('input, textarea');
            if (firstInput) setTimeout(() => firstInput.focus(), 50);
        }

        // Steps indicator
        modal.querySelectorAll('.wizard-step-item').forEach(s => {
            const n = parseInt(s.dataset.step, 10);
            s.classList.toggle('active', n === step);
            s.classList.toggle('done', n < step);
            s.setAttribute('aria-current', n === step ? 'step' : 'false');
        });

        // Progress fill
        const fill = modal.querySelector('#vendeWizardFill');
        if (fill) fill.style.width = Math.round((step / 3) * 100) + '%';

        // Subtitle
        const subtitles = ['Paso 1 de 3 — Datos de contacto', 'Paso 2 de 3 — Tu vehículo', 'Paso 3 de 3 — Recibe tu oferta'];
        const sub = modal.querySelector('#vendeWizardSubtitle');
        if (sub) sub.textContent = subtitles[step - 1] || '';
    }

    validateWizardPanel(panel) {
        const modal = document.getElementById('vende-auto-modal');
        if (!modal) return true;
        const panelEl = modal.querySelector(`.wizard-panel[data-panel="${panel}"]`);
        if (!panelEl) return true;
        let valid = true;
        panelEl.querySelectorAll('.form-input').forEach(input => {
            if (!this.validateField(input)) valid = false;
        });
        return valid;
    }

    validateField(input) {
        const value = input.value.trim();
        let error = '';

        if (!value) {
            error = 'Este campo es obligatorio';
        } else if (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            error = 'Ingresa un email válido';
        } else if (input.type === 'tel' && !/^\d{7,15}$/.test(value.replace(/\s/g, ''))) {
            error = 'Ingresa un número válido (7-15 dígitos)';
        } else if (input.name === 'year') {
            const y = parseInt(value, 10);
            if (isNaN(y) || y < 1990 || y > 2026) error = 'Año entre 1990 y 2026';
        } else if (input.name === 'kilometraje') {
            if (isNaN(parseInt(value, 10)) || parseInt(value, 10) < 0) error = 'Kilometraje inválido';
        }

        // Los campos opcionales no generan error si están vacíos
        const isRequired = input.closest('.form-group')?.querySelector('.form-label.required') !== null;
        if (!isRequired && !value) error = '';

        if (error) {
            this.setFieldError(input, error);
            return false;
        }
        this.clearFieldError(input);
        return true;
    }

    setFieldError(input, msg) {
        input.classList.add('input-error');
        const err = input.parentElement.querySelector('.form-error');
        if (err) err.textContent = msg;
    }

    clearFieldError(input) {
        input.classList.remove('input-error');
        const err = input.parentElement.querySelector('.form-error');
        if (err) err.textContent = '';
    }

    validateFinanciacionField(input) {
        const value = input.value.trim();
        let error = '';
        const isRequired = input.closest('.form-group')?.querySelector('.form-label.required') !== null;

        if (isRequired && !value) {
            error = 'Este campo es obligatorio';
        } else if (value && input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            error = 'Ingresa un email válido';
        } else if (value && input.type === 'tel' && !/^\d{7,15}$/.test(value.replace(/\s/g, ''))) {
            error = 'Ingresa un número válido (7-15 dígitos)';
        }

        if (error) {
            this.setFieldError(input, error);
            return false;
        }
        this.clearFieldError(input);
        return true;
    }

    validateFinanciacionForm(form) {
        let valid = true;
        form.querySelectorAll('.form-input, .form-select').forEach(input => {
            if (!this.validateFinanciacionField(input)) valid = false;
        });
        return valid;
    }

    resetFinanciacionForm() {
        const form = document.getElementById('financiacionForm');
        if (form) {
            form.reset();
            form.querySelectorAll('.form-input, .form-select').forEach(el => el.classList.remove('input-error'));
            form.querySelectorAll('.form-error').forEach(el => el.textContent = '');
        }
    }

    resetVendeWizard() {
        this.goToWizardStep(1);
        const modal = document.getElementById('vende-auto-modal');
        if (modal) {
            modal.querySelectorAll('.form-input, .form-textarea').forEach(el => {
                el.classList.remove('input-error');
            });
            modal.querySelectorAll('.form-error').forEach(el => el.textContent = '');
        }
    }

    // ── Modal genérico ─────────────────────────────────────────

    openModal(modalId) {
        const modal = document.getElementById(`${modalId}-modal`);
        if (modal) {
            this.activeElement = document.activeElement;
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';

            if (modalId === 'vende-auto') this.resetVendeWizard();
            if (modalId === 'financiacion') this.resetFinanciacionForm();

            setTimeout(() => {
                const firstInput = modal.querySelector('input:not([type="hidden"]), textarea, select');
                if (firstInput) firstInput.focus();
            }, 100);

            this.trapFocus(modal);
        }
    }

    closeAllModals() {
        const modals = document.querySelectorAll('.modal-overlay');
        modals.forEach(modal => modal.classList.remove('active'));
        document.body.style.overflow = '';
        if (this.activeElement) {
            this.activeElement.focus();
            this.activeElement = null;
        }
    }

    trapFocus(modal) {
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        const handleTab = (e) => {
            if (e.key !== 'Tab') return;

            if (e.shiftKey) {
                // Shift + Tab
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
            } else {
                // Tab
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        };

        modal.addEventListener('keydown', handleTab);

        // Remover listener cuando se cierra el modal
        const removeListener = () => {
            modal.removeEventListener('keydown', handleTab);
        };

        // Guardar referencia para limpiar después
        modal.removeTabListener = removeListener;
    }

    handleVendeAutoSubmit(form) {
        const formData = new FormData(form);

        const nombre = formData.get('nombre');
        const telefono = formData.get('telefono');
        const email = formData.get('email');
        const marca = formData.get('marca');
        const modelo = formData.get('modelo');
        const year = formData.get('year');
        const kilometraje = formData.get('kilometraje');
        const precio = formData.get('precio');
        const comentarios = formData.get('comentarios');

        // Construir mensaje de WhatsApp
        const mensaje = `*VENTA DE VEHICULO*

INFORMACION DEL CLIENTE:
- Nombre: ${nombre}
- Telefono: ${telefono}
- Email: ${email}

INFORMACION DEL VEHICULO:
- Marca: ${marca}
- Modelo: ${modelo}
- Ano: ${year}
- Kilometraje: ${kilometraje} km
- Precio esperado: ${precio}

Comentarios adicionales:
${comentarios || 'Ninguno'}`;

        // Redirigir a WhatsApp
        const whatsappUrl = `https://wa.me/${this.whatsappNumber}?text=${encodeURIComponent(mensaje)}`;
        window.open(whatsappUrl, '_blank');

        // Cerrar modal y resetear formulario
        this.closeAllModals();
        form.reset();

        // Mostrar notificación si toast está disponible
        if (typeof toast !== 'undefined') {
            toast.success('Te redirigiremos a WhatsApp para completar tu solicitud', 'Formulario enviado');
        }
    }

    handleFinanciacionSubmit(form) {
        if (!this.validateFinanciacionForm(form)) return;

        const formData = new FormData(form);

        const nombre = formData.get('nombre');
        const telefono = formData.get('telefono');
        const email = formData.get('email');
        const vehiculoInteres = formData.get('vehiculo-interes');
        const precioVehiculo = formData.get('precio-vehiculo');
        const cuotaInicial = formData.get('cuota-inicial');
        const plazo = formData.get('plazo');
        const ingresos = formData.get('ingresos');
        const situacion = formData.get('situacion-laboral');
        const ciudad = formData.get('ciudad');
        const comentarios = formData.get('comentarios');

        // Construir mensaje de WhatsApp
        const mensaje = `*SOLICITUD DE FINANCIACION*

INFORMACION DEL CLIENTE:
- Nombre: ${nombre}
- Telefono: ${telefono}
- Email: ${email}
- Ciudad: ${ciudad || 'No indicada'}
- Situacion laboral: ${situacion || 'No indicada'}

INFORMACION DEL VEHICULO:
- Vehiculo de interes: ${vehiculoInteres}
- Precio del vehiculo: ${precioVehiculo}
- Cuota inicial disponible: ${cuotaInicial}
- Plazo deseado: ${plazo}

INFORMACION FINANCIERA:
- Ingresos mensuales: ${ingresos}

Comentarios adicionales:
${comentarios || 'Ninguno'}`;

        // Redirigir a WhatsApp
        const whatsappUrl = `https://wa.me/${this.whatsappNumber}?text=${encodeURIComponent(mensaje)}`;
        window.open(whatsappUrl, '_blank');

        // Cerrar modal y resetear formulario
        this.closeAllModals();
        form.reset();

        // Mostrar notificación si toast está disponible
        if (typeof toast !== 'undefined') {
            toast.success('Te redirigiremos a WhatsApp para completar tu solicitud', 'Formulario enviado');
        }
    }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.contactFormManager = new ContactFormManager();
    });
} else {
    window.contactFormManager = new ContactFormManager();
}
