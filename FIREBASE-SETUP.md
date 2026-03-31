# Bersaglio Jewelry — Documentacion Firebase & Admin Panel

> Documento de referencia para continuidad entre sesiones de desarrollo.
> Ultima actualizacion: 31 de marzo de 2026

---

## 1. Resumen del Proyecto

Sitio e-commerce de joyeria con esmeraldas colombianas.

| Componente | Detalle |
|---|---|
| **Sitio publico** | `bersagliojewelry.co` (GitHub Pages) |
| **Firebase Hosting** | `bersaglio-jewelry.web.app` |
| **Firebase Project ID** | `bersaglio-jewelry` |
| **Firebase Account** | `bersagliojewelry@gmail.com` |
| **Proyecto GCP Number** | `111509809378` |
| **Plan Firebase** | Blaze (pago por uso) |
| **Repositorio** | `bersagliojewelry/bersagliojewelry.github.io` |
| **Branch principal** | `main` |

---

## 2. Arquitectura de Datos (Firestore-only)

### Fuente unica de verdad: Firestore

```
Panel Admin (CRUD) → Firestore → onSnapshot → Web publica (re-render automatico)
                                             → Otros tabs/dispositivos (re-render)
```

**NO hay datos estaticos de piezas ni colecciones.** Todo el inventario vive exclusivamente en Firestore y se gestiona desde el panel admin. El archivo `js/data/catalog.js` solo contiene datos estaticos de marca, contacto y servicios (no gestionados en admin aun).

### Real-time sync
- **Admin panel**: Usa `onSnapshot` listeners para `pieces`, `collections`, `inquiries`. Cualquier cambio se refleja instantaneamente en todos los dispositivos/tabs conectados.
- **Web publica**: Llama `db.startRealtime()` al cargar. Cuando el admin modifica datos, la web se re-renderiza sin recargar pagina.
- **Cache offline**: localStorage guarda copia para primer pintado rapido; Firestore siempre sobrescribe al conectar.

### Flujo de datos por archivo

| Archivo | Rol |
|---|---|
| `js/data/catalog.js` | Data layer publico. `load()` hace `await` a Firestore. Getters para piezas, colecciones, marca, contacto, servicios. `startRealtime()` activa `onSnapshot`. |
| `js/admin/db.js` | Data layer admin. Lee/escribe Firestore directo. Listeners `onSnapshot` + sistema de eventos `on('pieces', cb)`. Cache localStorage. |
| `js/firestore-service.js` | Capa de acceso a Firestore. CRUD completo + listeners `onSnapshot` para pieces, collections, inquiries. |

---

## 3. Arquitectura de Despliegue

### Dual Deployment
- **GitHub Pages** (`bersagliojewelry.co`): Despliega automaticamente desde `main` via `.github/workflows/deploy.yml`. Ejecuta `npm run build` (Vite) y sube `dist/`.
- **Firebase Hosting** (`bersaglio-jewelry.web.app`): Se despliega manualmente con `firebase deploy --only hosting` desde el PC del usuario.

### Vite Build
- Config en `vite.config.js`
- Auto-descubre todos los `.html` como entry points
- Output en `dist/`
- CSS: LightningCSS, JS: Terser (drop_console en prod)
- Plugin custom copia `snippets/` a `dist/snippets/`

---

## 4. Firebase Services Configurados

### 4.1 Authentication
- **Metodo**: Email/Password
- **Dominios autorizados**: `bersagliojewelry.co`, `bersaglio-jewelry.web.app`, `bersaglio-jewelry.firebaseapp.com`, `localhost`
- **Usuario owner**: `bersagliojewelry@gmail.com` (UID: `Ly5SQw8yqoNsema59ijB0kkKo1D2`)
- **Roles**: owner (3), admin (2), editor (1) — definidos en `js/auth.js`

### 4.2 Firestore Database
- **Colecciones activas**: `pieces`, `collections`, `inquiries`, `users`, `config`, `reviews`, `subscriptions`, `push_tokens`
- **Rules**: `firestore.rules` — desplegadas exitosamente
- **Indexes**: `firestore.indexes.json` — 2 composite indexes (inquiries, reviews)
- **Documento de usuario owner**: `users/Ly5SQw8yqoNsema59ijB0kkKo1D2` con `role: "owner"`

### 4.3 Cloud Storage
- **Bucket**: `bersaglio-jewelry.firebasestorage.app`
- **Rules**: `storage.rules` — desplegadas exitosamente
- **Paths**: `pieces/`, `collections/`, `assets/` — publicos para lectura, autenticados para escritura, max 10-15MB imagenes

