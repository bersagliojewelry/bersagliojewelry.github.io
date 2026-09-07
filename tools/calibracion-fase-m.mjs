/**
 * Bersaglio — Calibración Fase M (M0, plan §69): dry-run READ-ONLY sobre el backup local.
 *
 * Produce los estadísticos que alimentan las preguntas 2/3/5 a Daniel:
 *   - distribución de AJUSTES históricos (el carril auto-aprobable: ¿$50.000 vive o muere?)
 *   - anulaciones por tipo (el otro reductor gateado en M3)
 *   - clientas con ≥2 cargos vigentes ≤ tope (acota empíricamente el "salami")
 *   - abonos chicos (contexto de materialidad anti abono-token, M7)
 *
 * USO: node tools/calibracion-fase-m.mjs [ruta-al-backup.json.gz]
 * No toca Firestore ni la red. Default: el backup local más reciente.
 */
import { gunzipSync } from 'zlib';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const DIR = 'C:/Users/romad/Documents/BersaglioBackups';
const TOPE = 50000;

const ruta = process.argv[2] || join(DIR, readdirSync(DIR).filter((f) => f.endsWith('.json.gz')).sort().at(-1));
const { exportedAt, totalDocs, docs } = JSON.parse(gunzipSync(readFileSync(ruta)).toString());
console.log(`\n— Calibración Fase M (read-only) — backup: ${ruta}\n  exportado: ${exportedAt} · ${totalDocs} docs\n`);

const movs = docs.filter((d) => /^clientes\/[^/]+\/movimientos\//.test(d.path))
    .map((d) => ({ clienteId: d.path.split('/')[1], ...d.data }));

const porTipo = {};
for (const m of movs) porTipo[m.tipo] = (porTipo[m.tipo] || 0) + 1;
console.log(`MOVIMIENTOS: ${movs.length} · por tipo: ${JSON.stringify(porTipo)}`);
console.log(`  anulados: ${movs.filter((m) => m.anulado === true).length}`);

const pct = (arr, p) => arr.length ? arr[Math.min(arr.length - 1, Math.floor((p / 100) * arr.length))] : null;

// Ajustes (el carril del gate M3)
const ajustes = movs.filter((m) => m.tipo === 'ajuste' && !m.anulado);
const ajNeg = ajustes.filter((m) => m.monto < 0).map((m) => Math.abs(m.monto)).sort((a, b) => a - b);
const ajPos = ajustes.filter((m) => m.monto >= 0).map((m) => m.monto).sort((a, b) => a - b);
console.log(`\nAJUSTES vigentes: ${ajustes.length} (negativos: ${ajNeg.length} · positivos: ${ajPos.length})`);
if (ajNeg.length) {
    console.log(`  |negativos|: min ${ajNeg[0]} · p50 ${pct(ajNeg, 50)} · p90 ${pct(ajNeg, 90)} · max ${ajNeg.at(-1)}`);
    console.log(`  negativos ≤ ${TOPE}: ${ajNeg.filter((x) => x <= TOPE).length} de ${ajNeg.length} (${Math.round(100 * ajNeg.filter((x) => x <= TOPE).length / ajNeg.length)}%)`);
} else {
    console.log('  ⚠️ CERO ajustes negativos históricos — el tope nace PROVISIONAL (recalibrar a 90 días con datos vivos).');
}

// Anulaciones por tipo (reductores vía anulación)
const anulados = movs.filter((m) => m.anulado === true);
const anulPorTipo = {};
for (const m of anulados) anulPorTipo[m.tipo] = (anulPorTipo[m.tipo] || 0) + 1;
console.log(`\nANULACIONES: ${anulados.length} · por tipo: ${JSON.stringify(anulPorTipo)}`);

// Salami: clientas con ≥2 cargos vigentes ≤ tope (anulables por admin sin owner en M3)
const cargosChicos = new Map();
for (const m of movs) {
    if (!m.anulado && ['factura', 'apertura', 'ajuste'].includes(m.tipo) && m.monto > 0 && m.monto <= TOPE) {
        cargosChicos.set(m.clienteId, (cargosChicos.get(m.clienteId) || 0) + 1);
    }
}
const salami = [...cargosChicos.values()].filter((n) => n >= 2).length;
console.log(`\nSALAMI (cargos vigentes ≤ ${TOPE}): clientas con ≥2: ${salami} de ${cargosChicos.size} con ≥1`);

// Abonos chicos (materialidad M7: pct=1%, piso=10000)
const abonos = movs.filter((m) => m.tipo === 'abono' && !m.anulado).map((m) => m.monto).sort((a, b) => a - b);
console.log(`\nABONOS vigentes: ${abonos.length}`);
if (abonos.length) {
    console.log(`  min ${abonos[0]} · p10 ${pct(abonos, 10)} · p50 ${pct(abonos, 50)} · p90 ${pct(abonos, 90)}`);
    console.log(`  abonos < 10000 (piso de materialidad M7): ${abonos.filter((x) => x < 10000).length}`);
}

console.log('\nHecho (cero escrituras).\n');
