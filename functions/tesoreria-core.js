/**
 * F-TESORERÍA (B0) — núcleo PURO de tesorería: fórmula de saldo por recompute (D5),
 * constantes del modelo de datos y seed ESTRUCTURAL de las 2 cuentas virtuales.
 * SSoT del diseño: docs/superpowers/specs/2026-07-18-f-tesoreria-DISENO.md
 *   (§0.5 D1-D5 · §1 modelo · §0.6 V1/V3 · §0.7 V20 · §0.8 V21). [OPUS-4.8] interinato #4.
 *
 * PURO POR DISEÑO (invariante 2 «mismo número en todas las vistas», auditoria-financiera):
 * `computeSaldoCuenta` y sus ayudantes NO importan firebase-admin ni ningún módulo de
 * servidor → pueden espejarse en el cliente (js/admin/tesoreria-format.js, B1) para el test
 * de paridad (patrón aging-paridad §5.8). La única pata que toca la BD es `seedCuentasVirtuales`,
 * y su dependencia de firebase-admin va LAZY (dentro de la función), fuera del camino puro.
 *
 * Invariantes de dinero fijados aquí:
 *  #1 CONSERVACIÓN — el signo lo da el TIPO (SIGNO_TESORERIA); `ajuste_conciliacion` por su
 *     `direccion` explícita (V3); `ajuste_inverso` = −signo(tipo del ref) (V3; no se reversa un reverso).
 *  #7 ANOMALÍA QUE GRITA — un tipo sin signo, una `direccion` inválida o un ref irresoluble
 *     LANZAN (fail-red), jamás devuelven un saldo silenciosamente malo (nada de `|| 0` que esconda).
 *  Plata FIRME: los movimientos `pendiente_aprobacion` / `rechazado` NO cuentan al saldo (D4).
 */

// Signo firmado por tipo de movimiento. Entradas +1, salidas −1. §1 modelo + V1 (consignacion_in /
// retiro_efectivo_out, patas bancarias de bóveda↔banco) + V20 (retira `servicio_publico` → `gasto`).
const SIGNO_TESORERIA = Object.freeze({
    ingreso_venta: 1, abono_cartera: 1, traslado_in: 1, aporte_socia: 1, consignacion_in: 1,
    pago_proveedor: -1, gasto: -1, traslado_out: -1,
    reembolso_socia: -1, retiro_socia: -1, retiro_efectivo_out: -1,
});
// Los dos tipos SIN signo fijo lo derivan de otro campo: `ajuste_conciliacion` (direccion),
// `ajuste_inverso` (signo del ref). Van aparte del mapa a propósito.
const TIPOS_DERIVADOS = Object.freeze(['ajuste_conciliacion', 'ajuste_inverso']);
const TIPOS_MOV = Object.freeze([...Object.keys(SIGNO_TESORERIA), ...TIPOS_DERIVADOS]);

const TIPOS_CUENTA = Object.freeze(['banco', 'nequi', 'caja', 'boveda']);
const TIPOS_VIRTUALES = Object.freeze(['caja', 'boveda']);   // sin saldoInicial/ledger propio (D1)
const TITULARES = Object.freeze(['empresa', 'kary', 'daniela', 'veronica']);

// 'anulado' (D9): lo sella la CF del abono cuando se anula el abono que originó la pata —
// append-only (no se borra) y el recompute solo suma 'activo', así que deja de contar solo.
// Distinto de 'rechazado', que significa "el dueño lo negó" en el flujo de aprobación.
const ESTADOS_MOV = Object.freeze(['activo', 'pendiente_aprobacion', 'rechazado', 'anulado']);
// Nacen `pendiente_aprobacion` (D4 + V2 + V3): toda plata que sale a una socia o toca el saldo por
// ajuste pide firma del owner antes de contar.
const TIPOS_PENDIENTES = Object.freeze(['retiro_socia', 'reembolso_socia', 'ajuste_inverso', 'ajuste_conciliacion']);
// `gasto`: categoria OBLIGATORIA de lista CERRADA (V7 + V20). `pago_proveedor` = COSTO DE VENTA
// (tipo aparte, para el margen bruto de F-REPORTES) — NO lleva categoria.
const CATEGORIAS_GASTO = Object.freeze(['gmf', 'comision_bancaria', 'comision_pasarela', 'arriendo',
    'nomina', 'servicios_publicos', 'papeleria', 'otros']);
const DIRECCIONES = Object.freeze(['entrada', 'salida']);   // solo `ajuste_conciliacion` (V3)

// Error de dominio local (el núcleo es admin-free → no reusa PedidoError, que arrastra firebase-admin).
// Los wrappers onCall de B1 (tesoreria.js) mapearán `.code` a HttpsError, patrón caja/pedidos.
class TesoreriaError extends Error {
    constructor(code, message) { super(message); this.name = 'TesoreriaError'; this.code = code; }
}

// Entero-COP seguro (T-3: pesos SIN centavos). Desenvuelve {monto:int} o acepta int desnudo.
// Admin-free → espejable byte-a-byte en el cliente.
function entero(v) {
    const n = (v !== null && typeof v === 'object') ? v.monto : v;
    const i = Math.trunc(Number(n));
    return Number.isFinite(i) ? i : 0;
}

// Signo firmado de UN movimiento (autoridad del recompute). `byId` (mapa opId→mov) resuelve el
// `refDocumento` del `ajuste_inverso`. Fail-red ante datos malformados (invariante #7).
function signoDeMovimiento(mov, byId, _depth = 0) {
    const tipo = mov && mov.tipo;
    if (tipo === 'ajuste_conciliacion') {
        if (mov.direccion === 'entrada') return 1;
        if (mov.direccion === 'salida') return -1;
        throw new TesoreriaError('invalid-argument',
            `ajuste_conciliacion exige direccion entrada|salida (mov ${mov.id}).`);
    }
    if (tipo === 'ajuste_inverso') {
        if (_depth > 0) throw new TesoreriaError('failed-precondition', 'No se puede reversar un ajuste_inverso.');
        const ref = byId ? byId[mov.refDocumento] : undefined;
        if (!ref) throw new TesoreriaError('failed-precondition',
            `ajuste_inverso con refDocumento irresoluble: ${mov.refDocumento}.`);
        return -signoDeMovimiento(ref, byId, _depth + 1);
    }
    const s = SIGNO_TESORERIA[tipo];
    if (s === undefined) throw new TesoreriaError('invalid-argument', `tipo de movimiento sin signo definido: ${tipo}.`);
    return s;
}

