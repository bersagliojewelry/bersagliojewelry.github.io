# ⚡ 10 — MEMORIA A CORTO PLAZO (WIP / Sprint activo)

> **Nodo neuronal: Memoria a Corto Plazo** (auto-carga con `CLAUDE.md` + `05`). Solo lo VIVO:
> foco, pendientes (TODO-NN = ledger único), bitácora efímera. Estado técnico → `05`.
> **Pizarra, no archivo**: al cerrar tarea → ADR en `99` + fila en `00`, lecciones a `30`, podar (GC §G.4).

---

## 🎯 Foco actual

> 🎉 **CRM + Fase M (M0→M6) EN PRODUCCIÓN** (ADR §47-§82; 344 clientas, cartera→`05`; admin-only, vendedoras=dato; Panel v2). Detalle → `05` + `00-INDICE`→`99`. ⚙️ **OPUS 4.8 interino** (Fable cayó 2026-06-12; marcar todo [OPUS-4.8] · `feedback_opus_interino`).
>
> **🔴 PRIORIDAD #1 (Daniel 2026-06-20) — index 100% gestionable + CERO ficción** (TODO-24; spec `2026-06-20-cms-cero-ficcion-design.md`; regla `feedback_no_demo_en_index`). **Fase A ✅ EN `Desarrollo`** (`4ae6c0f`, SW v17): demo borrado · Films/Redes a Firestore con hide-when-empty (≥3/≥4) · journal sin baked · gate anti-regresión. **▶️ EMPEZAR AQUÍ (próx. sesión) = Fase B (gestión)**: descriptores admin (pestañas "Videos"/"Redes", patrón Journal `createResourceAdmin`) + Firestore Rules `films`/`socialPosts` + UX Kary ("¿Se ve en la web?" + tarjeta "Estado de tu web" + confirmación al vaciar). Decisiones Daniel: enlace+miniatura · curado manual.
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
| TODO-24 | **🔴 PRIORIDAD #1 — index 100% gestionable + CERO ficción** (Daniel 2026-06-20; `feedback_no_demo_en_index`). **Comité ×3 hecho → spec `docs/superpowers/specs/2026-06-20-cms-cero-ficcion-design.md`** (5 barreras · 2 clases [dinámico=hide-when-empty / identidad estática=default real] · UX Kary; CRUDO en bóveda). Decisiones Daniel: umbral CON MÍNIMO (3 videos·4 posts·3 destacadas·journal 1) · BORRAR demo YA · videos enlace+miniatura · redes curado manual. **Fase A ✅ (`4ae6c0f`, SW v17, preview verde)**: home-media.js BORRADO · films/social a Firestore + hide-when-empty (≥3/≥4) · journal sin baked (mata las noticias ficticias) · gate `no-demo-home.test`. **Fase B pendiente** (gestión): descriptores admin (pestañas Videos/Redes) + Firestore Rules `films`/`socialPosts` + UX Kary (columna "¿Se ve?"·tarjeta "Estado de tu web"·confirmación al vaciar) | 🟡 Fase B | construir (Claude) |

> ✅ Cerrados y consolidados (retirados en el GC 2026-06-09): TODO-01/02→§38 · 05→§47 · 06→`e290f83` · **10→§62** (CI reactivado; activo al subir/mergear) · 11→spec §16 · 12→§50 · 13→§51 · **15→§63 (PRE-1 CERRADO: backup+restore PROBADO+copia fuera)** · 16→§55 · settings.local→`e3d390f`.

---

## 🔮 Contexto estratégico
Programa "Nuevo Bersaglio": Fase 1 rediseño ✅ · Fase 2 hardening (Tier A/B ✅, C pendiente) · Fase 3 CRM ✅ en prod · **Fase M: tren M0→M6 ✅ EN PROD** (candado + auditoría + gestiones + acuerdo por deuda) + **ACUERDOS de pago/cuotas R1-R5 construidos (§81), gateados** (charter `50-ARQUITECTURA`, plan `fase-m-plan.md`). SW `bersaglio-v16`. Horizonte: R6 acuerdos → M7 castigo → M2c → reportes/aging B6 → (futuro) inventario/facturación + RBAC/asesor (TODO-19).

---

## 📝 Bitácora (efímera)

> Podada (GC) 2026-06-14. Todo consolidado en **ADR §37-§81** (CRM/Fase R/Panel v2/morosos §37-§56 · F6+operación §57-§68 · Fase M M0→M6 §69-§80 · acuerdos v2 R1-R5 §81). Lecciones L-38..L-40. Herramientas Fase M: `seed-guion-m2b.mjs`·`censo-movimientos-m3.mjs`·`limpiar-cliente-prueba.mjs`. Detalle de cualquier § → `00-INDICE`→`99`.
>
> **2026-06-19**: CMS `global` inc3 (§85, `f757b25`) — wa.me restantes a la fuente única (wishlist·lista-deseos·carrito·FAQ·quick-dock). (Entradas ≤15-jun consolidadas en §37-§84.) [OPUS-4.8].
> **2026-06-20** (cont.): comité ×3 cero-ficción (spec) → **build Fase A** (`4ae6c0f`, SW v17): home-media.js borrado · Films/Redes a Firestore + hide-when-empty · journal sin baked (mata noticias ficticias) · gate anti-regresión. Preview verde (secciones vacías se ocultan, cero demo). Falta Fase B (admin Videos/Redes + Rules + UX Kary). [OPUS-4.8].
> **2026-06-20**: CMS `global` inc4 (§86, `26bf8f8`) — páginas legales a la fuente única vía tokens pre-escape. inc3+inc4 mergeados a main (PR #266/#267) → CMS de contacto COMPLETO en prod. **ACUERDOS R6 bug A8 RESUELTO** (§87, `55bc8ef`; clamp D0 pact-time; red-team 6 áng. 0 hallazgos). **Daniel: reset-a-cero de cartera/clientes** (Kary recarga) + **nueva PRIORIDAD #1 = index 100% gestionable** (auditoría hecha; gaps Films/Social → TODO-24). [OPUS-4.8].
