/**
 * Bersaglio CRM — Servicio Firestore del módulo de cuentas por cobrar (fiado).
 *
 * MÓDULO DESACOPLADO del catálogo público (`firestore-service.js`): el CRM es un
 * límite de módulo propio (charter `docs/50-ARQUITECTURA.md §3`). Lo consumen
 * exclusivamente las pantallas admin del CRM (Panel de Kary — operación centralizada).
 *
 * Colecciones (reglas en `firestore.rules`, ADR §42):
 *   clientes/{id}                      — saldoActual lo escribe SOLO la Cloud Function.
 *   clientes/{id}/movimientos/{movId}  — append-only; Kary registra facturas/abonos.
 *   vendedoras/{id}                    — entidad de datos; las gestiona Kary.
 *   config/{docId}                     — parámetros del negocio (write admin).
 */

import { app, firestoreDb } from './firebase-config.js';
import {
    collection, collectionGroup, doc, getDocs, getDoc, addDoc, setDoc, updateDoc, deleteDoc,
    writeBatch, query, where, orderBy, limit, serverTimestamp, deleteField,
} from 'firebase/firestore';
import { subscribeWithRetry } from './core/live-query.js';

// Tope de seguridad para listeners (doctrina S3). La cartera de fiado es acotada;
// si se llegara a este límite, hay que paginar (ver docs/41-SEGURIDAD §S3).
const MAX = 2000;

// ─── Detector de truncado (spec §9.1: "alerta cuando rowcount == limit") ──────
// Un listener que llega a su tope = datos INCOMPLETOS en pantallas de dinero (la
// mora EN VIVO necesita el set completo de movimientos, L-29). Antes esto era un
// console.warn mudo; ahora además emite un evento que el panel pinta como banner
// visible (js/admin/truncado.js). GATE de escala (ADR §68): si este banner aparece,
// toca materializar el aging y RECIÉN entonces paginar por cursor las listas.
function detectarTruncado(origen, size, limite = MAX) {
    if (size < limite) return false;
    console.warn(`[crm] ${origen} truncado en ${limite} (S3): los datos visibles están incompletos.`);
    try {
        document.dispatchEvent(new CustomEvent('bj:truncado', { detail: { origen, limite } }));
    } catch { /* entorno sin DOM (tests/SSR): el warn ya quedó */ }
    return true;
}

// ─── Formato de dinero (COP, sin decimales) ──────────────────────────────────
const _cop = new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', maximumFractionDigits: 0,
});
export function fmtCOP(n) {
    return _cop.format(typeof n === 'number' && isFinite(n) ? n : 0);
}

