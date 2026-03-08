// Admin Panel — Auth, RBAC & Navigation
(function() {
    'use strict';
    var AP = window.AP;
    var $ = AP.$;

    // ========== INACTIVITY TRACKING ==========
    function clearInactivityTimer() {
        if (AP.inactivityTimerId) {
            clearTimeout(AP.inactivityTimerId);
            AP.inactivityTimerId = null;
        }
    }

    function stopInactivityTracking() {
        clearInactivityTimer();
        if (!AP.inactivityTrackingActive) return;
        AP.ACTIVITY_EVENTS.forEach(function(eventName) {
            document.removeEventListener(eventName, resetInactivityTracking, true);
        });
        AP.inactivityTrackingActive = false;
    }

    function handleInactivityTimeout() {
        clearInactivityTimer();
        if (!window.auth || !window.auth.currentUser) return;
        AP.toast('Sesion cerrada por inactividad (3 minutos).', 'info');
        window.auth.signOut();
    }

    function resetInactivityTracking() {
        if (!AP.inactivityTrackingActive) return;
        clearInactivityTimer();
        AP.inactivityTimerId = setTimeout(handleInactivityTimeout, AP.INACTIVITY_TIMEOUT_MS);
    }

    function startInactivityTracking() {
        if (AP.inactivityTrackingActive) return;
        AP.ACTIVITY_EVENTS.forEach(function(eventName) {
            document.addEventListener(eventName, resetInactivityTracking, true);
        });
        AP.inactivityTrackingActive = true;
        resetInactivityTracking();
    }

    // ========== AUTH INIT ==========
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
                            AP.currentUserProfile = null;
                            AP.currentUserRole = null;
                            stopInactivityTracking();
                            showLogin();
                        }
                    });
                });
        });
    }

    function loadUserProfile(authUser) {
        window.db.collection('usuarios').doc(authUser.uid).get()
            .then(function(doc) {
                if (doc.exists) {
                    AP.currentUserProfile = doc.data();
                    AP.currentUserProfile._docId = doc.id;
                    AP.currentUserRole = AP.currentUserProfile.rol;
                    showAdmin(authUser);
                } else {
                    showAccessDenied(authUser.email, authUser.uid, 'No tienes perfil administrativo asignado. Un Super Admin debe crearlo.');
                }
            })
            .catch(function(err) {
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
        AP.stopRealtimeSync();
        resetLoginBtn();
        $('loginScreen').style.display = 'flex';
        $('adminPanel').style.display = 'none';
        $('loginForm').reset();
    }

    function showAdmin(user) {
        resetLoginBtn();
        $('loginScreen').style.display = 'none';
        $('adminPanel').style.display = 'flex';
        $('adminEmail').textContent = user.email + ' (' + (AP.currentUserRole === 'super_admin' ? 'Super Admin' : AP.currentUserRole === 'editor' ? 'Editor' : 'Viewer') + ')';
        AP.writeAuditLog('login', 'sesion', user.email);
        startInactivityTracking();
        applyRolePermissions();
        AP.loadData();
    }

    function applyRolePermissions() {
        var usersNav = document.querySelector('.nav-item[data-section="users"]');
        if (usersNav) usersNav.style.display = AP.canManageUsers() ? '' : 'none';
        var btnAddVehicle = $('btnAddVehicle');
        var btnAddBrand = $('btnAddBrand');
        if (btnAddVehicle) btnAddVehicle.style.display = AP.canCreateOrEditInventory() ? '' : 'none';
        if (btnAddBrand) btnAddBrand.style.display = AP.canCreateOrEditInventory() ? '' : 'none';
    }

    // ========== LOGIN FORM ==========
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

        var loginTimeout = setTimeout(function() {
            resetLoginBtn();
            errEl.style.display = 'block';
            errEl.textContent = 'Tiempo de espera agotado. Verifica tu conexion e intenta de nuevo.';
        }, 15000);

        window.firebaseReady.then(function() {
                return window.auth.signInWithEmailAndPassword(email, pass);
            })
            .then(function() {
                clearTimeout(loginTimeout);
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
        window.firebaseReady.then(function() { window.auth.signOut(); });
    });

    // ========== CHANGE PASSWORD ==========
    $('changePasswordForm').addEventListener('submit', function(e) {
        e.preventDefault();
        var currentUser = window.auth.currentUser;
        if (!currentUser || !currentUser.email) {
            AP.toast('Sesion invalida. Inicia sesion de nuevo.', 'error');
            window.auth.signOut();
            return;
        }
        var newPass = $('newPassword').value;
        var currentPass = window.prompt('Para cambiar la contrasena, confirma tu contrasena actual:');
        if (!currentPass) { AP.toast('Cambio de contrasena cancelado.', 'info'); return; }

        var credential = firebase.auth.EmailAuthProvider.credential(currentUser.email, currentPass);
        currentUser.reauthenticateWithCredential(credential)
            .then(function() { return currentUser.updatePassword(newPass); })
            .then(function() { AP.toast('Contrasena actualizada'); $('newPassword').value = ''; })
            .catch(function(err) {
                if (err && (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential')) {
                    AP.toast('Contrasena actual incorrecta.', 'error');
                } else {
                    AP.toast('Error: ' + (err && err.message ? err.message : 'No se pudo cambiar la contrasena.'), 'error');
                }
            });
    });

    // ========== MOBILE MENU ==========
    var hamburgerBtn = $('hamburgerBtn');
    var sidebar = $('adminSidebar');
    var sidebarOverlay = $('sidebarOverlay');

    function closeMobileMenu() {
        sidebar.classList.remove('open');
        hamburgerBtn.classList.remove('active');
        sidebarOverlay.classList.remove('active');
    }

    if (hamburgerBtn) hamburgerBtn.addEventListener('click', function() {
        var isOpen = sidebar.classList.toggle('open');
        hamburgerBtn.classList.toggle('active', isOpen);
        sidebarOverlay.classList.toggle('active', isOpen);
    });
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeMobileMenu);
    var mobileLogoutBtn = $('mobileLogoutBtn');
    if (mobileLogoutBtn) mobileLogoutBtn.addEventListener('click', function() { if (window.auth) window.auth.signOut(); });

    // ========== NAVIGATION ==========
    document.querySelectorAll('.nav-item[data-section]').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var section = this.getAttribute('data-section');
            if (section === 'users' && !AP.canManageUsers()) {
                AP.toast('No tienes permisos para acceder a esta seccion', 'error');
                return;
            }
            document.querySelectorAll('.nav-item').forEach(function(n) { n.classList.remove('active'); });
            this.classList.add('active');
            document.querySelectorAll('.section').forEach(function(s) { s.classList.remove('active'); });
            $('sec-' + section).classList.add('active');
            closeMobileMenu();
        });
    });

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

    // ========== EXPOSE ==========
    AP.initAuth = initAuth;
    AP.stopInactivityTracking = stopInactivityTracking;

    // Start auth
    initAuth();
})();
