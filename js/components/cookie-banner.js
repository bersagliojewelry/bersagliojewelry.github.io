/**
 * Bersaglio Jewelry — Cookie consent banner.
 *
 * Glass-pill flotando bottom-center. Aparece solo si NO hay
 * localStorage `bj-cookie-consent`. Almacena 'accepted' o 'declined'.
 *
 * Lazy: el DOM solo se inserta si el banner debe mostrarse.
 */

import { html } from '../core/html.js';

const STORAGE_KEY = 'bj-cookie-consent';

function getConsent() {
    try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
}
function setConsent(value) {
    try { localStorage.setItem(STORAGE_KEY, value); } catch {}
}

function build() {
    const root = document.createElement('div');
    root.className = 'glass glass-pill bj-cookie-banner';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-label', 'Aviso de cookies');
    root.setAttribute('aria-live', 'polite');

    root.innerHTML = html`
        <p class="bj-cookie-text">
            Usamos cookies para mejorar tu experiencia y entender el uso del sitio.
            Al continuar aceptas nuestra
            <a href="/privacidad.html">política de privacidad</a>.
        </p>
        <div class="bj-cookie-actions">
            <button type="button" class="bj-cookie-btn bj-cookie-btn--decline" data-action="decline">
                Rechazar
            </button>
            <button type="button" class="bj-cookie-btn bj-cookie-btn--accept" data-action="accept">
                Aceptar
            </button>
        </div>`;

    root.addEventListener('click', e => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;
        const action = btn.dataset.action;
        if (action === 'accept' || action === 'decline') {
            setConsent(action === 'accept' ? 'accepted' : 'declined');
            // La compuerta se resuelve → libera al concierge (FAB asesoría) que estaba apartado.
            document.body.classList.remove('bj-cookie-active');
            root.classList.add('is-leaving');
            setTimeout(() => root.remove(), 350);
            // Notify listeners (analytics may want to react)
            document.dispatchEvent(new CustomEvent('bj:cookie-consent', { detail: action }));
        }
    });

    document.body.appendChild(root);
    // Compuerta de consentimiento presente → aparta el FAB de asesoría (ambos son flotantes
    // abajo-derecha y se pisaban en móvil; el toque de "Aceptar" caía en el FAB). El FAB reacciona
    // por CSS a esta bandera y vuelve al resolverse. (bug cookie/FAB — ver ADR §156.19.)
    document.body.classList.add('bj-cookie-active');
    requestAnimationFrame(() => root.classList.add('is-open'));
}

export function initCookieBanner() {
    if (getConsent()) return; // already decided
    // Defer slightly so the banner doesn't compete with first paint
    setTimeout(build, 1500);
}

export default { initCookieBanner };
