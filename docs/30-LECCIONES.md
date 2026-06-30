# 🧪 30 — LECCIONES Y DOCTRINAS (Gotchas técnicos y recetas)

> **Nodo neuronal: Memoria Procedimental.** Se consulta on-demand ante el **Trigger de Experiencia (`CLAUDE.md §G.2`)** ANTES de realizar refactorizaciones CSS, editar el Service Worker o depurar comportamientos de renderizado.
>
> **Mantenimiento (Frescura §G.4)**: registra aquí cada causa raíz de bug complejo o doctrina visual. **Tope ~350 líneas (§G.5)**. 🔗 **Hija [`31-LECCIONES-FIRESTORE`](31-LECCIONES-FIRESTORE.md)** (Firestore/CF/reglas/backend): L-12/13/14/16/17/29/34/35/36/37/38 en DETALLE allá (el kernel lee las defs `### L-NN` SOLO de `30`, L-31 → el **stub de 1 línea DEBE quedar aquí**). 🔗 **Hija [`32-LECCIONES-CARGA`](32-LECCIONES-CARGA.md)** (carga/LQIP/View Transitions/caché SWR público): L-45/46/47/49/50/51/52/53/61 en DETALLE; stub aquí. 🔗 **Hija [`33-DOCTRINAS-CSS`](33-DOCTRINAS-CSS.md)** (doctrinas de diseño CSS / Liquid Glass / tipografía — NO `L-NN`). **Nuevas lecciones backend→`31`, carga→`32`, + stub aquí; doctrinas de diseño→`33`.**

---

## 🎨 Doctrinas CSS y Diseño "Liquid Glass" → hoja [`33-DOCTRINAS-CSS`](33-DOCTRINAS-CSS.md)

Las doctrinas de diseño/CSS (arquitectura CSS modular · estética editorial premium / glassmorphism · tipografía Cormorant/Manrope/Space Mono) se movieron a la hija **[`33-DOCTRINAS-CSS`](33-DOCTRINAS-CSS.md)** (§G.5 sharding por saturación de `30`). Consúltala ante un Trigger de Experiencia de CSS/diseño. Las lecciones `L-NN` siguen aquí abajo.

---

## 💻 Gotchas Técnicas y Reglas de Código

### L-01: iOS Safari Scroll Lock en Drawers
Para bloquear el scroll de fondo en iOS Safari al abrir el Mobile Menu o el Cart Drawer, `overflow: hidden` es insuficiente. Se debe usar la técnica:
```js
// Bloquear
const scrollY = window.scrollY;
document.body.style.position = 'fixed';
document.body.style.width = '100%';
document.body.style.top = `-${scrollY}px`;
document.body.classList.add('menu-open');

// Desbloquear
document.body.style.position = '';
document.body.style.width = '';
document.body.style.top = '';
document.body.classList.remove('menu-open');
window.scrollTo(0, scrollY);
```

### L-02: Caché del Service Worker y Evitación de FOUC
*   La versión de caché se incrementa en `public/sw.js` (ej. `bersaglio-v3` ➔ `bersaglio-v4`).
*   Cada shell HTML incluye una sección de **Critical CSS inline** (tokens base + reset + skip-link + fade-in inicial). Sin esto, la carga asíncrona de las hojas de estilo mediante `rel="preload"` produce destellos de contenido sin estilo (FOUC).

### L-03: Renderizadores de Producto Únicos (DRY)
*   `renderPieceCardHTML(piece)` en `js/components/piece-card.js` es el **único renderizador de tarjetas de producto**.
*   Toda grilla que muestre piezas (destacados, catálogo, carrito, relacionados) DEBE usar este helper para evitar desalineación visual o duplicación de markup.

### L-04: Contrato del Header Flotante
*   El header pill flotante tiene `position: fixed; pointer-events: none` para no bloquear los clicks debajo de su área transparente lateral. El elemento interno `.header-aqua-pill` tiene `pointer-events: auto` para que el menú sí sea clickable.
*   Si se altera esta estructura, se pueden bloquear clicks en toda la parte superior del sitio web.

### L-63: Dos flotantes `fixed` en la misma esquina (cookie banner ↔ FAB asesoría) se pisan → la compuerta de consentimiento manda sobre el concierge; bandera `body.bj-cookie-active` (la pone/quita `cookie-banner.js`) + el otro cede por CSS (regla DESPUÉS de `.is-revealed`, misma especificidad gana por orden) + banner z-210 > FAB z-200 (red de seguridad) → §156.19

### L-62: crash pinch-zoom iOS = MEMORIA; fix = RESTAR capas en móvil (content-visibility + quitar `filter:blur`), NUNCA promover GPU → §156.18

### L-61: Artefactos del SSG (`dist/`) → verificar con `vite preview`, NO el dev server (sirve la fuente). → `32-LECCIONES-CARGA`

### L-05: Preview headless (Claude Preview MCP) no recalcula estilos dinámicos
Síntoma: `getComputedStyle` da el snapshot inicial; IntersectionObserver y **`requestAnimationFrame` NO disparan si la pestaña está `hidden`** (→ el código en rAF, p.ej. wiring, no auto-corre; `renderAll()` síncrono SÍ pinta); `preview_screenshot` hace timeout. **Receta**: verifica lo dinámico por CÓDIGO + DOM (`preview_eval`) o invoca el handler a mano (`import()`+call); **layout/fit** con `preview_resize` + `scrollWidth-clientWidth`/`getBoundingClientRect`/`getComputedStyle.display` (determinista, sin captura — así se refutó "la caja no cabe en el header", §155); NO por screenshot ni post-mutación. Lo visual real, en `npm run dev`/deploy.

