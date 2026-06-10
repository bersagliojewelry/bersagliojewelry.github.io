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
    writeBatch, query, orderBy, limit, onSnapshot, serverTimestamp,
} from 'firebase/firestore';

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
    return onSnapshot(q, (snap) => {
        detectarTruncado('Clientes', snap.size);
        cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
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
    return onSnapshot(doc(firestoreDb, 'clientes', id), (snap) => {
        cb(snap.exists() ? { id: snap.id, ...snap.data() } : null);
    });
}

// ─── Movimientos (cuenta corriente de un cliente) ─────────────────────────────
export function onMovimientosChange(clienteId, cb) {
    const q = query(
        collection(firestoreDb, 'clientes', clienteId, 'movimientos'),
        orderBy('registradoEn', 'desc'), limit(MAX),
    );
    return onSnapshot(q, (snap) => {
        detectarTruncado('Historial del cliente', snap.size);
        cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
}

/**
 * Registra un movimiento (factura/abono/apertura/ajuste). El saldo del cliente lo
 * recalcula la Cloud Function `recalcSaldoCliente` (ADR §43) — aquí no se toca.
 *
 * `fecha` ('YYYY-MM-DD') = fecha REAL del hecho que elige Kary (base de la mora,
 * ADR §51). Es inmutable tras crearse (las reglas solo permiten anular). Si no se
 * envía, el movimiento queda sin fecha → la mora cae al fallback `fechaCorteMigracion`.
 */
export async function addMovimiento(clienteId, { tipo, monto, descripcion, registradoPor, fecha, medioPago }) {
    const payload = {
        tipo,
        monto: Number(monto),
        ...(descripcion ? { descripcion: descripcion.trim() } : {}),
        ...(/^\d{4}-\d{2}-\d{2}$/.test(fecha || '') ? { fecha } : {}),
        // medioPago: M2a lo escribe en abonos (lista literal); M3 lo hará obligatorio
        // en la regla. `movimientoValido` lo admite hoy (sin hasOnly hasta M3).
        ...(medioPago ? { medioPago } : {}),
        registradoPor,
        registradoEn: serverTimestamp(),
        anulado: false,
    };
    const ref = await addDoc(collection(firestoreDb, 'clientes', clienteId, 'movimientos'), payload);
    return { id: ref.id, ...payload };
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
    return onSnapshot(q, (snap) => {
        detectarTruncado('Movimientos (mora de la lista)', snap.size);
        cb(snap.docs.map((d) => ({ id: d.id, clienteId: d.ref.parent.parent?.id, ...d.data() })));
    });
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
    return onSnapshot(q, (snap) => {
        detectarTruncado('Solicitudes del cliente', snap.size);
        cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
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
    return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
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
    return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
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
    return onSnapshot(doc(firestoreDb, 'config', 'cartera'), (snap) => {
        cb(snap.exists() ? snap.data() : null);
    });
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
    return onSnapshot(collection(firestoreDb, 'salud'), (snap) => {
        const out = {};
        snap.docs.forEach((d) => { out[d.id] = d.data(); });
        cb(out);
    });
}

/** Eventos de fallo (recalc-saldo-error…), más recientes primero. orderBy de UN
 *  solo campo = índice automático (NO compuesto, spec §9.1: solo where+orderBy
 *  combinados lo exigirían). Sin él, un truncado en MAX dejaría fuera justo los
 *  más nuevos. Sort en cliente se mantiene como defensa (timestamps pendientes). */
export function onSaludEventosChange(cb) {
    const q = query(collection(firestoreDb, 'saludEventos'), orderBy('at', 'desc'), limit(MAX));
    return onSnapshot(q, (snap) => {
        detectarTruncado('Registro de fallos (Salud)', snap.size);
        const eventos = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        eventos.sort((a, b) => (b.at?.toMillis?.() || 0) - (a.at?.toMillis?.() || 0));
        cb(eventos);
    });
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
