# ⚡ 10 — MEMORIA A CORTO PLAZO (WIP / Sprint activo)

> **Nodo: Memoria a Corto Plazo** (auto-carga con `CLAUDE.md` + `05`). Solo lo VIVO: foco, pendientes
> (TODO-NN = ledger único), bitácora efímera. Estado técnico → `05`.
> **Pizarra, no archivo**: al cerrar tarea → ADR en `99` + fila en `00`, lecciones a `30`, podar (GC §G.4).

---

## 🎯 Foco actual

> 🎉 **CRM + Fase M (M0→M6) EN PRODUCCIÓN** (§47-§82). **🔄 RESET A CERO** (Daniel 2026-06-20): Kary recarga de cero → cartera/clientes históricos DESECHABLES (bajan urgencias de dinero). ⚙️ **OPUS 4.8 interino** (marcar `[OPUS-4.8]` · `feedback_opus_interino`).
>
> **🚦 Frentes abiertos:** **TODO-36** (grilla inteligente + recos + medición + dock-7 + traductor de errores del panel — **IMPLEMENTADO+VERIFICADO** build/tests/CSS-live; **pend. MERGE Daniel** + validación con datos + BigQuery + ADR) · **TODO-33** (parpadeo residual del menú) · **TODO-35** cola (A2b/eventos/HUB). _Previo cerrado: **§117 Storage rol catálogo EN PROD** (subida Kary, auditoría permisos 4 capas ✅) · §115 rol catálogo ✅ · TODO-34 ficha pieza (pend. merge)._
> - ⚠️ **Deploy** (L-22/L-26): reglas/functions = manual mío; sitio+merge a `main` = PR de Daniel (`git fetch` siempre); Admin SDK = ADC.

---

## 📋 Pendientes abiertos (TODO-NN) — ledger único

