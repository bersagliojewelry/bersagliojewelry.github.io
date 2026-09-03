---
name: acceso-y-autenticacion
description: Diseñar o auditar el sistema de ingreso de una aplicación — puerta única, segundo factor, sesión, alta y baja de usuarios, bitácora, recuperación. Úsala ANTES de escribir una pantalla de login, cuando alguien dice que el acceso «es muy básico», o cuando haya que decidir entre roles, MFA, passkeys o proveedores sociales. Incluye las trampas que solo se ven probando el sistema, no leyéndolo.
actualizada: 2026-09-02
reglas: 24
lecciones: []
origen: propia
---

# 🚪 Acceso y autenticación

> **Qué es**: las reglas que valen en CUALQUIER proyecto para que una puerta de ingreso sea seria.
> No es una guía de Firebase — los ejemplos vienen de ahí porque de ahí salieron las cicatrices, pero
> cada regla se sostiene sola.
>
> **La idea que ordena todo lo demás**: un sistema de acceso no se audita leyéndolo, se audita
> **usándolo**. Cuatro de las reglas de abajo son invisibles en el código y solo aparecen cuando
> alguien intenta entrar de verdad.

---

## A. Antes de dibujar nada

### A-1 · Pregunta primero QUIÉN, después la prueba (identifier-first)
El paso 1 pide solo el identificador (correo/usuario). Con él el sistema decide qué exigir en el paso 2:
al cliente, poco; al operador interno, mucho. **El paso 1 se ve idéntico para todos** — un formulario que
muestra «usuario + contraseña» de golpe le dice a quien pase qué clase de cuenta encontró y le deja probar
combinaciones sin coste. Además evita mantener dos pantallas de login con dos comportamientos que se
desincronizan (siempre se desincronizan).

### A-2 · Una puerta, varios niveles de exigencia — no varias puertas
Cada puerta extra es un juego de mensajes, límites y recuperaciones que hay que mantener en paralelo.
Diferencia el RIGOR (factores, duración de sesión, canales de recuperación), no la URL.

### A-3 · El canal de recuperación no puede ser también el de ingreso, para cuentas privilegiadas
«Entrar con un enlace al correo» es excelente para un cliente: le ahorra una contraseña que olvidará.
Es inaceptable para quien administra, porque convierte su bandeja de correo en la llave maestra del sistema.
Regla: **magic link sí para el público, nunca para el personal interno.**

### A-4 · Distingue «autenticado» de «autorizado para QUÉ»
Un panel que solo comprueba *«¿eres del equipo?»* le entrega al rol de consulta exactamente lo mismo que
al dueño. Si el modelo de datos ya tiene roles, la interfaz tiene que gastarlos; si no, los roles son
decoración. Comprueba SIEMPRE los dos niveles, y que la frontera real (reglas del servidor) coincida con
lo que la interfaz insinúa.

---

## B. Las trampas que solo se ven probando

### B-1 · ⚠️ Un límite de intentos que vive donde escribe el atacante no es un límite: es un arma
El patrón «contador de intentos fallidos en la base de datos, con el identificador como clave» es común y
está **doblemente roto** cuando el cliente puede escribirlo:
1. **No protege** — quien prueba contraseñas pone su contador en cero antes de cada intento.
2. **Ataca** — cualquiera puede bloquear la cuenta de otro escribiendo `bloqueado: true`, indefinidamente.
   Si la clave del documento es un hash del correo, ese hash lo calcula cualquiera: no es un secreto.

**Y es peor de lo que parece**: convierte una medida de seguridad en una negación de servicio dirigida
contra la persona más importante del sistema, que es la que todo el mundo sabe cómo se llama.
**Qué hacer**: llévalo al servidor, o quítalo y apóyate en el límite de la plataforma (que sí es
inmanipulable). Un candado que solo el atacante puede abrir y solo la víctima sufre, es peor que ninguno.

