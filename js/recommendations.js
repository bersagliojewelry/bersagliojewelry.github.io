/**
 * Bersaglio Jewelry — Smart Recommendations
 * Scores pieces by similarity (collection, material, specs) + browsing history.
 */

const HISTORY_KEY = 'bj_viewed';
const MAX_HISTORY = 20;

/**
 * Track a piece view in localStorage history.
 * @param {string} slug
 */
export function trackView(slug) {
    const history = getHistory();
    // Move to front if already exists, otherwise prepend
    const filtered = history.filter(s => s !== slug);
    filtered.unshift(slug);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered.slice(0, MAX_HISTORY)));
}

/**
 * Get browsing history slugs.
 * @returns {string[]}
 */
export function getHistory() {
    try {
        return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]');
    } catch { return []; }
}

/**
 * Get smart recommendations for a piece.
 * Scoring:
 *   +4  same collection
 *   +3  same primary material (metal)
 *   +2  same primary stone
 *   +1  same certificate type
 *   +1  previously viewed by user (engagement signal)
 *
 * @param {Object} currentPiece - The piece being viewed
 * @param {Object[]} catalog - All pieces
 * @param {number} [limit=4] - Max recommendations
 * @returns {Object[]} Scored and sorted recommendations
 */
export function getRecommendations(currentPiece, catalog, limit = 4) {
    const history = getHistory();

    return catalog
        .filter(p => p.slug !== currentPiece.slug)
        .map(p => {
            let score = 0;

            // Same collection = strong signal
            if (p.collection === currentPiece.collection) score += 4;

            // Same metal type
            if (p.specs?.metal && currentPiece.specs?.metal) {
                const normalize = s => s.toLowerCase().replace(/\d+k?/g, '').trim();
                if (normalize(p.specs.metal) === normalize(currentPiece.specs.metal)) score += 3;
            }

            // Same stone type
            if (p.specs?.stone && currentPiece.specs?.stone) {
                const stoneA = p.specs.stone.toLowerCase();
                const stoneB = currentPiece.specs.stone.toLowerCase();
                if (stoneA.includes('esmeralda') && stoneB.includes('esmeralda')) score += 2;
                else if (stoneA.includes('diamante') && stoneB.includes('diamante')) score += 2;
            }

            // Same certificate
            if (p.specs?.certificate && p.specs.certificate === currentPiece.specs?.certificate) {
                score += 1;
            }

            // Previously viewed = engagement signal
            if (history.includes(p.slug)) score += 1;

            return { ...p, _score: score };
        })
        .sort((a, b) => b._score - a._score)
        .slice(0, limit);
}
