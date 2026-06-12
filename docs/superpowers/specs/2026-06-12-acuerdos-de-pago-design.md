# Acuerdos de pago / Plan de cuotas — Diseño (síntesis del comité)

> **Estado**: POSTURA SELLADA del comité (2026-06-12) — pendiente: (1) respuestas de Daniel a las 3 preguntas cerradas (§3), (2) crítica adversarial del Consejo Externo (prompt en bóveda `research-archive/2026-06-12-consejo-externo-acuerdos-prompt.md`). NO construir antes de integrar ambas.
> **Origen**: directivas de Daniel 2026-06-12 (ADR §80 + `50-ARQUITECTURA §5`): fiado pactado como plan (fecha final, cuotas, periodicidad, fechas pactadas; vencido = fecha pactada sin recaudo) · seguimiento a morosos con acuerdos de pago · a futuro los pacta un ASESOR ASIGNADO — pensar para empresa grande.
> **Deliberación**: comité 7 agentes (3 propuestas: contador/arquitecto/operación + red-team de fraude c/u + síntesis presidencial). CRUDO: bóveda `research-archive/2026-06-12-comite-acuerdos-cuotas-CRUDO.json`.

---

## 1. DISEÑO UNIFICADO

### 1.1 Principio rector (invariante del slice)

**El acuerdo NO mueve dinero: re-programa la EXIGIBILIDAD.** El libro (`movimientos`, append-only, candado M3) y `saldoActual` (solo CF) quedan intactos. El acuerdo solo decide *cuándo está vencido qué*. Y como en este sistema **la visibilidad ES el control** (lección de la anulación de abonos owner-only), todo lo que un acuerdo pueda esconder se expone obligatoriamente en el acta mensual.

### 1.2 Modelo de datos

`clientes/{clienteId}/acuerdos/{acuerdoId}` — subcolección del cliente (patrón solicitudes/gestiones), cuotas **embebidas** (1 lectura = plan completo), **jamás** subcolección de cuotas ni plan embebido en la factura (renegociar exigiría anular la factura, destruyendo el FIFO).

```
{
  alcance: 'factura' | 'saldo',
  movimientoId?: string,            // solo alcance 'factura' (UN cargo); prohibido en 'saldo'
  fechaPacto: 'YYYY-MM-DD',         // fecha del HECHO (fechaHechoValida) — EVIDENCIA, jamás insumo de cobertura
  cuotas: [{fecha:'YYYY-MM-DD', monto:int}],   // 1..36 (UI genera ≤24), ascendentes, entero COP
  periodicidad: 'quincenal'|'mensual'|'fechas',// metadato del generador (informativo)
  primeraCuotaFecha, ultimaCuotaFecha: string, // denormalizadas para el "sobre" de las reglas
  saldoAlPactar: int,               // foto-evidencia (espejo saldoAlSolicitar). NUNCA insumo de la fórmula
  nota: string,                     // obligatoria: qué se habló (evidencia)
  estado: 'vigente'|'reemplazado'|'anulado',   // SOLO ciclo de vida; cumplido/incumplido SE DERIVAN
  reemplazaA?: acuerdoId,
  creadoPor: uid, creadoEn: serverTime, rolAlCrear: string,  // == getUserRole() — evidencia con investidura
  // cierre one-way: cerradoPor/cerradoEn/motivoCierre/reemplazadoPor
}
```

**Decisiones de choque resueltas:**

- **`alcance 'factura'|'saldo'` y NO `deudaIds[]`**: el red-team demostró que `deudaIds` es inverificable en reglas (duplicados, solapes, ids inexistentes = superficie de manipulación silenciosa) y los dos casos reales del mostrador son "esta venta en cuotas" y "todo lo de la morosa". El multi-select no tiene caso de uso.
- **Cobertura de 'saldo' anclada a `registradoEn ≤ acuerdo.creadoEn` (reloj de SERVIDOR), NO a `fecha`**: cierra el ataque verificado — `fechaHechoValida` acepta cualquier fecha ≥2015, así que una factura retrofechada se deslizaría bajo el acuerdo. Con el reloj de servidor (doctrina M4) retrofechar no esconde nada.
- **SIN `montoPactado`/`saldoBase` como insumo de la fórmula** (el red-team encontró el agujero dos veces: saldoPactado inflado = cuotas "pagadas" al nacer / sub-alcance = parqueo del excedente). **El cronograma es la única verdad**; el pendiente cubierto se mapea contra las cuotas y **el excedente sobre Σcuotas conserva su vencimiento original M6/plazo** (determinista, conservador). `saldoAlPactar` queda como evidencia comparable contra el corte inmutable — nunca alimenta nada.

