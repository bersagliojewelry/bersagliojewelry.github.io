---
name: semantic-schema-aeo
description: El cerebro semántico de la visibilidad — qué structured data (JSON-LD) inyectar por tipo de página + cómo ser CITADO/RECOMENDADO #1 por buscadores e IA (AEO). FUSIÓN deliberada de SEO-técnico (schema) + AEO (answer-engine) porque ambos viven en el mismo `<head>` y separarlos colisiona. Úsala al construir `buildSchema()` del core o al decidir el schema/meta de un sitio: Product/Offer/AggregateRating/Review/Organization/LocalBusiness/BreadcrumbList/FAQPage/Article/Person/ImageObject con sus props requeridas vs recomendadas + plantillas parametrizables por vertical (JewelryStore/AutoDealer/RealEstateAgent). Incluye CWV 2026 (LCP/INP/CLS), E-E-A-T, y el playbook AEO (=20% código / 80% off-page: el código referencia el consenso externo —sameAs/reseñas/FAQ citable—, NO lo genera). Regla dura: schema en el HTML del build (curl+grep), cero-demo (NUNCA AggregateRating/sameAs/reseñas inventadas = spam penalizado), NAP maestro. Triggers — "qué schema pongo", "structured data", "rich results", "que la IA me recomiende", "AEO", "FAQ schema", "aparecer en AI Overviews/ChatGPT/Perplexity", "Organization/LocalBusiness JSON-LD". Pareja de `ssg-static-prerender`. Lee `tenant_config.json`.
actualizada: 2026-09-03
reglas: 10
lecciones: []
origen: propia
---

# 🧠 Semantic Schema + AEO — structured data + ser citado por la IA

> FUSIÓN (decisión verificada: structured-data + answer-engine viven en el mismo `<head>`). Parte del
> paquete de visibilidad (HUB). El código emite el JSON-LD (la skill `ssg-static-prerender` lo hornea);
> el **playbook off-page** lo ejecuta el dueño/marketing. Lee `tenant_config.json` (vertical, nap, sameAs, priceDisplay).

## 0. Las dos verdades
1. **On-page (20%)**: el schema/meta correcto en el HTML del build → elegibilidad para rich results + materia
   prima para que la IA entienda tu entidad. Necesario, NO suficiente.
2. **Off-page (80%) — el driver real del AEO**: la IA recomienda lo que el **CONSENSO externo** repite (reseñas,
   directorios, menciones, Knowledge Graph). El código REFERENCIA ese consenso (`sameAs`, FAQ citable, formato
   respuesta-primero); **no lo genera**. Por eso esta skill = parte-código + PLAYBOOK operativo. No prometas
   "ranking-IA solo con código".

## 1. Structured data por tipo de página (checklist — props REQUERIDAS vs recomendadas)
> Emite SOLO campos con dato real (schema **condicional**: `geo`, `openingHours`, `aggregateRating`,
> `priceRange`… se OMITEN si no hay dato — **un schema que miente es peor que uno incompleto**).
> `@context:"https://schema.org"`. Verificar en Rich Results Test.

| Página | Tipo(s) JSON-LD | Requeridas | Recomendadas |
|---|---|---|---|
| Ficha de ítem | `Product` (o `Car`/`Residence` por vertical) + `Offer` | name, image, description; `offers` SOLO si hay precio real (ver ⚠️ abajo) | brand, sku, `aggregateRating`*, `review`*, additionalProperty |
| Home/entidad | `Organization` + `LocalBusiness`→subtipo | name, url, logo | `sameAs`, address, geo, telephone, openingHours, `aggregateRating`* |
| Listado/categoría | `BreadcrumbList` + `ItemList` | itemListElement | — |
| FAQ / respuesta | `FAQPage` (Q&A visibles; ⚠️ SIN rich result desde may-2026 — ver bloque abajo) | mainEntity[{Question,acceptedAnswer}] | — |
| Journal/blog | `Article` + `Person` (autor) + `BreadcrumbList` (Inicio › Journal › título) | headline (**≤110 chars** — Google recorta), datePublished (ISO), author | `dateModified`, image[], description, `publisher` (`@id` del negocio), articleSection, mainEntityOfPage, `isPartOf` (`@id` del WebSite) |
| Imagen | `ImageObject` | contentUrl | caption, `exifData` (geo, opcional) |

