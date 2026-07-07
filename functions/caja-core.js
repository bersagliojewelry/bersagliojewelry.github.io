/**
 * Núcleo de la SESIÓN DE CAJA (F2.0 B1) — lógica PURA de negocio (solo firebase-admin, sin auth ni
 * firebase-functions) → testeable end-to-end contra el emulador. Los wrappers onCall (auth/rol) van
 * en pedidos.js (B5). SSoT del diseño: docs/superpowers/specs/2026-07-06-f2-0-caja-boveda-DISENO.md
 * (§Bloque B1 · §8.1). Escritor único = la CF (Admin SDK) → reglas cliente = write:false (B0b).
 *
 * Invariantes de dinero garantizados aquí:
 *  #4 PUNTERO SINGLETON — `abrir/cerrarTurno` leen+escriben `caja/estado {turnoAbiertoId}` en la MISMA
 *     runTransaction: imposible tener dos turnos abiertos (dos aperturas concurrentes → 1 gana, la otra
 *     re-lee el puntero y falla `failed-precondition`). O(1), sin query `where estado==abierto` (TOCTOU).
 *  #2 IDEMPOTENCIA por opId — `opId == turnoId` (create-if-not-exists): un reintento/doble-tap del MISMO
 *     opId devuelve el mismo turno (no-op), nunca dos. El doble-CIERRE es idempotente por `estado=='cerrado'`.
 *  #7 ECUACIÓN DE CIERRE COMPLETA — el efectivo esperado del cajón =
 *     fondoApertura + ventas_efectivo + ingresos − egresos + boveda_a_cajon − cajon_a_boveda.
 *     Pertenencia por `turnoId` (NO ventana temporal, invariante #6); estado del pedido filtrado en JS
 *     (sin índice compuesto). B1 = turnos SIN ventas (ventas_efectivo entra en B2 vía crearPedido).
 */
const { FieldValue } = require('firebase-admin/firestore');
const { entero, PedidoError, MEDIOS, ESTADOS_CON_DINERO } = require('./pedidos-core.js');

const ESTADO_REF = 'caja/estado';

/**
 * Abre un turno de caja. Idempotente por `opId` (= id del turno). Rechaza si ya hay uno abierto.
 * @param db Firestore (admin). @param input { opId, fondoApertura, autor }
 * @returns { turnoId, estado, fondoApertura, yaExistia }
 */
async function abrirTurnoCore(db, input = {}) {
    const opId = String(input.opId || '').trim();          // idempotencia: opId = turnoId (create-if-not-exists)
    const autor = input.autor || null;
    const fondoApertura = entero(input.fondoApertura);
    if (!opId) throw new PedidoError('invalid-argument', 'opId es obligatorio.');

    return db.runTransaction(async (tx) => {
        const turnoRef  = db.doc(`turnos/${opId}`);
        const estadoRef = db.doc(ESTADO_REF);
        // Todas las lecturas ANTES de escribir (regla de las transacciones Firestore).
        const [turnoSnap, estadoSnap] = await Promise.all([tx.get(turnoRef), tx.get(estadoRef)]);

        if (turnoSnap.exists) {                            // IDEMPOTENTE: reintento del MISMO opId → mismo turno
            const t = turnoSnap.data();
            return { turnoId: opId, estado: t.estado, fondoApertura: t.fondoApertura, yaExistia: true };
        }
        const abiertoId = estadoSnap.exists ? (estadoSnap.data().turnoAbiertoId || null) : null;
        if (abiertoId) throw new PedidoError('failed-precondition', 'Ya hay una caja abierta. Ciérrala antes de abrir otra.');

        tx.set(turnoRef, {
            estado: 'abierto',
            fondoApertura,
            aperturaPor: autor,
            aperturaTs: FieldValue.serverTimestamp(),
        });
        // El puntero apunta a este turno + resetea la cota (§9.2): docsDelTurno arranca en 0.
        tx.set(estadoRef, { turnoAbiertoId: opId, docsDelTurno: 0 }, { merge: true });
        return { turnoId: opId, estado: 'abierto', fondoApertura, yaExistia: false };
    });
}

