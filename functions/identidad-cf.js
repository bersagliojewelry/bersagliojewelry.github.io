/**
 * Bersaglio ERP — CORES de identidad del cliente (F2.1). Tocan Firestore pero NO importan
 * firebase-functions → testeables contra el emulador (patrón `pedidos-core.js`). Los wrappers
 * `onCall` (auth + secreto pepper) viven en `identidad.js`.
 *
 * Contrato + racional del comité ×3 → spec `2026-07-07-f2-1-vinculo-cliente-DISENO.md`. Puntos duros:
 *  - Toda mutación de identidad = UNA `runTransaction` (comité seguridad: dos escrituras → crash a
 *    mitad = duplicado). El índice `clientesPorDoc/{docHash}` se lee como CANDADO.
 *  - Persona posee N documentos (`docKeys[]`), NO 1-clave=1-persona (comité arq FATAL-1).
 *  - Colisión al crear → devuelve el existente (no falla); al hacer attach a otro → `needsMerge`.
 *  - El dedup BLANDO por teléfono/nombre es CLIENT-SIDE (la UI ya tiene los clientes cargados →
 *    O(1) instantáneo); aquí el servidor solo hace el match EXACTO por hash (autoridad) + reserva.
 *  - Documento exige consentimiento (Habeas Data, comité seguridad §1.7).
 */

'use strict';
const { FieldValue } = require('firebase-admin/firestore');
const { docKeyAndHash } = require('./identidad-core');

class IdentidadError extends Error {
    constructor(code, message) { super(message); this.code = code; this.name = 'IdentidadError'; }
}

// dayKey LOCAL Bogotá (UTC-5) — espejo de pedidos-core.js (L-30).
const dayKeyBogota = (ms = Date.now()) => new Date(ms - 5 * 3600e3).toISOString().slice(0, 10);

// Consentimiento válido para persistir un documento (Ley 1581). `granted:true` + method (canal).
// El `capturedBy` lo sella el wrapper con el uid del autor (Kary/owner).
function consentValido(c) {
    return !!c && c.granted === true && typeof c.method === 'string' && c.method.length > 0;
}

// Sello de consentimiento persistido (evidencia Habeas Data, comité seguridad UI). serverTimestamp
// lo pone el caller (`now`). Registra la PRUEBA reconstruible: versión de política + finalidades +
// canal + quién lo capturó — sin esto, la autorización "informada" no se puede probar después.
function selloConsent(consent, autor, now) {
    return {
        granted: true,
        method: consent.method,
        canal: typeof consent.canal === 'string' && consent.canal ? consent.canal : 'mostrador_POS',
        policyVersion: consent.policyVersion || null,
        finalidades: Array.isArray(consent.finalidades) ? consent.finalidades : [],
        capturedBy: autor || null,
        at: now,
    };
}

/**
 * Match EXACTO por documento (O(1) vía índice de reserva). Read-only. Úsalo para la sugerencia
 * de match del pedido web (normaliza `shipping.docType+docNumber` → clienteId) y para confirmar
 * antes de crear. El dedup blando (teléfono/nombre) NO va aquí — es client-side.
 * @returns {Promise<{ match: {clienteId, nombre}|null, legalIdKey: string|null }>}
 */
async function resolverClienteCore(db, input, pepper) {
    const dk = (input && input.docType && input.docNumber) ? docKeyAndHash(input.docType, input.docNumber, pepper) : null;
    if (!dk) return { match: null, legalIdKey: null };
    const idxSnap = await db.doc(`clientesPorDoc/${dk.docHash}`).get();
    if (!idxSnap.exists) return { match: null, legalIdKey: dk.legalIdKey };
    const clienteId = idxSnap.data().clienteId;
    const cliSnap = await db.collection('clientes').doc(clienteId).get();
    if (!cliSnap.exists || cliSnap.data().activo === false) return { match: null, legalIdKey: dk.legalIdKey };
    return { match: { clienteId, nombre: cliSnap.data().nombre || null }, legalIdKey: dk.legalIdKey };
}

