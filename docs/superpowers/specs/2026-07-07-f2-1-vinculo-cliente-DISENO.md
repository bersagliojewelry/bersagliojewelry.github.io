# F2.1 — Vínculo pedido↔cliente + CONTRATO DE IDENTIDAD (Diseño · 2026-07-07)

> **SSoT de F2.1** del PLAN ÚNICO ERP v4 (`2026-07-04-plan-unico-erp-v4.md §3`). Decisión Fuerte:
> la **clave canónica de identidad del cliente** es un contrato transversal (lo consumirá el portal
> del cliente F5 para el *claim*). Proceso: `proceso-decision-fuerte` COMPLETO — Fase A (verificación
> contra código) + arquitecto (6 pilares) + **comité ×3 acotado** (arq adversario · operador joyería ·
> seguridad/Habeas Data; veredicto unánime APROBAR_CON_CAMBIOS, cambios INTEGRADOS aquí) + prompt de
> consejo externo (`…-PROMPT-CONSEJO-EXTERNO.md`). CRUDO → bóveda
> `../brain-private/bersaglio/2026-07-07-comite-f2-1-vinculo-cliente-CRUDO.md`.
> Modelo: **Opus 4.8 interinato** (Fable sin cuota) — comité+consejo+skills compensan.

---

## 0. Punto de partida (verificado contra código 2026-07-07)
- `pedidos` = CF-only; ya trae `clienteId: null` sembrado en `crearPedido` (POS) y `iniciarPagoWeb` (web) — [pedidos-core.js:245,382].
- Identidad del comprador WEB vive en `shipping.docType`+`shipping.docNumber` (whitelist `DOC_TYPES`, capturada A.8 para DIAN/antifraude). Un pedido POS puede NO traer shipping/documento.
- `clientes` se crean HOY **client-side** (`createCliente`=addDoc, id auto), reglas admin/owner-only. Campos: `nombre, telefono?, whatsapp?, cumpleanos?, notas?, vendedoraId?, origen, activo, createdAt`. **NO hay campo de documento.** 344 legacy migrados de Excel por nombre, sin cédula.
- `clienteValido()` (reglas) usa whitelist `hasOnly`; `saldoActual` es CF-only (reglas rechazan escritura del cliente).
- Patrón probado de índice de reserva transaccional: `codigosPedido/{codigo}` deny-all CF-only (unicidad por lookup+reserva) — §166.

## 1. LA DECISIÓN — Contrato de identidad (CONGELADO, `normVersion:1`)

### 1.1 Una persona posee N documentos (capa de ALIAS), no "1 clave = 1 persona"
> **Por qué (comité arq FATAL-1):** en Colombia un mismo humano genera varias claves en el tiempo:
> TI→CC (al cumplir 18) · PA→PPT→CC (migrante) · CE→CC (naturalizado) · NIT de persona natural = su CC.
> Tratar la clave como identidad única **parte al humano** en varios `clientes` con saldos separados y
> rompe "una-entidad-por-concepto". La entidad es `clientes/{id}`; los documentos son **aliases** que apuntan a ella.

- `clientes/{id}.docKeys: string[]` — lista de claves de documento del cliente (**CF-only**, espejo para display/merge).
- Índice inverso `clientesPorDoc/{docHash} → { clienteId, docType, capturedAt, capturedBy, consentRef }` — **deny-all, CF-only** (muchos docHash → un clienteId = la tabla de alias + unicidad transaccional).

### 1.2 Clave canónica + normalización SOLO en servidor
> **Por qué (comité arq FATAL-3 + seg):** una función espejada cliente+servidor DIVERGE y produce splits
> silenciosos. El servidor es la **única autoridad**. El cliente manda el documento CRUDO; la CF normaliza.

- `legalIdKey = ${TIPO}:${númeroCanónico}` (ej. `CC:1032456789`). Normalización pura server-side:
  número → `trim` → `toUpperCase` → quitar `[.\-\s]` → conservar `[0-9A-Z]` (pasaportes traen letras).
  **NIT: se descarta el dígito de verificación** (canon = número sin DV; se guarda también el crudo). Tipo de `DOC_TYPES`.
