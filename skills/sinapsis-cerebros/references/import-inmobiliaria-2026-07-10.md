# Payload de importación cars+bersaglio→inmobiliaria (sinapsis 2026-07-10) — LISTO PARA APLICAR

> Preparado por operador-cars (Fable 5). El harness bloquea writes cross-repo desde una sesión
> ajena → aplícalo TÚ (operador inmobiliaria) en 1 pega + `npm run brain:check` + commit en tu rama.
> Al terminar: marca la línea de inmobiliaria en `SKILL.md §4` como ✅ y borra este archivo.

## `docs/30-LECCIONES.md` — insertar tras el final de L-07 (antes del separador `---` de "## Guardarraíles de diseño")

```markdown
### L-08 — Reglas Firestore: leer un campo AUSENTE de `resource.data` LANZA (no es null) *(importada de cars — sinapsis 2026-07-10)*
**Disparador**: una regla con `resource.data.x == null` o que compara `_version` falla con `Property x is undefined` al tocar docs viejos/seed. **Causa**: en rules, acceder a una clave inexistente es un evaluation-error, NO `null` — y el `||` no rescata (el primer operando ya lanzó). **Fix**: guardar la PRESENCIA antes de leer: `!('x' in resource.data) || resource.data.x is T`, o `resource.data.get('x', default)`. En los tests de rules, sembrar también docs LEGACY sin el campo — los tests que siempre lo siembran esconden el bug (a cars le duró meses).

### L-09 — Upsert de ingestión: `merge:true` PISA los campos presentes y NO borra los ausentes *(importada de cars — sinapsis 2026-07-10; amplía L-04)*
**Disparador**: un trigger/función hace upsert de una entidad (contacto/solicitud) por clave de dedup. **Causa doble**: (a) `set(full, {merge:true})` sobrescribe los campos PRESENTES → un 2º evento del mismo sujeto pisa `createdAt`/campos ya editados por un humano (corrupción silenciosa); (b) para QUITAR una clave de un mapa, merge no basta — `deleteField()` o `update()` del campo completo ("lo borré y sigue ahí"). **Fix**: transacción: `tx.get(ref)` → si no existe `tx.set(full)`; si existe `tx.update({soloVolátiles})`; y el mark de idempotencia (`_ingestedAt`) DENTRO de la MISMA transacción — marcarlo en un update separado deja ventana de crash → duplicados en el reintento.

### L-10 — Un GET público linkeado por WhatsApp/email JAMÁS muta estado *(importada de cars — sinapsis 2026-07-10)*
**Disparador**: magic-links de confirmar/cancelar/unsubscribe en emails o WhatsApp. **Causa**: WhatsApp hace fetch del link al COMPONER el mensaje (vista previa); Outlook SafeLinks/antivirus igual → "el cliente confirmó sin abrir el link". **Fix**: GET = página intersticial con botón; SOLO el POST muta (`req.method === 'POST'`). De paso: escapar todo dato reflejado (XSS) + header CSP.

### L-11 — Cloud Functions gen2: tres gotchas de operación que se ven como bugs *(importadas de bersaglio — sinapsis 2026-07-10)*
**(a) Callable v2 devuelve 403 SIN ejecutarse** (cero logs): falta el invoker público — firebase-tools NO lo re-aplica en update → borrar y re-desplegar la function (bersaglio §115). **(b) `firebase functions:secrets:set` NO re-empaqueta `functions/.env`**: tras cambiar env-vars no-secretas, re-deploy COMPLETO de la function o sigue leyendo el `.env` viejo (bersaglio). **(c) "Desactivar" un usuario = deshabilitar la CUENTA de Auth** (`updateUser({disabled:true})` vía CF) — un campo `activo:false` en un doc NO es credencial: el token sigue vivo (bersaglio §66).

### L-12 — Dinero (arriendos/comisiones/pagos): método ANTES de construir *(sinapsis 2026-07-10)*
Cuando el portal maneje plata: (1) skill global `auditoria-financiera` (7 invariantes del dinero + 4 fases; nació del incidente bersaglio §181 — traslado duplicado de $5.6M por carrera de listeners); (2) checklist del dinero de `caza-bugs §2b` al tocar cualquier flujo; (3) regla madre: JAMÁS una decisión automática (modal/bloqueo/cálculo) sobre una foto incompleta de listeners — gate de fuentes-listas o agregado server-side en UNA transacción; deshacer netea TODAS las vistas del mismo peso; los formateadores jamás recortan un negativo a "$0".

```
