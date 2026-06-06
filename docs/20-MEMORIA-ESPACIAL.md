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
│       ├── db.js               # Conexión Firestore admin con versión y auditoría
│       ├── piezas.js           # Control de piezas admin
│       └── colecciones.js      # Control de colecciones admin
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

### 3. CRM — Cuentas por cobrar / fiado (Fase 3, Bloque 1 · backend) — ADR §42
Backend del CRM (aún SIN UI; las pantallas son Bloques 3-4). Vive en archivos ya existentes:
*   **`firestore.rules`** (raíz) — RBAC del CRM. Helpers: `isVendedora()`, `clienteOwnerUid()` (tolerante a cliente directo de Kary), `clienteValido()` (whitelist `hasOnly`, bloquea `saldoActual`), `movimientoValido()` (no nace anulado; `monto>=0`).
*   **`functions/index.js`** — rol `vendedora` (`ROLE_LEVEL`/`createUser`/`updateUserRole`) + trigger **`recalcSaldoCliente`** (`onDocumentWritten` sobre `clientes/{id}/movimientos/{movId}` → transacción → recomputa `saldoActual`, Bloque 2 ADR §43).
*   **`functions/saldo.js`** — función PURA `computeSaldo(movimientos)` (aritmética del saldo, signo por tipo). Testeable sin emulador.
*   **Tests del CRM**: `tests/firestore-rules.test.mjs` (57, `npm run test:rules`) + `functions/saldo.test.mjs` (12, `test:saldo`) + `functions/saldo.integration.test.mjs` (5, `test:saldo:integration`, emulador Functions+Firestore). JDK local `30 §L-12`.

**UI del CRM (Panel de Kary, Bloque 3 — en curso)**: páginas admin (estilo oscuro `css/admin.css`, patrón `admin-*.html` + `js/admin/*.js`, auth `requireAuth`/`hasRole`).
*   **`js/crm-service.js`** — capa de datos Firestore del CRM, **desacoplada** del `firestore-service.js` público (límite de módulo, charter §3). Clientes/movimientos/solicitudes/config + `carteraTotals`/`carteraPorVendedora` + `fmtCOP`.
*   **`admin-cuentas.html` + `js/admin/cuentas.js`** (✅): lista de clientes con saldo + cartera total/por vendedora + modal nuevo cliente + búsqueda. Filas → ficha. Link "Cuentas" en las 6 páginas admin, gateado en `shared.js`.
*   **`admin-cuenta.html` + `js/admin/cuenta.js`** (✅, singular = ficha): saldo en vivo (`onClienteChange`) + historial + registrar factura/abono (modal) + anular (admin). El saldo lo pone la CF; la UI solo agrega/anula y observa.
*   **`admin-config.html` + `js/admin/config.js`** (✅): fecha de corte de migración + datos del negocio (`config/negocio`). Acceso vía ⚙ en el topbar de Cuentas.
*   En **Cuentas** además: bandeja de **solicitudes de corrección** (aprobar→anula el movimiento+marca aprobada / rechazar) + **cumpleaños del mes** (link WhatsApp).
*   **Bloque 3 (Panel de Kary) ✅ COMPLETO** (ADR §44). ⚠️ "cuentas atrasadas" (spec §7) diferido (necesita modelo de vencimiento).

**App de vendedora (Bloque 4 ✅, ADR §45)** — móvil-first, scoped, shell propio (`.vend-*`, sin sidebar):
*   **`vendedora.html` + `js/vendedora/cuentas.js`**: mis clientes (tarjetas) + mi cartera + nuevo cliente (a su nombre).
*   **`vendedora-cliente.html` + `js/vendedora/ficha.js`**: saldo en vivo + movimientos + ➕factura/abono + **solicitar corrección** (no anula). `js/vendedora/ui.js` = helpers lean.
*   Auth: `auth.js requireAuthExact(['vendedora','admin','owner'])` (membresía exacta — `vendedora` NO está en `ROLE_LEVELS`, es un eje aparte, L-19). `login.js` redirige por rol (vendedora→`vendedora.html`). `crm-service.onClientesDeVendedora` filtra por `vendedoraUid` (el `list` sin filtro lo deniegan las reglas).
*   Verificación funcional del CRM (todos los bloques): emuladores+`npm run dev`+login (`30 §L-18`) o desplegar.

**Colecciones nuevas en Firestore** (canal-agnósticas, spec `crm-cuentas-design.md`):
| Colección | Quién escribe | Regla clave |
|---|---|---|
| `clientes/{id}` | admin (todo) · vendedora (crea SUS clientes, scoped a `vendedoraUid==auth.uid`) | vendedora NO edita/borra; `saldoActual` lo pone solo la CF |
| `clientes/{id}/movimientos/{id}` | admin (todo) · vendedora (append: solo `factura`/`abono` a su cliente) | **append-only** para vendedora (update/delete solo admin) |
| `solicitudesCorreccion/{id}` | vendedora (crea PENDIENTE sobre su cliente) · admin (aprueba/rechaza) | vendedora no se auto-aprueba |
| `config/{docId}` | admin (write) | read: solo `config/status` público; resto admin/vendedora |

Modelo de roles: rol en `users/{uid}.data.role` ∈ {owner, admin, vendedora, editor}. CRM lo usan owner/admin (=Kary/Daniel) y vendedora; `editor` (contenido web) queda EXCLUIDO del CRM. Jerarquía negocio: Daniel(owner) → Kary(admin) → vendedoras.
