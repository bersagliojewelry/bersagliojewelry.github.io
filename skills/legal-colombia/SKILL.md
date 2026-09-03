---
name: legal-colombia
description: "Guardrail + método para CUALQUIER tarea legal de un negocio COLOMBIANO (e-commerce, joyería, datos personales). Garantiza que todo lo legal se haga en marco jurídico de COLOMBIA, con investigación profunda en fuentes oficiales (.gov.co), NUNCA con plugins extranjeros. GATILLOS OBLIGATORIOS: redactar/revisar términos y condiciones, política de privacidad / tratamiento de datos / habeas data, aviso de privacidad, política de cookies, política de devoluciones/garantías/retracto, política de envíos, contrato, 'es legal esto', cumplimiento normativo, derecho de retracto, garantía legal, reversión de pago, datos personales, Ley 1581, Ley 1480, SIC, RUCOM, lavado de activos / SARLAFT / SAGRILAFT, UIAF, factura electrónica, IVA, DIAN, registrar base de datos / RNBD. Dispara TAMBIÉN como guardrail si se va a usar un skill/plugin legal extranjero para contenido del sitio o del negocio: DETENTE y usa este marco colombiano. NO disparar para temas legales de OTRO país explícitamente solicitados."
actualizada: 2026-09-02
reglas: 6
lecciones: []
origen: propia
---

# ⚖️ Legal Colombia — guardrail + método

> **Por qué existe:** los plugins legales cargados (`legal:*`, `legalzoom:*`, etc.) están hechos
> para **EE.UU. / marco corporativo general** y **excluyen explícitamente la ley no-estadounidense**.
> Usarlos para el contenido legal de un negocio colombiano produciría texto de **jurisdicción
> equivocada** en el sitio. Esta skill garantiza que TODO lo legal se haga en **marco colombiano**.

---

## 🛑 Guardrail (lo primero, SIEMPRE)

Si estás por usar un skill/plugin legal extranjero (`legal:review-contract`, `legalzoom:*`,
`small-business:contract-review`, o cualquier herramienta cuyo marco sea US/EU/general) para
**contenido legal del sitio o del negocio colombiano** → **DETENTE**. No produce derecho colombiano.
Usa este método. (Puedes usar esos plugins solo si el usuario pide EXPLÍCITAMENTE un asunto de OTRO país.)

---

## 📚 Método (en orden)

1. **Lee el lóbulo legal del proyecto PRIMERO** si existe (su número varía por proyecto, p.ej.
   el lóbulo legal del proyecto, si existe): marco colombiano curado — Ley 1480, Ley 1581, RUCOM, SAGRILAFT, DIAN/IVA,
   páginas legales del sitio, TODOs `LEGAL-NN`. Si el proyecto no tiene lóbulo legal, ve directo al paso 2.
2. **Investigación profunda con agentes/workflow** (directiva del cliente: *siempre, con workflows y
   agentes*). Para algo sustantivo (redactar una política, decidir cumplimiento, verificar un
   umbral), despacha subagentes que verifiquen en **fuentes OFICIALES** `.gov.co`:
   funcionpublica.gov.co · secretariasenado.gov.co · **sic.gov.co** (consumidor + datos) ·
   **dian.gov.co** (tributario/factura) · **supersociedades.gov.co** + **uiaf.gov.co** (LA/FT) ·
   **anm.gov.co** (RUCOM/minerales). **Nunca** de memoria ni de plugins extranjeros. Marca lo no
   verificado como **[a verificar]**.
3. **Produce SIEMPRE en marco colombiano**, citando la norma (Ley/Decreto Nº y año) + fuente oficial.
4. **Disclaimer obligatorio** (del lóbulo legal del proyecto, si existe): esto es **orientación, NO asesoría legal**;
   antes de **publicar** texto legal o decidir cumplimiento, **validar con un abogado colombiano**.
5. **Es Decisión Fuerte** (ver la doctrina de comité del proyecto + el nodo de Consejo Externo, p.ej. `docs/15-CONSEJO-EXTERNO.md`): redactar/decidir algo
   legal sustantivo → activa **Comité ×3** + prepara **2ª opinión externa** (provider configurado, docs/15).
