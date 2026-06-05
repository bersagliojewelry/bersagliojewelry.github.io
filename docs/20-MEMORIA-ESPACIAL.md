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
│   ├── sw.js                   # Service Worker (Caché bersaglio-v7)
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
