# CMS — "Cero ficción en el index" (design + build blueprint)

> **Origen**: directiva Daniel 2026-06-20 ("el index en prod NUNCA muestra contenido demo/ficticio") + comité ×3 (33 agentes, workflow `wqzxcwbcc`; CRUDO en bóveda `research-archive/2026-06-20-comite-cero-ficcion-CRUDO.json`). Decisiones de Daniel: **umbral con mínimo** · **borrar el demo YA** · videos por enlace+miniatura · redes curado manual. Memoria: `feedback_no_demo_en_index`. TODO-24. [OPUS-4.8].

## Principio rector (invariante de código, no disciplina humana)
El default de toda sección DINÁMICA es `[]`; cualquier fallo/duda colapsa a **OCULTO**, jamás a ficción. La línea que zanja todo:
- ✅ **Identidad estática de marca** (copy real fijo: manifiesto, dirección, teléfono) = default legítimo.
- 🚫 **Simulación de contenido dinámico** (videos/posts/artículos/reseñas/equipo inventados) = prohibida.
- Línea operable: ¿describe quién ES Bersaglio (legítimo) o simula lo que Kary debió cargar (prohibido)?

## Dos clases de sección (un solo contrato)
- **Clase A — DINÁMICO** (Films, Social, Journal-preview, Destacadas, Categorías): colección Firestore · default `[]` · render con filtro `published==true` + guard `minItems` · hide-when-empty · `onCollectionChange` en vivo. Plantilla canónica = `journal-preview.js` L24 (`if(!feat) return ''`).
- **Clase B — IDENTIDAD ESTÁTICA** (singletons Home/Nosotros/Contacto + copy fijo Marquee/Servicios): default = copy REAL de marca, re-pinta one-shot al resolver. Default placeholder/lorem = NO.

## Umbrales de dignidad (decisión Daniel: "con mínimo")
Una sección aparece solo con suficiente para verse curada:
| Sección | minItems |
|---|---|
| Films/videos | **3** |
| Social/redes | **4** |
| Destacadas (piezas) | **3** |
| Journal-preview | **1** destacada (o ≥1 publicada) |
| Categorías | ≥1 colección con piezas |

**Piso de dignidad (Layout Mínimo Viable)**: Hero + Marquee + Editorial + Atelier + CTA (copy real) SIEMPRE presentes → el index nunca se ve esquelético, aunque catálogo/journal/films/social estén en cero el día 1.

## 5 barreras (de la fuente hacia afuera; ninguna confía en disciplina humana)
1. **FUENTE**: BORRAR `js/data/home-media.js` del árbol (no vaciar: eliminar). Reescribir `js/home/films.js` y `js/home/social.js` como consumidores Firestore (colecciones `films/`, `socialPosts/`) vía `resource-admin` + `onCollectionChange`, espejo de journal-preview. Quitar el texto **"Demo · aquí se reproduce el video real"** (films.js L105) y el `uploadHint` instructivo (L25-33).
2. **DEFAULTS**: dinámicas → `[]`; singletons → copy real (null-safe, ya vía `mergeHome`/`mergeNosotros`).
3. **PUERTA DE ADELANTE (Firestore Rules)**: rechazar `create/update` con `published==true` si faltan campos reales no vacíos (films: `href`+`thumb`+`title`; social: `thumb`+`caption`+`platform`; journal: `image`+`title`+`excerpt`). Las Rules validan POR DOCUMENTO (no cuentan colecciones → `minItems` vive en render/panel).
4. **RENDER**: el home filtra `published==true` + aplica guard `minItems` antes de montar; documento a-medias jamás llega visible. No pintar dinámicas hasta que Firestore resuelva (reservar 0px, NO skeleton de altura fija → evita CLS).
5. **CI + CACHE**: gate determinista que revienta el build si reaparece el import `from '../data/home-media'` (grep, no AST) o si un módulo de `js/home/` exporta un array de items no vacío; **bump OBLIGATORIO de `CACHE_NAME`** en `public/sw.js` (sin él, clientes recurrentes/offline sirven el `films.js` viejo con los 8 videos fantasma).

## Descriptores admin (resource-admin, patrón Journal)
- **Films** (`films/`, pestaña "Videos"): `title` · `cat` (categoría) · `thumb` (image) · `href` (enlace video) · `dur` · `desc` · `featured` · `published`. id = slug.
- **Social** (`socialPosts/`, pestaña "Redes"): `platform` · `thumb` (image) · `caption` · `href` (enlace post) · `type` · `published`. id = slug/auto.

## UX de Kary (cero jerga, español, binario)
- Tarjeta **"Estado de tu web"** (refresca en vivo): *"Hoy se ve: Inicio, Categorías (3). Aún no se ven: Videos, Redes."* + botón **"Ver mi web como cliente"**.
- Columna **"¿Se ve en la web?"** en cada lista: **SÍ se ve** (verde, publicado+completo) / **NO se ve todavía** (gris) + mini-razón ("falta la miniatura", "te faltan 2 videos para que aparezca").
- Empty-state **naranja con guía** (no gris mudo): *"Añade al menos 3 videos para que la sección aparezca en tu web."*
- `minItems` = alerta en el panel, **NUNCA un muro** que impida guardar.
- **Guardarraíl**: al despublicar/borrar el ÚLTIMO ítem visible de una sección, confirmar ANTES (*"Esto ocultará Videos de tu web porque quedaría vacía. ¿Continuar?"*); una vez vacía, el panel muestra "oculta porque está vacía".

## Runbook de corte (orden estricto)
desplegar JS+SW (con bump de `CACHE_NAME`) → reset en STAGING/gemelo primero → humo post-deploy → reset prod. Nunca vaciar datos ANTES de desplegar el JS nuevo (clientes verían ficción cacheada).

## Riesgos vivos (del comité)
- CLS/race en primer paint → no pintar dinámicas hasta resolver (0px).
- Rules NO cuentan colecciones → `minItems` solo en render/panel (riesgo de divergencia si un dev lo olvida).
- Gate CI por grep no atrapa una fuente NUEVA con otro nombre → mitiga el chequeo "módulo de home/ exporta array no vacío".
- Probar el reset en STAGING, no en prod (flash potencial).
- Testear "Estado de tu web" con Kary real (no sobrecargar a la operadora).

## Orden de ejecución
**Mata la ficción viva HOY (a-d)**: (a) borrar `home-media.js`; (b) reescribir films.js/social.js como consumidores Firestore (sin Demo ni uploadHint); (c) gate CI del import; (d) bump `CACHE_NAME`. **Blindaje después**: descriptores admin + `published`/completeness + Firestore Rules + columna "¿Se ve?" + tarjeta "Estado" + `minItems` en dinámicas existentes + confirmación al vaciar.
