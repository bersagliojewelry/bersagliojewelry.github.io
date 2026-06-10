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

    // Fallos sin resolver
    const abiertos = _eventos.filter((e) => e.resuelto !== true).length;
    document.getElementById('stat-fallos-valor').textContent = String(abiertos);
    setIcono('stat-fallos-icon', abiertos ? 'red' : 'green');

    renderDescuadres(recon);
}

function renderDescuadres(recon) {
    const sec = document.getElementById('sec-descuadres');
    const tbody = document.getElementById('descuadres-tbody');
    const descuadres = recon?.descuadres || [];

    sec.hidden = descuadres.length === 0;
    if (!descuadres.length) { tbody.innerHTML = ''; return; }

    tbody.innerHTML = descuadres.map((d) => `
        <tr>
            <td style="font-weight:500;"><a href="admin-cuenta.html?id=${encodeURIComponent(d.clienteId)}">${esc(d.nombre)}</a></td>
            <td><span class="adm-money">${esc(fmtCOP(d.saldoGuardado))}</span></td>
            <td><span class="adm-money">${esc(fmtCOP(d.saldoCalculado))}</span></td>
            <td><span class="adm-money">${esc(fmtCOP(d.diferencia))}</span></td>
            <td>
                <button class="adm-btn adm-btn--ghost adm-btn--sm" data-reparar="${esc(d.clienteId)}">Reparar</button>
            </td>
        </tr>`).join('');

    tbody.querySelectorAll('[data-reparar]').forEach((btn) => {
        btn.addEventListener('click', () => handleReparar(btn.dataset.reparar, btn));
    });
}

// ─── Registro de fallos ────────────────────────────────────────────────────────

const TIPO_LABEL = {
    'recalc-saldo-error': 'Falló el recálculo de un saldo',
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
            <td class="adm-td-muted" style="font-size:12px;max-width:280px;overflow:hidden;text-overflow:ellipsis;" title="${esc(e.error || '')}">${esc(e.error || '—')}</td>
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
