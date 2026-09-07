/**
 * Home · Bersaglio Films (galería de video). Contenido GESTIONABLE desde el panel
 * (colección Firestore `films/`: title · cat · thumb[miniatura] · href[enlace YouTube/IG] ·
 * dur · desc · badge · featured · published). Decisión Daniel: enlace + miniatura (no se
 * sube el mp4); cada video es un enlace que abre en pestaña nueva.
 *
 * REGLA cero-ficción (`feedback_no_demo_en_index`, spec 2026-06-20): sin videos
 * publicados suficientes (< MIN_FILMS) la sección NO se monta (hide-when-empty); JAMÁS
 * datos de ejemplo. Lee `data.getFilms()` EN TIEMPO DE RENDER (refresca en vivo).
 */
import { html, escape, mount } from '../core/html.js';
import { data } from '../core/data.js';
import { safeUrl } from '../core/safe-url.js';
import { MIN_FILMS, isFilmComplete } from '../core/home-sections.js';   // umbral + completitud (SSoT cero-ficción)

let _filter = 'Todos';

// Videos visibles = PUBLICADOS (data.getFilms) Y completos (title+thumb+href). El render
// re-aplica la completitud para NO depender solo de la regla server-side: un doc legacy
// publicado-incompleto jamás se pinta (defensa en profundidad, cero-ficción Fase B).
const completeFilms = () => data.getFilms().filter(v => isFilmComplete(v).complete);

function playIcon(size) {
    return html`<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>`;
}

function cats(films) {
    return ['Todos', ...Array.from(new Set(films.map(v => v.cat).filter(Boolean)))];
}
function featuredOf(films) { return films.find(v => v.featured) || films[0]; }

function renderCards(films) {
    const f = featuredOf(films);
    const base = _filter === 'Todos' ? films : films.filter(v => v.cat === _filter);
    return base.filter(v => v.id !== f.id).slice(0, 4).map(v => html`
        <a class="glass film-card" href="${escape(safeUrl(v.href))}" target="_blank" rel="noopener noreferrer">
            <div class="film-thumb" style="background-image:url('${escape(v.thumb)}')">
                <span class="film-thumb-play">${playIcon(22)}</span>
                ${v.dur ? html`<span class="mono film-dur">${escape(v.dur)}</span>` : ''}
            </div>
            <div class="film-card-body">
                <div class="mono film-card-cat">${escape(v.cat || '')}</div>
                <div class="film-card-title">${escape(v.title)}${v.badge ? html`<span class="film-badge">${escape(v.badge)}</span>` : ''}</div>
            </div>
        </a>`).join('');
}

// Contenido interno (re-renderizable en vivo). Lee data.getFilms() AQUÍ, no en import.
function filmsInner() {
    const films = completeFilms();
    if (films.length < MIN_FILMS) return '';      // hide-when-empty (cero-ficción §4)
    const f = featuredOf(films);
    return html`
        <div class="container">
            <div class="films-header">
                <div>
                    <span class="eyebrow">Bersaglio Films</span>
                    <h2 class="films-title">Mira el <span class="italic emerald-text">oficio</span> en movimiento</h2>
                </div>
                <a class="btn-aqua" href="${escape(safeUrl(f.href))}" target="_blank" rel="noopener noreferrer">
                    Ver el último estreno
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
                </a>
            </div>

            <div class="films-filters">
                ${cats(films).map(c => html`<button class="films-pill ${c === _filter ? 'on' : ''}" type="button" data-film-filter="${escape(c)}">${escape(c)}</button>`)}
            </div>

            <div class="films-layout">
                <a class="glass glass-iridescent film-feature" href="${escape(safeUrl(f.href))}" target="_blank" rel="noopener noreferrer">
                    <div class="film-feature-img" style="background-image:url('${escape(f.thumb)}')"></div>
                    <div class="film-feature-shade" aria-hidden="true"></div>
                    <span class="film-play" aria-hidden="true">${playIcon(26)}</span>
                    <div class="film-feature-body">
                        <div class="film-feature-chips">
                            <span class="film-flag">${escape(f.cat || '')}</span>
                            ${f.dur ? html`<span class="film-flag">${escape(f.dur)}</span>` : ''}
                        </div>
                        <h3 class="film-feature-title">${escape(f.title)}</h3>
                        ${f.desc ? html`<p class="film-feature-desc">${escape(f.desc)}</p>` : ''}
                    </div>
                </a>

                <div class="films-side" data-films-side>
                    ${renderCards(films)}
                </div>
            </div>
        </div>`;
}

export function renderFilms() {
    return html`<section class="home-films">${filmsInner()}</section>`;
}

// Re-render en vivo (data.onChange) — espejo de refreshJournalPreview.
export function refreshFilms() {
    const sec = document.querySelector('.home-films');
    if (sec) mount(sec, filmsInner());
}

export function initFilms() {
    const section = document.querySelector('.home-films');
    if (!section) return;
    section.addEventListener('click', (e) => {
        const filterBtn = e.target.closest('[data-film-filter]');
        if (!filterBtn) return;     // los videos son enlaces <a> (abren en pestaña nueva)
        _filter = filterBtn.dataset.filmFilter;
        section.querySelectorAll('[data-film-filter]').forEach(b => b.classList.toggle('on', b.dataset.filmFilter === _filter));
        const side = section.querySelector('[data-films-side]');
        if (side) mount(side, renderCards(completeFilms()));
    });
}

export default { renderFilms, refreshFilms, initFilms };
