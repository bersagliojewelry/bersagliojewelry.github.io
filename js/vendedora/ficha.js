/**
 * Bersaglio — App de vendedora · Ficha de cliente (CRM Bloque 4).
 *
 * Saldo en vivo + movimientos + registrar factura/abono + SOLICITAR corrección
 * (la vendedora NO edita ni anula: pide y Kary aprueba). Solo su cliente (reglas).
 */

import { requireAuthExact, currentUser } from '../auth.js';
import { esc, fmtDateTime, toast } from './ui.js';
import {
    getCliente, onClienteChange, onMovimientosChange,
    addMovimiento, crearSolicitud, fmtCOP,
} from '../crm-service.js';

const CLIENTE_ID = new URLSearchParams(location.search).get('id');
let _uid = null;
let _tipo = 'factura';
let _solicMovId = null;

const TIPO_LABEL = { factura: 'Factura', abono: 'Abono', apertura: 'Apertura', ajuste: 'Ajuste' };
const SIGNO = { factura: 1, apertura: 1, ajuste: 1, abono: -1 };

function showError(msg) {
    document.getElementById('ficha-head').hidden = true;
    document.getElementById('ficha-actions').hidden = true;
    document.getElementById('hist-title').hidden = true;
    const e = document.getElementById('ficha-error');
    e.textContent = msg; e.hidden = false;
}

function renderHeader(cli) {
    if (!cli) { showError('Cliente no encontrado o sin acceso.'); return; }
    document.getElementById('ficha-title').textContent = cli.nombre || 'Cliente';
    const saldo = typeof cli.saldoActual === 'number' ? cli.saldoActual : 0;
    document.getElementById('f-saldo-label').textContent =
        saldo < 0 ? 'Saldo a favor' : saldo > 0 ? 'Saldo (debe)' : 'Saldo';
    document.getElementById('f-saldo').textContent = fmtCOP(Math.abs(saldo));
    document.getElementById('f-meta').textContent =
        cli.telefono || cli.whatsapp || 'Sin teléfono';
    document.getElementById('ficha-head').hidden = false;
    document.getElementById('ficha-actions').hidden = false;
    document.getElementById('hist-title').hidden = false;
}

function renderMovs(list) {
    const wrap = document.getElementById('mov-list');
    const empty = document.getElementById('mov-empty');
    if (!list.length) { wrap.innerHTML = ''; empty.hidden = false; return; }
    empty.hidden = true;

    wrap.innerHTML = list.map((m) => {
        const anulado = m.anulado === true;
        const aporte = (SIGNO[m.tipo] ?? 0) * (typeof m.monto === 'number' ? m.monto : 0);
        const montoTxt = (aporte > 0 ? '+' : '') + fmtCOP(aporte);
        const color = aporte > 0 ? 'var(--adm-danger)' : aporte < 0 ? 'var(--adm-success)' : 'var(--adm-muted)';
        const tipo = TIPO_LABEL[m.tipo] || m.tipo || '—';
        const solicBtn = anulado ? '' :
            `<button class="adm-btn adm-btn--ghost adm-btn--sm" data-solic="${esc(m.id)}" style="margin-top:8px">Solicitar corrección</button>`;
        return `
            <div class="vend-mov${anulado ? ' vend-mov--anulado' : ''}">
                <div class="vend-mov-main">
                    <div class="vend-mov-tipo">${esc(tipo)}${anulado ? ' (anulado)' : ''}</div>
                    <div class="vend-mov-meta">${esc(fmtDateTime(m.registradoEn))}${m.descripcion ? ' · ' + esc(m.descripcion) : ''}</div>
                    ${solicBtn}
                </div>
                <div class="vend-mov-monto" style="color:${color}">${esc(montoTxt)}</div>
            </div>`;
    }).join('');
}

// ─── Modales ──────────────────────────────────────────────────────────────────
function openMov(tipo) {
    _tipo = tipo;
    document.getElementById('mov-form').reset();
    document.getElementById('mov-modal-title').textContent = `Registrar ${TIPO_LABEL[tipo].toLowerCase()}`;
    document.getElementById('mov-modal').hidden = false;
    document.getElementById('mov-monto').focus();
}
function closeMov() { document.getElementById('mov-modal').hidden = true; }

function openSolic(movId) {
    _solicMovId = movId;
    document.getElementById('solic-form').reset();
    document.getElementById('solic-modal').hidden = false;
    document.getElementById('solic-motivo').focus();
}
function closeSolic() { document.getElementById('solic-modal').hidden = true; }

function wire() {
    document.getElementById('btn-factura').addEventListener('click', () => openMov('factura'));
    document.getElementById('btn-abono').addEventListener('click', () => openMov('abono'));
    document.getElementById('mov-modal-close').addEventListener('click', closeMov);
    document.getElementById('mov-cancel').addEventListener('click', closeMov);
    document.getElementById('mov-modal').addEventListener('click', (e) => { if (e.target.id === 'mov-modal') closeMov(); });

    document.getElementById('solic-modal-close').addEventListener('click', closeSolic);
    document.getElementById('solic-cancel').addEventListener('click', closeSolic);
    document.getElementById('solic-modal').addEventListener('click', (e) => { if (e.target.id === 'solic-modal') closeSolic(); });

    document.getElementById('mov-list').addEventListener('click', (e) => {
        const btn = e.target.closest('[data-solic]');
        if (btn) openSolic(btn.getAttribute('data-solic'));
    });

    document.getElementById('mov-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const monto = Number(document.getElementById('mov-monto').value);
        if (!(monto > 0)) { toast('El monto debe ser mayor que 0.', 'danger'); return; }
        const btn = document.getElementById('mov-save');
        btn.disabled = true;
        try {
            await addMovimiento(CLIENTE_ID, {
                tipo: _tipo, monto,
                descripcion: document.getElementById('mov-desc').value,
                registradoPor: _uid,
            });
            toast(`${TIPO_LABEL[_tipo]} registrada. El saldo se actualizará en un momento.`);
            closeMov();
        } catch (err) {
            console.error('[vend-ficha] addMovimiento:', err);
            toast('No se pudo registrar.', 'danger');
        } finally { btn.disabled = false; }
    });

    document.getElementById('solic-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const motivo = document.getElementById('solic-motivo').value.trim();
        if (!motivo) { toast('Escribe el motivo.', 'danger'); return; }
        const btn = document.getElementById('solic-save');
        btn.disabled = true;
        try {
            await crearSolicitud({ vendedoraUid: _uid, clienteId: CLIENTE_ID, movId: _solicMovId, motivo });
            toast('Solicitud enviada a Kary.');
            closeSolic();
        } catch (err) {
            console.error('[vend-ficha] crearSolicitud:', err);
            toast('No se pudo enviar la solicitud.', 'danger');
        } finally { btn.disabled = false; }
    });
}

async function init() {
    const { user } = await requireAuthExact(['vendedora', 'admin', 'owner']);
    _uid = user.uid;
    if (!CLIENTE_ID) { showError('Falta el cliente.'); return; }

    wire();

    let cli = null;
    try { cli = await getCliente(CLIENTE_ID); }
    catch { showError('No tienes acceso a este cliente.'); return; }
    if (!cli) { showError('Cliente no encontrado.'); return; }
    renderHeader(cli);

    onClienteChange(CLIENTE_ID, (c) => renderHeader(c));
    onMovimientosChange(CLIENTE_ID, (list) => renderMovs(list));
}

init();
