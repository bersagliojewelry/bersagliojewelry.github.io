# ⚡ 10 — MEMORIA A CORTO PLAZO (WIP / Sprint activo)

> **Nodo neuronal: Memoria a Corto Plazo** (auto-carga con `CLAUDE.md` + `05`). Solo lo VIVO:
> foco, pendientes (TODO-NN = ledger único), bitácora efímera. Estado técnico → `05`.
> **Pizarra, no archivo**: al cerrar tarea → ADR en `99` + fila en `00`, lecciones a `30`, podar (GC §G.4).

---

## 🎯 Foco actual

> 🎉 **CRM + Fase M (M0→M6) EN PRODUCCIÓN** (ADR §47-§82; 344 clientas, cartera→`05`; admin-only, vendedoras=dato; Panel v2). ⚙️ **OPUS 4.8 interino** (Fable cayó 2026-06-12; marcar [OPUS-4.8] · `feedback_opus_interino`).
>
> **TODO-24 — ÍNDICE 100% CERO-FICCIÓN CERRADO** (§88; detalle en su fila TODO-24 + ADR). **▶️ RESTA SOLO**: Daniel mergea `Desarrollo→main` el **cliente v21** (href + Destacadas + fix Categorías §89 + SW) — reglas y web v18 ya en prod. Luego Kary carga TODO de cero. **🔄 RESET A CERO** (Daniel 2026-06-20): cartera/clientes se vacían (344/$506M desechable → bajan urgencias de dinero).
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
| TODO-24 | **index 100% gestionable + CERO ficción** (`feedback_no_demo_en_index`; spec `2026-06-20-cms-cero-ficcion-design.md`). Fase A `4ae6c0f` + **Fase B (§88) EN PROD** (PR #272, v18): panel Videos/Redes · puerta reglas + journalValid endurecido · defensa en profundidad · UX Kary · gate barrera #5 · **href obligatorio en Redes** (`8abaab4`) · **Destacadas umbral hide-when-empty** (`a566dc5`). **Reglas DESPLEGADAS+verificadas en vivo** (censo prod = catálogo+contenido vacío). Índice 100% cero-ficción cerrado. Verif rules 186+puros 21+no-demo 5+build. Detalle → §88. | 🟢 casi | falta merge cliente v21 (href + Destacadas + fix Categorías §89 + SW) por Daniel |
| TODO-27 | **Shard `30-LECCIONES` → `31-LECCIONES-FIRESTORE`** (deuda §82/H-17; `30` sobre cap de chars, agravado leve por M-05): extraer L-12..L-17/L-29/L-34..L-40 (bloque Firestore/CF/reglas) a neurona hermana + neurogénesis completa (§G.5: fila §0, registro `00`, puntero madre→hija, bitácora). Medir post-extracción que `30` quede bajo 40k CON M-05 dentro. | 🔲 | op riesgosa propia (commit-por-tipo §2) |
| TODO-28 | **Correcciones web** (Daniel 2026-06-21; 5 fases + 4 decisiones → recon 7 ag. en bóveda). **F1✅ F2-público✅ F3✅** (`efeb13c`·`69b3a94`·`ce0175f`; verif. navegador): FAQ/journal-vacío/will-change/entrada-404 · listener live-sync robusto `subscribeWithRetry` (re-suscribe; cubre colecciones/piezas/journal/films/social+reviews+inquiries; rev. adversarial ×2) · fotos Editorial+Atelier editables (XSS verif.); FAQ Contacto ya era editable. **Pend.**: F2 colas mudas CRM (`crm-service.js` ~11 listeners, dinero → al helper) · **F4** 🟡 perf (look IDÉNTICO, dir. Daniel; → `45` PERF-04): `content-visibility` en listas — catálogo ✅ `a32c56d`; falta deseos/journal/panel + aligerar aurora · **F5** comité+consejo: borrado-colección=**bloquear-si-piezas** (decidido) + carga/orden/motion cars+insema mejorado. | 🟡 F1-3 ✅ | sigue F4 |

> ✅ Cerrados y consolidados (retirados en el GC 2026-06-09): TODO-01/02→§38 · 05→§47 · 06→`e290f83` · **10→§62** (CI reactivado; activo al subir/mergear) · 11→spec §16 · 12→§50 · 13→§51 · **15→§63 (PRE-1 CERRADO: backup+restore PROBADO+copia fuera)** · 16→§55 · settings.local→`e3d390f` · **TODO-25→§90 (CAZA-BUGS: reflejo + W-10 + skill `caza-bugs` + gate L-42 ×5 secciones)** · **TODO-26→cars §G (reflejo Caza-bugs propagado byte-idéntico ×4 — verificado en cars/inmobiliaria/insema, 2026-06-21)**.

---

## 🔮 Contexto estratégico
Programa "Nuevo Bersaglio": Fase 1 rediseño ✅ · Fase 2 hardening (Tier A/B ✅, C pendiente) · Fase 3 CRM ✅ en prod · **Fase M: tren M0→M6 ✅ EN PROD** (candado + auditoría + gestiones + acuerdo por deuda) + **ACUERDOS de pago/cuotas R1-R5 construidos (§81), gateados** (charter `50-ARQUITECTURA`, plan `fase-m-plan.md`). SW `bersaglio-v16`. Horizonte: R6 acuerdos → M7 castigo → M2c → reportes/aging B6 → (futuro) inventario/facturación + RBAC/asesor (TODO-19).

---

## 📝 Bitácora (efímera)

> Podada (GC) 2026-06-21. Histórico → **ADR §37-§90** (CRM/Fase R/Panel v2 §37-§56 · F6 §57-§68 · Fase M M0→M6 §69-§80 · acuerdos R1-R5 §81 / R6 §87 gated · CMS §85-86 · cero-ficción §88 · CAZA-BUGS §90 · Categorías §89). Lecciones L-38..L-40. Detalle de cualquier § → `00`→`99`.
>
> **▶️ RETOMA — TODO-28 perf** (comité ×3 + Gemini; bóvedas `2026-06-21-perf-fluidez-movil-comite-v4` + `-carga-fluida-index-comite-v3`): **F4 .bj-lite por capacidad ✅ VALIDADO** (Daniel: "más rápido, invisible"; `d433b25`, falta su merge). **F4b carga fluida del index** (colecciones/piezas saltaban al cargar): cura = RESERVAR el alto, NO skeleton → **push `310d6bb`** (`section-reserve.js` localStorage + `data.js isReady(sección)`+notify-timeout + cats/featured 3 estados + cap 6 colecciones/"ver todas"/centradas-si-<6 + fade-in swap-directo-en-lite/RM + colapso silencioso al timeout = cero-ficción). Build verde (sandbox sin Firestore → solo verifiqué vacío/timeout). **FALTA**: Daniel valida en navegador real CON datos → merge `Desarrollo→main`; fuentes (invisible); arranque C1 (estructural). Detalle → `45` PERF-04/05. Lección: `[[feedback_workflows_acotados]]`. [OPUS-4.8].
