/**
 * Bersaglio Admin — Mostrador (POS · B1 paso 3 · TODO-37).
 *
 * Kary registra una venta presencial de UNA pieza:
 *   elegir pieza → fijar precio (fijo si la pieza lo trae, o por peso con la misma fórmula
 *   de la calculadora) → medio de pago → confirmar → la CF `crearPedido` la persiste con
 *   stock atómico (candado = pieza) y total RE-CALCULADO server-side.
 *
 * Regla de oro del dinero: esta vista ESPEJA exactamente lo que cobra la CF — si la pieza
 * tiene precio numérico, ese es el total (la CF ignora el peso); si no, total = peso×gramo+mano.
 * Nunca mostramos un total distinto al que se cobra. La integridad la garantiza el servidor.
 *
 * Render: TODA interpolación en innerHTML pasa por esc() (convención L-03/F6, igual que piezas.js).
 */

import adminDb from './db.js';
import { admToast, admConfirm, initSidebar, esc, requireAuth, errorMessage, fmtDateTime } from './shared.js';
import { calcularPrecio } from './calculadora.js';
import { crearPedido, confirmarPago, ultimasVentas } from '../pedidos-service.js';

const cop = n => '$' + Math.round(Math.max(0, Number(n) || 0)).toLocaleString('es-CO');
const entero = n => Math.round(Math.max(0, Number(n) || 0));
// UUID de idempotencia (secure context → randomUUID; fallback defensivo si faltara).
const uid = () => (crypto?.randomUUID?.() || `pos-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`);

const MEDIO_LABEL = { efectivo: 'Efectivo', transferencia: 'Transferencia', wompi: 'Wompi' };
// Mensaje de negocio de la CF (claro, en español) > el genérico por código.
const BUSINESS_ERR = ['failed-precondition', 'invalid-argument', 'not-found', 'already-exists'];

let _allPieces = [];
let _selected  = null;    // pieza elegida
let _pedidoId  = null;    // UUID de la venta en curso (idempotencia)
let _query     = '';
let _submitting = false;

// ─── Init ───────────────────────────────────────────────────────────────────────
async function init() {
    await requireAuth('catalogo');   // Kary (catálogo) + admin/owner registran ventas (espeja la CF)
    await adminDb.init();
    initSidebar();

    _allPieces = adminDb.getAllPieces();
    renderResults();

    // Real-time: si el catálogo cambia (p.ej. la pieza recién vendida desaparece), refresca.
    adminDb.on('pieces', pieces => { _allPieces = pieces; renderResults(); });

    document.getElementById('pos-search').addEventListener('input', e => {
        _query = e.target.value.trim().toLowerCase();
        renderResults();
    });
    document.getElementById('pos-change').addEventListener('click', resetSale);
    document.getElementById('pos-medio').addEventListener('change', updateMedioHint);
    ['pos-gramo', 'pos-peso', 'pos-mano'].forEach(id =>
        document.getElementById(id).addEventListener('input', recalcTotal));
    document.getElementById('pos-submit').addEventListener('click', handleSubmit);

    updateMedioHint();
    loadVentas();
}

// ─── Paso 1: elegir pieza ─────────────────────────────────────────────────────
function availablePieces() {
    // Vendibles = todo lo que no esté 'vendida' (legacy sin estado = disponible, default tolerante).
    return _allPieces.filter(p => (p.estado || 'disponible') !== 'vendida');
}

function priceHint(p) {
    return (typeof p.price === 'number' && isFinite(p.price)) ? cop(p.price) : 'Por peso';
}

function renderResults() {
    const ul   = document.getElementById('pos-results');
    const hint = document.getElementById('pos-picker-hint');
    if (!_query) { ul.innerHTML = ''; hint.hidden = false; hint.textContent = 'Escribe para buscar entre las piezas disponibles.'; return; }

    const matches = availablePieces().filter(p =>
        (p.name || '').toLowerCase().includes(_query) ||
        (p.code || '').toLowerCase().includes(_query)
    ).slice(0, 8);

    if (!matches.length) { ul.innerHTML = ''; hint.hidden = false; hint.textContent = 'No hay piezas disponibles con ese criterio.'; return; }

    hint.hidden = true;
    ul.innerHTML = matches.map(p => `
        <li>
            <button type="button" class="pos-result" data-id="${esc(p.id)}">
                <span class="pos-result-name">${esc(p.name || 'Pieza')}</span>
                <span class="pos-result-meta">
                    <code>${esc(p.code || '—')}</code>
                    <span class="pos-result-price">${esc(priceHint(p))}</span>
                </span>
            </button>
        </li>`).join('');

    ul.querySelectorAll('.pos-result').forEach(btn =>
        btn.addEventListener('click', () => selectPiece(btn.dataset.id)));
}

