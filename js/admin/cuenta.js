/**
 * Bersaglio Admin — Ficha de cliente (CRM Bloque 3).
 *
 * Saldo en vivo + historial de movimientos + registrar factura/abono + anular.
 * El saldo lo recalcula la Cloud Function (ADR §43); aquí solo se agregan/anulan
 * movimientos y se observa el resultado. Solo admin/owner.
 */

import { requireAuth, initSidebar, admToast, esc, fmtDateTime, errorMessage } from './shared.js';
import adminDb from './db.js';
import { currentUser } from '../auth.js';
import {
    getCliente, onClienteChange, onMovimientosChange,
    addMovimiento, anularMovimiento, updateCliente, fetchVendedoras, fmtCOP, getConfig,
    registrarAbonoCartera, anularAbonoCartera, nuevoOpId,
    crearSolicitud, corregirMovimientoBatch, onSolicitudesChange, cancelarSolicitud,
    registrarGestion, onGestionesChange,
    pactarAcuerdo, anularAcuerdo, onAcuerdosChange,
} from '../crm-service.js';
import { saldoClass, saldoLabel, estadoBadgeHTML } from './saldo-format.js';
import { estadoCuenta, hoyISO, vencimientoDefaultISO, acuerdoEsValido } from '../crm-estado-cuenta.js';
import { generarCuotas, resumenCuotas } from '../crm-acuerdos.js';
import { currentRole } from '../auth.js';
import { planearCorreccionSaldo, planearCorreccionMovimiento, PREGUNTAS_CORRECCION } from '../crm-correccion.js';
import {
    TIPOS_GESTION, RESULTADOS_GESTION, tipoGestionLabel, resultadoGestionLabel,
    validarGestion, ordenarGestiones, esEnlaceSeguro,
} from '../crm-gestiones.js';

const CLIENTE_ID = new URLSearchParams(location.search).get('id');
const _vendedoras = new Map();
const _movsById = new Map();   // movimientos vivos por id (para el modal de corregir)
let _solicitudes = [];         // solicitudes de corrección vivas (pendientes/rechazadas)
let _abrirCorregirMov = null;  // ref al opener del modal de corregir movimiento (re-solicitar)
let _abrirCorregirSaldo = null; // ref al opener de corregir-saldo (re-solicitar un ajuste rechazado)
let _tipo = 'factura';   // tipo activo del modal
let _cliente = null;     // datos vivos (para corregir saldo / editar)
let _diasPlazo = 30;     // config/negocio.diasPlazo (mora)
let _fechaCorte = null;  // config/negocio.fechaCorteMigracion (fallback de fecha)
let _movs = [];          // movimientos vivos (para re-derivar el estado al cambiar acuerdos)
let _acuerdos = [];      // acuerdos de pago vivos del cliente (spec 2026-06-12)
let _estCuenta = null;   // último estadoCuenta derivado (gates de UI: cuotas/renegociar)

// La UI de acuerdos solo existe cuando el owner activa la bandera (las reglas
// del match se despliegan aparte — sin la bandera, cero listeners condenados).
const acuerdosActivos = () => _cfgCartera?.acuerdosActivos === true;
const horizonteDias = () => (typeof _cfgCartera?.horizonteAcuerdoDias === 'number'
    && _cfgCartera.horizonteAcuerdoDias > 0 ? _cfgCartera.horizonteAcuerdoDias : 730);
const incumplidoCuotas = () => (Number.isInteger(_cfgCartera?.acuerdoIncumplidoCuotas)
    && _cfgCartera.acuerdoIncumplidoCuotas >= 1 ? _cfgCartera.acuerdoIncumplidoCuotas : 2);

// 'YYYY-MM-DD' → 'DD/MM/YYYY' (fecha real del hecho); '' si no es una fecha ISO.
function fmtFecha(iso) {
    if (typeof iso !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return '';
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
}

const TIPO_LABEL = { factura: 'Factura', abono: 'Abono', apertura: 'Apertura', ajuste: 'Ajuste' };
const SIGNO = { factura: 1, apertura: 1, ajuste: 1, abono: -1 };

// Listas del negocio (espejo de config/cartera, M0 §70); fallback literal si el doc
// no cargó. La frontera real son las reglas; estas listas son la UI de Kary.
let _motivosAnulacion = ['ERROR_REGISTRO', 'DUPLICADO', 'CORRECCION', 'CORRECCION_FECHA', 'DEVOLUCION_PIEZA', 'OTRO'];
let _mediosPago = ['efectivo', 'transferencia', 'datafono', 'otro'];
let _motivosAjuste = ['ERROR_REGISTRO', 'ABONO_NO_REGISTRADO', 'RECLASIFICACION', 'DEVOLUCION_PIEZA', 'DESCUENTO_AUTORIZADO', 'CASTIGO', 'OTRO'];
let _cfgCartera = null;   // config/cartera completa (autoAprobacionMax, motivosNeutros) para el gate
const AJUSTE_LABEL = {
    ERROR_REGISTRO: 'Error de digitación', ABONO_NO_REGISTRADO: 'Pago no registrado',
    RECLASIFICACION: 'Reclasificación', DEVOLUCION_PIEZA: 'Devolución de pieza',
    DESCUENTO_AUTORIZADO: 'Descuento autorizado', CASTIGO: 'Castigo de cartera', OTRO: 'Otro',
};
// Etiquetas humanas (Kary no ve códigos). Fallback: el código crudo.
const CAT_LABEL = {
    ERROR_REGISTRO: 'Error de digitación', DUPLICADO: 'Movimiento duplicado',
    CORRECCION: 'Corrección de monto', CORRECCION_FECHA: 'Corrección de fecha',
    DEVOLUCION_PIEZA: 'Devolución de pieza', OTRO: 'Otro',
};
const MEDIO_LABEL = { efectivo: 'Efectivo', transferencia: 'Transferencia', datafono: 'Datáfono', otro: 'Otro' };

// Rellena un <select> con métodos DOM seguros (textContent, no innerHTML).
function fillSelect(sel, codes, labels, placeholder) {
    if (!sel) return;
    sel.replaceChildren();
    const ph = document.createElement('option');
    ph.value = ''; ph.textContent = placeholder;
    sel.appendChild(ph);
    for (const c of codes) {
        const o = document.createElement('option');
        o.value = c; o.textContent = labels[c] || c;
        sel.appendChild(o);
    }
}

function nombreVendedora(id) {
    return id ? (_vendedoras.get(id) || 'Vendedora') : 'Directo de Kary';
}

function showError(msg) {
    document.getElementById('ficha-head').hidden = true;
    document.getElementById('hist-section').hidden = true;
    document.getElementById('gest-section').hidden = true;
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
    document.getElementById('gest-section').hidden = false;
}

function renderEstado(list) {
    const el = document.getElementById('f-estado');
    if (!el) return;
    const est = estadoCuenta(list, {
        diasPlazo: _diasPlazo, fechaCorte: _fechaCorte,
        acuerdos: _acuerdos, horizonteDias: horizonteDias(), incumplidoCuotas: incumplidoCuotas(),
    });
    _estCuenta = est;
    renderPlanYBoton(est);
    // Solo mostramos el sello si hay deuda (positiva); a favor/cero ya lo dice el saldo.
    if (est.saldo > 0) {
        el.innerHTML = estadoBadgeHTML(est);
        el.hidden = false;
    } else {
        el.innerHTML = '';
        el.hidden = true;
    }
}

// Plan de pagos (spec acuerdos): próxima cuota + atraso, bajo el saldo; y el
// botón de renegociar solo con la bandera activa y deuda por cobrar.
function renderPlanYBoton(est) {
    const planEl = document.getElementById('f-plan');
    if (planEl) {
        if (est.plan && est.saldo > 0) {
            const p = est.plan;
            planEl.textContent = p.proximaCuota
                ? `🤝 Próxima cuota: ${fmtFecha(p.proximaCuota.fecha)} — ${fmtCOP(p.proximaCuota.monto)}`
                  + (p.cuotasVencidas > 0 ? ` · ${p.cuotasVencidas} cuota(s) atrasada(s)` : '')
                : '🤝 Plan al día';
            planEl.hidden = false;
        } else {
            planEl.textContent = '';
            planEl.hidden = true;
        }
    }
    const btnAc = document.getElementById('btn-acuerdo');
    if (btnAc) btnAc.hidden = !(acuerdosActivos() && est.saldo > 0);
}

function renderMovimientos(list) {
    const body = document.getElementById('mov-body');
    const empty = document.getElementById('mov-empty');
    _movs = list;
    renderEstado(list);
    _movsById.clear();
    list.forEach((m) => _movsById.set(m.id, m));
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
        // Un AJUSTE no se corrige con par (un ajuste ES una corrección): se anula y se
        // registra uno nuevo vía "Corregir saldo" — así su motivo de lista cerrada nace
        // bien (candado M3). Facturas/abonos/aperturas sí usan el par anular+crear.
        const accion = anulado || !(m.tipo)
            ? ''
            : `${m.tipo !== 'ajuste' ? `<button class="adm-btn adm-btn--ghost adm-btn--sm" data-corregir="${esc(m.id)}">Corregir</button>` : ''}
               <button class="adm-btn adm-btn--ghost adm-btn--sm" data-anular="${esc(m.id)}">Anular</button>`;
        // Acuerdo de pago visible (M6): qué se pactó con la clienta, junto a la fecha.
        // Copy neutro "acuerdo:" — "vence" en presente sobre una deuda ya pagada se
        // leería como alerta permanente (verif. M6).
        const venceTxt = (m.tipo === 'factura' && !anulado && fmtFecha(m.vencimiento))
            ? `<br><span style="color:var(--adm-muted);font-size:11px;">acuerdo: ${fmtFecha(m.vencimiento)}</span>`
            : '';
        return `
            <tr${anulado ? ' style="opacity:.5"' : ''}>
                <td title="Registrado: ${esc(fmtDateTime(m.registradoEn))}">${fechaTxt}${venceTxt}</td>
                <td>${esc(tipoTxt)}${anulado ? ' <span class="adm-pill">anulado</span>' : ''}</td>
                <td>${esc(m.descripcion || '—')}</td>
                <td style="text-align:right${anulado ? ';text-decoration:line-through' : ''}">${esc(montoTxt)}</td>
                <td style="text-align:right">${accion}</td>
            </tr>`;
    }).join('');
}