/**
 * Saldo de una cuenta REAL por RECOMPUTE (D5, autoridad server-side). PURA e idempotente.
 * `saldoInicial` y cada `mov.monto` son {monto:int} o int. Solo cuentan los movimientos FIRMES
 * (estado 'activo'); `pendiente_aprobacion`/`rechazado` no. El resultado PUEDE ser negativo
 * (V6 lo GRITA en rojo; jamás se clampa aquí).
 * @param {{monto:number}|number} saldoInicial
 * @param {Array<{id?:string,tipo:string,monto:any,estado?:string,direccion?:string,refDocumento?:string}>} movs
 * @returns {number} saldo en COP (entero, con signo)
 */
function computeSaldoCuenta(saldoInicial, movs) {
    const base = entero(saldoInicial);
    const lista = Array.isArray(movs) ? movs : [];
    const byId = {};
    for (const m of lista) { if (m && m.id != null) byId[m.id] = m; }
    let suma = 0;
    for (const m of lista) {
        if (!m) continue;
        if ((m.estado || 'activo') !== 'activo') continue;   // plata firme: pendiente/rechazado NO cuentan (D4)
        suma += signoDeMovimiento(m, byId) * entero(m.monto);
    }
    return base + suma;
}

/**
 * Seed ESTRUCTURAL de las 2 cuentas virtuales (§0.8 V21: es el ÚNICO seed permitido; las cuentas
 * REALES las crea Kary por la UI al recibir la plataforma). Idempotente (create-if-not-exists) →
 * seguro de re-correr en cada deploy. Corre con Admin SDK (ignora las reglas write:false).
 * Las virtuales NO llevan saldoInicial/fechaCorte/saldoActual: la vista consolidada LEE sus módulos
 * existentes (Caja = ecuación del turno · Bóveda = su saldo) — cero doble asiento (D1).
 * @param db Firestore (admin). @returns {Promise<{creadas:string[]}>}
 */
async function seedCuentasVirtuales(db) {
    const { FieldValue } = require('firebase-admin/firestore');   // LAZY: fuera del camino puro
    const VIRTUALES = [
        { id: 'caja',   nombre: 'Caja (efectivo del mostrador)', tipo: 'caja' },
        { id: 'boveda', nombre: 'Bóveda',                         tipo: 'boveda' },
    ];
    const creadas = [];
    for (const v of VIRTUALES) {
        const ref = db.doc(`cuentasTesoreria/${v.id}`);
        const snap = await ref.get();
        if (snap.exists) continue;                                // idempotente: nunca pisa datos
        await ref.set({
            nombre: v.nombre, banco: null, tipo: v.tipo, titular: 'empresa',
            esDeSocia: false, activa: true,
            creadoPor: { uid: null, nombre: 'seed B0 (F-TESORERÍA)', fuente: 'SISTEMA' },   // T-7 sello de actor
            creadoEn: FieldValue.serverTimestamp(),
        });
        creadas.push(v.id);
    }
    return { creadas };
}

// ═══ B1 · Núcleo de dinero: cores transaccionales (CFs 1-6, §2) ═══════════════════════════════
// Corren con Admin SDK (ignoran reglas write:false) dentro de runTransaction. FieldValue va LAZY
// (require dentro de cada core) para que la SECCIÓN PURA de arriba siga import-safe en node puro
// y espejable en el cliente (js/admin/tesoreria-format.js, paridad §5.8). Patrón caja-core.

// Tipos que JAMÁS entran por registrar: traslados (CF 3) y las patas bancarias de bóveda↔banco
// (las escribe la CF de bóveda en B5, V1/V18). `abono_cartera` solo con fuente SISTEMA (V12/D9).
const TIPOS_SOLO_SISTEMA = Object.freeze(['traslado_in', 'traslado_out', 'consignacion_in', 'retiro_efectivo_out']);
const SOCIAS = Object.freeze(['kary', 'daniela', 'veronica']);
const TIPOS_SOCIA = Object.freeze(['aporte_socia', 'reembolso_socia', 'retiro_socia']);

// Guard duro de montos (patrón caja-core §8.3): entero seguro y positivo, SIN coacción.
function guardMonto(monto) {
    const n = (monto !== null && typeof monto === 'object') ? monto.monto : monto;
    if (!Number.isSafeInteger(n) || n <= 0) {
        throw new TesoreriaError('invalid-argument', 'El monto debe ser un entero positivo (pesos COP sin centavos).');
    }
    return n;
}
function guardFechaISO(f, campo = 'fecha') {
    if (typeof f !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(f)) {
        throw new TesoreriaError('invalid-argument', `${campo} debe ser 'YYYY-MM-DD'.`);
    }
    return f;
}

/**
 * CF 1 · Crea una cuenta REAL (banco/nequi). Las virtuales SOLO nacen por seed B0 (D1/V21).
 * Idempotente por opId (= id del doc, create-if-not-exists). saldoActual arranca = saldoInicial
 * (recompute base con 0 movimientos). V22: el soporte del corte (foto del extracto) entra AQUÍ.
 * @param db Firestore (admin). @param input { opId, nombre, banco?, tipo, titular, esDeSocia?,
 *   saldoInicial, fechaCorte, soporteCorteURL?, autor }
 */
