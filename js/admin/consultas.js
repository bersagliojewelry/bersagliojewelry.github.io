/**
 * Bersaglio Admin — Bandeja de leads (F4, ADR §53).
 *
 * Evoluciona la antigua "Consultas" a un pipeline de leads sobre la colección
 * `inquiries`: estados (Nuevo→Trabajando→Calificado→Cliente/Perdido), origen,
 * antigüedad/SLA simple, alta manual y "Convertir a cliente". El estado/color
 * vive en `lead-format.js`. Convertir y eliminar son admin-only (RBAC del CRM).
 */

import { requireAuth, initSidebar, admToast, esc, fmtDate, fmtDateTime, hasRole } from './shared.js';
import adminDb from './db.js';
import { createCliente } from '../crm-service.js';
import {
    leadStatus, LEAD_ESTADOS, LEAD_LABEL, leadBadgeHTML, origenLabel, diasDesde, estaDemorado,
} from './lead-format.js';

let _all    = [];
let _filter = 'todos';   // 'todos' | uno de LEAD_ESTADOS
let _query  = '';
let _activeId = null;
let _isAdmin = false;

async function init() {
    await requireAuth('editor');
    await adminDb.init();
    initSidebar();
    _isAdmin = hasRole('admin');

    _all = adminDb.getInquiries();
    render();
    adminDb.on('inquiries', list => { _all = list; render(); });

    wireFilters();
    wireSearch();
    wireModal();
    wireNuevoLead();

    document.getElementById('btn-export-csv').addEventListener('click', () => {
        adminDb.exportInquiriesCSV();
        admToast('Descargando la lista de interesados…');
    });
    // El alta manual es admin-only (Kary). Para editores se oculta el botón.
    const btnNuevo = document.getElementById('btn-nuevo-lead');
    if (btnNuevo && !_isAdmin) btnNuevo.hidden = true;
}

// ─── Tabla ──────────────────────────────────────────────────────────────────
function getFiltered() {
    const q = _query.trim().toLowerCase();
    return _all.filter(l => {
        const matchFilter = _filter === 'todos' || leadStatus(l) === _filter;
        const matchQ = !q
            || (l.name  || '').toLowerCase().includes(q)
            || (l.email || '').toLowerCase().includes(q)
            || (l.phone || '').toLowerCase().includes(q);
        return matchFilter && matchQ;
    });
}

function renderFiltrosCount() {
    // Cuenta por estado en cada chip (sobre el total, no el filtrado).
    const counts = { todos: _all.length };
    for (const e of LEAD_ESTADOS) counts[e] = 0;
    for (const l of _all) counts[leadStatus(l)]++;
    document.querySelectorAll('#inq-filters [data-filter]').forEach(btn => {
        const k = btn.getAttribute('data-filter');
        const span = btn.querySelector('.inq-chip-n');
        if (span) span.textContent = counts[k] ?? 0;
    });
}

function render() {
    renderFiltrosCount();
    const tbody = document.getElementById('inq-tbody');
    const empty = document.getElementById('inq-empty');
    const rows = getFiltered();

    empty.hidden = rows.length > 0;
    if (!rows.length) { tbody.innerHTML = ''; return; }

    tbody.innerHTML = rows.map(l => {
        const dias = diasDesde(l.createdAt);
        const edad = dias == null ? '' : (dias === 0 ? 'hoy' : `hace ${dias} d`);
        const demorado = estaDemorado(l) ? ' <span class="adm-pill adm-pill--red" title="Interesado nuevo sin atender">demorado</span>' : '';
        return `
        <tr data-id="${esc(l.id)}" style="cursor:pointer">
            <td class="adm-td-muted">${esc(fmtDate(l.createdAt))}<div style="font-size:11px;opacity:.7">${edad}</div></td>
            <td style="font-weight:500">${esc(l.name || 'Sin nombre')}${demorado}</td>
            <td class="adm-td-muted" style="font-size:12px">
                ${l.email ? `<div>${esc(l.email)}</div>` : ''}
                ${l.phone ? `<div>${esc(l.phone)}</div>` : ''}
                ${!l.email && !l.phone ? '—' : ''}
            </td>
            <td class="adm-td-muted">${esc(origenLabel(l.source))}</td>
            <td>${leadBadgeHTML(l)}</td>
            <td><button class="adm-btn adm-btn--ghost adm-btn--sm" data-view="${esc(l.id)}">Ver</button></td>
        </tr>`;
    }).join('');
}

