# ⚡ 10 — MEMORIA A CORTO PLAZO (WIP / Sprint activo)

> **Nodo: Memoria a Corto Plazo** (auto-carga con `CLAUDE.md` + `05`). Solo lo VIVO: foco, pendientes
> (TODO-NN = ledger único), bitácora efímera. Estado técnico → `05`.
> **Pizarra, no archivo**: al cerrar tarea → ADR en `99` + fila en `00`, lecciones a `30`, podar (GC §G.4).

---

## 🎯 Foco actual

> 🎉 **CRM + Fase M (M0→M6) EN PRODUCCIÓN** (§47-§82). **🔄 RESET A CERO** (Daniel 2026-06-20): Kary recarga de cero → cartera/clientes históricos DESECHABLES (bajan urgencias de dinero). ⚙️ **OPUS 4.8 interino** (marcar `[OPUS-4.8]` · `feedback_opus_interino`).
>
> **Web "app-like" §103-§113 CERRADO ✅** · correo OWNER migrado ✅ (§113). **🎯 Rol "catálogo" de Kary CERRADO EN PROD ✅** (§115, TODO-19/31a: candado 196/196 + **Kary verificada EN VIVO** — ve/maneja SOLO Piezas+Colecciones; 4 fixes cazados en vivo). **🎯 SIGUIENTE (Decisión Fuerte, sesión NUEVA)**: **panel admin "tipo app"** (router falso-SPA + datos cacheados → fluidez real SIN exponer nada; TODO-33, diseñar con proceso). Resto en tabla TODO (norte mini-ERP; M4 1er corte 1-jul).
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
| TODO-33 | **Panel admin "tipo app" (fluidez)** (Daniel 2026-06-24, Decisión Fuerte): el admin MPA recarga TODO en cada nav (menú+contenido tardan en armarse). Objetivo: **router falso-SPA** (menú persistente + contenido swap + datos cacheados en memoria de sesión + nav instantánea) — **MISMA seguridad** (candado server-side; cachear lo YA autorizado NO expone, [[L-57]]). Subsume login-parpadea (ex TODO-31b). **Diseñar con proceso** (comité+externo, §3.7/`proceso-decision-fuerte`) ANTES de codear → registro en `50-ARQUITECTURA`. [[L-51]] nivel 2. | 🔲 | diseñar (sesión nueva) |
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
> **▶️ §114 auditoría cerebro + §115 rol catálogo — CERRADOS (2026-06-24)**: catálogo de Kary EN PROD y **verificado en vivo** (Kary ve/maneja SOLO Piezas+Colecciones). 4 fixes cazados EN VIVO (no por tests): 3 mapas de rol + falsy-0 (`??`) → L-55 · `createUser` 403 invoker→delete+recreate → L-56 · parpadeo blanco admin→shell inmediato → L-57. Auditoría Nivel-2 (M-08 git-stale, L-39→L-54) + shard `30`→`32` + `00` ratchet 28k (TODO-32). Detalle → **ADR §114/§115**; CRUDO auditoría → bóveda.
>
> **🚦 Próximo (decide Daniel)**: **panel admin "tipo app"** (TODO-33, Decisión Fuerte — diseñar en SESIÓN NUEVA con proceso: el MPA recarga todo en cada nav; objetivo router falso-SPA + datos cacheados, misma seguridad). Luego: contenido real web (TODO-07) · App Check (TODO-14). **Regla**: `arquitecto-software` SIEMPRE · `[[feedback_workflows_acotados]]`.
