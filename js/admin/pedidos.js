/**
 * Bersaglio Admin — Pedidos (F1-CORE · TODO-68, plan único ERP v4 · spec 2026-07-06 §4).
 *
 * Lista viva + detalle + ACCIONES de transición de TODOS los canales (web / mostrador / WhatsApp).
 * F1-PUENTE (§165) puso la vista read-only; F1-CORE la completa: filtros (estado/canal/medio/fecha),
 * KPI del filtro activo, colas de excepción accionables, botones de transición (espejo de la tabla
 * TRANSICIONES del backend — la CF `avanzarPedido` es la ÚNICA que valida/escribe) e historial
 * append-only por pedido. El navegador JAMÁS escribe `pedidos`: todo pasa por callable (CF-only).
 *
 * Deep-link: admin-pedidos.html?id=<pedidoId> abre el detalle directo (destino del push A.6).
 *
 * Seguridad XSS (convención L-03/F6 del panel, igual que pos.js/cuentas.js): TODO valor
 * dinámico que entra a innerHTML pasa por esc() de shared.js — sin excepción. No se
 * interpola NUNCA un dato de Firestore sin escapar.
 */

import { admToast, initSidebar, esc, requireAuth, fmtDateTime, admConfirm, errorMessage } from './shared.js';
import { onPedidosChange, avanzarPedido, anularPedido, historialPedido } from '../pedidos-service.js';
import {
    estadoPedido, canalLabel, medioLabel, entregaLabel, nombreComprador, direccionTexto,
    resumenPedido, idVisible, pedidoCoincide, TRANSICIONES_PEDIDO, ACCION_TRANSICION,
    totalesFiltro, plantillaDespacho, plantillaSinStock,
} from './pedidos-format.js';
import { pieceUrl } from '../core/urls.js';
import { waPhone } from '../core/countries.js';

const cop = n => '$' + Math.round(Math.max(0, Number(n) || 0)).toLocaleString('es-CO');
// Mensaje de negocio de la CF (claro, en español) > el genérico por código (patrón pos.js).
const BUSINESS_ERR = ['failed-precondition', 'invalid-argument', 'not-found', 'already-exists'];

let _pedidos   = [];
let _abierto   = null;    // id del pedido mostrado en el modal (para refrescarlo en vivo)
let _query     = '';      // búsqueda tolerante (§166: código sin guiones/minúsculas/sufijo)
let _historial = null;    // historial del pedido abierto (null = cargando)
let _accion    = null;    // transición con mini-form abierto ('preparacion'… | 'sinstock')
let _enviando  = false;   // candado anti doble-submit del mini-form

// Filtros client-side (F1-CORE §4.1; ≤200 docs del listener — suficiente F1).
let _filtro = { estado: 'todos', canal: '', medio: '', desde: '', hasta: '' };
// Colas de excepción (§4.3): grupos de estados accionables (las cards filtran por grupo).
const GRUPOS = {
    'grupo:revisar':   ['a_revisar', 'pagado_sin_stock'],
    'grupo:despachar': ['pagado', 'preparacion'],
};
// Orden canónico de chips: ciclo de vida primero, excepciones después, terminales al final.
const ORDEN_CHIPS = ['pago_pendiente', 'pago_por_verificar', 'pagado', 'preparacion', 'despacho_nacional',
    'entrega_local', 'listo_retiro', 'entregado', 'a_revisar', 'pagado_sin_stock', 'reembolsado',
    'cancelado', 'expirado', 'anulado'];

// ─── Init ───────────────────────────────────────────────────────────────────────
async function init() {
    await requireAuth('catalogo');   // espeja la regla de lectura de `pedidos` (owner/admin/catalogo)
    initSidebar();

    onPedidosChange(pedidos => {
        _pedidos = pedidos;
        renderLista();
        document.getElementById('ped-conn-warn').hidden = true;
        // Deep-link (?id=) — se resuelve con el PRIMER snapshot; si el pedido llega después
        // (listener vivo), el intento queda armado hasta encontrarlo.
        abrirDeepLink();
        // Si el detalle está abierto y ese pedido cambió (p.ej. webhook lo pasó a pagado), refresca.
        if (_abierto) {
            const p = _pedidos.find(x => x.id === _abierto);
            if (p) renderDetalle(p);
        }
    }, 200, () => { document.getElementById('ped-conn-warn').hidden = false; });

    // Delegación: click/Enter en una fila abre el detalle.
    const body = document.getElementById('ped-body');
    body.addEventListener('click', e => {
        const tr = e.target.closest('tr[data-id]');
        if (tr) abrirDetalle(tr.dataset.id);
    });
    body.addEventListener('keydown', e => {
        if (e.key !== 'Enter') return;
        const tr = e.target.closest('tr[data-id]');
        if (tr) abrirDetalle(tr.dataset.id);
    });

    document.getElementById('ped-modal-close').addEventListener('click', cerrarModal);
    document.getElementById('ped-modal-ok').addEventListener('click', cerrarModal);
    document.getElementById('ped-modal').addEventListener('click', e => { if (e.target.id === 'ped-modal') cerrarModal(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !document.getElementById('ped-modal').hidden) cerrarModal(); });
    document.getElementById('ped-copy-resumen').addEventListener('click', copiarResumen);
    document.getElementById('ped-search').addEventListener('input', e => {
        _query = e.target.value;
        renderLista();
    });

    // Filtros: chips de estado (delegación — se re-pintan con conteos), selects y fechas.
    document.getElementById('ped-chips').addEventListener('click', e => {
        const b = e.target.closest('[data-estado]');
        if (b) setFiltroEstado(b.dataset.estado);
    });
    document.getElementById('ped-filtro-canal').addEventListener('change', e => { _filtro.canal = e.target.value; renderLista(); });
    document.getElementById('ped-filtro-medio').addEventListener('change', e => { _filtro.medio = e.target.value; renderLista(); });
    document.getElementById('ped-filtro-desde').addEventListener('change', e => { _filtro.desde = e.target.value; renderLista(); });
    document.getElementById('ped-filtro-hasta').addEventListener('change', e => { _filtro.hasta = e.target.value; renderLista(); });

    // Colas de excepción: card → aplica el filtro del grupo (clic de nuevo = quitar).
    const cardFiltro = { 'ped-q-verificar': 'pago_por_verificar', 'ped-q-revisar': 'grupo:revisar', 'ped-q-despachar': 'grupo:despachar' };
    for (const [id, estado] of Object.entries(cardFiltro)) {
        const card = document.getElementById(id);
        const toggle = () => setFiltroEstado(_filtro.estado === estado ? 'todos' : estado);
        card.addEventListener('click', toggle);
        card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
    }

    // Botones dinámicos del detalle (copiar / abrir mini-form / resolver sin-stock) — delegación,
    // el detalle se re-pinta en vivo y los listeners directos se perderían.
    document.getElementById('ped-detail').addEventListener('click', e => {
        const copy = e.target.closest('[data-copy]');
        if (copy) { copiar(copy.dataset.copy, copy.dataset.copyLabel || 'Copiado'); return; }
        const acc = e.target.closest('[data-accion]');
        if (acc) { abrirForm(acc.dataset.accion); return; }
        const sin = e.target.closest('[data-sinstock]');
        if (sin) abrirForm('sinstock');
    });
}

