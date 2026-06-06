# ⚡ 10 — MEMORIA A CORTO PLAZO (WIP / Sprint activo)

> **Nodo neuronal: Memoria a Corto Plazo.** Junto con `CLAUDE.md` + `docs/05-ESTADO-GLOBAL.md`,
> es de las primeras lecturas de cada sesión (Ignorancia Selectiva, `CLAUDE.md §G`).
> Contiene solo lo vivo: foco actual, pendientes abiertos, bitácora. Estado técnico → `docs/05-ESTADO-GLOBAL.md`.
>
> **Es la pizarra, no el archivo.** Al cerrar una tarea: consolidar a ADR (`docs/99-HISTORIAL-ADR.md`) +
> fila en `docs/00-INDICE.md`, extraer lecciones a `docs/30-LECCIONES.md`, y PODAR esto al foco vivo (GC §G.4).

---

## 🎯 Foco actual
> 🏗️ **Programa "Nuevo Bersaglio" — en Fase 3 (CRM), etapa de DISEÑO APROBADO.**
>
> **Estado por fase:**
> - **Fase 1 (rediseño + pulido)** ✅ desplegada en producción (ADR §40, §41).
> - **Fase 2 (Hardening)**: S1 (⚠️ **revertido** tras incidente prod — fallback de llaves restaurado), S3 (`limit` en listeners), S5+S6 (reglas reseñas/validate) ✅ en el código/desplegadas. **CI rules-test PAUSADO** (auto-run off, falla sin diagnosticar). **Tier C pendiente**: App Check, custom claims (S4), CSP `<meta>`, poblar secrets `VITE_*`. Detalle: `41-SEGURIDAD §1.5`. Cache `v9`.
> - **Fase 3 (CRM)**: **Bloques 1 + 2 CONSTRUIDOS Y VERIFICADOS** ✅ (ADR §42 + §43, 2026-06-06). Backend del núcleo de cuentas por cobrar: rol `vendedora` + RBAC (clientes/movimientos append-only/solicitudes/config) + **CF `recalcSaldoCliente`** (saldo server-side, `functions/saldo.js`). Tests: 57 reglas + 12 saldo (puro) + 5 integración. Diseño: `crm-cuentas-design.md`. Charter: `50-ARQUITECTURA §3`+§5.
>
> **▶️ RETOMAR AQUÍ — Bloque 3 (Panel de Kary, primera UI)**: pantallas admin (estilo oscuro existente) — cartera total + por vendedora, cuentas atrasadas, cumpleaños del mes, **bandeja de correcciones** (aprobar/rechazar `solicitudesCorreccion`), gestión de vendedoras/clientes, **Configuración** (fecha de corte de migración). Spec §7. Reusa componentes admin. Luego Bloques 4-6 (App vendedora responsive → Migración del Excel → Reportes). **Decisión de signo del saldo (ADR §43) está marcada como confirmable por Daniel/Kary.** Tests local: `test:rules`/`test:saldo`/`test:saldo:integration` (JDK 25, `30 §L-12`). NO toca producción hasta merge con OK de Daniel.
>
> **🚫 Pendientes de DATOS (cliente)**: fecha de corte de migración (la configura Kary) + valor correcto de ~7 saldos `#REF!` (confirmar con Daniel/Kary). El Excel de datos está en `.gitignore` (privado, NO al repo).

---

## 📋 Pendientes abiertos (TODO-NN)

