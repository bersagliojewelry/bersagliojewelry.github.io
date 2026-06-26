/**
 * Siembra un CATÁLOGO DE PRUEBA en el emulador Firestore (NO toca producción).
 * Banco de pruebas determinista para validar UI pública (ficha/grilla/recos/WhatsApp)
 * y, de aquí en adelante, el flujo de comercio (B1: pedidos/stock/caja).
 *
 * 9 piezas DESTACADAS (featured) + 4 colecciones. Mezcla pensada para ejercitar TODO:
 *   - 5 CON precio (botón carrito + consultar) · 4 SIN precio "bajo consulta" (WhatsApp directo)
 *   - variantes por categoría (anillos×2, aretes×2, collares×3, pulseras×2) → recos "Más de X"
 *   - todas comparten gema esmeralda en varias → recos "También en Esmeralda"
 *   - anillos con tallas → prueba el selector de talla; algunas con 2 imágenes → thumbs
 *   - imágenes DISTINTAS (assets reales del repo, servidos por vite en dev: /img/*)
 *
 * Idempotente: usa doc id = slug → re-correr SOBREESCRIBE (no duplica).
 *
 * Uso (con el emulador Firestore arriba):
 *   FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 node functions/seed-piezas.mjs
 *
 * Limpiar: borra los docs `pieces`/`collections` del emulador (o reinicia el emulador
 * sin --import). NUNCA apunta a la nube (FIRESTORE_EMULATOR_HOST fuerza el destino).
 */
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

if (!process.env.FIRESTORE_EMULATOR_HOST) {
    console.error('✋ FIRESTORE_EMULATOR_HOST no está seteado → abortado para NO tocar producción.');
    console.error('   Corre el emulador y usa: FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 node functions/seed-piezas.mjs');
    process.exit(1);
}

initializeApp({ projectId: 'bersaglio-jewelry' });
const db = getFirestore();
const now = FieldValue.serverTimestamp();

const COLLECTIONS = [
    { slug: 'anillos',  name: 'Anillos',  order: 1 },
    { slug: 'aretes',   name: 'Aretes',   order: 2 },
    { slug: 'collares', name: 'Collares', order: 3 },
    { slug: 'pulseras', name: 'Pulseras', order: 4 },
];

const IMG = s => `/img/${s}`;

