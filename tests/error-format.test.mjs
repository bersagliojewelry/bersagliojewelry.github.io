/**
 * tests/error-format.test.mjs — traductor de errores del panel (TODO-79).
 * `node --test tests/error-format.test.mjs` (npm run test:errores). Sin DOM ni Firestore.
 *
 * ESCENARIO QUE BLINDA (cazado en el E2E de D6, 2026-07-24): el servidor RECHAZA bien
 * ("el límite del cajón debe ser un entero positivo") pero Kary veía "Ocurrió un error".
 * Causa: el SDK de callables PREFIJA el code (`functions/failed-precondition`), así que ni la
 * tabla `ERROR_MESSAGES` ni los `BUSINESS_ERR.includes(err.code)` de los módulos acertaban.
 * En dinero eso es grave: el microcopy (qué pasó + qué pasó con la plata + qué hacer) se
 * perdía exactamente donde más importa, y empuja a la usuaria a reintentar a ciegas.
 */
import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { errorMessage, errorCode, esErrorDeCallable } from '../js/admin/error-format.js';

// El traductor SIEMPRE loguea el code real (diagnóstico); lo silenciamos para no ensuciar
// la salida del runner, pero verificamos que sigue logueando (es parte del contrato).
let logs = [];
const realError = console.error;
beforeEach(() => { logs = []; console.error = (...a) => logs.push(a.join(' ')); });
afterEach(() => { console.error = realError; });

// ─── errorCode: normalización del prefijo del SDK ────────────────────────────
test('errorCode — quita el prefijo `functions/` de los callables', () => {
    assert.equal(errorCode({ code: 'functions/failed-precondition' }), 'failed-precondition');
    assert.equal(errorCode({ code: 'functions/permission-denied' }), 'permission-denied');
});

test('errorCode — NO toca los codes de Firestore/Storage/Auth', () => {
    assert.equal(errorCode({ code: 'permission-denied' }), 'permission-denied');
    assert.equal(errorCode({ code: 'storage/unauthorized' }), 'storage/unauthorized');
    assert.equal(errorCode({}), '');
    assert.equal(errorCode(null), '');
});

test('esErrorDeCallable — distingue la fuente del error', () => {
    assert.equal(esErrorDeCallable({ code: 'functions/not-found' }), true);
    assert.equal(esErrorDeCallable({ code: 'not-found' }), false);
    assert.equal(esErrorDeCallable(undefined), false);
});

// ─── El bug de TODO-79 ───────────────────────────────────────────────────────
test('CF rechaza por negocio → llega el MOTIVO REAL del servidor, no el genérico', () => {
    const err = { code: 'functions/failed-precondition', message: 'La caja no está abierta: ábrela en el Mostrador para recibir efectivo.' };
    assert.equal(errorMessage(err, 'No se pudo registrar el abono.'),
        'La caja no está abierta: ábrela en el Mostrador para recibir efectivo.');
});

test('CF rechaza por dato inválido → motivo real (antes: "Hay un dato inválido")', () => {
    const err = { code: 'functions/invalid-argument', message: 'El límite del cajón debe ser un entero positivo.' };
    assert.equal(errorMessage(err), 'El límite del cajón debe ser un entero positivo.');
});

test('CF sin permiso → motivo real del servidor (SoD explicada, no "No tienes permiso")', () => {
    const err = { code: 'functions/permission-denied', message: 'Solo el dueño puede cambiar las reglas del sistema.' };
    assert.equal(errorMessage(err), 'Solo el dueño puede cambiar las reglas del sistema.');
});

test('CF de negocio SIN message → cae al mensaje curado por code', () => {
    assert.equal(errorMessage({ code: 'functions/not-found' }),
        'El elemento ya no existe (lo borró otra persona).');
    assert.equal(errorMessage({ code: 'functions/failed-precondition', message: '   ' }),
        'No se pudo completar: el estado cambió. Recarga e intenta.');
});

// ─── Lo que NO debe filtrarse ────────────────────────────────────────────────
test('CF con error INTERNO → jamás muestra la traza técnica', () => {
    const err = { code: 'functions/internal', message: 'TypeError: Cannot read properties of undefined (reading foo)' };
    assert.equal(errorMessage(err, 'No se pudo guardar.'), 'No se pudo guardar.');
});

test('permission-denied de las REGLAS (sin prefijo) → mensaje curado, no el interno', () => {
    const err = { code: 'permission-denied', message: 'Missing or insufficient permissions.' };
    assert.equal(errorMessage(err), 'No tienes permiso para esta acción.');
});

// ─── No-regresión del comportamiento viejo (§117) ────────────────────────────
test('mapa curado intacto — permisos NO se leen como conexión (§117)', () => {
    assert.equal(errorMessage({ code: 'storage/unauthorized' }),
        'No tienes permiso para subir o borrar esta imagen.');
    assert.equal(errorMessage({ code: 'unavailable' }),
        'Sin conexión con el servidor. Revisa tu internet y reintenta.');
});

test('code desconocido → fallback del callsite; sin error → no explota', () => {
    assert.equal(errorMessage({ code: 'algo-raro' }, 'No se pudo aprobar.'), 'No se pudo aprobar.');
    assert.equal(errorMessage(null), 'Ocurrió un error. Reintenta.');
    assert.equal(errorMessage(new Error('boom'), 'Falló.'), 'Falló.');
});

test('SIEMPRE loguea el code REAL (con prefijo) para diagnóstico', () => {
    errorMessage({ code: 'functions/failed-precondition', message: 'motivo' });
    assert.ok(logs.some((l) => l.includes('functions/failed-precondition')),
        'el log debe conservar el code crudo, no el normalizado');
    logs = [];
    errorMessage({});
    assert.ok(logs.some((l) => l.includes('(sin code)')));
});
