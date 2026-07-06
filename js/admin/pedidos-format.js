/**
 * pedidos-format.js — helper PURO de presentación del módulo Pedidos (F1-PUENTE · TODO-68).
 *
 * Mapea los valores CANÓNICOS del backend (functions/pedidos-core.js: estados, canales,
 * medios, tipos de entrega) a etiquetas en español y tonos de píldora (.adm-pill--*).
 * Sin DOM ni Firestore: testeable en Node (tests/pedidos-format.test.mjs) — mismo patrón
 * que saldo-format.js y lead-format.js.
 */

// Censo REAL de estados (pedidos-core.js + webhook Wompi + reaper). pill = sufijo .adm-pill--*.
export const ESTADO_PEDIDO = {
    pagado:             { label: 'Pagado',            pill: 'green'   },
    pago_por_verificar: { label: 'Por verificar',     pill: 'gold'    },
    pago_pendiente:     { label: 'Pago en curso',     pill: 'emerald' },
    a_revisar:          { label: 'Revisar',           pill: 'red'     },
    pagado_sin_stock:   { label: 'Pagado sin stock',  pill: 'red'     },
    expirado:           { label: 'Expirado',          pill: 'gray'    },
    anulado:            { label: 'Anulado',           pill: 'gray'    },
    // F1-CORE (spec 2026-07-06 §2): máquina logística post-pago.
    preparacion:        { label: 'En preparación',    pill: 'gold'    },
    despacho_nacional:  { label: 'En camino',         pill: 'emerald' },
    entrega_local:      { label: 'Entrega local',     pill: 'emerald' },
    listo_retiro:       { label: 'Listo para retiro', pill: 'gold'    },
    entregado:          { label: 'Entregado',         pill: 'green'   },
    cancelado:          { label: 'Cancelado',         pill: 'gray'    },
    reembolsado:        { label: 'Reembolsado',       pill: 'gray'    },
};

/**
 * F1-CORE — ESPEJO de la tabla de transiciones del backend (functions/pedidos-core.js).
 * La CF es la ÚNICA que valida/escribe; este espejo solo decide qué BOTONES pintar.
 * Paridad garantizada por test (tests/pedidos-format.test.mjs, deepEqual cliente↔CF).
 */
export const TRANSICIONES_PEDIDO = {
    pagado:            ['preparacion', 'entregado', 'cancelado'],
    preparacion:       ['despacho_nacional', 'entrega_local', 'listo_retiro', 'cancelado'],
    despacho_nacional: ['entregado'],
    entrega_local:     ['entregado'],
    listo_retiro:      ['entregado'],
    entregado:         ['reembolsado'],
};

/** Verbo/tono del botón por estado DESTINO (test: cubre todo destino de la tabla). */
export const ACCION_TRANSICION = {
    preparacion:       { label: 'Pasar a preparación',        tono: 'primary' },
    despacho_nacional: { label: 'Despachar (transportadora)', tono: 'primary' },
    entrega_local:     { label: 'Salir a entrega local',      tono: 'primary' },
    listo_retiro:      { label: 'Listo para retiro',          tono: 'primary' },
    entregado:         { label: 'Marcar entregado',           tono: 'primary' },
    cancelado:         { label: 'Cancelar pedido',            tono: 'danger'  },
    reembolsado:       { label: 'Registrar reembolso',        tono: 'danger'  },
};

/** Info de estado con fallback seguro (un estado desconocido NUNCA rompe la lista). */
export function estadoPedido(estado) {
    return ESTADO_PEDIDO[estado] || { label: estado || '—', pill: 'gray' };
}

export const CANAL_LABEL   = { pos: 'Mostrador', web: 'Web', whatsapp: 'WhatsApp' };
export const MEDIO_LABEL   = { efectivo: 'Efectivo', transferencia: 'Transferencia', wompi: 'Wompi', addi: 'Addi' };
export const ENTREGA_LABEL = { tienda: 'Recoge en tienda', nacional: 'Envío nacional', internacional: 'Envío internacional' };

export const canalLabel   = c => CANAL_LABEL[c] || c || '—';
export const medioLabel   = m => MEDIO_LABEL[m] || m || '—';
export const entregaLabel = t => ENTREGA_LABEL[t] || '';

const cop = n => '$' + Math.round(Math.max(0, Number(n) || 0)).toLocaleString('es-CO');

/**
 * §166 — Identificador VISIBLE del pedido: el código público BJ-XXXX-XXXX; fallback legacy al
 * # interno (solo mientras exista algún pedido sin backfill). Al cliente SIEMPRE se le habla
 * por código: el correlativo revela el volumen de ventas del negocio.
 */
export function idVisible(pedido) {
    return pedido?.codigo || (pedido?.numero != null ? `#${pedido.numero}` : '—');
}

