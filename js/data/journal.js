/**
 * Bersaglio Jewelry — Journal entries (data layer).
 *
 * Los accessors (getFeatured/getNonFeatured/getAll/getEntryBySlug/getRelated) leen
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
 *   author · authorRole · image · featured · published
 */

import { data } from '../core/data.js';
import { isoToDisplay, normalizeEntry } from './journal-normalize.js';

// Re-export de los puros (un solo punto de import para los consumers/tests).
export { isoToDisplay, normalizeEntry };

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

/** Entradas vivas (Firestore, PUBLICADAS, normalizadas). Sin baked: [] si no hay. */
function entries() {
    const live = data.getJournal();
    return Array.isArray(live) ? live.map(normalizeEntry) : [];
}

/** Todas las entradas visibles (publicadas). */
export function getAll() {
    return entries();
}

/** La entrada destacada (cover), o la primera; null si no hay ninguna. */
export function getFeatured() {
    const all = entries();
    return all.find(e => e.featured) || all[0] || null;
}

/** Todas las entradas excepto la destacada. */
export function getNonFeatured() {
    const all  = entries();
    const feat = getFeatured();
    return feat ? all.filter(e => e.slug !== feat.slug) : all;
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
