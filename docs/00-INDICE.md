# 00 — ÍNDICE SINÁPTICO (mapa § → línea del Historial ADR)

> **Nodo neuronal: Índice sináptico.** Mapa § → línea de
> `docs/99-HISTORIAL-ADR.md`. Es la tabla de contenidos del
> nodo de Largo Plazo. Se consulta on-demand (Trigger de Error/Historia, ver
> `CLAUDE.md §G`).
>
> **Mapa de neuronas** (detalle de cada una → `CLAUDE.md §0`): `CLAUDE.md` · `05-ESTADO-GLOBAL` · `10-MEMORIA-CORTO-PLAZO` · `15-CONSEJO-EXTERNO` · `20-MEMORIA-ESPACIAL` · `30-LECCIONES` · `31-LECCIONES-FIRESTORE` (hija de 30) · `32-LECCIONES-CARGA` (hija de 30) · `40-LOBULOS-DOMINIO` · `50-ARQUITECTURA` · `60-WORKFLOWS` · este `00-INDICE` (+ hija `00a-INDICE-HIST`, §1–§115) · `99-HISTORIAL-ADR` · `skills-inventory`.
>
> **Cómo usarlo (regla anti-saturación)**: busca aquí el § + su línea → `Read docs/99-HISTORIAL-ADR.md offset=<línea> limit=~150`. NUNCA leas el historial completo (satura al instante). Regenera el mapa: `grep -n "^## " docs/99-HISTORIAL-ADR.md` (o `Select-String`).

---

## 🧭 Enrutamiento semántico (síntoma/tema → neurona) — CONSULTA ESTO PRIMERO

| Tu situación / síntoma | Ve a |
|---|---|
| ¿Dónde vive un módulo / ruta / flujo / componente? | 🗺️ `20-ESPACIAL` |
| Hallazgos/presentación para Kary (histórico Kardex→plataforma) / pendientes viejos | bóveda privada → stub `docs/PENDIENTES-Y-HALLAZGOS.md` (los VIVOS = tabla TODO del `10`) |
| Voy a mover/renombrar archivos, refactor de estructura | 🧪 `30-LECCIONES` + 🗺️ `20-ESPACIAL` |
| Conflicto al fusionar / cache / service worker | 🧪 `30-LECCIONES` L-02 + `CLAUDE.md §4` |
| Errores conocidos y gotchas de estilo (CSS modular por página) | 🧪 `30-LECCIONES` |
| ¿Qué hay pendiente? estado del sprint | ⚡ `10-CORTO-PLAZO` (TODOs) |
| ¿Cómo/dónde se calcula la mora / aging / cartera vencida / a quién cobrar? | `js/crm-estado-cuenta.js` (helper PURO `estadoCuenta`, FIFO en vivo) + ADR §51 |
| 🔵 Audita SEGURIDAD / Firebase rules | 🎯 `40-LOBULOS-DOMINIO` → 41-SEGURIDAD (on-demand) |
| 🔵 Audita UX / interfaz / componentes | 🎯 `40-LOBULOS-DOMINIO` → 43-UX |
| 🔵 Audita PERFORMANCE / LCP / Vite | 🎯 `40-LOBULOS-DOMINIO` → 45-PERFORMANCE |
| 🔵 Audita ACCESIBILIDAD / skip-link / focus | 🎯 `40-LOBULOS-DOMINIO` → 48-ACCESIBILIDAD + Skill `accessibility-audit` |
| ⚖️ Algo LEGAL: términos, privacidad, datos personales, retracto, garantía, cookies, RUCOM, IVA, lavado de activos | 🎯 `40-LOBULOS` → `42-LEGAL` + Skill `legal-colombia` (NUNCA plugins legales extranjeros) |
| 🔁 Voy a revisar/auditar/verificar algo de forma sistemática (reglas, diseño, lo que dejó un subagente, si algo cumple) | 🔁 `docs/60-WORKFLOWS.md` (catálogo de workflows de detección reutilizables) |
| 🐛 Voy a TOCAR o ROZAR un subsistema (render/CRUD/flujo/estado compartido) y quiero no dejar escapar un bug | 🔁 `60-WORKFLOWS` **W-10** (camino vivo desde estado-cero + escalada) + skill `caza-bugs` |
| 🛰️ Decisión fuerte / cara de revertir / fork 50-50 → ¿2ª opinión? | 🛰️ `docs/15-CONSEJO-EXTERNO.md` (cuándo + qué tier del provider externo §0) |
| 🏛️ Decisión de arquitectura / diseño o escalado del CRM / límites de módulo / "cero monolitos" | 🏛️ `docs/50-ARQUITECTURA.md` |
| 🛠️ ¿Qué skill tengo para X? / mapa de skills | 🛠️ `docs/skills-inventory.md` + 🎯 `40-LOBULOS §Recursos Externos` |
| 🌱 Crear / sugerir una SKILL nueva (capacidad portable) | 🎯 `40-LOBULOS-DOMINIO` §Reflejo de Sugerencia de Skills + Skill `skill-creator` |
| El "por qué" de una decisión / detalle de un § | tabla "§ → línea" abajo → 📚 `99-HISTORIAL` |

