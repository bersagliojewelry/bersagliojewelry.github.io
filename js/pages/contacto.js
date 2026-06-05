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
 */

import { html, escape } from '../core/html.js';
import { saveInquiry } from '../firestore-service.js';
import { track } from '../analytics.js';

let _tab = 'mensaje';
let _sent = false;
let _form  = { n: '', e: '', tel: '', t: 'asesoria', presup: '', m: '' };
let _visit = { n: '', e: '', tel: '', fecha: '', hora: '10:00', personas: '1', motivo: 'asesoria', notas: '' };
let _call  = { n: '', tel: '', franja: 'manana', urgencia: 'normal' };

const STORAGE_KEY = 'bj-contact-form';

const CANALES = [
    {
        k: 'whatsapp',
        t: 'WhatsApp',
        v: '+57 301 375 2592',
        d: 'Respuesta inmediata · 09:00–20:00',
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
        v: '@bersagliojewelry',
        d: 'Mensaje directo',
        href: 'https://instagram.com/bersagliojewelry',
        icon: html`<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zm0 3.68A6.16 6.16 0 1 0 18.16 12 6.16 6.16 0 0 0 12 5.84zm0 10.16A4 4 0 1 1 16 12a4 4 0 0 1-4 4zm6.4-10.4a1.44 1.44 0 1 1-1.44-1.44 1.44 1.44 0 0 1 1.44 1.44z"/></svg>`,
    },
];

