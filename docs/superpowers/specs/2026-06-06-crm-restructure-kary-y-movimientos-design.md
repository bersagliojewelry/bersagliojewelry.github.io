# Diseño — CRM Reestructura: Operación centralizada en Kary + Movimientos robustos · Bersaglio

- **Fecha**: 2026-06-06
- **Autor**: Daniel Romero (dueño) + Claude
- **Estado**: aprobado en brainstorming — pendiente plan de implementación (`writing-plans`)
- **Supersede**: `docs/superpowers/specs/2026-06-06-crm-cuentas-design.md` §2, §5, §6, §7 (modelo vendedora-usuario) y refina §3 (datos) y §8/§11. El resto de aquel spec sigue vigente.
- **Charter**: `docs/50-ARQUITECTURA.md §3`. ADRs base: §42–§48 (CRM construido, lanzado y migrado).

## 0. Contexto y motivo del cambio
El CRM se lanzó a producción (ADR §47) con 344 clientes reales de Kary. Al verlo en uso real, Daniel/Kary detectaron que el diseño original NO refleja cómo opera el negocio:

1. **Las vendedoras NO usan la plataforma.** Le pasan la información a **Kary** (nuevos clientes, facturas, abonos) y **Kary lo carga todo**. Solo Kary (admin) y Daniel (owner) tienen acceso. (Memoria `project-crm-kary-sole-operator`.)
2. **El registro de movimientos es muy básico**: un abono/factura solo se puede anular (no editar) y **no captura la fecha real** en que ocurrió. Kary puede recibir tarde la info de una operación hecha días atrás → hay que separar "cuándo pasó" de "cuándo se cargó". La plataforma debe ser **robusta y transparente**.

## 1. Alcance
**EN ALCANCE:**
- **Cambio 1 (Roles):** eliminar a la vendedora como *usuario*; convertirla en *entidad de datos* que Kary gestiona. Único acceso operativo: Kary (admin) + Daniel (owner).
- **Cambio 2 (Movimientos):** fecha real + edición con historial + reglas/UI robustas; transparencia (dos fechas, auditoría).

**FUERA DE ALCANCE (YAGNI / fases futuras):** método de pago, comprobante/foto, comisiones, facturación DIAN, inventario, login de vendedoras (descartado por diseño). *(Daniel eligió capturar solo la fecha real ahora; los demás campos de movimiento se omiten a propósito.)*

## 2. Usuarios y roles (REEMPLAZA §2 del spec anterior)
| Nivel | Quién | Acceso |
|---|---|---|
| 👑 `owner` | **Daniel** | TODO + gestión de usuarios/roles + config. |
| 🛡️ `admin` | **Kary** | TODO el negocio: vendedoras (entidad), clientes, movimientos, editar/anular, reportes, config. |
| ~~`vendedora`~~ | — | **ELIMINADO como rol/usuario.** Las vendedoras no inician sesión. |
| `editor` | (si aplica, contenido web) | Sin cambios — eje aparte del CRM. |

- **Vendedora = entidad de datos, no usuario.** No hay app de vendedora ni login de vendedora.

## 3. Modelo de datos (cambios)
### 3.1 Nueva colección `vendedoras/{vendedoraId}`
- `nombre` (string, requerido), `activa` (bool, default true), `createdAt`, `createdBy`, `updatedAt`.
- (Opcional futuro: `telefono`/`notas`. YAGNI ahora.)
- La gestiona **solo admin/owner**. Es la fuente del selector "asignar vendedora" y de la "cartera por vendedora".
- **Por qué colección (no lista de nombres en `config`):** renombrar/desactivar una vendedora sin tocar a sus clientes; agrupar cartera por id estable; escalable.

### 3.2 `clientes/{clienteId}` (cambio de campo)
- **`vendedoraId`** (string = id del doc en `vendedoras`, o `null` = directo de Kary) **reemplaza** a `vendedoraUid` (que apuntaba a un uid de Auth).
- Resto de campos sin cambio (`nombre`, `telefono`, `whatsapp`, `cumpleanos`, `notas`, `origen`, `activo`, `saldoActual`, timestamps, `migracion`).
- `origen` ∈ {`web`, `kary`, `vendedora`} se mantiene como metadato del canal (histórico).
- **Migración de datos:** los 344 clientes actuales son `origen:'kary'` SIN vendedora → no requieren cambio. (No hay `vendedoraUid` que reapuntar.)

### 3.3 `clientes/{clienteId}/movimientos/{movId}` (enriquecido)
- `tipo` ∈ {`apertura`, `factura`, `abono`, `ajuste`} — sin cambio.
- `monto` (number) — sin cambio (signo: factura/apertura/ajuste suman; abono resta).
- **`fecha`** (string `YYYY-MM-DD`, REQUERIDO): **fecha real** en que ocurrió la operación. La pone Kary; por defecto hoy; **editable**. Puede ser anterior a hoy.
- **`registradoEn`** (serverTimestamp, automático): cuándo se **cargó** a la plataforma. **No editable.**
- `registradoPor` (uid) — sin cambio.
- `descripcion` (string, opcional) — sin cambio.
- `anulado` (bool, default false) + `anuladoPor`/`anuladoEn` — sin cambio (anular ≠ borrar).
- **`historial`** (array, NUEVO): rastro de auditoría de ediciones. Cada entrada `{ editadoPor, editadoEn, cambios: [{campo, antes, despues}] }`. Append-only (nunca se borra).

> **Transparencia (requisito de Daniel):** `fecha` (cuándo pasó) y `registradoEn` (cuándo se cargó) son distintas y **ambas se muestran** en la UI (ej. "Abono del 1-jun · registrado el 6-jun"). Toda edición queda en `historial`. Nada se oculta ni se disfraza.

