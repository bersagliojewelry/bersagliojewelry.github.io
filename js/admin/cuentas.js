/**
 * Bersaglio Admin — CARTERA (cuentas por cobrar · F-IA-2 B2, §3).
 *
 * La vista de COBRO: KPIs de cartera + por vendedora + lista de clientes ordenada por
 * MORA, con saldo (desnormalizado, calculado por la Cloud Function) y filtros de mora.
 * El DIRECTORIO (contacto, alta de cliente, cumpleaños) se separó a admin-clientes.html;
 * cada fila de aquí lleva a la ficha (admin-cuenta.html). Solo admin/owner. Datos vía el
 * módulo desacoplado `js/crm-service.js`.
 */

import { requireAuth, initSidebar, esc } from './shared.js';
import adminDb from './db.js';
import {
    onClientesChange, fetchVendedoras, onAllMovimientosChange, getConfig,
    fmtCOP, carteraTotals, carteraPorVendedora, onAllAcuerdosVigentesChange,
} from '../crm-service.js';
import { saldoCellHTML, estadoBadgeHTML } from './saldo-format.js';
import { estadoCuenta } from '../crm-estado-cuenta.js';
import { pmark, psummary } from '../core/perf-probe.js';   // sonda TODO-33 (gateada; no-op si off)

let _perfDone = false;   // one-shot: resume la cascada al primer render de clientes

let _clientes = [];
const _vendedoras = new Map();   // vendedoraId -> nombre
const _estados = new Map();      // clienteId -> estadoCuenta (mora, calculado al cargar)
let _diasPlazo = 30;             // config/negocio.diasPlazo
let _fechaCorte = null;          // config/negocio.fechaCorteMigracion (fallback de fecha)
let _ultimosMovs = [];           // último snapshot de movimientos (re-derivar al cambiar acuerdos)
const _acuerdosPorCliente = new Map();   // clienteId -> acuerdos vigentes (spec 2026-06-12)
let _horizonteDias = 730;        // config/cartera.horizonteAcuerdoDias (P3: 24 meses)
let _incumplidoCuotas = 2;       // config/cartera.acuerdoIncumplidoCuotas (cuotas que rompen el escudo)
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

