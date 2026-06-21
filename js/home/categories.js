/**
 * Home · Sección 3 — Categorías (dock iOS). DINÁMICO: las tarjetas derivan de las
 * COLECCIONES de Firestore (`data.getCollections()`), administrables desde el panel
 * (CMS). CERO-FICCIÓN (`feedback_no_demo_en_index`): sin colecciones `cardsFrom`
 * devuelve [] → la sección se monta VACÍA (CSS `:empty` la colapsa a 0px), JAMÁS
 * categorías de ejemplo. Imágenes vía `<img src=safeUrl>` (NO background-image: el
 * contexto CSS url() permite breakouts que escape() no cubre).
 *
 * PATRÓN (L-42, espejo de films/social/journal/featured): `renderCategories()` SIEMPRE
 * devuelve el `<section class="home-cats">` envoltorio (con el inner vacío si no hay
 * datos); `refreshCategories()` rellena ese contenedor existente en cada data.onChange().
 * El bug previo: `render` devolvía '' sin sección → `refresh` no podía CREARLA → una
 * colección nueva no aparecía ni en vivo ni al recargar (el primer paint es sin datos).
 */
import { html, escape, mount } from '../core/html.js';
import { data } from '../core/data.js';
import { safeUrl } from '../core/safe-url.js';
import { cardsFrom } from './categories-data.js';

const FALLBACK_IMG = '/img/banner-hero-800.webp';
// object-position permitido (anti CSS-injection si 'pos' se vuelve editable).
const POS_RE = /^(left|right|center|top|bottom|\d{1,3}%|\s)+$/i;
const safePos = (p) => (typeof p === 'string' && POS_RE.test(p.trim()) ? p.trim() : 'center');

// Tarjetas a renderizar: las colecciones reales (vacío → [] → sección colapsada).
const cards = () => cardsFrom(data.getCollections());

function tile(c) {
    const count = data.countByCollection(c.slug);
    const img = escape(safeUrl(c.img, FALLBACK_IMG));
    return html`
        <a class="glass cat-tile"
           href="/colecciones.html?col=${escape(c.slug)}"
           style="--cat-hue:${escape(String(c.hue))}">
            <div class="cat-tile-inner">
                <div class="cat-tile-img">
                    <img src="${img}" alt="${escape(c.name)}" loading="lazy" decoding="async"
                         style="width:100%;height:100%;object-fit:cover;object-position:${escape(safePos(c.pos))};display:block;">
                </div>
                <div class="cat-tile-overlay"></div>
                <div class="cat-tile-content">
                    <div class="cat-tile-name">${escape(c.name)}</div>
                    <div class="mono cat-tile-count">${count > 0 ? `${count} piezas` : 'Próximamente'}</div>
                </div>
            </div>
        </a>`;
}

export function renderCategories() {
    return html`<section class="home-cats">${categoriesInner()}</section>`;
}

// Contenido interno (re-renderizable en vivo). Sin colecciones → '' (sección vacía,
// colapsada por CSS `:empty`; no-demo). Lee data.getCollections() AQUÍ, no en import.
function categoriesInner() {
    if (!cards().length) return '';
    return html`
        <div class="container">
            <div class="home-cats-header">
                <div class="eyebrow">Colecciones singulares</div>
                <h2 class="home-cats-title">
                    La refracción del <span class="italic emerald-text">alma verde</span>
                </h2>
                <p class="home-cats-lead">
                    Nuestras colecciones son capítulos de una historia compartida. Cada anillo, arete y dije es esculpido pacientemente en oro de 18K, rindiendo homenaje al fuego interno y la mística de la esmeralda colombiana.
                </p>
            </div>

            <div class="cat-dock" data-categories>
                ${cards().map(tile)}
            </div>
        </div>`;
}

// Re-render en vivo (data.onChange) — espejo de refreshFilms/refreshFeatured. mount()
// rellena el contenedor SIEMPRE presente → una colección nueva aparece sin recargar.
export function refreshCategories() {
    const sec = document.querySelector('.home-cats');
    if (sec) mount(sec, categoriesInner());
}

export default { renderCategories, refreshCategories };
