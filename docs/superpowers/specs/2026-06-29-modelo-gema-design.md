# Modelo de datos de la GEMA — DISEÑO + DECISIÓN (TODO-57)

> **Decisión Fuerte** (modelo de datos, cara de revertir). Pipeline W-11 COMPLETO: arquitecto-software (6 lentes) + **comité ×5** (datos·admin/Kary·taxonomía·migración·marca, unánime) + **consejo externo** (prompt entregado a Daniel) + mockup + prompt Chrome + **gate de decisión (Daniel)**. Autor: Claude `[OPUS-4.8]` (2026-06-29). Detona: §149 (badge de gema por color con regex sobre texto libre) → Daniel: "¿hay lista en el admin? ¿multi-gema? ¿sin gema? hay que ver todos los escenarios."

## 1. Problema
El badge color-por-gema (§149) deriva `specs.stone` (TEXTO LIBRE) con un regex. Frágil: Kary (no técnica) puede teclear typos o gemas que el regex no cubre (ópalo, perla…) → badge roto en silencio. Y no modela **multi-gema** (central + acentos, o varias protagonistas) ni **sin-gema** (oro solo). Esto NO es solo el badge: es la **taxonomía de gema** del catálogo (badge + filtros TODO-50 + color).

## 2. Verdad verificada (ground truth)
- Admin (`admin-piezas.html:227`): "Piedra principal" = `input` texto libre (`specs.stone`); "Acentos" = `input` libre (`specs.accent`). NO hay select/lista.
- 32 piezas: todas mono-gema, `specs.stone` limpio = "Diamante/Esmeralda/Rubí/Zafiro Natural". Ninguna usa `accent`. `specs.color` = color de la piedra (H/Verde Vivido/Rojo/Azul).
- `badge` (string editorial libre, "Esmeralda colombiana") ≠ stone. El badge de gema §149 lo deriva el regex `js/core/gem-badge.js`.

## 3. DECISIÓN (comité unánime 5/5 = Opción 3 HÍBRIDO + gate Daniel)
Separar **DATO canónico** (máquina) de **PROSA** (humano). El texto libre NUNCA vuelve a gobernar color/filtro.

### 3.1 Modelo de datos (`pieces/{id}`) — todo ADITIVO · **PLANO** (consejo externo §8, corrige al comité)
```
specs.badgeGem:     "esmeralda"                 // NUEVO · string · slug de la gema PROTAGONISTA → tiñe el badge · query where(==) · 'oro'/null = sin gema
specs.gemFilterIds: ["esmeralda","diamante"]    // NUEVO · array de STRINGS planos · TODAS las gemas presentes → filtros where(array-contains)
specs.stone:  "Esmeralda colombiana talla esmeralda 2.1 ct"   // INTACTO · prosa de la carta gemológica (poesía/SSG/JSON-LD)
specs.accent / specs.metal / specs.color / badge / ...        // INTACTOS
```
- slug = ASCII minúscula sin tildes (`esmeralda`/`rubi`/`zafiro`/`diamante`/…) — clave estable e indexable, NO el label.
- ⚠️ **Por qué PLANO y no `gems:[{type,role}]`** (consejo §8, verificado): Firestore `array-contains` matchea elementos COMPLETOS → NO sirve sobre un array de objetos (no puedes "tiene esmeralda" sobre `[{type:'esmeralda',role:'principal'}]`). Un array de STRINGS (`gemFilterIds`) sí. El comité tenía este fallo.
- `badgeGem='oro'`/null = sin gema (badge no se renderiza). Multi-gema: `badgeGem`=la protagonista (Kary elige); `gemFilterIds`=todas.

### 3.2 Taxonomía como DATO (no código)
```
gemTaxonomy/{slug}: { slug, label, color (token/hex), sinonimos:[...], orden, activa }
```
- SSoT del COLOR (no hardcode en regex/CSS). El `<select>` del admin se llena de aquí (onSnapshot, como el catálogo).
- **Editable por Kary y Daniel** (gate Daniel): botón "+ Agregar gema" (label + color de paleta predefinida). **Fallback de color NEUTRO** si una gema nueva llega sin color → NUNCA rompe el badge.