function setFiltroEstado(estado) {
    _filtro.estado = estado || 'todos';
    renderLista();
}

// ─── Filtros (client-side) ──────────────────────────────────────────────────────
const fechaMs = v => (v?.toMillis ? v.toMillis() : (v ? new Date(v).getTime() : 0));

function pasaFiltros(p) {
    const f = _filtro.estado;
    if (f && f !== 'todos' && !(GRUPOS[f] ? GRUPOS[f].includes(p.estado) : p.estado === f)) return false;
    if (_filtro.canal && p.canal !== _filtro.canal) return false;
    if (_filtro.medio && p.medio !== _filtro.medio) return false;
    if (_filtro.desde || _filtro.hasta) {
        const t = fechaMs(p.createdAt);
        if (_filtro.desde && t < new Date(_filtro.desde + 'T00:00:00').getTime()) return false;
        if (_filtro.hasta && t > new Date(_filtro.hasta + 'T23:59:59.999').getTime()) return false;
    }
    return true;
}

/** Chips de estado con conteo (solo estados presentes + Todos). Estados fuera del censo también salen. */
function renderChips() {
    const counts = {};
    for (const p of _pedidos) counts[p.estado] = (counts[p.estado] || 0) + 1;
    const orden = [...ORDEN_CHIPS, ...Object.keys(counts).filter(e => !ORDEN_CHIPS.includes(e))];
    const chip = (val, label, n) =>
        `<button type="button" class="adm-filter-btn${_filtro.estado === val ? ' is-active' : ''}" data-estado="${esc(val)}">${esc(label)} (${n})</button>`;
    document.getElementById('ped-chips').innerHTML =
        chip('todos', 'Todos', _pedidos.length) +
        orden.filter(e => counts[e]).map(e => chip(e, estadoPedido(e).label, counts[e])).join('');
}

/** Colas de excepción: cuentan SOLO lo accionable, sobre TODOS los pedidos (no el filtro). */
function renderColas() {
    const n = grupo => _pedidos.filter(p => grupo.includes(p.estado)).length;
    document.getElementById('ped-q-verificar-n').textContent = _pedidos.filter(p => p.estado === 'pago_por_verificar').length;
    document.getElementById('ped-q-revisar-n').textContent = n(GRUPOS['grupo:revisar']);
    document.getElementById('ped-q-despachar-n').textContent = n(GRUPOS['grupo:despachar']);
    document.getElementById('ped-q-verificar').classList.toggle('is-active', _filtro.estado === 'pago_por_verificar');
    document.getElementById('ped-q-revisar').classList.toggle('is-active', _filtro.estado === 'grupo:revisar');
    document.getElementById('ped-q-despachar').classList.toggle('is-active', _filtro.estado === 'grupo:despachar');
}

