# Acuerdos de pago / Plan de cuotas — Diseño **v2** (Consejo Externo integrado)

> **⚠️ [OPUS-4.8 interino — revisar cuando vuelva Fable]** La v1 (comité de 7 agentes de Fable) fue **revisada por el Consejo Externo (Gemini 3.1 Pro)**, que encontró un hueco de fraude real + sobre-ingeniería. Esta v2 integra el dictamen (síntesis adopto/refuto en bóveda `research-archive/2026-06-12-consejo-externo-acuerdos-respuesta.md`). La **implementación v1 (slices 1-5) quedó SUPERSEDED** — está en el árbol pero **GATEADA por `config/cartera.acuerdosActivos` (apagada en prod = inerte y segura)**; debe REHACERSE contra esta v2 antes de encender la bandera.
> **Estado**: diseño v2 sellado · P1=A·P2=A·P3=B/24m (Daniel) · Consejo integrado. **Pendiente: rework de los 5 slices + verificación POR HITO + ADR §81.**
> **Origen**: directivas de Daniel 2026-06-12 (fiado como plan; seguimiento a morosos con acuerdos; pensar en grande — asesor asignado futuro).

---

## 0. QUÉ CAMBIÓ DE v1 A v2 (el dictamen del Consejo)

| v1 (comité Fable) | v2 (Consejo integrado) | Por qué |
|---|---|---|
| `alcance: 'factura' | 'saldo'` | **SOLO `'saldo'`** (sin `alcance` ni `movimientoId`) | El FIFO global ciego no puede atribuir un abono a la cuota de UNA factura → estados falsos ("incumplió" con recibo en mano). Si el recaudo es FIFO global, el acuerdo NO puede ser atómico por factura. |
| Renegociar = batch `getAfter` (create+sello) | **Mutex `acuerdoVigenteId` en el doc del cliente** | El `getAfter` solo cerraba el camino honesto. Las reglas NO iteran colecciones → no sabían si ya había un vigente. Kary inyectaba un acuerdo SUELTO (la fórmula honra el `creadoEn` mayor) → **vector de jineteo**: oculta una mora skimmeada bajo una "renegociación" a 23 meses. El puntero en el doc maestro lo cierra a nivel criptográfico. |
| Aging por **TRAMOS** (`min(restoCuota, restoCargo)`) | **Escudo de 2 estados** (al-día / perforado) | Conciliar cuotas con facturas línea por línea es sobre-ingeniería. El plan es un ESCUDO: al día → mora = Σcuotas pasadas − abonos; roto → el escudo cae y revive los vencimientos ORIGINALES (mora histórica 360+ para la DIAN). |
| Corte guarda `plan`/`bajoAcuerdo` | + **`estadoAlCorte` cristalizado por acuerdo** | Derivar al vuelo la historia de hace 2 años es indefendible ante la DIAN (art. 146). El snapshot inmutable debe guardar `{id, estadoAlCorte, cuotasVencidas}` firmado por el reloj del servidor. |
| `acuerdoMaxSinAprobacion` reservado en config | **Fuera del modelo (YAGNI)** | Solo `rolAlCrear` + `creadoPor`. El tope del asesor se diseña con el RBAC (TODO-19), no hoy. |
| Detector `solapados` | **Innecesario** (el mutex hace el solape imposible por diseño de BD) | Un script menos que mantener. |

---

## 1. DISEÑO UNIFICADO v2

### 1.1 Principio rector

**El acuerdo NO mueve dinero: re-programa la EXIGIBILIDAD de TODA la deuda actual.** El libro (`movimientos`, append-only, candado M3) y `saldoActual` (solo CF) quedan intactos. **La visibilidad ES el control**: todo lo que un acuerdo pueda esconder se expone en el acta mensual + se cristaliza en el corte inmutable.

### 1.2 Modelo de datos

**`clientes/{clienteId}`** (doc maestro): **+ `acuerdoVigenteId: string|null`** — el **MUTEX**. ES la fuente de verdad de "cuál acuerdo está activo"; los docs `/acuerdos` son evidencia, el puntero es autoridad. La CF del saldo escribe con `tx.set(...,{merge:true})` (functions/index.js:261) → jamás lo pisa. En la whitelist de update del cliente, con transición validada (§1.3).

