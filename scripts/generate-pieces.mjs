// ===========================================================
// Generador de páginas de PIEZA — SEO · AEO · social ⟦OPUS-4.8⟧
// ===========================================================
// Lee las piezas de Firestore en el BUILD y hornea un HTML real por
// pieza en /pieza/{slug}.html con meta/OG/Twitter pre-horneados,
// JSON-LD (Product + BreadcrumbList) y <noscript> para crawlers que
// NO ejecutan JS (bots sociales + LLMs: GPTBot/PerplexityBot/...).
// También regenera sitemap.xml con todas las piezas + estáticas.
//
// REGLA DURA (paquete de visibilidad, HUB Altorra): el schema/meta SIEMPRE
// en el HTML del build (verificable por `curl -s URL | grep`), NUNCA solo
// por JS runtime. Esta es la base de TODA la visibilidad.
//
// Patrón portado de la fábrica SSG probada de Altorra Cars
// (scripts/generate-vehicles.mjs) — guards anti-fail-silent incluidos.
//
// Opera sobre el BUILD (dist/) — corre DESPUÉS de `vite build` para que
// las páginas horneadas referencien los assets hasheados correctos.
//
// Uso:  node scripts/generate-pieces.mjs           (tras vite build)
//       SSG_SELFTEST=1 node scripts/generate-pieces.mjs   (gate anti-XSS, sin red)
// ===========================================================

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import { derivarEstado, esDisponible, STOCK_TYPES } from '../js/admin/inventario-model.js';   // SSoT modelo v3
import { gemDisplayName } from '../js/core/gem-badge.js';   // §151: gema canónica (badgeGem) para JSON-LD/AEO
import { metalConColor } from '../js/core/metal.js';        // TODO-59: color del oro (metalColor) en el metal mostrado
import { readFileSync, writeFileSync, mkdirSync, readdirSync, unlinkSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');
// El template y la salida viven en dist/ (build de Vite con assets hasheados).
const DIST = join(REPO_ROOT, 'dist');

// Config WEB de Firebase: PÚBLICA por diseño (viaja en el bundle cliente igual).
// process.env.VITE_* lo provee el step de CI; el fallback (= js/firebase-config.js,
// L-14) es la red de seguridad para correr local sin .env. La seguridad real son
// las reglas Firestore + App Check, NO esconder la key.
const FIREBASE_CONFIG = {
    apiKey:            process.env.VITE_FIREBASE_API_KEY            || 'AIzaSyDcAvuRKN8_h_uSXzXkCzC0foLxTOkd5WM',
    authDomain:        process.env.VITE_FIREBASE_AUTH_DOMAIN        || 'bersaglio-jewelry.firebaseapp.com',
    projectId:         process.env.VITE_FIREBASE_PROJECT_ID         || 'bersaglio-jewelry',
    storageBucket:     process.env.VITE_FIREBASE_STORAGE_BUCKET     || 'bersaglio-jewelry.firebasestorage.app',
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '111509809378',
    appId:             process.env.VITE_FIREBASE_APP_ID             || '1:111509809378:web:8df8ee7df50afe6f1896bb',
};

const SITE_URL = 'https://bersagliojewelry.co';
const BRAND = 'Bersaglio Jewelry';
const DEFAULT_OG = `${SITE_URL}/img/og-image.jpg`;
const MIN_BAKE_BYTES = 5000;

// ===================== Helpers puros (candidatos a visibility-core) =====================

// Slug de la pieza: contrato ÚNICO compartido con js/core/urls.js (cliente).
// Debe coincidir EXACTO o el link del cliente apuntaría a un archivo inexistente.
function pieceSlug(p) {
    const s = (p.slug || '').trim();
    return s || String(p.id);
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// escapeAttr: añade `<` `>` `'` sobre escapeHtml — un valor editable (CMS) con `<`/`>`
// en un meta-tag (og:*/twitter:*) filtraría HTML crudo. `&` va primero.
function escapeAttr(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function escapeXml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

// safeJsonLd: JSON embebido inline (<script type="application/ld+json"> y
// <script>window.X=…</script>) DEBE neutralizar el breakout </script> y los
// separadores de línea JS (U+2028/U+2029). JSON.stringify crudo NO escapa
// `< > &` → un campo editable que fluya a estos sinks sería stored-XSS horneado.
// Las \uXXXX son válidas dentro del string JSON → el parser las decodifica al
// MISMO valor: semántica idéntica, bytes seguros.
function safeJsonLd(obj) {
    // Sin caracteres literales peligrosos en el fuente: se referencian por code point
    // (0x3c=< 0x3e=> 0x26=& 0x2028/0x2029=separadores de linea JS) y se reemplazan por
    // su escape JSON \uXXXX -> semantica identica, bytes seguros (anti breakout </script>).
    const danger = [0x3c, 0x3e, 0x26, 0x2028, 0x2029];
    let s = JSON.stringify(obj);
    for (const code of danger) {
        s = s.split(String.fromCharCode(code)).join('\\u' + code.toString(16).padStart(4, '0'));
    }
    return s;
}

function formatPriceCOP(price) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency', currency: 'COP',
        minimumFractionDigits: 0, maximumFractionDigits: 0,
    }).format(Number(price));
}

// Imagen principal absoluta (Storage ya viene con https://; si fuera relativa, prefija).
function getFullImage(p) {
    const img = (p.images && p.images[0]) || p.image || '';
    if (!img) return DEFAULT_OG;
    return /^https?:\/\//.test(img) ? img : `${SITE_URL}/${String(img).replace(/^\//, '')}`;
}

// Cero-demo (feedback_no_demo_en_index): NUNCA inventar copy. "PRUEBA n" → sin descripción.
function descriptionFor(p) {
    const d = (p.description || '').trim();
    if (!d || /^prueba\b/i.test(d)) return '';
    return d;
}

function categoryLabel(p, collectionsById) {
    const col = collectionsById.get(p.collection);
    return (col && col.name) || p.collection || 'Pieza';
}

// additionalProperty (AEO): deja a Google/Perplexity/ChatGPT CITAR quilataje,
// claridad, material, certificación. SOLO campos con valor real (cero-demo).
// Misma fuente que js/core/schema.js y la ficha de pieza.js.
function buildAdditionalProperty(specs) {
    const s = specs || {};
    const metal = metalConColor(s);
    // §151 (consejo externo): la GEMA es el DATO canónico (badgeGem→label "Esmeralda"), NO el texto
    // libre truncado por `split('·')`. gemDisplayName cae a la prosa si la pieza aún no tiene badgeGem.
    const primaryStone = gemDisplayName(s);
    return [
        ['Gema', primaryStone], ['Quilates', s.carat], ['Color', s.color],
        ['Claridad', s.clarity], ['Corte', s.cut], ['Acentos', s.accent],
        ['Metal', metal], ['Peso', s.weight], ['Certificación', s.certificate],
        ['Origen', s.origin],
    ].filter(([, v]) => v != null && String(v).trim() !== '')
     .map(([name, value]) => ({ '@type': 'PropertyValue', name, value: String(value) }));
}

// ===================== Schema (Product + Breadcrumb) =====================

