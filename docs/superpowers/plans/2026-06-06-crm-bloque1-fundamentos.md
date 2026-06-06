# CRM Bloque 1 — Fundamentos (datos + roles + reglas) · Plan de Implementación

> **Para quien ejecute:** SUB-SKILL REQUERIDA: usar `superpowers:subagent-driven-development` (recomendado) o `superpowers:executing-plans` para implementar tarea por tarea. Los pasos usan checkbox (`- [ ]`).

**Goal:** Dejar la base segura del CRM de cuentas por cobrar: rol `vendedora`, modelo de datos (clientes, movimientos, config, solicitudesCorreccion) y reglas Firestore con RBAC (owner/admin todo; vendedora scoped + append-only), verificadas por tests.

**Architecture:** Reusa el panel admin + Firestore + Cloud Functions existentes. El rol vive en el doc `users/{uid}` y lo leen las reglas vía `get()` (patrón actual; custom claims = optimización futura S4). Append-only para vendedoras = integridad del libro de fiado.

**Tech Stack:** Firebase (Firestore + Functions v2 + Auth), reglas `firestore.rules`, tests con `@firebase/rules-unit-testing` + `node:test`.

**Spec:** `docs/superpowers/specs/2026-06-06-crm-cuentas-design.md`.

---

## Prerrequisito (una vez): harness de tests de reglas operativo
El job CI `firestore-rules-test.yml` está **pausado** y falló sin diagnosticar; el emulador necesita **Java**. Antes de la Tarea 5, una de estas:
- **(a)** Instalar un JDK (Temurin 17) en local → `npm run test:rules` corre el emulador local; **o**
- **(b)** Reactivar el workflow CI (volver a poner `on: push/pull_request`) y leer el log del primer run para arreglar la causa real.
- [ ] Confirmar cuál vía se usará y dejar `npm run test:rules` (o el CI) corriendo en verde sobre los tests S5/S6 actuales ANTES de añadir los del CRM.

## Mapa de archivos
- `functions/index.js` — añadir `vendedora` a roles + permitirlo en `createUser`/`updateUserRole`.
- `firestore.rules` — helpers de rol + reglas de `clientes`, `clientes/{}/movimientos`, `config`, `solicitudesCorreccion`.
- `tests/firestore-rules.test.mjs` — añadir casos del CRM.

---

### Tarea 1: Añadir el rol `vendedora` a Cloud Functions

**Files:** Modify: `functions/index.js`

- [ ] **Step 1: Añadir `vendedora` al nivel de roles**

En `functions/index.js:20`, reemplazar:
```js
const ROLE_LEVEL = { owner: 3, admin: 2, editor: 1 };
```
por:
```js
const ROLE_LEVEL = { owner: 3, admin: 2, editor: 1, vendedora: 1 };
```

- [ ] **Step 2: Permitir crear vendedoras en `createUser`**

En `functions/index.js:47`, reemplazar:
```js
    if (!['admin', 'editor'].includes(role)) {
        throw new HttpsError('invalid-argument', 'Rol inválido. Usa "admin" o "editor".');
    }
```
por:
```js
    if (!['admin', 'editor', 'vendedora'].includes(role)) {
        throw new HttpsError('invalid-argument', 'Rol inválido. Usa "admin", "editor" o "vendedora".');
    }
```

- [ ] **Step 3: Permitir asignar `vendedora` en `updateUserRole`**

En `functions/index.js:80`, reemplazar:
```js
    if (!['admin', 'editor'].includes(newRole)) {
        throw new HttpsError('invalid-argument', 'Rol inválido.');
    }
```
por:
```js
    if (!['admin', 'editor', 'vendedora'].includes(newRole)) {
        throw new HttpsError('invalid-argument', 'Rol inválido.');
    }
```

- [ ] **Step 4: Verificar que el proyecto de functions compila/lint**

Run: `cd functions && npm run lint` (si existe) o `node -c index.js`
Expected: sin errores de sintaxis.

- [ ] **Step 5: Commit**

```bash
git add functions/index.js
git commit -m "feat(crm): añadir rol 'vendedora' a Cloud Functions (createUser/updateUserRole)"
```

---

### Tarea 2: Helpers de rol del CRM en las reglas

**Files:** Modify: `firestore.rules` (sección de helpers, tras `isEditor()`)

- [ ] **Step 1: Añadir helpers `isVendedora` y validadores del CRM**