**`clientes/{clienteId}/acuerdos/{acuerdoId}`** (cuotas embebidas):
```
{
  fechaPacto: 'YYYY-MM-DD',          // fecha del hecho (fechaHechoValida) — evidencia
  cuotas: [{fecha:'YYYY-MM-DD', monto:int>0}],  // 1..36, fechas ESTRICTAMENTE crecientes
  periodicidad: 'quincenal'|'mensual'|'fechas',  // informativo (generador)
  primeraCuotaFecha, ultimaCuotaFecha,           // sobre denormalizado (reglas)
  saldoAlPactar: int,                // EVIDENCIA (deuda exigible congelada). NUNCA insumo de la fórmula
  nota: string,                      // obligatoria (qué se habló) ≤500
  estado: 'vigente'|'reemplazado'|'anulado',     // CICLO DE VIDA; cumplido/incumplido se DERIVAN
  reemplazaA?: acuerdoId,
  creadoPor, creadoEn(serverTime), rolAlCrear,   // investidura probatoria (costura asesor)
  // cierre one-way: cerradoPor/cerradoEn/motivoCierre?/reemplazadoPor?
}
```
**Quitado de v1:** `alcance`, `movimientoId`. **No** hay `acuerdoMaxSinAprobacion`.

### 1.3 Reglas — el MUTEX (lo nuevo y crítico)

Verdad = `cliente.acuerdoVigenteId`. Tres transiciones, TODAS batch atómico enforce-able por `getAfter` (estado POST-batch):

1. **Primer acuerdo** (puntero null→new): crear `acuerdos/{new}` vigente **+** `cliente.acuerdoVigenteId = new`.
2. **Renegociación** (old→new, admin): crear `acuerdos/{new}` (vigente, `reemplazaA=old`) **+** sellar `acuerdos/{old}` (reemplazado, `reemplazadoPor=new`) **+** `cliente.acuerdoVigenteId = new`.
3. **Anulación** (old→null, **OWNER**): sellar `acuerdos/{old}` (anulado, `motivoCierre`) **+** `cliente.acuerdoVigenteId = null`.

```
// CREATE de un acuerdo: el cliente DEBE apuntarme tras el batch (fuerza el puntero
// en la misma transacción → imposible el acuerdo SUELTO del vector de jineteo).
allow create: if isAdmin() && acuerdoValido()
  && getAfter(/clientes/$(cid)).data.acuerdoVigenteId == acuerdoId
  && (!('reemplazaA' in d) ||
      (getAfter(.../acuerdos/$(d.reemplazaA)).data.estado == 'reemplazado'
       && getAfter(.../acuerdos/$(d.reemplazaA)).data.reemplazadoPor == acuerdoId));

// UPDATE (cierre one-way desde 'vigente'):
allow update: if resource.data.estado == 'vigente'
  && affectedKeys ⊆ [estado,cerradoPor,cerradoEn,motivoCierre,reemplazadoPor]
  && cerradoPor==uid && cerradoEn==request.time
  && ( (estado=='reemplazado' && isAdmin() && getAfter(client).acuerdoVigenteId != acuerdoId)
     || (estado=='anulado'    && isOwner() && nonEmptyStr(motivoCierre)
                              && getAfter(client).acuerdoVigenteId == null) );

allow delete: if false;   // evidencia art. 146

// CLIENTE update del puntero (en la whitelist; transición validada):
//   null → new : getAfter(new).estado=='vigente'                          (admin, 1er acuerdo)
//   old  → new : getAfter(new).vigente && getAfter(old).reemplazado       (admin, renegociar)
//   old  → null: getAfter(old).anulado && isOwner()                       (owner, anular)
```
`match /{path=**}/acuerdos/{id} { allow read: if isAdmin(); }` + índice CG (estado, creadoEn).

### 1.4 Semántica de vencido — ESCUDO de 2 estados (sin tramos)

`estadoCuenta(movimientos, opts)` con `opts.acuerdo` (el ÚNICO vigente, del puntero) + `opts.horizonteDias`:

1. **FIFO corre INTACTO** (como hoy) → `pendiente` por cargo + `vencido` por vencimiento original. Cada cargo marca `cubierto = registradoEn <= acuerdo.creadoEn` (reloj de SERVIDOR — una factura retrofechada DESPUÉS del pacto no se cuela bajo el escudo).
2. Si hay acuerdo estructuralmente válido (`acuerdoEsValido`) — **NO TRAMOS**, se computa el plan directo:
   - `deudaCubiertaRestante` = Σ `pendiente` de los cargos cubiertos (lo que queda del plan tras el FIFO).
   - `pagadoDelPlan = clamp(Σcuotas − deudaCubiertaRestante, 0, Σcuotas)`; se camina cuota-a-cuota desde el frente → `restoCuota` impago de cada una.
   - `vencidoPlan = Σ restoCuota[cuota.fecha < hoy]`; `cuotasVencidasImpagas` = #cuotas pasadas con resto>0; `diasMoraPlan` = mora de la cuota impaga más vieja.
   - **`roto = cuotasVencidasImpagas >= N`** (knob `config/cartera.acuerdoIncumplidoCuotas`, default 2, owner-only). Estado DERIVADO, jamás almacenado.
