/**
 * Home · Sección 3 — Categorías (dock iOS). DINÁMICO: las tarjetas derivan de las
 * COLECCIONES de Firestore (`data.getCollections()`), administrables desde el panel
 * (CMS). Fallback "baked" solo si aún no hay colecciones (bootstrap, cero downtime).
 * Imágenes vía `<img src=safeUrl>` (NO background-image: el contexto CSS url()
 * permite breakouts que escape() no cubre). refreshCategories() re-renderiza al
 * cambiar las colecciones/conteos (imágenes cacheadas → flash mínimo).
 */
import { html, escape, mount } from '../core/html.js';
import { data } from '../core/data.js';
import { safeUrl } from '../core/safe-url.js';
import { cardsFrom } from './categories-data.js';

const FALLBACK_IMG = '/img/banner-hero-800.webp';
// object-position permitido (anti CSS-injection si 'pos' se vuelve editable).
const POS_RE = /^(left|right|center|top|bottom|\d{1,3}%|\s)+$/i;
const safePos = (p) => (typeof p === 'string' && POS_RE.test(p.trim()) ? p.trim() : 'center');

// Tarjetas a renderizar: las colecciones reales o, si no hay ninguna, el bootstrap.
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
    // NO-DEMO (B3 §4): sin colecciones, la sección no se monta (cero demo). Reaparece
    // al recargar cuando Kary cree la primera colección (bootstrap puntual).
    if (!cards().length) return '';
    return html`
        <section class="home-cats">
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
            </div>
        </section>`;
}

export function refreshCategories() {
    const cs = cards();
    const sec = document.querySelector('.home-cats');
    // NO-DEMO: si se quedó sin colecciones (Kary las borró), retirar la sección.
    if (!cs.length) { if (sec) sec.remove(); return; }
    const dock = sec?.querySelector('[data-categories]');
    if (!dock) return;   // cargó vacía (sin sección); aparecerá al recargar
    // Re-render completo al cambiar el set o los conteos. mount() centraliza el
    // innerHTML en html.js; todo valor dinámico va por escape()/safeUrl().
    mount(dock, cs.map(tile).join(''));
}

export default { renderCategories, refreshCategories };
