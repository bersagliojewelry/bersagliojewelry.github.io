/**
 * Cálculo bruto → neto (B1 paso 6 · TODO-37) — PURO y testeable.
 *
 * `bruto` = lo que paga el cliente (el `total` del pedido, exacto, server-side).
 * `neto`  = lo que realmente llega al banco = bruto − comisión Wompi − retenciones.
 *
 * Las tasas NO se inventan: son PARÁMETROS (la comisión real de Wompi y las retenciones las
 * confirman la cuenta de Kary / el contador). Los defaults van marcados "VERIFICAR" y se
 * sobrescriben con `config/fiscal` cuando lleguen los reales — sin tocar código. Enteros COP.
 */

// Comisión Wompi VERIFICADA 2026-06-30 (plan activo de la cuenta vinculada, pantallazo Daniel):
// 2,65% + $700 + IVA por transacción exitosa (tarjetas/Nequi/PSE/Daviplata/QR/Bancolombia). Las
// retenciones (ReteFuente/ReteICA) siguen pendientes del contador. Enteros COP.
export const FISCAL_DEFAULT = {
    wompiPct:     0.0265,   // 2,65% sobre el bruto ✅ verif. plan Wompi 2026-06-30
    wompiFijo:    700,      // + $700 fijo por transacción ✅ verif. plan Wompi 2026-06-30
    wompiIvaPct:  0.19,     // IVA 19% sobre la comisión ✅
    reteFuentePct: 0,       // ReteFuente (fracción del bruto) — lo define el contador
    reteIcaXMil:   0,       // ReteICA en ‰ (por mil) del bruto — lo define el contador
};

const entero = n => Math.round(Math.max(0, Number(n) || 0));

/**
 * @param {{ bruto:number|string, medio:string, fiscal?:object }} input
 * @returns {{ bruto:number, comisionWompi:number, comisionBase:number, comisionIva:number, reteFuente:number, reteIca:number, neto:number }}
 */
export function calcularNeto({ bruto, medio, fiscal } = {}) {
    const b = entero(bruto);
    const f = { ...FISCAL_DEFAULT, ...(fiscal || {}) };
    // Comisión solo aplica a pagos por pasarela (Wompi) con monto real. Sin bruto no hay comisión.
    const esWompi = b > 0 && medio === 'wompi';
    const comisionWompi = esWompi ? entero((b * f.wompiPct + f.wompiFijo) * (1 + f.wompiIvaPct)) : 0;
    // C.4: la comisión se DISCRIMINA (base + IVA) para que el contador tenga el IVA descontable en su propia
    // columna. `comisionIva = total − base` → la suma cuadra EXACTO con `comisionWompi` (sin cambiar el neto).
    const comisionBase = esWompi ? entero(b * f.wompiPct + f.wompiFijo) : 0;
    const comisionIva  = comisionWompi - comisionBase;
    const reteFuente = entero(b * f.reteFuentePct);
    const reteIca    = entero(b * f.reteIcaXMil / 1000);
    const neto = b - comisionWompi - reteFuente - reteIca;
    return { bruto: b, comisionWompi, comisionBase, comisionIva, reteFuente, reteIca, neto };
}

export default { calcularNeto, FISCAL_DEFAULT };
