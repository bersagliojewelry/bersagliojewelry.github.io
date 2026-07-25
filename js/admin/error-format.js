/**
 * js/admin/error-format.js — Traductor PURO de errores → mensaje para el usuario.
 *
 * Vivía dentro de `shared.js` (que importa auth/db/firestore-service en el tope → intesteable
 * en Node). Extraído a helper puro con test (patrón `caja-format`/`hoy-format`); `shared.js`
 * lo RE-EXPORTA, así que ningún callsite cambia (§3.2 API estable).
 *
 * Dos trabajos:
 *  1. Un error de PERMISOS no debe mostrarse como "conexión" (caso real §117: subida rechazada
 *     por rol → el toast decía "Verifica tu conexión"). Mapea el `code` REAL de Firebase
 *     (Auth/Firestore/Storage) a un mensaje claro Y SIEMPRE loguea el code para diagnóstico.
 *  2. TODO-79: el motivo REAL que rechazó el servidor debe llegarle a Kary. El SDK de callables
 *     PREFIJA el code (`functions/failed-precondition`), así que las tablas y los
 *     `BUSINESS_ERR.includes(err.code)` de cada módulo NUNCA acertaban → todo rechazo de una CF
 *     se veía como el genérico "Ocurrió un error", y el microcopy de dinero (qué pasó + qué pasó
 *     con la plata + qué hacer) se perdía justo donde más importa. Cazado en el E2E de D6.
 *
 * Uso: `admToast(errorMessage(err, 'No se pudo subir la imagen.'), 'danger');`
 */

const PREFIJO_CALLABLE = 'functions/';

const ERROR_MESSAGES = {
    // Permisos / sesión
    'permission-denied':            'No tienes permiso para esta acción.',
    'storage/unauthorized':         'No tienes permiso para subir o borrar esta imagen.',
    'unauthenticated':              'Tu sesión expiró. Cierra sesión y vuelve a entrar.',
    'storage/unauthenticated':      'Tu sesión expiró. Cierra sesión y vuelve a entrar.',
    // Conexión / red / tiempo
    'unavailable':                  'Sin conexión con el servidor. Revisa tu internet y reintenta.',
    'deadline-exceeded':            'La operación tardó demasiado. Revisa tu conexión y reintenta.',
    'storage/retry-limit-exceeded': 'Problema de conexión al subir. Reintenta.',
    'storage/canceled':             'Subida cancelada.',
    'storage/unknown':              'No se pudo subir (conexión o configuración). Reintenta.',
    // Cuota / límites
    'storage/quota-exceeded':       'El almacenamiento está lleno. Avisa al administrador.',
    'resource-exhausted':           'Se alcanzó un límite del servicio. Intenta más tarde.',
    // Datos / concurrencia
    'not-found':                    'El elemento ya no existe (lo borró otra persona).',
    'storage/object-not-found':     'La imagen ya no existe.',
    'already-exists':               'Ya existe un elemento con ese identificador.',
    'id-collision':                 'Ya existe un elemento con ese identificador.',
    'failed-precondition':          'No se pudo completar: el estado cambió. Recarga e intenta.',
    'aborted':                      'Otra persona lo modificó al mismo tiempo. Recarga e intenta.',
    'version-conflict':             'Otra persona lo modificó mientras editabas. Recarga para ver los cambios.',
    'invalid-argument':             'Hay un dato inválido. Revisa el formulario.',
};

// Codes con los que NUESTRAS CFs rechazan por REGLA DE NEGOCIO: su `message` está escrito en
// voz-panel es-CO y dice qué hacer ("La caja no está abierta: ábrela en el Mostrador…") → vale
// MÁS que cualquier texto genérico. `internal`/`unknown` NO están aquí a propósito: ahí el
// message es una traza técnica que no se le muestra a la usuaria.
const BUSINESS_CODES = new Set([
    'failed-precondition', 'invalid-argument', 'not-found', 'already-exists', 'permission-denied',
]);

/**
 * Code normalizado SIN el prefijo que el SDK de callables añade.
 * 'functions/failed-precondition' → 'failed-precondition'; los de Firestore/Storage intactos.
 * @param {*} err
 * @returns {string}
 */
export function errorCode(err) {
    const raw = (err && (err.code || err.name)) || '';
    return raw.startsWith(PREFIJO_CALLABLE) ? raw.slice(PREFIJO_CALLABLE.length) : raw;
}

/** ¿El error viene de una Cloud Function callable? (lo delata el prefijo del SDK). */
export function esErrorDeCallable(err) {
    const raw = (err && (err.code || err.name)) || '';
    return raw.startsWith(PREFIJO_CALLABLE);
}

/**
 * Traduce un error al mensaje que ve la usuaria y loguea el code real.
 *
 * Prioridad: (1) motivo del SERVIDOR si es un rechazo de negocio de una CF nuestra —
 * es el único que sabe qué pasó con la plata; (2) mensaje curado por code; (3) fallback del
 * callsite. Un `permission-denied` de las REGLAS de Firestore no entra por (1) (su message es
 * "Missing or insufficient permissions", ruido) → cae al curado.
 *
 * @param {*} err error capturado (callable, Firestore, Storage, Auth u otro)
 * @param {string} [fallback] mensaje si el code no está mapeado
 * @returns {string} mensaje claro para el toast
 */
export function errorMessage(err, fallback = 'Ocurrió un error. Reintenta.') {
    const raw = (err && (err.code || err.name)) || '';
    const code = errorCode(err);
    console.error('[admin] error:', raw || '(sin code)', err?.message || err);   // SIEMPRE el code real
    const delServidor = err?.message ? String(err.message).trim() : '';
    if (esErrorDeCallable(err) && BUSINESS_CODES.has(code) && delServidor) return delServidor;
    return ERROR_MESSAGES[code] || fallback;
}

export default { errorCode, esErrorDeCallable, errorMessage };
