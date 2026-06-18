/**
 * Scaffold SINGLETON-FORM (P1 del CMS) — núcleo PURO + defaults del Home.
 *   node --test tests/singleton-admin.test.mjs
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { singletonFormHTML, collectSingleton, mergeSections } from '../js/admin/singleton-admin-core.js';
import { HOME_DEFAULTS, mergeHome } from '../js/home/siteContent-defaults.js';

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
