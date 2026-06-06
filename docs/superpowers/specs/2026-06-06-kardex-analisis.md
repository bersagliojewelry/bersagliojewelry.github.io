# Análisis del Kardex actual de Bersaglio — input para el CRM (Fase 3)

> Análisis exhaustivo del archivo `NUEVO KARDEX KARY DEL 2026....xlsx` (el control REAL
> de cuentas por cobrar / fiado de Bersaglio), hecho 2026-06-06 con openpyxl —
> cada hoja, encabezados, fórmulas y errores. Base para diseñar el módulo de
> CRM + cuentas por cobrar + facturación + inventario.

## 1. Qué es (el negocio detrás del Excel)
Es un **libro de cuentas por cobrar (fiado / crédito a clientes)**. Bersaglio vende a
crédito y lleva, por cada cliente, una **cuenta corriente anual**: saldo inicial +
facturas (cargos) − abonos (pagos) = saldo final. Dos vistas: ventas directas de **Kary**
y ventas por **vendedora**.

## 2. Estructura del archivo (6 hojas)
| Hoja | maxFila | maxCol | Clientes | Errores | Rol |
|---|---|---|---|---|---|
| kardex KARY 2026 | 1265 | 70 (BR) | 345 | 0 | Cuentas directas de Kary, 2026 (activo) |
| KARDEX VENDEDORAS 2026 | 507 | 74 (BV) | 19 vendedoras | **32 `#REF!`** | Cuentas por vendedora, 2026 (activo) |
| Kardex de vendedoras 2025 | 456 | 74 | 275 | 0 | Histórico vendedoras 2025 |
| KARDEX KARY 2025 | 1230 | 93 (CO) | 313 | 0 | Histórico Kary 2025 |
| KARDEX KARY 2024 | 1191 | 62 (BJ) | 283 | 0 | Histórico Kary 2024 |
| Hoja1 | — | — | — | — | Oculta, vacía |

### Patrón de columnas (cuenta corriente mensual)
- **A** — cliente, en TEXTO LIBRE: nombre + notas + montos embebidos (ej. `"[Nombre] 1635000 dic 7"`, `"[Nombre] - CUMPLEAÑOS 09/11"`). *(Nombres reales solo en el Excel local, no aquí — privacidad.)*
- **B** — saldo inicial (saldo a diciembre del año anterior).
- **12 bloques mensuales** (Ene→Dic), 4 columnas c/u: `fecha factura | monto del mes | abono | fecha abono`.
- **Última columna** (AZ/AY/BA/BF según hoja) — SALDO final del año.
- **Fórmula de saldo**: `= B + (D−E) + (H−I) + (L−M) + … + (AV−AW)` → saldo inicial + Σ facturas − Σ abonos de los 12 meses.
- Subtotales por vendedora con `=SUM(rango)`.

## 3. Volumen
~**1.500+ cuentas cliente-año** en 3 años · **19 vendedoras** (2026) · cartera de millones de COP. Operación de fiado considerable.

## 4. Problemas detectados (lo que el CRM debe resolver)
1. **Fórmulas frágiles → `#REF!` → PÉRDIDA DE INFORMACIÓN (crítico).** 32 celdas en VENDEDORAS 2026: los saldos iniciales de ~7 clientes (en 3 bloques de vendedoras, filas 139-143, 272-280, 297-298…) se arrastraban de una hoja que se borró → `=+#REF!+#REF!-…` → saldo perdido e irrecuperable desde el Excel.
2. **Estructura por columnas-mes (48–93 columnas).** No escala; ilegible; un error de columna corrompe el saldo de todo el año.
3. **Datos NO estructurados.** Nombre + monto + fecha + notas mezclados en una sola celda de texto → imposible filtrar, buscar o reportar con fiabilidad.
4. **Vendedoras apiladas en una hoja con `SUM(rango)` manuales.** Insertar/borrar filas rompe rangos y referencias → origen de los `#REF!`.
5. **Inconsistencia entre años.** 2024 (`A1="CLIENTES"`, `D1="FACT"`, meses del año siguiente metidos al final), 2025 Kary (93 cols desordenadas), encabezados erróneos (`"luz"` en vez de `"ABONO"`). Imposible consolidar histórico.
6. **Mezcla de hardcode y fórmula.** Abonos a veces `=2050000+2063000`, a veces valor directo → sin integridad.
7. **Single point of failure.** Un archivo Excel; "han perdido información"; sin respaldo, auditoría ni validación.
8. **Encoding roto** (ñ → `"CUMPLEA�OS"`).

## 5. Implicaciones para el CRM (requisitos derivados)
- **Clientes** estructurados: nombre, contacto, vendedora asignada, cumpleaños, notas (campos separados).
- **Vendedoras**: entidad propia; asignación cliente→vendedora; cartera y reportes por vendedora.
- **Cuenta por cobrar**: facturas (cargos) y abonos (pagos) como **registros** con fecha/monto (no columnas-mes). Saldo **calculado solo** y siempre confiable (nunca `#REF!`).
- **Histórico multi-año continuo** (registros con fecha; saldo arrastrado automáticamente; sin hojas por año).
- **Facturación** e **inventario** como módulos relacionados (pedidos por el cliente).
- **Integridad + auditoría + respaldo**: Firestore + reglas (Fase 2) + historial; cero pérdida.
- **Reportes**: cartera total, por vendedora, antigüedad de saldo, abonos del mes, cumpleaños.

## 6. Evidencia (muestras verificadas)
- Saldo (KARY 2026): `AZ2: =+B2+D2-E2+H2-I2+L2-M2+P2-Q2+T2-U2+X2-Y2+AB2-AC2+AF2-AG2+AJ2-AK2+AN2-AO2+AR2-AS2+AV2-AY2`
- `#REF!` real (saldo inicial perdido): `B139: =+#REF!+#REF!-#REF!+#REF!-…`
- **19 vendedoras** en 2026 (nombres reales solo en el Excel local — NO se listan aquí por privacidad). Cada una con su bloque de clientes a crédito.
