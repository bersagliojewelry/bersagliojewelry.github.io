/**
 * Bersaglio Jewelry — Footer 4-col glass grid.
 *
 *   col 1 (1.3fr): logo + tagline + social icons (IG / FB / WA)
 *   col 2: Colecciones links · col 3: Casa links · col 4: Servicio links
 * + bottom bar: copyright + legales
 *
 * CMS `global` (increment 1): la tagline + las URLs de redes vienen de
 * merge(GLOBAL_DEFAULTS, siteContent/global) — editables desde el panel (Contenido web →
 * Datos globales). Pinta con DEFAULTS al instante (sin esperar Firestore) y re-pinta una
 * vez si llega un override. Las URLs van por safeUrl() (anti stored-XSS, repo público L-15).
 * Los links de navegación + legales son ESTRUCTURALES (no editables).
 *
 * Responsive: ≤820px → 2 cols · ≤520px → 1 col
 */

import { html, escape, mount } from '../core/html.js';
import { data } from '../core/data.js';
import { safeUrl } from '../core/safe-url.js';
import { mergeGlobal, waHref, igHref } from '../core/global-defaults.js';

const COLUMNS = [
    {
        title: 'Colecciones',
        links: [
            { label: 'Anillos',  href: '/colecciones.html?col=anillos' },
            { label: 'Aretes',   href: '/colecciones.html?col=topos-aretes' },
            { label: 'Collares', href: '/colecciones.html?col=dijes-colgantes' },
            { label: 'Argollas', href: '/colecciones.html?col=argollas' },
        ],
    },
    {
        title: 'Casa',
        links: [
            { label: 'Nuestra historia', href: '/nosotros.html' },
            { label: 'Diseño a medida',  href: '/contacto.html?ref=diseno' },
            { label: 'Certificaciones',  href: '/nosotros.html#certificaciones' },
            { label: 'Journal',          href: '/journal.html' },
        ],
    },
    {
        title: 'Servicio',
        links: [
            { label: 'Contacto',  href: '/contacto.html' },
            { label: 'Asesoría',  href: '/contacto.html?ref=asesoria' },
            { label: 'Envíos',    href: '/contacto.html?ref=envios' },
            { label: 'Garantía',  href: '/contacto.html?ref=garantia' },
        ],
    },
];

// El href de cada red viene de global.redes[key] (editable); svg/label fijos.
const SOCIAL = [
    {
        key: 'instagram',
        label: 'Instagram',
        svg: html`
            <rect x="3" y="3" width="18" height="18" rx="5"/>
            <circle cx="12" cy="12" r="4"/>
            <circle cx="17.5" cy="6.5" r="1" fill="currentColor"/>`,
    },
    {
        key: 'facebook',
        label: 'Facebook',
        svg: html`<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>`,
    },
    {
        key: 'tiktok',
        label: 'TikTok',
        svg: html`<path d="M16 3c.3 2.1 1.7 3.6 3.8 3.9v2.6c-1.4.1-2.7-.3-3.8-1V14a5 5 0 1 1-5-5c.3 0 .6 0 .9.1v2.7a2.3 2.3 0 1 0 1.6 2.2V3z"/>`,
    },
    {
        key: 'whatsapp',
        label: 'WhatsApp',
        svg: html`
            <path d="M20.5 3.5A11 11 0 0 0 3.4 17l-1.4 5.1 5.2-1.4A11 11 0 1 0 20.5 3.5z"/>
            <path d="M8 10.5c.3 2 2 3.7 4 4.2 1 .3 1.9.1 2.5-.5.2-.2.4-.5.3-.8l-.3-.9c-.1-.3-.4-.4-.7-.4l-1 .2c-.2 0-.4 0-.6-.2-.5-.4-1-.9-1.3-1.5-.1-.2-.1-.4 0-.5l.4-.6c.2-.2.2-.5.1-.7l-.5-1c-.1-.3-.4-.4-.7-.4l-.9.2c-.4.1-.6.4-.6.8 0 .7.1 1.4.3 2z"/>`,
    },
];

function logoSVG() {
    return html`
        <svg width="36" height="38" viewBox="0 0 80 84" fill="none" aria-hidden="true" style="display:block">
            <circle cx="40" cy="42" r="28" stroke="var(--bj-emerald-800)" stroke-width="1.2" opacity="0.85" fill="none"/>
            <line x1="40" y1="4" x2="40" y2="80" stroke="var(--bj-emerald-800)" stroke-width="0.8" opacity="0.5"/>
            <text x="40" y="54" text-anchor="middle" font-family="Fraunces, serif" font-weight="600" font-size="32" fill="var(--bj-emerald-800)">B</text>
        </svg>`;
}

/** HTML del footer a partir del contenido global merged (PURO). */
function footerHTML(g) {
    const year = new Date().getFullYear();
    // Fuente única: IG/WA se derivan de g.contacto; Facebook vive en g.redes.
    const socialHref = (key) =>
        key === 'instagram' ? igHref(g.contacto.instagram)
      : key === 'whatsapp'  ? waHref(g.contacto.whatsapp)
      : (g.redes[key] || '');
    return html`
        <footer class="bj-footer" role="contentinfo">
            <div class="container">
                <div class="glass glass-iridescent bj-footer-grid">
                    <div class="bj-footer-brand">
                        <div class="bj-footer-logo-row">
                            ${logoSVG()}
                            <div class="bj-footer-brand-name">BERSAGLIO</div>
                        </div>
                        <p class="bj-footer-tagline">${escape(g.footer.tagline)}</p>
                        <div class="bj-footer-social">
                            ${SOCIAL.map(s => html`
                                <a href="${escape(safeUrl(socialHref(s.key)))}"
                                   class="bj-footer-social-btn"
                                   aria-label="${escape(s.label)}"
                                   target="_blank"
                                   rel="noopener noreferrer">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                                        ${s.svg}
                                    </svg>
                                </a>`)}
                        </div>
                    </div>

                    ${COLUMNS.map(col => html`
                        <div class="bj-footer-col">
                            <div class="eyebrow bj-footer-col-title">${escape(col.title)}</div>
                            <ul class="bj-footer-col-list">
                                ${col.links.map(l => html`
                                    <li><a href="${l.href}">${escape(l.label)}</a></li>`)}
                            </ul>
                        </div>`)}
                </div>

                <div class="bj-footer-meta">
                    <span>© ${year} Bersaglio Jewelry · Cartagena de Indias, Colombia</span>
                    <div class="bj-footer-legal">
                        <a href="/terminos.html">Términos</a>
                        <span aria-hidden="true">·</span>
                        <a href="/privacidad.html#cookies">Cookies</a>
                        <span aria-hidden="true">·</span>
                        <a href="/privacidad.html">Privacidad</a>
                    </div>
                </div>
            </div>
        </footer>`;
}

export function mountFooter() {
    const root = document.getElementById('footer-mount');
    if (!root) return;
    const paint = () => mount(root, footerHTML(mergeGlobal(data.getSiteContent('global'))));
    paint();   // DEFAULTS al instante (sin esperar Firestore)
    // CMS global: re-pinta una vez si hay override editado desde el panel.
    data.loadSiteContent('global')
        .then(() => { if (document.getElementById('footer-mount')) paint(); })
        .catch(() => { /* offline / sin doc → quedan los defaults */ });
}

export default { mountFooter };
