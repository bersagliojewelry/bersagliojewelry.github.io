/**
 * js/admin/live-preview.js — Vista previa EN VIVO (iframe `srcdoc` aislado) para el CMS.
 *
 * Por qué iframe y no un <div> en el panel (decisión: auditoría §82 + consejo Gemini):
 *  - Fidelidad PIXEL: `admin-contenido.html` NO carga el CSS público; un <div> obligaría a
 *    inyectarlo en el panel (bleed inverso que rompería el propio panel). El iframe trae un
 *    documento limpio donde se cargan EXACTOS los estilos de la web.
 *  - Contención: el HTML lo generan los renderers públicos (ya escapados con escape()/safeUrl());
 *    el iframe solo lo monta como fragmento, SIN ejecutar JS público (createContextualFragment NO
 *    corre los <script>). La defensa XSS REAL vive en los renderers, no en el flag de sandbox.
 *
 * SANDBOX (bug 2026-06-17, RCA verificada con experimento controlado en Chromium): un `srcdoc`
 * con `sandbox="allow-scripts"` SIN `allow-same-origin` queda en ORIGEN OPACO → su viewport
 * colapsa a 0px de ancho. El CSS carga y los colores/fuentes aplican, PERO todo el layout
 * (`.container`, `100vw`, flex/grid, media-queries) se calcula contra 0px → preview totalmente
 * roto ("no se ve nada igual"). Por eso usamos `allow-scripts allow-same-origin`: restaura el
 * viewport real (verificado: hero 0×0 → 810×1068). Es seguro porque el contenido ya viene
 * escapado y el único script que corre es el render-listener de ESTE archivo (no hay código
 * no confiable ejecutándose). Revisa §82 con esto. [OPUS-4.8 — marcar para revisión post-Fable]
 *
 * CLAVE (bug 2026-06-17): el CSS es POR PÁGINA (index.html→home.css, contacto.html→contacto.css).
 * Cada preview DEBE cargar el CSS de SU página (`cssFrom`), no siempre el del Home, o el layout
 * sale roto. Leemos los <link> de la página real (robusto dev+prod: Vite hashea los nombres).
 * El sitio carga el CSS con preload+noscript, así que normalizamos a <link rel="stylesheet">.
 */

const _headCache = new Map();   // cssFrom -> string de <link>s (cache por página)

const FALLBACK_LINKS = [
    '<link rel="stylesheet" href="/css/liquid-glass.css">',
    '<link rel="stylesheet" href="/css/components.css">',
];

/**
 * Lee del <head> de la página pública indicada (`cssFrom`) sus hojas de estilo + fuentes y las
 * normaliza a <link rel="stylesheet"> limpios (dedup). Robusto en dev y prod: NO se pueden
 * hardcodear (Vite hashea), así que se toman de la página real. Cae a base si el fetch falla.
 */
async function publicHeadLinks(cssFrom) {
    if (_headCache.has(cssFrom)) return _headCache.get(cssFrom);
    let out;
    try {
        const res = await fetch(cssFrom, { credentials: 'omit' });
        const docp = new DOMParser().parseFromString(await res.text(), 'text/html');
        const hrefs = new Set();
        let fontLink = '';
        docp.querySelectorAll('link').forEach(l => {
            const rel = (l.getAttribute('rel') || '').toLowerCase();
            const as  = (l.getAttribute('as')  || '').toLowerCase();
            const href = l.getAttribute('href');
            if (!href) return;
            const isFont = href.includes('fonts.googleapis') || href.includes('fonts.gstatic');
            if (isFont) {
                if (rel.includes('stylesheet')) fontLink = `<link rel="stylesheet" href="${href}">`;
                return;
            }
            // Hoja de estilo declarada como stylesheet, o precargada como estilo (preload as=style).
            if (rel.includes('stylesheet') || as === 'style') hrefs.add(href);
        });
        const links = [...hrefs].map(h => `<link rel="stylesheet" href="${h}">`);
        out = links.length
            ? (fontLink ? fontLink + '\n' : '') + links.join('\n')
            : (fontLink ? fontLink + '\n' : '') + FALLBACK_LINKS.join('\n');
    } catch {
        out = FALLBACK_LINKS.join('\n');
    }
    _headCache.set(cssFrom, out);
    return out;
}

/**
 * @param {object} [opts]
 * @param {string} [opts.cssFrom='/'] página pública cuyos estilos debe cargar el preview
 *        (Home → '/', Contacto → '/contacto.html', …).
 */
