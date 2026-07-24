/**
 * Bersaglio Admin — Cuentas y bancos (F-TESORERÍA B2 · TODO-78). SSoT: spec 2026-07-18 §3.
 *
 * Libro auxiliar de tesorería de Kary: las cuentas reales donde vive la plata (bancos, Nequi) +
 * las virtuales Caja/Bóveda (que se manejan en su módulo). Kary (admin) registra movimientos y
 * traslada; el owner aprueba retiros/ajustes (Bandeja, B4). Todo el dinero lo mueve la Cloud
 * Function (Admin SDK, recompute en tx D5); esta vista ESCUCHA (cuentasTesoreria + movimientos) y
 * dispara callables. El DOM se construye con métodos seguros (sin innerHTML) → cero inyección.
 * El saldo lo materializa el trigger (saldoActual) y lo muestra tal cual; los signos de la tabla
 * salen del espejo puro `tesoreria-format.js` (paridad con el servidor, inv.2).
 */
import adminDb from './db.js';
import { admToast, admConfirm, initSidebar, requireAuth, errorMessage, fmtDate, hasRole } from './shared.js';
import {
    crearCuentaTesoreria, registrarMovimientoTesoreria, trasladarEntreCuentas,
    marcarConciliado, reabrirCuadre, onCuentasTesoreriaChange, onMovsCuentaChange,
} from '../tesoreria-service.js';
import { ETIQUETAS_TIPO, signoDeMovimiento, computeSaldoCuenta, entero, TIPOS_VIRTUALES, sumaSaldosReales, throughputAnio } from './tesoreria-format.js';

// COP con signo (el saldo PUEDE ser negativo — V6 lo grita, sin clamp).
const cop = (n) => { const v = Math.round(Number(n) || 0); return (v < 0 ? '-$' : '$') + Math.abs(v).toLocaleString('es-CO'); };
const montoPos = (v) => Math.round(Math.max(0, Number(v) || 0));   // los montos de entrada son positivos
const uid = () => (crypto?.randomUUID?.() || `tes-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`);
const hoyISO = () => new Date().toLocaleDateString('en-CA');   // 'YYYY-MM-DD' en zona local
const BUSINESS_ERR = ['failed-precondition', 'invalid-argument', 'not-found', 'already-exists', 'permission-denied'];
const TITULAR_LABEL = { empresa: 'El negocio', kary: 'Kary', daniela: 'Daniela', veronica: 'Verónica' };
const TIPOS_SOCIA = new Set(['aporte_socia', 'reembolso_socia', 'retiro_socia']);
const TIPOS_CONTRAPARTE = new Set(['pago_proveedor', 'gasto']);
const MODULO_VIRTUAL = { caja: { href: 'admin-auditoria.html', label: 'Caja y turnos' }, boveda: { href: 'admin-boveda.html', label: 'Bóveda' } };

let _cuentas = [];
let _selectedId = null;
let _movs = [];
let _movsUnsub = null;
let _movOpId = null;   // idempotencia: opId perezoso del modal de registrar (reintento tras fallo reusa)
let _traOpId = null;   // idempotencia: opId perezoso del modal de traslado
let _ctaOpId = null;   // idempotencia: opId perezoso del modal de crear cuenta
let _isOwner = false;  // el botón "Reabrir cuadre" es owner-only (V19)
let _tab = 'movs';     // 'movs' | 'cuadre'
let _cuaMes = '';      // 'YYYY-MM' del cuadre
let _cuaChecked = new Set();   // borrador de los ✓ del cuadre (persistible en localStorage, V19)

// ─── DOM builder seguro (sin innerHTML) ──────────────────────────────────────
function el(tag, attrs = {}, kids = []) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
        if (v == null || v === false) continue;
        if (k === 'class') node.className = v;
        else if (k === 'text') node.textContent = v;
        else if (k === 'html') { /* prohibido: usar text */ }
        else node.setAttribute(k, v);
    }
    for (const c of [].concat(kids)) if (c) node.appendChild(c);
    return node;
}

const cuentaById = (id) => _cuentas.find(c => c.id === id) || null;
const esVirtual = (c) => c && TIPOS_VIRTUALES.includes(c.tipo);
const cuentasReales = () => _cuentas.filter(c => !esVirtual(c));
const cuentasRealesActivas = () => cuentasReales().filter(c => c.activa !== false);

