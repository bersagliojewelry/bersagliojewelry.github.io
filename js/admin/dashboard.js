/**
 * Bersaglio Admin — Dashboard (real-time)
 */

import adminDb from './db.js';
import { admToast, initSidebar, requireAuth } from './shared.js';

async function init() {
    await requireAuth('editor');
    await adminDb.init();
    initSidebar();

    // Initial render
    updateStats(adminDb.getStats());
    renderRecentInquiries(adminDb.getInquiries().slice(0, 5));

    // Real-time: stats update when any data changes
    adminDb.on('stats', updateStats);

    // Real-time: inquiries update
    adminDb.on('inquiries', inquiries => {
        renderRecentInquiries(inquiries.slice(0, 5));
    });

    // Quick export
    document.getElementById('btn-export-quick')?.addEventListener('click', () => {
        adminDb.exportPiecesCSV();
        admToast('Descargando piezas.csv\u2026');
    });
}

function updateStats(stats) {
    const el = (id, val) => {
        const e = document.getElementById(id);
        if (e) e.textContent = val;
    };
    el('stat-total-piezas', stats.totalPieces);
    el('stat-destacadas', stats.featuredPieces);
    el('stat-colecciones', stats.collections);
    el('stat-consultas', stats.unread);
}

function renderRecentInquiries(inquiries) {
    const tbody = document.getElementById('recent-inquiries-body');
    if (!tbody) return;

    if (!inquiries.length) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--adm-muted);padding:24px;">No hay consultas a\u00fan.</td></tr>`;
        return;
    }

    tbody.innerHTML = inquiries.map(i => `
        <tr>
            <td class="adm-td-muted">${fmtDate(i.createdAt)}</td>
            <td style="font-weight:500;">${esc(i.name)}</td>
            <td class="adm-td-muted">${esc(i.piece || i.pieceSlug || '\u2014')}</td>
            <td>
                <span class="adm-pill ${i.read ? 'adm-pill--gray' : 'adm-pill--red'}">
                    ${i.read ? 'Le\u00edda' : 'Nueva'}
                </span>
            </td>
            <td>
                <a href="admin-consultas.html" class="adm-btn adm-btn--ghost adm-btn--sm">Ver</a>
            </td>
        </tr>
    `).join('');
}

function fmtDate(iso) {
    if (!iso) return '\u2014';
    const d = iso.toDate ? iso.toDate() : new Date(iso);
    return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
}

function esc(str) {
    return String(str ?? '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

init();
