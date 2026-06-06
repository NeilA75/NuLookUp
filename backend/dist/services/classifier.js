"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.classifyQuery = classifyQuery;
exports.getSemanticCategory = getSemanticCategory;
const sources_1 = require("../types/sources");
// Keyword patterns for each category
const keywordPatterns = {
    [sources_1.ItemCategory.STOCK]: /\b(stock|share|equity|ticker|ipo|corp|inc|ltd|company|bull|bear|market|sp500|dow|nasdaq)\b/i,
    [sources_1.ItemCategory.CRYPTO]: /\b(bitcoin|ethereum|crypto|coin|token|btc|eth|sol|bnb|ada|doge|blockchain|web3|defi)\b/i,
    [sources_1.ItemCategory.FOREX]: /\b(exchange rate|forex|currency pair|currency|usd|eur|gbp|jpy)\b|\b[A-Z]{3}\/[A-Z]{3}\b/i,
    [sources_1.ItemCategory.COMMODITY]: /\b(gold|silver|oil|wheat|crude|copper|corn|soybean|futures|platinum|palladium|natural gas)\b/i,
    [sources_1.ItemCategory.CAR]: /\b(sedan|truck|suv|coupe|convertible|hatchback|toyota|honda|ford|chevrolet|bmw|mercedes|audi|tesla|nissan|subaru|volkswagen|jeep|vehicle|auto|car)\b/i,
    [sources_1.ItemCategory.CLOTHING]: /\b(nike|adidas|supreme|sneaker|shoe|jacket|jersey|hoodie|tshirt|sweater|pants|jeans|apparel|fashion|boots|shirt|dress|coat|underwear)\b/i,
    [sources_1.ItemCategory.COLLECTABLE]: /\b(trading card|pokemon|psa|graded|comic|watch|rolex|collectible|collectable|funko|nft|vintage|rare|limited edition|autograph)\b/i,
    [sources_1.ItemCategory.REAL_ESTATE]: /\b(house|home|apartment|property|real estate|zillow|redfin|condo|townhouse|land|acre|sqft|bedroom|bathroom|rental)\b/i,
    [sources_1.ItemCategory.ELECTRONICS]: /\b(phone|laptop|computer|iphone|samsung|dell|hp|monitor|keyboard|mouse|headphones|tablet|ipad|console|playstation|xbox)\b/i,
    [sources_1.ItemCategory.BOOKS]: /\b(book|novel|textbook|ebook|isbn|author|fiction|non-fiction|hardcover|paperback)\b/i,
    [sources_1.ItemCategory.LABOR_SERVICE]: /\b(hourly rate|salary|wage|labor|plumber|electrician|engineer|developer|consultant|contractor|freelance|service)\b/i,
    [sources_1.ItemCategory.FURNITURE]: /\b(chair|table|desk|bed|couch|sofa|cabinet|shelf|furniture|nightstand|dresser|ottoman)\b/i,
    [sources_1.ItemCategory.JEWELRY]: /\b(ring|necklace|bracelet|earring|watch|gold|diamond|silver|jewelry|brooch|pendant)\b/i,
    [sources_1.ItemCategory.SPORTS_GEAR]: /\b(baseball|football|basketball|soccer|tennis|golf|skis|snowboard|skateboard|sports equipment|cleats|helmet|jersey)\b/i,
    [sources_1.ItemCategory.APPLIANCES]: /\b(refrigerator|washer|dryer|dishwasher|microwave|oven|toaster|blender|vacuum|air conditioner|heater|appliance)\b/i,
    [sources_1.ItemCategory.VIDEOGAMES]: /\b(video game|game|fortnite|minecraft|call of duty|zelda|mario|playstation|xbox|nintendo|steam|epic games)\b/i,
    [sources_1.ItemCategory.ARTWORK]: /\b(painting|sculpture|art|canvas|print|poster|gallery|artist|museum|contemporary art|abstract|portrait)\b/i,
};
// Semantic tokens for better matching
const semanticPatterns = {
    financial: /\b(price|cost|value|worth|rate|investment|return|profit|loss|volatility)\b/i,
    product: /\b(product|item|thing|object|stuff|buy|sell|purchase|price comparison)\b/i,
    property: /\b(property|location|building|structure|estate|residence)\b/i,
    service: /\b(service|labor|work|job|hourly|rate|pay|wage|skill)\b/i,
};
/**
 * Enhanced classifier with semantic matching and fallback
 * Returns the most likely category, with preference for more specific matches
 */
function classifyQuery(query) {
    const normalized = query.trim();
    const uppercase = normalized.toUpperCase();
    // Direct keyword matching with scoring
    let bestMatch = null;
    for (const [category, pattern] of Object.entries(keywordPatterns)) {
        if (pattern.test(normalized)) {
            const categoryEnum = category;
            // Higher specificity = higher score
            let score = 1;
            // Boost scores for high-specificity keywords
            if (/\b(bitcoin|ethereum|btc|eth|ethereum)\b/i.test(normalized))
                score = 3;
            if (/\b(gold|silver|oil)\b/i.test(normalized))
                score = 2.8;
            if (/\b(house|home|apartment|property)\b/i.test(normalized))
                score = 2.8;
            if (/\b(phone|laptop|iphone|samsung)\b/i.test(normalized))
                score = 2.5;
            if (!bestMatch || score > bestMatch.score) {
                bestMatch = { category: categoryEnum, score };
            }
        }
    }
    if (bestMatch) {
        return bestMatch.category;
    }
    // Semantic-based fallback for ambiguous queries
    if (semanticPatterns.service.test(normalized) && /\b(rate|hourly|pay|wage|salary|job)\b/i.test(normalized)) {
        return sources_1.ItemCategory.LABOR_SERVICE;
    }
    if (semanticPatterns.property.test(normalized) || semanticPatterns.product.test(normalized)) {
        // Check for Amazon or online shopping indicators
        if (/\b(amazon|ebay|etsy|walmart|target|shopping|product|online)\b/i.test(normalized)) {
            return sources_1.ItemCategory.AMAZON_PRODUCT;
        }
        // Default to generic product for unknown items
        return sources_1.ItemCategory.AMAZON_PRODUCT;
    }
    // Stock ticker detection (all caps, 1-5 chars)
    if (/^[A-Z]{1,5}$/.test(uppercase) || /\b[A-Z]{1,5}\b/.test(uppercase)) {
        return sources_1.ItemCategory.STOCK;
    }
    // Default: treat as generic product that needs scraping
    return sources_1.ItemCategory.AMAZON_PRODUCT;
}
/**
 * Get suggested category for unknown/ambiguous queries
 * Useful for UI hints
 */
function getSemanticCategory(query) {
    return classifyQuery(query);
}