### 4.4 Cloud Functions (5 funciones desplegadas)
- **createUser** (onCall) — Solo owner, crea usuarios en Auth + Firestore
- **updateUserRole** (onCall) — Solo owner, cambia roles
- **deactivateUser** (onCall) — Solo owner, desactiva usuarios
- **onPieceDeleted** (onDocument) — Auto-limpia imagenes de Storage al borrar pieza
- **onInquiryCreated** (onDocument) — Incrementa contador de consultas
- **Runtime**: Node.js 20, Region: us-central1
- **Codigo**: `functions/index.js`

### 4.5 Analytics
- **Measurement ID**: `G-F0CEWY7SP1`

---

## 5. API Key & Seguridad

### API Key Actual
```
AIzaSyDcAvuRKN8_h_uSXzXkCzC0foLxTOkd5WM
```

### Restricciones de la API Key (Google Cloud Console > Credentials)
**Restricciones de aplicaciones (HTTP referrers):**
- `bersagliojewelry.co/*`
- `*.bersagliojewelry.co/*`
- `bersaglio-jewelry.web.app/*`
- `bersaglio-jewelry.firebaseapp.com/*`

**Restricciones de API (6 APIs):**
- Identity Toolkit API
- Token Service API
- Cloud Firestore API
- Cloud Storage for Firebase API
- Firebase Installations API
- Firebase Cloud Messaging API

### Historial de API Keys
- **Key original** (`AIzaSyCFjwXPAYCisuhEutAmeAEiYyoEqPL5xUQ`): Creada 19/mar/2026, dejo de funcionar (invalida), rotada el 25/mar/2026.
- **Key actual** (`AIzaSyDcAvuRKN8_h_uSXzXkCzC0foLxTOkd5WM`): Creada 25/mar/2026 mediante rotacion, restringida correctamente.

### Donde esta la API Key en el codigo
- `js/firebase-config.js` — hardcoded como fallback (linea 21)
- `.env` — variable `VITE_FIREBASE_API_KEY` (no se sube a git, esta en .gitignore)
- Las API keys de Firebase son publicas por diseno. La seguridad real esta en Firestore Rules, Storage Rules y Auth.

---

## 6. Estructura de Archivos Clave

```
/
├── .env                          # Variables Firebase (NO se sube a git)
├── .firebaserc                   # Proyecto default: bersaglio-jewelry
├── firebase.json                 # Config de hosting, firestore, storage, functions, emulators
├── firestore.rules               # Reglas de seguridad Firestore
├── firestore.indexes.json        # Indices compuestos
├── storage.rules                 # Reglas de seguridad Storage
├── vite.config.js                # Build config
├── admin-login.html              # Login del panel admin
├── admin.html                    # Dashboard admin
├── admin-piezas.html             # CRUD de piezas
├── admin-colecciones.html        # CRUD de colecciones
├── admin-consultas.html          # Gestion de consultas
├── admin-usuarios.html           # Gestion de usuarios (solo owner)
├── css/
│   └── admin.css                 # Estilos del panel admin (responsive incluido)
├── js/
│   ├── firebase-config.js        # Inicializacion Firebase + config
│   ├── auth.js                   # Autenticacion + roles + guards
│   ├── firestore-service.js      # CRUD Firestore + onSnapshot listeners
│   ├── storage-service.js        # Upload/delete imagenes
│   ├── data/
│   │   └── catalog.js            # Data layer publico (Firestore-only para inventario)
│   └── admin/
│       ├── login.js              # Logica del login
│       ├── dashboard.js          # Dashboard stats (real-time)
│       ├── piezas.js             # CRUD UI piezas (real-time)
│       ├── colecciones.js        # CRUD UI colecciones (real-time)
│       ├── consultas.js          # UI consultas (real-time)
│       ├── usuarios.js           # UI usuarios (Firestore directo)
│       ├── db.js                 # Admin DB: Firestore-first + onSnapshot + eventos
│       └── shared.js             # Utilidades: sidebar, toast, badge real-time
├── functions/
│   ├── index.js                  # 5 Cloud Functions
│   └── package.json              # Dependencies (firebase-admin, firebase-functions)
└── .github/workflows/
    ├── deploy.yml                # Deploy a GitHub Pages (main branch)
    └── firebase-deploy.yml       # Deploy a Firebase Hosting
```

---

## 7. Seguridad del Panel Admin

