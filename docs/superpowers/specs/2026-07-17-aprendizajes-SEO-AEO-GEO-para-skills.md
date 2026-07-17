# Aprendizajes SEO · AEO · GEO — para las skills de posicionamiento

> **Origen**: trabajo REAL en producción sobre `bersagliojewelry.co` (Search Console y Google Business
> Profile reales del negocio). **Fecha de corte: 2026-07-17.** Reemplaza al borrador del 2026-07-10.
> **Destino**: chat de ALTORRA INMOBILIARIA (operador de los cerebros) → incorporar a las skills
> `search-console-setup-y-diagnostico`, `ssg-static-prerender`, `semantic-schema-aeo`, `maps-gbp-local`.
> Leer el SKILL.md vigente de cada una y **AÑADIR lo que falte; no duplicar**.

## Leyenda de fiabilidad (respetarla al portar)

| Marca | Significado |
|---|---|
| ✅ **VERIFICADO** | Observado en producción o en la doc oficial de Google. Se indica CÓMO. Puede volverse regla. |
| ⚠️ **CORRIGE** | Contradice el borrador previo. **Prevalece esto.** |
| 🚫 **PELIGRO** | Riesgo real (suspensión/penalización). Nunca recomendarlo. |
| ❓ **HIPÓTESIS** | Plausible pero NO medido. **No convertir en regla** — dejar marcado como hipótesis. |

---

# 0. Correcciones al borrador del 2026-07-10 — LEER PRIMERO

## 0.1 ⚠️🚫 FALSO: *"Product en availability=PreOrder SIN price es VÁLIDO (Google no lo rechaza)"*

**Es al revés.** Verificado 2026-07-17 en el GSC de bersagliojewelry.co → informe **Fragmentos de productos**:

- **17 elementos NO VÁLIDOS · 0 válidos**, con **1 problema crítico**:
  *"Se debe especificar `price` o `priceSpecification.price` (en `offers`)"*.
- Contrastado con la doc oficial (Product snippet): dentro de `Offer`, **`price` (o `priceSpecification.price`) es REQUERIDO**.

**Reglas correctas:**
1. **Si emites `offers`, DEBE llevar `price`.** Un `Offer` con `priceCurrency` pero sin `price` es un item
   **inválido** — es *peor* que no emitir oferta (afirma una oferta que no existe).
2. **Modelado para piezas sin precio** (bajo consulta / a medida / por encargo): **omitir el bloque `offers`
   completo**, no emitirlo a medias.
3. `offers` es **solo UNA de tres vías** de elegibilidad. Google exige **una de**: `offers` | `review` |
   `aggregateRating`. Sin ninguna → el Product no es elegible para el fragmento (no es un "error" del sitio).

**El matiz que sí es cierto — y es el que de verdad importa al dueño:**
> **NO bloquea la indexación ni el ranking.** GSC lo dice literal: *"Los elementos no válidos no pueden
> aparecer en los **resultados enriquecidos**"*. La página se rastrea ("Rastreado correctamente"), se indexa
> y posiciona igual. **Un catálogo sin precios se indexa perfectamente**; solo pierde el adorno del precio.

Esto es una decisión de negocio frecuente (inventario mixto con y sin precio) → la skill debe dejarlo
explícito para no alarmar a un dueño sin necesidad.

## 0.2 🚫 PELIGRO: *"El keyword+ciudad en el NOMBRE del negocio ... pesa"*

**Correlaciona, sí. Y es una violación de las directrices del GBP** (el nombre debe ser el nombre real del
negocio) que **expone la ficha a suspensión**. Perder la ficha = perder el Map Pack entero.

**Regla correcta:** el nombre del negocio va **tal cual es en el mundo real, y nada más**. El keyword+ciudad
va en `<title>`, meta description, H1, la **descripción** del GBP y las categorías. Nunca en el nombre.

> Nota: la skill `maps-gbp-local` ya lo tiene como antipatrón explícito ("keyword-stuffing en el NOMBRE").
> El borrador lo contradecía. **Prevalece la skill.**

## 0.3 ⚠️ Matiz operativo grande: *"acelerar con Solicitar indexación"*

Verificado 2026-07-17. **"Solicitar indexación" sirve para DESCUBRIMIENTO**, no para convencer a Google.

