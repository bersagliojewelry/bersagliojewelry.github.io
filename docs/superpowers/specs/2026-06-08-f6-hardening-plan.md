# F6 — Escala + Hardening · plan de fase (4 frentes)

> **Tipo:** plan de decomposición de fase (deriva del norte `2026-06-07-bersaglio-arquitectura-maestra-design.md` §8/§9/§9.1/§10.2-F6/§10.4).
> **Fecha:** 2026-06-08 · **Autor:** Claude (arquitecto) + workflow de 4 agentes grounded.
> **Clave:** F6 NO es una función — es la fase de escala+endurecimiento. **Los frentes de mayor valor (App Check, backup) están BLOQUEADOS en acciones de consola de Daniel.** Construir a ciegas tocaría seguridad/auth/dinero EN VIVO → spec→plan→build por slice.

## Frentes (grounded contra el código real)

### A — App Check + ingestión por CF (cierra "denial-of-wallet") · 🔴 mayor valor
- **Estado**: `firestore.rules` tiene `create: if true` en `reviews`/`subscriptions`/`inquiries`/`push_tokens`. El form (`contacto.js`→`saveInquiry`) escribe directo. apiKey pública → spam masivo agota cuota/factura. **Hueco LIVE en prod.**
- **Bloqueante (Daniel, consola)**: registrar **App Check reCAPTCHA v3** (~5 min). Sin esto el código no valida tokens.
- **Código**: `initializeAppCheck` en `firebase-config.js` (key por `VITE_*`) · CFs callable `submitInquiry/submitReview/submitSubscription` (App Check + dedup + rate-limit) · reglas → `create: if false` · repuntar `contacto.js`/`carrito.js` a la CF.
- **Rollout SEGURO**: consola → código → deploy reglas+functions → smoke E2E → **monitor-only 1 sem** (loguea, no rechaza) → **enforce**. Riesgo: romper el form si se invierte el orden.

### B — RBAC por custom claims (saca `get(users/{uid})` de cada chequeo) · riesgo alto
- **Estado**: reglas `getUserRole()` hace `get()` por chequeo (lectura extra, S4). Functions `verifyRole` lee Firestore. Sin `setCustomUserClaims`. ~2-3 usuarios (Daniel/Kary), sin claims.
- **Código**: CF `adminSetRole` (escribe claim) · reglas → `request.auth.token.role` **con fallback dual** (claim ?? get()) durante transición · `getIdToken(true)` tras cambiar rol.
- **Daniel**: backfill único de claims a los usuarios existentes ANTES de exigir; congelar creación de usuarios durante la transición.
- **Riesgo**: lockout si se hace mal → **mitigado por fallback dual** (red de seguridad) + tests de reglas en CI. Deprecar fallback a +30 días.

### C — Escala (paginación, índices, CI, entero-COP) · 🟢 mayormente código seguro
- **Estado**: `limit(2000)` mudo en `crm-service` (detector audible ya en `onAllMovimientosChange`, sin UI) · `limit(500)` en `inquiries` sin detector · `firestore-rules-test.yml` PAUSADO (TODO-10) · `firestore.indexes.json` solo inquiries/reviews (las queries CRM actuales NO usan where/orderBy compuesto → índices compuestos = preventivo, no urgente) · `addMovimiento` guarda `monto` number sin validar entero-COP.
- **Código (seguro, sin Daniel)**: reactivar `firestore-rules-test.yml` en CI (gatea reglas) · validación **entero-COP** en la frontera de escritura · (cuando aplique) índices por pantalla en el PR · cursor pagination + alerta UI (baja urgencia a 344).

### D — Backup + reconciliación + observabilidad + vista Salud · red de seguridad
- **Estado**: `recalcSaldoCliente` (trigger **async** por-write, idempotente) **sin try-catch** → un fallo = saldo mal en silencio. Sin backup, sin Cloud Monitoring, sin `failedIngestions`/`auditLog` globales, sin vista "Salud" (placeholder en el rail).
- **Código**: `failedIngestions` + try-catch/logging estructurado en CFs · CF `reconcileCartera` (callable + Scheduler diario): recomputa saldos, descuadre → `auditLog`/alerta a Kary **y** Daniel · `admin-salud.html` owner-only (lista + reprocesar) · ítem "Salud" en `sidebar-data`.
- **Daniel (consola)**: **backup** (PITR pago vs export programado a Storage + lifecycle) + **restore probado** (PRE-1, **bloqueante antes de F7**) · Cloud Monitoring alert policy · Secret Manager (emails de alerta).

## Acciones de Daniel (consola/infra) que desbloquean F6
1. **reCAPTCHA v3** (App Check) — ~5 min. Desbloquea el frente A (el de mayor valor).
2. **Modelo de backup** (PITR vs export a Storage) + bucket + scheduler + **restore probado** (PRE-1). Bloquea F7.
3. **Cloud Monitoring** alert policy (errores de functions) + **Secret Manager** (emails de alerta).
4. **Backfill de custom claims** (script único) — para el frente B.

## Orden recomendado (el norte: cerrar riesgos vivos primero, sin tocar dinero a ciegas)
1. **A — App Check** (cierra el hueco #1, denial-of-wallet). Necesita reCAPTCHA de Daniel.
2. **C — cimientos** (CI rule-test + entero-COP): seguro, sin dependencias, en paralelo.
3. **D — reconciliación + Salud** (red de seguridad del dinero; backup de Daniel antes de colecciones críticas).
4. **B — RBAC claims** (rollout dual, sin prisa).
→ Todo esto ANTES de **F7** (ventas/factura — dinero nuevo + Consejo Externo).

## Notas de verdad (correcciones al output del workflow)
- `tests/firestore-rules.test.mjs` **SÍ existe** (37/37 esta semana) — reactivar el CI es solo cambiar el trigger del `.yml`.
- El saldo HOY es **async** (`recalcSaldoCliente` trigger), no síncrono-en-TX; el síncrono-en-TX es el futuro `registrarVenta` (F7). Por eso la reconciliación (D) sí aporta hoy.
- Índices compuestos CRM = preventivo (las queries actuales filtran en memoria); añadir solo cuando una pantalla agregue `where`+`orderBy`.
