/**
 * Bersaglio CRM — Estado de cuenta / mora (aging de cartera). Función PURA.
 *
 * Espejo de `functions/saldo.js`: deriva la "antigüedad de la deuda" (mora) de
 * los movimientos —usando su `fecha` real— SIN tocar el `saldoActual` (que es la
 * fuente de verdad, escrita solo por la Cloud Function). Sin Firestore → se testea
 * la aritmética exacta sin emulador (decisión del norte §10.2-F2: aging EN VIVO,
 * sin materializar `diasVencido` todavía).
 *
 * Modelo (FIFO): se reparten los créditos (abonos, y aperturas/ajustes negativos)
 * contra los cargos (factura/apertura/ajuste positivos) del MÁS VIEJO al más nuevo;
 * lo que queda pendiente de cada cargo envejece desde su vencimiento EFECTIVO
 *   vencimiento = mov.vencimiento (acuerdo de pago POR DEUDA, M6 §69)
 *                 ?? fecha del cargo + díasPlazo (default del negocio)
 *   mora        = hoy − vencimiento   (días pasados del vencimiento; ≤0 = al día)
 *
 * El ORDEN FIFO sigue siendo por `fecha` del cargo (semántica fijada en M6 para la
 * convivencia mixta: el crédito paga la deuda MÁS VIEJA, no la que vence primero).
 * Un `vencimiento` inválido (regex pasa pero la fecha es imposible: la regla M3 no
 * hace round-trip) cae al fallback fecha+plazo.
 *
 * `fecha` de un cargo = `mov.fecha` ('YYYY-MM-DD') ?? `fechaCorte` (fallback de
 * migración). Sin ninguna de las dos → cuenta en el saldo pero NO en vencido
 * (se reporta en `sinFecha` para que Kary defina la fecha de corte) — un
 * `vencimiento` sin `fecha` NO envejece (caso imposible bajo el candado M3).
 */

// Signo que cada tipo aporta al saldo (idéntico a functions/saldo.js).
export const SIGNO_POR_TIPO = Object.freeze({ factura: 1, apertura: 1, ajuste: 1, abono: -1 });

const DAY_MS = 86400000;
const ISO_RE = /^\d{4}-\d{2}-\d{2}$/;

function round2(n) { return Math.round((n + Number.EPSILON) * 100) / 100; }

/** 'YYYY-MM-DD' o Date → número de día UTC entero (día calendario). null si no parseable. */
function toDayNum(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return Math.floor(Date.UTC(value.getFullYear(), value.getMonth(), value.getDate()) / DAY_MS);
  }
  if (typeof value === 'string' && ISO_RE.test(value)) {
    const [y, m, d] = value.split('-').map(Number);
    const ms = Date.UTC(y, m - 1, d);
    // Round-trip: rechaza fechas IMPOSIBLES que Date.UTC "envuelve" en silencio
    // (2026-13-45 → 2027-02-14; 2026-02-30 → 2026-03-02). Inválida → null → sinFecha.
    const dt = new Date(ms);
    if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) return null;
    return Math.floor(ms / DAY_MS);
  }
  return null;
}

