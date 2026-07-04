# 🗺️ 20 — MEMORIA ESPACIAL (Arquitectura de archivos y flujos)

> **Nodo neuronal: Memoria Espacial.** Se consulta on-demand ante el **Trigger de Desorientación (`CLAUDE.md §G.2`)**: *"¿dónde vive este componente/módulo/ruta?"* o al refactorizar la estructura de archivos.
>
> **Mantenimiento (Reflejo de Frescura §G.4)**: actualizar al crear, renombrar o mover archivos. **Tope ~280 líneas (§G.5)**.

---

## 🧭 Mapa físico del repositorio

```
.
├── .claude/
│   └── launch.json
├── .github/
│   └── workflows/
│       ├── deploy.yml          # GitHub Pages auto-deploy (push a main)
│       └── firebase-deploy.yml
├── css/                        # CSS modular por página (NO existe style.css monolito)
│   ├── liquid-glass.css        # Design system: tokens (incl. --ease-*/motion) + primitivas + .reveal
│   ├── components.css          # Header/footer/drawers + dock "Atajos" (.qd-*)
│   ├── home.css                # Home (incl. Atelier redesign, Films, Redes)
│   └── nosotros · contacto · pieza · catalogo · journal · admin · …  (1 por página)
├── js/
│   ├── core/                   # Núcleo de la aplicación
│   │   ├── boot.js             # Lazy-imports de páginas según body[data-page]
│   │   ├── router.js           # Enrutamiento hash + pushState + viewTransitions
│   │   ├── data.js             # Envoltura de listeners de Firestore
│   │   ├── cart.js             # Manejo de carrito local + sincronización cross-tab
│   │   ├── wishlist.js         # Manejo de lista de deseos
│   │   ├── html.js             # Tagged templates html`` + escape() + mount()
│   │   ├── format.js           # Formateadores numéricos y de fechas
│   │   ├── reveal.js           # Reveal-on-scroll (IntersectionObserver + fallback robusto)
│   │   ├── live-query.js       # subscribeWithRetry: onSnapshot robusto que RE-SUSCRIBE (infra neutral: público + CRM, §93/§98)
│   │   └── perf-probe.js       # sonda de arranque GATEADA (?perf=1) — desglose por tramo de la cascada admin (TODO-33 'medir primero'); no-op si off
│   ├── components/             # Componentes de UI modulares
│   │   ├── header.js           # Navbar pill flotante + mobile drawer
│   │   ├── footer.js           # Footer modular 4 columnas
│   │   ├── cart-drawer.js      # Carrito lateral + iOS scroll lock
│   │   ├── wishlist-drawer.js  # Wishlist lateral + share WhatsApp
│   │   ├── cookie-banner.js    # Banner de consentimiento
│   │   ├── email-modal.js      # Modal de suscripción a newsletter (25s)
│   │   ├── search-overlay.js   # Buscador inteligente Cmd+K / "/"
│   │   └── quick-dock.js       # Dock "Atajos" (isla de agua arrastrable, global)
│   ├── home/                   # Secciones del Home (1 módulo c/u — sin monolito)
│   │   ├── hero·marquee·categories·featured·editorial·services·atelier·journal-preview·cta
│   │   └── films.js · social.js  # secciones nuevas (datos en js/data/home-media.js)
│   ├── data/
│   │   ├── journal.js          # Datos del journal (hardcoded, Firestore-ready)
│   │   └── home-media.js       # FILMS + SOCIAL (Firestore-ready; TODO: fuentes reales)
│   ├── pages/                  # Módulos controladores por página
│   │   ├── home.js             # Compositor: importa js/home/* + suscribe Firestore
│   │   ├── catalogo.js         # Filtros, ordenación y grilla de piezas
│   │   ├── pieza.js            # Galería, specs, tallas y similares de pieza individual
│   │   ├── nosotros.js         # 11 secciones (timeline, equipo, manifiesto)
│   │   ├── contacto.js         # Formulario + radios de motivo + 3 sidebar cards
│   │   └── ...                 # otros controladores (carrito, entrada, journal)
│   ├── firebase-config.js      # Configuración del SDK
│   ├── firestore-service.js    # Envoltura de base de datos Firestore (800+ líneas)
│   └── admin/                  # Panel administrativo privado (estilo oscuro)
│       ├── shared.js           # initSidebar() monta el rail (renderSidebar) + auth/toast/admConfirm
│       ├── sidebar-data.js     # NAV como DATO (grupos→items, rol, placeholders) — IA "C" (F-CHASIS-A §50)
│       ├── render-sidebar.js   # renderSidebar() PURO (datos→HTML, testeable) — único origen del rail
│       ├── saldo-format.js     # color/etiqueta del saldo por tokens .adm-money (sin hex)
│       ├── lead-format.js      # estado/color/origen del pipeline de leads (Bandeja, F4 §53)
│       ├── consultas.js        # Bandeja de leads (pipeline 5 estados + convertir a cliente)
│       ├── pedidos.js          # Módulo Pedidos F1-PUENTE (lista+detalle read-only en vivo) — helper pedidos-format.js
│       ├── db.js · piezas.js · colecciones.js · cuentas.js · cuenta.js · config.js · dashboard.js · salud.js
│       └── (nav NO duplicada en HTML; cada admin*.html tiene <aside> vacío que llena shared.js)
├── public/                     # Archivos estáticos copiados a dist/ en el build
│   ├── sw.js                   # Service Worker (Caché bersaglio-v9; versión vigente en 05)
│   └── img/                    # Activos gráficos optimizados (Vite publicDir)
├── docs/                       # Cerebro Neuronal Documental
├── package.json                # Vite, Firebase, GSAP, Lenis, lightningcss
└── vite.config.js              # Auto-descubrimiento de HTMLs + copiado de snippets
```