function buildProductSchema(p, category, desc, canonicalUrl, image) {
    const s = p.specs || {};
    const metal = metalConColor(s);
    const additionalProperty = buildAdditionalProperty(s);

    // STOCK-AWARE v3 (TODO-40): availability + precio se derivan de stockType+cantidad (stockInfo, SSoT).
    // agotada → OutOfStock sin precio (Google no la indexa como activa); encargo/bajo_pedido (refabricable
    // en 0) → PreOrder; disponible → InStock (con precio) / PreOrder ("bajo consulta"). NUNCA price:0.
    const { availability, showPrice } = stockInfo(p);

    const schema = {
        '@context': 'https://schema.org/',
        '@type': 'Product',
        name: p.name || 'Pieza',
        image: image ? [image] : [],
        description: desc || `${p.name || 'Pieza'} — alta joyería ${BRAND}.`,
        // SKU/MPN = código real de la pieza (de9dbef: antes `ref` inexistente caía al id).
        sku: p.code || p.id,
        ...(p.code ? { mpn: p.code } : {}),
        category,
        brand: { '@type': 'Brand', name: BRAND },
        ...(metal ? { material: metal } : {}),
        ...(additionalProperty.length ? { additionalProperty } : {}),
        offers: {
            '@type': 'Offer', url: canonicalUrl, priceCurrency: 'COP',
            ...(showPrice ? { price: Number(p.price), priceValidUntil: '2027-12-31', valueAddedTaxIncluded: true } : {}),
            itemCondition: 'https://schema.org/NewCondition',
            availability,
            seller: { '@type': 'JewelryStore', '@id': `${SITE_URL}/#business`, name: BRAND },
        },
    };
    return schema;
}

function buildBreadcrumbSchema(p, category, canonicalUrl) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${SITE_URL}/` },
            { '@type': 'ListItem', position: 2, name: category,
              item: `${SITE_URL}/colecciones.html?col=${encodeURIComponent(p.collection || '')}` },
            { '@type': 'ListItem', position: 3, name: p.name || 'Pieza', item: canonicalUrl },
        ],
    };
}

// ===================== Schema de marca / negocio (Organization + Local) =====================

const BUSINESS_ID = `${SITE_URL}/#business`;
const WEBSITE_ID = `${SITE_URL}/#website`;

// validateTenant (anti-contaminación por vertical, fail-fast — clave del HUB multi-proyecto).
function readTenantConfig() {
    const p = join(REPO_ROOT, 'tenant_config.json');
    if (!existsSync(p)) throw new Error('[generate] Falta tenant_config.json en la raíz.');
    let cfg;
    try { cfg = JSON.parse(readFileSync(p, 'utf-8')); }
    catch (e) { throw new Error('[generate] tenant_config.json no es JSON válido: ' + e.message); }
    if (cfg.vertical !== 'JewelryStore') {
        throw new Error(`[generate] tenant_config.vertical="${cfg.vertical}" != "JewelryStore" — vertical equivocado (anti-contaminación).`);
    }
    return cfg;
}

// @graph con la entidad de negocio (JewelryStore = LocalBusiness = Organization) + WebSite.
// Schema CONDICIONAL: solo campos con dato real (cero-demo). geo/openingHours/aggregateRating
// se OMITEN si no hay dato (no se inventan).
function buildBusinessGraph(cfg) {
    const nap = cfg.nap || {};
    const business = {
        '@type': cfg.vertical || 'JewelryStore',
        '@id': BUSINESS_ID,
        name: cfg.brand,
        ...(cfg.legalName ? { legalName: cfg.legalName } : {}),
        url: cfg.baseUrl,
        ...(cfg.logo ? { logo: cfg.logo } : {}),
        ...(cfg.image ? { image: cfg.image } : {}),
        ...(cfg.description ? { description: cfg.description } : {}),
        ...(nap.telephone ? { telephone: nap.telephone } : {}),
        address: {
            '@type': 'PostalAddress',
            ...(nap.streetAddress ? { streetAddress: nap.streetAddress } : {}),
            ...(nap.addressLocality ? { addressLocality: nap.addressLocality } : {}),
            ...(nap.addressRegion ? { addressRegion: nap.addressRegion } : {}),
            ...(nap.addressCountry ? { addressCountry: nap.addressCountry } : {}),
        },
        ...(cfg.areaServed ? { areaServed: { '@type': 'City', name: cfg.areaServed } } : {}),
        ...(cfg.hasMap ? { hasMap: cfg.hasMap } : {}),
        ...(cfg.geo && cfg.geo.latitude ? { geo: { '@type': 'GeoCoordinates', latitude: cfg.geo.latitude, longitude: cfg.geo.longitude } } : {}),
        ...(Array.isArray(cfg.openingHours) && cfg.openingHours.length ? { openingHoursSpecification: cfg.openingHours } : {}),
        ...(Array.isArray(cfg.sameAs) && cfg.sameAs.length ? { sameAs: cfg.sameAs } : {}),
    };
    const website = {
        '@type': 'WebSite', '@id': WEBSITE_ID,
        url: cfg.baseUrl, name: cfg.brand, inLanguage: 'es-CO',
        publisher: { '@id': BUSINESS_ID },
    };
    return { '@context': 'https://schema.org', '@graph': [business, website] };
}

// Hornea el @graph de marca en dist/index.html (REGLA DURA: schema en el HTML del build).
function injectBusinessIntoIndex(cfg) {
    const indexPath = join(DIST, 'index.html');
    if (!existsSync(indexPath)) throw new Error('[generate] No existe dist/index.html.');
    let html = readFileSync(indexPath, 'utf-8');
    if (!html.includes('</head>')) throw new Error('[generate] dist/index.html sin </head> (ancla de inyección).');
    if (html.includes('id="business-jsonld"')) return; // idempotente
    const graph = buildBusinessGraph(cfg);
    html = html.replace('</head>',
        `    <script type="application/ld+json" id="business-jsonld">${safeJsonLd(graph)}</script>\n</head>`);
    if (html.length < MIN_BAKE_BYTES || !html.includes('</html>')) {
        throw new Error('[generate] dist/index.html quedó inválido tras inyectar el schema de marca.');
    }
    writeFileSync(indexPath, html);
    console.log('[generate] JSON-LD de marca (JewelryStore + WebSite) horneado en dist/index.html.');
}

// Hornea una PÁGINA DE LISTADO (catálogo o journal): flip noindex→index + canonical +
// og:url + JSON-LD (CollectionPage/Blog con ItemList) + <noscript> con los enlaces, en
// el dist/<filename>. items = [{name,url}]. (TODO-35 Fase A2.) Las páginas POR-ítem
// (/coleccion/<slug>, /entrada baked) son A2b — cuando haya contenido.
function injectListingPage(filename, mainAnchor, opts) {
    const p = join(DIST, filename);
    if (!existsSync(p)) { console.warn(`[generate] dist/${filename} no existe — salto listado.`); return; }
    let html = readFileSync(p, 'utf-8');
    if (html.includes('id="listing-jsonld"')) return; // idempotente
    if (!html.includes('</head>') || !html.includes(mainAnchor)) {
        throw new Error(`[generate] dist/${filename}: falta </head> o el ancla del <main> (${mainAnchor}).`);
    }
    const canonical = `${SITE_URL}/${filename}`;
    // robots: noindex → index (página de listado real e indexable).
    html = html.replace('<meta name="robots" content="noindex, nofollow">', '<meta name="robots" content="index, follow">');
    // og:url del template apunta a "/" (home) — corregir a la página.
    html = html.replace(`<meta property="og:url" content="${SITE_URL}/">`, `<meta property="og:url" content="${escapeAttr(canonical)}">`);

    const schema = {
        '@context': 'https://schema.org',
        '@type': opts.schemaType,
        name: opts.name,
        description: opts.description,
        url: canonical,
        isPartOf: { '@id': WEBSITE_ID },
        mainEntity: {
            '@type': 'ItemList',
            numberOfItems: opts.items.length,
            itemListElement: opts.items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, url: it.url, name: it.name })),
        },
    };
    html = html.replace('</head>',
        `    <script type="application/ld+json" id="listing-jsonld">${safeJsonLd(schema)}</script>\n</head>`);

    const items = opts.items.map(it =>
        `                <li><a href="${escapeAttr(it.url)}">${escapeHtml(it.name)}</a></li>`).join('\n');
    const noscript = `
    <noscript>
        <div style="max-width:1100px;margin:96px auto;padding:24px;font-family:Manrope,system-ui,sans-serif">
            <h1>${escapeHtml(opts.name)}</h1>
            <p>${escapeHtml(opts.description)}</p>
            ${items ? `<ul style="list-style:none;padding:0;line-height:2">\n${items}\n            </ul>` : ''}
            <p><a href="${SITE_URL}/contacto.html">Hablar con un asesor</a></p>
        </div>
    </noscript>`;
    html = html.replace(mainAnchor, mainAnchor + noscript);

    if (html.length < MIN_BAKE_BYTES || !html.includes('</html>')) {
        throw new Error(`[generate] dist/${filename} quedó inválido tras inyectar el listado.`);
    }
    writeFileSync(p, html);
    console.log(`[generate] Listado horneado en dist/${filename} (${opts.items.length} ítems, index,follow).`);
}

