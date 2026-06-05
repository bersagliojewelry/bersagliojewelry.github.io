/**
 * Home · Sección 8 — Journal preview (masthead estilo NYT: cover + sidebar + trio).
 * Datos compartidos con las páginas journal/entrada (js/data/journal.js).
 */
import { html, escape } from '../core/html.js';
import {
    JOURNAL_ENTRIES as JOURNAL_DATA_ALL,
    JOURNAL_ISSUE   as JOURNAL_DATA_ISSUE,
    JOURNAL_TICKER,
    getFeatured     as journalGetFeatured,
} from '../data/journal.js';

const JOURNAL_DATA_FEATURED = journalGetFeatured();

export function renderJournalPreview() {
    // Build cover/side/trio from the shared journal data module.
    const feat = JOURNAL_DATA_FEATURED;
    const cover = {
        issue: JOURNAL_DATA_ISSUE.number,
        date: feat.dateLong,
        section: feat.section,
        read: feat.read,
        kicker: feat.kicker,
        title: feat.title,
        excerpt: feat.excerpt,
        author: feat.author,
        img: feat.image,
        slug: feat.slug,
    };
    const nonFeatured = JOURNAL_DATA_ALL.filter(e => e.slug !== feat.slug);
    const JOURNAL_SIDE = nonFeatured.slice(0, 4).map(e => ({
        sec: e.section, date: e.date, title: e.title, read: e.read, slug: e.slug,
    }));
    const JOURNAL_TRIO = nonFeatured.slice(4, 7).map(e => ({
        sec: e.section, title: e.title, who: e.author, img: e.image, slug: e.slug,
    }));
    const ticker = JOURNAL_TICKER;
    const tickerDoubled = [...ticker, ...ticker];
    return html`
        <section class="home-journal">
            <div class="container">
                <div class="hj-masthead">
                    <div class="hj-masthead-brand">
                        <div class="mono hj-est">EST. 2014</div>
                        <div class="hj-est-divider"></div>
                        <h2 class="hj-masthead-title">
                            The <span class="italic">Bersaglio</span> Journal
                        </h2>
                    </div>
                    <div class="hj-masthead-meta masthead-meta">
                        <div class="mono hj-issue">${escape(cover.issue)} · ${escape(cover.date)}</div>
                        <a href="/journal.html" class="btn-aqua hj-archive-btn">
                            Archivo completo
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
                        </a>
                    </div>
                </div>
                <div class="hj-masthead-line"></div>

                <div class="glass hj-ticker">
                    <div class="mono hj-ticker-tag">
                        <span class="hj-ticker-pulse"></span>
                        EN VIVO
                    </div>
                    <div class="hj-ticker-clip">
                        <div class="hj-ticker-track">
                            ${tickerDoubled.map(t => html`
                                <span class="hj-ticker-item">
                                    ${escape(t)}
                                    <span class="hj-ticker-diamond">◆</span>
                                </span>`)}
                        </div>
                    </div>
                </div>

                <div class="journal-fold hj-fold">
                    <article class="hj-cover">
                        <a class="hj-cover-link" href="/entrada.html?e=${encodeURIComponent(cover.slug)}">
                            <div class="hj-cover-imgwrap">
                                <img src="${escape(cover.img)}" alt="${escape(cover.title)}" class="hj-cover-img" loading="lazy" decoding="async">
                                <div aria-hidden="true" class="hj-cover-vignette"></div>
                                <div class="hj-cover-flag-row">
                                    <span class="mono hj-cover-flag">${escape(cover.section.toUpperCase())}</span>
                                    <span class="mono hj-cover-read">${escape(cover.read)} de lectura</span>
                                </div>
                                <div class="hj-cover-caption">
                                    <div class="mono hj-cover-kicker">${escape(cover.kicker)}</div>
                                </div>
                            </div>

                            <h3 class="hj-cover-title">${escape(cover.title)}</h3>
                            <p class="hj-cover-excerpt cover-excerpt">
                                <span class="hj-cover-dropcap">${escape(cover.excerpt.charAt(0))}</span>${escape(cover.excerpt.slice(1))}
                            </p>
                            <div class="hj-cover-meta">
                                <div class="hj-cover-author-row">
                                    <div class="hj-cover-avatar">MB</div>
                                    <div>
                                        <div class="hj-cover-author">${escape(cover.author)}</div>
                                        <div class="mono hj-cover-date">${escape(cover.date.toUpperCase())}</div>
                                    </div>
                                </div>
                                <div class="hj-cover-continue">
                                    Continuar leyendo
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
                                </div>
                            </div>
                        </a>
                    </article>

                    <aside class="hj-side">
                        <div class="hj-side-header">
                            <h4 class="hj-side-title">Más leídos</h4>
                            <div class="mono hj-side-week">ESTA SEMANA</div>
                        </div>
                        ${JOURNAL_SIDE.map((s, i) => html`
                            <article class="hj-side-row">
                                <a class="hj-side-link" href="/entrada.html?e=${encodeURIComponent(s.slug)}">
                                    <div class="hj-side-num">0${i + 1}</div>
                                    <div>
                                        <div class="mono hj-side-meta">
                                            <span>${escape(s.sec)}</span>
                                            <span class="hj-side-meta-dot">·</span>
                                            <span class="hj-side-meta-date">${escape(s.date)}</span>
                                        </div>
                                        <h5 class="hj-side-headline">${escape(s.title)}</h5>
                                        <div class="mono hj-side-read">${escape(s.read)} de lectura</div>
                                    </div>
                                </a>
                            </article>`)}

                        <div class="glass glass-emerald hj-newsletter">
                            <div class="mono hj-newsletter-tag">NEWSLETTER</div>
                            <div class="hj-newsletter-title">
                                Una nota cada<br>
                                <span class="italic hj-newsletter-italic">luna llena</span>
                            </div>
                            <form class="hj-newsletter-form" data-newsletter>
                                <input type="email" name="email" placeholder="tu@correo.com" class="hj-newsletter-input" autocomplete="email" required>
                                <button type="submit" class="hj-newsletter-btn">Suscribir</button>
                            </form>
                        </div>
                    </aside>
                </div>

                <div class="journal-trio hj-trio">
                    ${JOURNAL_TRIO.map(t => html`
                        <article class="hj-trio-item">
                            <a class="hj-trio-link" href="/entrada.html?e=${encodeURIComponent(t.slug)}">
                                <div class="hj-trio-imgwrap">
                                    <img src="${escape(t.img)}" alt="${escape(t.title)}" class="hj-trio-img" loading="lazy" decoding="async">
                                    <div aria-hidden="true" class="hj-trio-vignette"></div>
                                    <span class="mono hj-trio-flag">${escape(t.sec)}</span>
                                </div>
                                <h4 class="hj-trio-title">${escape(t.title)}</h4>
                                <div class="mono hj-trio-who">${escape(t.who)}</div>
                            </a>
                        </article>`)}
                </div>
            </div>
        </section>`;
}

export function initJournalNewsletter() {
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

export default { renderJournalPreview, initJournalNewsletter };
