---
name: anti-codigo-muerto
description: Usar SIEMPRE al estrenar/fix/mejorar código que REEMPLAZA algo viejo — antes de cerrar el cambio. Evita el síndrome Knight Capital (el "8º servidor": $460M en 45 min por código muerto de 10 años que un flag reutilizado revivió). Garantiza que lo nuevo RETIRE lo viejo (no apile): detectar código muerto/huérfano (funciones desplegadas sin source, paths/JS sin referencia, flags reutilizados, deploy incompleto ×N targets), cuarentenarlo (`_legacy/` / revocar IAM — nunca borrar a ciegas) y verificar el camino vivo con el MOTOR ACTUAL (no el planeado). Incluye el gate mecánico `deadcode:check` y la política cuarentena>borrado. NO es para depurar un bug (systematic-debugging) ni el gate del claim final (verification-before-completion). Triggers — "estreno código que reemplaza X", "esto deja código viejo", "deploy de functions", "reutilicé un flag", "¿quedó algo viejo molestando?", "una línea mal puesta cuesta millones", "lo que no testeas te quiebra".
---

# 🧟 Anti-código-muerto — lo nuevo REEMPLAZA lo viejo, no se apila (anti Knight Capital)

> **Knight Capital (1-ago-2012):** un deploy actualizó 7 de 8 servidores; el 8º quedó con código
> muerto de ~10 años (`Power Peg`) que un **flag reutilizado** revivió → compró caro/vendió barato →
> **$460M en 45 min → quiebra.** *"En programación, lo que no testeas te quiebra."*
> Doctrina del dueño: al estrenar, el código viejo se RETIRA o CUARENTENA — jamás se deja vivo
> "porque nadie lo va a usar". Apilar lo nuevo sobre lo viejo = fugas de seguridad, dinero, interfaz, plataforma.
> PORTABLE: cero rutas de un repo concreto; adapta al stack del proyecto activo (lee su cerebro).

## 0. Cuándo aplica / cuándo NO
- **SÍ**: al estrenar/reemplazar/migrar código que SUPERPONE algo viejo (motor, función, path, flag, módulo, regla) — ANTES de cerrar el cambio.
- **NO**: depurar un bug ya reproducible (`systematic-debugging`); el gate del claim final (`verification-before-completion`); edición trivial sin nada que reemplazar (aun así: ¿deja un flag/target a medias?).

## 1. La invariante: CUARENTENA > BORRADO
Sin CI de tests robusto, borrar a ciegas es inaceptable. **Aísla con certeza**: mueve a `_legacy/`
(frontend) o revoca IAM / despliega un mock (backend) → observa logs ≥15 días → un **HUMANO** borra
en un PR con logs limpios. El gate REPORTA + BLOQUEA; nunca borra solo (guardián §G.4).

## 2. Las 4 causas de Knight Capital → tu checklist (cázalas TODAS antes de cerrar)
1. **Código muerto en prod** → ¿lo nuevo dejó vivo lo viejo? (functions desplegadas sin source = el 8º servidor; JS/paths sin referencia; módulos que ya nadie importa).
2. **Deploy incompleto (7/8)** → ¿el deploy cubrió TODOS los targets (functions+rules+hosting+storage) y NO dejó una versión vieja viva en otro target/región?
3. **Flag reutilizado** → ¿reciclaste un nombre de flag con semántica nueva? (el detonante EXACTO de KC).
4. **Sin test/rollback que lo cace** → ¿recorriste el camino vivo con el **MOTOR ACTUAL** (no el planeado)?

## 3. Detección por stack (no hay bala de plata)
- **Cloud Functions huérfanas (el 8º servidor — MECANIZABLE)** → gate `deadcode:check`: diff POR NOMBRE
  de `firebase functions:list --json` ↔ `exports.X` del source. Desplegada ∉ source = huérfana → FALLA.
  (Parse ESTÁTICO, NO `require` — side-effects. Por NOMBRE, no región: los triggers de la BD viven en su
  región a propósito; un diff por-región da falsos positivos.)
- **JS muerto SIN bundler** → knip/ts-prune/depcheck son **inútiles** en `<script>` global-scope (no hay
  grafo import/export → falsos positivos masivos). Detección real = **grep del grafo de referencias**
  (¿la función/archivo se referencia en algún lado, incluido el HTML?) + cobertura. La migración a **ESM
  nativo** habilita knip pero es un EPIC riesgoso → DIFERIR. Near-term: grep + **proxy de telemetría**
  (envolver la función sospechosa: `const dep=(fn,n)=>(...a)=>{console.warn('[ZOMBI] '+n);return fn(...a)}`;
  15 días sin logs → muerta, se cuarentena).
- **Desconexión DOM↔JS** → una función JS puede parecer viva (`getElementById('boton-viejo')`) pero si el
  botón se borró del HTML, nunca dispara; al revés, un botón nuevo puede mandar al motor VIEJO que no lo
  entiende. Ninguna herramienta lo caza → **grep cruzado JS↔HTML** + recorrer el camino vivo.
- **Flags** → namespacing VERSIONADO (`enable_bot_v2_llm`, nunca genérico `botActivo`); **tombstone**: doc
  de "flags prohibidos"; el init cruza flags entrantes y lanza excepción fatal en dev/staging si lee uno
  prohibido. **Jamás recicles un nombre** (rollback → apaga; próximo intento = `_v2_1`).

## 4. Invariantes del stack (puntos ciegos que rompen AL limpiar)
- **Caché del cliente (GitHub Pages/SW)**: tras un push, usuarios con HTML/JS cacheado corren la V1 por
  horas/días. Si cuarentenas el backend V1 en ese ínterin, los rompes. → la cuarentena del backend dura
  **MÁS que el caché del cliente** (≥1 semana) + invalida caché (bump `CACHE_VERSION` / `?v=`).
- **Cero-pérdida**: limpiar lo viejo JAMÁS rompe un flujo vivo (lead, chat, pago). Verifícalo end-to-end.

## 5. Distribución máquina vs humano (anti sobre-ingeniería — L-50)
- **Gate mecánico (determinista, automatizado, FALLA)**: `deadcode:check` (functions diff) · tombstones de flags · (con ESM, knip).
- **Juicio humano/agente**: revisar logs de cuarentena · la DECISIÓN de borrado (en un PR). NUNCA borrado automático.
- El workflow de agentes (`auditoria-codigo-viejo`) corre **BOUNDED** (roles foreground, NO fan-out que cuelga): la maquinaria anti-fallos no puede ser ella misma una fuente de fallos.

## 6. Procedimiento al estrenar (la rutina, cada cambio)
1. ¿Qué código VIEJO reemplaza esto? Lístalo (IAP §3.4.C).
2. Recorre el camino vivo **con el MOTOR ACTUAL** (no el planeado) — la clase de bug que se escapa.
3. Cuarentena lo viejo (`_legacy/` / IAM-revoke), no lo borres.
4. Corre el gate (`deadcode:check` + grep de referencias).
5. Verifica completitud de deploy (todos los targets).
6. Un humano borra lo cuarentenado tras logs limpios, en un PR.

## 7. Salida (veredicto citable, no "OK")
`viejo retirado/cuarentenado: [X] · deadcode:check: [0 huérfanas / N] · camino vivo con motor actual: [OK/FALLA] · deploy completo: [sí/no]`.
