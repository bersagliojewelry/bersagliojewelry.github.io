/**
 * Bersaglio Jewelry — Nosotros page (11 secciones).
 *
 * CMS P4: el copy estático migró a `nosotros-defaults.js` (SSoT) y los renderers ahora
 * son PUROS y parametrizados (toman el dato merged), reusados por el preview del panel.
 * `init()` pinta con DEFAULTS y re-pinta al resolver getDoc de siteContent/nosotros.
 * El modelo (8 sub-mapas) coincide con la whitelist de firestore.rules; las listas viven
 * dentro de sus sub-mapas. Escape() por-hoja en cada string (frontera XSS, repo público).
 *
 * Modelo PLANO (síntesis Gemini 2026-06-19): se eliminó el grab-bag `cartagena`.
 * Secciones (visual → dato):
 *   1. Hero          ← hero
 *   2. Cifras        ← cifras.items           (hide-when-empty)
 *   3. Manifiesto    ← manifiesto
 *   4. Filosofía     ← maison (misión/visión)
 *   5. Valores       ← valores.items          (hide-when-empty; nº 01.. derivado)
 *   6. Timeline      ← timeline.items         (hide-when-empty)
 *   7. Atelier       ← atelier (texto)
 *   8. Equipo        ← equipo.items           (hide-when-empty; avatar = iniciales)
 *   9. Certs         ← certificaciones.items  (hide-when-empty)
 *  10. Reseñas       ← resenas.items          (hide-when-empty)
 *  11. FAQ           ← faqs.items             (hide-when-empty)
 *  12. CTA           ← cierre
 * Renderers de lista toleran ítems malformados (guard por-ítem, anti poison-pill).
 *
 * Estado interno:
 *   - _openFaq: índice del FAQ abierto (0..n o -1 si todos cerrados)
 *   - _activeChapter: índice del capítulo activo del timeline (0..n)
 *   - _content: contenido merged vigente (defaults o doc) — lo leen los refresh handlers
 */

import { html, escape, mount, fragment } from '../core/html.js';
import { data } from '../core/data.js';
import { safeUrl } from '../core/safe-url.js';
import { mergeNosotros } from './nosotros-defaults.js';

let _openFaq = 0;
let _activeChapter = 0;
let _content = null;

// ═══════════════════════════════════════════════════════════════════
// 1. HERO
// ═══════════════════════════════════════════════════════════════════
export function nosotrosHeroSection(c) {
    return html`
        <section class="abt-hero">
            <div class="abt-hero-text">
                <div class="mono abt-eyebrow">${escape(c.eyebrow)}</div>
                <h1 class="abt-hero-title">
                    ${escape(c.titleL1)}<br>
                    <span class="italic emerald-text abt-hero-title-em">${escape(c.titleEm)}</span><br>
                    ${escape(c.titleTail)}
                </h1>
                <p class="abt-hero-lead">${escape(c.lead)}</p>
                <p class="abt-hero-italic">${escape(c.leadItalic)}</p>
                <div class="abt-hero-actions">
                    <a href="/contacto.html" class="btn-aqua btn-aqua-emerald">
                        Agendar una visita
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
                    </a>
                    <a href="/colecciones.html" class="btn-aqua">Ver colecciones</a>
                </div>
            </div>
            <div class="glass glass-iridescent abt-hero-image">
                ${c.image
                    ? html`<img class="abt-hero-img" src="${escape(safeUrl(c.image))}" alt="" decoding="async">`
                    : html`<div class="abt-hero-image-bg"></div>`}
                <div class="abt-hero-image-shade"></div>
                <div class="abt-hero-image-content">
                    <div class="mono abt-hero-image-eyebrow">${escape(c.imageEyebrow)}</div>
                    <div class="abt-hero-quote">"${escape(c.quote)}"</div>
                    <div class="mono abt-hero-quote-author">— ${escape(c.quoteAuthor)}</div>
                </div>
            </div>
        </section>`;
}

