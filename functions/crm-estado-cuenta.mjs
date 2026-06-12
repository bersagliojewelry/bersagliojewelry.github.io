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
 *
 * ACUERDOS DE PAGO (spec 2026-06-12, `opts.acuerdos`): un acuerdo vigente y
 * VÁLIDO (acuerdoEsValido — la validación vive AQUÍ, en el archivo de paridad)
 * re-programa la exigibilidad del pendiente que cubre en TRAMOS por cuota.
 * Precedencia por cargo: acuerdo > mov.vencimiento (M6) > fecha+plazo. Notas:
 * un acuerdo 'factura' cuyo movimiento fue corregido (id nuevo, M2b) queda
 * huérfano → no cubre nada → fallback benigno (detector M4 lo lista); el
 * `vencimiento` del movimiento queda obsoleto tras renegociar (inmutable) —
 * irrelevante por precedencia mientras el acuerdo viva.
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
 * ¿Un ACUERDO DE PAGO es estructuralmente válido para la fórmula? (spec acuerdos
 * 2026-06-12 §1.4). Vive AQUÍ —el archivo de PARIDAD— y no en el módulo de UI:
 * las reglas de Firestore no pueden iterar `cuotas[]`, así que esta validación es
 * el freno real y debe correr IDÉNTICA en el panel y en el corte mensual.
 * Un acuerdo inválido se IGNORA (cae al fallback M6/plazo = MÁS vencido = falla
 * conservadora). La reusa el detector `acuerdosAnomalos` (M4).
 * @param {object} a  doc de clientes/{id}/acuerdos/{id}
 * @param {object} [opts] { horizonteDias = 730 } — tope de la última cuota desde
 *   el pacto (decisión Daniel P3: 24 meses; config owner-only).
 */
