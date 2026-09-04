---
name: sinapsis-cerebros
description: Usar ANTES de re-investigar un problema TRANSVERSAL (Firebase/Firestore/functions/rules, git/CI/CRLF, dinero/caja/CRM, rendimiento web, proceso de verificación) en cualquiera de los 4 proyectos del dueño (altorracars · bersagliojewelry · altorrainmobiliaria · insemastereo) — los 4 cerebros aprendieron AISLADOS y re-descubrieron la misma lección ≥6 veces; hoy lo TRANSFERIBLE vive en el corpus común `brain-private/maestro/` y las skills en su canon `brain-private/skills/`. Enruta un grep a las lecciones de los cerebros HERMANOS en el mismo disco y al corpus del maestro. También al PROPAGAR una lección portable entre cerebros (protocolo anti copy-ciego). Triggers — "este síntoma me suena pero no está en mis lecciones", "gotcha de Firebase/git/dinero", "¿otro proyecto ya vivió esto?", "propaga esta lección a los otros cerebros".
actualizada: 2026-09-02
reglas: 20
lecciones: [G:G-001, G:G-005, G:G-007, G:G-008, G:G-009, G:G-012, G:G-013]
origen: propia
---

# 🧠🔗 Sinapsis cross-cerebros — consulta a los hermanos antes de re-aprender

> Nace de la mega-auditoría cross-cerebros 2026-07-10 (cars ADR §300, mandato del dueño):
> ≥6 lecciones fueron re-descubiertas de forma independiente porque cada cerebro aprende
> aislado — screenshot-headless-se-cuelga ×3 (cars L-28 · bersaglio L-05/L-09 · insema L-04),
> tablero-05-fija-hechos-stale ×2 (cars M-22 · bersaglio M-08), ADC/multicuenta ×2 (cars
> L-43 · bersaglio L-23/L-33), verificar-tras-subagente ×2 (cars W-04 · bersaglio L-27),
> dinero-se-verifica-adversarial ×2 (bersaglio L-39 · cars M-23). Re-aprender lo ya pagado
> es el desperdicio que esta skill elimina. **Desde 2026-08 esos 4 cerebros ya NO aprenden
> aislados**: lo transferible se consolida en el CORPUS COMÚN `brain-private/maestro/` y las
> skills tienen canon único en `brain-private/skills/` (reglas 3 y 10).

## 1. Mapa de los 4 cerebros y del CORPUS COMÚN (mismo disco, rutas hermanas)

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
| 🧠 **maestro** (corpus COMÚN — dueño de lo TRANSFERIBLE) | `brain-private/` | `maestro/lecciones/G-NNN-….md` + `maestro/indice/` + `maestro/_inbox/` (single-writer) | lo que vale en CUALQUIER proyecto (gates, sellos, ruteo, punteros) · y el **canon de las 43 skills** en `skills/` |

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
3. **MÉTODO portable → CANON de la bóveda** (`brain-private/skills/<nombre>/`), NO 4 copias en 4
   cerebros ni una copia «maestra» en el harness. **Se edita el canon y se reparte**: a los 4 repos
   con `npm run brain:pull` (clave `skillFiles` de su manifest) y a `~/.claude/skills/` con
   `node scripts/skills-push.mjs` desde la bóveda; `brain-kit/skills/` **se GENERA**
   (`scripts/kit-generico.mjs`), no se edita. Si mejoras una skill desde un repo, **deposítala en
   `maestro/_inbox/` o edita el canon** — nunca la copia: el siguiente reparto se la come.
   Vigilado por el chequeo **#14 de la bóveda** (`brain-check-boveda.mjs`) — que NO es el #14 del
   linter de un repo (ése es el nudge de `deepAudit`). *(D-C4-1 · D-C4-5, 2026-09-02)*
   > ⛔ derogada (G-012 · D-C4-1, 2026-09-02): «MÉTODO portable → skill global (`~/.claude/skills/`),
   > NO 4 copias en 4 cerebros (SSoT; así viajaron `caza-bugs`, `auditoria-financiera`,
   > `comite-expertos`, `optimizacion-rendimiento-web`)». Fue cierta hasta C4-2: hoy `~/.claude/skills`
   > es una COPIA que el reparto pisa. La lista de skills que «viajaron» se conserva porque es el
   > historial de la sinapsis, no la instrucción.
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
5. **MIDE el canal antes de elegirlo — no heredes la fecha.** Re-medido el **2026-09-02** desde una
   sesión de inmobiliaria con una escritura real sobre `altorracars.github.io`: **el harness YA NO
   bloquea los writes cross-repo**, así que el canal por defecto vuelve a ser la **escritura directa
   en el repo hermano** (con su `git status` limpio y su política de ramas, regla 4) + `brain:check`
   + commit + merge allí mismo. El **payload en `references/`** deja de ser el canal fiable y pasa a
   ser el plan B, para cuando el clasificador sí bloquee o el repo esté en pausa. Y la medida se toma
   EN EL TURNO: una sonda barata (crear y borrar un fichero) antes de decidir, porque esta regla ya
   caducó una vez y nadie se enteró en 54 días. Si bloquea, imprime el comando para el dueño y sigue.
   > ⛔ derogada ([[G:G-001]] · medido 2026-09-02): «⚠️ Verificado 2026-07-10: el harness BLOQUEA los
   > writes cross-repo desde una sesión ajena (el clasificador deniega Edit/Add-Content sobre el repo
   > hermano; las LECTURAS sí pasan). El canal fiable de propagación = payload listo-para-pegar en
   > `references/` + aplicación por el operador LOCAL de cada repo». Era cierta el 2026-07-10 y siguió
   > escrita sin fecha de caducidad: un dato auto-declarado no se audita solo.

