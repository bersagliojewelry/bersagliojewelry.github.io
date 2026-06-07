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
