/**
 * Bersaglio Jewelry — Home page (9 secciones).
 *
 * Mirror exacto de BERSAGLIO NOVO/project/js/page-home.jsx (1075 líneas).
 *
 * Secciones:
 *   1. HomeHero       — banner cinematográfico parallax 3D
 *   2. HomeMarquee    — cinta de credenciales infinita
 *   3. HomeCategories — dock iOS de 6 categorías
 *   4. HomeFeatured   — grid de piezas destacadas (DINÁMICO desde Firestore)
 *   5. HomeEditorial  — split image + manifiesto
 *   6. HomeServices   — 4 servicios con iconos
 *   7. HomeAtelier    — proceso de 4 pasos en escena central con joya
 *   8. HomeJournal    — masthead estilo NYT con cover + sidebar + trio
 *   9. HomeCTA        — invitación a Cartagena
 *
 * Estrategia de implementación:
 *   - Sección dinámica (Featured) usa data.getFeatured() y se re-renderiza
 *     en cada data.onChange() — limita a 4 piezas con price.
 *   - Resto de secciones renderizan una sola vez con copy literal del bundle.
 *   - Hero parallax usa eventos pointermove + CSS custom properties (--mx, --my)
 *     para evitar re-render en cada frame.
 *   - Marquee y journal-ticker son loops CSS infinitos — sin JS.
 */

import { html, escape } from '../core/html.js';
import { format$ } from '../core/format.js';
import { data } from '../core/data.js';
import {
    JOURNAL_ENTRIES as JOURNAL_DATA_ALL,
    JOURNAL_ISSUE   as JOURNAL_DATA_ISSUE,
    JOURNAL_TICKER,
    getFeatured     as journalGetFeatured,
} from '../data/journal.js';

const JOURNAL_DATA_FEATURED = journalGetFeatured();

// ═══════════════════════════════════════════════════════════════════════════
// 1. HERO — Cinematic banner with parallax 3D
// ═══════════════════════════════════════════════════════════════════════════
function renderHero() {
    return html`
        <section class="home-hero" data-hero>
            <div aria-hidden="true" class="home-hero-bg">
                <div class="home-hero-blob home-hero-blob--em"></div>
                <div class="home-hero-blob home-hero-blob--gold"></div>
            </div>

            <div class="home-hero-stage">
                <div class="home-hero-frame">
                    <div class="home-hero-banner" data-tilt>
                        <picture class="home-hero-img" data-parallax-img>
                            <source type="image/avif" srcset="/img/banner-hero-800.avif 800w, /img/banner-hero-1200.avif 1200w, /img/banner-hero-1600.avif 1600w" sizes="100vw">
                            <source type="image/webp" srcset="/img/banner-hero-800.webp 800w, /img/banner-hero-1200.webp 1200w, /img/banner-hero-1600.webp 1600w" sizes="100vw">
                            <img src="/img/banner-hero-1200.webp" alt="" fetchpriority="high" decoding="async" class="home-hero-img-fallback">
                        </picture>
                        <div aria-hidden="true" class="home-hero-rim"></div>

                        <div class="home-hero-content">
                            <div class="home-hero-locator-row">
                                <div class="mono home-hero-locator">
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                                        <circle cx="12" cy="10" r="2.5"/>
                                    </svg>
                                    Cartagena de Indias · Colombia
                                </div>
                            </div>

                            <div class="home-hero-body">
                                <div class="home-hero-eyebrow-row">
                                    <span class="home-hero-eyebrow-line"></span>
                                    <span class="mono home-hero-eyebrow">Alta Joyería Personalizada y de Confianza</span>
                                </div>

                                <h1 class="home-hero-headline">
                                    El arte de escuchar tu historia,<br>
                                    <span class="home-hero-headline-italic">tallado en una joya única.</span>
                                </h1>

                                <p class="home-hero-manifesto">
                                    Nacimos visitando a nuestros clientes de puerta en puerta, cimentando una relación de cercanía y confianza duradera. En nuestro atelier privado del Centro Histórico de Cartagena, no diseñamos simples accesorios: nos tomamos el tiempo para asesorarte y dar vida a piezas irrepetibles de oro de 18 quilates y esmeraldas colombianas éticas. Una inversión emocional y material destinada a custodiar tu esencia para siempre.
                                </p>

                                <div class="home-hero-actions">
                                    <a href="/colecciones.html" class="btn-hero">
                                        <span class="btn-hero-bg" aria-hidden="true"></span>
                                        <span class="btn-hero-shimmer" aria-hidden="true"></span>
                                        <span class="btn-hero-label">Descubrir la colección</span>
                                        <span class="btn-hero-arrow" aria-hidden="true">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                <path d="M5 12h14M13 5l7 7-7 7"/>
                                            </svg>
                                        </span>
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div class="home-hero-signature">
                            <span class="mono home-hero-signature-eyebrow">Una creación de</span>
                            <span class="home-hero-signature-line"></span>
                            <span class="home-hero-signature-name">Kary Mendoza</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>`;
}



