/**
 * Home · Sección 9 — CTA Cartagena (invitación a la Maison).
 */
import { html } from '../core/html.js';

export function renderCTA() {
    return html`
        <section class="home-cta">
            <div class="container">
                <div class="glass glass-iridescent home-cta-card">
                    <div class="home-cta-glow" aria-hidden="true"></div>
                    <div class="home-cta-content">
                        <div class="eyebrow">Visita nuestro Atelier privado</div>
                        <h2 class="home-cta-title">
                            Nuestra Maison<br>
                            <span class="italic emerald-text">Cartagena de Indias</span>
                        </h2>
                        <p class="home-cta-lead">
                            Te invitamos a cruzar el umbral de nuestra Maison en el Centro Histórico de Cartagena de Indias. Con la calma de un buen café, conversaremos sin prisa sobre la pieza que habitará en tu linaje familiar.
                        </p>
                        <div class="home-cta-actions">
                            <a href="/contacto.html" class="btn-aqua btn-aqua-emerald">Agendar cita privada</a>
                            <a href="/colecciones.html" class="btn-aqua">Explorar colecciones</a>
                        </div>
                        <div class="mono home-cta-address">Calle 36 # 6-32 · San Agustín Chiquita / Centro Histórico · Bolívar, Colombia</div>
                    </div>
                </div>
            </div>
        </section>`;
}

export default { renderCTA };
