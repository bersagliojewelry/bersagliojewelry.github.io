/**
 * Bersaglio Admin — Configuración del CRM (CRM Bloque 3).
 *
 * Fecha de corte de migración (decisión operativa de Kary, spec §8/§11) + datos
 * del negocio para facturas futuras. Guarda en config/negocio (write solo admin).
 */

import { requireAuth, initSidebar, admToast, admConfirm, esc } from './shared.js';
import adminDb from './db.js';
import {
    getConfig, setConfig,
    onPendientesChange, addPendiente, setPendienteEstado, deletePendiente,
} from '../crm-service.js';

function setVal(id, v) { const el = document.getElementById(id); if (el) el.value = v ?? ''; }
function getVal(id) { return (document.getElementById(id)?.value || '').trim(); }

const CAT = {
    'definir-kary': { label: 'Definir con Kary', pill: 'adm-pill--gold' },
    'datos':        { label: 'Datos por confirmar', pill: 'adm-pill--red' },
    'roadmap':      { label: 'Próxima fase', pill: 'adm-pill--gray' },
};

function renderPendientes(list) {
    const wrap = document.getElementById('pendientes-list');
    const empty = document.getElementById('pendientes-empty');
    if (!list.length) { wrap.innerHTML = ''; empty.hidden = false; return; }
    empty.hidden = true;

    // Pendientes primero, luego resueltos.
    const orden = list.slice().sort((a, b) =>
        (a.estado === 'resuelto' ? 1 : 0) - (b.estado === 'resuelto' ? 1 : 0));

    wrap.innerHTML = orden.map((p) => {
        const cat = CAT[p.categoria] || CAT['definir-kary'];
        const done = p.estado === 'resuelto';
        return `
            <div class="adm-pend-item${done ? ' adm-pend-item--done' : ''}">
                <div style="flex:1;min-width:0;">
                    <span class="adm-pill ${cat.pill}">${esc(cat.label)}</span>
                    <span class="adm-pend-titulo">${esc(p.titulo || '')}</span>
                    ${p.detalle ? `<div class="adm-pend-detalle">${esc(p.detalle)}</div>` : ''}
                </div>
                <div style="display:flex;gap:6px;white-space:nowrap;">
                    <button class="adm-btn adm-btn--ghost adm-btn--sm" data-toggle="${esc(p.id)}" data-estado="${done ? 'pendiente' : 'resuelto'}">${done ? 'Reabrir' : '✓ Resuelto'}</button>
                    <button class="adm-btn adm-btn--ghost adm-btn--sm" data-del="${esc(p.id)}" title="Eliminar">✕</button>
                </div>
            </div>`;
    }).join('');
}

function wirePendientes() {
    document.getElementById('pendiente-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const titulo = getVal('pend-titulo');
        if (!titulo) { admToast('Escribe el pendiente.', 'danger'); return; }
        try {
            await addPendiente({ titulo, categoria: document.getElementById('pend-cat').value });
            document.getElementById('pendiente-form').reset();
        } catch (err) { console.error('[config] addPendiente:', err); admToast('No se pudo agregar.', 'danger'); }
    });

    document.getElementById('pendientes-list').addEventListener('click', async (e) => {
        const tg = e.target.closest('[data-toggle]');
        const del = e.target.closest('[data-del]');
        if (tg) {
            try { await setPendienteEstado(tg.getAttribute('data-toggle'), tg.getAttribute('data-estado')); }
            catch (err) { console.error('[config] toggle:', err); admToast('No se pudo actualizar.', 'danger'); }
        } else if (del) {
            admConfirm('¿Eliminar este pendiente?', async () => {
                try { await deletePendiente(del.getAttribute('data-del')); }
                catch (err) { console.error('[config] delete:', err); admToast('No se pudo eliminar.', 'danger'); }
            });
        }
    });
}

async function init() {
    await requireAuth('admin');
    await adminDb.init();
    initSidebar();

    wirePendientes();
    onPendientesChange(renderPendientes);

    try {
        const cfg = await getConfig('negocio');
        if (cfg) {
            setVal('cfg-fecha-corte', cfg.fechaCorteMigracion);
            setVal('cfg-negocio', cfg.negocioNombre);
            setVal('cfg-nit', cfg.nit);
            setVal('cfg-direccion', cfg.direccion);
            setVal('cfg-telefono', cfg.telefono);
        }
    } catch (err) {
        console.warn('[config] getConfig:', err);
    }

    document.getElementById('config-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('cfg-save');
        btn.disabled = true;
        try {
            await setConfig('negocio', {
                fechaCorteMigracion: getVal('cfg-fecha-corte') || null,
                negocioNombre: getVal('cfg-negocio'),
                nit:           getVal('cfg-nit'),
                direccion:     getVal('cfg-direccion'),
                telefono:      getVal('cfg-telefono'),
            });
            admToast('Configuración guardada.');
        } catch (err) {
            console.error('[config] setConfig:', err);
            admToast('No se pudo guardar.', 'danger');
        } finally {
            btn.disabled = false;
        }
    });
}

init();
