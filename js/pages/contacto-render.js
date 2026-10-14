/**
 * js/pages/contacto-render.js — El MARKUP de Contacto, en un módulo PURO.
 *
 * Por qué existe (MEDIDO el 2026-10-13 en `dist/contacto.html`): la página llegaba con **493
 * caracteres** de cuerpo y **2 palabras dentro del `<main>`** —«Bersaglio Jewelry», el texto del
 * esqueleto de carga—. O sea: la página donde se pide una cita, donde está la dirección del
 * Centro Histórico y donde están los siete días de horario, no existía para una máquina que lee
 * HTML. Lo único que se salvaba era su JSON-LD, y solo porque vive en el `<head>`.
 *
 * Es el tercer caso del mismo mal (Journal → `js/data/journal-render.js`; Nosotros →
 * `js/pages/nosotros-render.js`) y la receta ya está probada: UN motor de render que comparten el
 * navegador y el build, y el HTML horneado en el `dist`.
 *
 * ⚠️ POR QUÉ ESTE CORTE FUE MÁS DURO QUE EL DE NOSOTROS. Contacto no pinta un documento: pinta
 * TRES formularios con estado. Lo que impedía hornearlo no era el markup sino de dónde salía ese
 * estado — variables de módulo (`_tab`, `_sent`, `_form`…), `new Date()` y `sessionStorage`. Aquí
 * nada de eso existe: **todo el estado entra por parámetro**. El navegador le pasa el suyo (con
 * el borrador rescatado del `sessionStorage`); el build le pasa el estado inicial, que es exacta-
 * mente lo que el navegador pinta en su primer paint cuando no hay borrador.
 *
 * Qué puede vivir aquí: funciones PURAS que devuelven HTML. Nada de `document`, nada de `data.js`
 * (arrastra Firebase y el generador corre en Node), nada de relojes. Si algo necesita el DOM o la
 * hora, va en `contacto.js`, que es quien monta.
 *
 * Las tres secciones de copy del CMS (`contactoHeroSection`, `contactoProcesoSection`,
 * `contactoFaqSection`) las usa también el preview del panel (`js/admin/contacto-preview.js`),
 * que las importa desde `contacto.js` — por eso `contacto.js` las sigue re-exportando.
 */

import { html, escape } from '../core/html.js';
import { safeUrl } from '../core/safe-url.js';
import { waHref, igHref, GLOBAL_DEFAULTS } from '../core/global-defaults.js';
import { casillaHtml } from '../core/habeas.js';

// ═══════════════════════════════════════════════════════════════════
// DATOS ESTRUCTURALES (no son copy del CMS: son la forma de los formularios)
// ═══════════════════════════════════════════════════════════════════

/** Estado inicial de cada formulario. Vive aquí —y no en `contacto.js`— porque es la SSoT de los
 *  nombres de campo que el markup escribe: el handler del submit los lee por el mismo nombre. */
export const FORM_VACIO  = { n: '', e: '', tel: '', t: 'asesoria', presup: '', m: '' };
export const VISITA_VACIA = { n: '', e: '', tel: '', fecha: '', hora: '10:00', personas: '1', motivo: 'asesoria', notas: '' };
export const LLAMADA_VACIA = { n: '', tel: '', franja: 'manana', urgencia: 'normal' };

export const CANALES = [
    {
        k: 'whatsapp',
        t: 'WhatsApp',
        v: '+57 301 375 2592',
        d: 'Respuesta inmediata · 09:30–19:00',
        href: 'https://wa.me/573013752592',
        icon: html`<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26l-.999 3.648 3.737-.979zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>`,
    },
    {
        k: 'email',
        t: 'Correo',
        v: 'info@bersagliojewelry.co',
        d: 'Respondemos en < 24h',
        href: 'mailto:info@bersagliojewelry.co',
        icon: html`<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
    },
    {
        k: 'instagram',
        t: 'Instagram',
        v: '@bersaglio_jewelry',
        d: 'Mensaje directo',
        href: 'https://instagram.com/bersaglio_jewelry',
        icon: html`<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zm0 3.68A6.16 6.16 0 1 0 18.16 12 6.16 6.16 0 0 0 12 5.84zm0 10.16A4 4 0 1 1 16 12a4 4 0 0 1-4 4zm6.4-10.4a1.44 1.44 0 1 1-1.44-1.44 1.44 1.44 0 0 1 1.44 1.44z"/></svg>`,
    },
];

