# ⚖️ 42 — LEGAL (Lóbulo de Dominio · marco jurídico COLOMBIANO de Bersaglio)

> **Nodo neuronal: lóbulo hijo de `40-LOBULOS-DOMINIO`.** Nace de una auditoría real
> (2026-06-08, Trigger 🔵 + investigación con agentes en fuentes oficiales `.gov.co`).
> On-demand: NO se auto-carga. Es la **fuente única de verdad legal** del proyecto; la
> skill `legal-colombia` lo lee. Mantener vivo (Reflejo de Frescura `CLAUDE.md §G.4`).
>
> 🤝 Disparado por: la skill `legal-colombia` + Trigger 🔵 (cualquier tarea legal del sitio).

---

## §0 — ⚠️ Disclaimer (LEER SIEMPRE antes de producir texto legal)

- **Para qué sirve:** este lóbulo + la skill `legal-colombia` **habilitan a Claude a investigar a
  fondo la ley colombiana y PRODUCIR / dejar al día** los textos y el cumplimiento legal del sitio
  (auditar páginas, redactar políticas, verificar obligaciones) — **no solo señalar problemas**. El
  trabajo lo hace Claude (investigación profunda en fuentes oficiales). El **visto bueno de un abogado
  colombiano es una verificación final recomendada antes de publicar, NO un freno** para avanzar; es
  orientación sólida, no reemplaza la asesoría jurídica formal. Bersaglio = empresa de **Kary Mendoza**
  (Daniel es dueño del sistema).
- **Jurisdicción = COLOMBIA, siempre.** Los plugins/skills legales extranjeros (`legal:*`,
  `legalzoom:*`) están hechos para EE.UU./marco general y **excluyen explícitamente la ley
  no-estadounidense** → **NUNCA** usarlos para producir contenido legal de este sitio (guardrail
  en la skill `legal-colombia`).
- Ítems marcados **[a verificar]** = el número/umbral está en fuentes secundarias confiables pero
  no se pudo abrir el texto oficial directo; confirmar antes de afirmarlos como definitivos.
- Tarea legal sustantiva (redactar una política, decidir cumplimiento) = **Decisión Fuerte** →
  Comité ×3 + 2ª opinión externa (`CLAUDE.md §3.7` + `docs/15-CONSEJO-EXTERNO.md`).

---

## §1 — Marco legal del e-commerce + datos personales

