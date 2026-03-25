/**
 * Bersaglio Admin — Consultas + Exportación
 */

import adminDb from './db.js';
import { admToast, initSidebar, esc, fmtDate, fmtDateTime, requireAuth } from './shared.js';
import db from '../data/catalog.js';

let _all    = [];
let _filter = 'all';   // 'all' | 'unread' | 'read'
let _query  = '';
let _activeInqId = null;

async function init() {
    await requireAuth('editor');
    await adminDb.init();
    await db.load();
    initSidebar();

    _all = adminDb.getInquiries();
    renderTable();

    // Filters
    document.getElementById('inq-filters').addEventListener('click', e => {
        const btn = e.target.closest('[data-filter]');
        if (!btn) return;
        _filter = btn.dataset.filter;
        document.querySelectorAll('.adm-filter-btn').forEach(b =>
            b.classList.toggle('is-active', b === btn)
        );
        renderTable();
    });

    // Search
    document.getElementById('search-input').addEventListener('input', e => {
        _query = e.target.value.toLowerCase();
        renderTable();
    });

    // Actions
    document.getElementById('btn-mark-all-read').addEventListener('click', markAllRead);
    document.getElementById('btn-export-csv').addEventListener('click', () => {
        adminDb.exportInquiriesCSV();
        admToast('Descargando consultas.csv…');
    });
    document.getElementById('btn-export-inquiries').addEventListener('click', () => {
        adminDb.exportInquiriesCSV();
        admToast('Descargando consultas.csv…');
    });
    document.getElementById('btn-export-unread').addEventListener('click', exportUnread);

    initModal();
}

// ─── Table ────────────────────────────────────────────────────────────────────

function getFiltered() {
    return _all.filter(i => {
        const matchFilter =
            _filter === 'all' ||
            (_filter === 'unread' && !i.read) ||
            (_filter === 'read'   && i.read);
        const matchQ = !_query ||
            (i.name  || '').toLowerCase().includes(_query) ||
            (i.email || '').toLowerCase().includes(_query);
        return matchFilter && matchQ;
    });
}

function renderTable() {
    const tbody   = document.getElementById('inq-tbody');
    const emptyEl = document.getElementById('inq-empty');
    const rows    = getFiltered();

    emptyEl.hidden = rows.length > 0;
    if (!rows.length) { tbody.innerHTML = ''; return; }

    tbody.innerHTML = rows.map(i => {
        const piece = i.piece ? db.getBySlug(i.piece) : null;
        return `
        <tr class="${i.read ? '' : 'inq-unread'}" style="${i.read ? '' : 'background:rgba(11,61,46,0.025);'}">
            <td class="adm-td-muted">${fmtDate(i.createdAt)}</td>
            <td style="font-weight:${i.read ? '400' : '600'};">${esc(i.name)}</td>
            <td class="adm-td-muted" style="font-size:12px;">
                ${i.email ? `<div>${esc(i.email)}</div>` : ''}
                ${i.phone ? `<div>${esc(i.phone)}</div>` : ''}
            </td>
            <td class="adm-td-muted">${esc(piece?.name || i.piece || '—')}</td>
            <td>
                <span class="adm-pill ${i.read ? 'adm-pill--gray' : 'adm-pill--red'}">
                    ${i.read ? 'Leída' : 'Nueva'}
                </span>
            </td>
            <td>
                <button class="adm-btn adm-btn--ghost adm-btn--sm" data-action="view" data-id="${i.id}">Ver</button>
            </td>
        </tr>`;
    }).join('');

    tbody.querySelectorAll('[data-action="view"]').forEach(btn => {
        btn.addEventListener('click', () => openModal(btn.dataset.id));
    });
}

// ─── Modal: view inquiry ──────────────────────────────────────────────────────