function wireFilters() {
    document.getElementById('inq-filters').addEventListener('click', e => {
        const btn = e.target.closest('[data-filter]');
        if (!btn) return;
        _filter = btn.getAttribute('data-filter');
        document.querySelectorAll('#inq-filters [data-filter]').forEach(b => b.classList.toggle('is-active', b === btn));
        render();
    });
}

function wireSearch() {
    document.getElementById('search-input').addEventListener('input', e => {
        _query = e.target.value;
        render();
    });
}

// ─── Modal: ver/gestionar lead ───────────────────────────────────────────────
function leadActual() { return _all.find(l => l.id === _activeId) || null; }

function renderStatusBtns(l) {
    const cur = leadStatus(l);
    const cont = document.getElementById('inq-status-btns');
    // 'convertido' es estado de solo lectura (se llega con "Convertir a cliente").
    if (cur === 'convertido') {
        cont.innerHTML = '<span class="adm-pill adm-pill--green">Convertido a cliente</span>';
        return;
    }
    const manuales = ['nuevo', 'trabajando', 'calificado', 'perdido'];
    cont.innerHTML = manuales.map(s =>
        `<button type="button" class="adm-filter-btn${s === cur ? ' is-active' : ''}" data-set-status="${s}">${LEAD_LABEL[s]}</button>`
    ).join('');
}

function openModal(id) {
    const l = _all.find(x => x.id === id);
    if (!l) return;
    _activeId = id;

    document.getElementById('inq-modal-title').textContent = `Interesado · ${l.name || 'Sin nombre'}`;
    document.getElementById('inq-detail-name').textContent = l.name || '—';
    document.getElementById('inq-detail-date').textContent = fmtDateTime(l.createdAt);
    document.getElementById('inq-detail-email').textContent = l.email || '—';
    document.getElementById('inq-detail-phone').textContent = l.phone || '—';
    document.getElementById('inq-detail-origen').textContent = origenLabel(l.source);
    document.getElementById('inq-detail-message').textContent = l.message || '—';

    const pieceWrap = document.getElementById('inq-detail-piece-wrap');
    if (l.piece || l.pieceSlug) {
        document.getElementById('inq-detail-piece').textContent = l.piece || l.pieceSlug;
        pieceWrap.hidden = false;
    } else { pieceWrap.hidden = true; }

    renderStatusBtns(l);

    // WhatsApp
    const waBtn = document.getElementById('inq-modal-wa');
    if (l.phone) {
        const phone = String(l.phone).replace(/\D/g, '');
        const msg = encodeURIComponent(`Hola ${l.name || ''}, gracias por contactar a Bersaglio Jewelry. Estamos listos para ayudarte.`);
        waBtn.href = `https://wa.me/${phone}?text=${msg}`;
        waBtn.hidden = false;
    } else { waBtn.hidden = true; }

    // Convertir a cliente (admin-only; oculto si ya es cliente).
    const btnConv = document.getElementById('inq-modal-convert');
    const yaCliente = leadStatus(l) === 'convertido' || l.convertedTo;
    const linkFicha = document.getElementById('inq-modal-ficha');
    if (yaCliente && l.convertedTo) {
        btnConv.hidden = true;
        linkFicha.hidden = false;
        linkFicha.href = `admin-cuenta.html?id=${encodeURIComponent(l.convertedTo)}`;
    } else {
        linkFicha.hidden = true;
        btnConv.hidden = !_isAdmin || yaCliente;
    }
    // Eliminar: admin-only.
    document.getElementById('inq-modal-delete').hidden = !_isAdmin;

    document.getElementById('inq-modal').hidden = false;
}

function closeModal() { document.getElementById('inq-modal').hidden = true; _activeId = null; }

async function setStatus(status) {
    const l = leadActual();
    if (!l) return;
    try {
        await adminDb.updateInquiry(l.id, { status });
        // Sincroniza el estado local (evita parpadeo hasta que llegue el onSnapshot).
        const idx = _all.findIndex(x => x.id === l.id);
        if (idx >= 0) _all[idx] = { ..._all[idx], status };
        admToast(`Interesado marcado como "${LEAD_LABEL[status]}".`);
        renderStatusBtns({ ...l, status });
        render();
    } catch (err) {
        console.error('[bandeja] setStatus:', err);
        admToast('No se pudo actualizar el estado.', 'danger');
    }
}

