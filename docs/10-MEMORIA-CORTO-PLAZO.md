# ⚡ 10 — MEMORIA A CORTO PLAZO (WIP / Sprint activo)

> **Nodo: Memoria a Corto Plazo** (auto-carga con `CLAUDE.md` + `05`). Solo lo VIVO: foco, pendientes
> (TODO-NN = ledger único), bitácora efímera. Estado técnico → `05`.
> **Pizarra, no archivo**: al cerrar tarea → ADR en `99` + fila en `00`, lecciones a `30`, podar (GC §G.4).

---

## 🎯 Foco actual

> 🟣 **EL RELEVO NO OCURRIÓ: Fable agotó su cuota (Daniel 27jul) ⇒ el interinato #4 de `[OPUS-5]` SIGUE.** Foco = **F-COMPRAS (TODO-81)**: comité ×3 ✅ (→ spec §2 R1-R5) y **C0 parcial ✅** (→ spec §5). **AHORA: el consejo externo lo corre Daniel** (`2026-07-27-f-compras-PROMPT-CONSEJO-EXTERNO.md`) — es el **gate de C1** e interroga A7; luego mockup → C1.
>
> **A7 (lo único que toca código vivo)**: el guard de "no se corrige a mano" (§194) debe mirar el **ORIGEN** (`fuente:'SISTEMA'`), no el TIPO — hoy acierta por accidente y falla en cuanto un tipo tenga dos puertas, que es justo lo que trae F-COMPRAS. **⏸️ NO implementado a propósito**: se construye tras el veredicto del consejo, con test primero (zona caliente R3).
>
> **Cola pendiente del TITULAR (no la toca el interino)**: (a) **auditoría al interinato #4** — B0→B6 + §194 + este comité (patrón §158/§161); (b) los **6 P2** de B6 (spec tesorería §8); (c) 2 nits de UI del barrido Chrome (subtítulo de "Plata total" cortado · "Cuentas y bancos" con 0 cuentas deja la derecha vacía sin estado-cero, L-42).
>
> **Protocolo por sesión**: `asesor-critico-honesto` + `caza-bugs` + `auditoria-financiera`; spec COMPLETA (§0.8>§0.7>§0.6>cuerpo, sin re-decidir; TDD en el MISMO commit). Modelo lo decide Daniel (`/model`): Opus → + `opus-interino-protocolo`, marca **`[OPUS-5]`**; Fable → `[FABLE-5]`.
>
> **🧭 Roadmap** (detalle → `05`): …F-TESORERÍA ✅ → **F-COMPRAS (aquí)** → F-REPORTES → apartados → **limpieza (TODO-80)** → rompimiento → lanzamiento. _MCP Firebase=prod · push+merge a main=Claude · consejo read-only · valida en Chrome._ `[[project_comercio_pagos]]`

---

## 📋 Pendientes abiertos (TODO-NN) — ledger único

