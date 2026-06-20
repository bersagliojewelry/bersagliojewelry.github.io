/**
 * js/core/home-sections.js — SSoT de los UMBRALES de dignidad y la COMPLETITUD de
 * las secciones DINÁMICAS del index (cero-ficción · spec 2026-06-20 · `feedback_no_demo_en_index`).
 *
 * Una sola fuente para tres consumidores que DEBEN coincidir:
 *   1. Render público (js/home/films.js, js/home/social.js): oculta la sección bajo el umbral.
 *   2. Panel admin (resource-admin · columna "¿Se ve en la web?"): avisa a Kary ANTES de que
 *      la regla rechace, y por qué.
 *   3. Tarjeta "Estado de tu web" (js/admin/estado-web.js): resumen vivo para Kary.
 *
 * La PUERTA DURA (published ⇒ campos reales no vacíos) vive en `firestore.rules`
 * (filmValid/socialValid/journalValid). Estos predicados son su ESPEJO en cliente:
 * deben coincidir campo por campo (riesgo de divergencia que marcó el comité, barrera #3).
 * Si cambias un umbral o un campo aquí, refleja la regla (y viceversa) en el MISMO commit.
 */

export const MIN_FILMS   = 3;   // videos publicados+completos para mostrar "Bersaglio Films"
export const MIN_SOCIAL  = 4;   // posts para mostrar "Lo último en nuestras redes"
export const MIN_JOURNAL = 1;   // ≥1 entrada publicada+completa para el Journal del home
export const MIN_FEATURED = 3;  // piezas destacadas para la franja "Destacadas"

// Redes soportadas por el render (íconos + filtro de social.js). Fuera de esta lista
// un post no pinta su ícono ni cae en su pestaña → se considera "incompleto".
export const SOCIAL_PLATFORMS = ['Instagram', 'Facebook', 'TikTok'];

const nz = v => typeof v === 'string' && v.trim().length > 0;

/**
 * Video COMPLETO = lo que el render del home necesita para no verse roto
 * (title + miniatura + enlace). Espejo de filmValid() en firestore.rules.
 * @returns {{complete:boolean, missing:string[]}}  missing = etiquetas legibles para Kary.
 */
export function isFilmComplete(it) {
    const missing = [];
    if (!nz(it?.title)) missing.push('el título');
    if (!nz(it?.thumb)) missing.push('la miniatura');
    if (!nz(it?.href))  missing.push('el enlace del video');
    return { complete: missing.length === 0, missing };
}

/** Post de redes COMPLETO = miniatura + texto + enlace al post + red válida. Espejo de socialValid(). */
export function isSocialComplete(it) {
    const missing = [];
    if (!nz(it?.thumb))   missing.push('la miniatura');
    if (!nz(it?.caption)) missing.push('el texto');
    if (!nz(it?.href))    missing.push('el enlace al post');
    if (!SOCIAL_PLATFORMS.includes(it?.platform)) missing.push('la red social');
    return { complete: missing.length === 0, missing };
}

/** Entrada de Journal COMPLETA = título + imagen de portada + resumen. Espejo de journalValid(). */
export function isJournalComplete(it) {
    const missing = [];
    if (!nz(it?.title))   missing.push('el título');
    if (!nz(it?.image))   missing.push('la imagen de portada');
    if (!nz(it?.excerpt)) missing.push('el resumen');
    return { complete: missing.length === 0, missing };
}

export default {
    MIN_FILMS, MIN_SOCIAL, MIN_JOURNAL, MIN_FEATURED, SOCIAL_PLATFORMS,
    isFilmComplete, isSocialComplete, isJournalComplete,
};