async function init() {
    await requireAuth('admin');      // Kary (admin) registra; owner aprueba. La cajera NO ve tesorería.
    _isOwner = hasRole('owner');     // owner puede reabrir un cuadre sellado (V19)
    await adminDb.init();
    initSidebar();

    onCuentasTesoreriaChange(
        (cuentas) => { _cuentas = cuentas; onCuentasLoaded(); },
        (e) => admToast(errorMessage(e, 'No se pudieron leer las cuentas.'), 'danger', 4000),
    );

    // Botones de "agregar cuenta" (cabecera + estado-cero)
    document.getElementById('tes-nueva').addEventListener('click', openCrearCuenta);
    document.getElementById('tes-empty-cta').addEventListener('click', openCrearCuenta);

    // Modal crear cuenta
    document.getElementById('cta-close').addEventListener('click', closeCrearCuenta);
    document.getElementById('cta-cancel').addEventListener('click', closeCrearCuenta);
    document.getElementById('cta-submit').addEventListener('click', handleCrearCuenta);
    document.getElementById('cta-titular').addEventListener('change', updateCtaSociaWarn);
    document.getElementById('cta-modal').addEventListener('click', e => { if (e.target.id === 'cta-modal') closeCrearCuenta(); });

    // Modal registrar movimiento
    document.getElementById('tes-registrar').addEventListener('click', openMov);
    document.getElementById('mov-close').addEventListener('click', closeMov);
    document.getElementById('mov-cancel').addEventListener('click', closeMov);
    document.getElementById('mov-submit').addEventListener('click', handleMov);
    document.getElementById('mov-tipo').addEventListener('change', updateMovFields);
    document.getElementById('mov-modal').addEventListener('click', e => { if (e.target.id === 'mov-modal') closeMov(); });

    // Modal trasladar
    document.getElementById('tes-trasladar').addEventListener('click', openTraslado);
    document.getElementById('tra-close').addEventListener('click', closeTraslado);
    document.getElementById('tra-cancel').addEventListener('click', closeTraslado);
    document.getElementById('tra-submit').addEventListener('click', handleTraslado);
    document.getElementById('tra-modal').addEventListener('click', e => { if (e.target.id === 'tra-modal') closeTraslado(); });

    // Pestañas + cuadre (B3)
    document.getElementById('tab-movs').addEventListener('click', () => switchTab('movs'));
    document.getElementById('tab-cuadre').addEventListener('click', () => switchTab('cuadre'));
    document.getElementById('cua-mes').addEventListener('change', (e) => { _cuaMes = e.target.value; loadCuaDraft(); renderCuadre(); });
    document.getElementById('cua-extracto').addEventListener('input', updateCuaDiff);
    document.getElementById('cua-guardar').addEventListener('click', handleGuardarCuadre);
    document.getElementById('cua-ajuste').addEventListener('click', handleAjusteCuadre);
    document.getElementById('cua-reabrir').addEventListener('click', handleReabrir);
}

// ─── Cuentas: tarjetas + total ────────────────────────────────────────────────
function onCuentasLoaded() {
    const reales = cuentasReales();
    document.getElementById('tes-empty').hidden = reales.length > 0;

    // Total = Σ saldoActual de cuentas REALES activas (las virtuales no tienen saldo propio, D1).
    // Helper compartido con el "Plata total" de Hoy (inv.2: la parte de cuentas es UN solo número).
    const total = sumaSaldosReales(_cuentas);
    const totalEl = document.getElementById('tes-total');
    totalEl.textContent = cop(total);
    totalEl.classList.toggle('adm-money--debe', total < 0);

    renderCards();

    // Reconciliar selección: si la cuenta seleccionada desapareció, deseleccionar.
    if (_selectedId && !cuentaById(_selectedId)) selectCuenta(null);
    else if (_selectedId) renderMovsHeader();   // refrescar nombre/saldo/aviso socia
}

function renderCards() {
    const wrap = document.getElementById('tes-cards');
    wrap.textContent = '';
    // Reales primero (por nombre), luego virtuales.
    const orden = [...cuentasReales().sort((a, b) => String(a.nombre).localeCompare(String(b.nombre), 'es')),
                   ..._cuentas.filter(esVirtual)];
    for (const c of orden) wrap.appendChild(cardEl(c));
}

