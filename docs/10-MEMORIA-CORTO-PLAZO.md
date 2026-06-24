# ⚡ 10 — MEMORIA A CORTO PLAZO (WIP / Sprint activo)

> **Nodo: Memoria a Corto Plazo** (auto-carga con `CLAUDE.md` + `05`). Solo lo VIVO: foco, pendientes
> (TODO-NN = ledger único), bitácora efímera. Estado técnico → `05`.
> **Pizarra, no archivo**: al cerrar tarea → ADR en `99` + fila en `00`, lecciones a `30`, podar (GC §G.4).

---

## 🎯 Foco actual

> 🎉 **CRM + Fase M (M0→M6) EN PRODUCCIÓN** (§47-§82). **🔄 RESET A CERO** (Daniel 2026-06-20): Kary recarga de cero → cartera/clientes históricos DESECHABLES (bajan urgencias de dinero). ⚙️ **OPUS 4.8 interino** (marcar `[OPUS-4.8]` · `feedback_opus_interino`).
>
> **Web "app-like" §103-§113 CERRADO ✅** · correo OWNER migrado ✅ (§113). **🎯 FOCO = usuarios & permisos**: rol **"catálogo" de Kary CONSTRUIDO + backend DESPLEGADO** (TODO-19 + TODO-31a, §115-build: candado real 196/196 + UI que crea cuentas directo) → **falta merge frontend de Daniel + crear la cuenta de Kary (verificación EN VIVO)**. Pendiente aparte: login-parpadea (TODO-31b). Resto en tabla TODO (norte mini-ERP; M4 1er corte 1-jul).
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
| TODO-19 | **RBAC rol "catálogo" de Kary** (Decisión Fuerte): **CONSTRUIDO + backend DESPLEGADO** (§115-build): `catalogo:0` (bajo editor) en los **3 mapas de rol** (auth/functions/render-sidebar) → auto-denegado en todo salvo Piezas/Colecciones; candado en `firestore.rules` (CRUD pieces/collections, delete=admin‖catálogo) + CF `createUser`/`updateUserRole`/`syncRoleClaim` aceptan el rol + nav/login/requireAuth('catalogo'). **Verif: build VERDE + emulador rules 196/196 + deploy rules+functions OK** (`d26a255`). **PENDIENTE: merge frontend de Daniel + crear cuenta de Kary (verif. EN VIVO) → luego ADR §115 + lección de los 3 mapas de rol**. | 🟢 | merge Daniel + verif. vivo |
| TODO-21 | **Revisión post-Fable de `[OPUS-4.8]`** (H-08): por riesgo (dinero §81 > seguridad §65/§66 > CMS > docs); ~50 commits | 🔲 | Fable vuelve |
| TODO-22 | **Gate-de-git en el linter** (H-06): que `brain:check` warne si el estado de deploy declarado diverge de git. Toca kernel ×3 → **cars-operador** (L-31). *§114: mitigado en parte al dejar de fijar el hash en `05`.* | 🔲 | cars-operador (kernel) |
| TODO-23 | **Frase canónica del gate de verificación de DINERO** (H-18): Claude experto = gate; Kary = smoke POST-deploy no bloqueante. Aporte a la pasada Gemini (cars consolida) | 🔲 | Gemini |
| TODO-28 | **Correcciones web** (Daniel 2026-06-21): F1-F5 ✅ EN PROD (§93-§98). Pend.: arranque **C1** (Daniel) · responsive fino device-driven. | 🟡 | C1 + responsive |
| TODO-29 | **Kernel lea `### L-NN` de `3*-LECCIONES*.md`** (no solo `30`) → shard REAL de lecciones sin stub en `30` (hoy workaround M-06). Cambio de kernel = cars-operador (L-31). | 🔲 | cars-operador (kernel) |
| TODO-31 | **Panel admin · usuarios+UX**: **(a) ✅ HECHO** (§115-build, TODO-31a): modal sin UID manual → crea la cuenta directo vía CF `createUser` (`auth.createUser` wrapper) + campo contraseña + opción Catálogo (`dae9c63`). **(b) login parpadea** al entrar → RCA en navegador (auth/redirect + gate `display:none`) — PENDIENTE, aparte. | 🟡 | (b) login parpadea |
> ✅ **Cerrados recientes**: **TODO-32→shard `30`→`32-LECCIONES-CARGA` (L-45/46/47/49/50/51/52/53) + `00` ratchet 24k→28k (cerebro, 2026-06-24)** · TODO-20→§113 (correo OWNER) · TODO-30→§103-§112 (web app-like) · TODO-27→§96 (shard `30`→`31`) · TODO-24→§88 (índice cero-ficción) · TODO-25/26→§90 (caza-bugs). **Histórico completo → ADR + `00`** (no re-listar aquí).

