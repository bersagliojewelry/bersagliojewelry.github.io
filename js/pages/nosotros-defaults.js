/**
 * js/pages/nosotros-defaults.js — DEFAULTS del contenido de la página Nosotros (PURO).
 *
 * SSoT del copy horneado. El render público hace merge(DEFAULTS, siteContent/nosotros)
 * campo-a-campo. Patrón §5-G (espejo de contacto-defaults.js) extendido con LISTAS (P4):
 * cada sección es un sub-mapa; las listas son arrays DENTRO de un sub-mapa (NUNCA un array
 * a nivel raíz). Las claves coinciden EXACTO con la whitelist de firestore.rules.
 *
 * MODELO PLANO (síntesis consejo externo Gemini 2026-06-19): se descartó el grab-bag
 * `cartagena` (acoplaba 4 secciones lógicas distintas) por claves LÓGICAS independientes.
 * Hecho ANTES de que existan datos en prod → migración cero. 12 claves:
 *   hero · manifiesto · maison · valores · timeline · equipo · atelier ·
 *   cifras · certificaciones · resenas · faqs · cierre
 *
 * Reglas de merge:
 *   - campos planos  → spread { ...DEFAULTS.x, ...(doc.x||{}) } (doc gana, default rellena)
 *   - listas (items) → REEMPLAZO, no spread: una lista `[]` explícita se respeta
 *     (hide-when-empty → la sección desaparece); una lista ausente cae al default.
 *
 * Decoración NO editable: el número 01..06 de `valores` y las iniciales del avatar de
 * equipo se DERIVAN del índice/nombre; las estrellas de reseñas y los encabezados de
 * sección sin conteo son LITERALES fijos en el renderer. Los renderers toleran ítems
 * malformados (guard por-ítem) para que una escritura corrupta no blanquee la página.
 */