### L-58: Verificar UI dinámica con EMULADOR + seed (cuando prod está vacío o L-05 te limita)
Síntoma: no se puede validar la ficha/grilla/recos/catálogo en vivo porque el catálogo prod está vacío (reset) y el preview no pinta dinámico (L-05). **Receta**: el sitio en dev se conecta SOLO a emuladores (`firebase-config.js`: `isDev` por hostname localhost/127.0.0.1 → `connectFirestoreEmulator` 8080). Entonces: (1) `firebase emulators:start --only firestore`; (2) `FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 node functions/seed-piezas.mjs` (catálogo de prueba determinista, idempotente doc-id=slug, NO toca la nube, aborta sin la env var); (3) `preview_start` → `npm run dev` se conecta al emulador y SÍ renderiza el dato dinámico → `preview_eval` lee CTAs/hrefs/dataLayer (incl. eventos GA4 `whatsapp_click`) + `preview_screenshot`. Probado: B0.5 verificado end-to-end así (ADR §120). El seed (`functions/seed-piezas.mjs`) es el banco de pruebas reusable para TODO lo que viene (B1: pedidos/stock se prueban también en emulador). **Gotcha de carrera (§123.4)**: en dev+emulador el 1er snapshot de `data.load()` puede resolver ANTES de que la página suscriba `data.onChange(refresh)` (`home.js`/`pieza.js`) → home/pieza quedan en skeleton/vacío y el watchdog NO actúa si `isReady=true`; para VERIFICAR, fuerza un refresh (toggle wishlist o `refreshFeatured()`). En PROD no pasa (la latencia de red pone el snapshot tras la suscripción). **Nota §131**: las piezas de prueba (`seedDemo:true`) vivieron en PROD (excepción pre-lanzamiento §121) hasta **2026-06-27 — BORRADAS** al activar inventario v3 (prod sin demo; se recarga real con el panel v3; ver `[[feedback-no-demo-en-index]]`). El emulador sigue siendo el banco para CFs/reglas. **Alternativa LIGERA sin emulador (§143)**: con Chrome REAL (no el preview headless, L-05), inyecta el dato en el singleton — `import('/js/core/data.js')` → `data._pieces=[pieza]` + flags `_initialPieces/_initialCols/_loaded=true` + `data._notify()` → `onChange(refresh)` pinta. URLs reales de `/data/catalogo.json` (data VIVA ≠ snapshot SSG).

### L-59: Desplegar reglas `read` row-level (D5) — la query pública DEBE igualar el set legible; + estado-vacío + consentimiento prod (ADR §131)
Síntoma: introduces una regla `read` POR-FILA (p.ej. `visibilidad != 'privada'`) sobre una colección que el público consulta. **3 trampas**: (1) **Query-match**: una query que devuelva UN doc que la regla deniega FALLA ENTERA (no parcial) → la query pública debe filtrar EXACTAMENTE al set legible (`where('visibilidad','!=','privada')` espeja la regla) Y los datos deben satisfacer el predicado ANTES de desplegar la regla (backfill el campo o BORRAR los legacy primero; si no, todo doc sin el campo queda ilegible → catálogo roto). (2) **Estado-cero**: un catálogo legítimamente VACÍO (pre-carga / borrar la última pieza) NO debe abortar el build/SSG — distínguelo del fallo real "se leyeron piezas pero la proyección las perdió". (3) **Escribir/borrar datos PROD** (migración/limpieza) exige consentimiento EXPLÍCITO (el clasificador bloquea un "continua" genérico); `applicationDefault()` (ADC) ≠ la auth del firebase CLI/MCP → el ADC puede dar PERMISSION_DENIED aunque el CLI esté logueado. Deploy-day → ADR §131.

### L-60: Importar datos reales de una fuente externa (certificados con QR → SPA) — pipeline reusable (ADR §132)
Disparador: cargar inventario/datos masivos desde fotos de documentos con QR que llevan a una página de un tercero. **Receta probada (32 piezas TrueLab)**: (1) **QR de fotos** = `jsqr` + `sharp` (RGBA `ensureAlpha().raw()`; upscale ×2-3 + `sharpen` + recortes; jsQR es flojo con fotos en ángulo → varias variantes); `jsqr`/`tesseract` se instalan `--no-save` y se PODAN en el siguiente `npm i` → reinstalar antes de reusar. (2) **Página = SPA** (WebFetch devuelve cáscara): scrapéala con Chrome MCP **navegando como usuario** — `history.pushState`+`dispatchEvent(PopStateEvent)` recorre N rutas en UN `evaluate_script` (el SPA se autentica solo; NUNCA replicar su credencial embebida — el clasificador lo bloquea, y es lo correcto). Lee el DOM por etiqueta→valor + la imagen limpia (suele estar en blob/CDN). (3) **OCR de números impresos** (tesseract) NO es fiable para un código exacto (trunca/duplica) → usa un identificador EXACTO del SPA. (4) **Clasificación visual** = montage etiquetado (1 lectura para N), no N lecturas. (5) **Carga a prod** = MCP Firestore (gcloud suele no tener cuenta; ADC sin permiso). (6) No inventar lo no certificado (metal solo con OK del dueño); descripción de hechos reales. Artefactos efímeros → scratchpad de sesión.

### L-06: Reveal-on-scroll robusto (anti-invisibilidad)
`.reveal { opacity:0 }` activado solo por JS es single-point-of-failure: si el activador falla, el contenido queda invisible. `js/core/reveal.js` = IntersectionObserver primario + red de robustez (revelar lo ya visible al cargar + listener scroll/resize pasivo auto-removible) + `prefers-reduced-motion`. Patrón reusable.

### L-07: Optimizar PNG pesados del handoff antes de servir
PNG del handoff venían a 1.3–1.9 MB para mostrarse a 34–140px. `sharp` (en devDeps) → webp: emerald-gem 1833→13.5KB, cart-gems 1284→69.8KB. Receta: `sharp(src).resize(N,{fit:'inside'}).webp({quality:82})`. Borrar el PNG pesado tras migrar.

### L-08: Mirror ≠ rebuild — auditar el estado real antes de "reconstruir"
Ante "rehacer todo", auditar primero el estado real (el rebuild PLAN-NOVO YA estaba hecho); pulir > re-demoler si la base es sana ("invertir mejor, no gastar por gastar").