---

## 🔄 Flujos de datos e invariantes

### 1. Inicialización y Enrutamiento (`boot.js` ➔ `router.js`)
*   Al cargar la página, `js/core/boot.js` lee el atributo `<body data-page="[key]">`.
*   Carga dinámicamente el módulo correspondiente en `js/pages/[key].js` y ejecuta su función `init()`.
*   El header pill flotante y componentes compartidos se inicializan globalmente desde `js/components.js`.

### 2. Sincronización en Tiempo Real (`data.js` ➔ UI)
*   `js/core/data.js` suscribe a Firestore (`onSnapshot`) para `pieces` y `collections`.
*   Cualquier cambio hecho en el panel administrativo (`admin.html`) escribe a Firestore, actualiza la versión en `system/meta.lastDataUpdate`, y dispara un callback global que refresca las vistas públicas en runtime vía `db.onChange()`.

### 3. CRM — Cuentas por cobrar / fiado (Fase 3) — ADRs §42–§49
**Operación centralizada en Kary** (memoria `project-crm-kary-sole-operator`): solo Kary (admin) + Daniel (owner) acceden; **las vendedoras NO tienen usuario** — son una **entidad de datos** (`vendedoras/{id}`) que Kary gestiona. Reestructura Fase R = ADR §49.
*   **`firestore.rules`** (raíz) — RBAC del CRM, **admin/owner-only** (`clientes`/`movimientos`/`vendedoras`). Validadores: `clienteValido()` (whitelist `hasOnly`, bloquea `saldoActual`, usa `vendedoraId`), `movimientoValido()` (no nace anulado; `monto>=0`), `vendedoraValida()` (nombre + `activa` bool). Quitados en Fase R: `isVendedora()`, `clienteOwnerUid()`, bloque `solicitudesCorreccion`.
*   **`functions/index.js`** — gestión de usuarios (`createUser`/`updateUserRole`, roles `admin`/`editor`) + trigger **`recalcSaldoCliente`** (`onDocumentWritten` sobre `clientes/{id}/movimientos/{movId}` → transacción compartida `recalcularSaldoCliente()` → recomputa `saldoActual`, ADR §43; **blindado §64**: fallo → evento en `saludEventos` + re-lanza) + callables **`reconciliarCartera`** y **`repararSaldo`** (admin, §64) + **RBAC claims §65**: `verifyRole` lee el claim del token (fallback dual al doc) + trigger **`syncRoleClaim`** (reconciliador Auth↔`users/{uid}`: rol→claim, `active`→`disabled`, revoca tokens al degradar). Runtime Node 22 + firebase-functions v7 (ADR §48).
*   **`functions/backfill-claims.mjs`** (§65, ADC, excluido del deploy) — backfill único de custom claims a los usuarios existentes (preflight solo-lectura por defecto; `--aplicar` escribe+verifica). Orden de despliegue del frente B → ADR §65.7.
*   **`functions/saldo.js`** — función PURA `computeSaldo(movimientos)` (signo por tipo). Testeable sin emulador.
*   **`functions/salud.js` + `functions/reconciliacion.js`** (§64) — red de seguridad del dinero: `compararSaldos()` PURA + `runReconciliacion()` (full-scan con re-verificación puntual anti falsa-alarma) + scheduled `reconciliacionDiaria` (3:30 AM Bogotá; el backup de `backup.js` corre 3:00 y reporta a `salud/backup`).
*   **Tests del CRM**: `tests/firestore-rules.test.mjs` (29, `npm run test:rules`) + `functions/saldo.test.mjs` (12, `test:saldo`) + `functions/saldo.integration.test.mjs` (5, `test:saldo:integration`). JDK local `30 §L-12`.

