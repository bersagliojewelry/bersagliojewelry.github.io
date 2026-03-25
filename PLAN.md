# PLAN: Migración a Inventario Real — Bersaglio Jewelry

## Contexto

La página tiene actualmente **12 piezas ficticias** en `catalog.js` organizadas en 4 colecciones inventadas. El cliente proporcionó **26 piezas reales** de su inventario + certificado de calidad firmado por **Fabio Enrique Peñuela Montañez** (Jewelers of America, Inc. — Master Jeweler) bajo la marca **La Verde**.

---

## Análisis del Inventario Real

### Tipos de piezas reales:
| Tipo | Cantidad | Refs |
|------|----------|------|
| **Anillos** | 11 | 001-003, 016, 017, 020, 022, 024, 025, 035, 039, 046, sin ref |
| **Topos (aretes)** | 9 | 077, 080, 083, 086, 091, 094, sin ref (3) |
| **Dijes** | 4 | 098, 109, 111, 112 |
| **Argollas** | 2 | 060 (azul y rosa) |

### Gemas presentes:
- **Esmeraldas colombianas** (naturales, certificadas)
- **Diamantes naturales** (varios cortes: redondo, baguette)
- **Amatistas naturales** (corte gota, ovalado)
- **Zafiros naturales** (azul y rosa)
- **Rubíes naturales** (rosa, corte ovalado)
- **Topacios naturales** (amarillo)
- **Moissanita de laboratorio** (azul)

### Metales:
- Oro amarillo 18k (Ley 750) — mayoría
- Oro blanco 18k (Ley 750) — algunos

### Certificación:
- Certificados por **La Verde — Unique & Beautiful**
- Firmado por **Fabio Enrique Peñuela Montañez**
- Credencial: **Jewelers of America, Inc. — Master Jeweler**

---

## Cambios a Realizar

### PASO 1: Reestructurar las colecciones

**ELIMINAR** las 4 colecciones ficticias:
- ~~Esmeraldas Colombianas~~
- ~~Diamantes Eternos~~
- ~~Oro Escultórico~~
- ~~Novias~~

**CREAR** colecciones basadas en el inventario real, organizadas por **tipo de pieza** (más natural para un catálogo de joyería):

1. **Anillos** — `anillos` (11 piezas)
   - Solitarios, especiales, con piedras múltiples
2. **Topos & Aretes** — `topos-aretes` (9 piezas)
   - Topos de diamante, esmeralda, amatista, topacio
3. **Dijes & Colgantes** — `dijes-colgantes` (4 piezas)
   - Dijes con diamantes, esmeraldas, topacio
4. **Argollas** — `argollas` (2 piezas)
   - Argollas en zafiros naturales

### PASO 2: Reemplazar las 12 piezas ficticias con las 26 reales

Cada pieza tendrá estos datos reales del inventario:

```javascript
{
    id:          "ref-020",
    slug:        "anillo-esmeralda-certificada-ref020",
    ref:         "REF.020",
    name:        "Anillo Especial Esmeralda Certificada",
    collection:  "anillos",
    type:        "anillo",
    description: "Anillo de joyería fina con esmeralda rectangular certificada de alta pureza de 1.152ct, acompañada de 2 diamantes baguettes de 0.50ct. Montado en oro blanco de 18 kilates.",
    price:       null,          // sin precios por ahora
    priceLabel:  "Consultar",
    specs: {
        metal:       "Oro blanco 18k (Ley 750)",
        weight:      "4.3 gr",
        size:        "6.5",
        mainStone:   "Esmeralda natural rectangular — 1.152 ct",
        accentStones:"2 Diamantes baguettes — 0.50 ct",
        totalCarats: "1.652 ct",
        color:       "Verde esmeralda / Blanco",
        quality:     "IF",
        origin:      "Colombia"
    },
    certificate: {
        authority:   "La Verde — Unique & Beautiful",
        certifiedBy: "Fabio Enrique Peñuela Montañez",
        credential:  "Jewelers of America, Inc. — Master Jeweler"
    },
    badge:    "Certificada",
    featured: true
}
```

### PASO 3: Actualizar las páginas de colecciones HTML

**ELIMINAR:**
- `esmeraldas-colombianas.html`
- `diamantes-eternos.html`
- `oro-escultorico.html`
- `novias.html`

**CREAR:**
- `anillos.html` — página de colección Anillos
- `topos-aretes.html` — página de colección Topos & Aretes
- `dijes-colgantes.html` — página de colección Dijes & Colgantes
- `argollas.html` — página de colección Argollas

