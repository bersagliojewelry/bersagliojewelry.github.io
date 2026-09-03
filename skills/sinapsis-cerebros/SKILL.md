---
name: sinapsis-cerebros
description: Usar ANTES de re-investigar un problema TRANSVERSAL (Firebase/Firestore/functions/rules, git/CI/CRLF, dinero/caja/CRM, rendimiento web, proceso de verificación) en cualquiera de los 4 proyectos del dueño (altorracars · bersagliojewelry · altorrainmobiliaria · insemastereo) — los 4 cerebros aprenden AISLADOS y ya re-descubrieron la misma lección ≥6 veces. Enruta un grep a las lecciones de los cerebros HERMANOS en el mismo disco. También al PROPAGAR una lección portable entre cerebros (protocolo anti copy-ciego). Triggers — "este síntoma me suena pero no está en mis lecciones", "gotcha de Firebase/git/dinero", "¿otro proyecto ya vivió esto?", "propaga esta lección a los otros cerebros".
actualizada: 2026-09-02
reglas: 13
lecciones: []
---

# 🧠🔗 Sinapsis cross-cerebros — consulta a los hermanos antes de re-aprender

> Nace de la mega-auditoría cross-cerebros 2026-07-10 (cars ADR §300, mandato del dueño):
> ≥6 lecciones fueron re-descubiertas de forma independiente porque cada cerebro aprende
> aislado — screenshot-headless-se-cuelga ×3 (cars L-28 · bersaglio L-05/L-09 · insema L-04),
> tablero-05-fija-hechos-stale ×2 (cars M-22 · bersaglio M-08), ADC/multicuenta ×2 (cars
> L-43 · bersaglio L-23/L-33), verificar-tras-subagente ×2 (cars W-04 · bersaglio L-27),
> dinero-se-verifica-adversarial ×2 (bersaglio L-39 · cars M-23). Re-aprender lo ya pagado
> es el desperdicio que esta skill elimina.

## 1. Mapa de los 4 cerebros (mismo disco, rutas hermanas)

> 🏛️ **LIDERAZGO ASUMIDO (2026-07-10, cars §302 + kickoff §7 — mandato del dueño)**: el líder/constructor
> del cerebro ×4 (kernel `brain-check/diff/index.mjs` + §G cross-repo) es **INMOBILIARIA** (operador-inmobiliaria;
> specs madre en `altorrainmobiliaria.github.io/specs/`). Cars queda EN PAUSA como peer y NO escribe el kernel.
> Propagación desde inmobiliaria: byte-idéntica ×4; si el harness bloquea el write cross-repo (regla 5),
> payload en `references/` + aplicación por el operador local de cada repo.