6. **Captura** lo nuevo en el lóbulo legal del proyecto (Reflejo de Frescura; créalo si no existe — Trigger 🔵). Tarea legal grande cerrada →
   ADR en `99` + fila en `00-INDICE`.

---

## ⚠️ Señales específicas de Colombia que un marco extranjero ignora (no las pierdas)

- **Retracto (Ley 1480 Art. 47):** 5 días hábiles; pero piezas **a la medida/personalizadas NO admiten
  retracto** — clave en joyería; advertirlo.
- **Habeas Data (Ley 1581):** **consentimiento tácito PROHIBIDO** — autorización previa, expresa, informada.
- **Habeas Data en la INTERFAZ, no solo en el papel (regla operativa, 2026-08-21):** la autorización
  solo vale si es **informada**, y eso se juzga por lo que el titular VIO, no por lo que quedó
  guardado. Tres formas de romperlo sin darse cuenta: (a) el texto legal se guarda **partido en
  fragmentos** para poder enlazar documentos, y una plantilla pinta la mitad — la frase termina en
  «conforme a su» y suena completa; (b) la casilla viene **premarcada** o el envío se acepta sin ella
  (el silencio jamás equivale a autorización, D.1377/2013 art. 7); (c) el correo periódico **no lleva
  salida**, cuando revocar debe ser tan fácil como autorizar (Ley 1581 art. 8 lit. e). **Verificación
  barata que caza (a):** compara el `textContent` renderizado contra la cadena completa que se archiva
  como prueba; si no coinciden carácter a carácter, lo que se firmó y lo que se enseñó no son lo
  mismo. Y guarda con cada aceptación la **versión del texto** más fecha, IP y user-agent: una
  autorización que no se puede probar equivale a no tenerla.
- **Palabras que nombran una PROFESIÓN REGULADA (regla operativa, 2026-08-21):** en Colombia varias
  actividades solo puede ejercerlas quien está inscrito en un registro, y **usar su nombre en la
  publicidad ya es ejercerla a ojos del regulador**, aunque por dentro sea otra cosa. El caso que más
  se repite en inmobiliaria es **«avalúo»** (Ley 1673/2013: solo avaluadores inscritos en el **RAA**);
  la misma lógica cubre «perito», «auditoría» o «asesoría jurídica» ofrecidas por quien no lo es.
  **La señal de alarma es el combo `gratis` + `nuestro`**: si lo regalas es porque no lo estás
  encargando a un profesional inscrito, y entonces lo que ofreces no es eso. **Qué hacer:** (1) di
  «valoración», «estimación» o «rango», nunca el término regulado; (2) acompáñalo del aviso de que
  **no tiene validez legal** y de a quién acudir si hace falta el documento; (3) distingue dos casos
  al auditar un sitio — el texto que describe *tu propia estimación* se corrige sin preguntar a nadie,
  mientras que el que **reclama una línea de servicio** («ofrecemos avalúos») depende de un HECHO
  (¿lo contratas a un inscrito?) que solo tiene el dueño: ahí no reescribas, pregunta. **Trampa
  frecuente:** el sitio ya tiene una página que lo hace BIEN y otra que lo hace mal — dos páginas
  ofreciendo lo mismo con nombres distintos es la firma de este defecto, y la buena te da el texto.
- **RUCOM (ANM):** comercializar oro/esmeraldas sin registro o sin certificado de origen → **decomiso**.
- **SAGRILAFT / UIAF:** la joyería es **sector de alto riesgo de lavado**; obligaciones según umbral de tamaño.
- **IVA 19%** sobre joyería terminada (no asumir exclusión del oro). **Factura electrónica DIAN** obligatoria.

---

- **El SILENCIO de un reglamento NO es un permiso (regla operativa, 2026-08-26).** Caso canónico:
  alojamiento turístico en propiedad horizontal — el reglamento debe autorizarlo **previamente y de
  manera expresa** (D.1074/2015 art. 2.2.4.1.2.2 num. 8, confirmado por el Consejo de Estado; la
  destinación de unidades privadas la manda el reglamento, Ley 675/2001 art. 18 num. 1, con sanción
  en el art. 59). *«No lo prohíbe»* y *«lo autoriza»* son cosas distintas, y la ley pide la segunda.
  **Cómo se rompe sin darse cuenta**: modelar el permiso como un **booleano**. Ausente o `false`
  mezcla «me dijeron que no» con «nadie lo preguntó», y el estado por defecto acaba siendo el
  permisivo. **Regla portable**: cuando la ley exige autorización EXPRESA, el modelo lleva **tres**
  valores —`no-aplica` · `autoriza-expreso` · `sin-autorizacion`— y el silencio se archiva en el
  tercero. *Un tipo debe obligar al estado peligroso a decir su nombre.*