// ─── Correcciones a la vista de Daniel (solicitudes pendientes/rechazadas) ──────
function renderSolicitudes(list) {
    _solicitudes = list || [];
    const section = document.getElementById('solic-section');
    const cont = document.getElementById('solic-list');
    if (!section || !cont) return;
    const vivas = _solicitudes.filter((s) => s.estado === 'pendiente' || s.estado === 'rechazada');
    cont.replaceChildren();
    if (!vivas.length) { section.hidden = true; return; }
    section.hidden = false;

    for (const s of vivas) {
        const card = document.createElement('div');
        card.style.cssText = 'padding:12px 14px;border-radius:14px;margin-bottom:10px;background:var(--adm-soft,#f5f3ef);display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;';
        const efecto = typeof s.monto === 'number' && s.monto !== 0
            ? `el saldo ${s.monto > 0 ? 'sube' : 'baja'} ${fmtCOP(Math.abs(s.monto))}`
            : 'sin efecto en el saldo';

        const info = document.createElement('div');
        info.style.fontSize = '13px';
        const titulo = document.createElement('div'); titulo.style.fontWeight = '600';
        const detalle = document.createElement('div'); detalle.style.color = 'var(--adm-muted)';
        if (s.estado === 'pendiente') {
            titulo.textContent = `⏳ Pendiente de Daniel — ${efecto}`;
            detalle.textContent = s.nota || s.motivo || '';
        } else {
            titulo.textContent = '❌ Rechazada por Daniel';
            // Rechazos AUTOMÁTICOS de M2b (códigos para auditoría M4) → texto humano para Kary.
            const RECHAZO_AUTO = {
                ASIENTO_YA_NO_VIGENTE: 'El movimiento ya fue corregido por otra vía — revisa el historial actual.',
                DATOS_NO_COINCIDEN: 'Los datos ya no cuadran con el movimiento actual — vuelve a corregir desde el historial.',
            };
            const motivoTxt = RECHAZO_AUTO[s.motivoRechazo] || s.motivoRechazo;
            detalle.textContent = motivoTxt ? `Motivo: ${motivoTxt}` : (s.nota || '');
        }
        info.append(titulo, detalle);

        const actions = document.createElement('div');
        const b = document.createElement('button');
        b.className = 'adm-btn adm-btn--ghost adm-btn--sm';
        if (s.estado === 'pendiente') {
            b.textContent = 'Cancelar';
            b.addEventListener('click', () => cancelarSolicitudUI(s, b));
        } else if (s.correccionDe && s.datosCorreccion && s.datosCorreccion.reemplazo) {
            // RECHAZADA de un movimiento: re-solicitar precargando los datos corregidos.
            b.textContent = 'Volver a corregir';
            b.addEventListener('click', () => reSolicitar(s));
        } else {
            // RECHAZADA de un ajuste de saldo: re-abrir "Corregir saldo" precargado
            // (el primer "no" de Daniel NUNCA deja a Kary sin botón — spec §74).
            b.textContent = 'Volver a corregir saldo';
            b.addEventListener('click', () => reSolicitarSaldo(s));
        }
        actions.appendChild(b);
        card.append(info, actions);
        cont.appendChild(card);
    }
}

async function cancelarSolicitudUI(s, btn) {
    if (btn) btn.disabled = true;
    try {
        await cancelarSolicitud(CLIENTE_ID, s.id, currentUser()?.user?.uid);
        admToast('Solicitud cancelada.');
    } catch (err) {
        console.error('[cuenta] cancelarSolicitud:', err);
        admToast('No se pudo cancelar.', 'danger');
        if (btn) btn.disabled = false;
    }
}

function reSolicitar(s) {
    let original = _movsById.get(s.correccionDe);
    // Si el original ya fue ANULADO (p. ej. rechazo automático ASIENTO_YA_NO_VIGENTE
    // de M2b), seguir la cadena de corrección hasta el asiento VIGENTE: re-solicitar
    // sobre un asiento muerto crearía solicitudes condenadas en bucle (verif. M2b).
    let saltos = 0;
    while (original && original.anulado === true && original.corregidoPor && saltos < 10) {
        original = _movsById.get(original.corregidoPor) || null;
        saltos++;
    }
    if (!original || original.anulado === true) {
        admToast('El movimiento original ya no está vigente; corrígelo de nuevo desde el historial.', 'danger');
        return;
    }
    if (original.tipo === 'ajuste') {
        admToast('Un ajuste se corrige anulándolo y registrando uno nuevo desde "Corregir saldo".', 'danger');
        return;
    }
    if (!_abrirCorregirMov) return;
    const r = s.datosCorreccion.reemplazo;
    _abrirCorregirMov(original, { monto: r.monto, fecha: r.fecha, motivoCategoria: s.datosCorreccion.motivoCategoria });
}