En `firestore.rules`, tras la función `isEditor()`, añadir:
```
    function isVendedora() {
      return isAuth() && getUserRole() == 'vendedora';
    }
    function clienteOwnerUid(clienteId) {
      return get(/databases/$(database)/documents/clientes/$(clienteId)).data.vendedoraUid;
    }
    function nonEmptyStr(v) { return v is string && v.size() > 0; }
    function clienteValido() {
      let d = request.resource.data;
      return nonEmptyStr(d.nombre)
          && (d.vendedoraUid == null || d.vendedoraUid is string)
          && (d.telefono == null || d.telefono is string)
          && (d.saldoActual == null || d.saldoActual is number);
    }
    function movimientoValido() {
      let d = request.resource.data;
      return d.tipo in ['apertura','factura','abono','ajuste']
          && d.monto is number && d.monto >= 0
          && (d.descripcion == null || d.descripcion is string)
          && d.registradoPor == request.auth.uid;
    }
```

> Nota: `nonEmptyStr` puede ya existir (S6). Si está duplicada, conserva una sola.

- [ ] **Step 2: Verificar sintaxis con el harness (no debe romper reglas actuales)**

Run: `npm run test:rules`
Expected: los tests S5/S6 actuales siguen PASANDO (las reglas compilan con los nuevos helpers).

- [ ] **Step 3: Commit**

```bash
git add firestore.rules
git commit -m "feat(crm): helpers de rol vendedora + validadores en reglas"
```

---

### Tarea 3: Reglas de `clientes` (RBAC + scoped a la vendedora)

**Files:** Modify: `firestore.rules` · Test: `tests/firestore-rules.test.mjs`

- [ ] **Step 1: Escribir los tests (fallan primero)**

En `tests/firestore-rules.test.mjs`, dentro del `before` (seed con reglas off) añadir:
```js
        await setDoc(doc(db, 'users/vendUid'), { role: 'vendedora' });
        await setDoc(doc(db, 'users/vend2Uid'), { role: 'vendedora' });
        await setDoc(doc(db, 'clientes/cliV'), { nombre: 'Cliente V', vendedoraUid: 'vendUid', saldoActual: 0 });
```
y al final del archivo añadir:
```js
test('CRM clientes · admin lee cualquier cliente', async () => {
    await assertSucceeds(getDoc(doc(asUser('adminUid'), 'clientes/cliV')));
});
test('CRM clientes · vendedora lee SU cliente', async () => {
    await assertSucceeds(getDoc(doc(asUser('vendUid'), 'clientes/cliV')));
});
test('CRM clientes · vendedora NO lee cliente de otra', async () => {
    await assertFails(getDoc(doc(asUser('vend2Uid'), 'clientes/cliV')));
});
test('CRM clientes · vendedora crea cliente asignado a sí misma', async () => {
    await assertSucceeds(setDoc(doc(asUser('vendUid'), 'clientes/cliNuevo'), { nombre: 'Nueva', vendedoraUid: 'vendUid' }));
});
test('CRM clientes · vendedora NO crea cliente asignado a otra', async () => {
    await assertFails(setDoc(doc(asUser('vendUid'), 'clientes/cliX'), { nombre: 'X', vendedoraUid: 'vend2Uid' }));
});
test('CRM clientes · vendedora NO edita ni borra', async () => {
    await assertFails(setDoc(doc(asUser('vendUid'), 'clientes/cliV'), { nombre: 'Cambiado', vendedoraUid: 'vendUid' }, { merge: true }));
    await assertFails(deleteDoc(doc(asUser('vendUid'), 'clientes/cliV')));
});
test('CRM clientes · admin edita y borra', async () => {
    await assertSucceeds(setDoc(doc(asUser('adminUid'), 'clientes/cliV'), { nombre: 'Editado por Kary' }, { merge: true }));
});
```

- [ ] **Step 2: Correr los tests para verlos FALLAR**

Run: `npm run test:rules`
Expected: FAIL (aún no hay reglas para `clientes`).

- [ ] **Step 3: Escribir las reglas de `clientes`**

En `firestore.rules`, dentro de `match /databases/{database}/documents {`, añadir:
```
    match /clientes/{clienteId} {
      allow read:   if isAdmin() || (isVendedora() && resource.data.vendedoraUid == request.auth.uid);
      allow create: if clienteValido() && (isAdmin() ||
                       (isVendedora() && request.resource.data.vendedoraUid == request.auth.uid));
      allow update: if isAdmin();   // vendedora NO edita (corrección vía solicitud)
      allow delete: if isAdmin();   // solo Kary/Daniel borran
    }
```

