/**
 * Buscador por CÓDIGO (TODO-58) — Kary le da a un cliente el código de una pieza (ej. "0953") y este
 * SALTA DIRECTO a ella en la web → impulsa la venta presencial/WhatsApp y deja listo el cobro Wompi.
 *
 * Como el código es ÚNICO, no es un "filtro" (no reduce la grilla) sino un salto directo a la pieza:
 *   resuelve en MEMORIA (data.getByCode) → URL canónica `pieceUrl` (1 salto, preview perfecto al compartir).
 *   No-match con catálogo listo → mensaje amable + WhatsApp (recupera el lead). Datos aún sin cargar →
 *   (opción `stubFallback`, para el inicio) cae al stub /p/<code> que el SSG hornea.
 *
 * Componente COMPARTIDO catálogo + inicio. La lógica de resolución es PURA (lookup inyectado) → testable.
 */
import { html, escape } from './html.js';
import { data } from './data.js';
import { resolverCodigo } from './codigo-util.js';   // lógica pura (testable)

const WA = 'https://wa.me/573013752592';

/** HTML del buscador. `variant`: 'catalogo' | 'home' (estilos/copy por contexto). */
export function renderBuscadorCodigo(variant = 'catalogo') {
    const home = variant === 'home';
    const lead = home ? '¿Te pasaron un código? Encuentra tu pieza al instante.'
                      : 'Busca tu pieza por código o nombre.';
    const ph   = home ? 'Ej. 0953' : 'Ej. 0953 o "Puro Albor"';
    const btn  = home ? 'Ir a la pieza' : 'Buscar';
    return html`
        <form class="bc glass bc-${escape(variant)}" data-buscador-codigo role="search"
              aria-label="Buscar una pieza por código o nombre">
            <span class="bc-lead">${escape(lead)}</span>
            <div class="bc-row">
                <svg class="bc-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
                    <circle cx="11" cy="11" r="7"/><line x1="20" y1="20" x2="16.5" y2="16.5"/>
                </svg>
                <input class="bc-input" type="search" autocomplete="off"
                       name="q" placeholder="${escape(ph)}" aria-label="Código o nombre de la pieza" maxlength="40" />
                <button class="bc-btn" type="submit">${escape(btn)}</button>
            </div>
            <p class="bc-msg" data-bc-msg hidden aria-live="polite"></p>
        </form>`;
}

// Mensajes con nodos DOM (NO innerHTML) → sin riesgo XSS aunque el código venga del usuario.
function setMsgText(msg, text) {
    if (!msg) return;
    msg.textContent = text;
    msg.hidden = false;
}
function setMsgNotFound(msg, code) {
    if (!msg) return;
    msg.textContent = 'No encontramos el código ';
    const strong = document.createElement('strong');
    strong.textContent = code;                       // textContent → el código nunca se interpreta como HTML
    const a = document.createElement('a');
    a.href = `${WA}?text=${encodeURIComponent('Hola, busco la pieza con código ' + code)}`;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = 'escríbenos por WhatsApp';
    msg.append(strong, '. Confírmalo con tu asesora · ', a, '.');
    msg.hidden = false;
}

/**
 * Cablea el buscador por DELEGACIÓN sobre `root` (sobrevive a re-renders del catálogo/home).
 * @param {Element} root  contenedor (ej. #main-content)
 * @param {{stubFallback?:boolean}} opts  stubFallback=true (inicio): si los datos no cargaron, navega al stub /p/<code>.
 */
export function wireBuscadorCodigo(root, opts = {}) {
    if (!root || root._bcWired) return;
    root._bcWired = true;
    root.addEventListener('submit', (e) => {
        const form = e.target.closest('[data-buscador-codigo]');
        if (!form) return;
        e.preventDefault();
        const input = form.querySelector('.bc-input');
        const msg = form.querySelector('[data-bc-msg]');
        if (msg) { msg.hidden = true; msg.textContent = ''; }

        const r = resolverCodigo(input?.value, (c) => data.getByCode(c));
        if (r.status === 'empty') { input?.focus(); return; }
        if (r.status === 'found') { location.assign(r.url); return; }

        // notfound: distinguir "datos aún sin cargar" de "código real inexistente (typo)".
        const ready = typeof data.isReady === 'function' ? data.isReady('featured') : true;
        if (!ready) {
            if (opts.stubFallback) { location.assign('/p/' + encodeURIComponent(r.code)); return; }
            setMsgText(msg, 'Cargando el catálogo… intenta de nuevo en un segundo.');
            return;
        }
        setMsgNotFound(msg, r.code);
    });
}