### B-2 · La configuración de la plataforma es parte del sistema, y NO está en el repositorio
Dominios autorizados, proveedores habilitados, políticas de contraseña, protección contra enumeración:
todo eso vive en una consola web. **Ningún gate, linter o revisión de código puede verlo**, y por eso
produce la clase de fallo más cara: el código es correcto, el botón existe, y no funciona.
Caso real: un botón de «Continuar con Google» impecable en el código, muerto en producción porque el
dominio no estaba autorizado — el error caía en el `default` del traductor de errores y mostraba un
mensaje genérico. **Sonda obligatoria**: consulta la configuración pública por API y púlsalo en vivo.

### B-3 · Verifica el comportamiento de la plataforma antes de codificarlo a mano
Antes de escribir defensas contra la enumeración de cuentas, **comprueba si la plataforma ya la hace**:
pide un enlace de recuperación para una dirección inventada y mira la respuesta. Si responde éxito, la
protección está activa y tu código defensivo es redundante (inofensivo, pero es deuda que confunde).
Si responde «no existe», tienes un oráculo abierto y hay que taparlo en los dos sitios, no en uno.
Vale para todo: **la conducta real de la plataforma es un hecho comprobable, no una suposición.**

### B-4 · Al migrar de sistema, censa lo que el viejo hacía y el nuevo no
Las mudanzas pierden funciones silenciosamente, y las de seguridad son las que menos se echan de menos
porque nadie las usa a diario. Caso real: el panel viejo cerraba la sesión a los 30 minutos de
inactividad; el nuevo no cierra nunca, y nadie lo notó en meses. **Haz la lista del viejo antes de
apagarlo**, no después.

### B-5 · Una bitácora declarada no es una bitácora
Que la colección exista, tenga permisos y esté protegida contra modificación no significa que alguien
escriba en ella. **Busca los puntos de escritura antes de creer que hay registro.** Si no aparecen, no
hay auditoría — hay la ilusión de auditoría, que es peor porque nadie va a buscar más.

### B-6 · ⚠️ Un segundo factor que decide en una variable del navegador NO es un segundo factor
El patrón se repite y siempre convence: primero `signIn(usuario, clave)`, y DESPUÉS una pantalla que
pide un código; al validarlo se pone `_2faVerificado = true` y se muestra el panel.

**Está roto de raíz, y no por un descuido: por el orden.** Cuando aparece la pantalla del código, la
sesión YA existe y ya es válida — el servidor emitió el token al aceptar la contraseña. Las reglas de
la base ven un usuario plenamente autorizado. Lo único que hace el código es cambiar un `display`.
Quien tenga la contraseña entra igual: no pasa por la interfaz y consulta los datos directamente.

**La pregunta que lo desenmascara en diez segundos**: *¿puede existir una sesión válida ANTES de
introducir el segundo factor?* Si la respuesta es sí, no hay segundo factor: hay una cortina.

**Cómo se ve el de verdad.** El proveedor rechaza el login y no entrega NINGUNA sesión hasta que se
resuelve el segundo paso (en Firebase, `signInWithEmailAndPassword` lanza `auth/multi-factor-auth-required`
y devuelve un *resolver*, no un usuario). Y el token resultante **lo dice**: Firebase expone
`firebase.sign_in_second_factor`, así que hasta las reglas de la base pueden exigirlo. Un factor que el
servidor no puede comprobar no protege datos del servidor.

**Señales de que estás ante la versión falsa**, sin leer todo el código:
- El código se verifica con una API de *perfil* (`updatePhoneNumber`, `updateEmail`) en vez de una de
  autenticación. Confirma que la persona controla el teléfono… después de haberla dejado entrar.
- Las reglas de seguridad no mencionan el segundo factor por ningún lado. Si el servidor no lo sabe,
  no lo exige.
- El estado vive en una variable de módulo, no en el token.

### B-7 · «Dispositivo de confianza» por huella del navegador: forjable, y encima es el camino fácil
Para no pedir el código en cada visita se guarda un testigo local. Cuando el navegador lo borra
—iOS lo hace solo a los 7 días— la tentación es reconocer el equipo por su *huella*: agente de usuario,
plataforma, resolución, zona horaria. **Esos cuatro datos los envía cualquiera y los copia cualquiera**:
quien tenga la contraseña y sepa qué computador usa la víctima se salta el segundo factor sin más.
Si el testigo además se guarda en un documento que el propio usuario puede leer, basta con copiarlo.
Un recuerdo de dispositivo debe atarse a algo que el servidor firme, o no atarse a nada.

