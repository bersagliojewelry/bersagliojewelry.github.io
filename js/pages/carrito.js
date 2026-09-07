/**
 * Bersaglio Jewelry — Carrito (3-step checkout stepper).
 *
 * Mirror exacto de BERSAGLIO NOVO/project/js/pages.jsx (Checkout L995-1106, 112L)
 * + extensiones reales para Firestore + cart store + persistencia.
 *
 * Flow:
 *   Step 1 (Carrito): items con qty stepper + remove + "Continuar al envío"
 *   Step 2 (Envío):   7-field shipping form (Nombre/Apellido, Dirección, Ciudad/País/CP,
 *                     Teléfono/Email) con HTML5 validation + sessionStorage 'bj-shipping'
 *   Step 3 (Pago):    3 payment radio cards (WhatsApp / Transferencia / "Coordinar"),
 *                     "Confirmar compra · subtotal" CTA full-width
 *
 * Stepper bar: 3 pills emerald, click salta entre pasos. Si el cart está vacío,
 * solo step 1 es clickeable.
 *
 * Summary sidebar (glass-emerald, sticky top:100):
 *   Subtotal / Envío (Cotizar) / Total mono 24px
 *
 * Datos:
 *   - cart.getAll() entrega items {slug, qty, addedAt}
 *   - data.getBySlug() une con piece (name, price, images)
 *   - data.onChange + cart.onChange → re-render del step actual
 *
 * Submit handlers:
 *   - Step 1 → goToStep(2)
 *   - Step 2 form submit → saveDraft + goToStep(3) (sessionStorage 'bj-shipping')
 *   - Step 3 confirm:
 *       method=whatsapp → window.open(wa.me link con cart items)
 *       method=transferencia → saveInquiry + redirect a gracias.html?method=transfer
 *       method=coordinar    → saveInquiry + redirect a gracias.html?method=coordinar
 *
 * Empty state cuando cart vacío: CTA al catálogo.
 */

import { html, escape } from '../core/html.js';
import { format$ } from '../core/format.js';
import { cart } from '../core/cart.js';
import { data } from '../core/data.js';
import { pieceUrl, pieceAbsUrl } from '../core/urls.js';
import { mergeGlobal, waHref } from '../core/global-defaults.js';
import { saveInquiry } from '../firestore-service.js';
import { trackBeginCheckout, trackPurchase } from '../analytics.js';
import { pagarConWompi, wompiEligible } from '../pago-web.js';
import { COUNTRIES } from '../core/countries.js';
import { getEnvioConfig, TIPOS_ENTREGA, DEFAULT_TIPO } from '../core/envio-config.js';

const SHIPPING_KEY = 'bj-shipping';
const STEPS = ['Carrito', 'Envío', 'Pago'];
// Wompi F2: cobro web "Comprar ahora" (1 pieza). ENCENDIDO en prod 2026-06-30 (§157.x, llaves prod + secretos en Secret Manager).
// El botón "Pagar ahora" solo aparece en piezas ELEGIBLES (precio>0 + stock + ≤ tope $2.5M); con productos sin precio queda oculto.
const WOMPI_WEB_ENABLED = true;
let _step = 1;
let _tipoEntrega = DEFAULT_TIPO;   // TODO-63: tipo de entrega (rige campos del form + elegibilidad de pago online)
let _shipping = { firstName: '', lastName: '', email: '', phone: '', address: '', city: '', country: 'Colombia', zip: '', docType: 'CC', docNumber: '', countryIso2: 'CO' };
let _payment = 'whatsapp';
let _payFocus = false;   // TODO-63: al elegir "Pagar ahora" se enfoca ese método y se ocultan los otros (con escape)
let _habeas = false;   // consentimiento (Habeas Data + Términos) — TODO-63: se da al FINAL del paso Entrega (Ley 1581), para todos los métodos
const LEGAL_CONSENT_VERSION = '2026-06-30';   // versión del texto legal aceptado (Términos/Privacidad) — se guarda como prueba con el pedido