### L-09: Preview headless — los screenshots mueren con CUALQUIER blur pesado (amplía L-05)
Síntoma: `preview_screenshot` hace timeout (30s) en desktop **incluso tras desactivar `backdrop-filter`** por inyección. Causa: el `filter: blur()` de las capas decorativas (`.bj-world` aurora `blur(60px)` fija + hero blobs `blur(40-50px)`) y sobre todo el **modal email-capture que auto-abre** con backdrop `backdrop-filter: blur(8px)` a pantalla completa saturan el renderer del sandbox. Recetas: (1) el PRIMER screenshot tras carga fresca suele funcionar (antes de que el modal abra); editar un `.html` dispara reload de Vite → ventana limpia para 1 shot. (2) Para todo lo demás NO pelear con screenshots → `preview_eval`/`preview_inspect` (computed values, fiables) + lectura de CSS. (3) **Verificar fuentes sin screenshot**: medir ancho de render de un `<span>` por familia vs su fallback (si difieren >2px, la fuente está activa); `document.fonts.check()` da falsos negativos con el subsetting `unicode-range` de Google Fonts.

### L-10: El critical-CSS inline puede driftear de los tokens externos
Cada shell HTML duplica tokens en su `<style>` critical inline (radii, colores, fuentes) para evitar FOUC (L-02). Si cambias un token en `liquid-glass.css` y NO en el inline de los 12 shells, hay drift: above-the-fold usa el valor viejo hasta que carga la hoja async. Caso real (corregido en ADR §41): radii inline `10/16/22/32/44` vs sistema `12/18/24/34/48`. Receta: al tocar tokens del design-system, propágalos al critical inline de TODOS los shells — reemplazo literal por script sobre `*.html` (auto-scopear a los que contienen el valor viejo).

### L-11: Verifica el HOSTING real antes de escribir headers/CSP/redirects
`firebase.json` puede tener un bloque `hosting` (headers, rewrites) que **NO se usa** si el sitio se sirve por **GitHub Pages** (deploy vía `actions/deploy-pages`, no `firebase deploy --only hosting`). Caso real (Fase 2): la S8 "añadir CSP/headers a `firebase.json`" era **moot** — GitHub Pages ignora esos headers. En GitHub Pages, CSP/headers solo via `<meta http-equiv>` en el HTML (o un CDN delante). Receta: confirma quién sirve mirando `.github/workflows/*.yml` (`upload-pages-artifact`/`deploy-pages` = GitHub Pages) antes de tocar headers. Corolario seguridad: las **API keys web de Firebase son públicas por diseño** (van en el bundle cliente); la protección real es App Check + restricción de key + reglas, no ocultar la key.

### L-12: Testear Firestore rules sin Java local — vía CI (zero-budget; JDK ya local Temurin 25). → detalle en `31-LECCIONES-FIRESTORE`

### L-13: Reglas `validate` tolerantes a merge updates — idiom `!('x' in d) || d.x is T` (presencia primero). → `31-LECCIONES-FIRESTORE`

### L-14: NO quitar el fallback de config PÚBLICA de Firebase sin confirmar secrets de CI (tumbó prod). → `31-LECCIONES-FIRESTORE`

### L-16: Reglas de seguridad — los tests "felices" no bastan; revisar adversarialmente el PAYLOAD de create (`hasOnly`, rol, pertenencia, list≠get). → `31-LECCIONES-FIRESTORE`

### L-17: Testear Cloud Functions — lógica pura (sin emulador) + integración (con emulador); recompute idempotente. → `31-LECCIONES-FIRESTORE`

### L-18: En DEV la app conecta a los emuladores Firebase → cómo verificar UI auth-gated
`firebase-config.js` conecta Auth/Firestore/Storage a los **emuladores** cuando corre en `npm run dev` (la consola lo confirma: "Connected to emulators"). Implicaciones para verificar una pantalla admin (auth + datos):
- **Verificación funcional real**: `firebase emulators:start --only firestore,auth` (JDK, `30 §L-12`) + sembrar un usuario con rol + datos, luego `npm run dev` + login. Sin emuladores corriendo, el dev queda "offline" (listeners fallan, 0 datos) — los warnings "Could not reach Cloud Firestore backend" son ESO, no un bug del código.
- **Mostrar SOLO el diseño** (sin auth/datos, p.ej. para que el cliente apruebe la dirección): crear un **mock estático** `_preview-*.html` (mismo `css/admin.css`, datos hardcodeados, sin imports de JS), renderizarlo en el preview, capturar, y BORRARLO (no commitear). Sortea el guard de auth y L-05.
- ⚠️ Screenshots del preview se **cuelgan** con el CSS de cristal del admin (L-09): la 1ª captura tras carga fresca a veces pasa; si insiste en timeout, NO pelear — describir + confiar en build/estructura + reuso de componentes ya validados. Caso real: ADR §44.

### L-19: Roles que no son jerárquicos — no forzarlos en la escala de niveles
`vendedora` NO es "más/menos que" owner/admin/editor: es un **eje distinto** (CRM scoped vs contenido web). Meterla en `ROLE_LEVELS={owner:3,admin:2,editor:1}` con nivel 1 le daría acceso a páginas de `editor` (`hasMinRole('vendedora','editor')` = 1>=1 = true → piezas/colecciones). Solución: dejarla **FUERA** de la escala (queda nivel 0 → bloqueada de las páginas jerárquicas) + un guard por **membresía exacta** `requireAuthExact(['vendedora','admin','owner'])` para sus propias páginas. Regla general: si un rol no encaja en un "≥ que" limpio, NO lo metas en la jerarquía numérica; usa allow-list exacta. (En `functions/index.js` sí está `vendedora:1` pero ahí `ROLE_LEVEL` solo valida que el CALLER tenga ≥ owner para crear usuarios — no concede acceso.) Caso: ADR §45.

### L-20: Una escritura secundaria (telemetría) no debe tumbar un flujo crítico (login)
`signIn` hacía `await setDoc({lastLogin})` en el doc del propio usuario SIN try/catch; como las reglas de `users` no dejan auto-actualizarse (solo owner/admin), una vendedora/editor era **denegada** y el LOGIN entero fallaba. Regla: una escritura **secundaria** (telemetría, contadores, lastLogin, analytics) va en **best-effort** (try/catch) — nunca bloquea el flujo principal. Corolario: si una regla restringe `users` a admin, "el usuario actualiza su propio lastLogin" choca → best-effort en cliente (elegido) o permitir self-update de campos no-sensibles en reglas. **Lo cazó el E2E con emuladores** (los tests de reglas no cubrían el write de `lastLogin` de signIn) — recordatorio de que el E2E ve lo que el unit test no. Caso: ADR §46.

