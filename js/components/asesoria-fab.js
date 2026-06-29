/**
 * Bersaglio Jewelry — Acceso flotante a ASESORÍA (concierge).
 *
 * §156 — REEMPLAZA al quick-dock "isla de agua" (gimmick animado/arrastrable que abarataba la
 * marca y pisaba contenido). Veredicto del flujo W-11 (arquitecto + comité + consejo Gemini):
 *   · la isla se va; un dock de herramientas a la izquierda sería redundante con el header
 *     (Buscar/♥/Carrito/menú) → NO se hace;
 *   · queda UN solo acceso sobrio abajo-DERECHA, de cristal de marca (NO la burbuja verde de
 *     WhatsApp, que "grita soporte genérico" — crítica de Antigravity adoptada): persiste durante
 *     el scroll de la home larga → asesoría 1-a-1 de Kary a un toque.
 *
 * Enlace de WhatsApp desde la FUENTE ÚNICA (siteContent/global.contacto). Solo en el index
 * (boot.js, Daniel §138). Sin arrastre, sin olas, sin animación de flote (respeta reduced-motion).
 */
import { html, escape, mount } from '../core/html.js';
import { data } from '../core/data.js';
import { mergeGlobal, waHref } from '../core/global-defaults.js';
import { safeUrl } from '../core/safe-url.js';   // valida la URL (anti stored-XSS, repo público L-15)

/** WhatsApp del CMS global; fallback = default real (global-defaults). */
function waUrl() {
    return waHref(mergeGlobal(data.getSiteContent('global')).contacto.whatsapp);
}

// Glifo de DIÁLOGO (no el logo de WhatsApp): comunica "habla con un asesor", monocromo de marca.
function fabHTML() {
    return html`
        <a class="glass bj-asesoria-fab" href="${escape(safeUrl(waUrl()))}" target="_blank" rel="noopener noreferrer"
           aria-label="Asesoría privada por WhatsApp">
            <span class="bj-asesoria-ic" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                </svg>
            </span>
            <span class="bj-asesoria-label">Asesoría</span>
        </a>`;
}

export function mountAsesoriaFab() {
    if (document.querySelector('.bj-asesoria-fab')) return;   // idempotente
    const wrap = document.createElement('div');
    mount(wrap, fabHTML());
    const a = wrap.firstElementChild;
    if (!a) return;
    document.body.appendChild(a);

    // CMS global: si llega el override del WhatsApp, refresca el href en sitio (sin re-montar).
    data.onChange(() => {
        const f = document.querySelector('.bj-asesoria-fab');
        if (f) f.href = waUrl();
    });
}

export default { mountAsesoriaFab };
