# Plan maestro v5 — Reestructuración holística: IA del panel + Tesorería + Compras (2026-07-10)

> **Decisión Fuerte** (Daniel: *"todo el plan se debe reestructurar y pensar de forma correcta…
> combinando el poder de Amazon y Mercado Libre + los mejores POS, facturación, contables y CRMs,
> optimizado para Bersaglio"*). Proceso: auditoría en vivo con Chrome (evidencia por pantalla) →
> comité ×3 (arquitecto IA ERP · contadora PyME CO · UX no-técnicos) → síntesis Fable 5.
> Actualiza el norte de `2026-06-07-bersaglio-arquitectura-maestra-design.md` (v4 → v5); aquella
> sigue vigente en lo no contradicho. ADR: §182.

---

## 1. Auditoría (hallazgos con evidencia, 2026-07-10)

| # | Hallazgo | Evidencia | Resuelto |
|---|---|---|---|
| A1 | Menú "Clientes" abre página "Cuentas por cobrar" (directorio+cartera fusionados) | screenshot admin-cuentas | Nombre honesto hoy; split en F-IA-2 |
| A2 | KPI "Cartera vencida" desbordado sobre la tarjeta vecina; aging ilegible (mono 11px) | screenshot | ✅ hoy (abreviado $506,7 M + exacto + mini-barra) |
| A3 | "Configuración" = cajón de sastre (migración+cobranza+negocio+vendedoras) y "Parámetros" duplica cobranza | screenshots | Renombrada "Negocio y equipo" hoy; fusión con pestañas en F-IA-2 |
| A4 | Aprobaciones del dueño dispersas (Bóveda y Salud) | screenshots | Bandeja única en F-IA-2 |
| A5 | "Hoy"/Dashboard sin NINGÚN dato de dinero | screenshot | F-IA-2 (pulso del negocio) |
| A6 | POS ofrecía "Anular" en ventas entregadas de días anteriores | screenshot | ✅ hoy (void solo turno abierto) |
| A7 | `window.prompt()` nativo para el fondo de apertura | flujo E2E | ✅ hoy (modal propio) |
| A8 | Placeholders "PRONTO" regados (Pagos/Recibos, Inventario, Films, Reportes) | nav | ✅ hoy (cero cascarón; nacen al existir) |
| A9 | Tesorería multi-cuenta y Proveedores (Excel de Kary) sin hogar en el plan | entrevista Daniel | Fases F-TESORERIA / F-COMPRAS (este doc) |
| A10 | 344 clientes "Vencido · 4 días" uniforme — parámetros de corte/plazo sin configurar en prod | screenshot + Config vacía | Tarea de datos con Kary (pre-lanzamiento) |

## 2. Rail definitivo (comité ×3 — convergencia)

**Hoy** · **Ventas** (Mostrador · Pedidos) · **Clientes** (Clientes y cartera → se parte en F-IA-2 · Interesados) · **Finanzas** (Caja y turnos · Bóveda · +Cuentas y bancos en F-TESORERIA) · **Inventario** (Piezas · Colecciones · Servicios) · **Sitio web** (Journal · Home · Contacto · +Films y Redes cuando exista) · **Sistema** (Usuarios · Negocio y equipo · Parámetros · Salud del sistema). Futuros: grupo **Cartera** (al partir A1), **Compras** (F-COMPRAS), **Reportes** (F-REPORTES).

Reglas permanentes: (1) menú == título de página == breadcrumb; (2) español claro es-CO ("Cartera", "Interesados", "Proveedores", "Cuentas y bancos" — jamás CxC/CxP/leads/tesorería en UI); (3) cero "PRONTO" en el rail; (4) lo diario de Kary a 1 clic (patrón Square/Loyverse: en F-IA-2 el rail gana zonas DIARIO/ADMINISTRAR y botón "Vender" persistente); (5) microcopy de dinero: qué pasó + qué pasó con la plata + qué hacer.

## 3. F-IA-2 — Panel coherente (siguiente sesión de UI)
1. **Split Clientes/Cartera**: `admin-clientes.html` (directorio + ficha) y `admin-cartera.html` (KPIs aging, vencidos, acuerdos, filtros de mora) — grupo "Cartera" nace en el rail. Ficha ↔ cartera enlazadas en ambos sentidos.
2. **"Hoy" con dinero** (pulso, máx 5 señales): vendido hoy ($ y #) · estado del turno/efectivo · quién paga hoy (cuotas vencen, con nombres) · pedidos por entregar · avisos (aprobaciones+salud). Vista Daniel añade: plata total (cuentas+bóveda), ¿cuadró el último arqueo?
3. **Parámetros unificados**: fusionar Configuración+Parámetros en UNA página con pestañas (Negocio · Cobranza · Caja · Fiscal · Equipo); mata la cobranza duplicada; "Migración del Kardex" se retira de la UI (ajuste one-time, ya aplicado o via runbook).
4. **Bandeja única de aprobaciones** (patrón banca empresarial): agrega reversas/ajustes de bóveda + correcciones de cartera; badge en el rail; cada solicitud enlaza a su contexto y la página de origen muestra "Esperando aprobación".
5. **Export contador** se muda del POS a Reportes ("Para el contador") cuando nazca F-REPORTES.

## 4. F-COMPRAS — Proveedores (espejo del fiado; modelo de la contadora)
- **`proveedores/{id}`**: razonSocial, nit+dv, regimen (responsable IVA/no), telefono, plazoDias, activo. UNA página: directorio + deudas + pagos (paridad con el Excel de Kary; sin "pedidos a proveedor" hasta que se necesite).
- **`proveedores/{id}/documentos/{id}`** (append-only): factura de proveedor {numero, fecha, vencimiento, total} y **anticipo** (saldo propio, se cruza contra facturas — típico joyería: taller/gemólogo). `saldo` por recompute CF (patrón recalcSaldoCliente).
- **`abonosCxP`**: {documentoId, monto, **cuentaId** de tesorería de donde salió (amarra CxP↔tesorería), soporteURL, creadoPor}. Regla: TODO pago a proveedor exige cuenta origen (bancarización art. 771-5 ET).
- Retenciones NO se calculan (las liquida el contador con el exporte); solo se captura `regimen`.
- CxC ya probado se reusa: reglas append-only, anular=asiento inverso aprobado, CF única escritora.

## 5. F-TESORERIA — "Cuentas y bancos" (Decisión Fuerte; aplicar `auditoria-financiera` COMPLETA)
- **`cuentasTesoreria/{id}`**: nombre, banco, tipo (banco/nequi/caja/boveda), titular (empresa/kary/daniela/veronica), esDeSocia:bool, activa, saldoInicial+fechaCorte. Semilla: las 7 cuentas reales + enlaces virtuales a Caja/Bóveda existentes (no duplicar sus ledgers: la caja y la bóveda SIGUEN siendo sus módulos; tesorería consolida la vista).
- **`movimientosTesoreria/{opId}`** (ledger append-only, CF única escritora, idempotente por opId): cuentaId, fecha, monto (COP entero, signo por naturaleza), tipo ∈ {ingreso_venta, abono_cartera, pago_proveedor, servicio_publico, gasto, traslado_in, traslado_out, aporte_socia, reembolso_socia, retiro_socia, ajuste_inverso}, contraparte{tipo,id}, descripcion, soporteURL (foto comprobante), refDocumento, conciliado:bool, periodoConciliado, creadoPor.
- **Traslado entre cuentas = PAR ATÓMICO** (una CF crea out+in con el mismo trasladoId en UNA tx — jamás dos registros manuales; causa #1 de descuadre).
- **Socias**: la cuenta personal es un CANAL; cada peso se clasifica contra la subcuenta de la socia (aporte=préstamo socia→empresa · reembolso=devolución · retiro=requiere doble aprobación de Daniel, como bóveda). Saldo socia por recompute. ⚠️ Advertir a Daniel: mezclar cuentas personales tiene riesgo tributario para las socias (el sistema lo ordena y documenta, no lo legaliza; meta: migrar a la cuenta empresa).
- **Conciliación mensual manual** (sin API bancaria): por cuenta, lista de no-conciliados del período → Kary marca ✓ contra el extracto → saldoSistema vs saldoExtracto → diferencia = lista de no-marcados; residuo → ajuste_inverso aprobado. GMF/comisiones se registran ahí como gasto.
- **Saldos**: saldoInicial + Σ movimientos, recompute server-side. Vista consolidada "plata total" (cuentas+caja+bóveda) para Daniel.
- **NO construir** (anti sobre-ingeniería, comité): PUC completo, partida doble formal, NIIF, centros de costo, multi-moneda, retenciones automáticas, matching bancario automático, presupuesto. Esto es un libro auxiliar de tesorería+CxP impecable; la contabilidad formal es del contador (exportes CSV).
- Invariantes obligatorias (skill `auditoria-financiera`): conservación · mismo-número-en-todas-las-vistas · idempotencia global · deshacer-netea-todo · estados muertos únicos · SoD/doble aprobación · anomalías en rojo. Tests de integración por ESCENARIO antes de deploy.

## 6. F-REPORTES — cuando existan los datos
Ventas (día/semana/mes, por medio, por canal) · Cartera (aging, recaudo) · Finanzas (flujo por cuenta, GMF) · "Para el contador" (exportes CSV: ventas, CxC, CxP, tesorería). Nada de BI: 4 reportes que Kary/el contador realmente usan.

## 7. Orden de ejecución propuesto (gates de confiabilidad de Daniel)
F-IA-2 (panel coherente) → F-TESORERIA (el dolor #1 de Kary: descuadres) → F-COMPRAS → F-REPORTES → F2.4 apartados (ya spec'd) → limpieza de datos (§8) → **campaña de rompimiento** (muchos agentes intentando romperlo + validación Chrome holística, exigencia de Daniel) → lanzamiento a Kary. Cada fase de dinero: spec → comité → TDD → deploy → validación viva.

## 8. Runbook de limpieza pre-lanzamiento (documentado, NO ejecutado)
Cuando Daniel dé la orden final: **BORRAR** pedidos de prueba (todos EXCEPTO `d87ab568…` código BJ-HPFS-84R8, la compra real de $5.000) · turnos · movsCaja · bovedaMovimientos · arqueo · webhookEvents de prueba · saludEventos resueltos · clientes/vendedoras DE PRUEBA. **CONSERVAR**: piezas/colecciones reales, config, usuarios, el pedido real. **⚠️ DECISIÓN PENDIENTE de Daniel+Kary**: los 344 clientes y su cartera de $506M vienen del Excel REAL de Kary (migración §47) — NO son datos de prueba; borrarlos = perder la cartera real. Confirmar: ¿se conservan (recomendado) o Kary re-registra desde cero? El borrado se hará por script auditado (Admin SDK, dry-run primero, respaldo previo vía backup diario §64) — nunca a mano.

## 9. TODO-75 — Minería de recursos externos (Daniel 2026-07-10; PRIORIDAD 1 de la sesión fresca)
Revisión PROFUNDA de 5 recursos descargados (rutas verificadas ✅ 2026-07-10). Extraer SOLO lo
accionable a neuronas/skills (libre albedrío autorizado; anti-fragmentación §G.4). Método:
exploradores acotados por recurso (uno c/u, lista cerrada, formato hallazgo→aplicación concreta a
Bersaglio/cars/inmobiliaria) + verificación propia antes de adoptar (skill `auditoria-financiera`
Fase B/C adaptada a conocimiento).
1. `C:/Users/romad/Downloads/twenty-main` — **twentyhq/twenty**: CRM open-source real (~30k★,
   se posiciona como alternativa open a Salesforce; confirmar estado actual). JUGO esperado:
   modelo de datos CRM (objetos/campos custom, timeline de actividad), IA/navegación y patrones
   UI de un CRM profesional (comparar contra nuestro rail v2 y F-IA-2), workspace multi-usuario,
   ideas para F-TESORERIA/F-COMPRAS. NO adoptar stack (React/Nest/Postgres ≠ nuestro vanilla+Firebase):
   se minan CONCEPTOS y UX, no código.
2. `C:/Users/romad/Downloads/RECURSOS CLAUDE` — contenido desconocido; inventariar y clasificar.
3. `C:/Users/romad/Downloads/skills-main` — probable repo de skills (¿anthropics/skills?);
   comparar contra nuestro catálogo, adoptar las valiosas que falten.
4. `C:/Users/romad/Downloads/adspirer-mcp-plugin-main (1)` — plugin MCP de ads; evaluar utilidad
   para marketing de Bersaglio/cars.
5. `C:/Users/romad/Downloads/impeccable-main` — probable skill/framework de calidad UI; comparar
   con `impeccable` ya instalada en skills/.
**⛔ REGLA**: el PROMPT A ALTORRA (§182 + skills nuevas + lo minado aquí) está EN ESPERA hasta
cerrar este TODO — se envía UNO solo ampliado (un solo chat toca el cerebro a la vez).

> ✅ **EJECUTADO 2026-07-10 (ADR §183)**: síntesis → `docs/mineria-recursos-2026-07-10.md` · CRUDO →
> bóveda `research-archive/2026-07-10-todo75-mineria-recursos-CRUDO.md`. Adopciones aplicadas:
> twenty (7 principios ADOPTAR-YA, vinculantes para F-IA-2/F-TESORERIA/F-COMPRAS) · adspirer 12
> técnicas → `skills/meta-ads-diagnostico` · impeccable → `33-DOCTRINAS-CSS §4` · Divisual 3 técnicas.
> skills-main = callejón (CLI vercel-labs). Prompt a ALTORRA desbloqueado.