### L-21: Verificar la estructura de CADA hoja de un Excel heredado (no extrapolar)
El supuesto "1 fila = 1 cliente con saldo" valió para la hoja de Kary (por cliente) pero NO para la de vendedoras (**por factura**: cada fila = una compra) → el extractor produjo basura ("#REF! de clientas" eran descripciones de producto). Regla: ante un Excel heredado, **verifica CADA hoja con un volcado crudo ANTES de escribir el extractor**; no extrapoles de una hoja a otra ni confíes en un análisis previo. Caso: Bloque 5 / ADR §47.

### L-15: Datos privados del negocio NUNCA al repo (sobre todo si es público)
GitHub Pages en cuentas Free sirve desde repos **públicos** → TODO el repo (incl. `docs/`) es visible en internet. Un Excel/CSV con saldos, nombres de clientes o deudas en la raíz = **fuga de datos** al commitear. Receta: `.gitignore` para `*.xlsx`/`*.xls`/`*.csv` (datos operativos ≠ código); en docs de diseño **anonimizar** nombres reales (`[Nombre]`, "Vendedora N"). Los datos reales viven LOCAL o en Firestore (privado, con reglas), nunca en el repo. Caso real (2026-06-06): el Kardex `*.xlsx` se gitignoró + el análisis se anonimizó.

### L-22: El CI de este repo NO despliega reglas/índices/functions — solo Hosting/Pages
`firebase-deploy.yml` usa `FirebaseExtended/action-hosting-deploy` = **Hosting only**; `deploy.yml` = GitHub Pages. Ambos en push a `main`. NINGUNO despliega `firestore.rules`, `firestore.indexes.json` ni Cloud Functions → **mergear a `main` NO los despliega**; hay que `firebase deploy --only firestore:rules,firestore:indexes,functions` **manual** (CLI logueado). Corolario crítico: **código en `main` ≠ desplegado** — las reglas/functions del CRM estaban en el código pero `recalcSaldoCliente` NO existía en prod (`firebase functions:list` lo confirmó) hasta el deploy manual. Verificar el estado real de prod (`functions:list` / `git fetch`), no el playbook (§3.3). Orden de lanzamiento: **desplegar functions ANTES de migrar** (el cargador hace poll esperando a `recalcSaldoCliente`). Caso: ADR §47 (corrigió un supuesto erróneo del playbook de `10`).

### L-23: Un script Admin SDK (`node`) necesita ADC — `firebase login` NO sirve
Los scripts de migración/seed (`functions/*.mjs` con `firebase-admin`) autentican por **Application Default Credentials**, no por el login del Firebase CLI. Resolución ADC: (1) `GOOGLE_APPLICATION_CREDENTIALS` → service-account JSON, o (2) `gcloud auth application-default login` (user creds; el owner del proyecto tiene permisos). Fijar quota project: `gcloud auth application-default set-quota-project <proyecto>` (evita "quota exceeded"/"API not enabled"). El test en emulador NO ejercita ADC (auth bypasseada) → ese camino queda sin verificar hasta correrlo contra prod. **Antes de la escritura irreversible**: preflight READ-ONLY (count + marca de migración) que confirma ADC y que la colección está limpia. En PowerShell, `CUTOFF=x node ...` (sintaxis bash) NO setea la var → usar `$env:CUTOFF='x'; node ...`. Caso: ADR §47.

### L-55: RBAC por niveles — TODOS los mapas de rol deben incluir el rol nuevo Y manejar el rango 0 (`??`, no `||`) (ADR §115)
**Disparador**: añadir un rol a una jerarquía numérica de roles. **Lección (rol "catálogo" §115, 2 bugs cazados EN VIVO)**: (1) el nivel del rol vive DUPLICADO en N mapas que DEBEN concordar — en bersaglio son **3**: `js/auth.js ROLE_LEVELS` (guard de páginas), `functions/index.js ROLE_LEVEL` (`verifyRole`+`syncRoleClaim`), `js/admin/render-sidebar.js ROLE_RANK` (filtro del menú). El plan olvidó el 3º → al añadir un rol, `grep` TODOS los `ROLE_LEVEL*`/`ROLE_RANK` + whitelists `role in [...]` (reglas/CFs) ANTES de cerrar. (2) **El rango 0 es FALSY**: un rol con nivel 0 (catálogo, por debajo de editor) rompe los defaults `|| 0`/`|| 1` (`0 || 1` = 1) → el ítem 'catalogo' quedaba OCULTO incluso para catálogo. Usar **`??`** (nullish, respeta el 0), nunca `||`, en cualquier comparación de rango con defaults. (3) Lo cazó la prueba EN VIVO (el emulador valida REGLAS, no el render del menú — L-05/§101). Detalle build → ADR §115.

### L-56: Callable v2 que falla con 403 (no se ejecuta) = falta el invoker público; firebase-tools no lo re-aplica en update → delete+recreate (ADR §115) → 31

### L-57: Admin MPA "fluido" — mostrar el shell de inmediato (el `body display:none` hasta requireAuth hace que la View Transition cruce a un body OCULTO=blanco); la fluidez REAL = panel tipo app (ADR §115) → 32

### L-53: Firebase Storage SIN `cacheControl` → servido `private,max-age=0` = re-fetch por visita; fix `cacheControl` 1 año en `_upload` + backfill (ADR §112) → 32

### L-52: "Instante + fresco" = SWR NATIVO (Firestore `persistentLocalCache`) + diff-gate, NO un SWR a mano; caché SOLO-público + feature-detect + firma `id+_version+URL` (ADR §108) → 32

### L-51: MPA "app-like" — empieza por `@view-transition` cross-document (barato/nativo), no por el router falso-SPA (caro) (ADR §107) → 32

### L-50: Un placeholder solo MEJORA si PRECEDE a la imagen — en MPA estático el LQIP llega con el `getDoc` y SUMA un 3er estado; resuelto con cache-first §111 (ADR §106) → 32