| ID | Item | Estado | Bloqueo |
|---|---|---|---|
| TODO-03 | (Opcional) headers de `99` a formato numerado `## NN.` (hoy por fecha, válido) | 🔲 | baja |
| TODO-04 | (Opcional) anomalías 🔧 en `skills/` (formatos no-skill) | 🔲 | baja |
| TODO-07 | **Contenido real web**: reseñas Google Maps (Nosotros), Films, feed Redes (`js/data/home-media.js`, `js/pages/nosotros.js`) | 🔲 | cliente entrega datos |
| TODO-08 | **Hardening Fase 2**: Tier A ✅; pend. CSP/reglas/claims (Tier B/C) → `41-SEGURIDAD §1.5` | 🟡 | Tier B = emulador+deploy gated |
| TODO-09 | **Fase M**: M0→M6 ✅ EN PROD (§78-§80; 1er corte 1-jul); ACUERDOS R1-R5 (§81)+A8 (§87) GATEADOS/inertes — **encender = Daniel** (deploy+bandera+prueba; baja urgencia por reset). Restan: M7·M2c·ASESOR/RBAC (TODO-19). Kary prueba al final; verif. POR HITO = experta de Claude | 🟡 | encender R6 (Daniel) |
| TODO-14 | **App Check: MONITOREO; Enforce DIFERIDO** (Daniel 2026-06-23: sin flujo alto el monitoreo no es representativo → activar SOLO con tráfico alto). Registro reparado (§58). | ⏸️ | esperar flujo alto |
| TODO-17 | **Toda captura → CRM**: contacto→Bandeja ✅; falta newsletter (`addSubscription`→`subscriptions`) | 🔲 | tras App Check |
| TODO-18 | **Plan operación integral §57**: semana 1 + 9 decisiones de Daniel + compuerta de adopción + campaña cartera → bóveda | 🟡 | Daniel (decisiones 1-9) |
| TODO-33 | **Panel admin "tipo app" (fluidez)** (Decisión Fuerte). DISEÑADO (comité ×4+Gemini, veredicto `50 §5`; CRUDO→bóveda). Fase 0: **A3 menú instantáneo ✅** (`655556d`, v29) + fix VT v28 ✅ EN VIVO; pend. esqueletos/paralelizar/prefetch-asset/self-host fonts/VT-al-final. Router falso-SPA CONGELADO salvo 🟥 gate seguridad (revalidar rol/ruta) + no-leak IoC. **PAUSADO por TODO-34 (urgente).** | 🟡 | reanudar tras demo |
| TODO-34 | **Auditoría pág. PIEZA** (Daniel 2026-06-25). ✅ Fixes demo-críticos. ✅ **"También podría gustarte"** (trap `?p=`→`10a26bf` URLs limpias). ✅ **REDISEÑO ficha "Carta Gemológica"** + refinamientos Daniel, verificado LOCAL (Chrome): gema **quitada** (solo grabado), specs 2-col sin líneas, dorado→**esmeralda**, talla centrada, **columnas armonizadas** (imagen llena altura, pies alineados, escala con cualquier info), campos=solo admin reales; **cache v32**; guía CD handoff (`design_handoff_carta_gemologica`, NO mirror). ✅ Bug `og-image.jpg` 404 arreglado (creado 1200×630). ⚠️ **5 piezas PRUEBA LIVE en prod** (`zzz-prueba-*` — **BORRAR EN EL MERGE**). Commits en Desarrollo `[OPUS-4.8]`. **PEND**: merge (Daniel) + borrar pruebas + verif prod → **ADR**. · Tail menor: deploy reglas `sizes`, slug, collection enum, precio, caché stale, lightbox, cart sin-precio (SEO→TODO-35). | 🟡 | merge + borrar pruebas + ADR |
| TODO-21 | **Revisión post-Fable de `[OPUS-4.8]`** (H-08): por riesgo (dinero §81 > seguridad §65/§66 > CMS > docs); ~50 commits | 🔲 | Fable vuelve |
| TODO-22 | **Gate-de-git en el linter** (H-06): que `brain:check` warne si el estado de deploy declarado diverge de git. Toca kernel ×3 → **cars-operador** (L-31). *§114: mitigado en parte al dejar de fijar el hash en `05`.* | 🔲 | cars-operador (kernel) |
| TODO-23 | **Frase canónica del gate de verificación de DINERO** (H-18): Claude experto = gate; Kary = smoke POST-deploy no bloqueante. Aporte a la pasada Gemini (cars consolida) | 🔲 | Gemini |
| TODO-28 | **Correcciones web** (Daniel 2026-06-21): F1-F5 ✅ EN PROD (§93-§98). Pend.: arranque **C1** (Daniel) · responsive fino device-driven. | 🟡 | C1 + responsive |
| TODO-29 | **Kernel lea `### L-NN` de `3*-LECCIONES*.md`** (no solo `30`) → shard REAL de lecciones sin stub en `30` (hoy workaround M-06). Cambio de kernel = cars-operador (L-31). | 🔲 | cars-operador (kernel) |
| TODO-35 | **Visibilidad SITE-WIDE** (SEO·AEO·GA4·GSC·Maps·SSG). **🟢 EN PROD ✅** (PR#345 + merges 2026-06-25): A1 piezas SSG + B marca/Maps + A2a catálogo/journal + GA4 (G-HS26X60DK3 + Consent v2) + GA/GSC config (retención 14m · GA4↔GSC · sitemap). Detalle→commits/bóveda `2026-06-25-*`. **Falta**: A2b por-cat/artículo+migrar `?col=` (necesita contenido) · Eventos clave `generate_lead`/`contact` + excluir tráfico interno · consolidar 2º flujo GA `G-F0CEWY7SP1`=Firebase · prompt HUB. 🔑 Google bajo `bersagliojewelry@gmail.com` (authuser=3). ⚠️ App Check Enforce→`FIREBASE_SA_KEY`. | 🟢 | A2b · prompt HUB |
| TODO-36 | **Responsive inteligente + recomendaciones + medición** (Daniel 2026-06-25). Flujo COMPLETO W-11 (comité ×4 + mockup + Gemini ✅ verificado + Chrome). **Gemini cambió 2 cosas:** grilla **Flexbox** (`--cols` var + `justify-center` + `max-width`; centra la huérfana sola, NO grid/`data-cols`) y **fallback CURADO** (rellena con Destacadas bajo título honesto, no oculta ni azar). IMPL+VERIFICADO (build + 25 tests + **CSS live**: 5→3+2 centrado, sola→460, 8→4+4): helper `grid-balance.js` en featured/catalogo/pieza · recos por **contenido** (categoría=compuerta + gema/metal/precio, título honesto Más de X/También en {gema}/atelier, **sin azar**) · GA4 real (view_item+view_item_list[IO]+select_item[fix `.piece-card` muerto]+source_piece_slug) · cache **v33**. PEND: validación data-driven (prompt Chrome al cargar catálogo Kary) + **BigQuery export** (config GA) + merge Daniel + **ADR** + CRUDO comité/Gemini→bóveda. `[OPUS-4.8]`. | 🟡 | merge + data-val |
> ✅ **Cerrados recientes**: **Flujo fuerte COMPLETO blindado (W-11 en `60` + skill `proceso-decision-fuerte` + memorias) — falla "flujo a medias" corregida (Daniel 2026-06-25).** · **TODO-19 + TODO-31a → §115 (rol catálogo EN PROD, Kary en vivo; 4 fixes L-55/56/57)** · TODO-32→shard `30`→`32` + `00` ratchet · TODO-20→§113 (correo OWNER) · TODO-30→§103-§112 (web app-like) · TODO-27→§96 (shard `30`→`31`) · TODO-24→§88 · TODO-25/26→§90. **Histórico completo → ADR + `00`** (no re-listar aquí).

---

## 🔮 Contexto estratégico
Programa "Nuevo Bersaglio": Fase 1 rediseño ✅ · Fase 2 hardening (Tier A/B ✅, C pend.) · Fase 3 CRM ✅ en prod · **Fase M tren M0→M6 ✅ EN PROD** + ACUERDOS R1-R6 construidos/gateados (charter `50-ARQUITECTURA`, plan `fase-m-plan.md`). Horizonte: R6 acuerdos → M7 castigo → M2c → reportes/aging B6 → (futuro) inventario/facturación + RBAC/asesor (TODO-19).

---

## 📝 Bitácora (efímera)

> Podada (GC) 2026-06-25. Histórico → ADR §37-§115 + bóveda `2026-06-*`. Lecciones → `30`/`31`/`32`.
>
> **▶️ Hitos**: §114/§115 catálogo Kary ✅ · TODO-33 panel app-like Fase 0 (v28/v29) · TODO-34 ficha "Carta Gemológica" ✅ local (pend. merge) · TODO-35 visibilidad EN PROD (PR#345) · **flujo COMPLETO W-11 blindado** (2026-06-25).
>
> **🚦 Próximo**: **TODO-36** (recos/grilla: Gemini→verificar→implementar+Chrome+ADR) · **TODO-34** (merge+ADR) · **TODO-33** (parpadeo). **Regla**: `arquitecto-software` SIEMPRE · flujo COMPLETO **W-11** · `[[feedback_workflows_acotados]]`.
