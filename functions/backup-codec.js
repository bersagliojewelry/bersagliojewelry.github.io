/**
 * Bersaglio — codec del backup de Firestore (lógica PURA, testeable sin emulador).
 *
 * Serializa los tipos especiales de Firestore (Timestamp, DocumentReference,
 * GeoPoint, Buffer) a JSON plano con marcadores `__t`, y los revive al restaurar.
 * Detección ESTRUCTURAL (sin importar el SDK) → unit-testeable con fakes
 * (doctrina L-17: dinero/datos como función pura + glue por integración).
 */
'use strict';

function isTimestampLike(v) {
    return v && typeof v === 'object'
        && typeof v.toDate === 'function'
        && typeof v.seconds === 'number'
        && typeof v.nanoseconds === 'number';
}
function isRefLike(v) {
    return v && typeof v === 'object'
        && typeof v.path === 'string'
        && v.firestore !== undefined;
}
function isGeoLike(v) {
    // constructor-name: un map plano {latitude, longitude} NO debe confundirse con GeoPoint
    return v && typeof v === 'object'
        && v.constructor && v.constructor.name === 'GeoPoint'
        && typeof v.latitude === 'number' && typeof v.longitude === 'number';
}

function serializeValue(v) {
    if (v === null || v === undefined) return null;
    if (Array.isArray(v)) return v.map(serializeValue);
    if (typeof Buffer !== 'undefined' && Buffer.isBuffer(v)) return { __t: 'b64', d: v.toString('base64') };
    if (v instanceof Date) return { __t: 'date', d: v.toISOString() };
    if (isTimestampLike(v)) return { __t: 'ts', s: v.seconds, n: v.nanoseconds };
    if (isRefLike(v)) return { __t: 'ref', p: v.path };
    if (isGeoLike(v)) return { __t: 'geo', la: v.latitude, lo: v.longitude };
    if (typeof v === 'object') {
        const out = {};
        for (const [k, val] of Object.entries(v)) out[k] = serializeValue(val);
        return out;
    }
    return v;
}

/**
 * Revive un valor serializado. `revivers` inyecta los constructores reales
 * (Timestamp/GeoPoint/ref/Buffer) — el codec no depende del SDK.
 * @param {*} v valor serializado
 * @param {{timestamp: Function, ref: Function, geo: Function, bytes: Function}} revivers
 */
function deserializeValue(v, revivers) {
    if (v === null || v === undefined) return null;
    if (Array.isArray(v)) return v.map((x) => deserializeValue(x, revivers));
    if (typeof v === 'object') {
        if (v.__t === 'ts')   return revivers.timestamp(v.s, v.n);
        if (v.__t === 'ref')  return revivers.ref(v.p);
        if (v.__t === 'geo')  return revivers.geo(v.la, v.lo);
        if (v.__t === 'b64')  return revivers.bytes(v.d);
        if (v.__t === 'date') return revivers.timestamp(Math.floor(Date.parse(v.d) / 1000), 0);
        const out = {};
        for (const [k, val] of Object.entries(v)) out[k] = deserializeValue(val, revivers);
        return out;
    }
    return v;
}

module.exports = { serializeValue, deserializeValue };
