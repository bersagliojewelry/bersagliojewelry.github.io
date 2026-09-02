# 🔥 31 — LECCIONES FIRESTORE / CLOUD FUNCTIONS / REGLAS (hija de `30-LECCIONES`)

> **Nodo neuronal: Memoria Procedimental — sub-lóbulo Backend Firebase.** Hija de
> `docs/30-LECCIONES.md` (§G.5 sharding por saturación de chars). Se consulta on-demand
> ante el **Trigger de Experiencia (`CLAUDE.md §G.2`)** ANTES de tocar `firestore.rules`,
> Cloud Functions, índices, custom claims o el emulador. La madre `30` deja un **stub de
> 1 línea por cada L-NN** aquí movida (para que `[[L-NN]]` siga resolviendo en `30`, donde
> el kernel lee las definiciones); el DETALLE vive aquí — salvo el de las **migradas al maestro**
> (F2 lote 10: `L-12/13/14/16/17` · lote 11: `L-29/34/35/36/37/38` · lote 12: `L-56/65`), que dejan su stub aquí.
>
> **Mantenimiento (Reflejo de Frescura §G.4)**: nuevas lecciones Firestore/CF/reglas se
> escriben aquí, dejando su stub `### L-NN: <título> → 31` en `30`. **Tope ~16000 chars.**
> ⚠️ El kernel `brain-check.mjs` lee las definiciones `### L-NN` SOLO de `30` (escritor
> único = cars-operador, L-31): por eso el header-stub DEBE permanecer en `30`.

---

### L-12: Testear Firestore rules sin Java local — vía CI (zero-budget)
⇒ **Migrada al maestro** (F2 lote 10): [[BERS:L-12]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).

### L-13: Reglas `validate` tolerantes a merge updates (Firestore)
⇒ **Migrada al maestro** (F2 lote 10): [[BERS:L-13]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).

### L-14: NO quitar el fallback de config PÚBLICA sin confirmar que la fuente real está poblada (incidente prod 2026-06-06)
⇒ **Migrada al maestro** (F2 lote 10): [[BERS:L-14]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).

### L-16: Reglas de seguridad — los tests "felices" no bastan; revisar adversarialmente el PAYLOAD de create
⇒ **Migrada al maestro** (F2 lote 10): [[BERS:L-16]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).

### L-17: Testear Cloud Functions — lógica pura (sin emulador) + integración (con emulador)
⇒ **Migrada al maestro** (F2 lote 10): [[BERS:L-17]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).

### L-29: Aging/mora "en vivo" sin infra nueva — FIFO puro + collectionGroup filter-free + fecha round-trip
⇒ **Migrada al maestro** (F2 lote 11): [[BERS:L-29]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).

### L-34: Transacciones Firestore y esc() en atributos — grietas que la revisión adversarial cazó (ADR §64)
⇒ **Migrada al maestro** (F2 lote 11): [[BERS:L-34]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).

### L-35: Custom claims de Firebase — el espejo doc→claim es un RECONCILIADOR, no un copista (ADR §65)
⇒ **Migrada al maestro** (F2 lote 11): [[BERS:L-35]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).

### L-36: "Desactivar" debe DESHABILITAR la cuenta de Auth — un campo en un doc NO es una credencial (ADR §66)
⇒ **Migrada al maestro** (F2 lote 11): [[BERS:L-36]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).

### L-37: CI con toolchain SIN PIN = bomba de tiempo · el emulador Firestore exige Java 21 (ADR §67)
⇒ **Migrada al maestro** (F2 lote 11): [[BERS:L-37]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).

### L-38: Reglas Firestore — guard `(A || B)` + `hasOnly` que whitelista B = estado contradictorio (ADR §72)
⇒ **Migrada al maestro** (F2 lote 11): [[BERS:L-38]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).

### L-48: Reglas `siteContent` — whitelist a nivel de SECCIÓN, no de clave (ADR §104) [stub-header en 30]
**Disparador**: añadir un campo a una página del CMS (`siteContent/{page}`) y dudar si tocar `firestore.rules`. **Lección (§103 F1)**: `siteContentValid` valida `hasOnly([secciones+metadata])` + `<sección> is map` + cap de listas (`siteListOk`), pero **NO recursa en las claves internas** del sub-mapa (editor = de confianza, contenido = marketing reconstruible). ⇒ agregar un campo DENTRO de una sección ya whitelistada (`hero.bgImageLqip`, etc.) **se acepta sin tocar reglas** (L-22 no aplica). SÍ obligan a reglas: sección nueva, lista nueva con cap, o tope server-side. Lock test en `firestore-rules.test.mjs`. Relacionado [[L-16]], [[L-13]], [[L-47]].

### L-56: Callable v2 que falla con 403 (no se ejecuta) = falta el invoker público — delete+recreate (ADR §115) [stub-header en 30]
⇒ **Migrada al maestro** (F2 lote 12): [[BERS:L-56]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).

### L-65: `secrets:set` ≠ deploy de `.env` (Cloud Functions gen2) [stub-header en 30]
⇒ **Migrada al maestro** (F2 lote 12): [[BERS:L-65]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).
