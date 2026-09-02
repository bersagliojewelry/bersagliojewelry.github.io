# 🧪 30 — LECCIONES Y DOCTRINAS (Gotchas técnicos y recetas)

> **Nodo neuronal: Memoria Procedimental.** Se consulta on-demand ante el **Trigger de Experiencia (`CLAUDE.md §G.2`)** ANTES de realizar refactorizaciones CSS, editar el Service Worker o depurar comportamientos de renderizado.
>
> **Mantenimiento (Frescura §G.4)**: registra aquí cada causa raíz de bug complejo o doctrina visual. **Tope ~350 líneas (§G.5)**. 🔗 **Hija [`31-LECCIONES-FIRESTORE`](31-LECCIONES-FIRESTORE.md)** (Firestore/CF/reglas/backend): L-29/34/35/36/37/38 en DETALLE allá; L-12/13/14/16/17 **migradas al maestro** (allá queda su stub) (el kernel lee las defs `### L-NN` SOLO de `30`, L-31 → el **stub de 1 línea DEBE quedar aquí**). 🔗 **Hija [`32-LECCIONES-CARGA`](32-LECCIONES-CARGA.md)** (carga/LQIP/View Transitions/caché SWR público): L-45/46/47/49/50/51/52/53/61 en DETALLE; stub aquí. 🔗 **Hija [`33-DOCTRINAS-CSS`](33-DOCTRINAS-CSS.md)** (doctrinas de diseño CSS / Liquid Glass / tipografía — NO `L-NN`). **Nuevas lecciones backend→`31`, carga→`32`, + stub aquí; doctrinas de diseño→`33`.**

---

## 🎨 Doctrinas CSS y Diseño "Liquid Glass" → hoja [`33-DOCTRINAS-CSS`](33-DOCTRINAS-CSS.md)

Las doctrinas de diseño/CSS (arquitectura CSS modular · estética editorial premium / glassmorphism · tipografía Cormorant/Manrope/Space Mono) se movieron a la hija **[`33-DOCTRINAS-CSS`](33-DOCTRINAS-CSS.md)** (§G.5 sharding por saturación de `30`). Consúltala ante un Trigger de Experiencia de CSS/diseño. Las lecciones `L-NN` siguen aquí abajo.

---

## 💻 Gotchas Técnicas y Reglas de Código

### L-01: iOS Safari Scroll Lock en Drawers ⇒ **migrada al maestro**: [[BERS:L-01]]
Cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo · punto de retorno del ABORT).

### L-02: Caché del Service Worker y Evitación de FOUC
*   La versión de caché se incrementa en `public/sw.js` (ej. `bersaglio-v3` ➔ `bersaglio-v4`).
*   Cada shell HTML incluye una sección de **Critical CSS inline** (tokens base + reset + skip-link + fade-in inicial). Sin esto, la carga asíncrona de las hojas de estilo mediante `rel="preload"` produce destellos de contenido sin estilo (FOUC).

### L-03: Renderizadores de Producto Únicos (DRY)
*   `renderPieceCardHTML(piece)` en `js/components/piece-card.js` es el **único renderizador de tarjetas de producto**.
*   Toda grilla que muestre piezas (destacados, catálogo, carrito, relacionados) DEBE usar este helper para evitar desalineación visual o duplicación de markup.

### L-04: Contrato del Header Flotante
*   El header pill flotante tiene `position: fixed; pointer-events: none` para no bloquear los clicks debajo de su área transparente lateral. El elemento interno `.header-aqua-pill` tiene `pointer-events: auto` para que el menú sí sea clickable.
*   Si se altera esta estructura, se pueden bloquear clicks en toda la parte superior del sitio web.

### L-83: Dinero + listeners = jamás decidir en automático sobre foto incompleta (traslado duplicado $5.6M) ⇒ **migrada al maestro**: [[BERS:L-83]]
Cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo · punto de retorno del ABORT).

