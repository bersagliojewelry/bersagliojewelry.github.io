/**
 * Siembra los pendientes iniciales del CRM en la colección `pendientes`
 * (tablero visible para Kary en Configuración). Idempotente: si ya hay
 * pendientes, NO duplica. Corre contra emulador o producción.
 *
 *   Emulador: FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 node functions/seed-pendientes.mjs
 *   Prod:     (con credenciales) node functions/seed-pendientes.mjs
 */
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

initializeApp({ projectId: 'bersaglio-jewelry' });
const db = getFirestore();

const ITEMS = [
    // Para definir con Kary
    { categoria: 'definir-kary', titulo: 'Fecha de corte de migración', detalle: 'Día desde el cual el sistema toma el control; cada cliente entra con su saldo a esa fecha. La historia vieja queda archivada en el Excel.' },
    { categoria: 'definir-kary', titulo: 'Datos del negocio para facturas (NIT, dirección, teléfono)' },
    { categoria: 'definir-kary', titulo: 'Dar de alta a las 19 vendedoras como usuarias', detalle: 'Correo + clave para que cada una entre a su app desde el celular.' },
    { categoria: 'definir-kary', titulo: 'Definir qué es una "cuenta atrasada" (días de plazo)', detalle: 'Necesario para el reporte de cartera vencida.' },
    { categoria: 'definir-kary', titulo: 'Confirmar el modelo de saldo', detalle: 'Factura/apertura suman, abono resta; saldo positivo = el cliente debe, negativo = saldo a favor.' },
    // Datos por confirmar (migración)
    { categoria: 'datos', titulo: 'Confirmar los 15 saldos perdidos en el Excel (#REF!)', detalle: 'Clientes de vendedoras cuyo saldo se perdió por fórmulas rotas. El sistema NO los inventa.' },
    { categoria: 'datos', titulo: 'Confirmar las 19 filas de subtotal de vendedora (no son clientes)' },
    { categoria: 'datos', titulo: 'Revisar nombres de clientes limpiados del Excel', detalle: 'En el Excel el nombre viene mezclado con montos/notas; revisar una muestra antes de cargar.' },
    // Próximas fases
    { categoria: 'roadmap', titulo: 'Migrar la cartera real (Fase A: 345 clientes de Kary; Fase B: vendedoras)' },
    { categoria: 'roadmap', titulo: 'Reportes (Bloque 6): cartera por antigüedad, abonos del mes, exportar' },
    { categoria: 'roadmap', titulo: 'Facturación electrónica (DIAN) — fase posterior' },
    { categoria: 'roadmap', titulo: 'Inventario sobre el catálogo existente — fase posterior' },
];

const col = db.collection('pendientes');
const snap = await col.limit(1).get();
if (!snap.empty) {
    console.log('Ya existen pendientes; no se siembra (idempotente).');
    process.exit(0);
}
for (const it of ITEMS) {
    await col.add({ ...it, estado: 'pendiente', createdAt: FieldValue.serverTimestamp() });
}
console.log(`Sembrados ${ITEMS.length} pendientes.`);
process.exit(0);
