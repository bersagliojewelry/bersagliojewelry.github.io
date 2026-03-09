/**
 * Bersaglio Admin — Shared utilities
 * Sidebar init, toast, escaping, date formatting.
 */

import adminDb from './db.js';

// ─── Sidebar: marca el link activo y muestra el badge de consultas ────────────

export function initSidebar() {
    const page = location.pathname.split('/').pop() || 'admin.html';
    document.querySelectorAll('.adm-nav-link').forEach(link => {
        const href = link.getAttribute('href');
        link.classList.toggle('is-active', href === page);
    });

    const unread = adminDb.getInquiries().filter(i => !i.read).length;
    const badge  = document.getElementById('inq-badge');
    if (badge) {
        badge.textContent = unread > 9 ? '9+' : unread;
        badge.hidden = unread === 0;
    }
}

// ─── Toast ────────────────────────────────────────────────────────────────────

/**
 * @param {string} msg
 * @param {'success'|'danger'|'default'} [type='success']
 * @param {number} [ms=2500]
 */
export function admToast(msg, type = 'success', ms = 2500) {
    const wrap = document.getElementById('toast-wrap');
    if (!wrap) return;

    const el = document.createElement('div');
    el.className = `adm-toast adm-toast--${type}`;
    el.textContent = msg;
    wrap.appendChild(el);

    requestAnimationFrame(() => {
        requestAnimationFrame(() => el.classList.add('adm-toast--visible'));
    });

    setTimeout(() => {
        el.classList.remove('adm-toast--visible');
        el.addEventListener('transitionend', () => el.remove(), { once: true });
    }, ms);
}

// ─── Confirm dialog ───────────────────────────────────────────────────────────

/**
 * Shows the shared #confirm-dialog.
 * @param {string}   message
 * @param {Function} onConfirm
 */
export function admConfirm(message, onConfirm) {
    const dialog   = document.getElementById('confirm-dialog');
    const msgEl    = document.getElementById('confirm-msg');
    const btnOk    = document.getElementById('confirm-ok');
    const btnCancel = document.getElementById('confirm-cancel');

    if (!dialog) { if (confirm(message)) onConfirm(); return; }

    if (msgEl) msgEl.textContent = message;
    dialog.hidden = false;

    const cleanup = () => { dialog.hidden = true; btnOk.onclick = null; btnCancel.onclick = null; };
    btnOk.onclick     = () => { cleanup(); onConfirm(); };
    btnCancel.onclick = cleanup;
}

// ─── DOM helpers ──────────────────────────────────────────────────────────────

export function esc(str) {
    return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

export function fmtDate(iso) {
    return new Date(iso).toLocaleDateString('es-CO', {
        day: '2-digit', month: 'short', year: 'numeric'
    });
}

export function fmtDateTime(iso) {
    return new Date(iso).toLocaleString('es-CO', {
        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
    });
}
