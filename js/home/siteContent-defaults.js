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
        locator:          'Cartagena de Indias · Colombia',
        eyebrow:          'Alta Joyería Personalizada y de Confianza',
        headline1:        'El arte de escuchar tu historia,',
        headline2:        'tallado en una joya única.',
        manifesto:        'Nacimos visitando a nuestros clientes de puerta en puerta, cimentando una relación de cercanía y confianza duradera. En nuestro atelier privado del Centro Histórico de Cartagena, no diseñamos simples accesorios: nos tomamos el tiempo para asesorarte y dar vida a piezas irrepetibles de oro de 18 quilates y esmeraldas colombianas éticas. Una inversión emocional y material destinada a custodiar tu esencia para siempre.',
        ctaLabel:         'Descubrir la colección',
        ctaHref:          '/colecciones.html',
        signatureEyebrow: 'Una creación de',
        signatureName:    'Kary Mendoza',
    },
    editorial: {
        chip:       'Editorial',
        imageTitle: 'La Verde, 2026',
        imageSub:   'Seis piezas esculpidas alrededor de la luz esmeralda colombiana.',
        eyebrow:    'Nuestra filosofía',
        title1:     'El arte de la orfebrería pausada:',
        title2:     'más que una joya, un legado familiar.',
        lead:       'Entendemos la esmeralda y el oro de 18 quilates como portadores de la memoria humana. Nos convertimos en cómplices silenciosos de los instantes que definen una vida: promesas que trascienden el tiempo, hitos de amor incondicional y el recuerdo indeleble de quienes somos.',
        quote:      '"Nuestras esmeraldas colombianas de Muzo y Chivor no son meras pertenencias; son fragmentos de tierra viva custodiados por almas sensibles para ser entregados a la siguiente generación."',
        stat1Num:   '12+',  stat1Lab: 'Años',
        stat2Num:   '800+', stat2Lab: 'Piezas únicas',
        stat3Num:   'JA',   stat3Lab: 'Certificado',
    },
};

/** merge(DEFAULTS, doc) por sub-mapa de sección. Robusto a doc null/parcial. */
export function mergeHome(doc) {
    const d = doc || {};
    return {
        hero:      { ...HOME_DEFAULTS.hero,      ...(d.hero || {}) },
        editorial: { ...HOME_DEFAULTS.editorial, ...(d.editorial || {}) },
    };
}
