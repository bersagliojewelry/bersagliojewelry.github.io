# ⚡ 10 — MEMORIA A CORTO PLAZO (WIP / Sprint activo)

> **Nodo neuronal: Memoria a Corto Plazo** (auto-carga con `CLAUDE.md` + `05`). Solo lo VIVO:
> foco, pendientes (TODO-NN = ledger único), bitácora efímera. Estado técnico → `05`.
> **Pizarra, no archivo**: al cerrar tarea → ADR en `99` + fila en `00`, lecciones a `30`, podar (GC §G.4).

---

## 🎯 Foco actual

> 🎉 **CRM + Fase M (M0→M6) EN PRODUCCIÓN** (ADR §47-§80; 344 clientas, cartera $506.510.780; admin-only, vendedoras=dato; Panel v2). Detalle → `05` + `00-INDICE`→`99`. ⚙️ **OPUS 4.8 interino** (Fable cayó 2026-06-12; marcar todo [OPUS-4.8] · `feedback_opus_interino`).
>
> **▶️ FOCO ACTIVO — CMS WEB PÚBLICA (Kary, urgente)**: todo el contenido público administrable desde el panel + SEO/UX. **Specs (leer al reanudar)**: `2026-06-14-cms-web-publica-design.md` (P0-P1.3, estado por ítem en su Checklist) + **`2026-06-14-cms-gran-plan-dinamismo-design.md`** (gran plan: modelo 2-formas, **builder recortado 10× por FORMULARIO** no lienzo, no-demo, SPA/SSR, roadmap P0→P5; **consejo externo Gemini INTEGRADO**: SSG build-bake+auto-rebuild = sustrato SEO/0-lecturas-runtime · CSP estricta vía `<meta>` (tarea: auditar inline-scripts) · storage rule claim ROL · flujo invitación P5; REFUTADO "DOMPurify siempre"). Deliberaciones → bóveda (`2026-06-14-comite/consejo-*`). **HECHO** (rama Desarrollo, SIN desplegar): motor CRUD (servicio+UI) + panel Contenido web + **journal E2E** (`8b507cb`/`67fc21e`/`66dfd04`) · **P0** bloqueantes B1/B2/B4/B5 (`c257dca`) · **B3-categorías** no-demo (`9f8c86f`) · **P1 base** siteContent servicio+reglas (`c98f77d`). Verif: build verde · 197/197 no-emulador · **160/160 reglas**. Prod 0 piezas/0 journal → baked (sin cambio visible). **▶️ REANUDAR EN P1 (UI)**: scaffold NUEVO de SINGLETON (form→`setDoc(merge)` via `saveSiteContent`, `getDoc` cacheado NO onSnapshot) + admin `siteContent/home` (hero+editorial; pestaña en `contenido-tabs.js`) + público con fallback al hardcode + UNDO ("restaurar versión" del audit log) + `hideWhenEmpty` en el modelo. (**P0.5 SEED** = coordinado con Daniel, escribe a prod vía Admin SDK · **B3 films/social** = P3.) **Lecciones→`30`**: `.innerHTML`→`mount()` · falso positivo hook con exec de RegExp→`String.match()` · núcleo PURO `-core.js` · `singleton=getDoc cacheado / lista=colección lazy` (Spark). **DEPLOY journal+P0 pendiente**: merge Daniel (L-26) + `firebase deploy --only firestore:rules,storage` (B1+B5) + cache bump v16→v17.
>
> **⏸️ EN PAUSA — ACUERDOS R6** (retoma tras el CMS): NO-GO por **1 bug de dinero** (clamp, bug A8: cuotas infladas + abono parcial ocultan mora). 5/6 fixes (`6d127ba`..`e40e004`) + `be342aa` parcial (NO revertir); censo limpio; emulador 144/144. **Falta**: clamp `pagado=clamp(D0−deudaCubierta,0,Σcuotas)`, D0=deuda AL PACTO (FIFO pact-time) + fixtures (line78) → **Decisión Fuerte/Consejo** (`docs/15`). Lección→`30`: comité degradado por rate-limit=GO falso (re-correr); re-verificar fixes adversarialmente. Detalle: git-blame + CRUDOs bóveda (`w71voltb9·wh5hsk9is·wno2hr1mj`).
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
