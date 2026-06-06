import { Request, Response } from 'express';
import { classifyQuery } from '../services/classifier';
import { aggregatePrices } from '../services/priceAggregator';
import { get, set } from '../utils/cache';
import { getNewsArticles } from '../services/news/newsAggregator';
import { summarizeQuery } from '../services/llm/summarizer';
import { getStockPrices } from '../services/priceSources/stockPrice';
import { getCryptoPrices } from '../services/priceSources/cryptoPrice';
import { getForexPrices } from '../services/priceSources/forexPrice';
import { getCommodityPrices } from '../services/priceSources/commodityPrice';
import { getCarPrices } from '../services/priceSources/carPrice';
import { getCollectablePrices } from '../services/priceSources/collectablePrice';
import { getGenericProductPrices } from '../services/priceSources/genericProduct';
import { getAmazonProductPrices } from '../services/priceSources/amazonProduct';
import { getRealEstatePrices } from '../services/priceSources/realEstate';
import { getLaborServicePrices } from '../services/priceSources/laborService';
import { ItemCategory } from '../types/sources';
import { SearchResult } from '../types/search';

function normalizeQuery(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

async function fetchPriceTrend(category: ItemCategory, query: string) {
  switch (category) {
    case ItemCategory.STOCK:
      return getStockPrices(query);
    case ItemCategory.CRYPTO:
      return getCryptoPrices(query);
    case ItemCategory.FOREX:
      return getForexPrices(query);
    case ItemCategory.COMMODITY:
      return getCommodityPrices(query);
    case ItemCategory.CAR:
      return getCarPrices(query);
    case ItemCategory.COLLECTABLE:
      return getCollectablePrices(query);
    case ItemCategory.AMAZON_PRODUCT:
      return getAmazonProductPrices(query);
    case ItemCategory.REAL_ESTATE:
      return getRealEstatePrices(query);
    case ItemCategory.LABOR_SERVICE:
      return getLaborServicePrices(query);
    case ItemCategory.ELECTRONICS:
    case ItemCategory.BOOKS:
    case ItemCategory.FURNITURE:
    case ItemCategory.JEWELRY:
    case ItemCategory.CLOTHING:
    case ItemCategory.SPORTS_GEAR:
    case ItemCategory.APPLIANCES:
    case ItemCategory.VIDEOGAMES:
    case ItemCategory.ARTWORK:
      // All consumer products route through generic scraper with fallback
      return getGenericProductPrices(query);
    case ItemCategory.GENERAL:
    default:
      // Try generic product scraper as fallback for unknown items
      return getGenericProductPrices(query);
  }
}

export async function searchController(req: Request, res: Response) {
  try {
    const rawQuery = String(req.query.q || '');
    const query = normalizeQuery(rawQuery);
    const cacheKey = query.toLowerCase();

    // Check cache first
    const cached = get(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const category = classifyQuery(query);
    let rawPrices = await fetchPriceTrend(category, query);

    // Smart fallback: if no data from specific source, try generic product scraper
    if (rawPrices.length === 0 && category !== ItemCategory.GENERAL) {
      console.log(`No data from ${category}, trying generic product scraper for: ${query}`);
      rawPrices = await getGenericProductPrices(query);
    }

    const priceData = aggregatePrices(rawPrices);
    const articles = await getNewsArticles(query);
    const summary = await summarizeQuery(query, priceData, articles.map((article) => article.title));

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
    } as SearchResult & { dataQuality: string; backendVersion: string };

    set(cacheKey, result);
    return res.json(result);
  } catch (error) {
    console.error('searchController error', error);
    return res.status(500).json({ error: 'Unable to complete search' });
  }
}