// ─── Lista ──────────────────────────────────────────────────────────────────────
function renderLista() {
    const tbody = document.getElementById('ped-body');
    const empty = document.getElementById('ped-empty');
    const count = document.getElementById('ped-count');
    const totalesEl = document.getElementById('ped-totales');

    renderChips();
    renderColas();

    if (!_pedidos.length) {
        tbody.innerHTML = '';
        empty.hidden = false;
        count.textContent = '';
        totalesEl.hidden = true;
        return;
    }
    empty.hidden = true;

    const visibles = _pedidos.filter(p => pasaFiltros(p) && pedidoCoincide(p, _query));
    const filtrado = _query.trim() || _filtro.estado !== 'todos' || _filtro.canal || _filtro.medio || _filtro.desde || _filtro.hasta;
    count.textContent = filtrado
        ? `${visibles.length} de ${_pedidos.length} pedidos`
        : `${_pedidos.length} pedido${_pedidos.length === 1 ? '' : 's'}`;

    // KPI-v0 del filtro activo (§4.2): n · $suma (la suma omite los sin-dinero).
    const t = totalesFiltro(visibles);
    totalesEl.hidden = !visibles.length;
    totalesEl.innerHTML = `<strong>${t.n}</strong> pedido${t.n === 1 ? '' : 's'} · <strong class="adm-money">${esc(cop(t.totalCOP))}</strong>` +
        (t.excluidos ? ` <span class="adm-td-muted">(la suma omite ${t.excluidos} sin dinero: cancelados/expirados/anulados/reembolsados/en curso)</span>` : '');

    if (!visibles.length) {
        tbody.innerHTML = '<tr><td colspan="8" class="adm-td-muted">Nada coincide con esa búsqueda o filtro. El código no usa 0, O, 1, I, L, U ni V — revisa esos caracteres.</td></tr>';
        return;
    }

    // Filas: cada valor interpolado pasa por esc() (ver cabecera).
    tbody.innerHTML = visibles.map(p => {
        const est = estadoPedido(p.estado);
        const cliente = nombreComprador(p) || (p.canal === 'pos' ? 'Mostrador' : '—');
        return `
        <tr class="ped-row" data-id="${esc(p.id)}" tabindex="0" aria-label="Ver pedido ${esc(idVisible(p))}">
            <td class="adm-num adm-nowrap">${esc(idVisible(p))}</td>
            <td class="adm-td-muted adm-nowrap">${esc(fmtDateTime(p.createdAt))}</td>
            <td>${esc(canalLabel(p.canal))}</td>
            <td class="adm-cell-main" title="${esc(p.pieceName || '')}">${esc(p.pieceName || '—')}</td>
            <td class="adm-cell-main" title="${esc(cliente)}">${esc(cliente)}</td>
            <td class="adm-money" style="text-align:right">${esc(cop(p.total))}</td>
            <td>${esc(medioLabel(p.medio))}</td>
            <td><span class="adm-pill adm-pill--${esc(est.pill)}">${esc(est.label)}</span></td>
        </tr>`;
    }).join('');
}

// ─── Detalle ────────────────────────────────────────────────────────────────────
function abrirDetalle(id) {
    const p = _pedidos.find(x => x.id === id);
    if (!p) return;
    _abierto = id;
    _historial = null;
    cerrarForm();
    renderDetalle(p);
    document.getElementById('ped-modal').hidden = false;
    cargarHistorial(id);
}

function cerrarModal() {
    _abierto = null;
    _historial = null;
    cerrarForm();
    document.getElementById('ped-modal').hidden = true;
    // Limpia el ?id= para que recargar no re-abra un pedido viejo.
    if (new URLSearchParams(location.search).has('id')) {
        history.replaceState(null, '', location.pathname);
    }
}

let _deepLinkId = new URLSearchParams(location.search).get('id') || null;
function abrirDeepLink() {
    if (!_deepLinkId) return;
    const p = _pedidos.find(x => x.id === _deepLinkId);
    if (p) { const id = _deepLinkId; _deepLinkId = null; abrirDetalle(id); }
}

async function cargarHistorial(id) {
    try {
        const h = await historialPedido(id);
        if (_abierto !== id) return;   // el modal cambió/cerró mientras cargaba
        _historial = h;
    } catch (err) {
        console.error('[pedidos] historial:', err?.code, err?.message);
        if (_abierto !== id) return;
        _historial = [];
    }
    const p = _pedidos.find(x => x.id === id);
    if (p) renderDetalle(p);
}

// Par etiqueta→valor del detalle. `ddHtml` llega YA escapado por el caller (esc() en cada dato).
function kv(dt, ddHtml) {
    return ddHtml ? `<dt>${esc(dt)}</dt><dd>${ddHtml}</dd>` : '';
}

