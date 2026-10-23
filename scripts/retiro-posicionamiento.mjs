/**
 * scripts/retiro-posicionamiento.mjs — el barrido final del build para el RETIRO (TODO-99 · cerebro `49a`).
 *
 * Corre al final de `generate-pieces.mjs`, cuando el `dist` ya está completo (páginas de Vite + las que
 * hornea el SSG + el pie). Recorre TODO el `dist` en una sola pasada —el mismo patrón que la pasada del
 * pie— para que ninguna página quede fuera aunque mañana nazca un horneador nuevo:
 *   - cada `.html` → `retirarDeBuscadores` (noindex + sin JSON-LD; la verificación de Search Console,
 *     sin `<head>`, sale intacta);
 *   - `sitemap.xml` y `llms.txt` salen de lo publicado (sus fuentes en `public/` se quedan, para revertir).
 * El interruptor vive en `js/core/retiro.js`.
 */

import { readdirSync, readFileSync, writeFileSync, statSync, existsSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { retirarDeBuscadores } from '../js/core/retiro.js';

const FUERA_DEL_DIST = ['sitemap.xml', 'llms.txt'];

export function barrerDist(dist) {
    let paginas = 0;
    (function recorrer(dir) {
        for (const nombre of readdirSync(dir)) {
            const ruta = join(dir, nombre);
            if (statSync(ruta).isDirectory()) { recorrer(ruta); continue; }
            if (!nombre.endsWith('.html')) continue;
            const h = readFileSync(ruta, 'utf-8');
            const out = retirarDeBuscadores(h);
            if (out !== h) { writeFileSync(ruta, out); paginas++; }
        }
    })(dist);
    const borrados = [];
    for (const f of FUERA_DEL_DIST) {
        const ruta = join(dist, f);
        if (existsSync(ruta)) { unlinkSync(ruta); borrados.push(f); }
    }
    return { paginas, borrados };
}
