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
    onClientesChange, createCliente, fetchVendedoras, onAllMovimientosChange, getConfig,
    fmtCOP, carteraTotals, carteraPorVendedora, cumpleanosDelMes,
} from '../crm-service.js';
import { saldoCellHTML, estadoBadgeHTML } from './saldo-format.js';
import { estadoCuenta } from '../crm-estado-cuenta.js';

let _clientes = [];
const _vendedoras = new Map();   // vendedoraId -> nombre
const _estados = new Map();      // clienteId -> estadoCuenta (mora, calculado al cargar)
let _diasPlazo = 30;             // config/negocio.diasPlazo
let _fechaCorte = null;          // config/negocio.fechaCorteMigracion (fallback de fecha)
let _filter = '';                // búsqueda por nombre
let _filterEstado = 'todos';     // todos | vencido | aldia | favor
let _filterRango = 'todos';      // todos | d1_30 | d31_60 | d60plus
let _filterVendedora = '';       // '' (todas) | vendedoraId | '__kary__'

// Estado de mora de un cliente (objeto estadoCuenta); null si aún no se calculó.
function estadoDe(id) { return _estados.get(id) || null; }

// ¿El cliente pasa los filtros activos (estado + rango de mora + vendedora + búsqueda)?
function pasaFiltros(c) {
    const e = estadoDe(c.id);
    const saldo = typeof c.saldoActual === 'number' ? c.saldoActual : 0;

    if (_filterEstado === 'vencido' && !(e && e.estado === 'vencido')) return false;
    if (_filterEstado === 'aldia'   && !(saldo > 0 && (!e || e.estado === 'al-dia'))) return false;
    if (_filterEstado === 'favor'   && !(saldo < 0)) return false;

    if (_filterRango !== 'todos' && !(e && e.buckets[_filterRango] > 0)) return false;

    if (_filterVendedora && (c.vendedoraId || '__kary__') !== _filterVendedora) return false;

    const f = _filter.trim().toLowerCase();
    if (f && !(c.nombre || '').toLowerCase().includes(f)) return false;

    return true;
}

// Recalcula la mora por cliente desde TODOS los movimientos (en vivo).
function rebuildEstados(movs) {
    _estados.clear();
    const byCliente = new Map();
    for (const m of movs) {
        if (!m.clienteId) continue;
        if (!byCliente.has(m.clienteId)) byCliente.set(m.clienteId, []);
        byCliente.get(m.clienteId).push(m);
    }
    for (const [cid, lst] of byCliente) {
        _estados.set(cid, estadoCuenta(lst, { diasPlazo: _diasPlazo, fechaCorte: _fechaCorte }));
    }
}

function nombreVendedora(id) {
    if (!id) return 'Directo de Kary';
    return _vendedoras.get(id) || 'Vendedora';
}

function saldoCell(saldo) {
    if (typeof saldo !== 'number') return '<span class="adm-money adm-money--cero">—</span>';
    return saldoCellHTML(saldo);
}

// Totales de cartera vencida (suma de la mora de todos los clientes).
function carteraVencida() {
    let vencido = 0, d1_30 = 0, d31_60 = 0, d60plus = 0;
    for (const e of _estados.values()) {
        vencido += e.vencido;
        d1_30 += e.buckets.d1_30; d31_60 += e.buckets.d31_60; d60plus += e.buckets.d60plus;
    }
    return { vencido, d1_30, d31_60, d60plus };
}

