/**
 * Bersaglio — live-query: suscripción `onSnapshot` ROBUSTA con re-suscripción automática.
 *
 * Infraestructura de red COMPARTIDA (plomería neutral, NO lógica de dominio): la consumen
 * tanto el servicio público (`firestore-service.js`) como el CRM (`crm-service.js`) SIN
 * acoplarse entre sí — el CRM es un módulo desacoplado del catálogo (charter
 * `docs/50-ARQUITECTURA.md §3`), así que el helper compartido vive aquí en `core/`,
 * no dentro de uno de los dos servicios.
 */

import { onSnapshot } from 'firebase/firestore';

/**
 * Suscripción `onSnapshot` ROBUSTA con re-suscripción automática (recon 2026-06-21 + review
 * adversarial; ADR §93). Firestore TERMINA el stream ante un error transitorio (bajón de red,
 * deadline, refresh de token) y NO reintenta solo: el patrón viejo (callback de error que solo
 * hacía `console.warn`) dejaba el set CONGELADO → un borrado/alta posterior no propagaba hasta
 * recargar ("a veces no se elimina/aparece"). Aquí re-armamos con backoff exponencial (espejo
 * de `withRetry`) + retry inmediato al recuperar la red (`online`). Lo usan TODOS los listeners
 * live (catálogo público + reviews/inquiries del panel + TODO el CRM de dinero, §97/F2).
 * @param {Function} makeRef  `() => Query|CollectionReference|DocumentReference` (re-evaluado en cada intento)
 * @param {Function} onSnap   `(snapshot) => void` (procesa el snapshot crudo)
 * @param {string}   label    para los logs
 * @param {Function} [onUiError] `(err) => void` OPCIONAL — se invoca en CADA fallo de listen
 *        (la UI puede pintar un banner "esto está roto") MIENTRAS el helper re-suscribe solo.
 *        Aditivo: los call-sites que no lo pasan no cambian. Va en try/catch: si la UI lanza,
 *        el retry NO se rompe. Útil para superficies de control (CRM: cola de aprobación, etc.).
 * @returns {Function} cleanup (desuscribe + remueve el listener `online`)
 */
export function subscribeWithRetry(makeRef, onSnap, label, onUiError) {
    let unsub = null;
    let cancelled = false;
    let attempt = 0;
    let retryTimer = null;

    const handleErr = (err) => {
        console.warn(`[Firestore] ${label} listener error → re-suscribiendo:`, err?.code || err?.message || err);
        try { onUiError?.(err); } catch { /* la UI no debe romper el re-suscribe */ }
        if (unsub) { try { unsub(); } catch { /* noop */ } unsub = null; }
        if (cancelled) return;
        const wait = Math.min(30000, 1000 * Math.pow(2, attempt)) + Math.floor(Math.random() * 250);
        attempt++;
        retryTimer = setTimeout(subscribe, wait);
    };

    function subscribe() {
        retryTimer = null;
        if (cancelled) return;
        if (unsub) { try { unsub(); } catch { /* noop */ } unsub = null; }   // idempotente: jamás 2 onSnapshot vivos
        unsub = onSnapshot(makeRef(), (snap) => { attempt = 0; onSnap(snap); }, handleErr);
    }

    // Retry INMEDIATO al recuperar la red — SOLO si estamos caídos (con retry en cola). NO
    // resetea `attempt`: si vuelve a fallar, el backoff sigue creciendo (no martillea). El
    // evento `online` dispara una sola vez por reconexión (a diferencia de visibilitychange).
    const onOnline = () => {
        if (cancelled || !retryTimer) return;
        clearTimeout(retryTimer); retryTimer = null;
        subscribe();
    };
    try { window.addEventListener('online', onOnline); } catch { /* sin DOM */ }

    subscribe();

    return () => {
        cancelled = true;
        if (retryTimer) { clearTimeout(retryTimer); retryTimer = null; }
        if (unsub) { try { unsub(); } catch { /* noop */ } unsub = null; }
        try { window.removeEventListener('online', onOnline); } catch { /* sin DOM */ }
    };
}