function selectPiece(id) {
    const piece = _allPieces.find(p => p.id === id);
    if (!piece) { admToast('Esa pieza ya no está disponible.', 'danger'); renderResults(); return; }

    _selected = piece;
    _pedidoId = uid();   // nueva venta → nuevo UUID de idempotencia

    document.getElementById('pos-sel-name').textContent = piece.name || 'Pieza';
    document.getElementById('pos-sel-code').textContent = piece.code ? `· ${piece.code}` : '';
    document.getElementById('pos-picker').hidden   = true;
    document.getElementById('pos-selected').hidden = false;
    document.getElementById('pos-sale').hidden     = false;

    setupPriceMode(piece);
    recalcTotal();
}

function resetSale() {
    _selected = null;
    _pedidoId = null;
    _query = '';
    document.getElementById('pos-search').value = '';
    document.getElementById('pos-picker').hidden   = false;
    document.getElementById('pos-selected').hidden = true;
    document.getElementById('pos-sale').hidden     = true;
    ['pos-gramo', 'pos-peso', 'pos-mano'].forEach(id => { document.getElementById(id).value = ''; });
    renderResults();
    document.getElementById('pos-search').focus();
}

// ─── Paso 2: precio (espeja la CF) ────────────────────────────────────────────
function isPrecioFijo(p) { return typeof p?.price === 'number' && isFinite(p.price); }

function setupPriceMode(piece) {
    const fijoBox = document.getElementById('pos-price-fijo');
    const pesoBox = document.getElementById('pos-price-peso');
    if (isPrecioFijo(piece)) {
        fijoBox.hidden = false;
        pesoBox.hidden = true;
        document.getElementById('pos-fijo-val').textContent = cop(piece.price);
        const fijoHint = document.getElementById('pos-fijo-hint');
        // price = 0 → la CF rechaza (total > 0). Avisamos en vez de dejar registrar y fallar.
        if (entero(piece.price) <= 0) {
            fijoHint.hidden = false;
            fijoHint.textContent = 'Esta pieza tiene precio 0. Edítala en Piezas (ponle precio) o quítale el precio para cobrar por peso.';
        } else {
            fijoHint.hidden = true;
        }
    } else {
        fijoBox.hidden = true;
        pesoBox.hidden = false;
        document.getElementById('pos-gramo').focus();
    }
}

/** Total que se MOSTRARÁ y se cobrará (mismo criterio que pedidos-core). */
function computeTotal() {
    if (!_selected) return 0;
    if (isPrecioFijo(_selected)) return entero(_selected.price);
    const r = calcularPrecio({
        valorGramo: document.getElementById('pos-gramo').value,
        peso:       document.getElementById('pos-peso').value,
        manoObra:   document.getElementById('pos-mano').value,
    });
    return r.total;
}

function recalcTotal() {
    const total = computeTotal();
    document.getElementById('pos-total').textContent = cop(total);
    document.getElementById('pos-submit').disabled = !(total > 0) || _submitting;
}

// ─── Paso 3: medio de pago ────────────────────────────────────────────────────
function updateMedioHint() {
    const medio = document.getElementById('pos-medio').value;
    const hint  = document.getElementById('pos-medio-hint');
    hint.textContent = medio === 'efectivo'
        ? 'Se marcará como PAGADO.'
        : 'Quedará "por verificar" hasta que confirmes que llegó el dinero.';
}

// ─── Confirmar y registrar ────────────────────────────────────────────────────
function handleSubmit() {
    if (!_selected || _submitting) return;
    const total = computeTotal();
    if (total <= 0) { admToast('El total debe ser mayor a 0.', 'danger'); return; }

    const medio = document.getElementById('pos-medio').value;
    const nombre = _selected.name || 'la pieza';
    admConfirm(
        `¿Registrar la venta de «${nombre}» por ${cop(total)} (${MEDIO_LABEL[medio] || medio})?`,
        () => doRegister(medio, total)
    );
}

