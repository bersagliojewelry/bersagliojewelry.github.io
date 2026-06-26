/**
 * Modelo de Inventario v3 (TODO-40) — lógica PURA del stock multi-tipo. SSoT del modelo.
 *
 * Sin Firebase → testeable (tests/inventario-migracion.test.mjs). Lo consumen:
 *   · la migración (scripts/migrate-inventario-v3.mjs)  · el SSG (scripts/generate-pieces.mjs, Bloque 5)
 *   · el panel admin (js/admin/piezas.js, Bloque 4)
 * La CF (functions/pedidos-core.js, CommonJS) replica `derivarEstado` (5 líneas) por la frontera ESM↔CJS —
 * único punto duplicado, marcado allí. SSoT del comportamiento = ESTE archivo (design §11-§12).
 *
 * Decisiones (comité ×4 + Gemini + comité v2):
 *   · enum `stockType` de 3 (reemplaza el bool `refabricable`): cierra combos imposibles.
 *   · `cantidad` = ÚNICA verdad para finito*; `estado` = DERIVADO (CF-only); `encargo` → cantidad null.
 *   · `visibilidad` fail-CLOSED: la migración backfillea 'publica' a todo legacy (ausente ya no existe en prod).
 */

export const STOCK_TYPES   = ['finito', 'finito_refabricable', 'encargo'];
export const VISIBILIDADES = ['publica', 'privada'];

/**
 * estado DERIVADO de (stockType, cantidad). SSoT = `cantidad` (CF-only). NUNCA se escribe a mano.
 *  · encargo            → 'disponible' (se fabrica, siempre pedible)
 *  · finito* cantidad>0 → 'disponible'
 *  · finito_refabricable cantidad<=0 → 'bajo_pedido' (agotado PERO pedible — PreOrder)
 *  · finito cantidad<=0 → 'agotada' (fuera del listado)
 */
export function derivarEstado(stockType, cantidad) {
    if (stockType === 'encargo') return 'disponible';
    const n = Number.isInteger(cantidad) ? cantidad : 0;
    if (n > 0) return 'disponible';
    return stockType === 'finito_refabricable' ? 'bajo_pedido' : 'agotada';
}

/** ¿La pieza se puede pedir/comprar? (disponible o bajo_pedido sí; agotada no). */
export function esDisponible(stockType, cantidad) {
    return derivarEstado(stockType, cantidad) !== 'agotada';
}

/**
 * Migración legacy → v3 (PURA, idempotente). Mapea {stockType-2, refabricable-bool, estado-legacy, cantidad}
 * → {stockType-3, cantidad, visibilidad}. Devuelve solo los campos que CAMBIAN (para un update mínimo).
 *
 * Reglas (comité v2 · C1):
 *  · stockType: 'encargo' se respeta; refabricable:true (bool legacy) → 'finito_refabricable'; resto → 'finito'.
 *  · cantidad : 'encargo' → null (purga, D6). finito*: estado=='vendida' (legacy) → 0 SIEMPRE (no se confía el
 *               conteo declarado de una vendida, el modelo viejo marcaba toda la pieza); ya-int → respeta; ausente → 1.
 *  · visibilidad: backfill 'publica' a todo lo que no sea ya un valor válido (fail-closed: 'ausente' no debe existir).
 *  · `estado` NO se toca (el SSG legacy aún lee estado=='vendida'; lo migra el Bloque 5). Solo datos, sin cambio de UI.
 *  · `refabricable` (bool legacy) NO se borra aquí (rollback) — se retira en una 2ª pasada.
 *
 * @returns {{cambio:boolean, cambios:object, stockType:string, cantidad:(number|null)}}
 */
export function migrarPiezaV3(data = {}) {
    const cambios = {};

    // 1) stockType (enum 3)
    let stockType;
    if (data.stockType === 'encargo' || data.stockType === 'finito_refabricable') stockType = data.stockType;
    else if (data.refabricable === true) stockType = 'finito_refabricable';
    else stockType = 'finito';
    if (data.stockType !== stockType) cambios.stockType = stockType;

    // 2) cantidad (única verdad para finito*; null para encargo)
    let cantidad;
    if (stockType === 'encargo') {
        cantidad = null;
        if (data.cantidad != null) cambios.cantidad = null;               // purga (D6)
    } else {
        if (data.estado === 'vendida') cantidad = 0;                      // vendida legacy → agotada (precede)
        else if (Number.isInteger(data.cantidad)) cantidad = data.cantidad;
        else cantidad = 1;                                                // default tolerante
        if (data.cantidad !== cantidad) cambios.cantidad = cantidad;
    }

    // 3) visibilidad (fail-closed: backfill 'publica' a todo legacy sin valor válido)
    if (data.visibilidad !== 'publica' && data.visibilidad !== 'privada') cambios.visibilidad = 'publica';

    return { cambio: Object.keys(cambios).length > 0, cambios, stockType, cantidad };
}

/**
 * Invariantes post-migración (gate del comité v2 · C1). Se evalúa sobre el estado RESULTANTE
 * (data original + cambios aplicados). Devuelve array de violaciones (vacío = sano).
 */
export function violacionesInvariantes(data = {}) {
    const v = [];
    const st = data.stockType;
    const finito = st === 'finito' || st === 'finito_refabricable';
    if (data.estado === 'vendida' && Number.isInteger(data.cantidad) && data.cantidad > 0)
        v.push('estado=="vendida" con cantidad>0');
    if (finito && data.cantidad == null)
        v.push('finito* con cantidad==null');
    if (st === 'encargo' && data.cantidad != null)
        v.push('encargo con cantidad!=null');
    if (st != null && !STOCK_TYPES.includes(st))
        v.push(`stockType inválido: ${st}`);
    if (data.visibilidad != null && !VISIBILIDADES.includes(data.visibilidad))
        v.push(`visibilidad inválida: ${data.visibilidad}`);
    return v;
}
