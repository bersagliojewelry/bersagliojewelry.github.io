/**
 * Bersaglio Admin — Bóveda (caja fuerte) · F2.0 B5b-1 · TODO-68.
 *
 * Vista OWNER-ONLY (discreción D7 §9.9): el saldo acumulado de la bóveda y su ledger JAMÁS se ven
 * desde el POS de venta (ni un atraco ni un vistazo por encima del hombro lo revelan). Aquí Kary
 * (owner) supervisa el efectivo: ve el saldo, consigna al banco, repone el cambio del cajón, hace el
 * conteo físico (ajuste faltante/sobrante) y APRUEBA los eventos destructivos (Dual-Approval §9.1).
 *
 * Todo el dinero lo mueve la Cloud Function (Admin SDK, recompute en tx §8.1.3); esta vista solo
 * ESCUCHA (boveda/main + bovedaMovimientos, owner-read) y dispara callables. El ledger es INMUTABLE
 * (§9.3): corregir = un asiento `reverso` NUEVO, nunca borrar. La UI construye el DOM con métodos
 * seguros (sin innerHTML) → cero superficie de inyección.
 */

import adminDb from './db.js';
import { admToast, admConfirm, initSidebar, requireAuth, errorMessage, fmtDateTime } from './shared.js';
import {
    registrarTraslado, ajusteBoveda, reversoTraslado, aprobarEventoCaja,
    onBovedaChange, onBovedaMovsChange, onCajaEstadoChange,
} from '../pedidos-service.js';
import { tipoBovedaLabel, aprobacionInfo, esDestructivo } from './caja-format.js';

// Bóveda: el saldo PUEDE ser negativo (anomalía real) → formateo con signo, sin clamp.
const cop = (n) => { const v = Math.round(Number(n) || 0); return (v < 0 ? '-$' : '$') + Math.abs(v).toLocaleString('es-CO'); };
const entero = (n) => Math.round(Math.max(0, Number(n) || 0));   // los MONTOS de entrada son positivos
const uid = () => (crypto?.randomUUID?.() || `bov-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`);
const BUSINESS_ERR = ['failed-precondition', 'invalid-argument', 'not-found', 'already-exists', 'permission-denied'];

let _saldo = 0;
let _movs  = [];
// opId de idempotencia (§8.1.2): uno POR operación y acuñado PEREZOSO en el handler (patrón pos.js
// openMov/openTraslado, §169). Así cerrar+reabrir el modal tras un fallo de red REUSA el mismo id
// (idempotente) en vez de acuñar uno nuevo que duplicaría. Salida y conteo llevan vars SEPARADAS
// para no pisarse entre sí (antes compartían `_opId`). Se limpian al ÉXITO.
let _salidaOpId = null;  // consignar / reponer (modal de salida)
let _conteoOpId = null;  // conteo físico → ajuste
let _accionTipo = null;  // 'boveda_a_banco' | 'boveda_a_cajon' (modal de salida)
let _turnoAbiertoId = null;  // turno abierto (para atribuir la reposición de cambio al cierre)

// ─── DOM builder seguro (sin innerHTML) ──────────────────────────────────────
function el(tag, attrs = {}, kids = []) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
        if (v == null || v === false) continue;
        if (k === 'class') node.className = v;
        else if (k === 'text') node.textContent = v;
        else node.setAttribute(k, v);
    }
    for (const c of [].concat(kids)) if (c) node.appendChild(c);
    return node;
}

