/**
 * Bersaglio Jewelry — Piece Detail Page
 * URL: pieza.html?p=<slug>
 */

import { loadAllComponents }   from './components.js';
import { wishlist }            from './wishlist.js';
import { cart }                from './cart.js';
import { toast }               from './toast.js';
import { initEffects }         from './effects.js';
import { initMicroAnimations } from './effects/micro.js';
import Renderer                from './utils/renderer.js';
import db                      from './data/catalog.js';

const specLabels = {
    stone: 'Piedra principal', carat: 'Quilates', metal: 'Metal', accent: 'Acentos',
    cut: 'Talla', color: 'Color', clarity: 'Claridad', weight: 'Peso',
    style: 'Estilo', finish: 'Acabado', length: 'Longitud', certificate: 'Certificación',
};

async function init() {
    await loadAllComponents();
    await db.load();

    const slug  = new URLSearchParams(window.location.search).get('p');
    const piece = slug ? db.getBySlug(slug) : null;

    if (!piece) {
        renderNotFound();
        return;
    }

    renderPiece(piece);
    renderRelatedPieces(piece);
    updatePageMeta(piece);
    initWhatsAppButton(piece);
    Renderer.initScrollAnimations();
    initEffects();
    initMicroAnimations();
    initPiezaGSAP();
}

function updatePageMeta(piece) {
    document.title = `${piece.name} | Bersaglio Jewelry`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', piece.description);
}

function initWhatsAppButton(piece) {
    const { whatsapp } = db.getContact();
    const phone  = whatsapp.replace('+', '');
    const navMsg = encodeURIComponent('Hola Bersaglio Jewelry, me interesa conocer más sobre sus piezas.');
    const navUrl = `https://wa.me/${phone}?text=${navMsg}`;
    document.querySelectorAll('.wa-float, #wa-nav').forEach(btn => { btn.href = navUrl; });

    // Piece-specific WhatsApp CTA
    const waBtn = document.getElementById('pieza-wa-btn');
    if (waBtn) {
        const msg = encodeURIComponent(
            `Hola Bersaglio Jewelry, me interesa conocer más sobre la pieza: ${piece.name}. ¿Pueden darme información de disponibilidad y precio?`
        );
        waBtn.href = `https://wa.me/${phone}?text=${msg}`;
    }
}

