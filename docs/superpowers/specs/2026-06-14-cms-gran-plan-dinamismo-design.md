# GRAN PLAN — Dinamismo total del CMS Bersaglio Jewelry (VERSIÓN FINAL)

> **Origen**: directiva de Daniel (2026-06-14) — TODAS las secciones públicas editables desde el
> panel (textos/imágenes/botones/diseño, incl. atelier, Nuestra Maison, Cartagena, nosotros, contacto)
> + builder visual para banners/columnas + política no-demo + decisión SPA/SSR + cómo lo hacen las
> grandes empresas (negocio se autoadministra, ingeniero solo mantiene). Secuencia: dinamismo → usuarios.
>
> **Deliberación**: comité de expertos ×3 + red-team (18 agentes) — workflow `wf_d99a59a5-746`.
> CRUDO de los 18 agentes → transcript dir `subagents/workflows/wf_d99a59a5-746/`. Este archivo = SÍNTESIS.
> **Decisión Fuerte → pendiente consejo externo (Gemini)**: 4 preguntas al final (§8 + bloque al pie).
> Sucesor/complemento del spec `2026-06-14-cms-web-publica-design.md` (P0-P1 ya construidos: journal E2E).
> **[OPUS-4.8 interino]**.

---

## 1 · REVISIÓN de lo implementado (veredicto honesto)

**BIEN (no tocar):** motor de servicio (`createTypedDoc`/`updateTypedDoc`, transacción + id-collision + bloqueo optimista); motor de UI (`resource-admin-core.js` con `esc()`/`safeUrl()` + whitelist por descriptor = baranda anti stored-XSS del repo público L-15 — **primitiva sobre la que se construye TODO**); chasis SPA reusable YA existe (`contenido.js` router con mount/destroy); reglas (`publicContentValid` con `hasOnly` auto-incluyendo auditoría).

**Bloqueantes pre-deploy (verificados de primera mano):**

| # | Bloqueante | Evidencia | Fix |
|---|---|---|---|
| **B1** | `match /system/meta` NO existe → `signalCacheInvalidation` (`firestore-service.js:106-117`) deniega en CADA save (`:176,225,247`); el catch lo traga. El dinamismo lo multiplica ×6. Latente PREEXISTENTE (lo enmascaran los listeners live). | grep: cero `match /system` en `firestore.rules`. ✅ verificado. | `match /system/{docId}` con `read: if true` + `write: if isEditor()` + `hasOnly` del set de timestamps por página (§2.C). |
| **B2** | `journal-preview.js:96` → `cover.excerpt.charAt(0)` revienta si `feat` es null. El baked lo enmascara; al cortar el fallback, crashea. | `journal-preview.js:20-21,96`. | Guard `if (!feat) return ''` al inicio de `journalInner()`. |
| **B3** | Fallback baked (`journal.js`, `categories-data.js`, `home-media.js`) muestra DEMO con 0 datos (petición D). | auditoría + inventario. | Política no-demo (§4) **con seed previo** (§7 P0.5). |
| **B4** | Listeners globales en boot, NO lazy por página: `onJournalChange`/`onCollectionsChange`/`onPiecesChange` arrancan en `data.js` en CADA pageview público → satura 50k reads/día de Spark antes de añadir listas. | `data.js` load(). | Mover listeners a lazy-por-página con `destroy`. **P0** — ya muerde. |
| **B5** | `storage.rules` sin size/MIME cap; journal YA tiene `image-upload`. Kary sube PNG 8 MB → mata LCP + free tier (denial-of-wallet egress) desde la 1ª foto. | journal usa campo `image`. | `storage.rules` con `request.resource.size < N` + content-type allowlist. **P0**, 10 líneas. |

**Choque resuelto contra la mayoría:** un experto propuso `read: if published || isEditor()` para journal. **Verificado `data.js`: `onJournalChange` suscribe la colección COMPLETA sin `where('published')`** → Firestore denegaría la query entera → journal en blanco en prod. El journal es **copy de marketing, no dato sensible** (lo dicen las propias reglas). **`read: if true` se queda** en journal y en TODO `siteContent`; `published` sigue siendo flag de visualización filtrado en cliente. **Doctrina futura** (no cambio hoy): si una sección llevara dato sensible → separar colecciones (`xDrafts` privado / `x` público) o filtrar server-side, NO `published || isEditor()`.