// ═══════════════════════════════════════════════════════════════════════════
// 2. MARQUEE — credentials ribbon
// ═══════════════════════════════════════════════════════════════════════════
const MARQUEE_ITEMS = [
    'Oro 18K · Ley 750',
    'Esmeraldas Colombianas',
    'Asesoría Personalizada',
    'Garantía Vitalicia',
    'Atelier en Cartagena',
    'Envío Asegurado Mundial',
    'Una pieza, una historia',
];

function diamondSeparatorSVG() {
    return html`
        <span aria-hidden="true" class="hm-sep">
            <span class="hm-sep-line"></span>
            <svg width="6" height="6" viewBox="0 0 10 10">
                <rect x="2.5" y="2.5" width="5" height="5" transform="rotate(45 5 5)" fill="currentColor"/>
            </svg>
            <span class="hm-sep-line"></span>
        </span>`;
}

function renderMarquee() {
    // Triple the items so the loop animation has enough material to scroll smoothly
    const tripled = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
    return html`
        <section class="home-marquee">
            <div class="hm-track">
                <div class="hm-fade hm-fade--left" aria-hidden="true"></div>
                <div class="hm-fade hm-fade--right" aria-hidden="true"></div>
                <div class="hm-row">
                    ${tripled.map(t => html`
                        <div class="hm-item">
                            <span class="hm-text">${escape(t)}</span>
                            ${diamondSeparatorSVG()}
                        </div>`)}
                </div>
            </div>
        </section>`;
}

// ═══════════════════════════════════════════════════════════════════════════
// 3. CATEGORIES — iOS-style dock
// ═══════════════════════════════════════════════════════════════════════════
const CATEGORIES = [
    { name: 'Anillos',   slug: 'anillos',         img: '/img/ring-sapphire-800.webp',        hue: 200, pos: 'center' },
    { name: 'Topos',     slug: 'topos-aretes',    img: '/img/earrings-travertino-800.webp',  hue: 30,  pos: 'center' },
    { name: 'Argollas',  slug: 'argollas',        img: '/img/earrings-emerald-800.webp',     hue: 155, pos: 'center' },
    { name: 'Dijes',     slug: 'dijes-colgantes', img: '/img/model-emerald-800.webp',        hue: 155, pos: 'center top' },
    { name: 'Pulseras',  slug: 'pulseras',        img: '/img/banner-hero-800.webp',          hue: 90,  pos: 'center' },
    { name: 'Editorial', slug: 'editorial',       img: '/img/model-emerald-800.webp',        hue: 155, pos: 'center' },
];

function renderCategories() {
    return html`
        <section class="home-cats">
            <div class="container">
                <div class="home-cats-header">
                    <div class="eyebrow">Colecciones singulares</div>
                    <h2 class="home-cats-title">
                        La refracción del <span class="italic emerald-text">alma verde</span>
                    </h2>
                    <p class="home-cats-lead">
                        Nuestras colecciones son capítulos de una historia compartida. Cada anillo, arete y dije es esculpido pacientemente en oro de 18K, rindiendo homenaje al fuego interno y la mística de la esmeralda colombiana.
                    </p>
                </div>

                <div class="cat-dock" data-categories>
                    ${CATEGORIES.map(c => {
                        const count = data.countByCollection(c.slug);
                        return html`
                            <a class="glass cat-tile"
                               href="/colecciones.html?col=${escape(c.slug)}"
                               style="--cat-hue:${c.hue}">
                                <div class="cat-tile-inner">
                                    <div class="cat-tile-img" style="background:url('${escape(c.img)}') ${escape(c.pos)}/cover"></div>
                                    <div class="cat-tile-overlay"></div>
                                    <div class="cat-tile-content">
                                        <div class="cat-tile-name">${escape(c.name)}</div>
                                        <div class="mono cat-tile-count">${count > 0 ? `${count} piezas` : 'Próximamente'}</div>
                                    </div>
                                </div>
                            </a>`;
                    })}
                </div>
            </div>
        </section>`;
}

