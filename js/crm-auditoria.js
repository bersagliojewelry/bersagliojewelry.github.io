/**
 * Bersaglio CRM — Detectores PUROS de la auditoría mensual (Fase M · M4, plan §69).
 *
 * La pata DETECTIVA del sistema de control: el preventivo real es el tope POR
 * TRANSACCIÓN (candado M3); esto vigila lo que las reglas no pueden sumar
 * (pitufeo mensual, patrones de evasión, correcciones sin enlace). Honestidad
 * del control: detecta y RESALTA — no bloquea.
 *
 * Doctrina de tiempo: TODO se agrupa por el reloj del SERVIDOR (registradoEn /
 * anuladoEn / resueltoEn), NUNCA por `fecha` — retrofechar la fecha del hecho
 * no esconde nada aquí. Mes en hora LOCAL (Bogotá para la operación real).
 *
 * PURO y testeable sin emulador → tests/crm-auditoria.test.mjs. Lo consume la
 * vista de Salud (M4 UI) con los datos de los listeners ya existentes.
 */

const NEUTROS_DEFAULT = ['ERROR_REGISTRO', 'ABONO_NO_REGISTRADO', 'RECLASIFICACION'];

// Timestamp de Firestore | Date | ms → Date (null si no hay valor).
function aDate(v) {
    if (!v) return null;
    if (v.toDate) return v.toDate();
    if (v instanceof Date) return v;
    if (typeof v === 'number') return new Date(v);
    return null;
}

// UNA validación de acuerdos (la misma del aging/corte): si la fórmula lo
// ignoraría, el detector lo lista — jamás dos criterios de "válido".
import { acuerdoEsValido } from './crm-estado-cuenta.js';