async function crearCuentaTesoreriaCore(db, input = {}) {
    const { FieldValue } = require('firebase-admin/firestore');
    const opId = String(input.opId || '').trim();
    if (!opId) throw new TesoreriaError('invalid-argument', 'opId es obligatorio.');
    const nombre = String(input.nombre || '').trim();
    if (!nombre) throw new TesoreriaError('invalid-argument', 'La cuenta necesita un nombre para reconocerla.');
    if (input.tipo !== 'banco' && input.tipo !== 'nequi') {
        throw new TesoreriaError('invalid-argument', 'tipo de cuenta inválido (banco|nequi). Caja y Bóveda ya existen como virtuales.');
    }
    if (!TITULARES.includes(input.titular)) throw new TesoreriaError('invalid-argument', `titular inválido: ${input.titular}.`);
    const saldoInicialN = (() => {                          // ≥ 0 permitido (cuenta que arranca en ceros)
        const n = entero(input.saldoInicial);
        const raw = (input.saldoInicial !== null && typeof input.saldoInicial === 'object') ? input.saldoInicial.monto : input.saldoInicial;
        if (!Number.isSafeInteger(raw) || raw < 0) throw new TesoreriaError('invalid-argument', 'saldoInicial debe ser un entero ≥ 0 (COP sin centavos).');
        return n;
    })();
    guardFechaISO(input.fechaCorte, 'fechaCorte');

    return db.runTransaction(async (tx) => {
        const ref = db.doc(`cuentasTesoreria/${opId}`);
        const snap = await tx.get(ref);
        if (snap.exists) return { cuentaId: opId, yaExistia: true };
        const doc = {
            nombre, banco: input.banco ? String(input.banco).slice(0, 80) : null,
            tipo: input.tipo, titular: input.titular,
            esDeSocia: input.esDeSocia === true, activa: true,
            saldoInicial: { monto: saldoInicialN, moneda: 'COP' },
            fechaCorte: input.fechaCorte,
            saldoActual: { monto: saldoInicialN, moneda: 'COP' },   // base del recompute (0 movs)
            creadoPor: input.autor || null, creadoEn: FieldValue.serverTimestamp(),
        };
        if (input.soporteCorteURL) doc.soporteCorteURL = String(input.soporteCorteURL).slice(0, 1000);
        tx.set(ref, doc);
        return { cuentaId: opId, yaExistia: false };
    });
}

/**
 * CF 2 · Registra UN movimiento en el ledger (D2: única puerta de escritura manual).
 * Idempotente por opId. Valida: cuenta activa y NO virtual (D1) · fecha ≥ fechaCorte (V10) ·
 * tipos de sistema rechazados (V12/V14) · gasto con categoría cerrada (V7/V20) · contraparte
 * obligatoria en egresos deducibles (V8) y en tipos de socia · ajuste_inverso amarrado a su ref
 * (V3: existe, misma cuenta, ACTIVO, mismo monto, sin otro inverso vivo — cierra la costura de
 * la auditoría del titular) · ajuste_conciliacion con direccion (V3) · reembolso ≤ aporte de la
 * socia o el asiento GRITA excedeAporte (V2, aviso no bloqueo). Nacen pendientes: TIPOS_PENDIENTES.
 * @param db Firestore (admin). @param input { opId, cuentaId, tipo, monto, fecha, descripcion?,
 *   soporteURL?, contraparte?, categoria?, direccion?, refDocumento?, fuente?, autor }
 */
