/**
 * Calculadora de precio por peso (B1 paso 2 · TODO-37).
 *
 * Daniel 2026-06-26: el precio del oro VARÍA → el valor del gramo NO se guarda fijo en
 * config; es un INPUT que Kary ingresa al momento (junto al peso). Fórmula:
 *   total = peso × valor_gramo + mano_obra   (enteros COP, redondeo al final).
 *
 * La función `calcularPrecio` es PURA (testeable sin DOM). `initCalculadora` cablea el modal
 * en la página Piezas (botón en la topbar). En B1 paso 3 (pedido) la MISMA fórmula la recalcula
 * la Cloud Function server-side y la congela como snapshot inmutable en el pedido.
 */

const cop = n => '$' + Math.round(Math.max(0, Number(n) || 0)).toLocaleString('es-CO');

/**
 * @param {{valorGramo:number|string, peso:number|string, manoObra:number|string}} insumos
 * @returns {{oro:number, mano:number, total:number}} enteros COP
 */
export function calcularPrecio({ valorGramo, peso, manoObra } = {}) {
    const g = Math.max(0, Number(valorGramo) || 0);
    const p = Math.max(0, Number(peso) || 0);
    const m = Math.max(0, Number(manoObra) || 0);
    const oro  = Math.round(g * p);   // valor del oro (peso × gramo)
    const mano = Math.round(m);
    return { oro, mano, total: oro + mano };
}

/** Cablea el modal de la calculadora (idempotente; no-op si el shell no está). */
export function initCalculadora() {
    const modal   = document.getElementById('calc-modal');
    const openBtn = document.getElementById('btn-calc');
    if (!modal || !openBtn) return;
    const byId = id => document.getElementById(id);
    const gramo = byId('calc-gramo'), peso = byId('calc-peso'), mano = byId('calc-mano');

    function recalc() {
        const r = calcularPrecio({ valorGramo: gramo.value, peso: peso.value, manoObra: mano.value });
        byId('calc-oro').textContent     = cop(r.oro);
        byId('calc-manoout').textContent = cop(r.mano);
        byId('calc-total').textContent   = cop(r.total);
        return r;
    }
    const open  = () => { recalc(); modal.hidden = false; gramo.focus(); };
    const close = () => { modal.hidden = true; };

    openBtn.addEventListener('click', open);
    byId('calc-close').addEventListener('click', close);
    byId('calc-close2')?.addEventListener('click', close);
    modal.addEventListener('click', e => { if (e.target === modal) close(); });   // clic en backdrop
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) close(); });
    [gramo, peso, mano].forEach(el => el.addEventListener('input', recalc));

    byId('calc-copy')?.addEventListener('click', async () => {
        const r = recalc();
        try {
            await navigator.clipboard.writeText(String(r.total));
            const btn = byId('calc-copy'); const t = btn.textContent;
            btn.textContent = '✓ Copiado'; setTimeout(() => { btn.textContent = t; }, 1500);
        } catch { /* sin clipboard (http/permiso) → no romper */ }
    });
}

export default { calcularPrecio, initCalculadora };
