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
  "aggregateRating":{ "@type":"AggregateRating", "ratingValue":"4.8", "reviewCount":"37" }  // SOLO si reseñas REALES
}
```
**`aggregateRating` SOLO con reseñas reales** (de GBP/web). Inventarlo = spam penalizado. Si no hay, omitir.

## 3. Answer capsule + FAQ (para Maps + AEO local)
En la home/landing: cápsula de respuesta **40-60 palabras** ("¿Quién es X? ¿Dónde? ¿Qué vende?") + FAQ visible +
`FAQPage`. Es lo que la IA y el snippet local extraen. `robots.txt` habilita los bots IA (ver `semantic-schema-aeo`).
**Landing por ciudad** si operas en varias (una página real por ciudad, no doorway pages).

## 4. OPERATIVO (lo hace el dueño en GBP — la skill da la lista, no lo ejecuta)
- Reclamar/verificar el GBP · categoría principal correcta · perfil 100% (horarios, fotos, productos, atributos).
- **Pedir reseñas** sistemáticamente (link directo) + **responder todas** en 24-48h con keywords naturales
  (categoría+ciudad: "gracias por confiar en nuestro taller en Cartagena").
- **Inventario en GBP**: publicar productos/vehículos (GBP Products / Vehicle inventory) — empuja datos a Google.
- Fotos nuevas cada mes · posts/ofertas.

## 5. Antipatrones (cero-demo / no hagas)
Keyword-stuffing en el NOMBRE del negocio (solo el nombre real) · categorías falsas · **aggregateRating inventado** ·
NAP inconsistente · reseñas compradas/falsas (baneo) · doorway pages por ciudad sin contenido real.

## ✅ Checklist
- [ ] `tenant_config.nap` define el NAP maestro · idéntico en web/JSON-LD/GBP/directorios.
- [ ] `LocalBusiness`→subtipo en el HTML del build (curl+grep) con address+geo+openingHours+sameAs.
- [ ] `aggregateRating` solo si hay reseñas reales · teléfono +57 E.164 · addressCountry CO.
- [ ] Answer capsule 40-60 palabras + FAQPage · robots habilita bots IA.
- [ ] (Operativo dueño) GBP verificado, categoría correcta, perfil 100%, flujo de reseñas + respuestas 24-48h.
