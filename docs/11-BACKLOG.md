# 🗃️ 11 — BACKLOG (pendientes SIN EMPEZAR)

> **Hoja hija de `10`** (§G.5). Salió del nodo always-on el **2026-08-01, por decisión del dueño**.
> El `10` es la pizarra del **SPRINT ACTIVO**; estos 10 items están marcados 🔲 **sin empezar** —
> son backlog, y releerlos en cada arranque costaba ~2k chars de contexto por sesión.
>
> 📖 **Cuándo leer esta hoja**: al planear el próximo sprint, o si tocas el área de uno de estos items.
> **Cuando uno entre en sprint, vuelve al `10`** — el shard fue por estado, no por tamaño.
>
> ⚠️ **Ninguno está cerrado.** Cerrar uno sigue exigiendo su ADR en `99` + fila en `00`.

---

| ID | Item | Estado | Bloqueo |
|---|---|---|---|
| TODO-80 | **PURGA de datos de prueba** (Daniel 27jul): TODO el panel es PRUEBA salvo COLECCIONES y PIEZAS (incluida la cartera migrada). Panel + Firebase con runbook (v5 §8), **AL FINAL**. ⚠️ NO reparar/migrar/backfillear: es basura. `[[project_purga_datos_prueba]]` | 🔲 | al final |
| TODO-07 | **Contenido real web**: reseñas Maps (Nosotros), Films, feed Redes (`home-media.js`). | 🔲 | cliente entrega datos |
| TODO-17 | **Toda captura → CRM**: contacto ✅; falta newsletter. ⚠️ **§189**: el email solo vive en `localStorage` ⇒ **el lead se PIERDE** (el evento `bj:email-subscribed` ya lo trae). | 🔲 | tras App Check |
| TODO-22/29 | Kernel → cars-operador (L-31): gate-de-git en linter (H-06) · kernel lea `### L-NN` de `3*-LECCIONES*` (hoy M-06). | 🔲 | cars-operador |
| TODO-23 | **Frase canónica del gate de DINERO** (H-18): Claude=gate experto; Kary=smoke no bloqueante. → Gemini. | 🔲 | Gemini |
| TODO-67 | **Normalizar fotos 0954/0994 en Storage** (§162.7): tras el fix del cruce, cada foto vive en la CARPETA del doc contrario (URLs funcionan; riesgo: borrar una pieza barre la foto de la otra). Re-subir cada foto desde el admin (2 min) o mover objetos. | 🔲 | menor |
| TODO-47 | **Verdad de marca (riesgo SIC)** → §191.7. ⚠️ cifras sin cuadrar (home vs Nosotros) + certificaciones sin verificar. Espera cifras canónicas de Kary. `[[feedback_no_demo_en_index]]` | 🔲 | Kary: cifras+certs |
| TODO-48 | **Reseñas reales en la web** — el espacio EXISTE (`nosotros.js §10`, hide-when-empty, sin fakes); 85 ★5,0 en GBP. Falta curar + poblar `reviews`. ⚠️ arista legal de republicar Google. | 🔲 | curaduría + legal |
| TODO-50 | **Catálogo de lujo** — imagen real + filtros gema/tipo + badges → §133.2(B/C). (Taxonomía=57.) | 🔲 | tras 44 |
| TODO-71 | **Endurecer gates del cerebro (cross-repo, §175)**: (a) `[[feedback_*]]` vs memoria del harness (HUECO B); (b) `ssotFacts` / dup 05↔10 (check #8 inerte, HUECO C); (c) Sonda 5 `auditoria-cerebro`. | 🔲 | cars-operador |