- [ ] **Step 4: Correr los tests para verlos PASAR**

Run: `npm run test:rules`
Expected: PASS (todos los de `clientes`).

- [ ] **Step 5: Commit**

```bash
git add firestore.rules tests/firestore-rules.test.mjs
git commit -m "feat(crm): reglas de clientes (admin todo, vendedora scoped, sin editar/borrar) + tests"
```

---

### Tarea 4: Reglas de `movimientos` (append-only para vendedora)

**Files:** Modify: `firestore.rules` · Test: `tests/firestore-rules.test.mjs`

- [ ] **Step 1: Escribir los tests (fallan primero)**

En el `before` (seed) añadir:
```js
        await setDoc(doc(db, 'clientes/cliV/movimientos/m1'), { tipo: 'factura', monto: 100000, registradoPor: 'vendUid' });
```
y al final añadir:
```js
test('CRM mov · vendedora añade movimiento a SU cliente', async () => {
    await assertSucceeds(setDoc(doc(asUser('vendUid'), 'clientes/cliV/movimientos/m2'), { tipo: 'abono', monto: 50000, registradoPor: 'vendUid' }));
});
test('CRM mov · vendedora NO añade a cliente de otra', async () => {
    await assertFails(setDoc(doc(asUser('vend2Uid'), 'clientes/cliV/movimientos/m3'), { tipo: 'abono', monto: 50000, registradoPor: 'vend2Uid' }));
});
test('CRM mov · vendedora NO edita ni borra movimientos (append-only)', async () => {
    await assertFails(setDoc(doc(asUser('vendUid'), 'clientes/cliV/movimientos/m1'), { monto: 1 }, { merge: true }));
    await assertFails(deleteDoc(doc(asUser('vendUid'), 'clientes/cliV/movimientos/m1')));
});
test('CRM mov · movimiento con tipo inválido es rechazado', async () => {
    await assertFails(setDoc(doc(asUser('vendUid'), 'clientes/cliV/movimientos/mBad'), { tipo: 'regalo', monto: 1, registradoPor: 'vendUid' }));
});
test('CRM mov · admin edita/borra movimientos (correcciones)', async () => {
    await assertSucceeds(setDoc(doc(asUser('adminUid'), 'clientes/cliV/movimientos/m1'), { anulado: true }, { merge: true }));
});
```

- [ ] **Step 2: Correr para ver FALLAR**

Run: `npm run test:rules` — Expected: FAIL (sin reglas de movimientos).

- [ ] **Step 3: Escribir las reglas de `movimientos`** (subcolección dentro de `match /clientes/{clienteId}`)

Dentro del bloque `match /clientes/{clienteId} { … }`, añadir antes de su `}`:
```
      match /movimientos/{movId} {
        allow read:   if isAdmin() || (isVendedora() && clienteOwnerUid(clienteId) == request.auth.uid);
        allow create: if movimientoValido() && (isAdmin() ||
                         (isVendedora() && clienteOwnerUid(clienteId) == request.auth.uid));
        allow update, delete: if isAdmin();   // append-only para vendedora
      }
```

- [ ] **Step 4: Correr para ver PASAR**

Run: `npm run test:rules` — Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add firestore.rules tests/firestore-rules.test.mjs
git commit -m "feat(crm): reglas append-only de movimientos por cliente + tests"
```

---

### Tarea 5: Reglas de `config` y `solicitudesCorreccion`

**Files:** Modify: `firestore.rules` · Test: `tests/firestore-rules.test.mjs`

- [ ] **Step 1: Tests (fallan primero)**

En el `before` (seed) añadir:
```js
        await setDoc(doc(db, 'config/negocio'), { fechaCorteMigracion: '2025-12-31' });
        await setDoc(doc(db, 'solicitudesCorreccion/s1'), { vendedoraUid: 'vendUid', clienteId: 'cliV', estado: 'pendiente' });
