/**
 * js/core/section-reserve.js — Reserva de alto para secciones dinámicas del index
 * (anti-salto / anti-CLS en carga fría). Comité v3 §3.0/§3.2 (2026-06-21).
 *
 * IDEA: el "salto feo" del index ocurre porque una sección (colecciones/destacadas)
 * nace colapsada y se EXPANDE de golpe cuando Firebase responde (hasta ~4s). No podemos
 * saber en el primer paint cuánto medirá (esa señal llega en el mismo snapshot que causa
 * el salto). Solución: en cada render con datos GUARDAMOS el alto real de la grilla en
 * localStorage; en la SIGUIENTE carga RESERVAMOS ese alto desde el frame 0 → el contenido
 * entra sin empujar nada. Exacto en visitas recurrentes (el caso común). 1ª visita absoluta
 * (sin dato guardado) → no reservamos a ciegas (regla binaria segura §3.4: nunca convertir
 * un colapso-limpio en salto-inverso); se acepta un asentamiento mínimo esa única vez.
 *
 * Todo defensivo: cualquier fallo de localStorage → 0 (sin reserva = comportamiento actual).
 */

const KEY = (id) => `bj:reserve:${id}`;

/** Bucket de ancho (redondeado a 120px) para que el alto guardado solo se reuse en un
 *  layout equivalente (un alto medido en desktop no sirve para reservar en móvil). */
function widthBucket() {
    try { return Math.round((window.innerWidth || 0) / 120) * 120; }
    catch { return 0; }
}

/** Guarda el alto real (px) de la grilla de una sección, junto al ancho en que se midió. */
export function rememberHeight(id, el) {
    try {
        if (!el || typeof el.getBoundingClientRect !== 'function') return;
        const h = Math.round(el.getBoundingClientRect().height);
        if (h > 0) localStorage.setItem(KEY(id), JSON.stringify({ h, w: widthBucket() }));
    } catch { /* storage lleno/bloqueado → sin guardar, sin romper */ }
}

/** Alto a reservar (px) para una sección — solo si hay dato guardado en el MISMO bucket de
 *  ancho; si no, 0 (no reservar a ciegas). */
export function reservedHeight(id) {
    try {
        const raw = localStorage.getItem(KEY(id));
        if (!raw) return 0;
        const { h, w } = JSON.parse(raw);
        return (w === widthBucket() && typeof h === 'number' && h > 0) ? h : 0;
    } catch { return 0; }
}

export default { rememberHeight, reservedHeight };
