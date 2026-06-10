# 00 — ÍNDICE SINÁPTICO (mapa § → línea del Historial ADR)

> **Nodo neuronal: Índice sináptico.** Mapa § → línea de
> `docs/99-HISTORIAL-ADR.md`. Es la tabla de contenidos del
> nodo de Largo Plazo. Se consulta on-demand (Trigger de Error/Historia, ver
> `CLAUDE.md §G`).
>
> **Cerebro completo**: 🧠 `CLAUDE.md` (router/identidad) · 🩺 `docs/05-ESTADO-GLOBAL.md` (signos vitales)
> · ⚡ `docs/10-MEMORIA-CORTO-PLAZO.md` (WIP) · 🛰️ `docs/15-CONSEJO-EXTERNO.md` (red team) · 🗺️ `docs/20-MEMORIA-ESPACIAL.md` (arquitectura)
> · 🧪 `docs/30-LECCIONES.md` (experiencia/recetas) · 🎯 `docs/40-LOBULOS-DOMINIO.md` (registry dominios) · 🏛️ `docs/50-ARQUITECTURA.md` (arquitectura/charter CRM) · 🔁 `docs/60-WORKFLOWS.md` (workflows reutilizables) · 🗂️ este (índice) · 📚 `docs/99-HISTORIAL-ADR.md` (largo plazo) · 🛠️ `docs/skills-inventory.md` (catálogo skills).
>
> **Cómo usarlo (regla de oro anti-saturación)**:
> 1. Busca aquí el § que necesitas y su línea de inicio.
> 2. Lee SOLO ese tramo: `Read docs/99-HISTORIAL-ADR.md offset=<línea> limit=~150`.
> 3. NUNCA leas el historial completo (satura el contexto al instante).
>
> Ejemplo: para el Lookbook §19 → línea 256 → `Read docs/99-HISTORIAL-ADR.md offset=256 limit=150`.
>
> Grep rápido: `grep -n "^## " docs/99-HISTORIAL-ADR.md` o PowerShell `Select-String` regenera este mapa.

---

## 🧭 Enrutamiento semántico (síntoma/tema → neurona) — CONSULTA ESTO PRIMERO

| Tu situación / síntoma | Ve a |
|---|---|
| ¿Dónde vive un módulo / ruta / flujo / componente? | 🗺️ `20-ESPACIAL` |
| Hallazgos/presentación para Kary (histórico Kardex→plataforma) / pendientes viejos | bóveda privada → stub `docs/PENDIENTES-Y-HALLAZGOS.md` (los VIVOS = tabla TODO del `10`) |
| Voy a mover/renombrar archivos, refactor de estructura | 🧪 `30-LECCIONES` + 🗺️ `20-ESPACIAL` |
| Conflicto al fusionar / cache / service worker | 🧪 `30-LECCIONES` L-02 + `CLAUDE.md §4` |
| Errores conocidos y gotchas de estilo (CSS modular por página) | 🧪 `30-LECCIONES` |
| ¿Qué hay pendiente? estado del sprint | ⚡ `10-CORTO-PLAZO` (TODOs) |
| 🔵 Audita SEGURIDAD / Firebase rules | 🎯 `40-LOBULOS-DOMINIO` → 41-SEGURIDAD (on-demand) |
| 🔵 Audita UX / interfaz / componentes | 🎯 `40-LOBULOS-DOMINIO` → 43-UX |
| 🔵 Audita PERFORMANCE / LCP / Vite | 🎯 `40-LOBULOS-DOMINIO` → 45-PERFORMANCE |
| 🔵 Audita ACCESIBILIDAD / skip-link / focus | 🎯 `40-LOBULOS-DOMINIO` → 48-ACCESIBILIDAD + Skill `accessibility-audit` |
| ⚖️ Algo LEGAL: términos, privacidad, datos personales, retracto, garantía, cookies, RUCOM, IVA, lavado de activos | 🎯 `40-LOBULOS` → `42-LEGAL` + Skill `legal-colombia` (NUNCA plugins legales extranjeros) |
| 🔁 Voy a revisar/auditar/verificar algo de forma sistemática (reglas, diseño, lo que dejó un subagente, si algo cumple) | 🔁 `docs/60-WORKFLOWS.md` (catálogo de workflows de detección reutilizables) |
| 🛰️ Decisión fuerte / cara de revertir / fork 50-50 → ¿2ª opinión? | 🛰️ `docs/15-CONSEJO-EXTERNO.md` (cuándo + qué tier del provider externo §0) |
| 🏛️ Decisión de arquitectura / diseño o escalado del CRM / límites de módulo / "cero monolitos" | 🏛️ `docs/50-ARQUITECTURA.md` |
| 🛠️ ¿Qué skill tengo para X? / mapa de skills | 🛠️ `docs/skills-inventory.md` + 🎯 `40-LOBULOS §Recursos Externos` |
| 🌱 Crear / sugerir una SKILL nueva (capacidad portable) | 🎯 `40-LOBULOS-DOMINIO` §Reflejo de Sugerencia de Skills + Skill `skill-creator` |
| El "por qué" de una decisión / detalle de un § | tabla "§ → línea" abajo → 📚 `99-HISTORIAL` |

