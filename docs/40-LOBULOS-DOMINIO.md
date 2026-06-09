# 🎯 40 — LÓBULOS DE DOMINIO (Registry de Auditorías Especializadas)

> **Nodo neuronal: Lóbulos de Dominio.** Registro de los lóbulos hijos especializados creados bajo el **Trigger 🔵 de Auditoría (`CLAUDE.md §G.2`)**.
>
> **Cómo opera (Reflejo de Neurogénesis §G.4)**: los lóbulos hijos (`docs/43-UX.md`, `docs/45-PERFORMANCE.md`, etc.) no nacen vacíos; se crean en el momento de realizar una auditoría real y se registran aquí.

---

## 🧭 Registro de Lóbulos Activos

| Lóbulo | Dominio | Estado | Skills asociadas |
|---|---|---|---|
| `docs/41-SEGURIDAD.md` | Seguridad backend + escalabilidad (Firebase rules, secretos, listeners) | 🟢 Activo · backlog Fase 2 | `security-review`, `ecommerce`, `crm-architect` |
| `docs/42-LEGAL.md` | Marco legal **COLOMBIANO** (e-commerce/Ley 1480, datos/Habeas Data Ley 1581, joyería/RUCOM, LA-FT/SAGRILAFT, DIAN/IVA) + guardrail anti-jurisdicción-extranjera | 🟢 Activo · auditoría 2026-06-08 | `legal-colombia` |
| `docs/43-UX.md` | Experiencia de Usuario y Diseño Visual | 🟢 Activo | `frontend-design`, `impeccable` |
| `docs/45-PERFORMANCE.md` | Core Web Vitals y Carga de Activos | 🟢 Activo | `seo-audit`, `performance-check` |
| 48-ACCESIBILIDAD (a11y) | Pautas de Accesibilidad WCAG 2.2 AA | ⏳ Planificado (sin archivo aún — nace en la 1ª auditoría) | `accessibility-audit` |

---

## 🔄 Flujo de Auditoría Neuronal

Cuando el cliente solicita un análisis o auditoría de un dominio especializado:
1. Consulta las habilidades en la carpeta `skills/` relacionadas al tema para usar metodologías validadas.
2. Crea el archivo correspondiente (`docs/NN-DOMINIO.md`) si no existe.
3. Documenta los hallazgos reales, planes de acción con tags (ej. A11Y-01, PERF-01) y soluciones aplicadas.
4. Actualiza este registro cambiando el estado a 🟢 Activo.

---

## 🛠️ Recursos Externos Complementarios

`skills/` (carpeta del repo + tool `Skill`) es **expertise general de terceros**. **NO es una neurona** — es un recurso paralelo curado por el cliente.

> 📖 **Catálogo completo de las skills → `docs/skills-inventory.md`.** Consúltalo al disparar Trigger 🔵 para saber QUÉ skill tienes para un dominio.
>
> ⚠️ **Verdad del wiring**: `skills/` del repo NO es la fuente de las skills cargadas en sesión (eso viene de `~/.claude/settings.json` + bundle del entorno `anthropic-skills:*` / `superpowers:*`). El repo `skills/` es un catálogo paralelo de referencia. Detalle en `skills-inventory.md`.

**Mapa rápido skill → dominio** (al disparar Trigger 🔵):
- 🎨 **UX/Diseño** (43) → `frontend-design`, `impeccable`, `redesign-existing-projects`, `emil-design-eng`.
- 🔍 **SEO** (44) → `seo-audit`, `ai-seo`, `schema-markup`.
- ⚡ **Performance** (45) → análisis directo + `CLAUDE.md §3.1`.
- ✍️ **Copywriting** (47) → `copywriting`, `copy-editing`, `marketing-psychology`.
- ♿ **Accesibilidad** (48) → `accessibility-audit` (WCAG 2.2 AA — usar PRIMERO).
- 🛒 **E-commerce / pagos** → `ecommerce` (PSE/Wompi/Stripe, DIAN, SIC).
- ⚖️ **Legal Colombia** (42) → `legal-colombia` (guardrail + método; lee `docs/42-LEGAL.md`). **NUNCA** `legal:*`/`legalzoom:*` (son de EE.UU., excluyen ley no-estadounidense).

**Sugerir una skill nueva** (capacidad portable, NO específica del proyecto): proponer al cliente → si aprueba, leer skill `skill-creator` → instalar en `skills/<nombre>/` → registrar aquí + en `skills-inventory.md`.