/** Hoy local en ISO 'YYYY-MM-DD' (default para la mora; se mide en días calendario locales). */
export function hoyISO(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Vencimiento por DEFECTO de un cargo: fecha + díasPlazo, en ISO (M6). Es LA MISMA
 * suma que usa el fallback del aging (una fórmula, L-03): el acuerdo prellenado que
 * ve Kary y lo que el sistema asumiría sin acuerdo explícito son idénticos.
 * '' si la fecha no es válida.
 */
export function vencimientoDefaultISO(fechaISO, diasPlazo = 30) {
  const num = toDayNum(fechaISO);
  if (num == null) return '';
  const plazo = (typeof diasPlazo === 'number' && isFinite(diasPlazo) && diasPlazo >= 0) ? Math.trunc(diasPlazo) : 30;
  return new Date((num + plazo) * DAY_MS).toISOString().slice(0, 10);
}

// Aporte con signo de un movimiento (defensivo: anulado/tipo desconocido/monto no num → 0).
function aporte(mov) {
  if (!mov || mov.anulado === true) return 0;
  const signo = SIGNO_POR_TIPO[mov.tipo];
  if (signo === undefined) return 0;
  const monto = typeof mov.monto === 'number' && isFinite(mov.monto) ? mov.monto : 0;
  return signo * monto;
}

/**
 * Estado de mora de una cuenta a partir de sus movimientos.
 * @param {Array<object>} movimientos - data plana de cada doc ({ tipo, monto, fecha, anulado }).
 * @param {object} [opts]
 * @param {string|Date} [opts.hoy] - referencia "hoy" (default: hoy local).
 * @param {number} [opts.diasPlazo=30] - días de plazo del negocio (config/negocio.diasPlazo).
 * @param {string} [opts.fechaCorte] - 'YYYY-MM-DD' fallback para movimientos sin `fecha`.
 * @returns {{saldo:number, vencido:number, alDia:number, sinFecha:number,
 *   buckets:{d1_30:number,d31_60:number,d60plus:number}, diasMora:number,
 *   fechaVencidoMasAntigua:(string|null), estado:('sin-deuda'|'al-dia'|'vencido'|'a-favor')}}
 */
export function estadoCuenta(movimientos, opts = {}) {
  const { hoy, fechaCorte } = opts;
  // MISMO saneo que vencimientoDefaultISO (isFinite + trunc): si divergen, el
  // sugerido que ve Kary y el fallback del aging dejan de ser "la misma suma" (L-03).
  const diasPlazo = (typeof opts.diasPlazo === 'number' && isFinite(opts.diasPlazo) && opts.diasPlazo >= 0)
    ? Math.trunc(opts.diasPlazo) : 30;
  const hoyNum = toDayNum(hoy ?? hoyISO());
  const corteValido = (typeof fechaCorte === 'string' && ISO_RE.test(fechaCorte)) ? fechaCorte : null;

  const result = {
    saldo: 0, vencido: 0, alDia: 0, sinFecha: 0,
    buckets: { d1_30: 0, d31_60: 0, d60plus: 0 },
    diasMora: 0, fechaVencidoMasAntigua: null, estado: 'sin-deuda',
  };
  if (!Array.isArray(movimientos)) return result;

  const cargos = [];   // { dayNum:(number|null), fechaISO:(string|null), pendiente:number }
  let creditos = 0;
  let saldo = 0;
  for (const mov of movimientos) {
    const a = aporte(mov);
    saldo += a;
    if (a > 0) {
      const fechaISO = (mov && typeof mov.fecha === 'string' && ISO_RE.test(mov.fecha)) ? mov.fecha : corteValido;
      // M6: acuerdo de pago POR DEUDA. toDayNum hace el round-trip → un vencimiento
      // imposible (2026-02-30 pasa la regex de la regla) devuelve null = fallback.
      const vencNum = (mov && typeof mov.vencimiento === 'string') ? toDayNum(mov.vencimiento) : null;
      cargos.push({ dayNum: fechaISO ? toDayNum(fechaISO) : null, fechaISO, pendiente: a, vencNum });
    } else if (a < 0) {
      creditos += -a;
    }
  }
  result.saldo = round2(saldo);

  // FIFO: cargos con fecha del más viejo al más nuevo; los sin fecha, al final.
  cargos.sort((x, y) => {
    if (x.dayNum == null && y.dayNum == null) return 0;
    if (x.dayNum == null) return 1;
    if (y.dayNum == null) return -1;
    return x.dayNum - y.dayNum;
  });
  let credRestante = creditos;
  for (const c of cargos) {
    if (credRestante <= 0) break;
    const aplica = Math.min(credRestante, c.pendiente);
    c.pendiente = round2(c.pendiente - aplica);
    credRestante = round2(credRestante - aplica);
  }

  let maxMora = 0;
  for (const c of cargos) {
    if (c.pendiente <= 0) continue;
    if (c.dayNum == null) { result.sinFecha = round2(result.sinFecha + c.pendiente); continue; }
    // Vencimiento EFECTIVO (M6): el acuerdo explícito manda; sin él, fecha + plazo.
    const mora = hoyNum - (c.vencNum != null ? c.vencNum : c.dayNum + diasPlazo);
    if (mora <= 0) {
      result.alDia = round2(result.alDia + c.pendiente);
    } else {
      // Rangos por días ENTEROS de mora pasados del vencimiento: [1,30] · [31,60] · [61,∞).
      result.vencido = round2(result.vencido + c.pendiente);
      if (mora <= 30) result.buckets.d1_30 = round2(result.buckets.d1_30 + c.pendiente);
      else if (mora <= 60) result.buckets.d31_60 = round2(result.buckets.d31_60 + c.pendiente);
      else result.buckets.d60plus = round2(result.buckets.d60plus + c.pendiente);
      // fechaVencidoMasAntigua = fecha del HECHO del cargo con PEOR mora — el MISMO
      // cargo que define diasMora (coherentes post-M6: el acuerdo puede invertir el
      // orden fecha↔mora; pre-M6 la mora era monótona con la fecha y esto es idéntico).
      if (mora > maxMora) { maxMora = mora; result.fechaVencidoMasAntigua = c.fechaISO; }
    }
  }
  result.diasMora = maxMora;

  if (result.saldo < 0) result.estado = 'a-favor';
  else if (result.saldo === 0) result.estado = 'sin-deuda';
  else result.estado = result.vencido > 0 ? 'vencido' : 'al-dia';

  return result;
}
