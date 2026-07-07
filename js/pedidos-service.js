/**
 * pedidos-service.js — cliente del ÚNICO escritor de ventas (B1 paso 3 · TODO-37).
 *
 * El navegador (POS/web/WhatsApp) manda INSUMOS; la Cloud Function `crearPedido` (Admin SDK)
 * valida el stock atómico (candado = doc de la pieza), RECALCULA el total server-side y congela
 * el snapshot inmutable. Aquí NO vive lógica de dinero ni de concurrencia: solo transporte
 * (callable) + lectura de las ventas (staff). Aísla el backend de la vista (pos.js) para que
 * web/WhatsApp reusen lo mismo sin arrastrar el DOM del panel (§3.6 cero monolitos).
 */
import { app, firestoreDb } from './firebase-config.js';
import { collection, query, orderBy, limit, getDocs, getDoc, doc, onSnapshot, where } from 'firebase/firestore';
import { subscribeWithRetry } from './core/live-query.js';

// Callable lazy (no cargamos firebase/functions hasta la 1ª venta — igual que crm-service).
async function _callable(name) {
    const { getFunctions, httpsCallable } = await import('firebase/functions');
    return httpsCallable(getFunctions(app, 'us-central1'), name);
}

/**
 * Registra una venta llamando a la CF `crearPedido` (idempotente por `pedidoId`).
 * @param {{ pedidoId:string, pieceId:string, valorGramo?:number|string, peso?:number|string,
 *           manoObra?:number|string, medio?:string, canal?:string }} input
 * @returns {Promise<{ pedidoId:string, numero:number, total:number, yaExistia:boolean }>}
 */
export async function crearPedido(input) {
    const fn = await _callable('crearPedido');
    return (await fn(input)).data;
}

/**
 * Wompi F2 — el cliente PÚBLICO inicia el cobro web de UNA pieza. La CF `iniciarPagoWeb` reserva
 * la pieza (candado atómico), crea el pedido `pago_pendiente`, recalcula el total y FIRMA server-side.
 * @param {{ pedidoId:string, pieceId:string, shipping?:object }} input  (pedidoId = UUID del cliente, idempotencia)
 * @returns {Promise<{ reference:string, amountInCents:number, currency:string, signature:string, publicKey:string, estado:string }>}
 */
export async function iniciarPagoWeb(input) {
    const fn = await _callable('iniciarPagoWeb');
    return (await fn(input)).data;
}

/**
 * Confirma que llegó el pago de un pedido ("vi la plata"): `pago_por_verificar` → `pagado`.
 * Solo la CF flipea el estado (regla SoD). Idempotente.
 * @param {string} pedidoId
 * @returns {Promise<{ pedidoId:string, estado:string, yaEstaba:boolean }>}
 */
export async function confirmarPago(pedidoId) {
    const fn = await _callable('confirmarPago');
    return (await fn({ pedidoId })).data;
}

/**
 * Anula un pedido (VOID): lo marca `anulado` y reintegra la pieza al catálogo. Idempotente.
 * @param {string} pedidoId @param {string} [motivo]
 * @returns {Promise<{ ok:boolean, yaAnulado:boolean, piezaReintegrada?:boolean }>}
 */
export async function anularPedido(pedidoId, motivo) {
    const fn = await _callable('anularPedido');
    return (await fn({ pedidoId, motivo })).data;
}

/**
 * F1-CORE: avanza un pedido por la máquina de estados (tabla TRANSICIONES server-side).
 * @param {{ pedidoId:string, a:string, datos?:object, nota?:string }} input
 * @returns {Promise<{ pedidoId:string, estado:string, de?:string, yaEstaba?:boolean }>}
 */
export async function avanzarPedido(input) {
    const fn = await _callable('avanzarPedido');
    return (await fn(input)).data;
}

/**
 * Cierre de caja (arqueo): declara el efectivo contado → devuelve esperado y descuadre. Idempotente por arqueoId.
 * @param {{ arqueoId:string, declaradoEfectivo:number|string }} input
 * @returns {Promise<{ esperadoEfectivo:number, esperadoPorMedio:object, declaradoEfectivo:number, descuadre:number, yaExistia:boolean }>}
 */
export async function cierreCaja(input) {
    const fn = await _callable('cierreCaja');
    return (await fn(input)).data;
}

// ─── F2.0 · Sesión de caja + Bóveda (transporte callable; lógica en caja-core.js del server) ─────
// El navegador genera el `opId` (idempotencia §8.1.2) y lo manda; el rol lo valida la CF (isCaja opera,
// owner aprueba). Los cores recomputan/gatean server-side; aquí SOLO transporte (§3.6 cero monolitos).

