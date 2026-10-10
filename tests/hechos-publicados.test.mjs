/**
 * Gate de HECHOS PUBLICADOS (2026-10-10).
 *
 * Por qué existe: el 9-oct se descubrió que la web afirmaba cuatro sellos institucionales
 * —Jewelers of America, GIA, Muzo Origin, Responsible Jewellery Council— que el negocio no tiene,
 * y que un commit de septiembre decía haberlos quitado. No los quitó: ese texto vive en el CMS
 * (Firestore), no en el repositorio, así que el commit limpió un sitio donde el texto no estaba.
 *
 * Qué puede y qué NO puede hacer este gate, dicho claro para que nadie se confíe:
 *   ✅ impide que esas afirmaciones VUELVAN A ENTRAR por el código (defaults, plantillas, metadatos).
 *   ❌ NO ve el contenido del CMS. Lo que Kary escribe en el panel es lo que Google lee, y ningún
 *      test de este repositorio lo alcanza. Para eso hace falta mirar la PÁGINA PUBLICADA.
 * Esa distinción es la lección L-90 del cerebro: auditar la carpeta no es auditar lo publicado.
 *
 *   node --test tests/hechos-publicados.test.mjs
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/** El año en que arrancó el oficio. Lo confirmó Daniel el 2026-10-10: «desde 1983, corrígelo en todo». */
const ANIO_FUNDACION = 1983;

/** Ficheros del SITIO que puede leer un visitante o un buscador. Excluye lo que no se publica. */
function ficherosDelSitio() {
    const fuera = new Set(['node_modules', 'dist', '.git', 'functions', 'tests', 'scripts',
        'Bersaglio Jewelry Design System', '.handoff', 'docs', '_legacy', 'snippets']);
    const salida = [];
    (function recorrer(dir) {
        for (const nombre of readdirSync(dir)) {
            if (fuera.has(nombre) || nombre.startsWith('.')) continue;
            const ruta = join(dir, nombre);
            if (statSync(ruta).isDirectory()) recorrer(ruta);
            else if (/\.(html|js)$/.test(nombre) && !nombre.startsWith('session-report-')) salida.push(ruta);
        }
    })(ROOT);
    return salida;
}

const SITIO = ficherosDelSitio().map(ruta => ({ ruta: relative(ROOT, ruta), texto: readFileSync(ruta, 'utf8') }));

test('hechos: los años de oficio se derivan de 1983 y no hay dos cifras distintas', () => {
    // Se calcula, no se escribe a mano: así el gate no caduca cada 1 de enero.
    const esperado = new Date().getFullYear() - ANIO_FUNDACION;
    const malos = [];
    for (const { ruta, texto } of SITIO) {
        for (const m of texto.matchAll(/(\d{2})\s*años de oficio/gi)) {
            if (Number(m[1]) !== esperado) malos.push(`${ruta}: dice "${m[0]}" y desde ${ANIO_FUNDACION} son ${esperado}`);
        }
    }
    assert.deepEqual(malos, [],
        `cifras de años que no cuadran con la fundación en ${ANIO_FUNDACION}:\n  ${malos.join('\n  ')}\n`
        + '⚠️ Y recuerda: el texto del panel NO lo ve este test. Comprueba también la página publicada.');
});

test('hechos: no vuelven a entrar por código los sellos que el negocio no tiene', () => {
    // Retirados el 2026-10-10 tras medirlos en la web viva. Si alguno es cierto algún día, se añade
    // aquí CON la prueba al lado — nunca al revés.
    const PROHIBIDOS = [
        ['Jewelers of America', 'membresía de un gremio de EE. UU. con directorio público'],
        ['Responsible Jewellery Council', 'certificación con auditoría; comprobable en su directorio'],
        ['Muzo Origin', 'programa de socios de Muzo International'],
        ['Muzo', 'MARCA REGISTRADA ajena: Muzo International tiene formulario público para denunciar su uso'],
    ];
    const encontrados = [];
    for (const { ruta, texto } of SITIO) {
        for (const [termino, porque] of PROHIBIDOS) {
            // `Muzo` solo como palabra suelta, para no cazar un futuro "zona de Muzo" con factura.
            const re = termino === 'Muzo' ? /\bMuzo\b(?!\s+Origin)/ : new RegExp(termino.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
            if (re.test(texto)) encontrados.push(`${ruta}: "${termino}" — ${porque}`);
        }
    }
    assert.deepEqual(encontrados, [],
        `afirmaciones sin respaldo de vuelta en el código:\n  ${encontrados.join('\n  ')}\n`
        + 'Si de verdad se consiguió una, añádela aquí junto con el número de certificado o la URL del '
        + 'directorio donde el cliente la comprueba. Un sello que nadie puede verificar no es un activo.');
});

test('hechos: el gate declara EN VOZ ALTA que no alcanza al panel', () => {
    // Un gate que parece cubrir más de lo que cubre es peor que no tenerlo: da permiso para no mirar.
    const yo = readFileSync(join(ROOT, 'tests/hechos-publicados.test.mjs'), 'utf8');
    assert.match(yo, /NO ve el contenido del CMS/,
        'si se borra ese aviso, alguien va a creer que este test cubre lo que Kary escribe en el panel');
});
