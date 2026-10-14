/**
 * js/core/newsletter.js — El alta al newsletter, con UN solo dueño.
 *
 * POR QUÉ EXISTE ESTE ARCHIVO. El alta al newsletter estaba escrita TRES veces: el modal
 * (`js/components/email-modal.js`), la caja de la portada (`js/home/journal-preview.js`) y la del
 * Journal (`js/pages/journal.js`). El 2026-10-11 se arregló UNA —la del modal— y las otras dos se
 * quedaron atrás sin que nadie lo notara, porque nada las ataba.
 *
 * Lo que hacían las dos rezagadas, MEDIDO el 13-oct en los chunks que servía el sitio
 * (`home-DHxh5UUP.js` y `journal-ClZvwq5G.js`, 1 aparición de `bj-email-subscribed` y CERO de
 * `saveSubscription` en cada uno):
 *
 *     try { localStorage.setItem('bj-email-subscribed', email); } catch {}
 *     form.innerHTML = '<div class="hj-newsletter-thanks">Gracias. Te escribiremos pronto.</div>';
 *
 * Es decir: el correo se guardaba en el navegador DEL PROPIO VISITANTE, donde nadie de la casa lo
 * iba a leer jamás, y acto seguido se le prometía escribirle. Cada persona que se suscribió por
 * esas dos cajas es un lead que no existió nunca y una promesa que no se podía cumplir — que es
 * justo lo que la Ley 1480 castiga: lo anunciado obliga. Y encima disparaban el evento
 * `bj:email-subscribed`, que `js/analytics.js` cuenta como LEAD: la medición registraba
 * conversiones de correos que se tiraban a la basura.
 *
 * Tampoco pedían la autorización, así que ni queriendo habrían podido guardar: la regla
 * `subscriptionCreateValida()` de `firestore.rules` RECHAZA el documento sin `habeasData`.
 *
 * LA REGLA DE ESTE MÓDULO: la frase que se le muestra al titular, la prueba que se archiva y el
 * guardado viven en el MISMO sitio. La autorización solo vale si fue informada, y eso se juzga por
 * lo que el titular VIO; si el texto se escribe a mano en tres pantallas, el día que se corrija
 * una las otras dos siguen enseñando otra cosa y la prueba archivada deja de corresponder. Es la
 * misma doctrina de `js/core/habeas.js` para los formularios de lead, aplicada al newsletter.
 */

/**
 * La frase que autoriza. PREVIA y EXPRESA (la casilla nace vacía y es obligatoria: el silencio no
 * es autorización, Decreto 1377 art. 7), INFORMADA (dice su finalidad real, no una fórmula que lo
 * cubra todo) y REVOCABLE por un canal escrito DENTRO de la frase, no escondido en la política.
 */
export const TEXTO_AUTORIZACION =
    'Autorizo a Bersaglio Jewelry a guardar mi correo para escribirme sobre sus piezas y '
    + 'novedades. Puedo pedir que lo borren cuando quiera, escribiendo al mismo correo.';

/**
 * La casilla, ya montada. El enlace a la política va FUERA de la frase archivada —es navegación,
 * no parte de lo que se autoriza—, así que lo guardado y lo visible siguen coincidiendo.
 * @returns {string} HTML
 */
export function casillaNewsletterHtml() {
    return `<label class="bj-email-habeas">
                <input type="checkbox" name="habeas" required>
                <span>${TEXTO_AUTORIZACION} <a href="/privacidad.html" target="_blank" rel="noopener">Cómo tratamos tus datos</a>.</span>
            </label>`;
}

/**
 * Guarda la suscripción. LANZA si no se pudo: quien llama tiene que decidir qué enseñar, y lo que
 * NUNCA puede enseñar es un «gracias» sobre un fallo.
 *
 * ⚠️ Firebase entra por `import()` DINÁMICO, no arriba del archivo. Es deliberado y lo heredamos
 * del modal, que ya lo hacía: este módulo lo importan la portada y el Journal para pintar la
 * casilla, y un import estático metería el SDK entero (≈637 KB sin comprimir) en el primer
 * paquete de la página más visitada por una casilla que casi nadie marca. El coste se paga cuando
 * alguien se suscribe de verdad.
 *
 * @param {string} email   ya normalizado
 * @param {string} source  de qué caja vino, para que el panel sepa qué sitio convierte
 */
export async function suscribir(email, source) {
    const { saveSubscription } = await import('../firestore-service.js');
    const { FINALIDAD_VERSION } = await import('./consent.js');
    return conPlazo(saveSubscription({ email, source, politicaVersion: FINALIDAD_VERSION }));
}

