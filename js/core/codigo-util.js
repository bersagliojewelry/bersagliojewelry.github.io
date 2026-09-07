/**
 * Lógica PURA del buscador por código (TODO-58) — separada de DOM/data para poder testearla
 * sin arrastrar firebase ni el navegador. Solo depende de `urls.js` (puro).
 */
import { pieceUrl } from './urls.js';

/** Normaliza el código tecleado: quita espacios (los códigos son tipo "0953"). */
export function normalizeCodigo(raw) {
    return String(raw ?? '').trim().replace(/\s+/g, '');
}

/**
 * Resuelve un código a una ACCIÓN — PURA (lookup inyectado → testable sin DOM ni red).
 * @param {string} raw  texto tecleado
 * @param {(code:string)=>(object|null)} lookup  resuelve un código normalizado a una pieza (o null)
 * @returns {{status:'empty'|'found'|'notfound', code:string, url?:string}}
 */
export function resolverCodigo(raw, lookup) {
    const code = normalizeCodigo(raw);
    if (!code) return { status: 'empty', code };
    const piece = lookup(code);
    if (piece) return { status: 'found', code, url: pieceUrl(piece) };
    return { status: 'notfound', code };
}

/** Normaliza para BUSCAR: minúsculas + sin tildes (Rocío→rocio) + espacios colapsados. */
export function normalizar(s) {
    return String(s ?? '')
        .toLowerCase()
        .normalize('NFD').replace(/[̀-ͯ]/g, '')   // quita tildes/diacríticos
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Búsqueda INTELIGENTE (TODO-60): ¿la pieza matchea por CÓDIGO o por NOMBRE? Parcial y sin tildes.
 * Código: el query sin espacios debe estar contenido en el código. Nombre: contención parcial.
 */
export function piezaMatchea(piece, query) {
    const q = normalizar(query);
    if (!q) return true;                              // sin texto → todas (no filtra)
    const name = normalizar(piece?.name);
    const code = normalizar(piece?.code);
    return name.includes(q) || code.includes(q.replace(/ /g, ''));
}

/** Filtra el catálogo por código/nombre (búsqueda inteligente). Query vacío → todas. */
export function filtrarCatalogo(pieces, query) {
    const list = Array.isArray(pieces) ? pieces : [];
    if (!normalizar(query)) return [...list];
    return list.filter(p => piezaMatchea(p, query));
}

/**
 * Búsquedas RECIENTES (idea de Altorra Cars): `term` al frente, sin duplicados (comparando sin tildes)
 * y con tope `cap`. PURA (la persistencia en localStorage la hace el callsite). Vacío → no agrega.
 */
export function agregarReciente(lista, term, cap = 5) {
    const base = Array.isArray(lista) ? lista : [];
    const t = String(term ?? '').trim();
    if (!t) return [...base];
    const sinDup = base.filter(x => normalizar(x) !== normalizar(t));
    return [t, ...sinDup].slice(0, Math.max(0, cap));
}
