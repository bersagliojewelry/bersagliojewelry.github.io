#!/usr/bin/env node
// ============================================
// VERIFICADOR DE SIMULADOR DE CRÉDITO
// ALTORRA CARS - Versión 2.0
// Ejecutar: node scripts/verify-simulador.js
// ============================================

const path = require('path');

// Cargar módulos
const Data = require(path.join(__dirname, '../js/simulador/data.js'));
const Finance = require(path.join(__dirname, '../js/simulador/finance.js'));

// Inyectar dependencias globales para simulator.js
global.SimuladorData = Data;
global.SimuladorFinance = Finance;

const Simulator = require(path.join(__dirname, '../js/simulador/simulator.js'));
const fixtures = require(path.join(__dirname, './fixtures-simulador.json'));

// Colores para consola
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    bold: '\x1b[1m'
};

function log(color, ...args) {
    console.log(color, ...args, colors.reset);
}

// Tolerancia para comparación numérica (±1 peso por redondeo)
const TOLERANCE = 1;

function compareValue(actual, expected, tolerance = TOLERANCE) {
    // Si ambos son strings, comparar exactamente
    if (typeof actual === 'string' && typeof expected === 'string') {
        return actual === expected;
    }

    // Si el esperado es un número
    if (typeof expected === 'number') {
        // Si actual es un objeto con .cuota, extraer cuota
        if (typeof actual === 'object' && actual !== null && 'cuota' in actual) {
            return Math.abs(actual.cuota - expected) <= tolerance;
        }
        // Si actual es número directo
        if (typeof actual === 'number') {
            return Math.abs(actual - expected) <= tolerance;
        }
        return false;
    }

    // Si el esperado es string pero actual es objeto
    if (typeof expected === 'string') {
        return actual === expected;
    }

    return false;
}

function runTests() {
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = [];

    log(colors.cyan, '\n========================================');
    log(colors.cyan, ' VERIFICADOR DE SIMULADOR DE CRÉDITO');
    log(colors.cyan, ' ALTORRA CARS v2.0');
    log(colors.cyan, '========================================\n');

    for (const [caseName, testCase] of Object.entries(fixtures)) {
        log(colors.bold, `\n📋 Caso: ${caseName}`);
        log(colors.cyan, `   Inputs: Precio=${testCase.input.precioVenta.toLocaleString()}, ` +
            `Inicial=${testCase.input.cuotaInicial.toLocaleString()}, ` +
            `Plazo=${testCase.input.plazoMeses}m, ` +
            `Riesgo=${testCase.input.riesgo}`);

        // Ejecutar simulación
        const result = Simulator.simularFinanciacion(testCase.input);

        // Verificar Plan Tradicional
        log(colors.yellow, '\n   🔹 Plan Tradicional:');
        for (const entity of ['SUFI', 'OCCIDENTE', 'FINANDINA', 'FINANZAUTO', 'MOBILIZE']) {
            totalTests++;
            const actual = result.tradicional[entity];
            const expected = testCase.expected.trad[entity];

            const pass = compareValue(actual, expected);

            if (pass) {
                passedTests++;
                const displayValue = typeof actual === 'object' ? actual.cuota.toLocaleString() : actual;
                log(colors.green, `      ✓ ${entity}: ${displayValue}`);
            } else {
                const actualDisplay = typeof actual === 'object' ? actual.cuota : actual;
                failedTests.push({
                    case: caseName,
                    plan: 'Tradicional',
                    entity,
                    expected,
                    actual: actualDisplay
                });
                log(colors.red, `      ✗ ${entity}: esperado=${expected}, actual=${actualDisplay}`);
            }
        }

        // Verificar Plan Cuotas Extra
        log(colors.yellow, '\n   🔹 Plan Cuotas Extra:');
        for (const entity of ['SUFI', 'OCCIDENTE', 'FINANDINA', 'FINANZAUTO', 'MOBILIZE']) {
            totalTests++;
            const actual = result.cuotasExtra[entity];
            const expected = testCase.expected.extras[entity];

            const pass = compareValue(actual, expected);

            if (pass) {
                passedTests++;
                const displayValue = typeof actual === 'object' ? actual.cuota.toLocaleString() : actual;
                log(colors.green, `      ✓ ${entity}: ${displayValue}`);
            } else {
                const actualDisplay = typeof actual === 'object' ? actual.cuota : actual;
                failedTests.push({
                    case: caseName,
                    plan: 'Cuotas Extra',
                    entity,
                    expected,
                    actual: actualDisplay
                });
                log(colors.red, `      ✗ ${entity}: esperado=${expected}, actual=${actualDisplay}`);
            }
        }

        // Verificar Plan Leasing
        log(colors.yellow, '\n   🔹 Plan Leasing:');
        for (const entity of ['SUFI', 'OCCIDENTE', 'FINANDINA', 'FINANZAUTO', 'MOBILIZE']) {
            totalTests++;
            const actual = result.leasing[entity];
            const expected = testCase.expected.leasing[entity];

            const pass = compareValue(actual, expected);

            if (pass) {
                passedTests++;
                const displayValue = typeof actual === 'object' ? actual.cuota.toLocaleString() : actual;
                log(colors.green, `      ✓ ${entity}: ${displayValue}`);
            } else {
                const actualDisplay = typeof actual === 'object' ? actual.cuota : actual;
                failedTests.push({
                    case: caseName,
                    plan: 'Leasing',
                    entity,
                    expected,
                    actual: actualDisplay
                });
                log(colors.red, `      ✗ ${entity}: esperado=${expected}, actual=${actualDisplay}`);
            }
        }

        // Verificar Topes
        log(colors.yellow, '\n   🔹 Topes Cuota Extra:');
        for (const entity of ['SUFI', 'OCCIDENTE', 'FINANDINA', 'FINANZAUTO']) {
            if (testCase.expected.topes[entity]) {
                totalTests++;
                const actual = result.topes[entity];
                const expected = testCase.expected.topes[entity];

                const pass = Math.abs(actual - expected) <= TOLERANCE;

                if (pass) {
                    passedTests++;
                    log(colors.green, `      ✓ ${entity}: ${actual.toLocaleString()}`);
                } else {
                    failedTests.push({
                        case: caseName,
                        plan: 'Topes',
                        entity,
                        expected,
                        actual
                    });
                    log(colors.red, `      ✗ ${entity}: esperado=${expected.toLocaleString()}, actual=${actual.toLocaleString()}`);
                }
            }
        }
    }

    // Resumen final
    log(colors.cyan, '\n========================================');
    log(colors.cyan, ' RESUMEN DE RESULTADOS');
    log(colors.cyan, '========================================\n');

    const passRate = ((passedTests / totalTests) * 100).toFixed(1);

    if (failedTests.length === 0) {
        log(colors.green, `✅ TODOS LOS TESTS PASARON: ${passedTests}/${totalTests} (${passRate}%)`);
    } else {
        log(colors.red, `❌ TESTS FALLIDOS: ${failedTests.length}/${totalTests}`);
        log(colors.green, `✅ TESTS EXITOSOS: ${passedTests}/${totalTests} (${passRate}%)`);

        log(colors.yellow, '\n📋 Detalle de fallos:');
        for (const fail of failedTests) {
            log(colors.red, `   - ${fail.case} | ${fail.plan} | ${fail.entity}: esperado=${fail.expected}, actual=${fail.actual}`);
        }
    }

    console.log('');

    // Exit code
    process.exit(failedTests.length > 0 ? 1 : 0);
}

// Ejecutar tests
runTests();