---

## 🔮 Contexto estratégico
Programa "Nuevo Bersaglio": Fase 1 rediseño ✅ · Fase 2 hardening (Tier A/B ✅, C pend.) · Fase 3 CRM ✅ en prod · **Fase M tren M0→M6 ✅ EN PROD** + ACUERDOS R1-R6 construidos/gateados (charter `50-ARQUITECTURA`, plan `fase-m-plan.md`). Horizonte: R6 acuerdos → M7 castigo → M2c → reportes/aging B6 → (futuro) inventario/facturación + RBAC/asesor (TODO-19).

---

## 📝 Bitácora (efímera)

> Podada (GC) 2026-06-24 (auditoría §114). Histórico → **ADR §37-§114** (mapa `00`→detalle `99`; lecciones L-/M- en `30`/`31`).
>
> **▶️ Auditoría cerebro Nivel-2 §114 (2026-06-24)**: 8 sondas. **Hallazgo estrella HA-01-bis**: estado git stale en `05` REINCIDE ×3 (el agente frío de la Sonda 3 entregó el hash viejo de PROD como "verificado") → **fix estructural**: `05` ya NO fija el hash/PR de PROD (contradecía §3.3) → **M-08**. **L-39 duplicada** → renumerada `L-54`. GC pareado del boot (−~4.5k chars). Sondas 3(ruteo 4/5)·4(deliberación §108)·5(SSoT) ✅. CRUDO+tabla → bóveda; síntesis → ADR §114.
>
> **▶️ Rol "catálogo" CONSTRUIDO + backend DESPLEGADO (2026-06-24, TODO-19/31a)**: `catalogo:0` (bajo editor) en los **3 mapas de rol** (auth `ROLE_LEVELS` · functions `ROLE_LEVEL` · render-sidebar `ROLE_RANK` — el 3º NO estaba en el plan, cazado leyendo el código → **lección de los 3 mapas de rol, al cerrar**); candado en `firestore.rules` + CFs (`createUser`/`updateUserRole`/`syncRoleClaim`) aceptan el rol + nav/login/`requireAuth('catalogo')` + UI usuarios crea cuentas directo (CF `createUser`, sin UID manual). build VERDE · emulador **196/196** · **deploy rules+functions OK**. `d26a255`+`dae9c63`. **Falta: merge frontend (Daniel) + crear cuenta Kary EN VIVO → ADR §115 al verificar.**
>
> **▶️ Cerebro · TODO-32 (2026-06-24)**: `createUser` daba 403 (faltaba el invoker público — función nunca invocada → delete+recreate; logs servidor; commit `d8184d5`) → ARREGLADO + verificado (401 JSON). Shard `30`→`32-LECCIONES-CARGA` (clúster carga/LQIP §100-§113) + `00` cap 24k→28k (índice monótono). Lección del invoker público de las callables v2 → al cerrar §115.
>
> **🚦 Próximo (decide Daniel)**: merge del frontend (catálogo) + crear cuenta de Kary y validar en vivo → cierro ADR §115 + la lección de los 3 mapas de rol. Luego: login-parpadea (TODO-31b) · contenido real web (TODO-07). **Regla**: `arquitecto-software` SIEMPRE · `[[feedback_workflows_acotados]]`.