### L-82: HUECO EN BLANCO en carga fría → SKELETON (reusa el componente real, no reserva-en-blanco); NO acelerar con live-upgrade sobre PRECIOS (bait-and-switch). → ADR §178
### L-86: Cuando un flujo gana un LIBRO nuevo, el camino de DESHACER lo hereda en el MISMO commit — y un vigilante que compara cada libro consigo mismo jamás ve una fuga ENTRE libros. → `35-LECCIONES-DINERO`
### L-85: Idempotencia con destino TEMPORAL (el "turno abierto") NO se copia de una con destino determinista: hay que ANCLAR el destino en el doc de la 1ª escritura. → `35-LECCIONES-DINERO`
### L-84: `err.code` de un callable llega PREFIJADO (`functions/failed-precondition`) → toda tabla/`includes` por code falla en silencio y el motivo real del servidor se pierde. → `35-LECCIONES-DINERO` ⇒ **migrada al maestro**: [[BERS:L-84]]
### L-81: `enforceTurno:false` NO es "suave", es un HUECO — ventas huérfanas fuera del arqueo. → `35-LECCIONES-DINERO` [detalle] · **TODO-70 ✅ §173**
### L-80: En una superficie del panel donde el usuario espera la VERDAD del dinero/estado (ventas recientes, caja, cartera), NUNCA la alimentes con una lectura de-UNA-vez (`getDocs`/`ultimasVentas`) re-disparada por acciones locales (`loadX()` imperativo): se pudre ante cambios de OTRA sesión o del cierre del turno → exige refrescar (F5) — inaceptable con dinero. Usa un listener robusto (`subscribeWithRetry`/`onSnapshot`) que re-pinta solo; el `getDocs` de una vez queda solo para exports on-demand. Corolario (puntero encadenado): si pintar un estado espera 2 snapshots secuenciales (p.ej. `caja/estado`→`onTurnoChange`), siembra el estado OPTIMISTA con el dato que devuelve la CF y deja que el listener reconcilie — pero NO pre-fijes la clave del puntero (`_cajaEstado.turnoAbiertoId`), porque `id===prev` cancelaría el re-cableado de los listeners de turno. → §172 `js/admin/pos.js`+`auditoria.js`
### L-79: Un panel/acción SECUNDARIA tras una acción de DINERO nunca puede impedir el cierre del estado de esa acción. POS F2.1: abrir el panel "adjuntar cliente" ANTES de `resetSale()` podía, si lanzaba (DOM/dato faltante), dejar `_pedidoId` sin rotar → la venta SIGUIENTE reusa el UUID → `crearPedido` devuelve `yaExistia` → **venta perdida EN SILENCIO con toast de éxito** (lo cazó el comité de regresión, no los tests). Regla: en el handler de éxito corre reset/limpieza PRIMERO (o en `finally`); lo secundario (banner/panel) DESPUÉS en `try/catch`, con su estado capturado POR VALOR (nunca el global que el reset regenera). El botón por fila (`data-id`) = camino AUTORITATIVO (sin traslape A/B). Corolario UI: para lo dinámico NUEVO usa DOM seguro (`createElement`/`textContent`) — el hook de seguridad bloquea `innerHTML` con interpolación aunque uses `esc()`. → F2.1 §171 `js/admin/pos.js`
### L-78: Habilitar un rol NUEVO end-to-end es un FRENTE completo, no la CF nueva sola. `caja` (F2.0) quedó a medias: reglas + `rolDeCaja` lo distinguen para turno/bóveda, pero `crearPedido` usa `rolDeVentas` y `pedidos`-read = `isVentas` (sin `caja`), y el cliente (`ROLE_LEVELS`/`roleLanding` de `auth.js`) no lo conoce → el usuario del rol NO opera (no vende, no lee, mal landing). Checklist al crear un rol: (1) reglas, (2) TODOS los gates de las CF que debe invocar, (3) read-rules de lo que lee, (4) jerarquía + landing del cliente. Bug adyacente: calcular el rol en tiempo de IMPORT del módulo (antes de `requireAuth`) da `null` → calcularlo TRAS la auth (en init). → F2.0 B5b-1
### L-77: Un rol que NO puede LEER una colección (bóveda = owner-only, discreción D7) no puede derivar su estado client-side. Para una métrica OPERATIVA (efectivo del cajón), el operador con permiso (owner) usa el ledger real (listener exacto y reload-proof); el rol sin permiso cae a un contador EN MEMORIA por sesión — NUNCA localStorage (invariante del comité: "nada de dinero/PII en storage"). La AUTORIDAD del dinero es siempre el recompute server (el cierre), jamás la vista estimada. → F2.0 B5b-1 `js/admin/pos.js`
### L-76: Test de idempotencia con `opId==docId` (create-if-not-exists): NO uses `Promise.all` + XOR `a.yaExistia!==b.yaExistia` — el emulador aborta una de las dos tx bajo contención extrema (en prod el cliente reintenta) → falso rojo flaky. Como el docId único hace la duplicación IMPOSIBLE por construcción, usa `Promise.allSettled` + asera el ESTADO FINAL (1 solo doc · saldo no duplicado · puntero correcto), tolerando 1 abort. La carrera concurrente pura pruébala aparte con opId DISTINTOS (tolera rechazos). → F2.0 B3
### L-75: Tests de integración que comparten un CONTADOR global (`contadores/pedidos`) se contaminan si dos `*.integration.test.mjs` corren en el MISMO emulador (`node --test a.mjs b.mjs`) → los `numero` correlativos chocan (falso fallo con pinta de regresión). Cada `test:X:integration` asume su emulador limpio (los scripts npm lo aíslan). Ante un fallo de correlativo al combinar suites: correr por SEPARADO antes de gritar "regresión". → F2.0 B2
### L-74: Invariante "SOLO UNO abierto/activo" (turno de caja, sesión única…) = **puntero singleton transaccional**, NO `query where estado=='abierto'` (TOCTOU: dos aperturas concurrentes leen "ninguno" y crean dos). Un doc `caja/estado {turnoAbiertoId}`: la CF lo lee+escribe en la MISMA `runTransaction` que crea/cierra → Firestore serializa por ese doc (1 gana, la otra reintenta y falla `failed-precondition`). O(1), sin índice. Idempotencia: `opId == docId` (create-if-not-exists). SIEMPRE un test de carrera (`Promise.allSettled` de 2 → exactamente 1 fulfilled). → F2.0 B1 `functions/caja-core.js`
### L-73: Un nombre de subcolección alimenta un `collectionGroup` GLOBAL. Antes de reusar un nombre (`movimientos`, `pagos`…) para un subsistema NUEVO, `grep collectionGroup('<nombre>')`: si existe un consumidor (aging CxC = corte/salud/reconciliación agrupan por `parent.parent.id`), tu colección lo contamina/infla su full-scan aunque el grouping "salve" hoy. Nombre DISTINTO por dominio (`movsCaja` ≠ `movimientos`). Reglas: cada match explícito basta; añade un match `collectionGroup` SOLO si el dominio necesita cross-doc. → F2.0 B0b
### L-72: El mapa de estados es SSoT COMPARTIDO: toda vista que pinte estados (POS, Pedidos, exports) importa `estadoPedido()` de pedidos-format — un mapping local ("trinario") se pudre en silencio cuando el backend suma estados Y ofrece acciones imposibles ("Confirmar pago" sobre un entregado/expirado). Al añadir estados: grep de quién mapea estados a mano. Cazado en el gate E2E. → §167
### L-71: MCP Firebase `firestore_query_collection` NO matchea campos timestamp con `string_value` — devuelve `[]` SIN error (falso "no hay datos": trampa en monitoreo de `pedidos`/ventas). Para consultas por fecha usar `firestore_list_documents` con `orderBy: "createdAt desc"` + mask; ante un `[]` sospechoso, re-probar con ventana amplia ANTES de concluir "0 resultados". → monitoreo post-§164
### L-70: Un caché local (localStorage/SDK) solo mata el flash de contenido CMS en visitas REPETIDAS — la 1ª visita de un dispositivo nuevo exige HORNEAR el contenido en el HTML del build (SSG re-hornea por push+cron); y el preload debe re-apuntarse a lo que el renderer pintará con los DATOS reales (semilla: memoria > localStorage > horneado > defaults). → §163
### L-69: El "LCP real" se verifica contra el RENDERER vivo (quién pinta qué), no contra un preload/etiqueta heredada — un preload huérfano descarga con `fetchpriority=high` algo que jamás se pinta Y compite con el LCP; precachearlo consagra el error. → §161
### L-68: Path IDEMPOTENTE que retorna el recurso reusado debe REFRESCAR el input mutable del reintento (shipping/entrega) — descartarlo en silencio pierde correcciones del usuario (pedido pagado con datos viejos). Lo derivado del recurso (total/firma) queda intacto. → §161
### L-67: Fechas en negocio = reloj INYECTABLE (`opts.hoy`, default fecha real). Fixture de fechas fijas + código con reloj real = bomba de tiempo (test se pone rojo sin commit — `corte-insumos` R6 murió jun→jul). → §160.2
### L-66: Redirect de login = DETERMINISTA (`sessionReady()` resuelve TRAS escribir `bj_auth`), NUNCA timeout. Rol insuficiente → SU landing, no al login. Pestaña nueva = 1 rebote esperado (sessionStorage por-pestaña; NO localStorage). → §159
### L-65: `secrets:set` (gen2) NO re-empaqueta `functions/.env` → tras cambiar env vars no-secretos, `deploy --only functions` COMPLETO → 31
### L-64: Proveedor que contrata el transporte = obligación de RESULTADO → trasladar al consumidor el riesgo de TRÁNSITO es cláusula abusiva (Ley 1480 Art.43, se asume no escrita); solo el riesgo ADUANERO es del comprador. Texto legal: verificar AMENDMENTS vigentes (Ley 2439/2024: reembolso retracto 30→15 días cal), no solo la ley base. → §157.11-13
### L-63: Dos flotantes `fixed` en la misma esquina (cookie banner ↔ FAB asesoría) se pisan → el consentimiento manda; bandera `body.bj-cookie-active` + el FAB cede por CSS (regla después de `.is-revealed` gana por orden) + banner z-210 > FAB z-200 → §156.19
### L-62: crash pinch-zoom iOS = MEMORIA; fix = RESTAR capas en móvil (content-visibility + quitar `filter:blur`), NUNCA promover GPU → §156.18
### L-61: Artefactos del SSG (`dist/`) → verificar con `vite preview`, NO el dev server (sirve la fuente). → `32-LECCIONES-CARGA`
### L-05: Preview headless (Claude Preview MCP) no recalcula estilos dinámicos ⇒ **migrada al maestro**: [[BERS:L-05]]
Cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo · punto de retorno del ABORT).

