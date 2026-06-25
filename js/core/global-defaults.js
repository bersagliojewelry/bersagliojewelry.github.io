/**
 * js/core/global-defaults.js — DEFAULTS de los DATOS GLOBALES del sitio (PURO).
 *
 * Datos compartidos por varios componentes (no de una sola página). Singleton
 * `siteContent/global` (claves whitelisted en firestore.rules: contacto · footer · redes).
 * Patrón §5-G (espejo de contacto-defaults).
 *
 * FUENTE ÚNICA (anti-deriva): el WhatsApp, el Instagram y el email viven UNA sola vez en
 * `contacto`; el footer y la página Contacto DERIVAN sus enlaces con waHref/igHref. Así se
 * mata el bug que existía (el WhatsApp estaba duplicado en 6 archivos, 2 con un número
 * falso). `redes` guarda solo lo que NO es un canal de contacto (Facebook). `footer.tagline`
 * = copy compartido. Las URLs van por safeUrl() en el render (anti stored-XSS, repo público).
 *
 * Consumidores increment 1-2: footer (every-page) + canales de la página Contacto.
 * Pendiente (increment 3): carrito · lista-deseos · wishlist-drawer (hoy con su valor local).
 */

export const GLOBAL_DEFAULTS = {
    // Canales de contacto — FUENTE ÚNICA. whatsapp/instagram se guardan como se MUESTRAN;
    // el href se deriva (waHref/igHref). email: display = valor, href = mailto.
    contacto: {
        whatsapp:  '+57 301 375 2592',          // display; href = wa.me/<dígitos>
        email:     'info@bersagliojewelry.co',
        instagram: '@bersaglio_jewelry',        // handle REAL (con guion bajo); antes '@bersagliojewelry' = link ROTO (NAP maestro · TODO-35)
    },
    // Dirección física — NAP maestro, idéntica a tenant_config.json + al JSON-LD horneado (TODO-35).
    direccion: {
        calle:   'Calle 36 # 6-32, San Agustín Chiquita',
        sector:  'Centro Histórico',
        ciudad:  'Cartagena de Indias',
        pais:    'Colombia',
        mapsUrl: 'https://share.google/dg6nfdgIHaFanKVYe',
    },
    // Redes que NO son canal de contacto (solo botón en el footer).
    redes: {
        facebook: 'https://www.facebook.com/profile.php?id=61583793442626',   // perfil REAL (antes vanity /bersagliojewelry = roto)
        tiktok:   'https://www.tiktok.com/@bersaglio_jewelry',
    },
    // Copy compartido del footer.
    footer: {
        tagline: 'Alta joyería con esmeraldas colombianas, diamantes certificados y oro 18K. Piezas diseñadas para trascender generaciones.',
    },
};

/** Enlace wa.me desde un teléfono mostrado ("+57 301 375 2592" → wa.me/573013752592). */
export function waHref(whatsappDisplay) {
    return `https://wa.me/${String(whatsappDisplay || '').replace(/\D/g, '')}`;
}

/** Enlace de Instagram desde un handle ("@bersagliojewelry" → instagram.com/bersagliojewelry). */
export function igHref(handle) {
    return `https://instagram.com/${String(handle || '').replace(/^@+/, '').trim()}`;
}

/** merge(DEFAULTS, doc) por sub-mapa. Robusto a doc null/parcial. */
export function mergeGlobal(doc) {
    const d = doc || {};
    const D = GLOBAL_DEFAULTS;
    return {
        contacto:  { ...D.contacto,  ...(d.contacto || {}) },
        direccion: { ...D.direccion, ...(d.direccion || {}) },
        redes:     { ...D.redes,     ...(d.redes || {}) },
        footer:    { ...D.footer,    ...(d.footer || {}) },
    };
}

export default { GLOBAL_DEFAULTS, mergeGlobal, waHref, igHref };
