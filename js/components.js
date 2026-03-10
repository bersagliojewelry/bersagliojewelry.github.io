/**
 * Bersaglio Jewelry — Component Loader
 * Fetches and injects shared header/footer snippets,
 * then initializes header behavior and wishlist badge.
 */

import { wishlist }            from './wishlist.js';
import { cart }                from './cart.js';
import { initPreloader }       from './preloader.js';
import { initPageTransitions } from './page-transitions.js';

const SNIPPETS = 'snippets/';

async function loadComponent(placeholderId, path) {
    const el = document.getElementById(placeholderId);
    if (!el) return;
    try {
        const res = await fetch(path);
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${path}`);
        el.innerHTML = await res.text();
    } catch (err) {
        console.warn('[Bersaglio] Could not load component:', err.message);
    }
}

function initializeHeader() {
    const header = document.getElementById('header');
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');

    if (!header) return;

    // Scroll: add shadow + hide/show on direction change
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const y = window.scrollY;
        header.classList.toggle('scrolled', y > 60);
        if (y > 400) {
            header.classList.toggle('header-hidden', y > lastScroll);
        } else {
            header.classList.remove('header-hidden');
        }
        lastScroll = y;
    }, { passive: true });

    // Mobile hamburger
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            const open = navMenu.classList.toggle('is-open');
            hamburger.classList.toggle('is-active', open);
            hamburger.setAttribute('aria-expanded', open);
            document.body.classList.toggle('menu-open', open);
        });

        // Mobile: toggle dropdown on parent link click
        navMenu.querySelectorAll('.nav-item.dropdown > .nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                if (window.innerWidth <= 968) {
                    e.preventDefault();
                    const item = link.closest('.nav-item');
                    item.classList.toggle('is-open');
                    link.setAttribute('aria-expanded', item.classList.contains('is-open'));
                }
            });
        });

        // Close menu when a non-dropdown nav link is clicked
        navMenu.querySelectorAll('a:not(.dropdown-toggle)').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('is-open');
                hamburger.classList.remove('is-active');
                hamburger.setAttribute('aria-expanded', 'false');
                document.body.classList.remove('menu-open');
            });
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navMenu.classList.contains('is-open')) {
                navMenu.classList.remove('is-open');
                hamburger.classList.remove('is-active');
                hamburger.setAttribute('aria-expanded', 'false');
                document.body.classList.remove('menu-open');
            }
        });
    }

    // Smooth scroll for in-page anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                e.preventDefault();
                const offset = header.offsetHeight + 20;
                window.scrollTo({
                    top: target.getBoundingClientRect().top + window.scrollY - offset,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Current year
    const yearEl = document.getElementById('current-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // Mark active link based on current page
    const page = location.pathname.split('/').pop() || 'index.html';
    header.querySelectorAll('.nav-link[href]').forEach(link => {
        if (link.getAttribute('href') === page) {
            link.classList.add('nav-link--active');
        }
    });
}

function initializeWishlist() {
    const countEl = document.getElementById('wishlistCount');
    if (!countEl) return;

    const updateBadge = (items) => {
        const n = items.length;
        countEl.textContent = n > 0 ? (n > 9 ? '9+' : n) : '';
        countEl.classList.toggle('has-items', n > 0);
    };

    updateBadge(wishlist.getAll());
    wishlist.onChange(updateBadge);
}

function initializeCart() {
    const countEl = document.getElementById('cartCount');
    if (!countEl) return;

    const updateBadge = (items) => {
        const n = items.length;
        countEl.textContent = n > 0 ? (n > 9 ? '9+' : n) : '';
        countEl.classList.toggle('has-items', n > 0);
    };

    updateBadge(cart.getAll());
    cart.onChange(updateBadge);
}

function initializeDevBanner() {
    // Overlay se muestra en cada visita/recarga — sin localStorage
    const overlay = document.createElement('div');
    overlay.id = 'dev-overlay';
    overlay.className = 'dev-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Aviso — sitio en desarrollo');

    overlay.innerHTML = `
        <div class="dev-overlay-backdrop"></div>
        <div class="dev-overlay-card">
            <button class="dev-overlay-close" id="dev-overlay-close" aria-label="Cerrar aviso">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>
            <div class="dev-overlay-gem" aria-hidden="true">
                <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="0.9" width="56" height="56">
                    <polygon points="24,4 44,17 44,31 24,44 4,31 4,17"/>
                    <line x1="4" y1="17" x2="44" y2="17"/>
                    <line x1="4" y1="31" x2="44" y2="31"/>
                    <line x1="14" y1="4" x2="4" y2="17"/>
                    <line x1="34" y1="4" x2="44" y2="17"/>
                    <line x1="24" y1="4" x2="24" y2="44"/>
                </svg>
            </div>
            <p class="dev-overlay-eyebrow">Aviso</p>
            <h2 class="dev-overlay-title">Sitio en desarrollo</h2>
            <p class="dev-overlay-text">
                Esta es una versión preliminar de Bersaglio Jewelry. Estamos construyendo algo extraordinario y pronto estará listo.
            </p>
            <p class="dev-overlay-text">
                Por ahora no es una página oficial. Síguenos para conocer el lanzamiento:
            </p>
            <a
                href="https://instagram.com/bersaglio_jewelry"
                class="dev-overlay-instagram"
                target="_blank"
                rel="noopener noreferrer"
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14" aria-hidden="true">
                    <rect x="2" y="2" width="20" height="20" rx="5"/>
                    <circle cx="12" cy="12" r="5"/>
                    <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/>
                </svg>
                @bersaglio_jewelry
            </a>
            <button class="dev-overlay-dismiss" id="dev-overlay-dismiss">
                Continuar al sitio
            </button>
        </div>
    `;

    document.body.appendChild(overlay);

    // Prevent body scroll while overlay is open
    document.body.style.overflow = 'hidden';

    function closeOverlay() {
        overlay.classList.add('dev-overlay--closing');
        overlay.addEventListener('animationend', () => {
            overlay.remove();
            document.body.style.overflow = '';
        }, { once: true });
    }

    overlay.querySelector('#dev-overlay-close').addEventListener('click', closeOverlay);
    overlay.querySelector('#dev-overlay-dismiss').addEventListener('click', closeOverlay);
    overlay.querySelector('.dev-overlay-backdrop').addEventListener('click', closeOverlay);

    // Also close on Escape
    document.addEventListener('keydown', function onEsc(e) {
        if (e.key === 'Escape') { closeOverlay(); document.removeEventListener('keydown', onEsc); }
    });
}

export async function loadAllComponents() {
    // Preloader runs first — sync, before any async operations
    initPreloader();

    await Promise.all([
        loadComponent('header-placeholder', `${SNIPPETS}header.html`),
        loadComponent('footer-placeholder', `${SNIPPETS}footer.html`),
    ]);
    initializeHeader();
    initializeWishlist();
    initializeCart();
    initializeDevBanner();
    initPageTransitions();
}
