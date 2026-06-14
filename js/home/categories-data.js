/**
 * Home · Categorías — mapeo PURO colecciones → tarjetas del dock (testeable sin
 * Firebase). El render (categories.js) aplica safeUrl/escape; aquí solo la lógica
 * de datos: derivar tarjetas de las colecciones reales, con FALLBACK "baked" si
 * aún no hay ninguna (bootstrap, cero downtime) y hue por defecto rotativo.
 */

// Fallback de arranque: SOLO si Firestore aún no tiene colecciones.
export const BAKED = [
    { name: 'Anillos',   slug: 'anillos',         img: '/img/ring-sapphire-800.webp',        hue: 200, pos: 'center' },
    { name: 'Topos',     slug: 'topos-aretes',    img: '/img/earrings-travertino-800.webp',  hue: 30,  pos: 'center' },
    { name: 'Argollas',  slug: 'argollas',        img: '/img/earrings-emerald-800.webp',     hue: 155, pos: 'center' },
    { name: 'Dijes',     slug: 'dijes-colgantes', img: '/img/model-emerald-800.webp',        hue: 155, pos: 'center top' },
    { name: 'Pulseras',  slug: 'pulseras',        img: '/img/banner-hero-800.webp',          hue: 90,  pos: 'center' },
    { name: 'Editorial', slug: 'editorial',       img: '/img/model-emerald-800.webp',        hue: 155, pos: 'center' },
];

const HUE_PALETTE = [200, 30, 155, 90, 280, 340, 50, 320];

/** Colecciones (docs Firestore) → descriptores de tarjeta. Vacío → BAKED. */
export function cardsFrom(collections) {
    if (!Array.isArray(collections) || collections.length === 0) return BAKED;
    return collections.map((c, i) => ({
        name: (c && (c.name || c.slug)) || 'Colección',
        slug: (c && (c.slug || c.id)) || '',
        img: (c && (c.img || c.bannerUrl)) || '',
        hue: (c && Number.isFinite(c.hue)) ? c.hue : HUE_PALETTE[i % HUE_PALETTE.length],
        pos: (c && typeof c.pos === 'string') ? c.pos : 'center',
    }));
}