function loadShipping() {
    try {
        const raw = sessionStorage.getItem(SHIPPING_KEY);
        if (!raw) return;
        Object.assign(_shipping, JSON.parse(raw));
    } catch {}
}
function saveShipping() {
    try { sessionStorage.setItem(SHIPPING_KEY, JSON.stringify(_shipping)); } catch {}
}
function clearShipping() {
    try { sessionStorage.removeItem(SHIPPING_KEY); } catch {}
}

function joinCart() {
    return cart.getAll().map(item => ({
        ...item,
        piece: data.getBySlug(item.slug),
    }));
}

function computeTotals(rows) {
    const subtotal = rows.reduce((s, r) => s + Number(r.piece?.price || 0) * (r.qty || 1), 0);
    const totalQty = rows.reduce((s, r) => s + (r.qty || 1), 0);
    return { subtotal, totalQty };
}

// ═══════════════════════════════════════════════════════════════════
// 1. STEPPER BAR
// ═══════════════════════════════════════════════════════════════════
function renderStepper(rows) {
    const empty = rows.length === 0;
    return html`
        <nav class="glass ck-stepper" role="tablist" aria-label="Pasos del checkout">
            ${STEPS.map((s, i) => {
                const idx = i + 1;
                // Los pasos FUTUROS no son clicables (reporte del dueño, encendido A.9): avanzar SIEMPRE
                // pasa por el botón validado ("Continuar" del form exige campos + consentimiento). Volver
                // atrás sí es libre. Sin esto, saltar a "03 Pago" por la píldora esquivaba la validación.
                const disabled = (empty && idx > 1) || idx > _step;
                return html`
                    <button type="button"
                            class="ck-step ${_step === idx ? 'is-active' : ''} ${disabled ? 'is-disabled' : ''}"
                            data-action="step"
                            data-step="${idx}"
                            ${disabled ? 'disabled aria-disabled="true"' : ''}
                            role="tab"
                            aria-selected="${_step === idx ? 'true' : 'false'}">
                        <span class="mono ck-step-num">0${idx}</span>${escape(s)}
                    </button>`;
            })}
        </nav>`;
}

// ═══════════════════════════════════════════════════════════════════
// 2. STEP 1 — CART
// ═══════════════════════════════════════════════════════════════════
function renderStepCart(rows) {
    if (rows.length === 0) return renderEmpty();
    return html`
        <div class="ck-step-body">
            <h3 class="ck-step-title">Tus piezas</h3>
            <div class="ck-items">
                ${rows.map(renderItemRow)}
            </div>
            <div class="ck-step-footer">
                <button type="button"
                        class="btn-aqua btn-aqua-emerald ck-cta"
                        data-action="step-next">
                    Continuar al envío
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
                </button>
            </div>
        </div>`;
}

function renderItemRow(row) {
    const { slug, qty, piece } = row;
    if (!piece) {
        return html`
            <article class="ck-item ck-item--stale" data-slug="${escape(slug)}">
                <div class="ck-item-img ck-item-img--missing" aria-hidden="true"></div>
                <div class="ck-item-body">
                    <div class="ck-item-name">Pieza retirada del catálogo</div>
                    <div class="mono ck-item-meta">${escape(slug)}</div>
                    <div class="ck-item-controls">
                        <button type="button"
                                class="ck-item-remove"
                                data-action="remove"
                                data-slug="${escape(slug)}">Quitar</button>
                    </div>
                </div>
            </article>`;
    }
    const img = piece.images?.[0] || piece.image || '';
    return html`
        <article class="ck-item" data-slug="${escape(slug)}">
            <a class="ck-item-img" href="${pieceUrl(piece.slug || slug)}"
               style="background:url('${escape(img)}') center/cover"
               aria-label="Ver ${escape(piece.name || '')}"></a>
            <div class="ck-item-body">
                <a class="ck-item-name" href="${pieceUrl(piece.slug || slug)}">${escape(piece.name || 'Pieza')}</a>
                <div class="mono ck-item-price">${escape(format$(piece.price))}</div>
                <div class="ck-item-controls">
                    <div class="ck-qty">
                        <button type="button" class="ck-qty-btn" data-action="dec" data-slug="${escape(slug)}" aria-label="Restar uno">−</button>
                        <span class="mono ck-qty-val">${qty}</span>
                        <button type="button" class="ck-qty-btn" data-action="inc" data-slug="${escape(slug)}" aria-label="Sumar uno">+</button>
                    </div>
                    <button type="button"
                            class="ck-item-remove"
                            data-action="remove"
                            data-slug="${escape(slug)}">Quitar</button>
                </div>
            </div>
        </article>`;
}