// ═══════════════════════════════════════════════════════════════════
// 2. CIFRAS  (← cifras.items)
// ═══════════════════════════════════════════════════════════════════
export function nosotrosStatsSection(stats) {
    if (!Array.isArray(stats) || !stats.length) return '';
    return html`
        <section class="glass abt-stats">
            ${stats.map((raw, i) => { const k = raw || {}; return html`
                <div class="abt-stat ${i > 0 ? 'abt-stat--bordered' : ''}">
                    <div class="display abt-stat-num">${escape(k.n)}</div>
                    <div class="abt-stat-label">${escape(k.l)}</div>
                    <div class="mono abt-stat-sub">${escape(k.s)}</div>
                </div>`; })}
        </section>`;
}

// ═══════════════════════════════════════════════════════════════════
// 3. MANIFIESTO
// ═══════════════════════════════════════════════════════════════════
export function nosotrosManifiestoSection(c) {
    return html`
        <section class="abt-manifiesto">
            <h2 class="abt-manifiesto-title">
                ${escape(c.titlePre)}
                <span class="italic emerald-text">${escape(c.titleEm)}</span>${escape(c.titleTail)}
            </h2>
            <div class="abt-manifiesto-divider"></div>
            <div class="mono abt-manifiesto-foot">${escape(c.foot)}</div>
        </section>`;
}

// ═══════════════════════════════════════════════════════════════════
// 4. FILOSOFÍA  (← maison: misión / visión)
// ═══════════════════════════════════════════════════════════════════
export function nosotrosFilosofiaSection(c) {
    return html`
        <section class="abt-section">
            <div class="filosofia-grid">
                <div class="glass glass-iridescent val-card">
                    <div class="mono val-card-num">MISIÓN</div>
                    <h3 class="val-card-title">${escape(c.misionTitle)}</h3>
                    <p class="val-card-desc">${escape(c.misionDesc)}</p>
                </div>
                <div class="glass glass-iridescent val-card">
                    <div class="mono val-card-num">VISIÓN</div>
                    <h3 class="val-card-title">${escape(c.visionTitle)}</h3>
                    <p class="val-card-desc">${escape(c.visionDesc)}</p>
                </div>
            </div>
        </section>`;
}

// ═══════════════════════════════════════════════════════════════════
// 5. VALORES  (← valores.items; el nº 01.. lo deriva el renderer)
// ═══════════════════════════════════════════════════════════════════
export function nosotrosValoresSection(c) {
    const items = c && c.items;
    if (!Array.isArray(items) || !items.length) return '';
    return html`
        <section class="abt-section">
            <div class="abt-section-header">
                <div class="mono abt-eyebrow">${escape(c.eyebrow)}</div>
                <h2 class="abt-section-title">
                    ${escape(c.titlePre)} <span class="italic emerald-text">${escape(c.titleEm)}</span>
                </h2>
            </div>
            <div class="val-grid">
                ${items.map((raw, i) => { const v = raw || {}; return html`
                    <div class="glass glass-iridescent val-card">
                        <div class="val-card-num-row">
                            <div class="mono val-card-num">${escape(String(i + 1).padStart(2, '0'))}</div>
                            <div class="val-card-line"></div>
                        </div>
                        <div class="val-card-title">${escape(v.t)}</div>
                        <p class="val-card-desc">${escape(v.d)}</p>
                    </div>`; })}
            </div>
        </section>`;
}

