# ⚡ 10 — MEMORIA A CORTO PLAZO (WIP / Sprint activo)

> **Nodo neuronal: Memoria a Corto Plazo** (auto-carga con `CLAUDE.md` + `05`). Solo lo VIVO:
> foco, pendientes (TODO-NN = ledger único), bitácora efímera. Estado técnico → `05`.
> **Pizarra, no archivo**: al cerrar tarea → ADR en `99` + fila en `00`, lecciones a `30`, podar (GC §G.4).

---

## 🎯 Foco actual

> 🎉 **CRM + Fase M (M0→M6) EN PRODUCCIÓN** (ADR §47-§82; 344 clientas, cartera→`05`; admin-only, vendedoras=dato; Panel v2). ⚙️ **OPUS 4.8 interino** (Fable cayó 2026-06-12; marcar [OPUS-4.8] · `feedback_opus_interino`).
>
> **🔄 RESET A CERO** (Daniel 2026-06-20): Kary recarga TODO de cero; cartera/clientes se vacían (344/$506M desechable → bajan urgencias de dinero). TODO-24 índice cero-ficción ✅ (§88) en prod.
>
> **Web "app-like" (§103-§112) CERRADO EN PROD ✅** (PR #323). **🎯 FOCO AHORA = usuarios & permisos del panel**: (1) 🔴 correo OWNER→personal (TODO-20, guía entregada, Daniel ejecuta) · (2) rol "catálogo" de Kary + candado en reglas (TODO-19) · (3) creación automática de usuarios + fix login-parpadea (TODO-31). Resto en tabla TODO (07/09/14/18/28 · norte mini-ERP: Fase M restante·DIAN·inventario). M4 1er corte 1-jul.
> - ⚠️ **Deploy** (L-22/L-26/L-23): reglas/functions = manual mío; sitio+merge a `main` = PR de Daniel (`git fetch` siempre); Admin SDK = ADC. Norte: spec maestra v3.

---

## 📋 Pendientes abiertos (TODO-NN) — ledger único

| ID | Item | Estado | Bloqueo |
|---|---|---|---|
| TODO-03 | (Opcional) headers de `99` a formato numerado `## NN.` (hoy por fecha, válido) | 🔲 | baja prioridad |
| TODO-04 | (Opcional) anomalías 🔧 en `skills/` (formatos no-skill) | 🔲 | baja prioridad |
| TODO-07 | **Contenido real**: reseñas Google Maps (Nosotros), Films, feed Redes (`js/data/home-media.js`, `js/pages/nosotros.js`) | 🔲 | cliente entrega datos |
| TODO-08 | **Fase 2 Hardening**: Tier A ✅; pendiente CSP/reglas/claims (Tier B/C) → bóveda `41-SEGURIDAD §1.5` | 🟡 | Tier B = emulador+deploy gated |
| TODO-09 | **Fase M**: tren M0→M6 ✅ EN PROD (§78-§80; 1er corte real 1 jul) · **ACUERDOS R1-R5 (§81) + bug A8 RESUELTO (§87, red-team 0 hallazgos)**, GATEADO/inerte — **encender = Daniel** (deploy+bandera+`encender-acuerdos.mjs`+prueba; baja urgencia por reset-a-cero). Restan luego: M7 · M2c + B6 · ASESOR/RBAC (TODO-19) · complemento menor `Σcuotas>saldoAlPactar`. **Kary prueba TODO al final; verif. POR HITO = experta de Claude** | 🟡 | encender R6 (Daniel, baja urgencia) |
| TODO-14 | **App Check: dejar en MONITOREO; Enforce DIFERIDO** (decisión Daniel 2026-06-23: aún no hay flujo alto de clientes → el monitoreo no es representativo; activar Enforce SOLO cuando haya tráfico alto, para que sea preciso). Registro ya reparado (§58). | ⏸️ | esperar flujo alto (Daniel decide cuándo) |
| TODO-17 | **Toda captura → CRM**: contacto→Bandeja ✅; falta newsletter (`addSubscription`→`subscriptions`) en el panel | 🔲 | tras App Check |
| TODO-18 | **Plan operación integral §57**: semana 1 día a día · 9 decisiones de Daniel · compuerta de adopción · campaña cartera (diseño del contador ANTES del piloto) → bóveda | 🟡 | Daniel (decisiones 1-9 + contador) |
| TODO-19 | **RBAC roles granulares** (Daniel 2026-06-11; detalle → `50-ARQUITECTURA §5`). **CONCRETO (2026-06-23)**: rol **"catálogo"** para Kary = SOLO Piezas+Colecciones; el resto con candado. Hoy es por NIVELES (owner>admin>editor; editor ve de más) → rol bajo editor + gate NAV (`sidebar-data.js`) + **CANDADO REAL en `firestore.rules`** (denegar clientes/dinero/CMS) + `createUser`/profile al rol nuevo + tests emulador. **Decisión Fuerte** (seguridad). | 🟡 | diseñar+construir |
| TODO-20 | **🔴 URGENTE (Daniel 2026-06-23): migrar correo del usuario OWNER** del de empresa (`bersagliojewelry@gmail.com`) → correo PERSONAL de Daniel; y `bersagliojewelry@gmail.com` pasa a ser de KARY (operadora). RCA: el OWNER (super-admin, Daniel) NO debe colgar de un correo que controla la empresa/Kary (riesgo de reset de clave por terceros). **SEGURO**: el owner se identifica por ROL/uid (claim `syncRoleClaim`), NO por correo (verificado rules+functions) → cambiar el correo (mismo uid) conserva el rol. Daniel ejecuta en consola (yo guío). **Respuestas (2026-06-23)**: Kary sin cuenta aún (le dará el de bersaglio, rol catálogo TODO-19); Daniel tiene correo personal; AHORA solo login del panel (cuenta Google/proyecto = al FINAL). **Guía ENTREGADA** (Auth→Users→editar email del owner→personal; uid/rol intactos; fallback Admin SDK). → `41-SEGURIDAD §1.7` | 🟡 | Daniel ejecuta en consola |
| TODO-21 | **Revisión post-Fable de `[OPUS-4.8]`** (H-08): ledger por ADR/§ y riesgo (dinero §81 > seguridad XSS/§65/§66 > CMS §82+ > docs); 46 commits | 🔲 | Fable vuelve |
| TODO-22 | **Gate-de-git en el linter** (H-06): que `brain:check` warne si `05` dice "==main" con commits adelante. Toca kernel ×3 → **lo origina cars-operador** (escritor único, L-31); converge con cars en la pasada Gemini ÚNICA | 🔲 | Gemini (consolida cars) |
| TODO-23 | **Frase canónica del gate de verificación de DINERO** (H-18): Claude experto = gate; Kary = smoke POST-deploy no bloqueante. **Aporte de bersaglio a la pasada Gemini única** (cars consolida + integra) | 🔲 | Gemini (consolida cars) |
| TODO-28 | **Correcciones web** (Daniel 2026-06-21): F1-F5 ✅ EN PROD (§93-§98; recon 7 ag. en bóveda). **Pend.**: arranque **C1** (decisión Daniel) · responsive fino device-driven. | 🟡 | C1 (Daniel) + responsive |
| TODO-29 | **Aporte a la pasada cars (kernel)** (auditoría §97/HA-02): que `brain-check.mjs` lea las definiciones `### L-NN` de `3*-LECCIONES*.md` (no solo `30`) → habilita shard REAL de lecciones sin stub-header en `30` (hoy workaround M-06/§96). Va junto a TODO-22 (gate-git) + TODO-23. Cambio de kernel = cars-operador (L-31), NO unilateral. | 🔲 | cars-operador (kernel) |
| TODO-31 | **Panel admin · usuarios+UX** (Daniel 2026-06-23, va con TODO-19): **(a)** creación AUTOMÁTICA de usuarios — `usuarios.js` hoy pide UID manual (`createUserProfile`); la CF `createUser` (Auth+perfil, owner-only) ya existe pero no está cableada → conectar el modal a `createUser` (patrón `deactivateUser`). **(b)** login parpadea al entrar (ref Altorra) → RCA en navegador (sospecha: tiempos auth/redirect + gate `display:none` body). Owner-only creación = ✅ ya está. | 🟡 | construir |

> ✅ Cerrados y consolidados (retirados en el GC 2026-06-09): TODO-01/02→§38 · 05→§47 · 06→`e290f83` · **10→§62** (CI reactivado; activo al subir/mergear) · 11→spec §16 · 12→§50 · 13→§51 · **15→§63 (PRE-1 CERRADO: backup+restore PROBADO+copia fuera)** · 16→§55 · settings.local→`e3d390f` · **TODO-25→§90 (CAZA-BUGS: reflejo + W-10 + skill `caza-bugs` + gate L-42 ×5 secciones)** · **TODO-26→cars §G (reflejo Caza-bugs propagado byte-idéntico ×4 — verificado en cars/inmobiliaria/insema, 2026-06-21)** · **TODO-27→§96 (shard `30`→`31-LECCIONES-FIRESTORE`; descubrimiento: kernel acopla `### L-NN` a `30` → M-06)** · **TODO-24→§88 (índice 100% cero-ficción EN PROD; v21 mergeado)** · **TODO-30→§103-§112 (web "app-like" CERRADO EN PROD, PR #323: View Transitions §107 + caché inteligente SWR §108 + LQIP siteContent/catálogo/wishlist/detalle §111/111.8 + migración LQIP §110.4 + Cache-Control Storage §112; VALIDADO por Daniel + extensión Chrome)**.

---

## 🔮 Contexto estratégico
Programa "Nuevo Bersaglio": Fase 1 rediseño ✅ · Fase 2 hardening (Tier A/B ✅, C pendiente) · Fase 3 CRM ✅ en prod · **Fase M: tren M0→M6 ✅ EN PROD** (candado + auditoría + gestiones + acuerdo por deuda) + **ACUERDOS de pago/cuotas R1-R5 construidos (§81), gateados** (charter `50-ARQUITECTURA`, plan `fase-m-plan.md`). SW `bersaglio-v16`. Horizonte: R6 acuerdos → M7 castigo → M2c → reportes/aging B6 → (futuro) inventario/facturación + RBAC/asesor (TODO-19).

---

## 📝 Bitácora (efímera)

> Podada (GC) 2026-06-23. Histórico → **ADR §37-§112** (mapa `00`→detalle `99`; lecciones L-/M- en `30`/`31`).
>
> **▶️ §103-§112 web "app-like" CERRADO EN PROD ✅** (PR #323). Detalle → ADR §103-§112 (L-50EXT/L-52/L-53). Patrón reusable `scripts/migrate-*.mjs` (server-side, dry-run/idempotente, SA key). **Sesión 2026-06-23 (tarde): investigado el panel de usuarios** (login.js/usuarios.js/auth.js/shared.js/sidebar-data.js + CF createUser) → TODO-19/20/31. Owner-only creación ✅ ya está.
>
> **🚦 Cola / próximo (sin sprint activo — decide Daniel)**: ver tabla TODO. Cerca: contenido real web (TODO-07) · App Check Enforce (TODO-14) · correo OWNER (TODO-20). Mantenimiento cerebro: auditoría Nivel-2 VENCIDA (16 ADRs nuevos → destilar/shard `30`) · alinear cerebro cars (sesión dedicada) · revisión post-Fable (TODO-21). **Regla**: `arquitecto-software` SIEMPRE · `[[feedback_workflows_acotados]]`.
