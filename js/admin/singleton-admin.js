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
import { admToast, esc, errorMessage } from './shared.js';
import { mount, fragment } from '../core/html.js';
import { singletonFormHTML, collectSingleton, mergeSections, itemTemplateHTML, reindexItemSf } from './singleton-admin-core.js';
import createLivePreview from './live-preview.js';

/**
 * @param {object} d descriptor: { page, title, help?, defaults, sections:[…], preview?:{ render(draft):string } }
 * @returns {{ mount(hostEl):void, destroy():void }}
 */
export function createSingletonAdmin(d) {
    let host = null;
    let preview = null;
    let loaded = null;        // valores guardados+merge (baseline para "Descartar")
    let undoSnapshot = null;  // estado ANTES del último guardado (para "Deshacer")
    let debounceT = 0;
    let dirty = false;        // F3 (barandas): hay cambios sin publicar
    const hasPreview = !!(d.preview && typeof d.preview.render === 'function');
    const $ = sel => host.querySelector(sel);

    // F3: indicador "Publicado ✓ / ● Cambios sin publicar" + estado para el guard de pestaña.
    function setPubStatus() {
        const el = host && host.querySelector('[data-pub-status]');
        if (!el) return;
        el.textContent = dirty ? '● Cambios sin publicar' : 'Publicado ✓';
        el.classList.toggle('sf-pub-status--dirty', dirty);
    }
    function markDirty() { if (!dirty) { dirty = true; setPubStatus(); } }
    function markClean() { dirty = false; setPubStatus(); }
    /** F3: aviso del navegador al cerrar/recargar con cambios sin publicar. */
    function onBeforeUnload(e) { if (dirty) { e.preventDefault(); e.returnValue = ''; } }

    async function mountInto(hostEl) {
        host = hostEl;
        mount(host, skeleton());
        window.addEventListener('beforeunload', onBeforeUnload);   // F3: baranda de salida
        $('[data-save]').addEventListener('click', save);
        const discardBtn = $('[data-discard]');
        if (discardBtn) discardBtn.addEventListener('click', discard);
        const undoBtn = $('[data-undo]');
        if (undoBtn) undoBtn.addEventListener('click', undo);

        let doc = null;
        try { doc = await getSiteContent(d.page); }
        catch (err) { console.warn(`[singleton-admin:${d.page}] load failed:`, err); }
        if (!host) return;     // se desmontó mientras cargaba
        loaded = mergeSections(d.defaults, doc, d.sections);
        fillForm(loaded);
        markClean();           // F3: baseline tras cargar = publicado

        const formEl = $('[data-form]');
        formEl.addEventListener('input', onInput);     // delegado (sobrevive a re-fill): contadores + título de ítem + preview
        formEl.addEventListener('focusin', onFocusIn); // F2: foco en un campo → resalta su sección en el preview
        formEl.addEventListener('change', onImgChange);// P3.5: subir imagen (input file → optimize + upload)
        formEl.addEventListener('click', onImgClear);  // P3.5: quitar imagen
        formEl.addEventListener('click', onListAct);   // P4: añadir/quitar/subir/bajar ítems de lista
        if (hasPreview) {
            preview = createLivePreview({ cssFrom: d.preview.cssFrom });
            await preview.mount($('[data-preview]'));
            if (!host) { preview.destroy(); preview = null; return; }
            preview.onSectionClick(focusSection);      // F2: clic en el preview → salta al campo de esa sección
            refreshPreview();
        }
    }

    /** F2: key de sección a la que pertenece un campo (data-sf="seccion.campo"). */
    function sectionOfField(el) {
        const sf = el && el.getAttribute && el.getAttribute('data-sf');
        return sf ? sf.split('.')[0] : '';
    }

    /** F2: foco en un campo → pide al preview resaltar la sección correspondiente. */
    function onFocusIn(e) {
        if (!preview) return;
        const sec = sectionOfField(e.target);
        if (sec) preview.highlight(sec);
    }

    /** F2: clic en una sección del preview → enfoca su primer campo y resalta su fieldset. */
    function focusSection(section) {
        if (!host || !section) return;
        const field = host.querySelector(`[data-sf^="${section}."]`);
        if (!field) return;
        field.scrollIntoView({ block: 'center', behavior: 'smooth' });
        field.focus({ preventScroll: true });
        const fs = field.closest('fieldset');
        if (fs) {
            fs.style.transition = 'box-shadow .2s';
            fs.style.boxShadow = '0 0 0 2px var(--adm-accent)';
            setTimeout(() => { fs.style.boxShadow = ''; }, 1200);
        }
    }

    /** Pinta el contenido del recuadro de preview de imagen (DOM seguro, sin innerHTML). */
    function setImgPreview(previewE, url) {
        previewE.textContent = '';
        if (url) {
            const im = document.createElement('img');
            im.src = url; im.alt = '';
            previewE.appendChild(im);
        } else {
            const sp = document.createElement('span');
            sp.className = 'sf-img-empty';
            sp.textContent = 'Sin imagen propia — se usa la de la web';
            previewE.appendChild(sp);
        }
    }

    /** P3.5: subir imagen. input[type=file] → optimizeImage → uploadAsset → URL al hidden + preview. */
    async function onImgChange(e) {
        const input = e.target;
        if (!input || typeof input.matches !== 'function' || !input.matches('input[data-img-input]')) return;
        const file = input.files && input.files[0];
        if (!file) return;
        const wrap = input.closest('[data-img-wrap]');
        if (!wrap) return;
        const hidden   = wrap.querySelector('input[type="hidden"][data-sf]');
        const previewE = wrap.querySelector('[data-img-preview]');
        const progress = wrap.querySelector('[data-img-progress]');
        const clearBtn = wrap.querySelector('[data-img-clear]');
        try {
            progress.hidden = false; progress.textContent = 'Optimizando…';
            const [{ optimizeImage, makeLqip }, { uploadAsset }] = await Promise.all([
                import('../image-optimizer.js'),
                import('../storage-service.js'),
            ]);
            // §103 F1: optimizar + generar el LQIP (placeholder difuso) del MISMO archivo en paralelo.
            const [optimized, lqip] = await Promise.all([optimizeImage(file), makeLqip(file)]);
            const url = await uploadAsset(optimized, pct => { progress.textContent = `Subiendo… ${pct}%`; });
            if (!host) return;                         // se desmontó durante la subida
            hidden.value = url;
            const lqipInput = wrap.querySelector('input[data-img-lqip]');
            if (lqipInput) lqipInput.value = lqip || '';   // viaja junto a la URL; vacío si no se pudo generar
            setImgPreview(previewE, url);
            if (clearBtn) clearBtn.hidden = false;
            markDirty();                               // F3: imagen subida = cambios sin publicar
            refreshPreview();                          // el iframe muestra la imagen nueva al instante
            admToast('Imagen subida. Guarda para publicarla.');
        } catch (err) {
            console.error(`[singleton-admin:${d.page}] image upload failed:`, err);
            admToast(errorMessage(err, 'No se pudo subir la imagen.'), 'danger', 5000);
        } finally {
            progress.hidden = true;
            input.value = '';                          // permite re-elegir el mismo archivo
        }
    }

    /** P3.5: quitar la imagen custom → vuelve a la imagen por defecto de la web. */
    function onImgClear(e) {
        const btn = e.target && e.target.closest && e.target.closest('[data-img-clear]');
        if (!btn) return;
        const wrap = btn.closest('[data-img-wrap]');
        if (!wrap) return;
        const urlInput = wrap.querySelector('input[type="hidden"][data-sf]:not([data-img-lqip])');
        if (urlInput) urlInput.value = '';
        const lqipInput = wrap.querySelector('input[data-img-lqip]');
        if (lqipInput) lqipInput.value = '';           // §103 F1: limpiar el LQIP compañero
        setImgPreview(wrap.querySelector('[data-img-preview]'), '');
        btn.hidden = true;
        markDirty();                                   // F3: imagen quitada = cambios sin publicar
        refreshPreview();
    }

    // ─── P4: listas repetibles (añadir/quitar/subir/bajar) ──────────────────────

    /** Localiza el descriptor de campo `list` desde su clave "seccion.lista". */
    function listFieldDescriptor(listKey) {
        const dot = listKey.indexOf('.');
        if (dot < 0) return null;
        const sectionKey = listKey.slice(0, dot);
        const fieldName = listKey.slice(dot + 1);
        const sec = d.sections.find(s => s.key === sectionKey);
        if (!sec) return null;
        const f = sec.fields.find(ff => ff.name === fieldName && ff.type === 'list');
        return f ? { sectionKey, f } : null;
    }

    /** Tarjetas de ítem (hijas DIRECTAS del contenedor — no anida listas). */
    function itemCards(listEl) {
        return [...listEl.querySelectorAll(':scope > [data-sf-item]')];
    }

    /** Reindexa data-sf de TODAS las tarjetas a su posición en el DOM (0..n). Punto frágil. */
    function reindexList(listEl, listKey) {
        itemCards(listEl).forEach((card, i) => {
            card.querySelectorAll('[data-sf]').forEach(el => {
                el.dataset.sf = reindexItemSf(el.dataset.sf, listKey, i);
            });
        });
    }

    /** Actualiza el contador N/max del pie de la lista. */
    function updateListCount(field, listEl, max) {
        const c = field.querySelector('[data-sf-list-count]');
        if (!c || !Number.isFinite(max)) return;
        c.textContent = `${itemCards(listEl).length}/${max}`;
    }

    /** Refleja en vivo el título derivado de la tarjeta (DOM-safe vía textContent). */
    function updateItemTitle(el) {
        if (!el || typeof el.closest !== 'function') return;
        const card = el.closest('[data-sf-item]');
        if (!card) return;
        const listEl = card.closest('[data-sf-list]');
        if (!listEl) return;
        const desc = listFieldDescriptor(listEl.dataset.sfList);
        if (!desc) return;
        const titleKey = desc.f.itemTitleFrom || (desc.f.itemFields[0] && desc.f.itemFields[0].name);
        const sf = el.getAttribute('data-sf') || '';
        if (!titleKey || !sf.endsWith(`.${titleKey}`)) return;
        const titleEl = card.querySelector('[data-sf-item-title]');
        if (!titleEl) return;
        const val = (el.value || '').trim();
        if (val) { titleEl.textContent = val; return; }
        // Vacío: mismo placeholder que el render inicial (índice + estilo .sf-item-untitled).
        const i = itemCards(listEl).indexOf(card);
        titleEl.textContent = '';
        const span = document.createElement('span');
        span.className = 'sf-item-untitled';
        span.textContent = desc.f.itemTitleEmpty || `${desc.f.singular || 'Elemento'} ${i + 1}`;
        titleEl.appendChild(span);
    }

    /** Click delegado de las acciones de lista (add en el pie; up/down/del por tarjeta). */
    function onListAct(e) {
        const btn = e.target && e.target.closest && e.target.closest('[data-list-act]');
        if (!btn) return;
        const field = btn.closest('.sf-list-field');
        if (!field) return;
        const listEl = field.querySelector('[data-sf-list]');
        if (!listEl) return;
        const listKey = listEl.dataset.sfList;
        const max = Number(listEl.dataset.listMax) || Infinity;
        const min = Number(listEl.dataset.listMin) || 0;
        const act = btn.dataset.listAct;
        const cards = itemCards(listEl);

        if (act === 'add') {
            if (cards.length >= max) { admToast(`Máximo ${max} elementos en esta lista.`, 'danger'); return; }
            const desc = listFieldDescriptor(listKey);
            if (!desc) return;
            const card = fragment(itemTemplateHTML(desc.sectionKey, desc.f, {}, cards.length)).firstElementChild;
            if (!card) return;
            listEl.appendChild(card);
            reindexList(listEl, listKey);
            updateListCount(field, listEl, max);
            card.querySelector('[data-sf]')?.focus();
            markDirty();
            refreshPreview();
            return;
        }

        const card = btn.closest('[data-sf-item]');
        if (!card) return;

        if (act === 'del') {
            if (cards.length <= min) { admToast(`Debe quedar al menos ${min} elemento${min === 1 ? '' : 's'}.`, 'danger'); return; }
            card.remove();
            reindexList(listEl, listKey);
            updateListCount(field, listEl, max);
            markDirty();
            refreshPreview();
            return;
        }
        if (act === 'up') {
            const prev = card.previousElementSibling;
            if (prev && prev.matches('[data-sf-item]')) {
                listEl.insertBefore(card, prev);
                reindexList(listEl, listKey);
                markDirty();
                refreshPreview();
            }
            return;
        }
        if (act === 'down') {
            const next = card.nextElementSibling;
            if (next && next.matches('[data-sf-item]')) {
                listEl.insertBefore(next, card);
                reindexList(listEl, listKey);
                markDirty();
                refreshPreview();
            }
        }
    }

    function destroy() {
        clearTimeout(debounceT);
        window.removeEventListener('beforeunload', onBeforeUnload);   // F3
        if (preview) { preview.destroy(); preview = null; }
        if (host) mount(host, '');
        host = null;
    }

    function skeleton() {
        const actions = `<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
            <span class="sf-pub-status" data-pub-status></span>
            <button class="adm-btn adm-btn--ghost" data-undo hidden>↩ Deshacer guardado</button>
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
                <p class="sf-preview-note">Toca una sección en la vista previa para editar sus textos. Los enlaces están desactivados aquí.</p>
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

    function onInput(e) {
        markDirty();                               // F3: cualquier edición = cambios sin publicar
        updateCounter(e.target);
        updateItemTitle(e.target);                 // P4: refleja en vivo el título de la tarjeta de lista
        if (!hasPreview) return;
        clearTimeout(debounceT);
        debounceT = setTimeout(refreshPreview, 180);
    }

    /** Actualiza el contador N/max del campo y lo marca cuando llega al tope. */
    function updateCounter(el) {
        if (!el || typeof el.matches !== 'function' || !el.matches('[data-sf][maxlength]')) return;
        const max = el.getAttribute('maxlength');
        const c = el.closest('.adm-field')?.querySelector('[data-sf-count]');
        if (!c) return;
        const n = el.value.length;
        c.textContent = `${n}/${max}`;
        c.classList.toggle('sf-count--full', n >= Number(max));
    }

    function discard() {
        if (!loaded) return;
        fillForm(loaded);
        refreshPreview();
        markClean();              // F3: vuelve al baseline publicado
        admToast('Cambios descartados.');
    }

    function showUndo(visible) {
        const b = $('[data-undo]');
        if (b) b.hidden = !visible;
    }

    /** Deshacer de un nivel: re-guarda el estado que había ANTES del último guardado. */
    async function undo() {
        if (!undoSnapshot) return;
        const b = $('[data-undo]');
        if (b) b.disabled = true;
        const restore = undoSnapshot;
        try {
            await saveSiteContent(d.page, restore);
            loaded = restore;
            fillForm(restore);
            refreshPreview();
            undoSnapshot = null;
            showUndo(false);
            markClean();              // F3: el estado restaurado quedó publicado
            admToast('Se restauró la versión anterior.');
        } catch (err) {
            console.error(`[singleton-admin:${d.page}] undo failed:`, err);
            admToast(errorMessage(err, 'No se pudo deshacer.'), 'danger', 5000);
        } finally {
            if (b) b.disabled = false;
        }
    }

    async function save() {
        const btn = $('[data-save]');
        if (btn) btn.disabled = true;
        const preSave = loaded;   // estado ANTES de este guardado (para "Deshacer")
        try {
            const data = readForm();
            await saveSiteContent(d.page, data);
            loaded = data;            // nuevo baseline para "Descartar"
            undoSnapshot = preSave;   // habilita "Deshacer guardado"
            showUndo(true);
            markClean();              // F3: publicado ✓
            admToast('Textos guardados. Se verán en la web al recargar.');
        } catch (err) {
            console.error(`[singleton-admin:${d.page}] save failed:`, err);
            admToast(errorMessage(err, 'No se pudo guardar.'), 'danger', 5000);
        } finally {
            if (btn) btn.disabled = false;
        }
    }

    return { mount: mountInto, destroy, isDirty: () => dirty };
}

export default createSingletonAdmin;
