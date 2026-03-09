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

async function initPage() {
    await loadAllComponents();
    await db.load();
    initWhatsAppButton();
    Renderer.initScrollAnimations();
    Renderer.initLazyImages();
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