function renderEmpty() {
    return html`
        <div class="ck-empty">
            <div class="ck-empty-icon" aria-hidden="true">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
                    <path d="M6 2l-2 5v15h16V7l-2-5H6z"/>
                    <path d="M4 7h16M10 11a2 2 0 0 0 4 0"/>
                </svg>
            </div>
            <h3 class="ck-empty-title">Tu carrito espera la primera pieza</h3>
            <p class="ck-empty-sub">
                Explora la colección. Cada pieza Bersaglio se elige con tiempo,
                con calma y con un café.
            </p>
            <div class="ck-empty-actions">
                <a href="/colecciones.html" class="btn-aqua btn-aqua-emerald">Ver el catálogo</a>
                <a href="/contacto.html" class="btn-aqua">Hablar con un asesor</a>
            </div>
        </div>`;
}

// ═══════════════════════════════════════════════════════════════════
// 3. STEP 2 — SHIPPING
// ═══════════════════════════════════════════════════════════════════
function fieldHTML({ name, label, value, type = 'text', required = false, placeholder = '', autocomplete = '' }) {
    const reqMark = required ? html`<span class="ck-field-required">*</span>` : '';
    const reqAttr = required ? 'required' : '';
    return html`
        <label class="ck-field">
            <span class="eyebrow">${escape(label)}${reqMark}</span>
            <input type="${escape(type)}"
                   name="${escape(name)}"
                   class="ck-field-input"
                   value="${escape(value)}"
                   placeholder="${escape(placeholder)}"
                   ${autocomplete ? `autocomplete="${escape(autocomplete)}"` : ''}
                   ${reqAttr}>
        </label>`;
}

const DOC_TYPES = [
    { v: 'CC',  t: 'Cédula de ciudadanía' },
    { v: 'CE',  t: 'Cédula de extranjería' },
    { v: 'PP',  t: 'Pasaporte' },
    { v: 'NIT', t: 'NIT' },
];

// TODO-63: selector de TIPO DE ENTREGA — radiogroup nativo estilizado. `data-action` en el
// <label> (mismo patrón que las tarjetas de pago); el radio interno da el estado a11y.
function renderTipoEntrega() {
    return html`
        <fieldset class="ck-entrega-group">
            <legend class="ck-step-title">¿Cómo quieres recibir tu pieza?</legend>
            <div class="ck-entrega-list">
                ${TIPOS_ENTREGA.map(t => {
                    const c = getEnvioConfig(t);
                    const on = _tipoEntrega === t;
                    return html`
                        <label class="glass ck-entrega ${on ? 'is-active' : ''}" data-action="tipo-entrega" data-tipo="${escape(t)}">
                            <input type="radio" name="tipoEntrega" value="${escape(t)}" ${on ? 'checked' : ''} class="ck-entrega-radio">
                            <span class="ck-entrega-body">
                                <span class="ck-entrega-title">${escape(c.label)}</span>
                                <span class="ck-entrega-sub">${escape(c.sub)}</span>
                            </span>
                        </label>`;
                })}
            </div>
        </fieldset>`;
}

