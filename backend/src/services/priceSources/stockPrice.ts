import axios from 'axios';
import { getPage, closePage } from '../scraper/scraperClient';
import { RawPricePoint } from '../../types/search';

function monthLabelFromDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString('en-US', { month: 'short' });
}

function parseMonthlySeries(data: any): RawPricePoint[] {
  const series = data?.['Monthly Time Series'] ?? data?.['Monthly Adjusted Time Series'];
  if (!series || typeof series !== 'object') {
    return [];
  }

  return Object.entries(series)
    .map(([month, values]) => ({
      month: monthLabelFromDate(month as string),
      price: Number((values as any)['4. close'] ?? 0),
      date: new Date(month as string).toISOString(),
    }))
    .reverse();
}

async function fetchYahooChart(symbol: string): Promise<RawPricePoint[]> {
  try {
    const response = await axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}`, {
      params: {
        interval: '1d',
        range: '2y',
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    const result = response.data?.chart?.result?.[0];
    const timestamps: number[] = result?.timestamp ?? [];
    const closes: number[] = result?.indicators?.quote?.[0]?.close ?? [];

    if (!timestamps.length || !closes.length) {
      return [];
    }

    const monthly = new Map<string, RawPricePoint>();
    for (let i = 0; i < timestamps.length; i += 1) {
      const ts = timestamps[i];
      const close = closes[i];
      if (typeof ts !== 'number' || typeof close !== 'number' || Number.isNaN(close)) {
        continue;
      }

      const date = new Date(ts * 1000);
      const yearMonth = date.toISOString().slice(0, 7);
      monthly.set(yearMonth, {
        month: monthLabelFromDate(date.toISOString()),
        price: close,
        date: date.toISOString(),
      });
    }

    return Array.from(monthly.values()).sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''));
  } catch (error) {
    console.error('Yahoo chart fetch failed', error);
    return [];
  }
}

async function scrapeYahooFinance(symbol: string): Promise<RawPricePoint[]> {
  const page = await getPage();
  const url = `https://finance.yahoo.com/quote/${encodeURIComponent(symbol)}/history?p=${encodeURIComponent(symbol)}`;
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(4500);

    const jsonData = await page.evaluate(() => {
      const script = Array.from(document.querySelectorAll('script')).find((node) => node.textContent?.includes('HistoricalPriceStore'));
      if (!script) {
        return null;
      }
      const text = script.textContent || '';
      const startIndex = text.indexOf('"HistoricalPriceStore":');
      if (startIndex === -1) {
        return null;
      }
      const braceStart = text.indexOf('{', startIndex);
      if (braceStart === -1) {
        return null;
      }

      let depth = 0;
      for (let i = braceStart; i < text.length; i += 1) {
        if (text[i] === '{') {
          depth += 1;
        } else if (text[i] === '}') {
          depth -= 1;
          if (depth === 0) {
            return text.slice(braceStart, i + 1);
          }
        }
      }
      return null;
    });

    if (!jsonData) {
      return [];
    }

    const parsed = JSON.parse(jsonData);
    const prices = parsed.prices ?? [];
    const labels = new Map<string, { total: number; count: number; label: string; date: string }>();

    for (const row of prices) {
      if (!row || typeof row.date !== 'number' || typeof row.close !== 'number') {
        continue;
      }
      const timestamp = row.date * 1000;
      const date = new Date(timestamp);
      const yearMonth = date.toISOString().slice(0, 7); // YYYY-MM
      const entry = labels.get(yearMonth) ?? {
        total: 0,
        count: 0,
        label: date.toLocaleString('en-US', { month: 'short' }),
        date: date.toISOString(),
      };
      entry.total += row.close;
      entry.count += 1;
      labels.set(yearMonth, entry);
    }

    return Array.from(labels.values())
      .sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''))
      .map((entry) => ({ month: entry.label, price: entry.total / entry.count, date: entry.date }));
  } catch (error) {
    console.error('Yahoo Finance scrape failed', error);
    return [];
  } finally {
    await closePage(page);
  }
}

export async function getStockPrices(query: string): Promise<RawPricePoint[]> {
  try {
    const symbol = query.trim().split(' ')[0].toUpperCase();
    const apiKey = process.env.ALPHA_VANTAGE_KEY;
    if (apiKey) {
      try {
        const response = await axios.get('https://www.alphavantage.co/query', {
          params: {
            function: 'TIME_SERIES_MONTHLY',
            symbol,
            apikey: apiKey,
          },
        });
        const data = parseMonthlySeries(response.data);
        if (data.length >= 3) {
          return data;
        }
      } catch (apiError) {
        console.error('Alpha Vantage stock price fetch failed', apiError);
      }
    }

    const yahooChartData = await fetchYahooChart(symbol);
    if (yahooChartData.length >= 1) {
      return yahooChartData;
    }

    return await scrapeYahooFinance(symbol);
  } catch (error) {
    console.error('getStockPrices error', error);
    return [];
  }
}