| ID | Item | Estado | Bloqueo |
|---|---|---|---|
| TODO-03 | (Opcional) Migrar headers de `99-HISTORIAL` a formato numerado `## NN.` para el offset-drift estricto del linter (hoy convención por fecha, válida y verde). | 🔲 Abierto | Baja prioridad |
| TODO-04 | (Opcional) Limpieza de anomalías 🔧 en `skills/`: cuarentenar `skill-creator/skill-creator/` (anidado redundante); `code-simplifier`/`code-modernization` son formatos subagente/plugin (no skill) — normalizar o dejar documentadas. | 🔲 Abierto | Baja prioridad |
| TODO-05 | Merge `Desarrollo → main` para desplegar a producción (dispara GitHub Pages + Firebase). **Solo a pedido explícito del cliente.** | 🔲 Abierto | A pedido |
| TODO-06 | **Commit del rediseño Fase 1** → commiteado `e290f83` + pusheado `origin/Desarrollo` (verif. 2026-06-05). | ✅ Hecho | — |
| TODO-07 | **Contenido real**: reseñas Google Maps (Nosotros), Films y feed Redes (Meta Graph / TikTok API). Marcado `TODO:` en `js/data/home-media.js` + `js/pages/nosotros.js`. | 🔲 Abierto | Cliente entrega datos/fuentes |
| TODO-08 | **Fase 2 — Hardening**: S1✅(código)+S3✅ aplicados (Tier A); pendiente CSP/reglas/claims (Tier B/C). Backlog+progreso → `docs/41-SEGURIDAD §1.5`. | 🟡 En curso | Tier B reglas = emulador+deploy gated |
| TODO-09 | **Fase 3 — CRM**: **Bloques 1 + 2 ✅ HECHOS** (ADR §42 rol+reglas; §43 CF saldo). Siguiente: **Bloque 3** (Panel Kary, 1ª UI). Charter `50-ARQUITECTURA §3`+§5. `crm-architect`+`ecommerce`. | 🟡 En curso (Bloques 1-2 ✅) | Bloque 3 = UI admin |
| TODO-10 | **Reactivar CI rules-test**: poner `on: [push, pull_request]` en `.github/workflows/firestore-rules-test.yml` (la causa del rojo —bug S6— ya está resuelta). Verifica al pushear. | 🔲 Abierto | A pedido (requiere push) |
| — | `.claude/settings.local.json` sin commitear (permisos del harness). El cliente decide si versionarlo. | ℹ️ info | — |

> ✅ Cerrados y consolidados: **TODO-01 / TODO-02** → ADR §38 (commit `1be38d1`).

---

## 🔮 Contexto estratégico
Programa "Nuevo Bersaglio": **Fase 1 (rediseño mirror Liquid Glass) aplicada** sobre la base NOVO. Service Worker en `bersaglio-v7`. Siguen **Fase 2** (hardening — `docs/41-SEGURIDAD.md`) y **Fase 3** (CRM/facturación/inventario en el admin).

---