/** Los segundos tras los que se deja de esperar a Firestore. El mismo plazo que usa Contacto. */
const PLAZO_MS = 9000;

/**
 * El plazo, y por qué un `.catch` no basta — lección ya pagada en este repo el 2026-10-12 y medida
 * en el navegador, no supuesta: hay DOS formas de fallar y solo una avisa.
 *   · Reglas de Firestore o datos inválidos → `addDoc` RECHAZA, y eso lo caza el `catch`.
 *   · Red caída → `addDoc` NO rechaza: Firestore ENCOLA la escritura y la promesa se queda
 *     pendiente indefinidamente. Sin plazo, el botón se queda en «Guardando…» para siempre y el
 *     visitante se va sin saber si quedó suscrito.
 *
 * Contrapartida asumida a conciencia: si la red vuelve, la escritura encolada puede llegar DESPUÉS
 * de haberle dicho que no pudimos, y si entre tanto lo intentó otra vez quedan dos filas con el
 * mismo correo. Un duplicado en una lista de suscriptores se borra desde el panel en diez
 * segundos; un suscriptor perdido en silencio no se recupera nunca. Se elige el duplicado.
 */
function conPlazo(promesa) {
    return Promise.race([
        promesa,
        new Promise((_, rechazar) => setTimeout(
            () => rechazar(new Error('[newsletter] Firestore no confirmó el alta en ' + (PLAZO_MS / 1000) + ' s')),
            PLAZO_MS)),
    ]);
}

/**
 * Engancha TODA caja de newsletter en línea (`<form data-newsletter>`): la de la portada y la del
 * Journal. El modal tiene su propio submit porque además gobierna su ventana, pero come del mismo
 * texto y del mismo `suscribir()`.
 *
 * Idempotente: marca el formulario enganchado, porque `refreshJournalPreview()` vuelve a montar la
 * sección y llamaba a `init` otra vez — y dos oyentes sobre el mismo submit guardaban dos veces.
 */
export function initNewsletterForms() {
    document.querySelectorAll('form[data-newsletter]').forEach(form => {
        if (form.dataset.newsletterReady) return;
        form.dataset.newsletterReady = '1';
        form.addEventListener('submit', onSubmit);
    });
}

async function onSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.querySelector('input[type="email"]');
    const habeas = form.querySelector('input[name="habeas"]');
    const boton = form.querySelector('button[type="submit"], button');

    if (!input?.checkValidity()) { input?.reportValidity(); return; }
    // El acto expreso. Sin él no se envía nada: el consentimiento tácito está prohibido
    // (Ley 1581 + Decreto 1377) y además la regla de Firestore rechazaría el documento.
    if (!habeas?.checked) { habeas?.reportValidity(); return; }

    const email = input.value.trim().toLowerCase();
    const etiquetaOriginal = boton?.textContent;
    if (boton) { boton.disabled = true; boton.textContent = 'Guardando…'; }

    try {
        await suscribir(email, form.dataset.newsletter || 'web');
    } catch (err) {
        // Y si no llega, se dice. Un «gracias» sobre un fallo es exactamente la mentira que este
        // archivo vino a quitar. El correo escrito se queda en el campo: no hay que reescribirlo.
        console.warn('[newsletter] no se pudo guardar la suscripción:', err?.code || err?.message || err);
        if (boton) { boton.disabled = false; boton.textContent = etiquetaOriginal; }
        mostrarAviso(form, 'No pudimos guardar tu correo ahora mismo. Inténtalo en un momento, o '
            + 'escríbenos por WhatsApp y te anotamos nosotros.');
        return;
    }

    // El evento se dispara AQUÍ y no antes: `js/analytics.js` lo cuenta como LEAD, y un lead que
    // no se guardó no es un lead.
    try { localStorage.setItem('bj-email-subscribed', email); } catch {}
    document.dispatchEvent(new CustomEvent('bj:email-subscribed', { detail: email }));
    form.innerHTML = '<div class="hj-newsletter-thanks">Gracias. Te escribiremos cuando haya algo que de verdad valga la pena contarte.</div>';
}

/** Un aviso junto al formulario, sin tocar lo que el visitante ya escribió. */
function mostrarAviso(form, mensaje) {
    let aviso = form.querySelector('.hj-newsletter-thanks[role="alert"]');
    if (!aviso) {
        aviso = document.createElement('div');
        aviso.className = 'hj-newsletter-thanks';
        aviso.setAttribute('role', 'alert');
        form.appendChild(aviso);
    }
    aviso.textContent = mensaje;   // textContent: el mensaje es nuestro, pero la frontera se respeta igual
}

export default { TEXTO_AUTORIZACION, casillaNewsletterHtml, suscribir, initNewsletterForms };
