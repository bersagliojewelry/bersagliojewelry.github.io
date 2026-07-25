# ⚡ 10 — MEMORIA A CORTO PLAZO (WIP / Sprint activo)

> **Nodo: Memoria a Corto Plazo** (auto-carga con `CLAUDE.md` + `05`). Solo lo VIVO: foco, pendientes
> (TODO-NN = ledger único), bitácora efímera. Estado técnico → `05`.
> **Pizarra, no archivo**: al cerrar tarea → ADR en `99` + fila en `00`, lecciones a `30`, podar (GC §G.4).

---

## 🎯 Foco actual

> 🟣 **F-TESORERÍA (TODO-78) · B0-B4 + B5(D6·V1·V18·**V17**) ✅ EN PROD.** **V17 CERRADO** ✅ 25jul: CFs `registrarAbonoCartera`/`anularAbonoCartera` + cierre en REGLAS + verificado en vivo (login owner).
>
> **V17**: el abono en EFECTIVO escribe su pata en `movsCaja` en la MISMA tx → el arqueo espera el billete (antes cuadraba igual = robo enmascarable). TDD 16/16 · reglas 248/248. Premisas falsas de la spec, desvío y ancla del turno (L-85) → **spec §9**; cola del titular → **§8**.
>
> **SIGUE, en orden**: (1) **D9** (`cuentaId` → pata de tesorería; falta `abono_cartera` en `PATA_TIPOS`) · (2) microcopy + cuadre 3:30 en Salud → **B6**.
>
> **Protocolo por sesión**: `asesor-critico-honesto` + `caza-bugs` + `auditoria-financiera`; spec COMPLETA (§0.8>§0.7>§0.6>cuerpo, sin re-decidir; TDD en el MISMO commit). Modelo lo decide Daniel (`/model`): Opus → + `opus-interino-protocolo`, marca **`[OPUS-5]`**; Fable → `[FABLE-5]`. ⚠️ B2-B4 quedaron firmados `[OPUS-4.8]` por error → auditar por AMBOS (→ `05`).
>
> **🧭 Roadmap** (detalle → `05`): …F-IA-2 ✅ → **F-TESORERÍA (B5)** → F-COMPRAS → F-REPORTES → apartados → limpieza → rompimiento → lanzamiento. _MCP Firebase=prod · push+merge a main=Claude · consejo read-only · valida en Chrome._ `[[project_comercio_pagos]]`

---

## 📋 Pendientes abiertos (TODO-NN) — ledger único