// ═══════════════════════════════════════════════════════════════════════════
// 4. FEATURED — DYNAMIC from Firestore
// ═══════════════════════════════════════════════════════════════════════════
function renderFeatured() {
    const pieces = data.getFeatured(8).filter(p => p.price);
    return html`
        <section class="home-featured">
            <div class="container">
                <div class="home-featured-header">
                    <div>
                        <div class="eyebrow">Curaduría del Atelier</div>
                        <h2 class="home-featured-title">Piezas <span class="italic emerald-text">singulares</span></h2>
                    </div>
                    <a href="/colecciones.html" class="btn-aqua home-featured-cta">
                        Explorar el catálogo entero
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
                    </a>
                </div>

                <div class="home-featured-grid" data-featured>
                    ${pieces.length === 0 ? renderFeaturedEmpty() : pieces.slice(0, 4).map(renderFeaturedCard)}
                </div>
            </div>
        </section>`;
}

function renderFeaturedEmpty() {
    return html`
        <div class="home-featured-empty">
            <p class="mono home-featured-empty-text">El atelier está afilando la próxima curaduría.</p>
            <a href="/colecciones.html" class="btn-aqua btn-aqua-emerald">Explorar todas las piezas</a>
        </div>`;
}

function renderFeaturedCard(p) {
    const slug = p.slug || p.id;
    const img = p.images?.[0] || p.image || '';
    const tag = p.tag || (p.featured ? 'Destacada' : null);
    const stones = p.specs?.stones || p.specs?.stone || '';
    const metal  = p.specs?.metal  || p.specs?.gold  || '';
    const cat = p.collection || '';
    return html`
        <a class="glass glass-iridescent home-featured-card"
           href="/pieza.html?p=${encodeURIComponent(slug)}">
            <div class="home-featured-card-imgwrap">
                <div class="home-featured-card-img" style="background:url('${escape(img)}') center/cover"></div>
                <div class="home-featured-card-vignette" aria-hidden="true"></div>
                ${tag ? html`
                    <div class="home-featured-card-tag">
                        <div class="chip">
                            <span class="chip-dot"></span>${escape(tag)}
                        </div>
                    </div>` : ''}
                <div class="home-featured-card-wishlist" aria-hidden="true">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                </div>
            </div>
            <div class="home-featured-card-body">
                <div class="home-featured-card-cat">${escape(cat)}</div>
                <div class="home-featured-card-name">${escape(p.name || 'Pieza')}</div>
                <div class="home-featured-card-meta">${escape([stones, metal].filter(Boolean).join(' · '))}</div>
                <div class="home-featured-card-foot">
                    <div class="mono home-featured-card-price">${escape(format$(p.price))}</div>
                    <div class="home-featured-card-arrow">
                        Ver pieza
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
                    </div>
                </div>
            </div>
        </a>`;
}

function refreshFeatured() {
    const grid = document.querySelector('[data-featured]');
    if (!grid) return;
    const pieces = data.getFeatured(8).filter(p => p.price);
    grid.innerHTML = pieces.length === 0
        ? renderFeaturedEmpty()
        : pieces.slice(0, 4).map(renderFeaturedCard).join('');
}