function renderPiece(piece) {
    const container = document.getElementById('pieza-content');
    if (!container) return;

    const inWishlist = wishlist.has(piece.slug);
    const inCart     = cart.has(piece.slug);
    const collection = db.getCollections().find(c => c.slug === piece.collection);

    const specsRows = Object.entries(piece.specs || {})
        .map(([k, v]) => `
            <tr>
                <th>${specLabels[k] || k}</th>
                <td>${v}</td>
            </tr>
        `).join('');

    container.innerHTML = `
        <!-- Breadcrumb -->
        <nav class="breadcrumb animate-on-scroll" aria-label="Breadcrumb">
            <a href="colecciones.html">Colecciones</a>
            <span aria-hidden="true">›</span>
            ${collection ? `<a href="${collection.slug}.html">${collection.name}</a>` : ''}
            ${collection ? `<span aria-hidden="true">›</span>` : ''}
            <span aria-current="page">${piece.name}</span>
        </nav>

        <div class="pieza-layout">

            <!-- Gallery -->
            <div class="pieza-gallery">
                <div class="pieza-main-image animate-on-scroll">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.7" width="120" height="120">
                        <polygon points="12,2 22,8.5 12,22 2,8.5"/>
                        <line x1="2" y1="8.5" x2="22" y2="8.5"/>
                        <polyline points="7,2 12,8.5 17,2"/>
                    </svg>
                </div>
            </div>

            <!-- Info -->
            <div class="pieza-info animate-on-scroll">

                ${piece.badge ? `
                    <div class="pieza-badge-row">
                        <span class="piece-badge">${piece.badge}</span>
                        ${piece.specs?.certificate ? `<span class="piece-badge" style="background: rgba(201,168,76,0.15); color: var(--gold);">${piece.specs.certificate}</span>` : ''}
                    </div>
                ` : ''}

                ${collection ? `<a href="${collection.slug}.html" class="pieza-collection-link">${collection.name}</a>` : ''}

                <h1 class="pieza-name">${piece.name}</h1>
                <p class="pieza-desc">${piece.description}</p>

                <!-- Specs table -->
                <table class="pieza-specs-table" aria-label="Especificaciones de la pieza">
                    <tbody>
                        ${specsRows}
                    </tbody>
                </table>

                <!-- Price -->
                <div class="pieza-price-row">
                    <span class="pieza-price">${piece.priceLabel}</span>
                </div>

                <!-- CTAs -->
                <div class="pieza-cta-group">
                    <a href="#" class="btn btn-primary" id="pieza-wa-btn" target="_blank" rel="noopener noreferrer">
                        <svg viewBox="0 0 32 32" width="15" height="15" aria-hidden="true">
                            <path fill="currentColor" d="M16 0C7.163 0 0 7.163 0 16c0 2.825.739 5.488 2.037 7.813L.112 31.488l8.013-2.038C10.413 30.725 13.113 32 16 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm7.35 19.35c-.4-.2-2.363-1.175-2.725-1.3-.363-.125-.625-.2-.888.2-.262.4-1.012 1.3-1.237 1.563-.225.262-.45.3-.85.1-.4-.2-1.688-.625-3.213-2-1.2-1.075-2.013-2.4-2.25-2.8-.238-.4-.025-.613.175-.813.175-.175.4-.45.6-.675.2-.225.263-.375.4-.625.138-.25.063-.475-.025-.675-.088-.2-.888-2.138-1.213-2.925-.325-.788-.65-.675-.888-.688-.225-.012-.475-.012-.725-.012s-.663.088-1.013.438c-.35.35-1.338 1.313-1.338 3.2s1.375 3.713 1.563 3.975c.188.263 2.638 4.025 6.4 5.638.888.388 1.588.625 2.125.8.9.275 1.713.238 2.363.15.725-.113 2.238-.925 2.55-1.8.313-.875.313-1.625.225-1.8z"/>
                        </svg>
                        Consultar por WhatsApp
                    </a>
                    <button
                        class="btn btn-outline piece-cart-btn-lg ${inCart ? 'is-in-cart' : ''}"
                        id="pieza-cart-btn"
                        data-cart-slug="${piece.slug}"
                        aria-label="${inCart ? 'Quitar del carrito' : 'Añadir al carrito'}"
                    >
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                        <span class="cart-btn-label">${inCart ? 'En carrito' : 'Añadir al carrito'}</span>
                    </button>
                </div>

                <!-- Wishlist row -->
                <div style="display: flex; align-items: center; gap: 10px;">
                    <button
                        class="piece-wishlist-btn ${inWishlist ? 'is-saved' : ''}"
                        id="pieza-wishlist-btn"
                        data-wishlist-slug="${piece.slug}"
                        aria-label="${inWishlist ? 'Quitar de lista de deseos' : 'Añadir a lista de deseos'}"
                        style="position: static; width: auto; height: auto; background: transparent; box-shadow: none; padding: 0;"
                    >
                        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                        </svg>
                    </button>
                    <span style="font-family: var(--font-body); font-size: 12px; color: var(--text-muted);">Guardar en lista de deseos</span>
                </div>

                <p class="pieza-note">Certificación incluida · Envío asegurado · Atención personalizada</p>
            </div>
        </div>
    `;

    // Init cart button
    const cartBtn = document.getElementById('pieza-cart-btn');
    if (cartBtn) {
        cartBtn.addEventListener('click', () => {
            const added = cart.toggle(piece.slug);
            cartBtn.classList.toggle('is-in-cart', added);
            cartBtn.setAttribute('aria-label', added ? 'Quitar del carrito' : 'Añadir al carrito');
            const label = cartBtn.querySelector('.cart-btn-label');
            if (label) label.textContent = added ? 'En carrito' : 'Añadir al carrito';
            toast.show(
                added ? 'Añadida al carrito' : 'Eliminada del carrito',
                added ? 'added' : 'removed'
            );
        });
    }

    // Init wishlist button
    wishlist.initButtons(container, (_slug, added) => {
        toast.show(
            added ? 'Añadida a lista de deseos' : 'Eliminada de la lista',
            added ? 'added' : 'removed'
        );
    });
}