// TODO-63: teléfono con país (bandera + indicativo) — `<select>` nativo (a11y/typeahead gratis).
function renderCountryPhone() {
    return html`
        <label class="ck-field">
            <span class="eyebrow">Teléfono / WhatsApp<span class="ck-field-required">*</span></span>
            <span class="ck-phone-row">
                <select name="countryIso2" class="ck-field-input ck-phone-cc" aria-label="País (indicativo telefónico)">
                    ${COUNTRIES.map(c => html`<option value="${escape(c.iso2)}" ${_shipping.countryIso2 === c.iso2 ? 'selected' : ''}>${escape(c.iso2)} +${escape(c.code)}</option>`)}
                </select>
                <input type="tel" name="phone" class="ck-field-input ck-phone-num" value="${escape(_shipping.phone)}" inputmode="tel" autocomplete="tel" placeholder="Número" required>
            </span>
        </label>`;
}

function renderStepShipping() {
    const cfg = getEnvioConfig(_tipoEntrega);
    const showFact = cfg.campos.includes('address');   // tienda + nacional
    const showZip  = cfg.campos.includes('zip');        // nacional
    const docOpts  = DOC_TYPES.map(d => html`<option value="${escape(d.v)}" ${_shipping.docType === d.v ? 'selected' : ''}>${escape(d.t)}</option>`);
    return html`
        <div class="ck-step-body ck-entrega-step">
            ${renderTipoEntrega()}
            <p class="ck-entrega-note">${escape(cfg.nota)}</p>
            <form class="ck-shipping" data-form="shipping" novalidate>
                <div class="ck-field-row ck-field-row--2">
                    ${fieldHTML({ name: 'firstName', label: 'Nombre',   value: _shipping.firstName, autocomplete: 'given-name',  required: true })}
                    ${fieldHTML({ name: 'lastName',  label: 'Apellido', value: _shipping.lastName,  autocomplete: 'family-name', required: showFact })}
                </div>
                <div class="ck-field-row ck-field-row--2">
                    ${fieldHTML({ name: 'email', label: 'Email', value: _shipping.email, type: 'email', autocomplete: 'email', required: showFact })}
                    ${renderCountryPhone()}
                </div>
                ${showFact ? html`
                <div class="ck-fact-block">
                    <div class="eyebrow ck-fact-title">${escape(cfg.titulo)}</div>
                    <div class="ck-field-row ck-field-row--2">
                        <label class="ck-field">
                            <span class="eyebrow">Tipo de documento<span class="ck-field-required">*</span></span>
                            <select name="docType" class="ck-field-input" required>${docOpts}</select>
                        </label>
                        ${fieldHTML({ name: 'docNumber', label: 'Número de documento', value: _shipping.docNumber, required: true })}
                    </div>
                    ${fieldHTML({ name: 'address', label: 'Dirección', value: _shipping.address, autocomplete: 'street-address', required: true })}
                    <div class="ck-field-row ${showZip ? 'ck-field-row--2' : ''}">
                        ${fieldHTML({ name: 'city', label: 'Ciudad', value: _shipping.city, autocomplete: 'address-level2', required: true })}
                        ${showZip ? fieldHTML({ name: 'zip', label: 'Código postal', value: _shipping.zip, autocomplete: 'postal-code' }) : ''}
                    </div>
                </div>` : ''}
                <label class="ck-habeas ck-habeas--step2">
                    <input type="checkbox" data-action="habeas" ${_habeas ? 'checked' : ''}>
                    <span>Autorizo el tratamiento de mis datos y acepto los <a href="/terminos.html">Términos</a> y la <a href="/privacidad.html">Política de privacidad</a> (derecho de retracto: 5 días hábiles).</span>
                </label>
                <div class="ck-step-footer">
                    <button type="button" class="btn-aqua ck-back" data-action="step-prev">← Volver</button>
                    <button type="submit" class="btn-aqua btn-aqua-emerald ck-cta">
                        ${cfg.permitePagoOnline ? 'Continuar al pago' : 'Continuar'}
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
                    </button>
                </div>
            </form>
        </div>`;
}

