---
name: catalogo-voz-bersaglio
description: >-
  Úsala cuando pidan MEJORAR las piezas o las colecciones ya cargadas del catálogo
  Bersaglio — analizar cada pieza/colección JUNTO CON SU IMAGEN y rellenar en la voz
  de marca y copywriting de Bersaglio lo que más impacta (nombre, badge, descripción).
  También cuando pidan ELEGIR/colocar las DESTACADAS (featured) con variedad entre
  colecciones. Dispara con: "mejora las piezas cargadas", "ponles voz de marca",
  "rellena nombre/badge/descripción", "mejora las colecciones", "elige las 9 destacadas".
  NO inventa datos: si falta un hecho (precio, origen real de la gema), lo deja como está
  o lo pregunta. (Bersaglio = alta joyería colombiana, atelier en Cartagena.)
---

# Catálogo en voz Bersaglio — rellenar piezas/colecciones y elegir destacadas

> Origen: §134 (las 32 piezas de TrueLab pasaron de la nomenclatura del laboratorio a voz de
> marca). Esta skill **codifica ese método** para repetirlo en cargas futuras. La VOZ vive en el
> cerebro (no aquí): leerla SIEMPRE antes de redactar. Regla del dueño: `feedback_voz_de_marca_no_generico`.

## 0. Antes de nada — internaliza la voz (no la inventes)
Lee y absorbe la voz REAL antes de escribir una sola palabra:
- **Nosotros** (`js/pages/nosotros-defaults.js` + `siteContent/nosotros` en Firestore) — el alma.
- **Home** (`js/home/siteContent-defaults.js`) + **categorías** (`collections` en Firestore) — voz de producto.
- Ejemplos canónicos en `docs/99-HISTORIAL-ADR.md` §133/§134.
Aforismos de la casa: *"un legado se susurra, no se compra" · "nuestra casa es tu casa" · "una conversación, un café, una pieza"*. Tono: editorial, íntimo, pausado; **lujo como susurro, no estridencia**. 100% COP, cero dólares.

## 1. Lee los datos reales (verificar, no asumir)
- Piezas: `firestore_query_collection` sobre `pieces` (filters `[]`, limit alto). Cada pieza trae
  `specs` (stone, carat, color, cut, metal, origin, certificate), `collection`, `code`, `images[]`.
- **MIRA LA IMAGEN de cada pieza** (es lo que pidió el dueño): el `images[0]`. Si es un escaneo de
  certificado (no una foto real de la joya), NO lo uses como gancho visual y déjalo anotado para
  reemplazo (TODO imágenes IA); la foto real es del dueño.
- Colecciones: `firestore_query_collection` sobre `collections`.

## 2. NOMBRE de pieza — fórmula
`[palabra evocadora, propia] ` — **un sustantivo o imagen** del mundo Bersaglio que case con la pieza.
- **PROHIBIDO**: la nomenclatura del certificado (`"<Tipo> de <Piedra> Natural"`), la palabra
  "Natural", el Nº de reporte, el "<tipo> de <gema>" genérico. Eso vive en la ficha, no en el título.
- **Distinto pieza a pieza** (si hay 4 esmeraldas-anillo, 4 nombres distintos), cohesivo por gema.
- Lexicón por gema (guía, no jaula — ampliar con criterio):
  - **Esmeralda** (verde, Colombia): Cartagena + agua + verde + luz. *Bóvedas, Rocío, Baluarte, Luciérnaga, Cascada, Brisa, Murallas, Sereno, Manantial, Talismán, Relicario, Vitral, Manglar, Marea.*
  - **Rubí** (rojo): fuego/brasa/corazón. *Latido, Brasa, Amapola, Fragua, Granada, Ascua, Carmín, Llama, Chispa.*
  - **Zafiro** (azul): noche/mar/profundidad. *Índigo, Medianoche, Abismo, Luceros.*
  - **Diamante** (luz, color H): alba/luz/escarcha. *Albor, Escarcha, Destello, Aurora, Centella.*
  - El nombre puede guiñar al rasgo real (gota→Rocío/Cascada; corazón→Latido; baguette grande→Medianoche; topos→Chispa/Luceros/Centella).

