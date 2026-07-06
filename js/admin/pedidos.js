/**
 * Bersaglio Admin — Pedidos (F1-PUENTE · TODO-68, plan único ERP v4).
 *
 * Lista + detalle READ-ONLY de pedidos de TODOS los canales (web / mostrador / WhatsApp),
 * en vivo (onPedidosChange re-suscribe solo). Cierra la ventana ciega post-`pagado`: Kary ve
 * el pedido completo (comprador, cédula, entrega, teléfono con WhatsApp directo) sin tocar
 * la base. Las ACCIONES (avanzar estado, logística, colas) llegan en F1-CORE — aquí ninguna
 * escritura, cero riesgo sobre dinero/stock.
 *
 * Deep-link: admin-pedidos.html?id=<pedidoId> abre el detalle directo (destino del push A.6).
 *
 * Seguridad XSS (convención L-03/F6 del panel, igual que pos.js/cuentas.js): TODO valor
 * dinámico que entra a innerHTML pasa por esc() de shared.js — sin excepción. No se
 * interpola NUNCA un dato de Firestore sin escapar.
 */

import { admToast, initSidebar, esc, requireAuth, fmtDateTime } from './shared.js';
import { onPedidosChange } from '../pedidos-service.js';
import { estadoPedido, canalLabel, medioLabel, entregaLabel, nombreComprador, direccionTexto, resumenPedido, idVisible, pedidoCoincide } from './pedidos-format.js';
import { pieceUrl } from '../core/urls.js';
import { waPhone } from '../core/countries.js';

const cop = n => '$' + Math.round(Math.max(0, Number(n) || 0)).toLocaleString('es-CO');

let _pedidos = [];
let _abierto = null;    // id del pedido mostrado en el modal (para refrescarlo en vivo)
let _query   = '';      // búsqueda tolerante (§166: código sin guiones/minúsculas/sufijo)

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
    // Botones dinámicos del detalle (copiar dirección/tx) — delegación, el detalle se re-pinta en vivo.
    document.getElementById('ped-detail').addEventListener('click', e => {
        const btn = e.target.closest('[data-copy]');
        if (btn) copiar(btn.dataset.copy, btn.dataset.copyLabel || 'Copiado');
    });
}

// ─── Lista ──────────────────────────────────────────────────────────────────────
function renderLista() {
    const tbody = document.getElementById('ped-body');
    const empty = document.getElementById('ped-empty');
    const count = document.getElementById('ped-count');

    if (!_pedidos.length) {
        tbody.innerHTML = '';
        empty.hidden = false;
        count.textContent = '';
        return;
    }
    empty.hidden = true;

    const visibles = _pedidos.filter(p => pedidoCoincide(p, _query));
    count.textContent = _query.trim()
        ? `${visibles.length} de ${_pedidos.length} pedidos`
        : `${_pedidos.length} pedido${_pedidos.length === 1 ? '' : 's'}`;
    if (!visibles.length) {
        tbody.innerHTML = '<tr><td colspan="8" class="adm-td-muted">Nada coincide con esa búsqueda. El código no usa 0, O, 1, I, L, U ni V — revisa esos caracteres.</td></tr>';
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

// ─── Detalle (read-only) ────────────────────────────────────────────────────────
function abrirDetalle(id) {
    const p = _pedidos.find(x => x.id === id);
    if (!p) return;
    _abierto = id;
    renderDetalle(p);
    document.getElementById('ped-modal').hidden = false;
}

function cerrarModal() {
    _abierto = null;
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

    // Bloque entrega
    const entregaBlock = (entrega || dir) ? `
    <section class="ped-block">
        <h3>Entrega</h3>
        <dl class="ped-kv">
            ${kv('Tipo', esc(entrega || '—'))}
            ${dir ? kv('Dirección', `${esc(dir)} <button class="adm-btn adm-btn--ghost adm-btn--sm" data-copy="${esc(dir)}" data-copy-label="Dirección copiada">⧉ Copiar</button>`) : ''}
        </dl>
    </section>` : '';

    // Bloque registro (auditoría liviana)
    const habeas = p.habeasData?.aceptado
        ? kv('Habeas Data', `Aceptado${p.habeasData.fecha ? ' · ' + esc(fmtDateTime(p.habeasData.fecha)) : ''}${p.habeasData.version ? ' · ' + esc(p.habeasData.version) : ''}`)
        : '';
    const registro = `
    <section class="ped-block">
        <h3>Registro</h3>
        <dl class="ped-kv">
            ${kv('Creado', esc(fmtDateTime(p.createdAt)))}
            ${p.numero != null ? kv('Consecutivo interno', `#${esc(p.numero)} <span class="adm-td-muted">(contable — nunca se comparte al cliente)</span>`) : ''}
            ${p.autor ? kv('Registrado por', esc(p.autor)) : ''}
            ${habeas}
        </dl>
    </section>`;

    document.getElementById('ped-detail').innerHTML = alerta + pago + pieza + comprador + entregaBlock + registro;
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
