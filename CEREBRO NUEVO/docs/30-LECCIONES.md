# 🧪 30 — MEMORIA PROCEDIMENTAL (Lecciones · Anti-patterns · Recetas)

> **Nodo neuronal: la EXPERIENCIA del cerebro.** Aquí vive lo que un humano
> experto "ya sabe por haberse quemado": gotchas, trampas, recetas que funcionan.
> Es lo que evita el **reproceso** y la **regresión** — el corazón del
> auto-aprendizaje.
>
> **Cuándo leerlo (Trigger de Experiencia, `CLAUDE.md §G.2`)**: ANTES de una
> operación riesgosa o repetitiva (mover archivos, merges, tocar cache, refactor),
> y SIEMPRE que un síntoma "me suena". No se auto-carga.
>
> **Cómo crece (Reflejo de Captura, `CLAUDE.md §G.4`)**: cada vez que algo falla,
> sorprende o se resuelve de forma no-obvia, el constructor (Claude) APENDE aquí
> una lección — formato: **Síntoma/Contexto → Causa → Receta → Cómo evitarlo** —
> ANTES de cerrar la tarea. Bajo su juicio: solo lo reutilizable, no ruido.
>
> **Formato de IDs**: `L-NN` para lecciones operativas; `M-NN` para meta-aprendizajes
> (fallos del propio cerebro / cómo razona). El linter valida que las refs `L-NN`/`M-NN`
> usadas en otras neuronas estén definidas aquí.

---

## 🔧 Operaciones de Git / refactor

> _(vacío — apender lecciones a medida que surjan. Ejemplos de gotchas comunes a esperar:
> conflictos de merge en archivos auto-generados, `sed -i` corrompe line-endings en Windows,
> mover archivos sin actualizar todas las referencias, refs `origin/*` stale sin `git fetch`.)_

---

## 🌐 Frontend / runtime

> _(vacío — apender lecciones del runtime cuando ocurran. Ejemplos a esperar:
> service workers sirviendo código viejo, listeners acumulados por re-render,
> lazy-loaded modules undefined al click, especificidad CSS de tema legacy.)_

---

## 🔥 Backend / infra / entorno

> _(vacío — apender lecciones de backend cuando ocurran. Ejemplos a esperar:
> errores de auth en local por restricciones de referrer, deploys que no aplican
> reglas automáticamente, secrets que rotan sin avisar.)_

---

## 🗂️ Validación de código muerto

> _(vacío — apender el protocolo que adopten para confirmar dead code antes de borrar.
> Ejemplo de regla universal: cero refs internas + cuarentenar a `_legacy/` en vez de borrar.)_

---

## 🪞 Meta: fallos del propio cerebro (Reflejo de Autocrítica `CLAUDE.md §G.4`)

> El cerebro se critica a SÍ MISMO: dónde una neurona/regla **causó un error o me
> engañó**, y qué se corrigió. Cierra el bucle: usar → criticar → corregir = madurez.
> Formato: **Defecto del cerebro → Causa → Corrección → Principio**.

> _(vacío — apender meta-aprendizajes cuando un error revele un hueco en el cerebro.
> Ejemplos universales a esperar:
> - M-XX · Confiar en `origin/*` local sin `git fetch` → afirmé estado de despliegue falso.
> - M-XX · "Verifica, no asumas" es UNIVERSAL, no solo RCA de código.
> - M-XX · Lo verificable va al LINTER que falla, no a un reflejo que debo recordar.)_

---

> Esta neurona crece sola (bajo guía del constructor). Si una lección se vuelve
> doctrina permanente, promoverla a `CLAUDE.md §3`. Si encaja en un § histórico,
> enlazarla. Mantenerla accionable: síntoma → causa → receta.
>
> **📏 Capacidad (`CLAUDE.md §G.5`): ~350 líneas.** Al acercarse, SHARD por categoría
> → ej. extraer la sección "Git / refactor" a `docs/31-LECCIONES-GIT.md`, registrarla
> en `CLAUDE.md §0` + `00-INDICE`, y dejar aquí un puntero a la hija. Nada huérfano.