- Contra **"Rastreada: actualmente sin indexar"** → **NO sirve.** Google ya la rastreó (en bersaglio, *a
  diario*: último rastreo del mismo día) y **decidió** no indexarla. Pedírselo otra vez no cambia un juicio
  de valor. **Es cuota y tiempo perdidos** — el dueño estaba haciéndolo pieza por pieza, en vano.
- Contra **URL nueva que Google no conoce** → **SÍ** aplica (es descubrimiento real).

**Regla: mirar el ESTADO antes de gastar la cuota (~10-12/día).**

| Estado en GSC | Qué significa | ¿Solicitar indexación? |
|---|---|---|
| **Descubierta: actualmente sin indexar** | En cola; falta autoridad/tiempo | Puede ayudar |
| **Rastreada: actualmente sin indexar** | La leyó y **decidió** que no vale la pena | **NO ayuda** → atacar prominencia/contenido/enlaces |
| **Excluida por noindex** | Intencional o candado viejo | Revisar si es intencional |
| **No se ha encontrado (404)** | Enlace roto | Arreglar |

## 0.4 ❓ SIN VERIFICAR: *"El hub de catálogo arrastra los productos en cascada"*

**No se observó.** En bersaglio hoy: los hubs (`/colecciones.html`, `/journal.html`) **están indexados** y
las **27 fichas enlazadas desde ellos NO**. La cascada no ocurrió en ~2 meses.

→ **No convertir en regla.** Dejar como hipótesis a medir. El hub ayuda al *descubrimiento* (Google llega a
las URLs), pero **descubrir ≠ indexar**: el juicio de valor es por-página.

---

# 1. `search-console-setup-y-diagnostico`

## 1.1 ✅ La propiedad puede vivir en una cuenta secundaria (`authuser=N`)
La pantalla "Bienvenida / agregar propiedad" en `authuser=0` **NO** significa que no exista.
Revisar `search.google.com/u/N/...`. *(Verificado: la de Bersaglio vive en `authuser=3`.)*

## 1.2 ✅ Los 4 estados de "Páginas sin indexar" → §0.3 (tabla). **El diagnóstico define la acción.**

## 1.3 ✅ "Sitemap Correcto / N descubiertas" ≠ indexado — Y el N es de la ÚLTIMA LECTURA
Verificado 2026-07-17: el archivo real tenía **52 URLs** y GSC mostraba **37 descubiertas** (última lectura
7 días antes). Las 15 URLs nuevas **no existían para Google**.

→ **Regla: tras añadir URLs al sitemap, REENVIARLO** (Sitemaps → escribir `sitemap.xml` → ENVIAR →
confirma *"Se ha enviado el sitemap correctamente"*). No basta con que el archivo esté actualizado.
→ Y "descubiertas" ≠ "indexadas": son contadores distintos. Dominios nuevos tardan **semanas**.

## 1.4 ✅ Core Web Vitals "No se han recogido suficientes datos de uso en los últimos 90 días"
**No es un bug ni una tarea.** Significa que el sitio **no tiene tráfico suficiente** para el Chrome UX
Report. Es un **síntoma diagnóstico** (te dice dónde estás), no algo que arreglar con código.

## 1.5 ⚠️ Automatización con la extensión de Chrome — la técnica NO es universal
El borrador daba por regla `form_input(ref)` + **dos** `Return` en llamadas separadas. **Verificado que no
aplica a todos los widgets**: en el campo de **sitemap**, `form_input` + Enter (×2) **NO envió**; hubo que
**hacer clic en el botón ENVIAR**.

→ **Regla real: la técnica varía por widget → SIEMPRE verificar el EFECTO** (leer la pantalla / el estado
resultante) antes de dar la acción por hecha. Lo que sí se mantiene:
- La barra de **Inspección de URL** es un combobox que no acepta `type` fiable → `form_input(ref)`.
- El modal *"Estamos probando…"* intercepta los Enter siguientes → **cerrarlo antes de la próxima URL**.
- Si `Enter` no surte efecto → localizar y clicar el botón real.

## 1.6 ✅ CONTAR ≠ MUESTREAR (regla dura para cualquier claim cuantitativo)
Las listas de GSC y GBP **paginan (10/página) y ordenan por reciente**. Leer la 1ª página y extrapolar al
total es el **sesgo máximo** (lo más nuevo es justo lo aún no atendido).

