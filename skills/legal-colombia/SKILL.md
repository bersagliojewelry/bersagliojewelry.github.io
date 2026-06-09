---
name: legal-colombia
description: "Guardrail + método para CUALQUIER tarea legal de un negocio COLOMBIANO (e-commerce, joyería, datos personales). Garantiza que todo lo legal se haga en marco jurídico de COLOMBIA, con investigación profunda en fuentes oficiales (.gov.co), NUNCA con plugins extranjeros (legal:*, legalzoom:* son de EE.UU. y excluyen la ley no-estadounidense). GATILLOS OBLIGATORIOS: redactar/revisar términos y condiciones, política de privacidad / tratamiento de datos / habeas data, aviso de privacidad, política de cookies, política de devoluciones/garantías/retracto, política de envíos, contrato, 'es legal esto', cumplimiento normativo, derecho de retracto, garantía legal, reversión de pago, datos personales, Ley 1581, Ley 1480, SIC, RUCOM, lavado de activos / SARLAFT / SAGRILAFT, UIAF, factura electrónica, IVA, DIAN, registrar base de datos / RNBD. Dispara TAMBIÉN como guardrail si se va a usar un skill/plugin legal extranjero (legal:*, legalzoom:*, small-business:contract-review, legal:review-contract) para contenido del sitio o del negocio: DETENTE y usa este marco colombiano. NO disparar para temas legales de OTRO país explícitamente solicitados."
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
   `docs/42-LEGAL.md`): marco colombiano curado — Ley 1480, Ley 1581, RUCOM, SAGRILAFT, DIAN/IVA,
   páginas legales del sitio, TODOs `LEGAL-NN`. Si el proyecto no tiene lóbulo legal, ve directo al paso 2.
2. **Investigación profunda con agentes/workflow** (directiva del cliente: *siempre, con workflows y
   agentes*). Para algo sustantivo (redactar una política, decidir cumplimiento, verificar un
   umbral), despacha subagentes que verifiquen en **fuentes OFICIALES** `.gov.co`:
   funcionpublica.gov.co · secretariasenado.gov.co · **sic.gov.co** (consumidor + datos) ·
   **dian.gov.co** (tributario/factura) · **supersociedades.gov.co** + **uiaf.gov.co** (LA/FT) ·
   **anm.gov.co** (RUCOM/minerales). **Nunca** de memoria ni de plugins extranjeros. Marca lo no
   verificado como **[a verificar]**.
3. **Produce SIEMPRE en marco colombiano**, citando la norma (Ley/Decreto Nº y año) + fuente oficial.
4. **Disclaimer obligatorio** (de `docs/42-LEGAL.md §0`): esto es **orientación, NO asesoría legal**;
   antes de **publicar** texto legal o decidir cumplimiento, **validar con un abogado colombiano**.
5. **Es Decisión Fuerte** (ver la doctrina de comité del proyecto + el nodo de Consejo Externo, p.ej. `docs/15-CONSEJO-EXTERNO.md`): redactar/decidir algo
   legal sustantivo → activa **Comité ×3** + prepara **2ª opinión externa** (Gemini).
6. **Captura** lo nuevo en `docs/42-LEGAL.md` (Reflejo de Frescura). Tarea legal grande cerrada →
   ADR en `99` + fila en `00-INDICE`.

---

## ⚠️ Señales específicas de Colombia que un marco extranjero ignora (no las pierdas)

- **Retracto (Ley 1480 Art. 47):** 5 días hábiles; pero piezas **a la medida/personalizadas NO admiten
  retracto** — clave en joyería; advertirlo.
- **Habeas Data (Ley 1581):** **consentimiento tácito PROHIBIDO** — autorización previa, expresa, informada.
- **RUCOM (ANM):** comercializar oro/esmeraldas sin registro o sin certificado de origen → **decomiso**.
- **SAGRILAFT / UIAF:** la joyería es **sector de alto riesgo de lavado**; obligaciones según umbral de tamaño.
- **IVA 19%** sobre joyería terminada (no asumir exclusión del oro). **Factura electrónica DIAN** obligatoria.

---

## Cuándo NO usar esta skill

- El usuario pide explícitamente un asunto legal de **otro país** (ahí sí los plugins extranjeros aplican).
- Pregunta trivial no-legal. (Pero ante la duda sobre legalidad/cumplimiento, dispárala.)
