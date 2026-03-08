/**
 * TOAST NOTIFICATION SYSTEM - ALTORRA CARS
 * Sistema moderno de notificaciones con tecnología avanzada
 */

class ToastManager {
    constructor() {
        this.container = null;
        this.toasts = [];
        this.init();
    }

    init() {
        // Crear container si no existe
        if (!document.querySelector('.toast-container')) {
            this.container = document.createElement('div');
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        } else {
            this.container = document.querySelector('.toast-container');
        }
    }

    /**
     * Mostrar notificación
     * @param {string} message - Mensaje principal
     * @param {string} type - Tipo: 'success', 'error', 'info'
     * @param {string} title - Título opcional
     * @param {number} duration - Duración en ms (default: 4000)
     */
    show(message, type = 'info', title = '', duration = 4000) {
        // Cerrar todas las notificaciones anteriores para evitar saturación
        this.closeAll();

        const toast = this.createToast(message, type, title, duration);
        this.container.appendChild(toast);
        this.toasts.push(toast);

        // Auto-cerrar después de duration
        const timeout = setTimeout(() => {
            this.close(toast);
        }, duration);

        // Guardar timeout para poder cancelarlo
        toast.dataset.timeout = timeout;

        return toast;
    }

    createToast(message, type, title, duration) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        // Iconos según tipo
        const icons = {
            success: '✓',
            error: '✕',
            info: 'i'
        };

        const icon = icons[type] || icons.info;

        // Título predeterminado según tipo
        const defaultTitles = {
            success: '¡Éxito!',
            error: 'Error',
            info: 'Información'
        };

        const toastTitle = title || defaultTitles[type];

        toast.innerHTML = `
            <div class="toast-icon">${icon}</div>
            <div class="toast-content">
                <p class="toast-title">${toastTitle}</p>
                <p class="toast-message">${message}</p>
            </div>
            <button class="toast-close" aria-label="Cerrar">×</button>
            ${duration > 0 ? '<div class="toast-progress"><div class="toast-progress-bar"></div></div>' : ''}
        `;

        // Evento de cerrar
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => this.close(toast));

        return toast;
    }

    close(toast) {
        if (!toast || !toast.parentElement) return;

        // Cancelar timeout si existe
        if (toast.dataset.timeout) {
            clearTimeout(parseInt(toast.dataset.timeout));
        }

        toast.classList.add('closing');

        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
            const index = this.toasts.indexOf(toast);
            if (index > -1) {
                this.toasts.splice(index, 1);
            }
        }, 300);
    }

    success(message, title = '¡Éxito!') {
        return this.show(message, 'success', title);
    }

    error(message, title = 'Error') {
        return this.show(message, 'error', title);
    }

    info(message, title = 'Información') {
        return this.show(message, 'info', title);
    }

    // Cerrar todas las notificaciones
    closeAll() {
        [...this.toasts].forEach(toast => this.close(toast));
    }
}

// Instancia global
const toast = new ToastManager();

// Export para uso en otros archivos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ToastManager, toast };
}