export function acuerdoEsValido(a, opts = {}) {
  if (!a || a.estado !== 'vigente') return false;
  if (a.alcance === 'factura') {
    if (typeof a.movimientoId !== 'string' || !a.movimientoId) return false;
  } else if (a.alcance === 'saldo') {
    if (a.movimientoId !== undefined) return false;
  } else return false;
  if (!Array.isArray(a.cuotas) || a.cuotas.length < 1 || a.cuotas.length > 36) return false;
  let prevDia = -Infinity;
  for (const q of a.cuotas) {
    if (!q || !Number.isInteger(q.monto) || q.monto <= 0) return false;
    const d = toDayNum(q.fecha);
    if (d == null || d <= prevDia) return false;   // ISO real, estrictamente creciente
    prevDia = d;
  }
  if (a.primeraCuotaFecha !== a.cuotas[0].fecha) return false;
  if (a.ultimaCuotaFecha !== a.cuotas[a.cuotas.length - 1].fecha) return false;
  // Horizonte anti-parqueo: última cuota ≤ ancla + horizonte. Ancla = creadoEn del
  // SERVIDOR; recién pactado (serverTimestamp pendiente) → fechaPacto (la regla la
  // fuerza no-futura, así que el ancla jamás se infla).
  const anclaNum = (a.creadoEn && typeof a.creadoEn.toMillis === 'function')
    ? Math.floor(a.creadoEn.toMillis() / DAY_MS)
    : toDayNum(a.fechaPacto);
  if (anclaNum == null) return false;
  const h = (typeof opts.horizonteDias === 'number' && isFinite(opts.horizonteDias) && opts.horizonteDias > 0)
    ? Math.trunc(opts.horizonteDias) : 730;
  return prevDia <= anclaNum + h;
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
 * @param {Array<object>} [opts.acuerdos] - acuerdos de pago del cliente (spec 2026-06-12):
 *   re-programan la EXIGIBILIDAD del pendiente que cubren (jamás el saldo). Sin
 *   acuerdos, la salida es IDÉNTICA a la fórmula previa (test que lo fija).
 * @param {number} [opts.horizonteDias=730] - tope de la última cuota (P3: 24 meses).
 * @returns {{saldo:number, vencido:number, alDia:number, sinFecha:number,
 *   buckets:{d1_30:number,d31_60:number,d60plus:number}, diasMora:number,
 *   fechaVencidoMasAntigua:(string|null), estado:('sin-deuda'|'al-dia'|'vencido'|'a-favor'),
 *   bajoAcuerdo:number, plan:(null|{acuerdoId:(string|null), exigible:number, cubierto:number,
 *   vencidoPlan:number, cuotasVencidas:number, proximaCuota:(null|{fecha:string,monto:number})})}}
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
    bajoAcuerdo: 0, plan: null,
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
      cargos.push({
        dayNum: fechaISO ? toDayNum(fechaISO) : null, fechaISO, pendiente: a, vencNum,
        // Insumos de los ACUERDOS (spec §1.4): id ancla los de alcance 'factura';
        // registradoEn (reloj de SERVIDOR) ancla la cobertura de 'saldo' — una
        // factura retrofechada DESPUÉS del pacto no se desliza bajo el acuerdo.
        id: (mov && mov.id != null) ? mov.id : null,
        regMs: (mov && mov.registradoEn && typeof mov.registradoEn.toMillis === 'function')
          ? mov.registradoEn.toMillis() : null,
      });
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

  // ─── Acuerdos de pago (spec 2026-06-12 §1.4): re-programan la EXIGIBILIDAD ────
  // El acuerdo NO mueve dinero: el FIFO de arriba corrió INTACTO (el abono paga la
  // deuda más vieja → por construcción, la cuota más vieja). Aquí el pendiente
  // CUBIERTO por un acuerdo válido se parte en TRAMOS que vencen en las fechas de
  // sus cuotas; el resto envejece igual que siempre. Sin acuerdos → salida idéntica.
  const acuerdosValidos = Array.isArray(opts.acuerdos)
    ? opts.acuerdos.filter((a) => acuerdoEsValido(a, opts)) : [];
  const tramos = [];
  if (acuerdosValidos.length) {
    const ms = (t) => (t && typeof t.toMillis === 'function' ? t.toMillis() : null);
    // 'factura' cubre SU movimiento; 'saldo' cubre lo REGISTRADO (reloj de servidor)
    // hasta el pacto. Pacto con creadoEn aún pendiente → 'saldo' no cubre nada por
    // un instante (conservador, transitorio); 'factura' sí (ancla por id).
    const cubre = (a, c) => (a.alcance === 'factura'
      ? (c.id != null && a.movimientoId === c.id)
      : (c.regMs != null && ms(a.creadoEn) != null && c.regMs <= ms(a.creadoEn)));
    // Selección DETERMINISTA si >1 vigente cubre el mismo cargo: mayor creadoEn
    // (pendiente del servidor = el más nuevo); desempate por id lexicográfico —
    // panel y corte eligen SIEMPRE igual. El solape además lo lista un detector.
    const masNuevo = (a, b) => {
      const ma = ms(a.creadoEn) ?? Infinity, mb = ms(b.creadoEn) ?? Infinity;
      if (ma !== mb) return ma > mb ? a : b;
      return String(a.id || '') > String(b.id || '') ? a : b;
    };
    const grupos = new Map();   // acuerdo elegido → sus cargos cubiertos (orden FIFO)
    for (const c of cargos) {
      if (c.pendiente <= 0 || c.dayNum == null) continue;   // sinFecha: fuera del plan (conservador)
      let elegido = null;
      for (const a of acuerdosValidos) {
        if (cubre(a, c)) elegido = elegido ? masNuevo(a, elegido) : a;
      }
      if (!elegido) continue;
      if (!grupos.has(elegido)) grupos.set(elegido, []);
      grupos.get(elegido).push(c);
      c.enAcuerdo = true;
    }
    let plan = null;   // el plan visible de la ficha = el acuerdo aplicado más nuevo
    for (const [a, cs] of grupos) {
      const sumaCuotas = a.cuotas.reduce((s, q) => s + q.monto, 0);
      const cubierto = cs.reduce((s, c) => s + c.pendiente, 0);
      // Las cuotas se pagan DESDE EL FRENTE: lo ya pagado del plan = Σcuotas − lo
      // que sigue pendiente (la cuota de enero no figura impaga si la plata entró).
      let porSaltar = round2(sumaCuotas - Math.min(cubierto, sumaCuotas));
      const slices = [];   // resto IMPAGO de cada cuota, en orden
      for (const q of a.cuotas) {
        const resto = round2(Math.max(0, q.monto - Math.min(porSaltar, q.monto)));
        porSaltar = round2(Math.max(0, porSaltar - q.monto));
        slices.push({ vencNum: toDayNum(q.fecha), fecha: q.fecha, montoCuota: q.monto, resto });
      }
      // Figuras del plan ANTES de consumir los slices (el reparto los muta).
      const exigible = slices.reduce((s, q) => s + (hoyNum > q.vencNum ? q.montoCuota : 0), 0);
      const vencidoPlan = slices.reduce((s, q) => s + (hoyNum > q.vencNum ? q.resto : 0), 0);
      const cuotasVencidas = slices.filter((q) => hoyNum > q.vencNum && q.resto > 0).length;
      const prox = slices.find((q) => q.resto > 0) || null;
      const datos = {
        acuerdoId: a.id || null,
        exigible: round2(exigible),
        cubierto: round2(Math.max(0, exigible - vencidoPlan)),
        vencidoPlan: round2(vencidoPlan),
        cuotasVencidas,
        proximaCuota: prox ? { fecha: prox.fecha, monto: prox.resto } : null,
      };
      if (!plan || masNuevo(a, plan.acuerdo) === a) plan = { acuerdo: a, datos };
      result.bajoAcuerdo = round2(result.bajoAcuerdo + Math.min(cubierto, sumaCuotas));
      // Reparto: pendiente de cada cargo (FIFO) sobre los restos de cuota; el
      // EXCEDENTE sobre Σcuotas conserva su vencimiento original M6/plazo (§1.2:
      // inflar el cronograma no parquea nada — el sobrante envejece como siempre).
      let si = 0;
      while (si < slices.length && slices[si].resto <= 0) si++;
      for (const c of cs) {
        let restante = c.pendiente;
        while (restante > 0 && si < slices.length) {
          const s = slices[si];
          const tramo = Math.min(s.resto, restante);
          tramos.push({ dayNum: c.dayNum, fechaISO: c.fechaISO, pendiente: tramo, vencNum: s.vencNum });
          s.resto = round2(s.resto - tramo);
          restante = round2(restante - tramo);
          if (s.resto <= 0) si++;
        }
        if (restante > 0) {
          tramos.push({ dayNum: c.dayNum, fechaISO: c.fechaISO, pendiente: restante, vencNum: c.vencNum });
        }
      }
    }
    result.plan = plan ? plan.datos : null;
  }
  const items = tramos.length ? [...cargos.filter((c) => !c.enAcuerdo), ...tramos] : cargos;

  let maxMora = 0;
  for (const c of items) {
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
