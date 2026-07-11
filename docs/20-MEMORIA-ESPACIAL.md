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
│       ├── hoy.js               # Página "Hoy" = pulso del negocio read-only (F-IA-2 B3; ex dashboard.js) — helper hoy-format.js
│       ├── bandeja.js           # Bandeja ÚNICA de aprobaciones (F-IA-2 B4, owner): monta aprobaciones.js (cartera M2b) + sección bóveda (aprobarEventoCaja); badge vivo = aprob-badge.js (en shared.js)
│       ├── db.js · piezas.js · colecciones.js · cuentas.js · cuenta.js · config.js · salud.js (ya SIN aprobaciones → Bandeja)
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

### 3-4. Panel admin / CRM / POS / Pedidos → `docs/21-ESPACIAL-ADMIN.md` (hija, shard §G.5)
Todo lo espacial del PANEL vive en la hija: CRM (cuentas/movimientos/acuerdos/vendedoras), UI admin
(`admin-*.html` + `js/admin/*`), POS Mostrador, módulo Pedidos + código público §166, Panel v2
(nav como dato), colecciones de Firestore del negocio y modelo de roles.
