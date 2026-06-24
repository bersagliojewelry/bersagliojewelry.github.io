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
> **▶️ §114 auditoría cerebro + §115 rol catálogo — CERRADOS (2026-06-24)**: catálogo de Kary EN PROD y **verificado en vivo** (Kary ve/maneja SOLO Piezas+Colecciones). 4 fixes cazados EN VIVO (no por tests): 3 mapas de rol + falsy-0 (`??`) → L-55 · `createUser` 403 invoker→delete+recreate → L-56 · parpadeo blanco admin→shell inmediato → L-57. Auditoría Nivel-2 (M-08 git-stale, L-39→L-54) + shard `30`→`32` + `00` ratchet 28k (TODO-32). Detalle → **ADR §114/§115**; CRUDO auditoría → bóveda.
>
> **▶️ §TODO-33 panel "tipo app" — DISEÑADO (2026-06-24)**: arquitecto + comité ×4 acotado (inline+schema, sin desboque; CRUDO+síntesis→bóveda `2026-06-24-panel-app-like-comite-CRUDO.md`, committeado a brain-private). Veredicto en `50 §5`: **medir → Fase 0 barata (reorden: A3+skeletons primero, VT al final) → falso-SPA CONGELADO** salvo 🟥 gate de seguridad (revalidar rol por ruta) que el comité cazó. El comité reordenó el diseño (VT NO va primero — empeora sobre latencia alta) + levantó la 4ª palanca (prefetch) + el gate de seguridad de B. También: §114 CRUDO mergeado a brain-private/main (b43092f).
>
> **▶️ Gemini (Consejo Externo) corrido por Daniel — CONVERGIÓ** (2026-06-24, RESPUESTA→bóveda): mismo veredicto que el comité; añadió prefetch-de-datos-moot-en-MPA (✅), zombi=fuga+lecturas vía WebSocket + fix IoC routeContext (✅), y "desactivaron persistencia" (⚠️ REFUTADO con grep: solo Firestore=memoria, Auth/AppCheck persisten). Diseño CERRADO, sin nueva Decisión Fuerte.
>
> **🚦 Próximo**: **medición** (baseline navegador real: desglose por tramo, aislar App Check/reCAPTCHA) → **Fase 0** (A3+esqueletos→A2→prefetch JS→fonts→VT al final). Lección a canonizar al medir/construir (prefetch-de-datos moot en MPA · `memoryLocalCache`≠persistencia Auth/AppCheck · VT cross-doc empeora sobre latencia alta) — pendiente nº por GC de `30` (hoy 98% cap). Detalle en bóveda. Después: contenido real web (TODO-07) · App Check (TODO-14). **Regla**: `arquitecto-software` SIEMPRE · `[[feedback_workflows_acotados]]`.