```
y al final añadir:
```js
test('CRM config · cualquiera autenticado lee config', async () => {
    await assertSucceeds(getDoc(doc(asUser('vendUid'), 'config/negocio')));
});
test('CRM config · vendedora NO escribe config', async () => {
    await assertFails(setDoc(doc(asUser('vendUid'), 'config/negocio'), { fechaCorteMigracion: 'x' }, { merge: true }));
});
test('CRM config · admin escribe config', async () => {
    await assertSucceeds(setDoc(doc(asUser('adminUid'), 'config/negocio'), { fechaCorteMigracion: '2026-01-01' }, { merge: true }));
});
test('CRM solicitud · vendedora crea su solicitud', async () => {
    await assertSucceeds(setDoc(doc(asUser('vendUid'), 'solicitudesCorreccion/s2'), { vendedoraUid: 'vendUid', clienteId: 'cliV', estado: 'pendiente' }));
});
test('CRM solicitud · vendedora NO aprueba (update)', async () => {
    await assertFails(setDoc(doc(asUser('vendUid'), 'solicitudesCorreccion/s1'), { estado: 'aprobada' }, { merge: true }));
});
test('CRM solicitud · admin aprueba', async () => {
    await assertSucceeds(setDoc(doc(asUser('adminUid'), 'solicitudesCorreccion/s1'), { estado: 'aprobada' }, { merge: true }));
});
```

- [ ] **Step 2: Correr para ver FALLAR**

Run: `npm run test:rules` — Expected: FAIL.

- [ ] **Step 3: Escribir las reglas**

En `firestore.rules`, reemplazar el bloque actual de `config` por:
```
    match /config/{docId} {
      allow read:  if true;            // health check + parámetros del negocio
      allow write: if isAdmin();       // antes era isOwner(); se endurece a admin/owner
    }
```
y añadir:
```
    match /solicitudesCorreccion/{id} {
      allow read:   if isAdmin() || (isVendedora() && resource.data.vendedoraUid == request.auth.uid);
      allow create: if isVendedora() && request.resource.data.vendedoraUid == request.auth.uid;
      allow update, delete: if isAdmin();   // aprobar/rechazar/limpiar
    }
```

- [ ] **Step 4: Correr para ver PASAR**

Run: `npm run test:rules` — Expected: PASS (toda la suite).

- [ ] **Step 5: Commit**

```bash
git add firestore.rules tests/firestore-rules.test.mjs
git commit -m "feat(crm): reglas de config (write admin) y solicitudesCorreccion + tests"
```

---

### Tarea 6: Verificación integral + documentación

- [ ] **Step 1: Correr toda la suite de reglas**

Run: `npm run test:rules`
Expected: PASS — incluye S5/S6 (Fase 2) + todos los del CRM (clientes, movimientos, config, solicitudes).

- [ ] **Step 2: Build del sitio (no se rompió nada)**

Run: `npm run build`
Expected: `✓ built` sin errores.

- [ ] **Step 3: Alimentar el cerebro**

- Actualizar `docs/05-ESTADO-GLOBAL.md` (Bloque 1 hecho), `docs/10-MEMORIA-CORTO-PLAZO.md` (TODO-09 progreso), y `docs/20-MEMORIA-ESPACIAL.md` (nuevas colecciones del CRM).
- `npm run brain:check` → SANO.

- [ ] **Step 4: Commit del cerebro**

```bash
git add docs/05-ESTADO-GLOBAL.md docs/10-MEMORIA-CORTO-PLAZO.md docs/20-MEMORIA-ESPACIAL.md
git commit -m "docs(brain): CRM Bloque 1 (fundamentos) completado"
```

> **Despliegue de reglas a producción**: SOLO tras `test:rules` verde + OK explícito de Daniel (merge a `main` dispara `firebase-deploy.yml`). Las reglas nuevas son aditivas (colecciones nuevas) → no afectan el sitio actual.

---

## Self-Review (cobertura vs spec)
- ✅ Roles (owner/admin/vendedora) — Tarea 1 + helpers Tarea 2.
- ✅ Modelo `clientes` + permisos scoped/append-only — Tareas 3-4.
- ✅ `config` (fecha de corte) + `solicitudesCorreccion` — Tarea 5.
- ✅ Validación de campos (clienteValido/movimientoValido) — Tarea 2, probada en 3-5.
- ⏭️ **Fuera de este bloque** (siguientes): Cloud Function de saldo (Bloque 2), UI (Bloques 3-4), migración (Bloque 5), reportes (Bloque 6).
- ⚠️ Dependencia: el harness de tests necesita Java (CI o local) — ver Prerrequisito.
