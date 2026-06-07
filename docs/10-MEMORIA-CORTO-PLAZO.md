# ⚡ 10 — MEMORIA A CORTO PLAZO (WIP / Sprint activo)

> **Nodo neuronal: Memoria a Corto Plazo.** Junto con `CLAUDE.md` + `docs/05-ESTADO-GLOBAL.md`,
> es de las primeras lecturas de cada sesión (Ignorancia Selectiva, `CLAUDE.md §G`).
> Contiene solo lo vivo: foco actual, pendientes abiertos, bitácora. Estado técnico → `docs/05-ESTADO-GLOBAL.md`.
>
> **Es la pizarra, no el archivo.** Al cerrar una tarea: consolidar a ADR (`docs/99-HISTORIAL-ADR.md`) +
> fila en `docs/00-INDICE.md`, extraer lecciones a `docs/30-LECCIONES.md`, y PODAR esto al foco vivo (GC §G.4).

---

## 🎯 Foco actual
> 🎉 **CRM en producción + Reestructura Fase R desplegada (2026-06-06, ADR §47 + §49).** "Nuevo Bersaglio" vivo: Fase 1 (rediseño) + Fase 2 (hardening A/B) + Fase 3 (CRM cuentas por cobrar).
>
> **En prod ahora**: 344 clientes de Kary (cartera **$506.510.780**) + 12 pendientes · `recalcSaldoCliente` viva (Node 22 / ff v7) · sitio HTTP 200. **Fase R aplicada**: **solo Kary (admin) + Daniel (owner) operan**; las vendedoras NO tienen usuario → son entidad de datos (`vendedoras/{id}`, Kary las crea y asigna clientes); CRM admin-only; app de vendedora + rol + `solicitudesCorreccion` eliminados.
>
> **▶️ RETOMAR AQUÍ — PANEL v2: MOROSOS/VENCIDOS construido (ADR §51, `Desarrollo` sin desplegar); SIGUIENTE = deploy coordinado + F5/F4** (2026-06-07):
> Panel v2 = **mini-ERP** (CRM/leads + cartera + facturación + inventario + pagos + trazabilidad), IA "C", construido por fases. **Norte**: spec `docs/superpowers/specs/2026-06-07-bersaglio-arquitectura-maestra-design.md` (v3, Consejo §16). **F-CHASIS-A** ✅ desplegado (ADR §50). **MOROSOS/VENCIDOS** ✅ construido (ADR §51): helper puro `js/crm-estado-cuenta.js` (mora FIFO, en vivo, sin CF) + `fecha` real en movimientos + ficha con sello "Vencido N días" + lista CxC (KPI cartera vencida + rangos 1-30/31-60/+60, vencido en rojo, orden por mora). Tests: estado 15/15 · saldo 12/12 · rules 37/37 · build verde. Spec `docs/superpowers/specs/2026-06-07-morosos-vencidos-design.md`.
> - **▶️ SIGUIENTE**: (a) **deploy coordinado** (ver TODO-13 — ahora agrupa append-only + collectionGroup + fecha ISO + front); (b) **smoke por Kary**; (c) **F5 completo** (chips/filtros + control de crédito) o **F4-leads** (Bandeja). Antes de F7 (ventas/factura/inventario): Consejo Externo + PRE-infra (TODO-14).
>   **Decisiones de morosos (aplicadas, en cristiano):** plazo **30 días** (config; sin por-cliente) · movimientos NUEVOS llevan `fecha` (Kary; default hoy), los migrados YA la traen (`fecha:CUTOFF`), sin fecha → fallback `config.fechaCorteMigracion`, sin ninguna → "Falta fecha" ámbar · **VENCIDO desde día 1** pasado el plazo · **rangos** 1-30/31-60/+60 en ROJO.
> - **Pendiente operativo**: smoke de panel por Kary (Config→Vendedoras→crear+asignar); revisar nombres; crear vendedoras reales.
>
> ⚠️ **Deploy (L-22 + L-26)**: reglas/functions = deploy manual; sitio + merge a `main` = PR que mergea Daniel en GitHub (`git fetch` siempre). Admin SDK = ADC (L-23).

---

## 📋 Pendientes abiertos (TODO-NN)

