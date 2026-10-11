/**
 * Bersaglio Jewelry — Entrada (single journal post).
 *
 * URL: /journal/<slug>.html (HORNEADA por el SSG = canónica e indexable, A3) ·
 *      /entrada.html?e=<slug> (shell SPA, noindex — sigue resolviendo por compatibilidad)
 *
 * Layout editorial:
 *   1. Breadcrumb (Inicio / Journal / título)
 *   2. Hero: kicker eyebrow + flag chip + título display gigante + meta (date · read · author)
 *   3. Featured image full-width glass-iridescent
 *   4. Article body con drop-cap en primer párrafo + max-width 720 + leading 1.85
 *   5. Share bar (sticky aside): WhatsApp / Email / Copy link
 *   6. Related (3 más de la misma sección)
 *   7. Newsletter CTA + back-to-journal
 *
 * Estado interno:
 *   - _slug viene del URL
 *   - Si no existe, renderiza 404 con CTA al journal index
 *
 * SEO: sobreescribe document.title, canonical, og:* dinámicamente
 */

import { html, mount } from '../core/html.js';
import { data } from '../core/data.js';
import { getEntryBySlug, getRelated, entryHref } from '../data/journal.js';
// El markup del artículo vive en UN módulo puro que este fichero y el generador del build
// importan igual: así lo horneado y lo hidratado son el mismo HTML y el repintado no se ve.
import { renderArticle, entryTitleTag } from '../data/journal-render.js';

let _slug = '';

/** URL absoluta canónica de una entrada (la horneada e indexable) — para canonical/og/compartir. */
const entryUrlAbs = (slug) => `https://bersagliojewelry.co${entryHref(slug)}`;

/**
 * Página HORNEADA (/journal/<slug>.html): el slug lo inyecta el SSG en
 * `window.PRERENDERED_ENTRY_SLUG` (no hay `?e=`) — espejo de PRERENDERED_PIECE_SLUG en las
 * fichas de pieza. Shell SPA (/entrada.html?e=<slug>): el parámetro. Ambas resuelven al mismo
 * artículo, así los enlaces viejos siguen funcionando.
 */
function getSlugFromURL() {
    if (typeof window !== 'undefined' && window.PRERENDERED_ENTRY_SLUG) return window.PRERENDERED_ENTRY_SLUG;
    return new URL(location.href).searchParams.get('e') || '';
}

// ═══════════════════════════════════════════════════════════════════
// RENDER
// ═══════════════════════════════════════════════════════════════════

function renderNotFound() {
    return html`
        <div class="container en-page">
            <nav class="en-breadcrumb">
                <a class="en-crumb" href="/">Inicio</a>
                <span class="en-crumb-sep" aria-hidden="true">→</span>
                <a class="en-crumb" href="/journal.html">Journal</a>
            </nav>
            <div class="glass en-notfound">
                <div class="en-notfound-icon" aria-hidden="true">
                    <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="13"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                </div>
                <h1 class="en-notfound-title">Esta entrada se mudó del archivo</h1>
                <p class="en-notfound-sub">Quizá la retiramos o el enlace cambió. Explora el resto del Journal.</p>
                <a href="/journal.html" class="btn-aqua btn-aqua-emerald">Ver todas las entradas</a>
            </div>
        </div>`;
}

// Estado de carga (recon F1): NO mostrar el 404 duro mientras el listener de journal aún
// no resolvió. Reusa el shell de renderNotFound con copy neutro (cero CSS nueva).
function renderLoading() {
    return html`
        <div class="container en-page">
            <nav class="en-breadcrumb">
                <a class="en-crumb" href="/">Inicio</a>
                <span class="en-crumb-sep" aria-hidden="true">→</span>
                <a class="en-crumb" href="/journal.html">Journal</a>
            </nav>
            <div class="glass en-notfound">
                <h1 class="en-notfound-title">Cargando la entrada…</h1>
                <p class="en-notfound-sub">Un momento, estamos trayendo la nota del Journal.</p>
            </div>
        </div>`;
}

function renderAll(entry) {
    return renderArticle(entry, getRelated(entry.slug, 3));
}

// ═══════════════════════════════════════════════════════════════════
// HANDLERS
// ═══════════════════════════════════════════════════════════════════

// _settled = true cuando el listener de journal ya emitió ≥1 snapshot (vía data.onChange).
// Antes de eso, getEntryBySlug(_slug)=null puede ser "aún cargando", NO "no existe".
let _settled = false;

