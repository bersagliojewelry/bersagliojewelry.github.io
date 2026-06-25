# ⚡ 10 — MEMORIA A CORTO PLAZO (WIP / Sprint activo)

> **Nodo: Memoria a Corto Plazo** (auto-carga con `CLAUDE.md` + `05`). Solo lo VIVO: foco, pendientes
> (TODO-NN = ledger único), bitácora efímera. Estado técnico → `05`.
> **Pizarra, no archivo**: al cerrar tarea → ADR en `99` + fila en `00`, lecciones a `30`, podar (GC §G.4).

---

## 🎯 Foco actual

> 🎉 **CRM + Fase M (M0→M6) EN PRODUCCIÓN** (§47-§82). **🔄 RESET A CERO** (Daniel 2026-06-20): Kary recarga de cero → cartera/clientes históricos DESECHABLES (bajan urgencias de dinero). ⚙️ **OPUS 4.8 interino** (marcar `[OPUS-4.8]` · `feedback_opus_interino`).
>
> **Web "app-like" §103-§113 CERRADO ✅** · correo OWNER migrado ✅ (§113). **🎯 Rol "catálogo" de Kary CERRADO EN PROD ✅** (§115, TODO-19/31a: candado 196/196 + **Kary verificada EN VIVO** — ve/maneja SOLO Piezas+Colecciones; 4 fixes cazados en vivo). **🎯 EN CURSO (Decisión Fuerte)**: **panel admin "tipo app"** (TODO-33) — **DISEÑADO** (comité ×4, veredicto en `50 §5`): Opción C faseada REORDENADA (medir → Fase 0 barata: A3+skeletons→A2→prefetch→VT al final; router falso-SPA CONGELADO salvo gate seguridad). **Pendiente**: Gemini (prompt listo) + medición. Resto en tabla TODO (norte mini-ERP; M4 1er corte 1-jul).
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
| TODO-34 | **Auditoría página de PIEZA** (Daniel 2026-06-25, URGENTE demo Kary mañana). Verificado en vivo (Chrome+Firestore) + revisión 6 dimensiones (workflow→bóveda). **Fixes demo-críticos HECHOS** (`f2ec1ab`, SW v30): ficha técnica DINÁMICA cero-demo (todas las specs reales hide-when-empty; fuera Origen/Entrega/descripción FALSOS) · tallas reales por admin (campo `sizes`; sin 5-9 falsas → "a medida") · badge+ref+CTA asesor primario sin precio · specs grid auto-fit · `transition:all` fix · "Bajo consulta" unificado. **Pend.**: deploy reglas `sizes` (no bloqueante) · Gemini (decisiones fondo) · POST-demo: noindex/SEO go-live + schema/FAQ/sitemap/Organization (AEO) · slug estable · collection enum · validación precio · caché stale · lightbox · cart sin-precio. | 🟡 | merge Daniel → verifico en vivo |
| TODO-21 | **Revisión post-Fable de `[OPUS-4.8]`** (H-08): por riesgo (dinero §81 > seguridad §65/§66 > CMS > docs); ~50 commits | 🔲 | Fable vuelve |
| TODO-22 | **Gate-de-git en el linter** (H-06): que `brain:check` warne si el estado de deploy declarado diverge de git. Toca kernel ×3 → **cars-operador** (L-31). *§114: mitigado en parte al dejar de fijar el hash en `05`.* | 🔲 | cars-operador (kernel) |
| TODO-23 | **Frase canónica del gate de verificación de DINERO** (H-18): Claude experto = gate; Kary = smoke POST-deploy no bloqueante. Aporte a la pasada Gemini (cars consolida) | 🔲 | Gemini |
| TODO-28 | **Correcciones web** (Daniel 2026-06-21): F1-F5 ✅ EN PROD (§93-§98). Pend.: arranque **C1** (Daniel) · responsive fino device-driven. | 🟡 | C1 + responsive |
| TODO-29 | **Kernel lea `### L-NN` de `3*-LECCIONES*.md`** (no solo `30`) → shard REAL de lecciones sin stub en `30` (hoy workaround M-06). Cambio de kernel = cars-operador (L-31). | 🔲 | cars-operador (kernel) |
> ✅ **Cerrados recientes**: **TODO-19 + TODO-31a → §115 (rol catálogo EN PROD, Kary en vivo; 4 fixes L-55/56/57)** · TODO-32→shard `30`→`32` + `00` ratchet · TODO-20→§113 (correo OWNER) · TODO-30→§103-§112 (web app-like) · TODO-27→§96 (shard `30`→`31`) · TODO-24→§88 · TODO-25/26→§90. **Histórico completo → ADR + `00`** (no re-listar aquí).

---

## 🔮 Contexto estratégico
Programa "Nuevo Bersaglio": Fase 1 rediseño ✅ · Fase 2 hardening (Tier A/B ✅, C pend.) · Fase 3 CRM ✅ en prod · **Fase M tren M0→M6 ✅ EN PROD** + ACUERDOS R1-R6 construidos/gateados (charter `50-ARQUITECTURA`, plan `fase-m-plan.md`). Horizonte: R6 acuerdos → M7 castigo → M2c → reportes/aging B6 → (futuro) inventario/facturación + RBAC/asesor (TODO-19).

---

## 📝 Bitácora (efímera)

> Podada (GC) 2026-06-24 (auditoría §114). Histórico → **ADR §37-§114** (mapa `00`→detalle `99`; lecciones L-/M- en `30`/`31`).
>
> **▶️ §114/§115 — CERRADOS**: catálogo Kary EN PROD; L-55/56/57. Detalle → ADR + bóveda.
>
> **▶️ TODO-33 panel "tipo app" — DISEÑADO (comité ×4+Gemini) + Fase 0 parcial EN PROD**: fix VT v28 ✅ (parpadeo viejo) + A3 menú instantáneo v29 (`655556d`). Veredicto/baseline/detalle → `50 §5` + bóveda. **PAUSADO** por TODO-34.
>
> **▶️ TODO-34 página de PIEZA (2026-06-25, demo Kary) — fixes demo-críticos HECHOS** (`f2ec1ab`, SW v30): ficha técnica dinámica cero-demo (fuera Origen/Entrega/descripción falsos) · tallas reales por admin (`sizes`) · badge/ref/CTA asesor. Verificado en vivo (Chrome+Firestore) + revisión 6 dimensiones (→bóveda). **🆕 Decisión Daniel 2026-06-25: el sitio VA PÚBLICO/INDEXABLE en Google** → paquete SEO/AEO: quitar `noindex` de pieza/colecciones/journal/entrada (+legales); fix `schema.js` (sku=`code` no `ref`; Offer sin `price:0`; specs ricas via additionalProperty); FAQPage + Organization/JewelryStore + sameAs reales; sitemap dinámico (hoy solo 3 URLs); robots `Disallow:/admin` prefijo. Ground-truth reunido.
>
> **🚦 Próximo**: esperar respuesta Antigravity/Gemini (modelo tallas · SEO go-live/noindex · slug estable · prerender/SSG estático por pieza · JSON-LD/AEO) → VERIFICAR contra código → implementar paquete SEO/AEO + verificar en vivo. Pend. merge Daniel (`f2ec1ab` pieza + A3). Reanudar Fase 0 TODO-33 tras demo. **Regla**: `arquitecto-software` SIEMPRE · `[[feedback_workflows_acotados]]`.