const HORAS  = ['10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
const HORARIOS = [
    { d: 'Lunes',     h: '10:00 – 19:00',          abierto: true },
    { d: 'Martes',    h: '10:00 – 19:00',          abierto: true },
    { d: 'Miércoles', h: '10:00 – 19:00',          abierto: true },
    { d: 'Jueves',    h: '10:00 – 19:00',          abierto: true },
    { d: 'Viernes',   h: '10:00 – 20:00',          abierto: true },
    { d: 'Sábado',    h: '10:00 – 18:00',          abierto: true },
    { d: 'Domingo',   h: 'Solo con cita previa',   abierto: false },
];

const FAQS_RAPIDO = [
    { q: '¿Necesito cita previa?',         a: 'No es obligatoria: puedes acercarte directamente o reservar una cita para una atención más dedicada. Ambas son bienvenidas.' },
    { q: '¿Hay parqueadero?',              a: 'En el Centro Histórico encuentras varios parqueaderos privados y seguros a pocos pasos del atelier.' },
    { q: '¿Puedo llevar acompañantes?',    a: 'Hasta tres personas. Indícalo al agendar para preparar el espacio.' },
    { q: '¿Atienden en otro idioma?',      a: 'Español e inglés. Francés e italiano con cita previa, informándolo al agendar.' },
];

const MOTIVOS = [
    { k: 'asesoria',    t: 'Asesoría general',     d: 'Quiero conocer las colecciones' },
    { k: 'pieza',       t: 'Pieza a medida',       d: 'Tengo una idea o una historia' },
    { k: 'compromiso',  t: 'Anillo de compromiso', d: 'Asesoría privada y discreta' },
    { k: 'herencia',    t: 'Pieza heredada',       d: 'Restauración o reinterpretación' },
    { k: 'prensa',      t: 'Prensa & medios',      d: 'Editoriales y entrevistas' },
    { k: 'otro',        t: 'Otro motivo',          d: 'Cuéntame en el mensaje' },
];

const PRESUPUESTOS = ['Definiendo', '< $5M', '$5M–$15M', '$15M–$50M', '> $50M'];
const VISITA_MOTIVOS = [
    ['asesoria',    'Asesoría general'],
    ['pieza',       'Pieza a medida'],
    ['compromiso',  'Anillo de compromiso'],
    ['evento',      'Evento especial'],
    ['otro',        'Otro'],
];
const FRANJAS = [
    { k: 'manana', t: 'Mañana',         h: '09:00–12:00' },
    { k: 'tarde',  t: 'Tarde',          h: '14:00–17:00' },
    { k: 'noche',  t: 'Final de tarde', h: '17:00–19:00' },
];
const URGENCIAS = [
    ['normal',  'Sin prisa'],
    ['semana',  'Esta semana'],
    ['urgente', 'Hoy mismo'],
];

const PROCESO = [
    { n: '01', t: 'Lectura Personal',   d: 'Tu mensaje es leído directamente por Kary Mendoza y su equipo. Prescindimos de respuestas automáticas o chatbots; valoramos el contacto humano desde el primer segundo.', tiempo: 'En el día' },
    { n: '02', t: 'Primer Diálogo',  d: 'Nos pondremos en contacto para entender mejor el contexto de tu joya: la historia detrás del encargo, el tipo de gema preferida y las expectativas de entrega.', tiempo: '< 24 horas' },
    { n: '03', t: 'Encuentro Pausado',       d: 'Agendamos una llamada de voz, chat directo o un café en nuestra Maison en el centro histórico de Cartagena. Una conversación íntima, sin presiones comerciales de ningún tipo.', tiempo: 'A tu ritmo' },
    { n: '04', t: 'Manos a la Obra', d: 'Si decides que Bersaglio sea el custodio de tu legado, damos vida a tu pieza paso a paso: del primer boceto a mano alzada hasta la creación final en nuestro taller, siempre con tu aprobación.', tiempo: 'A medida' },
];

function getMinDate() {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
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
// RENDERS
// ═══════════════════════════════════════════════════════════════════

function renderHero() {
    return html`
        <section class="ct-hero">
            <div class="mono ct-hero-eyebrow">CONSERJERÍA PRIVADA</div>
            <h1 class="ct-hero-title">
                Un encuentro pausado,<br>
                <span class="italic emerald-text ct-hero-title-em">una esmeralda única,</span> un legado eterno.
            </h1>
            <p class="ct-hero-lead">
                Te invitamos a dar el primer paso. Elige la vía de comunicación que te resulte más cómoda; cada mensaje es atendido de manera directa y confidencial por Kary Mendoza y su equipo.
            </p>
        </section>`;
}

function renderCanales() {
    return html`
        <section class="ct-canales canales-grid">
            ${CANALES.map(c => html`
                <a class="glass glass-iridescent canal-card"
                   href="${c.href}"
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

function renderTabBar() {
    const TABS = [
        { k: 'mensaje', t: 'Enviar mensaje' },
        { k: 'visita',  t: 'Agendar visita' },
        { k: 'llamada', t: 'Pedir llamada' },
    ];
    return html`
        <div class="ct-tabbar" role="tablist">
            ${TABS.map(opt => html`
                <button type="button"
                        class="ct-tab ${_tab === opt.k ? 'is-active' : ''}"
                        data-action="tab"
                        data-tab="${escape(opt.k)}"
                        role="tab"
                        aria-selected="${_tab === opt.k ? 'true' : 'false'}">${escape(opt.t)}</button>`)}
        </div>`;
}

function fieldInput({ name, label, value, type = 'text', required = false, placeholder = '', area = false }) {
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

function renderFormMensaje() {
    return html`
        <form class="ct-form" data-form="mensaje" novalidate>
            <div class="ct-form-row ct-form-row--2">
                ${fieldInput({ name: 'n', label: 'Nombre completo', value: _form.n, required: true })}
                ${fieldInput({ name: 'e', label: 'Email',           value: _form.e, type: 'email', required: true })}
            </div>
            ${fieldInput({ name: 'tel', label: 'Teléfono / WhatsApp (opcional)', value: _form.tel, type: 'tel' })}

            <div>
                <div class="eyebrow ct-section-label">¿Sobre qué quieres hablar?</div>
                <div class="motivo-grid">
                    ${MOTIVOS.map(mt => html`
                        <button type="button"
                                class="ct-motivo-card ${_form.t === mt.k ? 'is-active' : ''}"
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
                                class="ct-presup-pill ${_form.presup === p ? 'is-active' : ''}"
                                data-action="presup"
                                data-value="${escape(p)}">${escape(p)}</button>`)}
                </div>
            </div>

            ${fieldInput({
                name: 'm',
                label: 'Describe el motivo de tu inspiración',
                value: _form.m,
                area: true,
                placeholder: '¿Qué historia o momento desea conmemorar? ¿Tiene alguna preferencia por una gema en particular?',
            })}

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

function renderFormVisita() {
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
                ${fieldInput({ name: 'n', label: 'Nombre completo', value: _visit.n, required: true })}
                ${fieldInput({ name: 'e', label: 'Email',           value: _visit.e, type: 'email', required: true })}
            </div>
            ${fieldInput({ name: 'tel', label: 'Teléfono / WhatsApp', value: _visit.tel, type: 'tel', required: true })}

            <div class="ct-form-row visit-row">
                <label class="ct-field">
                    <span class="eyebrow">Fecha preferida<span class="ct-field-required">*</span></span>
                    <input type="date" name="fecha" class="ct-field-input" min="${getMinDate()}" value="${escape(_visit.fecha)}" required>
                </label>
                <label class="ct-field">
                    <span class="eyebrow">Hora</span>
                    <select name="hora" class="ct-field-input">
                        ${HORAS.map(h => html`<option value="${escape(h)}" ${_visit.hora === h ? 'selected' : ''}>${escape(h)}</option>`)}
                    </select>
                </label>
                <label class="ct-field">
                    <span class="eyebrow">Personas</span>
                    <select name="personas" class="ct-field-input">
                        ${['1', '2', '3', '4'].map(n => html`<option value="${escape(n)}" ${_visit.personas === n ? 'selected' : ''}>${escape(n)}</option>`)}
                    </select>
                </label>
            </div>

            <div>
                <div class="eyebrow ct-section-label">Motivo de la visita</div>
                <div class="ct-pills">
                    ${VISITA_MOTIVOS.map(([k, l]) => html`
                        <button type="button"
                                class="ct-pill ${_visit.motivo === k ? 'is-active' : ''}"
                                data-action="visita-motivo"
                                data-key="${escape(k)}">${escape(l)}</button>`)}
                </div>
            </div>

            ${fieldInput({
                name: 'notas',
                label: 'Notas (alergias, idioma preferido, accesibilidad...)',
                value: _visit.notas,
                area: true,
                placeholder: 'Cualquier detalle que nos ayude a recibirte mejor.',
            })}

            <button type="submit" class="btn-aqua btn-aqua-emerald ct-submit ct-submit--start">
                Reservar mi visita
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
            </button>
        </form>`;
}

function renderFormLlamada() {
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
                ${fieldInput({ name: 'n',   label: 'Nombre',    value: _call.n,   required: true })}
                ${fieldInput({ name: 'tel', label: 'Teléfono',  value: _call.tel, type: 'tel', required: true })}
            </div>

            <div>
                <div class="eyebrow ct-section-label">Mejor franja horaria</div>
                <div class="ct-franja-grid">
                    ${FRANJAS.map(f => html`
                        <button type="button"
                                class="ct-franja-card ${_call.franja === f.k ? 'is-active' : ''}"
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
                                class="ct-pill ${_call.urgencia === k ? 'is-active' : ''}"
                                data-action="urgencia"
                                data-key="${escape(k)}">${escape(l)}</button>`)}
                </div>
            </div>

            <button type="submit" class="btn-aqua btn-aqua-emerald ct-submit ct-submit--start">
                Pedir llamada
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
            </button>
        </form>`;
}

function renderSuccess() {
    const name = (_tab === 'mensaje' ? _form.n : _tab === 'visita' ? _visit.n : _call.n) || 'distinguido huésped';
    let msg;
    if (_tab === 'visita') {
        msg = `Confirmaremos los detalles de tu cita privada por canales directos para el ${_visit.fecha || 'día solicitado'} a las ${_visit.hora}. El atelier estará reservado exclusivamente para ti.`;
    } else if (_tab === 'llamada') {
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

function renderFormCard() {
    return html`
        <div class="glass glass-iridescent ct-form-card">
            ${renderTabBar()}
            ${_sent ? renderSuccess()
                  : _tab === 'mensaje' ? renderFormMensaje()
                  : _tab === 'visita'  ? renderFormVisita()
                  : renderFormLlamada()}
        </div>`;
}

function renderSidebar() {
    const todayIdx = (new Date().getDay() + 6) % 7; // 0 = Lunes
    const today = HORARIOS[todayIdx];
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
                    <a href="https://maps.google.com/?q=Cartagena+Centro+Hist%C3%B3rico" target="_blank" rel="noopener" class="ct-atelier-mapbtn">
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

function renderProceso() {
    return html`
        <section class="glass ct-proceso">
            <div class="ct-proceso-header">
                <div class="mono ct-proceso-eyebrow">QUÉ ESPERAR DE NOSOTROS</div>
                <h2 class="ct-proceso-title">Después de que <span class="italic emerald-text">nos escribes</span></h2>
            </div>
            <div class="ct-proceso-grid proc-grid">
                ${PROCESO.map(p => html`
                    <div class="ct-proceso-step">
                        <div class="ct-proceso-num">${escape(p.n)}</div>
                        <div class="ct-proceso-stepname">${escape(p.t)}</div>
                        <p class="ct-proceso-stepdesc">${escape(p.d)}</p>
                        <div class="mono ct-proceso-time">${escape(p.tiempo)}</div>
                    </div>`)}
            </div>
        </section>`;
}

function renderFAQRapido() {
    return html`
        <section class="ct-faq-section">
            <div class="ct-faq-header">
                <div class="mono ct-faq-eyebrow">ANTES DE TU VISITA</div>
                <h3 class="ct-faq-title">Lo que necesitas <span class="italic emerald-text">saber</span></h3>
                <p class="ct-faq-lead">
                    Cuatro respuestas rápidas para que llegues con todo claro. Si te queda alguna duda, escríbenos por WhatsApp.
                </p>
                <a href="https://wa.me/573013752592" target="_blank" rel="noopener" class="btn-aqua btn-aqua-emerald ct-faq-cta">
                    Preguntar por WhatsApp
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
                </a>
            </div>
            <div class="ct-faq-grid">
                ${FAQS_RAPIDO.map(f => html`
                    <div class="glass glass-iridescent ct-faq-card">
                        <div class="ct-faq-q">${escape(f.q)}</div>
                        <p class="ct-faq-a">${escape(f.a)}</p>
                    </div>`)}
            </div>
        </section>`;
}

function renderAll() {
    return html`
        <div class="container ct-page">
            ${renderHero()}
            ${renderCanales()}
            <section class="contact-grid ct-mainrow">
                ${renderFormCard()}
                ${renderSidebar()}
            </section>
            ${renderProceso()}
            ${renderFAQRapido()}
        </div>`;
}

// ═══════════════════════════════════════════════════════════════════
// HANDLERS
// ═══════════════════════════════════════════════════════════════════

function refreshFormCard() {
    const card = document.querySelector('.ct-form-card');
    if (!card) return;
    const tmp = document.createElement('div');
    tmp.innerHTML = renderFormCard();
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
        saveDraft();
        refreshFormCard();
        return;
    }
    if (action === 'reset') {
        e.preventDefault();
        _sent = false;
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

    saveInquiry(payload).then(() => {
        clearDraft();
    }).catch(err => {
        console.warn('[contacto] saveInquiry failed (UX no-op):', err);
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
}

export default { init };
