/**
 * js/admin/contenido.js — Controlador del panel "Contenido web"
 * (admin-contenido.html). Monta el rail, pinta la barra de pestañas desde el
 * registro (contenido-tabs.js) y activa una pestaña a la vez con su controlador
 * { mount, destroy }. La pestaña activa vive en el hash (#journal) → enlazable y
 * recargable. Al cambiar de pestaña hace destroy() de la anterior (sin listeners
 * onSnapshot zombi).
 */
import adminDb from './db.js';
import { requireAuth, initSidebar, esc } from './shared.js';
import { mount } from '../core/html.js';
import { TABS } from './contenido-tabs.js';
import { createEstadoWeb } from './estado-web.js';

let current   = null;   // controlador montado
let currentId = null;
let estadoWeb = null;   // tarjeta "Estado de tu web" (vive toda la página)

function tabFor(id) {
    return TABS.find(t => t.id === id) || TABS[0];
}

function renderTabBar() {
    const bar = document.getElementById('content-tabs');
    if (!bar) return;
    mount(bar, TABS.map(t =>
        `<button class="adm-tab" data-tab="${esc(t.id)}">${esc(t.label)}</button>`
    ).join(''));
    bar.querySelectorAll('[data-tab]').forEach(b =>
        b.addEventListener('click', () => { location.hash = b.dataset.tab; })
    );
}

function activate(id) {
    const tab = tabFor(id);
    if (tab.id === currentId && current) return;   // ya activa: no remontar
    // F3 (barandas): no abandonar una pestaña con cambios sin publicar sin confirmar.
    if (current && typeof current.isDirty === 'function' && current.isDirty()) {
        if (!confirm('Tienes cambios sin publicar en esta sección. Si cambias de pestaña se perderán. ¿Continuar?')) {
            if (currentId && (location.hash || '').replace('#', '') !== currentId) location.hash = currentId;
            return;   // el revert del hash re-dispara activate(currentId) → no-op
        }
    }
    document.querySelectorAll('#content-tabs [data-tab]').forEach(b =>
        b.classList.toggle('is-active', b.dataset.tab === tab.id)
    );
    const title = document.getElementById('content-title');
    if (title) title.textContent = tab.label;

    if (current) { current.destroy(); current = null; }
    currentId = tab.id;
    current = tab.create();
    current.mount(document.getElementById('tab-host'));
}

async function init() {
    await requireAuth('editor');
    await adminDb.init();      // paridad de chrome: rail + badge + auth-context para auditoría
    initSidebar();
    const estadoHost = document.getElementById('estado-web');
    if (estadoHost) { estadoWeb = createEstadoWeb(); estadoWeb.mount(estadoHost); }
    renderTabBar();
    activate((location.hash || '').replace('#', '') || TABS[0].id);
    window.addEventListener('hashchange', () =>
        activate((location.hash || '').replace('#', '') || TABS[0].id)
    );
    // La tarjeta "Estado de tu web" vive toda la página; suelta sus 3 listeners al salir
    // (simetría con su destroy() — evita la fuga que marcó la revisión adversarial).
    window.addEventListener('pagehide', () => { if (estadoWeb) { estadoWeb.destroy(); estadoWeb = null; } });
    // B.4: el guard de "cambios sin publicar" solo cubría el cambio de PESTAÑA (activate). Si Kary navega
    // por el sidebar / cierra la pestaña / hace atrás con texto editado sin publicar, lo perdía en silencio.
    // beforeunload dispara el diálogo nativo del navegador de "¿salir sin guardar?".
    window.addEventListener('beforeunload', (e) => {
        if (current && typeof current.isDirty === 'function' && current.isDirty()) {
            e.preventDefault();
            e.returnValue = '';
        }
    });
}

init();