// ═══════════════════════════════════════════════════════════════════
// 4. STEP 3 — PAYMENT
// ═══════════════════════════════════════════════════════════════════
const PAYMENT_OPTIONS = [
    {
        k: 'whatsapp',
        t: 'Coordinar por WhatsApp',
        d: 'Hablas directo con Kary, eliges el método de pago y los plazos.',
        icon: html`<path d="M20.5 3.5A11 11 0 0 0 3.4 17l-1.4 5.1 5.2-1.4A11 11 0 1 0 20.5 3.5z"/><path d="M8 10.5c.3 2 2 3.7 4 4.2 1 .3 1.9.1 2.5-.5"/>`,
        primary: true,
    },
    {
        k: 'transferencia',
        t: 'Transferencia bancaria',
        d: 'Bancolombia o Davivienda. Te enviamos los datos por correo.',
        icon: html`<path d="M3 9h18v11H3z"/><path d="M3 9l9-6 9 6"/>`,
    },
    {
        k: 'asesor',
        t: 'Que un asesor me llame',
        d: 'Preferimos hablar antes de avanzar. Te llamamos en menos de 4 horas hábiles.',
        icon: html`<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>`,
    },
];

// Wompi F2: opción de cobro inmediato — solo se ofrece si hay 1 pieza elegible y el flag está ON.
const WOMPI_OPTION = {
    k: 'wompi',
    t: 'Pagar ahora con tarjeta',
    d: 'Pago inmediato y seguro con Wompi (Visa · Mastercard).',
    icon: html`<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>`,
    primary: true,
};

function renderStepPayment(rows) {
    const { subtotal } = computeTotals(rows);
    const cfg = getEnvioConfig(_tipoEntrega);
    // Wompi F2 + TODO-63: "Pagar ahora" SOLO si el tipo de entrega permite pago online (internacional NO),
    // 1 pieza · 1 UNIDAD y el flag ON (el server RE-VALIDA igual).
    // A.1: exige qty===1 y evalúa la elegibilidad contra el PRECIO de la pieza (lo que el server cobra),
    // NO el subtotal (precio×qty). Con qty>1 el subtotal prometía N piezas pero el server cobra/reserva 1.
    const unaUnidad = rows.length === 1 && (rows[0].qty || 1) === 1;
    const elegibleWompi = WOMPI_WEB_ENABLED && cfg.permitePagoOnline && unaUnidad
        && wompiEligible(rows[0].piece, Number(rows[0].piece?.price) || 0);
    // Internacional: el cierre es por WhatsApp (Términos) → solo esa opción.
    const opciones = !cfg.permitePagoOnline
        ? PAYMENT_OPTIONS.filter(o => o.k === 'whatsapp')
        : (elegibleWompi ? [WOMPI_OPTION, ...PAYMENT_OPTIONS] : PAYMENT_OPTIONS);
    if (!opciones.some(o => o.k === _payment)) { _payment = opciones[0].k; _payFocus = false; }   // método válido para este tipo
    const esWompi = _payment === 'wompi';
    const focus = _payFocus && esWompi && elegibleWompi;   // TODO-63: "Pagar ahora" enfocado → oculta los otros (con escape)
    const visibles = focus ? opciones.filter(o => o.k === 'wompi') : opciones;
    return html`
        <div class="ck-step-body">
            <h3 class="ck-step-title">${focus ? 'Pago seguro' : 'Cómo quieres avanzar'}</h3>
            ${focus
                ? html`<button type="button" class="ck-pay-change" data-action="pay-back">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
                        Cambiar método de pago
                    </button>`
                : html`<p class="ck-step-lead">
                        Las piezas Bersaglio son únicas y de alto valor: cerramos cada compra
                        en conversación. Elige cómo prefieres coordinar.
                    </p>`}

            <div class="ck-payment-list">
                ${visibles.map(opt => html`
                    <label class="glass ck-payment ${_payment === opt.k ? 'is-active' : ''}"
                           data-action="payment"
                           data-key="${escape(opt.k)}">
                        <input type="radio" name="payment" value="${escape(opt.k)}" ${_payment === opt.k ? 'checked' : ''} class="ck-payment-radio">
                        <div class="ck-payment-icon">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">${opt.icon}</svg>
                        </div>
                        <div class="ck-payment-body">
                            <div class="ck-payment-title">${escape(opt.t)}</div>
                            <div class="ck-payment-desc">${escape(opt.d)}</div>
                        </div>
                    </label>`)}
            </div>

            ${esWompi ? html`
            <div class="ck-pay-legal">
                <p class="ck-pay-note">Pago seguro con Wompi (en su página segura). El cargo aparecerá a nombre de Bersaglio (Diana M. Niño M.) en tu extracto. El precio es el valor final en pesos colombianos; no incluye IVA. Tienes 5 días hábiles de retracto (salvo piezas a la medida).</p>
            </div>` : ''}

            <div class="ck-step-footer">
                <button type="button" class="btn-aqua ck-back" data-action="step-prev">← Volver</button>
                <button type="button" class="btn-aqua btn-aqua-emerald ck-cta ck-confirm" data-action="confirm">
                    ${esWompi ? 'Pagar ahora' : 'Confirmar'} · ${escape(format$(subtotal))}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
                </button>
            </div>
        </div>`;
}

