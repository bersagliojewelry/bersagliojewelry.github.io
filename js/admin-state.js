// Admin Panel — Shared State & Utilities
// All modules read/write through window.AP to share state
(function() {
    'use strict';

    var AP = {
        // ========== DATA ==========
        vehicles: [],
        brands: [],
        users: [],
        dealers: [],
        appointments: [],
        auditLogEntries: [],
        banners: [],
        reviews: [],

        // ========== UI STATE ==========
        deleteTargetId: null,
        deleteBrandTargetId: null,
        uploadedImageUrls: [],
        bannerUploadedUrl: '',

        // ========== SUBSCRIPTIONS ==========
        unsubVehicles: null,
        unsubBrands: null,
        unsubAppointments: null,
        unsubDealers: null,
        unsubAuditLog: null,
        unsubBanners: null,
        unsubReviews: null,

        // ========== RBAC STATE ==========
        currentUserProfile: null,
        currentUserRole: null,
        INACTIVITY_TIMEOUT_MS: 10 * 60 * 1000,
        inactivityTimerId: null,
        inactivityTrackingActive: false,
        ACTIVITY_EVENTS: ['mousemove', 'touchstart', 'touchmove'],

        // ========== ACTIVITY STATE ==========
        ACTIVITY_PAGE_SIZE: 10,
        activityExpanded: false,
        activitySelectMode: false,
        selectedActivityIds: [],

        // ========== SYNC STATE ==========
        _vehiclesLoaded: false,
        _brandsLoaded: false,
        _loadingTimeout: null,
        _retryCount: 0,
        MAX_RETRIES: 3,

        // ========== CALENDAR STATE ==========
        calendarMonth: new Date().getMonth(),
        calendarYear: new Date().getFullYear(),
        blockedDates: {},
        blockedHours: {},

        // ========== UPLOAD CONFIG ==========
        UPLOAD_CONFIG: {
            maxFileSizeMB: 2,
            maxWidthPx: 1200,
            compressionQuality: 0.75,
            allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
            storagePath: 'cars/'
        },

        FREE_TIER: {
            storageGB: 5,
            egressGB: 100,
            classAOps: 5000,
            classBOps: 50000
        },

        // ========== DRAFT STATE ==========
        draftInterval: null,
        _dragSrcIdx: null,
        _deletingUser: false,

        // ========== RBAC CHECKS ==========
        isSuperAdmin: function() { return AP.currentUserRole === 'super_admin'; },
        isEditor: function() { return AP.currentUserRole === 'editor'; },
        isViewer: function() { return AP.currentUserRole === 'viewer'; },
        canManageUsers: function() { return AP.isSuperAdmin(); },
        canCreateOrEditInventory: function() { return AP.isSuperAdmin() || AP.isEditor(); },
        canDeleteInventory: function() { return AP.isSuperAdmin(); },
        isEditorOrAbove: function() { return AP.isSuperAdmin() || AP.isEditor(); },

        // ========== HELPERS ==========
        $: function(id) { return document.getElementById(id); },

        toast: function(msg, type) {
            var t = AP.$('adminToast');
            t.textContent = msg;
            t.className = 'admin-toast ' + (type || 'success') + ' show';
            setTimeout(function() { t.classList.remove('show'); }, 5000);
        },

        toTitleCase: function(str) {
            if (!str) return '';
            return str.trim().toLowerCase().replace(/(?:^|\s)\S/g, function(c) { return c.toUpperCase(); });
        },

        formatPrice: function(n) {
            if (!n) return '-';
            return '$' + Number(n).toLocaleString('es-CO');
        },

        escapeHtml: function(str) {
            var div = document.createElement('div');
            div.textContent = str || '';
            return div.innerHTML;
        },

        capitalize: function(str) {
            if (!str) return '';
            return str.charAt(0).toUpperCase() + str.slice(1);
        },

        formatTimeAgo: function(isoString) {
            try {
                var date = new Date(isoString);
                var now = new Date();
                var diffMs = now - date;
                var diffSec = Math.floor(diffMs / 1000);
                var diffMin = Math.floor(diffSec / 60);
                var diffHours = Math.floor(diffMin / 60);
                var diffDays = Math.floor(diffHours / 24);

                if (diffSec < 60) return 'Hace un momento';
                if (diffMin < 60) return 'Hace ' + diffMin + (diffMin === 1 ? ' minuto' : ' minutos');
                if (diffHours < 24) return 'Hace ' + diffHours + (diffHours === 1 ? ' hora' : ' horas');
                if (diffDays < 7) return 'Hace ' + diffDays + (diffDays === 1 ? ' dia' : ' dias');

                return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
            } catch (e) {
                return '';
            }
        },

        parseCallableError: function(err) {
            var code = (err.code || '').replace('functions/', '');
            var serverMsg = err.message || '';
            var detailsMsg = '';

            if (typeof err.details === 'string') {
                detailsMsg = err.details;
            } else if (err.details && typeof err.details === 'object') {
                detailsMsg = err.details.originalMessage || err.details.message || '';
            }

            if (!serverMsg || serverMsg.toLowerCase() === code || serverMsg.toLowerCase() === 'internal') {
                serverMsg = detailsMsg || serverMsg;
            }

            var map = {
                'unauthenticated': 'Tu sesion expiro. Inicia sesion de nuevo.',
                'permission-denied': serverMsg || 'No tienes permisos para esta accion.',
                'invalid-argument': serverMsg || 'Datos invalidos. Revisa el formulario.',
                'not-found': serverMsg || 'El recurso no fue encontrado.',
                'already-exists': serverMsg || 'Este registro ya existe.',
                'failed-precondition': serverMsg || 'No se puede completar la accion.',
                'unavailable': 'Servicio no disponible. Las Cloud Functions no estan desplegadas o hay un problema de red.',
                'internal': serverMsg || 'Error interno del servidor.',
                'deadline-exceeded': 'La operacion tardo demasiado. Intenta de nuevo.'
            };

            return map[code] || serverMsg || 'Error desconocido: ' + (err.message || err.code || 'sin detalles');
        },

        compressImage: function(file) {
            return new Promise(function(resolve, reject) {
                if (file.size <= 200 * 1024 && file.type === 'image/webp') {
                    resolve(file);
                    return;
                }

                var img = new Image();
                var canvas = document.createElement('canvas');
                var reader = new FileReader();

                reader.onload = function(e) {
                    img.onload = function() {
                        var maxW = AP.UPLOAD_CONFIG.maxWidthPx;
                        var w = img.width;
                        var h = img.height;

                        if (w > maxW) {
                            h = Math.round(h * (maxW / w));
                            w = maxW;
                        }

                        canvas.width = w;
                        canvas.height = h;

                        var ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, w, h);

                        var outputType = 'image/webp';
                        var quality = AP.UPLOAD_CONFIG.compressionQuality;

                        canvas.toBlob(function(blob) {
                            if (!blob) {
                                canvas.toBlob(function(jpegBlob) {
                                    if (!jpegBlob) { resolve(file); return; }
                                    var name = file.name.replace(/\.[^.]+$/, '') + '_compressed.jpg';
                                    resolve(new File([jpegBlob], name, { type: 'image/jpeg' }));
                                }, 'image/jpeg', quality);
                                return;
                            }
                            var name = file.name.replace(/\.[^.]+$/, '') + '_compressed.webp';
                            resolve(new File([blob], name, { type: outputType }));
                        }, outputType, quality);
                    };

                    img.onerror = function() { reject(new Error('No se pudo leer la imagen')); };
                    img.src = e.target.result;
                };

                reader.onerror = function() { reject(new Error('No se pudo leer el archivo')); };
                reader.readAsDataURL(file);
            });
        },

        // ========== AUDIT LOG ==========
        writeAuditLog: function(action, target, details) {
            try {
                var userEmail = (window.auth && window.auth.currentUser) ? window.auth.currentUser.email : 'unknown';
                var logEntry = {
                    action: action,
                    target: target,
                    details: details || '',
                    user: userEmail,
                    timestamp: new Date().toISOString()
                };
                window.db.collection('auditLog').add(logEntry).catch(function() {});
            } catch (e) {}
        },

        ESTADO_LABELS: {
            disponible: { text: 'Disponible', cls: 'badge-success' },
            reservado:  { text: 'Reservado',  cls: 'badge-warning' },
            vendido:    { text: 'Vendido',    cls: 'badge-danger' },
            borrador:   { text: 'Borrador',   cls: 'badge-muted' }
        }
    };

    // ========== GRANULAR RBAC MATRIX ==========
    AP.RBAC = {
        // Users: super_admin only
        canViewUsers:         function() { return AP.isSuperAdmin(); },
        canManageUsers:       function() { return AP.isSuperAdmin(); },
        // Vehicles: editor+ create/edit, super_admin delete
        canViewVehicles:      function() { return true; },
        canCreateVehicle:     function() { return AP.isSuperAdmin() || AP.isEditor(); },
        canEditVehicle:       function() { return AP.isSuperAdmin() || AP.isEditor(); },
        canDeleteVehicle:     function() { return AP.isSuperAdmin(); },
        // Brands: editor+ create/edit, super_admin delete
        canViewBrands:        function() { return true; },
        canCreateBrand:       function() { return AP.isSuperAdmin() || AP.isEditor(); },
        canEditBrand:         function() { return AP.isSuperAdmin() || AP.isEditor(); },
        canDeleteBrand:       function() { return AP.isSuperAdmin(); },
        // Appointments: editor+ manage, super_admin delete
        canViewAppointments:  function() { return true; },
        canManageAppointment: function() { return AP.isSuperAdmin() || AP.isEditor(); },
        canDeleteAppointment: function() { return AP.isSuperAdmin(); },
        // Dealers: super_admin full, editor view only
        canViewDealers:       function() { return AP.isSuperAdmin() || AP.isEditor(); },
        canManageDealers:     function() { return AP.isSuperAdmin(); },
        // Lists: super_admin edit, editor view
        canViewLists:         function() { return AP.isSuperAdmin() || AP.isEditor(); },
        canEditLists:         function() { return AP.isSuperAdmin(); },
        // Settings & Backup
        canExportBackup:      function() { return AP.isSuperAdmin(); },
        canImportBackup:      function() { return AP.isSuperAdmin(); },
        // Activity log
        canViewActivity:      function() { return true; },
        canDeleteActivity:    function() { return AP.isSuperAdmin(); },
        // Banners: super_admin full, editor can create/edit
        canViewBanners:       function() { return AP.isSuperAdmin() || AP.isEditor(); },
        canCreateBanner:      function() { return AP.isSuperAdmin() || AP.isEditor(); },
        canEditBanner:        function() { return AP.isSuperAdmin() || AP.isEditor(); },
        canDeleteBanner:      function() { return AP.isSuperAdmin(); },
        // Reviews: editor+ create/edit, super_admin delete
        canViewReviews:       function() { return AP.isSuperAdmin() || AP.isEditor(); },
        canCreateReview:      function() { return AP.isSuperAdmin() || AP.isEditor(); },
        canEditReview:        function() { return AP.isSuperAdmin() || AP.isEditor(); },
        canDeleteReview:      function() { return AP.isSuperAdmin(); }
    };

    window.AP = AP;

    // Compatibility alias: HTML onclick handlers reference adminPanel.xxx()
    window.adminPanel = AP;
})();
