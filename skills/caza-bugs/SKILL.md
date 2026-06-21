---
name: caza-bugs
description: Usar al TOCAR o ROZAR un subsistema con estado observable (render, listener/onSnapshot, CRUD, flujo de pasos) — editarlo, refactorizarlo con cambio de comportamiento, o cambiar el estado compartido (doc de base de datos, sessionStorage, caché) que otro flujo lee — ANTES de darlo por bueno. Recorre su CAMINO VIVO end-to-end, en especial las dos fronteras del estado-cero (crear el 1er ítem y verlo aparecer; borrar el último y ver colapsar limpio), no solo el cambio puntual. Encapsula el reflejo barato siempre-on y la escalera de escalado calibrada (revisión adversarial + comité + consejo externo) sin gastar de más en lo trivial. NO es para depurar un fallo ya reproducible (eso es systematic-debugging) ni para el gate de evidencia del claim final (verification-before-completion). Triggers — "verifica que no rompí nada", "probé el cambio pero no el flujo", "edité X y lo di por bueno", "esto se rozó con Y", "antes de cerrar/commitear esta funcionalidad".
---

# 🐛 Caza-bugs — recorrer el camino vivo de lo que tocas, no solo tu diff

> Nace de un bug real: edité un módulo de render bajo UNA lente, lo di por bueno, y nunca
> probé "crear el 1er ítem → ¿aparece?". El bug solo emergía desde CERO ítems. La lección no
> fue "faltó maquinaria pesada" — fue que faltó el chequeo BARATO de 30 segundos.
> PORTABLE: cero rutas de un repo; adapta al stack del proyecto activo (lee su cerebro).

## 0. Cuándo aplica / cuándo NO
- **SÍ**: al MODIFICAR o ROZAR un subsistema con estado observable por el usuario.
- **NO**: un bug YA reproducible → `systematic-debugging`. El claim final "hecho/pasa" →
  `verification-before-completion`. Edit trivial sin camino de usuario (copy, color, refactor
  puro sin cambio de comportamiento).

## 1. La Ley (siempre-on, casi gratis)
Toco/rozo una pieza → mi unidad de verificación es el **CAMINO VIVO end-to-end que pasa por
ella**, NO "mi cambio quedó como yo quería". Mirar la pieza con una sola lente (la del cambio)
es exactamente como se escapan los bugs.

## 2. Checklist del estado-cero (el filo — lidera con esto)
La clase de bug nº1: el contenedor se **ACTUALIZA** pero nunca se **CREA** cuando arranca vacío.
Recorre las **dos fronteras** + la carrera de carga:
- **vacío → 1**: crea el 1er ítem. ¿Aparece en vivo? ¿Persiste tras **recarga dura**? (el 1er
  paint suele ser async-vacío — si el render no monta el contenedor vacío, el refresh no puede
  crearlo y el ítem nunca aparece).
- **N → vacío**: borra el último. ¿La vista colapsa limpio, o queda un contenedor/encabezado
  huérfano?
- **carrera de carga**: ¿el listener puede llegar ANTES de que monte el DOM? ¿doble render por
  dos listeners?
Los demás estados (lleno, idempotencia/re-montar) son secundarios; no diluyas el filo en una
lista de QA genérica.

## 3. "Rozar" — el disparador (con su frontera)
- **SÍ dispara** si mi diff cambia una entrada/salida/contrato, **O el estado compartido** (doc
  de BD, sessionStorage, caché) que **otro** subsistema lee — aunque no edite su archivo.
- **NO dispara**: color, copy, refactor puro sin cambio de comportamiento, edición mecánica.
- **Alcance (regla de parada, anti-infinito y anti-atrofia)**: recorre hasta el primer punto
  donde el usuario VE el efecto de mi cambio, **+ un salto a quien comparte mi estado**. No el
  producto entero; tampoco solo mi pantalla (ese fue el error original).

## 4. Ejecutar > razonar — y donde lo caces, blíndalo
Prefiere **EJECUTAR** el camino (emulador / preview / correr el flujo) sobre razonar que
"debería funcionar" — razonar fue lo que falló. Donde el preview no pinte lo dinámico, traza el
flujo por código de forma **adversarial** (¿qué monta el nodo? ¿quién dispara el refresh? ¿en
qué orden?), no una sola pasada complaciente. **Donde caces el bug, blíndalo con un test del
estado-cero** (p. ej.: `renderX()` con 0 ítems emite el contenedor que `refreshX()` puede
poblar) vía `test-driven-development` — ese test es el único gate mecanizable real.

## 5. Escalar (no gastar de más — CITA a los dueños, no redefinas)
- **N0 — reflejo barato (default, ~90%)**: el checklist §2 + auto-crítica de una pasada. Lo
  trivial se queda aquí; subir "por si acaso" es gastar peor.
- **N1 — maquinaria pesada (SOLO no-trivial / caro de revertir)**: el bug toca dinero/datos/
  seguridad, cruza varios subsistemas, el síntoma no encaja, o es caro de revertir →
  `systematic-debugging` (síntoma no encaja) → `dispatching-parallel-agents` / fan-out
  adversarial (multi-subsistema) → `comite-expertos` + consejo externo para DECISIÓN con
  consecuencias. El criterio de "cuándo comité" lo manda la doctrina del proyecto, no esta skill.
- **Freno**: 2 fallos en el MISMO bug → DETENTE, busca el caso análogo en el historial antes del
  3er intento (prohibido adivinar).

## 6. Salida
Un veredicto **concreto y citable**, no un "OK" genérico:
`camino vivo recorrido: [vacío→1 OK · N→vacío OK · recarga OK]` — o `FALLA en [estado]`. Si
escalé, a qué nivel y por qué.