### L-58: Verificar UI dinámica con EMULADOR + seed (prod vacío o L-05 te limita)
El sitio en dev conecta SOLO a emuladores (`firebase-config.js`, hostname localhost). Receta: (1) `firebase emulators:start --only firestore`; (2) `FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 node functions/seed-piezas.mjs` (seed idempotente doc-id=slug, aborta sin la env var); (3) `npm run dev` + `preview_eval` lee CTAs/hrefs/dataLayer. **Gotcha carrera §123.4**: el 1er snapshot de `data.load()` puede resolver ANTES de suscribir `onChange(refresh)` → home/ficha en skeleton; para VERIFICAR fuerza un refresh (toggle wishlist/`refreshFeatured()`); en prod no pasa. Piezas `seedDemo:true` vivieron en prod (excepción §121) hasta 2026-06-27 BORRADAS. **Alternativa sin emulador (§143)**: Chrome REAL → `import('/js/core/data.js')` → `data._pieces=[…]`+`_loaded=true`+`data._notify()`. → ADR §120 · `[[feedback_no_demo_en_index]]`

### L-59: Desplegar reglas `read` row-level — la query pública DEBE igualar el set legible (ADR §131)
Regla `read` POR-FILA (`visibilidad != 'privada'`) sobre una colección pública. 3 trampas: (1) una query que devuelva UN doc denegado FALLA ENTERA → la query pública filtra EXACTAMENTE al set legible (`where` espeja la regla) Y backfill/borra los legacy sin el campo ANTES de desplegar (si no, catálogo roto). (2) catálogo legítimamente VACÍO NO aborta el build/SSG (distínguelo del fallo "se leyeron pero la proyección las perdió"). (3) escribir/borrar prod exige consentimiento explícito; ADC ≠ auth del CLI/MCP (puede dar PERMISSION_DENIED con el CLI logueado).

