/**
 * Bersaglio Admin — Salud del sistema (F6 frente D, solo owner).
 *
 * Tablero de la red de seguridad del dinero: último backup, cuadre de la cartera
 * (reconciliación) y registro de fallos del recálculo de saldos. Los datos los
 * escriben SOLO las Cloud Functions (`salud/*`, `saludEventos/*`); aquí se leen
 * en vivo y se disparan las dos acciones seguras: reconciliar y reparar un saldo.
 *
 * XSS: todo valor dinámico interpolado en HTML pasa por esc() (idioma del panel).
 */

import { admToast, admConfirm, initSidebar, esc, requireAuth, fmtDateTime, currentUser } from './shared.js';
import {
    onSaludChange, onSaludEventosChange, marcarEventoResuelto,
    reconciliarAhora, repararSaldoCliente, fmtCOP,
} from '../crm-service.js';
import { repararSaldoTesoreria } from '../tesoreria-service.js';   // B5 cierre: reparar UNA cuenta
import { initAuditoriaCartera } from './auditoria-cartera.js';

const HORAS_BACKUP_AMBAR = 26;   // el backup corre cada 24h; >26h = se saltó una corrida
const HORAS_BACKUP_ROJO  = 48;

let _salud = {};
let _eventos = [];

async function init() {
    await requireAuth('owner');
    initSidebar();

    onSaludChange((salud) => { _salud = salud; renderEstado(); });
    onSaludEventosChange((eventos) => { _eventos = eventos; renderEstado(); renderEventos(); });

    document.getElementById('btn-reconciliar').addEventListener('click', handleReconciliar);

    // La cola de aprobación (M2b) se MUDÓ a la Bandeja (admin-aprobaciones.html · F-IA-2 B4 · D2/D5).

    // Auditoría detectiva del mes + acta + corte (Fase M · M4) — módulo propio.
    initAuditoriaCartera();
}

// ─── Semáforo + descuadres ─────────────────────────────────────────────────────

function horasDesde(ts) {
    const ms = ts?.toMillis?.() ?? null;
    return ms === null ? Infinity : (Date.now() - ms) / 36e5;
}

function setIcono(id, tono) {
    const el = document.getElementById(id);
    if (el) el.className = `adm-stat-icon adm-stat-icon--${tono}`;
}

function renderEstado() {
    // Backup
    const backup = _salud.backup;
    const hBackup = horasDesde(backup?.ultimoOk);
    document.getElementById('stat-backup-valor').textContent = backup?.ultimoOk
        ? `${fmtDateTime(backup.ultimoOk)} · ${backup.totalDocs ?? '—'} docs`
        : 'Aún no hay registro';
    setIcono('stat-backup-icon',
        hBackup > HORAS_BACKUP_ROJO ? 'red' : hBackup > HORAS_BACKUP_AMBAR ? 'gold' : 'green');

    // Reconciliación
    const recon = _salud.reconciliacion;
    const statRecon = document.getElementById('stat-recon-valor');
    if (!recon?.ultimaCorrida) {
        statRecon.textContent = 'Aún no se ha corrido';
        setIcono('stat-recon-icon', 'gold');
    } else if (recon.ok) {
        statRecon.textContent = `Cuadrada · ${recon.totalClientes} clientes`;
        setIcono('stat-recon-icon', 'green');
    } else {
        statRecon.textContent = `${recon.totalDescuadres} descuadre(s)`;
        setIcono('stat-recon-icon', 'red');
    }

    // Procesos automáticos: 0 avisos abiertos = todo en orden.
    const abiertos = _eventos.filter((e) => e.resuelto !== true).length;
    document.getElementById('stat-fallos-valor').textContent =
        abiertos === 0 ? 'Todo en orden' : `${abiertos} aviso(s) por revisar`;
    setIcono('stat-fallos-icon', abiertos ? 'red' : 'green');

    // B5 (cierre): el mismo control corre para el libro del banco. Si CUALQUIERA falla, la
    // tarjeta se pone en rojo — a Daniel le importa "¿cuadra el dinero?", no de qué libro.
    const teso = _salud.reconciliacionTesoreria;
    if (teso?.ultimaCorrida) {
        statRecon.textContent += teso.ok
            ? ` · bancos: ${teso.totalCuentas} cuadrada(s)`
            : ` · bancos: ${teso.totalDescuadres} descuadre(s)`;
        if (!teso.ok) setIcono('stat-recon-icon', 'red');
    }

    renderDescuadres(recon);
}

