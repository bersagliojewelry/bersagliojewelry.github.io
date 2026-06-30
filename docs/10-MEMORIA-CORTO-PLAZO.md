# ⚡ 10 — MEMORIA A CORTO PLAZO (WIP / Sprint activo)

> **Nodo: Memoria a Corto Plazo** (auto-carga con `CLAUDE.md` + `05`). Solo lo VIVO: foco, pendientes
> (TODO-NN = ledger único), bitácora efímera. Estado técnico → `05`.
> **Pizarra, no archivo**: al cerrar tarea → ADR en `99` + fila en `00`, lecciones a `30`, podar (GC §G.4).

---

## 🎯 Foco actual

> 🎉 **CRM + Fase M EN PROD** (§47-§82). ⚙️ **OPUS 4.8 interino** (marcar `[OPUS-4.8]` · `feedback_opus_interino`).
>
> **🔨 WOMPI F2 — la web cobra sola (Decisión Fuerte·DINERO·TODO-42).** SSoT diseño+veredicto → `…/specs/2026-06-28-wompi-checkout-web-design.md` (§11.4=plan 2a; crudo=`…-comite-wompi-checkout-CRUDO.md`). Alcance: "Comprar ahora" 1 pieza · sandbox · solo TARJETA. `[[project_comercio_pagos]]`
> · **GATE LIVE PASADO ✅ (§147)**: e2e real sandbox (Widget→`4242`→`pagado` por webhook). **2c pend** (legal+llaves prod+App Check+flag). Detalle → TODO-42 / §147 / L-54.
> _MCP Firebase=escritura prod · merge a main=Claude · Gemini asesora/Claude implementa (`[[feedback_consejo_externo_readonly]]`) · pruebas vivo DIFERIDAS (§130.4)._

---

## 📋 Pendientes abiertos (TODO-NN) — ledger único

