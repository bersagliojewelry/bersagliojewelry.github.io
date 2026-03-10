/**
 * Bersaglio Jewelry — Wishlist Page Script
 * Renderiza las piezas guardadas, estado vacío y share por WhatsApp.
 */

import { loadAllComponents } from './components.js';
import { initEffects } from './effects.js';
import db    from './data/catalog.js';
import { wishlist } from './wishlist.js';
import { toast }    from './toast.js';

// ─── Plantilla de tarjeta ────────────────────────────────────────────────────

const specLabels = {
    stone: 'Piedra', carat: 'Quilates', metal: 'Metal', accent: 'Acentos',
    cut: 'Talla', color: 'Color', clarity: 'Claridad', weight: 'Peso',
    style: 'Estilo', finish: 'Acabado', length: 'Longitud'
};

function renderSpecs(specs) {
    return Object.entries(specs)
        .filter(([k]) => k !== 'certificate')
        .map(([k, v]) => `<span class="spec-item"><strong>${specLabels[k] || k}:</strong> ${v}</span>`)
        .join('');
}

function pieceCard(piece) {
    return `
        <article class="piece-card" data-piece="${piece.id}">
            <div class="piece-image-wrapper">
                <div class="piece-placeholder">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                        <polygon points="12,2 22,8.5 12,22 2,8.5"/>
                        <line x1="2" y1="8.5" x2="22" y2="8.5"/>
                        <polyline points="7,2 12,8.5 17,2"/>
                    </svg>
                </div>
                ${piece.badge ? `<span class="piece-badge">${piece.badge}</span>` : ''}
                <button
                    class="piece-wishlist-btn is-saved"
                    data-wishlist-slug="${piece.slug}"
                    aria-label="Quitar de lista de deseos"
                    title="Quitar de lista de deseos"
                >
                    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                </button>
            </div>
            <div class="piece-info">
                <h3 class="piece-name">${piece.name}</h3>
                <p class="piece-desc">${piece.description}</p>
                <div class="piece-specs">${renderSpecs(piece.specs)}</div>
                <div class="piece-footer">
                    <span class="piece-price">${piece.priceLabel}</span>
                    <a href="pieza.html?p=${piece.slug}" class="piece-cta">
                        Ver detalle
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </a>
                </div>
            </div>
        </article>
    `;
}

// ─── Render ──────────────────────────────────────────────────────────────────

function renderWishlist() {
    const slugs     = wishlist.getAll();
    const emptyEl   = document.getElementById('wishlist-empty');
    const gridEl    = document.getElementById('wishlist-grid');
    const actionsEl = document.getElementById('wishlist-actions');
    const countEl   = document.getElementById('wishlist-item-count');

    if (!gridEl) return;

    const pieces  = slugs.map(s => db.getBySlug(s)).filter(Boolean);
    const isEmpty = pieces.length === 0;

    emptyEl.hidden   = !isEmpty;
    actionsEl.hidden = isEmpty;

    if (isEmpty) { gridEl.innerHTML = ''; return; }

    const n = pieces.length;
    countEl.textContent = `${n} pieza${n !== 1 ? 's' : ''} guardada${n !== 1 ? 's' : ''}`;

    gridEl.innerHTML = pieces.map(pieceCard).join('');

    // Re-init wishlist delegation on the refreshed grid
    wishlist.initButtons(gridEl, (slug, added) => {
        if (!added) {
            // On this page, removing is the main action — grid re-renders via onChange
            toast.show('Eliminada de tu lista de deseos', 'removed');
        }
    });
}

// ─── Acciones ─────────────────────────────────────────────────────────────────

function shareViaWhatsApp() {
    const pieces = wishlist.getAll()
        .map(s => db.getBySlug(s))
        .filter(Boolean);

    if (!pieces.length) return;

    const { whatsapp } = db.getContact();
    const phone = whatsapp.replace('+', '');

    const list = pieces.map(p => `• ${p.name}`).join('\n');
    const msg  = encodeURIComponent(
        `Hola Bersaglio Jewelry, me interesan las siguientes piezas:\n\n${list}\n\n¿Podrían darme más información y precios? Gracias.`
    );

    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank', 'noopener,noreferrer');
}

function initActions() {
    document.getElementById('share-wa')?.addEventListener('click', shareViaWhatsApp);

    document.getElementById('clear-wishlist')?.addEventListener('click', () => {
        wishlist.clear();
        toast.show('Lista de deseos vaciada', 'removed');
    });
}

// ─── Init ─────────────────────────────────────────────────────────────────────

async function initPage() {
    await loadAllComponents();
    await db.load();

    renderWishlist();
    initActions();

    // Re-render each time the wishlist changes (remove, clear)
    wishlist.onChange(() => renderWishlist());
    initEffects();
}

initPage();