---

## 2 · ARQUITECTURA — modelo de datos del dinamismo total

**Regla constitucional (sobrevive 3 años): dos formas de dato, nunca una sola.** Todo a colecciones quema el free tier; todo a singletons impide paginar. El tipo de sección decide la forma.

- **2.A LISTAS (TIP) → colección tipada + motor genérico.** `journal` (hecho), `films`, `social`, `services`, `team`, `timeline`, `values`, `faq`, `reviews`, `certs`. Descriptor ~30 líneas (`resource-admin`). Reglas `publicContentValid` por recurso. Lectura `onCollectionChange` **SOLO en la página que la usa, lazy con destroy, listLimit duro** (corregir boot global B4 = P0).
- **2.B TEXTOS de página (EST) → singleton `siteContent/{page}`** (`home`/`nosotros`/`contacto`/`global`) con sub-mapas por sección (hero/editorial/atelier/cta…). Arrays cortos atómicos (atelier.steps[4], editorial.stats[3]) **embebidos** en el sub-mapa. **Decisión dura de COSTO: el singleton se lee con UN `getDoc` cacheado en localStorage invalidado por timestamp — JAMÁS `onSnapshot`.** (`singleton = getDoc cacheado / lista = colección lazy` = doctrina antes de P2.)
- **2.C Cache-bust por página, NO global.** `system/meta` = un timestamp por página (`{home, nosotros, contacto, lists}`); cada `setDoc` toca solo su clave; el cliente re-lee su página solo si SU timestamp cambió. Evita el read-storm global.
- **2.D Reglas para `sections[]` anidadas: NO confiar en recursión** (Firestore rules no recursan). Defensa: `sections is list && size()<=20` + `type ∈ enum` + **size-cap del doc < 100 KB** en el guardado. Validación profunda en editor cliente + renderer (`safeUrl`/`esc`), blindada por gates §3. El builder **NO admite campo `html` ni `style` libre**.

---

## 3 · EL "BUILDER" — recortado 10×: `sections[]` por FORMULARIO, no lienzo

**Cambio mayor tras el red-team.** El builder con drag-and-drop + registry + presets visuales + WYSIWYG + a11y por teclado es 3-4× cualquier otra fase y la menos validada — una catedral para UNA usuaria. §3.6 lo prohíbe (el costo se paga en mantenimiento eterno del ingeniero que el plan quiere liberar). **El 90% del valor ("Kary cambia el banner del Hero sola") se logra con un descriptor más sobre el motor que YA existe.**

**Ahora (versión 10× más simple):** `siteContent/{page}.sections: [{ id, type, visible, order, preset, blocks:[...] }]`
- Editado por **FORMULARIO** con los campos `resource-admin` que ya sanean. Sin lienzo, sin drag, sin registry extensible.
- **Set FIJO de 2-3 zonas BLD** (banner del Hero + 1-2 bloques editoriales). NO "todo a bloques" (rompería la estandarización).
- **Reordenar = campo `order` por botones arriba/abajo** (resuelve a la vez el conflicto del `_version` optimista Y la a11y por teclado — gratis).
- **Diseño = elegir `preset`** de un enum de 3-5 (emerald/gold/dark, alineación, densidad) pre-aprobados. Spacing/tipografía/radios **bloqueados, nunca expuestos**.

**Se DIFIERE hasta evidencia:** drag-and-drop, registry extensible, presets ricos → solo el día que Kary haya publicado 10+ veces y pida más. Si tropieza con un formulario, el lienzo es humo.

