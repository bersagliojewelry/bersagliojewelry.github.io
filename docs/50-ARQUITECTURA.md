# 🏛️ 50 — ARQUITECTURA (North-Star + Charter de Reconstrucción del CRM)

> **Nodo neuronal: doctrina de arquitectura.** El "norte" técnico del proyecto:
> cómo se conecta, escala, se mantiene seguro y evoluciona el sistema. Se lee
> on-demand ante **Trigger de Decisión Fuerte** (`CLAUDE.md §G.2`) o al diseñar/
> extender la reconstrucción del CRM. Resumen always-on en `CLAUDE.md §3.6`.
>
> **Origen**: directiva del cliente (2026-06-05, **reafirmada con fuerza 2026-06-06** tras revisar el panel) — *"piensa como arquitecto de
> software, no solo escribas código; piensa en el sistema completo, no en una función"*. Gobierna el rediseño del panel admin + CRM/facturación/inventario. Tope ~200 líneas (§G.5); shard por dominio si crece.

---

## 0. Mandato — qué significa "pensar como arquitecto" aquí
No es escribir más código, sino **tomar mejores decisiones** que impactan todo el sistema.
Cada decisión se evalúa por su efecto en: **negocio · escalabilidad · seguridad · costo ·
mantenibilidad · integración**. *El código hace que funcione; la arquitectura hace que
**sobreviva**.* Lema rector: **"la mejor arquitectura no es la más compleja, es la que
genera más valor con menos fricción"**.

## 1. Principios rectores (always-on)
1. **Sistema completo, no la función** — decidir por cómo se conectan e impactan los módulos.
2. **Diseñar para el crecimiento** — soportar más carga sin perder rendimiento/estabilidad: desacoplar, cachear, evitar cuellos de botella.
3. **Seguridad por diseño (no al final)** — autenticación, autorización (least-privilege), protección de datos (tránsito/reposo), validación server-side, secretos fuera del código, monitoreo/auditoría.
4. **Cost-aware** — toda decisión tiene impacto financiero (infra, rendimiento, mantenimiento). Invertir en diseño hoy ahorra mañana.
5. **Cero monolitos** — bajo acoplamiento, límites claros, cambios/despliegues independientes.
6. **Integración deliberada** — definir CÓMO colaboran los servicios, no solo que funcionen. Patrones y **cuándo cada uno**: **REST/HTTP** (request-response, el default) · **GraphQL** (el cliente arma su consulta; muchas vistas/campos) · **eventos** (desacoplar productor/consumidor; en Firebase = triggers Firestore) · **colas/mensajería** (trabajo pesado/diferido en 2º plano) · **webhooks** (servicios externos: pasarela de pago, DIAN) · **gRPC** (alto rendimiento entre microservicios — *aquí NO aplica*, §2). Elegir por **acoplamiento + latencia + costo**, no por moda.
7. **UX / Arquitectura de Información** — el panel y el producto se diseñan **segmentados y ordenados** (jerarquía clara, estados explícitos, filtros/orden), como un sistema profesional que escala a más módulos — NO features sueltas en un menú plano. La IA es decisión de arquitectura (directiva 2026-06-06).

## 2. Reconciliación con la realidad (zero-budget · serverless · free-tier)
**Restricción**: AltorraCars (el dev) trabaja **sin presupuesto** — sin dominio aún; stack GitHub (Pages) + Firebase (Spark/free) + Node (Cloud Functions). El arquitecto **NO** hace cargo-cult de microservicios/gRPC/Kubernetes (caros y sobre-dimensionados aquí). Decisiones correctas para ESTE contexto:
- **Serverless = escala horizontal gratis y gestionada**: Firestore y Functions escalan solos → la "escala horizontal" ya la resuelve la plataforma; el foco es **usarla bien**.
- **Wins reales de arquitectura aquí**: (a) **límites de módulo limpios** (Catálogo/Inventario · CRM-leads · Pipeline · Facturación · Reportes) que PODRÍAN separarse luego; (b) **modelado de datos** consciente del costo de lectura (índices, desnormalización deliberada); (c) **seguridad por diseño** (reglas least-privilege, App Check, custom claims, validación) → `41-SEGURIDAD`; (d) **event-driven** vía triggers Firestore + Functions para async/pesado (ya: `onPieceDeleted`/`onInquiryCreated`); (e) **patrones cost-aware** (paginación de listeners — S3 ✅; lecturas mínimas; cache cliente vía `system/meta`).
- **Regla**: elegir lo que da más valor con menos fricción/costo, **no** lo más "enterprise".