// ═══════════════════════════════════════════════════════════════════
// 6. TIMELINE  (← timeline.items)
// ═══════════════════════════════════════════════════════════════════
export function nosotrosTimelineSection(c, activeChapter = 0) {
    const items = c && c.items;
    if (!Array.isArray(items) || !items.length) return '';
    const idx = (activeChapter >= 0 && activeChapter < items.length) ? activeChapter : 0;
    const ch0 = items[idx] || {};
    return html`
        <section class="abt-section">
            <div class="abt-section-header">
                <h2 class="abt-section-title">
                    ${escape(c.titlePre)} <span class="italic emerald-text">${escape(c.titleEm)}</span>
                </h2>
            </div>
            <div class="glass abt-timeline">
                <div class="abt-timeline-tabs">
                    ${items.map((raw, i) => { const ch = raw || {}; return html`
                        <button type="button"
                                class="abt-timeline-tab ${i === idx ? 'is-active' : ''}"
                                data-action="chapter"
                                data-idx="${i}">
                            <span class="mono abt-timeline-tab-year">${escape(ch.y)}</span>${escape(ch.t)}
                        </button>`; })}
                </div>
                <div class="abt-timeline-content tl-content">
                    <div class="abt-timeline-side">
                        <div class="display abt-timeline-year">${escape(ch0.y)}</div>
                        <div class="abt-timeline-divider"></div>
                    </div>
                    <div class="abt-timeline-body">
                        <div class="abt-timeline-title">${escape(ch0.t)}</div>
                        <p class="abt-timeline-desc">${escape(ch0.d)}</p>
                    </div>
                </div>
            </div>
        </section>`;
}

// ═══════════════════════════════════════════════════════════════════
// 7. ATELIER  (← atelier: texto)
// ═══════════════════════════════════════════════════════════════════
export function nosotrosAtelierSection(c) {
    return html`
        <section class="atl-split">
            <div class="glass glass-iridescent atl-image">
                ${c.image
                    ? html`<img class="atl-img" src="${escape(safeUrl(c.image))}" alt="" decoding="async">`
                    : html`<div class="atl-image-bg"></div>`}
                <div class="chip glass-pill atl-chip">El Atelier</div>
            </div>
            <div class="glass atl-text">
                <h3 class="atl-text-title">
                    ${escape(c.title1)}<br>
                    <span class="italic emerald-text">${escape(c.titleEm)}</span>
                </h3>
                <p class="atl-text-p">${escape(c.p1)}</p>
                <p class="atl-text-p">${escape(c.p2)}</p>
                <div class="atl-stats">
                    <div>
                        <div class="mono atl-stat-key">UBICACIÓN</div>
                        <div class="atl-stat-val">${escape(c.ubicacionL1)}<br>${escape(c.ubicacionL2)}</div>
                    </div>
                    <div>
                        <div class="mono atl-stat-key">VISITAS</div>
                        <div class="atl-stat-val">${escape(c.visitasL1)}<br>${escape(c.visitasL2)}</div>
                    </div>
                </div>
            </div>
        </section>`;
}

// ═══════════════════════════════════════════════════════════════════
// 8. EQUIPO  (← equipo.items)
// ═══════════════════════════════════════════════════════════════════
function avatarInitials(name) {
    const parts = String(name || '').trim().split(/\s+/);
    const first = parts[0] || '';
    const last = parts[parts.length - 1] || '';
    return (first[0] || '') + (last[0] || '');
}

export function nosotrosEquipoSection(items) {
    if (!Array.isArray(items) || !items.length) return '';
    return html`
        <section class="abt-section">
            <div class="abt-section-header">
                <h2 class="abt-section-title">
                    El equipo <span class="italic emerald-text">detrás del atelier</span>
                </h2>
            </div>
            <div class="team-grid">
                ${items.map((raw, i) => { const p = raw || {}; return html`
                    <div class="glass glass-iridescent team-card">
                        <div class="team-avatar" style="--ti:${i}">
                            ${p.img
                                ? html`<img class="team-avatar-photo" src="${escape(safeUrl(p.img))}" alt="${escape(p.n)}" decoding="async">`
                                : html`<span class="team-avatar-letter">${escape(avatarInitials(p.n))}</span>`}
                        </div>
                        <div class="team-name">${escape(p.n)}</div>
                        <div class="mono team-role">${escape(p.r)}</div>
                        <p class="team-bio">${escape(p.b)}</p>
                    </div>`; })}
            </div>
        </section>`;
}