### B-8 · ⚠️ El orden es **resolver → inscribir → exigir**, y casi todo el mundo se salta el primero
Un segundo factor se despliega en tres pasos, y el que suele faltar es el PRIMERO:

1. **RESOLVER** — que el ingreso sepa terminar cuando la plataforma pide el código.
2. **INSCRIBIR** — que exista una pantalla para activarlo.
3. **EXIGIR** — que las reglas del servidor lo pidan.

Es fácil ver el 2→3 («si lo exijo antes de que nadie lo tenga, dejo a todos fuera») y no ver el 1→2.
El motivo es que **la plataforma no avisa antes**: acepta la contraseña y solo entonces responde «falta
el segundo factor» (`auth/multi-factor-auth-required` en Firebase). El `catch` genérico de un login
normal trata eso como un fallo cualquiera y contesta **«credenciales incorrectas»** — con la contraseña
correcta escrita. La primera persona que se inscriba se queda fuera, y el mensaje la manda a buscar el
problema donde no está.

**Prueba que lo caza en 30 segundos**: antes de que nadie se inscriba, pregúntate *«¿qué mensaje verá
quien SÍ tenga el factor?»* y sigue el camino del error en el código. Si termina en el mensaje genérico,
todavía no puedes inscribir a nadie.

**Corolario**: el resolver hay que ponerlo en **todas** las puertas, no solo en la nueva. Un panel viejo
que sigue vivo es una puerta.

---

## C. Alta, baja y sesión

### C-1 · Nadie inventa la contraseña de nadie
Si el alta de un usuario recibe un campo `password` que teclea otra persona, el diseño está mal: esa
contraseña viaja por un chat, queda ahí para siempre y dos personas la conocen. **Invitación con
caducidad**: se genera una credencial aleatoria que nadie ve, y se envía un enlace de un solo uso para
que la persona elija la suya. Es además lo que exige OWASP ASVS 6.4.1.

### C-2 · Suspender ≠ eliminar, y casi siempre quieres suspender
Si la única salida es «Eliminar» y eso borra la cuenta, el operador se enfrenta a una decisión
irreversible para resolver una situación reversible (unas vacaciones, una sospecha, una salida que
podría revertirse). **Suspender** corta el acceso al instante y conserva el rastro de lo que esa persona
hizo. Eliminar se reserva para cuando de verdad toca.

### C-3 · Quitar el permiso no quita la sesión
Cuando los permisos viajan **dentro** del token (claims, JWT), revocar el permiso en la base de datos no
hace nada hasta que el token expira — típicamente una hora. Hay que **revocar explícitamente** las
sesiones. Y si el proceso de revocación tiene un corte por idempotencia («si nada cambió, salgo»),
la revocación va **antes** de ese corte: si en un intento anterior el permiso se escribió pero la
revocación falló, el reintento saldría por el corte y no revocaría nunca.

### C-4 · Sesión: corta por inactividad, tope absoluto, y revalidación en lo sensible
Tres relojes distintos y los tres hacen falta. El de inactividad protege el equipo desatendido; el tope
absoluto limita el daño de una sesión robada; la revalidación (pedir el token fresco antes de una acción
sensible) es lo que hace que C-3 muerda en segundos en vez de en una hora.

### C-5 · Deja que la persona vea y corte sus propias sesiones
«¿Dónde tengo la sesión abierta?» con un botón para cerrar cada una. Es lo que convierte una duda
—*¿habrá quedado abierto en algún teléfono?*— en una acción. Sin esto, cerrar el acceso de alguien que se
va es un acto de fe.

