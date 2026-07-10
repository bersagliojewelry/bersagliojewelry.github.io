/**
 * crearPedido (B1 paso 3 · TODO-37) — wrapper `onCall` del único escritor de `pedidos`.
 *
 * Responsabilidad de ESTE archivo: autenticación + rol (owner/admin/catálogo = Kary) y mapear
 * los errores de negocio (`PedidoError`) a `HttpsError`. TODA la lógica de dinero/concurrencia
 * (transacción atómica, candado de stock, recálculo server-side, snapshot inmutable, idempotencia)
 * vive en `pedidos-core.js` (sin firebase-functions → testeable contra el emulador).
 *
 * Seguridad: reglas `pedidos` create:false + `pieces.estado/reserva*` cliente-DENY → SOLO esta CF
 * escribe el estado de venta (nadie des-vende ni cambia precios por fuera).
 */
const { onCall, onRequest, HttpsError } = require('firebase-functions/v2/https');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { onDocumentUpdated, onDocumentWritten } = require('firebase-functions/v2/firestore');
const { defineSecret } = require('firebase-functions/params');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { crearPedidoCore, confirmarPagoCore, anularPedidoCore, cierreCajaCore, iniciarPagoWebCore, confirmarPagoWompiCore, liberarReservasVencidasCore, avanzarPedidoCore, PedidoError } = require('./pedidos-core');
const { abrirTurnoCore, cerrarTurnoCore, movimientoCajaCore, registrarTrasladoCore, reversoCore, ajusteCore, aprobarEventoCajaCore, recalcBovedaCore } = require('./caja-core');   // F2.0

const VENTAS = ['owner', 'admin', 'catalogo'];
const CAJA = ['owner', 'admin', 'caja'];   // F2.0: quien OPERA la caja (isCaja); aprobar = solo owner

// Secreto de INTEGRIDAD de Wompi (Secret Manager; NUNCA en el repo). Se setea por entorno:
//   firebase functions:secrets:set WOMPI_INTEGRITY_SECRET   (test en sandbox · prod al lanzar)
// La llave PÚBLICA (pub_test_/pub_prod_) va por env normal WOMPI_PUBLIC_KEY (es pública por diseño).
const WOMPI_INTEGRITY_SECRET = defineSecret('WOMPI_INTEGRITY_SECRET');
// Secreto de EVENTOS (valida la firma del webhook) + llave PRIVADA (re-consulta la API = verdad).
const WOMPI_EVENTS_SECRET = defineSecret('WOMPI_EVENTS_SECRET');
const WOMPI_PRIVATE_KEY = defineSecret('WOMPI_PRIVATE_KEY');
// Base de la API por ENTORNO (NO por flag): sandbox para pruebas, production al lanzar (paso 2c).
const WOMPI_API_BASE = process.env.WOMPI_API_BASE || 'https://sandbox.wompi.co/v1';

async function rolDeVentas(db, auth) {
    if (!auth) throw new HttpsError('unauthenticated', 'Debes iniciar sesión.');
    let role = typeof auth.token?.role === 'string' ? auth.token.role : null;
    if (!role) {
        const snap = await db.collection('users').doc(auth.uid).get();
        if (!snap.exists) throw new HttpsError('permission-denied', 'Usuario no registrado.');
        role = snap.data().role;
    }
    if (!VENTAS.includes(role)) throw new HttpsError('permission-denied', 'No tienes permiso para registrar ventas.');
    return role;
}

