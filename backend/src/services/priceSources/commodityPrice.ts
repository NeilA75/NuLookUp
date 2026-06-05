import axios from 'axios';
import { appendFileSync } from 'fs';
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

function debugLog(message: string) {
  try {
    appendFileSync('commodity-debug.log', `${new Date().toISOString()} ${message}\n`);
  } catch (error) {
    console.error('Failed to write debug log', error);
  }
}

function parseYahooChart(data: any): RawPricePoint[] {
  const result: RawPricePoint[] = [];
  const chart = data?.chart?.result?.[0];
  const timestamps: number[] = chart?.timestamp ?? [];
  const closePrices: number[] = chart?.indicators?.quote?.[0]?.close ?? [];

  for (let i = 0; i < timestamps.length; i += 1) {
    const timestamp = timestamps[i];
    const price = Number(closePrices[i]);
    if (!timestamp || Number.isNaN(price) || price <= 0) continue;
    result.push({ month: monthLabel(new Date(timestamp * 1000).toISOString()), price });
  }

  return result;
}

async function fetchYahooCommodityChart(symbol: string): Promise<RawPricePoint[]> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1y&interval=1mo`;

  try {
    const response = await axios.get(url, { timeout: 20000 });
    return parseYahooChart(response.data);
  } catch (error) {
    console.error('Yahoo commodity chart fetch failed', error);
    return [];
  }
}

function parseYahooCsv(csv: string): RawPricePoint[] {
  const lines = csv.trim().split('\n');
  const rows = lines.slice(1);
  const monthly: Array<{ month: string; price: number }> = [];

  for (const line of rows) {
    const parts = line.split(',');
    if (parts.length < 6) continue;

    const [date, , , , close] = parts;
    const price = Number(close);
    if (Number.isNaN(price) || price <= 0) continue;

    monthly.push({ month: monthLabel(date), price });
  }

  return monthly.slice(-12);
}

async function fetchYahooCommodityCsv(symbol: string): Promise<RawPricePoint[]> {
  const endDate = Math.floor(Date.now() / 1000);
  const startDate = Math.floor(new Date(new Date().setMonth(new Date().getMonth() - 12)).getTime() / 1000);
  const url = `https://query1.finance.yahoo.com/v7/finance/download/${encodeURIComponent(symbol)}?period1=${startDate}&period2=${endDate}&interval=1mo&events=history&includeAdjustedClose=true`;

  try {
    const response = await axios.get(url, { timeout: 20000, responseType: 'text' });
    if (typeof response.data !== 'string') {
      return [];
    }
    return parseYahooCsv(response.data);
  } catch (error) {
    console.error('Yahoo commodity CSV fetch failed', error);
    return [];
  }
}

export async function getCommodityPrices(query: string): Promise<RawPricePoint[]> {
  try {
    const symbol = resolveSymbol(query);
    const apiKey = process.env.ALPHA_VANTAGE_KEY;

    if (apiKey) {
      try {
        const response = await axios.get('https://www.alphavantage.co/query', {
          params: {
            function: 'TIME_SERIES_MONTHLY',
            symbol,
            apikey: apiKey,
          },
          timeout: 20000,
        });

        const data = response.data?.['Monthly Time Series'] ?? response.data?.['Monthly Adjusted Time Series'];
        if (data && typeof data === 'object') {
          const result = Object.entries(data)
            .slice(0, 12)
            .map(([date, values]) => ({
              month: monthLabel(date as string),
              price: Number((values as any)['4. close'] ?? 0),
            }))
            .reverse();

          if (result.length > 0 && result.some((point) => point.price > 0)) {
            return result;
          }
        }
      } catch (apiError) {
        console.error('Alpha Vantage commodity fetch failed', apiError);
      }
    }

    const chartResult = await fetchYahooCommodityChart(symbol);
    if (chartResult.length > 0) {
      debugLog(`symbol=${symbol} chartResultCount=${chartResult.length} result=${JSON.stringify(chartResult.slice(0, 5))}`);
      return chartResult;
    }

    const csvResult = await fetchYahooCommodityCsv(symbol);
    debugLog(`symbol=${symbol} csvResultCount=${csvResult.length} result=${JSON.stringify(csvResult.slice(0, 5))}`);
    return csvResult;
  } catch (error) {
    console.error('getCommodityPrices error', error);
    debugLog(`getCommodityPrices error=${String(error)}`);
    return [];
  }
}