// ===================== Generación de página =====================

// Guard anti-regresión: el generador hace .replace() por string literal y FALLA EN
// SILENCIO si un anclaje no existe. Si un rediseño del template borra un anclaje,
// queremos un error RUIDOSO, no N páginas con SEO roto. (Patrón SP-5.3 de Altorra.)
const REQUIRED_ANCHORS = [
    '<meta charset="UTF-8">',
    '<meta name="robots" content="noindex, nofollow">',
    '<title>Pieza · Bersaglio Jewelry</title>',
    '<link rel="canonical" href="https://bersagliojewelry.co/pieza.html">',
    '<meta property="og:url" content="https://bersagliojewelry.co/pieza.html">',
    '<meta property="og:title" content="Pieza · Bersaglio Jewelry">',
    '<meta property="og:image" content="https://bersagliojewelry.co/img/og-image.jpg">',
    '<meta name="twitter:card" content="summary_large_image">',
    '</head>',
    '<main id="main-content" data-screen-label="pieza">',
];

function generatePage(template, p, slug, collectionsById) {
    const category = categoryLabel(p, collectionsById);
    const name = p.name || 'Pieza';
    const title = `${name} · ${BRAND}`;
    const canonicalUrl = `${SITE_URL}/pieza/${slug}.html`;
    const image = getFullImage(p);
    const realDesc = descriptionFor(p);
    const specsLine = buildAdditionalProperty(p.specs)
        .slice(0, 4).map(x => x.value).join(', ');
    const metaDesc = realDesc
        || `${name} — ${category} en alta joyería ${BRAND}.${specsLine ? ' ' + specsLine + '.' : ''}`;

    let html = template;

    for (const anchor of REQUIRED_ANCHORS) {
        if (!template.includes(anchor)) {
            throw new Error(`[generate] ANCLAJE FALTANTE en dist/pieza.html: ${anchor}\n  → El rediseño rompió un punto de inyección. Revisa el template antes de generar.`);
        }
    }

    // 1. <base href="/"> para que las rutas relativas (css/, manifest.json) resuelvan
    //    desde el subdir /pieza/. Vite emite assets absolutos, pero el base cubre el resto.
    if (!html.includes('<base href="/">')) {
        html = html.replace('<meta charset="UTF-8">', '<meta charset="UTF-8">\n    <base href="/">');
    }

    // 2. robots: noindex → index (esta SÍ se indexa; el shell pieza.html queda noindex).
    html = html.replace(
        '<meta name="robots" content="noindex, nofollow">',
        '<meta name="robots" content="index, follow">'
    );

    // 3. canonical autorreferencial a la URL limpia.
    html = html.replace(
        '<link rel="canonical" href="https://bersagliojewelry.co/pieza.html">',
        `<link rel="canonical" href="${escapeAttr(canonicalUrl)}">`
    );

    // 4. <title> + meta description.
    html = html.replace('<title>Pieza · Bersaglio Jewelry</title>', `<title>${escapeHtml(title)}</title>`);
    html = html.replace(
        '<meta name="description" content="Detalle de pieza Bersaglio Jewelry — esmeralda colombiana, oro 18K certificado.">',
        `<meta name="description" content="${escapeAttr(metaDesc)}">`
    );

    // 5. Open Graph.
    html = html.replace(
        '<meta property="og:url" content="https://bersagliojewelry.co/pieza.html">',
        `<meta property="og:url" content="${escapeAttr(canonicalUrl)}">`
    );
    html = html.replace(
        '<meta property="og:title" content="Pieza · Bersaglio Jewelry">',
        `<meta property="og:title" content="${escapeAttr(title)}">`
    );
    html = html.replace(
        '<meta property="og:description" content="Atelier en Cartagena de Indias. Esmeraldas Muzo, diamantes GIA, oro 18K.">',
        `<meta property="og:description" content="${escapeAttr(metaDesc)}">`
    );
    html = html.replace(
        '<meta property="og:image" content="https://bersagliojewelry.co/img/og-image.jpg">',
        `<meta property="og:image" content="${escapeAttr(image)}">`
    );

    // 6. Twitter Card: el template solo trae twitter:card → añadimos title/desc/image.
    html = html.replace(
        '<meta name="twitter:card" content="summary_large_image">',
        '<meta name="twitter:card" content="summary_large_image">\n' +
        `    <meta name="twitter:title" content="${escapeAttr(title)}">\n` +
        `    <meta name="twitter:description" content="${escapeAttr(metaDesc)}">\n` +
        `    <meta name="twitter:image" content="${escapeAttr(image)}">`
    );

    // 7. JSON-LD (Product + Breadcrumb) + PRERENDERED antes de </head>.
    const productSchema = buildProductSchema(p, category, realDesc, canonicalUrl, image);
    const breadcrumbSchema = buildBreadcrumbSchema(p, category, canonicalUrl);
    const prerenderedTag = `<script>window.PRERENDERED_PIECE_SLUG = ${safeJsonLd(slug)};</script>`;
    html = html.replace(
        '</head>',
        `    <script type="application/ld+json">${safeJsonLd(productSchema)}</script>\n` +
        `    <script type="application/ld+json">${safeJsonLd(breadcrumbSchema)}</script>\n` +
        `    ${prerenderedTag}\n</head>`
    );

    // 8. <noscript> SEO: contenido clave para crawlers sin JS.
    // STOCK-AWARE v3 (§10.1): agotada → "Vendida" sin precio + CTA "ver similares" (la página vive para
    // SEO/links, pero no se ofrece). encargo / bajo_pedido (refabricable en 0) → "Por encargo".
    // disponible → precio real o "Bajo consulta". NUNCA mostrar precio de una pieza agotada.
    const si = stockInfo(p);
    const agotada = si.estado === 'agotada';
    const priceText = agotada ? 'Vendida'
                    : si.showPrice ? formatPriceCOP(p.price)
                    : (si.stockType === 'encargo' || si.estado === 'bajo_pedido') ? 'Por encargo'
                    : 'Bajo consulta';
    const specRows = buildAdditionalProperty(p.specs).map(x =>
        `                <li><strong>${escapeHtml(x.name)}:</strong> ${escapeHtml(x.value)}</li>`
    ).join('\n');
    const ctaNoscript = agotada
        ? `<p>Esta pieza fue <strong>vendida</strong>. <a href="${SITE_URL}/colecciones.html">Ver piezas similares</a> · <a href="${SITE_URL}/contacto.html">Hablar con un asesor</a></p>`
        : `<p><a href="${SITE_URL}/contacto.html">Consultar esta pieza con un asesor</a> · <a href="${SITE_URL}/colecciones.html">Ver el catálogo</a></p>`;
    const noscript = `
    <noscript>
        <div style="max-width:1100px;margin:96px auto;padding:24px;font-family:Manrope,system-ui,sans-serif">
            <nav style="font-size:14px;opacity:.7;margin-bottom:16px"><a href="${SITE_URL}/">Inicio</a> › <a href="${SITE_URL}/colecciones.html">${escapeHtml(category)}</a> › ${escapeHtml(name)}</nav>
            <h1>${escapeHtml(name)}</h1>
            <img src="${escapeAttr(image)}" alt="${escapeAttr(name + ' — ' + BRAND)}" style="max-width:100%;height:auto;border-radius:14px">
            <p style="font-size:22px;font-weight:700;margin:16px 0">${escapeHtml(priceText)}</p>
            ${realDesc ? `<p>${escapeHtml(realDesc)}</p>` : ''}
            ${specRows ? `<ul style="list-style:none;padding:0;line-height:2">\n${specRows}\n            </ul>` : ''}
            ${ctaNoscript}
        </div>
    </noscript>`;
    html = html.replace(
        '<main id="main-content" data-screen-label="pieza">',
        `<main id="main-content" data-screen-label="pieza">${noscript}`
    );

    return html;
}