### PASO 4: Actualizar la certificación (servicios)

**Cambio clave:** La certificación NO es GIA. Es de **La Verde / Jewelers of America**.

Actualizar en:
- `catalog.js` → servicio de certificación
- `servicios.html` → sección de certificación
- `js/utils/schema.js` → schema de productos (cambiar "GIA" a "La Verde / Jewelers of America")
- Todas las meta descriptions que mencionen GIA

### PASO 5: Actualizar el homepage (index.html)

- Sección de colecciones destacadas → 4 nuevas colecciones
- Sección de piezas destacadas → seleccionar 6 piezas reales como featured
- Textos de hero/intro → mantener esencia pero alinear con inventario real

### PASO 6: Actualizar la navegación

En `snippets/header.html` y `snippets/footer.html`:
- Cambiar los links de colecciones al nuevo esquema
- Actualizar nombres de colecciones

### PASO 7: Actualizar structured data (JSON-LD)

- `js/utils/schema.js` → actualizar templates de producto con campos de certificación real
- Schema de productos → añadir campo `certificate` con La Verde
- Schema de organización → mantener datos de Bersaglio

### PASO 8: Actualizar el sitemap

- `public/sitemap.xml` → reemplazar URLs de colecciones viejas con las nuevas
- Añadir URLs de las 26 piezas reales

### PASO 9: Actualizar búsqueda y recomendaciones

- `js/search.js` → el buscador ya funciona con catalog.js, solo necesita nuevos datos
- `js/recommendations.js` → actualizar lógica para recomendar por tipo de gema y tipo de pieza

### PASO 10: Actualizar textos de marca

- Servicio de certificación: cambiar GIA → La Verde / Jewelers of America
- Mantener el resto de textos de marca (about, filosofía) que ya son reales
- Notar que el precio de las piezas es "Consultar" (no hay precios públicos por ahora)

---

## Piezas destacadas sugeridas (featured: true)

1. **REF.020** — Anillo Esmeralda Certificada (IF, 1.652ct, pieza premium)
2. **REF.046** — Anillo Esmeralda Cabuchón (4.73ct, pieza statement)
3. **REF.035** — Anillo Rubíes Rosa y Diamantes (2.65ct rubíes)
4. **REF.094** — Topos Círculo Diamante & Baguettes (58 diamantes)
5. **REF.098** — Dije Topacio Amarillo con Diamantes (variedad de gemas)
6. **REF.060 azul** — Argollas Zafiros Azules (pieza diferente)

---

## Archivos que se modifican

| Archivo | Acción |
|---------|--------|
| `js/data/catalog.js` | **REESCRIBIR** — nuevas colecciones + 26 piezas reales |
| `js/utils/schema.js` | **EDITAR** — certificación La Verde |
| `index.html` | **EDITAR** — actualizar referencias a colecciones |
| `colecciones.html` | **EDITAR** — textos de encabezado si los tiene hardcoded |
| `anillos.html` | **CREAR** — nueva página colección |
| `topos-aretes.html` | **CREAR** — nueva página colección |
| `dijes-colgantes.html` | **CREAR** — nueva página colección |
| `argollas.html` | **CREAR** — nueva página colección |
| `esmeraldas-colombianas.html` | **ELIMINAR** |
| `diamantes-eternos.html` | **ELIMINAR** |
| `oro-escultorico.html` | **ELIMINAR** |
| `novias.html` | **ELIMINAR** |
| `servicios.html` | **EDITAR** — certificación real |
| `snippets/header.html` | **EDITAR** — links de navegación |
| `snippets/footer.html` | **EDITAR** — links de pie de página |
| `public/sitemap.xml` | **EDITAR** — nuevas URLs |
| `vite.config.js` | **EDITAR** — registrar nuevas páginas HTML |
| `js/recommendations.js` | **EDITAR** — lógica por tipo de pieza/gema |

---

## Notas importantes

1. **Sin precios públicos** — Todas las piezas tendrán `price: null` y `priceLabel: "Consultar"` hasta que el cliente indique precios
2. **Sin fotos de producto** — El inventario no incluye fotos individuales (solo el certificado). Las piezas seguirán sin imagen hasta que el cliente las proporcione
3. **Inventario parcial** — El cliente indicó que irá compartiendo más piezas. La estructura permite agregar fácilmente
4. **Certificación real** — La Verde / Jewelers of America reemplaza toda mención a GIA