// ─── Clientes ────────────────────────────────────────────────────────────────
export async function fetchClientes() {
    const snap = await getDocs(query(collection(firestoreDb, 'clientes'), limit(MAX)));
    detectarTruncado('Clientes', snap.size);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export function onClientesChange(cb) {
    const q = query(collection(firestoreDb, 'clientes'), limit(MAX));
    return subscribeWithRetry(() => q, (snap) => {
        detectarTruncado('Clientes', snap.size);
        cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    }, 'Clientes');
}

/**
 * Crea un cliente. `saldoActual` NO se envía: lo inicializa la Cloud Function vía
 * el movimiento de apertura (las reglas rechazan que el cliente lo escriba).
 */
export async function createCliente(data) {
    const payload = {
        nombre: (data.nombre || '').trim(),
        ...(data.telefono   ? { telefono: data.telefono.trim() } : {}),
        ...(data.whatsapp   ? { whatsapp: data.whatsapp.trim() } : {}),
        ...(data.cumpleanos ? { cumpleanos: data.cumpleanos } : {}),
        ...(data.notas      ? { notas: data.notas.trim() } : {}),
        ...(data.vendedoraId ? { vendedoraId: data.vendedoraId } : {}),
        origen: data.origen || 'kary',
        activo: true,
        createdAt: serverTimestamp(),
    };
    const ref = await addDoc(collection(firestoreDb, 'clientes'), payload);
    return { id: ref.id, ...payload };
}

export async function updateCliente(id, patch) {
    await updateDoc(doc(firestoreDb, 'clientes', id), { ...patch, updatedAt: serverTimestamp() });
}

export async function getCliente(id) {
    const snap = await getDoc(doc(firestoreDb, 'clientes', id));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/** Suscripción en vivo a UN cliente (su saldoActual cambia cuando corre la CF). */
export function onClienteChange(id, cb) {
    return subscribeWithRetry(() => doc(firestoreDb, 'clientes', id), (snap) => {
        cb(snap.exists() ? { id: snap.id, ...snap.data() } : null);
    }, 'Cliente');
}

// ─── Movimientos (cuenta corriente de un cliente) ─────────────────────────────
export function onMovimientosChange(clienteId, cb) {
    const q = query(
        collection(firestoreDb, 'clientes', clienteId, 'movimientos'),
        orderBy('registradoEn', 'desc'), limit(MAX),
    );
    return subscribeWithRetry(() => q, (snap) => {
        detectarTruncado('Historial del cliente', snap.size);
        cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    }, 'Historial del cliente');
}

/**
 * Registra un movimiento (factura/abono/apertura/ajuste). El saldo del cliente lo
 * recalcula la Cloud Function `recalcSaldoCliente` (ADR §43) — aquí no se toca.
 *
 * `fecha` ('YYYY-MM-DD') = fecha REAL del hecho que elige Kary (base de la mora,
 * ADR §51). Es inmutable tras crearse (las reglas solo permiten anular). Si no se
 * envía, el movimiento queda sin fecha → la mora cae al fallback `fechaCorteMigracion`.
 */
function buildMovPayload({ tipo, monto, descripcion, registradoPor, fecha, medioPago, motivo, nota, vencimiento }) {
    return {
        tipo,
        monto: Number(monto),
        ...(descripcion ? { descripcion: descripcion.trim() } : {}),
        ...(/^\d{4}-\d{2}-\d{2}$/.test(fecha || '') ? { fecha } : {}),
        // medioPago: M2a lo escribe en abonos (lista literal); M3 lo hace obligatorio
        // en la regla.
        ...(medioPago ? { medioPago } : {}),
        // vencimiento (M6): acuerdo de pago POR DEUDA — la regla solo lo admite en
        // facturas; espejo aquí para no enviar un payload condenado.
        ...(tipo === 'factura' && /^\d{4}-\d{2}-\d{2}$/.test(vencimiento || '') ? { vencimiento } : {}),
        // motivo/nota TOP-LEVEL del AJUSTE (forward-compat M3: el candado exige a todo
        // ajuste motivo de lista cerrada + nota; la descripcion sigue siendo el texto humano).
        ...(motivo ? { motivo } : {}),
        ...(nota ? { nota: String(nota).trim() } : {}),
        registradoPor,
        registradoEn: serverTimestamp(),
        anulado: false,
    };
}

export async function addMovimiento(clienteId, datos) {
    const payload = buildMovPayload(datos);
    const ref = await addDoc(collection(firestoreDb, 'clientes', clienteId, 'movimientos'), payload);
    return { id: ref.id, ...payload };
}

// ─── V17 (F-TESORERÍA B5) · el ABONO pasa por el SERVIDOR ─────────────────────
// Un abono en EFECTIVO bajaba la deuda, pero el billete no entraba a NINGÚN libro de efectivo → el
// arqueo del turno no lo esperaba y un billete desaparecido "cuadraba" igual. La CF escribe, en la
// MISMA transacción, el abono y su pata en `turnos/{id}/movsCaja` — colección CF-only (`allow write:
// if false`), así que el navegador NO puede hacerlo: por eso el abono ya no usa `addMovimiento`.
// El resto de tipos (factura/apertura/ajuste) sigue por el camino de siempre.
// El transporte reusa el `_callable` de este módulo (definido abajo, import LAZY de
// firebase/functions: la ficha de la clienta solo paga ese peso al registrar el primer abono).

/**
 * opId de idempotencia. Se genera al ABRIR el formulario, NUNCA al enviarlo: si se generara al
 * enviar, un reintento tras un timeout crearía un abono GEMELO (la deuda bajaría dos veces).
 */
export function nuevoOpId() {
    try { if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID(); } catch { /* no-op */ }
    return `op-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Registra un abono (admin). Si `medioPago==='efectivo'` EXIGE turno de caja abierto y crea la pata
 * del billete en el arqueo; si falla algo, no queda ni abono ni pata (atomicidad).
 * @param {{opId:string, clienteId:string, monto:number, fecha:string, medioPago:string, descripcion?:string}} input
 */
export async function registrarAbonoCartera({ opId, clienteId, monto, fecha, medioPago, descripcion, cuentaId }) {
    const fn = await _callable('registrarAbonoCartera');
    // `cuentaId` se OMITE cuando no hay cuenta ("todavía no sé"), en vez de viajar como `undefined`:
    // así el payload no depende de cómo el SDK serialice un valor ausente.
    return (await fn({
        opId, clienteId, monto, fecha, medioPago, descripcion,
        ...(cuentaId ? { cuentaId } : {}),
    })).data;
}

/**
 * D9 · abonos por transferencia registrados con "todavía no sé": la lista que los cierra desde
 * "Cuadrar mes". Sin ella, la opción sería un agujero (plata fuera del libro del banco, para
 * siempre). Índice de GRUPO declarado en `firestore.indexes.json` (sinCuentaAsignada + fecha).
 */
export function onAbonosSinCuentaChange(cb, onErr) {
    return subscribeWithRetry(
        () => query(collectionGroup(firestoreDb, 'movimientos'),
            where('sinCuentaAsignada', '==', true), orderBy('fecha', 'desc'), limit(100)),
        (snap) => cb(snap.docs
            .filter((d) => d.data().anulado !== true)     // un abono anulado ya no hay que ubicarlo
            .map((d) => ({ id: d.id, clienteId: d.ref.parent.parent?.id || null, ...d.data() }))),
        'abonosSinCuenta', onErr);
}

/** D9 · asigna la cuenta a un abono "todavía no sé" y crea su pata en el banco (admin). */
export async function asignarCuentaAbono({ clienteId, movId, cuentaId }) {
    const fn = await _callable('asignarCuentaAbono');
    return (await fn({ clienteId, movId, cuentaId })).data;
}

/**
 * Anula un abono y NETEA su pata de caja en la misma tx (owner). Sin esto, el arqueo seguiría
 * pidiendo un billete que ya no existe. Si el turno de la pata ya cerró, el servidor rechaza.
 * @param {{clienteId:string, movId:string, motivo:string, motivoCategoria?:string}} input
 */
export async function anularAbonoCartera({ clienteId, movId, motivo, motivoCategoria }) {
    const fn = await _callable('anularAbonoCartera');
    return (await fn({ clienteId, movId, motivo, motivoCategoria })).data;
}

/**
 * Suscripción EN VIVO a TODOS los movimientos de todos los clientes (collectionGroup)
 * para calcular la mora/aging de la lista CxC (norte §10.2-F2: en vivo, sin materializar
 * `diasVencido` todavía). Mantiene saldo y vencido coherentes (no se desincronizan).
 * Cada item incluye su `clienteId` (del path del padre).
 *
 * IMPORTANTE: la query DEBE quedar SIN filtros (solo `limit`) → así NO requiere índice
 * compuesto (un índice faltante = FAILED_PRECONDITION = pantalla en blanco en prod, spec
 * §9.1). Añadir un `where`/`orderBy` aquí OBLIGA a declarar el índice en firestore.indexes.json.
 * Acotado por `limit(MAX)` (deuda de escala → paginación por cursor en F6); si se trunca,
 * avisa por consola (detector de truncado, doctrina S3).
 */
export function onAllMovimientosChange(cb) {
    const q = query(collectionGroup(firestoreDb, 'movimientos'), limit(MAX));
    return subscribeWithRetry(() => q, (snap) => {
        detectarTruncado('Movimientos (mora de la lista)', snap.size);
        cb(snap.docs.map((d) => ({ id: d.id, clienteId: d.ref.parent.parent?.id, ...d.data() })));
    }, 'Movimientos (mora de la lista)');
}

/**
 * Anula un movimiento (NO lo borra — anular ≠ eliminar, spec §3). Solo admin/owner
 * (reglas). Dispara el recálculo del saldo (el anulado deja de contar).
 */
export async function anularMovimiento(clienteId, movId, anuladoPor, motivo, motivoCategoria) {
    await updateDoc(doc(firestoreDb, 'clientes', clienteId, 'movimientos', movId), {
        anulado: true, anuladoPor, anuladoEn: serverTimestamp(),
        motivoAnulacion: (motivo || '').trim(),
        // M2a-1b (§73): la categoría hace auditable "por qué se anuló" (cierra el
        // tramo huérfano antes de que M3 la vuelva obligatoria). Solo se envía si viene.
        ...(motivoCategoria ? { motivoCategoria } : {}),
    });
}

// ─── Solicitudes de aprobación + gestiones de cobro (Fase M · M1 desplegado §72) ──
// Reglas: clientes/{id}/solicitudes y clientes/{id}/gestiones (firestore.rules).
// "El asiento nace al aprobarse": cuando una corrección excede el carril auto-aprobable
// (js/crm-correccion.js), Kary crea una SOLICITUD pendiente; el movimiento real lo crea
// Daniel al aprobar (M2b). Las gestiones son evidencia de cobro INMUTABLE (art. 146 ET).

/** Solicitudes de UN cliente, más nuevas primero (para la ficha). */
export function onSolicitudesChange(clienteId, cb) {
    const q = query(
        collection(firestoreDb, 'clientes', clienteId, 'solicitudes'),
        orderBy('creadoEn', 'desc'), limit(MAX),
    );
    return subscribeWithRetry(() => q, (snap) => {
        detectarTruncado('Solicitudes del cliente', snap.size);
        cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    }, 'Solicitudes del cliente');
}

/**
 * Crea una solicitud de aprobación (nace 'pendiente', sellada por el reloj del
 * SERVIDOR). Campos espejo EXACTO de solicitudValida() (firestore.rules): el `monto`
 * va como ENTERO (COP sin centavos); los opcionales solo se incluyen si vienen.
 * @param {object} s { tipo:'ajuste'|'correccion', monto, motivo, nota, solicitadoPor,
 *                     fecha?, correccionDe?, datosCorreccion?, saldoAlSolicitar? }
 */
export async function crearSolicitud(clienteId, s) {
    const payload = {
        tipo: s.tipo,
        monto: Math.round(Number(s.monto)),
        motivo: (s.motivo || '').trim(),
        nota: (s.nota || '').trim(),
        solicitadoPor: s.solicitadoPor,
        estado: 'pendiente',
        creadoEn: serverTimestamp(),
        ...(/^\d{4}-\d{2}-\d{2}$/.test(s.fecha || '') ? { fecha: s.fecha } : {}),
        ...(s.correccionDe ? { correccionDe: String(s.correccionDe) } : {}),
        ...(s.datosCorreccion && typeof s.datosCorreccion === 'object' ? { datosCorreccion: s.datosCorreccion } : {}),
        ...(Number.isInteger(s.saldoAlSolicitar) ? { saldoAlSolicitar: s.saldoAlSolicitar } : {}),
    };
    const ref = await addDoc(collection(firestoreDb, 'clientes', clienteId, 'solicitudes'), payload);
    return { id: ref.id, ...payload };
}

/** La SOLICITANTE cancela su propia solicitud pendiente (one-way; nadie cancela ajenas). */
export async function cancelarSolicitud(clienteId, solId, uid) {
    await updateDoc(doc(firestoreDb, 'clientes', clienteId, 'solicitudes', solId), {
        estado: 'cancelada', canceladoPor: uid, canceladoEn: serverTimestamp(),
    });
}

// ─── Aprobación de Daniel (Fase M · M2b) — la otra mitad del sistema de control ──
// La cola lee TODAS las pendientes cruzando clientas (collectionGroup, índice
// COLLECTION_GROUP estado ASC + creadoEn ASC en firestore.indexes.json — sin él,
// FAILED_PRECONDITION). La lógica de re-validación es PURA → js/crm-aprobacion.js.

/** Cola de solicitudes PENDIENTES de todas las clientas, más viejas primero
 *  (orden de atención). Cada item incluye su `clienteId` (del path del padre).
 *  `onError` es OBLIGATORIO de facto para la UI: un error de listen en Firestore
 *  es TERMINAL (el listener muere sin reintento) — sin callback, la cola del
 *  owner quedaría rota EN SILENCIO (p. ej. índice aún construyéndose). */
export function onSolicitudesPendientesChange(cb, onError) {
    const q = query(
        collectionGroup(firestoreDb, 'solicitudes'),
        where('estado', '==', 'pendiente'),
        orderBy('creadoEn', 'asc'), limit(MAX),
    );
    return subscribeWithRetry(() => q, (snap) => {
        detectarTruncado('Solicitudes pendientes (aprobación)', snap.size);
        cb(snap.docs.map((d) => ({ id: d.id, clienteId: d.ref.parent.parent?.id, ...d.data() })));
    }, 'Solicitudes pendientes (aprobación)', onError);
}

/** Movimientos de un cliente UNA VEZ (contexto de la tarjeta de aprobación:
 *  mora + últimos movimientos + saldo re-computado al render, PR2). */
export async function fetchMovimientos(clienteId) {
    const snap = await getDocs(query(
        collection(firestoreDb, 'clientes', clienteId, 'movimientos'),
        orderBy('registradoEn', 'desc'), limit(MAX),
    ));
    detectarTruncado('Movimientos (aprobación)', snap.size);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/** Re-lee UN movimiento este instante (la re-validación de M2b no confía en
 *  snapshots: el original se verifica VIGENTE justo antes de aprobar). */
export async function getMovimiento(clienteId, movId) {
    const snap = await getDoc(doc(firestoreDb, 'clientes', clienteId, 'movimientos', movId));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/** Daniel RECHAZA con motivo (one-way pendiente→rechazada; la regla exige el
 *  motivo). Kary ve el rechazo en la ficha y puede re-solicitar (M2a). */
export async function rechazarSolicitud(clienteId, solId, uid, motivoRechazo) {
    await updateDoc(doc(firestoreDb, 'clientes', clienteId, 'solicitudes', solId), {
        estado: 'rechazada', resueltoPor: uid, resueltoEn: serverTimestamp(),
        motivoRechazo: (motivoRechazo || '').trim(),
    });
}

/** Solicitudes RECHAZADAS recientes (ventana en días) de todas las clientas —
 *  insumo de la alerta "rechazada burlada" (M4). La query usa equality + rango
 *  sobre creadoEn ASC = servida por el MISMO índice COLLECTION_GROUP de M1
 *  (estado ASC, creadoEn ASC) — sin índice nuevo (spec §9.1). */
export function onSolicitudesRechazadasRecientes(dias, cb, onError) {
    const desde = new Date(Date.now() - dias * 864e5);
    const q = query(
        collectionGroup(firestoreDb, 'solicitudes'),
        where('estado', '==', 'rechazada'),
        where('creadoEn', '>=', desde),
        orderBy('creadoEn', 'asc'), limit(MAX),
    );
    return subscribeWithRetry(() => q, (snap) => {
        detectarTruncado('Solicitudes rechazadas (auditoría)', snap.size);
        cb(snap.docs.map((d) => ({ id: d.id, clienteId: d.ref.parent.parent?.id, ...d.data() })));
    }, 'Solicitudes rechazadas (auditoría)', onError);
}

// ─── Auditoría mensual (Fase M · M4): acta de conciliación + cortes ───────────

/** Acta del mes ('YYYY-MM') en vivo (null si no existe aún). `onError` obligatorio
 *  de facto: si el listener muere, la UI ofrecería CREAR un acta que ya existe. */
export function onActaChange(mes, cb, onError) {
    return subscribeWithRetry(() => doc(firestoreDb, 'conciliaciones', mes), (snap) => {
        cb(snap.exists() ? { id: snap.id, ...snap.data() } : null);
    }, 'Acta de conciliación', onError);
}

/** Crea el ACTA mensual (owner-only por reglas; one-way: jamás se edita).
 *  Campos espejo EXACTO de la regla de `conciliaciones/{mes}`. */
export async function crearActa(mes, { totalPorMedio, bancoCuadra, efectivoCuadra, diferencias, uid }) {
    await setDoc(doc(firestoreDb, 'conciliaciones', mes), {
        mes,
        totalPorMedio,
        bancoCuadra: bancoCuadra === true,
        efectivoCuadra: efectivoCuadra === true,
        diferencias: (diferencias || '').trim(),
        creadoPor: uid,
        creadoEn: serverTimestamp(),
    });
}

/** Último corte mensual generado por la CF (la foto inmutable más reciente). */
export function onUltimoCorteChange(cb, onError) {
    const q = query(collection(firestoreDb, 'cortes'), orderBy('mes', 'desc'), limit(1));
    return subscribeWithRetry(() => q, (snap) => {
        cb(snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() });
    }, 'Cortes mensuales', onError);
}

/**
 * Aprobación SIMPLE (solicitud de ajuste): DOS escrituras en UN writeBatch de
 * Daniel — crear el asiento (con `solicitudId`) + solicitud→aprobada. Las reglas
 * evalúan contra el estado PRE-batch ("estaba pendiente" vale por diseño, §69 C3).
 * @param {object} movimiento payload de js/crm-aprobacion.js (planAprobacionAjuste)
 */
export async function aprobarSolicitudAjuste(clienteId, solId, movimiento, uid) {
    const movRef = doc(collection(firestoreDb, 'clientes', clienteId, 'movimientos'));
    const batch = writeBatch(firestoreDb);
    batch.set(movRef, { ...movimiento, registradoPor: uid, registradoEn: serverTimestamp(), anulado: false });
    batch.update(doc(firestoreDb, 'clientes', clienteId, 'solicitudes', solId), {
        estado: 'aprobada', resueltoPor: uid, resueltoEn: serverTimestamp(),
    });
    await batch.commit();   // atómico: asiento y aprobación, o ninguno
    return { nuevoId: movRef.id };
}

/**
 * Aprobación de CORRECCIÓN (par anular+crear): TRES escrituras en UN writeBatch de
 * Daniel — anular el original + crear el reemplazo enlazado + solicitud→aprobada.
 * Garantía anti-doble-corrección: si el original ya fue anulado por otra vía,
 * `anulacionValida` (resource.anulado == false, pre-batch) revienta el batch ENTERO
 * (§69 C3) — el llamador trata ese fallo como "solicitud obsoleta".
 * @param {object} plan { anulacion, reemplazo } de planAprobacionCorreccion (re-validado)
 */
export async function aprobarSolicitudCorreccion(clienteId, solId, originalId, plan, uid) {
    const movsCol = collection(firestoreDb, 'clientes', clienteId, 'movimientos');
    const nuevoRef = doc(movsCol);   // id pre-generado para enlazar anulación ↔ reemplazo
    const batch = writeBatch(firestoreDb);
    batch.update(doc(movsCol, originalId), {
        anulado: true, anuladoPor: uid, anuladoEn: serverTimestamp(),
        motivoAnulacion: plan.anulacion.motivoAnulacion,
        motivoCategoria: plan.anulacion.motivoCategoria,
        corregidoPor: nuevoRef.id,
    });
    batch.set(nuevoRef, { ...plan.reemplazo, registradoPor: uid, registradoEn: serverTimestamp(), anulado: false });
    batch.update(doc(firestoreDb, 'clientes', clienteId, 'solicitudes', solId), {
        estado: 'aprobada', resueltoPor: uid, resueltoEn: serverTimestamp(),
    });
    await batch.commit();   // atómico: las 3 patas o ninguna
    return { nuevoId: nuevoRef.id };
}

/**
 * Registra una gestión de cobro (evidencia INMUTABLE — sin update/delete por reglas).
 * Campos espejo de gestionValida(): tipo y resultado de listas literales; `fecha`
 * ('YYYY-MM-DD') OBLIGATORIA; reloj del servidor.
 * @param {object} g { tipo, resultado, fecha, registradoPor, nota?, soporte? }
 */
export async function registrarGestion(clienteId, g) {
    const payload = {
        tipo: g.tipo,
        resultado: g.resultado,
        fecha: g.fecha,
        registradoPor: g.registradoPor,
        creadoEn: serverTimestamp(),
        ...(g.nota ? { nota: g.nota.trim() } : {}),
        ...(g.soporte ? { soporte: String(g.soporte) } : {}),
    };
    const ref = await addDoc(collection(firestoreDb, 'clientes', clienteId, 'gestiones'), payload);
    return { id: ref.id, ...payload };
}

/**
 * Gestiones de UN cliente EN VIVO (timeline de la ficha, M5). Orden por creadoEn
 * (índice automático de un solo campo); el orden VISIBLE por fecha del hecho lo
 * pone el helper puro `ordenarGestiones()` (js/crm-gestiones.js) — un
 * orderBy(fecha)+orderBy(creadoEn) exigiría índice compuesto (spec §9.1).
 * El conteo visible sale de esta MISMA lista (set completo de la clienta, ≤ MAX
 * con detector de truncado) — cero counts extra; el aggregate count() declarado
 * en C4 §69 queda para la lista CxC de M7 (pre-candidatas).
 * `onError` obligatorio de facto (L-40): sin él, un fallo del listen dejaría la
 * sección rota EN SILENCIO.
 */
export function onGestionesChange(clienteId, cb, onError) {
    const q = query(
        collection(firestoreDb, 'clientes', clienteId, 'gestiones'),
        orderBy('creadoEn', 'desc'), limit(MAX),
    );
    return subscribeWithRetry(() => q, (snap) => {
        detectarTruncado('Gestiones del cliente', snap.size);
        cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    }, 'Gestiones del cliente', onError);
}

// ─── Acuerdos de pago (spec 2026-06-12): el plan de cuotas pactado ────────────
// El acuerdo NO mueve dinero — re-programa la EXIGIBILIDAD (la fórmula del aging
// lo consume vía opts.acuerdos). Evidencia art. 146: create-only + cierre one-way;
// anular = SOLO owner (reglas). ⚠️ Las suscripciones se gatean en la UI por
// `config/cartera.acuerdosActivos` (las reglas del match se despliegan aparte).

/** Acuerdos de UN cliente EN VIVO (más nuevos primero). `onError` L-40. */
export function onAcuerdosChange(clienteId, cb, onError) {
    const q = query(
        collection(firestoreDb, 'clientes', clienteId, 'acuerdos'),
        orderBy('creadoEn', 'desc'), limit(MAX),
    );
    return subscribeWithRetry(() => q, (snap) => {
        detectarTruncado('Acuerdos del cliente', snap.size);
        cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    }, 'Acuerdos del cliente', onError);
}

/** TODOS los acuerdos de todas las clientas (vigilancia M4: las renegociaciones
 *  seriales y la cadena probatoria necesitan también los cerrados). Query sin
 *  filtros = sin índice compuesto (spec §9.1). */
export function onAllAcuerdosChange(cb, onError) {
    const q = query(collectionGroup(firestoreDb, 'acuerdos'), limit(MAX));
    return subscribeWithRetry(() => q, (snap) => {
        detectarTruncado('Acuerdos (vigilancia)', snap.size);
        cb(snap.docs.map((d) => ({ id: d.id, clienteId: d.ref.parent.parent?.id, ...d.data() })));
    }, 'Acuerdos (vigilancia)', onError);
}

/** Acuerdos VIGENTES de todas las clientas (lista CxC / agenda de cobro) —
 *  mismo índice CG (estado ASC, creadoEn ASC) declarado en firestore.indexes.json. */
export function onAllAcuerdosVigentesChange(cb, onError) {
    const q = query(
        collectionGroup(firestoreDb, 'acuerdos'),
        where('estado', '==', 'vigente'),
        orderBy('creadoEn', 'asc'), limit(MAX),
    );
    return subscribeWithRetry(() => q, (snap) => {
        detectarTruncado('Acuerdos vigentes (lista)', snap.size);
        cb(snap.docs.map((d) => ({ id: d.id, clienteId: d.ref.parent.parent?.id, ...d.data() })));
    }, 'Acuerdos vigentes (lista)', onError);
}

// Payload espejo EXACTO de acuerdoValido() v2 (firestore.rules): solo SALDO.
function buildAcuerdoPayload(a) {
    return {
        fechaPacto: a.fechaPacto,
        cuotas: a.cuotas.map((q) => ({ fecha: q.fecha, monto: Math.round(Number(q.monto)) })),
        ...(a.periodicidad ? { periodicidad: a.periodicidad } : {}),
        primeraCuotaFecha: a.cuotas[0].fecha,
        ultimaCuotaFecha: a.cuotas[a.cuotas.length - 1].fecha,
        ...(Number.isInteger(a.saldoAlPactar) ? { saldoAlPactar: a.saldoAlPactar } : {}),
        nota: String(a.nota || '').trim(),
        estado: 'vigente',
        ...(a.reemplazaA ? { reemplazaA: String(a.reemplazaA) } : {}),
        creadoPor: a.creadoPor,
        creadoEn: serverTimestamp(),
        rolAlCrear: a.rolAlCrear,
    };
}

/**
 * Pacta un acuerdo de pago (MUTEX v2, Consejo Externo). UN writeBatch atómico:
 *  - (opcional) crea la factura nueva (caso "factura en cuotas"; su `vencimiento`
 *    = la última cuota, para toda vista sin acuerdos);
 *  - crea el acuerdo (vigente; `reemplazaA` si renegocia);
 *  - si había un vigente, lo sella 'reemplazado';
 *  - mueve el puntero `acuerdoVigenteId` del cliente al nuevo.
 * Las reglas (getAfter sobre el puntero) hacen IMPOSIBLE el acuerdo SUELTO (el
 * vector de jineteo que cerró el Consejo).
 * @param {string} clienteId
 * @param {object} a  { cuotas, fechaPacto, periodicidad?, saldoAlPactar?, nota, creadoPor, rolAlCrear }
 * @param {object} [opts] { vigenteId?:string — el acuerdo vigente a reemplazar; factura?:object }
 * @returns {Promise<{acuerdoId:string, movId:(string|null)}>}
 */
export async function pactarAcuerdo(clienteId, a, { vigenteId, factura } = {}) {
    const acRef = doc(collection(firestoreDb, 'clientes', clienteId, 'acuerdos'));
    const batch = writeBatch(firestoreDb);
    let movId = null;
    if (factura) {
        const movRef = doc(collection(firestoreDb, 'clientes', clienteId, 'movimientos'));
        const ultima = a.cuotas[a.cuotas.length - 1].fecha;
        batch.set(movRef, buildMovPayload({ ...factura, vencimiento: ultima }));
        movId = movRef.id;
    }
    batch.set(acRef, buildAcuerdoPayload({ ...a, ...(vigenteId ? { reemplazaA: vigenteId } : {}) }));
    if (vigenteId) {
        batch.update(doc(firestoreDb, 'clientes', clienteId, 'acuerdos', vigenteId), {
            estado: 'reemplazado', cerradoPor: a.creadoPor, cerradoEn: serverTimestamp(), reemplazadoPor: acRef.id,
        });
    }
    batch.update(doc(firestoreDb, 'clientes', clienteId), { acuerdoVigenteId: acRef.id });
    await batch.commit();   // atómico: factura + acuerdo + sello + puntero, o nada
    return { acuerdoId: acRef.id, movId };
}

/** Anula el acuerdo vigente (OWNER por reglas): sella 'anulado' + limpia el
 *  puntero del cliente. "Cancelar" es la goma de borrar del cronograma → solo Daniel. */
export async function anularAcuerdo(clienteId, vigenteId, motivoCierre, uid) {
    const batch = writeBatch(firestoreDb);
    batch.update(doc(firestoreDb, 'clientes', clienteId, 'acuerdos', vigenteId), {
        estado: 'anulado', cerradoPor: uid, cerradoEn: serverTimestamp(),
        motivoCierre: String(motivoCierre || '').trim(),
    });
    batch.update(doc(firestoreDb, 'clientes', clienteId), { acuerdoVigenteId: deleteField() });
    await batch.commit();
}

/**
 * Corrige un movimiento como PAR ATÓMICO en un writeBatch (anular el original + crear
 * el reemplazo enlazado) — el camino auto-aprobable (admin). Cuando la corrección excede
 * el carril (ver js/crm-correccion.js), el llamador usa `crearSolicitud` en su lugar; este
 * batch NO se invoca. Requiere anulacionValida ensanchada (M2a-1b §73: motivoCategoria +
 * corregidoPor). El reemplazo lleva `correccionDe` (movimientoValido lo admite — sin hasOnly
 * hasta M3) y, por defecto, el MISMO tipo y fecha del original; en corrección de FECHA se
 * pasa `reemplazo.fecha` nueva y motivoCategoria='CORRECCION_FECHA'.
 * @returns {{nuevoId:string}}
 */
export async function corregirMovimientoBatch(clienteId, { original, reemplazo, motivoCategoria, motivoAnulacion, uid }) {
    const movsCol = collection(firestoreDb, 'clientes', clienteId, 'movimientos');
    const nuevoRef = doc(movsCol);   // id pre-generado para enlazar la anulación con el reemplazo
    const FE = /^\d{4}-\d{2}-\d{2}$/;
    const fechaReemplazo = FE.test(reemplazo.fecha || '') ? reemplazo.fecha
        : (FE.test(original.fecha || '') ? original.fecha : null);

    const batch = writeBatch(firestoreDb);
    // (1) anular el original, enlazado al reemplazo (motivoCategoria + corregidoPor).
    batch.update(doc(movsCol, original.id), {
        anulado: true,
        anuladoPor: uid,
        anuladoEn: serverTimestamp(),
        motivoAnulacion: (motivoAnulacion || '').trim(),
        motivoCategoria,
        corregidoPor: nuevoRef.id,
    });
    // (2) crear el reemplazo (MISMO tipo; monto entero; correccionDe → el original).
    batch.set(nuevoRef, {
        tipo: original.tipo,
        monto: Math.round(Number(reemplazo.monto)),
        ...(fechaReemplazo ? { fecha: fechaReemplazo } : {}),
        ...(reemplazo.descripcion ? { descripcion: reemplazo.descripcion.trim() } : {}),
        // Abono: medioPago obligatorio en la regla M3 (heredado/fallback, red-team M3).
        ...(original.tipo === 'abono' ? { medioPago: reemplazo.medioPago || original.medioPago || 'otro' } : {}),
        // Factura: el acuerdo viaja en el PLAN (planearCorreccionMovimiento decide la
        // herencia condicional — UNA sola fuente, L-03); aquí solo se valida formato.
        ...(original.tipo === 'factura' && FE.test(reemplazo.vencimiento || '')
            ? { vencimiento: reemplazo.vencimiento } : {}),
        correccionDe: original.id,
        registradoPor: uid,
        registradoEn: serverTimestamp(),
        anulado: false,
    });
    await batch.commit();   // atómico: o se aplican ambas patas, o ninguna
    return { nuevoId: nuevoRef.id };
}

// ─── Vendedoras (entidad de datos; las gestiona Kary) ─────────────────────────
export function onVendedorasChange(cb) {
    const q = query(collection(firestoreDb, 'vendedoras'), limit(MAX));
    return subscribeWithRetry(() => q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))), 'Vendedoras');
}
export async function fetchVendedoras() {
    const snap = await getDocs(query(collection(firestoreDb, 'vendedoras'), limit(MAX)));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
export async function createVendedora({ nombre, createdBy }) {
    const payload = {
        nombre: (nombre || '').trim(),
        activa: true,
        createdAt: serverTimestamp(),
        ...(createdBy ? { createdBy } : {}),
    };
    const ref = await addDoc(collection(firestoreDb, 'vendedoras'), payload);
    return { id: ref.id, ...payload };
}
export async function updateVendedora(id, patch) {
    await updateDoc(doc(firestoreDb, 'vendedoras', id), { ...patch, updatedAt: serverTimestamp() });
}

// ─── Pendientes de configuración (tablero para Kary) ──────────────────────────
export function onPendientesChange(cb) {
    const q = query(collection(firestoreDb, 'pendientes'), limit(MAX));
    return subscribeWithRetry(() => q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))), 'Pendientes');
}
export async function addPendiente({ titulo, detalle, categoria }) {
    const payload = {
        titulo: (titulo || '').trim(),
        detalle: (detalle || '').trim(),
        categoria: categoria || 'definir-kary',
        estado: 'pendiente',
        createdAt: serverTimestamp(),
    };
    const ref = await addDoc(collection(firestoreDb, 'pendientes'), payload);
    return { id: ref.id, ...payload };
}
export async function setPendienteEstado(id, estado) {
    await updateDoc(doc(firestoreDb, 'pendientes', id), { estado });
}
export async function deletePendiente(id) {
    await deleteDoc(doc(firestoreDb, 'pendientes', id));
}

// ─── Config del negocio ───────────────────────────────────────────────────────
export async function getConfig(docId) {
    const snap = await getDoc(doc(firestoreDb, 'config', docId));
    return snap.exists() ? snap.data() : null;
}

export async function setConfig(docId, data) {
    await setDoc(doc(firestoreDb, 'config', docId), data, { merge: true });
}

// ─── Cálculos de cartera (desde los saldos desnormalizados) ───────────────────
/**
 * Totales de cartera a partir de la lista de clientes. Suma solo saldos POSITIVOS
 * (lo que el negocio espera cobrar); separa el saldo a favor (negativos).
 */
export function carteraTotals(clientes) {
    let porCobrar = 0, aFavor = 0;
    for (const c of clientes) {
        const s = typeof c.saldoActual === 'number' ? c.saldoActual : 0;
        if (s > 0) porCobrar += s; else aFavor += s;
    }
    return { porCobrar, aFavor, neto: porCobrar + aFavor, clientes: clientes.length };
}

/**
 * Clientes que cumplen años en el mes dado (0-11). `cumpleanos` se guarda como
 * 'YYYY-MM-DD' (input date). Devuelve ordenados por día, con el día extraído.
 */
export function cumpleanosDelMes(clientes, mes) {
    const out = [];
    for (const c of clientes) {
        if (!c.cumpleanos) continue;
        const m = parseInt(String(c.cumpleanos).slice(5, 7), 10);   // mes 1-12
        if (m !== mes + 1) continue;
        const dia = parseInt(String(c.cumpleanos).slice(8, 10), 10) || 0;
        out.push({ ...c, _dia: dia });
    }
    return out.sort((a, b) => a._dia - b._dia);
}

// ─── Parámetros de gobierno (M0-C §70) — panel owner-only `admin-parametros.html` ──
// `config/cartera`: límites de la política de cartera v1. Las REGLAS solo dejan
// escribir al owner (Daniel); el admin lee (la UI de Kary necesita los límites).

export function onConfigCarteraChange(cb) {
    return subscribeWithRetry(() => doc(firestoreDb, 'config', 'cartera'), (snap) => {
        cb(snap.exists() ? snap.data() : null);
    }, 'Config cartera');
}

/** Guarda parámetros (merge). La frontera real es la regla owner-only. */
export async function updateConfigCartera(parcial, actorEmail) {
    await setDoc(doc(firestoreDb, 'config', 'cartera'), {
        ...parcial,
        actualizadoEn: serverTimestamp(),
        actualizadoPor: actorEmail || 'owner',
    }, { merge: true });
}

// ─── Salud del sistema (F6 frente D) — vista owner-only `admin-salud.html` ────
// `salud/*` y `saludEventos/*` los escriben SOLO las Cloud Functions; aquí solo
// se leen (+ marcar un evento como resuelto, whitelist en firestore.rules).

/** Suscripción a los singletons de salud → cb({ backup, reconciliacion }). */
export function onSaludChange(cb) {
    return subscribeWithRetry(() => collection(firestoreDb, 'salud'), (snap) => {
        const out = {};
        snap.docs.forEach((d) => { out[d.id] = d.data(); });
        cb(out);
    }, 'Salud');
}

/** Eventos de fallo (recalc-saldo-error…), más recientes primero. orderBy de UN
 *  solo campo = índice automático (NO compuesto, spec §9.1: solo where+orderBy
 *  combinados lo exigirían). Sin él, un truncado en MAX dejaría fuera justo los
 *  más nuevos. Sort en cliente se mantiene como defensa (timestamps pendientes). */
export function onSaludEventosChange(cb) {
    const q = query(collection(firestoreDb, 'saludEventos'), orderBy('at', 'desc'), limit(MAX));
    return subscribeWithRetry(() => q, (snap) => {
        detectarTruncado('Registro de fallos (Salud)', snap.size);
        const eventos = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        eventos.sort((a, b) => (b.at?.toMillis?.() || 0) - (a.at?.toMillis?.() || 0));
        cb(eventos);
    }, 'Registro de fallos (Salud)');
}

export async function marcarEventoResuelto(id, uid) {
    await updateDoc(doc(firestoreDb, 'saludEventos', id), {
        resuelto: true, resueltoEn: serverTimestamp(), resueltoPor: uid,
    });
}

// Callables (primera vez que el cliente llama Cloud Functions): import LAZY de
// firebase/functions — solo la página Salud paga ese peso de bundle.
async function _callable(name) {
    const { getFunctions, httpsCallable } = await import('firebase/functions');
    return httpsCallable(getFunctions(app, 'us-central1'), name);
}

/** Corre la reconciliación completa bajo demanda. → { ok, totalClientes, totalDescuadres } */
export async function reconciliarAhora() {
    const fn = await _callable('reconciliarCartera');
    return (await fn()).data;
}

/** Recomputa el saldo de UN cliente (misma transacción que el trigger). */
export async function repararSaldoCliente(clienteId) {
    const fn = await _callable('repararSaldo');
    return (await fn({ clienteId })).data;
}

/** Cartera por vendedora: Map<vendedoraId|'__kary__', {porCobrar, clientes}>. */
export function carteraPorVendedora(clientes) {
    const map = new Map();
    for (const c of clientes) {
        const key = c.vendedoraId || '__kary__';
        const cur = map.get(key) || { porCobrar: 0, clientes: 0 };
        const s = typeof c.saldoActual === 'number' ? c.saldoActual : 0;
        cur.porCobrar += s > 0 ? s : 0;
        cur.clientes += 1;
        map.set(key, cur);
    }
    return map;
}