/** Normaliza lo tecleado/pegado para comparar códigos: mayúsculas, sin guiones/espacios/ruido. */
export function normalizarCodigo(q) {
    return String(q || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}

/**
 * Búsqueda TOLERANTE del panel (comité §166: minúsculas, sin guiones, sufijo, espacios de
 * WhatsApp — nada de eso bloquea a Kary frente al cliente). Matchea código (parcial), # interno
 * exacto, nombre de pieza o nombre del comprador.
 */
export function pedidoCoincide(pedido, query) {
    const q = String(query || '').trim();
    if (!q) return true;
    const qn = normalizarCodigo(q);
    const code = normalizarCodigo(pedido?.codigo);
    if (qn && code && code.includes(qn)) return true;
    const ql = q.toLowerCase();
    if (String(pedido?.numero ?? '') === ql.replace(/^#/, '')) return true;
    if ((pedido?.pieceName || '').toLowerCase().includes(ql)) return true;
    if (nombreComprador(pedido).toLowerCase().includes(ql)) return true;
    return false;
}

/** Nombre del comprador web ('' si el pedido no trae shipping — p.ej. venta de mostrador). */
export function nombreComprador(pedido) {
    const s = pedido?.shipping;
    if (!s) return '';
    return [s.firstName, s.lastName].filter(Boolean).join(' ').trim();
}

/** Dirección en una línea (mostrar/copiar). '' si el pedido no trae datos de envío. */
export function direccionTexto(shipping) {
    const s = shipping || {};
    const linea = [s.address, s.city, s.country].filter(Boolean).join(', ');
    if (!s.zip) return linea;
    return linea ? `${linea} (${s.zip})` : s.zip;
}

/**
 * Resumen copiable del pedido (WhatsApp-ready): lo que Kary reenvía a la transportadora
 * o consulta con Daniel sin abrir el panel. Solo incluye líneas con datos.
 */
export function resumenPedido(pedido) {
    const p = pedido || {};
    const s = p.shipping || null;
    const lineas = [
        `Pedido ${idVisible(p)} · Bersaglio`,   // §166: al cliente, SIEMPRE el código
        p.pieceName ? `Pieza: ${p.pieceName}` : '',
        `Total: ${cop(p.total)}`,
        `Estado: ${estadoPedido(p.estado).label} · ${medioLabel(p.medio)} · ${canalLabel(p.canal)}`,
    ];
    const nombre = nombreComprador(p);
    if (nombre) lineas.push(`Cliente: ${nombre}${s?.docNumber ? ` (${s.docType || 'Doc'} ${s.docNumber})` : ''}`);
    if (s?.phone) lineas.push(`Tel: ${s.phone}`);
    if (s?.email) lineas.push(`Email: ${s.email}`);
    const entrega = entregaLabel(p.tipoEntrega);
    const dir = direccionTexto(s);
    if (entrega || dir) lineas.push(`Entrega: ${[entrega, dir].filter(Boolean).join(' — ')}`);
    return lineas.filter(Boolean).join('\n');
}

/**
 * F1-CORE — KPI del filtro activo (spec §4.2). En la SUMA solo entra dinero real:
 * quedan fuera los estados donde no entró (expirado/anulado/pago_pendiente/cancelado)
 * y `reembolsado` (entró pero se devolvió — sumarlo inflaría la venta del filtro).
 */
export const ESTADOS_SIN_DINERO = new Set(['expirado', 'anulado', 'cancelado', 'pago_pendiente', 'reembolsado']);

/** Totales del subconjunto filtrado: n = todos los visibles; totalCOP = solo con dinero. */
export function totalesFiltro(pedidos) {
    const lista = Array.isArray(pedidos) ? pedidos : [];
    let totalCOP = 0, excluidos = 0;
    for (const p of lista) {
        if (ESTADOS_SIN_DINERO.has(p?.estado)) { excluidos++; continue; }
        totalCOP += Math.round(Math.max(0, Number(p?.total) || 0));
    }
    return { n: lista.length, totalCOP, excluidos };
}

/**
 * F1-CORE §3.5 — adaptador items[]: los pedidos nuevos traen `items[]` (costura F2.2);
 * los legacy se fabrican desde los campos planos. ÚNICA puerta de lectura de líneas.
 */
export function itemsDePedido(pedido) {
    const p = pedido || {};
    if (Array.isArray(p.items) && p.items.length) return p.items;
    if (!p.pieceId && !p.pieceName) return [];
    return [{
        pieceId: p.pieceId || null,
        pieceName: p.pieceName || 'Pieza',
        pieceSlug: p.pieceSlug || null,
        cantidad: 1,
        precio: Math.round(Math.max(0, Number(p.total) || 0)),
        costoSnapshot: null,
    }];
}

/**
 * F1-CORE §3.5 — aviso de despacho (WhatsApp): la página de gracias NO lee Firestore
 * (anti-oráculo §166), así que el estado del envío se lo comunica KARY con esta plantilla.
 * Texto exacto de la spec; solo usa `codigo` (§166: jamás el correlativo interno).
 */
export function plantillaDespacho(pedido) {
    const p = pedido || {};
    return `Tu pedido ${p.codigo || ''} va en camino con ${p.transportadora || ''}, guía ${p.guia || ''}. — Bersaglio`;
}

/**
 * F1-CORE §4.3 — oferta al cliente de un `pagado_sin_stock` (voz Bersaglio, cálida y directa):
 * refabricación a medida o reembolso inmediato. Kary la envía por WhatsApp con un clic.
 */
export function plantillaSinStock(pedido) {
    const p = pedido || {};
    const nombre = nombreComprador(p).split(' ')[0];
    return `Hola${nombre ? ' ' + nombre : ''}, te escribimos del atelier de Bersaglio por tu pedido ${p.codigo || ''}. ` +
        `Tu pago llegó perfecto, pero «${p.pieceName || 'la pieza'}» acaba de agotarse y no queremos darte algo distinto a lo que elegiste. ` +
        `Podemos elaborarla de nuevo para ti (te confirmamos el tiempo del taller) o devolverte el dinero de inmediato. ¿Qué prefieres?`;
}

export default { ESTADO_PEDIDO, estadoPedido, TRANSICIONES_PEDIDO, ACCION_TRANSICION, ESTADOS_SIN_DINERO, CANAL_LABEL, MEDIO_LABEL, ENTREGA_LABEL, canalLabel, medioLabel, entregaLabel, idVisible, normalizarCodigo, pedidoCoincide, nombreComprador, direccionTexto, resumenPedido, totalesFiltro, itemsDePedido, plantillaDespacho, plantillaSinStock };
