/**
 * Bersaglio Jewelry — Banner de consentimiento de cookies.
 *
 * Glass-pill flotando abajo al centro. Solo aparece si el visitante no ha decidido SOBRE LA
 * FINALIDAD QUE HOY SE DECLARA (ver `FINALIDAD_VERSION` en `core/consent.js`); el estado y su
 * versión son de ese módulo, no de aquí.
 *
 * El texto es el aviso que se le muestra EN EL MOMENTO de pedirle el permiso, así que tiene que
 * nombrar la finalidad concreta: la autorización de la Ley 1581 debe ser previa, expresa e
 * informada, y lo informado se juzga por lo que el visitante VIO, no por lo que quedó guardado.
 * Cada versión de este texto se archiva con su fecha en el cerebro (`docs/46-MEDICION-WEB §3`),
 * porque es la prueba de qué se informó a quien aceptó bajo ella.
 *
 * Lazy: el DOM solo se inserta si el banner debe mostrarse.
 */

import { html } from '../core/html.js';
// El estado del consentimiento NO vive aquí: su dueño único es `core/consent.js`, que también es
// el único que emite `bj:cookie-consent`. Este banner solo pregunta y le pasa la respuesta.
import { hasDecided, setConsent, decisionAnterior, CONSENT_EVENT } from '../core/consent.js';

/* TRES avisos, porque son tres situaciones y mezclarlas seria desinformar:
   · PRIMERA   — nunca ha decidido.
   · YA DIJO SI — acepto antes de que existiera la finalidad publicitaria.
   · YA DIJO NO — rechazo antes. A este hay que EMPEZAR reconociendole que se le respeto, o la
     re-pregunta se lee como que el sitio ignoro su "no". Y los tres llevan la misma garantia
     ("si dices que no, no se activa ninguna"): darsela solo al visitante nuevo seria darle MENOS
     seguridad justo a quien mas derecho tiene a sentirse pasado por encima.
   ⚠️ Nunca volver a la formula "al continuar aceptas": el silencio no es autorizacion, y eso no es
   criterio de diseño sino mandato expreso del reglamento de la Ley 1581.
   ⚠️ Y nunca prometer aqui que "no se carga nada": la medicion de Google arranca SIEMPRE, en modo
   restringido y sin cookies. Decirlo mal es el error que esta pagina vino justamente a corregir. */
const ENLACE = html`<a href="/privacidad.html#cookies">Cómo tratamos tus datos</a>`;

/* ✍️ REGLA DE REDACCIÓN (Daniel, 2026-10-12, tras rechazar la versión anterior: «suena muy mal, yo no
   aceptaría porque no entiendo»). Los tres avisos se escriben DESDE EL LADO DEL VISITANTE:
     1.º lo que él gana · 2.º qué pasa exactamente con sus datos · 3.º su libertad de decir que no.
   ⛔ Prohibido abrir con nuestra historia interna («esto es nuevo», «no se nos olvidó», «preferimos
   preguntártelo de frente»): el visitante no conoce nuestro proceso y una disculpa antes de una
   petición se lee como que algo se hizo mal. La transparencia es decir qué pasa, no enumerar nuestras
   razones; y la persuasión honesta está en el ORDEN, nunca en esconder el rechazo.
   ⚠️ Y se dice «cookies publicitarias» con su nombre: el `_fbp` de Meta y el `_ga` de Google SON
   cookies. La versión anterior abría con «no usamos cookies» —cierto solo de lo funcional, que va en
   localStorage— y en un aviso de cookies esa frase se lee como lo contrario de lo que es. */
const AVISO_PRIMERA = html`
    Nos gustaría seguir acompañándote después de esta visita. Si aceptas, usamos cookies publicitarias
    que comparten con Google y con Meta (Facebook e Instagram) las piezas que miras aquí: así sabemos
    qué despierta interés y podemos mostrarte las colecciones que se parecen a lo que te gustó. Sin tu
    permiso no se activa ninguna y no se comparte nada. Puedes cambiar de opinión cuando quieras, y el
    sitio funciona igual decidas lo que decidas. ${ENLACE}.`;

