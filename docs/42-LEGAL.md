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
| **Ley 1480/2011 — Art. 47** | Derecho de **RETRACTO** (ventas a distancia) | Retracto hasta **5 días hábiles** desde la entrega → devolver **todo el dinero** en máx **30 días calendario**. ⚠️ **EXCEPCIÓN JOYERÍA:** piezas **hechas a la medida / personalizadas NO admiten retracto** — hay que **advertirlo expresamente** al cliente | [Ley 1480](https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=44306) |
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
> - **`terminos.html`** (`js/pages/terminos.js`): cubre IVA 19% ✅, envíos, garantía comercial, propiedad intelectual, jurisdicción. **GAPS para encender Wompi**:
>   1. §03 "Cierre de compra" dice *"No procesamos pagos automáticos directos en el sitio web"* → **CONTRADICE** el cobro web Wompi; reescribir al encender.
>   2. **Retracto mal redactado** (§06): hoy ofrece solo *cambio, no reembolso* en 15 días; la venta ONLINE exige **retracto real Art. 47** (5 días hábiles + devolución total en 30 días calendario), EXCEPTO piezas a la medida (advertir). 
>   3. **Reversión del pago (Art. 51 / Decreto 587/2016)**: ausente; agregar (pago con tarjeta online).
>   4. **Art. 50**: falta **NIT real** + **enlace visible a la SIC**.
> - **Banner de cookies**: rechazo real ✅ (Res. SIC). **Checkout** (`carrito.js:307`): checkbox Habeas Data obligatorio (gateado a Wompi) ✅; **falta** aviso *vendedor≠cobrador* (el cargo aparece a nombre del titular de la cuenta).
> - **Bloqueado por datos de Kary**: NIT/razón social real · confirmar titular de la cuenta Wompi (¿Diana M. Niño Mendoza = Kary?). → **LEGAL-07/08**.

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
| **LEGAL-07** | **Legal pre-Wompi** (Decisión Fuerte; comité ×3 + fuentes oficiales). **HECHO + DESPLEGADO (§157)**: retracto Art.47 correcto (5 días+reembolso total ≤30 días, excepto a-medida) + reversión Art.51 + garantía legal + enlace SIC + §03 puente honesto en `terminos.js`; consultas10/reclamos15 + retención + Encargado en `privacidad.js`. **RESTA (al encender Wompi)**: reescribir §03 a "la web cobra online"; aviso *vendedor≠cobrador* en el paso de pago + soft-descriptor; guardar prueba del consentimiento (timestamp+versión+casilla) con el pedido. Disclaimer abogado antes de cobrar. | 🟡 Parcial → resta Wompi |
| **LEGAL-08** | **Datos reales de Kary** (bloquean LEGAL-07): NIT/razón social (¿S.A.S. o Persona Natural?) + confirmar titular de la cuenta Wompi (nombre que verá el cliente en el cargo). | 🔲 Espera Kary |
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
