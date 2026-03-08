/**
 * ALTORRA CARS — Cookie Consent System v2.0
 * ==========================================
 * Banner glassmorphism con preferencias granulares.
 * Cumple con GDPR / ley colombiana de protección de datos (Ley 1581 de 2012).
 *
 * Preferencias almacenadas en localStorage:
 *   { timestamp, version, preferences: { necessary, analytics, marketing } }
 *
 * Expone globalmente:
 *   window.cookieConsent.isAllowed(category)   → boolean
 *   window.cookieConsent.reset()               → abre banner de nuevo
 */

(function () {
    'use strict';

    const STORAGE_KEY      = 'altorra_cookie_consent';
    const CONSENT_VERSION  = '1.1'; // incrementar si cambias la política

    /* ── HTML del banner ── */
    const BANNER_HTML = `
<div id="cookie-banner" class="cookie-banner" role="dialog" aria-modal="true"
     aria-label="Consentimiento de cookies" aria-live="polite">
    <div class="cookie-banner-content">
        <div class="cookie-banner-icon" aria-hidden="true">🍪</div>

        <div class="cookie-banner-text">
            <h4>Tu privacidad nos importa</h4>
            <p>
                Usamos cookies propias y de terceros para mejorar tu experiencia,
                analizar el tráfico y personalizar el contenido.
                Puedes aceptarlas todas o elegir cuáles permitir.
            </p>
        </div>

        <div class="cookie-banner-actions">
            <button type="button" class="cookie-btn cookie-btn-accept" id="cookie-btn-accept">
                Aceptar todo
            </button>
            <button type="button" class="cookie-btn cookie-btn-reject" id="cookie-btn-reject">
                Solo necesarias
            </button>
            <button type="button" class="cookie-btn cookie-btn-settings" id="cookie-btn-settings">
                ⚙ Personalizar
            </button>
        </div>
    </div>
</div>`;

    /* ── HTML del modal de preferencias ── */
    const MODAL_HTML = `
<div id="cookie-modal-overlay" class="cookie-modal-overlay" role="dialog" aria-modal="true"
     aria-label="Configuración de cookies">
    <div class="cookie-modal">
        <div class="cookie-modal-header">
            <h3>Preferencias de cookies</h3>
            <p>Elige qué tipos de cookies deseas permitir en tu visita.</p>
        </div>

        <div class="cookie-modal-body">
            <div class="cookie-option">
                <div class="cookie-option-info">
                    <h4>Necesarias</h4>
                    <p>Esenciales para el funcionamiento del sitio. No se pueden desactivar.</p>
                </div>
                <label class="cookie-toggle">
                    <input type="checkbox" checked disabled aria-label="Cookies necesarias (obligatorio)">
                    <span class="cookie-toggle-slider"></span>
                </label>
            </div>

            <div class="cookie-option">
                <div class="cookie-option-info">
                    <h4>Analíticas</h4>
                    <p>Nos ayudan a entender cómo usas el sitio para mejorarlo continuamente.</p>
                </div>
                <label class="cookie-toggle">
                    <input type="checkbox" id="cookie-pref-analytics" aria-label="Cookies analíticas">
                    <span class="cookie-toggle-slider"></span>
                </label>
            </div>

            <div class="cookie-option">
                <div class="cookie-option-info">
                    <h4>Marketing</h4>
                    <p>Permiten mostrarte contenido y anuncios relevantes a tus intereses.</p>
                </div>
                <label class="cookie-toggle">
                    <input type="checkbox" id="cookie-pref-marketing" aria-label="Cookies de marketing">
                    <span class="cookie-toggle-slider"></span>
                </label>
            </div>
        </div>

        <div class="cookie-modal-footer">
            <button type="button" class="cookie-btn cookie-btn-reject" id="cookie-modal-reject">
                Solo necesarias
            </button>
            <button type="button" class="cookie-btn cookie-btn-accept" id="cookie-modal-save">
                Guardar preferencias
            </button>
        </div>
    </div>
</div>`;

    /* ── CookieConsent class ── */
    class CookieConsent {
        constructor() {
            this._consent = this._load();
            this._init();
        }

        /* Lectura / escritura ---------------------------------------- */

        _load() {
            try {
                const raw = localStorage.getItem(STORAGE_KEY);
                if (!raw) return null;
                const data = JSON.parse(raw);
                // Revalidar si el usuario tiene una versión anterior de la política
                if (data.version !== CONSENT_VERSION) return null;
                return data;
            } catch (_) {
                return null;
            }
        }

        _save(preferences) {
            const data = {
                timestamp  : new Date().toISOString(),
                version    : CONSENT_VERSION,
                preferences: { necessary: true, ...preferences }
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            this._consent = data;
        }

        /* Inicialización --------------------------------------------- */

        _init() {
            if (this._consent) return; // ya tenemos consentimiento

            document.body.insertAdjacentHTML('beforeend', BANNER_HTML);
            document.body.insertAdjacentHTML('beforeend', MODAL_HTML);

            // Mostrar banner con delay suave
            requestAnimationFrame(() => {
                setTimeout(() => {
                    document.getElementById('cookie-banner')?.classList.add('active');
                }, 800);
            });

            this._bindEvents();
        }

        _bindEvents() {
            this._on('cookie-btn-accept',    () => this.acceptAll());
            this._on('cookie-btn-reject',    () => this.rejectAll());
            this._on('cookie-btn-settings',  () => this._openModal());
            this._on('cookie-modal-reject',  () => this.rejectAll());
            this._on('cookie-modal-save',    () => this._saveFromModal());

            // Cerrar modal al clic en overlay
            document.getElementById('cookie-modal-overlay')
                ?.addEventListener('click', (e) => {
                    if (e.target.id === 'cookie-modal-overlay') this._closeModal();
                });

            // Accesibilidad — cerrar con Escape
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') this._closeModal();
            }, { once: false });
        }

        _on(id, fn) {
            document.getElementById(id)?.addEventListener('click', fn);
        }

        /* Acciones --------------------------------------------------- */

        acceptAll() {
            this._save({ analytics: true, marketing: true });
            this._closeBanner();
            this._closeModal();
            this._dispatchEvent('accept-all');
        }

        rejectAll() {
            this._save({ analytics: false, marketing: false });
            this._closeBanner();
            this._closeModal();
            this._dispatchEvent('reject-all');
        }

        _saveFromModal() {
            const analytics = document.getElementById('cookie-pref-analytics')?.checked ?? false;
            const marketing = document.getElementById('cookie-pref-marketing')?.checked ?? false;
            this._save({ analytics, marketing });
            this._closeBanner();
            this._closeModal();
            this._dispatchEvent('custom');
        }

        /* Modal ------------------------------------------------------- */

        _openModal() {
            const overlay = document.getElementById('cookie-modal-overlay');
            if (!overlay) return;
            overlay.classList.add('active');
            overlay.querySelector('#cookie-pref-analytics')?.focus();
        }

        _closeModal() {
            document.getElementById('cookie-modal-overlay')?.classList.remove('active');
        }

        /* Banner ------------------------------------------------------ */

        _closeBanner() {
            const banner = document.getElementById('cookie-banner');
            if (!banner) return;
            banner.classList.remove('active');
            setTimeout(() => banner.remove(), 500);
        }

        /* Helpers ----------------------------------------------------- */

        _dispatchEvent(type) {
            window.dispatchEvent(new CustomEvent('altorra:cookie-consent', {
                detail: { type, preferences: this._consent?.preferences }
            }));
        }

        _toast(msg) {
            if (typeof toast !== 'undefined' && toast.success) {
                toast.success(msg, undefined, 4000);
            }
        }

        /* API pública ------------------------------------------------- */

        /**
         * Verifica si una categoría está permitida.
         * @param {'necessary'|'analytics'|'marketing'} category
         * @returns {boolean}
         */
        isAllowed(category) {
            if (!this._consent) return category === 'necessary';
            return this._consent.preferences[category] === true;
        }

        /**
         * Olvida el consentimiento previo y muestra el banner de nuevo.
         */
        reset() {
            localStorage.removeItem(STORAGE_KEY);
            this._consent = null;
            this._init();
        }
    }

    /* ── Bootstrap ── */
    function bootstrap() {
        window.cookieConsent = new CookieConsent();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bootstrap);
    } else {
        bootstrap();
    }

})();
