/**
 * Bersaglio Jewelry — Política de privacidad.
 *
 * URL: /privacidad.html
 *
 * Layout: igual al de terminos.js pero con secciones de privacidad/datos personales.
 * Cumple con Ley 1581 de 2012 (protección de datos en Colombia) + buenas prácticas
 * GDPR para visitantes europeos.
 */

import { html, escape } from '../core/html.js';

const LAST_UPDATE = '2026-04-12';
const SECTIONS = [
    {
        id: 'compromiso',
        n: '01',
        title: 'Nuestro compromiso',
        body: `Bersaglio Jewelry trata tus datos personales con el mismo cuidado con el que tratamos una esmeralda Muzo Vieja: con paciencia, con discreción, y con la certeza de que cada decisión sobre tu información debe pasar primero por la pregunta "¿esto es necesario para servirte mejor?".

Esta política explica qué datos recolectamos, por qué, cómo los protegemos y qué derechos tienes sobre ellos.`,
    },
    {
        id: 'responsable',
        n: '02',
        title: 'Responsable del tratamiento',
        body: `Bersaglio Jewelry S.A.S., NIT en proceso de actualización, con domicilio en Calle 36 # 6-32, San Agustín Chiquita, Centro Histórico, Cartagena de Indias, Bolívar, Colombia.

Contacto del responsable: hola@bersagliojewelry.com · WhatsApp +57 310 813 6829.`,
    },
    {
        id: 'datos-recolectados',
        n: '03',
        title: 'Datos que recolectamos',
        body: `Datos de contacto: nombre, apellido, correo electrónico, número de teléfono o WhatsApp, dirección postal.

Datos de pedido: piezas que has consultado o adquirido, métodos de pago utilizados (procesados por terceros, nunca almacenamos números de tarjeta), historial de conversaciones por WhatsApp o correo.

Datos de navegación: páginas visitadas en bersagliojewelry.co, tiempo en cada página, dispositivo y navegador usados, IP aproximada (recolectados vía cookies y Google Analytics si has aceptado el consentimiento de cookies).

Datos opcionales: cualquier información adicional que decidas compartir al contactarnos (presupuesto orientativo, ocasión, gemas de tu interés, gemas heredadas que quieras integrar).`,
    },
    {
        id: 'finalidad',
        n: '04',
        title: 'Finalidad del tratamiento',
        body: `Atender tus solicitudes de información, asesoría o compra. Procesar pedidos y coordinar envíos. Enviarte el newsletter mensual del Atelier si te has suscrito (con derecho a cancelar en cualquier momento desde el enlace en cada correo).

Mejorar nuestro servicio: analizamos datos agregados de navegación para entender qué piezas atraen más interés, qué páginas se leen más, qué dudas suelen surgir. Nunca usamos datos individuales para perfilamiento publicitario.`,
    },
    {
        id: 'compartir',
        n: '05',
        title: 'Con quién compartimos tus datos',
        body: `Nunca vendemos ni cedemos tus datos a terceros con fines comerciales.

Compartimos información estrictamente necesaria con: empresas de mensajería (DHL, FedEx, Servientrega) para coordinar envíos; pasarelas de pago (Wompi, link de pago bancario) cuando realizas una compra; servicios técnicos (Firebase de Google, Brevo para correo transaccional) que alojan o procesan datos bajo acuerdos de confidencialidad y conformidad con regulación de protección de datos.

En el caso de autoridades judiciales o regulatorias, cumpliremos con cualquier solicitud formal y debidamente notificada por estos canales.`,
    },
    {
        id: 'derechos',
        n: '06',
        title: 'Tus derechos',
        body: `Tienes derecho a conocer, actualizar, rectificar y suprimir tus datos personales en cualquier momento. Para ejercer estos derechos, escribe a hola@bersagliojewelry.com con asunto "Datos personales" y te responderemos en máximo 10 días hábiles.

También puedes solicitar una copia de toda la información que tenemos sobre ti, oponerte al uso de cookies analíticas, o revocar tu suscripción al newsletter desde cualquier correo que recibas. Ningún ejercicio de derechos afecta el servicio que prestamos.`,
    },
    {
        id: 'cookies',
        n: '07',
        title: 'Cookies',
        body: `Usamos cookies estrictamente necesarias (para que el sitio funcione, recordar tu carrito y lista de deseos) y cookies analíticas opcionales (Google Analytics) que solo se activan tras tu consentimiento explícito en el banner.

Puedes rechazar las cookies opcionales sin afectar tu experiencia. El banner aparece en tu primera visita; tu decisión queda guardada localmente en tu navegador.`,
    },
    {
        id: 'seguridad',
        n: '08',
        title: 'Seguridad',
        body: `Todos los datos viajan cifrados (HTTPS / TLS 1.3) y se almacenan en infraestructura de Google Cloud con cifrado en reposo. Los accesos al panel administrativo requieren autenticación multifactor.

Nunca almacenamos números completos de tarjetas de crédito; las pasarelas de pago manejan esa información bajo certificación PCI-DSS.`,
    },
    {
        id: 'menores',
        n: '09',
        title: 'Menores de edad',
        body: `Nuestros servicios están dirigidos a personas mayores de 18 años. No recolectamos conscientemente datos de menores de edad. Si detectamos información de un menor, la eliminamos de inmediato.`,
    },
    {
        id: 'cambios',
        n: '10',
        title: 'Cambios a esta política',
        body: `Podemos actualizar esta política para reflejar cambios legales, técnicos o de negocio. La versión vigente es siempre la publicada en esta página, con la fecha de última actualización al inicio. Si hacemos un cambio sustantivo (por ejemplo, agregar un nuevo destinatario de datos), te avisaremos por correo electrónico si te has suscrito.`,
    },
];

