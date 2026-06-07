import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  leadStatus, esPendiente, esCerrado, origenLabel, diasDesde, estaDemorado, LEAD_LABEL,
} from '../js/admin/lead-format.js';

test('leadStatus: usa status explícito si es válido', () => {
  assert.equal(leadStatus({ status: 'calificado' }), 'calificado');
  assert.equal(leadStatus({ status: 'convertido' }), 'convertido');
});

test('leadStatus: legacy sin status deriva de read', () => {
  assert.equal(leadStatus({ read: false }), 'nuevo');      // no visto → nuevo
  assert.equal(leadStatus({ read: true }), 'trabajando');  // visto → no infla la bandeja
  assert.equal(leadStatus({ status: 'basura', read: true }), 'trabajando'); // inválido → legacy
  assert.equal(leadStatus({ status: 'new' }), 'nuevo');    // alias legacy del formulario web
});

test('esPendiente: solo "nuevo" pide atención', () => {
  assert.equal(esPendiente({ status: 'nuevo' }), true);
  assert.equal(esPendiente({ read: false }), true);
  assert.equal(esPendiente({ status: 'trabajando' }), false);
  assert.equal(esPendiente({ status: 'convertido' }), false);
});

test('esCerrado: convertido o perdido', () => {
  assert.equal(esCerrado({ status: 'convertido' }), true);
  assert.equal(esCerrado({ status: 'perdido' }), true);
  assert.equal(esCerrado({ status: 'nuevo' }), false);
});

test('origenLabel: normaliza canales y default Web', () => {
  assert.equal(origenLabel('web_form'), 'Web');
  assert.equal(origenLabel('whatsapp'), 'WhatsApp');
  assert.equal(origenLabel('mostrador'), 'Mostrador');
  assert.equal(origenLabel(undefined), 'Web');
  assert.equal(origenLabel('TikTok'), 'TikTok');   // desconocido → tal cual
});

test('diasDesde: timestamp y casos vacíos', () => {
  const hoy = new Date(Date.UTC(2026, 5, 7));
  assert.equal(diasDesde(Date.UTC(2026, 5, 2), hoy), 5);
  assert.equal(diasDesde(null, hoy), null);
  assert.equal(diasDesde('no-fecha', hoy), null);
  // Firestore Timestamp serializado en caché ({seconds}) + vivo ({toMillis})
  assert.equal(diasDesde({ seconds: Math.floor(Date.UTC(2026, 5, 2) / 1000) }, hoy), 5);
  assert.equal(diasDesde({ toMillis: () => Date.UTC(2026, 5, 4) }, hoy), 3);
});

test('estaDemorado: lead nuevo viejo se marca; otros no', () => {
  const hoy = new Date(Date.UTC(2026, 5, 7));
  assert.equal(estaDemorado({ status: 'nuevo', createdAt: Date.UTC(2026, 5, 1) }, 2, hoy), true);  // 6 días
  assert.equal(estaDemorado({ status: 'nuevo', createdAt: Date.UTC(2026, 5, 7) }, 2, hoy), false); // hoy
  assert.equal(estaDemorado({ status: 'trabajando', createdAt: Date.UTC(2026, 4, 1) }, 2, hoy), false);
});

test('LEAD_LABEL: convertido se muestra como "Cliente"', () => {
  assert.equal(LEAD_LABEL.convertido, 'Cliente');
});
