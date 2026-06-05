import { getTrailing12Months } from '../utils/dateHelpers';
import { AggregatedPriceData, RawPricePoint } from '../types/search';

function formatCurrency(price: number): string {
  return `$${price.toFixed(2)}`;
}

function formatChange(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
}

function buildTrend(rawPrices: RawPricePoint[]): { day: string; price: number }[] {
  const months = getTrailing12Months();
  const trend: { day: string; price: number }[] = [];

  if (rawPrices.length === 0) {
    return months.map((month) => ({ day: month, price: 0 }));
  }

  const prices = rawPrices.slice(0, 12).map((point) => point.price);
  const lastPrice = prices[prices.length - 1] ?? 0;
  const filledPrices = [...prices];

  while (filledPrices.length < 12) {
    filledPrices.push(filledPrices[filledPrices.length - 1] ?? lastPrice);
  }

  for (let index = 0; index < 12; index += 1) {
    trend.push({ day: months[index], price: filledPrices[index] ?? lastPrice });
  }

  return trend;
}

export function aggregatePrices(rawPrices: RawPricePoint[]): AggregatedPriceData {
  const prices = rawPrices.map((point) => point.price).filter((price) => Number.isFinite(price));
  const trend = buildTrend(rawPrices);
  const firstPrice = prices[0] ?? trend[0].price;
  const lastPrice = prices[prices.length - 1] ?? trend[trend.length - 1].price;
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