// Re-solicitar un AJUSTE de saldo rechazado: re-abre "Corregir saldo" con el saldo
// objetivo original (saldoAlSolicitar + delta), motivo y nota precargados.
function reSolicitarSaldo(s) {
    if (!_abrirCorregirSaldo) return;
    const base = Number.isInteger(s.saldoAlSolicitar) ? s.saldoAlSolicitar
        : (typeof _cliente?.saldoActual === 'number' ? _cliente.saldoActual : 0);
    _abrirCorregirSaldo({ saldoObjetivo: base + (typeof s.monto === 'number' ? s.monto : 0), motivo: s.motivo, nota: s.nota });
}

// ─── Modal movimiento ─────────────────────────────────────────────────────────
let _vencTocado = false;   // Kary editó el acuerdo a mano → no pisarlo al cambiar la fecha
// V17: idempotencia del abono. Se acuña al ABRIR el modal (no al enviar) → un reintento tras un
// timeout reusa el MISMO opId y el servidor devuelve el abono ya creado en vez de duplicar la
// bajada de la deuda. Una por apertura del formulario.
let _opIdAbono = null;

function openMovModal(tipo) {
    _tipo = tipo;
    _opIdAbono = tipo === 'abono' ? nuevoOpId() : null;
    document.getElementById('mov-form').reset();
    document.getElementById('mov-fecha').value = hoyISO();   // default: hoy (Kary puede cambiarla)
    document.getElementById('mov-modal-title').textContent = `Registrar ${TIPO_LABEL[tipo].toLowerCase()}`;
    document.getElementById('mov-save').textContent = `Registrar ${TIPO_LABEL[tipo].toLowerCase()}`;
    // Acuerdo de pago (M6): SOLO facturas. Prellenado = fecha + plazo del negocio
    // (el default sigue configurable en el panel); Kary lo pacta POR DEUDA.
    const vencRow = document.getElementById('mov-vencimiento-row');
    const vencEl = document.getElementById('mov-vencimiento');
    _vencTocado = false;
    if (tipo === 'factura') {
        vencEl.value = vencimientoDefaultISO(hoyISO(), _diasPlazo);
        vencEl.min = hoyISO();   // el acuerdo no puede ser antes de la fecha de la deuda
        vencRow.hidden = false; vencEl.required = true;
    } else {
        vencRow.hidden = true; vencEl.required = false; vencEl.value = '';
    }
    // Medio de pago: obligatorio SOLO en abonos (cómo entró la plata).
    const mpRow = document.getElementById('mov-mediopago-row');
    const mpSel = document.getElementById('mov-mediopago');
    if (tipo === 'abono') {
        fillSelect(mpSel, _mediosPago, MEDIO_LABEL, 'Elige…');
        mpRow.hidden = false; mpSel.required = true;
    } else {
        mpRow.hidden = true; mpSel.required = false; mpSel.value = '';
    }
    // Plan de CUOTAS (spec acuerdos §1.5): solo facturas, con la bandera activa y
    // SIN otra deuda vencida — a esa clienta el instrumento es la renegociación
    // 'saldo' (el FIFO global haría figurar impagas las cuotas de la venta nueva).
    const ctRow = document.getElementById('mov-cuotas-toggle-row');
    const ctChk = document.getElementById('mov-encuotas');
    ctChk.checked = false;
    document.getElementById('mov-cuotas-box').hidden = true;
    // "Factura en cuotas" = PRIMER acuerdo limpio: solo si NO hay deuda vencida NI
    // un acuerdo vigente (con vigente, el camino correcto es "Acuerdo de pago" →
    // renegocia TODO el saldo). Evita el choque del FIFO global (spec v2 §1.5).
    const hayVigente = _acuerdos.some((a) => a.estado === 'vigente');
    ctRow.hidden = !(tipo === 'factura' && acuerdosActivos() && !(_estCuenta?.vencido > 0) && !hayVigente);
    document.getElementById('mov-modal').hidden = false;
    document.getElementById('mov-monto').focus();
}
function closeMovModal() { document.getElementById('mov-modal').hidden = true; }

// Cuotas del formulario de factura (null = parámetros que no dan un plan sano).
function cuotasDelForm() {
    return generarCuotas({
        total: Math.round(Number(document.getElementById('mov-monto').value)),
        n: Math.round(Number(document.getElementById('mov-cuotas-n').value)),
        periodicidad: document.getElementById('mov-cuotas-per').value,
        primeraFecha: document.getElementById('mov-cuotas-primera').value,
    });
}
function refrescarPreviewCuotas() {
    if (document.getElementById('mov-cuotas-box').hidden) return;
    const cuotas = cuotasDelForm();
    document.getElementById('mov-cuotas-preview').textContent = cuotas
        ? resumenCuotas(cuotas, fmtCOP)
        : 'Revisa el monto, el número de cuotas y la primera fecha.';
}

