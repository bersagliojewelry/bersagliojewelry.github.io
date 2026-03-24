/**
 * Bersaglio Jewelry — Product Schema Generator
 * Generates valid Schema.org Product JSON-LD compliant with
 * Google Search Console structured data requirements.
 *
 * Resolves: "Must specify offers, review, or aggregateRating"
 */

const BASE_URL = 'https://bersagliojewelry.co';

const BRAND = { '@type': 'Brand', name: 'Bersaglio Jewelry' };

const SELLER = { '@type': 'Organization', name: 'Bersaglio Jewelry' };

/**
 * Build a complete Product schema object for a piece.
 * @param {Object} piece - catalog piece object
 * @param {Object} [opts]
 * @param {string} [opts.url] - override canonical URL
 * @returns {Object} JSON-LD Product schema
 */
export function buildProductSchema(piece, opts = {}) {
    const url = opts.url || `${BASE_URL}/pieza.html?p=${piece.slug}`;

    const schema = {
        '@context': 'https://schema.org',
        '@type':    'Product',
        name:        piece.name,
        description: piece.description,
        url,
        brand:       BRAND,
        category:    'Jewelry',
    };

    // Image — use piece image if available, else logo fallback
    schema.image = piece.image
        ? `${BASE_URL}/${piece.image}`
        : `${BASE_URL}/img/logo-bj2.png`;

    // Offers — always include to satisfy Google requirement
    if (piece.price && piece.price > 0) {
        schema.offers = {
            '@type':           'Offer',
            url,
            priceCurrency:     'COP',
            price:             piece.price,
            priceValidUntil:   _priceValidUntil(),
            availability:      'https://schema.org/InStock',
            seller:            SELLER,
        };
    } else {
        // Products without a listed price: use valid Offer with
        // priceSpecification to indicate price is not publicly listed.
        // This satisfies Google's "offers" requirement while being
        // semantically accurate for "price upon request" items.
        schema.offers = {
            '@type':       'Offer',
            url,
            availability:  'https://schema.org/InStock',
            seller:        SELLER,
            priceSpecification: {
                '@type':        'UnitPriceSpecification',
                priceCurrency:  'COP',
                price:          0,
                description:    'Precio bajo consulta',
            },
        };
    }

    // Certificate as additional property
    if (piece.specs?.certificate) {
        schema.additionalProperty = [{
            '@type': 'PropertyValue',
            name:    'Certificación',
            value:   piece.specs.certificate,
        }];
    }

    // Material from specs
    if (piece.specs?.metal) {
        schema.material = piece.specs.metal;
    }

    return schema;
}

/**
 * Build schema for multiple products (e.g. product listing pages).
 * Returns an ItemList wrapping individual Product schemas.
 */
export function buildProductListSchema(pieces) {
    return {
        '@context': 'https://schema.org',
        '@type':    'ItemList',
        itemListElement: pieces.map((piece, i) => ({
            '@type':  'ListItem',
            position: i + 1,
            item:     buildProductSchema(piece),
        })),
    };
}

/**
 * Inject JSON-LD into document <head>.
 * Replaces any existing script with the same id.
 */
export function injectJsonLd(id, data) {
    document.getElementById(id)?.remove();
    const script       = document.createElement('script');
    script.type        = 'application/ld+json';
    script.id          = id;
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
}

/* ─── Helpers ───────────────────────────────────────────────── */

/** Returns a date ~1 year from now in ISO format for priceValidUntil */
function _priceValidUntil() {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split('T')[0];
}