function cardEl(c) {
    const virtual = esVirtual(c);
    const chips = el('div', { class: 'tes-card-chips' });
    if (c.esDeSocia) chips.appendChild(el('span', { class: 'adm-pill adm-pill--gold', text: 'de socia' }));
    if (virtual) chips.appendChild(el('span', { class: 'adm-pill adm-pill--gray', text: 'virtual' }));

    const kids = [
        el('div', { class: 'tes-card-top' }, [
            el('span', { class: 'tes-card-name', text: c.nombre || '(sin nombre)' }),
            chips,
        ]),
        el('span', { class: 'tes-card-bank', text: virtual ? 'Se maneja en su módulo' : (c.banco || TITULAR_LABEL[c.titular] || '—') }),
    ];

    if (virtual) {
        const mod = MODULO_VIRTUAL[c.tipo];
        if (mod) kids.push(el('a', { class: 'tes-card-link', href: mod.href, text: `Ir a ${mod.label} →` }));
    } else {
        const saldo = entero(c.saldoActual);
        const saldoEl = el('strong', { class: 'tes-card-saldo adm-money', text: cop(saldo) });
        if (saldo < 0) saldoEl.classList.add('adm-money--debe');
        kids.push(saldoEl);
        if (c.activa === false) kids.push(el('span', { class: 'tes-card-bank', text: 'Inactiva' }));
    }

    const card = el('div', { class: 'tes-card' + (virtual ? ' tes-card--virtual' : '') + (c.id === _selectedId ? ' is-selected' : '') }, kids);
    if (!virtual) {
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.addEventListener('click', () => selectCuenta(c.id));
        card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectCuenta(c.id); } });
    }
    return card;
}

// ─── Selección de cuenta → movimientos ────────────────────────────────────────
function selectCuenta(id) {
    if (_movsUnsub) { _movsUnsub(); _movsUnsub = null; }
    _selectedId = id;
    _movs = [];
    renderCards();   // marca la tarjeta activa
    const card = document.getElementById('tes-movs-card');
    if (!id) { card.hidden = true; return; }
    card.hidden = false;
    switchTab('movs');   // al cambiar de cuenta, arranca en Movimientos
    renderMovsHeader();
    renderLedger();
    _movsUnsub = onMovsCuentaChange(
        id,
        (m) => { _movs = m; renderLedger(); updateSociaAnio(); if (_tab === 'cuadre') renderCuadre(); },
        200,
        (e) => admToast(errorMessage(e, 'No se pudieron leer los movimientos.'), 'danger', 4000),
    );
}

function renderMovsHeader() {
    const c = cuentaById(_selectedId);
    if (!c) return;
    document.getElementById('tes-movs-title').textContent = `Movimientos · ${c.nombre || ''}`;
    const warn = document.getElementById('tes-socia-warn');
    if (c.esDeSocia) {
        warn.hidden = false;
        warn.textContent = `Esta es una cuenta personal de ${TITULAR_LABEL[c.titular] || 'la socia'}. El sistema ordena y documenta cada peso, pero mezclar plata personal y del negocio tiene riesgos tributarios para ella. La meta es migrar todo a una cuenta a nombre del negocio (el RUT).`;
    } else {
        warn.hidden = true;
    }
    updateSociaAnio();
}

// V9 · Heads-up tributario: cuánto pasó por la cuenta de la socia este año (Σ|monto| firmes del
// año). Se recomputa también cuando llegan/cambian los movimientos. `_movs` viene topeado (200):
// si toca el tope, avisamos "o más" en vez de mentir con un exacto que podría estar truncado.
function updateSociaAnio() {
    const anioEl = document.getElementById('tes-socia-anio');
    if (!anioEl) return;
    const c = cuentaById(_selectedId);
    if (!c || !c.esDeSocia) { anioEl.hidden = true; return; }
    const anio = new Date().getFullYear();
    const pasado = throughputAnio(_movs, anio);
    const truncado = _movs.length >= 200 ? ' o más' : '';
    anioEl.hidden = false;
    anioEl.textContent = `Este año (${anio}) pasó por esta cuenta ${cop(pasado)}${truncado}. Si se acerca a los topes de la DIAN, coméntalo con tu contador.`;
}