// ═══════════════════════════════════════════════════════════════════
// 9. CERTIFICACIONES  (← certificaciones.items)
// ═══════════════════════════════════════════════════════════════════
export function nosotrosCertsSection(certs) {
    if (!Array.isArray(certs) || !certs.length) return '';
    return html`
        <section class="glass glass-emerald cert-section" id="certificaciones">
            <div class="cert-grid">
                <div class="cert-side">
                    <div class="mono cert-eyebrow">RESPALDOS Y CERTIFICACIONES</div>
                    <h3 class="cert-title">
                        Cada pieza viene con
                        <span class="italic cert-title-em">papel y palabra</span>
                    </h3>
                </div>
                <div class="cert-list">
                    ${certs.map(raw => { const c = raw || {}; return html`
                        <div class="cert-card">
                            <div class="cert-card-title">${escape(c.t)}</div>
                            <div class="cert-card-desc">${escape(c.d)}</div>
                        </div>`; })}
                </div>
            </div>
        </section>`;
}

// ═══════════════════════════════════════════════════════════════════
// 10. RESEÑAS  (← resenas.items)
// ═══════════════════════════════════════════════════════════════════
function starsSVG() {
    return [0, 1, 2, 3, 4].map(() => html`<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l2.9 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 7.1-1.01L12 2z"/></svg>`);
}

export function nosotrosResenasSection(resenas) {
    if (!Array.isArray(resenas) || !resenas.length) return '';
    return html`
        <section class="abt-section">
            <div class="abt-section-header">
                <div class="mono abt-eyebrow">EN SUS PALABRAS</div>
                <h2 class="abt-section-title">
                    Historias que <span class="italic emerald-text">nos confiaron</span>
                </h2>
            </div>
            <div class="resena-grid">
                ${resenas.map(raw => { const r = raw || {}; return html`
                    <div class="glass glass-iridescent resena-card">
                        <div class="resena-stars" aria-label="5 de 5 estrellas">${starsSVG()}</div>
                        <p class="resena-quote">${escape(r.t)}</p>
                        <div class="resena-foot">
                            <span class="resena-name">${escape(r.n)}</span>
                            <span class="mono resena-src">${escape(r.loc)}</span>
                        </div>
                    </div>`; })}
            </div>
        </section>`;
}

// ═══════════════════════════════════════════════════════════════════
// 11. FAQ  (← faqs.items)
// ═══════════════════════════════════════════════════════════════════
export function nosotrosFaqSection(faqs, openFaq = 0) {
    if (!Array.isArray(faqs) || !faqs.length) return '';
    return html`
        <section class="abt-section">
            <div class="abt-section-header">
                <h2 class="abt-section-title">
                    Lo que <span class="italic emerald-text">suelen preguntarnos</span>
                </h2>
            </div>
            <div class="glass faq-wrap">
                ${faqs.map((raw, i) => { const f = raw || {}; return html`
                    <div class="faq-item ${i < faqs.length - 1 ? 'faq-item--bordered' : ''}">
                        <button type="button"
                                class="faq-trigger"
                                data-action="faq"
                                data-idx="${i}"
                                aria-expanded="${openFaq === i ? 'true' : 'false'}">
                            <span class="faq-q">${escape(f.q)}</span>
                            <span class="faq-toggle ${openFaq === i ? 'is-open' : ''}" aria-hidden="true">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
                            </span>
                        </button>
                        ${openFaq === i ? html`
                            <div class="faq-answer">
                                <p>${escape(f.a)}</p>
                            </div>` : ''}
                    </div>`; })}
            </div>
        </section>`;
}