function renderStats() {
    const t = carteraTotals(_clientes);
    document.getElementById('stat-por-cobrar').textContent = fmtCOP(t.porCobrar);
    document.getElementById('stat-clientes').textContent = String(t.clientes);
    document.getElementById('stat-a-favor').textContent = fmtCOP(Math.abs(t.aFavor));

    const v = carteraVencida();
    document.getElementById('stat-vencida').textContent = fmtCOP(v.vencido);
    document.getElementById('stat-vencida-desglose').innerHTML = v.vencido > 0
        ? `1-30: ${esc(fmtCOP(v.d1_30))} · 31-60: ${esc(fmtCOP(v.d31_60))} · +60: ${esc(fmtCOP(v.d60plus))}`
        : 'Todo al día';
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

    if (!_clientes.length) {
        table.hidden = true; empty.hidden = false;
        body.innerHTML = '';
        const c0 = document.getElementById('cli-count'); if (c0) c0.textContent = '';
        return;
    }

    // Filtra (estado/rango/vendedora/búsqueda) y ordena por MORA (vencidos primero) →
    // más vencido a menos; luego saldo; luego nombre.
    const list = _clientes.filter(pasaFiltros).sort((a, b) => {
        const ea = estadoDe(a.id), eb = estadoDe(b.id);
        const ma = ea ? ea.diasMora : 0, mb = eb ? eb.diasMora : 0;
        const va = ea ? ea.vencido : 0, vb = eb ? eb.vencido : 0;
        const sa = typeof a.saldoActual === 'number' ? a.saldoActual : 0;
        const sb = typeof b.saldoActual === 'number' ? b.saldoActual : 0;
        return (mb - ma) || (vb - va) || (sb - sa)
            || (a.nombre || '').localeCompare(b.nombre || '', 'es');
    });

    table.hidden = false; empty.hidden = true;
    const cnt = document.getElementById('cli-count');
    if (cnt) cnt.textContent = list.length === _clientes.length
        ? `${_clientes.length} clientes`
        : `${list.length} de ${_clientes.length}`;

    body.innerHTML = list.map(c => {
        const e = estadoDe(c.id);
        const saldo = typeof c.saldoActual === 'number' ? c.saldoActual : 0;
        const estadoTd = (e && saldo > 0) ? estadoBadgeHTML(e) : '<span style="color:var(--adm-muted)">—</span>';
        const vencidoTd = (e && e.vencido > 0)
            ? `<strong class="adm-money adm-money--debe">${esc(fmtCOP(e.vencido))}</strong>`
            : '<span class="adm-money adm-money--cero">—</span>';
        return `
        <tr data-id="${esc(c.id)}" style="cursor:pointer">
            <td>${esc(c.nombre || 'Sin nombre')}</td>
            <td>${esc(nombreVendedora(c.vendedoraId))}</td>
            <td>${estadoTd}</td>
            <td style="text-align:right">${vencidoTd}</td>
            <td style="text-align:right">${saldoCell(c.saldoActual)}</td>
        </tr>`;
    }).join('') || `<tr><td colspan="5" style="color:var(--adm-muted)">Ningún cliente coincide con los filtros.</td></tr>`;
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

// Opciones del filtro por vendedora (Directo de Kary + cada vendedora activa).
function populateFiltroVendedora() {
    const sel = document.getElementById('cli-filtro-vendedora');
    if (!sel) return;
    const optK = document.createElement('option');
    optK.value = '__kary__'; optK.textContent = 'Directo de Kary';
    sel.appendChild(optK);
    for (const [id, nombre] of _vendedoras) {
        const o = document.createElement('option');
        o.value = id; o.textContent = nombre;
        sel.appendChild(o);
    }
}

// Chips de estado/rango (delegación) + select de vendedora.
function wireFiltros() {
    const bar = document.getElementById('cli-filtros');
    if (!bar) return;
    bar.addEventListener('click', (e) => {
        const btn = e.target.closest('.adm-filter-btn');
        if (!btn) return;
        const group = btn.parentElement;
        const g = group.getAttribute('data-group');
        if (g === 'estado') _filterEstado = btn.getAttribute('data-estado');
        else if (g === 'rango') _filterRango = btn.getAttribute('data-rango');
        else return;
        group.querySelectorAll('.adm-filter-btn').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        renderClientes();
    });
    const sel = document.getElementById('cli-filtro-vendedora');
    sel.addEventListener('change', () => { _filterVendedora = sel.value; renderClientes(); });
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
    populateFiltroVendedora();

    // Config de mora (díasPlazo + fecha de corte): cambia rara vez → se lee una vez.
    try {
        const cfg = await getConfig('negocio');
        if (typeof cfg?.diasPlazo === 'number' && cfg.diasPlazo >= 0) _diasPlazo = cfg.diasPlazo;
        if (cfg?.fechaCorteMigracion) _fechaCorte = cfg.fechaCorteMigracion;
    } catch (err) {
        console.warn('[cuentas] getConfig:', err);
    }

    wireModal();
    wireSearch();
    wireFiltros();
    wireRows();

    // Mora/aging EN VIVO (norte §10.2-F2): saldo y vencido salen del MISMO origen
    // (los movimientos) → no se desincronizan. Recalcula y re-renderiza en cada cambio.
    onAllMovimientosChange((movs) => { rebuildEstados(movs); render(); });
    onClientesChange(list => { _clientes = list; render(); });
}

init();
