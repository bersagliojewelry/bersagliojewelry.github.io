/**
 * Bersaglio CRM — Reconciliación de cartera (núcleo, función PURA).
 *
 * "Cuadrar caja": compara el saldo GUARDADO de cada cliente (`saldoActual`, lo
 * escribe la CF `recalcSaldoCliente`) contra el saldo RECALCULADO desde la fuente
 * de verdad (sus movimientos, vía `computeSaldo`). Cualquier diferencia = descuadre:
 * señal de que el trigger falló en silencio o de un dato corrupto.
 *
 * Es PURA (sin Firestore) para testear la detección exacta sin emulador — espejo
 * del patrón de `saldo.js` / `crm-estado-cuenta.js` (F6 frente D, plan §57).
 */
'use strict';

const { computeSaldo } = require('./saldo');

/**
 * Compara saldos guardados vs recalculados.
 *
 * Política de bordes (deliberada, espejo del trigger):
 *  - Cliente sin movimientos → saldo calculado 0 (si guarda otra cosa, descuadra).
 *  - Cliente sin `saldoActual` (número) → se trata como 0 guardado (legacy).
 *  - Movimientos huérfanos (su cliente ya no existe) se IGNORAN: el trigger tampoco
 *    resucita clientes borrados ("cliente borrado → no resucitarlo").
 *
 * @param {Array<{id: string, nombre?: string, saldoActual?: number}>} clientes
 * @param {Map<string, Array<object>>|Object<string, Array<object>>} movimientosPorCliente
 * @returns {{ totalClientes: number, totalDescuadres: number, ok: boolean,
 *             descuadres: Array<{clienteId: string, nombre: string,
 *                                saldoGuardado: number, saldoCalculado: number,
 *                                diferencia: number}> }}
 */
function compararSaldos(clientes, movimientosPorCliente) {
    const lista = Array.isArray(clientes) ? clientes : [];
    const movsDe = (id) => {
        if (movimientosPorCliente instanceof Map) return movimientosPorCliente.get(id) || [];
        if (movimientosPorCliente && typeof movimientosPorCliente === 'object') {
            return movimientosPorCliente[id] || [];
        }
        return [];
    };

    const descuadres = [];
    for (const cliente of lista) {
        const saldoGuardado = typeof cliente.saldoActual === 'number' && isFinite(cliente.saldoActual)
            ? cliente.saldoActual : 0;
        const saldoCalculado = computeSaldo(movsDe(cliente.id));
        if (saldoGuardado !== saldoCalculado) {
            descuadres.push({
                clienteId: cliente.id,
                nombre: cliente.nombre || '(sin nombre)',
                saldoGuardado,
                saldoCalculado,
                diferencia: saldoCalculado - saldoGuardado,
            });
        }
    }

    return {
        totalClientes: lista.length,
        totalDescuadres: descuadres.length,
        ok: descuadres.length === 0,
        descuadres,
    };
}

/**
 * F-TESORERÍA B5 (cierre) · el mismo control, para el libro del BANCO. Compara el `saldoActual` de
 * cada cuenta (lo materializa el trigger `recalcSaldoTesoreria`) contra el recompute desde su ledger
 * (`computeSaldoCuenta`, la MISMA fórmula que ve la pantalla — inv.2). Un descuadre = el trigger
 * falló en silencio o hay un dato corrupto: exactamente el fallo que nadie nota hasta que la plata
 * no aparece.
 *
 * Política de bordes (deliberada):
 *  - Las cuentas VIRTUALES (caja/bóveda) se SALTAN: no tienen ledger propio ni `saldoActual` — su
 *    plata la controlan el arqueo del turno y el ledger de bóveda, cada uno con su propio cuadre (D1).
 *  - Cuenta sin movimientos → calculado = su `saldoInicial` (si guarda otra cosa, descuadra).
 *  - `saldoActual` ausente (cuenta recién creada, antes del primer trigger) → se trata como el
 *    saldoInicial, no como 0: si no, TODA cuenta nueva con saldo de arranque daría falsa alarma.
 *  - Movimientos huérfanos (su cuenta ya no existe) se IGNORAN.
 *
 * @param {Array<{id:string, nombre?:string, tipo?:string, saldoInicial?:{monto:number}, saldoActual?:{monto:number}}>} cuentas
 * @param {Map<string, Array<object>>|Object<string, Array<object>>} movsPorCuenta
 * @returns {{ totalCuentas:number, totalDescuadres:number, ok:boolean, descuadres:Array<object> }}
 */
function compararSaldosCuentas(cuentas, movsPorCuenta) {
    const { computeSaldoCuenta, TIPOS_VIRTUALES } = require('./tesoreria-core.js');
    const lista = Array.isArray(cuentas) ? cuentas : [];
    const movsDe = (id) => {
        if (movsPorCuenta instanceof Map) return movsPorCuenta.get(id) || [];
        if (movsPorCuenta && typeof movsPorCuenta === 'object') return movsPorCuenta[id] || [];
        return [];
    };
    const monto = (v) => (v && typeof v.monto === 'number' && isFinite(v.monto) ? v.monto : null);

    const reales = lista.filter((c) => c && !TIPOS_VIRTUALES.includes(c.tipo));
    const descuadres = [];
    for (const cta of reales) {
        const inicial = monto(cta.saldoInicial) ?? 0;
        const guardado = monto(cta.saldoActual) ?? inicial;
        const calculado = computeSaldoCuenta(inicial, movsDe(cta.id));
        if (guardado !== calculado) {
            descuadres.push({
                cuentaId: cta.id,
                nombre: cta.nombre || '(sin nombre)',
                saldoGuardado: guardado,
                saldoCalculado: calculado,
                diferencia: calculado - guardado,
            });
        }
    }

    return {
        totalCuentas: reales.length,
        totalDescuadres: descuadres.length,
        ok: descuadres.length === 0,
        descuadres,
    };
}

module.exports = { compararSaldos, compararSaldosCuentas };
