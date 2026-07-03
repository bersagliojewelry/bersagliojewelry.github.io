# Plan Maestro de Implementación — Auditoría Holística (Fable 5 → ejecuta Opus 4.8)

> **Autor**: Claude **Fable 5** (2026-07-03). **Rol**: Fable audita + reestructura + deja las indicaciones
> exactas; **Opus 4.8 implementa**. Cada tarea trae: alcance · archivos · causa raíz (archivo:línea real) ·
> fix concreto · riesgos · gate de verificación. **NO improvisar**: lo no listado aquí NO se toca.
>
> ## ✅ ESTADO DE IMPLEMENTACIÓN (Opus 4.8, 2026-07-03) — en `Desarrollo`, PEND deploy
> - **A0 login** ✅ DESPLEGADO + verif. LIVE (§159, v65). TODO-64 cerrado.
> - **A dinero** ✅ construido (8 fixes) — tests emulador wompi 30/30, POS 22/22. PEND deploy functions (L-22).
> - **B fugas/robustez** ✅ construido (6 fixes) — reglas 220/220, build verde. PEND deploy rules.
> - **C POS/fiscal** ✅ construido (4 fixes) — POS 22/22, fiscal 5/5. PEND deploy functions.
> - **D catálogo** 🟡 PARCIAL: D.0 (gema en JSON) · D.1 (query menguado admin) · D.3 (caché CMS) ✅.
>   **PEND 7b/7c/7d/D.5/D.6** = capa CDN completa + filtros + perf visual → requieren prerrequisitos:
>   `settings/gems` en prod (D.5), **PAT GitHub en Secret Manager** (7d, sin acceso), y verificación en
>   Chrome en vivo (7b/7c/D.6 = arquitectura/UI del sitio público). NO tocar el sitio en vivo a medias.
> - **E higiene** ✅ (E.1 test frágil corregido · E.2 APP_VERSION v32 · E.3 hero LCP en SHELL_ASSETS · E.5
>   owner). **E.4** (quitar fallback `get(users)`) NO aplicado: requiere confirmar backfill de claims 100%.
> - **Gate de deploy**: A/B/C/E tocan functions + firestore:rules (deploy MANUAL L-22) + bump SW v66. Se
>   despliega junto con el **encendido de precios** tras la auditoría de cierre de Fable. Frontend inerte
>   hasta que haya precios (botón Wompi oculto). Suite total: pura 331/331 · rules 220/220 · wompi 30/30 · POS 22/22.
>
> **Método**: boot del cerebro + lectura de las 6 specs vivas + **auditoría multi-agente acotada** (6 áreas ×
> scope de archivos fijo, `[[feedback_workflows_acotados]]`) + **verificación adversarial** de los P0/P1
> (cada hallazgo grave fue re-leído por un 2º agente que intentó refutarlo). Crudo verificado →
> `../brain-private/bersaglio/2026-07-03-auditoria-holistica-6areas-CRUDO.json`.
> **Build local VERDE** (Vite ~3.9s) · suite unitaria **330/331** (el único rojo es de emulador — `corte-insumos`
> R6 necesita Firestore en :8080, no es regresión de código; ver §0.3).

---

## 0. Estado real (verificado, no de memoria) + reencuadre de urgencia

### 0.1 El hecho que reordena TODO
El botón **"Pagar ahora" está OCULTO en prod** porque `wompiEligible()` exige `piece.price > 0`
(`js/pago-web.js:19-24`) y **ninguna pieza tiene precio aún** (pendiente operativo de Daniel/Kary).
⇒ Los bugs P1 de la ruta del dinero **NO son explotables hoy** (no hay pieza elegible), pero son un
**GATE DURO antes de cargar precios**. El día que Kary ponga precios, la web cobra con esos bugs vivos.
**Regla**: los precios NO se cargan hasta cerrar el Bloque A completo.

### 0.2 El incendio activo diario = LOGIN (TODO-64)
Es lo único que Daniel/Kary sufren HOY en cada uso. Va PRIMERO. Verificado ×2 (adversarial): dos carreras
reales (H1 timeout de 500ms, H2 ping-pong del rol `catalogo` = el rol de Kary). Bloque A0.

### 0.3 Nota del test rojo (NO es bug de código)
`tests/corte-insumos.test.mjs:144` (R6 GATE) falla en `node --test` suelto porque intenta abrir Firestore
emulador (`127.0.0.1:8080`) y no hay emulador levantado → `runCorte` no escribe → `undefined`. Es un test de
**integración** que debe correr con `firebase emulators:exec`, no en la suite pura. **Acción menor** (Bloque D):
o se mueve a los scripts `test:*:integration`, o se hace `skip` si `!process.env.FIRESTORE_EMULATOR_HOST`.
No tocar `functions/corte.js` (la lógica está bien).

### 0.4 Lo que la auditoría CONFIRMÓ que está BIEN (no re-trabajar)
- **Seguridad backend sólida**: S2 (storage por claims) y S4 (RBAC claims) YA desplegados; dinero CF-only;
  callables con `verifyRole` server-side; CRM append-only intacto; sin secretos Wompi en el repo.
- **Núcleo Wompi correcto**: firma de eventos (dot-notation+timestamp+secreto, `timingSafeEqual`), firma de
  integridad server-side, re-consulta a la API como verdad, monto vs total congelado, match reference↔pedidoId,
  solo-APPROVED transiciona, tope $2.5M server-side, reserva atómica. Los P1 son en los **bordes**, no en el núcleo.
