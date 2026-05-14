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

import { html, escape } from '../core/html.js';

const LAST_UPDATE = '2026-04-12';
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

Métodos de pago aceptados: transferencia bancaria (Bancolombia, Davivienda), tarjetas Visa/Mastercard procesadas presencial o vía link de pago, financiación hasta 12 meses con entidades aliadas para piezas superiores a $50.000.000 COP.`,
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

La garantía no cubre: daño por golpe directo (caída sobre piedra), exposición prolongada a químicos abrasivos (cloro, ammonia, blanqueador), modificación realizada por terceros ajenos al Atelier, robo o pérdida.`,
    },
    {
        id: 'devoluciones',
        n: '06',
        title: 'Devoluciones y cambios',
        body: `Piezas a medida: por su naturaleza única, las piezas diseñadas a medida no admiten devolución. Sí admitimos cambios en boceto y prototipo de cera previo a la fundición, sin costo adicional, hasta tres iteraciones.

Piezas de catálogo: aceptamos cambio (no reembolso en efectivo) dentro de los 15 días hábiles siguientes a la entrega, siempre que la pieza llegue en condiciones impecables, con estuche, libreta y certificado. El cliente cubre el costo de envío del cambio.`,
    },
    {
        id: 'propiedad',
        n: '07',
        title: 'Propiedad intelectual',
        body: `Todas las imágenes, textos, diseños y videos publicados en bersagliojewelry.co son propiedad de Bersaglio Jewelry o se usan bajo licencia. Está prohibida su reproducción total o parcial sin autorización expresa por escrito.

Los diseños de joyas Bersaglio están protegidos por derecho de autor. Está prohibida la reproducción industrial o artesanal de las piezas, incluyendo aquellas hechas a medida para clientes específicos.`,
    },
    {
        id: 'modificaciones',
        n: '08',
        title: 'Modificaciones',
        body: `Podemos actualizar estos términos en cualquier momento. La versión vigente es siempre la publicada en esta página, con la fecha de última actualización al inicio. Te recomendamos revisarlos periódicamente.`,
    },
    {
        id: 'jurisdiccion',
        n: '09',
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
                <h1 class="lg-pagehero-title">Términos y <span class="italic emerald-text">condiciones</span></h1>
                <p class="lg-pagehero-sub">Cómo funcionan las compras, los envíos, la garantía y los cambios en Bersaglio Jewelry. Texto plano, sin trampas.</p>
                <div class="mono lg-update">Última actualización · ${escape(LAST_UPDATE)}</div>
            </header>

            <div class="lg-layout">
                ${renderTOC()}
                <article class="lg-prose">
                    ${SECTIONS.map(renderSection)}
                </article>
            </div>

            <div class="lg-foot">
                <p>¿Una duda específica? Escríbenos a <a href="mailto:hola@bersagliojewelry.com">hola@bersagliojewelry.com</a> o por <a href="https://wa.me/573108136829" target="_blank" rel="noopener">WhatsApp</a>.</p>
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