### L-49: "Imágenes que cambian de zoom al cargar" rara vez es resize — mídelo; suele ser la animación `.reveal` replay en recarga (capa GPU difumina) (ADR §105) → 32

### L-47: LQIP "blur-up" del CMS — doble fondo CSS + campo compañero `<campo>Lqip` + `safeLqip()` (data: no pasa por safeUrl) (ADR §104) → 32

### L-48: Reglas `siteContent` — whitelist a nivel de SECCIÓN, no de clave → campo interno aditivo = 0 cambio de reglas → 31

### L-46: Placeholder de CARGA = invisible (neutro casi-blanco `oklch(94% 0.02 150)`), NUNCA un color saturado; separar *vacío permanente* vs *cargando* (ADR §102) → 32

### L-45: Cero-demo → cazar los fallbacks horneados en CSS (`background:url`), no solo defaults/Firestore (`grep url(/img/...)`); verificar en navegador REAL no headless (ADR §100) → 32

### L-44: ⚠️ SUPERSEDED por L-45/§100 — RCA ERRADA del "flash de imagen" en Nosotros (ADR §99)
El §99 creyó que el flash "vieja→nueva" era doble-paint defaults→Firestore y aplicó un gate `_siteReady`/`withoutImages` que lo EMPEORÓ; la causa real era un fondo CSS demo (`earrings-travertino`). **Lección conservada**: verificar solo en preview headless (L-05) ocultó la causa → usar navegador real. Detalle → **L-45 / §100**.

### L-43: Google Fonts — pesos en RANGO `..` (no lista discreta) = fuente variable → ~½ archivos, cero cambio visual. Detalle → `45` PERF-06 · §94.

### L-42: Sección dinámica rellenada por listener → monta SIEMPRE su `<section>` (ADR §89)
**Disparador**: una sección que se llena con datos async (onSnapshot/onChange) y puede estar vacía al primer paint. **Lección (bug Categorías)**: si `renderX()` devuelve '' sin datos, la sección NUNCA entra al DOM, y un `refreshX()` que solo ACTUALIZA (querySelector + salir si no existe) no puede CREARLA → el contenido jamás aparece (ni en vivo ni al recargar: el primer paint SIEMPRE es sin datos, `data.load()` es async). **Patrón correcto** (films/social/journal/featured): `renderX()` devuelve SIEMPRE `<section class="home-X">${xInner()}</section>`; `refreshX()` hace `mount(sec, xInner())`. La vacía se colapsa por **CSS `:empty{padding:0}`** (0px, anti-CLS), NO omitiendo el nodo. Bug latente: solo aparece al partir de CERO ítems. Desconfía de comentarios "aparecerá al recargar" sin verificar.

### L-41: Cero-ficción / hide-when-empty — defensa en profundidad, no una capa (ADR §88)
**Disparador**: una sección pública DINÁMICA se oculta si no tiene contenido real suficiente (nunca demo) + panel que avisa "¿se ve?". **Reglas** (detalle → §88): (1) **SSoT** de umbral+completitud en UN módulo (`home-sections.js`) para render+panel+tarjeta — duplicar = divergencia. (2) la regla valida al ESCRIBIR pero NO re-valida docs viejos → el **render TAMBIÉN re-filtra completitud** (un legacy incompleto se colaría si confías solo en la regla). (3) `nonEmptyStr` con **`.trim()`** (`' '.size()>0` deja publicar en blanco). (4) gate CI barrera #5 (ningún módulo de `js/home/` exporta array de items). (5) con `merge:true` la puerta cierra también en updates. Lo cazó la revisión adversarial (HIGH render-legacy + MED whitespace).

### L-40: Acciones automáticas sobre dinero — el RENDER sugiere, el CLICK re-valida (ADR §76)
**Disparador**: una UI ofrece una acción "automática" sobre dinero (rechazo de solicitud obsoleta, marcado, baja) basada en lo que se evaluó AL PINTAR la tarjeta. **Lección (verif. M2b, 3 lentes lo hallaron por separado)**: el contexto del render puede MENTIR — un fetch fallido (catch → lista null) o un `limit()` truncado es indistinguible de "el doc no existe", y un veredicto "obsoleta" calculado ahí convierte un blip de red en un rechazo one-way con código de auditoría FALSO. **Regla**: (1) toda escritura disparada por una sugerencia del render RE-LEE el doc fuente en el instante del click y re-valida (espejo del camino de aprobar, §74); (2) un fallo de carga se marca `error:true` — JAMÁS se pinta como contexto real ni habilita botones de decisión (anti rubber-stamping); (3) todo `onSnapshot` de una superficie de control lleva error-callback (un error de listen es TERMINAL: sin él, la cola muere MUDA y "roto" se ve igual que "al día"). Bonus M2b→M3: si una regla futura va a comparar asiento↔solicitud, defínela POR TIPO de solicitud — el contrato §74 hace divergir el top-level POR DISEÑO (delta neto ≠ monto del asiento).

### L-39: La UI de dinero se verifica con revisión ADVERSARIAL experta, no con clics de un no-técnico (ADR §75)
**Disparador**: verificar una UI que ESCRIBE dinero (correcciones de saldo/movimientos) antes de publicarla. **Lección**: el gate correcto NO es "el operador no-técnico hace 5 clics" (Kary es dueña no-experta; no detecta un asiento de $0 ni un doble-ajuste). Es una **revisión adversarial multi-agente por dimensiones** (conformidad con reglas DESPLEGADAS · lógica de dinero/signo · wiring/edge-cases) que TRAZA cada escritura contra las reglas reales. En M2a atrapó 2 bugs de dinero BLOQUEANTES (ajustes duplicados sin guard → doble ajuste; corregir con monto vacío → asiento de $0 silencioso) + 1 del spec (rechazo sin botón) que clics manuales jamás verían. **Patrón**: las pruebas (módulo + reglas) cubren la LÓGICA; la revisión adversarial cubre el WIRING y los caminos que producen un dato incorrecto SIN error. Claude es el experto que verifica → [[feedback_claude_experto_verifica]].

