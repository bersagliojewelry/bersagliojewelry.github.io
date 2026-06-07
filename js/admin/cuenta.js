/**
 * Bersaglio Admin — Ficha de cliente (CRM Bloque 3).
 *
 * Saldo en vivo + historial de movimientos + registrar factura/abono + anular.
 * El saldo lo recalcula la Cloud Function (ADR §43); aquí solo se agregan/anulan
 * movimientos y se observa el resultado. Solo admin/owner.
 */

import { requireAuth, initSidebar, admToast, esc, fmtDateTime } from './shared.js';
import adminDb from './db.js';
import { currentUser } from '../auth.js';
import {
    getCliente, onClienteChange, onMovimientosChange,
    addMovimiento, anularMovimiento, updateCliente, fetchVendedoras, fmtCOP, getConfig,
} from '../crm-service.js';
import { saldoClass, saldoLabel, estadoBadgeHTML } from './saldo-format.js';
import { estadoCuenta, hoyISO } from '../crm-estado-cuenta.js';

const CLIENTE_ID = new URLSearchParams(location.search).get('id');
const _vendedoras = new Map();
let _tipo = 'factura';   // tipo activo del modal
let _cliente = null;     // datos vivos (para corregir saldo / editar)
let _diasPlazo = 30;     // config/negocio.diasPlazo (mora)
let _fechaCorte = null;  // config/negocio.fechaCorteMigracion (fallback de fecha)

// 'YYYY-MM-DD' → 'DD/MM/YYYY' (fecha real del hecho); '' si no es una fecha ISO.
function fmtFecha(iso) {
    if (typeof iso !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return '';
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
}

const TIPO_LABEL = { factura: 'Factura', abono: 'Abono', apertura: 'Apertura', ajuste: 'Ajuste' };
const SIGNO = { factura: 1, apertura: 1, ajuste: 1, abono: -1 };

function nombreVendedora(id) {
    return id ? (_vendedoras.get(id) || 'Vendedora') : 'Directo de Kary';
}

function showError(msg) {
    document.getElementById('ficha-head').hidden = true;
    document.getElementById('hist-section').hidden = true;
    document.getElementById('ficha-error-msg').textContent = msg;
    document.getElementById('ficha-error').hidden = false;
}

function renderHeader(cli) {
    if (!cli) { showError('Este cliente ya no existe.'); return; }
    _cliente = cli;
    document.getElementById('ficha-title').textContent = cli.nombre || 'Cliente';
    document.getElementById('f-nombre').textContent = cli.nombre || 'Sin nombre';
    const meta = [nombreVendedora(cli.vendedoraId), cli.telefono || cli.whatsapp]
        .filter(Boolean).join('  ·  ');
    document.getElementById('f-meta').textContent = meta || '—';

    const saldo = typeof cli.saldoActual === 'number' ? cli.saldoActual : 0;
    const label = saldoLabel(saldo);
    const valEl = document.getElementById('f-saldo');
    valEl.textContent = fmtCOP(Math.abs(saldo));
    valEl.style.color = '';
    valEl.classList.remove('adm-money--debe', 'adm-money--favor', 'adm-money--cero');
    valEl.classList.add(...saldoClass(saldo).split(' '));
    document.getElementById('f-saldo-label').textContent = label;

    document.getElementById('ficha-head').hidden = false;
    document.getElementById('hist-section').hidden = false;
}

function renderEstado(list) {
    const el = document.getElementById('f-estado');
    if (!el) return;
    const est = estadoCuenta(list, { diasPlazo: _diasPlazo, fechaCorte: _fechaCorte });
    // Solo mostramos el sello si hay deuda (positiva); a favor/cero ya lo dice el saldo.
    if (est.saldo > 0) {
        el.innerHTML = estadoBadgeHTML(est);
        el.hidden = false;
    } else {
        el.innerHTML = '';
        el.hidden = true;
    }
}

function renderMovimientos(list) {
    const body = document.getElementById('mov-body');
    const empty = document.getElementById('mov-empty');
    renderEstado(list);
    if (!list.length) { empty.hidden = false; body.innerHTML = ''; return; }
    empty.hidden = true;

    body.innerHTML = list.map((m) => {
        const anulado = m.anulado === true;
        const signo = SIGNO[m.tipo] ?? 0;
        const monto = typeof m.monto === 'number' ? m.monto : 0;
        const aporte = signo * monto;
        const montoTxt = (aporte > 0 ? '+' : '') + fmtCOP(aporte);
        const tipoTxt = TIPO_LABEL[m.tipo] || m.tipo || '—';
        // Fecha real del hecho (base de la mora); fallback al sello de sistema.
        const fechaTxt = fmtFecha(m.fecha) || esc(fmtDateTime(m.registradoEn));
        const accion = anulado || !(m.tipo)
            ? ''
            : `<button class="adm-btn adm-btn--ghost adm-btn--sm" data-anular="${esc(m.id)}">Anular</button>`;
        return `
            <tr${anulado ? ' style="opacity:.5"' : ''}>
                <td title="Registrado: ${esc(fmtDateTime(m.registradoEn))}">${fechaTxt}</td>
                <td>${esc(tipoTxt)}${anulado ? ' <span class="adm-pill">anulado</span>' : ''}</td>
                <td>${esc(m.descripcion || '—')}</td>
                <td style="text-align:right${anulado ? ';text-decoration:line-through' : ''}">${esc(montoTxt)}</td>
                <td style="text-align:right">${accion}</td>
            </tr>`;
    }).join('');
}

// ─── Modal movimiento ─────────────────────────────────────────────────────────
function openMovModal(tipo) {
    _tipo = tipo;
    document.getElementById('mov-form').reset();
    document.getElementById('mov-fecha').value = hoyISO();   // default: hoy (Kary puede cambiarla)
    document.getElementById('mov-modal-title').textContent = `Registrar ${TIPO_LABEL[tipo].toLowerCase()}`;
    document.getElementById('mov-save').textContent = `Registrar ${TIPO_LABEL[tipo].toLowerCase()}`;
    document.getElementById('mov-modal').hidden = false;
    document.getElementById('mov-monto').focus();
}
function closeMovModal() { document.getElementById('mov-modal').hidden = true; }

function wireModal() {
    document.getElementById('btn-factura').addEventListener('click', () => openMovModal('factura'));
    document.getElementById('btn-abono').addEventListener('click', () => openMovModal('abono'));
    document.getElementById('mov-modal-close').addEventListener('click', closeMovModal);
    document.getElementById('mov-cancel').addEventListener('click', closeMovModal);
    document.getElementById('mov-modal').addEventListener('click', (e) => {
        if (e.target.id === 'mov-modal') closeMovModal();
    });

    document.getElementById('mov-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const monto = Number(document.getElementById('mov-monto').value);
        if (!(monto > 0)) { admToast('El monto debe ser mayor que 0.', 'danger'); return; }
        const fecha = document.getElementById('mov-fecha').value;
        if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) { admToast('Elige la fecha del movimiento.', 'danger'); return; }

        const uid = currentUser()?.user?.uid;
        const btn = document.getElementById('mov-save');
        btn.disabled = true;
        try {
            await addMovimiento(CLIENTE_ID, {
                tipo: _tipo,
                monto,
                fecha,
                descripcion: document.getElementById('mov-desc').value,
                registradoPor: uid,
            });
            admToast(`${TIPO_LABEL[_tipo]} registrada. El saldo se actualizará en un momento.`);
            closeMovModal();
        } catch (err) {
            console.error('[cuenta] addMovimiento:', err);
            admToast('No se pudo registrar el movimiento.', 'danger');
        } finally {
            btn.disabled = false;
        }
    });
}