async function init() {
    await requireAuth('owner');      // BÓVEDA = owner-only (discreción D7); un admin/caja se redirige
    await adminDb.init();
    initSidebar();

    onBovedaChange(
        (b) => { _saldo = Number(b?.saldo) || 0; document.getElementById('bov-saldo').textContent = cop(_saldo); },
        (e) => admToast(errorMessage(e, 'No se pudo leer el saldo de la bóveda.'), 'danger', 4000),
    );
    onBovedaMovsChange(
        (m) => { _movs = m; renderPendientes(); renderLedger(); },
        200,
        (e) => admToast(errorMessage(e, 'No se pudo leer el movimiento de la bóveda.'), 'danger', 4000),
    );
    // Turno abierto (owner lee caja/estado): la reposición de cambio se atribuye a ESE turno.
    onCajaEstadoChange((est) => { _turnoAbiertoId = est?.turnoAbiertoId || null; }, () => { _turnoAbiertoId = null; });

    // Acciones (owner)
    document.getElementById('bov-consignar').addEventListener('click', () => openSalida('boveda_a_banco'));
    document.getElementById('bov-reponer').addEventListener('click', () => openSalida('boveda_a_cajon'));
    document.getElementById('bov-conteo').addEventListener('click', openConteo);

    // Modal de salida (consignar / reponer)
    document.getElementById('sal-close').addEventListener('click', closeSalida);
    document.getElementById('sal-cancel').addEventListener('click', closeSalida);
    document.getElementById('sal-submit').addEventListener('click', handleSalida);
    document.getElementById('sal-modal').addEventListener('click', e => { if (e.target.id === 'sal-modal') closeSalida(); });

    // Modal de conteo físico
    document.getElementById('cnt-close').addEventListener('click', closeConteo);
    document.getElementById('cnt-cancel').addEventListener('click', closeConteo);
    document.getElementById('cnt-submit').addEventListener('click', handleConteo);
    document.getElementById('cnt-contado').addEventListener('input', updateConteoDiff);
    document.getElementById('cnt-modal').addEventListener('click', e => { if (e.target.id === 'cnt-modal') closeConteo(); });
}

// ─── Aprobaciones pendientes (Dual-Approval §9.1) ─────────────────────────────
function renderPendientes() {
    const wrap = document.getElementById('bov-pendientes');
    const list = document.getElementById('bov-pend-list');
    const empty = document.getElementById('bov-pend-empty');
    const pend = _movs.filter(esDestructivo);
    list.textContent = '';
    empty.hidden = pend.length > 0;
    wrap.classList.toggle('bov-has-pend', pend.length > 0);

    for (const m of pend) {
        const monto = el('strong', { class: 'adm-money', text: cop(Math.abs(m.delta ?? m.monto)) });
        const info = el('div', { class: 'bov-mov-info' }, [
            el('span', { class: 'bov-mov-tipo', text: tipoBovedaLabel(m.tipo) }),
            el('span', { class: 'bov-mov-sub', text: m.motivo || m.nota || '—' }),
            el('span', { class: 'bov-mov-time', text: fmtDateTime(m.ts) }),
        ]);
        const btn = el('button', { class: 'adm-btn adm-btn--primary adm-btn--sm', type: 'button', text: 'Aprobar' });
        btn.addEventListener('click', () => aprobar(m));
        list.appendChild(el('li', { class: 'bov-mov bov-mov--pend' }, [info, el('div', { class: 'bov-mov-right' }, [monto, btn])]));
    }
}

function aprobar(mov) {
    admConfirm(
        `¿Aprobar «${tipoBovedaLabel(mov.tipo)}» por ${cop(Math.abs(mov.delta ?? mov.monto))}? Entrará al saldo de la bóveda y no se puede deshacer.`,
        async () => {
            try {
                await aprobarEventoCaja({ opId: mov.id });
                admToast('✓ Evento aprobado', 'success');
            } catch (err) {
                const msg = (BUSINESS_ERR.includes(err?.code) && err?.message) ? err.message : errorMessage(err, 'No se pudo aprobar.');
                admToast(msg, 'danger', 4500);
            }
        },
    );
}