### L-54: CMS con LISTAS repetibles (`list` en singleton): reindex PURO (`reindexItemSf`), cap server-side (`siteListOk`), MODELO PLANO (aplanar ANTES de prod = migración cero), guard anti poison-pill. → spec §P4. *(renum. de L-39 dup, §114)*

### L-38: Reglas Firestore — guard `(A || B)` + `hasOnly` que whitelista B = estado contradictorio; atar campo↔estado por PRESENCIA. → `31-LECCIONES-FIRESTORE`

### L-37: CI con toolchain SIN PIN = bomba de tiempo · emulador Firestore exige Java 21; verde-local ≠ verde-CI (leer el run real). → `31-LECCIONES-FIRESTORE`

### L-36: "Desactivar" debe DESHABILITAR la cuenta de Auth (`updateUser{disabled:true}` vía CF) — un campo en un doc NO es credencial. → `31-LECCIONES-FIRESTORE`

### L-35: Custom claims de Firebase — el espejo doc→claim es un RECONCILIADOR convergente (deriva del doc actual), no un copista; la frontera es donde escribe el cliente. → `31-LECCIONES-FIRESTORE`

### L-34: Transacciones Firestore (reset del estado capturado fuera, se re-ejecuta en contención) y `esc(safeUrl())` en href/src del admin. → `31-LECCIONES-FIRESTORE`

### L-33: firebase CLI multi-cuenta — deploy con 403 "caller does not have permission" = cuenta activa equivocada
**Disparador**: `firebase deploy` (o el MCP de Firebase) falla con 403 en cualquier API de Google (firebaserules, etc.). **Lección (ADR §59)**: esta máquina alterna 3 proyectos (cars / inmobiliaria / bersaglio) con cuentas Google distintas y el CLI guarda UNA cuenta activa — una sesión en otro repo la cambia. ANTES de diagnosticar permisos/IAM: `firebase login:list` → si la activa no es la del proyecto, `firebase login:use <cuenta>` (fija el default POR DIRECTORIO → la cura persiste y previene la recaída en los 3 repos). El 403 de deploy en este setup casi nunca es IAM real: es la cuenta.

### L-32: App Check "no válidas" 96-100% — leer el CUERPO del 403, no adivinar (caso resuelto: API key restringida)
**Disparador**: monitor de App Check en 0% verificadas tras desplegar el SDK. **Lección (ADR §57→§58)**: "clientes desactualizados" = falta token (caché → eso SÍ es propagación); "**no válidas**" = token presente pero RECHAZADO (el SDK web manda token dummy si su canje falla) → misconfiguración real, NUNCA propagación. **Receta verificada**: (1) red del navegador → `exchangeRecaptchaV3Token` 403; (2) NO encadenar hipótesis: replicar el canje a mano y leer el **CUERPO** del error — `grecaptcha.execute(0, {action:'fire_app_check'})` (el SDK renderiza un widget invisible; ejecutar por **widgetId**, NO por site key — por site key da el falso negativo "Invalid site key") + POST con `{'recaptcha_v3_token': token}`; (3) el body dicta el fix: **`API_KEY_SERVICE_BLOCKED`** = la API key del navegador tiene allowlist de APIs SIN "Firebase App Check API" (caso real: el hardening Tier A restringió la key a 6 APIs ANTES de instalar App Check §54) → GCP→Credenciales→key→Restricciones de API→añadir la API (~5 min propagación, cero código); `App attestation failed` = secreto/tipo de llave/dominio mal registrados. **Meta-regla: al instalar CUALQUIER servicio Google nuevo, revisar las API restrictions de la key PRIMERO.** PROHIBIDO Enforce hasta ~100% verificadas ×7 días.

### L-30: App Check directo (sobre Firestore) cierra denial-of-wallet con UN init — no reescribas los forms
**Disparador**: cerrar el hueco de escritura pública (`create:if true` + apiKey pública → spam masivo agota cuota/factura) en F6 (ADR §54). **Lección**: la forma proporcionada NO es reescribir cada formulario público a una Cloud Function callable (el plan inicial del workflow) — eso es defensa-en-profundidad posterior (dedup/rate-limit). El **core fix** es **App Check sobre Firestore directo**: `initializeAppCheck(app,{provider:ReCaptchaV3Provider(key)})` en UN punto (`firebase-config.js` cubre público + admin) → el SDK adjunta un token a CADA petición → los bots quedan fuera, **sin tocar forms ni reglas**. Claves del rollout sin romper prod: (1) **gatear por la key** (`VITE_RECAPTCHA_SITE_KEY` ausente → no-op, sitio vivo — misma red que el fallback L-14); (2) **skip en dev** (emuladores se romperían); (3) el `init` **NO bloquea nada** por sí solo (solo adjunta token) — el bloqueo es el **Enforcement** de la consola; (4) **monitor→enforce**: activar enforcement solo tras ver en el monitor que el tráfico legítimo ya llega tokenizado. Acción de consola (Daniel): registrar reCAPTCHA v3 + secret del build + enforcement. **Regla**: cierra el hueco con la pieza mínima que lo cierra; la robustez extra (CF ingestion) es follow-up.

### L-29: Aging/mora "en vivo" sin infra — FIFO puro + `collectionGroup` SIN filtros (evita índice/`FAILED_PRECONDITION`) + fecha round-trip; trampas de calendario JS. → `31-LECCIONES-FIRESTORE`

