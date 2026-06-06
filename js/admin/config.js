/**
 * Bersaglio Admin — Configuración del CRM (CRM Bloque 3).
 *
 * Fecha de corte de migración (decisión operativa de Kary, spec §8/§11) + datos
 * del negocio para facturas futuras. Guarda en config/negocio (write solo admin).
 */

import { requireAuth, initSidebar, admToast } from './shared.js';
import adminDb from './db.js';
import { getConfig, setConfig } from '../crm-service.js';

function setVal(id, v) { const el = document.getElementById(id); if (el) el.value = v ?? ''; }
function getVal(id) { return (document.getElementById(id)?.value || '').trim(); }

async function init() {
    await requireAuth('admin');
    await adminDb.init();
    initSidebar();

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
