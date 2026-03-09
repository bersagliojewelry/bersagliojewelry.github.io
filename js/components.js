/**
 * Bersaglio Jewelry — Component Loader
 * Fetches and injects shared header/footer snippets,
 * then initializes header behavior and wishlist badge.
 */

import { wishlist } from './wishlist.js';
import { cart }     from './cart.js';

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

const DEV_BANNER_KEY = 'bersaglio_dev_banner_closed';

function initializeDevBanner() {
    const banner = document.getElementById('dev-banner');
    if (!banner) return;

    // Show unless user already dismissed it
    if (!localStorage.getItem(DEV_BANNER_KEY)) {
        banner.hidden = false;
    }

    const closeBtn = document.getElementById('dev-banner-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            banner.classList.add('dev-banner--closing');
            banner.addEventListener('transitionend', () => {
                banner.hidden = true;
                localStorage.setItem(DEV_BANNER_KEY, '1');
            }, { once: true });
        });
    }
}

export async function loadAllComponents() {
    await Promise.all([
        loadComponent('header-placeholder', `${SNIPPETS}header.html`),
        loadComponent('footer-placeholder', `${SNIPPETS}footer.html`),
    ]);
    initializeHeader();
    initializeWishlist();
    initializeCart();
    initializeDevBanner();
}