### L-28: El Consejo Externo puede SIMPLIFICAR — a veces lo correcto es menos máquina, no más
**Disparador**: cerrar un diseño de datos tras un red-team interno que pidió hardening (saldo incremental, backfill Money, async + reconciliación). **Lección**: Gemini 3.1 Pro (Consejo Externo, ADR §50) refutó parte de eso para la escala real (344 clientes): saldo **síncrono O(M)** dentro de la transacción (no incremental + cronjob), **sin backfill** (el COP ya es entero exacto en JS; migrar $506M cuadrados = riesgo), DIAN por **Adapter** (no acoplar el schema a UBL). Resultado: más simple y más correcto. **Regla**: una 2ª opinión adversarial no solo añade rigor — puede QUITAR sobre-ingeniería. Evaluar como peer review (adoptar/refutar **con razón**, p.ej. se refutó `x10000`/`decimal.js`), nunca acatar ni descartar en bloque (§G.2 + `docs/15`). **EXT (CMS WYSIWYG, 2026-06-15)**: el consejo externo también puede CONFIRMAR sumar complejidad — Gemini recomendó **iframe** (que mi comité había descartado) y lo ADOPTÉ, pero por las razones VERIFICADAS en código (la página del preview no carga el CSS público → `<div>`=bleed inverso; fidelidad pixel; "ver en móvil"), **refutando** su justificación (alarma "Game Over": el editor es único y de confianza, el vector XSS real estaba FUERA del preview). *Peer review = adoptar la conclusión por TU evidencia, no por la retórica del modelo.*

