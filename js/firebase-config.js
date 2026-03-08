// Firebase Configuration for ALTORRA CARS
// Loads Firebase SDK from CDN and initializes the app

(function() {
    'use strict';

    const FIREBASE_VERSION = '11.3.0';
    const CDN_BASE = 'https://www.gstatic.com/firebasejs/' + FIREBASE_VERSION;

    const FIREBASE_CONFIG = {
        apiKey: "AIzaSyD9MJrON70mPqZxQqhndgQHNkTZUnnaQIs",
        authDomain: "altorra-cars.firebaseapp.com",
        projectId: "altorra-cars",
        storageBucket: "altorra-cars.firebasestorage.app",
        messagingSenderId: "235148219730",
        appId: "1:235148219730:web:ceabdbc52fdcbe8b85168b",
        measurementId: "G-ZGZ6CVTB73"
    };

    function loadScript(src) {
        return new Promise(function(resolve, reject) {
            var script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // Load firebase-app first, then Auth + Firestore in parallel (critical path),
    // then defer Analytics, Storage, Functions (non-critical for login)
    window.firebaseReady = loadScript(CDN_BASE + '/firebase-app-compat.js')
        .then(function() {
            // Critical: Auth + Firestore needed for login
            return Promise.all([
                loadScript(CDN_BASE + '/firebase-auth-compat.js'),
                loadScript(CDN_BASE + '/firebase-firestore-compat.js')
            ]);
        })
        .then(function() {
            var app = firebase.initializeApp(FIREBASE_CONFIG);
            var db = firebase.firestore();
            var auth = firebase.auth();

            window.firebaseApp = app;
            window.db = db;
            window.auth = auth;

            // Inicializar system/meta si no existe (necesario para el cache inteligente)
            db.doc('system/meta').get().then(function(snap) {
                if (!snap.exists) {
                    return db.doc('system/meta').set({
                        lastModified: Date.now(),
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        note: 'Auto-created by firebase-config.js — no borrar'
                    });
                }
            }).catch(function() {
                // Silencioso: si falla (sin permisos) no interrumpe nada
            });

            // Defer non-critical SDKs (load in background after login is ready)
            Promise.all([
                loadScript(CDN_BASE + '/firebase-storage-compat.js'),
                loadScript(CDN_BASE + '/firebase-functions-compat.js'),
                loadScript(CDN_BASE + '/firebase-analytics-compat.js')
            ]).then(function() {
                window.storage = firebase.storage();
                window.functions = firebase.functions();
                window.firebaseAnalytics = firebase.analytics();
                console.log('Firebase deferred SDKs loaded (Storage, Functions, Analytics)');
            }).catch(function(err) {
                console.warn('Deferred Firebase SDKs failed:', err);
            });

            console.log('Firebase core ready (Auth + Firestore)');
            return { app: app, db: db, auth: auth };
        })
        .catch(function(error) {
            console.warn('Firebase could not be loaded:', error);
        });
})();
