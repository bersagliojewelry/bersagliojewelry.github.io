# 🌫️ 32 — LECCIONES CARGA / RENDER / CACHÉ WEB (hija de `30-LECCIONES`)

> **Nodo neuronal: Memoria Procedimental — sub-lóbulo Carga/Render/Caché del sitio público.**
> Hija de `docs/30-LECCIONES.md` (§G.5 sharding por saturación de chars). Se consulta on-demand
> ante el **Trigger de Experiencia (`CLAUDE.md §G.2`)** ANTES de tocar la carga fluida del sitio,
> LQIP/blur-up, placeholders de imagen, View Transitions, caché SWR de Firestore o `reveal.js`.
> La madre `30` deja un **stub de 1 línea por cada L-NN** aquí movida (para que `[[L-NN]]` siga
> resolviendo en `30`, donde el kernel lee las definiciones, L-31/M-06); el DETALLE vive aquí, salvo
> el de las **migradas al maestro** (F2 lote 11: `L-45/46/47/49/50/51` · lote 12: `L-52/53/57/61`), que dejan su stub aquí.
>
> **Mantenimiento (Reflejo de Frescura §G.4)**: nuevas lecciones de carga/render/caché web se
> escriben aquí, dejando su stub `### L-NN: <título> → 32` en `30`. Lecciones del sprint §100-§113.

---

### L-61: Los artefactos del SSG viven SOLO en `dist/` — verifícalos con `vite preview`, NO con el dev server
⇒ **Migrada al maestro** (F2 lote 12): [[BERS:L-61]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).

### L-53: Firebase Storage SIN `cacheControl` → servido `private, max-age=0` = re-fetch por visita (ADR §112)
⇒ **Migrada al maestro** (F2 lote 12): [[BERS:L-53]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).

### L-52: "Instante + fresco" = SWR NATIVO de la plataforma (Firestore `persistentLocalCache`) + diff-gate, NO un SWR a mano (ADR §108)
⇒ **Migrada al maestro** (F2 lote 12): [[BERS:L-52]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).

### L-51: MPA "app-like" — empieza por `@view-transition` cross-document (barato/nativo), no por el router falso-SPA (caro) (ADR §107)
⇒ **Migrada al maestro** (F2 lote 11): [[BERS:L-51]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).

### L-50: Un placeholder de imagen solo MEJORA si PRECEDE a la imagen — en MPA estático el LQIP llega con el getDoc y SUMA un 3er estado (ADR §106)
⇒ **Migrada al maestro** (F2 lote 11): [[BERS:L-50]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).

### L-49: "Imágenes que cambian de zoom al cargar" rara vez es resize — mídelo; suele ser la animación de ENTRADA replay en recarga (ADR §105)
⇒ **Migrada al maestro** (F2 lote 11): [[BERS:L-49]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).

### L-47: LQIP "blur-up" del CMS — doble fondo CSS + campo compañero + safeLqip (ADR §104)
⇒ **Migrada al maestro** (F2 lote 11): [[BERS:L-47]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).

### L-46: Placeholder de CARGA = invisible (neutro casi-blanco), NUNCA un color saturado (ADR §102)
⇒ **Migrada al maestro** (F2 lote 11): [[BERS:L-46]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).

### L-45: Cero-demo → cazar los fallbacks horneados en CSS (`background:url`), no solo defaults/Firestore; verificar en navegador REAL (ADR §100)
⇒ **Migrada al maestro** (F2 lote 11): [[BERS:L-45]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).

### L-57: Admin MPA "fluido" — mostrar el shell de inmediato; el `body display:none` hasta requireAuth cruza la VT a un body OCULTO=blanco (ADR §115)
⇒ **Migrada al maestro** (F2 lote 12): [[BERS:L-57]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).

### L-54: Gate empírico de checkout web — contrato de datos VIVO ≠ SSG · Wompi exige redirect HTTPS · prod-Firestore por LAN-IP (ADR §147)
**Disparador**: ANTES de un gate live de cobro web (Wompi) o de tocar elegibilidad/disponibilidad de pieza en el front público. **Lección (§147, gate live Wompi F2)**:
1. **Contrato de datos VIVO ≠ SSG (raíz del bug `wompiEligible`)**: el carrito/grilla/ficha leen Firestore **EN VIVO** (`js/core/data.js`→`onPiecesChange` = `{id,...d.data()}`, crudo); el campo `available` lo deriva **SOLO** el SSG (`scripts/generate-pieces.mjs`, `available:orderable`) en `catalogo.json`. Un check del front que mida `piece.available===true` da `false`/undefined con datos vivos → la feature "no aparece". **Mide por `cantidad`/`stockType` (`derivarEstado`/`esDisponible` de `inventario-model.js`)**, presentes en AMBAS fuentes; el server re-valida. (Sospecha: la UX de "agotado" de la ficha sufre el MISMO gap → TODO-56.)
2. **Bug invisible a tests + SSG → solo lo caza un gate EMPÍRICO**: los unit tests construyen docs con `cantidad`; el SSG genera `available`. El desajuste de contrato entre fuente-de-prueba y fuente-real solo aflora con navegador real + datos vivos.
3. **Wompi exige `redirect-url` HTTPS**: el Widget `checkout.wompi.co` → **403 CloudFront/WAF** si el redirect es `http://` (localhost/IP-privada); prod (Pages=https) OK → todo gate web corre en **preview channel https**, NO `http://localhost`. La firma de integridad NO incluye el redirect-url (sin `expiration_time`) → se puede cambiar el redirect sin re-firmar.
4. **Receta prod-realista en dev**: el front conecta al **emulador** si el hostname es `localhost`/`127.0.0.1` (`firebase-config.js`). Para que hable con **PROD Firestore** (necesario: las CFs viven en prod), abrir el dev por la **IP de red LAN** (`192.168.x.x:port`, Vite `--host`) → `isDev=false`. App Check no bloquea (`invoker:public` + enforce diferido). Verificar el backend con Firebase MCP (pedido `pagado` + `webhookEvents/{txId}` + logs). **Limpiar prod después** (restaurar pieza + anular pedido de prueba; el reaper NO restaura un APPROVED). Endpoint sin llave: **401 = existe (falta auth), 404 = mal endpoint**.