async function registrarMovimientoTesoreriaCore(db, input = {}) {
    const { FieldValue } = require('firebase-admin/firestore');
    const opId = String(input.opId || '').trim();
    const cuentaId = String(input.cuentaId || '').trim();
    const tipo = input.tipo;
    if (!opId || !cuentaId) throw new TesoreriaError('invalid-argument', 'opId y cuentaId son obligatorios.');
    if (!TIPOS_MOV.includes(tipo)) throw new TesoreriaError('invalid-argument', `tipo de movimiento inválido: ${tipo}.`);
    if (TIPOS_SOLO_SISTEMA.includes(tipo)) {
        const msj = tipo.startsWith('traslado')
            ? 'Los traslados se registran con "Trasladar entre cuentas".'
            : 'Las consignaciones y retiros de efectivo se registran desde el módulo de Bóveda.';
        throw new TesoreriaError('failed-precondition', msj);
    }
    const fuente = input.fuente === 'SISTEMA' ? 'SISTEMA' : 'MANUAL';
    if (tipo === 'abono_cartera' && fuente !== 'SISTEMA') {   // V12: una sola puerta (la CF del abono, D9/B5)
        throw new TesoreriaError('failed-precondition', 'Los abonos de clienta entran solos desde el CRM al registrar el abono — no se digitan aquí.');
    }
    const monto = guardMonto(input.monto);
    const fecha = guardFechaISO(input.fecha);
    // V7/V20: gasto exige categoría de lista cerrada; ningún otro tipo la lleva.
    if (tipo === 'gasto') {
        if (!CATEGORIAS_GASTO.includes(input.categoria)) {
            throw new TesoreriaError('invalid-argument', `El gasto necesita su categoría (${CATEGORIAS_GASTO.join(', ')}).`);
        }
    } else if (input.categoria !== undefined) {
        throw new TesoreriaError('invalid-argument', 'categoria solo aplica al tipo gasto.');
    }
    // V3: direccion SOLO en ajuste_conciliacion (y obligatoria allí — la valida signoDeMovimiento al computar).
    if (tipo === 'ajuste_conciliacion') {
        if (!DIRECCIONES.includes(input.direccion)) throw new TesoreriaError('invalid-argument', 'El ajuste del cuadre exige direccion entrada|salida.');
    } else if (input.direccion !== undefined) {
        throw new TesoreriaError('invalid-argument', 'direccion solo aplica a ajuste_conciliacion.');
    }
    // V8: egresos deducibles con contraparte {nombre} (sin ella tu contador no lo puede usar).
    const contraparte = (input.contraparte && typeof input.contraparte === 'object') ? input.contraparte : null;
    if ((tipo === 'pago_proveedor' || tipo === 'gasto') && !(contraparte && String(contraparte.nombre || '').trim())) {
        throw new TesoreriaError('invalid-argument', 'Este egreso necesita a quién se le pagó (contraparte.nombre).');
    }
    // Tipos de socia: contraparte {tipo:'socia', id} para poder recomputar su saldo-aporte (V2/V9).
    if (TIPOS_SOCIA.includes(tipo) && !(contraparte && contraparte.tipo === 'socia' && SOCIAS.includes(contraparte.id))) {
        throw new TesoreriaError('invalid-argument', `Los movimientos de socia exigen contraparte {tipo:'socia', id: ${SOCIAS.join('|')}}.`);
    }
    if (tipo === 'ajuste_inverso' && !String(input.refDocumento || '').trim()) {
        throw new TesoreriaError('invalid-argument', 'La corrección exige el movimiento a reversar (refDocumento).');
    }

    return db.runTransaction(async (tx) => {
        // TODAS las lecturas antes de escribir (regla de las tx Firestore).
        const movRef = db.doc(`movimientosTesoreria/${opId}`);
        const cuentaRef = db.doc(`cuentasTesoreria/${cuentaId}`);
        const [existing, cuentaSnap] = await Promise.all([tx.get(movRef), tx.get(cuentaRef)]);

        let refSnap = null, inversosSnap = null;
        if (tipo === 'ajuste_inverso') {
            const refId = String(input.refDocumento).trim();
            [refSnap, inversosSnap] = await Promise.all([
                tx.get(db.doc(`movimientosTesoreria/${refId}`)),
                tx.get(db.collection('movimientosTesoreria')
                    .where('tipo', '==', 'ajuste_inverso').where('refDocumento', '==', refId)),
            ]);
        }
        let aportesSnap = null, reembolsosSnap = null;
        if (tipo === 'reembolso_socia') {
            [aportesSnap, reembolsosSnap] = await Promise.all([
                tx.get(db.collection('movimientosTesoreria').where('tipo', '==', 'aporte_socia').where('estado', '==', 'activo')),
                tx.get(db.collection('movimientosTesoreria').where('tipo', '==', 'reembolso_socia').where('estado', '==', 'activo')),
            ]);
        }

        if (existing.exists) {                              // IDEMPOTENTE: reintento del mismo opId
            const m = existing.data();
            return { opId, estado: m.estado, yaExistia: true };
        }
        if (!cuentaSnap.exists) throw new TesoreriaError('not-found', 'La cuenta no existe.');
        const cuenta = cuentaSnap.data();
        if (TIPOS_VIRTUALES.includes(cuenta.tipo)) {
            throw new TesoreriaError('failed-precondition', 'Caja↔Bóveda se mueve desde su módulo.');
        }
        if (cuenta.activa !== true) throw new TesoreriaError('failed-precondition', 'La cuenta está inactiva.');
        if (cuenta.fechaCorte && fecha < cuenta.fechaCorte) {   // V10: double-count con saldoInicial
            throw new TesoreriaError('failed-precondition', `La fecha es anterior al corte inicial de la cuenta (${cuenta.fechaCorte}): eso ya está dentro del saldo de arranque.`);
        }

        if (tipo === 'ajuste_inverso') {                    // V3 + costura de auditoría: amarres del inverso
            if (!refSnap.exists) throw new TesoreriaError('failed-precondition', 'El movimiento a reversar no existe.');
            const orig = refSnap.data();
            if (orig.cuentaId !== cuentaId) throw new TesoreriaError('failed-precondition', 'La corrección debe ser en la misma cuenta del movimiento original.');
            if (orig.tipo === 'ajuste_inverso') throw new TesoreriaError('failed-precondition', 'No se puede reversar una corrección.');
            // B6 · una pata de SISTEMA se deshace por su ORIGEN (anular el abono / reversar el
            // traslado de bóveda), jamás por corrección manual: las dos vías juntas restan DOS veces
            // (el inverso netea, y deshacer el origen sella la pata `anulado` ⇒ solo queda el inverso).
            if (PATA_TIPOS.includes(orig.tipo)) {
                throw new TesoreriaError('failed-precondition',
                    'Ese movimiento lo creó otra operación (un abono o un traslado de la bóveda). Para corregirlo deshaz esa operación: anula el abono o reversa el traslado.');
            }
            if ((orig.estado || 'activo') !== 'activo') throw new TesoreriaError('failed-precondition', 'Solo se corrige un movimiento firme (activo).');
            if (entero(orig.monto) !== monto) throw new TesoreriaError('invalid-argument', 'La corrección debe ser por el monto exacto del movimiento original.');
            const vivo = inversosSnap.docs.find((d) => (d.data().estado || 'activo') !== 'rechazado');
            if (vivo) throw new TesoreriaError('failed-precondition', 'Ese movimiento ya tiene una corrección en curso o aplicada.');
        }

        const mov = {
            cuentaId, tipo, fecha,
            monto: { monto, moneda: 'COP' },                // T-3: jamás number desnudo
            estado: TIPOS_PENDIENTES.includes(tipo) ? 'pendiente_aprobacion' : 'activo',
            conciliado: false,
            creadoPor: { uid: (input.autor && input.autor.uid) || input.autor || null, nombre: (input.autor && input.autor.nombre) || null, fuente },
            creadoEn: FieldValue.serverTimestamp(),
        };
        if (input.descripcion) mov.descripcion = String(input.descripcion).slice(0, 500);
        if (input.soporteURL) mov.soporteURL = String(input.soporteURL).slice(0, 1000);
        if (contraparte) mov.contraparte = { tipo: contraparte.tipo || 'externo', id: contraparte.id || null, nombre: contraparte.nombre ? String(contraparte.nombre).slice(0, 120) : null };
        if (tipo === 'gasto') mov.categoria = input.categoria;
        if (tipo === 'ajuste_conciliacion') mov.direccion = input.direccion;
        if (tipo === 'ajuste_inverso') mov.refDocumento = String(input.refDocumento).trim();

        if (tipo === 'reembolso_socia') {                   // V2: aviso (no bloqueo) si excede el aporte
            const socia = contraparte.id;
            const suma = (snap2) => { let s = 0; snap2.forEach((d) => { const m = d.data(); if (m.contraparte && m.contraparte.id === socia) s += entero(m.monto); }); return s; };
            const saldoAporte = suma(aportesSnap) - suma(reembolsosSnap);
            if (monto > saldoAporte) mov.excedeAporte = true;
        }

        tx.set(movRef, mov);
        return { opId, estado: mov.estado, excedeAporte: mov.excedeAporte === true, yaExistia: false };
    });
}

