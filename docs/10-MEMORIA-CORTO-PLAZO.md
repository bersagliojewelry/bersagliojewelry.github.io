# ⚡ 10 — MEMORIA A CORTO PLAZO (WIP / Sprint activo)

> **Nodo neuronal: Memoria a Corto Plazo.** Junto con `CLAUDE.md` + `docs/05-ESTADO-GLOBAL.md`,
> es de las primeras lecturas de cada sesión (Ignorancia Selectiva, `CLAUDE.md §G`).
> Contiene solo lo vivo: foco actual, pendientes abiertos, bitácora. Estado técnico → `docs/05-ESTADO-GLOBAL.md`.
>
> **Es la pizarra, no el archivo.** Al cerrar una tarea: consolidar a ADR (`docs/99-HISTORIAL-ADR.md`) +
> fila en `docs/00-INDICE.md`, extraer lecciones a `docs/30-LECCIONES.md`, y PODAR esto al foco vivo (GC §G.4).

---

## 🎯 Foco actual
> 🎉 **LANZAMIENTO DEL CRM COMPLETADO (2026-06-06, ADR §47).** "Nuevo Bersaglio" en producción: Fase 1 (rediseño) + Fase 2 (hardening Tier A/B) + **Fase 3 (CRM) DESPLEGADO Y CON DATOS REALES**.
>
> **En prod ahora**: reglas+índices+functions desplegadas (`recalcSaldoCliente` viva) · **344 clientes de Kary** migrados (cartera **$506.510.780**, corte 2026-06-06) · 12 pendientes · sitio HTTP 200. Editabilidad lista (Kary corrige nombres/saldos). Modelo de signo ADR §43 (confirmable). Cache `v9`.
>
> **▶️ RETOMAR AQUÍ — POST-LANZAMIENTO (operación real):**
> 1. **Vendedoras** (Fase B): crear sus accesos — **faltan los correos** (Tania/Daniela internas; resto externas; `tools/vendedoras.csv` local). Cada una carga sus clientes **fresco** (su hoja es por factura, NO auto-migrable, L-21).
> 2. **Revisar nombres con Kary**: la migración trajo nombres crudos del Excel ("Claribel Fernandez ctas de () ( )", etc.) → Kary los limpia con la editabilidad ya construida.
> 3. **B6 reportes + "atrasados"** (aging con `config.diasPlazo`) — diferido, siguiente bloque de valor.
> 4. ✅ **Deuda técnica de runtime RESUELTA**: functions en **Node 22 + firebase-functions v7** (ADR §48). Opcional restante: poblar secrets `VITE_*` en GitHub (el fallback ya cubre).
>
> ⚠️ **Recordatorio de deploy (L-22)**: el CI NO despliega reglas/functions; tras cambiarlas hay que `firebase deploy --only firestore:rules,firestore:indexes,functions` **manual** (CLI logueado). Los scripts Admin SDK necesitan **ADC**, no `firebase login` (L-23); ADC ya configurado local.

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
| TODO-09 | **Fase 3 — CRM**: B1-B5 + editabilidad **✅ CONSTRUIDOS, DESPLEGADOS Y MIGRADOS** (ADR §42–§47). Siguiente: **vendedoras** (faltan correos) + **B6 reportes/atrasados**. Charter `50-ARQUITECTURA §3`+§5. | 🟡 En curso (núcleo en prod ✅) | Vendedoras=correos; B6=nuevo |
| TODO-10 | **Reactivar CI rules-test**: poner `on: [push, pull_request]` en `.github/workflows/firestore-rules-test.yml` (la causa del rojo —bug S6— ya está resuelta). Verifica al pushear. | 🔲 Abierto | A pedido (requiere push) |
| — | `.claude/settings.local.json` sin commitear (permisos del harness). El cliente decide si versionarlo. | ℹ️ info | — |

> ✅ Cerrados y consolidados: **TODO-01 / TODO-02** → ADR §38 (commit `1be38d1`).

---

## 🔮 Contexto estratégico
Programa "Nuevo Bersaglio" (3 fases): **Fase 1** rediseño Liquid Glass ✅ · **Fase 2** hardening (Tier A/B ✅, Tier C pendiente — `docs/41-SEGURIDAD.md`) · **Fase 3** CRM de cuentas por cobrar ✅ **en producción con datos reales** (charter `docs/50-ARQUITECTURA.md`). Service Worker `bersaglio-v9`. Próximo horizonte: vendedoras + reportes/aging + (futuro) inventario/facturación.

---

## 📝 Bitácora (efímera — se vacía al consolidar)
- **2026-06-06 (Mantenimiento — upgrade runtime functions, ADR §48)**: Node 20→22 + firebase-functions 6.6→7.2.5 + firebase-admin 13.7→13.10 en `functions/package.json`. Cero cambios de código (la API v2 no cambió en v7; verificado por release oficial + package instalado + tests). `test:saldo` 12/12 + integración 5/5 con v7. Deploy → 6 functions en nodejs22; smoke test en prod OK (`recalcSaldoCliente` recalcula); 344 clientes intactos. Rama `chore/upgrade-functions-v7-node22` mergeada a Desarrollo. L-25. Deuda Node 20 de §47 resuelta.
- **2026-06-06 (LANZAMIENTO CRM, ADR §47)**: Audit de preparación read-only (workflow 4 agentes) → 3 correcciones al cerebro (`main` ya tenía el CRM; `firebase-deploy.yml` es Hosting-only; `recalcSaldoCliente` no estaba en prod). Deploy manual reglas+índices+functions (`recalcSaldoCliente` viva) + merge vía **PR #189** + ADC (`gcloud auth application-default login` + quota project) + **migración Fase A 345/345 exacto** → se borró 1 fila "TOTAL" basura (L-24) → **344 clientes, cartera $506.510.780**, 12 pendientes. Extractor parchado (`NON_CLIENT_RE`). Sitio HTTP 200. Lecciones L-22/23/24.
- _Historial previo (cerebro v1.0.0, Fase 1 rediseño+pulido, Fase 2 hardening, CRM B1-B5, verificación E2E) ya consolidado en ADRs §37–§46 — ver `00-INDICE`._
