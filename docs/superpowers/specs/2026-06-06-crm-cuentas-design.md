# Diseño — CRM Núcleo: Cuentas por Cobrar (fiado) · Bersaglio

- **Fecha**: 2026-06-06
- **Autor**: Daniel Romero (dueño del sistema) + Claude
- **Estado**: aprobado en brainstorming — pendiente plan de implementación (`writing-plans`)
- **Fase**: 3 (CRM), primer módulo. Charter: `docs/50-ARQUITECTURA.md §3`. Base: `docs/superpowers/specs/2026-06-06-kardex-analisis.md`.

## 0. Contexto y objetivo
Reemplazar el **Kardex en Excel** (control de fiado de Bersaglio) por el **núcleo del CRM**:
cuentas por cobrar por cliente y por vendedora, **dentro del panel admin existente**
(`admin*.html` + `js/admin/`, reusando auth, roles y Firestore). Resuelve los problemas
verificados del Excel: fórmulas frágiles (`#REF!`), datos no estructurados, pérdida de
información, sin respaldo ni trazabilidad.

## 1. Alcance
**EN ALCANCE (este spec):**
- Vendedoras (entidad gestionable), clientes, movimientos (factura/abono).
- **Saldo automático** y confiable (server-side).
- Roles y permisos (Daniel / Kary / vendedoras), flujo de corrección con autorización.
- Pantallas (vendedora móvil · Kary · Daniel).
- Migración de los **saldos actuales** del Excel.
- Reportes básicos: ficha de cliente (saldo + historial), cartera total y por vendedora, cuentas atrasadas, cumpleaños.

**FUERA DE ALCANCE (fases siguientes, YAGNI por ahora):**
- Facturación electrónica DIAN (necesita proveedor).
- Inventario / stock y detalle de productos por factura.
- Comisiones de vendedoras, reportes avanzados, notificaciones automáticas.

## 2. Usuarios y roles
| Nivel | Quién | Permisos |
|---|---|---|
| 👑 `owner` | **Daniel** | TODO + gestión de admins/roles + config del sistema. Crea el usuario de Kary. |
| 🛡️ `admin` | **Kary** | TODO el negocio: vendedoras, clientes, movimientos, **eliminar**, **autorizar correcciones**, reportes globales. |
| 🧑‍💼 `vendedora` | cada vendedora | Solo SUS clientes · **solo añadir** (cliente/factura/abono) · **nunca editar ni borrar** · ve solo su cartera. |

Roles **dinámicos**: owner/admin crean vendedoras y asignan rol sin tocar código (se apoya en
custom claims — S4 de Fase 2). Una vendedora del sistema = un usuario de Auth con rol `vendedora` + su perfil.

## 3. Modelo de datos (Firestore)
- **`users/{uid}`** (ya existe): `role` ∈ {owner, admin, vendedora}, `nombre`, `email`, `activo`. El rol se refleja en custom claims para las reglas.
- **`clientes/{clienteId}`**:
  - `nombre`, `telefono`, `whatsapp`, `cumpleanos` (fecha/mes-día), `notas`.
  - `vendedoraUid` (uid de la vendedora dueña) **o** `null` = directo de Kary.
  - `origen` ∈ {`web`, `vendedora`, `kary`} — canal de donde vino el cliente (clave para integrar la web como canal; ver §12).
  - `saldoActual` (number, **desnormalizado**, lo escribe solo la Cloud Function).
  - `activo` (bool), `createdAt`, `createdBy`, `updatedAt`.
- **`clientes/{clienteId}/movimientos/{movId}`** (subcolección = cuenta corriente):
  - `tipo` ∈ {`apertura`, `factura`, `abono`, `ajuste`}.
  - `monto` (number), `fecha` (date), `descripcion`.
  - `registradoPor` (uid), `registradoEn` (serverTimestamp).
  - `anulado` (bool, default false) + `anuladoPor`/`anuladoEn` (anular ≠ borrar).
  - Signo en el saldo: `factura`/`apertura`/`ajuste(+)` **suman**; `abono`/`ajuste(−)` **restan**.
