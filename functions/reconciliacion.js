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

module.exports = { compararSaldos };
