/**
 * Helpers de render del blur-up (§103 F1) — js/core/lqip.js. PUROS.
 *   node --test tests/lqip.test.mjs
 *
 * Lo crítico: el `style=` que producen es SEGURO en CSS url() — la URL real va por
 * safeUrl()+escape() y el LQIP por safeLqip() (regex base64) → imposible romper el url().
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lqipBgStyle, lqipImgStyle } from '../js/core/lqip.js';

const LQIP = 'data:image/webp;base64,UklGRhYAAABXRUJQ';

test('lqipBgStyle: con LQIP válido → doble fondo (real ARRIBA, lqip detrás)', () => {
    assert.equal(
        lqipBgStyle('https://fs/x.webp', LQIP),
        `background-image:url('https://fs/x.webp'),url('${LQIP}')`,
    );
});

test('lqipBgStyle: sin LQIP (o inválido) → solo la real (comportamiento actual)', () => {
    assert.equal(lqipBgStyle('https://fs/x.webp', ''), "background-image:url('https://fs/x.webp')");
    assert.equal(lqipBgStyle('https://fs/x.webp', undefined), "background-image:url('https://fs/x.webp')");
    // LQIP con intento de breakout del url() → safeLqip lo descarta → no aparece en el style
    const out = lqipBgStyle('https://fs/x.webp', "data:image/webp;base64,AAA');background:red");
    assert.equal(out, "background-image:url('https://fs/x.webp')");
    assert.doesNotMatch(out, /background:red/);
});

test('lqipBgStyle: URL real insegura (javascript:) → safeUrl la vacía (no se cuela)', () => {
    const out = lqipBgStyle('javascript:alert(1)', LQIP);
    assert.doesNotMatch(out, /javascript:/);
    assert.equal(out, `background-image:url(''),url('${LQIP}')`);
});

test('lqipImgStyle: con LQIP válido → fondo del <img> con cover/center', () => {
    assert.equal(lqipImgStyle(LQIP), `background-image:url('${LQIP}');background-size:cover;background-position:center`);
});

test('lqipImgStyle: sin LQIP (o inválido) → "" (el <img> queda sin style extra)', () => {
    assert.equal(lqipImgStyle(''), '');
    assert.equal(lqipImgStyle('https://evil.com/x.webp'), '');   // URL normal no es LQIP
    assert.equal(lqipImgStyle(null), '');
});
