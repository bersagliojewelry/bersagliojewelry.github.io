/**
 * Bersaglio Jewelry — Nosotros page (11 secciones).
 *
 * Mirror exacto de BERSAGLIO NOVO/project/js/pages.jsx (Nosotros L198-533, 340L)
 * con copy literal de chapters, valores, equipo, prensa, faqs.
 *
 * Secciones:
 *   1. Hero editorial (1.1fr 1fr): título display + lead + 2 CTAs | image 4/5 quote overlay
 *   2. Stats (4-col): 13 años / +1.200 piezas / 40 países / 100% trazabilidad
 *   3. Manifiesto (centered, type editorial)
 *   4. Valores (3×2 grid, 6 cards numeradas)
 *   5. Timeline interactivo (5 chapter tabs + active panel)
 *   6. Atelier split (image | text + 2 sub-stats)
 *   7. Equipo (4 cards con avatar gradient + name + role + bio)
 *   8. Certificaciones glass-emerald (1fr 2fr split + 4 cert cards)
 *   9. Prensa (4 cards en 2-col grid)
 *   10. FAQ accordion (6 items con + → × icon)
 *   11. CTA final
 *
 * Estado:
 *   - openFaq: índice del FAQ abierto (0..5 o -1 si todos cerrados)
 *   - activeChapter: índice del capítulo activo (0..4)
 */

import { html, escape } from '../core/html.js';

let _openFaq = 0;
let _activeChapter = 0;

const CHAPTERS = [
    { y: '2013', t: 'El Diálogo Inicial', d: 'El taller comenzó con un sueño, dedicación y visitas personalizadas directamente en los hogares de nuestros clientes. Este contacto íntimo nos enseñó que antes que una joya, el huésped busca sentirse seguro, asesorado y acompañado en su elección.' },
    { y: '2016', t: 'La Consagración del Espacio', d: 'Gracias a esta filosofía de servicio y cercanía, crecimos paso a paso. Abrimos las puertas de nuestro primer atelier privado en el centro histórico de Cartagena, un refugio para mantener esa atención pausada e individual.' },
    { y: '2020', t: 'Estándares y Confianza', d: 'Consolidamos nuestra reputación basándonos en la transparencia absoluta de cada gema. Cada esmeralda y diamante se entrega con trazabilidad total y certificación ética, reforzando la credibilidad y el valor real de cada inversión.' },
    { y: '2023', t: 'Una Década de Relaciones', d: 'Cumplimos diez años de trayectoria construyendo vínculos duraderos. El acompañamiento y asesoramiento personalizado se consolidan formalmente como el corazón absoluto de Bersaglio.' },
    { y: '2026', t: 'La Verde y la Esencia', d: 'Hoy, seguimos conservando intacta la misma esencia con la que iniciamos: ofrecer una experiencia cercana, elegante y completamente personalizada, donde cada cliente se siente especial y cada joya tiene un significado real.' },
];

const VALORES = [
    { n: '01', t: 'La Elegancia como Silencio', d: 'Entendemos la sofisticación no como un destello ruidoso, sino como un susurro de distinción. Una joya Bersaglio es la expresión poética de tu estilo y de tu esencia.' },
    { n: '02', t: 'El Pacto de Credibilidad', d: 'Construimos relaciones duraderas basadas en la transparencia, la credibilidad y una confianza inquebrantable que custodia tu tranquilidad.' },
    { n: '03', t: 'La Asesoría antes del Oficio', d: 'Antes que vender, nos dedicamos a guiarte y asesorarte con paciencia, asegurando que cada cliente encuentre o co-cree la pieza idónea.' },
    { n: '04', t: 'Devoción en cada Detalle', d: 'Cada milímetro esculpido y cada interacción con nosotros está cuidada con devoción, buscando hacer de tu experiencia un recuerdo memorable.' },
    { n: '05', t: 'Cómplices de tu Felicidad', d: 'Nos apasiona ser parte de tus momentos más significativos. Diseñamos con el orgullo de dar forma física a tus emociones y celebraciones sagradas.' },
    { n: '06', t: 'Valor e Inversión Eterna', d: 'Transmitimos a nuestros clientes que una joya no es un gasto efímero, sino una inversión duradera que conserva e incrementa su significado y valor en el tiempo.' },
];