function renderLedger() {
    const list = document.getElementById('tes-ledger');
    const empty = document.getElementById('tes-ledger-empty');
    list.textContent = '';
    empty.hidden = _movs.length > 0;

    const byId = {};
    for (const m of _movs) byId[m.id] = m;

    for (const m of _movs) {
        // Monto con signo desde el espejo puro; si el dato está corrupto, no rompas la fila entera.
        let signo = 0;
        try { signo = signoDeMovimiento(m, byId); } catch { signo = 0; }
        const val = signo * entero(m.monto);
        const txt = (val > 0 ? '+' : val < 0 ? '−' : '') + cop(Math.abs(val)).replace('-', '');
        const montoEl = el('strong', { class: 'adm-money', text: txt });
        montoEl.classList.add(val > 0 ? 'adm-money--favor' : (val < 0 ? 'adm-money--debe' : 'adm-money--cero'));

        const head = [el('span', { class: 'bov-mov-tipo', text: ETIQUETAS_TIPO[m.tipo] || m.tipo })];
        if (m.estado === 'pendiente_aprobacion') head.push(el('span', { class: 'adm-pill adm-pill--gold', text: 'pendiente' }));
        else if (m.estado === 'rechazado') head.push(el('span', { class: 'adm-pill adm-pill--gray', text: 'rechazado' }));
        if (m.conciliado) head.push(el('span', { class: 'adm-pill adm-pill--green', text: '✓ cuadrado' }));
        if (m.excedeAporte) head.push(el('span', { class: 'adm-pill adm-pill--red', text: 'excede aporte' }));
        if (m.soporteURL) head.push(el('span', { class: 'tes-clip', text: '📎', title: 'Tiene soporte' }));

        const sub = m.descripcion || (m.contraparte && m.contraparte.nombre) || (m.categoria ? `Categoría: ${m.categoria}` : '') || '—';
        const info = el('div', { class: 'bov-mov-info' }, [
            el('div', { class: 'bov-mov-head' }, head),
            el('span', { class: 'bov-mov-sub', text: sub }),
            el('span', { class: 'bov-mov-time', text: fmtDate(m.fecha) }),
        ]);
        list.appendChild(el('li', { class: 'bov-mov' }, [info, el('div', { class: 'bov-mov-right' }, [montoEl])]));
    }
}

// ─── Modal: agregar cuenta (onboarding V22) ───────────────────────────────────
function openCrearCuenta() {
    _ctaOpId = null;
    document.getElementById('cta-nombre').value = '';
    document.getElementById('cta-tipo').value = 'banco';
    document.getElementById('cta-banco').value = '';
    document.getElementById('cta-titular').value = 'empresa';
    document.getElementById('cta-saldo').value = '';
    document.getElementById('cta-fecha').value = hoyISO();
    document.getElementById('cta-soporte').value = '';
    updateCtaSociaWarn();
    const submit = document.getElementById('cta-submit');
    submit.disabled = false; submit.textContent = 'Agregar cuenta';
    document.getElementById('cta-modal').hidden = false;
    document.getElementById('cta-nombre').focus();
}
function closeCrearCuenta() { document.getElementById('cta-modal').hidden = true; }
function updateCtaSociaWarn() {
    const esSocia = document.getElementById('cta-titular').value !== 'empresa';
    document.getElementById('cta-socia-warn').hidden = !esSocia;
}
async function handleCrearCuenta() {
    const nombre = document.getElementById('cta-nombre').value.trim();
    const tipo = document.getElementById('cta-tipo').value;
    const banco = document.getElementById('cta-banco').value.trim();
    const titular = document.getElementById('cta-titular').value;
    const saldoInicial = montoPos(document.getElementById('cta-saldo').value);
    const fechaCorte = document.getElementById('cta-fecha').value;
    const soporteCorteURL = document.getElementById('cta-soporte').value.trim();
    if (!nombre) { admToast('Escribe un nombre para reconocer la cuenta.', 'danger'); return; }
    if (!fechaCorte) { admToast('Elige la fecha del saldo (corte).', 'danger'); return; }
    if (!_ctaOpId) _ctaOpId = uid();

    const submit = document.getElementById('cta-submit');
    submit.disabled = true; submit.textContent = 'Agregando…';
    try {
        const r = await crearCuentaTesoreria({
            opId: _ctaOpId, nombre, banco: banco || undefined, tipo, titular,
            esDeSocia: titular !== 'empresa', saldoInicial, fechaCorte,
            soporteCorteURL: soporteCorteURL || undefined,
        });
        _ctaOpId = null;
        admToast('✓ Cuenta agregada', 'success');
        closeCrearCuenta();
        if (r?.cuentaId) selectCuenta(r.cuentaId);
    } catch (err) {
        admToast((BUSINESS_ERR.includes(err?.code) && err?.message) ? err.message : errorMessage(err, 'No se pudo agregar la cuenta.'), 'danger', 4500);
        submit.disabled = false; submit.textContent = 'Agregar cuenta';
    }
}