function wireAnular() {
    let anularId = null;
    const modal    = document.getElementById('anular-modal');
    const form     = document.getElementById('anular-form');
    const motivoEl = document.getElementById('anular-motivo');
    const close = () => { modal.hidden = true; anularId = null; form.reset(); };

    document.getElementById('mov-body').addEventListener('click', (e) => {
        const btn = e.target.closest('[data-anular]');
        if (!btn) return;
        anularId = btn.getAttribute('data-anular');
        form.reset();
        modal.hidden = false;
        motivoEl.focus();
    });
    document.getElementById('anular-cancel').addEventListener('click', close);
    document.getElementById('anular-close').addEventListener('click', close);
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const motivo = motivoEl.value.trim();
        if (!motivo) { admToast('El motivo es obligatorio.', 'danger'); return; }
        if (!anularId) return;
        const btn = document.getElementById('anular-confirm');
        btn.disabled = true;
        try {
            await anularMovimiento(CLIENTE_ID, anularId, currentUser()?.user?.uid, motivo);
            admToast('Movimiento anulado.');
            close();
        } catch (err) {
            console.error('[cuenta] anularMovimiento:', err);
            admToast('No se pudo anular.', 'danger');
        } finally {
            btn.disabled = false;
        }
    });
}

// ─── Corregir saldo (admin) — registra un ajuste para llegar al saldo correcto ──
function wireCorregir() {
    const modal = document.getElementById('corregir-modal');
    const open = () => {
        const actual = typeof _cliente?.saldoActual === 'number' ? _cliente.saldoActual : 0;
        document.getElementById('corregir-form').reset();
        document.getElementById('corregir-actual').textContent = `(actual: ${fmtCOP(actual)})`;
        document.getElementById('corregir-saldo').value = actual;
        modal.hidden = false;
        document.getElementById('corregir-saldo').focus();
    };
    const close = () => { modal.hidden = true; };
    document.getElementById('btn-corregir').addEventListener('click', open);
    document.getElementById('corregir-close').addEventListener('click', close);
    document.getElementById('corregir-cancel').addEventListener('click', close);
    modal.addEventListener('click', (e) => { if (e.target.id === 'corregir-modal') close(); });

    document.getElementById('corregir-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const nuevo = Number(document.getElementById('corregir-saldo').value);
        if (!Number.isFinite(nuevo)) { admToast('Escribe un saldo válido.', 'danger'); return; }
        const actual = typeof _cliente?.saldoActual === 'number' ? _cliente.saldoActual : 0;
        const delta = Math.round((nuevo - actual) * 100) / 100;
        if (delta === 0) { admToast('El saldo ya es ese.'); close(); return; }
        const motivo = document.getElementById('corregir-motivo').value.trim();
        try {
            await addMovimiento(CLIENTE_ID, {
                tipo: 'ajuste', monto: delta, fecha: hoyISO(),
                descripcion: 'Corrección de saldo' + (motivo ? `: ${motivo}` : ''),
                registradoPor: currentUser()?.user?.uid,
            });
            admToast('Corrección aplicada. El saldo se actualizará en un momento.');
            close();
        } catch (err) {
            console.error('[cuenta] corregir saldo:', err);
            admToast('No se pudo aplicar la corrección.', 'danger');
        }
    });
}

