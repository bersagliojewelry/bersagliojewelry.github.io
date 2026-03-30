/**
 * Bersaglio Admin — Consultas + Exportacion (real-time)
 */

import adminDb from './db.js';
import { admToast, initSidebar, esc, fmtDate, fmtDateTime, requireAuth } from './shared.js';

let _all    = [];
let _filter = 'all';
let _query  = '';
let _activeInqId = null;

async function init() {
    await requireAuth('editor');
    await adminDb.init();
    initSidebar();

    _all = adminDb.getInquiries();
    renderTable();

    // Real-time: re-render when inquiries change
    adminDb.on('inquiries', inquiries => {
        _all = inquiries;
        renderTable();
        updateSidebarBadge();
    });

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
        admToast('Descargando consultas.csv\u2026');
    });
    document.getElementById('btn-export-inquiries').addEventListener('click', () => {
        adminDb.exportInquiriesCSV();
        admToast('Descargando consultas.csv\u2026');
    });
    document.getElementById('btn-export-unread').addEventListener('click', exportUnread);

    initModal();
}

function updateSidebarBadge() {
    const unread = _all.filter(i => !i.read).length;
    const badge  = document.getElementById('inq-badge');
    if (badge) {
        badge.textContent = unread > 9 ? '9+' : unread;
        badge.hidden = unread === 0;
    }
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
        const pieceName = i.piece || i.pieceSlug || '\u2014';
        return `
        <tr class="${i.read ? '' : 'inq-unread'}" style="${i.read ? '' : 'background:rgba(11,61,46,0.025);'}">
            <td class="adm-td-muted">${fmtDate(i.createdAt)}</td>
            <td style="font-weight:${i.read ? '400' : '600'};">${esc(i.name)}</td>
            <td class="adm-td-muted" style="font-size:12px;">
                ${i.email ? `<div>${esc(i.email)}</div>` : ''}
                ${i.phone ? `<div>${esc(i.phone)}</div>` : ''}
            </td>
            <td class="adm-td-muted">${esc(pieceName)}</td>
            <td>
                <span class="adm-pill ${i.read ? 'adm-pill--gray' : 'adm-pill--red'}">
                    ${i.read ? 'Le\u00edda' : 'Nueva'}
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

    document.getElementById('inq-modal-toggle-read').addEventListener('click', async () => {
        if (!_activeInqId) return;
        const inq = _all.find(i => i.id === _activeInqId);
        if (!inq) return;
        try {
            await adminDb.markRead(_activeInqId, !inq.read);
            closeModal();
            admToast(inq.read ? 'Marcada como nueva' : 'Marcada como le\u00edda');
        } catch (err) {
            admToast('Error al actualizar', 'danger');
        }
    });

    document.getElementById('inq-modal-delete').addEventListener('click', async () => {
        if (!_activeInqId) return;
        try {
            await adminDb.deleteInquiry(_activeInqId);
            closeModal();
            admToast('Consulta eliminada', 'danger');
        } catch (err) {
            admToast('Error al eliminar', 'danger');
        }
    });
}

function openModal(id) {
    const inq = _all.find(i => i.id === id);
    if (!inq) return;
    _activeInqId = id;

    document.getElementById('inq-modal-title').textContent    = `Consulta de ${inq.name}`;
    document.getElementById('inq-detail-name').textContent    = inq.name || '\u2014';
    document.getElementById('inq-detail-date').textContent    = fmtDateTime(inq.createdAt);
    document.getElementById('inq-detail-email').textContent   = inq.email || '\u2014';
    document.getElementById('inq-detail-phone').textContent   = inq.phone || '\u2014';
    document.getElementById('inq-detail-message').textContent = inq.message || '\u2014';

    const pieceWrap = document.getElementById('inq-detail-piece-wrap');
    if (inq.piece || inq.pieceSlug) {
        document.getElementById('inq-detail-piece').textContent = inq.piece || inq.pieceSlug;
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
        inq.read ? 'Marcar como nueva' : 'Marcar como le\u00edda';

    // Auto-mark as read when opened
    if (!inq.read) {
        adminDb.markRead(id, true);
    }

    document.getElementById('inq-modal').hidden = false;
}

function closeModal() {
    document.getElementById('inq-modal').hidden = true;
    _activeInqId = null;
}

// ─── Acciones ─────────────────────────────────────────────────────────────────

async function markAllRead() {
    const unread = _all.filter(i => !i.read);
    try {
        await Promise.all(unread.map(i => adminDb.markRead(i.id, true)));
        admToast('Todas marcadas como le\u00eddas');
    } catch (err) {
        admToast('Error al marcar', 'danger');
    }
}

function exportUnread() {
    const unread = _all.filter(i => !i.read);
    if (!unread.length) { admToast('No hay consultas sin leer', 'danger'); return; }

    const rows = unread.map(i => ({
        Fecha:    fmtDate(i.createdAt),
        Nombre:   i.name || '',
        Email:    i.email || '',
        'Telefono': i.phone || '',
        Pieza:    i.piece || i.pieceSlug || '',
        Mensaje:  (i.message || '').replace(/\n/g, ' '),
    }));
    AdminDatabase.downloadCSV(rows, 'consultas-nuevas.csv');
    admToast('Exportando consultas sin leer\u2026');
}

const AdminDatabase = { downloadCSV: (rows, fn) => adminDb.constructor.downloadCSV(rows, fn) };

init();
