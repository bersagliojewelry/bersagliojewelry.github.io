/**
 * js/data/journal-render.js — El MARKUP del artículo del Journal, en un módulo PURO.
 *
 * Por qué existe (medido el 2026-10-10 en el HTML SERVIDO y en Search Console):
 *   `/journal/<slug>.html` llegaba a Google con **2 palabras** dentro del `<main>` —el esqueleto
 *   de carga— y el cuerpo real solo vivía dentro de `<noscript>`, que el renderizador de Google
 *   descarta porque él sí ejecuta JavaScript. La captura de «Probar URL publicada» mostraba
 *   «Cargando la entrada…»: el JS de Google corría, y lo que no llegaba a tiempo era el listener
 *   de Firestore. Es decir, el problema nunca fue que Google no ejecute JS — era que el primer
 *   pintado DEPENDÍA DE LA RED. Lo que se arregla aquí es eso: el HTML se hornea en el build y el
 *   navegador solo lo mejora.
 *
 * Y por qué en un módulo compartido y no copiado en el generador: el `<noscript>` ya era una
 * segunda copia del motor de render, escrita a mano, y se le había olvidado todo lo que el cliente
 * sabía hacer (migas, hero, firma, relacionadas). Dos motores divergen siempre; el segundo nace
 * desactualizado. Este fichero es el ÚNICO sitio donde se decide cómo se ve un artículo, y lo
 * importan los dos: `js/pages/entrada.js` en el navegador y `scripts/generate-pieces.mjs` en Node
 * (que ya importa cinco módulos de `js/`, así que el patrón es doctrina de la casa).
 *
 * Reglas que cumple para poder vivir en los dos mundos:
 *   - SOLO importa `html`/`escape` de `../core/html.js`, que no toca el DOM al importarse.
 *   - Cero `window`, cero `document`, cero `Date.now()` → la misma entrada da el mismo HTML, que
 *     es lo que permite que el navegador repinte encima sin que se vea un salto.
 *   - Todo texto del panel pasa por `escape()`. El marcado de subtítulos se decide ANTES de
 *     escapar y se aplica DESPUÉS, así que ni un `<script>` tecleado en el panel sale crudo.
 */

import { html, escape } from '../core/html.js';

/** URL pública CANÓNICA de una entrada: la página HORNEADA e indexable. */
export function entryHref(slug) {
    return `/journal/${encodeURIComponent(String(slug || ''))}.html`;
}

/**
 * El `<title>` de un artículo. UNA sola fórmula para las dos rutas.
 *
 * El generador hornea «<título> · Journal · Bersaglio Jewelry Cartagena» —tipo de contenido +
 * marca + ciudad, que es como la gente busca— y `entrada.js` lo pisaba con «<título> · The
 * Bersaglio Journal», que le quitaba «Cartagena» justo en la consulta que más impresiones trae
 * («anillos de compromiso cartagena»). Con la fórmula aquí, las dos rutas dicen lo mismo y nadie
 * las puede desincronizar.
 */
export function entryTitleTag(titulo) {
    return `${String(titulo || '').trim()} · Journal · Bersaglio Jewelry Cartagena`;
}

/**
 * Cuerpo del artículo → bloques tipados.
 *
 * El cuerpo es texto plano escrito en un `<textarea>` del panel: los párrafos se separan con una
 * línea en blanco. Esto añade UNA convención, la mínima que hacía falta: **una línea que empieza
 * por `## ` es un subtítulo**. Hasta hoy el motor no sabía hacer `<h2>` —partía por líneas en
 * blanco y envolvía cada trozo en `<p>`—, así que los seis artículos del Journal tenían cero
 * subtítulos y Google no tenía por dónde entender su estructura.
 *
 * Se eligió `## ` y no, por ejemplo, una línea corta sin punto final (que se podría «adivinar»)
 * porque adivinar convierte un párrafo corto en un titular sin que nadie lo haya pedido. Una
 * marca explícita no tiene falsos positivos, y el `hint` del campo en el panel la enseña.
 * Comprobado el 2026-10-10 contra los seis cuerpos publicados: ninguno contiene `## `, así que
 * esta convención no cambia ni una coma de lo que ya está escrito.
 */
