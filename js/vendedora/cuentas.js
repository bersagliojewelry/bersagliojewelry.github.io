/**
 * Bersaglio — App de vendedora · Mis clientes + Mi cartera (CRM Bloque 4).
 *
 * Cada vendedora ve SOLO sus clientes (las reglas exigen filtrar por vendedoraUid).
 * Puede crear clientes (a su nombre) y entrar a la ficha. Responsive (móvil y PC).
 */

import { requireAuthExact, currentUser, signOut } from '../auth.js';
import { esc, toast } from './ui.js';
import {
    onClientesDeVendedora, createCliente, fmtCOP, carteraTotals,
} from '../crm-service.js';

let _uid = null;
let _clientes = [];
let _filter = '';

function saldoTxt(saldo) {
    if (typeof saldo !== 'number') return '<span style="color:var(--adm-muted)">—</span>';
    const color = saldo > 0 ? 'var(--adm-danger)' : saldo < 0 ? 'var(--adm-success)' : 'var(--adm-muted)';
    return `<span class="vend-card-saldo" style="color:${color}">${esc(fmtCOP(saldo))}</span>`;
}

function renderSummary() {
    const t = carteraTotals(_clientes);
    document.getElementById('vend-por-cobrar').textContent = fmtCOP(t.porCobrar);
    const aFavor = t.aFavor < 0 ? ` · ${fmtCOP(Math.abs(t.aFavor))} a favor` : '';
    document.getElementById('vend-resumen-sub').textContent = `${t.clientes} cliente${t.clientes === 1 ? '' : 's'}${aFavor}`;
}

function renderList() {
    const list = document.getElementById('clientes-list');
    const empty = document.getElementById('clientes-empty');

    if (!_clientes.length) { list.innerHTML = ''; empty.hidden = false; return; }
    empty.hidden = true;

    const f = _filter.trim().toLowerCase();
    const arr = (f ? _clientes.filter(c => (c.nombre || '').toLowerCase().includes(f)) : _clientes)
        .slice().sort((a, b) => (a.nombre || '').localeCompare(b.nombre || '', 'es'));

    list.innerHTML = arr.map(c => `
        <div class="vend-card" data-id="${esc(c.id)}">
            <div>
                <div class="vend-card-name">${esc(c.nombre || 'Sin nombre')}</div>
                <div class="vend-card-sub">${esc(c.telefono || c.whatsapp || 'Sin teléfono')}</div>
            </div>
            ${saldoTxt(c.saldoActual)}
        </div>
    `).join('') || `<div class="vend-empty">Sin coincidencias para “${esc(_filter)}”.</div>`;
}

function render() { renderSummary(); renderList(); }

// ─── Modal nuevo cliente ──────────────────────────────────────────────────────
function openModal() {
    document.getElementById('cliente-form').reset();
    document.getElementById('cliente-modal').hidden = false;
    document.getElementById('cli-nombre').focus();
}
function closeModal() { document.getElementById('cliente-modal').hidden = true; }

function wire() {
    document.getElementById('btn-logout').addEventListener('click', () => signOut());
    document.getElementById('btn-nuevo-cliente').addEventListener('click', openModal);
    document.getElementById('cliente-modal-close').addEventListener('click', closeModal);
    document.getElementById('cliente-cancel').addEventListener('click', closeModal);
    document.getElementById('cliente-modal').addEventListener('click', (e) => {
        if (e.target.id === 'cliente-modal') closeModal();
    });

    document.getElementById('clientes-list').addEventListener('click', (e) => {
        const card = e.target.closest('.vend-card[data-id]');
        if (!card) return;
        location.href = `vendedora-cliente.html?id=${encodeURIComponent(card.getAttribute('data-id'))}`;
    });

    document.getElementById('cli-search').addEventListener('input', (e) => {
        _filter = e.target.value; renderList();
    });

    document.getElementById('cliente-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const nombre = document.getElementById('cli-nombre').value.trim();
        if (!nombre) { toast('El nombre es obligatorio.', 'danger'); return; }
        const btn = document.getElementById('cliente-save');
        btn.disabled = true;
        try {
            await createCliente({
                nombre,
                telefono:   document.getElementById('cli-telefono').value,
                whatsapp:   document.getElementById('cli-whatsapp').value,
                cumpleanos: document.getElementById('cli-cumpleanos').value,
                vendedoraUid: _uid,
                origen: 'vendedora',
            });
            toast('Cliente creado.');
            closeModal();
        } catch (err) {
            console.error('[vend] createCliente:', err);
            toast('No se pudo crear el cliente.', 'danger');
        } finally {
            btn.disabled = false;
        }
    });
}

async function init() {
    const { user } = await requireAuthExact(['vendedora', 'admin', 'owner']);
    _uid = user.uid;
    wire();
    onClientesDeVendedora(_uid, (list) => { _clientes = list; render(); });
}

init();