## 3. Charter — Reconstrucción del CRM (Fase 3, reencuadrada)
**Objetivo**: REEMPLAZAR el CRM/admin actual por uno **bien arquitecturado, escalable, seguro y completo**.
**Dominio**: **Bersaglio Jewelry (alta joyería)** — ✅ confirmado (2026-06-05): a Bersaglio se le hará **CRM + facturación + inventario** en ESTA web. AltorraCars = dev/agencia que lleva **varios proyectos en paralelo** (de ahí cruces ocasionales de mensajes de commit entre repos — el commit `8249f19` quedó con un mensaje de otro proyecto, pero su contenido SÍ es de Bersaglio).
- **Skills de apoyo** (ya disponibles — NO requieren crear skill nueva): `crm-architect` (modelo de datos, pipeline, RBAC, reglas, Functions, CI/CD; packs joyería-retail/inmobiliaria/concesionario) + `ecommerce` (DIAN/PSE/Wompi, facturación CO) + `security-review`.
- **Módulos previstos** (límites candidatos, bajo acoplamiento): Catálogo/Inventario · CRM (leads/clientes/contactos) · **Cuentas por cobrar / fiado** (núcleo) · Pipeline de ventas · Facturación (DIAN — necesita proveedor → fasificar) · Reportes · Auth/RBAC.
- **Base real = el Kardex actual** (análisis exhaustivo: `docs/superpowers/specs/2026-06-06-kardex-analisis.md`). Hoy es un Excel de **cuentas por cobrar/fiado** por cliente y por vendedora, con cuenta corriente mensual y saldos por fórmula **frágil** (`#REF!` → pérdida de info real). El módulo central del CRM reemplaza eso: clientes/vendedoras estructurados + facturas/abonos como registros + saldo calculado confiable + histórico continuo.
- **Integración multicanal (decisión fuerte 2026-06-06)**: la **web pública es UN canal de ventas** (junto a vendedoras y Kary directo). Datos COMPARTIDOS, sin silos: **productos = colección `pieces`** (la que ya usa la web; inventario le añade stock) · **clientes únicos** con campo `origen` · ventas/facturas canal-agnósticas. El núcleo de cuentas se diseña canal-agnóstico para que web/inventario/facturación encajen **por fases sin reescribir**. Detalle: `docs/superpowers/specs/2026-06-06-crm-cuentas-design.md §12`.
- **Protocolo de fase (regla operativa — directiva Daniel 2026-06-07, reafirmada 06-08)**: ANTES de moldear/construir CUALQUIER fase del panel, hacer un **barrido holístico de TODO el panel admin** (vía `20-ESPACIAL` + spec norte + código real `admin*.html`/`js/admin/`: qué módulos hay vs placeholders, estado de cada uno) y **encajar la fase en el norte (mini-ERP)** — NO diseñar la pieza aislada. Luego spec → plan → build. (Operacionaliza §0 + la memoria `feedback_revisar_panel_completo`; antes solo vivía en memoria, ahora versionada aquí.)
- **Arranque de Fase 3** (cuando se decida): brainstorm → spec → `writing-plans` → ejecución incremental verificada; cada decisión fuerte → Consejo Externo (`15`) + registrar en §5.

## 4. Stack y topología actual (base sobre la que se construye)
- **Front**: HTML/CSS/JS vanilla modular + Vite. **Hosting**: GitHub Pages (CSP solo via `<meta>` — `30 §L-11`).
- **Back**: Firebase — Firestore (datos + realtime), Auth (rol en `users/{uid}.data.role`; migrar a custom claims, S4), Storage, FCM, Cloud Functions (`functions/`: triggers + `onCall`). Reglas: `firestore.rules` / `storage.rules`.
- **CI/CD**: GitHub Actions — `deploy.yml` (build Vite → Pages, inyecta `VITE_*`) + `firebase-deploy.yml` (rules/functions).
- Detalle espacial → `20-ESPACIAL` · seguridad → `41-SEGURIDAD` · performance → `45-PERFORMANCE`.