async function convertir() {
    const l = leadActual();
    if (!l || !_isAdmin) return;
    // Idempotencia: si ya se convirtió, NO re-crear el cliente — solo abrir su ficha.
    if (l.convertedTo) {
        location.href = `admin-cuenta.html?id=${encodeURIComponent(l.convertedTo)}`;
        return;
    }
    const btn = document.getElementById('inq-modal-convert');
    btn.disabled = true;
    try {
        const cli = await createCliente({
            nombre: l.name || 'Sin nombre',
            telefono: l.phone || '',
            whatsapp: l.phone || '',
            notas: l.message ? `Lead web: ${l.message}` : '',
        });
        // El cliente YA existe (objetivo logrado). Marcar el lead es best-effort: si
        // falla, no perdemos el cliente — avisamos para marcarlo a mano (atomicidad
        // plena = CF transaccional, llega con F7). Igual navegamos a la ficha.
        try {
            await adminDb.updateInquiry(l.id, { status: 'convertido', convertedTo: cli.id });
            admToast('Interesado convertido en cliente.');
        } catch (markErr) {
            console.error('[bandeja] marcar lead convertido:', markErr);
            admToast('Cliente creado, pero no se pudo actualizar al interesado. Actualízalo a mano.', 'danger');
        }
        location.href = `admin-cuenta.html?id=${encodeURIComponent(cli.id)}`;
    } catch (err) {
        console.error('[bandeja] convertir:', err);
        admToast('No se pudo convertir. Puede que no tengas permiso para esta acción.', 'danger');
        btn.disabled = false;
    }
}

function wireModal() {
    document.getElementById('inq-modal-close').addEventListener('click', closeModal);
    document.getElementById('inq-modal').addEventListener('click', e => {
        if (e.target.id === 'inq-modal') closeModal();
    });
    document.getElementById('inq-status-btns').addEventListener('click', e => {
        const btn = e.target.closest('[data-set-status]');
        if (btn) setStatus(btn.getAttribute('data-set-status'));
    });
    document.getElementById('inq-modal-convert').addEventListener('click', convertir);
    document.getElementById('inq-modal-delete').addEventListener('click', async () => {
        const l = leadActual();
        if (!l) return;
        try {
            await adminDb.deleteInquiry(l.id);
            closeModal();
            admToast('Interesado eliminado.', 'danger');
        } catch (err) {
            console.error('[bandeja] delete:', err);
            admToast('No se pudo eliminar.', 'danger');
        }
    });
    // Delegación de la tabla → abrir modal.
    document.getElementById('inq-tbody').addEventListener('click', e => {
        const tr = e.target.closest('tr[data-id]');
        if (tr) openModal(tr.getAttribute('data-id'));
    });
}

// ─── Alta manual de lead (mostrador) ─────────────────────────────────────────
function wireNuevoLead() {
    const modal = document.getElementById('nuevo-modal');
    const open = () => { document.getElementById('nuevo-form').reset(); modal.hidden = false; document.getElementById('nl-nombre').focus(); };
    const close = () => { modal.hidden = true; };
    document.getElementById('btn-nuevo-lead').addEventListener('click', open);
    document.getElementById('nuevo-close').addEventListener('click', close);
    document.getElementById('nuevo-cancel').addEventListener('click', close);
    modal.addEventListener('click', e => { if (e.target.id === 'nuevo-modal') close(); });

    document.getElementById('nuevo-form').addEventListener('submit', async e => {
        e.preventDefault();
        const name = document.getElementById('nl-nombre').value.trim();
        if (!name) { admToast('El nombre es obligatorio.', 'danger'); return; }
        const btn = document.getElementById('nuevo-save');
        btn.disabled = true;
        try {
            await adminDb.addInquiry({
                name,
                phone:   document.getElementById('nl-telefono').value.trim(),
                email:   document.getElementById('nl-email').value.trim(),
                message: document.getElementById('nl-mensaje').value.trim(),
                source:  document.getElementById('nl-origen').value || 'mostrador',
            });
            admToast('Interesado agregado.');
            close();
        } catch (err) {
            console.error('[bandeja] nuevo lead:', err);
            admToast('No se pudo agregar el interesado.', 'danger');
        } finally {
            btn.disabled = false;
        }
    });
}

init();