### L-87: Landing pages de FACETA (SEO categoría/gema) — detalle ADR §184
Hornea `/coleccion/<slug>`+`/gema/<slug>` reusando el shell del catálogo capturado ANTES de que `injectListingPage` voltee robots (si no, falla el anclaje `noindex`); umbral ≥N piezas (anti-thin); cero-demo; `__BJ_FACET` hidrata la grilla pre-filtrada (gema=`tieneGema`); SIN cache bump. **Gotcha**: la hidratación visual no se ve en headless (L-05) ni en Chrome de automatización (ambiental) → verifica con L-58 o visitante real; filtro por lógica vs `catalogo.json`.

### L-60: Importar datos reales de fuente externa (certificados QR → SPA) — pipeline reusable (ADR §132)
Cargar inventario masivo desde fotos con QR a una página de terceros. Receta (32 piezas TrueLab): (1) **QR de fotos** = `jsqr`+`sharp` (RGBA raw; upscale ×2-3+sharpen+recortes; varias variantes); `jsqr`/`tesseract` se instalan `--no-save` y se podan → reinstalar. (2) **Página SPA** (WebFetch da cáscara) → Chrome MCP navegando como usuario (`history.pushState`+`PopStateEvent` recorre N rutas en 1 `evaluate_script`; el SPA se autentica solo — NUNCA replicar su credencial). (3) **OCR** (tesseract) NO fiable para un código exacto → usa el id EXACTO del SPA. (4) clasificación = montage etiquetado (1 lectura por N). (5) carga a prod = MCP Firestore. (6) no inventar lo no certificado.

