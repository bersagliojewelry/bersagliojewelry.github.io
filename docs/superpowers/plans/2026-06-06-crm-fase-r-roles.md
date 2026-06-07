# CRM Fase R (Roles) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convertir a la vendedora de *usuario con login* a *entidad de datos que gestiona Kary*; dejar a Kary (admin) + Daniel (owner) como únicos accesos del CRM.

**Architecture:** Nueva colección `vendedoras/{id}`; el cliente referencia `vendedoraId` (id de doc, no uid de Auth). Se elimina la app de vendedora, el rol `vendedora` y el flujo `solicitudesCorreccion`. Reglas: `clientes`/`movimientos`/`vendedoras` pasan a **admin/owner only**. Sin cambios al cálculo de saldo (Cloud Function `recalcSaldoCliente` intacta).

**Tech Stack:** HTML/CSS/JS vanilla (Vite, auto-discovery de `.html`) + Firebase (Auth/Firestore/Functions) + `@firebase/rules-unit-testing` (`node:test`, emulador).

**Base:** spec `docs/superpowers/specs/2026-06-06-crm-restructure-kary-y-movimientos-design.md`. NO incluye la Fase M (fecha real + edición con historial) — eso es un plan aparte.

**Doctrinas:** TDD para reglas (emulador); commits frecuentes; `git add` específico + footer `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`; rama activa; deploy de reglas/functions = MANUAL (L-22). En PowerShell usar `$env:VAR='x'; cmd`.

---

## File Structure

| Archivo | Responsabilidad | Acción |
|---|---|---|
| `firestore.rules` | RBAC server-side | Refactor: vendedoras coll + CRM admin-only; quitar isVendedora/solicitudes |
| `tests/firestore-rules.test.mjs` | Tests de reglas (emulador) | Refactor: seed + tests CRM |
| `js/crm-service.js` | Data layer del CRM | Refactor: API vendedoras + vendedoraId; quitar solicitudes/scope |
| `admin-config.html` + `js/admin/config.js` | Configuración (Kary) | Add: sección "Vendedoras" (CRUD) |
| `js/admin/cuentas.js` + `admin-cuentas.html` | Panel de cuentas | Refactor: dropdown desde vendedoras; quitar bandeja solicitudes |
| `js/admin/cuenta.js` | Ficha de cliente | Refactor: dropdown/vendedoraId |
| `js/auth.js` | Auth/roles | Refactor: quitar `requireAuthExact` + comentario vendedora |
| `js/admin/login.js` | Redirect por rol | Refactor: `landingFor` → siempre `admin.html` |
| `functions/index.js` | Cloud Functions (gestión usuarios) | Refactor: roles `admin`/`editor` (sin vendedora) |
| `vendedora.html`, `vendedora-cliente.html`, `js/vendedora/*` | App de vendedora | **BORRAR** |

---

## Task 1: Reglas Firestore + tests (TDD con emulador)

**Files:**
- Modify: `tests/firestore-rules.test.mjs` (seed líneas ~46-58; bloque CRM tests ~117-300)
- Modify: `firestore.rules`

- [ ] **Step 1: Reescribir el seed CRM del test**

En `tests/firestore-rules.test.mjs`, dentro de `withSecurityRulesDisabled`, reemplazar el bloque CRM del seed (las líneas que crean `users/ownerUid`, `users/vendUid`, `users/vend2Uid`, `clientes/cliV`, su movimiento, `clientes/cliDirecto`, `config/*`, `solicitudesCorreccion/s1`, `pendientes/p1`) por:

```javascript
        // ─── CRM Fase R: vendedoras (entidad), cliente (vendedoraId), config, pendientes ──
        await setDoc(doc(db, 'users/ownerUid'), { role: 'owner' });
        await setDoc(doc(db, 'users/vendUid'),  { role: 'vendedora' }); // rol RESIDUAL: debe quedar SIN acceso al CRM
        await setDoc(doc(db, 'vendedoras/vendA'), { nombre: 'Vendedora A', activa: true });
        await setDoc(doc(db, 'clientes/cliV'), { nombre: 'Cliente V', vendedoraId: 'vendA', saldoActual: 0 });
        await setDoc(doc(db, 'clientes/cliV/movimientos/m1'), { tipo: 'factura', monto: 100000, registradoPor: 'adminUid' });
        await setDoc(doc(db, 'config/status'),  { ok: true });
        await setDoc(doc(db, 'config/negocio'), { fechaCorteMigracion: '2025-12-31' });
        await setDoc(doc(db, 'solicitudesCorreccion/s1'), { clienteId: 'cliV', estado: 'pendiente' }); // legacy: debe quedar INACCESIBLE
        await setDoc(doc(db, 'pendientes/p1'), { titulo: 'Definir corte', categoria: 'definir-kary', estado: 'pendiente' });
```

