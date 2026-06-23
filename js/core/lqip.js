/**
 * js/core/lqip.js — Helpers de render del "blur-up" (§103 F1). PUROS.
 *
 * Un LQIP (Low-Quality Image Placeholder) es un data-URI base64 minúsculo que el
 * panel genera al subir una imagen (image-optimizer.makeLqip) y guarda junto a la
 * URL real. Estos helpers producen el `style=` que pinta el placeholder borroso al
 * instante mientras la imagen real (lenta: viene de Storage tras el getDoc) carga.
 *
 * Regla de oro §103: Firestore es la única verdad; el LQIP solo acelera el 1er paint,
 * NUNCA tapa un cambio (no es caché — vive en el mismo doc que la URL, llega con ella).
 *
 * Dos contextos:
 *  - DIV de fondo (`.*-image-bg`): doble background → real ARRIBA, LQIP detrás. Cuando
 *    la real pinta, cubre al LQIP (blur-up sin JS, sin CSP). El CSS ya da cover/center.
 *  - <img>: el LQIP como fondo del propio <img> → se ve hasta que el `src` pinta encima.
 *
 * Seguridad: la URL real va por safeUrl()+escape() (igual que hoy); el LQIP por
 * safeLqip() (regex base64 → imposible romper el url(); más estricto que safeUrl).
 */
import { escape } from './html.js';
import { safeUrl, safeLqip } from './safe-url.js';

/**
 * `style=` para un DIV de fondo. Si hay LQIP válido, capa doble (real, lqip);
 * si no, exactamente el comportamiento actual (solo la real).
 * @param {string} realUrl URL de la imagen (Storage); '' → caller no debería llamar
 * @param {string} [lqip]  data-URI LQIP
 * @returns {string} valor para el atributo style (sin comillas peligrosas)
 */
export function lqipBgStyle(realUrl, lqip) {
    const r = escape(safeUrl(realUrl));
    const l = safeLqip(lqip);
    return l
        ? `background-image:url('${r}'),url('${l}')`
        : `background-image:url('${r}')`;
}

/**
 * `style=` para un <img>: pinta el LQIP como su fondo (visible hasta que carga el src).
 * Devuelve '' si no hay LQIP válido → el <img> queda sin style extra (comportamiento actual).
 * @param {string} [lqip] data-URI LQIP
 * @returns {string}
 */
export function lqipImgStyle(lqip) {
    const l = safeLqip(lqip);
    return l ? `background-image:url('${l}');background-size:cover;background-position:center` : '';
}

export default { lqipBgStyle, lqipImgStyle };
