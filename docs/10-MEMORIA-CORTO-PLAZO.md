# ⚡ 10 — MEMORIA A CORTO PLAZO (WIP / Sprint activo)

> **Nodo neuronal: Memoria a Corto Plazo** (auto-carga con `CLAUDE.md` + `05`). Solo lo VIVO:
> foco, pendientes (TODO-NN = ledger único), bitácora efímera. Estado técnico → `05`.
> **Pizarra, no archivo**: al cerrar tarea → ADR en `99` + fila en `00`, lecciones a `30`, podar (GC §G.4).

---

## 🎯 Foco actual

> 🎉 **CRM en producción** (ADR §47/§49): 344 clientes de Kary (cartera $506.510.780), `recalcSaldoCliente` viva, CRM admin-only (vendedoras = entidad de datos). **Panel v2 desplegado**: F-CHASIS-A §50 · Morosos §51 · F5 filtros §52 · F4 Bandeja §53. **Cerebro**: kernel multi-proyecto ADR §56 (v1.1 ×3, cerebros independientes); GC de este repo HECHO 2026-06-09 (comité v6 ítem H).
>
> **▶️ RETOMAR AQUÍ — FASE M, construir M2b** (tren M2a✅→**M2b**→M3; plan+enmiendas → bóveda `fase-m-plan.md` L80-87, backlog L174+):
> - **M2b = superficie de aprobación de Daniel** (owner-only): cola de solicitudes pendientes (vía `onSolicitudesChange`/collectionGroup, ya existe) con tarjeta de contexto (clienta · tipo · monto=delta · motivo · nota · asiento original enlazado · mora · saldo ANTES→DESPUÉS recomputado al render · ⚠️ "el saldo cambió desde que Kary pidió" si difiere de `saldoAlSolicitar`); aprobar/rechazar POR solicitud (sin "aprobar todo"); al APROBAR = `writeBatch` de Daniel (3 escrituras: anular original + crear reemplazo `registradoPor=Daniel`+`solicitudId` + solicitud→aprobada) o 2 (solicitud ajuste simple). **Contrato YA DISEÑADO Y VERIFICADO (ADR §74)**: `monto`=delta neto, `datosCorreccion`={reemplazo,snapshotOriginal,motivoCategoria}. **M2b RE-VALIDA, NUNCA confía en datosCorreccion** (re-lee el original: vigente, tipo coincide, no mutado vs snapshot, delta coherente vía `efectoSaldo` IMPORTADO). Guion de verificación CON DANIEL → `fase-m-plan.md` L87.
> - **DECISIÓN DE DANIEL al iniciar M2b** (backlog §72/§74 en `fase-m-plan.md` L174+): (1) **SoD del owner** — ¿el owner puede auto-aprobar su solicitud? (a) candado `solicitadoPor!=uid` o (b) excepción consciente (riesgo bajo, ya puede ajustar directo). (2) 3 diferidos: cuando M3 ponga `hasOnly` en `movimientoValido`, whitelistar `correccionDe`+`solicitudId`+`medioPago`; M2b genera `solicitudId` server-side; M2b importa `efectoSaldo`. **Verificación experta ANTES de pushear UI de dinero a `Desarrollo`** (L-26 ext: Daniel puede mergear antes de los fixes).
> - **Luego**: M3 candado (reglas RESTRICTIVAS; **Consejo Externo Gemini ANTES** — `15`); M4 auditoría. Resto Fase M (M2c pulido, M5-M7) diferible.
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
| TODO-09 | **Fase M** (movimientos robustos): M0→M2a ✅ EN PROD; **siguiente M2b** (superficie Daniel) → M3 candado → M4 auditoría + B6 reportes/atrasados | 🟡 | M2b = construir (contrato §74 listo) |
| TODO-14 | **App Check: reparar el registro** (RCA 403 §57.3: llave SECRETA en consola) → ~100% ×7d → enforce | 🟡 | Daniel (consolas, guiado) |
| TODO-17 | **Toda captura → CRM**: contacto→Bandeja ✅; falta newsletter (`addSubscription`→`subscriptions`) en el panel | 🔲 | tras App Check |
| TODO-18 | **Plan operación integral §57**: semana 1 día a día · 9 decisiones de Daniel · compuerta de adopción · campaña cartera (diseño del contador ANTES del piloto) → bóveda | 🟡 | Daniel (decisiones 1-9 + contador) |

> ✅ Cerrados y consolidados (retirados en el GC 2026-06-09): TODO-01/02→§38 · 05→§47 · 06→`e290f83` · **10→§62** (CI reactivado; activo al subir/mergear) · 11→spec §16 · 12→§50 · 13→§51 · **15→§63 (PRE-1 CERRADO: backup+restore PROBADO+copia fuera)** · 16→§55 · settings.local→`e3d390f`.

---

## 🔮 Contexto estratégico
Programa "Nuevo Bersaglio": Fase 1 rediseño ✅ · Fase 2 hardening (Tier A/B ✅, C pendiente) · Fase 3 CRM ✅ en prod · **Fase M (movimientos robustos): M0→M2a ✅ EN PROD; falta M2b→M3→M4** (charter `50-ARQUITECTURA`, plan `fase-m-plan.md`). SW `bersaglio-v10`. Horizonte: M2b/M3 candado + reportes/aging + (futuro) inventario/facturación.

---

## 📝 Bitácora (efímera)

> Podada en el relevo 2026-06-11. Todo consolidado: **ADR §37-§75** (CRM/Fase R/Panel v2/morosos · F6 · Fase M M0→M2a). Detalle de cualquier § → `00-INDICE` → `99`.
>
> **2026-06-10/11 · FASE M hasta M2a EN PROD** (consolidado en **ADR §69-§75**): M0-H/M0/M0-C (§70-71) · M1 reglas red-teameadas + desplegadas (§72, atrapó el bug que Daniel reportó) · M2a-1b ensanche `anulacionValida` (§73) · contrato de corrección diseñado+verificado (§74) · UI de corrección de Kary COMPLETA + **verificación experta** (§75, 12 agentes) que atrapó **2 bugs de dinero** → corregidos y CONFIRMADOS vivos en prod (el PR #223 de Daniel había publicado la UI buggy antes). **4 workflows** (2 red-teams, 1 diseño-contrato, 1 verif-UI) → bóveda. Lecciones **L-38/L-39** + L-26 ext. Cache `v10`. Memoria: **Kary NO es verificadora** ([[feedback_claude_experto_verifica]]) · deploy autorizado permanente ([[feedback_claude_deploy_autorizado]]).
> **2026-06-09/10 (previo)** · F6 punta a punta + operación integral → **ADR §57-§68** (App Check · forms · backup · GEMELO · PRE-1 restore · frentes D/B · L-34/L-35/L-36/L-37; política cartera v1 + legales + contrato BORRADOR en bóveda; DIAN pausada).