**Render seguro anti-XSS — TRES gates MECÁNICOS (no honor):**
1. **Renderer:** nunca interpola HTML libre. Texto → `esc()`. URLs/img → `safeUrl()` (allowlist protocolo). Acciones de botón = **enum** (`colecciones`/`contacto`/`whatsapp`/`pieza:{slug}`), jamás URL/JS cruda. `preset`/`icon`/`color` validados contra enum. Reusa EXACTO `safeUrl`/`esc` de `resource-admin-core.js`.
2. **CSP estricta** (sin `unsafe-inline` para scripts) independiente del renderer: aunque una regresión meta `innerHTML=data`, el navegador no ejecuta el payload. **Gate de despliegue.**
3. **Test de inyección automatizado:** falla si cualquier `render()` produce HTML con payload `<img onerror>` inyectado en cada campo. **Sin este test, la feature no mergea** (cumple §G.4 Regla de ADMISIÓN).

**ESTANDARIZADO (intocable por el formulario):** form de contacto (validación + `createdAt==request.time` anti denial-of-wallet); Hero/Marquee/CTA/secciones-marca (estructura fija; el formulario aplica SOLO a las 2-3 zonas BLD).

**Preview real (requisito):** `render(data)` corre DENTRO del admin con el CSS de marca → Kary ve lo que publicará. `?preview=1` muestra esqueleto + placeholder en vacío; live nunca.

---

## 4 · POLÍTICA NO-DEMO por sección (corrige el bug del demo baked)

**Norma única (vive en el MODELO, no en `if` sueltos):** cada sección declara `hideWhenEmpty` en su descriptor/registry; el compositor lo lee. Modelo correcto que ya existe: `featured` (empty-state, no demo). Si dato vacío y `hideWhenEmpty===true` → la sección **no se monta** (`return ''`).

| Clase | Secciones | Política |
|---|---|---|
| **No-demo (ocultar si 0)** | categories (quitar BAKED), films + social (quitar hardcode), editorial, services, atelier, listas TIP de nosotros/contacto | `hideWhenEmpty: true` |
| **Fallback legítimo (siempre visible = marca)** | Hero, Marquee, CTA, Nosotros·Hero, Contacto·Hero, Form de contacto | `hideWhenEmpty: false` |

**Preview vs live:** en el panel (`?preview=1`) la sección vacía muestra esqueleto + placeholder; en producción vacío = ausente.

**El SEED es BLOQUEANTE (P0.5):** el día que `siteContent/home` exista vacío, `hideWhenEmpty` **borra atelier/maison/nosotros que HOY se ven en prod**. Antes de cortar CUALQUIER fallback hay que **sembrar Firestore con el contenido HARDCODED actual** (`published:true`). Sin seed, no-demo = web mutilada. **Restricción:** el seed corre **SOLO vía Admin SDK server-side** (salta reglas), nunca con credencial de cliente (el `hasOnly` rechazaría campos legacy y dejaría el sitio partido); **dry-run que compara claves del hardcode contra el `hasOnly` ANTES de correrlo**.

---

## 5 · SPA / SSR — filosofía por superficie + fix de la lentitud

**Diagnóstico verificado:** la lentitud del panel es real — cada `admin*.html` es un **full page load**: re-`initializeApp` + reCAPTCHA (App Check) + re-suscripción de listeners desde cero en CADA click. La web pública NO tiene este problema (ya es SSG + islands).

| Superficie | Filosofía | Por qué |
|---|---|---|
| **Web pública** | SSG + islands (lo que ya hay — NO reescribir) | SEO/LCP importan; shells estáticos, hidratar solo islas. |
| **Panel admin** | **SPA de UNA shell** (`admin.html` + hash-routing + mount/destroy) | SEO irrelevante (`noindex`); 80% de la ganancia percibida a casi cero costo. |

**Fix concreto, sin framework pesado:** colapsar todos los `admin*.html` en **un** `admin.html` con router de hash + `mount/destroy` por vista. **El patrón YA está en `contenido.js`** — generalizarlo de router-de-pestañas a router-de-página. Firebase se inicializa una vez, listeners persisten, navegar = swap de DOM. **Va en P5** (toca el chasis del panel; no debe desestabilizar el deploy del CMS).

