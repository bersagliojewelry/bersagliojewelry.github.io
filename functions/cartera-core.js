/**
 * functions/cartera-core.js — núcleo de los ABONOS de cartera (F-TESORERÍA B5 · V17).
 * SSoT: docs/superpowers/specs/2026-07-18-f-tesoreria-DISENO.md (§0.7 V17 · §9). Deploy MANUAL (L-22).
 *
 * POR QUÉ EXISTE (el agujero que cierra):
 *   un abono en EFECTIVO reduce la deuda de la clienta, pero el billete no entraba a NINGÚN libro
 *   de efectivo → el arqueo del turno no lo esperaba → si el billete se va al bolsillo, el arqueo
 *   CUADRA igual. Aquí la MISMA transacción que registra el abono escribe su pata en
 *   `turnos/{id}/movsCaja` → el esperado del arqueo la pide sola. Exige turno abierto: sin turno
 *   no hay quién custodie ni quién cuente el billete.
 *
 * PREMISA DE LA SPEC QUE RESULTÓ FALSA (verificado 2026-07-25): §9 decía «ubicar la CF del abono
 *   del CRM». NO EXISTÍA — el abono lo escribía el NAVEGADOR (`js/crm-service.js addMovimiento`),
 *   validado solo por reglas. Y `movsCaja` es CF-only (`allow write: if false`). Por eso el abono
 *   pasa a tener puerta de servidor: es la única forma de escribir las dos patas en una tx.
 *
 * DESVÍO DELIBERADO de la letra de §0.7 (§G.4 Desafío Crítico, con evidencia — patrón L-73):
 *   la spec pide «tipo nuevo `abono_cartera`» en movsCaja; la pata nace `tipo:'ingreso'` +
 *   `concepto:'abono_cartera'`. La ecuación del esperado está COPIADA en 3 sitios (caja-core
 *   `cerrarTurnoCore` · `js/admin/pos.js movsSums` · `js/admin/auditoria.js`) y suma SOLO
 *   ingreso/egreso; uno rotula lo desconocido como "Ingreso". Un `tipo` nuevo dejaría la plata a
 *   merced del espejo que alguien olvide actualizar; con `ingreso` entra al esperado en los 3 SIN
 *   tocar la ecuación — que es exactamente lo que §0.7 dice que debe pasar («entra al esperado del
 *   arqueo automáticamente»). Se cumple la INTENCIÓN, no la palabra. La distinción humana (y la
 *   línea propia "Abono de clienta" en el arqueo) la da el `concepto`.
 *
 * Invariantes (skill `auditoria-financiera`): #1 conservación (dos libros, una tx) · #3 idempotencia
 * POR-LIBRO y **anclada al turno** · #4 deshacer netea en AMBOS libros · #7 la anomalía GRITA.
 */
const { FieldValue } = require('firebase-admin/firestore');
const { PedidoError } = require('./pedidos-core.js');
const tesoreria = require('./tesoreria-core.js');   // D9: constructor de la pata bancaria (sin ciclo)

const ESTADO_REF = 'caja/estado';

// Espejo LITERAL de firestore.rules (`movimientoValido`): si allá cambia, aquí también (test lo fija).
const MEDIOS_ABONO = ['efectivo', 'transferencia', 'datafono', 'otro'];
// El único medio que mueve billetes físicos → el único que exige custodia en caja.
const MEDIO_EFECTIVO = 'efectivo';
// Concepto de la pata. NO se añade a `CONCEPTOS_CAJA` (caja-core) A PROPÓSITO: la puerta MANUAL de
// caja debe seguir rechazándolo — una sola puerta lo crea, la del abono (V12 análogo).
const CONCEPTO_ABONO = 'abono_cartera';
const SUFIJO_PATA = '-caja';   // `movsCaja/{opId}-caja`, espejo de `{opId}-teso` de V1/V18
// D9 · pata en el libro de TESORERÍA (banco/Nequi) del abono por transferencia.
const SUFIJO_TESO = '-teso';
const TIPO_PATA_TESO = 'abono_cartera';
// Espejo de `anulacionValida` (firestore.rules): lista CERRADA, en mayúsculas.
const MOTIVOS_ANULACION = ['ERROR_REGISTRO', 'DUPLICADO', 'CORRECCION', 'CORRECCION_FECHA',
    'DEVOLUCION_PIEZA', 'ABONO_NO_REGISTRADO', 'DESCUENTO_AUTORIZADO', 'OTRO'];