- **Inventario v3 REALMENTE implementado**: `crearPedidoCore` decrementa `cantidad` (no marca vendida toda la
  pieza); lote de 3 → vender 1 deja 2; refabricable-0 correcto; migración v3 con gate de invariantes. **TODO-40
  está en su mayoría HECHO** — el spec `modelo-inventario-multitipo` decía "pendiente comité" pero el código ya
  vive en prod. Restan solo pulidos (Bloque C).

---

## 1. Reestructuración de los planes pendientes (mapa nuevo)

La auditoría clarifica dependencias que las specs sueltas no veían. **Orden nuevo por riesgo + dependencia:**

| Bloque | Qué | Por qué ese orden | TODOs que absorbe |
|---|---|---|---|
| **A0** | Fix LOGIN | Incendio diario de Kary; independiente | TODO-64 |
| **A** | Hardening ruta del dinero (GATE pre-precios) | Wompi vivo; debe estar sano ANTES de precios | TODO-42, TODO-63 (reserva-reintento) |
| **B** | Fugas de datos / robustez admin | PII + pérdida de trabajo de Kary; barato | (nuevos H-CMS, H-SEC) |
| **C** | Pulidos inventario/POS/fiscal | Deuda latente, no sangra hoy | TODO-40 (resto), TODO-39/41 (notas) |
| **D** | Catálogo CDN + gema + filtros | Feature de escala; con prerequisitos que A/B despejan | TODO-37 paso 7, TODO-57, TODO-50 |
| **E** | Higiene: test rojo, versiones, deuda menor | Cierre limpio | TODO-03/04, brain |

**Dependencia dura descubierta**: el bake de `settings/gems` + añadir `badgeGem`/`gemFilterIds` al whitelist
del `catalogo.json` es **prerrequisito común** de 7b (paso 7), TODO-57 (filtros) y TODO-50 (catálogo lujo).
Se hace UNA vez en el Bloque D y desbloquea los tres.

---

## 2. BLOQUE A0 — Fix del bug de LOGIN (TODO-64) · P1 · PRIMERO

**Síntoma (Daniel 2026-07-03)**: "el login parpadea muchas veces antes de autenticar."
**Causa raíz (verificada ×2 adversarial)**: dos carreras + un enmascarador.

### A0.1 — H1: timeout mágico de 500ms (P1)
- **Dónde**: `js/admin/login.js:10` → `await new Promise(r => setTimeout(r, 500))` y luego redirige si
  `currentUser()` existe.
- **Mecánica**: `bj_auth` en sessionStorage (que el inline anti-flash de `admin.html:15` exige) SOLO se escribe
  cuando resuelve el `getDoc` del perfil dentro de `onAuthStateChanged` (`js/auth.js:78-80` → `cacheAuthHints`).
  En pestaña nueva (sessionStorage es **por-pestaña**), `_currentUser` se restaura de IndexedDB en <500ms pero
  el `getDoc` puede tardar más → a los 500ms login redirige a `admin.html` **sin `bj_auth`** → el inline rebota
  a login → la navegación **mata el `getDoc` en vuelo** → nunca se escribe `bj_auth` → **loop de flashes** hasta
  que en alguna iteración el `getDoc` gane la carrera. Con Firestore lento/caído = loop infinito.

### A0.2 — H2: ping-pong del rol `catalogo` (P1, el de Kary)
- **Dónde**: `js/auth.js:231-234` (requireAuth borra `bj_auth` y manda a `admin-login.html?error=forbidden`)
  + `js/admin/login.js:14` (fallback a `admin.html` cuando `profile` aún es `null`).
- **Mecánica**: Kary (rol `catalogo`, nivel 0) entra a `admin.html` (que pide `requireAuth('editor')`,
  `dashboard.js:13`) → requireAuth **borra `bj_auth`** y la manda a login → login a los 500ms con `profile:null`
  usa el fallback `: 'admin.html'` → la devuelve a admin.html → sin `bj_auth` el inline rebota → requireAuth
  vuelve a prohibir. **Ping-pong** hasta que el getDoc resuelva ≤500ms y caiga en `admin-piezas.html`.
  (Verificador bajó H2 a P2 "en conexión normal se autorresuelve en 1-2 rebotes", pero combinado con H1 y con
  Firestore frío es el que más flashes produce. Tratarlo como P1 junto a H1.)

### A0.3 — H3: el mensaje de error es código muerto (P2)
- **Dónde**: `admin-login.html:15` → `<script>if(location.search)history.replaceState(null,'',location.pathname)</script>`
  corre en el `<head>` (síncrono) ANTES que `login.js` (module, deferred) → cuando `login.js:19` lee
  `location.search`, ya está vacío → `?error=forbidden`/`?error=disabled` **nunca se muestran**.

### A0.4 — FIX (cambio coherente en 3 piezas, ADITIVO, no renombra nada — §3.2)
1. **`js/auth.js`** — exportar una promesa determinista **`sessionReady()`** que resuelva `{user, profile}`
   DENTRO del `onAuthStateChanged` de módulo (`auth.js:72-90`) **después** de que el `getDoc` del perfil
   complete (es decir, tras escribir `bj_auth`). Debe resolver también cuando `user===null` (rama `:84-87`,
   para que el form aparezca) y tratar `profile===null` con user vivo como **"no auto-redirigir"** (evita
   reintroducir el loop si el getDoc falla). Cambio **aditivo**: NO tocar `requireAuth`/`currentUser`/`signIn`.
