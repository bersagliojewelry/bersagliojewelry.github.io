/**
 * inventario-service.js — cliente de las operaciones MANUALES de stock (TODO-40 · F1 · B4).
 *
 * Espeja `pedidos-service.js`: el navegador (panel admin) manda INSUMOS; las Cloud Functions
 * `ajustarStock`/`cambiarTipoPieza` (Admin SDK) son el ÚNICO camino que muta `cantidad`/`estado`
 * (las reglas los bloquean al cliente — STOCK TRANSACCIONAL, CF-only). Aquí NO vive lógica de
 * stock ni de concurrencia: solo transporte (callable). Aísla el backend de la vista (piezas.js)
 * para que el contrato sea reusable sin arrastrar el DOM del panel (§3.6 cero monolitos).
 */
import { app } from './firebase-config.js';

// Motivos válidos de ajuste — ESPEJO de functions/inventario-core.js `MOTIVOS_AJUSTE`. La CF es
// la SSoT (re-valida server-side); esta copia solo alimenta el <select> y el rótulo del toast.
export const MOTIVOS_AJUSTE = [
    { value: 'reabasto',   label: 'Reabastecer (entraron unidades)' },
    { value: 'merma',      label: 'Merma / pérdida' },
    { value: 'dano',       label: 'Daño' },
    { value: 'robo',       label: 'Robo' },
    { value: 'correccion', label: 'Corrección de conteo' },
];

// Callable lazy (no cargamos firebase/functions hasta la 1ª operación — igual que pedidos/crm-service).
async function _callable(name) {
    const { getFunctions, httpsCallable } = await import('firebase/functions');
    return httpsCallable(getFunctions(app, 'us-central1'), name);
}

/**
 * Ajuste manual de stock (delta firmado, auditado en el ledger). Reabasto = delta +N;
 * merma/daño/robo/corrección = delta −N. Idempotente por `ajusteId`. La cantidad nunca queda negativa.
 * @param {{ pieceId:string, delta:number, motivo:string, ajusteId?:string }} input
 * @returns {Promise<{ pieceId:string, ajusteId:string, cantidad:number, yaExistia:boolean }>}
 */
export async function ajustarStock({ pieceId, delta, motivo, ajusteId } = {}) {
    const fn = await _callable('ajustarStock');
    return (await fn({ pieceId, delta, motivo, ajusteId: ajusteId || _uuid() })).data;
}

/**
 * Cambia el tipo de stock de una pieza (transición D6: purga los campos del tipo anterior).
 * → 'encargo' borra `cantidad`; → finito* la fija/conserva. La CF recalcula el `estado` derivado.
 * @param {{ pieceId:string, nuevoStockType:string, cantidad?:number }} input
 * @returns {Promise<{ pieceId:string, stockType:string, cantidad:(number|null) }>}
 */
export async function cambiarTipoPieza({ pieceId, nuevoStockType, cantidad } = {}) {
    const fn = await _callable('cambiarTipoPieza');
    const payload = { pieceId, nuevoStockType };
    if (Number.isInteger(cantidad)) payload.cantidad = cantidad;
    return (await fn(payload)).data;
}

// UUID v4 para idempotencia del ajuste (crypto.randomUUID en navegadores modernos; fallback simple).
function _uuid() {
    try { if (crypto?.randomUUID) return crypto.randomUUID(); } catch { /* no-op */ }
    return 'aj-' + Date.now() + '-' + Math.random().toString(36).slice(2, 10);
}

export default { ajustarStock, cambiarTipoPieza, MOTIVOS_AJUSTE };