- **`solicitudesCorreccion/{id}`**: `clienteId`, `movId`, `vendedoraUid`, `motivo`, `estado` ∈ {pendiente, aprobada, rechazada}, `valorAnterior`, `valorNuevo`, `solicitadoPor`, `autorizadoPor`, timestamps.
- **`config/{docId}`**: parámetros editables por admin (ej. `fechaCorteMigracion`, datos del negocio para facturas futuras). Lectura admin/vendedora; **escritura solo admin/owner** (la colección `config` ya existe en `firestore.rules`; se endurece el write a admin).

> **Por qué subcolección de movimientos + saldo desnormalizado**: el saldo guardado hace que
> la cartera total/por vendedora sea instantánea (no hay que leer todos los movimientos), y la
> Cloud Function garantiza que SIEMPRE cuadre con los movimientos (imposible romperlo a mano).

## 4. Cálculo de saldo (Cloud Function trigger) — ✅ IMPLEMENTADO (Bloque 2, ADR §43)
- Trigger `onDocumentWritten` sobre `clientes/{id}/movimientos/{movId}` (`functions/index.js` → `recalcSaldoCliente`, lógica pura en `functions/saldo.js`).
- Recalcula `saldoActual = Σ(movimientos no anulados con signo)` y lo escribe en el cliente (única escritura de ese campo; las reglas lo prohíben al cliente).
- Server-side → confiable, independiente del dispositivo, auditado. Nunca `#REF!`.
- Idempotente (recomputa desde cero); transacción para evitar condiciones de carrera.
- **Modelo de signo (RESUELTO, confirmable por Daniel/Kary)**: `factura`/`apertura`/`ajuste` **suman** (`+monto`); `abono` **resta** (`−monto`). `monto`: `factura`/`abono` siempre ≥ 0; `apertura`/`ajuste` (solo admin) pueden ser **negativos** → saldo a favor inicial / corrección a la baja. Saldo **positivo = el cliente debe**; **negativo = saldo a favor** (coherente con §11).
- Verificado: 12 tests de aritmética pura + 5 de integración (emulador Functions+Firestore).

## 5. Permisos (reglas Firestore — conceptual)
- `clientes`: **read** si `admin|owner` **o** (`vendedora` y `resource.vendedoraUid == auth.uid`). **create** si `admin|owner` **o** (`vendedora` y `request.vendedoraUid == auth.uid`). **update/delete** solo `admin|owner` (vendedora NO).
- `movimientos`: **read** = igual que su cliente padre. **create** si `admin|owner` o vendedora-dueña del cliente. **update/delete** solo `admin|owner` (append-only para vendedora).
- `solicitudesCorreccion`: **create** vendedora-dueña; **update** (aprobar/rechazar) solo `admin|owner`.
- `users`/gestión de vendedoras: solo `owner|admin` (vía Cloud Function con custom claims).
- Validación de campos (tipos, montos ≥ 0) en reglas (estilo S6).
- Todas las reglas se prueban en el harness de CI (cuando se reactive) antes de desplegar.

## 6. Flujo de corrección (con autorización)
1. Vendedora pulsa **"Solicitar corrección"** en un movimiento → crea `solicitudCorreccion` (el movimiento NO cambia).
2. Kary ve la **bandeja de solicitudes** → aprueba (corrige/anula el movimiento, lo que dispara el recálculo) o rechaza.
3. Queda registrado: quién pidió, quién autorizó, valor anterior/nuevo. **Nada se borra.**

## 7. Pantallas (responsive: móvil y PC)
- **Vendedora (responsive — celular y PC)**: *Mis clientes* (lista + saldo + buscador) · *Ficha cliente* (datos + saldo + historial + botones grandes ➕Factura / ➕Abono) · *Mi cartera* (total + atrasados). Puede entrar desde el celular (lo más común) **o desde el PC** — sin límite de dispositivo.
- **Kary (celular + PC)**: todo lo anterior de **todas** · *Panel*: cartera total, por vendedora, atrasados, cumpleaños del mes · *Bandeja de correcciones* · gestión de vendedoras/clientes · **Configuración** (fecha de corte de migración, datos del negocio).
- **Daniel (owner)**: todo lo de Kary + gestión de usuarios/roles + configuración.
- **Todas las vistas son responsive**: optimizadas para celular pero **igual de funcionales en PC**; a nadie se le limita el dispositivo. Estilo coherente con el panel admin actual (oscuro); reusa componentes existentes donde aplique.

