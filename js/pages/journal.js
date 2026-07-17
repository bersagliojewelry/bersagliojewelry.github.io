/**
 * Bersaglio Jewelry — Journal index page.
 *
 * Extiende la sección de journal del HOME a página completa:
 *   1. Masthead estilo NYT (EST. 2014 · The Bersaglio Journal · Issue Nº · Archivo)
 *   2. Ticker live "EN VIVO" (mismo de home, infinite marquee)
 *   3. Hero cover (featured entry, mismo layout NYT del home + sidebar más-leídos
 *      + newsletter glass-emerald)
 *   4. Sections grid — el resto de entries agrupadas/listadas por sección
 *      con styling editorial (numeradas, dropcaps, two-col en desktop)
 *   5. CTA al atelier
 *
 * Datos: js/data/journal.js (hardcoded, mismo origen que el home).
 */

import { html, escape, mount } from '../core/html.js';
import { data } from '../core/data.js';
import {
    JOURNAL_ISSUE,
    JOURNAL_TICKER,
    getCover,
    getListado,
    entryHref,
} from '../data/journal.js';

// ═══════════════════════════════════════════════════════════════════
// MASTHEAD + TICKER (espejado de home journal section)
// ═══════════════════════════════════════════════════════════════════
function renderMasthead(feat) {
    return html`
        <div class="jr-masthead">
            <div class="jr-masthead-brand">
                <div class="mono jr-est">${escape(JOURNAL_ISSUE.est)}</div>
                <div class="jr-est-divider"></div>
                <h1 class="jr-masthead-title">
                    The <span class="italic">Bersaglio</span> Journal
                </h1>
            </div>
            <div class="jr-masthead-meta">
                <div class="mono jr-issue">${escape(JOURNAL_ISSUE.number)}${feat ? ' · ' + escape(feat.dateLong) : ''}</div>
            </div>
        </div>
        <div class="jr-masthead-line"></div>`;
}

function renderTicker() {
    const tickerDoubled = [...JOURNAL_TICKER, ...JOURNAL_TICKER];
    return html`
        <div class="glass jr-ticker">
            <div class="mono jr-ticker-tag">
                <span class="jr-ticker-pulse"></span>
                EN VIVO
            </div>
            <div class="jr-ticker-clip">
                <div class="jr-ticker-track">
                    ${tickerDoubled.map(t => html`
                        <span class="jr-ticker-item">${escape(t)}<span class="jr-ticker-diamond">◆</span></span>`)}
                </div>
            </div>
        </div>`;
}

// ═══════════════════════════════════════════════════════════════════
// HERO COVER + SIDEBAR
// ═══════════════════════════════════════════════════════════════════
function renderCover(feat, side) {
    return html`
        <div class="jr-fold">
            <article class="jr-cover">
                <a class="jr-cover-link" href="${entryHref(feat.slug)}">
                    <div class="jr-cover-imgwrap">
                        <img src="${escape(feat.image)}" alt="${escape(feat.title)}" class="jr-cover-img" loading="eager" fetchpriority="high" decoding="async">
                        <div aria-hidden="true" class="jr-cover-vignette"></div>
                        <div class="jr-cover-flag-row">
                            <span class="mono jr-cover-flag">${escape(feat.section.toUpperCase())}</span>
                            <span class="mono jr-cover-read">${escape(feat.read)} de lectura</span>
                        </div>
                        <div class="jr-cover-caption">
                            <div class="mono jr-cover-kicker">${escape(feat.kicker)}</div>
                        </div>
                    </div>
                    <h2 class="jr-cover-title">${escape(feat.title)}</h2>
                    <p class="jr-cover-excerpt">
                        <span class="jr-cover-dropcap">${escape(feat.excerpt.charAt(0))}</span>${escape(feat.excerpt.slice(1))}
                    </p>
                    <div class="jr-cover-meta">
                        <div class="jr-cover-author-row">
                            <div class="jr-cover-avatar">${escape(authorInitials(feat.author))}</div>
                            <div>
                                <div class="jr-cover-author">${escape(feat.author)}</div>
                                <div class="mono jr-cover-date">${escape(feat.dateLong.toUpperCase())}</div>
                            </div>
                        </div>
                        <div class="jr-cover-continue">
                            Continuar leyendo
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
                        </div>
                    </div>
                </a>
            </article>

            <aside class="jr-side">
                <div class="jr-side-header">
                    <h3 class="jr-side-title">Más leídos</h3>
                    <div class="mono jr-side-week">ESTA SEMANA</div>
                </div>
                ${side.slice(0, 4).map((s, i) => html`
                    <article class="jr-side-row">
                        <a class="jr-side-link" href="${entryHref(s.slug)}">
                            <div class="jr-side-num">0${i + 1}</div>
                            <div>
                                <div class="mono jr-side-meta">
                                    <span>${escape(s.section)}</span>
                                    <span class="jr-side-meta-dot">·</span>
                                    <span class="jr-side-meta-date">${escape(s.date)}</span>
                                </div>
                                <h4 class="jr-side-headline">${escape(s.title)}</h4>
                                <div class="mono jr-side-read">${escape(s.read)} de lectura</div>
                            </div>
                        </a>
                    </article>`)}

                <div class="glass glass-emerald jr-newsletter">
                    <div class="mono jr-newsletter-tag">NEWSLETTER</div>
                    <div class="jr-newsletter-title">
                        Una nota cada<br>
                        <span class="italic jr-newsletter-italic">luna llena</span>
                    </div>
                    <form class="jr-newsletter-form" data-newsletter>
                        <input type="email" name="email" placeholder="tu@correo.com" class="jr-newsletter-input" autocomplete="email" required>
                        <button type="submit" class="jr-newsletter-btn">Suscribir</button>
                    </form>
                </div>
            </aside>
        </div>`;
}