- [ ] **Step 2: Reemplazar TODO el bloque de tests CRM**

Borrar desde el comentario `// ─── CRM Bloque 1: clientes ...` hasta el final del archivo TODO lo de CRM (los tests `CRM clientes`, `CRM mov`, `CRM config`, `CRM solicitud`, `HARD ...`, `SALDO ...`, `PEND ...` — todos los que ejercitan el rol `vendedora` o `solicitudesCorreccion`). Pegar en su lugar (antes del cierre del archivo):

```javascript
// ─── CRM Fase R: vendedoras = entidad de datos (solo admin/owner) ─────────────
test('CRM vend · admin lee y crea vendedoras', async () => {
    await assertSucceeds(getDoc(doc(asUser('adminUid'), 'vendedoras/vendA')));
    await assertSucceeds(setDoc(doc(asUser('adminUid'), 'vendedoras/vNueva'), { nombre: 'Tania', activa: true }));
});
test('CRM vend · owner gestiona vendedoras', async () => {
    await assertSucceeds(setDoc(doc(asUser('ownerUid'), 'vendedoras/vO'), { nombre: 'Daniela', activa: true }));
});
test('CRM vend · sin nombre es rechazada', async () => {
    await assertFails(setDoc(doc(asUser('adminUid'), 'vendedoras/vBad'), { activa: true }));
});
test('CRM vend · editor y sin-rol NO acceden', async () => {
    await assertFails(getDoc(doc(asUser('editorUid'), 'vendedoras/vendA')));
    await assertFails(setDoc(doc(asUser('editorUid'), 'vendedoras/vE'), { nombre: 'X', activa: true }));
});

// ─── CRM Fase R: clientes y movimientos = SOLO admin/owner ───────────────────
test('CRM clientes · admin lee/crea/edita', async () => {
    await assertSucceeds(getDoc(doc(asUser('adminUid'), 'clientes/cliV')));
    await assertSucceeds(setDoc(doc(asUser('adminUid'), 'clientes/cliNuevo'), { nombre: 'Nueva', vendedoraId: 'vendA' }));
    await assertSucceeds(setDoc(doc(asUser('adminUid'), 'clientes/cliV'), { nombre: 'Editado' }, { merge: true }));
});
test('CRM clientes · owner también lee', async () => {
    await assertSucceeds(getDoc(doc(asUser('ownerUid'), 'clientes/cliV')));
});
test('CRM clientes · vendedora (rol residual) NO accede', async () => {
    await assertFails(getDoc(doc(asUser('vendUid'), 'clientes/cliV')));
    await assertFails(setDoc(doc(asUser('vendUid'), 'clientes/cliZ'), { nombre: 'Z', vendedoraId: 'vendA' }));
});
test('CRM clientes · editor y sin-rol NO acceden', async () => {
    await assertFails(getDoc(doc(asUser('editorUid'), 'clientes/cliV')));
    await assertFails(getDoc(doc(asUser('customerUid'), 'clientes/cliV')));
});
test('CRM clientes · saldoActual NO se puede sembrar (hasOnly)', async () => {
    await assertFails(setDoc(doc(asUser('adminUid'), 'clientes/cliHack'), { nombre: 'H', saldoActual: 999 }));
});
test('CRM mov · admin crea abono y apertura(neg); tipo inválido rechazado', async () => {
    await assertSucceeds(setDoc(doc(asUser('adminUid'), 'clientes/cliV/movimientos/mA'), { tipo: 'abono', monto: 5000, registradoPor: 'adminUid', anulado: false }));
    await assertSucceeds(setDoc(doc(asUser('adminUid'), 'clientes/cliV/movimientos/mAp'), { tipo: 'apertura', monto: -1000, registradoPor: 'adminUid' }));
    await assertFails(setDoc(doc(asUser('adminUid'), 'clientes/cliV/movimientos/mBad'), { tipo: 'regalo', monto: 1, registradoPor: 'adminUid' }));
});
test('CRM mov · vendedora(residual) y editor NO crean', async () => {
    await assertFails(setDoc(doc(asUser('vendUid'), 'clientes/cliV/movimientos/mV'), { tipo: 'abono', monto: 1, registradoPor: 'vendUid' }));
    await assertFails(setDoc(doc(asUser('editorUid'), 'clientes/cliV/movimientos/mE'), { tipo: 'abono', monto: 1, registradoPor: 'editorUid' }));
});

// ─── CRM Fase R: solicitudesCorreccion ELIMINADA (sin regla = denegado a todos) ─
test('CRM solicitudes · colección eliminada: ni admin accede', async () => {
    await assertFails(getDoc(doc(asUser('adminUid'), 'solicitudesCorreccion/s1')));
    await assertFails(setDoc(doc(asUser('adminUid'), 'solicitudesCorreccion/s2'), { x: 1 }));
});

// ─── CRM Fase R: config + pendientes ─────────────────────────────────────────
test('CRM config · admin lee/escribe negocio; status público; editor NO lee negocio', async () => {
    await assertSucceeds(getDoc(doc(asUser('adminUid'), 'config/negocio')));
    await assertSucceeds(setDoc(doc(asUser('adminUid'), 'config/negocio'), { diasPlazo: 30 }, { merge: true }));
    await assertSucceeds(getDoc(doc(anon(), 'config/status')));
    await assertFails(getDoc(doc(asUser('editorUid'), 'config/negocio')));
});
test('PEND · admin sí; editor no', async () => {
    await assertSucceeds(getDoc(doc(asUser('adminUid'), 'pendientes/p1')));
    await assertFails(getDoc(doc(asUser('editorUid'), 'pendientes/p1')));
});
```

