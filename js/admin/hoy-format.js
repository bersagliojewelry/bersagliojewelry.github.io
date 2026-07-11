/**
 * hoy-format.js — helpers PUROS del pulso del panel "Hoy" (F-IA-2 B3 · spec §4 · [OPUS-4.8]).
 *
 * Sin DOM ni Firestore → testeable en Node (mismo patrón que pedidos-format.js / caja-format.js /
 * saldo-format.js). REUSA el censo canónico de estados (pedidos-format) y NO redefine "qué es una
 * venta": así se garantiza el invariante del pulso — los números del "Hoy" == los de sus páginas
 * fuente (Pedidos), la "conservación" de caza-bugs §2b. Todo el pulso es de SOLO LECTURA.
 */
import { totalesFiltro, ESTADOS_SIN_DINERO } from './pedidos-format.js';

// Estados "post-pago, pre-entrega": la venta YA entró pero la pieza aún no se entregó. Derivado del
// ciclo logístico (TRANSICIONES_PEDIDO de pedidos-format): todos tienen 'entregado' alcanzable.
// Fuera: terminales (entregado/reembolsado/cancelado/anulado/expirado), 'a_revisar'/'pagado_sin_stock'
// (excepciones, viven en su propia cola del módulo Pedidos) y 'pago_*' (aún sin pagar).
export const ESTADOS_POR_ENTREGAR = new Set(['pagado', 'preparacion', 'despacho_nacional', 'entrega_local', 'listo_retiro']);
export const esPorEntregar = (estado) => ESTADOS_POR_ENTREGAR.has(estado);

/** ms de un `createdAt` (Firestore Timestamp | {seconds} | Date | ISO). 0 si no es parseable. */
export function tsAMs(ts) {
    if (!ts) return 0;
    if (typeof ts.toMillis === 'function') return ts.toMillis();
    if (typeof ts.seconds === 'number') return ts.seconds * 1000;
    const d = new Date(ts);
    return isNaN(d.getTime()) ? 0 : d.getTime();
}

/**
 * Límites [inicio, fin] del día LOCAL de `now`, en ms (fin inclusive = 23:59:59.999). Casa con el
 * filtro de fecha de la página Pedidos (desde 00:00 hasta 23:59.999) → mismo día, mismo criterio.
 */
export function rangoDia(now = new Date()) {
    const inicio = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const fin    = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    return { inicioMs: inicio.getTime(), finMs: fin.getTime() };
}

/**
 * Ventas de HOY: filtra los pedidos por `createdAt` dentro del día y REUSA `totalesFiltro` (que
 * excluye ESTADOS_SIN_DINERO). Es el MISMO censo que el KPI de la página Pedidos → mismo número.
 * @returns {{ n:number, totalCOP:number, excluidos:number }}
 */
export function ventasDeHoy(pedidos, inicioMs, finMs) {
    const delDia = (Array.isArray(pedidos) ? pedidos : []).filter((p) => {
        const t = tsAMs(p?.createdAt);
        return t >= inicioMs && t <= finMs;
    });
    return totalesFiltro(delDia);
}

/** Pedidos aún por entregar (post-pago, pre-entrega). Conserva el orden de entrada (createdAt desc). */
export function pedidosPorEntregar(pedidos) {
    return (Array.isArray(pedidos) ? pedidos : []).filter((p) => esPorEntregar(p?.estado));
}

/** ISO 'YYYY-MM-DD' → número de día UTC entero (o null si no es ISO). */
function isoADia(iso) {
    if (typeof iso !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
    const [y, m, d] = iso.split('-').map(Number);
    return Math.floor(Date.UTC(y, m - 1, d) / 86400000);
}

/**
 * ¿La PRÓXIMA cuota del plan de un cliente cae dentro de la ventana de cobro [.. , hoy+dias]?
 * Incluye las YA vencidas (fecha ≤ hoy): "quién paga esta semana" abarca lo que debió pagarse y
 * lo que vence pronto. Reusa `estadoCuenta(...).plan.proximaCuota` (NO duplica el FIFO del acuerdo).
 * @param {object|null} plan  el objeto `.plan` de estadoCuenta (o null)
 * @param {string} hoyISO     hoy en 'YYYY-MM-DD'
 * @param {number} [dias=7]   horizonte de la ventana
 * @returns {{ fecha:string, monto:number }|null}
 */
export function cuotaEnVentana(plan, hoyISO, dias = 7) {
    const prox = plan?.proximaCuota;
    if (!prox || !prox.fecha) return null;
    const hoyNum = isoADia(hoyISO);
    const cuotaNum = isoADia(prox.fecha);
    if (hoyNum == null || cuotaNum == null) return null;
    return cuotaNum <= hoyNum + dias ? { fecha: prox.fecha, monto: prox.monto } : null;
}

export default {
    ESTADOS_POR_ENTREGAR, esPorEntregar, tsAMs, rangoDia, ventasDeHoy, pedidosPorEntregar, cuotaEnVentana,
    ESTADOS_SIN_DINERO,
};
