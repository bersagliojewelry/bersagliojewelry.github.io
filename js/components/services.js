/**
 * Bersaglio Jewelry — Services Component
 */

import db from '../data/catalog.js';
import Renderer from '../utils/renderer.js';

const serviceIcons = {
    gem: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="12,2 22,8.5 12,22 2,8.5"/><line x1="2" y1="8.5" x2="22" y2="8.5"/><polyline points="7,2 12,8.5 17,2"/></svg>`,
    pencil: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
    certificate: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 15l-2 5 2-1 2 1-2-5z"/><circle cx="12" cy="9" r="6"/><path d="M9 9l1.5 1.5L15 7"/></svg>`,
    shield: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>`
};

export function renderServices() {
    const services  = db.getServices();
    const container = document.querySelector('#services-grid');
    if (!container) return;

    Renderer.renderList('#services-grid', services, (svc) => `
        <div class="service-card animate-on-scroll">
            <div class="service-icon">${serviceIcons[svc.icon] || ''}</div>
            <h3 class="service-title">${svc.title}</h3>
            <p class="service-desc">${svc.description}</p>
        </div>
    `);
}