// ===================== /p/<code> — link compartible (TODO-58 slice 2) =====================
// Kary le da a un cliente el código (ej. "0953") y comparte bersagliojewelry.co/p/0953. El SSG
// hornea dist/p/<code>.html: un STUB con OG/title/imagen REALES de la pieza (preview lindo en
// WhatsApp/redes) + canonical al horneado + robots noindex,follow (la pieza canónica es la
// indexable → cero contenido duplicado) + redirect instantáneo. El código es el de la pieza
// (p.code, único); el SLUG es el destino. Páginas NUEVAS → sin cache bump (spec §4).

// Código apto para nombre de archivo/URL: los códigos son numéricos ("0953"). Aceptamos
// alfanumérico + `-` + `_` (sin barras ni puntos → sin path traversal ni `..`); lo demás se
// salta con aviso. El buscador en memoria (data.getByCode) sigue resolviendo CUALQUIER código.
const SAFE_CODE_RE = /^[A-Za-z0-9_-]+$/;
function safeCodeForFile(code) {
    const c = String(code ?? '').trim();
    return SAFE_CODE_RE.test(c) ? c : null;
}

// Stub mínimo y válido que redirige al canónico. OG/title/desc/imagen REALES (escapados, mismo
// criterio cero-demo que la ficha) para el preview social; canonical + noindex evitan duplicado.
// Redirect root-relative (`/pieza/<slug>.html`) → sirve igual servido en /p/<code> o /p/<code>.html.
function generateStub(p, slug, collectionsById) {
    const category = categoryLabel(p, collectionsById);
    const name = p.name || 'Pieza';
    const title = `${name} · ${BRAND}`;
    const canonicalUrl = `${SITE_URL}/pieza/${slug}.html`;
    const dest = `/pieza/${slug}.html`;
    const image = getFullImage(p);
    const realDesc = descriptionFor(p);
    const specsLine = buildAdditionalProperty(p.specs).slice(0, 4).map(x => x.value).join(', ');
    const metaDesc = realDesc
        || `${name} — ${category} en alta joyería ${BRAND}.${specsLine ? ' ' + specsLine + '.' : ''}`;
    return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)}</title>
