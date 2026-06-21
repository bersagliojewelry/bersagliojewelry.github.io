# ⚡ 10 — MEMORIA A CORTO PLAZO (WIP / Sprint activo)

> **Nodo neuronal: Memoria a Corto Plazo** (auto-carga con `CLAUDE.md` + `05`). Solo lo VIVO:
> foco, pendientes (TODO-NN = ledger único), bitácora efímera. Estado técnico → `05`.
> **Pizarra, no archivo**: al cerrar tarea → ADR en `99` + fila en `00`, lecciones a `30`, podar (GC §G.4).

---

## 🎯 Foco actual

> 🎉 **CRM + Fase M (M0→M6) EN PRODUCCIÓN** (ADR §47-§82; 344 clientas, cartera→`05`; admin-only, vendedoras=dato; Panel v2). Detalle → `05` + `00-INDICE`→`99`. ⚙️ **OPUS 4.8 interino** (Fable cayó 2026-06-12; marcar todo [OPUS-4.8] · `feedback_opus_interino`).
>
> **TODO-24 — ÍNDICE 100% CERO-FICCIÓN CERRADO** (§88; `feedback_no_demo_en_index`). Todas las dinámicas hide-when-empty (Videos/Redes/Journal/Destacadas/Categorías); identidad always-on. Fase A `4ae6c0f` + Fase B (PR #272, v18) + href Redes (`8abaab4`) + Destacadas umbral (`a566dc5`). **Reglas DESPLEGADAS+verificadas en vivo**; censo prod = catálogo+contenido VACÍO (sin lockout). **▶️ RESTA SOLO**: Daniel mergea `Desarrollo→main` el cliente v20 (href form + Destacadas + SW v20) — reglas y web v18 ya en prod. Luego Kary carga TODO de cero.
>
> (CMS contacto inc1-4 ✅ EN PROD §83-§86.) **🔄 RESET A CERO (Daniel 2026-06-20)**: la plataforma se vacía en cartera/clientes — **Kary recarga de cero**. El dato actual (344/$506M) es desechable → bajan urgencias de dinero.
>
> **✅ ACUERDOS R6 — bug A8 RESUELTO** (§87, `55bc8ef`; red-team 0 hallazgos): clamp `pagado` por D0 (FIFO solo créditos post-pacto). Gated/inerte; encender = Daniel (baja urgencia por reset). Menor: complemento `Σcuotas>saldoAlPactar`.
> - **SIGUE tras CMS**: `hideWhenEmpty` general · usuarios/SPA P5 (TODO-19 RBAC).
> - **Aparte (menor urgencia tras reset)**: M4 1er corte 1-jul · M5 deferido `size()` (gestion/solicitud/asiento, próx. deploy reglas) · M7/M2c/B6 (TODO-09) · TODO-14/20 · DIAN pausada · vendedoras reales (Kary).
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
| TODO-24 | **index 100% gestionable + CERO ficción** (`feedback_no_demo_en_index`; spec `2026-06-20-cms-cero-ficcion-design.md`). Fase A `4ae6c0f` + **Fase B (§88) EN PROD** (PR #272, v18): panel Videos/Redes · puerta reglas + journalValid endurecido · defensa en profundidad · UX Kary · gate barrera #5 · **href obligatorio en Redes** (`8abaab4`) · **Destacadas umbral hide-when-empty** (`a566dc5`). **Reglas DESPLEGADAS+verificadas en vivo** (censo prod = catálogo+contenido vacío). Índice 100% cero-ficción cerrado. Verif rules 186+puros 21+no-demo 5+build. Detalle → §88. | 🟢 casi | falta merge cliente v20 (href form + Destacadas + SW) por Daniel |

> ✅ Cerrados y consolidados (retirados en el GC 2026-06-09): TODO-01/02→§38 · 05→§47 · 06→`e290f83` · **10→§62** (CI reactivado; activo al subir/mergear) · 11→spec §16 · 12→§50 · 13→§51 · **15→§63 (PRE-1 CERRADO: backup+restore PROBADO+copia fuera)** · 16→§55 · settings.local→`e3d390f`.

---

## 🔮 Contexto estratégico
Programa "Nuevo Bersaglio": Fase 1 rediseño ✅ · Fase 2 hardening (Tier A/B ✅, C pendiente) · Fase 3 CRM ✅ en prod · **Fase M: tren M0→M6 ✅ EN PROD** (candado + auditoría + gestiones + acuerdo por deuda) + **ACUERDOS de pago/cuotas R1-R5 construidos (§81), gateados** (charter `50-ARQUITECTURA`, plan `fase-m-plan.md`). SW `bersaglio-v16`. Horizonte: R6 acuerdos → M7 castigo → M2c → reportes/aging B6 → (futuro) inventario/facturación + RBAC/asesor (TODO-19).

---

## 📝 Bitácora (efímera)

> Podada (GC) 2026-06-14. Todo consolidado en **ADR §37-§81** (CRM/Fase R/Panel v2/morosos §37-§56 · F6+operación §57-§68 · Fase M M0→M6 §69-§80 · acuerdos v2 R1-R5 §81). Lecciones L-38..L-40. Herramientas Fase M: `seed-guion-m2b.mjs`·`censo-movimientos-m3.mjs`·`limpiar-cliente-prueba.mjs`. Detalle de cualquier § → `00-INDICE`→`99`.
>
> **2026-06-19/20**: CMS `global` inc3+inc4 (§85/§86, PR #266/#267 EN PROD: wa.me + legales a la fuente única) · **ACUERDOS R6 A8 RESUELTO** (§87, red-team 0 hallazgos; gated) · **Daniel: reset-a-cero cartera/clientes + PRIORIDAD #1 = index gestionable (TODO-24)**. (Entradas ≤18-jun → §37-§84.) [OPUS-4.8].
> **2026-06-20** (sesión "continua", TODO-24 → §88): **ÍNDICE 100% CERO-FICCIÓN CERRADO**. Fase B (panel Videos/Redes + puerta reglas + journalValid endurecido + defensa en profundidad + UX Kary + barrera #5; review 4 ag., HIGH+MED corregidos; `e3406ab`/`c56bb47`, **mergeado PR #272, v18 prod**) → **href obligatorio en Redes** (`8abaab4`) → **Destacadas hide-when-empty** (`a566dc5`, mataba el placeholder "afilando la curaduría" con catálogo vacío). **Reglas DESPLEGADAS + verificadas en vivo** (`firebase deploy --only firestore:rules`; censo prod = catálogo+contenido VACÍO → sin lockout). SW v20 · rules 186✓ puros 21✓ no-demo 5✓ build✓. Resta: Daniel mergea cliente v20. [OPUS-4.8].
> **2026-06-21** (Daniel probando panel): **BUG Categorías arreglado (§89)** — al crear la 1ª colección no aparecía (ni en vivo ni recargando). RCA: `renderCategories` devolvía '' sin datos (1er paint siempre sin datos) → sección nunca en el DOM → `refreshCategories` no podía CREARLA. Fix: render monta SIEMPRE el `<section>` + refresh `mount()` (patrón films/journal, L-42) + CSS `:empty` colapsa dinámicas vacías a 0px (antes 92px hueco). **Verificado en navegador** (tarjeta "ANILLOS" aparece en vivo). SW v21 · no-demo 6✓ build✓. `6b327a0`. Resta: Daniel mergea cliente v21. [OPUS-4.8].