- [ ] **Step 3: Correr los tests → DEBEN FALLAR (las reglas viejas aún permiten vendedora)**

Run: `npm run test:rules`
Expected: FAIL — varios tests nuevos rojos (p.ej. "vendedora (rol residual) NO accede" falla porque las reglas viejas dejan a la vendedora leer su cliente; "solicitudes · colección eliminada" falla porque la regla vieja aún existe; "vendedoras" falla porque no hay match block).

- [ ] **Step 4: Reescribir las reglas CRM en `firestore.rules`**

(a) **Borrar** la función `isVendedora()` (líneas ~28-30) y la función `clienteOwnerUid(clienteId)` (líneas ~31-35).

(b) En `clienteValido()`, cambiar `vendedoraUid` → `vendedoraId` (en el `hasOnly` y en el chequeo de tipo). Queda:

```
    function clienteValido() {
      let d = request.resource.data;
      return nonEmptyStr(d.nombre)
          && d.keys().hasOnly(['nombre', 'telefono', 'whatsapp', 'cumpleanos', 'notas',
                               'vendedoraId', 'origen', 'activo',
                               'createdAt', 'createdBy', 'updatedAt'])
          && (!('vendedoraId' in d) || d.vendedoraId is string)
          && (!('telefono' in d)    || d.telefono is string);
    }
```

(c) **Añadir** un validador de vendedora (junto a los otros validadores CRM):

```
    function vendedoraValida() {
      let d = request.resource.data;
      return nonEmptyStr(d.nombre)
          && d.keys().hasOnly(['nombre', 'activa', 'createdAt', 'createdBy', 'updatedAt']);
    }
```

(d) Reemplazar el bloque `match /clientes/{clienteId} { ... }` (incluida la subcolección movimientos) por:

```
    // ─── CRM: clientes y movimientos (cuentas por cobrar) — SOLO admin/owner ─────
    match /clientes/{clienteId} {
      allow read:   if isAdmin();
      allow create: if isAdmin() && clienteValido();
      allow update: if isAdmin();
      allow delete: if isAdmin();

      match /movimientos/{movId} {
        allow read:   if isAdmin();
        allow create: if isAdmin() && movimientoValido();
        allow update, delete: if isAdmin();
      }
    }

    // ─── CRM: vendedoras (entidad de datos que gestiona Kary) ────────────────────
    match /vendedoras/{vendedoraId} {
      allow read:           if isAdmin();
      allow create, update: if isAdmin() && vendedoraValida();
      allow delete:         if isAdmin();
    }
```