// ─── Modal: registrar movimiento (V14 etiquetas humanas) ──────────────────────
function openMov() {
    const c = cuentaById(_selectedId);
    if (!c || esVirtual(c)) { admToast('Elige una cuenta real primero.', 'danger'); return; }
    _movOpId = null;
    document.getElementById('mov-cuenta-hint').textContent = `En la cuenta: ${c.nombre}`;
    document.getElementById('mov-tipo').value = 'ingreso_venta';
    document.getElementById('mov-categoria').value = 'arriendo';
    document.getElementById('mov-socia').value = 'kary';
    document.getElementById('mov-contraparte').value = '';
    document.getElementById('mov-monto').value = '';
    document.getElementById('mov-fecha').value = hoyISO();
    document.getElementById('mov-desc').value = '';
    document.getElementById('mov-soporte').value = '';
    updateMovFields();
    const submit = document.getElementById('mov-submit');
    submit.disabled = false; submit.textContent = 'Registrar';
    document.getElementById('mov-modal').hidden = false;
    document.getElementById('mov-monto').focus();
}
function closeMov() { document.getElementById('mov-modal').hidden = true; }
function updateMovFields() {
    const tipo = document.getElementById('mov-tipo').value;
    document.getElementById('mov-cat-field').hidden = tipo !== 'gasto';
    document.getElementById('mov-socia-field').hidden = !TIPOS_SOCIA.has(tipo);
    document.getElementById('mov-contraparte-field').hidden = !TIPOS_CONTRAPARTE.has(tipo);
}
async function handleMov() {
    const c = cuentaById(_selectedId);
    if (!c) { admToast('Elige una cuenta primero.', 'danger'); return; }
    const tipo = document.getElementById('mov-tipo').value;
    const monto = montoPos(document.getElementById('mov-monto').value);
    const fecha = document.getElementById('mov-fecha').value;
    if (!(monto > 0)) { admToast('El monto debe ser mayor a 0.', 'danger'); return; }
    if (!fecha) { admToast('Elige la fecha.', 'danger'); return; }

    const input = { cuentaId: _selectedId, tipo, monto, fecha };
    const desc = document.getElementById('mov-desc').value.trim();
    const soporte = document.getElementById('mov-soporte').value.trim();
    if (desc) input.descripcion = desc;
    if (soporte) input.soporteURL = soporte;
    if (tipo === 'gasto') input.categoria = document.getElementById('mov-categoria').value;
    if (TIPOS_SOCIA.has(tipo)) input.contraparte = { tipo: 'socia', id: document.getElementById('mov-socia').value };
    if (TIPOS_CONTRAPARTE.has(tipo)) {
        const nombre = document.getElementById('mov-contraparte').value.trim();
        if (!nombre) { admToast('Escribe a quién se le pagó.', 'danger'); return; }
        input.contraparte = { tipo: 'externo', nombre };
    }
    if (!_movOpId) _movOpId = uid();
    input.opId = _movOpId;

    const submit = document.getElementById('mov-submit');
    submit.disabled = true; submit.textContent = 'Registrando…';
    try {
        const r = await registrarMovimientoTesoreria(input);
        _movOpId = null;
        const pide = r?.estado === 'pendiente_aprobacion';
        admToast(pide ? '✓ Registrado · pendiente de aprobación del dueño' : '✓ Movimiento registrado', 'success', pide ? 4000 : 2500);
        closeMov();
    } catch (err) {
        admToast((BUSINESS_ERR.includes(err?.code) && err?.message) ? err.message : errorMessage(err, 'No se pudo registrar el movimiento.'), 'danger', 4500);
        submit.disabled = false; submit.textContent = 'Registrar';
    }
}