/** Abre el turno de caja (rechaza si ya hay uno abierto). @param {{opId:string, fondoApertura:number}} input */
export async function abrirTurno(input) {
    const fn = await _callable('abrirTurno');
    return (await fn(input)).data;
}
/** Cierra el turno: arqueo a ciegas + ecuación completa + descuadre. @param {{turnoId:string, conteoPorMedio:object}} input */
export async function cerrarTurno(input) {
    const fn = await _callable('cerrarTurno');
    return (await fn(input)).data;
}
/** Ingreso/egreso manual del turno (egreso → alerta al owner). @param {{turnoId, opId, tipo, concepto, monto, nota?}} input */
export async function movimientoCaja(input) {
    const fn = await _callable('movimientoCaja');
    return (await fn(input)).data;
}
/** Traslado de dinero cajón↔bóveda↔banco (recompute del saldo). @param {{opId, tipo, monto, turnoId?, nota?}} input */
export async function registrarTraslado(input) {
    const fn = await _callable('registrarTraslado');
    return (await fn(input)).data;
}
/** Reversa (asiento compensatorio) de un movimiento de bóveda — nace PENDIENTE. @param {{opId, reversaA, motivo}} input */
export async function reversoTraslado(input) {
    const fn = await _callable('reversoTraslado');
    return (await fn(input)).data;
}
/** Ajuste de bóveda por conteo físico (faltante/sobrante) — nace PENDIENTE. @param {{opId, tipo, monto, motivo}} input */
export async function ajusteBoveda(input) {
    const fn = await _callable('ajusteBoveda');
    return (await fn(input)).data;
}
/** Aprueba un evento destructivo pendiente (reverso/ajuste) → entra al recompute. SOLO owner. @param {{opId}} input */
export async function aprobarEventoCaja(input) {
    const fn = await _callable('aprobarEventoCaja');
    return (await fn(input)).data;
}

// ─── F2.1 · Identidad del cliente (transporte callable; lógica en identidad-cf.js del server) ─────
// SOLO admin (rol lo valida la CF). resolverCliente = match EXACTO por documento (NUNCA desde el
// checkout público — oráculo de enumeración, comité seguridad). El dedup BLANDO por teléfono/nombre
// es client-side (advisory-match.js); aquí solo transporte.

/** Match exacto por documento del comprador → clienteId. @param {{docType, docNumber, telefono?, nombre?}} input */
export async function resolverCliente(input) {
    const fn = await _callable('resolverCliente');
    return (await fn(input)).data;
}
/** Crea cliente (doc opcional; colisión→existente; consent obligatorio si hay doc). @param {{nombre, telefono?, docType?, docNumber?, consent?}} input */
export async function crearClienteConDoc(input) {
    const fn = await _callable('crearClienteConDoc');
    return (await fn(input)).data;
}
/** Adjunta un documento a un cliente existente (colisión con otro→needsMerge). @param {{clienteId, docType, docNumber, consent}} input */
export async function attachDocACliente(input) {
    const fn = await _callable('attachDocACliente');
    return (await fn(input)).data;
}
/** Vincula un pedido a un cliente (escribe pedido.clienteId + historial, CF-only). @param {{pedidoId, clienteId}} input */
export async function vincularClientePedido(input) {
    const fn = await _callable('vincularClientePedido');
    return (await fn(input)).data;
}
/** Fusiona dos clientes duplicados (append-only). SOLO owner. @param {{fromId, intoId}} input */
export async function fusionarClientes(input) {
    const fn = await _callable('fusionarClientes');
    return (await fn(input)).data;
}

/**
 * Flag `config/identidad.activo` (one-shot, FAIL-CLOSED). El POS lo lee UNA vez en boot y cachea;
 * el hot path (doRegister/render) consulta el cache, no esto. Cualquier error/ausencia → false
 * (POS idéntico a hoy). Deploy dark → set pepper → flip flag → gate. @returns {Promise<boolean>}
 */
export async function getConfigIdentidadActiva() {
    try {
        const snap = await getDoc(doc(firestoreDb, 'config', 'identidad'));
        return snap.exists() && snap.data().activo === true;
    } catch { return false; }
}

/**
 * Lista ACOTADA de clientes para el typeahead del POS (fetch puntual, NO listener permanente —
 * comité: la colección completa viva = PII+escala). Solo los campos del vínculo. Refrescar =
 * llamar de nuevo o append en memoria al crear. @returns {Promise<Array>}
 */