### L-06: Reveal-on-scroll robusto (anti-invisibilidad) ⇒ **migrada al maestro**: [[BERS:L-06]]
Cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo · punto de retorno del ABORT).

### L-07: Optimizar PNG pesados del handoff antes de servir ⇒ **migrada al maestro**: [[BERS:L-07]]
Cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo · punto de retorno del ABORT).

### L-08: Mirror ≠ rebuild — auditar el estado real antes de "reconstruir" ⇒ **migrada al maestro**: [[BERS:L-08]]
Cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo · punto de retorno del ABORT).

### L-09: Preview headless — los screenshots mueren con CUALQUIER blur pesado (amplía L-05) ⇒ **migrada al maestro**: [[BERS:L-09]]
Cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo · punto de retorno del ABORT).

### L-10: El critical-CSS inline puede driftear de los tokens externos ⇒ **migrada al maestro**: [[BERS:L-10]]
Cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo · punto de retorno del ABORT).

### L-11: Verifica el HOSTING real antes de escribir headers/CSP/redirects ⇒ **migrada al maestro**: [[BERS:L-11]]
Cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo · punto de retorno del ABORT).

### L-12: Testear Firestore rules sin Java local — vía CI (zero-budget; JDK ya local Temurin 25). → detalle en `31-LECCIONES-FIRESTORE` ⇒ **migrada al maestro**: [[BERS:L-12]]
### L-13: Reglas `validate` tolerantes a merge updates — idiom `!('x' in d) || d.x is T` (presencia primero). → `31-LECCIONES-FIRESTORE` ⇒ **migrada al maestro**: [[BERS:L-13]]
### L-14: NO quitar el fallback de config PÚBLICA de Firebase sin confirmar secrets de CI (tumbó prod). → `31-LECCIONES-FIRESTORE` ⇒ **migrada al maestro**: [[BERS:L-14]]
### L-16: Reglas de seguridad — los tests "felices" no bastan; revisar adversarialmente el PAYLOAD de create (`hasOnly`, rol, pertenencia, list≠get). → `31-LECCIONES-FIRESTORE` ⇒ **migrada al maestro**: [[BERS:L-16]]
### L-17: Testear Cloud Functions — lógica pura (sin emulador) + integración (con emulador); recompute idempotente. → `31-LECCIONES-FIRESTORE` ⇒ **migrada al maestro**: [[BERS:L-17]]
### L-18: En DEV la app conecta a los emuladores Firebase → cómo verificar UI auth-gated ⇒ **migrada al maestro**: [[BERS:L-18]]
Cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo · punto de retorno del ABORT).

### L-19: Roles que no son jerárquicos — no forzarlos en la escala de niveles ⇒ **migrada al maestro**: [[BERS:L-19]]
Cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo · punto de retorno del ABORT).

### L-20: Una escritura secundaria (telemetría) no debe tumbar un flujo crítico (login) ⇒ **migrada al maestro**: [[BERS:L-20]]
Cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo · punto de retorno del ABORT).