- **Declarar vs. verificar: mira en cabeza de QUIÉN puso la ley el deber (regla operativa,
  2026-08-26).** Antes de exigirle documentos a un cliente, comprueba si la norma te obliga a ti a
  comprobarlos o si obliga al prestador a declararlos. En el caso PH la declaración es del prestador
  y **ninguna norma obliga a la plataforma a leerse cada reglamento**: pedir copia de todos habría
  sido inventarse un deber y frenar el inventario. Pero la declaración **se guarda con fecha**,
  porque el riesgo propio de la plataforma llega por otro lado (publicidad engañosa, Ley 1480) y
  porque una declaración sin fecha no es evidencia de nada. **Y deja el campo del documento creado
  desde el día 1** aunque hoy nadie lo mire: si el borrador de norma que ya circula convierte la
  declaración en PRUEBA, el cambio es llenar un campo y no migrar un modelo.
- **La web pública es una fuente de requisitos legales que tu propio backoffice suele incumplir
  (regla operativa, 2026-08-26).** Si una página tuya le dice al cliente «comprueba X antes de
  comprar», tu formulario de alta tiene que preguntar X. Pasó literal: `/invertir` exigía verificar
  la autorización del reglamento y el alta solo pedía el RNT. **Barrido barato**: extrae del HTML
  servido las frases en imperativo o con «debe/exige/autorice» y contrástalas una a una con los
  campos que el sistema pide de verdad. Aconsejar lo que no se comprueba es la forma más cara de
  tener razón.

- **Antes de escalarle algo al cliente, pregúntate si falta una ELECCIÓN o una CALIFICACIÓN (regla
  operativa, 2026-08-26).** Una elección entre opciones legalmente válidas es suya; determinar bajo qué
  régimen cae un acto es tuya, y disfrazarla de «decisión del cliente» le pasa trabajo tuyo y bloquea
  el proyecto. Caso: dos documentos del mismo kit liquidaban la mora a tasas distintas y llevaban
  meses marcados como «decisión pendiente del dueño». No lo eran: uno es un **mandato mercantil** y el
  otro un **arrendamiento de vivienda**, dos regímenes distintos, y **cada documento ya llevaba la
  tasa del suyo**. Lo que faltaba era una cláusula que explicara la diferencia.
  **Corolario**: una divergencia entre dos documentos NO es automáticamente una incoherencia — puede
  que hablen de obligaciones distintas. Antes de unificarlas, pregunta si son la misma obligación; si
  no lo son, unificarlas es el error, y lo que toca es explicar por qué difieren.

- **«¿Aplica esta ley?» suele estar MAL PLANTEADA: pregunta por la JERARQUÍA, no por sí/no (regla
  operativa, 2026-08-26).** Muchas leyes marco definen su propio lugar frente a los regímenes
  especiales, y esa cláusula decide el caso entera. El Estatuto del Consumidor colombiano lo dice en su
  art. 2: sus normas aplican en los sectores *«respecto de los cuales no exista regulación especial,
  evento en el cual aplicará la regulación especial y **suplementariamente** las normas establecidas en
  esta Ley»*. Luego para un arriendo de vivienda urbana —que tiene régimen propio, Ley 820 de 2003— la
  respuesta no es «sí» ni «no»: es **supletoria**. **Método**: antes de razonar sobre el fondo, busca el
  artículo de ámbito de aplicación de la ley marco; muchas veces la respuesta está ahí y ahorra la
  discusión entera.
  **Y la consecuencia práctica que más se olvida**: si la ley marco NO gobierna, **no publiques la
  página que anuncia sus derechos**. Prometer un derecho que en ese contrato no opera es peor que no
  mencionarlo. Busca cuál es la protección que sí muerde en el régimen especial y comunica esa.

## Prueba social FABRICADA en una maqueta que ya es pública (Ley 1480, arts. 29-30)

