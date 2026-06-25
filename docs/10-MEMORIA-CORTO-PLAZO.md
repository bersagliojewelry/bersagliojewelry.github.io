# ⚡ 10 — MEMORIA A CORTO PLAZO (WIP / Sprint activo)

> **Nodo: Memoria a Corto Plazo** (auto-carga con `CLAUDE.md` + `05`). Solo lo VIVO: foco, pendientes
> (TODO-NN = ledger único), bitácora efímera. Estado técnico → `05`.
> **Pizarra, no archivo**: al cerrar tarea → ADR en `99` + fila en `00`, lecciones a `30`, podar (GC §G.4).

---

## 🎯 Foco actual

> 🎉 **CRM + Fase M (M0→M6) EN PRODUCCIÓN** (§47-§82). **🔄 RESET A CERO** (Daniel 2026-06-20): Kary recarga de cero → cartera/clientes históricos DESECHABLES (bajan urgencias de dinero). ⚙️ **OPUS 4.8 interino** (marcar `[OPUS-4.8]` · `feedback_opus_interino`).
>
> **🚦 CERRADO EN RELEVO (2026-06-25) — 2 FRENTES ABIERTOS para la próxima sesión:**
> **(1) TODO-35 · VISIBILIDAD SITE-WIDE** (publicar web + SEO·AEO·GA4·Search Console·Google Maps): **Altorra Cars (HUB) está construyendo + propagando** el paquete de 7 skills (ya llegó `ssg-static-prerender`). Próxima sesión = implementar en Bersaglio: portar el **SSG** a piezas/colecciones/journal + GA4 + GSC + Maps + `product-feeds` + quitar `noindex` gated por flag `status` + publicar. **ARRANCA con el trigger de Daniel: "ALTORRA CARS YA TERMINO CONTINUA".** Pediré datos reales (redes/NAP/cuentas GA4-GSC-GBP). Spec/prompts/research → bóveda `2026-06-25-*`.
> **(2) TODO-33 · PARPADEO RESIDUAL del menú**: con A3 (v29) el menú aparece instantáneo y el parpadeo es MÍNIMO, pero AÚN parpadea en cada nav (recarga MPA) — no debería. Pendiente: matar el flash residual (re-evaluar View Transitions sin el choque con `body display:none`, o el router falso-SPA Opción B con su gate de seguridad).
> **⚠️ Pendiente DEMO Kary**: Daniel debe **mergear `f2ec1ab` (+schema `de9dbef`)** → verifico en vivo la página de pieza (specs reales, sin datos falsos, tallas admin).
> _Contexto previo cerrado: Web app-like §103-§113 ✅ · rol catálogo Kary §115 ✅ · TODO-34 pieza fixes demo-críticos ✅ (pend. merge)._
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
| TODO-34 | **Auditoría página de PIEZA** (Daniel 2026-06-25). Revisión 6 dimensiones (→bóveda). **Fixes demo-críticos HECHOS+DESPLEGADOS** (`f2ec1ab`+`de9dbef`, SW v30; detalle→bóveda): ficha dinámica cero-demo + tallas admin (`sizes`) + badge/ref/CTA asesor + schema AEO. **Pend. (sesión fresca, Daniel 2026-06-25)**: 🔴 **REDISEÑO de la ficha** — las specs en muchos cuadritos chicos SE VE FATAL ("no se diseña por diseñarse") → rediseñar con el flujo COMPLETO: comité expertos + consejo externo + TODAS las skills (diseño/arquitectura/caza-bugs/etc.) + agentes + Chrome + **🆕 prompt a CLAUDE DESIGN pidiendo un MOCKUP de cómo debería quedar** (nuevo paso del flujo para tareas de diseño, `[[feedback_flujo_diseno_mockup]]`); Claude verifica y delibera. · 🔴 **"También podría gustarte" SIGUE sin enlazar** (Daniel lo confirma ×2 en el deploy nuevo → bug REAL, no era solo caché vieja; reproducir en vivo con Chrome + arreglar el routing) · deploy reglas `sizes` · slug estable · collection enum · validación precio · caché stale · lightbox · cart sin-precio. (SEO/AEO go-live → TODO-35.) | 🟡 | rediseño + fix links (sesión fresca) |
| TODO-21 | **Revisión post-Fable de `[OPUS-4.8]`** (H-08): por riesgo (dinero §81 > seguridad §65/§66 > CMS > docs); ~50 commits | 🔲 | Fable vuelve |
| TODO-22 | **Gate-de-git en el linter** (H-06): que `brain:check` warne si el estado de deploy declarado diverge de git. Toca kernel ×3 → **cars-operador** (L-31). *§114: mitigado en parte al dejar de fijar el hash en `05`.* | 🔲 | cars-operador (kernel) |
| TODO-23 | **Frase canónica del gate de verificación de DINERO** (H-18): Claude experto = gate; Kary = smoke POST-deploy no bloqueante. Aporte a la pasada Gemini (cars consolida) | 🔲 | Gemini |
| TODO-28 | **Correcciones web** (Daniel 2026-06-21): F1-F5 ✅ EN PROD (§93-§98). Pend.: arranque **C1** (Daniel) · responsive fino device-driven. | 🟡 | C1 + responsive |
| TODO-29 | **Kernel lea `### L-NN` de `3*-LECCIONES*.md`** (no solo `30`) → shard REAL de lecciones sin stub en `30` (hoy workaround M-06). Cambio de kernel = cars-operador (L-31). | 🔲 | cars-operador (kernel) |
| TODO-35 | **Programa SEO/AEO/Visibilidad SITE-WIDE** (Daniel 2026-06-25, afirmación): TODO lo publicado (piezas·colecciones·journal·redes·cada sección) legible por Google + motores IA → #1 en buscadores/Maps/IA. Abarca SEO + AEO + **GA4 + Search Console + Google Maps/GBP + ranking-IA**. **Vía**: portar la **fábrica SSG de Altorra Cars** (`scripts/generate-vehicles.mjs` → `generate-pieces.mjs`: HTML horneado por ítem con title/desc/canonical/OG/JSON-LD/noscript + sitemap, corre en Actions) + investigación profunda (workflow `wf_15bc0d2a`) → **paquete de SKILLS reutilizable** → **Altorra Cars = HUB que propaga skills/agentes + consolida cerebros** (entrego prompt final para Altorra). Flujo completo (comité/consejo/agentes). Detalle/receta → bóveda. | 🟡 | research → spec-kit → implementar |
> ✅ **Cerrados recientes**: **TODO-19 + TODO-31a → §115 (rol catálogo EN PROD, Kary en vivo; 4 fixes L-55/56/57)** · TODO-32→shard `30`→`32` + `00` ratchet · TODO-20→§113 (correo OWNER) · TODO-30→§103-§112 (web app-like) · TODO-27→§96 (shard `30`→`31`) · TODO-24→§88 · TODO-25/26→§90. **Histórico completo → ADR + `00`** (no re-listar aquí).

