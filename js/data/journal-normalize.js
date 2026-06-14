/**
 * js/data/journal-normalize.js — Mapeo PURO de un doc Firestore de journal a la
 * forma de display que consumen las páginas (date 'DD·MM·YY' + dateLong
 * 'Marzo 2026'). Sin dependencias de Firebase/DOM → testeable en Node
 * (tests/journal-normalize.test.mjs). journal.js lo importa y re-exporta.
 */

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
               'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

/** 'YYYY-MM-DD' → { short:'DD·MM·YY', long:'Marzo 2026' } (vacío si no es ISO). */
export function isoToDisplay(iso) {
    const m = String(iso ?? '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return { short: '', long: '' };
    const [, y, mo, d] = m;
    const mes = MESES[parseInt(mo, 10) - 1];
    return {
        short: `${d}·${mo}·${y.slice(2)}`,
        long:  mes ? `${mes.charAt(0).toUpperCase()}${mes.slice(1)} ${y}` : y,
    };
}

/** Doc Firestore de journal → entrada con la forma que consumen las páginas. */
export function normalizeEntry(doc) {
    const dt = isoToDisplay(doc.date);
    return {
        slug:       doc.slug || doc.id || '',
        section:    doc.section    || '',
        kicker:     doc.kicker     || '',
        title:      doc.title      || '',
        excerpt:    doc.excerpt    || '',
        body:       doc.body       || '',
        date:       dt.short,
        dateLong:   dt.long,
        read:       doc.read       || '',
        author:     doc.author     || '',
        authorRole: doc.authorRole || '',
        image:      doc.image      || '',
        featured:   !!doc.featured,
    };
}
