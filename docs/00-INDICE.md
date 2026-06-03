# 00 — ÍNDICE SINÁPTICO (mapa § → línea del Historial ADR)

> **Nodo neuronal: Índice sináptico.** Mapa § → línea de
> `docs/99-HISTORIAL-ADR.md`. Es la tabla de contenidos del
> nodo de Largo Plazo. Se consulta on-demand (Trigger de Error/Historia, ver
> `CLAUDE.md §G`).
>
> **Cerebro completo**: 🧠 `CLAUDE.md` (router/identidad) · 🩺 `docs/05-ESTADO-GLOBAL.md` (signos vitales)
> · ⚡ `docs/10-MEMORIA-CORTO-PLAZO.md` (WIP) · 🗺️ `docs/20-MEMORIA-ESPACIAL.md` (arquitectura)
> · 🧪 `docs/30-LECCIONES.md` (experiencia/recetas) · 🗂️ este (índice) · 📚 `docs/99-HISTORIAL-ADR.md` (largo plazo).
>
> **Cómo usarlo (regla de oro anti-saturación)**:
> 1. Busca aquí el § que necesitas y su línea de inicio.
> 2. Lee SOLO ese tramo: `Read docs/99-HISTORIAL-ADR.md offset=<línea> limit=~150`.
> 3. NUNCA leas el historial completo (satura el contexto al instante).
>
> Ejemplo: para el Plan §19 → línea 311 → `Read docs/99-HISTORIAL-ADR.md offset=311 limit=150`.
>
> Grep rápido: `grep -n "^## " docs/99-HISTORIAL-ADR.md` o PowerShell `Select-String` regenera este mapa.

---

## 🧭 Enrutamiento semántico (síntoma/tema → neurona) — CONSULTA ESTO PRIMERO

| Tu situación / síntoma | Ve a |
|---|---|
| ¿Dónde vive un módulo / ruta / flujo / componente? | 🗺️ `20-ESPACIAL` |
| Voy a mover/renombrar archivos, refactor de estructura | 🧪 `30-LECCIONES` + 🗺️ `20-ESPACIAL` |
| Conflicto al fusionar / cache / service worker | 🧪 `30-LECCIONES` L-02 + `CLAUDE.md §4` |
| Errores conocidos y gotchas de estilo (style.css) | 🧪 `30-LECCIONES` |
| ¿Qué hay pendiente? estado del sprint | ⚡ `10-CORTO-PLAZO` (TODOs) |
| 🔵 Audita SEGURIDAD / Firebase rules | 🎯 `40-LOBULOS-DOMINIO` → 41-SEGURIDAD (on-demand) |
| 🔵 Audita UX / interfaz / componentes | 🎯 `40-LOBULOS-DOMINIO` → 43-UX |
| 🔵 Audita PERFORMANCE / LCP / Vite | 🎯 `40-LOBULOS-DOMINIO` → 45-PERFORMANCE |
| 🔵 Audita ACCESIBILIDAD / skip-link / focus | 🎯 `40-LOBULOS-DOMINIO` → 48-ACCESIBILIDAD |
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
---

> Mantener este índice sincronizado: cuando se agregue un ADR §32+ al historial,
> añadir su fila aquí con la línea de inicio (`Select-String` o `grep`).
