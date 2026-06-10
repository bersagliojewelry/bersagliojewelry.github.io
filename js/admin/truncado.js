/**
 * Bersaglio Admin — Banner de truncado (spec §9.1: "alerta cuando rowcount == limit").
 *
 * Escucha el evento `bj:truncado` que emiten las capas de datos (crm-service /
 * firestore-service) cuando un listener acotado llega a su tope: significa que
 * el panel está mostrando datos INCOMPLETOS (y la mora en vivo se calcula sobre
 * el set completo, L-29) — eso NUNCA debe ser un console.warn mudo.
 *
 * Pinta UN banner persistente (dedup por origen) arriba del contenido. Verlo =
 * gate de escala alcanzado (ADR §68): toca materializar el aging y paginar.
 *
 * XSS: los `origen` son strings ESTÁTICOS del propio código (no input de usuario)
 * y aun así pasan por esc() — disciplina del panel.
 *
 * STANDALONE (sin imports, como render-sidebar/lead-format): testeable con node
 * y sin ciclo con shared.js (que lo importa para cablearlo en initSidebar).
 */

// Espejo del esc() de shared.js (escapa también comillas — contexto de atributo).
function esc(str) {
    return String(str ?? '')
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

const _origenes = new Set();
let _banner = null;

/** HTML del banner (puro, testeable). */
export function truncadoBannerHTML(origenes) {
    const lista = [...origenes].map(esc).join(' · ');
    return `
        <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18" style="flex:none;"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
        <div style="flex:1;min-width:0;">
            <strong>Hay más registros de los que el panel puede cargar</strong> (${lista}).
            Algunos totales o estados de mora pueden verse incompletos — avísale a Daniel para ampliar la capacidad.
        </div>
        <button type="button" class="adm-btn adm-btn--ghost adm-btn--sm" data-truncado-cerrar>Entendido</button>`;
}

function pintar() {
    const main = document.querySelector('.adm-content');
    if (!main) return;

    if (!_banner) {
        _banner = document.createElement('div');
        _banner.className = 'adm-truncado-banner';
        _banner.setAttribute('role', 'alert');
        // Estilo con tokens del panel (sin hex nuevos, doctrina Panel v2 §50).
        _banner.style.cssText = 'display:flex;align-items:center;gap:12px;padding:12px 16px;'
            + 'margin-bottom:16px;border:1px solid var(--adm-danger);border-radius:10px;'
            + 'background:var(--adm-danger-light);color:var(--adm-danger);font-size:13px;line-height:1.5;';
        main.prepend(_banner);
    }
    _banner.innerHTML = truncadoBannerHTML(_origenes);
    _banner.querySelector('[data-truncado-cerrar]')?.addEventListener('click', () => {
        _banner.remove();
        _banner = null;          // si vuelve a truncar, reaparece (no silenciar para siempre)
        _origenes.clear();
    });
}

/** Monta el listener global (lo llama shared.js initSidebar — una vez por página). */
export function initTruncadoBanner() {
    if (initTruncadoBanner._wired) return;
    initTruncadoBanner._wired = true;
    document.addEventListener('bj:truncado', (e) => {
        const origen = e.detail?.origen || 'datos';
        if (_origenes.has(origen) && _banner) return; // ya pintado, sin re-render por cada snapshot
        _origenes.add(origen);
        pintar();
    });
}