Las réplicas de mockup llegan con reseñas, ratings y anfitriones de relleno. En cuanto esa página es
alcanzable —enlazada desde un menú, indexable, compartible— dejan de ser *placeholder* y pasan a ser
**publicidad engañosa**: un testimonio con nombre y fecha afirma que una persona real dijo eso.

- **No lo cura etiquetarlo.** «Ejemplo» o «datos de muestra» se pierde en una captura de pantalla; la
  reseña no. Tampoco lo cura el `noindex`: un enlace en el menú principal ya es publicación.
- **Cúralo sin perder el diseño**: haz la sección **dependiente de datos** y pásale una lista vacía.
  Con `[]` no se pinta; el día que haya reseñas reales vuelve sola con el diseño aprobado intacto.
  Borrarla obliga a rehacer la UI —y a re-aprobar el mockup— cuando lleguen los datos.
- **Qué cuenta como fabricado**: nombres de personas, fechas, notas y conteos («4.97 · 128 reseñas»),
  sellos de verificación, años de antigüedad, tiempos de respuesta. El texto de una amenidad no; una
  cifra que se lee como medición, sí.
- **Tres clases de cifra, tres tratamientos.** Una **medición de mercado** («+7% de valorización»)
  sin fuente citable pasa a ser TU afirmación, y quien invierta por ella te la reclamará a ti. Un
  **hecho comprobable** («128 verificadas») o es verdad o es falso, y el visitante puede contarlo. Un
  **compromiso** («respondemos en 5 minutos») es verdad si lo cumples — pero etiquetarlo como
  «promedio» lo convierte en un dato que nadie mide. Reetiquétalo como promesa: obliga, y es honesto.
- **Ponle gate.** No prohíbas cifras: exige que cada una se declare con su fuente en un archivo que
  el CI lee. Una cifra que nadie quiere firmar es exactamente la que no debería estar publicada.
- **Al quitar una cifra, arregla la copia que la enmarcaba.** Un titular «Los mejor valorados» sin
  notas detrás sigue afirmando un ranking: cablear los datos y dejar el titular cambia una mentira
  por otra.
- Aplica igual a `sameAs`, a `aggregateRating` en el JSON-LD y a los logos de «confían en nosotros».
  El buscador los trata como afirmaciones, y las penaliza cuando no las respalda nada.
- **Censa la superficie PUBLICADA, no la carpeta.** Barrer los archivos del disco mete falsos
  positivos (lo `gitignored` no está publicado) y puede perderse lo que genera el build. Mide lo que
  el mundo alcanza: `git ls-files` en un sitio estático, `dist/` + `sitemap.xml` en uno construido.
  Y **di cuántos archivos abriste**: sin ese número, «limpio» y «no lo miré» se escriben igual.
- **Extiende el censo a las propiedades HERMANAS del mismo dueño.** Suelen nacer del mismo mockup y
  heredan las mismas cifras de relleno — pero **están vivas e indexadas**, así que su exposición es
  HOY, no el día del lanzamiento. La prioridad se invierte respecto de dónde estás trabajando.
- **Cuenta el ALCANCE antes de calificar la gravedad.** Una cifra dentro de un componente compartido
  (un pie, una cabecera, un parcial inyectado por JS) se multiplica por cada página que lo incluye:
  una línea puede ser la afirmación más repetida del sitio. Busca **dónde se inyecta**, no dónde vive.
- **El remedio más barato casi nunca es borrar: es CITAR.** Si la cifra es externa y verdadera
  (reseñas de Google, un registro público), un enlace a la fuente **traslada la afirmación al
  tercero**: deja de ser tu palabra. Cuesta un `<a href>`, no un rediseño ni una decisión de negocio.
  Solo cuando no hay fuente citable llega la disyuntiva cara (sustituir por lo contable, o retirar).
- **El riesgo NO está donde la página parece jurídica.** Lo que se ve peligroso —un simulador de
  crédito, una página de términos— suele llegar blindado: gate de aceptación, «no constituye oferta»,
  cifras marcadas como referenciales. Lo que viaja sin nada es lo que **nadie clasificó como
  afirmación**: una estrellita en el pie, un contador en un «nosotros». Empieza por ahí.