/**
 * CF 3 · Traslado entre cuentas REALES = PAR ATÓMICO en una tx (D3): `{opId}-out` + `{opId}-in`
 * con el MISMO trasladoId — jamás dos registros sueltos (causa #1 de descuadre). Rechaza
 * virtuales (su circuito es el módulo caja/bóveda). Devuelve los saldos estimados (V16, para el
 * confirm con números; la autoridad sigue siendo el recompute D5).
 * @param db Firestore (admin). @param input { opId, origenId, destinoId, monto, fecha, descripcion?, autor }
 */
async function trasladarEntreCuentasCore(db, input = {}) {
    const { FieldValue } = require('firebase-admin/firestore');
    const opId = String(input.opId || '').trim();
    const origenId = String(input.origenId || '').trim();
    const destinoId = String(input.destinoId || '').trim();
    if (!opId || !origenId || !destinoId) throw new TesoreriaError('invalid-argument', 'opId, origenId y destinoId son obligatorios.');
    if (origenId === destinoId) throw new TesoreriaError('invalid-argument', 'El origen y el destino no pueden ser la misma cuenta.');
    const monto = guardMonto(input.monto);
    const fecha = guardFechaISO(input.fecha);

    return db.runTransaction(async (tx) => {
        const outRef = db.doc(`movimientosTesoreria/${opId}-out`);
        const inRef = db.doc(`movimientosTesoreria/${opId}-in`);
        const [outSnap, origenSnap, destinoSnap] = await Promise.all([
            tx.get(outRef), tx.get(db.doc(`cuentasTesoreria/${origenId}`)), tx.get(db.doc(`cuentasTesoreria/${destinoId}`)),
        ]);
        if (outSnap.exists) return { opId, trasladoId: opId, yaExistia: true };   // IDEMPOTENTE (el par nace junto)

        for (const [id, snap] of [[origenId, origenSnap], [destinoId, destinoSnap]]) {
            if (!snap.exists) throw new TesoreriaError('not-found', `La cuenta ${id} no existe.`);
            const c = snap.data();
            if (TIPOS_VIRTUALES.includes(c.tipo)) throw new TesoreriaError('failed-precondition', 'Caja↔Bóveda se mueve desde su módulo.');
            if (c.activa !== true) throw new TesoreriaError('failed-precondition', `La cuenta ${id} está inactiva.`);
            if (c.fechaCorte && fecha < c.fechaCorte) throw new TesoreriaError('failed-precondition', `La fecha es anterior al corte inicial de ${id} (${c.fechaCorte}).`);
        }

        const sello = { fecha, monto: { monto, moneda: 'COP' }, trasladoId: opId, estado: 'activo', conciliado: false,
            creadoPor: { uid: (input.autor && input.autor.uid) || input.autor || null, nombre: (input.autor && input.autor.nombre) || null, fuente: 'MANUAL' },
            creadoEn: FieldValue.serverTimestamp() };
        if (input.descripcion) sello.descripcion = String(input.descripcion).slice(0, 500);
        tx.set(outRef, { ...sello, cuentaId: origenId, tipo: 'traslado_out' });
        tx.set(inRef, { ...sello, cuentaId: destinoId, tipo: 'traslado_in' });

        // Estimados para el confirm V16 (informativos; el saldo AUTORIDAD lo recomputa el trigger D5).
        const saldoOrigenDespues = entero(origenSnap.data().saldoActual) - monto;
        const saldoDestinoDespues = entero(destinoSnap.data().saldoActual) + monto;
        return { opId, trasladoId: opId, saldoOrigenDespues, saldoDestinoDespues, yaExistia: false };
    });
}

/**
 * CF 4 · Aprueba/rechaza un movimiento pendiente — SOLO owner (SoD D4). Aprobar estampa
 * `aprobadoPor` + `fechaEfectiva` (V5: el recompute mensual filtra por ella). Un movimiento
 * CONCILIADO es intocable (inv.6). Al aprobar un inverso re-verifica que no haya OTRO inverso
 * vivo del mismo ref (carrera creación↔aprobación — costura de la auditoría del titular).
 * @param db Firestore (admin). @param input { opId, decision:'aprobar'|'rechazar', motivo?, actor, rol, hoy? }
 */
async function aprobarMovimientoTesoreriaCore(db, input = {}) {
    const { FieldValue } = require('firebase-admin/firestore');
    const opId = String(input.opId || '').trim();
    const decision = input.decision;
    if (!opId) throw new TesoreriaError('invalid-argument', 'opId es obligatorio.');
    if (input.rol !== 'owner') throw new TesoreriaError('permission-denied', 'Solo el dueño (owner) aprueba movimientos de dinero.');
    if (decision !== 'aprobar' && decision !== 'rechazar') throw new TesoreriaError('invalid-argument', 'decision debe ser aprobar|rechazar.');
    const motivo = input.motivo ? String(input.motivo).slice(0, 500) : null;
    if (decision === 'rechazar' && !motivo) throw new TesoreriaError('invalid-argument', 'Rechazar exige un motivo.');

    return db.runTransaction(async (tx) => {
        const movRef = db.doc(`movimientosTesoreria/${opId}`);
        const snap = await tx.get(movRef);
        if (!snap.exists) throw new TesoreriaError('not-found', 'El movimiento no existe.');
        const mov = snap.data();
        let inversosSnap = null;
        if (decision === 'aprobar' && mov.tipo === 'ajuste_inverso') {
            inversosSnap = await tx.get(db.collection('movimientosTesoreria')
                .where('tipo', '==', 'ajuste_inverso').where('refDocumento', '==', mov.refDocumento));
        }
        if (mov.conciliado === true) throw new TesoreriaError('failed-precondition', 'Un movimiento cuadrado es intocable: corrige con un ajuste nuevo.');
        // IDEMPOTENTE: si ya está en el estado que pide la decisión, devolver el sello.
        if (mov.estado === 'activo' && decision === 'aprobar') return { opId, estado: 'activo', yaExistia: true };
        if (mov.estado === 'rechazado' && decision === 'rechazar') return { opId, estado: 'rechazado', yaExistia: true };
        if (mov.estado !== 'pendiente_aprobacion') throw new TesoreriaError('failed-precondition', 'El movimiento no está pendiente de aprobación.');

        if (inversosSnap) {                                 // carrera: otro inverso del mismo ref ya aprobado
            const otroVivo = inversosSnap.docs.find((d) => d.id !== opId && (d.data().estado || 'activo') === 'activo');
            if (otroVivo) throw new TesoreriaError('failed-precondition', 'Ese movimiento ya fue corregido por otra corrección aprobada.');
        }

        const sello = { aprobadoPor: { uid: (input.actor && input.actor.uid) || input.actor || null, nombre: (input.actor && input.actor.nombre) || null, at: FieldValue.serverTimestamp() } };
        if (decision === 'aprobar') {
            const hoy = input.hoy ? guardFechaISO(input.hoy, 'hoy') : new Date().toISOString().slice(0, 10);
            tx.update(movRef, { ...sello, estado: 'activo', fechaEfectiva: hoy });   // V5
            return { opId, estado: 'activo', fechaEfectiva: hoy, yaExistia: false };
        }
        tx.update(movRef, { ...sello, estado: 'rechazado', motivoRechazo: motivo });
        return { opId, estado: 'rechazado', yaExistia: false };
    });
}

