/**
 * Bersaglio Jewelry — SEO Structured Data (JSON-LD)
 * Dynamically generates and injects schema.org metadata.
 */

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
    const url = `https://bersagliojewelry.co/pieza.html?p=${encodeURIComponent(piece.slug || piece.id)}`;
    const image = piece.images?.[0] || piece.image || '';
    const desc = descriptionFor ? descriptionFor(piece) : (piece.description || '');
    const category = getCategoryLabel ? getCategoryLabel(piece) : (piece.collection || '');

    const productJson = {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": piece.name || 'Pieza',
        "image": image ? [image] : [],
        "description": desc,
        "sku": piece.ref || piece.id,
        "mpn": piece.ref || piece.id,
        "brand": {
            "@type": "Brand",
            "name": "Bersaglio Jewelry"
        },
        "offers": {
            "@type": "Offer",
            "url": url,
            "priceCurrency": "COP",
            "price": Number(piece.price || 0),
            "priceValidUntil": "2027-12-31",
            "itemCondition": "https://schema.org/NewCondition",
            "availability": piece.price ? "https://schema.org/InStock" : "https://schema.org/PreOrder",
            "valueAddedTaxIncluded": true
        }
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
                "url": `https://bersagliojewelry.co/pieza.html?p=${encodeURIComponent(p.slug || p.id)}`
            }))
        }
    };
    injectSchema('catalog-jsonld', catalogJson);
}
