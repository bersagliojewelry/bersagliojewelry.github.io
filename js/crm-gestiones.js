/**
 * Bersaglio CRM — Gestiones de cobro (Fase M · M5): helpers PUROS.
 *
 * Una gestión es EVIDENCIA del expediente de cobranza (art. 146 ET): inmutable
 * por reglas (update/delete false) — una equivocación se aclara registrando OTRA
 * gestión, nunca editando la anterior. Este módulo es el espejo UI de
 * gestionValida() (firestore.rules): las listas son LITERALES a propósito
 * (decisión C2 §69 — cero get() a config en el camino diario). La frontera real
 * son las reglas; estos helpers solo evitan que Kary envíe algo condenado.
 *
 * Sin Firestore: testeable con node:test (tests/crm-gestiones.test.mjs).
 */

// Cómo se hizo el contacto (espejo LITERAL de gestionValida → d.tipo).
export const TIPOS_GESTION = [
    { codigo: 'llamada',  label: 'Llamada' },
    { codigo: 'whatsapp', label: 'WhatsApp' },
    { codigo: 'visita',   label: 'Visita' },
    { codigo: 'otro',     label: 'Otro' },
];

// Qué pasó (espejo LITERAL de gestionValida → d.resultado). El resultado es
// OBLIGATORIO: sin él la gestión no tiene seriedad probatoria (Aporte B §69).
export const RESULTADOS_GESTION = [
    { codigo: 'promesa_pago',    label: 'Prometió pagar' },
    { codigo: 'sin_acuerdo',     label: 'Sin acuerdo' },
    { codigo: 'no_contesto',     label: 'No contestó' },
    { codigo: 'numero_invalido', label: 'Número inválido' },
    { codigo: 'otro',            label: 'Otro' },
];

export function tipoGestionLabel(codigo) {
    return TIPOS_GESTION.find((t) => t.codigo === codigo)?.label || codigo || '—';
}

export function resultadoGestionLabel(codigo) {
    return RESULTADOS_GESTION.find((r) => r.codigo === codigo)?.label || codigo || '—';
}

const FECHA_ISO = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Valida el payload ANTES de enviarlo — espejo de gestionValida() con UNA
 * exigencia extra que la regla no tiene: la fecha no puede ser futura (una
 * gestión es un hecho que YA ocurrió; la UI evita el dato absurdo, la regla
 * sigue siendo la frontera). Mensajes en lenguaje de mostrador.
 * @param {object} g { tipo, resultado, fecha, nota?, soporte? }
 * @param {string} [hoy] 'YYYY-MM-DD' — si viene, bloquea fechas futuras.
 * @returns {{ok: boolean, errores: string[]}}
 */
export function validarGestion(g, hoy) {
    const errores = [];
    if (!TIPOS_GESTION.some((t) => t.codigo === g?.tipo)) {
        errores.push('Elige cómo contactaste a la clienta.');
    }
    if (!RESULTADOS_GESTION.some((r) => r.codigo === g?.resultado)) {
        errores.push('Elige qué pasó con la gestión.');
    }
    if (!FECHA_ISO.test(g?.fecha || '')) {
        errores.push('Elige la fecha de la gestión.');
    } else if (typeof hoy === 'string' && FECHA_ISO.test(hoy) && g.fecha > hoy) {
        errores.push('La fecha no puede ser futura: la gestión ya ocurrió.');
    }
    return { ok: errores.length === 0, errores };
}

/**
 * Orden del timeline: fecha del HECHO descendente (lo más reciente arriba);
 * empate de fecha → creadoEn descendente. Un creadoEn AUSENTE cuenta como el más
 * nuevo: es el serverTimestamp() PENDIENTE de una gestión recién registrada
 * (latency compensation) — tratarlo como 0 la mandaría al final y "saltaría" de
 * posición al llegar el ack (verif. M5). Sin fecha válida (no debería pasar: la
 * regla la exige) → al final. NO muta la lista original.
 */
export function ordenarGestiones(list) {
    const millis = (g) => (g?.creadoEn?.toMillis ? g.creadoEn.toMillis() : Infinity);
    return [...(list || [])].sort((a, b) => {
        const fa = FECHA_ISO.test(a?.fecha || '') ? a.fecha : '';
        const fb = FECHA_ISO.test(b?.fecha || '') ? b.fecha : '';
        if (fa !== fb) return fb < fa ? -1 : 1;   // ISO compara bien como string
        const ta = millis(a), tb = millis(b);
        if (ta === tb) return 0;                  // (Infinity−Infinity = NaN; jamás restar)
        return tb > ta ? 1 : -1;
    });
}

/**
 * El enlace de soporte solo se vuelve clickeable si es http(s) — cualquier otro
 * texto (ej. "recibo #423") se muestra plano. Evita javascript: y similares.
 */
export function esEnlaceSeguro(soporte) {
    return typeof soporte === 'string' && /^https?:\/\//i.test(soporte.trim());
}
