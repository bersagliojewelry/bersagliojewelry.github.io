/**
 * Bersaglio Jewelry — Contacto page (multi-channel).
 *
 * Mirror exacto de BERSAGLIO NOVO/project/js/pages.jsx (Contacto L538-968, 432L)
 * con copy literal de canales, motivos, proceso, faqsRapido.
 *
 * Secciones:
 *   1. Hero centered (eyebrow + display "Una conversación, un café, una pieza")
 *   2. Canales (4 quick cards — WhatsApp/Teléfono/Email/Instagram con iconos coloreados)
 *   3. Contact grid (1.3fr 1fr):
 *      Form glass-iridescent con 3 tabs:
 *        - mensaje: Field grid + 6 motivo cards + presupuesto pills + textarea
 *        - visita: tour info banner + 3-col fecha/hora/personas + motivo pills + notas
 *        - llamada: timing info banner + 3 franja cards + 3 urgencia pills
 *      Success state cuando _sent: green check icon + personalized thanks
 *      Sidebar:
 *        - Atelier card (glass-emerald) con SVG map estilizado + dirección + maps link
 *        - Horarios (7 días + indicador "Abierto ahora")
 *        - Respuesta garantizada glass-gold con "<24h"
 *   4. Proceso (4-col): Lectura/Respuesta/Conversación/Boceto con time pills
 *   5. FAQ rápido (1fr 1.4fr): título + lead + WhatsApp CTA | 4 FAQs en glass card
 *
 * Estado interno (vanilla):
 *   - _tab: 'mensaje' | 'visita' | 'llamada'
 *   - _form, _visit, _call: objetos de los 3 forms
 *   - _sent: bool — muestra success state
 *
 * Submit:
 *   - Persiste a Firestore via firestore-service.saveInquiry()
 *   - Si Firestore falla, igual muestra success (UX no bloqueante)
 *   - sessionStorage 'bj-contact-form' guarda en background
 *
 * ⚠️ 2026-10-13: el MARKUP se mudó a `contacto-render.js` (módulo puro) para que el build pueda
 * hornearlo — la página llegaba con 2 palabras dentro del `<main>`. Aquí queda lo que de verdad
 * necesita el navegador: el estado, el reloj, el borrador, los handlers e `init()`. Las tres
 * secciones de copy se re-exportan porque el preview del panel las importa desde este fichero.
 */

import { fragment } from '../core/html.js';
import { data } from '../core/data.js';
import { mergeContacto } from './contacto-defaults.js';
import { mergeGlobal, waHref } from '../core/global-defaults.js';
import { saveInquiry } from '../firestore-service.js';
import { prueba as pruebaHabeas } from '../core/habeas.js';
import { track } from '../analytics.js';
import {
    renderContacto, renderFormCard, renderCanales,
    contactoHeroSection, contactoProcesoSection, contactoFaqSection,
    FORM_VACIO, VISITA_VACIA, LLAMADA_VACIA,
    MOTIVOS, VISITA_MOTIVOS, FRANJAS, URGENCIAS,
} from './contacto-render.js';

// Compatibilidad: `js/admin/contacto-preview.js` importa las secciones de copy desde aquí.
export { contactoHeroSection, contactoProcesoSection, contactoFaqSection } from './contacto-render.js';
export { renderContacto } from './contacto-render.js';

let _tab = 'mensaje';
let _sent = false;
// El envío es OPTIMISTA (ver onSubmit): la tarjeta de éxito se pinta antes de que Firestore conteste,
// porque esperar un segundo con la pantalla quieta se lee como que el botón no funcionó. El precio de
// esa decisión es que el guardado puede fallar DESPUÉS, y hasta el 2026-10-12 cuando eso pasaba solo
// quedaba un `console.warn`: el visitante leía «Confirmaremos los detalles de tu cita privada» y su
// solicitud no existía en ninguna parte. Una cita prometida que se pierde en silencio es justo lo que
// la Ley 1480 castiga (lo anunciado obliga), y además es el peor fallo posible aquí: el único canal
// donde alguien pide una hora en el atelier. Esta bandera hace que el fallo se VEA y ofrezca la salida
// que sí funciona (WhatsApp), en vez de tragárselo.
let _sendFailed = false;
let _form  = { ...FORM_VACIO };
let _visit = { ...VISITA_VACIA };
let _call  = { ...LLAMADA_VACIA };

const STORAGE_KEY = 'bj-contact-form';

/** «Hoy + 2 días». Impura a propósito: es el reloj, y por eso vive aquí y no en el módulo puro. */
function getMinDate() {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
}

/** Índice del día de hoy con el lunes en 0, que es como está ordenado `HORARIOS`. */
function todayIdx() {
    return (new Date().getDay() + 6) % 7;
}

/** El estado vivo, en la forma que espera el módulo de render. */
function estadoActual() {
    return {
        tab: _tab, sent: _sent, sendFailed: _sendFailed,
        form: _form, visit: _visit, call: _call,
        minDate: getMinDate(), todayIdx: todayIdx(),
    };
}

