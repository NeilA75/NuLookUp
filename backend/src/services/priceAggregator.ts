import { getTrailing12Months } from '../utils/dateHelpers';
import { AggregatedPriceData, RawPricePoint } from '../types/search';

function formatCurrency(price: number): string {
  return `$${price.toFixed(2)}`;
}

function formatChange(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
}

function formatTrendLabel(pricePoint: RawPricePoint, includeYear = false): string {
  if (pricePoint.date) {
    const date = new Date(pricePoint.date);
    if (!Number.isNaN(date.getTime())) {
      if (includeYear) {
        return date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
      }
      return date.toLocaleString('en-US', { month: 'short' });
    }
  }

  return pricePoint.month;
}

function buildTrend(rawPrices: RawPricePoint[]): { day: string; price: number; date?: string }[] {
  if (rawPrices.length === 0) {
    const months = getTrailing12Months();
    return months.map((month) => ({ day: month, price: 0 }));
  }

  const includeYear = rawPrices.length > 12;
  return rawPrices.map((point) => ({
    day: formatTrendLabel(point, includeYear),
    price: point.price,
    date: point.date,
  }));
}

export function aggregatePrices(rawPrices: RawPricePoint[]): AggregatedPriceData {
  const prices = rawPrices.map((point) => point.price).filter((price) => Number.isFinite(price));
  const trend = buildTrend(rawPrices);
  const firstPrice = prices[0] ?? trend[0]?.price ?? 0;
  const lastPrice = prices[prices.length - 1] ?? trend[trend.length - 1]?.price ?? 0;
  const avgPrice = prices.length ? prices.reduce((sum, value) => sum + value, 0) / prices.length : 0;
  const lowPrice = prices.length ? Math.min(...prices) : trend[0].price;
  const highPrice = prices.length ? Math.max(...prices) : trend[0].price;
  const currentPrice = prices.length ? prices[prices.length - 1] : trend[trend.length - 1].price;
  const change = firstPrice > 0 ? ((lastPrice - firstPrice) / firstPrice) * 100 : 0;

  return {
    avgPrice: formatCurrency(avgPrice),
    currentPrice: formatCurrency(currentPrice),
    change: formatChange(change),
    changePositive: change >= 0,
    low: formatCurrency(lowPrice),
    high: formatCurrency(highPrice),
    trend,
  };
}
