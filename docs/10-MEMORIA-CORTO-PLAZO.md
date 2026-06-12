# ⚡ 10 — MEMORIA A CORTO PLAZO (WIP / Sprint activo)

> **Nodo neuronal: Memoria a Corto Plazo** (auto-carga con `CLAUDE.md` + `05`). Solo lo VIVO:
> foco, pendientes (TODO-NN = ledger único), bitácora efímera. Estado técnico → `05`.
> **Pizarra, no archivo**: al cerrar tarea → ADR en `99` + fila en `00`, lecciones a `30`, podar (GC §G.4).

---

## 🎯 Foco actual

> 🎉 **CRM en producción** (ADR §47/§49): 344 clientes de Kary (cartera $506.510.780), `recalcSaldoCliente` viva, CRM admin-only (vendedoras = entidad de datos). **Panel v2 desplegado**: F-CHASIS-A §50 · Morosos §51 · F5 filtros §52 · F4 Bandeja §53. **Cerebro**: kernel multi-proyecto ADR §56 (v1.1 ×3, cerebros independientes); GC de este repo HECHO 2026-06-09 (comité v6 ítem H).
>
> **▶️ RETOMAR AQUÍ — M3 CONSTRUIDO (ADR §77); falta SOLO el deploy en 2 etapas (§77.7)**:
> - **Hecho 2026-06-12**: Consejo Externo Gemini (4 adoptados / 5 refutados; cota de fecha futura = su hallazgo) · censo 344 docs prod limpio · candado en `firestore.rules` (whitelist+sellos+gates+coincidencia+tabla de anulación) · red-team 16 agentes → **2 bloqueos corregidos** (motivoCategoria UNIÓN; medioPago en reemplazo de abono) · UI forward-compat (motivo/nota top-level; ajustes sin par; cache **v12**) · **133/133 + 44/44 + build**.
> - **ETAPA 1**: PR `Desarrollo→main` → mergea Daniel → verificar `v12` VIVO en prod (sw + APP_VERSION).
> - **ETAPA 2 (solo tras la 1)**: `firebase deploy --only firestore:rules` + **smoke del flujo diario EN PROD el mismo día** (registrar factura/abono de prueba en clienta de ensayo o verificación experta equivalente). Rollback = evento de control (runbook §69-D).
> - **Luego**: M4 auditoría (Salud · cortes mensuales · flags deterministas). Resto (M2c, M5-M7) diferible. NO olvidar TODO-20 (correo del owner) — riesgo activo.
> - **Vivo aparte**: TODO-14 App Check monitor ×7d→Enforce (Daniel, NUNCA antes, L-32) · DIAN PAUSADA (tirilla interna) · Vendedoras fuera de Configuración (ventana M2) · pendientes Daniel/Kary (alertas GCP · kill-switch · firmar contrato · talonarios/arqueo, todo en bóveda).
>
> **Decisiones vivas (Panel v2/morosos)**: plazo 30 días (config) · `fecha` en movimientos (migrados=CUTOFF; sin fecha→ámbar) · VENCIDO día 1 · rangos 1-30/31-60/+60. Norte: spec `2026-06-07-bersaglio-arquitectura-maestra-design.md` v3.
> **Pendiente operativo**: crear vendedoras reales (Daniel/Kary). (El "smoke por Kary" quedó OBSOLETO: la verificación es experta de Claude, no de Kary — [[feedback_claude_experto_verifica]].)
>
> ⚠️ **Deploy (L-22 + L-26)**: reglas/functions = deploy manual mío; sitio + merge a `main` = PR que mergea Daniel (`git fetch` siempre). Admin SDK = ADC (L-23).

---

## 📋 Pendientes abiertos (TODO-NN) — ledger único

| ID | Item | Estado | Bloqueo |
|---|---|---|---|
| TODO-03 | (Opcional) headers de `99` a formato numerado `## NN.` (hoy por fecha, válido) | 🔲 | baja prioridad |
| TODO-04 | (Opcional) anomalías 🔧 en `skills/` (skill-creator anidado; code-simplifier/modernization formatos no-skill) | 🔲 | baja prioridad |
| TODO-07 | **Contenido real**: reseñas Google Maps (Nosotros), Films, feed Redes (`js/data/home-media.js`, `js/pages/nosotros.js`) | 🔲 | cliente entrega datos |
| TODO-08 | **Fase 2 Hardening**: Tier A ✅; pendiente CSP/reglas/claims (Tier B/C) → bóveda `41-SEGURIDAD §1.5` | 🟡 | Tier B = emulador+deploy gated |
| TODO-09 | **Fase M**: tren M0→M3 ✅ EN PROD Y CERRADO (§77.8 — candado operando); **siguiente M4** (auditoría detectiva en Salud + corte mensual inmutable, plan §69) → luego M2c/M5-M7 diferibles + B6 | 🟡 | vigilar 1er día de Kary bajo v12 |
| TODO-14 | **App Check: reparar el registro** (RCA 403 §57.3: llave SECRETA en consola) → ~100% ×7d → enforce | 🟡 | Daniel (consolas, guiado) |
| TODO-17 | **Toda captura → CRM**: contacto→Bandeja ✅; falta newsletter (`addSubscription`→`subscriptions`) en el panel | 🔲 | tras App Check |
| TODO-18 | **Plan operación integral §57**: semana 1 día a día · 9 decisiones de Daniel · compuerta de adopción · campaña cartera (diseño del contador ANTES del piloto) → bóveda | 🟡 | Daniel (decisiones 1-9 + contador) |
| TODO-19 | **RBAC por dependencias/roles granulares** (directiva Daniel 2026-06-11): usuarios administrativo/contable, comercial/asistente de ventas… controlar qué ve y maneja cada uno → `50-ARQUITECTURA §5` | 🔲 | post-Fase M; Decisión Fuerte (matriz de permisos + Consejo) |
| TODO-20 | **Migrar correo del usuario OWNER** al personal de Daniel (hoy = correo de la empresa → riesgo de recuperación de clave por terceros) → bóveda `41-SEGURIDAD §1.7` | 🟡 | Daniel da su correo personal (~15 min guiados) |

