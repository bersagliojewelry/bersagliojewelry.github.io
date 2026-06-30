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

Al usar el sitio o iniciar una compra, aceptas estos términos en su totalidad. Si no estás de acuerdo, te pedimos cerrar la pestaña y no proceder.`,
    },
    {
        id: 'productos',
        n: '02',
        title: 'Productos y precios',
        body: `Cada pieza Bersaglio es única o producida en series muy limitadas. Las fotografías son fieles; sin embargo, debido a variaciones de luz, calibración de pantalla y la naturaleza misma de las gemas naturales, el color real puede presentar diferencias mínimas respecto a la imagen.

Los precios se expresan en pesos colombianos (COP) y ya incluyen el IVA del 19%. Los envíos internacionales pueden generar aranceles y trámites aduaneros del país destino que corren por cuenta del comprador. Los precios pueden variar sin previo aviso, pero una vez confirmada una compra el precio queda bloqueado.`,
    },
    {
        id: 'cierre-compra',
        n: '03',
        title: 'Cierre de compra',
        body: `Por la naturaleza de alta gama de cada pieza, todas las compras se cierran en conversación con un asesor: WhatsApp, correo, llamada o visita al atelier. No procesamos pagos automáticos directos en el sitio web.

Métodos de pago aceptados: transferencia bancaria (Bancolombia, Davivienda), tarjetas Visa/Mastercard procesadas presencial o vía link de pago, financiación hasta 12 meses con entidades aliadas para piezas superiores a $50.000.000 COP.

Hoy acompañamos cada compra de forma personal, sin cobros automáticos en el sitio. Tu derecho de retracto aplica a toda compra a distancia —incluidas las que coordinas por WhatsApp, teléfono o correo—, sin importar cómo pagues. Cuando habilitemos el pago en línea con tarjeta te lo indicaremos al momento de comprar; a esos pagos electrónicos se suma además tu derecho de reversión (más abajo).`,
    },
    {
        id: 'envios',
        n: '04',
        title: 'Envíos',
        body: `Despachos nacionales (Colombia): envío gratuito con seguro pleno por Servientrega Premium, 2-5 días hábiles dependiendo de la ciudad.

Despachos internacionales: DHL Express o FedEx Priority con seguro declarado por el valor total de la pieza, 5-8 días hábiles, entrega registrada con firma. Aranceles e impuestos del país destino son responsabilidad del comprador.

Cada pieza viaja en estuche de presentación Bersaglio, con libreta de origen (mina de la gema, oficio del orfebre, certificación GIA si aplica) y certificado de garantía de por vida.`,
    },
    {
        id: 'garantia',
        n: '05',
        title: 'Garantía',
        body: `Toda pieza Bersaglio cuenta con garantía de por vida en estructura y engaste. Esto incluye: reparación gratuita si una piedra se afloja, restauración si una soldadura cede, redimensionado de anillos hasta dos tallas arriba/abajo (un servicio por pieza), limpieza profesional y pulido (un servicio anual sin costo).

La garantía no cubre: daño por golpe directo (caída sobre piedra), exposición prolongada a químicos abrasivos (cloro, ammonia, blanqueador), modificación realizada por terceros ajenos al Atelier, robo o pérdida.

Además de nuestra garantía comercial de por vida, toda pieza cuenta con la garantía legal obligatoria que ordena la ley colombiana (Ley 1480 de 2011): calidad, idoneidad y seguridad del producto. Esta garantía es gratuita y no puede excluirse ni renunciarse. Para hacerla efectiva, escríbenos a {{EMAIL}} o por WhatsApp al {{WA}} y coordinamos la revisión o reparación.`,
    },
    {
        id: 'devoluciones',
        n: '06',
        title: 'Cambios, devoluciones y derecho de retracto',
        body: `Queremos que recibas tu pieza con la misma tranquilidad con la que la elegimos para ti. Por eso, además de lo que la ley te garantiza, te explicamos tus opciones con claridad.

Derecho de retracto (compras a distancia). Si adquiriste tu pieza a distancia —por el sitio web, WhatsApp, teléfono o correo— tienes derecho a retractarte dentro de los cinco (5) días hábiles siguientes a la entrega, sin necesidad de justificar tu decisión (Ley 1480 de 2011, Art. 47). Te devolvemos todas las sumas que pagaste, sin descuentos ni retenciones de ningún tipo —incluido el valor del envío original, si lo hubo—, en un plazo máximo de treinta (30) días calendario. La pieza debe regresar sin señales de uso más allá de su revisión y en condiciones que permitan su devolución; te agradecemos incluir su estuche y documentos, aunque su ausencia no impide el retracto. El único costo a tu cargo es el del envío de la pieza de vuelta a nosotros.

Excepción (piezas a la medida). Por disposición de la misma ley, las piezas creadas o personalizadas específicamente para ti —diseños exclusivos, grabados, configuraciones hechas a tu pedido— no admiten retracto, pues se elaboran conforme a tus especificaciones. Un ajuste menor de talla sobre una pieza de catálogo no la convierte en pieza a la medida. Cuando elaboramos una pieza a tu medida, te lo confirmamos por escrito antes de comenzar.

Cambios de cortesía (catálogo). Adicional a tu derecho legal de retracto —que siempre prevalece y te permite el reembolso completo— y de forma voluntaria de nuestra parte, en piezas de catálogo ofrecemos cambio (no reembolso en efectivo) dentro de los quince (15) días hábiles siguientes a la entrega, siempre que la pieza llegue impecable, con su estuche, libreta de origen (el documento que acompaña a tu pieza) y certificado. Este beneficio no limita ni reemplaza ninguno de tus derechos legales; el cliente cubre el envío del cambio.`,
    },
    {
        id: 'reversion',
        n: '07',
        title: 'Reversión del pago',
        body: `Cuando el pago se haya hecho por un medio electrónico —por ejemplo, con tarjeta—, la ley te permite solicitar la reversión del pago si: fuiste víctima de fraude, la operación no fue autorizada por ti, no recibiste la pieza, o la que recibiste es defectuosa o no corresponde a lo que pediste (Ley 1480 de 2011, Art. 51, y Decreto 587 de 2016).

Tienes cinco (5) días hábiles para pedirla, contados desde que te enteraste del problema o desde la fecha en que debías haber recibido tu pieza. Una vez solicitada, el banco y los demás intervinientes en el pago disponen de quince (15) días hábiles para hacerla efectiva.

Para iniciarla, escríbenos a {{EMAIL}} o por WhatsApp al {{WA}} y te acompañamos en el trámite ante tu banco.`,
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
                <p class="lg-pagehero-sub">Cómo funcionan las compras, los envíos, la garantía y los cambios en Bersaglio Jewelry. Texto plano, sin trampas.</p>
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
                <p class="lg-legal-id">Bersaglio Jewelry · Calle 36 # 6-32, Centro Histórico, Cartagena de Indias, Bolívar, Colombia. ¿Quieres conocer tus derechos como consumidor o presentar una queja? Puedes acudir a la <a href="https://www.sic.gov.co" target="_blank" rel="noopener noreferrer">Superintendencia de Industria y Comercio (SIC)</a>.</p>
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
