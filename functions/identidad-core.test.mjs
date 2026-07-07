/**
 * Tests del núcleo de identidad (función PURA, sin emulador).
 *   node --test functions/identidad-core.test.mjs   (o: npm run test:identidad)
 *
 * Fijan el CONTRATO CONGELADO de identidad (F2.1, comité 2026-07-07, normVersion:1):
 * la clave canónica del documento y su hash. Un cambio aquí = cambio de contrato →
 * exige versionar la normalización y migrar el índice (spec §1.2). Blindaje anti-divergencia:
 * la normalización vive SOLO en el servidor; estos tests son su única fuente de verdad.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import ident from './identidad-core.js';

const { normalizeLegalId, docHash, docKeyAndHash, normalizePhone, normalizeName, DOC_TYPES, NORM_VERSION } = ident;

// ─── normalizeLegalId ─────────────────────────────────────────────────────────
test('normalizeLegalId · cédula simple', () => {
    assert.equal(normalizeLegalId('CC', '1032456789'), 'CC:1032456789');
});

test('normalizeLegalId · quita puntos, espacios y guiones de una cédula', () => {
    assert.equal(normalizeLegalId('CC', '1.032.456.789'), 'CC:1032456789');
    assert.equal(normalizeLegalId('CC', ' 1 032 456 789 '), 'CC:1032456789');
    assert.equal(normalizeLegalId('CC', '1-032-456-789'), 'CC:1032456789');
});

test('normalizeLegalId · conserva ceros a la izquierda (string)', () => {
    assert.equal(normalizeLegalId('CC', '0012345'), 'CC:0012345');
});

test('normalizeLegalId · acepta número entero (defensivo)', () => {
    assert.equal(normalizeLegalId('CC', 1032456789), 'CC:1032456789');
});

test('normalizeLegalId · NIT descarta el dígito de verificación (guion)', () => {
    assert.equal(normalizeLegalId('NIT', '900.123.456-7'), 'NIT:900123456');
    assert.equal(normalizeLegalId('NIT', '900123456-7'), 'NIT:900123456');
    assert.equal(normalizeLegalId('NIT', '830.045.198 - 9'), 'NIT:830045198');
});

test('normalizeLegalId · NIT sin DV explícito queda tal cual (no inventa recorte)', () => {
    assert.equal(normalizeLegalId('NIT', '900123456'), 'NIT:900123456');
});

test('normalizeLegalId · pasaporte conserva letras', () => {
    assert.equal(normalizeLegalId('PA', 'ab12345cd'), 'PA:AB12345CD');
});

test('normalizeLegalId · cédula de extranjería y PPT y TI', () => {
    assert.equal(normalizeLegalId('CE', '123-456'), 'CE:123456');
    assert.equal(normalizeLegalId('PPT', '7.654.321'), 'PPT:7654321');
    assert.equal(normalizeLegalId('TI', '1005432198'), 'TI:1005432198');
});

test('normalizeLegalId · tipo desconocido → null (no adivinar)', () => {
    assert.equal(normalizeLegalId('XX', '123'), null);
    assert.equal(normalizeLegalId('', '123'), null);
    assert.equal(normalizeLegalId(undefined, '123'), null);
});

test('normalizeLegalId · documento vacío/inválido → null', () => {
    assert.equal(normalizeLegalId('CC', ''), null);
    assert.equal(normalizeLegalId('CC', '   '), null);
    assert.equal(normalizeLegalId('CC', null), null);
    assert.equal(normalizeLegalId('CC', '...---'), null);
});

test('normalizeLegalId · tipo en minúscula se normaliza', () => {
    assert.equal(normalizeLegalId('cc', '123'), 'CC:123');
});

// ─── docHash (HMAC-SHA256 con pepper) ──────────────────────────────────────────
test('docHash · determinista con el mismo pepper', () => {
    const a = docHash('CC:1032456789', 'pepper-secreto');
    const b = docHash('CC:1032456789', 'pepper-secreto');
    assert.equal(a, b);
    assert.match(a, /^[0-9a-f]{64}$/);   // hex SHA-256
});

test('docHash · pepper distinto → hash distinto (índice inútil sin pepper)', () => {
    assert.notEqual(docHash('CC:123', 'pepper-A'), docHash('CC:123', 'pepper-B'));
});

test('docHash · claves distintas → hashes distintos', () => {
    assert.notEqual(docHash('CC:123', 'p'), docHash('NIT:123', 'p'));
});

test('docHash · sin pepper o sin clave → lanza (nunca hashea a ciegas)', () => {
    assert.throws(() => docHash('CC:123', ''));
    assert.throws(() => docHash('', 'p'));
});

test('docKeyAndHash · compone clave + hash desde documento crudo', () => {
    const out = docKeyAndHash('CC', '1.032.456.789', 'pepper');
    assert.equal(out.legalIdKey, 'CC:1032456789');
    assert.equal(out.docHash, docHash('CC:1032456789', 'pepper'));
    assert.equal(out.normVersion, NORM_VERSION);
});

test('docKeyAndHash · documento inválido → null', () => {
    assert.equal(docKeyAndHash('CC', '', 'pepper'), null);
    assert.equal(docKeyAndHash('XX', '123', 'pepper'), null);
});

// ─── dedup blando (teléfono / nombre) ──────────────────────────────────────────
test('normalizePhone · deja solo dígitos', () => {
    assert.equal(normalizePhone('300 123 4567'), '3001234567');
    assert.equal(normalizePhone('(300) 123-4567'), '3001234567');
});

test('normalizePhone · quita prefijo país 57 de un celular de 10 dígitos', () => {
    assert.equal(normalizePhone('+57 300 123 4567'), '3001234567');
    assert.equal(normalizePhone('573001234567'), '3001234567');
});

test('normalizePhone · no toca un fijo/otro largo que no sea 57+10', () => {
    assert.equal(normalizePhone('6012345678'), '6012345678');
});

test('normalizeName · minúsculas, sin tildes, espacios colapsados', () => {
    assert.equal(normalizeName('  Ana   María  Gómez '), 'ana maria gomez');
    // Plegado agresivo para dedup blando: ñ→n captura "Muñoz"/"Munoz" (falso positivo = solo un aviso).
    assert.equal(normalizeName('JOSÉ Ñungo'), 'jose nungo');
    assert.equal(normalizeName('Muñoz'), normalizeName('Munoz'));
});

test('DOC_TYPES · whitelist congelada', () => {
    assert.deepEqual([...DOC_TYPES].sort(), ['CC', 'CE', 'NIT', 'PA', 'PPT', 'TI']);
    assert.equal(NORM_VERSION, 1);
});