/**
 * Cierra un turno: recomputa el esperado por medio (ecuación #7) SÍNCRONO en la tx, sella el turno
 * INMUTABLE y libera el puntero. Idempotente: un turno ya cerrado devuelve su sello (no re-computa).
 * @param db Firestore (admin). @param input { turnoId, conteoPorMedio, autor }
 * @returns { turnoId, esperadoPorMedio, esperadoEfectivo, declaradoEfectivo, descuadre, yaExistia }
 */
async function cerrarTurnoCore(db, input = {}) {
    const turnoId = String(input.turnoId || '').trim();
    const autor = input.autor || null;
    const conteo = (input.conteoPorMedio && typeof input.conteoPorMedio === 'object') ? input.conteoPorMedio : {};
    if (!turnoId) throw new PedidoError('invalid-argument', 'turnoId es obligatorio.');

    return db.runTransaction(async (tx) => {
        const turnoRef = db.doc(`turnos/${turnoId}`);
        const turnoSnap = await tx.get(turnoRef);
        if (!turnoSnap.exists) throw new PedidoError('not-found', 'El turno no existe.');
        const turno = turnoSnap.data();
        if (turno.estado === 'cerrado') {                  // IDEMPOTENTE: doble cierre → devuelve el sello (no re-computa)
            return {
                turnoId, esperadoPorMedio: turno.esperadoPorMedio, esperadoEfectivo: turno.esperadoEfectivo,
                declaradoEfectivo: turno.declaradoEfectivo, descuadre: turno.descuadre, yaExistia: true,
            };
        }

        // Lecturas (todas antes de escribir): puntero + movimientos del turno + traslados + ventas por turnoId.
        const estadoRef = db.doc(ESTADO_REF);
        const [estadoSnap, movsSnap, trasSnap, ventasSnap] = await Promise.all([
            tx.get(estadoRef),
            tx.get(db.collection(`turnos/${turnoId}/movsCaja`)),
            tx.get(db.collection('bovedaMovimientos').where('turnoId', '==', turnoId)),
            tx.get(db.collection('pedidos').where('turnoId', '==', turnoId)),   // B1: vacío; B2 lo puebla crearPedido
        ]);

        // Ventas por medio (pertenencia por turnoId #6; filtro de estado en JS → sin índice compuesto, §8.3).
        const ventasPorMedio = Object.fromEntries(MEDIOS.map((m) => [m, 0]));
        ventasSnap.forEach((d) => {
            const p = d.data();
            if (ventasPorMedio[p.medio] != null && ESTADOS_CON_DINERO.has(p.estado)) ventasPorMedio[p.medio] += entero(p.total);
        });

        // Ingresos/egresos manuales del turno (los anulados NO cuentan).
        let ingresos = 0, egresos = 0;
        movsSnap.forEach((d) => {
            const m = d.data();
            if (m.anulado) return;
            if (m.tipo === 'ingreso') ingresos += entero(m.monto);
            else if (m.tipo === 'egreso') egresos += entero(m.monto);
        });

        // Traslados bóveda↔cajón de ESTE turno (reposición de cambio suma; vaciado resta).
        let bovedaACajon = 0, cajonABoveda = 0;
        trasSnap.forEach((d) => {
            const t = d.data();
            if (t.anulado) return;
            if (t.tipo === 'boveda_a_cajon') bovedaACajon += entero(t.monto);
            else if (t.tipo === 'cajon_a_boveda') cajonABoveda += entero(t.monto);
        });

        // Ecuación de cierre COMPLETA (§8.1.7). El esperado puede ser < 0 (anomalía real) → sin clamp.
        const fondoApertura = entero(turno.fondoApertura);
        const esperadoEfectivo = fondoApertura + ventasPorMedio.efectivo + ingresos - egresos + bovedaACajon - cajonABoveda;
        const esperadoPorMedio = { ...ventasPorMedio, efectivo: esperadoEfectivo };
        const declaradoEfectivo = entero(conteo.efectivo);
        const descuadre = declaradoEfectivo - esperadoEfectivo;   // + sobra, − falta (espejo de cierreCajaCore)

        // Sello INMUTABLE del turno + libera el puntero (el cierre gana: una venta tardía re-lee 'cerrado').
        tx.update(turnoRef, {
            estado: 'cerrado',
            cierrePor: autor,
            cierreTs: FieldValue.serverTimestamp(),
            conteoPorMedio: conteo,
            esperadoPorMedio, esperadoEfectivo,
            ingresos, egresos, bovedaACajon, cajonABoveda,
            declaradoEfectivo, descuadre,
        });
        if (estadoSnap.exists && estadoSnap.data().turnoAbiertoId === turnoId) {
            tx.update(estadoRef, { turnoAbiertoId: null, docsDelTurno: 0 });   // libera el puntero + resetea la cota
        }
        return { turnoId, esperadoPorMedio, esperadoEfectivo, declaradoEfectivo, descuadre, yaExistia: false };
    });
}

