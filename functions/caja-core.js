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
        tx.set(estadoRef, { turnoAbiertoId: opId }, { merge: true });   // el puntero pasa a apuntar a este turno (atómico)
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
            tx.update(estadoRef, { turnoAbiertoId: null });
        }
        return { turnoId, esperadoPorMedio, esperadoEfectivo, declaradoEfectivo, descuadre, yaExistia: false };
    });
}

module.exports = { abrirTurnoCore, cerrarTurnoCore };