`*` **AggregateRating/Review SOLO si hay reseñas REALES y recolectadas ON-SITE (primera mano).** Inventarlas =
structured-data spam → **acción manual / baneo algorítmico**. 🚫 **Y las reseñas del GBP son de un TERCERO
(Google)**: inyectarlas en el schema del propio sitio = *self-serving review snippet* → viola la política y
puede penalizar. La tentación clásica: "el negocio tiene 85 reseñas ★5,0 en Google, solo falta ponerlas en el
schema para sacar estrellas" → **NO**. Estrellas legítimas = reseñas recolectadas on-site (widget propio,
moderadas) — es decisión de PRODUCTO, no un truco de schema. Sin reseñas propias → omitir el campo.

### ⚠️ Product SIN precio — el borrador viejo estaba INVERTIDO (✅ verificado en GSC, 2026-07-17)
- Un `Offer` **sin `price`** (aunque lleve `priceCurrency`/`availability`) es un ítem **INVÁLIDO** — GSC:
  *"Se debe especificar `price` o `priceSpecification.price`"* (17/17 inválidos en prod). Es PEOR que no
  emitir oferta: afirma una oferta que no existe. **Si emites `offers`, DEBE llevar `price`. Nunca `price: 0`.**
- **Piezas "bajo consulta" / a medida → OMITIR el bloque `offers` COMPLETO**, no emitirlo a medias. Dejar el
  schema listo para emitir `price` + `InStock` en cuanto exista el precio.
- `offers` es solo UNA de **tres vías de elegibilidad** para el fragmento: `offers` | `review` |
  `aggregateRating`. Sin ninguna → no hay rich result (y no es un "error" del sitio).
- **El matiz que importa al dueño**: esto **NO bloquea indexación ni ranking** (GSC literal: *"los elementos
  no válidos no pueden aparecer en los resultados enriquecidos"* — la página se rastrea, indexa y posiciona
  igual). **Un catálogo sin precios se indexa perfectamente**; solo pierde el adorno del precio. Decisión de
  negocio frecuente (inventario mixto) → no alarmar al dueño sin necesidad.

## 2. Plantilla JSON-LD parametrizable (el corazón de `buildSchema(vertical, item)`)
```js
// pseudo del core (funciones puras). ⚠️ CORREGIDO 2026-07-17 (verificado en GSC): Offer SIN price = INVÁLIDO.
// Sin precio ("bajo consulta") -> OMITIR offers por completo (nunca PreOrder-sin-price, nunca price:0).
function buildSchema(vertical, x, cfg) {
  const TYPE = { JewelryStore: ['JewelryStore','Product'], AutoDealer: ['AutoDealer','Car'], RealEstateAgent: ['RealEstateAgent','Residence'] }[vertical];
  const hasPrice = cfg.priceDisplay === 'real' && x.price;   // precio REAL o nada
  const offers = hasPrice
    ? { offers: { '@type':'Offer', price:String(x.price), priceCurrency:'COP',
                  availability:'https://schema.org/InStock', seller:{ '@type':TYPE[0], name:cfg.brandName } } }
    : {};  // sin price NO hay bloque offers (elegibilidad rich result = offers | review | aggregateRating)
  return { '@context':'https://schema.org', '@type':TYPE[1], name:x.title, image:x.images,
           description:x.desc, brand:x.brand, ...offers,
           additionalProperty: verticalProps(vertical, x) };  // quilates|kilometraje|area_m2 según vertical
}
```
Detalle de `additionalProperty` por vertical + `LocalBusiness`/`Organization` con `sameAs` → usa `tenant_config`.
**Gate legal**: campos sensibles (VIN/placa de terceros, datos personales) solo con base legal (Habeas Data CO).

### ⚠️🚫 `FAQPage` YA NO da rich result — NUNCA venderlo como tal (✅ verificado 2026-07-17, doc oficial)
Desde el **7-may-2026** el rich result de FAQ desapareció TOTALMENTE del SERP (fuente primaria:
`developers.google.com/search/docs/appearance/structured-data/faqpage` — se acabó incluso la excepción
gov/health de 2023; la doc se retiró el 15-jun-2026 y GSC eliminó el informe/filtro FAQ). Reglas:
- 🚫 **NUNCA** prometer acordeón / más espacio en el SERP por `FAQPage`. Ponerlo "y ya" = **teatro SEO**.
- ✅ El schema sigue siendo **válido** (Google lo parsea para *entender* la página; no hay que borrarlo) —
  pero **no vale como trabajo de SEO por sí solo**. Y debe corresponder a Q&A **visibles** (regla general).