| ID | Item | Estado | Bloqueo |
|---|---|---|---|
| TODO-03/04 | (baja) headers `99`→`## NN.` · anomalías 🔧 en `skills/` | 🔲 | baja |
| TODO-07 | **Contenido real web**: reseñas Google Maps (Nosotros), Films, feed Redes (`js/data/home-media.js`, `js/pages/nosotros.js`) | 🔲 | cliente entrega datos |
| TODO-08 | **Hardening Fase 2**: Tier A ✅; pend. CSP/reglas/claims (Tier B/C) → `41-SEGURIDAD §1.5` | 🟡 | Tier B = emulador+deploy gated |
| TODO-09 | **Fase M** M0→M6 ✅ EN PROD (§78-§80); ACUERDOS R1-R5+A8 GATEADOS/inertes — encender=Daniel. Restan: M7·M2c·ASESOR/RBAC (TODO-19). | 🟡 | encender R6 (Daniel) |
| TODO-14 | **App Check: MONITOREO; Enforce DIFERIDO** (Daniel 2026-06-23: sin flujo alto el monitoreo no es representativo → activar SOLO con tráfico alto). Registro reparado (§58). | ⏸️ | esperar flujo alto |
| TODO-17 | **Toda captura → CRM**: contacto→Bandeja ✅; falta newsletter (`addSubscription`→`subscriptions`) | 🔲 | tras App Check |
| TODO-18 | **Plan operación integral §57**: semana 1 + 9 decisiones de Daniel + compuerta de adopción + campaña cartera → bóveda | 🟡 | Daniel (decisiones 1-9) |
| TODO-33 | **Panel admin "tipo app" (fluidez)** (Decisión Fuerte). DISEÑADO (comité ×4+Gemini, `50 §5`). A3 menú ✅ + VT ✅ (v29); pend. esqueletos/prefetch/self-host fonts/VT-al-final. Router falso-SPA CONGELADO salvo gate seguridad + IoC. PAUSADO. | 🟡 | reanudar tras demo |
| TODO-21 | **Revisión post-Fable de `[OPUS-4.8]`** (H-08): por riesgo (dinero §81 > seguridad §65/§66 > CMS > docs); ~50 commits | 🔲 | Fable vuelve |
| TODO-22 | **Gate-de-git en el linter** (H-06): `brain:check` warne si el estado declarado diverge de git, AL ARRANCAR (no solo deploy) — evidencia §144.7. Kernel ×3 → cars-operador (L-31). §114 mitigado (sin hash en `05`). | 🔲 | cars-operador |
| TODO-23 | **Frase canónica del gate de verificación de DINERO** (H-18): Claude experto = gate; Kary = smoke POST-deploy no bloqueante. Aporte a la pasada Gemini (cars consolida) | 🔲 | Gemini |
| TODO-28 | **Correcciones web** F1-F5 ✅ EN PROD (§93-§98). Pend: C1 (Daniel) · responsive fino. | 🟡 | C1 |
| TODO-29 | **Kernel lea `### L-NN` de `3*-LECCIONES*`** (no solo `30`) → shard real sin stub (hoy workaround M-06). Kernel → cars-operador (L-31). | 🔲 | cars-operador |
| TODO-35 | **Visibilidad SITE-WIDE** (SEO·AEO·GA4·GSC·Maps·SSG) 🟢 EN PROD ✅. Falta: A2b por-cat + eventos `generate_lead`/`contact` + 2º flujo GA (esperan catálogo). 🔑 Google `bersagliojewelry@gmail.com` authuser=3. | 🟢 | A2b |
| TODO-39 | **B1 paso 4b — apartados/abonos** (decisión, §128.4): ¿el mostrador necesita apartar piezas (anticipo + saldo) ahora? Si sí, el saldo = CARTERA (ya existe `clientes/{id}.saldoActual` vía factura/abono) → **reusar cartera, NO** un sistema de pagos paralelo en el pedido; requiere link pedido↔cliente CRM. Fork caro de revertir (§8 spec) → preguntar a Daniel. | 🟡 | decisión Daniel |
| TODO-37 | **PLAN MAESTRO DE COMERCIO** (ACTIVO): físico+digital. SSoT → spec `plan-maestro-comercio-v3`. B0/B0.5 + B1 mostrador 1-6 EN PROD; paso 7 catalogo.json CDN diseñado. Decisiones dueño: ADDI · Persona Jurídica. | 🟢 | B1 |
| TODO-41 | **Facturación multi-línea** (Daniel 2026-06-26): la factura/POS debe cobrar **modificaciones/servicios** por código, no solo piezas (variación de peso/ajuste = línea aparte). Toca POS/factura. Spec `modelo-inventario §10`. | 🔲 | tras carga inventario |
| TODO-42 | **Wompi F2 (cobro web)** — 2a DESPLEGADA + **GATE LIVE PASADO ✅ (§147)**: e2e real sandbox (Widget→`4242`→`pagado` por webhook); bug `wompiEligible` arreglado (L-54). **Falta 2c**: legal (TODO-49)+llaves prod (Kary)+App Check+quitar precios temp+flag Pages. SSoT → spec wompi-checkout-web-design. | 🟢 | 2c (legal+llaves prod) |
| TODO-47 | **Verdad de marca (riesgo SIC)** — confirmar con Kary qué es REAL y retirar lo no comprobable: equipo, certificaciones, cifras/año, financiación, envíos, horario único 8-7. Detalle → §133.2(A) · `[[feedback_no_demo_en_index]]` | 🔲 | Kary |
| TODO-48 | **Reseñas reales** — conectar `reviews` (aprobadas) → Nosotros + gestión admin (las falsas ya se quitaron; 1 huérfana de prueba en `reviews`). | 🔲 | feature |
| TODO-49 | **Legal e-commerce** (prereq Wompi 2c) — AUDITADO 2026-06-30 (skill `legal-colombia`, LEGAL-01 ✅ → `42-LEGAL §4`). Privacidad sólida ✅ + checkbox Habeas Data en checkout ✅ + cookies rechazo real ✅. **Falta redactar (LEGAL-07, Decisión Fuerte→Comité×3+consejo+disclaimer abogado)**: reescribir Términos §03 (web SÍ cobra), retracto Art.47 (5 días+reembolso, excepto a-medida), reversión Art.51, NIT+enlace SIC, aviso vendedor≠cobrador. **Bloqueado por datos de Kary (LEGAL-08)**: NIT/razón social + titular cuenta Wompi. | 🟡 | datos Kary + redacción |
| TODO-50 | **Catálogo de lujo** — imagen real + filtros gema/tipo + badges. Detalle → §133.2(B/C). (Taxonomía=TODO-57.) | 🔲 | tras TODO-44 |
| TODO-57 | **Modelo de datos de la GEMA** (Decisión Fuerte §150 + consejo §151, modelo PLANO `badgeGem`/`gemFilterIds`). **HECHO**: fundación (`gem-taxonomy.js`+`gem-badge.js`, test 7/7) + **form admin** (select "Gema principal"+filtros+rename stone; escribe `specs.badgeGem`/`gemFilterIds`; reglas OK `specs is map`; SW v54/APP v31). **backfill 32 — APLICADO+VERIFICADO ✅ (2026-06-29, gate Daniel)**: 32/32 en prod con `badgeGem`+`gemFilterIds` (14 esm·9 rubí·5 diam·4 zaf; merge field-path MCP → resto de `specs`/`_version` intactos; respaldo scratchpad). Regex fallback se mantiene (red de seguridad). **JSON-LD canónico HECHO ✅** (gemDisplayName→SSG+ficha; test 9/9; build verifica `Gema:"Esmeralda"`; sin cache bump = chunk hasheado). **Pend**: `settings/gems`+bake catalogo.json · filtros TODO-50+índice array-contains · live form. SSoT → spec. | 🟡 | settings/gems · filtros |
> ✅ **Cerrados**: **TODO-62 (pinch-zoom iOS — §156.18 DESPLEGADO; Daniel CONFIRMÓ en su iPhone 2026-06-30: ya no aparece la pantalla de error → L-62)** · **TODO-61 (§156 rediseño primera cara + acceso "Asesoría privada" — §156.1-16, DESPLEGADO; dead code del buscador ya limpiado en §156.10)** · TODO-60 (§155 buscador unificado) · TODO-58 (§154) · TODO-59 (§153) · TODO-56/55/51/52/53/54/44/45/46 · TODO-40+32 → ADRs/`99`. Pend Daniel: precios + fotos IA.

