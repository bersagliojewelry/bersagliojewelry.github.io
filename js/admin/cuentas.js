/**
 * Bersaglio Admin — Cuentas por cobrar (Panel de Kary · CRM Bloque 3).
 *
 * Pantalla de entrada del CRM: cartera total + por vendedora + lista de clientes
 * con su saldo (desnormalizado, calculado por la Cloud Function). Solo admin/owner.
 * Datos vía el módulo desacoplado `js/crm-service.js`.
 */

import { requireAuth, initSidebar, admToast, esc } from './shared.js';
import adminDb from './db.js';
import {
    onClientesChange, createCliente, fetchVendedoras,
    fmtCOP, carteraTotals, carteraPorVendedora, cumpleanosDelMes,
} from '../crm-service.js';
import { saldoCellHTML } from './saldo-format.js';

let _clientes = [];
const _vendedoras = new Map();   // vendedoraId -> nombre
let _filter = '';

function nombreVendedora(id) {
    if (!id) return 'Directo de Kary';
    return _vendedoras.get(id) || 'Vendedora';
}

function saldoCell(saldo) {
    if (typeof saldo !== 'number') return '<span class="adm-money adm-money--cero">—</span>';
    return saldoCellHTML(saldo);
}

function renderStats() {
    const t = carteraTotals(_clientes);
    document.getElementById('stat-por-cobrar').textContent = fmtCOP(t.porCobrar);
    document.getElementById('stat-clientes').textContent = String(t.clientes);
    document.getElementById('stat-a-favor').textContent = fmtCOP(Math.abs(t.aFavor));
}

function renderCarteraVendedora() {
    const map = carteraPorVendedora(_clientes);
    const rows = [...map.entries()]
        .sort((a, b) => b[1].porCobrar - a[1].porCobrar)
        .map(([key, v]) => {
            const nombre = key === '__kary__' ? 'Directo de Kary' : nombreVendedora(key);
            return `<tr><td>${esc(nombre)}</td><td>${v.clientes}</td>
                    <td style="text-align:right"><strong>${esc(fmtCOP(v.porCobrar))}</strong></td></tr>`;
        }).join('');
    document.getElementById('cartera-vendedora-body').innerHTML =
        rows || '<tr><td colspan="3" style="color:var(--adm-muted)">Sin datos todavía.</td></tr>';
}

function renderClientes() {
    const body = document.getElementById('clientes-body');
    const empty = document.getElementById('clientes-empty');
    const table = document.getElementById('clientes-table');

    const f = _filter.trim().toLowerCase();
    const list = (f
        ? _clientes.filter(c => (c.nombre || '').toLowerCase().includes(f))
        : _clientes
    ).slice().sort((a, b) => (a.nombre || '').localeCompare(b.nombre || '', 'es'));

    if (!_clientes.length) {
        table.hidden = true; empty.hidden = false;
        body.innerHTML = '';
        return;
    }
    table.hidden = false; empty.hidden = true;

    body.innerHTML = list.map(c => `
        <tr data-id="${esc(c.id)}" style="cursor:pointer">
            <td>${esc(c.nombre || 'Sin nombre')}</td>
            <td>${esc(nombreVendedora(c.vendedoraId))}</td>
            <td>${esc(c.telefono || c.whatsapp || '—')}</td>
            <td style="text-align:right">${saldoCell(c.saldoActual)}</td>
        </tr>
    `).join('') || `<tr><td colspan="4" style="color:var(--adm-muted)">Sin coincidencias para "${esc(_filter)}".</td></tr>`;
}


function renderCumple() {
    const section = document.getElementById('cumple-section');
    const body = document.getElementById('cumple-body');
    const mes = new Date().getMonth();
    const list = cumpleanosDelMes(_clientes, mes);
    if (!list.length) { section.hidden = true; body.innerHTML = ''; return; }
    section.hidden = false;
    body.innerHTML = list.map(c => {
        const wa = (c.whatsapp || c.telefono || '').replace(/[^0-9]/g, '');
        const contacto = wa
            ? `<a href="https://wa.me/57${esc(wa)}" target="_blank" rel="noopener">WhatsApp</a>`
            : (c.telefono ? esc(c.telefono) : '—');
        return `<tr><td>${c._dia}</td><td>${esc(c.nombre || 'Sin nombre')}</td>
                <td>${esc(nombreVendedora(c.vendedoraId))}</td><td>${contacto}</td></tr>`;
    }).join('');
}

function render() {
    renderStats();
    renderCarteraVendedora();
    renderClientes();
    renderCumple();
}

function populateVendedoraSelect() {
    const sel = document.getElementById('cli-vendedora');
    if (!sel) return;
    for (const [id, nombre] of _vendedoras) {
        const opt = document.createElement('option');
        opt.value = id; opt.textContent = nombre;
        sel.appendChild(opt);
    }
}

// ─── Modal nuevo cliente ──────────────────────────────────────────────────────
function openModal() {
    document.getElementById('cliente-form').reset();
    document.getElementById('cliente-modal').hidden = false;
    document.getElementById('cli-nombre').focus();
}
function closeModal() {
    document.getElementById('cliente-modal').hidden = true;
}

function wireModal() {
    document.getElementById('btn-nuevo-cliente').addEventListener('click', openModal);
    document.getElementById('cliente-modal-close').addEventListener('click', closeModal);
    document.getElementById('cliente-cancel').addEventListener('click', closeModal);
    document.getElementById('cliente-modal').addEventListener('click', (e) => {
        if (e.target.id === 'cliente-modal') closeModal();
    });

    document.getElementById('cliente-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const nombre = document.getElementById('cli-nombre').value.trim();
        if (!nombre) { admToast('El nombre es obligatorio.', 'danger'); return; }

        const btn = document.getElementById('cliente-save');
        btn.disabled = true;
        try {
            await createCliente({
                nombre,
                telefono:   document.getElementById('cli-telefono').value,
                whatsapp:   document.getElementById('cli-whatsapp').value,
                vendedoraId: document.getElementById('cli-vendedora').value || null,
                cumpleanos: document.getElementById('cli-cumpleanos').value,
                notas:      document.getElementById('cli-notas').value,
            });
            admToast('Cliente creado.');
            closeModal();
            // La lista se refresca sola por onClientesChange.
        } catch (err) {
            console.error('[cuentas] createCliente:', err);
            admToast('No se pudo crear el cliente.', 'danger');
        } finally {
            btn.disabled = false;
        }
    });
}

function wireSearch() {
    document.getElementById('cli-search').addEventListener('input', (e) => {
        _filter = e.target.value;
        renderClientes();
    });
}

function wireRows() {
    document.getElementById('clientes-body').addEventListener('click', (e) => {
        const tr = e.target.closest('tr[data-id]');
        if (!tr) return;
        location.href = `admin-cuenta.html?id=${encodeURIComponent(tr.getAttribute('data-id'))}`;
    });
}


async function init() {
    await requireAuth('admin');
    await adminDb.init();      // mantiene el badge de consultas del sidebar
    initSidebar();

    try {
        (await fetchVendedoras())
            .filter(v => v.activa !== false)
            .forEach(v => _vendedoras.set(v.id, v.nombre || 'Vendedora'));
    } catch (err) {
        console.warn('[cuentas] fetchVendedoras:', err);
    }
    populateVendedoraSelect();

    wireModal();
    wireSearch();
    wireRows();

    onClientesChange(list => { _clientes = list; render(); });
}

init();