(e) **Borrar** todo el bloque `match /solicitudesCorreccion/{id} { ... }` (líneas ~172-186).

(f) En `match /config/{docId}`, quitar `isVendedora()` del read:

```
      allow read:  if docId == 'status' || isAdmin();
```

- [ ] **Step 5: Correr los tests → DEBEN PASAR**

Run: `npm run test:rules`
Expected: PASS — todos verdes. Si algún test viejo quedó sin borrar y referencia `vendedoraUid`/vendedora-permitida, eliminarlo (ya no aplica).

- [ ] **Step 6: Commit**

```bash
git add firestore.rules tests/firestore-rules.test.mjs
git commit -m "feat(crm): reglas Fase R — vendedoras coll + CRM admin-only; quita rol vendedora y solicitudes"
```

---

## Task 2: Data layer (`js/crm-service.js`)

**Files:**
- Modify: `js/crm-service.js`

- [ ] **Step 1: `createCliente` usa `vendedoraId`**

En `createCliente`, cambiar la línea del spread de vendedora:

```javascript
        ...(data.vendedoraId ? { vendedoraId: data.vendedoraId } : {}),
```

- [ ] **Step 2: Borrar `onClientesDeVendedora`** (toda la función, ~líneas 80-90) — la app de vendedora se elimina.

- [ ] **Step 3: Borrar el flujo de solicitudes** — eliminar `onSolicitudesChange`, `resolverSolicitud` y `crearSolicitud` (todo el bloque "Solicitudes de corrección", ~líneas 128-156).

- [ ] **Step 4: Reemplazar `fetchVendedoras` (que leía `users`) por la API de la colección `vendedoras`**

Sustituir el bloque "Vendedoras (usuarios con rol vendedora)" por:

```javascript
// ─── Vendedoras (entidad de datos; las gestiona Kary) ─────────────────────────
export function onVendedorasChange(cb) {
    const q = query(collection(firestoreDb, 'vendedoras'), limit(MAX));
    return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
}
export async function fetchVendedoras() {
    const snap = await getDocs(query(collection(firestoreDb, 'vendedoras'), limit(MAX)));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
export async function createVendedora({ nombre, createdBy }) {
    const payload = {
        nombre: (nombre || '').trim(),
        activa: true,
        createdAt: serverTimestamp(),
        ...(createdBy ? { createdBy } : {}),
    };
    const ref = await addDoc(collection(firestoreDb, 'vendedoras'), payload);
    return { id: ref.id, ...payload };
}
export async function updateVendedora(id, patch) {
    await updateDoc(doc(firestoreDb, 'vendedoras', id), { ...patch, updatedAt: serverTimestamp() });
}
```

- [ ] **Step 5: `carteraPorVendedora` agrupa por `vendedoraId`**

En `carteraPorVendedora`, cambiar la línea de la key:

```javascript
        const key = c.vendedoraId || '__kary__';
```

- [ ] **Step 6: Verificar build**

Run: `npm run build`
Expected: exit 0 (verde). Si Vite reporta un símbolo importado que ya no existe, es porque un consumidor aún importa `onClientesDeVendedora`/`crearSolicitud`/etc. — se arregla en Tasks 3-5; por ahora basta que `crm-service.js` no tenga errores de sintaxis (el build puede seguir verde porque los consumidores se editan a continuación). Si el build falla por un import roto en `cuentas.js`/`cuenta.js`, continuar con Task 3/4 y volver a construir.

- [ ] **Step 7: Commit**

```bash
git add js/crm-service.js
git commit -m "feat(crm): data layer Fase R — API vendedoras + vendedoraId; quita solicitudes y scope de vendedora"
```

---

## Task 3: Gestión de vendedoras en Configuración (UI nueva)

**Files:**
- Modify: `admin-config.html` (añadir sección)
- Modify: `js/admin/config.js`

- [ ] **Step 1: Añadir la sección "Vendedoras" en `admin-config.html`**

Justo ANTES de la sección de Pendientes (`<!-- Pendientes (tablero ...`), insertar:

