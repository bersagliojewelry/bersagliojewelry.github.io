/**
 * Home · Sección 3 — Categorías (dock iOS). El conteo por colección es DINÁMICO
 * (data.countByCollection). refreshCategories() actualiza solo el texto del conteo.
 */
import { html, escape } from '../core/html.js';
import { data } from '../core/data.js';

const CATEGORIES = [
    { name: 'Anillos',   slug: 'anillos',         img: '/img/ring-sapphire-800.webp',        hue: 200, pos: 'center' },
    { name: 'Topos',     slug: 'topos-aretes',    img: '/img/earrings-travertino-800.webp',  hue: 30,  pos: 'center' },
    { name: 'Argollas',  slug: 'argollas',        img: '/img/earrings-emerald-800.webp',     hue: 155, pos: 'center' },
    { name: 'Dijes',     slug: 'dijes-colgantes', img: '/img/model-emerald-800.webp',        hue: 155, pos: 'center top' },
    { name: 'Pulseras',  slug: 'pulseras',        img: '/img/banner-hero-800.webp',          hue: 90,  pos: 'center' },
    { name: 'Editorial', slug: 'editorial',       img: '/img/model-emerald-800.webp',        hue: 155, pos: 'center' },
];

export function renderCategories() {
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
                    ${CATEGORIES.map(c => {
                        const count = data.countByCollection(c.slug);
                        return html`
                            <a class="glass cat-tile"
                               href="/colecciones.html?col=${escape(c.slug)}"
                               style="--cat-hue:${c.hue}">
                                <div class="cat-tile-inner">
                                    <div class="cat-tile-img" style="background:url('${escape(c.img)}') ${escape(c.pos)}/cover"></div>
                                    <div class="cat-tile-overlay"></div>
                                    <div class="cat-tile-content">
                                        <div class="cat-tile-name">${escape(c.name)}</div>
                                        <div class="mono cat-tile-count">${count > 0 ? `${count} piezas` : 'Próximamente'}</div>
                                    </div>
                                </div>
                            </a>`;
                    })}
                </div>
            </div>
        </section>`;
}

export function refreshCategories() {
    const dock = document.querySelector('[data-categories]');
    if (!dock) return;
    // Update only the count text, leave the rest alone (avoids image flash)
    const tiles = dock.querySelectorAll('.cat-tile');
    tiles.forEach((tile, idx) => {
        const c = CATEGORIES[idx];
        if (!c) return;
        const count = data.countByCollection(c.slug);
        const countEl = tile.querySelector('.cat-tile-count');
        if (countEl) countEl.textContent = count > 0 ? `${count} piezas` : 'Próximamente';
    });
}

export default { renderCategories, refreshCategories };
