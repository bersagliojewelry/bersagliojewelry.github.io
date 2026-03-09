/**
 * Bersaglio Jewelry — Cart Manager
 *
 * Persiste slugs de piezas en localStorage como carrito de compras.
 * Preparado para futura integración con tienda/pasarela de pago.
 *
 * Uso:
 *   import { cart } from './cart.js';
 *   cart.add('anillo-muzo-imperial');
 *   cart.toggle('anillo-muzo-imperial');
 *   cart.onChange(items => updateBadge(items));
 */

const STORAGE_KEY = 'bersaglio_cart';

class CartManager {

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
     * Inicializa botones de carrito en un contenedor usando event delegation.
     * Los botones deben tener: data-cart-slug="<slug>"
     *
     * @param {Element}  containerEl   - elemento padre de los botones
     * @param {Function} [onToggle]    - callback(slug, wasAdded) opcional (para toasts)
     */
    initButtons(containerEl, onToggle = null) {
        if (!containerEl) return;
        containerEl.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-cart-slug]');
            if (!btn) return;

            const slug  = btn.dataset.cartSlug;
            const added = this.toggle(slug);

            btn.classList.toggle('is-in-cart', added);
            btn.setAttribute(
                'aria-label',
                added ? 'Quitar del carrito' : 'Añadir al carrito'
            );
            btn.setAttribute(
                'title',
                added ? 'Quitar del carrito' : 'Añadir al carrito'
            );

            // Update button text if it has a label span
            const label = btn.querySelector('.cart-btn-label');
            if (label) label.textContent = added ? 'En carrito' : 'Añadir al carrito';

            if (onToggle) onToggle(slug, added);
        });
    }

    /**
     * Sincroniza el estado visual de un botón concreto.
     */
    syncButton(btn, slug) {
        const inCart = this.has(slug);
        btn.classList.toggle('is-in-cart', inCart);
        btn.setAttribute('aria-label', inCart ? 'Quitar del carrito' : 'Añadir al carrito');
        const label = btn.querySelector('.cart-btn-label');
        if (label) label.textContent = inCart ? 'En carrito' : 'Añadir al carrito';
    }
}

export const cart = new CartManager();
export default cart;
