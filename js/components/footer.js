/**
 * Bersaglio Jewelry — Footer 4-col glass grid.
 *
 *   col 1 (1.3fr): logo + tagline + social icons (IG / FB / WA)
 *   col 2: Colecciones links · col 3: Casa links · col 4: Servicio links
 * + bottom bar: copyright + legales
 *
 * CMS `global` (increment 1): la tagline + las URLs de redes vienen de
 * merge(GLOBAL_DEFAULTS, siteContent/global) — editables desde el panel (Contenido web →
 * Datos globales). Pinta con DEFAULTS al instante (sin esperar Firestore) y re-pinta una
 * vez si llega un override. Las URLs van por safeUrl() (anti stored-XSS, repo público L-15).
 * Los links de navegación + legales son ESTRUCTURALES (no editables).
 *
 * Responsive: ≤820px → 2 cols · ≤520px → 1 col
 */

import { mount } from '../core/html.js';
import { data } from '../core/data.js';
import { mergeGlobal } from '../core/global-defaults.js';
import { footerHTML as footerHTMLPuro } from './footer-markup.js';

// El markup vive en `footer-markup.js` (PURO, importable también desde el build, que lo hornea).
// Se re-exporta para no tocar ningún callsite.
export { footerHTML } from './footer-markup.js';

export function mountFooter() {
    const root = document.getElementById('footer-mount');
    if (!root) return;
    const paint = () => mount(root, footerHTMLPuro(mergeGlobal(data.getSiteContent('global'))));
    paint();   // DEFAULTS al instante (sin esperar Firestore)
    // CMS global: re-pinta una vez si hay override editado desde el panel.
    data.loadSiteContent('global')
        .then(() => { if (document.getElementById('footer-mount')) paint(); })
        .catch(() => { /* offline / sin doc → quedan los defaults */ });
}

export default { mountFooter };
