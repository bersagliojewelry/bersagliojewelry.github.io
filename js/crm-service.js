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
    query, orderBy, limit, onSnapshot, serverTimestamp,
} from 'firebase/firestore';

// Tope de seguridad para listeners (doctrina S3). La cartera de fiado es acotada;
// si se llegara a este límite, hay que paginar (ver docs/41-SEGURIDAD §S3).
const MAX = 2000;

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
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export function onClientesChange(cb) {
    const q = query(collection(firestoreDb, 'clientes'), limit(MAX));
    return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
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
    return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
}

/**
 * Registra un movimiento (factura/abono/apertura/ajuste). El saldo del cliente lo
 * recalcula la Cloud Function `recalcSaldoCliente` (ADR §43) — aquí no se toca.
 *
 * `fecha` ('YYYY-MM-DD') = fecha REAL del hecho que elige Kary (base de la mora,
 * ADR §51). Es inmutable tras crearse (las reglas solo permiten anular). Si no se
 * envía, el movimiento queda sin fecha → la mora cae al fallback `fechaCorteMigracion`.
 */
export async function addMovimiento(clienteId, { tipo, monto, descripcion, registradoPor, fecha }) {
    const payload = {
        tipo,
        monto: Number(monto),
        ...(descripcion ? { descripcion: descripcion.trim() } : {}),
        ...(/^\d{4}-\d{2}-\d{2}$/.test(fecha || '') ? { fecha } : {}),
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
        if (snap.size >= MAX) {
            console.warn(`[crm] onAllMovimientosChange truncado en ${MAX} (S3): la mora de la lista puede quedar incompleta → paginar por cursor (F6, spec §9.1).`);
        }
        cb(snap.docs.map((d) => ({ id: d.id, clienteId: d.ref.parent.parent?.id, ...d.data() })));
    });
}

/**
 * Anula un movimiento (NO lo borra — anular ≠ eliminar, spec §3). Solo admin/owner
 * (reglas). Dispara el recálculo del saldo (el anulado deja de contar).
 */
export async function anularMovimiento(clienteId, movId, anuladoPor, motivo) {
    await updateDoc(doc(firestoreDb, 'clientes', clienteId, 'movimientos', movId), {
        anulado: true, anuladoPor, anuladoEn: serverTimestamp(),
        motivoAnulacion: (motivo || '').trim(),
    });
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
        if (snap.size >= MAX) {
            console.warn(`[crm] onSaludEventosChange truncado en ${MAX} (S3): hay más eventos de salud de los que muestra el panel → purga/paginación pendiente.`);
        }
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