### 1.3 Reglas (pseudocódigo — frontera sin get() en el camino diario)

```
function acuerdoValido(d) {
  return d.keys().hasOnly([...whitelist §1.2...])
    && d.estado == 'vigente'
    && d.alcance in ['factura','saldo']
    && (d.alcance != 'factura' || nonEmptyStr(d.movimientoId))
    && (d.alcance != 'saldo'   || !('movimientoId' in d))
    && fechaHechoValida(d.fechaPacto)
    && d.cuotas is list && d.cuotas.size() >= 1 && d.cuotas.size() <= 36
    && nonEmptyStr(d.nota)
    && d.primeraCuotaFecha is string && d.ultimaCuotaFecha is string
    && d.primeraCuotaFecha >= d.fechaPacto                      // sobre, no verdad (§1.4)
    && d.creadoPor == request.auth.uid && d.creadoEn == request.time
    && d.rolAlCrear == getUserRole()
    // RENEGOCIACIÓN ATÓMICA (getAfter, patrón pre-batch §69 C3):
    && (!('reemplazaA' in d) ||
        (getAfter(/...clientes/$(cid)/acuerdos/$(d.reemplazaA)).data.estado == 'reemplazado'
         && getAfter(...$(d.reemplazaA)).data.reemplazadoPor == acuerdoId));
}
function transicionAcuerdoValida() {     // one-way desde 'vigente'
  return resource.data.estado == 'vigente'
    && d.diff(resource.data).affectedKeys()
         .hasOnly(['estado','cerradoPor','cerradoEn','motivoCierre','reemplazadoPor'])
    && d.cerradoPor == request.auth.uid && d.cerradoEn == request.time
    && ( (d.estado == 'reemplazado' && isAdmin() && nonEmptyStr(d.reemplazadoPor)
          && getAfter(...$(d.reemplazadoPor)).data.estado == 'vigente'
          && getAfter(...$(d.reemplazadoPor)).data.reemplazaA == acuerdoId)
       ||(d.estado == 'anulado' && isOwner() && nonEmptyStr(d.motivoCierre)) );   // ⬅ owner-only
}
match /clientes/{cid}/acuerdos/{id} {
  allow read: if isAdmin();
  allow create: if isAdmin() && acuerdoValido();
  allow update: if transicionAcuerdoValida();
  allow delete: if false;                                  // evidencia art. 146: jamás
}
match /{path=**}/acuerdos/{id} { allow read: if isAdmin(); }   // + índice COLLECTION_GROUP (estado ASC)
```

**Decisión presidencial — la ANULACIÓN de un acuerdo es OWNER-only** (mata 3 vectores: la goma de borrar que fragmenta la cadena probatoria, el parqueo por cancelación de un acuerdo cuyo flujo dejó `vencimiento` lejano, y la invisibilidad ante detectores por enlace). Espejo exacto del precedente "anular abonos → owner-only". Kary renegocia libremente (reemplazo atómico encadenado); **borrar un cronograma solo lo hace Daniel**.

**Renegociación** = UN `writeBatch` (id nuevo pre-commit): crear nuevo con `reemplazaA` + sellar viejo `vigente→reemplazado`. Los `getAfter` de ambos lados hacen IMPOSIBLE el create suelto o el sello sin reemplazo. Renegociación de morosa = acuerdo nuevo `alcance:'saldo'`; el viejo + gestiones M5 + cortes que fotografiaron la mora = expediente art. 146 completo.

**Límite honesto declarado**: las reglas no iteran `cuotas[]`. La verdad NO está en el "sobre" denormalizado: está en §1.4 — la fórmula valida la lista real e IGNORA el acuerdo inválido (falla conservadora), y esa validación vive en el archivo de PARIDAD, no en el módulo de UI.

### 1.4 Semántica de vencido — integrada al aging (UNA fórmula, L-03)

**VENCIDO = EXIGIBLE ACUMULADO impago** (unánime; decidido, no se pregunta): Σ de cuotas con `hoy > cuota.fecha` menos lo cubierto. Ni solo la última cuota (subestima provisión art. 145), ni todo el saldo (cláusula aceleratoria que el fiado no pacta).

