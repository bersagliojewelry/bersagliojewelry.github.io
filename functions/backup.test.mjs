/**
 * Tests del codec de backup (PURO — sin emulador, node --test).
 *   npm run test:backup
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { serializeValue, deserializeValue } = require('./backup-codec.js');

// Fakes estructurales (mismas señales que el Admin SDK)
const fakeTimestamp = (s, n) => ({ seconds: s, nanoseconds: n, toDate: () => new Date(s * 1000) });
const fakeRef = (path) => ({ path, firestore: {} });
class GeoPoint { constructor(la, lo) { this.latitude = la; this.longitude = lo; } }

const revivers = {
    timestamp: (s, n) => fakeTimestamp(s, n),
    ref: (p) => fakeRef(p),
    geo: (la, lo) => new GeoPoint(la, lo),
    bytes: (b64) => Buffer.from(b64, 'base64'),
};

test('codec · primitivos y anidados hacen round-trip exacto', () => {
    const data = { nombre: 'Clienta', saldo: 1470000, activo: true, nada: null, tags: ['a', 'b'], sub: { x: 1 } };
    const out = deserializeValue(serializeValue(data), revivers);
    assert.deepEqual(out, { ...data });
});

test('codec · Timestamp se marca y revive con seconds/nanoseconds', () => {
    const ts = fakeTimestamp(1760000000, 500);
    const ser = serializeValue({ createdAt: ts });
    assert.deepEqual(ser.createdAt, { __t: 'ts', s: 1760000000, n: 500 });
    const out = deserializeValue(ser, revivers);
    assert.equal(out.createdAt.seconds, 1760000000);
    assert.equal(out.createdAt.nanoseconds, 500);
});

test('codec · DocumentReference se vuelve path y revive', () => {
    const ser = serializeValue({ cliente: fakeRef('clientes/abc') });
    assert.deepEqual(ser.cliente, { __t: 'ref', p: 'clientes/abc' });
    assert.equal(deserializeValue(ser, revivers).cliente.path, 'clientes/abc');
});

test('codec · Buffer hace round-trip por base64', () => {
    const buf = Buffer.from('esmeralda');
    const out = deserializeValue(serializeValue({ b: buf }), revivers);
    assert.equal(out.b.toString(), 'esmeralda');
});

test('codec · GeoPoint real se marca; map plano {latitude,longitude} NO se confunde', () => {
    const ser = serializeValue({ punto: new GeoPoint(10.4, -75.5), mapa: { latitude: 1, longitude: 2 } });
    assert.deepEqual(ser.punto, { __t: 'geo', la: 10.4, lo: -75.5 });
    assert.deepEqual(ser.mapa, { latitude: 1, longitude: 2 });   // sigue siendo map plano
});

test('codec · undefined se normaliza a null (JSON-safe)', () => {
    assert.equal(serializeValue(undefined), null);
    assert.deepEqual(serializeValue({ x: undefined }), { x: null });
});

test('codec · arrays con tipos mezclados hacen round-trip', () => {
    const data = { lista: [1, 'dos', fakeTimestamp(100, 0), { k: fakeRef('pieces/p1') }] };
    const out = deserializeValue(serializeValue(data), revivers);
    assert.equal(out.lista[2].seconds, 100);
    assert.equal(out.lista[3].k.path, 'pieces/p1');
});