// price ausente (clave OMITIDA) = "bajo consulta" — las reglas rechazan price:null.
const PIECES = [
    {
        code: 'BJ-001', slug: 'anillo-zafiro-ceilan', name: 'Anillo Zafiro de Ceilán',
        collection: 'anillos', price: 12_900_000, badge: 'Exclusivo',
        sizes: ['6', '7', '8'], images: [IMG('ring-sapphire-800.webp')],
        description: 'Anillo en oro blanco de 18 quilates con zafiro azul talla oval, orlado de diamantes.',
        specs: { stone: 'Zafiro azul', carat: '2.1 ct', metal: 'Oro blanco 18k', cut: 'Talla oval',
                 color: 'Azul real', clarity: 'VS', accent: 'Diamantes 0.4 ct', certificate: 'Certificado GIA',
                 origin: 'Ceilán', delivery: 'Entrega en 15 días' },
    },
    {
        code: 'BJ-002', slug: 'aretes-esmeralda-muzo', name: 'Aretes Esmeralda Muzo',
        collection: 'aretes', price: 8_400_000, badge: 'Nuevo',
        sizes: [], images: [IMG('earrings-emerald-800.webp')],
        description: 'Aretes en oro amarillo de 18 quilates con esmeraldas de Muzo talla esmeralda y acentos de diamantes.',
        specs: { stone: 'Esmeralda', carat: '1.8 ct', metal: 'Oro amarillo 18k', cut: 'Talla esmeralda',
                 color: 'Verde Muzo', clarity: 'VVS', accent: 'Diamantes', certificate: 'Certificado CDTEC',
                 origin: 'Muzo, Boyacá' },
    },
    {
        code: 'BJ-003', slug: 'aretes-travertino', name: 'Aretes Travertino',
        collection: 'aretes', badge: null,           // SIN precio (bajo consulta)
        sizes: [], images: [IMG('earrings-travertino-800.webp')],
        description: 'Aretes en oro rosa de 18 quilates con cuarzo travertino en talla cabujón.',
        specs: { stone: 'Cuarzo travertino', metal: 'Oro rosa 18k', cut: 'Cabujón', delivery: 'Pieza a medida' },
    },
    {
        code: 'BJ-004', slug: 'collar-esmeralda-cascada', name: 'Collar Esmeralda Cascada',
        collection: 'collares', badge: 'Exclusivo',  // SIN precio (bajo consulta)
        sizes: [], images: [IMG('model-emerald-800.webp'), IMG('emerald-gem.webp')],
        description: 'Collar editorial en oro blanco de 18 quilates con esmeralda central y cascada de diamantes.',
        specs: { stone: 'Esmeralda', carat: '5.2 ct', metal: 'Oro blanco 18k', color: 'Verde intenso',
                 clarity: 'VS', accent: 'Diamantes 1.2 ct', certificate: 'Certificado Gübelin', origin: 'Chivor' },
    },
    {
        code: 'BJ-005', slug: 'anillo-solitario-esmeralda', name: 'Anillo Solitario Esmeralda',
        collection: 'anillos', price: 24_600_000, badge: null,
        sizes: ['5', '6', '7', '8', '9'], images: [IMG('emerald-gem.webp')],
        description: 'Solitario en oro amarillo de 18 quilates con esmeralda de Muzo talla esmeralda.',
        specs: { stone: 'Esmeralda', carat: '3.4 ct', metal: 'Oro amarillo 18k', cut: 'Talla esmeralda',
                 color: 'Verde Muzo', clarity: 'VS', certificate: 'Certificado CDTEC', origin: 'Muzo' },
    },
    {
        code: 'BJ-006', slug: 'dije-gema-esmeralda', name: 'Dije Gema Esmeralda',
        collection: 'collares', price: 6_200_000, badge: 'Nuevo',
        sizes: [], images: [IMG('gema.webp'), IMG('emerald-gem.webp')],
        description: 'Dije en oro amarillo de 18 quilates con esmeralda talla pera.',
        specs: { stone: 'Esmeralda', carat: '1.1 ct', metal: 'Oro amarillo 18k', cut: 'Talla pera', origin: 'Colombia' },
    },
    {
        code: 'BJ-007', slug: 'pulsera-tennis-diamantes', name: 'Pulsera Tennis de Diamantes',
        collection: 'pulseras', price: 32_000_000, badge: 'Exclusivo',
        sizes: [], images: [IMG('collage-800.webp')],
        description: 'Pulsera tennis en oro blanco de 18 quilates con línea continua de diamantes.',
        specs: { stone: 'Diamantes', carat: '5.0 ct total', metal: 'Oro blanco 18k', cut: 'Brillante',
                 color: 'F', clarity: 'VVS', certificate: 'Certificado GIA' },
    },
    {
        code: 'BJ-008', slug: 'pulsera-esmeraldas', name: 'Pulsera de Esmeraldas',
        collection: 'pulseras', badge: null,         // SIN precio (bajo consulta)
        sizes: [], images: [IMG('cart-gems.webp')],
        description: 'Pulsera en oro amarillo de 18 quilates con esmeraldas colombianas engastadas.',
        specs: { stone: 'Esmeraldas', metal: 'Oro amarillo 18k', certificate: 'Certificado CDTEC', origin: 'Colombia' },
    },
    {
        code: 'BJ-009', slug: 'gargantilla-atelier', name: 'Gargantilla Atelier',
        collection: 'collares', badge: 'Exclusivo',  // SIN precio (bajo consulta)
        sizes: [], images: [IMG('banner-hero-800.webp')],
        description: 'Gargantilla de alta joyería, pieza única a medida, en oro de 18 quilates con esmeraldas y diamantes.',
        specs: { stone: 'Esmeraldas y diamantes', metal: 'Oro 18k', delivery: 'Pieza única a medida' },
    },
];

async function seedCollections() {
    for (const c of COLLECTIONS) {
        await db.doc(`collections/${c.slug}`).set({
            slug: c.slug, name: c.name, order: c.order,
            featured: true, version: 1, createdAt: now, updatedAt: now,
        });
    }
    console.log(`✓ ${COLLECTIONS.length} colecciones`);
}

async function seedPieces() {
    for (const p of PIECES) {
        const doc = {
            code: p.code, name: p.name, slug: p.slug, collection: p.collection,
            description: p.description, badge: p.badge ?? null,
            featured: true, priceLabel: 'Consultar precio',
            specs: p.specs, sizes: p.sizes,
            images: p.images, image: p.images[0] || null,
            version: 1, createdAt: now, updatedAt: now,
        };
        // price OPCIONAL: solo se incluye si es número (regla "ausente o número").
        if (Number.isFinite(p.price)) doc.price = p.price;
        await db.doc(`pieces/${p.slug}`).set(doc);
        console.log(`  · ${p.code} ${p.name}${doc.price ? ` — $${doc.price.toLocaleString('es-CO')}` : ' — Bajo consulta'}`);
    }
    console.log(`✓ ${PIECES.length} piezas destacadas`);
}

await seedCollections();
await seedPieces();
console.log('\n🌱 Catálogo de prueba sembrado en el emulador.');
process.exit(0);
