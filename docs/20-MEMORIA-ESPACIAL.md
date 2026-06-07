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
│   │   └── reveal.js           # Reveal-on-scroll (IntersectionObserver + fallback robusto)
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
│       ├── db.js · piezas.js · colecciones.js · cuentas.js · cuenta.js · config.js · dashboard.js
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
*   **`functions/index.js`** — gestión de usuarios (`createUser`/`updateUserRole`, roles `admin`/`editor`) + trigger **`recalcSaldoCliente`** (`onDocumentWritten` sobre `clientes/{id}/movimientos/{movId}` → transacción → recomputa `saldoActual`, ADR §43). Runtime Node 22 + firebase-functions v7 (ADR §48).
*   **`functions/saldo.js`** — función PURA `computeSaldo(movimientos)` (signo por tipo). Testeable sin emulador.
*   **Tests del CRM**: `tests/firestore-rules.test.mjs` (29, `npm run test:rules`) + `functions/saldo.test.mjs` (12, `test:saldo`) + `functions/saldo.integration.test.mjs` (5, `test:saldo:integration`). JDK local `30 §L-12`.

**UI del CRM (Panel de Kary)** — páginas admin (oscuro `css/admin.css`, `admin-*.html` + `js/admin/*.js`, auth `requireAuth('admin')`/`hasRole`):
*   **`js/crm-service.js`** — capa de datos del CRM, **desacoplada** del `firestore-service.js` público (charter §3). Clientes/movimientos/config + **vendedoras** (`onVendedorasChange`/`createVendedora`/`updateVendedora`) + `carteraTotals`/`carteraPorVendedora` (por `vendedoraId`) + `fmtCOP`.
*   **`admin-cuentas.html` + `js/admin/cuentas.js`** (✅): lista de clientes con saldo + cartera total/por vendedora + **cumpleaños del mes** (link WhatsApp) + modal nuevo cliente (asigna vendedora desde la colección) + búsqueda. Filas → ficha. Link "Cuentas" gateado en `shared.js`. (Fase R: quitada la bandeja de solicitudes.)
*   **`admin-cuenta.html` + `js/admin/cuenta.js`** (✅, ficha): saldo en vivo (`onClienteChange`) + historial + factura/abono + anular + **corregir saldo** (ajuste) + **editar cliente** (incl. reasignar vendedora). El saldo lo pone la CF.
*   **`admin-config.html` + `js/admin/config.js`** (✅): fecha de corte + datos del negocio (`config/negocio`) + **días de plazo** + **gestión de Vendedoras** (crear/desactivar) + **tablero de Pendientes** (colección `pendientes`). Acceso vía ⚙ en el topbar de Cuentas.
*   **Migración (ADR §47)**: `tools/extraer-kardex.py` (Excel→JSON local; filtra fila TOTAL, L-24) + `functions/cargar-migracion.mjs` (Fase A) + `functions/seed-pendientes.mjs`. **344 clientes de Kary en prod**, cartera $506.510.780.
*   ⚠️ "cuentas atrasadas" (aging) diferido a **Fase M** (usará la fecha real del movimiento + `config/negocio.diasPlazo`).

> **Eliminado en Fase R (ADR §49)**: la app de vendedora (`vendedora.html`, `vendedora-cliente.html`, `js/vendedora/*`), el rol `vendedora` (auth/login/functions) y el flujo `solicitudesCorreccion`. "vendedora" pasó de rol/usuario → atributo `vendedoraId` del cliente, gestionado por Kary.

**Colecciones del CRM en Firestore**:
| Colección | Quién escribe | Regla clave |
|---|---|---|
| `clientes/{id}` | admin/owner | `saldoActual` lo pone solo la CF; `vendedoraId` opcional (=id de `vendedoras`, o "Directo de Kary") |
| `clientes/{id}/movimientos/{id}` | admin/owner | tipo∈{apertura,factura,abono,ajuste}; anular≠borrar |
| `vendedoras/{id}` | admin/owner | entidad de datos (`nombre`, `activa`); la gestiona Kary en Configuración |
| `config/{docId}` | admin (write) | read: solo `config/status` público; resto admin |
| `pendientes/{id}` | admin | tablero de setup para Kary |

Modelo de roles: rol en `users/{uid}.data.role` ∈ {owner, admin, editor}. **CRM = solo owner/admin (Daniel/Kary)**; `editor` (contenido web) EXCLUIDO del CRM; el rol `vendedora` ya no existe. Jerarquía: Daniel(owner) → Kary(admin); vendedoras = datos.

### 4. Panel v2 — Navegación como DATO (F-CHASIS-A, 2026-06-07) — ADR §50
**Norte del sistema completo (mini-ERP)**: `docs/superpowers/specs/2026-06-07-bersaglio-arquitectura-maestra-design.md` (v3, incluye Consejo Externo §16). Fases F-CHASIS-A→F9.
*   **Rail como dato**: `js/admin/sidebar-data.js` (`NAV` = grupos→items con `role` y `soon`) + `js/admin/render-sidebar.js` (`renderSidebar()` PURO, testeado en `tests/render-sidebar.test.mjs`, `npm run test:sidebar`). `shared.js initSidebar()` lo monta en el `<aside class="adm-sidebar">` vacío de cada `admin*.html` (**ya NO se duplica la nav**; hamburguesa en `wireSidebarToggle`). Grupos IA "C": Hoy · CRM (Clientes, Bandeja) · Ventas · Cobranza · Catálogo/Inventario · Reportes · Sistema (Vendedoras, Usuarios, Config). Gating por rol declarativo (item.role).
*   **Design-system de dinero**: clase `.adm-money` (Space Mono + tabular-nums) + `saldo-format.js` (`saldoClass/saldoLabel/saldoCellHTML`, color por tokens, **sin hex**); stat-cards con `min-width:0`/`clamp` (fin de números desbordados); `#confirm-dialog` propio (`.adm-confirm`) en ficha + config.
*   **Pendiente (futuras fases del spec)**: F1 `estadoCuenta` · F2 fecha real/aging · F4 Bandeja/leads (reemplaza "Consultas") · F7 ventas+facturación+pagos (event-driven, CF callable = único escritor, saldo síncrono O(M)) · F8 inventario (único+lote). Evolución C→B (conmutador de áreas) sin reescribir.