// ═══════════════════════════════════════════════════════════════════
// 5. SIDEBAR SUMMARY
// ═══════════════════════════════════════════════════════════════════
function renderSummary(rows) {
    const { subtotal, totalQty } = computeTotals(rows);
    return html`
        <aside class="glass glass-emerald ck-summary">
            <div class="eyebrow ck-summary-eyebrow">Resumen</div>
            <div class="ck-summary-lines">
                <div class="ck-summary-row">
                    <span>Subtotal · ${totalQty} ${totalQty === 1 ? 'pieza' : 'piezas'}</span>
                    <span class="mono">${escape(format$(subtotal))}</span>
                </div>
                <div class="ck-summary-row">
                    <span>Envío asegurado</span>
                    <span class="mono">Cotizar</span>
                </div>
            </div>
            <div class="ck-summary-divider"></div>
            <div class="ck-summary-total">
                <span class="ck-summary-total-label">Total</span>
                <span class="mono ck-summary-total-val">${escape(format$(subtotal))}</span>
            </div>
            <div class="ck-summary-note">
                El precio mostrado es el valor final en pesos colombianos. El costo del
                envío se calcula según el destino y se confirma antes de despachar; los
                envíos internacionales se coordinan con un asesor por WhatsApp.
            </div>
        </aside>`;
}

// ═══════════════════════════════════════════════════════════════════
// PAGE LAYOUT
// ═══════════════════════════════════════════════════════════════════
function renderHeader() {
    return html`
        <header class="ck-header">
            <div class="eyebrow">Checkout</div>
            <h1 class="ck-title">Finalizar <span class="italic emerald-text">compra</span></h1>
        </header>`;
}

function renderStepBody(rows) {
    if (_step === 1) return renderStepCart(rows);
    if (_step === 2) return renderStepShipping();
    return renderStepPayment(rows);
}

function renderAll() {
    const rows = joinCart();
    return html`
        <div class="container ck-page">
            ${renderHeader()}
            ${renderStepper(rows)}
            <div class="ck-grid">
                <div class="glass ck-card">${renderStepBody(rows)}</div>
                ${rows.length > 0 ? renderSummary(rows) : ''}
            </div>
        </div>`;
}

function refresh() {
    const main = document.getElementById('main-content');
    if (!main) return;
    main.innerHTML = renderAll();
}

// ═══════════════════════════════════════════════════════════════════
// HANDLERS
// ═══════════════════════════════════════════════════════════════════