> Caso real (error cometido y corregido por el dueño): se afirmó *"la mayoría de las 85 reseñas están sin
> responder"* tras ver 5. **Al contar las 9 páginas: 74 respondidas (87%) / 11 sin responder**, y las 11
> eran todas recientes (páginas 3-9: 10/10 respondidas). **La afirmación era falsa.**

→ **Regla**: antes de decir "la mayoría / casi todos / N de M": (1) **recorrer el universo** (paginar);
(2) **validar la suma contra un contador independiente** (aquí: 85 contadas == 85 del panel público → método
verificado); (3) si no se puede contar, decir *"en la muestra que vi (N=5)…"* y **no generalizar**.

---

# 2. `ssg-static-prerender` (y on-page)

## 2.1 ✅ title/meta keyword-first SIN sacrificar la voz de marca (confirmado en prod)
Desacoplar **meta (SEO)** de **og (social)**:
- `<title>` + `<meta description>` → **keyword de PRODUCTO + CATEGORÍA + CIUDAD** (lo que Google lee/rankea).
- **H1 y copy VISIBLE** → voz editorial intacta.
- `og:description` / `twitter:description` → el copy poético (preview social).
- Si el nombre del producto es poético ("Puro Albor"), **derivar el tipo de producto del slug** para el título
  → *"Anillo de Diamante · Puro Albor · <Marca> <Ciudad>"*.

## 2.2 ✅ PATRÓN CLAVE: cáscara-noindex + horneada-canónica
La cáscara SPA (`pieza.html`, `entrada.html`, `colecciones.html`) queda **`noindex`**; el SSG hornea la URL
bonita e indexable reusando esa misma cáscara como plantilla:
- `/pieza/<slug>.html` · `/coleccion/<slug>.html` · `/gema/<slug>.html` · `/journal/<slug>.html`
- Cada horneada: `robots: index, follow` + **canonical autorreferencial** + `<base href="/">` (vive en subdir
  → las rutas relativas deben resolver a la raíz) + og/twitter propios + JSON-LD propio.
- **Cero contenido duplicado**: la cáscara noindex nunca compite con la horneada.

> **Regla de oro derivada**: *contenido real SIN URL indexable = trabajo perdido.* Caso real: 6 guías
> escritas y publicadas eran **invisibles** para Google porque solo vivían en `entrada.html?e=<slug>`
> (noindex) → el hub era indexable pero cada artículo era un **callejón sin salida**.

## 2.3 ✅ Hidratación sin query param + compatibilidad hacia atrás
La horneada inyecta `window.PRERENDERED_<ENTIDAD>_SLUG = "<slug>"`; el JS lo lee **con fallback al
`?param=`**:
```js
if (window.PRERENDERED_ENTRY_SLUG) return window.PRERENDERED_ENTRY_SLUG;
return new URL(location.href).searchParams.get('e') || '';
```
→ La URL vieja (`?e=`) **sigue funcionando** (enlaces ya compartidos por WhatsApp/redes no se rompen) pero
queda noindex, y su canonical apunta a la horneada. **Migrar URLs sin romper nada.**

## 2.4 ✅ `<noscript>` con el CUERPO REAL (no solo el resumen)
Para artículos, el **texto completo** es el activo SEO. Va en `<noscript>` con breadcrumb + H1 + imagen +
párrafos + CTA. **No es cloaking**: es exactamente el mismo contenido que el usuario ve hidratado.

## 2.5 ✅ Anclajes fail-loud (patrón SP-5.3) — anti-fallo-silencioso
El SSG hornea con `.replace()` por **string literal**. Si un rediseño borra un ancla, el replace **falla en
silencio** → N páginas horneadas con SEO roto y nadie se entera.
→ **Lista de anclas obligatorias + `throw` si falta una.** Error ruidoso > SEO roto silencioso.

## 2.6 ✅ bake-integrity por página + puerta cero-ficción
- **bake-integrity**: validar cada página horneada (tamaño mínimo, `</html>` presente). Una rota **ABORTA el
  run** → producción se queda en el último build bueno.
- **Puerta cero-ficción**: hornear **solo** lo publicado **Y completo** (título + imagen + resumen) + **slug
  seguro** (regex anti path-traversal: sin `/`, sin `..`). Espejo de la regla server-side.

