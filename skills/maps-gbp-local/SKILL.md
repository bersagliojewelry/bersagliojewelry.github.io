---
name: maps-gbp-local
description: Rankear #1 en el local pack de Google Maps / Google Business Profile (GBP) para un negocio con ubicación (joyería, concesionario, inmobiliaria) — donde se gana o pierde la mayoría del tráfico local de alta intención. Úsala al optimizar la presencia local de cualquier proyecto del paquete de visibilidad: los 3 ejes (relevancia = categoría principal específica + secundarias reales + perfil 100%; distancia = no controlable; prominencia = velocidad/recencia de reseñas + respuestas 24-48h + fotos frescas + citaciones), el NAP maestro (un formato canónico idéntico en sitio/JSON-LD/GBP/directorios/redes), la plantilla LocalBusiness→subtipo (address+geo+openingHours+sameAs+aggregateRating de reseñas REALES), answer capsules 40-60 palabras + FAQPage, y distinguir lo OPERATIVO (lo hace el dueño en GBP) de lo CODIFICABLE (schema/robots/API). Reglas duras: cero-demo (NUNCA aggregateRating inventado, categorías falsas, NAP inconsistente), Colombia (+57 E.164, addressCountry CO, festivos). Triggers — "aparecer en Maps", "local pack", "Google Business Profile/GBP", "reseñas", "NAP", "negocio local en Google", "LocalBusiness schema", "que me encuentren en el mapa". Lee `tenant_config.json` (nap, sameAs, vertical). Pareja de `semantic-schema-aeo`.
---

# 📍 Maps / GBP Local — ganar el local pack #1

> Parte del paquete de visibilidad (HUB). El local pack (3 resultados con mapa) capta la intención local más
> caliente. Lee `tenant_config.json` (nap, vertical, sameAs). Datos de GBP (dirección/teléfono/horarios/coords) = ⛔ del dueño.

## 0. Los 3 ejes (qué controlas)
1. **Relevancia** (controlable): **categoría principal específica** (no genérica) + secundarias REALES + perfil
   GBP 100% completo + servicios/productos + descripción con keywords naturales.
2. **Distancia** (NO controlable): proximidad del que busca. No la peleas; la compensas con relevancia+prominencia.
3. **Prominencia** (controlable, el diferenciador): **velocidad y recencia de reseñas**, respuestas a TODAS las
   reseñas en 24-48h, **fotos frescas mensuales**, citaciones (directorios), señales web (tu SEO también suma aquí).

> ✅ **Dato real que lo prueba (2026-07-17)**: una ficha con **85 reseñas ★5,0 y perfil verificado al 100%**
> convivía con **27 páginas del sitio SIN indexar**. **Una ficha excelente NO arregla la autoridad web** — GBP
> y SEO/indexación son ejes distintos que NO se sustituyen. Decirlo así de claro; no vender humo.

## 1. NAP maestro (la base — un solo formato canónico)
Define UN formato exacto de Nombre·Dirección·Teléfono y úsalo **idéntico** en: sitio web · JSON-LD `LocalBusiness` ·
GBP · directorios (PaginasAmarillas, sectoriales) · redes. **Inconsistencia de NAP = confunde a Google = baja
prominencia.** Vive en `tenant_config.nap` (single source). Teléfono **+57 E.164**, `addressCountry: CO`.

## 2. Schema LocalBusiness (lo CODIFICABLE — en el HTML del build)
```jsonc
{ "@context":"https://schema.org",
  "@type":"AutoDealer",                         // subtipo por vertical: JewelryStore | AutoDealer | RealEstateAgent
  "name":"<nap.legalName>", "image":"<logo>", "url":"<baseUrl>",
  "telephone":"+57XXXXXXXXXX", "priceRange":"$$",          // opcional, real
  "address":{ "@type":"PostalAddress", "streetAddress":"...", "addressLocality":"Cartagena",
              "addressRegion":"Bolívar", "addressCountry":"CO" },
  "geo":{ "@type":"GeoCoordinates", "latitude":<lat>, "longitude":<lng> },
  "openingHoursSpecification":[ /* de nap.openingHours; contemplar festivos CO */ ],
  "sameAs":[ /* redes REALES */ ],
  "aggregateRating":{ "@type":"AggregateRating", "ratingValue":"4.8", "reviewCount":"37" }  // SOLO reseñas PROPIAS on-site (NUNCA las del GBP — ver abajo)
}
```
⚠️ **CORREGIDO (2026-07-17): `aggregateRating` SOLO con reseñas reales recolectadas ON-SITE (primera mano —
widget propio, moderadas).** 🚫 Las reseñas del **GBP son de un TERCERO (Google)**: inyectarlas en el schema
del propio sitio = *self-serving review snippet* → viola la política de Google y **puede penalizar**. Aunque el
negocio tenga 85 reseñas ★5,0 en Maps, NO van al schema. Inventarlo = spam penalizado. Sin reseñas propias → omitir.

