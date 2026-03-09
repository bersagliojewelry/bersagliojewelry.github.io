/**
 * Bersaglio Jewelry — Journal Preview Component (Index)
 * Editorial dark section: 1 featured + 3 side cards.
 */

import { journal, CATEGORIES } from '../data/journal.js';
import Renderer from '../utils/renderer.js';

const CATEGORY_ICONS = {
    gem:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.8" width="52" height="52"><polygon points="12,2 22,8.5 12,22 2,8.5"/><line x1="2" y1="8.5" x2="22" y2="8.5"/><polyline points="7,2 12,8.5 17,2"/></svg>`,
    pencil:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.8" width="52" height="52"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>`,
    scroll:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.8" width="52" height="52"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10,9 9,9 8,9"/></svg>`,
    spark:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.8" width="52" height="52"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>`,
    compass: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.8" width="52" height="52"><circle cx="12" cy="12" r="10"/><polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88"/></svg>`,
};

function formatDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
}

function categoryChip(cat) {
    const cfg = CATEGORIES[cat] || { label: cat, accent: 'var(--gold)' };
    return `<span class="journal-chip" style="--chip-color:${cfg.accent}">${cfg.label}</span>`;
}

function featuredVisual(entry) {
    const cfg  = CATEGORIES[entry.category] || { bg: '#0A0A0A', icon: 'gem' };
    const icon = CATEGORY_ICONS[cfg.icon] || CATEGORY_ICONS.gem;
    return `
        <div class="journal-featured-visual" style="background:${cfg.bg}">
            <div class="journal-visual-icon" style="color:${cfg.accent || 'var(--gold)'}">
                ${icon}
            </div>
            <div class="journal-visual-grain"></div>
        </div>
    `;
}

function featuredCard(entry) {
    return `
        <a href="entrada.html?p=${entry.slug}" class="journal-featured-card animate-on-scroll" aria-label="${entry.title}">
            ${featuredVisual(entry)}
            <div class="journal-featured-body">
                ${categoryChip(entry.category)}
                <h3 class="journal-featured-title">${entry.title}</h3>
                <p class="journal-featured-excerpt">${entry.excerpt}</p>
                <div class="journal-meta">
                    <time class="journal-meta-date" datetime="${entry.date}">${formatDate(entry.date)}</time>
                    <span class="journal-meta-dot" aria-hidden="true"></span>
                    <span class="journal-meta-read">${entry.readTime} lectura</span>
                </div>
            </div>
        </a>
    `;
}

function sideCard(entry, index) {
    return `
        <a href="entrada.html?p=${entry.slug}" class="journal-side-card animate-on-scroll" aria-label="${entry.title}">
            <span class="journal-side-num" aria-hidden="true">0${index + 1}</span>
            <div class="journal-side-body">
                ${categoryChip(entry.category)}
                <h3 class="journal-side-title">${entry.title}</h3>
                <div class="journal-meta">
                    <time class="journal-meta-date" datetime="${entry.date}">${formatDate(entry.date)}</time>
                    <span class="journal-meta-dot" aria-hidden="true"></span>
                    <span class="journal-meta-read">${entry.readTime}</span>
                </div>
            </div>
        </a>
    `;
}

export function renderJournal() {
    const container = document.getElementById('journal-preview-grid');
    if (!container) return;

    const entries  = journal.getFeatured(4);
    const featured = entries[0];
    const sides    = entries.slice(1, 4);

    const featuredEl = container.querySelector('#journal-featured');
    const sidesEl    = container.querySelector('#journal-sides');

    if (featuredEl) featuredEl.innerHTML = featuredCard(featured);
    if (sidesEl)    sidesEl.innerHTML    = sides.map((e, i) => sideCard(e, i)).join('');

    Renderer.initScrollAnimations();
}