| ID | Item | Estado | Bloqueo |
|---|---|---|---|
| TODO-78 | **F-TESORERÍA** (SSoT spec `2026-07-18-f-tesoreria-DISENO.md`; legal → `42-LEGAL §7`). **B0→B6 ✅ COMPLETA EN PROD (§194)**. Restan del TITULAR: auditoría del interinato + los 6 P2 de B6 (spec §8). | 🟢 | titular |
| TODO-81 | **F-COMPRAS "Proveedores"** (SSoT spec `2026-07-27-f-compras-DISENO.md`; A1-A7 + §2 R1-R5). **§0.8 Daniel: TODAS las posibilidades abiertas** (fiado·contado·anticipo·parcial·quedar debiendo) — la UI no exige flujo. **Comité ×3 ✅** · **C0 ✅ PARCIAL** (core puro 30/30 · reglas CF-only 251/251 · índices SIN desplegar, L-22). **A7 ⏸️ a propósito**: lo interroga el consejo (no construir lo que se manda a refutar). SIGUE: **consejo externo** (prompt listo, **gate de C1**) + mockup → C1. | 🟡 | consejo (C1) |
| TODO-80 | **PURGA de datos de prueba** (Daniel 27jul): TODO el panel es PRUEBA salvo COLECCIONES y PIEZAS (incluida la cartera migrada). Panel + Firebase con runbook (v5 §8), **AL FINAL**. ⚠️ NO reparar/migrar/backfillear: es basura. `[[project_purga_datos_prueba]]` | 🔲 | al final |
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
| TODO-35 | **Visibilidad SITE-WIDE** (SSoT spec `2026-07-10-visibilidad-seo-aeo-geo-DISENO.md`; A1-A4+B2 ✅ §184-§190). Cuello: 27 págs "rastreada sin indexar" = juicio de VALOR. SIGUE: reseñas (48) · FAQ visible · A5 ⏳precios · GBP posts. 🔑 authuser=3. | 🟢 | TODO-48 / FAQ |
| TODO-68 | **PLAN ÚNICO ERP v4** (SSoT spec 2026-07-04 + §11 modelos): F1·F2.0·F2.1·caja·70·F2.2 ✅ (§172-§176) → **F2.4 apartados (TODO-39)** → 2.3 térmica → F3 inventario → carril D → F4-F6. | 🟢 | F2.4 (TODO-39) |
| TODO-39 | **Apartados (F2.4)**: SPEC Decisión Fuerte = **SSoT** (`docs/superpowers/specs/2026-07-09-f2-4-apartados-DISENO.md`): anticipo=pasivo segregado, IVA a la entrega, cancelación §7.1, RBAC cajera 20%/60d. **Pend: Daniel corre consejo externo + abogado CO → implementar.** | 🟡 | implementar |
| TODO-67 | **Normalizar fotos 0954/0994 en Storage** (§162.7): tras el fix del cruce, cada foto vive en la CARPETA del doc contrario (URLs funcionan; riesgo: borrar una pieza barre la foto de la otra). Re-subir cada foto desde el admin (2 min) o mover objetos. | 🔲 | menor |
| TODO-47 | **Verdad de marca (riesgo SIC)** → §191.7. ⚠️ cifras sin cuadrar (home vs Nosotros) + certificaciones sin verificar. Espera cifras canónicas de Kary. `[[feedback_no_demo_en_index]]` | 🔲 | Kary: cifras+certs |
| TODO-48 | **Reseñas reales en la web** — el espacio EXISTE (`nosotros.js §10`, hide-when-empty, sin fakes); 85 ★5,0 en GBP. Falta curar + poblar `reviews`. ⚠️ arista legal de republicar Google. | 🔲 | curaduría + legal |
| TODO-50 | **Catálogo de lujo** — imagen real + filtros gema/tipo + badges → §133.2(B/C). (Taxonomía=57.) | 🔲 | tras 44 |
| TODO-71 | **Endurecer gates del cerebro (cross-repo, §175)**: (a) `[[feedback_*]]` vs memoria del harness (HUECO B); (b) `ssotFacts` / dup 05↔10 (check #8 inerte, HUECO C); (c) Sonda 5 `auditoria-cerebro`. | 🔲 | cars-operador |
| TODO-57 | **Modelo GEMA** (§150-§151; SSoT spec). Fundación+form+backfill 32/32+JSON-LD ✅. **Pend**: `settings/gems`+bake · filtros (50) · live form · D.0 whitelist `badgeGem`/`gemFilterIds` en `PUBLIC_SPEC_KEYS` (`generate-pieces.mjs:676`). | 🟡 | D.0 |
> ✅ **Cerrados** (detalle → ADRs vía `00`): 03/04 (nits al tocar cada archivo) · 77 · 79 (→L-84) · 75 · 73·74·72·41·70·69 · 37/65/63/49/42/66/64/21/40/32 + 62-44. Pend Daniel: fotos IA.

---

## 📝 Bitácora (efímera)

> 2026-07-27 · **[OPUS-5] F-COMPRAS · comité ×3 (R1-R5+A7, spec §2) + C0 ✅ parcial (spec §5).** Comité INLINE, 4 expertos con tensión, sobre código verificado (`[[feedback_workflows_acotados]]`). C0: `compras-core.js` puro 30/30 · reglas CF-only (+3 ⇒ **251/251**) · 3 índices **sin desplegar** (L-22); build 4.87s + teso 15/15 + paridad 5/5 = cero regresión. Al implementar se renombró `documentos`→`comprasDocumentos` (un collection-group genérico habría barrido subcolecciones ajenas en C4). **Dudas declaradas**: (a) **A7 NO se implementó a propósito** (Daniel) — el consejo lo interroga en su pregunta C; toca la costura que §194 acaba de estabilizar ⇒ cuando se haga, test primero + auditoría prioritaria del titular; (b) la deuda A2 (1 transferencia que paga 3 facturas = 3 pagos ⇒ 3 líneas vs 1 del extracto) se ACEPTA en v1 y está ESCRITA, no descubierta después; (c) el comité NO sustituye al consejo: C1 sigue gateado.
> 2026-07-27 · **[OPUS-5] B6 CERRADO — F-TESORERÍA completa** (detalle → **§194** + **L-86**; dudas y nits de Chrome ya recogidos arriba en el Foco).
> 2026-07-25 · **[FABLE-5 · líder de pautas]** Meta Business de Bersaglio CONFIGURADO (portfolio renombrado, socio Altorra con acceso, mapa de cuentas y saldos). Detalle + pendientes de Daniel/Kary → **`44-PAUTA-META`** (lóbulo nuevo).
> _(B5 consolidado: su detalle vive en spec §9 + §194; entradas del 25jul podadas por GC.)_
> **Pend Daniel/no-gate**: llenar "Datos del negocio" en el panel (§192 I-03; datos = identidad LEGAL-08) · marcar 7 avisos test-era en Salud (I-04) · consejo+abogado apartados (39) · instructivo Kary · push A.6 · fotos (67). ADC gcloud caducado (CLI OK). **Precios = paso FINAL.**