function wireModal() {
    document.getElementById('btn-factura').addEventListener('click', () => openMovModal('factura'));
    document.getElementById('btn-abono').addEventListener('click', () => openMovModal('abono'));
    document.getElementById('mov-modal-close').addEventListener('click', closeMovModal);
    document.getElementById('mov-cancel').addEventListener('click', closeMovModal);
    document.getElementById('mov-modal').addEventListener('click', (e) => {
        if (e.target.id === 'mov-modal') closeMovModal();
    });

    // El acuerdo sigue a la fecha del hecho MIENTRAS Kary no lo haya tocado
    // (cambia la fecha de la deuda → el sugerido se recalcula; lo pactado a mano se
    // respeta). El `min` se refresca SIEMPRE: la restricción real es ≥ fecha de la
    // deuda — un min viejo bloquearía acuerdos pasados legítimos con la burbuja
    // nativa del navegador en vez del toast (verif. M6).
    const vencEl = document.getElementById('mov-vencimiento');
    vencEl.addEventListener('input', () => { _vencTocado = true; });
    document.getElementById('mov-fecha').addEventListener('change', (e) => {
        if (_tipo !== 'factura') return;
        const f = e.target.value;
        if (!/^\d{4}-\d{2}-\d{2}$/.test(f)) return;
        vencEl.min = f;
        if (!_vencTocado) vencEl.value = vencimientoDefaultISO(f, _diasPlazo);
        const primeraEl = document.getElementById('mov-cuotas-primera');
        if (primeraEl) primeraEl.min = f;
    });

    // Toggle "¿en cuotas?": el plan reemplaza la fecha única (el vencimiento de la
    // factura será la ÚLTIMA cuota, automático — la "fecha final" sigue existiendo).
    const ctChk = document.getElementById('mov-encuotas');
    ctChk.addEventListener('change', () => {
        const on = ctChk.checked;
        document.getElementById('mov-cuotas-box').hidden = !on;
        document.getElementById('mov-vencimiento-row').hidden = on || _tipo !== 'factura';
        vencEl.required = !on && _tipo === 'factura';
        if (on) {
            const fecha = document.getElementById('mov-fecha').value || hoyISO();
            const primeraEl = document.getElementById('mov-cuotas-primera');
            if (!primeraEl.value) primeraEl.value = vencimientoDefaultISO(fecha, 15);
            primeraEl.min = fecha;
            refrescarPreviewCuotas();
        }
    });
    for (const id of ['mov-monto', 'mov-cuotas-n', 'mov-cuotas-per', 'mov-cuotas-primera']) {
        const el = document.getElementById(id);
        el.addEventListener('input', refrescarPreviewCuotas);
        el.addEventListener('change', refrescarPreviewCuotas);
    }

    document.getElementById('mov-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const monto = Number(document.getElementById('mov-monto').value);
        if (!(monto > 0)) { admToast('El monto debe ser mayor que 0.', 'danger'); return; }
        const fecha = document.getElementById('mov-fecha').value;
        if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) { admToast('Elige la fecha del movimiento.', 'danger'); return; }

        // Abono: el medio de pago es obligatorio (cómo entró la plata).
        let medioPago;
        if (_tipo === 'abono') {
            medioPago = document.getElementById('mov-mediopago').value;
            if (!medioPago) { admToast('Elige el medio de pago.', 'danger'); return; }
        }

        // ¿Plan de CUOTAS? (spec acuerdos): la factura y su acuerdo nacen JUNTOS
        // en un batch; el vencimiento de la factura = la última cuota.
        const enCuotas = _tipo === 'factura'
            && !document.getElementById('mov-cuotas-toggle-row').hidden
            && document.getElementById('mov-encuotas').checked;
        let cuotas = null;
        let vencimiento;
        if (enCuotas) {
            cuotas = cuotasDelForm();
            if (!cuotas) { admToast('Revisa las cuotas: el monto, el número y la primera fecha.', 'danger'); return; }
            if (cuotas[0].fecha < fecha) { admToast('La primera cuota no puede ser antes de la fecha de la deuda.', 'danger'); return; }
            // Sanity con el MISMO validador del aging (si la fórmula lo ignoraría,
            // no se envía): tope del horizonte (P3: 24 meses) incluido.
            const probe = {
                fechaPacto: fecha, cuotas,
                primeraCuotaFecha: cuotas[0].fecha, ultimaCuotaFecha: cuotas[cuotas.length - 1].fecha,
                nota: 'probe', estado: 'vigente',
            };
            if (!acuerdoEsValido(probe, { horizonteDias: horizonteDias() })) {
                admToast('El plan no es válido: la última cuota pasa del máximo permitido.', 'danger', 5000); return;
            }
        } else if (_tipo === 'factura') {
            // Factura simple: el ACUERDO DE PAGO (fecha final) es obligatorio (M6 —
            // directiva 2026-06-12: cada deuda pacta su plazo; el default es sugerencia).
            vencimiento = document.getElementById('mov-vencimiento').value;
            if (!/^\d{4}-\d{2}-\d{2}$/.test(vencimiento)) {
                admToast('Elige el acuerdo de pago: ¿para cuándo quedó?', 'danger'); return;
            }
            if (vencimiento < fecha) {
                admToast('El acuerdo de pago no puede ser antes de la fecha de la deuda.', 'danger'); return;
            }
            // Anti-dedazo de AÑO (verif. M6): un acuerdo explícito manda sobre la mora;
            // uno en 2099 parquearía la deuda fuera de vencidos/SLA/corte para siempre.
            if (vencimiento > vencimientoDefaultISO(fecha, 365)) {
                admToast('Ese acuerdo queda a MÁS DE UN AÑO de la deuda. Revisa el año de la fecha.', 'danger', 5000); return;
            }
        }

        // Sin señal, addDoc/writeBatch NO falla: queda encolado y, al reintentar,
        // crearía una factura (o factura+acuerdo) DUPLICADA. Avisar ANTES — igual que
        // wireAcuerdo/wireGestiones (una factura duplicada es anulable, pero molesta;
        // el batch del mutex en cuotas es lo más costoso de deshacer).
        if (navigator.onLine === false) {
            admToast('Parece que no hay señal. Espera a tener conexión e intenta de nuevo.', 'danger', 5000); return;
        }

        const uid = currentUser()?.user?.uid;
        const descripcion = document.getElementById('mov-desc').value;
        const btn = document.getElementById('mov-save');
        btn.disabled = true;
        try {
            if (enCuotas) {
                // Factura en cuotas: factura + acuerdo SALDO + puntero del cliente en
                // UN batch (mutex v2). El gate de UI garantiza que aquí no hay otra
                // deuda vencida ni acuerdo vigente → primer acuerdo (sin vigenteId).
                await pactarAcuerdo(CLIENTE_ID, {
                    fechaPacto: fecha, cuotas,
                    periodicidad: document.getElementById('mov-cuotas-per').value,
                    saldoAlPactar: Math.round(Number(_cliente?.saldoActual ?? 0)) + monto,
                    nota: `Pactado al crear la factura: ${cuotas.length} cuota(s).${descripcion ? ` ${descripcion.trim()}` : ''}`,
                    creadoPor: uid, rolAlCrear: currentRole(),
                }, { factura: { tipo: 'factura', monto, fecha, descripcion, registradoPor: uid } });
                admToast('Factura y plan de cuotas registrados. El saldo se actualizará en un momento.');
            } else if (_tipo === 'abono') {
                // V17: el abono va por el SERVIDOR (el navegador no puede escribir el libro de
                // caja). Si es en EFECTIVO, la misma transacción mete el billete al arqueo del
                // turno abierto — y si no hay turno, rechaza: sin caja abierta no hay quién
                // custodie ni cuente ese billete.
                const r = await registrarAbonoCartera({
                    opId: _opIdAbono, clienteId: CLIENTE_ID, monto, fecha, medioPago, descripcion,
                });
                admToast(r?.pataCaja
                    ? `Abono de ${fmtCOP(monto)} registrado. El saldo baja y esos ${fmtCOP(monto)} entraron a la caja de hoy: el arqueo de esta noche los espera.`
                    : `Abono de ${fmtCOP(monto)} registrado. El saldo se actualizará en un momento.`,
                    'success', 6000);
            } else {
                await addMovimiento(CLIENTE_ID, {
                    tipo: _tipo,
                    monto,
                    fecha,
                    descripcion,
                    registradoPor: uid,
                    ...(medioPago ? { medioPago } : {}),
                    ...(vencimiento ? { vencimiento } : {}),
                });
                admToast(`${TIPO_LABEL[_tipo]} registrada. El saldo se actualizará en un momento.`);
            }
            closeMovModal();
        } catch (err) {
            // El modal NO se cierra y conserva lo escrito: si el rechazo es "abre la caja", Kary
            // la abre en otra pestaña y reenvía con el MISMO opId (sin riesgo de duplicar).
            // `errorMessage` ya trae el motivo REAL del servidor (TODO-79) — nada de genéricos
            // en dinero: el mensaje debe decir qué pasó con la plata y qué hacer.
            console.error('[cuenta] registrar movimiento:', err);
            admToast(errorMessage(err, 'No se pudo registrar. Intenta de nuevo; si sigue, avísale a Daniel.'), 'danger', 7000);
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
    const catEl    = document.getElementById('anular-categoria');
    fillSelect(catEl, _motivosAnulacion, CAT_LABEL, 'Elige…');
    const close = () => { modal.hidden = true; anularId = null; form.reset(); };

    document.getElementById('mov-body').addEventListener('click', (e) => {
        const btn = e.target.closest('[data-anular]');
        if (!btn) return;
        anularId = btn.getAttribute('data-anular');
        form.reset();
        modal.hidden = false;
        catEl.focus();
    });
    document.getElementById('anular-cancel').addEventListener('click', close);
    document.getElementById('anular-close').addEventListener('click', close);
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const categoria = catEl.value;
        if (!categoria) { admToast('Elige el tipo de corrección.', 'danger'); return; }
        const motivo = motivoEl.value.trim();
        if (!motivo) { admToast('El detalle del motivo es obligatorio.', 'danger'); return; }
        if (!anularId) return;
        const btn = document.getElementById('anular-confirm');
        btn.disabled = true;
        try {
            const mov = _movsById.get(anularId);
            if (mov?.tipo === 'abono') {
                // V17: el abono se anula por el SERVIDOR para NETEAR también su pata en la caja.
                // Sin ese neteo, el arqueo seguiría pidiendo un billete que ya no existe (un
                // descuadre falso, permanente y sin explicación).
                const r = await anularAbonoCartera({
                    clienteId: CLIENTE_ID, movId: anularId, motivo, motivoCategoria: categoria,
                });
                admToast(r?.pataAnulada
                    ? `Abono anulado. El saldo vuelve a subir y esos pesos salieron de la caja de hoy: si el billete está en el cajón, devuélvelo antes de cerrar el turno.`
                    : 'Abono anulado.', 'success', 7000);
            } else {
                await anularMovimiento(CLIENTE_ID, anularId, currentUser()?.user?.uid, motivo, categoria);
                admToast('Movimiento anulado.');
            }
            close();
        } catch (err) {
            console.error('[cuenta] anular:', err);
            // `permission-denied` SIN prefijo = candado de las REGLAS (M2b): el camino correcto es
            // la solicitud a Daniel, no reintentar. Los rechazos de la CF (`functions/…`) ya llegan
            // con su motivo real gracias a errorMessage (TODO-79).
            admToast(err?.code === 'permission-denied'
                ? 'Esta operación necesita aprobación de Daniel.'
                : errorMessage(err, 'No se pudo anular.'), 'danger', 7000);
        } finally {
            btn.disabled = false;
        }
    });
}