const EQUIPO = [
    { n: 'Kary Mendoza',         r: 'Fundadora & Directora',     b: 'Diez años dedicada a escuchar con empatía las historias de nuestros clientes para traducirlas en obras de arte eternas. Su mirada sensible guía la selección de cada gema y supervisa el detalle final de cada pieza.' },
    { n: 'Maestro Eliécer Patiño', r: 'Orfebre principal',         b: 'Treinta y dos años de maestría y devoción orfebre. Formado bajo la tradición de la filigrana en Mompox y perfeccionado en Cartagena, domina la fundición a cera perdida y el engaste pavé de alta precisión.' },
    { n: 'Lucía Restrepo',       r: 'Gemóloga GIA',              b: 'Certificada por el prestigioso Gemological Institute of America (GIA). Es la guardiana de la excelencia gemológica de la Maison, analizando la pureza, color y procedencia de cada esmeralda y diamante.' },
    { n: 'Andrés Beltrán',       r: 'Diseño & dibujo técnico',   b: 'Traduce las conversaciones íntimas del atelier en bocetos poéticos a mano alzada, planos técnicos y modelados 3D meticulosos, sirviendo de puente entre el deseo del cliente y el crisol del orfebre.' },
];

// TODO(contenido real): sustituir por reseñas reales de Google Maps (Places API / export).
const RESENAS = [
    { n: 'Valentina Restrepo', t: 'Llegué sin saber muy bien qué quería y salí con la pieza de mis sueños. Kary entendió mi historia mejor que yo. El trato es de otro nivel.', loc: 'Reseña en Google Maps' },
    { n: 'Andrés Mejía', t: 'Mandé hacer el anillo de compromiso y superó todo lo que imaginaba. Se siente el amor por el oficio en cada detalle. Mil gracias.', loc: 'Reseña en Google Maps' },
    { n: 'Camila Tordecilla', t: 'Un lugar precioso en el Centro Histórico. Te reciben con un café y una paciencia que ya no se ve. La esmeralda quedó espectacular.', loc: 'Reseña en Google Maps' },
    { n: 'Juan Pablo Vergara', t: 'Calidad real y honestidad. Me explicaron cada piedra con su certificado. Volveré sin duda para la próxima ocasión especial.', loc: 'Reseña en Google Maps' },
];

const FAQS = [
    { q: '¿Cuánto tarda una pieza a medida?',           a: 'Entre cuatro y seis semanas desde la aprobación del boceto. La primera conversación, los renders y los ajustes pueden sumar dos semanas adicionales. No aceleramos plazos: el oficio paciente no admite atajos.' },
    { q: '¿Trabajan con piedras del cliente?',          a: 'Sí. Recibimos gemas heredadas, las evaluamos con nuestra gemóloga, y las integramos en una pieza nueva. Si la talla original tiene daños, ofrecemos retalle previo en taller especializado.' },
    { q: '¿Hacen envíos internacionales?',              a: 'Sí, con seguro pleno declarado y entrega registrada por DHL Express o FedEx Priority. Despachamos a más de cuarenta países. Los aranceles del país destino corren por cuenta del cliente.' },
    { q: '¿Aceptan financiación?',                       a: 'Hasta tres cuotas sin interés con tarjetas locales. Para piezas sobre $50.000.000 COP estructuramos planes a seis o doce meses con entidades aliadas.' },
    { q: '¿Puedo visitar el atelier sin comprar?',      a: 'Por supuesto. La cita previa es solo para garantizar que tengamos tiempo para ti. Recibirás un café, te mostraremos el taller, conocerás al maestro orfebre. Sin compromiso de compra.' },
    { q: '¿Qué garantía tienen las piezas?',            a: 'Garantía de por vida en estructura y engaste. Si una piedra se afloja, la reparamos sin costo. Si una soldadura cede, la rehacemos. Mientras Bersaglio exista, tu pieza tiene casa.' },
];

