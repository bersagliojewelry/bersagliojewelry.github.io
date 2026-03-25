/**
 * Bersaglio Admin — Usuarios (User Role Management)
 * Only accessible by the Owner role.
 */

import { admToast, admConfirm, initSidebar, esc, requireAuth } from './shared.js';
import { createUserProfile, updateUserRole, deactivateUser } from '../auth.js';
import { firestoreDb } from '../firebase-config.js';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

let _users = [];

async function init() {
    await requireAuth('owner');
    initSidebar();

    await loadUsers();
    renderTable();

    document.getElementById('btn-new-user').addEventListener('click', () => openModal());
    initModal();
}

async function loadUsers() {
    try {
        const snap = await getDocs(collection(firestoreDb, 'users'));
        _users = snap.docs.map(d => ({ uid: d.id, ...d.data() }));
    } catch (err) {
        admToast('Error al cargar usuarios', 'danger');
        _users = [];
    }
}

function renderTable() {
    const tbody = document.getElementById('users-tbody');
    const empty = document.getElementById('users-empty');

    empty.hidden = _users.length > 0;
    if (!_users.length) { tbody.innerHTML = ''; return; }

    const rolePill = (role) => {
        const cls = role === 'owner' ? 'adm-pill--gold' : role === 'admin' ? 'adm-pill--green' : 'adm-pill--gray';
        return `<span class="adm-pill ${cls}">${esc(role)}</span>`;
    };

    tbody.innerHTML = _users.map(u => {
        const lastLogin = u.lastLogin?.toDate?.()
            ? u.lastLogin.toDate().toLocaleDateString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
            : '—';
        const active = u.active !== false;

        return `
        <tr>
            <td style="font-weight:500;">${esc(u.displayName || '—')}</td>
            <td class="adm-td-muted">${esc(u.email || '—')}</td>
            <td>${rolePill(u.role)}</td>
            <td>
                <span class="adm-pill ${active ? 'adm-pill--green' : 'adm-pill--red'}">
                    ${active ? 'Activo' : 'Inactivo'}
                </span>
            </td>
            <td class="adm-td-muted" style="font-size:12px;">${lastLogin}</td>
            <td>
                ${u.role !== 'owner' ? `
                    <div class="adm-table-actions">
                        <button class="adm-btn adm-btn--ghost adm-btn--sm" data-action="edit" data-uid="${u.uid}">Editar rol</button>
                        <button class="adm-btn adm-btn--icon adm-btn--danger" data-action="deactivate" data-uid="${u.uid}" title="${active ? 'Desactivar' : 'Ya inactivo'}">
                            <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14"><path fill-rule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clip-rule="evenodd"/></svg>
                        </button>
                    </div>
                ` : '<span class="adm-td-muted" style="font-size:11px;">Protegido</span>'}
            </td>
        </tr>`;
    }).join('');

    tbody.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', () => {
            const { action, uid } = btn.dataset;
            if (action === 'edit') openEditModal(uid);
            if (action === 'deactivate') handleDeactivate(uid);
        });
    });
}

// ─── Modal ───────────────────────────────────────────────────────────────────

function initModal() {
    document.getElementById('user-modal-close').addEventListener('click', closeModal);
    document.getElementById('user-modal-cancel').addEventListener('click', closeModal);
    document.getElementById('user-modal-save').addEventListener('click', handleSave);
}

function openModal() {
    document.getElementById('user-form').reset();
    document.getElementById('uf-uid').disabled = false;
    document.getElementById('user-modal-title').textContent = 'Agregar usuario';
    document.getElementById('user-modal').hidden = false;
    document.getElementById('uf-uid').focus();
}

function openEditModal(uid) {
    const user = _users.find(u => u.uid === uid);
    if (!user) return;

    document.getElementById('uf-uid').value = uid;
    document.getElementById('uf-uid').disabled = true;
    document.getElementById('uf-email').value = user.email || '';
    document.getElementById('uf-name').value = user.displayName || '';
    document.getElementById('uf-role').value = user.role || 'editor';
    document.getElementById('user-modal-title').textContent = 'Editar rol de usuario';
    document.getElementById('user-modal').hidden = false;
}

function closeModal() {
    document.getElementById('user-modal').hidden = true;
}

async function handleSave() {
    const form = document.getElementById('user-form');
    const uid  = document.getElementById('uf-uid').value.trim();
    const email = form.querySelector('[name="email"]').value.trim();
    const name  = form.querySelector('[name="displayName"]').value.trim();
    const role  = form.querySelector('[name="role"]').value;

    if (!uid || !email || !name || !role) {
        admToast('Completa todos los campos', 'danger');
        return;
    }

    try {
        const existing = _users.find(u => u.uid === uid);
        if (existing) {
            // Update role
            await updateUserRole(uid, role);
            admToast(`Rol de ${name} actualizado a "${role}"`);
        } else {
            // Create new user profile
            await createUserProfile(uid, { email, displayName: name, role });
            admToast(`Usuario "${name}" agregado como ${role}`);
        }

        await loadUsers();
        renderTable();
        closeModal();
    } catch (err) {
        admToast(err.message, 'danger');
    }
}

async function handleDeactivate(uid) {
    const user = _users.find(u => u.uid === uid);
    admConfirm(
        `¿Desactivar a "${user?.displayName || user?.email}"? No podrá acceder al panel.`,
        async () => {
            try {
                await deactivateUser(uid);
                await loadUsers();
                renderTable();
                admToast('Usuario desactivado');
            } catch (err) {
                admToast(err.message, 'danger');
            }
        }
    );
}

init();
