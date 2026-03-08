// Admin Panel — Brands CRUD
(function() {
    'use strict';
    var AP = window.AP;
    var $ = AP.$;

    // ========== BRANDS TABLE ==========
    function renderBrandsTable() {
        var html = '';
        AP.brands.forEach(function(b) {
            var count = AP.vehicles.filter(function(v) { return v.marca === b.id; }).length;

            var actions = '';
            if (AP.canCreateOrEditInventory()) {
                actions += '<button class="btn btn-ghost btn-sm" onclick="adminPanel.editBrand(\'' + b.id + '\')">Editar</button> ';
            }
            if (AP.canDeleteInventory()) {
                actions += '<button class="btn btn-danger btn-sm" onclick="adminPanel.deleteBrand(\'' + b.id + '\')">Eliminar</button>';
            }
            if (!actions) actions = '<span style="color:var(--admin-text-muted);font-size:0.75rem;">Solo lectura</span>';

            html += '<tr>' +
                '<td><img class="vehicle-thumb" src="' + (b.logo || '') + '" alt="' + b.nombre + '" onerror="this.style.display=\'none\'" style="width:40px;height:40px;object-fit:contain;"></td>' +
                '<td><code>' + b.id + '</code></td>' +
                '<td><strong>' + b.nombre + '</strong></td>' +
                '<td>' + (b.descripcion || '-') + '</td>' +
                '<td>' + count + '</td>' +
                '<td>' + actions + '</td>' +
            '</tr>';
        });

        if (!html) html = '<tr><td colspan="6" style="text-align:center; padding:2rem;">No hay marcas</td></tr>';
        $('brandsTableBody').innerHTML = html;
    }

    // ========== BRAND MODAL ==========
    function openBrandModal() { $('brandModal').classList.add('active'); }

    function closeBrandModalFn() {
        $('brandModal').classList.remove('active');
        $('brandForm').reset();
        $('bOriginalId').value = '';
        $('brandLogoPreview').innerHTML = '';
    }

    $('brandForm').addEventListener('submit', function(e) { e.preventDefault(); });
    $('brandForm').addEventListener('keydown', function(e) { if (e.key === 'Enter') e.preventDefault(); });

    $('btnAddBrand').addEventListener('click', function() {
        if (!AP.canCreateOrEditInventory()) { AP.toast('No tienes permisos', 'error'); return; }
        $('brandModalTitle').textContent = 'Agregar Marca';
        $('bOriginalId').value = '';
        $('brandForm').reset();
        $('brandLogoPreview').innerHTML = '';
        $('bId').readOnly = false;
        openBrandModal();
    });

    $('closeBrandModal').addEventListener('click', closeBrandModalFn);
    $('cancelBrandModal').addEventListener('click', closeBrandModalFn);

    // Logo preview
    $('bLogo').addEventListener('input', function() {
        var url = this.value.trim();
        if (url) {
            $('brandLogoPreview').innerHTML = '<img src="' + url + '" style="width:60px;height:60px;object-fit:contain;border-radius:6px;background:#1a1a2e;padding:4px;" onerror="this.parentNode.innerHTML=\'<small style=color:var(--admin-danger)>URL no valida</small>\'">';
        } else {
            $('brandLogoPreview').innerHTML = '';
        }
    });

    // Logo file upload
    $('btnUploadBrandLogo').addEventListener('click', function() {
        $('brandLogoFile').click();
    });

    $('brandLogoFile').addEventListener('change', function() {
        var file = this.files[0];
        if (!file) return;
        if (!window.storage) { AP.toast('Storage no disponible', 'error'); return; }

        var status = $('brandLogoUploadStatus');
        status.style.display = 'block';
        status.textContent = 'Subiendo logo...';

        var safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        var path = AP.UPLOAD_CONFIG.storagePath + 'logo_' + Date.now() + '_' + safeName;

        try {
            var ref = window.storage.ref(path);
            ref.put(file).then(function(snapshot) {
                return snapshot.ref.getDownloadURL();
            }).then(function(url) {
                $('bLogo').value = url;
                $('brandLogoPreview').innerHTML = '<img src="' + url + '" style="width:60px;height:60px;object-fit:contain;border-radius:6px;background:#1a1a2e;padding:4px;">';
                status.textContent = 'Logo subido correctamente';
                status.style.color = 'var(--admin-success)';
                setTimeout(function() { status.style.display = 'none'; status.style.color = ''; }, 3000);
            }).catch(function(err) {
                status.textContent = 'Error: ' + (err.message || err.code);
                status.style.color = 'var(--admin-danger)';
            });
        } catch (e) {
            status.textContent = 'Error: ' + e.message;
            status.style.color = 'var(--admin-danger)';
        }

        this.value = '';
    });

    // ========== EDIT BRAND ==========
    function editBrand(brandId) {
        if (!AP.canCreateOrEditInventory()) { AP.toast('No tienes permisos', 'error'); return; }
        var b = AP.brands.find(function(x) { return x.id === brandId; });
        if (!b) return;

        $('brandModalTitle').textContent = 'Editar Marca: ' + b.nombre;
        $('bOriginalId').value = b.id;
        $('bId').value = b.id;
        $('bNombre').value = b.nombre || '';
        $('bLogo').value = b.logo || '';

        if (b.logo) {
            $('brandLogoPreview').innerHTML = '<img src="' + b.logo + '" style="width:60px;height:60px;object-fit:contain;border-radius:6px;background:#1a1a2e;padding:4px;">';
        }

        openBrandModal();
    }

    function generateBrandId(nombre) {
        return nombre.trim().toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    }

    // ========== SAVE BRAND ==========
    $('saveBrand').addEventListener('click', function() {
        if (!AP.canCreateOrEditInventory()) { AP.toast('No tienes permisos', 'error'); return; }

        var form = $('brandForm');
        if (!form.checkValidity()) { form.reportValidity(); return; }

        var nombre = $('bNombre').value.trim();
        var originalId = $('bOriginalId').value;
        var isEdit = !!originalId;
        var brandId = isEdit ? originalId : generateBrandId(nombre);

        var userEmail = window.auth.currentUser ? window.auth.currentUser.email : 'admin';
        var brandData = {
            id: brandId,
            nombre: nombre,
            descripcion: nombre,
            logo: $('bLogo').value.trim(),
            updatedAt: new Date().toISOString(),
            updatedBy: userEmail,
            _type: 'marca'
        };

        var btn = $('saveBrand');
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner"></span> Guardando...';

        window.db.collection('marcas').doc(brandId).set(brandData)
            .then(function() {
                AP.writeAuditLog(isEdit ? 'brand_update' : 'brand_create', 'marca ' + brandId, brandData.nombre);
                AP.toast(isEdit ? 'Marca actualizada' : 'Marca agregada');
                closeBrandModalFn();
                AP.loadData();
            })
            .catch(function(err) {
                if (err.code === 'permission-denied') AP.toast('Sin permisos', 'error');
                else AP.toast('Error: ' + err.message, 'error');
            })
            .finally(function() {
                btn.disabled = false;
                btn.textContent = 'Guardar Marca';
            });
    });

    // ========== DELETE BRAND ==========
    function deleteBrandFn(brandId) {
        if (!AP.canDeleteInventory()) { AP.toast('Solo un Super Admin puede eliminar marcas', 'error'); return; }

        var b = AP.brands.find(function(x) { return x.id === brandId; });
        if (!b) return;

        AP.deleteBrandTargetId = brandId;
        $('deleteBrandName').textContent = b.nombre;
        $('deleteBrandModal').classList.add('active');
    }

    $('closeDeleteBrandModal').addEventListener('click', function() { $('deleteBrandModal').classList.remove('active'); AP.deleteBrandTargetId = null; });
    $('cancelDeleteBrand').addEventListener('click', function() { $('deleteBrandModal').classList.remove('active'); AP.deleteBrandTargetId = null; });

    $('confirmDeleteBrand').addEventListener('click', function() {
        if (!AP.deleteBrandTargetId) return;
        if (!AP.canDeleteInventory()) { AP.toast('Sin permisos', 'error'); return; }

        var btn = $('confirmDeleteBrand');
        btn.disabled = true;
        btn.textContent = 'Eliminando...';

        window.db.collection('marcas').doc(AP.deleteBrandTargetId).delete()
            .then(function() {
                AP.writeAuditLog('brand_delete', 'marca ' + AP.deleteBrandTargetId, '');
                AP.toast('Marca eliminada');
                $('deleteBrandModal').classList.remove('active');
                AP.deleteBrandTargetId = null;
                AP.loadData();
            })
            .catch(function(err) {
                if (err.code === 'permission-denied') AP.toast('Sin permisos para eliminar.', 'error');
                else AP.toast('Error: ' + err.message, 'error');
            })
            .finally(function() {
                btn.disabled = false;
                btn.textContent = 'Eliminar';
            });
    });

    // ========== EXPOSE ==========
    AP.renderBrandsTable = renderBrandsTable;
    AP.editBrand = editBrand;
    AP.deleteBrand = deleteBrandFn;
})();
