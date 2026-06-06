/**
 * Bersaglio Admin — Ficha de cliente (CRM Bloque 3).
 *
 * Saldo en vivo + historial de movimientos + registrar factura/abono + anular.
 * El saldo lo recalcula la Cloud Function (ADR §43); aquí solo se agregan/anulan
 * movimientos y se observa el resultado. Solo admin/owner.
 */

import { requireAuth, initSidebar, admToast, admConfirm, esc, fmtDateTime } from './shared.js';
import adminDb from './db.js';
import { currentUser } from '../auth.js';
import {
    getCliente, onClienteChange, onMovimientosChange,
    addMovimiento, anularMovimiento, fetchVendedoras, fmtCOP,
} from '../crm-service.js';

const CLIENTE_ID = new URLSearchParams(location.search).get('id');
const _vendedoras = new Map();
let _tipo = 'factura';   // tipo activo del modal

const TIPO_LABEL = { factura: 'Factura', abono: 'Abono', apertura: 'Apertura', ajuste: 'Ajuste' };
const SIGNO = { factura: 1, apertura: 1, ajuste: 1, abono: -1 };

function nombreVendedora(uid) {
    return uid ? (_vendedoras.get(uid) || 'Vendedora') : 'Directo de Kary';
}

function showError(msg) {
    document.getElementById('ficha-head').hidden = true;
    document.getElementById('hist-section').hidden = true;
    document.getElementById('ficha-error-msg').textContent = msg;
    document.getElementById('ficha-error').hidden = false;
}

function renderHeader(cli) {
    if (!cli) { showError('Este cliente ya no existe.'); return; }
    document.getElementById('ficha-title').textContent = cli.nombre || 'Cliente';
    document.getElementById('f-nombre').textContent = cli.nombre || 'Sin nombre';
    const meta = [nombreVendedora(cli.vendedoraUid), cli.telefono || cli.whatsapp]
        .filter(Boolean).join('  ·  ');
    document.getElementById('f-meta').textContent = meta || '—';

    const saldo = typeof cli.saldoActual === 'number' ? cli.saldoActual : 0;
    const label = saldo < 0 ? 'Saldo a favor' : saldo > 0 ? 'Saldo (debe)' : 'Saldo';
    const valEl = document.getElementById('f-saldo');
    valEl.textContent = fmtCOP(Math.abs(saldo));
    valEl.style.color = saldo > 0 ? 'var(--adm-danger,#c0392b)'
        : saldo < 0 ? 'var(--adm-success,#1b7a4b)' : 'var(--adm-text,inherit)';
    document.getElementById('f-saldo-label').textContent = label;

    document.getElementById('ficha-head').hidden = false;
    document.getElementById('hist-section').hidden = false;
}

function renderMovimientos(list) {
    const body = document.getElementById('mov-body');
    const empty = document.getElementById('mov-empty');
    if (!list.length) { empty.hidden = false; body.innerHTML = ''; return; }
    empty.hidden = true;

    body.innerHTML = list.map((m) => {
        const anulado = m.anulado === true;
        const signo = SIGNO[m.tipo] ?? 0;
        const monto = typeof m.monto === 'number' ? m.monto : 0;
        const aporte = signo * monto;
        const montoTxt = (aporte > 0 ? '+' : '') + fmtCOP(aporte);
        const tipoTxt = TIPO_LABEL[m.tipo] || m.tipo || '—';
        const accion = anulado || !(m.tipo)
            ? ''
            : `<button class="adm-btn adm-btn--ghost adm-btn--sm" data-anular="${esc(m.id)}">Anular</button>`;
        return `
            <tr${anulado ? ' style="opacity:.5"' : ''}>
                <td>${esc(fmtDateTime(m.registradoEn))}</td>
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

        const uid = currentUser()?.user?.uid;
        const btn = document.getElementById('mov-save');
        btn.disabled = true;
        try {
            await addMovimiento(CLIENTE_ID, {
                tipo: _tipo,
                monto,
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
    document.getElementById('mov-body').addEventListener('click', (e) => {
        const btn = e.target.closest('[data-anular]');
        if (!btn) return;
        const movId = btn.getAttribute('data-anular');
        admConfirm('¿Anular este movimiento? No se borra, pero dejará de contar en el saldo.', async () => {
            try {
                await anularMovimiento(CLIENTE_ID, movId, currentUser()?.user?.uid);
                admToast('Movimiento anulado.');
            } catch (err) {
                console.error('[cuenta] anularMovimiento:', err);
                admToast('No se pudo anular.', 'danger');
            }
        });
    });
}

async function init() {
    await requireAuth('admin');
    await adminDb.init();
    initSidebar();

    if (!CLIENTE_ID) { showError('Falta el identificador del cliente.'); return; }

    try {
        (await fetchVendedoras()).forEach(v =>
            _vendedoras.set(v.uid, v.displayName || v.email || 'Vendedora'));
    } catch (err) {
        console.warn('[cuenta] fetchVendedoras:', err);
    }

    const cli = await getCliente(CLIENTE_ID);
    if (!cli) { showError('Cliente no encontrado.'); return; }
    renderHeader(cli);

    wireModal();
    wireAnular();

    onClienteChange(CLIENTE_ID, (c) => renderHeader(c));
    onMovimientosChange(CLIENTE_ID, (list) => renderMovimientos(list));
}

init();