const idPata = (opId) => `${opId}${SUFIJO_PATA}`;

/** Entero-COP positivo (§5.1: el peso no circula con centavos). Estricto: NO coacciona. */
function guardMonto(monto) {
    if (!Number.isSafeInteger(monto) || monto <= 0) {
        throw new PedidoError('invalid-argument', 'El monto debe ser un entero de pesos mayor a 0 (sin centavos).');
    }
}

/** Espejo de `fechaHechoValida` (firestore.rules): formato, piso 2015 y tope hoy+2d. */
function guardFecha(fecha) {
    const f = String(fecha || '');
    const limite = new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString().slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(f) || f < '2015-01-01' || f > limite) {
        throw new PedidoError('invalid-argument', "La fecha del abono debe ser 'AAAA-MM-DD' y no puede quedar en el futuro.");
    }
    return f;
}

const uidDe = (autor) => (autor && typeof autor === 'object' ? autor.uid : autor) || null;

/**
 * Texto de la pata bancaria. El ledger de tesorería lo lee alguien cuadrando el extracto: "Abono de
 * María Gómez" le dice de dónde salió esa entrada; un id de cliente no le dice nada.
 */
function descripcionPata(clienteSnap) {
    const nombre = clienteSnap && clienteSnap.exists ? (clienteSnap.data().nombre || '').trim() : '';
    return nombre ? `Abono de ${nombre}`.slice(0, 500) : 'Abono de clienta';
}

/**
 * Doc de la pata en el libro de CAJA. `tipo:'ingreso'` a propósito (ver cabecera): así los 3
 * espejos del esperado la suman sin cambiar la ecuación.
 */
function construirPataCaja({ opId, clienteId, monto, autor, descripcion }) {
    const pata = {
        tipo: 'ingreso',
        concepto: CONCEPTO_ABONO,
        monto,
        autor: uidDe(autor),
        // Trazabilidad cruzada: desde el arqueo se llega al abono y a la clienta (auditoría).
        refAbono: { clienteId, movId: opId },
        ts: FieldValue.serverTimestamp(),
    };
    if (descripcion) pata.nota = String(descripcion).slice(0, 500);
    return pata;
}

/** Alerta al owner (patrón caja-core §9.8.2): se INYECTA por opts → mock en tests, FCM/saludEventos en la CF. */
async function emitirAlerta(opts, evt) {
    const notif = opts && typeof opts.notificar === 'function' ? opts.notificar : null;
    if (notif) await notif({ ...evt, alOwner: true });
}

/**
 * Registra un abono de cartera. Si el medio es EFECTIVO, escribe además —en la MISMA transacción—
 * su pata en la caja del turno abierto; si algo de la pata falla, NO queda abono (atomicidad: la
 * deuda jamás baja sin que el billete entre a un libro).
 *
 * Idempotente por `opId` (= id del doc de cartera) y **POR-LIBRO** (V4): al replay se verifica CADA
 * libro y se crea el que falte. La idempotencia va **ANCLADA al turno** guardado en el movimiento
 * (`pataCaja.turnoId`): a diferencia de las patas de V1/V18 (destino determinista), aquí el destino
 * es TEMPORAL — sin ancla, un replay tardío metería la plata en el turno equivocado o en uno ya
 * sellado. Si el turno anclado ya cerró y la pata falta, NO se reescribe el arqueo firmado: se
 * reporta `pataFaltante` y se ALERTA al dueño (invariante #7: la anomalía grita, no se traga).
 *
 * @param db Firestore (admin).
 * @param input { opId, clienteId, monto, fecha, medioPago, descripcion?, autor }
 * @returns { opId, movId, clienteId, monto, medioPago, pataCaja:{turnoId,movId}|null, yaExistia, pataCreada?, pataFaltante? }
 */