Mecánica dentro de `estadoCuenta(movimientos, opts)` con `opts.acuerdos = []` opcional (técnica de **TRAMOS**):

1. El FIFO corre EXACTAMENTE como hoy → `pendiente` por cargo (créditos al cargo más viejo — doctrina M6 intacta, cero matching manual: el abono paga la cuota más vieja por construcción).
2. **Validación interna** `acuerdoEsValido(a, opts)` — EN el archivo de paridad: fechas ISO crecientes y parseables (round-trip `toDayNum`), montos `int > 0`, tamaño 1..36, `primera/ultimaCuotaFecha` == cuotas reales, `ultimaCuota ≤ creadoEn + horizonteDias` (knob de config, P3). Inválido → **acuerdo IGNORADO** → fallback M6/plazo (más vencido = conservador).
3. **Selección determinista**: por cargo, el acuerdo `vigente` válido que lo cubre con **mayor `creadoEn` (desempate: acuerdoId lexicográfico mayor)** — panel y corte idénticos siempre; dos vigentes solapados además disparan detector.
4. El pendiente cubierto se parte en **tramos**: `tramo = min(restanteCuota, restanteCargo)`, con `vencNum` = fecha de la cuota y `fechaISO` = fecha del hecho del cargo real. **Excedente sobre Σcuotas → conserva vencimiento original.** El bucle de buckets corre SIN CAMBIOS sobre tramos + cargos no cubiertos; cuotas futuras → `alDia`.
5. **Precedencia por cargo**: acuerdo vigente válido > `mov.vencimiento` (M6) > `fecha+diasPlazo`. Con `acuerdos=[]` la salida es **byte-igual a hoy** (test que lo fija) — 344 clientas legacy y todo M6: cero cambio, cero migración.

**Salida ADITIVA**: mismos `saldo/vencido/alDia/buckets/diasMora/estado` + `plan: {acuerdoId, exigible, cubierto, vencidoPlan, cuotasVencidas, proximaCuota}|null` + **`bajoAcuerdo: int`** (monto re-etiquetado por acuerdo — Salud y el corte distinguen *al-día-genuino* de *al-día-por-pacto*: cartera reestructurada ≠ vigente).

**Paridad y sus insumos:**
- TODA la aritmética nueva se **inlinea en `js/crm-estado-cuenta.js`** → copia byte-idéntica a functions. `js/crm-acuerdos.js` es panel-only (generador/labels) y la fórmula **no lo importa**.
- `corte.js`: +`id: mov.id` (hoy va pelado — verificado), +1 `collectionGroup('acuerdos')` mensual, +**`formulaVersion` en el doc del corte** (el mes del despliegue "vencido" cambia por fórmula, no por cobranza), +resumen `plan`+`bajoAcuerdo` por clienta. Cortes históricos: intocables.
- Tests: paridad byte + **test de insumos** (panel y corte sobre el mismo fixture CON ids y acuerdos) + matriz de cuotas (abono anticipado, excedente, acuerdo inválido ignorado, dos vigentes, anulación retroactiva, CORRECCION_FECHA). **El slice de tests es el costo principal, no la UI.**

**Acuerdo huérfano tras corrección M2b** (verificado: la corrección crea doc con id NUEVO): la fórmula lo trata como "no cubre ningún cargo" → fallback M6 (el reemplazo PRESERVA `vencimiento`) = degradación benigna; detector `acuerdosAnomalos` lo lista; Kary re-pacta.

### 1.5 Acuerdo 'factura' con deuda vieja abierta (la mina que los 3 red-teams encontraron)

El FIFO global asigna los abonos a la deuda más vieja → las cuotas de la factura nueva figuran impagas aunque la clienta pague puntual → 🔴 falso. **Resolución en dos capas**: (a) **gate de UI**: el toggle "¿en cuotas?" solo se ofrece si la clienta no tiene OTRA deuda vencida — a esa clienta el instrumento es la renegociación 'saldo'; (b) la fórmula sigue determinista para lo que entre por fuera y `acuerdosAnomalos` lo marca. El derivado 'incumplido' de ese caso NO alimenta M7 — la evidencia fiscal jamás se fabrica por orden de imputación.

### 1.6 Costuras de escala / asesor (sin construir RBAC — TODO-19 aparte)

