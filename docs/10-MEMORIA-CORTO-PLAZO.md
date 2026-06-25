# ⚡ 10 — MEMORIA A CORTO PLAZO (WIP / Sprint activo)

> **Nodo: Memoria a Corto Plazo** (auto-carga con `CLAUDE.md` + `05`). Solo lo VIVO: foco, pendientes
> (TODO-NN = ledger único), bitácora efímera. Estado técnico → `05`.
> **Pizarra, no archivo**: al cerrar tarea → ADR en `99` + fila en `00`, lecciones a `30`, podar (GC §G.4).

---

## 🎯 Foco actual

> 🎉 **CRM + Fase M (M0→M6) EN PRODUCCIÓN** (§47-§82). **🔄 RESET A CERO** (Daniel 2026-06-20): Kary recarga de cero → cartera/clientes históricos DESECHABLES (bajan urgencias de dinero). ⚙️ **OPUS 4.8 interino** (marcar `[OPUS-4.8]` · `feedback_opus_interino`).
>
> **🚦 CERRADO EN RELEVO (2026-06-25) — 2 FRENTES ABIERTOS para la próxima sesión:**
> **(1) TODO-35 · VISIBILIDAD** — **🟢 TODO EN PROD ✅** (Daniel mergeó todo 2026-06-25): A1 piezas + B marca/Maps + A2a catálogo/journal + bugfixes (maps/iconos/NAP) + horarios + **C-GA4 encendido** (Consent Mode v2, verificado vivo; estaba MUERTO). **GA/GSC por Chrome**: retención 14m · GA4↔Search Console vinculado · sitemap reenviado (5 págs). Catálogo prod VACÍO (Kary recarga) → 0 piezas horneadas aún. **Falta**: A2b por-categoría/artículo (necesita contenido) · Eventos clave `generate_lead`/`contact` + excluir tráfico interno (al haber datos/IP) · prompt Altorra HUB. Detalle→fila TODO-35; spec→bóveda `2026-06-25-*`.
> **(2) TODO-33 · PARPADEO RESIDUAL del menú**: con A3 (v29) el menú aparece instantáneo y el parpadeo es MÍNIMO, pero AÚN parpadea en cada nav (recarga MPA) — no debería. Pendiente: matar el flash residual (re-evaluar View Transitions sin el choque con `body display:none`, o el router falso-SPA Opción B con su gate de seguridad).
> _Contexto previo cerrado: Web app-like §103-§113 ✅ · rol catálogo Kary §115 ✅ · TODO-34 pieza fixes demo-críticos ✅ (en prod vía PR #345)._
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
| TODO-35 | **Visibilidad SITE-WIDE** (SEO·AEO·GA4·GSC·Maps·IA→#1; SSG portado de Altorra=HUB; spec→bóveda `2026-06-25-*`; detalle por-fase en commits). **🟢 EN PROD ✅ (PR#345)**: A1 piezas (SSG `generate-pieces.mjs`→`/pieza/<slug>.html`+guards+`noindex→index`+`urls.js` SSoT+9 callsites+`404.html` fallback+robots bots-IA+cron) · B marca/Maps (`tenant_config.json`→JewelryStore+WebSite en index, NAP/sameAs reales; fix IG/FB rotos). **🟢 EN PROD ✅ (merges 2026-06-25)**: horarios + bugfixes (maps real/iconos marca/NAP 8-19) + **A2a** (catálogo+journal landings indexables) + **C-GA4** (G-HS26X60DK3 + Consent Mode v2 + banner; estaba MUERTO, verificado vivo). **GA/GSC config (Chrome 2026-06-25)**: retención 14m ✅ · **GA4↔Search Console vinculado** ✅ · sitemap reenviado a GSC (5 págs descubiertas) ✅. **Falta**: A2b por-cat(`/coleccion/<slug>`)+artículo+migrar `?col=` (necesita contenido) · marcar Eventos clave `generate_lead`/`contact` (al dispararse) · excluir tráfico interno (IP Daniel) · consolidar 2º flujo GA `bersaglio-web`/G-F0CEWY7SP1=Firebase · prompt HUB. 🔑 **Google todo bajo `bersagliojewelry@gmail.com` (authuser=3), NO djrome014.** ⚠️ App Check Enforce→`FIREBASE_SA_KEY`. | 🟢 | A2b · prompt HUB |
> ✅ **Cerrados recientes**: **TODO-19 + TODO-31a → §115 (rol catálogo EN PROD, Kary en vivo; 4 fixes L-55/56/57)** · TODO-32→shard `30`→`32` + `00` ratchet · TODO-20→§113 (correo OWNER) · TODO-30→§103-§112 (web app-like) · TODO-27→§96 (shard `30`→`31`) · TODO-24→§88 · TODO-25/26→§90. **Histórico completo → ADR + `00`** (no re-listar aquí).

---

## 🔮 Contexto estratégico
Programa "Nuevo Bersaglio": Fase 1 rediseño ✅ · Fase 2 hardening (Tier A/B ✅, C pend.) · Fase 3 CRM ✅ en prod · **Fase M tren M0→M6 ✅ EN PROD** + ACUERDOS R1-R6 construidos/gateados (charter `50-ARQUITECTURA`, plan `fase-m-plan.md`). Horizonte: R6 acuerdos → M7 castigo → M2c → reportes/aging B6 → (futuro) inventario/facturación + RBAC/asesor (TODO-19).

---

## 📝 Bitácora (efímera)

> Podada (GC) 2026-06-25. Histórico → ADR §37-§115 + bóveda `2026-06-*`. Lecciones → `30`/`31`/`32`.
>
> **▶️ Hitos recientes (detalle→bóveda/ADR)**: §114/§115 catálogo Kary ✅ · TODO-33 panel app-like DISEÑADO + Fase 0 parcial (v28/v29) · TODO-34 pieza fixes demo-críticos ✅ (`f2ec1ab`+`de9dbef`, SW v30, pend. merge) · **TODO-35**: research+minería SSG Altorra → 7 skills+HUB; **Fase A1 piezas HECHA — EN PROD ✅ (PR#345)** (ver ledger).
>
> **🚦 Próximo**: (1) **TODO-34** rediseño ficha "Carta Gemológica" ✅ implementado+verificado local → **merge Desarrollo→main (Daniel) + escribir ADR + verif prod**; (2) **TODO-33** parpadeo residual del menú; (3) **TODO-35** cola (A2b por-cat · eventos clave · prompt HUB). **Regla**: `arquitecto-software` SIEMPRE · `[[feedback_workflows_acotados]]`.
