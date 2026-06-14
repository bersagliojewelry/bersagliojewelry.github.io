# ⚡ 10 — MEMORIA A CORTO PLAZO (WIP / Sprint activo)

> **Nodo neuronal: Memoria a Corto Plazo** (auto-carga con `CLAUDE.md` + `05`). Solo lo VIVO:
> foco, pendientes (TODO-NN = ledger único), bitácora efímera. Estado técnico → `05`.
> **Pizarra, no archivo**: al cerrar tarea → ADR en `99` + fila en `00`, lecciones a `30`, podar (GC §G.4).

---

## 🎯 Foco actual

> 🎉 **CRM + Fase M (M0→M6) EN PRODUCCIÓN** (ADR §47-§80; 344 clientas, cartera $506.510.780; admin-only, vendedoras=dato; Panel v2). Detalle → `05` + `00-INDICE`→`99`. ⚙️ **OPUS 4.8 interino** (Fable cayó 2026-06-12; marcar todo [OPUS-4.8] · `feedback_opus_interino`).
>
> **▶️ FOCO ACTIVO — CMS WEB PÚBLICA (2026-06-14, urgente · Kary pide la web lista)**: hacer TODO el contenido público administrable desde el panel (piezas, colecciones, banners, journal, videos, redes, textos) + sync admin↔público + SEO/UX/redes. **Diseño completo → `docs/superpowers/specs/2026-06-14-cms-web-publica-design.md`** (auditoría multi-agente `whppptwso`: 109 items + modelo de datos tipado + cola). Autónomo nocturno (commits + tests propios). **El plan COMPLETO + refinamientos del comité (6 lentes, REFINAR) + modelo de datos final + decisión SEO + orden de build viven en el spec §5** — leerlo al reanudar. **HECHO**: (1) bug REAL del sync corregido — vínculo pieza↔colección tolerante slug/id (`js/core/collection-match.js`, `47b07b8`, test 5/5); (2) **safeUrl()** cimiento anti-XSS (`js/core/safe-url.js`, `39983f2`, test 6/6 — `escape()` NO cubre `javascript:`/`url()`); (3) **comité de diseño** (`wrpym7h3p`, REFINAR) capturado en spec §5. Prod = **0 piezas** (cargar catálogo = tarea aparte, gate de lanzamiento). **▶️ REANUDAR EN (orden del comité)**: (a) BLOQUEANTE #2 — factorizar motor CRUD genérico `createResourceAdmin(descriptor)` + `createTypedDoc/updateTypedDoc` (anti-monolito, pieces/collections de cobayas en refactor verde) + (b) BLOQUEANTE #3 — grupo `Contenido web` en `sidebar-data.js` + `admin-contenido.html` de pestañas; LUEGO **P1.1 categorías dinámicas** (mínimo riesgo: +hue/pos/img a `collections` aditivo + `categories.js` lee de `data.getCollections()` + `<img src=safeUrl>` en vez de background-image) → **journal** (valida el motor; fix consumo eager `journal-preview.js:13` + 3 consumidores en 1 commit) → **siteContent/home** (singleton, `getDoc` one-shot). Bloqueantes extra: `storage.rules` (svg/contentType), `reviews` `pieceId`↔`pieceSlug`. ⚠️ `noindex` = soft-launch deliberado; flip = Decisión Fuerte gated (council + pre-render híbrido). Patrón: docs tipados público-read/`editor`-write; **costo: `getDoc` one-shot para textos, `onSnapshot` solo para listas**.
>
> **⏸️ EN PAUSA — ACUERDOS R6** (retoma tras el CMS): NO-GO por **1 bug de dinero** (HIGH clamp, bug A8 reproducido: cuotas infladas + abono parcial ocultan mora). 5/6 fixes commiteados (`6d127ba`·`bff9972`·`8fd7ca3`·`c7dd7ca`·`3cb5970`·`e40e004`) + `be342aa` parcial (NO revertir); censo prod limpio; emulador 144/144. **Falta**: clamp `pagado=clamp(D0−deudaCubierta,0,Σcuotas)` con D0=deuda AL PACTO (FIFO pact-time, verdad de servidor) + corregir fixtures (line78) → **Decisión Fuerte / candidato Consejo** (`docs/15`). Detalle: commits + git-blame de este `10`. **Lecciones→`30`**: comité degradado por rate-limit=GO FALSO (re-correr; partial-fail≠"pasó"); re-verificar fixes adversarialmente atrapa fixes incompletos. CRUDOs: tasks/w71voltb9·wh5hsk9is·wno2hr1mj.
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
