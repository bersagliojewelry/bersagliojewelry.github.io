/**
 * Bersaglio Admin — Parámetros del sistema (M0-C, plan §69 + directiva de Daniel
 * 2026-06-10: "panel de configuración completo, profesional; solo mi usuario").
 *
 * Módulo PURO (sin Firestore/DOM — patrón render-sidebar): defaults, metadatos de
 * campos (label/ayuda/tipo/límites) y validación. El controlador (parametros.js)
 * solo cablea. La frontera REAL es la regla `config/cartera` write owner-only.
 *
 * Los DEFAULTS espejan el seed (functions/seed-config-cartera.mjs) y la política
 * de cartera v1 aprobada. "Restaurar" en la UI vuelve a estos valores.
 */

export const DEFAULTS = {
    autoAprobacionMax: 50000,
    slaRevisionDias: 2,
    // plazoDefault: LEGACY. El plazo REAL de vencimiento/mora/aging/corte es
    // `config/negocio.diasPlazo` (F-IA-2 §0.7 D7 · H1: `plazoDefault` no tenía lectores).
    // Se retira de la UI (sección `plazos` fuera de SECCIONES) pero el default se conserva
    // (límite de guardián: no se borra el dato del doc). NO editable desde el panel.
    plazoDefault: 30,
    criteriosCastigo: {
        moraDias: 360,
        sinAbonosDias: 180,
        gestionesMin: 3,
        gestionesMesesDistintos: 3,
        materialidadAbonoPct: 1,
        materialidadAbonoPiso: 10000,
    },
    motivosAjuste: ['ERROR_REGISTRO', 'ABONO_NO_REGISTRADO', 'RECLASIFICACION',
                    'DEVOLUCION_PIEZA', 'DESCUENTO_AUTORIZADO', 'CASTIGO', 'OTRO'],
    motivosNeutros: ['ERROR_REGISTRO', 'ABONO_NO_REGISTRADO', 'RECLASIFICACION'],
    motivosAnulacion: ['ERROR_REGISTRO', 'DUPLICADO', 'CORRECCION', 'CORRECCION_FECHA',
                       'DEVOLUCION_PIEZA', 'OTRO'],
    mediosPago: ['efectivo', 'transferencia', 'datafono', 'otro'],
    resultadosGestion: ['promesa_pago', 'sin_acuerdo', 'no_contesto', 'numero_invalido', 'otro'],
};

/**
 * Secciones del panel: cada campo numérico con label/ayuda/sufijo/min/max
 * (lenguaje de negocio, no jerga — Kary no lo verá, pero Daniel tampoco es técnico).
 * `path` usa notación con punto para campos anidados (criteriosCastigo.*).
 */
export const SECCIONES = [
    {
        id: 'aprobaciones',
        titulo: 'Aprobaciones y topes',
        descripcion: 'Gobiernan qué puede hacer Kary sola y qué pasa por ti. (Política de cartera v1 §A.)',
        campos: [
            { path: 'autoAprobacionMax', label: 'Tope de auto-aprobación', sufijo: 'COP',
              ayuda: 'Ajustes "neutros" hasta este monto por transacción los aplica Kary sin pedirte aprobación. PROVISIONAL: recalibrar ~sept 2026 con 90 días de datos vivos.',
              min: 0, max: 10000000 },
            { path: 'slaRevisionDias', label: 'Plazo para revisar solicitudes', sufijo: 'días',
              ayuda: 'Tu compromiso de respuesta (48h acordado el 2026-06-10). Pasado este plazo, el panel marca la solicitud en rojo para ambos.',
              min: 1, max: 30 },
        ],
    },
    // Sección 'plazos' (plazoDefault) RETIRADA en F-IA-2 (§0.7 D7): el plazo real vive en
    // `config/negocio.diasPlazo`, editable desde la pestaña Cobranza de "Negocio y equipo".
    {
        id: 'castigo',
        titulo: 'Criterios de castigo (incobrables)',
        descripcion: 'Cuándo el sistema MARCA una cuenta como candidata a castigo. El sistema nunca castiga solo: marcar ≠ castigar; castigar siempre lo apruebas tú. (Política §C, exigencias DIAN art. 146 ET.)',
        campos: [
            { path: 'criteriosCastigo.moraDias', label: 'Días de mora mínimos', sufijo: 'días',
              ayuda: 'La deuda debe llevar al menos esto vencida (estándar: 360).', min: 90, max: 1800 },
            { path: 'criteriosCastigo.sinAbonosDias', label: 'Días sin abonos', sufijo: 'días',
              ayuda: 'Sin ningún pago material en este período (estándar: 180).', min: 30, max: 720 },
            { path: 'criteriosCastigo.gestionesMin', label: 'Gestiones de cobro mínimas', sufijo: 'gestiones',
              ayuda: 'Cobros documentados en el sistema (llamadas, WhatsApp, visitas) que exige el expediente.', min: 1, max: 12 },
            { path: 'criteriosCastigo.gestionesMesesDistintos', label: 'Meses distintos de gestión', sufijo: 'meses',
              ayuda: 'Las gestiones deben repartirse en este número de meses calendario distintos — tres llamadas la misma tarde no construyen expediente.', min: 1, max: 12 },
            { path: 'criteriosCastigo.materialidadAbonoPct', label: 'Materialidad del abono', sufijo: '% del saldo',
              ayuda: 'Un abono menor a este porcentaje NO reinicia el reloj de "sin abonos" (anti abono-simbólico que parquea cartera muerta).', min: 0, max: 100 },
            { path: 'criteriosCastigo.materialidadAbonoPiso', label: 'Piso de materialidad', sufijo: 'COP',
              ayuda: 'Mínimo absoluto en pesos para que un abono cuente como material.', min: 0, max: 10000000 },
        ],
    },
];

