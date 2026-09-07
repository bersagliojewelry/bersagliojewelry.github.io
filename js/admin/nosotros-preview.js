/**
 * js/admin/nosotros-preview.js — Ensamblador del PREVIEW de Nosotros para el CMS (P4).
 *
 * Reusa los MISMOS renderers puros que pintan la página pública (nosotros*Section) con
 * los datos del BORRADOR. Cada bloque visual se envuelve en `data-sf-section` con la clave
 * de su SUB-MAPA de datos → clic-para-editar (F2) enfoca el fieldset correcto. Modelo PLANO
 * (síntesis Gemini 2026-06-19): 12 claves lógicas, una por sección (sin grab-bag).
 *
 * Preview ESTÁTICO (CRUDO §riesgo 5): el timeline se pinta en el capítulo 0 y el FAQ con el
 * 0 abierto (el comportamiento interactivo no corre aquí). Hide-when-empty también aplica:
 * una lista vacía no pinta su sección (igual que la web). El escapado viaja DENTRO de los
 * renderers (escape() por-hoja); aquí solo se ensambla.
 */
import {
    nosotrosHeroSection, nosotrosStatsSection, nosotrosManifiestoSection,
    nosotrosFilosofiaSection, nosotrosValoresSection, nosotrosTimelineSection,
    nosotrosAtelierSection, nosotrosEquipoSection, nosotrosCertsSection,
    nosotrosResenasSection, nosotrosFaqSection, nosotrosCtaSection,
} from '../pages/nosotros.js';
import { mergeNosotros } from '../pages/nosotros-defaults.js';

/** draft (de collectSingleton) → HTML de Nosotros con anclas data-sf-section por sub-mapa. */
export function renderNosotrosPreview(draft) {
    const c = mergeNosotros(draft);
    const wrap = (key, htmlStr) => htmlStr ? `<div data-sf-section="${key}">${htmlStr}</div>` : '';
    return [
        wrap('hero',            nosotrosHeroSection(c.hero)),
        wrap('cifras',          nosotrosStatsSection(c.cifras.items)),
        wrap('manifiesto',      nosotrosManifiestoSection(c.manifiesto)),
        wrap('maison',          nosotrosFilosofiaSection(c.maison)),
        wrap('valores',         nosotrosValoresSection(c.valores)),
        wrap('timeline',        nosotrosTimelineSection(c.timeline, 0)),
        wrap('atelier',         nosotrosAtelierSection(c.atelier)),
        wrap('equipo',          nosotrosEquipoSection(c.equipo.items)),
        wrap('certificaciones', nosotrosCertsSection(c.certificaciones.items)),
        wrap('resenas',         nosotrosResenasSection(c.resenas.items)),
        wrap('faqs',            nosotrosFaqSection(c.faqs.items, 0)),
        wrap('cierre',          nosotrosCtaSection(c.cierre)),
    ].join('');
}

export default renderNosotrosPreview;
