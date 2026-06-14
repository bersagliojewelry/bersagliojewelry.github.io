# ⚡ 10 — MEMORIA A CORTO PLAZO (WIP / Sprint activo)

> **Nodo neuronal: Memoria a Corto Plazo** (auto-carga con `CLAUDE.md` + `05`). Solo lo VIVO:
> foco, pendientes (TODO-NN = ledger único), bitácora efímera. Estado técnico → `05`.
> **Pizarra, no archivo**: al cerrar tarea → ADR en `99` + fila en `00`, lecciones a `30`, podar (GC §G.4).

---

## 🎯 Foco actual

> 🎉 **CRM + Fase M (M0→M6) EN PRODUCCIÓN** (ADR §47-§80; 344 clientas, cartera $506.510.780; admin-only, vendedoras=dato; Panel v2). Detalle → `05` + `00-INDICE`→`99`. ⚙️ **OPUS 4.8 interino** (Fable cayó 2026-06-12; marcar todo [OPUS-4.8] · `feedback_opus_interino`).
>
> **▶️ FOCO ACTIVO — CMS WEB PÚBLICA (2026-06-14, urgente · Kary)**: todo el contenido público administrable desde el panel + sync + SEO/UX. **Plan + comité (6 lentes) + modelo de datos + decisión SEO + orden de build + estado por ítem → spec `docs/superpowers/specs/2026-06-14-cms-web-publica-design.md` (§5 + Checklist)** — leerlo al reanudar. Autónomo nocturno. **HECHO**: P0 sync/safeUrl/comité (`47b07b8`/`39983f2`/`wrpym7h3p`) · P1.1 categorías (`d4caaf6`) · **motor CRUD** servicio `createTypedDoc…` (`8b507cb`, pieces/cols = wrappers verdes) + UI `createResourceAdmin` (núcleo puro testeable) + **panel `Contenido web`** de pestañas (`67fc21e`) · **journal E2E**: admin+reglas (emulador 151/151, 144 sin regresión) + público con **fallback baked** + fix bug "eager" (`66dfd04`). Verif: build verde · 197/197 no-emulador · 151/151 reglas. Prod 0 piezas/0 journal → todo baked (sin cambio visible). **▶️ REANUDAR EN**: **P1.2 siteContent/home** — 1er SINGLETON (scaffold ≠ motor-lista: form→`setDoc(merge)`+_version, `getDoc` one-shot NO listener; hero/editorial/services/atelier/cta; registrar pestaña en `contenido-tabs.js`) → P2.x (nosotros/reviews · films/social · footer/sitemap). **Pendientes CMS**: agente `content-section-builder` (`.claude/agents/`, contrato §5) · BLOQ #5 `storage.rules` (assets/ contentType→restringir image/* anti-svg) · #6 `reviews` pieceId↔pieceSlug · journal body inline (sin split §5-F, deferido) + listener journal en toda página (coste ~0; lazy si crece). **Lecciones→`30`**: (a) hook bloquea asignar `.innerHTML` crudo → usar `mount()` (sink html.js); (b) falso positivo del hook con el método exec de RegExp → `String.match()`; (c) núcleo PURO en `-core.js` (sin Firebase/DOM) = testeable en Node. **DEPLOY milestone (pendiente)**: merge Desarrollo→main (Daniel L-26) + `firebase deploy --only firestore:rules` + **cache bump v16→v17** + APP_VERSION. ⚠️ `noindex` soft-launch; flip = Decisión Fuerte gated (council + pre-render híbrido).
>
> **⏸️ EN PAUSA — ACUERDOS R6** (retoma tras el CMS): NO-GO por **1 bug de dinero** (HIGH clamp, bug A8 reproducido: cuotas infladas + abono parcial ocultan mora). 5/6 fixes commiteados (ver git-log `6d127ba`..`e40e004`) + `be342aa` parcial (NO revertir); censo prod limpio; emulador 144/144. **Falta**: clamp `pagado=clamp(D0−deudaCubierta,0,Σcuotas)` con D0=deuda AL PACTO (FIFO pact-time, verdad de servidor) + corregir fixtures (line78) → **Decisión Fuerte / candidato Consejo** (`docs/15`). Detalle: commits + git-blame de este `10`. **Lecciones→`30`**: comité degradado por rate-limit=GO FALSO (re-correr; partial-fail≠"pasó"); re-verificar fixes adversarialmente atrapa fixes incompletos. CRUDOs: tasks/w71voltb9·wh5hsk9is·wno2hr1mj.
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

> Podada (GC) 2026-06-14. Todo consolidado en **ADR §37-§81** (CRM/Fase R/Panel v2/morosos §37-§56 · F6+operación §57-§68 · Fase M M0→M6 §69-§80 · acuerdos v2 R1-R5 §81). Lecciones L-38..L-40. Herramientas Fase M: `seed-guion-m2b.mjs`·`censo-movimientos-m3.mjs`·`limpiar-cliente-prueba.mjs`. Detalle de cualquier § → `00-INDICE`→`99`.
>
> **2026-06-13/14**: R6 acuerdos NO-GO (bug A8 dinero, EN PAUSA) → ver Foco · **pivot CMS web pública** (Kary): sync fix + safeUrl + comité + P1.1 categorías + skill `cms-dinamico` (7 commits `47b07b8`..`d4caaf6`) → ver Foco + spec `2026-06-14-cms-web-publica-design.md`. [OPUS-4.8 interino].
> **2026-06-14 (milestone CMS, autónomo)**: motor CRUD genérico (servicio `8b507cb` + UI `67fc21e`) + panel `Contenido web` (pestañas) + **journal E2E** (admin+reglas 151/151 + público con fallback baked, `66dfd04`). Build verde · 197/197 no-emulador. Deploy del milestone PENDIENTE (merge Daniel + reglas + cache bump) — ver Foco. [OPUS-4.8].