2. **`js/admin/login.js`** — (a) **cablear los listeners del form PRIMERO** (síncrono, al inicio de `init`),
   (b) reemplazar el `setTimeout(500)` por `const s = await sessionReady()` y redirigir **una sola vez** con el
   rol **resuelto** (`s.profile?.role === 'catalogo' ? 'admin-piezas.html' : 'admin.html'`); si `s.user` existe
   pero `s.profile===null` → `signOut()` + quedarse en login con mensaje; (c) **mover la limpieza de la URL**
   aquí: leer `params` → mostrar error (mapear `forbidden` Y `disabled`) → luego `history.replaceState`.
3. **`js/auth.js` requireAuth** — cuando hay usuario AUTENTICADO pero rol insuficiente: **NO borrar `bj_auth`**
   (la sesión existe, solo el rol no alcanza) y **redirigir directo a la página del rol** (`catalogo` →
   `admin-piezas.html`) en vez de pasar por login. Si `_userProfile===null` (getDoc falló) sí ir a login.
4. **`admin-login.html:15`** — QUITAR el inline `history.replaceState` (se movió a login.js).

### A0.5 — Verificación (gate) + notas
- **Chrome (Claude, extensión `[[feedback_validacion_chrome_directa]]`)**: probar los **4 caminos** — (1) login
  manual, (2) sesión viva recargando `admin.html`, (3) **pestaña nueva con sesión viva**, (4) **rol `catalogo`
  entrando directo a `admin.html`** (el caso de Kary, el que más flasheaba). Cero parpadeos; máximo 1 rebote
  determinista.
- **Cache bump SW OBLIGATORIO** (§4): `admin-login.html` es shell servido por Pages; al cambiarlo, bump MAYOR
  `CACHE_NAME` en `public/sw.js` + actualizar `docs/05`. También bump si cambian `admin.html`/`admin-piezas.html`.
- **Lección → `30-LECCIONES`**: "sessionStorage `bj_auth` es por-pestaña → pestaña nueva SIEMPRE hace 1 rebote a
  login; NO migrar a localStorage (invariante del comité). El anti-flash inline NO se toca — el fix vive en el
  redirect determinista, nunca en timeouts." Documentarlo para que nadie lo reporte como regresión.
- **P3 de propina** (mismo archivo, hazlos ya): mapear `auth/network-request-failed` → mensaje español en
  `signIn`; en el catch de `handleLogin` no volcar `err.message` crudo en inglés.

---

## 3. BLOQUE A — Hardening de la ruta del dinero (GATE antes de cargar precios) · P1

> **Wompi está VIVO** (`WOMPI_WEB_ENABLED=true`) pero **dormido** (sin precios → botón oculto). Estos fixes son
> el **gate obligatorio** antes de que Daniel/Kary carguen precios. Todo con **tests en emulador EN ROJO primero**
> (regla del propio spec Wompi). Deploy functions = **MANUAL** (L-22). NO hay que apagar el flag: al no haber
> precios no hay superficie; pero **no cargar precios hasta cerrar A**.

### A.1 — qty>1 cobra 1 pero promete N (P1)
- **Causa**: `carrito.js:83` `subtotal = Σ price×qty`; la elegibilidad y el botón usan `subtotal`
  (`carrito.js:348,394`) pero el cliente manda solo `pieceId` sin qty (`carrito.js:527`→`pago-web.js:44`) y la
  CF cobra `entero(piece.price)` × **1 unidad** (`pedidos-core.js:184,216`). Pieza $1M qty 2 → botón "$2.000.000"
  pero Wompi cobra $1M y reserva 1. Caso inverso: $1.5M qty 2 → subtotal $3M > tope → **oculta** la opción aunque
  el cobro real ($1.5M) sí es elegible.
- **Fix (mínimo, coherente con "Comprar ahora, 1 pieza")**: en `carrito.js`, ofrecer Wompi SOLO cuando
  `rows.length===1 && rows[0].qty===1`, y pasar `rows[0].piece.price` (NO `subtotal`) a `wompiEligible`. El
  fallback de `carrito.js:353` ya re-selecciona un método válido cuando "wompi" desaparece. (Alternativa mayor:
  soportar qty en el server — NO ahora.)

### A.2 — Reintento tras DECLINED/cancelar NO funciona (P1) = el "refinamiento reserva-reintento" de TODO-63
- **Causa**: `pago-web.js:44` genera `nuevoPedidoId()` en **cada** clic → nuevo pedido → `evaluarStock` ve
  `cantidad:0` (por la reserva del propio comprador) → `PedidoError 'agotada'` (`pedidos-core.js:46-47`). DECLINED
  no libera (`:303-306`); el reaper tarda TTL 15min + GRACE 3min + tick ≈ **18 min**. El comprador con intención
  de pagar queda bloqueado por SU PROPIA reserva.
