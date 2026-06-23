/**
 * Home · Sección 3 — Categorías (dock iOS). DINÁMICO: las tarjetas derivan de las
 * COLECCIONES de Firestore (`data.getCollections()`), administrables desde el panel (CMS).
 * CERO-FICCIÓN (`feedback_no_demo_en_index`): sin colecciones la sección se monta VACÍA
 * (CSS `:empty` la colapsa), JAMÁS categorías de ejemplo. Imágenes vía `<img src=safeUrl>`.
 *
 * CUPO (Daniel 2026-06-21): el INICIO muestra MÁX 6 colecciones + "Ver todas" al resto
 * (catálogo completo en /colecciones). Menos de 6 → se CENTRAN (CSS flex, no alinear izq.).
 *
 * CARGA FLUIDA (comité v3 + consejo Gemini · 2026-06-21): 3 estados para que el contenido NO
 * salte al llegar Firebase:
 *   - LISTO+datos  → contenido real (fade-in suave; swap directo en .bj-lite / movimiento reducido).
 *   - LISTO+vacío  → '' (colapsa, cero-ficción).
 *   - CARGANDO     → reserva el alto de la última carga (localStorage) para no empujar el layout;
 *                    1ª visita sin alto guardado → '' (colapso limpio, sin reservar a ciegas, §3.4).
 * `data.isReady('cats')` mira datos REALES (NO el timeout de data.load() — Gemini: ese timeout
 * colapsaba en red lenta y re-expandía al llegar el dato tarde). Un WATCHDOG de 8s colapsa si
 * los datos nunca llegan (red de seguridad anti-carga-eterna).
 *
 * PATRÓN render/refresh (L-42): render() SIEMPRE devuelve el `<section>`; refresh() rellena su
 * inner en cada data.onChange().
 */
import { html, escape, mount } from '../core/html.js';
import { data } from '../core/data.js';
import { safeUrl } from '../core/safe-url.js';
import { cardsFrom } from './categories-data.js';
import { reservedHeight, rememberHeight } from '../core/section-reserve.js';
import { lqipImgStyle } from '../core/lqip.js';   // §108 F3: blur-up del banner (degrada si no hay LQIP)

// object-position permitido (anti CSS-injection si 'pos' se vuelve editable).
const POS_RE = /^(left|right|center|top|bottom|\d{1,3}%|\s)+$/i;
const safePos = (p) => (typeof p === 'string' && POS_RE.test(p.trim()) ? p.trim() : 'center');

const MAX_CATS = 6;   // cupo del inicio (Daniel 2026-06-21)

// Colecciones reales (vacío → [] → sección colapsada).
const cards = () => cardsFrom(data.getCollections());

// Watchdog anti-carga-eterna: si los datos REALES nunca llegan (Firestore caído), colapsa a los
// 8s para no dejar el espacio reservado para siempre. 8s > el timeout interno de data.load() (4s)
// a propósito: damos margen a redes lentas para llenar la reserva SIN saltar (consejo Gemini).
let _watchdog = null;
let _gaveUp = false;
function armWatchdog() {
    if (_watchdog !== null || _gaveUp) return;
    try {
        _watchdog = setTimeout(() => {
            _watchdog = null;
            if (!data.isReady('cats')) { _gaveUp = true; refreshCategories(); }
        }, 8000);
    } catch { /* entorno sin timers → sin watchdog (no crítico) */ }
}

function tile(c) {
    const count = data.countByCollection(c.slug);
    // Sin imagen propia → superficie de marca (cero-ficción), NUNCA un demo de relleno.
    const img = c.img ? escape(safeUrl(c.img)) : '';
    return html`
        <a class="glass cat-tile"
           href="/colecciones.html?col=${escape(c.slug)}"
           style="--cat-hue:${escape(String(c.hue))}">
            <div class="cat-tile-inner">
                <div class="cat-tile-img">
                    ${img
                        ? html`<img src="${img}" alt="${escape(c.name)}" loading="lazy" decoding="async"
                         style="${lqipImgStyle(c.imgLqip)};width:100%;height:100%;object-fit:cover;object-position:${escape(safePos(c.pos))};display:block;">`
                        : html`<div class="cat-tile-img-bg"></div>`}
                </div>
                <div class="cat-tile-overlay"></div>
                <div class="cat-tile-content">
                    <div class="cat-tile-name">${escape(c.name)}</div>
                    <div class="mono cat-tile-count">${count > 0 ? `${count} piezas` : 'Próximamente'}</div>
                </div>
            </div>
        </a>`;
}

export function renderCategories() {
    armWatchdog();   // first paint → arma la red de seguridad
    return html`<section class="home-cats">${categoriesInner()}</section>`;
}

// Header de marca — COPY ESTÁTICO (se muestra ya en "cargando": ancla la sección, no región muda).
function headerHtml() {
    return html`
        <div class="home-cats-header">
            <div class="eyebrow">Colecciones singulares</div>
            <h2 class="home-cats-title">
                La refracción del <span class="italic emerald-text">alma verde</span>
            </h2>
            <p class="home-cats-lead">
                Nuestras colecciones son capítulos de una historia compartida. Cada anillo, arete y dije es esculpido pacientemente en oro de 18K, rindiendo homenaje al fuego interno y la mística de la esmeralda colombiana.
            </p>
        </div>`;
}

// Estado CON datos: header + dock (máx 6) + "ver todas" si hay más.
function contentHtml(list, total) {
    return html`
        <div class="container">
            ${headerHtml()}
            <div class="cat-dock" data-categories>
                ${list.map(tile)}
            </div>
            ${total > MAX_CATS ? html`
                <div class="home-cats-more">
                    <a href="/colecciones.html" class="home-cats-more-link">
                        Ver todas las colecciones
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
                    </a>
                </div>` : ''}
        </div>`;
}

// Estado CARGANDO: header real + grilla vacía con el alto reservado de la última carga.
// Sin brillo/skeleton (comité: reservar el espacio, no adornar). aria-busy para lectores.
function loadingHtml(rh) {
    return html`
        <div class="container">
            ${headerHtml()}
            <div class="cat-dock is-loading" aria-busy="true" aria-hidden="true" style="min-height:${rh}px"></div>
        </div>`;
}

// Lee data.getCollections() AQUÍ (live), no en import. Resuelve el estado.
function categoriesInner() {
    const all = cards();
    const list = all.slice(0, MAX_CATS);
    if (data.isReady('cats')) {
        return list.length ? contentHtml(list, all.length) : '';   // datos | vacío(colapsa)
    }
    if (_gaveUp) return '';                                         // watchdog: datos nunca llegaron
    const rh = reservedHeight('cats');
    return rh ? loadingHtml(rh) : '';                              // reserva | colapso limpio (1ª visita)
}

// Re-render en vivo (data.onChange). Recuerda el alto al pintar datos (para reservar la próxima
// vez) y hace fade-in al ENTRAR a contenido desde cualquier estado previo sin contenido
// (cargando o colapsado) — suaviza también el dato tardío tras el watchdog.
export function refreshCategories() {
    const sec = document.querySelector('.home-cats');
    if (!sec) return;
    if (data.isReady('cats') && _watchdog !== null) { clearTimeout(_watchdog); _watchdog = null; }
    const hadContent = !!sec.querySelector('[data-categories]');
    mount(sec, categoriesInner());
    const dock = sec.querySelector('[data-categories]');
    if (dock) {
        requestAnimationFrame(() => rememberHeight('cats', dock));
        if (!hadContent) dock.classList.add('bj-fade-in');
    }
}

export default { renderCategories, refreshCategories };