### 3.3 Lógica del badge (3 escenarios)
| Escenario | Datos | Tarjeta |
|---|---|---|
| **A · una gema** (las 32) | `gemPrincipal:"esmeralda"` | UN chip color de la gema |
| **B · multi-gema** | `gemPrincipal:"esmeralda"` + acentos | UN chip de la **principal**; acentos en ficha + filtros, NO en tarjeta |
| **C · sin gema** (oro solo) | `gemPrincipal:null` | **sin chip** (gate Daniel: nada de relleno) |
- Filtros (TODO-50): `array-contains` sobre `gems[].type` → una pieza esmeralda+diamante sale en filtro "Esmeralda" Y "Diamante". El badge sigue mostrando solo la principal.
- **Varias protagonistas**: **Kary elige cuál es la principal** (gate Daniel); el resto = acento.

### 3.4 Flujo de Kary (admin)
Donde hoy hay input libre "Piedra principal" → 3 controles: (1) **"Gema principal"** `<select>` obligatorio (de `gemTaxonomy`, incl. "Sin piedra (solo oro)") → escribe `gems[0]`+`gemPrincipal`; (2) **"Otras gemas/acentos"** multi-select opcional (role:acento); (3) **"Descripción gemológica (carta)"** = el texto libre de hoy (`specs.stone`), renombrado. Cero typos: nunca teclea la gema.

### 3.5 Migración de las 32 (aditiva · idempotente · gate)
1. Sembrar `gemTaxonomy` (4 gemas + colores §149: esmeralda=verde, rubi=rojo, zafiro=azul, diamante=platino).
2. DRY-RUN: script lee 32, normaliza `specs.stone` vs sinónimos, imprime tabla `id→stone→gems_propuesto` + marca no-match (esperado 0). NO escribe.
3. Gate (Daniel/Kary revisan) + backup JSON.
4. APPLY: escribe SOLO `gems[]`+`gemPrincipal` (merge/update, NUNCA set). `specs.stone` byte-idéntico. Idempotente.
5. VERIFY: 32/32 badge correcto en vivo y al recargar; luego se apaga el regex.
6. Rollback: aditivo → borrar `gems`/`gemPrincipal` y el badge cae al fallback regex (estado de hoy).

### 3.6 Transición segura
`gemBadge` lee `gemPrincipal` con **fallback al regex** (`gemPrincipal ?? regex(stone)`) hasta que form+backfill estén verificados → ninguna pieza rompe en la ventana de deploy. Luego se retira el regex.

## 4. Convergencias del comité (5/5)
Opción 3 ganó unánime (nadie defendió el parser). Separar dato/prosa · Kary elige de lista · color=dato · badge=una gema · sin-gema=sin badge · migración aditiva · `array` desde hoy evita 2ª migración.
Recomendaciones 1-línea: **datos**=gems[] SSoT + stone descriptivo · **admin/UX**=select obligatorio + "Sin piedra" + acentos checkbox · **taxonomía**=color como dato en gemTaxonomy · **migración**=aditiva+fallback regex+dry-run · **marca**=una gema protagonista, nunca 2 pastillas ni "+1".

## 5. Riesgos + invariantes
- **Riesgo #1 (doble verdad)**: `stone` (prosa) vs `gems[]` (canónico) divergen. Mitigación: `gems[]` ÚNICO dueño de badge/filtro; el form deriva `gemPrincipal` del select (no se teclea).
- **Riesgo #2 (slug sin color)**: gema nueva sin color → fallback neutro seguro + (a futuro) validación rules `gemPrincipal ∈ gems` y slug ∈ `gemTaxonomy`.
- **Riesgo #3 (índice)**: declarar índice `array-contains` en `firestore.indexes.json` ANTES del filtro TODO-50.
- INTACTOS: `specs.stone/accent/metal`, SSG, ficha, CF (verificar callsites de `specs.stone`).

