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
    return contactoHeroSection(c.hero) + contactoProcesoSection(c.proceso) + contactoFaqSection(c.faq);
}

export default renderContactoPreview;
