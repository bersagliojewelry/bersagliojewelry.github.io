/**
 * tests/contacto-render.test.mjs — El motor de Contacto (js/pages/contacto-render.js).
 *
 * Qué defiende, y por qué se escribió el 2026-10-13:
 *
 *   1. QUE SE PUEDA IMPORTAR DESDE NODE. Es la condición de todo lo demás: el generador del SSG
 *      corre en Node y no tiene `document` ni Firebase. El día que alguien meta aquí un import de
 *      `data.js` o un `document.querySelector`, el build se cae — y este test se cae antes, en
 *      medio segundo, diciendo por qué. Los dos hermanos mayores (journal-render, nosotros-render)
 *      tienen la misma frontera.
 *
 *   2. QUE LO HORNEADO SEA EL PRIMER PAINT. El valor de tener UN motor es que el HTML del `dist` y
 *      el que pinta el navegador sean el mismo; si divergen, al hidratar se ve un salto. Por eso
 *      se clava que `renderContacto(c, g)` sin estado = el estado inicial explícito.
 *
 *   3. EL RENGLÓN «ABIERTO HOY». Es la única parte de la página que depende del día, y el build
 *      hornea un día que no es el del visitante. Hoy no miente porque los siete días dicen lo
 *      mismo. El test de abajo es el que avisa el día que dejen de decirlo: si el horario deja de
 *      ser uniforme, hornear ese renglón pasa a ser publicar una hora falsa.
 *
 *   4. EL NAP EN EL CUERPO. La dirección y los siete días son lo más valioso de esta página para
 *      una búsqueda local, y hasta hoy vivían SOLO en el JSON-LD del `<head>`. Si alguien vuelve a
 *      sacarlos del `<main>`, se pierde la mitad de la señal sin que se note en pantalla.
 *
 *   5. EL ESCAPADO. El copy sale de un `<textarea>` del panel. Repo público ⇒ frontera XSS.
 *
 *   6. LA CASILLA DE HABEAS DATA. La autorización tiene que estar en los TRES formularios, vacía y
 *      obligatoria (Ley 1581 art. 9 + Decreto 1377 art. 7). Que ahora el HTML se hornee no la puede
 *      dejar fuera de ninguno.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
    renderContacto, renderSidebar, renderFormCard, renderCanales, renderTabBar,
    contactoHeroSection, contactoProcesoSection, contactoFaqSection,
    HORARIOS, FORM_VACIO, VISITA_VACIA, LLAMADA_VACIA,
} from '../js/pages/contacto-render.js';
import { mergeContacto } from '../js/pages/contacto-defaults.js';
import { mergeGlobal } from '../js/core/global-defaults.js';

const C = mergeContacto(null);
const G = mergeGlobal(null).contacto;

const texto = (h) => h.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

// ── 1. La frontera: Node, sin DOM ni Firebase ─────────────────────────────────

test('frontera: el módulo se importa y pinta en Node, sin document ni Firebase', () => {
    // Si este test llega a correr es que el import de arriba funcionó. Lo que falta por comprobar
    // es que PINTAR tampoco toca el DOM: `fragment()`/`mount()` de core/html.js sí usan
    // `document`, y colarlos aquí rompería el build sin romper nada en el navegador.
    assert.equal(typeof globalThis.document, 'undefined', 'el entorno del test no debe tener DOM');
    const out = renderContacto(C, G);
    assert.ok(out.length > 5000, `el cuerpo de Contacto debería pasar de 5.000 caracteres y da ${out.length}`);
    assert.ok(out.startsWith('\n        <div class="container ct-page">') || out.includes('<div class="container ct-page">'));
});

// ── 2. Lo horneado = el primer paint ──────────────────────────────────────────

test('horneado: sin estado se pinta EXACTAMENTE el primer paint del navegador', () => {
    // El build llama `renderContacto(c, g, { minDate })` y nada más. El navegador, en su primer
    // paint sin borrador guardado, tiene este estado. Los dos HTML tienen que ser el mismo byte a
    // byte: si divergen, al hidratar se ve un salto.
    const sinEstado = renderContacto(C, G, { minDate: '2026-10-15' });
    const explicito = renderContacto(C, G, {
        tab: 'mensaje', sent: false, sendFailed: false,
        form: FORM_VACIO, visit: VISITA_VACIA, call: LLAMADA_VACIA,
        minDate: '2026-10-15', todayIdx: 0,
    });
    assert.equal(sinEstado, explicito);
});

test('horneado: el render es idempotente — dos llamadas iguales dan el mismo HTML', () => {
    assert.equal(renderContacto(C, G, { minDate: '2026-10-15' }), renderContacto(C, G, { minDate: '2026-10-15' }));
});

test('horneado: la fecha mínima de la cita entra por parámetro, no por el reloj', () => {
    const out = renderContacto(C, G, { tab: 'visita', minDate: '2026-12-24' });
    assert.ok(out.includes('min="2026-12-24"'), 'el `min` del input de fecha debe ser el que se le pasa');
});

// ── 3. El renglón que depende del día ─────────────────────────────────────────

test('horario: «Abierto hoy» NO depende del día — si deja de ser así, el horneado mentiría', () => {
    // El build no sabe qué día abrirá la página el visitante: hornea `todayIdx: 0`. Eso es legítimo
    // SOLO mientras los siete días digan lo mismo. Este test es el centinela de esa condición.
    const lunes = renderSidebar(0);
    for (let i = 1; i < 7; i++) {
        assert.equal(renderSidebar(i), lunes,
            `el lateral del día ${i} (${HORARIOS[i].d}) difiere del lunes. El horario dejó de ser uniforme, `
            + 'así que hornear «Abierto hoy» en el build publica una hora que puede ser falsa. '
            + 'Antes de cambiar este test: o el renglón se calcula en el navegador, o se retira del horneado.');
    }
});

test('horario: un índice fuera de rango no revienta el render (cae al lunes)', () => {
    assert.equal(renderSidebar(99), renderSidebar(0));
    assert.equal(renderSidebar(-1), renderSidebar(0));
});

// ── 4. El NAP dentro del <main> ───────────────────────────────────────────────

test('NAP: la dirección y los siete días viajan en el CUERPO, no solo en el JSON-LD', () => {
    const t = texto(renderContacto(C, G));
    assert.ok(t.includes('Calle 36 # 6-32'), 'falta la calle');
    assert.ok(t.includes('Centro Histórico'), 'falta el barrio');
    assert.ok(t.includes('Cartagena de Indias'), 'falta la ciudad');
    for (const h of HORARIOS) {
        assert.ok(t.includes(h.d), `falta el día ${h.d} en el cuerpo`);
    }
    assert.ok(t.includes('09:30 – 19:00'), 'falta el horario en el cuerpo');
});

test('NAP: los tres canales salen de la fuente única, no escritos a mano', () => {
    const g = { whatsapp: '+57 300 000 0000', email: 'otro@ejemplo.co', instagram: '@otro_handle' };
    const out = renderCanales(g);
    assert.ok(out.includes('+57 300 000 0000'), 'el WhatsApp mostrado debe venir del dato');
    assert.ok(out.includes('https://wa.me/573000000000'), 'el href de WhatsApp se deriva del dato');
    assert.ok(out.includes('mailto:otro@ejemplo.co'));
    assert.ok(out.includes('otro_handle'));
});

test('NAP: el WhatsApp del CTA del FAQ también deriva del dato global', () => {
    const out = renderContacto(C, { ...G, whatsapp: '+57 311 222 3344' });
    assert.ok(out.includes('https://wa.me/573112223344'), 'el CTA del FAQ debe usar el número vigente');
});

// ── 5. Escapado (frontera XSS: el copy lo teclea una persona en el panel) ─────

test('escapado: nada tecleado en el panel puede salir como HTML', () => {
    const veneno = '<img src=x onerror=alert(1)>';
    const sucio = mergeContacto({
        hero:    { eyebrow: veneno, titleLine1: veneno, titleEm: veneno, titleTail: veneno, lead: veneno },
        proceso: { eyebrow: veneno, title1: veneno, step1Title: veneno, step1Desc: veneno },
        faq:     { eyebrow: veneno, title1: veneno, lead: veneno, q1: veneno, a1: veneno },
    });
    const out = renderContacto(sucio, G);
    assert.ok(!out.includes('<img src=x'), 'el marcado del panel salió crudo');
    assert.ok(out.includes('&lt;img src=x'), 'debería salir escapado');
    assert.ok(!/onerror=alert/.test(out.replace(/&lt;[^&]*&gt;/g, '')), 'no puede quedar un manejador vivo');
});

test('escapado: el valor que el visitante escribió vuelve escapado al repintarse', () => {
    // El borrador del `sessionStorage` vuelve al markup por `value="..."`. Es el mismo visitante,
    // pero un enlace preparado puede sembrarlo: la frontera se respeta igual.
    const out = renderFormCard({
        tab: 'mensaje', sent: false, sendFailed: false,
        form: { ...FORM_VACIO, n: '" autofocus onfocus="alert(1)' },
        visit: VISITA_VACIA, call: LLAMADA_VACIA, minDate: '2026-10-15',
    });
    assert.ok(!out.includes('onfocus="alert(1)"'), 'el atributo se rompió y quedó un manejador vivo');
    assert.ok(out.includes('&quot;'), 'la comilla debería venir escapada');
});

// ── 6. La autorización de datos, en los tres formularios ─────────────────────

test('habeas data: los TRES formularios hornean su casilla, vacía y obligatoria', () => {
    for (const tab of ['mensaje', 'visita', 'llamada']) {
        const out = renderFormCard({
            tab, sent: false, sendFailed: false,
            form: FORM_VACIO, visit: VISITA_VACIA, call: LLAMADA_VACIA, minDate: '2026-10-15',
        });
        assert.ok(out.includes('class="bj-habeas"'), `el formulario «${tab}» se horneó sin la casilla`);
        assert.ok(out.includes('name="habeas" required'), `la casilla de «${tab}» no es obligatoria`);
        assert.ok(!out.includes('name="habeas" checked'), `la casilla de «${tab}» no puede nacer marcada`);
        assert.ok(out.includes('Autorizo a Bersaglio Jewelry'), `falta la frase informada en «${tab}»`);
    }
});

// ── 7. Las pestañas y los dos desenlaces ─────────────────────────────────────

test('pestañas: la abierta manda, y solo ella queda activa', () => {
    assert.ok(renderTabBar('visita').includes('data-tab="visita"'));
    const activos = [...renderTabBar('visita').matchAll(/is-active/g)];
    assert.equal(activos.length, 1, 'solo una pestaña puede estar activa');
    assert.ok(renderTabBar('visita').includes('aria-selected="true"'));
});

test('pestañas: cada una pinta SU formulario', () => {
    const card = (tab) => renderFormCard({
        tab, sent: false, sendFailed: false,
        form: FORM_VACIO, visit: VISITA_VACIA, call: LLAMADA_VACIA, minDate: '2026-10-15',
    });
    assert.ok(card('mensaje').includes('data-form="mensaje"'));
    assert.ok(card('visita').includes('Cita Privada en la Maison'));
    assert.ok(card('llamada').includes('Llamada Confidencial'));
});

test('desenlace: el éxito saluda por el nombre; el fallo retira la promesa y da WhatsApp', () => {
    const base = {
        sent: true, form: { ...FORM_VACIO, n: 'Ana' }, visit: VISITA_VACIA, call: LLAMADA_VACIA,
        minDate: '2026-10-15',
    };
    const ok = renderFormCard({ ...base, tab: 'mensaje', sendFailed: false });
    assert.ok(texto(ok).includes('Recibido, Ana'));

    const mal = renderFormCard({ ...base, tab: 'mensaje', sendFailed: true });
    assert.ok(texto(mal).includes('Perdónanos, Ana'));
    assert.ok(!texto(mal).includes('Recibido'), 'no puede quedar la promesa de recibido al lado del fallo');
    assert.ok(mal.includes('wa.me/573013752592'), 'el fallo tiene que ofrecer el canal que sí contesta');
});

test('desenlace: sin nombre, el saludo no queda cojo', () => {
    const out = renderFormCard({
        tab: 'mensaje', sent: true, sendFailed: false,
        form: FORM_VACIO, visit: VISITA_VACIA, call: LLAMADA_VACIA, minDate: '2026-10-15',
    });
    assert.ok(texto(out).includes('Recibido, distinguido huésped'));
});

// ── 8. Las secciones de copy que comparte el preview del panel ───────────────

test('CMS: las tres secciones de copy pintan lo que se les pasa y nada más', () => {
    assert.ok(texto(contactoHeroSection(C.hero)).includes(C.hero.eyebrow));
    assert.ok(texto(contactoProcesoSection(C.proceso)).includes(C.proceso.step1Title));
    assert.ok(texto(contactoFaqSection(C.faq)).includes(C.faq.q1));
});