- ⇒ **Reclasificar: una FAQ es tarea de CONTENIDO, no de schema.** La FAQ **VISIBLE** sí vale: (a) AEO/GEO —
  los LLM/AI Overviews citan pregunta literal + respuesta corta y autónoma; (b) ataca "Rastreada: actualmente
  sin indexar" (juicio de VALOR de Google → se combate con contenido real, no con marcado).
- 🧭 **Meta-regla (para CUALQUIER regla de SEO)**: las features del SERP **mueren** — toda recomendación de
  rich result lleva **fecha + fuente primaria** (doc de Google > blogs > "siempre se hizo así") y se
  re-verifica contra la doc oficial antes de portarse a otra skill/proyecto.

## 3. AEO — el playbook off-page (lo que el código NO hace)
- **Entidad consistente**: `Organization`+`LocalBusiness` + `sameAs` COMPLETO (redes REALES del dueño) + NAP
  idéntico en toda superficie + Wikidata/Google Knowledge Panel donde aplique.
- **Formato citable** (en la página, visible): respuesta-directa **<150 palabras** arriba, subtítulos-pregunta,
  tablas, FAQ **visible** (el `FAQPage` es opcional — ya sin rich result, ver §1). La IA cita lo que puede
  extraer fácil.
- **Autoridad/consenso**: GBP al 100%, directorios sectoriales, **reseñas reales con keywords categoría+ciudad**,
  Digital PR/menciones. (Esto es trabajo del dueño/marketing — la skill da la lista, no lo ejecuta.)
- **Rastreo IA**: `robots.txt` habilita GPTBot/PerplexityBot/Google-Extended/ClaudeBot/BingBot (de `tenant_config.robotsAiBots`).
- **Frescura**: `dateModified` trimestral en páginas clave. **Medición**: 20-30 consultas objetivo, auditoría
  semanal en ChatGPT/Perplexity/Gemini/AI Overviews (¿te mencionan? ¿con qué dato?).

## 4. CWV 2026 + E-E-A-T (señales técnicas que sostienen el ranking)
- **Core Web Vitals (p75 CrUX)**: LCP < 2.5s · INP < 200ms · CLS < 0.1. Recetas: **INP** = partir/diferir JS,
  evitar long tasks; **CLS** = `width`/`height` en img + `font-display:swap`; **LCP** = preload + critical CSS +
  `fetchpriority="high"` SOLO en el LCP. (Encaja con la doctrina de performance del proyecto.)
- **E-E-A-T**: página Nosotros/autor (`Person`), políticas/garantías, reseñas reales. Demuestra experiencia real.

## 4bis. «Agentic browsing» — una categoría MEDIBLE, separada del SEO

> **Procedencia**: la categoría y su nombre vienen de `addyosmani/web-quality-skills@afa8da94` (**MIT**,
> fichero `LICENSE` del repo; HEAD 2026-08-24, consultado el **2026-09-03**), ruta `skills/seo/SKILL.md` —
> vía DICTAMEN-C4 §10 **D-C4-28**. De su `references/STRUCTURED-DATA.md` **no entra NADA**: el §1 y el §2 de
> esta skill son superiores (saben de Colombia, de la prohibición de meter reseñas del GBP en el schema
> propio, de que `Offer` sin `price` es inválido y de la muerte del rich result de `FAQPage`).

Un agente que navega tu página no es un crawler y no es un usuario: **no ve tu CSS y no ejecuta tu
onboarding**. Lee el árbol de accesibilidad, los nombres programáticos y el HTML servido. `lighthouse_audit`
la puntúa aparte (auditorías tipo `agent-accessibility-tree`, `crawlable-anchors`, `link-text`,
`paste-preventing-inputs`), y por eso conviene mirarla como una tercera columna junto a SEO y a11y.

1. **Trátala como una comprobación de MÁQUINA-LECTORA, no como una señal de ranking.** Que un panel diga
   «Agentic Browsing 100» **no es evidencia de que te citen** en AI Overviews, ChatGPT o Perplexity: eso lo
   decide el consenso externo (§3, el 80 % off-page). Es una condición necesaria y barata, no un resultado.
   Reportarla como logro de AEO es exactamente el ✅ que miente.
