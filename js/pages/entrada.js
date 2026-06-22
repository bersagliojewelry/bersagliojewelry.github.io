/**
 * Bersaglio Jewelry — Entrada (single journal post).
 *
 * URL: /entrada.html?e=<slug>
 *
 * Layout editorial:
 *   1. Breadcrumb (Inicio / Journal / título)
 *   2. Hero: kicker eyebrow + flag chip + título display gigante + meta (date · read · author)
 *   3. Featured image full-width glass-iridescent
 *   4. Article body con drop-cap en primer párrafo + max-width 720 + leading 1.85
 *   5. Share bar (sticky aside): WhatsApp / Email / Copy link
 *   6. Related (3 más de la misma sección)
 *   7. Newsletter CTA + back-to-journal
 *
 * Estado interno:
 *   - _slug viene del URL
 *   - Si no existe, renderiza 404 con CTA al journal index
 *
 * SEO: sobreescribe document.title, canonical, og:* dinámicamente
 */

import { html, escape, mount } from '../core/html.js';
import { data } from '../core/data.js';
import { getEntryBySlug, getRelated } from '../data/journal.js';

let _slug = '';

function getSlugFromURL() {
    return new URL(location.href).searchParams.get('e') || '';
}

function authorInitials(author) {
    const clean = String(author || '').replace(/^Por\s+/i, '').trim();
    const parts = clean.split(/\s+/);
    return ((parts[0]?.[0] || '') + (parts[parts.length - 1]?.[0] || '')).toUpperCase();
}

// ═══════════════════════════════════════════════════════════════════
// RENDER
// ═══════════════════════════════════════════════════════════════════

function renderBreadcrumb(entry) {
    return html`
        <nav class="en-breadcrumb" aria-label="Migas de pan">
            <a class="en-crumb" href="/">Inicio</a>
            <span class="en-crumb-sep" aria-hidden="true">→</span>
            <a class="en-crumb" href="/journal.html">Journal</a>
            <span class="en-crumb-sep" aria-hidden="true">→</span>
            <span class="en-crumb en-crumb-current">${escape(entry.section)}</span>
        </nav>`;
}

function renderHero(entry) {
    return html`
        <header class="en-hero">
            <div class="en-hero-flags">
                <span class="mono en-flag-section">${escape(entry.section.toUpperCase())}</span>
                <span class="en-flag-divider"></span>
                <span class="mono en-flag-kicker">${escape(entry.kicker)}</span>
            </div>
            <h1 class="en-title">${escape(entry.title)}</h1>
            <div class="en-hero-meta">
                <div class="en-hero-author-row">
                    <div class="en-hero-avatar">${escape(authorInitials(entry.author))}</div>
                    <div>
                        <div class="en-hero-author">${escape(entry.author)}</div>
                        <div class="mono en-hero-role">${escape(entry.authorRole)}</div>
                    </div>
                </div>
                <div class="en-hero-meta-right">
                    <span class="mono en-hero-date">${escape(entry.dateLong)}</span>
                    <span class="en-hero-meta-divider"></span>
                    <span class="mono en-hero-read">${escape(entry.read)} de lectura</span>
                </div>
            </div>
        </header>`;
}

function renderFeaturedImage(entry) {
    return html`
        <figure class="glass glass-iridescent en-featured">
            <img src="${escape(entry.image)}"
                 alt="${escape(entry.title)}"
                 class="en-featured-img"
                 loading="eager"
                 fetchpriority="high"
                 decoding="async">
        </figure>`;
}

function renderBody(entry) {
    const paragraphs = String(entry.body || '').split(/\n\s*\n/).filter(Boolean);
    return html`
        <article class="en-body">
            ${paragraphs.map((p, i) => {
                if (i === 0) {
                    // First paragraph gets the drop-cap on the first letter
                    const first = p.charAt(0);
                    const rest  = p.slice(1);
                    return html`
                        <p class="en-body-p en-body-p--lede">
                            <span class="en-dropcap">${escape(first)}</span>${escape(rest)}
                        </p>`;
                }
                return html`<p class="en-body-p">${escape(p)}</p>`;
            })}
        </article>`;
}

