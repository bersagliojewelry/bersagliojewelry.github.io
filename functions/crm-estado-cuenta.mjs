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
 * ACUERDOS DE PAGO (spec v2 2026-06-12 §1.4, Consejo Externo; `opts.acuerdos`): un
 * acuerdo vigente y VÁLIDO (acuerdoEsValido — la validación vive AQUÍ, el archivo de
 * paridad) NO mueve dinero: re-programa la EXIGIBILIDAD de la deuda que cubre como un
 * ESCUDO de 2 estados (sin tramos). Cobertura por reloj de SERVIDOR (registradoEn ≤
 * creadoEn). AL DÍA → la deuda cubierta se rige por el cronograma; ROTO (≥N cuotas
 * vencidas impagas) → el escudo CAE y la deuda revive su vencimiento ORIGINAL (mora
 * histórica para el castigo M7). Solo SALDO (sin `alcance`); por el mutex hay a lo
 * sumo UN vigente. Sin acuerdos → salida IDÉNTICA a la fórmula previa (test que lo fija).
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
 * **v2** 2026-06-12 §1.4 — Consejo Externo). Todo acuerdo es de SALDO (sin
 * `alcance`). Vive AQUÍ —el archivo de PARIDAD— y no en el módulo de UI: las
 * reglas de Firestore no pueden iterar `cuotas[]`, así que esta validación es el
 * freno real y corre IDÉNTICA en el panel y en el corte mensual. Un acuerdo
 * inválido se IGNORA (cae al fallback = MÁS vencido = falla conservadora).
 * @param {object} a  doc de clientes/{id}/acuerdos/{id}
 * @param {object} [opts] { horizonteDias = 730 } — tope de la última cuota desde
 *   el pacto (decisión Daniel P3: 24 meses; config owner-only).
 */