**UI del CRM + Ventas (Panel de Kary)** — páginas admin (`css/admin.css` **cristal claro emerald** — tokens `--adm-text:#122820` / tarjetas `#fff` / bordes emerald, NO oscuro; `admin-*.html` + `js/admin/*.js`, auth `requireAuth(rol)`/`hasRole`):
*   **`js/crm-service.js`** — capa de datos del CRM, **desacoplada** del `firestore-service.js` público (charter §3). Clientes/movimientos/config + **vendedoras** (`onVendedorasChange`/`createVendedora`/`updateVendedora`) + `carteraTotals`/`carteraPorVendedora` (por `vendedoraId`) + `fmtCOP`. `addMovimiento` escribe `fecha` real (mora) + **`onAllMovimientosChange`** (listener collectionGroup para el aging de la lista, §51).
*   **`js/crm-estado-cuenta.js`** — helper PURO de **mora/aging** (espejo de `functions/saldo.js`): `estadoCuenta(movs,{hoy,diasPlazo,fechaCorte})` → vencido + rangos 1-30/31-60/+60 por FIFO. Sin Firestore (test `tests/estado-cuenta.test.mjs`, `npm run test:estado`). ADR §51. Color/etiqueta de estado en `js/admin/saldo-format.js`.
*   **`admin-cuentas.html` + `js/admin/cuentas.js`** (✅): lista de clientes con saldo + cartera total/por vendedora + **cumpleaños del mes** (link WhatsApp) + modal nuevo cliente (asigna vendedora desde la colección) + búsqueda. Filas → ficha. Link "Cuentas" gateado en `shared.js`. (Fase R: quitada la bandeja de solicitudes.)
*   **`admin-cuenta.html` + `js/admin/cuenta.js`** (✅, ficha): saldo en vivo (`onClienteChange`) + historial + factura/abono + anular + **corregir saldo** (ajuste) + **editar cliente** (incl. reasignar vendedora). El saldo lo pone la CF.
*   **`admin-config.html` + `js/admin/config.js`** (✅): fecha de corte + datos del negocio (`config/negocio`) + **días de plazo** + **gestión de Vendedoras** (crear/desactivar) + **tablero de Pendientes** (colección `pendientes`). Acceso vía ⚙ en el topbar de Cuentas.
*   **`admin-salud.html` + `js/admin/salud.js`** (✅ §64, UI owner-only / reglas admin): semáforo backup·cuadre·fallos + tabla de descuadres (botón **Reparar** → callable) + registro de fallos (**Marcar resuelto**) + **Reconciliar ahora**. Primer uso de `httpsCallable` en el cliente (import lazy en `crm-service.js`).
*   **`admin-pos.html` + `js/admin/pos.js`** (✅ §126, "Mostrador"/POS, `requireAuth('catalogo')`): Kary registra una venta de UNA pieza → elige pieza disponible (`estado≠vendida`) → precio (FIJO si la pieza trae `price`, o POR PESO con `calcularPrecio` reusado de §124) → medio de pago → confirma → CF **`crearPedido`** (stock atómico, total recalculado server-side, idempotente por UUID). "Ventas recientes" lee `pedidos` (staff). Transporte aislado en **`js/pedidos-service.js`** (callables + `ultimasVentas`; reusable web/WhatsApp, §3.6). La UI ESPEJA a la CF (total visible = cobrado). Menú "Ventas → Mostrador" `role:catalogo`. **Operaciones (§128/§129)**: confirmar pago ("vi la plata" `por_verificar`→`pagado`), anular (VOID, reintegra la pieza), cierre de caja (arqueo Z a ciegas → descuadre). **CFs** `crearPedido`/`confirmarPago`/`anularPedido`/`cierreCaja` (núcleos en `functions/pedidos-core.js`, testeables; wrapper `pedidos.js`); colecciones `pedidos`/`contadores`/`arqueo` = escritor CF-only (reglas). **Export al contador (§130)**: botón → CSV bruto/comisión/retenciones/neto (`js/admin/fiscal.js` `calcularNeto` PURO, tasas param-driven "verificar"; client-side, sin CF).
*   **`admin-pedidos.html` + `js/admin/pedidos.js`** (✅ F1-PUENTE · TODO-68, `requireAuth('catalogo')` = regla de lectura): lista + detalle **READ-ONLY en vivo** de `pedidos` (todos los canales) — comprador/cédula/teléfono (botón WhatsApp vía `waPhone` de `core/countries.js`)/entrega + copiar dirección/resumen; deep-link `?id=` (destino del push A.6). Helper PURO `js/admin/pedidos-format.js` (censo de estados en paridad con `pedidos-core.js`; test `npm run test:pedidos`). Listener `onPedidosChange` (subscribeWithRetry) en `js/pedidos-service.js`. Acciones/transiciones de estado = F1-CORE (CF `avanzarPedido`).
*   **Migración (ADR §47)**: `tools/extraer-kardex.py` (Excel→JSON local; filtra fila TOTAL, L-24) + `functions/cargar-migracion.mjs` (Fase A) + `functions/seed-pendientes.mjs`. **344 clientes de Kary en prod**, cartera $506.510.780.
*   ✅ **Morosos/Vencidos (aging) DESPLEGADO a prod 2026-06-07** (ADR §51, PR #199): mora EN VIVO (helper puro `crm-estado-cuenta.js`, sin CF/denormalización) + `fecha` real en movimientos + KPI cartera vencida + vencidos en rojo + orden por mora en la lista CxC. Materialización de `diasVencido` + paginación = F6.
*   **ACUERDOS DE PAGO / plan de cuotas** (spec `superpowers/specs/2026-06-12-acuerdos-de-pago-design.md`; construido, **gateado por `config/cartera.acuerdosActivos`** hasta el deploy de reglas): `clientes/{id}/acuerdos/{id}` (cuotas embebidas, cierre one-way, renegociar = batch atómico `reemplazaA`, anular = owner). Fórmula: TRAMOS en `crm-estado-cuenta.js` (`acuerdoEsValido` + `opts.acuerdos/horizonteDias` → `plan`/`bajoAcuerdo`). UI: `cuenta.js` (toggle "¿en cuotas?" + modal `acuerdo-modal` renegociación) · generador puro `js/crm-acuerdos.js` (quincena = 15 y fin de mes) · sello "En acuerdo de pago" en `saldo-format.js` · vigilancia en `auditoria-cartera.js` (`acuerdosSobreMora`/`acuerdosAnomalos`/`renegociacionesSeriales`). **Costuras asesor futuro (TODO-19)**: `asesorId` en `clienteValido` (espejo `vendedoraId`, sin UI) + `rolAlCrear` sellado en el acuerdo + `config/cartera.acuerdoMaxSinAprobacion` RESERVADA (sin consumidor aún — la regla del asesor la usará).

> **Eliminado en Fase R (ADR §49)**: la app de vendedora (`vendedora.html`, `vendedora-cliente.html`, `js/vendedora/*`), el rol `vendedora` (auth/login/functions) y el flujo `solicitudesCorreccion`. "vendedora" pasó de rol/usuario → atributo `vendedoraId` del cliente, gestionado por Kary.

**Colecciones del CRM en Firestore**:
| Colección | Quién escribe | Regla clave |
|---|---|---|
| `clientes/{id}` | admin/owner | `saldoActual` lo pone solo la CF; `vendedoraId` opcional (=id de `vendedoras`, o "Directo de Kary") |
| `clientes/{id}/movimientos/{id}` | admin/owner | tipo∈{apertura,factura,abono,ajuste}; anular≠borrar |
| `vendedoras/{id}` | admin/owner | entidad de datos (`nombre`, `activa`); la gestiona Kary en Configuración |
| `config/{docId}` | admin (write) | read: solo `config/status` público; resto admin |
| `pendientes/{id}` | admin | tablero de setup para Kary |
| `salud/{backup\|reconciliacion}` | SOLO Cloud Functions | singletons (pisar); read admin; write `false` (§64) |
| `saludEventos/{id}` | SOLO Cloud Functions | fallos del recálculo; el panel solo marca `resuelto` (whitelist + sello `request.time`) |

Modelo de roles: rol en `users/{uid}.data.role` ∈ {owner, admin, editor} (fuente de verdad) **espejado a un custom claim del token** (§65, `syncRoleClaim`); reglas/functions leen el claim PRIMERO (fallback dual al doc en transición). **Gestión de usuarios = OWNER-only**: la página es `requireAuth('owner')` y las reglas de `users/` create/update son owner-only (§66) — un admin no muta docs de usuario. **Desactivar = la CF `deactivateUser` deshabilita la cuenta en Auth** (§66; un `active:false` en el doc NO bloquea por sí solo); `signIn`/`requireAuth` además rechazan `active:false`. **CRM = solo owner/admin (Daniel/Kary)**; `editor` (contenido web) EXCLUIDO del CRM; el rol `vendedora` ya no existe. Jerarquía: Daniel(owner) → Kary(admin); vendedoras = datos.

### 4. Panel v2 — Navegación como DATO (F-CHASIS-A, 2026-06-07) — ADR §50
**Norte del sistema completo (mini-ERP)**: `docs/superpowers/specs/2026-06-07-bersaglio-arquitectura-maestra-design.md` (v3, incluye Consejo Externo §16). Fases F-CHASIS-A→F9.
*   **Rail como dato**: `js/admin/sidebar-data.js` (`NAV` = grupos→items con `role` y `soon`) + `js/admin/render-sidebar.js` (`renderSidebar()` PURO, testeado en `tests/render-sidebar.test.mjs`, `npm run test:sidebar`). `shared.js initSidebar()` lo monta en el `<aside class="adm-sidebar">` vacío de cada `admin*.html` (**ya NO se duplica la nav**; hamburguesa en `wireSidebarToggle`). Grupos IA "C": Hoy · CRM (Clientes, Bandeja) · Ventas · Cobranza · Catálogo/Inventario · Reportes · Sistema (Vendedoras, Usuarios, Config). Gating por rol declarativo (item.role).
*   **Design-system de dinero**: clase `.adm-money` (Space Mono + tabular-nums) + `saldo-format.js` (`saldoClass/saldoLabel/saldoCellHTML`, color por tokens, **sin hex**); stat-cards con `min-width:0`/`clamp` (fin de números desbordados); `#confirm-dialog` propio (`.adm-confirm`) en ficha + config.
*   **F4 Bandeja ✅ construido** (ADR §53): pipeline de leads (5 estados + origen + convertir-a-cliente) sobre `inquiries` evolucionada (NO colección `leads` aún); helper puro `lead-format.js`. La colección `leads` formal + ingestión por CF + App Check = F6.
*   **Pendiente (futuras fases del spec)**: F6 escala+hardening (App Check, agregados, leads formales, paginación) · F7 ventas+facturación+pagos (event-driven, CF callable = único escritor, saldo síncrono O(M)) · F8 inventario (único+lote). Evolución C→B (conmutador de áreas) sin reescribir.