/**
 * Crea un cliente. Documento OPCIONAL (comité arq: un solo camino de creación limpio):
 *  - CON documento → reserva transaccional en el índice; colisión = devuelve el existente
 *    (NO crea, NO falla); exige consentimiento.
 *  - SIN documento → crea con nombre + teléfono (el dedup blando lo previno en la UI).
 * Siembra las reservas del portal F5 (`authUid:null`, `contacto.contactVerified:false`).
 * @returns {Promise<{clienteId, yaExistia:boolean}>}
 */
async function crearClienteConDocCore(db, input, pepper) {
    const nombre = String(input.nombre || '').trim();
    if (!nombre) throw new IdentidadError('invalid-argument', 'El nombre del cliente es obligatorio.');

    const tieneDoc = !!(input.docType || input.docNumber);
    const dk = tieneDoc ? docKeyAndHash(input.docType, input.docNumber, pepper) : null;
    if (tieneDoc && !dk) throw new IdentidadError('invalid-argument', 'El documento es inválido (revisa tipo y número).');
    if (dk && !consentValido(input.consent)) {
        throw new IdentidadError('failed-precondition', 'Falta la autorización de tratamiento de datos (Habeas Data) para guardar el documento.');
    }

    const telefono = input.telefono ? String(input.telefono).trim() : null;
    const whatsapp = input.whatsapp ? String(input.whatsapp).trim() : null;
    const email = input.email ? String(input.email).trim() : null;

    return db.runTransaction(async (tx) => {
        let idxRef = null;
        if (dk) {
            idxRef = db.doc(`clientesPorDoc/${dk.docHash}`);
            const idxSnap = await tx.get(idxRef);
            if (idxSnap.exists) {
                // Colisión: el documento ya es de un cliente → devolver el existente (previene el duplicado).
                return { clienteId: idxSnap.data().clienteId, yaExistia: true };
            }
        }
        const cliRef = db.collection('clientes').doc();
        const now = FieldValue.serverTimestamp();
        const doc = {
            nombre,
            ...(telefono ? { telefono } : {}),
            ...(whatsapp ? { whatsapp } : {}),
            ...(input.vendedoraId ? { vendedoraId: input.vendedoraId } : {}),
            origen: input.origen || 'pos',            // creado desde el flujo POS/pedido
            activo: true,
            // Reservas del contrato F5 (hoy vacías; F5 exigirá prueba de posesión sobre `contacto`).
            authUid: null,
            contacto: { telefono, email, contactVerified: false },
            createdAt: now,
        };
        if (dk) {
            doc.legalIdKey = dk.legalIdKey;
            doc.docKeys = [dk.legalIdKey];
            doc.normVersion = dk.normVersion;
        }
        tx.set(cliRef, doc);
        if (dk) {
            tx.set(idxRef, {
                clienteId: cliRef.id,
                docType: input.docType,
                normVersion: dk.normVersion,
                capturedAt: now,
                capturedBy: input.autor || null,
                consent: selloConsent(input.consent, input.autor, now),
            });
        }
        return { clienteId: cliRef.id, yaExistia: false };
    });
}

/**
 * Adjunta un documento a un cliente YA existente (p.ej. Kary completa la cédula de "Doña Marta").
 * Transaccional. Colisión con OTRO cliente → `{needsMerge, otherClienteId}` (no rompe). Idempotente
 * si el documento ya es de este mismo cliente. Exige consentimiento.
 * @returns {Promise<{clienteId, attached?:boolean, yaExistia?:boolean, needsMerge?:boolean, otherClienteId?:string}>}
 */
