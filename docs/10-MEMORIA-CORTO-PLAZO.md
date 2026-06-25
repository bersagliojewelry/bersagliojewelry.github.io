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
| TODO-33 | **Panel admin "tipo app" (fluidez)** (Daniel 2026-06-24, Decisión Fuerte). **DISEÑADO** (arquitecto + comité ×4 acotado, veredicto en `50 §5`; CRUDO→bóveda). Veredicto: **Opción C faseada REORDENADA** — (1) **MEDIR** primero (navegador real, §3.3); (2) **Fase 0** barato/reversible: A3 desacoplar shell↔datos+skeletons → A2 rol cacheado solo-pinta → prefetch en hover → App Check token reuse + self-host fonts → A1 View Transitions al final (solo si shell <200ms; sobre latencia alta EMPEORA); (3) medir con Daniel → si "se siente app", PARAR; (4) **router falso-SPA = CONGELADO** salvo 🟥 gate seguridad (revalidar rol por ruta + `onSnapshot(users)`→logout) + gate no-leak por IoC. **Gemini convergió** (refinó: prefetch solo-asset, datos moot en MPA; persistencia verificada OK por grep). Subsume login-parpadea (ex TODO-31b). | 🟡 | medición → Fase 0 |
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
> **▶️ §114/§115 — CERRADOS (2026-06-24)**: catálogo Kary EN PROD verificado en vivo; 4 fixes L-55/56/57; auditoría Nivel-2 + shard `30`→`32`. Detalle → ADR §114/§115 + bóveda.
>
> **▶️ TODO-33 panel "tipo app" — DISEÑADO + VALIDADO EN VIVO (2026-06-24)**: arquitecto + comité ×4 + Gemini CONVERGEN (CRUDO/RESPUESTA→bóveda; veredicto `50 §5`): Opción C reordenada (medir→Fase 0: A3+esqueletos→A2→prefetch-ASSET→fonts→VT al final) · falso-SPA CONGELADO salvo 🟥 gate seguridad (revalidar rol/ruta + IoC no-leak). Gemini afinó: prefetch-datos moot en MPA + IoC routeContext; refuté "persistencia apagada" (grep: solo Firestore=memoria).
> - **CAZADO el parpadeo en vivo**: admin heredaba `@view-transition{navigation:auto}` (admin.css `@import` liquid-glass) → abortaba (`InvalidStateError`) sobre el body oculto (§115/L-57) cada nav. **FIX** `admin.css {navigation:none}` + SW v28 (`19bbbf1`, en Desarrollo — **falta mergear**).
> - **BASELINE (Resource Timing, prod, Cuentas)**: shell ~90ms (rápido) · reCAPTCHA ~300ms (no dominante) · 0 re-atestación AppCheck · **datos arrancan ~977ms** (gap auth EN SERIE) + collectionGroup de todos los movs de 344 clientes (pesado, sin caché). Cuello = **gap auth + re-fetch datos**, NO shell/AppCheck (refuta parcial ambas hipótesis).
>
> **▶️ Fix VT v28 desplegado y verificado en vivo** (CSS prod tiene `navigation:none`; caché v28) → el crossfade que abortaba ya no está; queda el blank MPA + menú tardío. **A3 construido** (`655556d`, SW v29): `auth.js` cachea `bj_role` + `shared.js renderSidebarShell()` pinta el rail AL INSTANTE al importar (antes de la cascada), reconcilia tras auth. Falta mergear+verificar.
> **🚦 Próximo**: (1) Daniel **mergea Desarrollo→main** → deploy (A3 v29 + sonda) → re-verifico en vivo (menú instantáneo + sonda). (2) Resto Fase 0: **esqueletos de carga** del contenido + paralelizar auth↔datos · prefetch-asset · self-host fonts. (3) menú 100% sin desaparecer + datos instantáneos = panel-tipo-app (Opción B, con gate seguridad) / aligerar collectionGroup. Lección a canonizar (prefetch-datos moot MPA · memoryLocalCache≠Auth/AppCheck · VT empeora latencia alta) al GC de `30`. Luego TODO-07 · TODO-14. **Regla**: `arquitecto-software` SIEMPRE · `[[feedback_workflows_acotados]]`.
