/**
 * Home · Sección 1 — Hero cinematográfico.
 *
 * Parallax 3D DESACTIVADO por decisión del cliente: no hay handler pointermove
 * y el atributo data-tilt se retira. Se conservan los efectos de cristal y la
 * animación de entrada (CSS).
 */
import { html } from '../core/html.js';

export function renderHero() {
    return html`
        <section class="home-hero" data-hero>
            <div aria-hidden="true" class="home-hero-bg">
                <div class="home-hero-blob home-hero-blob--em"></div>
                <div class="home-hero-blob home-hero-blob--gold"></div>
            </div>

            <div class="home-hero-stage">
                <div class="home-hero-frame">
                    <div class="home-hero-banner">
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

export default { renderHero };