/** Listas editables (chips). `espejoUI`: la validación dura vive en las REGLAS. */
export const LISTAS = [
    { path: 'motivosAjuste', titulo: 'Motivos de ajuste', espejoUI: false,
      ayuda: 'Lista cerrada de la política §A.4. Todo ajuste debe llevar uno.' },
    { path: 'motivosNeutros', titulo: 'Motivos neutros (auto-aprobables)', espejoUI: false,
      ayuda: 'Subconjunto de los motivos de ajuste que Kary puede auto-aprobar bajo el tope.' },
    { path: 'motivosAnulacion', titulo: 'Motivos de anulación', espejoUI: false,
      ayuda: 'Por qué se anula un asiento (las correcciones enlazan el par anulado↔nuevo).' },
    { path: 'mediosPago', titulo: 'Medios de pago', espejoUI: true,
      ayuda: 'Cómo paga la clienta. ESPEJO DE PANTALLA: la validación dura vive en las reglas del servidor; cambiar aquí solo cambia las opciones visibles hasta el próximo despliegue de reglas.' },
    { path: 'resultadosGestion', titulo: 'Resultados de gestión de cobro', espejoUI: true,
      ayuda: 'Qué pasó en cada gestión. ESPEJO DE PANTALLA (igual que medios de pago).' },
];

/** Lee un path con puntos sobre un objeto. */
export function leerPath(obj, path) {
    return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

/** Escribe un path con puntos (devuelve copia superficial por nivel — sin mutar). */
export function escribirPath(obj, path, valor) {
    const partes = path.split('.');
    const out = { ...obj };
    let cur = out;
    for (let i = 0; i < partes.length - 1; i++) {
        cur[partes[i]] = { ...(cur[partes[i]] || {}) };
        cur = cur[partes[i]];
    }
    cur[partes.at(-1)] = valor;
    return out;
}

const SLUG = /^[a-z0-9_]+$/i;

/**
 * Valida la config completa antes de guardar.
 * @returns {{ ok: boolean, errores: string[] }}
 */
export function validarConfigCartera(data) {
    const errores = [];

    for (const sec of SECCIONES) {
        for (const c of sec.campos) {
            const v = leerPath(data, c.path);
            if (!Number.isInteger(v)) { errores.push(`"${c.label}" debe ser un número entero (sin decimales).`); continue; }
            if (v < c.min || v > c.max) errores.push(`"${c.label}" debe estar entre ${c.min} y ${c.max} ${c.sufijo}.`);
        }
    }

    for (const l of LISTAS) {
        const arr = leerPath(data, l.path);
        if (!Array.isArray(arr) || arr.length === 0) { errores.push(`"${l.titulo}" no puede quedar vacía.`); continue; }
        if (arr.some((x) => typeof x !== 'string' || !SLUG.test(x))) {
            errores.push(`"${l.titulo}": cada valor debe ser una sola palabra (letras, números o _), sin espacios ni tildes.`);
        }
        if (new Set(arr).size !== arr.length) errores.push(`"${l.titulo}" tiene valores repetidos.`);
    }

    // Coherencia de la política: los neutros deben existir como motivo de ajuste.
    const ajuste = new Set(data.motivosAjuste || []);
    for (const n of data.motivosNeutros || []) {
        if (!ajuste.has(n)) errores.push(`El motivo neutro "${n}" no existe en la lista de motivos de ajuste.`);
    }
    // El carril auto-aprobable no puede incluir los motivos que SIEMPRE exigen a Daniel.
    for (const prohibido of ['DESCUENTO_AUTORIZADO', 'CASTIGO', 'OTRO']) {
        if ((data.motivosNeutros || []).includes(prohibido)) {
            errores.push(`"${prohibido}" no puede ser neutro: la política exige aprobación de Daniel siempre.`);
        }
    }

    return { ok: errores.length === 0, errores };
}