// ─── Ledger (append-only, inmutable §9.3) ─────────────────────────────────────
function renderLedger() {
    const list = document.getElementById('bov-ledger');
    const empty = document.getElementById('bov-ledger-empty');
    list.textContent = '';
    empty.hidden = _movs.length > 0;

    // Un movimiento ya reversado no vuelve a ofrecer "Reversar" (el server igual lo rechaza).
    const reversados = new Set(_movs.filter(m => m.reversaA).map(m => m.reversaA));

    for (const m of _movs) {
        const delta = Number(m.delta ?? m.monto) || 0;
        const signo = delta > 0 ? '+' : (delta < 0 ? '−' : '');
        const montoEl = el('strong', { class: 'adm-money', text: signo + cop(Math.abs(delta)).replace('-', '') });
        montoEl.classList.add(delta > 0 ? 'adm-money--favor' : (delta < 0 ? 'adm-money--debe' : 'adm-money--cero'));

        const meta = [el('span', { class: 'bov-mov-tipo', text: tipoBovedaLabel(m.tipo) })];
        const aprob = aprobacionInfo(m.estado);
        if (aprob) meta.push(el('span', { class: `adm-pill adm-pill--${aprob.pill}`, text: aprob.label }));
        const info = el('div', { class: 'bov-mov-info' }, [
            el('div', { class: 'bov-mov-head' }, meta),
            el('span', { class: 'bov-mov-sub', text: m.motivo || m.nota || (m.reversaA ? `reversa de ${m.reversaA}` : '') || '—' }),
            el('span', { class: 'bov-mov-time', text: fmtDateTime(m.ts) }),
        ]);

        const right = [montoEl];
        const puedeReversar = m.tipo !== 'reverso' && m.estado !== 'pendiente_aprobacion' && !reversados.has(m.id);
        if (puedeReversar) {
            const rev = el('button', { class: 'adm-btn adm-btn--ghost adm-btn--sm', type: 'button', text: 'Reversar' });
            rev.addEventListener('click', () => reversar(m));
            right.push(rev);
        }
        list.appendChild(el('li', { class: 'bov-mov' }, [info, el('div', { class: 'bov-mov-right' }, right)]));
    }
}

function reversar(mov) {
    const motivo = window.prompt(`Motivo de la reversa de «${tipoBovedaLabel(mov.tipo)}» (${cop(Math.abs(mov.delta ?? mov.monto))}):`, '');
    if (motivo === null) return;
    if (!motivo.trim()) { admToast('La reversa exige un motivo.', 'danger'); return; }
    admConfirm(
        'La reversa crea un asiento contrario (no borra el original) y queda PENDIENTE de tu aprobación. ¿Continuar?',
        async () => {
            try {
                await reversoTraslado({ opId: uid(), reversaA: mov.id, motivo: motivo.trim() });
                admToast('✓ Reversa registrada · pendiente de aprobación', 'success', 4000);
            } catch (err) {
                const msg = (BUSINESS_ERR.includes(err?.code) && err?.message) ? err.message : errorMessage(err, 'No se pudo reversar.');
                admToast(msg, 'danger', 4500);
            }
        },
    );
}

// ─── Salida de bóveda: consignar al banco / reponer cambio al cajón ───────────
function openSalida(tipo) {
    // Cambiar de operación (consignar↔reponer) NO reusa el opId de la otra; el MISMO tipo sí lo conserva
    // para que un reintento tras fallo de red sea idempotente. El opId se acuña PEREZOSO en handleSalida.
    if (tipo !== _accionTipo) _salidaOpId = null;
    _accionTipo = tipo;
    const esBanco = tipo === 'boveda_a_banco';
    document.getElementById('sal-title').textContent = esBanco ? 'Consignar al banco' : 'Reponer cambio al cajón';
    document.getElementById('sal-hint').textContent = esBanco
        ? 'Registra el efectivo que sacas de la bóveda para consignarlo. Anota el número de consignación en la nota.'
        : 'Registra el efectivo que sacas de la bóveda para reponer el cambio del cajón del mostrador.';
    document.getElementById('sal-saldo').textContent = cop(_saldo);
    document.getElementById('sal-monto').value = '';
    document.getElementById('sal-nota').value = '';
    const submit = document.getElementById('sal-submit');
    submit.disabled = false; submit.textContent = 'Registrar';
    document.getElementById('sal-modal').hidden = false;
    document.getElementById('sal-monto').focus();
}
function closeSalida() { document.getElementById('sal-modal').hidden = true; }
async function handleSalida() {
    const monto = entero(document.getElementById('sal-monto').value);
    const nota = document.getElementById('sal-nota').value.trim();
    if (!(monto > 0)) { admToast('El monto debe ser mayor a 0.', 'danger'); return; }
    if (monto > _saldo) { admToast('No hay saldo suficiente en la bóveda para esa salida.', 'danger'); return; }
    // Reponer cambio (bóveda→cajón) SOLO con turno abierto: el cierre necesita el turnoId para sumar
    // +bovedaACajon a su ecuación (§8.1.7); sin él, el arqueo del turno mostraría un "sobra" falso.
    if (_accionTipo === 'boveda_a_cajon' && !_turnoAbiertoId) {
        admToast('Abre la caja del mostrador antes de reponer el cambio (el traslado se atribuye al turno abierto).', 'danger', 5000);
        return;
    }
    if (!_salidaOpId) _salidaOpId = uid();
    const turnoId = _accionTipo === 'boveda_a_cajon' ? _turnoAbiertoId : undefined;

    const submit = document.getElementById('sal-submit');
    submit.disabled = true; submit.textContent = 'Registrando…';
    try {
        await registrarTraslado({ opId: _salidaOpId, tipo: _accionTipo, monto, turnoId, nota: nota || undefined });
        _salidaOpId = null;
        admToast('✓ Movimiento registrado', 'success');
        closeSalida();
    } catch (err) {
        const msg = (BUSINESS_ERR.includes(err?.code) && err?.message) ? err.message : errorMessage(err, 'No se pudo registrar el movimiento.');
        admToast(msg, 'danger', 4500);
        submit.disabled = false; submit.textContent = 'Registrar';
    }
}

