---
name: semantic-schema-aeo
description: El cerebro semántico de la visibilidad — qué structured data (JSON-LD) inyectar por tipo de página + cómo ser CITADO/RECOMENDADO #1 por buscadores e IA (AEO). FUSIÓN deliberada de SEO-técnico (schema) + AEO (answer-engine) porque ambos viven en el mismo `<head>` y separarlos colisiona. Úsala al construir `buildSchema()` del core o al decidir el schema/meta de un sitio: Product/Offer/AggregateRating/Review/Organization/LocalBusiness/BreadcrumbList/FAQPage/Article/Person/ImageObject con sus props requeridas vs recomendadas + plantillas parametrizables por vertical (JewelryStore/AutoDealer/RealEstateAgent). Incluye CWV 2026 (LCP/INP/CLS), E-E-A-T, y el playbook AEO (=20% código / 80% off-page: el código referencia el consenso externo —sameAs/reseñas/FAQ citable—, NO lo genera). Regla dura: schema en el HTML del build (curl+grep), cero-demo (NUNCA AggregateRating/sameAs/reseñas inventadas = spam penalizado), NAP maestro. Triggers — "qué schema pongo", "structured data", "rich results", "que la IA me recomiende", "AEO", "FAQ schema", "aparecer en AI Overviews/ChatGPT/Perplexity", "Organization/LocalBusiness JSON-LD". Pareja de `ssg-static-prerender`. Lee `tenant_config.json`.
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
> Emite SOLO campos con dato real (schema condicional). `@context:"https://schema.org"`. Verificar en Rich Results Test.

| Página | Tipo(s) JSON-LD | Requeridas | Recomendadas |
|---|---|---|---|
| Ficha de ítem | `Product` (o `Car`/`Residence` por vertical) + `Offer` | name, image, description, offers{price\|priceCurrency\|availability} | brand, sku, `aggregateRating`*, `review`*, additionalProperty |
| Home/entidad | `Organization` + `LocalBusiness`→subtipo | name, url, logo | `sameAs`, address, geo, telephone, openingHours, `aggregateRating`* |
| Listado/categoría | `BreadcrumbList` + `ItemList` | itemListElement | — |
| FAQ / respuesta | `FAQPage` (Q&A visibles en la página) | mainEntity[{Question,acceptedAnswer}] | — |
| Journal/blog | `Article` + `Person` (autor) | headline, datePublished, author | `dateModified` (frescura), image |
| Imagen | `ImageObject` | contentUrl | caption, `exifData` (geo, opcional) |

`*` **AggregateRating/Review SOLO si hay reseñas REALES.** Inventarlas = structured-data spam → **acción manual /
baneo algorítmico**. Cero-demo absoluto. Si no hay reseñas → omitir el campo (no poner 5.0 ficticio).

## 2. Plantilla JSON-LD parametrizable (el corazón de `buildSchema(vertical, item)`)
```js
// pseudo del core (funciones puras). availability: priceDisplay "consulta" -> PreOrder/InStock sin price.
function buildSchema(vertical, x, cfg) {
  const TYPE = { JewelryStore: ['JewelryStore','Product'], AutoDealer: ['AutoDealer','Car'], RealEstateAgent: ['RealEstateAgent','Residence'] }[vertical];
  const offer = cfg.priceDisplay === 'real' && x.price
    ? { '@type':'Offer', price:String(x.price), priceCurrency:'COP', availability:'https://schema.org/InStock' }
    : { '@type':'Offer', availability:'https://schema.org/PreOrder', priceSpecification:{ '@type':'PriceSpecification', valueAddedTaxIncluded:true } }; // "bajo consulta"
  return { '@context':'https://schema.org', '@type':TYPE[1], name:x.title, image:x.images,
           description:x.desc, brand:x.brand, offers:{ ...offer, seller:{ '@type':TYPE[0], name:cfg.brandName } },
           additionalProperty: verticalProps(vertical, x) };  // quilates|kilometraje|area_m2 según vertical
}
```
Detalle de `additionalProperty` por vertical + `LocalBusiness`/`Organization` con `sameAs` → usa `tenant_config`.
**Gate legal**: campos sensibles (VIN/placa de terceros, datos personales) solo con base legal (Habeas Data CO).

## 3. AEO — el playbook off-page (lo que el código NO hace)
- **Entidad consistente**: `Organization`+`LocalBusiness` + `sameAs` COMPLETO (redes REALES del dueño) + NAP
  idéntico en toda superficie + Wikidata/Google Knowledge Panel donde aplique.
- **Formato citable** (en la página, visible): respuesta-directa **<150 palabras** arriba, subtítulos-pregunta,
  tablas, FAQ visible + `FAQPage`. La IA cita lo que puede extraer fácil.
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

## 5. Red-team (errores que HUNDEN el ranking — evítalos)
AggregateRating inventado · sameAs a redes que no existen · keyword-stuffing · schema que no matchea el contenido
visible (Google lo cruza) · `noindex` residual · canonical roto · NAP inconsistente · schema solo por JS (invisible al bot).

## ✅ Checklist de cierre
- [ ] `curl -s <url> | grep 'application/ld+json'` muestra el JSON-LD (en el build, no JS).
- [ ] Rich Results Test sin errores · cero AggregateRating/review sin reseñas reales.
- [ ] `sameAs` solo con redes REALES (o vacío) · NAP idéntico web↔schema↔GBP.
- [ ] Respuesta-directa <150 palabras + FAQ visible + `FAQPage` en páginas clave.
- [ ] robots habilita los bots IA · `dateModified` fresco.