function renderDetalle(p) {
    const est = estadoPedido(p.estado);
    document.getElementById('ped-modal-title').textContent = `Pedido ${idVisible(p)}`;

    const s = p.shipping || null;
    const nombre = nombreComprador(p);
    const dir = direccionTexto(s);
    const entrega = entregaLabel(p.tipoEntrega);
    const d = p.desglose || {};

    // Motivo de revisión (a_revisar / pagado_sin_stock): lo más urgente, arriba y en rojo.
    const alerta = p.revisarMotivo
        ? `<div class="ped-alert">⚠ Requiere revisión: ${esc(p.revisarMotivo)}</div>` : '';

    // Bloque pago
    const desglosePeso = d.tipo === 'por_peso'
        ? kv('Desglose', `${esc(String(d.peso ?? '—'))} g × ${esc(cop(d.valorGramo))}/g + mano de obra ${esc(cop(d.manoObra))}`)
        : '';
    const pago = `
    <section class="ped-block">
        <h3>Pago</h3>
        <dl class="ped-kv">
            ${p.codigo ? kv('Código', `<strong class="adm-num">${esc(p.codigo)}</strong> <button class="adm-btn adm-btn--ghost adm-btn--sm" data-copy="${esc(p.codigo)}" data-copy-label="Código copiado">⧉</button>`) : ''}
            ${kv('Total', `<strong class="adm-money ped-total">${esc(cop(p.total))}</strong>`)}
            ${desglosePeso}
            ${kv('Medio', esc(medioLabel(p.medio)))}
            ${kv('Canal', esc(canalLabel(p.canal)))}
            ${kv('Estado', `<span class="adm-pill adm-pill--${esc(est.pill)}">${esc(est.label)}</span>`)}
            ${p.wompiTxId ? kv('Transacción Wompi', `<span class="adm-num">${esc(p.wompiTxId)}</span> <button class="adm-btn adm-btn--ghost adm-btn--sm" data-copy="${esc(p.wompiTxId)}" data-copy-label="Transacción copiada">⧉</button>`) : ''}
            ${p.confirmadoPor ? kv('Confirmado por', `${esc(p.confirmadoPor === 'wompi-webhook' ? 'Wompi (automático)' : p.confirmadoPor)}${p.confirmadoEn ? ' · ' + esc(fmtDateTime(p.confirmadoEn)) : ''}`) : ''}
            ${p.estado === 'pago_pendiente' && p.reservaExpira ? kv('Reserva vence', esc(fmtDateTime(p.reservaExpira))) : ''}
        </dl>
    </section>`;

    // Bloque pieza
    const pieza = `
    <section class="ped-block">
        <h3>Pieza</h3>
        <dl class="ped-kv">
            ${kv('Nombre', esc(p.pieceName || '—'))}
            ${p.pieceSlug ? kv('Ver en la web', `<a href="${esc(pieceUrl(p.pieceSlug))}" target="_blank" rel="noopener">${esc(p.pieceSlug)} ↗</a>`) : ''}
        </dl>
    </section>`;

    // Bloque comprador (solo pedidos web con datos)
    let comprador = '';
    if (s) {
        const dig = waPhone(s.countryIso2, s.phone);
        const botones = [
            dig ? `<a class="adm-btn adm-btn--primary adm-btn--sm" href="https://wa.me/${esc(dig)}" target="_blank" rel="noopener">WhatsApp</a>` : '',
            dig ? `<a class="adm-btn adm-btn--ghost adm-btn--sm" href="tel:+${esc(dig)}">Llamar</a>` : '',
            s.email ? `<a class="adm-btn adm-btn--ghost adm-btn--sm" href="mailto:${esc(s.email)}">Email</a>` : '',
        ].filter(Boolean).join('');
        comprador = `
        <section class="ped-block">
            <h3>Comprador</h3>
            <dl class="ped-kv">
                ${kv('Nombre', esc(nombre || '—'))}
                ${s.docNumber ? kv('Documento', esc(`${s.docType || 'Doc'} ${s.docNumber}`)) : ''}
                ${s.phone ? kv('Teléfono', esc(s.phone)) : ''}
                ${s.email ? kv('Email', esc(s.email)) : ''}
            </dl>
            ${botones ? `<div class="ped-contact-row">${botones}</div>` : ''}
        </section>`;
    }

    // Bloque entrega (dirección pedida por el cliente en el checkout)
    const entregaBlock = (entrega || dir) ? `
    <section class="ped-block">
        <h3>Entrega</h3>
        <dl class="ped-kv">
            ${kv('Tipo', esc(entrega || '—'))}
            ${dir ? kv('Dirección', `${esc(dir)} <button class="adm-btn adm-btn--ghost adm-btn--sm" data-copy="${esc(dir)}" data-copy-label="Dirección copiada">⧉ Copiar</button>`) : ''}
        </dl>
    </section>` : '';

    document.getElementById('ped-detail').innerHTML =
        alerta + pago + pieza + comprador + entregaBlock +
        logisticaBlock(p) + sinStockBlock(p) + accionesBlock(p) + historialBlock() + registroBlock(p);

    // Si el estado cambió en vivo y la acción abierta ya no es válida, cierra el mini-form
    // (evita que Kary complete un form que la CF va a rechazar).
    if (_accion && _accion !== 'sinstock' && !(TRANSICIONES_PEDIDO[p.estado] || []).includes(_accion)) {
        cerrarForm();
        admToast('El pedido cambió de estado — revisa las acciones disponibles.', 'default', 4000);
    }
}