### C-6 · Inscribir un segundo factor puede CERRAR las demás sesiones — dilo antes, no después
Varias plataformas revocan los tokens de refresco al inscribir un factor (Firebase lo hace y lo
documenta). La persona activa su seguridad y, sin aviso, se le cierra el panel en el otro computador.
Es una consecuencia normal que sin explicación se lee como una avería, y hace que la siguiente persona
no lo active. **Una frase antes del botón** convierte un susto en un trámite.

Lo mismo con **la autenticación reciente**: tocar la seguridad de una cuenta suele exigir volver a
escribir la contraseña. No es un capricho — sin eso, un computador desatendido con la sesión abierta
basta para cambiarle el segundo factor a otra persona. Y ojo: si la cuenta YA tiene factor, esa
re-autenticación **también** pedirá el código, así que el formulario tiene que saber pedir las dos
cosas o deja a la persona en un callejón.

### C-7 · Tiene que haber una vía de rescate, y no puede depender del factor que se perdió
Un segundo factor bien hecho no tiene puerta trasera: quien pierde el teléfono no entra, y eso es lo que
lo hace valer. Pero un equipo sin ninguna forma de rescate termina no activándolo nunca — o peor,
activándolo y quedándose fuera. Tres vías, en orden de preferencia:
1. **Una SEGUNDA aplicación inscrita** (el gestor de contraseñas del computador además del teléfono).
   Es la única que no depende de nadie más.
2. **Un administrador** que pueda retirar el factor de otra persona **desde el servidor**, nunca el suyo
   propio, y **dejándolo escrito** en la bitácora: un rescate silencioso es indistinguible de un abuso.
3. **La consola del proveedor**, con una credencial DISTINTA (la cuenta de la nube). Es la salida del
   dueño, y que sea otra credencial es justamente el aislamiento que se busca.

---

## D. Factores y contraseñas

### D-1 · Aplicación de autenticación, no SMS
El SMS se cobra por mensaje **y** es el factor más débil que existe: se intercepta duplicando la SIM.
Los códigos de aplicación (TOTP) no cuestan por uso y son más seguros. Es de los pocos casos donde lo
barato y lo correcto coinciden — no lo desperdicies.
Entrega los **códigos de respaldo una sola vez**, al activar, y di claramente que son la única salida si
se pierde el teléfono.

### D-2 · Longitud, no complejidad (NIST SP 800-63B-4, agosto 2025)
- Mínimo 8 exigible, **15 recomendado**; soportar hasta 64.
- **Sin** reglas de composición (mayúscula + número + símbolo). Solo producen `Marca2026!`.
- **Sin caducidad por calendario.** Se cambia ante indicio de filtración, no cada 90 días.
- Compara contra listas de contraseñas ya filtradas — eso sí sirve.
- Permite pegar desde el gestor de contraseñas. Bloquear el pegado empeora la seguridad.

### D-3 · El mismo mensaje exista o no la cuenta
En login y en recuperación. «Ese correo no está registrado» convierte el formulario en un detector de
qué direcciones tienen acceso. Trata el error de «no existe» como éxito. Ver también B-3.

### D-4 · Recuperar la contraseña no puede saltarse el segundo factor
Si el enlace de recuperación entrega la sesión directamente, el segundo factor es decorativo: basta con
tener el correo. (OWASP ASVS 6.4.3.)

### D-5 · Avisa a la persona de lo que le pasa a su cuenta
Ingreso desde un dispositivo nuevo, cambio de contraseña, cambio de correo, segundo factor desactivado.
El usuario es el único detector de intrusiones que conoce su propia rutina. (ASVS 6.3.5 y 6.3.7.)

### D-6 · No prometas en la pantalla lo que la plataforma no emite
El caso canónico son los **códigos de respaldo**: casi todo mockup de doble verificación los dibuja, y
varias plataformas —Firebase entre ellas— **no los emiten para TOTP**; no existen en su API. Dibujar
«ver mis códigos de respaldo» y no tenerlos el día que alguien pierde el teléfono es peor que no
ofrecerlos: la persona contaba con una salida que nunca hubo. Lo mismo con la **lista de sesiones por
dispositivo** cuando el proveedor solo permite cerrarlas todas.

