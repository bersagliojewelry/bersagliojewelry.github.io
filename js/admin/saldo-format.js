/**
 * Bersaglio Admin — formato compartido del saldo (color + etiqueta).
 * Única fuente del signo/color/etiqueta del saldo (antes duplicado con hex
 * hardcodeado en cuentas.js y cuenta.js). Usa los tokens via clases .adm-money.
 */
import { fmtCOP } from '../crm-service.js';

/** Clase de color del saldo (token-based). saldo > 0 = debe (rojo). */
export function saldoClass(saldo) {
  if (saldo > 0) return 'adm-money adm-money--debe';
  if (saldo < 0) return 'adm-money adm-money--favor';
  return 'adm-money adm-money--cero';
}

/** Etiqueta del saldo para la ficha. */
export function saldoLabel(saldo) {
  if (saldo > 0) return 'Saldo (debe)';
  if (saldo < 0) return 'Saldo a favor';
  return 'Saldo';
}

/** Celda de saldo lista para innerHTML (clase + monto formateado). */
export function saldoCellHTML(saldo) {
  return `<strong class="${saldoClass(saldo)}">${fmtCOP(saldo)}</strong>`;
}

// ─── Mora / aging (cartera vencida) ───────────────────────────────────────────
// Consumen el objeto `estadoCuenta` de js/crm-estado-cuenta.js. Color por tokens
// (sin hex): vencido = rojo (--adm-danger), a favor = verde, al día/sin = neutro.

/** Etiqueta legible del estado de cuenta (resumen de mora). */
export function estadoLabel(est) {
  if (!est) return 'Sin deuda';
  if (est.estado === 'a-favor') return 'Saldo a favor';
  if (est.estado === 'sin-deuda') return 'Sin deuda';
  if (est.estado === 'vencido') {
    const d = est.diasMora;
    return `Vencido · ${d} ${d === 1 ? 'día' : 'días'} de mora`;
  }
  if (est.sinFecha > 0) return 'Falta fecha de corte';
  // P1 (Daniel 2026-06-12): la clienta que CUMPLE su acuerdo no es morosa hoy,
  // pero tampoco "al día corriente" — sello propio (cartera reestructurada).
  if (est.bajoAcuerdo > 0) return 'En acuerdo de pago';
  return 'Al día';
}

/** Clase del pill de estado (compartida entre el render por string y el DOM). */
export function estadoPillClass(est) {
  const e = est?.estado;
  return e === 'vencido' ? 'adm-pill--red'
       : e === 'a-favor' ? 'adm-pill--green'
       : (est?.sinFecha > 0) ? 'adm-pill--gold'   // deuda sin fecha → requiere atención de Kary
       : (est?.bajoAcuerdo > 0) ? 'adm-pill--gold' // en acuerdo: ni roja ni verde corriente (P1)
       : 'adm-pill--gray';
}

/** Pill de estado de cuenta (token-based) para innerHTML. */
export function estadoBadgeHTML(est) {
  return `<span class="adm-pill ${estadoPillClass(est)}">${estadoLabel(est)}</span>`;
}
