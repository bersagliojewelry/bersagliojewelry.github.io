/**
 * Bersaglio Admin — Shared utilities
 * Auth guard, sidebar init, toast, escaping, date formatting.
 */

import adminDb from './db.js';
import { requireAuth, currentUser, currentRole, hasRole, signOut } from '../auth.js';

// ─── Auth guard ────────────────────────────────────────────────────────────────

/**
 * Call at the top of every admin page's init().
 * Redirects to login if not authenticated.
 * @param {'owner'|'admin'|'editor'} [minRole='editor']
 */
export { requireAuth, currentUser, currentRole, hasRole, signOut };

// ─── Sidebar: marca el link activo, muestra badge e info de usuario ───────────

export function initSidebar() {
    const page = location.pathname.split('/').pop() || 'admin.html';
    document.querySelectorAll('.adm-nav-link').forEach(link => {
        const href = link.getAttribute('href');
        link.classList.toggle('is-active', href === page);
    });

    updateBadge();

    // Real-time badge: subscribe once
    if (!initSidebar._subscribed) {
        initSidebar._subscribed = true;
        adminDb.on('inquiries', () => updateBadge());
    }

    renderUserInfo();
}

function updateBadge() {
    const unread = adminDb.getInquiries().filter(i => !i.read).length;
    const badge  = document.getElementById('inq-badge');
    if (badge) {
        badge.textContent = unread > 9 ? '9+' : unread;
        badge.hidden = unread === 0;
    }
}

function renderUserInfo() {
    const user = currentUser();
    if (!user) return;

    const devNotice = document.querySelector('.adm-dev-notice');
    if (devNotice) devNotice.remove();

    // Don't duplicate
    if (document.querySelector('.adm-user-info')) return;

    const sidebar = document.querySelector('.adm-sidebar');
    if (!sidebar) return;

    const name    = user.profile?.displayName || user.user?.email?.split('@')[0] || 'Usuario';
    const role    = user.profile?.role || 'editor';
    const initial = name.charAt(0).toUpperCase();

    const div = document.createElement('div');
    div.className = 'adm-user-info';
    div.innerHTML = `
        <span class="adm-user-avatar">${esc(initial)}</span>
        <div style="flex:1;min-width:0;">
            <div class="adm-user-name">${esc(name)}</div>
            <div class="adm-user-role">${esc(role)}</div>
        </div>
        <button class="adm-btn-logout" id="btn-logout" title="Cerrar sesión">
            <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clip-rule="evenodd"/></svg>
        </button>
    `;
    sidebar.appendChild(div);

    document.getElementById('btn-logout')?.addEventListener('click', () => signOut());

    // Hide nav items based on role
    const usersLink = document.querySelector('a[href="admin-usuarios.html"]');
    if (usersLink && !hasRole('owner')) {
        usersLink.style.display = 'none';
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

export function fmtDate(val) {
    if (!val) return '\u2014';
    const d = val.toDate ? val.toDate() : new Date(val);
    return d.toLocaleDateString('es-CO', {
        day: '2-digit', month: 'short', year: 'numeric'
    });
}

export function fmtDateTime(val) {
    if (!val) return '\u2014';
    const d = val.toDate ? val.toDate() : new Date(val);
    return d.toLocaleString('es-CO', {
        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
    });
}