async function registrarAbonoCarteraCore(db, input = {}, opts = {}) {
    const opId = String(input.opId || '').trim();
    const clienteId = String(input.clienteId || '').trim();
    const medioPago = input.medioPago;
    const descripcion = input.descripcion ? String(input.descripcion).slice(0, 500) : null;
    const autor = input.autor || null;
    if (!opId) throw new PedidoError('invalid-argument', 'opId es obligatorio.');
    if (!clienteId) throw new PedidoError('invalid-argument', 'Falta la clienta del abono.');
    if (!MEDIOS_ABONO.includes(medioPago)) {
        throw new PedidoError('invalid-argument', 'Medio de pago inválido: elige efectivo, transferencia, datáfono u otro.');
    }
    guardMonto(input.monto);
    const monto = input.monto;
    const fecha = guardFecha(input.fecha);
    const esEfectivo = medioPago === MEDIO_EFECTIVO;

    // D9 · ¿a qué CUENTA entró? Solo tiene sentido en TRANSFERENCIA (incluye Nequi): el efectivo va
    // al cajón (V17) y el datáfono llega neto de comisión y con su propio cuadre de vouchers —
    // meterlos aquí en bruto descuadraría el banco. `cuentaId` es OPCIONAL a propósito (V12:
    // "todavía no sé" es una respuesta legítima y no se castiga con un bloqueo).
    const cuentaId = input.cuentaId ? String(input.cuentaId).trim() : null;
    if (cuentaId && medioPago !== 'transferencia') {
        throw new PedidoError('invalid-argument',
            'Solo las transferencias entran a una cuenta bancaria: el efectivo entra a la caja del turno.');
    }
    const idTeso = `${opId}${SUFIJO_TESO}`;

    const res = await db.runTransaction(async (tx) => {
        const movRef = db.doc(`clientes/${clienteId}/movimientos/${opId}`);
        const movSnap = await tx.get(movRef);

        // ── REPLAY: el abono ya está. Se verifica CADA libro por separado (idempotencia por-libro,
        // V4): jamás "éxito previo" global — el que falte se crea, el que esté se respeta.
        if (movSnap.exists) {
            const m = movSnap.data();
            const ancla = m.pataCaja && m.pataCaja.turnoId ? String(m.pataCaja.turnoId) : null;
            const ctaAncla = m.pataTeso && m.pataTeso.cuentaId ? String(m.pataTeso.cuentaId) : null;
            const out = { yaExistia: true, pataCaja: null, pataTeso: null };

            // (a) libro del BANCO: destino DETERMINISTA (la cuenta quedó anclada en el movimiento),
            // así que reponerlo es seguro — a diferencia del turno, que es temporal (L-85).
            if (ctaAncla) {
                out.pataTeso = { cuentaId: ctaAncla, movId: idTeso };
                const tesoRef = db.doc(`movimientosTesoreria/${idTeso}`);
                const [tesoSnap, ctaSnap, cliSnap] = await Promise.all([
                    tx.get(tesoRef), tx.get(db.doc(`cuentasTesoreria/${ctaAncla}`)), tx.get(db.doc(`clientes/${clienteId}`)),
                ]);
                if (!tesoSnap.exists) {
                    tx.set(tesoRef, tesoreria.construirPataSistema({
                        cuentaSnap: ctaSnap, cuentaId: ctaAncla, tipo: TIPO_PATA_TESO, monto: m.monto,
                        fecha: m.fecha, refDocumento: opId, autor: m.registradoPor,
                        descripcion: descripcionPata(cliSnap),
                    }));
                    out.pataTesoCreada = true;
                }
            }
            // (b) libro de la CAJA.
            if (ancla) {
                const pataRef = db.doc(`turnos/${ancla}/movsCaja/${idPata(opId)}`);
                const [pataSnap, turnoSnap] = await Promise.all([tx.get(pataRef), tx.get(db.doc(`turnos/${ancla}`))]);
                out.pataCaja = { turnoId: ancla, movId: idPata(opId) };
                if (!pataSnap.exists) {
                    // Solo se repone si SU turno sigue abierto — un arqueo sellado ya se firmó sin
                    // ella y meterle plata después es fabricar evidencia.
                    if (!turnoSnap.exists || turnoSnap.data().estado !== 'abierto') {
                        out.pataFaltante = true; out.turnoAnclado = ancla;
                    } else {
                        tx.set(pataRef, construirPataCaja({ opId, clienteId, monto: m.monto, autor: m.registradoPor, descripcion: m.descripcion }));
                        out.pataCreada = true;
                    }
                }
            }
            return out;
        }

        // ── ALTA. Todas las lecturas ANTES de escribir (regla de las tx de Firestore).
        const clienteSnap = await tx.get(db.doc(`clientes/${clienteId}`));
        if (!clienteSnap.exists) throw new PedidoError('not-found', 'Esa clienta ya no existe en el sistema.');

        let pataRef = null, turnoId = null;
        if (esEfectivo) {
            // Leer el puntero y el turno DENTRO de la tx los serializa contra el cierre: un abono
            // no puede colarse en un turno que se está cerrando (ni al revés).
            const estadoSnap = await tx.get(db.doc(ESTADO_REF));
            turnoId = estadoSnap.exists ? (estadoSnap.data().turnoAbiertoId || null) : null;
            if (!turnoId) {
                throw new PedidoError('failed-precondition',
                    'Este abono es en efectivo y la caja está cerrada. Ábrela en el Mostrador para que el billete quede contado en el arqueo.');
            }
            const turnoSnap = await tx.get(db.doc(`turnos/${turnoId}`));
            if (!turnoSnap.exists || turnoSnap.data().estado !== 'abierto') {
                throw new PedidoError('failed-precondition',
                    'La caja de ese turno ya está cerrada. Abre la caja en el Mostrador para registrar un abono en efectivo.');
            }
            pataRef = db.doc(`turnos/${turnoId}/movsCaja/${idPata(opId)}`);
        }

        // D9 · pata del BANCO. Construirla VALIDA la cuenta (existe · no virtual · activa · fecha ≥
        // su corte inicial, V10) y lanza si no sirve ⇒ aborta TODO el abono: la deuda jamás baja
        // apuntando a una cuenta que no puede recibir esa plata (espejo de V1 en la bóveda).
        let tesoRef = null, tesoDoc = null;
        if (cuentaId) {
            const ctaSnap = await tx.get(db.doc(`cuentasTesoreria/${cuentaId}`));
            tesoDoc = tesoreria.construirPataSistema({
                cuentaSnap: ctaSnap, cuentaId, tipo: TIPO_PATA_TESO, monto, fecha,
                refDocumento: opId, autor, descripcion: descripcionPata(clienteSnap),
            });
            tesoRef = db.doc(`movimientosTesoreria/${idTeso}`);
        }

        const mov = {
            tipo: 'abono',
            monto,
            fecha,
            medioPago,
            registradoPor: uidDe(autor),
            registradoEn: FieldValue.serverTimestamp(),
            anulado: false,
        };
        if (descripcion) mov.descripcion = descripcion;
        // ANCLAS de la idempotencia por-libro: dónde vive la plata de ESTE abono en cada libro.
        if (pataRef) mov.pataCaja = { turnoId, movId: idPata(opId) };
        if (tesoRef) mov.pataTeso = { cuentaId, movId: idTeso };
        // V12: "todavía no sé" no se pierde en el silencio — queda listable en "Cuadrar mes" para
        // cerrarlo después (sin esta bandera, el abono sin cuenta sería invisible).
        else if (medioPago === 'transferencia') mov.sinCuentaAsignada = true;

        tx.set(movRef, mov);
        if (pataRef) tx.set(pataRef, construirPataCaja({ opId, clienteId, monto, autor, descripcion }));
        if (tesoRef) tx.set(tesoRef, tesoDoc);
        return {
            yaExistia: false,
            pataCaja: pataRef ? { turnoId, movId: idPata(opId) } : null,
            pataTeso: tesoRef ? { cuentaId, movId: idTeso } : null,
        };
    });

    if (res.pataFaltante) {
        await emitirAlerta(opts, {
            evento: 'abono_pata_faltante', opId, clienteId, monto,
            turnoId: res.turnoAnclado, autor: uidDe(autor),
        });
    }
    return { opId, movId: opId, clienteId, monto, medioPago, ...res };
}