export async function fetchClientesLite(max = 500) {
    const snap = await getDocs(query(collection(firestoreDb, 'clientes'), limit(max)));
    return snap.docs.map((d) => {
        const x = d.data();
        return { id: d.id, nombre: x.nombre || '', telefono: x.telefono || '', whatsapp: x.whatsapp || '', docKeys: Array.isArray(x.docKeys) ? x.docKeys : [], activo: x.activo };
    });
}

// ─── F2.0 · LECTURAS en vivo (listeners) — el candado real es server-side (reglas por rol) ────
// La UI ESCUCHA; ninguna lógica de dinero vive aquí (§3.6). El rol define qué ve: `isCaja` lee su
// turno/config; `isOwner` lee la bóveda + su ledger (discreción D7). Cada helper acepta `onErr`
// para que la vista degrade con un aviso (p.ej. un `caja` que aún no puede leer pedidos → gap).
//
// Los listeners de CAJA usan `subscribeWithRetry` (§93, igual que onPedidosChange): Firestore TERMINA
// el stream ante un error transitorio (bajón de red / refresh de token) y NO reintenta solo — un
// listener crudo dejaría el turno/movs CONGELADO hasta recargar. `onErr` se invoca en CADA fallo
// (idempotente aquí: console.warn o `_trasladosLedger=null`), MIENTRAS el helper re-suscribe con
// backoff. Nota: un rol `caja` puro sin lectura de pedidos/traslados dará permission-denied → reintento
// perpetuo con backoff cap 30s (inofensivo; el owner —Kary en prod— nunca lo toca; L-78). Los listeners
// de BÓVEDA se dejan crudos a propósito: su `onErr` muestra un TOAST, que se apilaría por reintento.

/** Puntero del turno abierto (`caja/estado`: turnoAbiertoId + cota docsDelTurno). read isCaja. */
export function onCajaEstadoChange(cb, onErr) {
    return subscribeWithRetry(
        () => doc(firestoreDb, 'caja', 'estado'),
        s => cb(s.exists() ? s.data() : { turnoAbiertoId: null, docsDelTurno: 0 }),
        'caja/estado', onErr);
}
/** Config de caja (enforceTurno/fondoTrabajo/limiteCajon). read isCaja (el POS necesita el límite). */
export function onConfigCajaChange(cb, onErr) {
    return subscribeWithRetry(
        () => doc(firestoreDb, 'config', 'caja'),
        s => cb(s.exists() ? s.data() : null),
        'config/caja', onErr);
}
/** Turno por id (fondo, estado, sellos de cierre). read isCaja. cb(null) si no existe. */
export function onTurnoChange(turnoId, cb, onErr) {
    return subscribeWithRetry(
        () => doc(firestoreDb, 'turnos', turnoId),
        s => cb(s.exists() ? { id: s.id, ...s.data() } : null),
        'turno', onErr);
}
/** Movimientos manuales (ingreso/egreso) del turno. read isCaja. Más reciente primero. */
export function onMovsCajaChange(turnoId, cb, onErr) {
    return subscribeWithRetry(
        () => query(collection(firestoreDb, 'turnos', turnoId, 'movsCaja'), orderBy('ts', 'desc')),
        s => cb(s.docs.map(d => ({ id: d.id, ...d.data() }))),
        'movsCaja', onErr);
}
/** Ventas del turno (pertenencia por turnoId #6; filtro de estado/medio en la vista). read isVentas. */
export function onVentasTurnoChange(turnoId, cb, onErr) {
    return subscribeWithRetry(
        () => query(collection(firestoreDb, 'pedidos'), where('turnoId', '==', turnoId)),
        s => cb(s.docs.map(d => ({ id: d.id, ...d.data() }))),
        'ventasTurno', onErr);
}
/** Traslados cajón↔bóveda de ESTE turno (para el efectivo exacto del cajón). read isOwner (cae si no). */
export function onTrasladosTurnoChange(turnoId, cb, onErr) {
    return subscribeWithRetry(
        () => query(collection(firestoreDb, 'bovedaMovimientos'), where('turnoId', '==', turnoId)),
        s => cb(s.docs.map(d => ({ id: d.id, ...d.data() }))),
        'trasladosTurno', onErr);
}
/** Saldo de la bóveda (materializado por recalcBoveda; VISTA, no autoridad §8.1.3). read isOwner. */
export function onBovedaChange(cb, onErr) {
    return onSnapshot(doc(firestoreDb, 'boveda', 'main'),
        s => cb(s.exists() ? s.data() : { saldo: 0 }),
        e => onErr?.(e));
}
/** Ledger de bóveda (append-only, inmutable §9.3). read isOwner. Más reciente primero. */
export function onBovedaMovsChange(cb, max = 200, onErr) {
    return onSnapshot(query(collection(firestoreDb, 'bovedaMovimientos'), orderBy('ts', 'desc'), limit(max)),
        s => cb(s.docs.map(d => ({ id: d.id, ...d.data() }))),
        e => onErr?.(e));
}