async function attachDocAClienteCore(db, input, pepper) {
    const dk = docKeyAndHash(input.docType, input.docNumber, pepper);
    if (!dk) throw new IdentidadError('invalid-argument', 'El documento es inválido (revisa tipo y número).');
    if (!consentValido(input.consent)) {
        throw new IdentidadError('failed-precondition', 'Falta la autorización de tratamiento de datos (Habeas Data).');
    }
    const cliRef = db.collection('clientes').doc(input.clienteId);
    const idxRef = db.doc(`clientesPorDoc/${dk.docHash}`);

    return db.runTransaction(async (tx) => {
        const cliSnap = await tx.get(cliRef);
        if (!cliSnap.exists) throw new IdentidadError('not-found', 'El cliente no existe.');
        if (cliSnap.data().activo === false) throw new IdentidadError('failed-precondition', 'Ese cliente está inactivo (fue fusionado).');
        const idxSnap = await tx.get(idxRef);
        if (idxSnap.exists) {
            const owner = idxSnap.data().clienteId;
            if (owner === input.clienteId) return { clienteId: owner, yaExistia: true };   // idempotente
            return { clienteId: input.clienteId, needsMerge: true, otherClienteId: owner };  // el doc es de OTRO
        }
        const now = FieldValue.serverTimestamp();
        const yaTeniaPrimary = !!cliSnap.data().legalIdKey;
        tx.update(cliRef, {
            docKeys: FieldValue.arrayUnion(dk.legalIdKey),
            ...(yaTeniaPrimary ? {} : { legalIdKey: dk.legalIdKey, normVersion: dk.normVersion }),
            updatedAt: now,
        });
        tx.set(idxRef, {
            clienteId: input.clienteId,
            docType: input.docType,
            normVersion: dk.normVersion,
            capturedAt: now,
            capturedBy: input.autor || null,
            consent: selloConsent(input.consent, input.autor, now),
        });
        return { clienteId: input.clienteId, attached: true };
    });
}

/**
 * Vincula un pedido a un cliente. `pedido.clienteId` es CF-only; deja traza append-only en
 * `pedidos/{id}/historial` (tipo `vinculo_cliente`, NO es transición de estado → sin de/a de
 * la máquina). Re-vincular = asiento nuevo (anular≠borrar). Idempotente si ya está vinculado.
 * @returns {Promise<{pedidoId, clienteId, previo?:(string|null), yaVinculado?:boolean}>}
 */
async function vincularClientePedidoCore(db, input, opts = {}) {
    if (!input.pedidoId || !input.clienteId) throw new IdentidadError('invalid-argument', 'pedidoId y clienteId son obligatorios.');
    const pedRef = db.collection('pedidos').doc(input.pedidoId);
    const cliRef = db.collection('clientes').doc(input.clienteId);

    return db.runTransaction(async (tx) => {
        const pedSnap = await tx.get(pedRef);
        if (!pedSnap.exists) throw new IdentidadError('not-found', 'El pedido no existe.');
        const cliSnap = await tx.get(cliRef);
        if (!cliSnap.exists) throw new IdentidadError('not-found', 'El cliente no existe.');
        if (cliSnap.data().activo === false) throw new IdentidadError('failed-precondition', 'Ese cliente está inactivo (fue fusionado).');

        const previo = pedSnap.data().clienteId || null;
        if (previo === input.clienteId) return { pedidoId: input.pedidoId, clienteId: input.clienteId, yaVinculado: true };

        const now = FieldValue.serverTimestamp();
        tx.update(pedRef, { clienteId: input.clienteId });
        tx.set(pedRef.collection('historial').doc(), {
            tipo: 'vinculo_cliente',
            clienteId: input.clienteId,
            clienteIdPrevio: previo,
            autor: input.autor || null,
            nota: previo ? 're-vínculo de cliente' : 'vínculo de cliente',
            at: now,
            dayKey: dayKeyBogota(Number.isFinite(opts.nowMs) ? opts.nowMs : Date.now()),
        });
        return { pedidoId: input.pedidoId, clienteId: input.clienteId, previo };
    });
}