**Qué hacer**: comprobar la API ANTES de replicar el mockup, y sustituir cada pieza imposible por la
verdad más cercana que sí se pueda sostener — con su nombre real («cerrar todas las sesiones», no
«cerrar esta»). Y escribir la desviación en el propio archivo, o el siguiente que compare pantalla y
diseño la leerá como un descuido y la «arreglará».

### D-7 · El secreto del segundo factor NO sale de la máquina de quien lo inscribe
Al inscribir TOTP se genera una semilla; el código QR es solo esa semilla dibujada. Mandarla a un
servicio externo que «genera QR» —una imagen por URL— es entregarle a un tercero el segundo factor de
esa cuenta, y queda en sus registros. Si no hay forma de dibujar el QR localmente que puedas
**verificar**, la salida honesta es ofrecer la **clave manual**: funciona en toda aplicación de
autenticación, es correcta por construcción porque sale del propio SDK, y no viaja a ninguna parte.

---

## E. Decisiones caras, y cómo presentarlas

### E-1 · Separa lo gratis de lo irreversible
Una función puede ser gratuita **y** de una sola vía. Al proponerla, di las dos cosas por separado: el
coste no es el riesgo. Y si no tiene vuelta atrás, **no la tomes tú** — llévala al dueño con el número
concreto («gratis hasta N usuarios») y la frase concreta («no hay botón para regresar»).

### E-2 · Escribe lo que decidiste NO construir, y por qué
Si investigaste passkeys/WebAuthn y la plataforma aún no las soporta, esa investigación es un activo:
sin ella alguien repetirá la búsqueda en seis meses. **Anota la conclusión con fecha**, porque caduca.

### E-3 · Un botón que no puede funcionar es peor que no tenerlo
Antes de dejar un proveedor social en la pantalla, comprueba que esté habilitado **y** que el dominio
esté autorizado. Si no lo está: se arregla o se quita. Dejarlo enseña a la gente que el sistema falla.

### E-4 · Y traduce los códigos de error a algo que un humano entienda
Un traductor de errores con un `default` genérico es correcto — pero ese `default` es donde van a morir
los fallos de configuración (B-2), y ahí nadie los ve. Cuando caiga en el `default`, **regístralo**.

---

## Checklist rápido de auditoría

Sobre cualquier sistema de acceso, en este orden:

1. ¿El límite de intentos lo puede escribir el cliente? → **B-1**, es un arma.
2. ¿Alguien escribe en la bitácora, o solo está declarada? → **B-5**.
3. ¿El alta recibe una contraseña tecleada por otro? → **C-1**.
4. ¿Existe «suspender», o solo «eliminar»? → **C-2**.
5. ¿Revocar el permiso revoca la sesión? → **C-3**.
6. ¿Hay corte por inactividad en TODOS los paneles, o se perdió en una mudanza? → **B-4**, **C-4**.
7. ¿La interfaz distingue roles, o solo «entró / no entró»? → **A-4**.
8. ¿Los proveedores sociales de la pantalla funcionan en el dominio real? → **B-2**, **E-3**.
9. ¿El mensaje cambia según si la cuenta existe? Pruébalo, no lo leas. → **B-3**, **D-3**.
10. ¿Hay segundo factor donde hay datos personales de terceros? → **D-1**.
11. Y si dicen que sí: **¿puede existir una sesión válida ANTES del segundo factor?** → **B-6**. Si la respuesta es sí, no lo hay.
12. Antes de inscribir a nadie: **¿qué mensaje ve quien SÍ tiene el factor?** Sigue el camino del error.
    Si acaba en «credenciales incorrectas», falta el resolver → **B-8**, y aún no puedes inscribir a nadie.
13. ¿El resolver está en **todas** las puertas, incluida la vieja que sigue viva? → **B-8**.
14. ¿La pantalla promete códigos de respaldo, o una lista de sesiones, que la plataforma no emite? → **D-6**.
15. ¿La semilla del segundo factor sale de la máquina para dibujar un QR? → **D-7**, no debe.
16. ¿Hay vía de rescate que NO dependa del factor perdido, y queda escrita? → **C-7**.
