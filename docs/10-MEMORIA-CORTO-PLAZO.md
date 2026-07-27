# ⚡ 10 — MEMORIA A CORTO PLAZO (WIP / Sprint activo)

> **Nodo: Memoria a Corto Plazo** (auto-carga con `CLAUDE.md` + `05`). Solo lo VIVO: foco, pendientes
> (TODO-NN = ledger único), bitácora efímera. Estado técnico → `05`.
> **Pizarra, no archivo**: al cerrar tarea → ADR en `99` + fila en `00`, lecciones a `30`, podar (GC §G.4).

---

## 🎯 Foco actual

> 🟣 **RELEVO AL TITULAR (Daniel 27jul: la sesión nueva es con FABLE).** Arranca en el **comité ×3 de F-COMPRAS (TODO-81)** sobre las preguntas **P1-P5** de su spec — la spec ya trae las decisiones A1-A6 cerradas y la directiva §0.8 del dueño; **no re-decidir el cuerpo, refutar P1-P5**. La cara: **P1 = cómo se paga en EFECTIVO a un proveedor**, que choca con V18 (el efectivo entra y sale SIEMPRE por la bóveda) ⇒ zona caliente R3.
>
> **Cola de Fable, además del comité**: (a) **auditoría del titular al interinato #4** (B0→B6 de F-TESORERÍA, §194 incluido — Fable audita al volver, patrón §158/§161); (b) los **6 P2** de B6 (spec tesorería §8) son juicio suyo, NO se tocaron; (c) los 2 nits de UI del barrido Chrome (subtítulo de "Plata total" cortado · "Cuentas y bancos" con 0 cuentas deja la derecha vacía sin estado-cero, L-42).
>
> **F-TESORERÍA (TODO-78) COMPLETA: B0→B6 ✅ EN PROD** (§194). B6 = rompimiento adversarial de los 4 libros: **P0** — V1/V18 dieron un TERCER libro al traslado de bóveda y DESHACER se quedó con dos ⇒ reversar una consignación **inventaba** plata en la consolidada; invisible para el cuadre 3:30 y sin cobertura. **P1 acoplado** — corregir a mano una pata restaba dos veces. Ambos con test-primero (teso 31→38), desplegados. 5 áreas SANAS declaradas. Doctrina → **L-86**. ⚠️ El E2E vivo de D9/V1 espera la 1ª cuenta REAL de Kary (V21); lo sostienen 38 tests.
>
> **Protocolo por sesión**: `asesor-critico-honesto` + `caza-bugs` + `auditoria-financiera`; spec COMPLETA (§0.8>§0.7>§0.6>cuerpo, sin re-decidir; TDD en el MISMO commit). Modelo lo decide Daniel (`/model`): Opus → + `opus-interino-protocolo`, marca **`[OPUS-5]`**; Fable → `[FABLE-5]`.
>
> **🧭 Roadmap** (detalle → `05`): …F-IA-2 ✅ → F-TESORERÍA ✅ → **F-COMPRAS (aquí)** → F-REPORTES → apartados → **limpieza (TODO-80)** → rompimiento → lanzamiento. _MCP Firebase=prod · push+merge a main=Claude · consejo read-only · valida en Chrome._ `[[project_comercio_pagos]]`

---

## 📋 Pendientes abiertos (TODO-NN) — ledger único