const STATS = [
    { n: '13',     l: 'años de oficio',    s: 'desde 2013' },
    { n: '+1.200', l: 'piezas entregadas', s: 'con libreta de origen' },
    { n: '40',     l: 'países alcanzados', s: 'envíos asegurados' },
    { n: '100%',   l: 'trazabilidad',      s: 'gema · oro · orfebre' },
];

const CERTS = [
    { t: 'Jewelers of America',           d: 'Miembro acreditado desde 2020' },
    { t: 'GIA',                            d: 'Reportes gemológicos en cada diamante' },
    { t: 'Muzo Origin',                   d: 'Certificación de mina en cada esmeralda' },
    { t: 'Responsible Jewellery Council', d: 'Trazabilidad de oro y prácticas éticas' },
];

// ═══════════════════════════════════════════════════════════════════
// 1. HERO
// ═══════════════════════════════════════════════════════════════════
function renderHero() {
    return html`
        <section class="abt-hero">
            <div class="abt-hero-text">
                <div class="mono abt-eyebrow">CAPÍTULO 00 · NUESTRA ALMA</div>
                <h1 class="abt-hero-title">
                    Un legado<br>
                    <span class="italic emerald-text abt-hero-title-em">se susurra,</span><br>
                    no se compra.
                </h1>
                <p class="abt-hero-lead">
                    Nacimos con una visión clara: acercar piezas únicas a quienes aprecian la elegancia y el valor de una joya auténtica. Nuestro viaje comenzó desde cero, visitando a nuestros clientes en la calidez de sus hogares, construyendo relaciones basadas en la confianza y en una cercanía que hoy se mantiene como el alma del atelier.
                </p>
                <p class="abt-hero-italic">
                    Más que vender joyas, nos apasiona asesorar. Diseñamos con la convicción de que una pieza no es un simple accesorio, sino un reflejo de tu esencia, una emoción duradera y una inversión que trasciende en el tiempo.
                </p>
                <div class="abt-hero-actions">
                    <a href="/contacto.html" class="btn-aqua btn-aqua-emerald">
                        Agendar una visita
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
                    </a>
                    <a href="/colecciones.html" class="btn-aqua">Ver colecciones</a>
                </div>
            </div>
            <div class="glass glass-iridescent abt-hero-image">
                <div class="abt-hero-image-bg"></div>
                <div class="abt-hero-image-shade"></div>
                <div class="abt-hero-image-content">
                    <div class="mono abt-hero-image-eyebrow">ATELIER · CARTAGENA DE INDIAS</div>
                    <div class="abt-hero-quote">"Nuestra casa es tu casa."</div>
                    <div class="mono abt-hero-quote-author">— KARY MENDOZA</div>
                </div>
            </div>
        </section>`;
}

// ═══════════════════════════════════════════════════════════════════
// 2. STATS
// ═══════════════════════════════════════════════════════════════════
function renderStats() {
    return html`
        <section class="glass abt-stats">
            ${STATS.map((k, i) => html`
                <div class="abt-stat ${i > 0 ? 'abt-stat--bordered' : ''}">
                    <div class="display abt-stat-num">${escape(k.n)}</div>
                    <div class="abt-stat-label">${escape(k.l)}</div>
                    <div class="mono abt-stat-sub">${escape(k.s)}</div>
                </div>`)}
        </section>`;
}

// ═══════════════════════════════════════════════════════════════════
// 3. MANIFIESTO
// ═══════════════════════════════════════════════════════════════════
function renderManifiesto() {
    return html`
        <section class="abt-manifiesto">
            <h2 class="abt-manifiesto-title">
                Sostenemos que el lujo auténtico carece de estridencias.
                <span class="italic emerald-text">Es un secreto compartido entre dos personas</span>, 
                esbozado en la calidez de nuestro atelier, donde el tiempo se detiene para dar vida a una creación que trascenderá nuestra propia existencia.
            </h2>
            <div class="abt-manifiesto-divider"></div>
            <div class="mono abt-manifiesto-foot">MAISON BERSAGLIO · CARTAGENA DE INDIAS</div>
        </section>`;
}