// F2.0 · rol para OPERAR la caja (isCaja) y para APROBAR (owner). `caja` no está en el ROLE_LEVEL
// jerárquico de index.js → se valida por SET (como rolDeVentas), no por nivel.
async function rolDeCaja(db, auth) {
    if (!auth) throw new HttpsError('unauthenticated', 'Debes iniciar sesión.');
    let role = typeof auth.token?.role === 'string' ? auth.token.role : null;
    if (!role) {
        const snap = await db.collection('users').doc(auth.uid).get();
        if (!snap.exists) throw new HttpsError('permission-denied', 'Usuario no registrado.');
        role = snap.data().role;
    }
    if (!CAJA.includes(role)) throw new HttpsError('permission-denied', 'No tienes permiso para operar la caja.');
    return role;
}
async function rolDeOwner(db, auth) {
    if (!auth) throw new HttpsError('unauthenticated', 'Debes iniciar sesión.');
    let role = typeof auth.token?.role === 'string' ? auth.token.role : null;
    if (!role) {
        const snap = await db.collection('users').doc(auth.uid).get();
        if (!snap.exists) throw new HttpsError('permission-denied', 'Usuario no registrado.');
        role = snap.data().role;
    }
    if (role !== 'owner') throw new HttpsError('permission-denied', 'Solo el dueño (owner) puede hacer esto.');
    return role;
}

// F2.0 · emisor de alerta de caja → `saludEventos` (canal del panel, patrón alertaPedidoRevision). El
// owner SIEMPRE es destinatario; el transporte FCM push real se cablea con A.6. Id determinista →
// idempotente. Se INYECTA en los cores (opts.notificar); best-effort (no tumba la operación de dinero).
function notificarCaja(db) {
    return async (evt) => {
        const DETALLE = {
            egreso:          `💸 Egreso de caja${evt.concepto ? ` (${evt.concepto})` : ''} — ${evt.monto || '?'} COP · turno ${evt.turnoId || '?'}.`,
            reverso:         `↩️ Reversa de bóveda PENDIENTE de tu aprobación — ${evt.monto || '?'} COP.`,
            ajuste_faltante: `⚠️ Ajuste FALTANTE de bóveda pendiente de aprobación — ${evt.monto || '?'} COP. ${evt.motivo || ''}`,
            ajuste_sobrante: `⚠️ Ajuste SOBRANTE de bóveda pendiente de aprobación — ${evt.monto || '?'} COP. ${evt.motivo || ''}`,
            aprobacion:      `✅ Evento de bóveda aprobado.${evt.turnoSellado ? ' ⚠️ El turno del movimiento ya estaba CERRADO: su arqueo quedó sellado sin esta reversa (el descuadre de ese turno no se corrige solo).' : ''}`,
        };
        try {
            await db.collection('saludEventos').doc(`caja-${evt.evento}-${evt.opId}`).set({
                tipo: 'caja-alerta', evento: evt.evento,
                detalle: DETALLE[evt.evento] || `Evento de caja: ${evt.evento}`,
                opId: evt.opId || null, monto: evt.monto ?? null, autor: evt.autor ?? null,
                requiereAprobacion: evt.requiereAprobacion === true,
                at: FieldValue.serverTimestamp(), resuelto: false,
            });
        } catch (e) { console.error('[notificarCaja] alerta no registrada:', e); }
    };
}

const crearPedido = onCall({ region: 'us-central1', invoker: 'public' }, async (request) => {
    const db = getFirestore();
    const rol = await rolDeVentas(db, request.auth);
    try {
        // F2.2: `lineasExtra` viaja en request.data (spread); `autorRol` sella la auditoría de la línea libre.
        return await crearPedidoCore(db, { ...(request.data || {}), autor: request.auth.uid, autorRol: rol });
    } catch (e) {
        if (e instanceof PedidoError) throw new HttpsError(e.code, e.message);
        throw e;   // error inesperado → 'internal' (firebase-functions lo envuelve)
    }
});

// confirmarPago (paso 4): Kary confirma "ya vi la plata" → por_verificar → pagado.
const confirmarPago = onCall({ region: 'us-central1', invoker: 'public' }, async (request) => {
    const db = getFirestore();
    await rolDeVentas(db, request.auth);
    try {
        return await confirmarPagoCore(db, { pedidoId: (request.data || {}).pedidoId, autor: request.auth.uid });
    } catch (e) {
        if (e instanceof PedidoError) throw new HttpsError(e.code, e.message);
        throw e;
    }
});

