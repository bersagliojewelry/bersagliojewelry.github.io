/**
 * Bersaglio Jewelry — Términos y condiciones.
 *
 * URL: /terminos.html
 *
 * Layout legal:
 *   - Hero con eyebrow + título + fecha de última actualización
 *   - Article con secciones numeradas, max-width 720, prose styling
 *   - Glass cards para resaltar tres principios clave (garantía / envíos / reembolsos)
 *   - Anchor links (table of contents) sticky lateral
 */

import { html, escape, mount } from '../core/html.js';
import { data } from '../core/data.js';
import { safeUrl } from '../core/safe-url.js';
import { mergeGlobal, waHref } from '../core/global-defaults.js';

const LAST_UPDATE = '2026-06-30';
const SECTIONS = [
    {
        id: 'objeto',
        n: '01',
        title: 'Objeto',
        body: `Estos términos regulan la relación entre Bersaglio Jewelry (en adelante, "el Atelier") y la persona que adquiere productos o servicios a través del sitio web bersagliojewelry.co, del atelier físico en Cartagena de Indias o de cualquier canal directo (WhatsApp, correo electrónico, llamada telefónica).

Al usar el sitio o iniciar una compra, aceptas estos términos en su totalidad. Si no estás de acuerdo, te pedimos cerrar la pestaña y no proceder. El tratamiento de tus datos personales se rige por nuestra Política de Privacidad.`,
    },
    {
        id: 'productos',
        n: '02',
        title: 'Productos y precios',
        body: `Cada pieza Bersaglio es única o producida en series muy limitadas. En la página de cada pieza encontrarás la descripción de sus materiales (oro 18k), su gema y sus características. La disponibilidad depende del inventario: algunas piezas se entregan de inmediato y otras se elaboran bajo pedido o a tu medida, con un tiempo de elaboración que te informamos antes de confirmar la compra. Las fotografías son fieles; sin embargo, debido a variaciones de luz, calibración de pantalla y la naturaleza misma de las gemas naturales, el color real puede presentar diferencias mínimas respecto a la imagen.

Los precios se expresan en pesos colombianos (COP) y corresponden al valor final a pagar. Bersaglio opera bajo el régimen de No responsables de IVA, por lo que el precio no discrimina ni adiciona IVA. Los envíos internacionales pueden generar aranceles y trámites aduaneros del país destino que corren por cuenta del comprador. Los precios pueden variar sin previo aviso, pero una vez confirmada una compra el precio queda bloqueado.`,
    },
    {
        id: 'cierre-compra',
        n: '03',
        title: 'Proceso de compra y medios de pago',
        body: `Acompañamos cada compra de forma personal. Puedes resolver dudas y coordinar tu pedido por WhatsApp, correo, teléfono o visitando el atelier en Cartagena de Indias.

Medios de pago:
· Transferencia bancaria: te compartimos el número de cuenta o el código QR de la cuenta de Bersaglio por WhatsApp y confirmamos tu pedido al recibir el pago.
· Pago electrónico con Wompi: te enviamos un enlace de pago seguro de la pasarela Wompi, con el que puedes pagar con tarjeta débito o crédito, PSE, Nequi, Bancolombia, Daviplata y los demás medios habilitados por Wompi.

Tu derecho de retracto aplica a toda compra a distancia —incluidas las que coordinas por WhatsApp, teléfono o correo—, sin importar el medio de pago; a los pagos electrónicos se suma además tu derecho de reversión (más abajo).`,
    },
    {
        id: 'envios',
        n: '04',
        title: 'Envíos',
        body: `Coordinamos el envío de tu pieza con una transportadora disponible en Cartagena de Indias; Bersaglio selecciona la empresa transportadora y te comparte la guía de seguimiento. Si tienes una cuenta registrada, cargamos la información del envío a tu perfil; si no, te la enviamos por WhatsApp y al correo que nos indiques durante la compra.

Envíos nacionales (Colombia): el costo y el tiempo de entrega dependen de la ciudad de destino y de la transportadora; te los informamos antes de confirmar el pedido.

Envíos internacionales: se cotizan caso por caso y se coordinan directamente con un asesor por WhatsApp (no se procesan con el pago en línea). El comprador asume el flete, los aranceles, impuestos y trámites aduaneros del país de destino; validamos contigo los costos totales antes de despachar. Una cotización internacional no obliga a la venta hasta confirmar su viabilidad; Bersaglio puede abstenerse de despachar a destinos con restricciones de importación. Los tributos, aranceles, impuestos y el riesgo de retención o decomiso en aduana del país de destino corren por cuenta del comprador, quien es responsable de cumplir las normas de importación de su país.`,
    },
    {
        id: 'garantia',
        n: '05',
        title: 'Garantía',
        body: `Toda pieza Bersaglio cuenta con la garantía legal obligatoria que ordena la ley colombiana (Ley 1480 de 2011): calidad, idoneidad y seguridad del producto. Es gratuita, no puede excluirse ni renunciarse y rige por el término legal aplicable.

De forma adicional y sin perjuicio ni limitación de la garantía legal, ofrecemos una garantía comercial de doce (12) meses por defectos de fabricación, contados desde la entrega, que cubre fallas de manufactura como el desprendimiento de soldaduras, problemas de fundición o el aflojamiento del engaste de las piedras. Para hacerla efectiva, escríbenos a {{EMAIL}} o por WhatsApp al {{WA}}, de ser posible con fotos de la pieza; coordinamos la evaluación técnica y la reparación o solución que corresponda.

Esta garantía comercial no cubre el desgaste natural por el uso, los daños por golpes o accidentes, la exposición a químicos abrasivos (cloro, amoníaco, blanqueador) ni las modificaciones realizadas por terceros ajenos al atelier; estas exclusiones no afectan tus derechos bajo la garantía legal.`,
    },
    {
        id: 'devoluciones',
        n: '06',
        title: 'Derecho de retracto y devoluciones',
        body: `Si compraste a distancia —por el sitio web, WhatsApp, teléfono o correo— puedes ejercer el derecho de retracto dentro de los cinco (5) días hábiles siguientes a la entrega, sin necesidad de justificar tu decisión (Ley 1480 de 2011, art. 47). Te devolvemos la totalidad del dinero que pagaste, sin descuentos ni retenciones, en un plazo máximo de quince (15) días calendario desde que ejerces el retracto (plazo modificado por la Ley 2439 de 2024), por el medio de pago que prefieras. Debes devolvernos la pieza en las mismas condiciones en que la recibiste, respondiendo únicamente por el deterioro derivado de un uso distinto al necesario para examinarla; el costo del envío de devolución corre por tu cuenta.

Excepción (piezas a la medida). Las piezas creadas o personalizadas conforme a tus especificaciones —diseños exclusivos, grabados, configuraciones hechas a tu pedido— no admiten retracto, por disposición de la misma ley. Un ajuste menor de talla sobre una pieza de catálogo no la convierte en pieza a la medida; cuando elaboramos una pieza a tu medida, te lo confirmamos por escrito antes de comenzar.

Disponibilidad y entrega. Si después de tu compra una pieza no estuviera disponible, o no se entrega en el plazo acordado (máximo treinta (30) días calendario cuando no se pacta otro), puedes terminar la compra y solicitar la devolución del dinero, que realizamos dentro de los quince (15) días calendario siguientes (Ley 2439 de 2024).`,
    },
    {
        id: 'reversion',
        n: '07',
        title: 'Reversión del pago',
        body: `Cuando el pago se haya hecho por un medio electrónico —por ejemplo, con tarjeta—, la ley te permite solicitar la reversión del pago si: fuiste víctima de fraude, la operación no fue autorizada por ti, no recibiste la pieza, o la que recibiste es defectuosa o no corresponde a lo que pediste (Ley 1480 de 2011, Art. 51, y Decreto 587 de 2016).

Tienes cinco (5) días hábiles para pedirla, contados desde que te enteraste del problema o desde la fecha en que debías haber recibido tu pieza. Una vez solicitada, el banco y los demás intervinientes en el pago disponen de quince (15) días hábiles para hacerla efectiva.

La reversión se solicita ante la entidad emisora de tu instrumento de pago (banco o billetera); te acompañamos en el trámite escribiéndonos a {{EMAIL}} o por WhatsApp al {{WA}}. Aplica únicamente a pagos por medios electrónicos (tarjeta, PSE, billeteras vía Wompi); los pagos por transferencia bancaria no son reversibles por este mecanismo, sin perjuicio de tu derecho de retracto y de la garantía legal.`,
    },
    {
        id: 'propiedad',
        n: '08',
        title: 'Propiedad intelectual',
        body: `Todas las imágenes, textos, diseños y videos publicados en bersagliojewelry.co son propiedad de Bersaglio Jewelry o se usan bajo licencia. Está prohibida su reproducción total o parcial sin autorización expresa por escrito.

Los diseños de joyas Bersaglio están protegidos por derecho de autor. Está prohibida la reproducción industrial o artesanal de las piezas, incluyendo aquellas hechas a medida para clientes específicos.`,
    },
    {
        id: 'modificaciones',
        n: '09',
        title: 'Modificaciones',
        body: `Podemos actualizar estos términos en cualquier momento. La versión vigente es siempre la publicada en esta página, con la fecha de última actualización al inicio. Te recomendamos revisarlos periódicamente.`,
    },
    {
        id: 'jurisdiccion',
        n: '10',
        title: 'Ley aplicable y jurisdicción',
        body: `Estos términos se rigen por la ley colombiana. Cualquier controversia se someterá a los tribunales competentes de Cartagena de Indias, salvo cuando la ley de protección al consumidor disponga otra cosa.`,
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

function renderSection(s, c) {
    // Tokens de contacto desde la FUENTE ÚNICA (se sustituyen ANTES de escapar → XSS-safe).
    const raw = String(s.body)
        .split('{{EMAIL}}').join(c.email)
        .split('{{WA}}').join(c.whatsapp);
    const paragraphs = raw.split(/\n\s*\n/).filter(Boolean);
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
    // Contacto del pie desde la FUENTE ÚNICA (siteContent/global.contacto); fallback = default real.
    const c = mergeGlobal(data.getSiteContent('global')).contacto;
    return html`
        <div class="container lg-page">
            <header class="lg-pagehero">
                <div class="mono lg-eyebrow">DOCUMENTACIÓN LEGAL</div>
                <h1 class="lg-pagehero-title">Términos y <span class="italic emerald-text">condiciones</span></h1>
                <p class="lg-pagehero-sub">Cómo funcionan la compra, el pago, los envíos, la garantía y las devoluciones en Bersaglio Jewelry.</p>
                <div class="mono lg-update">Última actualización · ${escape(LAST_UPDATE)}</div>
            </header>

            <div class="lg-layout">
                ${renderTOC()}
                <article class="lg-prose">
                    ${SECTIONS.map(s => renderSection(s, c))}
                </article>
            </div>

            <div class="lg-foot">
                <p>¿Una duda específica? Escríbenos a <a href="${escape(safeUrl('mailto:' + c.email))}">${escape(c.email)}</a> o por <a href="${escape(safeUrl(waHref(c.whatsapp)))}" target="_blank" rel="noopener">WhatsApp</a>.</p>
                <p class="lg-legal-id">Bersaglio Jewelry — nombre comercial del establecimiento de comercio de Diana Margarita Niño Mendoza (persona natural comerciante), NIT 32.908.305-6 · Calle 36 # 6-32, Centro Histórico, Cartagena de Indias, Bolívar, Colombia. Para peticiones, quejas o reclamos (PQR) y notificaciones, escríbenos a <a href="${escape(safeUrl('mailto:' + c.email))}">${escape(c.email)}</a> o a la dirección anterior; conservamos el soporte de cada transacción y te entregamos el comprobante de tu compra. Te atendemos de 8:00 a.m. a 7:00 p.m. y respondemos las solicitudes dentro de los plazos legales. ¿Quieres conocer tus derechos como consumidor o presentar una queja ante la autoridad? Puedes acudir a la <a href="https://www.sic.gov.co" target="_blank" rel="noopener noreferrer">Superintendencia de Industria y Comercio (SIC)</a>.</p>
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

    // CMS global: re-pinta una vez si el contacto del pie tiene override (el listener vive en `main`).
    data.loadSiteContent('global')
        .then(() => { if (document.getElementById('main-content')) mount(main, renderAll()); })
        .catch(() => { /* offline → quedan los defaults */ });

    // Smooth-scroll TOC anchors (overrides default jump)
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