/**
 * CF 5 · Marca movimientos como conciliados contra el extracto de un período (B3 los usa desde
 * "Guardar cuadre", V13/V19). Solo movimientos ACTIVOS de ESA cuenta; los ya conciliados se
 * saltan (idempotente). Un conciliado queda INMUTABLE (aprobarMovimiento lo rechaza).
 * @param db Firestore (admin). @param input { cuentaId, periodo:'YYYY-MM', opIds:[], actor }
 */
async function marcarConciliadoCore(db, input = {}) {
    const { FieldValue } = require('firebase-admin/firestore');
    const cuentaId = String(input.cuentaId || '').trim();
    const periodo = String(input.periodo || '').trim();
    const opIds = Array.isArray(input.opIds) ? input.opIds.map((x) => String(x).trim()).filter(Boolean) : [];
    if (!cuentaId) throw new TesoreriaError('invalid-argument', 'cuentaId es obligatorio.');
    if (!/^\d{4}-\d{2}$/.test(periodo)) throw new TesoreriaError('invalid-argument', "periodo debe ser 'YYYY-MM'.");
    if (!opIds.length) throw new TesoreriaError('invalid-argument', 'opIds no puede estar vacío.');
    if (opIds.length > 400) throw new TesoreriaError('invalid-argument', 'Máximo 400 movimientos por cuadre (divide el lote).');

    return db.runTransaction(async (tx) => {
        const snaps = await Promise.all(opIds.map((id) => tx.get(db.doc(`movimientosTesoreria/${id}`))));
        let conciliados = 0, yaEstaban = 0;
        for (let i = 0; i < snaps.length; i++) {
            const snap = snaps[i];
            if (!snap.exists) throw new TesoreriaError('not-found', `El movimiento ${opIds[i]} no existe.`);
            const m = snap.data();
            if (m.cuentaId !== cuentaId) throw new TesoreriaError('failed-precondition', `El movimiento ${opIds[i]} no es de esta cuenta.`);
            if (m.conciliado === true) { yaEstaban++; continue; }          // idempotente
            if (m.estado !== 'activo') throw new TesoreriaError('failed-precondition', `Solo se cuadra plata firme: ${opIds[i]} está ${m.estado}.`);
            tx.update(snap.ref, {
                conciliado: true, periodoConciliado: periodo,
                conciliadoPor: { uid: (input.actor && input.actor.uid) || input.actor || null, at: FieldValue.serverTimestamp() },
            });
            conciliados++;
        }
        return { cuentaId, periodo, conciliados, yaEstaban };
    });
}

// Mes calendario siguiente a 'YYYY-MM' (rollover de diciembre).
function periodoSiguiente(periodo) {
    const [y, m] = periodo.split('-').map(Number);
    const ny = m === 12 ? y + 1 : y;
    const nm = m === 12 ? 1 : m + 1;
    return `${ny}-${String(nm).padStart(2, '0')}`;
}

/**
 * CF 5b · Reabre el cuadre de un mes (V19: sello en dos etapas). OWNER-only con motivo + audit.
 * Des-concilia los movimientos sellados de ESE período+cuenta (conciliado→false, quita
 * periodoConciliado) para poder re-cuadrar. Bloqueada si el mes SIGUIENTE ya está sellado en esa
 * cuenta (no se reabre un mes con otro posterior ya cerrado — se reabre el más reciente primero).
 * Es la ÚNICA vía por la que la CF toca un conciliado (la excepción sancionada al inv. de inmutabilidad).
 * @param db Firestore (admin). @param input { cuentaId, periodo:'YYYY-MM', motivo, actor, rol }
 */
async function reabrirCuadreCore(db, input = {}) {
    const { FieldValue } = require('firebase-admin/firestore');
    const cuentaId = String(input.cuentaId || '').trim();
    const periodo = String(input.periodo || '').trim();
    const motivo = input.motivo ? String(input.motivo).slice(0, 500) : '';
    if (!cuentaId) throw new TesoreriaError('invalid-argument', 'cuentaId es obligatorio.');
    if (!/^\d{4}-\d{2}$/.test(periodo)) throw new TesoreriaError('invalid-argument', "periodo debe ser 'YYYY-MM'.");
    if (input.rol !== 'owner') throw new TesoreriaError('permission-denied', 'Solo el dueño (owner) puede reabrir un cuadre.');
    if (!motivo) throw new TesoreriaError('invalid-argument', 'Reabrir un cuadre exige un motivo (audit).');
    const sig = periodoSiguiente(periodo);

    return db.runTransaction(async (tx) => {
        // periodoConciliado es campo simple → auto-indexado; se filtra la cuenta en JS (mes acotado).
        const [thisSnap, nextSnap] = await Promise.all([
            tx.get(db.collection('movimientosTesoreria').where('periodoConciliado', '==', periodo)),
            tx.get(db.collection('movimientosTesoreria').where('periodoConciliado', '==', sig)),
        ]);
        if (nextSnap.docs.some((d) => d.data().cuentaId === cuentaId)) {
            throw new TesoreriaError('failed-precondition', `No puedes reabrir ${periodo}: el mes ${sig} ya está cuadrado. Reabre primero el más reciente.`);
        }
        const docs = thisSnap.docs.filter((d) => d.data().cuentaId === cuentaId);
        if (!docs.length) throw new TesoreriaError('not-found', `No hay un cuadre sellado de ${periodo} en esta cuenta.`);
        const sello = { uid: (input.actor && input.actor.uid) || input.actor || null, at: FieldValue.serverTimestamp(), motivo };
        for (const d of docs) {
            tx.update(d.ref, { conciliado: false, periodoConciliado: FieldValue.delete(), reabiertoPor: sello });
        }
        return { cuentaId, periodo, reabiertos: docs.length };
    });
}

