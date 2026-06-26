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

// Defaults — VERIFICAR con Wompi (cuenta de Kary, Persona Natural) y el contador.
export const FISCAL_DEFAULT = {
    wompiPct:     0.0265,   // 2,65% sobre el bruto (tarjetas Wompi) — VERIFICAR
    wompiFijo:    700,      // + $700 fijo por transacción — VERIFICAR
    wompiIvaPct:  0.19,     // IVA 19% sobre la comisión
    reteFuentePct: 0,       // ReteFuente (fracción del bruto) — lo define el contador
    reteIcaXMil:   0,       // ReteICA en ‰ (por mil) del bruto — lo define el contador
};

const entero = n => Math.round(Math.max(0, Number(n) || 0));

/**
 * @param {{ bruto:number|string, medio:string, fiscal?:object }} input
 * @returns {{ bruto:number, comisionWompi:number, reteFuente:number, reteIca:number, neto:number }}
 */
export function calcularNeto({ bruto, medio, fiscal } = {}) {
    const b = entero(bruto);
    const f = { ...FISCAL_DEFAULT, ...(fiscal || {}) };
    // Comisión solo aplica a pagos por pasarela (Wompi) con monto real. Sin bruto no hay comisión.
    const comisionWompi = (b > 0 && medio === 'wompi')
        ? entero((b * f.wompiPct + f.wompiFijo) * (1 + f.wompiIvaPct))
        : 0;
    const reteFuente = entero(b * f.reteFuentePct);
    const reteIca    = entero(b * f.reteIcaXMil / 1000);
    const neto = b - comisionWompi - reteFuente - reteIca;
    return { bruto: b, comisionWompi, reteFuente, reteIca, neto };
}

export default { calcularNeto, FISCAL_DEFAULT };
