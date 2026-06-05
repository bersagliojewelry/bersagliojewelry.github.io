# 🗺️ 20 — MEMORIA ESPACIAL (Arquitectura / Flujos / Estructura)

> **Nodo neuronal: Memoria Espacial.** Se lee SOLO ante desorientación
> (Trigger de Desorientación, ver `CLAUDE.md §G.2`): cuando dudas de DÓNDE vive
> un componente, CÓMO interactúan los módulos, qué depende de qué, o cómo está
> estructurado el deploy. NO se auto-carga.
>
> Este nodo es un HUB: enlaza a las hojas de detalle. Lee primero el mapa de
> abajo; baja a la hoja específica solo si necesitas el detalle fino.

---

## 🧭 Mapa rápido de "dónde vive cada cosa"

> Rellenar a medida que se conoce el proyecto. Formato: `qué buscas | a qué archivo/carpeta ir`.

| Si buscas… | Ve a |
|---|---|
| _(rellenar — ej. "Qué módulo hace X")_ | _(ej. `src/services/x.ts`)_ |
| _(rellenar — ej. "Schema de la base de datos")_ | _(ej. `prisma/schema.prisma`)_ |
| _(rellenar — ej. "Configuración de deploy")_ | _(ej. `.github/workflows/deploy.yml`)_ |
| Historia/decisión de un subsistema (§NN) | `00-INDICE.md` → `99-HISTORIAL-ADR.md` |

---

## 🏗️ Estructura del repo (vista aérea)

> Rellenar tras el primer mapeo. Formato sugerido:

- **Frontend / cliente**: _(ej. `src/` con framework X, hosting Y)_
- **Backend / API**: _(ej. `api/` con framework Z, base de datos W)_
- **Scripts / herramientas**: _(ej. `scripts/`)_
- **Tests**: _(ej. `tests/` con framework de testing)_
- **Docs**: este `docs/` (cerebro)
- **CI / Deploy**: _(ej. GitHub Actions, Vercel, Docker)_

### 📁 Estructura de carpetas principales

> Tabla detallada por carpeta. Cómo se carga / quién la consume.

| Carpeta | Qué contiene | Cómo se carga / consume |
|---|---|---|
| _(rellenar)_ | _(rellenar)_ | _(rellenar)_ |

**⚠️ Reflejo de Frescura (`CLAUDE.md §G.4`):** si mueves/creas/renombras un archivo importante, actualiza esta tabla en el MISMO cambio. Una neurona vieja engaña al próximo "tú" → reproceso/regresión.

---

## 🔗 Flujos de datos clave

> Diagramas/explicaciones de los flujos críticos. Detalle fino → hoja de detalle (ej. `docs/dependency-map.md`).

```
_(vacío — añadir cuando el proyecto tenga flujos relevantes)_
```

**Módulos de alto blast radius** (tocar con IAP `CLAUDE.md §3.4` obligatorio): _(rellenar — los que rompen mucho si se modifican mal)_.

---

## 🗂️ Schema de datos (resumen)

> Si el proyecto usa base de datos. Tablas / colecciones principales con 1 línea cada una.

- _(rellenar — ej. `users/{uid}` — perfiles de usuario)_
- _(rellenar — ej. `orders/{id}` — pedidos)_

Detalle completo → hoja de detalle (ej. `docs/dependency-map.md` o `docs/schema.md`).

---

## ⚙️ Convenciones espaciales (dónde NO equivocarse)

> Cosas que parecen obvias pero rompen si se ignoran. Rellenar a medida que se descubran.

- _(rellenar — ej. "Las migraciones SQL deben correrse manualmente, no auto-aplica el CI")_
- _(rellenar — ej. "Los archivos en `public/` no pasan por el bundler")_

---

> Si tras leer este nodo sigues sin ubicar algo, NO adivines: lee la hoja de
> detalle enlazada arriba, o el ADR § correspondiente vía `docs/00-INDICE.md`.
>
> **📏 Capacidad (`CLAUDE.md §G.5`): ~280 líneas.** Al acercarse, SHARD por
> sub-área (ej. extraer `js/` a `21-ESPACIAL-FRONTEND.md`), registrar en
> `CLAUDE.md §0` + `00-INDICE`, dejar puntero aquí.