// ═══════════════════════════════════════════════════════════════════
// 4. VALORES
// ═══════════════════════════════════════════════════════════════════
function renderValores() {
    return html`
        <section class="abt-section">
            <div class="abt-section-header">
                <div class="mono abt-eyebrow">NUESTROS PRINCIPIOS</div>
                <h2 class="abt-section-title">
                    Seis cosas en las que <span class="italic emerald-text">no negociamos</span>
                </h2>
            </div>
            <div class="val-grid">
                ${VALORES.map(v => html`
                    <div class="glass glass-iridescent val-card">
                        <div class="val-card-num-row">
                            <div class="mono val-card-num">${escape(v.n)}</div>
                            <div class="val-card-line"></div>
                        </div>
                        <div class="val-card-title">${escape(v.t)}</div>
                        <p class="val-card-desc">${escape(v.d)}</p>
                    </div>`)}
            </div>
        </section>`;
}

// ═══════════════════════════════════════════════════════════════════
// 5. TIMELINE
// ═══════════════════════════════════════════════════════════════════
function renderTimeline() {
    const c = CHAPTERS[_activeChapter];
    return html`
        <section class="abt-section">
            <div class="abt-section-header">
                <h2 class="abt-section-title">
                    Trece años en <span class="italic emerald-text">cinco capítulos</span>
                </h2>
            </div>
            <div class="glass abt-timeline">
                <div class="abt-timeline-tabs">
                    ${CHAPTERS.map((ch, i) => html`
                        <button type="button"
                                class="abt-timeline-tab ${i === _activeChapter ? 'is-active' : ''}"
                                data-action="chapter"
                                data-idx="${i}">
                            <span class="mono abt-timeline-tab-year">${escape(ch.y)}</span>${escape(ch.t)}
                        </button>`)}
                </div>
                <div class="abt-timeline-content tl-content">
                    <div class="abt-timeline-side">
                        <div class="display abt-timeline-year">${escape(c.y)}</div>
                        <div class="abt-timeline-divider"></div>
                    </div>
                    <div class="abt-timeline-body">
                        <div class="abt-timeline-title">${escape(c.t)}</div>
                        <p class="abt-timeline-desc">${escape(c.d)}</p>
                    </div>
                </div>
            </div>
        </section>`;
}

// ═══════════════════════════════════════════════════════════════════
// 6. ATELIER
// ═══════════════════════════════════════════════════════════════════
function renderAtelier() {
    return html`
        <section class="atl-split">
            <div class="glass glass-iridescent atl-image">
                <div class="atl-image-bg"></div>
                <div class="chip glass-pill atl-chip">El Atelier</div>
            </div>
            <div class="glass atl-text">
                <h3 class="atl-text-title">
                    Donde el oficio<br>
                    <span class="italic emerald-text">toma forma</span>
                </h3>
                <p class="atl-text-p">
                    En el corazón del Centro Histórico de Cartagena tenemos nuestra casa: un espacio abierto al público donde te recibimos con calma y una atención cálida y personalizada. Aquí se conversa, se diseña y se crea — porque en Bersaglio no revendemos: fabricamos cada pieza.
                </p>
                <p class="atl-text-p">
                    Kary y su equipo acompañan cada paso: desde la primera conversación y el boceto a mano alzada, hasta dar vida a la joya y entregarla firmada. Un proceso cercano, sin prisas y hecho a la medida de tu historia.
                </p>
                <div class="atl-stats">
                    <div>
                        <div class="mono atl-stat-key">UBICACIÓN</div>
                        <div class="atl-stat-val">Calle 36 # 6-32 · San Agustín Chiquita<br>Centro Histórico · Cartagena de Indias</div>
                    </div>
                    <div>
                        <div class="mono atl-stat-key">VISITAS</div>
                        <div class="atl-stat-val">Con o sin cita previa<br>Lun–Sáb · 10:00–19:00</div>
                    </div>
                </div>
            </div>
        </section>`;
}