---

## 6 · MODELO "el negocio se autoadministra, el ingeniero solo mantiene"

- **Roles (RBAC ya en reglas):** `editor` = contenido web; `admin`/`owner` = CRM + borrar + usuarios. SoD intacto.
- **Draft/Publish:** cada doc `published` + `_version`; público filtra en cliente (journal) o lee `_published` (singleton); **preview lo da el panel** (sin URL pública = sería secreto en repo público).
- **Rollback / "deshacer publicación" (Fase 1, > builder para una no-técnica):** el snapshot previo ya se guarda en el audit log (`firestore-service.js:175`); el panel ofrece "restaurar versión anterior". Un paso atrás, no historial infinito.
- **Cómo se lo facilitamos:** formularios por campo (no código) · set curado de bloques (no CSS) · presets (no diseño) · acciones enum (no URLs) · preview (no adivinar) · no-demo automático (no se rompe si olvida) · undo (no miedo a publicar).
- **El ingeniero, después:** mejoras, mantenimiento, seguridad, nuevas zonas. Modelo Shopify/Contentful: el negocio llena, el ingeniero extiende.

**Imágenes — partido P0/P3.5:** `storage.rules` con size + MIME → **P0** (B5, denial-of-wallet). Compresión/resize client-side (canvas→webp) + `safeUrl` → **P3.5** (calidad/LCP).

---

## 7 · ROADMAP por fases — MVP entregable primero

**Orden no negociable: P0 → P0.5 → P1 antes de cualquier otra cosa. Drag-and-drop, registry extensible y P2-completo se construyen SOLO si Kary valida P1.**

| Fase | Entregable | Verificación (test falsable) |
|---|---|---|
| **P0** · Deploy journal + cuellos que ya sangran | B1 (`match /system`+hasOnly por-página) + B2 (guard feat) + B3 parcial (no-demo categories/films/social) + B4 (listeners lazy) + B5 (`storage.rules`). Build+tests+reglas verdes. Desplegar journal. | **Kary publica un artículo real, sola.** |
| **P0.5** · SEED (bloqueante) | Script idempotente, **solo Admin SDK**, dry-run de shape vs `hasOnly`, migra el hardcode actual (atelier/maison/cartagena/11 bloques nosotros/contacto) → Firestore `published:true`. | El sitio se ve IDÉNTICO leyendo de Firestore. |
| **P1** · Singleton piloto + no-demo + undo (MVP) | **UN solo `siteContent/home` (hero+editorial)** con `getDoc` cacheado (cache-bust §2.C) + reglas + `resource-admin` modo form-singular + `hideWhenEmpty` en el modelo + compositor + "deshacer publicación". | **Kary cambia el titular del Home Y deshace, sola.** |
| **P2** · Resto de singletons | home (atelier/cta) + nosotros + contacto al mismo patrón validado. | Kary edita "Nuestra Maison" sin tocar código. |
| **P3** · Listas restantes | descriptores films/social/services/team/timeline/values/faq/reviews/certs (lazy). | Cada lista se administra del panel. |
| **P3.5** · Calidad de imágenes | compresión client-side (canvas→webp) + `safeUrl` (el cap de seguridad ya está en P0). | 8 MB → se comprime; LCP no se degrada. |
| **P4** · `sections[]` por formulario | 2-3 zonas BLD + `type`/`preset`/`order` por enum + reglas (size-cap+enum) + **CSP + test de inyección (gates §3)** + preview + reordenar por botones. SIN drag, SIN registry extensible. | Kary añade/reordena/configura un banner por formulario, ve preview, publica. |
| **P5** (post-dinamismo) · Usuarios + fluidez | alta por **Cloud Function** (invitación por email, mata el UID-manual) + `onSnapshot` en lista + colapsar `admin*.html` en **un** `admin.html` SPA-shell. | Kary invita una vendedora por email; navegar el panel es instantáneo. |

---

## 8 · PUNTOS DE DECISIÓN FUERTE (consejo externo §15)

