# ⚡ 10 — MEMORIA A CORTO PLAZO (WIP / Sprint activo)

> **Nodo: Memoria a Corto Plazo** (auto-carga con `CLAUDE.md` + `05`). Solo lo VIVO: foco, pendientes
> (TODO-NN = ledger único), bitácora efímera. Estado técnico → `05`.
> **Pizarra, no archivo**: al cerrar tarea → ADR en `99` + fila en `00`, lecciones a `30`, podar (GC §G.4).

---

## 🎯 Foco actual

> 🎉 **CRM + Fase M EN PROD** (§47-§82). ⚙️ **OPUS 4.8 interino** (marcar `[OPUS-4.8]` · `feedback_opus_interino`).
>
> **▶️ SESIÓN (2026-06-27 · tarde) — §136 + §137**: cerradas las 2 anotaciones de §135 + repaso de SIGNIFICADO.
> **TODO-53/54 ✅ (§136)** (auditoría copy↔tipo + campo origen; cierra TODO-51). Luego **§137**: Daniel pidió la capa del SIGNIFICADO ("cada joya tiene una historia") → principio grabado en skill `catalogo-voz-bersaglio §3` + **las 32 reescritas con Gemini** (significado→materia+tipo→herencia), verificadas (coherencia-tipo §136 intacta + origen honesto) y **EN VIVO** (Firestore). Catálogo = **3 capas** (tipo+cálido+significado). ⚠️ Auto-crítica: cierres uniformes "heredar/legado" — variar a futuro si se desea. ⚠️ Prerender SSG (SEO) hornea las 32 en el próximo deploy de `main`.
> **🔜 Próximo**: **TODO-47** (verdad de marca con Kary, legal = + urgente) · operativo Daniel (precios + fotos). Backlog TODO-48..51. Cola: F2 Wompi · TODO-41/39/37/33/35.
> _**MCP Firebase = escritura prod**. merge a main = Claude. Gemini asesora, Claude implementa (`[[feedback_consejo_externo_readonly]]`). Pruebas en vivo DIFERIDAS (§130.4)._

---

## 📋 Pendientes abiertos (TODO-NN) — ledger único

