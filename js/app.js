/**
 * Bersaglio Jewelry — Main Application
 * Entry point: initializes all components and interactions
 */

import { initHeader } from './components/header.js';
import { renderCollections } from './components/collections.js';
import { renderFeaturedPieces } from './components/featured.js';
import { renderServices } from './components/services.js';
import Renderer from './utils/renderer.js';
import BersaglioCatalog from './data/catalog.js';

function initApp() {
    // Initialize header behavior
    initHeader();

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

    // Current year in footer
    const yearEl = document.getElementById('current-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
}

function initWhatsAppButton() {
    const waBtn = document.querySelector('.wa-float');
    if (waBtn) {
        const phone = BersaglioCatalog.contact.whatsapp.replace('+', '');
        const msg = encodeURIComponent('Hola Bersaglio Jewelry, me interesa conocer más sobre sus piezas de alta joyería.');
        waBtn.href = `https://wa.me/${phone}?text=${msg}`;
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