## 2.7 ✅ Gate anti-XSS del SSG (`SSG_SELFTEST`)
El contenido viene del CMS → **entrada no confiable**. Correr los bakers puros con un payload
`</script><script>alert(1)</script>` + `U+2028/U+2029` y verificar: sin breakout crudo, los JSON-LD parsean,
los globals inyectados parsean, `robots index` presente, canonical correcto, **determinismo** (misma entrada
→ misma salida). Sin red. Es un gate de CI.

## 2.8 ✅ `lastmod` REAL (no "hoy")
**Google ignora el `lastmod` si TODAS las URLs dicen hoy.** Derivarlo del `updatedAt`/`date` del contenido.
Reservar "hoy" para lo que de verdad cambia con el build (p.ej. páginas de faceta).

## 2.9 ✅ Ciclo precio → re-indexación
El `<lastmod>` de cada producto sale de su `updatedAt` → **verificar que el update del admin sella
`updatedAt` server-side** (`serverTimestamp`). Con cron diario que re-hornea, un cambio de precio se refleja
en ≤24h; para inmediatez el día del cambio → **rebuild manual** (`workflow_dispatch`).

---

# 3. `semantic-schema-aeo`

## 3.1 🚫 `aggregateRating` self-serving PROHIBIDO — y el matiz que faltaba
No inyectar reseñas del **Google Business Profile ni de terceros** en el schema del propio sitio.
**Ampliación importante**: las reseñas del GBP son de **un tercero (Google)**; marcarlas como propias va
contra la política de review snippets y **puede penalizar**.
> Tentación real y frecuente: el negocio tiene 85 reseñas ★5,0 en Google y "solo" falta ponerlas en el
> schema para sacar estrellas. **NO.** Las estrellas legítimas salen de reseñas recolectadas **ON-SITE**
> (widget propio, moderadas). Es decisión de producto, no un truco de schema.

## 3.2 ⚠️ Product sin precio → ver §0.1 (el borrador estaba invertido). Resumen:
`offers` sin `price` = **inválido** (no elegible) · omitir `offers` si no hay precio · **no bloquea
indexación** · dejar el schema listo para emitir `price` + `InStock` en cuanto exista el precio.
**Nunca `price: 0`** para fingir.

## 3.3 ✅ Schema CONDICIONAL (cero-ficción)
Emitir **solo** campos con dato real: `geo`, `openingHours`, `aggregateRating`, `priceRange` se **omiten** si
no hay dato. Un schema que miente es peor que uno incompleto.

## 3.4 ✅ `Article` para blog/journal (patrón completo)
`headline` (≤110 chars — Google recorta) · `description` · `image[]` · `author` · `publisher` (`@id` del
negocio) · `datePublished` / `dateModified` (ISO) · `articleSection` · `mainEntityOfPage` · `isPartOf`
(`@id` del WebSite) — **+ `BreadcrumbList`** (Inicio › Journal › título).

## 3.5 ✅ NO esconder texto para SEO
Si la keyword ya está **visible** en title/meta/copy/locator/schema, **no la escondas**. Hidden-text/cloaking
= riesgo, no ganancia. Caso real: se quiso alargar un eyebrow "para que el SEO lo reconozca"; la
verificación mostró que las keywords ya estaban visibles en 5 sitios → se **acortó** el visible sin perder
nada.

## 3.6 ✅ Un contenido = una URL canónica
La cáscara SPA noindex + canonical → la horneada. Ver §2.2.

---

# 4. `maps-gbp-local`

## 4.1 ✅ Relevancia + Distancia + **PROMINENCIA** — con dato real que lo prueba
Bersaglio tiene **85 reseñas ★5,0** y ficha **verificada al 100%**… y **27 páginas sin indexar**.
→ **Una ficha excelente NO arregla la autoridad web.** Son ejes distintos y no se sustituyen. La skill debe
decirlo así de claro para no vender humo.

## 4.2 🚫 El NOMBRE del negocio → ver §0.2. **Nombre real y nada más.**