1. **`storage.rules` + flujo de imágenes (P0 cap / P3.5 compresión)** — denial-of-wallet por egress en Spark.
2. **Reglas Firestore para `sections[]` + las DOS/TRES barandas anti-XSS (P4)** — Firestore no recursa; repo público.
3. **Flip de indexación SEO (transversal)** — contenido dinámico vía `getDoc` cacheado vs HTML que ve el crawler.
4. **Cloud Function de alta de usuarios (P5)** — Admin SDK, flujo de invitación seguro.

---

## Para el consejo externo (Gemini) — 4 preguntas (anti-anclaje, sin nuestra postura)

1. **Validación de contenido editable por no-técnicos en repo PÚBLICO sobre Firestore (free tier).** Contenido (banners/columnas/textos) guardado como docs tipados con array de "secciones" anidadas, pintado en web estática vía CDN; las reglas de Firestore no recursan. ¿Modelo de defensa contra stored-XSS más robusto cuando el atacante LEE el código del renderizador? ¿Qué capas (reglas server-side, sanitización cliente, CSP, allowlist de protocolos/acciones) son imprescindibles y en qué orden, dado que el renderizador es la última línea y puede regresionarse?
2. **Subida de imágenes por no-técnico en Firebase Spark** (5 GB Storage, 1 GB/día descarga, sin Functions de imagen en runtime). ¿Controles concretos (cotas en `storage.rules`, allowlist content-type, compresión/resize client-side, formato de salida) para evitar (a) degradación de LCP y (b) agotamiento del free tier por egress? ¿Umbral de tamaño y pipeline client-side?
3. **Renderizado de sitio estático (GitHub Pages, sin servidor propio salvo serverless)** cuyo contenido pasa de hardcoded a leerse en runtime desde BD, y pronto debe ser indexable. Hoy `noindex`. Si el contenido carga por JS tras el render, el crawler ve HTML vacío. ¿Arquitectura de pre-render híbrido viable sin SSR y sin presupuesto, y qué resolver ANTES de indexar?
4. **Provisión de cuentas en panel admin** (una operadora crea cuentas para otras, Firebase Auth + Admin SDK en Cloud Function). Hoy se pegan UIDs a mano. Se quiere invitación por email con set-password por la persona. ¿Diseño seguro del flujo (token de set-password + expiración, anti-abuso/rate-limit, prevención de enumeración, mínimo privilegio)? ¿Errores comunes a evitar?

---

## Consejo externo (Gemini 3.1 Pro · Antigravity) — veredicto INTEGRADO (peer review, 2026-06-14)

> Daniel relayó la respuesta (humano en el medio §15). La trato como un revisor más: adopto lo correcto, refuto lo que no encaja en nuestro modelo, sintetizo. **Cambio de fondo: el punto 3 (SEO/render) mejora el plan v1.**