1. **Autoría probatoria**: `creadoPor` + `creadoEn` (reloj servidor) + `rolAlCrear == getUserRole()` (snapshot de investidura: la evidencia necesita el rol *de aquel momento*).
2. **`asesorId` (string opcional) en la whitelist de `clienteValido()`** — espejo exacto de `vendedoraId`; viaja en el MISMO deploy de reglas; cero UI hoy.
3. **SoD parametrizada**: clave `acuerdoMaxSinAprobacion` reservada en `config/cartera` (write owner-only). Con rol asesor futuro: por encima del tope → solicitud M2 `tipo:'acuerdo'`. La respuesta de Daniel a P2 fija la plantilla.
4. **Anti-deuda-arqueológica**: las costuras se documentan en `20-ESPACIAL` + `50-ARQUITECTURA` en el mismo PR.
5. Escala: a 10k clientas la materialización por CF es la costura conocida — no se construye hoy (344 = cálculo vivo gratis).

### 1.7 Interacción M7 (spec para el slice M7)

1. **'cumplido'/'incumplido' JAMÁS se almacenan** — derivados; el corte mensual los fotografía.
2. **¿Gestión válida?** Sí, sin doble escritura ni retrofechado: "gestiones en ≥3 meses DISTINTOS" cuenta la UNIÓN gestiones∪acuerdos **por `registradoEn`/`creadoEn`** (reloj de servidor), nunca por `fechaPacto`. Crear 3 acuerdos hoy = 1 mes. RECHAZADO el checkbox auto-gestión (evidencia fabricada).
3. **¿Cumplido resetea?** Solo por sus propios medios: plan al día ⇒ vencido=0; abonos materiales resetean `sinAbonos`. Cero lógica especial.
4. **¿Incumplido acelera?** No ataja umbrales, pero **perfora el escudo**: con ≥N cuotas vencidas impagas (knob `criteriosCastigo.acuerdoIncumplidoCuotas`, default 2, owner-only), M7 evalúa la mora **con los vencimientos originales**. La mora pre-acuerdo se acredita con **cortes inmutables** (NO con `saldoAlPactar` autodeclarado). "Pactó y rompió N acuerdos documentados" = evidencia estrella de incobrabilidad.
5. **Anti-escudo-perpetuo**: detector `renegociacionesSeriales` por cliente y `creadoEn` reales (no por `reemplazaA`, que el defraudador controla).

### 1.8 Detectores y acta (3 señales, anti-fatiga)

1. **`acuerdosSobreMora`** — línea OBLIGATORIA del acta + contador en Salud: TODO acuerdo creado sobre cuenta con `vencido > 0`, con la mora del corte previo al lado (cierra la ventana 30-179 días del vector dominante).
2. **`acuerdosAnomalos`** — multi-check tipado: Σcuotas/fechas malformadas, huérfanos post-corrección, dos vigentes solapados, sobregiro, última cuota > umbral del acta (12 meses).
3. **`renegociacionesSeriales`** — ≥2 acuerdos en 12 meses por cliente, por `creadoEn`.

`acuerdosLargos` (M6) gana el parámetro `acuerdos` y **excluye facturas cubiertas por acuerdo vigente**. El guard UI de 365d no aplica en el camino con-cuotas (lo gobierna el horizonte del acuerdo).

### 1.9 Flujo de Kary (celular) y migración

- **CONVIVENCIA, NO MIGRACIÓN** (unánime): el `vencimiento` M6 ES el acuerdo degenerado de 1 cuota; la precedencia lo implementa — cero backfill, 344 docs intactos, cortes históricos intactos.
- Fiado simple: el modal M6 actual, sin cambios.
- Factura en cuotas: toggle "¿en cuotas?" → n/periodicidad/primera fecha → preview generado (v1 sin edición por celda: regenerar con otros parámetros) → UN batch: factura (`vencimiento` = fecha de la ÚLTIMA cuota — la "fecha final" de Daniel visible en toda vista M6-only) + acuerdo 'factura'. Reparto entero COP: cuotas iguales, residuo a la última.
- Renegociación: botón "Acuerdo de pago" en la ficha de la morosa → alcance 'saldo' → mismo generador.
- Estado de cuenta: "próxima cuota: fecha — $monto" + badge "en acuerdo"; lista CxC ordenable por próxima cuota.

### 1.10 Plan de slices