/**
 * CF 6 · Recompute AUTORIDAD del saldo de una cuenta real (D5, patrón recalcSaldoCliente §43).
 * saldo = computeSaldoCuenta(saldoInicial, TODOS sus movimientos) — la fórmula excluye pendientes/
 * rechazados. Virtuales se saltan (sin saldo propio, D1). No-op si el saldo no cambió.
 * @param db Firestore (admin). @param cuentaId
 */
async function recalcularSaldoCuentaCore(db, cuentaId) {
    const { FieldValue } = require('firebase-admin/firestore');
    const id = String(cuentaId || '').trim();
    if (!id) throw new TesoreriaError('invalid-argument', 'cuentaId es obligatorio.');
    let saldo = null;
    await db.runTransaction(async (tx) => {
        saldo = null;                                       // reset por intento (patrón §43)
        const cuentaRef = db.doc(`cuentasTesoreria/${id}`);
        const cuentaSnap = await tx.get(cuentaRef);
        if (!cuentaSnap.exists) return;                     // cuenta borrada → no resucitarla
        const cuenta = cuentaSnap.data();
        if (TIPOS_VIRTUALES.includes(cuenta.tipo)) return;  // virtual: su módulo manda (D1)
        const movsSnap = await tx.get(db.collection('movimientosTesoreria').where('cuentaId', '==', id));
        const movs = movsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        saldo = computeSaldoCuenta(cuenta.saldoInicial, movs);
        if (entero(cuenta.saldoActual) === saldo) return;   // no-op: evita re-trigger
        tx.set(cuentaRef, { saldoActual: { monto: saldo, moneda: 'COP' }, saldoActualizadoEn: FieldValue.serverTimestamp() }, { merge: true });
    });
    return { cuentaId: id, saldo };
}

// ─── V1/V18 · PATA de sistema para la frontera bóveda↔banco (B5, zona caliente) ────────────────
// Las escribe OTRA CF (la de traslado de bóveda) DENTRO DE SU PROPIA transacción — por eso esto es
// un CONSTRUCTOR puro (valida + devuelve el doc), no una función que abra tx: las tx no se anidan.
// La puerta MANUAL sigue rechazando estos tipos (TIPOS_SOLO_SISTEMA) — una sola vía para cada cosa.
// D9 (B5): `abono_cartera` se suma como pata de SISTEMA — la escribe la CF del abono en su misma tx
// (functions/cartera-core.js). La puerta MANUAL sigue rechazándola (V12, línea ~231): una sola puerta.
const PATA_TIPOS = Object.freeze(['consignacion_in', 'retiro_efectivo_out', 'abono_cartera']);

/**
 * Valida la cuenta REAL destino y construye el asiento de la pata bancaria. Lanza (⇒ aborta la tx
 * del llamador, invariante de atomicidad) si la cuenta no sirve: inexistente, virtual, inactiva, o
 * con fecha anterior a su corte inicial (V10 double-count).
 * @param input { cuentaSnap (DocumentSnapshot leído DENTRO de la tx), cuentaId, tipo, monto, fecha,
 *                refDocumento, autor, descripcion? }
 */
function construirPataSistema(input = {}) {
    const { FieldValue } = require('firebase-admin/firestore');
    const tipo = input.tipo;
    if (!PATA_TIPOS.includes(tipo)) throw new TesoreriaError('invalid-argument', `Pata de sistema inválida: ${tipo}.`);
    const cuentaId = String(input.cuentaId || '').trim();
    if (!cuentaId) throw new TesoreriaError('invalid-argument', 'La pata bancaria exige la cuenta.');
    const monto = entero(input.monto);
    if (!(monto > 0)) throw new TesoreriaError('invalid-argument', 'El monto debe ser mayor a 0.');
    const fecha = String(input.fecha || '').trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) throw new TesoreriaError('invalid-argument', "La fecha debe ser 'YYYY-MM-DD'.");

    const snap = input.cuentaSnap;
    if (!snap || !snap.exists) throw new TesoreriaError('not-found', 'La cuenta a la que consignas no existe.');
    const cuenta = snap.data();
    if (TIPOS_VIRTUALES.includes(cuenta.tipo)) {
        throw new TesoreriaError('failed-precondition', 'Caja y Bóveda no son cuentas bancarias: elige el banco o Nequi donde entró la plata.');
    }
    if (cuenta.activa !== true) throw new TesoreriaError('failed-precondition', 'Esa cuenta está inactiva.');
    if (cuenta.fechaCorte && fecha < cuenta.fechaCorte) {
        throw new TesoreriaError('failed-precondition', `La fecha es anterior al corte inicial de la cuenta (${cuenta.fechaCorte}): eso ya está dentro del saldo de arranque.`);
    }

    const mov = {
        cuentaId, tipo, fecha,
        monto: { monto, moneda: 'COP' },                    // T-3: jamás number desnudo
        estado: 'activo',                                   // el movimiento físico YA ocurrió (no pide firma)
        conciliado: false,
        creadoPor: {
            uid: (input.autor && input.autor.uid) || input.autor || null,
            nombre: (input.autor && input.autor.nombre) || null,
            fuente: 'SISTEMA',                              // la escribió otra CF, no la puerta manual
        },
        creadoEn: FieldValue.serverTimestamp(),
    };
    if (input.refDocumento) mov.refDocumento = String(input.refDocumento).trim();   // trazable al mov de bóveda
    if (input.descripcion) mov.descripcion = String(input.descripcion).slice(0, 500);
    return mov;
}