```html
            <!-- Vendedoras (entidad que gestiona Kary) -->
            <div class="adm-section">
                <div class="adm-section-head"><h2>Vendedoras</h2></div>
                <div class="adm-section-body">
                    <p style="color:var(--adm-muted);font-size:13px;margin:0 0 14px;">
                        Las vendedoras no entran a la plataforma. Aquí las gestionas para asignarles clientes y ver su cartera.
                    </p>
                    <div id="vendedoras-list"></div>
                    <div class="adm-empty" id="vendedoras-empty" hidden><p>Aún no hay vendedoras.</p></div>
                    <form id="vendedora-form" style="display:flex;gap:10px;flex-wrap:wrap;margin-top:16px;">
                        <input type="text" id="vend-nombre" class="adm-input" placeholder="Nombre de la vendedora…" style="flex:1;min-width:200px;" maxlength="80">
                        <button type="submit" class="adm-btn adm-btn--ghost">Agregar</button>
                    </form>
                </div>
            </div>
```

- [ ] **Step 2: Importar la API de vendedoras en `js/admin/config.js`**

Cambiar el import de `../crm-service.js` para añadir las funciones:

```javascript
import {
    getConfig, setConfig,
    onPendientesChange, addPendiente, setPendienteEstado, deletePendiente,
    onVendedorasChange, createVendedora, updateVendedora,
} from '../crm-service.js';
```

Y añadir el import de `currentUser` (para `createdBy`) arriba:

```javascript
import { currentUser } from '../auth.js';
```

- [ ] **Step 3: Añadir render + wiring de vendedoras en `js/admin/config.js`**

Añadir estas funciones (p.ej. después de `wirePendientes`):

```javascript
function renderVendedoras(list) {
    const wrap = document.getElementById('vendedoras-list');
    const empty = document.getElementById('vendedoras-empty');
    if (!list.length) { wrap.innerHTML = ''; empty.hidden = false; return; }
    empty.hidden = true;
    const orden = list.slice().sort((a, b) => (a.nombre || '').localeCompare(b.nombre || '', 'es'));
    wrap.innerHTML = orden.map((v) => {
        const inactiva = v.activa === false;
        return `
            <div class="adm-pend-item${inactiva ? ' adm-pend-item--done' : ''}">
                <div style="flex:1;min-width:0;">
                    <span class="adm-pend-titulo">${esc(v.nombre || 'Sin nombre')}</span>
                    ${inactiva ? '<span class="adm-pill adm-pill--gray">inactiva</span>' : ''}
                </div>
                <div style="display:flex;gap:6px;white-space:nowrap;">
                    <button class="adm-btn adm-btn--ghost adm-btn--sm" data-vend-toggle="${esc(v.id)}" data-activa="${inactiva ? 'true' : 'false'}">${inactiva ? 'Reactivar' : 'Desactivar'}</button>
                </div>
            </div>`;
    }).join('');
}

function wireVendedoras() {
    document.getElementById('vendedora-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const nombre = getVal('vend-nombre');
        if (!nombre) { admToast('Escribe el nombre.', 'danger'); return; }
        try {
            await createVendedora({ nombre, createdBy: currentUser()?.user?.uid });
            document.getElementById('vendedora-form').reset();
        } catch (err) { console.error('[config] createVendedora:', err); admToast('No se pudo agregar.', 'danger'); }
    });
    document.getElementById('vendedoras-list').addEventListener('click', async (e) => {
        const tg = e.target.closest('[data-vend-toggle]');
        if (!tg) return;
        const activa = tg.getAttribute('data-activa') === 'true';   // valor objetivo
        try { await updateVendedora(tg.getAttribute('data-vend-toggle'), { activa }); }
        catch (err) { console.error('[config] updateVendedora:', err); admToast('No se pudo actualizar.', 'danger'); }
    });
}
```

En `init()`, añadir (junto a `wirePendientes()` / `onPendientesChange`):

```javascript
    wireVendedoras();
    onVendedorasChange(renderVendedoras);
```

- [ ] **Step 4: Verificar build**