export function acuerdoEsValido(a, opts = {}) {
  if (!a || a.estado !== 'vigente') return false;
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
 * @param {Array<object>} [opts.acuerdos] - acuerdos de pago vigentes del cliente
 *   (spec v2 2026-06-12; por el mutex hay a lo sumo UNO). ESCUDO: re-programan la
 *   EXIGIBILIDAD de la deuda que cubren (jamás el saldo). Sin acuerdos, la salida
 *   es IDÉNTICA a la fórmula previa (test que lo fija).
 * @param {number} [opts.horizonteDias=730] - tope de la última cuota (P3: 24 meses).
 * @param {number} [opts.incumplidoCuotas=2] - cuotas vencidas impagas que ROMPEN el
 *   escudo (knob owner-only); roto → la deuda revive su vencimiento original.
 * @returns {{saldo:number, vencido:number, alDia:number, sinFecha:number,
 *   buckets:{d1_30:number,d31_60:number,d60plus:number}, diasMora:number,
 *   fechaVencidoMasAntigua:(string|null), estado:('sin-deuda'|'al-dia'|'vencido'|'a-favor'),
 *   bajoAcuerdo:number, plan:(null|{acuerdoId:(string|null), exigible:number,
 *   vencidoPlan:number, cuotasVencidas:number, proximaCuota:(null|{fecha:string,monto:number}),
 *   roto:boolean})}}
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

  const cargos = [];   // { dayNum:(number|null), fechaISO:(string|null), pendiente:number, orig, regMs }
  const creditList = [];   // { regMs:(number|null), monto } — para D0 (deuda al pacto), acuerdos
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
        dayNum: fechaISO ? toDayNum(fechaISO) : null, fechaISO, pendiente: a, orig: a, vencNum,
        // Insumos de los ACUERDOS (spec §1.4): id ancla los de alcance 'factura';
        // registradoEn (reloj de SERVIDOR) ancla la cobertura de 'saldo' — una
        // factura retrofechada DESPUÉS del pacto no se desliza bajo el acuerdo.
        id: (mov && mov.id != null) ? mov.id : null,
        regMs: (mov && mov.registradoEn && typeof mov.registradoEn.toMillis === 'function')
          ? mov.registradoEn.toMillis() : null,
      });
    } else if (a < 0) {
      creditos += -a;
      creditList.push({
        regMs: (mov && mov.registradoEn && typeof mov.registradoEn.toMillis === 'function')
          ? mov.registradoEn.toMillis() : null,
        monto: -a,
      });
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

  // ─── Acuerdos de pago — ESCUDO de 2 estados (spec v2 §1.4, Consejo Externo) ───
  // El acuerdo NO mueve dinero: re-programa la EXIGIBILIDAD de la deuda que cubre.
  // NO hay tramos (el Consejo los mató): el plan es un ESCUDO. AL DÍA → la deuda
  // cubierta deja de envejecer por sus vencimientos y pasa a regirse por el
  // cronograma. ROTO (≥N cuotas vencidas impagas) → el escudo CAE: la deuda
  // cubierta revive su vencimiento original (mora histórica para el castigo, M7).
  // Mutex `acuerdoVigenteId` ⇒ a lo sumo UN vigente; si llegaran varios (legacy),
  // se elige el más nuevo de forma determinista. `id` ausente (UI) → se trata como
  // el único.
  const ms = (t) => (t && typeof t.toMillis === 'function' ? t.toMillis() : null);
  const acuerdosValidos = Array.isArray(opts.acuerdos)
    ? opts.acuerdos.filter((a) => acuerdoEsValido(a, opts)) : [];
  let acuerdo = null;
  for (const a of acuerdosValidos) {
    if (!acuerdo) { acuerdo = a; continue; }
    const ma = ms(a.creadoEn) ?? Infinity, mc = ms(acuerdo.creadoEn) ?? Infinity;
    if (ma > mc || (ma === mc && String(a.id || '') > String(acuerdo.id || ''))) acuerdo = a;
  }

  const incumplidoCuotas = (Number.isInteger(opts.incumplidoCuotas) && opts.incumplidoCuotas >= 1)
    ? opts.incumplidoCuotas : 2;
  let planVencido = 0, planAlDia = 0, planDiasMora = 0, planFechaAntigua = null;

  if (acuerdo) {
    // Cobertura: cargos REGISTRADOS hasta el pacto (reloj de SERVIDOR — una factura
    // retrofechada DESPUÉS del pacto no se cuela bajo el escudo). creadoEn pendiente
    // (recién pactado) → ancla = +∞ ⇒ cubre toda la deuda actual (semántica "pacté
    // hoy sobre lo que debe"). Cargo sin regMs (legacy) → fuera (conservador).
    const anclaMs = ms(acuerdo.creadoEn) ?? Infinity;
    const esCubierto = (c) => c.dayNum != null && c.regMs != null && c.regMs <= anclaMs;
    const cubiertos = cargos.filter((c) => c.pendiente > 0 && esCubierto(c));
    const deudaCubierta = round2(cubiertos.reduce((s, c) => s + c.pendiente, 0));
    // Reducción FIFO realmente PROBADA sobre la deuda cubierta (Σ orig−pendiente del
    // libro append-only, incl. cargos ya saldados): verdad de servidor infalsificable
    // que acota `pagado` para que inflar Σcuotas no fabrique abonos fantasma.
    const pagadoReal = round2(cargos.filter(esCubierto).reduce((s, c) => s + (c.orig - c.pendiente), 0));
    const sumaCuotas = acuerdo.cuotas.reduce((s, q) => s + q.monto, 0);
    // D0 = deuda cubierta AL PACTO (verdad de servidor): replay FIFO con SOLO los
    // créditos registrados hasta el pacto, sobre los cargos que ya existían entonces
    // (orden FIFO ya fijado arriba). Créditos sin regMs → pre-pacto (conservador).
    let credAlPacto = round2(creditList.reduce((s, cr) =>
      s + ((cr.regMs == null || cr.regMs <= anclaMs) ? cr.monto : 0), 0));
    let deudaAlPacto = 0;
    for (const c of cargos) {
      if (c.regMs == null || c.regMs > anclaMs) continue;   // no existía al pactar
      const aplica = Math.min(credAlPacto, c.orig);
      credAlPacto = round2(credAlPacto - aplica);
      if (c.dayNum != null) deudaAlPacto = round2(deudaAlPacto + round2(c.orig - aplica));
    }
    // Deuda cubierta totalmente pagada (o nada que cubrir) → el plan ya no aplica
    // (no mostrar "próxima cuota" a quien no debe). El acuerdo sigue 'vigente' en la
    // BD (no se sella solo); el panel deja de pintarlo cuando no hay deuda.
    if (deudaCubierta <= 0) { /* plan = null, bajoAcuerdo = 0 (defaults) */ }
    else {
    // Pagado del plan = reducción de la deuda cubierta POSTERIOR al pacto
    // (deudaAlPacto − deudaCubierta), acotada por Σcuotas y por la reducción total
    // probada (pagadoReal, defensa §be342aa). Un abono PRE-pacto ya bajó la deuda al
    // pactar y NO paga cuotas; inflar Σcuotas tampoco fabrica `pagado` (bug A8, comité R6).
    let pagado = Math.max(0, Math.min(round2(deudaAlPacto - deudaCubierta), sumaCuotas, pagadoReal));
    let exigible = 0, vencidoPlan = 0, cuotasVenc = 0;
    let proxima = null;
    for (const q of acuerdo.cuotas) {
      const resto = round2(Math.max(0, q.monto - Math.min(pagado, q.monto)));
      pagado = round2(Math.max(0, pagado - q.monto));
      const qDay = toDayNum(q.fecha);
      const pasada = qDay != null && hoyNum > qDay;        // estricto: el día exacto = al día
      if (pasada) {
        exigible = round2(exigible + q.monto);
        if (resto > 0) {
          vencidoPlan = round2(vencidoPlan + resto);
          cuotasVenc += 1;
          const mora = hoyNum - qDay;                       // cuota más vieja impaga = peor mora del plan
          if (mora > planDiasMora) { planDiasMora = mora; planFechaAntigua = q.fecha; }
        }
      }
      if (resto > 0 && !proxima) proxima = { fecha: q.fecha, monto: resto };
    }
    const roto = cuotasVenc >= incumplidoCuotas;
    result.plan = {
      acuerdoId: acuerdo.id || null,
      exigible, vencidoPlan, cuotasVencidas: cuotasVenc,
      proximaCuota: proxima, roto,
    };
    if (!roto) {
      // ESCUDO: protege hasta Σcuotas de la deuda cubierta (la más vieja primero).
      // El EXCESO (deuda cubierta > Σcuotas, p.ej. una sub-programación por SDK)
      // NO se esconde: su remanente envejece por su vencimiento original. Es UN
      // corte de frontera, no tramos (el Consejo mató los tramos).
      let cap = sumaCuotas, shielded = 0;
      for (const c of cubiertos) {                 // ya en orden FIFO (más viejo primero)
        if (cap <= 0) break;
        const bajo = Math.min(c.pendiente, cap);
        shielded = round2(shielded + bajo);
        cap = round2(cap - bajo);
        if (bajo >= c.pendiente) c.enAcuerdo = true;          // cubierto entero → fuera del aging
        else c.pendiente = round2(c.pendiente - bajo);        // parcial → el resto envejece normal
      }
      result.bajoAcuerdo = shielded;
      planVencido = vencidoPlan;
      planAlDia = round2(Math.max(0, shielded - vencidoPlan));
    }
    // ROTO: no se marca enAcuerdo → la deuda cubierta envejece por su vencimiento
    // original (la mora histórica que el castigo necesita). bajoAcuerdo queda 0.
    }
  }

  let maxMora = 0;
  for (const c of cargos) {
    if (c.pendiente <= 0 || c.enAcuerdo) continue;          // los cubiertos por el escudo: aparte
    if (c.dayNum == null) { result.sinFecha = round2(result.sinFecha + c.pendiente); continue; }
    // Vencimiento EFECTIVO (M6): el acuerdo de fecha final manda; sin él, fecha + plazo.
    const mora = hoyNum - (c.vencNum != null ? c.vencNum : c.dayNum + diasPlazo);
    if (mora <= 0) {
      result.alDia = round2(result.alDia + c.pendiente);
    } else {
      result.vencido = round2(result.vencido + c.pendiente);
      if (mora <= 30) result.buckets.d1_30 = round2(result.buckets.d1_30 + c.pendiente);
      else if (mora <= 60) result.buckets.d31_60 = round2(result.buckets.d31_60 + c.pendiente);
      else result.buckets.d60plus = round2(result.buckets.d60plus + c.pendiente);
      if (mora > maxMora) { maxMora = mora; result.fechaVencidoMasAntigua = c.fechaISO; }
    }
  }

  // Fold del ESCUDO: el atraso del plan se agrega como un bloque, fechado por la
  // cuota impaga más vieja; lo no-vencido del plan cuenta como al-día por pacto.
  result.alDia = round2(result.alDia + planAlDia);
  if (planVencido > 0) {
    result.vencido = round2(result.vencido + planVencido);
    if (planDiasMora <= 30) result.buckets.d1_30 = round2(result.buckets.d1_30 + planVencido);
    else if (planDiasMora <= 60) result.buckets.d31_60 = round2(result.buckets.d31_60 + planVencido);
    else result.buckets.d60plus = round2(result.buckets.d60plus + planVencido);
    if (planDiasMora > maxMora) { maxMora = planDiasMora; result.fechaVencidoMasAntigua = planFechaAntigua; }
  }
  result.diasMora = maxMora;

  if (result.saldo < 0) result.estado = 'a-favor';
  else if (result.saldo === 0) result.estado = 'sin-deuda';
  else result.estado = result.vencido > 0 ? 'vencido' : 'al-dia';
  // El sello "En acuerdo de pago" (P1 de Daniel) NO es un estado nuevo: se DERIVA
  // de `bajoAcuerdo>0` en `estadoBadgeHTML` (ni roja ni verde corriente) — así
  // ningún consumidor que conmute sobre `estado` se rompe (queda 'al-dia').

  return result;
}
