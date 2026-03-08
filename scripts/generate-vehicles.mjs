// ===========================================================
// Vehicle page generator — SEO & social sharing
// ===========================================================
// Reads vehicles from Firestore, generates individual HTML files
// in /vehiculos/{slug}.html with pre-baked meta tags, OG data,
// JSON-LD schema, and <noscript> content for crawlers.
// Also regenerates sitemap.xml with all current vehicles.
//
// This runs automatically via GitHub Actions on every push
// and on a daily schedule. Can also be run manually:
//   node scripts/generate-vehicles.mjs
// ===========================================================

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { readFileSync, writeFileSync, mkdirSync, readdirSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const FIREBASE_CONFIG = {
    apiKey: "AIzaSyD9MJrON70mPqZxQqhndgQHNkTZUnnaQIs",
    authDomain: "altorra-cars.firebaseapp.com",
    projectId: "altorra-cars",
    storageBucket: "altorra-cars.firebasestorage.app",
    messagingSenderId: "235148219730",
    appId: "1:235148219730:web:ceabdbc52fdcbe8b85168b",
    measurementId: "G-ZGZ6CVTB73"
};

const SITE_URL = 'https://altorracars.github.io';

// ===================== Helpers =====================

function slugify(v) {
    return [v.marca, v.modelo, v.year, v.id]
        .filter(Boolean)
        .join('-')
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatPrice(price) {
    if (!price) return '';
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price);
}

function formatKm(km) {
    if (!km || km === 0) return '0 km';
    return new Intl.NumberFormat('es-CO').format(km) + ' km';
}

function getFullImage(v) {
    const img = v.imagen || '';
    return img.startsWith('http') ? img : SITE_URL + '/' + img;
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function escapeAttr(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;');
}

function escapeXml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

// ===================== Page Generation =====================

function generatePage(template, v, slug) {
    const marca = capitalize(v.marca || '');
    const modelo = v.modelo || '';
    const year = v.year || '';
    const title = `${marca} ${modelo} ${year} | ALTORRA CARS`;
    const precio = v.precioOferta || v.precio;
    const precioText = precio ? formatPrice(precio) : '';
    const desc = `${marca} ${modelo} ${year} - ${precioText}. ${capitalize(v.tipo || '')}, ${capitalize(v.transmision || '')}, ${formatKm(v.kilometraje)}. Disponible en ALTORRA CARS, Cartagena.`;
    const fullImage = getFullImage(v);
    const canonicalUrl = `${SITE_URL}/vehiculos/${slug}.html`;

    let html = template;

    // 1. Ensure <base href="/"> exists so relative paths work from /vehiculos/ subdir
    //    (template already includes it, but keep this as a safety check)
    if (!html.includes('<base href="/">')) {
        html = html.replace(
            '<meta charset="UTF-8">',
            '<meta charset="UTF-8">\n    <base href="/">'
        );
    }

    // 2. Add canonical URL
    html = html.replace(
        '<meta name="robots" content="index, follow">',
        `<meta name="robots" content="index, follow">\n    <link rel="canonical" href="${canonicalUrl}">`
    );

    // 3. Replace <title>
    html = html.replace(
        '<title>Detalle de Vehículo | ALTORRA CARS</title>',
        `<title>${escapeHtml(title)}</title>`
    );

    // 4. Replace meta description
    html = html.replace(
        'content="Vehículo disponible en ALTORRA CARS - Cartagena, Colombia. Financiación disponible."',
        `content="${escapeAttr(desc)}"`
    );

    // 5. Replace Open Graph tags
    html = html.replace(
        'id="og-url" content="https://altorracars.github.io/detalle-vehiculo.html"',
        `id="og-url" content="${escapeAttr(canonicalUrl)}"`
    );
    html = html.replace(
        'id="og-title" content="Vehiculo Disponible | ALTORRA CARS - Cartagena"',
        `id="og-title" content="${escapeAttr(title)}"`
    );
    html = html.replace(
        'id="og-description" content="Encuentra los mejores vehiculos nuevos y usados en Cartagena. Financiacion disponible. Visitanos o agenda tu cita en linea."',
        `id="og-description" content="${escapeAttr(desc)}"`
    );
    html = html.replace(
        'id="og-image" content="https://altorracars.github.io/multimedia/hero-car.jpg"',
        `id="og-image" content="${escapeAttr(fullImage)}"`
    );

    // 6. Replace Twitter Card tags
    html = html.replace(
        'id="tw-title" content="Vehiculo Disponible | ALTORRA CARS - Cartagena"',
        `id="tw-title" content="${escapeAttr(title)}"`
    );
    html = html.replace(
        'id="tw-description" content="Encuentra los mejores vehiculos nuevos y usados en Cartagena. Financiacion disponible. Visitanos o agenda tu cita en linea."',
        `id="tw-description" content="${escapeAttr(desc)}"`
    );
    html = html.replace(
        'id="tw-image" content="https://altorracars.github.io/multimedia/hero-car.jpg"',
        `id="tw-image" content="${escapeAttr(fullImage)}"`
    );

    // 7. Inject JSON-LD schema before </head>
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Car',
        name: `${marca} ${modelo} ${year}`,
        brand: { '@type': 'Brand', name: marca },
        model: modelo,
        vehicleModelDate: String(year),
        image: fullImage,
        url: canonicalUrl,
        vehicleTransmission: capitalize(v.transmision || ''),
        fuelType: capitalize(v.combustible || ''),
        mileageFromOdometer: {
            '@type': 'QuantitativeValue',
            value: v.kilometraje || 0,
            unitCode: 'KMT'
        },
        color: v.color || '',
        numberOfDoors: v.puertas || 5,
        vehicleSeatingCapacity: v.pasajeros || 5,
        offers: {
            '@type': 'Offer',
            price: precio,
            priceCurrency: 'COP',
            availability: 'https://schema.org/InStock',
            seller: {
                '@type': 'AutoDealer',
                name: 'ALTORRA CARS',
                url: SITE_URL
            }
        }
    };

    html = html.replace(
        '</head>',
        `    <script type="application/ld+json">${JSON.stringify(schema)}</script>\n</head>`
    );

    // 8. Inject PRERENDERED_VEHICLE_ID before inline script
    html = html.replace(
        '    <script>\n        let currentVehicle = null;',
        `    <script>window.PRERENDERED_VEHICLE_ID = ${JSON.stringify(String(v.id))};</script>\n    <script>\n        let currentVehicle = null;`
    );

    // 9. Add <noscript> SEO content after header placeholder
    const noscriptContent = `
    <noscript>
        <div style="max-width:1200px;margin:100px auto;padding:24px;font-family:sans-serif">
            <h1>${escapeHtml(marca)} ${escapeHtml(modelo)} ${escapeHtml(String(year))}</h1>
            <img src="${escapeAttr(fullImage)}" alt="${escapeAttr(`${marca} ${modelo} ${year}`)}" style="max-width:100%;height:auto;border-radius:12px">
            <p style="font-size:24px;font-weight:700;color:#b89658;margin:16px 0">${escapeHtml(precioText)}</p>
            <ul style="list-style:none;padding:0;line-height:2">
                <li><strong>Tipo:</strong> ${escapeHtml(capitalize(v.tipo || ''))}</li>
                <li><strong>Transmision:</strong> ${escapeHtml(capitalize(v.transmision || ''))}</li>
                <li><strong>Combustible:</strong> ${escapeHtml(capitalize(v.combustible || ''))}</li>
                <li><strong>Kilometraje:</strong> ${escapeHtml(formatKm(v.kilometraje))}</li>
                <li><strong>Color:</strong> ${escapeHtml(v.color || 'N/A')}</li>
                <li><strong>Categoria:</strong> ${escapeHtml(capitalize(v.categoria || ''))}</li>
            </ul>
            ${v.descripcion ? `<p>${escapeHtml(v.descripcion)}</p>` : ''}
            <p><a href="${SITE_URL}">Volver a ALTORRA CARS</a></p>
        </div>
    </noscript>`;

    html = html.replace(
        '<div id="header-placeholder"></div>',
        `<div id="header-placeholder"></div>${noscriptContent}`
    );

    return html;
}

// ===================== Sitemap Generation =====================

function generateSitemap(vehicles, slugMap) {
    const today = new Date().toISOString().split('T')[0];

    const staticPages = [
        { loc: '/',                     freq: 'daily',   prio: '1.0' },
        { loc: '/busqueda.html',        freq: 'daily',   prio: '0.9' },
        { loc: '/vehiculos-usados.html', freq: 'daily',  prio: '0.9' },
        { loc: '/vehiculos-nuevos.html', freq: 'daily',  prio: '0.9' },
        { loc: '/vehiculos-suv.html',   freq: 'weekly',  prio: '0.8' },
        { loc: '/vehiculos-sedan.html', freq: 'weekly',  prio: '0.8' },
        { loc: '/vehiculos-pickup.html', freq: 'weekly', prio: '0.8' },
        { loc: '/vehiculos-hatchback.html', freq: 'weekly', prio: '0.8' },
        { loc: '/vehiculos-camionetas.html', freq: 'weekly', prio: '0.8' },
        { loc: '/marca.html',           freq: 'weekly',  prio: '0.7' },
        { loc: '/simulador-credito.html', freq: 'monthly', prio: '0.7' },
        { loc: '/comparar.html',        freq: 'monthly', prio: '0.6' },
        { loc: '/resenas.html',         freq: 'monthly', prio: '0.6' },
        { loc: '/nosotros.html',        freq: 'monthly', prio: '0.6' },
        { loc: '/contacto.html',        freq: 'monthly', prio: '0.6' },
        { loc: '/favoritos.html',       freq: 'monthly', prio: '0.5' },
        { loc: '/terminos.html',        freq: 'yearly',  prio: '0.3' },
        { loc: '/privacidad.html',      freq: 'yearly',  prio: '0.3' },
        { loc: '/cookies.html',         freq: 'yearly',  prio: '0.3' },
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`;

    // Static pages
    for (const p of staticPages) {
        xml += `
  <url>
    <loc>${SITE_URL}${p.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.freq}</changefreq>
    <priority>${p.prio}</priority>
  </url>
`;
    }

    // Vehicle detail pages (pre-rendered)
    xml += '\n  <!-- Vehicle detail pages (pre-rendered, SEO-friendly URLs) -->\n';

    for (const v of vehicles) {
        const slug = slugMap.get(String(v.id));
        if (!slug) continue;

        const marca = capitalize(v.marca || '');
        const modelo = v.modelo || '';
        const year = v.year || '';
        const fullImage = getFullImage(v);
        const imageTitle = `${marca} ${modelo} ${year}`.trim();

        xml += `  <url>
    <loc>${SITE_URL}/vehiculos/${slug}.html</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <image:image>
      <image:loc>${escapeXml(fullImage)}</image:loc>
      <image:title>${escapeXml(imageTitle)}</image:title>
    </image:image>
  </url>
`;
    }

    xml += '</urlset>\n';
    return xml;
}

// ===================== Main =====================

async function main() {
    console.log('[generate] Connecting to Firebase...');
    const app = initializeApp(FIREBASE_CONFIG);
    const db = getFirestore(app);

    console.log('[generate] Fetching vehicles from Firestore...');
    const snap = await getDocs(collection(db, 'vehiculos'));
    const allVehicles = snap.docs.map(d => d.data());

    // Filter: only "disponible" vehicles get pages
    const vehicles = allVehicles.filter(v => {
        const estado = v.estado || 'disponible';
        return estado === 'disponible';
    });

    console.log(`[generate] ${allVehicles.length} total, ${vehicles.length} disponibles.`);

    // Read template
    const template = readFileSync(join(ROOT, 'detalle-vehiculo.html'), 'utf-8');

    // Build slug map
    const slugMap = new Map();
    for (const v of vehicles) {
        slugMap.set(String(v.id), slugify(v));
    }

    // Create /vehiculos/ directory
    const outDir = join(ROOT, 'vehiculos');
    mkdirSync(outDir, { recursive: true });

    // Clean previous generated files
    try {
        for (const f of readdirSync(outDir).filter(f => f.endsWith('.html'))) {
            unlinkSync(join(outDir, f));
        }
    } catch (_) { /* first run */ }

    // Generate one HTML per vehicle
    console.log('[generate] Generating vehicle pages...');
    for (const v of vehicles) {
        const slug = slugMap.get(String(v.id));
        const html = generatePage(template, v, slug);
        writeFileSync(join(outDir, `${slug}.html`), html);
        console.log(`  + vehiculos/${slug}.html`);
    }
    console.log(`[generate] ${vehicles.length} pages created in /vehiculos/`);

    // Write slug map JSON (client-side reference)
    const dataDir = join(ROOT, 'data');
    mkdirSync(dataDir, { recursive: true });
    writeFileSync(
        join(dataDir, 'vehicle-slugs.json'),
        JSON.stringify(Object.fromEntries(slugMap), null, 2)
    );
    console.log('[generate] Slug map → data/vehicle-slugs.json');

    // Regenerate sitemap.xml
    console.log('[generate] Regenerating sitemap.xml...');
    const sitemap = generateSitemap(vehicles, slugMap);
    writeFileSync(join(ROOT, 'sitemap.xml'), sitemap);
    console.log('[generate] sitemap.xml updated.');

    console.log('[generate] Done!');
    process.exit(0);
}

main().catch(err => {
    console.error('[generate] Fatal error:', err);
    process.exit(1);
});