---

## 🔮 Contexto estratégico
Programa "Nuevo Bersaglio": Fase 1 rediseño ✅ · Fase 2 hardening (Tier C pend.) · Fase 3 CRM ✅ · Fase M M0→M6 ✅ EN PROD (R1-R6 gateados). Horizonte: **Wompi F2** → R6/M7 → inventario/facturación + RBAC. Charter → `50-ARQUITECTURA`.

---

## 📝 Bitácora (efímera)

> Podada (GC) 2026-06-27. Histórico → ADR §37-§130 + bóveda. Lecciones → `30`/`31`/`32`.
>
> **2026-06-30 (§156.19 — cookies ↔ FAB asesoría, DESPLEGADO):** Daniel confirmó OK el pinch-zoom (§156.18 ✅) y reportó: el aviso de cookies queda DEBAJO del botón "Asesoría privada" y no deja tocar "Aceptar". RCA: dos `fixed` abajo-derecha se pisaban (banner z-90 vs FAB z-200 → el FAB tapaba "Aceptar" en móvil). Fix: banner z-210 + el FAB cede mientras el banner está presente (bandera `body.bj-cookie-active` desde `cookie-banner.js`). Verificado e2e en navegador real (especificidad + flujo aceptar). Cache v58; build+brain verdes. → ADR §156.19 / L-63.
> _(§156.1–.18 podadas — consolidadas en ADR §156.x. TODO futuro vivo: botón "Hablar con el Atelier" en la ficha, bajo el precio — ADR §156.12.)_
> **🚦 Reglas vivas**: arquitecto SIEMPRE · 100% COP (§127) · NO inventado (`[[feedback_no_demo_en_index]]`) · pruebas vivo solo al final (§130.4) · W-11 en decisión-diseño · `[[feedback_workflows_acotados]]`.