/**
 * Fusiona dos clientes duplicados (mismo humano) — OWNER-only (SoD). Append-only:
 *  - re-apunta los `pedidos` del absorbido al superviviente (+ traza en cada uno),
 *  - re-mapea las entradas de `clientesPorDoc` del absorbido al superviviente,
 *  - une `docKeys`,
 *  - marca el absorbido `activo:false, fusionadoEn:{intoId, at, by}` (anular≠borrar).
 * V1 (comité: merge de cartera diferido): si el absorbido tiene movimientos NO anulados,
 * ABORTA con `needsCarteraMerge` (el owner mueve la cartera a mano antes) — nunca pierde plata.
 * Usa un batch atómico (≤500 ops; a este volumen sobra).
 * @returns {Promise<{intoId, fromId, pedidosMovidos, docsMovidos}|{needsCarteraMerge:true}>}
 */
async function fusionarClientesCore(db, input, opts = {}) {
    const { fromId, intoId, autor } = input;
    if (!fromId || !intoId) throw new IdentidadError('invalid-argument', 'fromId e intoId son obligatorios.');
    if (fromId === intoId) throw new IdentidadError('invalid-argument', 'No se puede fusionar un cliente consigo mismo.');

    const [fromSnap, intoSnap] = await Promise.all([
        db.collection('clientes').doc(fromId).get(),
        db.collection('clientes').doc(intoId).get(),
    ]);
    if (!fromSnap.exists) throw new IdentidadError('not-found', 'El cliente a fusionar (absorbido) no existe.');
    if (!intoSnap.exists) throw new IdentidadError('not-found', 'El cliente destino no existe.');
    if (fromSnap.data().activo === false) throw new IdentidadError('failed-precondition', 'El cliente absorbido ya está inactivo.');

    // Guarda de cartera (V1): no movemos movimientos automáticamente (comité: diferido).
    const movsSnap = await db.collection('clientes').doc(fromId).collection('movimientos').get();
    const tieneCartera = movsSnap.docs.some((d) => d.data().anulado !== true);
    if (tieneCartera) return { needsCarteraMerge: true, fromId, intoId };

    const [pedSnap, idxSnap] = await Promise.all([
        db.collection('pedidos').where('clienteId', '==', fromId).get(),
        db.collection('clientesPorDoc').where('clienteId', '==', fromId).get(),
    ]);

    const now = FieldValue.serverTimestamp();
    const dayKey = dayKeyBogota(Number.isFinite(opts.nowMs) ? opts.nowMs : Date.now());
    const batch = db.batch();

    for (const pedDoc of pedSnap.docs) {
        batch.update(pedDoc.ref, { clienteId: intoId });
        batch.set(pedDoc.ref.collection('historial').doc(), {
            tipo: 'vinculo_cliente', clienteId: intoId, clienteIdPrevio: fromId,
            autor: autor || null, nota: `fusión de clientes (${fromId}→${intoId})`, at: now, dayKey,
        });
    }
    for (const idxDoc of idxSnap.docs) {
        batch.update(idxDoc.ref, { clienteId: intoId, remapeadoDe: fromId, remapeadoAt: now });
    }
    // Unir las claves de documento del absorbido en el superviviente.
    const fromKeys = Array.isArray(fromSnap.data().docKeys) ? fromSnap.data().docKeys : [];
    if (fromKeys.length) batch.update(intoSnap.ref, { docKeys: FieldValue.arrayUnion(...fromKeys), updatedAt: now });
    // Marcar el absorbido inactivo (anular≠borrar).
    batch.update(fromSnap.ref, { activo: false, fusionadoEn: { intoId, at: now, by: autor || null } });

    await batch.commit();
    return { intoId, fromId, pedidosMovidos: pedSnap.size, docsMovidos: idxSnap.size };
}

module.exports = {
    IdentidadError,
    consentValido,
    resolverClienteCore,
    crearClienteConDocCore,
    attachDocAClienteCore,
    vincularClientePedidoCore,
    fusionarClientesCore,
};
