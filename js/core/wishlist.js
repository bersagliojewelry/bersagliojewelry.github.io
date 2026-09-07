/**
 * Bersaglio Jewelry — Wishlist store (localStorage backed).
 * Mirror del API de cart pero sin qty (es solo un set de slugs).
 */

const STORAGE_KEY = 'bj-wishlist-v2';
const _listeners = new Set();
let _slugs = load();

function load() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function persist() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(_slugs));
    } catch {}
}

function notify() {
    persist();
    for (const cb of _listeners) {
        try { cb([..._slugs]); } catch (e) { console.error('[wishlist] listener error:', e); }
    }
}

export const wishlist = {
    getAll() { return [..._slugs]; },
    has(slug) { return _slugs.includes(slug); },
    count() { return _slugs.length; },

    add(slug) {
        if (_slugs.includes(slug)) return false;
        _slugs.push(slug);
        notify();
        return true;
    },

    remove(slug) {
        const before = _slugs.length;
        _slugs = _slugs.filter(s => s !== slug);
        if (_slugs.length !== before) notify();
    },

    toggle(slug) {
        if (this.has(slug)) {
            this.remove(slug);
            return false;
        }
        this.add(slug);
        return true;
    },

    clear() {
        if (!_slugs.length) return;
        _slugs = [];
        notify();
    },

    onChange(cb) {
        _listeners.add(cb);
        return () => _listeners.delete(cb);
    },
};

window.addEventListener('storage', e => {
    if (e.key !== STORAGE_KEY) return;
    _slugs = load();
    for (const cb of _listeners) {
        try { cb([..._slugs]); } catch {}
    }
});

export default wishlist;