// ─── Modal: trasladar entre cuentas (V16 confirm con números) ─────────────────
function openTraslado() {
    const reales = cuentasRealesActivas();
    if (reales.length < 2) { admToast('Necesitas al menos 2 cuentas para trasladar.', 'danger'); return; }
    _traOpId = null;
    const origen = document.getElementById('tra-origen');
    const destino = document.getElementById('tra-destino');
    origen.textContent = ''; destino.textContent = '';
    for (const c of reales) {
        origen.appendChild(el('option', { value: c.id, text: `${c.nombre} (${cop(entero(c.saldoActual))})` }));
        destino.appendChild(el('option', { value: c.id, text: `${c.nombre} (${cop(entero(c.saldoActual))})` }));
    }
    origen.value = _selectedId && cuentaById(_selectedId) && !esVirtual(cuentaById(_selectedId)) ? _selectedId : reales[0].id;
    destino.value = reales.find(c => c.id !== origen.value)?.id || reales[0].id;
    document.getElementById('tra-monto').value = '';
    document.getElementById('tra-fecha').value = hoyISO();
    document.getElementById('tra-desc').value = '';
    const submit = document.getElementById('tra-submit');
    submit.disabled = false; submit.textContent = 'Trasladar';
    document.getElementById('tra-modal').hidden = false;
}
function closeTraslado() { document.getElementById('tra-modal').hidden = true; }
async function handleTraslado() {
    const origenId = document.getElementById('tra-origen').value;
    const destinoId = document.getElementById('tra-destino').value;
    const monto = montoPos(document.getElementById('tra-monto').value);
    const fecha = document.getElementById('tra-fecha').value;
    if (origenId === destinoId) { admToast('El origen y el destino no pueden ser la misma cuenta.', 'danger'); return; }
    if (!(monto > 0)) { admToast('El monto debe ser mayor a 0.', 'danger'); return; }
    if (!fecha) { admToast('Elige la fecha.', 'danger'); return; }

    const o = cuentaById(origenId), d = cuentaById(destinoId);
    const oDespues = entero(o.saldoActual) - monto;
    const dDespues = entero(d.saldoActual) + monto;
    const aviso = oDespues < 0 ? ` ⚠️ ${o.nombre} quedaría en NEGATIVO (${cop(oDespues)}).` : '';
    admConfirm(
        `Sale ${cop(monto)} de «${o.nombre}» (quedaría ${cop(oDespues)}) → entra a «${d.nombre}» (quedaría ${cop(dDespues)}).${aviso}`,
        async () => {
            if (!_traOpId) _traOpId = uid();
            const desc = document.getElementById('tra-desc').value.trim();
            const submit = document.getElementById('tra-submit');
            submit.disabled = true; submit.textContent = 'Trasladando…';
            try {
                await trasladarEntreCuentas({ opId: _traOpId, origenId, destinoId, monto, fecha, descripcion: desc || undefined });
                _traOpId = null;
                admToast('✓ Traslado registrado', 'success');
                closeTraslado();
            } catch (err) {
                admToast((BUSINESS_ERR.includes(err?.code) && err?.message) ? err.message : errorMessage(err, 'No se pudo trasladar.'), 'danger', 4500);
                submit.disabled = false; submit.textContent = 'Trasladar';
            }
        },
    );
}

// ─── Cuadrar mes (conciliación B3 · V13/V15/V19) ──────────────────────────────
function byIdOf(arr) { const o = {}; for (const m of arr) if (m && m.id != null) o[m.id] = m; return o; }
const draftKey = () => `tes-cua-${_selectedId}-${_cuaMes}`;
function loadCuaDraft() {
    _cuaChecked = new Set();
    try { const raw = localStorage.getItem(draftKey()); if (raw) JSON.parse(raw).forEach(id => _cuaChecked.add(id)); } catch { /* storage off */ }
}
function saveCuaDraft() { try { localStorage.setItem(draftKey(), JSON.stringify([..._cuaChecked])); } catch { /* storage off */ } }

function switchTab(tab) {
    _tab = tab;
    document.getElementById('tab-movs').classList.toggle('is-active', tab === 'movs');
    document.getElementById('tab-cuadre').classList.toggle('is-active', tab === 'cuadre');
    document.getElementById('tes-tab-movs').hidden = tab !== 'movs';
    document.getElementById('tes-tab-cuadre').hidden = tab !== 'cuadre';
    if (tab === 'cuadre') {
        if (!_cuaMes) { _cuaMes = hoyISO().slice(0, 7); document.getElementById('cua-mes').value = _cuaMes; }
        document.getElementById('cua-extracto').value = '';
        loadCuaDraft();
        renderCuadre();
    }
}

