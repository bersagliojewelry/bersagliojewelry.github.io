/**
 * Badge de GEMA por color (§149, Daniel) — reemplaza el genérico "Destacada" del index por una
 * mini-gema del color REAL de la piedra: distintivo y propio de alta joyería ("dice la piedra de un
 * vistazo, con su propio color"). Deriva del campo `specs.stones`/`stone` de la pieza. El color es
 * un literal por gema (no hay token de marca por piedra); el badge se pinta sobre cristal claro.
 */
const GEMAS = [
    { re: /esmeralda|emerald/i,           name: 'Esmeralda', color: '#1D9E75' },  // verde esmeralda
    { re: /rub[íi]|ruby/i,                name: 'Rubí',      color: '#C0143C' },  // rojo rubí
    { re: /zafiro|sa[fp]iro|sapphire/i,   name: 'Zafiro',    color: '#1E63B0' },  // azul zafiro
    { re: /diamante|diamond|brillante/i,  name: 'Diamante',  color: '#7E94A6' },  // platino/diamante
];

/**
 * @returns {{name:string,color:string}|null} la gema de la pieza (nombre + color), o null si no se
 *   reconoce la piedra → el callsite cae a su tag manual o no muestra badge (nunca "Destacada").
 */
export function gemBadge(piece) {
    const stone = String(piece?.specs?.stones || piece?.specs?.stone || '');
    const g = GEMAS.find(x => x.re.test(stone));
    return g ? { name: g.name, color: g.color } : null;
}
