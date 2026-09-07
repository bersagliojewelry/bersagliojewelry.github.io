/**
 * Home · Sección 9 — CTA Cartagena ("Nuestra Maison · Cartagena de Indias"). DINÁMICO
 * (CMS P2): textos + botones de acción de merge(HOME_DEFAULTS, siteContent/home).cta,
 * editables desde el panel (Textos del Home → CTA). Texto por escape(), hrefs por safeUrl().
 */
import { html, escape, mount } from '../core/html.js';
import { data } from '../core/data.js';
import { safeUrl } from '../core/safe-url.js';
import { mergeHome } from './siteContent-defaults.js';

export function ctaInner(c) {
    return html`
            <div class="container">
                <div class="glass glass-iridescent home-cta-card">
                    <div class="home-cta-glow" aria-hidden="true"></div>
                    <div class="home-cta-content">
                        <div class="eyebrow">${escape(c.eyebrow)}</div>
                        <h2 class="home-cta-title">
                            ${escape(c.title1)}<br>
                            <span class="italic emerald-text">${escape(c.title2)}</span>
                        </h2>
                        <p class="home-cta-lead">${escape(c.lead)}</p>
                        <div class="home-cta-actions">
                            <a href="${escape(safeUrl(c.cta1Href, '/contacto.html'))}" class="btn-aqua btn-aqua-emerald">${escape(c.cta1Label)}</a>
                            <a href="${escape(safeUrl(c.cta2Href, '/colecciones.html'))}" class="btn-aqua">${escape(c.cta2Label)}</a>
                        </div>
                        <div class="mono home-cta-address">${escape(c.address)}</div>
                    </div>
                </div>
            </div>`;
}

export function renderCTA() {
    return html`<section class="home-cta">${ctaInner(mergeHome(data.getSiteContent('home')).cta)}</section>`;
}

/** Re-pinta el CTA cuando llega el override de siteContent (desde home.js). */
export function refreshCTA() {
    const sec = document.querySelector('.home-cta');
    if (!sec) return;
    mount(sec, ctaInner(mergeHome(data.getSiteContent('home')).cta));
}

export default { renderCTA, refreshCTA };
