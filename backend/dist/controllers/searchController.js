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
        case sources_1.ItemCategory.CLOTHING:
        case sources_1.ItemCategory.GENERAL:
        default:
            return [];
    }
}
async function searchController(req, res) {
    try {
        const rawQuery = String(req.query.q || '');
        const query = normalizeQuery(rawQuery);
        const cacheKey = query.toLowerCase();
        const cached = (0, cache_1.get)(cacheKey);
        if (cached) {
            return res.json(cached);
        }
        const category = (0, classifier_1.classifyQuery)(query);
        const rawPrices = await fetchPriceTrend(category, query);
        const priceData = (0, priceAggregator_1.aggregatePrices)(rawPrices);
        const articles = await (0, newsAggregator_1.getNewsArticles)(query);
        const summary = await (0, summarizer_1.summarizeQuery)(query, priceData, articles.map((article) => article.title));
        const result = {
            query,
            category,
            avgPrice: priceData.avgPrice,
            change: priceData.change,
            changePositive: priceData.changePositive,
            low: priceData.low,
            high: priceData.high,
            trend: priceData.trend,
            summary,
            articles,
        };
        (0, cache_1.set)(cacheKey, result);
        return res.json(result);
    }
    catch (error) {
        console.error('searchController error', error);
        return res.status(500).json({ error: 'Unable to complete search' });
    }
}