/**
 * Anula un abono SIN borrarlo (append-only) y netea su pata de caja en la MISMA transacción — si no,
 * el arqueo seguiría pidiendo un billete que ya no existe (descuadre falso permanente).
 *
 * Si el turno de la pata ya CERRÓ, rechaza: un arqueo firmado no se reescribe. La compensación en el
 * turno abierto (con aprobación del owner, patrón reverso de bóveda) queda en la cola del titular.
 *
 * @param input { clienteId, movId, motivo, motivoCategoria?, autor }
 * @returns { clienteId, movId, pataAnulada, yaEstabaAnulado? }
 */
async function anularAbonoCarteraCore(db, input = {}, opts = {}) {
    const clienteId = String(input.clienteId || '').trim();
    const movId = String(input.movId || '').trim();
    const motivo = input.motivo ? String(input.motivo).trim().slice(0, 500) : '';
    const motivoCategoria = input.motivoCategoria || 'OTRO';
    const autor = input.autor || null;
    if (!clienteId || !movId) throw new PedidoError('invalid-argument', 'Falta la clienta o el movimiento a anular.');
    if (!motivo) throw new PedidoError('invalid-argument', 'La anulación exige un motivo (queda en el libro).');
    if (!MOTIVOS_ANULACION.includes(motivoCategoria)) {
        throw new PedidoError('invalid-argument', `Categoría de anulación inválida: ${motivoCategoria}.`);
    }

    const res = await db.runTransaction(async (tx) => {
        const movRef = db.doc(`clientes/${clienteId}/movimientos/${movId}`);
        const movSnap = await tx.get(movRef);
        if (!movSnap.exists) throw new PedidoError('not-found', 'Ese movimiento ya no existe.');
        const m = movSnap.data();
        if (m.tipo !== 'abono') throw new PedidoError('invalid-argument', 'Esta puerta es solo para abonos.');
        if (m.anulado === true) return { pataAnulada: false, yaEstabaAnulado: true };

        const ancla = m.pataCaja && m.pataCaja.turnoId ? String(m.pataCaja.turnoId) : null;
        let pataRef = null, hayPata = false;
        if (ancla) {
            pataRef = db.doc(`turnos/${ancla}/movsCaja/${idPata(movId)}`);
            const [pataSnap, turnoSnap] = await Promise.all([tx.get(pataRef), tx.get(db.doc(`turnos/${ancla}`))]);
            hayPata = pataSnap.exists && pataSnap.data().anulado !== true;
            if (hayPata && (!turnoSnap.exists || turnoSnap.data().estado !== 'abierto')) {
                throw new PedidoError('failed-precondition',
                    'Ese abono en efectivo ya entró al arqueo de un turno CERRADO. Devuelve el billete y regístralo como salida de caja en el Mostrador.');
            }
        }

        // D9 · pata del BANCO. Misma doctrina que el turno sellado: lo que YA se cuadró contra el
        // extracto es intocable (espejo de `aprobarMovimientoTesoreria`); corregirlo es un ajuste
        // nuevo, no una edición del pasado. Si aún no se cuadró, se SELLA `estado:'anulado'` —
        // append-only, no se borra — y el recompute deja de contarlo (solo suma 'activo').
        const ctaAncla = m.pataTeso && m.pataTeso.cuentaId ? String(m.pataTeso.cuentaId) : null;
        let tesoRef = null, hayTeso = false;
        if (ctaAncla) {
            tesoRef = db.doc(`movimientosTesoreria/${movId}${SUFIJO_TESO}`);
            const tesoSnap = await tx.get(tesoRef);
            const t = tesoSnap.exists ? tesoSnap.data() : null;
            if (t && t.conciliado === true) {
                throw new PedidoError('failed-precondition',
                    `Ese abono ya quedó CUADRADO con el extracto de ${t.periodoConciliado || 'un mes cerrado'}: no se puede anular. Registra un ajuste del cuadre (pide aprobación del dueño).`);
            }
            hayTeso = !!t && t.estado === 'activo';
        }

        const patch = {
            anulado: true,
            anuladoPor: uidDe(autor),
            anuladoEn: FieldValue.serverTimestamp(),
            motivoAnulacion: motivo,
            motivoCategoria,
        };
        tx.update(movRef, patch);
        if (hayPata) {
            tx.update(pataRef, {
                anulado: true, anuladoPor: uidDe(autor), anuladoEn: FieldValue.serverTimestamp(), motivoAnulacion: motivo,
            });
        }
        if (hayTeso) {
            tx.update(tesoRef, {
                estado: 'anulado', anuladoPor: { uid: uidDe(autor), at: FieldValue.serverTimestamp() },
                motivoAnulacion: motivo,
            });
        }
        return {
            pataAnulada: hayPata, pataHuerfana: !!ancla && !hayPata,
            pataTesoAnulada: hayTeso, pataTesoHuerfana: !!ctaAncla && !hayTeso,
        };
    });

    // La pata debía estar y no está (borrada/ya anulada por otra vía): el arqueo puede quedar
    // descuadrado y nadie se enteraría → grita.
    if (res.pataHuerfana) {
        await emitirAlerta(opts, { evento: 'abono_anulado_sin_pata', opId: movId, clienteId, autor: uidDe(autor) });
    }
    return { clienteId, movId, ...res };
}

