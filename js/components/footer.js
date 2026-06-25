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
// Iconos de marca OFICIALES (Simple Icons, rellenos viewBox 24) — reconocibles al instante.
// Cada uno es un <svg> completo (fill=currentColor) → el render los emite tal cual.
const SOCIAL = [
    {
        key: 'instagram',
        label: 'Instagram',
        svg: html`<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>`,
    },
    {
        key: 'facebook',
        label: 'Facebook',
        svg: html`<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`,
    },
    {
        key: 'tiktok',
        label: 'TikTok',
        svg: html`<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>`,
    },
    {
        key: 'whatsapp',
        label: 'WhatsApp',
        svg: html`<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>`,
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
                                    ${s.svg}
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