function goToStep(n) {
    const oldStep = _step;
    _step = Math.max(1, Math.min(3, n));
    refresh();
    
    // Trigger begin_checkout event when user proceeds to Step 2 (shipping)
    if (_step === 2 && oldStep === 1) {
        try {
            const rows = joinCart();
            const { subtotal } = computeTotals(rows);
            trackBeginCheckout(rows, subtotal);
        } catch (err) {
            console.warn('[carrito] begin_checkout tracking failed:', err);
        }
    }
    
    requestAnimationFrame(() => {
        document.querySelector('.ck-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
}

function buildWhatsAppCheckoutURL(rows) {
    // WhatsApp desde la FUENTE ÚNICA (siteContent/global.contacto); fallback = default real.
    const waBase = waHref(mergeGlobal(data.getSiteContent('global')).contacto.whatsapp);
    const lines = rows.map(r => {
        const name = r.piece?.name || r.slug;
        const url  = `${pieceAbsUrl(r.slug)}`;
        const px   = format$(r.piece?.price);
        return `• ${name} × ${r.qty}\n  ${px}\n  ${url}`;
    });
    const ship = _shipping;
    const shipInfo = (ship.firstName || ship.address)
        ? `\n\nEnvío a:\n${ship.firstName} ${ship.lastName}\n${ship.address}, ${ship.city}, ${ship.country} ${ship.zip || ''}\n${ship.email} · ${ship.phone}`
        : '';
    const { subtotal } = computeTotals(rows);
    const msg = `Hola Bersaglio, quiero coordinar la compra de estas piezas:\n\n${lines.join('\n\n')}\n\nSubtotal: ${format$(subtotal)}${shipInfo}`;
    return `${waBase}?text=${encodeURIComponent(msg)}`;
}

async function confirmOrder(rows) {
    // Wompi F2: cobro inmediato (1 pieza). La VERDAD del pago la da el webhook → gracias.html lee el estado.
    if (_payment === 'wompi') {
        if (!_habeas) { alert('Para pagar en línea, primero autoriza el tratamiento de tus datos.'); return; }
        const piece = rows[0] && rows[0].piece;
        if (!piece || !piece.id) { alert('No pudimos identificar la pieza. Intenta de nuevo o escríbenos por WhatsApp.'); return; }
        // Bloqueo INMEDIATO + estado visible: el inicio (CF) + carga del Widget tardan unos segundos;
        // sin feedback el cliente cree que no respondió y vuelve a hacer clic (doble intento).
        const btn = document.querySelector('.ck-confirm');
        if (btn) {
            btn.setAttribute('disabled', '');
            btn.setAttribute('aria-busy', 'true');
            btn.classList.add('is-loading');
            btn.textContent = 'Procesando…';
        }
        try {
            await pagarConWompi({ pieceId: piece.id, shipping: _shipping, tipoEntrega: _tipoEntrega, habeas: { aceptado: _habeas, version: LEGAL_CONSENT_VERSION }, redirectBase: location.origin });
            // El Widget redirige a gracias.html?ref= si pagó; si solo se cerró (canceló), restauramos el botón.
            refresh();
        } catch (err) {
            console.error('[carrito] wompi:', err);
            alert((err && err.message) || 'No se pudo iniciar el pago. Intenta de nuevo o escríbenos por WhatsApp.');
            refresh();   // re-render del paso → botón habilitado de nuevo
        }
        return;
    }
    const { subtotal } = computeTotals(rows);
    const ship = _shipping;
    const itemsList = rows.map(r => `${r.piece?.name || r.slug} × ${r.qty}`).join(', ');

    const payload = {
        name:    `${ship.firstName} ${ship.lastName}`.trim() || 'Compra sin shipping',
        email:   ship.email || '',
        phone:   ship.phone || '',
        message: `[Pedido ${_payment}] ${itemsList} · Subtotal ${format$(subtotal)} · Envío: ${ship.address}, ${ship.city}, ${ship.country}`.trim(),
        pieceSlug: rows[0]?.slug || null,
        source:  `carrito-${_payment}`,
    };

    // Track Purchase event for GA4 and Facebook Meta Pixel
    try {
        trackPurchase(rows, subtotal, _payment);
    } catch (err) {
        console.warn('[carrito] purchase tracking failed:', err);
    }

    if (_payment === 'whatsapp') {
        const url = buildWhatsAppCheckoutURL(rows);
        saveInquiry(payload).catch(err => console.warn('[carrito] saveInquiry whatsapp:', err));
        // Open WhatsApp in a new tab; keep the cart so the user can come back if needed.
        window.open(url, '_blank', 'noopener');
        return;
    }

    // For transferencia / asesor: save inquiry, clear cart, send to gracias
    try {
        await saveInquiry(payload);
    } catch (err) {
        console.warn('[carrito] saveInquiry failed:', err);
    }
    cart.clear();
    clearShipping();
    location.href = `/gracias.html?method=${encodeURIComponent(_payment)}`;
}

function onMainClick(e) {
    const btn = e.target.closest('[data-action]');
    if (!btn || btn.hasAttribute('disabled')) return;
    const action = btn.dataset.action;
    const slug = btn.dataset.slug;

    if (action === 'step') {
        e.preventDefault();
        const n = Number(btn.dataset.step);
        if (Number.isNaN(n)) return;
        // Only allow forward if cart non-empty
        if (cart.count() === 0 && n > 1) return;
        if (n > _step) return;   // futuro solo por el camino validado (espejo del disabled del render)
        goToStep(n);
        return;
    }
    // step-next solo existe en el paso 1 ("Continuar al envío"); 2→3 va por el submit validado del form.
    if (action === 'step-next') { e.preventDefault(); if (_step === 1) goToStep(2); return; }
    if (action === 'step-prev') { e.preventDefault(); goToStep(_step - 1); return; }

    if (action === 'inc' && slug) {
        const it = cart.get(slug);
        cart.updateQty(slug, (it?.qty || 1) + 1);
        return;
    }
    if (action === 'dec' && slug) {
        const it = cart.get(slug);
        cart.updateQty(slug, (it?.qty || 1) - 1);
        return;
    }
    if (action === 'remove' && slug) {
        cart.remove(slug);
        return;
    }

    if (action === 'tipo-entrega') {
        e.preventDefault();
        _tipoEntrega = btn.dataset.tipo;
        refresh();   // re-render: cambia campos del form + elegibilidad de pago (getEnvioConfig)
        return;
    }
    if (action === 'payment') {
        e.preventDefault();
        _payment = btn.dataset.key;
        _payFocus = (_payment === 'wompi');   // TODO-63: elegir "Pagar ahora" enfoca (oculta los otros métodos)
        refresh();
        return;
    }
    if (action === 'pay-back') {   // TODO-63: "Cambiar método de pago" → vuelve a mostrar todos
        e.preventDefault();
        _payFocus = false;
        refresh();
        return;
    }
    if (action === 'habeas') { _habeas = !!btn.checked; return; }   // checkbox: NO preventDefault (toggle nativo)

    if (action === 'confirm') {
        e.preventDefault();
        const rows = joinCart();
        if (rows.length === 0) return;
        confirmOrder(rows);
    }
}

function onMainInput(e) {
    if (e.target && e.target.dataset && e.target.dataset.action === 'habeas') { _habeas = !!e.target.checked; return; }
    const form = e.target.closest('form[data-form="shipping"]');
    if (!form) return;
    const name = e.target.name;
    if (!name || !(name in _shipping)) return;
    _shipping[name] = e.target.value;
    saveShipping();
}

function onMainSubmit(e) {
    const form = e.target.closest('form[data-form="shipping"]');
    if (!form) return;
    e.preventDefault();
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    if (!_habeas) {   // TODO-63: consentimiento (Habeas Data + Términos) obligatorio al final de Entrega (Ley 1581)
        alert('Para continuar, autoriza el tratamiento de tus datos y acepta los Términos.');
        return;
    }
    // Capture form values once more (defensive — input events may miss change in autofill)
    new FormData(form).forEach((v, k) => {
        if (k in _shipping) _shipping[k] = String(v);
    });
    saveShipping();
    goToStep(3);
}

export async function init() {
    const main = document.getElementById('main-content');
    if (!main) return;

    loadShipping();

    // Kick off Firestore (cart items reference pieces by slug)
    data.load().catch(() => {});

    refresh();

    main.addEventListener('click', onMainClick);
    main.addEventListener('input',  onMainInput);
    main.addEventListener('change', onMainInput);
    main.addEventListener('submit', onMainSubmit);

    // Re-render on cart/data updates
    cart.onChange(() => {
        if (cart.count() === 0 && _step > 1) _step = 1;
        refresh();
    });
    data.onChange(refresh);
}

export default { init };
