/**
 * Home · banda "Buscar por código" (TODO-58 slice 3).
 *
 * Kary le da a un cliente el código de una pieza (ej. "0953") → desde el INICIO el
 * cliente la encuentra al instante y salta a ella. Reusa el componente COMPARTIDO
 * `renderBuscadorCodigo('home')` (js/core/buscador-codigo.js); el wire por delegación
 * (con `stubFallback` para el caso "datos aún sin cargar" → /p/<code>) lo hace home.js.
 *
 * Discreta: banda glass centrada y angosta — no compite con el hero ni la editorial.
 */
import { html } from '../core/html.js';
import { renderBuscadorCodigo } from '../core/buscador-codigo.js';

export function renderCodigo() {
    return html`
        <section class="home-codigo" aria-label="Buscar una pieza por su código">
            <div class="container">
                ${renderBuscadorCodigo('home')}
            </div>
        </section>`;
}

export default { renderCodigo };