| ID | Item | Estado | Bloqueo |
|---|---|---|---|
| TODO-03 | (Opcional) Migrar headers de `99-HISTORIAL` a formato numerado `## NN.` para el offset-drift estricto del linter (hoy convención por fecha, válida y verde). | 🔲 Abierto | Baja prioridad |
| TODO-04 | (Opcional) Limpieza de anomalías 🔧 en `skills/`: cuarentenar `skill-creator/skill-creator/` (anidado redundante); `code-simplifier`/`code-modernization` son formatos subagente/plugin (no skill) — normalizar o dejar documentadas. | 🔲 Abierto | Baja prioridad |
| TODO-05 | Merge `Desarrollo → main` + deploy a producción. → **✅ PR #189 (`a04b1a3`) + deploy manual reglas/functions + migración Fase A**. CRM en prod. | ✅ Hecho | → ADR §47 |
| TODO-06 | **Commit del rediseño Fase 1** → commiteado `e290f83` + pusheado `origin/Desarrollo` (verif. 2026-06-05). | ✅ Hecho | — |
| TODO-07 | **Contenido real**: reseñas Google Maps (Nosotros), Films y feed Redes (Meta Graph / TikTok API). Marcado `TODO:` en `js/data/home-media.js` + `js/pages/nosotros.js`. | 🔲 Abierto | Cliente entrega datos/fuentes |
| TODO-08 | **Fase 2 — Hardening**: S1✅(código)+S3✅ aplicados (Tier A); pendiente CSP/reglas/claims (Tier B/C). Backlog+progreso → `docs/41-SEGURIDAD §1.5`. | 🟡 En curso | Tier B reglas = emulador+deploy gated |
| TODO-09 | **Fase 3 — CRM**: B1-B5 + editabilidad + **Reestructura Fase R** ✅ DESPLEGADOS (ADR §42–§49). Vendedoras = entidad (Kary las crea; ya no necesitan correo/usuario). Siguiente: **Fase M** (movimientos robustos, spec listo) + B6 reportes/atrasados. | 🟡 En curso (en prod ✅) | Fase M = nuevo plan |
| TODO-10 | **Reactivar CI rules-test**: poner `on: [push, pull_request]` en `.github/workflows/firestore-rules-test.yml` (la causa del rojo —bug S6— ya está resuelta). Verifica al pushear. | 🔲 Abierto | A pedido (requiere push) |
| TODO-11 | **Consejo Externo Panel v2** (Gemini 3.1 Pro). ✅ Corrido por Daniel + peer review aplicado → spec **v3** (§16). Cambios netos: saldo **síncrono** (no async), **sin backfill** de Money (COP ya entero exacto), **recompute O(M)** (no incremental), DIAN por **Adapter**. Pendiente: volcar a ADR `99` al cerrar F-CHASIS-A. | ✅ Hecho | → spec §16 |
| TODO-12 | **F-CHASIS-A ✅ DESPLEGADO** (Desarrollo→main PR #195, `2fef1fe`; Pages success; `.co` HTTP 200; rail v2 vivo). Consolidado en **ADR §50**. | ✅ Hecho + desplegado | → ADR §50 |
| TODO-13 | **DEPLOY COORDINADO pendiente** (agrupa PRE-integridad §13 + MOROSOS §51): reglas = append-only (`delete:false` + anular con `motivoAnulacion`/`anulacionValida`) **+ collectionGroup `movimientos` (read admin) + `fecha` ISO** + `onInquiryCreated` idempotente. Reglas **37/37** (emulador) + build verde, en `Desarrollo`. Deploy: merge Desarrollo→main (front por Pages) **+** `firebase deploy --only firestore:rules,functions` JUNTOS (reglas sin front = anular/lista-CxC se rompen). | 🟡 Código listo, sin deploy | Deploy coordinado |
| TODO-14 | **PRE-infra (Daniel)**: (1) **Backup** (PITR o export programado a Storage) — bloqueante antes de F2; (2) **App Check** (registrar reCAPTCHA en consola) → desbloquea cerrar el hueco denial-of-wallet (`create:if true` en reviews/subscriptions/inquiries/push_tokens, `rules:127/135/143/198`). | 🔲 Abierto | Acción de Daniel (consola Firebase) |
| — | `.claude/settings.local.json` sin commitear (permisos del harness). El cliente decide si versionarlo. | ℹ️ info | — |

> ✅ Cerrados y consolidados: **TODO-01 / TODO-02** → ADR §38 (commit `1be38d1`).

---

## 🔮 Contexto estratégico
Programa "Nuevo Bersaglio" (3 fases): **Fase 1** rediseño Liquid Glass ✅ · **Fase 2** hardening (Tier A/B ✅, Tier C pendiente — `docs/41-SEGURIDAD.md`) · **Fase 3** CRM de cuentas por cobrar ✅ **en producción con datos reales** (charter `docs/50-ARQUITECTURA.md`). Service Worker `bersaglio-v9`. Próximo horizonte: vendedoras + reportes/aging + (futuro) inventario/facturación.

---

## 📝 Bitácora (efímera — se vacía al consolidar)
- **2026-06-07 (MOROSOS/VENCIDOS — ADR §51)**: aging de cartera EN VIVO sin infra nueva. Helper PURO `js/crm-estado-cuenta.js` (FIFO, espejo de `saldo.js`; vencido + rangos 1-30/31-60/+60) + `fecha` real en movimientos (modal + `addMovimiento` + reglas ISO) + `onAllMovimientosChange` (listener collectionGroup, filter-free → sin índice) + ficha con sello de estado + lista CxC (KPI cartera vencida en rojo + orden por mora). `saldoActual` intacto (la mora deriva). TDD: `test:estado` 15/15. Revisión adversarial 3 lentes → fixes (fecha round-trip, formato ISO en reglas, listener en vivo, truncado audible, pill ámbar sin-fecha); rechazado "fechaCorte impide sinFecha" (fallback intencional). `test:saldo` 12/12 · `test:rules` 37/37 · build verde · brain:check SANO · sin cache bump. En `Desarrollo`, **sin desplegar** (deploy coordinado = TODO-13). Lección **L-29**. Siguiente: deploy coordinado + F5/F4.
- **2026-06-07 (PRE-integridad, código — TODO-13)**: `movimientos` append-only (reglas `delete:if false` + update solo anular con `motivoAnulacion`, helper `anulacionValida`) + modal de anulación con motivo en la ficha + `onInquiryCreated` idempotente (`_counted` en la misma TX). Reglas 33/33 (emulador) + build verde. Commit `ea1f93f` (Desarrollo, sin desplegar). Pendiente: deploy coordinado (reglas+functions manual + front por Pages) + infra Daniel (backup, App Check). Siguiente: F1+F2 (aging) tras backup.
- **2026-06-07 (Panel v2 — diseño + F-CHASIS-A desplegado)** → consolidado en **ADR §50** (`99` + `00`/`05`/`20`/`50` + lecciones L-27/L-28): diseño maestro (mini-ERP, IA "C", spec v3) + Consejo Externo (Gemini 3.1 Pro, simplificó: saldo síncrono, sin backfill, O(M), DIAN por Adapter) + F-CHASIS-A construido por subagentes y **desplegado a prod** (`main` PR #195). Siguiente: **F1** (`estadoCuenta`).
- **2026-06-06 (CRM Reestructura Fase R, ADR §49)**: vendedora = dato (no usuario); CRM admin-only; app de vendedora + rol + `solicitudesCorreccion` ELIMINADOS; nueva colección `vendedoras` + gestión en Configuración + `vendedoraId`. Ejecutada con subagentes (6 tareas TDD, doble revisión spec/calidad por tarea). Reglas 29/29 + saldo 12/12 + integración 5/5; build verde. Desplegado: reglas+functions (manual) + sitio (PR #191 de Daniel). 344 clientes intactos; smoke prod OK (colección vendedoras write/read/delete). L-26. Siguiente: **Fase M** (movimientos robustos, spec listo).
- **2026-06-06 (Mantenimiento — upgrade runtime functions, ADR §48)**: Node 20→22 + firebase-functions 6.6→7.2.5 + firebase-admin 13.7→13.10 en `functions/package.json`. Cero cambios de código (la API v2 no cambió en v7; verificado por release oficial + package instalado + tests). `test:saldo` 12/12 + integración 5/5 con v7. Deploy → 6 functions en nodejs22; smoke test en prod OK (`recalcSaldoCliente` recalcula); 344 clientes intactos. Rama `chore/upgrade-functions-v7-node22` mergeada a Desarrollo. L-25. Deuda Node 20 de §47 resuelta.
- **2026-06-06 (LANZAMIENTO CRM, ADR §47)**: Audit de preparación read-only (workflow 4 agentes) → 3 correcciones al cerebro (`main` ya tenía el CRM; `firebase-deploy.yml` es Hosting-only; `recalcSaldoCliente` no estaba en prod). Deploy manual reglas+índices+functions (`recalcSaldoCliente` viva) + merge vía **PR #189** + ADC (`gcloud auth application-default login` + quota project) + **migración Fase A 345/345 exacto** → se borró 1 fila "TOTAL" basura (L-24) → **344 clientes, cartera $506.510.780**, 12 pendientes. Extractor parchado (`NON_CLIENT_RE`). Sitio HTTP 200. Lecciones L-22/23/24.
- _Historial previo (cerebro v1.0.0, Fase 1 rediseño+pulido, Fase 2 hardening, CRM B1-B5, verificación E2E) ya consolidado en ADRs §37–§46 — ver `00-INDICE`._