// ═══════════════════════════════════════════════════════════════════
// 7. EQUIPO
// ═══════════════════════════════════════════════════════════════════
function avatarInitials(name) {
    const parts = name.trim().split(/\s+/);
    const first = parts[0] || '';
    const last = parts[parts.length - 1] || '';
    return (first[0] || '') + (last[0] || '');
}

function renderEquipo() {
    return html`
        <section class="abt-section">
            <div class="abt-section-header">
                <h2 class="abt-section-title">
                    El equipo <span class="italic emerald-text">detrás del atelier</span>
                </h2>
            </div>
            <div class="team-grid">
                ${EQUIPO.map((p, i) => html`
                    <div class="glass glass-iridescent team-card">
                        <div class="team-avatar" style="--ti:${i}">
                            <span class="team-avatar-letter">${escape(avatarInitials(p.n))}</span>
                        </div>
                        <div class="team-name">${escape(p.n)}</div>
                        <div class="mono team-role">${escape(p.r)}</div>
                        <p class="team-bio">${escape(p.b)}</p>
                    </div>`)}
            </div>
        </section>`;
}

// ═══════════════════════════════════════════════════════════════════
// 8. CERTIFICACIONES
// ═══════════════════════════════════════════════════════════════════
function renderCerts() {
    return html`
        <section class="glass glass-emerald cert-section" id="certificaciones">
            <div class="cert-grid">
                <div class="cert-side">
                    <div class="mono cert-eyebrow">RESPALDOS Y CERTIFICACIONES</div>
                    <h3 class="cert-title">
                        Cada pieza viene con
                        <span class="italic cert-title-em">papel y palabra</span>
                    </h3>
                </div>
                <div class="cert-list">
                    ${CERTS.map(c => html`
                        <div class="cert-card">
                            <div class="cert-card-title">${escape(c.t)}</div>
                            <div class="cert-card-desc">${escape(c.d)}</div>
                        </div>`)}
                </div>
            </div>
        </section>`;
}

// ═══════════════════════════════════════════════════════════════════
// 9. PRENSA
// ═══════════════════════════════════════════════════════════════════
function starsSVG() {
    return [0, 1, 2, 3, 4].map(() => html`<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l2.9 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 7.1-1.01L12 2z"/></svg>`);
}

function renderResenas() {
    return html`
        <section class="abt-section">
            <div class="abt-section-header">
                <div class="mono abt-eyebrow">EN SUS PALABRAS</div>
                <h2 class="abt-section-title">
                    Historias que <span class="italic emerald-text">nos confiaron</span>
                </h2>
            </div>
            <div class="resena-grid">
                ${RESENAS.map(r => html`
                    <div class="glass glass-iridescent resena-card">
                        <div class="resena-stars" aria-label="5 de 5 estrellas">${starsSVG()}</div>
                        <p class="resena-quote">${escape(r.t)}</p>
                        <div class="resena-foot">
                            <span class="resena-name">${escape(r.n)}</span>
                            <span class="mono resena-src">${escape(r.loc)}</span>
                        </div>
                    </div>`)}
            </div>
        </section>`;
}

// ═══════════════════════════════════════════════════════════════════
// 10. FAQ
// ═══════════════════════════════════════════════════════════════════
function renderFAQ() {
    return html`
        <section class="abt-section">
            <div class="abt-section-header">
                <h2 class="abt-section-title">
                    Lo que <span class="italic emerald-text">suelen preguntarnos</span>
                </h2>
            </div>
            <div class="glass faq-wrap">
                ${FAQS.map((f, i) => html`
                    <div class="faq-item ${i < FAQS.length - 1 ? 'faq-item--bordered' : ''}">
                        <button type="button"
                                class="faq-trigger"
                                data-action="faq"
                                data-idx="${i}"
                                aria-expanded="${_openFaq === i ? 'true' : 'false'}">
                            <span class="faq-q">${escape(f.q)}</span>
                            <span class="faq-toggle ${_openFaq === i ? 'is-open' : ''}" aria-hidden="true">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
                            </span>
                        </button>
                        ${_openFaq === i ? html`
                            <div class="faq-answer">
                                <p>${escape(f.a)}</p>
                            </div>` : ''}
                    </div>`)}
            </div>
        </section>`;
}