/** 'YYYY-MM' del instante (hora local). */
export function mesDe(v) {
    const d = aDate(v);
    return d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` : null;
}

/** 'YYYY-Qn' del instante (hora local) — la ventana de la muestra trimestral. */
export function trimestreDe(v) {
    const d = aDate(v);
    return d ? `${d.getFullYear()}-Q${Math.floor(d.getMonth() / 3) + 1}` : null;
}

/** ¿Montos "similares"? (alerta rechazada-burlada): dentro del 10%, piso $1.000. */
export function esMontoSimilar(a, b) {
    const x = Math.abs(Number(a) || 0), y = Math.abs(Number(b) || 0);
    return Math.abs(x - y) <= Math.max(Math.max(x, y) * 0.10, 1000);
}

/**
 * (1) Solicitudes pendientes fuera del SLA → degradado (banner rojo en Salud +
 * aviso en el panel de Kary). slaDias viene de config/cartera.slaRevisionDias.
 */
export function pendientesFueraDeSLA(pendientes, slaDias, ahoraMs) {
    const sla = Number.isInteger(slaDias) && slaDias >= 1 ? slaDias : 2;
    const vencidas = (pendientes || []).filter((s) => {
        const d = aDate(s.creadoEn);
        return d && (ahoraMs - d.getTime()) / 864e5 > sla;
    });
    return { vencidas, degradado: vencidas.length > 0, slaDias: sla };
}

/**
 * (2a) Ajustes NEGATIVOS auto-aprobados del mes (sin solicitudId = carril directo;
 * se excluyen los del owner — su carril no es "auto-aprobado", es la autoridad).
 * Suma por clienta y global contra el tope MENSUAL (= autoAprobacionMax, política
 * A.2: mismo número como tope blando del mes). Resalta ≥2 neutros a la misma
 * clienta. Las tajadas anuladas SIGUEN contando (el intento queda firmado).
 */
export function ajustesNegativosAuto(movimientos, mes, { topeMensual, ownerUid } = {}) {
    const tope = Number(topeMensual) > 0 ? Number(topeMensual) : 50000;
    const porClienta = new Map();
    let global = 0;
    for (const m of movimientos || []) {
        if (m.tipo !== 'ajuste' || !(typeof m.monto === 'number') || m.monto >= 0) continue;
        if (m.solicitudId) continue;                       // aprobado por Daniel — no es tajada
        if (ownerUid && m.registradoPor === ownerUid) continue;
        if (mesDe(m.registradoEn) !== mes) continue;
        const c = porClienta.get(m.clienteId) || { total: 0, items: [] };
        c.total += Math.abs(m.monto);
        c.items.push(m);
        porClienta.set(m.clienteId, c);
        global += Math.abs(m.monto);
    }
    for (const c of porClienta.values()) {
        c.sobreTopeMensual = c.total > tope;
        c.multiplesNeutros = c.items.length >= 2;          // ≥2 tajadas a la misma clienta
    }
    return { porClienta, global, topeMensual: tope, sobreTopeGlobal: global > tope };
}

/**
 * (2b+3) Anulaciones del mes (por anuladoEn): con su categoría; CORRECCION_FECHA
 * resaltadas; Σ por clienta de lo anulado por NO-owner contra el tope mensual
 * (cierra el salami por anulaciones); y el FLAG DETERMINISTA "corrección sin
 * enlace": motivoCategoria CORRECCION cuyo corregidoPor falte o no apunte a un
 * asiento VIGENTE — la ruta evasiva que omite el enlace cae exactamente aquí.
 */
export function anulacionesDelMes(movimientos, mes, { topeMensual, ownerUid } = {}) {
    const tope = Number(topeMensual) > 0 ? Number(topeMensual) : 50000;
    const vivosPorId = new Map();
    for (const m of movimientos || []) vivosPorId.set(m.id, m);

    const items = [];
    const porClienta = new Map();
    for (const m of movimientos || []) {
        if (m.anulado !== true || mesDe(m.anuladoEn) !== mes) continue;
        const reemplazo = m.corregidoPor ? vivosPorId.get(m.corregidoPor) : null;
        const sinEnlace = m.motivoCategoria === 'CORRECCION'
            && (!reemplazo || reemplazo.anulado === true);
        items.push({
            ...m,
            esCorreccionFecha: m.motivoCategoria === 'CORRECCION_FECHA',
            sinEnlace,
        });
        if (!ownerUid || m.anuladoPor !== ownerUid) {
            const c = porClienta.get(m.clienteId) || { total: 0, n: 0 };
            c.total += Math.abs(typeof m.monto === 'number' ? m.monto : 0);
            c.n += 1;
            porClienta.set(m.clienteId, c);
        }
    }
    for (const c of porClienta.values()) c.sobreTopeMensual = c.total > tope;
    return {
        items,
        correccionesFecha: items.filter((i) => i.esCorreccionFecha),
        sinEnlace: items.filter((i) => i.sinEnlace),
        porClienta,
        topeMensual: tope,
    };
}

/**
 * (3b) ALERTA "rechazada burlada": Daniel rechazó una solicitud y < ventanaDias
 * después aparece un ajuste negativo AUTO (sin solicitudId, no-owner) de monto
 * similar a la MISMA clienta — el "no" burlado en tajadas o por el carril directo.
 */
export function rechazadasBurladas(solicitudes, movimientos, { ventanaDias = 30, ownerUid } = {}) {
    const alertas = [];
    for (const s of solicitudes || []) {
        if (s.estado !== 'rechazada') continue;
        const rechazoMs = aDate(s.resueltoEn)?.getTime();
        if (!rechazoMs) continue;
        for (const m of movimientos || []) {
            if (m.clienteId !== s.clienteId) continue;
            if (m.tipo !== 'ajuste' || !(typeof m.monto === 'number') || m.monto >= 0) continue;
            if (m.solicitudId) continue;
            if (ownerUid && m.registradoPor === ownerUid) continue;
            const regMs = aDate(m.registradoEn)?.getTime();
            if (!regMs || regMs <= rechazoMs) continue;
            if ((regMs - rechazoMs) / 864e5 > ventanaDias) continue;
            if (!esMontoSimilar(m.monto, s.monto)) continue;
            alertas.push({ solicitud: s, ajuste: m, diasDespues: Math.floor((regMs - rechazoMs) / 864e5) });
        }
    }
    return alertas;
}

/**
 * (4) Recaudo del mes por medio de pago (para conciliar contra extracto + arqueo).
 * Solo abonos VIGENTES suman recaudo; los anulados se reportan aparte (señal).
 */
export function abonosPorMedio(movimientos, mes) {
    const porMedio = new Map();
    let total = 0, anuladosTotal = 0, sinMedio = 0;
    for (const m of movimientos || []) {
        if (m.tipo !== 'abono' || mesDe(m.registradoEn) !== mes) continue;
        const monto = typeof m.monto === 'number' ? m.monto : 0;
        if (m.anulado === true) { anuladosTotal += monto; continue; }
        const medio = m.medioPago || 'sin_medio';
        if (medio === 'sin_medio') sinMedio += monto;       // legacy pre-M3 (señal, no error)
        const cur = porMedio.get(medio) || { total: 0, n: 0 };
        cur.total += monto; cur.n += 1;
        porMedio.set(medio, cur);
        total += monto;
    }
    return { porMedio, total, anuladosTotal, sinMedio };
}

// PRNG sembrado (mulberry32 sobre hash del string) → la muestra trimestral es
// ESTABLE para el mismo período: Daniel y el acta ven la misma lista siempre.
function semilla(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
}
function mulberry32(a) {
    return () => {
        a |= 0; a = (a + 0x6D2B79F5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/**
 * (6 · M6) Facturas VIVAS cuyo acuerdo de pago está anormalmente lejos de su fecha
 * (vencimiento − fecha > umbralDias). El acuerdo explícito MANDA sobre el aging:
 * un dedazo de año (2099) o un acuerdo malicioso PARQUEA la deuda fuera de
 * vencidos, del aviso SLA y del corte inmutable — el mismo vector que el Consejo
 * M3 cerró en la FECHA con la cota +2d, reabierto por el acuerdo (futuro por
 * diseño; la regla no le pone techo porque el acuerdo largo legítimo existe).
 * Detectivo, no preventivo: la UI bloquea >365d al crear; esto atrapa lo que
 * entre por fuera (SDK/legacy) o lo largo-pero-permitido fuera de lo normal.
 * `acuerdos`: las facturas CUBIERTAS por un plan vigente se EXCLUYEN — su
 * horizonte lo gobierna el acuerdo (si no, todo plan legítimo inundaría el acta).
 */
export function acuerdosLargos(movimientos, { umbralDias = 120, acuerdos = [] } = {}) {
    const ISO = /^\d{4}-\d{2}-\d{2}$/;
    // v2: todo acuerdo es de SALDO → cubre por clienta. Las facturas de una clienta
    // con plan vigente las gobierna el acuerdo (su horizonte ya lo vigila el detector
    // de planes largos) → se excluyen para no inundar el acta.
    const conPlan = new Set((acuerdos || []).filter((a) => a && a.estado === 'vigente').map((a) => a.clienteId));
    const out = [];
    for (const m of movimientos || []) {
        if (!m || m.anulado === true || m.tipo !== 'factura') continue;
        if (conPlan.has(m.clienteId)) continue;
        if (!ISO.test(m.fecha || '') || !ISO.test(m.vencimiento || '')) continue;
        const dias = Math.round((Date.parse(m.vencimiento) - Date.parse(m.fecha)) / 864e5);
        if (dias > umbralDias) out.push({ ...m, diasAcuerdo: dias });
    }
    return out.sort((a, b) => b.diasAcuerdo - a.diasAcuerdo);
}

// ─── (7) Acuerdos de pago — vigilancia (spec 2026-06-12 §1.8: 3 señales) ───────

/**
 * (7a) TODO acuerdo creado este mes sobre una cuenta que YA estaba vencida según
 * el CORTE INMUTABLE previo (jamás contra `saldoAlPactar`, que es autodeclarado).
 * Cierra la ventana del vector dominante: pactar para esconder mora. Línea
 * obligatoria del acta. Sin corte previo para comparar → se lista igual con
 * `vencidoPrevio: null` (visibilidad conservadora, no silencio).
 */
export function acuerdosSobreMora(acuerdos, mes, cortePrevio) {
    const out = [];
    for (const a of acuerdos || []) {
        if (!a || mesDe(a.creadoEn) !== mes) continue;
        const prev = cortePrevio && cortePrevio.clientes ? cortePrevio.clientes[a.clienteId] : null;
        const vencidoPrevio = (prev && typeof prev.vencido === 'number') ? prev.vencido : null;
        if (vencidoPrevio === null || vencidoPrevio > 0) {
            out.push({
                acuerdo: a, vencidoPrevio,
                diasMoraPrevio: (prev && typeof prev.diasMora === 'number') ? prev.diasMora : null,
            });
        }
    }
    return out.sort((x, y) => (y.vencidoPrevio || 0) - (x.vencidoPrevio || 0));
}

/**
 * (7b) Acuerdos ANÓMALOS — detector multi-check tipado (v2: 2 checks; el MUTEX
 * mató `solapados` y `huerfanos` por diseño — un plan suelto o por-factura ya no
 * existe):
 *   · invalidos: vigentes que la fórmula IGNORARÍA (acuerdoEsValido — la misma
 *     validación del aging: si aquí aparece, el plan NO protege nada; típico de un
 *     acuerdo malformado escrito por SDK);
 *   · largos: última cuota a más de `umbralActaDias` del pacto (resaltado del
 *     acta — P3: permitido hasta el horizonte, visible siempre que pase de 12 meses).
 */
export function acuerdosAnomalos(acuerdos, opts = {}) {
    const umbralActaDias = (typeof opts.umbralActaDias === 'number' && opts.umbralActaDias > 0)
        ? opts.umbralActaDias : 365;
    const ISO = /^\d{4}-\d{2}-\d{2}$/;
    const out = { invalidos: [], largos: [] };
    for (const a of acuerdos || []) {
        if (!a || a.estado !== 'vigente') continue;
        if (!acuerdoEsValido(a, opts)) out.invalidos.push(a);
        if (ISO.test(a.fechaPacto || '') && ISO.test(a.ultimaCuotaFecha || '')) {
            const dias = Math.round((Date.parse(a.ultimaCuotaFecha) - Date.parse(a.fechaPacto)) / 864e5);
            if (dias > umbralActaDias) out.largos.push({ ...a, diasPlan: dias });
        }
    }
    return out;
}

/**
 * (7c) Renegociaciones SERIALES: ≥`min` acuerdos en la ventana POR CLIENTA,
 * contados por `creadoEn` (reloj de servidor — el enlace `reemplazaA` lo
 * controla quien pacta; las fechas reales no). El escudo perpetuo se ve.
 */
export function renegociacionesSeriales(acuerdos, { ventanaDias = 365, min = 2, ahoraMs = 0 } = {}) {
    const desde = ahoraMs - ventanaDias * 864e5;
    const por = new Map();
    for (const a of acuerdos || []) {
        const t = a && a.creadoEn && typeof a.creadoEn.toMillis === 'function' ? a.creadoEn.toMillis() : null;
        if (t == null || t < desde) continue;
        const k = a.clienteId || '?';
        por.set(k, (por.get(k) || 0) + 1);
    }
    return [...por.entries()].filter(([, n]) => n >= min)
        .map(([clienteId, n]) => ({ clienteId, n }))
        .sort((x, y) => y.n - x.n);
}

/**
 * (5) Muestra TRIMESTRAL de ajustes para cotejar contra soportes (política A.5):
 * sortea hasta `n` ajustes del trimestre con semilla = el trimestre mismo →
 * determinista (no se puede "re-sortear" hasta que salga una muestra cómoda).
 */
export function muestraTrimestral(movimientos, trimestre, n = 10) {
    const candidatos = (movimientos || [])
        .filter((m) => m.tipo === 'ajuste' && trimestreDe(m.registradoEn) === trimestre)
        .sort((a, b) => String(a.id).localeCompare(String(b.id)));   // orden estable pre-sorteo
    const rand = mulberry32(semilla(trimestre));
    // Fisher-Yates sembrado
    for (let i = candidatos.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [candidatos[i], candidatos[j]] = [candidatos[j], candidatos[i]];
    }
    return candidatos.slice(0, n);
}