export const NOSOTROS_DEFAULTS = {
    // 1. HERO — copy editorial de portada (texto plano)
    hero: {
        eyebrow:      'CAPÍTULO 00 · NUESTRA ALMA',
        titleL1:      'Un legado',
        titleEm:      'se susurra,',
        titleTail:    'no se compra.',
        lead:         'Nacimos con una visión clara: acercar piezas únicas a quienes aprecian la elegancia y el valor de una joya auténtica. Nuestro viaje comenzó desde cero, visitando a nuestros clientes en la calidez de sus hogares, construyendo relaciones basadas en la confianza y en una cercanía que hoy se mantiene como el alma del atelier.',
        leadItalic:   'Más que vender joyas, nos apasiona asesorar. Diseñamos con la convicción de que una pieza no es un simple accesorio, sino un reflejo de tu esencia, una emoción duradera y una inversión que trasciende en el tiempo.',
        imageEyebrow: 'ATELIER · CARTAGENA DE INDIAS',
        quote:        'Nuestra casa es tu casa.',
        quoteAuthor:  'KARY MENDOZA',
        image:        '',   // imagen de portada custom (Storage); vacío → fondo CSS por defecto
        imageLqip:    '',   // §103 F1: placeholder difuso (data-URI) generado al subir image.
    },

    // 2. MANIFIESTO — frase central con énfasis en el medio (texto plano)
    manifiesto: {
        titlePre: 'Sostenemos que el lujo auténtico carece de estridencias.',
        titleEm:  'Es un secreto compartido entre dos personas',
        titleTail: ', esbozado en la calidez de nuestro atelier, donde el tiempo se detiene para dar vida a una creación que trascenderá nuestra propia existencia.',
        foot:     'MAISON BERSAGLIO · CARTAGENA DE INDIAS',
    },

    // 3. MAISON — filosofía Misión / Visión (texto plano)
    maison: {
        misionTitle: 'Nuestra Promesa',
        misionDesc:  'Concebir piezas exclusivas mediante una asesoría íntima y cercana. Acompañamos a nuestros clientes en la elección de joyas que representen su distinción y los instantes más valiosos de su vida, asegurando siempre una experiencia de confianza, calidad y emotividad perdurable.',
        visionTitle: 'El Horizonte',
        visionDesc:  'Ser el atelier de alta joyería personalizada de referencia en excelencia y discreción, consolidando un acompañamiento generacional que perpetúa el legado emocional de nuestros clientes a través de piezas de autor únicas que vencen al tiempo.',
    },

    // 4. VALORES — encabezado editable (B) + lista (el número 01..06 lo deriva el renderer del índice)
    valores: {
        eyebrow:  'NUESTROS PRINCIPIOS',
        titlePre: 'Seis cosas en las que',
        titleEm:  'no negociamos',
        items: [
            { t: 'La Elegancia como Silencio', d: 'Entendemos la sofisticación no como un destello ruidoso, sino como un susurro de distinción. Una joya Bersaglio es la expresión poética de tu estilo y de tu esencia.' },
            { t: 'El Pacto de Credibilidad',   d: 'Construimos relaciones duraderas basadas en la transparencia, la credibilidad y una confianza inquebrantable que custodia tu tranquilidad.' },
            { t: 'La Asesoría antes del Oficio', d: 'Antes que vender, nos dedicamos a guiarte y asesorarte con paciencia, asegurando que cada cliente encuentre o co-cree la pieza idónea.' },
            { t: 'Devoción en cada Detalle',   d: 'Cada milímetro esculpido y cada interacción con nosotros está cuidada con devoción, buscando hacer de tu experiencia un recuerdo memorable.' },
            { t: 'Cómplices de tu Felicidad',  d: 'Nos apasiona ser parte de tus momentos más significativos. Diseñamos con el orgullo de dar forma física a tus emociones y celebraciones sagradas.' },
            { t: 'Valor e Inversión Eterna',   d: 'Transmitimos a nuestros clientes que una joya no es un gasto efímero, sino una inversión duradera que conserva e incrementa su significado y valor en el tiempo.' },
        ],
    },

    // 5. TIMELINE — encabezado editable (B) + lista de capítulos (el orden del array = orden cronológico)
    timeline: {
        titlePre: 'Trece años en',
        titleEm:  'cinco capítulos',
        items: [
            { y: '2013', t: 'El Diálogo Inicial', d: 'El taller comenzó con un sueño, dedicación y visitas personalizadas directamente en los hogares de nuestros clientes. Este contacto íntimo nos enseñó que antes que una joya, el huésped busca sentirse seguro, asesorado y acompañado en su elección.' },
            { y: '2016', t: 'La Consagración del Espacio', d: 'Gracias a esta filosofía de servicio y cercanía, crecimos paso a paso. Abrimos las puertas de nuestro primer atelier privado en el centro histórico de Cartagena, un refugio para mantener esa atención pausada e individual.' },
            { y: '2020', t: 'Estándares y Confianza', d: 'Consolidamos nuestra reputación basándonos en la transparencia absoluta de cada gema. Cada esmeralda y diamante se entrega con trazabilidad total y certificación ética, reforzando la credibilidad y el valor real de cada inversión.' },
            { y: '2023', t: 'Una Década de Relaciones', d: 'Cumplimos diez años de trayectoria construyendo vínculos duraderos. El acompañamiento y asesoramiento personalizado se consolidan formalmente como el corazón absoluto de Bersaglio.' },
            { y: '2026', t: 'La Verde y la Esencia', d: 'Hoy, seguimos conservando intacta la misma esencia con la que iniciamos: ofrecer una experiencia cercana, elegante y completamente personalizada, donde cada cliente se siente especial y cada joya tiene un significado real.' },
        ],
    },

    // 6. EQUIPO — lista (avatar = iniciales+gradiente derivado; foto opcional a futuro, aditiva)
    equipo: {
        items: [
            { n: 'Kary Mendoza',           r: 'Fundadora & Directora',   b: 'Diez años dedicada a escuchar con empatía las historias de nuestros clientes para traducirlas en obras de arte eternas. Su mirada sensible guía la selección de cada gema y supervisa el detalle final de cada pieza.' },
            { n: 'Maestro Eliécer Patiño', r: 'Orfebre principal',       b: 'Treinta y dos años de maestría y devoción orfebre. Formado bajo la tradición de la filigrana en Mompox y perfeccionado en Cartagena, domina la fundición a cera perdida y el engaste pavé de alta precisión.' },
            { n: 'Lucía Restrepo',         r: 'Gemóloga GIA',            b: 'Certificada por el prestigioso Gemological Institute of America (GIA). Es la guardiana de la excelencia gemológica de la Maison, analizando la pureza, color y procedencia de cada esmeralda y diamante.' },
            { n: 'Andrés Beltrán',         r: 'Diseño & dibujo técnico', b: 'Traduce las conversaciones íntimas del atelier en bocetos poéticos a mano alzada, planos técnicos y modelados 3D meticulosos, sirviendo de puente entre el deseo del cliente y el crisol del orfebre.' },
        ],
    },

    // 7. ATELIER — la casa/atelier (texto plano): título con énfasis + 2 párrafos + ubicación/visitas (2 líneas c/u)
    atelier: {
        title1:      'Donde el oficio',
        titleEm:     'toma forma',
        p1:          'En el corazón del Centro Histórico de Cartagena tenemos nuestra casa: un espacio abierto al público donde te recibimos con calma y una atención cálida y personalizada. Aquí se conversa, se diseña y se crea — porque en Bersaglio no revendemos: fabricamos cada pieza.',
        p2:          'Kary y su equipo acompañan cada paso: desde la primera conversación y el boceto a mano alzada, hasta dar vida a la joya y entregarla firmada. Un proceso cercano, sin prisas y hecho a la medida de tu historia.',
        ubicacionL1: 'Calle 36 # 6-32 · San Agustín Chiquita',
        ubicacionL2: 'Centro Histórico · Cartagena de Indias',
        visitasL1:   'Con o sin cita previa',
        visitasL2:   'Lun–Sáb · 10:00–19:00',
        image:       '',   // imagen del atelier custom (Storage); vacío → fondo CSS por defecto
        imageLqip:   '',   // §103 F1: placeholder difuso (data-URI) generado al subir image.
    },

    // 8. CIFRAS — lista (4 columnas de stats)
    cifras: {
        items: [
            { n: '13',     l: 'años de oficio',    s: 'desde 2013' },
            { n: '+1.200', l: 'piezas entregadas', s: 'con libreta de origen' },
            { n: '40',     l: 'países alcanzados', s: 'envíos asegurados' },
            { n: '100%',   l: 'trazabilidad',      s: 'gema · oro · orfebre' },
        ],
    },

    // 9. CERTIFICACIONES — lista (4 cards)
    certificaciones: {
        items: [
            { t: 'Jewelers of America',           d: 'Miembro acreditado desde 2020' },
            { t: 'GIA',                            d: 'Reportes gemológicos en cada diamante' },
            { t: 'Muzo Origin',                    d: 'Certificación de mina en cada esmeralda' },
            { t: 'Responsible Jewellery Council',  d: 'Trazabilidad de oro y prácticas éticas' },
        ],
    },

    // 10. RESEÑAS — lista (4 cards) — TODO(contenido real): Kary pega reseñas reales de Google Maps.
    resenas: {
        items: [
            { n: 'Valentina Restrepo', t: 'Llegué sin saber muy bien qué quería y salí con la pieza de mis sueños. Kary entendió mi historia mejor que yo. El trato es de otro nivel.', loc: 'Reseña en Google Maps' },
            { n: 'Andrés Mejía',       t: 'Mandé hacer el anillo de compromiso y superó todo lo que imaginaba. Se siente el amor por el oficio en cada detalle. Mil gracias.', loc: 'Reseña en Google Maps' },
            { n: 'Camila Tordecilla',  t: 'Un lugar precioso en el Centro Histórico. Te reciben con un café y una paciencia que ya no se ve. La esmeralda quedó espectacular.', loc: 'Reseña en Google Maps' },
            { n: 'Juan Pablo Vergara', t: 'Calidad real y honestidad. Me explicaron cada piedra con su certificado. Volveré sin duda para la próxima ocasión especial.', loc: 'Reseña en Google Maps' },
        ],
    },

    // 11. FAQS — lista (6 preguntas)
    faqs: {
        items: [
            { q: '¿Cuánto tarda una pieza a medida?',      a: 'Entre cuatro y seis semanas desde la aprobación del boceto. La primera conversación, los renders y los ajustes pueden sumar dos semanas adicionales. No aceleramos plazos: el oficio paciente no admite atajos.' },
            { q: '¿Trabajan con piedras del cliente?',     a: 'Sí. Recibimos gemas heredadas, las evaluamos con nuestra gemóloga, y las integramos en una pieza nueva. Si la talla original tiene daños, ofrecemos retalle previo en taller especializado.' },
            { q: '¿Hacen envíos internacionales?',         a: 'Sí. Coordinamos el envío internacional con seguro y guía de seguimiento; Bersaglio selecciona el transportador según el destino y confirma contigo los costos antes de despachar. Los aranceles e impuestos del país de destino corren por cuenta del comprador.' },
            { q: '¿Aceptan financiación?',                 a: 'Sí. A través de la pasarela Wompi puedes diferir tu compra hasta en cuatro cuotas con 0% de interés, según tu entidad bancaria y el medio de pago que elijas. Para condiciones especiales, escríbenos y lo coordinamos contigo.' },
            { q: '¿Puedo visitar el atelier sin comprar?', a: 'Por supuesto. La cita previa es solo para garantizar que tengamos tiempo para ti. Recibirás un café, te mostraremos el taller, conocerás al maestro orfebre. Sin compromiso de compra.' },
            { q: '¿Qué garantía tienen las piezas?',       a: 'Garantía de por vida en estructura y engaste. Si una piedra se afloja, la reparamos sin costo. Si una soldadura cede, la rehacemos. Mientras Bersaglio exista, tu pieza tiene casa.' },
        ],
    },

    // 12. CIERRE — CTA final (texto plano)
    cierre: {
        ctaEyebrow: 'EMPEZAMOS POR UNA CONVERSACIÓN',
        ctaTitle1:  'Tu próxima joya',
        ctaTitleEm: 'comienza con un café',
        ctaLead:    'Agenda una visita al atelier o escríbenos. Sin compromiso, sin guion, sin prisas. Solo una conversación.',
        ctaLabel:   'Hablemos',
    },
};

