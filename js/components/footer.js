/**
 * Bersaglio Jewelry — Footer 4-col glass grid.
 *
 * Mirror exact de BERSAGLIO NOVO/project/js/shell.jsx (Footer L249-307):
 *   col 1 (1.3fr): logo + tagline + social icons (IG / FB / WA)
 *   col 2: Colecciones links
 *   col 3: Casa links
 *   col 4: Servicio links
 * + bottom bar: copyright + Certificado JA
 *
 * Responsive:
 *   ≤820px → 2 cols
 *   ≤520px → 1 col
 */

import { html, escape } from '../core/html.js';

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

const SOCIAL = [
    {
        key: 'instagram',
        href: 'https://www.instagram.com/bersagliojewelry/',
        label: 'Instagram',
        svg: html`
            <rect x="3" y="3" width="18" height="18" rx="5"/>
            <circle cx="12" cy="12" r="4"/>
            <circle cx="17.5" cy="6.5" r="1" fill="currentColor"/>`,
    },
    {
        key: 'facebook',
        href: 'https://www.facebook.com/bersagliojewelry',
        label: 'Facebook',
        svg: html`<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>`,
    },
    {
        key: 'whatsapp',
        href: 'https://wa.me/573001234567',
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

export function mountFooter() {
    const root = document.getElementById('footer-mount');
    if (!root) return;

    const year = new Date().getFullYear();

    root.innerHTML = html`
        <footer class="bj-footer" role="contentinfo">
            <div class="container">
                <div class="glass glass-iridescent bj-footer-grid">
                    <div class="bj-footer-brand">
                        <div class="bj-footer-logo-row">
                            ${logoSVG()}
                            <div class="bj-footer-brand-name">BERSAGLIO</div>
                        </div>
                        <p class="bj-footer-tagline">
                            Alta joyería con esmeraldas colombianas, diamantes certificados
                            y oro 18K. Piezas diseñadas para trascender generaciones.
                        </p>
                        <div class="bj-footer-social">
                            ${SOCIAL.map(s => html`
                                <a href="${s.href}"
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
                    <span>Certificado JA · Jewelers of America</span>
                </div>
            </div>
        </footer>`;
}

export default { mountFooter };