function loadDraft() {
    try {
        const raw = sessionStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const draft = JSON.parse(raw);
        if (draft.tab) _tab = draft.tab;
        if (draft.form)  Object.assign(_form,  draft.form);
        if (draft.visit) Object.assign(_visit, draft.visit);
        if (draft.call)  Object.assign(_call,  draft.call);
    } catch {}
}

function saveDraft() {
    try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ tab: _tab, form: _form, visit: _visit, call: _call }));
    } catch {}
}

function clearDraft() {
    try { sessionStorage.removeItem(STORAGE_KEY); } catch {}
}

function readRefFromURL() {
    return new URL(location.href).searchParams.get('ref') || '';
}

// ═══════════════════════════════════════════════════════════════════
// RENDERS (envoltorios: leen el CMS vigente y delegan en el módulo puro)
// ═══════════════════════════════════════════════════════════════════

const copyVigente  = () => mergeContacto(data.getSiteContent('contacto'));
const globalVigente = () => mergeGlobal(data.getSiteContent('global')).contacto;

function renderAll() {
    return renderContacto(copyVigente(), globalVigente(), estadoActual());
}

// ═══════════════════════════════════════════════════════════════════
// HANDLERS
// ═══════════════════════════════════════════════════════════════════

function refreshFormCard() {
    const card = document.querySelector('.ct-form-card');
    if (!card) return;
    const tmp = document.createElement('div');
    tmp.innerHTML = renderFormCard(estadoActual());
    card.replaceWith(tmp.firstElementChild);
}

function readFormValues(form) {
    const data = {};
    new FormData(form).forEach((v, k) => { data[k] = v; });
    return data;
}

function commitFieldChange(formName, name, value) {
    const target = formName === 'mensaje' ? _form : formName === 'visita' ? _visit : _call;
    if (name in target) target[name] = value;
    saveDraft();
}

function onMainInput(e) {
    const form = e.target.closest('form[data-form]');
    if (!form) return;
    const formName = form.dataset.form;
    const name = e.target.name;
    if (!name) return;
    commitFieldChange(formName, name, e.target.value);
}

function onMainClick(e) {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;

    if (action === 'tab') {
        e.preventDefault();
        _tab = btn.dataset.tab;
        _sent = false;
        _sendFailed = false;
        saveDraft();
        refreshFormCard();
        return;
    }
    if (action === 'reset') {
        e.preventDefault();
        _sent = false;
        _sendFailed = false;
        refreshFormCard();
        return;
    }
    if (action === 'motivo') {
        e.preventDefault();
        _form.t = btn.dataset.key;
        saveDraft();
        document.querySelectorAll('.ct-motivo-card').forEach(el => {
            el.classList.toggle('is-active', el.dataset.key === _form.t);
        });
        return;
    }
    if (action === 'presup') {
        e.preventDefault();
        _form.presup = btn.dataset.value;
        saveDraft();
        document.querySelectorAll('.ct-presup-pill').forEach(el => {
            el.classList.toggle('is-active', el.dataset.value === _form.presup);
        });
        return;
    }
    if (action === 'visita-motivo') {
        e.preventDefault();
        _visit.motivo = btn.dataset.key;
        saveDraft();
        const buttons = document.querySelectorAll('[data-action="visita-motivo"]');
        buttons.forEach(el => el.classList.toggle('is-active', el.dataset.key === _visit.motivo));
        return;
    }
    if (action === 'franja') {
        e.preventDefault();
        _call.franja = btn.dataset.key;
        saveDraft();
        document.querySelectorAll('.ct-franja-card').forEach(el => {
            el.classList.toggle('is-active', el.dataset.key === _call.franja);
        });
        return;
    }
    if (action === 'urgencia') {
        e.preventDefault();
        _call.urgencia = btn.dataset.key;
        saveDraft();
        const buttons = document.querySelectorAll('[data-action="urgencia"]');
        buttons.forEach(el => el.classList.toggle('is-active', el.dataset.key === _call.urgencia));
    }
}

