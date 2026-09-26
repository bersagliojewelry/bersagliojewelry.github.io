/**
 * Home · Sección 6 — Servicios (4 tarjetas con iconos de línea).
 */
import { html, escape } from '../core/html.js';

const SERVICES = [
    { t: 'Diseño a medida', d: 'Si lo que buscas no está en la vitrina, lo creamos contigo.', icon: 'pen' },
    { t: 'Asesoría privada', d: 'Resolvemos cada duda sobre tu pieza, de forma virtual o en nuestra casa de Cartagena.', icon: 'user' },
    { t: 'Gemas certificadas', d: 'Cada gema tiene su propio certificado, de laboratorios distintos según la piedra.', icon: 'gia' },
    { t: 'Garantía comercial de por vida', d: 'Cubre defectos de fabricación mientras el atelier esté en operación.', icon: 'shield' },
];

// Iconos de línea estilo Lucide (stroke 1.6). pen-tool · users · GIA badge · shield-check.
const SERVICE_ICONS = {
    pen:    html`<path d="m12 19 7-7 3 3-7 7-3-3z"/><path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="m2 2 7.586 7.586"/><circle cx="11" cy="11" r="2"/>`,
    user:   html`<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>`,
    gia:    html`<path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/>`,
    shield: html`<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>`,
};

export function renderServices() {
    return html`
        <section class="home-services">
            <div class="container">
                <div class="home-services-header">
                    <div class="eyebrow">Servicios de la casa</div>
                    <h2 class="home-services-title">
                        Así te acompañamos<br>
                        <span class="italic emerald-text">antes y después de elegir</span>
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

export default { renderServices };