const movsDelMes = () => _movs.filter(m => String(m.fecha || '').startsWith(_cuaMes));

function renderCuadre() {
    const c = cuentaById(_selectedId);
    if (!c) return;
    const list = document.getElementById('cua-list');
    const empty = document.getElementById('cua-empty');
    list.textContent = '';
    const mes = movsDelMes();
    empty.hidden = mes.length > 0;
    const byId = byIdOf(_movs);

    for (const m of mes) {
        const activo = (m.estado || 'activo') === 'activo';
        let signo = 0; try { signo = signoDeMovimiento(m, byId); } catch { signo = 0; }
        const val = signo * entero(m.monto);
        const montoEl = el('strong', { class: 'adm-money', text: (val > 0 ? '+' : val < 0 ? '−' : '') + cop(Math.abs(val)).replace('-', '') });
        montoEl.classList.add(val > 0 ? 'adm-money--favor' : (val < 0 ? 'adm-money--debe' : 'adm-money--cero'));

        const info = el('div', { class: 'bov-mov-info' }, [
            el('span', { class: 'bov-mov-tipo', text: ETIQUETAS_TIPO[m.tipo] || m.tipo }),
            el('span', { class: 'bov-mov-time', text: fmtDate(m.fecha) }),
        ]);
        const right = [montoEl];
        if (m.conciliado) {
            right.push(el('span', { class: 'adm-pill adm-pill--green', text: '✓ cuadrado' }));
        } else if (!activo) {
            right.push(el('span', { class: 'adm-pill adm-pill--gold', text: m.estado === 'rechazado' ? 'rechazado' : 'pendiente' }));
        } else {
            const cb = el('input', { type: 'checkbox', class: 'tes-cua-cb' });
            cb.checked = _cuaChecked.has(m.id);
            cb.addEventListener('change', () => { cb.checked ? _cuaChecked.add(m.id) : _cuaChecked.delete(m.id); saveCuaDraft(); });
            right.unshift(cb);
        }
        list.appendChild(el('li', { class: 'bov-mov' + (m.conciliado ? ' tes-cua-done' : '') }, [info, el('div', { class: 'bov-mov-right' }, right)]));
    }

    // $A = saldo del sistema al cierre del mes (movs activos con fecha ≤ fin del mes; V15).
    const movsHasta = _movs.filter(m => String(m.fecha || '') <= _cuaMes + '-31');
    const sistema = computeSaldoCuenta(c.saldoInicial, movsHasta);
    const sisEl = document.getElementById('cua-sistema');
    sisEl.textContent = cop(sistema);
    sisEl.dataset.val = String(sistema);
    sisEl.classList.toggle('adm-money--debe', sistema < 0);
    updateCuaDiff();

    // Reabrir (owner): visible si este mes tiene movimientos sellados.
    const selladoEsteMes = mes.some(m => m.conciliado && m.periodoConciliado === _cuaMes);
    document.getElementById('cua-reabrir').hidden = !(_isOwner && selladoEsteMes);
}

function updateCuaDiff() {
    const sistema = Number(document.getElementById('cua-sistema').dataset.val || 0);
    const raw = document.getElementById('cua-extracto').value;
    const diffEl = document.getElementById('cua-diff');
    const lbl = document.getElementById('cua-diff-label');
    const hint = document.getElementById('cua-diff-hint');
    const ajusteBtn = document.getElementById('cua-ajuste');
    if (raw === '') { diffEl.textContent = '—'; lbl.textContent = 'Diferencia'; diffEl.style.color = ''; hint.hidden = true; ajusteBtn.hidden = true; return; }
    const diff = sistema - montoPos(raw);
    diffEl.textContent = cop(diff);
    if (diff === 0) { lbl.textContent = 'Cuadra ✓'; diffEl.style.color = 'var(--adm-success)'; hint.hidden = true; ajusteBtn.hidden = true; }
    else {
        lbl.textContent = 'Diferencia'; diffEl.style.color = 'var(--adm-danger)';
        hint.hidden = false;
        hint.textContent = 'No cuadra. Registra los movimientos que falten (p. ej. el 4×1.000 o la comisión del banco) con "Registrar movimiento", o crea un ajuste. No puedes guardar hasta que quede en cero.';
        ajusteBtn.hidden = false;
    }
}