// avanzarPedido (F1-CORE, spec 2026-07-06 §3): ÚNICA puerta de las transiciones post-pago —
// tabla TRANSICIONES + historial append-only + flete aditivo + POD. La lógica vive en el core.
const avanzarPedido = onCall({ region: 'us-central1', invoker: 'public' }, async (request) => {
    const db = getFirestore();
    await rolDeVentas(db, request.auth);
    try {
        const d = request.data || {};
        return await avanzarPedidoCore(db, { pedidoId: d.pedidoId, a: d.a, datos: d.datos, nota: d.nota, autor: request.auth.uid });
    } catch (e) {
        if (e instanceof PedidoError) throw new HttpsError(e.code, e.message);
        throw e;
    }
});

// anularPedido (paso 5 · VOID): marca anulado + reintegra la pieza al catálogo.
const anularPedido = onCall({ region: 'us-central1', invoker: 'public' }, async (request) => {
    const db = getFirestore();
    await rolDeVentas(db, request.auth);
    try {
        const d = request.data || {};
        return await anularPedidoCore(db, { pedidoId: d.pedidoId, motivo: d.motivo, autor: request.auth.uid });
    } catch (e) {
        if (e instanceof PedidoError) throw new HttpsError(e.code, e.message);
        throw e;
    }
});

// cierreCaja (paso 5 · Cierre Z): arqueo del turno (esperado vs efectivo declarado → descuadre).
const cierreCaja = onCall({ region: 'us-central1', invoker: 'public' }, async (request) => {
    const db = getFirestore();
    await rolDeVentas(db, request.auth);
    try {
        const d = request.data || {};
        return await cierreCajaCore(db, { arqueoId: d.arqueoId, declaradoEfectivo: d.declaradoEfectivo, autor: request.auth.uid });
    } catch (e) {
        if (e instanceof PedidoError) throw new HttpsError(e.code, e.message);
        throw e;
    }
});