## 5. Decision log (ADRs de arquitectura — apéndalos aquí)
- **2026-06-11 · Directiva de Daniel — RBAC por DEPENDENCIAS y roles granulares (futuro, TODO-19)**: el panel debe poder crear **usuarios por dependencia** con roles que acoten qué VE y qué MANEJA cada uno — p.ej. usuario administrativo/contable (rol CONTADOR: conciliación, reportes, sin tocar ventas), usuario comercial (rol ASISTENTE_VENTAS), etc. *"…para que se pueda tener control de qué ve cada usuario y qué puede manejar o controlar."* Encaje: extensión de la taxonomía actual (owner/admin/editor, custom claims §65) + gating del sidebar (`renderSidebar` ya filtra por rol — la IA "C" como dato lo soporta sin reescribir) + reglas por módulo. El rol CONTADOR ya estaba previsto (política de cartera v1.1: conciliación con usuario de Daniel HASTA rol contador futuro). **Momento**: post-Fase M; es Decisión Fuerte (matriz de permisos por módulo) → diseñar con Consejo Externo + skill `crm-architect` (pack RBAC). NO improvisar roles sueltos antes de esa matriz.
- **2026-06-06 · CRM Bloque 1 (ADR §42)** — decisiones fundacionales del núcleo de cuentas por cobrar:
  - **Libro append-only** como fuente de verdad: la vendedora SOLO agrega `movimientos` (factura/abono); nunca edita/borra. Correcciones por flujo autorizado (`solicitudesCorreccion`). → trazabilidad e integridad sin "archivo único" frágil (vs. el Kardex Excel con `#REF!`).
  - **Saldo desnormalizado + CF como única escritura** de `saldoActual`: lecturas O(1) de cartera; el cálculo server-side (Bloque 2) garantiza que SIEMPRE cuadre. Reglas prohíben que el cliente escriba `saldoActual` (whitelist `hasOnly`).
  - **RBAC server-side por reglas** (least-privilege) leyendo rol de `users/{uid}` (custom claims = optimización futura S4, no bloqueante). Multi-tenant por pertenencia (`get()` del padre), no por confianza en el uid firmante.
  - **Canal-agnóstico** (ya en §3): cliente con `origen`, movimientos sin acoplar al canal → web/inventario/facturación encajan por fases sin reescribir.
  - **`config` partido por sensibilidad**: `config/status` público (health-check), resto restringido → no exponer datos del negocio al ser la web un repo público (L-15).
  - Verificación: TDD en emulador real (54 tests) + revisión adversarial multi-agente (L-16). Despliegue gated (merge a `main` con OK de Daniel).
- **2026-06-06 · CRM Bloque 2 (ADR §43)** — cálculo de saldo:
  - **Saldo por recompute idempotente** (Cloud Function `recalcSaldoCliente`, `onDocumentWritten` de movimientos): recalcula desde la fuente de verdad (todos los movimientos no anulados) en transacción, en vez de incrementar → imposible de desincronizar (elimina la fragilidad del Excel). Es la **única** escritura de `saldoActual` (Admin SDK bypassa reglas; el cliente lo tiene prohibido).
  - **Lógica de dinero como función pura** (`functions/saldo.js`) → aritmética exacta testeable sin emulador (doctrina "precisión exacta"). Glue del trigger validado por integración (L-17).
  - **Modelo de signo**: `factura`/`apertura`/`ajuste` suman, `abono` resta; `monto` de apertura/ajuste puede ser negativo (saldo a favor / corrección a la baja). Saldo +debe / −a favor. Marcado confirmable por Daniel/Kary.
- **2026-06-07 · Panel v2 — arquitectura maestra del sistema completo (ADR §50)** — spec norte: `docs/superpowers/specs/2026-06-07-bersaglio-arquitectura-maestra-design.md` (v3; red-team empresarial + Consejo Externo Gemini 3.1 Pro). Decisiones congeladas: **IA "C" como DATO** (`renderSidebar`/`sidebar-data`; evoluciona a "B" conmutador de áreas sin reescribir) · **event-driven con orquestador síncrono** (CF callable = único escritor del dinero; **saldo síncrono recompute O(M)** en la transacción — NO async, NO incremental prematuro) · **Money entero COP sin backfill** (ya exacto en JS) · **factura DIAN-ready por Adapter** (no acopla el schema a UBL) · append-only + anular≠borrar · RBAC por custom claims · Leads/Comunicaciones reemplazan "Consultas". Fases **F-CHASIS-A ✅ desplegada** → F1…F9. El Consejo Externo **simplificó** el diseño (eliminó backfill + maquinaria async/reconciliación-como-requisito). Decisiones fuertes restantes (ventas/factura/inventario) → Consejo antes de F7.
