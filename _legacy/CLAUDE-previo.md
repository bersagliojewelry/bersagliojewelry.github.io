# CLAUDE.md — Bersaglio Jewelry · 🧠 Tronco Encefálico (Router Neuronal)

> **Este archivo se auto-carga en CADA sesión.** Es el enrutador central del
> cerebro documental: deliberadamente corto (router, no enciclopedia) para NO
> saturar tu contexto. NUNCA contiene historial ni tareas — cada pieza de
> información vive en su nodo específico (ver §0). El detalle se lee on-demand.
>
> Última reestructuración: 2026-06-03 (arquitectura neuronal de memoria).
> **Cache, pendientes y estado vivo NO viven aquí** → `docs/10-MEMORIA-CORTO-PLAZO.md`.

---

## §0.0 — TU IDENTIDAD Y FUNCIÓN (léelo primero, en CADA sesión)

Eres el **constructor y guardián** de este cerebro documental. **No tienes memoria
entre conversaciones: este cerebro ES tu memoria** — por eso DEBES leer este
`CLAUDE.md` cada sesión para recuperar quién eres, qué sabes y cómo operar (sin
re-investigar lo ya aprendido).

**Doble rol:** (1) lo **CONSULTAS como experto** — vas directo a la neurona correcta,
NO lees todo (§G.1 + §G.2); (2) lo **CONSTRUYES y ALIMENTAS bajo tu juicio** (§G.4) —
capturas lo que generas, mantienes las neuronas frescas y creas neuronas nuevas.
**Nunca automatismo ciego:** cada escritura es deliberada para no dañar la red.

**Regla de oro:** si cierras una tarea sin alimentar el cerebro, NO está completa —
el próximo "tú" (sin memoria) depende de lo que escribas hoy.

---

## §0 — Mapa de nodos de memoria (índice de enrutamiento)

El cerebro se divide en **nodos**. Auto-cargas SOLO `CLAUDE.md` + `05` + `10` (§G.1); el resto se lee on-demand por trigger (§G.2). Así no quemas contexto.

| Nodo neuronal | Archivo | Auto-carga | Cuándo leerlo |
|---|---|---|---|
| 🧠 **Tronco Encefálico** | `CLAUDE.md` (este) | ✅ Siempre | Router + identidad + doctrinas + gobernanza. |
| 🩺 **Estado Global** | `docs/05-ESTADO-GLOBAL.md` | ✅ Siempre (boot) | Snapshot de salud: build, cache version, branch, flags de riesgo. "¿Dónde estoy parado?" antes de tocar nada. |
| ⚡ **Corto Plazo (WIP)** | `docs/10-MEMORIA-CORTO-PLAZO.md` | ✅ Siempre (2ª lectura) | Sprint actual, pendientes (TODOs), bitácora. (El estado técnico vive en 05.) |
| 🗺️ **Espacial** | `docs/20-MEMORIA-ESPACIAL.md` | ❌ on-demand | Trigger de Desorientación: dónde vive un componente, flujos, arquitectura, sitemap, layouts. |
| 🧪 **Procedimental** | `docs/30-LECCIONES.md` | ❌ on-demand | Trigger de Experiencia: ANTES de refactor de CSS, tocar caché, service worker, o si un síntoma "te suena". gotchas y reglas CSS. |
| 🗂️ **Índice sináptico** | `docs/00-INDICE.md` | ❌ on-demand | ANTES de leer el historial (offset exacto) Y para el enrutamiento semántico (síntoma → neurona). |
| 📚 **Largo Plazo** | `docs/99-HISTORIAL-ADR.md` | ❌ on-demand | Trigger de Error / detalle histórico de un §. NUNCA completo — usa offset/limit. |
| 🎯 **Lóbulos de Dominio** | `docs/40-LOBULOS-DOMINIO.md` | ❌ on-demand | Trigger 🔵 §G.2: registry de dominios especializados; lóbulos hijos (`43-UX.md`, `48-ACCESIBILIDAD.md`, etc.). |
| 🛠️ **Skills externas** | `skills/` | ❌ on-demand | Expertise general de terceros (auditorías, CRO, copywriting, etc.). |

### 🏆 Regla de oro anti-saturación (CÓMO leer el Largo Plazo)

NUNCA leas `docs/99-HISTORIAL-ADR.md` completo. En su lugar:
1. `Read docs/00-INDICE.md` → encuentra la línea del § que buscas.
2. `Read docs/99-HISTORIAL-ADR.md offset=<línea> limit=~150` → lee SOLO ese tramo.

---

## §1 — Identidad y arquitectura (exprés)