/* ─── Related pieces ────────────────────────────────────────── */
function renderRelatedPieces(piece) {
    const container = document.getElementById('pieza-content');
    if (!container) return;

    const related = db.getAll()
        .filter(p => p.slug !== piece.slug && p.collection === piece.collection)
        .slice(0, 3);

    if (!related.length) return;

    const specLabelsLocal = {
        stone: 'Piedra', carat: 'Quilates', metal: 'Metal', cut: 'Talla',
    };

    const cards = related.map(p => {
        const inCart     = cart.has(p.slug);
        const inWishlist = wishlist.has(p.slug);
        const mainSpec   = p.specs?.stone || p.specs?.metal || '';

        return `
            <article class="related-card animate-on-scroll">
                <a href="pieza.html?p=${p.slug}" class="related-card-img" aria-label="${p.name}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.7" width="64" height="64" aria-hidden="true">
                        <polygon points="12,2 22,8.5 12,22 2,8.5"/>
                        <line x1="2" y1="8.5" x2="22" y2="8.5"/>
                        <polyline points="7,2 12,8.5 17,2"/>
                    </svg>
                    ${p.badge ? `<span class="piece-badge related-badge">${p.badge}</span>` : ''}
                </a>
                <div class="related-card-body">
                    ${mainSpec ? `<span class="related-card-spec">${mainSpec}</span>` : ''}
                    <a href="pieza.html?p=${p.slug}" class="related-card-name">${p.name}</a>
                    <span class="related-card-price">${p.priceLabel}</span>
                </div>
                <div class="related-card-actions">
                    <button
                        class="piece-action-btn wishlist-action ${inWishlist ? 'is-saved' : ''}"
                        data-wishlist-slug="${p.slug}"
                        aria-label="${inWishlist ? 'Quitar de lista de deseos' : 'Añadir a lista de deseos'}"
                    >
                        <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                    </button>
                    <button
                        class="piece-action-btn cart-action ${inCart ? 'is-in-cart' : ''}"
                        data-cart-slug="${p.slug}"
                        aria-label="${inCart ? 'En carrito' : 'Añadir al carrito'}"
                    >
                        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                    </button>
                </div>
            </article>
        `;
    }).join('');

    const section = document.createElement('section');
    section.className = 'related-section';
    section.innerHTML = `
        <div class="related-header animate-on-scroll">
            <span class="section-eyebrow">De la misma colección</span>
            <h2 class="related-title">También te puede interesar</h2>
        </div>
        <div class="related-grid">${cards}</div>
    `;
    container.appendChild(section);

    // Init wishlist + cart on the related section
    wishlist.initButtons(section, (_slug, added) => {
        toast.show(added ? 'Añadida a lista de deseos' : 'Eliminada de la lista', added ? 'added' : 'removed');
    });
    cart.initButtons(section, (_slug, added) => {
        toast.show(added ? 'Añadida al carrito' : 'Eliminada del carrito', added ? 'added' : 'removed');
    });
}

/* ─── GSAP entrance for piece detail ────────────────────────── */
function initPiezaGSAP() {
    if (typeof gsap === 'undefined') return;

    const gallery = document.querySelector('.pieza-gallery');
    const info    = document.querySelector('.pieza-info');
    const rows    = document.querySelectorAll('.pieza-specs-table tr');

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    if (gallery) {
        tl.fromTo(gallery,
            { opacity: 0, x: -32 },
            { opacity: 1, x: 0, duration: 0.75 }
        );
    }
    if (info) {
        tl.fromTo(info,
            { opacity: 0, x: 24 },
            { opacity: 1, x: 0, duration: 0.65 },
            '-=0.5'
        );
    }
    if (rows.length) {
        tl.fromTo(rows,
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.35, stagger: 0.06 },
            '-=0.3'
        );
    }
}

function renderNotFound() {
    const container = document.getElementById('pieza-content');
    if (!container) return;

    container.innerHTML = `
        <div class="pieza-not-found">
            <div style="color: var(--border); margin-bottom: var(--space-lg);">
                <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" stroke-width="0.8">
                    <polygon points="12,2 22,8.5 12,22 2,8.5"/>
                </svg>
            </div>
            <h1 style="font-family: var(--font-display); font-size: 2rem; font-weight: 300; margin-bottom: var(--space-md);">Pieza no encontrada</h1>
            <p style="font-family: var(--font-body); font-size: 14px; color: var(--text-muted); margin-bottom: var(--space-xl);">
                La pieza que buscas no existe o ha sido removida de nuestro catálogo.
            </p>
            <a href="colecciones.html" class="btn btn-primary">Ver colecciones</a>
        </div>
    `;
}

init();
