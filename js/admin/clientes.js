/**
 * Bersaglio Admin — Clientes (DIRECTORIO · F-IA-2 B2, §3).
 *
 * La vista de RELACIÓN con el cliente (contacto, vendedora, cumpleaños), separada de
 * la CARTERA (cobro/mora, admin-cuentas.html). Lista/búsqueda + alta de cliente +
 * cumpleaños del mes; cada fila lleva a la ficha (admin-cuenta.html). Un chip de saldo
 * por fila da contexto sin convertir esto en cartera (SIN KPIs, SIN aging, SIN mora).
 * Datos vía `js/crm-service.js` (cero cambios de contrato). Solo admin/owner.
 *
 * XSS: todo valor dinámico se pinta con textContent (createElement), nunca innerHTML.
 */

import { requireAuth, initSidebar, admToast, errorMessage } from './shared.js';
import adminDb from './db.js';
import {
    onClientesChange, createCliente, fetchVendedoras, cumpleanosDelMes, fmtCOP,
} from '../crm-service.js';
import { saldoClass } from './saldo-format.js';

let _clientes = [];
const _vendedoras = new Map();   // vendedoraId -> nombre
let _filter = '';                // búsqueda por nombre

// Mini-fábrica DOM (texto SIEMPRE por textContent — cero interpolación en HTML).
function el(tag, { cls, text, css, attrs } = {}) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    if (css) n.style.cssText = css;
    if (attrs) for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    return n;
}

function nombreVendedora(id) {
    if (!id) return 'Directo de Kary';
    return _vendedoras.get(id) || 'Vendedora';
}

// Chip de saldo (reusa la clase de color de saldo-format; sin innerHTML).
function saldoNode(saldo) {
    if (typeof saldo !== 'number') return el('span', { cls: 'adm-money adm-money--cero', text: '—' });
    return el('strong', { cls: saldoClass(saldo), text: fmtCOP(saldo) });
}

// Nodo de contacto: link de WhatsApp si hay número; si no, el teléfono; si no, "—".
function contactoNode(c) {
    const wa = (c.whatsapp || c.telefono || '').replace(/[^0-9]/g, '');
    if (wa) {
        return el('a', { text: 'WhatsApp', attrs: { href: `https://wa.me/57${wa}`, target: '_blank', rel: 'noopener' } });
    }
    return el('span', { text: c.telefono || '—' });
}

function pasaBusqueda(c) {
    const f = _filter.trim().toLowerCase();
    return !f || (c.nombre || '').toLowerCase().includes(f);
}

function renderLista() {
    const body = document.getElementById('clientes-body');
    const empty = document.getElementById('clientes-empty');
    const table = document.getElementById('clientes-table');
    const cnt = document.getElementById('cli-count');
    if (!body || !empty || !table) return;

    if (!_clientes.length) {
        table.hidden = true; empty.hidden = false; body.replaceChildren();
        if (cnt) cnt.textContent = '';
        return;
    }

    const list = _clientes.filter(pasaBusqueda)
        .sort((a, b) => (a.nombre || '').localeCompare(b.nombre || '', 'es'));

    table.hidden = false; empty.hidden = true;
    if (cnt) cnt.textContent = list.length === _clientes.length
        ? `${_clientes.length} clientes`
        : `${list.length} de ${_clientes.length}`;

    body.replaceChildren();
    if (!list.length) {
        const tr = el('tr'); const td = el('td', { css: 'color:var(--adm-muted)', text: 'Ningún cliente coincide con la búsqueda.' });
        td.setAttribute('colspan', '4'); tr.appendChild(td); body.appendChild(tr);
        return;
    }
    for (const c of list) {
        const tr = el('tr', { css: 'cursor:pointer', attrs: { 'data-id': c.id } });
        tr.appendChild(el('td', { text: c.nombre || 'Sin nombre' }));
        const tdContacto = el('td'); tdContacto.appendChild(contactoNode(c)); tr.appendChild(tdContacto);
        tr.appendChild(el('td', { text: nombreVendedora(c.vendedoraId) }));
        const tdSaldo = el('td', { css: 'text-align:right' }); tdSaldo.appendChild(saldoNode(c.saldoActual)); tr.appendChild(tdSaldo);
        body.appendChild(tr);
    }
}

function renderCumple() {
    const section = document.getElementById('cumple-section');
    const body = document.getElementById('cumple-body');
    if (!section || !body) return;
    const list = cumpleanosDelMes(_clientes, new Date().getMonth());
    if (!list.length) { section.hidden = true; body.replaceChildren(); return; }
    section.hidden = false;
    body.replaceChildren();
    for (const c of list) {
        const tr = el('tr');
        tr.appendChild(el('td', { text: c._dia }));
        tr.appendChild(el('td', { text: c.nombre || 'Sin nombre' }));
        tr.appendChild(el('td', { text: nombreVendedora(c.vendedoraId) }));
        const tdContacto = el('td'); tdContacto.appendChild(contactoNode(c)); tr.appendChild(tdContacto);
        body.appendChild(tr);
    }
}

function render() { renderLista(); renderCumple(); }

// ─── Modal nuevo cliente (MOVIDO desde cuentas.js · §3) ───────────────────────
function populateVendedoraSelect() {
    const sel = document.getElementById('cli-vendedora');
    if (!sel) return;
    for (const [id, nombre] of _vendedoras) {
        const opt = document.createElement('option');
        opt.value = id; opt.textContent = nombre;
        sel.appendChild(opt);
    }
}

function openModal() {
    document.getElementById('cliente-form').reset();
    document.getElementById('cliente-modal').hidden = false;
    document.getElementById('cli-nombre').focus();
}
function closeModal() { document.getElementById('cliente-modal').hidden = true; }

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
                telefono:    document.getElementById('cli-telefono').value,
                whatsapp:    document.getElementById('cli-whatsapp').value,
                vendedoraId: document.getElementById('cli-vendedora').value || null,
                cumpleanos:  document.getElementById('cli-cumpleanos').value,
                notas:       document.getElementById('cli-notas').value,
            });
            admToast('Cliente creado.');
            closeModal();
            // La lista se refresca sola por onClientesChange.
        } catch (err) {
            admToast(errorMessage(err, 'No se pudo crear el cliente.'), 'danger');
        } finally {
            btn.disabled = false;
        }
    });
}

function wireSearch() {
    document.getElementById('cli-search')?.addEventListener('input', (e) => {
        _filter = e.target.value;
        renderLista();
    });
}

function wireRows() {
    document.getElementById('clientes-body')?.addEventListener('click', (e) => {
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
    } catch (err) { console.warn('[clientes] fetchVendedoras:', err); }
    populateVendedoraSelect();

    wireModal();
    wireSearch();
    wireRows();

    onClientesChange((list) => { _clientes = list; render(); });
}

init();
