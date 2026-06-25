---
name: product-feeds
description: Generar feeds de producto/inventario en el BUILD para EMPUJAR tu catálogo a Google y portales en vez de esperar el rastreo — la palanca de visibilidad #1 que casi todos olvidan. Úsala cuando un negocio con catálogo (joyería, concesionario, inmobiliaria) quiere que su inventario aparezca en superficies de alto valor: Google Merchant Center (productos/joyas → Shopping/free listings), Google Vehicle Ads + Local Inventory (autos), portales inmobiliarios CO (FincaRaíz/Metrocuadrado). El feed se genera como una salida MÁS del mismo build SSG (consume la misma data Firestore + tenant_config), por vertical. Reglas duras: solo ítems `status:published`, datos REALES (cero-demo — precio/disponibilidad reales o el campo apropiado para "bajo consulta"), formato exacto que exige cada destino (TSV/XML), IDs estables = slug/codigoUnico inmutable. Triggers — "feed de productos", "Google Merchant Center", "Shopping", "vehicle ads", "local inventory", "publicar inventario en FincaRaíz/Metrocuadrado", "empujar catálogo a Google", "free product listings". Lee `tenant_config.json` (vertical, feeds[], nap). Salida del mismo build que `ssg-static-prerender`. NUEVA en el paquete (gap real: la mayoría no tiene feeds).
---

# 📤 Product Feeds — empujar el catálogo (no esperar el rastreo)

> Parte del paquete de visibilidad (HUB). Empujar datos > esperar que Google rastree. El feed = otra salida
> del MISMO build SSG (misma data + `tenant_config`). `buildFeed(feedType, items, config)` vive en el core (IoC).
> Qué feeds genera cada repo lo dice `tenant_config.feeds[]`. Cuentas (Merchant/portales) = ⛔ del dueño.

## 0. Por qué (el gap)
El SSG hace tu sitio rastreable; el **feed te mete en superficies que NO rastrean tu sitio**: Google Shopping/
free listings, Vehicle Ads, portales inmobiliarios. Es push directo de inventario estructurado → más alcance
con la misma data. Altorra/Bersaglio hoy NO tienen feeds = oportunidad sin tocar.

## 1. Feeds por vertical (qué generar según `tenant_config.feeds`)
| Vertical | Destino | Formato | Campos núcleo |
|---|---|---|---|
| **JewelryStore** | Google Merchant Center (free listings + Shopping) | TSV o XML (Google Product) | `id`, `title`, `description`, `link`, `image_link`, `price`*, `availability`, `brand`, `google_product_category`, `mpn` |
| **AutoDealer** | Google Vehicle Ads + Local Inventory | feed Vehicle | `vehicle_id`(VIN/codigoUnico), `make`, `model`, `year`, `price`*, `mileage`, `condition`, `image[]`, `vehicle_option`, `dealer{name,address}` |
| **RealEstateAgent** | FincaRaíz / Metrocuadrado (portales CO) | XML/CSV del portal | `referencia`, `tipo`, `operacion`(venta/arriendo), `precio`*, `area`, `habitaciones`, `baños`, `ciudad`, `barrio`, `fotos[]` |

`*` precio: REAL si `priceDisplay:"real"`; si "bajo consulta" usa el campo/estado que el destino permita (algunos
exigen precio → o lo das real, o no listas ese ítem en ese feed; **no inventes un precio**).

## 2. Generación (en el build — `buildFeed` del core, IoC)
```js
// el tenant orquesta: misma data Firestore que el SSG, filtrada a published
const items = allItems.filter(i => i.status === 'published');
for (const feedType of cfg.feeds) {
  const feedStr = buildFeed(feedType, items, cfg);   // core: mapea vertical→formato del destino, escapeXml
  bakeIntegrity(feedStr, MIN_FEED_BYTES);            // guard: feed vacío/roto NO se publica
  writeFile(`feeds/${feedType}.xml`, feedStr);       // se sube a GH Pages; el destino lo lee por URL
}
```
- **IDs estables** = `slug`/`codigoUnico` inmutable (si el id cambia, el destino crea un duplicado/pierde histórico).
- **`image_link`** absoluto (https) — el feed exige URLs completas. (Las imágenes vienen de `image-pipeline`.)
- **escapeXml** en todo campo de texto (campos editables de CMS = riesgo de romper el XML).

## 3. Reglas duras
- Solo `status:published`. · **Cero-demo**: precio/disponibilidad/specs REALES; "bajo consulta" → estado correcto,
  nunca precio inventado. · Formato EXACTO del destino (un campo mal nombrado → el feed se rechaza entero).
- Cumplir las políticas del destino (Merchant: imágenes sin marca de agua, precio = el del landing, etc.).
- El feed se regenera en cada build (on-push + diario) → siempre fresco; el destino re-fetcha por URL.

## ✅ Checklist
- [ ] `tenant_config.feeds[]` define los destinos por vertical.
- [ ] `buildFeed` mapea vertical→formato exacto del destino (TSV/XML) con `escapeXml`.
- [ ] Solo published · IDs estables (slug/codigoUnico) · `image_link` absolutos.
- [ ] bake-integrity del feed (no publicar feed vacío/roto) · precio real o estado "consulta" (cero-demo).
- [ ] (Operativo dueño) cuenta Merchant/portal creada + feed dado de alta por URL + políticas cumplidas.