3. **ESCUDO (no roto)**: el vencido de los cargos CUBIERTOS se REEMPLAZA por `vencidoPlan` (en el bucket de `diasMoraPlan`); los cargos NO cubiertos (deuda post-pacto) envejecen normal. `bajoAcuerdo = deudaCubiertaRestante`. Estado: `vencido` si hay vencido (plan+post), si no `en-acuerdo` (sello P1), si no `al-dia`.
4. **PERFORADO (roto)**: se IGNORA el acuerdo → la fórmula es EXACTA al camino sin-acuerdo (los cargos cubiertos reviven su vencimiento original → mora histórica 360+ para M7). `bajoAcuerdo=0`; `plan` se reporta a la UI como INCUMPLIDO pero el aging es el histórico.
5. **Precedencia / legacy**: sin acuerdo → salida byte-igual a hoy (cero migración). `acuerdoEsValido` vive en el archivo de PARIDAD (panel y corte validan idéntico); inválido → ignorado → fallback conservador.

**Salida ADITIVA**: `+ bajoAcuerdo:int + plan:{acuerdoId, exigible, vencidoPlan, cuotasVencidas, proximaCuota, roto}|null`.

### 1.5 Corte mensual — cristaliza la evidencia (F4 del Consejo)

`corte.js`: + `id` del movimiento + `collectionGroup('acuerdos')` (solo vigentes por cliente) + `formulaVersion` + por clienta: `plan` + `bajoAcuerdo` + **`acuerdoAlCorte: {id, estadoAlCorte:'al-dia'|'incumplido', cuotasVencidas}`** (prueba pre-constituida, firmada por el reloj del servidor — defendible ante la DIAN).

### 1.6 Costuras de escala / asesor (sin RBAC — TODO-19)

`asesorId` opcional en `clienteValido` (espejo `vendedoraId`, sin UI) + `rolAlCrear` sellado en el acuerdo + `creadoPor`. **NO** `acuerdoMaxSinAprobacion` (YAGNI — el RBAC del asesor lo añade). El SoD del asesor (sobre tope → cola de solicitudes) se diseña en ese slice.

### 1.7 Interacción M7 (spec del slice M7)

Acuerdo como gestión por UNIÓN temporal con reloj de servidor (no `fechaPacto`, anti-retrofecha). Plan al día no es castigable (vencidoPlan=0). **Acuerdo roto = el escudo cae → la fórmula ya da la mora histórica** (perforado §1.4-4); la cadena de acuerdos rotos (por `creadoEn`) + los cortes inmutables (mora previa cristalizada) = expediente art. 146. `renegociacionesSeriales` por `creadoEn`.

### 1.8 Detectores (acta) — 2, no 3 (el mutex mató `solapados`)

`acuerdosSobreMora` (línea obligatoria: acuerdo del mes sobre cuenta vencida según el corte previo) + `acuerdosAnomalos` (malformados via `acuerdoEsValido`, horizonte >12m). `acuerdosLargos` (M6) excluye cubiertos. `renegociacionesSeriales` (≥2 en 12m por `creadoEn`).

### 1.9 Flujo de Kary (celular) y migración

- **CONVIVENCIA, NO MIGRACIÓN**: sin acuerdo, todo igual; el `vencimiento` M6 sigue siendo la fecha final de la factura simple.
- **Factura en cuotas**: toggle "¿en cuotas?" → genera el plan → batch (factura + acuerdo `saldo` + puntero del cliente). Cliente limpio → cubre esa factura; con deuda previa → la UI ADVIERTE "esto reprograma TODA la deuda de la clienta".
- **Renegociar moroso**: botón "Acuerdo de pago" → genera plan sobre el saldo → batch (mutex). Si ya hay vigente → renegociación atómica.
- Estado de cuenta: "próxima cuota" + sello "En acuerdo de pago" (P1).

### 1.10 Plan de slices del REWORK