| Cerebro | Repo en `C:\Users\romad\Documents\GitHub\` | Lecciones | Fuerte en |
|---|---|---|---|
| **cars** (canon histórico, EN PAUSA) | `altorracars.github.io` | `docs/30-LECCIONES.md` + hijas `31` (git) · `32` (meta M-NN) · `33` (frontend) | SSG/cron/SW · CRM Firestore · workflows/subagentes · a11y/perf · meta-gobernanza del cerebro |
| **bersaglio** | `bersagliojewelry.github.io` | `docs/30-LECCIONES.md` + `31-…FIRESTORE` · `32-…CARGA` · `34-…META` | **DINERO** (POS/caja/pasarela Wompi/arqueos/idempotencia) · rules adversariales · functions gen2 · LCP/carga CMS |
| **inmobiliaria** (🏛️ LÍDER desde 2026-07-10, prioridad #1) | `altorrainmobiliaria.github.io` | `docs/30-LECCIONES.md` (12: L-01..L-12) | **kernel/§G/TODO-28 (escritor único)** · arranque Firebase/presence · portal greenfield (kickoff 2026-07-10) |
| **insema** | `insemastereo.github.io` | `docs/30-LECCIONES.md` (joven: 7) | sitio estático user-site / GitHub Pages |

## 2. Cómo consultar (barato — 2 pasos, en el hilo PRINCIPAL)

1. **Títulos**: `Select-String -Path ..\<repo>\docs\*LECCIONES*.md -Pattern '^### '` (o `Grep`/`rg` con ruta absoluta).
2. Lee **SOLO el tramo** de la lección que suena (offset/limit o `-Context`) — jamás el archivo entero del hermano.

⚠️ Hazlo TÚ directamente: un SUBAGENTE en background con lecturas fuera-de-cwd **SE CUELGA**
esperando un permiso que nadie aprueba (cars L-50). Shell en foreground funciona.

## 3. Reglas de citación y propagación (anti-daño)

1. **Cita SIEMPRE con prefijo de repo** ("bersaglio §115", "cars M-20"). Un `L-NN` pelado en
   TU cerebro o resuelve a TU lección homónima (mentira silenciosa: cars y bersaglio tienen
   L-65 DISTINTAS) o dispara refs colgantes en el linter (check #5b del kernel).
2. **Propagar ≠ copiar**: re-escribe en la CONVENCIÓN del destino, verificada leyendo su `30`
   (formato de headers, numeración, shards) — cars L-52: un copy byte-idéntico que no aplica
   = no-op silencioso = falsa cobertura.
3. **MÉTODO portable → skill global** (`~/.claude/skills/`), NO 4 copias en 4 cerebros (SSoT;
   así viajaron `caza-bugs`, `auditoria-financiera`, `comite-expertos`, `optimizacion-rendimiento-web`).
4. **Escribir en un repo hermano** exige: su `git status` limpio (hazard multi-chat, cars L-48) +
   respetar SU política de ramas — **verificada repo por repo el 27-ago-2026, porque la que había
   aquí estaba INVERTIDA en uno y omitía el único que importa**:
   · **altorra-inmobiliaria** → Claude commitea, pushea, mergea y despliega. ⛔ NUNCA abrir PR sin permiso.
   · **cars** → Claude commitea, pushea y **mergea `dev`→`main`** (delegado 27/06, M-12). Rama única `dev`.
   · **bersaglio** → Claude commitea y **mergea a main** (`CLAUDE.md` §Reglas git + `05` «merge a main =
     Claude»). ⚠️ Antes de mergear, MIRA qué arrastra: `main` despliega una web que factura.
   · **insema** → desde el **2-sep-2026 Claude TAMBIÉN mergea a `main`** (orden del dueño: «empuja
     todo a main, que no quede nada pendiente por merge, venga de donde venga»; derogó la excepción
     en la que él mergeaba). Regla para los CUATRO: al cerrar trabajo, rama de trabajo == `main` ==
     origin; una rama por delante de `main` es deuda, no entrega. Al mergear, el kernel se resuelve
     con el CANÓNICO de la bóveda y el sello `.kernel-version.json` PROPIO del repo (lista ficheros
     distintos por repo: el de otro repo bloquea el commit).
   *Que una acción esté delegada no la convierte en trivial, y que lo esté en un repo no dice nada
   del de al lado.*) + su `brain:check` en verde después. Ante la duda, deja la importación
   listada abajo y que la ejecute la próxima sesión de ESE repo.
5. **⚠️ Verificado 2026-07-10: el harness BLOQUEA los writes cross-repo desde una sesión ajena**
   (el clasificador de permisos deniega Edit/Add-Content sobre el repo hermano; las LECTURAS sí
   pasan). El canal fiable de propagación = **payload listo-para-pegar en `references/` de esta
   skill** (compartida, escribible desde cualquier sesión) + aplicación por el operador LOCAL
   de cada repo. No intentes burlar el bloqueo.

## 4. Importaciones pendientes por cerebro (auditoría 2026-07-10 — cada operador ejecuta la suya y actualiza esta lista)

- **cars**: ✅ ronda 1 (su L-74: callable-403=invoker bersaglio §115 · secrets gen2 ≠ deploy `.env` ·
  MCP `firestore_query_collection` timestamp→`[]` falso · render-sugiere-click-revalida bersaglio §76).
  ✅ **ronda 2 (2026-07-10, cars ADR §301)** — con TRIAGE: bersaglio §181→ya era su L-73 (sin acción) ·
  §182 IA-panel→`43-UX §Doctrina-panel` (ADOPTÓ es-CO-sin-jerga/cero-PRONTO/microcopy-dinero/KPI
  abreviado+exacta/anular-ventana-viva; 3 reglas ya cumplidas por su §268/§246) · §183 minería→su L-75
  (twenty NETO = T-2 arrays tel/email + T-24/T-25 widgets/actor-`fuente`; DESCARTÓ re-importar
  T-1/T-5/T-18/T-19/T-27 = ya cubiertos por su CRM; callejones registrados) · paid-media→
  `meta-ads-diagnostico §Doctrinas minadas` (actualizó el GLOBAL + su espejo; ojo bersaglio: tu copia
  repo quedó con redacción propia — si quieres converger, re-sincroniza desde el global) · skills
  `opus-interino-protocolo` (+flag en su 05) y `pos-facturacion-retail` catalogadas · n8n = Decisión
  Fuerte propia futura, NO adoptado.
- **bersaglio**: 🟡 **PAYLOAD LISTO** (2026-07-10, preparado por cars al pedir el dueño la alineación
  total; el write directo lo bloqueó el harness, regla 5) → **`references/import-bersaglio-2026-07-10.md`**:
  su L-84 (detached HEAD) + sus M-09/M-10 (grep≠semántica · maquinaria-simple-a-la-mano), con anclas
  exactas y en SU convención. Aplicar en 3 pegas + brain:check + commit en `Desarrollo`; luego marcar ✅ aquí
  y borrar el archivo. Opcional: converger su copia repo de `meta-ads-diagnostico` desde el global.
  **⚠️ 2026-07-18 (sinapsis FABLE-5): aplicación BLOQUEADA — su `30-LECCIONES` está a 1 char del tope
  duro del kernel (43.999c; >44.000 = warn→exit 1 en pre-commit; su TODO-77 shard va primero) y su
  M-09 ya fue tomado localmente (2026-07-17, "muestrear≠contar") → tras el shard, aplicar renumerando
  el payload: M-09→M-10 y M-10→M-11 (nota dejada en el payload). `meta-ads-diagnostico` repo ya
  convergido desde el global (sync skills 2026-07-18).**
- **inmobiliaria**: ✅ **APLICADO** (2026-07-10, operador-inmobiliaria): L-08..L-12 insertadas en su
  `docs/30-LECCIONES.md` + brain:check verde + commit; payload borrado.
- **×3 CONSTANCIA DE LIDERAZGO (cars ✅ · bersaglio ✅ · insema ✅ — COMPLETA 2026-07-18)**: payloads preparados 2026-07-10
  por inmobiliaria como nuevo escritor único (el write cross-repo lo bloquea el harness,
  regla 5). **cars ✅ APLICADO** (2026-07-18, sinapsis FABLE-5 + no-verify autorizado por Daniel; commit `6a26ba83` en `dev` — su payload borrado): re-apuntar
  "escritor único del kernel/§G = cars" → "= inmobiliaria (traspaso 2026-07-10, cars §302)". Cada
  operador local aplica su pega + brain:check + commit; luego marca ✅ aquí y borra su archivo.
  **insema ✅ APLICADO** (2026-07-18, sinapsis FABLE-5): `60-WORKFLOWS` re-apuntado + 15 skills
  re-sincronizadas + brain:check SANO + commit `a042494` pushed (`cerebro/todo-32`); payload borrado.
  **bersaglio ✅ APLICADO** (2026-07-18, sinapsis FABLE-5): `60-WORKFLOWS` W-10 + `34-LECCIONES-META`
  L-31.3 re-apuntados + 15 skills re-sincronizadas + brain:check SANO + commit `486640f` pushed
  (`Desarrollo`); payload liderazgo borrado (el de LECCIONES queda BLOQUEADO — ver su bullet arriba).
- **insema**: bajo valor hoy (sitio estático sin Firebase ni dinero); su doctrina §3.3 ya cubre
  la esencia de proceso. Revisar si el stack crece.

## 4b. Propuestas al escritor del kernel (inmobiliaria) — bandeja cross-repo

- **De cars N2 #6 (2026-07-23, su §303)**: (a) las skills compartidas de `~/.claude/skills/` (este canal) NO tienen peer-hash/integridad — un `git add -A` ajeno (clase L-48) podría corromper payloads ×4 sin que ningún gate lo vea; evaluar hash de skills críticas en el kernel. (b) Anti-engorde: fusionar el check BFS-huérfanas-2º-orden con el de 1er orden en un solo check de conectividad. Al resolverlas, borrar esta entrada.

## 5. Qué NO es esta skill

- NO reemplaza las lecciones locales — lo repo-específico se queda en su cerebro.
- NO es excusa para leer 4 cerebros enteros "por si acaso": grep de títulos + tramo puntual.
- La alineación de GOBERNANZA (§G ×4, TODO-28) es del escritor único del kernel
  (**operador-inmobiliaria** desde 2026-07-10; antes operador-cars), no de esta skill.