function renderDescuadres(recon, teso) {
    const sec = document.getElementById('sec-descuadres');
    const tbody = document.getElementById('descuadres-tbody');
    const descuadres = recon?.descuadres || [];
    // B5 (cierre): las CUENTAS descuadradas van en la MISMA tabla. Para Daniel es el mismo problema
    // ("este saldo no cuadra") y así el aviso tiene su botón de reparar donde se lee — un aviso que
    // no se puede accionar en su propia pantalla es un callejón sin salida.
    const cuentas = teso?.descuadres || [];

    sec.hidden = descuadres.length === 0 && cuentas.length === 0;
    tbody.replaceChildren();                     // DOM seguro (L-79): sin innerHTML ni interpolación
    if (sec.hidden) return;

    const celda = (kids, negrita) => {
        const td = document.createElement('td');
        if (negrita) td.style.fontWeight = '500';
        for (const k of [].concat(kids)) td.appendChild(typeof k === 'string' ? document.createTextNode(k) : k);
        return td;
    };
    const plata = (v) => { const s = document.createElement('span'); s.className = 'adm-money'; s.textContent = fmtCOP(v); return s; };
    const enlace = (href, texto) => { const a = document.createElement('a'); a.href = href; a.textContent = texto; return a; };
    const reparar = (onClick) => {
        const b = document.createElement('button');
        b.className = 'adm-btn adm-btn--ghost adm-btn--sm';
        b.textContent = 'Reparar';
        b.addEventListener('click', () => onClick(b));
        return b;
    };
    const fila = (celdas) => { const tr = document.createElement('tr'); for (const c of celdas) tr.appendChild(c); tbody.appendChild(tr); };

    for (const d of descuadres) {
        fila([
            celda(enlace('admin-cuenta.html?id=' + encodeURIComponent(d.clienteId), d.nombre), true),
            celda(plata(d.saldoGuardado)), celda(plata(d.saldoCalculado)), celda(plata(d.diferencia)),
            celda(reparar((btn) => handleReparar(d.clienteId, btn))),
        ]);
    }
    for (const c of cuentas) {
        fila([
            celda([enlace('admin-tesoreria.html', c.nombre), ' · cuenta bancaria'], true),
            celda(plata(c.saldoGuardado)), celda(plata(c.saldoCalculado)), celda(plata(c.diferencia)),
            celda(reparar((btn) => handleRepararCuenta(c.cuentaId, btn))),
        ]);
    }
}

// ─── Registro de fallos ────────────────────────────────────────────────────────

const TIPO_LABEL = {
    'recalc-saldo-error': 'Falló el recálculo de un saldo',
    'sync-claim-huerfano': 'Usuario con perfil pero sin cuenta de acceso',
    'tesoreria-descuadre': 'Una cuenta bancaria no cuadra con sus movimientos',
    'caja-alerta': 'Movimiento de caja que pide tu atención',
    'cartera-alerta': 'Abono con una anomalía en su registro',
};