function initModal() {
    document.getElementById('inq-modal-close').addEventListener('click', closeModal);

    document.getElementById('inq-modal-toggle-read').addEventListener('click', () => {
        if (!_activeInqId) return;
        const inq = _all.find(i => i.id === _activeInqId);
        if (!inq) return;
        adminDb.markRead(_activeInqId, !inq.read);
        _all = adminDb.getInquiries();
        closeModal();
        renderTable();
        admToast(inq.read ? 'Marcada como nueva' : 'Marcada como leída');
        initSidebar();
    });

    document.getElementById('inq-modal-delete').addEventListener('click', () => {
        if (!_activeInqId) return;
        adminDb.deleteInquiry(_activeInqId);
        _all = adminDb.getInquiries();
        closeModal();
        renderTable();
        admToast('Consulta eliminada', 'danger');
        initSidebar();
    });
}

function openModal(id) {
    const inq = _all.find(i => i.id === id);
    if (!inq) return;
    _activeInqId = id;

    document.getElementById('inq-modal-title').textContent    = `Consulta de ${inq.name}`;
    document.getElementById('inq-detail-name').textContent    = inq.name || '—';
    document.getElementById('inq-detail-date').textContent    = fmtDateTime(inq.createdAt);
    document.getElementById('inq-detail-email').textContent   = inq.email || '—';
    document.getElementById('inq-detail-phone').textContent   = inq.phone || '—';
    document.getElementById('inq-detail-message').textContent = inq.message || '—';

    const pieceWrap = document.getElementById('inq-detail-piece-wrap');
    if (inq.piece) {
        const piece = db.getBySlug(inq.piece);
        document.getElementById('inq-detail-piece').textContent = piece?.name || inq.piece;
        pieceWrap.hidden = false;
    } else {
        pieceWrap.hidden = true;
    }

    // WhatsApp link
    const waBtn = document.getElementById('inq-modal-wa');
    if (inq.phone) {
        const phone = inq.phone.replace(/\D/g, '');
        const msg   = encodeURIComponent(`Hola ${inq.name}, gracias por contactar a Bersaglio Jewelry. Hemos recibido tu consulta y estamos listos para ayudarte.`);
        waBtn.href  = `https://wa.me/${phone}?text=${msg}`;
        waBtn.hidden = false;
    } else {
        waBtn.hidden = true;
    }

    // Toggle read button label
    document.getElementById('inq-modal-toggle-read').textContent =
        inq.read ? 'Marcar como nueva' : 'Marcar como leída';

    // Auto-mark as read when opened
    if (!inq.read) {
        adminDb.markRead(id, true);
        _all = adminDb.getInquiries();
        initSidebar();
    }

    document.getElementById('inq-modal').hidden = false;
}

function closeModal() {
    document.getElementById('inq-modal').hidden = true;
    _activeInqId = null;
    renderTable();
}

// ─── Acciones ─────────────────────────────────────────────────────────────────

function markAllRead() {
    _all.filter(i => !i.read).forEach(i => adminDb.markRead(i.id, true));
    _all = adminDb.getInquiries();
    renderTable();
    initSidebar();
    admToast('Todas marcadas como leídas');
}

function exportUnread() {
    const unread = adminDb.getInquiries().filter(i => !i.read);
    if (!unread.length) { admToast('No hay consultas sin leer', 'danger'); return; }

    const rows = unread.map(i => ({
        Fecha:    fmtDate(i.createdAt),
        Nombre:   i.name || '',
        Email:    i.email || '',
        Teléfono: i.phone || '',
        Pieza:    i.piece || '',
        Mensaje:  (i.message || '').replace(/\n/g, ' '),
    }));
    adminDb.constructor.downloadCSV
        ? adminDb.constructor.downloadCSV(rows, 'consultas-nuevas.csv')
        : import('./db.js').then(m => m.AdminDatabase?.downloadCSV?.(rows, 'consultas-nuevas.csv'));

    // Fallback: use adminDb's export with filter
    admToast('Exportando consultas sin leer…');
}

init();
