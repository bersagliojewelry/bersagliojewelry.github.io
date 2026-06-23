/**
 * Home · Categorías — mapeo PURO colecciones → tarjetas del dock (testeable sin
 * Firebase). El render (categories.js) aplica safeUrl/escape; aquí solo la lógica
 * de datos: derivar tarjetas de las colecciones reales + hue por defecto rotativo.
 *
 * NO-DEMO (B3 · gran plan §4): sin colecciones devuelve [] → la sección se OCULTA
 * (categories.js), NO muestra demo. El bug que reportó Daniel (categorías demo
 * cuando no hay colecciones) se corrige aquí: el contenido lo carga Kary (admin de
 * colecciones); vacío = ausente, no inventado.
 */

const HUE_PALETTE = [200, 30, 155, 90, 280, 340, 50, 320];

/** Colecciones (docs Firestore) → descriptores de tarjeta. Vacío → [] (no-demo). */
export function cardsFrom(collections) {
    if (!Array.isArray(collections) || collections.length === 0) return [];
    return collections.map((c, i) => ({
        name: (c && (c.name || c.slug)) || 'Colección',
        slug: (c && (c.slug || c.id)) || '',
        img: (c && (c.img || c.bannerUrl)) || '',
        imgLqip: (c && (c.imgLqip || c.bannerLqip)) || '',   // §108 F3: blur-up (vacío → sin blur)
        hue: (c && Number.isFinite(c.hue)) ? c.hue : HUE_PALETTE[i % HUE_PALETTE.length],
        pos: (c && typeof c.pos === 'string') ? c.pos : 'center',
    }));
}