### Proteccion de paginas admin
Cada pagina admin tiene **doble guardia de autenticacion**:

1. **Guardia inline inmediata** (antes de que cargue cualquier JS):
```html
<body style="display:none">
<script>
try{if(!sessionStorage.getItem('bj_auth'))throw 0}
catch(e){location.replace('admin-login.html');document.body.style.display='none'}
</script>
```

2. **Guardia Firebase** (`requireAuth()` en `js/auth.js`):
   - Verifica autenticacion real con Firebase Auth
   - Verifica rol en Firestore (`users/{uid}`)
   - Si pasa, muestra la pagina: `document.body.style.display = ''`
   - Si falla, redirige a login y limpia sessionStorage

### Proteccion del formulario de login
- Sin atributos `name` en inputs (evita exposicion en URL)
- `method="POST" action="javascript:void(0)"`
- Script inline que limpia query strings de la URL

### SessionStorage Auth Token
- `bj_auth = '1'` se setea cuando el perfil carga exitosamente
- Se elimina en: signOut, auth fallida, usuario null, rol insuficiente

---

## 8. Responsive Design (Admin Panel)

### Breakpoints
- **> 900px**: Layout completo con sidebar de 240px
- **680-900px**: Sidebar reducido a 200px, padding ajustado
- **< 680px**: Sidebar oculto, menu hamburguesa, layout movil completo
- **< 400px**: Stats en 1 columna, texto de botones oculto

### Menu Hamburguesa (Movil)
- Boton hamburguesa visible solo en < 680px
- Sidebar se desliza como overlay (260px ancho, transform + transition)
- Backdrop oscuro con blur, click fuera para cerrar
- Script inline en cada pagina admin para toggle

### Compatibilidad
- iOS safe area insets (`env(safe-area-inset-bottom)`)
- Touch targets de 40-44px para dispositivos tactiles (`@media (hover: none)`)
- `font-size: 16px` en inputs para evitar zoom en iOS
- `-webkit-tap-highlight-color: transparent` en botones
- `-webkit-backdrop-filter` para Safari
- `100dvh` para altura dinamica del viewport

---

## 9. Firestore Service — Funciones Disponibles

### Piezas (`js/firestore-service.js`)
| Funcion | Tipo | Descripcion |
|---|---|---|
| `fetchPieces()` | async | Obtiene todas las piezas |
| `fetchPiecesByCollection(slug)` | async | Piezas por coleccion |
| `fetchPieceBySlug(slug)` | async | Pieza individual |
| `savePiece(id, data)` | async | Crear/actualizar pieza (merge: true) |
| `deletePiece(id)` | async | Eliminar pieza |
| `onPiecesChange(callback)` | listener | Real-time: recibe array en cada cambio |

### Colecciones
| Funcion | Tipo | Descripcion |
|---|---|---|
| `fetchCollections()` | async | Obtiene todas las colecciones |
| `saveCollection(id, data)` | async | Crear/actualizar (merge: true) |
| `deleteCollection(id)` | async | Eliminar coleccion |
| `onCollectionsChange(callback)` | listener | Real-time |

### Consultas (Inquiries)
| Funcion | Tipo | Descripcion |
|---|---|---|
| `fetchInquiries()` | async | Todas las consultas (desc por fecha) |
| `saveInquiry(data)` | async | Guardar nueva consulta |
| `updateInquiry(id, data)` | async | Actualizar (ej: marcar leida) |
| `deleteInquiry(id)` | async | Eliminar consulta |
| `onInquiriesChange(callback)` | listener | Real-time |

### Reviews
| Funcion | Tipo | Descripcion |
|---|---|---|
| `fetchReviews(pieceSlug)` | async | Reviews aprobadas de una pieza |
| `fetchAllReviews()` | async | Todas (admin) |
| `submitReview(data)` | async | Enviar review (approved: false) |
| `approveReview(id)` | async | Aprobar review |
| `deleteReview(id)` | async | Eliminar review |
| `onReviewsChange(slug, callback)` | listener | Real-time por pieza |

### Otros
| Funcion | Tipo | Descripcion |
|---|---|---|
| `addSubscription(email)` | async | Suscribir email a newsletter |
| `isFirestoreAvailable()` | async | Health check |

---

## 10. Admin DB — Sistema de Eventos (`js/admin/db.js`)

El admin database expone un sistema de eventos para que las paginas reaccionen a cambios en tiempo real:

