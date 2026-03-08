// Admin Panel — Reviews Management Module
// CRUD for customer reviews stored in Firestore collection 'resenas'
(function() {
    'use strict';

    var $ = function(id) { return document.getElementById(id); };
    var _deleteReviewId = null;

    // Source options for the dropdown
    var SOURCE_LABELS = {
        google_maps: 'Google Maps',
        sitio_web: 'Sitio Web',
        usuario_registrado: 'Usuario Registrado'
    };

    // ========== FIRESTORE LISTENER ==========
    function subscribeReviews() {
        if (!window.db) return;
        if (AP.unsubReviews) AP.unsubReviews();
        var _initialized = false;

        AP.unsubReviews = db.collection('resenas').orderBy('createdAt', 'desc').onSnapshot(function(snap) {
            AP.reviews = [];
            snap.forEach(function(doc) {
                var d = doc.data();
                d._docId = doc.id;
                AP.reviews.push(d);
            });
            if (_initialized && AP.signalCacheInvalidation) AP.signalCacheInvalidation();
            _initialized = true;
            renderReviewsTable();
            updateReviewStats();
            updateReviewBadge();
        }, function(err) {
            console.error('Reviews subscription error:', err);
            var tbody = $('reviewsTableBody');
            if (tbody) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:2rem;color:var(--admin-text-muted);">Error al cargar reseñas: ' + err.message + '</td></tr>';
            }
        });
    }

    function updateReviewBadge() {
        var badge = $('navBadgeReviews');
        if (badge) badge.textContent = AP.reviews.length || '';
    }

    function updateReviewStats() {
        var total = AP.reviews.length;
        var sum = AP.reviews.reduce(function(acc, r) { return acc + (parseInt(r.rating) || 0); }, 0);
        var avg = total > 0 ? (sum / total).toFixed(1) : '0.0';
        var featured = AP.reviews.filter(function(r) { return r.featured; }).length;

        var elTotal = $('reviewStatTotal');
        var elAvg = $('reviewStatAvg');
        var elFeatured = $('reviewStatFeatured');
        if (elTotal) elTotal.textContent = total;
        if (elAvg) elAvg.textContent = avg;
        if (elFeatured) elFeatured.textContent = featured;
    }

    // ========== RENDER TABLE ==========
    function renderStarsSmall(rating) {
        var html = '';
        for (var i = 1; i <= 5; i++) {
            if (i <= rating) {
                html += '<svg width="14" height="14" viewBox="0 0 24 24" fill="#fbbf24" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
            } else {
                html += '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
            }
        }
        return html;
    }

    function renderReviewsTable() {
        var tbody = $('reviewsTableBody');
        if (!tbody) return;

        if (AP.reviews.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:2rem;color:var(--admin-text-muted);">No hay reseñas registradas. Agrega la primera.</td></tr>';
            return;
        }

        var canEdit = AP.RBAC.canEditReview();
        var canDelete = AP.RBAC.canDeleteReview();

        tbody.innerHTML = AP.reviews.map(function(r) {
            var initials = (r.name || 'NN').split(' ').map(function(w) { return w.charAt(0); }).join('').substring(0, 2).toUpperCase();
            var sourceLabel = SOURCE_LABELS[r.source] || r.source || '-';
            var featuredBadge = r.featured
                ? '<span style="display:inline-block;padding:2px 8px;background:rgba(184,150,88,0.2);color:var(--admin-gold);border-radius:4px;font-size:0.75rem;font-weight:600;">Sí</span>'
                : '<span style="color:var(--admin-text-muted);font-size:0.8rem;">No</span>';

            var actions = '';
            if (canEdit) {
                actions += '<button class="btn btn-ghost btn-sm" onclick="AP.editReview(\'' + r._docId + '\')" title="Editar">' +
                    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>' +
                    '</button>';
            }
            if (canDelete) {
                actions += '<button class="btn btn-ghost btn-sm" onclick="AP.deleteReviewConfirm(\'' + r._docId + '\')" title="Eliminar" style="color:var(--admin-danger);">' +
                    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>' +
                    '</button>';
            }

            return '<tr>' +
                '<td>' +
                    '<div style="display:flex;align-items:center;gap:10px;">' +
                        '<div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#b89658,#916652);display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:12px;flex-shrink:0;">' + initials + '</div>' +
                        '<div>' +
                            '<div style="font-weight:600;font-size:0.85rem;">' + AP.escapeHtml(r.name || '') +
                                (r.verified ? ' <svg width="12" height="12" viewBox="0 0 24 24" fill="#10b981" style="vertical-align:middle;"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>' : '') +
                            '</div>' +
                            '<div style="font-size:0.75rem;color:var(--admin-text-muted);">' + AP.escapeHtml(r.location || '') + '</div>' +
                        '</div>' +
                    '</div>' +
                '</td>' +
                '<td><div style="display:flex;gap:1px;">' + renderStarsSmall(parseInt(r.rating) || 0) + '</div></td>' +
                '<td style="font-size:0.85rem;">' + AP.escapeHtml(r.vehicle || '-') + '</td>' +
                '<td style="font-size:0.8rem;color:var(--admin-text-muted);">' + AP.escapeHtml(sourceLabel) + '</td>' +
                '<td>' + featuredBadge + '</td>' +
                '<td style="text-align:right;"><div style="display:flex;gap:4px;justify-content:flex-end;">' + actions + '</div></td>' +
            '</tr>';
        }).join('');
    }

    // ========== MODAL: OPEN / CLOSE ==========
    function openReviewModal(review) {
        var modal = $('reviewModal');
        $('reviewForm').reset();
        $('reviewId').value = '';

        if (review) {
            $('reviewModalTitle').textContent = 'Editar Reseña';
            $('reviewId').value = review._docId;
            $('reviewName').value = review.name || '';
            $('reviewLocation').value = review.location || '';
            $('reviewRating').value = review.rating || 5;
            $('reviewVehicle').value = review.vehicle || '';
            $('reviewText').value = review.text || '';
            $('reviewSource').value = review.source || 'sitio_web';
            $('reviewVerified').checked = review.verified !== false;
            $('reviewFeatured').checked = !!review.featured;
        } else {
            $('reviewModalTitle').textContent = 'Nueva Reseña';
            $('reviewSource').value = 'sitio_web';
            $('reviewVerified').checked = true;
            $('reviewFeatured').checked = false;
        }

        modal.classList.add('active');
    }

    function closeReviewModal() {
        $('reviewModal').classList.remove('active');
    }

    // ========== SAVE ==========
    function saveReview() {
        var name = $('reviewName').value.trim();
        var location = $('reviewLocation').value.trim();
        var rating = parseInt($('reviewRating').value) || 5;
        var vehicle = $('reviewVehicle').value.trim();
        var text = $('reviewText').value.trim();
        var source = $('reviewSource').value || 'sitio_web';
        var verified = $('reviewVerified').checked;
        var featured = $('reviewFeatured').checked;
        var docId = $('reviewId').value;

        if (!name || !text) {
            AP.toast('Completa los campos obligatorios (nombre, texto)', 'error');
            return;
        }

        // Generate avatar initials
        var avatar = name.split(' ').map(function(w) { return w.charAt(0); }).join('').substring(0, 2).toUpperCase();

        var now = new Date().toISOString();
        var data = {
            name: name,
            location: location || 'Cartagena',
            rating: rating,
            vehicle: vehicle,
            text: text,
            source: source,
            verified: verified,
            featured: featured,
            avatar: avatar,
            updatedAt: now
        };

        var saveBtn = $('saveReview');
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<span class="btn-spinner"></span> Guardando...';

        var promise;
        if (docId) {
            promise = db.collection('resenas').doc(docId).update(data);
        } else {
            data.createdAt = now;
            promise = db.collection('resenas').add(data);
        }

        promise.then(function() {
            AP.toast(docId ? 'Reseña actualizada' : 'Reseña creada', 'success');
            AP.writeAuditLog(docId ? 'editar' : 'crear', 'resena', name);
            closeReviewModal();
        }).catch(function(err) {
            AP.toast('Error: ' + err.message, 'error');
        }).finally(function() {
            saveBtn.disabled = false;
            saveBtn.innerHTML = 'Guardar Reseña';
        });
    }

    // ========== EDIT ==========
    function editReview(docId) {
        var review = AP.reviews.find(function(r) { return r._docId === docId; });
        if (!review) {
            AP.toast('Reseña no encontrada', 'error');
            return;
        }
        openReviewModal(review);
    }

    // ========== DELETE ==========
    function deleteReviewConfirm(docId) {
        _deleteReviewId = docId;
        $('reviewDeleteConfirm').classList.add('active');
    }

    function deleteReview() {
        if (!_deleteReviewId) return;

        var review = AP.reviews.find(function(r) { return r._docId === _deleteReviewId; });

        db.collection('resenas').doc(_deleteReviewId).delete().then(function() {
            AP.toast('Reseña eliminada', 'success');
            AP.writeAuditLog('eliminar', 'resena', review ? review.name : _deleteReviewId);
            $('reviewDeleteConfirm').classList.remove('active');
            _deleteReviewId = null;
        }).catch(function(err) {
            AP.toast('Error al eliminar: ' + err.message, 'error');
        });
    }

    // ========== EVENT LISTENERS ==========
    var btnAdd = $('btnAddReview');
    if (btnAdd) btnAdd.addEventListener('click', function() { openReviewModal(null); });

    var btnClose = $('closeReviewModal');
    if (btnClose) btnClose.addEventListener('click', closeReviewModal);

    var btnCancel = $('cancelReviewModal');
    if (btnCancel) btnCancel.addEventListener('click', closeReviewModal);

    var btnSave = $('saveReview');
    if (btnSave) btnSave.addEventListener('click', function(e) { e.preventDefault(); saveReview(); });

    var btnConfirmDelete = $('confirmDeleteReview');
    if (btnConfirmDelete) btnConfirmDelete.addEventListener('click', deleteReview);

    // ========== EXPOSE ==========
    AP.subscribeReviews = subscribeReviews;
    AP.editReview = editReview;
    AP.deleteReviewConfirm = deleteReviewConfirm;
})();
