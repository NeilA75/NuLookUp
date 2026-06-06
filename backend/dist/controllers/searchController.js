"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchController = searchController;
const classifier_1 = require("../services/classifier");
const priceAggregator_1 = require("../services/priceAggregator");
const cache_1 = require("../utils/cache");
const newsAggregator_1 = require("../services/news/newsAggregator");
const summarizer_1 = require("../services/llm/summarizer");
const stockPrice_1 = require("../services/priceSources/stockPrice");
const cryptoPrice_1 = require("../services/priceSources/cryptoPrice");
const forexPrice_1 = require("../services/priceSources/forexPrice");
const commodityPrice_1 = require("../services/priceSources/commodityPrice");
const carPrice_1 = require("../services/priceSources/carPrice");
const collectablePrice_1 = require("../services/priceSources/collectablePrice");
const genericProduct_1 = require("../services/priceSources/genericProduct");
const amazonProduct_1 = require("../services/priceSources/amazonProduct");
const realEstate_1 = require("../services/priceSources/realEstate");
const laborService_1 = require("../services/priceSources/laborService");
const sources_1 = require("../types/sources");
function normalizeQuery(value) {
    return value
        .trim()
        .replace(/\s+/g, ' ')
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}
async function fetchPriceTrend(category, query) {
    switch (category) {
        case sources_1.ItemCategory.STOCK:
            return (0, stockPrice_1.getStockPrices)(query);
        case sources_1.ItemCategory.CRYPTO:
            return (0, cryptoPrice_1.getCryptoPrices)(query);
        case sources_1.ItemCategory.FOREX:
            return (0, forexPrice_1.getForexPrices)(query);
        case sources_1.ItemCategory.COMMODITY:
            return (0, commodityPrice_1.getCommodityPrices)(query);
        case sources_1.ItemCategory.CAR:
            return (0, carPrice_1.getCarPrices)(query);
        case sources_1.ItemCategory.COLLECTABLE:
            return (0, collectablePrice_1.getCollectablePrices)(query);
        case sources_1.ItemCategory.AMAZON_PRODUCT:
            return (0, amazonProduct_1.getAmazonProductPrices)(query);
        case sources_1.ItemCategory.REAL_ESTATE:
            return (0, realEstate_1.getRealEstatePrices)(query);
        case sources_1.ItemCategory.LABOR_SERVICE:
            return (0, laborService_1.getLaborServicePrices)(query);
        case sources_1.ItemCategory.ELECTRONICS:
        case sources_1.ItemCategory.BOOKS:
        case sources_1.ItemCategory.FURNITURE:
        case sources_1.ItemCategory.JEWELRY:
        case sources_1.ItemCategory.CLOTHING:
        case sources_1.ItemCategory.SPORTS_GEAR:
        case sources_1.ItemCategory.APPLIANCES:
        case sources_1.ItemCategory.VIDEOGAMES:
        case sources_1.ItemCategory.ARTWORK:
            // All consumer products route through generic scraper with fallback
            return (0, genericProduct_1.getGenericProductPrices)(query);
        case sources_1.ItemCategory.GENERAL:
        default:
            // Try generic product scraper as fallback for unknown items
            return (0, genericProduct_1.getGenericProductPrices)(query);
    }
}
async function searchController(req, res) {
    try {
        const rawQuery = String(req.query.q || '');
        const query = normalizeQuery(rawQuery);
        const cacheKey = query.toLowerCase();
        // Check cache first
        const cached = (0, cache_1.get)(cacheKey);
        if (cached) {
            return res.json(cached);
        }
        const category = (0, classifier_1.classifyQuery)(query);
        let rawPrices = await fetchPriceTrend(category, query);
        // Smart fallback: if no data from specific source, try generic product scraper
        if (rawPrices.length === 0 && category !== sources_1.ItemCategory.GENERAL) {
            console.log(`No data from ${category}, trying generic product scraper for: ${query}`);
            rawPrices = await (0, genericProduct_1.getGenericProductPrices)(query);
        }
        const priceData = (0, priceAggregator_1.aggregatePrices)(rawPrices);
        const articles = await (0, newsAggregator_1.getNewsArticles)(query);
        const summary = await (0, summarizer_1.summarizeQuery)(query, priceData, articles.map((article) => article.title));
        const result = {
            query,
            category,
            avgPrice: priceData.avgPrice,
            currentPrice: priceData.currentPrice,
            change: priceData.change,
            changePositive: priceData.changePositive,
            low: priceData.low,
            high: priceData.high,
            trend: priceData.trend,
            summary,
            articles,
            dataQuality: rawPrices.length > 0 ? 'high' : 'low',
            backendVersion: '20260605-universal-search',
        };
        (0, cache_1.set)(cacheKey, result);
        return res.json(result);
    }
    catch (error) {
        console.error('searchController error', error);
        return res.status(500).json({ error: 'Unable to complete search' });
    }
}