function refresh() {
    const main = document.getElementById('main-content');
    if (!main) return;
    const entry = getEntryBySlug(_slug);
    if (!entry) {
        // LO HORNEADO NO SE PISA (2026-10-10). En `/journal/<slug>.html` el generador deja el
        // artículo completo dentro del <main> y lo sella con `data-baked`. Mientras Firestore no
        // responda —o responda sin esta entrada— ese HTML ya es la respuesta correcta: taparlo con
        // «Cargando la entrada…» es, literalmente, lo que el renderizador de Google fotografió el
        // 10-oct en Search Console, y el motivo de que el cuerpo del artículo no contara.
        //
        // La guarda se ata al sello del generador y NO a `_settled`, porque `_settled` también lo
        // levantan el watchdog de 8 s y el primer snapshot real; y hay un tercer camino al 404
        // blando que no necesita reloj: si en el panel se le borra la imagen o el resumen a un
        // artículo PUBLICADO, `isJournalComplete` lo descarta y `getEntryBySlug` devuelve null con
        // un snapshot legítimo — eso borraría un artículo vivo en la primera respuesta de la red.
        //
        // Precio aceptado, dicho en voz alta: si una entrada se DESPUBLICA, su página horneada
        // sigue sirviendo el artículo hasta el siguiente build (el cron corre a diario). Se
        // prefiere eso a blanquear por error una página que hoy funciona.
        if (main.dataset.baked) return;
        if (!_settled) { mount(main, renderLoading()); return; }   // cargando ≠ 404 (no toca title)
        main.innerHTML = renderNotFound();
        document.title = 'Entrada no encontrada · Bersaglio Jewelry';
        return;
    }
    main.innerHTML = renderAll(entry);

    // SEO updates. El <title> usa la MISMA fórmula que hornea el generador (ver
    // journal-render.js): antes se reescribía como «… · The Bersaglio Journal» y eso le quitaba
    // «Cartagena», que es la palabra con la que la gente busca y la que trae las impresiones.
    document.title = entryTitleTag(entry.title);
    const canonical = document.querySelector('link[rel="canonical"]');
    const ogUrl = document.querySelector('meta[property="og:url"]');
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogImg = document.querySelector('meta[property="og:image"]');
    const ogDesc = document.querySelector('meta[name="description"]');
    // canonical/og apuntan SIEMPRE a la horneada indexable (aunque se llegue por ?e=): una sola
    // URL canónica → cero contenido duplicado para Google.
    const url = entryUrlAbs(entry.slug);
    if (canonical) canonical.setAttribute('href', url);
    if (ogUrl)     ogUrl.setAttribute('content', url);
    if (ogTitle)   ogTitle.setAttribute('content', entry.title);
    // La imagen del CMS ya es ABSOLUTA (Firebase Storage). Prefijar el dominio la rompía
    // ("https://bersagliojewelry.cohttps://firebasestorage…") → preview social roto.
    if (ogImg && entry.image) {
        ogImg.setAttribute('content', /^https?:\/\//i.test(entry.image)
            ? entry.image
            : `https://bersagliojewelry.co${entry.image}`);
    }
    if (ogDesc)    ogDesc.setAttribute('content', entry.excerpt);
}

async function copyLink() {
    const url = entryUrlAbs(_slug);
    let copied = false;
    try {
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(url);
            copied = true;
        }
    } catch {}
    if (!copied) {
        // Fallback: select + execCommand
        const ta = document.createElement('textarea');
        ta.value = url;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { copied = document.execCommand('copy'); } catch {}
        ta.remove();
    }
    const fb = document.querySelector('[data-feedback]');
    if (fb) {
        fb.textContent = copied ? '✓ Enlace copiado' : 'No pude copiar — selecciónalo a mano';
        setTimeout(() => { fb.textContent = ''; }, 2400);
    }
}

function onMainClick(e) {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    if (btn.dataset.action === 'copy') {
        e.preventDefault();
        copyLink();
    }
}

export async function init() {
    const main = document.getElementById('main-content');
    if (!main) return;

    _slug = getSlugFromURL();
    data.loadJournal();            // B4: solo el listener de journal (no piezas/cols)
    // Watchdog 8s: si el listener de journal nunca resuelve, dejamos "Cargando…" y mostramos el
    // estado real (404 si la entrada no existe) — evita carga eterna. (Daniel 2026-06-22.)
    try { setTimeout(() => { if (!_settled) { _settled = true; refresh(); } }, 8000); } catch {}
    refresh();                     // pinta ya (cargando si aún no hay entradas live)
    data.onChange(() => { _settled = true; refresh(); });   // 1er snapshot de journal = datos resueltos
    main.addEventListener('click', onMainClick);

    window.addEventListener('popstate', () => {
        _slug = getSlugFromURL();
        refresh();
    });
}

export default { init };