### L-31: Kernel del cerebro compartido ×3 — escape del pre-commit + salvamento de deliberaciones por transcript *(renumerada 2026-06-09: era L-28 duplicada)*
**Disparador**: el `brain-check.mjs` (kernel byte-idéntico en los 3 repos) corre en pre-commit; tocas el kernel o pierdes una deliberación sin capturar. **Lección (comité v6, 2026-06-09)**: (1) un kernel con bug bloquea los pre-commit de los 3 repos a la vez (blast radius ×3) → SIEMPRE probar el candidato contra los 3 ANTES de propagar (copia temporal + correr); diagnóstico primero (`node scripts/brain-check.mjs` suelto); `git commit --no-verify` SOLO con pedido explícito del cliente. (2) Una deliberación (comité/workflow) que cerró sin capturarse NO está perdida: el harness persiste transcripts por-máquina en `~/.claude/projects/<proyecto>/<sesión>/` → localizar por fecha, extraer el crudo, archivar en `archiveDir` (manifest) + síntesis retroactiva. Prevención: PRIMER acto tras un workflow = copiar el resultado al `archiveDir`. **(3) Escritor ÚNICO del kernel (dueño 2026-06-15)**: SOLO cars-operador escribe `brain-check/diff.mjs` + la §G cross-repo; bersaglio = dominio de su instancia (`05`/`10`/`30`/lóbulos)+app, NO toca el kernel (editarlo → peer-hash #11 ROJO ×3). Cambio de kernel desde bersaglio → vía el dueño a cars, que lo origina y propaga byte-idéntico ×3 (caso: git-gate H-06/TODO-22).

### L-27: Verificar el REPO tras un subagente — no fiarse del reporte (truncado/socket/pasos omitidos)
**Disparador**: ejecutar un plan con subagentes (F-CHASIS-A, ADR §50). **Lección**: 3 incidentes en una sesión — un subagente reportó progreso pero su salida se **truncó** y NO llegó a commitear ni añadió el script a `package.json`; otro murió por **socket closed** (0 cambios persistidos); un tercero requirió contraste. **Regla**: tras CADA subagente, el controlador VERIFICA en el repo real (`git log`/`git status`, Grep, build, tests) ANTES de marcar la tarea hecha — el reporte es pista, no evidencia (§3.3). Bonus: `grep` de Bash con `\|` dio **falso negativo** buscando un hex; usar la herramienta **Grep** (ripgrep), no `grep` por shell, para checks de verdad/ausencia.

### L-26: Daniel mergea Desarrollo→main por PR en GitHub durante la sesión — `git fetch` SIEMPRE
Dos veces (lanzamiento PR #189; Fase R PR #191) `origin/main` avanzó **solo** mientras yo trabajaba: Daniel ve los commits en `Desarrollo` y mergea el PR en GitHub. Implicación: el estado de `main`/deploy NO es lo que dice mi ref local → `git fetch` antes de afirmar nada (§3.3). El **sitio** se despliega por ese merge (CI on-push-a-main), pero **reglas/functions NO** (L-22) → esas las despliego yo a mano. Patrón: yo commiteo en `Desarrollo` (conviene pushear para que él vea/mergee el PR); el merge a `main` + deploy del sitio lo dispara su PR; el deploy de reglas/functions es manual mío. Caso: ADR §47, §49. **EXT (§75)**: Daniel puede mergear `Desarrollo→main` ANTES de que termines de verificar → publica UI con bugs (caso PR #223: M2a con 2 bugs de dinero antes de mis fixes). **UI de dinero: verificar ANTES de pushear a `Desarrollo` o avisar "no mergees aún"; tras su merge, comprobar el bundle EN PROD y rushear el fix.**

### L-25: Subir un major de dependencia crítica — verificar, no asumir (firebase-functions v6→v7)
Para actualizar un major de una dep que corre en prod (functions con dinero real): (1) el **`package.json` instalado** en `node_modules` es fuente AUTORITATIVA offline de `engines` (Node mín) + `peerDependencies` (compat) + `exports` (subpaths/imports válidos) — para esas preguntas no hace falta el changelog; (2) el **test de integración con emulador** prueba "¿funciona nuestro código con vX?" mejor que leer notas de versión (carga las functions igual que el deploy y ejercita el trigger); (3) **smoke test en prod** tras desplegar (doc temp marcado + cleanup) confirma que el trigger dispara de verdad; (4) si un agente de research queda sin red, NO inventar el changelog (§3.3) — usar el paquete instalado + WebFetch del release oficial. firebase-functions v7 solo cambió: Node mín 18, quita `functions.config()`, renombra v1 Event→LegacyEvent; la API v2 (onCall/HttpsError/onDocument*) NO cambió. Relacionado con **L-17** (testing de CFs). Caso: ADR §48.

### L-24: Verificar SIEMPRE los datos tras una migración (la fila "TOTAL" del Excel se cuela)
Una fila **"TOTAL"** del Excel entró como un cliente más → cartera al doble ($1.012M vs $506M real). Receta: tras migrar, **leer total + top-N saldos + conteos** (un total se delata: ≈ suma de los demás) + filtro `NON_CLIENT_RE` anclado al inicio. **Testear el regex con casos** (`totales?` no matchea "TOTAL"; usar `total(es)?`) — regex sin probar = suposición (§3.3). Caso: ADR §47.

---

## 🧠 Meta-lecciones del cerebro/proceso (M-NN) — detalle → ADR §82

> Cómo opera/falla el cerebro mismo (Reflejo de Autocrítica §G.4). 1ª auditoría semántica con artefacto = ADR §82.

### M-01: No imprimir un campo de estado del manifest como "hecho" sin gate que verifique su artefacto
`brain:check` anunciaba "auditoría 2026-06-09" (de `deepAudit.last`) sin tabla de hallazgos = fachada → aplica la Regla de ADMISIÓN al propio linter. Detalle → ADR §82.

### M-02: Una lección sobre estado verificable-por-comando (git/build) debe volverse GATE, no prosa [HONOR]
`05` repitió "==main" falso pese a L-26 porque NINGÚN gate lee git (→ TODO-22).

### M-03: Un campo `last` de tracking nace null/baseline, nunca con fecha que finja una ejecución
§56 selló `deepAudit.last=2026-06-09` (instalación) sin corrida → fachada (rel. M-01).

### M-04: La memoria del harness deriva en silencio (fuera de `docs/`, el linter no la cubre)
Ruta de repo stale tras mudanza + memoria de 72d que contradecía la gobernanza → necesita repaso de frescura propio.

### M-05: Edité un subsistema bajo UNA lente y lo di por bueno sin probar el camino vivo (§89)
Di `categories.js` por OK con la lente cero-ficción sin probar el **estado-cero** del camino vivo (*"1ª categoría → ¿aparece?"*). Causa técnica [[L-42]]; meta-falla de PROCESO → reflejo CAZA-BUGS / **W-10**; gate real = test estado-cero ([HONOR]). Detalle → ADR §90.

### M-06: El kernel acopla las definiciones `### L-NN` a `30` → shard de lecciones = stub-en-30 + detalle-en-hija (§96)
`brain-check.mjs` lee `defined` SOLO de `30` y `referenced` de todo el cerebro MENOS las hijas. Mover una lección referenciada en `99` a una hija (`31`) la deja COLGANTE. → el shard TODO-27/§96 deja el **header-stub `### L-NN` en `30`** (defined lo cuenta, refs resuelven) y el CUERPO en `31`. Soporte real multi-archivo (que `defined` lea `3*-LECCIONES*.md`) = cambio de KERNEL → cars-operador (L-31), NO unilateral desde bersaglio; aporte para la pasada Gemini (con TODO-22/23). [HONOR]

### M-08: Un TABLERO (`05`) no debe FIJAR a mano un hecho verificable-por-comando (hash/PR de PROD) — se vuelve stale y CONTRADICE §3.3 (§114) [HONOR]
HA-01 (estado git stale en `05`) reincidió **3 veces** (H-01→HA-01→§114) porque `05` pinneaba el commit/PR exacto de PROD, que caduca en cada deploy de Daniel (L-26) y NINGÚN gate lee git (TODO-22 = kernel/cars-operador, nunca construido). El **retrieval-drill frío lo probó**: una sesión nueva entrega el hash viejo como "verificado". **Regla**: un tablero describe el estado por CONTENIDO (qué features están live); el dato volátil verificable-por-comando (commit exacto) se DELEGA a `git fetch` (git = SSoT), NO se copia a mano. Quitar el hecho stale en su origen es más barato y robusto que un gate que lo vigile. Complementa [[M-02]] (la lección verificable-por-comando debe ser gate, no prosa) — aquí: si no puede ser gate aún, ELIMINA la prosa stale. Detalle → ADR §114.

### M-07: Los node:tests NO corren en CI (solo `test:rules`) → test-rot SILENCIOSO tras refactor de render (§104)
§102 reescribió las 5 secciones del home al modelo 3-estados (`armWatchdog();`+comentario antes del `return`; `>= MIN_FEATURED ? : ''`) y dejó `no-demo-home.test.mjs` **rojo en 6/10** — invisible hasta §104 porque NINGÚN workflow corre los node:tests (CI solo `test:rules`, L-12/L-37). El CÓDIGO cumplía cero-ficción; lo stale eran los regex (demasiado acoplados a la FORMA exacta del render). **Regla**: tras tocar un renderer, correr la batería local (`node --test` de `tests/*` salvo `firestore-rules`); y un gate de PATRÓN debe tolerar variación benigna (stripComments + prefijo de-solo-llamadas) sin perder la detección del bug. Aporte para la pasada Gemini: un `npm test` agregado en CI (junto a TODO-22/23/29). [HONOR]

## 🧭 Decisiones de gobernanza 2026-06-24 (operador-cars → ×4 cerebros) [HONOR]
> De la sesión cars (PLAN UNIFICADO, cars §237). Mismo dueño/operación en los 4 repos.
1. **La extensión Claude-in-Chrome la maneja CLAUDE directamente** (no relay): tras merge+~5min de deploy el dueño avisa y Claude conduce la validación live SOLO (es los OJOS), caza diseño/bugs/regresiones. Skill `validacion-live-chrome` modo (b) = DEFAULT con navegador conectado. Login/credenciales = solo el dueño; cambios locales no-deployados → `preview_*`.
2. **NO preguntar "qué sigue" en un plan ya hecho + revisado estratégicamente por mí** (survey/comité/Gemini/arquitecto): yo manejo el ORDEN técnico; solo interrumpo por decisiones del DUEÑO (dinero/legal/go-no-go/irreversible) o su verificación final. Refuerzo emphático del dueño 24/06. Hablarle SIEMPRE en cristiano (es no-técnico).
3. **Un workflow/comité ACOTADO (in-cwd read-only, sin git, sin lecturas fuera de cwd) NO se cuelga** — lo que cuelga es la lectura GATEADA por permiso (git/fuera-de-cwd), NO el fan-out acotado en sí (survey de 5 agentes corrió limpio). La maquinaria pesada (comité/Gemini/workflow) se usa para Decisión Fuerte, acotada.
4. **Verificar TODO claim de un asesor externo (Gemini) contra el código** antes de adoptar — la joya: en cars Gemini revirtió su propio verdicto previo y sus 6 claims se confirmaron leyendo el código. Insumo, no oráculo.