Run: `npm run build`
Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add admin-config.html js/admin/config.js
git commit -m "feat(crm): UI gestión de vendedoras en Configuración (crear/desactivar)"
```

---

## Task 4: Panel de cuentas — dropdown desde vendedoras + quitar bandeja de solicitudes

**Files:**
- Modify: `js/admin/cuentas.js`
- Modify: `admin-cuentas.html`
- Modify: `js/admin/cuenta.js`

- [ ] **Step 1: `js/admin/cuentas.js` — imports**

Reemplazar el import de `../crm-service.js` por (sin `onSolicitudesChange`, `resolverSolicitud`, `anularMovimiento`):

```javascript
import {
    onClientesChange, createCliente, fetchVendedoras,
    fmtCOP, carteraTotals, carteraPorVendedora, cumpleanosDelMes,
} from '../crm-service.js';
```

Y reemplazar el import de `./shared.js` por (sin `admConfirm`, que solo usaba la bandeja):

```javascript
import { requireAuth, initSidebar, admToast, esc } from './shared.js';
```

Quitar el import `import { currentUser } from '../auth.js';` (solo lo usaba la bandeja).

- [ ] **Step 2: `js/admin/cuentas.js` — quitar estado y helpers de solicitudes**

- Borrar `let _solicitudes = [];`.
- Borrar la función `clienteNombre(id)` (solo la usaba la bandeja).
- En el comentario del `Map`, queda `id -> nombre`: `const _vendedoras = new Map();   // vendedoraId -> nombre`.
- Cambiar `nombreVendedora(uid)` para que el parámetro sea el id (el cuerpo no cambia, pero renómbralo a `id` por claridad):

```javascript
function nombreVendedora(id) {
    if (!id) return 'Directo de Kary';
    return _vendedoras.get(id) || 'Vendedora';
}
```

- [ ] **Step 3: `js/admin/cuentas.js` — usar `vendedoraId` y borrar render/wiring de solicitudes**

- En `renderClientes`, cambiar `nombreVendedora(c.vendedoraUid)` → `nombreVendedora(c.vendedoraId)`.
- En `renderCumple`, cambiar `nombreVendedora(c.vendedoraUid)` → `nombreVendedora(c.vendedoraId)`.
- Borrar entera la función `renderSolicitudes()`.
- Borrar entera la función `wireSolicitudes()`.
- En `render()`, borrar la línea `renderSolicitudes();`.
- En `populateVendedoraSelect`, el bucle ya itera `_vendedoras` (id→nombre): queda igual pero `opt.value = id`:

```javascript
function populateVendedoraSelect() {
    const sel = document.getElementById('cli-vendedora');
    if (!sel) return;
    for (const [id, nombre] of _vendedoras) {
        const opt = document.createElement('option');
        opt.value = id; opt.textContent = nombre;
        sel.appendChild(opt);
    }
}
```

- [ ] **Step 4: `js/admin/cuentas.js` — `createCliente` con `vendedoraId` y `init` desde colección**

En el submit del form de nuevo cliente, cambiar:

```javascript
                vendedoraId: document.getElementById('cli-vendedora').value || null,
```

En `init()`, cambiar la carga de vendedoras y quitar wiring/listener de solicitudes:

```javascript
    try {
        (await fetchVendedoras())
            .filter(v => v.activa !== false)
            .forEach(v => _vendedoras.set(v.id, v.nombre || 'Vendedora'));
    } catch (err) {
        console.warn('[cuentas] fetchVendedoras:', err);
    }
    populateVendedoraSelect();

    wireModal();
    wireSearch();
    wireRows();

    onClientesChange(list => { _clientes = list; render(); });
```

(Es decir: borrar `wireSolicitudes();` y `onSolicitudesChange(...)`.)

- [ ] **Step 5: `admin-cuentas.html` — quitar la bandeja de solicitudes + arreglar typo**

- Borrar el bloque completo `<!-- Solicitudes de corrección pendientes ... -->` … `</div>` (la `div#solic-section`).
- En la sección "Cartera por vendedora", corregir el typo de cierres de etiqueta: cambiar `<th>Vendedora<\th><th>Clientes<\th>` por `<th>Vendedora</th><th>Clientes</th>`.

- [ ] **Step 6: `js/admin/cuenta.js` — vendedoraId en ficha y editar**

- En `renderHeader`, cambiar `nombreVendedora(cli.vendedoraUid)` → `nombreVendedora(cli.vendedoraId)`.
- Cambiar `nombreVendedora(uid)` → parámetro `id` (cuerpo igual).
- En `wireEditar`, poblar el select desde `_vendedoras` (id→nombre) — ya lo hace; y al abrir, setear `ed-vendedora.value = c.vendedoraId || ''`:

