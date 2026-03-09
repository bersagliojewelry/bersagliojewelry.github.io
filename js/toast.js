/**
 * Bersaglio Jewelry — Toast Notifications
 *
 * Uso:
 *   toast.show('Añadida a lista de deseos', 'added');
 *   toast.show('Eliminada de la lista',      'removed');
 *   toast.show('Algo salió mal',             'error');
 */

const ICONS = {
    added: `<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" aria-hidden="true">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
    </svg>`,

    removed: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" aria-hidden="true">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        <line x1="4" y1="4" x2="20" y2="20"/>
    </svg>`,

    error: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>`,

    default: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="9 12 11 14 15 10"/>
    </svg>`
};

class ToastManager {

    constructor() {
        this._container = null;
    }

    _getContainer() {
        if (!this._container) {
            this._container = document.createElement('div');
            this._container.className = 'toast-container';
            this._container.setAttribute('role', 'status');
            this._container.setAttribute('aria-live', 'polite');
            this._container.setAttribute('aria-atomic', 'false');
            document.body.appendChild(this._container);
        }
        return this._container;
    }

    /**
     * @param {string} message
     * @param {'added'|'removed'|'error'|'default'} [type='default']
     * @param {number} [duration=2800] milliseconds
     */
    show(message, type = 'default', duration = 2800) {
        const container = this._getContainer();

        const el = document.createElement('div');
        el.className = `toast toast--${type}`;
        el.innerHTML = `
            <span class="toast-icon">${ICONS[type] || ICONS.default}</span>
            <span class="toast-msg">${message}</span>
        `;
        container.appendChild(el);

        // Animate in on next frame
        requestAnimationFrame(() => {
            requestAnimationFrame(() => el.classList.add('toast--visible'));
        });

        // Auto-dismiss
        const dismiss = () => {
            el.classList.remove('toast--visible');
            el.addEventListener('transitionend', () => el.remove(), { once: true });
        };
        setTimeout(dismiss, duration);
    }
}

export const toast = new ToastManager();
export default toast;