const AVISO_YA_DIJO_SI = html`
    Nos gustaría acompañarte también cuando ya no estés aquí. Si aceptas, usamos cookies publicitarias
    que comparten con Google y con Meta (Facebook e Instagram) las piezas que miras y si nos escribes,
    y así te mostramos nuestras colecciones donde ya pasas el rato. Es una finalidad nueva, que tu
    permiso anterior no cubría. Sin tu permiso no se activa ninguna, y aquí no cambia nada más.
    ${ENLACE}.`;

const AVISO_YA_DIJO_NO = html`
    Tu respuesta de antes se respetó y no se activó nada. Volvemos a preguntarte porque ahora hay algo
    distinto: con tu permiso, unas cookies publicitarias comparten con Google y con Meta (Facebook e
    Instagram) las piezas que miras aquí, para enseñarte nuestras colecciones fuera de este sitio. Si
    tu respuesta sigue siendo no, aquí no cambia nada. ${ENLACE}.`;

function avisoQueToca() {
    const antes = decisionAnterior();
    if (antes === 'accepted') return AVISO_YA_DIJO_SI;
    if (antes === 'declined') return AVISO_YA_DIJO_NO;
    return AVISO_PRIMERA;
}

function build() {
    const root = document.createElement('div');
    root.className = 'glass glass-pill bj-cookie-banner';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-label', 'Aviso de cookies');
    root.setAttribute('aria-live', 'polite');

    root.innerHTML = html`
        <p class="bj-cookie-text">${avisoQueToca()}</p>
        <div class="bj-cookie-actions">
            <button type="button" class="bj-cookie-btn bj-cookie-btn--decline" data-action="decline">
                Rechazar
            </button>
            <button type="button" class="bj-cookie-btn bj-cookie-btn--accept" data-action="accept">
                Aceptar
            </button>
        </div>`;

    const retirar = () => {
        // La compuerta se resuelve → libera al concierge (FAB asesoría) que estaba apartado.
        document.body.classList.remove('bj-cookie-active');
        root.classList.add('is-leaving');
        setTimeout(() => root.remove(), 350);
    };

    root.addEventListener('click', e => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;
        const action = btn.dataset.action;
        if (action === 'accept' || action === 'decline') {
            // Solo guarda; retirarse es trabajo del oyente de abajo, para que haya UN único camino
            // de cierre y la decisión tomada en otro sitio lo recorra igual.
            setConsent(action === 'accept' ? 'accepted' : 'declined');
        }
    });

    // La decisión puede llegar de OTRO sitio: en /privacidad.html el control de "Preferencias de
    // cookies" está visible a la vez que este banner. Medido el 2026-10-09 recorriendo ese camino:
    // sin este oyente el banner se queda preguntando lo ya respondido Y `bj-cookie-active` nunca se
    // quita, así que el FAB de asesoría queda apartado para siempre (§156.19).
    document.addEventListener(CONSENT_EVENT, retirar, { once: true });

    document.body.appendChild(root);
    // Compuerta de consentimiento presente → aparta el FAB de asesoría (ambos son flotantes
    // abajo-derecha y se pisaban en móvil; el toque de "Aceptar" caía en el FAB). El FAB reacciona
    // por CSS a esta bandera y vuelve al resolverse. (bug cookie/FAB — ver ADR §156.19.)
    document.body.classList.add('bj-cookie-active');
    requestAnimationFrame(() => root.classList.add('is-open'));
}

export function initCookieBanner() {
    if (hasDecided()) return; // ya decidió: puede cambiar de opinión en /privacidad.html#cookies
    // Se retrasa para no competir con el primer pintado. Se vuelve a preguntar al VENCER el plazo,
    // no solo al programarlo: en /privacidad.html el control de preferencias está visible desde el
    // primer instante, así que en esos 1,5 s el visitante ya puede haber decidido.
    setTimeout(() => { if (!hasDecided()) build(); }, 1500);
}

export default { initCookieBanner };