- **Un pendiente sobre una cifra que vive en un SPEC no se cierra.** Las secciones tipo «decisiones
  diferidas / a confirmar en review» se archivan con la fase, y sus preguntas abiertas se archivan
  marcadas como decididas por el mero hecho de estar escritas. Al cerrar una fase, **esas líneas se
  mudan al ledger** (con su ID y su gate) o no se difirieron: se abandonaron — y salen a producción.

## 🧮 DOS unidades de cuenta, y usar la equivocada es un error de fondo

Colombia indexa sus cifras legales a unidades, no a pesos — y desde 2023 hay **dos**. Confundirlas no
produce un número «un poco distinto»: produce uno que no corresponde a la norma que estás citando.

| Unidad | Para qué | Quién la fija |
|---|---|---|
| **UVT** — Unidad de Valor Tributario | **Tributario, aduanero y cambiario**, y solo eso | DIAN, resolución anual |
| **UVB** — Unidad de Valor Básico | **Todo lo demás**: multas, sanciones, umbrales de vigilancia, clasificación de empresas, requisitos de operación | **MinHacienda** (no DIAN), resolución anual |

La **UVB** la creó el **art. 313 de la Ley 2294/2023** (PND), reemplazando el art. 49 de la Ley
1955/2019, y se ajusta por **IPC sin alimentos ni regulados** (DANE) — no por el salario mínimo. Ése
es su propósito: **desindexar del SMMLV** para que subir el mínimo no dispare automáticamente multas y
tasas. ⚠️ Por eso una norma vieja expresada en SMMLV puede haber sido **reexpresada en UVB** sin que
cambie nada más: si el umbral que citas está en salarios mínimos, comprueba que no lo hayan migrado.

**Verificación barata de un valor anual**: multiplica el del año anterior por el IPC del año y mira si
te da. Si el trío (valor previo, IPC, valor nuevo) es mutuamente consistente, tienes una corroboración
que un número inventado no supera.

## 🏛️ Impuestos DEPARTAMENTALES: la ordenanza manda, pero la ley nacional le pone banda

Las asambleas fijan la tarifa, así que **cambia por departamento** y hay que leer su ordenanza. Pero
—y esto salva muchas horas— la ley nacional acota el rango, así que **siempre puedes dar una cota
verificada aunque no consigas la ordenanza vigente**:

- **Impuesto de registro** (Ley 223/1995 art. 230): actos **con cuantía** en Oficina de Registro de
  Instrumentos Públicos **entre 0,5 % y 1 %**; en Cámara de Comercio **entre 0,3 % y 0,7 %**; **sin
  cuantía**, un número de salarios mínimos diarios. Si la ordenanza que leíste dice **1 %**, está en el
  techo legal: cualquier versión posterior será igual o menor.
- **Base gravable de inmuebles**: el valor del documento, y **nunca inferior al avalúo catastral**
  (o autoavalúo / remate / adjudicación). No se «ajusta» a la baja.
- **Quién paga**: los sujetos pasivos **por partes iguales, salvo manifestación expresa en contrario**.
  Ese *«salvo pacto»* es la puerta — pero hay que **escribirlo**, porque el default es mitades.
  🔴 **Y ese default es DE ESE IMPUESTO, no de la factura.** Es la trampa de esta lista entera: la
  regla de mitades sale de la ley que crea el impuesto de registro, así que **no alcanza a la
  estampilla** —otro tributo, de otra norma— ni a lo notarial. Caso real: una tabla publicada sumaba
  los dos tributos y partía el TOTAL por dos, citando como respaldo una norma que gobierna uno solo.
  🎯 **Una regla correcta aplicada a una base más ancha que la suya deja de ser correcta — y la cifra
  que sale no se ve mal, se ve cómoda.** Antes de repartir, pregunta de qué tributo habla la norma que
  vas a citar; si no encuentras la que reparte el otro, **dilo** en vez de extender la que tienes.
- **Sin recibo de pago no hay registro.** Es un bloqueo de cronograma, no un trámite posterior.
- **Un acto que va a ORIP y a Cámara de Comercio genera el impuesto SOLO en la ORIP.** Y un documento
  con varios actos se liquida **acto por acto**.

