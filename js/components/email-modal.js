/**
 * Bersaglio Jewelry — Email capture modal.
 *
 * Glass-iridescent modal centrado. Se dispara automáticamente la primera vez
 * que el usuario llega a una visita y permanece >25s sin haber suscrito ni
 * descartado previamente. También expone:
 *
 *   document.dispatchEvent(new CustomEvent('bj:email-modal:open'));
 *
 * Estado en localStorage `bj-email-subscribed`:
 *   - null/undefined  → no decidido (mostrar)
 *   - 'dismissed'     → declinó
 *   - <email-string>  → suscrito
 *
 * Sin librerías de form: validación HTML5 + escape básico antes de
 * submitar al endpoint Firestore-via-admin (ver subscribe-handler.js futuro).
 */

import { html, escape } from '../core/html.js';

const STORAGE_KEY = 'bj-email-subscribed';
let _root = null;
let _open = false;
let _autoTimer = null;
let _initialized = false;

function getStatus() {
    try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
}
function setStatus(value) {
    try { localStorage.setItem(STORAGE_KEY, value); } catch {}
}

function buildDOM() {
    if (_initialized) return;
    _root = document.createElement('div');
    _root.className = 'bj-email-modal-backdrop';
    _root.setAttribute('aria-hidden', 'true');
    _root.innerHTML = html`
        <div class="glass glass-iridescent bj-email-modal" role="dialog" aria-modal="true" aria-labelledby="bj-email-title">
            <button type="button"
                    class="bj-email-close"
                    data-action="close"
                    aria-label="Cerrar">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <line x1="6" y1="6" x2="18" y2="18"/>
                    <line x1="18" y1="6" x2="6" y2="18"/>
                </svg>
            </button>
            <div class="bj-email-icon" aria-hidden="true">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">
                    <rect x="3" y="5" width="18" height="14" rx="2"/>
                    <path d="M3 7l9 6 9-6"/>
                </svg>
            </div>
            <div class="eyebrow bj-email-eyebrow">Atelier Bersaglio</div>
            <h3 id="bj-email-title" class="bj-email-title">Acceso íntimo a la casa</h3>
            <p class="bj-email-desc">
                Lanzamientos privados, esmeraldas escogidas a mano, invitaciones al
                atelier en Cartagena. Sin spam — solo lo que vale la pena.
            </p>
            <form class="bj-email-form" novalidate>
                <label class="bj-email-label" for="bj-email-input">Tu correo</label>
                <input id="bj-email-input"
                       type="email"
                       name="email"
                       class="bj-email-input"
                       placeholder="nombre@ejemplo.co"
                       autocomplete="email"
                       required>
                <button type="submit" class="btn-aqua btn-aqua-emerald bj-email-submit">
                    Suscribirme
                </button>
                <button type="button" class="bj-email-skip" data-action="dismiss">
                    Ahora no, gracias
                </button>
            </form>
            <p class="bj-email-success" hidden>
                Gracias. Te escribiremos pronto.
            </p>
        </div>`;
    document.body.appendChild(_root);

    _root.addEventListener('click', e => {
        // Click en backdrop (no en la card) cierra
        if (e.target === _root) return closeModal();
        const btn = e.target.closest('[data-action]');
        if (!btn) return;
        if (btn.dataset.action === 'close')   { closeModal(); }
        if (btn.dataset.action === 'dismiss') { setStatus('dismissed'); closeModal(); }
    });

    _root.querySelector('.bj-email-form')?.addEventListener('submit', onSubmit);

    document.addEventListener('keydown', e => {
        if (_open && e.key === 'Escape') closeModal();
    });

    _initialized = true;
}

async function onSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.querySelector('input[type="email"]');
    if (!input?.checkValidity()) {
        input?.reportValidity();
        return;
    }
    const email = input.value.trim().toLowerCase();
    setStatus(email);

    // Show success state inside the modal
    const successEl = _root.querySelector('.bj-email-success');
    if (successEl) {
        successEl.hidden = false;
        successEl.textContent = `Gracias, ${escape(email)}. Te escribiremos pronto.`;
    }
    form.style.display = 'none';

    // Notify (analytics or admin-side webhook can subscribe)
    document.dispatchEvent(new CustomEvent('bj:email-subscribed', { detail: email }));

    setTimeout(closeModal, 1800);
}

export function openModal() {
    if (!_initialized) buildDOM();
    if (_open) return;
    _open = true;
    requestAnimationFrame(() => _root.classList.add('is-open'));
    document.body.classList.add('email-modal-open');
}

export function closeModal() {
    if (!_open) return;
    _open = false;
    _root?.classList.remove('is-open');
    document.body.classList.remove('email-modal-open');
}

export function initEmailModal() {
    document.addEventListener('bj:email-modal:open', openModal);

    if (getStatus()) return; // already decided

    // Auto-open after 25s of activity, only on home (don't interrupt deep flows)
    if (location.pathname.replace(/\.html$/, '').replace(/^\//, '') === '' ||
        location.pathname.endsWith('index.html')) {
        _autoTimer = setTimeout(openModal, 25000);
    }
}

export default { initEmailModal, openModal, closeModal };