| ID | Item | Estado | Bloqueo |
|---|---|---|---|
| TODO-03/04 | (baja) headers `99`→`## NN.` · anomalías 🔧 en `skills/` | 🔲 | baja |
| TODO-78 | **F-TESORERÍA** (SSoT spec `2026-07-18-f-tesoreria-DISENO.md`, prevalencia §0.8>§0.7>§0.6>cuerpo; legal Daniel → `42-LEGAL §7`). **B0-B5(D6·V1·V18·V17✅CERRADO) EN PROD · SIGUE: D9 → B6** (detalle → Foco). | 🟢 | D9 |
| TODO-07 | **Contenido real web**: reseñas Maps (Nosotros), Films, feed Redes (`home-media.js`). | 🔲 | cliente entrega datos |
| TODO-08 | **Hardening Fase 2**: Tier A ✅; pend. CSP/reglas/claims (Tier B/C) → `41-SEGURIDAD §1.5` | 🟡 | Tier B = emulador+deploy gated |
| TODO-09 | **Fase M** M0→M6 ✅ EN PROD (§78-§80); ACUERDOS R1-R5+A8 GATEADOS/inertes — encender=Daniel. Restan: M7·M2c·ASESOR/RBAC (19). | 🟡 | encender R6 |
| TODO-14 | **App Check: MONITOREO; Enforce DIFERIDO** (Daniel: sin flujo alto el monitoreo no es representativo → activar SOLO con tráfico alto). Reparado §58. | ⏸️ | flujo alto |
| TODO-17 | **Toda captura → CRM**: contacto→Bandeja ✅; falta newsletter (`addSubscription`→`subscriptions`). ⚠️ **§189**: el email del suscriptor solo vive en `localStorage` → **el lead se PIERDE**; el evento `bj:email-subscribed` ya lo lleva en `detail`. | 🔲 | tras App Check |
| TODO-18 | **Plan operación integral §57**: semana 1 + 9 decisiones de Daniel + compuerta de adopción + campaña cartera → bóveda | 🟡 | Daniel (dec. 1-9) |
| TODO-33 | **Panel admin "tipo app"** — DISEÑADO (`50 §5`); A3 menú+VT ✅ (v29); pend. esqueletos/prefetch/fonts; router SPA CONGELADO. PAUSADO. | 🟡 | tras demo |
| TODO-22/29 | Kernel → cars-operador (L-31): gate-de-git en linter (H-06) · kernel lea `### L-NN` de `3*-LECCIONES*` (hoy M-06). | 🔲 | cars-operador |
| TODO-23 | **Frase canónica del gate de DINERO** (H-18): Claude=gate experto; Kary=smoke no bloqueante. → Gemini. | 🔲 | Gemini |
| TODO-28 | **Correcciones web** F1-F5 ✅ EN PROD (§93-§98). Pend: C1 (Daniel) · responsive fino. | 🟡 | C1 |
| TODO-35 | **Visibilidad SITE-WIDE** (SSoT spec `2026-07-10-visibilidad-seo-aeo-geo-DISENO.md`, 47 findings). A1·A2 §184·A3 §187·A4 §188·B2 GBP §190 ✅. Cuello: 27 págs "rastreada sin indexar" = juicio de VALOR (FAQPage retirado §188.7). SIGUE: TODO-48 reseñas · FAQ visible (solo verificable) · A5 ⏳precios · GBP posts · enlaces. 🔑 authuser=3. | 🟢 | TODO-48 / FAQ |
| TODO-68 | **PLAN ÚNICO ERP v4** (SSoT spec 2026-07-04 + §11 modelos): F1·F2.0·F2.1·caja·70·F2.2 ✅ (§172-§176) → **F2.4 apartados (TODO-39)** → 2.3 térmica → F3 inventario → carril D → F4-F6. | 🟢 | F2.4 (TODO-39) |
| TODO-39 | **Apartados (F2.4)**: SPEC Decisión Fuerte = **SSoT** (`docs/superpowers/specs/2026-07-09-f2-4-apartados-DISENO.md`): anticipo=pasivo segregado, IVA a la entrega, cancelación §7.1, RBAC cajera 20%/60d. **Pend: Daniel corre consejo externo + abogado CO → implementar.** | 🟡 | implementar |
| TODO-67 | **Normalizar fotos 0954/0994 en Storage** (§162.7): tras el fix del cruce, cada foto vive en la CARPETA del doc contrario (URLs funcionan; riesgo: borrar una pieza barre la foto de la otra). Re-subir cada foto desde el admin (2 min) o mover objetos. | 🔲 | menor |
| TODO-47 | **Verdad de marca (riesgo SIC)** — Daniel 17jul: ✅ garantía de por vida (§191)·certificados·reseñas familiares·platino (2º, ppal oro 18K)·oro por peso. **⚠️ CIFRAS SIN CUADRAR**: home 40+/**5.000+** vs Nosotros-vivo **43·desde-1983/+12.000** → mismatch piezas; defaults código VIEJOS (esperan cifras canónicas de Kary). **Sin verificar**: certificaciones (Jewelers of America 2020·RJC·Muzo Origin) = claims de 3os. Guard anti-demo cubre `js/pages/`. → §191.7 · `[[feedback_no_demo_en_index]]`. | 🔲 | Kary: cifras+certs |
| TODO-48 | **Reseñas reales en la web** — espacio EXISTE (`nosotros.js §10`, hide-when-empty; Firestore `[]`; default sin fakes). 85 ★5,0 reales en GBP. Falta: curar + poblar (colección `reviews` con reglas hechas). ⚠️ arista legal de republicar Google → validar. | 🔲 | curaduría + legal |
| TODO-50 | **Catálogo de lujo** — imagen real + filtros gema/tipo + badges → §133.2(B/C). (Taxonomía=57.) | 🔲 | tras 44 |
| TODO-71 | **Endurecer gates del cerebro (cross-repo, §175)**: (a) `[[feedback_*]]` vs memoria del harness (HUECO B); (b) `ssotFacts` / dup 05↔10 (check #8 inerte, HUECO C); (c) Sonda 5 `auditoria-cerebro`. | 🔲 | cars-operador |
| TODO-57 | **Modelo GEMA** (§150-§151; SSoT spec). HECHO: fundación+form+backfill 32/32+JSON-LD. **Pend**: `settings/gems`+bake · filtros (TODO-50) · live form · D.0 whitelist `badgeGem`/`gemFilterIds` en `PUBLIC_SPEC_KEYS` (`generate-pieces.mjs:676`). | 🟡 | D.0 (whitelist gema) |
> ✅ **Cerrados** (→ ADRs vía `00-INDICE`): **77** (shard §G.5: `00`→`00c` §158-§175 · `31`→**`35-LECCIONES-DINERO`** nueva; `30` y CLAUDE.md destilados) · **79** (fix central `error-format.js`, 12/12 → L-84) · 75 (§183; n8n/Canva PARQUEADOS) · 73·74·72·41·70·69 (§172-§179) · 37/65/63/49/42/66/64/21/40/32 + 62-44. Pend Daniel: fotos IA.

---

## 📝 Bitácora (efímera)

> 2026-07-25 · **[OPUS-5] TODO-79 ✅ + B5·V17 ✅ CERRADO (código + reglas + vivo)**. TODO-79 PRIMERO a propósito: un rechazo "abre la caja" que llega como "Ocurrió un error" empuja a marcar otro medio de pago — el control necesita voz antes que dientes. **Comité ×3 por iniciativa propia (§3.7)** + 2 peer reviews → 4 veredictos (spec §9). Verifiqué y **REFUTÉ** su "punto ciego fatal": ningún reporte suma los `ingresos` del turno como venta (único lector `hoy.js:166`). **E2E vivo (prod, owner)**: rechazo sin caja con motivo real (el modal conserva lo escrito) · abono $1.000 → el Mostrador lo espera · anular netea los DOS libros · cierre **Cuadra ✓**. Cazó 1 defecto que ningún test ve (clave cruda `abono_cartera` en la auditoría → etiqueta + test). **Cierre en REGLAS (2ª tanda)**: `movimientoValido` niega `abono+efectivo` desde el cliente (ni el owner: una sola puerta, la CF) — cubre también `corregirMovimientoBatch`, que HEREDA el medio; guard de UI dentro de `abrir()` (cubre los abonos LEGADOS, sin `pataCaja`). Reglas 248/248; los 2 rojos que salieron eran míos y reales (un test mutaba el seed compartido). Re-verificado en prod: la CF sigue pasando (Admin SDK), el guard habla claro y la auditoría del turno ya muestra "Abono de clienta". **Dudas declaradas (R7)**: sin flag de apagado a propósito (apagarlo REABRE el agujero; rollback = revert + CI) · abonos efectivo HISTÓRICOS sin pata = **línea de corte declarada, sin backfill** (inyectar efectivo en arqueos firmados = fabricar evidencia).
> 2026-07-24 · **[OPUS-5] B4·D6·V1(P0)·V18 ✅ → desplegado + E2E vivo ✅**. Pata `{opId}-teso` en la misma tx; cuenta inválida ⇒ aborta todo. Dudas (R7): V9 informativo, no fiscal. → **spec §9**. *(B0-B3: commits + §192.)*
> **Pend Daniel/no-gate**: llenar "Datos del negocio" en el panel (§192 I-03; datos = identidad LEGAL-08) · marcar 7 avisos test-era en Salud (I-04) · consejo+abogado apartados (39) · instructivo Kary · push A.6 · fotos (67). ADC gcloud caducado (CLI OK). **Precios = paso FINAL.**
