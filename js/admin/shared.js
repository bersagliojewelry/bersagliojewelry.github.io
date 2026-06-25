/**
 * Bersaglio Admin — Shared utilities
 * Auth guard, sidebar init, toast, escaping, date formatting.
 */

import adminDb from './db.js';
import { requireAuth, currentUser, currentRole, hasRole, signOut } from '../auth.js';
import { setAuthContext } from '../firestore-service.js';
import { renderSidebar } from './render-sidebar.js';
import { NAV } from './sidebar-data.js';
import { esPendiente } from './lead-format.js';
import { initTruncadoBanner } from './truncado.js';

// ─── Auth guard ────────────────────────────────────────────────────────────────

/**
 * Call at the top of every admin page's init().
 * Redirects to login if not authenticated.
 * @param {'owner'|'admin'|'editor'} [minRole='editor']
 */
export { requireAuth, currentUser, currentRole, hasRole, signOut };

// ─── Sidebar: monta el rail desde datos, marca el link activo, badge, user ───

// Pinta el rail (marca + nav + versión) desde un rol. Idempotente: limpia el rail previo
// (reconciliación) y deja `data-role` para detectar staleness. NO toca `.adm-user-info`.
function paintRail(sidebar, role, page) {
    sidebar.querySelectorAll('.adm-brand, .adm-nav, .adm-version').forEach(el => el.remove());
    sidebar.insertAdjacentHTML('afterbegin', renderSidebar(NAV, { role, activePage: page }));
    sidebar.dataset.role = role;
    wireSidebarToggle(sidebar);
}

/**
 * Pinta el menú AL INSTANTE desde el rol cacheado en sessionStorage (A3 §TODO-33), sin esperar
 * la cascada de auth (~900ms) — el menú reaparece ~al instante en cada navegación en vez de
 * "desaparecer y demorar". Se llama al importar shared.js (los módulos son `defer` → el DOM ya
 * está parseado). El rol cacheado SOLO PINTA; el candado real es server-side (reglas). initSidebar()
 * reconcilia tras auth si el rol real difiere. No-op si no hay rail (login) o ya está pintado.
 */
export function renderSidebarShell() {
    const sidebar = document.querySelector('.adm-sidebar');
    if (!sidebar || sidebar.querySelector('.adm-nav')) return;
    let role = 'editor';
    try { role = sessionStorage.getItem('bj_role') || 'editor'; } catch { /* storage off */ }
    paintRail(sidebar, role, location.pathname.split('/').pop() || 'admin.html');
}

export function initSidebar() {
    const sidebar = document.querySelector('.adm-sidebar');
    const page = location.pathname.split('/').pop() || 'admin.html';

    // Banner de truncado (spec §9.1): toda página admin escucha la alerta de
    // "datos incompletos" de las capas de datos. Idempotente (se cablea 1 vez).
    initTruncadoBanner();

    // El rail ya suele estar pintado por renderSidebarShell() (rol cacheado). Aquí, con el rol
    // REAL ya resuelto: si no se pintó (sin caché) lo pintamos; si el cacheado estaba STALE,
    // reconciliamos (A2 — el rol cacheado nunca autoriza, solo pinta; el server es el candado).
    if (sidebar) {
        const realRole = currentRole();
        if (!sidebar.querySelector('.adm-nav')) {
            paintRail(sidebar, realRole || 'editor', page);
        } else if (realRole && sidebar.dataset.role !== realRole) {
            paintRail(sidebar, realRole, page);
        }
    }

    // Marca el link activo (segunda pasada defensiva tras el montaje).
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

    // Propagate auth context to the Firestore service for audit stamping.
    const user = currentUser();
    if (user) {
        setAuthContext({
            uid:         user.user?.uid || null,
            email:       user.user?.email || null,
            displayName: user.profile?.displayName || user.user?.email?.split('@')[0] || null,
        });
    }

    renderUserInfo();
}

// Cablea la hamburguesa (antes vivía como <script> inline en cada HTML).
// Idempotente: paintRail puede llamarse 2× (shell instantáneo + reconcile) → bind UNA vez.
function wireSidebarToggle(sidebar) {
    const btn = document.getElementById('hamburger-btn');
    const backdrop = document.getElementById('sidebar-backdrop');
    if (!btn || !backdrop || wireSidebarToggle._done) return;
    wireSidebarToggle._done = true;
    const toggle = () => { sidebar.classList.toggle('is-open'); backdrop.classList.toggle('is-visible'); };
    btn.addEventListener('click', toggle);
    backdrop.addEventListener('click', toggle);
    sidebar.addEventListener('click', (e) => {
        if (e.target.closest('.adm-nav-link')) { sidebar.classList.remove('is-open'); backdrop.classList.remove('is-visible'); }
    });
}

function updateBadge() {
    // Leads que piden atención = en estado 'nuevo' (F4). Legacy sin status → por `read`.
    const pendientes = adminDb.getInquiries().filter(esPendiente).length;
    const badge  = document.getElementById('inq-badge');
    if (badge) {
        badge.textContent = pendientes > 9 ? '9+' : pendientes;
        badge.hidden = pendientes === 0;
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

    // El gating por rol lo hace renderSidebar() (los ítems no existen si el rol no aplica).
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

// Escapa también comillas: esc() se interpola en ATRIBUTOS (title="...", data-*)
// y una comilla sin escapar cierra el atributo (inyección de atributos, F6 frente D).
export function esc(str) {
    return String(str ?? '')
        .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
        .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
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

// A3 \u00a7TODO-33: pinta el men\u00fa AL INSTANTE al importar shared.js (m\u00f3dulos `defer` \u2192 DOM listo),
// ANTES de la cascada de auth de init(). As\u00ed el rail no "desaparece y demora" en cada navegaci\u00f3n.
renderSidebarShell();