/** Lo que la LOGÍSTICA ya registró (flete/guía/POD/reembolso/cancelación) — visible tras cada transición. */
function logisticaBlock(p) {
    const f = p.flete || null;
    const pod = p.pod || null;
    const filas = [
        p.transportadora ? kv('Transportadora', esc(p.transportadora)) : '',
        p.guia ? kv('Guía', `<span class="adm-num">${esc(p.guia)}</span> <button class="adm-btn adm-btn--ghost adm-btn--sm" data-copy="${esc(p.guia)}" data-copy-label="Guía copiada">⧉</button>`) : '',
        (f && Number(f.valorCOP) > 0) ? kv('Flete / domicilio', esc(`${cop(f.valorCOP)} · ${f.cobro === 'asumido' ? 'lo asume Bersaglio' : 'se cobra al cliente'} · ${f.estado === 'recibido' ? 'recibido' : 'pendiente'}${f.medio ? ' · ' + f.medio : ''}`)) : '',
        p.valorDeclarado ? kv('Valor declarado', esc(cop(p.valorDeclarado))) : '',
        typeof p.asegurado === 'boolean' ? kv('Asegurado', p.asegurado ? 'Sí' : 'No') : '',
        p.pesoEntregado ? kv('Peso entregado', esc(`${p.pesoEntregado} g${p.desglose?.peso ? ` (cobrado: ${p.desglose.peso} g)` : ''}`)) : '',
        p.entregadoEn ? kv('Entregado', esc(fmtDateTime(p.entregadoEn))) : '',
        pod?.receptorNombre ? kv('Recibió', esc(pod.receptorNombre)) : '',
        pod?.cedulaCotejada ? kv('Retiro', 'Cédula cotejada ✓') : '',
        pod?.evidencia ? kv('Evidencia', esc(pod.evidencia)) : '',
        pod?.enMano ? kv('Entrega', 'Venta en mano (mostrador)') : '',
        p.motivoCancelacion ? kv('Cancelado', esc(`${p.motivoCancelacion}${p.canceladoEn ? ' · ' + fmtDateTime(p.canceladoEn) : ''}`)) : '',
        p.motivoAnulacion ? kv('Anulado', esc(`${p.motivoAnulacion}${p.anuladoEn ? ' · ' + fmtDateTime(p.anuladoEn) : ''}`)) : '',
        p.reembolso ? kv('Reembolso', esc(`${cop(p.reembolso.monto)} por ${medioLabel(p.reembolso.medio)}${p.reembolso.referencia ? ' · ref ' + p.reembolso.referencia : ''}${p.reembolsadoEn ? ' · ' + fmtDateTime(p.reembolsadoEn) : ''}`)) : '',
    ].filter(Boolean).join('');
    if (!filas) return '';
    // Aviso de despacho (§3.5): la web no lee el estado (anti-oráculo §166) → Kary lo manda por WhatsApp.
    const aviso = (p.estado === 'despacho_nacional' && p.transportadora && p.guia)
        ? `<div class="ped-contact-row"><button class="adm-btn adm-btn--ghost adm-btn--sm" data-copy="${esc(plantillaDespacho(p))}" data-copy-label="Aviso de despacho copiado — pégalo en WhatsApp">⧉ Copiar aviso de despacho</button></div>`
        : '';
    return `<section class="ped-block"><h3>Logística</h3><dl class="ped-kv">${filas}</dl>${aviso}</section>`;
}

/** pagado_sin_stock (§4.3): el cliente pagó y la pieza se agotó — dos salidas guiadas. */
function sinStockBlock(p) {
    if (p.estado !== 'pagado_sin_stock') return '';
    const s = p.shipping || {};
    const dig = waPhone(s.countryIso2, s.phone);
    const plantilla = plantillaSinStock(p);
    const waBtn = dig
        ? `<a class="adm-btn adm-btn--primary adm-btn--sm" href="https://wa.me/${esc(dig)}?text=${esc(encodeURIComponent(plantilla))}" target="_blank" rel="noopener">Ofrecer refabricación (WhatsApp)</a>`
        : `<button class="adm-btn adm-btn--primary adm-btn--sm" data-copy="${esc(plantilla)}" data-copy-label="Oferta copiada — envíala al cliente">⧉ Copiar oferta de refabricación</button>`;
    return `
    <section class="ped-block">
        <h3>Resolver: el cliente pagó pero la pieza se agotó</h3>
        <p class="ped-guia">El pago entró pero la pieza se agotó antes de apartarla. Ofrécele al cliente
        refabricarla a su medida, o devuélvele el dinero y anula el pedido.</p>
        <div class="ped-contact-row">
            ${waBtn}
            <button class="adm-btn adm-btn--danger adm-btn--sm" data-sinstock>Reembolsar y anular</button>
        </div>
    </section>`;
}

/** Acciones de transición (§4.4): botones = espejo TRANSICIONES_PEDIDO; la CF valida/escribe. */
function accionesBlock(p) {
    const destinos = TRANSICIONES_PEDIDO[p.estado] || [];
    if (!destinos.length) return '';
    const botones = destinos.map(a => {
        const acc = ACCION_TRANSICION[a] || { label: a, tono: 'primary' };
        const cls = acc.tono === 'danger' ? 'adm-btn--danger' : 'adm-btn--primary';
        return `<button class="adm-btn ${cls} adm-btn--sm" data-accion="${esc(a)}">${esc(acc.label)}</button>`;
    }).join('');
    return `
    <section class="ped-block">
        <h3>Acciones</h3>
        <div class="ped-contact-row">${botones}</div>
        <details class="ped-help">
            <summary>¿Cómo despacho un pedido?</summary>
            <ol>
                <li><strong>Pagado</strong> → «Pasar a preparación» cuando empieces a alistar la pieza.</li>
                <li>Desde preparación eliges la ruta: <strong>transportadora</strong> (nacional), <strong>entrega local</strong> (mensajero) o <strong>retiro</strong> en el atelier.</li>
                <li>Al despachar por transportadora registra <strong>guía y flete</strong> — el flete se cobra aparte, nunca cambia el total del pedido.</li>
                <li>Copia el <strong>aviso de despacho</strong> y envíaselo al cliente por WhatsApp.</li>
                <li>Al entregar: retiro exige <strong>cotejar la cédula</strong>; entrega local pide el nombre de quien recibe.</li>
                <li>¿Se cayó la venta antes de entregar? «Cancelar» (la pieza vuelve al inventario).</li>
                <li>¿Devolución después de entregado (retracto/garantía)? «Registrar reembolso».</li>
            </ol>
        </details>
    </section>`;
}

/** Historial append-only (§4.5): la traza que escribe avanzarPedido (one-shot al abrir). */
function historialBlock() {
    let cuerpo;
    if (_historial === null) cuerpo = '<p class="adm-td-muted">Cargando historial…</p>';
    else if (!_historial.length) cuerpo = '<p class="adm-td-muted">Sin movimientos de estado registrados.</p>';
    else cuerpo = `<ul class="ped-hist">${_historial.map(h => `
        <li>
            <span class="adm-td-muted adm-nowrap">${esc(fmtDateTime(h.at))}</span>
            <span>${esc(estadoPedido(h.de).label)} → <strong>${esc(estadoPedido(h.a).label)}</strong></span>
            ${h.nota ? `<div class="ped-hist-nota">${esc(h.nota)}</div>` : ''}
        </li>`).join('')}</ul>`;
    return `<section class="ped-block"><h3>Historial</h3>${cuerpo}</section>`;
}

