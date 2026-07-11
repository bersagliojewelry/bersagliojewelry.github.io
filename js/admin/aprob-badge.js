/**
 * aprob-badge.js — contador VIVO del badge "Aprobaciones" del rail (F-IA-2 B4 · [OPUS-4.8]).
 *
 * El pulso de lo pendiente, visible desde CUALQUIER página del panel (patrón `inq-badge`): suma
 * las correcciones de cartera (solicitudes M2b) + los movimientos de bóveda pendientes de firma.
 * Owner-only: el ítem "Aprobaciones" y su badge sólo existen para owner (bóveda `read isOwner` +
 * solicitudes admin+; el único rol no-owner futuro `caja` no lee ninguna de las dos). Lo invoca
 * `shared.js` desde `initSidebar()` gateado por rol → no arranca listeners para quien no debe.
 */
import { onSolicitudesPendientesChange } from '../crm-service.js';
import { onBovedaMovsChange } from '../pedidos-service.js';
import { esDestructivo } from './caja-format.js';

let _sol = 0, _caja = 0, _wired = false;

function paint() {
    const badge = document.getElementById('aprob-badge');
    if (!badge) return;
    const n = _sol + _caja;
    badge.textContent = n > 9 ? '9+' : String(n);
    badge.hidden = n === 0;
}

/** Suscribe una sola vez por carga de página (idempotente). Actualiza #aprob-badge en vivo. */
export function initAprobBadge() {
    if (_wired) { paint(); return; }
    _wired = true;
    onSolicitudesPendientesChange((list) => { _sol = list.length; paint(); }, () => { _sol = 0; paint(); });
    onBovedaMovsChange((movs) => { _caja = movs.filter(esDestructivo).length; paint(); }, 200, () => { _caja = 0; paint(); });
}