## 📝 Bitácora (efímera — se vacía al consolidar)
- **2026-06-05**: 🎨 Programa "Nuevo Bersaglio" — **Fase 1 rediseño mirror COMPLETA** (9 incrementos, build verde). ADR §40 + lóbulo `41-SEGURIDAD` (Fase 2) + spec en `docs/superpowers/specs/`. Lecciones nuevas L-05..L-08 en `30`; corregidas lecciones stale (style.css/0px/Inter→modular/squircles/Manrope). Cache v7. WIP sin commitear (TODO-06).
- **2026-06-05 (retomar sesión)**: Verificado git — Fase 1 `e290f83` commiteada **y pusheada** a `origin/Desarrollo` (0/0); **TODO-06 ✅**. Corrección de frescura: `.env` **no está en git** (`git log --all` vacío, nunca estuvo) → **S1 re-caracterizado** en `41` (🔴→🟠): exposición real = fallback hardcodeado + falta de App Check/restricción de key, no un secreto filtrado.
- **2026-06-05 (Fase 1 pulido — opción A)**: Review visual del rediseño (`npm run dev` + skill `impeccable` + doctrina). Veredicto: rediseño **sólido** (L-08). 3 fixes objetivos aplicados+verificados en vivo: `transition:all`→props (12 spots Fase 1), radii critical-CSS sincronizadas (12 shells), hero `#000`→ink-emerald. Build ✓3.68s, cache **v7→v8**, ADR §41, lecciones L-09/L-10, `43-UX` actualizado (UX-01 ya estaba hecho). Deuda: `transition:all` en carrito/pieza/lista-deseos/admin (otra fase). `.claude/settings.local.json` sigue M.
- **2026-06-05 (Fase 2 — Tier A, "continua")**: Hardening arrancado. Grounding de `41-SEGURIDAD` vs código → 3 correcciones (CI inyecta env ✓; **S8 moot** por GitHub Pages → CSP via `<meta>`; S2 dep. S4). Aplicado+verificado (build verde): **S1** fallback eliminado (env única fuente + guard), **S3** `limit(500)` en listeners pieces/inquiries. Sin cache bump (JS hasheado). Pendiente: Tier A CSP (riesgoso), Tier B reglas S5/S6 (emulador+deploy gated), Tier C S4/S2/S7/App Check (functions/consola/cliente).
- **2026-06-05 (directiva de arquitectura + Tier B inicio)**: El cliente reencuadró el programa → **Fase 3 = RECONSTRUCCIÓN del CRM pensando como arquitecto** (modular, escalable, seguro-por-diseño, cost-aware, cero monolitos; serverless Firebase, NO microservicios). 🧠 Nueva neurona **`docs/50-ARQUITECTURA.md`** (north-star + charter) creada y cableada (§0, `00`, §3.6 pend.). Validación skills: `crm-architect`+`ecommerce`+`security-review` bastan (sin skill nueva). ⚠️ Dominio a confirmar (Bersaglio joyería; AltorraCars = dev). Tier B: **S5** escrita en `firestore.rules` (reseñas approved); ⚠️ **bloqueo**: emulador Firestore necesita **Java (JDK) no instalado** → testing por CI (runner con Java) / JDK local / Console Rules Playground. Deploy sigue gated.
- **2026-06-05 (Tier B — harness CI)**: Cliente eligió **CI rules-tests**. Construido: `@firebase/rules-unit-testing` (devDep ^5.0.1) + `tests/firestore-rules.test.mjs` (S5 + baseline pieces) + `.github/workflows/firestore-rules-test.yml` (setup-java + `emulators:exec`) + scripts `test:rules`. Verificado local: install OK + `node --check` OK; el run real es en **CI** (sin Java local). Falta: **S6** (validate — necesita schema de piece/collection) + **push** para ver CI green. Lección L-12.
- **2026-06-05 (Tier B COMPLETO — S6)**: S6 en `firestore.rules` — `validate` **tolerante a merge** (pieces: name+code obligatorios en create, tipos-si-presente en update; collections: name) + 6 tests nuevos (incl. patch parcial de imágenes = flujo crítico admin). Esquemas leídos de `js/admin/{piezas,colecciones}.js`. `node --check` OK; reglas se verifican en CI. **Tier B (reglas S5+S6) LISTO**. Queda Tier C (S4 claims, S2 storage, S7, App Check, CSP). Lección L-13.
- **2026-06-05 (dominio Fase 3 confirmado)**: El cliente confirmó que **Bersaglio SÍ lleva CRM + facturación** (esta web) → charter `50-ARQUITECTURA` válido. El commit `8249f19` quedó con mensaje de otro proyecto (AltorraCars lleva varias webs a la vez) pero su contenido son los 14 de Bersaglio (Fase 2/CI/cerebro), ya pusheado a `origin/Desarrollo`. Solo el mensaje quedó cruzado (cosmético).
- **2026-06-06 (INCIDENTE PROD + hotfix)**: Tras el merge a main, el sitio quedó **caído** (todas las páginas atascadas en "Cargando", botones muertos). Causa: **S1** — quité el fallback de llaves Firebase confiando en secrets `VITE_*` que **no estaban configurados** en GitHub → build sin llaves → Firebase no arranca → boot muere. **Hotfix**: fallback público **restaurado** en `firebase-config.js` (build verde); el sitio revive al re-desplegar (merge a main). Lección **L-14**. Además: **CI rules-test pausado** (auto-run off) porque falla sin diagnosticar (sin log del step / sin Java local) — depurar después. Pendiente: poblar secrets `VITE_*` en GitHub (opcional, el fallback ya cubre).
- **2026-06-06 (Fase 3 — análisis del Kardex)**: El cliente entregó su Excel real (`NUEVO KARDEX KARY DEL 2026....xlsx`). Análisis exhaustivo (openpyxl, 6 hojas) → es un **libro de cuentas por cobrar/fiado** (cuenta corriente mensual por cliente y por vendedora; saldo = inicial + Σfacturas − Σabonos). Problemas: fórmulas frágiles (32 `#REF!` = info perdida), datos no estructurados, hojas por año inconsistentes, sin respaldo. Doc: `docs/superpowers/specs/2026-06-06-kardex-analisis.md`. Define el **núcleo del CRM**. Brainstorming de Fase 3 en curso (pausado para este análisis).
- **2026-06-06 (Fase 3 — diseño aprobado + plan Bloque 1)**: Brainstorming completo → **spec del núcleo APROBADO** por Daniel (`crm-cuentas-design.md`): roles Daniel(owner)/Kary(admin)/vendedoras(append-only, scoped, responsive), saldo por Cloud Function, flujo de corrección con autorización, migración configurable por Kary, **web como canal** (datos compartidos: productos=`pieces`). Ajustes: vendedoras responsive (no solo móvil); precisión exacta "no asumir" (memoria). 🔒 Seguridad: repo es **PÚBLICO** → Excel a `.gitignore` (`*.xlsx/xls/csv`), análisis **anonimizado**, lección **L-15**. **Plan Bloque 1 (Fundamentos) escrito** (`docs/superpowers/plans/`). Pendiente: ejecutar (construir) con Java para tests. Pendiente: elegir A (review visual) / B (hardening) / C (spec CRM).
- **2026-06-06 (Fase 3 — Bloque 2 CONSTRUIDO)**: CF de saldo. `functions/saldo.js` (función pura `computeSaldo`) + trigger `recalcSaldoCliente` (`onDocumentWritten` movimientos → transacción → `saldoActual`, Admin SDK = única escritura). Regla `monto`: apertura/ajuste admiten negativo (saldo a favor / ajuste a la baja). **Modelo de signo** (factura/apertura/ajuste suman; abono resta; +debe/−a favor) → ADR §43, **confirmable por Daniel/Kary**. Verificado: `test:saldo` 12/12 (puro) + `test:rules` 57/57 + `test:saldo:integration` 5/5 (emuladores). Build ✓2.96s. Sin cache bump. ADR §43. Cerebro alimentado. Siguiente: Bloque 3 (Panel Kary, UI).
- **2026-06-06 (Fase 3 — Bloque 1 CONSTRUIDO)**: Ejecutado el plan (skill `executing-plans`, TDD). Hallazgos: (1) **Java SÍ estaba** local (Temurin 25, solo faltaba `JAVA_HOME` → L-12 corregida); (2) el "fallo de CI sin diagnosticar" eran 3 tests S5/S6 rojos por el bug `d.campo==null` (acceder a campo ausente LANZA en reglas → L-13 tenía el hecho al revés, corregida). Fix S6 + Tareas 1-6: rol `vendedora` (functions) + reglas clientes/movimientos(append-only)/solicitudes/config. **Revisión adversarial** (workflow 4 lentes) → 7 huecos reales corregidos (anulado-en-create, tipo por rol, `hasOnly`, auto-aprobación, multi-tenant, cliente directo, config pública). **54/54 tests verde** + build ✓2.90s. Sin cache bump (no se tocó shell). ADR §42. Cerebro alimentado (05/20/30/41/50/99/00). WIP sin commitear (mensajes de commit listos para Daniel). Siguiente: Bloque 2 (CF saldo).
- **(previo) 2026-06-05**: Cerebro v1.0.0 instalado/curado/auditado (ADR §37-§39, pusheado `origin/Desarrollo`). Ya consolidado.
