# ⚡ 10 — MEMORIA A CORTO PLAZO (WIP / Sprint activo)

> **Nodo neuronal: Memoria a Corto Plazo** (auto-carga con `CLAUDE.md` + `05`). Solo lo VIVO:
> foco, pendientes (TODO-NN = ledger único), bitácora efímera. Estado técnico → `05`.
> **Pizarra, no archivo**: al cerrar tarea → ADR en `99` + fila en `00`, lecciones a `30`, podar (GC §G.4).

---

## 🎯 Foco actual

> 🎉 **CRM + Fase M (M0→M6) EN PRODUCCIÓN** (ADR §47-§82; 344 clientas, cartera→`05`; admin-only, vendedoras=dato; Panel v2). ⚙️ **OPUS 4.8 interino** (Fable cayó 2026-06-12; marcar [OPUS-4.8] · `feedback_opus_interino`).
>
> **🔄 RESET A CERO** (Daniel 2026-06-20): Kary recarga TODO de cero; cartera/clientes se vacían (344/$506M desechable → bajan urgencias de dinero). TODO-24 índice cero-ficción ✅ (§88) en prod.
>
> **ACUERDOS R6 / bug A8 resuelto** (§87, gated; encender=Daniel, baja urgencia por reset). **SIGUE**: `hideWhenEmpty` general · RBAC usuarios/SPA (TODO-19). **Aparte (menor urgencia)**: M4 1er corte 1-jul · M5 `size()` deferido · M7/M2c/B6 (TODO-09) · TODO-14/20 · DIAN pausada · vendedoras reales (Kary).
> - ⚠️ **Deploy** (L-22/L-26/L-23): reglas/functions = manual mío; sitio+merge a `main` = PR de Daniel (`git fetch` siempre); Admin SDK = ADC. Norte: spec maestra v3.

---

## 📋 Pendientes abiertos (TODO-NN) — ledger único

| ID | Item | Estado | Bloqueo |
|---|---|---|---|
| TODO-03 | (Opcional) headers de `99` a formato numerado `## NN.` (hoy por fecha, válido) | 🔲 | baja prioridad |
| TODO-04 | (Opcional) anomalías 🔧 en `skills/` (skill-creator anidado; code-simplifier/modernization formatos no-skill) | 🔲 | baja prioridad |
| TODO-07 | **Contenido real**: reseñas Google Maps (Nosotros), Films, feed Redes (`js/data/home-media.js`, `js/pages/nosotros.js`) | 🔲 | cliente entrega datos |
| TODO-08 | **Fase 2 Hardening**: Tier A ✅; pendiente CSP/reglas/claims (Tier B/C) → bóveda `41-SEGURIDAD §1.5` | 🟡 | Tier B = emulador+deploy gated |
| TODO-09 | **Fase M**: tren M0→M6 ✅ EN PROD (§78-§80; 1er corte real 1 jul) · **ACUERDOS R1-R5 (§81) + bug A8 RESUELTO (§87, red-team 0 hallazgos)**, GATEADO/inerte — **encender = Daniel** (deploy+bandera+`encender-acuerdos.mjs`+prueba; baja urgencia por reset-a-cero). Restan luego: M7 · M2c + B6 · ASESOR/RBAC (TODO-19) · complemento menor `Σcuotas>saldoAlPactar`. **Kary prueba TODO al final; verif. POR HITO = experta de Claude** | 🟡 | encender R6 (Daniel, baja urgencia) |
| TODO-14 | **App Check: reparar el registro** (RCA 403 §57.3: llave SECRETA en consola) → ~100% ×7d → enforce | 🟡 | Daniel (consolas, guiado) |
| TODO-17 | **Toda captura → CRM**: contacto→Bandeja ✅; falta newsletter (`addSubscription`→`subscriptions`) en el panel | 🔲 | tras App Check |
| TODO-18 | **Plan operación integral §57**: semana 1 día a día · 9 decisiones de Daniel · compuerta de adopción · campaña cartera (diseño del contador ANTES del piloto) → bóveda | 🟡 | Daniel (decisiones 1-9 + contador) |
| TODO-19 | **RBAC por dependencias/roles granulares** (directiva Daniel 2026-06-11): usuarios administrativo/contable, comercial/asistente de ventas… controlar qué ve y maneja cada uno → `50-ARQUITECTURA §5` | 🔲 | post-Fase M; Decisión Fuerte (matriz de permisos + Consejo) |
| TODO-20 | **Migrar correo del usuario OWNER** al personal de Daniel (hoy = correo de la empresa → riesgo de recuperación de clave por terceros) → bóveda `41-SEGURIDAD §1.7` | 🟡 | Daniel da su correo personal (~15 min guiados) |
| TODO-21 | **Revisión post-Fable de `[OPUS-4.8]`** (H-08): ledger por ADR/§ y riesgo (dinero §81 > seguridad XSS/§65/§66 > CMS §82+ > docs); 46 commits | 🔲 | Fable vuelve |
| TODO-22 | **Gate-de-git en el linter** (H-06): que `brain:check` warne si `05` dice "==main" con commits adelante. Toca kernel ×3 → **lo origina cars-operador** (escritor único, L-31); converge con cars en la pasada Gemini ÚNICA | 🔲 | Gemini (consolida cars) |
| TODO-23 | **Frase canónica del gate de verificación de DINERO** (H-18): Claude experto = gate; Kary = smoke POST-deploy no bloqueante. **Aporte de bersaglio a la pasada Gemini única** (cars consolida + integra) | 🔲 | Gemini (consolida cars) |
| TODO-28 | **Correcciones web** (Daniel 2026-06-21; recon 7 ag. en bóveda). **F1✅ F2-público✅ F3✅** (`efeb13c`·`69b3a94`·`ce0175f`) · **F4 perf ✅ §93** · **fuentes ✅ §94** · **F5 ✅ §95** · **F2 colas mudas CRM ✅ §98** (`856f913`: 18 listeners → `subscribeWithRetry` robusto en `core/live-query.js`). **Pend.**: **arranque C1** (decisión Daniel) · responsive fino device-driven. | 🟡 | C1 (Daniel) + responsive |
| TODO-29 | **Aporte a la pasada cars (kernel)** (auditoría §97/HA-02): que `brain-check.mjs` lea las definiciones `### L-NN` de `3*-LECCIONES*.md` (no solo `30`) → habilita shard REAL de lecciones sin stub-header en `30` (hoy workaround M-06/§96). Va junto a TODO-22 (gate-git) + TODO-23. Cambio de kernel = cars-operador (L-31), NO unilateral. | 🔲 | cars-operador (kernel) |

