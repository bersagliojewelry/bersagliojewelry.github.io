/**
 * Bersaglio Jewelry — SEO Structured Data (JSON-LD)
 * Dynamically generates and injects schema.org metadata.
 */

import { pieceAbsUrl } from './urls.js';

/**
 * Helper to inject or update a JSON-LD script tag by ID.
 * @param {string} id - The script tag ID
 * @param {Object} json - The schema object
 */
export function injectSchema(id, json) {
    let script = document.getElementById(id);
    if (!script) {
        script = document.createElement('script');
        script.type = 'application/ld+json';
        script.id = id;
        document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(json, null, 2);
}

/**
 * Helper to remove a script tag by ID.
 * @param {string} id
 */
export function removeSchema(id) {
    const script = document.getElementById(id);
    if (script) script.remove();
}

/**
 * Injects Product structured data (Merchant Listings compliant).
 * @param {Object} piece
 * @param {Function} getCategoryLabel
 * @param {Function} descriptionFor
 */
export function injectProductSchema(piece, getCategoryLabel, descriptionFor) {
    if (!piece) return;
    const url = pieceAbsUrl(piece);
    const image = piece.images?.[0] || piece.image || '';
    const desc = descriptionFor ? descriptionFor(piece) : (piece.description || '');
    const category = getCategoryLabel ? getCategoryLabel(piece) : (piece.collection || '');

    const s = piece.specs || {};
    const hasPrice = !!piece.price && Number.isFinite(Number(piece.price));
    const metal = s.metal || s.gold || '';

    // Specs ricas → additionalProperty (AEO: deja a Google/Perplexity/ChatGPT CITAR quilataje,
    // claridad, material, certificación). SOLO campos con valor real (cero-demo).
    const additionalProperty = [
        ['Gema', s.stone], ['Quilates', s.carat], ['Color', s.color], ['Claridad', s.clarity],
        ['Corte', s.cut], ['Acentos', s.accent], ['Metal', metal], ['Peso', s.weight],
        ['Certificación', s.certificate], ['Origen', s.origin],
    ].filter(([, v]) => v != null && String(v).trim() !== '')
     .map(([name, value]) => ({ "@type": "PropertyValue", "name": name, "value": String(value) }));

    const productJson = {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": piece.name || 'Pieza',
        "image": image ? [image] : [],
        "description": desc || `${piece.name || 'Pieza'} — alta joyería Bersaglio.`,
        // SKU/MPN = código real de la pieza (antes usaba `piece.ref`, campo inexistente → caía al id aleatorio).
        "sku": piece.code || piece.id,
        ...(piece.code ? { "mpn": piece.code } : {}),
        "category": category,
        "brand": { "@type": "Brand", "name": "Bersaglio Jewelry" },
        ...(metal ? { "material": metal } : {}),
        ...(additionalProperty.length ? { additionalProperty } : {}),
        // Offer: NUNCA price:0 (Google lo rechaza). Con precio → InStock+precio; "Bajo consulta" → PreOrder sin price.
        "offers": hasPrice ? {
            "@type": "Offer", "url": url, "priceCurrency": "COP",
            "price": Number(piece.price),
            "priceValidUntil": "2027-12-31",
            "itemCondition": "https://schema.org/NewCondition",
            "availability": "https://schema.org/InStock",
            "valueAddedTaxIncluded": true,
        } : {
            "@type": "Offer", "url": url, "priceCurrency": "COP",
            "itemCondition": "https://schema.org/NewCondition",
            "availability": "https://schema.org/PreOrder",
        },
    };
    injectSchema('product-jsonld', productJson);
}

/**
 * Injects BreadcrumbList structured data.
 * @param {Object} piece
 * @param {Function} getCategoryLabel
 */
export function injectBreadcrumbSchema(piece, getCategoryLabel) {
    if (!piece) return;
    const cat = getCategoryLabel ? getCategoryLabel(piece) : (piece.collection || '');
    const breadcrumbJson = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Inicio",
                "item": "https://bersagliojewelry.co/"
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": cat,
                "item": `https://bersagliojewelry.co/colecciones.html?col=${encodeURIComponent(piece.collection || '')}`
            },
            {
                "@type": "ListItem",
                "position": 3,
                "name": piece.name || 'Pieza',
                "item": window.location.href
            }
        ]
    };
    injectSchema('breadcrumb-jsonld', breadcrumbJson);
}

/**
 * Injects CollectionPage structured data for a catalog.
 * @param {Object|null} collection
 * @param {Array} list
 */
export function injectCatalogSchema(collection, list) {
    const name = collection ? collection.name : "Catálogo";
    const desc = collection ? collection.description : "Explora nuestra colección completa de alta joyería y esmeraldas colombianas.";
    const catalogJson = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": name,
        "description": desc,
        "url": window.location.href,
        "mainEntity": {
            "@type": "ItemList",
            "numberOfItems": list.length,
            "itemListElement": list.map((p, idx) => ({
                "@type": "ListItem",
                "position": idx + 1,
                "url": pieceAbsUrl(p)
            }))
        }
    };
    injectSchema('catalog-jsonld', catalogJson);
}
