/**
 * Bersaglio Jewelry — Wishlist Page Script
 * Renderiza las piezas guardadas, estado vacío y share por WhatsApp.
 */

import { loadAllComponents } from './components.js';
import { initEffects } from './effects.js';
import db    from './data/catalog.js';
import { wishlist } from './wishlist.js';
import { toast }    from './toast.js';
import { renderPieceCardHTML } from './components/piece-card.js';

// pieceCard delegates to the shared aqua renderer (consistent with home + catalog)
const pieceCard = renderPieceCardHTML;

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
    // Re-render when admin updates piece data in real-time.
    db.onChange(() => renderWishlist());
    initEffects();
}

initPage();
