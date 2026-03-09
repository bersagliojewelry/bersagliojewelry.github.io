/**
 * Bersaglio Jewelry — Main Application
 * Entry point: initializes all components and interactions
 */

import { loadAllComponents } from './components.js';
import { renderCollections } from './components/collections.js';
import { renderFeaturedPieces } from './components/featured.js';
import { renderServices } from './components/services.js';
import Renderer from './utils/renderer.js';
import BersaglioCatalog from './data/catalog.js';

async function initApp() {
    // Load shared header and footer, then initialize their behavior
    await loadAllComponents();

    // Render dynamic sections from catalog data
    renderCollections();
    renderFeaturedPieces();
    renderServices();

    // Initialize scroll animations
    Renderer.initScrollAnimations();

    // Initialize lazy loading
    Renderer.initLazyImages();

    // WhatsApp CTA
    initWhatsAppButton();
}

function initWhatsAppButton() {
    const phone = BersaglioCatalog.contact.whatsapp.replace('+', '');
    const msg = encodeURIComponent('Hola Bersaglio Jewelry, me interesa conocer más sobre sus piezas de alta joyería.');
    const waUrl = `https://wa.me/${phone}?text=${msg}`;

    // Float button (footer snippet) + nav button (header snippet)
    document.querySelectorAll('.wa-float, #wa-nav').forEach(btn => {
        btn.href = waUrl;
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