## 4. Movimientos: edición con historial (Cambio 2)
- Kary puede **editar** `monto`, `fecha`, `tipo`, `descripcion` de cualquier movimiento. Cada edición:
  1. Escribe los nuevos valores en el doc del movimiento.
  2. Agrega una entrada a `historial` (quién, cuándo, antes→después por campo).
  3. Dispara `recalcSaldoCliente` (ya existe) → el saldo se recalcula solo.
- Se mantienen **anular** (marca `anulado`, conserva el asiento) y **corregir saldo** (crea un `ajuste`).
- **Para "cuentas atrasadas" (aging) se usa `fecha`** (la real), no `registradoEn`, con `config.diasPlazo`.

## 5. Permisos (reglas Firestore — REEMPLAZA §5 del spec anterior)
- Quitar `isVendedora()` y todos los bloques que daban acceso al rol `vendedora`.
- `vendedoras`, `clientes`, `movimientos`: **read/write solo `admin`/`owner`.**
- `movimientos`: validar en reglas `tipo` válido, `monto` numérico (≥0 para factura/abono), `fecha` presente y formato fecha; `historial` solo se agrega (no se reescribe). `saldoActual`/`registradoEn` server-only (ya).
- **Eliminar** la colección/reglas de `solicitudesCorreccion`.
- `config`: read/write solo admin/owner (quitar lectura de vendedora).

## 6. Qué se elimina / refactoriza / conserva (Cambio 1)
**ELIMINAR:** `vendedora.html`, `vendedora-cliente.html`, `js/vendedora/*`; `requireAuthExact` para vendedora; flujo `solicitudesCorreccion` (reglas + `crm-service` `crearSolicitud`/`onSolicitudesChange`/`resolverSolicitud` + bandeja en `admin-cuentas`); `onClientesDeVendedora`; `fetchVendedoras` (que leía de `users`).
**REFACTORIZAR:** `auth.js` (quitar `vendedora` de `ROLE_LEVELS`); `login.js` (sin redirect a vendedora; todo login → `admin.html`); `functions/index.js` `createUser`/`updateUserRole` (roles permitidos = `admin`/`editor`); `firestore.rules` (ver §5); el selector de vendedora en crear/editar cliente lee de `vendedoras` (no de `users`); `carteraPorVendedora` agrupa por `vendedoraId`.
**CONSERVAR:** Panel de Kary, `recalcSaldoCliente`, editabilidad, cartera por vendedora, cumpleaños, `admin-config`.

## 7. Pantallas (REEMPLAZA §7 del spec anterior)
- **Solo el panel admin** (Kary/Daniel), responsive (celular + PC). No hay vistas de vendedora.
- **Gestión de vendedoras** (nueva mini-pantalla o sección en Configuración): listar/crear/editar/desactivar vendedoras.
- **Crear/editar cliente:** selector "vendedora" desde la colección `vendedoras` (o "Directo de Kary").
- **Ficha de cliente / movimiento:** el formulario de factura/abono incluye **selector de fecha (real)**; cada movimiento muestra `fecha` + `registrado el …`; botón **Editar** por movimiento (con su historial visible); se mantienen Anular y Corregir saldo.

## 8. Robustez — casos contemplados
Sobrepago (abono > saldo) → saldo a favor (negativo) ✓ · editar movimiento histórico → recalcula + deja rastro ✓ · anular conserva el asiento ✓ · `fecha` anterior a hoy permitida (caso central de Daniel) ✓ · validación de `tipo`/`monto`/`fecha` en reglas ✓ · recálculo transaccional (sin carreras) ✓ · reasignar cliente a otra vendedora ✓ · desactivar vendedora sin perder su historial ni el de sus clientes ✓ · apertura negativa / saldo cero ✓ · aging por fecha real ✓.

## 9. Migración / despliegue (sistema vivo)
- **Datos:** los 344 clientes (origen kary, sin vendedora) quedan igual. Si en prod existe algún usuario `vendedora` en Auth → desactivar/eliminar. Colección `solicitudesCorreccion` (vacía en prod) → no se usa más. **Confirmar que Kary tiene su usuario `admin` en prod.**
- **Movimientos existentes:** la `apertura` migrada ya trae `fecha` = corte (2026-06-06); sin `historial` (se crea al primer edit). Compatibilidad: tratar `historial` ausente como `[]`.
- **Deploy:** reglas + functions = manual (`firebase deploy --only ...`, L-22); sitio por push. Cada fase en su rama, probada en emulador antes.

## 10. Fases
- **Fase R (Roles):** colección `vendedoras` + `vendedoraId` + selector/cartera desde `vendedoras`; eliminar app/rol/solicitudes de vendedora; reglas a admin/owner. Tests + deploy. *(Sobre todo eliminación → de-riesga.)*
- **Fase M (Movimientos):** `fecha` real + `historial` de edición + UI (selector de fecha, editar, mostrar ambas fechas) + reglas/aging por fecha. Tests + deploy.
- Cada fase: plan (`writing-plans`) → implementar (TDD) → emulador → deploy → smoke en prod.

## 11. Criterios de éxito
- Solo Kary/Daniel acceden; no queda rastro funcional del login de vendedora.
- "Vendedora" se gestiona como dato; cartera por vendedora correcta.
- Cada movimiento guarda y MUESTRA su fecha real y su fecha de registro; las ediciones quedan en historial; saldo siempre cuadra.
- Cero regresión sobre los 344 clientes y sus saldos.
