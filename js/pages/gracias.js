/**
 * Bersaglio Jewelry — Gracias (confirmación de consulta o compra).
 *
 * URL: /gracias.html
 * Query params reconocidos:
 *   ?method=transferencia  → mensaje específico transferencia bancaria
 *   ?method=asesor         → mensaje específico esperar llamada
 *   ?method=mensaje        → mensaje genérico de consulta
 *   ?method=visita         → mensaje específico de visita
 *   ?method=llamada        → mensaje específico de llamada
 *   (sin method)           → mensaje genérico
 *
 * Layout: hero centrado con icono ✓ animado + título personalizado +
 * mensaje contextual + 2 CTAs (Volver a colecciones / Explorar journal).
 */

import { html, escape, mount } from '../core/html.js';
import { mergeGlobal, waLink } from '../core/global-defaults.js';   // §164: CTA WhatsApp (concierge, sin cuenta)

const MESSAGES = {
    transferencia: {
        eyebrow: 'TRANSFERENCIA BANCARIA',
        title: 'Una elección excepcional. Iniciamos la creación de tu <span class="italic emerald-text">pieza</span>.',
        body: 'En las próximas horas te enviaremos el detalle y la confirmación de tu encargo por correo privado. Al confirmarse la transferencia bancaria, nuestro atelier dará inicio a la confección y coordinaremos el envío asegurado.',
        nextLabel: 'Bitácora enviada en menos de 24 horas hábiles',
    },
    asesor: {
        eyebrow: 'ASESOR PRIVADO',
        title: 'Un encuentro en la distancia. Te <span class="italic emerald-text">llamamos</span> pronto.',
        body: 'Kary Mendoza o un gemólogo del atelier se comunicará contigo de forma confidencial en menos de cuatro horas. Compartiremos referencias, responderemos tus dudas y agendaremos, si lo deseas, una videollamada o cita presencial.',
        nextLabel: 'Contacto en menos de 4 horas hábiles',
    },
    visita: {
        eyebrow: 'CITA PRIVADA CONCERTADA',
        title: 'Cartagena de Indias te espera. El café <span class="italic emerald-text">estará listo</span>.',
        body: 'Confirmaremos tu cita privada de forma directa. El atelier estará cerrado exclusivamente para ti; Kary Mendoza te recibirá personalmente en Casa San Agustín.',
        nextLabel: 'Confirmación directa en pocas horas',
    },
    llamada: {
        eyebrow: 'LLAMADA CONFIDENCIAL RESERVADA',
        title: 'Conversación de <span class="italic emerald-text">intención</span>.',
        body: 'Nos comunicaremos en el horario solicitado para iniciar un diálogo pausado. Si prefieres reprogramar por WhatsApp o cambiar de vía de contacto, estamos enteramente a tu disposición.',
        nextLabel: 'Te llamamos en el horario solicitado',
    },
    mensaje: {
        eyebrow: 'CONFIDENCIA RECIBIDA',
        title: 'Agradecemos tu confianza. Te <span class="italic emerald-text">respondemos</span> en persona.',
        body: 'Tu mensaje es atendido de forma confidencial y directa por Kary Mendoza o un especialista del atelier. Prescindimos de asistentes virtuales; valoramos el tiempo y el trato humano.',
        nextLabel: 'Respuesta en menos de 24 horas hábiles',
    },
    pago: {
        eyebrow: 'PAGO RECIBIDO',
        title: 'Gracias. Estamos <span class="italic emerald-text">confirmando</span> tu pago.',
        body: 'Recibimos tu pago a través de Wompi. En cuanto se confirme —normalmente en segundos— te enviaremos la confirmación y los siguientes pasos por correo y WhatsApp. Si elegiste recoger en el atelier de Cartagena, coordinaremos tu cita; si es envío, gestionamos la guía. Tu pieza queda reservada a tu nombre.',
        nextLabel: 'Confirmación y siguientes pasos en breve',
    },
    default: {
        eyebrow: 'CORTESÍA BERSAGLIO',
        title: 'Te <span class="italic emerald-text">escribimos</span> de manera directa.',
        body: 'Hemos recibido tu solicitud. Un gemólogo de nuestro atelier se pondrá en contacto contigo a la brevedad. Mientras tanto, te invitamos a explorar el catálogo o leer el Journal.',
        nextLabel: 'Contacto en menos de 24 horas hábiles',
    },
};

function getMethodFromURL() {
    const p = new URL(location.href).searchParams;
    if (p.get('ref') || p.get('id')) return 'pago';   // retorno del Web Checkout de Wompi (redirect)
    return p.get('method') || 'default';
}

// ─── §164: estado REAL del pago (gate A.9, hallazgo del dueño) ────────────────
// El retorno de Wompi trae ?id=<txId>. Antes la página decía "PAGO RECIBIDO · confirmando" SIEMPRE
// — también con el pago RECHAZADO. Ahora consulta la transacción real y habla claro. El comprador es
// INVITADO (sin cuenta): su comprobante es el número de pedido (sessionStorage, lo dejó pago-web.js)
// y el seguimiento es concierge (WhatsApp con Kary). Fail-open: sin respuesta → mensaje neutro actual.