// ─── F2.0 · Sesión de caja + Bóveda (wrappers onCall; toda la lógica en caja-core.js) ────────
// isCaja (owner/admin/caja) OPERA; isOwner APRUEBA (SoD §9.1). El cliente genera el `opId`
// (idempotencia §8.1.2). Alertas → saludEventos (notificarCaja). Reglas caja/*/turnos/boveda* = CF-only (B0b).
const abrirTurno = onCall({ region: 'us-central1', invoker: 'public' }, async (request) => {
    const db = getFirestore();
    await rolDeCaja(db, request.auth);
    try {
        const d = request.data || {};
        return await abrirTurnoCore(db, { opId: d.opId, fondoApertura: d.fondoApertura, autor: request.auth.uid });
    } catch (e) { if (e instanceof PedidoError) throw new HttpsError(e.code, e.message); throw e; }
});
const cerrarTurno = onCall({ region: 'us-central1', invoker: 'public' }, async (request) => {
    const db = getFirestore();
    await rolDeCaja(db, request.auth);
    try {
        const d = request.data || {};
        return await cerrarTurnoCore(db, { turnoId: d.turnoId, conteoPorMedio: d.conteoPorMedio, autor: request.auth.uid });
    } catch (e) { if (e instanceof PedidoError) throw new HttpsError(e.code, e.message); throw e; }
});
const movimientoCaja = onCall({ region: 'us-central1', invoker: 'public' }, async (request) => {
    const db = getFirestore();
    await rolDeCaja(db, request.auth);
    try {
        const d = request.data || {};
        return await movimientoCajaCore(db, { turnoId: d.turnoId, opId: d.opId, tipo: d.tipo, concepto: d.concepto, monto: d.monto, nota: d.nota, autor: request.auth.uid }, { notificar: notificarCaja(db) });
    } catch (e) { if (e instanceof PedidoError) throw new HttpsError(e.code, e.message); throw e; }
});
const registrarTraslado = onCall({ region: 'us-central1', invoker: 'public' }, async (request) => {
    const db = getFirestore();
    await rolDeCaja(db, request.auth);
    try {
        const d = request.data || {};
        return await registrarTrasladoCore(db, { opId: d.opId, tipo: d.tipo, monto: d.monto, turnoId: d.turnoId, nota: d.nota, autor: request.auth.uid }, { notificar: notificarCaja(db) });
    } catch (e) { if (e instanceof PedidoError) throw new HttpsError(e.code, e.message); throw e; }
});
const reversoTraslado = onCall({ region: 'us-central1', invoker: 'public' }, async (request) => {
    const db = getFirestore();
    await rolDeCaja(db, request.auth);
    try {
        const d = request.data || {};
        return await reversoCore(db, { opId: d.opId, reversaA: d.reversaA, motivo: d.motivo, autor: request.auth.uid }, { notificar: notificarCaja(db) });
    } catch (e) { if (e instanceof PedidoError) throw new HttpsError(e.code, e.message); throw e; }
});
const ajusteBoveda = onCall({ region: 'us-central1', invoker: 'public' }, async (request) => {
    const db = getFirestore();
    await rolDeCaja(db, request.auth);
    try {
        const d = request.data || {};
        return await ajusteCore(db, { opId: d.opId, tipo: d.tipo, monto: d.monto, motivo: d.motivo, autor: request.auth.uid }, { notificar: notificarCaja(db) });
    } catch (e) { if (e instanceof PedidoError) throw new HttpsError(e.code, e.message); throw e; }
});
const aprobarEventoCaja = onCall({ region: 'us-central1', invoker: 'public' }, async (request) => {
    const db = getFirestore();
    const rol = await rolDeOwner(db, request.auth);   // SoD §9.1: SOLO owner aprueba
    try {
        const d = request.data || {};
        return await aprobarEventoCajaCore(db, { opId: d.opId, aprobadoPor: request.auth.uid, rol }, { notificar: notificarCaja(db) });
    } catch (e) { if (e instanceof PedidoError) throw new HttpsError(e.code, e.message); throw e; }
});
// recalcBoveda: mantiene boveda/main fresco tras cualquier escritura del ledger (BACKSTOP — los cores ya
// lo escriben síncrono; no-op si igual). No re-dispara (escribe boveda/main, no bovedaMovimientos).
const recalcBoveda = onDocumentWritten({ document: 'bovedaMovimientos/{opId}', region: 'us-central1' }, async () => {
    try { await recalcBovedaCore(getFirestore()); }
    catch (e) { console.error('[recalcBoveda] recompute falló:', e); }
});

// iniciarPagoWeb (Wompi F2): el cliente PÚBLICO (sin login) inicia el cobro de una pieza.
// NO lleva check de rol (lo llama el comprador, no Kary); la robustez vive en el core (elegibilidad,
// tope $2.5M, total+firma server-side). ⚠️ Anti-abuso (App Check/rate-limit) = hardening 2c (TODO-14).
const iniciarPagoWeb = onCall({ region: 'us-central1', invoker: 'public', secrets: [WOMPI_INTEGRITY_SECRET] }, async (request) => {
    const db = getFirestore();
    try {
        const d = request.data || {};
        const res = await iniciarPagoWebCore(db, { pedidoId: d.pedidoId, pieceId: d.pieceId, shipping: d.shipping, habeas: d.habeas, tipoEntrega: d.tipoEntrega }, {
            integritySecret: WOMPI_INTEGRITY_SECRET.value(),
        });
        // La llave pública (pub_test_/pub_prod_) la necesita el Widget; es pública por diseño.
        return { ...res, publicKey: process.env.WOMPI_PUBLIC_KEY || null };
    } catch (e) {
        if (e instanceof PedidoError) throw new HttpsError(e.code, e.message);
        throw e;
    }
});

