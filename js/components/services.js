/**
 * Bersaglio Jewelry — Services Component V3
 * Showcase wheel layout: 4 services around central gem
 */

import db from '../data/catalog.js';

const serviceIcons = {
    gem: `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.1" aria-hidden="true">
        <polygon points="16,2 30,11 16,30 2,11"/>
        <line x1="2" y1="11" x2="30" y2="11"/>
        <polyline points="8,2 16,11 24,2"/>
        <line x1="16" y1="0.5" x2="16" y2="2" stroke-opacity="0.5"/>
        <line x1="31.5" y1="9" x2="30" y2="10" stroke-opacity="0.4"/>
        <line x1="0.5" y1="9" x2="2" y2="10" stroke-opacity="0.4"/>
        <line x1="31.5" y1="13" x2="30" y2="12" stroke-opacity="0.3"/>
        <line x1="0.5" y1="13" x2="2" y2="12" stroke-opacity="0.3"/>
    </svg>`,
    pencil: `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.1" aria-hidden="true">
        <circle cx="16" cy="16" r="12"/>
        <circle cx="16" cy="16" r="2.5" fill="currentColor" opacity="0.4"/>
        <line x1="16" y1="4" x2="16" y2="8"/>
        <line x1="16" y1="24" x2="16" y2="28"/>
        <line x1="4" y1="16" x2="8" y2="16"/>
        <line x1="24" y1="16" x2="28" y2="16"/>
        <line x1="7.5" y1="7.5" x2="10.3" y2="10.3"/>
        <line x1="21.7" y1="21.7" x2="24.5" y2="24.5"/>
        <line x1="24.5" y1="7.5" x2="21.7" y2="10.3"/>
        <line x1="10.3" y1="21.7" x2="7.5" y2="24.5"/>
    </svg>`,
    certificate: `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.1" aria-hidden="true">
        <path d="M16 30s10-4 10-12V7l-10-4-10 4v11c0 8 10 12 10 12z"/>
        <polyline points="11 16 14 19 21 12"/>
        <path d="M8 7c-2 0-3.5-1.5-3.5-3.5" stroke-opacity="0.5"/>
        <path d="M24 7c2 0 3.5-1.5 3.5-3.5" stroke-opacity="0.5"/>
        <path d="M5 4c-1 0-1.8-.8-1.8-1.8" stroke-opacity="0.3"/>
        <path d="M27 4c1 0 1.8-.8 1.8-1.8" stroke-opacity="0.3"/>
    </svg>`,
    shield: `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.1" aria-hidden="true">
        <path d="M6 4h20v14a10 10 0 0 1-20 0V4z"/>
        <polyline points="11 17 14 20 21 13"/>
        <line x1="6" y1="9" x2="26" y2="9" stroke-opacity="0.3"/>
        <path d="M2 4h4M26 4h4" stroke-opacity="0.4"/>
        <path d="M4 6v2M28 6v2" stroke-opacity="0.3"/>
    </svg>`
};

const centerGemSvg = `
<svg class="showcase-gem-svg" viewBox="0 0 120 140" fill="none" aria-hidden="true">
    <!-- Outer glow ring -->
    <circle cx="60" cy="70" r="56" stroke="rgba(200,169,110,0.12)" stroke-width="1"/>
    <!-- Gem facets -->
    <polygon points="60,10 108,44 60,130 12,44"
        fill="rgba(26,77,46,0.35)" stroke="rgba(200,169,110,0.65)" stroke-width="0.8"/>
    <line x1="12" y1="44" x2="108" y2="44" stroke="rgba(200,169,110,0.5)" stroke-width="0.7"/>
    <polyline points="32,10 60,44 88,10" stroke="rgba(200,169,110,0.45)" stroke-width="0.7"/>
    <!-- Inner facets -->
    <line x1="60" y1="10" x2="60" y2="44" stroke="rgba(200,169,110,0.3)" stroke-width="0.6"/>
    <line x1="12" y1="44" x2="60" y2="130" stroke="rgba(200,169,110,0.3)" stroke-width="0.6"/>
    <line x1="108" y1="44" x2="60" y2="130" stroke="rgba(200,169,110,0.3)" stroke-width="0.6"/>
    <line x1="32" y1="10" x2="12" y2="44" stroke="rgba(200,169,110,0.25)" stroke-width="0.5"/>
    <line x1="88" y1="10" x2="108" y2="44" stroke="rgba(200,169,110,0.25)" stroke-width="0.5"/>
    <!-- Radiance lines -->
    <line x1="60" y1="3" x2="60" y2="8" stroke="rgba(200,169,110,0.4)" stroke-width="0.8"/>
    <line x1="60" y1="132" x2="60" y2="137" stroke="rgba(200,169,110,0.3)" stroke-width="0.7"/>
    <line x1="4" y1="37" x2="9" y2="40" stroke="rgba(200,169,110,0.3)" stroke-width="0.7"/>
    <line x1="116" y1="37" x2="111" y2="40" stroke="rgba(200,169,110,0.3)" stroke-width="0.7"/>
    <line x1="3" y1="50" x2="8" y2="48" stroke="rgba(200,169,110,0.2)" stroke-width="0.6"/>
    <line x1="117" y1="50" x2="112" y2="48" stroke="rgba(200,169,110,0.2)" stroke-width="0.6"/>
</svg>`;

export function renderServices() {
    const services  = db.getServices();
    const container = document.querySelector('#services-grid');
    if (!container) return;

    const item = (svc, n) => `
        <div class="showcase-item" data-svc="${svc.id}" data-n="${n}">
            <div class="showcase-item-icon">
                ${serviceIcons[svc.icon] || serviceIcons.gem}
            </div>
            <h3 class="showcase-item-title">${svc.title}</h3>
            <p class="showcase-item-desc">${svc.description}</p>
        </div>`;

    container.innerHTML = `
        <div class="showcase-layout">

            <div class="showcase-col showcase-col--left">
                ${item(services[0], 1)}
                ${item(services[2], 3)}
            </div>

            <div class="showcase-center">
                <div class="showcase-gem-ring">
                    <span class="showcase-num" data-n="01">01</span>
                    <span class="showcase-num" data-n="02">02</span>
                    <span class="showcase-num" data-n="03">03</span>
                    <span class="showcase-num" data-n="04">04</span>
                    <div class="showcase-gem-icon">
                        ${centerGemSvg}
                    </div>
                </div>
            </div>

            <div class="showcase-col showcase-col--right">
                ${item(services[1], 2)}
                ${item(services[3], 4)}
            </div>

        </div>`;
}
