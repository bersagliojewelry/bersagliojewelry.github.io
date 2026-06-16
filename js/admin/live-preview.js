/**
 * js/admin/live-preview.js — Vista previa EN VIVO (iframe `srcdoc` aislado) para el CMS.
 *
 * Por qué iframe y no un <div> en el panel (decisión: auditoría §82 + consejo Gemini):
 *  - Fidelidad PIXEL: `admin-contenido.html` NO carga el CSS público; un <div> obligaría a
 *    inyectarlo en el panel (bleed inverso que rompería el propio panel). El iframe trae un
 *    documento limpio donde se cargan EXACTOS los estilos de la web.
 *  - Contención: el HTML lo generan los renderers públicos (ya escapados con escape()/safeUrl());
 *    el iframe solo lo monta como fragmento, SIN ejecutar JS público. `sandbox="allow-scripts"`
 *    (sin `allow-same-origin`) = máxima contención; CSS/fuentes/imágenes cargan igual.
 *
 * Puente único padre↔iframe = postMessage (no reload por tecla → sin FOUC; preserva el scroll).
 */

let _headCache = null;

const FALLBACK_LINKS = [
    '<link rel="stylesheet" href="/css/liquid-glass.css">',
    '<link rel="stylesheet" href="/css/components.css">',
    '<link rel="stylesheet" href="/css/home.css">',
];

/**
 * Toma del <head> del sitio público (`/`) sus <link> de estilos + fuentes. Robusto en dev y
 * prod: Vite hashea los CSS, así que NO se pueden hardcodear; leerlos de la página real da el
 * href correcto en cada entorno. Cae a rutas fijas si el fetch/parse falla.
 */
async function publicHeadLinks() {
    if (_headCache) return _headCache;
    try {
        const res = await fetch('/', { credentials: 'omit' });
        const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
        const links = [...doc.querySelectorAll(
            'link[rel="stylesheet"], link[rel="preconnect"], link[rel="preload"][as="font"], link[as="style"]'
        )].map(l => l.outerHTML);
        _headCache = links.length ? links.join('\n') : FALLBACK_LINKS.join('\n');
    } catch {
        _headCache = FALLBACK_LINKS.join('\n');
    }
    return _headCache;
}

export function createLivePreview() {
    let iframe = null;
    let ready = false;
    let pending = '';

    function onMsg(e) {
        if (iframe && e.source === iframe.contentWindow && e.data && e.data.t === 'sf-ready') {
            ready = true;
            if (pending) post(pending);
        }
    }
    function post(htmlStr) {
        try { iframe.contentWindow.postMessage({ t: 'sf-render', h: htmlStr }, '*'); } catch { /* iframe en transición */ }
    }

    async function mountInto(hostEl) {
        const head = await publicHeadLinks();
        iframe = document.createElement('iframe');
        iframe.className = 'sf-preview-frame';
        iframe.setAttribute('sandbox', 'allow-scripts');
        iframe.setAttribute('title', 'Vista previa de la web pública');
        // El iframe monta el HTML (ya escapado por los renderers) como FRAGMENTO — sin innerHTML,
        // sin ejecutar scripts — y preserva el scroll entre actualizaciones.
        iframe.srcdoc = `<!doctype html><html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${head}
<style>html,body{margin:0;padding:0;overflow-x:hidden}body{background:var(--bj-ink-emerald,#0d1f17)}
*{cursor:default !important}a{pointer-events:none}</style>
</head><body><div id="sf-root"></div>
<script>
var root=document.getElementById('sf-root');
addEventListener('message',function(e){
  if(!e.data||e.data.t!=='sf-render')return;
  var y=window.scrollY;
  var frag=document.createRange().createContextualFragment(e.data.h);
  root.replaceChildren(frag);
  window.scrollTo(0,y);
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

    function destroy() {
        window.removeEventListener('message', onMsg);
        if (iframe) iframe.remove();
        iframe = null; ready = false; pending = '';
    }

    return { mount: mountInto, update, destroy };
}

export default createLivePreview;
