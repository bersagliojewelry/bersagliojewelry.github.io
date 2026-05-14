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
        title: 'Recibido. Tu pedido <span class="italic emerald-text">va en camino</span>.',
        body: 'En las próximas horas hábiles te enviaremos los datos bancarios y el detalle de tu pedido por correo. Una vez recibida la transferencia, agendaremos el envío con seguro pleno por DHL Express o FedEx Priority.',
        nextLabel: 'En menos de 24 horas hábiles',
    },
    asesor: {
        eyebrow: 'ASESOR EN CAMINO',
        title: 'Te <span class="italic emerald-text">llamamos</span> pronto.',
        body: 'Kary o alguien del equipo te contactará en menos de cuatro horas hábiles. Te haremos preguntas de contexto, te enviaremos referencias visuales y, si todo encaja, agendaremos una visita o videollamada.',
        nextLabel: 'En menos de 4 horas hábiles',
    },
    visita: {
        eyebrow: 'VISITA AGENDADA',
        title: 'Te esperamos en <span class="italic emerald-text">Cartagena</span>.',
        body: 'Confirmaremos por WhatsApp el día y la hora exacta de tu cita. Llega cinco minutos antes; el café estará listo, y Kary te recibirá personalmente.',
        nextLabel: 'Confirmación por WhatsApp en horas',
    },
    llamada: {
        eyebrow: 'LLAMADA RESERVADA',
        title: 'Te <span class="italic emerald-text">llamamos</span> en la franja que indicaste.',
        body: 'Si no respondes en el primer intento, lo intentaremos una segunda vez. Si prefieres reagendar, contesta con un mensaje de WhatsApp y proponemos una nueva franja.',
        nextLabel: 'En menos de 4 horas hábiles',
    },
    mensaje: {
        eyebrow: 'MENSAJE RECIBIDO',
        title: 'Lo recibimos. <span class="italic emerald-text">Te respondemos</span> pronto.',
        body: 'Cada mensaje lo lee Kary o alguien del equipo en persona. Sin chatbots, sin filtros automáticos. Mientras tanto, puedes seguirnos en Instagram para ver lo que sale del atelier esta semana.',
        nextLabel: 'En menos de 24 horas hábiles',
    },
    default: {
        eyebrow: 'GRACIAS',
        title: 'Te <span class="italic emerald-text">escribimos</span> pronto.',
        body: 'Hemos recibido tu solicitud. En las próximas horas hábiles te contactaremos. Mientras tanto, explora el catálogo o lee algo del journal.',
        nextLabel: 'En menos de 24 horas hábiles',
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