**✅ Truco verificado — sacar el `geo` (lat/lng) del propio GBP, sin pedírselo al dueño**: la URL del place en
Google Maps trae las coordenadas reales:
```
/maps/place/<NOMBRE>/@10.4251642,-75.5492068,17z/data=...!3d10.4251642!4d-75.5492068!16s%2Fg%2F11z12mf6kd
                     └── viewport ──┘                     └── coords del PLACE (las buenas) ┘ └ place id ┘
```
`!3d<lat>!4d<lng>` = coordenadas del **lugar**; `@lat,lng` = viewport (suele coincidir). **Verificar que el
place id / `kgmid` coincida** con el del knowledge panel del negocio ANTES de usarlas (si no, estás horneando
el pin de otro local). Elimina el bloqueo típico *"pendiente: pedir lat/lng al dueño"* — el dato ya está en su ficha.

## 3. Answer capsule + FAQ (para Maps + AEO local)
En la home/landing: cápsula de respuesta **40-60 palabras** ("¿Quién es X? ¿Dónde? ¿Qué vende?") + FAQ
**visible** (⚠️ `FAQPage` ya NO da rich result desde may-2026 — lo que vale es la Q&A visible que la IA puede
citar; ver `semantic-schema-aeo`). Es lo que la IA y el snippet local extraen. `robots.txt` habilita los bots
IA (ver `semantic-schema-aeo`).
**Landing por ciudad** si operas en varias (una página real por ciudad, no doorway pages).

## 4. OPERATIVO (lo hace el dueño en GBP — la skill da la lista, no lo ejecuta)
- Reclamar/verificar el GBP · categoría principal correcta · perfil 100% (horarios, fotos, productos, atributos).
- **Pedir reseñas** sistemáticamente (link directo) + **responder todas** en 24-48h con keywords naturales
  (categoría+ciudad: "gracias por confiar en nuestro taller en Cartagena").
- ✅ **Auditar el estado de respuesta exige CONTAR, no muestrear**: la lista de reseñas pagina (10/pág) y
  ordena por reciente → lo más nuevo es justo lo aún no atendido. Recorrer TODAS las páginas + validar la suma
  contra el contador público del panel. *(Caso real: "la mayoría de 85 sin responder" tras ver 5 → al contar:
  **74/85 respondidas (87%)** y las 11 pendientes eran todas recientes. Diagnóstico correcto = "ponte al día
  con 11", no "estás abandonado" — la diferencia entre esos dos mensajes es la credibilidad.)*
- **Inventario en GBP**: publicar productos/vehículos **con foto** (GBP Products / Vehicle inventory) — empuja
  imágenes de producto a Google **YA**, sin depender de Merchant Center ni de tener precios.
- Fotos nuevas cada mes · posts/ofertas. ✅ **Verificable desde fuera**: el knowledge panel muestra
  *"Actualizado por este negocio hace N semanas"* — Google premia la frescura.

## 5. Antipatrones (cero-demo / no hagas)
🚫 **Keyword-stuffing en el NOMBRE del negocio** — el nombre va **tal cual es en el mundo real y nada más**.
Sí, el keyword+ciudad en el nombre *correlaciona* con ranking, pero **viola las directrices del GBP y expone
la ficha a SUSPENSIÓN** (perder la ficha = perder el Map Pack entero). El keyword+ciudad va en `<title>`,
meta description, H1, la **descripción** del GBP y las categorías — nunca en el nombre. · Categorías falsas ·
**aggregateRating inventado o copiado del GBP** (ver §2) · NAP inconsistente · reseñas compradas/falsas
(baneo) · doorway pages por ciudad sin contenido real.

## 6. ❓ Hipótesis a medir (NO son reglas — validar con datos antes de invertir)
- **Reseñas mezcladas español/inglés (turistas) = ¿segmento en inglés sin capturar?** (*"jewelry store
  Cartagena"*, *"real estate Cartagena"*…). Plausible pero NO medido → validar primero con GSC → Rendimiento
  por consulta/país. Si los datos lo confirman, evaluar landing/hreflang en inglés; si no, no gastar.

## ✅ Checklist
- [ ] `tenant_config.nap` define el NAP maestro · idéntico en web/JSON-LD/GBP/directorios.
- [ ] `LocalBusiness`→subtipo en el HTML del build (curl+grep) con address+geo+openingHours+sameAs.
- [ ] `aggregateRating` solo si hay reseñas reales · teléfono +57 E.164 · addressCountry CO.
- [ ] Answer capsule 40-60 palabras + FAQPage · robots habilita bots IA.
- [ ] (Operativo dueño) GBP verificado, categoría correcta, perfil 100%, flujo de reseñas + respuestas 24-48h.