/** Una lista válida del doc reemplaza a la default; cualquier no-array cae al default. */
function mergeList(docVal, defVal) {
    return Array.isArray(docVal) ? docVal : defVal;
}

/** Atajo: sub-mapa que es SOLO una lista (items). */
function mergeItems(docSec, defSec) {
    return { items: mergeList(docSec && docSec.items, defSec.items) };
}

/**
 * merge(DEFAULTS, doc) — espejo de mergeContacto extendido con listas. Robusto a doc
 * null/parcial. Campos planos por spread; listas por REEMPLAZO (una `[]` explícita se
 * respeta → hide-when-empty). NUNCA fusiona arrays índice-por-índice.
 */
export function mergeNosotros(doc) {
    const d = doc || {};
    const D = NOSOTROS_DEFAULTS;
    return {
        hero:            { ...D.hero,       ...(d.hero || {}) },
        manifiesto:      { ...D.manifiesto, ...(d.manifiesto || {}) },
        maison:          { ...D.maison,     ...(d.maison || {}) },
        valores:         { ...D.valores,  ...(d.valores  || {}), items: mergeList(d.valores  && d.valores.items,  D.valores.items) },
        timeline:        { ...D.timeline, ...(d.timeline || {}), items: mergeList(d.timeline && d.timeline.items, D.timeline.items) },
        equipo:          mergeItems(d.equipo,          D.equipo),
        atelier:         { ...D.atelier,   ...(d.atelier || {}) },
        cifras:          mergeItems(d.cifras,          D.cifras),
        certificaciones: mergeItems(d.certificaciones, D.certificaciones),
        resenas:         mergeItems(d.resenas,         D.resenas),
        faqs:            mergeItems(d.faqs,            D.faqs),
        cierre:          { ...D.cierre, ...(d.cierre || {}) },
    };
}

export default { NOSOTROS_DEFAULTS, mergeNosotros };