// ═══════════════════════════════════════════════════════════════════
// 12. CTA  (← cierre)
// ═══════════════════════════════════════════════════════════════════
export function nosotrosCtaSection(c) {
    return html`
        <section class="glass glass-iridescent abt-cta">
            <div class="abt-cta-glow" aria-hidden="true"></div>
            <div class="abt-cta-content">
                <div class="mono abt-eyebrow">${escape(c.ctaEyebrow)}</div>
                <h3 class="abt-cta-title">
                    ${escape(c.ctaTitle1)}<br>
                    <span class="italic emerald-text">${escape(c.ctaTitleEm)}</span>
                </h3>
                <p class="abt-cta-lead">${escape(c.ctaLead)}</p>
                <div class="abt-cta-actions">
                    <a href="/contacto.html" class="btn-aqua btn-aqua-emerald">
                        ${escape(c.ctaLabel)}
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
                    </a>
                </div>
            </div>
        </section>`;
}

// ═══════════════════════════════════════════════════════════════════
// ENSAMBLADO + MOUNT
// ═══════════════════════════════════════════════════════════════════
function renderAll(c) {
    return html`
        <div class="container abt-page">
            ${nosotrosHeroSection(c.hero)}
            ${nosotrosStatsSection(c.cifras.items)}
            ${nosotrosManifiestoSection(c.manifiesto)}
            ${nosotrosFilosofiaSection(c.maison)}
            ${nosotrosValoresSection(c.valores)}
            ${nosotrosTimelineSection(c.timeline, _activeChapter)}
            ${nosotrosAtelierSection(c.atelier)}
            ${nosotrosEquipoSection(c.equipo.items)}
            ${nosotrosCertsSection(c.certificaciones.items)}
            ${nosotrosResenasSection(c.resenas.items)}
            ${nosotrosFaqSection(c.faqs.items, _openFaq)}
            ${nosotrosCtaSection(c.cierre)}
        </div>`;
}

/** Re-clampa los índices de estado al tamaño vigente de cada lista. */
function clampState() {
    const tl = _content.timeline.items;
    if (_activeChapter < 0 || _activeChapter >= tl.length) _activeChapter = tl.length ? 0 : -1;
    const fq = _content.faqs.items;
    if (_openFaq >= fq.length) _openFaq = fq.length ? 0 : -1;
}

/** Re-merge del doc vigente (defaults si no hay) y re-pintado completo del main. */
function repaint() {
    _content = mergeNosotros(data.getSiteContent('nosotros'));
    clampState();
    const main = document.getElementById('main-content');
    if (main) mount(main, renderAll(_content));
}

function refreshTimeline() {
    const root = document.querySelector('.abt-page');
    if (!root || !_content) return;
    const tl = root.querySelector('.abt-timeline');
    if (!tl) return;
    const oldSection = tl.closest('.abt-section');
    if (!oldSection) return;
    const next = fragment(nosotrosTimelineSection(_content.timeline, _activeChapter)).firstElementChild;
    if (next) oldSection.replaceWith(next);
}

function refreshFAQ() {
    const wrap = document.querySelector('.faq-wrap');
    if (!wrap || !_content) return;
    const next = fragment(nosotrosFaqSection(_content.cierre.faqs, _openFaq)).querySelector('.faq-wrap');
    if (next) wrap.replaceWith(next);
}

function onMainClick(e) {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;

    if (action === 'chapter') {
        e.preventDefault();
        const idx = Number(btn.dataset.idx);
        if (Number.isNaN(idx) || idx === _activeChapter) return;
        _activeChapter = idx;
        refreshTimeline();
        return;
    }

    if (action === 'faq') {
        e.preventDefault();
        const idx = Number(btn.dataset.idx);
        if (Number.isNaN(idx)) return;
        _openFaq = (_openFaq === idx) ? -1 : idx;
        refreshFAQ();
    }
}

export async function init() {
    const main = document.getElementById('main-content');
    if (!main) return;

    repaint();                                   // pinta con DEFAULTS (getSiteContent aún null)
    main.addEventListener('click', onMainClick);

    // CMS P4: re-merge + re-pinta al resolver el getDoc one-shot de siteContent/nosotros.
    data.loadSiteContent('nosotros').then(repaint);
}

export default { init };