6. **La igualdad de ramas se MIDE, no se declara — y en las DOS direcciones.** «Rama de trabajo ==
   `main` == origin» (regla 4) es una **medida que caduca**, no un estado que se alcanza: un workflow
   con `permissions: contents: write` es **un committer más** y mueve `main` sin humano de por medio
   —cars `generate-vehicles.yml` (push + `cron` cada 4 h + `repository_dispatch` desde una Cloud
   Function: avanza con el PC apagado) e inmobiliaria `bump-version.yml`; bersaglio e insema NO lo
   tienen, medido el 2026-09-02—. Al ABRIR y al CERRAR:
   `git fetch origin && git rev-list --left-right --count <rama>...origin/main`. Derecha > 0 = ventaja
   del bot → `git merge --ff-only origin/main` (no es deuda tuya); izquierda > 0 = sí lo es. Sin el
   `fetch`, `origin/*` es una FOTO — el heartbeat llega a decir «origin visto hace: 10.2h» mientras
   alguien afirma «estamos al día». Detalle: cars `docs/31-LECCIONES-GIT.md` L-78 · inmobiliaria
   `docs/35-LECCIONES-PLATAFORMA.md` L-85. *(procedencia: [[G:G-001]] — un sello que solo se compara
   consigo mismo no mide nada; el testigo externo aquí es el remoto, no la ref local.)*
7. **Antes de PEGAR en un cerebro hermano, mide su destino — todos sus ejes.** Abre su
   `docs/.brain-manifest.json` y comprueba los caps del nodo receptor **en caracteres Y en líneas**, y
   el presupuesto POR ELEMENTO si lo hay (longitud de fila del índice, deuda congelada): un nodo con
   holgura de total puede bloquear el commit por el otro eje. La prosa que el pegado obliga a escribir
   (el stub, la fila del índice, la bitácora) **es parte del presupuesto del pegado**. Caso vivo: el
   payload de bersaglio lleva bloqueado desde el 2026-07-18 porque su `30` estaba a 1 char del tope
   duro. *(procedencia: [[G:G-013]] — cuántos límites hay y contra qué baseline te miden; [[G:G-005]]
   regla 3 — si el límite tiene más de un eje, mídelos TODOS después del cambio completo.)*
8. **Busca el SÍNTOMA antes de abrir lección nueva: casi siempre falta un destino, no una fila.**
   `grep` de títulos en el nodo receptor **y** en el maestro; si el síntoma ya está, la pieza entra
   como **segundo destino** de la fila existente (y esa fila queda diciendo algo verdadero: dos
   proyectos lo pagaron por separado). Solo si el síntoma es OTRO —misma causa, superficie distinta—
   nace una lección nueva, y entonces **se cruzan explícitamente**. Medido: `[[CARS:L-02]]` (el mismo
   bot te da un CONFLICTO al fusionar) y `[[CARS:L-78]]` (el mismo bot te deja atrás SIN conflicto)
   son dos puertas al mismo destino, no una gemela. *(procedencia: [[G:G-007]] reglas 1 y 3.)*
