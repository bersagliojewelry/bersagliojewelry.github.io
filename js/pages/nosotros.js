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
    { y: '2013', t: 'El Diálogo Inicial', d: 'Kary Mendoza emprende el viaje visitando a familias cartageneras en sus hogares. Más que ofrecer metales y gemas, se dedicó a escuchar. Cada historia compartida sentó los cimientos de una pieza cargada de alma.' },
    { y: '2016', t: 'La Consagración del Espacio', d: 'Establecemos nuestro primer atelier privado en el Centro Histórico. Una puerta que solo se abre bajo cita concertada, resguardando la intimidad de cada visitante y celebrando la joyería de intención.' },
    { y: '2020', t: 'Estándares del Oficio', d: 'Bersaglio es admitida en Jewelers of America. Asumimos el compromiso inquebrantable de la trazabilidad ética, seleccionando exclusivamente gemas Muzo y diamantes avalados por la GIA.' },
    { y: '2023', t: 'Una Década de Legado', d: 'Mil piezas singulares esculpidas, cada una documentada en su bitácora de origen: la procedencia exacta de la gema, las manos artesanas involucradas y el relato familiar que conmemora.' },
    { y: '2026', t: 'La Verde y el Futuro', d: 'Presentamos una colección icónica: seis creaciones exclusivas con esmeraldas Muzo sin tratamiento térmico y monturas en oro paladiado. Un tributo puro a la naturaleza indómita de la gema soberana de Colombia.' },
];

const VALORES = [
    { n: '01', t: 'La Confidencia como Preludio', d: 'Prescindimos de catálogos y guiones comerciales. Nos adentramos en el sentimiento y la memoria que inspiran tu encargo. La joya ideal se revela a través del diálogo.' },
    { n: '02', t: 'Linaje y Origen Noble', d: 'Cada esmeralda singular es respaldada por su procedencia de mina (Muzo, Coscuez o Chivor). Cada diamante posee reporte GIA y el oro cuenta con certificación ética de trazabilidad RJC.' },
    { n: '03', t: 'Orfebrería Pausada', d: 'Dedicamos de cuatro a seis semanas a cada pieza. Sin atajos ni moldes en serie. Empleamos técnicas ancestrales, cera perdida y el labrado paciente a mano del maestro orfebre.' },
    { n: '04', t: 'Custodia Eterna', d: 'Limpieza, reajuste y restauración de por vida. Si una joya lleva la impronta de Bersaglio, siempre tendrá las puertas abiertas de nuestra casa para su preservación absoluta.' },
    { n: '05', t: 'El Respeto al Secreto', d: 'Garantizamos discreción absoluta. No divulgamos nombres ni exponemos las piezas de nuestros clientes. Comprendemos que cada joya custodia un relato privado.' },
    { n: '06', t: 'El Éxito en la Trascendencia', d: 'No evaluamos nuestro triunfo en cifras, sino en el retorno de nuestras piezas al atelier décadas más tarde, portadas orgullosamente por la siguiente generación.' },
];

const EQUIPO = [
    { n: 'Kary Mendoza',         r: 'Fundadora & Directora',     b: 'Diez años escuchando historias y traduciéndolas en piezas. Su firma está en cada decisión: la gema, el orfebre, el detalle final.' },
    { n: 'Maestro Eliécer Patiño', r: 'Orfebre principal',         b: 'Treinta y dos años en oficio. Aprendiz en Mompox, oficial en Cartagena. Cera perdida, engaste pavé, tallado de filigrana.' },
    { n: 'Lucía Restrepo',       r: 'Gemóloga GIA',              b: 'Certificada por el Gemological Institute of America. Selecciona y autentica cada esmeralda y diamante antes de que entre al taller.' },
    { n: 'Andrés Beltrán',       r: 'Diseño & dibujo técnico',   b: 'Boceto a mano, render 3D, prototipado en cera. Traduce conversaciones en planos que el orfebre puede ejecutar.' },
];

const PRENSA = [
    { m: 'Vogue Latinoamérica', t: '"La nueva ola de la alta joyería colombiana"', y: '2024' },
    { m: 'Forbes Colombia',     t: '"Bersaglio: el lujo discreto de Cartagena"',   y: '2023' },
    { m: 'El Espectador',       t: '"Kary Mendoza, la voz detrás del atelier"',    y: '2023' },
    { m: 'Revista Diners',      t: '"Esmeraldas con apellido"',                     y: '2022' },
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
                    Hace trece años, Kary Mendoza recorría las calles empedradas de Cartagena. No llevaba consigo un portafolio de ventas; llevaba el deseo de escuchar historias íntimas y la convicción de que una esmeralda fina debe ser el reflejo de quien la posee.
                </p>
                <p class="abt-hero-italic">
                    Hoy, el ritual permanece intacto en nuestro atelier del Centro Histórico. Un encuentro sin prisas, a puerta cerrada, consagrado a dar forma a tus instantes más preciados.
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
            <div class="mono abt-eyebrow">EL MANIFIESTO</div>
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
                <div class="mono abt-eyebrow">RECORRIDO</div>
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
                <div class="mono abt-eyebrow">EL TALLER</div>
                <h3 class="atl-text-title">
                    Donde el oficio<br>
                    <span class="italic emerald-text">toma forma</span>
                </h3>
                <p class="atl-text-p">
                    Doscientos metros cuadrados en el Centro Histórico de Cartagena.
                    Mesas de orfebrería del siglo pasado, lupas binoculares calibradas,
                    hornos de fundición, microscopios para engaste pavé.
                    Todo lo que entra al atelier sale firmado a mano.
                </p>
                <p class="atl-text-p">
                    Tres orfebres en planta, una gemóloga GIA certificada, un dibujante técnico
                    y Kary supervisando cada decisión. Sin más, sin menos.
                </p>
                <div class="atl-stats">
                    <div>
                        <div class="mono atl-stat-key">UBICACIÓN</div>
                        <div class="atl-stat-val">Centro Histórico<br>Cartagena de Indias</div>
                    </div>
                    <div>
                        <div class="mono atl-stat-key">VISITAS</div>
                        <div class="atl-stat-val">Solo con cita<br>Lun–Sáb · 10:00–19:00</div>
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
                <div class="mono abt-eyebrow">LAS MANOS</div>
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
function renderPrensa() {
    return html`
        <section class="abt-section">
            <div class="abt-section-header">
                <div class="mono abt-eyebrow">NOS HAN ESCRITO</div>
                <h2 class="abt-section-title">
                    En la <span class="italic emerald-text">prensa</span>
                </h2>
            </div>
            <div class="press-grid">
                ${PRENSA.map(p => html`
                    <div class="glass press-card">
                        <div class="display press-card-medium">${escape(p.m)}</div>
                        <div class="press-card-quote-wrap">
                            <div class="press-card-quote">${escape(p.t)}</div>
                        </div>
                        <div class="mono press-card-year">${escape(p.y)}</div>
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
                <div class="mono abt-eyebrow">PREGUNTAS FRECUENTES</div>
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
function renderAll() {
    return html`
        <div class="container abt-page">
            ${renderHero()}
            ${renderStats()}
            ${renderManifiesto()}
            ${renderValores()}
            ${renderTimeline()}
            ${renderAtelier()}
            ${renderEquipo()}
            ${renderCerts()}
            ${renderPrensa()}
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
