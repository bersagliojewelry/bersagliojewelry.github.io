# Bersaglio — Función de Morosos / Vencidos (cartera vencida + aging) · spec de implementación

> **Tipo:** spec de implementación de fase (deriva del norte `2026-06-07-bersaglio-arquitectura-maestra-design.md`).
> **Fecha:** 2026-06-07 · **Autor:** Claude (arquitecto) · **Estado:** en construcción.
> **Alcance:** fusiona **F1** (dominio `estadoCuenta` + centralizar etiqueta/color) + **F2 slice** (`movimientos.fecha` real + consumir `diasPlazo`) + **slice de F5** (vista CxC: vencidos en rojo, orden por mora, KPI cartera vencida). NO incluye chips/filtros avanzados, control de crédito, ni materialización `diasVencido` (eso es F5 completo / F6).
> **Decisión de arquitectura clave (del norte §10.2-F2 + Consejo §16):** **aging EN VIVO** (cálculo puro al leer), **sin** Cloud Function nueva ni denormalización. La materialización de `diasVencido` y la paginación por cursor se difieren a F6.

---

## 1. Decisiones (negocio — congeladas por Daniel 2026-06-07)

- **Plazo:** 30 días (estándar net-30). Configurable en `config/negocio.diasPlazo`. Sin plazo por-cliente todavía.
- **VENCIDO** desde el **día 1 pasado el plazo** (día 0 = vencimiento aún "al día").
- **Rangos de mora:** `1-30` / `31-60` / `+60` días (mora = días pasados del vencimiento). Vencido en **ROJO**.
- **Fecha del movimiento:** los movimientos NUEVOS llevan `fecha` (Kary la elige; default hoy). Los migrados **ya la traen** (`cargar-migracion.mjs:48` escribe `fecha: CUTOFF`). Movimiento sin `fecha` → fallback a `config.fechaCorteMigracion`; si tampoco hay → cuenta en el saldo pero NO en vencido (se marca "sin fecha").

## 2. Grounding (código real verificado)

