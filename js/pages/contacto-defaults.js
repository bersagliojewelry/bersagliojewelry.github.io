/**
 * js/pages/contacto-defaults.js — DEFAULTS del COPY de la página Contacto (PURO).
 * Solo las secciones de texto editables (hero · proceso · faq); el FORMULARIO, los
 * canales y los horarios siguen ESTANDARIZADOS (funcionales, no editables aquí — los
 * datos de contacto irán al singleton `global` en una fase aparte). Patrón §5-G:
 * render = merge(DEFAULTS, siteContent/contacto).
 */

export const CONTACTO_DEFAULTS = {
    hero: {
        eyebrow:    'CONSERJERÍA PRIVADA',
        titleLine1: 'Un encuentro pausado,',
        titleEm:    'una esmeralda única,',
        titleTail:  'un legado eterno.',
        lead:       'Te invitamos a dar el primer paso. Elige la vía de comunicación que te resulte más cómoda; cada mensaje es atendido de manera directa y confidencial por Kary Mendoza y su equipo.',
    },
    proceso: {
        eyebrow:    'QUÉ ESPERAR DE NOSOTROS',
        title1:     'Después de que',
        title2:     'nos escribes',
        step1Title: 'Lectura Personal',   step1Desc: 'Tu mensaje es leído directamente por Kary Mendoza y su equipo. Prescindimos de respuestas automáticas o chatbots; valoramos el contacto humano desde el primer segundo.', step1Time: 'En el día',
        step2Title: 'Primer Diálogo',     step2Desc: 'Nos pondremos en contacto para entender mejor el contexto de tu joya: la historia detrás del encargo, el tipo de gema preferida y las expectativas de entrega.', step2Time: '< 24 horas',
        step3Title: 'Encuentro Pausado',  step3Desc: 'Agendamos una llamada de voz, un chat directo o un encuentro en nuestra Maison del Centro Histórico de Cartagena. Una conversación con calma, sin presiones de ningún tipo.', step3Time: 'A tu ritmo',
        step4Title: 'Manos a la Obra',    step4Desc: 'Si decides que Bersaglio sea el custodio de tu legado, tu idea pasa al taller, y te contamos cómo avanza la pieza antes de darla por terminada.', step4Time: 'A medida',
    },
    faq: {
        eyebrow: 'ANTES DE TU VISITA',
        title1:  'Lo que necesitas',
        title2:  'saber',
        lead:    'Cuatro respuestas rápidas para que llegues con todo claro. Si te queda alguna duda, escríbenos por WhatsApp.',
        q1: '¿Necesito cita previa?',      a1: 'No es obligatoria: puedes acercarte directamente o reservar una cita para una atención más dedicada. Ambas son bienvenidas.',
        q2: '¿Hay parqueadero?',           a2: 'En el Centro Histórico encuentras varios parqueaderos privados y seguros a pocos pasos del atelier.',
        q3: '¿Puedo llevar acompañantes?', a3: 'Hasta tres personas. Indícalo al agendar para preparar el espacio.',
        // El francés y el italiano NO están en la tabla de hechos: nadie ha podido respaldar que
        // la casa atienda en esos idiomas, y prometerlo a un turista que llega contando con ello
        // es de las promesas que peor se rompen. El inglés SÍ consta —la publicación del Perfil
        // es bilingüe y la guía del Journal está escrita en inglés—. Si resulta cierto, vuelve
        // aquí con su fuente, como las cifras.
        q4: '¿Atienden en otro idioma?',   a4: 'Español e inglés. Si hablas otro, escríbenos antes de venir y buscamos la manera de acompañarte bien.',
    },
};

/** merge(DEFAULTS, doc) por sub-mapa. Robusto a doc null/parcial. */
export function mergeContacto(doc) {
    const d = doc || {};
    return {
        hero:    { ...CONTACTO_DEFAULTS.hero,    ...(d.hero || {}) },
        proceso: { ...CONTACTO_DEFAULTS.proceso, ...(d.proceso || {}) },
        faq:     { ...CONTACTO_DEFAULTS.faq,     ...(d.faq || {}) },
    };
}