// Recalcula la mora por cliente desde TODOS los movimientos (en vivo). Los
// ACUERDOS de pago (spec 2026-06-12) re-programan la exigibilidad: la clienta
// que cumple su plan sale de los rojos también AQUÍ (decisión P1 de Daniel) —
// el sello "En acuerdo de pago" lo pinta estadoBadgeHTML (una fuente).
function rebuildEstados(movs) {
    _ultimosMovs = movs;
    _estados.clear();
    const byCliente = new Map();
    for (const m of movs) {
        if (!m.clienteId) continue;
        if (!byCliente.has(m.clienteId)) byCliente.set(m.clienteId, []);
        byCliente.get(m.clienteId).push(m);
    }
    for (const [cid, lst] of byCliente) {
        _estados.set(cid, estadoCuenta(lst, {
            diasPlazo: _diasPlazo, fechaCorte: _fechaCorte,
            acuerdos: _acuerdosPorCliente.get(cid) || [], horizonteDias: _horizonteDias,
            incumplidoCuotas: _incumplidoCuotas,
        }));
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

// ── Dinero en tarjetas KPI (comité UX 2026-07-10) ────────────────────────────────
// >= $10M se muestra ABREVIADO ($506,7 M) y el exacto queda SIEMPRE visible debajo en línea
// pequeña (Kary cuadra con exactos; en táctil no hay hover) — jamás se parte la cifra en dos líneas.
function fmtCOPCompacto(n) {
    const v = Math.round(Number(n) || 0);
    if (Math.abs(v) >= 10_000_000) {
        return '$' + (v / 1_000_000).toLocaleString('es-CO', { maximumFractionDigits: 1 }) + ' M';
    }
    return fmtCOP(v);
}
function setStatMoney(id, monto) {
    const el = document.getElementById(id);
    if (!el) return;
    const compacto = fmtCOPCompacto(monto);
    el.textContent = compacto;
    let exacto = el.parentElement.querySelector('.adm-stat-exacto');
    if (compacto !== fmtCOP(Math.round(Number(monto) || 0))) {
        if (!exacto) {
            exacto = document.createElement('div');
            exacto.className = 'adm-stat-exacto adm-money';
            el.insertAdjacentElement('afterend', exacto);
        }
        exacto.textContent = fmtCOP(monto);
    } else if (exacto) {
        exacto.remove();
    }
}

function renderStats() {
    const t = carteraTotals(_clientes);
    setStatMoney('stat-por-cobrar', t.porCobrar);
    document.getElementById('stat-clientes').textContent = String(t.clientes);
    setStatMoney('stat-a-favor', Math.abs(t.aFavor));

    const v = carteraVencida();
    setStatMoney('stat-vencida', v.vencido);
    // Aging como MINI-BARRA apilada (la proporción de un vistazo) + etiquetas con monto por tramo
    // (comité UX 2026-07-10: el texto corrido en mono 11px era ilegible y no mostraba proporción).
    const desg = document.getElementById('stat-vencida-desglose');
    if (v.vencido > 0) {
        const pct = (n) => Math.max(0, Math.round((n / v.vencido) * 100));
        desg.innerHTML =
            `<div class="adm-aging-bar" role="img" aria-label="Distribución de la mora por tramo">` +
              `<span class="adm-aging-seg adm-aging-seg--1" style="width:${pct(v.d1_30)}%"></span>` +
              `<span class="adm-aging-seg adm-aging-seg--2" style="width:${pct(v.d31_60)}%"></span>` +
              `<span class="adm-aging-seg adm-aging-seg--3" style="width:${pct(v.d60plus)}%"></span>` +
            `</div>` +
            `<span class="adm-aging-chip">1-30 · <strong>${esc(fmtCOP(v.d1_30))}</strong></span>` +
            `<span class="adm-aging-chip">31-60 · <strong>${esc(fmtCOP(v.d31_60))}</strong></span>` +
            `<span class="adm-aging-chip">+60 · <strong>${esc(fmtCOP(v.d60plus))}</strong></span>`;
    } else {
        desg.textContent = 'Todo al día';
    }
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


function render() {
    renderStats();
    renderCarteraVendedora();
    renderClientes();
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
    pmark('page:init-start');
    await requireAuth('admin');
    pmark('page:auth-done');
    await adminDb.init();      // mantiene el badge de consultas del sidebar
    pmark('page:adminDb-done');
    initSidebar();
    pmark('page:sidebar-done');

    try {
        (await fetchVendedoras())
            .filter(v => v.activa !== false)
            .forEach(v => _vendedoras.set(v.id, v.nombre || 'Vendedora'));
    } catch (err) {
        console.warn('[cuentas] fetchVendedoras:', err);
    }
    populateFiltroVendedora();

    // Config de mora (díasPlazo + fecha de corte): cambia rara vez → se lee una vez.
    try {
        const cfg = await getConfig('negocio');
        if (typeof cfg?.diasPlazo === 'number' && cfg.diasPlazo >= 0) _diasPlazo = cfg.diasPlazo;
        if (cfg?.fechaCorteMigracion) _fechaCorte = cfg.fechaCorteMigracion;
    } catch (err) {
        console.warn('[cuentas] getConfig:', err);
    }
    // Acuerdos de pago (spec 2026-06-12): bandera + horizonte del owner.
    let acuerdosActivos = false;
    try {
        const cc = await getConfig('cartera');
        acuerdosActivos = cc?.acuerdosActivos === true;
        if (typeof cc?.horizonteAcuerdoDias === 'number' && cc.horizonteAcuerdoDias > 0) {
            _horizonteDias = cc.horizonteAcuerdoDias;
        }
        if (Number.isInteger(cc?.acuerdoIncumplidoCuotas) && cc.acuerdoIncumplidoCuotas >= 1) {
            _incumplidoCuotas = cc.acuerdoIncumplidoCuotas;
        }
    } catch (err) {
        console.warn('[cuentas] getConfig cartera:', err);
    }

    pmark('page:config-done');

    wireSearch();
    wireFiltros();
    wireRows();

    // Mora/aging EN VIVO (norte §10.2-F2): saldo y vencido salen del MISMO origen
    // (los movimientos) → no se desincronizan. Recalcula y re-renderiza en cada cambio.
    onAllMovimientosChange((movs) => { rebuildEstados(movs); render(); });
    onClientesChange(list => {
        _clientes = list; render();
        // Medición TODO-33: el primer render de clientes = "página utilizable" → cierra la cascada.
        if (!_perfDone) { _perfDone = true; pmark('page:first-data-render'); psummary('cuentas'); }
    });
    // Acuerdos vigentes (gateado por la bandera: sin reglas desplegadas no hay listener).
    if (acuerdosActivos) {
        onAllAcuerdosVigentesChange((list) => {
            _acuerdosPorCliente.clear();
            for (const a of list) {
                if (!a.clienteId) continue;
                if (!_acuerdosPorCliente.has(a.clienteId)) _acuerdosPorCliente.set(a.clienteId, []);
                _acuerdosPorCliente.get(a.clienteId).push(a);
            }
            rebuildEstados(_ultimosMovs);
            render();
        }, () => {
            // Listener muerto (L-40): sin acuerdos confiables, la mora se muestra SIN
            // plan (conservador) — jamás un "al día" sostenido por datos muertos.
            _acuerdosPorCliente.clear();
            rebuildEstados(_ultimosMovs);
            render();
        });
    }
}

init();
