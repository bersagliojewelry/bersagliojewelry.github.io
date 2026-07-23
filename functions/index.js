/**
 * Bersaglio Jewelry — Cloud Functions
 *
 * Firebase Cloud Functions for backend operations:
 * - User creation with role assignment
 * - Inquiry notification emails
 * - Image cleanup on piece deletion
 */

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { onDocumentDeleted, onDocumentWritten } = require('firebase-functions/v2/firestore');
const { initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { getStorage } = require('firebase-admin/storage');
const { computeSaldo } = require('./saldo');

initializeApp();

const db = getFirestore();
const ROLE_LEVEL = { owner: 3, admin: 2, editor: 1, catalogo: 0 };

// ─── Helper: verify caller has minimum role ─────────────────────────────────
// F6 frente B (RBAC claims): el rol viaja como CUSTOM CLAIM en el token → cero
// lecturas de Firestore por chequeo. Fallback dual a users/{uid} durante la
// transición (usuario sin backfill o claim aún no propagado al token, ≤1h).
// Deprecar el fallback a +30 días del backfill (ver ADR §65).

async function verifyRole(auth, minRole) {
    if (!auth) throw new HttpsError('unauthenticated', 'Debes iniciar sesión.');
    let callerRole = typeof auth.token?.role === 'string' ? auth.token.role : null;
    let callerData = null;
    if (!callerRole) {
        const snap = await db.collection('users').doc(auth.uid).get();
        if (!snap.exists) throw new HttpsError('permission-denied', 'Usuario no registrado.');
        callerData = snap.data();
        callerRole = callerData.role;
    }
    if ((ROLE_LEVEL[callerRole] || 0) < (ROLE_LEVEL[minRole] || 99)) {
        throw new HttpsError('permission-denied', 'No tienes permisos suficientes.');
    }
    return { callerRole, callerData };
}

// ─── syncRoleClaim (F6 frente B) ─────────────────────────────────────────────
// Trigger RECONCILIADOR Auth↔doc: users/{uid} (fuente de verdad) → custom claim
// del token + estado disabled de Auth. Cubre a TODOS los escritores (el panel
// escribe el doc DIRECTO vía auth.js, las CFs, la consola).
//
// CONVERGENTE (no usa el snapshot del evento): deriva el estado DESEADO del doc
// y lo compara con el estado REAL en Auth, escribiendo solo si difieren. Así es
// idempotente ante la entrega desordenada/at-least-once de los triggers (dos
// cambios de rol rápidos no dejan un claim viejo "pegado") y un reintento sana.
//
// `active:false` (desactivación desde el panel) ahora SÍ cierra la cuenta:
// disabled en Auth + claim retirado + refresh tokens revocados (cierra la ventana
// de privilegio retenido; el ID token vigente expira en ≤1h y ya no se renueva).

exports.syncRoleClaim = onDocumentWritten({ document: 'users/{uid}', retry: true }, async (event) => {
    const { uid } = event.params;

    const after = event.data?.after;
    const existe = after?.exists === true;
    const data = existe ? after.data() : null;
    const activo = !data || data.active !== false;            // sin doc → tratar como inactivo
    const rolDoc = data?.role;
    const rolValido = typeof rolDoc === 'string'
        && Object.prototype.hasOwnProperty.call(ROLE_LEVEL, rolDoc);

    // Estado DESEADO en Auth derivado del doc actual.
    const claimDeseado = (existe && activo && rolValido) ? rolDoc : null;
    const disabledDeseado = existe ? !activo : false;         // doc borrado: no tocamos disabled

    try {
        const user = await getAuth().getUser(uid);
        const claimActual = user.customClaims?.role ?? null;

        if (claimActual === claimDeseado && user.disabled === disabledDeseado) return; // ya converge → no-op

        await getAuth().setCustomUserClaims(uid, claimDeseado ? { role: claimDeseado } : null);
        if (existe && user.disabled !== disabledDeseado) {
            await getAuth().updateUser(uid, { disabled: disabledDeseado });
        }
        // Degradación / desactivación / pérdida de rol → cortar sesiones vigentes.
        if (claimActual && (claimDeseado === null || ROLE_LEVEL[claimDeseado] < ROLE_LEVEL[claimActual] || disabledDeseado)) {
            await getAuth().revokeRefreshTokens(uid);
        }
    } catch (err) {
        if (err?.code === 'auth/user-not-found') {
            // Doc sin usuario en Auth (uid mal tecleado / doc-antes-que-Auth, ver
            // js/auth.js createUserProfile). Se registra y se omite (no re-lanza).
            console.warn(`[syncRoleClaim] users/${uid} sin usuario en Auth — se omite`);
            try {
                await db.collection('saludEventos').doc(`claim-${uid}`).set({
                    tipo: 'sync-claim-huerfano', clienteId: null, uid,
                    error: 'doc users/ sin usuario en Auth', at: FieldValue.serverTimestamp(), resuelto: false,
                }, { merge: true });
            } catch (_) { /* best-effort */ }
            return;
        }
        throw err; // transitorio → retry:true reintenta
    }
});

// ─── createUser ─────────────────────────────────────────────────────────────
// Callable: creates a Firebase Auth user + Firestore profile.
// Only owner can call this.

// invoker:'public' = el servicio Cloud Run acepta la invocación (allUsers run.invoker);
// la SEGURIDAD real es verifyRole(owner) DENTRO. Sin esto, Cloud Run rechaza la callable
// con "request was not authenticated" ANTES de ejecutar el código (esta CF nunca se había
// invocado desde la UI → su binding nunca se concedió; lo cazaron los logs §115-fix).
exports.createUser = onCall({ region: 'us-central1', invoker: 'public' }, async (request) => {
    await verifyRole(request.auth, 'owner');

    const { email, password, displayName, role } = request.data;

    if (!email || !password || !displayName || !role) {
        throw new HttpsError('invalid-argument', 'Todos los campos son obligatorios.');
    }
    if (!['admin', 'editor', 'catalogo'].includes(role)) {
        throw new HttpsError('invalid-argument', 'Rol inválido. Usa "admin", "editor" o "catalogo".');
    }
    if (password.length < 8) {
        throw new HttpsError('invalid-argument', 'La contraseña debe tener al menos 8 caracteres.');
    }

    let userRecord;
    try {
        userRecord = await getAuth().createUser({ email, password, displayName });
    } catch (e) {
        // Errores comunes de Auth → mensaje claro (en vez de un 'internal' opaco).
        if (e?.code === 'auth/email-already-exists') throw new HttpsError('already-exists', 'Ya existe un usuario con ese correo.');
        if (e?.code === 'auth/invalid-email')        throw new HttpsError('invalid-argument', 'El correo no es válido.');
        if (e?.code === 'auth/invalid-password')     throw new HttpsError('invalid-argument', 'La contraseña no cumple los requisitos (mínimo 6 caracteres).');
        throw new HttpsError('internal', 'No se pudo crear el usuario: ' + (e?.message || String(e)));
    }

    await db.collection('users').doc(userRecord.uid).set({
        email,
        displayName,
        role,
        active: true,
        createdAt: FieldValue.serverTimestamp(),
        createdBy: request.auth.uid,
    });

    return { uid: userRecord.uid, message: `Usuario "${displayName}" creado como ${role}.` };
});

// ─── updateUserRole ─────────────────────────────────────────────────────────
// Callable: updates a user's role. Only owner can call.

exports.updateUserRole = onCall({ region: 'us-central1', invoker: 'public' }, async (request) => {
    await verifyRole(request.auth, 'owner');

    const { uid, newRole } = request.data;
    if (!uid || !newRole) throw new HttpsError('invalid-argument', 'UID y rol son obligatorios.');
    if (!['admin', 'editor', 'catalogo'].includes(newRole)) {
        throw new HttpsError('invalid-argument', 'Rol inválido.');
    }

    const targetSnap = await db.collection('users').doc(uid).get();
    if (!targetSnap.exists) throw new HttpsError('not-found', 'Usuario no encontrado.');
    if (targetSnap.data().role === 'owner') {
        throw new HttpsError('permission-denied', 'No puedes cambiar el rol del owner.');
    }

    await db.collection('users').doc(uid).update({
        role: newRole,
        updatedAt: FieldValue.serverTimestamp(),
        updatedBy: request.auth.uid,
    });

    return { message: `Rol actualizado a "${newRole}".` };
});

// ─── deactivateUser ─────────────────────────────────────────────────────────
// Callable: disables a user in Auth + sets active=false in Firestore.

exports.deactivateUser = onCall({ region: 'us-central1', invoker: 'public' }, async (request) => {
    await verifyRole(request.auth, 'owner');

    const { uid } = request.data;
    if (!uid) throw new HttpsError('invalid-argument', 'UID es obligatorio.');

    const targetSnap = await db.collection('users').doc(uid).get();
    if (!targetSnap.exists) throw new HttpsError('not-found', 'Usuario no encontrado.');
    if (targetSnap.data().role === 'owner') {
        throw new HttpsError('permission-denied', 'No puedes desactivar al owner.');
    }

    await getAuth().updateUser(uid, { disabled: true });
    await db.collection('users').doc(uid).update({
        active: false,
        deactivatedAt: FieldValue.serverTimestamp(),
        deactivatedBy: request.auth.uid,
    });

    return { message: 'Usuario desactivado.' };
});

// ─── onPieceDeleted ─────────────────────────────────────────────────────────
// Trigger: cleans up Storage images when a piece document is deleted.

exports.onPieceDeleted = onDocumentDeleted('pieces/{pieceId}', async (event) => {
    const pieceId = event.params.pieceId;
    const bucket = getStorage().bucket();
    const [files] = await bucket.getFiles({ prefix: `pieces/${pieceId}/` });

    if (files.length) {
        await Promise.all(files.map(f => f.delete()));
    }
});

// ─── onInquiryCreated ───────────────────────────────────────────────────────
// Trigger: increments unread counter when a new inquiry arrives.

const { onDocumentCreated } = require('firebase-functions/v2/firestore');

exports.onInquiryCreated = onDocumentCreated('inquiries/{inquiryId}', async (event) => {
    // Idempotente: los triggers son at-least-once. Marcamos la consulta como contada
    // DENTRO de la misma transacción que incrementa → un reintento no duplica el contador.
    const inqRef = event.data?.ref;
    if (!inqRef) return;
    const counterRef = db.collection('config').doc('counters');
    await db.runTransaction(async (tx) => {
        const snap = await tx.get(inqRef);
        if (!snap.exists || snap.get('_counted') === true) return;
        tx.update(inqRef, { _counted: true });
        tx.set(counterRef, { unreadInquiries: FieldValue.increment(1) }, { merge: true });
    });
});

// ─── recalcSaldoCliente (CRM Bloque 2) ───────────────────────────────────────
// Trigger: al crear/editar/borrar un movimiento, recalcula el saldo del cliente
// SERVER-SIDE desde la fuente de verdad (todos sus movimientos no anulados). Es la
// ÚNICA escritura de `saldoActual` (las reglas prohíben que el cliente lo escriba).
// Idempotente (recomputa desde cero) + transacción (evita carreras). No re-dispara:
// escribe en el doc del cliente, no en la subcolección de movimientos.

// ─── backupDiario (F6 / PRE-1) ───────────────────────────────────────────────
// Programada 3:00 AM Bogotá: dump completo de Firestore → Storage (backups/firestore/)
// + retención 30 días. Lógica y diseño en ./backup.js; codec puro en ./backup-codec.js.

exports.crearPedido = require('./pedidos').crearPedido;       // B1 paso 3: el único escritor de `pedidos`
exports.iniciarPagoWeb = require('./pedidos').iniciarPagoWeb; // Wompi F2: cliente público inicia cobro (reserva + firma)
exports.confirmarPago = require('./pedidos').confirmarPago;   // B1 paso 4: por_verificar → pagado ("vi la plata")
exports.confirmarPagoWompi = require('./pedidos').confirmarPagoWompi; // Wompi F2: webhook HTTP (firma+re-consulta → pagado)
exports.liberarReservasVencidas = require('./pedidos').liberarReservasVencidas; // Wompi F2: reaper (Scheduler, cada 2 min)
exports.anularPedido = require('./pedidos').anularPedido;     // B1 paso 5: VOID (reintegra la pieza)
exports.cierreCaja = require('./pedidos').cierreCaja;         // B1 paso 5: Cierre Z / arqueo del turno
exports.avanzarPedido = require('./pedidos').avanzarPedido;   // F1-CORE: transiciones post-pago por TABLA + historial
exports.alertaPedidoRevision = require('./pedidos').alertaPedidoRevision; // A.6: alerta pagado_sin_stock/a_revisar → saludEventos
// ─── F2.0 · Sesión de caja + Bóveda (wrappers; lógica en caja-core.js) ───────────────────────
exports.abrirTurno = require('./pedidos').abrirTurno;               // isCaja: abre turno (puntero singleton)
exports.cerrarTurno = require('./pedidos').cerrarTurno;             // isCaja: cierra turno (ecuación + descuadre)
exports.movimientoCaja = require('./pedidos').movimientoCaja;       // isCaja: ingreso/egreso del turno (egreso → alerta)
exports.registrarTraslado = require('./pedidos').registrarTraslado; // isCaja: traslado cajón↔bóveda↔banco (recompute)
exports.reversoTraslado = require('./pedidos').reversoTraslado;     // isCaja: reversa (nace pendiente + alerta)
exports.ajusteBoveda = require('./pedidos').ajusteBoveda;           // isCaja: ajuste faltante/sobrante (pendiente + alerta)
exports.aprobarEventoCaja = require('./pedidos').aprobarEventoCaja; // isOwner: aprueba reverso/ajuste (SoD §9.1)
exports.recalcBoveda = require('./pedidos').recalcBoveda;           // trigger: mantiene boveda/main fresco (backstop)
// F-TESORERÍA B1 (spec 2026-07-18): libro auxiliar "Cuentas y bancos" — CF única escritora (D2).
exports.crearCuentaTesoreria = require('./tesoreria').crearCuentaTesoreria;             // admin: alta de cuenta real (V22)
exports.registrarMovimientoTesoreria = require('./tesoreria').registrarMovimientoTesoreria; // admin: única puerta manual del ledger
exports.trasladarEntreCuentas = require('./tesoreria').trasladarEntreCuentas;           // admin: par atómico out+in (D3)
exports.aprobarMovimientoTesoreria = require('./tesoreria').aprobarMovimientoTesoreria; // owner: SoD retiros/ajustes (D4, V5)
exports.marcarConciliado = require('./tesoreria').marcarConciliado;                     // admin: sella el cuadre mensual (B3)
exports.reabrirCuadre = require('./tesoreria').reabrirCuadre;                           // owner: reabre un cuadre sellado (B3, V19)
exports.repararSaldoTesoreria = require('./tesoreria').repararSaldoTesoreria;           // admin: recompute forzado (patrón §64)
exports.recalcSaldoTesoreria = require('./tesoreria').recalcSaldoTesoreria;             // trigger D5: ledger → saldoActual
exports.ajustarStock = require('./inventario').ajustarStock;         // TODO-40 F1: merma/reabasto/corrección (delta + ledger)
exports.cambiarTipoPieza = require('./inventario').cambiarTipoPieza; // TODO-40 F1: transición de tipo (purga cantidad, D6)
// F2.1 · identidad del cliente (contrato legalIdKey; índice clientesPorDoc CF-only, pepper Secret Manager)
exports.resolverCliente = require('./identidad').resolverCliente;             // match exacto por documento (sugerencia web)
exports.crearClienteConDoc = require('./identidad').crearClienteConDoc;       // crea (doc opcional; reserva índice + consent)
exports.attachDocACliente = require('./identidad').attachDocACliente;         // adjunta doc a cliente (colisión→needsMerge)
exports.vincularClientePedido = require('./identidad').vincularClientePedido; // escribe pedido.clienteId + historial
exports.fusionarClientes = require('./identidad').fusionarClientes;           // owner-only: fusiona duplicados (append-only)
exports.backupDiario = require('./backup').backupDiario;

// ─── reconciliacionDiaria (F6 frente D) ──────────────────────────────────────
// Programada 3:30 AM Bogotá: recomputa el saldo de TODOS los clientes desde sus
// movimientos y lo compara contra `saldoActual` → `salud/reconciliacion` (panel
// Salud). Lógica en ./salud.js; detección pura en ./reconciliacion.js.

exports.reconciliacionDiaria = require('./salud').reconciliacionDiaria;

// Recalcula el saldo de UN cliente desde su fuente de verdad, en transacción.
// Compartida por el trigger recalcSaldoCliente y el callable repararSaldo.
async function recalcularSaldoCliente(clienteId) {
    const clienteRef = db.collection('clientes').doc(clienteId);
    const movsRef = clienteRef.collection('movimientos');
    let saldo = null;

    await db.runTransaction(async (tx) => {
        saldo = null; // reset por intento: un retry no debe heredar el saldo de un intento abortado
        const clienteSnap = await tx.get(clienteRef);
        if (!clienteSnap.exists) return; // cliente borrado → no resucitarlo

        const movsSnap = await tx.get(movsRef);
        saldo = computeSaldo(movsSnap.docs.map((d) => d.data()));

        tx.set(clienteRef, {
            saldoActual: saldo,
            saldoActualizadoEn: FieldValue.serverTimestamp(),
        }, { merge: true });
    });

    return saldo;
}

exports.recalcSaldoCliente = onDocumentWritten('clientes/{clienteId}/movimientos/{movId}', async (event) => {
    const { clienteId, movId } = event.params;
    try {
        await recalcularSaldoCliente(clienteId);
    } catch (err) {
        // F6 frente D: un fallo aquí = saldo desactualizado EN SILENCIO. Se registra
        // como evento de salud (panel) y se RE-LANZA (visible en métricas/Monitoring).
        // Id determinista por event.id → un reintento no duplica el evento.
        console.error(`[recalcSaldoCliente] FALLO clienteId=${clienteId} movId=${movId}:`, err);
        try {
            await db.collection('saludEventos').doc(`recalc-${event.id}`).set({
                tipo: 'recalc-saldo-error',
                clienteId,
                movId,
                error: String(err?.message || err),
                at: FieldValue.serverTimestamp(),
                resuelto: false,
            });
        } catch (err2) {
            console.error('[recalcSaldoCliente] no se pudo registrar el evento de salud:', err2);
        }
        throw err;
    }
});

// ─── corteMensual (Fase M · M4 §69 PR1) ──────────────────────────────────────
// Programada (día 1, 03:50 Bogotá): foto INMUTABLE del aging del mes que cierra
// → cortes/{YYYY-MM} (write:false al cliente). Lógica en ./corte.js.

exports.corteMensual = require('./corte').corteMensual;

// Callable de RESPALDO (owner-only): genera el corte del mes anterior si el
// scheduler falló. Inmutable igual: si ya existe, NO se reescribe.
exports.generarCorte = onCall({ region: 'us-central1', timeoutSeconds: 300 }, async (request) => {
    await verifyRole(request.auth, 'owner');
    const corte = require('./corte');
    return corte.runCorte(db, corte.mesAnterior(), 'manual');
});

// ─── reconciliarCartera (F6 frente D) ────────────────────────────────────────
// Callable: corre la reconciliación completa bajo demanda (botón "Reconciliar
// ahora" de la vista Salud). Solo admin/owner.

exports.reconciliarCartera = onCall({ region: 'us-central1', timeoutSeconds: 300 }, async (request) => {
    await verifyRole(request.auth, 'admin');
    return require('./salud').runReconciliacion(db, 'manual');
});

// ─── repararSaldo (F6 frente D) ──────────────────────────────────────────────
// Callable: recomputa el saldo de UN cliente con la MISMA transacción que el
// trigger (idempotente) — el botón "Reparar" de la vista Salud ante un descuadre.

exports.repararSaldo = onCall({ region: 'us-central1' }, async (request) => {
    await verifyRole(request.auth, 'admin');

    const { clienteId } = request.data || {};
    // Sin '/': un id con barras resolvería a OTRO documento bajo clientes/** vía el
    // Admin SDK (inyección de ruta) y violaría el append-only de movimientos.
    if (typeof clienteId !== 'string' || !clienteId.trim() || clienteId.includes('/')) {
        throw new HttpsError('invalid-argument', 'clienteId inválido.');
    }
    const id = clienteId.trim();

    const saldo = await recalcularSaldoCliente(id);
    if (saldo === null) throw new HttpsError('not-found', 'El cliente no existe.');

    // El saldo quedó cuadrado → los fallos de recálculo ABIERTOS de este cliente ya
    // no son accionables: se auto-resuelven (queda constancia de quién/cómo). Solo
    // filtros de IGUALDAD → no exige índice compuesto. Best-effort: si falla, la
    // reparación sigue siendo válida.
    try {
        const abiertos = await db.collection('saludEventos')
            .where('clienteId', '==', id).where('resuelto', '==', false).get();
        await Promise.all(abiertos.docs.map((d) => d.ref.update({
            resuelto: true,
            resueltoEn: FieldValue.serverTimestamp(),
            resueltoPor: `auto:repararSaldo (${request.auth.uid})`,
        })));
    } catch (err) {
        console.error('[repararSaldo] saldo reparado pero no se pudieron auto-resolver eventos:', err);
    }

    return { clienteId: id, saldo };
});
