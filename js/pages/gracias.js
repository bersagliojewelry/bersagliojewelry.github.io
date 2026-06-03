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

import { html, escape } from '../core/html.js';

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
    default: {
        eyebrow: 'CORTESÍA BERSAGLIO',
        title: 'Te <span class="italic emerald-text">escribimos</span> de manera directa.',
        body: 'Hemos recibido tu solicitud. Un gemólogo de nuestro atelier se pondrá en contacto contigo a la brevedad. Mientras tanto, te invitamos a explorar el catálogo o leer el Journal.',
        nextLabel: 'Contacto en menos de 24 horas hábiles',
    },
};

function getMethodFromURL() {
    return new URL(location.href).searchParams.get('method') || 'default';
}

function renderAll(msg) {
    return html`
        <div class="container lg-page lg-page--gracias">
            <section class="lg-hero">
                <div class="lg-check" aria-hidden="true">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5">
                        <path d="M20 6L9 17l-5-5"/>
                    </svg>
                </div>
                <div class="mono lg-eyebrow">${escape(msg.eyebrow)}</div>
                <h1 class="lg-title">${msg.title}</h1>
                <p class="lg-body">${escape(msg.body)}</p>
                <div class="lg-pill" aria-label="Tiempo estimado">
                    <span class="lg-pill-dot"></span>
                    ${escape(msg.nextLabel)}
                </div>
                <div class="lg-actions">
                    <a href="/colecciones.html" class="btn-aqua btn-aqua-emerald">Ver colecciones</a>
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
    main.innerHTML = renderAll(msg);
}

export default { init };
