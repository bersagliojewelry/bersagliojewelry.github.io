/**
 * Bersaglio Jewelry — Consentimiento de cookies: DUEÑO ÚNICO del estado.
 *
 * Por qué existe (auditoría de medición, 2026-10-09): la llave `bj-cookie-consent` estaba escrita
 * en TRES sitios (`components/cookie-banner.js`, la constante de `analytics.js` y una cadena suelta
 * dentro de `loadGA4`), y el flujo usa DOS vocabularios para la misma cosa: se GUARDA
 * 'accepted'/'declined' y se EMITE 'accept'/'decline'. Confundirlos deja la compuerta de Meta
 * abierta sin que se note. Aquí viven la llave y la traducción, UNA sola vez, y nadie más toca
 * `localStorage` para esto. El control de "Preferencias de cookies" de la política habría sido el
 * cuarto dueño; por eso se extrajo antes de escribirlo.
 *
 * Puro salvo el `dispatchEvent`: no importa nada del proyecto y es testeable por fuente.
 * Ver `docs/46-MEDICION-WEB.md §3` en el cerebro.
 */

const KEY = 'bj-cookie-consent';
const KEY_VERSION = 'bj-cookie-consent-v';

/** El evento que escucha `analytics.js`. Único emisor: `setConsent()` de este módulo. */
export const CONSENT_EVENT = 'bj:cookie-consent';

/**
 * Versión de la FINALIDAD declarada al visitante. Sube cuando cambia PARA QUÉ se usan los datos
 * —no cuando se corrige una coma—, y al subir INVALIDA todo lo consentido antes.
 *
 * Por qué (verificado en fuente oficial el 2026-10-09, Gestor Normativo de Función Pública):
 * el reglamento de la Ley 1581 obliga a obtener una autorización NUEVA cuando el cambio se refiere
 * a la finalidad del tratamiento. Añadir publicidad personalizada ES un cambio de finalidad, y
 * agravado: quien pulsó "Aceptar" antes lo hizo frente a una política que prometía lo contrario
 * ("Nunca usamos datos individuales para perfilamiento publicitario"). Arrastrar ese permiso a la
 * finalidad nueva sería tratar datos sin autorización.
 *
 * '2026-10-09' es la primera versión que declara publicidad personalizada (Google y Meta). Todo lo
 * guardado antes se lee como "sin decidir": se vuelve a preguntar y, hasta que respondan, NO se
 * carga nada de Meta ni de Hotjar.
 */
export const FINALIDAD_VERSION = '2026-10-09';

const ES_DECISION = v => v === 'accepted' || v === 'declined';

/**
 * Cookies de IDENTIFICACIÓN que los terceros dejan en NUESTRO dominio (Meta las pone como
 * first-party: `first_party_cookie_enabled` en el dataset 1574327787292205, verificado 2026-10-09).
 * Medido el 2026-10-09: el sitio NO pone ni una cookie propia — todo lo suyo vive en `localStorage`
 * con prefijo `bj-` — así que borrar por estos prefijos no puede alcanzar nada nuestro.
 */
const PREFIJOS_DE_TERCEROS = ['_fbp', '_fbc', '_ga', '_gid', '_gat', '_gcl_'];
/** Cinturón: pase lo que pase, estos nunca se borran (lo nuestro y lo de Firebase). */
const NUNCA_BORRAR = n => n.startsWith('bj-') || n.startsWith('bj_') || n.startsWith('__');

/**
 * La decisión VIGENTE, es decir la tomada sobre la finalidad que hoy se declara.
 * Una decisión anterior al cambio de finalidad no cuenta: devuelve null, el banner vuelve a
 * preguntar y mientras tanto no se carga nada.
 * @returns {'accepted'|'declined'|null} null = no ha decidido sobre lo que hoy se le pide.
 */
export function getConsent() {
    try {
        const valor = localStorage.getItem(KEY);
        if (!ES_DECISION(valor)) return null;
        if (localStorage.getItem(KEY_VERSION) !== FINALIDAD_VERSION) return null;
        return valor;
    } catch { return null; }
}

/**
 * Si su decisión caducó, CUÁL fue. Hace falta porque no se le habla igual a quien dijo que sí que a
 * quien dijo que no: a este último hay que empezar reconociéndole que se le respetó, o la
 * re-pregunta se lee como que el sitio ignoró su "no".
 * @returns {'accepted'|'declined'|null}
 */
export function decisionAnterior() {
    try {
        const valor = localStorage.getItem(KEY);
        if (!ES_DECISION(valor)) return null;
        return localStorage.getItem(KEY_VERSION) !== FINALIDAD_VERSION ? valor : null;
    } catch { return null; }
}

