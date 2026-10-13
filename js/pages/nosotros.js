/**
 * Bersaglio Jewelry — Nosotros page (11 secciones).
 *
 * CMS P4: el copy estático migró a `nosotros-defaults.js` (SSoT) y los renderers ahora
 * son PUROS y parametrizados (toman el dato merged), reusados por el preview del panel.
 * `init()` pinta con DEFAULTS y re-pinta al resolver getDoc de siteContent/nosotros.
 * El modelo (8 sub-mapas) coincide con la whitelist de firestore.rules; las listas viven
 * dentro de sus sub-mapas. Escape() por-hoja en cada string (frontera XSS, repo público).
 *
 * Modelo PLANO (síntesis Gemini 2026-06-19): se eliminó el grab-bag `cartagena`.
 * Secciones (visual → dato):
 *   1. Hero          ← hero
 *   2. Cifras        ← cifras.items           (hide-when-empty)
 *   3. Manifiesto    ← manifiesto
 *   4. Filosofía     ← maison (misión/visión)
 *   5. Valores       ← valores.items          (hide-when-empty; nº 01.. derivado)
 *   6. Timeline      ← timeline.items         (hide-when-empty)
 *   7. Atelier       ← atelier (texto)
 *   8. Equipo        ← equipo.items           (hide-when-empty; avatar = iniciales)
 *   9. Certs         ← certificaciones.items  (hide-when-empty)
 *  10. Reseñas       ← resenas.items          (hide-when-empty)
 *  11. FAQ           ← faqs.items             (hide-when-empty)
 *  12. CTA           ← cierre
 * Renderers de lista toleran ítems malformados (guard por-ítem, anti poison-pill).
 *
 * Estado interno:
 *   - _openFaq: índice del FAQ abierto (0..n o -1 si todos cerrados)
 *   - _activeChapter: índice del capítulo activo del timeline (0..n)
 *   - _content: contenido merged vigente (defaults o doc) — lo leen los refresh handlers
 *
 * ⚠️ 2026-10-13: el MARKUP se mudó a `nosotros-render.js` (módulo puro) para que el build
 * pueda hornearlo. Aquí queda lo que necesita el navegador: estado, handlers y `init()`.
 * Las secciones se re-exportan porque el preview del panel las importa desde este fichero.
 */

import { mount, fragment } from '../core/html.js';
import { data } from '../core/data.js';
import { mergeNosotros } from './nosotros-defaults.js';
import { renderNosotros } from './nosotros-render.js';

// Compatibilidad: `js/admin/nosotros-preview.js` importa los renderers desde aquí.
export { nosotrosHeroSection, nosotrosStatsSection, nosotrosManifiestoSection, nosotrosFilosofiaSection, nosotrosValoresSection, nosotrosTimelineSection, nosotrosAtelierSection, nosotrosEquipoSection, nosotrosCertsSection, nosotrosResenasSection, nosotrosFaqSection, nosotrosCtaSection } from './nosotros-render.js';
export { renderNosotros } from './nosotros-render.js';

let _openFaq = 0;
let _activeChapter = 0;
let _content = null;


/** Re-clampa los índices de estado al tamaño vigente de cada lista. */
function clampState() {
    const tl = _content.timeline.items;
    if (_activeChapter < 0 || _activeChapter >= tl.length) _activeChapter = tl.length ? 0 : -1;
    const fq = _content.faqs.items;
    if (_openFaq >= fq.length) _openFaq = fq.length ? 0 : -1;
}

/** Re-merge del doc vigente (defaults si no hay) y re-pintado completo del main.
 *  Sin imagen del CMS, el render muestra la superficie de marca (`.*-image-bg`), NUNCA una
 *  foto demo (cero-ficción). El flash "vieja→nueva" del bug 2026-06-22 era el `background`
 *  CSS demo (earrings) que vivía en `.abt-hero-image-bg`; al quitarlo, no hay nada que saltar
 *  → la maquinaria `_siteReady`/`withoutImages` del §99 (RCA errada) se eliminó (bug Daniel
 *  2026-06-23, RCA real verificada en navegador). */
function repaint() {
    _content = mergeNosotros(data.getSiteContent('nosotros'));
    clampState();
    const main = document.getElementById('main-content');
    if (main) mount(main, renderNosotros(_content, { activeChapter: _activeChapter, openFaq: _openFaq }));
}

function refreshTimeline() {
    const root = document.querySelector('.abt-page');
    if (!root || !_content) return;
    const tl = root.querySelector('.abt-timeline');
    if (!tl) return;
    const oldSection = tl.closest('.abt-section');
    if (!oldSection) return;
    const next = fragment(nosotrosTimelineSection(_content.timeline, _activeChapter)).firstElementChild;
    if (next) oldSection.replaceWith(next);
}

function refreshFAQ() {
    const wrap = document.querySelector('.faq-wrap');
    if (!wrap || !_content) return;
    const next = fragment(nosotrosFaqSection(_content.faqs.items, _openFaq)).querySelector('.faq-wrap');
    if (next) wrap.replaceWith(next);
}

function onMainClick(e) {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;

    if (action === 'chapter') {
        e.preventDefault();
        const idx = Number(btn.dataset.idx);
        if (Number.isNaN(idx) || idx === _activeChapter) return;
        _activeChapter = idx;
        refreshTimeline();
        return;
    }

    if (action === 'faq') {
        e.preventDefault();
        const idx = Number(btn.dataset.idx);
        if (Number.isNaN(idx)) return;
        _openFaq = (_openFaq === idx) ? -1 : idx;
        refreshFAQ();
    }
}

export async function init() {
    const main = document.getElementById('main-content');
    if (!main) return;

    repaint();                                   // 1er paint con DEFAULTS (texto + superficie de marca)
    main.addEventListener('click', onMainClick);

    // CMS P4: SWR cache-first (§110.2) — repaint al instante desde caché y al revalidar (si cambió).
    data.loadSiteContent('nosotros', repaint);
}

export default { init };

