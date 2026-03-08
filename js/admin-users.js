// Admin Panel — Users CRUD (via Cloud Functions)
(function() {
    'use strict';
    var AP = window.AP;
    var $ = AP.$;

    // ========== USERS TABLE ==========
    function renderUsersTable() {
        if (!AP.users.length) {
            $('usersTableBody').innerHTML = '<tr><td colspan="5" style="text-align:center;padding:2rem;color:var(--admin-text-muted);">No hay usuarios registrados</td></tr>';
            return;
        }

        var currentUid = window.auth.currentUser ? window.auth.currentUser.uid : '';
        var html = '';
        AP.users.forEach(function(u) {
            var rolLabel = u.rol === 'super_admin' ? 'Super Admin' : u.rol === 'editor' ? 'Editor' : 'Viewer';
            var rolClass = u.rol === 'super_admin' ? 'badge-destacado' : u.rol === 'editor' ? 'badge-nuevo' : 'badge-usado';
            var estadoClass = u.estado === 'activo' ? 'badge-nuevo' : 'badge-usado';
            var isSelf = u._docId === currentUid;

            html += '<tr>' +
                '<td><strong>' + (u.nombre || '-') + '</strong>' + (isSelf ? ' <small style="color:var(--admin-gold);">(tu)</small>' : '') + '</td>' +
                '<td>' + (u.email || '-') + '</td>' +
                '<td><span class="badge ' + rolClass + '">' + rolLabel + '</span></td>' +
                '<td><span class="badge ' + estadoClass + '">' + (u.estado || 'activo') + '</span></td>' +
                '<td>' +
                    '<button class="btn btn-ghost btn-sm" onclick="adminPanel.editUser(\'' + u._docId + '\')">Editar</button> ' +
                    (isSelf ? '' : '<button class="btn btn-danger btn-sm" onclick="adminPanel.deleteUser(\'' + u._docId + '\')">Eliminar</button>') +
                '</td>' +
            '</tr>';
        });

        $('usersTableBody').innerHTML = html;
    }

    // ========== USER MODAL ==========
    function openUserModal() { $('userModal').classList.add('active'); }

    function closeUserModalFn() {
        $('userModal').classList.remove('active');
        $('userForm').reset();
        $('uOriginalUid').value = '';
        $('uPasswordGroup').style.display = '';
        $('uPassword').required = true;
        $('uEmail').readOnly = false;
        $('saveUser').textContent = 'Crear Usuario';
    }

    $('btnAddUser').addEventListener('click', function() {
        if (!AP.canManageUsers()) { AP.toast('No tienes permisos', 'error'); return; }
        $('userModalTitle').textContent = 'Crear Usuario';
        $('uOriginalUid').value = '';
        $('userForm').reset();
        $('uPasswordGroup').style.display = '';
        $('uPassword').required = true;
        $('uEmail').readOnly = false;
        $('saveUser').textContent = 'Crear Usuario';
        openUserModal();
    });

    $('closeUserModal').addEventListener('click', closeUserModalFn);
    $('cancelUserModal').addEventListener('click', closeUserModalFn);
    $('userForm').addEventListener('submit', function(e) { e.preventDefault(); });
    $('userForm').addEventListener('keydown', function(e) { if (e.key === 'Enter') e.preventDefault(); });

    // ========== EDIT USER ==========
    function editUser(uid) {
        if (!AP.canManageUsers()) { AP.toast('No tienes permisos', 'error'); return; }
        var u = AP.users.find(function(x) { return x._docId === uid; });
        if (!u) return;

        $('userModalTitle').textContent = 'Editar Usuario';
        $('uOriginalUid').value = uid;
        $('uNombre').value = u.nombre || '';
        $('uEmail').value = u.email || '';
        $('uEmail').readOnly = true;
        $('uRol').value = u.rol || 'editor';
        $('uPasswordGroup').style.display = 'none';
        $('uPassword').required = false;
        $('saveUser').textContent = 'Guardar Cambios';
        openUserModal();
    }

    // ========== SAVE USER ==========
    $('saveUser').addEventListener('click', function() {
        if (!AP.canManageUsers()) { AP.toast('No tienes permisos', 'error'); return; }

        var form = $('userForm');
        if (!form.checkValidity()) { form.reportValidity(); return; }

        var originalUid = $('uOriginalUid').value;
        var isEdit = !!originalUid;
        var nombre = $('uNombre').value.trim();
        var email = $('uEmail').value.trim();
        var rol = $('uRol').value;
        var password = $('uPassword').value;

        var btn = $('saveUser');
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner"></span> Guardando...';

        if (!window.functions) {
            AP.toast('Cloud Functions no disponibles. Verifica que esten desplegadas.', 'error');
            btn.disabled = false;
            btn.textContent = isEdit ? 'Guardar Cambios' : 'Crear Usuario';
            return;
        }

        if (isEdit) {
            var updateUserRole = window.functions.httpsCallable('updateUserRoleV2');
            updateUserRole({ uid: originalUid, nombre: nombre, rol: rol })
                .then(function(result) {
                    AP.toast(result.data.message || 'Usuario actualizado');
                    closeUserModalFn();
                    AP.loadUsers();
                })
                .catch(function(err) {
                    AP.toast(AP.parseCallableError(err), 'error');
                })
                .finally(function() {
                    btn.disabled = false;
                    btn.textContent = 'Guardar Cambios';
                });
        } else {
            var createManagedUser = window.functions.httpsCallable('createManagedUserV2');
            createManagedUser({ nombre: nombre, email: email, password: password, rol: rol })
                .then(function(result) {
                    AP.toast(result.data.message || 'Usuario creado exitosamente');
                    closeUserModalFn();
                    AP.loadUsers();
                })
                .catch(function(err) {
                    AP.toast(AP.parseCallableError(err), 'error');
                })
                .finally(function() {
                    btn.disabled = false;
                    btn.textContent = 'Crear Usuario';
                });
        }
    });

    // ========== DELETE USER ==========
    function deleteUserFn(uid) {
        if (!AP.canManageUsers()) { AP.toast('No tienes permisos', 'error'); return; }
        if (AP._deletingUser) { AP.toast('Ya hay una eliminacion en curso...', 'info'); return; }

        var currentUid = window.auth.currentUser ? window.auth.currentUser.uid : '';
        if (uid === currentUid) {
            AP.toast('No puedes eliminar tu propia cuenta', 'error');
            return;
        }

        if (!window.functions) {
            AP.toast('Cloud Functions no disponibles. Verifica que esten desplegadas.', 'error');
            return;
        }

        var u = AP.users.find(function(x) { return x._docId === uid; });
        if (!u) return;

        if (!confirm('Eliminar usuario "' + (u.nombre || u.email) + '"?\n\nSe eliminara tanto su perfil como su cuenta de autenticacion. Esta accion no se puede deshacer.')) {
            return;
        }

        AP._deletingUser = true;
        AP.toast('Eliminando usuario...', 'info');

        document.querySelectorAll('#usersTableBody .btn-danger').forEach(function(b) { b.disabled = true; });

        var deleteManagedUser = window.functions.httpsCallable('deleteManagedUserV2');
        deleteManagedUser({ uid: uid })
            .then(function(result) {
                AP.toast(result.data.message || 'Usuario eliminado completamente');
                AP.loadUsers();
            })
            .catch(function(err) {
                AP.toast(AP.parseCallableError(err), 'error');
            })
            .finally(function() {
                AP._deletingUser = false;
                document.querySelectorAll('#usersTableBody .btn-danger').forEach(function(b) { b.disabled = false; });
            });
    }

    // ========== EXPOSE ==========
    AP.renderUsersTable = renderUsersTable;
    AP.editUser = editUser;
    AP.deleteUser = deleteUserFn;
})();
