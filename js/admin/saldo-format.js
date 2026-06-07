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
  return 'Al día';
}

/** Pill de estado de cuenta (token-based) para innerHTML. */
export function estadoBadgeHTML(est) {
  const e = est?.estado;
  const cls = e === 'vencido' ? 'adm-pill--red'
            : e === 'a-favor' ? 'adm-pill--green'
            : (est?.sinFecha > 0) ? 'adm-pill--gold'   // deuda sin fecha → requiere atención de Kary
            : 'adm-pill--gray';
  return `<span class="adm-pill ${cls}">${estadoLabel(est)}</span>`;
}