### L-21: Verificar la estructura de CADA hoja de un Excel heredado (no extrapolar) ⇒ **migrada al maestro**: [[BERS:L-21]]
Cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo · punto de retorno del ABORT).

### L-15: Datos privados del negocio NUNCA al repo (sobre todo si es público) ⇒ **migrada al maestro**: [[BERS:L-15]]
Cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo · punto de retorno del ABORT).

### L-22: El CI de este repo NO despliega reglas/índices/functions — solo Hosting/Pages
`firebase-deploy.yml` usa `FirebaseExtended/action-hosting-deploy` = **Hosting only**; `deploy.yml` = GitHub Pages. Ambos en push a `main`. NINGUNO despliega `firestore.rules`, `firestore.indexes.json` ni Cloud Functions → **mergear a `main` NO los despliega**; hay que `firebase deploy --only firestore:rules,firestore:indexes,functions` **manual** (CLI logueado). Corolario crítico: **código en `main` ≠ desplegado** — las reglas/functions del CRM estaban en el código pero `recalcSaldoCliente` NO existía en prod (`firebase functions:list` lo confirmó) hasta el deploy manual. Verificar el estado real de prod (`functions:list` / `git fetch`), no el playbook (§3.3). Orden de lanzamiento: **desplegar functions ANTES de migrar** (el cargador hace poll esperando a `recalcSaldoCliente`). Caso: ADR §47 (corrigió un supuesto erróneo del playbook de `10`).

### L-23: Un script Admin SDK (`node`) necesita ADC — `firebase login` NO sirve ⇒ **migrada al maestro**: [[BERS:L-23]]
Cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo · punto de retorno del ABORT).

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

### L-32: App Check "no válidas" 96-100% — leer el CUERPO del 403, no adivinar (ADR §57→§58)
"No válidas" = token presente pero RECHAZADO (el SDK web manda dummy si su canje falla) → misconfig real, NUNCA propagación (eso es "desactualizados"). Receta: (1) red del navegador → `exchangeRecaptchaV3Token` 403; (2) replicar el canje a mano y leer el CUERPO — `grecaptcha.execute(widgetId,…)` (por widgetId, NO por site key = falso "Invalid site key"); (3) el body dicta el fix: `API_KEY_SERVICE_BLOCKED` = la API key sin "Firebase App Check API" en su allowlist (el hardening Tier A la restringió §54) → GCP→key→Restricciones→añadir la API. **Meta-regla: al instalar un servicio Google nuevo, revisar las API restrictions de la key PRIMERO.** No Enforce hasta ~100% ×7 días.

### L-30: App Check directo (sobre Firestore) cierra denial-of-wallet con UN init — no reescribas los forms (ADR §54)
El hueco de escritura pública (`create:if true`+apiKey pública → spam agota cuota) NO se cierra reescribiendo cada form a callable (eso es defensa posterior). Core fix: `initializeAppCheck(app,{provider:ReCaptchaV3Provider(key)})` en UN punto (`firebase-config.js`) → adjunta token a CADA petición, sin tocar forms ni reglas. Rollout: (1) gatear por la key (ausente → no-op, misma red que L-14); (2) skip en dev; (3) el init NO bloquea por sí solo (el bloqueo es el Enforcement de consola); (4) monitor→enforce solo cuando el tráfico legítimo ya llega tokenizado. Regla: cierra el hueco con la pieza mínima; la robustez extra es follow-up.

### L-29: Aging/mora "en vivo" sin infra — FIFO puro + `collectionGroup` SIN filtros (evita índice/`FAILED_PRECONDITION`) + fecha round-trip; trampas de calendario JS. → `31-LECCIONES-FIRESTORE`
### L-28: El Consejo Externo puede SIMPLIFICAR — a veces lo correcto es menos máquina (ADR §50)
Gemini (Consejo Externo) refutó un hardening interno para la escala real (344 clientes): saldo síncrono O(M) en la tx (no incremental+cronjob), sin backfill (COP ya entero exacto; migrar $506M cuadrados = riesgo), DIAN por Adapter (no acoplar el schema a UBL) → más simple y correcto. Regla: una 2ª opinión adversarial puede QUITAR sobre-ingeniería, no solo añadir rigor. Evaluar como peer review (adoptar/refutar CON razón, nunca en bloque). EXT (CMS WYSIWYG): también puede CONFIRMAR sumar complejidad (iframe) — pero se ADOPTA por TU evidencia en código, refutando su retórica ("Game Over" XSS del editor de confianza).

