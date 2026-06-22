/**
 * Bersaglio Jewelry — QuickDock "Atajos".
 *
 * Isla de agua fija abajo-centro: arrastrable (clic sostenido) y al hacer clic
 * abre una franja glass de herramientas (Buscar · WhatsApp · Cita · Favoritos · Arriba).
 * Cierra al hacer clic afuera o con Escape. Port vanilla de Overlays.jsx (QuickDock).
 *
 * Componente GLOBAL: boot.js lo monta en todas las páginas públicas.
 */
import { html, escape } from '../core/html.js';
import { data } from '../core/data.js';
import { mergeGlobal, waHref } from '../core/global-defaults.js';

let _root = null;
let _open = false;
let _pos = null;
let _drag = null;

const STROKE = 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';

/** Enlace de WhatsApp del dock desde la FUENTE ÚNICA (siteContent/global.contacto); fallback = default real. */
function waUrl() {
    return waHref(mergeGlobal(data.getSiteContent('global')).contacto.whatsapp);
}

const TOOLS = [
    { label: 'Buscar', action: 'search', icon: html`<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>` },
    { label: 'WhatsApp', cls: 'qd-tool--wa', wa: true, fill: true, icon: html`<path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.515 5.26l-.999 3.648 3.973-1.607zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/>` },
    { label: 'Cita', cls: 'qd-tool--gold', href: '/contacto.html', icon: html`<path d="M8 2v4M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>` },
    { label: 'Favoritos', href: '/lista-deseos.html', icon: html`<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>` },
    { label: 'Arriba', action: 'top', icon: html`<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>` },
];

function toolIcon(t) {
    return html`<span class="qd-tool-ic"><svg width="19" height="19" viewBox="0 0 24 24" ${t.fill ? 'fill="currentColor"' : STROKE} aria-hidden="true">${t.icon}</svg></span>`;
}

function islandSVG() {
    return html`
        <svg viewBox="0 0 82 30" preserveAspectRatio="none">
            <defs>
                <clipPath id="qd-wclip"><rect x="0" y="0" width="82" height="30" rx="15"/></clipPath>
                <linearGradient id="qd-air" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stop-color="rgba(248,224,138,0.92)"/>
                    <stop offset="0.55" stop-color="rgba(248,224,138,0)"/>
                </linearGradient>
                <linearGradient id="qd-wgrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stop-color="rgba(126,222,168,0.96)"/>
                    <stop offset="1" stop-color="rgba(30,138,91,1)"/>
                </linearGradient>
                <linearGradient id="qd-gold" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stop-color="rgba(244,214,122,0)"/>
                    <stop offset="0.5" stop-color="rgba(248,222,142,0.95)"/>
                    <stop offset="1" stop-color="rgba(244,214,122,0)"/>
                </linearGradient>
            </defs>
            <g clip-path="url(#qd-wclip)">
                <rect x="0" y="0" width="82" height="30" fill="url(#qd-air)"/>
                <path class="qd-wave qd-wave-back" fill="rgba(28,116,82,0.85)" d="M0 14 C 16 10, 25 10, 41 14 S 66 18, 82 14 S 107 10, 123 14 S 148 18, 164 14 V30 H0 Z"/>
                <path class="qd-wave qd-wave-front" fill="url(#qd-wgrad)" d="M0 15 C 16 19, 25 19, 41 15 S 66 11, 82 15 S 107 19, 123 15 S 148 11, 164 15 V30 H0 Z"/>
                <path class="qd-wave qd-wave-gold" fill="none" stroke="url(#qd-gold)" stroke-width="2.2" d="M0 14 C 16 10, 25 10, 41 14 S 66 18, 82 14 S 107 10, 123 14 S 148 18, 164 14"/>
                <path class="qd-wave qd-wave-gold2" fill="none" stroke="url(#qd-gold)" stroke-width="1.4" d="M0 17 C 16 14, 25 14, 41 17 S 66 20, 82 17 S 107 14, 123 17 S 148 20, 164 17"/>
            </g>
        </svg>`;
}