function refreshCategories() {
    const dock = document.querySelector('[data-categories]');
    if (!dock) return;
    // Update only the count text, leave the rest alone (avoids image flash)
    const tiles = dock.querySelectorAll('.cat-tile');
    tiles.forEach((tile, idx) => {
        const c = CATEGORIES[idx];
        if (!c) return;
        const count = data.countByCollection(c.slug);
        const countEl = tile.querySelector('.cat-tile-count');
        if (countEl) countEl.textContent = count > 0 ? `${count} piezas` : 'Próximamente';
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// 5. EDITORIAL — split image + manifiesto
// ═══════════════════════════════════════════════════════════════════════════
function renderEditorial() {
    return html`
        <section class="home-editorial">
            <div class="container">
                <div class="home-editorial-grid">
                    <div class="glass glass-iridescent home-editorial-image">
                        <div class="home-editorial-image-bg"></div>
                        <div class="home-editorial-image-shade"></div>
                        <div class="home-editorial-image-content">
                            <div class="chip home-editorial-chip">
                                <span class="chip-dot"></span>Editorial
                            </div>
                            <h3 class="home-editorial-image-title">La Verde, 2026</h3>
                            <p class="home-editorial-image-sub">Seis piezas esculpidas alrededor de la luz esmeralda colombiana.</p>
                        </div>
                    </div>

                    <div class="glass home-editorial-text">
                        <div class="eyebrow">Nuestra filosofía</div>
                        <h2 class="home-editorial-title">
                            El arte de la orfebrería pausada:<br>
                            <span class="italic emerald-text">más que una joya, un legado familiar.</span>
                        </h2>
                        <p class="home-editorial-lead">
                            Entendemos la esmeralda y el oro de 18 quilates como portadores de la memoria humana. Nos convertimos en cómplices silenciosos de los instantes que definen una vida: promesas que trascienden el tiempo, hitos de amor incondicional y el recuerdo indeleble de quienes somos.
                        </p>
                        <blockquote class="home-editorial-quote">
                            "Nuestras esmeraldas colombianas de Muzo y Chivor no son meras pertenencias; son fragmentos de tierra viva custodiados por almas sensibles para ser entregados a la siguiente generación."
                        </blockquote>
                        <div class="home-editorial-stats">
                            <div class="home-editorial-stat">
                                <div class="display home-editorial-stat-num">12+</div>
                                <div class="eyebrow home-editorial-stat-lab">Años</div>
                            </div>
                            <div class="home-editorial-stat">
                                <div class="display home-editorial-stat-num">800+</div>
                                <div class="eyebrow home-editorial-stat-lab">Piezas únicas</div>
                            </div>
                            <div class="home-editorial-stat">
                                <div class="display home-editorial-stat-num">JA</div>
                                <div class="eyebrow home-editorial-stat-lab">Certificado</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>`;
}

// ═══════════════════════════════════════════════════════════════════════════
// 6. SERVICES
// ═══════════════════════════════════════════════════════════════════════════
const SERVICES = [
    { t: 'Diseño a medida', d: 'Crea la pieza de tus sueños con nuestro atelier. Desde boceto hasta entrega.', icon: 'pen' },
    { t: 'Asesoría privada', d: 'Consulta 1:1 con nuestros gemólogos. Virtual o en nuestra casa en Cartagena.', icon: 'user' },
    { t: 'Certificación GIA', d: 'Cada pieza con diamante incluye certificado del Gemological Institute.', icon: 'check' },
    { t: 'Garantía vitalicia', d: 'Mantenimiento, pulido y verificación de piedras de por vida.', icon: 'shield' },
];

const SERVICE_ICONS = {
    pen:    html`<path d="M12 20h9M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>`,
    user:   html`<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>`,
    check:  html`<path d="M20 6L9 17l-5-5"/>`,
    shield: html`<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>`,
};

function renderServices() {
    return html`
        <section class="home-services">
            <div class="container">
                <div class="home-services-header">
                    <div class="eyebrow">El valor de lo excepcional</div>
                    <h2 class="home-services-title">
                        Una experiencia a la altura<br>
                        <span class="italic emerald-text">de tu propia historia</span>
                    </h2>
                </div>
                <div class="home-services-grid">
                    ${SERVICES.map(s => html`
                        <div class="glass home-service-card">
                            <div class="home-service-icon">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
                                    ${SERVICE_ICONS[s.icon]}
                                </svg>
                            </div>
                            <div class="home-service-name">${escape(s.t)}</div>
                            <p class="home-service-desc">${escape(s.d)}</p>
                        </div>`)}
                </div>
            </div>
        </section>`;
}

// ═══════════════════════════════════════════════════════════════════════════
// 7. ATELIER — process scene with central jewel
// ═══════════════════════════════════════════════════════════════════════════
const ATELIER_STEPS = [
    { n: '01', t: 'El Diseño y Concepto', d: 'Concebimos la joya desde el boceto inicial sobre papel, seleccionando metales nobles y gemas con carácter propio.', corner: 0 },
    { n: '02', t: 'Asesoría Confidencial', d: 'Te acompañamos en cada etapa de la elección. Un diálogo íntimo y pausado para dar con la pieza exacta que refleje tu legado.', corner: 1 },
    { n: '03', t: 'Garantía y Certificación', d: 'Respaldamos la autenticidad y excelencia de cada piedra con reportes internacionales de la GIA y origen de mina.', corner: 2 },
    { n: '04', t: 'Custodia de por vida', d: 'Nuestras piezas nacen con vocación de eternidad. Ofrecemos mantenimiento, pulido y restauración vitalicia sin límites.', corner: 3 },
];

function renderAtelier() {
    return html`
        <section class="home-atelier">
            <div class="container">
                <div class="home-atelier-header">
                    <div class="chip"><span class="chip-dot"></span>Atelier Bersaglio</div>
                    <h2 class="home-atelier-title">
                        El viaje de creación de <span class="italic emerald-text">una pieza de culto</span>
                    </h2>
                    <p class="home-atelier-lead">
                        Un recorrido artesanal meticuloso que transforma una visión en un objeto eterno.
                    </p>
                </div>

                <div class="glass glass-iridescent at-stage">
                    <svg aria-hidden="true" class="at-connectors">
                        <defs>
                            <radialGradient id="at-conn-fade" cx="50%" cy="50%" r="50%">
                                <stop offset="0%" stop-color="oklch(70% 0.10 85)" stop-opacity="0.5"/>
                                <stop offset="100%" stop-color="oklch(70% 0.10 85)" stop-opacity="0"/>
                            </radialGradient>
                        </defs>
                        <line x1="20%" y1="20%" x2="50%" y2="50%" stroke="url(#at-conn-fade)" stroke-width="1" stroke-dasharray="2 5"/>
                        <line x1="80%" y1="20%" x2="50%" y2="50%" stroke="url(#at-conn-fade)" stroke-width="1" stroke-dasharray="2 5"/>
                        <line x1="20%" y1="80%" x2="50%" y2="50%" stroke="url(#at-conn-fade)" stroke-width="1" stroke-dasharray="2 5"/>
                        <line x1="80%" y1="80%" x2="50%" y2="50%" stroke="url(#at-conn-fade)" stroke-width="1" stroke-dasharray="2 5"/>
                    </svg>

                    <div aria-hidden="true" class="at-halo"></div>
                    <div aria-hidden="true" class="at-ring"></div>

                    <div class="at-jewel">
                        <img src="/img/ring-sapphire-800.webp" alt="" class="at-jewel-img" loading="lazy" decoding="async">
                        <div aria-hidden="true" class="at-jewel-glint"></div>
                    </div>

                    ${ATELIER_STEPS.map(s => html`
                        <div class="at-card at-card--corner-${s.corner}">
                            <div class="at-card-num-row">
                                <span class="at-card-num">${s.n}</span>
                                <span class="at-card-num-line"></span>
                            </div>
                            <div class="at-card-title">${escape(s.t)}</div>
                            <p class="at-card-desc">${escape(s.d)}</p>
                        </div>`)}

                    <div class="at-cta">
                        <a href="/contacto.html" class="btn-aqua btn-aqua-emerald">
                            Iniciar mi pieza
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
                        </a>
                    </div>
                </div>
            </div>
        </section>`;
}

// ═══════════════════════════════════════════════════════════════════════════
// 8. JOURNAL — masthead estilo NYT (datos compartidos con journal/entrada pages)
// ═══════════════════════════════════════════════════════════════════════════

function renderJournal() {
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

function initJournalNewsletter() {
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

// ═══════════════════════════════════════════════════════════════════════════
// 9. CTA — Cartagena
// ═══════════════════════════════════════════════════════════════════════════
function renderCTA() {
    return html`
        <section class="home-cta">
            <div class="container">
                <div class="glass glass-iridescent home-cta-card">
                    <div class="home-cta-glow" aria-hidden="true"></div>
                    <div class="home-cta-content">
                        <div class="eyebrow">Visita nuestro Atelier privado</div>
                        <h2 class="home-cta-title">
                            Casa San Agustín<br>
                            <span class="italic emerald-text">Cartagena de Indias</span>
                        </h2>
                        <p class="home-cta-lead">
                            Te invitamos a cruzar el umbral de nuestra Maison en el centro histórico de Cartagena de Indias. En la intimidad de nuestra Casa San Agustín, a puerta cerrada y con la calma de un buen café, conversaremos sin prisa sobre la pieza que habitará en tu linaje familiar.
                        </p>
                        <div class="home-cta-actions">
                            <a href="/contacto.html" class="btn-aqua btn-aqua-emerald">Agendar cita privada</a>
                            <a href="/colecciones.html" class="btn-aqua">Explorar colecciones</a>
                        </div>
                    </div>
                </div>
            </div>
        </section>`;
}

// ═══════════════════════════════════════════════════════════════════════════
// MOUNT
// ═══════════════════════════════════════════════════════════════════════════
function renderAll() {
    return [
        renderHero(),
        renderMarquee(),
        renderCategories(),
        renderFeatured(),
        renderEditorial(),
        renderServices(),
        renderAtelier(),
        renderJournal(),
        renderCTA(),
    ].join('');
}

export async function init() {
    const main = document.getElementById('main-content');
    if (!main) return;

    // Kick off Firestore data load (non-blocking — first paint uses skeleton)
    data.load().catch(() => {});

    // Initial paint
    main.innerHTML = renderAll();

    // Hero parallax + journal newsletter wire-up
    requestAnimationFrame(() => {
        initJournalNewsletter();
    });

    // Real-time refresh of dynamic sections only (avoids hero re-render)
    data.onChange(() => {
        refreshFeatured();
        refreshCategories();
    });
}

export default { init };
