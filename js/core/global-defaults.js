/**
 * js/core/global-defaults.js — DEFAULTS de los DATOS GLOBALES del sitio (PURO).
 *
 * Datos compartidos por varios componentes (no de una sola página): redes sociales +
 * copy del footer. Singleton `siteContent/global` (claves ya whitelisted en
 * firestore.rules: contacto · footer · redes). Patrón §5-G (espejo de contacto-defaults).
 *
 * INCREMENT 1 (2026-06-19): `redes` (sociales) + `footer.tagline`, consumidos por el footer
 * (que aparece en TODAS las páginas) → editar una vez, se ve en todo el sitio. Corrige de
 * raíz el bug del WhatsApp placeholder (`573001234567`) que vivía duplicado en footer +
 * wishlist: el default ahora es el número REAL. El sub-mapa `contacto` (canales de la página
 * Contacto + otros consumidores de WhatsApp) se cablea en un increment posterior.
 *
 * Merge: campos planos por spread (doc gana, default rellena). Las URLs van por safeUrl()
 * en el render (anti stored-XSS, repo público L-15).
 */

export const GLOBAL_DEFAULTS = {
    // Redes sociales (URLs completas; el footer las usa tal cual con safeUrl)
    redes: {
        instagram: 'https://www.instagram.com/bersagliojewelry/',
        facebook:  'https://www.facebook.com/bersagliojewelry',
        whatsapp:  'https://wa.me/573013752592',   // número REAL (corrige el placeholder 573001234567)
    },
    // Copy del footer compartido
    footer: {
        tagline: 'Alta joyería con esmeraldas colombianas, diamantes certificados y oro 18K. Piezas diseñadas para trascender generaciones.',
    },
};

/** merge(DEFAULTS, doc) por sub-mapa. Robusto a doc null/parcial. */
export function mergeGlobal(doc) {
    const d = doc || {};
    const D = GLOBAL_DEFAULTS;
    return {
        redes:  { ...D.redes,  ...(d.redes || {}) },
        footer: { ...D.footer, ...(d.footer || {}) },
    };
}

export default { GLOBAL_DEFAULTS, mergeGlobal };
