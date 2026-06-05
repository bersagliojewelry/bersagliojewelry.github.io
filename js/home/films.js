/**
 * Home · Sección NUEVA — Bersaglio Films (galería de video).
 * Feature 16:9 + grid lateral + lightbox. Datos en js/data/home-media.js.
 * El lightbox es un placeholder de demo; el video real se conectará luego (TODO).
 */
import { html, escape } from '../core/html.js';
import { FILMS, VIDEO_CATEGORIES } from '../data/home-media.js';

let _filter = 'Todos';

function playIcon(size) {
    return html`<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>`;
}

function featured() {
    return FILMS.find(v => v.featured) || FILMS[0];
}

function sideList() {
    const f = featured();
    const base = _filter === 'Todos' ? FILMS : FILMS.filter(v => v.cat === _filter);
    return base.filter(v => v.id !== f.id).slice(0, 4);
}

function uploadHint() {
    return html`
        <div class="films-upload">
            <div class="films-upload-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>
            </div>
            <div class="films-upload-text"><b>Panel de administración:</b> sube videos a Firebase Storage o pega un enlace de YouTube/Vimeo; aparecen aquí al instante.</div>
        </div>`;
}

function renderCards() {
    return sideList().map(v => html`
        <button class="glass film-card" type="button" data-film="${escape(v.id)}">
            <div class="film-thumb" style="background-image:url('${escape(v.thumb)}')">
                <span class="film-thumb-play">${playIcon(22)}</span>
                <span class="mono film-dur">${escape(v.dur)}</span>
            </div>
            <div class="film-card-body">
                <div class="mono film-card-cat">${escape(v.cat)}</div>
                <div class="film-card-title">${escape(v.title)}${v.badge ? html`<span class="film-badge">${escape(v.badge)}</span>` : ''}</div>
            </div>
        </button>`).join('');
}

export function renderFilms() {
    const f = featured();
    return html`
        <section class="home-films reveal">
            <div class="container">
                <div class="films-header">
                    <div>
                        <span class="eyebrow">Bersaglio Films</span>
                        <h2 class="films-title">Mira el <span class="italic emerald-text">oficio</span> en movimiento</h2>
                    </div>
                    <button class="btn-aqua" type="button" data-film="${escape(f.id)}">
                        Ver el último estreno
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
                    </button>
                </div>

                <div class="films-filters">
                    ${VIDEO_CATEGORIES.map(c => html`<button class="films-pill ${c === _filter ? 'on' : ''}" type="button" data-film-filter="${escape(c)}">${escape(c)}</button>`)}
                </div>

                <div class="films-layout">
                    <button class="glass glass-iridescent film-feature" type="button" data-film="${escape(f.id)}">
                        <div class="film-feature-img" style="background-image:url('${escape(f.thumb)}')"></div>
                        <div class="film-feature-shade" aria-hidden="true"></div>
                        <span class="film-play" aria-hidden="true">${playIcon(26)}</span>
                        <div class="film-feature-body">
                            <div class="film-feature-chips">
                                <span class="film-flag">${escape(f.cat)}</span>
                                <span class="film-flag">${escape(f.dur)}</span>
                            </div>
                            <h3 class="film-feature-title">${escape(f.title)}</h3>
                            ${f.desc ? html`<p class="film-feature-desc">${escape(f.desc)}</p>` : ''}
                        </div>
                    </button>

                    <div class="films-side" data-films-side>
                        ${renderCards()}
                        ${uploadHint()}
                    </div>
                </div>
            </div>

            <div class="film-lightbox" data-film-lightbox aria-hidden="true"></div>
        </section>`;
}

function openLightbox(id) {
    const v = FILMS.find(x => x.id === id);
    const box = document.querySelector('[data-film-lightbox]');
    if (!v || !box) return;
    box.innerHTML = html`
        <div class="film-lightbox-inner" role="dialog" aria-modal="true" aria-label="${escape(v.title)}">
            <div class="film-screen">
                <div class="film-screen-poster" style="background-image:url('${escape(v.thumb)}')"></div>
                <div class="film-screen-shade" aria-hidden="true"></div>
                <span class="film-play" aria-hidden="true">${playIcon(28)}</span>
                <div class="film-screen-note">Demo · aquí se reproduce el video real (Firebase Storage / YouTube / Vimeo)</div>
            </div>
            <div class="film-lightbox-bar">
                <div>
                    <div class="mono film-lightbox-meta">${escape(v.cat.toUpperCase())} · ${escape(v.dur)}</div>
                    <div class="film-lightbox-title">${escape(v.title)}</div>
                </div>
                <button class="film-lightbox-close" type="button" data-film-close aria-label="Cerrar">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18"/></svg>
                </button>
            </div>
        </div>`;
    box.classList.add('is-open');
    box.setAttribute('aria-hidden', 'false');
}

function closeLightbox() {
    const box = document.querySelector('[data-film-lightbox]');
    if (!box) return;
    box.classList.remove('is-open');
    box.setAttribute('aria-hidden', 'true');
    box.innerHTML = '';
}

export function initFilms() {
    const section = document.querySelector('.home-films');
    if (!section) return;

    section.addEventListener('click', (e) => {
        const filterBtn = e.target.closest('[data-film-filter]');
        if (filterBtn) {
            _filter = filterBtn.dataset.filmFilter;
            section.querySelectorAll('[data-film-filter]').forEach(b => b.classList.toggle('on', b.dataset.filmFilter === _filter));
            const side = section.querySelector('[data-films-side]');
            if (side) side.innerHTML = renderCards() + uploadHint();
            return;
        }
        const filmBtn = e.target.closest('[data-film]');
        if (filmBtn) { openLightbox(filmBtn.dataset.film); return; }
        if (e.target.closest('[data-film-close]')) { closeLightbox(); return; }
    });

    const box = section.querySelector('[data-film-lightbox]');
    box?.addEventListener('click', (e) => { if (e.target === box) closeLightbox(); });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && box?.classList.contains('is-open')) closeLightbox();
    });
}

export default { renderFilms, initFilms };
