# Prompt para el CONSEJO EXTERNO (Gemini/Antigravity) — F2.0 Caja + Bóveda antirrobo

> **Uso**: Daniel pega esto en el proveedor externo (Antigravity/Gemini). El modelo externo **lee el código
> y el cerebro local en SOLO-LECTURA** — asesora con crítica adversarial, **NUNCA edita ni implementa**
> (`[[feedback_consejo_externo_readonly]]`). Su respuesta entra al comité como un peer review más: Claude
> adopta lo correcto, refuta con razones lo que esté mal, y sintetiza. No es oráculo: es insumo.

---

## Contexto (para que puedas leer los archivos reales)
Proyecto **Bersaglio Jewelry** — e-commerce de alta joyería colombiana, stack HTML/CSS/JS vanilla + **Firebase**
(Firestore + Cloud Functions, plan zero-budget/Spark→Blaze). Repo local que puedes leer.

Estamos diseñando **F2.0 — sesión de caja + bóveda antirrobo** para el POS de mostrador. Es una **Decisión
Fuerte de dinero**. Ya pasó por un comité interno ×3 (5 expertos: ledger, seguridad, contador, SRE, UX) que
cazó 9 defectos estructurales. Queremos tu crítica adversarial ANTES de escribir la spec ejecutable.

**Lee estos archivos (rutas reales del repo):**
- `docs/superpowers/specs/2026-07-06-f2-0-caja-boveda-DISENO.md` — el diseño COMPLETO (v1 §0-§7 + **veredicto
  del comité y diseño v2 en §8**, que es lo vigente).
- `docs/superpowers/specs/2026-07-04-plan-unico-erp-v4.md` §2.0 y §3 — el roadmap y la directiva original de Daniel.
- Código real que el diseño toca: `functions/pedidos-core.js` (`cierreCajaCore` L737, `crearPedidoCore`,
  el patrón `runTransaction`), `firestore.rules` (arqueo L670, config L885, roles L24-42), `js/admin/pos.js`
  (cierre L361). Y el patrón canónico de saldo por recompute: busca `recalcSaldoCliente` (charter `docs/50-ARQUITECTURA.md`).

## Restricciones DURAS del contexto (no las cuestiones, son el terreno)
- **Operadora única**: Kary (rol `owner`/`admin`) registra, traslada, anula, concilia, cuenta y aprueba TODO.
  Las vendedoras no tienen usuario. No hay Segregation of Duties interna posible dentro de la app.
- **CF-only para dinero**: el cliente (navegador) NUNCA escribe colecciones de dinero; todo pasa por Cloud
  Functions callables (Admin SDK). Saldos por **recompute idempotente desde un ledger** (nunca incrementados).
- **Zero-budget**: Firestore + Cloud Functions gestionadas; NADA de microservicios/colas/infra extra por moda.
- **Antirrobo real**: el cajón físico (RJ11) solo debe contener montos chicos (`limiteCajon`); el grueso vive
  en la caja fuerte (bóveda). Un atraco al cajón debe encontrar máximo `limiteCajon`, jamás el día completo.

## Opciones que YA descartamos (para que no reinventes la rueda — anti-anclaje R1)
- **Materializar el saldo del cajón/bóveda e incrementarlo**: descartado (fragilidad; mató el Excel previo).
  Vamos por recompute desde ledger. El saldo materializado `boveda/main` es solo VISTA, sin autoridad.
- **Resolver "turno abierto" con `query where estado==abierto`**: descartado (TOCTOU). Vamos por un doc-puntero
  singleton `caja/estado {turnoAbiertoId}` en `runTransaction`.
- **Bloquear el COBRO cuando el cajón supera el límite**: descartado (el efectivo físico ya entró; bloquear
  perdería la venta). Bloqueamos la SIGUIENTE venta hasta trasladar (server-side), no la actual.

## Invariantes que la solución DEBE cumplir (caza el fallo en la lógica contra estos)
1. Un solo turno abierto a la vez (transaccional, no best-effort).
2. Ninguna decisión de dinero (rechazar venta, cerrar turno, validar traslado) depende de un saldo
   materializado ni de un cálculo client-side: recompute síncrono en la misma `runTransaction`.
3. Toda escritura al ledger es idempotente por `opId` (retry/doble-tap no duplica dinero).
4. La pertenencia de una venta a un turno es por `turnoId`, no por ventana temporal.
5. `boveda/main` puede reconstruirse desde el ledger + checkpoints en cualquier momento (auditable).
6. El deploy no puede romper a Kary a mitad de venta (flag `enforceTurno`, rollback = flip).

## Datos del negocio (Daniel confirmó el 2026-07-06)
- La bóveda **arranca en $0** (no hay millones históricos que sembrar; el sistema nace limpio).
- Fondo del cajón para vueltos = **$200.000**; techo de alarma del cajón (`limiteCajon`) = **$4.000.000**.
- **Daniel quiere que el conteo físico y las alertas se puedan asignar TAMBIÉN al usuario de Kary** (no solo
  a él). Nuestra mitigación: config owner-only que solo AÑADE destinatarios y NUNCA remueve a Daniel de las
  alertas de anulación de dinero (Kary no puede quitarse su propia vigilancia). Critica esta mitigación.

## Las 4 PREGUNTAS (el comité quiere tu segunda opinión aquí)
1. **Control compensatorio para operadora única sin SoD, con el agravante nuevo**: Kary hace todo Y Daniel
   quiere poder asignarle también el conteo/alertas (por practicidad operativa). ¿Nuestra mitigación (config
   que solo añade destinatarios, Daniel siempre en las alertas de anulación, alertas de anulación inmutables
   append-only) preserva control real, o es teatro? ¿Hay un patrón mejor para una sola operadora de confianza
   donde el dueño quiere delegar operación sin perder la vigilancia — sin depender de que Daniel lea cada alerta?
2. **Recompute síncrono vs checkpoint+materializado en el hot-path**: ¿es correcto exigir recompute del saldo
   dentro de la misma `runTransaction` de cada venta/traslado (el trigger solo como vista), o el costo/latencia
   de recomputar el ledger en el hot-path de CADA venta justifica un patrón de checkpoint + saldo materializado
   confiable con reconciliación diferida? ¿Dónde está el punto correcto para Firestore zero-budget?
3. **Checkpoint mensual sobre Firestore**: para acotar `recalcBoveda` O(n) (ledger histórico permanente),
   proponemos un checkpoint mensual anclado en conteo físico. ¿Es correcto y suficiente, o introduce su propio
   hueco de consistencia (p.ej. un movimiento anulado/insertado ANTES de un checkpoint ya sellado)?
4. **Migración sin ventana rota**: corte duro con `T0` + flag `enforceTurno` (pedidos `ts<T0` → mundo viejo
   `cierreCajaCore`; `ts>=T0` → exige `turnoId`; último cierre Z cubre `[ultimoCierre, T0)`). ¿Es más seguro
   que un periodo de gracia con ambos sistemas vivos, o introduce su propio riesgo con una venta en vuelo
   cruzando `T0`? ¿Cómo garantizar que ninguna venta caiga en el hueco entre los dos mundos?

## Formato de tu respuesta
Por cada pregunta: tu recomendación + el porqué + qué RIESGO ves que no consideramos. Y al final: **¿ves algún
defecto estructural que el comité interno NO cazó?** Sé adversarial y específico (no "está bien" — di dónde se
rompe y con qué caso). Ancla a los invariantes y al código real que leíste.