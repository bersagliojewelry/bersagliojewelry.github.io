/**
 * Home · Sección 5 — Editorial (split image + manifiesto). DINÁMICO (CMS P1): textos
 * de merge(HOME_DEFAULTS, siteContent/home).editorial, editables desde el panel.
 * Primer paint con DEFAULTS; refreshEditorial() re-pinta si llega override (home.js).
 * Todo texto editable va por escape(). Estructura/imagen = estandarizada.
 */
import { html, escape, mount } from '../core/html.js';
import { data } from '../core/data.js';
import { safeUrl } from '../core/safe-url.js';
import { mergeHome } from './siteContent-defaults.js';

export function editorialInner(c) {
    const stats = [
        { num: c.stat1Num, lab: c.stat1Lab },
        { num: c.stat2Num, lab: c.stat2Lab },
        { num: c.stat3Num, lab: c.stat3Lab },
    ];
    return html`
            <div class="container">
                <div class="home-editorial-grid">
                    <div class="glass glass-iridescent home-editorial-image">
                        ${c.image
                            ? html`<div class="home-editorial-image-bg" style="background-image:url('${escape(safeUrl(c.image))}')"></div>`
                            : html`<div class="home-editorial-image-bg"></div>`}
                        <div class="home-editorial-image-shade"></div>
                        <div class="home-editorial-image-content">
                            <div class="chip home-editorial-chip">
                                <span class="chip-dot"></span>${escape(c.chip)}
                            </div>
                            <h3 class="home-editorial-image-title">${escape(c.imageTitle)}</h3>
                            <p class="home-editorial-image-sub">${escape(c.imageSub)}</p>
                        </div>
                    </div>

                    <div class="glass home-editorial-text">
                        <div class="eyebrow">${escape(c.eyebrow)}</div>
                        <h2 class="home-editorial-title">
                            ${escape(c.title1)}<br>
                            <span class="italic emerald-text">${escape(c.title2)}</span>
                        </h2>
                        <p class="home-editorial-lead">${escape(c.lead)}</p>
                        <blockquote class="home-editorial-quote">${escape(c.quote)}</blockquote>
                        <div class="home-editorial-stats">
                            ${stats.map(s => html`
                            <div class="home-editorial-stat">
                                <div class="display home-editorial-stat-num">${escape(s.num)}</div>
                                <div class="eyebrow home-editorial-stat-lab">${escape(s.lab)}</div>
                            </div>`)}
                        </div>
                    </div>
                </div>
            </div>`;
}

export function renderEditorial() {
    const c = mergeHome(data.getSiteContent('home')).editorial;
    return html`<section class="home-editorial">${editorialInner(c)}</section>`;
}

/** Re-pinta el editorial cuando llega el override de siteContent (desde home.js). */
export function refreshEditorial() {
    const sec = document.querySelector('.home-editorial');
    if (!sec) return;
    mount(sec, editorialInner(mergeHome(data.getSiteContent('home')).editorial));
}

export default { renderEditorial, refreshEditorial };