function render() {
    return html`
        <div class="qd">
            <div class="qd-backdrop" data-qd-close-bg></div>
            <div class="qd-anchor" data-qd-anchor>
                <div class="qd-strip">
                    <div class="qd-tools">
                        ${TOOLS.map(t => {
                            const href = t.wa ? waUrl() : t.href;   // WhatsApp = fuente única
                            return href
                                ? html`<a class="qd-tool ${t.cls || ''}" href="${href}" ${href.startsWith('http') ? 'target="_blank" rel="noopener noreferrer"' : ''} data-qd-close>${toolIcon(t)}<span class="qd-tool-label">${escape(t.label)}</span></a>`
                                : html`<button class="qd-tool ${t.cls || ''}" type="button" data-qd-action="${escape(t.action)}">${toolIcon(t)}<span class="qd-tool-label">${escape(t.label)}</span></button>`;
                        })}
                    </div>
                </div>
                <button class="qd-island" type="button" data-qd-island aria-label="Atajos — arrastra para mover, clic para abrir" aria-expanded="false">
                    <span class="qd-island-liquid" aria-hidden="true">${islandSVG()}</span>
                    <span class="qd-island-sheen" aria-hidden="true"></span>
                    <span class="qd-island-label" aria-hidden="true"><img src="/img/emerald-gem.webp" alt="" width="34" height="26"></span>
                </button>
                <span class="qd-caption" aria-hidden="true">atajos</span>
            </div>
            <svg class="qd-goo" width="0" height="0" aria-hidden="true">
                <defs>
                    <filter id="qd-goo">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="b"/>
                        <feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 12 -5"/>
                    </filter>
                </defs>
            </svg>
        </div>`;
}

function setOpen(v) {
    _open = v;
    _root.classList.toggle('open', v);
    _root.querySelector('[data-qd-island]')?.setAttribute('aria-expanded', v ? 'true' : 'false');
}
const close = () => setOpen(false);

function onMove(e) {
    if (!_drag) return;
    // Táctil: umbral más tolerante (12px). El dedo tiembla en un toque; con 4px un toque se
    // contaba como "arrastre" y NO abría el dock (touch fallaba "a veces", Daniel 2026-06-22).
    const moveTh = _drag.touch ? 12 : 4;
    if (Math.abs(e.clientX - _drag.sx) + Math.abs(e.clientY - _drag.sy) > moveTh) _drag.moved = true;
    if (_drag.moved) {
        const x = Math.max(8, Math.min(window.innerWidth - _drag.w - 8, e.clientX - _drag.offX));
        const y = Math.max(8, Math.min(window.innerHeight - _drag.h - 8, e.clientY - _drag.offY));
        _pos = { x, y };
        const anchor = _root.querySelector('[data-qd-anchor]');
        anchor.classList.add('dragged');
        anchor.style.cssText = `position:fixed; left:${x}px; top:${y}px; bottom:auto; transform:none;`;
    }
}

function onUp() {
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    if (_drag && !_drag.moved) setOpen(!_open);
    _drag = null;
}

function onDown(e) {
    const anchor = _root.querySelector('[data-qd-anchor]');
    const r = anchor.getBoundingClientRect();
    _drag = { sx: e.clientX, sy: e.clientY, offX: e.clientX - r.left, offY: e.clientY - r.top, w: r.width, h: r.height, moved: false, touch: e.pointerType === 'touch' };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    e.preventDefault();
}

function poke(e) {
    if (_open || _drag) return;
    const isl = e.currentTarget;
    const dx = Math.max(-1, Math.min(1, (e.clientX - (isl.getBoundingClientRect().left + isl.offsetWidth / 2)) / (isl.offsetWidth / 2)));
    isl.style.setProperty('--gx', (50 + dx * 30) + '%');
}
function unpoke(e) { e.currentTarget.style.removeProperty('--gx'); }

export function mountQuickDock() {
    if (document.querySelector('.qd')) return; // idempotente
    const wrap = document.createElement('div');
    wrap.innerHTML = render();
    _root = wrap.firstElementChild;
    document.body.appendChild(_root);

    // CMS global: el WhatsApp del dock deriva de la fuente única. Parchea el href en sitio
    // cuando llega el override (sin re-render → preserva posición/estado del dock).
    data.onChange(() => {
        const a = _root?.querySelector('.qd-tool--wa');
        if (a) a.href = waUrl();
    });

    const island = _root.querySelector('[data-qd-island]');
    island.addEventListener('pointerdown', onDown);
    island.addEventListener('pointermove', poke);
    island.addEventListener('pointerleave', unpoke);

    _root.querySelector('[data-qd-close-bg]').addEventListener('click', close);
    _root.addEventListener('click', (e) => {
        const act = e.target.closest('[data-qd-action]');
        if (act) {
            if (act.dataset.qdAction === 'search') document.dispatchEvent(new CustomEvent('bj:search:open'));
            else if (act.dataset.qdAction === 'top') window.scrollTo({ top: 0, behavior: 'smooth' });
            close();
            return;
        }
        // Tool links (Cita/Favoritos/WhatsApp): cierra el dock; la navegación interna
        // la maneja el router (o el navegador para enlaces externos).
        if (e.target.closest('[data-qd-close]')) close();
    });

    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && _open) close(); });
}

export default { mountQuickDock };