---

## Mapa § → línea (§116+ · histórico §1–§115 → `00a-INDICE-HIST.md`)

> **§1–§115** (eras V7 · CRM Fase 3 · Fase M-acuerdos · CMS · carga app-like) viven en el
> shard histórico **`docs/00a-INDICE-HIST.md`** (range-shard §G.5, ADR §140). Aquí abajo solo **§116+**.

| § | Tema | Línea |
|---|---|---|
| §116 | 2026-06-25 — **Programa de Visibilidad (TODO-35) EN PROD**: SSG + marca/Maps + GA4 encendido + Consent v2; GA/GSC config. [OPUS-4.8] | 1715 |
| §117 | 2026-06-25 — **Storage abre rol catálogo** (URGENTE): mirror `isCatalogo()` en `storage.rules`. LECCIÓN: rol = reflejar en TODO el contrato. `e300ff2`. [OPUS-4.8] | 1727 |
| §118 | 2026-06-25 — **Ficha "Carta Gemológica" + fixes demo (TODO-34) EN PROD**: buildSpecs agrupado, cero-demo, URLs limpias `pieceUrl`. v32. PR #356/#357. [OPUS-4.8] | 1739 |
| §119 | 2026-06-25 — **Grilla Flexbox + recos por contenido + GA4 (TODO-36) EN PROD** (W-11): balancedCols, título honesto, select_item arreglado. v33. PR #357/#358. [OPUS-4.8] | 1751 |
| §120 | 2026-06-25 — **Plan Comercio B0+B0.5 — WhatsApp directo (TODO-37) EN PROD** (PR #359): CTAs ficha → WhatsApp con la pieza escrita (`waLink`) + GA4 `whatsapp_click`; form = vía 2ª. v34. [OPUS-4.8] | 1763 |
| §121 | 2026-06-26 — **Catálogo de prueba EN PROD + decisiones del dueño**: 9 piezas prueba (`seedDemo:true`) vía Firebase MCP, verificadas en vivo. DECISIONES (no re-preguntar): pruebas en web real (excepción no-demo) · Wompi=cuenta Kary Persona Natural (NO PJ; aumento a 20 tx) · ADDI congelado. [OPUS-4.8] | 1775 |
| §122 | 2026-06-26 — **B1 paso 1: inventario en `pieces` EN PROD**: `stockType`/`cantidad`/`gender` vía `pieceClassValid` (type+enum); `estado`/`reserva*` diferidos al CF (seguridad). Reglas desplegadas · 201 tests. [OPUS-4.8] | 1787 |
| §123 | 2026-06-26 — **3 correcciones de Daniel**: form flotante en ficha (lead sin navegar) + 9 destacadas (guard máx 9) + canales debajo del form en contacto. v35. Gotcha dev: carrera `data.load`↔`onChange` (L-58). [OPUS-4.8] | 1799 |
| §124 | 2026-06-26 — **B1 paso 2: calculadora de precio por peso**: valor-gramo = INPUT de Kary (varía) → cotización client-side (`calcularPrecio` puro + modal). Recompute server-side → paso 3. 6 tests. v36. [OPUS-4.8] | 1810 |
| §125 | 2026-06-26 — **B1 paso 3 (backend): `crearPedido` CF + candado de stock atómico**: único escritor de `pedidos`; `runTransaction` sobre la pieza = imposible doble venta; total server-side; snapshot inmutable; idempotente. Reglas (`pieceStockLocked` CF-only + pedidos create:false) DESPLEGADAS · 206 rules + 6 integr. Núcleo `pedidos-core.js`. [OPUS-4.8] | 1821 |
| §126 | 2026-06-26 — **B1 paso 3 (UI): POS "Mostrador"** (`admin-pos.html`+`pos.js`+`pedidos-service.js`): Kary elige pieza → precio fijo o por peso → medio → `crearPedido`. UI espeja la CF; menú `role:catalogo`; idempotente (UUID). **CF DESPLEGADA**; build+6/6 verdes. v37. Caveat price USD/COP→TODO-38. [OPUS-4.8] | 1832 |
| §127 | 2026-06-26 — **Todo en COP (cero dólares)**: el cobro siempre fue en pesos (`format$`+CF+POS); solo el RÓTULO del form decía "Precio USD" → "Precio en pesos (COP)". Bersaglio = 100% COP. Cierra TODO-38. v38. [OPUS-4.8] | 1844 |
| §128 | 2026-06-26 — **B1 paso 4a: confirmar pago ("vi la plata")**: CF `confirmarPago` (núcleo testeable) `por_verificar`→`pagado`; idempotente; solo la CF flipea (SoD). Botón en POS. 9/9 integr.; DESPLEGADA. v39. PEND 4b apartados→cartera (TODO-39). [OPUS-4.8] | 1853 |
| §129 | 2026-06-26 — **B1 paso 5: anular venta (VOID) + cierre de caja (arqueo Z)**: `anularPedido` (anulado append-only + REINTEGRA pieza→disponible; idempotente) + `cierreCaja` (conteo a ciegas → descuadre; anulados excluidos; `arqueo` CF-only). UI: 3 estados + Anular + Cerrar caja. 15/15 + 207 reglas; DESPLEGADO. v40. [OPUS-4.8] | 1863 |
| §130 | 2026-06-26 — **B1 paso 6: bruto/neto + export contador**: CSV (bruto·comisión·retenciones·neto); `calcularNeto` puro, tasas param-driven. 5/5 tests. v41. [OPUS-4.8] | 1874 |
| §131 | 2026-06-27 — **Inventario v3 (TODO-40 F1) DESPLEGADO**: B4 admin (enum3+visibilidad+cantidad CF-only) + B5 SSG/cliente + B6; reglas v3 + functions DESPLEGADAS (Daniel #378/#379). 213/213 reglas. L-59. [OPUS-4.8] | 1884 |
| §132 | 2026-06-27 — **Carga masiva: 32 piezas reales (TrueLab)**: QR→scrape SPA (Chrome MCP)→clasif. por foto→carga MCP. Código=Nº reporte, Oro 18k, imágenes del cert. 32/32 EN VIVO. L-60. [OPUS-4.8] | 1895 |
| §133 | 2026-06-27 — **Eval integral de marca**: comité 5 lentes → arreglos seguros (reseñas · footer · slug = TODO-45 ✅) + backlog TODO-47-51 (SIC). v42. [OPUS-4.8] | 1906 |
| §134 | 2026-06-27 — **Voz de marca catálogo** (TODO-44 ✅): 32 piezas (nombre/desc/badge) + 9 destacadas + 7 colecciones + skill `catalogo-voz-bersaglio`. Badge en tarjeta, v43. [OPUS-4.8] | 1918 |
| §135 | 2026-06-27 — **Copy DEFINITIVO 32** (Gemini, verif): descripciones cálidas + nombres a 2 palabras + Topos→Aretes. TODO-52 ✅. [OPUS-4.8] | 1932 |
| §136 | 2026-06-27 — **Auditoría copy↔tipo 32** (TODO-53/54 ✅): 27/32 coherente; 5 corregidas vía Gemini+verif (Manantial Secreto cadena→dije + 4 anillos); origen honesto cierra TODO-51. [OPUS-4.8] | 1943 |
| §137 | 2026-06-27 — **Repaso de SIGNIFICADO de las 32** (Daniel): principio del alma → skill `catalogo-voz §3`; las 32 reescritas (Gemini+verif: tipo §136 intacto + origen honesto), EN VIVO. 3 capas = voz Bersaglio. [OPUS-4.8] | 1955 |
| §138 | 2026-06-27 — **Ajustes web** (Daniel): 9→16 destacadas (col. de 4) + botón al final · isla solo en index (verif. live) · etiqueta `priceDisplay` SSoT (elimina "Cotización"; 32 migradas). SW v45. [OPUS-4.8] | 1967 |
| §139 | 2026-06-27 — **Refinamiento copy** (Daniel): CTA inferior → "Ver más piezas" · etiqueta tarjeta → "Consultar precio" · **ficha sin precio: sin rótulo** (Daniel: "única/certificada" no encajan); CSS muerto removido. SW v46. [OPUS-4.8] | 1979 |
| §140 | 2026-06-27 — **Range-shard del índice (00 → 00 + 00a) + kernel shard-aware** (cars-operador, TODO-32 ✅): §1–§115 → `00a-INDICE-HIST`; el kernel lee el índice como SET (`00`+`00[a-z]-INDICE*`), byte-idéntico ×4. `00` 30.8k→9.6k. [OPUS-4.8] | 1991 |
| §141 | 2026-06-27 — **Galería de ficha = carrusel** (Daniel): con >1 imagen → flechas izq/der + contador + puntos + swipe (reemplaza miniaturas; `setGalleryIdx` swap directo sin re-render). Mockup→puntos. SW v47. [OPUS-4.8] | 2003 |
| §142 | 2026-06-27 — **Fix LQIP en transparentes** (Daniel): el blur-up sangraba un fondo borroso tras fotos de producto sin fondo (`lqip.js` capa detrás + `imageLqip` stale por desalineo en `openEdit`). Desactivado blur-up en 4 contextos de producto (`lqipBgStyle(img,'')`); editorial lo conserva. SW v48. [OPUS-4.8] | 2015 |

> Mantener este índice sincronizado: cuando se agregue un ADR §57+ al historial,
> añadir su fila aquí con la línea de inicio (`Select-String` o `grep`).
