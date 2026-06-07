# Auditoría arquitectónica — Panel admin + CRM Bersaglio (2026-06-06)

- **Origen**: feedback de Daniel tras ver la Fase R en prod ("muy básico"; números desbordados; no se encuentra dónde agregar vendedoras; clientes mezclados sin filtros/orden/estados; el panel debe ser segmentado "como Windows" y pensarse como un sistema de facturación profesional). Regla de oro: pensar como arquitecto (`CLAUDE.md §3.6`, `50-ARQUITECTURA §0`).
- **Método**: workflow de auditoría, 4 dimensiones (UX/diseño · IA · dominio/estados · escala) + síntesis. Read-only sobre el código real.

## Veredicto honesto
La **base de datos está bien arquitecturada** (saldo desnormalizado escrito SOLO por Cloud Function, libro de movimientos append-only, RBAC server-side, módulo desacoplado — ADR §42/§43). Lo **crudo es la capa de presentación + dominio** de cara a Kary. **No hay que reescribir el backend**: hay que construir 3 capas que faltan ENCIMA — y son justo la fundación que facturación/inventario necesitarán.

## En qué estamos fallando (3 contratos ausentes + 1 riesgo)
1. **Sin contrato visual de datos (design-system de dinero/tablas)** — `fmtCOP` mete hasta ~14 chars en stat-cards sin `min-width:0`/`tabular-nums`; `white-space:nowrap` global → scroll horizontal en móvil; colores de saldo hardcodeados (`#c0392b`/`#1b7a4b`) que NO son los tokens; lógica "signo+color del saldo" **triplicada** (cuentas.js, cuenta.js, saldo.js). **Causa raíz de "los números se salen de las cajas".**
2. **Sin arquitectura de información (IA)** — sidebar **plano de 7 ítems** que mezcla 3 dominios (e-commerce + cobranza + sistema), **duplicado en 8 HTML**. Vendedoras **enterrada** en Configuración; Clientes ni siquiera es ítem de nav. (El CSS para agrupar `.adm-nav-group` YA existe, nunca se usó.)
3. **Sin modelo de dominio de la cuenta** — el CRM solo conoce un número (`saldoActual`), no **estados**. No puede responder "¿quién está vencido / al día / sin deuda / a favor?". Lista = volcado alfabético + 1 buscador, **cero filtros/segmentación**. El aging es imposible hoy: el movimiento no guarda **fecha real** (solo `registradoEn`) y `config.diasPlazo` se guarda pero **nunca se consume** (campo huérfano).
4. **Riesgo transversal — el modelo de lecturas no escala / integridad del dinero**: `limit(2000)` **mudo** que truncaría un total SIN aviso (viola "precisión exacta"); listeners sin `unsubscribe`; recompute O(M) que relee toda la subcolección por escritura; cero índices compuestos CRM. Hoy funciona porque Kary es la única operadora con cartera acotada; **no sobrevive a miles ni a abrir el canal web**.