- `normVersion:1` sellado en cada índice/documento → si algún día cambia la normalización, se versiona y migra (no se rompe en silencio).

### 1.3 Índice HASHEADO (no la cédula en la ruta)
> **Por qué (comité arq GRAVE-4 + seg):** la cédula como document-ID viaja a logs/Cloud Logging/BigQuery/backups
> (viola limitación de finalidad). Un SHA pelado es reversible (espacio enumerable).

- `docHash = HMAC-SHA256(legalIdKey, PEPPER)` = ID del documento en `clientesPorDoc`. **PEPPER en Secret Manager** (nunca en repo; rotarlo obliga a re-keyear — se elige estable). La CF siempre tiene el crudo y recomputa el hash → lookup O(1) + índice filtrado inútil sin pepper.
- El `legalIdKey`/`docNumber` CRUDO sigue como CAMPO (necesario DIAN/display), protegido por reglas. **Scrub de logs**: prohibido `console.log` del cliente completo (mismo trato que `shipping.docNumber`).

### 1.4 Todo mutación de identidad = una sola `runTransaction`, CF-only
> **Por qué (comité seg atomicidad):** dos escrituras secuenciales → crash a mitad deja índice huérfano o
> cliente con clave sin índice → **duplicado con el mismo documento**. Una transacción o nada.

- CFs (todas leen el índice como candado + escriben atómico):
  - `resolverCliente({docType,docNumber, telefono?, nombre?})` → **read-only**: normaliza+hashea+busca índice → devuelve `{match: clienteId|null}` + `avisos[]` de posible-duplicado por teléfono/nombre.
  - `crearClienteConDoc({nombre, telefono, docType?, docNumber?, consent?})` → transaccional: si hay doc, normaliza+reserva; **colisión → devuelve el clienteId existente (NO crea, NO falla dura)**; crea cliente + entrada de índice; exige `consent` cuando hay doc.
  - `attachDocACliente({clienteId, docType, docNumber, consent})` → transaccional; colisión con OTRO clienteId → señal `needsMerge` (no rompe).
  - `vincularClientePedido({pedidoId, clienteId})` → escribe `pedido.clienteId` + asiento `pedidos/{id}/historial` (autor+`serverTimestamp`). Re-vincular = asiento nuevo (anular≠borrar).
  - `fusionarClientes({fromId, intoId})` → append-only: re-apunta `pedidos.clienteId`, re-mapea `clientesPorDoc` al superviviente, une `docKeys`; absorbido `activo:false, fusionadoEn:{intoId, at, by}`. (Cartera: ver alcance §3.)

### 1.5 Dedup BLANDO por teléfono/nombre (prevención > merge)
> **Por qué (comité operador):** mientras los 344 legacy + turistas no tengan documento, el **teléfono** es
> la llave real. Prevenir el duplicado en el origen evita el 90% de las fusiones.

- Antes de crear un cliente (mostrador o desde-pedido), `resolverCliente` avisa "¿Es esta misma [Ana María]?" si el teléfono o el nombre ya existen → Kary vincula al existente en vez de crear duplicado.

### 1.6 Reservas para el portal F5 (hoy vacías, contrato atado)
> **Por qué (comité seg GRAVE-5):** la cédula NO es secreto (va en cada factura). Un portal que dé datos por
> "buscar por documento" = account-takeover + **enumeración** (mapear clientes de joyería de lujo = inteligencia
> para hurto/extorsión). El contrato F5 se ata AHORA o nace inseguro (caro de revertir = re-contactar la base).

- `clientes/{id}.authUid: null` (reservado; enlazará uid autenticado ↔ cliente en F5).
- `clientes/{id}.contacto: { telefono?, email?, contactVerified: false }` — canal de contacto **verificable**; F5 exigirá **prueba de posesión** (OTP al contacto registrado), respuesta uniforme (sin oráculo de existencia), App Check + rate-limit. El documento será **factor de enlace, jamás la llave** que abre datos.
- **Consecuencia en F2.1**: al crear cliente en mostrador se captura teléfono (mínimo) para que F5 tenga segundo factor.