**🔴 Estampillas: no asumas que solo gravan contratos con el Estado.** La mayoría sí (obra,
interventoría, suministro con el departamento), pero **algunas gravan la boleta de registro** de actos
entre particulares — y ésa se suma al impuesto de registro sobre la misma base. **Lee el hecho
generador de CADA estampilla del estatuto, una por una**: es la diferencia entre estimar el 1 % y el
2 %. Y ojo a los **escalones**: una tarifa por tramos (p. ej. 0,5 % hasta N salarios y 1 % por encima)
crea un acantilado donde un peso de más cuesta cientos de miles. Se **informa**, no se elude: declarar
por debajo del precio real es fraude, y además la base no puede bajar del avalúo catastral.

## 🕵️ Vigilancia: antes de repetir un «no somos sujeto obligado», comprueba que la norma siga viva

Los regímenes de la Superintendencia de Sociedades **se reescriben**. La **CE 100-000020 (2-jul-2026)**
unificó **SAGRILAFT** (antiguo Cap. X) y **PTEE** (Cap. XIII) en un **Capítulo IX** único, y reexpresó
los umbrales **en UVB**, con transición hasta el **31-may-2027**. Un «no estamos obligados» sustentado
en la circular derogada no vale, aunque la conclusión siga siendo cierta.

**Cómo se comprueba bien**: (1) los umbrales se miden sobre **ingresos totales O activos totales al
31 de diciembre del año inmediatamente anterior** — no sobre el año corriente; (2) hay varios
regímenes y el que ata es **el más bajo**, así que discusiones sobre en qué sector clasificas suelen
ser irrelevantes si el piso general es menor; (3) es **aritmética, no doctrina**: se **recalcula cada
año**, y en una empresa que crece el margen se estrecha por arriba; (4) si el grupo opera con **más de
un NIT**, cada sociedad se evalúa por separado.


## 🔌 Qué fuentes oficiales se pueden LEER de verdad (mapa medido, no teórico)

La regla dice «norma en fuente oficial `.gov.co`». En la práctica **la mitad de esas fuentes no se
deja leer por herramienta**, y descubrirlo cuesta media hora cada vez. Este mapa se midió el
2026-08-26 intentando verificar un solo artículo del Código Civil.

| Fuente | ¿Se lee? | Cómo |
|---|---|---|
| **`funcionpublica.gov.co/eva/gestornormativo/norma.php?i=NNNN`** | ✅ **la mejor** | HTML plano. Leyes completas. Empieza SIEMPRE por aquí |
| Gacetas y PDF de **asambleas departamentales** | ✅ suele ir | PDF **con capa de texto**: descárgalo y extráelo (`pypdf`), no lo leas por el navegador |
| **`minhacienda.gov.co`** (resoluciones) | ⚠️ existe pero **escaneado** | El documento es real; el texto NO se puede extraer. Sirve para probar que la norma existe, no para citarla literal |
| **`igac.gov.co`** (PDF de códigos) | ❌ escaneado | 283 páginas de imagen, cero capa de texto |
| **`alcaldiabogota.gov.co/sisjur`** | ⚠️ trunca | Documento correcto, pero de un código largo solo devuelve el principio: sirve para el Libro I, no para el 756 |
| **`secretariasenado.gov.co`** | ❌ hoy no | Conexión rechazada |
| **`suin-juriscol.gov.co`** | ❌ hoy no | La conexión se cae |
| `cijuf.org.co` · `ambitojuridico.com` | ❌ | 403 |
| Bufetes y publicaciones especializadas | ✅ útil **como corroboración** | Nunca como cita única: son secundarias |

**Cómo usar esto sin bajar el listón.** El orden que funciona: (1) Gestor Normativo de Función
Pública; (2) el PDF oficial **si tiene capa de texto**; (3) dos fuentes secundarias independientes que
**coincidan en la cifra o el texto**. 🎯 **Y si ninguna deja leer la norma, la salida honesta es NO
publicar la afirmación** — no citar una URL que no abriste. Un artículo cuya premisa dice «cada
afirmación con su norma citada» y cita una norma que nadie leyó destruye exactamente lo que promete.
**«No pude verificarlo» es un resultado**, y se dice.


## Cuándo NO usar esta skill

- El usuario pide explícitamente un asunto legal de **otro país** (ahí sí los plugins extranjeros aplican).
- Pregunta trivial no-legal. (Pero ante la duda sobre legalidad/cumplimiento, dispárala.)