// ─── Editar datos del cliente (admin) ──────────────────────────────────────────
function wireEditar() {
    const sel = document.getElementById('ed-vendedora');
    for (const [uid, nombre] of _vendedoras) {
        const o = document.createElement('option'); o.value = uid; o.textContent = nombre; sel.appendChild(o);
    }
    const modal = document.getElementById('editar-modal');
    const open = () => {
        const c = _cliente || {};
        document.getElementById('ed-nombre').value = c.nombre || '';
        document.getElementById('ed-telefono').value = c.telefono || '';
        document.getElementById('ed-whatsapp').value = c.whatsapp || '';
        document.getElementById('ed-vendedora').value = c.vendedoraId || '';
        document.getElementById('ed-cumpleanos').value = c.cumpleanos || '';
        document.getElementById('ed-notas').value = c.notas || '';
        modal.hidden = false;
        document.getElementById('ed-nombre').focus();
    };
    const close = () => { modal.hidden = true; };
    document.getElementById('btn-editar').addEventListener('click', open);
    document.getElementById('editar-close').addEventListener('click', close);
    document.getElementById('editar-cancel').addEventListener('click', close);
    modal.addEventListener('click', (e) => { if (e.target.id === 'editar-modal') close(); });

    document.getElementById('editar-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const nombre = document.getElementById('ed-nombre').value.trim();
        if (!nombre) { admToast('El nombre es obligatorio.', 'danger'); return; }
        try {
            await updateCliente(CLIENTE_ID, {
                nombre,
                telefono:   document.getElementById('ed-telefono').value.trim(),
                whatsapp:   document.getElementById('ed-whatsapp').value.trim(),
                vendedoraId: document.getElementById('ed-vendedora').value || null,
                cumpleanos: document.getElementById('ed-cumpleanos').value,
                notas:      document.getElementById('ed-notas').value.trim(),
            });
            admToast('Datos actualizados.');
            close();
            // renderHeader se refresca solo por onClienteChange.
        } catch (err) {
            console.error('[cuenta] updateCliente:', err);
            admToast('No se pudieron guardar los cambios.', 'danger');
        }
    });
}

async function init() {
    await requireAuth('admin');
    await adminDb.init();
    initSidebar();

    if (!CLIENTE_ID) { showError('Falta el identificador del cliente.'); return; }

    try {
        (await fetchVendedoras())
            .filter(v => v.activa !== false)
            .forEach(v => _vendedoras.set(v.id, v.nombre || 'Vendedora'));
    } catch (err) {
        console.warn('[cuenta] fetchVendedoras:', err);
    }

    try {
        const cfg = await getConfig('negocio');
        if (typeof cfg?.diasPlazo === 'number' && cfg.diasPlazo >= 0) _diasPlazo = cfg.diasPlazo;
        if (cfg?.fechaCorteMigracion) _fechaCorte = cfg.fechaCorteMigracion;
    } catch (err) {
        console.warn('[cuenta] getConfig:', err);
    }

    const cli = await getCliente(CLIENTE_ID);
    if (!cli) { showError('Cliente no encontrado.'); return; }
    renderHeader(cli);

    wireModal();
    wireAnular();
    wireCorregir();
    wireEditar();

    onClienteChange(CLIENTE_ID, (c) => renderHeader(c));
    onMovimientosChange(CLIENTE_ID, (list) => renderMovimientos(list));
}

init();