// ─── B3 · Bóveda: traslado / reverso / recompute (§9.3 · §8.1.2/3 · §8.3) ─────────────────────
// El saldo de bóveda NUNCA se incrementa a mano: se RECOMPUTA desde el ledger (patrón recalcSaldoCliente
// §50). Cada movimiento guarda un `delta` FIRMADO (autoridad del recompute); el signo lo da el tipo. El
// ledger es INMUTABLE ESTRICTO (§9.3): corregir = asiento `reverso` (delta=−original), jamás editar/borrar.
// El CHECKPOINT mensual (boveda/main/checkpoints/{YYYY-MM}, sellado por `sellTs`) ACOTA el recompute a
// [checkpoint, ahora] → no O(n) a 2-3 años (§8.3).
const SIGNO_BOVEDA = { cajon_a_boveda: 1, boveda_a_cajon: -1, boveda_a_banco: -1 };   // traslados que acepta registrarTraslado

// Guard duro de montos (§8.3): entero seguro y positivo (COP sin centavos). NO usa entero() (que coacciona).
function guardMonto(monto) {
    if (!Number.isSafeInteger(monto) || monto <= 0) {
        throw new PedidoError('invalid-argument', 'El monto debe ser un entero positivo (pesos COP sin centavos).');
    }
}

// B4 · conceptos de movimiento de caja (§8.5, lista cerrada; 'otro' exige nota).
const CONCEPTOS_CAJA = new Set(['pago_domiciliario', 'compra_empaques', 'adelanto_vendedora', 'gasto_menor', 'retiro_socio', 'otro']);

// B4 · emisor de alerta al owner (§9.8.2): el owner es SIEMPRE destinatario (fijo en la CF; config/caja
// solo AÑADE, jamás remueve). `notificar` se INYECTA (opts) → hoy mock en tests; el transporte FCM real se
// cablea con A.6 (pendiente). Si no se inyecta, no-op (comportamiento intacto para llamadores sin alertas).
function emitirAlerta(opts, evt) {
    const notif = opts && typeof opts.notificar === 'function' ? opts.notificar : null;
    if (notif) notif({ ...evt, alOwner: true });
}

// Recompute AUTORIDAD: saldo = último checkpoint + Σ(delta de los movimientos posteriores YA commiteados).
// `tx` opcional → dentro de una transacción (gate síncrono §8.1.3) o standalone (recalc/display).
async function saldoBovedaDesdeLedger(db, tx = null) {
    const cpQ = db.collection('boveda').doc('main').collection('checkpoints').orderBy('sellTs', 'desc').limit(1);
    const cpSnap = tx ? await tx.get(cpQ) : await cpQ.get();
    const cp = cpSnap.empty ? null : cpSnap.docs[0].data();
    const base = cp ? (cp.saldo || 0) : 0;
    let movQ = db.collection('bovedaMovimientos');
    if (cp && cp.sellTs) movQ = movQ.where('ts', '>', cp.sellTs);   // solo lo posterior al corte
    const movSnap = tx ? await tx.get(movQ) : await movQ.get();
    let suma = 0;
    movSnap.forEach((d) => {
        const m = d.data();
        if (m.estado === 'pendiente_aprobacion' || m.estado === 'rechazado') return;   // Dual-Approval §9.1: pendiente NO cuenta
        suma += (m.delta || 0);
    });
    return base + suma;
}