export function createLivePreview(opts = {}) {
    const cssFrom = opts.cssFrom || '/';
    let iframe = null;
    let ready = false;
    let pending = '';
    let clickCb = null;   // F2: callback de clic-para-editar (section => void)

    function onMsg(e) {
        if (!iframe || e.source !== iframe.contentWindow || !e.data) return;
        if (e.data.t === 'sf-ready') {
            ready = true;
            if (pending) post(pending);
        } else if (e.data.t === 'sf-click' && clickCb) {
            clickCb(e.data.section);
        }
    }
    function post(htmlStr) {
        try { iframe.contentWindow.postMessage({ t: 'sf-render', h: htmlStr }, '*'); } catch { /* iframe en transición */ }
    }

    async function mountInto(hostEl) {
        const head = await publicHeadLinks(cssFrom);
        iframe = document.createElement('iframe');
        iframe.className = 'sf-preview-frame';
        // allow-same-origin es OBLIGATORIO: sin él, el srcdoc queda en origen opaco y su viewport
        // colapsa a 0px → layout roto (ver cabecera). El contenido ya viene escapado por los renderers.
        iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');
        iframe.setAttribute('title', 'Vista previa de la web pública');
        iframe.srcdoc = `<!doctype html><html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${head}
<style>html,body{margin:0;padding:0;overflow-x:hidden}
*{cursor:default !important}a{pointer-events:none}
/* El preview es ESTÁTICO: no corre js/core/reveal.js, así que los .reveal nunca
   recibirían .in y saldrían en opacity:0 (invisibles). Forzamos el estado FINAL
   revelado — idéntico a lo que el CSS público hace bajo prefers-reduced-motion. */
.reveal,.reveal-soft{opacity:1 !important;transform:none !important;transition:none !important}
/* F2 clic-para-editar: las secciones marcadas (data-sf-section) son clicables y se
   resaltan cuando el campo correspondiente recibe foco en el formulario. */
[data-sf-section],[data-sf-section] *{cursor:pointer !important}
[data-sf-section].sf-hl{outline:2px solid var(--bj-emerald-500,#3a9b6e);outline-offset:-2px}</style>
</head><body><div id="sf-root"></div>
<script>
var root=document.getElementById('sf-root');
function clearHl(){var p=root.querySelector('.sf-hl');if(p)p.classList.remove('sf-hl');}
addEventListener('message',function(e){
  if(!e.data)return;
  if(e.data.t==='sf-render'){
    var y=window.scrollY;
    root.replaceChildren(document.createRange().createContextualFragment(e.data.h));
    window.scrollTo(0,y);
  } else if(e.data.t==='sf-highlight'){
    clearHl();
    var s=e.data.section;
    if(s){
      // Comparación directa (sin interpolar s en el selector) → cero inyección, cero regex.
      var all=root.querySelectorAll('[data-sf-section]');
      for(var i=0;i<all.length;i++){
        if(all[i].getAttribute('data-sf-section')===s){ all[i].classList.add('sf-hl'); all[i].scrollIntoView({block:'nearest'}); break; }
      }
    }
  }
});
addEventListener('click',function(e){
  var sec=e.target&&e.target.closest?e.target.closest('[data-sf-section]'):null;
  if(sec)parent.postMessage({t:'sf-click',section:sec.getAttribute('data-sf-section')},'*');
});
parent.postMessage({t:'sf-ready'},'*');
<\/script></body></html>`;
        window.addEventListener('message', onMsg);
        hostEl.appendChild(iframe);
    }

    function update(htmlStr) {
        pending = htmlStr;
        if (ready) post(htmlStr);
    }

    /** F2: resalta la sección `key` en el preview (o la limpia con '' / null). */
    function highlight(section) {
        try { iframe.contentWindow.postMessage({ t: 'sf-highlight', section: section || '' }, '*'); }
        catch { /* iframe en transición */ }
    }

    /** F2: registra el callback que recibe la `key` de sección al hacer clic en el preview. */
    function onSectionClick(cb) { clickCb = cb; }

    function destroy() {
        window.removeEventListener('message', onMsg);
        if (iframe) iframe.remove();
        iframe = null; ready = false; pending = ''; clickCb = null;
    }

    return { mount: mountInto, update, destroy, highlight, onSectionClick };
}

export default createLivePreview;