| ID | Item | Estado | Bloqueo |
|---|---|---|---|
| TODO-78 | **F-TESORERÍA** (SSoT spec `2026-07-18-f-tesoreria-DISENO.md`, prevalencia §0.8>§0.7>§0.6>cuerpo; legal Daniel → `42-LEGAL §7`). **B0→B6 ✅ COMPLETA EN PROD (§194)** · SIGUE: **auditoría del titular** (§4-protocolo) → luego F-COMPRAS. 6 P2 de B6 en la cola (spec §8). | 🟢 | titular |
| TODO-81 | **F-COMPRAS "Proveedores"** (SSoT spec `2026-07-27-f-compras-DISENO.md` = BORRADOR; decisiones A1-A6 y preguntas P1-P5 allí). **§0.8 Daniel: TODAS las posibilidades abiertas** (fiado·contado·anticipo·parcial·quedar debiendo) — la UI no exige flujo. SIGUE: **comité ×3 sobre P1-P5** (P1 = pago en EFECTIVO, choca con V18) + consejo + mockup → C0-C5. | 🟡 | comité ×3 |
| TODO-80 | **PURGA de datos de prueba** (Daniel 27jul): **TODO el panel es PRUEBA salvo COLECCIONES y PIEZAS** (incluida la cartera migrada — cierra la decisión del v5 §8). Panel + Firebase, con runbook (base → v5 §8), **AL FINAL**. ⚠️ **NO reparar/migrar/backfillear**: basura. `[[project_purga_datos_prueba]]` | 🔲 | al final |
| TODO-07 | **Contenido real web**: reseñas Maps (Nosotros), Films, feed Redes (`home-media.js`). | 🔲 | cliente entrega datos |
| TODO-08 | **Hardening Fase 2**: Tier A ✅; pend. CSP/reglas/claims (Tier B/C) → `41-SEGURIDAD §1.5` | 🟡 | Tier B = emulador+deploy gated |
| TODO-09 | **Fase M** M0→M6 ✅ EN PROD (§78-§80); ACUERDOS R1-R5+A8 GATEADOS/inertes — encender=Daniel. Restan: M7·M2c·ASESOR/RBAC (19). | 🟡 | encender R6 |
| TODO-14 | **App Check: MONITOREO; Enforce DIFERIDO** (Daniel: sin flujo alto el monitoreo no es representativo → activar SOLO con tráfico alto). Reparado §58. | ⏸️ | flujo alto |
| TODO-17 | **Toda captura → CRM**: contacto ✅; falta newsletter. ⚠️ **§189**: el email solo vive en `localStorage` ⇒ **el lead se PIERDE** (el evento `bj:email-subscribed` ya lo trae). | 🔲 | tras App Check |
| TODO-18 | **Plan operación integral §57**: semana 1 + 9 decisiones de Daniel + compuerta de adopción + campaña cartera → bóveda | 🟡 | Daniel (dec. 1-9) |
| TODO-33 | **Panel admin "tipo app"** (`50 §5`): A3 ✅; pend. esqueletos/prefetch/fonts; router SPA CONGELADO. PAUSADO. | 🟡 | tras demo |
| TODO-22/29 | Kernel → cars-operador (L-31): gate-de-git en linter (H-06) · kernel lea `### L-NN` de `3*-LECCIONES*` (hoy M-06). | 🔲 | cars-operador |
| TODO-23 | **Frase canónica del gate de DINERO** (H-18): Claude=gate experto; Kary=smoke no bloqueante. → Gemini. | 🔲 | Gemini |
| TODO-28 | **Correcciones web** F1-F5 ✅ EN PROD (§93-§98). Pend: C1 (Daniel) · responsive fino. | 🟡 | C1 |
| TODO-35 | **Visibilidad SITE-WIDE** (SSoT spec `2026-07-10-visibilidad-seo-aeo-geo-DISENO.md`). A1·A2·A3·A4·B2 ✅ (§184-§190). Cuello: 27 págs "rastreada sin indexar" = juicio de VALOR. SIGUE: reseñas (48) · FAQ visible · A5 ⏳precios · GBP posts. 🔑 authuser=3. | 🟢 | TODO-48 / FAQ |
| TODO-68 | **PLAN ÚNICO ERP v4** (SSoT spec 2026-07-04 + §11 modelos): F1·F2.0·F2.1·caja·70·F2.2 ✅ (§172-§176) → **F2.4 apartados (TODO-39)** → 2.3 térmica → F3 inventario → carril D → F4-F6. | 🟢 | F2.4 (TODO-39) |
| TODO-39 | **Apartados (F2.4)**: SPEC Decisión Fuerte = **SSoT** (`docs/superpowers/specs/2026-07-09-f2-4-apartados-DISENO.md`): anticipo=pasivo segregado, IVA a la entrega, cancelación §7.1, RBAC cajera 20%/60d. **Pend: Daniel corre consejo externo + abogado CO → implementar.** | 🟡 | implementar |
| TODO-67 | **Normalizar fotos 0954/0994 en Storage** (§162.7): tras el fix del cruce, cada foto vive en la CARPETA del doc contrario (URLs funcionan; riesgo: borrar una pieza barre la foto de la otra). Re-subir cada foto desde el admin (2 min) o mover objetos. | 🔲 | menor |
| TODO-47 | **Verdad de marca (riesgo SIC)** — detalle → §191.7. **⚠️ CIFRAS SIN CUADRAR** (home 40+/5.000+ vs Nosotros 43/+12.000; defaults viejos) + certificaciones sin verificar (claims de 3os). Espera cifras canónicas de Kary. `[[feedback_no_demo_en_index]]` | 🔲 | Kary: cifras+certs |
| TODO-48 | **Reseñas reales en la web** — el espacio EXISTE (`nosotros.js §10`, hide-when-empty, sin fakes); 85 ★5,0 en GBP. Falta curar + poblar `reviews`. ⚠️ arista legal de republicar Google. | 🔲 | curaduría + legal |
| TODO-50 | **Catálogo de lujo** — imagen real + filtros gema/tipo + badges → §133.2(B/C). (Taxonomía=57.) | 🔲 | tras 44 |
| TODO-71 | **Endurecer gates del cerebro (cross-repo, §175)**: (a) `[[feedback_*]]` vs memoria del harness (HUECO B); (b) `ssotFacts` / dup 05↔10 (check #8 inerte, HUECO C); (c) Sonda 5 `auditoria-cerebro`. | 🔲 | cars-operador |
| TODO-57 | **Modelo GEMA** (§150-§151; SSoT spec). HECHO: fundación+form+backfill 32/32+JSON-LD. **Pend**: `settings/gems`+bake · filtros (TODO-50) · live form · D.0 whitelist `badgeGem`/`gemFilterIds` en `PUBLIC_SPEC_KEYS` (`generate-pieces.mjs:676`). | 🟡 | D.0 (whitelist gema) |
> ✅ **Cerrados** (detalle → ADRs vía `00`): 03/04 (nits al tocar cada archivo) · 77 · 79 (→L-84) · 75 · 73·74·72·41·70·69 · 37/65/63/49/42/66/64/21/40/32 + 62-44. Pend Daniel: fotos IA.

---

## 📝 Bitácora (efímera)

> 2026-07-27 · **[OPUS-5] B6 CERRADO — F-TESORERÍA completa** (detalle → **§194** + **L-86**). El P0 vivía en la costura que el PROPIO interinato creó en B5 (V1/V18 dieron un libro nuevo al traslado y el UNDO no lo heredó); sellar la pata destapó un P1 acoplado. Desplegado + push. **SANO con evidencia** (no por silencio): 5 áreas declaradas en §194.1-2. **Dudas declaradas**: el E2E vivo con cuenta espera la 1ª cuenta REAL de Kary (V21; lo sostienen 38 tests) · los 6 P2 NO se tocaron a propósito (juicio del titular, no fugas). Chrome holístico (Bóveda·Cuentas·Hoy): consola limpia; **2 nits** → subtítulo de "Plata total" cortado · "Cuentas y bancos" con 0 cuentas deja la derecha vacía sin estado-cero (L-42).
> 2026-07-25 · **[FABLE-5 · líder de pautas]** Meta Business de Bersaglio CONFIGURADO (portfolio renombrado, socio Altorra con acceso, mapa de cuentas y saldos). Detalle + pendientes de Daniel/Kary → **`44-PAUTA-META`** (lóbulo nuevo).
> _(B5 consolidado: su detalle vive en spec §9 + §194; entradas del 25jul podadas por GC.)_
> **Pend Daniel/no-gate**: llenar "Datos del negocio" en el panel (§192 I-03; datos = identidad LEGAL-08) · marcar 7 avisos test-era en Salud (I-04) · consejo+abogado apartados (39) · instructivo Kary · push A.6 · fotos (67). ADC gcloud caducado (CLI OK). **Precios = paso FINAL.**
