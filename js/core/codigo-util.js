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
