/**
 * js/admin/singleton-admin.js — Scaffold SINGLETON-FORM (P1 del gran plan): edita los
 * textos de una página (siteContent/{page}) por formulario → setDoc(merge). Complementa
 * createResourceAdmin (que es para LISTAS); este es para TEXTOS de baja escritura.
 *
 * Monta SCOPED en un host (convive en pestañas, admin-contenido.html). Pre-rellena con
 * merge(DEFAULTS, doc) para que Kary edite desde el texto ACTUAL. Guarda vía
 * saveSiteContent (upsert + _version + audit + señal de cache). Núcleo puro (HTML +
 * recolección + merge) en singleton-admin-core.js.
 */
import { getSiteContent, saveSiteContent } from '../firestore-service.js';
import { admToast, esc } from './shared.js';
import { mount } from '../core/html.js';
import { singletonFormHTML, collectSingleton, mergeSections } from './singleton-admin-core.js';

/**
 * @param {object} d descriptor: { page, title, help?, defaults, sections:[{key,label,fields:[{name,label,type,...}]}] }
 * @returns {{ mount(hostEl):void, destroy():void }}
 */
export function createSingletonAdmin(d) {
    let host = null;
    const $ = sel => host.querySelector(sel);

    async function mountInto(hostEl) {
        host = hostEl;
        mount(host, skeleton());
        $('[data-save]').addEventListener('click', save);
        // Cargar el doc actual (getDoc one-shot) y pre-rellenar con merge(DEFAULTS, doc).
        let doc = null;
        try { doc = await getSiteContent(d.page); }
        catch (err) { console.warn(`[singleton-admin:${d.page}] load failed:`, err); }
        if (host) mount($('[data-form]'), singletonFormHTML(d.sections, mergeSections(d.defaults, doc, d.sections)));
    }

    function destroy() { if (host) mount(host, ''); host = null; }

    function skeleton() {
        return `
        <div class="adm-content-head" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;gap:12px;flex-wrap:wrap;">
            <p class="adm-td-muted" style="margin:0;font-size:13px;max-width:60ch;">${esc(d.help || 'Edita los textos y guarda. Los cambios se ven en la web al recargar la página.')}</p>
            <button class="adm-btn adm-btn--primary" data-save>Guardar cambios</button>
        </div>
        <form data-form novalidate></form>`;
    }

    function readForm() {
        const raw = {};
        host.querySelectorAll('[data-sf]').forEach(el => { raw[el.dataset.sf] = el.value; });
        return collectSingleton(raw, d.sections);
    }

    async function save() {
        const btn = $('[data-save]');
        if (btn) btn.disabled = true;
        try {
            await saveSiteContent(d.page, readForm());
            admToast('Textos guardados. Se verán en la web al recargar.');
        } catch (err) {
            console.error(`[singleton-admin:${d.page}] save failed:`, err);
            admToast(err?.message || 'Error al guardar', 'danger', 5000);
        } finally {
            if (btn) btn.disabled = false;
        }
    }

    return { mount: mountInto, destroy };
}

export default createSingletonAdmin;
