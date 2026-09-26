/**
 * js/home/siteContent-defaults.js — DEFAULTS del contenido del Home (PURO, testeable).
 *
 * SSoT del texto "horneado" del Home, compartido por: (a) el render público
 * (hero.js/editorial.js pintan merge(DEFAULTS, siteContent/home)) y (b) el pre-llenado
 * del admin (singleton-admin pre-rellena el form con estos defaults para que Kary edite
 * desde el texto ACTUAL, no desde cero). Patrón del gran plan §5-G: singleton =
 * merge({...DEFAULTS, ...doc}) → cero downtime + Kary parte de lo que ya se ve.
 *
 * NO-DEMO no aplica a hero/editorial (son marca, hideWhenEmpty:false): siempre se ven,
 * con DEFAULTS si Firestore está vacío. Cuando Kary guarde, sus valores ganan (override).
 */

export const HOME_DEFAULTS = {
    hero: {
        bgImage:          '',   // P3.5: URL de portada custom (Storage). Vacío → <picture> estático optimizado.
        bgImageLqip:      '',   // §103 F1: placeholder difuso (data-URI) generado al subir bgImage.
        locator:          'Cartagena de Indias · Colombia',
        eyebrow:          'Alta Joyería en Esmeraldas, Diamantes y Oro de 18K',   // eyebrow VISIBLE corto (§185): "Cartagena/atelier/tienda en línea" ya viven en title/meta/locator/manifiesto/schema → cero pérdida SEO, sin texto escondido
        headline1:        'El arte de escuchar tu historia,',
        headline2:        'tallado en una joya única.',
        manifesto:        'Desde nuestro atelier en el Centro Histórico de Cartagena de Indias fabricamos —no revendemos— cada joya en oro de 18 quilates, esmeraldas colombianas y diamantes: anillos, argollas de matrimonio, cadenas, aretes y dijes que nacen para acompañarte. Compra en línea una pieza lista de nuestra colección y te la enviamos a todo el país, o co-creamos a tu medida la que habitará en tu historia. Más que un accesorio, una herencia destinada a custodiar tu esencia.',
        ctaLabel:         'Descubrir la colección',
        ctaHref:          '/colecciones.html',
        signatureEyebrow: 'Una creación de',
        signatureName:    'Kary Mendoza',
    },
    editorial: {
        image:      '',   // foto de la sección custom (Storage); vacía → fondo CSS por defecto
        imageLqip:  '',   // §103 F1: placeholder difuso (data-URI) generado al subir image.
        chip:       'Editorial',
        imageTitle: 'La Verde, 2026',
        imageSub:   'Piezas trabajadas en torno a la esmeralda colombiana.',
        eyebrow:    'Nuestra filosofía',
        title1:     'El arte de la orfebrería pausada:',
        title2:     'más que una joya, un legado familiar.',
        lead:       'Entendemos la esmeralda y el oro de 18 quilates como portadores de la memoria humana. Nos convertimos en cómplices silenciosos de los instantes que definen una vida, como una promesa de amor o la llegada de un hijo.',
        quote:      '"Una esmeralda colombiana se lleva toda la vida y, algún día, pasa a la siguiente generación."',
        // stat1 = 32 años de oficio: voz-pauta §4-bis (Daniel, chat 2026-09-23). stat2 (5000+) SIGUE sin confirmar
        // (TODO-47). El 12+/800+/JA de antes era DEMO (`[[feedback_no_demo_en_index]]`). NO sincronizado: el doc
        // siteContent/home.editorial en vivo aún dice '40+'/'Años' y gana sobre este default hasta que se escriba.
        stat1Num:   '32',     stat1Lab: 'Años de oficio',
        stat2Num:   '5000+',  stat2Lab: 'Piezas únicas',
        stat3Num:   'Piezas', stat3Lab: 'Certificadas',
    },
    atelier: {
        chip:       'Atelier Bersaglio',
        title1:     'Tu pieza a la medida,',
        title2:     'paso a paso',
        lead:       'Son cuatro pasos, de la primera idea a la garantía de tu joya, y los damos contigo.',
        step1Title: 'El Diseño y Concepto',      step1Desc: 'Diseñamos la joya contigo y elegimos juntos el metal y las gemas que la forman.',
        step2Title: 'Asesoría Confidencial',     step2Desc: 'Te escuchamos con calma hasta dar con la pieza que tienes en mente.',
        step3Title: 'Certificado por gema',      step3Desc: 'Respaldamos cada gema que ponemos en tu joya con su propio certificado.',
        step4Title: 'Después de la entrega',     step4Desc: 'Nuestra garantía comercial cubre los defectos de fabricación sin límite de tiempo, mientras el atelier esté en operación.',
        ctaLabel:   'Iniciar mi pieza',
        ctaHref:    '/contacto.html',
    },
    cta: {
        eyebrow:   'Compra en línea o visítanos en persona',
        title1:    'Nuestra Maison',
        title2:    'Cartagena de Indias',
        lead:      'Explora nuestras colecciones y compra en línea con envío a todo el país, o cruza el umbral de nuestra Maison en el Centro Histórico de Cartagena de Indias. Allí conversamos sin prisa sobre la pieza que buscas, lista para llevar o creada a tu medida.',
        cta1Label: 'Agendar cita privada',  cta1Href: '/contacto.html',
        cta2Label: 'Explorar colecciones',  cta2Href: '/colecciones.html',
        address:   'Calle 36 # 6-32 · San Agustín Chiquita / Centro Histórico · Bolívar, Colombia',
    },
};

/** merge(DEFAULTS, doc) por sub-mapa de sección. Robusto a doc null/parcial. */
export function mergeHome(doc) {
    const d = doc || {};
    return {
        hero:      { ...HOME_DEFAULTS.hero,      ...(d.hero || {}) },
        editorial: { ...HOME_DEFAULTS.editorial, ...(d.editorial || {}) },
        atelier:   { ...HOME_DEFAULTS.atelier,   ...(d.atelier || {}) },
        cta:       { ...HOME_DEFAULTS.cta,        ...(d.cta || {}) },
    };
}