| # | Slice | Gate | Riesgo si se atrasa |
|---|---|---|---|
| 1 | Fórmula extendida inline + copia byte + **matriz de tests** | suite existente pasa SIN tocar un test + casos nuevos verdes | ninguno (inerte) |
| 2 | Reglas (match acuerdos + getAfter + `asesorId` + el `size()` M5 deferido) + índice CG + docs 20/50 | deploy + emulador | ninguno (inerte sin UI) |
| 3 | `corte.js`: ids + acuerdos + `formulaVersion` + `plan`/`bajoAcuerdo` | test de insumos panel↔corte | benigno (1 mes sin foto de planes) |
| 4 | UI Kary (toggle cuotas, renegociar, timeline, próxima cuota) + cache bump | verificación móvil | n/a |
| 5 | Detectores §1.8 + acta + Salud | acta del mes siguiente | ventana detectiva 1 mes |

## 2. DECISIONES Y RECHAZOS (resumen — detalle en el CRUDO)

RECHAZADOS con razón: `deudaIds[]` (inverificable) · `montoPactado` como insumo (parqueo) · almacenar cumplido/incumplido (divergencia) · checkbox auto-gestión (evidencia fabricada) · contar acuerdos por `fechaPacto` (retrofechable) · `moraAlPactar` autodeclarado · par no-atómico · motor de recurrencia server-side · intereses de mora / aceleración automática / notificaciones FCM / multi-select / edición de cuotas / backfill M6 / RBAC asesor (cada uno con su razón y su momento). DECIDIDOS: anulación owner-only · UI v1 sin "fechas específicas" libres (el MODELO las soporta; la UI las difiere hasta caso real) · "quincenal" = días 15 y último del mes · validador en el archivo de paridad.

## 3. PREGUNTAS CERRADAS A DANIEL — ✅ RESPONDIDAS (2026-06-12, mismo día)

- **P1 = A**: la clienta que cumple su acuerdo SALE de rojos, con sello "en acuerdo de pago" y monto aparte en Salud (`bajoAcuerdo`).
- **P2 = A**: Kary pacta SOLA; línea obligatoria del acta (`acuerdosSobreMora`); ANULAR = solo Daniel (owner-only confirmado).
- **P3 = B**: horizonte máximo **24 meses** (`horizonteDias=730` en config, owner-only); todo acuerdo >12 meses resaltado en el acta.
- **Directiva de cadencia (mismo mensaje)**: verificación PESADA por HITOS, no por merge — tests+build por commit se mantienen; verificación experta multi-agente al cerrar la feature completa (post-slice 4/5); prueba de plataforma completa cuando haya bloque sólido.

## 4. RIESGOS RESIDUALES DECLARADOS

(1) SDK de un admin puede crear acuerdos malformados — la fórmula los ignora (conservador) + detector; (2) si P2=A, ventana de parqueo ≤ ~30 días hasta el acta (control detectivo); (3) acuerdo 'factura' con deuda vieja por SDK distorsiona la vista (neutralizado para M7, visible en detector); (4) paridad de INSUMOS = invariante nueva que `corte.js` debe respetar (test); (5) archivo de paridad crece (~350+ líneas) — costo estructural aceptado por UNA fórmula; (6) discontinuidad estadística del corte el mes del despliegue — `formulaVersion` + línea fija en el acta.

## Checklist

- [x] Respuestas de Daniel a P1/P2/P3 registradas (2026-06-12: P1=A, P2=A, P3=B/24m — §3 arriba)
- [ ] Consejo Externo corrido (prompt en bóveda) + síntesis integrada (adoptado/refutado con razón)
- [x] Slice 1: fórmula + matriz de tests (2026-06-12: `acuerdoEsValido` + TRAMOS en `crm-estado-cuenta`; suite vieja 24/24 SIN tocar un test + `test:acuerdos` 15/15 + paridad 3/3)
- [x] Slice 2 CONSTRUIDO (2026-06-12: `acuerdoValido`+`transicionAcuerdoValida`+getAfter+CG+`asesorId`+size() M5; emulador 143/143) — **DEPLOY pendiente: tras integrar el Consejo Externo** (+ docs 20/50 con el deploy)
- [x] Slice 3 CONSTRUIDO (2026-06-12: `agruparPorCliente` con ids + CG acuerdos + `formulaVersion:2` + `plan`/`bajoAcuerdo` por clienta y en totales; `test:insumos` 3/3) — deploy de functions junto al de reglas
- [ ] Slice 4: UI Kary + cache bump
- [ ] Slice 5: detectores + acta + Salud