### 1.7 Consentimiento en mostrador (Habeas Data, Ley 1581 + Decreto 1377)
> **Por qué (comité seg):** el checkout web ya captura consentimiento; **el mostrador NO = brecha actual**.
> Guardar la cédula de un cliente presencial exige autorización previa/expresa/informada.

- `crearClienteConDoc`/`attachDocACliente` **rechazan persistir el documento sin** `consent:{granted:true, at, method:'presencial', capturedBy:<uid>, policyVersion, evidence?}`. La UI de mostrador muestra el aviso de finalidad (DIAN/antifraude/cartera) + limitación de finalidad (no marketing).
- Derechos del titular (diseñados, no todos con UI hoy): **rectificación** = re-key por CF (nueva entrada de índice + repunte + `historial`; `legalIdKey` NO es inmutable "para siempre", es inmutable-para-cliente pero re-keyeable por CF). **Supresión vs retención**: la cédula en `pedido` (soporte de factura, retención DIAN/Cód. Comercio ~10 años) NO se borra; la de `clientes`/índice (conveniencia CRM) SÍ es suprimible. **Org (flag, fuera de código)**: Política de Tratamiento publicada + inscripción **RNBD** ante la SIC → TODO nuevo.

## 2. Los 3 flujos de vínculo
1. **Mostrador (POS)** — **OPCIONAL + POST-cobro** (nunca frena el cobro): tras confirmar el pago aparece "¿Adjuntar cliente?" → búsqueda por nombre/cédula/**teléfono** (`resolverCliente`) → si aparece "Vincular"; si no "Crear" (nombre+teléfono, cédula+consent opcional); si hay fila esperando "Después" → la venta cae en cola **"ventas sin cliente"** para el cierre del día.
2. **Web** — auto-sugerido (la cédula ya llegó): el módulo Pedidos normaliza `shipping.docType+docNumber` → `resolverCliente` → "¿Es [X]? Vincular" (1 clic) o "Crear cliente desde este pedido" (prefill nombre/tel/doc + consent ya capturado en checkout).
3. **Legacy/sin doc** — búsqueda manual por nombre/teléfono + vínculo; aviso anti-duplicado.

## 3. Alcance de F2.1 (ACOTADO — anti-gold-plating, §9.4)
**SÍ ahora (el contrato irreversible + vínculo mínimo viable):**
- Modelo: `docKeys[]`, `authUid`, `contacto{}` en `clientes`; índice `clientesPorDoc` hasheado; `consent` en docs.
- CFs: `resolverCliente`, `crearClienteConDoc`, `attachDocACliente`, `vincularClientePedido` + `fusionarClientes` (backend, acción **owner-only** mínima).
- UI: adjuntar en POS (post-cobro) + cola "ventas sin cliente" + sugerencia de match en Pedidos web + búsqueda/creación con dedup blando.
- Reglas: `clientesPorDoc` deny-all (incl. admin); `docKeys/legalIdKey/authUid/contacto.contactVerified` no-escribibles por cliente (ausentes en create, inmutables en update); consent obligatorio en CF. Censo de escritores (L-41) + red-team de reglas (W-11).
- Pepper en Secret Manager. Normalización pura testeable (`normalizeLegalId`, espejo de `saldo.js`).

**NO ahora (diferido, contrato ya compatible):**
- Portal F5 completo (claim/OTP) — solo se RESERVAN los campos.
- Merge de CARTERA cuando ambos clientes tienen movimientos (raro; la prevención lo evita) → F2.x si aparece señal; `fusionarClientes` v1 re-apunta pedidos+índice y marca absorbido.
- UI pulida de fusión (v1 = acción owner-only simple).
- Modelo empresa/regalo rico (razón social + "paga uno/es para otro") → **flag** en F2.1 (`docType:NIT` soportado; "quién paga ≠ quién usa" se resuelve en F2.2 factura multi-línea).
- Backfill de cédulas a los 344 legacy: **PROHIBIDO automático** (Excel corrompe cédulas). Se adquieren por captura verificada.

## 4. IAP (Impact Analysis Previo)
- **(A) Modificar**: `functions/` (nuevo módulo identidad `functions/identidad-core.js` + wrappers CF + índice) · `firestore.rules` (censo) · `firestore.indexes.json` (`clientesPorDoc`, y `clientes.docKeys` array-contains si se lista) · `js/crm-service.js` (rutas por CF cuando hay doc) · `js/admin/pos.js` (adjuntar post-cobro + cola) · `js/admin/pedidos.js` (sugerencia de match) · `js/pedidos-service.js` (transporte nuevas CFs).
- **(B) INTACTO (verificado)**: snapshot del pedido (el vínculo es aditivo, no recalcula total) · `crearPedido`/webhook/reaper/firma (no se tocan — interinato Opus lo prohíbe) · `saldoActual`/recálculo de cartera · las CFs de caja/bóveda (§169).
- **(C) Código muerto**: ninguno identificado; `createCliente` client-side se CONSERVA para clientes sin documento (ruta legítima).
- **(D) Refactor**: creación de cliente pasa a doble ruta explícita (sin doc = client-side; con doc = CF). Mantenibilidad: un solo `identidad-core.js` con la normalización pura.
- **(E) Riesgos + rollback + tests**: riesgo = reglas nuevas (mitiga red-team W-11 + test:rules) · atomicidad (mitiga runTransaction + test integración emulador) · pepper mal configurado (mitiga fallback claro + no romper si falta → CF error explícito). Rollback = feature-flag `config/identidad.activo` (como acuerdos/cartera). Tests: `normalizeLegalId` puro (CC/CE/NIT±DV/PA/ceros a la izq) · rules (deny-all índice, inmutabilidad) · integración crear/attach/colisión→merge/vincular.

## 5. Gate empírico — Pruebas de Estado-Cero (a recorrer con caza-bugs en navegador REAL)
1. POS: cobro sin adjuntar cliente → venta OK, cae en "ventas sin cliente".
2. POS: adjuntar cliente existente (por teléfono) → vínculo + historial.
3. POS: crear cliente nuevo con cédula+consent → índice reservado, sin duplicado.
4. POS: intentar crear con teléfono ya existente → aviso "¿Es la misma?" ANTES de duplicar.
5. Web: pedido con cédula que YA es cliente → "¿Es X? Vincular" 1 clic funciona.
6. Web: pedido con cédula nueva → "crear desde pedido" reserva índice.
7. Colisión: crear/attach doc que ya pertenece a otro → NO falla dura (crear devuelve existente; attach señala merge).
8. Fusión owner-only: dos clientes → uno; pedidos re-apuntados; absorbido `activo:false`.
9. Reglas: cliente intenta escribir `legalIdKey`/`docKeys`/leer `clientesPorDoc` → DENEGADO.
10. Borde estado-cero: vincular y luego des-vincular/re-vincular → historial append-only correcto.

## 6. Mini-instructivo Kary (5 pasos)
1. Cobro la pieza (igual que hoy). 2. Sale "¿Adjuntar cliente?" → escribo nombre/cédula/**teléfono**.
3. Si aparece → "Vincular". 4. Si no → "Crear" (nombre+teléfono; cédula opcional con visto bueno del cliente).
5. Si hay fila → "Después" y la venta queda en "ventas sin cliente" para el cierre del día.

## 7. Forks para el dueño (Daniel) — RESUELTOS (2026-07-07)
- **F-A (operación)**: ✅ **OPCIONAL + post-cobro + cola "ventas sin cliente"** (Daniel 2026-07-07). Nunca frena el cobro.
- **F-B (alcance/tiempo)**: ✅ **ROBUSTO DE UNA** (Daniel 2026-07-07). Se construye el contrato de identidad completo ahora (§1 íntegro) — cero retroceso; el portal F5 nace con el contrato atado.

## 8. Artefactos del flujo (proceso-decision-fuerte)
- ✅ Comité ×3 DECISIÓN (crudo `…-comite-f2-1-vinculo-cliente-CRUDO.md` + síntesis §1). ✅ Prompt consejo decisión (`…-vinculo-cliente-PROMPT-CONSEJO-EXTERNO.md`).
- ✅ Mockup del widget "adjuntar cliente" (2026-07-07, POS post-cobro + cola + match web).
- ✅ Comité ×3 UI (crudo `…-comite-f2-1-UI-CRUDO.md` + síntesis §9). ✅ Prompt consejo UI (`…-f2-1-UI-PROMPT-CONSEJO-EXTERNO.md`).
- ⏳ Validación Chrome navegador REAL = gate empírico al final de la implementación (tras deploy dark + pepper + flag).

## 9. Diseño de IMPLEMENTACIÓN de la UI (comité ×3 UI, 2026-07-07 — dinero/CRM → flujo completo, directiva Daniel)
> Todos los cambios del comité UI (unánime APROBAR_CON_CAMBIOS) INTEGRADOS. GATE de implementación:

### 9.1 Transporte (`js/pedidos-service.js`)
Añadir callables lazy: `resolverCliente`, `crearClienteConDoc`, `attachDocACliente`, `vincularClientePedido`, `fusionarClientes` (patrón `_callable`).

### 9.2 POS (`js/admin/pos.js`) — money-safety PRIMERO (comité regresión)
- **Orden blindado en `doRegister`**: `resetSale()` + `loadVentas()` corren PRIMERO (o en `finally`); el panel de adjuntar se abre DESPUÉS, envuelto en `try/catch`. **El panel JAMÁS puede impedir el reset** (si `resetSale` no corre, `_pedidoId` no rota → la venta siguiente colisiona por idempotencia → venta perdida en silencio con toast de éxito). 🔴 riesgo #1.
- **`pedidoId` por VALOR**: el panel captura `const pedidoId = res.pedidoId` (string) / `data-pedido-id`; **NUNCA lee el global `_pedidoId` al vincular** (lo regenera resetSale → vincularía a la venta B).
- **Botón por fila (`data-id`) = camino AUTORITATIVO** de adjuntar (en `renderVentas`, filas sin `clienteId`); el panel post-venta es solo conveniencia → mata el traslape A/B.
- Panel **no-modal, FUERA de `anyOverlayOpen()`** (si contara, inhibiría el auto-traslado de caja F2.0), **flag propio** `_attachSubmitting`, **auto-descartable**: iniciar la siguiente venta lo archiva solo a la cola (SIN "Después" obligatorio).
- **Cola "ventas sin cliente" DENTRO del POS**: badge permanente "· N" + filas auto-identificables (pieza+monto+hora+pago) + adjuntar a 1 toque + checkpoint suave al cerrar caja.
- **Clientes**: fetch ACOTADO/cacheado por sesión (NO `onSnapshot` permanente de la colección — PII+escala); `append` en memoria al crear; norte = typeahead server-side. Stale solo afecta el dedup blando (server es autoridad; colisión→existente).

### 9.3 Pedidos web (`js/admin/pedidos.js`) — SOLO admin — **F2.1b DIFERIDO (dormido)**
- **Estado**: el backend (`resolverCliente` admin-only + `vincularClientePedido`) está LISTO y probado; la UI del match web se difiere a **F2.1b** porque hoy hay **CERO pedidos web** (1ª APPROVED pendiente) → UI para 0 usuarios = gold-plating (L-50). Se cablea cuando lleguen pedidos web (trivial, contrato listo).
- **Diseño (cuando se active)**: en el detalle, si el pedido trae `shipping.docType+docNumber` y no tiene `clienteId`: `resolverCliente` → match → "¿Es X? Vincular" (1 clic) / "Crear desde pedido" (prefill + `crearClienteConDoc` + `vincularClientePedido`). Inyectar con DOM seguro tras `renderDetalle` (append a `#ped-detail`).
- 🔴 **`resolverCliente` es admin-only** (el wrapper ya exige rol VENTAS) y se llama **SOLO desde el panel admin, JAMÁS desde el checkout público** (evita el oráculo de enumeración del portal F5). Invariante documentado.

### 9.4 Seguridad / Habeas Data (comité seguridad)
- **PII enmascarada por defecto** en el POS (`CC •••.456.789` · tel `···8877`); revelar completo bajo clic explícito. **Cero PII en logs/analytics/errores/URL**.
- **Dedup blando client-side** en módulo aislado `js/admin/advisory-match.js` (nombre `advisoryMatchHint`, no `normalizeKey`): normaliza teléfono/nombre SOLO para el aviso "¿es la misma?"; **nunca persiste, nunca decide fusión, el server re-valida**. Frontera documentada (la normalización CANÓNICA del documento sigue solo-servidor).
- **Consentimiento**: la UI MUESTRA aviso (finalidad DIAN/antifraude/cartera + responsable Bersaglio + referencia a política + derechos del titular) + checkbox; y el backend registra `{version_politica, timestamp, capturadoPor, canal:'mostrador_POS', finalidades[]}`. **Ampliar `selloConsent`** de `identidad-cf.js` para aceptar `finalidades`+`canal`. El gate real = el CF (ya obliga). Consultar skill `legal-colombia` para el texto exacto del aviso.

### 9.5 Feature-flag + orden de deploy
- `config/identidad.activo` gatea toda la UI nueva. **Fail-closed**: read síncrono cacheado en boot; si no se puede leer → OFF (POS idéntico a hoy). Chequeado en `doRegister` y `renderVentas`.
- Orden: **deploy dark (flag off)** → `firebase functions:secrets:set IDENTIDAD_PEPPER` → flip `config/identidad.activo=true` → **gate Chrome**. (Pepper ausente + flag on → CFs lanzan, pero post-venta + try/catch → POS seguro.)

### 9.6 Gate empírico (Chrome navegador REAL) — lista cerrada estado-cero
Reusa §5 (estado-cero backend) + UI: cobrar sin adjuntar (venta OK, va a la cola) · adjuntar existente 1 toque · crear con cédula+consent · aviso anti-duplicado por teléfono · match web 1 clic · **traslape A/B: vincular la venta correcta** · flag OFF = POS igual a hoy · PII enmascarada · panel no inhibe auto-traslado de caja.
**GATE EJECUTADO 2026-07-07 (prod, Chrome real, Claude condujo la extensión) → VERDE**: venta $1.000 → form reset (money-safety) → banner → modal (typeahead 344 reales + PII "sin documento") → vincular escribió `clienteId` (backend confirmado) → badge/banner limpios → anular (pieza reintegrada). ADR §171.

## 10. Mini-instructivo para Kary (operadora única, no técnica)
> Aparece SOLO si el flag `config/identidad.activo` está en verdadero (ya LIVE). Es OPCIONAL — nunca frena la venta.
1. **Cobra la venta como siempre** (elige pieza → precio → medio → Registrar). El cobro no cambia en nada.
2. Después del cobro, arriba de "Ventas recientes" aparece **"¿adjuntar cliente?"**. Es opcional: si estás de afán, **no toques nada** — la venta queda marcada "sin cliente" y un contador te la recuerda para el cierre del día.
3. Para adjuntar, toca **"+ Adjuntar cliente"** (o el **"+ cliente"** de la venta en la lista) → busca por **nombre, cédula o teléfono**.
4. **Si aparece** el cliente → toca **"Vincular"**. Listo.
5. **Si no aparece** → **"Crear cliente nuevo"**: nombre + teléfono bastan. La **cédula es opcional** y solo se guarda si el cliente **da su visto bueno** (marca la casilla de autorización de datos — es un requisito legal, Habeas Data). Si sale un aviso "¿es la misma persona?", revísalo antes de crear un duplicado.

## 11. Follow-ups operativos
- ✅ **Aviso de consentimiento** reforzado (2026-07-07): responsable + enlace a `privacidad.html` + derecho a revocar + lenguaje Ley 1581 "previa/expresa/informada". **[a verificar]** con abogado colombiano antes de uso masivo (orientación, no asesoría legal — método `legal-colombia`).
- ⏳ **F2.1b** match web en `pedidos.js` (dormido; backend listo).
