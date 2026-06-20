/**
 * Home · "Lo último en nuestras redes" (feed curado). Contenido GESTIONABLE desde el
 * panel (colección Firestore `socialPosts/`: platform · thumb[imagen] · caption ·
 * href[enlace al post] · type · published). Decisión Daniel: CURADO MANUAL por Kary
 * (no API). Cada tarjeta enlaza al post real.
 *
 * REGLA cero-ficción (`feedback_no_demo_en_index`, spec 2026-06-20): sin posts
 * publicados suficientes (< MIN_SOCIAL) la sección NO se monta (hide-when-empty); JAMÁS
 * datos de ejemplo. NO se muestran métricas (likes/vistas): un engagement inventado es
 * ficción. Lee `data.getSocial()` EN TIEMPO DE RENDER (refresca en vivo).
 */
import { html, escape, mount } from '../core/html.js';
import { data } from '../core/data.js';
import { safeUrl } from '../core/safe-url.js';
import { MIN_SOCIAL, SOCIAL_PLATFORMS, isSocialComplete } from '../core/home-sections.js';   // umbral + redes + completitud (SSoT cero-ficción)

let _tab = 'Todas';

// Posts visibles = PUBLICADOS (data.getSocial) Y completos (thumb+caption+red válida).
// El render re-aplica la completitud (defensa en profundidad, cero-ficción Fase B).
const completeSocial = () => data.getSocial().filter(p => isSocialComplete(p).complete);

const PLATFORMS = ['Todas', ...SOCIAL_PLATFORMS];   // chrome de UI (tabs)

const PLATFORM_PATHS = {
    Instagram: 'M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zm0 3.68A6.16 6.16 0 1 0 18.16 12 6.16 6.16 0 0 0 12 5.84zm0 10.16A4 4 0 1 1 16 12a4 4 0 0 1-4 4zm6.4-10.4a1.44 1.44 0 1 1-1.44-1.44 1.44 1.44 0 0 1 1.44 1.44z',
    Facebook: 'M24 12a12 12 0 1 0-13.88 11.86v-8.39H7.08V12h3.04V9.36c0-3 1.79-4.66 4.53-4.66 1.31 0 2.68.24 2.68.24v2.95h-1.51c-1.49 0-1.95.92-1.95 1.87V12h3.32l-.53 3.47h-2.79v8.39A12 12 0 0 0 24 12z',
    TikTok: 'M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z',
};

// Perfiles REALES de marca (identidad estática, no ficción) — botones "Síguenos".
const FOLLOW = {
    Instagram: 'https://www.instagram.com/bersagliojewelry/',
    Facebook: 'https://www.facebook.com/bersagliojewelry',
    TikTok: 'https://www.tiktok.com/@bersagliojewelry',
};

function platformIcon(name, size) {
    const d = PLATFORM_PATHS[name];
    if (!d) return '';
    return html`<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="${d}"/></svg>`;
}

function renderCards(posts) {
    const list = _tab === 'Todas' ? posts : posts.filter(p => p.platform === _tab);
    return list.slice(0, 8).map(p => html`
        <a class="social-card" href="${escape(safeUrl(p.href))}" target="_blank" rel="noopener noreferrer">
            <div class="social-card-img" style="background-image:url('${escape(p.thumb)}')"></div>
            <div class="social-card-grad" aria-hidden="true"></div>
            <span class="social-badge social-badge--${escape((p.platform || '').toLowerCase())}">${platformIcon(p.platform, 15)}</span>
            ${p.type ? html`<span class="mono social-type">${escape(p.type)}</span>` : ''}
            <div class="social-card-body">
                <div class="social-card-caption">${escape(p.caption || '')}</div>
            </div>
        </a>`).join('');
}

// Contenido interno (re-renderizable en vivo). Lee data.getSocial() AQUÍ, no en import.
function socialInner() {
    const posts = completeSocial();
    if (posts.length < MIN_SOCIAL) return '';     // hide-when-empty (cero-ficción §4)
    return html`
        <div class="container">
            <div class="social-header">
                <span class="eyebrow">Síguenos de cerca</span>
                <h2 class="social-title">Lo último en <span class="italic emerald-text">nuestras redes</span></h2>
                <p class="social-lead">Cada pieza tiene vida fuera de la vitrina. Esto es lo más reciente que hemos publicado en Instagram, Facebook y TikTok.</p>
            </div>

            <div class="social-tabs">
                ${PLATFORMS.map(p => html`<button class="social-tab ${p === _tab ? 'on' : ''}" type="button" data-social-tab="${escape(p)}">${p === 'Todas' ? '' : platformIcon(p, 14)}${escape(p)}</button>`)}
            </div>

            <div class="social-grid" data-social-grid>
                ${renderCards(posts)}
            </div>

            <div class="social-follow">
                <a class="btn-aqua" href="${FOLLOW.Instagram}" target="_blank" rel="noopener noreferrer">${platformIcon('Instagram', 15)} @bersagliojewelry</a>
                <a class="btn-aqua" href="${FOLLOW.TikTok}" target="_blank" rel="noopener noreferrer">${platformIcon('TikTok', 14)} TikTok</a>
                <a class="btn-aqua" href="${FOLLOW.Facebook}" target="_blank" rel="noopener noreferrer">${platformIcon('Facebook', 15)} Facebook</a>
            </div>
        </div>`;
}

export function renderSocial() {
    return html`<section class="home-social">${socialInner()}</section>`;
}

// Re-render en vivo (data.onChange) — espejo de refreshJournalPreview.
export function refreshSocial() {
    const sec = document.querySelector('.home-social');
    if (sec) mount(sec, socialInner());
}

export function initSocial() {
    const section = document.querySelector('.home-social');
    if (!section) return;
    section.addEventListener('click', (e) => {
        const tab = e.target.closest('[data-social-tab]');
        if (!tab) return;
        _tab = tab.dataset.socialTab;
        section.querySelectorAll('[data-social-tab]').forEach(b => b.classList.toggle('on', b.dataset.socialTab === _tab));
        const grid = section.querySelector('[data-social-grid]');
        if (grid) mount(grid, renderCards(completeSocial()));
    });
}

export default { renderSocial, refreshSocial, initSocial };