/**
 * ¿Decidió antes, pero sobre una finalidad que ya no es la que declaramos?
 * Sirve para decírselo con esas palabras en vez de volver a preguntar como si nunca hubiera
 * contestado: la autorización tiene que ser INFORMADA, y aquí lo informado es justo que la
 * finalidad cambió.
 */
export function decisionCaducada() {
    try {
        if (!ES_DECISION(localStorage.getItem(KEY))) return false;
        return localStorage.getItem(KEY_VERSION) !== FINALIDAD_VERSION;
    } catch { return false; }
}

/** ¿ACEPTÓ? Única verdad para los terceros que ponen identificadores y no tienen modo sin-cookies. */
export function hasConsent() {
    return getConsent() === 'accepted';
}

/** ¿Ya decidió algo (sí o no)? Lo usa el banner para no volver a preguntar. */
export function hasDecided() {
    const v = getConsent();
    return v === 'accepted' || v === 'declined';
}

/**
 * Guarda la decisión y AVISA. Único emisor del evento en todo el sitio.
 * @param {'accepted'|'declined'} valor
 * @returns {boolean} false si el valor no era válido (no se guarda ni se avisa nada).
 */
export function setConsent(valor) {
    if (!ES_DECISION(valor)) return false;
    try {
        localStorage.setItem(KEY, valor);
        // Se sella CON la finalidad sobre la que decidió. Sin el sello, el día que cambie la
        // finalidad no habría forma de distinguir este permiso del que se dio para otra cosa.
        localStorage.setItem(KEY_VERSION, FINALIDAD_VERSION);
    } catch { /* modo privado → la decisión no sobrevive */ }
    // La traducción guardado → emitido vive AQUÍ y solo aquí. Era la trampa del flujo.
    ultimoPropagado = valor;   // esta pestaña ya lo sabe: que el oyente de `storage` no lo repita
    const detail = valor === 'accepted' ? 'accept' : 'decline';
    document.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail }));
    return true;
}

/**
 * Borra las cookies de identificación que Google y Meta dejaron en nuestro dominio.
 *
 * Sin esto, "revocar" sería cosmético: `fbq('consent','revoke')` le dice a Meta que pare, pero el
 * `_fbp` que ya identifica a esta persona se queda en el navegador meses. La política promete
 * revocar de verdad, así que esto borra el identificador, no solo apaga el grifo.
 *
 * Se intenta con y sin `domain` porque una cookie puesta en `.dominio.co` no se borra con la
 * cabecera sin dominio, y al revés.
 * @returns {number} cuántos nombres de cookie se intentaron borrar.
 */
export function borrarCookiesDeTerceros() {
    let crudo = '';
    try { crudo = document.cookie || ''; } catch { return 0; }

    const nombres = crudo.split(';')
        .map(trozo => trozo.split('=')[0].trim())
        .filter(n => n && !NUNCA_BORRAR(n) && PREFIJOS_DE_TERCEROS.some(p => n === p || n.startsWith(p)));
    if (!nombres.length) return 0;

    const host = (typeof location !== 'undefined' && location.hostname) || '';
    const partes = host.split('.');
    const dominios = ['', host, '.' + host];
    if (partes.length > 2) dominios.push('.' + partes.slice(-2).join('.'));

    for (const nombre of nombres) {
        for (const d of dominios) {
            const dom = d ? `; domain=${d}` : '';
            try {
                document.cookie = `${nombre}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${dom}`;
            } catch { /* nada que hacer: seguimos con el resto */ }
        }
    }
    return nombres.length;
}

/* Una decisión tomada en OTRA pestaña tiene que llegar hasta aquí. Un CustomEvent no sale de su
   propio documento, así que sin esto pasa lo siguiente, que es cotidiano en un catálogo donde se
   abren piezas en pestañas nuevas: el visitante rechaza en la pestaña A —se revoca y se borra el
   `_fbp`— y la pestaña B sigue con el pixel cargado y lo vuelve a crear en el siguiente evento.
   `storage` dispara SOLO en las demás pestañas del mismo origen, que es justo lo que hace falta. */
let ultimoPropagado = null;
if (typeof window !== 'undefined') {
    window.addEventListener('storage', e => {
        if (e.key !== KEY && e.key !== KEY_VERSION) return;
        const valor = getConsent();
        if (!valor || valor === ultimoPropagado) return;   // la llave y su versión llegan en dos eventos
        ultimoPropagado = valor;
        document.dispatchEvent(new CustomEvent(CONSENT_EVENT, {
            detail: valor === 'accepted' ? 'accept' : 'decline',
        }));
    });
}

export default {
    getConsent, hasConsent, hasDecided, decisionCaducada, decisionAnterior, setConsent,
    borrarCookiesDeTerceros, CONSENT_EVENT, FINALIDAD_VERSION,
};