- `functions/saldo.js` — `computeSaldo`/`aporteSaldo`/`SIGNO_POR_TIPO` (factura/apertura/ajuste = +1; abono = −1). El nuevo helper es su **espejo** para mora.
- `js/crm-service.js` — `addMovimiento` (hoy NO escribe `fecha`), `onMovimientosChange`, `getConfig('negocio')`, `carteraTotals`, `onClientesChange`. `limit(MAX=2000)`.
- `js/admin/cuenta.js` — ficha; carga movimientos vía `onMovimientosChange`; historial muestra `fmtDateTime(m.registradoEn)`.
- `js/admin/cuentas.js` — lista; usa solo `saldoActual` desnormalizado (`onClientesChange`). KPIs `renderStats`.
- `js/admin/saldo-format.js` — `saldoClass/saldoLabel/saldoCellHTML` (token-based, sin hex). Punto de extensión para aging.
- `admin-cuenta.html` — modal `#mov-form` (monto + descripción). Falta campo fecha.
- `css/admin.css` — tokens: `--adm-danger` (#d94040, rojo), `--adm-warn` (#d97706, ámbar); clases `.adm-money--debe/favor/cero`, `.adm-pill--red`.
- `firestore.rules` — `movimientoValido()` (sin `hasOnly`, acepta `fecha` extra; conviene type-check). `anulacionValida()` solo deja mutar 4 claves → `fecha` inmutable. Lectura de `movimientos` solo por path anidado → **collectionGroup requiere match `{path=**}`**.
- `cargar-migracion.mjs:42-50` — migrados: `tipo:'apertura', monto, fecha:CUTOFF, registradoEn, anulado:false`.

## 3. Dominio: helper puro `estadoCuenta` (F1)

**Archivo nuevo:** `js/crm-estado-cuenta.js` (ESM puro, sin Firestore — espejo de `saldo.js`). **Test:** `tests/estado-cuenta.test.mjs` (`npm run test:estado`).

```
estadoCuenta(movimientos, { hoy, diasPlazo = 30, fechaCorte }) → {
  saldo,                       // = computeSaldo (fuente de verdad)
  vencido, alDia, sinFecha,    // partición del saldo positivo
  buckets: { d1_30, d31_60, d60plus },
  diasMora,                    // máx mora de un cargo abierto (0 si nada vencido)
  fechaVencidoMasAntigua,      // 'YYYY-MM-DD' | null
  estado,                      // 'sin-deuda' | 'al-dia' | 'vencido' | 'a-favor'
}
```

**Algoritmo (FIFO, mora por días pasados del vencimiento):**
1. `diasPlazo` válido (>0) o 30.
2. Cargos = movimientos no anulados con `aporte > 0` → `{ fechaEf, monto: aporte }`; `fechaEf = mov.fecha ?? fechaCorte`. Sin fecha determinable → lista "sin fecha".
3. Créditos = Σ |aporte| de movimientos no anulados con `aporte < 0`.
4. FIFO: cargos CON fecha ordenados asc; aplicar créditos al más viejo primero (reduce saldo pendiente). Sobrante de crédito → cargos sin fecha, luego saldo a favor.
5. Por cada cargo con pendiente > 0: `vencimiento = fechaEf + diasPlazo`; `mora = hoy − vencimiento`. `mora <= 0` → `alDia`; `1..30` → `d1_30`; `31..60` → `d31_60`; `>=61` → `d60plus`. `vencido = Σ buckets`. Rastrear `diasMora` máx + su fecha.
6. Cargos sin fecha con pendiente → `sinFecha` (no vencido).
7. `estado`: `saldo<=0` → (`<0` a-favor / `==0` sin-deuda); `saldo>0` → (`vencido>0` vencido / si no al-dia).
8. Redondeo `round2` (COP entero → idempotente).

**Fechas:** `'YYYY-MM-DD'` → días UTC enteros (`Date.UTC`). `hoy` inyectable (test determinista); default = hoy local en ISO.

## 4. Datos / servicio

- `addMovimiento(clienteId, { tipo, monto, descripcion, registradoPor, fecha })` — escribe `fecha` si viene (string 'YYYY-MM-DD').
- **Nuevo** `fetchAllMovimientos()` — `getDocs(collectionGroup('movimientos'))` (one-shot, `limit(MAX)`), devuelve `[{ clienteId: ref.parent.parent.id, ...data }]`. Para la mora de la lista CxC (en vivo al cargar; no listener persistente).
- (opcional) `carteraVencidaTotals(estadosPorCliente)` o calcular en `cuentas.js`.

## 5. UI

- **`saldo-format.js`** — añadir `agingClass(diasMora)` / `agingLabel(estado, diasMora)` / `estadoBadgeHTML(est)` (token-based: al-día = muted/success; 1-30 = warn; 31-60/+60 = danger). Sin hex.
- **Ficha (`cuenta.js` + `admin-cuenta.html`):** modal con `<input type="date" id="mov-fecha">` (default hoy). `addMovimiento` pasa `fecha`. Sello de estado junto al saldo (Al día / Vencido N días + desglose). Historial: columna Fecha muestra la `fecha` real (fallback `registradoEn`); marcar filas de cargos vencidos.
- **Lista (`cuentas.js` + `admin-cuentas.html`):** al cargar, `fetchAllMovimientos` + `getConfig('negocio')` → agrupar por `clienteId` → `estadoCuenta` por cliente. Render: monto vencido en rojo + días de mora; orden por `diasMora` desc; KPI **Cartera vencida** (total + buckets).
- **Config:** `diasPlazo` ya existe en UI/modelo; helper default 30 si vacío.

## 6. Reglas / índices

- `firestore.rules`: (a) `match /{path=**}/movimientos/{movId} { allow read: if isAdmin(); }` (habilita collectionGroup, admin-only, solo lectura — los writes siguen por el path anidado); (b) en `movimientoValido()` añadir `(!('fecha' in d) || d.fecha is string)`.
- `firestore.indexes.json`: la query collectionGroup es **filter-free** (solo `limit`) → no requiere índice compuesto. Verificar en emulador/preview (spec §9.1: índice faltante = pantalla en blanco en prod).

## 7. No-regresión

- `computeSaldo` y `recalcSaldoCliente` INTACTOS (la mora deriva, no toca el saldo). `anularMovimiento` intacto (fecha inmutable por `anulacionValida`). Renderers de saldo existentes intactos (extensión aditiva). IDs/funciones exportadas estables.

## 8. Tests / verificación

- `tests/estado-cuenta.test.mjs` (nuevo, `test:estado`): vacío, factura vencida/al-día, abono total/parcial FIFO, 2 facturas + 1 abono (paga la vieja), apertura negativa (a favor), límites de bucket (30/31/60/61), fallback `fechaCorte`, sin fecha, anulado ignorado, `diasPlazo` custom/default.
- `test:saldo` 12/12 y `test:rules` siguen verdes. `vite build` verde. Verificación en preview (lista + ficha).

## 9. Despliegue

- Construir + commitear en `Desarrollo` (código y cerebro separados). **Deploy a prod = coordinado** (reglas+functions manual + front por Pages), junto al **TODO-13** ya listo. Bump SW solo si cambia el shell cacheado (evaluar; admin puede no estar en `SHELL_ASSETS`).

## 10. Consolidación del cerebro (al cerrar)

ADR §51 en `99` + fila en `00` + lecciones en `30` (FIFO aging, collectionGroup) + `05`/`10` actualizados + `20` (nuevo módulo `crm-estado-cuenta.js`) + marcar avance F1/F2/F5 en `10`.
