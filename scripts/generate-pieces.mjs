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
import { getFirestore, collection, getDocs } from 'firebase/firestore';
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
    const metal = s.metal || s.gold || '';
    const stones = s.stones || s.stone || '';
    const primaryStone = stones.includes('·') ? stones.split('·')[0].trim() : stones;
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
    const metal = s.metal || s.gold || '';
    const hasPrice = !!p.price && Number.isFinite(Number(p.price));
    const additionalProperty = buildAdditionalProperty(s);

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
        // Offer: NUNCA price:0 (Google lo rechaza). Con precio → InStock+precio;
        // "bajo consulta" (alta joyería) → PreOrder sin price.
        offers: hasPrice ? {
            '@type': 'Offer', url: canonicalUrl, priceCurrency: 'COP',
            price: Number(p.price), priceValidUntil: '2027-12-31',
            itemCondition: 'https://schema.org/NewCondition',
            availability: 'https://schema.org/InStock',
            valueAddedTaxIncluded: true,
            seller: { '@type': 'JewelryStore', '@id': `${SITE_URL}/#business`, name: BRAND },
        } : {
            '@type': 'Offer', url: canonicalUrl, priceCurrency: 'COP',
            itemCondition: 'https://schema.org/NewCondition',
            availability: 'https://schema.org/PreOrder',
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
    const priceText = (p.price && Number.isFinite(Number(p.price))) ? formatPriceCOP(p.price) : 'Bajo consulta';
    const specRows = buildAdditionalProperty(p.specs).map(x =>
        `                <li><strong>${escapeHtml(x.name)}:</strong> ${escapeHtml(x.value)}</li>`
    ).join('\n');
    const noscript = `
    <noscript>
        <div style="max-width:1100px;margin:96px auto;padding:24px;font-family:Manrope,system-ui,sans-serif">
            <nav style="font-size:14px;opacity:.7;margin-bottom:16px"><a href="${SITE_URL}/">Inicio</a> › <a href="${SITE_URL}/colecciones.html">${escapeHtml(category)}</a> › ${escapeHtml(name)}</nav>
            <h1>${escapeHtml(name)}</h1>
            <img src="${escapeAttr(image)}" alt="${escapeAttr(name + ' — ' + BRAND)}" style="max-width:100%;height:auto;border-radius:14px">
            <p style="font-size:22px;font-weight:700;margin:16px 0">${escapeHtml(priceText)}</p>
            ${realDesc ? `<p>${escapeHtml(realDesc)}</p>` : ''}
            ${specRows ? `<ul style="list-style:none;padding:0;line-height:2">\n${specRows}\n            </ul>` : ''}
            <p><a href="${SITE_URL}/contacto.html">Consultar esta pieza con un asesor</a> · <a href="${SITE_URL}/colecciones.html">Ver el catálogo</a></p>
        </div>
    </noscript>`;
    html = html.replace(
        '<main id="main-content" data-screen-label="pieza">',
        `<main id="main-content" data-screen-label="pieza">${noscript}`
    );

    return html;
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

async function fetchCollection(handle, name) {
    if (handle.mode === 'admin') return await handle.db.collection(name).get();
    return await getDocs(collection(handle.db, name));
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
        fetchCollection(handle, 'pieces'),
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

    const pieces = allPieces.filter(isPublishable);
    const skipped = allPieces.length - pieces.length;
    console.log(`[generate] ${allPieces.length} piezas totales · ${pieces.length} horneables · ${skipped} saltadas (sin nombre/imagen o "PRUEBA").`);

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

    // Slug map para hidratación/depuración cliente.
    const dataDir = join(DIST, 'data');
    mkdirSync(dataDir, { recursive: true });
    writeFileSync(join(dataDir, 'piece-slugs.json'), JSON.stringify(Object.fromEntries(slugMap), null, 2));

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
        items: pieces.map(p => ({ name: p.name, url: `${SITE_URL}/pieza/${slugMap.get(String(p.id))}.html` })),
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