```javascript
// Suscribirse a cambios
adminDb.on('pieces', (pieces) => { /* re-render tabla */ });
adminDb.on('collections', (collections) => { /* re-render */ });
adminDb.on('inquiries', (inquiries) => { /* re-render */ });
adminDb.on('stats', (stats) => { /* actualizar contadores */ });

// Operaciones CRUD (todas async)
await adminDb.savePiece(data);
await adminDb.deletePiece(id);
await adminDb.saveCollection(data);
await adminDb.deleteCollection(id);
await adminDb.markRead(id, true);
await adminDb.deleteInquiry(id);

// Getters (sincrono, datos en memoria actualizados por listeners)
adminDb.getAllPieces();
adminDb.getAllCollections();
adminDb.getInquiries();
adminDb.getStats();
```

---

## 11. Firebase CLI — Notas Importantes

### Multiples cuentas
El PC del usuario tiene 2 cuentas Firebase CLI:
- `bersagliojewelry@gmail.com` (proyecto bersaglio-jewelry) ← **USAR ESTA**
- `altorracarsale@gmail.com` (otro proyecto)

### Comandos frecuentes
```bash
# Ver cuenta activa
firebase login:list

# Cambiar a la cuenta correcta
firebase login:use bersagliojewelry@gmail.com

# Desplegar todo
firebase deploy --only firestore:rules,storage,functions

# Desplegar individualmente
firebase deploy --only firestore:rules
firebase deploy --only storage
firebase deploy --only functions
firebase deploy --only hosting
```

### Permisos IAM requeridos
En Google Cloud Console > IAM, la cuenta de servicio `111509809378@cloudbuild.gserviceaccount.com` necesita el rol **"Agente de servicios de Cloud Build"** para que Cloud Functions se desplieguen correctamente.

---

## 12. Problemas Resueltos

| # | Problema | Causa | Solucion | Fecha |
|---|---|---|---|---|
| 1 | "API key not valid" en login | Key original invalida/corrupta | Rotar key en GCP Console > Credentials | 25/mar |
| 2 | Credenciales visibles en URL del login | Inputs con `name` attrs + form GET | Eliminar `name`, agregar `method="POST"` | 25/mar |
| 3 | Admin pages accesibles sin login | Guards JS tardaban en cargar | Guardia inline con sessionStorage + `display:none` | 25/mar |
| 4 | Build sin API key en GitHub Actions | No habia `.env` en CI | Hardcodear config como fallback en `firebase-config.js` | 25/mar |
| 5 | Deploy falla con "permission denied" | Firebase CLI usaba cuenta equivocada | `firebase login:use bersagliojewelry@gmail.com` | 25/mar |
| 6 | Cloud Functions "missing permission" | Faltaba rol en cuenta de servicio | Agregar rol "Cloud Build Service Agent" en IAM | 25/mar |
| 7 | Sin navegacion en movil | Sidebar `display:none` sin alternativa | Menu hamburguesa con sidebar overlay | 26/mar |
| 8 | Consultas eliminadas reaparecen en movil | localStorage aislado por dispositivo | Reescribir db.js para usar Firestore como fuente unica | 30/mar |
| 9 | Datos demo (Maria, Carlos, Sofia) | `_seedInquiries()` creaba datos al vaciar localStorage | Eliminar seed de datos demo, Firestore-only | 30/mar |
| 10 | Admin solo mostraba 1 pieza | Datos estaban en catalogo estatico, no en Firestore | Migracion automatica de catalogo a Firestore | 30/mar |
| 11 | Boton eliminar imagen cerraba modal | Evento click propagaba al padre | `stopPropagation()` + `preventDefault()` en handler | 30/mar |
| 12 | Web no sincronizaba con cambios del admin | Web usaba datos estaticos sin listeners | Activar `startRealtime()` + `onChange()` en paginas publicas | 30/mar |
| 13 | 700+ lineas de datos estaticos duplicados | Piezas/colecciones hardcodeadas en catalog.js | Eliminar datos estaticos, Firestore es fuente unica | 30/mar |
| 14 | "Error al guardar pieza" al eliminar imagen | `undefined` pasado a `setDoc()` | Strip `undefined` en `db.js savePiece()`; usar `[]`/`null` | 31/mar |
| 15 | Imagenes del admin no visibles en web | Paginas publicas solo mostraban SVG placeholder | Condicional `<img>` con fallback SVG en 4 archivos | 31/mar |

---

## 13. Portafolio Digital / Lookbook (NUEVO - 31/mar)