## 8. Migración de datos (del Excel al sistema)
1. Script (Python/openpyxl) lee `NUEVO KARDEX KARY DEL 2026....xlsx` y extrae por cliente: nombre limpio (separar notas/montos del texto), vendedora, **saldo actual 2026**.
2. Los **saldos rotos (`#REF!`, ~7 clientes)** se listan aparte → revisión manual con Daniel/Kary para el valor correcto.
3. Cada cliente se importa con un movimiento de **`apertura`** = su saldo a la **fecha de corte que Kary configure** (§3 `config`). Los saldos se validan **EXACTOS** contra el Excel (celda por celda; los totales deben cuadrar). Los `#REF!` **NUNCA se inventan** → se confirman con Daniel/Kary antes de migrar.
4. Historial 2024/2025 **se archiva en el Excel** (no se migra).
5. Salida intermedia revisable (JSON/CSV) antes de cargar a Firestore.

## 9. No-funcionales (mentalidad de arquitecto)
- **Seguridad**: RBAC server-side (reglas + custom claims), no solo en la UI. Append-only para vendedoras.
- **Respaldo/durabilidad**: Firestore gestionado por Google (sin "archivo único"); historial de movimientos = fuente de verdad.
- **Modular/escalable**: el módulo de cuentas es independiente y desacoplado; facturación e inventario se añaden después sin romperlo. Serverless (escala sola, $0 base).
- **Auditoría**: cada movimiento y corrección firmado (quién/cuándo).
- **Cost-aware**: saldo desnormalizado + queries acotadas (lección S3: `limit`/paginación en listeners admin).

## 10. Criterios de éxito
- El saldo SIEMPRE cuadra con los movimientos y nunca se rompe (cero `#REF!`).
- Cada vendedora ve/gestiona solo lo suyo; Kary ve todo; nadie borra salvo Kary/Daniel.
- Los saldos actuales del Excel quedan migrados sin re-teclear.
- Funciona bien en celular.
- Datos respaldados y trazables.

## 11. Supuestos y preguntas abiertas
- **Supuesto**: un cliente pertenece a UNA vendedora (o a Kary). (En el Excel es 1:1.) Si un cliente compra a varias vendedoras, se revisará en su momento.
- **Supuesto**: saldo a favor del cliente = saldo negativo (permitido).
- **Decidido**: la **fecha de corte** de migración NO se fija en código → **configurable por Kary** en una pantalla de **Configuración** (Daniel desarrolla; la fecha es decisión operativa de Kary). Ver `config` (§3) y §7.
- **Decidido**: la **vendedora crea clientes directamente** (quedan asignados a ella; Kary los ve). Cualquier inconsistencia, **Kary la modifica o elimina**.
- **Principio (NO asumir)**: ningún dato se inventa. Ante duda → consultar el Excel del repo. Todo monto/saldo debe ser **exacto, como las matemáticas** (ver §8 y §10).

## 12. Visión de integración (la web como canal de ventas)
El sistema es **una sola plataforma con datos compartidos**, no módulos aislados. La web pública
(bersagliojewelry.co) es **un canal de ventas más**, junto a vendedoras y Kary directo.
- **Productos = colección `pieces` existente** (la que YA muestra la web). El módulo de inventario le añade stock/costo a ESA colección; no se duplica el catálogo.
- **Clientes = únicos**, con campo `origen` (web/vendedora/kary). Una venta de cualquier canal apunta al mismo cliente y, si es a crédito, a su cuenta por cobrar (este módulo).
- **Ventas/Facturas** serán canal-agnósticas: una compra web podrá crear cliente + venta + movimiento de cuenta + descontar stock + generar factura.

**Hoy**: la web es escaparate (catálogo + WhatsApp) y el fiado está en Excel → **separados**.
**Destino** (por fases, sin romper nada): 1) núcleo de cuentas (este spec) · 2) inventario (stock sobre `pieces`) · 3) conexión de ventas web (compra online → cliente+venta+cuenta+stock) · 4) facturación.

**Implicación de diseño AHORA**: el núcleo se hace **canal-agnóstico** (cliente con `origen`,
movimientos sin acoplar al canal) para que las fases 2-4 encajen **sin reescribir**. Es una
**decisión de arquitectura fuerte** (`CLAUDE.md §G.2 🛰️`): define cómo TODO se conecta.
