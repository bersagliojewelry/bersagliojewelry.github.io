# Bersaglio Jewelry — Documentacion Firebase & Admin Panel

> Documento de referencia para continuidad entre sesiones de desarrollo.
> Ultima actualizacion: 26 de marzo de 2026

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
| **Branch desarrollo** | `claude/remove-fake-inventory-rmALp` |

---

## 2. Arquitectura de Despliegue

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

## 3. Firebase Services Configurados

### 3.1 Authentication
- **Metodo**: Email/Password
- **Dominios autorizados**: `bersagliojewelry.co`, `bersaglio-jewelry.web.app`, `bersaglio-jewelry.firebaseapp.com`, `localhost`
- **Usuario owner**: `bersagliojewelry@gmail.com` (UID: `Ly5SQw8yqoNsema59ijB0kkKo1D2`)
- **Roles**: owner (3), admin (2), editor (1) — definidos en `js/auth.js`

### 3.2 Firestore Database
- **Colecciones activas**: `pieces`, `collections`, `inquiries`, `users`, `config`, `reviews`, `subscriptions`, `push_tokens`
- **Rules**: `firestore.rules` — desplegadas exitosamente
- **Indexes**: `firestore.indexes.json` — 2 composite indexes (inquiries, reviews)
- **Documento de usuario owner**: `users/Ly5SQw8yqoNsema59ijB0kkKo1D2` con `role: "owner"`

### 3.3 Cloud Storage
- **Bucket**: `bersaglio-jewelry.firebasestorage.app`
- **Rules**: `storage.rules` — desplegadas exitosamente
- **Paths**: `pieces/`, `collections/`, `assets/` — publicos para lectura, autenticados para escritura, max 10-15MB imagenes

### 3.4 Cloud Functions (5 funciones desplegadas)
- **createUser** (onCall) — Solo owner, crea usuarios en Auth + Firestore
- **updateUserRole** (onCall) — Solo owner, cambia roles
- **deactivateUser** (onCall) — Solo owner, desactiva usuarios
- **onPieceDeleted** (onDocument) — Auto-limpia imagenes de Storage al borrar pieza
- **onInquiryCreated** (onDocument) — Incrementa contador de consultas
- **Runtime**: Node.js 20, Region: us-central1
- **Codigo**: `functions/index.js`

### 3.5 Analytics
- **Measurement ID**: `G-F0CEWY7SP1`

---

## 4. API Key & Seguridad

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

## 5. Estructura de Archivos Clave

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
│   ├── firestore-service.js      # CRUD Firestore (piezas, colecciones, etc.)
│   ├── storage-service.js        # Upload/delete imagenes
│   └── admin/
│       ├── login.js              # Logica del login
│       ├── dashboard.js          # Dashboard stats
│       ├── piezas.js             # CRUD UI piezas
│       ├── colecciones.js        # CRUD UI colecciones
│       ├── consultas.js          # UI consultas
│       ├── usuarios.js           # UI usuarios
│       ├── db.js                 # Operaciones DB compartidas
│       └── shared.js             # Utilidades compartidas
├── functions/
│   ├── index.js                  # 5 Cloud Functions
│   └── package.json              # Dependencies (firebase-admin, firebase-functions)
└── .github/workflows/
    ├── deploy.yml                # Deploy a GitHub Pages (main branch)
    └── firebase-deploy.yml       # Deploy a Firebase Hosting
```

---

## 6. Seguridad del Panel Admin

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

## 7. Responsive Design (Admin Panel)

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

## 8. Firebase CLI — Notas Importantes

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

## 9. Problemas Resueltos

| Problema | Causa | Solucion |
|---|---|---|
| "API key not valid" en login | Key original invalida/corrupta en Google | Rotar key en GCP Console > Credentials |
| Credenciales visibles en URL del login | Inputs con `name` attrs + form GET | Eliminar `name`, agregar `method="POST"` |
| Admin pages accesibles sin login | Guards JS tardaban en cargar | Guardia inline con sessionStorage + `display:none` |
| Build sin API key en GitHub Actions | No habia `.env` en CI | Hardcodear config como fallback en `firebase-config.js` |
| Deploy falla con "permission denied" | Firebase CLI usaba cuenta equivocada | `firebase login:use bersagliojewelry@gmail.com` |
| Cloud Functions "missing permission" | Faltaba rol en cuenta de servicio | Agregar rol "Cloud Build Service Agent" en IAM |
| Sin navegacion en movil | Sidebar `display:none` sin alternativa | Menu hamburguesa con sidebar overlay |

---

## 10. Pendientes / Proximos Pasos

- [ ] Favicon.ico — El navegador muestra 404 para `/favicon.ico`. Agregar un `favicon.ico` en `public/`
- [ ] Probar subida de imagenes desde admin panel (drag & drop en piezas)
- [ ] Probar CRUD completo de piezas y colecciones desde el panel
- [ ] Configurar GitHub Secrets para el build de CI (actualmente usa fallbacks hardcoded)
- [ ] Considerar upgrade de Node.js 20 a 22 antes de oct 2026 (deprecation)
- [ ] Vincular Firebase Hosting con el dominio custom `bersagliojewelry.co` (opcional, actualmente usa GitHub Pages)

---

## 11. Datos de Contacto y Cuentas

| Servicio | Cuenta |
|---|---|
| Firebase / GCP | `bersagliojewelry@gmail.com` |
| GitHub | `bersagliojewelry` (repo: `bersagliojewelry.github.io`) |
| Dominio | `bersagliojewelry.co` |
| Segunda cuenta Firebase (NO usar para este proyecto) | `altorracarsale@gmail.com` |
