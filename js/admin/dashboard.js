/**
 * Bersaglio Admin — Dashboard
 */

import adminDb from './db.js';
import { admToast, initSidebar, requireAuth } from './shared.js';

async function init() {
    await requireAuth('editor');
    await adminDb.init();
    initSidebar();

    // Stats
    const stats = adminDb.getStats();
    document.getElementById('stat-total-piezas').textContent = stats.totalPieces;
    document.getElementById('stat-destacadas').textContent   = stats.featuredPieces;
    document.getElementById('stat-colecciones').textContent  = stats.collections;
    document.getElementById('stat-consultas').textContent    = stats.unread;

    // Recent inquiries (last 5)
    renderRecentInquiries(adminDb.getInquiries().slice(0, 5));

    // Quick export
    document.getElementById('btn-export-quick')?.addEventListener('click', () => {
        adminDb.exportPiecesCSV();
        admToast('Descargando piezas.csv…');
    });
}

function renderRecentInquiries(inquiries) {
    const tbody = document.getElementById('recent-inquiries-body');
    if (!tbody) return;

    if (!inquiries.length) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--adm-muted);padding:24px;">No hay consultas aún.</td></tr>`;
        return;
    }

    tbody.innerHTML = inquiries.map(i => `
        <tr>
            <td class="adm-td-muted">${fmtDate(i.createdAt)}</td>
            <td style="font-weight:500;">${esc(i.name)}</td>
            <td class="adm-td-muted">${esc(i.piece || '—')}</td>
            <td>
                <span class="adm-pill ${i.read ? 'adm-pill--gray' : 'adm-pill--red'}">
                    ${i.read ? 'Leída' : 'Nueva'}
                </span>
            </td>
            <td>
                <a href="admin-consultas.html" class="adm-btn adm-btn--ghost adm-btn--sm">Ver</a>
            </td>
        </tr>
    `).join('');
}

function fmtDate(iso) {
    return new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
}

function esc(str) {
    return String(str ?? '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

init();
