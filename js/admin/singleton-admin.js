/**
 * js/admin/singleton-admin.js — Scaffold SINGLETON-FORM (P1 del gran plan): edita los
 * textos de una página (siteContent/{page}) por formulario → setDoc(merge). Complementa
 * createResourceAdmin (que es para LISTAS); este es para TEXTOS de baja escritura.
 *
 * Monta SCOPED en un host (convive en pestañas, admin-contenido.html). Pre-rellena con
 * merge(DEFAULTS, doc) para que Kary edite desde el texto ACTUAL. Guarda vía
 * saveSiteContent (upsert + _version + audit + señal de cache). Núcleo puro (HTML +
 * recolección + merge) en singleton-admin-core.js.
 *
 * F1 (CMS edición visual): si el descriptor trae `preview: { render(draft)→html }`, monta
 * un SPLIT (formulario | vista previa en vivo en iframe aislado) que se actualiza al teclear
 * (debounce) reusando los renderers públicos. Decisión iframe: auditoría §82 + consejo Gemini.
 */
import { getSiteContent, saveSiteContent } from '../firestore-service.js';
import { admToast, esc } from './shared.js';
import { mount } from '../core/html.js';
import { singletonFormHTML, collectSingleton, mergeSections } from './singleton-admin-core.js';
import createLivePreview from './live-preview.js';

/**
 * @param {object} d descriptor: { page, title, help?, defaults, sections:[…], preview?:{ render(draft):string } }
 * @returns {{ mount(hostEl):void, destroy():void }}
 */
export function createSingletonAdmin(d) {
    let host = null;
    let preview = null;
    let loaded = null;        // valores guardados+merge (baseline para "Descartar")
    let debounceT = 0;
    const hasPreview = !!(d.preview && typeof d.preview.render === 'function');
    const $ = sel => host.querySelector(sel);

    async function mountInto(hostEl) {
        host = hostEl;
        mount(host, skeleton());
        $('[data-save]').addEventListener('click', save);
        const discardBtn = $('[data-discard]');
        if (discardBtn) discardBtn.addEventListener('click', discard);

        let doc = null;
        try { doc = await getSiteContent(d.page); }
        catch (err) { console.warn(`[singleton-admin:${d.page}] load failed:`, err); }
        if (!host) return;     // se desmontó mientras cargaba
        loaded = mergeSections(d.defaults, doc, d.sections);
        fillForm(loaded);

        if (hasPreview) {
            preview = createLivePreview();
            await preview.mount($('[data-preview]'));
            if (!host) { preview.destroy(); preview = null; return; }
            refreshPreview();
            $('[data-form]').addEventListener('input', onInput);   // delegado: sobrevive a re-fill
        }
    }

    function destroy() {
        clearTimeout(debounceT);
        if (preview) { preview.destroy(); preview = null; }
        if (host) mount(host, '');
        host = null;
    }

    function skeleton() {
        const actions = `<div style="display:flex;gap:8px;flex-wrap:wrap;">
            ${hasPreview ? '<button class="adm-btn adm-btn--ghost" data-discard>Descartar cambios</button>' : ''}
            <button class="adm-btn adm-btn--primary" data-save>Guardar cambios</button>
        </div>`;
        const head = `<div class="adm-content-head" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;gap:12px;flex-wrap:wrap;">
            <p class="adm-td-muted" style="margin:0;font-size:13px;max-width:60ch;">${esc(d.help || 'Edita los textos y guarda. Los cambios se ven en la web al recargar la página.')}</p>
            ${actions}
        </div>`;
        if (!hasPreview) return `${head}<form data-form novalidate></form>`;
        return `${head}
        <div class="sf-split">
            <form data-form class="sf-form" novalidate></form>
            <aside class="sf-preview">
                <div class="sf-preview-bar"><span class="sf-preview-dot" aria-hidden="true"></span> Vista previa · así se verá en la web</div>
                <div class="sf-preview-host" data-preview></div>
                <p class="sf-preview-note">Secciones de texto del inicio, con la marca real. Los enlaces están desactivados aquí.</p>
            </aside>
        </div>`;
    }

    function fillForm(values) {
        mount($('[data-form]'), singletonFormHTML(d.sections, values));
    }

    function readForm() {
        const raw = {};
        host.querySelectorAll('[data-sf]').forEach(el => { raw[el.dataset.sf] = el.value; });
        return collectSingleton(raw, d.sections);
    }

    function refreshPreview() {
        if (preview) {
            try { preview.update(d.preview.render(readForm())); }
            catch (err) { console.warn(`[singleton-admin:${d.page}] preview render failed:`, err); }
        }
    }

    function onInput() {
        clearTimeout(debounceT);
        debounceT = setTimeout(refreshPreview, 180);
    }

    function discard() {
        if (!loaded) return;
        fillForm(loaded);
        refreshPreview();
        admToast('Cambios descartados.');
    }

    async function save() {
        const btn = $('[data-save]');
        if (btn) btn.disabled = true;
        try {
            const data = readForm();
            await saveSiteContent(d.page, data);
            loaded = data;     // nuevo baseline para "Descartar"
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
