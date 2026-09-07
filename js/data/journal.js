/**
 * Bersaglio Jewelry — Journal entries (data layer).
 *
 * Los accessors (getCover/getDestacadas/getListado/getAll/getEntryBySlug/getRelated) leen
 * SOLO las entradas PUBLICADAS en Firestore (`data.getJournal()`, administradas desde
 * el panel Contenido web → Journal). normalizeEntry() mapea el doc Firestore (fecha
 * ISO) a la forma de display (date 'DD·MM·YY' + dateLong 'Marzo 2026').
 *
 * REGLA cero-ficción (`feedback_no_demo_en_index`, spec 2026-06-20): NO hay array
 * "baked" de respaldo. Sin entradas publicadas → los accessors devuelven [] / null →
 * la sección Journal del home y la página /journal se ocultan o muestran su empty-state.
 * NUNCA se inventan artículos. (El fallback de 8 artículos de ejemplo se eliminó; era
 * justo la "noticia ficticia" que la regla prohíbe.)
 *
 * Cada entry (doc Firestore, normalizado):
 *   slug · section · kicker · title · excerpt · body · date · dateLong · read ·
 *   author · authorRole · image · published ·
 *   cover (portada) · featured (destacada = franja de abajo) · order (posición)
 */

import { data } from '../core/data.js';
import { isoToDisplay, normalizeEntry } from './journal-normalize.js';
import { isJournalComplete } from '../core/home-sections.js';   // completitud (SSoT cero-ficción)

// Re-export de los puros (un solo punto de import para los consumers/tests).
export { isoToDisplay, normalizeEntry };

/**
 * URL pública CANÓNICA de una entrada = la página HORNEADA e indexable `/journal/<slug>.html`
 * (SSG A3, `scripts/generate-pieces.mjs`). SSoT del enlace: la usan el home, /journal y las
 * relacionadas. `entrada.html?e=<slug>` sigue funcionando (shell SPA) pero es noindex → NO se
 * enlaza (era un callejón sin salida para Google).
 */
export function entryHref(slug) {
    return `/journal/${encodeURIComponent(String(slug || ''))}.html`;
}

// Masthead chrome (NO es contenido dinámico; identidad/branding evergreen, sin claims
// fabricados). Solo se pinta cuando hay entradas reales (journal-preview se oculta si no).
export const JOURNAL_ISSUE = {
    number: 'The Journal',
    date: '',
    est: 'EST. 2014',
};

export const JOURNAL_TICKER = [
    'Alta joyería · Esmeraldas colombianas',
    'Atelier en Cartagena de Indias · Cita previa',
    'Piezas únicas y series muy limitadas',
    'Oro 18K · Diamantes certificados',
];

/**
 * Entradas vivas (Firestore, PUBLICADAS, normalizadas y COMPLETAS). Sin baked: [] si no hay.
 * Re-aplica isJournalComplete (title+imagen+resumen) para que una entrada legacy
 * publicada-incompleta NO se pinte rota en el home/archivo/detalle (defensa en profundidad
 * cero-ficción Fase B: el render no depende solo de la regla server-side).
 */
/** Orden editorial: `order` asc (menor = primero); sin order → al final; desempate fecha desc + slug. */
function byOrder(a, b) {
    const ao = a.order == null ? Infinity : a.order;
    const bo = b.order == null ? Infinity : b.order;
    if (ao !== bo) return ao - bo;
    if (a.iso !== b.iso) return (b.iso || '').localeCompare(a.iso || '');   // más reciente primero
    return (a.slug || '').localeCompare(b.slug || '');
}

function entries() {
    const live = data.getJournal();
    return Array.isArray(live)
        ? live.map(normalizeEntry).filter(e => isJournalComplete(e).complete).sort(byOrder)
        : [];
}

/** Todas las entradas visibles (publicadas), en su orden editorial. */
export function getAll() {
    return entries();
}

/**
 * La PORTADA del Journal: la marcada `cover`. Fallback (transición / sin cover elegida):
 * la marcada `featured`, luego la 1ª por orden. null si no hay ninguna.
 */
export function getCover() {
    const all = entries();
    return all.find(e => e.cover) || all.find(e => e.featured) || all[0] || null;
}

/** DESTACADAS (franja de abajo del home): marcadas `featured`, excluyendo la portada, en orden. */
export function getDestacadas(n = Infinity) {
    const cover = getCover();
    const coverSlug = cover ? cover.slug : null;
    return entries().filter(e => e.featured && e.slug !== coverSlug).slice(0, n);
}

/** El listado completo menos la portada (fuente del archivo y de "Más leídos"), en orden. */
export function getListado() {
    const cover = getCover();
    const coverSlug = cover ? cover.slug : null;
    return entries().filter(e => e.slug !== coverSlug);
}

/** Busca una entrada por slug. */
export function getEntryBySlug(slug) {
    return entries().find(e => e.slug === slug) || null;
}

/** Hasta N entradas de la misma sección, excluyendo el slug dado. */
export function getRelated(slug, n = 3) {
    const all   = entries();
    const entry = all.find(e => e.slug === slug);
    if (!entry) return [];
    let related = all.filter(e => e.section === entry.section && e.slug !== slug);
    if (related.length < n) {
        const fillers = all.filter(e => e.slug !== slug && !related.includes(e));
        related = [...related, ...fillers];
    }
    return related.slice(0, n);
}