/**
 * CF 7 · D6 · WHITELIST de las "Reglas del sistema" editables por el DUEÑO (B5).
 * Lista CERRADA: `campo` → dónde vive y qué rango acepta. Un campo fuera de aquí NO se escribe
 * (cierra la puerta a que la callable se vuelva un `setDoc` arbitrario sobre `config/*`).
 * Tipos: `bool` · `int` (entero ≥ min) · `frac` (fracción 0-1) · `permil` (POR MIL, 0-100 — ojo:
 * `reteIcaXMil` NO es fracción; 7‰ es un valor real del contador y 0-1 lo rechazaría).
 */
const CAMPOS_CONFIG = Object.freeze({
    enforceTurno:  { doc: 'caja',   tipo: 'bool',                label: 'Turno de caja obligatorio' },
    limiteCajon:   { doc: 'caja',   tipo: 'int',   min: 1,       label: 'Máximo de efectivo en el cajón' },
    wompiPct:      { doc: 'fiscal', tipo: 'frac',                label: 'Comisión de Wompi (porcentaje)' },
    wompiFijo:     { doc: 'fiscal', tipo: 'int',   min: 0,       label: 'Comisión de Wompi (fijo en COP)' },
    wompiIvaPct:   { doc: 'fiscal', tipo: 'frac',                label: 'IVA sobre la comisión' },
    reteFuentePct: { doc: 'fiscal', tipo: 'frac',                label: 'ReteFuente' },
    reteIcaXMil:   { doc: 'fiscal', tipo: 'permil', max: 100,    label: 'ReteICA (por mil)' },
});

/** Valida y NORMALIZA el valor según su tipo. Fail-red: ante duda, rechaza (es dinero). */
function validarValorConfig(campo, spec, valor) {
    const malo = (detalle) => new TesoreriaError('invalid-argument', `${spec.label}: ${detalle}`);
    if (spec.tipo === 'bool') {
        if (typeof valor !== 'boolean') throw malo('debe ser sí o no (booleano).');
        return valor;
    }
    const n = Number(valor);
    if (valor === null || valor === '' || !Number.isFinite(n)) throw malo('debe ser un número.');
    if (spec.tipo === 'int') {
        if (!Number.isInteger(n)) throw malo('debe ser un número entero (sin decimales).');
        if (n < (spec.min ?? 0)) throw malo(`no puede ser menor que ${spec.min ?? 0}.`);
        return n;
    }
    if (spec.tipo === 'frac') {
        if (n < 0 || n > 1) throw malo('debe ser una fracción entre 0 y 1 (ej. 0,0265 = 2,65%).');
        return n;
    }
    if (spec.tipo === 'permil') {
        if (n < 0 || n > (spec.max ?? 100)) throw malo(`debe estar entre 0 y ${spec.max ?? 100} por mil.`);
        return n;
    }
    throw malo('tipo de parámetro desconocido.');
}

/**
 * CF 7 · D6 · Edita UN parámetro de las "Reglas del sistema". OWNER-only (SoD inv.6: quien opera
 * bajo los límites no los reescribe) + rango validado + AUDIT TRAIL (el audit ES el control — por
 * eso §0.7 REFUTÓ el "editor sin audit trail"). MERGE: no pisa el resto del doc de config.
 * @param db Firestore (admin). @param input { campo, valor, actor, rol }
 */
async function actualizarConfigSistemaCore(db, input = {}) {
    const { FieldValue } = require('firebase-admin/firestore');
    if (input.rol !== 'owner') {
        throw new TesoreriaError('permission-denied', 'Solo el dueño (owner) puede cambiar las reglas del sistema.');
    }
    const campo = String(input.campo || '').trim();
    const spec = CAMPOS_CONFIG[campo];
    if (!spec) throw new TesoreriaError('invalid-argument', `Ese parámetro no se edita desde aquí: ${campo || '(vacío)'}.`);
    const valor = validarValorConfig(campo, spec, input.valor);
    const actor = (input.actor && typeof input.actor === 'object')
        ? { uid: input.actor.uid || null, nombre: input.actor.nombre || null }
        : { uid: input.actor || null, nombre: null };

    return db.runTransaction(async (tx) => {
        const ref = db.doc(`config/${spec.doc}`);
        const snap = await tx.get(ref);
        const anterior = snap.exists ? snap.data()[campo] : undefined;
        tx.set(ref, { [campo]: valor }, { merge: true });
        // Audit trail en saludEventos. `resuelto: true` A PROPÓSITO: el Hoy cuenta como "avisos del
        // sistema" los eventos NO resueltos (hoy.js initSenalAvisos) — un cambio de config es un
        // REGISTRO, no una falla; sin esta bandera cada edición encendería una alarma falsa.
        tx.set(db.collection('saludEventos').doc(), {
            tipo: 'config-cambiada', doc: spec.doc, campo, label: spec.label,
            anterior: anterior === undefined ? null : anterior, nuevo: valor,
            actor, at: FieldValue.serverTimestamp(), resuelto: true,
        });
        return { campo, doc: spec.doc, valor, anterior: anterior === undefined ? null : anterior };
    });
}

module.exports = {
    SIGNO_TESORERIA, TIPOS_DERIVADOS, TIPOS_MOV, TIPOS_CUENTA, TIPOS_VIRTUALES, TITULARES,
    ESTADOS_MOV, TIPOS_PENDIENTES, CATEGORIAS_GASTO, DIRECCIONES, TIPOS_SOLO_SISTEMA, SOCIAS, TIPOS_SOCIA,
    CAMPOS_CONFIG, PATA_TIPOS, construirPataSistema,
    TesoreriaError, entero, signoDeMovimiento, computeSaldoCuenta, seedCuentasVirtuales,
    crearCuentaTesoreriaCore, registrarMovimientoTesoreriaCore, trasladarEntreCuentasCore,
    aprobarMovimientoTesoreriaCore, marcarConciliadoCore, reabrirCuadreCore, recalcularSaldoCuentaCore,
    actualizarConfigSistemaCore,
};