**ADOPTADO:**
1. **SEO/render — el delta grande.** Pasar de "render en runtime por `getDoc` cacheado" a **SSG: hornear el contenido en el HTML al BUILD** (script Node + Admin SDK en el build de Vite lee Firestore y genera los `.html` físicos con `<title>`/`<meta>`/OpenGraph reales) **+ auto-rebuild**: Cloud Function `onWrite` sobre el contenido → `repository_dispatch` (debounced) → GitHub Actions reconstruye y despliega. **Implicación que MEJORA el plan v1:** el contenido público horneado al build = **0 lecturas Firestore en runtime** (más barato que el getDoc/onSnapshot que proponía v1) + SEO real + tarjetas sociales (WhatsApp/OG ven HTML lleno, no vacío). Reenmarca B4: listeners live SOLO donde la realtime importa (carrito; piezas si el inventario cambia seguido); el contenido editorial se hornea. **Secuencia:** P1 piloto puede arrancar con `getDoc`-runtime bajo `noindex` (cero infra, valida a Kary ya); el bake + auto-rebuild se construye al acercarse al **flip de indexación** (estado final = híbrido: HTML horneado + hidratación live opcional). Antes de indexar: rutas-path reales (no `?e=`/hash), `<title>`/`description` estáticos por página, `sitemap.xml` generado en el build.
2. **CSP estricta = gate #1** (Gemini la prioriza SOBRE el renderer: red de seguridad absoluta — sin `unsafe-inline`/`unsafe-eval`, un `<img onerror>` inyectado NO ejecuta). En GitHub Pages NO hay headers HTTP → vía `<meta http-equiv="Content-Security-Policy">` (L-11). ⚠️ **Adoptar CSP estricta exige auditar/eliminar TODO script inline** (el auth-guard inline de `admin*.html`, JSON-LD de `pieza.js`, GSAP/analytics si los hubiera) → **tarea propia con peso** (no trivial; mover inline → módulos + nonce no aplica sin servidor).
3. **Storage rule (B5):** `request.resource.size < 300*1024 && request.resource.contentType.matches('image/(webp|jpeg|png)')` — PERO con claim de **ROL** (`request.auth.token.role in ['owner','admin','editor']`), **NO** `request.auth.token.admin == true` (refutado: el contenido lo sube el `editor`, y nuestro RBAC usa el claim `role`, no un booleano `admin`).
4. **Pipeline de imagen concreto (P3.5):** `canvas`/`OffscreenCanvas` → resize (máx **1920px** banner / **800px** producto) → `canvas.toBlob({type:'image/webp', quality:0.8})` → blob final **<300 KB**. Allowlist webp/jpeg/png.
5. **Alta de usuarios (P5) — adoptado íntegro:** `createInvite` (CF, verifica claim de operadora) → token `crypto.randomBytes(32)` en `/invitations/{token}` `{email, expiresAt: now+24h, used:false}` → email → `consumeInvite(token,password)` **en TRANSACCIÓN Firestore** (verifica no-expirado + `used:false` → marca `used:true`, anti race-condition) → Admin SDK `createUser({email: doc.email, password})`. **Evitar:** enumeración de cuentas (respuesta genérica en tiempo constante), password por GET/URL (solo POST/callable — si no, queda en logs/historial), **confiar en el email del cliente** (leerlo SIEMPRE del doc del token, nunca del payload).

**REFUTADO / MATIZADO:**
- **"Siempre pasar por DOMPurify antes de `innerHTML`"** → nuestro modelo **NO inyecta HTML del usuario**: el renderer interpola solo texto por `esc()` + atributos por `safeUrl()` + presets/acciones por enum. `esc()` (cero HTML) es MÁS estricto que DOMPurify (que PERMITE tags "seguros"). **DOMPurify se adopta SOLO si añadimos un campo rich-text/HTML** (ej. cuerpo de journal con formato). Hoy el body es texto plano (`split(\n\n)→<p>`) → `esc()` basta. Doctrina: si el editor pide formato rico → DOMPurify obligatorio en ESE campo.
- **`request.auth.token.admin == true`** → usamos claim `role` (owner/admin/editor), no booleano `admin` (ver punto 3).

**RIESGO RESIDUAL (declarado):** el **denial-of-wallet por egress de Storage** (descargas repetidas de imágenes públicas drenan 1 GB/día) NO se cierra 100% en Spark; el size-cap lo acota. Mitigación futura: CDN gratis (Cloudflare) delante de Storage, o servir las imágenes de contenido como **assets del repo** (egress de GitHub Pages = gratis) horneadas en el build (encaja con el punto 1).

**Deltas al ROADMAP §7:** (a) nuevo ítem **SEO-bake** (script de build SSG + CF auto-rebuild) como sustrato del flip de indexación; (b) **CSP estricta** = tarea propia (auditoría de inline-scripts) antes/junto al builder P4; (c) P3.5 con umbrales concretos; (d) P5 con el flujo de invitación de arriba; (e) B5 con claim de rol. **El núcleo del roadmap (P0→P1→…) NO cambia**; el consejo reforzó seguridad/costo y mejoró el sustrato de render. Decisión NO revisada que queda: el orden exacto de adopción de CSP (puede romper inline-scripts existentes → verificar en build antes de activar).