> ✅ Cerrados y consolidados (retirados en el GC 2026-06-09): TODO-01/02→§38 · 05→§47 · 06→`e290f83` · **10→§62** (CI reactivado; activo al subir/mergear) · 11→spec §16 · 12→§50 · 13→§51 · **15→§63 (PRE-1 CERRADO: backup+restore PROBADO+copia fuera)** · 16→§55 · settings.local→`e3d390f` · **TODO-25→§90 (CAZA-BUGS: reflejo + W-10 + skill `caza-bugs` + gate L-42 ×5 secciones)** · **TODO-26→cars §G (reflejo Caza-bugs propagado byte-idéntico ×4 — verificado en cars/inmobiliaria/insema, 2026-06-21)** · **TODO-27→§96 (shard `30`→`31-LECCIONES-FIRESTORE`; descubrimiento: kernel acopla `### L-NN` a `30` → M-06)** · **TODO-24→§88 (índice 100% cero-ficción EN PROD; v21 mergeado)**.

---

## 🔮 Contexto estratégico
Programa "Nuevo Bersaglio": Fase 1 rediseño ✅ · Fase 2 hardening (Tier A/B ✅, C pendiente) · Fase 3 CRM ✅ en prod · **Fase M: tren M0→M6 ✅ EN PROD** (candado + auditoría + gestiones + acuerdo por deuda) + **ACUERDOS de pago/cuotas R1-R5 construidos (§81), gateados** (charter `50-ARQUITECTURA`, plan `fase-m-plan.md`). SW `bersaglio-v16`. Horizonte: R6 acuerdos → M7 castigo → M2c → reportes/aging B6 → (futuro) inventario/facturación + RBAC/asesor (TODO-19).

---

## 📝 Bitácora (efímera)

> Podada (GC) 2026-06-23. Histórico → **ADR §37-§99** (mapa `00`→detalle `99`; lecciones L-/M- en `30`/`31`).
>
> **▶️ 2026-06-23 — sprint web (§100·§101·§102 EN PROD)** ([OPUS-4.8]): **§100** cero-demo (flash Nosotros = fondo CSS demo, no el §99 revertido; 3 demos CSS + categorías → cero-ficción; móvil 1×2→340×425; L-45). **§101** proceso Decisión Fuerte validado (Gemini independiente ≈ reinventó el pipeline) → Paso 7 = **GATE EMPÍRICO**. **§102** carga fluida: el placeholder del §100 era un **gradiente verde saturado** (se veía como "pantalla de espera"); → neutro casi-blanco invisible + imagen `background:url` (patrón `featured.js`), verif. PROD navegador real; L-46. Reconciliación de relevo → meta-lección: cruzar relevo vs `deepAudit`+ADRs del turno. **Barrido QA público** (caza-bugs, 7 páginas × estados-cero × móvil) = **LIMPIO** (cero-ficción funciona en todo el sitio; pieza-no-encontrada/carrito/wishlist/journal/catálogo vacíos elegantes). [[feedback_no_demo_en_index]].
>
> **🚦 COLA REAL — gated/pendiente**: (1) **ALINEAR cerebro de cars** (Daniel 2026-06-23: "los cerebros no están alineados"; ej. caracterización de Gemini = agente que puede editar, le damos read-only por ROL; revisar cars y unificar) → **tarea grande, sesión dedicada**; (2) **borrado auto de imagen vieja de Storage** (IRREVERSIBLE → gate empírico); (3) **arranque C1** (PERF-07); (4) responsive fino; (5) limpieza CSS muerto (`.abt-hero-img`/`.atl-img`/`.home-editorial-img`) + borrar `/img/*` demo; (6) **re-verificar catálogo/pieza CON piezas** cuando Kary cargue contenido (hoy reset-a-cero → no auditable el estado lleno). **Regla nueva (Daniel)**: skill `arquitecto-software` SIEMPRE al construir/corregir. `[[feedback_workflows_acotados]]`. [OPUS-4.8].
