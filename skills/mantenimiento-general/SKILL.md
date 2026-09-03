---
name: mantenimiento-general
description: EJECUTOR del mantenimiento mensual del cerebro ×4 (Cerebro v2 F3, ADR §53 inmobiliaria). Se dispara cuando el banner "EN CRISTIANO" del boot dice TOCA (auditoría vencida / backup >35d) o el gate #14 escala a warn — NUNCA por calendario ni memoria humana. Daniel solo dice "haz el mantenimiento mensual". Cubre: bundle offsite + rotación de auditoría Nivel-2 + poda de doctrina + verificación kernel ×4 + métrica de costo.
actualizada: 2026-09-02
reglas: 6
lecciones: []
origen: propia
---

# 🔄 Mantenimiento General (resonancia mensual ×4) — EJECUTOR, no disparador

> **Disparo**: el sistema EMPUJA (banner del boot "⚠️ TOCA" · gate #14 warn · guardián de bóveda).
> Este runbook NUNCA depende de que un humano recuerde una fecha (M-02: calendario = doctrina disfrazada).
> **Duración objetivo: ~30 min.** Al terminar, los sellos del manifest apagan los nags solos.

## Orden de ejecución (los 6 pasos, en este orden)

### 1. 💾 Respaldo offsite (mata SPOF-disco)
```
for r in altorrainmobiliaria.github.io altorracars.github.io bersagliojewelry.github.io insemastereo.github.io brain-private:
  git -C <r> bundle create C:\Users\romad\OneDrive\backups-cerebro\<r>-<YYYY-MM-DD>.bundle --all
```
- **PROBAR la restauración** de ≥1 bundle (`git clone <bundle> tmp` — sin esto es teatro; gotcha MAX_PATH → `50-CONFIG-INFRA`).
- Actualizar `lastOffsiteBackup` en el `.brain-manifest.json` del repo donde corres (apaga el nag del banner).
- Borrar bundles con >3 meses (mantener ~3 generaciones).

### 2. 🧬 Kernel ×4 al día
- `npm run brain:pull` en los 4 repos → los 4 deben decir `kernel vX íntegro == canónico` (gate #0).
- Sentencias de kernel pendientes en el TODO del repo escritor (inmobiliaria) → ejecutarlas con masa-neta ≤ 0.

### 3. 🔬 Rotación de auditoría Nivel-2 (1 repo por mes — el que el gate #14 señale más vencido)
- Correr la skill **`auditoria-cerebro`** COMPLETA en ese repo (8 sondas + cierre + `deepAudit` re-sellado).
- Incluir SIEMPRE: **sonda de contradicción inter-doctrina** (subagente frío: solo las doctrinas §3.x — "¿alguna par se contradice o tiene alcance ambiguo?"; cazó Poppins-vs-Cormorant en §49) y el **banco de preguntas de retrieval** (casos REALES de re-investigación, rotados — nunca preguntas del índice, eso es teatro).

### 4. ✂️ Poda de doctrina (one-in-one-out — la mitad que NINGÚN gate hace solo)
- Costo del cerebro (banner): si **>30% dos meses seguidos → RECORTAR doctrina, no añadir maquinaria** (criterio de salida §33/§49).
- Candidatas: reglas always-on cuyo gate ya las mecaniza (el gate ES la regla; el texto baja a hoja) · doctrina que compensaba debilidades de modelos VIEJOS (los modelos mejoran: Opus→Fable — re-leer §3 con ojos del modelo actual) · lecciones ⚰️ de sistemas retirados → `_legacy/`.
- Órganos con kill-switch: heartbeat/consolidación/métrica — si alguno falló 2× en el mes y su ausencia no cuesta nada medible → BORRARLO (§52).

### 5. 🩺 Deuda visible de los hermanos
- `npm run brain:check` en los 4: la deuda que los gates reportan (ticks sin ancla, caps, bóveda) se cura EN SU carril — este runbook solo la LISTA en el reporte (no invadir carriles).

### 6. 📦 Cierre
- Nota de resonancia → ADR corto (via `npm run brain:archive`) o apéndice al último ADR de mantenimiento + fila en `00`.
- `brain:check` verde (o deuda listada con dueño) + commit + push (repo + bóveda).
- Verificar que el banner del próximo boot ya NO dice TOCA.

## Anti-patterns (vinculantes)
- ❌ Correrlo "por si acaso" sin nag (el costo es real; el sistema avisa cuando toca).
- ❌ Curar deuda de OTRO carril desde aquí (solo respaldo-ajeno de bóveda, M-03).
- ❌ Saltarse la prueba de restauración del bundle.
- ❌ Añadir pasos a este runbook sin quitar otros (el mantenimiento también engorda — one-in-one-out).