// ─── Corregir saldo (admin) — ajuste hacia el saldo correcto, con gate del candado ──
// Rediseño M2a (§69): el motivo alimenta el gate (js/crm-correccion.js); se ANUNCIA en
// pesos antes de enviar y se enruta: dentro del límite → ajuste directo; si no → SOLICITUD
// a Daniel (el saldo no cambia hasta que apruebe). Espejo de lo que M3 impondrá en reglas.
function wireCorregir() {
    const modal    = document.getElementById('corregir-modal');
    const saldoEl  = document.getElementById('corregir-saldo');
    const motivoEl = document.getElementById('corregir-motivo');
    const notaEl   = document.getElementById('corregir-nota');
    const anuncioEl = document.getElementById('corregir-anuncio');
    fillSelect(motivoEl, _motivosAjuste, AJUSTE_LABEL, 'Elige…');

    const saldoActual = () => (typeof _cliente?.saldoActual === 'number' ? _cliente.saldoActual : 0);

    // Anuncio EN VIVO: cuánto cambia y quién lo aplica (Kary ya / Daniel aprueba).
    const refrescarAnuncio = () => {
        const plan = planearCorreccionSaldo(saldoActual(), Number(saldoEl.value), motivoEl.value, _cfgCartera);
        if (plan.noOp) { anuncioEl.textContent = ''; return; }
        const txt = `${plan.delta > 0 ? '+' : '−'}${fmtCOP(Math.abs(plan.delta))}`;
        anuncioEl.textContent = plan.requiereAprobacion
            ? `Se registrará un ajuste de ${txt}. Necesita aprobación de Daniel → se enviará como solicitud (el saldo no cambia hasta que apruebe).`
            : `Se registrará un ajuste de ${txt}. Está dentro de tu límite → se aplica de inmediato.`;
        anuncioEl.style.color = plan.requiereAprobacion ? '#b8860b' : 'var(--adm-muted)';
    };

    const abrirSaldo = (prefill) => {
        document.getElementById('corregir-form').reset();
        document.getElementById('corregir-actual').textContent = `(actual: ${fmtCOP(saldoActual())})`;
        saldoEl.value = prefill?.saldoObjetivo ?? saldoActual();
        if (prefill?.motivo) motivoEl.value = prefill.motivo;
        if (prefill?.nota) notaEl.value = prefill.nota;
        anuncioEl.textContent = '';
        modal.hidden = false;
        if (prefill) refrescarAnuncio();
        saldoEl.focus();
    };
    _abrirCorregirSaldo = abrirSaldo;
    const close = () => { modal.hidden = true; };
    document.getElementById('btn-corregir').addEventListener('click', () => abrirSaldo());
    document.getElementById('corregir-close').addEventListener('click', close);
    document.getElementById('corregir-cancel').addEventListener('click', close);
    modal.addEventListener('click', (e) => { if (e.target.id === 'corregir-modal') close(); });
    saldoEl.addEventListener('input', refrescarAnuncio);
    motivoEl.addEventListener('change', refrescarAnuncio);

    document.getElementById('corregir-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const motivo = motivoEl.value;
        if (!motivo) { admToast('Elige por qué se corrige.', 'danger'); return; }
        const nota = notaEl.value.trim();
        if (!nota) { admToast('Escribe el detalle de la corrección.', 'danger'); return; }
        const actual = saldoActual();
        const plan = planearCorreccionSaldo(actual, Number(saldoEl.value), motivo, _cfgCartera);
        if (plan.noOp) { admToast('El saldo ya es ese.'); close(); return; }
        // Bloqueo de duplicados: no crear un 2º ajuste idéntico pendiente (mismo monto).
        if (plan.requiereAprobacion && _solicitudes.some((s) => s.estado === 'pendiente' && s.tipo === 'ajuste' && s.monto === plan.delta)) {
            admToast('Ya hay un ajuste igual pendiente, esperando a Daniel.', 'danger');
            return;
        }

        const uid = currentUser()?.user?.uid;
        const btn = e.submitter;
        if (btn) btn.disabled = true;
        try {
            if (plan.requiereAprobacion) {
                // SOLICITUD a Daniel — el saldo NO se toca hasta que apruebe (M2b).
                await crearSolicitud(CLIENTE_ID, {
                    tipo: 'ajuste', monto: plan.delta, motivo, nota,
                    fecha: hoyISO(), solicitadoPor: uid, saldoAlSolicitar: Math.round(actual),
                });
                admToast('Enviado a Daniel. El saldo no cambia hasta que apruebe.');
            } else {
                // Dentro del límite → ajuste directo (sin toast optimista: ya esperamos el
                // commit). motivo/nota van TOP-LEVEL (forward-compat con el candado M3).
                await addMovimiento(CLIENTE_ID, {
                    tipo: 'ajuste', monto: plan.delta, fecha: hoyISO(),
                    descripcion: `Corrección (${motivo}): ${nota}`,
                    motivo, nota,
                    registradoPor: uid,
                });
                admToast('Corrección aplicada. El saldo se actualizará en un momento.');
            }
            close();
        } catch (err) {
            console.error('[cuenta] corregir saldo:', err);
            admToast(err?.code === 'permission-denied'
                ? 'Esta corrección necesita aprobación de Daniel.'
                : 'No se pudo aplicar la corrección.', 'danger');
        } finally {
            if (btn) btn.disabled = false;
        }
    });
}

