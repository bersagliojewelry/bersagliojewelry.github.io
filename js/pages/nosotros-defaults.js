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

// Los años de oficio se calculan desde 1983 en UN solo sitio del repositorio: si cada página
// tuviera su cuenta, volverían las tres cifras distintas que había el 2026-10-10.
import { aniosDeOficio } from '../home/siteContent-defaults.js';

export const NOSOTROS_DEFAULTS = {
    // 1. HERO — copy editorial de portada (texto plano)
    hero: {
        eyebrow:      'CAPÍTULO 00 · NUESTRA ALMA',
        titleL1:      'Un legado',
        titleEm:      'se susurra,',
        titleTail:    'no se compra.',
        lead:         'Empezamos visitando a nuestros clientes en la calidez de sus hogares, para acercarles piezas únicas. Hoy esa misma cercanía vive en dos espacios que se complementan: una tienda en línea para comprar tus piezas y recibirlas en todo el país, y nuestra Maison del Centro Histórico de Cartagena de Indias, donde te recibimos en persona.',
        leadItalic:   'Nos apasiona asesorar. En nuestro catálogo en línea encontrarás piezas listas para llevar, como anillos, aretes, cadenas y dijes en oro de 18K y esmeraldas colombianas. Y si lo que buscas no está ahí, creamos contigo una pieza a tu medida, a partir de tu historia.',
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
        titleTail: ', que se cuenta en nuestra casa y se queda contigo en forma de joya.',
        foot:     'MAISON BERSAGLIO · CARTAGENA DE INDIAS',
    },

    // 3. MAISON — filosofía Misión / Visión (texto plano)
    maison: {
        misionTitle: 'Nuestra promesa',
        misionDesc:  'Crear contigo piezas a tu medida, con una asesoría cercana. Te acompañamos a elegir la joya de un momento importante de tu vida, con el tiempo que esa elección pide.',
        visionTitle: 'El horizonte',
        visionDesc:  'Queremos ser la casa de alta joyería a la que vuelvas cada vez que tengas algo que celebrar, y a la que también traigas a los tuyos.',
    },

    // 4. VALORES — encabezado editable (B) + lista (el número 01..06 lo deriva el renderer del índice)
    valores: {
        eyebrow:  'NUESTROS PRINCIPIOS',
        titlePre: 'Seis cosas en las que',
        titleEm:  'no negociamos',
        items: [
            { t: 'La elegancia como silencio', d: 'Para nosotros la elegancia es un susurro. Queremos que tu joya Bersaglio hable de tu estilo con esa misma discreción.' },
            { t: 'El pacto de credibilidad',   d: 'Construimos relaciones duraderas con transparencia: te contamos lo que sabemos de cada pieza, para que elijas con tranquilidad.' },
            { t: 'La asesoría antes del oficio', d: 'Te asesoramos con paciencia hasta que encuentres la pieza que buscas o hasta que la creemos juntos.' },
            { t: 'Devoción en cada detalle',   d: 'Cuidamos con la misma devoción cada milímetro de la pieza y cada conversación contigo.' },
            { t: 'Cómplices de tu felicidad',  d: 'Nos gusta ser parte de tus días felices y diseñar con orgullo la joya que vas a llevar en ellos.' },
            { t: 'Una joya que se hereda',     d: 'Queremos que cada joya te acompañe por años y que, algún día, la lleve alguien que quieres.' },
        ],
    },

    // 5. TIMELINE — encabezado editable (B) + lista de capítulos (el orden del array = orden cronológico)
    timeline: {
        titlePre: 'Nuestra historia en',
        titleEm:  'cinco capítulos',
        items: [
            { y: '01', t: 'El diálogo inicial', d: 'Todo comenzó con visitas personalizadas en los hogares de nuestros clientes. Allí aprendimos que, antes de ver una joya, quien la elige quiere sentirse escuchado y acompañado.' },
            { y: '02', t: 'La consagración del espacio', d: 'Gracias a esta filosofía de servicio y cercanía, crecimos paso a paso hasta abrir nuestra casa en el Centro Histórico de Cartagena, donde mantenemos esa atención pausada e individual.' },
            { y: '03', t: 'Estándares y confianza', d: 'Consolidamos nuestra reputación con una costumbre que mantenemos hoy: cada gema tiene su propio certificado.' },
            { y: '04', t: 'Relaciones que duran', d: 'Acompañar y asesorar a cada cliente sigue siendo el centro de lo que hacemos.' },
            { y: '05', t: 'Lo que no cambia', d: 'Hoy seguimos como empezamos: te atendemos en persona y elegimos contigo la joya después de escuchar tu historia.' },
        ],
    },

    // 6. EQUIPO — lista (avatar = iniciales+gradiente derivado; foto opcional a futuro, aditiva)
    equipo: {
        items: [
            { n: 'Kary Mendoza',           r: 'Fundadora',                b: 'Escucha con empatía las historias de nuestros clientes para traducirlas en joyas. Guía la selección de cada gema y revisa el detalle final de cada pieza.' },
            { n: 'Verónica Barrios',       r: 'Directora Administrativa', b: 'Organiza con atención al detalle los procesos de nuestra casa joyera, para que cada pieza y cada visita reciban el mismo cuidado.' },
            { n: 'Daniela Mendoza',        r: 'Asesora Comercial',        b: 'Te acompaña con calidez y resuelve contigo cada duda sobre la pieza que te interesa.' },
            { n: 'Tania Almonte',          r: 'Asesora Comercial',        b: 'Conversa contigo sobre lo que buscas y te ayuda a elegir la joya o el regalo.' },
        ],
    },

    // 7. ATELIER — la casa/atelier (texto plano): título con énfasis + 2 párrafos + ubicación/visitas (2 líneas c/u)
    atelier: {
        title1:      'Donde el oficio',
        titleEm:     'toma forma',
        p1:          'En el Centro Histórico de Cartagena está nuestra casa, que trabaja en sintonía con nuestra tienda en línea. Allí puedes ver nuestras piezas en persona o sentarte con nosotros a diseñar la tuya. Y si no puedes venir, te la enviamos.',
        p2:          'Kary y su equipo te acompañan sin prisa en cada paso, desde la primera conversación hasta que la joya llega a tus manos.',
        ubicacionL1: 'Calle 36 # 6-32 · San Agustín Chiquita',
        ubicacionL2: 'Centro Histórico · Cartagena de Indias',
        // «Atendemos con cita previa» es FALSO (la cita no es obligatoria) y «taller visitable»
        // está NO VERIFICADO: la tabla de hechos manda usar «nuestra casa». Esto decía «Con o sin
        // cita previa», que insinúa el requisito justo al nombrarlo.
        visitasL1:   'Puertas abiertas, sin cita',
        // 9:30 a 19:00 los SIETE días, festivos y domingos incluidos (dato del dueño, 2026-10-10;
        // es lo que dicen el Perfil de Empresa, el JSON-LD y Contacto). Este default decía
        // «8:00 a.m. – 7:00 p.m.», o sea que si el documento del panel faltase, la web habría
        // vuelto a publicar la hora vieja. Mismo formato que usa el panel hoy, para que coincidan.
        visitasL2:   'Todos los días · 9:30–19:00',
        image:       '',   // imagen del atelier custom (Storage); vacío → fondo CSS por defecto
        imageLqip:   '',   // §103 F1: placeholder difuso (data-URI) generado al subir image.
    },

    // 8. CIFRAS — lista de stats.
    //
    // Se derivan del CÓDIGO y el panel ya no las pisa (ver `cifrasDeLaCasa` en
    // js/home/siteContent-defaults.js y el merge de abajo). Lo que había publicado en el panel el
    // 2026-10-10, y por qué se retiró:
    //   «43 · desde 1983 · años de oficio»     → se conserva, y ahora se CALCULA.
    //   doce mil piezas entregadas «con libreta de origen» → retirada: nadie puede mostrar de
    //      dónde sale el número, y chocaba con las cinco mil piezas únicas que decía el home.
    //   doce países alcanzados «con entrega registrada»       → retirada: sin fuente.
    //   trazabilidad «del cien por cien» de gema, oro y orfebre → retirada: suena a sello
    //      certificado, y el único certificado real es el de cada pieza.
    // Si aparece el dato real —el conteo de libretas, los países a los que de verdad se ha
    // enviado—, vuelve aquí CON su fuente escrita al lado, no en un campo del panel.
    cifras: {
        items: [],   // se rellena en mergeNosotros con cifrasDeNosotros()
    },

    // 9. CERTIFICACIONES — lista (4 cards)
    certificaciones: {
        items: [
            { t: 'Gemas certificadas',             d: 'Cada una con su certificado; el laboratorio cambia según la piedra' },
            { t: 'Garantía comercial de por vida', d: 'Por defectos de fabricación, mientras el atelier esté en operación' },
        ],
    },

    // 10. RESEÑAS — DEFAULT VACÍO a propósito (`[[feedback_no_demo_en_index]]`): antes tenía 4
    // testimonios FICTICIOS de demo. En prod ya se ocultan (Firestore `resenas.items:[]` →
    // hide-when-empty), pero se retiran del código para eliminar el riesgo latente de que un
    // reset de Firestore publique testimonios falsos. Poblar con las reseñas REALES (85 ★5,0 del
    // GBP) es TODO-48 — decisión de curaduría + aristas legales de republicar reseñas de Google.
    resenas: {
        items: [],
    },

    // 11. FAQS — lista (6 preguntas)
    faqs: {
        items: [
            { q: '¿Cuánto tarda una pieza a medida?',      a: 'Depende del diseño y de las piedras que elijas. Antes de empezar te decimos cuánto tomará.' },
            { q: '¿Trabajan con piedras del cliente?',     a: 'Sí. Recibimos tus gemas heredadas y creamos contigo una pieza nueva con ellas.' },
            { q: '¿Hacen envíos internacionales?',         a: 'Sí, caso por caso. Cotizamos el envío internacional por WhatsApp y confirmamos contigo los costos totales antes de despachar; elegimos el transportador según el destino y te compartimos la guía de seguimiento. El flete, los aranceles e impuestos del país de destino corren por cuenta del comprador.' },
            { q: '¿Aceptan financiación?',                 a: 'Puedes pagar con Wompi o por transferencia. Si usas tarjeta de crédito, las cuotas y sus intereses dependen de tu entidad bancaria. Para piezas a la medida o de mayor valor, coordinamos el pago contigo por WhatsApp.' },
            // Dice «nuestra casa», no «el atelier»: el taller visitable está NO VERIFICADO. Y la
            // visita se ofrece sin pedirla como requisito; «sin compromiso de compra» se cae
            // porque está NO VERIFICADO y además ablanda el filtro (tabla de hechos §4-bis).
            { q: '¿Puedo pasar a ver las piezas sin comprar?', a: 'Claro que sí. Nuestra casa del Centro Histórico abre todos los días de 9:30 a 7:00 y puedes entrar sin avisar; si prefieres que te esperemos con calma, agendamos tu visita y te mostramos las piezas con el tiempo que esa elección pide.' },
            { q: '¿Qué garantía tienen las piezas?',       a: 'Además de la garantía legal, tienen garantía comercial de por vida por defectos de fabricación, mientras el atelier esté en operación: si una piedra se afloja o una soldadura cede por una falla de fabricación, la reparamos sin costo.' },
        ],
    },

    // 12. CIERRE — CTA final (texto plano)
    cierre: {
        ctaEyebrow: 'EMPEZAMOS POR UNA CONVERSACIÓN',
        ctaTitle1:  'Tu próxima joya',
        ctaTitleEm: 'nace de escucharte',
        ctaLead:    'Agenda una visita a nuestra casa o escríbenos, y hablamos con calma de la pieza que tienes en mente.',
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
/**
 * Las cuatro cifras de Nosotros. Cada una con su FUENTE, y ninguna redonda sin respaldo.
 * Forma `{n, l, s}` = número, etiqueta, apunte (la que pinta `nosotrosStatsSection`).
 */
export function cifrasDeNosotros(hoy = new Date()) {
    return [
        // 1983 lo confirmó el dueño y está publicado en el Perfil de Empresa de Google. Se CALCULA
        // para que no haya que acordarse de subirlo cada 1 de enero.
        { n: String(aniosDeOficio(hoy)), l: 'años de oficio', s: 'desde 1983' },
        // Se nombra el DOCUMENTO, nunca el laboratorio (§212.8): el laboratorio depende de la gema
        // y vive en la ficha de la pieza, que es donde es cierto. VERIFICADO por el dueño el
        // 23-sep en la tabla de hechos de `voz-pauta-bersaglio §4-bis`.
        { n: 'Por pieza', l: 'certificado de la gema', s: 'con su número de reporte' },
        // VERIFICADO en la misma tabla, con respaldo en `42-LEGAL` y en los Términos §05. Se dice
        // SIEMPRE con su alcance: es por defectos de fabricación, no una garantía sin límites.
        { n: 'De por vida', l: 'garantía', s: 'por defectos de fabricación' },
        // VERIFICADO en la misma tabla (§157.11). Y nunca «envíos asegurados», que es FALSO: no
        // se contrata seguro.
        { n: 'A todo el país', l: 'envíos', s: 'con su guía de seguimiento' },
    ];
}

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
        // Las cifras NO se mergean con el panel: son afirmaciones comprobables sobre el negocio y
        // se derivan del código, con su fuente. El documento en vivo publicaba tres que nadie
        // podía respaldar (las piezas entregadas, los países alcanzados y la trazabilidad) y una
        // que contradecía al home. Un número sin fuente no es un dato (y en Colombia es publicidad
        // engañosa, Ley 1480): se retira hasta que haya de dónde sacarlo.
        cifras:          { items: cifrasDeNosotros() },
        certificaciones: mergeItems(d.certificaciones, D.certificaciones),
        resenas:         mergeItems(d.resenas,         D.resenas),
        faqs:            mergeItems(d.faqs,            D.faqs),
        cierre:          { ...D.cierre, ...(d.cierre || {}) },
    };
}

export default { NOSOTROS_DEFAULTS, mergeNosotros };
