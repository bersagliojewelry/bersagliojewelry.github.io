/**
 * Tests de los helpers PUROS de gestiones de cobro (Fase M · M5) —
 * js/crm-gestiones.js. Runner: node:test (sin emulador).
 *
 * Las listas se comparan contra los LITERALES de gestionValida() (firestore.rules):
 * si alguien cambia la regla o el espejo por separado, estos tests revientan.
 *
 *   npm run test:gestiones
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
    TIPOS_GESTION, RESULTADOS_GESTION, tipoGestionLabel, resultadoGestionLabel,
    validarGestion, ordenarGestiones, esEnlaceSeguro,
} from '../js/crm-gestiones.js';

const HOY = '2026-06-12';
const ok = { tipo: 'llamada', resultado: 'promesa_pago', fecha: '2026-06-10' };

// ─── listas espejo de la regla (deriva = test rojo) ───────────────────────────
test('TIPOS_GESTION espeja la lista literal de gestionValida()', () => {
    assert.deepEqual(TIPOS_GESTION.map((t) => t.codigo),
        ['llamada', 'whatsapp', 'visita', 'otro']);
});

test('RESULTADOS_GESTION espeja la lista literal de gestionValida()', () => {
    assert.deepEqual(RESULTADOS_GESTION.map((r) => r.codigo),
        ['promesa_pago', 'sin_acuerdo', 'no_contesto', 'numero_invalido', 'otro']);
});

test('labels: código conocido → mostrador; desconocido → el código crudo', () => {
    assert.equal(tipoGestionLabel('whatsapp'), 'WhatsApp');
    assert.equal(resultadoGestionLabel('promesa_pago'), 'Prometió pagar');
    assert.equal(tipoGestionLabel('telegrama'), 'telegrama');
    assert.equal(resultadoGestionLabel(undefined), '—');
});

// ─── validarGestion (espejo + fecha futura) ───────────────────────────────────
test('gestión completa y válida pasa', () => {
    assert.deepEqual(validarGestion(ok, HOY), { ok: true, errores: [] });
});

test('hoy mismo es válido (la gestión de esta mañana)', () => {
    assert.equal(validarGestion({ ...ok, fecha: HOY }, HOY).ok, true);
});

test('tipo fuera de lista o ausente → error', () => {
    assert.equal(validarGestion({ ...ok, tipo: 'telegrama' }, HOY).ok, false);
    assert.equal(validarGestion({ ...ok, tipo: '' }, HOY).ok, false);
});

test('resultado fuera de lista o ausente → error (seriedad probatoria)', () => {
    assert.equal(validarGestion({ ...ok, resultado: 'pendiente' }, HOY).ok, false);
    assert.equal(validarGestion({ ...ok, resultado: undefined }, HOY).ok, false);
});

test('fecha mal formada o ausente → error', () => {
    assert.equal(validarGestion({ ...ok, fecha: '12/06/2026' }, HOY).ok, false);
    assert.equal(validarGestion({ ...ok, fecha: '' }, HOY).ok, false);
});

test('fecha FUTURA → error solo si se pasa `hoy` (la regla no la limita; la UI sí)', () => {
    assert.equal(validarGestion({ ...ok, fecha: '2026-06-13' }, HOY).ok, false);
    assert.equal(validarGestion({ ...ok, fecha: '2026-06-13' }).ok, true);
});

test('acumula errores (payload vacío reporta los tres obligatorios)', () => {
    const v = validarGestion({}, HOY);
    assert.equal(v.ok, false);
    assert.equal(v.errores.length, 3);
});

// ─── ordenarGestiones ─────────────────────────────────────────────────────────
const ts = (ms) => ({ toMillis: () => ms });

test('ordena por fecha del hecho DESC; empate → creadoEn DESC; no muta', () => {
    const lista = [
        { id: 'a', fecha: '2026-06-01', creadoEn: ts(100) },
        { id: 'b', fecha: '2026-06-10', creadoEn: ts(50) },
        { id: 'c', fecha: '2026-06-10', creadoEn: ts(200) },
    ];
    const copia = [...lista];
    assert.deepEqual(ordenarGestiones(lista).map((g) => g.id), ['c', 'b', 'a']);
    assert.deepEqual(lista, copia);   // el original queda intacto
});

test('sin fecha válida → al final; lista vacía/null no revienta', () => {
    const lista = [
        { id: 'x', fecha: null, creadoEn: ts(999) },
        { id: 'y', fecha: '2026-01-01', creadoEn: ts(1) },
    ];
    assert.deepEqual(ordenarGestiones(lista).map((g) => g.id), ['y', 'x']);
    assert.deepEqual(ordenarGestiones([]), []);
    assert.deepEqual(ordenarGestiones(null), []);
});

test('creadoEn PENDIENTE (serverTimestamp sin ack → null) cuenta como el más nuevo de su fecha', () => {
    const lista = [
        { id: 'vieja', fecha: '2026-06-10', creadoEn: ts(100) },
        { id: 'pendiente', fecha: '2026-06-10', creadoEn: null },
        { id: 'otra-fecha', fecha: '2026-06-11', creadoEn: ts(1) },
    ];
    assert.deepEqual(ordenarGestiones(lista).map((g) => g.id), ['otra-fecha', 'pendiente', 'vieja']);
    // Dos pendientes en la misma fecha: orden estable, sin NaN que rompa el sort.
    const dos = [
        { id: 'p1', fecha: '2026-06-10', creadoEn: null },
        { id: 'p2', fecha: '2026-06-10', creadoEn: null },
    ];
    assert.deepEqual(ordenarGestiones(dos).map((g) => g.id), ['p1', 'p2']);
});

// ─── esEnlaceSeguro ───────────────────────────────────────────────────────────
test('solo http(s) es clickeable; javascript:/texto plano NO', () => {
    assert.equal(esEnlaceSeguro('https://wa.me/57300'), true);
    assert.equal(esEnlaceSeguro('  http://drive.google.com/x '), true);
    // eslint-disable-next-line no-script-url
    assert.equal(esEnlaceSeguro('javascript:alert(1)'), false);
    assert.equal(esEnlaceSeguro('recibo #423'), false);
    assert.equal(esEnlaceSeguro(undefined), false);
});
