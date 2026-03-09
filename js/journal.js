/**
 * Bersaglio Jewelry — Full Journal Page
 */

import { loadAllComponents } from './components.js';
import { journal, CATEGORIES } from './data/journal.js';
import Renderer from './utils/renderer.js';
import db       from './data/catalog.js';

const CATEGORY_ICONS = {
    gem:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.8" width="40" height="40"><polygon points="12,2 22,8.5 12,22 2,8.5"/><line x1="2" y1="8.5" x2="22" y2="8.5"/><polyline points="7,2 12,8.5 17,2"/></svg>`,
    pencil:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.8" width="40" height="40"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>`,
    scroll:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.8" width="40" height="40"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
    spark:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.8" width="40" height="40"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>`,
    compass: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.8" width="40" height="40"><circle cx="12" cy="12" r="10"/><polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88"/></svg>`,
};

let currentFilter = 'all';

async function init() {
    await loadAllComponents();
    await db.load();
    render('all');
    initFilters();
    initWhatsAppButton();
}

function initWhatsAppButton() {
    const { whatsapp } = db.getContact();
    const phone = whatsapp.replace('+', '');
    const msg   = encodeURIComponent('Hola Bersaglio Jewelry, me interesa conocer más sobre sus piezas.');
    const url   = `https://wa.me/${phone}?text=${msg}`;
    document.querySelectorAll('.wa-float, #wa-nav').forEach(btn => { btn.href = url; });
}

function formatDate(iso) {
    return new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
}

function chipHtml(cat) {
    const cfg = CATEGORIES[cat] || { label: cat, accent: 'var(--gold)' };
    return `<span class="journal-chip" style="--chip-color:${cfg.accent}">${cfg.label}</span>`;
}

function heroCardHtml(entry) {
    const cfg  = CATEGORIES[entry.category] || { bg: '#0A0A0A', icon: 'gem', accent: 'var(--gold)' };
    const icon = CATEGORY_ICONS[cfg.icon] || CATEGORY_ICONS.gem;
    return `
        <a href="entrada.html?p=${entry.slug}" class="journal-hero-card animate-on-scroll">
            <div class="journal-hero-card-visual" style="background:${cfg.bg}">
                <div class="journal-visual-icon" style="color:${cfg.accent}">${icon}</div>
                <div class="journal-visual-grain"></div>
            </div>
            <div class="journal-hero-card-body">
                ${chipHtml(entry.category)}
                <h2 class="journal-hero-card-title">${entry.title}</h2>
                <p class="journal-hero-card-excerpt">${entry.excerpt}</p>
                <div class="journal-meta">
                    <time datetime="${entry.date}">${formatDate(entry.date)}</time>
                    <span class="journal-meta-dot" aria-hidden="true"></span>
                    <span>${entry.readTime} de lectura</span>
                </div>
                <span class="journal-read-cta">
                    Leer artículo
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </span>
            </div>
        </a>
    `;
}

function gridCardHtml(entry) {
    const cfg  = CATEGORIES[entry.category] || { bg: '#0A0A0A', icon: 'gem', accent: 'var(--gold)' };
    const icon = CATEGORY_ICONS[cfg.icon] || CATEGORY_ICONS.gem;
    return `
        <a href="entrada.html?p=${entry.slug}" class="journal-grid-card animate-on-scroll">
            <div class="journal-grid-card-visual" style="background:${cfg.bg}">
                <div class="journal-visual-icon" style="color:${cfg.accent};opacity:0.6">${icon}</div>
                <div class="journal-visual-grain"></div>
            </div>
            <div class="journal-grid-card-body">
                ${chipHtml(entry.category)}
                <h3 class="journal-grid-card-title">${entry.title}</h3>
                <p class="journal-grid-card-excerpt">${entry.excerpt}</p>
                <div class="journal-meta">
                    <time datetime="${entry.date}">${formatDate(entry.date)}</time>
                    <span class="journal-meta-dot" aria-hidden="true"></span>
                    <span>${entry.readTime}</span>
                </div>
            </div>
        </a>
    `;
}

function render(filter) {
    currentFilter = filter;
    const heroEl  = document.getElementById('journal-hero-article');
    const gridEl  = document.getElementById('journal-grid');
    const emptyEl = document.getElementById('journal-empty');

    const all     = journal.getAll();
    const entries = filter === 'all' ? all : all.filter(e => e.category === filter);

    if (!entries.length) {
        if (heroEl)  heroEl.innerHTML  = '';
        if (gridEl)  gridEl.innerHTML  = '';
        if (emptyEl) emptyEl.hidden    = false;
        return;
    }

    if (emptyEl) emptyEl.hidden = true;

    const [hero, ...rest] = entries;
    if (heroEl) heroEl.innerHTML = heroCardHtml(hero);
    if (gridEl) gridEl.innerHTML = rest.map(gridCardHtml).join('');

    Renderer.initScrollAnimations();
}

function initFilters() {
    document.querySelectorAll('.journal-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.journal-filter-btn').forEach(b => {
                b.classList.remove('is-active');
                b.setAttribute('aria-selected', 'false');
            });
            btn.classList.add('is-active');
            btn.setAttribute('aria-selected', 'true');
            render(btn.dataset.filter || 'all');
        });
    });
}

init();