<meta name="robots" content="noindex, follow">
<link rel="canonical" href="${escapeAttr(canonicalUrl)}">
<meta property="og:type" content="product">
<meta property="og:site_name" content="${escapeAttr(BRAND)}">
<meta property="og:title" content="${escapeAttr(title)}">
<meta property="og:description" content="${escapeAttr(metaDesc)}">
<meta property="og:image" content="${escapeAttr(image)}">
<meta property="og:url" content="${escapeAttr(canonicalUrl)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeAttr(title)}">
<meta name="twitter:description" content="${escapeAttr(metaDesc)}">
<meta name="twitter:image" content="${escapeAttr(image)}">
<meta http-equiv="refresh" content="0; url=${escapeAttr(dest)}">
<script>location.replace(${safeJsonLd(dest)});</script>
</head>
<body>
<p>Redirigiendo a la pieza… Si no avanza, <a href="${escapeAttr(dest)}">ábrela aquí</a>.</p>
</body>
</html>
`;
}

// Integridad ligera del stub (es chico ~1KB, NO aplica el MIN_BAKE_BYTES de las piezas):
// cierre </html> + canonical presente + tamaño mínimo razonable.
function bakeStubError(code, html) {
    if (typeof html !== 'string' || html.length < 300) return `p/${code}.html: ${(html || '').length} bytes (vacío/truncado)`;
    if (!html.includes('</html>')) return `p/${code}.html: falta </html>`;
    if (!html.includes('rel="canonical"')) return `p/${code}.html: falta canonical`;
    return null;
}

// ===================== Sitemap =====================

// Estáticas indexables (index,follow). lastmod FIJO — Google ignora el lastmod si
// TODAS las páginas dicen "hoy". Colecciones/journal entran cuando se horneen (Fase A2).
const STATIC_PAGES = [
    { loc: '/',                 freq: 'weekly',  prio: '1.0', lastmod: '2026-06-25' },
    { loc: '/colecciones.html', freq: 'weekly',  prio: '0.9', lastmod: '2026-06-25' },
    { loc: '/journal.html',     freq: 'weekly',  prio: '0.6', lastmod: '2026-06-25' },
    { loc: '/nosotros.html',    freq: 'monthly', prio: '0.8', lastmod: '2026-06-25' },
    { loc: '/contacto.html',    freq: 'monthly', prio: '0.8', lastmod: '2026-06-25' },
];

function isoDate(ts) {
    try {
        const d = (ts && typeof ts.toDate === 'function') ? ts.toDate()
                : (typeof ts === 'number') ? new Date(ts)
                : ts ? new Date(String(ts)) : null;
        if (!d) return null;
        const iso = d.toISOString().split('T')[0];
        return /^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso : null;
    } catch { return null; }
}

function sitemapUrl(loc, lastmod, freq, prio) {
    return `    <url>\n        <loc>${escapeXml(loc)}</loc>\n        <lastmod>${lastmod}</lastmod>\n        <changefreq>${freq}</changefreq>\n        <priority>${prio}</priority>\n    </url>`;
}

function generateSitemap(pieces, slugMap, today) {
    const urls = [];
    for (const sp of STATIC_PAGES) {
        urls.push(sitemapUrl(`${SITE_URL}${sp.loc}`, sp.lastmod, sp.freq, sp.prio));
    }
    for (const p of pieces) {
        const slug = slugMap.get(String(p.id));
        if (!slug) continue;
        const lastmod = isoDate(p.updatedAt) || today;
        urls.push(sitemapUrl(`${SITE_URL}/pieza/${slug}.html`, lastmod, 'weekly', '0.8'));
    }
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
    if (!xml.startsWith('<?xml') || !xml.includes('</urlset>')) {
        throw new Error('[generateSitemap] Salida inválida — abortando.');
    }
    return xml;
}

// ===================== bake-integrity =====================

// Una página horneada rota/truncada NUNCA debe llegar a prod. Chequeo ligero por página:
// cierre </html> + tamaño mínimo. El run ABORTA si alguna falla → el deploy no sube →
// prod queda en el último build bueno.
function bakeIntegrityError(slug, html) {
    if (typeof html !== 'string' || html.length < MIN_BAKE_BYTES) {
        return `pieza/${slug}.html: ${(html || '').length} bytes < ${MIN_BAKE_BYTES} (vacía/truncada)`;
    }
    if (!html.includes('</html>')) return `pieza/${slug}.html: falta </html> (horneado incompleto)`;
    return null;
}

// ===================== Conexión a Firestore =====================

async function connectDb() {
    const rawKey = process.env.FIREBASE_SA_KEY;
    if (rawKey && rawKey.trim()) {
        let creds;
        try { creds = JSON.parse(rawKey); }
        catch (e) { throw new Error('[generate] FIREBASE_SA_KEY presente pero no es JSON válido: ' + e.message); }
        const { initializeApp: initAdminApp, cert } = await import('firebase-admin/app');
        const { getFirestore: getAdminFirestore } = await import('firebase-admin/firestore');
        const adminApp = initAdminApp({ credential: cert(creds), projectId: FIREBASE_CONFIG.projectId });
        console.log('[generate] Modo Admin SDK (Service Account) — lectura autenticada.');
        return { mode: 'admin', db: getAdminFirestore(adminApp) };
    }
    const clientApp = initializeApp(FIREBASE_CONFIG);
    console.log('[generate] Modo SDK cliente anónimo — lectura pública bajo reglas.');
    return { mode: 'client', db: getFirestore(clientApp) };
}

async function fetchCollection(handle, name, opts = {}) {
    // excludePrivate (TODO-40 v3 · D5): solo en `pieces`. El SSG corre en modo CLIENTE anónimo en CI
    // (deploy.yml SIN FIREBASE_SA_KEY) → bajo la regla read v3 una lectura SIN filtro FALLARÍA entera si
    // existe una privada. `!= privada` pide solo docs legibles (= la regla) y excluye privadas del catálogo.
    if (handle.mode === 'admin') {
        // D.1: en modo admin (SA key) NO se filtra en la query. `where('visibilidad','!=','privada')` excluye,
        // por semántica de Firestore, los docs SIN el campo `visibilidad` (una pieza legacy → desaparecía del
        // catálogo/sitemap SIN error). El admin lee TODO; el filtro esPublica() en main() quita las privadas
        // (mismo resultado para privadas) pero ya NO pierde las legacy sin visibilidad.
        return await handle.db.collection(name).get();
    }
    const base = collection(handle.db, name);
    return await getDocs(opts.excludePrivate ? query(base, where('visibilidad', '!=', 'privada')) : base);
}

// Pieza "horneable": real e indexable (cero-demo). Tiene nombre + imagen + no es "PRUEBA".
// Bersaglio aún no tiene flag status:published por pieza (toda pieza ya es pública); este
// filtro de CALIDAD evita indexar stubs de prueba sin tocar el modelo de datos (follow-up).
function isPublishable(p) {
    const name = (p.name || '').trim();
    if (!name || /^prueba\b/i.test(name)) return false;
    const hasImage = !!((p.images && p.images[0]) || p.image);
    return hasImage;
}

// ===================== catalogo.json — catálogo PÚBLICO estático (B1 paso 7 · fuga #8) =====================
// El público lee este JSON desde la CDN de Pages (cero Firestore reads); Firestore live queda para
// admin/POS/checkout. Contrato verificado contra los consumidores (catalogo.js/pieza.js/data.js):
// incluye TODO lo que el cliente renderiza/ordena; EXCLUYE internos (costo, peso-taller, notas).

// ── Modelo de inventario v3 (TODO-40) — derivación de stock para el SSG. SSoT = inventario-model.js.
// Tolerante a legacy: `estado:'vendida'` (pre-migración) → cantidad 0; cantidad ausente → 1 (finito*).
function normStockType(st) { return STOCK_TYPES.includes(st) ? st : 'finito'; }

function stockInfo(p) {
    const stockType = normStockType(p.stockType);
    const cantidad = stockType === 'encargo' ? null
        : (p.estado === 'vendida' ? 0 : (Number.isInteger(p.cantidad) ? p.cantidad : 1));
    const estado = derivarEstado(stockType, cantidad);     // disponible | bajo_pedido | agotada
    const orderable = esDisponible(stockType, cantidad);   // agotada → false; resto → true
    const hasPrice = !!p.price && Number.isFinite(Number(p.price));
    // availability schema.org (consejo Gemini §10.1, extendido a enum3):
    //  · agotada (finito sin stock)            → OutOfStock, sin precio (no se ofrece)
    //  · encargo / bajo_pedido (refabricable 0)→ PreOrder (se fabrica; precio si lo hay)
    //  · disponible                            → InStock (con precio) / PreOrder ("bajo consulta")
    let availability, showPrice;
    if (estado === 'agotada') { availability = 'https://schema.org/OutOfStock'; showPrice = false; }
    else if (stockType === 'encargo' || estado === 'bajo_pedido') { availability = 'https://schema.org/PreOrder'; showPrice = hasPrice; }
    else { availability = hasPrice ? 'https://schema.org/InStock' : 'https://schema.org/PreOrder'; showPrice = hasPrice; }
    return { stockType, cantidad, estado, orderable, hasPrice, availability, showPrice };
}

// ¿Pública? (D5 fail-closed): privada = facturable FUERA del catálogo. La barrera real es la regla
// read v3 + la query `!= privada`; esto es defensa en profundidad en el horneado (L-41).
function esPublica(p) { return p.visibilidad !== 'privada'; }

// Timestamp Firestore (Admin SDK o cliente) → { seconds }. El cliente ordena por `.seconds`
// (catalogo.js:65) → NO tocar el consumidor. Admin SDK serializa con `_seconds`; el cliente con `seconds`.
function tsSeconds(ts) {
    if (ts == null) return null;
    if (typeof ts.seconds === 'number')   return { seconds: ts.seconds };
    if (typeof ts._seconds === 'number')  return { seconds: ts._seconds };
    if (typeof ts.toMillis === 'function') return { seconds: Math.floor(ts.toMillis() / 1000) };
    if (typeof ts === 'number')           return { seconds: Math.floor(ts / 1000) };
    const t = new Date(ts).getTime();
    return Number.isFinite(t) ? { seconds: Math.floor(t / 1000) } : null;
}

// specs PÚBLICOS (whitelist AEO) — NUNCA volcar specs crudo (puede traer notas internas).
// D.0: `badgeGem` (gema protagonista, tiñe el badge) y `gemFilterIds` (todas las gemas, para filtros
// array-contains) son PÚBLICOS por diseño (§151). Sin ellos, al conmutar el cliente al catalogo.json (7b)
// el badge caería al regex sobre prosa y los filtros por gema (TODO-50/57) no tendrían sobre qué construirse.
const PUBLIC_SPEC_KEYS = ['stone', 'stones', 'carat', 'color', 'clarity', 'cut', 'accent',
    'metal', 'gold', 'weight', 'certificate', 'gia', 'origin', 'badgeGem', 'gemFilterIds'];
function publicSpecs(specs) {
    const s = specs || {};
    const out = {};
    for (const k of PUBLIC_SPEC_KEYS) {
        if (s[k] != null && String(s[k]).trim() !== '') out[k] = s[k];
    }
    return out;
}

// Proyección pública de una colección (categoría — sin datos sensibles).
function publicCollection(c) {
    return {
        id: c.id,
        slug: c.slug || c.id,
        name: c.name || '',
        description: c.description || '',
        subtitle: c.subtitle || '',
        featured: c.featured === true,
        order: Number.isFinite(Number(c.order)) ? Number(c.order) : null,
        bannerUrl: c.bannerUrl || '',
        bannerLqip: c.bannerLqip || '',
    };
}

// Proyección pública de una pieza. Whitelist verificada contra catalogo.js (grilla: slug/id/images/
// image/tag/featured/specs/collection/price/name/imageLqip) + pieza.js (ficha: description/sizes/code/
// specs) + orden por createdAt/updatedAt. `available` = la grilla la filtra; la ficha muestra "Vendida".
function publicPiece(p, slug) {
    const price = (p.price != null && Number.isFinite(Number(p.price))) ? Number(p.price) : null;
    const images = Array.isArray(p.images) ? p.images.filter(Boolean)
                 : (p.image ? [p.image] : []);
    const { stockType, cantidad, orderable } = stockInfo(p);   // v3: enum3 + cantidad + disponibilidad
    return {
        id: p.id,
        slug,
        name: p.name || '',
        code: p.code || '',
        collection: p.collection || '',
        price,
        images,
        imageLqip: p.imageLqip || '',
        tag: p.tag || '',
        featured: p.featured === true,
        sizes: Array.isArray(p.sizes) ? p.sizes : [],
        specs: publicSpecs(p.specs),
        description: descriptionFor(p),         // cero-demo: "" si "PRUEBA"/vacío
        // Stock v3 (TODO-40, SSoT = stockInfo): stockType enum3 + cantidad (CF-only) + available derivado.
        //  · encargo → siempre pedible, cantidad null · finito_refabricable → pedible aun en 0 (bajo pedido)
        //  · finito agotada (cantidad 0) → available:false (la grilla la filtra; la ficha muestra "Vendida").
        stockType,
        available: orderable,
        cantidad,
        createdAt: tsSeconds(p.createdAt),
        updatedAt: tsSeconds(p.updatedAt),
    };
}

// catalogo.json completo. `pieces` incluye TODAS las publicables (incl. vendidas con available:false →
// la grilla las filtra, la ficha las muestra con sello). `slugMap`: id→slug (contrato único con urls.js).
function buildCatalogJson(pieces, collections, slugMap, generatedAtIso) {
    return {
        version: 1,
        generatedAt: generatedAtIso,
        collections: collections.map(publicCollection),
        pieces: pieces.map(p => publicPiece(p, slugMap.get(String(p.id)) || pieceSlug(p))),
    };
}

// ===================== Main =====================

async function main() {
    if (!existsSync(DIST)) {
        throw new Error('[generate] No existe dist/. Corre `vite build` ANTES del generador.');
    }
    const templatePath = join(DIST, 'pieza.html');
    if (!existsSync(templatePath)) {
        throw new Error('[generate] No existe dist/pieza.html (¿el build incluyó la entrada pieza?).');
    }
    const template = readFileSync(templatePath, 'utf-8');

    console.log('[generate] Conectando a Firestore…');
    const handle = await connectDb();

    const [piecesSnap, colsSnap, journalSnap] = await Promise.all([
        fetchCollection(handle, 'pieces', { excludePrivate: true }),   // v3 D5: privadas FUERA del catálogo
        fetchCollection(handle, 'collections'),
        fetchCollection(handle, 'journal'),
    ]);
    const allPieces = piecesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const collections = colsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const journalEntries = journalSnap.docs.map(d => ({ id: d.id, ...d.data() }))
        .filter(e => e.published === true);
    const collectionsById = new Map();
    for (const c of collections) {
        collectionsById.set(c.slug || c.id, c);
        collectionsById.set(c.id, c);
    }

    // Catálogo vacío = estado LEGÍTIMO del ciclo de vida (pre-lanzamiento · tras borrar la carga de prueba
    // antes de subir la real · Kary borra la última pieza). NO abortamos por 0 piezas — eso bloquearía el
    // deploy del sitio en un estado válido (frontera de estado-cero). Solo avisamos. El guard REAL contra
    // el fallo silencioso peligroso sigue siendo `catalogo.pieces.length !== pieces.length` (abajo): detecta
    // "se leyeron piezas pero la proyección las perdió".
    if (allPieces.length === 0) {
        console.warn('[generate] ⚠️ 0 piezas en Firestore → catálogo VACÍO (estado válido pre-carga). Horneando el sitio sin piezas.');
    }
    // isPublishable (calidad/cero-demo) + esPublica (defensa en profundidad sobre el filtro de la query).
    const pieces = allPieces.filter(isPublishable).filter(esPublica);
    const skipped = allPieces.length - pieces.length;
    console.log(`[generate] ${allPieces.length} piezas públicas · ${pieces.length} horneables · ${skipped} saltadas (sin nombre/imagen o "PRUEBA").`);

    // Slug map + guard de unicidad (slug duplicado = bug de datos → fail-loud, no mangle).
    const slugMap = new Map();
    const seen = new Map();
    for (const p of pieces) {
        const slug = pieceSlug(p);
        if (seen.has(slug)) {
            throw new Error(`[generate] SLUG DUPLICADO "${slug}": piezas ${seen.get(slug)} y ${p.id}. Corrige el slug en el admin (debe ser único).`);
        }
        seen.set(slug, p.id);
        slugMap.set(String(p.id), slug);
    }

    // Salida limpia: dist/pieza/ (dist es fresco cada build; cleanup por si se corre suelto).
    const outDir = join(DIST, 'pieza');
    mkdirSync(outDir, { recursive: true });
    try {
        for (const f of readdirSync(outDir).filter(f => f.endsWith('.html'))) unlinkSync(join(outDir, f));
    } catch { /* primer run */ }

    const bakeFailures = [];
    for (const p of pieces) {
        const slug = slugMap.get(String(p.id));
        const html = generatePage(template, p, slug, collectionsById);
        const err = bakeIntegrityError(slug, html);
        if (err) bakeFailures.push(err);
        writeFileSync(join(outDir, `${slug}.html`), html);
    }
    console.log(`[generate] ${pieces.length} páginas horneadas en dist/pieza/.`);

    if (bakeFailures.length) {
        console.error('[generate] BAKE-INTEGRITY FALLÓ — NO se publica (prod queda en el último build bueno):');
        bakeFailures.forEach(e => console.error('  x ' + e));
        throw new Error(`[generate] ${bakeFailures.length} página(s) con horneado inválido — abortado.`);
    }

    // Links compartibles /p/<code> (TODO-58 slice 2). Salida limpia: borra stubs viejos (pieza
    // recodificada/borrada no deja un /p/ stale apuntando a un slug muerto).
    const stubDir = join(DIST, 'p');
    mkdirSync(stubDir, { recursive: true });
    try {
        for (const f of readdirSync(stubDir).filter(f => f.endsWith('.html'))) unlinkSync(join(stubDir, f));
    } catch { /* primer run */ }
    const stubFailures = [];
    const seenCodes = new Map();
    let stubCount = 0;
    for (const p of pieces) {
        const safe = safeCodeForFile(p.code);
        if (!safe) {
            if (p.code) console.warn(`[generate] ⚠️ código "${p.code}" (pieza ${p.id}) no apto para link /p/ (no alfanumérico) — salto stub.`);
            continue;
        }
        if (seenCodes.has(safe)) {
            console.warn(`[generate] ⚠️ CÓDIGO DUPLICADO "${safe}": piezas ${seenCodes.get(safe)} y ${p.id} — el link /p/${safe} se queda con la primera (revisa el código en el admin).`);
            continue;
        }
        seenCodes.set(safe, p.id);
        const html = generateStub(p, slugMap.get(String(p.id)), collectionsById);
        const err = bakeStubError(safe, html);
        if (err) { stubFailures.push(err); continue; }
        writeFileSync(join(stubDir, `${safe}.html`), html);
        stubCount++;
    }
    if (stubFailures.length) {
        console.error('[generate] STUB-INTEGRITY FALLÓ — NO se publica:');
        stubFailures.forEach(e => console.error('  x ' + e));
        throw new Error(`[generate] ${stubFailures.length} stub(s) /p/ inválido(s) — abortado.`);
    }
    console.log(`[generate] ${stubCount} link(s) compartible(s) /p/<code> horneado(s) en dist/p/.`);

    // Slug map para hidratación/depuración cliente.
    const dataDir = join(DIST, 'data');
    mkdirSync(dataDir, { recursive: true });
    writeFileSync(join(dataDir, 'piece-slugs.json'), JSON.stringify(Object.fromEntries(slugMap), null, 2));

    // catalogo.json — catálogo PÚBLICO estático para la CDN de Pages (B1 paso 7 · fuga #8). El cliente lo
    // lee en vez de abrir onSnapshot en CADA visita (cero Firestore reads). Incluye TODAS las publicables
    // (vendidas con available:false → la grilla las filtra, la ficha las muestra con sello). Guard
    // anti-catálogo-menguado: la proyección NO debe perder piezas ni vaciarse con datos presentes.
    const generatedAtIso = new Date().toISOString();
    const catalogo = buildCatalogJson(pieces, collections, slugMap, generatedAtIso);
    if (catalogo.pieces.length !== pieces.length) {
        throw new Error(`[generate] catalogo.json INCOMPLETO: ${catalogo.pieces.length} de ${pieces.length} publicables — la proyección perdió piezas (abortado).`);
    }
    if (allPieces.length > 0 && catalogo.pieces.length === 0) {
        throw new Error('[generate] catalogo.json VACÍO pese a haber piezas en Firestore — probable bug de datos/filtro (abortado).');
    }
    writeFileSync(join(dataDir, 'catalogo.json'), JSON.stringify(catalogo));
    const agotadasCount = pieces.filter(p => stockInfo(p).estado === 'agotada').length;
    console.log(`[generate] catalogo.json: ${catalogo.pieces.length} piezas (${agotadasCount} agotadas, available:false) + ${catalogo.collections.length} colecciones.`);

    // Sitemap (sobrescribe el estático copiado por Vite desde public/).
    const today = isoDate(Date.now()) || '2026-06-25';
    const sitemap = generateSitemap(pieces, slugMap, today);
    writeFileSync(join(DIST, 'sitemap.xml'), sitemap);
    console.log(`[generate] sitemap.xml regenerado (${STATIC_PAGES.length} estáticas + ${pieces.length} piezas).`);

    // Schema de marca (JewelryStore + WebSite) horneado en dist/index.html desde tenant_config.json.
    injectBusinessIntoIndex(readTenantConfig());

    // Páginas de listado indexables (catálogo + journal) — A2a. Por-categoría/por-artículo = A2b.
    injectListingPage('colecciones.html', '<main id="main-content" data-screen-label="colecciones">', {
        schemaType: 'CollectionPage',
        name: 'Catálogo · Bersaglio Jewelry',
        description: 'Anillos, aretes, collares y argollas de alta joyería: esmeralda colombiana, diamantes certificados y oro 18K.',
        // Agotadas FUERA del listado (§10.1 v3): salen de la grilla; su página vive con "Vendida·ver similares".
        // encargo y bajo_pedido (refabricable en 0) SÍ entran (son pedibles). orderable = !agotada.
        items: pieces.filter(p => stockInfo(p).orderable).map(p => ({ name: p.name, url: `${SITE_URL}/pieza/${slugMap.get(String(p.id))}.html` })),
    });
    injectListingPage('journal.html', '<main id="main-content" data-screen-label="journal">', {
        schemaType: 'Blog',
        name: 'Journal · Bersaglio Jewelry',
        description: 'Historias de alta joyería, esmeraldas colombianas y el oficio detrás de cada pieza.',
        items: journalEntries.map(e => ({ name: e.title || e.name || e.slug || 'Entrada', url: `${SITE_URL}/entrada.html?e=${encodeURIComponent(e.slug || e.id)}` })),
    });

    console.log('[generate] Listo.');
    process.exit(0);
}

// ===================== SSG_SELFTEST (gate anti-stored-XSS, sin red) =====================

function runSelfTest() {
    const U2028 = String.fromCharCode(0x2028), U2029 = String.fromCharCode(0x2029);
    const PAYLOAD = '</script><script>alert(1)</script>' + U2028 + U2029 + ' raw < & > \' chars';
    // Template: dist/pieza.html si existe, si no la fuente (los anclajes existen en ambos).
    const tplPath = existsSync(join(DIST, 'pieza.html')) ? join(DIST, 'pieza.html') : join(REPO_ROOT, 'pieza.html');
    const template = readFileSync(tplPath, 'utf-8');
    const fails = [];

    const mockCols = new Map([['anillos', { id: 'anillos', slug: 'anillos', name: PAYLOAD }]]);
    const mockPiece = {
        id: PAYLOAD, slug: 'selftest', name: PAYLOAD, code: PAYLOAD, collection: 'anillos',
        price: 12000000, description: PAYLOAD, images: ['https://x/y.jpg'],
        specs: { stone: PAYLOAD, carat: PAYLOAD, metal: PAYLOAD, certificate: PAYLOAD },
    };
    const html = generatePage(template, mockPiece, 'selftest', mockCols);

    // Breakout crudo en CUALQUIER contexto (JSON, attr, texto) → fallo.
    if (html.indexOf('</script><script>alert(1)</script>') >= 0) {
        fails.push('BREAKOUT crudo </script><script> presente (algún sink no escapa < >).');
    }
    // index,follow inyectado (regresión del .replace de robots).
    if (html.indexOf('<meta name="robots" content="index, follow">') < 0) {
        fails.push('robots index,follow NO inyectado (¿cambió el ancla noindex?).');
    }
    if (html.indexOf('<link rel="canonical" href="https://bersagliojewelry.co/pieza/selftest.html">') < 0) {
        fails.push('canonical limpio NO inyectado.');
    }
    // Bloques JSON-LD parsean.
    const parts = html.split('<script type="application/ld+json">');
    let n = 0;
    for (let i = 1; i < parts.length; i++) {
        const content = parts[i].split('</script>')[0];
        n++;
        try { JSON.parse(content); } catch (e) { fails.push(`ld+json #${n} NO parsea (escape roto): ${e.message}`); }
        if (content.indexOf(U2028) >= 0 || content.indexOf(U2029) >= 0) fails.push(`ld+json #${n} contiene U+2028/2029 crudo.`);
    }
    if (n < 2) fails.push(`esperaba >=2 bloques ld+json, encontró ${n}.`);
    // PRERENDERED parsea.
    const marker = 'window.PRERENDERED_PIECE_SLUG = ';
    const idx = html.indexOf(marker);
    if (idx < 0) fails.push('PRERENDERED_PIECE_SLUG no inyectado.');
    else {
        const val = html.slice(idx + marker.length).split(';</script>')[0];
        try { JSON.parse(val); } catch (e) { fails.push('PRERENDERED_PIECE_SLUG valor NO parsea: ' + e.message); }
    }
    // bake-integrity: completa pasa, truncada/diminuta fallan.
    if (bakeIntegrityError('selftest', html)) fails.push('bake-integrity: la página completa NO debería fallar.');
    if (!bakeIntegrityError('trunc', html.replace('</html>', ''))) fails.push('bake-integrity: sin </html> debería fallar.');
    if (!bakeIntegrityError('tiny', '<html></html>')) fails.push('bake-integrity: página diminuta debería fallar.');
    // sitemap válido + escapa.
    const sm = generateSitemap([mockPiece], new Map([[String(mockPiece.id), 'selftest']]), '2026-06-25');
    if (!sm.includes('</urlset>')) fails.push('sitemap sin </urlset>.');
    // Business @graph (marca) parsea tras safeJsonLd.
    try {
        const cfgT = existsSync(join(REPO_ROOT, 'tenant_config.json'))
            ? JSON.parse(readFileSync(join(REPO_ROOT, 'tenant_config.json'), 'utf-8'))
            : { vertical: 'JewelryStore', brand: 'X', baseUrl: 'https://x', nap: {}, sameAs: ['https://x/a'] };
        JSON.parse(safeJsonLd(buildBusinessGraph(cfgT)));
    } catch (e) { fails.push('business @graph NO parsea: ' + e.message); }

    // STOCK-AWARE (§10.1): vendida → OutOfStock + sin precio + "Vendida" en el HTML; no rebrota InStock.
    const soldPiece = { ...mockPiece, estado: 'vendida' };
    const soldSchema = buildProductSchema(soldPiece, 'Anillos', 'x', `${SITE_URL}/pieza/sold.html`, 'https://x/y.jpg');
    if (soldSchema.offers.availability !== 'https://schema.org/OutOfStock') fails.push('vendida: availability != OutOfStock.');
    if ('price' in soldSchema.offers) fails.push('vendida: el offer NO debe llevar price.');
    const soldHtml = generatePage(template, soldPiece, 'sold', mockCols);
    if (!soldHtml.includes('Vendida')) fails.push('vendida: el HTML no muestra "Vendida".');
    if (soldHtml.includes('schema.org/InStock')) fails.push('vendida: el schema aún declara InStock.');
    const liveSchema = buildProductSchema({ ...mockPiece, estado: 'disponible' }, 'Anillos', 'x', `${SITE_URL}/pieza/x.html`, 'https://x/y.jpg');
    if (liveSchema.offers.availability !== 'https://schema.org/InStock') fails.push('disponible+precio: availability != InStock.');
    if (liveSchema.offers.price !== 12000000) fails.push('disponible+precio: falta price en el offer.');

    // v3 enum3: finito_refabricable agotado (cantidad 0) SIGUE pedible → PreOrder, NO OutOfStock; el HTML no dice "Vendida".
    const refabPiece = { ...mockPiece, stockType: 'finito_refabricable', cantidad: 0 };
    const refabSchema = buildProductSchema(refabPiece, 'Anillos', 'x', `${SITE_URL}/pieza/r.html`, 'https://x/y.jpg');
    if (refabSchema.offers.availability !== 'https://schema.org/PreOrder') fails.push('refabricable 0: availability != PreOrder.');
    const refabHtml = generatePage(template, refabPiece, 'refab', mockCols);
    if (refabHtml.includes('schema.org/OutOfStock')) fails.push('refabricable 0: NO debe ser OutOfStock (sigue pedible).');
    if (refabHtml.includes('>Vendida<') || /font-weight:700[^>]*>Vendida/.test(refabHtml)) fails.push('refabricable 0: el HTML no debe decir "Vendida" (es bajo pedido).');
    // v3: encargo → PreOrder (se fabrica), nunca OutOfStock aunque traiga estado legacy 'vendida'.
    const encSchema = buildProductSchema({ ...mockPiece, stockType: 'encargo', estado: 'vendida' }, 'Anillos', 'x', `${SITE_URL}/pieza/e.html`, 'https://x/y.jpg');
    if (encSchema.offers.availability !== 'https://schema.org/PreOrder') fails.push('encargo: availability != PreOrder.');

    // D5 esPublica: privada se excluye del catálogo; publica y legacy (sin campo) entran (la regla+query son la barrera real).
    if (esPublica({ visibilidad: 'privada' }) !== false) fails.push('esPublica: privada debe ser false.');
    if (esPublica({ visibilidad: 'publica' }) !== true) fails.push('esPublica: publica debe ser true.');
    if (esPublica({}) !== true) fails.push('esPublica: legacy sin visibilidad debe ser true.');

    // catalogo.json: contrato COMPLETO (claves que el cliente usa) + available + NO filtra internos + parsea.
    const REQUIRED_PIECE_KEYS = ['id', 'slug', 'name', 'code', 'collection', 'price', 'images', 'imageLqip',
        'tag', 'featured', 'sizes', 'specs', 'description', 'available', 'stockType', 'cantidad', 'createdAt', 'updatedAt'];
    const cat = buildCatalogJson(
        [{ ...mockPiece, id: 'p1', stockType: 'finito', estado: 'disponible', cantidad: 2, costoInterno: 999, pesoTaller: 4.9, sizes: ['6'], tag: 'Nueva', imageLqip: 'data:x', updatedAt: { seconds: 100 } },
         { ...mockPiece, id: 'p2', stockType: 'finito', estado: 'vendida' },
         { ...mockPiece, id: 'p3', stockType: 'encargo', estado: 'vendida' },
         { ...mockPiece, id: 'p4', stockType: 'finito_refabricable', cantidad: 0 }],
        [{ id: 'anillos', slug: 'anillos', name: 'Anillos', description: 'd', secretoInterno: 'X' }],
        new Map([['p1', 'p1'], ['p2', 'p2'], ['p3', 'p3'], ['p4', 'p4']]),
        '2026-06-26T00:00:00.000Z',
    );
    try { JSON.parse(JSON.stringify(cat)); } catch (e) { fails.push('catalogo.json NO serializa/parsea: ' + e.message); }
    const pj = cat.pieces[0], vendida = cat.pieces[1], encargo = cat.pieces[2], refab = cat.pieces[3];
    for (const k of REQUIRED_PIECE_KEYS) if (!(k in pj)) fails.push(`catalogo.json: falta la clave "${k}" del contrato.`);
    if ('costoInterno' in pj || 'pesoTaller' in pj) fails.push('catalogo.json: FILTRA campo interno (costoInterno/pesoTaller) — fuga.');
    if (pj.available !== true || pj.cantidad !== 2 || pj.stockType !== 'finito') fails.push('catalogo.json: finito disponible debe ser available:true, cantidad:2, finito.');
    if (vendida.available !== false || vendida.cantidad !== 0) fails.push('catalogo.json: finito vendida debe ser available:false, cantidad:0.');
    if (encargo.available !== true || encargo.cantidad !== null || encargo.stockType !== 'encargo') fails.push('catalogo.json: encargo debe ser SIEMPRE available:true, cantidad:null (ignora estado vendida).');
    if (refab.available !== true || refab.cantidad !== 0 || refab.stockType !== 'finito_refabricable') fails.push('catalogo.json: finito_refabricable en 0 debe ser available:true (bajo pedido), cantidad:0, finito_refabricable.');
    if (pj.updatedAt?.seconds !== 100) fails.push('catalogo.json: updatedAt no normalizado a {seconds}.');
    if ('secretoInterno' in cat.collections[0]) fails.push('catalogo.json: colección NO respeta whitelist (fuga de campo).');
    if (!('stone' in pj.specs)) fails.push('catalogo.json: specs whitelist perdió "stone".');

    // /p/<code> stub (TODO-58 slice 2): redirige al canónico, noindex,follow, OG real, sin breakout XSS.
    const stubHtml = generateStub(mockPiece, 'selftest', mockCols);
    if (stubHtml.indexOf('</script><script>alert(1)</script>') >= 0) fails.push('stub: BREAKOUT crudo </script><script> presente.');
    if (stubHtml.indexOf('<link rel="canonical" href="https://bersagliojewelry.co/pieza/selftest.html">') < 0) fails.push('stub: canonical al horneado ausente.');
    if (stubHtml.indexOf('<meta name="robots" content="noindex, follow">') < 0) fails.push('stub: robots noindex,follow ausente.');
    if (!/location\.replace\(/.test(stubHtml) || stubHtml.indexOf('/pieza/selftest.html') < 0) fails.push('stub: redirect al canónico ausente.');
    if (stubHtml.indexOf('property="og:image"') < 0) fails.push('stub: og:image ausente (preview social).');
    if (bakeStubError('selftest', stubHtml)) fails.push('stub: bake-integrity de un stub válido NO debería fallar.');
    if (!bakeStubError('tiny', '<html></html>')) fails.push('stub: bake-integrity de un stub diminuto debería fallar.');
    // safeCodeForFile: numérico OK (trim); con barra/punto/"..", o vacío → null (anti path-traversal).
    if (safeCodeForFile('0953') !== '0953') fails.push('safeCodeForFile: "0953" debe ser válido.');
    if (safeCodeForFile('  0953 ') !== '0953') fails.push('safeCodeForFile: debe trimear.');
    if (safeCodeForFile('a/b') !== null) fails.push('safeCodeForFile: con "/" debe ser null.');
    if (safeCodeForFile('..') !== null) fails.push('safeCodeForFile: ".." debe ser null.');
    if (safeCodeForFile('') !== null) fails.push('safeCodeForFile: vacío debe ser null.');

    if (fails.length) {
        console.error('[SSG_SELFTEST] FALLO:');
        for (const f of fails) console.error('  - ' + f);
        process.exit(1);
    }
    console.log('[SSG_SELFTEST] OK — sinks JSON-LD/PRERENDERED neutralizan </script>+U+2028/29; anclajes y guards correctos.');
    process.exit(0);
}

if (process.env.SSG_SELFTEST) {
    runSelfTest();
} else {
    main().catch(err => { console.error('[generate] Fatal:', err); process.exit(1); });
}