function renderShare(entry) {
    const url = encodeURIComponent(`https://bersagliojewelry.co/entrada.html?e=${entry.slug}`);
    const title = encodeURIComponent(entry.title);
    return html`
        <aside class="en-share" aria-label="Compartir entrada">
            <div class="mono en-share-label">COMPARTIR</div>
            <div class="en-share-btns">
                <a class="en-share-btn"
                   href="https://wa.me/?text=${title}%20${url}"
                   target="_blank"
                   rel="noopener"
                   aria-label="Compartir por WhatsApp">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M20.5 3.5A11 11 0 0 0 3.4 17l-1.4 5.1 5.2-1.4A11 11 0 1 0 20.5 3.5zM12 20c-1.5 0-3-.4-4.3-1.2l-.3-.2-3.1.8.8-3.1-.2-.3C4.4 14.9 4 13.5 4 12c0-4.4 3.6-8 8-8s8 3.6 8 8-3.6 8-8 8z"/>
                    </svg>
                </a>
                <a class="en-share-btn"
                   href="mailto:?subject=${title}&body=${url}"
                   aria-label="Enviar por correo">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                    </svg>
                </a>
                <button class="en-share-btn" type="button" data-action="copy" aria-label="Copiar enlace">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                        <rect x="9" y="9" width="13" height="13" rx="2"/>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                    </svg>
                </button>
                <span class="en-share-feedback" data-feedback aria-live="polite"></span>
            </div>
        </aside>`;
}

function renderRelated(entry) {
    const related = getRelated(entry.slug, 3);
    if (related.length === 0) return '';
    return html`
        <section class="en-related">
            <div class="en-related-header">
                <div class="mono en-related-eyebrow">SEGUIR LEYENDO</div>
                <h2 class="en-related-title">Más de <span class="italic emerald-text">${escape(entry.section)}</span></h2>
            </div>
            <div class="en-related-grid">
                ${related.map(r => html`
                    <article class="glass en-related-card">
                        <a class="en-related-link" href="/entrada.html?e=${encodeURIComponent(r.slug)}">
                            <div class="en-related-imgwrap">
                                <img src="${escape(r.image)}" alt="${escape(r.title)}" class="en-related-img" loading="lazy" decoding="async">
                            </div>
                            <div class="en-related-body">
                                <div class="mono en-related-meta">
                                    <span>${escape(r.section)}</span>
                                    <span class="en-related-meta-dot">·</span>
                                    <span>${escape(r.read)}</span>
                                </div>
                                <h3 class="en-related-headline">${escape(r.title)}</h3>
                            </div>
                        </a>
                    </article>`)}
            </div>
        </section>`;
}

function renderBackToJournal() {
    return html`
        <div class="en-back">
            <a href="/journal.html" class="btn-aqua en-back-btn">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
                Volver al Journal
            </a>
        </div>`;
}

function renderNotFound() {
    return html`
        <div class="container en-page">
            <nav class="en-breadcrumb">
                <a class="en-crumb" href="/">Inicio</a>
                <span class="en-crumb-sep" aria-hidden="true">→</span>
                <a class="en-crumb" href="/journal.html">Journal</a>
            </nav>
            <div class="glass en-notfound">
                <div class="en-notfound-icon" aria-hidden="true">
                    <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="13"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                </div>
                <h1 class="en-notfound-title">Esta entrada se mudó del archivo</h1>
                <p class="en-notfound-sub">Quizá la retiramos o el enlace cambió. Explora el resto del Journal.</p>
                <a href="/journal.html" class="btn-aqua btn-aqua-emerald">Ver todas las entradas</a>
            </div>
        </div>`;
}

// Estado de carga (recon F1): NO mostrar el 404 duro mientras el listener de journal aún
// no resolvió. Reusa el shell de renderNotFound con copy neutro (cero CSS nueva).
function renderLoading() {
    return html`
        <div class="container en-page">
            <nav class="en-breadcrumb">
                <a class="en-crumb" href="/">Inicio</a>
                <span class="en-crumb-sep" aria-hidden="true">→</span>
                <a class="en-crumb" href="/journal.html">Journal</a>
            </nav>
            <div class="glass en-notfound">
                <h1 class="en-notfound-title">Cargando la entrada…</h1>
                <p class="en-notfound-sub">Un momento, estamos trayendo la nota del Journal.</p>
            </div>
        </div>`;
}

