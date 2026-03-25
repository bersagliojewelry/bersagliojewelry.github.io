/**
 * Bersaglio Jewelry — Shared Content Page Script
 * Usado por: nosotros.html, contacto.html, servicios.html
 *
 * Carga header/footer, datos de contacto para WhatsApp,
 * animaciones de scroll e imágenes lazy.
 * No renderiza secciones del homepage (colecciones, piezas, servicios-grid).
 */

import { loadAllComponents } from './components.js';
import Renderer from './utils/renderer.js';
import db       from './data/catalog.js';
import { initEffects }  from './effects.js';
import { initParallax } from './parallax.js';
import { injectJsonLd } from './utils/schema.js';

async function initPage() {
    await loadAllComponents();
    await db.load();
    injectPageSchema();
    initWhatsAppButton();
    Renderer.initScrollAnimations();
    Renderer.initLazyImages();
    initEffects();
    initParallax();
}

const BASE = 'https://bersagliojewelry.co';
const ORG  = {
    '@type': 'Organization',
    name: 'Bersaglio Jewelry',
    url: BASE,
    logo: `${BASE}/img/logo-bj2.png`,
    contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        availableLanguage: ['Spanish'],
    },
};

function injectPageSchema() {
    const page = location.pathname.split('/').pop() || 'index.html';

    // BreadcrumbList for all content pages
    const pageName = document.title.split('|')[0].trim();
    injectJsonLd('breadcrumb-schema', {
        '@context': 'https://schema.org',
        '@type':    'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${BASE}/` },
            { '@type': 'ListItem', position: 2, name: pageName, item: `${BASE}/${page}` },
        ],
    });

    if (page === 'nosotros.html') {
        injectJsonLd('page-schema', {
            '@context':    'https://schema.org',
            '@type':       'AboutPage',
            name:          'Sobre Bersaglio Jewelry',
            description:   document.querySelector('meta[name="description"]')?.content || '',
            url:           `${BASE}/nosotros.html`,
            mainEntity:    ORG,
        });
    } else if (page === 'contacto.html') {
        injectJsonLd('page-schema', {
            '@context':    'https://schema.org',
            '@type':       'ContactPage',
            name:          'Contacto — Bersaglio Jewelry',
            description:   document.querySelector('meta[name="description"]')?.content || '',
            url:           `${BASE}/contacto.html`,
            mainEntity:    ORG,
        });
    } else if (page === 'servicios.html') {
        injectJsonLd('page-schema', {
            '@context': 'https://schema.org',
            '@type':    'WebPage',
            name:       'Servicios — Bersaglio Jewelry',
            url:        `${BASE}/servicios.html`,
            description: document.querySelector('meta[name="description"]')?.content || '',
            provider:    ORG,
            hasOfferCatalog: {
                '@type': 'OfferCatalog',
                name:    'Servicios de Alta Joyería',
                itemListElement: [
                    { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Asesoría Personalizada', description: 'Consultoría experta para elegir la pieza perfecta' } },
                    { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Diseño a Medida',       description: 'Creación de piezas exclusivas según tu visión' } },
                    { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Certificación La Verde / Jewelers of America', description: 'Piezas certificadas por Master Jeweler — La Verde / Jewelers of America' } },
                    { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Envío Asegurado',       description: 'Entrega puerta a puerta con seguro completo' } },
                ],
            },
        });
    }
}

function initWhatsAppButton() {
    const { whatsapp } = db.getContact();
    const phone = whatsapp.replace('+', '');
    const msg   = encodeURIComponent('Hola Bersaglio Jewelry, me interesa conocer más sobre sus piezas de alta joyería.');
    const url   = `https://wa.me/${phone}?text=${msg}`;
    document.querySelectorAll('.wa-float, #wa-nav, #wa-contact').forEach(btn => { btn.href = url; });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPage);
} else {
    initPage();
}