## 4.3 ✅ TRUCO VERIFICADO: sacar el `geo` (lat/lng) del propio GBP — sin pedírselo al dueño
La URL del place en Google Maps trae las coordenadas reales:
```
/maps/place/<NOMBRE>/@10.4251642,-75.5492068,17z/data=...!3d10.4251642!4d-75.5492068!16s%2Fg%2F11z12mf6kd
                      └── viewport ──┘                  └──── coords del PLACE ────┘   └── place id ──┘
```
- `!3d<lat>!4d<lng>` = **coordenadas del lugar** (las buenas). `@lat,lng` = viewport (suele coincidir).
- **Verificar que el `kgmid`/place id coincida** con el del knowledge panel del negocio **antes de usarlas**
  (si no, estás horneando el pin de otro local).
→ Elimina el bloqueo típico *"pendiente: pedir lat/lng al dueño"*. **El dato ya es suyo, está en su ficha.**

## 4.4 ✅ Cargar productos con foto en el propio GBP
Empuja imágenes de producto a Google **YA**, sin depender de Merchant Center ni de tener precios.

## 4.5 ✅ Responder reseñas — cómo auditarlo de verdad
Es la palanca de prominencia más citada (recencia + respuesta 24-48h). **Pero medir el estado exige contar**
(§1.6): la lista pagina de 10 y ordena por reciente.
> Patrón real observado: **74/85 respondidas (87%)**; las 11 sin responder eran **todas recientes**. Es decir:
> el negocio SÍ tiene la disciplina; solo va con retraso de unas semanas. **Diagnóstico correcto = "ponte al
> día con 11", no "estás abandonado".** La diferencia entre esos dos mensajes es la credibilidad.

## 4.6 ✅ Frescura del perfil
Google premia la actividad: **fotos nuevas cada mes + publicaciones**. Verificable desde fuera: el knowledge
panel muestra *"Actualizado por este negocio hace N semanas"*.

## 4.7 ❓ HIPÓTESIS: reseñas en otro idioma = segmento sin atender
Observado: reseñas **mezcladas español/inglés** (turistas). El sitio y todo el SEO apuntan solo a español.
**Podría** haber demanda en inglés sin capturar (*"jewelry store Cartagena"*). **No medido** → hipótesis para
validar con datos (GSC → Rendimiento por consulta/país), **no una regla**.

---

# 5. General (cualquier skill de posicionamiento)

## 5.1 ✅ Reproyectar el posicionamiento sin tocar la marca
Ej.: *"atelier exclusivo"* → *"tienda/ecommerce con envíos a todo el país"* se hace en **meta description +
schema description**, **SIN** tocar el copy visible de marca.

## 5.2 ✅ Verificar en PRODUCCIÓN, no en local
Tras cada deploy: `curl` + `grep` sobre la URL real (robots, canonical, JSON-LD, sitemap). Un build verde no
prueba que prod esté bien.
> Limitación conocida de entorno: los navegadores headless/sandbox **no siempre completan la conexión de
> Firestore** → el contenido dinámico no hidrata ahí. **No confundirlo con un bug del sitio**: verificar el
> HTML servido con `curl` y la lógica con un test determinista.

## 5.3 ✅ Separar "no es elegible" de "está roto"
GSC alarma en rojo por cosas que **no** afectan indexación (ej. falta `price`). Un dueño no técnico lee
"error crítico" y entra en pánico. **La skill debe enseñar a traducir**: ¿esto bloquea indexación, o solo el
adorno? Casi siempre es lo segundo.

## 5.4 ✅ El orden real de las palancas cuando "no me indexan"
Cuando el diagnóstico es **"Rastreada: actualmente sin indexar"** (juicio de valor de Google), no hay truco
técnico. Orden por impacto real:
1. **GBP optimizado** (mayor palanca local).
2. **Datos que diferencien cada página** (precio, disponibilidad, specs reales) — no plantillas clonadas.
3. **Reseñas reales** (on-site para estrellas legítimas).
4. **Enlaces externos** (autoridad — lo que más pesa y lo más lento).
5. **Contenido único** (guías/blog indexable): el mejor activo contra este problema exacto.

**Y decirlo honestamente: esto es de semanas, no de días.** Quien prometa lo contrario, miente.

---

## Nota de método para quien porte esto

Este documento nació de un trabajo real y **de un error cometido y corregido por el dueño** (§1.6). Se marcó
`✅ / ⚠️ / 🚫 / ❓` deliberadamente: **lo que no se midió va como hipótesis, no como regla.** Al portarlo a
las skills, **conservar esa distinción**. Una skill que afirma de más es peor que una incompleta: se
convierte en la fuente de verdad de todas las webs futuras.
