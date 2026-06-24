/**
 * Bersaglio — sonda de rendimiento de arranque (TODO-33, paso "medir primero").
 *
 * Mide el DESGLOSE POR TRAMO de la cascada de arranque del panel admin
 * (init SDK → App Check → waitForAuth → getDoc rol → db.init → sidebar → 1er dato)
 * para LOCALIZAR el cuello real antes de decidir arquitectura (comité ×4 + Gemini:
 * hipótesis = App Check/reCAPTCHA + waitForAuth + re-fetch, NO el reflow). §3.3: medir, no asumir.
 *
 * GATEADA: solo activa con `?perf=1` en la URL o `localStorage.bj_perf='1'`.
 * Si no está activa, `pmark`/`psummary` son NO-OP de costo ~cero → seguro en prod/público.
 * Infra NEUTRAL (como live-query.js): la importan firebase-config/auth (público + admin) y las
 * páginas admin; vive en `core/` para no acoplar el bundle público a `admin/`.
 *
 * Uso para medir (Daniel/Claude): abrir una página admin con `?perf=1` (o setear
 * `localStorage.bj_perf='1'` una vez) → la consola imprime la tabla de tramos al primer dato.
 * `performance.now()` ya cuenta ms DESDE el inicio de la navegación (timeOrigin), así que el
 * valor absoluto del 1er mark = descarga+parse+init hasta ese punto.
 */

let _on = false;
try {
    _on = (typeof location !== 'undefined' &&
           new URLSearchParams(location.search).get('perf') === '1')
       || (typeof localStorage !== 'undefined' && localStorage.getItem('bj_perf') === '1');
} catch { /* sin DOM / storage bloqueado → off */ }

const _marks = [];

/** Registra un hito de la cascada. No-op si la sonda está apagada. */
export function pmark(label) {
    if (!_on || typeof performance === 'undefined') return;
    _marks.push({ label, t: performance.now() });
}

/** Imprime el desglose por tramo (Δ entre hitos) + el total de navegación. No-op si está apagada. */
export function psummary(tag = 'admin-boot') {
    if (!_on || _marks.length === 0 || typeof performance === 'undefined') return;
    let prev = 0;
    const rows = _marks.map(({ label, t }) => {
        const row = { tramo: label, 'Δ ms': +(t - prev).toFixed(1), 'desde nav-start ms': +t.toFixed(1) };
        prev = t;
        return row;
    });
    /* eslint-disable no-console */
    console.log(`%c⏱ ${tag} — desglose por tramo (medición TODO-33)`, 'font-weight:bold;color:#0a7');
    console.table(rows);
    const nav = performance.getEntriesByType?.('navigation')?.[0];
    if (nav) console.log(`[perf] navegación (descarga+parse+exec hasta load): ${nav.duration.toFixed(1)} ms · DOMContentLoaded: ${nav.domContentLoadedEventEnd.toFixed(1)} ms`);
    /* eslint-enable no-console */
}

/** ¿La sonda está activa? (para gatear marcas costosas de armar). */
export function perfOn() { return _on; }