| ID | Item | Estado | Bloqueo |
|---|---|---|---|
| TODO-03/04 | (Opcional, baja) headers `99` → `## NN.` (hoy por fecha) · anomalías 🔧 en `skills/` (formatos no-skill) | 🔲 | baja |
| TODO-07 | **Contenido real web**: reseñas Google Maps (Nosotros), Films, feed Redes (`js/data/home-media.js`, `js/pages/nosotros.js`) | 🔲 | cliente entrega datos |
| TODO-08 | **Hardening Fase 2**: Tier A ✅; pend. CSP/reglas/claims (Tier B/C) → `41-SEGURIDAD §1.5` | 🟡 | Tier B = emulador+deploy gated |
| TODO-09 | **Fase M** M0→M6 ✅ EN PROD (§78-§80); ACUERDOS R1-R5+A8 GATEADOS/inertes — encender=Daniel. Restan: M7·M2c·ASESOR/RBAC (TODO-19). | 🟡 | encender R6 (Daniel) |
| TODO-14 | **App Check: MONITOREO; Enforce DIFERIDO** (Daniel 2026-06-23: sin flujo alto el monitoreo no es representativo → activar SOLO con tráfico alto). Registro reparado (§58). | ⏸️ | esperar flujo alto |
| TODO-17 | **Toda captura → CRM**: contacto→Bandeja ✅; falta newsletter (`addSubscription`→`subscriptions`) | 🔲 | tras App Check |
| TODO-18 | **Plan operación integral §57**: semana 1 + 9 decisiones de Daniel + compuerta de adopción + campaña cartera → bóveda | 🟡 | Daniel (decisiones 1-9) |
| TODO-33 | **Panel admin "tipo app" (fluidez)** (Decisión Fuerte). DISEÑADO (comité ×4+Gemini, `50 §5`). A3 menú ✅ + VT ✅ (v29); pend. esqueletos/prefetch/self-host fonts/VT-al-final. Router falso-SPA CONGELADO salvo gate seguridad + IoC. PAUSADO. | 🟡 | reanudar tras demo |
| TODO-21 | **Revisión post-Fable de `[OPUS-4.8]`** (H-08): por riesgo (dinero §81 > seguridad §65/§66 > CMS > docs); ~50 commits | 🔲 | Fable vuelve |
| TODO-22 | **Gate-de-git en el linter** (H-06): que `brain:check` warne si el estado de deploy declarado diverge de git. Toca kernel ×3 → **cars-operador** (L-31). *§114: mitigado en parte al dejar de fijar el hash en `05`.* | 🔲 | cars-operador (kernel) |
| TODO-23 | **Frase canónica del gate de verificación de DINERO** (H-18): Claude experto = gate; Kary = smoke POST-deploy no bloqueante. Aporte a la pasada Gemini (cars consolida) | 🔲 | Gemini |
| TODO-28 | **Correcciones web** (Daniel 2026-06-21): F1-F5 ✅ EN PROD (§93-§98). Pend.: arranque **C1** (Daniel) · responsive fino device-driven. | 🟡 | C1 + responsive |
| TODO-29 | **Kernel lea `### L-NN` de `3*-LECCIONES*.md`** (no solo `30`) → shard REAL de lecciones sin stub en `30` (hoy workaround M-06). Cambio de kernel = cars-operador (L-31). | 🔲 | cars-operador (kernel) |
| TODO-35 | **Visibilidad SITE-WIDE** (SEO·AEO·GA4·GSC·Maps·SSG) **🟢 EN PROD ✅** (PR#345). **Falta**: A2b por-cat + eventos `generate_lead`/`contact` + consolidar 2º flujo GA + tail §118/§119 — esperan catálogo de Kary. 🔑 Google `bersagliojewelry@gmail.com` authuser=3. ⚠️ App Check Enforce→`FIREBASE_SA_KEY`. | 🟢 | A2b · catálogo |
| TODO-39 | **B1 paso 4b — apartados/abonos** (decisión, §128.4): ¿el mostrador necesita apartar piezas (anticipo + saldo) ahora? Si sí, el saldo = CARTERA (ya existe `clientes/{id}.saldoActual` vía factura/abono) → **reusar cartera, NO** un sistema de pagos paralelo en el pedido; requiere link pedido↔cliente CRM. Fork caro de revertir (§8 spec) → preguntar a Daniel. | 🟡 | decisión Daniel |
| TODO-37 | **PLAN MAESTRO DE COMERCIO** (ACTIVO): roadmap físico+digital. SSoT → spec `2026-06-25-plan-maestro-comercio-v3`. B0/B0.5 EN PROD ✅; B1 mostrador pasos 1-6 EN PROD, paso 7 `catalogo.json` CDN DISEÑADO v3. Decisiones dueño: ADDI · Persona Jurídica. | 🟢 | ejecutar B1 |
| TODO-41 | **Facturación multi-línea** (Daniel 2026-06-26): la factura/POS debe cobrar **modificaciones/servicios** por código, no solo piezas (variación de peso/ajuste = línea aparte). Toca POS/factura. Spec `modelo-inventario §10`. | 🔲 | tras carga inventario |
| TODO-42 | **Inventario v3 — F2** (futuro, cuando se conecte el checkout web Wompi): reserva web al crear + `reservaExpira` + reaper (Cloud Scheduler) + webhook Wompi→`confirmarPago` + `forcePosOverride` con candado de pago. Diseño → `…modelo-inventario-multitipo-design.md §11.4/§12.2`. | 🔲 | checkout web Wompi |
| TODO-47 | **Verdad de marca (riesgo SIC)** — confirmar con Kary qué es REAL y retirar lo no comprobable: equipo, certificaciones, cifras/año, financiación, envíos, horario único 8-7. Detalle → §133.2(A) · `[[feedback_no_demo_en_index]]` | 🔲 | Kary |
| TODO-48 | **Reseñas reales** — conectar `reviews` (aprobadas) → Nosotros + gestión admin (las falsas ya se quitaron; 1 huérfana de prueba en `reviews`). | 🔲 | feature |
| TODO-49 | **Legal e-commerce** — consentimiento habeas data en forms + verificar privacidad/terminos (retracto). Skill `legal-colombia`. Prereq Wompi. | 🔲 | pre-Wompi |
| TODO-50 | **Catálogo de lujo** — imagen real (no certificado) + filtros gema/tipo + taxonomía canónica + badges por gema. Detalle → §133.2(B/C). | 🔲 | tras TODO-44 |
| TODO-51 | **Origen honesto de gemas** no-colombianas (rubí/zafiro/diamante; el sitio sugiere todo Muzo/Chivor). | 🔲 | con TODO-44 |
> ✅ **Cerrados recientes**: **TODO-53 copy por tipo (§136)** (auditoría verificada → 5 corregidas vía Gemini, EN VIVO) · **TODO-54 campo Origen (§136)** (no era bug: data-driven `admin-piezas.html:276`→`pieza.js:133`/`:137`; Daniel lo deja al fondo de "Especificaciones") · **TODO-52 (§135)** · **TODO-44 (§134)** · TODO-45/46 (§133) · TODO-40 + 32 piezas (§131/§132). Histórico → ADRs §88-§136 + `00`/`99`. Pend operativo Daniel: precios + imágenes IA.

---

## 🔮 Contexto estratégico
Programa "Nuevo Bersaglio": Fase 1 rediseño · Fase 2 hardening (Tier C pend.) · Fase 3 CRM ✅ · **Fase M M0→M6 ✅ EN PROD** + ACUERDOS R1-R6 gateados (charter `50-ARQUITECTURA`). Horizonte: R6 → M7 → M2c → B6 → (futuro) inventario/facturación + RBAC (TODO-19).

---

## 📝 Bitácora (efímera)

> Podada (GC) 2026-06-27. Histórico → ADR §37-§130 + bóveda. Lecciones → `30`/`31`/`32`.
>
> **Sesiones §133-§137 (2026-06-27) — VOZ DE MARCA del catálogo:** nombre/desc/badge (§134) → cálido (§135) → tipo-coherente (§136, TODO-53/54 ✅, cierra TODO-51) → SIGNIFICADO (§137). 32 piezas + 7 colecciones + 9 destacadas, vía Gemini + verif Claude, EN VIVO; 3 capas de voz. Lección Workflow: datos grandes EMBEBIDOS, no por `args`. Detalle → ADRs §133-§137 + bóveda. `[[feedback_copy_marca_profundidad]]`
> **🚦 Reglas vivas**: `arquitecto-software` SIEMPRE · Bersaglio = 100% COP (§127) · NO inventado/no-verificable (`[[feedback_no_demo_en_index]]`) · la voz solo se presta a lo verificable · pruebas en vivo SOLO al final (§130.4) · W-11/mockup en decisión-diseño · `[[feedback_workflows_acotados]]` · `[[feedback_reintentar_agentes_no_saltar_flujo]]`. Cola: TODO-47..51 · F2 Wompi · TODO-37/39/33/35.
