/**
 * Tests del RE-VALIDADOR puro de la aprobación de Daniel (Fase M · M2b) —
 * js/crm-aprobacion.js. Runner: node:test (sin emulador).
 *
 * El contrato (ADR §74): M2b NUNCA confía en `datosCorreccion` — re-lee el
 * original real y verifica (a) vigente, (b) tipo, (c) no mutado, (d) delta
 * coherente con efectoSaldo IMPORTADO, (e) reemplazo válido; (f) drift de
 * saldo y (g) drift de snapshot ADVIERTEN sin bloquear.
 *
 *   npm run test:aprobacion
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
    validarAprobacionAjuste, validarAprobacionCorreccion, hayDriftSaldo,
    planAprobacionAjuste, planAprobacionCorreccion,
    MOTIVO_OBSOLETA, MOTIVO_INCOHERENTE,
} from '../js/crm-aprobacion.js';

// Caso base: Kary pidió corregir una factura de $500.000 → $80.000 (dedazo).
// delta = efectoSaldo(factura, 80000) − efectoSaldo(factura, 500000) = −420.000.
function solCorreccion(over = {}, dcOver = {}) {
    return {
        tipo: 'correccion',
        monto: -420000,
        motivo: 'Te equivocaste al digitar el monto',
        nota: 'la factura real era de 80 mil',
        correccionDe: 'mov-original-1',
        saldoAlSolicitar: 700000,
        datosCorreccion: {
            reemplazo: { tipo: 'factura', monto: 80000, fecha: '2026-06-01' },
            snapshotOriginal: { tipo: 'factura', monto: 500000, fecha: '2026-06-01', anulado: false },
            motivoCategoria: 'CORRECCION',
            ...dcOver,
        },
        ...over,
    };
}
function originalVigente(over = {}) {
    return { id: 'mov-original-1', tipo: 'factura', monto: 500000, fecha: '2026-06-01', anulado: false, ...over };
}

// ─── validarAprobacionCorreccion: camino feliz ────────────────────────────────
test('corrección coherente sobre original vigente → ok, sin obsoleta ni errores', () => {
    const v = validarAprobacionCorreccion(solCorreccion(), originalVigente());
    assert.equal(v.ok, true);
    assert.equal(v.obsoleta, false);
    assert.deepEqual(v.errores, []);
    assert.deepEqual(v.advertencias, []);
});

test('corrección de FECHA (mismo monto, delta 0) es legítima', () => {
    const sol = solCorreccion(
        { monto: 0 },
        { reemplazo: { tipo: 'factura', monto: 500000, fecha: '2026-05-15' }, motivoCategoria: 'CORRECCION_FECHA' },
    );
    const v = validarAprobacionCorreccion(sol, originalVigente());
    assert.equal(v.ok, true);
});

// ─── (a) vigencia → obsoleta (rechazo automático, no error de datos) ──────────
test('original inexistente → obsoleta', () => {
    const v = validarAprobacionCorreccion(solCorreccion(), null);
    assert.equal(v.ok, false);
    assert.equal(v.obsoleta, true);
});
test('original ya anulado (corregido por otra vía) → obsoleta', () => {
    const v = validarAprobacionCorreccion(solCorreccion(), originalVigente({ anulado: true }));
    assert.equal(v.ok, false);
    assert.equal(v.obsoleta, true);
});

// ─── solicitud incompleta (las reglas M1 admiten correccion sin payload) ──────
test('correccion sin correccionDe o sin reemplazo → bloqueada (no obsoleta)', () => {
    const sinDe = validarAprobacionCorreccion(solCorreccion({ correccionDe: undefined }), originalVigente());
    assert.equal(sinDe.ok, false);
    assert.equal(sinDe.obsoleta, false);
    const sinDatos = validarAprobacionCorreccion(solCorreccion({ datosCorreccion: undefined }), originalVigente());
    assert.equal(sinDatos.ok, false);
});
test('solicitud de otro tipo → bloqueada', () => {
    const v = validarAprobacionCorreccion(solCorreccion({ tipo: 'ajuste' }), originalVigente());
    assert.equal(v.ok, false);
});

// ─── (b) tipo coincide ────────────────────────────────────────────────────────
test('reemplazo de tipo distinto al original → bloqueado', () => {
    const sol = solCorreccion({}, { reemplazo: { tipo: 'abono', monto: 80000 } });
    const v = validarAprobacionCorreccion(sol, originalVigente());
    assert.equal(v.ok, false);
});
test('el original real es de otro tipo que el snapshot → bloqueado', () => {
    const v = validarAprobacionCorreccion(solCorreccion(), originalVigente({ tipo: 'ajuste' }));
    assert.equal(v.ok, false);
});
test('corrección sobre un AJUSTE → bloqueada (M3: se anula y se registra uno nuevo)', () => {
    const sol = solCorreccion({}, {
        reemplazo: { tipo: 'ajuste', monto: 80000 },
        snapshotOriginal: { tipo: 'ajuste', monto: 500000, anulado: false },
    });
    const v = validarAprobacionCorreccion(sol, originalVigente({ tipo: 'ajuste' }));
    assert.equal(v.ok, false);
    assert.equal(v.obsoleta, false);
});

// ─── (c) original mutado vs snapshot (campo de dinero) ────────────────────────
test('monto del original distinto al que Kary vio → bloqueado', () => {
    const v = validarAprobacionCorreccion(solCorreccion(), originalVigente({ monto: 999000 }));
    assert.equal(v.ok, false);
});

// ─── (d) delta incoherente → bloqueado (recomputado, no confiado) ─────────────
test('delta solicitado que no cuadra con el recompute → bloqueado', () => {
    const v = validarAprobacionCorreccion(solCorreccion({ monto: -1 }), originalVigente());
    assert.equal(v.ok, false);
});
test('delta de un ABONO usa el signo correcto (abono resta del saldo)', () => {
    // Abono $100k → $150k: el saldo BAJA 50k más ⇒ delta = −50.000.
    const sol = solCorreccion(
        { monto: -50000 },
        {
            reemplazo: { tipo: 'abono', monto: 150000 },
            snapshotOriginal: { tipo: 'abono', monto: 100000, anulado: false },
        },
    );
    const v = validarAprobacionCorreccion(sol, originalVigente({ tipo: 'abono', monto: 100000 }));
    assert.equal(v.ok, true);
    // Y con el delta al revés (como si fuera factura) → bloqueado.
    const mal = validarAprobacionCorreccion(solCorreccion(
        { monto: 50000 },
        {
            reemplazo: { tipo: 'abono', monto: 150000 },
            snapshotOriginal: { tipo: 'abono', monto: 100000, anulado: false },
        },
    ), originalVigente({ tipo: 'abono', monto: 100000 }));
    assert.equal(mal.ok, false);
});

// ─── (e) reemplazo válido ─────────────────────────────────────────────────────
test('monto nuevo no entero / factura-abono en 0 / fecha basura → bloqueado', () => {
    const noEntero = validarAprobacionCorreccion(
        solCorreccion({}, { reemplazo: { tipo: 'factura', monto: 80000.5 } }), originalVigente());
    assert.equal(noEntero.ok, false);
    const cero = validarAprobacionCorreccion(
        solCorreccion({ monto: -500000 }, { reemplazo: { tipo: 'factura', monto: 0 } }), originalVigente());
    assert.equal(cero.ok, false);
    const fechaMala = validarAprobacionCorreccion(
        solCorreccion({}, { reemplazo: { tipo: 'factura', monto: 80000, fecha: '01/06/2026' } }), originalVigente());
    assert.equal(fechaMala.ok, false);
});

// ─── (g) drift no monetario → ADVIERTE sin bloquear ───────────────────────────
test('fecha/descripción del original distinta a la del snapshot → advertencia, ok', () => {
    const v = validarAprobacionCorreccion(solCorreccion(), originalVigente({ fecha: '2026-05-20' }));
    assert.equal(v.ok, true);
    assert.ok(v.advertencias.length >= 1);
});

// ─── (f) drift de saldo ───────────────────────────────────────────────────────
test('hayDriftSaldo: difiere → drift true; igual → false; sin referencia → false', () => {
    assert.deepEqual(hayDriftSaldo({ saldoAlSolicitar: 700000 }, 650000), { drift: true, saldoAlSolicitar: 700000 });
    assert.deepEqual(hayDriftSaldo({ saldoAlSolicitar: 700000 }, 700000), { drift: false, saldoAlSolicitar: 700000 });
    assert.deepEqual(hayDriftSaldo({}, 650000), { drift: false, saldoAlSolicitar: null });
});

// ─── validarAprobacionAjuste ──────────────────────────────────────────────────
test('ajuste con monto entero ≠ 0 → ok; 0 / no entero / otro tipo → bloqueado', () => {
    assert.equal(validarAprobacionAjuste({ tipo: 'ajuste', monto: -80000 }).ok, true);
    assert.equal(validarAprobacionAjuste({ tipo: 'ajuste', monto: 0 }).ok, false);
    assert.equal(validarAprobacionAjuste({ tipo: 'ajuste', monto: 100.5 }).ok, false);
    assert.equal(validarAprobacionAjuste({ tipo: 'correccion', monto: -80000 }).ok, false);
});

// ─── planAprobacionAjuste (escritura 1 de 2 del batch) ────────────────────────
test('plan de ajuste: tipo/monto/fecha/solicitudId correctos (id REAL del doc)', () => {
    const p = planAprobacionAjuste(
        { tipo: 'ajuste', monto: -80000, motivo: 'DEVOLUCION_PIEZA', nota: 'devolvió el anillo', fecha: '2026-06-10' },
        'sol-abc',
    );
    assert.equal(p.tipo, 'ajuste');
    assert.equal(p.monto, -80000);
    assert.equal(p.fecha, '2026-06-10');
    assert.equal(p.solicitudId, 'sol-abc');
    assert.match(p.descripcion, /DEVOLUCION_PIEZA/);
    assert.match(p.descripcion, /devolvió el anillo/);
    // Deferido 4 §74: motivo/nota TOP-LEVEL — el gate M3 (ajuste: motivo de lista
    // cerrada + nota) y la regla COINCIDENCIA los leen del asiento aprobado.
    assert.equal(p.motivo, 'DEVOLUCION_PIEZA');
    assert.equal(p.nota, 'devolvió el anillo');
});
test('plan de ajuste sin fecha válida: omite el campo (no manda basura a la regla)', () => {
    const p = planAprobacionAjuste({ tipo: 'ajuste', monto: 5000, motivo: 'OTRO', nota: 'n' }, 's1');
    assert.equal('fecha' in p, false);
});

// ─── planAprobacionCorreccion (escrituras 1 y 2 de 3 del batch) ───────────────
test('plan de corrección: anulación enlazable + reemplazo con correccionDe y solicitudId', () => {
    const sol = solCorreccion();
    const p = planAprobacionCorreccion(sol, 'sol-xyz', originalVigente());
    assert.equal(p.anulacion.motivoCategoria, 'CORRECCION');
    assert.ok(p.anulacion.motivoAnulacion.length > 0);
    assert.equal(p.reemplazo.tipo, 'factura');         // SIEMPRE el tipo del original re-leído
    assert.equal(p.reemplazo.monto, 80000);
    assert.equal(p.reemplazo.fecha, '2026-06-01');
    assert.equal(p.reemplazo.correccionDe, 'mov-original-1');
    assert.equal(p.reemplazo.solicitudId, 'sol-xyz');  // id REAL del doc (deferido 2 §74)
});
test('plan de corrección: sin fecha nueva usa la del ORIGINAL re-leído (no la del snapshot)', () => {
    const sol = solCorreccion({}, {
        reemplazo: { tipo: 'factura', monto: 80000 },
        snapshotOriginal: { tipo: 'factura', monto: 500000, fecha: '1999-01-01', anulado: false },
    });
    const p = planAprobacionCorreccion(sol, 's', originalVigente({ fecha: '2026-06-01' }));
    assert.equal(p.reemplazo.fecha, '2026-06-01');
});
test('plan de corrección: motivoCategoria vacío cae a CORRECCION y nota vacía no viola la regla', () => {
    const sol = solCorreccion({ nota: '', motivo: '' }, { motivoCategoria: '' });
    const p = planAprobacionCorreccion(sol, 's', originalVigente());
    assert.equal(p.anulacion.motivoCategoria, 'CORRECCION');
    assert.ok(p.anulacion.motivoAnulacion.length > 0);   // nonEmptyStr en la regla
});

// ─── Constantes de rechazo automático (las consume la UI y las audita M4) ─────
test('motivos automáticos estables (los lee la alerta de M4 y la ficha de Kary)', () => {
    assert.equal(MOTIVO_OBSOLETA, 'ASIENTO_YA_NO_VIGENTE');
    assert.equal(MOTIVO_INCOHERENTE, 'DATOS_NO_COINCIDEN');
});