| Norma | Qué regula | Obligación concreta para el sitio | Fuente |
|---|---|---|---|
| **Ley 1480/2011 — Art. 50** (Estatuto del Consumidor) | Deber de información en comercio electrónico | Publicar **siempre**: razón social + **NIT** + dirección de notificación + contacto; info veraz de producto, precio, medios de pago y tiempos de entrega; **el derecho de retracto y cómo ejercerlo**; **enlace visible a la SIC**; condiciones del contrato consultables/descargables | [Ley 1480](https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=44306) |
| **Ley 1480/2011 — Art. 47** (⚠️ **modificado por Ley 2439/2024**) | Derecho de **RETRACTO** (ventas a distancia) | Retracto hasta **5 días hábiles** desde la entrega → devolver **todo el dinero** en máx **15 días CALENDARIO** (**Ley 2439/2024 bajó de 30 a 15** e incluye a los actores del pago), por el medio que prefiera el consumidor. ⚠️ **EXCEPCIÓN JOYERÍA:** piezas **hechas a la medida / personalizadas NO admiten retracto** — advertirlo expresamente. NO condicionar a "apta para reventa" (devolver en las mismas condiciones recibidas, solo responde por deterioro distinto al de examinarla). | [Ley 1480](https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=44306) · [Ley 2439/2024](https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=257116) |
| **Ley 2439/2024** (e-commerce) | Moderniza el Estatuto en comercio electrónico | Reembolso retracto **15 días cal**; **entrega máx 30 días cal** sin pacto; si no hay disponibilidad o no se entrega → terminar + reembolso 15 días cal; define "portal de contacto"; amplía facultades SIC. Vigente (literales b/g/h: 4 meses tras publicación dic-2024). | [Ley 2439/2024](https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=257116) |
| **Ley 1480/2011 — Arts. 5, 7-18** | **Garantía legal** | Garantía legal **obligatoria y gratuita** (calidad, idoneidad, seguridad); informar plazo y procedimiento de reclamo. No se puede excluir | [Ley 1480](https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=44306) |
| **Ley 1480/2011 — Art. 51** + **Decreto 587/2016** | **Reversión del pago** (tarjeta/medio electrónico) | Permitir reversión por fraude / no recibido / defectuoso. Consumidor reclama en **5 días hábiles**; participantes del pago tienen **15 días hábiles**. Informarlo en el sitio | [Decreto 587/2016](https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=69037) |
| **Ley 527/1999** | Comercio electrónico / mensajes de datos / firma | Da **validez jurídica** al "Acepto términos" y a la compra online (equivalencia funcional). La firma electrónica simple (checkbox) es válida entre las partes | [Ley 527](http://www.secretariasenado.gov.co/senado/basedoc/ley_0527_1999.html) |
| **Ley 1581/2012** (Habeas Data) | Datos personales (contacto, newsletter, wishlist, pedidos) | **Autorización previa, expresa e informada** antes de recolectar; **política de tratamiento** + **aviso de privacidad**; derechos del titular (conocer/actualizar/rectificar/suprimir/revocar). **Consentimiento tácito PROHIBIDO** | [Ley 1581](http://www.secretariasenado.gov.co/senado/basedoc/ley_1581_2012.html) |
| **Decreto 1377/2013** | Reglamenta cómo se pide la autorización | Mecanismo de autorización al recolectar + aviso de privacidad + **conservar prueba** de la autorización | [Decreto 1377](https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=53646) |
| **Decreto 1074/2015 — Cap. 26** (RNBD) | Registro Nacional de Bases de Datos ante la SIC | Obligadas a registrar: sociedades con **activos > 100.000 UVT** + personas jurídicas públicas. Pyme bajo el umbral **NO registra**, pero **igual cumple** todo lo demás **[verificar umbral + plazos vigentes]** | [SIC — RNBD](https://www.sic.gov.co/registro-nacional-de-bases-de-datos) |
| **Cookies** — Ley 1581 + Resolución SIC 32.126/2022 | Cookies y analítica | **Consentimiento previo, expreso e informado** para cookies (banner con opción real de rechazar, no solo "aceptar") + política de cookies **[alcance de la resolución a verificar]** | [SIC](https://sedeelectronica.sic.gov.co/politica-de-tratamiento-de-datos-personales) |

**Autoridad:** **SIC (Superintendencia de Industria y Comercio)** — autoridad de consumidor (1480) Y de datos (1581). Sanciones en datos hasta **2.000 SMMLV** + suspensión/cierre.

---

## §2 — Sector joyería / metales y piedras preciosas (lo que un plugin extranjero NO sabe)

| Tema / Entidad | Qué exige | ¿Aplica a Bersaglio? | Fuente |
|---|---|---|---|
| **RUCOM** (ANM) — Registro Único de Comercializadores de Minerales | Certifica a quien comercializa minerales (incl. **piedras preciosas y semipreciosas**). Obligatorio desde **2015** | **SÍ** si compra oro/esmeraldas a operadores/plantas mineras → registrarse. **Excepción:** solo joyería **usada** con factura no registra. Siempre **exigir y archivar el certificado de origen** | [ANM — RUCOM](https://www.anm.gov.co/que-es-el-rucom) |
| **SAGRILAFT** (Supersociedades, Circular 100-000016/2020 Cap. X) | Sistema de autocontrol LA/FT (oficial de cumplimiento, debida diligencia, manual) | **DEPENDE del tamaño.** Sector metales/piedras = alto riesgo. Umbral sector ≈ **30.000 SMMLV** ingresos; régimen de **Medidas Mínimas** ≈ 3.000 ingresos / 5.000 activos SMMLV **[cifras a confirmar en norma oficial]** | [Supersociedades — SAGRILAFT](https://www.supersociedades.gov.co/en/web/asuntos-economicos-societarios/sagrilaft) |
| **ROS a la UIAF** | Reporte de Operaciones Sospechosas (confidencial) | **SÍ si es sujeto obligado** (vía SAGRILAFT o Ley 2195/2022). Clave por ser negocio de alto valor / pagos en efectivo | [UIAF — ROS](https://www.uiaf.gov.co/sistema-nacional-ala-cft/ros-reporte-de-operacion-sospechosa) |
| **Factura electrónica DIAN** | Facturar toda venta | **SÍ — siempre** (es sociedad). POS solo hasta **5 UVT** → en joyería casi todo va con **factura electrónica** | [DIAN](https://www.dian.gov.co/impuestos/factura-electronica/Documents/Abece-FE-Facturador.pdf) |
| **IVA** | Tarifa | **19%** sobre joyería terminada (oro 18k, esmeraldas, diamantes engastados) — Art. 468 ET. No asumir que "el oro" está excluido. Bersaglio vende producto terminado → 19% **[frontera con oro de inversión a verificar]** | [Estatuto Tributario](http://www.secretariasenado.gov.co/senado/basedoc/estatuto_tributario_pr017.html) |

---

## §3 — 🚨 Las 5 obligaciones MÁS críticas (peligrosas de incumplir)

1. **RUCOM + certificado de origen del mineral (ANM)** — comercializar oro/piedras sin registro o sin probar origen lícito → **decomiso + sanciones**. *(Si compra a empresa ya autorizada o joyería usada con factura → basta conservar trazabilidad documental.)*
2. **SAGRILAFT / Medidas Mínimas (Supersociedades)** — sector marcado como alto riesgo de lavado; la obligación nace al cruzar el umbral de ingresos/activos. *Monitorear cada cierre de año.*
3. **ROS a la UIAF** — si es sujeto obligado, reportar operaciones sospechosas.
4. **Factura electrónica DIAN** — toda venta (online y presencial) con factura electrónica.
5. **IVA 19%** en toda venta de joyería terminada — declarar y pagar como responsable de IVA.

---

## §4 — Páginas legales mínimas del sitio (qué debe tener cada una)

> ✅ **AUDITADO 2026-06-30 (LEGAL-01, vía skill `legal-colombia`).** Resultado por página:
> - **`privacidad.html`** (`js/pages/privacidad.js`): Política de Tratamiento de Datos **sólida** (Ley 1581 — responsable, datos, finalidad, terceros incl. Wompi, derechos, cookies, seguridad, menores). ⚠️ NIT "en proceso de actualización" (falta el real).
> - **`terminos.html`** (`js/pages/terminos.js`): cubre IVA 19% ✅, envíos, **garantía comercial DE POR VIDA** (§05, actualizada 2026-07-17 §191 — antes 12 meses; ver §7), propiedad intelectual, jurisdicción. **GAPS para encender Wompi**:
>   1. §03 "Cierre de compra" dice *"No procesamos pagos automáticos directos en el sitio web"* → **CONTRADICE** el cobro web Wompi; reescribir al encender.
>   2. **Retracto mal redactado** (§06): hoy ofrece solo *cambio, no reembolso* en 15 días; la venta ONLINE exige **retracto real Art. 47** (5 días hábiles + devolución total en 30 días calendario), EXCEPTO piezas a la medida (advertir). 
>   3. **Reversión del pago (Art. 51 / Decreto 587/2016)**: ausente; agregar (pago con tarjeta online).
>   4. **Art. 50**: falta **NIT real** + **enlace visible a la SIC**.
> - **Banner de cookies**: rechazo real ✅ (Res. SIC). **Checkout** (`carrito.js:307`): checkbox Habeas Data obligatorio (gateado a Wompi) ✅; **falta** aviso *vendedor≠cobrador* (el cargo aparece a nombre del titular de la cuenta).
> - **Identidad del proveedor RESUELTA** (datos en bóveda `LEGALES-kary-2026-06.md`, desde 2026-06-09): la comerciante es **Kary** (= Diana M. Niño Mendoza, persona natural), **Bersaglio = su establecimiento** (matrícula mercantil, CL 36 #6-32 Centro). El **titular de la cuenta Wompi es ella misma** → "vendedor≠cobrador" es la MISMA persona (basta el aviso + soft-descriptor, no es un tercero). LEGAL-08 → ya NO bloqueado por falta de dato; lo que resta es la **DECISIÓN de Daniel** de publicar la identidad en el sitio (Art. 50 lo exige para vender online).
> - **⚠️ Hallazgo IVA (LEGAL-09)**: el RUT la marca **No responsable de IVA (cód. 49)**, pero Términos §02 dice *"los precios ya incluyen el IVA del 19%"* → contradictorio (no puede cobrar un IVA que no recauda). Corregir a "precio final en COP, sin discriminar IVA". Confirmar con Daniel (decisiones IVA previas en bóveda).

1. **Términos y Condiciones** *(obligatoria — Art. 50)*: identidad + NIT, proceso de compra, precios e impuestos, medios de pago, tiempos de entrega, formación del contrato. Consultable/descargable.
2. **Política de Tratamiento de Datos** *(obligatoria — Ley 1581 + Decreto 1377)*: responsable, finalidades (compras, contacto, newsletter, wishlist), derechos del titular y canal para ejercerlos, vigencia.
3. **Aviso de Privacidad** *(obligatorio — Decreto 1377)*: versión corta junto al checkbox de autorización en cada formulario (contacto, newsletter, checkout).
4. **Política de Cookies** *(exigible — Ley 1581 + Res. SIC 32.126/2022)*: qué cookies, para qué, terceros, cómo aceptar/rechazar + **banner con rechazo real**.
5. **Política de Devoluciones, Garantías y Retracto** *(obligatoria — Arts. 7-18 y 47)*: garantía legal; retracto (5 días → devolución 30 días); **advertir que piezas a la medida NO admiten retracto**.
6. **Política de Reversión del Pago** *(recomendada — Art. 51 + Decreto 587/2016)*.
7. **Política de Envíos** *(recomendada — el Art. 50 exige informar tiempos)*: cobertura, costos, plazos, seguro de transporte para alto valor.

---

## §5 — TODOs legales abiertos (LEGAL-NN)

| ID | Item | Estado |
|---|---|---|
| **LEGAL-01** | Auditar las páginas legales ACTUALES del sitio vs §4. | ✅ 2026-06-30 (resultado en §4) |
| **LEGAL-07** | **Legal pre-Wompi** (Decisión Fuerte; comité ×3 + fuentes oficiales). **HECHO + DESPLEGADO (§157)**: retracto Art.47 correcto (5 días+reembolso total ≤30 días, excepto a-medida) + reversión Art.51 + garantía legal + enlace SIC + §03 puente honesto en `terminos.js`; consultas10/reclamos15 + retención + Encargado en `privacidad.js`. **RESTA — ✅ CERRADO (verificado §164, 2026-07-04)**: §03 ya publica "Pagar ahora" en el sitio (hecho en §157.x, registro estaba stale) · aviso vendedor≠cobrador visible en el paso de pago (`carrito.js:392`, verificado en gate live) · consentimiento persistido con el pedido REAL (`habeasData{aceptado,version,fecha}` en pedido #6 del gate) · abogado = omitido por decisión del dueño (fila LAWYER). | ✅ 2026-07-04 |
| **LEGAL-08** | **Identidad del proveedor** — ✅ HECHO + DESPLEGADO (§157.9): publicada la identidad real (Diana M. Niño Mendoza, NIT 32.908.305-6, establecimiento Bersaglio Jewelry) en `privacidad.js §02` + pie de `terminos.js`; reemplaza el falso "S.A.S.". Resuelve vendedor≠cobrador (nombre del cargo == responsable publicado). | ✅ 2026-06-30 |
| **LEGAL-09** | **IVA en Términos §02** — ✅ HECHO + DESPLEGADO (§157.9): "incluye IVA 19%" → "valor final, régimen de No responsables de IVA, no discrimina ni adiciona IVA" (coherente con RUT cód.49). Consejo ×2 lo marcó FATAL; corregido. | ✅ 2026-06-30 |
| **LEGAL-10** | **Persistir el consentimiento Habeas Data** (Dto.1377 art.5) — ✅ CÓDIGO HECHO + VERIFICADO (§157.10): el server EXIGE y PERSISTE `habeasData{aceptado,version,fecha}` en el pedido (wompi integración 11/11 emulador). **Pend solo: `firebase deploy --only functions` al encender Wompi** (L-22; dormido con flag OFF). | 🟢 code listo · deploy al encender |
| **LAWYER** | **Visto bueno de abogado — OMITIDO por decisión de Daniel** (2026-06-30): los 3 análisis IA (comité + ChatGPT + Antigravity) le bastan; relanzar comité+consejo si hace falta profundidad. El disclaimer §0 lo marca "recomendado, no freno" → riesgo aceptado por el dueño. | ✅ decisión dueño |
| **CONSEJO** | 2ª opinión externa (Decisión Fuerte) = **2 prompts + 2 respuestas** en bóveda (ChatGPT + Antigravity). Claims de código verificados ✓. RUCOM (LEGAL-06): Antigravity confirma que **SÍ aplica** (CIIU 3211) → certificar origen. RNBD (LEGAL-03): **NO aplica** (persona natural). | ✅ 2026-06-30 |
| **LEGAL-02** | Verificar en norma oficial: umbral SAGRILAFT (30.000 SMMLV sector / 3.000-5.000 medidas mínimas) + si Bersaglio lo cruza hoy. | 🔲 Abierto |
| **LEGAL-03** | Confirmar umbral/plazos del RNBD (100.000 UVT) y si Bersaglio debe inscribirse. | 🔲 Abierto |
| **LEGAL-04** | Régimen específico de comercialización de **esmeraldas** (más allá del RUCOM general). | 🔲 Abierto |
| **LEGAL-05** | Frontera IVA: oro de inversión/bruto (posible exclusión) vs joyería terminada (19%). | 🔲 Abierto |
| **LEGAL-06** | RUCOM: ¿Bersaglio compra a mineros (→ registro) o a autorizados/usada (→ solo trazabilidad)? Definir y documentar el flujo de origen. | 🔲 Abierto |

---

## §6 — Cómo se usa este lóbulo

1. La skill `legal-colombia` se dispara ante cualquier tarea legal del sitio → **lee este lóbulo PRIMERO**.
2. Para algo sustantivo (redactar/decidir): **investigación profunda con agentes/workflow** contra fuentes oficiales (`.gov.co`), nunca de memoria ni de plugins extranjeros.
3. Producir SIEMPRE en marco colombiano + disclaimer §0 + Comité ×3 (§3.7).
4. Hallazgos/decisiones nuevas → actualizar este lóbulo (Reflejo de Captura). Al cerrar una tarea legal grande → ADR en `99` + fila en `00-INDICE`.

---

## §7 — Registro de hallazgos (por fecha)

- **2026-07-17 · Garantía comercial 12 meses → DE POR VIDA (§191, ADR en `99`)**: Kary confirmó (vía Daniel) que la garantía comercial es de por vida. Había **contradicción legal**: el marketing (`nosotros-defaults.js` FAQ "de por vida en estructura y engaste", `home/services.js` "vitalicia", `siteContent/home.atelier` "Custodia de por vida") + las respuestas del GBP ("de por vida en el metal") prometían **de por vida**, pero `terminos.js §05` (único doc vinculante) ofrecía solo **12 meses**. Bajo Ley 1480 la **garantía suplementaria ofrecida públicamente OBLIGA** → el marketing ya creaba la obligación; el documento legal la subvaloraba. **Corregido**: `terminos.js §05` → "garantía comercial **de por vida** por defectos de fabricación, sin límite de tiempo desde la entrega, rige mientras el atelier esté en operación". **Alcance = defectos de fabricación** (estructura/engaste/soldadura/fundición), decidido por Daniel (AskUserQuestion) — es el estándar en alta joyería, NO costo abierto. **Garantía legal Ley 1480 (Arts. 7-18) y exclusiones (desgaste/golpes/químicos/terceros) INTACTAS.** Es más favorable al consumidor → baja el riesgo. También: `siteContent/home.atelier.step4Desc` "vitalicia **sin límites**" → "de nuestra manufactura" (el "sin límites" contradecía las exclusiones). **Certificados de autenticidad**: Daniel confirmó reales → sin cambio. Disclaimer §0 aplica (orientación CO; abogado recomendado-no-freno, fila LAWYER). **TODO-47 aún abierto** (claims NO confirmados): "platino" (resp. GBP) · "oro por peso" (resp. GBP) · cifras del home (`editorial`: 40+ años / 5000+ piezas — riesgo SIC).

- **2026-07-07 · Tratamiento IVA para F2.2 (facturación multi-línea joya+servicio) — Claude-contador sobre el RUT REAL**: leído `LEGALES/RUT.pdf` (titular **Diana Margarita Niño Mendoza**, NIT **32.908.305-6**, actualizado 2026-03-17). **Responsabilidades**: **05** renta régimen **ordinario** · **22** deberes formales terceros · **49 NO responsable de IVA**. Actividad ppal **3211** (fabricación de joyas); establecimiento **BERSAGLIO** (CL 36 #6-32 Centro, matrícula 4929210, 2025-04-23); actividades secundarias 9602 (sala de belleza María José Styl) / 7010. **Determinación**: al ser **No responsable de IVA**, NO cobra ni recauda IVA — **ni en la joya (bien) ni en la mano de obra (servicio)**. ⇒ **F2.2 NO requiere lógica fiscal por línea**: joya y servicio se cobran al precio FINAL, sin impuesto ni discriminación (coherente con Términos §02 / LEGAL-09). El esquema igual guarda `naturaleza:'bien'|'servicio'`+`precioSnapshot`+slot `impuesto`(0) como **future-proof** (si cruza el umbral y pasa a Responsable de IVA, el 19% se agrega aditivo, sin migración). El export contador gana columna `naturaleza`, **sin línea de IVA**. **⚠️ Corrección al §2**: la nota "Factura electrónica DIAN — SÍ (es sociedad)" es imprecisa → **es persona natural / establecimiento de comercio**; la obligación de e-factura para persona natural No-responsable es tema aparte de F2.2 **[a verificar en dian.gov.co]**. **Monitorear** (como SAGRILAFT): el umbral de No-responsable de IVA — si ventas/consignaciones anuales crecen, debe migrar a Responsable. Disclaimer §0 aplica (orientación; visto bueno de abogado recomendado-no-freno, riesgo aceptado por Daniel — fila LAWYER). Detalle de diseño → spec `2026-07-07-f2-2-facturacion-multilinea-DISENO.md §8.3(D)`.
- **2026-07-07 · Consentimiento Habeas Data en el POS (F2.1, §171)**: al crear un cliente con documento en el mostrador, la UI captura autorización **previa, expresa e informada** (Ley 1581/2012 + Decreto 1377/2013): aviso con **responsable** (Bersaglio Jewelry) + **finalidades** (facturación DIAN · antifraude · cartera/posventa) + **enlace a `privacidad.html`** + **derechos** (conocer/actualizar/rectificar/suprimir/**revocar**). El servidor GUARDA la prueba: `consent{granted, method, canal:'mostrador_POS', policyVersion, finalidades[], capturedBy, at}` (la CF `crearClienteConDoc` RECHAZA persistir el documento sin consentimiento). Consentimiento tácito PROHIBIDO — el checkbox es el acto expreso. **[a verificar] con abogado colombiano** antes de uso masivo (orientación, no asesoría). La cédula NO es secreto → jamás llave de autenticación (portal F5 = 2º factor). Detalle → spec `2026-07-07-f2-1-vinculo-cliente-DISENO.md §1.7/§9.4`.
