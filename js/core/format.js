/**
 * Bersaglio Jewelry — formatting helpers (currency, dates, slugs).
 */

const COP_FORMATTER = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
});

/** Format number as Colombian peso. Returns "Cotización" for falsy / 0. */
export function formatCOP(amount) {
    if (!amount || !Number.isFinite(Number(amount))) return 'Cotización';
    return COP_FORMATTER.format(Number(amount));
}

/** Short version: "$ 12.400.000" without the "COP" suffix. */
export function format$(amount) {
    if (!amount || !Number.isFinite(Number(amount))) return 'Cotización';
    return '$ ' + Number(amount).toLocaleString('es-CO');
}

/** Convert "Anillo Trinity Esmeralda" → "anillo-trinity-esmeralda". */
export function slugify(text) {
    return String(text || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')   // strip accents
        .replace(/[^a-z0-9]+/g, '-')        // non-alphanumeric → hyphen
        .replace(/^-+|-+$/g, '')            // trim leading/trailing hyphens
        .slice(0, 80);
}

/** "5 min" / "12 min" with proper pluralization (Spanish). */
export function readMinutes(n) {
    return `${n || 1} min`;
}

/** Format a Firestore Timestamp / Date / ISO string as "12·03·26". */
export function formatDateShort(input) {
    const d = toDate(input);
    if (!d) return '';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = String(d.getFullYear()).slice(-2);
    return `${day}·${month}·${year}`;
}

/** Format date as "Marzo 2026" (Spanish month name). */
export function formatDateLong(input) {
    const d = toDate(input);
    if (!d) return '';
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return `${months[d.getMonth()]} ${d.getFullYear()}`;
}

/** Coerce input (Firestore Timestamp, Date, ISO string, ms number) to a Date. */
function toDate(input) {
    if (!input) return null;
    if (input instanceof Date) return input;
    if (typeof input === 'number') return new Date(input);
    if (typeof input === 'string') return new Date(input);
    // Firestore Timestamp
    if (typeof input.toDate === 'function') return input.toDate();
    if (typeof input.seconds === 'number') return new Date(input.seconds * 1000);
    return null;
}

/** Pluralize: 1 pieza / 2 piezas. */
export function pluralPiezas(n) {
    return n === 1 ? '1 pieza' : `${n} piezas`;
}

/** Pluralize generic: ({1: 'pieza', n: 'piezas'}, 3) → '3 piezas'. */
export function plural(forms, n) {
    return n === 1 ? `1 ${forms[1]}` : `${n} ${forms.n}`;
}

/** Debounce: wait `wait` ms after last call before invoking. */
export function debounce(fn, wait = 200) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), wait);
    };
}

/** rAF-based throttle: call fn at most once per animation frame. */
export function rafThrottle(fn) {
    let scheduled = false;
    let lastArgs;
    return function (...args) {
        lastArgs = args;
        if (scheduled) return;
        scheduled = true;
        requestAnimationFrame(() => {
            scheduled = false;
            fn.apply(this, lastArgs);
        });
    };
}
