import { getPage, closePage } from './scraperClient';
import { RawPricePoint } from '../../types/search';

function parsePrice(value: string | null): number {
  if (!value) {
    return 0;
  }
  const cleaned = value.replace(/[^0-9.]/g, '');
  return Number(cleaned) || 0;
}

function monthFromString(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString('en-US', { month: 'short' });
}

export async function getEbayPrices(query: string): Promise<RawPricePoint[]> {
  const page = await getPage();
  try {
    const searchUrl = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(query)}&LH_Complete=1&LH_Sold=1`;
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2500);

    const items = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.s-item'));
      return cards.map((card) => {
        const price = (card.querySelector('.s-item__price') as HTMLElement | null)?.innerText || '';
        const dateText = (card.querySelector('.s-item__title span') as HTMLElement | null)?.innerText || '';
        const timeElement = card.querySelector('.s-item__title span+span');
        return {
          price,
          dateText: timeElement ? (timeElement as HTMLElement).innerText : dateText,
        };
      });
    });

    const grouped: Record<string, { total: number; count: number }> = {};
    for (const item of items) {
      const price = parsePrice(item.price);
      if (!price) {
        continue;
      }
      const month = monthFromString(item.dateText) || new Date().toLocaleString('en-US', { month: 'short' });
      const bucket = grouped[month] ?? { total: 0, count: 0 };
      bucket.total += price;
      bucket.count += 1;
      grouped[month] = bucket;
    }

    return Object.entries(grouped)
      .map(([month, bucket]) => ({ month, price: bucket.total / bucket.count }))
      .slice(0, 12);
  } catch (error) {
    console.error('getEbayPrices error', error);
    return [];
  } finally {
    await closePage(page);
  }
}