- **Fix (3 piezas, van juntas)**:
  1. **Cliente** (`pago-web.js` + `carrito.js`): persistir `pedidoId` **por pieza** en `sessionStorage` y
     REUSARLO en el reintento (patrón del POS, que sí conserva `_pedidoId` — `pos.js:126,246`). Limpiar la clave
     al éxito/expiración.
  2. **Server** (`pedidos-core.js` `iniciarPagoWebCore`, path idempotente `:170-173`): **añadir guard de estado**
     — hoy el path idempotente devuelve `total`+firma cobrable SIN verificar estado (`:224-227` firma
     incondicional). Si el pedido reusado ya NO está en `pago_pendiente` (expirado/pagado/cancelado) →
     **rechazar o crear pedido nuevo**, nunca devolver firma cobrable sobre una reserva ya liberada (→ evitaría
     `pagado_sin_stock`).
  3. **Opcional**: extender `reservaExpira` al reintentar sobre la misma reserva viva.
- **UX** (ya diseñada en TODO-63 §4): banner `role=status` "Apartamos tu pieza unos minutos — Reintentar pago" +
  botón activo de inmediato + fallback WhatsApp.

### A.3 — Idempotencia del webhook bloquea el APPROVED tardío de PSE/Nequi (P1)
- **Causa**: la llave `webhookEvents/{txId}` se escribe TAMBIÉN en eventos NO-APPROVED (`pedidos-core.js:305`),
  y el replay-guard sale temprano si existe (`:294`). Una misma transacción PSE/Nequi emite **varios** eventos
  (PENDING → APPROVED); el PENDING escribe la llave, y el APPROVED posterior cae en "replay" y se ignora → el
  pedido nunca pasa a `pagado` automáticamente (el reaper lo rescata como `a_revisar` = revisión manual).
  Confirmado contra la propia doc del repo (`skills/.../wompi-webhooks-validator/SKILL.md`).
- **Fix**: persistir la llave de idempotencia SOLO para estados **finales procesados** (APPROVED /
  monto-no-coincide / pagado-sin-stock); auditar los no-APPROVED con **id compuesto** `${txId}-${status}` (doc
  aparte), sin bloquear el reprocesamiento futuro del mismo txId. La idempotencia de replay de APPROVED sigue
  cubierta por la llave `{txId}` + el gate de negocio `ped.estado==='pagado'` (`:316-319`).
- **Nota**: aunque el MVP es "solo tarjeta", **PSE/Nequi son alcanzables HOY** porque la URL del checkout redirect
  no restringe métodos (`pago-web.js:51-65`). Este fix + A.4 son prerrequisito de habilitar PSE/Nequi formalmente.

### A.4 — `expiration-time` nunca se envía → amplía la ventana de `pagado_sin_stock` (P2, va con A)
- **Causa**: `pago-web.js:58` pasa `res.expirationTime` pero `iniciarPagoWebCore` **no lo genera ni retorna**
  (`pedidos-core.js:227`) → `kv()` devuelve null y se filtra → el link de Wompi vive para siempre; un pago horas
  después (reserva ya liberada) → APPROVED tardío → `pagado_sin_stock` (cobro real que exige reembolso manual).
- **Fix**: en `iniciarPagoWebCore` generar `expirationTime = ISO8601(nowMs + ttlMs)`, **incluirlo en la firma de
  integridad** (`firmaIntegridad` ya lo soporta — `wompi-core.js:26`) y retornarlo. "Lo firmado == lo enviado".
  `pago-web.js` ya lo propaga sin cambios.

### A.5 — Reaper: endpoint sin confirmar en código de PROD (P2, va con A)
- **Causa**: `functions/pedidos.js:145` `GET /transactions?reference=` lleva nota "⚠️ confirmar el endpoint
  exacto en sandbox". Si responde 4xx, `verificarPago` lanza → `liberarReservaCore` hace **skip siempre**
  (`pedidos-core.js:354`) → ninguna reserva vencida se libera jamás → **fuga de stock silenciosa** (piezas únicas
  "agotadas" para siempre). Dirección fail-safe para el dinero, pero grave para el inventario.
- **Fix**: verificar el endpoint real con la llave privada en sandbox (o en los logs del scheduler de prod tras
  una reserva vencida real: reportar `liberados>0`), quitar la nota, y **añadir alerta** si el reaper acumula N
  ticks con `revisados>0 && liberados==0`.

### A.6 — `pagado_sin_stock` y `a_revisar` no alertan a nadie (P2, va con A)
- **Causa**: ambos estados (dinero real cobrado sin pieza / venta pagada sin confirmar) se escriben en silencio
  (`pedidos-core.js:328,312`); no hay FCM/email. Dependen de que Kary abra el panel — con SLA legal de retracto
  (5 días) corriendo.
- **Fix**: `onDocumentUpdated` sobre `pedidos` que, al entrar el estado a `pagado_sin_stock`/`a_revisar`, encole
  una notificación (FCM al token de Kary — el stack ya tiene FCM — o email). Mínimo viable: la notificación; la
  cola visible en el panel puede ir en el Bloque D (panel admin).

### A.7 — reserva sobre pieza legacy sin `cantidad` la deja en -1 (P2, va con A o C)
- **Causa**: `evaluarStock` asume `cantidad??1` (`pedidos-core.js:44`) pero `aplicarConsumo` hace
  `increment(-1)` (`:56`) → sobre campo AUSENTE parte de 0 → -1; al liberar, `-1+1=0` → `derivarEstado='agotada'`
  → pieza vendible queda invendible tras un checkout abandonado. Las 32 actuales ya tienen `cantidad` (migración
  v3), pero un doc futuro por otro camino (import/consola) reintroduce el fallo.
