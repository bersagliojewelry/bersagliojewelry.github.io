/**
 * Home · Sección 5 — Editorial (split image + manifiesto).
 */
import { html } from '../core/html.js';

export function renderEditorial() {
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

export default { renderEditorial };
