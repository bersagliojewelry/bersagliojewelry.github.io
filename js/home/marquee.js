/**
 * Home · Sección 2 — Marquee de credenciales (loop CSS infinito, sin JS).
 */
import { html, escape } from '../core/html.js';

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

export function renderMarquee() {
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

export default { renderMarquee };