- **Fix**: en `aplicarConsumo`, cuando `cantidadActual` viene del fallback legacy, escribir `cantidad` en
  **absoluto** (`tx.update` con el valor calculado) en vez de `increment(-1)`; O backfillar `cantidad` en TODOS
  los `pieces` antes de la carga masiva (TODO-40) y eliminar el fallback `??1`. (Elegir absoluto = más robusto.)

### A.8 — Datos del comprador que se pierden en el server (P2, va con A)
- **Causa**: `sanitizeShipping` (`pedidos-core.js:141`) descarta `docType`/`docNumber`/`countryIso2`; y
  `carrito.js:527` nunca envía `_tipoEntrega`. Kary recibe un pedido pagado sin saber si es recoger/enviar, sin
  la cédula que el propio código declara obligatoria (DIAN/guía/antifraude), y el teléfono sin indicativo.
- **Fix**: ampliar la whitelist de `sanitizeShipping` con `docType` (enum CC/CE/PP/NIT), `docNumber`,
  `countryIso2`; persistir `tipoEntrega` (pasarlo en el payload de `iniciarPagoWeb` desde `carrito.js` y validarlo
  contra `TIPOS_ENTREGA` server-side). También: enviar el teléfono a Wompi con indicativo — `waPhone(iso2, raw)`
  ya existe en `countries.js:60` y no se usa en `pago-web.js:62` (mejora el antifraude en montos altos).

### A.9 — Gate de encendido real (cuando Daniel quiera + precios)
Sin cambios de diseño respecto a `2026-06-28-wompi-checkout-web-design §13` (runbook): URL de Eventos en el panel
Wompi + 1 compra real de monto mínimo + validación Chrome por Claude. **Ese runbook solo se ejecuta con el Bloque
A cerrado.**

---

## 4. BLOQUE B — Fugas de datos y robustez del admin · P1/P2 (barato, alto valor)

### B.1 — Banner de colección: el × borra de Storage ANTES de guardar (P1)
- **Causa**: `js/admin/colecciones.js:188` — el handler del × llama `deletePieceImage(url)` **inmediato** (borra
  el objeto YA); el `bannerUrl` en Firestore solo cambia en `handleSave`. `×` + "Cancelar" deja el doc apuntando
  a un archivo borrado → **banner 404 en la web** sin que nadie guardara. Además el `catch{}` vacío traga errores
  reales de permiso/red y muestra el toast "Banner eliminado" igual (Kary cree que se borró).
- **Fix**: **borrado diferido** — el × solo limpia `_bannerUrl`/`_bannerLqip` y marca la URL vieja en
  `_bannerToDelete`; ejecutar `deletePieceImage(_bannerToDelete)` SOLO dentro de `handleSave` tras
  `saveCollection` exitoso. **Guard crítico** (cazado por el verificador): si tras el × se sube un banner nuevo,
  la subida usa la **misma ruta** `collections/{colId}/banner.{ext}` → hay que limpiar `_bannerToDelete` al subir,
  o comparar rutas antes de borrar, para no destruir el archivo nuevo. En el catch, usar `errorMessage(err,…)`
  con toast danger en vez de ignorar.

### B.2 — Email de reviews cosechable (P1→P2 tras verificación: feature dormida, pero mina)
- **Causa**: `reviewCreateValida()` admite `email` en el mismo doc (`firestore.rules:592`) y `allow read: if
  approved==true` expone el doc COMPLETO (`:725`) → cualquiera puede `query(reviews, approved==true)` y cosechar
  emails (Ley 1581). **Mitigante verificado**: `submitReview` no tiene callsites y no hay UI de aprobación → la
  feature está dormida, no hay fuga activa. Es una mina que estalla al activar reviews (TODO-48).
- **Fix (barato, hacerlo ya para desarmar la mina)**: quitar `email` del `hasOnly` de `reviewCreateValida` y
  ajustar `submitReview` (`js/firestore-service.js:512`) para no mandar `email` en el doc público (guardarlo
  aparte cuando TODO-48 construya reviews reales). Deploy reglas = MANUAL (L-22). Verificar en prod que no haya
  docs `reviews` con email (probablemente 0).

### B.3 — `inquiries` update sin whitelist (P2)
- **Causa**: `firestore.rules:743` `allow update: if isEditor()` — único recurso mutable sin `hasOnly`. Un editor
  puede reescribir por completo un lead (PII), inyectar claves, falsear `createdAt`/`_counted` (descuadra el
  contador de no-leídas). Rompe el patrón anti-inyección del propio archivo.
- **Fix**: `request.resource.data.diff(resource.data).affectedKeys().hasOnly(['status','_counted', …según el
  flujo real de "marcar leído"])` + `status` de lista cerrada; el contenido del lead queda inmutable.

### B.4 — Guard de cambios sin publicar del CMS solo cubre el cambio de pestaña (P2)
- **Causa**: `js/admin/contenido.js:38` — el `confirm('cambios sin publicar')` solo se dispara en `activate()`
  (hashchange interno). Si Kary navega por el sidebar / cierra pestaña / atrás con textos editados sin publicar,
  **pierde el trabajo en silencio** (no hay `beforeunload` en ningún archivo del scope).