Seccion interactiva tipo libro en homepage (antes de "Piezas que definen momentos"):
- **Componente**: `js/components/lookbook.js`
- **Contenedor HTML**: `<section id="portafolio">` → `<div id="lookbook">` en `index.html`
- **Datos**: Todas las piezas organizadas por coleccion desde Firestore
- **UX**: Tabs por coleccion + viewport con pagina izquierda (intro coleccion) y derecha (grid de piezas)
- **Navegacion**: Tabs, botones prev/next, flechas teclado, swipe tactil
- **Real-time**: Se re-renderiza automaticamente via `db.onChange()`
- **CSS**: Seccion completa al final de `css/style.css`

### Componentes de imagenes en web publica
| Archivo | Seccion | Imagen class |
|---|---|---|
| `js/components/lookbook.js` | Homepage "Portafolio Digital" | `.lookbook-piece-img img` |
| `js/components/featured.js` | Homepage "Piezas que definen momentos" | `.piece-img` |
| `js/components/collections.js` | Homepage colecciones horizontal | N/A (iconos SVG) |
| `js/colecciones.js` | Pagina `/colecciones.html` grid | `.piece-img` |
| `js/coleccion.js` | Pagina individual de coleccion | `.piece-card-img-real` |
| `js/pieza.js` | Detalle de pieza + galeria thumbnails | `.pieza-img`, `.pieza-thumb` |

---

## 14. Arquitectura Firestore-Only (sin datos estaticos)

### Principio
**El panel admin es la unica fuente de verdad.** No hay datos hardcoded en el codigo.

### Flujo de datos
```
Admin Panel → Firestore → onSnapshot → Pagina publica (real-time)
```

### Archivos clave
| Archivo | Rol |
|---|---|
| `js/firestore-service.js` | CRUD + listeners `onSnapshot` para Firestore |
| `js/admin/db.js` | Base de datos admin: Firestore-first, eventos real-time |
| `js/data/catalog.js` | Capa de datos publica: `load()` desde Firestore, `startRealtime()` para sync |
| `js/admin/piezas.js` | CRUD piezas (async), subida imagenes via `storage-service.js` |
| `js/admin/colecciones.js` | CRUD colecciones (async) |
| `js/admin/consultas.js` | CRUD consultas (async) |

### API de catalog.js (pagina publica)
```javascript
db.load()                     // Carga inicial desde Firestore
db.startRealtime()            // Activa onSnapshot listeners
db.onChange(callback)          // Suscribir a cambios
db.getAll()                   // Todas las piezas
db.getCollections(featured?)  // Colecciones (opcionalmente solo featured)
db.getFeatured(limit?)        // Piezas destacadas
db.getByCollection(slug)      // Piezas de una coleccion
db.getBySlug(slug)            // Pieza por slug
```

### API de adminDb (panel admin)
```javascript
adminDb.loadAll()             // Carga piezas + colecciones + consultas
adminDb.savePiece(data)       // Crear/actualizar pieza (strip undefined)
adminDb.deletePiece(id)       // Eliminar pieza
adminDb.saveCollection(data)  // Crear/actualizar coleccion
adminDb.deleteCollection(id)  // Eliminar coleccion
adminDb.on(event, callback)   // Suscribir: 'pieces', 'collections', 'inquiries', 'stats'
```

---

## 15. Pendientes / Proximos Pasos

- [ ] Favicon.ico — El navegador muestra 404. Agregar `favicon.ico` en `public/`
- [ ] Configurar GitHub Secrets para el build de CI (actualmente usa fallbacks hardcoded)
- [ ] Considerar mover brand, contact y services a Firestore (gestionables desde admin)
- [ ] Considerar upgrade de Node.js 20 a 22 antes de oct 2026 (deprecation)
- [ ] Vincular Firebase Hosting con dominio custom (opcional, actualmente usa GitHub Pages)
- [ ] Convertir "Piezas que definen momentos" a mostrar solo piezas marcadas como "destacadas" desde admin
- [x] ~~Probar subida de imagenes desde admin (drag & drop)~~ — Funcional
- [x] ~~Verificar imagenes en web publica~~ — Resuelto (PR #53)

---

## 16. Datos de Contacto y Cuentas

| Servicio | Cuenta |
|---|---|
| Firebase / GCP | `bersagliojewelry@gmail.com` |
| GitHub | `bersagliojewelry` (repo: `bersagliojewelry.github.io`) |
| Dominio | `bersagliojewelry.co` |
| Segunda cuenta Firebase (NO usar para este proyecto) | `altorracarsale@gmail.com` |