2. **Lo que sí arregla, arréglalo — porque es lo mismo que ya pide el §1 y la `accessibility-audit`.**
   Anclas rastreables (`<a href>` real, no `<div onclick>`), texto de enlace que signifique algo fuera de su
   contexto visual, nombres programáticos en los controles, el JSON-LD **en el HTML del build** (no por JS),
   y no bloquear el pegado en los formularios. Cero trabajo nuevo: es la intersección de tres skills, y por
   eso vale la pena nombrarla una vez.


## 5. Red-team (errores que HUNDEN el ranking — evítalos)
AggregateRating inventado · **reseñas del GBP/terceros en el schema propio** (self-serving) · `Offer` sin
`price` (ítem inválido) · sameAs a redes que no existen · keyword-stuffing · schema que no matchea el contenido
visible (Google lo cruza) · **esconder texto "para que el SEO lo lea"** (si la keyword YA es visible en
title/meta/copy/schema, esconder más = riesgo sin ganancia — hidden-text/cloaking) · `noindex` residual ·
canonical roto · NAP inconsistente · schema solo por JS (invisible al bot) · **un contenido en 2+ URLs sin
canonical único** (cáscara SPA noindex + canonical → la horneada; ver `ssg-static-prerender §2bis`).

## 5bis. La PRECISIÓN también se inventa — cuatro trampas del markup «correcto»
No hace falta escribir una reseña falsa para mentirle a una máquina. Un campo válido con el dato
equivocado dentro es peor: valida, no lo cuestiona ninguna herramienta, y afirma con precisión algo
que no sabes.

- **Coordenadas aproximadas declaradas como exactas.** Si tus `lat/lng` son el centroide de un barrio
  —lo normal en inmobiliaria, y lo correcto para no publicar la dirección— NO las emitas como
  `geo`/`GeoCoordinates` del ítem: la página puede decir «ubicación aproximada» al lado del mapa, pero
  el JSON-LD no tiene asteriscos. **Omite el campo.**
- **`addressLocality` es la CIUDAD, no el barrio.** Meter el barrio ahí borra la ciudad del address
  estructurado y le enseña al motor una localidad que no existe. El barrio va en el nombre y en el
  texto, donde significa lo que significa.
- **Propiedades colgadas del tipo equivocado.** `numberOfRooms` y `numberOfBathroomsTotal` son de
  `Accommodation`. Si para un local comercial eliges `Place` (que es lo honesto), esas props no
  aplican: markup que valida y no significa nada. Cada tipo se declara con lo que ese tipo admite.
- **La misma cifra con dos significados.** Un canon mensual y un precio de venta son ambos un número:
  distínguelos con `businessFunction` (`#Sell` vs `#LeaseOut`) y usa `UnitPriceSpecification` con
  `unitText` para lo recurrente. Con `price` a secas, desde fuera son idénticos.

**Regla que los cubre a los cuatro**: en structured data, **omitir es gratis y afirmar de más es
caro**. Antes de emitir un campo pregúntate si podrías defender ese valor exacto ante quien lo lea;
si la respuesta lleva un «bueno, aproximadamente», el campo no va.

## ✅ Checklist de cierre
- [ ] `curl -s <url> | grep 'application/ld+json'` muestra el JSON-LD (en el build, no JS).
- [ ] Rich Results Test sin errores · cero AggregateRating/review sin reseñas propias on-site.
- [ ] `offers` solo con `price` real (sin precio → sin bloque offers; nunca price:0), y lo recurrente
      con `UnitPriceSpecification` + `businessFunction` (un canon y un precio de venta no son el mismo dato).
- [ ] cero campos de PRECISIÓN que no puedas sostener: sin `geo` si las coordenadas son aproximadas,
      sin `streetAddress` si no publicas la dirección, `addressLocality` = ciudad (no barrio).
- [ ] `sameAs` solo con redes REALES (o vacío) · NAP idéntico web↔schema↔GBP.
- [ ] Respuesta-directa <150 palabras + FAQ **visible** en páginas clave (FAQPage opcional, sin rich result).
- [ ] robots habilita los bots IA · `dateModified` fresco · un contenido = UNA URL canónica.