// confirmarPagoWompi (Wompi F2): WEBHOOK HTTP (server-to-server, Wompi → CF). Público por diseño —
// la "auth" es la FIRMA del evento (no IAM). Solo POST. Re-consulta la API de Wompi (verdad) con la
// llave privada. Responde 200 si la firma es válida (aunque ignore el evento) para no provocar
// tormenta de reintentos; 401 firma inválida; 5xx transitorio → Wompi reintenta. ⚠️ rate-limit/IP-allowlist = 2c.
const confirmarPagoWompi = onRequest(
    { region: 'us-central1', secrets: [WOMPI_EVENTS_SECRET, WOMPI_PRIVATE_KEY] },
    async (req, res) => {
        if (req.method !== 'POST') { res.status(405).send('Method Not Allowed'); return; }
        const db = getFirestore();
        const fetchTransaction = async (txId) => {
            const r = await fetch(`${WOMPI_API_BASE}/transactions/${encodeURIComponent(txId)}`, {
                headers: { Authorization: `Bearer ${WOMPI_PRIVATE_KEY.value()}` },
            });
            if (!r.ok) return null;                         // 4xx/5xx → null → 502 → Wompi reintenta
            const d = (await r.json())?.data;
            return d ? { id: d.id, status: d.status, amount_in_cents: d.amount_in_cents, currency: d.currency, reference: d.reference } : null;
        };
        try {
            const out = await confirmarPagoWompiCore(db, req.body || {}, { eventsSecret: WOMPI_EVENTS_SECRET.value(), fetchTransaction });
            res.status(out.status || 200).json({ ok: out.ok, reason: out.reason });
        } catch (e) {
            console.error('[confirmarPagoWompi] error:', e);
            res.status(500).json({ ok: false });           // transitorio → Wompi reintenta
        }
    },
);

// liberarReservasVencidas (Wompi F2): REAPER programado (Cloud Scheduler, cada 2 min). Libera
// reservas web vencidas y NO pagadas; re-consulta Wompi por referencia ANTES de soltar (nunca a
// ciegas). APPROVED→a_revisar · PENDING/fallo→espera · NONE→repone unidad + pedido expirado.
const liberarReservasVencidas = onSchedule(
    { schedule: 'every 2 minutes', region: 'us-central1', secrets: [WOMPI_PRIVATE_KEY] },
    async () => {
        const db = getFirestore();
        const verificarPago = async (_ped, pedidoId) => {
            // Wompi por referencia (= pedidoId). Endpoint CONFIRMADO contra production.wompi.co
            // (2026-07-04, llave prv_prod real): 200 {"data":[...]} — referencia inexistente → data:[].
            const r = await fetch(`${WOMPI_API_BASE}/transactions?reference=${encodeURIComponent(pedidoId)}`, {
                headers: { Authorization: `Bearer ${WOMPI_PRIVATE_KEY.value()}` },
            });
            if (!r.ok) throw new Error(`wompi ${r.status}`);           // → skip (no libera a ciegas)
            const list = (await r.json())?.data || [];
            if (list.some(t => t.status === 'APPROVED')) return 'APPROVED';
            if (list.some(t => t.status === 'PENDING')) return 'PENDING';
            return 'NONE';
        };
        const out = await liberarReservasVencidasCore(db, { verificarPago });
        console.log('[reaper]', JSON.stringify({ revisados: out.revisados, liberados: out.liberados }));
        // A.5: si el reaper VE reservas vencidas pero la re-consulta a Wompi FALLA en todas (endpoint mal
        // formado / llave / Wompi caído), NINGUNA se libera nunca → fuga de stock silenciosa (pieza única
        // "agotada" para siempre). Se registra en saludEventos para que el panel lo muestre (patrón §64).
        const fallos = out.resultados.filter(r => r.accion === 'consulta-fallo-skip').length;
        if (out.revisados > 0 && out.liberados === 0 && fallos === out.revisados) {
            try {
                await db.collection('saludEventos').doc('reaper-consulta-fallo').set({
                    tipo: 'reaper-consulta-fallo',
                    detalle: `El reaper revisó ${out.revisados} reserva(s) vencida(s) y la consulta a Wompi falló en todas → 0 liberadas (posible endpoint/llave). Verificar functions/pedidos.js:verificarPago.`,
                    revisados: out.revisados, at: FieldValue.serverTimestamp(), resuelto: false,
                });
            } catch (e) { console.error('[reaper] no se pudo registrar saludEventos:', e); }
        }
    },
);