async function doRegister(medio, total) {
    _submitting = true;
    const btn = document.getElementById('pos-submit');
    btn.disabled = true;
    const prevText = btn.textContent;
    btn.textContent = 'Registrando…';

    const payload = { pedidoId: _pedidoId, pieceId: _selected.id, medio, canal: 'pos' };
    if (!isPrecioFijo(_selected)) {
        payload.valorGramo = document.getElementById('pos-gramo').value;
        payload.peso       = document.getElementById('pos-peso').value;
        payload.manoObra   = document.getElementById('pos-mano').value;
    }

    try {
        const res = await crearPedido(payload);
        if (res.yaExistia) {
            admToast(`Esta venta ya estaba registrada (Pedido #${res.numero}) — no se duplicó.`, 'default', 4000);
        } else {
            admToast(`✓ Venta registrada · Pedido #${res.numero} · ${cop(res.total)}`, 'success', 4000);
        }
        resetSale();
        loadVentas();
    } catch (err) {
        // Mensaje de negocio de la CF ("Esa pieza ya fue vendida.") cuando aplica; si no, el genérico.
        const msg = (BUSINESS_ERR.includes(err?.code) && err?.message)
            ? err.message
            : errorMessage(err, 'No se pudo registrar la venta.');
        admToast(msg, 'danger', 5000);
        // Mantenemos _pedidoId → reintentar es idempotente (no crea dos ventas).
    } finally {
        _submitting = false;
        btn.textContent = prevText;
        recalcTotal();   // re-evalúa disabled
    }
}

// ─── Ventas recientes ─────────────────────────────────────────────────────────
async function loadVentas() {
    const ul    = document.getElementById('pos-ventas');
    const empty = document.getElementById('pos-ventas-empty');
    let ventas = [];
    try {
        ventas = await ultimasVentas(15);
    } catch (err) {
        console.error('[pos] ultimasVentas:', err?.code || err);
        empty.hidden = false;
        empty.querySelector('p').textContent = 'No se pudieron cargar las ventas.';
        ul.innerHTML = '';
        return;
    }

    empty.hidden = ventas.length > 0;
    if (!ventas.length) { ul.innerHTML = ''; return; }

    ul.innerHTML = ventas.map(v => {
        const pagado = v.estado === 'pagado';
        const estadoLabel = pagado ? 'Pagado' : 'Por verificar';
        const estadoCls   = pagado ? 'adm-pill--green' : 'adm-pill--gold';
        // Solo las ventas "por verificar" (transferencia/Wompi) ofrecen confirmar "vi la plata".
        const confirmBtn = pagado ? '' :
            `<button class="adm-btn adm-btn--ghost adm-btn--sm pos-venta-confirm" data-id="${esc(v.id)}">Confirmar pago</button>`;
        return `
        <li class="pos-venta">
            <div class="pos-venta-main">
                <span class="pos-venta-num">#${esc(v.numero ?? '—')}</span>
                <span class="pos-venta-name">${esc(v.pieceName || 'Pieza')}</span>
            </div>
            <div class="pos-venta-meta">
                <strong>${esc(cop(v.total))}</strong>
                <span class="adm-pill ${estadoCls}">${esc(estadoLabel)}</span>
                <span class="pos-venta-time">${esc(fmtDateTime(v.createdAt))}</span>
                ${confirmBtn}
            </div>
        </li>`;
    }).join('');

    ul.querySelectorAll('.pos-venta-confirm').forEach(btn =>
        btn.addEventListener('click', () => confirmarVenta(btn.dataset.id)));
}

// "Vi la plata": confirma el pago de una venta por verificar (transferencia/Wompi) → pagado.
function confirmarVenta(pedidoId) {
    admConfirm('¿Confirmas que ya viste el pago de esta venta? Quedará como pagada.', async () => {
        try {
            await confirmarPago(pedidoId);
            admToast('✓ Pago confirmado', 'success');
            loadVentas();
        } catch (err) {
            const msg = (BUSINESS_ERR.includes(err?.code) && err?.message)
                ? err.message
                : errorMessage(err, 'No se pudo confirmar el pago.');
            admToast(msg, 'danger', 4000);
        }
    });
}

init();