## 6. IAP (implementación)
- (A) MODIFICAR: `js/core/gem-badge.js` (lee gemPrincipal+taxonomía+fallback), `js/home/featured.js`/`catalogo.js` (usan gemBadge), `admin-piezas.html`+`js/admin/piezas.js` (select+acentos+rename+save), `firestore.rules` (gems/gemTaxonomy), `public/sw.js` (cache bump). NUEVO: `gemTaxonomy` (colección), script backfill `scripts/migrate-gema.mjs`, helper taxonomía cliente.
- (B) INTACTOS: `specs.stone` y consumidores (SSG/ficha/CF), modelo `pedidos`, stock.
- (C) Muerto: el regex de `gemBadge` se retira tras la transición.
- (E) Riesgos→§5. Rollback aditivo. Tests: pura `gemBadge(gemPrincipal,taxonomy)` + backfill dry-run sobre las 32.

## 8. Consejo externo INTEGRADO (2026-06-29, §151) — VERIFICADO contra el código (cero alucinaciones)
Gemini (auditor adversarial, read-only) confirmó el HÍBRIDO y lo MEJORÓ. Cada claim verificado (regla de oro `[[feedback_consejo_externo_readonly]]`):
- **[ADOPTADO·corrige al comité] Modelo PLANO** (`specs.badgeGem` string + `specs.gemFilterIds` array de strings) en vez de `gems:[{type,role}]`: el array de objetos NO sirve para `array-contains`. → §3.1 reescrito; fundación `gem-badge.js` ya migrada a plano (test 7/7).
- **[ADOPTADO] Taxonomía DATA → horneada en `catalogo.json`** (como las colecciones): `settings/gems` (Kary gestiona id/nombre/color) → el SSG (`buildCatalogJson:667`, espejando `publicCollection`) la inyecta en `catalogo.json` → el cliente lee `data.getGems()` de memoria (badge instantáneo, sin lectura extra a Firestore). VERIFICADO: `buildCatalogJson` ya hornea `collections.map(publicCollection)`.
- **[ADOPTADO·trampa real] JSON-LD frágil** (VERIFICADO `generate-pieces.mjs:142`: `stones.split('·')[0]`): tras `badgeGem`, inyectar el NOMBRE CANÓNICO de la gema en `additionalProperty` (Schema.org) → entidad limpia para LLMs (Perplexity/ChatGPT), no texto truncado.
- **[ADOPTADO·trampa real] Optimistic lock** (VERIFICADO `js/admin/piezas.js:17/427` `_editingVersion`): los campos nuevos del form DEBEN pasar por `handleSave()` + el `_editingVersion` (no romper la concurrencia óptima).
- **[ADOPTADO] Filtro "Solo Oro"/sin gema EXPLÍCITO**: opción que consulta `gemFilterIds == []` o token; la ausencia de gema es un estado explícito, no un "no matcheó".
- **Confirmado correcto**: híbrido (poesía en texto libre + lógica en campo estructurado), color como dato, badge = una protagonista.

## 7. Estado
DECISIÓN CERRADA (4 capas: arquitecto + comité ×5 + **consejo externo verificado §8** + gate Daniel). Modelo PLANO (`specs.badgeGem`+`specs.gemFilterIds`). Fundación de código HECHA (`gem-taxonomy.js` + `gem-badge.js` plano, test 7/7). **Form admin HECHO ✅** (§151, en main vía PR #395: select "Gema principal" + checkboxes filtros + rename stone→"Descripción", deriva `gemFilterIds`, respeta `_editingVersion`). **Backfill de las 32 APLICADO + VERIFICADO ✅** (2026-06-29, gate Daniel: dry-run read-only → 32 writes MCP por field-path → re-lectura 32/32 con `badgeGem`+`gemFilterIds`, 0 no-match; `specs.stone`/carat/cert/`_version` intactos; respaldo en scratchpad). Pend IMPLEMENTACIÓN (TODO-57): `settings/gems` + hornear en catalogo.json + JSON-LD canónico (`generate-pieces.mjs:142`) + filtros TODO-50 + índice `array-contains` + (luego) retirar regex fallback + prueba live del form (login). → ADR §150/§151.