/**
 * Registra un traslado de dinero físico de/hacia la bóveda. Recompute SÍNCRONO en la tx (gate §8.1.3):
 * una salida no puede dejar la bóveda negativa. Idempotente por opId. Escribe el ledger + boveda/main atómico.
 * @param db Firestore (admin). @param input { opId, tipo, monto, turnoId?, autor, nota? }
 */
async function registrarTrasladoCore(db, input = {}) {
    const opId = String(input.opId || '').trim();
    const tipo = input.tipo;
    const monto = input.monto;
    const autor = input.autor || null;
    if (!opId) throw new PedidoError('invalid-argument', 'opId es obligatorio.');
    const signo = SIGNO_BOVEDA[tipo];
    if (signo === undefined) throw new PedidoError('invalid-argument', `tipo de traslado inválido: ${tipo}`);
    guardMonto(monto);
    const delta = signo * monto;

    return db.runTransaction(async (tx) => {
        const movRef = db.doc(`bovedaMovimientos/${opId}`);
        const existing = await tx.get(movRef);
        const base = await saldoBovedaDesdeLedger(db, tx);   // recompute autoridad (movimientos ya commiteados)
        if (existing.exists) return { opId, saldo: base, yaExistia: true };   // IDEMPOTENTE: no re-suma

        const nuevoSaldo = base + delta;
        if (delta < 0 && nuevoSaldo < 0) throw new PedidoError('failed-precondition', 'Saldo insuficiente en la bóveda para esa salida.');

        const mov = { tipo, monto, delta, autor, ts: FieldValue.serverTimestamp() };
        if (input.turnoId) mov.turnoId = String(input.turnoId);
        if (input.nota) mov.nota = String(input.nota).slice(0, 500);
        tx.set(movRef, mov);
        tx.set(db.doc('boveda/main'), { saldo: nuevoSaldo, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
        return { opId, saldo: nuevoSaldo, tipo, delta, yaExistia: false };
    });
}

/**
 * Reversa un movimiento del ledger SIN borrarlo: crea un asiento compensatorio `reverso` (delta=−original).
 * Doble rastro contable (reversing entry, §9.3). Rechaza reversar un reverso o un movimiento ya reversado.
 * @param db Firestore (admin). @param input { opId, reversaA, autor, motivo? }
 */
async function reversoCore(db, input = {}, opts = {}) {
    const opId = String(input.opId || '').trim();
    const reversaA = String(input.reversaA || '').trim();
    const autor = input.autor || null;
    const motivo = input.motivo ? String(input.motivo).slice(0, 500) : null;
    if (!opId || !reversaA) throw new PedidoError('invalid-argument', 'opId y reversaA son obligatorios.');

    const res = await db.runTransaction(async (tx) => {
        const movRef = db.doc(`bovedaMovimientos/${opId}`);
        const origRef = db.doc(`bovedaMovimientos/${reversaA}`);
        const existing = await tx.get(movRef);
        const origSnap = await tx.get(origRef);
        const yaRev = await tx.get(db.collection('bovedaMovimientos').where('reversaA', '==', reversaA));
        const base = await saldoBovedaDesdeLedger(db, tx);   // saldo actual (excluye pendientes)
        if (existing.exists) return { opId, estado: existing.data().estado, saldo: base, delta: existing.data().delta, yaExistia: true };
        if (!origSnap.exists) throw new PedidoError('not-found', 'El movimiento a reversar no existe.');
        if (origSnap.data().tipo === 'reverso') throw new PedidoError('failed-precondition', 'No se puede reversar un reverso.');
        if (!yaRev.empty) throw new PedidoError('failed-precondition', 'Ese movimiento ya fue reversado.');

        const delta = -(origSnap.data().delta || 0);
        // DESTRUCTIVO (§9.1): nace PENDIENTE → NO escribe boveda/main (no cuenta hasta que el owner apruebe).
        tx.set(movRef, { tipo: 'reverso', reversaA, monto: Math.abs(delta), delta, estado: 'pendiente_aprobacion', autor, motivo, ts: FieldValue.serverTimestamp() });
        return { opId, reversaA, estado: 'pendiente_aprobacion', saldo: base, delta, yaExistia: false };
    });
    if (!res.yaExistia) emitirAlerta(opts, { evento: 'reverso', opId, reversaA, monto: Math.abs(res.delta), autor, requiereAprobacion: true });
    return res;
}

/**
 * Recompute de "vista" (cuerpo del trigger recalcBoveda §8.1.3): recalcula boveda/main desde el ledger.
 * NO tiene autoridad (los gates recomputan en su propia tx) — solo mantiene el saldo fresco para mostrar.
 * No-op si el saldo no cambió (evita re-trigger). @param db Firestore (admin).
 */
async function recalcBovedaCore(db) {
    const saldo = await saldoBovedaDesdeLedger(db, null);
    const mainRef = db.doc('boveda/main');
    const cur = await mainRef.get();
    const actual = cur.exists ? (cur.data().saldo ?? null) : null;
    if (actual === saldo) return { saldo, changed: false };
    await mainRef.set({ saldo, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    return { saldo, changed: true };
}

// ─── B4 · Dual-Approval + alertas (§9.1 · §9.8 · §8.5) ────────────────────────────────────────

/**
 * Ingreso/egreso manual de la caja del turno (turnos/{id}/movsCaja). NO toca la bóveda; alimenta la
 * ecuación de cierre. Idempotente por opId. EGRESO → alerta al owner (fraude interno §8.5).
 * @param db Firestore. @param input { turnoId, opId, tipo:'ingreso'|'egreso', concepto, monto, nota?, autor }
 */
async function movimientoCajaCore(db, input = {}, opts = {}) {
    const turnoId = String(input.turnoId || '').trim();
    const opId = String(input.opId || '').trim();
    const tipo = input.tipo;
    const concepto = input.concepto;
    const nota = input.nota ? String(input.nota).slice(0, 500) : null;
    const autor = input.autor || null;
    if (!turnoId || !opId) throw new PedidoError('invalid-argument', 'turnoId y opId son obligatorios.');
    if (tipo !== 'ingreso' && tipo !== 'egreso') throw new PedidoError('invalid-argument', 'tipo de movimiento inválido.');
    if (!CONCEPTOS_CAJA.has(concepto)) throw new PedidoError('invalid-argument', `concepto de caja inválido: ${concepto}`);
    guardMonto(input.monto);
    if (concepto === 'otro' && !nota) throw new PedidoError('invalid-argument', 'El concepto "otro" exige una nota.');
    const monto = input.monto;

    const res = await db.runTransaction(async (tx) => {
        const turnoRef = db.doc(`turnos/${turnoId}`);
        const movRef = db.doc(`turnos/${turnoId}/movsCaja/${opId}`);
        const [turnoSnap, existing] = await Promise.all([tx.get(turnoRef), tx.get(movRef)]);
        if (existing.exists) return { turnoId, opId, yaExistia: true };   // IDEMPOTENTE
        if (!turnoSnap.exists) throw new PedidoError('not-found', 'El turno no existe.');
        if (turnoSnap.data().estado !== 'abierto') throw new PedidoError('failed-precondition', 'La caja no está abierta.');
        const mov = { tipo, concepto, monto, autor, ts: FieldValue.serverTimestamp() };
        if (nota) mov.nota = nota;
        tx.set(movRef, mov);
        return { turnoId, opId, tipo, monto, yaExistia: false };
    });
    if (!res.yaExistia && tipo === 'egreso') emitirAlerta(opts, { evento: 'egreso', turnoId, opId, concepto, monto, autor });
    return res;
}

/**
 * Ajuste de bóveda por conteo físico (§8.1.8). DESTRUCTIVO → nace pendiente_aprobacion (no cuenta) + alerta.
 * ajuste_sobrante +saldo · ajuste_faltante −saldo. Motivo obligatorio. @param input { opId, tipo, monto, motivo, autor }
 */
async function ajusteCore(db, input = {}, opts = {}) {
    const opId = String(input.opId || '').trim();
    const tipo = input.tipo;
    const motivo = input.motivo ? String(input.motivo).trim() : '';
    const autor = input.autor || null;
    if (!opId) throw new PedidoError('invalid-argument', 'opId es obligatorio.');
    if (tipo !== 'ajuste_faltante' && tipo !== 'ajuste_sobrante') throw new PedidoError('invalid-argument', 'tipo de ajuste inválido.');
    guardMonto(input.monto);
    if (!motivo) throw new PedidoError('invalid-argument', 'El ajuste exige un motivo.');
    const monto = input.monto;
    const delta = tipo === 'ajuste_sobrante' ? monto : -monto;

    const res = await db.runTransaction(async (tx) => {
        const movRef = db.doc(`bovedaMovimientos/${opId}`);
        const existing = await tx.get(movRef);
        const base = await saldoBovedaDesdeLedger(db, tx);
        if (existing.exists) return { opId, estado: existing.data().estado, saldo: base, yaExistia: true };
        tx.set(movRef, { tipo, monto, delta, estado: 'pendiente_aprobacion', motivo: motivo.slice(0, 500), autor, ts: FieldValue.serverTimestamp() });
        return { opId, estado: 'pendiente_aprobacion', saldo: base, delta, yaExistia: false };
    });
    if (!res.yaExistia) emitirAlerta(opts, { evento: tipo, opId, monto, motivo, autor, requiereAprobacion: true });
    return res;
}

/**
 * Aprueba un evento destructivo pendiente (reverso/ajuste) — SOLO owner (SoD §9.1). Al aprobar, el evento
 * ENTRA al recompute (recompute síncrono in-tx). Idempotente. @param input { opId, aprobadoPor, rol }
 */
async function aprobarEventoCajaCore(db, input = {}, opts = {}) {
    const opId = String(input.opId || '').trim();
    const aprobadoPor = input.aprobadoPor || null;
    if (!opId) throw new PedidoError('invalid-argument', 'opId es obligatorio.');
    if (input.rol !== 'owner') throw new PedidoError('permission-denied', 'Solo el dueño (owner) puede aprobar eventos de dinero.');

    const res = await db.runTransaction(async (tx) => {
        const movRef = db.doc(`bovedaMovimientos/${opId}`);
        const snap = await tx.get(movRef);
        const base = await saldoBovedaDesdeLedger(db, tx);   // excluye este evento (aún pendiente)
        if (!snap.exists) throw new PedidoError('not-found', 'El evento a aprobar no existe.');
        const ev = snap.data();
        if (ev.estado === 'aprobado') return { opId, estado: 'aprobado', saldo: base, yaExistia: true };   // base ya lo incluye
        if (ev.estado !== 'pendiente_aprobacion') throw new PedidoError('failed-precondition', 'El evento no está pendiente de aprobación.');
        const delta = ev.delta || 0;
        const nuevoSaldo = base + delta;
        if (delta < 0 && nuevoSaldo < 0) throw new PedidoError('failed-precondition', 'Aprobar dejaría la bóveda negativa.');
        tx.update(movRef, { estado: 'aprobado', aprobadoPor, aprobadoEn: FieldValue.serverTimestamp() });
        tx.set(db.doc('boveda/main'), { saldo: nuevoSaldo, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
        return { opId, estado: 'aprobado', saldo: nuevoSaldo, yaExistia: false };
    });
    if (!res.yaExistia) emitirAlerta(opts, { evento: 'aprobacion', opId, aprobadoPor, requiereAprobacion: false });
    return res;
}

module.exports = {
    abrirTurnoCore, cerrarTurnoCore, registrarTrasladoCore, reversoCore, recalcBovedaCore,
    movimientoCajaCore, ajusteCore, aprobarEventoCajaCore,
};