function onMainSubmit(e) {
    const form = e.target.closest('form[data-form]');
    if (!form) return;
    e.preventDefault();
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    const formName = form.dataset.form;
    const data = readFormValues(form);

    // Compose payload for Firestore
    const ref = readRefFromURL();
    let payload;
    if (formName === 'mensaje') {
        Object.assign(_form, data);
        const motivo = MOTIVOS.find(m => m.k === _form.t);
        payload = {
            name:    _form.n,
            email:   _form.e,
            phone:   _form.tel || '',
            message: `[${motivo?.t || _form.t}] ${_form.presup ? `(Presup: ${_form.presup}) ` : ''}${_form.m || ''}`.trim(),
            pieceSlug: ref || null,
            source:  'contacto-mensaje',
            habeasData: pruebaHabeas(),
        };
    } else if (formName === 'visita') {
        Object.assign(_visit, data);
        const motivo = VISITA_MOTIVOS.find(([k]) => k === _visit.motivo)?.[1] || _visit.motivo;
        payload = {
            name:    _visit.n,
            email:   _visit.e,
            phone:   _visit.tel,
            message: `Visita ${_visit.fecha} ${_visit.hora} · ${_visit.personas} pers · ${motivo}${_visit.notas ? ` · ${_visit.notas}` : ''}`,
            pieceSlug: ref || null,
            source:  'contacto-visita',
            habeasData: pruebaHabeas(),
        };
    } else {
        Object.assign(_call, data);
        const franja = FRANJAS.find(f => f.k === _call.franja)?.t || _call.franja;
        const urgencia = URGENCIAS.find(([k]) => k === _call.urgencia)?.[1] || _call.urgencia;
        payload = {
            name:    _call.n,
            email:   '',
            phone:   _call.tel,
            message: `Llamada · ${franja} · Urgencia: ${urgencia}`,
            pieceSlug: ref || null,
            source:  'contacto-llamada',
            habeasData: pruebaHabeas(),
        };
    }

    // Track Lead event for analytical conversion measurements (GA4 + Meta Pixel)
    try {
        track('generate_lead', {
            lead_type: formName, // 'mensaje', 'visita', 'llamada'
            piece_slug: ref || ''
        });
    } catch (err) {
        console.warn('[contacto] generate_lead tracking failed:', err);
    }

    // Optimistic UI: show success immediately. Firestore happens in background.
    _sent = true;
    saveDraft();
    refreshFormCard();
    // Scroll the success card into view smoothly
    requestAnimationFrame(() => {
        document.querySelector('.ct-form-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    /* Dos formas de fallar, y solo una avisa (MEDIDO en el navegador el 2026-10-12, no supuesto):
       · Reglas de Firestore o datos inválidos → `addDoc` RECHAZA → lo caza el `.catch`.
       · Red caída → `addDoc` NO rechaza: Firestore encola la escritura y la promesa se queda
         PENDIENTE indefinidamente. Se verificó interceptando XHR y fetch: a los 14 segundos la
         tarjeta seguía diciendo «el atelier estará reservado exclusivamente para ti». Si el visitante
         cierra la pestaña antes de que vuelva la red, la cita se perdió y nadie se enteró.
       Por eso un `.catch` NO basta aquí: hace falta un plazo. Si en 9 s no hubo confirmación, se
       retira la promesa. Y si el guardado llega tarde pero llega, se restituye: más vale una tarjeta
       que se corrige sola que una cita perdida en silencio. */
    let resuelto = false;
    const plazo = setTimeout(() => {
        if (resuelto) return;
        _sendFailed = true;
        refreshFormCard();
    }, 9000);

    saveInquiry(payload).then(() => {
        resuelto = true;
        clearTimeout(plazo);
        if (_sendFailed) { _sendFailed = false; refreshFormCard(); }  // llegó tarde, pero llegó
        clearDraft();
    }).catch(err => {
        resuelto = true;
        clearTimeout(plazo);
        // El borrador NO se limpia: que no tenga que reescribirlo si vuelve a intentar.
        console.warn('[contacto] saveInquiry falló:', err);
        _sendFailed = true;
        refreshFormCard();
    });
}

export async function init() {
    const main = document.getElementById('main-content');
    if (!main) return;

    loadDraft();

    main.innerHTML = renderAll();
    main.addEventListener('click', onMainClick);
    main.addEventListener('input', onMainInput);
    main.addEventListener('change', onMainInput);
    main.addEventListener('submit', onMainSubmit);

    // CMS P2: copy editable (hero/proceso/faq). Pinta con DEFAULTS ya; re-pinta SOLO
    // esas secciones al resolver el getDoc (NO toca el formulario ni su estado).
    data.loadSiteContent('contacto').then(refreshCopy);
    // CMS global: canales (whatsapp/email/instagram) desde siteContent/global (fuente única).
    data.loadSiteContent('global').then(refreshCanales);
}

function refreshCopy() {
    const c = copyVigente();
    replaceSection('.ct-hero', contactoHeroSection(c.hero));
    replaceSection('.ct-proceso', contactoProcesoSection(c.proceso));
    replaceSection('.ct-faq-section', contactoFaqSection(c.faq, waUrlVigente()));
}

function refreshCanales() {
    replaceSection('.ct-canales', renderCanales(globalVigente()));
    // El FAQ CTA también deriva su WhatsApp de `global`: re-pinta al llegar el override.
    replaceSection('.ct-faq-section', contactoFaqSection(copyVigente().faq, waUrlVigente()));
}

/** El CTA de WhatsApp del FAQ deriva de la fuente única (siteContent/global.contacto). */
function waUrlVigente() {
    return waHref(globalVigente().whatsapp);
}

function replaceSection(sel, htmlStr) {
    const el = document.querySelector(sel);
    if (!el) return;
    const next = fragment(htmlStr).firstElementChild;
    if (next) el.replaceWith(next);
}

export default { init };