// ─── Conteo físico → ajuste faltante/sobrante (§8.1.8, nace pendiente + alerta) ───
function openConteo() {
    // opId perezoso (se acuña en handleConteo): reabrir tras un fallo de red reusa el mismo id (idempotente).
    document.getElementById('cnt-saldo').textContent = cop(_saldo);
    document.getElementById('cnt-contado').value = '';
    document.getElementById('cnt-motivo').value = '';
    document.getElementById('cnt-diff-wrap').hidden = true;
    const submit = document.getElementById('cnt-submit');
    submit.disabled = false; submit.textContent = 'Registrar conteo';
    document.getElementById('cnt-modal').hidden = false;
    document.getElementById('cnt-contado').focus();
}
function closeConteo() { document.getElementById('cnt-modal').hidden = true; }
function updateConteoDiff() {
    const raw = document.getElementById('cnt-contado').value;
    const wrap = document.getElementById('cnt-diff-wrap');
    if (raw === '') { wrap.hidden = true; return; }
    const diff = entero(raw) - _saldo;
    wrap.hidden = false;
    const lbl = document.getElementById('cnt-diff-label');
    const val = document.getElementById('cnt-diff');
    if (diff === 0)      { lbl.textContent = 'Cuadra ✓';  val.textContent = cop(0);       val.style.color = 'var(--adm-success)'; }
    else if (diff > 0)   { lbl.textContent = 'Sobrante';   val.textContent = cop(diff);    val.style.color = 'var(--adm-accent)'; }
    else                 { lbl.textContent = 'Faltante';   val.textContent = cop(-diff);   val.style.color = 'var(--adm-danger)'; }
}
async function handleConteo() {
    const raw = document.getElementById('cnt-contado').value;
    if (raw === '' || !(Number(raw) >= 0)) { admToast('Escribe el efectivo contado.', 'danger'); return; }
    const diff = entero(raw) - _saldo;
    if (diff === 0) { admToast('El conteo cuadra con el saldo: no hace falta ajuste.', 'default', 4000); closeConteo(); return; }
    const motivo = document.getElementById('cnt-motivo').value.trim();
    if (!motivo) { admToast('El ajuste exige un motivo.', 'danger'); return; }
    if (!_conteoOpId) _conteoOpId = uid();

    const tipo = diff > 0 ? 'ajuste_sobrante' : 'ajuste_faltante';
    const monto = Math.abs(diff);
    const submit = document.getElementById('cnt-submit');
    submit.disabled = true; submit.textContent = 'Registrando…';
    try {
        await ajusteBoveda({ opId: _conteoOpId, tipo, monto, motivo });
        _conteoOpId = null;
        admToast('✓ Ajuste registrado · pendiente de aprobación', 'success', 4000);
        closeConteo();
    } catch (err) {
        const msg = (BUSINESS_ERR.includes(err?.code) && err?.message) ? err.message : errorMessage(err, 'No se pudo registrar el ajuste.');
        admToast(msg, 'danger', 4500);
        submit.disabled = false; submit.textContent = 'Registrar conteo';
    }
}

init();