function renderAll(entry) {
    return html`
        <div class="container en-page">
            ${renderBreadcrumb(entry)}
            ${renderHero(entry)}
            ${renderFeaturedImage(entry)}
            <div class="en-layout">
                ${renderBody(entry)}
                ${renderShare(entry)}
            </div>
            ${renderRelated(entry)}
            ${renderBackToJournal()}
        </div>`;
}

// ═══════════════════════════════════════════════════════════════════
// HANDLERS
// ═══════════════════════════════════════════════════════════════════

// _settled = true cuando el listener de journal ya emitió ≥1 snapshot (vía data.onChange).
// Antes de eso, getEntryBySlug(_slug)=null puede ser "aún cargando", NO "no existe".
let _settled = false;

function refresh() {
    const main = document.getElementById('main-content');
    if (!main) return;
    const entry = getEntryBySlug(_slug);
    if (!entry) {
        if (!_settled) { mount(main, renderLoading()); return; }   // cargando ≠ 404 (no toca title)
        main.innerHTML = renderNotFound();
        document.title = 'Entrada no encontrada · Bersaglio Jewelry';
        return;
    }
    main.innerHTML = renderAll(entry);

    // SEO updates
    document.title = `${entry.title} · The Bersaglio Journal`;
    const canonical = document.querySelector('link[rel="canonical"]');
    const ogUrl = document.querySelector('meta[property="og:url"]');
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogImg = document.querySelector('meta[property="og:image"]');
    const ogDesc = document.querySelector('meta[name="description"]');
    const url = `https://bersagliojewelry.co/entrada.html?e=${encodeURIComponent(entry.slug)}`;
    if (canonical) canonical.setAttribute('href', url);
    if (ogUrl)     ogUrl.setAttribute('content', url);
    if (ogTitle)   ogTitle.setAttribute('content', entry.title);
    if (ogImg)     ogImg.setAttribute('content', `https://bersagliojewelry.co${entry.image}`);
    if (ogDesc)    ogDesc.setAttribute('content', entry.excerpt);
}

async function copyLink() {
    const url = `https://bersagliojewelry.co/entrada.html?e=${encodeURIComponent(_slug)}`;
    let copied = false;
    try {
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(url);
            copied = true;
        }
    } catch {}
    if (!copied) {
        // Fallback: select + execCommand
        const ta = document.createElement('textarea');
        ta.value = url;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { copied = document.execCommand('copy'); } catch {}
        ta.remove();
    }
    const fb = document.querySelector('[data-feedback]');
    if (fb) {
        fb.textContent = copied ? '✓ Enlace copiado' : 'No pude copiar — selecciónalo a mano';
        setTimeout(() => { fb.textContent = ''; }, 2400);
    }
}

function onMainClick(e) {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    if (btn.dataset.action === 'copy') {
        e.preventDefault();
        copyLink();
    }
}

export async function init() {
    const main = document.getElementById('main-content');
    if (!main) return;

    _slug = getSlugFromURL();
    data.loadJournal();            // B4: solo el listener de journal (no piezas/cols)
    // Watchdog 8s: si el listener de journal nunca resuelve, dejamos "Cargando…" y mostramos el
    // estado real (404 si la entrada no existe) — evita carga eterna. (Daniel 2026-06-22.)
    try { setTimeout(() => { if (!_settled) { _settled = true; refresh(); } }, 8000); } catch {}
    refresh();                     // pinta ya (cargando si aún no hay entradas live)
    data.onChange(() => { _settled = true; refresh(); });   // 1er snapshot de journal = datos resueltos
    main.addEventListener('click', onMainClick);

    window.addEventListener('popstate', () => {
        _slug = getSlugFromURL();
        refresh();
    });
}

export default { init };