---

## 🔮 Contexto estratégico
Programa "Nuevo Bersaglio": Fase 1 rediseño ✅ · Fase 2 hardening (Tier A/B ✅, C pend.) · Fase 3 CRM ✅ en prod · **Fase M tren M0→M6 ✅ EN PROD** + ACUERDOS R1-R6 construidos/gateados (charter `50-ARQUITECTURA`, plan `fase-m-plan.md`). Horizonte: R6 acuerdos → M7 castigo → M2c → reportes/aging B6 → (futuro) inventario/facturación + RBAC/asesor (TODO-19).

---

## 📝 Bitácora (efímera)

> Podada (GC) 2026-06-25. Histórico → ADR §37-§115 + bóveda `2026-06-*`. Lecciones → `30`/`31`/`32`.
>
> **▶️ Hitos recientes (detalle en bóveda / `50 §5` / ADR)**: §114/§115 catálogo Kary ✅ · TODO-33 panel app-like DISEÑADO (comité×4+Gemini) + Fase 0 parcial (VT fix v28, A3 menú instantáneo v29) · TODO-34 página de pieza fixes demo-críticos ✅ (`f2ec1ab`+`de9dbef`, SW v30, **pend. merge**) · **TODO-35 programa visibilidad**: research interna 5 frentes + Gemini ×2 + minería SSG Altorra → paquete **7 skills + arquitectura HUB tenant_config**; **Altorra Cars (HUB) construyendo/propagando** (ya llegaron `ssg-static-prerender` + `semantic-schema-aeo`).
>
> **🚦 Próximo (sesión NUEVA)**: ver Foco — (1) **TODO-35** implementar visibilidad en Bersaglio al trigger **"ALTORRA CARS YA TERMINO CONTINUA"**; (2) **TODO-33** matar el parpadeo residual del menú. Pend. merge Daniel. **Regla**: `arquitecto-software` SIEMPRE · `[[feedback_workflows_acotados]]`.
