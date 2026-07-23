/**
 * tesoreria-service.js — cliente de F-TESORERÍA (B2 · TODO-78). SSoT: spec 2026-07-18 §2/§3.
 *
 * El navegador manda INSUMOS + un `opId` (idempotencia); las Cloud Functions (Admin SDK) validan
 * rol, gatean y recomputan el saldo server-side (D2/D5). Aquí SOLO transporte (callables) + lectura
 * en vivo (listeners) — cero lógica de dinero (§3.6). El rol lo valida la CF: admin registra/traslada,
 * owner aprueba. La fórmula del saldo NO vive aquí: el número lo materializa el trigger (cuentasTesoreria
 * .saldoActual) y lo espeja `js/admin/tesoreria-format.js` (paridad inv.2).
 */
import { app, firestoreDb } from './firebase-config.js';
import { collection, query, orderBy, where, limit } from 'firebase/firestore';
import { subscribeWithRetry } from './core/live-query.js';

// Callable lazy (no cargamos firebase/functions hasta la 1ª acción — patrón pedidos-service).
async function _callable(name) {
    const { getFunctions, httpsCallable } = await import('firebase/functions');
    return httpsCallable(getFunctions(app, 'us-central1'), name);
}

// ─── Escrituras (callables; lógica en functions/tesoreria-core.js) ────────────────────────────

/** Crea una cuenta REAL (banco/nequi). admin. @param {{opId,nombre,banco?,tipo,titular,esDeSocia?,saldoInicial,fechaCorte,soporteCorteURL?}} input */
export async function crearCuentaTesoreria(input) {
    const fn = await _callable('crearCuentaTesoreria');
    return (await fn(input)).data;
}
/** Registra un movimiento en el ledger (única puerta manual, D2). admin. @param {{opId,cuentaId,tipo,monto,fecha,descripcion?,soporteURL?,contraparte?,categoria?,direccion?,refDocumento?}} input */
export async function registrarMovimientoTesoreria(input) {
    const fn = await _callable('registrarMovimientoTesoreria');
    return (await fn(input)).data;
}
/** Traslado entre cuentas reales = par atómico (D3). admin. @param {{opId,origenId,destinoId,monto,fecha,descripcion?}} input */
export async function trasladarEntreCuentas(input) {
    const fn = await _callable('trasladarEntreCuentas');
    return (await fn(input)).data;
}
/** Aprueba/rechaza un movimiento pendiente (retiro/ajuste de socia). SOLO owner (D4). @param {{opId,decision,motivo?}} input */
export async function aprobarMovimientoTesoreria(input) {
    const fn = await _callable('aprobarMovimientoTesoreria');
    return (await fn(input)).data;
}
/** Sella el cuadre mensual de una cuenta (B3). admin. @param {{cuentaId,periodo,opIds}} input */
export async function marcarConciliado(input) {
    const fn = await _callable('marcarConciliado');
    return (await fn(input)).data;
}
/** Fuerza el recompute del saldo de una cuenta (reparación §64). admin. @param {{cuentaId}} input */
export async function repararSaldoTesoreria(input) {
    const fn = await _callable('repararSaldoTesoreria');
    return (await fn(input)).data;
}

// ─── Lecturas en vivo (listeners; read admin/owner por reglas) ────────────────────────────────
// subscribeWithRetry (§93): Firestore corta el stream ante un error transitorio y no reintenta solo;
// el helper re-suscribe con backoff y llama onErr en cada fallo (la vista pinta un aviso mientras).

/** Todas las cuentas (reales + las 2 virtuales). read admin/owner. Más recientes/estables primero por nombre en la vista. */
export function onCuentasTesoreriaChange(cb, onErr) {
    return subscribeWithRetry(
        () => query(collection(firestoreDb, 'cuentasTesoreria')),
        snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
        'cuentasTesoreria', onErr);
}
/** Movimientos de UNA cuenta, más reciente primero (índice cuentaId,fecha desc). read admin/owner. */
export function onMovsCuentaChange(cuentaId, cb, max = 200, onErr) {
    return subscribeWithRetry(
        () => query(collection(firestoreDb, 'movimientosTesoreria'),
            where('cuentaId', '==', cuentaId), orderBy('fecha', 'desc'), limit(max)),
        snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
        'movsTesoreria', onErr);
}

export default {
    crearCuentaTesoreria, registrarMovimientoTesoreria, trasladarEntreCuentas,
    aprobarMovimientoTesoreria, marcarConciliado, repararSaldoTesoreria,
    onCuentasTesoreriaChange, onMovsCuentaChange,
};
