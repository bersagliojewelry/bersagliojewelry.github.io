# `tenant_config.json` — el combustible por proyecto (esquema del HUB)

> UN archivo en la raíz de cada repo. El motor es agnóstico; este config lo personaliza. **CERO hardcode**
> de nombres de proyecto en las skills/core — todo entra por aquí + env del CI. Agregar un proyecto = nuevo
> `tenant_config.json` + correr. Lo llena la sesión-implementadora del proyecto con **datos REALES del dueño
> (cero-demo)**. Todas las skills del paquete de visibilidad leen de aquí.

## Esquema (campos comunes + por vertical)
```jsonc
{
  "project": "altorracars",                 // slug interno (NO se hardcodea en código; viene de aquí)
  "vertical": "AutoDealer",                  // JewelryStore | AutoDealer | RealEstateAgent  ← gatea schema+validación
  "baseUrl": "https://altorracars.github.io",
  "brandName": "ALTORRA CARS",
  "lang": "es-CO",

  // ── Identidad / entidad (Organization + LocalBusiness) ──
  "nap": {                                   // NAP MAESTRO — idéntico en web/JSON-LD/GBP/directorios/redes
    "legalName": "ALTORRA Company SAS",
    "phone": "+57XXXXXXXXXX",                // E.164. ⛔ lo aporta el dueño
    "email": "ventas@...",                   // ⛔ dueño
    "hasPhysicalLocation": true,             // false ⇒ omitir address/geo (service-area business)
    "address": { "street": "", "city": "Cartagena", "region": "Bolívar", "postalCode": "", "country": "CO" }, // ⛔ dueño
    "geo": { "lat": null, "lng": null },     // ⛔ dueño (coords del local)
    "openingHours": []                       // ⛔ dueño. ej ["Mo-Sa 08:00-18:00"]
  },
  "sameAs": [],                              // ⛔ dueño: URLs REALES de redes (FB/IG/YT/TikTok/LinkedIn). cero-demo: vacío > inventado
  "priceDisplay": "consulta",               // "real" (Offer con price) | "consulta" (⚠️ 2026-07-17: se OMITE el bloque offers — un Offer SIN price es INVÁLIDO en GSC; nunca PreOrder-sin-price ni price:0)

  // ── Medición ──
  "ga4MeasurementId": "",                    // ⛔ dueño (G-XXXX) o vacío ⇒ skill ga4 no inyecta
  "gscVerification": "",                     // TXT/meta de Search Console (⛔ dueño)

  // ── SSG ──
  "collections": [                           // qué hornear
    { "name": "vehiculos", "type": "item", "template": "detalle-vehiculo.html", "outDir": "vehiculos", "slugField": "slug", "statusField": "status" },
    { "name": "marcas",    "type": "hub",   "template": "marca.html",           "outDir": "marcas" }
  ],
  "minBakeBytes": 5000,
  "robotsAiBots": ["GPTBot","PerplexityBot","Google-Extended","ClaudeBot","BingBot"], // habilitar rastreo IA

  // ── Feeds (product-feeds) ──
  "feeds": [],                               // ej ["google-merchant"] (joya) | ["vehicle-ads","local-inventory"] (auto) | ["fincaraiz"] (inmob)

  // ── Imágenes (image-pipeline) ──
  "imageFormats": ["webp","avif"],
  "imageGeoExif": false                      // EXIF geo = señal local menor/opcional
}
```

## Campos por vertical (lo que `validateTenant` permite/prohíbe)
| Vertical | schemaType principal | Campos VÁLIDOS (ejemplos) | PROHIBIDOS (otro vertical) |
|---|---|---|---|
| **JewelryStore** (Bersaglio) | `JewelryStore` + `Product` (additionalProperty: material/quilates/peso) | quilates, material, gema, talla | `kilometraje`, `VIN`, `transmision`, `habitaciones` |
| **AutoDealer** (Altorra) | `AutoDealer` + `Car`+`Offer` (itemCondition New/Used; VIN solo PROPIOS §gate legal) | kilometraje, transmision, combustible, VIN(propios) | `quilates`, `habitaciones`, `area_m2` |
| **RealEstateAgent** (inmobiliaria) | `RealEstateAgent` + `Residence`/`Offer` | habitaciones, baños, area_m2, estrato, parqueaderos | `kilometraje`, `VIN`, `quilates` |

`validateTenant` aborta (THROW, exit 1) si un ítem trae un campo PROHIBIDO para su vertical → anti-contaminación
cross-proyecto antes del SSG.

## Datos que SOLO el dueño aporta (⛔ — la sesión-implementadora los PIDE, nunca inventa)
`nap` (dirección/teléfono/email/horarios/coords · ¿local físico?) · `sameAs` (URLs de redes REALES) ·
`ga4MeasurementId` / `gscVerification` / cuenta GBP (existentes o crearlas) · GCP service account para APIs ·
decisión `priceDisplay` (real vs "bajo consulta"). **Cero-demo**: ningún campo se rellena con datos plausibles inventados.