```javascript
        document.getElementById('ed-vendedora').value = c.vendedoraId || '';
```

- En el submit de editar, cambiar a `vendedoraId`:

```javascript
                vendedoraId: document.getElementById('ed-vendedora').value || null,
```

- En `init()`, cargar vendedoras desde la colección:

```javascript
    try {
        (await fetchVendedoras())
            .filter(v => v.activa !== false)
            .forEach(v => _vendedoras.set(v.id, v.nombre || 'Vendedora'));
    } catch (err) {
        console.warn('[cuenta] fetchVendedoras:', err);
    }
```

(El `wireEditar` itera `_vendedoras` con `[id, nombre]` → `o.value = id`.)

- [ ] **Step 7: Verificar build**

Run: `npm run build`
Expected: exit 0, sin imports rotos.

- [ ] **Step 8: Commit**

```bash
git add js/admin/cuentas.js js/admin/cuenta.js admin-cuentas.html
git commit -m "feat(crm): panel usa vendedoras coll + vendedoraId; quita bandeja de solicitudes"
```

---

## Task 5: Quitar la vendedora como USUARIO (auth/login/functions + borrar app)

**Files:**
- Modify: `js/auth.js`
- Modify: `js/admin/login.js`
- Modify: `functions/index.js`
- Delete: `vendedora.html`, `vendedora-cliente.html`, `js/vendedora/cuentas.js`, `js/vendedora/ficha.js`, `js/vendedora/ui.js`

- [ ] **Step 1: Confirmar que `requireAuthExact` solo lo usa la app de vendedora**

Run (Grep tool, no shell): buscar `requireAuthExact` en `js/`.
Expected: solo aparece en `js/auth.js` (definición) y en `js/vendedora/*` (que se borran). Si aparece en otro lado, NO borrarla y avisar.

- [ ] **Step 2: `js/auth.js` — borrar `requireAuthExact` + limpiar comentario**

- Borrar toda la función `requireAuthExact(allowedRoles)` y su bloque de comentario (desde `/** Auth guard por MEMBRESÍA EXACTA ...` hasta el cierre de la función).
- En `signIn`, reemplazar el comentario que menciona vendedora (líneas ~93-95) por uno sin vendedora:

```javascript
        // Update last login — best-effort: las reglas de `users` solo dejan que
        // owner/admin actualicen docs de usuario; si el rol no puede, NO debe
        // tumbar el login (es telemetría).
```

- [ ] **Step 3: `js/admin/login.js` — `landingFor` siempre a `admin.html`**

Reemplazar la función `landingFor` y sus 2 call sites por redirecciones directas. Borrar:

```javascript
function landingFor(role) {
    return role === 'vendedora' ? 'vendedora.html' : 'admin.html';
}
```

Y en los dos `window.location.replace(landingFor(...))` (en `init` y en `handleLogin`) usar:

```javascript
        window.location.replace('admin.html');
```

- [ ] **Step 4: `functions/index.js` — roles sin vendedora**

- Línea ~21: `const ROLE_LEVEL = { owner: 3, admin: 2, editor: 1 };` (quitar `vendedora: 1`).
- En `createUser` (~línea 48), cambiar:

```javascript
    if (!['admin', 'editor'].includes(role)) {
        throw new HttpsError('invalid-argument', 'Rol inválido. Usa "admin" o "editor".');
    }
```

- En `updateUserRole` (~línea 81), cambiar:

```javascript
    if (!['admin', 'editor'].includes(newRole)) {
        throw new HttpsError('invalid-argument', 'Rol inválido.');
    }
```

- [ ] **Step 5: Borrar la app de vendedora**

```bash
git rm vendedora.html vendedora-cliente.html js/vendedora/cuentas.js js/vendedora/ficha.js js/vendedora/ui.js
```

(Si `js/vendedora/` queda vacío, git lo elimina solo.)

- [ ] **Step 6: Verificar build + sintaxis de functions**

Run: `npm run build`
Expected: exit 0 (vite ya no toma `vendedora*.html` como entry; auto-discovery).
Run: `node --check functions/index.js`
Expected: sin salida (OK).

- [ ] **Step 7: Commit**