## Dirección de arquitectura (aditiva, canal-agnóstica)
- **A) Modelo de dominio — `estadoCuenta` como función pura compartida** (espejo de `functions/saldo.js`): enum `A_FAVOR` (saldo<0) · `SIN_DEUDA` (=0) · `AL_DIA` (>0 dentro de `diasPlazo`) · `VENCIDO` (>0 fuera), con buckets de aging 1-30/31-60/60+. A_FAVOR/SIN_DEUDA/DEBE derivables HOY; AL_DIA vs VENCIDO exige **Fase M** (fecha real) + conectar `diasPlazo`. La CF materializa `diasVencido` en el cliente para listar/ordenar sin leer N subcolecciones. Centraliza signo+etiqueta+color (única fuente).
- **B) IA segmentada (tipo Windows) definida como DATO, no HTML** — `renderSidebar()` en `shared.js` que inyecta el árbol desde un array `grupos→ítems {label, href, icon, rol, badge}`: **Dashboard** · grupo **COBRANZA** (Clientes · Cuentas por cobrar · Vendedoras [sacada de Config] · placeholders Facturación/Reportes) · grupo **TIENDA** (Piezas/Colecciones/Consultas · placeholder Inventario) · grupo **SISTEMA** (Usuarios solo-owner · Configuración) · Ver sitio↗. Gating por rol declarativo. Elimina la duplicación en 8 HTML; cada módulo nuevo entra en SU grupo → nunca vuelve a ser plano.
- **C) Vista de CxC profesional + design-system de datos** — KPIs (Total por cobrar · **Cartera VENCIDA** en rojo con monto+nº · Saldo a favor) vía `carteraResumen` segmentado; chips/tabs por estado con conteo; filtros combinables (vendedora/monto/estado/activo); orden conmutable (días-mora desc por defecto); columna Estado (badge) + días de mora. Clase **`adm-money`** (Space Mono + tabular-nums), stat-cards `min-width:0`+`clamp`, numéricas con tokens reales, tablas→tarjetas en móvil ≤680px. Separar ciclo de vida (activo/archivado) del estado financiero.
- **D) Patrones de escala (cuando crezca / antes del canal web)** — saldo **incremental** en la CF (`FieldValue.increment` con delta before/after = O(1)) + recompute como reconciliación periódica; **agregados desnormalizados** `crm_aggregates/cartera` (dashboard O(1)); **paginación por cursor** (migrar filtro/orden al servidor); **índices compuestos** CRM (clientes por vendedoraId+nombre, saldo desc, activo+nombre; movimientos por registradoEn). Contrato de evento: web/facturación EMITEN movimientos, el CRM los CONSUME vía la CF (no acoplar cartera dentro de facturación); stock/costo en `pieces` sin inflar el doc público.

## Roadmap (orden recomendado, ANTES de facturación/inventario)
- **F0 — Blindaje de integridad del dinero** (días, riesgo cero): `unsubscribe` de listeners + detección de truncado del `limit` (banner/log, nunca un total incompleto como correcto). *Un CRM de dinero no puede mentir en silencio.*
- **F1 — Fundación de dominio**: helper `estadoCuenta` + centralizar signo/color/etiqueta (hoy triplicado). Deriva ya A_FAVOR/SIN_DEUDA/DEBE.
- **F2 — Fase M**: capturar **fecha real** del movimiento + conectar `diasPlazo` + materializar `diasVencido` (habilita aging). [spec ya escrito: `2026-06-06-crm-restructure-...`]
- **F3 — Design-system de datos**: `adm-money` + tablas responsive + tokens; fixes (`#confirm-dialog` en ficha, emojis→SVG, anchos inline→clases). *Resuelve el síntoma visible.*
- **F4 — IA segmentada**: `renderSidebar()` como dato + grupos COBRANZA/TIENDA/SISTEMA; saca Vendedoras de Config; promueve Clientes.
- **F5 — Vista de CxC profesional**: chips/filtros/orden + KPI cartera vencida sobre el modelo de estados.
- **F6 — Escala**: incremental + agregados + paginación + índices (diseñar índices ya; implementar al superar ~300-500 clientes o antes del canal web).
- **SOLO DESPUÉS — Facturación/Inventario** (entidad Venta/Factura canal-agnóstica; stock en `pieces`): brainstorm→spec→plan + Consejo Externo (decisión fuerte, `docs/15`).

## Quick-wins de alto valor (lo que Daniel VE, bajo esfuerzo)
1. Detección de truncado del `limit(2000)` (banner/log) — integridad.
2. `unsubscribe` de listeners (fuga de lecturas/memoria, S3).
3. Clase `adm-money` (Space Mono + tabular-nums) + `min-width:0`/`clamp` en stat-cards — arregla los números desbordados.
4. Hex de saldo → tokens `--adm-danger`/`--adm-success`.
5. `#confirm-dialog` en `admin-cuenta.html` (anular ≠ confirm gris del SO).
6. **Sacar Vendedoras de Configuración a la nav** — resuelve el "no la encuentro".
7. `nowrap` solo en numéricas/fecha + ellipsis en Cliente/Descripción — mata el scroll móvil.
8. Emojis ➕⚖✎ → SVG del sistema.
9. KPI "Cartera vencida" (monto+nº) extendiendo `carteraTotals`.
