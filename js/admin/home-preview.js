/**
 * js/admin/home-preview.js — Ensamblador del PREVIEW del Home para el CMS (F1).
 *
 * Reusa los MISMOS renderers puros que pintan la web pública (L-03: un solo renderer) con los
 * datos del BORRADOR que Kary escribe en el formulario. Solo las secciones de TEXTO editables
 * (hero/editorial/atelier/cta); las de producto (categorías/lookbook) no son editables aquí.
 * El escapado (escape()/safeUrl()) viaja DENTRO de los renderers → cero superficie nueva de XSS.
 */
import { heroInner } from '../home/hero.js';
import { editorialInner } from '../home/editorial.js';
import { atelierInner } from '../home/atelier.js';
import { ctaInner } from '../home/cta.js';
import { mergeHome } from '../home/siteContent-defaults.js';

/** draft = { hero:{…}, editorial:{…}, atelier:{…}, cta:{…} } (de collectSingleton) → HTML del Home. */
export function renderHomePreview(draft) {
    const c = mergeHome(draft);
    // data-sf-section: ancla de clic-para-editar (F2). Solo marca; NO afecta la web pública
    // (este ensamblador es exclusivo del preview admin). La clave == key de sección del form.
    return `<section class="home-hero" data-sf-section="hero" data-hero>${heroInner(c.hero)}</section>`
        + `<section class="home-editorial" data-sf-section="editorial">${editorialInner(c.editorial)}</section>`
        + `<section class="home-atelier" data-sf-section="atelier">${atelierInner(c.atelier)}</section>`
        + `<section class="home-cta" data-sf-section="cta">${ctaInner(c.cta)}</section>`;
}

export default renderHomePreview;
