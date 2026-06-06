/**
 * Bersaglio — App de vendedora · helpers UI mínimos (decouplados del admin).
 * Reusa las clases .adm-toast de css/admin.css; confirm nativo (simple en móvil).
 */

export function esc(s) {
    return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function fmtDateTime(val) {
    if (!val) return '—';
    const d = val.toDate ? val.toDate() : new Date(val);
    return d.toLocaleString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export function toast(msg, type = 'success', ms = 2600) {
    const wrap = document.getElementById('toast-wrap');
    if (!wrap) { return; }
    const el = document.createElement('div');
    el.className = `adm-toast adm-toast--${type}`;
    el.textContent = msg;
    wrap.appendChild(el);
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('adm-toast--visible')));
    setTimeout(() => {
        el.classList.remove('adm-toast--visible');
        el.addEventListener('transitionend', () => el.remove(), { once: true });
    }, ms);
}

export function confirmAction(msg, onOk) {
    if (window.confirm(msg)) onOk();
}
