/**
 * Home · Sección 7 — Atelier (escena rediseñada).
 * Joya `gema.png` flotante al centro + halo dorado-verde + anillo punteado girando
 * (atSpin) + líneas .at-flow conectando hacia el centro. 4 tarjetas acercadas con
 * dot (sin números grandes de paso).
 */
import { html, escape } from '../core/html.js';

const ATELIER_STEPS = [
    { t: 'El Diseño y Concepto', d: 'Concebimos la joya desde el boceto inicial sobre papel, seleccionando metales nobles y gemas con carácter propio.', corner: 0 },
    { t: 'Asesoría Confidencial', d: 'Te acompañamos en cada etapa de la elección. Un diálogo íntimo y pausado para dar con la pieza exacta que refleje tu legado.', corner: 1 },
    { t: 'Garantía y Certificación', d: 'Respaldamos la autenticidad y excelencia de cada piedra con reportes internacionales de la GIA y origen de mina.', corner: 2 },
    { t: 'Custodia de por vida', d: 'Nuestras piezas nacen con vocación de eternidad. Ofrecemos mantenimiento, pulido y restauración vitalicia sin límites.', corner: 3 },
];

export function renderAtelier() {
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
                    <svg class="at-flow" viewBox="0 0 1000 560" preserveAspectRatio="none" aria-hidden="true">
                        <defs>
                            <linearGradient id="at-flow-g" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stop-color="oklch(80% 0.13 85)" stop-opacity="0.05"/>
                                <stop offset="100%" stop-color="oklch(68% 0.15 155)" stop-opacity="0.65"/>
                            </linearGradient>
                        </defs>
                        <g fill="none" stroke="url(#at-flow-g)" stroke-width="1.5" stroke-dasharray="2 9" stroke-linecap="round" vector-effect="non-scaling-stroke">
                            <path class="at-flow-1" d="M180 150 Q 370 268 470 278"/>
                            <path class="at-flow-2" d="M820 150 Q 630 268 530 278"/>
                            <path class="at-flow-3" d="M180 410 Q 370 292 470 282"/>
                            <path class="at-flow-4" d="M820 410 Q 630 292 530 282"/>
                        </g>
                    </svg>

                    <div aria-hidden="true" class="at-halo"></div>
                    <div aria-hidden="true" class="at-ring"></div>

                    <div class="at-jewel">
                        <img src="/img/gema.png" alt="Esmeralda Bersaglio engastada en oro 18K" class="at-jewel-img" loading="lazy" decoding="async">
                    </div>

                    ${ATELIER_STEPS.map(s => html`
                        <div class="at-card at-card--corner-${s.corner}">
                            <div class="at-card-title"><span class="at-card-dot" aria-hidden="true"></span>${escape(s.t)}</div>
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

export default { renderAtelier };