// ─── Corregir UN movimiento (par anular+crear o solicitud) — contrato §74 ──────
function wireCorregirMov() {
    const modal    = document.getElementById('corregirmov-modal');
    const motivoEl = document.getElementById('corregirmov-motivo');
    const montoEl  = document.getElementById('corregirmov-monto');
    const fechaEl  = document.getElementById('corregirmov-fecha');
    const notaEl   = document.getElementById('corregirmov-nota');
    const anuncioEl = document.getElementById('corregirmov-anuncio');
    const origEl   = document.getElementById('corregirmov-original');
    let original = null;

    // "¿Qué corriges?" desde las preguntas de mostrador (deriva el motivoCategoria).
    motivoEl.replaceChildren();
    const ph = document.createElement('option'); ph.value = ''; ph.textContent = 'Elige…'; motivoEl.appendChild(ph);
    for (const q of PREGUNTAS_CORRECCION) {
        const o = document.createElement('option'); o.value = q.motivo; o.textContent = q.pregunta; motivoEl.appendChild(o);
    }

    const plan = () => planearCorreccionMovimiento(original, {
        montoNuevo: Number(montoEl.value), fechaNueva: fechaEl.value, motivoCategoria: motivoEl.value,
    }, _cfgCartera);

    // Anuncio EN VIVO del efecto + quién lo aplica + LA VERDAD sobre el acuerdo (M6):
    // con acuerdo explícito la mora la manda el acuerdo, no la fecha — el copy viejo
    // "cambia la fecha de mora" sería FALSO y le confirmaría a Kary un modelo
    // mental equivocado (verif. M6).
    const refrescar = () => {
        if (!original) { anuncioEl.textContent = ''; return; }
        const p = plan();
        if (p.noOp) { anuncioEl.textContent = 'Cambia el monto o la fecha para corregir.'; anuncioEl.style.color = 'var(--adm-muted)'; return; }
        const conAcuerdo = original.tipo === 'factura' && !!fmtFecha(original.vencimiento);
        const efecto = p.delta === 0
            ? (conAcuerdo ? 'sin efecto en el saldo' : 'sin efecto en el saldo (cambia la fecha de mora)')
            : `el saldo ${p.delta > 0 ? 'sube' : 'baja'} ${fmtCOP(Math.abs(p.delta))}`;
        const acuerdoTxt = conAcuerdo
            ? (p.reemplazo.vencimiento
                ? ` El acuerdo de pago (${fmtFecha(original.vencimiento)}) se mantiene.`
                : ` La fecha nueva pasa del acuerdo (${fmtFecha(original.vencimiento)}) → quedará con el plazo del negocio.`)
            : '';
        anuncioEl.textContent = p.requiereAprobacion
            ? `Se anula y se crea el corregido — ${efecto}.${acuerdoTxt} Necesita aprobación de Daniel → se enviará como solicitud (el saldo no cambia hasta que apruebe).`
            : `Se anula y se crea el corregido — ${efecto}.${acuerdoTxt} Se aplica de inmediato.`;
        anuncioEl.style.color = p.requiereAprobacion ? '#b8860b' : 'var(--adm-muted)';
    };

    const close = () => { modal.hidden = true; original = null; };
    // opener reutilizable (botón Corregir y re-solicitar desde una rechazada).
    const abrir = (orig, prefill) => {
        // V17: un abono en EFECTIVO no se corrige. Corregir = anular + RECREAR, y el par lo escribe
        // el navegador; las reglas niegan crear un abono en efectivo desde el cliente (solo la CF,
        // que mete la pata del billete en la caja del turno). El guard vive AQUÍ —no en el click—
        // porque el modal también se abre al re-solicitar una corrección rechazada.
        if (orig?.tipo === 'abono' && orig?.medioPago === 'efectivo') {
            admToast(orig.pataCaja
                ? 'Este abono en efectivo ya está contado en la caja del turno. Anúlalo y regístralo de nuevo para que la caja quede bien.'
                : 'Un abono en efectivo no se corrige: anúlalo y regístralo de nuevo, así el billete queda contado en la caja del turno.',
                'danger', 7000);
            return;
        }
        original = orig;
        document.getElementById('corregirmov-form').reset();
        const conAcuerdo = original.tipo === 'factura' && !!fmtFecha(original.vencimiento);
        origEl.textContent = `Original: ${TIPO_LABEL[original.tipo] || original.tipo} · ${fmtCOP(original.monto)}`
            + (original.fecha ? ` · ${fmtFecha(original.fecha) || original.fecha}` : '')
            + (conAcuerdo ? ` · acuerdo ${fmtFecha(original.vencimiento)}` : '');
        // Renegociación: el camino correcto NO es este modal (verif. M6).
        const hint = document.getElementById('corregirmov-acuerdo-hint');
        if (hint) hint.hidden = !conAcuerdo;
        montoEl.value = Math.round(Number(prefill?.monto ?? original.monto));
        fechaEl.value = (prefill?.fecha || original.fecha) || '';
        if (prefill?.motivoCategoria) motivoEl.value = prefill.motivoCategoria;
        anuncioEl.textContent = '';
        modal.hidden = false;
        if (prefill) refrescar();
        motivoEl.focus();
    };
    _abrirCorregirMov = abrir;
    document.getElementById('mov-body').addEventListener('click', (e) => {
        const btn = e.target.closest('[data-corregir]');
        if (!btn) return;
        const orig = _movsById.get(btn.getAttribute('data-corregir'));
        if (!orig) { admToast('No se encontró el movimiento.', 'danger'); return; }
        abrir(orig);   // el guard de V17 (abono en efectivo) vive DENTRO de abrir()
    });
    document.getElementById('corregirmov-close').addEventListener('click', close);
    document.getElementById('corregirmov-cancel').addEventListener('click', close);
    modal.addEventListener('click', (e) => { if (e.target.id === 'corregirmov-modal') close(); });
    motivoEl.addEventListener('change', refrescar);
    montoEl.addEventListener('input', refrescar);
    fechaEl.addEventListener('change', refrescar);

    document.getElementById('corregirmov-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!original) return;
        // Defensa en profundidad: corregir un asiento ANULADO crearía un par/solicitud
        // condenado (anulacionValida lo niega; M2b lo marcaría obsoleto al instante).
        // Se consulta la versión VIVA (el modal pudo quedar abierto mientras cambiaba).
        const vivo = _movsById.get(original.id) || original;
        if (vivo.anulado === true) {
            admToast('Este movimiento ya fue anulado — corrige el vigente desde el historial.', 'danger');
            close();
            return;
        }
        const motivoCategoria = motivoEl.value;
        if (!motivoCategoria) { admToast('Elige qué corriges.', 'danger'); return; }
        const nota = notaEl.value.trim();
        if (!nota) { admToast('Escribe el detalle de la corrección.', 'danger'); return; }
        const p = plan();
        if (p.noOp) { admToast('No cambiaste el monto ni la fecha.', 'danger'); return; }
        // factura/abono deben quedar > 0 (un $0 silencioso corrompería el saldo; espejo de la regla).
        if (['factura', 'abono'].includes(original.tipo) && !(p.reemplazo.monto > 0)) {
            admToast('El monto debe ser mayor que 0.', 'danger'); return;
        }
        // Bloqueo de duplicados (refinado): si ya hay una solicitud PENDIENTE sobre
        // ESTE mismo movimiento, no se crea otra cola para lo mismo.
        if (p.requiereAprobacion && _solicitudes.some((s) => s.estado === 'pendiente' && s.correccionDe === original.id)) {
            admToast('Ya hay una corrección pendiente de este movimiento, esperando a Daniel.', 'danger');
            return;
        }
        const uid = currentUser()?.user?.uid;
        const preguntaLabel = (PREGUNTAS_CORRECCION.find((q) => q.motivo === motivoCategoria)?.pregunta) || motivoCategoria;
        const actual = typeof _cliente?.saldoActual === 'number' ? _cliente.saldoActual : 0;
        const btn = e.submitter;
        if (btn) btn.disabled = true;
        try {
            if (p.requiereAprobacion) {
                // SOLICITUD a Daniel — contrato verificado (§74): monto = delta neto, datosCorreccion con snapshot.
                await crearSolicitud(CLIENTE_ID, {
                    tipo: 'correccion', monto: p.delta, motivo: preguntaLabel, nota,
                    fecha: original.fecha, solicitadoPor: uid,
                    correccionDe: original.id, datosCorreccion: p.datosCorreccion,
                    saldoAlSolicitar: Math.round(actual),
                });
                admToast('Enviado a Daniel. El saldo no cambia hasta que apruebe.');
            } else {
                // Dentro del carril → par atómico (anular + crear). Sin toast optimista (await commit).
                await corregirMovimientoBatch(CLIENTE_ID, {
                    original, reemplazo: p.reemplazo, motivoCategoria, motivoAnulacion: nota, uid,
                });
                admToast('Corrección aplicada. El saldo se actualizará en un momento.');
            }
            close();
        } catch (err) {
            console.error('[cuenta] corregir movimiento:', err);
            admToast(err?.code === 'permission-denied'
                ? 'Esta corrección necesita aprobación de Daniel.'
                : 'No se pudo aplicar la corrección.', 'danger');
        } finally {
            if (btn) btn.disabled = false;
        }
    });
}

