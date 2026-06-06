# Bersaglio CRM — Hallazgos, mejoras y pendientes
### Documento de apoyo para presentar la plataforma a Kary

> **Propósito**: resumir en un solo lugar (1) los problemas reales del Kardex en Excel,
> (2) las mejoras que trae la nueva plataforma, (3) lo que queda **pendiente por definir
> con Kary** y (4) los pendientes de datos/roadmap. Pensado para tenerlo a la mano en la
> presentación. *No incluye nombres ni saldos de clientes (privacidad / repo público).*
>
> Fecha: 2026-06-06 · Estado del CRM: Bloques 1-4 construidos y verificados end-to-end.

---

## 1. Qué se construyó (en una frase)
Un **CRM de cuentas por cobrar (fiado)** que reemplaza el Kardex en Excel: clientes
estructurados, saldo calculado solo por el sistema (nunca más a mano), app para que cada
vendedora registre desde el celular, y un panel para que Kary vea toda la cartera. Todo
con respaldo automático, permisos por rol y trazabilidad.

---

## 2. Problemas / cuellos de botella del Excel actual (hallazgos verificados)
Análisis del archivo real con herramientas (openpyxl), hoja por hoja:

| # | Problema | Impacto |
|---|---|---|
| 1 | **Fórmulas frágiles → errores `#REF!`** (15 clientes en 2026 con el saldo perdido) | **Pérdida de información real e irrecuperable** desde el Excel |
| 2 | **Estructura por columnas-mes** (48 a 93 columnas por hoja) | No escala, ilegible; un error de columna corrompe el saldo de todo el año |
| 3 | **Datos no estructurados** (nombre + monto + fecha + nota en una sola celda de texto) | Imposible filtrar, buscar o sacar reportes confiables |
| 4 | **Vendedoras apiladas con sumas manuales** (`SUM(rango)`) | Insertar/borrar filas rompe las referencias → origen de los `#REF!` |
| 5 | **Inconsistencia entre años** (encabezados distintos, columnas desordenadas, "luz" en vez de "ABONO") | Imposible consolidar el histórico |
| 6 | **Mezcla de valores escritos a mano y fórmulas** (abonos a veces `=2050000+...`, a veces el número) | Sin integridad; fácil equivocarse |
| 7 | **Un solo archivo, sin respaldo ni auditoría** | "Han perdido información"; un punto único de falla |
| 8 | **Encoding roto** (la ñ aparece como `CUMPLEA�OS`) | Datos corruptos |

> Volumen real: ~1.500+ cuentas cliente-año en 3 años, 19 vendedoras (2026), cartera de
> cientos de millones de COP. Es una operación de fiado considerable manejada en un Excel frágil.

---

## 3. Mejoras que trae la plataforma (lo importante para Kary)
- ✅ **El saldo se calcula SOLO y siempre cuadra.** Una función en el servidor recalcula el
  saldo de cada cliente con cada factura/abono. **Nunca más `#REF!` ni cuentas que no cuadran.**
- ✅ **Cada vendedora trabaja desde su celular**: ve solo SUS clientes, registra factura/abono
  con dos toques, consulta su cartera. No puede borrar ni alterar el historial (integridad).
- ✅ **Kary lo ve todo**: cartera total, cartera por vendedora, ficha de cada cliente con su
  historial, y una **bandeja de correcciones** (si una vendedora se equivocó, lo solicita y
  Kary aprueba — nada se borra a escondidas).
- ✅ **Respaldo y trazabilidad automáticos**: todo queda en la nube de Google (Firestore), con
  registro de quién hizo cada movimiento y cuándo. Cero "se perdió el archivo".
- ✅ **Cumpleaños del mes** (para promos/descuentos) y **clientes estructurados** (nombre,
  teléfono, WhatsApp, cumpleaños, notas) — base para fidelización.
- ✅ **Correcciones con autorización**: las vendedoras piden, Kary aprueba/rechaza; queda el rastro.
- ✅ **Preparado para crecer**: la web pública es un canal más; a futuro se conectan inventario
  y facturación sin rehacer nada.

---

## 4. La "fecha de corte" de migración — explicada
No está en el Excel porque **es una decisión, no un dato**. Es el día en que se deja el Excel
y se empieza a usar el sistema. Cada cliente entra con **el saldo que debe a esa fecha** (un
movimiento de "apertura"); la historia vieja (mes a mes) queda archivada en el Excel. De la
fecha de corte en adelante, todo se registra en la plataforma.
- **A definir con Kary**: ¿desde qué día arrancamos? (lo común: hoy, o el 1° del mes en que empiecen).

---

## 5. PENDIENTES por DEFINIR con Kary (decisiones, en la presentación)
1. **Fecha de corte** de migración (§4).
2. **Datos del negocio** para futuras facturas/recibos: nombre legal, NIT, dirección, teléfono.
3. **Alta de las 19 vendedoras** como usuarias (correo + clave) para que entren a su app.
4. Confirmar el **modelo de saldo**: factura/apertura **suman**, abono **resta**; saldo positivo = el cliente debe, negativo = saldo a favor. (Así quedó; confirmar que coincide con su contabilidad.)
5. ¿Qué se considera **"cuenta atrasada"**? (definir días de plazo) — hoy no está, requiere esa regla.

## 6. PENDIENTES de DATOS para completar la migración
1. **Los 15 saldos `#REF!`** (clientes de vendedoras cuyo saldo se perdió en el Excel) → hay que
   ponerlos a mano; **el sistema NO los inventa**.
2. Confirmar que las **19 filas "sin saldo"** son los subtotales de vendedora (no clientes).
3. **Atribución cliente→vendedora** en la hoja de vendedoras (qué cliente es de cuál) — depende del punto 5.3.
4. **Revisión de nombres**: en el Excel el nombre viene mezclado con montos/notas; el sistema los
   limpió automáticamente, conviene revisar una muestra antes de cargar.

> **Plan de migración por fases**: **Fase A** = los **345 clientes directos de Kary** (limpios,
> sin errores) apenas se defina la fecha de corte. **Fase B** = los clientes de vendedoras
> (tras dar de alta a las vendedoras + confirmar los 15 `#REF!`).

---

## 7. Roadmap / próximas fases de la plataforma
- **Bloque 5 — Migración** (en curso): cargar la cartera real del Excel (Fases A y B de arriba).
- **Bloque 6 — Reportes**: cartera por antigüedad, abonos del mes, exportar, etc.
- **Cuentas atrasadas** (aging): requiere definir plazos de pago (§5.5).
- **Facturación electrónica (DIAN)**: necesita un proveedor; fase posterior.
- **Inventario**: stock sobre el catálogo existente; fase posterior.
- **Seguridad de producción**: App Check + custom claims + CSP (endurecimiento Fase 2, ya planificado).
- **Despliegue**: publicar para uso real (merge a producción + reglas/función) — cuando Kary dé el OK.

---

## 8. Decisiones de arquitectura ya tomadas (referencia)
- **Saldo desnormalizado + función en servidor** = lecturas rápidas y saldo siempre correcto.
- **Append-only para vendedoras** = el libro de fiado es inmutable salvo corrección autorizada.
- **Roles**: Daniel (dueño) → Kary (admin, ve todo) → vendedoras (solo lo suyo, desde el celular).
- **Módulo desacoplado** = el CRM no interfiere con el sitio público; crece por fases.
- Detalle técnico completo: `docs/50-ARQUITECTURA.md`, `docs/99-HISTORIAL-ADR.md` (§42-§46),
  diseño aprobado en `docs/superpowers/specs/2026-06-06-crm-cuentas-design.md`.
