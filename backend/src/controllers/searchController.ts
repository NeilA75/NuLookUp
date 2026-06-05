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
    case ItemCategory.CLOTHING:
    case ItemCategory.GENERAL:
    default:
      return [];
  }
}

export async function searchController(req: Request, res: Response) {
  try {
    const rawQuery = String(req.query.q || '');
    const query = normalizeQuery(rawQuery);
    const cacheKey = query.toLowerCase();

    const category = classifyQuery(query);
    const rawPrices = await fetchPriceTrend(category, query);
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
      backendVersion: '20240605-commodity-fix',
    } as SearchResult & { backendVersion: string };

    set(cacheKey, result);
    return res.json(result);
  } catch (error) {
    console.error('searchController error', error);
    return res.status(500).json({ error: 'Unable to complete search' });
  }
}