// ─── Acuerdo de pago sobre la deuda (renegociación 'saldo', spec 2026-06-12) ───
// Re-programa las fechas de pago de TODA la deuda — JAMÁS toca el saldo. Si ya
// hay un acuerdo vigente, se RENEGOCIA (batch atómico: el viejo queda sellado
// 'reemplazado' como evidencia; las reglas hacen imposible el create suelto).
function wireAcuerdo() {
    const modal = document.getElementById('acuerdo-modal');
    const nEl = document.getElementById('acuerdo-n');
    const perEl = document.getElementById('acuerdo-per');
    const primeraEl = document.getElementById('acuerdo-primera');
    const notaEl = document.getElementById('acuerdo-nota');
    const prevEl = document.getElementById('acuerdo-preview');

    const totalDeuda = () => Math.round(Number(_estCuenta && _estCuenta.saldo > 0 ? _estCuenta.saldo : 0));
    const cuotasForm = () => generarCuotas({
        total: totalDeuda(), n: Math.round(Number(nEl.value)),
        periodicidad: perEl.value, primeraFecha: primeraEl.value,
    });
    const refrescar = () => {
        const cuotas = cuotasForm();
        prevEl.textContent = cuotas ? resumenCuotas(cuotas, fmtCOP)
            : 'Revisa el número de cuotas y la primera fecha.';
    };

    const open = () => {
        document.getElementById('acuerdo-form').reset();
        document.getElementById('acuerdo-deuda').textContent = `Deuda actual: ${fmtCOP(totalDeuda())}`;
        primeraEl.value = vencimientoDefaultISO(hoyISO(), 15);
        primeraEl.min = hoyISO();
        refrescar();
        // "Cancelar acuerdo vigente" (3a transición del mutex, old→null): SOLO owner
        // y solo si hay un vigente. Única forma de limpiar un acuerdo erróneo desde el
        // panel (sin esto habría que ir por SDK/consola).
        const vig = _acuerdos.find((a) => a.estado === 'vigente') || null;
        const btnAnular = document.getElementById('acuerdo-anular');
        if (btnAnular) btnAnular.hidden = !(vig && currentRole() === 'owner');
        modal.hidden = false;
        nEl.focus();
    };
    const close = () => { modal.hidden = true; };
    document.getElementById('btn-acuerdo').addEventListener('click', open);
    document.getElementById('acuerdo-close').addEventListener('click', close);
    document.getElementById('acuerdo-cancel').addEventListener('click', close);
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
    for (const el of [nEl, perEl, primeraEl]) {
        el.addEventListener('input', refrescar);
        el.addEventListener('change', refrescar);
    }

    document.getElementById('acuerdo-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const nota = notaEl.value.trim();
        if (!nota) { admToast('Escribe qué se habló con la clienta: es la evidencia del pacto.', 'danger'); return; }
        if (!(totalDeuda() > 0)) { admToast('Esta cuenta no tiene deuda por cobrar.', 'danger'); return; }
        const cuotas = cuotasForm();
        if (!cuotas) { admToast('Revisa el número de cuotas y la primera fecha.', 'danger'); return; }
        const probe = {
            fechaPacto: hoyISO(), cuotas,
            primeraCuotaFecha: cuotas[0].fecha, ultimaCuotaFecha: cuotas[cuotas.length - 1].fecha,
            nota, estado: 'vigente',
        };
        if (!acuerdoEsValido(probe, { horizonteDias: horizonteDias() })) {
            admToast('El plan no es válido: la última cuota pasa del máximo permitido.', 'danger', 5000); return;
        }
        if (navigator.onLine === false) {
            admToast('Parece que no hay señal. Espera a tener conexión e intenta de nuevo.', 'danger', 5000); return;
        }
        const vigente = _acuerdos.find((a) => a.estado === 'vigente') || null;
        const acuerdo = {
            fechaPacto: hoyISO(), cuotas, periodicidad: perEl.value,
            saldoAlPactar: totalDeuda(), nota,
            creadoPor: currentUser()?.user?.uid, rolAlCrear: currentRole(),
        };
        const btn = document.getElementById('acuerdo-save');
        btn.disabled = true;
        try {
            // Mutex: pactarAcuerdo crea (o renegocia si hay vigente) + mueve el puntero.
            await pactarAcuerdo(CLIENTE_ID, acuerdo, vigente ? { vigenteId: vigente.id } : {});
            admToast('Acuerdo registrado. No cambia el saldo: re-programa las fechas de pago.');
            close();
        } catch (err) {
            console.error('[cuenta] acuerdo de pago:', err);
            admToast('No se pudo registrar el acuerdo. Intenta de nuevo; si sigue, avísale a Daniel.', 'danger', 5000);
        } finally {
            btn.disabled = false;
        }
    });

    // Cancelar (anular) el acuerdo vigente — 3a transición del mutex (OWNER, old→null).
    // El motivo se toma del campo "¿Qué se habló?" (evidencia del cierre).
    const btnAnular = document.getElementById('acuerdo-anular');
    if (btnAnular) btnAnular.addEventListener('click', async () => {
        const vigente = _acuerdos.find((a) => a.estado === 'vigente') || null;
        if (!vigente) { admToast('No hay un acuerdo vigente que cancelar.', 'danger'); return; }
        if (currentRole() !== 'owner') { admToast('Cancelar un acuerdo es solo de Daniel (owner).', 'danger'); return; }
        const motivo = notaEl.value.trim();
        if (!motivo) { admToast('Escribe el motivo de la cancelación en "¿Qué se habló?": queda como evidencia.', 'danger', 5000); return; }
        if (navigator.onLine === false) {
            admToast('Parece que no hay señal. Espera a tener conexión e intenta de nuevo.', 'danger', 5000); return;
        }
        if (!confirm('¿Cancelar el acuerdo vigente? La deuda vuelve a regirse por sus fechas ORIGINALES. Queda registrado como evidencia.')) return;
        btnAnular.disabled = true;
        try {
            await anularAcuerdo(CLIENTE_ID, vigente.id, motivo, currentUser()?.user?.uid);
            admToast('Acuerdo cancelado. La deuda vuelve a sus fechas originales.');
            close();
        } catch (err) {
            console.error('[cuenta] anular acuerdo:', err);
            admToast('No se pudo cancelar. Intenta de nuevo; si sigue, avísale a Daniel.', 'danger', 5000);
        } finally {
            btnAnular.disabled = false;
        }
    });
}