// ═══════════════════════════════════════════════════════════════════
// 11. CTA
// ═══════════════════════════════════════════════════════════════════
function renderCTA() {
    return html`
        <section class="glass glass-iridescent abt-cta">
            <div class="abt-cta-glow" aria-hidden="true"></div>
            <div class="abt-cta-content">
                <div class="mono abt-eyebrow">EMPEZAMOS POR UNA CONVERSACIÓN</div>
                <h3 class="abt-cta-title">
                    Tu próxima joya<br>
                    <span class="italic emerald-text">comienza con un café</span>
                </h3>
                <p class="abt-cta-lead">
                    Agenda una visita al atelier o escríbenos. Sin compromiso, sin guion, sin prisas.
                    Solo una conversación.
                </p>
                <div class="abt-cta-actions">
                    <a href="/contacto.html" class="btn-aqua btn-aqua-emerald">
                        Hablemos
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
                    </a>
                </div>
            </div>
        </section>`;
}

// ═══════════════════════════════════════════════════════════════════
// MOUNT
// ═══════════════════════════════════════════════════════════════════
function renderFilosofia() {
    return html`
        <section class="abt-section">
            <div class="filosofia-grid">
                <div class="glass glass-iridescent val-card">
                    <div class="mono val-card-num">MISIÓN</div>
                    <h3 class="val-card-title">Nuestra Promesa</h3>
                    <p class="val-card-desc">
                        Concebir piezas exclusivas mediante una asesoría íntima y cercana. Acompañamos a nuestros clientes en la elección de joyas que representen su distinción y los instantes más valiosos de su vida, asegurando siempre una experiencia de confianza, calidad y emotividad perdurable.
                    </p>
                </div>
                <div class="glass glass-iridescent val-card">
                    <div class="mono val-card-num">VISIÓN</div>
                    <h3 class="val-card-title">El Horizonte</h3>
                    <p class="val-card-desc">
                        Ser el atelier de alta joyería personalizada de referencia en excelencia y discreción, consolidando un acompañamiento generacional que perpetúa el legado emocional de nuestros clientes a través de piezas de autor únicas que vencen al tiempo.
                    </p>
                </div>
            </div>
        </section>`;
}

function renderAll() {
    return html`
        <div class="container abt-page">
            ${renderHero()}
            ${renderStats()}
            ${renderManifiesto()}
            ${renderFilosofia()}
            ${renderValores()}
            ${renderTimeline()}
            ${renderAtelier()}
            ${renderEquipo()}
            ${renderCerts()}
            ${renderResenas()}
            ${renderFAQ()}
            ${renderCTA()}
        </div>`;
}

function refreshTimeline() {
    // Replace only the timeline section, preserve scroll position
    const root = document.querySelector('.abt-page');
    if (!root) return;
    const oldTimeline = root.querySelector('.abt-timeline').closest('.abt-section');
    if (!oldTimeline) return;
    const wrap = document.createElement('div');
    wrap.innerHTML = renderTimeline();
    const newTimeline = wrap.firstElementChild;
    oldTimeline.replaceWith(newTimeline);
}

function refreshFAQ() {
    const wrap = document.querySelector('.faq-wrap');
    if (!wrap) return;
    const tmp = document.createElement('div');
    tmp.innerHTML = renderFAQ();
    const newWrap = tmp.querySelector('.faq-wrap');
    wrap.replaceWith(newWrap);
}

function onMainClick(e) {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;

    if (action === 'chapter') {
        e.preventDefault();
        const idx = Number(btn.dataset.idx);
        if (Number.isNaN(idx) || idx === _activeChapter) return;
        _activeChapter = idx;
        refreshTimeline();
        return;
    }

    if (action === 'faq') {
        e.preventDefault();
        const idx = Number(btn.dataset.idx);
        if (Number.isNaN(idx)) return;
        _openFaq = (_openFaq === idx) ? -1 : idx;
        refreshFAQ();
    }
}

export async function init() {
    const main = document.getElementById('main-content');
    if (!main) return;

    main.innerHTML = renderAll();
    main.addEventListener('click', onMainClick);
}

export default { init };
