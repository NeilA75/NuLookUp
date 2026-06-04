import axios from 'axios';
import { RawPricePoint } from '../../types/search';

const commodityLookup: Record<string, { symbol: string; name: string }> = {
  wti: { symbol: 'CL=F', name: 'WTI' },
  brent: { symbol: 'BZ=F', name: 'BRENT' },
  gold: { symbol: 'GC=F', name: 'GOLD_PRICE' },
  silver: { symbol: 'SI=F', name: 'SILVER' },
  wheat: { symbol: 'ZW=F', name: 'WHEAT' },
  copper: { symbol: 'HG=F', name: 'COPPER' },
};

function resolveSymbol(query: string) {
  const normalized = query.trim().toLowerCase();

  if (normalized.includes('brent')) {
    return commodityLookup.brent.symbol;
  }
  if (normalized.includes('wti')) {
    return commodityLookup.wti.symbol;
  }
  if (normalized.includes('gold')) {
    return commodityLookup.gold.symbol;
  }
  if (normalized.includes('silver')) {
    return commodityLookup.silver.symbol;
  }
  if (normalized.includes('wheat')) {
    return commodityLookup.wheat.symbol;
  }
  if (normalized.includes('copper')) {
    return commodityLookup.copper.symbol;
  }

  return Object.values(commodityLookup)[0].symbol;
}

function monthLabel(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return dateString;
  }
  return date.toLocaleString('en-US', { month: 'short' });
}

export async function getCommodityPrices(query: string): Promise<RawPricePoint[]> {
  try {
    const apiKey = process.env.ALPHA_VANTAGE_KEY;
    const symbol = resolveSymbol(query);
    if (!apiKey) {
      return [];
    }

    const response = await axios.get('https://www.alphavantage.co/query', {
      params: {
        function: 'TIME_SERIES_MONTHLY',
        symbol,
        apikey: apiKey,
      },
      timeout: 20000,
    });

    const data = response.data?.['Monthly Time Series'] ?? response.data?.['Monthly Adjusted Time Series'];
    if (!data || typeof data !== 'object') {
      return [];
    }

    return Object.entries(data)
      .slice(0, 12)
      .map(([date, values]) => ({
        month: monthLabel(date as string),
        price: Number((values as any)['4. close'] ?? 0),
      }))
      .reverse();
  } catch (error) {
    console.error('getCommodityPrices error', error);
    return [];
  }
}
