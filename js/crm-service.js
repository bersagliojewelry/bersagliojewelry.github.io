/**
 * Bersaglio CRM — Servicio Firestore del módulo de cuentas por cobrar (fiado).
 *
 * MÓDULO DESACOPLADO del catálogo público (`firestore-service.js`): el CRM es un
 * límite de módulo propio (charter `docs/50-ARQUITECTURA.md §3`). Lo consumen las
 * pantallas admin del CRM (Panel de Kary) y, más adelante, la app de vendedora.
 *
 * Colecciones (reglas en `firestore.rules`, ADR §42):
 *   clientes/{id}                      — saldoActual lo escribe SOLO la Cloud Function.
 *   clientes/{id}/movimientos/{movId}  — append-only para vendedora (factura/abono).
 *   solicitudesCorreccion/{id}         — vendedora crea pendiente; admin aprueba.
 *   config/{docId}                     — parámetros del negocio (write admin).
 */

import { firestoreDb } from './firebase-config.js';
import {
    collection, doc, getDocs, getDoc, addDoc, setDoc, updateDoc,
    query, where, orderBy, limit, onSnapshot, serverTimestamp,
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
        ...(data.vendedoraUid ? { vendedoraUid: data.vendedoraUid } : {}),
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
 */
export async function addMovimiento(clienteId, { tipo, monto, descripcion, registradoPor }) {
    const payload = {
        tipo,
        monto: Number(monto),
        ...(descripcion ? { descripcion: descripcion.trim() } : {}),
        registradoPor,
        registradoEn: serverTimestamp(),
        anulado: false,
    };
    const ref = await addDoc(collection(firestoreDb, 'clientes', clienteId, 'movimientos'), payload);
    return { id: ref.id, ...payload };
}

/**
 * Anula un movimiento (NO lo borra — anular ≠ eliminar, spec §3). Solo admin/owner
 * (reglas). Dispara el recálculo del saldo (el anulado deja de contar).
 */
export async function anularMovimiento(clienteId, movId, anuladoPor) {
    await updateDoc(doc(firestoreDb, 'clientes', clienteId, 'movimientos', movId), {
        anulado: true, anuladoPor, anuladoEn: serverTimestamp(),
    });
}

// ─── Solicitudes de corrección (bandeja de Kary) ──────────────────────────────
export function onSolicitudesChange(cb) {
    const q = query(collection(firestoreDb, 'solicitudesCorreccion'), limit(MAX));
    return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
}

export async function resolverSolicitud(id, estado, autorizadoPor) {
    await updateDoc(doc(firestoreDb, 'solicitudesCorreccion', id), {
        estado, autorizadoPor, autorizadoEn: serverTimestamp(),
    });
}

// ─── Vendedoras (usuarios con rol vendedora) ──────────────────────────────────
export async function fetchVendedoras() {
    const q = query(collection(firestoreDb, 'users'), where('role', '==', 'vendedora'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ uid: d.id, ...d.data() }));
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

/** Cartera por vendedora: Map<vendedoraUid|null, {porCobrar, clientes}>. */
export function carteraPorVendedora(clientes) {
    const map = new Map();
    for (const c of clientes) {
        const key = c.vendedoraUid || '__kary__';
        const cur = map.get(key) || { porCobrar: 0, clientes: 0 };
        const s = typeof c.saldoActual === 'number' ? c.saldoActual : 0;
        cur.porCobrar += s > 0 ? s : 0;
        cur.clientes += 1;
        map.set(key, cur);
    }
    return map;
}
