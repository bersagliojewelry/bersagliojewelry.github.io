/**
 * Scaffold SINGLETON-FORM (P1 del CMS) — núcleo PURO + defaults del Home.
 *   node --test tests/singleton-admin.test.mjs
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { singletonFormHTML, collectSingleton, mergeSections, itemTemplateHTML, reindexItemSf } from '../js/admin/singleton-admin-core.js';
import { HOME_DEFAULTS, mergeHome } from '../js/home/siteContent-defaults.js';
import { NOSOTROS_DEFAULTS, mergeNosotros } from '../js/pages/nosotros-defaults.js';
import { GLOBAL_DEFAULTS, mergeGlobal, waHref, igHref } from '../js/core/global-defaults.js';

const SECTIONS = [
    { key: 'hero', label: 'Portada', fields: [
        { name: 'eyebrow', label: 'Eyebrow', type: 'text' },
        { name: 'manifesto', label: 'Manifiesto', type: 'textarea' },
    ]},
    { key: 'editorial', label: 'Editorial', fields: [
        { name: 'lead', label: 'Lead', type: 'textarea' },
    ]},
];

test('singletonFormHTML: data-sf por seccion.campo, input vs textarea, label escapado', () => {
    const h = singletonFormHTML(SECTIONS, { hero: { eyebrow: 'Alta joyería', manifesto: 'x' }, editorial: { lead: 'y' } });
    assert.match(h, /data-sf="hero\.eyebrow"/);
    assert.match(h, /data-sf="hero\.manifesto"/);
    assert.match(h, /data-sf="editorial\.lead"/);
    assert.match(h, /<input[^>]*data-sf="hero\.eyebrow"[^>]*value="Alta joyería"/);   // input pre-rellenado
    assert.match(h, /<textarea[^>]*data-sf="hero\.manifesto"[^>]*>x<\/textarea>/);     // textarea con valor
});

test('singletonFormHTML: escapa el valor (anti stored-XSS)', () => {
    const h = singletonFormHTML(SECTIONS, { hero: { eyebrow: '"><img onerror=alert(1)>', manifesto: '' }, editorial: { lead: '' } });
    assert.doesNotMatch(h, /<img onerror/);              // neutralizado
    assert.match(h, /&quot;&gt;&lt;img onerror/);        // escapado
});

test('collectSingleton: reconstruye anidado + SOLO claves declaradas + trim', () => {
    const raw = {
        'hero.eyebrow': '  Hola  ', 'hero.manifesto': 'm', 'editorial.lead': 'l',
        'hacker.x': 'DROP', 'hero.inyectado': 'no',
    };
    const out = collectSingleton(raw, SECTIONS);
    assert.deepEqual(out, { hero: { eyebrow: 'Hola', manifesto: 'm' }, editorial: { lead: 'l' } });
    assert.equal('hacker' in out, false);
    assert.equal('inyectado' in out.hero, false);
});

test('mergeSections: defaults + doc override por seccion', () => {
    const defaults = { hero: { eyebrow: 'def-e', manifesto: 'def-m' }, editorial: { lead: 'def-l' } };
    const doc = { hero: { eyebrow: 'NUEVO' } };
    const m = mergeSections(defaults, doc, SECTIONS);
    assert.equal(m.hero.eyebrow, 'NUEVO');      // doc gana
    assert.equal(m.hero.manifesto, 'def-m');    // default se mantiene
    assert.equal(m.editorial.lead, 'def-l');
});

test('mergeHome: null → DEFAULTS; override por sub-mapa', () => {
    assert.deepEqual(mergeHome(null).hero, HOME_DEFAULTS.hero);
    const m = mergeHome({ hero: { headline1: 'Mi titular' } });
    assert.equal(m.hero.headline1, 'Mi titular');                       // override
    assert.equal(m.hero.signatureName, HOME_DEFAULTS.hero.signatureName); // resto = default
    assert.equal(m.editorial.lead, HOME_DEFAULTS.editorial.lead);        // sección intacta
});

// ─── P3.5: campo IMAGEN ───────────────────────────────────────────────────────
const IMG_SECTIONS = [{ key: 'hero', label: 'Portada', fields: [
    { name: 'bgImage', label: 'Imagen', type: 'image' },
    { name: 'locator', label: 'Ubic',   type: 'text' },
]}];

test('singletonFormHTML: type=image → hidden con URL + preview + file input (avif en accept)', () => {
    const h = singletonFormHTML(IMG_SECTIONS, { hero: { bgImage: 'https://fs/x.webp', locator: 'C' } });
    assert.match(h, /<input type="hidden" data-sf="hero\.bgImage" value="https:\/\/fs\/x\.webp">/);
    assert.match(h, /data-img-input/);
    assert.match(h, /accept="image\/png,image\/jpeg,image\/webp,image\/avif"/);   // avif incluido
    assert.match(h, /sf-img-preview[^>]*><img src="https:\/\/fs\/x\.webp"/);      // preview con la imagen
    assert.match(h, /data-sf="hero\.locator"/);                                   // el texto sigue
});

test('singletonFormHTML: image vacío → placeholder + botón Quitar oculto', () => {
    const h = singletonFormHTML(IMG_SECTIONS, { hero: { bgImage: '', locator: '' } });
    assert.match(h, /sf-img-empty/);
    assert.match(h, /data-img-clear hidden>/);
});

test('singletonFormHTML: escapa la URL de imagen (anti stored-XSS en el panel)', () => {
    const h = singletonFormHTML(IMG_SECTIONS, { hero: { bgImage: '"><img onerror=alert(1) x="', locator: '' } });
    assert.doesNotMatch(h, /onerror=alert\(1\) x="/);   // no escapa al atributo
    assert.match(h, /&quot;&gt;&lt;img onerror/);        // queda escapado
});

test('collectSingleton: incluye el campo image (URL) como cualquier campo', () => {
    const out = collectSingleton({ 'hero.bgImage': 'https://fs/x.webp', 'hero.locator': '  C  ' }, IMG_SECTIONS);
    assert.equal(out.hero.bgImage, 'https://fs/x.webp');
    assert.equal(out.hero.locator, 'C');                // trim del texto
});

// ─── §103 F1: campo IMAGEN lleva un compañero `<campo>Lqip` (placeholder difuso) ──
test('singletonFormHTML/collect: campo image lleva compañero LQIP (data-img-lqip)', () => {
    const h = singletonFormHTML(IMG_SECTIONS, { hero: { bgImage: 'https://fs/x.webp', bgImageLqip: 'data:image/webp;base64,ZZZ', locator: 'C' } });
    assert.match(h, /<input type="hidden" data-sf="hero\.bgImage" value="https:\/\/fs\/x\.webp">/);                      // URL intacta (no-regresión)
    assert.match(h, /<input type="hidden" data-sf="hero\.bgImageLqip" data-img-lqip value="data:image\/webp;base64,ZZZ">/); // 2º hidden = LQIP
    const out = collectSingleton({ 'hero.bgImage': 'https://fs/x.webp', 'hero.bgImageLqip': 'data:image/webp;base64,ZZZ', 'hero.locator': 'C' }, IMG_SECTIONS);
    assert.equal(out.hero.bgImage, 'https://fs/x.webp');
    assert.equal(out.hero.bgImageLqip, 'data:image/webp;base64,ZZZ');
});

test('collectSingleton: campo image sin LQIP subido → compañero vacío (string, no undefined)', () => {
    const out = collectSingleton({ 'hero.bgImage': 'https://fs/x.webp', 'hero.locator': 'C' }, IMG_SECTIONS);
    assert.equal(out.hero.bgImageLqip, '');
});

// ─── P4: field-type LISTA ──────────────────────────────────────────────────────
const LIST_SECTIONS = [{ key: 'valores', label: 'Valores', fields: [
    { name: 'items', type: 'list', min: 1, max: 3, addLabel: 'Añadir valor', itemTitleFrom: 't', singular: 'Valor', itemFields: [
        { name: 't', label: 'Título',      type: 'text',     max: 40 },
        { name: 'd', label: 'Descripción', type: 'textarea', rows: 2, max: 200 },
    ]},
]}];

test('singletonFormHTML: type=list → contenedor data-sf-list + tarjetas con data-sf indexado', () => {
    const h = singletonFormHTML(LIST_SECTIONS, { valores: { items: [{ t: 'Elegancia', d: 'desc' }, { t: 'Pacto', d: 'd2' }] } });
    assert.match(h, /data-sf-list="valores\.items"/);
    assert.match(h, /data-list-max="3"/);
    assert.match(h, /data-list-min="1"/);
    assert.match(h, /<input[^>]*data-sf="valores\.items\.0\.t"[^>]*value="Elegancia"/);
    assert.match(h, /<input[^>]*data-sf="valores\.items\.1\.t"[^>]*value="Pacto"/);
    assert.match(h, /<textarea[^>]*data-sf="valores\.items\.0\.d"[^>]*>desc<\/textarea>/);
    assert.match(h, /data-list-act="add"[^>]*>.*Añadir valor/);
    assert.match(h, /data-list-act="del"/);
    assert.match(h, /data-list-act="up"/);
    assert.match(h, /data-list-act="down"/);
    assert.match(h, /data-sf-list-count>2\/3/);                         // contador inicial
    assert.match(h, /data-sf-item-title>Elegancia/);                    // título derivado de itemTitleFrom
});

test('itemTemplateHTML: ítem en blanco → data-sf en el índice dado + título placeholder', () => {
    const t = itemTemplateHTML('valores', LIST_SECTIONS[0].fields[0], {}, 2);
    assert.match(t, /data-sf-item/);
    assert.match(t, /data-sf="valores\.items\.2\.t"/);
    assert.match(t, /data-sf="valores\.items\.2\.d"/);
    assert.match(t, /sf-item-untitled[^>]*>Valor 3/);                   // placeholder = singular + (index+1)
});

test('singletonFormHTML: escapa los valores de los ítems de lista (anti stored-XSS)', () => {
    const h = singletonFormHTML(LIST_SECTIONS, { valores: { items: [{ t: '"><img onerror=alert(1)>', d: '' }] } });
    assert.doesNotMatch(h, /<img onerror/);
    assert.match(h, /&quot;&gt;&lt;img onerror/);
});

test('collectSingleton: list → array de objetos en orden, trim, SOLO sub-campos declarados', () => {
    const raw = {
        'valores.items.0.t': '  A  ', 'valores.items.0.d': 'da', 'valores.items.0.hacker': 'DROP',
        'valores.items.1.t': 'B',     'valores.items.1.d': 'db',
    };
    const out = collectSingleton(raw, LIST_SECTIONS);
    assert.deepEqual(out, { valores: { items: [{ t: 'A', d: 'da' }, { t: 'B', d: 'db' }] } });
    assert.equal('hacker' in out.valores.items[0], false);
});

test('collectSingleton: list → compacta huecos (orden por índice) y recorta a max', () => {
    const raw = {
        'valores.items.0.t': 'A', 'valores.items.0.d': 'da',
        'valores.items.2.t': 'C', 'valores.items.2.d': 'dc',   // hueco en 1
        'valores.items.3.t': 'D', 'valores.items.3.d': 'dd',
        'valores.items.5.t': 'E', 'valores.items.5.d': 'de',   // 4 ítems, max=3
    };
    const out = collectSingleton(raw, LIST_SECTIONS);
    assert.deepEqual(out.valores.items, [{ t: 'A', d: 'da' }, { t: 'C', d: 'dc' }, { t: 'D', d: 'dd' }]);
});

test('collectSingleton: list vacía (sin ítems en raw) → []', () => {
    const out = collectSingleton({}, LIST_SECTIONS);
    assert.deepEqual(out.valores.items, []);
});

test('reindexItemSf: reescribe el índice preservando sección/lista/sub (punto frágil)', () => {
    assert.equal(reindexItemSf('valores.items.3.t', 'valores.items', 0), 'valores.items.0.t');
    assert.equal(reindexItemSf('valores.items.0.d', 'valores.items', 2), 'valores.items.2.d');
    assert.equal(reindexItemSf('cartagena.stats.5.n', 'cartagena.stats', 1), 'cartagena.stats.1.n');
    assert.equal(reindexItemSf('otro.campo', 'valores.items', 0), 'otro.campo');   // ajeno: intacto
    assert.equal(reindexItemSf('valores.items.0', 'valores.items', 1), 'valores.items.0'); // sin sub: intacto
});

// Simula el ciclo reordenar→reindex→leer→collect: la salida sigue el ORDEN del DOM.
test('reindex + collect: tras intercambiar dos ítems, el array sale en el nuevo orden', () => {
    // DOM lógico = lista de tarjetas; cada tarjeta = sus data-sf actuales. Simulamos swap(0,1).
    const cardsDom = [
        { 't': 'B', 'd': 'db' },   // antes índice 1, ahora en posición 0 del DOM
        { 't': 'A', 'd': 'da' },   // antes índice 0, ahora en posición 1 del DOM
    ];
    // reindex: a cada tarjeta en posición i se le fija el índice i en sus data-sf
    const raw = {};
    cardsDom.forEach((card, i) => {
        for (const sub of Object.keys(card)) {
            const newSf = reindexItemSf(`valores.items.999.${sub}`, 'valores.items', i);
            raw[newSf] = card[sub];
        }
    });
    const out = collectSingleton(raw, LIST_SECTIONS);
    assert.deepEqual(out.valores.items, [{ t: 'B', d: 'db' }, { t: 'A', d: 'da' }]);  // orden del DOM
});

// Imágenes dentro de ítems de lista (equipo) — field-type image anidado (P4 + petición Daniel).
const LIST_IMG_SECTIONS = [{ key: 'equipo', label: 'Equipo', fields: [
    { name: 'items', type: 'list', max: 4, itemTitleFrom: 'n', itemFields: [
        { name: 'n',   label: 'Nombre', type: 'text' },
        { name: 'img', label: 'Foto',   type: 'image' },
    ]},
]}];

test('list con itemField image: render del upload indexado + collect recoge URL + LQIP compañero', () => {
    const h = singletonFormHTML(LIST_IMG_SECTIONS, { equipo: { items: [{ n: 'Kary', img: 'https://fs/k.avif', imgLqip: 'data:image/webp;base64,AAAA' }] } });
    assert.match(h, /data-img-wrap/);
    assert.match(h, /<input type="hidden"[^>]*data-sf="equipo\.items\.0\.img"[^>]*value="https:\/\/fs\/k\.avif"/);
    assert.match(h, /<input type="hidden" data-sf="equipo\.items\.0\.imgLqip" data-img-lqip value="data:image\/webp;base64,AAAA">/);
    // §103 F1: collect recoge URL + imgLqip; campo no declarado se ignora.
    const out = collectSingleton({
        'equipo.items.0.n': 'Kary',
        'equipo.items.0.img': 'https://fs/k.avif',
        'equipo.items.0.imgLqip': 'data:image/webp;base64,AAAA',
        'equipo.items.0.hacker': 'DROP',
    }, LIST_IMG_SECTIONS);
    assert.deepEqual(out.equipo.items, [{ n: 'Kary', img: 'https://fs/k.avif', imgLqip: 'data:image/webp;base64,AAAA' }]);
});

test('list con itemField image: sin LQIP → cada ítem trae imgLqip vacío (forma estable)', () => {
    const out = collectSingleton({ 'equipo.items.0.n': 'Kary', 'equipo.items.0.img': 'https://fs/k.avif' }, LIST_IMG_SECTIONS);
    assert.deepEqual(out.equipo.items, [{ n: 'Kary', img: 'https://fs/k.avif', imgLqip: '' }]);
});

test('list con itemField image: escapa la URL de la foto (anti stored-XSS)', () => {
    const h = singletonFormHTML(LIST_IMG_SECTIONS, { equipo: { items: [{ n: 'x', img: '"><script>alert(1)</script>' }] } });
    assert.doesNotMatch(h, /<script>alert/);
});

// Sección MIXTA (texto plano + lista) — espejo de `cartagena`. No-regresión del camino plano.
const MIXED_SECTIONS = [{ key: 'cartagena', label: 'Cartagena', fields: [
    { name: 'atelierTitle1', label: 'Título', type: 'text' },
    { name: 'stats', type: 'list', max: 4, itemFields: [
        { name: 'n', label: 'Número',  type: 'text' },
        { name: 'l', label: 'Etiqueta', type: 'text' },
        { name: 's', label: 'Sub',     type: 'text' },
    ]},
]}];

test('collectSingleton: sección mixta (plano + lista) recolecta ambos correctamente', () => {
    const raw = {
        'cartagena.atelierTitle1': '  Hola  ',
        'cartagena.stats.0.n': '13', 'cartagena.stats.0.l': 'años', 'cartagena.stats.0.s': '2013',
    };
    const out = collectSingleton(raw, MIXED_SECTIONS);
    assert.equal(out.cartagena.atelierTitle1, 'Hola');                  // plano trim ✅
    assert.deepEqual(out.cartagena.stats, [{ n: '13', l: 'años', s: '2013' }]);
});

// ─── P4: mergeNosotros (Fase 0) ────────────────────────────────────────────────
test('mergeNosotros: doc null → DEFAULTS íntegros (invariante web-idéntica con doc vacío)', () => {
    assert.deepEqual(mergeNosotros(null), NOSOTROS_DEFAULTS);
});

test('mergeNosotros: override plano + reemplazo de lista + lista vacía respetada', () => {
    const doc = { hero: { eyebrow: 'NUEVO' }, valores: { items: [{ t: 'X', d: 'y' }] }, faqs: { items: [] } };
    const m = mergeNosotros(doc);
    assert.equal(m.hero.eyebrow, 'NUEVO');                              // doc gana
    assert.equal(m.hero.titleL1, NOSOTROS_DEFAULTS.hero.titleL1);       // resto = default
    assert.deepEqual(m.valores.items, [{ t: 'X', d: 'y' }]);            // lista reemplazada
    assert.deepEqual(m.faqs.items, []);                                // [] explícito → hide-when-empty
    assert.deepEqual(m.timeline.items, NOSOTROS_DEFAULTS.timeline.items); // lista ausente → default
});

test('mergeNosotros: modelo PLANO — sub-mapa solo-lista respeta [] y default; atelier plano intacto', () => {
    const m = mergeNosotros({ atelier: { title1: 'Z' }, cifras: { items: [] } });
    assert.equal(m.atelier.title1, 'Z');                                          // override plano
    assert.equal(m.atelier.p1, NOSOTROS_DEFAULTS.atelier.p1);                     // flat default intacto
    assert.deepEqual(m.cifras.items, []);                                         // [] respetado
    assert.deepEqual(m.certificaciones.items, NOSOTROS_DEFAULTS.certificaciones.items); // lista ausente → default
    assert.deepEqual(m.resenas.items, NOSOTROS_DEFAULTS.resenas.items);
});

test('mergeNosotros: lista corrupta (no-array) cae al default (robustez)', () => {
    const m = mergeNosotros({ valores: { items: 'corrupto' } });
    assert.deepEqual(m.valores.items, NOSOTROS_DEFAULTS.valores.items);
});

// ─── CMS `global` (datos compartidos: contacto fuente única + footer) ──────────
test('mergeGlobal: null → DEFAULTS; override por sub-mapa, resto = default', () => {
    assert.deepEqual(mergeGlobal(null), GLOBAL_DEFAULTS);
    const m = mergeGlobal({ contacto: { whatsapp: '+57 300 000 0000' } });
    assert.equal(m.contacto.whatsapp, '+57 300 000 0000');
    assert.equal(m.contacto.email, GLOBAL_DEFAULTS.contacto.email);     // default conservado
    assert.equal(m.footer.tagline, GLOBAL_DEFAULTS.footer.tagline);
});

test('waHref/igHref: derivan enlaces robustos desde el valor mostrado (fuente única)', () => {
    assert.equal(waHref('+57 301 375 2592'), 'https://wa.me/573013752592');   // strip no-dígitos
    assert.equal(waHref(''), 'https://wa.me/');
    assert.equal(igHref('@bersagliojewelry'), 'https://instagram.com/bersagliojewelry'); // strip @
    assert.equal(igHref('bersagliojewelry'),  'https://instagram.com/bersagliojewelry');
});

test('mergeNosotros: encabezado editable (B) de valores/timeline — override plano + lista intacta', () => {
    const m = mergeNosotros({ valores: { titlePre: 'Otra cosa' }, timeline: { items: [{ y: '2030', t: 'x', d: 'z' }] } });
    assert.equal(m.valores.titlePre, 'Otra cosa');                          // header override
    assert.equal(m.valores.eyebrow, NOSOTROS_DEFAULTS.valores.eyebrow);     // resto del header = default
    assert.deepEqual(m.valores.items, NOSOTROS_DEFAULTS.valores.items);     // lista ausente → default
    assert.deepEqual(m.timeline.items, [{ y: '2030', t: 'x', d: 'z' }]);    // lista reemplazada
    assert.equal(m.timeline.titlePre, NOSOTROS_DEFAULTS.timeline.titlePre); // header default intacto
});
