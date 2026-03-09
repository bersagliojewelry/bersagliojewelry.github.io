/**
 * Bersaglio Jewelry — Wishlist Manager
 *
 * Persiste slugs de piezas en localStorage.
 * El singleton `wishlist` es compartido por toda la app:
 *   - components.js  → badge del header
 *   - featured.js    → botones ♡ en tarjetas
 *   - wishlist-page.js → página lista de deseos
 */

const STORAGE_KEY = 'bersaglio_wishlist';

class WishlistManager {

    constructor() {
        this._items     = this._load();
        this._listeners = [];
    }

    // ─── Persistencia ──────────────────────────────────────────────────────────

    _load() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        } catch {
            return [];
        }
    }

    _save() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this._items));
    }

    // ─── Lectura ───────────────────────────────────────────────────────────────

    getAll()      { return [...this._items]; }
    count()       { return this._items.length; }
    has(slug)     { return this._items.includes(slug); }

    // ─── Mutación ──────────────────────────────────────────────────────────────

    /**
     * Agrega o quita una pieza.
     * @returns {boolean} true = se agregó, false = se quitó
     */
    toggle(slug) {
        if (this.has(slug)) { this.remove(slug); return false; }
        this.add(slug); return true;
    }

    add(slug) {
        if (this.has(slug)) return;
        this._items.push(slug);
        this._save();
        this._notify();
    }

    remove(slug) {
        this._items = this._items.filter(s => s !== slug);
        this._save();
        this._notify();
    }

    clear() {
        this._items = [];
        this._save();
        this._notify();
    }

    // ─── Reactividad ───────────────────────────────────────────────────────────

    /**
     * Suscribirse a cambios.
     * @returns {Function} función para cancelar la suscripción
     */
    onChange(callback) {
        this._listeners.push(callback);
        return () => {
            this._listeners = this._listeners.filter(cb => cb !== callback);
        };
    }

    _notify() {
        this._listeners.forEach(cb => cb(this._items));
    }

    // ─── UI helper ─────────────────────────────────────────────────────────────

    /**
     * Inicializa botones ♡ en un contenedor usando event delegation.
     * Los botones deben tener: data-wishlist-slug="<slug>"
     *
     * @param {Element}  containerEl   - elemento padre de los botones
     * @param {Function} [onToggle]    - callback(slug, wasAdded) opcional (para toasts, etc.)
     */
    initButtons(containerEl, onToggle = null) {
        if (!containerEl) return;
        containerEl.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-wishlist-slug]');
            if (!btn) return;

            const slug  = btn.dataset.wishlistSlug;
            const added = this.toggle(slug);

            btn.classList.toggle('is-saved', added);
            btn.setAttribute(
                'aria-label',
                added ? 'Quitar de lista de deseos' : 'Añadir a lista de deseos'
            );

            if (onToggle) onToggle(slug, added);
        });
    }

    /**
     * Sincroniza el estado visual de un botón concreto con el estado actual.
     * Útil al renderizar: `wishlist.syncButton(btn, piece.slug)`
     */
    syncButton(btn, slug) {
        const saved = this.has(slug);
        btn.classList.toggle('is-saved', saved);
        btn.setAttribute(
            'aria-label',
            saved ? 'Quitar de lista de deseos' : 'Añadir a lista de deseos'
        );
    }
}

export const wishlist = new WishlistManager();
export default wishlist;
