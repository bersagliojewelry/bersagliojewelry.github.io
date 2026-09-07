/**
 * js/admin/contacto-preview.js — Ensamblador del PREVIEW de Contacto para el CMS (F1).
 *
 * Reusa las MISMAS secciones puras que pintan la página pública (contactoHeroSection /
 * contactoProcesoSection / contactoFaqSection) con los datos del BORRADOR. Solo las
 * secciones de TEXTO editables (hero/proceso/faq); los canales, el formulario y el sidebar
 * son estandarizados (no editables aquí). El escapado viaja DENTRO de los renderers.
 */
import { contactoHeroSection, contactoProcesoSection, contactoFaqSection } from '../pages/contacto.js';
import { mergeContacto } from '../pages/contacto-defaults.js';

/** draft = { hero:{…}, proceso:{…}, faq:{…} } (de collectSingleton) → HTML de Contacto. */
export function renderContactoPreview(draft) {
    const c = mergeContacto(draft);
    // Envoltura data-sf-section: ancla de clic-para-editar (F2). Las secciones vienen de
    // renderers públicos (no las puedo marcar dentro), así que envuelvo aquí. La clave == key
    // de sección del form (hero/proceso/faq). Solo del preview admin; no afecta la web pública.
    return `<div data-sf-section="hero">${contactoHeroSection(c.hero)}</div>`
        + `<div data-sf-section="proceso">${contactoProcesoSection(c.proceso)}</div>`
        + `<div data-sf-section="faq">${contactoFaqSection(c.faq)}</div>`;
}

export default renderContactoPreview;
