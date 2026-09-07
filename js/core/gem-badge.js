/**
 * Badge de GEMA por color (§149 → modelo canónico §150 → modelo PLANO §151 tras consejo externo).
 * Muestra UNA gema (la protagonista) con su color de marca. Reemplaza al genérico "Destacada".
 *
 * Modelo (comité ×5 + consejo externo VERIFICADO): separar DATO de PROSA.
 *  · `specs.badgeGem` (string|null) = slug canónico de la gema PROTAGONISTA → tiñe el badge + query
 *    `where('specs.badgeGem','==',slug)`. Lo escribe el SELECT del admin / la migración. 'oro'/null = sin gema.
 *  · `specs.gemFilterIds` (array de strings, p.ej. ["esmeralda","diamante"]) = TODAS las gemas presentes →
 *    filtros con `where('specs.gemFilterIds','array-contains',slug)` (Firestore indexa arrays planos; un
 *    array de OBJETOS {type,role} NO sirve para array-contains → de ahí el modelo plano, consejo §151).
 *  · `specs.stone`/`specs.accent` = TEXTO LIBRE intacto (poesía de la carta gemológica + SSG/JSON-LD).
 * El COLOR vive como DATO en la taxonomía (`gem-taxonomy.js` semilla + `settings/gems` horneado en
 * catalogo.json), NO en un regex. FALLBACK transicional al texto libre mientras una pieza no tenga
 * `badgeGem` (§150 ·3.6) → ninguna rompe en la ventana de deploy.
 *
 * Escenarios: A (una gema)→chip de la protagonista · B (multi)→SOLO la protagonista (acentos en ficha+
 * filtros vía gemFilterIds) · C (sin gema / oro solo)→null = sin badge.
 */
import { gemColor, gemLabel, slugFromText } from './gem-taxonomy.js';

const SIN_GEMA = new Set(['oro', 'ninguna', 'none', '']);

/** Slug de la gema PROTAGONISTA: dato canónico (`specs.badgeGem`) → fallback al texto libre. */
function slugProtagonista(piece) {
    const s = piece?.specs || {};
    if (s.badgeGem != null) return String(s.badgeGem).toLowerCase();
    // Transición §150: pieza sin migrar → derivar del texto libre (se retira tras migrar + form select).
    return slugFromText(s.stones || s.stone) || '';
}

/**
 * @returns {{slug:string,name:string,color:string}|null} la gema protagonista, o null si no hay gema
 *   (oro solo / 'ninguna') → el callsite no muestra badge.
 */
export function gemBadge(piece) {
    const slug = slugProtagonista(piece);
    if (SIN_GEMA.has(slug)) return null;
    return { slug, name: gemLabel(slug), color: gemColor(slug) };
}

/** Filtro (TODO-50): ¿la pieza LLEVA esta gema (protagonista o acento)? Usa el array plano gemFilterIds. */
export function tieneGema(piece, slug) {
    const s = String(slug || '').toLowerCase();
    const ids = piece?.specs?.gemFilterIds;
    if (Array.isArray(ids)) return ids.some(x => String(x).toLowerCase() === s);
    return slugProtagonista(piece) === s;   // fallback transicional (sin gemFilterIds aún)
}

/**
 * Nombre CANÓNICO de la gema para JSON-LD / AEO (additionalProperty "Gema") — §151, consejo externo.
 * Reemplaza el frágil `stones.split('·')[0]` (texto libre truncado → "Esmeralda Natural") por el DATO:
 * `specs.badgeGem` → label canónico ("Esmeralda"), entidad limpia para LLMs (Perplexity/ChatGPT/Google).
 * Fallback transicional al texto libre mientras una pieza no tenga `badgeGem`. 'oro'/sin gema → '' (el
 * callsite filtra los vacíos → la pieza sin gema NO expone propiedad "Gema").
 * @param {{badgeGem?:string, stone?:string, stones?:string}} specs
 * @returns {string} label canónico · prosa de respaldo · '' (sin gema).
 */
export function gemDisplayName(specs) {
    const s = specs || {};
    const slug = slugProtagonista({ specs: s });   // dato (badgeGem) → fallback regex sobre la prosa
    if (!SIN_GEMA.has(slug)) return gemLabel(slug);
    const prose = s.stones || s.stone || '';        // sin gema reconocida → cae a la prosa (o '')
    return prose.includes('·') ? prose.split('·')[0].trim() : prose;
}
