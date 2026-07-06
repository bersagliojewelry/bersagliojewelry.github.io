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
    pagado:             { label: 'Pagado',           pill: 'green'   },
    pago_por_verificar: { label: 'Por verificar',    pill: 'gold'    },
    pago_pendiente:     { label: 'Pago en curso',    pill: 'emerald' },
    a_revisar:          { label: 'Revisar',          pill: 'red'     },
    pagado_sin_stock:   { label: 'Pagado sin stock', pill: 'red'     },
    expirado:           { label: 'Expirado',         pill: 'gray'    },
    anulado:            { label: 'Anulado',          pill: 'gray'    },
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

export default { ESTADO_PEDIDO, estadoPedido, CANAL_LABEL, MEDIO_LABEL, ENTREGA_LABEL, canalLabel, medioLabel, entregaLabel, idVisible, normalizarCodigo, pedidoCoincide, nombreComprador, direccionTexto, resumenPedido };
