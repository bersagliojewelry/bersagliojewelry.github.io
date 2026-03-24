/**
 * Bersaglio Jewelry — Journal Entry Detail Page
 * URL: entrada.html?p=<slug>
 */

import { loadAllComponents } from './components.js';
import { journal, CATEGORIES } from './data/journal.js';
import { initEffects } from './effects.js';
import Renderer from './utils/renderer.js';
import db       from './data/catalog.js';
import { injectJsonLd } from './utils/schema.js';

async function init() {
    await loadAllComponents();
    await db.load();

    const slug  = new URLSearchParams(window.location.search).get('p');
    const entry = slug ? journal.getBySlug(slug) : null;

    if (!entry) { renderNotFound(); return; }

    renderEntry(entry);
    updateMeta(entry);
    injectEntrySchema(entry);
    initWhatsAppButton();
    Renderer.initScrollAnimations();
    initEffects();
}

function updateMeta(entry) {
    const base = 'https://bersagliojewelry.co';
    const url  = `${base}/entrada.html?p=${entry.slug}`;
    document.title = `${entry.title} | Bersaglio Journal`;
    document.querySelector('meta[name="description"]')?.setAttribute('content', entry.excerpt);
    // Open Graph
    const setMeta = (sel, val) => document.querySelector(sel)?.setAttribute('content', val);
    setMeta('meta[property="og:title"]',       `${entry.title} | Bersaglio Journal`);
    setMeta('meta[property="og:description"]', entry.excerpt);
    setMeta('meta[property="og:url"]',         url);
    setMeta('meta[name="twitter:title"]',      `${entry.title} | Bersaglio Journal`);
    setMeta('meta[name="twitter:description"]', entry.excerpt);
    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    canonical.href = url;
}

function injectEntrySchema(entry) {
    const base = 'https://bersagliojewelry.co';
    const url  = `${base}/entrada.html?p=${entry.slug}`;

    injectJsonLd('article-schema', {
        '@context':      'https://schema.org',
        '@type':         'BlogPosting',
        headline:        entry.title,
        description:     entry.excerpt,
        articleBody:     (entry.content || []).join('\n\n'),
        url,
        datePublished:   entry.date,
        dateModified:    entry.date,
        author:          { '@type': 'Organization', name: 'Bersaglio Jewelry', url: base },
        publisher:       { '@type': 'Organization', name: 'Bersaglio Jewelry', logo: { '@type': 'ImageObject', url: `${base}/img/logo-bj2.png` } },
        mainEntityOfPage: url,
        inLanguage:      'es',
    });

    injectJsonLd('breadcrumb-schema', {
        '@context': 'https://schema.org',
        '@type':    'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Inicio',   item: `${base}/` },
            { '@type': 'ListItem', position: 2, name: 'Journal',  item: `${base}/journal.html` },
            { '@type': 'ListItem', position: 3, name: entry.title, item: url },
        ],
    });
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

function renderEntry(entry) {
    const container = document.getElementById('entrada-content');
    if (!container) return;

    const cfg  = CATEGORIES[entry.category] || { bg: '#0A0A0A', accent: 'var(--gold)', label: entry.category };
    const all  = journal.getAll();
    const more = all.filter(e => e.slug !== entry.slug && e.category === entry.category).slice(0, 2);

    const contentHtml = (entry.content || [])
        .map(p => `<p class="entrada-paragraph">${p}</p>`)
        .join('');

    const moreHtml = more.length ? `
        <aside class="entrada-more">
            <h3 class="entrada-more-title">También en el Journal</h3>
            <div class="entrada-more-grid">
                ${more.map(e => `
                    <a href="entrada.html?p=${e.slug}" class="entrada-more-card">
                        <span class="journal-chip" style="--chip-color:${(CATEGORIES[e.category]||{}).accent||'var(--gold)'}">${(CATEGORIES[e.category]||{}).label||e.category}</span>
                        <h4 class="entrada-more-card-title">${e.title}</h4>
                        <span class="journal-meta-read">${e.readTime} lectura</span>
                    </a>
                `).join('')}
            </div>
        </aside>
    ` : '';

    container.innerHTML = `
        <!-- Entry Hero -->
        <section class="entrada-hero" style="--entry-bg:${cfg.bg};--entry-accent:${cfg.accent}">
            <div class="container">
                <nav class="breadcrumb animate-on-scroll" aria-label="Breadcrumb">
                    <a href="journal.html">Journal</a>
                    <span aria-hidden="true">›</span>
                    <span class="journal-chip" style="--chip-color:${cfg.accent}">${cfg.label}</span>
                </nav>
                <div class="entrada-hero-inner">
                    <div class="entrada-meta-row animate-on-scroll">
                        <time class="journal-meta-date" datetime="${entry.date}">${formatDate(entry.date)}</time>
                        <span class="journal-meta-dot" aria-hidden="true"></span>
                        <span class="journal-meta-read">${entry.readTime} de lectura</span>
                    </div>
                    <h1 class="entrada-title animate-on-scroll">${entry.title}</h1>
                    <p class="entrada-excerpt animate-on-scroll">${entry.excerpt}</p>
                </div>
            </div>
        </section>

        <!-- Article body -->
        <article class="entrada-body">
            <div class="container">
                <div class="entrada-content animate-on-scroll">
                    <div class="entrada-lead-line" style="background:${cfg.accent}" aria-hidden="true"></div>
                    ${contentHtml}
                </div>

                <!-- CTA -->
                <div class="entrada-cta-block animate-on-scroll">
                    <div class="entrada-cta-inner" style="border-color:${cfg.accent}22">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.8" width="36" height="36" style="color:${cfg.accent}">
                            <polygon points="12,2 22,8.5 12,22 2,8.5"/><line x1="2" y1="8.5" x2="22" y2="8.5"/><polyline points="7,2 12,8.5 17,2"/>
                        </svg>
                        <p class="entrada-cta-text">¿Te interesa conocer más sobre nuestras piezas? Nuestro equipo de gemólogos está disponible para una asesoría personalizada.</p>
                        <a href="contacto.html" class="btn btn-outline">Agendar asesoría</a>
                    </div>
                </div>

                <!-- More articles -->
                ${moreHtml}

                <!-- Back link -->
                <div class="entrada-back">
                    <a href="journal.html" class="entrada-back-link">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
                        Volver al Journal
                    </a>
                </div>
            </div>
        </article>
    `;
}

function renderNotFound() {
    const container = document.getElementById('entrada-content');
    if (!container) return;
    container.innerHTML = `
        <section class="section">
            <div class="container pieza-not-found">
                <h1 style="font-family:var(--font-display);font-size:2rem;font-weight:300;margin-bottom:var(--space-md)">Artículo no encontrado</h1>
                <p style="font-family:var(--font-body);font-size:14px;color:var(--text-muted);margin-bottom:var(--space-xl)">El artículo que buscas no existe o ha sido removido.</p>
                <a href="journal.html" class="btn btn-primary">Ver Journal</a>
            </div>
        </section>
    `;
}

init();