export function bodyBlocks(body) {
    const bloques = [];
    for (const tramo of String(body || '').split(/\n\s*\n/)) {
        const limpio = tramo.trim();
        if (!limpio) continue;
        // Un tramo puede traer el subtítulo y su párrafo pegados con un solo salto de línea.
        let acumulado = [];
        for (const linea of limpio.split('\n')) {
            const h2 = linea.match(/^##\s+(.+)$/);
            if (h2) {
                if (acumulado.length) { bloques.push({ type: 'p', text: acumulado.join('\n') }); acumulado = []; }
                bloques.push({ type: 'h2', text: h2[1].trim() });
            } else {
                acumulado.push(linea);
            }
        }
        const resto = acumulado.join('\n').trim();
        if (resto) bloques.push({ type: 'p', text: resto });
    }
    return bloques;
}

export function renderBreadcrumb(entry) {
    return html`
        <nav class="en-breadcrumb" aria-label="Migas de pan">
            <a class="en-crumb" href="/">Inicio</a>
            <span class="en-crumb-sep" aria-hidden="true">→</span>
            <a class="en-crumb" href="/journal.html">Journal</a>
            <span class="en-crumb-sep" aria-hidden="true">→</span>
            <span class="en-crumb en-crumb-current">${escape(entry.section)}</span>
        </nav>`;
}

export function authorInitials(author) {
    const clean = String(author || '').replace(/^Por\s+/i, '').trim();
    const parts = clean.split(/\s+/);
    return ((parts[0]?.[0] || '') + (parts[parts.length - 1]?.[0] || '')).toUpperCase();
}

export function renderHero(entry) {
    return html`
        <header class="en-hero">
            <div class="en-hero-flags">
                <span class="mono en-flag-section">${escape(String(entry.section || '').toUpperCase())}</span>
                <span class="en-flag-divider"></span>
                <span class="mono en-flag-kicker">${escape(entry.kicker)}</span>
            </div>
            <h1 class="en-title">${escape(entry.title)}</h1>
            <div class="en-hero-meta">
                <div class="en-hero-author-row">
                    <div class="en-hero-avatar">${escape(authorInitials(entry.author))}</div>
                    <div>
                        <div class="en-hero-author">${escape(entry.author)}</div>
                        <div class="mono en-hero-role">${escape(entry.authorRole)}</div>
                    </div>
                </div>
                <div class="en-hero-meta-right">
                    <span class="mono en-hero-date">${escape(entry.dateLong)}</span>
                    <span class="en-hero-meta-divider"></span>
                    <span class="mono en-hero-read">${escape(entry.read)} de lectura</span>
                </div>
            </div>
        </header>`;
}

export function renderFeaturedImage(entry) {
    return html`
        <figure class="glass glass-iridescent en-featured">
            <img src="${escape(entry.image)}"
                 alt="${escape(entry.title)}"
                 class="en-featured-img"
                 loading="eager"
                 fetchpriority="high"
                 decoding="async">
        </figure>`;
}

export function renderBody(entry) {
    const bloques = bodyBlocks(entry.body);
    // La capital ornamental va en el PRIMER párrafo, no en el primer bloque: un artículo que
    // abriera con subtítulo le pondría la letra grande al titular.
    let faltaCapital = true;
    return html`
        <article class="en-body">
            ${bloques.map((b) => {
                if (b.type === 'h2') return html`<h2 class="en-body-h2">${escape(b.text)}</h2>`;
                if (faltaCapital) {
                    faltaCapital = false;
                    const first = b.text.charAt(0);
                    const rest  = b.text.slice(1);
                    return html`
                        <p class="en-body-p en-body-p--lede">
                            <span class="en-dropcap">${escape(first)}</span>${escape(rest)}
                        </p>`;
                }
                return html`<p class="en-body-p">${escape(b.text)}</p>`;
            })}
        </article>`;
}

export function renderShare(entry) {
    const url = encodeURIComponent(`https://bersagliojewelry.co${entryHref(entry.slug)}`);
    const title = encodeURIComponent(entry.title);
    return html`
        <aside class="en-share" aria-label="Compartir entrada">
            <div class="mono en-share-label">COMPARTIR</div>
            <div class="en-share-btns">
                <a class="en-share-btn"
                   href="https://wa.me/?text=${title}%20${url}"
                   target="_blank"
                   rel="noopener"
                   aria-label="Compartir por WhatsApp">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M20.5 3.5A11 11 0 0 0 3.4 17l-1.4 5.1 5.2-1.4A11 11 0 1 0 20.5 3.5zM12 20c-1.5 0-3-.4-4.3-1.2l-.3-.2-3.1.8.8-3.1-.2-.3C4.4 14.9 4 13.5 4 12c0-4.4 3.6-8 8-8s8 3.6 8 8-3.6 8-8 8z"/>
                    </svg>
                </a>
                <a class="en-share-btn"
                   href="mailto:?subject=${title}&body=${url}"
                   aria-label="Enviar por correo">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                    </svg>
                </a>
                <button class="en-share-btn" type="button" data-action="copy" aria-label="Copiar enlace">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                        <rect x="9" y="9" width="13" height="13" rx="2"/>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                    </svg>
                </button>
                <span class="en-share-feedback" data-feedback aria-live="polite"></span>
            </div>
        </aside>`;
}

/**
 * Hasta N entradas de la misma sección, excluyendo la actual. Núcleo PURO de `getRelated`:
 * recibe la lista ya resuelta en vez de ir a buscarla, para que el generador pueda calcular las
 * mismas relacionadas que el navegador y lo horneado no se contradiga con lo hidratado.
 */
export function relatedFrom(all, slug, n = 3) {
    const lista = Array.isArray(all) ? all : [];
    const entry = lista.find(e => e.slug === slug);
    if (!entry) return [];
    let related = lista.filter(e => e.section === entry.section && e.slug !== slug);
    if (related.length < n) {
        const fillers = lista.filter(e => e.slug !== slug && !related.includes(e));
        related = [...related, ...fillers];
    }
    return related.slice(0, n);
}

export function renderRelated(entry, related) {
    if (!related || related.length === 0) return '';
    return html`
        <section class="en-related">
            <div class="en-related-header">
                <div class="mono en-related-eyebrow">SEGUIR LEYENDO</div>
                <h2 class="en-related-title">Más de <span class="italic emerald-text">${escape(entry.section)}</span></h2>
            </div>
            <div class="en-related-grid">
                ${related.map(r => html`
                    <article class="glass en-related-card">
                        <a class="en-related-link" href="${entryHref(r.slug)}">
                            <div class="en-related-imgwrap">
                                <img src="${escape(r.image)}" alt="${escape(r.title)}" class="en-related-img" loading="lazy" decoding="async">
                            </div>
                            <div class="en-related-body">
                                <div class="mono en-related-meta">
                                    <span>${escape(r.section)}</span>
                                    <span class="en-related-meta-dot">·</span>
                                    <span>${escape(r.read)}</span>
                                </div>
                                <h3 class="en-related-headline">${escape(r.title)}</h3>
                            </div>
                        </a>
                    </article>`)}
            </div>
        </section>`;
}

export function renderBackToJournal() {
    return html`
        <div class="en-back">
            <a href="/journal.html" class="btn-aqua en-back-btn">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
                Volver al Journal
            </a>
        </div>`;
}

/**
 * El artículo COMPLETO. Lo llaman los dos: `entrada.js` al hidratar y el generador al hornear.
 * `related` se pasa ya resuelto (ver `relatedFrom`) para que la función siga siendo pura.
 */
export function renderArticle(entry, related) {
    return html`
        <div class="container en-page">
            ${renderBreadcrumb(entry)}
            ${renderHero(entry)}
            ${renderFeaturedImage(entry)}
            <div class="en-layout">
                ${renderBody(entry)}
                ${renderShare(entry)}
            </div>
            ${renderRelated(entry, related)}
            ${renderBackToJournal()}
        </div>`;
}