9. **El stub y el puntero: anclados desde la raíz del repo, y solo si algo se fue.** El nodo `30` de
   estos cerebros exige (check #5) un `### L-NN` por cada ID, aunque el cuerpo viva en una hoja hija:
   ese stub **DISTINGUE** (una línea que permite elegir entre hermanos), no describe — el cuerpo lo
   lee quien abra la hija, a un salto. Y la ruta se escribe **`docs/3X-….md`**, desde la raíz: un
   stub que vive en `docs/` y apunta `31-….md` se lee bien desde donde se escribió y no desde donde
   se lee. Si la pieza cabe entera en una línea, **no hay puntero que poner**: la marca basta.
   *(procedencia: [[G:G-008]] mitades 1 y 2; [[G:G-012]] regla 1.)*
10. **Lo TRANSFERIBLE va al maestro; lo repo-específico se queda.** Los 4 cerebros ya no aprenden
   aislados: `brain-private/maestro/` es el corpus común (`lecciones/G-NNN…`, `indice/`, `_inbox/`
   single-writer) y el criterio de corte de 3 pruebas vive en `cerebro-maestro/F2-DISENO.md §3.1`. Una
   sesión NO numera una `G`: deposita en `maestro/_inbox/<fecha>-<tema>.md` **sin número** y **sin fila
   en el índice** — el `G-NNN` lo asigna la pasada de consolidación, y una fila que apunte a un ID que
   aún no existe es una referencia colgante que el linter caza en el turno siguiente. Cada candidata
   declara además a qué skill va (`skill:`) o `skill: ninguna — <razón>` (D-C4-4). *(procedencia:
   [[G:G-009]] — escribir SOBRE el cambio es escribir DENTRO del sistema; D-C4-4.)*
11. **Toda importación pendiente lleva fecha y QUÉ la retira.** Una entrada de §4 sin fecha de
   revisión ni mecanismo de salida no gestiona la deuda: la autoriza. Cada bullet declara `abierto
   desde AAAA-MM-DD` y su condición de cierre; si el repo destino está EN PAUSA indefinida, la parte
   transferible **no espera**: va al `_inbox/` del maestro el mismo día (regla 10), y el payload queda
   solo para lo repo-específico. Revisa §4 en cada sinapsis: lo aplicado se archiva en `references/`
   con su puntero. *(procedencia: [[G:G-001]] corolario del DENOMINADOR — un sello de completitud
   declara contra qué conjunto es cierto; medido: 46 días de bloqueo sin que nada avisara.)*
12. **El bump del kernel y su reparto son UN solo cierre — desde que sube `KERNEL_VERSION`, las hojas se
   quedan mudas.** El gate de kernel de cada repo compara contra el canónico y marca `STALE` en cuanto la
   versión del maestro cambia; como el pre-commit corre el linter en todo commit de cerebro, **ninguna
   hoja puede commitear ni una línea de `docs/` hasta su pull**. Medido 2026-09-04: K1 cerró v1.34.0 en
   la bóveda y, 40 minutos después, el commit del `10` de inmobiliaria salió BLOQUEADO por dos avisos
   que no eran suyos. Regla: quien sube la versión reparte en la MISMA sesión (un agente por repo,
   inmobiliaria primero como estreno y las hermanas con sus lecciones), o no sube la versión — el bump
   sin reparto no es «hecho», es una avería programada en cuatro sitios.
   **Y antes de repartir, SONDA**: corre el linter NUEVO en solo-lectura en los CUATRO repos (30 s
   cada uno) antes de tocar hook ni manifest — el repo más rico no prueba los caminos que solo recorre el
   más pobre (v1.34.0 completó en inmobiliaria, cars y bersaglio y MURIÓ en insema). El EOL se respeta POR
   FICHERO (bersaglio es CRLF por decisión documentada, cars es mixto) y se MIDE con node contando bytes
   13/10 — `grep -c` con `$'\r'` miente en Git Bash. Restaurar ficheros del kernel = escribir los
   bytes del blob, nunca `git restore` (con `autocrlf` deja CRLF y el gate de espejo grita «difiere»). *(procedencia: sesión
   2026-09-04, `cerebro-maestro/DICTAMEN-ENCENDIDO.md §9`.)*

## 4. Importaciones pendientes por cerebro (auditoría 2026-07-10 — cada operador ejecuta la suya y actualiza esta lista)

- **cars**: ✅ **APLICADO 2026-09-02** (aplicador C4-3, escritura DIRECTA — el canal se midió ese día,
  regla 5): su **L-78** (un bot con `contents: write` mueve `main` solo; `dev` queda atrás sin conflicto
  y sin aviso — hermana de su L-02) en `docs/31-LECCIONES-GIT.md` + stub en `30` + bitácora en `10`.
  Lo transferible NO depende de que cars despierte: está en `maestro/_inbox/2026-09-02-sinapsis-bot-mueve-main.md`.
- **bersaglio**: 🟡 **PAYLOAD LISTO** (2026-07-10, preparado por cars al pedir el dueño la alineación
  total; el write directo lo bloqueó el harness — la regla 5 **de entonces**, hoy derogada) → **`references/import-bersaglio-2026-07-10.md`**:
  su L-84 (detached HEAD) + sus M-09/M-10 (grep≠semántica · maquinaria-simple-a-la-mano), con anclas
  exactas y en SU convención. Aplicar en 3 pegas + brain:check + commit en `Desarrollo`; luego marcar ✅ aquí
  y borrar el archivo. Opcional: converger su copia repo de `meta-ads-diagnostico` desde el global.
  **⚠️ 2026-07-18 (sinapsis FABLE-5): aplicación BLOQUEADA — su `30-LECCIONES` está a 1 char del tope
  duro del kernel (43.999c; >44.000 = warn→exit 1 en pre-commit; su TODO-77 shard va primero) y su
  M-09 ya fue tomado localmente (2026-07-17, "muestrear≠contar") → tras el shard, aplicar renumerando
  el payload: M-09→M-10 y M-10→M-11 (nota dejada en el payload). `meta-ads-diagnostico` repo ya
  convergido desde el global (sync skills 2026-07-18).**
  **abierto desde 2026-07-18** (regla 11) · se cierra cuando su `30` shardee (su TODO-77) y el operador
  aplique el payload renumerado; si su operador no vuelve, lo transferible no espera aquí.
- **insema**: bajo valor hoy (sitio estático sin Firebase ni dinero); su doctrina §3.3 ya cubre
  la esencia de proceso. **Sin deuda abierta** (regla 11): se revisa si el stack crece.
- **Aplicadas y archivadas** (cars rondas 1-2 · inmobiliaria · constancia de liderazgo ×3, julio 2026):
  → `references/sinapsis-2026-07-aplicadas.md`. Cerradas: no rutean, no vuelven aquí.

## 4b. Propuestas al escritor del kernel (inmobiliaria) — bandeja cross-repo

- **De cars N2 #6 (2026-07-23, su §303)**: (a) las skills compartidas de `~/.claude/skills/` (este canal) NO tienen peer-hash/integridad — un `git add -A` ajeno (clase L-48) podría corromper payloads ×4 sin que ningún gate lo vea; evaluar hash de skills críticas en el kernel. (b) Anti-engorde: fusionar el check BFS-huérfanas-2º-orden con el de 1er orden en un solo check de conectividad. Al resolverlas, borrar esta entrada. **abierto desde 2026-07-23** (regla 11).
- **De la sinapsis 2026-09-02 (bot que mueve `main`)** — **abierto desde 2026-09-02**, se cierra cuando el heartbeat lo mida o el escritor del kernel lo rechace por escrito: el heartbeat (`kernel/session-handoff.mjs`, sonda `git:`) ya imprime rama, HEAD, sucios y `origin visto hace: N h`, pero NO compara la rama con `origin` — así que la divergencia que provoca un bot con `contents: write` es INVISIBLE en el arranque, que es justo cuando habría que verla. Propuesta: una sonda `- adelanto/retraso vs origin: ↑A ↓B (refs de hace N h)` con `git rev-list --left-right --count HEAD...origin/<default>`. **Es compatible con el diseño «CERO red»**: lee refs remotas ya cacheadas, y la línea de al lado ya declara su antigüedad. Con `↓B > 0` el boot debería decir «`merge --ff-only` antes de trabajar». Mecaniza la regla 6, que hoy es [HONOR]. Al resolverla, borrar esta entrada.

## 5. Qué NO es esta skill

- NO reemplaza las lecciones locales — lo repo-específico se queda en su cerebro.
- NO es excusa para leer 4 cerebros enteros "por si acaso": grep de títulos + tramo puntual.
- La alineación de GOBERNANZA (§G ×4, TODO-28) es del escritor único del kernel
  (**operador-inmobiliaria** desde 2026-07-10; antes operador-cars), no de esta skill.