/** PURA (testeada): estado de la transacción → mensaje honesto. null = mantener el neutro "confirmando". */
export function mensajePorEstadoTx(status, numero) {
    const n = Number(numero) > 0 ? Number(numero) : null;
    if (status === 'APPROVED') {
        return {
            eyebrow: 'PAGO CONFIRMADO',
            title: 'Confirmado. Tu pieza queda <span class="italic emerald-text">reservada</span> a tu nombre.',
            body: `Wompi confirmó tu pago${n ? ` del pedido #${n}` : ''}.${n ? ` Guarda ese número: es tu comprobante.` : ''} Te contactaremos por correo y WhatsApp para coordinar la entrega — si elegiste recoger en el atelier de Cartagena, agendamos tu cita; si es envío, gestionamos la guía asegurada.`,
            nextLabel: n ? `Tu comprobante: pedido #${n}` : 'Pago confirmado',
            tone: 'ok',
            wa: `Hola, acabo de pagar en la web de Bersaglio${n ? ` (pedido #${n})` : ''} y quiero coordinar la entrega.`,
        };
    }
    if (status === 'DECLINED' || status === 'ERROR' || status === 'VOIDED') {
        return {
            eyebrow: 'PAGO NO COMPLETADO',
            title: 'Tu banco no aprobó el pago. <span class="italic emerald-text">Nada</span> fue debitado.',
            body: 'La entidad emisora rechazó la transacción y no se debitó dinero de tu cuenta. Tu pieza sigue apartada unos minutos a tu nombre: puedes reintentar el pago de inmediato (con la misma u otra tarjeta) o escribirnos por WhatsApp y lo resolvemos contigo en persona.',
            nextLabel: 'La pieza sigue apartada — puedes reintentar ya',
            tone: 'warn',
            retry: true,
            wa: 'Hola, intenté pagar en la web de Bersaglio y mi banco rechazó el pago. ¿Me ayudan a completar la compra?',
        };
    }
    return null;   // PENDING u otro → el neutro "estamos confirmando" es el mensaje correcto
}

function ultimoPago() {
    try { return JSON.parse(sessionStorage.getItem('bj-ultimo-pago') || 'null') || {}; } catch { return {}; }
}

async function consultarTx(txId, env, publicKey) {
    const base = env === 'test' ? 'https://sandbox.wompi.co/v1' : 'https://production.wompi.co/v1';
    const intentos = publicKey
        ? [{ headers: { Authorization: `Bearer ${publicKey}` } }, {}]
        : [{}];
    for (const opts of intentos) {
        try {
            const r = await fetch(`${base}/transactions/${encodeURIComponent(txId)}`, opts);
            if (!r.ok) continue;
            const j = await r.json();
            if (j?.data?.status) return j.data.status;
        } catch { /* red caída → fail-open */ }
    }
    return null;
}

function renderAll(msg) {
    const warn = msg.tone === 'warn';
    const wa = msg.wa ? waLink(mergeGlobal(null).contacto.whatsapp, msg.wa) : null;
    return html`
        <div class="container lg-page lg-page--gracias">
            <section class="lg-hero">
                <div class="lg-check" aria-hidden="true" ${warn ? 'style="background:oklch(62% 0.13 60)"' : ''}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5">
                        ${warn ? html`<path d="M12 6v7"/><circle cx="12" cy="17.5" r="0.5" fill="#fff"/>` : html`<path d="M20 6L9 17l-5-5"/>`}
                    </svg>
                </div>
                <div class="mono lg-eyebrow">${escape(msg.eyebrow)}</div>
                <h1 class="lg-title">${msg.title}</h1>
                <p class="lg-body">${escape(msg.body)}</p>
                <div class="lg-pill" aria-label="Estado">
                    <span class="lg-pill-dot"></span>
                    ${escape(msg.nextLabel)}
                </div>
                <div class="lg-actions">
                    ${msg.retry ? html`<a href="/carrito.html" class="btn-aqua btn-aqua-emerald">Reintentar el pago</a>` : ''}
                    ${wa ? html`<a href="${escape(wa)}" class="btn-aqua ${msg.retry ? '' : 'btn-aqua-emerald'}" target="_blank" rel="noopener">Escribir por WhatsApp</a>` : ''}
                    ${msg.retry ? '' : html`<a href="/colecciones.html" class="btn-aqua ${wa ? '' : 'btn-aqua-emerald'}">Ver colecciones</a>`}
                    <a href="/journal.html" class="btn-aqua">Leer el Journal</a>
                </div>
            </section>
        </div>`;
}

export async function init() {
    const main = document.getElementById('main-content');
    if (!main) return;
    const method = getMethodFromURL();
    const msg = MESSAGES[method] || MESSAGES.default;
    mount(main, renderAll(msg));

    // §164: al volver de Wompi (?id=…), consultar el estado REAL y re-pintar honesto (aprobado /
    // rechazado-reintenta). Sin respuesta (red/401) se queda el neutro "confirmando" — fail-open.
    const p = new URL(location.href).searchParams;
    const txId = p.get('id');
    if (method !== 'pago' || !txId) return;
    const stash = ultimoPago();
    const status = await consultarTx(txId, p.get('env'), stash.publicKey);
    const real = mensajePorEstadoTx(status, stash.numero);
    if (real) mount(main, renderAll(real));
}

export default { init };
