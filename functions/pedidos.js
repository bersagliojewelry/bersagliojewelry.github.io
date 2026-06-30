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
const { defineSecret } = require('firebase-functions/params');
const { getFirestore } = require('firebase-admin/firestore');
const { crearPedidoCore, confirmarPagoCore, anularPedidoCore, cierreCajaCore, iniciarPagoWebCore, confirmarPagoWompiCore, liberarReservasVencidasCore, PedidoError } = require('./pedidos-core');

const VENTAS = ['owner', 'admin', 'catalogo'];

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

const crearPedido = onCall({ region: 'us-central1', invoker: 'public' }, async (request) => {
    const db = getFirestore();
    await rolDeVentas(db, request.auth);
    try {
        return await crearPedidoCore(db, { ...(request.data || {}), autor: request.auth.uid });
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

// iniciarPagoWeb (Wompi F2): el cliente PÚBLICO (sin login) inicia el cobro de una pieza.
// NO lleva check de rol (lo llama el comprador, no Kary); la robustez vive en el core (elegibilidad,
// tope $2.5M, total+firma server-side). ⚠️ Anti-abuso (App Check/rate-limit) = hardening 2c (TODO-14).
const iniciarPagoWeb = onCall({ region: 'us-central1', invoker: 'public', secrets: [WOMPI_INTEGRITY_SECRET] }, async (request) => {
    const db = getFirestore();
    try {
        const d = request.data || {};
        const res = await iniciarPagoWebCore(db, { pedidoId: d.pedidoId, pieceId: d.pieceId, shipping: d.shipping, habeas: d.habeas }, {
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
            // Wompi por referencia (= pedidoId). ⚠️ confirmar el endpoint exacto en sandbox (gate live).
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
    },
);

module.exports = { crearPedido, confirmarPago, anularPedido, cierreCaja, iniciarPagoWeb, confirmarPagoWompi, liberarReservasVencidas };