function authorInitials(author) {
    // "Por María Camila Bersaglio" → "MB"
    const clean = String(author || '').replace(/^Por\s+/i, '').trim();
    const parts = clean.split(/\s+/);
    const first = parts[0] || '';
    const last  = parts[parts.length - 1] || '';
    return ((first[0] || '') + (last[0] || '')).toUpperCase();
}

// ═══════════════════════════════════════════════════════════════════
// SECTIONS GRID
// ═══════════════════════════════════════════════════════════════════
function renderArchiveGrid(entries) {
    if (entries.length === 0) return '';
    return html`
        <section class="jr-archive">
            <div class="jr-archive-header">
                <div class="mono jr-archive-eyebrow">EL ARCHIVO COMPLETO</div>
                <h2 class="jr-archive-title">
                    Todas las entradas <span class="italic emerald-text">del Journal</span>
                </h2>
            </div>
            <div class="jr-archive-grid">
                ${entries.map(renderArchiveCard)}
            </div>
        </section>`;
}

function renderArchiveCard(e) {
    return html`
        <article class="glass jr-archive-card">
            <a class="jr-archive-link" href="${entryHref(e.slug)}">
                <div class="jr-archive-imgwrap">
                    <img src="${escape(e.image)}" alt="${escape(e.title)}" class="jr-archive-img" loading="lazy" decoding="async">
                    <div aria-hidden="true" class="jr-archive-vignette"></div>
                    <span class="mono jr-archive-flag">${escape(e.section.toUpperCase())}</span>
                </div>
                <div class="jr-archive-body">
                    <div class="mono jr-archive-meta">
                        <span>${escape(e.date)}</span>
                        <span class="jr-archive-meta-dot">·</span>
                        <span>${escape(e.read)} de lectura</span>
                    </div>
                    <h3 class="jr-archive-headline">${escape(e.title)}</h3>
                    <p class="jr-archive-excerpt">${escape(truncate(e.excerpt, 140))}</p>
                    <div class="jr-archive-foot">
                        <span class="mono jr-archive-author">${escape(e.author)}</span>
                        <span class="jr-archive-arrow">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
                        </span>
                    </div>
                </div>
            </a>
        </article>`;
}

function truncate(text, n) {
    text = String(text || '');
    if (text.length <= n) return text;
    return text.slice(0, n).replace(/\s+\S*$/, '') + '…';
}