function registroBlock(p) {
    const habeas = p.habeasData?.aceptado
        ? kv('Habeas Data', `Aceptado${p.habeasData.fecha ? ' · ' + esc(fmtDateTime(p.habeasData.fecha)) : ''}${p.habeasData.version ? ' · ' + esc(p.habeasData.version) : ''}`)
        : '';
    return `
    <section class="ped-block">
        <h3>Registro</h3>
        <dl class="ped-kv">
            ${kv('Creado', esc(fmtDateTime(p.createdAt)))}
            ${p.numero != null ? kv('Consecutivo interno', `#${esc(p.numero)} <span class="adm-td-muted">(contable — nunca se comparte al cliente)</span>`) : ''}
            ${p.autor ? kv('Registrado por', esc(p.autor)) : ''}
            ${habeas}
        </dl>
    </section>`;
}

// ─── Mini-forms de transición (§4.4) ────────────────────────────────────────────
// Viven en #ped-form-wrap (hermano de #ped-detail): el re-render en vivo del detalle
// NO borra lo que Kary está escribiendo.

function abrirForm(accion) {
    const p = _pedidos.find(x => x.id === _abierto);
    if (!p) return;
    _accion = accion;
    renderForm(p);
    document.getElementById('ped-form-wrap').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function cerrarForm() {
    _accion = null;
    const wrap = document.getElementById('ped-form-wrap');
    if (wrap) wrap.innerHTML = '';
}

// Campo del mini-form (label + control). El control llega como HTML CONSTANTE (sin datos de Firestore).
const campo = (label, ctrl) => `<label class="ped-form-campo"><span>${esc(label)}</span>${ctrl}</label>`;

function renderForm(p) {
    const a = _accion;
    const acc = a === 'sinstock' ? { label: 'Reembolsar y anular' } : (ACCION_TRANSICION[a] || { label: a });
    let campos = '';
    let aviso = '';

    if (a === 'despacho_nacional') {
        campos = `
            ${campo('Transportadora *', '<input class="adm-input" id="pf-transportadora" placeholder="Ej. Servientrega">')}
            ${campo('Guía *', '<input class="adm-input" id="pf-guia" placeholder="Número de guía">')}
            ${campo('Flete (COP)', '<input class="adm-input" id="pf-flete" type="number" min="0" inputmode="numeric" placeholder="0 = gratis / lo asume Bersaglio">')}
            <div id="pf-flete-deps" style="display:none">
            ${campo('¿Quién paga el flete?', `<select class="adm-input" id="pf-cobro"><option value="cobrado">Se cobra al cliente (aparte)</option><option value="asumido">Lo asume Bersaglio</option></select>`)}
            ${campo('Estado del pago del flete', `<select class="adm-input" id="pf-flete-estado"><option value="pendiente">Pendiente de pago</option><option value="recibido">Ya recibido</option></select>`)}
            ${campo('Medio de pago del flete', `<select class="adm-input" id="pf-flete-medio"><option value="">—</option><option value="efectivo">Efectivo</option><option value="transferencia">Transferencia</option><option value="wompi">Wompi</option></select>`)}
            </div>
            ${campo('Valor declarado (COP)', '<input class="adm-input" id="pf-declarado" type="number" min="0" inputmode="numeric" placeholder="Opcional">')}
            ${campo('¿Asegurado?', '<select class="adm-input" id="pf-asegurado"><option value="">—</option><option value="si">Sí</option><option value="no">No</option></select>')}
            ${p.desglose?.tipo === 'por_peso' ? campo('Peso entregado (g)', '<input class="adm-input" id="pf-peso" type="number" min="0" step="0.01" placeholder="Opcional — si difiere, registra merma">') : ''}`;
        aviso = 'El flete es un cargo APARTE: nunca cambia el total del pedido.';
    } else if (a === 'entrega_local') {
        // Domicilio cobrado (Daniel 2026-07-06): misma trazabilidad que el flete nacional.
        campos = `
            ${campo('¿Quién recibe? *', '<input class="adm-input" id="pf-receptor" placeholder="Nombre de quien recibe">')}
            ${campo('Domicilio (COP)', '<input class="adm-input" id="pf-flete" type="number" min="0" inputmode="numeric" placeholder="0 = gratis">')}
            <div id="pf-flete-deps" style="display:none">
            ${campo('¿Quién paga el domicilio?', `<select class="adm-input" id="pf-cobro"><option value="cobrado">Se cobra al cliente (aparte)</option><option value="asumido">Lo asume Bersaglio</option></select>`)}
            ${campo('Estado del pago del domicilio', `<select class="adm-input" id="pf-flete-estado"><option value="pendiente">Pendiente de pago</option><option value="recibido">Ya recibido</option></select>`)}
            ${campo('Medio de pago del domicilio', `<select class="adm-input" id="pf-flete-medio"><option value="">—</option><option value="efectivo">Efectivo</option><option value="transferencia">Transferencia</option><option value="wompi">Wompi</option></select>`)}
            </div>`;
        aviso = 'El domicilio es un cargo APARTE: nunca cambia el total del pedido. Déjalo en 0 si es gratis (con 0 no se pregunta cómo se paga).';
    } else if (a === 'listo_retiro') {
        aviso = 'El cliente retira en el atelier. Al entregarlo se cotejará la cédula.';
    } else if (a === 'entregado') {
        if (p.estado === 'listo_retiro') {
            campos = `<label class="ped-form-check"><input type="checkbox" id="pf-cedula"> Cotejé la cédula del comprador contra el documento del pedido *</label>`;
        } else if (p.estado === 'despacho_nacional') {
            campos = campo('Evidencia (opcional)', '<input class="adm-input" id="pf-evidencia" placeholder="URL de foto o nota de la transportadora">');
        } else if (p.estado === 'entrega_local') {
            aviso = `Confirma que el mensajero entregó${p.pod?.receptorNombre ? ' a ' + p.pod.receptorNombre : ''}.`;
        } else {
            aviso = 'Venta en mano: el pedido queda entregado sin pasos de logística.';
        }
    } else if (a === 'cancelado') {
        campos = campo('Motivo *', '<textarea class="adm-input" id="pf-motivo" rows="2" placeholder="Ej. el cliente desistió antes del despacho"></textarea>');
        aviso = p.consumioStock ? 'La pieza vuelve al inventario automáticamente.' : '';
    } else if (a === 'reembolsado') {
        campos = `
            ${campo('Medio del reembolso *', `<select class="adm-input" id="pf-r-medio"><option value="">—</option><option value="efectivo">Efectivo</option><option value="transferencia">Transferencia</option><option value="wompi">Wompi</option></select>`)}
            ${campo('Monto (COP) *', `<input class="adm-input" id="pf-r-monto" type="number" min="1" inputmode="numeric" value="${esc(String(Math.round(Number(p.total) || 0)))}">`)}
            ${campo('Referencia', '<input class="adm-input" id="pf-r-ref" placeholder="Opcional — # de transacción/nota">')}`;
        aviso = 'La pieza NO vuelve sola al inventario. Si el cliente devolvió la pieza física, avísale a quien lleva el inventario para que la registre.';
    } else if (a === 'sinstock') {
        campos = campo('Referencia del reembolso', '<input class="adm-input" id="pf-r-ref" placeholder="Opcional — # de transacción/nota">');
        aviso = 'Esto ANULA el pedido y registra que devolviste el dinero.';
    }

    const instructivoWompi = (p.medio === 'wompi' && (a === 'reembolsado' || a === 'sinstock')) ? `
        <div class="ped-instructivo">
            <strong>Reembolso Wompi (manual):</strong>
            <ol>
                <li>Entra a <span class="adm-num">comercios.wompi.co</span> → Transacciones.</li>
                <li>Busca la transacción <span class="adm-num">${esc(p.wompiTxId || '')}</span> ${p.wompiTxId ? `<button class="adm-btn adm-btn--ghost adm-btn--sm" data-copy="${esc(p.wompiTxId)}" data-copy-label="Transacción copiada">⧉</button>` : ''}</li>
                <li>Usa «Anular / Reversar» sobre esa transacción.</li>
                <li>Vuelve aquí y confirma este registro con la referencia.</li>
            </ol>
        </div>` : '';

    document.getElementById('ped-form-wrap').innerHTML = `
    <div class="ped-form">
        <h3>${esc(acc.label)}</h3>
        ${aviso ? `<p class="ped-guia">${esc(aviso)}</p>` : ''}
        ${instructivoWompi}
        <div class="ped-form-grid">${campos}</div>
        ${campo('Nota (opcional)', '<input class="adm-input" id="pf-nota" placeholder="Queda en el historial del pedido">')}
        <div class="ped-form-actions">
            <button class="adm-btn adm-btn--ghost" id="pf-cancelar">Volver</button>
            <button class="adm-btn ${(ACCION_TRANSICION[a]?.tono === 'danger' || a === 'sinstock') ? 'adm-btn--danger' : 'adm-btn--primary'}" id="pf-ok">${esc(acc.label)}</button>
        </div>
    </div>`;

    document.getElementById('pf-cancelar').addEventListener('click', cerrarForm);
    document.getElementById('pf-ok').addEventListener('click', () => submitForm(p.id));
    // Divulgación progresiva (Daniel 2026-07-10): con flete/domicilio en 0 NO se pregunta quién lo paga,
    // su estado ni el medio — solo aparecen si hay un valor > 0. display:contents preserva la grilla.
    const fleteInp = document.getElementById('pf-flete');
    const fleteDeps = document.getElementById('pf-flete-deps');
    if (fleteInp && fleteDeps) {
        const syncFleteDeps = () => { fleteDeps.style.display = (Number(fleteInp.value) > 0) ? 'contents' : 'none'; };
        fleteInp.addEventListener('input', syncFleteDeps);
        syncFleteDeps();
    }
    // El instructivo tiene botón de copiar (delegación aparte: este wrap no es #ped-detail).
    document.getElementById('ped-form-wrap').querySelectorAll('[data-copy]').forEach(b =>
        b.addEventListener('click', () => copiar(b.dataset.copy, b.dataset.copyLabel || 'Copiado')));
}

const val = id => (document.getElementById(id)?.value || '').trim();

function submitForm(pedidoId) {
    // SIEMPRE el pedido FRESCO (el listener pudo actualizarlo mientras Kary escribía).
    const p = _pedidos.find(x => x.id === pedidoId);
    if (!p || _enviando) return;
    const a = _accion;
    const nota = val('pf-nota') || undefined;
    const datos = {};

    if (a === 'despacho_nacional') {
        datos.transportadora = val('pf-transportadora');
        datos.guia = val('pf-guia');
        if (!datos.transportadora || !datos.guia) { admToast('Transportadora y guía son obligatorias.', 'danger'); return; }
        datos.flete = { valorCOP: Number(val('pf-flete')) || 0, cobro: val('pf-cobro') || 'cobrado', estado: val('pf-flete-estado') || 'pendiente', medio: val('pf-flete-medio') || null };
        if (val('pf-declarado')) datos.valorDeclarado = Number(val('pf-declarado'));
        if (val('pf-asegurado')) datos.asegurado = val('pf-asegurado') === 'si';
        if (val('pf-peso')) datos.pesoEntregado = Number(val('pf-peso'));
    } else if (a === 'entrega_local') {
        datos.receptorNombre = val('pf-receptor');
        if (!datos.receptorNombre) { admToast('Escribe el nombre de quien recibe.', 'danger'); return; }
        const dom = Number(val('pf-flete')) || 0;
        if (dom > 0) datos.flete = { valorCOP: dom, cobro: val('pf-cobro') || 'cobrado', estado: val('pf-flete-estado') || 'pendiente', medio: val('pf-flete-medio') || null };
    } else if (a === 'entregado') {
        if (p.estado === 'listo_retiro') {
            if (!document.getElementById('pf-cedula')?.checked) { admToast('Confirma que cotejaste la cédula del comprador.', 'danger'); return; }
            datos.cedulaCotejada = true;
        } else if (p.estado === 'despacho_nacional' && val('pf-evidencia')) {
            datos.evidencia = val('pf-evidencia');
        }
    } else if (a === 'cancelado') {
        datos.motivo = val('pf-motivo');
        if (!datos.motivo) { admToast('Cancelar exige un motivo.', 'danger'); return; }
    } else if (a === 'reembolsado') {
        const medio = val('pf-r-medio'), monto = Number(val('pf-r-monto'));
        if (!medio || !(monto > 0)) { admToast('Reembolso: elige el medio y un monto mayor a 0.', 'danger'); return; }
        datos.reembolso = { medio, monto };
        if (val('pf-r-ref')) datos.reembolso.referencia = val('pf-r-ref');
    } else if (a === 'sinstock') {
        const ref = val('pf-r-ref');
        const motivo = `Reembolso al cliente (pagado sin stock)${ref ? ' · ref ' + ref : ''}`;
        admConfirm(`¿Anular el pedido ${idVisible(p)} y registrar que devolviste ${cop(p.total)}?`, () => ejecutarAnulacion(p, motivo));
        return;
    }

    const confirmar = () => ejecutarTransicion(p, a, datos, nota);
    if (a === 'cancelado') admConfirm(`¿Cancelar el pedido ${idVisible(p)}?${p.consumioStock ? ' La pieza vuelve al inventario.' : ''}`, confirmar);
    else if (a === 'reembolsado') admConfirm(`¿Registrar el reembolso de ${cop(datos.reembolso.monto)} del pedido ${idVisible(p)}?`, confirmar);
    else confirmar();
}

async function ejecutarTransicion(p, a, datos, nota) {
    if (_enviando) return;
    _enviando = true;
    const btn = document.getElementById('pf-ok');
    if (btn) { btn.disabled = true; btn.textContent = 'Guardando…'; }
    try {
        const res = await avanzarPedido({ pedidoId: p.id, a, datos, nota });
        admToast(res.yaEstaba
            ? 'El pedido ya estaba en ese estado — no se duplicó.'
            : `✓ Pedido ${idVisible(p)} → ${estadoPedido(a).label}`, 'success', 4000);
        cerrarForm();
        cargarHistorial(p.id);   // el listener vivo refresca lista+detalle; el historial se re-lee aquí
    } catch (err) {
        const msg = (BUSINESS_ERR.includes(err?.code) && err?.message)
            ? err.message
            : errorMessage(err, 'No se pudo avanzar el pedido.');
        admToast(msg, 'danger', 5000);
        const b = document.getElementById('pf-ok');
        if (b) { b.disabled = false; b.textContent = (ACCION_TRANSICION[a]?.label) || 'Confirmar'; }
    } finally {
        _enviando = false;
    }
}

/** Salida de pagado_sin_stock (§2: sus salidas son las CFs EXISTENTES) → anularPedido con motivo. */
async function ejecutarAnulacion(p, motivo) {
    if (_enviando) return;
    _enviando = true;
    try {
        await anularPedido(p.id, motivo);
        admToast(`✓ Pedido ${idVisible(p)} anulado · quedó anotado que ya devolviste el dinero`, 'success', 4500);
        cerrarForm();
    } catch (err) {
        const msg = (BUSINESS_ERR.includes(err?.code) && err?.message)
            ? err.message
            : errorMessage(err, 'No se pudo anular el pedido.');
        admToast(msg, 'danger', 5000);
    } finally {
        _enviando = false;
    }
}

// ─── Copiar ─────────────────────────────────────────────────────────────────────
function copiarResumen() {
    const p = _pedidos.find(x => x.id === _abierto);
    if (!p) return;
    copiar(resumenPedido(p), 'Resumen copiado — pégalo en WhatsApp');
}

async function copiar(texto, msg) {
    try {
        await navigator.clipboard.writeText(texto);
        admToast(msg);
    } catch {
        admToast('No se pudo copiar en este navegador.', 'danger');
    }
}

init();