| # | Slice | Gate |
|---|---|---|
| R1 | Fórmula ESCUDO (matar tramos) + `acuerdoEsValido` (sin alcance) + matriz tests | suite vieja intacta + nuevos verdes + paridad |
| R2 | Reglas: MUTEX `acuerdoVigenteId` + saldo-only + cliente whitelist + size() M5 + índice | emulador |
| R3 | `corte.js`: ids + acuerdos + `formulaVersion` + `acuerdoAlCorte` cristalizado | insumos panel↔corte |
| R4 | UI saldo-only (toggle cuotas + renegociar + sello) usando el mutex (batch con puntero) | — |
| R5 | Detectores (sin `solapados`) + acta + Salud | — |
| R6 | DEPLOY (reglas+functions+índices) → encender bandera → **verificación POR HITO** + ADR §81 |

## 2. PREGUNTAS DE DANIEL (RESPONDIDAS)

P1=A (cumple acuerdo → sale de rojos con sello "En acuerdo de pago") · P2=A (Kary pacta sola + línea obligatoria en el acta + anular=solo owner) · P3=B (horizonte 24 meses, resaltar >12).

## 3. RIESGOS RESIDUALES v2

1. Escritura por SDK de un admin con acuerdo malformado → la fórmula lo IGNORA (conservador) + `acuerdosAnomalos`.
2. El mutex acopla el doc del cliente a la transacción del acuerdo — patrón "aggregate root con el lock" (estándar); la CF del saldo no interfiere (`merge:true`).
3. Paridad de INSUMOS (ids + acuerdos): test del slice R3.
4. Archivo de paridad crece — costo aceptado por UNA fórmula.
5. Discontinuidad del corte el mes del despliegue → `formulaVersion` + línea fija en el acta.

## Checklist (REWORK v2 — la implementación v1 está SUPERSEDED, gateada/inerte)

- [x] Consejo Externo corrido + síntesis adopto/refuto integrada (`research-archive/2026-06-12-consejo-externo-acuerdos-respuesta.md`; §0 de esta spec)
- [x] Respuestas P1/P2/P3 de Daniel (2026-06-12; §2 de esta spec)
- [x] R1: fórmula ESCUDO + matriz de tests (2026-06-12 Opus: tramos eliminados; `acuerdoEsValido` sin alcance; escudo de 2 estados con corte de frontera anti-sub-programación; `test:acuerdos` 15/15 + `test:insumos` 3/3 + paridad 3/3 + suite vieja 24/24 intacta) · ADR §81
- [x] R2: reglas MUTEX `acuerdoVigenteId` + saldo-only (2026-06-12 Opus: `acuerdoValido` sin alcance + `mutexAcuerdoValido` en el doc del cliente con getAfter; create suelto y jineteo denegados; renegociar/anular = batch con puntero; emulador 144/144). Índice CG ya estaba (R2 v1) · ADR §81
- [x] R3: corte.js (2026-06-12 Opus: `formulaVersion:3` (escudo) + `acuerdoAlCorte` cristalizado por clienta — al-dia/en-mora/incumplido, evidencia DIAN; helper puro `acuerdoAlCorte` con test; `test:insumos` 4/4 + paridad 3/3 + build) · ADR §81
- [x] R4: UI saldo-only con el mutex (2026-06-12 Opus: servicio `pactarAcuerdo` (batch factura?+acuerdo+sello?+puntero) y `anularAcuerdo` (sella+limpia puntero, owner); ficha usa el mutex; gate de cuotas exige sin-vencido y sin-vigente; probes sin alcance; build verde + suites de fórmula intactas) · ADR §81
- [x] R5: detectores v2 (2026-06-12 Opus: `acuerdosLargos` excluye por clienta con plan; `acuerdosAnomalos` = invalidos+largos, el mutex mató solapados/huérfanos; Salud sin esas filas; `test:auditoria` 16/16 + build + grep sin refs v1 en `js/`/`functions/`) · ADR §81
- [ ] R6: deploy + encender bandera + verificación POR HITO + ADR §81 + CRUDOs

## Anexo — v1 (comité Fable, SUPERSEDED por el Consejo)

El diseño v1 (entidad `acuerdos/`, `alcance:'factura'|'saldo'`, TRAMOS, renegociación por `getAfter` sin mutex, detector `solapados`) y su comité de 7 agentes están en el CRUDO `research-archive/2026-06-12-comite-acuerdos-cuotas-CRUDO.json`. Se conserva como historia del razonamiento; **no construir contra él** — la v2 manda.
