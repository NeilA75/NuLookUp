"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.classifyQuery = classifyQuery;
const sources_1 = require("../types/sources");
const stockKeywords = /\b(stock|share|equity|ticker|ipo|corp|inc|ltd|company)\b/i;
const cryptoKeywords = /\b(bitcoin|ethereum|crypto|coin|token|btc|eth|sol|bnb|ada|doge)\b/i;
const forexKeywords = /\b(exchange rate|forex|currency pair|currency)\b|\b[A-Z]{3}\/[A-Z]{3}\b/;
const commodityKeywords = /\b(gold|silver|oil|wheat|crude|copper|corn|soybean|futures)\b/i;
const carKeywords = /\b(sedan|truck|suv|coupe|convertible|hatchback|toyota|honda|ford|chevrolet|bmw|mercedes|audi|tesla|nissan|subaru|volkswagen|jeep)\b/i;
const clothingKeywords = /\b(nike|adidas|supreme|sneaker|shoe|jacket|jersey|hoodie|tshirt|sweater|pants|jeans)\b/i;
const collectableKeywords = /\b(trading card|pokemon|psa|graded|comic|watch|rolex|collectible|collectable|funko|nft)\b/i;
function classifyQuery(query) {
    const normalized = query.trim();
    const uppercase = normalized.toUpperCase();
    if (cryptoKeywords.test(normalized)) {
        return sources_1.ItemCategory.CRYPTO;
    }
    if (forexKeywords.test(uppercase)) {
        return sources_1.ItemCategory.FOREX;
    }
    if (commodityKeywords.test(normalized)) {
        return sources_1.ItemCategory.COMMODITY;
    }
    if (carKeywords.test(normalized)) {
        return sources_1.ItemCategory.CAR;
    }
    if (clothingKeywords.test(normalized)) {
        return sources_1.ItemCategory.CLOTHING;
    }
    if (collectableKeywords.test(normalized)) {
        return sources_1.ItemCategory.COLLECTABLE;
    }
    if (stockKeywords.test(normalized)) {
        return sources_1.ItemCategory.STOCK;
    }
    if (/^[A-Z]{1,5}$/.test(uppercase) || /\b[A-Z]{1,5}\b/.test(uppercase)) {
        return sources_1.ItemCategory.STOCK;
    }
    return sources_1.ItemCategory.GENERAL;
}
