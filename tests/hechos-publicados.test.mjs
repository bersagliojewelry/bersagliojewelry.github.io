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

test('hechos: no se promete un boceto a mano alzada ni una visita al taller', () => {
    // Daniel, 2026-10-10, preguntado de frente: «no hay un taller físico donde los clientes puedan
    // ver el proceso, lo que está es la tienda; Kary tiene el taller oculto… lo del primer boceto a
    // mano alzada es mentira, el cliente llega con su diseño y Kary se lo envía a hacer».
    // Ojo: el taller EXISTE y el café con Kary es REAL. Lo falso es (a) dibujar un boceto a mano
    // alzada y (b) invitar al cliente a ver el taller. La tienda sí se visita.
    const PROHIBIDOS = [
        [/boceto a mano alzada/i, 'nadie dibuja un boceto a mano alzada: el cliente trae su diseño'],
        [/(visit\w*|conoc\w*|\bven\b|vengan|ac[eé]rcate|pas[ae] por|descubr\w*)[^.!?]{0,200}\btaller\b/i,
            'el taller no se visita; el cliente conoce la TIENDA. Di «tienda» o «atelier», no «taller». '
            + 'Se busca en la MISMA frase y sin límite corto de distancia, porque la que de verdad lo '
            + 'colaba era larga: «Ven a descubrir nuestra curaduría … directamente en el taller de la '
            + 'diseñadora Kary Mendoza» (publicación del Perfil de Empresa del 9-jul)'],
    ];
    const encontrados = [];
    for (const { ruta, texto } of SITIO) {
        for (const [re, porque] of PROHIBIDOS) {
            const m = texto.match(re);
            if (m) encontrados.push(`${ruta}: "${m[0]}" — ${porque}`);
        }
    }
    assert.deepEqual(encontrados, [],
        `promesas que el negocio no cumple, de vuelta en el código:\n  ${encontrados.join('\n  ')}\n`
        + '⚠️ Y esto tampoco alcanza al panel ni a las publicaciones del Perfil de Empresa.');
});

test('hechos: «diamantes certificados» y «EST. 2014» no quedan vivos en ninguna de sus fuentes', () => {
    // El 10-oct el commit ebf7fa8 dijo cambiar «diamantes certificados» por «esmeraldas
    // certificadas». Cambió UNA fuente de SEIS, y la frase siguió SERVIDA en el JSON-LD del home
    // (medida ese mismo día: 1 ocurrencia en https://bersagliojewelry.co/). El certificado de
    // Truelab acredita la ESMERALDA, no las piedras blancas; nombrar el diamante como material
    // está bien, llamarlo certificado no.
    // «EST. 2014» contradecía el 1983 que fijó el commit 6bb8789, y vivía en el Journal.
    // Este test mira también .json, que el barrido de ficheros del sitio NO incluye: ahí estaban
    // dos de las seis (tenant_config.json y public/manifest.json).
    const FUENTES = ['tenant_config.json', 'public/manifest.json', 'js/core/global-defaults.js',
        'js/data/journal.js', 'js/home/journal-preview.js', 'scripts/generate-pieces.mjs'];
    const PROHIBIDOS = [
        [/diamantes?\s+certificad[oa]s?/i, 'el certificado acredita la esmeralda, no el diamante'],
        [/EST\.?\s*(?!1983)\d{4}/i, `la casa es de ${ANIO_FUNDACION}; cualquier otro año aquí es falso`],
    ];
    const encontrados = [];
    for (const rel of FUENTES) {
        const texto = readFileSync(join(ROOT, rel), 'utf8');
        for (const [re, porque] of PROHIBIDOS) {
            const m = texto.match(re);
            if (m) encontrados.push(`${rel}: "${m[0]}" — ${porque}`);
        }
    }
    // Y de paso, el barrido general, por si aparece una fuente SÉPTIMA que nadie listó.
    for (const { ruta, texto } of SITIO) {
        for (const [re, porque] of PROHIBIDOS) {
            const m = texto.match(re);
            if (m && !FUENTES.includes(ruta.replace(/\\/g, '/'))) encontrados.push(`${ruta}: "${m[0]}" — ${porque}`);
        }
    }
    assert.deepEqual(encontrados, [],
        `frases retiradas que volvieron a entrar:\n  ${encontrados.join('\n  ')}\n`
        + 'Son SEIS ficheros para la misma frase: arreglar uno y dar la tarea por cerrada fue justo '
        + 'el error de ebf7fa8. Se cierran todos en la misma tanda.');
});

test('coherencia: el horario vive en TRES sitios del código y los tres dicen lo mismo', () => {
    // El 2026-10-10 el horario real pasó a 9:30–19:00 y estaba escrito a mano en tres ficheros
    // distintos, los tres con el 8:00 viejo. Este test es el que impide que vuelvan a divergir:
    // es la versión mecanizada de la lección L-91 para el único de los tres sitios que un test
    // alcanza (el repositorio). El CMS y el Perfil de Empresa siguen siendo cosa de mirar a mano.
    const tenant = JSON.parse(readFileSync(join(ROOT, 'tenant_config.json'), 'utf8'));
    const spec = tenant.openingHours[0];
    const abre = spec.opens;                                   // "09:30"
    const cierra = spec.closes;                                // "19:00"

    const contacto = readFileSync(join(ROOT, 'js/pages/contacto.js'), 'utf8');
    const filas = [...contacto.matchAll(/\{ d: '[^']+',\s*h: '(\d{2}:\d{2}) – (\d{2}:\d{2})'/g)];
    assert.equal(filas.length, 7, 'contacto.js debería listar los siete días');
    for (const [, a, c] of filas) {
        assert.equal(a, abre, `contacto.js abre a las ${a} y el schema dice ${abre}`);
        assert.equal(c, cierra, `contacto.js cierra a las ${c} y el schema dice ${cierra}`);
    }

    // El pie del sitio lo escribe en lenguaje humano: "9:30 a.m. – 7:00 p.m.".
    const humano = (hhmm) => {
        const [h, m] = hhmm.split(':').map(Number);
        const h12 = h % 12 === 0 ? 12 : h % 12;
        return `${h12}:${String(m).padStart(2, '0')} ${h < 12 ? 'a.m.' : 'p.m.'}`;
    };
    const global = readFileSync(join(ROOT, 'js/core/global-defaults.js'), 'utf8');
    const esperado = `${humano(abre)} – ${humano(cierra)}`;
    assert.ok(global.includes(esperado),
        `global-defaults.js debería decir "${esperado}" y no lo dice. Si cambias el horario, `
        + 'cámbialo en los TRES: tenant_config.json, js/pages/contacto.js y js/core/global-defaults.js.');
});

test('hechos: el gate declara EN VOZ ALTA que no alcanza al panel', () => {
    // Un gate que parece cubrir más de lo que cubre es peor que no tenerlo: da permiso para no mirar.
    const yo = readFileSync(join(ROOT, 'tests/hechos-publicados.test.mjs'), 'utf8');
    assert.match(yo, /NO ve el contenido del CMS/,
        'si se borra ese aviso, alguien va a creer que este test cubre lo que Kary escribe en el panel');
});
