# ⛏️ Minería de recursos externos — TODO-75 (2026-07-10) · SÍNTESIS

> **Hoja de detalle** (madre: spec `superpowers/specs/2026-07-10-plan-maestro-v5-ia-tesoreria.md §9` · ADR §183).
> 5 exploradores acotados (Opus 4.8, lista cerrada, sin web) + verificación propia Fable 5 por recurso
> (§3.3: cada veredicto se aceptó SOLO tras spot-check del archivo citado). CRUDO completo →
> bóveda `../brain-private/bersaglio/research-archive/2026-07-10-todo75-mineria-recursos-CRUDO.md`.
> Los 5 recursos viven en `C:/Users/romad/Downloads/` (borrables cuando Daniel quiera; lo valioso ya está aquí).

## Resumen ejecutivo
| Recurso | Veredicto | Destino de lo adoptado |
|---|---|---|
| **twenty CRM** (~26k archivos) | ⛏️ ORO conceptual: 7 principios ADOPTAR YA + 7 DESPUÉS | Specs F-IA-2/F-TESORERIA/F-COMPRAS (§ abajo) |
| **RECURSOS CLAUDE** (Divisual) | 90% descartado; 3 técnicas + 2 parqueados | F-COMPRAS · skill meta-ads · marketing |
| **skills-main** | ❌ ÍNTEGRO (premisa falsa: era el CLI de vercel-labs, no catálogo) | — |
| **adspirer** | ❌ NO instalar (MCP de pago, redundante); ⛏️ 12 técnicas paid-media | skill `meta-ads-diagnostico` (aplicado) |
| **impeccable v3.9.1** | ❌ NO reemplazar la instalada; ⛏️ checklist calidad/tipografía/motion | `33-DOCTRINAS-CSS §4` (aplicado) |

## 1. twenty CRM — principios adoptados (vinculantes para las fases del plan v5)
**ADOPTAR YA** (entran a las specs de F-IA-2 / F-TESORERIA / F-COMPRAS como requisitos):
1. **Dinero jamás number desnudo**: `{monto: entero COP, moneda:'COP'}` en todo doc (ya es práctica; ahora es regla explícita del ledger). [T-3]
2. **Sello de actor en todo doc de plata**: `creadoPor{uid, nombre, fuente ∈ MANUAL|WEBHOOK|SISTEMA|IMPORT}` — bóveda, tesorería, CxP, abonos. [T-7]
3. **Timeline de cliente = colección `actividades`** `{happensAt, tipo, properties:JSON, refCliente}` — feed unificado (fió/abonó/acuerdo/apartado) para la ficha F-IA-2; ídem lead de cars. [T-5]
4. **Ficha de cliente en pestañas** [Datos | Cartera | Pedidos | Apartados | Actividad] con bloque "registros relacionados" enlazando ambos sentidos (NO editor drag&resize). [T-13]
5. **Permisos de 2 capas por CAPACIDAD** (flags `APROBAR_BOVEDA`, `CERRAR_CAJA`, `EXPORTAR_CARTERA`…) + **row-level por propietario** (cajera ve solo SU turno: `turno.operadoraId == auth.uid`) → traducir a Firestore Rules; en cars: vendedor ve solo sus leads. [T-16][T-18][T-19]
6. **Dashboard "Hoy" = lista de widgets agregados** (cada widget = query + operación sum/count) — fila de KPIs + 1-2 barras, no un dashboard monolítico. [T-24]
7. **Bandeja única de aprobaciones = vista filtrada multi-origen** (`estado==pendiente_aprobacion` sobre bóveda/ajustes/acuerdos) + acción aprobar/rechazar que estampa actor — NO módulo nuevo. [T-25]

**DESPUÉS** (cuando el ERP madure): teléfonos/emails como arrays `{valor,label,esPrimario}` [T-2] · vistas guardadas con filtros AND/OR anidados [T-10/T-11] · total $ por columna kanban [T-23] · favoritos/carpetas en rail por usuario [T-8] · dedupe por teléfono al migrar directorio [T-27] · catálogo de triggers (cron recordatorio cuota, on-update arqueo descuadrado) [T-28] · `pagoTargets` morph-junction para pagos multi-destino [T-6] · side-panel de cliente en POS [T-12].

**NADA**: motor metadata-driven completo, editor de layout, billing Stripe como base de facturación, command palette como UI primaria de Kary, sync email/calendario, stack React/Nest/Postgres.

## 2. RECURSOS CLAUDE (pack "La Tribu Divisual") — 3 técnicas + 2 parqueados
**Adoptado**: (a) patrón **"carpeta de facturas PDF → extracción → tablero"** con regla "solo datos reales extraídos" → insumo directo para F-COMPRAS (cargar facturas de proveedor); (b) **auditoría de competencia vía Biblioteca pública de Meta** + coherencia anuncio↔landing (sin acceso a la cuenta ajena) → aplicado en skill `meta-ads-diagnostico`; (c) worksheet **"oferta irresistible"** (cliente ideal→dolores→deseo→oferta) → insumo de promociones (`RECURSOS YOUTUBE/plantilla_oferta_irresistible.docx`).
**Parqueado (decisión de infra pendiente, NO urgente)**: n8n como capa de automatización — únicos encajes reales: agente WhatsApp y agente reseñas Google; mete infraestructura externa y Kary no es técnica. Canva-lote para creatividades masivas (si se valida el MCP). `claude-youtube` solo si algún día hay canal.
**Descartado**: todo lo demás (skills duplicadas/inferiores, kit de video 1.3 GB, VPS/Ollama, embudos de venta, basura macOS).

## 3. skills-main — CALLEJÓN PROBADO
NO era el catálogo anthropics/skills: es el **CLI `skills` de vercel-labs** (v1.5.14) con una sola skill-anzuelo (`find-skills`). Descartado íntegro: redundante con `claude-automation-recommender` + inventario curado; riesgo de cadena de suministro (instalador genérico de skills de terceros). *No re-investigar este ZIP.*

## 4. adspirer — conocimiento minado (aplicado en `skills/meta-ads-diagnostico`)
NO instalar: todo cuelga de un MCP remoto **de pago** (`mcp.adspirer.com`, Free=15 calls/mes) y duplica el MCP de Meta directo ya conectado. Las 12 técnicas (C-1..C-12, detalle en bóveda) se destilaron en la sección "Doctrinas minadas 2026-07-10" de la skill: tracking-first, presupuesto concentrado, 4 formas de desperdicio + umbral de evidencia, fatiga creativa, specs/KPIs Meta, copy desde evidencia, contrato de seguridad paid-media, falsos positivos de reporting. Pujas Google [C-9] y STRATEGY.md con directivas tipadas [C-11] quedan en bóveda como referencia (cars).

## 5. impeccable v3.9.1 — principios minados (aplicados en `33-DOCTRINAS-CSS §4`)
NO reemplazar `skills/impeccable/` instalada (linaje distinto: la nuestra trae refs de teoría que la v3.9.1 no tiene). ⚠️ Hallazgo clave: su detector "slop" marca **firmas deliberadas de Bersaglio** (Liquid Glass, Cormorant itálica, Fraunces, paleta perla, dark-glow) — correrlo crudo pelearía con la marca. Se minó solo la mitad `quality` (WCAG/legibilidad) + tipografía + reveal-safety + z-index semántico → `33 §4`. OPCIONAL futuro: `detect.mjs` offline como gate determinista pre-Chrome en W-11 capa 9, con allow-list de marca pre-cargada (`ignore-value italic-serif-display`, `overused-font Fraunces`, etc.).