- **Fix**: `window.addEventListener('beforeunload', e => { if (current?.isDirty?.()) { e.preventDefault();
  e.returnValue=''; } })` en `init()`.

### B.5 — CSV de leads: inyección de fórmulas (P2)
- **Causa**: `db.js:371` — `exportInquiriesCSV` exporta Nombre/Email/Mensaje (input público) solo escapando
  comillas. Un lead con nombre `=HYPERLINK(...)` se ejecuta como fórmula cuando Kary abre el CSV en Excel
  (exfiltración/ejecución clásica).
- **Fix**: neutralizar celdas que empiezan por `= + - @ \t \r` anteponiendo `'`: `const safe =
  /^[=+\-@\t\r]/.test(v) ? "'"+v : v;` en `downloadCSV`. Aplicar también al CSV del POS (`pos.js:384,406`) si
  exporta campos de origen humano.

### B.6 — P3 rápidos del admin (agrupar en 1 commit)
- Huérfanos en Storage: `deleteCollection` borra solo el doc → el banner queda (`db.js:274`); al eliminar
  colección, barrer `collections/{id}/` con `listAll`+`deleteObject` (patrón de `deleteAllPieceImages`).
- `dashboard.js:82` redefine un `esc()` más débil que el de `shared.js` → borrarlo e importar el de `shared.js`.
- Sidebar `soon:true` (7 ítems placeholder, `sidebar-data.js:18`): confirmar en `render-sidebar.js` que se pintan
  deshabilitados con badge "Pronto" y sin `href '#'` navegable (para Kary no-técnica parecen "botones rotos").

---

## 5. BLOQUE C — Pulidos inventario / POS / fiscal · P2/P3 (deuda, no sangra hoy)

### C.1 — Centralizar `reponerStock` (P2)
- **Causa**: la reposición está duplicada en `anularPedidoCore` (`pedidos-core.js:430-443`) y `liberarReservaCore`
  (`:369-378`) con comportamientos YA divergentes: la rama v3 de anular NO limpia `reservaId`/`reservaExpira`
  (solo el reaper lo hace) → pieza con "reserva fantasma" al anular un pedido web `pago_pendiente`. Y ninguna
  valida el `stockType` **actual**: si Kary cambió la pieza a `encargo` entre venta y anulación, `increment(+1)`
  crea `cantidad` en una pieza encargo (invariante roto `inventario-model.js:92-93`).
- **Fix**: extraer `reponerStock(tx, pieceRef, piece, pedidoId, motivo)` compartido que: (a) si el `stockType`
  actual es `encargo`, NO incrementa (solo audita en ledger); (b) limpia SIEMPRE `reservaId`/`reservaExpira`
  cuando `reservaId === pedidoId`.

### C.2 — Cierre Z: ventana por `createdAt` deja pagos de turnos posteriores fuera (P2)
- **Causa**: `pedidos-core.js:484` filtra por `createdAt`. Una venta transferencia/Wompi creada en turno 1
  (`pago_por_verificar`) y confirmada en turno 2 tiene `createdAt` en la ventana YA cerrada → **nunca** suma a
  ningún arqueo (subreporte al contador). Una venta en efectivo contada en el cierre 1 que se anula en turno 2 no
  se resta en ninguno.
- **Fix**: sumar por la fecha del **evento de dinero** (`confirmadoEn`, ya escrito en `:253,322`), no de creación;
  y asentar anulaciones post-cierre como línea negativa/`ajustesVentana` en el arqueo siguiente.
- **⚠️ Prerrequisito de TODO-39** (apartados/abonos): con abonos diferidos, el cruce de turnos deja de ser caso
  borde y pasa a ser el caso normal → **resolver C.2 ANTES de diseñar TODO-39**.

### C.3 — POS confirma total desde snapshot obsoleto de la pieza (P2)
- **Causa**: `pos.js:179` usa `_selected` fijado en `selectPiece` (`:125`) que el listener `on('pieces')`
  (`:50`) NUNCA refresca. Si otra sesión edita `price` mid-venta, el diálogo muestra el precio viejo mientras la
  CF cobra el nuevo (viola "nunca mostramos un total distinto al que se cobra", `pos.js:11`).
- **Fix**: en el callback de `on('pieces')`, si `_selected` existe re-buscar por id; si cambió `price`/`stockType`,
  actualizar `_selected` + `setupPriceMode`+`recalcTotal`, o avisar "⚠ el precio cambió" y forzar re-selección.

### C.4 — P3 fiscal/inventario (agrupar)
- Cierre Z inicializa `esperado = {efectivo,transferencia,wompi}` (`pedidos-core.js:487`) pero `MEDIOS` incluye
  `addi` → si se descongela ADDI, sus ventas no suman a ningún medio. Inicializar desde `MEDIOS`
  (`Object.fromEntries(MEDIOS.map(m=>[m,0]))`).
- Export contador: la comisión Wompi lleva IVA embebido en una cifra (`fiscal.js:34`) → devolver
  `{comisionBase, comisionIva}` y columna "IVA comisión" para el descontable del contador. (Relevante para
  TODO-41 factura multi-línea.)
- LQIP desalineado tras borrar/subir portada (`piezas.js:467`): al editar, rellenar `_uploadedLqips` con `''`
  hasta `images.length` para mantener la correspondencia por índice.