export const HORAS = ['10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

// Horario real (Daniel 2026-10-10): todos los días 9:30 a.m.–7:00 p.m., festivos y domingos
// incluidos. Corrige el 8:00 que venía del 25-jun y que se había horneado en los TRES sitios.
// Idéntico al openingHoursSpecification del schema (tenant_config.json) y a
// global-defaults.direccion.horario: si cambias uno, cambia los tres (L-91).
//
// ⚠️ Y desde que la página se HORNEA, hay una cuarta consecuencia: el renglón «Abierto hoy» se
// escribe en el build, con un día que no es el del visitante. Hoy eso es inofensivo porque los
// siete días dicen lo mismo, y `tests/contacto-render.test.mjs` lo clava: si algún día el horario
// deja de ser uniforme, ese test falla y avisa de que el horneado quedaría mintiendo.
export const HORARIOS = [
    { d: 'Lunes',     h: '09:30 – 19:00', abierto: true },
    { d: 'Martes',    h: '09:30 – 19:00', abierto: true },
    { d: 'Miércoles', h: '09:30 – 19:00', abierto: true },
    { d: 'Jueves',    h: '09:30 – 19:00', abierto: true },
    { d: 'Viernes',   h: '09:30 – 19:00', abierto: true },
    { d: 'Sábado',    h: '09:30 – 19:00', abierto: true },
    { d: 'Domingo',   h: '09:30 – 19:00', abierto: true },
];

export const MOTIVOS = [
    { k: 'asesoria',    t: 'Asesoría general',     d: 'Quiero conocer las colecciones' },
    { k: 'pieza',       t: 'Pieza a medida',       d: 'Tengo una idea o una historia' },
    { k: 'compromiso',  t: 'Anillo de compromiso', d: 'Asesoría privada y discreta' },
    { k: 'herencia',    t: 'Pieza heredada',       d: 'Restauración o reinterpretación' },
    { k: 'prensa',      t: 'Prensa & medios',      d: 'Editoriales y entrevistas' },
    { k: 'otro',        t: 'Otro motivo',          d: 'Cuéntame en el mensaje' },
];

export const PRESUPUESTOS = ['Definiendo', '< $5M', '$5M–$15M', '$15M–$50M', '> $50M'];
export const VISITA_MOTIVOS = [
    ['asesoria',    'Asesoría general'],
    ['pieza',       'Pieza a medida'],
    ['compromiso',  'Anillo de compromiso'],
    ['evento',      'Evento especial'],
    ['otro',        'Otro'],
];
export const FRANJAS = [
    { k: 'manana', t: 'Mañana',         h: '09:00–12:00' },
    { k: 'tarde',  t: 'Tarde',          h: '14:00–17:00' },
    { k: 'noche',  t: 'Final de tarde', h: '17:00–19:00' },
];
export const URGENCIAS = [
    ['normal',  'Sin prisa'],
    ['semana',  'Esta semana'],
    ['urgente', 'Hoy mismo'],
];

// ═══════════════════════════════════════════════════════════════════
// SECCIONES (puras)
// ═══════════════════════════════════════════════════════════════════

/** Sección hero desde el dato `c` (PURA) — reusada por el render público y por el preview del CMS (F1). */
export function contactoHeroSection(c) {
    return html`
        <section class="ct-hero">
            <div class="mono ct-hero-eyebrow">${escape(c.eyebrow)}</div>
            <h1 class="ct-hero-title">
                ${escape(c.titleLine1)}<br>
                <span class="italic emerald-text ct-hero-title-em">${escape(c.titleEm)}</span> ${escape(c.titleTail)}
            </h1>
            <p class="ct-hero-lead">${escape(c.lead)}</p>
        </section>`;
}

/**
 * Los cuatro canales. `g` = `mergeGlobal(doc).contacto` (fuente única): el valor mostrado y el
 * href salen de ahí; el ícono/título/descripción son estructurales. href por `safeUrl`
 * (anti stored-XSS). Con `g` en defaults pinta lo mismo que antes de que resuelva Firestore.
 */
export function renderCanales(g) {
    const resolve = (c) =>
        c.k === 'whatsapp'  ? { ...c, v: g.whatsapp,  href: waHref(g.whatsapp) }
      : c.k === 'email'     ? { ...c, v: g.email,      href: `mailto:${g.email}` }
      : c.k === 'instagram' ? { ...c, v: g.instagram,  href: igHref(g.instagram) }
      : c;
    return html`
        <section class="ct-canales canales-grid">
            ${CANALES.map(resolve).map(c => html`
                <a class="glass glass-iridescent canal-card"
                   href="${escape(safeUrl(c.href))}"
                   ${c.k === 'instagram' || c.k === 'whatsapp' ? 'target="_blank" rel="noopener"' : ''}>
                    <div class="canal-icon canal-icon--${escape(c.k)}">
                        ${c.icon}
                    </div>
                    <div>
                        <div class="canal-title">${escape(c.t)}</div>
                        <div class="mono canal-value">${escape(c.v)}</div>
                        <div class="canal-desc">${escape(c.d)}</div>
                    </div>
                </a>`)}
        </section>`;
}

export function renderTabBar(tab) {
    const TABS = [
        { k: 'mensaje', t: 'Enviar mensaje' },
        { k: 'visita',  t: 'Agendar visita' },
        { k: 'llamada', t: 'Pedir llamada' },
    ];
    return html`
        <div class="ct-tabbar" role="tablist">
            ${TABS.map(opt => html`
                <button type="button"
                        class="ct-tab ${tab === opt.k ? 'is-active' : ''}"
                        data-action="tab"
                        data-tab="${escape(opt.k)}"
                        role="tab"
                        aria-selected="${tab === opt.k ? 'true' : 'false'}">${escape(opt.t)}</button>`)}
        </div>`;
}

export function fieldInput({ name, label, value, type = 'text', required = false, placeholder = '', area = false }) {
    const reqMark = required ? html`<span class="ct-field-required">*</span>` : '';
    const reqAttr = required ? 'required' : '';
    if (area) {
        return html`
            <label class="ct-field">
                <span class="eyebrow">${escape(label)}${reqMark}</span>
                <textarea name="${escape(name)}"
                          class="ct-field-input"
                          rows="5"
                          placeholder="${escape(placeholder)}"
                          ${reqAttr}>${escape(value)}</textarea>
            </label>`;
    }
    return html`
        <label class="ct-field">
            <span class="eyebrow">${escape(label)}${reqMark}</span>
            <input type="${escape(type)}"
                   name="${escape(name)}"
                   class="ct-field-input"
                   value="${escape(value)}"
                   placeholder="${escape(placeholder)}"
                   ${reqAttr}>
        </label>`;
}

export function renderFormMensaje(form) {
    return html`
        <form class="ct-form" data-form="mensaje" novalidate>
            <div class="ct-form-row ct-form-row--2">
                ${fieldInput({ name: 'n', label: 'Nombre completo', value: form.n, required: true })}
                ${fieldInput({ name: 'e', label: 'Email',           value: form.e, type: 'email', required: true })}
            </div>
            ${fieldInput({ name: 'tel', label: 'Teléfono / WhatsApp (opcional)', value: form.tel, type: 'tel' })}

            <div>
                <div class="eyebrow ct-section-label">¿Sobre qué quieres hablar?</div>
                <div class="motivo-grid">
                    ${MOTIVOS.map(mt => html`
                        <button type="button"
                                class="ct-motivo-card ${form.t === mt.k ? 'is-active' : ''}"
                                data-action="motivo"
                                data-key="${escape(mt.k)}">
                            <div class="ct-motivo-title">${escape(mt.t)}</div>
                            <div class="ct-motivo-desc">${escape(mt.d)}</div>
                        </button>`)}
                </div>
            </div>

            <div>
                <div class="eyebrow ct-section-label">Rango de presupuesto (opcional)</div>
                <div class="ct-presup-row">
                    ${PRESUPUESTOS.map(p => html`
                        <button type="button"
                                class="ct-presup-pill ${form.presup === p ? 'is-active' : ''}"
                                data-action="presup"
                                data-value="${escape(p)}">${escape(p)}</button>`)}
                </div>
            </div>

            ${fieldInput({
                name: 'm',
                label: 'Describe el motivo de tu inspiración',
                value: form.m,
                area: true,
                placeholder: '¿Qué historia o momento desea conmemorar? ¿Tiene alguna preferencia por una gema en particular?',
            })}

            ${casillaHtml('contacto-mensaje')}

            <div class="ct-form-foot">
                <div class="ct-discreto">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    Tus datos se tratan con discreción absoluta.
                </div>
                <button type="submit" class="btn-aqua btn-aqua-emerald ct-submit">
                    Enviar mensaje
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
                </button>
            </div>
        </form>`;
}

/** `minDate` entra por parámetro (es «hoy + 2 días»): el reloj vive en `contacto.js`, no aquí. */
export function renderFormVisita(visit, minDate) {
    return html`
        <form class="ct-form" data-form="visita" novalidate>
            <div class="ct-banner ct-banner--visit">
                <div class="ct-banner-icon" aria-hidden="true">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z"/><path d="M6 1v3M10 1v3M14 1v3"/></svg>
                </div>
                <div>
                    <div class="ct-banner-title">Cita Privada en la Maison</div>
                    <div class="ct-banner-desc">Centro Histórico, Cartagena · 60–90 min · Un espacio consagrado a tus ideas</div>
                </div>
            </div>

            <div class="ct-form-row ct-form-row--2">
                ${fieldInput({ name: 'n', label: 'Nombre completo', value: visit.n, required: true })}
                ${fieldInput({ name: 'e', label: 'Email',           value: visit.e, type: 'email', required: true })}
            </div>
            ${fieldInput({ name: 'tel', label: 'Teléfono / WhatsApp', value: visit.tel, type: 'tel', required: true })}

            <div class="ct-form-row visit-row">
                <label class="ct-field">
                    <span class="eyebrow">Fecha preferida<span class="ct-field-required">*</span></span>
                    <input type="date" name="fecha" class="ct-field-input" min="${escape(minDate)}" value="${escape(visit.fecha)}" required>
                </label>
                <label class="ct-field">
                    <span class="eyebrow">Hora</span>
                    <select name="hora" class="ct-field-input">
                        ${HORAS.map(h => html`<option value="${escape(h)}" ${visit.hora === h ? 'selected' : ''}>${escape(h)}</option>`)}
                    </select>
                </label>
                <label class="ct-field">
                    <span class="eyebrow">Personas</span>
                    <select name="personas" class="ct-field-input">
                        ${['1', '2', '3', '4'].map(n => html`<option value="${escape(n)}" ${visit.personas === n ? 'selected' : ''}>${escape(n)}</option>`)}
                    </select>
                </label>
            </div>

            <div>
                <div class="eyebrow ct-section-label">Motivo de la visita</div>
                <div class="ct-pills">
                    ${VISITA_MOTIVOS.map(([k, l]) => html`
                        <button type="button"
                                class="ct-pill ${visit.motivo === k ? 'is-active' : ''}"
                                data-action="visita-motivo"
                                data-key="${escape(k)}">${escape(l)}</button>`)}
                </div>
            </div>

            ${fieldInput({
                name: 'notas',
                label: 'Notas (alergias, idioma preferido, accesibilidad...)',
                value: visit.notas,
                area: true,
                placeholder: 'Cualquier detalle que nos ayude a recibirte mejor.',
            })}

            ${casillaHtml('contacto-visita')}

            <button type="submit" class="btn-aqua btn-aqua-emerald ct-submit ct-submit--start">
                Reservar mi visita
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
            </button>
        </form>`;
}

export function renderFormLlamada(call) {
    return html`
        <form class="ct-form" data-form="llamada" novalidate>
            <div class="ct-banner ct-banner--call">
                <div class="ct-banner-icon" aria-hidden="true">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                </div>
                <div>
                    <div class="ct-banner-title">Llamada Confidencial</div>
                    <div class="ct-banner-desc">Establezcamos una conversación telefónica en el horario de tu preferencia.</div>
                </div>
            </div>

            <div class="ct-form-row ct-form-row--2">
                ${fieldInput({ name: 'n',   label: 'Nombre',    value: call.n,   required: true })}
                ${fieldInput({ name: 'tel', label: 'Teléfono',  value: call.tel, type: 'tel', required: true })}
            </div>

            <div>
                <div class="eyebrow ct-section-label">Mejor franja horaria</div>
                <div class="ct-franja-grid">
                    ${FRANJAS.map(f => html`
                        <button type="button"
                                class="ct-franja-card ${call.franja === f.k ? 'is-active' : ''}"
                                data-action="franja"
                                data-key="${escape(f.k)}">
                            <div class="ct-franja-title">${escape(f.t)}</div>
                            <div class="mono ct-franja-hour">${escape(f.h)}</div>
                        </button>`)}
                </div>
            </div>

            <div>
                <div class="eyebrow ct-section-label">Urgencia</div>
                <div class="ct-pills">
                    ${URGENCIAS.map(([k, l]) => html`
                        <button type="button"
                                class="ct-pill ${call.urgencia === k ? 'is-active' : ''}"
                                data-action="urgencia"
                                data-key="${escape(k)}">${escape(l)}</button>`)}
                </div>
            </div>

            ${casillaHtml('contacto-llamada')}

            <button type="submit" class="btn-aqua btn-aqua-emerald ct-submit ct-submit--start">
                Pedir llamada
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
            </button>
        </form>`;
}

/* El guardado falló después de haber pintado el éxito. Aquí NO se consuela: se retira la promesa y se
   entrega el canal que sí contesta. Nada de «inténtalo más tarde» a secas — eso deja al visitante con
   el problema en la mano. El borrador sigue guardado, así que si vuelve no reescribe nada. */
export function renderSendFailed(name, tab) {
    const esVisita = tab === 'visita';
    return html`
        <div class="ct-success">
            <h3 class="ct-success-title">
                Perdónanos, <span class="italic emerald-text">${escape(name)}</span>
            </h3>
            <p class="ct-success-msg">
                ${esVisita
                    ? 'No pudimos confirmar tu solicitud de cita, así que preferimos no darla por reservada. Lo que escribiste quedó guardado aquí.'
                    : 'No pudimos confirmar tu mensaje, así que preferimos no darlo por enviado. Lo que escribiste quedó guardado aquí.'}
                Escríbenos por WhatsApp y lo resolvemos de una vez.
            </p>
            <a class="btn-aqua btn-aqua-emerald" href="https://wa.me/573013752592" target="_blank" rel="noopener">
                Escribir por WhatsApp
            </a>
            <button type="button" class="btn-aqua ct-success-again" data-action="reset">Volver al formulario</button>
        </div>`;
}

export function renderSuccess({ tab, sendFailed, form, visit, call }) {
    const name = (tab === 'mensaje' ? form.n : tab === 'visita' ? visit.n : call.n) || 'distinguido huésped';
    if (sendFailed) return renderSendFailed(name, tab);
    let msg;
    if (tab === 'visita') {
        msg = `Confirmaremos los detalles de tu cita privada por canales directos para el ${visit.fecha || 'día solicitado'} a las ${visit.hora}. El atelier estará reservado exclusivamente para ti.`;
    } else if (tab === 'llamada') {
        msg = `Nos comunicaremos contigo telefónicamente en la franja horaria establecida. Esperamos conversar pronto.`;
    } else {
        msg = `Agradecemos tu confidencia. Kary Mendoza y su equipo se pondrán en contacto contigo en las próximas horas.`;
    }
    return html`
        <div class="ct-success">
            <div class="ct-success-check" aria-hidden="true">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>
            </div>
            <h3 class="ct-success-title">
                Recibido, <span class="italic emerald-text">${escape(name)}</span>
            </h3>
            <p class="ct-success-msg">${escape(msg)}</p>
            <button type="button" class="btn-aqua ct-success-again" data-action="reset">Enviar otro</button>
        </div>`;
}

/** La tarjeta de los tres formularios. `estado` es el MISMO objeto que recibe `renderContacto`. */
export function renderFormCard(estado) {
    const { tab, sent, form, visit, call, minDate } = estado;
    return html`
        <div class="glass glass-iridescent ct-form-card">
            ${renderTabBar(tab)}
            ${sent ? renderSuccess(estado)
                  : tab === 'mensaje' ? renderFormMensaje(form)
                  : tab === 'visita'  ? renderFormVisita(visit, minDate)
                  : renderFormLlamada(call)}
        </div>`;
}

/**
 * La columna lateral: dirección del atelier, los siete días de horario y la promesa de respuesta.
 * Para Google es lo más valioso de esta página (es el NAP en el cuerpo, no solo en el JSON-LD).
 *
 * `todayIdx` (0 = lunes) entra por parámetro porque el build no sabe qué día abrirá el visitante
 * la página. Ver el aviso de `HORARIOS`: hoy el renglón «Abierto hoy» no depende del día.
 */
export function renderSidebar(todayIdx = 0) {
    const today = HORARIOS[todayIdx] || HORARIOS[0];
    return html`
        <aside class="ct-sidebar">
            <div class="glass glass-emerald ct-atelier">
                <div class="ct-map">
                    <svg width="100%" height="100%" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice" class="ct-map-svg">
                        <g stroke="oklch(85% 0.14 90)" stroke-width="0.5" fill="none" opacity="0.6">
                            <path d="M0 60 Q100 50 200 65 T400 70"/>
                            <path d="M0 100 Q120 95 240 105 T400 110"/>
                            <path d="M0 140 L400 145"/>
                            <path d="M80 0 L75 200"/>
                            <path d="M180 0 L175 200"/>
                            <path d="M280 0 L290 200"/>
                        </g>
                        <g stroke="oklch(85% 0.14 90)" stroke-width="0.3" fill="none" opacity="0.4">
                            <rect x="90" y="70" width="40" height="30"/>
                            <rect x="200" y="80" width="50" height="35"/>
                            <rect x="290" y="100" width="40" height="40"/>
                            <rect x="120" y="130" width="60" height="30"/>
                        </g>
                    </svg>
                    <div class="ct-map-pin" aria-hidden="true">
                        <div class="ct-map-pin-bubble"><div class="ct-map-pin-dot"></div></div>
                        <div class="ct-map-pin-label">Atelier</div>
                    </div>
                    <div class="ct-map-flag">CENTRO HISTÓRICO</div>
                </div>
                <div class="ct-atelier-body">
                    <div class="mono ct-atelier-eyebrow">CASA BERSAGLIO</div>
                    <div class="ct-atelier-title">Cartagena de Indias</div>
                    <p class="ct-atelier-addr">
                        Calle 36 # 6-32<br>
                        San Agustín Chiquita · Centro Histórico<br>
                        Bolívar, Colombia
                    </p>
                    <a href="${escape(safeUrl(GLOBAL_DEFAULTS.direccion.mapsUrl))}" target="_blank" rel="noopener" class="ct-atelier-mapbtn">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        Abrir en mapas
                    </a>
                </div>
            </div>

            <div class="glass ct-horarios">
                <div class="mono ct-horarios-eyebrow">HORARIOS DE ATENCIÓN</div>
                <ul class="ct-horarios-list">
                    ${HORARIOS.map((h, i) => html`
                        <li class="ct-horario-row ${i < HORARIOS.length - 1 ? 'ct-horario-row--bordered' : ''} ${h.abierto ? '' : 'ct-horario-row--closed'}">
                            <span class="ct-horario-day">${escape(h.d)}</span>
                            <span class="mono ct-horario-hour">${escape(h.h)}</span>
                        </li>`)}
                </ul>
                ${today.abierto ? html`
                    <div class="ct-horarios-status">
                        <span class="ct-status-dot"></span>
                        <span>Abierto hoy · ${escape(today.h)}</span>
                    </div>` : ''}
            </div>

            <div class="glass ct-respuesta">
                <div class="mono ct-respuesta-eyebrow">RESPUESTA GARANTIZADA</div>
                <div class="ct-respuesta-num">&lt; 24h</div>
                <div class="ct-respuesta-sub">en días hábiles</div>
            </div>
        </aside>`;
}

/** Sección "proceso" desde el dato `c` (PURA) — reusada por el render público y el preview del CMS. */
export function contactoProcesoSection(c) {
    const pasos = [
        { n: '01', t: c.step1Title, d: c.step1Desc, tiempo: c.step1Time },
        { n: '02', t: c.step2Title, d: c.step2Desc, tiempo: c.step2Time },
        { n: '03', t: c.step3Title, d: c.step3Desc, tiempo: c.step3Time },
        { n: '04', t: c.step4Title, d: c.step4Desc, tiempo: c.step4Time },
    ];
    return html`
        <section class="glass ct-proceso">
            <div class="ct-proceso-header">
                <div class="mono ct-proceso-eyebrow">${escape(c.eyebrow)}</div>
                <h2 class="ct-proceso-title">${escape(c.title1)} <span class="italic emerald-text">${escape(c.title2)}</span></h2>
            </div>
            <div class="ct-proceso-grid proc-grid">
                ${pasos.map(p => html`
                    <div class="ct-proceso-step">
                        <div class="ct-proceso-num">${escape(p.n)}</div>
                        <div class="ct-proceso-stepname">${escape(p.t)}</div>
                        <p class="ct-proceso-stepdesc">${escape(p.d)}</p>
                        <div class="mono ct-proceso-time">${escape(p.tiempo)}</div>
                    </div>`)}
            </div>
        </section>`;
}

/**
 * Sección "FAQ rápido" desde el dato `c` (PURA) — reusada por el render público y el preview del CMS.
 * `waUrl` = enlace de WhatsApp derivado de la fuente única; default = número real (para el preview del CMS).
 */
export function contactoFaqSection(c, waUrl = waHref(GLOBAL_DEFAULTS.contacto.whatsapp)) {
    const faqs = [
        { q: c.q1, a: c.a1 }, { q: c.q2, a: c.a2 }, { q: c.q3, a: c.a3 }, { q: c.q4, a: c.a4 },
    ];
    return html`
        <section class="ct-faq-section">
            <div class="ct-faq-header">
                <div class="mono ct-faq-eyebrow">${escape(c.eyebrow)}</div>
                <h3 class="ct-faq-title">${escape(c.title1)} <span class="italic emerald-text">${escape(c.title2)}</span></h3>
                <p class="ct-faq-lead">${escape(c.lead)}</p>
                <a href="${escape(safeUrl(waUrl))}" target="_blank" rel="noopener" class="btn-aqua btn-aqua-emerald ct-faq-cta">
                    Preguntar por WhatsApp
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
                </a>
            </div>
            <div class="ct-faq-grid">
                ${faqs.map(f => html`
                    <div class="glass glass-iridescent ct-faq-card">
                        <div class="ct-faq-q">${escape(f.q)}</div>
                        <p class="ct-faq-a">${escape(f.a)}</p>
                    </div>`)}
            </div>
        </section>`;
}

// ═══════════════════════════════════════════════════════════════════
// ENSAMBLADO (puro)
// ═══════════════════════════════════════════════════════════════════

/**
 * Contacto entera, a partir del copy YA mergeado.
 *
 * @param {object} c  `mergeContacto(doc)` — el copy editable (hero · proceso · faq).
 * @param {object} g  `mergeGlobal(doc).contacto` — los canales (fuente única).
 * @param {object} estado  Lo que en el navegador son variables de módulo y aquí entra por la
 *   puerta: pestaña abierta, formularios, si ya se envió, la fecha mínima y el día de hoy. Los
 *   valores por defecto son EXACTAMENTE el primer paint del navegador sin borrador guardado, que
 *   es lo que el build hornea.
 *
 * Daniel 2026-06-26: lo PRIMERO es el formulario; los 3 canales (WhatsApp/correo/IG) van DEBAJO
 * (antes encima → competían con el lead). Form arriba, canales después.
 */
export function renderContacto(c, g, estado = {}) {
    const pintado = {
        tab: 'mensaje',
        sent: false,
        sendFailed: false,
        form: FORM_VACIO,
        visit: VISITA_VACIA,
        call: LLAMADA_VACIA,
        minDate: '',
        todayIdx: 0,
        ...estado,
    };
    return html`
        <div class="container ct-page">
            ${contactoHeroSection(c.hero)}
            <section class="contact-grid ct-mainrow">
                ${renderFormCard(pintado)}
                ${renderSidebar(pintado.todayIdx)}
            </section>
            ${renderCanales(g)}
            ${contactoProcesoSection(c.proceso)}
            ${contactoFaqSection(c.faq, waHref(g.whatsapp))}
        </div>`;
}