// ─── Gestiones de cobro (Fase M · M5) — evidencia inmutable del expediente ─────
// El timeline y el contador salen del MISMO listener (set completo de la clienta);
// la inmutabilidad la imponen las reglas (gestionValida + update/delete false).
function renderGestiones(list) {
    const cont = document.getElementById('gest-list');
    const empty = document.getElementById('gest-empty');
    const count = document.getElementById('gest-count');
    if (!cont || !empty) return;
    count.textContent = list.length ? `(${list.length})` : '';
    cont.replaceChildren();
    if (!list.length) {
        document.getElementById('gest-empty-msg').textContent =
            'Sin gestiones de cobro. Cada llamada, WhatsApp o visita de cobro se registra aquí como evidencia.';
        empty.hidden = false;
        return;
    }
    empty.hidden = true;

    for (const g of ordenarGestiones(list)) {
        const card = document.createElement('div');
        card.style.cssText = 'padding:10px 14px;border-radius:14px;margin-bottom:8px;background:var(--adm-soft,#f5f3ef);display:flex;justify-content:space-between;align-items:baseline;gap:12px;flex-wrap:wrap;';

        const info = document.createElement('div');
        info.style.fontSize = '13px';
        const titulo = document.createElement('div');
        titulo.style.fontWeight = '600';
        titulo.title = `Registrada: ${fmtDateTime(g.creadoEn)}`;
        titulo.textContent = `${fmtFecha(g.fecha) || '—'} · ${tipoGestionLabel(g.tipo)}`;
        const detalle = document.createElement('div');
        detalle.style.color = 'var(--adm-muted)';
        detalle.textContent = g.nota || '';
        info.append(titulo, detalle);
        // Soporte: clickeable SOLO si es http(s); otro texto se muestra plano.
        if (g.soporte) {
            const sop = document.createElement('div');
            sop.style.cssText = 'color:var(--adm-muted);font-size:12px;';
            if (esEnlaceSeguro(g.soporte)) {
                const a = document.createElement('a');
                a.href = g.soporte.trim(); a.target = '_blank'; a.rel = 'noopener noreferrer';
                a.textContent = 'Ver soporte ↗';
                sop.appendChild(a);
            } else {
                sop.textContent = `Soporte: ${g.soporte}`;
            }
            info.appendChild(sop);
        }
        // Sello de registro VISIBLE (no solo tooltip: la ficha se usa en celular y
        // fecha del hecho ≠ fecha de registro tiene valor probatorio — verif. M5).
        const sello = document.createElement('div');
        sello.style.cssText = 'color:var(--adm-muted);font-size:11px;';
        sello.textContent = `Registrada: ${fmtDateTime(g.creadoEn)}`;
        info.appendChild(sello);

        const pill = document.createElement('span');
        pill.className = 'adm-pill';
        pill.textContent = resultadoGestionLabel(g.resultado);

        card.append(info, pill);
        cont.appendChild(card);
    }
}

function wireGestiones() {
    const modal = document.getElementById('gest-modal');
    const tipoEl = document.getElementById('gest-tipo');
    const resEl = document.getElementById('gest-resultado');
    // Selects desde las listas espejo de la regla (códigos → etiquetas de mostrador).
    fillSelect(tipoEl, TIPOS_GESTION.map((t) => t.codigo),
        Object.fromEntries(TIPOS_GESTION.map((t) => [t.codigo, t.label])), 'Elige…');
    fillSelect(resEl, RESULTADOS_GESTION.map((r) => r.codigo),
        Object.fromEntries(RESULTADOS_GESTION.map((r) => [r.codigo, r.label])), 'Elige…');

    const open = () => {
        document.getElementById('gest-form').reset();
        const fechaEl = document.getElementById('gest-fecha');
        fechaEl.value = hoyISO();   // default: hoy
        fechaEl.max = hoyISO();     // el picker no ofrece días futuros (validarGestion = red de seguridad)
        modal.hidden = false;
        tipoEl.focus();
    };
    const close = () => { modal.hidden = true; };
    document.getElementById('btn-gestion').addEventListener('click', open);
    document.getElementById('gest-close').addEventListener('click', close);
    document.getElementById('gest-cancel').addEventListener('click', close);
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });

    document.getElementById('gest-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const g = {
            tipo: tipoEl.value,
            resultado: resEl.value,
            fecha: document.getElementById('gest-fecha').value,
            nota: document.getElementById('gest-nota').value.trim(),
            soporte: document.getElementById('gest-soporte').value.trim(),
        };
        const v = validarGestion(g, hoyISO());
        if (!v.ok) { admToast(v.errores[0], 'danger'); return; }

        // Sin señal, addDoc NO falla: queda encolado y el botón se congelaría sin
        // aviso. Mejor decirlo ANTES — un reintento a ciegas crearía una gestión
        // DOBLE que no se puede borrar (inmutable por reglas, art. 146 ET).
        if (navigator.onLine === false) {
            admToast('Parece que no hay señal. Espera a tener conexión e intenta de nuevo.', 'danger', 5000);
            return;
        }

        const btn = document.getElementById('gest-save');
        btn.disabled = true;
        // Si la señal se cae justo al enviar, la promesa queda pendiente: avisar
        // con honestidad SIN re-habilitar (re-enviar = evidencia duplicada imborrable).
        const avisoLento = setTimeout(() => {
            admToast('Esto está tardando (¿se fue la señal?). No la registres de nuevo: se guardará sola al volver la conexión.', 'danger', 8000);
        }, 8000);
        try {
            await registrarGestion(CLIENTE_ID, { ...g, registradoPor: currentUser()?.user?.uid });
            admToast('Gestión registrada.');
            close();
        } catch (err) {
            console.error('[cuenta] registrarGestion:', err);
            admToast('No se pudo registrar la gestión. Intenta de nuevo; si sigue, avísale a Daniel.', 'danger', 5000);
        } finally {
            clearTimeout(avisoLento);
            btn.disabled = false;
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
        console.warn('[cuenta] getConfig negocio:', err);
    }

    // config/cartera (M0 §70): listas del negocio para los selects (categoría de
    // anulación, medios de pago). Fallback literal si no carga (las reglas mandan).
    try {
        const cc = await getConfig('cartera');
        _cfgCartera = cc || null;
        if (Array.isArray(cc?.motivosAnulacion) && cc.motivosAnulacion.length) _motivosAnulacion = cc.motivosAnulacion;
        if (Array.isArray(cc?.mediosPago) && cc.mediosPago.length) _mediosPago = cc.mediosPago;
        if (Array.isArray(cc?.motivosAjuste) && cc.motivosAjuste.length) _motivosAjuste = cc.motivosAjuste;
    } catch (err) {
        console.warn('[cuenta] getConfig cartera:', err);
    }

    const cli = await getCliente(CLIENTE_ID);
    if (!cli) { showError('Cliente no encontrado.'); return; }
    renderHeader(cli);

    wireModal();
    wireAnular();
    wireCorregir();
    wireCorregirMov();
    wireEditar();
    wireGestiones();
    wireAcuerdo();

    onClienteChange(CLIENTE_ID, (c) => renderHeader(c));
    onMovimientosChange(CLIENTE_ID, (list) => renderMovimientos(list));
    onSolicitudesChange(CLIENTE_ID, (list) => renderSolicitudes(list));
    // Acuerdos de pago: SOLO con la bandera activa (sin ella, las reglas del match
    // pueden no estar desplegadas → cero listeners condenados a error).
    if (acuerdosActivos()) {
        onAcuerdosChange(CLIENTE_ID, (list) => { _acuerdos = list; renderEstado(_movs); }, () => {
            // Listener muerto (L-40): sin acuerdos confiables la mora se muestra SIN
            // plan (fallback conservador = más vencido) y se avisa con honestidad.
            _acuerdos = [];
            renderEstado(_movs);
            admToast('No se pudieron cargar los acuerdos de pago. Recarga la página.', 'danger', 5000);
        });
    }
    onGestionesChange(CLIENTE_ID, (list) => renderGestiones(list), () => {
        // Estado HONESTO ante un listener muerto (L-40): jamás "sin gestiones" falso
        // ni un contador "(N)" que ya nada respalda.
        const empty = document.getElementById('gest-empty');
        const count = document.getElementById('gest-count');
        document.getElementById('gest-list')?.replaceChildren();
        if (count) count.textContent = '';
        document.getElementById('gest-empty-msg').textContent =
            'No se pudieron cargar las gestiones. Recarga la página; si sigue, avísale a Daniel.';
        if (empty) empty.hidden = false;
    });
}

init();