### C.5 — Notas para TODO-39 / TODO-41 (diseño futuro, NO implementar aquí)
- **TODO-41 factura multi-línea**: `crearPedidoCore` recibe UN `pieceId` y el candado atómico es ese doc; para
  multi-línea la tx deberá leer N piezas (reads antes de writes) y `aplicarConsumo` por línea con `movId` distinto
  (hoy `movId` default = `pedidoId` → colisionaría entre líneas — `pedidos-core.js:63`).
- **TODO-39 apartados/abonos**: no existe subcolección `pagos 1..N`; resolver C.2 primero (ver arriba).

---

## 6. BLOQUE D — Catálogo CDN + gema + filtros (paso 7 · TODO-57 · TODO-50) · escala

> **Prerrequisito común (hacerlo UNA vez, primero del bloque):** el `catalogo.json` debe exponer la gema y el
> `settings/gems`. Sin esto, 7b rompe el badge y TODO-50/57 no pueden construir filtros.

### D.0 — Prerrequisito gema en el JSON (desbloquea 7b + 57 + 50)
- **Causa**: `PUBLIC_SPEC_KEYS` (`generate-pieces.mjs:676`) NO incluye `badgeGem` ni `gemFilterIds`; las 32
  piezas ya los tienen pero `publicSpecs` los descarta → al conmutar el cliente al JSON (7b), `gem-badge.js` cae
  al fallback regex y los filtros no tienen sobre qué construirse.
- **Fix**: añadir `'badgeGem'`, `'gemFilterIds'` a `PUBLIC_SPEC_KEYS` (son públicos por diseño §151); hornear
  `settings/gems` en `catalogo.json` (espejando `publicCollection`, ya verificado que `buildCatalogJson` hornea
  colecciones); extender el selftest de contrato (`mjs:1020`) para cubrirlos. Declarar el índice `array-contains`
  de `gemFilterIds` en `firestore.indexes.json` antes de los filtros.

### D.1 — Bug de la query del SSG que MENGUA el catálogo en silencio (P2, arreglar ANTES de 7b)
- **Causa**: `generate-pieces.mjs:619` `where('visibilidad','!=','privada')` — en Firestore `!=` solo matchea docs
  donde el campo **existe**. Una pieza legacy SIN `visibilidad` desaparece del SSG/sitemap/`catalogo.json` **sin
  error**, y el guard anti-menguado (`:869-874`) no lo detecta porque `pieces` ya viene menguado de la query.
- **Fix**: leer la colección completa (sin `where`) y filtrar en memoria con `esPublica` (ya existe, `mjs:661`);
  o garantizar por contrato del admin-form que TODA pieza lleve `visibilidad` (backfill + validación al guardar).

### D.2 — 7b: cliente consume `catalogo.json` con SWR (el gran ahorro de costo)
- **Causa hoy**: el público abre `onSnapshot` a `pieces`+`collections` en CADA página (`data.js:61`) → costo
  Firestore escala 1:1 con el tráfico; `catalogo.json` (7a HECHO) lo haría gratis desde CDN.
- **Fix**: `data.load()` hace `fetch('/data/catalogo.json?v=<versión>')` con **SWR + flag `source`**, y deja
  Firestore live SOLO como **fallback a stale cacheado** (NO al `onSnapshot` masivo — un bad deploy no debe
  devolver todo el tráfico a Firestore en el pico). El SW **no** cachea el JSON (network-only por
  `request.destination` vacío, `sw.js:89-109`) → el SWR/fallback vive en `data.js` con su propio storage. URL
  versionada: inyectar `window.CATALOG_VERSION` en el HTML horneado o usar `no-cache + ETag` de Pages.
- **Prerequisito de contrato**: el shape del JSON ya es reproducible (tsSeconds `{seconds}`, `stockType`/
  `cantidad`, slug/id/code) — verificado; solo falta D.0 (gema) y D.1 (menguado).

### D.3 — Fix del caché síncrono CMS v64 (P2, arreglar con 7b porque comparte `data.js`)
- **Causa**: `data.js:196` — en el catch de `loadSiteContent`, `apply({})` PISA y **persiste `{}`** en
  localStorage; `hadCache` solo mira el caché del SDK Firestore, no el localStorage que `getSiteContent` ya
  hidrató (`:208-211`). Visita offline + caché Firestore vacío → pinta hero real de localStorage → la red falla →
  `apply({})` sobreescribe y **destruye el caché anti-flash** para la próxima visita.
- **Fix**: `if (!hadCache && !this._siteContent[page]) apply({})` — no degradar si ya hay contenido hidratado.
- **Bonus (P3)**: diff-gate por `version` deja docs sin `version` una sesión atrás (`data.js:189`) → tratar
  `version` undefined como cambiado. Y `pieza.js:168` usa `getSiteContent('global')` sin `loadSiteContent` → el
  WhatsApp del asesor queda stale en fichas abiertas por link directo; hacer `loadSiteContent('global')`
  fire-and-forget en `pieza.js init()` (o hornear el contacto global en el JSON).

### D.4 — 7c: read optimista solo en ficha + 7d: `repository_dispatch` blindado
- **7c**: `pieza.js` pinta del JSON al instante + 1 `getDoc` en background → badge "Agotado" pre-checkout. SOLO en
  ficha (no grilla/home). Reusar el patrón diff-gate PERO **corregir D.3 antes de clonarlo**.
