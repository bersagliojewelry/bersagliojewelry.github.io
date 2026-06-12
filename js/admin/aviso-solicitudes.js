/**
 * Bersaglio Admin — Aviso de solicitudes fuera de plazo (Fase M · M4, panel de Kary).
 *
 * El DEGRADADO del SLA hecho visible donde Kary trabaja: si sus solicitudes llevan
 * más de `slaRevisionDias` esperando a Daniel, el panel "Hoy" lo dice — la presión
 * mecánica del compromiso de cadencia (pregunta 2 del plan §69). Solo admin/owner
 * (un editor ni siquiera puede leer las solicitudes; se sale en silencio).
 */

import { currentRole } from '../auth.js';
import { onSolicitudesPendientesChange, getConfig } from '../crm-service.js';
import { pendientesFueraDeSLA } from '../crm-auditoria.js';

export async function initAvisoSolicitudes() {
    const rol = currentRole();
    if (!['admin', 'owner'].includes(rol)) return;

    let slaDias = 2;
    try {
        const cc = await getConfig('cartera');
        if (Number.isInteger(cc?.slaRevisionDias) && cc.slaRevisionDias >= 1) slaDias = cc.slaRevisionDias;
    } catch { /* default */ }

    const esOwner = rol === 'owner';
    let pendientes = [];

    const reevaluar = () => {
        const r = pendientesFueraDeSLA(pendientes, slaDias, Date.now());
        let banner = document.getElementById('aviso-solicitudes');
        if (!r.degradado) { banner?.remove(); return; }
        if (!banner) {
            banner = document.createElement('div');
            banner.id = 'aviso-solicitudes';
            banner.style.cssText = 'margin:0 0 16px;padding:12px 16px;border-radius:12px;'
                + 'background:var(--adm-danger-light,#fdecea);color:var(--adm-danger,#c0392b);'
                + 'font-weight:600;font-size:13px;';
            const main = document.querySelector('.adm-content') || document.querySelector('main') || document.body;
            main.prepend(banner);
        }
        banner.textContent = esOwner
            ? `⛔ ${r.vencidas.length} solicitud(es) de corrección llevan más de ${r.slaDias} días esperando TU aprobación — entra a Salud → Aprobaciones pendientes.`
            : `⏳ ${r.vencidas.length} corrección(es) tuya(s) llevan más de ${r.slaDias} días esperando a Daniel — recuérdale por WhatsApp.`;
    };

    onSolicitudesPendientesChange((list) => { pendientes = list; reevaluar(); },
        () => { /* sin acceso o sin red: el aviso simplemente no aparece */ });
    // El umbral también se cruza por puro paso del tiempo con la pestaña abierta
    // (uso típico de tablero): re-evaluación local periódica, cero lecturas extra.
    setInterval(reevaluar, 10 * 60 * 1000);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) reevaluar(); });
}
