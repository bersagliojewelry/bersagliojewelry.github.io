/**
 * Home · Sección 7 — Atelier ("El viaje de creación de una pieza de culto"). DINÁMICO
 * (CMS P2): textos de merge(HOME_DEFAULTS, siteContent/home).atelier, editables desde
 * el panel (Textos del Home → Atelier). Estructura (joya/halo/anillo/líneas) + posición
 * de las 4 tarjetas (corner por índice) = ESTANDARIZADO. Texto por escape(), href por safeUrl().
 */
import { html, escape, mount } from '../core/html.js';
import { data } from '../core/data.js';
import { safeUrl } from '../core/safe-url.js';
import { mergeHome } from './siteContent-defaults.js';

function atelierInner(c) {
    const steps = [
        { t: c.step1Title, d: c.step1Desc, corner: 0 },
        { t: c.step2Title, d: c.step2Desc, corner: 1 },
        { t: c.step3Title, d: c.step3Desc, corner: 2 },
        { t: c.step4Title, d: c.step4Desc, corner: 3 },
    ];
    return html`
            <div class="container">
                <div class="home-atelier-header">
                    <div class="chip"><span class="chip-dot"></span>${escape(c.chip)}</div>
                    <h2 class="home-atelier-title">
                        ${escape(c.title1)} <span class="italic emerald-text">${escape(c.title2)}</span>
                    </h2>
                    <p class="home-atelier-lead">${escape(c.lead)}</p>
                </div>

                <div class="glass glass-iridescent at-stage">
                    <svg class="at-flow" viewBox="0 0 1000 560" preserveAspectRatio="none" aria-hidden="true">
                        <defs>
                            <linearGradient id="at-flow-g" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stop-color="oklch(80% 0.13 85)" stop-opacity="0.05"/>
                                <stop offset="100%" stop-color="oklch(68% 0.15 155)" stop-opacity="0.65"/>
                            </linearGradient>
                        </defs>
                        <g fill="none" stroke="url(#at-flow-g)" stroke-width="1.5" stroke-dasharray="2 9" stroke-linecap="round" vector-effect="non-scaling-stroke">
                            <path class="at-flow-1" d="M180 150 Q 370 268 470 278"/>
                            <path class="at-flow-2" d="M820 150 Q 630 268 530 278"/>
                            <path class="at-flow-3" d="M180 410 Q 370 292 470 282"/>
                            <path class="at-flow-4" d="M820 410 Q 630 292 530 282"/>
                        </g>
                    </svg>

                    <div aria-hidden="true" class="at-halo"></div>
                    <div aria-hidden="true" class="at-ring"></div>

                    <div class="at-jewel">
                        <img src="/img/gema.png" alt="Esmeralda Bersaglio engastada en oro 18K" class="at-jewel-img" loading="lazy" decoding="async">
                    </div>

                    ${steps.map(s => html`
                        <div class="at-card at-card--corner-${s.corner}">
                            <div class="at-card-title"><span class="at-card-dot" aria-hidden="true"></span>${escape(s.t)}</div>
                            <p class="at-card-desc">${escape(s.d)}</p>
                        </div>`)}

                    <div class="at-cta">
                        <a href="${escape(safeUrl(c.ctaHref, '/contacto.html'))}" class="btn-aqua btn-aqua-emerald">
                            ${escape(c.ctaLabel)}
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
                        </a>
                    </div>
                </div>
            </div>`;
}

export function renderAtelier() {
    return html`<section class="home-atelier">${atelierInner(mergeHome(data.getSiteContent('home')).atelier)}</section>`;
}

/** Re-pinta el atelier cuando llega el override de siteContent (desde home.js). */
export function refreshAtelier() {
    const sec = document.querySelector('.home-atelier');
    if (!sec) return;
    mount(sec, atelierInner(mergeHome(data.getSiteContent('home')).atelier));
}

export default { renderAtelier, refreshAtelier };
