/**
 * advisory-match.js — Dedup BLANDO (advisory) del POS, client-side (F2.1).
 *
 * FRONTERA VINCULANTE (comité seguridad UI 2026-07-07): esto normaliza teléfono/nombre SOLO para
 * el aviso "¿es la misma persona?" y para el typeahead de búsqueda. NO es la clave canónica de
 * identidad — esa se normaliza SOLO en el servidor (`functions/identidad-core.js`) para evitar la
 * divergencia cliente↔server que parte identidades. Reglas de este módulo:
 *   · NUNCA se persiste como campo/llave.  · NUNCA decide fusión ni unicidad (solo dispara el prompt).
 *   · El servidor (`crearClienteConDoc`) re-valida y es la fuente de verdad.
 *   · NO renombrar a `normalizeKey` ni reusar como autoritativo (drift = resucita el problema).
 */

/** Normaliza un teléfono a solo dígitos (quita el prefijo país 57 de un celular CO). Advisory. */
export function advisoryPhone(phone) {
    const d = String(phone == null ? '' : phone).replace(/\D/g, '');
    return (d.length === 12 && d.startsWith('57')) ? d.slice(2) : d;
}

/** Normaliza un nombre para comparación blanda (minúsculas, sin tildes, espacios colapsados). Advisory. */
export function advisoryName(name) {
    return String(name == null ? '' : name)
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
        .toLowerCase().trim().replace(/\s+/g, ' ');
}

/**
 * Posibles duplicados por teléfono (exacto normalizado) o nombre (igualdad normalizada, ≥4 chars),
 * sobre la lista de clientes YA cargada. Advisory: solo alimenta el aviso "¿es la misma?".
 * @returns {Array<{clienteId, nombre, motivo:'telefono'|'nombre'}>}
 */
export function advisoryMatchHint(clientes, { telefono, nombre } = {}, max = 5) {
    const telN = advisoryPhone(telefono);
    const nomN = advisoryName(nombre);
    const out = [];
    for (const c of (clientes || [])) {
        if (c.activo === false) continue;
        let motivo = null;
        if (telN && (advisoryPhone(c.telefono) === telN || advisoryPhone(c.whatsapp) === telN)) motivo = 'telefono';
        else if (nomN && nomN.length >= 4 && advisoryName(c.nombre) === nomN) motivo = 'nombre';
        if (motivo) { out.push({ clienteId: c.id, nombre: c.nombre || null, motivo }); if (out.length >= max) break; }
    }
    return out;
}

/**
 * Typeahead: filtra la lista cargada por término (nombre, teléfono o sufijo de documento).
 * Client-side, sobre lo ya cargado (no consulta el server). @returns {Array} clientes coincidentes.
 */
export function filterClientes(clientes, term, max = 8) {
    const t = String(term || '').trim();
    if (!t) return [];
    const digits = t.replace(/\D/g, '');
    const nameN = advisoryName(t);
    const out = [];
    for (const c of (clientes || [])) {
        if (c.activo === false) continue;
        const byName = nameN.length >= 2 && advisoryName(c.nombre).includes(nameN);
        const byPhone = digits.length >= 3 && (advisoryPhone(c.telefono).includes(digits) || advisoryPhone(c.whatsapp).includes(digits));
        const byDoc = digits.length >= 4 && Array.isArray(c.docKeys) && c.docKeys.some((k) => String(k).replace(/\D/g, '').includes(digits));
        if (byName || byPhone || byDoc) { out.push(c); if (out.length >= max) break; }
    }
    return out;
}

// ─── Enmascarado de PII para pantalla (comité seguridad: no exponer el dato completo en el mostrador) ───
/** `CC:1032456789` → `CC ···6789` (últimos 4). Revelar completo = acción explícita en la UI. */
export function maskDoc(legalIdKey) {
    if (!legalIdKey) return '';
    const [type, num] = String(legalIdKey).split(':');
    if (!num) return String(legalIdKey);
    return `${type} ···${num.slice(-4)}`;
}
/** Teléfono → `··· ·· 8877` (últimos 4). */
export function maskPhone(phone) {
    const d = advisoryPhone(phone);
    return d ? `··· ·· ${d.slice(-4)}` : '';
}
