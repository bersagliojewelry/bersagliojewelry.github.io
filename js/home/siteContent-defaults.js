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
        imageSub:   'Seis piezas esculpidas alrededor de la luz esmeralda colombiana.',
        eyebrow:    'Nuestra filosofía',
        title1:     'El arte de la orfebrería pausada:',
        title2:     'más que una joya, un legado familiar.',
        lead:       'Entendemos la esmeralda y el oro de 18 quilates como portadores de la memoria humana. Nos convertimos en cómplices silenciosos de los instantes que definen una vida: promesas que trascienden el tiempo, hitos de amor incondicional y el recuerdo indeleble de quienes somos.',
        quote:      '"Nuestras esmeraldas colombianas de Muzo y Chivor no son meras pertenencias; son fragmentos de tierra viva custodiados por almas sensibles para ser entregados a la siguiente generación."',
        // Valores REALES (confirmados por Daniel 2026-07-17): el 12+/800+/JA anterior era DEMO
        // (`[[feedback_no_demo_en_index]]`). Sincronizados con siteContent/home.editorial (en vivo).
        stat1Num:   '40+',    stat1Lab: 'Años',
        stat2Num:   '5000+',  stat2Lab: 'Piezas únicas',
        stat3Num:   'Piezas', stat3Lab: 'Certificadas',
    },
    atelier: {
        chip:       'Atelier Bersaglio',
        title1:     'El viaje de creación de',
        title2:     'una pieza de culto',
        lead:       'Un recorrido artesanal meticuloso que transforma una visión en un objeto eterno.',
        step1Title: 'El Diseño y Concepto',      step1Desc: 'Concebimos la joya desde el boceto inicial sobre papel, seleccionando metales nobles y gemas con carácter propio.',
        step2Title: 'Asesoría Confidencial',     step2Desc: 'Te acompañamos en cada etapa de la elección. Un diálogo íntimo y pausado para dar con la pieza exacta que refleje tu legado.',
        step3Title: 'Garantía y Certificación',  step3Desc: 'Respaldamos la autenticidad y excelencia de cada piedra con reportes internacionales de la GIA y origen de mina.',
        step4Title: 'Custodia de por vida',      step4Desc: 'Nuestras piezas nacen con vocación de eternidad. Ofrecemos mantenimiento, pulido y restauración vitalicia de nuestra manufactura.',
        ctaLabel:   'Iniciar mi pieza',
        ctaHref:    '/contacto.html',
    },
    cta: {
        eyebrow:   'Compra en línea o visítanos en nuestro atelier de Cartagena',
        title1:    'Nuestra Maison',
        title2:    'Cartagena de Indias',
        lead:      'Explora nuestras colecciones y compra en línea con envío a todo el país, o cruza el umbral de nuestra Maison en el Centro Histórico de Cartagena de Indias. Con la calma de un buen café, conversaremos sin prisa sobre la pieza —lista para llevar o creada a tu medida— que habitará en tu linaje familiar.',
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