## 3. DESCRIPCIÓN de pieza — 3 movimientos (texto plano, sin asteriscos)
Una sola frase fluida por movimiento, **sin listar specs** (el ct/corte/reporte ya están en la ficha):
1. **Gesto / emoción** — conecta la pieza con quien la lleva (*"Para quien lleva el verde por dentro."*).
2. **Materia con orgullo** — el oro 18k + la gema, envuelta en lenguaje, no como ficha (*"El verde más hondo de Colombia, engastado en oro de 18 quilates."*).
3. **Confianza / legado** — única + certificada + para heredar (*"Pieza única y certificada, para custodiar hoy y heredar mañana."*).
- ⚠️ La descripción NO puede empezar con "prueba" (el render la oculta) ni repetir el spec crudo.

## 4. BADGE de pieza — gema + carácter (único, no genérico)
`<gema> [· <rasgo>]`. Ej.: `Esmeralda colombiana`, `Esmeralda · pieza mayor` (gemas grandes ≥ ~2 ct
o aretes con gema notable), `Rubí · talla corazón`, `Zafiro · pieza mayor`, `Diamante · talla princess`.
El render pinta el badge en TARJETA y ficha (`catalogo.js`: `p.tag || p.badge`; `pieza.js`: `piece.badge`).

## 5. COLECCIONES — mismo principio
`subtitle` (una línea, evocadora) + `description` (2-4 frases) en voz Bersaglio, **específicas** (oficio,
Cartagena, la gema, "fabricamos, no revendemos"), nunca lujo-genérico de catálogo ("diseñados para
cautivar", "obra de arte", "sofisticación atemporal" → reescribir). Mantener el `name`/`slug` (la
taxonomía es otra tarea); solo mejorar el lenguaje.

## 6. DESTACADAS (featured) — elegir 9 con VARIEDAD
La home muestra hasta **9** (tope duro, `admin/piezas.js`). Al elegir:
- **Variedad entre colecciones**: representar TODAS las colecciones con piezas (anillos, aretes,
  dijes, cadenas, pulseras, topos…), sin amontonar en una.
- **Variedad de gema** (esmeralda/rubí/zafiro/diamante) y de impacto (incluir las gemas mayores y
  piezas con gancho — talla corazón, baguette grande).
- Setear `featured:true` en las 9, `false` en el resto (no exceder 9).

## 7. Escribir y desplegar
- Escribir cada doc por **MCP Firebase** `firestore_update_document` con `updateMask` SOLO de los
  campos tocados (`name`,`badge`,`description`,`featured`) → **preserva specs/imágenes/code/etc.**
  (gcloud sin cuenta + ADC sin permiso → MCP es la única vía de escritura prod, L-60/§132.)
- Verificar la cadena en 1-4 ítems (spike) antes de escalar a todos (§132).
- Si tocaste código de render (badge en tarjeta): `npm run build` VERDE + **cache bump** (`public/sw.js`
  + `docs/05-ESTADO-GLOBAL.md`, §4) + commit (código vs cerebro separados) + push + **merge a main**
  (Claude lo hace, `feedback_claude_deploy_autorizado`). Datos en Firestore = en vivo, sin deploy.

## 8. Cerrar (cerebro)
ADR en `99` + fila en `00` + lección en `30` si aplica + actualizar `10`/`05`. Capturar qué se cambió.

## Anti-patterns (no hacer)
- ❌ Dejar el rótulo del laboratorio o la palabra "Natural" en nombre/descripción.
- ❌ Repetir en la descripción los specs que ya están en la ficha gemológica.
- ❌ Lujo-genérico/cliché ("obra de arte", "elegancia atemporal", "diseñados para cautivar").
- ❌ Afirmar origen colombiano (Muzo/Chivor) de gemas que NO lo son: solo la esmeralda es de
  Colombia; rubí/zafiro/diamante son importados — narrarlos con honestidad, sin sugerir colombianidad.
- ❌ Inventar precios/claims. Sin precio → respetar `priceLabel`. Datos exactos (`feedback_precision_no_asumir`).
- ❌ Sobrescribir contenido del dueño sin saber si es real (límite de guardián): ante duda, preguntar.