> ✅ Cerrados y consolidados (retirados en el GC 2026-06-09): TODO-01/02→§38 · 05→§47 · 06→`e290f83` · **10→§62** (CI reactivado; activo al subir/mergear) · 11→spec §16 · 12→§50 · 13→§51 · **15→§63 (PRE-1 CERRADO: backup+restore PROBADO+copia fuera)** · 16→§55 · settings.local→`e3d390f`.

---

## 🔮 Contexto estratégico
Programa "Nuevo Bersaglio": Fase 1 rediseño ✅ · Fase 2 hardening (Tier A/B ✅, C pendiente) · Fase 3 CRM ✅ en prod · **Fase M (movimientos robustos): M0→M2a ✅ EN PROD; falta M2b→M3→M4** (charter `50-ARQUITECTURA`, plan `fase-m-plan.md`). SW `bersaglio-v10`. Horizonte: M2b/M3 candado + reportes/aging + (futuro) inventario/facturación.

---

## 📝 Bitácora (efímera)

> Podada en el relevo 2026-06-11. Todo consolidado: **ADR §37-§76** (CRM/Fase R/Panel v2/morosos · F6 · Fase M M0→M2b). Detalle de cualquier § → `00-INDICE` → `99`.
>
> **2026-06-11 · M2b construido+verificado** (→ **ADR §76**): decisión SoD de Daniel (owner sin candado, excepción consciente) · cola de aprobación + re-validador puro + batches atómicos · 4 tests de batch en la suite de reglas (104/104) · **verif. experta 16 agentes → 7 fixes** (falso-obsoleta re-valida al click · tarjeta sin contexto sin botones · cadena corregidoPor · cola nunca muda · catch en aprobar · plan M3 enmendado · 05 v11) · CRUDO → bóveda. Lección **L-40**.
> **2026-06-11 (tarde) · M2b CERRADO EN PROD** (→ **§76.8**): PR #226 · guion 5/5 ejecutado por Claude vía Chrome MCP (Daniel solo inició sesión; siembra de fixtures AUTORIZADA por él) · drift PR2 visto EN VIVO (no solo fixture) · auditoría interna 10/10 · limpieza verificada. Herramienta nueva: `functions/seed-guion-m2b.mjs` (preflight/aplicar/verificar/limpiar).
> **2026-06-12 · M3 construido** (→ **ADR §77**): Consejo Gemini → cota de fecha futura adoptada, grace-period refutado · censo prod limpio (`censo-movimientos-m3.mjs`) · candado escrito · red-team 16 agentes → motivoCategoria UNIÓN + medioPago en reemplazo de abono + 5 huecos de suite · 133/133 · directivas de Daniel registradas (TODO-19 RBAC dependencias · TODO-20 correo owner). Falta deploy 2 etapas.
> **2026-06-12 (tarde) · M3 CERRADO EN PROD** (→ **§77.8**): PR #228 → v12 vivo → reglas desplegadas → smoke 4/4 vía navegador (factura·abono·ajuste·anulación, saldos exactos) → auditoría del contract en los asientos → limpieza cero rastro. Herramienta nueva: `functions/limpiar-cliente-prueba.mjs` (candado anti-clienta-real). **TREN M2a+M2b+M3 COMPLETO.**
>
> **2026-06-10/11 · FASE M hasta M2a EN PROD** (consolidado en **ADR §69-§75**): M0-H/M0/M0-C (§70-71) · M1 reglas red-teameadas + desplegadas (§72, atrapó el bug que Daniel reportó) · M2a-1b ensanche `anulacionValida` (§73) · contrato de corrección diseñado+verificado (§74) · UI de corrección de Kary COMPLETA + **verificación experta** (§75, 12 agentes) que atrapó **2 bugs de dinero** → corregidos y CONFIRMADOS vivos en prod (el PR #223 de Daniel había publicado la UI buggy antes). **4 workflows** (2 red-teams, 1 diseño-contrato, 1 verif-UI) → bóveda. Lecciones **L-38/L-39** + L-26 ext. Cache `v10`. Memoria: **Kary NO es verificadora** ([[feedback_claude_experto_verifica]]) · deploy autorizado permanente ([[feedback_claude_deploy_autorizado]]).
> **2026-06-09/10 (previo)** · F6 punta a punta + operación integral → **ADR §57-§68** (App Check · forms · backup · GEMELO · PRE-1 restore · frentes D/B · L-34/L-35/L-36/L-37; política cartera v1 + legales + contrato BORRADOR en bóveda; DIAN pausada).
