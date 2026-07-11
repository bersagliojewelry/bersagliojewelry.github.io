/**
 * Bersaglio Admin — Bandeja única de aprobaciones (F-IA-2 B4 · [OPUS-4.8], owner-only).
 *
 * UN solo lugar donde Daniel decide lo pendiente que YA existe, con las acciones que YA existen
 * (patrón twenty T-25 §183: agregadora, no módulo nuevo). Controlador DELGADO (D5):
 *   (a) monta `initAprobaciones()` TAL CUAL — la cola de cartera (M2b) que antes vivía en Salud;
 *       esta página replica el contrato DOM de ids que `admin-salud.html` le daba.
 *   (b) sección "Bóveda y caja" — réplica EXACTA de `boveda.js:117` (renderPendientes/aprobar):
 *       movimientos de bóveda `estado === 'pendiente_aprobacion'` aprobados con la callable
 *       EXISTENTE `aprobarEventoCaja({opId})`. CERO callables nuevas; si hoy no hay rechazo para
 *       bóveda, NO se inventa (D5). Todo owner-only: la bóveda es `read isOwner` (reglas) y la
 *       callable valida owner server-side — un rol no-owner ni ve el ítem del rail.
 *
 * DOM seguro (sin innerHTML, patrón boveda.js) → cero superficie de inyección.
 */

import { admToast, admConfirm, initSidebar, requireAuth, errorMessage, fmtDateTime } from './shared.js';
import { initAprobaciones } from './aprobaciones.js';
import { aprobarEventoCaja, onBovedaMovsChange } from '../pedidos-service.js';
import { tipoBovedaLabel, esDestructivo } from './caja-format.js';

// Bóveda: los montos pueden ser negativos (reversa) → signo, sin clamp (patrón boveda.js).
const cop = (v) => { const x = Math.round(Number(v) || 0); return (x < 0 ? '-$' : '$') + Math.abs(x).toLocaleString('es-CO'); };
const BUSINESS_ERR = ['failed-precondition', 'invalid-argument', 'not-found', 'already-exists', 'permission-denied'];

// ─── DOM builder seguro (sin innerHTML, mismo helper que boveda.js) ──────────────
function el(tag, attrs = {}, kids = []) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
        if (v == null || v === false) continue;
        if (k === 'class') node.className = v;
        else if (k === 'text') node.textContent = v;
        else node.setAttribute(k, v);
    }
    for (const c of [].concat(kids)) if (c) node.appendChild(c);
    return node;
}

async function init() {
    await requireAuth('owner');   // Bandeja = owner-only (bóveda read isOwner + callables owner)
    initSidebar();

    // (a) Cola de cartera M2b — módulo intacto, mismo contrato DOM que le daba admin-salud.html.
    initAprobaciones();

    // (b) Sección Bóveda y caja — réplica de boveda.js:117.
    onBovedaMovsChange(
        (movs) => renderCajaPend(movs.filter(esDestructivo)),
        200,
        (e) => admToast(errorMessage(e, 'No se pudo leer los movimientos de bóveda.'), 'danger', 4000),
    );
}

// ─── Bóveda y caja: pendientes de aprobación (réplica EXACTA de boveda.js renderPendientes) ──────
function renderCajaPend(pend) {
    const list = document.getElementById('caja-pend-list');
    const empty = document.getElementById('caja-pend-empty');
    if (!list || !empty) return;
    list.replaceChildren();
    empty.hidden = pend.length > 0;

    for (const m of pend) {
        const monto = el('strong', { class: 'adm-money', text: cop(Math.abs(m.delta ?? m.monto)) });
        const info = el('div', { class: 'bov-mov-info' }, [
            el('span', { class: 'bov-mov-tipo', text: tipoBovedaLabel(m.tipo) }),
            el('span', { class: 'bov-mov-sub', text: m.motivo || m.nota || '—' }),
            el('span', { class: 'bov-mov-time', text: fmtDateTime(m.ts) }),
        ]);
        const btn = el('button', { class: 'adm-btn adm-btn--primary adm-btn--sm', type: 'button', text: 'Aprobar' });
        btn.addEventListener('click', () => aprobar(m));
        list.appendChild(el('li', { class: 'bov-mov bov-mov--pend' }, [info, el('div', { class: 'bov-mov-right' }, [monto, btn])]));
    }
}

function aprobar(mov) {
    admConfirm(
        `¿Aprobar «${tipoBovedaLabel(mov.tipo)}» por ${cop(Math.abs(mov.delta ?? mov.monto))}? Entrará al saldo de la bóveda y no se puede deshacer.`,
        async () => {
            try {
                await aprobarEventoCaja({ opId: mov.id });
                admToast('✓ Evento aprobado', 'success');
            } catch (err) {
                const msg = (BUSINESS_ERR.includes(err?.code) && err?.message) ? err.message : errorMessage(err, 'No se pudo aprobar.');
                admToast(msg, 'danger', 4500);
            }
        },
    );
}

init();
