/**
 * Bersaglio Jewelry — Política de privacidad.
 *
 * URL: /privacidad.html
 *
 * Layout: igual al de terminos.js pero con secciones de privacidad/datos personales.
 * Cumple con Ley 1581 de 2012 (protección de datos en Colombia) + buenas prácticas
 * GDPR para visitantes europeos.
 */

import { html, escape, mount } from '../core/html.js';
import { data } from '../core/data.js';
import { safeUrl } from '../core/safe-url.js';
import { mergeGlobal } from '../core/global-defaults.js';
// El control de preferencias (§07) usa el MISMO dueño del estado que el banner, para que no haya
// dos sitios que escriban la decisión con palabras distintas. Ver `core/consent.js`.
import { getConsent, setConsent, CONSENT_EVENT } from '../core/consent.js';

const LAST_UPDATE = '2026-10-09';
const SECTIONS = [
    {
        id: 'compromiso',
        n: '01',
        title: 'Nuestro compromiso',
        body: `Bersaglio Jewelry trata tus datos personales con el mismo cuidado con el que tratamos una esmeralda: con paciencia, con discreción, y con la certeza de que cada decisión sobre tu información debe pasar primero por la pregunta "¿esto es necesario para servirte mejor?".

Esta política explica qué datos recolectamos, por qué, cómo los protegemos y qué derechos tienes sobre ellos.`,
    },
    {
        id: 'responsable',
        n: '02',
        title: 'Responsable del tratamiento',
        body: `Bersaglio Jewelry es el nombre comercial del establecimiento de comercio de Diana Margarita Niño Mendoza (persona natural comerciante), NIT 32.908.305-6, con domicilio en Calle 36 # 6-32, Centro Histórico, Cartagena de Indias, Bolívar, Colombia.

Contacto del responsable: {{EMAIL}} · WhatsApp {{WA}}.`,
    },
    {
        id: 'datos-recolectados',
        n: '03',
        title: 'Datos que recolectamos',
        body: `Datos de contacto: nombre, apellido, correo electrónico, número de teléfono o WhatsApp, dirección postal.

Datos de pedido: piezas que has consultado o adquirido, métodos de pago utilizados (procesados por terceros, nunca almacenamos números de tarjeta), historial de conversaciones por WhatsApp o correo.

Datos de navegación: páginas visitadas en bersagliojewelry.co, tiempo en cada página, piezas que has mirado, dispositivo y navegador usados, IP aproximada. Se recogen con cookies y con herramientas de medición y de publicidad de Google y de Meta, y únicamente si has aceptado las cookies opcionales.

Datos opcionales: cualquier información adicional que decidas compartir al contactarnos (presupuesto orientativo, ocasión, gemas de tu interés, gemas heredadas que quieras integrar).`,
    },
    {
        id: 'finalidad',
        n: '04',
        title: 'Finalidad del tratamiento',
        body: `Atender tus solicitudes de información, asesoría o compra. Procesar pedidos y coordinar envíos. Enviarte el newsletter mensual del Atelier si te has suscrito (con derecho a cancelar en cualquier momento desde el enlace en cada correo).

Mejorar nuestro servicio: analizamos datos agregados de navegación para entender qué piezas atraen más interés, qué páginas se leen más, qué dudas suelen surgir.

Medir y mostrarte nuestra publicidad, si aceptas las cookies opcionales: Google y Meta —la empresa de Facebook e Instagram— reciben señales de tu visita (las piezas que miraste, si nos escribiste, si completaste una compra) para dos cosas concretas. La primera, saber si nuestros anuncios sirvieron de algo. La segunda, formar los grupos de personas a quienes volvemos a mostrárselos, que en publicidad se llama remarketing. Dicho sin rodeos: la publicidad nuestra que veas puede estar escogida a partir de tu visita a esta página.

Hasta ahora aquí decía que nunca usábamos datos individuales para perfilamiento publicitario. Lo cambiamos porque vamos a empezar a hacerlo, y queremos que lo leas antes de decidir, no después.`,
    },
    {
        id: 'compartir',
        n: '05',
        title: 'Con quién compartimos tus datos',
        body: `Nunca vendemos tus datos: a esta casa no entra un solo peso por entregar información de nadie. Con nuestros proveedores compartimos lo estrictamente necesario para cumplir contigo, y ninguno puede usarlos para ofrecerte sus propias cosas. Hay una excepción, la decides tú y va explicada aparte unas líneas más abajo: si aceptas las cookies opcionales, Google y Meta reciben datos de tu navegación y los usan también en su propio interés publicitario, que puede incluir anuncios que no son nuestros. Lo decimos aquí arriba y no en letra pequeña, porque es la diferencia que más importa.

Compartimos información estrictamente necesaria con: empresas de mensajería (DHL, FedEx, Servientrega) para coordinar envíos; pasarelas de pago (Wompi, link de pago bancario) cuando realizas una compra; servicios técnicos (Firebase de Google, Brevo para correo transaccional) que alojan o procesan datos. Estos proveedores actúan como Encargados del tratamiento: tratan tus datos por cuenta nuestra, siguiendo nuestras instrucciones, bajo acuerdos de confidencialidad y en conformidad con la regulación de protección de datos.

Caso distinto, y por eso va en párrafo aparte: si aceptas las cookies opcionales, Google y Meta reciben datos de tu navegación y los tratan también para sus propios fines, no solo por cuenta nuestra. Esa es la diferencia con los proveedores de arriba, y es la razón de nombrarlos por separado. Son empresas de Estados Unidos, país que figura en la lista de países con nivel adecuado de protección de datos de la Superintendencia de Industria y Comercio. Si rechazas las cookies opcionales, ni Google ni Meta reciben datos de tu navegación, y puedes cambiar de opinión cuando quieras en la sección de cookies de esta misma página. Con una salvedad que preferimos decirte nosotros: las letras con las que está escrita esta página se piden a un servidor de Google cada vez que la abres, así que Google ve desde dónde te conectas, aceptes o no. Eso no lleva identificador, no te reconoce de una visita a otra y no alimenta publicidad; es el precio de usar esas letras, y estamos viendo cómo servirlas desde aquí mismo.

En el caso de autoridades judiciales o regulatorias, cumpliremos con cualquier solicitud formal y debidamente notificada por estos canales.`,
    },
    {
        id: 'derechos',
        n: '06',
        title: 'Tus derechos',
        body: `Tienes derecho a conocer, actualizar, rectificar y suprimir tus datos personales, y a revocar la autorización, en cualquier momento. Para ejercerlos, escribe a {{EMAIL}} con asunto "Datos personales". Atendemos tus consultas en máximo diez (10) días hábiles y tus reclamos en máximo quince (15) días hábiles, prorrogables por ocho (8) días hábiles más informándote el motivo (Ley 1581 de 2012, artículos 14 y 15).

También puedes solicitar una copia de toda la información que tenemos sobre ti, o revocar tu suscripción al newsletter desde cualquier correo que recibas. Para las cookies de medición y de publicidad no hace falta escribirnos: en la sección de cookies de esta misma página hay un control que te dice qué decidiste y te deja cambiarlo en el momento, gratis y sin dar explicaciones. Ningún ejercicio de derechos afecta el servicio que prestamos.

Conservamos tus datos mientras dure nuestra relación contigo y durante los plazos que exijan las normas contables y tributarias; cumplidos esos plazos, los eliminamos o anonimizamos.`,
    },
    {
        id: 'cookies',
        n: '07',
        title: 'Cookies',
        body: `Este sitio no pone ninguna cookie propia. Lo que necesita recordar para funcionar —las piezas de tu carrito, tu lista de deseos y la decisión que tomes aquí mismo sobre las cookies— lo guarda tu navegador en su propia memoria, que se queda en tu aparato. Eso no se puede apagar, y no porque no queramos: sin ello el carrito se te vaciaría al pasar de una página a otra.

Con tu permiso usamos además dos clases opcionales, y conviene distinguirlas porque no se comportan igual. Las de medición, para entender cómo se usa el sitio: Google Analytics está presente desde que entras, pero mientras no aceptes corre en modo restringido, sin escribir una sola cookie y sin ningún identificador que te reconozca de una visita a otra; cuando aceptas, empieza a medir completo. Las de publicidad, que permiten a Google y a Meta medir nuestros anuncios y volver a mostrártelos: esas no se cargan en absoluto hasta que pulses "Aceptar". No es que puedas apagarlas después; es que no llegan a existir en tu visita mientras no las autorices.

Puedes rechazarlas sin que tu experiencia cambie, y puedes cambiar de opinión aquí abajo cuando quieras. Si las rechazas después de haberlas aceptado, avisamos a Google y a Meta y borramos de tu navegador las cookies de identificación que habían dejado. Hasta ahí llega lo que está en nuestras manos: lo que esas dos empresas ya hayan guardado en sus propios sistemas se rige por sus políticas, y para eso tienes que dirigirte a ellas. Tu decisión se guarda en tu propio navegador, así que si lo cambias o borras sus datos, volveremos a preguntártelo. Y eso tiene una consecuencia que preferimos contarte: no llevamos en nuestros servidores un registro de quién aceptó y quién no, porque para llevarlo tendríamos que recoger un dato más de cada visita. La prueba de lo que decidiste vive en tu aparato, con la fecha y la versión de la finalidad que aceptaste.`,
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
        body: `Podemos actualizar esta política para reflejar cambios legales, técnicos o de negocio. La versión vigente es siempre la publicada en esta página, con la fecha de última actualización al inicio. Si hacemos un cambio sustantivo (por ejemplo, agregar un nuevo destinatario de datos), te avisaremos por correo electrónico si te has suscrito.

Y si el cambio afecta para qué usamos tus datos, no basta con avisarlo: te lo volvemos a preguntar. Lo que autorizaste para una finalidad no sirve para otra, así que el aviso de cookies reaparece y tu decisión anterior deja de contar hasta que decidas de nuevo. Es lo que hicimos al publicar la versión de octubre de 2026, la que añadió la publicidad personalizada.`,
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

/**
 * Control de preferencias de cookies — vive DENTRO de §07 porque ahí aterriza el enlace "Cookies"
 * que ya está en el pie de todas las páginas (`components/footer.js`).
 *
 * Existe porque §06 y §07 prometen poder revocar "en cualquier momento" y hasta hoy no había cómo:
 * `initCookieBanner()` se va por la puerta de atrás si ya hay una decisión guardada, así que quien
 * aceptaba una vez no tenía ninguna forma de cambiar de opinión. Una promesa sin mecanismo es un
 * incumplimiento de lo anunciado, no un detalle de UI.
 *
 * Las dos puertas pesan IGUAL a propósito: un "Aceptar" macizo junto a un "Rechazar" descolorido
 * empuja la decisión, y un consentimiento empujado no es libre.
 */
/* La etiqueta lleva SUSTANTIVO a proposito. Quien llega por el enlace del pie cae en el ancla y en
   el telefono puede ver el control sin el parrafo de arriba en pantalla: si solo lee "Hoy estan
   aceptadas" no sabe aceptadas QUE. Y se dice "Ahora mismo" y no "Hoy", que se lee como "solo por
   hoy" — lo contrario de lo que significa (la decision dura hasta que ella la cambie). */
const ETIQUETA_ESTADO = {
    accepted: 'Ahora mismo están aceptadas las cookies de medición y de publicidad.',
    declined: 'Ahora mismo están rechazadas las cookies de medición y de publicidad: no se ha cargado ninguna.',
};
const SIN_DECIDIR = 'Todavía no has decidido sobre las cookies de medición y de publicidad.';
/* Que gana y que pierde al cambiarlo. Sin esto el control le pide una decision sin darle con que
   tomarla, y la duda empuja a no tocar nada. */
const CONTEXTO = 'Rechazarlas no te quita nada: el sitio funciona igual y puedes comprar igual. Aceptarlas nos ayuda a saber qué piezas gustan y a no gastar en anuncios que no le interesan a nadie. Decidas lo que decidas, puedes volver aquí y cambiarlo.';
const estadoHTML = e => html`<span class="lg-cookie-dot" aria-hidden="true"></span>${escape(ETIQUETA_ESTADO[e] || SIN_DECIDIR)}`;
const botonesHTML = e => html`
    ${e !== 'declined' && html`<button type="button" class="lg-cookie-btn" data-consent="declined">Rechazar las opcionales</button>`}
    ${e !== 'accepted' && html`<button type="button" class="lg-cookie-btn" data-consent="accepted">Aceptar las opcionales</button>`}`;

function renderPreferencias() {
    const estado = getConsent();
    return html`
        <div class="lg-cookie-prefs" data-estado="${escape(estado || 'pendiente')}">
            <p class="lg-cookie-state">${estadoHTML(estado)}</p>
            <p class="lg-cookie-contexto">${escape(CONTEXTO)}</p>
            <div class="lg-cookie-btns">${botonesHTML(estado)}</div>
            <p class="lg-cookie-note" role="status" aria-live="polite"></p>
        </div>`;
}

/**
 * Repinta el control EN SITIO tras un cambio. Deliberadamente no se repinta la página entera (se
 * perdería la posición de lectura) ni se reemplaza el `<p aria-live>`: una región live recién
 * insertada en el DOM no se anuncia, así que el nodo tiene que SOBREVIVIR al cambio para que el
 * lector de pantalla lea la confirmación.
 */
function actualizarPreferencias(caja) {
    const estado = getConsent();
    caja.dataset.estado = estado || 'pendiente';
    const linea = caja.querySelector('.lg-cookie-state');
    if (linea) linea.innerHTML = estadoHTML(estado);
    const botones = caja.querySelector('.lg-cookie-btns');
    if (botones) botones.innerHTML = botonesHTML(estado);
    const nota = caja.querySelector('.lg-cookie-note');
    if (!nota) return;
    if (estado === 'accepted') {
        nota.textContent = 'Listo. A partir de ahora podemos medir tu visita y mostrarte nuestros anuncios, y puedes cambiarlo aquí mismo cuando quieras.';
    } else if (estado === 'declined') {
        nota.textContent = 'Listo. No se enviará nada más, y hemos borrado las cookies de identificación que Google y Meta habían dejado en tu navegador. Si quieres asegurarte de que tampoco quedan sus programas cargados en esta página, recárgala.';
    } else {
        nota.textContent = '';
    }
}

function renderSection(s, c) {
    // Tokens de contacto desde la FUENTE ÚNICA (se sustituyen ANTES de escapar → XSS-safe).
    const body = String(s.body)
        .split('{{EMAIL}}').join(c.email)
        .split('{{WA}}').join(c.whatsapp);
    const paragraphs = body.split(/\n\s*\n/).filter(Boolean);
    return html`
        <section id="${escape(s.id)}" class="lg-section">
            <div class="lg-section-head">
                <span class="mono lg-section-num">${escape(s.n)}</span>
                <h2 class="lg-section-title">${escape(s.title)}</h2>
            </div>
            <div class="lg-section-body">
                ${paragraphs.map(p => html`<p>${escape(p)}</p>`)}
                ${s.id === 'cookies' && renderPreferencias()}
            </div>
        </section>`;
}

function renderAll() {
    // Contacto (responsable Ley 1581 + derechos + pie) desde la FUENTE ÚNICA; fallback = default real.
    const c = mergeGlobal(data.getSiteContent('global')).contacto;
    return html`
        <div class="container lg-page">
            <header class="lg-pagehero">
                <div class="mono lg-eyebrow">DOCUMENTACIÓN LEGAL</div>
                <h1 class="lg-pagehero-title">Política de <span class="italic emerald-text">privacidad</span></h1>
                <p class="lg-pagehero-sub">Cómo recolectamos, usamos y protegemos tu información personal, conforme a la Ley 1581 de 2012.</p>
                <div class="mono lg-update">Última actualización · ${escape(LAST_UPDATE)}</div>
            </header>

            <div class="lg-layout">
                ${renderTOC()}
                <article class="lg-prose">
                    ${SECTIONS.map(s => renderSection(s, c))}
                </article>
            </div>

            <div class="lg-foot">
                <p>¿Quieres ejercer un derecho sobre tus datos? Escríbenos a <a href="${escape(safeUrl('mailto:' + c.email))}">${escape(c.email)}</a>.</p>
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
    mount(main, renderAll());

    // CMS global: re-pinta una vez si el contacto tiene override (el listener vive en `main`).
    data.loadSiteContent('global')
        .then(() => { if (document.getElementById('main-content')) mount(main, renderAll()); })
        .catch(() => { /* offline → quedan los defaults */ });

    // Preferencias de cookies (§07). Delegado en `main` a propósito: el CMS global repinta la
    // página una vez cuando llega el override de contacto, y un listener puesto en el botón se
    // habría perdido en ese repintado.
    main.addEventListener('click', e => {
        const btn = e.target.closest('.lg-cookie-btn[data-consent]');
        if (!btn) return;
        setConsent(btn.dataset.consent);   // un valor raro no guarda ni avisa nada
    });

    // UNA sola vía de actualización: se escucha la decisión, venga de este control o del banner.
    // Medido el 2026-10-09: si el control solo reaccionaba a su propio clic, aceptar en el BANNER
    // estando en esta página lo dejaba diciendo "Aún no has decidido" con el pixel ya corriendo —
    // la página mentía sobre el estado que ella misma debe dejar cambiar.
    document.addEventListener(CONSENT_EVENT, () => {
        const caja = main.querySelector('.lg-cookie-prefs');
        if (caja) actualizarPreferencias(caja);
    });

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