/**
 * D9 · asigna la cuenta a un abono que se registró con "todavía no sé" y crea su pata bancaria.
 * Sin esto, la opción "todavía no sé" sería un agujero: la plata quedaría fuera del libro del banco
 * para siempre y el cuadre del mes nunca cerraría. Con esto es solo un aplazamiento honesto.
 *
 * NO permite CAMBIAR una cuenta ya asignada: mover plata de un banco a otro es un traslado, no una
 * corrección de dato (si se asignó mal, se anula el abono y se registra de nuevo).
 *
 * @param input { clienteId, movId, cuentaId, autor }
 * @returns { clienteId, movId, pataTeso:{cuentaId,movId}, yaExistia }
 */
async function asignarCuentaAbonoCore(db, input = {}, opts = {}) {
    const clienteId = String(input.clienteId || '').trim();
    const movId = String(input.movId || '').trim();
    const cuentaId = String(input.cuentaId || '').trim();
    const autor = input.autor || null;
    if (!clienteId || !movId) throw new PedidoError('invalid-argument', 'Falta la clienta o el abono.');
    if (!cuentaId) throw new PedidoError('invalid-argument', 'Elige la cuenta a la que entró la plata.');

    return db.runTransaction(async (tx) => {
        const movRef = db.doc(`clientes/${clienteId}/movimientos/${movId}`);
        const [movSnap, ctaSnap, cliSnap] = await Promise.all([
            tx.get(movRef), tx.get(db.doc(`cuentasTesoreria/${cuentaId}`)), tx.get(db.doc(`clientes/${clienteId}`)),
        ]);
        if (!movSnap.exists) throw new PedidoError('not-found', 'Ese abono ya no existe.');
        const m = movSnap.data();
        if (m.tipo !== 'abono' || m.medioPago !== 'transferencia') {
            throw new PedidoError('invalid-argument', 'Solo los abonos por transferencia entran a una cuenta bancaria.');
        }
        if (m.anulado === true) throw new PedidoError('failed-precondition', 'Ese abono está anulado: no se le asigna cuenta.');

        const idTeso = `${movId}${SUFIJO_TESO}`;
        const yaCta = m.pataTeso && m.pataTeso.cuentaId ? String(m.pataTeso.cuentaId) : null;
        if (yaCta && yaCta !== cuentaId) {
            throw new PedidoError('failed-precondition',
                'Ese abono ya está asignado a otra cuenta. Si entró donde no era, anúlalo y regístralo de nuevo.');
        }
        const tesoRef = db.doc(`movimientosTesoreria/${idTeso}`);
        const tesoSnap = await tx.get(tesoRef);
        const pataTeso = { cuentaId, movId: idTeso };
        if (tesoSnap.exists) return { clienteId, movId, pataTeso, yaExistia: true };   // idempotente

        // Construir VALIDA la cuenta (existe · no virtual · activa · fecha ≥ su corte) y aborta si no sirve.
        tx.set(tesoRef, tesoreria.construirPataSistema({
            cuentaSnap: ctaSnap, cuentaId, tipo: TIPO_PATA_TESO, monto: m.monto, fecha: m.fecha,
            refDocumento: movId, autor, descripcion: descripcionPata(cliSnap),
        }));
        tx.update(movRef, { pataTeso, sinCuentaAsignada: false });
        return { clienteId, movId, pataTeso, yaExistia: false };
    });
}

module.exports = {
    MEDIOS_ABONO, MEDIO_EFECTIVO, CONCEPTO_ABONO, MOTIVOS_ANULACION,
    registrarAbonoCarteraCore, anularAbonoCarteraCore, asignarCuentaAbonoCore,
};