- **7d**: al vender/anular, las CF de venta disparan `repository_dispatch` a Actions (rebuild ~1-2 min) en
  **try/catch que NO interrumpe la venta** + alerta a `salud`/`saludEventos` si falla (PAT en Secret Manager,
  scope mínimo). Guard inter-builds: el SSG debería comparar contra el `catalogo.json` publicado y abortar si cae
  >N% sin flag (para builds automáticos sin humano mirando).

### D.5 — TODO-57 (settings/gems + filtros) y TODO-50 (catálogo lujo) montan sobre D.0
Con la gema ya en el JSON: construir el `<select>` de taxonomía desde `settings/gems`, los filtros
`array-contains` sobre `gemFilterIds`, y retirar el regex fallback de `gem-badge.js`. Badges de escasez derivados
de `stockType`/`cantidad`/`refabricable` (modelo v3 ya soporta los datos).

### D.6 — P3 perf del catálogo (con D.2)
Grilla y riel pintan fotos como `background-image` de `<div>` → no hay `loading=lazy` posible below-fold
(`catalogo.js:152`, `pieza.js:441`). Con la carga masiva de inventario prevista, migrar a
`<img loading="lazy" decoding="async">` + conectar `imageLqip` como placeholder (doctrina §3.1).

---

## 7. BLOQUE E — Higiene y cierre

- **E.1** Test rojo `corte-insumos` R6 (§0.3): mover a los scripts `:integration` o `skip` sin emulador. NO tocar
  `functions/corte.js`.
- **E.2** `APP_VERSION` del sidebar (`sidebar-data.js`) sigue en `v31 · 2026-06-29` pese a cache `v64`: verificar
  si v64 tocó el shell admin y quedó sin bump (Kary usa esa versión para confirmar despliegues).
- **E.3** SHELL_ASSETS precachea `/img/hero-1200.webp` mientras el hero migró a `hero-*.avif/webp` 2200w
  (`sw.js:34`): confirmar el LCP real y actualizar (+ bump MAYOR).
- **E.4** Fallback `get(users/uid)` vencido (`firestore.rules:17`, `functions/index.js:33`): confirmar backfill de
  claims al 100% y eliminar la rama `get()` (o añadir `active!==false` en el fallback de `verifyRole`). Coordinar
  con §65/§66 en el mismo deploy de reglas.
- **E.5** `users` UPDATE permite acuñar `role:'owner'` desde la app (`firestore.rules:854`, el CREATE ya lo
  prohíbe): en update exigir que `role` no cambie a `'owner'`.
- **E.6** `pieces.price` sin cota ≥0 (`firestore.rules:403`): endurecer `d.price is number && d.price >= 0` — como
  el total del pedido nace del doc de la pieza, un dedazo negativo fluiría a un pedido Wompi. **Hacer con el
  Bloque A** (toca el dinero).

---

## 8. Orden de ejecución recomendado para Opus (gates entre bloques)

1. **A0 (login)** → gate Chrome 4 caminos + cache bump. *Es lo que Kary sufre hoy.*
2. **A (dinero)** → tests emulador rojo→verde + gate: **NO cargar precios hasta cerrar A**. E.6 entra aquí.
3. **B (fugas/robustez)** → barato, alto valor; reglas B.2/B.3 en 1 deploy manual.
4. **C (pulidos POS/fiscal)** → C.2 antes que cualquier diseño de TODO-39.
5. **D (catálogo CDN + gema)** → D.0→D.1→D.2/D.3→D.4→D.5→D.6 en ese orden.
6. **E (higiene)** → cierre; E.4/E.5 con un deploy de reglas.

**Reglas transversales para toda la implementación** (del cerebro, no negociables):
- IAP §3.4 antes de cada commit no-trivial · cambios **aditivos**, no renombrar IDs/clases/exports (§3.2).
- **Deploy reglas/functions = MANUAL** (L-22): `firebase deploy --only firestore:rules,firestore:indexes,functions`.
- **Cache bump SW** (§4) siempre que cambie un shell o comportamiento de estático; actualizar `docs/05`.
- **Tests por commit** + build verde (verificación pesada por hito, no por merge — `feedback_verificacion_por_hitos`).
- **Reflejo caza-bugs** (§G.4): recorrer el camino vivo end-to-end en las fronteras de estado-cero antes de cerrar.
- **Validación Chrome = Claude directo** (extensión), NUNCA prompt para Daniel (`feedback_validacion_chrome_directa`).
- **100% COP** · **cero-demo/ficción** · **arquitecto siempre** · marcar `[OPUS-4.8]` en commits.
- Al cerrar cada bloque: consolidar ADR en `99` + fila en `00`, lecciones a `30`, TODO-NN a ✅, `brain:check` sano.

---

## 9. Trazabilidad
- **Crudo verificado** (6 áreas × verificación adversarial): `../brain-private/bersaglio/2026-07-03-auditoria-holistica-6areas-CRUDO.json`.
- **Specs origen** (siguen válidas, este plan las prioriza/corrige, no las reemplaza): `2026-06-25-plan-maestro-comercio-v3`,
  `2026-06-28-wompi-checkout-web-design`, `2026-06-30-checkout-redesign-design`, `2026-06-26-b1-paso7-catalogo-cdn-design`,
  `2026-06-29-modelo-gema-design`, `2026-06-26-modelo-inventario-multitipo-design`.
- **Hallazgos NO-hallazgos** (la auditoría confirmó sano): §0.4.