async function handleGuardarCuadre() {
    if (!_selectedId) return;
    const checked = [..._cuaChecked];
    const sistema = Number(document.getElementById('cua-sistema').dataset.val || 0);
    const raw = document.getElementById('cua-extracto').value;
    if (raw === '') { admToast('Escribe el saldo final de tu extracto.', 'danger'); return; }
    if (sistema - montoPos(raw) !== 0) { admToast('El cuadre no está en cero. Resuelve la diferencia antes de guardar.', 'danger', 4500); return; }
    if (!checked.length) { admToast('Marca al menos un movimiento que aparezca en tu extracto.', 'danger'); return; }
    admConfirm(
        `Vas a sellar ${checked.length} movimiento(s) de ${_cuaMes}. Sistema: ${cop(sistema)} · tu extracto: ${cop(montoPos(raw))} · diferencia: ${cop(0)}. Lo sellado queda bloqueado (solo el dueño puede reabrir). ¿Guardar el cuadre?`,
        async () => {
            const btn = document.getElementById('cua-guardar');
            btn.disabled = true; btn.textContent = 'Guardando…';
            try {
                const r = await marcarConciliado({ cuentaId: _selectedId, periodo: _cuaMes, opIds: checked });
                _cuaChecked.clear(); saveCuaDraft();
                admToast(`✓ Cuadre guardado (${r.conciliados} sellados)`, 'success');
            } catch (err) {
                admToast((BUSINESS_ERR.includes(err?.code) && err?.message) ? err.message : errorMessage(err, 'No se pudo guardar el cuadre.'), 'danger', 4500);
            }
            btn.disabled = false; btn.textContent = 'Guardar cuadre';
        },
    );
}

async function handleAjusteCuadre() {
    if (!_selectedId) return;
    const sistema = Number(document.getElementById('cua-sistema').dataset.val || 0);
    const raw = document.getElementById('cua-extracto').value;
    if (raw === '') { admToast('Escribe el saldo de tu extracto primero.', 'danger'); return; }
    const diff = sistema - montoPos(raw);
    if (diff === 0) { admToast('Ya cuadra: no hace falta ajuste.', 'default'); return; }
    // sistema > extracto ⇒ el sistema tiene de MÁS ⇒ el ajuste RESTA (salida); al revés, entrada.
    const direccion = diff > 0 ? 'salida' : 'entrada';
    const monto = Math.abs(diff);
    admConfirm(
        `Crear un ajuste del cuadre de ${cop(monto)} (${direccion === 'salida' ? 'baja' : 'sube'} el saldo del sistema para cuadrar con tu extracto). Queda PENDIENTE de aprobación del dueño; podrás guardar el cuadre cuando lo apruebe. ¿Continuar?`,
        async () => {
            try {
                await registrarMovimientoTesoreria({ opId: uid(), cuentaId: _selectedId, tipo: 'ajuste_conciliacion', monto, fecha: _cuaMes + '-28', direccion, descripcion: `Ajuste del cuadre de ${_cuaMes}` });
                admToast('✓ Ajuste registrado · pendiente de aprobación del dueño', 'success', 4000);
            } catch (err) {
                admToast((BUSINESS_ERR.includes(err?.code) && err?.message) ? err.message : errorMessage(err, 'No se pudo registrar el ajuste.'), 'danger', 4500);
            }
        },
    );
}

function handleReabrir() {
    if (!_selectedId) return;
    const motivo = window.prompt(`Motivo para reabrir el cuadre de ${_cuaMes} (queda en el registro):`, '');
    if (motivo === null) return;
    if (!motivo.trim()) { admToast('Reabrir un cuadre exige un motivo.', 'danger'); return; }
    admConfirm(
        `Reabrir el cuadre de ${_cuaMes} desbloquea sus movimientos para volver a cuadrar. ¿Continuar?`,
        async () => {
            try {
                const r = await reabrirCuadre({ cuentaId: _selectedId, periodo: _cuaMes, motivo: motivo.trim() });
                admToast(`✓ Cuadre reabierto (${r.reabiertos} movimientos)`, 'success');
            } catch (err) {
                admToast((BUSINESS_ERR.includes(err?.code) && err?.message) ? err.message : errorMessage(err, 'No se pudo reabrir el cuadre.'), 'danger', 4500);
            }
        },
    );
}

init();