- **Negocio**: Bersaglio Jewelry — E-commerce de alta joyería colombiana (esmeraldas, diamantes, oro 18k). Brand pearl/emerald/gold.
- **Stack**: HTML/CSS/JS vanilla (sin frameworks React/Vue, modularizado con Vite) + Firebase SDK (Auth, Firestore, Storage).
- **Hosting**: GitHub Pages (`bersagliojewelry.co`). CI/CD automatizado vía GitHub Actions (deploy al pushear a `main`).
- **Características clave**: Animaciones staggered (IntersectionObserver) + Checkout de 3 pasos (sessionStorage) + Cart Drawer lateral + Live sync de catálogo vía `onSnapshot` de Firestore.

---

## §2 — Protocolo de documentación (OBLIGATORIO en cada commit relevante)

### Dónde documentar
- **WIP / tarea en curso**: se registra en el Corto Plazo (`docs/10-MEMORIA-CORTO-PLAZO.md`).
- **NUEVOS ADRs**: al cerrar una tarea, se APENDEN al final de `docs/99-HISTORIAL-ADR.md` + fila en `docs/00-INDICE.md` (consolidación §G.3). NUNCA a este CLAUDE.md.
- **Este CLAUDE.md**: solo se edita cuando cambia algo always-on (doctrinas, el esquema de nodos, reglas de gobernanza). NUNCA historial ni pendientes.

---

## §3 — Doctrinas always-on (resumen ejecutable)

### 3.1 Performance (Lecciones §30)
- NUNCA `transition: all` ni animar layout props (width/height/margin/padding). Usar solo `transform` y `opacity`.
- Optimización de imágenes: `loading="lazy"` y `decoding="async"`. Preload solo para LCP.

### 3.2 HTML/CSS estable
- NUNCA renombrar IDs o clases CSS existentes para no romper hooks de JS. Cambios aditivos solamente.
- Re-uso estricto del renderer de cards `renderPieceCardHTML` para mantener paridad visual.

### 3.3 RCA Mode estricto — "no supongas"
- Lee el código antes de proponer cambios. Si un bug ocurre 2 veces, detente y busca antecedentes en el historial de ADRs.

### 3.4 IAP — Impact Analysis Previo
- Antes de modificar código, analiza: (A) archivos a modificar, (B) archivos intactos, (C) código muerto o redundante, (D) refactor y (E) riesgos/rollback.

---

## §4 — Cache bump (Service Worker)
- Al cambiar comportamiento o archivos estáticos del shell, incrementar versión de caché en `public/sw.js` (ej. `bersaglio-v3` ➔ `bersaglio-v4`).

---

## §G — Gobernanza Neuronal

### G.1 — Directiva de Ignorancia Selectiva
Al arrancar sesión, lee **SOLO**: (1) `CLAUDE.md`, (2) `docs/05-ESTADO-GLOBAL.md`, (3) `docs/10-MEMORIA-CORTO-PLAZO.md`. Ignora el resto del cerebro hasta que sea necesario.

### G.2 — Triggers de Recuperación (Escalation Path)
- **🔴 Trigger de Error**: 2 fallos depurando = leer `docs/99-HISTORIAL-ADR.md` en el offset correcto.
- **🟡 Trigger de Desorientación**: dudas de arquitectura = leer `docs/20-MEMORIA-ESPACIAL.md`.
- **🧪 Trigger de Experiencia**: operaciones riesgosas/CSS refactor = leer `docs/30-LECCIONES.md`.
- **🔵 Trigger de Auditoría/Dominio**: auditoría especializada = consultar `skills/` + crear o actualizar lóbulo hijo en `docs/` + registrar en `docs/40-LOBULOS-DOMINIO.md`.

### G.3 — Protocolo de Consolidación
Al cerrar una tarea: actualiza Corto Plazo, apenda como ADR §X al final de `docs/99-HISTORIAL-ADR.md`, añade fila a `docs/00-INDICE.md`, limpia la pizarra del Corto Plazo, e incrementa versión de caché.

### G.4 — Neurogénesis y Auto-construcción
El cerebro se mantiene solo bajo tu guía. Corre **`npm run brain:check`** antes de consolidar o al arrancar para asegurar integridad.

---

## §7 — Cómo retomar (recap rápido)
1. **Boot**: Lee `CLAUDE.md` + `05` + `10` + corre `npm run brain:check`.
2. **Tareas**: Revisa los TODOs en `docs/10-MEMORIA-CORTO-PLAZO.md`.
3. **Flujos**: Recuerda aplicar IAP y consolidar al cerrar.
