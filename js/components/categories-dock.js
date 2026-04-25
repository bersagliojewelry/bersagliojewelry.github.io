/**
 * Bersaglio Jewelry — Categories Dock (home)
 *
 * iOS-style gel-circle dock that mirrors admin-managed collections in real time.
 * Each entry shows: gem icon, collection name, live piece count.
 *
 * Data flow:
 *   db.getCollections()           → admin-managed collection docs
 *   db.getByCollection(slug)      → derived live count (in case stored count is stale)
 *   db.onChange(render)           → re-render on any pieces/collections change
 *
 * Linkage:
 *   If a static catalog page exists at <slug>.html → link there.
 *   Otherwise → link to colecciones.html?col=<slug>.
 *
 * Visual mapping (slug → glyph + hue) is purely cosmetic; if a collection slug
 * is unknown, defaults to a diamond glyph with emerald hue.
 */

import db from '../data/catalog.js';

// ─── Static visual mapping (slug → cosmetic) ──────────────────────────────
// Hue values pulled from the Liquid Glass design tokens (oklch chroma 155/85/200/30).
const VISUAL_MAP = {
    'anillos':         { glyph: '◈', hue: 155 },
    'topos-aretes':    { glyph: '◉', hue: 85  },
    'argollas':        { glyph: '○', hue: 155 },
    'dijes-colgantes': { glyph: '◇', hue: 200 },
    'pulseras':        { glyph: '◐', hue: 30  },
    'editorial':       { glyph: '✦', hue: 155 },
    'collares':        { glyph: '◈', hue: 200 },
};
const DEFAULT_VISUAL = { glyph: '◈', hue: 155 };

// Static page slugs that have a dedicated catalog HTML file.
const STATIC_PAGES = new Set([
    'anillos',
    'topos-aretes',
    'argollas',
    'dijes-colgantes',
]);

function escapeHtml(s) {
    return String(s ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function categoryHref(slug) {
    return STATIC_PAGES.has(slug) ? `${slug}.html` : `colecciones.html?col=${encodeURIComponent(slug)}`;
}

function pluralPiezas(n) {
    return n === 1 ? '1 pieza' : `${n} piezas`;
}

let _lastSignature = null;

export function renderCategoriesDock() {
    const dock = document.getElementById('categories-dock');
    if (!dock) return;

    const collections = db.getCollections();

    // Compute live count by filtering pieces — guarantees freshness even if
    // collection.pieces stored count is stale.
    const items = collections.map(col => {
        const slug    = col.slug || col.id;
        const visual  = VISUAL_MAP[slug] || DEFAULT_VISUAL;
        const count   = db.getByCollection(slug).length;
        const name    = col.name || slug;
        return { slug, name, count, glyph: visual.glyph, hue: visual.hue, href: categoryHref(slug) };
    });

    // If no admin collections yet, fall back to the static catalog pages so
    // users still see a populated dock during initial setup.
    const fallback = items.length === 0
        ? [
            { slug: 'anillos',         name: 'Anillos',  count: 0, ...VISUAL_MAP['anillos'],         href: 'anillos.html' },
            { slug: 'topos-aretes',    name: 'Topos',    count: 0, ...VISUAL_MAP['topos-aretes'],    href: 'topos-aretes.html' },
            { slug: 'argollas',        name: 'Argollas', count: 0, ...VISUAL_MAP['argollas'],        href: 'argollas.html' },
            { slug: 'dijes-colgantes', name: 'Dijes',    count: 0, ...VISUAL_MAP['dijes-colgantes'], href: 'dijes-colgantes.html' },
        ]
        : null;

    const final = fallback || items;

    // Dedupe re-renders when nothing changed
    const sig = JSON.stringify(final);
    if (sig === _lastSignature) return;
    _lastSignature = sig;

    dock.innerHTML = final.map(c => `
        <a href="${escapeHtml(c.href)}" class="glass hero-aqua-cat" data-slug="${escapeHtml(c.slug)}" aria-label="Ver colección ${escapeHtml(c.name)}">
            <div class="hero-aqua-cat-gem" style="--hue: ${c.hue}" aria-hidden="true">${escapeHtml(c.glyph)}</div>
            <div class="hero-aqua-cat-name">${escapeHtml(c.name)}</div>
            <div class="hero-aqua-cat-count mono">${escapeHtml(pluralPiezas(c.count))}</div>
        </a>
    `).join('');
}

/**
 * Wire real-time updates so the dock count auto-refreshes when admin
 * adds, removes, or moves pieces.
 */
export function initCategoriesDock() {
    if (!document.getElementById('categories-dock')) return;
    renderCategoriesDock();
    db.onChange(() => renderCategoriesDock());
}
