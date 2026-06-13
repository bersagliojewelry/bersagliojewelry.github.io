# ⚡ 10 — MEMORIA A CORTO PLAZO (WIP / Sprint activo)

> **Nodo neuronal: Memoria a Corto Plazo** (auto-carga con `CLAUDE.md` + `05`). Solo lo VIVO:
> foco, pendientes (TODO-NN = ledger único), bitácora efímera. Estado técnico → `05`.
> **Pizarra, no archivo**: al cerrar tarea → ADR en `99` + fila en `00`, lecciones a `30`, podar (GC §G.4).

---

## 🎯 Foco actual

> 🎉 **CRM en producción** (ADR §47/§49): 344 clientes de Kary (cartera $506.510.780), `recalcSaldoCliente` viva, CRM admin-only (vendedoras = entidad de datos). **Panel v2 desplegado**: F-CHASIS-A §50 · Morosos §51 · F5 filtros §52 · F4 Bandeja §53. **Cerebro**: kernel multi-proyecto ADR §56 (v1.1 ×3, cerebros independientes); GC de este repo HECHO 2026-06-09 (comité v6 ítem H).
>
> **⚙️ MODELO INTERINO: Fable 5 NO disponible (2026-06-12) → se trabaja con OPUS 4.8, marcando todo lo de Opus para revisión de Fable** (memoria `feedback_opus_interino`; footer `Co-Authored-By: Claude Opus 4.8`).
>
> **▶️ RETOMAR AQUÍ — ACUERDOS DE PAGO R6: comité adversarial pre-deploy = NO-GO → ronda de fixes EN CURSO (2026-06-13)**. R1-R5 está en `main` (PR #239, Pages ya lo sirve) pero GATEADO/INERTE (`acuerdosActivos` OFF). Antes de encender corrí el comité POR HITO (8 dimensiones). ⚠️ **2 corridas**: la 1ª se DEGRADÓ por rate-limit del server (15 agentes caídos, incl. 2 dimensiones de dinero) y dio un **GO FALSO** → re-corrida completa (`resumeFromRunId`) = **NO-GO** (lección meta: corrida degradada = hallazgos NO verificados, NUNCA "pasó"; re-correr antes de confiar). Emulador reglas **144/144** ✅ (lo corrí yo; Java 25 OK).
> - **Hallazgos**: 🔴 BLOCKER — el corte (`corte.js`) no gateaba `acuerdosActivos` → con la bandera OFF un acuerdo metido por consola (Admin SDK salta el mutex) contaminaría la evidencia DIAN. 🟠 HIGH — clamp `pagado` fantasma (cuotas infladas sobre la deuda ocultan mora). 🟡 mediums + 🔵 lows.
> - **FIXES HECHOS+COMMITEADOS** (`Desarrollo`, [OPUS-4.8]; cada uno con test + build/196 suites verdes): HIGH clamp acotado por reducción FIFO probada → `be342aa` · BLOCKER gate del corte + knob → `6d127ba` · MEDIUM knob en panel (cuentas/cuenta/auditoria) → `bff9972` · MEDIUM `acuerdosLargos` por movId cubierto (no clienta) + test → `8fd7ca3` · LOW botón owner "Cancelar acuerdo" + guard `onLine` → `c7dd7ca` · LOW test paridad conductual con acuerdos → `3cb5970` · script de encendido TIPADO + censo (`functions/encender-acuerdos.mjs`) + ignore functions → `e40e004`. **CENSO de prod = LIMPIO (0 acuerdos, 0 vigentes)** ✅. Emulador reglas 144/144 (reglas sin cambios). **Gap menor diferido**: `acuerdoAlCorte` para plan honrado (`deudaCubierta≤0`; opcional, el doc del acuerdo queda como evidencia colateral).
> - **EN CURSO**: re-verificación adversarial de los fixes (comité 6 dims + red-team fresco, bg `wno2hr1mj`). **RESTAN tras eso**: consolidar ADR §81.9 (cierre) + lección L-XX (comité degradado por rate-limit = GO FALSO → re-correr; partial-fail = NO verificado, nunca "pasó") + archivar CRUDOs a bóveda + actualizar 05; luego **R6 con Daniel**: merge Desarrollo→main (Pages; admin-cuenta.html network-first + JS rehasheado por Vite → SIN bump SW) + `firebase deploy --only firestore:rules,firestore:indexes,functions` (`git fetch` L-26) + `node functions/encender-acuerdos.mjs --aplicar` + prueba en vivo en el navegador de Daniel (owner).
> - **CRUDO comité (archivar a bóveda antes de cerrar §81.9)**: `…/tasks/w71voltb9.output` (1ra, GO falso) + `…/tasks/wh5hsk9is.output` (completa, NO-GO, 15 confirmados) + re-verif `wno2hr1mj`. ⚙️ todo [OPUS-4.8] interino. Detalle → ADR §81.
> - **Vigilancia M4**: 1er corte real = **1 de julio 03:50 Bogotá** → verificar `cortes/2026-06` (respaldo: `generarCorte`).
> - **Deferido al PRÓXIMO deploy de reglas** (verif. M5): `size()` en `nota`/`soporte` de `gestionValida` + hermanos (`solicitudValida`, `asientoValido`).
> - **Siguiente aparte**: M7 (necesita gestiones acumuladas) · M2c pulido · B6 reportes · TODO-19 RBAC.
> - **Vivo aparte**: TODO-20 correo del owner (riesgo activo) · TODO-14 App Check ×7d→Enforce (Daniel, L-32) · DIAN PAUSADA · Vendedoras fuera de Configuración · pendientes Daniel/Kary en bóveda.
>
> **Decisiones vivas (Panel v2/morosos)**: plazo 30 días (config) · `fecha` en movimientos (migrados=CUTOFF; sin fecha→ámbar) · VENCIDO día 1 · rangos 1-30/31-60/+60. Norte: spec `2026-06-07-bersaglio-arquitectura-maestra-design.md` v3.
> **Pendiente operativo**: crear vendedoras reales (Daniel/Kary).
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
| TODO-09 | **Fase M**: tren M0→M6 ✅ EN PROD (§78-§80; 1er corte real 1 jul) · **ACUERDOS de pago R1-R5 construidos (§81), GATEADO/inerte — falta R6** (deploy+bandera+verif. por hito). Restan luego: M7 (necesita gestiones acumuladas) · M2c (pulido) + B6 · ASESOR/RBAC (TODO-19). **Kary prueba TODO al final; verif. POR HITO = experta de Claude** | 🟡 | R6 de acuerdos (deploy mío) |
| TODO-14 | **App Check: reparar el registro** (RCA 403 §57.3: llave SECRETA en consola) → ~100% ×7d → enforce | 🟡 | Daniel (consolas, guiado) |
| TODO-17 | **Toda captura → CRM**: contacto→Bandeja ✅; falta newsletter (`addSubscription`→`subscriptions`) en el panel | 🔲 | tras App Check |
| TODO-18 | **Plan operación integral §57**: semana 1 día a día · 9 decisiones de Daniel · compuerta de adopción · campaña cartera (diseño del contador ANTES del piloto) → bóveda | 🟡 | Daniel (decisiones 1-9 + contador) |
| TODO-19 | **RBAC por dependencias/roles granulares** (directiva Daniel 2026-06-11): usuarios administrativo/contable, comercial/asistente de ventas… controlar qué ve y maneja cada uno → `50-ARQUITECTURA §5` | 🔲 | post-Fase M; Decisión Fuerte (matriz de permisos + Consejo) |
| TODO-20 | **Migrar correo del usuario OWNER** al personal de Daniel (hoy = correo de la empresa → riesgo de recuperación de clave por terceros) → bóveda `41-SEGURIDAD §1.7` | 🟡 | Daniel da su correo personal (~15 min guiados) |

> ✅ Cerrados y consolidados (retirados en el GC 2026-06-09): TODO-01/02→§38 · 05→§47 · 06→`e290f83` · **10→§62** (CI reactivado; activo al subir/mergear) · 11→spec §16 · 12→§50 · 13→§51 · **15→§63 (PRE-1 CERRADO: backup+restore PROBADO+copia fuera)** · 16→§55 · settings.local→`e3d390f`.

---

## 🔮 Contexto estratégico
Programa "Nuevo Bersaglio": Fase 1 rediseño ✅ · Fase 2 hardening (Tier A/B ✅, C pendiente) · Fase 3 CRM ✅ en prod · **Fase M: tren M0→M6 ✅ EN PROD** (candado + auditoría + gestiones + acuerdo por deuda) + **ACUERDOS de pago/cuotas R1-R5 construidos (§81), gateados** (charter `50-ARQUITECTURA`, plan `fase-m-plan.md`). SW `bersaglio-v16`. Horizonte: R6 acuerdos → M7 castigo → M2c → reportes/aging B6 → (futuro) inventario/facturación + RBAC/asesor (TODO-19).

---

## 📝 Bitácora (efímera)

> Podada (GC) 2026-06-12. Todo consolidado: **ADR §37-§77** — CRM/Fase R/Panel v2/morosos (§37-§56) · F6 + operación integral (§57-§68) · **Fase M completa hasta el candado: M0→M2a (§69-§75) · M2b (§76, guion 5/5 en prod) · M3 (§77, Consejo Gemini + red-team + smoke 4/4)**. Lecciones L-38/L-39/L-40. Herramientas: `seed-guion-m2b.mjs` · `censo-movimientos-m3.mjs` · `limpiar-cliente-prueba.mjs`. Detalle de cualquier § → `00-INDICE` → `99`.
>
> **2026-06-12 · M4/M5/M6 construidos+CERRADOS EN PROD** → ADR §78/§79/§80 (auditoría detectiva · gestiones de cobro · acuerdo por deuda; PRs #232/#233/#234; cada uno con verif. experta + CRUDO en bóveda). 1er corte real = 1 jul (Daniel dijo "después lo vemos" al `/schedule`).
> **2026-06-12 · ACUERDOS de pago: diseño v2 (Consejo Gemini demolió la v1) + build R1-R5** → **ADR §81** (mutex/saldo/escudo/`acuerdoAlCorte`; rules 144/144; PR #239). **OPUS 4.8 interino** (Fable cayó; R1-R5 marcados para revisión). GATEADO/inerte. **Falta R6** (deploy+bandera+verif. por hito) → retoma en §81.8 / `Foco actual`.