function renderEventos() {
    const tbody = document.getElementById('eventos-tbody');
    const empty = document.getElementById('eventos-empty');

    empty.hidden = _eventos.length > 0;
    if (!_eventos.length) { tbody.innerHTML = ''; return; }

    tbody.innerHTML = _eventos.map((e) => `
        <tr>
            <td class="adm-td-muted" style="font-size:12px;white-space:nowrap;">${fmtDateTime(e.at)}</td>
            <td>${esc(TIPO_LABEL[e.tipo] || e.tipo)}</td>
            <td class="adm-td-muted">${e.clienteId ? `<a href="admin-cuenta.html?id=${encodeURIComponent(e.clienteId)}">${esc(e.clienteId)}</a>` : '—'}</td>
            <td class="adm-td-muted" style="font-size:12px;max-width:280px;overflow:hidden;text-overflow:ellipsis;" title="${esc(e.detalle || e.error || '')}">${esc(e.detalle || e.error || '—')}</td>
            <td><span class="adm-pill ${e.resuelto ? 'adm-pill--green' : 'adm-pill--red'}">${e.resuelto ? 'Resuelto' : 'Abierto'}</span></td>
            <td>${e.resuelto ? '' : `<button class="adm-btn adm-btn--ghost adm-btn--sm" data-resolver="${esc(e.id)}">Marcar resuelto</button>`}</td>
        </tr>`).join('');

    tbody.querySelectorAll('[data-resolver]').forEach((btn) => {
        btn.addEventListener('click', () => handleResolver(btn.dataset.resolver));
    });
}

// ─── Acciones ──────────────────────────────────────────────────────────────────

async function handleReconciliar() {
    const btn = document.getElementById('btn-reconciliar');
    btn.disabled = true;
    try {
        const r = await reconciliarAhora();
        admToast(r.ok
            ? `Cartera cuadrada: ${r.totalClientes} clientes revisados`
            : `Atención: ${r.totalDescuadres} descuadre(s) encontrado(s)`, r.ok ? 'success' : 'danger');
    } catch (err) {
        admToast(`No se pudo reconciliar: ${err.message}`, 'danger');
    } finally {
        btn.disabled = false;
    }
}

/**
 * B5 (cierre) · recalcula el saldo de UNA cuenta desde su ledger (CF `repararSaldoTesoreria`, la
 * MISMA fórmula del trigger). No crea ni borra plata: vuelve a sumar el libro, que es la verdad.
 */
function handleRepararCuenta(cuentaId, btn) {
    admConfirm('¿Recalcular el saldo de esta cuenta desde sus movimientos? Es una operación segura: no crea ni borra plata, solo vuelve a sumar el libro.', async () => {
        btn.disabled = true;
        let reparado = false;
        try {
            const r = await repararSaldoTesoreria({ cuentaId });
            reparado = true;
            admToast('Saldo de la cuenta recalculado: ' + fmtCOP(r?.saldo?.monto ?? r?.saldo ?? 0));
            await reconciliarAhora();   // refresca la lista en vivo
        } catch (err) {
            // Un fallo del REFRESCO no es un fallo de la REPARACIÓN (ya quedó en la base).
            admToast(reparado
                ? 'Saldo recalculado, pero no se pudo refrescar la lista. Recarga la página.'
                : 'No se pudo recalcular: ' + (err?.message || err), reparado ? 'success' : 'danger', 6000);
        } finally {
            btn.disabled = false;
        }
    });
}

function handleReparar(clienteId, btn) {
    admConfirm('¿Recalcular el saldo de este cliente desde sus movimientos? Es una operación segura.', async () => {
        btn.disabled = true;
        let reparado = false;
        try {
            const r = await repararSaldoCliente(clienteId);
            reparado = true;
            admToast(`Saldo reparado: ${fmtCOP(r.saldo)}`);
            await reconciliarAhora();   // refresca la lista de descuadres en vivo
        } catch (err) {
            // Un fallo del REFRESCO no es un fallo de la REPARACIÓN (ya quedó en la base).
            admToast(reparado
                ? 'Saldo reparado, pero no se pudo refrescar la lista — pulsa "Reconciliar ahora"'
                : `No se pudo reparar: ${err.message}`, 'danger');
            btn.disabled = false;
        }
    });
}

function handleResolver(eventoId) {
    admConfirm('¿Marcar este fallo como resuelto? Quedará en el registro como atendido.', async () => {
        try {
            const uid = currentUser()?.user?.uid;
            if (!uid) { admToast('La sesión expiró — vuelve a iniciar sesión', 'danger'); return; }
            await marcarEventoResuelto(eventoId, uid);
            admToast('Fallo marcado como resuelto');
        } catch (err) {
            admToast(`No se pudo marcar: ${err.message}`, 'danger');
        }
    });
}

init();