// A.6: ALERTA cuando un pedido entra a un estado con DINERO REAL cobrado que exige acción humana:
//   pagado_sin_stock = cliente COBRADO sin pieza (reembolso, SLA legal de retracto corriendo)
//   a_revisar        = venta pagada sin confirmar (monto no coincide, o pago hallado por el reaper)
// Sin esto, ambos se escribían en silencio y dependían de que Kary abriera el panel. Se registra en
// saludEventos (id determinista por pedido → idempotente). La cola visible en el panel = Bloque D.
const ESTADOS_ALERTA = { pagado_sin_stock: 'Cliente cobrado SIN stock — revisar reembolso', a_revisar: 'Venta pagada por revisar (monto/pago)' };
const alertaPedidoRevision = onDocumentUpdated({ document: 'pedidos/{pedidoId}', region: 'us-central1' }, async (event) => {
    const antes = event.data?.before?.data();
    const despues = event.data?.after?.data();
    if (!despues) return;
    const nuevo = despues.estado;
    const entroA = (estado) => nuevo === estado && (!antes || antes.estado !== estado);   // solo al ENTRAR
    const db = getFirestore();
    // §164 (gate A.9, pregunta del dueño): una VENTA WEB PAGADA normal también alerta — el comprador es
    // invitado (sin cuenta) y el seguimiento es concierge por Kary; si nadie se entera, el pedido pagado
    // duerme con el SLA de retracto (5 días) corriendo. Doc aparte del de problemas (id distinto).
    if (entroA('pagado') && despues.canal === 'web') {
        try {
            await db.collection('saludEventos').doc(`venta-web-${event.params.pedidoId}`).set({
                tipo: 'venta-web-pagada',
                detalle: `💰 VENTA WEB PAGADA — pedido ${despues.codigo || '?'} (#${despues.numero || '?'}) · ${despues.total || '?'} COP · ${despues.pieceName || ''}. Contactar al cliente (correo/WhatsApp del pedido) y coordinar ${despues.tipoEntrega === 'tienda' ? 'la cita de entrega en el atelier' : 'el envío'}.`,
                pedidoId: event.params.pedidoId,
                at: FieldValue.serverTimestamp(), resuelto: false,
            });
        } catch (e) { console.error('[alertaPedidoRevision] venta-web no registrada:', e); }
    }
    if (!ESTADOS_ALERTA[nuevo] || (antes && antes.estado === nuevo)) return;   // problemas: solo al ENTRAR al estado
    try {
        await db.collection('saludEventos').doc(`pedido-${event.params.pedidoId}`).set({
            tipo: 'pedido-requiere-accion',
            estado: nuevo,
            detalle: `${ESTADOS_ALERTA[nuevo]} — pedido ${despues.codigo || despues.numero || event.params.pedidoId} (${despues.total || '?'} COP).`,
            pedidoId: event.params.pedidoId,
            at: FieldValue.serverTimestamp(), resuelto: false,
        });
    } catch (e) { console.error('[alertaPedidoRevision] no se pudo registrar:', e); }
});

module.exports = {
    crearPedido, confirmarPago, anularPedido, cierreCaja, iniciarPagoWeb, confirmarPagoWompi,
    liberarReservasVencidas, alertaPedidoRevision, avanzarPedido,
    // F2.0 caja/bóveda
    abrirTurno, cerrarTurno, movimientoCaja, registrarTraslado, reversoTraslado, ajusteBoveda, aprobarEventoCaja, recalcBoveda,
};
