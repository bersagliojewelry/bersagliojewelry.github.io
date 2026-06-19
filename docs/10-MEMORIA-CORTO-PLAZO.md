# ⚡ 10 — MEMORIA A CORTO PLAZO (WIP / Sprint activo)

> **Nodo neuronal: Memoria a Corto Plazo** (auto-carga con `CLAUDE.md` + `05`). Solo lo VIVO:
> foco, pendientes (TODO-NN = ledger único), bitácora efímera. Estado técnico → `05`.
> **Pizarra, no archivo**: al cerrar tarea → ADR en `99` + fila en `00`, lecciones a `30`, podar (GC §G.4).

---

## 🎯 Foco actual

> 🎉 **CRM + Fase M (M0→M6) EN PRODUCCIÓN** (ADR §47-§82; 344 clientas, cartera→`05`; admin-only, vendedoras=dato; Panel v2). Detalle → `05` + `00-INDICE`→`99`. ⚙️ **OPUS 4.8 interino** (Fable cayó 2026-06-12; marcar todo [OPUS-4.8] · `feedback_opus_interino`).
>
> **▶️ FOCO ACTIVO — CMS WEB PÚBLICA (Kary)**: contenido público editable por formulario con preview fiel. **Specs `docs/superpowers/specs/2026-06-1{4,5}-cms-*` = SSoT** (RCAs, hashes, lecciones, §ESTADO F1/F2 ahí). Decisión iframe = ADR §82 + bóveda. **EN `main`**: journal · P0 · P1+P2 (Home+Contacto editables).
> - **WYSIWYG F1+F2 + fidelidad + sticky ✅ DESPLEGADO** (F1 preview fiel validado por Daniel `f0c7911`; F2 clic-para-editar `04e8769`; fidelidad = viewport-1440-escalado `6bb68ff`; sticky `.adm-layout{100dvh}` `c98978a`). RCAs/detalle → spec. **FALTA validar**: Daniel confirma sticky+tablas en vivo. **Pendiente**: consolidar **ADR WYSIWYG en `99`+`00` + GC**.
> - **P3.5 imagen de portada editable ✅ construido + verificado** (`c6b7ff7`): field-type "imagen" reusable + reuso `optimizeImage`/`uploadAsset`; `hero.js` lee `bgImage` con fallback al `<picture>`; `+avif` en `storage.rules` (arregla bug latente de piezas). Núcleo 9/9. **FALTA: deploy sitio + `firebase deploy --only storage` + Daniel valida la subida.** Detalle → spec §P3.5.
> - **P4 (editor de listas, Nosotros) — IMPLEMENTADO ✅ + REVISADO ✅** (2026-06-19, [OPUS-4.8]; en `Desarrollo` `d20d622`, **sin mergear**). Field-type `list` en el singleton (reuso total) + 8 sub-mapas = whitelist de reglas. Fases 0-4: defaults+renderers+`mergeNosotros` (web idéntica con doc vacío ✓), motor `list` (add/quitar/reordenar+reindex), preview+descriptor+pestaña, **Fase 4 cap de cardinalidad en reglas (`siteListOk` ≤60; `test:rules` 168/168)**. Verif: build · 105 tests puros · **revisión adversarial 9 agentes (0 crít/alto/regresión)** → CRUDO `2026-06-19-cms-p4-review`. Hallazgos low TODOS resueltos: A→Fase 4 · C→arreglado · **B→encabezados de valores/timeline ahora EDITABLES** (Daniel: "hacerlos editables"; aditivo, sin cambio de reglas). Detalle → spec §P4. **▶️ GATE deploy**: 2ª opinión EXTERNA del modelo (Gemini, `docs/15`; SOLO crítica, no edita) + validación manual de Daniel (panel = login) + `firebase deploy --only firestore:rules` (Fase 4) + sitio. **NO mergear `Desarrollo→main` antes del gate.**
> - **SIGUE**: F3 (barandas) · `global` (datos contacto ~5 comp.) · `hideWhenEmpty` · usuarios/SPA P5.
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
| TODO-21 | **Revisión post-Fable de `[OPUS-4.8]`** (H-08): ledger por ADR/§ y riesgo (dinero §81 > seguridad XSS/§65/§66 > CMS §82+ > docs); 46 commits | 🔲 | Fable vuelve |
| TODO-22 | **Gate-de-git en el linter** (H-06): que `brain:check` warne si `05` dice "==main" con commits adelante. Toca kernel ×3 → **lo origina cars-operador** (escritor único, L-31); converge con cars en la pasada Gemini ÚNICA | 🔲 | Gemini (consolida cars) |
| TODO-23 | **Frase canónica del gate de verificación de DINERO** (H-18): Claude experto = gate; Kary = smoke POST-deploy no bloqueante. **Aporte de bersaglio a la pasada Gemini única** (cars consolida + integra) | 🔲 | Gemini (consolida cars) |

> ✅ Cerrados y consolidados (retirados en el GC 2026-06-09): TODO-01/02→§38 · 05→§47 · 06→`e290f83` · **10→§62** (CI reactivado; activo al subir/mergear) · 11→spec §16 · 12→§50 · 13→§51 · **15→§63 (PRE-1 CERRADO: backup+restore PROBADO+copia fuera)** · 16→§55 · settings.local→`e3d390f`.

---

## 🔮 Contexto estratégico
Programa "Nuevo Bersaglio": Fase 1 rediseño ✅ · Fase 2 hardening (Tier A/B ✅, C pendiente) · Fase 3 CRM ✅ en prod · **Fase M: tren M0→M6 ✅ EN PROD** (candado + auditoría + gestiones + acuerdo por deuda) + **ACUERDOS de pago/cuotas R1-R5 construidos (§81), gateados** (charter `50-ARQUITECTURA`, plan `fase-m-plan.md`). SW `bersaglio-v16`. Horizonte: R6 acuerdos → M7 castigo → M2c → reportes/aging B6 → (futuro) inventario/facturación + RBAC/asesor (TODO-19).

---

## 📝 Bitácora (efímera)

> Podada (GC) 2026-06-14. Todo consolidado en **ADR §37-§81** (CRM/Fase R/Panel v2/morosos §37-§56 · F6+operación §57-§68 · Fase M M0→M6 §69-§80 · acuerdos v2 R1-R5 §81). Lecciones L-38..L-40. Herramientas Fase M: `seed-guion-m2b.mjs`·`censo-movimientos-m3.mjs`·`limpiar-cliente-prueba.mjs`. Detalle de cualquier § → `00-INDICE`→`99`.
>
> **2026-06-15**: auto-auditoría Nivel-2 del cerebro (ADR §82; 20 hallazgos, GC de 05/10, `ssotFacts` vivo) · CMS P0/P1/P2 mergeado #243-#246 (→ ADR al cerrar F1). Entradas 13-14 jun consolidadas (§37-§82). [OPUS-4.8].