function renderTOC() {
    return html`
        <aside class="lg-toc" aria-label="Tabla de contenidos">
            <div class="mono lg-toc-eyebrow">EN ESTA PÁGINA</div>
            <ol class="lg-toc-list">
                ${SECTIONS.map(s => html`
                    <li><a class="lg-toc-link" href="#${escape(s.id)}">
                        <span class="mono lg-toc-num">${escape(s.n)}</span>${escape(s.title)}
                    </a></li>`)}
            </ol>
        </aside>`;
}

function renderSection(s) {
    const paragraphs = String(s.body).split(/\n\s*\n/).filter(Boolean);
    return html`
        <section id="${escape(s.id)}" class="lg-section">
            <div class="lg-section-head">
                <span class="mono lg-section-num">${escape(s.n)}</span>
                <h2 class="lg-section-title">${escape(s.title)}</h2>
            </div>
            <div class="lg-section-body">
                ${paragraphs.map(p => html`<p>${escape(p)}</p>`)}
            </div>
        </section>`;
}

function renderAll() {
    return html`
        <div class="container lg-page">
            <header class="lg-pagehero">
                <div class="mono lg-eyebrow">DOCUMENTACIÓN LEGAL</div>
                <h1 class="lg-pagehero-title">Política de <span class="italic emerald-text">privacidad</span></h1>
                <p class="lg-pagehero-sub">Cómo cuidamos tu información personal. Sin tecnicismos innecesarios. Sin trampas.</p>
                <div class="mono lg-update">Última actualización · ${escape(LAST_UPDATE)}</div>
            </header>

            <div class="lg-layout">
                ${renderTOC()}
                <article class="lg-prose">
                    ${SECTIONS.map(renderSection)}
                </article>
            </div>

            <div class="lg-foot">
                <p>¿Quieres ejercer un derecho sobre tus datos? Escríbenos a <a href="mailto:hola@bersagliojewelry.com">hola@bersagliojewelry.com</a>.</p>
                <a href="/" class="btn-aqua lg-back-btn">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
                    Volver al inicio
                </a>
            </div>
        </div>`;
}

export async function init() {
    const main = document.getElementById('main-content');
    if (!main) return;
    main.innerHTML = renderAll();

    main.addEventListener('click', e => {
        const a = e.target.closest('.lg-toc-link');
        if (!a) return;
        const id = a.getAttribute('href')?.slice(1);
        const target = id && document.getElementById(id);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.replaceState({}, '', `#${id}`);
    });
}

export default { init };
