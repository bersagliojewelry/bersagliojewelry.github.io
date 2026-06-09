# 🔁 60 — WORKFLOWS REUTILIZABLES (catálogo de detección de inconsistencias/errores)

> **Nodo neuronal: catálogo de procesos.** Recetas **reutilizables** que detectan las MISMAS
> inconsistencias/errores una y otra vez, para no reinventar el proceso cada sesión y **mejorar la
> calidad sistemáticamente** (pedido de Daniel, 2026-06-08). On-demand: NO se auto-carga.
>
> **Cuándo leerlo (Trigger de Experiencia + Auditoría)**: ANTES de una revisión/auditoría/verificación
> o una op repetitiva ("voy a revisar reglas / un diseño / lo que dejó un subagente / si esto cumple").
> Los workflows ad-hoc que se repiten o demuestran valor se **registran aquí** con su receta (Reflejo de Captura §G.4).

---

## 🧭 Catálogo

| ID | Workflow | Cuándo usarlo (disparador) | Qué detecta | Cómo se corre | Origen/usos |
|---|---|---|---|---|---|
| **W-01** | **Red-team de reglas Firestore** | Antes de desplegar `firestore.rules`/`storage.rules` | Fugas de datos, escrituras no autorizadas, escalada de privilegios | N subagentes en paralelo, cada uno con una lente que **intenta romper** las reglas: escalada · lectura indebida · integridad · robustez → síntesis | `30 §L-16` · ADR §42 |
| **W-02** | **Auditoría de feature/panel por dimensiones** | Antes de moldear/construir una fase del panel | Gaps de UX, navegación/IA, lógica de dominio, escala/costo | Subagentes en paralelo, uno por dimensión (UX · IA/navegación · dominio · escala/costo) → síntesis vs el norte | ADR §50 · `feedback_revisar_panel_completo` |
| **W-03** | **Red-team de diseño (lentes empresariales)** | Antes de congelar un diseño maestro caro de revertir | Supuestos frágiles, modos de fallo, sobre-ingeniería | Varios subagentes con lentes (seguridad · costo · escala · datos · UX · mantenibilidad · negocio) atacan el diseño → síntesis | ADR §50 (spec maestra) |
| **W-04** | **Verificación post-subagente** | Tras delegar trabajo a un subagente | Que el subagente **alucinó** (dice que hizo algo que no quedó en el repo) | Releer los archivos/estado REALES del repo y comparar contra lo que reportó | `30 §L-27` |
| **W-05** | **Testing de Cloud Functions (puro + integración)** | Antes de desplegar una CF | Bugs de lógica de negocio + glue del trigger | Separar **lógica pura** (test sin emulador, exacto) + **integración** (emulador real) | `30 §L-17` · ADR §43 |
| **W-06** | **Análisis crítico multi-agente (fan-out → síntesis)** | Pregunta/decisión que cruza varios temas independientes | Puntos ciegos, hechos no verificados, opciones no consideradas | Despachar N subagentes en paralelo (uno por sub-tema) → sintetizar y decidir | Usado 2026-06-08 (mejoras al cerebro) |
| **W-07** | **Comité de expertos ×3** | Mejorar cualquier respuesta/entregable importante | Debilidades, errores, falta de profundidad o claridad | Skill `comite-expertos` (expertos por tema → debate anónimo → síntesis, ×3) | `CLAUDE §3.7` · skill `comite-expertos` |
| **W-08** | **Investigación profunda (grounded)** | Antes de afirmar hechos externos (legal, normativo, mercado) | Datos inventados o desactualizados | Agentes que verifican en **fuentes oficiales/primarias** + marcar lo no verificado `[a verificar]` | Usado 2026-06-08 (legal `42-LEGAL`) · skills `legal-colombia`, `deep-research` |
| **W-09** | **brain:check (linter del cerebro)** | Al arrancar/cerrar sesión o tras tocar el cerebro | Neuronas huérfanas, caps excedidos, índice desincronizado, refs colgantes, skills sin catalogar | `npm run brain:check` | `CLAUDE §G.4` |

---

## 🌱 Cómo crece este catálogo

- Cuando un proceso de revisión/detección **se repite** o demuestra valor (atrapó un error que se
  habría escapado), **regístralo aquí** con: disparador · qué detecta · cómo se corre · origen.
- Mantén las recetas **accionables y cortas** (la receta, no la teoría). El detalle de un caso vive
  en su `30 §L-NN` o ADR; aquí va el **patrón reutilizable**.
- Patrón general de un workflow de detección: **(1) disparador claro → (2) fan-out de lentes/agentes
  independientes que buscan el fallo → (3) síntesis/veredicto → (4) capturar lo aprendido**.
