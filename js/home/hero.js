/**
 * Home · Sección 1 — Hero cinematográfico. DINÁMICO (CMS P1): los textos vienen de
 * merge(HOME_DEFAULTS, siteContent/home).hero — editables desde el panel (Contenido
 * web → Textos del Home). Primer paint con DEFAULTS (LCP instantáneo, sin esperar
 * Firestore); refreshHero() re-pinta una vez si llega un override (home.js).
 * Todo texto editable va por escape(); el href del CTA por safeUrl() (anti stored-XSS,
 * repo público L-15). El banner/estructura es ESTANDARIZADO (no editable en el piloto).
 *
 * Parallax 3D DESACTIVADO (decisión del cliente): sin pointermove, sin data-tilt.
 */
import { html, escape, mount } from '../core/html.js';
import { data } from '../core/data.js';
import { safeUrl } from '../core/safe-url.js';
import { lqipImgStyle } from '../core/lqip.js';   // §110.2 F3: blur-up (degrada si no hay LQIP)
import { mergeHome } from './siteContent-defaults.js';
import { mergeGlobal, waHref } from '../core/global-defaults.js';   // §156: 2º CTA "Asesoría privada" (WhatsApp del CMS global)

export function heroInner(c) {
    // P3.5: portada editable. Con imagen custom (URL de Storage) → <img> simple (ya viene
    // optimizada ≤1600px webp/avif por image-optimizer). Sin ella → el <picture> estático con
    // srcset responsive. safeUrl valida la URL (anti stored-XSS); safe-url.js prescribe ESTE patrón.
    const heroImg = c.bgImage
        ? `<img src="${escape(safeUrl(c.bgImage))}" alt="" fetchpriority="high" decoding="async" class="home-hero-img home-hero-img-fallback" style="${lqipImgStyle(c.bgImageLqip)}">`
        : `<picture class="home-hero-img" data-parallax-img>
                            <source type="image/avif" srcset="/img/hero-800.avif 800w, /img/hero-1200.avif 1200w, /img/hero-1600.avif 1600w" sizes="100vw">
                            <source type="image/webp" srcset="/img/hero-800.webp 800w, /img/hero-1200.webp 1200w, /img/hero-1600.webp 1600w" sizes="100vw">
                            <img src="/img/hero-1200.webp" alt="" fetchpriority="high" decoding="async" class="home-hero-img-fallback">
                        </picture>`;
    return html`
            <div aria-hidden="true" class="home-hero-bg">
                <div class="home-hero-blob home-hero-blob--em"></div>
                <div class="home-hero-blob home-hero-blob--gold"></div>
            </div>

            <div class="home-hero-stage">
                <div class="home-hero-frame">
                    <div class="home-hero-banner">
                        ${heroImg}
                        <div aria-hidden="true" class="home-hero-rim"></div>

                        <div class="home-hero-content">
                            <div class="home-hero-locator-row">
                                <div class="mono home-hero-locator">
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                                        <circle cx="12" cy="10" r="2.5"/>
                                    </svg>
                                    ${escape(c.locator)}
                                </div>
                            </div>

                            <div class="home-hero-body">
                                <div class="home-hero-eyebrow-row">
                                    <span class="home-hero-eyebrow-line"></span>
                                    <span class="mono home-hero-eyebrow">${escape(c.eyebrow)}</span>
                                </div>

                                <h1 class="home-hero-headline">
                                    ${escape(c.headline1)}<br>
                                    <span class="home-hero-headline-italic">${escape(c.headline2)}</span>
                                </h1>

                                <p class="home-hero-manifesto">${escape(c.manifesto)}</p>

                                <div class="home-hero-trust">
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>
                                    Certificación de origen · Oro de ley 750
                                </div>

                                <div class="home-hero-actions">
                                    <a href="${escape(safeUrl(c.ctaHref, '/colecciones.html'))}" class="btn-hero">
                                        <span class="btn-hero-bg" aria-hidden="true"></span>
                                        <span class="btn-hero-shimmer" aria-hidden="true"></span>
                                        <span class="btn-hero-label">${escape(c.ctaLabel)}</span>
                                        <span class="btn-hero-arrow" aria-hidden="true">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                <path d="M5 12h14M13 5l7 7-7 7"/>
                                            </svg>
                                        </span>
                                    </a>
                                    <a href="${escape(safeUrl(waHref(mergeGlobal(data.getSiteContent('global')).contacto.whatsapp)))}" class="btn-hero-ghost" target="_blank" rel="noopener">Asesoría privada</a>
                                </div>
                            </div>
                        </div>

                        <div class="home-hero-signature">
                            <span class="mono home-hero-signature-eyebrow">${escape(c.signatureEyebrow)}</span>
                            <span class="home-hero-signature-line"></span>
                            <span class="home-hero-signature-name">${escape(c.signatureName)}</span>
                        </div>
                    </div>
                </div>
            </div>`;
}

export function renderHero() {
    const c = mergeHome(data.getSiteContent('home')).hero;
    return html`<section class="home-hero" data-hero>${heroInner(c)}</section>`;
}

/** Re-pinta el hero cuando llega el override de siteContent (una vez, desde home.js). */
export function refreshHero() {
    const sec = document.querySelector('.home-hero');
    if (!sec) return;
    mount(sec, heroInner(mergeHome(data.getSiteContent('home')).hero));
}

export default { renderHero, refreshHero };
