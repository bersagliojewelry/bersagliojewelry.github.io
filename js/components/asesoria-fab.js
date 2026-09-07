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

// §156.12 (flujo W-11: comité + consejo Gemini, verificado): ícono de WhatsApp de LÍNEA FINA monocromo
// en ESMERALDA (no el verde de barrio) = se entiende el canal + "Asesoría privada" (voz de marca; el
// EQUIPO del atelier, no una persona — la dueña no siempre responde). SIN avatar, SIN punto "en línea",
// SIN pulso (abaratan, consejo). El ícono dice CÓMO (WhatsApp), el texto dice QUÉ (asesoría, no soporte).
function fabHTML() {
    return html`
        <a class="bj-asesoria-fab" href="${escape(safeUrl(waUrl()))}" target="_blank" rel="noopener noreferrer"
           aria-label="Asesoría privada por WhatsApp">
            <span class="bj-asesoria-ic" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9l-5.05.9"/>
                    <path d="M9 10a.5.5 0 0 0 1 0v-1a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1"/>
                </svg>
            </span>
            <span class="bj-asesoria-label">Asesoría privada</span>
        </a>`;
}

export function mountAsesoriaFab() {
    if (document.querySelector('.bj-asesoria-fab')) return;   // idempotente
    const wrap = document.createElement('div');
    mount(wrap, fabHTML());
    const a = wrap.firstElementChild;
    if (!a) return;
    document.body.appendChild(a);

    // Visibilidad por ZONAS (Daniel 2026-06-30): el FAB se revela SOLO en el cuerpo de la página —
    // NO sobre el hero (ya hay un CTA "Asesoría privada" ahí = redundante) ni sobre el footer (taparía
    // los enlaces legales Términos/Privacidad/Cookies = mismo patrón de bloqueo que [[L-63]]). Se usa
    // IntersectionObserver (no scroll-spam; §3.5). Entrada con fade+subida vía `.is-revealed` (CSS).
    // El FAB se monta en boot, ANTES de que el home pinte el hero/footer → reintentar (rAF, cap) hasta
    // que existan las zonas; si nunca aparecen, mostrarlo (no-bloqueante). Arranca OCULTO (hero a la vista).
    const wireZones = (tries) => {
        const hero = document.querySelector('.home-hero, [data-hero]');
        const footer = document.querySelector('.bj-footer');
        if (!hero && !footer) {
            if (tries > 0) { requestAnimationFrame(() => wireZones(tries - 1)); return; }
            a.classList.add('is-revealed'); return;   // sin zonas → muéstralo (degradación no-bloqueante)
        }
        let heroVis = !!hero, footVis = false;        // hero presente al cargar → arranca OCULTO
        const apply = () => a.classList.toggle('is-revealed', !heroVis && !footVis);
        if ('IntersectionObserver' in window) {
            const io = new IntersectionObserver((entries) => {
                for (const e of entries) {
                    if (e.target === hero) heroVis = e.isIntersecting;
                    else if (e.target === footer) footVis = e.isIntersecting;
                }
                apply();
            }, { threshold: 0 });
            if (hero) io.observe(hero);
            if (footer) io.observe(footer);
            apply();
        } else {
            a.classList.add('is-revealed');
        }
    };
    wireZones(30);

    // CMS global: si llega el override del WhatsApp, refresca el href en sitio (sin re-montar).
    data.onChange(() => {
        const f = document.querySelector('.bj-asesoria-fab');
        if (f) f.href = waUrl();
    });
}

export default { mountAsesoriaFab };
