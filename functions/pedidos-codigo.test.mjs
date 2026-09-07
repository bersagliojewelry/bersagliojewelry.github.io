/**
 * Código público de pedido (BJ-XXXX-XXXX) — tests PUROS del generador (sin emulador).
 * Diseño §166 (comité ×3): alfabeto 29 símbolos SIN ambiguos (0/O · 1/I/L · U · V),
 * crypto.randomInt (sin sesgo modular), rng inyectable para determinismo.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { generarCodigoPedido, CODIGO_ALFABETO } = require('./pedidos-core.js');

test('alfabeto: 29 símbolos, sin ambiguos telefónicos (0 O 1 I L U V)', () => {
    assert.equal(CODIGO_ALFABETO.length, 29);
    for (const c of '0O1ILUV') assert.ok(!CODIGO_ALFABETO.includes(c), `el alfabeto no debe incluir '${c}'`);
    assert.ok(!/(.).*\1/.test(CODIGO_ALFABETO), 'sin símbolos repetidos');
});

test('formato: BJ-XXXX-XXXX con solo símbolos del alfabeto', () => {
    for (let i = 0; i < 200; i++) {
        const c = generarCodigoPedido();
        assert.match(c, /^BJ-[A-Z2-9]{4}-[A-Z2-9]{4}$/, c);
        for (const ch of c.replace(/^BJ-/, '').replace(/-/g, '')) {
            assert.ok(CODIGO_ALFABETO.includes(ch), `símbolo fuera del alfabeto: '${ch}' en ${c}`);
        }
    }
});

test('rng inyectable → determinista (testeable/reproducible)', () => {
    const fijo = (max) => 0;                              // siempre el primer símbolo
    assert.equal(generarCodigoPedido(fijo), 'BJ-2222-2222');
    let n = 0;
    const secuencia = (max) => (n++ % max);               // 0,1,2,3...
    assert.equal(generarCodigoPedido(secuencia), 'BJ-2345-6789');
});

test('aleatoriedad sana: 500 códigos sin colisión y usando símbolos variados', () => {
    const vistos = new Set();
    const simbolos = new Set();
    for (let i = 0; i < 500; i++) {
        const c = generarCodigoPedido();
        assert.ok(!vistos.has(c), `colisión inesperada en muestra chica: ${c}`);
        vistos.add(c);
        for (const ch of c.slice(3).replace('-', '')) simbolos.add(ch);
    }
    // Con 4000 extracciones sobre 29 símbolos, TODOS deben aparecer (p de fallo ≈ 0).
    assert.equal(simbolos.size, 29, 'todos los símbolos del alfabeto deben poder salir');
});
