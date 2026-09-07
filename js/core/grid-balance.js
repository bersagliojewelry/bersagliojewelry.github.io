/**
 * Reparto "inteligente" de columnas — SSoT de la regla para TODAS las grillas de tarjetas
 * (destacadas, catálogo/colecciones, relacionados). Daniel 2026-06-25: la grilla debe
 * acomodarse a la CANTIDAD de tarjetas, sin dejar una huérfana sola con un hueco al lado.
 *
 * Heurística de grilla balanceada (la misma que usan los catálogos serios):
 *   filas = ceil(n / max)   → cuántas filas necesito si lleno a `max` por fila
 *   cols  = ceil(n / filas) → reparto parejo de las n tarjetas en esas filas
 *
 * Resultado (max=4): 1→1 · 2→2 · 3→3 · 4→4 · 5→3(3+2) · 6→3(3+3) · 7→4(4+3) · 8→4(4+4)
 *                    9→3(3+3+3) · 10→4(4+3+3) · 12→4 … Coincide con los ejemplos de Daniel.
 *
 * El número que devuelve es el IDEAL de ESCRITORIO. El recorte a tablet/móvil lo hace el CSS
 * (media queries por grilla), porque el helper no conoce el ancho del viewport.
 *
 * @param {number} n   cantidad de tarjetas a mostrar
 * @param {number} [max=4] columnas máximas en escritorio para esa grilla
 * @returns {number} columnas ideales (1..max)
 */
export function balancedCols(n, max = 4) {
    const count = Math.max(0, Math.floor(Number(n) || 0));
    if (count <= 1) return 1;
    const cols = Math.min(count, Math.max(1, Math.floor(max)));
    const rows = Math.ceil(count / cols);
    return Math.ceil(count / rows);
}

export default { balancedCols };