// ═══════════════════════════════════════════════════════════════════
// CTA
// ═══════════════════════════════════════════════════════════════════
function renderCTA() {
    return html`
        <section class="glass glass-iridescent jr-cta">
            <div class="jr-cta-glow" aria-hidden="true"></div>
            <div class="jr-cta-content">
                <div class="mono jr-cta-eyebrow">DETRÁS DE CADA TEXTO HAY UNA PIEZA</div>
                <h3 class="jr-cta-title">
                    Cuéntanos qué te <span class="italic emerald-text">inspira</span>
                </h3>
                <p class="jr-cta-lead">
                    Si una entrada te movió, escríbenos. Nuestras mejores piezas nacen
                    de conversaciones que empiezan así.
                </p>
                <div class="jr-cta-actions">
                    <a href="/contacto.html" class="btn-aqua btn-aqua-emerald">Hablemos</a>
                    <a href="/colecciones.html" class="btn-aqua">Ver colecciones</a>
                </div>
            </div>
        </section>`;
}

// ═══════════════════════════════════════════════════════════════════
// MOUNT
// ═══════════════════════════════════════════════════════════════════
// Carga fluida (Daniel 2026-06-22): no mostrar "El Journal está en preparación" (vacío FALSO)
// antes de que el listener de journal resuelva. data.isReady('journal') = 1er snapshot real;
// watchdog 8s → tras él, si no llegó nada, mostramos el estado real (vacío). Mismo patrón que
// entrada.js (que ya lo hacía bien con _settled).
let _wdJournal = null;
let _gaveUp = false;
function armWatchdog() {
    if (_wdJournal !== null || _gaveUp) return;
    try {
        _wdJournal = setTimeout(() => {
            _wdJournal = null;
            if (!data.isReady('journal')) { _gaveUp = true; refresh(); }
        }, 8000);
    } catch { /* sin timers → sin watchdog */ }
}

// CARGANDO: masthead + ticker reales (ancla de marca) + portada reservada, sin "en preparación".
function renderLoadingJournal() {
    return html`
        <div class="container jr-page">
            ${renderMasthead(null)}
            ${renderTicker()}
            <div class="jr-fold" aria-busy="true" aria-hidden="true" style="min-height:50vh"></div>
        </div>`;
}

function renderAll() {
    if (!data.isReady('journal') && !_gaveUp) return renderLoadingJournal();
    const feat = getCover();
    const listado = getListado();      // todo menos la portada, en orden editorial
    const side = listado.slice(0, 4);  // "Más leídos"
    const archive = listado;           // el archivo completo (grid)
    return html`
        <div class="container jr-page">
            ${renderMasthead(feat)}
            ${renderTicker()}
            ${feat ? renderCover(feat, side) : renderEmpty()}
            ${renderArchiveGrid(archive)}
            ${renderCTA()}
        </div>`;
}

// Estado-cero (sin entradas publicadas): getCover() = null → NO crashear (clase §89/L-42:
// el home-preview ya guardaba con `if (!feat) return ''`, pero esta página completa no lo
// heredó). Empty-state editorial reusando clases ya estilizadas del archivo (cero CSS nueva).
function renderEmpty() {
    return html`
        <section class="jr-archive">
            <div class="jr-archive-header">
                <div class="mono jr-archive-eyebrow">PRÓXIMAMENTE</div>
                <h2 class="jr-archive-title">El <span class="italic emerald-text">Journal</span> está en preparación</h2>
            </div>
        </section>`;
}

function initNewsletter() {
    document.querySelectorAll('[data-newsletter]').forEach(form => {
        form.addEventListener('submit', e => {
            e.preventDefault();
            const email = form.email?.value?.trim();
            if (!email) return;
            try { localStorage.setItem('bj-email-subscribed', email); } catch {}
            document.dispatchEvent(new CustomEvent('bj:email-subscribed', { detail: email }));
            form.innerHTML = '<div class="hj-newsletter-thanks">Gracias. Te escribiremos pronto.</div>';
        });
    });
}

function refresh() {
    const main = document.getElementById('main-content');
    if (!main) return;
    mount(main, renderAll());
    requestAnimationFrame(initNewsletter);
}

export async function init() {
    const main = document.getElementById('main-content');
    if (!main) return;
    data.loadJournal();            // B4: solo el listener de journal (no piezas/cols)
    armWatchdog();
    refresh();                     // pinta ya (cargando si aún no hay entradas)
    data.onChange(refresh);        // re-render cuando lleguen entradas publicadas
}

export default { init };