```bash
git add js/auth.js js/admin/login.js functions/index.js
git commit -m "feat(crm): elimina la vendedora como usuario (auth/login/functions) + borra app de vendedora"
```

---

## Task 6: Verificación integral + deploy a producción

**Files:** (ninguno nuevo — verificación y despliegue)

- [ ] **Step 1: Suite de reglas verde**

Run: `npm run test:rules`
Expected: PASS (todos).

- [ ] **Step 2: Tests de saldo (no deben verse afectados)**

Run: `npm run test:saldo`
Expected: 12/12 PASS.
Run: `npm run test:saldo:integration`
Expected: 5/5 PASS (la CF `recalcSaldoCliente` no se tocó).

- [ ] **Step 3: Build final**

Run: `npm run build`
Expected: exit 0; confirmar que NO existen `dist/vendedora.html` ni `dist/vendedora-cliente.html`.

- [ ] **Step 4: Grep de regresión — que no quede `vendedoraUid` ni `requireAuthExact` ni `solicitud` en el código vivo**

Run (Grep tool) sobre `js/` y raíz `.html`: `vendedoraUid|requireAuthExact|onClientesDeVendedora|crearSolicitud|solicitudesCorreccion`.
Expected: cero resultados en código vivo (pueden quedar referencias en `docs/` y en `tests` solo como seed legacy intencional). Si aparece algo en `js/`, corregir antes de desplegar.

- [ ] **Step 5: Deploy de reglas + functions (MANUAL — L-22)**

Run: `firebase deploy --only firestore:rules,functions --project bersaglio-jewelry --force`
Expected: "Deploy complete!"; functions = 6 actualizadas (createUser/updateUserRole con roles nuevos). Reglas publicadas.

- [ ] **Step 6: Deploy del sitio (merge a `main` o push según flujo de Daniel)**

El sitio (panel admin sin vendedora) va por CI al pushear a `main`. Coordinar con Daniel: merge `Desarrollo → main` (PR) → GitHub Actions reconstruye Pages + Hosting. (El sitio público no cambió; el panel sí.)

- [ ] **Step 7: Smoke test en prod (datos reales intactos)**

- `firebase functions:list --project bersaglio-jewelry` → 6 functions vivas.
- En el panel (logueado como Kary/owner): Configuración → crear una vendedora de prueba; Cuentas → crear/editar un cliente asignándole esa vendedora; ver "Cartera por vendedora" agrupando bien; borrar la vendedora de prueba.
- Confirmar que los **344 clientes** siguen con su saldo (no se tocaron datos).

- [ ] **Step 8: Alimentar el cerebro (cierre, §G.4)**

- ADR §49 en `docs/99-HISTORIAL-ADR.md` + fila en `docs/00-INDICE.md`.
- Actualizar `docs/05-ESTADO-GLOBAL.md` (CRM Fase R desplegada; vendedoras = entidad).
- Actualizar `docs/10-MEMORIA-CORTO-PLAZO.md` (foco → Fase M).
- `docs/20-MEMORIA-ESPACIAL.md`: quitar la app de vendedora; añadir colección `vendedoras` + sección Configuración.
- Lección si surge algo reutilizable. `npm run brain:check` SANO.

---

## Self-Review (cobertura del spec)

- **Roles: solo Kary/Daniel** → Tasks 1 (reglas admin-only), 5 (quitar rol/login/functions). ✅
- **Vendedora = entidad de datos** → Tasks 1 (coll + reglas), 2 (API), 3 (UI gestión). ✅
- **`vendedoraId` reemplaza `vendedoraUid`** → Tasks 1 (validador/seed), 2 (createCliente/cartera), 4 (UI). ✅
- **Eliminar `solicitudesCorreccion`** → Tasks 1 (reglas + tests), 2 (servicio), 4 (bandeja UI). ✅
- **Conservar saldo/CF, cartera por vendedora, cumpleaños, editabilidad** → no se tocan; Task 6 los verifica. ✅
- **Migración 344 sin daño** → no se reescriben datos (los 344 no tienen vendedora); Task 6 step 7 lo confirma. ✅
- **NO incluye Fase M** (fecha real + edición con historial) → plan aparte. ✅

> Nota: la Fase M añadirá `fecha` (real) + `historial` + validación en `movimientoValido()` y UI; este plan deja `movimientoValido()` intacto a propósito.