---

## Mapa § → línea

| § | Tema | Línea |
|---|---|---|
| §1 | 2026-04-04 — Rediseño completo index.html V7 (10 fases) | 7 |
| §2 | 2026-04-04 — Correcciones post-rediseño | 25 |
| §3 | 2026-04-04 — Consolidación ticker + trust strip | 44 |
| §4 | 2026-04-04 — Limpieza de código muerto (V7) | 62 |
| §5 | 2026-04-04 — Iconos diferenciados en ticker | 77 |
| §6 | 2026-04-04 — Rediseño completo del header (desktop + mobile) | 87 |
| §7 | 2026-04-04 — Rediseño completo sección Servicios | 119 |
| §8 | 2026-04-04 — Header V2: simetría desktop | 153 |
| §9 | 2026-04-04 — Fix crítico mobile menu | 165 |
| §10 | 2026-04-04 — Mobile menu V3: contraste y legibilidad | 176 |
| §11 | 2026-04-05 — Fix: touch scroll bloqueado | 195 |
| §12 | 2026-04-05 — Fix V2: auditoría profunda touch scroll | 205 |
| §13 | 2026-04-14 — Fix bugs admin overwrite + real-time sync | 217 |
| §14 | 2026-04-15 — Rename label "Claridad" → "Calidad" | 227 |
| §15 | 2026-04-15 — Unificación de fondo Journal / About / CTA | 233 |
| §16 | 2026-04-15 — Fix false version-conflict al borrar imagen | 239 |
| §17 | 2026-04-15 — Lookbook V7: mejoras móvil | 245 |
| §18 | 2026-04-15 — Lookbook V7: anti-flash + intento de centrado | 251 |
| §19 | 2026-04-15 — Lookbook V7: centrado tapa/contratapa | 256 |
| §20 | 2026-04-15 — Lookbook V7: sincronización de shift | 261 |
| §21 | 2026-04-15 — Lookbook V7: stuck at page 2 fix | 266 |
| §22 | 2026-04-16 — Lookbook V7: eliminar gap residual | 272 |
| §23 | 2026-04-16 — Lookbook V7: spine strip | 277 |
| §24 | 2026-04-17 — Portfolio V5: Reconstrucción sin StPageFlip | 282 |
| §25 | 2026-04-18 — Portfolio V9: smart adaptive fit | 290 |
| §26 | 2026-04-18 — Revert: eliminar adaptive fit | 296 |
| §27 | 2026-04-18 — Featured V3: Variant C (Asimétrico) | 301 |
| §28 | 2026-04-18 — Featured V3.1: fix badge y contraste | 306 |
| §29 | 2026-04-19 — RECONSTRUCCIÓN LÍQUIDO & CRISTAL (Phases A-G) | 311 |
| §30 | 2026-04-27 — ITERACIÓN POST-LAUNCH (Fases 11-18) | 332 |
| §31 | 2026-04-28 — POLISH SESSION (Fases 19-21 + Items 1-2 + Session 3) | 347 |
| §32 | 2026-06-03 — Optimización de Rendimiento (PERF-01 y PERF-02) | 359 |
| §33 | 2026-06-03 — Mejoras Estéticas Premium (Estilo iOS y Rediseño de Panel Admin) | 369 |
| §34 | 2026-06-03 — Diseño Ultra-Premium, Composición Espacial y Copywriting Editorial | 381 |
| §35 | 2026-06-03 — SEO, Tracking, Optimización AVIF y Rediseño Premium de Autor en Admin | 393 |
| §36 | 2026-06-03 — Ajuste de Hero y Optimización de Velocidad de Carga (Imágenes WebP/AVIF) | 410 |
| §37 | 2026-06-05 — Upgrade del cerebro neuronal a template v1.0.0 | 420 |
| §38 | 2026-06-05 — Curación post-upgrade: dedup de skills + reconciliación inventario | 439 |
| §39 | 2026-06-05 — Auditoría de instalación de skills + auto-detección (catalogación) | 452 |
| §40 | 2026-06-05 — Rediseño Fase 1 (mirror): shell + Home + Nosotros + Contacto + dock Atajos | 469 |
| §41 | 2026-06-05 — Fase 1 pulido: auditoría visual + 3 fixes doctrina (transition/radii/#000) | 488 |
| §42 | 2026-06-06 — CRM Fase 3 · Bloque 1: rol vendedora + reglas RBAC cuentas por cobrar + endurecimiento adversarial | 507 |
| §43 | 2026-06-06 — CRM Fase 3 · Bloque 2: Cloud Function `recalcSaldoCliente` (saldo server-side) + modelo de signo | 526 |
| §44 | 2026-06-06 — CRM Fase 3 · Bloque 3: Panel de Kary (primera UI — Cuentas, ficha, bandeja, cumpleaños, config) | 545 |
| §45 | 2026-06-06 — CRM Fase 3 · Bloque 4: App de vendedora responsive (mis clientes, ficha, factura/abono, solicitar corrección) | 564 |
| §46 | 2026-06-06 — CRM Fase 3 · Verificación E2E (emuladores) + fix login (lastLogin best-effort) | 583 |
| §47 | 2026-06-06 — CRM Fase 3 · LANZAMIENTO a prod: deploy (reglas+functions) + migración Fase A (344 clientes de Kary) | 600 |
| §48 | 2026-06-06 — Mantenimiento · Upgrade runtime Cloud Functions (Node 20→22 + firebase-functions v6→v7) | 617 |
| §49 | 2026-06-06 — CRM Reestructura Fase R: vendedora = dato (no usuario) + CRM admin-only | 634 |
| §50 | 2026-06-07 — Panel v2 (mini-ERP): diseño maestro + Consejo Externo + F-CHASIS-A construido y desplegado | 651 |
| §51 | 2026-06-07 — F1+F2+slice F5: función de Morosos/Vencidos (aging de cartera) — en vivo, sin CF nueva | 668 |
| §52 | 2026-06-07 — F5 (slice): filtros/chips de la lista CxC (estado · mora · vendedora) | 685 |
| §53 | 2026-06-07 — F4-leads: Bandeja (pipeline de leads sobre `inquiries`) + convertir a cliente | 702 |
| §54 | 2026-06-08 — F6 inicio: App Check (código listo, rollout pendiente de consola) | 719 |
| §55 | 2026-06-08 — Mejoras al cerebro (TODO-16): Comité ×3 + Legal Colombia + Arquitecto + Workflows | 736 |
| §56 | 2026-06-09 — Cerebro multi-proyecto (canon): linter canónico + manifest + cerebros INDEPENDIENTES + kernel v1.1 | 763 |
| §57 | 2026-06-09 — Comité ×3 "Operación integral" (plan negocio+sistema → bóveda) + RCA App Check (403 en el canje) | 788 |
| §58 | 2026-06-09 — App Check REPARADO en vivo: API key restringida sin App Check API (API_KEY_SERVICE_BLOCKED) → 200 | 805 |
| §59 | 2026-06-09 — F6 frenos de gasto: forms públicos con forma exacta + push_tokens cerrado (51/51, desplegado) | 822 |
| §60 | 2026-06-09 — Backup diario automático de Firestore desplegado (PRE-1 parte 1; restore probado pendiente) | 839 |
| §61 | 2026-06-09 — GEMELO vivo: bersaglio-gemelo.web.app (Spark, aula+banco de pruebas+restore) — E2E verificado | 856 |
| §62 | 2026-06-09 — F6 cimientos: CI de reglas reactivado (TODO-10 ✅) + entero-COP en 3 capas (desplegado) | 873 |
---

> Mantener este índice sincronizado: cuando se agregue un ADR §57+ al historial,
> añadir su fila aquí con la línea de inicio (`Select-String` o `grep`).