/**
 * F1-CORE: historial append-only del pedido (traza de transiciones que escribe `avanzarPedido`).
 * One-shot al abrir el detalle (no listener: es una traza, no un tablero). La regla de `pedidos`
 * ya cubre subcolecciones para staff (`match /{sub=**}`).
 * @param {string} pedidoId @param {number} [max=100]
 * @returns {Promise<Array>} eventos {de, a, autor, at, nota, dayKey} — más reciente primero
 */
export async function historialPedido(pedidoId, max = 100) {
    const q = query(collection(firestoreDb, 'pedidos', pedidoId, 'historial'), orderBy('at', 'desc'), limit(max));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Últimas ventas registradas (lectura permitida a staff de ventas: owner/admin/catálogo).
 * One-shot — para exports on-demand (contador). Para la VISTA usar `onUltimasVentasChange`.
 * @param {number} [max=15]
 * @returns {Promise<Array>} pedidos (más reciente primero)
 */
export async function ultimasVentas(max = 15) {
    const q = query(collection(firestoreDb, 'pedidos'), orderBy('createdAt', 'desc'), limit(max));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Últimas ventas EN VIVO (reactividad money-safe · Daniel 2026-07-07): mismo query que
 * `ultimasVentas` pero como listener robusto (subscribeWithRetry, ADR §93). El Mostrador NUNCA
 * debe requerir refresco para ver la verdad del dinero: una venta / anulación / confirmación
 * hecha desde OTRA sesión o el cierre del turno se refleja al instante. Lectura = staff de
 * ventas (owner/admin/catalogo, reglas). Re-suscribe sola ante errores transitorios.
 * @param {Function} cb (ventas[]) => void — más reciente primero
 * @param {number}   [max=15] tope del listener
 * @param {Function} [onUiError] opcional: la UI pinta un aviso mientras el helper reintenta
 * @returns {Function} cleanup
 */
export function onUltimasVentasChange(cb, max = 15, onUiError) {
    return subscribeWithRetry(
        () => query(collection(firestoreDb, 'pedidos'), orderBy('createdAt', 'desc'), limit(max)),
        snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
        'ultimasVentas',
        onUiError,
    );
}

/**
 * Pedidos EN VIVO (F1-PUENTE · TODO-68): lista reactiva para el módulo admin Pedidos.
 * Re-suscribe sola ante errores transitorios (subscribeWithRetry, ADR §93) — un pedido web
 * nuevo aparece sin recargar. Lectura = staff de ventas (owner/admin/catalogo, reglas).
 * @param {Function} cb (pedidos[]) => void — más reciente primero
 * @param {number}   [max=200] tope del listener (paginación real = F1-CORE/F6)
 * @param {Function} [onUiError] opcional: la UI pinta un aviso mientras el helper reintenta
 * @returns {Function} cleanup
 */
export function onPedidosChange(cb, max = 200, onUiError) {
    return subscribeWithRetry(
        () => query(collection(firestoreDb, 'pedidos'), orderBy('createdAt', 'desc'), limit(max)),
        snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
        'pedidos',
        onUiError
    );
}

export default {
    crearPedido, iniciarPagoWeb, confirmarPago, anularPedido, cierreCaja, avanzarPedido,
    historialPedido, ultimasVentas, onUltimasVentasChange, onPedidosChange,
    // F2.0 caja/bóveda — escrituras (callables)
    abrirTurno, cerrarTurno, movimientoCaja, registrarTraslado, reversoTraslado, ajusteBoveda, aprobarEventoCaja,
    // F2.0 caja/bóveda — lecturas (listeners)
    onCajaEstadoChange, onConfigCajaChange, onTurnoChange, onMovsCajaChange, onVentasTurnoChange,
    onTrasladosTurnoChange, onBovedaChange, onBovedaMovsChange,
    // F2.1 identidad del cliente (callables, SOLO admin)
    resolverCliente, crearClienteConDoc, attachDocACliente, vincularClientePedido, fusionarClientes,
};
