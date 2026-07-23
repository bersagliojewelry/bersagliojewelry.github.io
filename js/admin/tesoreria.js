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
import { admToast, admConfirm, initSidebar, requireAuth, errorMessage, fmtDate } from './shared.js';
import {
    crearCuentaTesoreria, registrarMovimientoTesoreria, trasladarEntreCuentas,
    onCuentasTesoreriaChange, onMovsCuentaChange,
} from '../tesoreria-service.js';
import { ETIQUETAS_TIPO, signoDeMovimiento, entero, TIPOS_VIRTUALES } from './tesoreria-format.js';

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
}

// ─── Cuentas: tarjetas + total ────────────────────────────────────────────────
function onCuentasLoaded() {
    const reales = cuentasReales();
    document.getElementById('tes-empty').hidden = reales.length > 0;

    // Total = Σ saldoActual de cuentas REALES activas (las virtuales no tienen saldo propio, D1).
    const total = cuentasRealesActivas().reduce((s, c) => s + entero(c.saldoActual), 0);
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
    renderMovsHeader();
    renderLedger();
    _movsUnsub = onMovsCuentaChange(
        id,
        (m) => { _movs = m; renderLedger(); },
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
        warn.textContent = `Esta es una cuenta personal de ${TITULAR_LABEL[c.titular] || 'la socia'}. El sistema ordena y documenta cada peso, pero mezclar plata personal y del negocio tiene riesgos tributarios para ella. La meta es migrar todo a la cuenta del negocio.`;
    } else {
        warn.hidden = true;
    }
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

init();