### L-31: Kernel del cerebro compartido ×3 — escape del pre-commit + salvamento de deliberaciones por transcript *(renumerada 2026-06-09: era L-28 duplicada)*
Lección de gobernanza del kernel ×3 repos (escape del pre-commit + salvar deliberaciones por transcript). **Detalle completo → [`34-LECCIONES-META`](34-LECCIONES-META.md) §L-31** (movida por capacidad §G.5, 2026-07-10).

### L-27: Verificar el REPO tras un subagente — no fiarse del reporte (truncado/socket/pasos omitidos) ⇒ **migrada al maestro**: [[BERS:L-27]]
Cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo · punto de retorno del ABORT).

### L-26: Daniel mergea Desarrollo→main por PR en GitHub durante la sesión — `git fetch` SIEMPRE
Dos veces (lanzamiento PR #189; Fase R PR #191) `origin/main` avanzó **solo** mientras yo trabajaba: Daniel ve los commits en `Desarrollo` y mergea el PR en GitHub. Implicación: el estado de `main`/deploy NO es lo que dice mi ref local → `git fetch` antes de afirmar nada (§3.3). El **sitio** se despliega por ese merge (CI on-push-a-main), pero **reglas/functions NO** (L-22) → esas las despliego yo a mano. Patrón: yo commiteo en `Desarrollo` (conviene pushear para que él vea/mergee el PR); el merge a `main` + deploy del sitio lo dispara su PR; el deploy de reglas/functions es manual mío. Caso: ADR §47, §49. **EXT (§75)**: Daniel puede mergear `Desarrollo→main` ANTES de que termines de verificar → publica UI con bugs (caso PR #223: M2a con 2 bugs de dinero antes de mis fixes). **UI de dinero: verificar ANTES de pushear a `Desarrollo` o avisar "no mergees aún"; tras su merge, comprobar el bundle EN PROD y rushear el fix.**

### L-25: Subir un major de dependencia crítica — verificar, no asumir (firebase-functions v6→v7) ⇒ **migrada al maestro**: [[BERS:L-25]]
Cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo · punto de retorno del ABORT).

### L-24: Verificar SIEMPRE los datos tras una migración (la fila "TOTAL" del Excel se cuela) ⇒ **migrada al maestro**: [[BERS:L-24]]
Cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo · punto de retorno del ABORT).

---

## 🧠 Meta-lecciones del cerebro/proceso (M-NN) — DETALLE → hoja [`34-LECCIONES-META`](34-LECCIONES-META.md)

> Cómo opera/falla el cerebro (Autocrítica §G.4). Sharded a `34` (§161); stubs aquí (kernel lee `### M-NN` de `30`, M-06).

### M-01: No imprimir un campo de estado del manifest como "hecho" sin gate que verifique su artefacto → 34
### M-02: Una lección sobre estado verificable-por-comando (git/build) debe volverse GATE, no prosa [HONOR] → 34
### M-03: Un campo `last` de tracking nace null/baseline, nunca con fecha que finja una ejecución → 34
### M-04: La memoria del harness deriva en silencio (fuera de `docs/`, el linter no la cubre) → 34
### M-05: Edité un subsistema bajo UNA lente y lo di por bueno sin probar el camino vivo (§89 · caza-bugs/W-10) → 34
### M-06: El kernel acopla `### L-NN` a `30` → shard = stub-en-30 + detalle-en-hija (§96) [HONOR] → 34
### M-08: El `05` no FIJA a mano hechos verificables-por-comando (hash PROD) — stale ×3, git=SSoT (§114) [HONOR] → 34
### M-07: Los node:tests NO corren en CI (solo `test:rules`) → test-rot silencioso tras refactor de render (§104) [HONOR] → 34
### M-09: Muestrear ≠ contar — extrapolé de la 1ª pág de una lista paginada (GBP: "mayoría de 85 sin responder"; real 74/85 sí) [HONOR] → 34
### M-23: Sello del 05 caducó ×2 (A2-§175 reincidente §192) — re-sellar ≠ fix; gate kernel sello-vs-git → TODO-71 → 34
