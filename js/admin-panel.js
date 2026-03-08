// Admin Panel Logic for ALTORRA CARS
// With full RBAC (Role-Based Access Control)
(function() {
    'use strict';

    // FASE 16: Slug helper (mirrors scripts/generate-vehicles.mjs & render.js)
    function _slugifyVehicle(v) {
        return [v.marca, v.modelo, v.year, v.id].filter(Boolean).join('-')
            .toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }

    var vehicles = [];
    var brands = [];
    var users = [];
    var deleteTargetId = null;
    var deleteBrandTargetId = null;
    var uploadedImageUrls = [];
    var unsubVehicles = null;
    var unsubBrands = null;

    // ========== RBAC STATE ==========
    var currentUserProfile = null;
    var currentUserRole = null;
    var INACTIVITY_TIMEOUT_MS = 10 * 60 * 1000;
    var inactivityTimerId = null;
    var inactivityTrackingActive = false;

    var ACTIVITY_EVENTS = ['mousemove', 'touchstart', 'touchmove'];

    function isSuperAdmin() { return currentUserRole === 'super_admin'; }
    function isEditor() { return currentUserRole === 'editor'; }
    function isViewer() { return currentUserRole === 'viewer'; }

    // ========== GRANULAR RBAC MATRIX ==========
    // Module-level permission checks
    var RBAC = {
        // Users: super_admin only
        canViewUsers:        function() { return isSuperAdmin(); },
        canManageUsers:      function() { return isSuperAdmin(); },
        // Vehicles: editor+ create/edit, super_admin delete
        canViewVehicles:     function() { return true; },
        canCreateVehicle:    function() { return isSuperAdmin() || isEditor(); },
        canEditVehicle:      function() { return isSuperAdmin() || isEditor(); },
        canDeleteVehicle:    function() { return isSuperAdmin(); },
        // Brands: editor+ create/edit, super_admin delete
        canViewBrands:       function() { return true; },
        canCreateBrand:      function() { return isSuperAdmin() || isEditor(); },
        canEditBrand:        function() { return isSuperAdmin() || isEditor(); },
        canDeleteBrand:      function() { return isSuperAdmin(); },
        // Appointments: editor+ manage, super_admin delete
        canViewAppointments: function() { return true; },
        canManageAppointment:function() { return isSuperAdmin() || isEditor(); },
        canDeleteAppointment:function() { return isSuperAdmin(); },
        // Dealers: super_admin full, editor view only
        canViewDealers:      function() { return isSuperAdmin() || isEditor(); },
        canManageDealers:    function() { return isSuperAdmin(); },
        // Lists: super_admin edit, editor view
        canViewLists:        function() { return isSuperAdmin() || isEditor(); },
        canEditLists:        function() { return isSuperAdmin(); },
        // Settings & Backup
        canExportBackup:     function() { return isSuperAdmin(); },
        canImportBackup:     function() { return isSuperAdmin(); },
        // Activity log
        canViewActivity:     function() { return true; },
        canDeleteActivity:   function() { return isSuperAdmin(); }
    };

    // Backwards-compatible aliases
    function canManageUsers() { return RBAC.canManageUsers(); }
    function canCreateOrEditInventory() { return RBAC.canCreateVehicle(); }
    function canDeleteInventory() { return RBAC.canDeleteVehicle(); }

    // ========== CONFIG ==========
    var UPLOAD_CONFIG = {
        maxFileSizeMB: 2,
        maxWidthPx: 1200,
        compressionQuality: 0.75,
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
        storagePath: 'cars/'
    };

    var FREE_TIER = {
        storageGB: 5,
        egressGB: 100,
        classAOps: 5000,
        classBOps: 50000
    };

    // ========== HELPERS ==========
    function $(id) { return document.getElementById(id); }

    function toast(msg, type) {
        var t = $('adminToast');
        t.textContent = msg;
        t.className = 'admin-toast ' + (type || 'success') + ' show';
        setTimeout(function() { t.classList.remove('show'); }, 5000);
    }

    function clearInactivityTimer() {
        if (inactivityTimerId) {
            clearTimeout(inactivityTimerId);
            inactivityTimerId = null;
        }
    }

    function stopInactivityTracking() {
        clearInactivityTimer();
        if (!inactivityTrackingActive) return;
        ACTIVITY_EVENTS.forEach(function(eventName) {
            document.removeEventListener(eventName, resetInactivityTracking, true);
        });
        inactivityTrackingActive = false;
    }

    function handleInactivityTimeout() {
        clearInactivityTimer();
        if (!window.auth || !window.auth.currentUser) return;
        toast('Sesion cerrada por inactividad (10 minutos).', 'info');
        window.auth.signOut();
    }

    function resetInactivityTracking() {
        if (!inactivityTrackingActive) return;
        clearInactivityTimer();
        inactivityTimerId = setTimeout(handleInactivityTimeout, INACTIVITY_TIMEOUT_MS);
    }

    function startInactivityTracking() {
        if (inactivityTrackingActive) return;
        ACTIVITY_EVENTS.forEach(function(eventName) {
            document.addEventListener(eventName, resetInactivityTracking, true);
        });
        inactivityTrackingActive = true;
        resetInactivityTracking();
    }

    // Parse Firebase Callable errors into user-friendly Spanish messages
    function parseCallableError(err) {
        // Firebase callable errors: err.code = 'functions/CODE', err.message = server message
        var code = (err.code || '').replace('functions/', '');
        var serverMsg = err.message || '';
        var detailsMsg = '';

        if (typeof err.details === 'string') {
            detailsMsg = err.details;
        } else if (err.details && typeof err.details === 'object') {
            detailsMsg = err.details.originalMessage || err.details.message || '';
        }

        // Compat SDK may return generic strings like "internal" while the useful message is in details
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
    }

    // Normaliza texto a Title Case: primera letra de cada palabra en mayúscula, resto en minúscula
    function toTitleCase(str) {
        if (!str) return '';
        return str.trim().toLowerCase().replace(/(?:^|\s)\S/g, function(c) { return c.toUpperCase(); });
    }

    function formatPrice(n) {
        if (!n) return '-';
        return '$' + Number(n).toLocaleString('es-CO');
    }

    // ========== IMAGE COMPRESSION ==========
    function compressImage(file) {
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
                    var maxW = UPLOAD_CONFIG.maxWidthPx;
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
                    var quality = UPLOAD_CONFIG.compressionQuality;

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
    }

    // ========== AUTH + RBAC INITIALIZATION ==========
    function initAuth() {
        window.firebaseReady.then(function() {
            window.auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
                .catch(function(err) {
                    console.warn('[Auth] No se pudo aplicar persistence LOCAL:', err);
                })
                .finally(function() {
                    window.auth.onAuthStateChanged(function(user) {
                        if (user) {
                            loadUserProfile(user);
                        } else {
                            currentUserProfile = null;
                            currentUserRole = null;
                            stopInactivityTracking();
                            showLogin();
                        }
                    });
                });
        });
    }

    function loadUserProfile(authUser) {
        // Step 1: Try to read own profile (always allowed by rules)
        window.db.collection('usuarios').doc(authUser.uid).get()
            .then(function(doc) {
                if (doc.exists) {
                    currentUserProfile = doc.data();
                    currentUserProfile._docId = doc.id;
                    currentUserRole = currentUserProfile.rol;
                    console.log('[RBAC] Profile loaded. Role:', currentUserRole, 'Email:', authUser.email);
                    showAdmin(authUser);
                } else {
                    // No profile -> deny access (bootstrap function no longer used)
                    console.warn('[RBAC] No profile found for authenticated user:', authUser.uid);
                    showAccessDenied(authUser.email, authUser.uid, 'No tienes perfil administrativo asignado. Un Super Admin debe crearlo.');
                }
            })
            .catch(function(err) {
                console.error('[RBAC] Error loading profile:', err);
                if (err.code === 'permission-denied') {
                    showAccessDenied(authUser.email, authUser.uid, 'Las reglas de seguridad impiden leer tu perfil. Contacta al Super Admin.');
                } else {
                    showAccessDenied(authUser.email, authUser.uid, 'Error al cargar perfil: ' + err.message);
                }
            });
    }

    function showAccessDenied(email, uid, reason) {
        stopInactivityTracking();
        resetLoginBtn();
        $('loginScreen').style.display = 'flex';
        $('adminPanel').style.display = 'none';
        var errEl = $('loginError');
        errEl.style.display = 'block';
        var msg = 'Acceso denegado para ' + email + '.';
        if (reason) {
            msg += '\n' + reason;
        } else {
            msg += '\nNo tienes un perfil de administrador.';
        }
        if (uid) {
            msg += '\n\nTu UID: ' + uid;
            msg += '\nCompartelo con el Super Admin para que te cree un perfil.';
        }
        errEl.style.whiteSpace = 'pre-line';
        errEl.textContent = msg;
        window.auth.signOut();
    }

    function showLogin() {
        stopInactivityTracking();
        stopRealtimeSync();
        resetLoginBtn();
        $('loginScreen').style.display = 'flex';
        $('adminPanel').style.display = 'none';
        $('loginForm').reset();
    }

    function showAdmin(user) {
        resetLoginBtn();
        $('loginScreen').style.display = 'none';
        $('adminPanel').style.display = 'flex';
        $('adminEmail').textContent = user.email + ' (' + (currentUserRole === 'super_admin' ? 'Super Admin' : currentUserRole === 'editor' ? 'Editor' : 'Viewer') + ')';

        writeAuditLog('login', 'sesion', user.email);
        startInactivityTracking();
        applyRolePermissions();
        loadData();
    }

    // ========== APPLY ROLE PERMISSIONS TO UI ==========
    function applyRolePermissions() {
        // Sidebar navigation visibility per module
        var navRules = {
            'dashboard':    true,
            'vehicles':     RBAC.canViewVehicles(),
            'brands':       RBAC.canViewBrands(),
            'banners':      true,
            'appointments': RBAC.canViewAppointments(),
            'dealers':      RBAC.canViewDealers(),
            'lists':        RBAC.canViewLists(),
            'users':        RBAC.canViewUsers(),
            'settings':     true
        };
        Object.keys(navRules).forEach(function(section) {
            var navEl = document.querySelector('.nav-item[data-section="' + section + '"]');
            if (navEl) navEl.style.display = navRules[section] ? '' : 'none';
        });

        // Create/action buttons per module
        var btnRules = {
            'btnAddVehicle': RBAC.canCreateVehicle(),
            'btnAddBrand':   RBAC.canCreateBrand(),
            'btnAddDealer':  RBAC.canManageDealers(),
            'btnSaveLists':  RBAC.canEditLists(),
            'exportBackup':  RBAC.canExportBackup(),
            'importBackup':  RBAC.canImportBackup()
        };
        Object.keys(btnRules).forEach(function(id) {
            var el = $(id);
            if (el) el.style.display = btnRules[id] ? '' : 'none';
        });
    }

    // ========== LOGIN ==========
    function resetLoginBtn() {
        var btn = $('loginBtn');
        btn.disabled = false;
        btn.innerHTML = 'Iniciar Sesion';
    }

    $('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        var email = $('loginEmail').value.trim();
        var pass = $('loginPassword').value;
        var errEl = $('loginError');
        var btn = $('loginBtn');

        if (!email || !pass) return;

        btn.disabled = true;
        btn.innerHTML = '<span class="btn-spinner"></span> Ingresando...';
        errEl.style.display = 'none';

        // Timeout safety: if Firebase never resolves, restore button after 15s
        var loginTimeout = setTimeout(function() {
            resetLoginBtn();
            errEl.style.display = 'block';
            errEl.textContent = 'Tiempo de espera agotado. Verifica tu conexion e intenta de nuevo.';
        }, 15000);

        window.firebaseReady.then(function() {
                // Persistence already set in initAuth, go straight to sign in
                return window.auth.signInWithEmailAndPassword(email, pass);
            })
            .then(function() {
                clearTimeout(loginTimeout);
                // onAuthStateChanged will handle showing the admin panel
                // Keep button in loading state until panel shows
            })
            .catch(function(error) {
                clearTimeout(loginTimeout);
                resetLoginBtn();
                errEl.style.display = 'block';
                if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                    errEl.textContent = 'Correo o contrasena incorrectos';
                } else if (error.code === 'auth/too-many-requests') {
                    errEl.textContent = 'Demasiados intentos. Espera un momento.';
                } else if (error.code === 'auth/network-request-failed') {
                    errEl.textContent = 'Sin conexion a internet. Verifica tu red.';
                } else {
                    errEl.textContent = 'Error: ' + error.message;
                }
            });
    });

    $('logoutBtn').addEventListener('click', function() {
        window.firebaseReady.then(function() {
            window.auth.signOut();
        });
    });

    // Change password (requires recent login re-auth)
    $('changePasswordForm').addEventListener('submit', function(e) {
        e.preventDefault();

        var currentUser = window.auth.currentUser;
        if (!currentUser || !currentUser.email) {
            toast('Sesion invalida. Inicia sesion de nuevo.', 'error');
            window.auth.signOut();
            return;
        }

        var newPass = $('newPassword').value;
        var currentPass = window.prompt('Para cambiar la contrasena, confirma tu contrasena actual:');
        if (!currentPass) {
            toast('Cambio de contrasena cancelado.', 'info');
            return;
        }

        var credential = firebase.auth.EmailAuthProvider.credential(currentUser.email, currentPass);

        currentUser.reauthenticateWithCredential(credential)
            .then(function() {
                return currentUser.updatePassword(newPass);
            })
            .then(function() {
                toast('Contrasena actualizada');
                $('newPassword').value = '';
            })
            .catch(function(err) {
                if (err && (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential')) {
                    toast('Contrasena actual incorrecta.', 'error');
                } else {
                    toast('Error: ' + (err && err.message ? err.message : 'No se pudo cambiar la contrasena.'), 'error');
                }
            });
    });

    // ========== MOBILE MENU ==========
    var hamburgerBtn = $('hamburgerBtn');
    var sidebar = $('adminSidebar');
    var sidebarOverlay = $('sidebarOverlay');

    function toggleMobileMenu() {
        var isOpen = sidebar.classList.toggle('open');
        hamburgerBtn.classList.toggle('active', isOpen);
        sidebarOverlay.classList.toggle('active', isOpen);
    }

    function closeMobileMenu() {
        sidebar.classList.remove('open');
        hamburgerBtn.classList.remove('active');
        sidebarOverlay.classList.remove('active');
    }

    if (hamburgerBtn) hamburgerBtn.addEventListener('click', toggleMobileMenu);
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeMobileMenu);

    var mobileLogoutBtn = $('mobileLogoutBtn');
    if (mobileLogoutBtn) {
        mobileLogoutBtn.addEventListener('click', function() { if (window.auth) window.auth.signOut(); });
    }

    // ========== NAVIGATION WITH PERMISSION GUARD ==========
    document.querySelectorAll('.nav-item[data-section]').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var section = this.getAttribute('data-section');

            // Guard: prevent non-super-admin from accessing users section
            if (section === 'users' && !canManageUsers()) {
                toast('No tienes permisos para acceder a esta seccion', 'error');
                return;
            }

            document.querySelectorAll('.nav-item').forEach(function(n) { n.classList.remove('active'); });
            this.classList.add('active');
            document.querySelectorAll('.section').forEach(function(s) { s.classList.remove('active'); });
            $('sec-' + section).classList.add('active');
            closeMobileMenu();
        });
    });

    // ========== REAL-TIME SYNC (onSnapshot) ==========
    var _vehiclesLoaded = false;
    var _brandsLoaded = false;
    var _loadingTimeout = null;
    var _retryCount = 0;
    var MAX_RETRIES = 3;

    function startRealtimeSync() {
        // Detach previous listeners if any
        stopRealtimeSync();
        _vehiclesLoaded = false;
        _brandsLoaded = false;

        // Safety timeout: if data doesn't arrive in 15s, show error state
        if (_loadingTimeout) clearTimeout(_loadingTimeout);
        _loadingTimeout = setTimeout(function() {
            if (!_vehiclesLoaded || !_brandsLoaded) {
                console.warn('[LoadTimeout] Data not loaded within 15s. vehicles=' + _vehiclesLoaded + ', brands=' + _brandsLoaded);
                if (_retryCount < MAX_RETRIES) {
                    _retryCount++;
                    console.log('[LoadRetry] Attempting retry #' + _retryCount);
                    toast('Reintentando cargar datos... (intento ' + _retryCount + '/' + MAX_RETRIES + ')', 'warning');
                    startRealtimeSync();
                } else {
                    showLoadingError();
                }
            }
        }, 15000);

        unsubVehicles = window.db.collection('vehiculos').onSnapshot(function(snap) {
            _vehiclesLoaded = true;
            vehicles = snap.docs.map(function(d) { return d.data(); });
            renderVehiclesTable();
            updateStats();
            renderActivityFeed();
            updateEstimator();
            updateNavBadges();
            renderVehiclesByOrigin();
            renderDealersList();
            renderPropiosTab();
            renderSalesTracking();
            checkLoadingComplete();
        }, function(err) {
            console.error('Vehicles snapshot error:', err);
            handleSnapshotError('vehiculos', err);
        });

        unsubBrands = window.db.collection('marcas').onSnapshot(function(snap) {
            _brandsLoaded = true;
            brands = snap.docs.map(function(d) { return d.data(); });
            renderBrandsTable();
            populateBrandSelect();
            updateStats();
            renderActivityFeed();
            updateNavBadges();
            checkLoadingComplete();
        }, function(err) {
            console.error('Brands snapshot error:', err);
            handleSnapshotError('marcas', err);
        });

        // Only load users if super_admin (avoids permission errors for editor/viewer)
        if (canManageUsers()) {
            loadUsers();
        }
    }

    function checkLoadingComplete() {
        if (_vehiclesLoaded && _brandsLoaded) {
            if (_loadingTimeout) { clearTimeout(_loadingTimeout); _loadingTimeout = null; }
            _retryCount = 0;
        }
    }

    function handleSnapshotError(collection, err) {
        if (err.code === 'permission-denied') {
            toast('Sin permisos para acceder a ' + collection + '. Verifica tu rol.', 'error');
        }
    }

    function showLoadingError() {
        var vBody = $('vehiclesTableBody');
        if (vBody && vehicles.length === 0) {
            vBody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:2rem;color:#f85149;">' +
                'Error al cargar vehiculos. <a href="#" onclick="adminPanel.retryLoad();return false;" style="color:#58a6ff;text-decoration:underline;">Reintentar</a>' +
                '</td></tr>';
        }
        toast('No se pudieron cargar los datos. Verifica tu conexion a internet.', 'error');
    }

    function retryLoad() {
        _retryCount = 0;
        toast('Recargando datos...', 'info');
        loadData();
    }

    function stopRealtimeSync() {
        if (unsubVehicles) { unsubVehicles(); unsubVehicles = null; }
        if (unsubBrands) { unsubBrands(); unsubBrands = null; }
        if (unsubAppointments) { unsubAppointments(); unsubAppointments = null; }
        if (unsubDealers) { unsubDealers(); unsubDealers = null; }
        if (unsubAuditLog) { unsubAuditLog(); unsubAuditLog = null; }
    }

    // Backward-compatible alias — existing calls to loadData() trigger a one-time fetch
    function loadData() {
        startRealtimeSync();
        // Phase 5: Load appointments, dealers, availability config, and audit log
        try {
            loadAppointments();
            loadDealers();
            loadAvailabilityConfig();
            loadAuditLog();
        } catch (e) {
            console.warn('[Phase5] Error loading:', e);
        }
        // Fase 18: Start listening for active drafts
        startDraftsListener();
    }

    // ========== FASE 18: ACTIVE DRAFTS REAL-TIME LISTENER ==========
    var unsubDrafts = null;

    function startDraftsListener() {
        if (!window.db) return;
        try {
            unsubDrafts = window.db.collection('drafts_activos').onSnapshot(function(snap) {
                var drafts = [];
                snap.forEach(function(doc) { drafts.push(doc.data()); });
                renderActiveDrafts(drafts);
            }, function() {
                // Permission denied or collection doesn't exist — silent fail
            });
        } catch (_) {}
    }

    function renderActiveDrafts(drafts) {
        var panel = $('activeDraftsPanel');
        var list = $('activeDraftsList');
        if (!panel || !list) return;

        // Filter out stale drafts (older than 2 hours)
        var now = Date.now();
        var TWO_HOURS = 2 * 60 * 60 * 1000;
        drafts = drafts.filter(function(d) {
            if (!d.lastSaved) return false;
            return (now - new Date(d.lastSaved).getTime()) < TWO_HOURS;
        });

        if (drafts.length === 0) {
            panel.style.display = 'none';
            return;
        }

        panel.style.display = 'block';
        var currentUid = window.auth && window.auth.currentUser ? window.auth.currentUser.uid : '';

        list.innerHTML = drafts.map(function(d) {
            var label = ((d.marca || '') + ' ' + (d.modelo || '') + ' ' + (d.year || '')).trim() || 'Sin titulo';
            var email = d.userEmail || 'Admin';
            var initials = email.substring(0, 2).toUpperCase();
            var ago = d.lastSaved ? formatTimeAgo(d.lastSaved) : '';
            var isOwn = d.userId === currentUid;
            var editingLabel = d.vehicleId ? ('Editando #' + d.vehicleId) : 'Nuevo vehiculo';
            var btnHtml = isOwn
                ? '<span style="color:var(--admin-success);font-size:0.7rem;font-weight:500;">Tu borrador</span>'
                : '<button class="btn btn-ghost btn-sm" onclick="adminPanel.loadDraftFromUser(\'' + (d.userId || '') + '\')">Continuar</button>';

            return '<div class="draft-item">'
                + '<div class="draft-item-info">'
                + '<div class="draft-item-avatar">' + initials + '</div>'
                + '<div class="draft-item-text">'
                + '<div class="draft-item-label">' + label + ' <small style="color:var(--admin-text-muted);">(' + editingLabel + ')</small></div>'
                + '<div class="draft-item-meta">' + email + ' · ' + ago + '</div>'
                + '</div></div>'
                + '<div class="draft-item-actions">' + btnHtml + '</div>'
                + '</div>';
        }).join('');
    }

    // Fase 18: Load another admin's draft into the form
    function loadDraftFromUser(userId) {
        if (!window.db || !userId) return;
        window.db.collection('usuarios').doc(userId).collection('drafts').doc('vehicleDraft').get()
            .then(function(doc) {
                if (!doc.exists) { toast('Borrador no encontrado — puede que ya se haya guardado.', 'info'); return; }
                var snap = doc.data();
                if (!snap || !snap.vMarca) { toast('Borrador vacio', 'info'); return; }
                // Open the add vehicle modal and restore the draft
                $('modalTitle').textContent = 'Continuar Borrador';
                $('vId').value = snap.vId || '';
                $('vehicleForm').reset();
                // Dispatch to admin-vehicles restoreFormSnapshot via exposed API
                if (typeof adminPanel.restoreAndOpenDraft === 'function') {
                    adminPanel.restoreAndOpenDraft(snap);
                } else {
                    toast('Funcion de restauracion no disponible', 'error');
                }
            })
            .catch(function() { toast('No se pudo cargar el borrador de este usuario', 'error'); });
    }

    function loadUsers() {
        if (!canManageUsers()) {
            // Double-guard: editor/viewer should never reach here
            console.warn('[RBAC] loadUsers blocked: user is not super_admin');
            return;
        }
        window.db.collection('usuarios').get().then(function(snap) {
            users = snap.docs.map(function(d) {
                var data = d.data();
                data._docId = d.id;
                return data;
            });
            renderUsersTable();
        }).catch(function(err) {
            console.error('Error loading users:', err);
            var msg = 'Error al cargar usuarios.';
            if (err.code === 'permission-denied') {
                msg = 'Sin permisos para ver usuarios. Verifica que las Firestore Rules esten desplegadas y tu rol sea super_admin.';
            } else {
                msg += ' ' + err.message;
            }
            $('usersTableBody').innerHTML = '<tr><td colspan="5" style="text-align:center;padding:2rem;color:var(--admin-text-muted);">' + msg + '</td></tr>';
        });
    }

    function updateStats() {
        $('statTotal').textContent = vehicles.length;
        $('statNuevos').textContent = vehicles.filter(function(v) { return v.tipo === 'nuevo'; }).length;
        $('statUsados').textContent = vehicles.filter(function(v) { return v.tipo === 'usado'; }).length;
        $('statOfertas').textContent = vehicles.filter(function(v) { return v.oferta || v.precioOferta; }).length;
        $('statDestacados').textContent = vehicles.filter(function(v) { return v.destacado; }).length;
        $('statMarcas').textContent = brands.length;
        $('statVendidos').textContent = vehicles.filter(function(v) { return v.estado === 'vendido'; }).length;
        var citasEl = $('statCitas');
        if (citasEl) citasEl.textContent = AP.appointments.length > 0 ? AP.appointments.filter(function(a) { return a.estado === 'pendiente'; }).length : '-';
    }

    // ========== ACTIVITY FEED (persistent via auditLog) ==========
    var ACTIVITY_PAGE_SIZE = 10;
    var activityExpanded = false;
    var auditLogEntries = [];
    var unsubAuditLog = null;
    var activitySelectMode = false;
    var selectedActivityIds = [];

    function loadAuditLog() {
        if (unsubAuditLog) unsubAuditLog();
        unsubAuditLog = window.db.collection('auditLog')
            .orderBy('timestamp', 'desc')
            .limit(200)
            .onSnapshot(function(snap) {
                auditLogEntries = snap.docs.map(function(doc) {
                    var data = doc.data();
                    data._docId = doc.id;
                    return data;
                });
                renderActivityFeed();
            }, function(err) {
                console.warn('[AuditLog] Error loading:', err);
                // Fallback to old method
                renderActivityFeedFallback();
            });
    }

    function getActivityIcon(action) {
        var icons = {
            'login': '🔑',
            'vehicle_create': '➕',
            'vehicle_update': '✏️',
            'vehicle_delete': '🗑️',
            'vehicle_sold': '💰',
            'brand_create': '🏷️',
            'brand_update': '🏷️',
            'brand_delete': '🗑️',
            'dealer_create': '🏢',
            'dealer_update': '🏢',
            'backup_export': '📦',
            'backup_import': '📥',
            'list_update': '📋',
            'appointment_confirmada': '📅',
            'appointment_cancelada': '❌'
        };
        return icons[action] || '📝';
    }

    function getActivityText(item) {
        var actionTexts = {
            'login': 'inició sesión',
            'vehicle_create': 'creó vehículo',
            'vehicle_update': 'actualizó vehículo',
            'vehicle_delete': 'eliminó vehículo',
            'vehicle_sold': 'registró venta de',
            'brand_create': 'creó marca',
            'brand_update': 'actualizó marca',
            'brand_delete': 'eliminó marca',
            'dealer_create': 'creó concesionario',
            'dealer_update': 'actualizó concesionario',
            'backup_export': 'exportó respaldo',
            'backup_import': 'importó respaldo',
            'list_update': 'actualizó lista',
            'appointment_confirmada': 'confirmó cita',
            'appointment_cancelada': 'canceló cita'
        };
        return actionTexts[item.action] || item.action || 'realizó acción';
    }

    function buildActivityItemHTML(item) {
        var who = item.user || item.updatedBy || 'Admin';
        if (who.indexOf('@') > 0) {
            who = who.split('@')[0];
        }

        var when = (item.timestamp || item.updatedAt) ? formatTimeAgo(item.timestamp || item.updatedAt) : '';
        var icon = getActivityIcon(item.action || item._actType);
        var actionText = getActivityText(item);
        var target = item.target || item.details || '';
        var details = item.details || '';
        var docId = item._docId || '';

        var checkboxHtml = '';
        if (activitySelectMode && docId) {
            var checked = selectedActivityIds.indexOf(docId) >= 0 ? ' checked' : '';
            checkboxHtml = '<input type="checkbox" class="activity-checkbox" data-id="' + docId + '"' + checked + '> ';
        }

        return '<div class="activity-item' + (activitySelectMode ? ' selectable' : '') + '" data-doc-id="' + docId + '">' +
            checkboxHtml +
            '<span class="activity-icon">' + icon + '</span>' +
            '<div class="activity-content">' +
                '<span class="activity-who">' + escapeHtml(who) + '</span> ' +
                actionText + ' ' +
                (target ? '<span class="activity-vehicle">' + escapeHtml(target) + '</span>' : '') +
                (details && details !== target ? ' <span class="activity-details">' + escapeHtml(details) + '</span>' : '') +
                '<div class="activity-time">' + when + '</div>' +
            '</div>' +
        '</div>';
    }

    function renderActivityFeed() {
        var feed = $('activityFeed');
        if (!feed) return;

        var allItems = auditLogEntries.slice();

        if (allItems.length === 0) {
            feed.innerHTML = '<div class="activity-empty">Sin actividad reciente</div>';
            updateActivityControls(0);
            return;
        }

        var showAll = activityExpanded;
        var visible = showAll ? allItems : allItems.slice(0, ACTIVITY_PAGE_SIZE);

        var html = visible.map(buildActivityItemHTML).join('');

        if (!showAll && allItems.length > ACTIVITY_PAGE_SIZE) {
            html += '<button class="activity-show-more" id="btnActivityMore">Ver toda la actividad (' + allItems.length + ' registros)</button>';
        } else if (showAll && allItems.length > ACTIVITY_PAGE_SIZE) {
            html += '<button class="activity-show-more" id="btnActivityLess">Mostrar menos</button>';
        }

        feed.innerHTML = html;
        updateActivityControls(allItems.length);

        // Attach checkbox listeners
        if (activitySelectMode) {
            feed.querySelectorAll('.activity-checkbox').forEach(function(cb) {
                cb.addEventListener('change', function() {
                    var id = this.getAttribute('data-id');
                    if (this.checked) {
                        if (selectedActivityIds.indexOf(id) === -1) selectedActivityIds.push(id);
                    } else {
                        selectedActivityIds = selectedActivityIds.filter(function(x) { return x !== id; });
                    }
                    updateDeleteSelectedBtn();
                });
            });
        }

        var btnMore = $('btnActivityMore');
        if (btnMore) {
            btnMore.addEventListener('click', function() {
                activityExpanded = true;
                feed.style.maxHeight = 'none';
                renderActivityFeed();
            });
        }
        var btnLess = $('btnActivityLess');
        if (btnLess) {
            btnLess.addEventListener('click', function() {
                activityExpanded = false;
                feed.style.maxHeight = '420px';
                renderActivityFeed();
                feed.scrollTop = 0;
            });
        }
    }

    function renderActivityFeedFallback() {
        var feed = $('activityFeed');
        if (!feed) return;

        var allItems = [];
        vehicles.forEach(function(v) { if (v.updatedAt) allItems.push(v); });
        brands.forEach(function(b) { if (b.updatedAt) allItems.push(Object.assign({ _actType: 'brand' }, b)); });
        allItems.sort(function(a, b) { return (b.updatedAt || '').localeCompare(a.updatedAt || ''); });

        if (allItems.length === 0) {
            feed.innerHTML = '<div class="activity-empty">Sin actividad reciente</div>';
            return;
        }

        var visible = allItems.slice(0, ACTIVITY_PAGE_SIZE);
        feed.innerHTML = visible.map(function(item) {
            var who = item.updatedBy || 'Admin';
            if (who.indexOf('@') > 0) who = who.split('@')[0];
            var when = item.updatedAt ? formatTimeAgo(item.updatedAt) : '';
            var icon = item._actType === 'brand' ? '🏷️' : (item._version === 1 ? '➕' : '✏️');
            var name = item._actType === 'brand' ? (item.nombre || '') : ((item.marca ? capitalize(item.marca) : '') + ' ' + (item.modelo || '') + ' ' + (item.year || '')).trim();
            return '<div class="activity-item"><span class="activity-icon">' + icon + '</span><div class="activity-content"><span class="activity-who">' + escapeHtml(who) + '</span> actualizó <span class="activity-vehicle">' + escapeHtml(name) + '</span><div class="activity-time">' + when + '</div></div></div>';
        }).join('');
    }

    function updateActivityControls(count) {
        var countEl = $('activityCount');
        if (countEl) countEl.textContent = count > 0 ? '(' + count + ')' : '';
    }

    function updateDeleteSelectedBtn() {
        var btn = $('btnDeleteSelectedActivity');
        if (btn) {
            btn.textContent = 'Eliminar seleccionados (' + selectedActivityIds.length + ')';
            btn.disabled = selectedActivityIds.length === 0;
        }
    }

    function toggleActivitySelectMode() {
        activitySelectMode = !activitySelectMode;
        selectedActivityIds = [];
        var btn = $('btnSelectActivity');
        if (btn) {
            btn.textContent = activitySelectMode ? 'Cancelar' : 'Seleccionar';
            btn.className = activitySelectMode ? 'btn btn-ghost btn-sm' : 'btn btn-ghost btn-sm';
        }
        var actionsEl = $('activitySelectActions');
        if (actionsEl) actionsEl.style.display = activitySelectMode ? 'flex' : 'none';
        renderActivityFeed();
    }

    function deleteSelectedActivity() {
        if (!RBAC.canDeleteActivity()) { toast('Sin permisos para eliminar actividad', 'error'); return; }
        if (selectedActivityIds.length === 0) return;
        if (!confirm('Eliminar ' + selectedActivityIds.length + ' registros de actividad?')) return;
        var batch = window.db.batch();
        selectedActivityIds.forEach(function(docId) {
            batch.delete(window.db.collection('auditLog').doc(docId));
        });
        batch.commit().then(function() {
            toast(selectedActivityIds.length + ' registros eliminados');
            selectedActivityIds = [];
            activitySelectMode = false;
            var btn = $('btnSelectActivity');
            if (btn) btn.textContent = 'Seleccionar';
            var actionsEl = $('activitySelectActions');
            if (actionsEl) actionsEl.style.display = 'none';
        }).catch(function(err) {
            toast('Error al eliminar: ' + err.message, 'error');
        });
    }

    function clearAllActivity() {
        if (!RBAC.canDeleteActivity()) { toast('Sin permisos para eliminar actividad', 'error'); return; }
        if (!confirm('Eliminar TODA la actividad reciente? Esta accion no se puede deshacer.')) return;
        var batch = window.db.batch();
        var count = 0;
        auditLogEntries.forEach(function(entry) {
            if (entry._docId) {
                batch.delete(window.db.collection('auditLog').doc(entry._docId));
                count++;
            }
        });
        if (count === 0) { toast('No hay actividad para limpiar', 'info'); return; }
        batch.commit().then(function() {
            toast(count + ' registros de actividad eliminados');
            activitySelectMode = false;
            selectedActivityIds = [];
            var btn = $('btnSelectActivity');
            if (btn) btn.textContent = 'Seleccionar';
            var actionsEl = $('activitySelectActions');
            if (actionsEl) actionsEl.style.display = 'none';
        }).catch(function(err) {
            toast('Error: ' + err.message, 'error');
        });
    }

    function formatTimeAgo(isoString) {
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

            // Show full date for older entries
            return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
        } catch (e) {
            return '';
        }
    }

    function escapeHtml(str) {
        var div = document.createElement('div');
        div.textContent = str || '';
        return div.innerHTML;
    }

    function capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    function populateBrandSelect() {
        var select = $('vMarca');
        var currentVal = select.value;
        select.innerHTML = '<option value="">Seleccionar...</option>';
        brands.sort(function(a, b) { return a.nombre.localeCompare(b.nombre); });
        brands.forEach(function(b) {
            var opt = document.createElement('option');
            opt.value = b.id;
            opt.textContent = b.nombre;
            select.appendChild(opt);
        });
        if (currentVal) select.value = currentVal;
    }

    // ========== STORAGE ESTIMATOR ==========
    function updateEstimator() {
        var el = $('storageEstimator');
        if (!el) return;

        var totalImages = 0;
        vehicles.forEach(function(v) {
            if (v.imagenes && v.imagenes.length) {
                v.imagenes.forEach(function(url) {
                    if (url && (url.indexOf('firebasestorage') >= 0 || url.indexOf('storage.googleapis') >= 0)) {
                        totalImages++;
                    }
                });
            }
        });

        var avgSizeKB = 150;
        var storageUsedMB = (totalImages * avgSizeKB) / 1024;
        var storageUsedGB = storageUsedMB / 1024;
        var storagePct = (storageUsedGB / FREE_TIER.storageGB) * 100;

        var visitsInput = $('estVisitas');
        var monthlyVisits = visitsInput ? (parseInt(visitsInput.value) || 500) : 500;
        var avgImagesPerVisit = 8;
        var egressGB = (monthlyVisits * avgImagesPerVisit * avgSizeKB) / (1024 * 1024);
        var egressPct = (egressGB / FREE_TIER.egressGB) * 100;

        var classAUsed = totalImages;
        var classAPct = (classAUsed / FREE_TIER.classAOps) * 100;

        var classBUsed = monthlyVisits * avgImagesPerVisit;
        var classBPct = (classBUsed / FREE_TIER.classBOps) * 100;

        var maxPct = Math.max(storagePct, egressPct, classAPct, classBPct);

        var html = '<div class="est-grid">' +
            renderEstBar('Almacenamiento', storageUsedMB.toFixed(1) + ' MB', storageUsedGB.toFixed(3) + ' / ' + FREE_TIER.storageGB + ' GB', storagePct) +
            renderEstBar('Egreso mensual', egressGB.toFixed(2) + ' GB', egressGB.toFixed(2) + ' / ' + FREE_TIER.egressGB + ' GB', egressPct) +
            renderEstBar('Op. Clase A (subidas)', classAUsed, classAUsed + ' / ' + FREE_TIER.classAOps.toLocaleString(), classAPct) +
            renderEstBar('Op. Clase B (lecturas)', classBUsed.toLocaleString(), classBUsed.toLocaleString() + ' / ' + FREE_TIER.classBOps.toLocaleString(), classBPct) +
        '</div>';

        if (maxPct >= 70) {
            html += '<div style="margin-top:0.75rem;padding:0.5rem 0.75rem;background:rgba(210,153,34,0.15);border:1px solid var(--admin-warning);border-radius:6px;font-size:0.8rem;color:var(--admin-warning);">Te estas acercando al limite gratuito. Considera reducir imagenes o visitas.</div>';
        } else {
            html += '<div style="margin-top:0.5rem;font-size:0.75rem;color:var(--admin-text-muted);">' + totalImages + ' imagenes en Storage | Compresion automatica activa (~150KB/img)</div>';
        }

        el.innerHTML = html;
    }

    function renderEstBar(label, value, detail, pct) {
        var color = pct >= 90 ? 'var(--admin-danger)' : pct >= 70 ? 'var(--admin-warning)' : 'var(--admin-success)';
        var clampedPct = Math.min(pct, 100);
        return '<div class="est-item"><div style="display:flex;justify-content:space-between;font-size:0.75rem;margin-bottom:2px;"><span>' + label + '</span><span style="color:var(--admin-text-muted);">' + detail + '</span></div><div style="height:6px;background:var(--admin-border);border-radius:3px;overflow:hidden;"><div style="height:100%;width:' + clampedPct + '%;background:' + color + ';border-radius:3px;transition:width 0.3s;"></div></div></div>';
    }

    // ========== NAV BADGES ==========
    function updateNavBadges() {
        var vBadge = $('navBadgeVehicles');
        var bBadge = $('navBadgeBrands');
        if (vBadge) vBadge.textContent = vehicles.length || '';
        if (bBadge) bBadge.textContent = brands.length || '';
    }

    // ========== VEHICLES TABLE (RBAC-aware) ==========
    var ESTADO_LABELS = {
        disponible: { text: 'Disponible', cls: 'badge-success' },
        reservado:  { text: 'Reservado',  cls: 'badge-warning' },
        vendido:    { text: 'Vendido',    cls: 'badge-danger' },
        borrador:   { text: 'Borrador',   cls: 'badge-muted' }
    };

    function renderVehiclesTable(filter) {
        var filtered = vehicles;
        if (filter) {
            var q = filter.toLowerCase();
            filtered = vehicles.filter(function(v) {
                return (v.marca + ' ' + v.modelo + ' ' + v.year + ' ' + (v.estado || '') + ' ' + (v.codigoUnico || '')).toLowerCase().indexOf(q) >= 0;
            });
        }

        filtered.sort(function(a, b) { return a.id - b.id; });

        var html = '';
        filtered.forEach(function(v) {
            var estado = v.estado || 'disponible';
            var estadoInfo = ESTADO_LABELS[estado] || ESTADO_LABELS.disponible;
            var estadoBadge = '<span class="badge ' + estadoInfo.cls + '">' + estadoInfo.text + '</span>';

            var actions = '<button class="btn btn-ghost btn-sm" onclick="adminPanel.previewVehicle(' + v.id + ')" title="Vista previa">👁</button> ';
            var esVendido = estado === 'vendido';
            if (canCreateOrEditInventory()) {
                if (esVendido && !isSuperAdmin()) {
                    actions += '<button class="btn btn-ghost btn-sm" disabled title="Solo Super Admin puede editar vehiculos vendidos" style="opacity:0.4;cursor:not-allowed;">Editar</button> ';
                    actions += '<span style="font-size:0.65rem;color:var(--admin-danger,#ef4444);">Protegido</span> ';
                } else {
                    actions += '<button class="btn btn-ghost btn-sm" onclick="adminPanel.editVehicle(' + v.id + ')">Editar</button> ';
                }
                if (estado === 'disponible') {
                    actions += '<button class="btn btn-sm" style="color:var(--admin-info);border-color:var(--admin-info);" onclick="adminPanel.markAsSold(' + v.id + ')">Gestionar Operacion</button> ';
                }
            }
            if (canDeleteInventory()) {
                actions += '<button class="btn btn-danger btn-sm" onclick="adminPanel.deleteVehicle(' + v.id + ')">Eliminar</button>';
            }

            // Resolve origin/concesionario
            var origen = 'Propio';
            if (v.concesionario && v.concesionario !== '' && v.concesionario !== '_particular') {
                var dealer = dealers.find(function(x) { return x._docId === v.concesionario; });
                origen = dealer ? dealer.nombre : v.concesionario;
            } else if (v.concesionario === '_particular' && v.consignaParticular) {
                origen = 'Consigna: ' + v.consignaParticular;
            }

            html += '<tr>' +
                '<td><code style="font-size:0.75rem;color:var(--admin-accent,#58a6ff);">' + escapeHtml(v.codigoUnico || '—') + '</code></td>' +
                '<td><img class="vehicle-thumb" src="' + (v.imagen || 'multimedia/vehicles/placeholder-car.jpg') + '" alt="" onerror="this.src=\'multimedia/vehicles/placeholder-car.jpg\'"></td>' +
                '<td><strong>' + (v.marca || '').charAt(0).toUpperCase() + (v.marca || '').slice(1) + ' ' + (v.modelo || '') + '</strong><br><small style="color:#8b949e">' + v.year + ' &middot; ' + (v.categoria || '') + '</small></td>' +
                '<td><span class="badge badge-' + v.tipo + '">' + v.tipo + '</span></td>' +
                '<td>' + formatPrice(v.precio) + (v.precioOferta ? '<br><small style="color: var(--admin-warning);">' + formatPrice(v.precioOferta) + '</small>' : '') + '</td>' +
                '<td>' + estadoBadge + '</td>' +
                '<td><small style="color:var(--admin-text-secondary);">' + escapeHtml(origen) + '</small></td>' +
                '<td>' + actions + '</td>' +
            '</tr>';
        });

        if (!html) html = '<tr><td colspan="8" style="text-align:center; padding:2rem; color:#8b949e;">No se encontraron vehiculos</td></tr>';
        $('vehiclesTableBody').innerHTML = html;
    }

    $('vehicleSearch').addEventListener('input', function() {
        renderVehiclesTable(this.value);
    });

    // ========== BRANDS TABLE (RBAC-aware) ==========
    function renderBrandsTable() {
        var html = '';
        brands.forEach(function(b) {
            var count = vehicles.filter(function(v) { return v.marca === b.id; }).length;

            var actions = '';
            if (canCreateOrEditInventory()) {
                actions += '<button class="btn btn-ghost btn-sm" onclick="adminPanel.editBrand(\'' + b.id + '\')">Editar</button> ';
            }
            if (canDeleteInventory()) {
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

    // ========== VEHICLE MODAL ==========
    function openModal() {
        // Open all form sections so nothing is hidden
        document.querySelectorAll('#vehicleForm .form-section-body').forEach(function(body) {
            body.classList.add('open');
        });
        document.querySelectorAll('#vehicleForm .form-section-title').forEach(function(title) {
            title.classList.remove('collapsed');
        });
        clearValidationErrors();
        $('vehicleModal').classList.add('active');
    }

    // ========== CLOSE MODAL WITH CONFIRMATION ==========
    function formHasData() {
        return !!($('vMarca').value || $('vModelo').value || $('vPrecio').value);
    }

    function clearValidationErrors() {
        document.querySelectorAll('.field-error').forEach(function(el) { el.classList.remove('field-error'); });
        document.querySelectorAll('.field-error-msg').forEach(function(el) { el.remove(); });
        document.querySelectorAll('.form-section.has-errors').forEach(function(el) { el.classList.remove('has-errors'); });
    }

    function validateAndHighlightFields() {
        clearValidationErrors();
        var requiredFields = $('vehicleForm').querySelectorAll('[required]');
        var firstErrorSection = null;
        var hasErrors = false;
        requiredFields.forEach(function(field) {
            if (!field.value || field.value.trim() === '') {
                hasErrors = true;
                field.classList.add('field-error');
                // Add error message below field
                var msg = document.createElement('span');
                msg.className = 'field-error-msg';
                msg.textContent = 'Este campo es requerido';
                field.parentNode.appendChild(msg);
                // Mark parent section
                var section = field.closest('.form-section');
                if (section) {
                    section.classList.add('has-errors');
                    // Open the section so user sees the error
                    var body = section.querySelector('.form-section-body');
                    var title = section.querySelector('.form-section-title');
                    if (body && !body.classList.contains('open')) {
                        body.classList.add('open');
                        if (title) title.classList.remove('collapsed');
                    }
                    if (!firstErrorSection) firstErrorSection = section;
                }
                // Remove error on input
                field.addEventListener('input', function handler() {
                    this.classList.remove('field-error');
                    var errMsg = this.parentNode.querySelector('.field-error-msg');
                    if (errMsg) errMsg.remove();
                    var sec = this.closest('.form-section');
                    if (sec && !sec.querySelector('.field-error')) sec.classList.remove('has-errors');
                    this.removeEventListener('input', handler);
                }, { once: true });
            }
        });
        if (firstErrorSection) {
            firstErrorSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return !hasErrors;
    }

    function closeModalFn(force) {
        if (!force && formHasData()) {
            var action = confirm('Tienes datos sin guardar. ¿Deseas guardar como borrador antes de cerrar?');
            if (action) {
                saveDraftToFirestore(true).then(function() {
                    doCloseModal();
                });
                return;
            }
        }
        doCloseModal();
    }

    function doCloseModal() {
        clearValidationErrors();
        $('vehicleModal').classList.remove('active');
        $('vehicleForm').reset();
        $('vId').value = '';
        uploadedImageUrls = [];
        $('uploadedImages').innerHTML = '';
        $('uploadProgress').style.display = 'none';
        $('uploadError').style.display = 'none';
        $('manualImageUrl').value = '';
        $('featuresPreview').innerHTML = '';
        document.querySelectorAll('.feat-checkboxes input[type="checkbox"]').forEach(function(cb) { cb.checked = false; });
        stopDraftAutoSave();
    }

    // ========== PHASE 4: DRAFTS (Firestore per-user) ==========
    var draftInterval = null;

    function getFormSnapshot() {
        return {
            vId: $('vId').value,
            vMarca: $('vMarca').value,
            vModelo: $('vModelo').value,
            vYear: $('vYear').value,
            vTipo: $('vTipo').value,
            vCategoria: $('vCategoria').value,
            vPrecio: $('vPrecio').value,
            vPrecioOferta: $('vPrecioOferta').value,
            vKm: $('vKm').value,
            vTransmision: $('vTransmision').value,
            vCombustible: $('vCombustible').value,
            vMotor: $('vMotor').value,
            vPotencia: $('vPotencia').value,
            vCilindraje: $('vCilindraje').value,
            vTraccion: $('vTraccion').value,
            vDireccion: $('vDireccion').value,
            vColor: $('vColor').value,
            vPuertas: $('vPuertas').value,
            vPasajeros: $('vPasajeros').value,
            vUbicacion: $('vUbicacion').value,
            vPlaca: $('vPlaca').value,
            vFasecolda: $('vFasecolda').value,
            vDescripcion: $('vDescripcion').value,
            vEstado: $('vEstado').value,
            vDestacado: $('vDestacado').checked,
            vOferta: $('vOferta').checked,
            vRevision: $('vRevision').checked,
            vPeritaje: $('vPeritaje').checked,
            vPrioridad: $('vPrioridad').value,
            vCaracteristicas: $('vCaracteristicas').value,
            _images: uploadedImageUrls.slice(),
            _savedAt: new Date().toISOString()
        };
    }

    function restoreFormSnapshot(snap) {
        var fields = ['vMarca','vModelo','vYear','vTipo','vCategoria','vPrecio','vPrecioOferta','vKm','vTransmision','vCombustible','vMotor','vPotencia','vCilindraje','vTraccion','vDireccion','vColor','vPuertas','vPasajeros','vUbicacion','vPlaca','vFasecolda','vDescripcion','vEstado','vPrioridad','vCaracteristicas'];
        fields.forEach(function(f) {
            if ($(f) && snap[f] !== undefined) $(f).value = snap[f];
        });
        if (snap.vId) $('vId').value = snap.vId;
        $('vDestacado').checked = !!snap.vDestacado;
        $('vOferta').checked = !!snap.vOferta;
        $('vRevision').checked = snap.vRevision !== false;
        $('vPeritaje').checked = snap.vPeritaje !== false;
        if (snap._images && snap._images.length) {
            uploadedImageUrls = snap._images.slice();
            renderUploadedImages();
        }
    }

    function getDraftDocRef() {
        if (!window.auth || !window.auth.currentUser || !window.db) return null;
        return window.db.collection('usuarios').doc(window.auth.currentUser.uid).collection('drafts').doc('vehicleDraft');
    }

    function snapshotHasAnyData(snap) {
        var checkFields = ['vMarca','vModelo','vYear','vTipo','vCategoria','vPrecio','vKm','vTransmision','vCombustible','vMotor','vColor','vDescripcion'];
        for (var i = 0; i < checkFields.length; i++) {
            if (snap[checkFields[i]]) return true;
        }
        if (snap._images && snap._images.length > 0) return true;
        return false;
    }

    function saveDraftToFirestore(showToast) {
        var ref = getDraftDocRef();
        if (!ref) {
            if (showToast) toast('No se pudo acceder al almacenamiento de borradores', 'error');
            return Promise.resolve();
        }
        var snap = getFormSnapshot();
        if (!snapshotHasAnyData(snap)) {
            if (showToast) toast('No hay datos para guardar como borrador', 'info');
            return Promise.resolve();
        }
        snap._userId = window.auth.currentUser.uid;
        snap._userEmail = window.auth.currentUser.email;
        return ref.set(snap).then(function() {
            if (showToast) toast('Borrador guardado correctamente');
        }).catch(function(err) {
            console.warn('[Draft] Error al guardar borrador:', err);
            if (showToast) toast('Error al guardar borrador: ' + (err.code === 'permission-denied' ? 'Sin permisos. Verifica las reglas de Firestore.' : err.message), 'error');
        });
    }

    function clearDraftFromFirestore() {
        var ref = getDraftDocRef();
        if (!ref) return Promise.resolve();
        return ref.delete().catch(function() {});
    }

    function stopDraftAutoSave() {
        if (draftInterval) { clearInterval(draftInterval); draftInterval = null; }
    }

    function startDraftAutoSave() {
        stopDraftAutoSave();
        draftInterval = setInterval(function() {
            saveDraftToFirestore(false);
        }, 10000); // Auto-save every 10 seconds silently
    }

    function checkForDraft() {
        var ref = getDraftDocRef();
        if (!ref) return Promise.resolve(false);
        return ref.get().then(function(doc) {
            if (!doc.exists) return false;
            var snap = doc.data();
            if (!snapshotHasAnyData(snap)) return false;
            var savedAt = snap._savedAt ? formatTimeAgo(snap._savedAt) : '';
            var label = (snap.vMarca || '') + ' ' + (snap.vModelo || '') + ' ' + (snap.vYear || '');
            if (confirm('Tienes un borrador guardado: ' + label.trim() + ' (' + savedAt + '). ¿Deseas recuperarlo?')) {
                restoreFormSnapshot(snap);
                return true;
            } else {
                clearDraftFromFirestore();
                return false;
            }
        }).catch(function() { return false; });
    }

    $('btnAddVehicle').addEventListener('click', function() {
        if (!canCreateOrEditInventory()) { toast('No tienes permisos para crear vehiculos', 'error'); return; }
        $('modalTitle').textContent = 'Agregar Vehiculo';
        $('vId').value = '';
        $('vCodigoUnico').value = '';
        $('codigoUnicoDisplay').style.display = 'none';
        $('vehicleForm').reset();
        $('vUbicacion').value = 'Cartagena';
        $('vDireccion').value = 'Electrica';
        $('vEstado').value = 'disponible';
        $('vRevision').checked = true;
        $('vPeritaje').checked = true;
        uploadedImageUrls = [];
        $('uploadedImages').innerHTML = '';
        $('uploadError').style.display = 'none';
        checkForDraft().then(function() {
            startDraftAutoSave();
            openModal();
        });
    });

    $('closeModal').addEventListener('click', function() { closeModalFn(); });
    $('cancelModal').addEventListener('click', function() { closeModalFn(); });

    // Save Draft button
    var saveDraftBtn = $('saveDraftBtn');
    if (saveDraftBtn) {
        saveDraftBtn.addEventListener('click', function() {
            saveDraftToFirestore(true);
        });
    }

    $('vehicleForm').addEventListener('submit', function(e) { e.preventDefault(); });
    $('vehicleForm').addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') e.preventDefault();
    });

    // ========== EDIT VEHICLE ==========
    function editVehicle(id) {
        if (!canCreateOrEditInventory()) { toast('No tienes permisos para editar vehiculos', 'error'); return; }

        var v = vehicles.find(function(x) { return x.id === id; });
        if (!v) return;

        // Fase 22: Proteccion vehiculos vendidos
        if (v.estado === 'vendido' && !isSuperAdmin()) {
            toast('Este vehiculo esta vendido. Solo Super Admin puede editarlo.', 'error');
            return;
        }

        $('modalTitle').textContent = 'Editar Vehiculo ' + (v.codigoUnico || '#' + id);
        $('vId').value = v.id;
        $('vCodigoUnico').value = v.codigoUnico || '';
        if (v.codigoUnico) {
            $('codigoUnicoValue').textContent = v.codigoUnico;
            $('codigoUnicoDisplay').style.display = 'block';
        } else {
            $('codigoUnicoDisplay').style.display = 'none';
        }
        $('vMarca').value = v.marca || '';
        $('vModelo').value = v.modelo || '';
        $('vYear').value = v.year || '';
        $('vTipo').value = v.tipo || '';
        $('vCategoria').value = v.categoria || '';
        $('vPrecio').value = v.precio || '';
        $('vPrecioOferta').value = v.precioOferta || '';
        $('vKm').value = v.kilometraje || 0;
        $('vTransmision').value = v.transmision || '';
        $('vCombustible').value = v.combustible || '';
        $('vMotor').value = v.motor || '';
        $('vPotencia').value = v.potencia || '';
        $('vCilindraje').value = v.cilindraje || '';
        $('vTraccion').value = v.traccion || '';
        $('vDireccion').value = v.direccion || 'Electrica';
        $('vColor').value = v.color || '';
        $('vPuertas').value = v.puertas || 5;
        $('vPasajeros').value = v.pasajeros || 5;
        $('vUbicacion').value = v.ubicacion || 'Cartagena';
        $('vPlaca').value = v.placa || '';
        $('vFasecolda').value = v.codigoFasecolda || '';
        $('vDescripcion').value = v.descripcion || '';
        $('vEstado').value = v.estado || 'disponible';
        $('vDestacado').checked = !!v.destacado;
        $('vOferta').checked = !!(v.oferta || v.precioOferta);
        $('vRevision').checked = v.revisionTecnica !== false;
        $('vPeritaje').checked = v.peritaje !== false;
        $('vPrioridad').value = v.prioridad || 0;
        loadFeaturesIntoForm(v.caracteristicas || []);

        // Load concesionario value
        if ($('vConcesionario')) {
            // Populate concesionario select first, then set value
            if (window.DynamicLists) {
                window.DynamicLists.populateConcesionarioSelect($('vConcesionario'));
                setTimeout(function() {
                    $('vConcesionario').value = v.concesionario || '';
                    toggleConsignaField();
                    if (v.consignaParticular && $('vConsignaParticular')) {
                        $('vConsignaParticular').value = v.consignaParticular;
                    }
                }, 300);
            } else {
                $('vConcesionario').value = v.concesionario || '';
            }
        }

        uploadedImageUrls = (v.imagenes && v.imagenes.length) ? v.imagenes.slice() : (v.imagen ? [v.imagen] : []);
        renderUploadedImages();
        $('uploadError').style.display = 'none';

        startDraftAutoSave();
        openModal();
    }

    // ========== PHASE 4: AUDIT LOG ==========
    function writeAuditLog(action, target, details) {
        try {
            var userEmail = (window.auth && window.auth.currentUser) ? window.auth.currentUser.email : 'unknown';
            var logEntry = {
                action: action,
                target: target,
                details: details || '',
                user: userEmail,
                timestamp: new Date().toISOString()
            };
            window.db.collection('auditLog').add(logEntry).catch(function() {
                // Silently fail — audit log is not critical
            });
        } catch (e) {}
    }

    // ========== COLLECT FEATURES FROM CHECKBOXES + TEXTAREA ==========
    function collectAllFeatures() {
        var features = [];
        // Collect from category checkboxes
        document.querySelectorAll('.feat-checkboxes input[type="checkbox"]:checked').forEach(function(cb) {
            if (cb.value && features.indexOf(cb.value) === -1) features.push(cb.value);
        });
        // Collect from textarea (additional features)
        var textarea = $('vCaracteristicas');
        if (textarea && textarea.value.trim()) {
            textarea.value.split('\n').forEach(function(line) {
                var trimmed = line.trim();
                if (trimmed && features.indexOf(trimmed) === -1) features.push(trimmed);
            });
        }
        return features;
    }

    function loadFeaturesIntoForm(caracteristicas) {
        if (!caracteristicas || !caracteristicas.length) return;
        // Uncheck all first
        document.querySelectorAll('.feat-checkboxes input[type="checkbox"]').forEach(function(cb) { cb.checked = false; });

        var uncategorized = [];
        var checkboxValues = [];
        document.querySelectorAll('.feat-checkboxes input[type="checkbox"]').forEach(function(cb) { checkboxValues.push(cb.value); });

        caracteristicas.forEach(function(feat) {
            var found = false;
            document.querySelectorAll('.feat-checkboxes input[type="checkbox"]').forEach(function(cb) {
                if (cb.value === feat) { cb.checked = true; found = true; }
            });
            if (!found) uncategorized.push(feat);
        });

        if ($('vCaracteristicas')) {
            $('vCaracteristicas').value = uncategorized.join('\n');
        }
    }

    // ========== SAVE VEHICLE (with optimistic locking + collision-safe IDs) ==========
    function buildVehicleData(id, codigoUnico) {
        var precioOferta = $('vPrecioOferta').value ? parseInt($('vPrecioOferta').value) : null;
        var userEmail = (window.auth && window.auth.currentUser) ? window.auth.currentUser.email : 'unknown';

        var vehicleData = {
            id: id,
            codigoUnico: codigoUnico || $('vCodigoUnico').value || '',
            marca: $('vMarca').value,
            modelo: $('vModelo').value.trim(),
            year: parseInt($('vYear').value),
            tipo: $('vTipo').value,
            categoria: $('vCategoria').value,
            precio: parseInt($('vPrecio').value),
            precioOferta: precioOferta,
            oferta: !!precioOferta,
            kilometraje: parseInt($('vKm').value) || 0,
            transmision: $('vTransmision').value,
            combustible: $('vCombustible').value,
            motor: $('vMotor').value || '',
            potencia: $('vPotencia').value || '',
            cilindraje: $('vCilindraje').value || '',
            traccion: $('vTraccion').value || '',
            direccion: $('vDireccion').value || 'Electrica',
            color: toTitleCase($('vColor').value),
            puertas: parseInt($('vPuertas').value) || 5,
            pasajeros: parseInt($('vPasajeros').value) || 5,
            asientos: parseInt($('vPasajeros').value) || 5,
            ubicacion: $('vUbicacion').value || 'Cartagena',
            placa: $('vPlaca').value || 'Disponible al contactar',
            codigoFasecolda: $('vFasecolda').value || 'Consultar',
            revisionTecnica: $('vRevision').checked,
            peritaje: $('vPeritaje').checked,
            descripcion: $('vDescripcion').value || '',
            estado: $('vEstado').value || 'disponible',
            destacado: $('vDestacado').checked,
            prioridad: parseInt($('vPrioridad').value) || 0,
            imagen: uploadedImageUrls[0] || 'multimedia/vehicles/placeholder-car.jpg',
            imagenes: uploadedImageUrls.length ? uploadedImageUrls.slice() : ['multimedia/vehicles/placeholder-car.jpg'],
            caracteristicas: collectAllFeatures(),
            concesionario: $('vConcesionario') ? $('vConcesionario').value : '',
            updatedAt: new Date().toISOString(),
            updatedBy: userEmail
        };

        if (vehicleData.imagen && vehicleData.imagenes.indexOf(vehicleData.imagen) === -1) {
            vehicleData.imagenes.unshift(vehicleData.imagen);
        }

        return vehicleData;
    }

    // Save a NEW vehicle with collision-safe ID (retries if ID already taken)
    function saveNewVehicle(vehicleData, candidateId, maxRetries) {
        if (maxRetries <= 0) {
            return Promise.reject({ code: 'id-exhausted', message: 'No se pudo generar un ID unico. Recarga la pagina e intenta de nuevo.' });
        }

        vehicleData.id = candidateId;
        var docRef = window.db.collection('vehiculos').doc(String(candidateId));

        return window.db.runTransaction(function(transaction) {
            return transaction.get(docRef).then(function(doc) {
                if (doc.exists) {
                    // This ID is already taken — another user created it
                    throw { code: 'id-collision', takenId: candidateId };
                }
                vehicleData._version = 1;
                transaction.set(docRef, vehicleData);
            });
        }).catch(function(err) {
            if (err.code === 'id-collision') {
                // Retry with next ID
                return saveNewVehicle(vehicleData, err.takenId + 1, maxRetries - 1);
            }
            throw err;
        });
    }

    // Save an EXISTING vehicle with optimistic locking
    function saveExistingVehicle(vehicleData, id, expectedVersion) {
        var docRef = window.db.collection('vehiculos').doc(String(id));

        return window.db.runTransaction(function(transaction) {
            return transaction.get(docRef).then(function(doc) {
                var currentVersion = doc.exists ? (doc.data()._version || 0) : 0;
                if (expectedVersion !== null && currentVersion !== expectedVersion) {
                    var lastEditor = doc.data().updatedBy || 'otro usuario';
                    throw { code: 'version-conflict', message: 'Este vehiculo fue modificado por ' + lastEditor + ' mientras lo editabas. Cierra el formulario y vuelve a abrirlo para ver los cambios actuales.' };
                }
                vehicleData._version = currentVersion + 1;
                transaction.set(docRef, vehicleData);
            });
        });
    }

    $('saveVehicle').addEventListener('click', function() {
        if (!canCreateOrEditInventory()) { toast('No tienes permisos', 'error'); return; }

        if (!validateAndHighlightFields()) {
            toast('Completa los campos requeridos marcados en rojo', 'error');
            return;
        }

        // Fase 22: Proteccion vehiculos vendidos en save
        var _editId = $('vId').value ? parseInt($('vId').value) : null;
        if (_editId) {
            var _origV = vehicles.find(function(v) { return v.id === _editId; });
            if (_origV && _origV.estado === 'vendido' && !isSuperAdmin()) {
                toast('No puedes modificar un vehiculo vendido. Contacta al Super Admin.', 'error');
                return;
            }
        }

        var existingId = $('vId').value;
        var isEdit = !!existingId;

        var btn = $('saveVehicle');
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner"></span> Guardando...';

        var vehicleData;
        var savePromise;

        if (isEdit) {
            var id = parseInt(existingId);
            var editingVehicle = vehicles.find(function(v) { return v.id === id; });
            var expectedVersion = editingVehicle ? (editingVehicle._version || 0) : null;
            vehicleData = buildVehicleData(id);
            savePromise = saveExistingVehicle(vehicleData, id, expectedVersion);
        } else {
            // Generate unique code atomically, then save vehicle
            var candidateId = getNextId();
            savePromise = generateUniqueCode().then(function(code) {
                vehicleData = buildVehicleData(candidateId, code);
                return saveNewVehicle(vehicleData, candidateId, 10);
            });
        }

        savePromise
            .then(function() {
                var label = (vehicleData.marca || '') + ' ' + (vehicleData.modelo || '') + ' ' + (vehicleData.year || '');
                var codeLabel = vehicleData.codigoUnico ? ' [' + vehicleData.codigoUnico + ']' : '';
                writeAuditLog(isEdit ? 'vehicle_update' : 'vehicle_create', 'vehiculo #' + vehicleData.id + codeLabel, label.trim());
                toast(isEdit ? 'Vehiculo actualizado (v' + vehicleData._version + ')' : 'Vehiculo ' + vehicleData.codigoUnico + ' agregado');
                clearDraftFromFirestore();
                closeModalFn(true);
            })
            .catch(function(err) {
                if (err.code === 'version-conflict') {
                    toast(err.message, 'error');
                } else if (err.code === 'permission-denied') {
                    toast('Sin permisos para esta accion. Contacta al Super Admin.', 'error');
                } else {
                    toast('Error: ' + (err.message || err), 'error');
                }
            })
            .finally(function() {
                btn.disabled = false;
                btn.textContent = 'Guardar Vehiculo';
            });
    });

    function getNextId() {
        if (vehicles.length === 0) return 1;
        return Math.max.apply(null, vehicles.map(function(v) { return v.id || 0; })) + 1;
    }

    // Generate unique vehicle code: ALT-YYYYMM-XXXX (atomic, immutable, never reused)
    function generateUniqueCode() {
        var counterRef = window.db.collection('config').doc('counters');
        return window.db.runTransaction(function(transaction) {
            return transaction.get(counterRef).then(function(doc) {
                var data = doc.exists ? doc.data() : {};
                var nextSeq = (data.vehicleCodeSeq || 0) + 1;
                transaction.set(counterRef, { vehicleCodeSeq: nextSeq }, { merge: true });
                var now = new Date();
                var yyyy = now.getFullYear();
                var mm = String(now.getMonth() + 1).padStart(2, '0');
                var seq = String(nextSeq).padStart(4, '0');
                return 'ALT-' + yyyy + mm + '-' + seq;
            });
        });
    }

    // ========== DELETE VEHICLE (super_admin only) ==========
    function deleteVehicleFn(id) {
        if (!canDeleteInventory()) {
            toast('Solo un Super Admin puede eliminar vehiculos', 'error');
            return;
        }

        var v = vehicles.find(function(x) { return x.id === id; });
        if (!v) return;

        deleteTargetId = id;
        $('deleteVehicleName').textContent = (v.marca || '').charAt(0).toUpperCase() + (v.marca || '').slice(1) + ' ' + v.modelo + ' ' + v.year;
        $('deleteModal').classList.add('active');
    }

    $('closeDeleteModal').addEventListener('click', function() {
        $('deleteModal').classList.remove('active');
        deleteTargetId = null;
    });

    $('cancelDelete').addEventListener('click', function() {
        $('deleteModal').classList.remove('active');
        deleteTargetId = null;
    });

    $('confirmDelete').addEventListener('click', function() {
        if (!deleteTargetId) return;
        if (!canDeleteInventory()) { toast('Sin permisos', 'error'); return; }

        var btn = $('confirmDelete');
        btn.disabled = true;
        btn.textContent = 'Eliminando...';

        var deletingId = deleteTargetId;
        window.db.collection('vehiculos').doc(String(deleteTargetId)).delete()
            .then(function() {
                writeAuditLog('vehicle_delete', 'vehiculo #' + deletingId, '');
                toast('Vehiculo eliminado');
                $('deleteModal').classList.remove('active');
                deleteTargetId = null;
                loadData();
            })
            .catch(function(err) {
                if (err.code === 'permission-denied') {
                    toast('Sin permisos para eliminar. Solo Super Admin puede eliminar.', 'error');
                } else {
                    toast('Error: ' + err.message, 'error');
                }
            })
            .finally(function() {
                btn.disabled = false;
                btn.textContent = 'Eliminar';
            });
    });

    // ========== IMAGE UPLOAD ==========
    var uploadArea = $('uploadArea');
    var fileInput = $('fileInput');

    uploadArea.addEventListener('click', function() { fileInput.click(); });

    uploadArea.addEventListener('dragover', function(e) { e.preventDefault(); this.classList.add('dragover'); });
    uploadArea.addEventListener('dragleave', function() { this.classList.remove('dragover'); });
    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('dragover');
        if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
    });
    fileInput.addEventListener('change', function() {
        if (this.files.length) { handleFiles(this.files); this.value = ''; }
    });

    function showUploadError(msg) {
        var el = $('uploadError');
        el.textContent = msg;
        el.style.display = 'block';
    }

    // Natural sort: "1.jpg" < "2.jpg" < "10.jpg" < "12.jpg"
    function naturalSortCompare(a, b) {
        var ax = [], bx = [];
        a.replace(/(\d+)|(\D+)/g, function(_, $1, $2) { ax.push([$1 || Infinity, $2 || '']); });
        b.replace(/(\d+)|(\D+)/g, function(_, $1, $2) { bx.push([$1 || Infinity, $2 || '']); });
        while (ax.length && bx.length) {
            var an = ax.shift(), bn = bx.shift();
            var nn = (parseInt(an[0]) - parseInt(bn[0])) || an[1].localeCompare(bn[1]);
            if (nn) return nn;
        }
        return ax.length - bx.length;
    }

    function handleFiles(files) {
        if (!window.storage) { showUploadError('Firebase Storage no esta disponible. Usa la opcion de URL manual.'); return; }

        var fileArray = Array.from(files);
        var invalidType = fileArray.filter(function(f) { return UPLOAD_CONFIG.allowedTypes.indexOf(f.type) === -1; });
        if (invalidType.length) {
            showUploadError('Formatos permitidos: JPG, PNG, WebP. Rechazados: ' + invalidType.map(function(f) { return f.name; }).join(', '));
            return;
        }

        var maxBytes = UPLOAD_CONFIG.maxFileSizeMB * 1024 * 1024;
        var oversized = fileArray.filter(function(f) { return f.size > maxBytes * 5; });
        if (oversized.length) { showUploadError('Imagenes demasiado grandes (max 10MB).'); return; }

        // Sort files by name ascending (natural order: 1, 2, 3... 10, 11, 12)
        fileArray.sort(function(a, b) { return naturalSortCompare(a.name, b.name); });

        $('uploadError').style.display = 'none';
        var total = fileArray.length;
        var done = 0;
        var errors = 0;
        // Track URLs by original index to maintain sorted order
        var resultUrls = new Array(total);

        $('uploadProgress').style.display = 'block';
        $('uploadStatus').textContent = 'Comprimiendo y subiendo 0 de ' + total + '...';
        $('progressFill').style.width = '0%';

        fileArray.forEach(function(file, idx) {
            compressImage(file).then(function(compressed) {
                return uploadFileToStorageIndexed(compressed, idx, resultUrls);
            }).then(function(success) {
                done++;
                if (!success) errors++;
                updateUploadProgress(done, total, errors);
                if (done === total) {
                    // All uploads complete: add URLs in sorted order
                    resultUrls.forEach(function(url) {
                        if (url) uploadedImageUrls.push(url);
                    });
                    renderUploadedImages();
                }
            }).catch(function() {
                done++;
                errors++;
                updateUploadProgress(done, total, errors);
                if (done === total) {
                    resultUrls.forEach(function(url) {
                        if (url) uploadedImageUrls.push(url);
                    });
                    renderUploadedImages();
                }
            });
        });
    }

    function updateUploadProgress(done, total, errors) {
        var pct = Math.round((done / total) * 100);
        $('progressFill').style.width = pct + '%';
        $('uploadStatus').textContent = 'Subiendo ' + done + ' de ' + total + '...';
        if (done === total) {
            setTimeout(function() { $('uploadProgress').style.display = 'none'; }, 1000);
            if (errors === total) showUploadError('No se pudieron subir las imagenes. Verifica Storage.');
            else if (errors > 0) toast((total - errors) + ' subida(s), ' + errors + ' error(es)', 'error');
            else toast(total + ' imagen(es) subida(s)');
        }
    }

    function uploadFileToStorage(file) {
        return new Promise(function(resolve) {
            if (!window.storage) { resolve(false); return; }

            var timestamp = Date.now();
            var safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
            var path = UPLOAD_CONFIG.storagePath + timestamp + '_' + safeName;

            try {
                var ref = window.storage.ref(path);
                ref.put(file).then(function(snapshot) {
                    return snapshot.ref.getDownloadURL();
                }).then(function(url) {
                    uploadedImageUrls.push(url);
                    renderUploadedImages();
                    resolve(true);
                }).catch(function(err) {
                    console.error('[Storage Upload] FALLO:', err.code, err.message);
                    showUploadError('Error subiendo imagen: ' + (err.message || err.code));
                    resolve(false);
                });
            } catch (e) {
                console.error('[Storage Upload] Excepcion:', e);
                resolve(false);
            }
        });
    }

    // Indexed version: stores URL at specific position instead of pushing to array
    function uploadFileToStorageIndexed(file, index, resultArray) {
        return new Promise(function(resolve) {
            if (!window.storage) { resolve(false); return; }

            var timestamp = Date.now() + index; // unique per file
            var safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
            var path = UPLOAD_CONFIG.storagePath + timestamp + '_' + safeName;

            try {
                var ref = window.storage.ref(path);
                ref.put(file).then(function(snapshot) {
                    return snapshot.ref.getDownloadURL();
                }).then(function(url) {
                    resultArray[index] = url;
                    resolve(true);
                }).catch(function(err) {
                    console.error('[Storage Upload] FALLO:', err.code, err.message);
                    showUploadError('Error subiendo imagen: ' + (err.message || err.code));
                    resolve(false);
                });
            } catch (e) {
                console.error('[Storage Upload] Excepcion:', e);
                resolve(false);
            }
        });
    }

    $('btnAddImageUrl').addEventListener('click', function() {
        var url = $('manualImageUrl').value.trim();
        if (!url) { toast('Ingresa una URL', 'error'); return; }
        if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('multimedia/')) {
            toast('URL no valida', 'error'); return;
        }
        uploadedImageUrls.push(url);
        renderUploadedImages();
        $('manualImageUrl').value = '';
        toast('Imagen agregada');
    });

    function renderUploadedImages() {
        var container = $('uploadedImages');
        var html = '';
        uploadedImageUrls.forEach(function(url, i) {
            var isMain = (i === 0);
            html += '<div class="uploaded-img' + (isMain ? ' main-img' : '') + '" draggable="true" data-idx="' + i + '">' +
                '<div class="img-drag-handle" title="Arrastra para reordenar">☰</div>' +
                '<img src="' + url + '" alt="Foto ' + (i + 1) + '" onerror="this.style.opacity=\'0.3\'">' +
                (isMain ? '<span class="img-badge">PRINCIPAL</span>' : '<span class="img-badge img-badge-num">' + (i + 1) + '</span>') +
                '<button type="button" class="remove-img" onclick="adminPanel.removeImage(' + i + ')">&times;</button>' +
            '</div>';
        });
        container.innerHTML = html;
        $('vImagen').value = uploadedImageUrls[0] || '';
        $('vImagenes').value = uploadedImageUrls.join('\n');
        initImageDragDrop(container);
    }

    function removeImage(index) {
        uploadedImageUrls.splice(index, 1);
        renderUploadedImages();
    }

    // Phase 4: Drag-and-drop image reorder
    var _dragSrcIdx = null;

    function initImageDragDrop(container) {
        var items = container.querySelectorAll('.uploaded-img');
        items.forEach(function(item) {
            item.addEventListener('dragstart', function(e) {
                _dragSrcIdx = parseInt(this.getAttribute('data-idx'));
                this.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
            });
            item.addEventListener('dragend', function() {
                this.classList.remove('dragging');
                container.querySelectorAll('.uploaded-img').forEach(function(el) { el.classList.remove('drag-over'); });
            });
            item.addEventListener('dragover', function(e) {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                this.classList.add('drag-over');
            });
            item.addEventListener('dragleave', function() {
                this.classList.remove('drag-over');
            });
            item.addEventListener('drop', function(e) {
                e.preventDefault();
                this.classList.remove('drag-over');
                var targetIdx = parseInt(this.getAttribute('data-idx'));
                if (_dragSrcIdx !== null && _dragSrcIdx !== targetIdx) {
                    var moved = uploadedImageUrls.splice(_dragSrcIdx, 1)[0];
                    uploadedImageUrls.splice(targetIdx, 0, moved);
                    renderUploadedImages();
                    toast('Imagen reordenada', 'info');
                }
                _dragSrcIdx = null;
            });
        });
    }

    // ========== BRANDS CRUD ==========
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
        if (!canCreateOrEditInventory()) { toast('No tienes permisos', 'error'); return; }
        $('brandModalTitle').textContent = 'Agregar Marca';
        $('bOriginalId').value = '';
        $('brandForm').reset();
        $('brandLogoPreview').innerHTML = '';
        $('bId').readOnly = false;
        openBrandModal();
    });

    $('closeBrandModal').addEventListener('click', closeBrandModalFn);
    $('cancelBrandModal').addEventListener('click', closeBrandModalFn);

    $('bLogo').addEventListener('input', function() {
        var url = this.value.trim();
        if (url) {
            $('brandLogoPreview').innerHTML = '<img src="' + url + '" style="width:60px;height:60px;object-fit:contain;border-radius:6px;background:#1a1a2e;padding:4px;" onerror="this.parentNode.innerHTML=\'<small style=color:var(--admin-danger)>URL no valida</small>\'">';
        } else {
            $('brandLogoPreview').innerHTML = '';
        }
    });

    // FASE 2: Upload de logo de marca desde archivo
    $('btnUploadBrandLogo').addEventListener('click', function() {
        $('brandLogoFile').click();
    });

    $('brandLogoFile').addEventListener('change', function() {
        var file = this.files[0];
        if (!file) return;
        if (!window.storage) { toast('Storage no disponible', 'error'); return; }

        var status = $('brandLogoUploadStatus');
        status.style.display = 'block';
        status.textContent = 'Subiendo logo...';

        var safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        var path = UPLOAD_CONFIG.storagePath + 'logo_' + Date.now() + '_' + safeName;

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

    function editBrand(brandId) {
        if (!canCreateOrEditInventory()) { toast('No tienes permisos', 'error'); return; }
        var b = brands.find(function(x) { return x.id === brandId; });
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

    $('saveBrand').addEventListener('click', function() {
        if (!canCreateOrEditInventory()) { toast('No tienes permisos', 'error'); return; }

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
                writeAuditLog(isEdit ? 'brand_update' : 'brand_create', 'marca ' + brandId, brandData.nombre);
                toast(isEdit ? 'Marca actualizada' : 'Marca agregada');
                closeBrandModalFn();
                loadData();
            })
            .catch(function(err) {
                if (err.code === 'permission-denied') toast('Sin permisos', 'error');
                else toast('Error: ' + err.message, 'error');
            })
            .finally(function() {
                btn.disabled = false;
                btn.textContent = 'Guardar Marca';
            });
    });

    function deleteBrandFn(brandId) {
        if (!canDeleteInventory()) { toast('Solo un Super Admin puede eliminar marcas', 'error'); return; }

        var b = brands.find(function(x) { return x.id === brandId; });
        if (!b) return;

        deleteBrandTargetId = brandId;
        $('deleteBrandName').textContent = b.nombre;
        $('deleteBrandModal').classList.add('active');
    }

    $('closeDeleteBrandModal').addEventListener('click', function() { $('deleteBrandModal').classList.remove('active'); deleteBrandTargetId = null; });
    $('cancelDeleteBrand').addEventListener('click', function() { $('deleteBrandModal').classList.remove('active'); deleteBrandTargetId = null; });

    $('confirmDeleteBrand').addEventListener('click', function() {
        if (!deleteBrandTargetId) return;
        if (!canDeleteInventory()) { toast('Sin permisos', 'error'); return; }

        var btn = $('confirmDeleteBrand');
        btn.disabled = true;
        btn.textContent = 'Eliminando...';

        window.db.collection('marcas').doc(deleteBrandTargetId).delete()
            .then(function() {
                writeAuditLog('brand_delete', 'marca ' + deleteBrandTargetId, '');
                toast('Marca eliminada');
                $('deleteBrandModal').classList.remove('active');
                deleteBrandTargetId = null;
                loadData();
            })
            .catch(function(err) {
                if (err.code === 'permission-denied') toast('Sin permisos para eliminar.', 'error');
                else toast('Error: ' + err.message, 'error');
            })
            .finally(function() {
                btn.disabled = false;
                btn.textContent = 'Eliminar';
            });
    });

    // ========== ESTIMATOR EVENTS ==========
    var estVisitas = $('estVisitas');
    if (estVisitas) {
        estVisitas.addEventListener('input', function() { updateEstimator(); });
    }

    // ========== USERS CRUD (via Cloud Functions) ==========
    function renderUsersTable() {
        if (!users.length) {
            $('usersTableBody').innerHTML = '<tr><td colspan="5" style="text-align:center;padding:2rem;color:var(--admin-text-muted);">No hay usuarios registrados</td></tr>';
            return;
        }

        var currentUid = window.auth.currentUser ? window.auth.currentUser.uid : '';
        var html = '';
        users.forEach(function(u) {
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

    // User Modal
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
        if (!canManageUsers()) { toast('No tienes permisos', 'error'); return; }
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

    function editUser(uid) {
        if (!canManageUsers()) { toast('No tienes permisos', 'error'); return; }
        var u = users.find(function(x) { return x._docId === uid; });
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

    $('saveUser').addEventListener('click', function() {
        if (!canManageUsers()) { toast('No tienes permisos', 'error'); return; }

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
            toast('Cloud Functions no disponibles. Verifica que esten desplegadas.', 'error');
            btn.disabled = false;
            btn.textContent = isEdit ? 'Guardar Cambios' : 'Crear Usuario';
            return;
        }

        if (isEdit) {
            // Update via Cloud Function
            var updateUserRole = window.functions.httpsCallable('updateUserRoleV2');
            updateUserRole({ uid: originalUid, nombre: nombre, rol: rol })
                .then(function(result) {
                    toast(result.data.message || 'Usuario actualizado');
                    closeUserModalFn();
                    loadUsers();
                })
                .catch(function(err) {
                    console.error('[UpdateUser] Error:', err);
                    toast(parseCallableError(err), 'error');
                })
                .finally(function() {
                    btn.disabled = false;
                    btn.textContent = 'Guardar Cambios';
                });
        } else {
            // Create via Cloud Function (no session change!)
            var createManagedUser = window.functions.httpsCallable('createManagedUserV2');
            createManagedUser({ nombre: nombre, email: email, password: password, rol: rol })
                .then(function(result) {
                    toast(result.data.message || 'Usuario creado exitosamente');
                    closeUserModalFn();
                    loadUsers();
                })
                .catch(function(err) {
                    console.error('[CreateUser] Error:', err);
                    toast(parseCallableError(err), 'error');
                })
                .finally(function() {
                    btn.disabled = false;
                    btn.textContent = 'Crear Usuario';
                });
        }
    });

    var _deletingUser = false;

    function deleteUserFn(uid) {
        if (!canManageUsers()) { toast('No tienes permisos', 'error'); return; }
        if (_deletingUser) { toast('Ya hay una eliminacion en curso...', 'info'); return; }

        var currentUid = window.auth.currentUser ? window.auth.currentUser.uid : '';
        if (uid === currentUid) {
            toast('No puedes eliminar tu propia cuenta', 'error');
            return;
        }

        if (!window.functions) {
            toast('Cloud Functions no disponibles. Verifica que esten desplegadas.', 'error');
            return;
        }

        var u = users.find(function(x) { return x._docId === uid; });
        if (!u) return;

        if (!confirm('Eliminar usuario "' + (u.nombre || u.email) + '"?\n\nSe eliminara tanto su perfil como su cuenta de autenticacion. Esta accion no se puede deshacer.')) {
            return;
        }

        _deletingUser = true;
        toast('Eliminando usuario...', 'info');

        // Disable all delete buttons in users table during operation
        document.querySelectorAll('#usersTableBody .btn-danger').forEach(function(b) { b.disabled = true; });

        // Delete via Cloud Function (deletes Auth + Firestore)
        var deleteManagedUser = window.functions.httpsCallable('deleteManagedUserV2');
        deleteManagedUser({ uid: uid })
            .then(function(result) {
                toast(result.data.message || 'Usuario eliminado completamente');
                loadUsers();
            })
            .catch(function(err) {
                console.error('[DeleteUser] Error:', err);
                toast(parseCallableError(err), 'error');
            })
            .finally(function() {
                _deletingUser = false;
                document.querySelectorAll('#usersTableBody .btn-danger').forEach(function(b) { b.disabled = false; });
            });
    }

    // ========== PHASE 4: PREVIEW VEHICLE (Read-only) ==========
    function previewVehicle(id) {
        var v = vehicles.find(function(x) { return x.id === id; });
        if (!v) return;

        var marca = (v.marca || '').charAt(0).toUpperCase() + (v.marca || '').slice(1);
        var imgs = (v.imagenes || [v.imagen]).filter(Boolean);
        var imgsHtml = imgs.map(function(url, i) {
            return '<img src="' + url + '" style="width:100%;max-height:200px;object-fit:cover;border-radius:6px;margin-bottom:0.5rem;" onerror="this.style.display=\'none\'" alt="Foto ' + (i + 1) + '">';
        }).join('');

        // Resolve concesionario name for preview
        var origenPreview = 'Propio';
        if (v.concesionario && v.concesionario !== '' && v.concesionario !== '_particular') {
            var dealerMatch = dealers.find(function(x) { return x._docId === v.concesionario; });
            origenPreview = dealerMatch ? dealerMatch.nombre : v.concesionario;
        } else if (v.concesionario === '_particular' && v.consignaParticular) {
            origenPreview = 'Consigna: ' + v.consignaParticular;
        }

        var specs = [
            { label: 'Codigo', val: v.codigoUnico || '—' },
            { label: 'Marca', val: marca },
            { label: 'Modelo', val: v.modelo },
            { label: 'Año', val: v.year },
            { label: 'Tipo', val: v.tipo },
            { label: 'Categoria', val: v.categoria },
            { label: 'Precio', val: formatPrice(v.precio) },
            { label: 'Precio Oferta', val: v.precioOferta ? formatPrice(v.precioOferta) : '-' },
            { label: 'Kilometraje', val: (v.kilometraje || 0).toLocaleString('es-CO') + ' km' },
            { label: 'Transmision', val: v.transmision },
            { label: 'Combustible', val: v.combustible },
            { label: 'Motor', val: v.motor || '-' },
            { label: 'Direccion', val: v.direccion || '-' },
            { label: 'Traccion', val: v.traccion || '-' },
            { label: 'Color', val: v.color || '-' },
            { label: 'Puertas', val: v.puertas || 5 },
            { label: 'Pasajeros', val: v.pasajeros || 5 },
            { label: 'Placa', val: v.placa || '-' },
            { label: 'Ubicacion', val: v.ubicacion || '-' },
            { label: 'Origen / Concesionario', val: origenPreview },
            { label: 'Estado', val: (v.estado || 'disponible') },
            { label: 'Descripcion', val: v.descripcion ? v.descripcion.substring(0, 100) + (v.descripcion.length > 100 ? '...' : '') : '-' },
            { label: 'Version', val: v._version || '-' },
            { label: 'Ultima edicion', val: v.updatedAt ? formatTimeAgo(v.updatedAt) + ' por ' + (v.updatedBy || '-') : '-' }
        ];

        var specsHtml = '<table style="width:100%;font-size:0.8rem;border-collapse:collapse;">' +
            specs.map(function(s) {
                return '<tr style="border-bottom:1px solid var(--admin-border,#30363d);">' +
                    '<td style="padding:0.35rem 0.5rem;color:var(--admin-text-muted);white-space:nowrap;">' + s.label + '</td>' +
                    '<td style="padding:0.35rem 0.5rem;color:var(--admin-text-primary,#f0f6fc);font-weight:500;">' + (s.val || '-') + '</td>' +
                '</tr>';
            }).join('') + '</table>';

        var features = (v.caracteristicas || []);
        var featHtml = features.length > 0 ? '<div style="margin-top:0.75rem;"><strong style="font-size:0.8rem;">Caracteristicas:</strong><div style="display:flex;flex-wrap:wrap;gap:0.3rem;margin-top:0.35rem;">' +
            features.map(function(f) { return '<span style="background:var(--admin-surface,#161b22);border:1px solid var(--admin-border,#30363d);border-radius:4px;padding:0.15rem 0.5rem;font-size:0.7rem;">' + escapeHtml(f) + '</span>'; }).join('') +
            '</div></div>' : '';

        var content = '<div style="max-height:70vh;overflow-y:auto;padding-right:0.5rem;">' +
            imgsHtml +
            '<h3 style="margin:0.5rem 0 0.75rem;color:var(--admin-text-primary,#f0f6fc);">' + marca + ' ' + (v.modelo || '') + ' ' + (v.year || '') + '</h3>' +
            specsHtml + featHtml +
            (v.descripcion ? '<div style="margin-top:0.75rem;font-size:0.8rem;color:var(--admin-text-secondary);">' + escapeHtml(v.descripcion) + '</div>' : '') +
            '</div>';

        // Reuse delete modal structure for preview — create a temporary overlay
        var overlay = document.createElement('div');
        overlay.className = 'modal-overlay active';
        overlay.style.zIndex = '999';
        overlay.innerHTML = '<div class="modal" style="max-width:550px;"><div class="modal-header"><h2>Vista Previa — #' + id + '</h2><button class="modal-close" id="closePreview">&times;</button></div><div class="modal-body">' + content + '</div><div class="modal-footer"><button class="btn btn-ghost" id="closePreviewBtn">Cerrar</button><a href="detalle-vehiculo.html?id=' + id + '" target="_blank" class="btn btn-primary btn-sm">Abrir pagina publica</a></div></div>';

        document.body.appendChild(overlay);
        overlay.querySelector('#closePreview').addEventListener('click', function() { document.body.removeChild(overlay); });
        overlay.querySelector('#closePreviewBtn').addEventListener('click', function() { document.body.removeChild(overlay); });
        overlay.addEventListener('click', function(e) { if (e.target === overlay) document.body.removeChild(overlay); });
    }

    // ========== PHASE 4: EXPORT/IMPORT JSON BACKUP ==========
    var btnExport = $('btnExportJSON');
    if (btnExport) {
        btnExport.addEventListener('click', function() {
            var data = {
                exportDate: new Date().toISOString(),
                vehiculos: vehicles,
                marcas: brands
            };
            var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = 'altorra-backup-' + new Date().toISOString().split('T')[0] + '.json';
            a.click();
            URL.revokeObjectURL(url);
            writeAuditLog('backup_export', 'datos', vehicles.length + ' vehiculos, ' + brands.length + ' marcas');
            toast('Respaldo exportado: ' + vehicles.length + ' vehiculos, ' + brands.length + ' marcas');
        });
    }

    var btnImport = $('btnImportJSON');
    var importFile = $('importJSONFile');
    if (btnImport && importFile) {
        btnImport.addEventListener('click', function() { importFile.click(); });
        importFile.addEventListener('change', function() {
            var file = this.files[0];
            if (!file) return;
            if (!isSuperAdmin()) { toast('Solo Super Admin puede importar datos', 'error'); return; }

            var reader = new FileReader();
            reader.onload = function(e) {
                try {
                    var data = JSON.parse(e.target.result);
                    if (!data.vehiculos && !data.marcas) {
                        toast('Archivo JSON invalido: no contiene vehiculos ni marcas.', 'error');
                        return;
                    }

                    var vCount = (data.vehiculos || []).length;
                    var bCount = (data.marcas || []).length;

                    if (!confirm('Importar ' + vCount + ' vehiculos y ' + bCount + ' marcas? Esto REEMPLAZARA los datos existentes con los mismos IDs.')) return;

                    var statusEl = $('backupStatus');
                    statusEl.innerHTML = '<span style="color:var(--admin-accent);">Importando...</span>';

                    var batch = window.db.batch();
                    var count = 0;

                    (data.vehiculos || []).forEach(function(v) {
                        if (!v.id) return;
                        v.updatedAt = new Date().toISOString();
                        v.updatedBy = window.auth.currentUser ? window.auth.currentUser.email : 'import';
                        if (!v._version) v._version = 1;
                        batch.set(window.db.collection('vehiculos').doc(String(v.id)), v);
                        count++;
                    });

                    (data.marcas || []).forEach(function(b) {
                        if (!b.id) return;
                        batch.set(window.db.collection('marcas').doc(b.id), b);
                        count++;
                    });

                    batch.commit().then(function() {
                        writeAuditLog('backup_import', 'datos', vCount + ' vehiculos, ' + bCount + ' marcas');
                        toast('Importados ' + count + ' registros');
                        statusEl.innerHTML = '<span style="color:#3fb950;">✓ Importacion completada: ' + count + ' registros.</span>';
                        loadData();
                    }).catch(function(err) {
                        toast('Error de importacion: ' + err.message, 'error');
                        statusEl.innerHTML = '<span style="color:var(--admin-danger);">Error: ' + err.message + '</span>';
                    });
                } catch (err) {
                    toast('Error al leer archivo JSON: ' + err.message, 'error');
                }
            };
            reader.readAsText(file);
            this.value = '';
        });
    }

    // ========== ORIGIN FIELD (legacy compat) ==========
    function toggleConsignaField() { /* no-op: consigna particular field removed */ }

    // ========== LISTAS CONFIGURABLES SECTION ==========
    var LIST_LABELS = {
        tipos: { title: 'Tipos de Vehiculo', desc: 'Nuevo, Usado, etc.' },
        categorias: { title: 'Categorias', desc: 'Sedan, SUV, Pickup, etc.' },
        transmisiones: { title: 'Transmisiones', desc: 'Automatica, Mecanica, etc.' },
        combustibles: { title: 'Combustibles', desc: 'Gasolina, Diesel, Electrico, etc.' },
        direcciones: { title: 'Direcciones', desc: 'Electrica, Hidraulica, etc.' },
        tracciones: { title: 'Tracciones', desc: 'Delantera, 4x4, AWD, etc.' },
        colores: { title: 'Colores', desc: 'Blanco, Negro, Rojo, etc.' },
        canalesVenta: { title: 'Canales de Venta', desc: 'Presencial, WhatsApp, Redes, etc.' },
        featSeguridad: { title: 'Caracteristicas: Seguridad', desc: 'ABS, Airbags, Alarma, etc.' },
        featConfort: { title: 'Caracteristicas: Confort', desc: 'Aire acondicionado, Asientos cuero, etc.' },
        featTecnologia: { title: 'Caracteristicas: Tecnologia', desc: 'Pantalla tactil, Bluetooth, etc.' },
        featExterior: { title: 'Caracteristicas: Exterior', desc: 'Luces LED, Rines aluminio, etc.' },
        featInterior: { title: 'Caracteristicas: Interior', desc: 'Vidrios electricos, Tapizado, etc.' }
    };

    function renderListsSection() {
        var container = $('listsContainer');
        if (!container) return;

        var lists = window.DynamicLists ? window.DynamicLists.getLists() : {};
        var defaults = window.DynamicLists ? window.DynamicLists.DEFAULTS : {};

        container.innerHTML = '';
        Object.keys(LIST_LABELS).forEach(function(key) {
            var info = LIST_LABELS[key];
            var items = lists[key] || defaults[key] || [];
            var card = document.createElement('div');
            card.className = 'stat-card';
            card.style.padding = '1.25rem';

            var itemsHtml = items.map(function(item, idx) {
                var val = typeof item === 'string' ? item : item.value;
                var label = typeof item === 'string' ? item : item.label;
                return '<div class="list-item-row" style="display:flex;align-items:center;gap:0.5rem;padding:0.35rem 0;border-bottom:1px solid var(--admin-border);">' +
                    '<input type="text" class="form-input" value="' + escapeHtml(val) + '" data-list="' + key + '" data-idx="' + idx + '" data-field="value" style="flex:1;padding:0.3rem 0.5rem;font-size:0.85rem;" placeholder="Valor">' +
                    '<input type="text" class="form-input" value="' + escapeHtml(label) + '" data-list="' + key + '" data-idx="' + idx + '" data-field="label" style="flex:1;padding:0.3rem 0.5rem;font-size:0.85rem;" placeholder="Etiqueta">' +
                    '<button class="btn btn-danger btn-sm" style="padding:0.2rem 0.5rem;font-size:0.75rem;" onclick="adminPanel.removeListItem(\'' + key + '\',' + idx + ')">&times;</button>' +
                '</div>';
            }).join('');

            card.innerHTML =
                '<h4 style="margin:0 0 0.25rem;color:var(--admin-gold);font-size:0.95rem;">' + info.title + '</h4>' +
                '<p style="font-size:0.75rem;color:var(--admin-text-muted);margin:0 0 0.75rem;">' + info.desc + '</p>' +
                '<div id="list-items-' + key + '">' + itemsHtml + '</div>' +
                '<div style="display:flex;gap:0.5rem;margin-top:0.75rem;">' +
                    '<button class="btn btn-ghost btn-sm" onclick="adminPanel.addListItem(\'' + key + '\')" style="font-size:0.8rem;">+ Agregar</button>' +
                    '<button class="btn btn-primary btn-sm" onclick="adminPanel.saveList(\'' + key + '\')" style="font-size:0.8rem;">Guardar</button>' +
                '</div>';
            container.appendChild(card);
        });
    }

    function addListItem(listKey) {
        var container = $('list-items-' + listKey);
        if (!container) return;
        var items = container.querySelectorAll('.list-item-row');
        var idx = items.length;
        var row = document.createElement('div');
        row.className = 'list-item-row';
        row.style = 'display:flex;align-items:center;gap:0.5rem;padding:0.35rem 0;border-bottom:1px solid var(--admin-border);';
        row.innerHTML =
            '<input type="text" class="form-input" data-list="' + listKey + '" data-idx="' + idx + '" data-field="value" style="flex:1;padding:0.3rem 0.5rem;font-size:0.85rem;" placeholder="Valor (ej: hibrido)">' +
            '<input type="text" class="form-input" data-list="' + listKey + '" data-idx="' + idx + '" data-field="label" style="flex:1;padding:0.3rem 0.5rem;font-size:0.85rem;" placeholder="Etiqueta (ej: Hibrido)">' +
            '<button class="btn btn-danger btn-sm" style="padding:0.2rem 0.5rem;font-size:0.75rem;" onclick="this.parentElement.remove()">&times;</button>';
        container.appendChild(row);
        row.querySelector('input').focus();
    }

    function removeListItem(listKey, idx) {
        var container = $('list-items-' + listKey);
        if (!container) return;
        var rows = container.querySelectorAll('.list-item-row');
        if (rows[idx]) rows[idx].remove();
    }

    function saveList(listKey) {
        if (!isSuperAdmin()) { toast('Solo Super Admin puede modificar listas', 'error'); return; }
        var container = $('list-items-' + listKey);
        if (!container) return;

        var rows = container.querySelectorAll('.list-item-row');
        var items = [];
        rows.forEach(function(row) {
            var valInput = row.querySelector('input[data-field="value"]');
            var labelInput = row.querySelector('input[data-field="label"]');
            if (valInput && labelInput && valInput.value.trim()) {
                items.push({ value: valInput.value.trim(), label: labelInput.value.trim() || valInput.value.trim() });
            }
        });

        if (items.length === 0) { toast('La lista no puede quedar vacia', 'error'); return; }

        // Get current lists and update the specific key
        var currentLists = window.DynamicLists ? JSON.parse(JSON.stringify(window.DynamicLists.getLists())) : {};
        currentLists[listKey] = items;

        window.DynamicLists.saveLists(currentLists).then(function() {
            toast('Lista "' + (LIST_LABELS[listKey] ? LIST_LABELS[listKey].title : listKey) + '" guardada');
            writeAuditLog('list_update', 'lista ' + listKey, items.length + ' opciones');
            // Refresh admin form selects
            if (window.DynamicLists) {
                window.DynamicLists.populateAdminForm();
            }
        }).catch(function(err) {
            toast('Error: ' + err.message, 'error');
        });
    }

    // ========== ADMIN CALENDAR & APPOINTMENTS ==========
    // Delegated to admin-appointments.js (Fase 19)
    // These local variables are kept for backward compat with AP references
    AP.calendarMonth = new Date().getMonth();
    AP.calendarYear = new Date().getFullYear();
    AP.blockedDates = {};
    AP.blockedHours = {};

    function renderAdminCalendar() { if (typeof AP.renderAdminCalendar === 'function') AP.renderAdminCalendar(); }
    function toggleBlockDate(dateStr) { if (typeof AP.toggleBlockDate === 'function') AP.toggleBlockDate(dateStr); }
    function loadBlockedDates() { if (typeof AP.loadBlockedDates === 'function') AP.loadBlockedDates(); }
    function renderAppointmentsTable() { if (typeof AP.renderAppointmentsTable === 'function') AP.renderAppointmentsTable(); }
    function deleteAppointment(docId) { if (typeof AP.deleteAppointment === 'function') AP.deleteAppointment(docId); }
    function manageAppointment(docId) { if (typeof AP.manageAppointment === 'function') AP.manageAppointment(docId); }

    function isEditorOrAbove() {
        return isSuperAdmin() || isEditor();
    }

    // ========== VEHICLE ORIGIN HELPER ==========
    function getVehicleOriginName(v) {
        if (v.concesionario && v.concesionario !== '' && v.concesionario !== '_particular') {
            var d = dealers.find(function(x) { return x._docId === v.concesionario; });
            return d ? d.nombre : v.concesionario;
        }
        // Legacy: consigna particular
        if (v.concesionario === '_particular' && v.consignaParticular) {
            return v.consignaParticular;
        }
        return 'Propio (ALTORRA)';
    }

    function isVehiclePropio(v) {
        return !v.concesionario || v.concesionario === '';
    }

    // ========== VEHICLES BY ORIGIN (Aliados tab) ==========
    function renderVehiclesByOrigin() {
        var body = $('vehiclesByOriginBody');
        if (!body) return;

        // Only show vehicles from allies (not propios)
        var allyVehicles = vehicles.filter(function(v) { return !isVehiclePropio(v); });
        var vehiclesWithOrigin = allyVehicles.map(function(v) {
            return { vehicle: v, origin: getVehicleOriginName(v) };
        });

        vehiclesWithOrigin.sort(function(a, b) { return a.origin.localeCompare(b.origin); });

        if (vehiclesWithOrigin.length === 0) {
            body.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--admin-text-muted);padding:2rem;">No hay vehiculos de aliados</td></tr>';
            return;
        }

        body.innerHTML = vehiclesWithOrigin.map(function(item) {
            var v = item.vehicle;
            var marca = v.marca ? (v.marca.charAt(0).toUpperCase() + v.marca.slice(1)) : '';
            var estadoInfo = ESTADO_LABELS[v.estado || 'disponible'] || ESTADO_LABELS.disponible;
            return '<tr>' +
                '<td><strong>' + marca + ' ' + (v.modelo || '') + ' ' + (v.year || '') + '</strong></td>' +
                '<td>' + escapeHtml(item.origin) + '</td>' +
                '<td><span class="badge ' + estadoInfo.cls + '">' + estadoInfo.text + '</span></td>' +
                '<td>' + formatPrice(v.precio) + '</td>' +
            '</tr>';
        }).join('');
    }

    // ========== VEHICULOS PROPIOS TAB ==========
    function renderPropiosTab() {
        var body = $('propiosTableBody');
        var summary = $('propiosSummary');
        if (!body) return;

        var propios = vehicles.filter(function(v) { return isVehiclePropio(v); });
        var activos = propios.filter(function(v) { return v.estado === 'disponible' || !v.estado; });
        var vendidos = propios.filter(function(v) { return v.estado === 'vendido'; });
        // Solo ventas ALTORRA generan ingreso real para propios
        var vendidosAltorra = vendidos.filter(function(v) { return v.canalVenta === 'altorra'; });
        var totalIngresos = vendidosAltorra.reduce(function(s, v) { return s + (v.precioVenta || v.precioCierre || 0); }, 0);
        var totalUtilidad = vendidosAltorra.reduce(function(s, v) { return s + (v.utilidadAltorra || v.utilidadTotal || 0); }, 0);

        if (summary) {
            summary.innerHTML =
                '<div class="stat-card" style="padding:0.75rem;text-align:center;"><div style="font-size:0.75rem;color:var(--admin-text-muted);">Activos</div><div style="font-size:1.5rem;font-weight:700;color:var(--admin-success,#3fb950);">' + activos.length + '</div></div>' +
                '<div class="stat-card" style="padding:0.75rem;text-align:center;"><div style="font-size:0.75rem;color:var(--admin-text-muted);">Vendidos</div><div style="font-size:1.5rem;font-weight:700;">' + vendidos.length + '</div></div>' +
                '<div class="stat-card" style="padding:0.75rem;text-align:center;"><div style="font-size:0.75rem;color:var(--admin-text-muted);">Ingresos</div><div style="font-size:1.1rem;font-weight:700;color:var(--admin-info,#58a6ff);">' + formatPrice(totalIngresos) + '</div><div style="font-size:0.65rem;color:var(--admin-text-muted);">ventas propias</div></div>' +
                '<div class="stat-card" style="padding:0.75rem;text-align:center;"><div style="font-size:0.75rem;color:var(--admin-text-muted);">Utilidad</div><div style="font-size:1.1rem;font-weight:700;color:var(--admin-success,#3fb950);">' + formatPrice(totalUtilidad) + '</div></div>';
        }

        if (propios.length === 0) {
            body.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--admin-text-muted);padding:2rem;">No hay vehiculos propios registrados. Al crear un vehiculo, selecciona origen &quot;Propio (ALTORRA)&quot;.</td></tr>';
            return;
        }

        body.innerHTML = propios.map(function(v) {
            var marca = v.marca ? (v.marca.charAt(0).toUpperCase() + v.marca.slice(1)) : '';
            var estadoInfo = ESTADO_LABELS[v.estado || 'disponible'] || ESTADO_LABELS.disponible;
            var esVendido = v.estado === 'vendido';
            var esAltorra = v.canalVenta === 'altorra';
            var precioVenta = esVendido && esAltorra ? formatPrice(v.precioVenta || v.precioCierre || 0) : (esVendido ? '<small style="color:var(--admin-text-muted);">Terceros</small>' : '-');
            var utilidad = esVendido && esAltorra ? formatPrice(v.utilidadAltorra || v.utilidadTotal || 0) : '-';
            var utilColor = (v.utilidadAltorra || v.utilidadTotal) > 0 && esAltorra ? 'var(--admin-success,#3fb950)' : '';
            var canalInfo = esVendido ? (esAltorra ? '<span style="color:var(--admin-gold);font-size:0.75rem;">ALTORRA</span>' : '<span style="color:var(--admin-text-muted);font-size:0.75rem;">Otros</span>') : '-';
            return '<tr>' +
                '<td><code style="font-size:0.75rem;color:var(--admin-accent,#58a6ff);">' + escapeHtml(v.codigoUnico || '—') + '</code></td>' +
                '<td><strong>' + marca + ' ' + (v.modelo || '') + '</strong><br><small>' + (v.year || '') + '</small></td>' +
                '<td><span class="badge ' + estadoInfo.cls + '">' + estadoInfo.text + '</span></td>' +
                '<td>' + canalInfo + '</td>' +
                '<td>' + formatPrice(v.precio) + '</td>' +
                '<td>' + precioVenta + '</td>' +
                '<td style="font-weight:600;' + (utilColor ? 'color:' + utilColor + ';' : '') + '">' + utilidad + '</td>' +
            '</tr>';
        }).join('');
    }

    // ========== INIT DYNAMIC LISTS IN ADMIN ==========
    function initDynamicListsAdmin() {
        if (!window.DynamicLists) return;
        window.DynamicLists.load().then(function() {
            window.DynamicLists.populateAdminForm();
            renderListsSection();
            loadBlockedDates();
        });
    }

    // Hook into loadData
    var _origLoadData = loadData;
    loadData = function() {
        _origLoadData();
        initDynamicListsAdmin();
    };

    // ========== EXPOSE FUNCTIONS ==========
    window.adminPanel = {
        editVehicle: editVehicle,
        deleteVehicle: deleteVehicleFn,
        removeImage: removeImage,
        editBrand: editBrand,
        deleteBrand: deleteBrandFn,
        editUser: editUser,
        deleteUser: deleteUserFn,
        previewVehicle: previewVehicle,
        updateAppointment: manageAppointment,
        editDealer: editDealer,
        markAsSold: markAsSold,
        addListItem: addListItem,
        removeListItem: removeListItem,
        saveList: saveList,
        toggleBlockDate: toggleBlockDate,
        openDayManager: function(d) { if (typeof AP.openDayManager === 'function') AP.openDayManager(d); },
        manageAppointment: manageAppointment,
        toggleActivitySelect: toggleActivitySelectMode,
        deleteSelectedActivity: deleteSelectedActivity,
        clearAllActivity: clearAllActivity,
        deleteAppointment: deleteAppointment,
        retryLoad: retryLoad,
        loadDraftFromUser: loadDraftFromUser,
        restoreAndOpenDraft: function(snap) {
            // Bridge to admin-vehicles.js module
            if (typeof AP.restoreAndOpenDraft === 'function') {
                AP.restoreAndOpenDraft(snap);
            }
        },
        RBAC: RBAC
    };

    // ========== COLLAPSIBLE FORM SECTIONS ==========
    document.querySelectorAll('.form-section-title[data-toggle]').forEach(function(title) {
        title.addEventListener('click', function() {
            var targetId = this.getAttribute('data-toggle');
            var body = $(targetId);
            if (body) {
                body.classList.toggle('open');
                this.classList.toggle('collapsed');
            }
        });
    });

    // ========== SITEMAP GENERATOR ==========
    var btnSitemap = $('btnGenerateSitemap');
    if (btnSitemap) {
        btnSitemap.addEventListener('click', function() {
            generateSitemap();
        });
    }

    var btnSharePages = $('btnGenerateSharePages');
    if (btnSharePages) {
        btnSharePages.addEventListener('click', function() {
            generateSharePages();
        });
    }

    // Regenerar Paginas SEO — calls Firebase Cloud Function to trigger GitHub Actions
    var btnRegenSeo = $('btnRegenerateSeo');
    if (btnRegenSeo) {
        btnRegenSeo.addEventListener('click', function() {
            if (!isSuperAdmin()) { toast('Solo Super Admin puede regenerar paginas SEO', 'error'); return; }

            var statusEl = $('sitemapStatus');

            if (!window.functions) {
                toast('Firebase Functions no disponible. Verifica la configuracion.', 'error');
                if (statusEl) {
                    statusEl.innerHTML = '<span style="color:var(--admin-danger);font-size:0.8rem;">Error: Firebase Functions no esta inicializado. Verifica que el SDK este cargado correctamente.</span>';
                }
                return;
            }

            // Immediate visual feedback
            btnRegenSeo.disabled = true;
            btnRegenSeo.innerHTML = '<span style="display:inline-flex;align-items:center;gap:6px;"><span class="seo-spinner"></span> Enviando...</span>';
            if (statusEl) {
                statusEl.innerHTML = '<span style="color:var(--admin-accent);font-size:0.8rem;display:flex;align-items:center;gap:8px;">' +
                    '<span class="seo-spinner"></span> Contactando servidor para regenerar paginas SEO...</span>';
            }

            var triggerSeo = window.functions.httpsCallable('triggerSeoRegeneration');
            triggerSeo().then(function(result) {
                toast(result.data.message || 'Regeneracion SEO iniciada', 'success');
                if (statusEl) {
                    statusEl.innerHTML = '<span style="color:var(--admin-success);font-size:0.8rem;display:flex;align-items:center;gap:8px;">' +
                        '<span style="font-size:1rem;">&#10003;</span> Regeneracion iniciada exitosamente. Las miniaturas de redes sociales (WhatsApp, Facebook, Twitter) se actualizaran en aproximadamente 2 minutos.</span>';
                }
            }).catch(function(err) {
                var errorMsg = err.message || 'No se pudo regenerar';
                toast('Error SEO: ' + errorMsg, 'error');
                if (statusEl) {
                    var hint = '';
                    if (errorMsg.indexOf('GITHUB_PAT') !== -1 || errorMsg.indexOf('not configured') !== -1) {
                        hint = ' Ejecuta: <code>firebase functions:secrets:set GITHUB_PAT</code>';
                    } else if (errorMsg.indexOf('unauthenticated') !== -1) {
                        hint = ' Inicia sesion nuevamente.';
                    } else if (errorMsg.indexOf('permission') !== -1) {
                        hint = ' Solo el Super Admin puede ejecutar esta accion.';
                    }
                    statusEl.innerHTML = '<span style="color:var(--admin-danger);font-size:0.8rem;display:flex;align-items:center;gap:8px;">' +
                        '<span style="font-size:1rem;">&#10007;</span> Error: ' + errorMsg + '.' + hint + '</span>';
                }
            }).finally(function() {
                btnRegenSeo.disabled = false;
                btnRegenSeo.textContent = 'Regenerar Paginas SEO';
            });
        });
    }

    function generateSitemap() {
        var statusEl = $('sitemapStatus');
        if (!statusEl) return;
        statusEl.innerHTML = '<span style="color:var(--admin-accent);font-size:0.8rem;">Generando sitemap...</span>';

        var today = new Date().toISOString().split('T')[0];
        var base = 'https://altorracars.github.io';

        // Static pages
        var xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
        xml += '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n\n';

        var staticPages = [
            { loc: '/', priority: '1.0', freq: 'daily' },
            { loc: '/busqueda.html', priority: '0.9', freq: 'weekly' },
            { loc: '/vehiculos-usados.html', priority: '0.9', freq: 'daily' },
            { loc: '/vehiculos-nuevos.html', priority: '0.9', freq: 'daily' },
            { loc: '/vehiculos-suv.html', priority: '0.8', freq: 'weekly' },
            { loc: '/vehiculos-sedan.html', priority: '0.8', freq: 'weekly' },
            { loc: '/vehiculos-pickup.html', priority: '0.8', freq: 'weekly' },
            { loc: '/vehiculos-hatchback.html', priority: '0.8', freq: 'weekly' },
            { loc: '/contacto.html', priority: '0.7', freq: 'monthly' },
            { loc: '/nosotros.html', priority: '0.7', freq: 'monthly' },
            { loc: '/favoritos.html', priority: '0.6', freq: 'monthly' },
            { loc: '/simulador-credito.html', priority: '0.7', freq: 'monthly' }
        ];

        staticPages.forEach(function(p) {
            xml += '  <url>\n';
            xml += '    <loc>' + base + p.loc + '</loc>\n';
            xml += '    <lastmod>' + today + '</lastmod>\n';
            xml += '    <changefreq>' + p.freq + '</changefreq>\n';
            xml += '    <priority>' + p.priority + '</priority>\n';
            xml += '  </url>\n\n';
        });

        // Brand pages from DB
        brands.forEach(function(b) {
            xml += '  <url>\n';
            xml += '    <loc>' + base + '/marca.html?marca=' + encodeURIComponent(b.id) + '</loc>\n';
            xml += '    <lastmod>' + today + '</lastmod>\n';
            xml += '    <changefreq>weekly</changefreq>\n';
            xml += '    <priority>0.7</priority>\n';
            xml += '  </url>\n\n';
        });

        // Vehicle detail pages from DB
        var disponibles = vehicles.filter(function(v) {
            return !v.estado || v.estado === 'disponible';
        });

        disponibles.forEach(function(v) {
            var lastmod = v.updatedAt ? v.updatedAt.split('T')[0] : today;
            xml += '  <url>\n';
            xml += '    <loc>' + base + '/vehiculos/' + _slugifyVehicle(v) + '.html' + '</loc>\n';
            xml += '    <lastmod>' + lastmod + '</lastmod>\n';
            xml += '    <changefreq>weekly</changefreq>\n';
            xml += '    <priority>0.8</priority>\n';
            if (v.imagen) {
                var imgUrl = v.imagen.startsWith('http') ? v.imagen : base + '/' + v.imagen;
                var marca = v.marca ? v.marca.charAt(0).toUpperCase() + v.marca.slice(1) : '';
                xml += '    <image:image>\n';
                xml += '      <image:loc>' + escapeXml(imgUrl) + '</image:loc>\n';
                xml += '      <image:title>' + escapeXml(marca + ' ' + (v.modelo || '') + ' ' + (v.year || '')) + '</image:title>\n';
                xml += '    </image:image>\n';
            }
            xml += '  </url>\n\n';
        });

        xml += '</urlset>\n';

        // Download as file
        var blob = new Blob([xml], { type: 'application/xml' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'sitemap.xml';
        a.click();
        URL.revokeObjectURL(url);

        var count = staticPages.length + brands.length + disponibles.length;
        statusEl.innerHTML = '<span style="color:#3fb950;font-size:0.8rem;">✓ Sitemap generado con ' + count + ' URLs (' + disponibles.length + ' vehiculos). Sube el archivo a la raiz del repositorio.</span>';
    }

    function escapeXml(str) {
        return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    // ========== SHARE PAGES GENERATOR ==========
    function generateSharePages() {
        var statusEl = $('sitemapStatus');
        if (!statusEl) return;

        var disponibles = vehicles.filter(function(v) {
            return !v.estado || v.estado === 'disponible';
        });

        if (disponibles.length === 0) {
            statusEl.innerHTML = '<span style="color:var(--admin-danger);font-size:0.8rem;">No hay vehiculos disponibles para generar.</span>';
            return;
        }

        statusEl.innerHTML = '<span style="color:var(--admin-accent);font-size:0.8rem;">Generando ' + disponibles.length + ' paginas...</span>';

        var base = 'https://altorracars.github.io';
        var files = [];

        disponibles.forEach(function(v) {
            var marca = v.marca ? (v.marca.charAt(0).toUpperCase() + v.marca.slice(1)) : '';
            var modelo = v.modelo || '';
            var year = v.year || '';
            var title = marca + ' ' + modelo + ' ' + year + ' | ALTORRA CARS';
            var precio = v.precioOferta || v.precio || 0;
            var precioText = precio ? ('$' + Number(precio).toLocaleString('es-CO')) : '';
            var desc = marca + ' ' + modelo + ' ' + year + ' - ' + precioText + '. Disponible en ALTORRA CARS, Cartagena.';
            var image = v.imagen || '';
            var fullImage = image.startsWith('http') ? image : base + '/' + image;
            var detailUrl = base + '/vehiculos/' + _slugifyVehicle(v) + '.html';

            var html = '<!DOCTYPE html>\n<html lang="es">\n<head>\n';
            html += '<meta charset="UTF-8">\n';
            html += '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n';
            html += '<title>' + escapeHtml(title) + '</title>\n';
            html += '<meta name="description" content="' + escapeHtml(desc) + '">\n';
            html += '<meta property="og:type" content="product">\n';
            html += '<meta property="og:url" content="' + escapeHtml(detailUrl) + '">\n';
            html += '<meta property="og:title" content="' + escapeHtml(title) + '">\n';
            html += '<meta property="og:description" content="' + escapeHtml(desc) + '">\n';
            html += '<meta property="og:image" content="' + escapeHtml(fullImage) + '">\n';
            html += '<meta property="og:image:width" content="1200">\n';
            html += '<meta property="og:image:height" content="630">\n';
            html += '<meta property="og:site_name" content="ALTORRA CARS">\n';
            html += '<meta property="og:locale" content="es_CO">\n';
            html += '<meta name="twitter:card" content="summary_large_image">\n';
            html += '<meta name="twitter:title" content="' + escapeHtml(title) + '">\n';
            html += '<meta name="twitter:description" content="' + escapeHtml(desc) + '">\n';
            html += '<meta name="twitter:image" content="' + escapeHtml(fullImage) + '">\n';
            html += '<meta http-equiv="refresh" content="0;url=' + detailUrl + '">\n';
            html += '<link rel="canonical" href="' + detailUrl + '">\n';
            html += '<style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#0a0a0a;color:#d4af37;}a{color:#d4af37;}</style>\n';
            html += '</head>\n<body>\n';
            html += '<p>Redirigiendo a <a href="' + detailUrl + '">' + escapeHtml(marca + ' ' + modelo + ' ' + year) + '</a>...</p>\n';
            html += '<script>window.location.replace("' + detailUrl + '");<\/script>\n';
            html += '</body>\n</html>\n';

            files.push({ name: v.id + '.html', content: html });
        });

        // Download each file individually is impractical. Create a single combined download.
        // Generate as a single HTML file with instructions + all file contents for manual creation.
        var combined = '<!-- PAGINAS DE COMPARTIR - ALTORRA CARS -->\n';
        combined += '<!-- Instrucciones: Copia cada seccion en un archivo dentro de la carpeta v/ del repositorio -->\n';
        combined += '<!-- Ejemplo: v/1.html, v/2.html, etc. -->\n';
        combined += '<!-- Luego comparte: https://altorracars.github.io/v/1.html -->\n\n';

        files.forEach(function(f) {
            combined += '<!-- ===== ARCHIVO: v/' + f.name + ' ===== -->\n';
            combined += f.content;
            combined += '\n\n';
        });

        // Also create them as individual downloads for the first vehicle as example
        // But mainly download all at once
        var blob = new Blob([combined], { type: 'text/html' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'paginas-compartir-vehiculos.html';
        a.click();
        URL.revokeObjectURL(url);

        statusEl.innerHTML = '<span style="color:#3fb950;font-size:0.8rem;">✓ ' + files.length + ' paginas generadas. Separa cada seccion en archivos individuales dentro de la carpeta <strong>v/</strong> del repositorio.<br>Ejemplo: <code>v/' + files[0].name + '</code> → comparte: <code>' + base + '/v/' + files[0].name + '</code></span>';
    }

    // ========== PHASE 5: APPOINTMENTS MANAGEMENT ==========
    AP.appointments = [];
    AP.unsubAppointments = null;

    // loadAppointments / loadAvailabilityConfig — delegated to admin-appointments.js (Fase 19)
    function loadAppointments() { if (typeof AP.loadAppointments === 'function') AP.loadAppointments(); }
    function loadAvailabilityConfig() { if (typeof AP.loadAvailabilityConfig === 'function') AP.loadAvailabilityConfig(); }

    // ========== PHASE 5: CONCESIONARIOS ==========
    var dealers = [];
    var unsubDealers = null;

    function loadDealers() {
        if (unsubDealers) unsubDealers();
        unsubDealers = window.db.collection('concesionarios').onSnapshot(function(snap) {
            dealers = snap.docs.map(function(doc) { return Object.assign({ _docId: doc.id }, doc.data()); });
            renderDealersList();
            renderVehiclesByOrigin();
            renderPropiosTab();
            renderSalesTracking();
        }, function(err) {
            console.warn('[Dealers] Error loading:', err);
        });
    }

    function renderDealersList() {
        var container = $('dealersList');
        if (!container) return;

        if (dealers.length === 0) {
            container.innerHTML = '<p style="text-align:center;color:var(--admin-text-muted);padding:1rem;">No hay aliados registrados. Agrega el primero.</p>';
            return;
        }

        // Calculate metrics per dealer
        var metricsByDealer = {};
        var soldVehicles = vehicles.filter(function(v) { return v.estado === 'vendido'; });
        soldVehicles.forEach(function(v) {
            var did = v.concesionario || '';
            if (!did) return; // skip propios
            if (!metricsByDealer[did]) metricsByDealer[did] = { vendidos: 0, ventasAltorra: 0, comisiones: 0 };
            metricsByDealer[did].vendidos++;
            if (v.canalVenta === 'altorra') {
                metricsByDealer[did].ventasAltorra++;
                metricsByDealer[did].comisiones += (v.comisionAltorra || v.utilidadAltorra || v.utilidadTotal || 0);
            }
        });

        var activeByDealer = {};
        vehicles.filter(function(v) { return (v.estado === 'disponible' || !v.estado) && v.concesionario; }).forEach(function(v) {
            activeByDealer[v.concesionario] = (activeByDealer[v.concesionario] || 0) + 1;
        });

        container.innerHTML = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:1rem;">' +
            dealers.map(function(d) {
                var m = metricsByDealer[d._docId] || { vendidos: 0, ventasAltorra: 0, comisiones: 0 };
                var active = activeByDealer[d._docId] || 0;
                return '<div style="background:var(--admin-surface);border:1px solid var(--admin-border);border-radius:12px;padding:1.25rem;">' +
                    '<div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:0.75rem;">' +
                        '<div><h4 style="margin:0;color:var(--admin-gold);">' + escapeHtml(d.nombre || 'Sin nombre') + '</h4>' +
                        '<small style="color:var(--admin-text-muted);">' + escapeHtml(d.ciudad || '') + (d.direccion ? ' - ' + escapeHtml(d.direccion) : '') + '</small></div>' +
                        (isSuperAdmin() ? '<button class="btn btn-sm btn-ghost" onclick="adminPanel.editDealer(\'' + d._docId + '\')" style="font-size:0.75rem;">Editar</button>' : '') +
                    '</div>' +
                    '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:0.5rem;text-align:center;">' +
                        '<div style="background:rgba(63,185,80,0.1);padding:0.5rem;border-radius:8px;"><div style="font-size:1.25rem;font-weight:800;color:var(--admin-success);">' + active + '</div><div style="font-size:0.7rem;color:var(--admin-text-muted);">Activos</div></div>' +
                        '<div style="background:rgba(212,175,55,0.1);padding:0.5rem;border-radius:8px;"><div style="font-size:1.25rem;font-weight:800;color:var(--admin-gold);">' + m.vendidos + '</div><div style="font-size:0.7rem;color:var(--admin-text-muted);">Vendidos</div></div>' +
                        '<div style="background:rgba(88,166,255,0.1);padding:0.5rem;border-radius:8px;"><div style="font-size:0.85rem;font-weight:800;color:var(--admin-info);">' + m.ventasAltorra + '</div><div style="font-size:0.7rem;color:var(--admin-text-muted);">Nuestras</div></div>' +
                        '<div style="background:rgba(63,185,80,0.1);padding:0.5rem;border-radius:8px;"><div style="font-size:0.85rem;font-weight:800;color:var(--admin-success);">$' + (m.comisiones > 0 ? (m.comisiones / 1000000).toFixed(1) + 'M' : '0') + '</div><div style="font-size:0.7rem;color:var(--admin-text-muted);">Comisiones</div></div>' +
                    '</div>' +
                    (d.telefono ? '<div style="margin-top:0.5rem;font-size:0.8rem;color:var(--admin-text-muted);">Tel: ' + d.telefono + '</div>' : '') +
                    (d.responsable ? '<div style="font-size:0.8rem;color:var(--admin-text-muted);">Responsable: ' + escapeHtml(d.responsable) + '</div>' : '') +
                '</div>';
            }).join('') +
        '</div>';
    }

    // Dealer Modal
    var btnAddDealer = $('btnAddDealer');
    if (btnAddDealer) {
        btnAddDealer.addEventListener('click', function() {
            if (!RBAC.canManageDealers()) { toast('Solo Super Admin puede gestionar concesionarios', 'error'); return; }
            $('dealerModalTitle').textContent = 'Agregar Aliado';
            $('dOriginalId').value = '';
            $('dealerForm').reset();
            $('dCiudad').value = 'Cartagena';
            $('dealerModal').classList.add('active');
        });
    }

    var closeDealerModalEl = $('closeDealerModal');
    if (closeDealerModalEl) closeDealerModalEl.addEventListener('click', function() { $('dealerModal').classList.remove('active'); });
    var cancelDealerModalEl = $('cancelDealerModal');
    if (cancelDealerModalEl) cancelDealerModalEl.addEventListener('click', function() { $('dealerModal').classList.remove('active'); });

    function editDealer(docId) {
        if (!isSuperAdmin()) { toast('Sin permisos', 'error'); return; }
        var d = dealers.find(function(x) { return x._docId === docId; });
        if (!d) return;
        $('dealerModalTitle').textContent = 'Editar Aliado';
        $('dOriginalId').value = docId;
        $('dNombre').value = d.nombre || '';
        $('dDireccion').value = d.direccion || '';
        $('dTelefono').value = d.telefono || '';
        $('dCiudad').value = d.ciudad || 'Cartagena';
        $('dHorario').value = d.horario || '';
        $('dResponsable').value = d.responsable || '';
        $('dealerModal').classList.add('active');
    }

    var saveDealerBtn = $('saveDealer');
    if (saveDealerBtn) {
        saveDealerBtn.addEventListener('click', function() {
            if (!isSuperAdmin()) { toast('Sin permisos', 'error'); return; }
            var nombre = $('dNombre').value.trim();
            if (!nombre) { toast('Nombre es requerido', 'error'); return; }

            var dealerData = {
                nombre: nombre,
                direccion: $('dDireccion').value.trim(),
                telefono: $('dTelefono').value.trim(),
                ciudad: $('dCiudad').value.trim() || 'Cartagena',
                horario: $('dHorario').value.trim(),
                responsable: $('dResponsable').value.trim(),
                updatedAt: new Date().toISOString(),
                updatedBy: window.auth.currentUser.email
            };

            var existingId = $('dOriginalId').value;
            var savePromise;
            if (existingId) {
                savePromise = window.db.collection('concesionarios').doc(existingId).update(dealerData);
            } else {
                var docId = nombre.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
                savePromise = window.db.collection('concesionarios').doc(docId).set(dealerData);
            }

            savePromise.then(function() {
                toast(existingId ? 'Aliado actualizado' : 'Aliado creado');
                writeAuditLog(existingId ? 'dealer_update' : 'dealer_create', 'aliado ' + nombre, '');
                $('dealerModal').classList.remove('active');
            }).catch(function(err) {
                if (err.code === 'permission-denied') {
                    toast('Sin permisos. Verifica que las Firestore Rules esten desplegadas y tu rol sea super_admin. Ejecuta: firebase deploy --only firestore:rules', 'error');
                } else {
                    toast('Error: ' + err.message, 'error');
                }
            });
        });
    }

    // ========== SALES TRACKING ==========
    var CANAL_LABELS = {
        'altorra': 'ALTORRA',
        'otros': 'Otros (terceros)',
        // Legacy mappings for backwards compatibility
        'concesionario': 'Otros (terceros)',
        'intermediario': 'Otros (terceros)',
        'cliente_directo': 'Otros (terceros)',
        'otro': 'Otros (terceros)'
    };

    function renderSalesTracking() {
        var body = $('salesTrackingBody');
        if (!body) return;

        var sold = vehicles.filter(function(v) { return v.estado === 'vendido'; });
        sold.sort(function(a, b) { return (b.fechaVenta || b.updatedAt || '').localeCompare(a.fechaVenta || a.updatedAt || ''); });

        if (sold.length === 0) {
            body.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--admin-text-muted);padding:2rem;">Sin operaciones registradas</td></tr>';
            renderSalesSummary(sold);
            return;
        }

        body.innerHTML = sold.map(function(v) {
            var marca = v.marca ? (v.marca.charAt(0).toUpperCase() + v.marca.slice(1)) : '';
            var origen = getVehicleOriginName(v);
            var esPropio = isVehiclePropio(v);
            var esAltorra = v.canalVenta === 'altorra';
            var canalBadge = esAltorra
                ? '<span style="color:var(--admin-gold);font-weight:700;">ALTORRA</span>'
                : '<span style="color:var(--admin-text-muted);">Otros</span>';

            // Ganancia ALTORRA: utilidad para propios, comision para aliados
            var ganancia = 0;
            var tipoGanancia = '-';
            if (esAltorra) {
                if (esPropio) {
                    ganancia = v.utilidadAltorra || v.utilidadTotal || 0;
                    tipoGanancia = '<span style="color:var(--admin-success);font-size:0.7rem;font-weight:600;">Utilidad</span>';
                } else {
                    ganancia = v.comisionAltorra || v.utilidadAltorra || v.utilidadTotal || 0;
                    tipoGanancia = '<span style="color:var(--admin-info);font-size:0.7rem;font-weight:600;">Comision</span>';
                }
            }
            var gananciaColor = ganancia > 0 ? 'var(--admin-success,#3fb950)' : 'var(--admin-text-muted)';

            return '<tr>' +
                '<td><code style="font-size:0.75rem;color:var(--admin-accent,#58a6ff);">' + escapeHtml(v.codigoUnico || '—') + '</code></td>' +
                '<td><strong>' + marca + ' ' + (v.modelo || '') + '</strong><br><small>' + (v.year || '') + '</small></td>' +
                '<td style="font-size:0.8rem;">' + escapeHtml(origen) + '</td>' +
                '<td>' + canalBadge + '</td>' +
                '<td>' + (esAltorra ? formatPrice(v.precioVenta || v.precioCierre || 0) : '-') + '</td>' +
                '<td style="font-weight:600;color:' + gananciaColor + ';">' + (esAltorra && ganancia ? formatPrice(ganancia) : '-') + '</td>' +
                '<td>' + (esAltorra ? tipoGanancia : '-') + '</td>' +
                '<td>' + (v.fechaCierre || (v.fechaVenta || '').split('T')[0] || '-') + '</td>' +
            '</tr>';
        }).join('');

        renderSalesSummary(sold);
    }

    function renderSalesSummary(sold) {
        var container = $('salesSummary');
        if (!container) return;
        if (sold.length === 0) { container.innerHTML = ''; return; }

        var totalVentas = sold.length;
        var ventasAltorra = sold.filter(function(v) { return v.canalVenta === 'altorra'; });
        var ventasOtros = sold.filter(function(v) { return v.canalVenta !== 'altorra'; });

        // Separar propios vs aliados vendidos por ALTORRA
        var propiosAltorra = ventasAltorra.filter(function(v) { return isVehiclePropio(v); });
        var aliadosAltorra = ventasAltorra.filter(function(v) { return !isVehiclePropio(v); });

        // Ingresos propios: precio de venta entra a ALTORRA
        var ingresosPropios = propiosAltorra.reduce(function(sum, v) { return sum + (v.precioVenta || v.precioCierre || 0); }, 0);
        // Utilidad propios
        var utilidadPropios = propiosAltorra.reduce(function(sum, v) { return sum + (v.utilidadAltorra || v.utilidadTotal || 0); }, 0);
        // Comisiones de aliados: solo la comision entra a ALTORRA
        var comisionesAliados = aliadosAltorra.reduce(function(sum, v) { return sum + (v.comisionAltorra || v.utilidadAltorra || v.utilidadTotal || 0); }, 0);
        // Ganancia total ALTORRA = utilidad propios + comisiones aliados
        var gananciaTotal = utilidadPropios + comisionesAliados;

        var summaryHtml =
            '<div class="stat-card" style="padding:0.75rem;text-align:center;"><div style="font-size:0.75rem;color:var(--admin-text-muted);">Total operaciones</div><div style="font-size:1.5rem;font-weight:700;">' + totalVentas + '</div></div>' +
            '<div class="stat-card" style="padding:0.75rem;text-align:center;"><div style="font-size:0.75rem;color:var(--admin-text-muted);">Ventas ALTORRA</div><div style="font-size:1.5rem;font-weight:700;color:var(--admin-gold);">' + ventasAltorra.length + '</div></div>' +
            '<div class="stat-card" style="padding:0.75rem;text-align:center;"><div style="font-size:0.75rem;color:var(--admin-text-muted);">Ventas terceros</div><div style="font-size:1.5rem;font-weight:700;color:var(--admin-text-muted);">' + ventasOtros.length + '</div></div>' +
            '<div class="stat-card" style="padding:0.75rem;text-align:center;"><div style="font-size:0.75rem;color:var(--admin-text-muted);">Ingresos propios</div><div style="font-size:1.1rem;font-weight:700;color:var(--admin-info,#58a6ff);">' + formatPrice(ingresosPropios) + '</div><div style="font-size:0.65rem;color:var(--admin-text-muted);">venta vehiculos propios</div></div>' +
            '<div class="stat-card" style="padding:0.75rem;text-align:center;"><div style="font-size:0.75rem;color:var(--admin-text-muted);">Comisiones aliados</div><div style="font-size:1.1rem;font-weight:700;color:var(--admin-warning,#d29922);">' + formatPrice(comisionesAliados) + '</div><div style="font-size:0.65rem;color:var(--admin-text-muted);">intermediacion</div></div>' +
            '<div class="stat-card" style="padding:0.75rem;text-align:center;"><div style="font-size:0.75rem;color:var(--admin-text-muted);">Ganancia total ALTORRA</div><div style="font-size:1.1rem;font-weight:700;color:var(--admin-success,#3fb950);">' + formatPrice(gananciaTotal) + '</div><div style="font-size:0.65rem;color:var(--admin-text-muted);">utilidad + comisiones</div></div>';

        container.innerHTML = summaryHtml;
    }

    // Mark Vehicle as Sold — full sales tracking
    function markAsSold(vehicleId) {
        if (!canCreateOrEditInventory()) { toast('Sin permisos', 'error'); return; }
        var v = vehicles.find(function(x) { return x.id === vehicleId; });
        if (!v) return;
        // Fase 22: Proteccion contra doble venta
        if (v.estado === 'vendido') { toast('Este vehiculo ya esta marcado como vendido.', 'error'); return; }

        var esPropio = isVehiclePropio(v);
        $('soldVehicleId').value = vehicleId;
        $('soldOrigenTipo').value = esPropio ? 'propio' : 'aliado';
        var marca = v.marca ? (v.marca.charAt(0).toUpperCase() + v.marca.slice(1)) : '';
        var codeInfo = v.codigoUnico ? '<code style="color:var(--admin-accent);">' + v.codigoUnico + '</code> — ' : '';
        $('soldVehicleInfo').innerHTML = codeInfo + '<strong>' + marca + ' ' + (v.modelo || '') + ' ' + (v.year || '') + '</strong><br>Precio publicado: ' + formatPrice(v.precio);

        // Show origin info with clear financial explanation
        var origenInfo = $('soldOrigenInfo');
        if (origenInfo) {
            if (esPropio) {
                origenInfo.style.background = 'rgba(63,185,80,0.1)';
                origenInfo.style.borderColor = 'rgba(63,185,80,0.3)';
                origenInfo.style.color = 'var(--admin-success,#3fb950)';
                origenInfo.innerHTML = '<strong>PROPIO (ALTORRA)</strong> — El precio de venta ingresa a nuestras cuentas';
            } else {
                var d = dealers.find(function(x) { return x._docId === v.concesionario; });
                var dName = d ? d.nombre : v.concesionario;
                origenInfo.style.background = 'rgba(88,166,255,0.1)';
                origenInfo.style.borderColor = 'rgba(88,166,255,0.3)';
                origenInfo.style.color = 'var(--admin-info,#58a6ff)';
                origenInfo.innerHTML = '<strong>ALIADO: ' + escapeHtml(dName) + '</strong> — El dinero de venta va al aliado, solo recibimos comision';
            }
        }

        // Reset all fields
        if ($('soldPrecio')) $('soldPrecio').value = '';
        if ($('soldUtilidad')) $('soldUtilidad').value = '';
        if ($('soldPrecioAliado')) $('soldPrecioAliado').value = '';
        if ($('soldComision')) $('soldComision').value = '';
        $('soldCanal').value = '';
        if ($('soldResponsable')) $('soldResponsable').value = '';
        if ($('soldResponsableAliado')) $('soldResponsableAliado').value = '';
        $('soldFechaCierre').value = new Date().toISOString().split('T')[0];
        $('soldObservaciones').value = '';

        // Hide all dynamic fields
        if ($('soldPropioFields')) $('soldPropioFields').style.display = 'none';
        if ($('soldAliadoFields')) $('soldAliadoFields').style.display = 'none';
        var canalHint = $('soldCanalHint');
        if (canalHint) canalHint.style.display = 'none';

        $('soldModal').classList.add('active');
    }

    // Canal change handler: show correct fields based on origin + canal
    var soldCanalEl = $('soldCanal');
    if (soldCanalEl) {
        soldCanalEl.addEventListener('change', function() {
            var origenTipo = $('soldOrigenTipo').value;
            var propioFields = $('soldPropioFields');
            var aliadoFields = $('soldAliadoFields');
            var canalHint = $('soldCanalHint');

            // Hide all first
            if (propioFields) propioFields.style.display = 'none';
            if (aliadoFields) aliadoFields.style.display = 'none';

            if (this.value === 'altorra') {
                if (origenTipo === 'propio') {
                    if (propioFields) propioFields.style.display = '';
                    if (canalHint) { canalHint.style.display = 'block'; canalHint.style.color = 'var(--admin-success,#3fb950)'; canalHint.textContent = 'Vehiculo propio vendido por ALTORRA. El ingreso total entra a nuestras cuentas.'; }
                } else {
                    if (aliadoFields) aliadoFields.style.display = '';
                    if (canalHint) { canalHint.style.display = 'block'; canalHint.style.color = 'var(--admin-info,#58a6ff)'; canalHint.textContent = 'Vehiculo de aliado vendido por ALTORRA. Solo la comision ingresa a nuestras cuentas.'; }
                }
            } else if (this.value === 'otros') {
                if (canalHint) { canalHint.style.display = 'block'; canalHint.style.color = 'var(--admin-text-muted)'; canalHint.textContent = 'Vendido por terceros. No genera ingresos ni comision para ALTORRA.'; }
            } else {
                if (canalHint) canalHint.style.display = 'none';
            }
        });
    }

    var closeSoldModalEl = $('closeSoldModal');
    if (closeSoldModalEl) closeSoldModalEl.addEventListener('click', function() { $('soldModal').classList.remove('active'); });
    var cancelSoldModalEl = $('cancelSoldModal');
    if (cancelSoldModalEl) cancelSoldModalEl.addEventListener('click', function() { $('soldModal').classList.remove('active'); });

    var confirmSoldBtn = $('confirmSold');
    if (confirmSoldBtn) {
        confirmSoldBtn.addEventListener('click', function() {
            var vehicleId = parseInt($('soldVehicleId').value);
            if (!vehicleId) return;
            var canal = $('soldCanal').value;
            if (!canal) { toast('Selecciona el canal de venta', 'error'); return; }

            var v = vehicles.find(function(x) { return x.id === vehicleId; });
            var currentVersion = v ? (v._version || 0) : 0;
            var origenTipo = $('soldOrigenTipo').value; // 'propio' or 'aliado'
            var precioVenta = 0;
            var utilidadAltorra = 0;
            var comisionAltorra = 0;
            var responsable = '';

            if (canal === 'altorra') {
                if (origenTipo === 'propio') {
                    // Vehiculo propio: ingreso total + utilidad
                    precioVenta = parseInt($('soldPrecio').value) || 0;
                    utilidadAltorra = parseInt($('soldUtilidad').value) || 0;
                    responsable = ($('soldResponsable').value || '').trim();
                    if (!precioVenta || !responsable) { toast('Precio de venta y responsable son requeridos', 'error'); return; }
                } else {
                    // Vehiculo aliado: precio referencia + comision
                    precioVenta = parseInt($('soldPrecioAliado').value) || 0;
                    comisionAltorra = parseInt($('soldComision').value) || 0;
                    responsable = ($('soldResponsableAliado').value || '').trim();
                    if (!comisionAltorra || !responsable) { toast('Comision ALTORRA y responsable son requeridos', 'error'); return; }
                }
            }

            var updateData = {
                estado: 'vendido',
                canalVenta: canal,
                origenTipo: origenTipo,
                responsableComercial: responsable || null,
                precioVenta: precioVenta || null,
                precioCierre: precioVenta || null,
                utilidadAltorra: (origenTipo === 'propio' && canal === 'altorra') ? (utilidadAltorra || null) : null,
                comisionAltorra: (origenTipo === 'aliado' && canal === 'altorra') ? (comisionAltorra || null) : null,
                fechaCierre: $('soldFechaCierre').value || new Date().toISOString().split('T')[0],
                fechaVenta: new Date().toISOString(),
                observacionesVenta: ($('soldObservaciones').value || '').trim(),
                updatedAt: new Date().toISOString(),
                updatedBy: window.auth.currentUser.email,
                _version: currentVersion + 1
            };

            window.db.collection('vehiculos').doc(String(vehicleId)).update(updateData).then(function() {
                var marca = v ? (v.marca || '') : '';
                toast('Operacion registrada exitosamente');
                var soldCode = v && v.codigoUnico ? ' [' + v.codigoUnico + ']' : '';
                var logDetail = marca + ' via ' + canal;
                if (canal === 'altorra' && origenTipo === 'propio') {
                    logDetail += ' | ingreso: ' + formatPrice(precioVenta) + ' | utilidad: ' + formatPrice(utilidadAltorra);
                } else if (canal === 'altorra' && origenTipo === 'aliado') {
                    logDetail += ' | venta aliado: ' + formatPrice(precioVenta) + ' | comision: ' + formatPrice(comisionAltorra);
                }
                writeAuditLog('vehicle_sold', 'vehiculo #' + vehicleId + soldCode, logDetail);
                $('soldModal').classList.remove('active');
            }).catch(function(err) {
                toast('Error: ' + err.message, 'error');
            });
        });
    }

    // ========== DEALERS TABS NAVIGATION ==========
    document.querySelectorAll('.dealers-tab').forEach(function(tab) {
        tab.addEventListener('click', function() {
            var target = this.dataset.dealersTab;
            document.querySelectorAll('.dealers-tab').forEach(function(t) { t.classList.remove('active'); });
            document.querySelectorAll('.dealers-tab-content').forEach(function(c) { c.style.display = 'none'; c.classList.remove('active'); });
            this.classList.add('active');
            var targetEl = $('dealersTab' + target.charAt(0).toUpperCase() + target.slice(1));
            if (targetEl) { targetEl.style.display = ''; targetEl.classList.add('active'); }
        });
    });

    // ========== INIT ==========
    initAuth();

})();
